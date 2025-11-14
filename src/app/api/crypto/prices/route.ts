import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchMultipleCryptoPrices } from "@/lib/api/coingecko";
import { CryptoPriceSimple } from "@/lib/schemas/cryptoPrice";

/**
 * Symbol to CoinGecko coin_id mapping
 * Used for fetching prices from CoinGecko API
 */
const SYMBOL_TO_COIN_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  MNEE: "mnee", // Custom coin, stored in database
};

/**
 * Response cache with TTL
 */
interface CacheEntry {
  data: CryptoPriceSimple[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * GET /api/crypto/prices?symbols=MNEE,BTC,ETH
 *
 * Fetch cryptocurrency prices from either Supabase (for MNEE and other DB-stored coins)
 * or CoinGecko API (for external coins like BTC, ETH)
 *
 * Query Parameters:
 * - symbols: Comma-separated list of cryptocurrency symbols (e.g., "MNEE,BTC,ETH")
 *
 * Response:
 * - Array of crypto price objects with symbol, name, price, and 24h change
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
      return NextResponse.json(
        { error: "Missing required query parameter: symbols" },
        { status: 400 }
      );
    }

    // Parse and normalize symbols (uppercase, trim whitespace)
    const requestedSymbols = symbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (requestedSymbols.length === 0) {
      return NextResponse.json(
        { error: "No valid symbols provided" },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = requestedSymbols.sort().join(",");
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log(`[Crypto Prices API] Cache hit for ${cacheKey}`);
      return NextResponse.json({ prices: cachedEntry.data });
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Step 1: Query Supabase for prices in the database
    const { data: dbPrices, error: dbError } = await supabase
      .from("crypto_prices_latest")
      .select(
        `
        symbol,
        name,
        price_usd,
        price_change_percentage_24h,
        is_stablecoin,
        updated_at
      `
      )
      .in("symbol", requestedSymbols);

    if (dbError) {
      console.error("[Crypto Prices API] Supabase error:", dbError);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    // Map database results to our schema
    const dbResults: CryptoPriceSimple[] = (dbPrices || []).map((price) => ({
      symbol: price.symbol,
      name: price.name,
      priceUsd: Number(price.price_usd),
      priceChangePercentage24h: price.price_change_percentage_24h
        ? Number(price.price_change_percentage_24h)
        : null,
      isStablecoin: price.is_stablecoin ?? false,
      updatedAt: price.updated_at,
    }));

    const foundSymbols = new Set(dbResults.map((p) => p.symbol));

    // Step 2: Find symbols not in database
    const missingSymbols = requestedSymbols.filter(
      (symbol) => !foundSymbols.has(symbol)
    );

    let coinGeckoResults: CryptoPriceSimple[] = [];

    // Step 3: Fetch missing symbols from CoinGecko
    if (missingSymbols.length > 0) {
      // Map symbols to CoinGecko coin IDs
      const coinIds = missingSymbols
        .map((symbol) => SYMBOL_TO_COIN_ID[symbol])
        .filter((id) => id !== undefined);

      if (coinIds.length > 0) {
        try {
          console.log(
            `[Crypto Prices API] Fetching from CoinGecko: ${coinIds.join(", ")}`
          );
          const coinGeckoData = await fetchMultipleCryptoPrices(coinIds);

          // Transform CoinGecko response to our schema
          coinGeckoResults = Object.entries(coinGeckoData).map(
            ([coinId, data]) => {
              // Find the symbol for this coin_id
              const symbol = Object.entries(SYMBOL_TO_COIN_ID).find(
                ([_, id]) => id === coinId
              )?.[0];

              return {
                symbol: symbol || coinId.toUpperCase(),
                name: coinId
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" "),
                priceUsd: data.usd,
                priceChangePercentage24h: data.usd_24h_change ?? null,
                isStablecoin: ["USDT", "USDC"].includes(symbol || ""),
                updatedAt: data.last_updated_at
                  ? new Date(data.last_updated_at * 1000).toISOString()
                  : new Date().toISOString(),
              };
            }
          );
        } catch (error) {
          console.error("[Crypto Prices API] CoinGecko fetch error:", error);
          // Continue with database results only
          console.warn(
            "[Crypto Prices API] Falling back to database results only"
          );
        }
      }
    }

    // Step 4: Merge results
    const allResults = [...dbResults, ...coinGeckoResults];

    // Cache the response
    cache.set(cacheKey, {
      data: allResults,
      timestamp: Date.now(),
    });

    return NextResponse.json({ prices: allResults });
  } catch (error) {
    console.error("[Crypto Prices API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch crypto prices",
      },
      { status: 500 }
    );
  }
}
