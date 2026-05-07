-- Tabela za logovanje dnevnih cron provjera izvora
CREATE TABLE IF NOT EXISTS public.cron_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at        timestamptz NOT NULL DEFAULT now(),
  source_count  int NOT NULL,
  reachable_count int NOT NULL,
  unreachable_sources text,
  details       jsonb
);

-- Brišemo logove starije od 90 dana (pokrenuti kao scheduled job ili ručno)
-- DELETE FROM public.cron_logs WHERE ran_at < now() - interval '90 days';
