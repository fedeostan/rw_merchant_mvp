-- Migration: Fix user_organizations RLS to allow self-signup as owner
-- Created: 2025-01-11
-- Issue: Users cannot create new organizations and add themselves as owner during signup
-- Description: Updates the INSERT policy to allow users to add themselves as owner when creating a new org

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Owners/admins can add members or users can join as member" ON user_organizations;

-- Create new INSERT policy that allows:
-- 1. Existing owners/admins to add members
-- 2. Users to add themselves as member (joining existing org)
-- 3. Users to add themselves as owner (creating new org)
CREATE POLICY "Users can manage organization memberships"
  ON user_organizations
  FOR INSERT
  WITH CHECK (
    -- Case 1: User is an owner/admin of the org and adding someone else
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = org_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
    -- Case 2: User is adding themselves (as member or owner)
    -- They can only add themselves as owner if they own the organization
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

-- Add comment for documentation
COMMENT ON POLICY "Users can manage organization memberships"
  ON user_organizations IS
  'Allows organization owners/admins to add members, allows users to join organizations as members, and allows users to add themselves as owner when they create a new organization. Security: Users can only add themselves as owner if they own the organization (organizations.owner_id = auth.uid()).';
