-- Fix missing columns in user_profiles table
-- Run this in your Supabase SQL Editor

-- Add email and phone columns if they don't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('email', 'phone')
ORDER BY column_name;

-- Check all columns in the table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY column_name; 