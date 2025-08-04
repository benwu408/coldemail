-- Complete Schema Fix for generated_emails table
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'generated_emails' 
ORDER BY ordinal_position;

-- Add ALL missing columns that the application expects
ALTER TABLE generated_emails 
ADD COLUMN IF NOT EXISTS purpose TEXT;

ALTER TABLE generated_emails 
ADD COLUMN IF NOT EXISTS commonalities TEXT;

ALTER TABLE generated_emails 
ADD COLUMN IF NOT EXISTS research_findings TEXT;

ALTER TABLE generated_emails 
ADD COLUMN IF NOT EXISTS search_mode TEXT DEFAULT 'basic';

ALTER TABLE generated_emails 
ADD COLUMN IF NOT EXISTS recipient_email TEXT;

-- Verify the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'generated_emails' 
ORDER BY ordinal_position;

-- Test insert to verify everything works
INSERT INTO generated_emails (
  user_id,
  recipient_name,
  recipient_company,
  recipient_role,
  recipient_email,
  purpose,
  search_mode,
  research_findings,
  commonalities,
  generated_email
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Schema Test',
  'Test Company',
  'Test Role',
  'test@example.com',
  'Test Purpose',
  'basic',
  'Test research findings',
  'Test commonalities',
  'Test email content'
);

-- Clean up test data
DELETE FROM generated_emails WHERE recipient_name = 'Schema Test';

-- Show final count
SELECT COUNT(*) as total_emails FROM generated_emails; 