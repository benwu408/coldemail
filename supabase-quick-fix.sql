-- Quick fix for user_profiles table - just add unique constraint
-- This preserves existing data and just adds the missing constraint

-- First, remove any duplicate profiles (keep the most recent one)
DELETE FROM user_profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_profiles
  ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
);

-- Add the unique constraint on user_id
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Success! The constraint has been added.
-- You can verify by checking the table structure in the Supabase dashboard. 