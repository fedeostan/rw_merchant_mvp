import { z } from "zod";

/**
 * Schema for API key list response (what users see after creation)
 * IMPORTANT: Never includes the full key or key_hash - only metadata
 */
export const apiKeySchema = z.object({
  id: z.string().uuid(),
  last4: z.string().length(4),
  name: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().nullable().optional(),
  active: z.boolean(),
});

export type ApiKey = z.infer<typeof apiKeySchema>;

/**
 * Schema for listing multiple API keys
 */
export const apiKeysResponseSchema = z.object({
  items: z.array(apiKeySchema),
});

export type ApiKeysResponse = z.infer<typeof apiKeysResponseSchema>;

/**
 * Schema for creating a new API key
 * Optional name field for labeling keys (e.g., "Production API", "Development")
 */
export const createApiKeyRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type CreateApiKeyRequest = z.infer<typeof createApiKeyRequestSchema>;

/**
 * Schema for the response when creating a new API key
 * CRITICAL: This is the ONLY time the full key is returned
 * The full key must be shown to the user immediately and never stored
 */
export const createApiKeyResponseSchema = z.object({
  id: z.string().uuid(),
  key: z.string().regex(/^mnee_live_[a-zA-Z0-9]{32}$/), // Full API key format: mnee_live_<32 chars>
  last4: z.string().length(4),
  name: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  active: z.boolean(),
});

export type CreateApiKeyResponse = z.infer<typeof createApiKeyResponseSchema>;











