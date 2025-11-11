"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check } from "lucide-react";
import type { Module } from "@/lib/api/generated/schemas/module";
import type { ModuleConfiguration } from "@/lib/schemas/module";

interface ConfigureTabProps {
  module: Module;
  configuration: ModuleConfiguration;
  onChange: (configuration: ModuleConfiguration) => void;
  onSave: () => void;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
}

export function ConfigureTab({
  module,
  configuration,
  onChange,
  onSave,
  isLoading = false,
  hasUnsavedChanges = false,
}: ConfigureTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(configuration.mneeDepositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Common Configuration */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          Basic Configuration
        </h3>

        <div className="grid gap-2">
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            id="amount"
            type="text"
            placeholder="1.00"
            value={configuration.amount}
            onChange={(e) =>
              onChange({ ...configuration, amount: e.target.value })
            }
            disabled={isLoading}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="mneeDepositAddress">MNEE Deposit Address</Label>
          <div className="flex gap-2">
            <Input
              id="mneeDepositAddress"
              type="text"
              value={configuration.mneeDepositAddress}
              disabled
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyAddress}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="collectEmail"
            checked={configuration.collectEmail}
            onCheckedChange={(checked) =>
              onChange({ ...configuration, collectEmail: checked as boolean })
            }
            disabled={isLoading}
          />
          <Label htmlFor="collectEmail" className="cursor-pointer">
            Collect email
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="showConfetti"
            checked={configuration.showConfetti}
            onCheckedChange={(checked) =>
              onChange({ ...configuration, showConfetti: checked as boolean })
            }
            disabled={isLoading}
          />
          <Label htmlFor="showConfetti" className="cursor-pointer">
            Show confetti on success
          </Label>
        </div>
      </div>

      {/* Paywall-specific Configuration */}
      {module.kind === "paywall" && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">
            Paywall Configuration
          </h3>

          <div className="grid gap-2">
            <Label htmlFor="paywall-title">Title</Label>
            <Input
              id="paywall-title"
              type="text"
              placeholder="Premium Content"
              value={configuration.paywall?.title || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  paywall: {
                    ...configuration.paywall!,
                    title: e.target.value,
                  },
                })
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paywall-description">Description</Label>
            <Textarea
              id="paywall-description"
              placeholder="Unlock this content with a one-time payment"
              value={configuration.paywall?.description || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  paywall: {
                    ...configuration.paywall!,
                    description: e.target.value,
                  },
                })
              }
              disabled={isLoading}
              rows={3}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paywall-buttonText">Button Text (optional)</Label>
            <Input
              id="paywall-buttonText"
              type="text"
              placeholder="Unlock Now"
              value={configuration.paywall?.buttonText || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  paywall: {
                    ...configuration.paywall!,
                    buttonText: e.target.value,
                  },
                })
              }
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* E-commerce-specific Configuration */}
      {module.kind === "e-commerce" && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">
            E-commerce Configuration
          </h3>

          <div className="grid gap-2">
            <Label htmlFor="ecommerce-productName">Product Name</Label>
            <Input
              id="ecommerce-productName"
              type="text"
              placeholder="Premium T-Shirt"
              value={configuration.ecommerce?.productName || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  ecommerce: {
                    ...configuration.ecommerce!,
                    productName: e.target.value,
                  },
                })
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ecommerce-productImage">
              Product Image URL (optional)
            </Label>
            <Input
              id="ecommerce-productImage"
              type="text"
              placeholder="https://example.com/product.jpg"
              value={configuration.ecommerce?.productImage || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  ecommerce: {
                    ...configuration.ecommerce!,
                    productImage: e.target.value,
                  },
                })
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="showQuantitySelector"
              checked={configuration.ecommerce?.showQuantitySelector || false}
              onCheckedChange={(checked) =>
                onChange({
                  ...configuration,
                  ecommerce: {
                    ...configuration.ecommerce!,
                    showQuantitySelector: checked as boolean,
                  },
                })
              }
              disabled={isLoading}
            />
            <Label htmlFor="showQuantitySelector" className="cursor-pointer">
              Show quantity selector
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="collectShipping"
              checked={configuration.ecommerce?.collectShipping || false}
              onCheckedChange={(checked) =>
                onChange({
                  ...configuration,
                  ecommerce: {
                    ...configuration.ecommerce!,
                    collectShipping: checked as boolean,
                  },
                })
              }
              disabled={isLoading}
            />
            <Label htmlFor="collectShipping" className="cursor-pointer">
              Collect shipping address
            </Label>
          </div>
        </div>
      )}

      {/* Donation-specific Configuration */}
      {module.kind === "donation" && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">
            Donation Configuration
          </h3>

          <div className="grid gap-2">
            <Label htmlFor="donation-title">Title</Label>
            <Input
              id="donation-title"
              type="text"
              placeholder="Support Us"
              value={configuration.donation?.title || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  donation: {
                    ...configuration.donation!,
                    title: e.target.value,
                  },
                })
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="donation-description">Description</Label>
            <Textarea
              id="donation-description"
              placeholder="Your contribution helps us continue our work"
              value={configuration.donation?.description || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  donation: {
                    ...configuration.donation!,
                    description: e.target.value,
                  },
                })
              }
              disabled={isLoading}
              rows={3}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="donation-suggestedAmounts">
              Suggested Amounts (comma-separated)
            </Label>
            <Input
              id="donation-suggestedAmounts"
              type="text"
              placeholder="0.50, 1.00, 1.50, 2.00"
              value={configuration.donation?.suggestedAmounts?.join(", ") || ""}
              onChange={(e) => {
                const amounts = e.target.value
                  .split(",")
                  .map((s) => parseFloat(s.trim()))
                  .filter((n) => !isNaN(n));
                onChange({
                  ...configuration,
                  donation: {
                    ...configuration.donation!,
                    suggestedAmounts: amounts,
                  },
                });
              }}
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="allowCustomAmount"
              checked={configuration.donation?.allowCustomAmount ?? true}
              onCheckedChange={(checked) =>
                onChange({
                  ...configuration,
                  donation: {
                    ...configuration.donation!,
                    allowCustomAmount: checked as boolean,
                  },
                })
              }
              disabled={isLoading}
            />
            <Label htmlFor="allowCustomAmount" className="cursor-pointer">
              Allow custom amount
            </Label>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        {hasUnsavedChanges && (
          <p className="text-sm text-muted-foreground self-center">
            You have unsaved changes
          </p>
        )}
        <Button type="submit" disabled={isLoading || !hasUnsavedChanges}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
