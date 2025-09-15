-- Remove existing profile for theawemedia@gmail.com so they can re-register as screen owner
DELETE FROM public.user_profiles 
WHERE contact_email = 'theawemedia@gmail.com' OR user_id = '15166d5a-a306-4cda-9e07-22d2c7f37076';