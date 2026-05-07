-- B2B tok: registracija -> predracun -> pending_payment -> admin aktivacija

ALTER TABLE IF EXISTS organizations
  ADD COLUMN IF NOT EXISTS jib text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS contact_person text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS pdf_downloaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS login_sent_at timestamptz;

ALTER TABLE IF EXISTS subscriptions
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

-- pending zapis se kreira prije user naloga, pa user_id mora biti nullable
ALTER TABLE IF EXISTS subscriptions
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE IF EXISTS subscriptions
  ALTER COLUMN status TYPE text USING status::text;

CREATE INDEX IF NOT EXISTS idx_org_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_org_jib ON organizations(jib);
CREATE INDEX IF NOT EXISTS idx_subs_org_id ON subscriptions(organization_id);

CREATE TABLE IF NOT EXISTS admin_logs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by text NOT NULL,
  performed_at timestamptz NOT NULL DEFAULT now(),
  details jsonb
);
