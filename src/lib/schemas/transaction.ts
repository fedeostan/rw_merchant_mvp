import { z } from "zod";

export const transactionStatusSchema = z.enum(["pending", "posted", "failed"]);
export const transactionTypeSchema = z.enum(["in", "out"]);
export const transactionMethodSchema = z.enum([
  "stablecoin",
  "payout",
  "adjustment",
]);

export const transactionSchema = z.object({
  id: z.string(),
  storefrontId: z.string(),
  moduleId: z.string().optional(),
  type: transactionTypeSchema,
  method: transactionMethodSchema,
  amount: z.number(),
  currency: z.string(),
  status: transactionStatusSchema,
  createdAt: z.string().datetime(),
  txHashIn: z.string().optional(),
  txHashSwap: z.string().optional(),
  feeUsd: z.number().optional(),
  customerAddress: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const transactionsResponseSchema = z.object({
  items: z.array(transactionSchema),
  nextCursor: z.string().optional(),
});

export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>;

