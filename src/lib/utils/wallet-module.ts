import { createClient } from "@/lib/supabase/server";

/**
 * Get or create the default "Wallet" module for an organization
 * This module is used to track wallet transactions (buy, sell, send, receive)
 */
export async function getOrCreateWalletModule(
  orgId: string
): Promise<string> {
  const supabase = await createClient();

  // Try to find existing Wallet module
  const { data: existingModule, error: findError } = await supabase
    .from("modules")
    .select("id")
    .eq("org_id", orgId)
    .eq("name", "Wallet")
    .eq("kind", "wallet")
    .single();

  if (existingModule && !findError) {
    return existingModule.id;
  }

  // Create new Wallet module
  // Note: This uses a special "wallet" kind that's not in the standard module kinds
  // The database allows any string value for kind
  const { data: newModule, error: createError } = await supabase
    .from("modules")
    .insert({
      org_id: orgId,
      name: "Wallet",
      kind: "wallet",
      status: "active",
      configuration: {
        // Minimal configuration for internal wallet module
        amount: "0",
        mneeDepositAddress: "internal-wallet",
        collectEmail: false,
        showConfetti: false,
        theme: "dark",
      },
    })
    .select("id")
    .single();

  if (createError || !newModule) {
    throw new Error(
      `Failed to create Wallet module: ${createError?.message || "Unknown error"}`
    );
  }

  return newModule.id;
}
