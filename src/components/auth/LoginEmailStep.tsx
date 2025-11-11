"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface LoginEmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: () => Promise<void>;
  error: string | null;
}

export function LoginEmailStep({
  email,
  setEmail,
  onSubmit,
  error,
}: LoginEmailStepProps) {
  const [loading, setLoading] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValid = email && isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show validation error if email is invalid
    if (!isValid) {
      setShowValidationError(true);
      return;
    }

    if (loading) return;

    setShowValidationError(false);
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="text-sm text-slate-600">Login with your email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Clear validation error when user starts typing again
              if (showValidationError) {
                setShowValidationError(false);
              }
            }}
            disabled={loading}
            className={
              showValidationError && !isValid
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }
            autoComplete="email"
            autoFocus
          />
          {showValidationError && !isValid && (
            <p className="text-sm text-red-600">
              Please enter a valid email address
            </p>
          )}
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
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
