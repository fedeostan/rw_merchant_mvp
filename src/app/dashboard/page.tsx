"use client";

import { useState } from "react";
import { Wallet, Minus, ArrowUpRight, ArrowDownLeft, Plus, Repeat2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useMneePrice } from "@/hooks/useMneePrice";
import { AnnouncementCard } from "@/components/dashboard/AnnouncementCard";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { ActionButton } from "@/components/dashboard/ActionButton";
import { ReceiveModal } from "@/components/dashboard/ReceiveModal";
import { SendModal } from "@/components/dashboard/SendModal";

export default function WalletPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Get the QueryClient instance from React Context
  const queryClient = useQueryClient();

  // Fetch wallet data
  const {
    balance,
    isLoading: balanceLoading,
    error: balanceError,
    refresh: refreshBalance,
    isPending: isWalletActionPending,
  } = useWalletBalance();
  const { price, isLoading: priceLoading, error: priceError, refresh: refreshPrice } = useMneePrice();

  // Combined loading state
  const isLoading = balanceLoading || priceLoading;

  // Refresh both balance and price
  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent double-clicks

    try {
      setIsRefreshing(true);
      setRefreshSuccess(false);
      console.log('[Dashboard] Refreshing balance and price...');

      // Invalidate cache to ensure fresh data (this automatically triggers refetch for active queries)
      await queryClient.invalidateQueries({
        queryKey: ['orgBalance'],
        refetchType: 'active'
      });
      await queryClient.invalidateQueries({
        queryKey: ['/mnee/price'],
        refetchType: 'active'
      });

      console.log('[Dashboard] Refresh complete');

      // Show success feedback
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2000); // Hide after 2 seconds
    } catch (error) {
      console.error('[Dashboard] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-2">
      {/* Main wrapper with rounded corners, no shadow */}
      <div className="bg-background rounded-xl flex flex-col h-full">
        {/* Breadcrumb Header - 64px height */}
        <div className="h-16 flex items-center px-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-foreground" />
            <span className="text-foreground">/</span>
            <p className="text-sm font-normal text-foreground">Wallet</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 py-6 overflow-auto">
          <div className="flex flex-col gap-4">
            {/* Announcement */}
            <AnnouncementCard
              icon="🎉"
              title="Coming soon: APY rewards!"
              description="Earn 4.5% yield rewards on your MNEE balance"
            />

            {/* Balance Card */}
            <BalanceCard
              balance={balance?.available}
              pendingBalance={balance?.pending}
              currency={balance?.currency}
              pricePerUnit={price?.price}
              isLoading={isLoading || isWalletActionPending}
              isRefreshing={isRefreshing || isWalletActionPending}
              refreshSuccess={refreshSuccess}
              error={(balanceError || priceError) as Error | null}
              onRefresh={handleRefresh}
            />

            {/* Action Buttons - Horizontal Row */}
            <div className="flex gap-3 h-9">
              <ActionButton
                icon={Minus}
                label="Sell"
                onClick={() => console.log("Sell clicked")}
              />
              <ActionButton
                icon={Repeat2}
                label="Swap"
                onClick={() => console.log("Swap clicked")}
                disabled
              />
              <ActionButton
                icon={Plus}
                label="Buy"
                onClick={() => console.log("Buy clicked")}
              />
              <ActionButton
                icon={ArrowUpRight}
                label="Send"
                onClick={() => setIsSendModalOpen(true)}
              />
              <ActionButton
                icon={ArrowDownLeft}
                label="Receive"
                onClick={() => setIsReceiveModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Receive Modal */}
      <ReceiveModal
        open={isReceiveModalOpen}
        onOpenChange={setIsReceiveModalOpen}
      />

      {/* Send Modal */}
      <SendModal
        open={isSendModalOpen}
        onOpenChange={setIsSendModalOpen}
      />
    </div>
  );
}
