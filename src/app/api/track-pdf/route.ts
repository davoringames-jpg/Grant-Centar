import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { organizationId, fileName } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId je obavezan" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Ažuriraj pdf_downloaded_at
    const { error } = await supabase
      .from("organizations")
      .update({ pdf_downloaded_at: new Date().toISOString() })
      .eq("id", organizationId);

    if (error) throw new Error(error.message);

    // Logiraj akciju
    await supabase.from("admin_logs").insert({
      organization_id: organizationId,
      action: "pdf_downloaded",
      performed_by: "user",
      details: {
        fileName,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PDF tracking error:", error);
    return NextResponse.json(
      { error: "Greška pri praćenju PDF-a" },
      { status: 500 }
    );
  }
}
