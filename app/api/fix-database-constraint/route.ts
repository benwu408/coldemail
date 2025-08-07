import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('=== Database Constraint Fix Started ===')
  
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
          message: 'Cannot fix database constraints without any users. Please create a user account first.'
        },
        { status: 400 }
      )
    }
    
    const realUserId = users[0].id
    console.log('Using real user ID:', realUserId)
    
    const results = {
      constraintCheck: { success: false, error: null, constraints: [] },
      constraintDrop: { success: false, error: null },
      testInsert: { success: false, error: null }
    }
    
    // Step 1: Check current constraints on search_mode column
    console.log('Checking current constraints on search_mode column...')
    try {
      const { data: constraintData, error: constraintError } = await supabase
        .rpc('get_table_constraints', { table_name: 'generated_emails' })
      
      if (constraintError) {
        console.error('Error checking constraints:', constraintError)
        results.constraintCheck = { success: false, error: constraintError, constraints: [] }
      } else {
        console.log('Current constraints:', constraintData)
        results.constraintCheck = { success: true, error: null, constraints: constraintData || [] }
      }
    } catch (constraintException) {
      console.error('Constraint check exception:', constraintException)
      results.constraintCheck = { success: false, error: constraintException, constraints: [] }
    }
    
    // Step 2: Try to drop any CHECK constraints on search_mode column
    console.log('Attempting to drop CHECK constraints on search_mode column...')
    try {
      // Use direct SQL to drop constraints
      const { data: dropData, error: dropError } = await supabase
        .rpc('drop_search_mode_constraints')
      
      if (dropError) {
        console.error('Error dropping constraints:', dropError)
        results.constraintDrop = { success: false, error: dropError }
      } else {
        console.log('Constraints dropped successfully:', dropData)
        results.constraintDrop = { success: true, error: null }
      }
    } catch (dropException) {
      console.error('Drop constraint exception:', dropException)
      results.constraintDrop = { success: false, error: dropException }
    }
    
    // Step 3: Test if we can now insert 'deep' values
    console.log('Testing if deep insert works after constraint fix...')
    try {
      const { data: testData, error: testError } = await supabase
        .from('generated_emails')
        .insert({
          user_id: realUserId,
          recipient_name: 'Constraint Fix Test',
          recipient_company: 'Test Company',
          recipient_role: 'Test Role',
          purpose: 'Testing constraint fix',
          search_mode: 'deep',
          research_findings: 'Test research findings',
          commonalities: 'Test commonalities',
          generated_email: 'Test email content'
        })
        .select()
      
      if (testError) {
        console.error('Test insert failed:', testError)
        results.testInsert = { success: false, error: testError }
      } else {
        console.log('Test insert succeeded:', testData)
        results.testInsert = { success: true, error: null }
        
        // Clean up the test record
        if (testData && testData.length > 0) {
          await supabase
            .from('generated_emails')
            .delete()
            .eq('id', testData[0].id)
        }
      }
    } catch (testException) {
      console.error('Test insert exception:', testException)
      results.testInsert = { success: false, error: testException }
    }
    
    console.log('Database constraint fix completed')
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Database constraint fix error:', error)
    return NextResponse.json(
      { error: 'Database constraint fix failed', details: error },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return await POST(request)
} 