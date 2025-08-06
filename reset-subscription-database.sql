-- Reset Subscription Database Script
-- This script will completely delete and recreate all subscription-related tables and functions
-- WARNING: This will delete all subscription data! Use with caution.

-- 1. Drop all existing functions first (to avoid dependency issues)
DROP FUNCTION IF EXISTS assign_user_subscription(uuid, character varying, character varying, character varying, integer);
DROP FUNCTION IF EXISTS get_user_subscription(uuid);
DROP FUNCTION IF EXISTS check_daily_usage_limit(uuid);
DROP FUNCTION IF EXISTS increment_user_usage(uuid, character varying);

-- 2. Drop all existing tables (including old and new versions)
DROP TABLE IF EXISTS user_usage CASCADE;
DROP TABLE IF EXISTS user_usage_new CASCADE;
DROP TABLE IF EXISTS user_usage_old CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS user_subscriptions_new CASCADE;
DROP TABLE IF EXISTS user_subscriptions_old CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS subscription_plans_new CASCADE;
DROP TABLE IF EXISTS subscription_plans_old CASCADE;

-- 3. Remove subscription columns from profiles table (if they exist)
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_plan;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_status;

-- 4. Create fresh subscription_plans table
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    search_type VARCHAR(20) NOT NULL CHECK (search_type IN ('basic', 'deep')),
    daily_generation_limit INTEGER,
    tone_options TEXT[] DEFAULT ARRAY['professional'],
    email_editing_enabled BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create fresh user_subscriptions table
CREATE TABLE user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 6. Create fresh user_usage table
CREATE TABLE user_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    generation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, usage_date)
);

-- 7. Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, search_type, daily_generation_limit, tone_options, email_editing_enabled, priority_support)
VALUES 
    ('free', 'Free', 'basic', 2, ARRAY['professional'], FALSE, FALSE),
    ('pro', 'Pro', 'deep', NULL, ARRAY['professional', 'casual', 'formal', 'confident'], TRUE, TRUE);

-- 8. Add subscription columns back to profiles table
ALTER TABLE profiles 
ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'free',
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active';

-- 9. Set all existing users to free plan
UPDATE profiles 
SET 
    subscription_plan = 'free',
    subscription_status = 'active'
WHERE subscription_plan IS NULL OR subscription_plan = '';

-- 10. Create all functions

-- Function to assign user subscription
CREATE OR REPLACE FUNCTION assign_user_subscription(
    user_uuid UUID,
    plan_name VARCHAR,
    subscription_status VARCHAR DEFAULT 'active',
    billing_cycle_param VARCHAR DEFAULT 'monthly',
    trial_days INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    plan_uuid UUID;
    trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get plan ID
    SELECT id INTO plan_uuid FROM subscription_plans WHERE name = plan_name;
    
    IF plan_uuid IS NULL THEN
        RAISE EXCEPTION 'Plan % not found', plan_name;
    END IF;
    
    -- Calculate trial end date if trial_days is provided
    IF trial_days IS NOT NULL THEN
        trial_end := NOW() + (trial_days || ' days')::INTERVAL;
    END IF;
    
    -- Insert or update user subscription
    INSERT INTO user_subscriptions (
        user_id, 
        plan_id, 
        status, 
        billing_cycle,
        trial_start_date,
        trial_end_date
    )
    VALUES (
        user_uuid, 
        plan_uuid, 
        subscription_status, 
        billing_cycle_param,
        CASE WHEN trial_days IS NOT NULL THEN NOW() ELSE NULL END,
        trial_end
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        plan_id = EXCLUDED.plan_id,
        status = EXCLUDED.status,
        billing_cycle = EXCLUDED.billing_cycle,
        trial_start_date = CASE WHEN trial_days IS NOT NULL THEN NOW() ELSE user_subscriptions.trial_start_date END,
        trial_end_date = EXCLUDED.trial_end_date,
        updated_at = NOW();
        
    -- Update profiles table
    UPDATE profiles 
    SET 
        subscription_plan = plan_name,
        subscription_status = subscription_status,
        updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get user subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE(
    plan_name VARCHAR,
    plan_display_name VARCHAR,
    search_type VARCHAR,
    daily_generation_limit INTEGER,
    tone_options TEXT[],
    email_editing_enabled BOOLEAN,
    priority_support BOOLEAN,
    status VARCHAR,
    trial_end_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.name,
        sp.display_name,
        sp.search_type,
        sp.daily_generation_limit,
        sp.tone_options,
        sp.email_editing_enabled,
        sp.priority_support,
        us.status,
        us.trial_end_date
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid;
    
    -- If no subscription found, return free plan details
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            sp.name,
            sp.display_name,
            sp.search_type,
            sp.daily_generation_limit,
            sp.tone_options,
            sp.email_editing_enabled,
            sp.priority_support,
            'active'::VARCHAR,
            NULL::TIMESTAMP WITH TIME ZONE
        FROM subscription_plans sp
        WHERE sp.name = 'free';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check daily usage limit
CREATE OR REPLACE FUNCTION check_daily_usage_limit(user_uuid UUID)
RETURNS TABLE(
    generations_today INTEGER,
    daily_limit INTEGER,
    limit_reached BOOLEAN
) AS $$
DECLARE
    current_usage INTEGER := 0;
    user_limit INTEGER;
BEGIN
    -- Get user's daily limit from their subscription
    SELECT sp.daily_generation_limit INTO user_limit
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid;
    
    -- If no subscription found, use free plan limit
    IF user_limit IS NULL THEN
        user_limit := 2;
    END IF;
    
    -- Get today's usage
    SELECT COALESCE(generation_count, 0) INTO current_usage
    FROM user_usage
    WHERE user_id = user_uuid AND usage_date = CURRENT_DATE;
    
    RETURN QUERY
    SELECT 
        current_usage,
        user_limit,
        (user_limit IS NOT NULL AND current_usage >= user_limit);
END;
$$ LANGUAGE plpgsql;

-- Function to increment user usage
CREATE OR REPLACE FUNCTION increment_user_usage(
    user_uuid UUID,
    usage_type VARCHAR DEFAULT 'generation'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_usage (user_id, usage_date, generation_count)
    VALUES (user_uuid, CURRENT_DATE, 1)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET 
        generation_count = user_usage.generation_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON user_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_plan);

-- 12. Enable Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Public can read subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can read own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can read own usage" ON user_usage;
DROP POLICY IF EXISTS "Service role can manage user_subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage user_usage" ON user_usage;

-- Create new policies
CREATE POLICY "Public can read subscription plans" ON subscription_plans 
FOR SELECT USING (true);

CREATE POLICY "Users can read own subscription" ON user_subscriptions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own usage" ON user_usage 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage user_subscriptions" ON user_subscriptions 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user_usage" ON user_usage 
FOR ALL USING (auth.role() = 'service_role');

-- 14. Grant permissions
GRANT ALL ON subscription_plans TO authenticated;
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON user_usage TO authenticated;

-- 15. Verification queries
SELECT 'SUBSCRIPTION_PLANS_CREATED' as status, COUNT(*) as count FROM subscription_plans;
SELECT 'PROFILES_UPDATED' as status, subscription_plan, COUNT(*) as count FROM profiles GROUP BY subscription_plan;
SELECT 'FUNCTIONS_CREATED' as status, COUNT(*) as count FROM pg_proc WHERE proname LIKE '%subscription%' OR proname LIKE '%usage%';

-- 16. Test the functions
SELECT 'FUNCTION_TEST' as test, * FROM get_user_subscription('00000000-0000-0000-0000-000000000000'::UUID);
SELECT 'USAGE_TEST' as test, * FROM check_daily_usage_limit('00000000-0000-0000-0000-000000000000'::UUID);

-- 17. Success messages
DO $$
BEGIN
    RAISE NOTICE 'Subscription database reset complete!';
    RAISE NOTICE 'All users have been set to FREE plan';
    RAISE NOTICE 'Functions: assign_user_subscription, get_user_subscription, check_daily_usage_limit, increment_user_usage';
    RAISE NOTICE 'Tables: subscription_plans, user_subscriptions, user_usage';
    RAISE NOTICE 'Ready for Stripe webhook integration!';
END $$; 