-- Verification script for trigger and functions
-- Run this to check if everything is working correctly

DO $$
DECLARE
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
    rls_enabled BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check if trigger function exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'create_user_profile'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ Trigger function exists';
    ELSE
        RAISE NOTICE '❌ Trigger function does not exist';
    END IF;
    
    -- Check if trigger exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'create_profile_on_signup'
    ) INTO trigger_exists;
    
    IF trigger_exists THEN
        RAISE NOTICE '✅ Trigger exists';
    ELSE
        RAISE NOTICE '❌ Trigger does not exist';
    END IF;
    
    -- Check if RLS is enabled on profiles table
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables 
    WHERE tablename = 'profiles';
    
    IF rls_enabled THEN
        RAISE NOTICE '✅ RLS is enabled on profiles table';
    ELSE
        RAISE NOTICE '❌ RLS is not enabled on profiles table';
    END IF;
    
    -- Check RLS policies count
    SELECT COUNT(*) INTO policy_count
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'profiles';
    
    RAISE NOTICE '📊 Found % RLS policies on profiles table', policy_count;
    
    -- Summary
    IF function_exists AND trigger_exists AND rls_enabled AND policy_count > 0 THEN
        RAISE NOTICE '🎉 All checks passed! Trigger should be working correctly.';
    ELSE
        RAISE NOTICE '⚠️  Some checks failed. Please run fix-trigger-and-functions.sql again.';
    END IF;
    
END $$; 