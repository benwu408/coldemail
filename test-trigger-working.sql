-- Test script to verify trigger is working
-- Run this after executing fix-trigger-and-functions.sql

-- 1. Check if trigger function exists
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_user_profile';

-- 2. Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'create_profile_on_signup';

-- 3. Check if RLS is enabled on profiles table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Check RLS policies on profiles table
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname = 'profiles';

-- 5. Check current profiles count
SELECT COUNT(*) as total_profiles FROM profiles;

-- 6. Check if current user has a profile (replace with actual user ID)
-- SELECT * FROM profiles WHERE user_id = 'your-user-id-here';

-- 7. Test the trigger function manually (optional)
-- This would create a test profile for a specific user ID
-- SELECT create_user_profile() FROM (SELECT 'test-user-id'::uuid as id, NOW() as created_at) as test_user; 