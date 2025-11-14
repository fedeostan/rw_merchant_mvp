-- Migration: Seed test API keys for development
-- Description: Insert test API keys for the test organization
-- Date: 2025-01-14

-- Insert seed API keys for the first organization (for testing purposes)
-- Note: These are bcrypt hashes of test keys that follow the format: mnee_live_xxxxx...
-- The actual test keys for reference (DO NOT USE IN PRODUCTION):
--   1. mnee_live_test_key_1234567890abcdef1234567890abcdef (last4: cdef)
--   2. mnee_live_test_key_fedcba0987654321fedcba0987654321 (last4: 4321)
--   3. mnee_live_test_key_revoked_1234567890abcdef123456 (last4: 3456) - REVOKED

-- Create extension for generating bcrypt hashes if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.apikeys (id, org_id, key_hash, last4, name, created_at, last_used_at, active)
SELECT
  gen_random_uuid(),
  o.id,
  crypt('mnee_live_test_key_1234567890abcdef1234567890abcdef', gen_salt('bf', 10)),
  'cdef',
  'Production API',
  now() - interval '90 days',
  now() - interval '2 days',
  true
FROM public.organizations o
LIMIT 1;

INSERT INTO public.apikeys (id, org_id, key_hash, last4, name, created_at, last_used_at, active)
SELECT
  gen_random_uuid(),
  o.id,
  crypt('mnee_live_test_key_fedcba0987654321fedcba0987654321', gen_salt('bf', 10)),
  '4321',
  'Development API',
  now() - interval '60 days',
  now() - interval '5 days',
  true
FROM public.organizations o
LIMIT 1;

INSERT INTO public.apikeys (id, org_id, key_hash, last4, name, created_at, last_used_at, active)
SELECT
  gen_random_uuid(),
  o.id,
  crypt('mnee_live_test_key_revoked_1234567890abcdef123456', gen_salt('bf', 10)),
  '3456',
  'Revoked API Key',
  now() - interval '30 days',
  now() - interval '15 days',
  false
FROM public.organizations o
LIMIT 1;

-- Add comment
COMMENT ON TABLE public.apikeys IS 'API keys seeded with test data for development purposes';
