import { z } from "zod";

export const moneyBalanceSchema = z.object({
  storefrontId: z.string().optional(),
  currency: z.string(),
  available: z.number(),
  pending: z.number(),
  updatedAt: z.string().datetime(),
});

export type MoneyBalance = z.infer<typeof moneyBalanceSchema>;





