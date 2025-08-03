-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create generated_emails table
CREATE TABLE IF NOT EXISTS generated_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_company TEXT,
  recipient_role TEXT,
  purpose TEXT,
  tone TEXT,
  email_content TEXT NOT NULL,
  research_findings TEXT,
  commonalities TEXT,
  search_mode TEXT DEFAULT 'basic', -- 'basic' or 'deep'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for generated_emails
CREATE POLICY "Users can view own emails" ON generated_emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON generated_emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON generated_emails
  FOR DELETE USING (auth.uid() = user_id); 