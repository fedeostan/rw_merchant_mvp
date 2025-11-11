"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ProgressBar } from "@/components/auth/ProgressBar";
import { EmailStep } from "@/components/auth/EmailStep";
import { VerificationStep } from "@/components/auth/VerificationStep";
import { ProfileStep } from "@/components/auth/ProfileStep";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Step = "email" | "verification" | "profile";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStepNumber = () => {
    switch (step) {
      case "email":
        return 1;
      case "verification":
        return 2;
      case "profile":
        return 3;
      default:
        return 1;
    }
  };

  const handleEmailSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, check if user exists by trying to sign in without creating
      const { error: checkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      // If user exists, show error
      if (!checkError) {
        setError(
          "There's an account existing with this email. Please sign in instead."
        );
        setLoading(false);
        return;
      }

      // If user doesn't exist, send OTP with account creation
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        setError(otpError.message);
      } else {
        setStep("verification");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
      } else {
        toast.success("Email verified successfully!");
        setStep("profile");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No authenticated user found. Please try again.");
        setLoading(false);
        return;
      }

      // Update user profile with name and company
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: fullName,
          company: businessName
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(
        err.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        setError(otpError.message);
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  return (
    <AuthLayout>
      <Card>
        <CardContent className="pt-6">
          <ProgressBar currentStep={getStepNumber()} totalSteps={3} />

          <div className="mt-6">
            {step === "email" && (
              <EmailStep
                email={email}
                onEmailChange={setEmail}
                onSubmit={handleEmailSubmit}
                loading={loading}
                error={error}
              />
            )}

            {step === "verification" && (
              <VerificationStep
                email={email}
                code={code}
                onCodeChange={setCode}
                onSubmit={handleVerificationSubmit}
                onResend={handleResendOTP}
                onBack={handleBackToEmail}
                loading={loading}
                error={error}
              />
            )}

            {step === "profile" && (
              <ProfileStep
                fullName={fullName}
                businessName={businessName}
                onFullNameChange={setFullName}
                onBusinessNameChange={setBusinessName}
                onSubmit={handleProfileSubmit}
                loading={loading}
                error={error}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
