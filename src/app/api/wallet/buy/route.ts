import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { getOrCreateWalletModule } from "@/lib/utils/wallet-module";
import type { Transaction } from "@/lib/schemas/transaction";

// Request body validation schema
const buyMneeRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

/**
 * POST /api/wallet/buy
 * Buy MNEE and create an incoming transaction
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current organization
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("current_org_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.current_org_id) {
      return NextResponse.json(
        { error: "No active organization found" },
        { status: 400 }
      );
    }

    const orgId = profile.current_org_id;

    // Verify user is a member of the organization
    const { data: isMember, error: membershipError } = await supabase.rpc(
      "is_org_member",
      { org_uuid: orgId }
    );

    if (membershipError || !isMember) {
      return NextResponse.json(
        { error: "You do not have access to this organization" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = buyMneeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { amount, paymentMethod } = validationResult.data;

    // Get or create the default Wallet module
    const walletModuleId = await getOrCreateWalletModule(orgId);

    // Generate mock blockchain hash (realistic format)
    // Ethereum transaction hash format: 0x + 64 hex characters
    const txHashIn = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    // Create transaction in database
    const { data: newTransaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        org_id: orgId,
        module_id: walletModuleId,
        type: "in",
        method: "card",
        display_type: "buy",
        status: "posted",
        amount,
        currency: "MNEE",
        tx_hash_in: txHashIn,
      })
      .select()
      .single();

    if (transactionError || !newTransaction) {
      console.error("Error creating transaction:", transactionError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    // Transform database row to Transaction type
    const transaction: Transaction = {
      id: newTransaction.id,
      moduleId: newTransaction.module_id,
      type: newTransaction.type as "in" | "out",
      method: newTransaction.method as
        | "stablecoin"
        | "payout"
        | "adjustment"
        | "card"
        | "bank"
        | "transfer",
      displayType: newTransaction.display_type as
        | "receive"
        | "send"
        | "buy"
        | "sell"
        | "swap",
      amount: parseFloat(newTransaction.amount.toString()),
      currency: newTransaction.currency,
      status: newTransaction.status as "pending" | "posted" | "failed",
      createdAt: newTransaction.created_at,
      txHashIn: newTransaction.tx_hash_in || undefined,
      txHashSwap: newTransaction.tx_hash_swap || undefined,
      feeUsd: newTransaction.fee_usd
        ? parseFloat(newTransaction.fee_usd.toString())
        : undefined,
      customerAddress: newTransaction.customer_address || undefined,
      customerEmail: newTransaction.customer_email || undefined,
      sendHash: newTransaction.send_hash || undefined,
      rockWalletId: newTransaction.rock_wallet_id || undefined,
    };

    return NextResponse.json(
      {
        success: true,
        transactionId: transaction.id,
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/wallet/buy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
