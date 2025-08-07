import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  return await POST(request)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('=== Testing Database Constraint ===')

    // Test 1: Try to insert with 'basic' search_mode
    console.log('Test 1: Inserting with search_mode = "basic"')
    const { data: basicInsert, error: basicError } = await supabase
      .from('generated_emails')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        recipient_name: 'Database Test Basic',
        recipient_company: 'Test Company',
        recipient_role: 'Test Role',
        purpose: 'Test Purpose',
        search_mode: 'basic',
        research_findings: 'Test research findings',
        commonalities: 'Test commonalities',
        generated_email: 'Test email content'
      })
      .select()

    if (basicError) {
      console.error('Basic insert failed:', basicError)
      return NextResponse.json({ 
        error: 'Basic insert failed',
        details: basicError
      }, { status: 500 })
    }

    console.log('Basic insert successful:', basicInsert)

    // Test 2: Try to insert with 'deep' search_mode
    console.log('Test 2: Inserting with search_mode = "deep"')
    const { data: deepInsert, error: deepError } = await supabase
      .from('generated_emails')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        recipient_name: 'Database Test Deep',
        recipient_company: 'Test Company',
        recipient_role: 'Test Role',
        purpose: 'Test Purpose',
        search_mode: 'deep',
        research_findings: 'Test research findings',
        commonalities: 'Test commonalities',
        generated_email: 'Test email content'
      })
      .select()

    if (deepError) {
      console.error('Deep insert failed:', deepError)
      return NextResponse.json({ 
        error: 'Deep insert failed - this is the problem!',
        details: deepError,
        message: 'The database constraint is still preventing "deep" values from being saved'
      }, { status: 500 })
    }

    console.log('Deep insert successful:', deepInsert)

    // Clean up test data
    const { error: cleanupError } = await supabase
      .from('generated_emails')
      .delete()
      .in('recipient_name', ['Database Test Basic', 'Database Test Deep'])

    if (cleanupError) {
      console.error('Cleanup failed:', cleanupError)
    }

    return NextResponse.json({
      success: true,
      message: 'Both basic and deep inserts worked! Database constraint is fixed.',
      basicInsert,
      deepInsert
    })

  } catch (error) {
    console.error('Error testing database constraint:', error)
    return NextResponse.json({ 
      error: 'Failed to test database constraint',
      details: error
    }, { status: 500 })
  }
} 