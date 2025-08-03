# Supabase Email Redirect Setup for reachful.io

## Overview
This guide will help you configure Supabase email redirects to work with your new domain `reachful.io`.

## Steps to Update Supabase Settings

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `vexchvtuaysaoirlucbs`

### 2. Navigate to Authentication Settings
1. In the left sidebar, click on **"Authentication"**
2. Click on **"Settings"** (gear icon)
3. Scroll down to **"URL Configuration"**

### 3. Update Site URL
Set the **Site URL** to:
```
https://reachful.io
```

### 4. Update Redirect URLs
Add these redirect URLs to the **"Redirect URLs"** section:

#### For Production (reachful.io):
```
https://reachful.io
https://reachful.io/
https://reachful.io/login
https://reachful.io/generate
https://reachful.io/profile
https://reachful.io/past-emails
```

#### For Development (if needed):
```
http://localhost:3000
http://localhost:3000/
http://localhost:3000/login
http://localhost:3000/generate
http://localhost:3000/profile
http://localhost:3000/past-emails
```

### 5. Update Email Templates (Optional)
1. Go to **"Authentication"** → **"Email Templates"**
2. Update the **"Confirm signup"** template:
   - Change any hardcoded URLs from your old domain to `https://reachful.io`
3. Update the **"Reset password"** template:
   - Change any hardcoded URLs from your old domain to `https://reachful.io`

### 6. Test the Configuration
1. Try signing up with a new email
2. Check that the confirmation email redirects to `https://reachful.io`
3. Try the "forgot password" flow
4. Verify that password reset emails redirect properly

## Important Notes

### Environment Variables
Your current environment variables are correct:
```
NEXT_PUBLIC_SUPABASE_URL=https://vexchvtuaysaoirlucbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel Deployment
Make sure your Vercel deployment is configured to use the `reachful.io` domain:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **"Settings"** → **"Domains"**
4. Add `reachful.io` as a custom domain
5. Update DNS settings as instructed by Vercel

### SSL Certificate
Ensure your `reachful.io` domain has a valid SSL certificate (Vercel handles this automatically).

## Troubleshooting

### Common Issues:
1. **Redirect loop**: Make sure all redirect URLs are properly formatted
2. **Email not sending**: Check Supabase project status and email provider settings
3. **Domain not working**: Verify DNS settings and SSL certificate

### Testing:
- Use incognito/private browsing to test authentication flows
- Clear browser cache if experiencing issues
- Check browser console for any errors

## Next Steps
After updating these settings:
1. Test the complete authentication flow
2. Verify email confirmations work
3. Test password reset functionality
4. Ensure all redirects work properly on the new domain 