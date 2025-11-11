import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateModuleRequestSchema, type Module } from "@/lib/schemas/module";
import { generateCodeSnippet } from "@/lib/services/codeGenerator";

/**
 * GET /api/orgs/[orgId]/modules/[moduleId]
 * Get a single module by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; moduleId: string }> }
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

    const { orgId, moduleId } = await params;

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

    // Fetch module from Supabase using orgId
    // RLS policies will automatically filter to only show modules user has access to
    const { data: module, error } = await supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .eq("org_id", orgId)
      .single();

    if (error || !module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Transform to Module type
    const transformedModule: Module = {
      id: module.id,
      orgId: module.org_id,
      name: module.name,
      kind: module.kind as "paywall" | "e-commerce" | "donation",
      status: module.status as "active" | "inactive",
      configuration: module.configuration as any,
      codeSnippet: module.code_snippet || undefined,
      imageUrl: module.image_url || undefined,
    };

    return NextResponse.json(transformedModule);
  } catch (error) {
    console.error(
      "Unexpected error in GET /api/orgs/[orgId]/modules/[moduleId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orgs/[orgId]/modules/[moduleId]
 * Update a module
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; moduleId: string }> }
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

    const { orgId, moduleId } = await params;

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

    // Check if module exists and belongs to organization
    const { data: existingModule, error: fetchError } = await supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .eq("org_id", orgId)
      .single();

    if (fetchError || !existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateModuleRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, configuration, status, imageUrl } = validationResult.data;

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (configuration !== undefined) {
      updateData.configuration = configuration;

      // Regenerate code snippet if configuration changed
      const tempModule: Module = {
        id: moduleId,
        orgId: existingModule.org_id,
        name: name || existingModule.name,
        kind: existingModule.kind,
        status: (status || existingModule.status) as "active" | "inactive",
        configuration,
        imageUrl: imageUrl || existingModule.image_url,
      };
      updateData.code_snippet = generateCodeSnippet(tempModule);
    }

    // Update in Supabase using orgId
    // RLS policies will automatically verify user has access
    const { data: updatedModule, error: updateError } = await supabase
      .from("modules")
      .update(updateData)
      .eq("id", moduleId)
      .eq("org_id", orgId)
      .select()
      .single();

    if (updateError || !updatedModule) {
      console.error("Error updating module:", updateError);
      return NextResponse.json(
        { error: "Failed to update module" },
        { status: 500 }
      );
    }

    // Transform to Module type
    const transformedModule: Module = {
      id: updatedModule.id,
      orgId: updatedModule.org_id,
      name: updatedModule.name,
      kind: updatedModule.kind as "paywall" | "e-commerce" | "donation",
      status: updatedModule.status as "active" | "inactive",
      configuration: updatedModule.configuration as any,
      codeSnippet: updatedModule.code_snippet || undefined,
      imageUrl: updatedModule.image_url || undefined,
    };

    return NextResponse.json(transformedModule);
  } catch (error) {
    console.error(
      "Unexpected error in PATCH /api/orgs/[orgId]/modules/[moduleId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orgs/[orgId]/modules/[moduleId]
 * Delete a module
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; moduleId: string }> }
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

    const { orgId, moduleId } = await params;

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

    // Delete from Supabase using orgId
    // RLS policies will automatically verify user has access
    const { error } = await supabase
      .from("modules")
      .delete()
      .eq("id", moduleId)
      .eq("org_id", orgId);

    if (error) {
      console.error("Error deleting module:", error);
      // Check if it's a "not found" error
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Module not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to delete module" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/orgs/[orgId]/modules/[moduleId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
