import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AiResult = {
  jeKonkurs: boolean;
  naslov: string;
  sazetak: string;
  sektor: string;
  rokPrijave: string | null;
};

async function aiObradiKonkurs(
  naslov: string,
  opis: string,
  donator: string,
  sektorDefault: string,
  detaljiTekst: string
): Promise<AiResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Analiziraj ovu objavu i vrati JSON.

Donator: ${donator}
Naslov: ${naslov}
Opis: ${opis.slice(0, 1200)}
Tekst sa originalne stranice: ${detaljiTekst.slice(0, 3500)}

Vrati SAMO validan JSON objekat (bez markdown, bez \`\`\`):
{
  "jeKonkurs": true/false,
  "naslov": "kratki čisti naslov na srpskom (max 120 znakova)",
  "sazetak": "2-3 recenice sažetka na srpskom: ko moze aplicirati, sta se finansira, koliko",
  "sektor": "jedan od: privreda, poljoprivreda, infrastruktura, zdravstvo, obrazovanje, kultura, sport, omladina, ekologija, digitalizacija, socijala, turizam, nauka, međunarodni, ostalo",
  "rokPrijave": "datum u formatu YYYY-MM-DD ili null"
}

STROGA PRAVILA - jeKonkurs = true SAMO AKO JE SVE UREDU:
1. Objava je aktivan OTVORENI poziv na koji se MOŽE aplicirati/prijaviti sada ili uskoro.
2. Postoji jasno navedeni donator/finansijer koji nudi sredstva.
3. Postoje uslovi za apliciranje ili rok prijave.

jeKonkurs = FALSE (obavezno odbij) ako je:
- Javne konsultacije ili e-konsultacije (traženje mišljenja, NIJE poziv za finansiranje)
- Prijedlog, nacrt ili uredba (regulatorni dokument)
- Pravilnik, zakon, odluka Vlade
- Rezultati ili lista korisnika (konkurs je završen)
- Saopštenje o dodjeli sredstava (konkurs je završen)
- Vijest, press release, konferencija za novinare
- Satellitsko snimanje, tender za usluge (nije grant za privredu/organizacije)
- Stranica koja nije u potpunosti o pozivu/konkursu

Ako je naveden rok prijave u tekstu (rok, prijave do, najkasnije do), obavezno ga vrati u rokPrijave.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return null;

    const parsed = JSON.parse(text) as AiResult;
    // Fallback za sektor ako AI vrati nesto cudno
    const validSektori = ["privreda","poljoprivreda","infrastruktura","zdravstvo","obrazovanje","kultura","sport","omladina","ekologija","digitalizacija","socijala","turizam","nauka","međunarodni","ostalo"];
    if (!validSektori.includes(parsed.sektor)) parsed.sektor = sektorDefault;
    return parsed;
  } catch {
    return null;
  }
}

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
  keywords?: string[];
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
// Keywords su prazni niz = prihvati sve objave bez filtriranja
const RSS_SOURCES: RssSource[] = [
  {
    donator: "RARS-MSP",
    sektor: "privreda",
    feedUrl: "https://www.rars-msp.org/feed",
    pageUrl: "https://www.rars-msp.org/javni-pozivi",
    // Prazan niz = uzmi sve (RSS je vec cirilica, keyword filter latinice ne radi)
    keywords: [],
  },
];

// HTML stranice za scraping - stabilni izvori na centralnom portalu Vlade RS
const SCRAPE_SOURCES: ScrapeSource[] = [
  {
    donator: "Vlada RS - Ministarstvo poljoprivrede",
    sektor: "poljoprivreda",
    pageUrl: "https://www.vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mps/Pages/default.aspx",
  },
  {
    donator: "Vlada RS - Ministarstvo privrede",
    sektor: "privreda",
    pageUrl: "https://www.vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mpp/Pages/default.aspx",
  },
  {
    donator: "Vlada RS - Ministarstvo finansija",
    sektor: "privreda",
    pageUrl: "https://www.vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mf/Pages/default.aspx",
  },
  {
    donator: "Vlada RS - Ministarstvo prostornog uredenja",
    sektor: "infrastruktura",
    pageUrl: "https://www.vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mgr/Pages/default.aspx",
  },
  {
    donator: "Vlada RS - Ministarstvo nauke",
    sektor: "nauka",
    pageUrl: "https://www.vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mnk/Pages/default.aspx",
  },
  {
    donator: "Vlada RS - Ministarstvo porodice",
    sektor: "socijala",
    pageUrl: "https://www.vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mpb/Pages/default.aspx",
  },
  {
    donator: "Vlada RS - Ministarstvo kulture",
    sektor: "kultura",
    pageUrl: "https://www.vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mpk/Pages/default.aspx",
  },
  {
    donator: "Vlada RS - Ministarstvo zdravlja",
    sektor: "zdravstvo",
    pageUrl: "https://www.vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mzsz/Pages/default.aspx",
  },
  {
    donator: "Eko fond RS",
    sektor: "ekologija",
    pageUrl: "https://www.ekofondrs.org/",
    keywords: [
      "javni konkurs",
      "javni poziv",
      "otvoren javni konkurs",
      "odluka o izboru korisnika",
      "јавни конкурс",
      "јавни позив",
    ],
  },
];

// Rijeci koje ukazuju na navigacijske linkove - preskoci
const NAV_SKIP = new Set([
  "početna", "pocetna", "home", "nazad", "back", "više", "vise", "read more",
  "pročitaj više", "procitaj vise", "detalji", "details", "next", "previous",
  "sljedeća", "prethodna", "login", "prijava", "odjava", "registracija",
  "kontakt", "contact", "o nama", "about", "mapa sajta", "sitemap",
]);

// URL i naslov pattern-i koji ukazuju na NIJE javni poziv - blokiraj
const BLOCK_URL_PATTERNS = [
  // Konsultacije - nisu pozivi za apliciranje
  "konsultacije", "konsultacija", "консулта",
  // Rezultati - poziv je zavrsio
  "rezultati", "rezultat-", "lista-privrednih", "lista-korisnika", "lista-podnosilaca",
  "izabrani", "dodijeljene", "dodjeljena", "odluka-o-izboru",
  // Propisi i prijedlozi
  "prijedlog-uredbe", "nacrt-uredbe", "pravilnik", "uredba-o",
  // Saopstenja i vijesti (opste, ne pozivi)
  "saopstenje", "saopštenje", "press-release",
  // Login/auth stranice
  "Authenticate.aspx", "/_layouts/15/", "signout", "/_api/",
];

const CALL_KEYWORDS = [
  "javni poziv",
  "javni konkurs",
  "javni oglas",
  "poziv za dostavljanje",
  "konkurs za",
  "podsticaji za",
  "sufinansiranje",
  "grant",
  "grantovi",
  "finansijska podrska",
  "finansijska podrška",
  // cirilica
  "јавни позив",
  "јавни конкурс",
  "јавни оглас",
  "конкурс за",
  "sufinans",
  "подстица",
];

function isBlockedUrlOrTitle(url: string, title: string): boolean {
  const combined = (url + " " + title).toLowerCase();
  return BLOCK_URL_PATTERNS.some((p) => combined.includes(p.toLowerCase()));
}

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

function containsCallKeyword(value: string): boolean {
  const text = value.toLowerCase();
  return CALL_KEYWORDS.some((keyword) => text.includes(keyword));
}

function isKnownBrokenUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const href = parsed.toString().toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (href.includes("/pages/pagenotfounderror.aspx")) return true;
    if (href.includes("requesturl=")) return true;

    // Generic landing pages nisu konkretni pozivi
    if (path === "/" || path === "/www" || path === "/www/") return true;

    if (parsed.hostname.includes("rars-msp.org") && parsed.pathname.startsWith("/javni-pozivi/")) {
      return true;
    }

    if (parsed.hostname.includes("vladars.rs") && parsed.pathname === "/turizam") {
      return true;
    }

    return false;
  } catch {
    return true;
  }
}

function isKnownBrokenPageText(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("oops! that page can") ||
    lower.includes("page can\'t be found") ||
    lower.includes("page can’t be found") ||
    lower.includes("nothing was found at this location") ||
    lower.includes("pagenotfounderror.aspx") ||
    lower.includes("404 not found")
  );
}

function parseDateToken(token: string): string | null {
  const cleaned = token.trim();

  const ymd = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  const dmy = cleaned.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})\.?$/);
  if (!dmy) return null;

  const day = Number(dmy[1]);
  const month = Number(dmy[2]);
  const year = Number(dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]);

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2100) {
    return null;
  }

  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function parseIsoToYmd(value: string): string | null {
  const d = new Date(value.trim());
  if (Number.isNaN(d.getTime())) return null;
  const ymd = d.toISOString().split("T")[0];
  const year = Number(ymd.slice(0, 4));
  if (year < 2015 || year > 2100) return null;
  return ymd;
}

function extractPublishedDate(html: string, text: string, url: string): string | null {
  // 1) Probaj standardne meta/datePublished vrijednosti
  const metaCandidates: string[] = [];
  const metaPatterns = [
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']pubdate["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+itemprop=["']datePublished["'][^>]+content=["']([^"']+)["']/i,
    /"datePublished"\s*:\s*"([^"]+)"/i,
    /<time[^>]+datetime=["']([^"']+)["']/i,
  ];

  for (const pattern of metaPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) metaCandidates.push(match[1]);
  }

  for (const candidate of metaCandidates) {
    const byIso = parseIsoToYmd(candidate);
    if (byIso) return byIso;

    const token = candidate.match(/(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}|\d{4}-\d{2}-\d{2})/);
    if (token?.[1]) {
      const parsed = parseDateToken(token[1]);
      if (parsed) return parsed;
    }
  }

  // 2) Probaj iz teksta sa kontekstom "objavljeno/datum"
  const lower = text.toLowerCase();
  const textMatch = lower.match(
    /(objavljeno|datum objave|published|објављено|датум)[^\d]{0,30}(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}|\d{4}-\d{2}-\d{2})/i,
  );
  if (textMatch?.[2]) {
    const parsed = parseDateToken(textMatch[2]);
    if (parsed) return parsed;
  }

  // 3) WordPress URL fallback: /YYYY/MM/DD/
  const fromUrl = url.match(/\/(20\d{2})\/(\d{2})\/(\d{2})(\/|$)/);
  if (fromUrl) {
    const ymd = `${fromUrl[1]}-${fromUrl[2]}-${fromUrl[3]}`;
    const valid = parseDateToken(ymd);
    if (valid) return valid;
  }

  return null;
}

function extractDeadlineFromText(text: string): string | null {
  const lower = text.toLowerCase();

  const withKeyword = lower.match(
    /(rok|prijave|najkasnije|krajnji\s+rok|trajanje\s+poziva)[^\d]{0,40}(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}|\d{4}-\d{2}-\d{2})/i,
  );
  if (withKeyword?.[2]) {
    return parseDateToken(withKeyword[2]);
  }

  const fallback = lower.match(/(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}|\d{4}-\d{2}-\d{2})/);
  if (fallback?.[1]) {
    return parseDateToken(fallback[1]);
  }

  return null;
}

async function fetchItemContext(url: string): Promise<{ url: string; text: string; rok: string | null; objava: string | null; broken: boolean }> {
  try {
    if (isKnownBrokenUrl(url)) {
      return { url, text: "", rok: null, objava: null, broken: true };
    }

    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GrantPortalRS/1.0; +https://grant-centar.vercel.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return { url, text: "", rok: null, objava: null, broken: true };
    }

    const finalUrl = res.url || url;
    const html = await res.text();
    const text = stripHtml(html).slice(0, 6000);
    const rok = extractDeadlineFromText(text);
    const objava = extractPublishedDate(html, text, finalUrl);

    const broken = isKnownBrokenUrl(finalUrl) || isKnownBrokenPageText(text);
    return { url: finalUrl, text, rok, objava, broken };
  } catch {
    return { url, text: "", rok: null, objava: null, broken: true };
  }
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

    // Izvuci direktni link i guid permalink
    const directLinkMatch = raw.match(/<link>(https?:\/\/[^<]+)<\/link>/);
    const guidMatch = raw.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/);

    // WordPress ponekad stavlja homepage/www u <link> a pravi permalink u <guid>
    // Koristi guid kada direktni link nema smisla (homepage, /www/, query-only)
    let rawLink = directLinkMatch?.[1]?.trim() ?? "";
    const isUselessLink =
      !rawLink ||
      rawLink.endsWith("/www/") ||
      rawLink === source.pageUrl ||
      rawLink === source.feedUrl.replace("/feed", "/");
    if (isUselessLink && guidMatch) {
      rawLink = guidMatch[1].trim();
    }
    if (!rawLink || rawLink.endsWith("/www/")) continue;

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
    const link = decodeURIComponent(rawLink);

    // Ako keywords nije prazan, filtriraj - inace prihvati sve
    if (source.keywords.length > 0) {
      const combined = `${naslov} ${link}`.toLowerCase();
      const relevant = source.keywords.some((kw) => combined.includes(kw));
      if (!relevant) continue;
    }
    if (link === source.pageUrl) continue;

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
        url = new URL(href, base).toString().split("#")[0];
      } catch {
        continue;
      }

      // Mora biti isti hostname
      try {
        if (new URL(url).hostname !== base.hostname) continue;
      } catch {
        continue;
      }

      const relevanceText = `${innerText} ${url}`;
      const isRelevant = source.keywords?.length
        ? source.keywords.some((kw) => relevanceText.toLowerCase().includes(kw.toLowerCase()))
        : containsCallKeyword(relevanceText);

      if (!isRelevant) continue;

      // Blokiraj URL-ove koji jasno nisu javni pozivi
      if (isBlockedUrlOrTitle(url, innerText)) continue;

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

      const pageContext = await fetchItemContext(item.izvor_url);
      const finalUrl = pageContext.url || item.izvor_url;

      if (pageContext.broken || isKnownBrokenUrl(finalUrl)) {
        skipped++;
        continue;
      }

      if (finalUrl !== item.izvor_url) {
        const { data: redirectedExisting } = await supabase
          .from("konkursi")
          .select("id")
          .eq("izvor_url", finalUrl)
          .maybeSingle();

        if (redirectedExisting) {
          skipped++;
          continue;
        }
      }

      // AI obrada: klasifikacija + sažetak + sektor + rok prijave
      const ai = await aiObradiKonkurs(
        item.naslov,
        item.ai_sazetak,
        item.donator,
        item.sektor,
        pageContext.text,
      );

      // Preskoči stavke koje AI klasifikuje kao ne-konkurse
      if (ai && !ai.jeKonkurs) {
        skipped++;
        continue;
      }

      const detectedRok = ai?.rokPrijave ?? pageContext.rok ?? extractDeadlineFromText(item.ai_sazetak);

      const datumObjave = item.datum_objave ?? pageContext.objava ?? ranAt.split("T")[0];

      const { error } = await supabase.from("konkursi").insert({
        naslov: ai?.naslov ?? item.naslov,
        izvor_url: finalUrl,
        datum_objave: datumObjave,
        rok_prijave: detectedRok,
        sektor: ai?.sektor ?? item.sektor,
        donator: item.donator,
        iznos_min: null,
        iznos_max: null,
        odobrenost_opstine: true,
        ai_sazetak: ai?.sazetak ?? item.ai_sazetak,
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
