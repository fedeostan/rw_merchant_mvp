/**
 * CoinGecko utility functions
 * Helper functions for working with CoinGecko API responses
 */

import {
  CoinGeckoSimplePrice,
  CoinGeckoDetailedCoin,
} from "@/lib/api/coingecko";
import { CryptoPriceSimple } from "@/lib/schemas/cryptoPrice";

/**
 * Convert CoinGecko simple price to our CryptoPriceSimple schema
 *
 * @param coinId - The CoinGecko coin ID
 * @param data - CoinGecko simple price response
 * @param name - Display name of the cryptocurrency
 * @param isStablecoin - Whether this is a stablecoin
 * @returns CryptoPriceSimple object
 */
export const coinGeckoToCryptoPriceSimple = (
  coinId: string,
  data: CoinGeckoSimplePrice,
  name: string,
  isStablecoin = false
): CryptoPriceSimple | null => {
  const priceData = data[coinId];
  if (!priceData) return null;

  return {
    symbol: coinId.toUpperCase(),
    name,
    priceUsd: priceData.usd,
    priceChangePercentage24h: priceData.usd_24h_change ?? null,
    isStablecoin,
    updatedAt: priceData.last_updated_at
      ? new Date(priceData.last_updated_at * 1000).toISOString()
      : new Date().toISOString(),
  };
};

/**
 * Convert CoinGecko detailed coin to our CryptoPrice schema data
 *
 * @param data - CoinGecko detailed coin response
 * @param isStablecoin - Whether this is a stablecoin
 * @returns Partial CryptoPrice object (missing id, timestamps)
 */
export const coinGeckoDetailedToCryptoPrice = (
  data: CoinGeckoDetailedCoin,
  isStablecoin = false
) => {
  const { market_data } = data;

  return {
    symbol: data.symbol.toUpperCase(),
    name: data.name,
    coinId: data.id,
    priceUsd: market_data.current_price.usd,
    marketCapUsd: market_data.market_cap.usd,
    volume24hUsd: market_data.total_volume.usd,
    circulatingSupply: market_data.circulating_supply,
    totalSupply: market_data.total_supply,
    maxSupply: market_data.max_supply,
    priceChange24hUsd: market_data.price_change_24h,
    priceChangePercentage24h: market_data.price_change_percentage_24h,
    high24hUsd: market_data.high_24h.usd,
    low24hUsd: market_data.low_24h.usd,
    marketCapRank: data.market_cap_rank,
    athPriceUsd: market_data.ath.usd,
    athDate: market_data.ath_date.usd,
    athChangePercentage: market_data.ath_change_percentage.usd,
    atlPriceUsd: market_data.atl.usd,
    atlDate: market_data.atl_date.usd,
    atlChangePercentage: market_data.atl_change_percentage.usd,
    isStablecoin,
    isActive: true,
  };
};

/**
 * Common CoinGecko coin IDs for quick reference
 */
export const COINGECKO_COIN_IDS = {
  BITCOIN: "bitcoin",
  ETHEREUM: "ethereum",
  TETHER: "tether",
  USD_COIN: "usd-coin",
  BNB: "binancecoin",
  SOLANA: "solana",
  CARDANO: "cardano",
  XRP: "ripple",
  DOGECOIN: "dogecoin",
  POLKADOT: "polkadot",
} as const;

/**
 * Map of symbols to CoinGecko IDs
 */
export const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: COINGECKO_COIN_IDS.BITCOIN,
  ETH: COINGECKO_COIN_IDS.ETHEREUM,
  USDT: COINGECKO_COIN_IDS.TETHER,
  USDC: COINGECKO_COIN_IDS.USD_COIN,
  BNB: COINGECKO_COIN_IDS.BNB,
  SOL: COINGECKO_COIN_IDS.SOLANA,
  ADA: COINGECKO_COIN_IDS.CARDANO,
  XRP: COINGECKO_COIN_IDS.XRP,
  DOGE: COINGECKO_COIN_IDS.DOGECOIN,
  DOT: COINGECKO_COIN_IDS.POLKADOT,
};

/**
 * Get CoinGecko ID from symbol
 *
 * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @returns CoinGecko ID or undefined if not found
 */
export const getCoinGeckoId = (symbol: string): string | undefined => {
  return SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()];
};
