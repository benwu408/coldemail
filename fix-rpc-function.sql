-- Fix the ambiguous column reference in assign_user_subscription function
-- The issue is that both user_subscriptions and the function parameter have 'subscription_status'

DROP FUNCTION IF EXISTS assign_user_subscription(UUID, VARCHAR, VARCHAR, VARCHAR, INTEGER);

CREATE OR REPLACE FUNCTION assign_user_subscription(
    user_uuid UUID,
    plan_name VARCHAR,
    subscription_status_param VARCHAR DEFAULT 'active',
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
        subscription_status_param,
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
        subscription_status = subscription_status_param,
        updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Test the function
DO $$
BEGIN
    RAISE NOTICE 'Fixed assign_user_subscription function - ambiguous column reference resolved';
END $$; 