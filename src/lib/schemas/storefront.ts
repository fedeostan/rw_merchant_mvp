import { z } from "zod";

export const storefrontSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["CRYPTO", "USD_BANK"]),
  currency: z.string(),
  address: z.string().optional(),
});

export type Storefront = z.infer<typeof storefrontSchema>;





