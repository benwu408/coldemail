import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  
  // Debug logging
  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    type,
    error,
    errorCode,
    errorDescription,
    origin,
    fullUrl: request.url,
    searchParams: Object.fromEntries(searchParams.entries())
  })
  
  // Handle errors first
  if (error) {
    console.log('Auth callback received error:', { error, errorCode, errorDescription })
    
    if (errorCode === 'otp_expired') {
      return NextResponse.redirect(`${origin}/login?error=link_expired&message=Password reset link has expired. Please request a new one.`)
    }
    
    if (error === 'access_denied') {
      return NextResponse.redirect(`${origin}/login?error=access_denied&message=Access was denied. Please try again.`)
    }
    
    return NextResponse.redirect(`${origin}/login?error=auth_failed&message=Authentication failed. Please try again.`)
  }
  
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    console.log('Exchanging code for session...')
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      console.log('Session exchange successful')
      // Check if this is a password recovery
      if (type === 'recovery') {
        console.log('Redirecting to reset-password page')
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      // Default redirect
      console.log('Redirecting to homepage')
      return NextResponse.redirect(`${origin}/`)
    } else {
      console.error('Session exchange failed:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=session_failed&message=Failed to create session. Please try again.`)
    }
  }

  // No code parameter found
  console.log('No code parameter found')
  return NextResponse.redirect(`${origin}/login?error=no_code&message=Invalid authentication link. Please request a new password reset.`)
} 