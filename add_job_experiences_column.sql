-- Add job_experiences column to profiles table
-- This column will store an array of job experience objects

-- Check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'job_experiences'
    ) THEN
        -- Add the job_experiences column as JSONB to store structured job experience data
        ALTER TABLE profiles ADD COLUMN job_experiences JSONB DEFAULT '[]'::jsonb;
        
        -- Add a comment to document the column structure
        COMMENT ON COLUMN profiles.job_experiences IS 'Array of job experience objects with structure: {company, title, start_date, end_date, description, is_current}';
        
        RAISE NOTICE 'Added job_experiences column to profiles table';
    ELSE
        RAISE NOTICE 'job_experiences column already exists in profiles table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'job_experiences';

-- Show the current structure of the profiles table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position; 