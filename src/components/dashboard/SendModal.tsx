'use client';

import { useState } from 'react';
import { ClipboardPaste } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { toast } from 'sonner';

interface SendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * SendModal Component
 *
 * A modal dialog for sending MNEE to another wallet address.
 * Features:
 * - Amount input with USD validation
 * - Recipient address input with format validation
 * - Real-time error states with red borders
 * - Disabled/enabled Send button based on validation
 * - Real API integration with optimistic updates
 * - Balance validation (insufficient balance errors)
 */
export function SendModal({ open, onOpenChange }: SendModalProps) {
  // Form state
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  // Error state
  const [amountError, setAmountError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Wallet actions
  const { sendMnee, isSending, balance } = useWalletBalance();

  /**
   * Validates the amount input
   * Rules:
   * - Cannot be empty
   * - Must be a positive number
   * - Can only contain digits and one decimal point
   * - No special characters
   * - Must not exceed available balance
   */
  const validateAmount = (value: string): string | null => {
    if (!value.trim()) {
      return 'Enter a valid amount.';
    }

    // Check for valid number format (digits and optional decimal point)
    if (!/^\d*\.?\d+$/.test(value)) {
      return 'Enter a valid amount.';
    }

    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return 'Enter a valid amount.';
    }

    // Check if user has sufficient balance
    if (balance && balance.available < num) {
      return `Insufficient balance. Available: ${balance.available} MNEE`;
    }

    return null;
  };

  /**
   * Validates the recipient address input
   * Rules:
   * - Cannot be empty
   * - Must be alphanumeric only
   * - Minimum length of 26 characters (typical crypto address)
   * - No special characters
   */
  const validateAddress = (value: string): string | null => {
    if (!value.trim()) {
      return 'Enter a valid address.';
    }

    // Check for valid alphanumeric format only
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      return 'Enter a valid address.';
    }

    // Minimum length check for crypto addresses
    if (value.length < 26) {
      return 'Enter a valid address.';
    }

    return null;
  };

  /**
   * Handles amount input changes
   * Clears error when user starts typing
   */
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    // Clear error when user starts typing
    if (amountError) {
      setAmountError(null);
    }
  };

  /**
   * Handles recipient address input changes
   * Clears error when user starts typing
   */
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientAddress(value);

    // Clear error when user starts typing
    if (addressError) {
      setAddressError(null);
    }
  };

  /**
   * Handles paste functionality for recipient address
   */
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipientAddress(text);
      // Clear error when pasting
      if (addressError) {
        setAddressError(null);
      }
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  /**
   * Validates all fields and returns true if form is valid
   */
  const validateForm = (): boolean => {
    const amountValidation = validateAmount(amount);
    const addressValidation = validateAddress(recipientAddress);

    setAmountError(amountValidation);
    setAddressError(addressValidation);

    return !amountValidation && !addressValidation;
  };

  /**
   * Checks if the Send button should be enabled
   * Button is enabled when both fields have values (validation happens on submit)
   */
  const isSendEnabled = amount.trim() !== '' && recipientAddress.trim() !== '';

  /**
   * Handles the Send button click
   * Creates a real transaction via the API
   */
  const handleSend = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    try {
      // Call the API to send MNEE
      await sendMnee({
        amount: parseFloat(amount),
        recipient: recipientAddress,
        address: recipientAddress,
      });

      // Show success toast
      toast.success("MNEE sent successfully", {
        description: `Sent ${amount} MNEE to ${recipientAddress.slice(0, 10)}...`,
      });

      // Close modal on success
      onOpenChange(false);
    } catch (error) {
      // Show error toast
      toast.error("Failed to send MNEE", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };

  /**
   * Resets the form when modal closes
   */
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);

    // Reset form when closing
    if (!open) {
      setAmount('');
      setRecipientAddress('');
      setAmountError(null);
      setAddressError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full
          data-[state=open]:!slide-in-from-left-0 data-[state=open]:!slide-in-from-top-0
          data-[state=closed]:!slide-out-to-left-0 data-[state=closed]:!slide-out-to-top-0
          data-[state=open]:!zoom-in-100 data-[state=closed]:!zoom-out-100
          data-[state=open]:!fade-in-100 data-[state=closed]:!fade-out-100
          data-[state=open]:duration-300 data-[state=closed]:duration-200"
      >
        <DialogHeader>
          <DialogTitle>Send MNEE</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Amount in USD Section */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="amount-usd" className="text-sm font-medium">
              Amount in USD
            </Label>
            <Input
              id="amount-usd"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Amount you want to send"
              className={`h-9 ${amountError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              disabled={isSending}
            />
            {/* Error message for amount */}
            {amountError && (
              <p className="text-xs text-destructive">
                {amountError}
              </p>
            )}
          </div>

          {/* Send to Section */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="recipient-address" className="text-sm font-medium">
              Send to
            </Label>
            <div className="relative">
              <Input
                id="recipient-address"
                type="text"
                value={recipientAddress}
                onChange={handleAddressChange}
                placeholder="Recipient's wallet address"
                className={`h-9 pr-10 ${addressError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isSending}
              />
              {/* Paste icon button */}
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                disabled={isSending}
                aria-label="Paste from clipboard"
              >
                <ClipboardPaste className="h-4 w-4" />
              </button>
            </div>
            {/* Error message for address */}
            {addressError && (
              <p className="text-xs text-destructive">
                {addressError}
              </p>
            )}
          </div>
        </div>

        {/* Send Button */}
        <div className="flex w-full">
          <Button
            type="button"
            onClick={handleSend}
            disabled={!isSendEnabled || isSending}
            className={`w-full h-9 ${
              isSendEnabled && !isSending
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted'
            }`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
