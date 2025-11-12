-- Migration: Fix organizations RLS by using trigger to auto-set owner_id
-- Created: 2025-01-11
-- Issue: RLS policy on organizations table blocks INSERTs during signup
-- Solution: Use trigger to auto-set owner_id = auth.uid() and simplify RLS policy

-- Step 1: Create trigger function to auto-set owner_id
CREATE OR REPLACE FUNCTION set_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set owner_id to the current authenticated user
  NEW.owner_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Step 3: Create simplified INSERT policy
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Step 4: Add trigger to auto-set owner_id on INSERT
DROP TRIGGER IF EXISTS set_organization_owner_trigger ON organizations;
CREATE TRIGGER set_organization_owner_trigger
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_owner();

-- Add comments for documentation
COMMENT ON FUNCTION set_organization_owner() IS
  'Automatically sets owner_id to auth.uid() when creating a new organization. This ensures consistency and prevents client-side manipulation.';

COMMENT ON POLICY "Authenticated users can create organizations" ON organizations IS
  'Allows any authenticated user to create an organization. The owner_id is automatically set via trigger to auth.uid().';
