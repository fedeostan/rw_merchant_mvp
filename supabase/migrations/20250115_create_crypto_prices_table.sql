-- Create crypto_prices table for storing cryptocurrency price data
-- This table stores both real-time crypto prices (from CoinGecko) and custom prices (like MNEE)

CREATE TABLE IF NOT EXISTS public.crypto_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Coin identification
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  coin_id TEXT NOT NULL,

  -- Core price data (USD)
  price_usd NUMERIC NOT NULL,
  market_cap_usd NUMERIC,
  volume_24h_usd NUMERIC,

  -- Supply
  circulating_supply NUMERIC,
  total_supply NUMERIC,
  max_supply NUMERIC,

  -- 24h changes
  price_change_24h_usd NUMERIC,
  price_change_percentage_24h NUMERIC,
  high_24h_usd NUMERIC,
  low_24h_usd NUMERIC,

  -- Ranking
  market_cap_rank INTEGER,

  -- All-time high/low
  ath_price_usd NUMERIC,
  ath_date TIMESTAMPTZ,
  ath_change_percentage NUMERIC,
  atl_price_usd NUMERIC,
  atl_date TIMESTAMPTZ,
  atl_change_percentage NUMERIC,

  -- Metadata
  is_stablecoin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  data_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON public.crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_coin_id ON public.crypto_prices(coin_id);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_data_timestamp ON public.crypto_prices(data_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_is_active ON public.crypto_prices(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol_timestamp ON public.crypto_prices(symbol, data_timestamp DESC);

-- Create view for getting latest prices for each cryptocurrency
CREATE OR REPLACE VIEW public.crypto_prices_latest AS
SELECT DISTINCT ON (symbol)
  id,
  symbol,
  name,
  coin_id,
  price_usd,
  market_cap_usd,
  volume_24h_usd,
  circulating_supply,
  total_supply,
  max_supply,
  price_change_24h_usd,
  price_change_percentage_24h,
  high_24h_usd,
  low_24h_usd,
  market_cap_rank,
  ath_price_usd,
  ath_date,
  ath_change_percentage,
  atl_price_usd,
  atl_date,
  atl_change_percentage,
  is_stablecoin,
  is_active,
  data_timestamp,
  created_at,
  updated_at
FROM public.crypto_prices
WHERE is_active = true
ORDER BY symbol, data_timestamp DESC;

-- Add trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_crypto_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_crypto_prices_updated_at
  BEFORE UPDATE ON public.crypto_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crypto_prices_updated_at();

-- Grant appropriate permissions
-- Allow authenticated users to read crypto prices
GRANT SELECT ON public.crypto_prices TO authenticated;
GRANT SELECT ON public.crypto_prices_latest TO authenticated;

-- Allow anon users to read crypto prices (for public-facing data)
GRANT SELECT ON public.crypto_prices TO anon;
GRANT SELECT ON public.crypto_prices_latest TO anon;

-- Only service role can insert/update/delete crypto prices
GRANT ALL ON public.crypto_prices TO service_role;

-- Add RLS policies
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active crypto prices
CREATE POLICY "Anyone can read active crypto prices"
  ON public.crypto_prices
  FOR SELECT
  USING (is_active = true);

-- Policy: Only service role can insert crypto prices
CREATE POLICY "Only service role can insert crypto prices"
  ON public.crypto_prices
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Only service role can update crypto prices
CREATE POLICY "Only service role can update crypto prices"
  ON public.crypto_prices
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Policy: Only service role can delete crypto prices
CREATE POLICY "Only service role can delete crypto prices"
  ON public.crypto_prices
  FOR DELETE
  USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE public.crypto_prices IS 'Stores cryptocurrency price data from CoinGecko API and custom prices like MNEE';
COMMENT ON COLUMN public.crypto_prices.symbol IS 'Cryptocurrency symbol (e.g., BTC, ETH, MNEE)';
COMMENT ON COLUMN public.crypto_prices.coin_id IS 'CoinGecko coin ID for API queries (e.g., bitcoin, ethereum)';
COMMENT ON COLUMN public.crypto_prices.price_usd IS 'Current price in USD';
COMMENT ON COLUMN public.crypto_prices.is_stablecoin IS 'Whether this is a stablecoin (MNEE, USDT, USDC, etc.)';
COMMENT ON COLUMN public.crypto_prices.data_timestamp IS 'Timestamp when this price data was recorded';
COMMENT ON VIEW public.crypto_prices_latest IS 'View showing the most recent price for each active cryptocurrency';
