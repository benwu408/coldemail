-- Fix Database Schema and Update Pricing
-- This script will migrate your current schema to the new simplified one

-- 1. Update the Pro plan price from $29 to $10
UPDATE subscription_plans 
SET 
    price_monthly = 10.00,
    price_yearly = 100.00,
    updated_at = NOW()
WHERE name = 'pro';

-- 2. Create new simplified tables (if they don't exist)
-- These will replace the more complex current tables

-- Create new subscription_plans table with simplified structure
CREATE TABLE IF NOT EXISTS subscription_plans_new (
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

-- Create new user_subscriptions table with simplified structure  
CREATE TABLE IF NOT EXISTS user_subscriptions_new (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans_new(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create new user_usage table with simplified structure
CREATE TABLE IF NOT EXISTS user_usage_new (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    generation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, usage_date)
);

-- 3. Migrate data from old tables to new tables

-- Insert simplified subscription plans
INSERT INTO subscription_plans_new (name, display_name, search_type, daily_generation_limit, tone_options, email_editing_enabled, priority_support)
VALUES 
    ('free', 'Free', 'basic', 2, ARRAY['professional'], FALSE, FALSE),
    ('pro', 'Pro', 'deep', NULL, ARRAY['professional', 'casual', 'formal', 'confident'], TRUE, TRUE)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    search_type = EXCLUDED.search_type,
    daily_generation_limit = EXCLUDED.daily_generation_limit,
    tone_options = EXCLUDED.tone_options,
    email_editing_enabled = EXCLUDED.email_editing_enabled,
    priority_support = EXCLUDED.priority_support;

-- Migrate existing user subscriptions
INSERT INTO user_subscriptions_new (user_id, plan_id, status, billing_cycle, trial_start_date, trial_end_date, created_at, updated_at)
SELECT 
    us.user_id,
    spn.id as plan_id,
    us.status,
    us.billing_cycle,
    us.trial_start_date,
    us.trial_end_date,
    us.created_at,
    us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN subscription_plans_new spn ON sp.name = spn.name
ON CONFLICT (user_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    status = EXCLUDED.status,
    billing_cycle = EXCLUDED.billing_cycle,
    trial_start_date = EXCLUDED.trial_start_date,
    trial_end_date = EXCLUDED.trial_end_date,
    updated_at = NOW();

-- 4. Drop old functions and create new ones

-- Drop the old function
DROP FUNCTION IF EXISTS assign_user_subscription(uuid, character varying, character varying, character varying, integer);

-- Create the new simplified function
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
    -- Get plan ID from new table
    SELECT id INTO plan_uuid FROM subscription_plans_new WHERE name = plan_name;
    
    IF plan_uuid IS NULL THEN
        RAISE EXCEPTION 'Plan % not found', plan_name;
    END IF;
    
    -- Calculate trial end date if trial_days is provided
    IF trial_days IS NOT NULL THEN
        trial_end := NOW() + (trial_days || ' days')::INTERVAL;
    END IF;
    
    -- Insert or update user subscription in new table
    INSERT INTO user_subscriptions_new (
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
        trial_start_date = CASE WHEN trial_days IS NOT NULL THEN NOW() ELSE user_subscriptions_new.trial_start_date END,
        trial_end_date = EXCLUDED.trial_end_date,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create the get_user_subscription function for new table
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
    FROM user_subscriptions_new us
    JOIN subscription_plans_new sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create check_daily_usage_limit function for new table
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
    FROM user_subscriptions_new us
    JOIN subscription_plans_new sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid;
    
    -- If no subscription found, use free plan limit
    IF user_limit IS NULL THEN
        user_limit := 2;
    END IF;
    
    -- Get today's usage from new table
    SELECT COALESCE(generation_count, 0) INTO current_usage
    FROM user_usage_new
    WHERE user_id = user_uuid AND usage_date = CURRENT_DATE;
    
    RETURN QUERY
    SELECT 
        current_usage,
        user_limit,
        (user_limit IS NOT NULL AND current_usage >= user_limit);
END;
$$ LANGUAGE plpgsql;

-- Create increment_user_usage function for new table
CREATE OR REPLACE FUNCTION increment_user_usage(
    user_uuid UUID,
    usage_type VARCHAR DEFAULT 'generation'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_usage_new (user_id, usage_date, generation_count)
    VALUES (user_uuid, CURRENT_DATE, 1)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET 
        generation_count = user_usage_new.generation_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Replace old tables with new ones (CAREFUL - this removes old data!)

-- Rename old tables as backup
ALTER TABLE subscription_plans RENAME TO subscription_plans_old;
ALTER TABLE user_subscriptions RENAME TO user_subscriptions_old;
ALTER TABLE user_usage RENAME TO user_usage_old;

-- Rename new tables to main names
ALTER TABLE subscription_plans_new RENAME TO subscription_plans;
ALTER TABLE user_subscriptions_new RENAME TO user_subscriptions;
ALTER TABLE user_usage_new RENAME TO user_usage;

-- 6. Update profiles table subscription columns
UPDATE profiles 
SET 
    subscription_plan = 'pro',
    subscription_status = 'active'
WHERE id IN (
    SELECT user_id 
    FROM user_subscriptions 
    WHERE status = 'active'
);

-- Set default free plan for users without subscriptions
UPDATE profiles 
SET 
    subscription_plan = 'free',
    subscription_status = 'active'
WHERE subscription_plan IS NULL OR subscription_plan = '';

-- 7. Create indexes and RLS policies
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON user_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_plan);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read subscription plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Users can read own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own usage" ON user_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage user_subscriptions" ON user_subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage user_usage" ON user_usage FOR ALL USING (auth.role() = 'service_role');

-- 8. Verification queries
SELECT 'UPDATED_PRO_PLAN' as check_type, * FROM subscription_plans WHERE name = 'pro';
SELECT 'MIGRATED_SUBSCRIPTIONS' as check_type, COUNT(*) as count FROM user_subscriptions;
SELECT 'PROFILES_UPDATED' as check_type, subscription_plan, COUNT(*) as count FROM profiles GROUP BY subscription_plan; 