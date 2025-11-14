import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateOrgBalance } from "@/lib/utils/balance";

/**
 * GET /api/orgs/[orgId]/balance
 * Get the balance for an organization calculated from transactions
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

    // Calculate balance from transactions
    const balance = await calculateOrgBalance(orgId);

    return NextResponse.json(balance);
  } catch (error) {
    console.error("Error in GET /api/orgs/[orgId]/balance:", error);
    return NextResponse.json(
      { error: "Failed to calculate balance" },
      { status: 500 }
    );
  }
}
