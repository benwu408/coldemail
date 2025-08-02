# Profile Feature Setup Guide

## 🚀 Set Up User Profiles

### 1. **Create Database Table**

Go to your Supabase dashboard and run the SQL from `supabase-schema.sql`:

1. **Navigate to SQL Editor** in your Supabase dashboard
2. **Copy and paste** the contents of `supabase-schema.sql`
3. **Run the SQL** to create the user_profiles table

### 2. **What the Profile Includes**

The profile collects comprehensive information to help personalize networking outreach:

#### **Basic Information**
- Full Name
- Current Role
- Company
- Location

#### **Education**
- School/University
- Degree Type
- Major/Field of Study
- Graduation Year

#### **Professional Background**
- Industry
- Years of Experience
- Professional Background (text)

#### **Skills & Interests**
- Skills (add/remove tags)
- Interests & Hobbies (add/remove tags)

#### **Social Links**
- LinkedIn URL
- Personal Website

### 3. **How It Enhances Cold Emails**

The profile information is used to:

- **Find Common Ground**: Same school, industry, or interests
- **Create Personal Connections**: Shared background or experiences
- **Show Genuine Interest**: Reference specific details about the recipient
- **Build Credibility**: Demonstrate relevant expertise

### 4. **Example Profile Usage**

**User Profile:**
- Name: Sarah Chen
- School: Stanford University
- Major: Computer Science
- Skills: JavaScript, React, AI
- Interests: Travel, Photography

**Generated Email:**
```
Hi David,

I hope you're doing well! As a fellow Stanford alum with a background in Computer Science, I was excited to see your work at Google. Your recent posts about AI and JavaScript frameworks caught my attention, especially since I've been working with React and exploring AI applications myself.

I'd love to connect and hear about your journey from Stanford to Google, particularly your insights on emerging AI trends...
```

### 5. **Security Features**

- **Row Level Security**: Users can only access their own profile
- **Data Privacy**: Profile data is private and secure
- **Automatic Updates**: Timestamps track when profiles are modified

### 6. **Navigation**

Users can access their profile by:
1. **Logging into the app**
2. **Clicking "Profile"** in the header
3. **Filling out their information**
4. **Saving their profile**

### 7. **Future Enhancements**

- **Profile Completion**: Track how complete a user's profile is
- **Connection Suggestions**: Suggest people to network with based on profile
- **Template Personalization**: Use profile data in email templates
- **Analytics**: Track which profile elements lead to better responses

## 🎯 Ready to Use!

1. **Run the SQL** in your Supabase dashboard
2. **Restart your app**: `npm run dev`
3. **Log in** to your account
4. **Click "Profile"** in the header
5. **Fill out your information** and save
6. **Generate personalized emails** with your profile data!

Your cold email generator now has **comprehensive user profiles** for maximum personalization! 🎉 