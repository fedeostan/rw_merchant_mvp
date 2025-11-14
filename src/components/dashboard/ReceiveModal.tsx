'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { toast } from 'sonner';

interface ReceiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiveModal({ open, onOpenChange }: ReceiveModalProps) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { receiveMnee, isReceiving } = useWalletBalance();

  // Generate wallet address and QR code when modal opens
  useEffect(() => {
    if (open && !walletAddress) {
      const generateAddress = async () => {
        try {
          const result = await receiveMnee({ amount: undefined });
          setWalletAddress(result.address);
          setQrCodeDataUrl(result.qrCode);
        } catch (error) {
          toast.error("Failed to generate address", {
            description: error instanceof Error ? error.message : "An unexpected error occurred",
          });
          onOpenChange(false);
        }
      };
      generateAddress();
    }
  }, [open, walletAddress, receiveMnee, onOpenChange]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    // Reset state when closing
    if (!newOpen) {
      setWalletAddress('');
      setQrCodeDataUrl('');
      setCopied(false);
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
          <DialogTitle>Receive MNEE</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Wallet Address Section */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="wallet-address" className="text-sm font-medium">
              Wallet address
            </Label>
            {isReceiving || !walletAddress ? (
              <Skeleton className="h-9 w-full" />
            ) : (
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
            )}
          </div>

          {/* QR Code Section */}
          <div className="flex justify-center py-4">
            {isReceiving || !qrCodeDataUrl ? (
              <Skeleton className="h-[200px] w-[200px] rounded-lg" />
            ) : (
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={qrCodeDataUrl}
                  alt="Wallet QR Code"
                  width={200}
                  height={200}
                  className="w-[200px] h-[200px]"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
