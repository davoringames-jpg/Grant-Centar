// Test RSS feedova i HTML scrapinga za RS vladine sajtove
const SOURCES = [
  // RSS feedovi
  { name: "RARS-MSP RSS", url: "https://www.rars-msp.org/feed", type: "rss" },
  { name: "Swiss PRO RSS", url: "https://www.swiss-pro.ba/?feed=rss2", type: "rss" },
  { name: "UNDP BiH RSS", url: "https://www.undp.org/rss/news/country/bih", type: "rss" },
  { name: "ReliefWeb BiH RSS", url: "https://reliefweb.int/updates/rss.xml?primary_country=21&source=1503", type: "rss" },
  // HTML stranice
  { name: "MULS javni pozivi", url: "https://www.muls.vladars.net/sr/javni-pozivi", type: "html" },
  { name: "FZO RS", url: "https://www.fzors.ba/javni-pozivi", type: "html" },
  { name: "Swiss PRO pozivi", url: "https://www.swiss-pro.ba/pozivi-za-aplikacije/", type: "html" },
];

function parseRss(xml) {
  const items = [];
  const itemMatches = [...xml.matchAll(/<item[\s\S]*?<\/item>/g)];
  for (const m of itemMatches.slice(0, 5)) {
    const raw = m[0];
    const titleMatch = raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
                       raw.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch  = raw.match(/<link>(https?:\/\/[^<]+)<\/link>/) ||
                       raw.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/);
    const dateMatch  = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ||
                       raw.match(/<dc:date>([\s\S]*?)<\/dc:date>/);
    if (titleMatch && linkMatch) {
      items.push({
        naslov: titleMatch[1].trim().slice(0, 100),
        link: linkMatch[1].trim(),
        datum: dateMatch?.[1]?.trim() ?? null,
      });
    }
  }
  return items;
}

function extractLinksFromHtml(html, baseUrl) {
  const links = [];
  const seen = new Set();
  // Tražimo <a> tagove sa textom koji liče na konkurs/poziv
  const matches = [...html.matchAll(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const m of matches) {
    let href = m[1].trim();
    const text = m[2].replace(/<[^>]+>/g, "").trim().slice(0, 100);
    if (!href || href.startsWith("#") || href.startsWith("javascript")) continue;
    if (!href.startsWith("http")) {
      const base = new URL(baseUrl);
      href = base.origin + (href.startsWith("/") ? href : "/" + href);
    }
    if (seen.has(href)) continue;
    if (/poziv|konkurs|oglas|natje|grant|prijav/i.test(text + href)) {
      seen.add(href);
      links.push({ naslov: text, link: href });
    }
  }
  return links.slice(0, 8);
}

async function testSource(src) {
  try {
    const r = await fetch(src.url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 GrantPortalRS/1.0" },
      redirect: "follow",
    });
    const body = await r.text();
    console.log(`\n=== ${src.name} [${r.status}] ===`);
    if (src.type === "rss") {
      const items = parseRss(body);
      if (items.length === 0) {
        console.log("  (nema itema ili nije RSS)");
        console.log("  Preview:", body.slice(0, 200));
      } else {
        items.forEach(i => console.log(`  • ${i.naslov}\n    ${i.link}`));
      }
    } else {
      const links = extractLinksFromHtml(body, src.url);
      if (links.length === 0) {
        console.log("  (nema relevantnih linkova)");
      } else {
        links.forEach(l => console.log(`  • ${l.naslov || "(bez teksta)"}\n    ${l.link}`));
      }
    }
  } catch (e) {
    console.log(`\n=== ${src.name} ===`);
    console.log("  ERR:", e.message?.slice(0, 80));
  }
}

for (const src of SOURCES) {
  await testSource(src);
}
