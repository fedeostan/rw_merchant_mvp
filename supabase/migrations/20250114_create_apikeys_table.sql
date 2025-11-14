-- Migration: Create apikeys table with RLS policies
-- Description: Store API keys for organizations with secure hashing and row-level security
-- Date: 2025-01-14

-- Create apikeys table
CREATE TABLE IF NOT EXISTS public.apikeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  last4 TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Create index for efficient querying by org_id
CREATE INDEX IF NOT EXISTS idx_apikeys_org_id
  ON public.apikeys(org_id);

-- Create index for active keys lookup
CREATE INDEX IF NOT EXISTS idx_apikeys_active
  ON public.apikeys(active)
  WHERE active = true;

-- Enable Row Level Security
ALTER TABLE public.apikeys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for migration re-runs)
DROP POLICY IF EXISTS "Members can view API keys from their organizations" ON public.apikeys;
DROP POLICY IF EXISTS "Admins can insert API keys" ON public.apikeys;
DROP POLICY IF EXISTS "Admins can delete API keys" ON public.apikeys;

-- RLS Policy: SELECT - Members can view API keys from orgs they belong to
CREATE POLICY "Members can view API keys from their organizations"
  ON public.apikeys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = apikeys.org_id
        AND user_organizations.user_id = auth.uid()
    )
  );

-- RLS Policy: INSERT - Only admins and owners can create API keys
CREATE POLICY "Admins can insert API keys"
  ON public.apikeys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = apikeys.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('admin', 'owner')
    )
  );

-- RLS Policy: UPDATE - Only admins and owners can update API keys (for revoking)
CREATE POLICY "Admins can update API keys"
  ON public.apikeys
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = apikeys.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = apikeys.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('admin', 'owner')
    )
  );

-- RLS Policy: DELETE - Only admins and owners can delete API keys
CREATE POLICY "Admins can delete API keys"
  ON public.apikeys
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = apikeys.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('admin', 'owner')
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apikeys TO authenticated;

-- Add helpful comment
COMMENT ON TABLE public.apikeys IS 'Stores API keys for organizations with secure hashing and row-level security';
COMMENT ON COLUMN public.apikeys.key_hash IS 'Bcrypt hash of the full API key - never return this in API responses';
COMMENT ON COLUMN public.apikeys.last4 IS 'Last 4 characters of the API key for display purposes';
COMMENT ON COLUMN public.apikeys.name IS 'Optional label for the API key (e.g., "Production API", "Development")';
COMMENT ON COLUMN public.apikeys.last_used_at IS 'Timestamp of when the API key was last used for authentication';
