-- Migrate data from profiles table to user_profiles table
-- This script will copy all profile data and then clean up the old table

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

-- Step 1: Update user_profiles with data from profiles table
-- Using the correct join: profiles.user_id = user_profiles.id
UPDATE user_profiles 
SET 
  full_name = profiles.full_name,
  job_title = profiles.job_title,
  company = profiles.company,
  background = profiles.background,
  education = profiles.education,
  skills = profiles.skills,
  interests = profiles.interests,
  updated_at = NOW()
FROM profiles 
WHERE user_profiles.id = profiles.user_id;

-- Step 2: Show the migration results
SELECT 
  'Migration Results' as info,
  COUNT(*) as total_user_profiles,
  COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_names,
  COUNT(CASE WHEN job_title IS NOT NULL THEN 1 END) as profiles_with_job_titles,
  COUNT(CASE WHEN company IS NOT NULL THEN 1 END) as profiles_with_companies
FROM user_profiles;

-- Step 3: Show sample of migrated data
SELECT 
  id,
  full_name,
  job_title,
  company,
  subscription_plan,
  subscription_status,
  created_at,
  updated_at
FROM user_profiles 
ORDER BY updated_at DESC 
LIMIT 5;

-- Step 4: Verify no data loss by comparing counts
SELECT 
  'Data Verification' as check_type,
  (SELECT COUNT(*) FROM profiles) as old_profiles_count,
  (SELECT COUNT(*) FROM user_profiles) as new_user_profiles_count,
  (SELECT COUNT(*) FROM user_profiles WHERE full_name IS NOT NULL) as migrated_profiles_with_data;

-- Step 5: Show what data exists in profiles table
SELECT 
  'Profiles table data sample:' as info;
SELECT 
  user_id,
  full_name,
  job_title,
  company,
  created_at
FROM profiles 
LIMIT 5;

-- Step 6: Drop the old profiles table (UNCOMMENT WHEN READY)
-- DROP TABLE IF EXISTS profiles; 