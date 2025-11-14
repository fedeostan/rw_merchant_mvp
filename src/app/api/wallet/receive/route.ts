import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import QRCode from "qrcode";

// Request body validation schema
const receiveMneeRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
});

/**
 * POST /api/wallet/receive
 * Generate a wallet address and QR code for receiving MNEE
 * Does NOT create a transaction - transaction will be created when funds are actually received
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
    const validationResult = receiveMneeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { amount } = validationResult.data;

    // Generate mock Ethereum wallet address
    // Ethereum address format: 0x + 40 hex characters
    const address = `0x${Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    // Generate QR code as base64 data URL
    // If amount is provided, encode it in the QR code for payment request
    const qrData = amount ? `${address}?amount=${amount}` : address;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
    });

    return NextResponse.json(
      {
        success: true,
        address,
        qrCode: qrCodeDataUrl,
        amount: amount || undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/wallet/receive:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
