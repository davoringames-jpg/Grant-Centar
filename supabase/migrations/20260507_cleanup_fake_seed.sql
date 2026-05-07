-- Briši sve lažne seed podatke ubačene ručno
-- Čuvamo samo podatke koje ubaci cron (realni URL-ovi sa stvarnih sajtova)
-- 
-- POKRENUTI U SUPABASE SQL EDITORU
-- Nakon toga pokrenuti cron ručno da popuni pravu bazu

DELETE FROM public.konkursi
WHERE
  -- Fake vladars.net URL-ovi sa query param ?konkurs=
  izvor_url LIKE '%vladars.net%?konkurs=%'
  -- Fake interreg URL
  OR izvor_url = 'https://www.interreg-adrion.eu/calls/2026-infrastructure'
  -- Fake IPA III URL
  OR izvor_url = 'https://www.dei.gov.ba/ipa/2026/lokalna-samouprava'
  -- Fake garantni fond URL
  OR izvor_url = 'https://www.garantnifond.rs.ba/konkursi/2026-msp'
  -- Fake UNDP URL
  OR izvor_url = 'https://www.undp.org/bosnia-herzegovina/calls/2026-digitalizacija'
  -- Fake RARS URL-ovi (pravi RARS URL-ovi sadrže ćirilicu enkodiranu kao %d0%...)
  OR izvor_url = 'https://www.rars-msp.org/javni-pozivi/energetska-efikasnost-2026'
  OR izvor_url = 'https://www.rars-msp.org/javni-pozivi/e-uprava-2026'
  OR izvor_url = 'https://www.rars-msp.org/javni-pozivi/zdravstvo-2026'
  OR izvor_url = 'https://www.rars-msp.org/javni-pozivi/agroturizam-2026'
  OR izvor_url = 'https://www.rars-msp.org/javni-pozivi/energetska-tranzicija-2026'
  -- Ostali fake URL-ovi
  OR izvor_url = 'https://www.unicef.org/bih/calls/2026-inkluzija'
  OR izvor_url = 'https://www.wbif.eu/calls/2026-regional'
  OR izvor_url = 'https://www.ebrd.com/calls/bih-water-2026'
  OR izvor_url = 'https://www.giz.de/bih/calls/2026-demokratija'
  OR izvor_url = 'https://www.eu4business.ba/calls/2026-sme'
  OR izvor_url = 'https://www.usaid.gov/bosnia/calls/2026-digital-sme';

-- Provjeri koliko je ostalo
SELECT COUNT(*) AS preostalo_konkursa FROM public.konkursi;
