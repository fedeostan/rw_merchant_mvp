'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReceiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate a random wallet address for MVP
const generateWalletAddress = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let address = '1L';
  for (let i = 0; i < 32; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
};

export function ReceiveModal({ open, onOpenChange }: ReceiveModalProps) {
  const [walletAddress] = useState(generateWalletAddress());
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <DialogTitle>Receive MNEE</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Wallet Address Section */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="wallet-address" className="text-sm font-medium">
              Wallet address
            </Label>
            <div className="flex gap-2">
              <Input
                id="wallet-address"
                value={walletAddress}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy wallet address</span>
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex justify-center py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                value={walletAddress}
                size={200}
                level="M"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
