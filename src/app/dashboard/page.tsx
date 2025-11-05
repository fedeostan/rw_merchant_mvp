"use client";

import { Wallet, Minus, ArrowUpRight, ArrowDownLeft, Plus, Repeat2 } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useMneePrice } from "@/hooks/useMneePrice";
import { AnnouncementCard } from "@/components/dashboard/AnnouncementCard";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { ActionButton } from "@/components/dashboard/ActionButton";

export default function WalletPage() {
  // Fetch wallet data
  const { balance, isLoading: balanceLoading, error: balanceError, refresh: refreshBalance } = useWalletBalance("sf_1");
  const { price, isLoading: priceLoading, error: priceError, refresh: refreshPrice } = useMneePrice();

  // Combined loading state
  const isLoading = balanceLoading || priceLoading;

  // Refresh both balance and price
  const handleRefresh = () => {
    refreshBalance();
    refreshPrice();
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
              currency={balance?.currency}
              pricePerUnit={price?.price}
              isLoading={isLoading}
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
                onClick={() => console.log("Send clicked")}
              />
              <ActionButton
                icon={ArrowDownLeft}
                label="Receive"
                onClick={() => console.log("Receive clicked")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
