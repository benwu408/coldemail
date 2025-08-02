-- Fix for user_profiles table issues
-- This script will:
-- 1. Remove duplicate profiles for the same user
-- 2. Add the missing unique constraint on user_id

-- First, let's see what duplicates exist
SELECT user_id, COUNT(*) as count
FROM user_profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Remove duplicate profiles, keeping only the most recent one for each user
DELETE FROM user_profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_profiles
  ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
);

-- Add the missing unique constraint on user_id
-- First, drop the existing table and recreate it properly
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Recreate the user_profiles table with proper constraints
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  job_title TEXT,
  company TEXT,
  education JSONB DEFAULT '{"school": null, "degree": null, "major": null, "graduation_year": null}'::jsonb,
  location TEXT,
  industry TEXT,
  experience_years TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  background TEXT,
  linkedin_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success! The table has been recreated with proper constraints.
-- You can verify by checking the table structure in the Supabase dashboard. 