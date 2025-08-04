-- Safe Schema Fix for generated_emails table
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist and their types
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'generated_emails' 
ORDER BY ordinal_position;

-- Add missing columns one by one
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

-- Simple test to verify the table works (without complex data)
SELECT COUNT(*) as total_emails FROM generated_emails; 