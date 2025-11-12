"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ProgressBar } from "@/components/auth/ProgressBar";
import { EmailStep } from "@/components/auth/EmailStep";
import { VerificationStep } from "@/components/auth/VerificationStep";
import { ProfileStep } from "@/components/auth/ProfileStep";
import { OrganizationOption } from "@/components/auth/OrganizationCombobox";
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
  const [organization, setOrganization] = useState<OrganizationOption | null>(
    null
  );
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
        // Refresh the session to ensure JWT is properly set for subsequent requests
        const { error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.error("Session refresh error:", refreshError);
          setError("Failed to establish session. Please try again.");
          return;
        }

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
      // Get current user and verify session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No authenticated user found. Please try again.");
        setLoading(false);
        return;
      }

      // Log session info for debugging
      console.log("User authenticated:", user.id);

      if (!organization) {
        setError("Please select or create an organization.");
        setLoading(false);
        return;
      }

      // Update user profile with name and company
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: fullName,
          company: organization.name,
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // Handle organization: either create new or join existing
      if (organization.isExisting && organization.id) {
        // Join existing organization as member
        const { error: memberError } = await supabase
          .from("user_organizations")
          .insert({
            user_id: user.id,
            org_id: organization.id,
            role: "member",
          });

        if (memberError) {
          throw memberError;
        }

        // Set as current organization
        const { error: currentOrgError } = await supabase
          .from("profiles")
          .update({ current_org_id: organization.id })
          .eq("id", user.id);

        if (currentOrgError) {
          throw currentOrgError;
        }

        toast.success(`Joined ${organization.name} successfully!`);
      } else {
        // Create new organization
        // Note: owner_id is auto-set by database trigger to auth.uid()
        console.log("About to create organization. User ID:", user.id);
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: organization.name,
            // Don't set owner_id - let the trigger handle it
          })
          .select()
          .single();

        if (orgError) {
          throw orgError;
        }

        // Add user as owner
        const { error: ownerError } = await supabase
          .from("user_organizations")
          .insert({
            user_id: user.id,
            org_id: newOrg.id,
            role: "owner",
          });

        if (ownerError) {
          throw ownerError;
        }

        // Set as current organization
        const { error: currentOrgError } = await supabase
          .from("profiles")
          .update({ current_org_id: newOrg.id })
          .eq("id", user.id);

        if (currentOrgError) {
          throw currentOrgError;
        }

        toast.success(`Created ${organization.name} successfully!`);
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      // Log full error details for debugging
      console.error("Signup error - Full object:", JSON.stringify(err, null, 2));
      console.error("Signup error - Message:", err?.message);
      console.error("Signup error - Code:", err?.code);
      console.error("Signup error - Details:", err?.details);
      console.error("Signup error - Hint:", err?.hint);
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
                organization={organization}
                onFullNameChange={setFullName}
                onOrganizationChange={setOrganization}
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
