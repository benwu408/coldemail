-- Add recipient_linkedin column to generated_emails table
-- This script adds the missing column that's causing the PGRST204 error

-- Add the recipient_linkedin column
ALTER TABLE generated_emails 
ADD COLUMN recipient_linkedin TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN generated_emails.recipient_linkedin IS 'LinkedIn URL of the email recipient';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'generated_emails' 
    AND column_name = 'recipient_linkedin';

-- Show the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'generated_emails' 
ORDER BY ordinal_position; 