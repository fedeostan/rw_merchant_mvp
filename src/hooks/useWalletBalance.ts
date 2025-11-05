import { useGetOrgsOrgIdStorefrontsSfIdBalance } from "@/lib/api/generated";
import { MOCK_ORG_ID } from "@/lib/msw/seed";
import { useEffect } from "react";

/**
 * Custom hook to fetch wallet balance for a storefront
 * Wraps the generated Orval hook with simplified interface
 */
export function useWalletBalance(storefrontId: string) {
  console.log("[useWalletBalance] Hook called with:", { MOCK_ORG_ID, storefrontId });

  const { data, isLoading, error, refetch } = useGetOrgsOrgIdStorefrontsSfIdBalance(
    MOCK_ORG_ID,
    storefrontId
  );

  useEffect(() => {
    console.log("[useWalletBalance] State updated:", { isLoading, hasData: !!data, hasError: !!error });
  }, [isLoading, data, error]);

  return {
    balance: data,
    isLoading,
    error,
    refresh: refetch,
  };
}
