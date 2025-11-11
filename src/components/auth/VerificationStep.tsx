"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OTPInput } from "./OTPInput";
import { ArrowLeft } from "lucide-react";

interface VerificationStepProps {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export function VerificationStep({
  email,
  code,
  onCodeChange,
  onSubmit,
  onResend,
  onBack,
  loading,
  error,
}: VerificationStepProps) {
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = () => {
    if (resendCooldown === 0) {
      setResendCooldown(60);
      onResend();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 8 && !loading) {
      onSubmit();
    }
  };

  const isValid = code.length === 8;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to email
        </button>

        <h2 className="text-2xl font-semibold mb-2">Enter verification code</h2>
        <p className="text-slate-600 text-sm">
          We sent a 8-digit code to your email.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Verification code</label>
        <OTPInput
          length={8}
          value={code}
          onChange={onCodeChange}
          onComplete={onCodeChange}
          disabled={loading}
        />
        <p className="text-xs text-slate-500 text-center">
          Enter the 8-digit code sent to your email.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700"
        disabled={!isValid || loading}
      >
        {loading ? "Verifying..." : "Verify"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className="text-orange-600 hover:text-orange-700 font-medium disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
          </button>
        </p>
      </div>
    </form>
  );
}
