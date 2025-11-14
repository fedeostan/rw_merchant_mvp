import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/orgs/[orgId]/apikeys/[keyId]
 * Revoke an API key by setting active=false
 * Only admins and owners can revoke API keys
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; keyId: string }> }
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

    const { orgId, keyId } = await params;

    // Verify user is an admin or owner of the organization
    const { data: isAdminOrOwner, error: roleError } = await supabase.rpc(
      "is_org_owner_or_admin",
      { check_org_id: orgId }
    );

    if (roleError || !isAdminOrOwner) {
      return NextResponse.json(
        {
          error:
            "Only organization owners and admins can revoke API keys",
        },
        { status: 403 }
      );
    }

    // First verify the key belongs to the organization
    const { data: existingKey, error: fetchError } = await supabase
      .from("apikeys")
      .select("id, org_id")
      .eq("id", keyId)
      .single();

    if (fetchError || !existingKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    if (existingKey.org_id !== orgId) {
      return NextResponse.json(
        { error: "API key does not belong to this organization" },
        { status: 403 }
      );
    }

    // Revoke the key by setting active=false
    // We don't actually delete the record for audit purposes
    const { error: updateError } = await supabase
      .from("apikeys")
      .update({ active: false })
      .eq("id", keyId)
      .eq("org_id", orgId);

    if (updateError) {
      console.error("Error revoking API key:", updateError);
      return NextResponse.json(
        { error: "Failed to revoke API key" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "API key revoked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/orgs/[orgId]/apikeys/[keyId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
