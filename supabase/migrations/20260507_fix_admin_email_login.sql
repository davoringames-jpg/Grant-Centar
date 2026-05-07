BEGIN;

UPDATE auth.users
SET
  email = 'davorincvoric@gmail.com',
  encrypted_password = crypt('itadministracija', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email IN ('davorindcvoric@gmail.com', 'davorincvoric@gmail.com');

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', 'davorincvoric@gmail.com'),
  'email',
  'davorincvoric@gmail.com',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'davorincvoric@gmail.com'
AND NOT EXISTS (
  SELECT 1
  FROM auth.identities i
  WHERE i.user_id = u.id
    AND i.provider = 'email'
);

UPDATE auth.identities
SET
  provider_id = 'davorincvoric@gmail.com',
  identity_data = jsonb_set(
    COALESCE(identity_data, '{}'::jsonb),
    '{email}',
    to_jsonb('davorincvoric@gmail.com'::text),
    true
  ),
  updated_at = now()
WHERE provider = 'email'
AND user_id = (
  SELECT id FROM auth.users WHERE email = 'davorincvoric@gmail.com' LIMIT 1
);

INSERT INTO public.profiles (id, subscription_tier)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'davorincvoric@gmail.com'
ON CONFLICT (id)
DO UPDATE SET subscription_tier = 'admin';

COMMIT;

SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'davorincvoric@gmail.com';
