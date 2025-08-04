-- Complete Rebuild of generated_emails table (Simplified)
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing table (this will delete all existing emails)
DROP TABLE IF EXISTS generated_emails CASCADE;

-- Step 2: Create the table with the correct schema
CREATE TABLE generated_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_company TEXT,
  recipient_role TEXT,
  recipient_email TEXT,
  purpose TEXT NOT NULL,
  search_mode TEXT DEFAULT 'basic',
  research_findings TEXT,
  commonalities TEXT,
  generated_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view own emails" ON generated_emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON generated_emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON generated_emails
  FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Create indexes for better performance
CREATE INDEX idx_generated_emails_user_id ON generated_emails(user_id);
CREATE INDEX idx_generated_emails_created_at ON generated_emails(created_at DESC);

-- Step 6: Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'generated_emails' 
ORDER BY ordinal_position;

-- Step 7: Verify the table is empty and ready
SELECT COUNT(*) as total_emails FROM generated_emails; 