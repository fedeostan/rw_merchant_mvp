import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Check } from "lucide-react";

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
            <h2 className="text-3xl font-semibold text-card-foreground leading-9">
              {balance?.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} {currency}
            </h2>
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

      {/* Bottom section: Price info in single line with separator - only show if has balance */}
      {isLoading ? (
        <Skeleton className="h-5 w-64" />
      ) : hasBalance ? (
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground leading-5">
          <span>
            MNEE Price:{" "}
            <span className="text-foreground">
              ${pricePerUnit?.toFixed(2) || "0.00"}
            </span>
          </span>
          <span>|</span>
          <span>
            Available:{" "}
            <span className="text-foreground">
              {balance?.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} {currency}
            </span>
          </span>
          {pendingBalance !== undefined && pendingBalance !== 0 && (
            <>
              <span>|</span>
              <span>
                Pending:{" "}
                <span className="text-foreground">
                  {pendingBalance?.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })} {currency}
                </span>
              </span>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
