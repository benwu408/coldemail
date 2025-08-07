import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('=== Database Constraint Test Started ===')
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_SUPABASE_URL is not configured' },
      { status: 500 }
    )
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' },
      { status: 500 }
    )
  }
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    // First, get a real user ID from the database
    console.log('Getting a real user ID from the database...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError) {
      console.error('Error getting users:', usersError)
      return NextResponse.json(
        { error: 'Failed to get users from database', details: usersError },
        { status: 500 }
      )
    }
    
    if (!users || users.length === 0) {
      console.log('No users found in database')
      return NextResponse.json(
        { 
          error: 'No users found in database',
          message: 'Cannot test database constraints without any users. Please create a user account first.'
        },
        { status: 400 }
      )
    }
    
    const realUserId = users[0].id
    console.log('Using real user ID:', realUserId)
    
    const results = {
      basicInsert: { success: false, error: null },
      deepInsert: { success: false, error: null },
      userInfo: { userId: realUserId, totalUsers: users.length }
    }
    
    // Test 1: Try to insert with search_mode: 'basic'
    console.log('Testing basic insert...')
    try {
      const { data: basicData, error: basicError } = await supabase
        .from('generated_emails')
        .insert({
          user_id: realUserId,
          recipient_name: 'Test User',
          recipient_company: 'Test Company',
          recipient_role: 'Test Role',
          purpose: 'Database constraint test',
          search_mode: 'basic',
          research_findings: 'Test research findings',
          commonalities: 'Test commonalities',
          generated_email: 'Test email content'
        })
        .select()
      
      if (basicError) {
        console.error('Basic insert failed:', basicError)
        results.basicInsert = { success: false, error: basicError }
      } else {
        console.log('Basic insert succeeded:', basicData)
        results.basicInsert = { success: true, error: null }
        
        // Clean up the test record
        if (basicData && basicData.length > 0) {
          await supabase
            .from('generated_emails')
            .delete()
            .eq('id', basicData[0].id)
        }
      }
    } catch (basicException) {
      console.error('Basic insert exception:', basicException)
      results.basicInsert = { success: false, error: basicException }
    }
    
    // Test 2: Try to insert with search_mode: 'deep'
    console.log('Testing deep insert...')
    try {
      const { data: deepData, error: deepError } = await supabase
        .from('generated_emails')
        .insert({
          user_id: realUserId,
          recipient_name: 'Test User Deep',
          recipient_company: 'Test Company Deep',
          recipient_role: 'Test Role Deep',
          purpose: 'Database constraint test - deep',
          search_mode: 'deep',
          research_findings: 'Test deep research findings',
          commonalities: 'Test deep commonalities',
          generated_email: 'Test deep email content'
        })
        .select()
      
      if (deepError) {
        console.error('Deep insert failed:', deepError)
        results.deepInsert = { success: false, error: deepError }
      } else {
        console.log('Deep insert succeeded:', deepData)
        results.deepInsert = { success: true, error: null }
        
        // Clean up the test record
        if (deepData && deepData.length > 0) {
          await supabase
            .from('generated_emails')
            .delete()
            .eq('id', deepData[0].id)
        }
      }
    } catch (deepException) {
      console.error('Deep insert exception:', deepException)
      results.deepInsert = { success: false, error: deepException }
    }
    
    console.log('Database constraint test completed')
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Database constraint test error:', error)
    return NextResponse.json(
      { error: 'Database constraint test failed', details: error },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return await POST(request)
} 