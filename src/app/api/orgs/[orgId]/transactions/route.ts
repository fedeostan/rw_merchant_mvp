import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Transaction } from "@/lib/schemas/transaction";

/**
 * GET /api/orgs/[orgId]/transactions
 * List all transactions for an organization with optional filtering and pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
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

    const { orgId } = await params;

    // Verify user is a member of the requested organization
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100
    );

    // Validate filter values
    if (type && !["in", "out"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type filter. Must be 'in' or 'out'" },
        { status: 400 }
      );
    }

    if (status && !["pending", "posted", "failed"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status filter. Must be 'pending', 'posted', or 'failed'",
        },
        { status: 400 }
      );
    }

    // Build query with filters
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(limit + 1); // Fetch one extra to determine if there's a next page

    // Apply filters
    if (moduleId) {
      query = query.eq("module_id", moduleId);
    }
    if (type) {
      query = query.eq("type", type);
    }
    if (status) {
      query = query.eq("status", status);
    }

    // Apply cursor-based pagination
    if (cursor) {
      const cursorDate = new Date(cursor).toISOString();
      query = query.lt("created_at", cursorDate);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    // Determine if there are more results
    const hasMore = transactions.length > limit;
    const items = hasMore ? transactions.slice(0, limit) : transactions;

    // Transform database rows to match our Transaction type
    const transformedTransactions: Transaction[] = items.map((row) => ({
      id: row.id,
      moduleId: row.module_id,
      type: row.type as "in" | "out",
      method: row.method as "stablecoin" | "payout" | "adjustment",
      displayType: row.display_type as
        | "receive"
        | "send"
        | "buy"
        | "sell"
        | "swap",
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status as "pending" | "posted" | "failed",
      createdAt: row.created_at,
      txHashIn: row.tx_hash_in || undefined,
      txHashSwap: row.tx_hash_swap || undefined,
      feeUsd: row.fee_usd ? parseFloat(row.fee_usd) : undefined,
      customerAddress: row.customer_address || undefined,
      customerEmail: row.customer_email || undefined,
      sendHash: row.send_hash || undefined,
      rockWalletId: row.rock_wallet_id || undefined,
    }));

    // Calculate next cursor
    const nextCursor = hasMore
      ? items[items.length - 1].created_at
      : undefined;

    return NextResponse.json({
      items: transformedTransactions,
      nextCursor,
    });
  } catch (error) {
    console.error(
      "Unexpected error in GET /api/orgs/[orgId]/transactions:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
