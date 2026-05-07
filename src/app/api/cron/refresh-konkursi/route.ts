import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Zaštita ──────────────────────────────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

// ─── RSS izvori (rade sa server-side fetchom) ─────────────────────────────────
const RSS_SOURCES: {
  donator: string;
  sektor: string;
  feedUrl: string;
  pageUrl: string;
  keywords: string[];
}[] = [
  {
    donator: "RARS-MSP",
    sektor: "privreda",
    feedUrl: "https://www.rars-msp.org/feed",
    pageUrl: "https://www.rars-msp.org/javni-pozivi",
    keywords: ["poziv", "konkurs", "grant", "javni", "prijav", "podrška", "program"],
  },
];

// ─── HTML sajtovi koje provjeravamo (samo HEAD — blokiraju scraping) ───────────
const HEAD_SOURCES: { donator: string; pageUrl: string }[] = [
  { donator: "MULS RS", pageUrl: "https://www.muls.vladars.net/sr/javni-pozivi" },
  { donator: "Min. privrede RS", pageUrl: "https://www.mpp.vladars.net/sr/javni-pozivi" },
  { donator: "Min. nauke RS", pageUrl: "https://www.mnk.vladars.net/sr/konkursi" },
  { donator: "Min. poljoprivrede RS", pageUrl: "https://www.mps.vladars.net/sr/javni-pozivi" },
  { donator: "Min. prostornog uređenja RS", pageUrl: "https://www.mgr.vladars.net/sr/javni-pozivi" },
  { donator: "Min. zdravlja RS", pageUrl: "https://www.mzsz.vladars.net/sr/javni-pozivi" },
  { donator: "Min. prosvjete RS", pageUrl: "https://www.mpk.vladars.net/sr/konkursi" },
  { donator: "Min. sporta RS", pageUrl: "https://www.moso.vladars.net/sr/javni-pozivi" },
  { donator: "FZO RS", pageUrl: "https://www.fzors.ba/javni-pozivi" },
  { donator: "IRB RS", pageUrl: "https://www.irbrs.org/sr/krediti/javni-sektor" },
  { donator: "EU IPA III", pageUrl: "https://neighbourhood-enlargement.ec.europa.eu/funding-and-technical-assistance/funding-instruments-pre-accession/ipa-iii_en" },
  { donator: "INTERREG Adriatic-Ionian", pageUrl: "https://www.adriatic-ionian.eu/calls-for-proposals/" },
  { donator: "UNDP BiH", pageUrl: "https://www.undp.org/bosnia-herzegovina/procurement" },
  { donator: "Swiss PRO (SDC)", pageUrl: "https://www.swiss-pro.ba/pozivi-za-aplikacije/" },
  { donator: "USAID BiH", pageUrl: "https://www.usaid.gov/bosnia-and-herzegovina" },
  { donator: "OSCE BiH", pageUrl: "https://www.osce.org/mission-to-bosnia-and-herzegovina/grants" },
];

// ─── Tip za scraped konkurs ───────────────────────────────────────────────────
type ScrapedItem = {
  naslov: string;
  izvor_url: string;
  donator: string;
  sektor: string;
  datum_objave: string | null;
  source_feed: string;
};

// ─── RSS parser ───────────────────────────────────────────────────────────────
function parseRssFeed(xml: string, source: typeof RSS_SOURCES[number]): ScrapedItem[] {
  const items: ScrapedItem[] = [];
  const itemMatches = [...xml.matchAll(/<item[\s\S]*?<\/item>/g)];

  for (const m of itemMatches) {
    const raw = m[0];

    // Naslov (CDATA ili plain)
    const titleMatch =
      raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
      raw.match(/<title>([\s\S]*?)<\/title>/);
    if (!titleMatch) continue;
    const naslov = titleMatch[1].trim().replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#[0-9]+;/g, "");

    // Link
    const linkMatch =
      raw.match(/<link>(https?:\/\/[^<]+)<\/link>/) ||
      raw.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/);
    if (!linkMatch) continue;
    const link = decodeURIComponent(linkMatch[1].trim());

    // Datum
    const dateMatch =
      raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ||
      raw.match(/<dc:date>([\s\S]*?)<\/dc:date>/);
    let datum: string | null = null;
    if (dateMatch) {
      const d = new Date(dateMatch[1].trim());
      if (!isNaN(d.getTime())) datum = d.toISOString().split("T")[0];
    }

    // Filtriraj samo relevantne (sadrže ključne riječi u naslovu ili linku)
    const combined = (naslov + " " + link).toLowerCase();
    const relevant = source.keywords.some((kw) => combined.includes(kw.toLowerCase()));
    if (!relevant) continue;

    // Ignoriši stavke bez realnog linka (npr. /www/ redirekcija)
    if (link === source.pageUrl || link.endsWith("/www/")) continue;

    items.push({
      naslov: naslov.slice(0, 250),
      izvor_url: link,
      donator: source.donator,
      sektor: source.sektor,
      datum_objave: datum,
      source_feed: source.feedUrl,
    });
  }

  return items;
}

// ─── RSS fetch ────────────────────────────────────────────────────────────────
async function fetchRssSource(source: typeof RSS_SOURCES[number]): Promise<{
  donator: string;
  scraped: ScrapedItem[];
  error?: string;
}> {
  try {
    const res = await fetch(source.feedUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "GrantPortalRS/1.0 (+https://grantportal.ba)" },
    });
    if (!res.ok) return { donator: source.donator, scraped: [], error: `HTTP ${res.status}` };
    const xml = await res.text();
    const scraped = parseRssFeed(xml, source);
    return { donator: source.donator, scraped };
  } catch (err) {
    return { donator: source.donator, scraped: [], error: String(err).slice(0, 100) };
  }
}

// ─── HEAD provjera dostupnosti ─────────────────────────────────────────────────
async function headCheck(url: string): Promise<{ reachable: boolean; status: number | null }> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "GrantPortalRS/1.0" },
    });
    return { reachable: res.ok || res.status < 500, status: res.status };
  } catch {
    return { reachable: false, status: null };
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
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
  const ranAt = new Date().toISOString();

  // 1. RSS scraping — auto-insert novih konkursa
  const rssResults = await Promise.all(RSS_SOURCES.map(fetchRssSource));
  let inserted = 0;
  let skipped = 0;
  const insertErrors: string[] = [];

  for (const result of rssResults) {
    for (const item of result.scraped) {
      // Provjeri postoji li već (po izvor_url)
      const { data: existing } = await supabase
        .from("konkursi")
        .select("id")
        .eq("izvor_url", item.izvor_url)
        .maybeSingle();

      if (existing) { skipped++; continue; }

      const { error } = await supabase.from("konkursi").insert({
        naslov: item.naslov,
        izvor_url: item.izvor_url,
        datum_objave: item.datum_objave ?? ranAt.split("T")[0],
        rok_prijave: null,
        sektor: item.sektor,
        iznos_min: null,
        iznos_max: null,
        odobrenost_opstine: true,
        ai_sazetak: `Automatski uvezen sa ${item.donator}. Provjerite originalni link za detalje.`,
        status: "aktivan",
      });

      if (error) insertErrors.push(`${item.naslov.slice(0, 40)}: ${error.message}`);
      else inserted++;
    }
  }

  // 2. HEAD provjera dostupnosti ostalih sajtova (u batchevima po 5)
  const headResults: { donator: string; reachable: boolean; status: number | null }[] = [];
  for (let i = 0; i < HEAD_SOURCES.length; i += 5) {
    const batch = HEAD_SOURCES.slice(i, i + 5);
    const res = await Promise.all(
      batch.map(async (s) => {
        const check = await headCheck(s.pageUrl);
        return { donator: s.donator, ...check };
      }),
    );
    headResults.push(...res);
  }

  // 3. Upis loga
  await supabase.from("cron_logs").insert({
    ran_at: ranAt,
    source_count: RSS_SOURCES.length + HEAD_SOURCES.length,
    reachable_count: headResults.filter((r) => r.reachable).length + rssResults.filter((r) => !r.error).length,
    unreachable_sources: headResults.filter((r) => !r.reachable).map((r) => r.donator).join(", ") || null,
    details: {
      rss: rssResults.map((r) => ({ donator: r.donator, count: r.scraped.length, error: r.error })),
      head: headResults,
      inserted,
      skipped,
      insertErrors,
    },
  });

  return NextResponse.json({
    ranAt,
    rss: {
      sources: RSS_SOURCES.length,
      inserted,
      skipped,
      errors: insertErrors,
      details: rssResults.map((r) => ({
        donator: r.donator,
        found: r.scraped.length,
        error: r.error,
      })),
    },
    headCheck: {
      total: HEAD_SOURCES.length,
      reachable: headResults.filter((r) => r.reachable).length,
      unreachable: headResults.filter((r) => !r.reachable).map((r) => r.donator),
    },
  });
}


// ─── Zaštita: samo Vercel Cron ili admin sa CRON_SECRET ───────────────────────
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret) return false; // zahtijeva konfigurisan secret

  // Vercel Cron šalje Authorization: Bearer <CRON_SECRET>
  return authHeader === `Bearer ${secret}`;
}

// ─── Lista izvora za provjeru ─────────────────────────────────────────────────
// Svaki unos predstavlja jedan izvor koji se skenira.
// `fetchUrl` je URL koji se dohvata (RSS, stranica sa objavama, API).
// Kada ministarstvo/fond objavi RSS feed, ovdje se mijenja samo fetchUrl.
const SOURCES: {
  donator: string;
  sektor: string;
  pageUrl: string;
  fetchUrl: string;
}[] = [
  // RS Ministarstva
  { donator: "MULS", sektor: "infrastruktura", pageUrl: "https://www.muls.vladars.net/sr/javni-pozivi", fetchUrl: "https://www.muls.vladars.net/sr/javni-pozivi" },
  { donator: "Min. privrede i preduzetništva RS", sektor: "privreda", pageUrl: "https://www.mpp.vladars.net/sr/javni-pozivi", fetchUrl: "https://www.mpp.vladars.net/sr/javni-pozivi" },
  { donator: "Min. nauke i tehnologije RS", sektor: "obrazovanje", pageUrl: "https://www.mnk.vladars.net/sr/konkursi", fetchUrl: "https://www.mnk.vladars.net/sr/konkursi" },
  { donator: "Min. poljoprivrede RS", sektor: "poljoprivreda", pageUrl: "https://www.mps.vladars.net/sr/javni-pozivi", fetchUrl: "https://www.mps.vladars.net/sr/javni-pozivi" },
  { donator: "Min. prostornog uređenja RS", sektor: "energetika", pageUrl: "https://www.mgr.vladars.net/sr/javni-pozivi", fetchUrl: "https://www.mgr.vladars.net/sr/javni-pozivi" },
  { donator: "Min. zdravlja i socijalne zaštite RS", sektor: "socijala", pageUrl: "https://www.mzsz.vladars.net/sr/javni-pozivi", fetchUrl: "https://www.mzsz.vladars.net/sr/javni-pozivi" },
  { donator: "Min. prosvjete i kulture RS", sektor: "kultura", pageUrl: "https://www.mpk.vladars.net/sr/konkursi", fetchUrl: "https://www.mpk.vladars.net/sr/konkursi" },
  { donator: "Min. sporta i omladine RS", sektor: "sport", pageUrl: "https://www.moso.vladars.net/sr/javni-pozivi", fetchUrl: "https://www.moso.vladars.net/sr/javni-pozivi" },
  // Fondovi RS
  { donator: "FZO RS", sektor: "ekologija", pageUrl: "https://www.fzors.ba/javni-pozivi", fetchUrl: "https://www.fzors.ba/javni-pozivi" },
  { donator: "RARS-MSP", sektor: "privreda", pageUrl: "https://www.rars-msp.org/javni-pozivi", fetchUrl: "https://www.rars-msp.org/javni-pozivi" },
  { donator: "IRB RS", sektor: "infrastruktura", pageUrl: "https://www.irbrs.org/sr/krediti/javni-sektor", fetchUrl: "https://www.irbrs.org/sr/krediti/javni-sektor" },
  { donator: "Fond PIO RS", sektor: "socijala", pageUrl: "https://www.fondpio.org/", fetchUrl: "https://www.fondpio.org/" },
  // EU i međunarodni donatori
  { donator: "EU IPA III", sektor: "uprava", pageUrl: "https://neighbourhood-enlargement.ec.europa.eu/funding-and-technical-assistance/funding-instruments-pre-accession/ipa-iii_en", fetchUrl: "https://neighbourhood-enlargement.ec.europa.eu/funding-and-technical-assistance/funding-instruments-pre-accession/ipa-iii_en" },
  { donator: "INTERREG CBC Jadransko-jonski", sektor: "turizam", pageUrl: "https://www.adriatic-ionian.eu/calls-for-proposals/", fetchUrl: "https://www.adriatic-ionian.eu/calls-for-proposals/" },
  { donator: "EU4Business BiH", sektor: "privreda", pageUrl: "https://eu4business.eu/grants/", fetchUrl: "https://eu4business.eu/grants/" },
  { donator: "UNDP BiH", sektor: "uprava", pageUrl: "https://www.undp.org/bosnia-herzegovina/procurement", fetchUrl: "https://www.undp.org/bosnia-herzegovina/procurement" },
  { donator: "GIZ BiH", sektor: "uprava", pageUrl: "https://www.giz.de/en/worldwide/306.html", fetchUrl: "https://www.giz.de/en/worldwide/306.html" },
  { donator: "Swiss PRO (SDC)", sektor: "uprava", pageUrl: "https://www.swiss-pro.ba/pozivi-za-aplikacije/", fetchUrl: "https://www.swiss-pro.ba/pozivi-za-aplikacije/" },
  { donator: "USAID BiH", sektor: "privreda", pageUrl: "https://www.usaid.gov/bosnia-and-herzegovina", fetchUrl: "https://www.usaid.gov/bosnia-and-herzegovina" },
  { donator: "OSCE BiH", sektor: "uprava", pageUrl: "https://www.osce.org/mission-to-bosnia-and-herzegovina/grants", fetchUrl: "https://www.osce.org/mission-to-bosnia-and-herzegovina/grants" },
];

// ─── Provjera dostupnosti izvora (HEAD request) ───────────────────────────────
async function checkSource(
  url: string,
): Promise<{ reachable: boolean; status: number | null; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "GrantPortalRS/1.0 (+https://grantportal.ba)" },
    });
    return { reachable: res.ok || res.status < 500, status: res.status };
  } catch (err) {
    return { reachable: false, status: null, error: String(err) };
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
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

  const checkedAt = new Date().toISOString();
  const results: {
    donator: string;
    url: string;
    reachable: boolean;
    status: number | null;
    error?: string;
  }[] = [];

  // Provjeri sve izvore paralelno (batch po 5 da ne preopteretimo)
  for (let i = 0; i < SOURCES.length; i += 5) {
    const batch = SOURCES.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(async (source) => {
        const check = await checkSource(source.fetchUrl);
        return {
          donator: source.donator,
          url: source.pageUrl,
          reachable: check.reachable,
          status: check.status,
          error: check.error,
        };
      }),
    );
    results.push(...batchResults);
  }

  // Upiši log u bazu (tabela cron_logs ako postoji, inače samo vrati rezultat)
  const { error: logError } = await supabase
    .from("cron_logs")
    .insert({
      ran_at: checkedAt,
      source_count: SOURCES.length,
      reachable_count: results.filter((r) => r.reachable).length,
      unreachable_sources: results
        .filter((r) => !r.reachable)
        .map((r) => r.donator)
        .join(", ") || null,
      details: results,
    })
    .select();

  // logError je očekivan dok tabela ne postoji — ne blokira odgovor

  return NextResponse.json({
    checkedAt,
    total: SOURCES.length,
    reachable: results.filter((r) => r.reachable).length,
    unreachable: results.filter((r) => !r.reachable).length,
    logSaved: !logError,
    results,
  });
}
