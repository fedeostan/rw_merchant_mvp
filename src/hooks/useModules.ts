import { useGetOrgsOrgIdModules } from "@/lib/api/default/default";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useMemo } from "react";
import type { Module } from "@/lib/api/generated/schemas/module";

export function useModules() {
  const { isAuthenticated } = useAuth();
  const { currentOrgId } = useOrg();

  // Phase 3: Use organization ID from useOrg hook
  const orgId = currentOrgId || "temp";

  const query = useGetOrgsOrgIdModules(orgId, {
    query: {
      enabled: isAuthenticated && !!currentOrgId,
    },
  });

  // Create a map for quick lookups by moduleId
  const modulesMap = useMemo(() => {
    if (!query.data) return new Map<string, Module>();

    return new Map(query.data.map((module) => [module.id, module]));
  }, [query.data]);

  // Get module by ID helper
  const getModuleById = useMemo(
    () => (moduleId: string | undefined) => {
      if (!moduleId) return undefined;
      return modulesMap.get(moduleId);
    },
    [modulesMap]
  );

  return {
    modules: query.data || [],
    modulesMap,
    getModuleById,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export type UseModulesReturn = ReturnType<typeof useModules>;
