import { z } from "zod";

export const moduleKindSchema = z.enum(["paywall", "e-commerce", "donation"]);
export type ModuleKind = z.infer<typeof moduleKindSchema>;

export const moduleStatusSchema = z.enum(["active", "inactive"]);
export type ModuleStatus = z.infer<typeof moduleStatusSchema>;

// Phase 5: Configuration schemas with enhanced validation
export const paywallConfigSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  buttonText: z.string().max(50, "Button text must be less than 50 characters").optional(),
});

export const ecommerceConfigSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(100, "Product name must be less than 100 characters"),
  productImage: z.string().url("Product image must be a valid URL").optional(),
  showQuantitySelector: z.boolean().default(false),
  collectShipping: z.boolean().default(false),
});

export const donationConfigSchema = z.object({
  organizationName: z.string().max(100, "Organization name must be less than 100 characters").optional(),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  suggestedAmounts: z.array(z.number().positive("Amounts must be positive")).min(1, "At least one suggested amount is required"),
  allowCustomAmount: z.boolean().default(true),
  collectMessage: z.boolean().optional(),
});

export const stylingConfigSchema = z.object({
  buttonText: z.string().optional(),
  primaryColor: z.string().optional(),
  buttonColor: z.string().optional(),
});

export const customFieldSchema = z.object({
  label: z.string().min(1, "Field label is required"),
  type: z.string().min(1, "Field type is required"),
  required: z.boolean().default(false),
});

export type CustomField = z.infer<typeof customFieldSchema>;

// Phase 5: Enhanced type safety with stricter validation
export const moduleConfigurationSchema = z.object({
  // Common fields with stricter validation
  amount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number with up to 2 decimal places"),
  mneeDepositAddress: z.string().min(10, "MNEE deposit address is required"),
  collectEmail: z.boolean().default(true),
  showConfetti: z.boolean().default(true),
  theme: z.enum(["light", "dark"]).default("dark"),

  // Type-specific configurations
  paywall: paywallConfigSchema.optional(),
  ecommerce: ecommerceConfigSchema.optional(),
  donation: donationConfigSchema.optional(),

  // Styling
  styling: stylingConfigSchema.optional(),

  // Custom fields for extensibility
  customFields: z.array(customFieldSchema).optional(),
}).refine(
  (data) => {
    // At least one type-specific configuration must be present
    return data.paywall || data.ecommerce || data.donation;
  },
  {
    message: "At least one module type configuration (paywall, ecommerce, or donation) must be provided",
  }
);

export type ModuleConfiguration = z.infer<typeof moduleConfigurationSchema>;
export type PaywallConfig = z.infer<typeof paywallConfigSchema>;
export type EcommerceConfig = z.infer<typeof ecommerceConfigSchema>;
export type DonationConfig = z.infer<typeof donationConfigSchema>;
export type StylingConfig = z.infer<typeof stylingConfigSchema>;

export const moduleSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  kind: moduleKindSchema,
  status: moduleStatusSchema,
  configuration: moduleConfigurationSchema,
  codeSnippet: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type Module = z.infer<typeof moduleSchema>;

export const createModuleRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  kind: moduleKindSchema,
  configuration: moduleConfigurationSchema,
  imageUrl: z.string().optional(),
});

export type CreateModuleRequest = z.infer<typeof createModuleRequestSchema>;

export const updateModuleRequestSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  configuration: moduleConfigurationSchema.optional(),
  status: moduleStatusSchema.optional(),
  imageUrl: z.string().optional(),
});

export type UpdateModuleRequest = z.infer<typeof updateModuleRequestSchema>;











