import { useGetOrgsOrgIdTransactions } from "@/lib/api/default/default";
import type { GetOrgsOrgIdTransactionsParams } from "@/lib/api/generated/schemas";
import { TransactionType, TransactionDisplayType } from "@/lib/api/generated/schemas";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/**
 * Maps displayType (user-facing) to TransactionType (API)
 * This is needed because the API filters by "in"/"out" but the UI uses
 * more specific displayTypes like "receive", "send", "buy", "sell", "swap"
 */
function mapDisplayTypeToApiType(displayType: string): TransactionType | undefined {
  switch (displayType) {
    case TransactionDisplayType.receive:
    case TransactionDisplayType.buy:
      return TransactionType.in;
    case TransactionDisplayType.send:
    case TransactionDisplayType.sell:
      return TransactionType.out;
    case TransactionDisplayType.swap:
      // Swap transactions could be either in or out, so we can't filter by type
      // Will be handled by client-side filtering
      return undefined;
    default:
      return undefined;
  }
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  moduleId?: string;
}

export function useTransactions() {
  const { isAuthenticated } = useAuth();
  const { currentOrgId } = useOrg();
  const searchParams = useSearchParams();

  // Use organization ID from useOrg hook (same pattern as useModules)
  const orgId = currentOrgId || "temp";

  // Extract filters from URL search params
  const filters = useMemo<TransactionFilters>(() => {
    return {
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      moduleId: searchParams.get("moduleId") || undefined,
    };
  }, [searchParams]);

  // Extract cursor for pagination
  const cursor = searchParams.get("cursor") || undefined;

  // Build API params from filters
  const apiParams = useMemo<GetOrgsOrgIdTransactionsParams>(() => {
    const params: GetOrgsOrgIdTransactionsParams = {
      cursor,
    };

    if (filters.moduleId) {
      params.moduleId = filters.moduleId;
    }

    // Map displayType to API type for filtering
    if (filters.type) {
      const apiType = mapDisplayTypeToApiType(filters.type);
      if (apiType) {
        params.type = apiType;
      }
      // If apiType is undefined (e.g., for "swap"), we'll filter client-side
    }

    if (filters.status) {
      params.status = filters.status as GetOrgsOrgIdTransactionsParams["status"];
    }

    return params;
  }, [filters, cursor]);

  // Fetch transactions - only enabled when authenticated and org ID is available
  const query = useGetOrgsOrgIdTransactions(
    orgId,
    apiParams,
    {
      query: {
        enabled: isAuthenticated && !!currentOrgId,
      },
    }
  );

  // Client-side filtering for:
  // - displayType when type couldn't be mapped to API (e.g., "swap")
  const filteredTransactions = useMemo(() => {
    if (!query.data?.items) return [];

    let filtered = query.data.items;

    // Filter by displayType when API filtering wasn't applied
    // This handles cases like "swap" where we can't map to "in"/"out"
    if (filters.type) {
      const apiType = mapDisplayTypeToApiType(filters.type);
      if (!apiType) {
        // No API type mapping exists, filter by displayType client-side
        filtered = filtered.filter(
          (transaction) => transaction.displayType === filters.type
        );
      }
    }

    return filtered;
  }, [query.data?.items, filters.type]);

  return {
    transactions: filteredTransactions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    nextCursor: query.data?.nextCursor,
    filters,
    refetch: query.refetch,
  };
}

export type UseTransactionsReturn = ReturnType<typeof useTransactions>;
