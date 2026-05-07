// Provjera svih izvora grantova
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120';

async function checkUrl(name, url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': UA } });
    return { name, url, status: r.status, ok: r.ok };
  } catch (e) {
    return { name, url, status: 'ERR', ok: false, err: e.message.slice(0, 60) };
  }
}

async function checkRss(name, url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': UA } });
    if (!r.ok) return { name, url, status: r.status, ok: false };
    const xml = await r.text();
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/g)];
    const sample = items.slice(0, 2).map(m => {
      const t = m[0].match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/);
      const l = m[0].match(/<link>(https?:\/\/[^<]+)<\/link>|<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/);
      return { title: (t?.[1] || t?.[2] || '?').trim().slice(0, 60), link: (l?.[1] || l?.[2] || '?') };
    });
    return { name, url, status: r.status, ok: true, itemCount: items.length, sample };
  } catch (e) {
    return { name, url, status: 'ERR', ok: false, err: e.message.slice(0, 60) };
  }
}

// RSS provjera
const rssFeeds = [
  ['RARS-MSP', 'https://www.rars-msp.org/feed'],
  ['IRB RS', 'https://www.irbrs.org/sr/feed'],
  ['sportvs', 'https://www.sportvs.org/feed'],
  ['RCC SEE', 'https://www.rcc.int/feed'],
  ['OSCE BiH', 'https://www.osce.org/mission-to-bosnia-and-herzegovina/rss'],
  ['GIZ news', 'https://www.giz.de/de/html/rss.xml'],
  ['CERV EU', 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/cerv/rss'],
];

// HTML scrape provjera
const htmlPages = [
  ['sportvs javni pozivi', 'https://www.sportvs.org/javni-pozivi'],
  ['OSCE BiH calls', 'https://www.osce.org/mission-to-bosnia-and-herzegovina/calls'],
  ['IRB RS home', 'https://www.irbrs.org/sr/'],
];

console.log('\n=== RSS FEEDS ===');
for (const [name, url] of rssFeeds) {
  const r = await checkRss(name, url);
  if (r.ok) {
    console.log(`✓ ${name} - ${r.itemCount} items`);
    r.sample?.forEach(s => console.log(`    > ${s.title}\n      ${s.link}`));
  } else {
    console.log(`✗ ${name} - ${r.status} ${r.err || ''}`);
  }
}

console.log('\n=== HTML PAGES ===');
for (const [name, url] of htmlPages) {
  const r = await checkUrl(name, url);
  console.log(`${r.ok ? '✓' : '✗'} ${name} - ${r.status} ${r.err || ''}`);
}
