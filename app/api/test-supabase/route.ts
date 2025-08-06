import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  console.log('Testing Supabase connection...')
  
  // Check environment variables
  const envCheck = {
    SUPABASE_URL_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_KEY_EXISTS: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
  }
  
  console.log('Environment check:', envCheck)
  
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)
    
    if (connectionError) {
      console.error('Supabase connection failed:', connectionError)
      return NextResponse.json({ 
        success: false,
        error: 'Database connection failed',
        details: connectionError,
        env: envCheck
      }, { status: 500 })
    }
    
    // Test auth admin access
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Auth admin access failed:', userError)
      return NextResponse.json({ 
        success: false,
        error: 'Auth admin access failed',
        details: userError,
        env: envCheck
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Supabase connection successful',
      profilesAccess: true,
      authAdminAccess: true,
      userCount: userData.users.length,
      env: envCheck
    })
    
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Connection test failed',
      details: error,
      env: envCheck
    }, { status: 500 })
  }
} 