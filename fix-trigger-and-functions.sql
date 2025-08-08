-- Fix Trigger Function and Missing Functions
-- This script creates the missing functions and trigger for new user profile creation

-- 1. Create the trigger function for new user profile creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new profile for the user
    INSERT INTO profiles (
        user_id,
        full_name,
        job_title,
        company,
        email,
        phone,
        background,
        education,
        skills,
        interests,
        resume_text,
        subscription_plan,
        subscription_status,
        job_experiences,
        location,
        industry,
        linkedin_url,
        website,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        null,
        null,
        null,
        null,
        null,
        null,
        '{"major": null, "degree": null, "school": null, "graduation_year": null}',
        '{}',
        '{}',
        null,
        'free',
        'active',
        '[]',
        null,
        null,
        null,
        null,
        NEW.created_at,
        NEW.created_at
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 3. Create the check_trigger_exists function
CREATE OR REPLACE FUNCTION check_trigger_exists(trigger_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    trigger_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = trigger_name
    ) INTO trigger_exists;
    
    RETURN trigger_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the get_rls_policies function (fixed column names)
CREATE OR REPLACE FUNCTION get_rls_policies(table_name TEXT)
RETURNS TABLE(
    policy_name TEXT,
    policy_type TEXT,
    policy_definition TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.polname::TEXT as policy_name,
        p.polcmd::TEXT as policy_type,
        p.polqual::TEXT as policy_definition
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the get_table_structure function
CREATE OR REPLACE FUNCTION get_table_structure(table_name TEXT)
RETURNS TABLE(
    column_name TEXT,
    data_type TEXT,
    is_nullable TEXT,
    column_default TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::TEXT,
        c.data_type::TEXT,
        c.is_nullable::TEXT,
        c.column_default::TEXT
    FROM information_schema.columns c
    WHERE c.table_name = get_table_structure.table_name
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION check_trigger_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rls_policies(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_structure(TEXT) TO authenticated;

-- 9. Test message
DO $$
BEGIN
    RAISE NOTICE 'Trigger function and helper functions installed successfully!';
    RAISE NOTICE 'New users will automatically get profiles with free plan.';
    RAISE NOTICE 'RLS policies are configured for profiles table.';
END $$; 