import { z } from "zod";

export const apiKeySchema = z.object({
  id: z.string(),
  last4: z.string(),
  createdAt: z.string().datetime(),
  active: z.boolean(),
});

export type ApiKey = z.infer<typeof apiKeySchema>;

export const apiKeysResponseSchema = z.object({
  items: z.array(apiKeySchema),
});

export type ApiKeysResponse = z.infer<typeof apiKeysResponseSchema>;



