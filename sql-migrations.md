# SQL Migrations za Admin Panel & Registracije

Pokreni ova SQL komande u Supabase-u:

```sql
-- 1. Dodaj nove kolone u organizations tabelu
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS pdf_downloaded_at TIMESTAMP;
ADD COLUMN IF NOT EXISTS login_sent_at TIMESTAMP;
ADD COLUMN IF NOT EXISTS registration_completed_at TIMESTAMP;
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'; -- pending, active, expired

-- 2. Kreiraj admin_logs tabelu za praćenje aktivnosti
CREATE TABLE IF NOT EXISTS admin_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- pdf_downloaded, login_sent, etc
  performed_by TEXT NOT NULL,
  performed_at TIMESTAMP DEFAULT NOW(),
  details JSONB
);

-- 3. Enable RLS za admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Samo admini mogu vidjeti admin_logs
CREATE POLICY "admin_can_view_logs" ON admin_logs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 5. Kreiraj admin usera u auth.users ako ne postoji
-- OBAVEZNO: Zamijeni 'davorincvoric@gmail.com' sa TVOJIM email-om ako koristiš drugačiji
INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role)
SELECT 
  gen_random_uuid(),
  'davorincvoric@gmail.com',
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  NOW(),
  NOW(),
  'authenticated'
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'davorincvoric@gmail.com');

-- 6. Kreiraj profile za admin usera
INSERT INTO profiles (id, role, created_at)
SELECT 
  id,
  'admin',
  NOW()
FROM auth.users
WHERE email = 'davorincvoric@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.users.id);

-- 7. Omogući email u organizations ako nije
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 8. Indeks za brže pretrage
CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_org_id ON admin_logs(organization_id);
```
