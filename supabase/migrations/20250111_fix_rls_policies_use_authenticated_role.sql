-- Migration: Fix RLS policies to use authenticated role instead of public
-- Created: 2025-01-11
-- Issue: Policies were targeting 'public' role but authenticated users have 'authenticated' role
-- This is THE ROOT CAUSE of all RLS failures

-- Drop all existing policies on organizations table
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can delete their organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Recreate policies targeting the correct 'authenticated' role

-- SELECT policy: Users can view organizations they belong to
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  TO authenticated  -- CRITICAL: Use authenticated role, not public
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = organizations.id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- INSERT policy: Any authenticated user can create an organization
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated  -- CRITICAL: Use authenticated role, not public
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE policy: Only owners can update their organizations
CREATE POLICY "Owners can update their organizations"
  ON organizations
  FOR UPDATE
  TO authenticated  -- CRITICAL: Use authenticated role, not public
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE policy: Only owners can delete their organizations
CREATE POLICY "Owners can delete their organizations"
  ON organizations
  FOR DELETE
  TO authenticated  -- CRITICAL: Use authenticated role, not public
  USING (owner_id = auth.uid());

COMMENT ON POLICY "Authenticated users can create organizations" ON organizations IS
  'Allows authenticated users to create organizations. The owner_id is automatically set via the set_organization_owner trigger. This policy correctly targets the authenticated role.';
