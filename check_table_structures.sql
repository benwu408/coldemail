-- Check the exact structure of both tables
SELECT 'profiles table columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT 'user_profiles table columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Show sample data from both tables
SELECT 'profiles table sample data:' as info;
SELECT * FROM profiles LIMIT 1;

SELECT 'user_profiles table sample data:' as info;
SELECT * FROM user_profiles LIMIT 1; 