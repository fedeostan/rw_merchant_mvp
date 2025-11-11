"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OTPInput } from "./OTPInput";
import { ArrowLeft } from "lucide-react";

interface LoginVerificationStepProps {
  code: string;
  setCode: (code: string) => void;
  onSubmit: () => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  error: string | null;
}

export function LoginVerificationStep({
  code,
  setCode,
  onSubmit,
  onResend,
  onBack,
  error,
}: LoginVerificationStepProps) {
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isValid = code.length === 8;

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown === 0) {
      setResendCooldown(60);
      try {
        await onResend();
      } catch (err) {
        // Error handling is done in parent
        setResendCooldown(0);
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to email
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Enter verification code
        </h1>
        <p className="text-sm text-slate-600">
          We sent a 8-digit code to your email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">
            Verification code
          </label>
          <OTPInput
            length={8}
            value={code}
            onChange={setCode}
            disabled={loading}
          />
          <p className="text-xs text-slate-500">
            Enter the 8-digit code sent to your email.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={!isValid || loading}
        >
          {loading ? "Verifying..." : "Verify & Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Didn&apos;t receive the code?{" "}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || loading}
          className="font-medium text-orange-600 hover:text-orange-700 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
        </button>
      </p>
    </div>
  );
}
