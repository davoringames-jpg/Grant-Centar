import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

type RssSource = {
  donator: string;
  sektor: string;
  feedUrl: string;
  pageUrl: string;
  keywords: string[];
};

type ScrapeSource = {
  donator: string;
  sektor: string;
  pageUrl: string;
};

type ScrapedItem = {
  naslov: string;
  izvor_url: string;
  donator: string;
  sektor: string;
  datum_objave: string | null;
  ai_sazetak: string;
};

type SourceResult = {
  donator: string;
  scraped: ScrapedItem[];
  error?: string;
};

// RSS feeds - automatski povlace sve nove objave
const RSS_SOURCES: RssSource[] = [
  {
    donator: "RARS-MSP",
    sektor: "privreda",
    feedUrl: "https://www.rars-msp.org/feed",
    pageUrl: "https://www.rars-msp.org/javni-pozivi",
    keywords: ["poziv", "konkurs", "grant", "javni", "prijav", "podrsk", "program", "poziva"],
  },
  {
    donator: "Swiss PRO (SDC)",
    sektor: "međunarodni",
    feedUrl: "https://www.swiss-pro.ba/feed",
    pageUrl: "https://www.swiss-pro.ba/pozivi-za-aplikacije/",
    keywords: ["poziv", "konkurs", "grant", "aplikacij", "prijav", "podrsk"],
  },
];

// HTML stranice za scraping - izvlace direktne linkove na javne pozive
const SCRAPE_SOURCES: ScrapeSource[] = [
  { donator: "MULS RS", sektor: "omladina", pageUrl: "https://www.muls.vladars.net/sr/javni-pozivi" },
  { donator: "Min. privrede RS", sektor: "privreda", pageUrl: "https://www.mpp.vladars.net/sr/javni-pozivi" },
  { donator: "Min. nauke RS", sektor: "nauka", pageUrl: "https://www.mnk.vladars.net/sr/konkursi" },
  { donator: "Min. poljoprivrede RS", sektor: "poljoprivreda", pageUrl: "https://www.mps.vladars.net/sr/javni-pozivi" },
  { donator: "Min. prostornog uredjenja RS", sektor: "infrastruktura", pageUrl: "https://www.mgr.vladars.net/sr/javni-pozivi" },
  { donator: "Min. zdravlja RS", sektor: "zdravstvo", pageUrl: "https://www.mzsz.vladars.net/sr/javni-pozivi" },
  { donator: "Min. prosvjete RS", sektor: "obrazovanje", pageUrl: "https://www.mpk.vladars.net/sr/konkursi" },
  { donator: "Min. sporta RS", sektor: "sport", pageUrl: "https://www.moso.vladars.net/sr/javni-pozivi" },
  { donator: "FZO RS", sektor: "zdravstvo", pageUrl: "https://www.fzors.ba/javni-pozivi" },
  { donator: "IRB RS", sektor: "privreda", pageUrl: "https://www.irbrs.org/sr/krediti/javni-sektor" },
  { donator: "INTERREG Adriatic-Ionian", sektor: "međunarodni", pageUrl: "https://www.adriatic-ionian.eu/calls-for-proposals/" },
  { donator: "UNDP BiH", sektor: "međunarodni", pageUrl: "https://www.undp.org/bosnia-herzegovina/procurement" },
  { donator: "OSCE BiH", sektor: "međunarodni", pageUrl: "https://www.osce.org/mission-to-bosnia-and-herzegovina/grants" },
];

// Rijeci koje ukazuju na navigacijske linkove - preskoci
const NAV_SKIP = new Set([
  "početna", "pocetna", "home", "nazad", "back", "više", "vise", "read more",
  "pročitaj više", "procitaj vise", "detalji", "details", "next", "previous",
  "sljedeća", "prethodna", "login", "prijava", "odjava", "registracija",
  "kontakt", "contact", "o nama", "about", "mapa sajta", "sitemap",
]);

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRssFeed(xml: string, source: RssSource): ScrapedItem[] {
  const items: ScrapedItem[] = [];
  const itemMatches = [...xml.matchAll(/<item[\s\S]*?<\/item>/g)];

  for (const m of itemMatches) {
    const raw = m[0];
    const titleMatch =
      raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
      raw.match(/<title>([\s\S]*?)<\/title>/);
    if (!titleMatch) continue;

    const linkMatch =
      raw.match(/<link>(https?:\/\/[^<]+)<\/link>/) ||
      raw.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/);
    if (!linkMatch) continue;

    const dateMatch =
      raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ||
      raw.match(/<dc:date>([\s\S]*?)<\/dc:date>/);

    // Izvuci opis iz RSS-a za bolji sazetak
    const descMatch =
      raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
      raw.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) ||
      raw.match(/<description>([\s\S]*?)<\/description>/);

    let datum: string | null = null;
    if (dateMatch) {
      const d = new Date(dateMatch[1].trim());
      if (!Number.isNaN(d.getTime())) datum = d.toISOString().split("T")[0];
    }

    const naslov = titleMatch[1].trim();
    const link = decodeURIComponent(linkMatch[1].trim());

    const combined = `${naslov} ${link}`.toLowerCase();
    const relevant = source.keywords.some((kw) => combined.includes(kw));
    if (!relevant) continue;
    if (link === source.pageUrl || link.endsWith("/www/")) continue;

    // Sazetak iz opisa, ako postoji
    let ai_sazetak = `Javni poziv od ${source.donator}. Pogledajte originalni link za detalje i uslove prijave.`;
    if (descMatch) {
      const descText = stripHtml(descMatch[1]);
      if (descText.length > 80) {
        ai_sazetak = descText.slice(0, 500);
        if (descText.length > 500) ai_sazetak += "...";
      }
    }

    items.push({
      naslov: naslov.slice(0, 250),
      izvor_url: link,
      donator: source.donator,
      sektor: source.sektor,
      datum_objave: datum,
      ai_sazetak,
    });
  }

  return items;
}

async function fetchRssSource(source: RssSource): Promise<SourceResult> {
  try {
    const res = await fetch(source.feedUrl, {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "GrantPortalRS/1.0 (+https://grant-centar.vercel.app)" },
    });
    if (!res.ok) return { donator: source.donator, scraped: [], error: `HTTP ${res.status}` };

    const xml = await res.text();
    const scraped = parseRssFeed(xml, source);
    return { donator: source.donator, scraped };
  } catch (err) {
    return { donator: source.donator, scraped: [], error: String(err).slice(0, 120) };
  }
}

async function scrapeHtmlSource(source: ScrapeSource): Promise<SourceResult> {
  try {
    const res = await fetch(source.pageUrl, {
      signal: AbortSignal.timeout(12000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GrantPortalRS/1.0; +https://grant-centar.vercel.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "sr,bs,hr,en;q=0.5",
      },
    });
    if (!res.ok) return { donator: source.donator, scraped: [], error: `HTTP ${res.status}` };

    const html = await res.text();
    const base = new URL(source.pageUrl);
    // Normalizovani bazni path - bez trailing slash
    const basePath = base.pathname.replace(/\/$/, "");

    const items: ScrapedItem[] = [];
    const seen = new Set<string>();

    // Izvuci sve anchor tagove
    const aPattern = /<a[^>]+href=["']([^"']*?)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    while ((match = aPattern.exec(html)) !== null) {
      const href = match[1].trim();
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) continue;

      const innerText = stripHtml(match[2]).trim();
      if (!innerText || innerText.length < 10 || innerText.length > 300) continue;

      // Preskoči navigacijske linkove
      if (NAV_SKIP.has(innerText.toLowerCase())) continue;

      let url: string;
      try {
        url = new URL(href, base).toString().split("#")[0].split("?")[0];
      } catch {
        continue;
      }

      // Mora biti isti hostname
      try {
        if (new URL(url).hostname !== base.hostname) continue;
      } catch {
        continue;
      }

      const urlPath = new URL(url).pathname.replace(/\/$/, "");

      // Mora biti dublja putanja od liste (child item)
      if (urlPath === basePath) continue;
      if (!urlPath.startsWith(basePath + "/")) continue;

      if (seen.has(url)) continue;
      seen.add(url);

      items.push({
        naslov: innerText.slice(0, 250),
        izvor_url: url,
        donator: source.donator,
        sektor: source.sektor,
        datum_objave: null,
        ai_sazetak: `Javni poziv od ${source.donator}. Pogledajte originalni link za detalje i uslove prijave.`,
      });
    }

    return { donator: source.donator, scraped: items };
  } catch (err) {
    return { donator: source.donator, scraped: [], error: String(err).slice(0, 120) };
  }
}

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

  // Paralelno dohvati RSS i HTML izvore
  const [rssResults, scrapeResults] = await Promise.all([
    Promise.all(RSS_SOURCES.map(fetchRssSource)),
    Promise.all(SCRAPE_SOURCES.map(scrapeHtmlSource)),
  ]);

  const allResults: SourceResult[] = [...rssResults, ...scrapeResults];
  let inserted = 0;
  let skipped = 0;
  const insertErrors: string[] = [];

  for (const result of allResults) {
    for (const item of result.scraped) {
      const { data: existing } = await supabase
        .from("konkursi")
        .select("id")
        .eq("izvor_url", item.izvor_url)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      const { error } = await supabase.from("konkursi").insert({
        naslov: item.naslov,
        izvor_url: item.izvor_url,
        datum_objave: item.datum_objave ?? ranAt.split("T")[0],
        rok_prijave: null,
        sektor: item.sektor,
        donator: item.donator,
        iznos_min: null,
        iznos_max: null,
        odobrenost_opstine: true,
        ai_sazetak: item.ai_sazetak,
        status: "aktivan",
      });

      if (error) insertErrors.push(`${item.naslov.slice(0, 40)}: ${error.message}`);
      else inserted++;
    }
  }

  await supabase.from("cron_logs").insert({
    ran_at: ranAt,
    source_count: allResults.length,
    reachable_count: allResults.filter((r) => !r.error).length,
    unreachable_sources: allResults.filter((r) => r.error).map((r) => r.donator).join(", ") || null,
    details: {
      sources: allResults.map((r) => ({
        donator: r.donator,
        found: r.scraped.length,
        error: r.error ?? null,
      })),
      inserted,
      skipped,
      insertErrors,
    },
  });

  return NextResponse.json({
    ranAt,
    inserted,
    skipped,
    errors: insertErrors.length,
    sources: allResults.map((r) => ({
      donator: r.donator,
      found: r.scraped.length,
      error: r.error ?? null,
    })),
  });
}
