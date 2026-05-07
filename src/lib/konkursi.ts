export type KonkursStatus = "aktivan" | "istekao";

export type Konkurs = {
  id: string;
  naslov: string;
  izvor_url: string;
  datum_objave: string;
  rok_prijave: string | null;
  sektor: string;
  iznos_min: number | null;
  iznos_max: number | null;
  odobrenost_opstine: boolean;
  ai_sazetak: string | null;
  status: KonkursStatus;
};

export const demoKonkursi: Konkurs[] = [
  // ─── Vlada RS / MULS ───────────────────────────────────────────────────────
  {
    id: "demo-muls-1",
    naslov: "Javni poziv za podršku projektima digitalizacije lokalne samouprave",
    izvor_url: "https://www.muls.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-05-02",
    rok_prijave: "2026-06-15",
    sektor: "infrastruktura",
    iznos_min: 50000,
    iznos_max: 200000,
    odobrenost_opstine: true,
    ai_sazetak:
      "MULS finansira digitalizaciju javnih usluga u opštinama RS – e-portali, integracija registara, obuka službenika. Prihvatljivi aplikanti: opštine i gradovi.",
    status: "aktivan",
  },
  {
    id: "demo-muls-2",
    naslov: "Program podrške razvoju lokalne infrastrukture u malim opštinama",
    izvor_url: "https://www.muls.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-04-10",
    rok_prijave: "2026-05-20",
    sektor: "infrastruktura",
    iznos_min: 30000,
    iznos_max: 100000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Ministarstvo uprave i lokalne samouprave RS podržava kapitalne investicije u opštinama do 15.000 stanovnika: putevi, vodosnabdijevanje, komunalni objekti.",
    status: "aktivan",
  },

  // ─── Ministarstvo privrede i preduzetništva RS ────────────────────────────
  {
    id: "demo-mpp-1",
    naslov: "Javni poziv za dodjelu grant sredstava malim i srednjim preduzećima",
    izvor_url: "https://www.mpp.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-04-22",
    rok_prijave: "2026-06-01",
    sektor: "privreda",
    iznos_min: 10000,
    iznos_max: 50000,
    odobrenost_opstine: false,
    ai_sazetak:
      "Podrška MSP-ima u RS za nabavku opreme, uvođenje standarda i internacionalizaciju. Opštine kao partner prihvatljive u projektima klasterskog razvoja.",
    status: "aktivan",
  },
  {
    id: "demo-mpp-2",
    naslov: "Podrška razvoju turizma i ugostiteljstva u RS",
    izvor_url: "https://www.mpp.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-03-05",
    rok_prijave: "2026-04-10",
    sektor: "turizam",
    iznos_min: 15000,
    iznos_max: 60000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Grant za razvoj turističke infrastrukture, seoskog i kulturnog turizma. Prihvatljive su lokalne zajednice, NVO i turistička preduzeća.",
    status: "istekao",
  },

  // ─── Ministarstvo nauke i tehnologije RS ──────────────────────────────────
  {
    id: "demo-mnk-1",
    naslov: "Javni poziv za finansiranje naučnoistraživačkih projekata",
    izvor_url: "https://www.mnk.vladars.net/sr/konkursi",
    datum_objave: "2026-05-01",
    rok_prijave: "2026-07-01",
    sektor: "obrazovanje",
    iznos_min: 20000,
    iznos_max: 80000,
    odobrenost_opstine: false,
    ai_sazetak:
      "Ministarstvo nauke RS raspisuje poziv za istraživačke institucije i visokoškolske ustanove. Projekte moguće vezati za potrebe lokalne zajednice.",
    status: "aktivan",
  },

  // ─── Ministarstvo poljoprivrede, šumarstva i vodoprivrede RS ─────────────
  {
    id: "demo-mps-1",
    naslov: "Podrška razvoju poljoprivrednih zadruga i ruralne infrastrukture",
    izvor_url: "https://www.mps.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-04-20",
    rok_prijave: "2026-05-28",
    sektor: "poljoprivreda",
    iznos_min: 20000,
    iznos_max: 80000,
    odobrenost_opstine: false,
    ai_sazetak:
      "Namijenjeno zadrugama i lokalnim lancima vrijednosti u RS; opštine mogu učestvovati kao partner u ruralnoj infrastrukturi.",
    status: "aktivan",
  },
  {
    id: "demo-mps-2",
    naslov: "Subvencije za navodnjavање i vodoprivredne projekte",
    izvor_url: "https://www.mps.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-03-01",
    rok_prijave: "2026-03-31",
    sektor: "poljoprivreda",
    iznos_min: 50000,
    iznos_max: 250000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Finansiranje sustava za navodnjavanje, regulaciju vodotoka i zaštitu od poplava. Prioritet: opštine u ravničarskim i poplavnim područjima.",
    status: "istekao",
  },

  // ─── Ministarstvo prostornog uređenja, građevinarstva i ekologije RS ──────
  {
    id: "demo-mgr-1",
    naslov: "Javni poziv za sufinansiranje projekata energetske efikasnosti",
    izvor_url: "https://www.mgr.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-04-15",
    rok_prijave: "2026-06-30",
    sektor: "energetika",
    iznos_min: 30000,
    iznos_max: 200000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Sufinansiranje rekonstrukcije stambenih i javnih zgrada radi smanjenja energetske potrošnje. Prihvatljivi: opštine, stambene zajednice, javne institucije.",
    status: "aktivan",
  },

  // ─── Fond za zaštitu životne sredine i energetsku efikasnost RS ──────────
  {
    id: "demo-fzo-1",
    naslov: "Energetska efikasnost javnih objekata – zamjena toplotnih sistema",
    izvor_url: "https://www.fzors.ba/javni-pozivi",
    datum_objave: "2026-03-18",
    rok_prijave: "2026-04-15",
    sektor: "energetika",
    iznos_min: 100000,
    iznos_max: 300000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Program FZO RS podržava obnovu javnih objekata, zamjenu stolarije i sisteme grijanja sa naglaskom na smanjenje potrošnje energije.",
    status: "istekao",
  },
  {
    id: "demo-fzo-2",
    naslov: "Javni poziv za projekte upravljanja otpadom i reciklaže",
    izvor_url: "https://www.fzors.ba/javni-pozivi",
    datum_objave: "2026-05-03",
    rok_prijave: "2026-06-20",
    sektor: "ekologija",
    iznos_min: 20000,
    iznos_max: 120000,
    odobrenost_opstine: true,
    ai_sazetak:
      "FZO RS finansira uspostavljanje sistema selektivnog prikupljanja otpada, reciklažnih dvorišta i edukativnih kampanja u opštinama.",
    status: "aktivan",
  },

  // ─── RARS – Razvojna agencija RS (MSP) ───────────────────────────────────
  {
    id: "demo-rars-1",
    naslov: "Javni poziv za dodjelu vaučera za digitalizaciju MSP",
    izvor_url: "https://www.rars-msp.org/javni-pozivi",
    datum_objave: "2026-04-28",
    rok_prijave: "2026-06-10",
    sektor: "privreda",
    iznos_min: 5000,
    iznos_max: 20000,
    odobrenost_opstine: false,
    ai_sazetak:
      "RARS-MSP dodijeljuje vaučere malim preduzećima za nabavku digitalnih alata, e-commerce rješenja i kibernetičke sigurnosti.",
    status: "aktivan",
  },
  {
    id: "demo-rars-2",
    naslov: "Program podrške izvozu i internacionalizaciji preduzeća RS",
    izvor_url: "https://www.rars-msp.org/javni-pozivi",
    datum_objave: "2026-04-01",
    rok_prijave: "2026-05-15",
    sektor: "privreda",
    iznos_min: 8000,
    iznos_max: 30000,
    odobrenost_opstine: false,
    ai_sazetak:
      "Sufinansiranje učešća na sajmovima, certifikacije i marketinških aktivnosti za izlazak na međunarodna tržišta. Namijenjen MSP-ima sa sjedištem u RS.",
    status: "aktivan",
  },

  // ─── Investiciono-razvojna banka RS (IRB) ────────────────────────────────
  {
    id: "demo-irb-1",
    naslov: "Kreditna linija za komunalna preduzeća i jedinice lokalne samouprave",
    izvor_url: "https://www.irbrs.org/sr/krediti/javni-sektor",
    datum_objave: "2026-01-15",
    rok_prijave: null,
    sektor: "infrastruktura",
    iznos_min: 200000,
    iznos_max: 5000000,
    odobrenost_opstine: true,
    ai_sazetak:
      "IRB RS nudi povoljne kreditne linije za opštine i komunalna preduzeća – izgradnja i rekonstrukcija komunalne infrastrukture, vodovodnih mreža i deponija.",
    status: "aktivan",
  },

  // ─── EU / IPA fondovi ─────────────────────────────────────────────────────
  {
    id: "demo-eu-1",
    naslov: "IPA III – Javni poziv za projekte demokratskog upravljanja u BiH",
    izvor_url: "https://neighbourhood-enlargement.ec.europa.eu/funding-and-technical-assistance/funding-instruments-pre-accession/ipa-iii_en",
    datum_objave: "2026-04-05",
    rok_prijave: "2026-07-15",
    sektor: "uprava",
    iznos_min: 100000,
    iznos_max: 800000,
    odobrenost_opstine: true,
    ai_sazetak:
      "EU IPA III finansira projekte jačanja demokratskog upravljanja, rodne ravnopravnosti, vladavine prava i lokalne uprave u BiH. Opštine prihvatljive kao korisnici.",
    status: "aktivan",
  },
  {
    id: "demo-eu-2",
    naslov: "INTERREG IPA CBC – Jadransko-jonski program (HR-BiH-ME)",
    izvor_url: "https://www.adriatic-ionian.eu/calls-for-proposals/",
    datum_objave: "2026-03-20",
    rok_prijave: "2026-06-01",
    sektor: "turizam",
    iznos_min: 200000,
    iznos_max: 2000000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Prekogranični program za Jadransko-jonsku regiju financira projekte turizma, kulturne baštine, okoliša i pametnog razvoja. Obavezno partnerstvo sa organizacijom iz druge države.",
    status: "aktivan",
  },
  {
    id: "demo-eu-3",
    naslov: "EU4Business – Podrška razvoju MSP i zapošljavanju",
    izvor_url: "https://eu4business.eu/grants/",
    datum_objave: "2026-04-12",
    rok_prijave: "2026-06-30",
    sektor: "privreda",
    iznos_min: 50000,
    iznos_max: 500000,
    odobrenost_opstine: false,
    ai_sazetak:
      "EU4Business program u BiH podržava mala i srednja preduzeća kroz grantove za inovacije, zelenu ekonomiju i digitalizaciju. Partnerstvo sa opštinom povećava bodove.",
    status: "aktivan",
  },

  // ─── UNDP BiH ─────────────────────────────────────────────────────────────
  {
    id: "demo-undp-1",
    naslov: "UNDP – Lokalni razvoj i otpornost zajednica (LOGO programa)",
    izvor_url: "https://www.undp.org/bosnia-herzegovina/procurement",
    datum_objave: "2026-04-18",
    rok_prijave: "2026-06-18",
    sektor: "uprava",
    iznos_min: 30000,
    iznos_max: 150000,
    odobrenost_opstine: true,
    ai_sazetak:
      "UNDP BiH finansira projekte lokalne demokratije, inkluzivnog upravljanja i kapaciteta lokalnih vlada. Naglasak na marginalizovanim grupama i klimatskoj otpornosti.",
    status: "aktivan",
  },
  {
    id: "demo-undp-2",
    naslov: "UNDP – Zelena ekonomija i energetska tranzicija",
    izvor_url: "https://www.undp.org/bosnia-herzegovina/projects",
    datum_objave: "2026-05-01",
    rok_prijave: "2026-07-01",
    sektor: "energetika",
    iznos_min: 50000,
    iznos_max: 300000,
    odobrenost_opstine: true,
    ai_sazetak:
      "UNDP finansira projekte obnovljivih izvora energije, energetske efikasnosti i zelene infrastrukture sa fokusom na lokalne zajednice i javne zgrade.",
    status: "aktivan",
  },

  // ─── GIZ BiH ──────────────────────────────────────────────────────────────
  {
    id: "demo-giz-1",
    naslov: "GIZ – Podrška reformi lokalne samouprave i pružanju usluga",
    izvor_url: "https://www.giz.de/en/worldwide/306.html",
    datum_objave: "2026-03-25",
    rok_prijave: "2026-05-25",
    sektor: "uprava",
    iznos_min: 20000,
    iznos_max: 100000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Njemačka razvojna saradnja (GIZ) podržava jačanje kapaciteta opštinskih uprava u pružanju komunalnih usluga, transparentnosti i participativnom planiranju.",
    status: "aktivan",
  },

  // ─── Swiss Cooperation (SDC) ──────────────────────────────────────────────
  {
    id: "demo-sdc-1",
    naslov: "Swiss PRO – Inkluzivni društveno-ekonomski razvoj opština",
    izvor_url: "https://www.swiss-pro.ba/pozivi-za-aplikacije/",
    datum_objave: "2026-04-01",
    rok_prijave: "2026-05-30",
    sektor: "uprava",
    iznos_min: 30000,
    iznos_max: 200000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Švicarska Agencija za razvoj i saradnju (SDC) finansira inicijative za smanjenje siromaštva, inkluziju ranjivih grupa i unapređenje komunalnih usluga u opštinama RS i FBiH.",
    status: "aktivan",
  },

  // ─── USAID BiH ────────────────────────────────────────────────────────────
  {
    id: "demo-usaid-1",
    naslov: "USAID KAIZEN – Poboljšanje poslovnog okruženja na lokalnom nivou",
    izvor_url: "https://www.usaid.gov/bosnia-and-herzegovina",
    datum_objave: "2026-03-10",
    rok_prijave: "2026-05-10",
    sektor: "privreda",
    iznos_min: 20000,
    iznos_max: 120000,
    odobrenost_opstine: true,
    ai_sazetak:
      "USAID program podržava opštine u uklanjanju administrativnih prepreka za biznis, uvođenju investicijskog okruženja i digitalnim registrima imovine.",
    status: "aktivan",
  },

  // ─── OSCE BiH ─────────────────────────────────────────────────────────────
  {
    id: "demo-osce-1",
    naslov: "OSCE – Grantovi za organizacije civilnog društva (demokratizacija)",
    izvor_url: "https://www.osce.org/mission-to-bosnia-and-herzegovina/grants",
    datum_objave: "2026-04-08",
    rok_prijave: "2026-06-08",
    sektor: "uprava",
    iznos_min: 5000,
    iznos_max: 25000,
    odobrenost_opstine: false,
    ai_sazetak:
      "OSCE Misija u BiH raspisuje grantove za NVO i lokalne organizacije koje rade na demokratizaciji, izbornoj reformi, slobodi medija i rodnoj ravnopravnosti.",
    status: "aktivan",
  },

  // ─── Ministarstvo zdravlja i socijalne zaštite RS ─────────────────────────
  {
    id: "demo-mzsz-1",
    naslov: "Javni poziv za sufinansiranje programa socijalne zaštite",
    izvor_url: "https://www.mzsz.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-04-25",
    rok_prijave: "2026-06-05",
    sektor: "socijala",
    iznos_min: 10000,
    iznos_max: 60000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Ministarstvo zdravlja i socijalne zaštite RS sufinansira programe dnevnih centara, pomoći u kući i inkluzije osoba sa invaliditetom na nivou lokalne zajednice.",
    status: "aktivan",
  },

  // ─── Ministarstvo prosvjete i kulture RS ─────────────────────────────────
  {
    id: "demo-mpk-1",
    naslov: "Konkurs za sufinansiranje kulturnih manifestacija od značaja za RS",
    izvor_url: "https://www.mpk.vladars.net/sr/konkursi",
    datum_objave: "2026-04-14",
    rok_prijave: "2026-05-14",
    sektor: "kultura",
    iznos_min: 5000,
    iznos_max: 30000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Sufinansiranje kulturnih projekata, manifestacija i festival koji promovišu kulturnu baštinu RS. Prihvatljivi: opštine, ustanove kulture, NVO u kulturi.",
    status: "aktivan",
  },
  {
    id: "demo-mpk-2",
    naslov: "Javni poziv za rekonstrukciju kulturno-historijskih objekata",
    izvor_url: "https://www.mpk.vladars.net/sr/konkursi",
    datum_objave: "2026-03-01",
    rok_prijave: "2026-04-01",
    sektor: "kultura",
    iznos_min: 20000,
    iznos_max: 150000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Ministarstvo prosvjete i kulture RS finansira obnovu i rekonstrukciju zaštićenih kulturno-historijskih graditeljskih objekata u vlasništvu opština.",
    status: "istekao",
  },

  // ─── Ministarstvo sporta i omladine RS ───────────────────────────────────
  {
    id: "demo-mso-1",
    naslov: "Javni poziv za sufinansiranje sportske infrastrukture u RS",
    izvor_url: "https://www.moso.vladars.net/sr/javni-pozivi",
    datum_objave: "2026-05-05",
    rok_prijave: "2026-06-15",
    sektor: "sport",
    iznos_min: 10000,
    iznos_max: 80000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Ministarstvo sporta i omladine RS sufinansira izgradnju i rekonstrukciju sportskih sala, terena i bazena u opštinama. Prioritet: dostupnost djeci i osobama sa invaliditetom.",
    status: "aktivan",
  },

  // ─── Fond PIO RS ──────────────────────────────────────────────────────────
  {
    id: "demo-pio-1",
    naslov: "Poziv za organizacije koje pružaju usluge starijim licima",
    izvor_url: "https://www.fondpio.org/",
    datum_objave: "2026-04-20",
    rok_prijave: "2026-05-31",
    sektor: "socijala",
    iznos_min: 8000,
    iznos_max: 40000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Fond PIO RS podržava servise za starija lica: dnevni centri, kućna njega, prevoz do zdravstvenih ustanova. Prihvatljive su opštine i NVO sa licencom.",
    status: "aktivan",
  },
];

export function formatCurrencyRange(min: number | null, max: number | null) {
  if (min == null && max == null) {
    return "Nije objavljeno";
  }

  const format = new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  if (min != null && max != null) {
    return `${format.format(min)} - ${format.format(max)}`;
  }

  return format.format(min ?? max ?? 0);
}

export function getDeadlineTone(deadline: string | null, status: KonkursStatus) {
  if (status === "istekao") {
    return "bg-zinc-300 text-zinc-800";
  }

  if (!deadline) {
    return "bg-amber-200 text-amber-900";
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return "bg-zinc-300 text-zinc-800";
  }

  if (daysLeft < 7) {
    return "bg-rose-500 text-white";
  }

  if (daysLeft < 21) {
    return "bg-amber-400 text-amber-950";
  }

  return "bg-emerald-500 text-white";
}

export function getDeadlineLabel(deadline: string | null, status: KonkursStatus) {
  if (status === "istekao") {
    return "Istekao";
  }

  if (!deadline) {
    return "Rok nije objavljen";
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return "Istekao";
  }

  if (daysLeft === 0) {
    return "Ističe danas";
  }

  return `Ističe za ${daysLeft} dana`;
}