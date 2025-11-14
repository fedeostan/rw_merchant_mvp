import { z } from "zod";

export const moneyBalanceSchema = z.object({
  currency: z.string(),
  available: z.number(),
  pending: z.number(),
  priceUsd: z.number(),
  totalUsd: z.number(),
  priceChangePercentage24h: z.number().nullable(),
  updatedAt: z.string().datetime(),
});

export type MoneyBalance = z.infer<typeof moneyBalanceSchema>;










