-- Create a trigger to automatically create profiles for new users
-- This ensures every new user gets a profile with default free plan

-- First, create the trigger function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new profile for the user
    INSERT INTO profiles (
        id,
        subscription_plan,
        subscription_status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        'free',
        'active',
        NEW.created_at,
        NEW.created_at
    );
    
    -- Also add them to user_subscriptions with free plan
    INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        billing_cycle,
        created_at,
        updated_at
    )
    SELECT 
        NEW.id,
        sp.id,
        'active',
        'monthly',
        NEW.created_at,
        NEW.created_at
    FROM subscription_plans sp
    WHERE sp.name = 'free';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- Create the trigger
CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Test message
DO $$
BEGIN
    RAISE NOTICE 'Profile creation trigger installed successfully!';
    RAISE NOTICE 'New users will automatically get profiles and free plan subscriptions.';
END $$; 