import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      konkurs_id,
      konkurs_naslov,
      konkurs_izvor_url,
      naziv_organizacije,
      kontakt_osoba,
      email,
      telefon,
      opstina,
      trazeni_iznos_km,
      opis_projekta,
      cijena_usluge_km,
    } = body;

    // Validacija
    if (
      !konkurs_id || !konkurs_naslov || !naziv_organizacije ||
      !kontakt_osoba || !email || !opstina ||
      !trazeni_iznos_km || !opis_projekta || !cijena_usluge_km
    ) {
      return NextResponse.json({ error: "Sva obavezna polja moraju biti popunjena." }, { status: 400 });
    }

    if (typeof email === "string" && !email.includes("@")) {
      return NextResponse.json({ error: "Email adresa nije ispravna." }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("project_requests")
      .insert({
        konkurs_id: String(konkurs_id),
        konkurs_naslov: String(konkurs_naslov),
        konkurs_izvor_url: konkurs_izvor_url ? String(konkurs_izvor_url) : null,
        naziv_organizacije: String(naziv_organizacije),
        kontakt_osoba: String(kontakt_osoba),
        email: String(email).trim().toLowerCase(),
        telefon: telefon ? String(telefon) : null,
        opstina: String(opstina),
        trazeni_iznos_km: Number(trazeni_iznos_km),
        opis_projekta: String(opis_projekta),
        cijena_usluge_km: Number(cijena_usluge_km),
        status: "novi",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("project_request insert error:", error);
      return NextResponse.json({ error: "Greška pri čuvanju zahtjeva." }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error("project-request POST error:", err);
    return NextResponse.json({ error: "Serverska greška." }, { status: 500 });
  }
}
