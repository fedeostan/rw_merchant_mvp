"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileStepProps {
  fullName: string;
  businessName: string;
  onFullNameChange: (name: string) => void;
  onBusinessNameChange: (name: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function ProfileStep({
  fullName,
  businessName,
  onFullNameChange,
  onBusinessNameChange,
  onSubmit,
  loading,
  error,
}: ProfileStepProps) {
  const isValid = fullName.trim() && businessName.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !loading) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Complete your profile</h2>
        <p className="text-slate-600 text-sm">
          Enter your details to create your merchant account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter first and last name"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            type="text"
            placeholder="Enter your business name"
            value={businessName}
            onChange={(e) => onBusinessNameChange(e.target.value)}
            disabled={loading}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700"
        disabled={!isValid || loading}
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
