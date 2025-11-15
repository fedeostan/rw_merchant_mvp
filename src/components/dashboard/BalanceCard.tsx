import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Check, ArrowUp, ArrowDown } from "lucide-react";
import { formatPercentageChange, formatUsdAmount } from "@/lib/utils/transactionFormatters";

interface BalanceCardProps {
  /**
   * Available balance amount
   */
  balance?: number;
  /**
   * Pending balance amount
   */
  pendingBalance?: number;
  /**
   * Currency symbol (e.g., "MNEE", "USD")
   */
  currency?: string;
  /**
   * Current price per unit in USD
   */
  pricePerUnit?: number;
  /**
   * 24-hour price change percentage
   */
  priceChangePercentage24h?: number | null;
  /**
   * Total balance in USD (available + pending) * price
   */
  totalUsd?: number;
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Refreshing state (manual refresh in progress)
   */
  isRefreshing?: boolean;
  /**
   * Success state (refresh completed)
   */
  refreshSuccess?: boolean;
  /**
   * Error state
   */
  error?: Error | null;
  /**
   * Callback for refresh action
   */
  onRefresh?: () => void;
}

/**
 * BalanceCard component matching Figma design
 * Shows balance with refresh button, price info below in single line
 */
export function BalanceCard({
  balance,
  pendingBalance,
  currency = "MNEE",
  pricePerUnit,
  priceChangePercentage24h,
  totalUsd,
  isLoading = false,
  isRefreshing = false,
  refreshSuccess = false,
  error,
  onRefresh,
}: BalanceCardProps) {
  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-destructive mb-2">
              Error Loading Balance
            </p>
            <p className="text-xs text-muted-foreground">
              {error.message || "Failed to load wallet balance"}
            </p>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 px-3"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Check if balance is empty (0 or undefined/null)
  const hasBalance = balance !== undefined && balance !== null && balance > 0;

  // Calculate total balance (available + pending) for display
  const totalBalance = (balance || 0) + (pendingBalance || 0);

  // Determine if price change is positive or negative
  const isPricePositive = priceChangePercentage24h !== null &&
                          priceChangePercentage24h !== undefined &&
                          priceChangePercentage24h > 0;
  const isPriceNegative = priceChangePercentage24h !== null &&
                          priceChangePercentage24h !== undefined &&
                          priceChangePercentage24h < 0;

  return (
    <div className="bg-card border border-border rounded-xl px-6 py-6 flex flex-col gap-6">
      {/* Top section: Label + Balance/Empty State + Refresh */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-base text-muted-foreground leading-6">
            Total MNEE balance
          </p>
          {isLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : hasBalance ? (
            <div className="flex items-center gap-2">
              {/* Primary: MNEE amount */}
              <div className="border-r border-border pr-3">
                <h2 className="text-3xl font-semibold text-card-foreground leading-9">
                  {totalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} {currency}
                </h2>
              </div>
              {/* Secondary: Price change indicator */}
              <div className="flex-1 flex items-center gap-2.5">
                <div className="flex items-center gap-0.5">
                  {isPricePositive && (
                    <ArrowUp className="w-6 h-6 text-green-600" />
                  )}
                  {isPriceNegative && (
                    <ArrowDown className="w-6 h-6 text-red-600" />
                  )}
                  <p className={`text-sm font-bold leading-5 ${
                    isPricePositive ? "text-green-600" :
                    isPriceNegative ? "text-red-600" :
                    "text-muted-foreground"
                  }`}>
                    {formatPercentageChange(priceChangePercentage24h)}
                  </p>
                </div>
                <p className="text-base text-muted-foreground leading-6">
                  24h
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-5">
              Your MNEE balance will appear here once customers start making payments.
            </p>
          )}
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            className={`h-9 px-3 bg-background transition-all ${
              refreshSuccess ? "border-green-500 bg-green-50 dark:bg-green-950" : ""
            }`}
          >
            {refreshSuccess ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <RefreshCw className={`w-4 h-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`} />
            )}
          </Button>
        )}
      </div>

      {/* Bottom section: USD value - only show if has balance */}
      {isLoading ? (
        <Skeleton className="h-6 w-64" />
      ) : hasBalance ? (
        <div className="flex items-center gap-2.5">
          <p className="text-base text-muted-foreground leading-6">
            Balance in USD:{" "}
            <span className="font-medium">
              {totalUsd !== undefined ? formatUsdAmount(totalUsd) : "$0.00"}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
