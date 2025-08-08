-- Create a trigger to automatically create profiles for new users
-- This ensures every new user gets a profile with default free plan

-- Create the trigger function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new profile for the user
    INSERT INTO profiles (
        user_id,
        full_name,
        job_title,
        company,
        email,
        phone,
        background,
        education,
        skills,
        interests,
        resume_text,
        subscription_plan,
        subscription_status,
        job_experiences,
        location,
        industry,
        linkedin_url,
        website,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        null,
        null,
        null,
        null,
        null,
        null,
        '{"major": null, "degree": null, "school": null, "graduation_year": null}',
        '{}',
        '{}',
        null,
        'free',
        'active',
        '[]',
        null,
        null,
        null,
        null,
        NEW.created_at,
        NEW.created_at
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
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
    RAISE NOTICE 'New users will automatically get profiles with free plan.';
END $$; 