-- Refresh schema cache and verify profile columns
-- This will help resolve any schema cache issues

-- Step 1: Show current profiles table structure
SELECT 'Current profiles table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 2: Check if specific columns exist
SELECT 'Checking specific columns:' as info;
SELECT 
  column_name,
  CASE 
    WHEN column_name = 'skills' THEN 'EXISTS'
    WHEN column_name = 'interests' THEN 'EXISTS'
    WHEN column_name = 'background' THEN 'EXISTS'
    ELSE 'OTHER'
  END as status
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('skills', 'interests', 'background');

-- Step 3: Show sample data to verify structure
SELECT 'Sample profile data:' as info;
SELECT 
  id,
  full_name,
  job_title,
  company,
  skills,
  interests,
  background,
  created_at,
  updated_at
FROM profiles 
LIMIT 1;

-- Step 4: Show final table structure
SELECT 'Final profiles table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position; 