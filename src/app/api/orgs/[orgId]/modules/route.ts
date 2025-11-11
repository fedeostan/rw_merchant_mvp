import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createModuleRequestSchema,
  type Module,
} from "@/lib/schemas/module";
import { generateCodeSnippet } from "@/lib/services/codeGenerator";

/**
 * GET /api/orgs/[orgId]/modules
 * List all modules for an organization
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

    // Phase 3: Verify user is a member of the requested organization
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

    // Fetch modules from Supabase using orgId
    // RLS policies will automatically filter to only show modules user has access to
    const { data: modules, error } = await supabase
      .from("modules")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching modules:", error);
      return NextResponse.json(
        { error: "Failed to fetch modules" },
        { status: 500 }
      );
    }

    // Transform database rows to match our Module type
    const transformedModules: Module[] = (modules || []).map((row) => ({
      id: row.id,
      orgId: row.org_id,
      name: row.name,
      kind: row.kind as "paywall" | "e-commerce" | "donation",
      status: row.status as "active" | "inactive",
      configuration: row.configuration as any,
      codeSnippet: row.code_snippet || undefined,
      imageUrl: row.image_url || undefined,
    }));

    return NextResponse.json(transformedModules);
  } catch (error) {
    console.error("Unexpected error in GET /api/orgs/[orgId]/modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orgs/[orgId]/modules
 * Create a new module
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

    // Phase 3: Verify user is a member of the requested organization
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
    const validationResult = createModuleRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, kind, configuration, imageUrl } =
      validationResult.data;

    // Generate code snippet based on configuration
    const tempModule: Module = {
      id: "temp",
      orgId,
      name,
      kind,
      status: "active",
      configuration,
      imageUrl,
    };
    const codeSnippet = generateCodeSnippet(tempModule);

    // Insert into Supabase using orgId
    // RLS policies will automatically verify user has access
    const { data: newModule, error } = await supabase
      .from("modules")
      .insert({
        org_id: orgId,
        name,
        kind,
        status: "active",
        configuration,
        code_snippet: codeSnippet,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating module:", error);
      return NextResponse.json(
        { error: "Failed to create module" },
        { status: 500 }
      );
    }

    // Transform to Module type
    const transformedModule: Module = {
      id: newModule.id,
      orgId: newModule.org_id,
      name: newModule.name,
      kind: newModule.kind as "paywall" | "e-commerce" | "donation",
      status: newModule.status as "active" | "inactive",
      configuration: newModule.configuration as any,
      codeSnippet: newModule.code_snippet || undefined,
      imageUrl: newModule.image_url || undefined,
    };

    return NextResponse.json(transformedModule, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/orgs/[orgId]/modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
