-- Migration: Create Organizations and User Organizations Tables
-- Phase 3: Proper Organization Support
-- This migration creates the organization infrastructure and migrates existing user modules

-- Step 1: Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create user_organizations junction table (many-to-many)
CREATE TABLE IF NOT EXISTS user_organizations (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, org_id)
);

-- Step 3: Add current_org_id to profiles table
-- First check if the column doesn't exist to make migration idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_org_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_current_org_id ON profiles(current_org_id);

-- Step 5: Auto-update trigger for organizations.updated_at
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organizations_updated_at();

-- Step 6: RLS Policies for organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = organizations.id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Only owners can update their organizations
CREATE POLICY "Owners can update their organizations"
  ON organizations
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Only owners can delete their organizations
CREATE POLICY "Owners can delete their organizations"
  ON organizations
  FOR DELETE
  USING (owner_id = auth.uid());

-- Any authenticated user can create an organization
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Step 7: RLS Policies for user_organizations table
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Users can view their own organization memberships
CREATE POLICY "Users can view their own organization memberships"
  ON user_organizations
  FOR SELECT
  USING (user_id = auth.uid());

-- Organization owners and admins can view all members
CREATE POLICY "Org owners and admins can view members"
  ON user_organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.org_id = user_organizations.org_id
      AND uo.user_id = auth.uid()
      AND uo.role IN ('owner', 'admin')
    )
  );

-- Only owners and admins can add members
CREATE POLICY "Owners and admins can add members"
  ON user_organizations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = org_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- Only owners and admins can remove members
CREATE POLICY "Owners and admins can remove members"
  ON user_organizations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.org_id = user_organizations.org_id
      AND uo.user_id = auth.uid()
      AND uo.role IN ('owner', 'admin')
    )
  );

-- Only owners and admins can update member roles
CREATE POLICY "Owners and admins can update member roles"
  ON user_organizations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.org_id = user_organizations.org_id
      AND uo.user_id = auth.uid()
      AND uo.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.org_id = org_id
      AND uo.user_id = auth.uid()
      AND uo.role IN ('owner', 'admin')
    )
  );

-- Step 8: Update modules table RLS policies for organization-based access
-- First, drop old user-based policies
DROP POLICY IF EXISTS "Users can view their own modules" ON modules;
DROP POLICY IF EXISTS "Users can insert their own modules" ON modules;
DROP POLICY IF EXISTS "Users can update their own modules" ON modules;
DROP POLICY IF EXISTS "Users can delete their own modules" ON modules;

-- Create new organization-based policies
-- Users can view modules for organizations they belong to
CREATE POLICY "Users can view organization modules"
  ON modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = modules.org_id::uuid
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Users can insert modules for organizations they belong to
CREATE POLICY "Users can insert organization modules"
  ON modules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = org_id::uuid
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Users can update modules for organizations they belong to
CREATE POLICY "Users can update organization modules"
  ON modules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = modules.org_id::uuid
      AND user_organizations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = org_id::uuid
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Users can delete modules for organizations they belong to
CREATE POLICY "Users can delete organization modules"
  ON modules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = modules.org_id::uuid
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Step 9: Data migration - Create default organizations for existing users
-- This will create one organization per user and migrate their modules
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
BEGIN
  -- For each user in auth.users
  FOR user_record IN
    SELECT id FROM auth.users
  LOOP
    -- Create a default organization for this user
    INSERT INTO organizations (name, owner_id)
    VALUES ('My Organization', user_record.id)
    RETURNING id INTO new_org_id;

    -- Add user as owner of their organization
    INSERT INTO user_organizations (user_id, org_id, role)
    VALUES (user_record.id, new_org_id, 'owner');

    -- Update user's current_org_id in profiles
    UPDATE profiles
    SET current_org_id = new_org_id
    WHERE id = user_record.id;

    -- Update existing modules: change org_id from user.id (text) to actual org UUID
    -- Modules currently have org_id = user.id::text, we need to change to the new org UUID
    UPDATE modules
    SET org_id = new_org_id::text
    WHERE org_id = user_record.id::text;
  END LOOP;
END $$;

-- Step 10: Add helpful database functions

-- Function to get a user's current organization
CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS UUID AS $$
  SELECT current_org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(org_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND org_id = org_uuid
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is an owner or admin of an organization
CREATE OR REPLACE FUNCTION is_org_admin(org_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
    AND org_id = org_uuid
    AND role IN ('owner', 'admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  owner_id UUID,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
  SELECT o.id, o.name, o.owner_id, uo.role, o.created_at
  FROM organizations o
  JOIN user_organizations uo ON o.id = uo.org_id
  WHERE uo.user_id = auth.uid()
  ORDER BY o.created_at DESC;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE organizations IS 'Organizations that can have multiple users and modules';
COMMENT ON TABLE user_organizations IS 'Junction table for many-to-many relationship between users and organizations';
COMMENT ON COLUMN profiles.current_org_id IS 'The user''s currently selected organization (for UI context)';
COMMENT ON FUNCTION get_current_org_id() IS 'Returns the current user''s selected organization ID';
COMMENT ON FUNCTION is_org_member(UUID) IS 'Check if current user is a member of the specified organization';
COMMENT ON FUNCTION is_org_admin(UUID) IS 'Check if current user is an owner or admin of the specified organization';
COMMENT ON FUNCTION get_user_organizations() IS 'Returns all organizations the current user belongs to';
