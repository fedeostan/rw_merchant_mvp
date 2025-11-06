import { useGetOrgsOrgIdModules } from "@/lib/api/default/default";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import type { Module } from "@/lib/schemas/module";

// TODO: Replace with dynamic orgId from useGetMe hook when integrated
const DEFAULT_ORG_ID = "org_1";

export function useModules() {
  const { isAuthenticated } = useAuth();

  const query = useGetOrgsOrgIdModules(DEFAULT_ORG_ID, {
    query: {
      enabled: isAuthenticated,
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
