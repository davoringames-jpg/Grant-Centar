-- Tabela za zahtjeve pisanja projekata
CREATE TABLE IF NOT EXISTS public.project_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz NOT NULL DEFAULT now(),

  -- Podaci o konkursu
  konkurs_id        text NOT NULL,
  konkurs_naslov    text NOT NULL,
  konkurs_izvor_url text,

  -- Podaci podnosioca
  naziv_organizacije text NOT NULL,
  kontakt_osoba      text NOT NULL,
  email              text NOT NULL,
  telefon            text,
  opstina            text NOT NULL,

  -- Projektni podaci
  trazeni_iznos_km   numeric(12, 2) NOT NULL,
  opis_projekta      text NOT NULL,

  -- Cijena usluge (10% min 500 KM)
  cijena_usluge_km   numeric(12, 2) NOT NULL,

  -- Status
  status text NOT NULL DEFAULT 'novi'
    CHECK (status IN ('novi', 'placeno', 'u_izradi', 'dostavljeno', 'otkazano'))
);

-- RLS: samo service role može čitati (admin panel)
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_requests' AND policyname = 'Service role full access'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role full access" ON public.project_requests USING (true) WITH CHECK (true)';
  END IF;
END $$;
