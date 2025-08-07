-- Fix search_mode constraint issue
-- This script removes any check constraints on the search_mode column that might be causing pattern validation errors

-- Drop any check constraints on search_mode column
DO $$
BEGIN
  -- Drop any check constraints on search_mode column
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'generated_emails' 
    AND constraint_name LIKE '%search_mode%'
    AND constraint_type = 'CHECK'
  ) THEN
    EXECUTE 'ALTER TABLE generated_emails DROP CONSTRAINT IF EXISTS generated_emails_search_mode_check';
  END IF;
END $$;

-- Verify the column exists and has no constraints
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'generated_emails' 
AND column_name = 'search_mode';

-- Show any remaining constraints on the table
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'generated_emails'; 