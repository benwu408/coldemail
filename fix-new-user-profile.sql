-- Fix for new user profile creation issue
-- This script ensures that new users get profiles created automatically

-- Step 1: Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    job_title TEXT,
    company TEXT,
    education JSONB DEFAULT '{"school": null, "degree": null, "major": null, "graduation_year": null}'::jsonb,
    location TEXT,
    industry TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    background TEXT,
    linkedin_url TEXT,
    website TEXT,
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free';
    END IF;
    
    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'active';
    END IF;
    
    -- Add stripe_customer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
    END IF;
    
    -- Add stripe_subscription_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
    END IF;
END $$;

-- Step 3: Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id);

-- Step 5: Create the trigger function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new profile for the user
    INSERT INTO profiles (
        id,
        user_id,
        subscription_plan,
        subscription_status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id,
        'free',
        'active',
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

-- Step 6: Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Step 7: Create missing profiles for existing users
INSERT INTO profiles (
    id,
    user_id,
    subscription_plan,
    subscription_status,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.id,
    'free',
    'active',
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 8: Success message
DO $$
DECLARE
    profile_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    RAISE NOTICE 'SUCCESS: Profile creation trigger installed!';
    RAISE NOTICE 'Total users: %', user_count;
    RAISE NOTICE 'Total profiles: %', profile_count;
    
    IF profile_count = user_count THEN
        RAISE NOTICE 'SUCCESS: All users now have profiles!';
    ELSE
        RAISE NOTICE 'WARNING: % users still missing profiles', (user_count - profile_count);
    END IF;
END $$; 