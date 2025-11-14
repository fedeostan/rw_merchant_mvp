import { useGetOrgsOrgIdApikeys, usePostOrgsOrgIdApikeys } from "@/lib/api/default/default";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useQueryClient } from "@tanstack/react-query";
import type { PostOrgsOrgIdApikeysBody } from "@/lib/api/generated/schemas";

export function useApiKeys() {
  const { isAuthenticated } = useAuth();
  const { currentOrgId } = useOrg();
  const queryClient = useQueryClient();

  // Use organization ID from useOrg hook
  const orgId = currentOrgId || "temp";

  // Fetch API keys
  const {
    data: apiKeysResponse,
    isLoading,
    isError,
    error,
  } = useGetOrgsOrgIdApikeys(orgId, {
    query: {
      enabled: isAuthenticated && !!currentOrgId,
    },
  });

  const apiKeys = apiKeysResponse?.items || [];

  // Create API key mutation
  const createApiKeyMutation = usePostOrgsOrgIdApikeys({
    mutation: {
      onSuccess: () => {
        // Invalidate the API keys query to refetch the list
        queryClient.invalidateQueries({
          queryKey: [`/orgs/${orgId}/apikeys`]
        });
      },
    },
  });

  // Delete API key (manual fetch since it's not in generated client)
  const deleteApiKey = async (keyId: string) => {
    const response = await fetch(`/api/orgs/${orgId}/apikeys/${keyId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to revoke API key");
    }

    // Invalidate the API keys query to refetch the list
    await queryClient.invalidateQueries({
      queryKey: [`/orgs/${orgId}/apikeys`]
    });

    return response.json();
  };

  const createApiKey = async (data: PostOrgsOrgIdApikeysBody) => {
    return createApiKeyMutation.mutateAsync({ orgId, data });
  };

  return {
    apiKeys,
    isLoading,
    isError,
    error,
    createApiKey,
    deleteApiKey,
    isCreating: createApiKeyMutation.isPending,
  };
}
