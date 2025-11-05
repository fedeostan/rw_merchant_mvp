import { z } from "zod";

export const moduleKindSchema = z.enum(["checkout", "payment_link"]);
export const moduleStatusSchema = z.enum(["active", "inactive"]);

export const moduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: moduleKindSchema,
  storefrontId: z.string(),
  codeSnippet: z.string(),
  status: moduleStatusSchema,
  imageUrl: z.string().optional(),
});

export type Module = z.infer<typeof moduleSchema>;

export const createModuleRequestSchema = z.object({
  name: z.string(),
  kind: moduleKindSchema,
  storefrontId: z.string(),
  codeSnippet: z.string(),
  imageUrl: z.string().optional(),
});

export type CreateModuleRequest = z.infer<typeof createModuleRequestSchema>;

export const updateModuleRequestSchema = z.object({
  name: z.string().optional(),
  codeSnippet: z.string().optional(),
  status: moduleStatusSchema.optional(),
  imageUrl: z.string().optional(),
});

export type UpdateModuleRequest = z.infer<typeof updateModuleRequestSchema>;


