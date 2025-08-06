-- Supabase Subscription Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '{}',
    search_type VARCHAR(20) NOT NULL DEFAULT 'basic',
    daily_generation_limit INTEGER DEFAULT NULL, -- NULL means unlimited
    tone_options TEXT[] DEFAULT ARRAY['professional'],
    email_editing_enabled BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, price_monthly, price_yearly, features, search_type, daily_generation_limit, tone_options, email_editing_enabled, priority_support) VALUES
('free', 'Free', 0.00, 0.00, 
 '{"basic_search": true, "ai_research": true, "commonality_detection": true, "email_history": true, "export_email": true}',
 'basic', 2, ARRAY['professional'], FALSE, FALSE),
('pro', 'Pro', 29.00, 290.00,
 '{"deep_research": true, "unlimited_generations": true, "tone_customization": true, "email_editing": true, "advanced_commonalities": true, "priority_support": true, "analytics": true}',
 'deep', NULL, ARRAY['casual', 'formal', 'confident', 'professional'], TRUE, TRUE);

-- 3. Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, expired, trial
    billing_cycle VARCHAR(10) NOT NULL DEFAULT 'monthly', -- monthly, yearly
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One subscription per user
);

-- 4. Create usage tracking table
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    generations_count INTEGER DEFAULT 0,
    searches_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date) -- One record per user per day
);

-- 5. Add subscription fields to profiles table (if it doesn't exist, create it)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255),
    job_title VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    background TEXT,
    education JSONB,
    skills TEXT[],
    interests TEXT[],
    resume_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add subscription-related columns to profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE profiles ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'free';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

-- 6. Function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE(
    plan_name VARCHAR(50),
    plan_display_name VARCHAR(100),
    search_type VARCHAR(20),
    daily_generation_limit INTEGER,
    tone_options TEXT[],
    email_editing_enabled BOOLEAN,
    priority_support BOOLEAN,
    status VARCHAR(20),
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
        COALESCE(us.status, 'active'),
        us.trial_end_date
    FROM subscription_plans sp
    LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.user_id = user_uuid
    WHERE sp.name = COALESCE(
        (SELECT profiles.subscription_plan FROM profiles WHERE profiles.id = user_uuid),
        'free'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to check daily usage limit
CREATE OR REPLACE FUNCTION check_daily_usage_limit(user_uuid UUID)
RETURNS TABLE(
    generations_today INTEGER,
    limit_reached BOOLEAN,
    daily_limit INTEGER
) AS $$
DECLARE
    user_plan_limit INTEGER;
    user_generations INTEGER;
BEGIN
    -- Get user's daily limit
    SELECT sp.daily_generation_limit INTO user_plan_limit
    FROM subscription_plans sp
    LEFT JOIN profiles p ON p.id = user_uuid
    WHERE sp.name = COALESCE(p.subscription_plan, 'free');
    
    -- Get today's usage
    SELECT COALESCE(uu.generations_count, 0) INTO user_generations
    FROM user_usage uu
    WHERE uu.user_id = user_uuid AND uu.date = CURRENT_DATE;
    
    RETURN QUERY SELECT 
        user_generations,
        CASE 
            WHEN user_plan_limit IS NULL THEN FALSE -- Unlimited
            ELSE user_generations >= user_plan_limit
        END,
        user_plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to increment usage count
CREATE OR REPLACE FUNCTION increment_user_usage(user_uuid UUID, usage_type VARCHAR(20))
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_usage (user_id, date, generations_count, searches_count)
    VALUES (
        user_uuid, 
        CURRENT_DATE, 
        CASE WHEN usage_type = 'generation' THEN 1 ELSE 0 END,
        CASE WHEN usage_type = 'search' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
        generations_count = user_usage.generations_count + CASE WHEN usage_type = 'generation' THEN 1 ELSE 0 END,
        searches_count = user_usage.searches_count + CASE WHEN usage_type = 'search' THEN 1 ELSE 0 END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to assign subscription to user
CREATE OR REPLACE FUNCTION assign_user_subscription(
    user_uuid UUID,
    plan_name VARCHAR(50),
    subscription_status VARCHAR(20) DEFAULT 'active',
    billing_cycle VARCHAR(10) DEFAULT 'monthly',
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
    
    -- Calculate trial end date if trial days provided
    IF trial_days IS NOT NULL THEN
        trial_end := NOW() + (trial_days || ' days')::INTERVAL;
    END IF;
    
    -- Update or insert subscription
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
        billing_cycle,
        CASE WHEN trial_days IS NOT NULL THEN NOW() ELSE NULL END,
        trial_end
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        plan_id = plan_uuid,
        status = subscription_status,
        billing_cycle = billing_cycle,
        trial_start_date = CASE WHEN trial_days IS NOT NULL THEN NOW() ELSE user_subscriptions.trial_start_date END,
        trial_end_date = trial_end,
        updated_at = NOW();
    
    -- Update profile subscription
    UPDATE profiles 
    SET 
        subscription_plan = plan_name,
        subscription_status = subscription_status,
        updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Set up Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription data
CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own usage data
CREATE POLICY "Users can view own usage" ON user_usage
    FOR ALL USING (auth.uid() = user_id);

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON user_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);

-- 12. Sample data: Assign all existing users to free plan
INSERT INTO user_subscriptions (user_id, plan_id, status)
SELECT 
    au.id,
    sp.id,
    'active'
FROM auth.users au
CROSS JOIN subscription_plans sp
WHERE sp.name = 'free'
AND NOT EXISTS (
    SELECT 1 FROM user_subscriptions us WHERE us.user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Update profiles for existing users
UPDATE profiles 
SET 
    subscription_plan = 'free',
    subscription_status = 'active'
WHERE subscription_plan IS NULL;

-- 13. Helpful queries for managing subscriptions

-- View all users with their subscription info
/*
SELECT 
    p.full_name,
    p.email,
    sp.display_name as plan,
    us.status,
    us.trial_end_date,
    us.created_at as subscribed_at
FROM profiles p
LEFT JOIN user_subscriptions us ON p.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;
*/

-- View daily usage stats
/*
SELECT 
    uu.date,
    COUNT(DISTINCT uu.user_id) as active_users,
    SUM(uu.generations_count) as total_generations,
    AVG(uu.generations_count) as avg_generations_per_user
FROM user_usage uu
WHERE uu.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY uu.date
ORDER BY uu.date DESC;
*/

COMMENT ON TABLE subscription_plans IS 'Available subscription plans with features and pricing';
COMMENT ON TABLE user_subscriptions IS 'User subscription assignments and billing information';
COMMENT ON TABLE user_usage IS 'Daily usage tracking for rate limiting and analytics';
COMMENT ON FUNCTION get_user_subscription(UUID) IS 'Get current subscription details for a user';
COMMENT ON FUNCTION check_daily_usage_limit(UUID) IS 'Check if user has reached daily generation limit';
COMMENT ON FUNCTION increment_user_usage(UUID, VARCHAR) IS 'Increment usage counter for rate limiting';
COMMENT ON FUNCTION assign_user_subscription(UUID, VARCHAR, VARCHAR, VARCHAR, INTEGER) IS 'Assign or update user subscription plan'; 