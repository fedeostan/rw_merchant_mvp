import { z } from "zod";

export const orgSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  kybStatus: z.enum(["approved", "pending", "rejected"]),
});

export type Org = z.infer<typeof orgSchema>;











