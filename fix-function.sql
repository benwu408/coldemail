-- Fix for the billing_cycle parameter name conflict
-- Run this first to drop the existing function, then recreate it

-- Drop the existing function
DROP FUNCTION IF EXISTS assign_user_subscription(uuid, character varying, character varying, character varying, integer);

-- Recreate the function with the correct parameter name
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
END;
$$ LANGUAGE plpgsql; 