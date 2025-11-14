"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrg } from "./useOrg";
import type { OrgBalance } from "@/lib/utils/balance";

/**
 * Custom hook to fetch wallet balance for an organization
 * Calculates balance from all posted and pending transactions
 *
 * Features:
 * - Optimistic updates for better UX
 * - Automatic refetch after wallet actions
 * - Pending state during transaction creation
 * - Mutation functions for wallet actions (buy, sell, send, receive)
 */
export function useWalletBalance() {
  const { currentOrgId, isLoadingCurrentOrg } = useOrg();
  const queryClient = useQueryClient();

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useQuery<OrgBalance>({
    queryKey: ["orgBalance", currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) {
        throw new Error("No organization selected");
      }

      const response = await fetch(`/api/orgs/${currentOrgId}/balance`);

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      return response.json();
    },
    enabled: !!currentOrgId && !isLoadingCurrentOrg,
  });

  // Mutation for buying MNEE
  const buyMutation = useMutation({
    mutationFn: async ({ amount, paymentMethod }: { amount: number; paymentMethod: string }) => {
      const response = await fetch("/api/wallet/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, paymentMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to buy MNEE");
      }

      return response.json();
    },
    onMutate: async ({ amount }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orgBalance", currentOrgId] });

      // Snapshot previous value
      const previousBalance = queryClient.getQueryData<OrgBalance>(["orgBalance", currentOrgId]);

      // Optimistically update balance
      if (previousBalance) {
        queryClient.setQueryData<OrgBalance>(["orgBalance", currentOrgId], {
          ...previousBalance,
          available: previousBalance.available + amount,
          pending: (previousBalance.pending || 0), // Keep pending as is during buy
        });
      }

      return { previousBalance };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousBalance) {
        queryClient.setQueryData(["orgBalance", currentOrgId], context.previousBalance);
      }
    },
    onSuccess: () => {
      // Refetch to get accurate balance from server
      queryClient.invalidateQueries({ queryKey: ["orgBalance", currentOrgId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", currentOrgId] });
    },
  });

  // Mutation for selling MNEE
  const sellMutation = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const response = await fetch("/api/wallet/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sell MNEE");
      }

      return response.json();
    },
    onMutate: async ({ amount }) => {
      await queryClient.cancelQueries({ queryKey: ["orgBalance", currentOrgId] });
      const previousBalance = queryClient.getQueryData<OrgBalance>(["orgBalance", currentOrgId]);

      // Optimistically update balance
      if (previousBalance) {
        queryClient.setQueryData<OrgBalance>(["orgBalance", currentOrgId], {
          ...previousBalance,
          available: previousBalance.available - amount,
          pending: (previousBalance.pending || 0),
        });
      }

      return { previousBalance };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBalance) {
        queryClient.setQueryData(["orgBalance", currentOrgId], context.previousBalance);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgBalance", currentOrgId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", currentOrgId] });
    },
  });

  // Mutation for sending MNEE
  const sendMutation = useMutation({
    mutationFn: async ({ amount, recipient, address }: { amount: number; recipient: string; address: string }) => {
      const response = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, recipient, address }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send MNEE");
      }

      return response.json();
    },
    onMutate: async ({ amount }) => {
      await queryClient.cancelQueries({ queryKey: ["orgBalance", currentOrgId] });
      const previousBalance = queryClient.getQueryData<OrgBalance>(["orgBalance", currentOrgId]);

      // Optimistically update balance
      if (previousBalance) {
        queryClient.setQueryData<OrgBalance>(["orgBalance", currentOrgId], {
          ...previousBalance,
          available: previousBalance.available - amount,
          pending: (previousBalance.pending || 0),
        });
      }

      return { previousBalance };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBalance) {
        queryClient.setQueryData(["orgBalance", currentOrgId], context.previousBalance);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgBalance", currentOrgId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", currentOrgId] });
    },
  });

  // Mutation for receiving MNEE (generates address/QR)
  const receiveMutation = useMutation({
    mutationFn: async ({ amount }: { amount?: number }) => {
      const response = await fetch("/api/wallet/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate receive address");
      }

      return response.json();
    },
  });

  return {
    balance,
    isLoading: isLoading || isLoadingCurrentOrg,
    error,
    refresh: refetch,
    // Mutation states
    isPending: buyMutation.isPending || sellMutation.isPending || sendMutation.isPending || receiveMutation.isPending,
    // Mutation functions
    buyMnee: buyMutation.mutateAsync,
    sellMnee: sellMutation.mutateAsync,
    sendMnee: sendMutation.mutateAsync,
    receiveMnee: receiveMutation.mutateAsync,
    // Individual pending states
    isBuying: buyMutation.isPending,
    isSelling: sellMutation.isPending,
    isSending: sendMutation.isPending,
    isReceiving: receiveMutation.isPending,
    // Error states
    buyError: buyMutation.error,
    sellError: sellMutation.error,
    sendError: sendMutation.error,
    receiveError: receiveMutation.error,
  };
}
