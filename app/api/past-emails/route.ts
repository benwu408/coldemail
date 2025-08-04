import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extract user ID from Authorization header
    const authHeader = request.headers.get('authorization')
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null

    if (!userId) {
      return NextResponse.json({
        error: 'No user ID provided'
      }, { status: 401 })
    }

    // Fetch past emails for the user
    const { data: emails, error } = await supabase
      .from('generated_emails')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching past emails:', error)
      return NextResponse.json({
        error: 'Failed to fetch past emails',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      emails: emails || []
    })

  } catch (error) {
    console.error('Error in past-emails API:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
} 