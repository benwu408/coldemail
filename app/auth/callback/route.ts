import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  
  // Debug logging
  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    type,
    origin,
    fullUrl: request.url,
    searchParams: Object.fromEntries(searchParams.entries())
  })
  
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    console.log('Exchanging code for session...')
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
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
      console.error('Session exchange failed:', error)
    }
  } else {
    console.log('No code parameter found')
  }

  // Return the user to an error page with instructions
  console.log('Redirecting to error page')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
} 