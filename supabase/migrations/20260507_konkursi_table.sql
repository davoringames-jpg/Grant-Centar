-- Glavna tabela za konkurse/javne pozive
-- Ovu tabelu puni i cron job (RSS scraping) i ručni seed

CREATE TABLE IF NOT EXISTS public.konkursi (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),

  -- Osnovni podaci
  naslov              text NOT NULL,
  izvor_url           text NOT NULL,
  datum_objave        date,
  rok_prijave         date,

  -- Kategorizacija
  sektor              text NOT NULL DEFAULT 'ostalo',
  donator             text,

  -- Finansijski podaci
  iznos_min           numeric(15, 2),
  iznos_max           numeric(15, 2),

  -- Prihvatljivost za opštine
  odobrenost_opstine  boolean NOT NULL DEFAULT true,

  -- AI sažetak (opcionalan)
  ai_sazetak          text,

  -- Status: aktivan | istekao | nedostupan
  status              text NOT NULL DEFAULT 'aktivan'
    CHECK (status IN ('aktivan', 'istekao', 'nedostupan')),

  -- Jedinstveni URL (sprečava duplikate pri auto-scraping)
  UNIQUE (izvor_url)
);

-- RLS: čitanje za sve autentifikovane korisnike
ALTER TABLE public.konkursi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON public.konkursi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access" ON public.konkursi
  USING (true) WITH CHECK (true);

-- Indeksi za filter
CREATE INDEX IF NOT EXISTS konkursi_status_idx ON public.konkursi (status);
CREATE INDEX IF NOT EXISTS konkursi_sektor_idx ON public.konkursi (sektor);
CREATE INDEX IF NOT EXISTS konkursi_rok_prijave_idx ON public.konkursi (rok_prijave);
