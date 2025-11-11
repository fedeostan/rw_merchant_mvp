"use client";

import { ExternalLink } from "lucide-react";
import type { Transaction } from "@/lib/schemas/transaction";
import type { Module } from "@/lib/api/generated/schemas";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { TransactionAmount } from "./TransactionAmount";
import {
  formatTransactionDate,
  getBlockchainExplorerUrl,
} from "@/lib/utils";

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  module: Module | undefined;
  open: boolean;
  onClose: () => void;
}

export function TransactionDetailSheet({
  transaction,
  module,
  open,
  onClose,
}: TransactionDetailSheetProps) {
  if (!transaction) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader className="space-y-6">
          <SheetTitle className="text-lg font-semibold">Transaction details</SheetTitle>

          {/* Header with amount and badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-2xl font-bold">
              <TransactionAmount
                amount={transaction.amount}
                currency={transaction.currency}
                type={transaction.type}
              />
            </div>
            <TransactionTypeBadge displayType={transaction.displayType} />
            <TransactionStatusBadge status={transaction.status} />
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Transaction ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transaction ID</label>
            <div className="flex items-center gap-2">
              <code className="text-sm font-medium">#{transaction.id}</code>
              <CopyButton
                text={transaction.id}
                size="icon"
                variant="ghost"
                className="h-7 w-7 hover:bg-muted"
              />
            </div>
          </div>

          {/* Customer Email */}
          {transaction.customerEmail && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer email</label>
              <p className="text-sm font-medium">{transaction.customerEmail}</p>
            </div>
          )}

          {/* Send Hash */}
          {transaction.sendHash && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Send hash</label>
              <div className="flex items-start gap-2">
                <code className="text-xs font-mono break-all flex-1 bg-muted/50 p-2 rounded">
                  {transaction.sendHash}
                </code>
                <div className="flex gap-1 flex-shrink-0">
                  <CopyButton
                    text={transaction.sendHash}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 hover:bg-muted"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-muted"
                    asChild
                  >
                    <a
                      href={getBlockchainExplorerUrl(transaction.sendHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on blockchain explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Created On */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created on</label>
            <p className="text-sm font-medium">
              {formatTransactionDate(transaction.createdAt)}
            </p>
          </div>

          {/* Incoming Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Incoming currency</label>
            <p className="text-sm font-medium">{transaction.currency}</p>
          </div>

          {/* Amount in USD */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount in USD</label>
            <p className="text-sm font-semibold">
              ${Math.abs(transaction.amount).toFixed(2)}
            </p>
          </div>

          {/* Rock Wallet ID */}
          {transaction.rockWalletId && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">RW ID</label>
              <div className="flex items-center gap-2">
                <code className="text-sm font-medium">
                  {transaction.rockWalletId}
                </code>
                <CopyButton
                  text={transaction.rockWalletId}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-muted"
                />
              </div>
            </div>
          )}

          {/* Module Information */}
          {module && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Module type</label>
                <p className="text-sm font-medium capitalize">{module.kind}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Module name</label>
                <p className="text-sm font-medium">{module.name}</p>
              </div>
            </>
          )}

          {/* Customer Address */}
          {transaction.customerAddress && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer address</label>
              <code className="text-xs font-mono break-all block bg-muted/50 p-2 rounded">
                {transaction.customerAddress}
              </code>
            </div>
          )}

          {/* Fee */}
          {transaction.feeUsd !== undefined && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fee</label>
              <p className="text-sm font-medium">${transaction.feeUsd.toFixed(2)} USD</p>
            </div>
          )}

          {/* Transaction Hashes */}
          {transaction.txHashIn && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Transaction hash (In)
              </label>
              <code className="text-xs font-mono break-all block bg-muted/50 p-2 rounded">
                {transaction.txHashIn}
              </code>
            </div>
          )}

          {transaction.txHashSwap && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Transaction hash (Swap)
              </label>
              <code className="text-xs font-mono break-all block bg-muted/50 p-2 rounded">
                {transaction.txHashSwap}
              </code>
            </div>
          )}
        </div>

        {/* Close Button at Bottom */}
        <div className="mt-10 pt-6 border-t border-border">
          <Button onClick={onClose} className="w-full" variant="outline" size="lg">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
