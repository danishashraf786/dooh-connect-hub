-- Mark the specified account as a screen owner
UPDATE public.user_profiles
SET role = 'screen_owner'
WHERE user_id = '15166d5a-a306-4cda-9e07-22d2c7f37076';