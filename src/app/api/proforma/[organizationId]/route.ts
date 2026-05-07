import { promises as fs } from "fs";
import path from "path";

import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  _: Request,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await context.params;
    const supabase = createServiceClient();

    const { data: organization, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (error || !organization) {
      return NextResponse.json({ error: "Zahtjev nije pronađen." }, { status: 404 });
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    try {
      const logoPath = path.join(process.cwd(), "public", "image.png");
      const logoBuffer = await fs.readFile(logoPath);
      const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      doc.addImage(logoDataUrl, "PNG", pageWidth / 2 - 30, y, 60, 24);
      y += 28;
    } catch {
      // Logo je opcionalan.
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("PREDRAČUN", pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      "Predračun za godišnju pretplatu na platformu ГРАНТ ПОРТАЛ РС",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Izdavalac:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text("GRANT PORTAL RS d.o.o.", margin + 2, y);
    y += 5;
    doc.text("Banja Luka, Republika Srpska", margin + 2, y);
    y += 5;
    doc.text("Ziro racun: 1630000123456789", margin + 2, y);
    y += 5;
    doc.text("Email: info@grantportal.rs", margin + 2, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Kupac:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(String(organization.name ?? "-"), margin + 2, y);
    y += 5;
    doc.text(`JIB: ${String(organization.jib ?? "-")}`, margin + 2, y);
    y += 5;
    doc.text(String(organization.address ?? "-"), margin + 2, y);
    y += 5;
    doc.text(
      `${String(organization.postal_code ?? "")} ${String(organization.city ?? "")}`.trim(),
      margin + 2,
      y
    );
    y += 5;
    doc.text(`Kontakt: ${String(organization.contact_person ?? "-")}`, margin + 2, y);
    y += 5;
    doc.text(`Email: ${String(organization.email ?? "-")}`, margin + 2, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Instrukcije za placanje:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text("Svrha uplate: Godisnja pretplata na platformu GRANT PORTAL RS", margin + 2, y);
    y += 5;
    doc.text("Primalac: GRANT PORTAL RS d.o.o.", margin + 2, y);
    y += 5;
    doc.text("Broj racuna: 1630000123456789", margin + 2, y);
    y += 5;
    doc.text(`Poziv na broj: ${String(organization.jib ?? "-")}`, margin + 2, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Iznos za uplatu: 2.000,00 KM", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "Nakon evidencije uplate, nalog ce biti aktiviran i pristupni podaci ce biti poslati na sluzbeni email.",
      margin,
      y,
      { maxWidth: pageWidth - margin * 2 }
    );

    const buffer = Buffer.from(doc.output("arraybuffer"));

    await supabase
      .from("organizations")
      .update({ pdf_downloaded_at: new Date().toISOString() })
      .eq("id", organizationId);

    await supabase.from("admin_logs").insert({
      organization_id: organizationId,
      action: "proforma_downloaded",
      performed_by: "user",
      details: { at: new Date().toISOString() },
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="predracun-${organizationId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("proforma error", error);
    return NextResponse.json(
      { error: "Greška pri generisanju predračuna." },
      { status: 500 }
    );
  }
}
