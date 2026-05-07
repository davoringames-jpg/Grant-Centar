import { promises as fs } from "fs";
import path from "path";

import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  _: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params;
    const supabase = createServiceClient();

    const { data: req, error } = await supabase
      .from("project_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (error || !req) {
      return NextResponse.json({ error: "Zahtjev nije pronađen." }, { status: 404 });
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    let y = margin;

    // ─── Logo ────────────────────────────────────────────────────────────────
    try {
      const logoPath = path.join(process.cwd(), "public", "image.png");
      const logoBuffer = await fs.readFile(logoPath);
      const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      doc.addImage(logoDataUrl, "PNG", margin, y, 40, 16);
    } catch { /* Logo opcionalan */ }

    // Naslov desno od loga
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("PREDRACUN", pageWidth - margin, y + 10, { align: "right" });
    y += 22;

    // Broj predračuna
    const brPredracuna = `PR-P-${String(req.id).slice(0, 8).toUpperCase()}`;
    const datumStr = new Date(req.created_at).toLocaleDateString("sr-RS-u-ca-islamic", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Broj: ${brPredracuna}`, pageWidth - margin, y, { align: "right" });
    y += 5;
    doc.text(`Datum: ${new Date(req.created_at).toLocaleDateString("sr-Latn-BA", { day: "2-digit", month: "2-digit", year: "numeric" })}`, pageWidth - margin, y, { align: "right" });
    y += 10;

    // ─── Izdavalac ───────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Izdavalac:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const izdavalac = [
      "GRANT PORTAL RS d.o.o.",
      "Banja Luka, Republika Srpska, BiH",
      "Ziro racun: 1630000123456789 (NLB Banka)",
      "Email: info@grantportal.ba | Tel: +387 65 000 000",
    ];
    for (const line of izdavalac) {
      doc.text(line, margin, y);
      y += 5;
    }
    y += 4;

    // ─── Naručilac ────────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.text("Narucilac:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const narucilac = [
      String(req.naziv_organizacije),
      `Opština/grad: ${String(req.opstina)}`,
      `Kontakt: ${String(req.kontakt_osoba)}`,
      `Email: ${String(req.email)}`,
      req.telefon ? `Tel: ${String(req.telefon)}` : null,
    ].filter(Boolean) as string[];
    for (const line of narucilac) {
      doc.text(line, margin, y);
      y += 5;
    }
    y += 6;

    // ─── Predmet usluge ──────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.text("Predmet usluge:", margin, y);
    y += 6;

    // Tabela
    const colW = [10, 100, 30, 30];
    const tableX = [margin, margin + colW[0], margin + colW[0] + colW[1], margin + colW[0] + colW[1] + colW[2]];
    const rowH = 8;

    // Zaglavlje
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, pageWidth - margin * 2, rowH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("#", tableX[0] + 2, y + 5.5);
    doc.text("Opis usluge", tableX[1] + 2, y + 5.5);
    doc.text("Kolicina", tableX[2] + 2, y + 5.5);
    doc.text("Iznos (KM)", tableX[3] + 2, y + 5.5);
    y += rowH;

    // Red usluge
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - margin * 2, rowH * 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("1", tableX[0] + 2, y + 5.5);
    const opisUsluge = `Pisanje projektne prijave za konkurs:\n"${String(req.konkurs_naslov).slice(0, 80)}"`;
    doc.text(opisUsluge, tableX[1] + 2, y + 5.5, { maxWidth: colW[1] - 4 });
    doc.text("1 usluga", tableX[2] + 2, y + 5.5);
    doc.text(
      `${Number(req.cijena_usluge_km).toLocaleString("sr-Latn-BA", { minimumFractionDigits: 2 })} KM`,
      tableX[3] + 2, y + 5.5
    );
    y += rowH * 2 + 2;

    // Ukupno
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(
      `Ukupno za uplatu: ${Number(req.cijena_usluge_km).toLocaleString("sr-Latn-BA", { minimumFractionDigits: 2 })} KM`,
      pageWidth - margin,
      y,
      { align: "right" }
    );
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("(PDV nije obracunat - pausal)", pageWidth - margin, y, { align: "right" });
    y += 12;

    // ─── Instrukcije za uplatu ───────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Instrukcije za uplatu:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const instrukcije = [
      "Primalac:       GRANT PORTAL RS d.o.o., Banja Luka",
      "Banka:          NLB Banka a.d. Banja Luka",
      "Broj racuna:    1630000123456789",
      `Svrha uplate:   Pisanje projektne prijave – ${brPredracuna}`,
      `Poziv na broj:  ${brPredracuna}`,
    ];
    for (const line of instrukcije) {
      doc.text(line, margin + 2, y);
      y += 5;
    }
    y += 8;

    // ─── Napomena ────────────────────────────────────────────────────────────
    doc.setFillColor(239, 246, 255);
    doc.rect(margin, y, pageWidth - margin * 2, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Napomena:", margin + 3, y + 5);
    doc.setFont("helvetica", "normal");
    const napomena =
      "Nakon evidencije uplate, tim Grant Portal RS pristupa izradi kompletne projektne dokumentacije " +
      "(narativ, budzet, logicki okvir, obrasci, izjave). Finalni PDF dokument spreman za potpis, " +
      "pecat i slanje postom bice dostavljen na navedeni email adresu.";
    doc.text(napomena, margin + 3, y + 11, { maxWidth: pageWidth - margin * 2 - 6 });
    y += 28;

    // ─── Potpis ───────────────────────────────────────────────────────────────
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Ovlasteno lice / pecat:", pageWidth - margin - 50, y);
    y += 15;
    doc.setDrawColor(150, 150, 150);
    doc.line(pageWidth - margin - 50, y, pageWidth - margin, y);

    const buffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="predracun-projekat-${brPredracuna}.pdf"`,
      },
    });
  } catch (err) {
    console.error("project proforma error:", err);
    return NextResponse.json({ error: "Greška pri generisanju predračuna." }, { status: 500 });
  }
}
