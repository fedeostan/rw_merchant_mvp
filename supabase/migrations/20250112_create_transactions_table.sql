-- Migration: Create transactions table with RLS policies
-- Description: Store transaction data for organizations with row-level security
-- Date: 2025-01-12

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  storefront_id UUID NOT NULL,
  module_id UUID,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  method TEXT NOT NULL CHECK (method IN ('stablecoin', 'payout', 'adjustment')),
  display_type TEXT NOT NULL CHECK (display_type IN ('receive', 'send', 'buy', 'sell', 'swap')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'posted', 'failed')),
  customer_email TEXT,
  send_hash TEXT,
  rock_wallet_id TEXT,
  tx_hash_in TEXT,
  tx_hash_swap TEXT,
  fee_usd NUMERIC,
  customer_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_transactions_org_created
  ON public.transactions(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_storefront
  ON public.transactions(storefront_id);

CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON public.transactions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_module
  ON public.transactions(module_id)
  WHERE module_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for migration re-runs)
DROP POLICY IF EXISTS "Users can view transactions from their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Owners can delete transactions" ON public.transactions;

-- RLS Policy: SELECT - Users can view transactions from orgs they belong to
CREATE POLICY "Users can view transactions from their organizations"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = transactions.org_id
        AND user_organizations.user_id = auth.uid()
    )
  );

-- RLS Policy: INSERT - Only admins and owners can create transactions
CREATE POLICY "Admins can insert transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = transactions.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('admin', 'owner')
    )
  );

-- RLS Policy: UPDATE - Only admins and owners can update transactions
CREATE POLICY "Admins can update transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = transactions.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = transactions.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('admin', 'owner')
    )
  );

-- RLS Policy: DELETE - Only owners can delete transactions
CREATE POLICY "Owners can delete transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.org_id = transactions.org_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role = 'owner'
    )
  );

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;

-- Add helpful comment
COMMENT ON TABLE public.transactions IS 'Stores transaction records for organizations with row-level security';
