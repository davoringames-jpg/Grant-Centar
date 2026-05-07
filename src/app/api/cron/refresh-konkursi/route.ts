import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

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
    keywords: ["poziv", "konkurs", "grant", "javni", "prijav", "podrska", "program"],
  },
];

const HEAD_SOURCES: { donator: string; pageUrl: string }[] = [
  { donator: "MULS RS", pageUrl: "https://www.muls.vladars.net/sr/javni-pozivi" },
  { donator: "Min. privrede RS", pageUrl: "https://www.mpp.vladars.net/sr/javni-pozivi" },
  { donator: "Min. nauke RS", pageUrl: "https://www.mnk.vladars.net/sr/konkursi" },
  { donator: "Min. poljoprivrede RS", pageUrl: "https://www.mps.vladars.net/sr/javni-pozivi" },
  { donator: "Min. prostornog uredjenja RS", pageUrl: "https://www.mgr.vladars.net/sr/javni-pozivi" },
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

type ScrapedItem = {
  naslov: string;
  izvor_url: string;
  donator: string;
  sektor: string;
  datum_objave: string | null;
};

function parseRssFeed(xml: string, source: (typeof RSS_SOURCES)[number]): ScrapedItem[] {
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

    items.push({
      naslov: naslov.slice(0, 250),
      izvor_url: link,
      donator: source.donator,
      sektor: source.sektor,
      datum_objave: datum,
    });
  }

  return items;
}

async function fetchRssSource(source: (typeof RSS_SOURCES)[number]) {
  try {
    const res = await fetch(source.feedUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "GrantPortalRS/1.0 (+https://grantportal.ba)" },
    });
    if (!res.ok) return { donator: source.donator, scraped: [] as ScrapedItem[], error: `HTTP ${res.status}` };

    const xml = await res.text();
    const scraped = parseRssFeed(xml, source);
    return { donator: source.donator, scraped };
  } catch (err) {
    return { donator: source.donator, scraped: [] as ScrapedItem[], error: String(err).slice(0, 120) };
  }
}

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

  const rssResults = await Promise.all(RSS_SOURCES.map(fetchRssSource));
  let inserted = 0;
  let skipped = 0;
  const insertErrors: string[] = [];

  for (const result of rssResults) {
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

  await supabase.from("cron_logs").insert({
    ran_at: ranAt,
    source_count: RSS_SOURCES.length + HEAD_SOURCES.length,
    reachable_count:
      headResults.filter((r) => r.reachable).length +
      rssResults.filter((r) => !r.error).length,
    unreachable_sources:
      headResults.filter((r) => !r.reachable).map((r) => r.donator).join(", ") || null,
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
