import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createApiKeyRequestSchema,
  type ApiKey,
  type CreateApiKeyResponse,
} from "@/lib/schemas/apikey";
import {
  generateApiKey,
  hashApiKey,
  getKeyLast4,
} from "@/lib/utils/apikey";

/**
 * GET /api/orgs/[orgId]/apikeys
 * List all API keys for an organization
 * Returns: id, last4, name, createdAt, lastUsedAt, active
 * NEVER returns: key_hash (security risk)
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

    // Fetch API keys from Supabase
    // RLS policies will automatically filter to only show keys user has access to
    // IMPORTANT: Never select key_hash - it should never be returned to clients
    const { data: apiKeys, error } = await supabase
      .from("apikeys")
      .select("id, last4, name, created_at, last_used_at, active")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      return NextResponse.json(
        { error: "Failed to fetch API keys" },
        { status: 500 }
      );
    }

    // Transform database rows to match our ApiKey type
    const transformedKeys: ApiKey[] = (apiKeys || []).map((row) => ({
      id: row.id,
      last4: row.last4,
      name: row.name || undefined,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at || undefined,
      active: row.active,
    }));

    return NextResponse.json({ items: transformedKeys });
  } catch (error) {
    console.error("Unexpected error in GET /api/orgs/[orgId]/apikeys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orgs/[orgId]/apikeys
 * Create a new API key
 * IMPORTANT: This is the ONLY time the full key is returned
 * The key is hashed with bcrypt before storing in the database
 */
export async function POST(
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

    // Verify user is an admin or owner of the organization
    const { data: isAdminOrOwner, error: roleError } = await supabase.rpc(
      "is_org_owner_or_admin",
      { check_org_id: orgId }
    );

    if (roleError || !isAdminOrOwner) {
      return NextResponse.json(
        {
          error:
            "Only organization owners and admins can create API keys",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body (name is optional)
    let name: string | undefined;
    try {
      const body = await request.json();
      const validationResult = createApiKeyRequestSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid request data",
            details: validationResult.error.issues,
          },
          { status: 400 }
        );
      }

      name = validationResult.data.name;
    } catch (e) {
      // If body is empty or invalid JSON, that's okay - name is optional
      name = undefined;
    }

    // Generate a secure API key
    const apiKey = generateApiKey();
    const last4 = getKeyLast4(apiKey);

    // Hash the key with bcrypt (NEVER store plaintext keys)
    const keyHash = await hashApiKey(apiKey);

    // Insert into Supabase
    // RLS policies will automatically verify user has access
    const { data: newKey, error } = await supabase
      .from("apikeys")
      .insert({
        org_id: orgId,
        key_hash: keyHash,
        last4: last4,
        name: name || null,
        active: true,
      })
      .select("id, last4, name, created_at, active")
      .single();

    if (error) {
      console.error("Error creating API key:", error);
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }

    // Return the full API key ONLY ONCE
    // This is the only time the user will see the complete key
    const response: CreateApiKeyResponse = {
      id: newKey.id,
      key: apiKey, // Full key - only shown once!
      last4: newKey.last4,
      name: newKey.name || undefined,
      createdAt: newKey.created_at,
      active: newKey.active,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/orgs/[orgId]/apikeys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
