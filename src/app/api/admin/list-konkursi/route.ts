import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

// GET: Lista svih unosa sa URL-ovima
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase env nije konfigurisan" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from("konkursi")
    .select("id, naslov, izvor_url, donator, datum_objave, status")
    .order("datum_objave", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: data?.length ?? 0, items: data });
}

// DELETE: Obriši SVE unose i vrati broj obrisanih
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase env nije konfigurisan" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Broj unosa prije brisanja
  const { count } = await supabase
    .from("konkursi")
    .select("*", { count: "exact", head: true });

  // Obrisi sve (koristi gt filter koji uvijek prolazi jer id > 0)
  // Obrisi sve - status je uvijek 'aktivan' ili 'istekao' ili 'arhiviran'
  const { error } = await supabase
    .from("konkursi")
    .delete()
    .not("id", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: count ?? 0, message: "Sve obrisano. Pokreni cron da popunis bazu realnim podacima." });
}
