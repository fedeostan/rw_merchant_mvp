-- Migration: Fix Modules Schema
-- This migration:
-- 1. Changes modules.org_id from TEXT to UUID for type safety
-- 2. Removes storefront_id column (no longer needed)
-- 3. Updates RLS policies to remove ::uuid casts
-- 4. Adds proper foreign key constraint for org_id

-- Step 1: Drop the old index on org_id (TEXT)
DROP INDEX IF EXISTS idx_modules_org_id;

-- Step 2: Drop the storefront_id index (will be removed)
DROP INDEX IF EXISTS idx_modules_storefront_id;

-- Step 3: Add new org_id column as UUID (temporary column)
ALTER TABLE modules ADD COLUMN org_id_new UUID;

-- Step 4: Migrate data from TEXT org_id to UUID org_id_new
UPDATE modules
SET org_id_new = org_id::uuid
WHERE org_id IS NOT NULL;

-- Step 5: Drop the old org_id column
ALTER TABLE modules DROP COLUMN org_id;

-- Step 6: Rename org_id_new to org_id
ALTER TABLE modules RENAME COLUMN org_id_new TO org_id;

-- Step 7: Set org_id as NOT NULL
ALTER TABLE modules ALTER COLUMN org_id SET NOT NULL;

-- Step 8: Add foreign key constraint to organizations table
ALTER TABLE modules
  ADD CONSTRAINT fk_modules_org_id
  FOREIGN KEY (org_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE;

-- Step 9: Drop the storefront_id column (no longer needed)
ALTER TABLE modules DROP COLUMN IF EXISTS storefront_id;

-- Step 10: Create new index on org_id (now UUID)
CREATE INDEX idx_modules_org_id ON modules(org_id);

-- Step 11: Drop old RLS policies (they have ::uuid casts)
DROP POLICY IF EXISTS "Users can view organization modules" ON modules;
DROP POLICY IF EXISTS "Users can insert organization modules" ON modules;
DROP POLICY IF EXISTS "Users can update organization modules" ON modules;
DROP POLICY IF EXISTS "Users can delete organization modules" ON modules;

-- Step 12: Create new RLS policies without casts (org_id is now UUID)
-- Users can view modules for organizations they belong to
CREATE POLICY "Users can view organization modules"
  ON modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = modules.org_id
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
      WHERE user_organizations.org_id = org_id
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
      WHERE user_organizations.org_id = modules.org_id
      AND user_organizations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.org_id = org_id
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
      WHERE user_organizations.org_id = modules.org_id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Step 13: Update comments to reflect new schema
COMMENT ON COLUMN modules.org_id IS 'Organization that owns this module (UUID foreign key to organizations.id)';
COMMENT ON TABLE modules IS 'Stores merchant payment modules (paywall, e-commerce, donation) with their configurations. Each module belongs to an organization.';
