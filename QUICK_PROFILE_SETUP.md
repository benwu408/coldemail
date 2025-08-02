# Quick Profile Setup Guide

## 🚀 Fix Profile Saving Issues

### **Step 1: Create the Database Table**

1. **Go to your Supabase dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project** (`vexchvtuaysaoirlucbs`)
3. **Click "SQL Editor"** in the left sidebar
4. **Copy and paste this SQL**:

```sql
-- Drop the table if it exists (to fix any issues)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  job_title TEXT,
  company TEXT,
  education JSONB DEFAULT '{"school": "", "degree": "", "major": "", "graduation_year": ""}'::jsonb,
  location TEXT,
  industry TEXT,
  experience_years TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  background TEXT,
  linkedin_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);
```

5. **Click "Run"** to execute the SQL

### **Step 2: Test the Profile**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Go to your profile page** and try filling in just a few fields:
   - Full Name: "Test User"
   - Job Title: "Software Engineer"
   - Company: "Test Company"

3. **Click "Save Profile"** - it should work now!

### **Step 3: Verify It Works**

1. **Check the browser console** (F12 → Console) for success messages
2. **Refresh the page** - your data should load back
3. **Try adding more fields** gradually

## 🔧 What I Fixed:

- **Made all fields nullable** - you can save partial data
- **Better error handling** - shows helpful messages
- **Data cleaning** - handles empty strings properly
- **Table recreation** - drops and recreates the table to fix any issues

## 🎯 If You Still Get Errors:

1. **Check the browser console** for specific error messages
2. **Make sure you're logged in** (check the user email in the header)
3. **Try filling in just one field** first (like just your name)
4. **Check Supabase dashboard** to see if the table was created

The profile should now save even with just partial information! 🎉 