/**
 * CoinGecko API Integration
 *
 * Free tier rate limits: 30 calls/min, 10,000 calls/month
 * Implements 1-minute cache to stay within rate limits
 */

import axios from "axios";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get data from cache if available and not expired
 */
const getFromCache = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
};

/**
 * Store data in cache
 */
const setCache = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * CoinGecko API response types
 */
export interface CoinGeckoSimplePrice {
  [coinId: string]: {
    usd: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  };
}

export interface CoinGeckoDetailedCoin {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    price_change_24h: number;
    price_change_percentage_24h: number;
    high_24h: {
      usd: number;
    };
    low_24h: {
      usd: number;
    };
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
    ath: {
      usd: number;
    };
    ath_date: {
      usd: string;
    };
    ath_change_percentage: {
      usd: number;
    };
    atl: {
      usd: number;
    };
    atl_date: {
      usd: string;
    };
    atl_change_percentage: {
      usd: number;
    };
  };
  market_cap_rank: number | null;
}

export interface CoinGeckoPriceHistory {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

/**
 * Make a request to CoinGecko API with error handling and caching
 */
const coinGeckoRequest = async <T>(
  endpoint: string,
  useCache = true
): Promise<T> => {
  const cacheKey = endpoint;

  // Check cache first
  if (useCache) {
    const cached = getFromCache<T>(cacheKey);
    if (cached) {
      console.log(`[CoinGecko] Cache hit for ${endpoint}`);
      return cached;
    }
  }

  try {
    const apiKey = process.env.COINGECKO_API_KEY;

    console.log(`[CoinGecko] Fetching ${endpoint}`);

    const response = await axios.get<T>(`${COINGECKO_API_BASE}${endpoint}`, {
      headers: apiKey
        ? {
            "x-cg-demo-api-key": apiKey,
          }
        : {},
      timeout: 10000, // 10 second timeout
    });

    // Cache the response
    if (useCache) {
      setCache(cacheKey, response.data);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle rate limit errors (429)
      if (error.response?.status === 429) {
        console.warn("[CoinGecko] Rate limit exceeded, attempting to use cached data");
        const cached = getFromCache<T>(cacheKey);
        if (cached) {
          console.log("[CoinGecko] Returning stale cached data due to rate limit");
          return cached;
        }
        throw new Error("CoinGecko rate limit exceeded and no cached data available");
      }

      // Handle other API errors
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;
      throw new Error(`CoinGecko API error (${status}): ${message}`);
    }

    throw error;
  }
};

/**
 * Fetch price data for a single cryptocurrency
 *
 * @param coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @returns Simple price data
 *
 * @example
 * const btcPrice = await fetchCryptoPrice('bitcoin');
 * console.log(btcPrice.bitcoin.usd); // 70000
 */
export const fetchCryptoPrice = async (
  coinId: string
): Promise<CoinGeckoSimplePrice> => {
  const endpoint = `/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
  return coinGeckoRequest<CoinGeckoSimplePrice>(endpoint);
};

/**
 * Fetch price data for multiple cryptocurrencies
 *
 * @param coinIds - Array of CoinGecko coin IDs
 * @returns Price data for all requested coins
 *
 * @example
 * const prices = await fetchMultipleCryptoPrices(['bitcoin', 'ethereum']);
 * console.log(prices.bitcoin.usd); // 70000
 * console.log(prices.ethereum.usd); // 3500
 */
export const fetchMultipleCryptoPrices = async (
  coinIds: string[]
): Promise<CoinGeckoSimplePrice> => {
  const ids = coinIds.join(",");
  const endpoint = `/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
  return coinGeckoRequest<CoinGeckoSimplePrice>(endpoint);
};

/**
 * Fetch detailed coin data including ATH/ATL and supply information
 *
 * @param coinId - CoinGecko coin ID
 * @returns Detailed coin data
 *
 * @example
 * const btcDetails = await fetchCoinDetails('bitcoin');
 * console.log(btcDetails.market_data.ath.usd); // 73750
 */
export const fetchCoinDetails = async (
  coinId: string
): Promise<CoinGeckoDetailedCoin> => {
  const endpoint = `/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
  return coinGeckoRequest<CoinGeckoDetailedCoin>(endpoint);
};

/**
 * Fetch historical price data for charts
 *
 * @param coinId - CoinGecko coin ID
 * @param days - Number of days of history (1, 7, 14, 30, 90, 180, 365, max)
 * @returns Historical price, market cap, and volume data
 *
 * @example
 * const history = await fetchPriceHistory('bitcoin', 7);
 * console.log(history.prices); // [[timestamp, price], ...]
 */
export const fetchPriceHistory = async (
  coinId: string,
  days: number | "max" = 7
): Promise<CoinGeckoPriceHistory> => {
  const endpoint = `/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  return coinGeckoRequest<CoinGeckoPriceHistory>(endpoint);
};

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export const clearCache = (): void => {
  cache.clear();
  console.log("[CoinGecko] Cache cleared");
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  const entries = Array.from(cache.entries());

  return {
    size: cache.size,
    entries: entries.map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      expired: now - entry.timestamp > CACHE_TTL,
    })),
  };
};
