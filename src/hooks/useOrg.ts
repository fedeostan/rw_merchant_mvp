"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { createClient } from "@/lib/supabase/client";

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface UserOrganization {
  user_id: string;
  org_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

/**
 * Hook to manage user's organization context
 * Provides access to current organization and ability to switch between organizations
 */
export function useOrg() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Fetch user's current organization from profile
  const {
    data: currentOrgId,
    isLoading: isLoadingCurrentOrg,
    error: currentOrgError,
  } = useQuery({
    queryKey: ["currentOrgId", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("current_org_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data?.current_org_id as string | null;
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch all organizations the user belongs to
  const {
    data: organizations = [],
    isLoading: isLoadingOrganizations,
    error: organizationsError,
  } = useQuery({
    queryKey: ["organizations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc("get_user_organizations");

      if (error) throw error;
      return (data || []) as Organization[];
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Get the current organization object
  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  // Mutation to switch current organization
  const switchOrganization = useMutation({
    mutationFn: async (orgId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Verify user is a member of this organization
      const isMember = organizations.some((org) => org.id === orgId);
      if (!isMember) {
        throw new Error("You are not a member of this organization");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ current_org_id: orgId })
        .eq("id", user.id);

      if (error) throw error;
      return orgId;
    },
    onSuccess: (orgId) => {
      // Invalidate current org query
      queryClient.invalidateQueries({ queryKey: ["currentOrgId", user?.id] });
      // Invalidate modules query since org changed
      queryClient.invalidateQueries({ queryKey: ["/orgs"] });
    },
  });

  // Mutation to create a new organization
  const createOrganization = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name,
          owner_id: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from("user_organizations")
        .insert({
          user_id: user.id,
          org_id: org.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      return org;
    },
    onSuccess: (org) => {
      // Invalidate organizations list
      queryClient.invalidateQueries({
        queryKey: ["organizations", user?.id],
      });

      // Automatically switch to the new organization
      switchOrganization.mutate(org.id);
    },
  });

  // Mutation to update organization name
  const updateOrganization = useMutation({
    mutationFn: async ({ orgId, name }: { orgId: string; name: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("organizations")
        .update({ name })
        .eq("id", orgId)
        .eq("owner_id", user.id); // Only owner can update

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", user?.id],
      });
    },
  });

  // Mutation to add a member to an organization
  const addMember = useMutation({
    mutationFn: async ({
      orgId,
      userId,
      role = "member",
    }: {
      orgId: string;
      userId: string;
      role?: "admin" | "member";
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase.from("user_organizations").insert({
        user_id: userId,
        org_id: orgId,
        role,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", user?.id],
      });
    },
  });

  // Mutation to remove a member from an organization
  const removeMember = useMutation({
    mutationFn: async ({
      orgId,
      userId,
    }: {
      orgId: string;
      userId: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_organizations")
        .delete()
        .eq("user_id", userId)
        .eq("org_id", orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", user?.id],
      });
    },
  });

  // Mutation to update member role
  const updateMemberRole = useMutation({
    mutationFn: async ({
      orgId,
      userId,
      role,
    }: {
      orgId: string;
      userId: string;
      role: "admin" | "member";
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_organizations")
        .update({ role })
        .eq("user_id", userId)
        .eq("org_id", orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", user?.id],
      });
    },
  });

  // Mutation to join an existing organization
  const joinOrganization = useMutation({
    mutationFn: async (orgId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Add user as member to the organization
      const { error: memberError } = await supabase
        .from("user_organizations")
        .insert({
          user_id: user.id,
          org_id: orgId,
          role: "member",
        });

      if (memberError) throw memberError;

      // Update user's current org to the one they just joined
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ current_org_id: orgId })
        .eq("id", user.id);

      if (profileError) throw profileError;

      return orgId;
    },
    onSuccess: () => {
      // Invalidate both current org and organizations list
      queryClient.invalidateQueries({ queryKey: ["currentOrgId", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["organizations", user?.id],
      });
      // Invalidate modules query since org changed
      queryClient.invalidateQueries({ queryKey: ["/orgs"] });
    },
  });

  return {
    // Current organization
    currentOrgId,
    currentOrg,
    isOwner: currentOrg?.role === "owner",
    isAdmin: currentOrg?.role === "owner" || currentOrg?.role === "admin",

    // All organizations
    organizations,

    // Loading states
    isLoading: isLoadingCurrentOrg || isLoadingOrganizations,
    isLoadingCurrentOrg,
    isLoadingOrganizations,

    // Errors
    error: currentOrgError || organizationsError,

    // Mutations
    switchOrganization: switchOrganization.mutate,
    isSwitching: switchOrganization.isPending,

    createOrganization: createOrganization.mutate,
    isCreating: createOrganization.isPending,

    joinOrganization: joinOrganization.mutate,
    isJoining: joinOrganization.isPending,

    updateOrganization: updateOrganization.mutate,
    isUpdating: updateOrganization.isPending,

    addMember: addMember.mutate,
    isAddingMember: addMember.isPending,

    removeMember: removeMember.mutate,
    isRemovingMember: removeMember.isPending,

    updateMemberRole: updateMemberRole.mutate,
    isUpdatingMemberRole: updateMemberRole.isPending,
  };
}
