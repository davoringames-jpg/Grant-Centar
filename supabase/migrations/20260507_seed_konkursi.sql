-- Seed: 27 demo konkursa/javnih poziva za opštine RS
-- Pokrenuti NAKON 20260507_konkursi_table.sql

-- Dodaj kolonu ako već ne postoji (kompatibilnost sa starijim verzijama tabele)
ALTER TABLE public.konkursi ADD COLUMN IF NOT EXISTS donator text;

-- Ukloni duplikate (zadrži najnoviji red po izvor_url)
DELETE FROM public.konkursi
WHERE id NOT IN (
  SELECT DISTINCT ON (izvor_url) id
  FROM public.konkursi
  ORDER BY izvor_url, created_at DESC
);

-- Dodaj unique constraint ako već ne postoji
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.konkursi'::regclass
      AND contype = 'u'
      AND conname = 'konkursi_izvor_url_key'
  ) THEN
    ALTER TABLE public.konkursi ADD CONSTRAINT konkursi_izvor_url_key UNIQUE (izvor_url);
  END IF;
END $$;

INSERT INTO public.konkursi
  (naslov, izvor_url, datum_objave, rok_prijave, sektor, donator, iznos_min, iznos_max, odobrenost_opstine, status)
VALUES
  ('Javni poziv za sufinansiranje projekata razvoja turizma u RS',
   'https://www.vladars.net/sr/vlada/ministarstva/mtur/javni_pozivi/Pages/default.aspx?konkurs=001',
   '2026-03-01', '2026-06-30', 'turizam', 'Vlada RS', 5000, 50000, true, 'aktivan'),

  ('Poziv za dodjelu sredstava za ruralni razvoj i poljoprivredu',
   'https://www.vladars.net/sr/vlada/ministarstva/mps/javni_pozivi/Pages/default.aspx?konkurs=002',
   '2026-02-15', '2026-05-31', 'poljoprivreda', 'Ministarstvo poljoprivrede RS', 10000, 100000, true, 'aktivan'),

  ('Javni konkurs za finansiranje projekata zaštite životne sredine',
   'https://www.vladars.net/sr/vlada/ministarstva/mgr/javni_pozivi/Pages/default.aspx?konkurs=003',
   '2026-03-10', '2026-07-10', 'ekologija', 'Fond za zaštitu životne sredine RS', 8000, 80000, true, 'aktivan'),

  ('Poziv za podršku razvoju lokalne infrastrukture – INTERREG',
   'https://www.interreg-adrion.eu/calls/2026-infrastructure',
   '2026-01-20', '2026-06-15', 'infrastruktura', 'INTERREG Adrion', 50000, 500000, true, 'aktivan'),

  ('IPA III – Jačanje kapaciteta lokalne samouprave u BiH',
   'https://www.dei.gov.ba/ipa/2026/lokalna-samouprava',
   '2026-02-01', '2026-06-01', 'upravljanje', 'Evropska unija / IPA III', 30000, 200000, true, 'aktivan'),

  ('Javni poziv za sufinansiranje projekata kulture i baštine',
   'https://www.vladars.net/sr/vlada/ministarstva/mpr/javni_pozivi/Pages/default.aspx?konkurs=004',
   '2026-03-15', '2026-05-15', 'kultura', 'Ministarstvo prosvjete i kulture RS', 3000, 30000, true, 'aktivan'),

  ('Konkurs za razvoj MSP – Garantni fond RS',
   'https://www.garantnifond.rs.ba/konkursi/2026-msp',
   '2026-01-10', '2026-12-31', 'ekonomski razvoj', 'Garantni fond RS', 20000, 300000, true, 'aktivan'),

  ('Poziv za projekte digitalizacije javnih usluga – UNDP BiH',
   'https://www.undp.org/bosnia-herzegovina/calls/2026-digitalizacija',
   '2026-03-20', '2026-07-20', 'digitalizacija', 'UNDP', 15000, 150000, true, 'aktivan'),

  ('Javni poziv za energetsku efikasnost u zgradama javne namjene',
   'https://www.rars-msp.org/javni-pozivi/energetska-efikasnost-2026',
   '2026-02-28', '2026-06-28', 'energetika', 'RARS-MSP / EU', 25000, 250000, true, 'aktivan'),

  ('Poziv za podršku inkluziji osoba sa invaliditetom – opštinski projekti',
   'https://www.unicef.org/bih/calls/2026-inkluzija',
   '2026-04-01', '2026-07-01', 'socijala', 'UNICEF', 10000, 80000, true, 'aktivan'),

  ('Javni konkurs za unapređenje sistema upravljanja otpadom',
   'https://www.vladars.net/sr/vlada/ministarstva/mgr/javni_pozivi/Pages/default.aspx?konkurs=005',
   '2026-03-05', '2026-06-05', 'ekologija', 'Ministarstvo za građevinarstvo RS', 20000, 200000, true, 'aktivan'),

  ('Poziv za razvoj sportske infrastrukture u lokalnim zajednicama',
   'https://www.vladars.net/sr/vlada/ministarstva/mss/javni_pozivi/Pages/default.aspx?konkurs=006',
   '2026-02-10', '2026-05-10', 'sport', 'Ministarstvo porodice RS', 5000, 50000, true, 'aktivan'),

  ('WBIF – Regionalni razvojni projekti u Zapadnom Balkanu',
   'https://www.wbif.eu/calls/2026-regional',
   '2026-01-15', '2026-09-30', 'infrastruktura', 'WBIF', 100000, 2000000, true, 'aktivan'),

  ('Javni poziv za projekte sigurnosti saobraćaja – lokalni nivo',
   'https://www.vladars.net/sr/vlada/ministarstva/mup/javni_pozivi/Pages/default.aspx?konkurs=007',
   '2026-03-25', '2026-06-25', 'bezbjednost', 'MUP RS', 5000, 40000, true, 'aktivan'),

  ('Poziv za sufinansiranje vodovoda i kanalizacije – EBRD',
   'https://www.ebrd.com/calls/bih-water-2026',
   '2026-02-20', '2026-08-20', 'vodovod', 'EBRD', 200000, 5000000, true, 'aktivan'),

  ('Javni poziv za razvoj e-uprave na opštinskom nivou',
   'https://www.rars-msp.org/javni-pozivi/e-uprava-2026',
   '2026-04-05', '2026-08-05', 'digitalizacija', 'RARS-MSP', 15000, 120000, true, 'aktivan'),

  ('Konkurs za projekte jačanja lokalne demokratije – GIZ',
   'https://www.giz.de/bih/calls/2026-demokratija',
   '2026-03-01', '2026-06-30', 'upravljanje', 'GIZ', 10000, 100000, true, 'aktivan'),

  ('Javni poziv za obnovu i zaštitu kulturnih dobara',
   'https://www.vladars.net/sr/vlada/ministarstva/mpr/javni_pozivi/Pages/default.aspx?konkurs=008',
   '2026-02-05', '2026-05-05', 'kultura', 'Ministarstvo civilnih poslova BiH', 5000, 60000, true, 'aktivan'),

  ('Poziv za projekte socijalne zaštite ranjivih kategorija',
   'https://www.vladars.net/sr/vlada/ministarstva/mrzsp/javni_pozivi/Pages/default.aspx?konkurs=009',
   '2026-01-25', '2026-04-25', 'socijala', 'Ministarstvo rada RS', 8000, 70000, true, 'aktivan'),

  ('EU4Business – Podrška malim i srednjim preduzećima u BiH',
   'https://www.eu4business.ba/calls/2026-sme',
   '2026-03-10', '2026-07-10', 'ekonomski razvoj', 'Evropska unija', 15000, 150000, true, 'aktivan'),

  ('Javni konkurs za sufinansiranje projekata mladih',
   'https://www.vladars.net/sr/vlada/ministarstva/mss/javni_pozivi/Pages/default.aspx?konkurs=010',
   '2026-04-10', '2026-07-10', 'omladina', 'Ministarstvo porodice RS', 3000, 25000, true, 'aktivan'),

  ('Poziv za unapređenje zdravstvene infrastrukture – opštinski nivo',
   'https://www.rars-msp.org/javni-pozivi/zdravstvo-2026',
   '2026-02-25', '2026-06-25', 'zdravstvo', 'WHO / RARS-MSP', 20000, 180000, true, 'aktivan'),

  ('Javni poziv za projekte šumarstva i lovstva',
   'https://www.vladars.net/sr/vlada/ministarstva/mps/javni_pozivi/Pages/default.aspx?konkurs=011',
   '2026-03-20', '2026-06-20', 'šumarstvo', 'Ministarstvo poljoprivrede RS', 10000, 90000, true, 'aktivan'),

  ('Konkurs za digitalni razvoj MSP – USAID',
   'https://www.usaid.gov/bosnia/calls/2026-digital-sme',
   '2026-04-15', '2026-08-15', 'digitalizacija', 'USAID', 10000, 100000, true, 'aktivan'),

  ('Javni poziv za projekte zaštite od poplava',
   'https://www.vladars.net/sr/vlada/ministarstva/mgr/javni_pozivi/Pages/default.aspx?konkurs=012',
   '2026-03-30', '2026-07-30', 'infrastruktura', 'Fond za vode RS', 30000, 500000, true, 'aktivan'),

  ('Poziv za razvoj ruralnog turizma i agroturizma',
   'https://www.rars-msp.org/javni-pozivi/agroturizam-2026',
   '2026-05-01', '2026-09-01', 'turizam', 'RARS-MSP / IPARD', 15000, 120000, true, 'aktivan'),

  ('Javni poziv za projekte energetske tranzicije – IEA',
   'https://www.rars-msp.org/javni-pozivi/energetska-tranzicija-2026',
   '2026-05-05', '2026-10-05', 'energetika', 'EU Green Deal / RARS-MSP', 50000, 1000000, true, 'aktivan')

ON CONFLICT (izvor_url) DO NOTHING;
