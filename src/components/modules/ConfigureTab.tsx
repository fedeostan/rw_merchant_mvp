"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check, Trash2, Plus, X } from "lucide-react";
import type { Module } from "@/lib/api/generated/schemas/module";
import type { ModuleConfiguration, CustomField } from "@/lib/schemas/module";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConfigureTabProps {
  module: Module;
  configuration: ModuleConfiguration;
  onChange: (configuration: ModuleConfiguration) => void;
  onSave: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  hasUnsavedChanges?: boolean;
}

export function ConfigureTab({
  module,
  configuration,
  onChange,
  onSave,
  onDelete,
  isLoading = false,
  isDeleting = false,
  hasUnsavedChanges = false,
}: ConfigureTabProps) {
  const [copied, setCopied] = useState(false);
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [newField, setNewField] = useState<CustomField>({
    label: "",
    type: "text",
    required: false,
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(configuration.mneeDepositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  const handleAddField = () => {
    if (!newField.label.trim()) return;
    const currentFields = configuration.customFields || [];
    onChange({
      ...configuration,
      customFields: [...currentFields, newField],
    });
    setNewField({ label: "", type: "text", required: false });
    setShowAddFieldDialog(false);
  };

  const handleRemoveField = (index: number) => {
    const currentFields = configuration.customFields || [];
    onChange({
      ...configuration,
      customFields: currentFields.filter((_, i) => i !== index),
    });
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
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

      {/* Styling Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">Styling</h3>

        <div className="grid gap-2">
          <Label htmlFor="buttonText">Button Text (optional)</Label>
          <Input
            id="buttonText"
            type="text"
            placeholder="Leave empty for default"
            value={configuration.styling?.buttonText || ""}
            onChange={(e) =>
              onChange({
                ...configuration,
                styling: {
                  ...configuration.styling,
                  buttonText: e.target.value,
                },
              })
            }
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="primaryColor">Primary Color (optional)</Label>
            <Input
              id="primaryColor"
              type="text"
              placeholder="#8b5cf6"
              value={configuration.styling?.primaryColor || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  styling: {
                    ...configuration.styling,
                    primaryColor: e.target.value,
                  },
                })
              }
              disabled={isLoading}
              className="font-mono"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="buttonColor">Button Color (optional)</Label>
            <Input
              id="buttonColor"
              type="text"
              placeholder="#ec4899"
              value={configuration.styling?.buttonColor || ""}
              onChange={(e) =>
                onChange({
                  ...configuration,
                  styling: {
                    ...configuration.styling,
                    buttonColor: e.target.value,
                  },
                })
              }
              disabled={isLoading}
              className="font-mono"
            />
          </div>
        </div>
      </div>

      {/* Custom Fields Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          Custom Fields (Product Options, etc.)
        </h3>

        {(!configuration.customFields ||
          configuration.customFields.length === 0) && (
          <p className="text-sm text-muted-foreground">
            No custom fields added yet. Add fields like size, color, format,
            etc.
          </p>
        )}

        {configuration.customFields && configuration.customFields.length > 0 && (
          <div className="flex flex-col gap-2">
            {configuration.customFields.map((field, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{field.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {field.type}
                  </span>
                  {field.required && (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      Required
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveField(index)}
                  disabled={isLoading}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="default"
          onClick={() => setShowAddFieldDialog(true)}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={onDelete}
              disabled={isLoading || isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete module
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <p className="text-sm text-muted-foreground">
              You have unsaved changes
            </p>
          )}
          <Button type="submit" disabled={isLoading || !hasUnsavedChanges}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </form>

    {/* Add Custom Field Dialog */}
    <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fieldLabel">Field Label</Label>
            <Input
              id="fieldLabel"
              placeholder="e.g., Size, Color, Format"
              value={newField.label}
              onChange={(e) =>
                setNewField({ ...newField, label: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fieldType">Field Type</Label>
            <Select
              value={newField.type}
              onValueChange={(value) =>
                setNewField({ ...newField, type: value })
              }
            >
              <SelectTrigger id="fieldType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="select">Dropdown</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="fieldRequired"
              checked={newField.required}
              onCheckedChange={(checked) =>
                setNewField({ ...newField, required: checked as boolean })
              }
            />
            <Label htmlFor="fieldRequired" className="cursor-pointer">
              Required field
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowAddFieldDialog(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddField}
            disabled={!newField.label.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
