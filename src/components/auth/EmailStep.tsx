"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function EmailStep({
  email,
  onEmailChange,
  onSubmit,
  loading,
  error,
}: EmailStepProps) {
  const [touched, setTouched] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValid = email && isValidEmail(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isValid && !loading) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Create your merchant account
        </h2>
        <p className="text-slate-600 text-sm">
          Enter your email address to get started with MNEE Pay
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Enter your email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            onEmailChange(e.target.value);
          }}
          onBlur={() => setTouched(true)}
          disabled={loading}
          required
          className={
            touched && email && !isValid
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />
        {touched && email && !isValid && (
          <p className="text-sm text-red-600">
            Please enter a valid email address
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700"
        disabled={!isValid || loading}
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          By clicking sign up, you agree to our{" "}
          <Link
            href="/terms"
            className="text-orange-600 hover:text-orange-700"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-orange-600 hover:text-orange-700"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
