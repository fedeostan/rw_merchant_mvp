-- Seed initial crypto price data
-- Includes MNEE (custom stablecoin) and 4 major cryptocurrencies

INSERT INTO public.crypto_prices (
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
  data_timestamp
) VALUES
  -- MNEE (Custom Stablecoin - pegged to USD)
  (
    'MNEE',
    'MNEE',
    'mnee',
    1.0012,                          -- Slight variance from $1.00
    50000000,                        -- $50M market cap
    2500000,                         -- $2.5M daily volume
    50000000,                        -- 50M circulating
    100000000,                       -- 100M total supply
    100000000,                       -- 100M max supply
    0.0012,                          -- +$0.0012 24h change
    0.12,                            -- +0.12% 24h change
    1.0025,                          -- 24h high
    0.9988,                          -- 24h low
    NULL,                            -- Not ranked on major exchanges yet
    1.0025,                          -- ATH
    now() - interval '30 days',      -- ATH was 30 days ago
    -0.13,                           -- -0.13% from ATH
    0.9975,                          -- ATL
    now() - interval '90 days',      -- ATL was 90 days ago
    0.37,                            -- +0.37% from ATL
    true,                            -- Is stablecoin
    true,                            -- Is active
    now()                            -- Current timestamp
  ),

  -- BTC (Bitcoin)
  (
    'BTC',
    'Bitcoin',
    'bitcoin',
    69842.50,                        -- ~$70k
    1372000000000,                   -- $1.372T market cap
    28500000000,                     -- $28.5B daily volume
    19600000,                        -- 19.6M circulating
    19600000,                        -- 19.6M total supply
    21000000,                        -- 21M max supply
    1247.80,                         -- +$1,247.80 24h change
    1.82,                            -- +1.82% 24h change
    71250.00,                        -- 24h high
    68400.00,                        -- 24h low
    1,                               -- Rank #1
    73750.00,                        -- ATH (~$73,750)
    '2024-03-14 00:00:00+00',        -- March 2024 ATH
    -5.30,                           -- -5.30% from ATH
    67.81,                           -- ATL (2013)
    '2013-07-05 00:00:00+00',
    102850.00,                       -- +102,850% from ATL
    false,                           -- Not a stablecoin
    true,                            -- Is active
    now()                            -- Current timestamp
  ),

  -- ETH (Ethereum)
  (
    'ETH',
    'Ethereum',
    'ethereum',
    3542.75,                         -- ~$3.5k
    425000000000,                    -- $425B market cap
    15200000000,                     -- $15.2B daily volume
    120000000,                       -- 120M circulating
    120000000,                       -- 120M total supply (no max)
    NULL,                            -- No max supply
    52.30,                           -- +$52.30 24h change
    1.50,                            -- +1.50% 24h change
    3615.00,                         -- 24h high
    3480.00,                         -- 24h low
    2,                               -- Rank #2
    4878.26,                         -- ATH (~$4,878)
    '2021-11-10 00:00:00+00',        -- November 2021 ATH
    -27.38,                          -- -27.38% from ATH
    0.43,                            -- ATL (2015)
    '2015-10-21 00:00:00+00',
    823558.14,                       -- +823,558% from ATL
    false,                           -- Not a stablecoin
    true,                            -- Is active
    now()                            -- Current timestamp
  ),

  -- USDT (Tether)
  (
    'USDT',
    'Tether',
    'tether',
    0.9998,                          -- Slight variance from $1.00
    95000000000,                     -- $95B market cap
    48000000000,                     -- $48B daily volume (highest volume)
    95000000000,                     -- 95B circulating
    95000000000,                     -- 95B total supply
    NULL,                            -- No max supply
    -0.0002,                         -- -$0.0002 24h change
    -0.02,                           -- -0.02% 24h change
    1.0005,                          -- 24h high
    0.9992,                          -- 24h low
    3,                               -- Rank #3
    1.0032,                          -- ATH
    '2024-01-15 00:00:00+00',
    -0.34,                           -- -0.34% from ATH
    0.9972,                          -- ATL
    '2023-03-11 00:00:00+00',
    0.26,                            -- +0.26% from ATL
    true,                            -- Is stablecoin
    true,                            -- Is active
    now()                            -- Current timestamp
  ),

  -- USDC (USD Coin)
  (
    'USDC',
    'USD Coin',
    'usd-coin',
    1.0001,                          -- Slight variance from $1.00
    42000000000,                     -- $42B market cap
    6800000000,                      -- $6.8B daily volume
    42000000000,                     -- 42B circulating
    42000000000,                     -- 42B total supply
    NULL,                            -- No max supply
    0.0001,                          -- +$0.0001 24h change
    0.01,                            -- +0.01% 24h change
    1.0008,                          -- 24h high
    0.9995,                          -- 24h low
    6,                               -- Rank #6
    1.0018,                          -- ATH
    '2024-02-20 00:00:00+00',
    -0.17,                           -- -0.17% from ATH
    0.9983,                          -- ATL
    '2023-03-11 00:00:00+00',
    0.18,                            -- +0.18% from ATL
    true,                            -- Is stablecoin
    true,                            -- Is active
    now()                            -- Current timestamp
  )
ON CONFLICT DO NOTHING;

-- Add comment about seed data
COMMENT ON TABLE public.crypto_prices IS 'Stores cryptocurrency price data from CoinGecko API and custom prices like MNEE. Seeded with 5 initial cryptocurrencies: MNEE, BTC, ETH, USDT, USDC';
