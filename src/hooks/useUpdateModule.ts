import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { toast } from "sonner";
import type { ModuleConfiguration } from "@/lib/schemas/module";
import { getGetOrgsOrgIdModulesQueryKey } from "@/lib/api/generated";

interface UpdateModuleData {
  moduleId: string;
  name?: string;
  configuration?: ModuleConfiguration;
  status?: "active" | "inactive";
  imageUrl?: string;
}

export function useUpdateModule() {
  const { isAuthenticated } = useAuth();
  const { currentOrgId } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, ...data }: UpdateModuleData) => {
      if (!isAuthenticated || !currentOrgId) {
        throw new Error("You must be authenticated and have an organization selected to update a module");
      }

      // Phase 3: Use organization ID from useOrg hook
      const orgId = currentOrgId;

      const response = await fetch(
        `/api/orgs/${orgId}/modules/${moduleId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        // Phase 5: Improved error messaging with specific guidance
        let errorMessage = "Failed to update module";

        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          // If JSON parsing fails, provide context based on status code
          if (response.status === 404) {
            errorMessage = "Module not found. It may have been deleted.";
          } else if (response.status === 401) {
            errorMessage = "You are not authenticated. Please log in again.";
          } else if (response.status === 403) {
            errorMessage = "You don't have permission to update this module.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again in a moment.";
          } else if (response.status === 400) {
            errorMessage = "Invalid module configuration. Please check your settings.";
          }
        }

        throw new Error(errorMessage);
      }

      return response.json();
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
      toast.success("Module updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update module");
      console.error("Error updating module:", error);
    },
  });
}
