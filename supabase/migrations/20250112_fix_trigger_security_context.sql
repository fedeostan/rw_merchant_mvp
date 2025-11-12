-- Migration: Fix trigger to work with RLS by removing SECURITY DEFINER
-- Created: 2025-01-12
-- Issue: SECURITY DEFINER on trigger function may interfere with auth.uid() access
-- Solution: Change trigger function to SECURITY INVOKER (default)

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS set_organization_owner_trigger ON organizations;
DROP FUNCTION IF EXISTS set_organization_owner();

-- Recreate trigger function WITHOUT SECURITY DEFINER
-- This ensures auth.uid() is evaluated in the correct security context
CREATE OR REPLACE FUNCTION set_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Set owner_id to the current authenticated user
  -- Without SECURITY DEFINER, this runs in the caller's context
  -- which has access to the JWT claims via auth.uid()
  NEW.owner_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; -- No SECURITY DEFINER here!

-- Recreate trigger
CREATE TRIGGER set_organization_owner_trigger
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_owner();

-- Add comment explaining the security context
COMMENT ON FUNCTION set_organization_owner() IS
  'Automatically sets owner_id to auth.uid() when creating a new organization. Uses SECURITY INVOKER (default) to ensure access to JWT claims.';
