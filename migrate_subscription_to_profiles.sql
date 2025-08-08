-- Migrate subscription data from user_profiles to profiles table
-- This script will copy subscription data and then we can clean up user_profiles

-- First, let's see the structure of both tables
SELECT 'profiles table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT 'user_profiles table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 1: Add subscription columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE profiles ADD COLUMN subscription_plan TEXT;
    END IF;
    
    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status TEXT;
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

-- Step 2: Update profiles with subscription data from user_profiles
UPDATE profiles 
SET 
  subscription_plan = user_profiles.subscription_plan,
  subscription_status = user_profiles.subscription_status,
  stripe_customer_id = user_profiles.stripe_customer_id,
  stripe_subscription_id = user_profiles.stripe_subscription_id,
  updated_at = NOW()
FROM user_profiles 
WHERE profiles.user_id = user_profiles.id;

-- Step 3: Show the migration results
SELECT 
  'Migration Results' as info,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN subscription_plan IS NOT NULL THEN 1 END) as profiles_with_subscription,
  COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_names
FROM profiles;

-- Step 4: Show sample of migrated data
SELECT 
  id,
  full_name,
  job_title,
  company,
  subscription_plan,
  subscription_status,
  created_at,
  updated_at
FROM profiles 
ORDER BY updated_at DESC 
LIMIT 5;

-- Step 5: Verify the data
SELECT 
  'Data Verification' as check_type,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM user_profiles) as user_profiles_count,
  (SELECT COUNT(*) FROM profiles WHERE subscription_plan IS NOT NULL) as profiles_with_subscription;

-- Step 6: Show final profiles structure
SELECT 
  'Final profiles table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 7: Drop the user_profiles table (UNCOMMENT WHEN READY)
-- DROP TABLE IF EXISTS user_profiles; 