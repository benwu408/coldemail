-- Comprehensive Database Structure Inspection Script
-- Run this in Supabase SQL Editor to get complete database format

-- 1. List all tables in public schema
SELECT 
    'TABLE STRUCTURE' as inspection_type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 2. List all constraints (Primary Keys, Foreign Keys, Unique, Check)
SELECT 
    'CONSTRAINTS' as inspection_type,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON cc.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 3. List all indexes
SELECT 
    'INDEXES' as inspection_type,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. List all functions and their parameters (Fixed for newer PostgreSQL)
SELECT 
    'FUNCTIONS' as inspection_type,
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    pg_catalog.pg_get_function_result(p.oid) as return_type,
    CASE WHEN p.prorettype = 'pg_catalog.trigger'::pg_catalog.regtype THEN 'trigger'
         ELSE 'normal'
    END as function_type
FROM pg_catalog.pg_proc p
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY function_name;

-- 5. Show actual function definitions
SELECT 
    'FUNCTION_DEFINITIONS' as inspection_type,
    p.proname as function_name,
    pg_catalog.pg_get_functiondef(p.oid) as definition
FROM pg_catalog.pg_proc p
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY function_name;

-- 6. List all RLS policies
SELECT 
    'RLS_POLICIES' as inspection_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. Show table row counts and basic stats
SELECT 
    'TABLE_STATS' as inspection_type,
    schemaname,
    relname as tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;

-- 8. Check if specific subscription-related tables exist and show their structure
SELECT 
    'SUBSCRIPTION_TABLES_CHECK' as inspection_type,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'user_subscriptions', 'user_usage', 'profiles')
UNION ALL
SELECT 
    'SUBSCRIPTION_TABLES_CHECK' as inspection_type,
    missing_table,
    'MISSING' as status
FROM (
    SELECT unnest(ARRAY['subscription_plans', 'user_subscriptions', 'user_usage', 'profiles']) as missing_table
) missing
WHERE missing_table NOT IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
);

-- 9. Show sample data from ALL tables in the database
-- This will show first 3 rows from each table

-- Generate and execute dynamic queries for each table
DO $$
DECLARE
    table_record RECORD;
    query_text TEXT;
BEGIN
    -- Loop through all tables in public schema
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    LOOP
        -- Create a notice to show which table we're querying
        RAISE NOTICE 'Showing data from table: %', table_record.table_name;
        
        -- Build dynamic query
        query_text := format(
            'SELECT ''SAMPLE_DATA_%s'' as inspection_type, * FROM %I LIMIT 3',
            table_record.table_name,
            table_record.table_name
        );
        
        -- Execute the query
        BEGIN
            EXECUTE query_text;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error querying table %: %', table_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 10. Show specific table data with better formatting
-- profiles table
SELECT 
    'PROFILES_DATA' as inspection_type,
    id,
    email,
    full_name,
    subscription_plan,
    subscription_status,
    created_at,
    updated_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- generated_emails table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_emails' AND table_schema = 'public') THEN
        EXECUTE 'SELECT ''GENERATED_EMAILS_DATA'' as inspection_type, id, user_id, recipient_name, recipient_company, created_at FROM generated_emails ORDER BY created_at DESC LIMIT 3';
    ELSE
        RAISE NOTICE 'generated_emails table does not exist';
    END IF;
END $$;

-- subscription_plans table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans' AND table_schema = 'public') THEN
        EXECUTE 'SELECT ''SUBSCRIPTION_PLANS_DATA'' as inspection_type, * FROM subscription_plans ORDER BY name';
    ELSE
        RAISE NOTICE 'subscription_plans table does not exist';
    END IF;
END $$;

-- user_subscriptions table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
        EXECUTE 'SELECT ''USER_SUBSCRIPTIONS_DATA'' as inspection_type, * FROM user_subscriptions ORDER BY created_at DESC LIMIT 5';
    ELSE
        RAISE NOTICE 'user_subscriptions table does not exist';
    END IF;
END $$;

-- user_usage table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_usage' AND table_schema = 'public') THEN
        -- Check what columns actually exist in user_usage table
        RAISE NOTICE 'user_usage table exists, checking columns...';
        
        -- Try different possible column names for ordering
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_usage' AND column_name = 'usage_date' AND table_schema = 'public') THEN
            EXECUTE 'SELECT ''USER_USAGE_DATA'' as inspection_type, * FROM user_usage ORDER BY usage_date DESC LIMIT 5';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_usage' AND column_name = 'created_at' AND table_schema = 'public') THEN
            EXECUTE 'SELECT ''USER_USAGE_DATA'' as inspection_type, * FROM user_usage ORDER BY created_at DESC LIMIT 5';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_usage' AND column_name = 'date' AND table_schema = 'public') THEN
            EXECUTE 'SELECT ''USER_USAGE_DATA'' as inspection_type, * FROM user_usage ORDER BY date DESC LIMIT 5';
        ELSE
            EXECUTE 'SELECT ''USER_USAGE_DATA'' as inspection_type, * FROM user_usage LIMIT 5';
        END IF;
    ELSE
        RAISE NOTICE 'user_usage table does not exist';
    END IF;
END $$;

-- 11. Show column structure for ALL tables
SELECT 
    'ALL_TABLE_STRUCTURES' as inspection_type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 12. Show detailed structure for each table individually
DO $$
DECLARE
    table_record RECORD;
    query_text TEXT;
BEGIN
    -- Loop through all tables and show their structure
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    LOOP
        RAISE NOTICE 'Showing structure for table: %', table_record.table_name;
        
        -- Build query to show table structure
        query_text := format(
            'SELECT ''STRUCTURE_%s'' as inspection_type, 
                    column_name, 
                    data_type, 
                    is_nullable, 
                    column_default,
                    character_maximum_length,
                    numeric_precision,
                    numeric_scale,
                    ordinal_position
             FROM information_schema.columns 
             WHERE table_schema = ''public'' 
             AND table_name = %L
             ORDER BY ordinal_position',
            table_record.table_name,
            table_record.table_name
        );
        
        -- Execute the query
        BEGIN
            EXECUTE query_text;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error getting structure for table %: %', table_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 13. Show auth.users structure (limited info for security)
SELECT 
    'AUTH_USERS_STRUCTURE' as inspection_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 14. List all public schema tables
SELECT 
    'ALL_TABLES_LIST' as inspection_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 15. Show table sizes
SELECT 
    'TABLE_SIZES' as inspection_type,
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname; 