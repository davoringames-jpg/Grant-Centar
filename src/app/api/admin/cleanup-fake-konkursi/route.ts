import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const FAKE_URLS = [
  "https://www.interreg-adrion.eu/calls/2026-infrastructure",
  "https://www.dei.gov.ba/ipa/2026/lokalna-samouprava",
  "https://www.garantnifond.rs.ba/konkursi/2026-msp",
  "https://www.undp.org/bosnia-herzegovina/calls/2026-digitalizacija",
  "https://www.rars-msp.org/javni-pozivi/energetska-efikasnost-2026",
  "https://www.rars-msp.org/javni-pozivi/e-uprava-2026",
  "https://www.rars-msp.org/javni-pozivi/zdravstvo-2026",
  "https://www.rars-msp.org/javni-pozivi/agroturizam-2026",
  "https://www.rars-msp.org/javni-pozivi/energetska-tranzicija-2026",
  "https://www.unicef.org/bih/calls/2026-inkluzija",
  "https://www.wbif.eu/calls/2026-regional",
  "https://www.ebrd.com/calls/bih-water-2026",
  "https://www.giz.de/bih/calls/2026-demokratija",
  "https://www.eu4business.ba/calls/2026-sme",
  "https://www.usaid.gov/bosnia/calls/2026-digital-sme",
];

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase env nije konfigurisan" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: fakeSeedRows, error: fakeSeedError } = await supabase
    .from("konkursi")
    .delete()
    .like("izvor_url", "%vladars.net%?konkurs=%")
    .select("id");

  if (fakeSeedError) {
    return NextResponse.json({ error: fakeSeedError.message }, { status: 500 });
  }

  const { data: fakeExactRows, error: fakeExactError } = await supabase
    .from("konkursi")
    .delete()
    .in("izvor_url", FAKE_URLS)
    .select("id");

  if (fakeExactError) {
    return NextResponse.json({ error: fakeExactError.message }, { status: 500 });
  }

  const deleted = (fakeSeedRows?.length ?? 0) + (fakeExactRows?.length ?? 0);

  return NextResponse.json({
    deleted,
    deletedByPattern: fakeSeedRows?.length ?? 0,
    deletedByExactUrl: fakeExactRows?.length ?? 0,
  });
}
