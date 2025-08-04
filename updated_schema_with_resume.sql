-- Updated Schema with Resume Upload Functionality
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Add resume-related columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS resume_filename TEXT;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS resume_text TEXT;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Create a storage bucket for resume files (if it doesn't exist)
-- Note: You'll need to create this manually in Supabase Dashboard > Storage
-- Bucket name: 'resumes'
-- Public bucket: false (private)
-- File size limit: 10MB
-- Allowed MIME types: application/pdf

-- Create a function to handle resume text extraction (optional)
CREATE OR REPLACE FUNCTION extract_resume_text(resume_text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This function can be used to clean or process resume text
  -- For now, just return the input text
  RETURN resume_text_input;
END;
$$ LANGUAGE plpgsql;

-- Update the RLS policies to include resume data
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Recreate policies with resume access
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verify the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Test insert to verify everything works
INSERT INTO user_profiles (
  user_id,
  full_name,
  job_title,
  company,
  resume_filename,
  resume_text,
  resume_uploaded_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test User',
  'Test Job',
  'Test Company',
  'test-resume.pdf',
  'This is test resume text content.',
  NOW()
);

-- Clean up test data
DELETE FROM user_profiles WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Show final count
SELECT COUNT(*) as total_profiles FROM user_profiles; 