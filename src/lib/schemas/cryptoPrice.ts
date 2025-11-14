import { z } from "zod";

/**
 * Full cryptocurrency price data structure
 * Matches the crypto_prices table schema
 */
export const cryptoPriceSchema = z.object({
  id: z.string().uuid(),

  // Coin identification
  symbol: z.string(),
  name: z.string(),
  coinId: z.string(),

  // Core price data (USD)
  priceUsd: z.number(),
  marketCapUsd: z.number().nullable().optional(),
  volume24hUsd: z.number().nullable().optional(),

  // Supply
  circulatingSupply: z.number().nullable().optional(),
  totalSupply: z.number().nullable().optional(),
  maxSupply: z.number().nullable().optional(),

  // 24h changes
  priceChange24hUsd: z.number().nullable().optional(),
  priceChangePercentage24h: z.number().nullable().optional(),
  high24hUsd: z.number().nullable().optional(),
  low24hUsd: z.number().nullable().optional(),

  // Ranking
  marketCapRank: z.number().nullable().optional(),

  // All-time high/low
  athPriceUsd: z.number().nullable().optional(),
  athDate: z.string().datetime().nullable().optional(),
  athChangePercentage: z.number().nullable().optional(),
  atlPriceUsd: z.number().nullable().optional(),
  atlDate: z.string().datetime().nullable().optional(),
  atlChangePercentage: z.number().nullable().optional(),

  // Metadata
  isStablecoin: z.boolean().default(false),
  isActive: z.boolean().default(true),

  // Timestamps
  dataTimestamp: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CryptoPrice = z.infer<typeof cryptoPriceSchema>;

/**
 * Simplified crypto price for API responses
 * Contains only essential price information
 */
export const cryptoPriceSimpleSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  priceUsd: z.number(),
  priceChangePercentage24h: z.number().nullable().optional(),
  isStablecoin: z.boolean().default(false),
  updatedAt: z.string().datetime(),
});

export type CryptoPriceSimple = z.infer<typeof cryptoPriceSimpleSchema>;

/**
 * Balance with USD conversion
 * Extends the base balance with price and USD value
 */
export const balanceWithUsdSchema = z.object({
  // Base balance fields
  currency: z.string(),
  available: z.number(),
  pending: z.number(),

  // USD conversion fields
  priceUsd: z.number(),
  totalUsd: z.number(),
  priceChangePercentage24h: z.number().nullable().optional(),

  // Metadata
  updatedAt: z.string().datetime(),
});

export type BalanceWithUsd = z.infer<typeof balanceWithUsdSchema>;

/**
 * Response schema for crypto prices API
 */
export const cryptoPricesResponseSchema = z.object({
  prices: z.array(cryptoPriceSimpleSchema),
});

export type CryptoPricesResponse = z.infer<typeof cryptoPricesResponseSchema>;
