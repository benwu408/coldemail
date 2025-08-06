-- Create missing profiles for all existing users
-- This ensures every user has a profile row with default free plan

-- Insert profiles for users who don't have them
INSERT INTO profiles (
    id,
    subscription_plan,
    subscription_status,
    created_at,
    updated_at
)
SELECT 
    au.id,
    'free',
    'active',
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Show how many profiles were created
DO $$
DECLARE
    profile_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    RAISE NOTICE 'Total users: %', user_count;
    RAISE NOTICE 'Total profiles: %', profile_count;
    
    IF profile_count = user_count THEN
        RAISE NOTICE 'SUCCESS: All users now have profiles!';
    ELSE
        RAISE NOTICE 'WARNING: % users still missing profiles', (user_count - profile_count);
    END IF;
END $$;

-- Verify the profiles were created correctly
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN subscription_plan = 'free' THEN 1 END) as free_users,
    COUNT(CASE WHEN subscription_plan = 'pro' THEN 1 END) as pro_users
FROM profiles; 