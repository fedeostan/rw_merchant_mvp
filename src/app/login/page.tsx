"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { LoginEmailStep } from "@/components/auth/LoginEmailStep";
import { LoginVerificationStep } from "@/components/auth/LoginVerificationStep";
import { toast } from "sonner";
import logo from "@/assets/mnee-pay-logo.png";

type Step = "email" | "verification";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async () => {
    setError(null);

    try {
      // Try to send OTP without creating a new user
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        // Check if error is because user doesn't exist
        if (
          otpError.message.includes("User not found") ||
          otpError.message.includes("not found") ||
          otpError.message.includes("Signups not allowed")
        ) {
          setError("No account found with this email");
        } else {
          setError(otpError.message);
        }
        return;
      }

      // Success - move to verification step
      setStep("verification");
      toast.success("Verification code sent to your email");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleVerificationSubmit = async () => {
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      // Success - redirect to dashboard
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Verification error:", err);
    }
  };

  const handleResend = async () => {
    setError(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      toast.success("Verification code resent");
    } catch (err) {
      setError("Failed to resend code. Please try again.");
      console.error("Resend error:", err);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8">
        <Image
          src={logo}
          alt="MNEE PAY"
          width={120}
          height={32}
          className="object-contain"
        />
      </div>

      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        {step === "email" && (
          <LoginEmailStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
            error={error}
          />
        )}

        {step === "verification" && (
          <LoginVerificationStep
            code={code}
            setCode={setCode}
            onSubmit={handleVerificationSubmit}
            onResend={handleResend}
            onBack={handleBackToEmail}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
