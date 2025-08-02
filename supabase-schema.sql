-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS generated_emails CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  job_title TEXT,
  company TEXT,
  education JSONB,
  location TEXT,
  industry TEXT,
  experience_years TEXT,
  skills TEXT[],
  interests TEXT[],
  background TEXT,
  linkedin_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_emails table
CREATE TABLE generated_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_role TEXT,
  recipient_company TEXT,
  outreach_purpose TEXT NOT NULL,
  context TEXT,
  additional_notes TEXT,
  generated_email TEXT NOT NULL,
  subject_line TEXT,
  tone TEXT DEFAULT 'formal',
  research_findings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_generated_emails_user_id ON generated_emails(user_id);
CREATE INDEX idx_generated_emails_created_at ON generated_emails(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for generated_emails
CREATE POLICY "Users can view own emails" ON generated_emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON generated_emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails" ON generated_emails
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON generated_emails
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_emails_updated_at 
  BEFORE UPDATE ON generated_emails 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 