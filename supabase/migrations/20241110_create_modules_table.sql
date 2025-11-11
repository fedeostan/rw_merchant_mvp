-- Create modules table for storing merchant payment modules (paywall, e-commerce, donation)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL,
  storefront_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('paywall', 'e-commerce', 'donation')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  configuration JSONB NOT NULL DEFAULT '{}',
  code_snippet TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_modules_org_id ON modules(org_id);
CREATE INDEX IF NOT EXISTS idx_modules_storefront_id ON modules(storefront_id);
CREATE INDEX IF NOT EXISTS idx_modules_kind ON modules(kind);
CREATE INDEX IF NOT EXISTS idx_modules_status ON modules(status);
CREATE INDEX IF NOT EXISTS idx_modules_created_at ON modules(created_at DESC);

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view modules from their own organization
-- Note: This assumes there's a way to identify the user's org_id from auth.jwt()
-- You may need to adjust this based on your auth setup
CREATE POLICY "Users can view modules from their organization"
  ON modules
  FOR SELECT
  USING (
    -- Allow if the user's org_id matches the module's org_id
    -- This assumes auth.jwt() has a claim with org_id
    -- Adjust this based on your actual auth structure
    org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')
  );

-- RLS Policy: Users can insert modules to their own organization
CREATE POLICY "Users can insert modules to their organization"
  ON modules
  FOR INSERT
  WITH CHECK (
    org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')
  );

-- RLS Policy: Users can update modules from their own organization
CREATE POLICY "Users can update modules from their organization"
  ON modules
  FOR UPDATE
  USING (
    org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')
  )
  WITH CHECK (
    org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')
  );

-- RLS Policy: Users can delete modules from their own organization
CREATE POLICY "Users can delete modules from their organization"
  ON modules
  FOR DELETE
  USING (
    org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')
  );

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
CREATE TRIGGER trigger_update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_modules_updated_at();

-- Add comments for documentation
COMMENT ON TABLE modules IS 'Stores merchant payment modules (paywall, e-commerce, donation) with their configurations';
COMMENT ON COLUMN modules.id IS 'Unique identifier for the module';
COMMENT ON COLUMN modules.org_id IS 'Organization that owns this module';
COMMENT ON COLUMN modules.storefront_id IS 'Storefront/wallet associated with this module';
COMMENT ON COLUMN modules.name IS 'Display name of the module';
COMMENT ON COLUMN modules.kind IS 'Type of module: paywall, e-commerce, or donation';
COMMENT ON COLUMN modules.status IS 'Module status: active or inactive';
COMMENT ON COLUMN modules.configuration IS 'JSON configuration specific to module type (amounts, titles, descriptions, etc.)';
COMMENT ON COLUMN modules.code_snippet IS 'Generated React component code for embedding';
COMMENT ON COLUMN modules.image_url IS 'Optional image URL for e-commerce products';
