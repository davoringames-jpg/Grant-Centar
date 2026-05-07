import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { sr } from "date-fns/locale";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { organizationName, address, city, email, accountNumber } =
      await request.json();

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("MEMORANDUM UPLATE", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 15;

    // Dužnik (Payer)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DUŽNIK (Payer):", margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(organizationName, margin + 5, yPosition);
    yPosition += 6;
    doc.text(address, margin + 5, yPosition);
    yPosition += 6;
    doc.text(city, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Email: ${email}`, margin + 5, yPosition);
    yPosition += 12;

    // Povjerioc (Creditor)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("POVJERIOC (Creditor):", margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("GRANT PORTAL RS d.o.o.", margin + 5, yPosition);
    yPosition += 6;
    doc.text("Banja Luka, Republika Srpska", margin + 5, yPosition);
    yPosition += 6;
    doc.text("Email: info@grantportal.rs", margin + 5, yPosition);
    yPosition += 12;

    // Account details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DETALJI UPLATE:", margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Broj računa: ${accountNumber}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text("Banka: [Naziv banke]", margin + 5, yPosition);
    yPosition += 6;
    doc.text("Poziv na broj: ", margin + 5, yPosition);
    yPosition += 12;

    // Service details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("USLUGA:", margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Godišnja pretplata - GRANT PORTAL", margin + 5, yPosition);
    yPosition += 6;
    doc.text("Pristup bazi javnih poziva za opštine i gradove", margin + 5, yPosition);
    yPosition += 12;

    // Amount
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("IZNOS: 2.000 KM", margin, yPosition);
    yPosition += 10;

    // Dates
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Datum aktivacije: ${format(today, "dd.MM.yyyy", { locale: sr })}`,
      margin,
      yPosition
    );
    yPosition += 6;
    doc.text(
      `Datum isteka: ${format(expiryDate, "dd.MM.yyyy", { locale: sr })}`,
      margin,
      yPosition
    );
    yPosition += 12;

    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Memorandum se prosleđuje kao potvrda da je uplata primljena.",
      margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: "left" }
    );

    // Generate PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Memorandum_${organizationName.replace(
          /\s+/g,
          "_"
        )}_${format(today, "yyyy-MM-dd")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Greška pri generisanju PDF-a" },
      { status: 500 }
    );
  }
}
