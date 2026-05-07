BEGIN;

-- 1) Nadji sve user ID-jeve za stari i novi admin email
WITH target_users AS (
  SELECT id
  FROM auth.users
  WHERE email IN ('davorindcvoric@gmail.com', 'davorincvoric@gmail.com')
)
DELETE FROM auth.sessions
WHERE user_id IN (SELECT id FROM target_users);

WITH target_users AS (
  SELECT id
  FROM auth.users
  WHERE email IN ('davorindcvoric@gmail.com', 'davorincvoric@gmail.com')
)
DELETE FROM auth.refresh_tokens
WHERE user_id IN (SELECT id FROM target_users);

WITH target_users AS (
  SELECT id
  FROM auth.users
  WHERE email IN ('davorindcvoric@gmail.com', 'davorincvoric@gmail.com')
)
DELETE FROM auth.identities
WHERE user_id IN (SELECT id FROM target_users)
   OR provider_id IN ('davorindcvoric@gmail.com', 'davorincvoric@gmail.com');

WITH target_users AS (
  SELECT id
  FROM auth.users
  WHERE email IN ('davorindcvoric@gmail.com', 'davorincvoric@gmail.com')
)
DELETE FROM public.profiles
WHERE id IN (SELECT id FROM target_users);

DELETE FROM auth.users
WHERE email IN ('davorindcvoric@gmail.com', 'davorincvoric@gmail.com');

COMMIT;

-- 2) Provjera da nema vise starih zapisa
SELECT id, email
FROM auth.users
WHERE email IN ('davorindcvoric@gmail.com', 'davorincvoric@gmail.com');
