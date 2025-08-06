-- Manual User Pro Upgrade Script
-- Replace 'user-email@example.com' with the actual user's email address

-- Method 1: Upgrade by email address
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get user UUID by email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'user-email@example.com';
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email user-email@example.com not found';
    END IF;
    
    -- Assign Pro subscription using the RPC function
    PERFORM assign_user_subscription(
        user_uuid,
        'pro',
        'active',
        'monthly'
    );
    
    -- Update profiles table
    UPDATE profiles 
    SET 
        subscription_plan = 'pro',
        subscription_status = 'active',
        updated_at = NOW()
    WHERE id = user_uuid;
    
    RAISE NOTICE 'User % (%) has been upgraded to Pro', user_uuid, 'user-email@example.com';
END $$;

-- Method 2: If you know the user UUID directly, use this simpler version
-- Replace 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' with the actual user UUID

/*
SELECT assign_user_subscription(
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::UUID,
    'pro',
    'active',
    'monthly'
);

UPDATE profiles 
SET 
    subscription_plan = 'pro',
    subscription_status = 'active',
    updated_at = NOW()
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::UUID;
*/

-- Method 3: Bulk upgrade multiple users by email
-- Uncomment and modify the emails list as needed

/*
DO $$
DECLARE
    user_emails TEXT[] := ARRAY[
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
    ];
    user_email TEXT;
    user_uuid UUID;
BEGIN
    FOREACH user_email IN ARRAY user_emails
    LOOP
        -- Get user UUID by email
        SELECT id INTO user_uuid 
        FROM auth.users 
        WHERE email = user_email;
        
        IF user_uuid IS NOT NULL THEN
            -- Assign Pro subscription
            PERFORM assign_user_subscription(
                user_uuid,
                'pro',
                'active',
                'monthly'
            );
            
            -- Update profiles table
            UPDATE profiles 
            SET 
                subscription_plan = 'pro',
                subscription_status = 'active',
                updated_at = NOW()
            WHERE id = user_uuid;
            
            RAISE NOTICE 'User % (%) upgraded to Pro', user_uuid, user_email;
        ELSE
            RAISE NOTICE 'User with email % not found', user_email;
        END IF;
    END LOOP;
END $$;
*/

-- Verification Query: Check user's current subscription status
-- Replace 'user-email@example.com' with the user's email to verify

SELECT 
    u.email,
    u.id as user_id,
    p.subscription_plan,
    p.subscription_status,
    us.plan_name,
    us.status,
    us.created_at as subscription_created,
    us.trial_end_date
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.email = 'user-email@example.com'; 