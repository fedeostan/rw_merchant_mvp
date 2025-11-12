"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  OrganizationCombobox,
  OrganizationOption,
} from "./OrganizationCombobox";

interface ProfileStepProps {
  fullName: string;
  organization: OrganizationOption | null;
  onFullNameChange: (name: string) => void;
  onOrganizationChange: (org: OrganizationOption) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function ProfileStep({
  fullName,
  organization,
  onFullNameChange,
  onOrganizationChange,
  onSubmit,
  loading,
  error,
}: ProfileStepProps) {
  const isValid = fullName.trim() && organization?.name.trim();

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
          <OrganizationCombobox
            value={organization}
            onChange={onOrganizationChange}
            disabled={loading}
            placeholder="Search or create your organization..."
          />
          {organization?.isExisting && (
            <p className="text-xs text-slate-600">
              You will join {organization.name} as a member
            </p>
          )}
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
