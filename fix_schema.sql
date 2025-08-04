-- Fix missing columns in generated_emails table
-- Run this in your Supabase SQL editor

-- Add missing columns if they don't exist
ALTER TABLE generated_emails 
ADD COLUMN IF NOT EXISTS commonalities TEXT;

ALTER TABLE generated_emails 
ADD COLUMN IF NOT EXISTS research_findings TEXT;

ALTER TABLE generated_emails 
ADD COLUMN IF NOT EXISTS search_mode TEXT DEFAULT 'basic';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'generated_emails' 
ORDER BY ordinal_position; 