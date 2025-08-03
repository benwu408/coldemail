-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  job_title TEXT,
  company TEXT,
  education JSONB DEFAULT '{}',
  location TEXT,
  industry TEXT,
  experience_years TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  background TEXT,
  linkedin_url TEXT,
  website TEXT,
  resume_text TEXT,
  resume_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create generated_emails table
CREATE TABLE IF NOT EXISTS generated_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_company TEXT,
  recipient_role TEXT,
  recipient_email TEXT,
  purpose TEXT,
  search_mode TEXT DEFAULT 'basic',
  research_findings TEXT,
  commonalities TEXT,
  generated_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for generated_emails
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own emails" ON generated_emails;
DROP POLICY IF EXISTS "Users can insert own emails" ON generated_emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON generated_emails;

-- Create RLS policies for generated_emails
CREATE POLICY "Users can view own emails" ON generated_emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON generated_emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON generated_emails
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_emails_user_id ON generated_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_emails_created_at ON generated_emails(created_at DESC); 