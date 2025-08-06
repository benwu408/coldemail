-- Add Stripe columns to profiles table for recurring billing support
-- This enables us to track Stripe customer and subscription IDs for each user

-- Add stripe_customer_id column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add stripe_subscription_id column to profiles table  
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index on stripe_customer_id for fast lookups during webhook processing
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON profiles(stripe_customer_id);

-- Add index on stripe_subscription_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id 
ON profiles(stripe_subscription_id);

-- Update subscription_plans table to include 'past_due' status if not already present
-- First, check if the constraint allows 'past_due'
DO $$
BEGIN
    -- Drop the existing constraint
    ALTER TABLE user_subscriptions 
    DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;
    
    -- Add the new constraint with 'past_due' included
    ALTER TABLE user_subscriptions 
    ADD CONSTRAINT user_subscriptions_status_check 
    CHECK (status IN ('active', 'cancelled', 'expired', 'trialing', 'past_due'));
    
    RAISE NOTICE 'Added past_due status to user_subscriptions table';
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('stripe_customer_id', 'stripe_subscription_id');

-- Success messages
DO $$
BEGIN
    RAISE NOTICE 'Stripe columns added successfully to profiles table';
    RAISE NOTICE 'Indexes created for fast webhook processing';
    RAISE NOTICE 'Database is now ready for recurring billing!';
END $$; 