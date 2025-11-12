-- Migration: Fix user_organizations RLS policies to use authenticated role
-- Created: 2025-01-11
-- Issue: Policies were targeting 'public' role but authenticated users have 'authenticated' role

-- Drop all existing policies on user_organizations table
DROP POLICY IF EXISTS "Users can view their own organization memberships" ON user_organizations;
DROP POLICY IF EXISTS "Users can view their own memberships" ON user_organizations;
DROP POLICY IF EXISTS "Owners and admins can view org members" ON user_organizations;
DROP POLICY IF EXISTS "Users can manage organization memberships" ON user_organizations;
DROP POLICY IF EXISTS "Owners and admins can update members" ON user_organizations;
DROP POLICY IF EXISTS "Owners and admins can delete members" ON user_organizations;

-- Recreate policies targeting the correct 'authenticated' role

-- SELECT policies
CREATE POLICY "Users can view their own memberships"
  ON user_organizations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Owners and admins can view org members"
  ON user_organizations
  FOR SELECT
  TO authenticated
  USING (is_org_owner_or_admin(org_id));

-- INSERT policy
CREATE POLICY "Users can manage organization memberships"
  ON user_organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: User is an owner/admin of the org and adding someone else
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = org_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
    -- Case 2: User is adding themselves (as member or owner)
    OR (
      user_id = auth.uid()
      AND (
        role = 'member'  -- Can always join as member
        OR (
          role = 'owner'  -- Can add as owner only if they own the org
          AND EXISTS (
            SELECT 1 FROM organizations
            WHERE organizations.id = org_id
            AND organizations.owner_id = auth.uid()
          )
        )
      )
    )
  );

-- UPDATE policy
CREATE POLICY "Owners and admins can update members"
  ON user_organizations
  FOR UPDATE
  TO authenticated
  USING (is_org_owner_or_admin(org_id))
  WITH CHECK (is_org_owner_or_admin(org_id));

-- DELETE policy
CREATE POLICY "Owners and admins can delete members"
  ON user_organizations
  FOR DELETE
  TO authenticated
  USING (is_org_owner_or_admin(org_id));
