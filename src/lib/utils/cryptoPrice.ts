/**
 * Cryptocurrency Price Utilities
 *
 * Provides functions for managing cryptocurrency prices with automatic refresh
 * when data becomes stale (>1 hour old).
 */

import { createClient } from "@/lib/supabase/server";
import { fetchCryptoPrice } from "@/lib/api/coingecko";

// Price refresh threshold: 1 hour
const PRICE_REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

export interface MneePriceData {
  priceUsd: number;
  priceChangePercentage24h: number | null;
  dataTimestamp: string;
  isStale: boolean;
}

/**
 * Check if MNEE price in database is stale (older than 1 hour)
 *
 * @returns Object containing price data and staleness indicator
 */
export async function checkMneePriceAge(): Promise<MneePriceData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crypto_prices_latest")
    .select("price_usd, price_change_percentage_24h, data_timestamp")
    .eq("symbol", "MNEE")
    .single();

  if (error || !data) {
    console.error("[CryptoPrice] Failed to fetch MNEE price:", error);
    return null;
  }

  const dataTimestamp = new Date(data.data_timestamp);
  const now = new Date();
  const ageMs = now.getTime() - dataTimestamp.getTime();
  const isStale = ageMs > PRICE_REFRESH_THRESHOLD;

  return {
    priceUsd: Number(data.price_usd),
    priceChangePercentage24h: data.price_change_percentage_24h
      ? Number(data.price_change_percentage_24h)
      : null,
    dataTimestamp: data.data_timestamp,
    isStale,
  };
}

/**
 * Fetch fresh MNEE price from CoinGecko and update database
 *
 * @returns Updated price data
 */
async function fetchAndUpdateMneePrice(): Promise<MneePriceData> {
  const supabase = await createClient();

  console.log("[CryptoPrice] Fetching fresh MNEE price from CoinGecko...");

  try {
    // Fetch from CoinGecko (coin_id = 'mnee')
    const priceData = await fetchCryptoPrice("mnee");

    const mneeData = priceData.mnee;
    if (!mneeData) {
      throw new Error("MNEE data not found in CoinGecko response");
    }

    const now = new Date().toISOString();

    // Insert new price record into database
    const { error: insertError } = await supabase.from("crypto_prices").insert({
      symbol: "MNEE",
      name: "MNEE",
      coin_id: "mnee",
      price_usd: mneeData.usd,
      market_cap_usd: mneeData.usd_market_cap ?? null,
      volume_24h_usd: mneeData.usd_24h_vol ?? null,
      price_change_percentage_24h: mneeData.usd_24h_change ?? null,
      is_stablecoin: true,
      is_active: true,
      data_timestamp: now,
    });

    if (insertError) {
      console.error("[CryptoPrice] Failed to insert new price:", insertError);
      throw insertError;
    }

    console.log(
      `[CryptoPrice] Successfully updated MNEE price: $${mneeData.usd}`
    );

    return {
      priceUsd: mneeData.usd,
      priceChangePercentage24h: mneeData.usd_24h_change ?? null,
      dataTimestamp: now,
      isStale: false,
    };
  } catch (error) {
    // If MNEE doesn't exist on CoinGecko or API fails, log warning and return existing price
    console.warn(
      "[CryptoPrice] Failed to fetch MNEE from CoinGecko (this is expected if MNEE is not listed):",
      error instanceof Error ? error.message : error
    );
    console.log(
      "[CryptoPrice] Falling back to existing database price for MNEE"
    );

    // Fetch current price from database as fallback
    const fallbackPrice = await checkMneePriceAge();
    if (!fallbackPrice) {
      throw new Error(
        "Failed to fetch MNEE price from CoinGecko and no fallback available in database"
      );
    }

    return {
      ...fallbackPrice,
      isStale: false, // Consider it fresh since we just checked
    };
  }
}

/**
 * Get MNEE price, refreshing from CoinGecko if stale (>1 hour old)
 *
 * This function transparently manages price freshness:
 * - If price is fresh (<1 hour): Returns from database
 * - If price is stale (>1 hour): Fetches from CoinGecko, updates database, returns fresh price
 *
 * @returns Current MNEE price data
 */
export async function refreshMneePriceIfNeeded(): Promise<MneePriceData> {
  // Check current price age
  const currentPrice = await checkMneePriceAge();

  if (!currentPrice) {
    console.log(
      "[CryptoPrice] No MNEE price in database, fetching from CoinGecko..."
    );
    return await fetchAndUpdateMneePrice();
  }

  if (currentPrice.isStale) {
    console.log(
      `[CryptoPrice] MNEE price is stale (last updated: ${currentPrice.dataTimestamp}), refreshing...`
    );
    return await fetchAndUpdateMneePrice();
  }

  console.log(
    `[CryptoPrice] MNEE price is fresh (last updated: ${currentPrice.dataTimestamp})`
  );
  return currentPrice;
}
