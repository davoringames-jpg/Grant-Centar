-- Seed: svi konkursi (ministarstva RS, fondovi, EU, međunarodni donatori)
-- Pokretati u Supabase SQL Editoru

INSERT INTO public.konkursi
  (id, naslov, izvor_url, datum_objave, rok_prijave, sektor, iznos_min, iznos_max, odobrenost_opstine, ai_sazetak, status)
VALUES

-- ─── Vlada RS / MULS ───────────────────────────────────────────────────────
(
  'a1000001-0000-0000-0000-000000000001',
  'Javni poziv za podršku projektima digitalizacije lokalne samouprave',
  'https://www.muls.vladars.net/sr/javni-pozivi',
  '2026-05-02', '2026-06-15', 'infrastruktura', 50000, 200000, true,
  'MULS finansira digitalizaciju javnih usluga u opštinama RS – e-portali, integracija registara, obuka službenika. Prihvatljivi aplikanti: opštine i gradovi.',
  'aktivan'
),
(
  'a1000001-0000-0000-0000-000000000002',
  'Program podrške razvoju lokalne infrastrukture u malim opštinama',
  'https://www.muls.vladars.net/sr/javni-pozivi',
  '2026-04-10', '2026-05-20', 'infrastruktura', 30000, 100000, true,
  'Ministarstvo uprave i lokalne samouprave RS podržava kapitalne investicije u opštinama do 15.000 stanovnika: putevi, vodosnabdijevanje, komunalni objekti.',
  'aktivan'
),

-- ─── Ministarstvo privrede i preduzetništva RS ────────────────────────────
(
  'a1000002-0000-0000-0000-000000000001',
  'Javni poziv za dodjelu grant sredstava malim i srednjim preduzećima',
  'https://www.mpp.vladars.net/sr/javni-pozivi',
  '2026-04-22', '2026-06-01', 'privreda', 10000, 50000, false,
  'Podrška MSP-ima u RS za nabavku opreme, uvođenje standarda i internacionalizaciju. Opštine kao partner prihvatljive u projektima klasterskog razvoja.',
  'aktivan'
),
(
  'a1000002-0000-0000-0000-000000000002',
  'Podrška razvoju turizma i ugostiteljstva u RS',
  'https://www.mpp.vladars.net/sr/javni-pozivi',
  '2026-03-05', '2026-04-10', 'turizam', 15000, 60000, true,
  'Grant za razvoj turističke infrastrukture, seoskog i kulturnog turizma. Prihvatljive su lokalne zajednice, NVO i turistička preduzeća.',
  'istekao'
),

-- ─── Ministarstvo nauke i tehnologije RS ──────────────────────────────────
(
  'a1000003-0000-0000-0000-000000000001',
  'Javni poziv za finansiranje naučnoistraživačkih projekata',
  'https://www.mnk.vladars.net/sr/konkursi',
  '2026-05-01', '2026-07-01', 'obrazovanje', 20000, 80000, false,
  'Ministarstvo nauke RS raspisuje poziv za istraživačke institucije i visokoškolske ustanove. Projekte moguće vezati za potrebe lokalne zajednice.',
  'aktivan'
),

-- ─── Ministarstvo poljoprivrede, šumarstva i vodoprivrede RS ─────────────
(
  'a1000004-0000-0000-0000-000000000001',
  'Podrška razvoju poljoprivrednih zadruga i ruralne infrastrukture',
  'https://www.mps.vladars.net/sr/javni-pozivi',
  '2026-04-20', '2026-05-28', 'poljoprivreda', 20000, 80000, false,
  'Namijenjeno zadrugama i lokalnim lancima vrijednosti u RS; opštine mogu učestvovati kao partner u ruralnoj infrastrukturi.',
  'aktivan'
),
(
  'a1000004-0000-0000-0000-000000000002',
  'Subvencije za navodnjavanje i vodoprivredne projekte',
  'https://www.mps.vladars.net/sr/javni-pozivi',
  '2026-03-01', '2026-03-31', 'poljoprivreda', 50000, 250000, true,
  'Finansiranje sustava za navodnjavanje, regulaciju vodotoka i zaštitu od poplava. Prioritet: opštine u ravničarskim i poplavnim područjima.',
  'istekao'
),

-- ─── Ministarstvo prostornog uređenja, građevinarstva i ekologije RS ──────
(
  'a1000005-0000-0000-0000-000000000001',
  'Javni poziv za sufinansiranje projekata energetske efikasnosti',
  'https://www.mgr.vladars.net/sr/javni-pozivi',
  '2026-04-15', '2026-06-30', 'energetika', 30000, 200000, true,
  'Sufinansiranje rekonstrukcije stambenih i javnih zgrada radi smanjenja energetske potrošnje. Prihvatljivi: opštine, stambene zajednice, javne institucije.',
  'aktivan'
),

-- ─── Fond za zaštitu životne sredine i energetsku efikasnost RS ──────────
(
  'a1000006-0000-0000-0000-000000000001',
  'Energetska efikasnost javnih objekata – zamjena toplotnih sistema',
  'https://www.fzors.ba/javni-pozivi',
  '2026-03-18', '2026-04-15', 'energetika', 100000, 300000, true,
  'Program FZO RS podržava obnovu javnih objekata, zamjenu stolarije i sisteme grijanja sa naglaskom na smanjenje potrošnje energije.',
  'istekao'
),
(
  'a1000006-0000-0000-0000-000000000002',
  'Javni poziv za projekte upravljanja otpadom i reciklaže',
  'https://www.fzors.ba/javni-pozivi',
  '2026-05-03', '2026-06-20', 'ekologija', 20000, 120000, true,
  'FZO RS finansira uspostavljanje sistema selektivnog prikupljanja otpada, reciklažnih dvorišta i edukativnih kampanja u opštinama.',
  'aktivan'
),

-- ─── RARS – Razvojna agencija RS (MSP) ───────────────────────────────────
(
  'a1000007-0000-0000-0000-000000000001',
  'Javni poziv za dodjelu vaučera za digitalizaciju MSP',
  'https://www.rars-msp.org/javni-pozivi',
  '2026-04-28', '2026-06-10', 'privreda', 5000, 20000, false,
  'RARS-MSP dodijeljuje vaučere malim preduzećima za nabavku digitalnih alata, e-commerce rješenja i kibernetičke sigurnosti.',
  'aktivan'
),
(
  'a1000007-0000-0000-0000-000000000002',
  'Program podrške izvozu i internacionalizaciji preduzeća RS',
  'https://www.rars-msp.org/javni-pozivi',
  '2026-04-01', '2026-05-15', 'privreda', 8000, 30000, false,
  'Sufinansiranje učešća na sajmovima, certifikacije i marketinških aktivnosti za izlazak na međunarodna tržišta. Namijenjen MSP-ima sa sjedištem u RS.',
  'aktivan'
),

-- ─── Investiciono-razvojna banka RS (IRB) ────────────────────────────────
(
  'a1000008-0000-0000-0000-000000000001',
  'Kreditna linija za komunalna preduzeća i jedinice lokalne samouprave',
  'https://www.irbrs.org/sr/krediti/javni-sektor',
  '2026-01-15', NULL, 'infrastruktura', 200000, 5000000, true,
  'IRB RS nudi povoljne kreditne linije za opštine i komunalna preduzeća – izgradnja i rekonstrukcija komunalne infrastrukture, vodovodnih mreža i deponija.',
  'aktivan'
),

-- ─── EU / IPA fondovi ─────────────────────────────────────────────────────
(
  'a1000009-0000-0000-0000-000000000001',
  'IPA III – Javni poziv za projekte demokratskog upravljanja u BiH',
  'https://neighbourhood-enlargement.ec.europa.eu/funding-and-technical-assistance/funding-instruments-pre-accession/ipa-iii_en',
  '2026-04-05', '2026-07-15', 'uprava', 100000, 800000, true,
  'EU IPA III finansira projekte jačanja demokratskog upravljanja, rodne ravnopravnosti, vladavine prava i lokalne uprave u BiH. Opštine prihvatljive kao korisnici.',
  'aktivan'
),
(
  'a1000009-0000-0000-0000-000000000002',
  'INTERREG IPA CBC – Jadransko-jonski program (HR-BiH-ME)',
  'https://www.adriatic-ionian.eu/calls-for-proposals/',
  '2026-03-20', '2026-06-01', 'turizam', 200000, 2000000, true,
  'Prekogranični program za Jadransko-jonsku regiju finansira projekte turizma, kulturne baštine, okoliša i pametnog razvoja. Obavezno partnerstvo iz druge države.',
  'aktivan'
),
(
  'a1000009-0000-0000-0000-000000000003',
  'EU4Business – Podrška razvoju MSP i zapošljavanju',
  'https://eu4business.eu/grants/',
  '2026-04-12', '2026-06-30', 'privreda', 50000, 500000, false,
  'EU4Business program u BiH podržava mala i srednja preduzeća kroz grantove za inovacije, zelenu ekonomiju i digitalizaciju. Partnerstvo sa opštinom povećava bodove.',
  'aktivan'
),

-- ─── UNDP BiH ─────────────────────────────────────────────────────────────
(
  'a1000010-0000-0000-0000-000000000001',
  'UNDP – Lokalni razvoj i otpornost zajednica',
  'https://www.undp.org/bosnia-herzegovina/procurement',
  '2026-04-18', '2026-06-18', 'uprava', 30000, 150000, true,
  'UNDP BiH finansira projekte lokalne demokratije, inkluzivnog upravljanja i kapaciteta lokalnih vlada. Naglasak na marginalizovanim grupama i klimatskoj otpornosti.',
  'aktivan'
),
(
  'a1000010-0000-0000-0000-000000000002',
  'UNDP – Zelena ekonomija i energetska tranzicija',
  'https://www.undp.org/bosnia-herzegovina/projects',
  '2026-05-01', '2026-07-01', 'energetika', 50000, 300000, true,
  'UNDP finansira projekte obnovljivih izvora energije, energetske efikasnosti i zelene infrastrukture sa fokusom na lokalne zajednice i javne zgrade.',
  'aktivan'
),

-- ─── GIZ BiH ──────────────────────────────────────────────────────────────
(
  'a1000011-0000-0000-0000-000000000001',
  'GIZ – Podrška reformi lokalne samouprave i pružanju usluga',
  'https://www.giz.de/en/worldwide/306.html',
  '2026-03-25', '2026-05-25', 'uprava', 20000, 100000, true,
  'Njemačka razvojna saradnja (GIZ) podržava jačanje kapaciteta opštinskih uprava u pružanju komunalnih usluga, transparentnosti i participativnom planiranju.',
  'aktivan'
),

-- ─── Swiss Cooperation (SDC) ──────────────────────────────────────────────
(
  'a1000012-0000-0000-0000-000000000001',
  'Swiss PRO – Inkluzivni društveno-ekonomski razvoj opština',
  'https://www.swiss-pro.ba/pozivi-za-aplikacije/',
  '2026-04-01', '2026-05-30', 'uprava', 30000, 200000, true,
  'Švicarska razvojna agencija (SDC) finansira inicijative za smanjenje siromaštva, inkluziju ranjivih grupa i unapređenje komunalnih usluga u opštinama RS i FBiH.',
  'aktivan'
),

-- ─── USAID BiH ────────────────────────────────────────────────────────────
(
  'a1000013-0000-0000-0000-000000000001',
  'USAID KAIZEN – Poboljšanje poslovnog okruženja na lokalnom nivou',
  'https://www.usaid.gov/bosnia-and-herzegovina',
  '2026-03-10', '2026-05-10', 'privreda', 20000, 120000, true,
  'USAID program podržava opštine u uklanjanju administrativnih prepreka za biznis, uvođenju investicijskog okruženja i digitalnim registrima imovine.',
  'aktivan'
),

-- ─── OSCE BiH ─────────────────────────────────────────────────────────────
(
  'a1000014-0000-0000-0000-000000000001',
  'OSCE – Grantovi za organizacije civilnog društva (demokratizacija)',
  'https://www.osce.org/mission-to-bosnia-and-herzegovina/grants',
  '2026-04-08', '2026-06-08', 'uprava', 5000, 25000, false,
  'OSCE Misija u BiH raspisuje grantove za NVO i lokalne organizacije koje rade na demokratizaciji, izbornoj reformi, slobodi medija i rodnoj ravnopravnosti.',
  'aktivan'
),

-- ─── Ministarstvo zdravlja i socijalne zaštite RS ─────────────────────────
(
  'a1000015-0000-0000-0000-000000000001',
  'Javni poziv za sufinansiranje programa socijalne zaštite',
  'https://www.mzsz.vladars.net/sr/javni-pozivi',
  '2026-04-25', '2026-06-05', 'socijala', 10000, 60000, true,
  'Ministarstvo zdravlja i socijalne zaštite RS sufinansira programe dnevnih centara, pomoći u kući i inkluzije osoba sa invaliditetom na nivou lokalne zajednice.',
  'aktivan'
),

-- ─── Ministarstvo prosvjete i kulture RS ─────────────────────────────────
(
  'a1000016-0000-0000-0000-000000000001',
  'Konkurs za sufinansiranje kulturnih manifestacija od značaja za RS',
  'https://www.mpk.vladars.net/sr/konkursi',
  '2026-04-14', '2026-05-14', 'kultura', 5000, 30000, true,
  'Sufinansiranje kulturnih projekata, manifestacija i festivala koji promovišu kulturnu baštinu RS. Prihvatljivi: opštine, ustanove kulture, NVO u kulturi.',
  'aktivan'
),
(
  'a1000016-0000-0000-0000-000000000002',
  'Javni poziv za rekonstrukciju kulturno-historijskih objekata',
  'https://www.mpk.vladars.net/sr/konkursi',
  '2026-03-01', '2026-04-01', 'kultura', 20000, 150000, true,
  'Ministarstvo prosvjete i kulture RS finansira obnovu i rekonstrukciju zaštićenih kulturno-historijskih graditeljskih objekata u vlasništvu opština.',
  'istekao'
),

-- ─── Ministarstvo sporta i omladine RS ───────────────────────────────────
(
  'a1000017-0000-0000-0000-000000000001',
  'Javni poziv za sufinansiranje sportske infrastrukture u RS',
  'https://www.moso.vladars.net/sr/javni-pozivi',
  '2026-05-05', '2026-06-15', 'sport', 10000, 80000, true,
  'Ministarstvo sporta i omladine RS sufinansira izgradnju i rekonstrukciju sportskih sala, terena i bazena u opštinama. Prioritet: dostupnost djeci i osobama sa invaliditetom.',
  'aktivan'
),

-- ─── Fond PIO RS ──────────────────────────────────────────────────────────
(
  'a1000018-0000-0000-0000-000000000001',
  'Poziv za organizacije koje pružaju usluge starijim licima',
  'https://www.fondpio.org/',
  '2026-04-20', '2026-05-31', 'socijala', 8000, 40000, true,
  'Fond PIO RS podržava servise za starija lica: dnevni centri, kućna njega, prevoz do zdravstvenih ustanova. Prihvatljive su opštine i NVO sa licencom.',
  'aktivan'
)

ON CONFLICT (id) DO UPDATE SET
  naslov            = EXCLUDED.naslov,
  izvor_url         = EXCLUDED.izvor_url,
  datum_objave      = EXCLUDED.datum_objave,
  rok_prijave       = EXCLUDED.rok_prijave,
  sektor            = EXCLUDED.sektor,
  iznos_min         = EXCLUDED.iznos_min,
  iznos_max         = EXCLUDED.iznos_max,
  odobrenost_opstine = EXCLUDED.odobrenost_opstine,
  ai_sazetak        = EXCLUDED.ai_sazetak,
  status            = EXCLUDED.status;

-- Provjera
SELECT id, naslov, sektor, status FROM public.konkursi ORDER BY datum_objave DESC;
