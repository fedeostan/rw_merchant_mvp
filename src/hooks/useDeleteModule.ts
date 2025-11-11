import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { toast } from "sonner";
import { getGetOrgsOrgIdModulesQueryKey } from "@/lib/api/generated";

export function useDeleteModule() {
  const { isAuthenticated } = useAuth();
  const { currentOrgId } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      if (!isAuthenticated || !currentOrgId) {
        throw new Error("You must be authenticated and have an organization selected to delete a module");
      }

      // Phase 3: Use organization ID from useOrg hook
      const orgId = currentOrgId;

      const response = await fetch(
        `/api/orgs/${orgId}/modules/${moduleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok && response.status !== 204) {
        // Phase 5: Improved error messaging with specific guidance
        let errorMessage = "Failed to delete module";

        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          // If JSON parsing fails, provide context based on status code
          if (response.status === 404) {
            errorMessage = "Module not found. It may have already been deleted.";
          } else if (response.status === 401) {
            errorMessage = "You are not authenticated. Please log in again.";
          } else if (response.status === 403) {
            errorMessage = "You don't have permission to delete this module.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again in a moment.";
          }
        }

        throw new Error(errorMessage);
      }
    },
    // Phase 5: Add retry logic for failed operations
    retry: (failureCount, error) => {
      // Only retry on network errors or server errors, not on client errors
      const errorMessage = error.message.toLowerCase();
      const isNetworkError = errorMessage.includes("network") || errorMessage.includes("fetch");
      const isServerError = errorMessage.includes("server error");

      // Retry up to 2 times for network/server errors
      if ((isNetworkError || isServerError) && failureCount < 2) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: () => {
      if (currentOrgId) {
        queryClient.invalidateQueries({
          queryKey: getGetOrgsOrgIdModulesQueryKey(currentOrgId),
        });
      }
      toast.success("Module deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete module");
      console.error("Error deleting module:", error);
    },
  });
}
