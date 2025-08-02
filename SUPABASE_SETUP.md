# Supabase Authentication Setup Guide

## 🚀 Set Up Supabase Authentication

### 1. **Create a Supabase Project**
1. Go to [Supabase](https://supabase.com/)
2. Click "Start your project" or "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `cold-email-generator` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. **Get Your API Keys**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

### 3. **Configure Environment Variables**
Add these to your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. **Enable Email Authentication**
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: Optional (recommended for production)
   - **Enable secure email change**: Optional
   - **Enable double confirm changes**: Optional

### 5. **Customize Email Templates (Optional)**
1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - **Confirm signup**
   - **Reset password**
   - **Change email address**

## 🔧 Features Included

### **Authentication Features**
- ✅ **Email/Password Sign Up**: Users can create accounts
- ✅ **Email/Password Sign In**: Secure login
- ✅ **Session Management**: Automatic session handling
- ✅ **Protected Routes**: App only accessible to authenticated users
- ✅ **Logout Functionality**: Secure logout with session cleanup
- ✅ **Loading States**: Smooth loading experience
- ✅ **Error Handling**: User-friendly error messages

### **User Experience**
- ✅ **Beautiful Login Form**: Modern, responsive design
- ✅ **Password Visibility Toggle**: Show/hide password
- ✅ **Form Validation**: Real-time validation
- ✅ **Toast Notifications**: Success/error feedback
- ✅ **User Info Display**: Shows logged-in user's email
- ✅ **Seamless Integration**: Works with existing cold email generator

## 🎯 How It Works

### **Authentication Flow**
1. **User visits app** → Redirected to login if not authenticated
2. **User signs up/in** → Credentials verified with Supabase
3. **Authentication successful** → User redirected to cold email generator
4. **User can logout** → Session cleared, redirected to login

### **Protected Routes**
- All cold email generator functionality is protected
- Users must be authenticated to access the app
- Automatic session restoration on page refresh

## 🚀 Ready to Use!

1. **Add your Supabase credentials** to `.env.local`
2. **Restart the development server**: `npm run dev`
3. **Test authentication** by creating an account
4. **Start generating emails** with your authenticated account!

## 🔒 Security Features

- **Secure Password Storage**: Passwords hashed by Supabase
- **JWT Tokens**: Secure session management
- **HTTPS Only**: All communication encrypted
- **Rate Limiting**: Built-in protection against abuse
- **Email Verification**: Optional email confirmation

Your cold email generator now has **enterprise-grade authentication**! 🎉 