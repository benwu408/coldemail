-- Add subscription columns to profiles table
-- This will add the missing subscription fields to the profiles table

-- Step 1: Add subscription columns to profiles table
DO $$
BEGIN
    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE profiles ADD COLUMN subscription_plan TEXT;
        RAISE NOTICE 'Added subscription_plan column to profiles table';
    ELSE
        RAISE NOTICE 'subscription_plan column already exists in profiles table';
    END IF;
    
    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status TEXT;
        RAISE NOTICE 'Added subscription_status column to profiles table';
    ELSE
        RAISE NOTICE 'subscription_status column already exists in profiles table';
    END IF;
    
    -- Add stripe_customer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
        RAISE NOTICE 'Added stripe_customer_id column to profiles table';
    ELSE
        RAISE NOTICE 'stripe_customer_id column already exists in profiles table';
    END IF;
    
    -- Add stripe_subscription_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
        RAISE NOTICE 'Added stripe_subscription_id column to profiles table';
    ELSE
        RAISE NOTICE 'stripe_subscription_id column already exists in profiles table';
    END IF;
END $$;

-- Step 2: Show the updated profiles table structure
SELECT 'Updated profiles table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 3: Show current profiles data
SELECT 
  'Current profiles data:' as info;
SELECT 
  id,
  full_name,
  job_title,
  company,
  subscription_plan,
  subscription_status,
  created_at,
  updated_at
FROM profiles; 