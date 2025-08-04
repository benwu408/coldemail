import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check current table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'generated_emails' })

    if (columnsError) {
      console.log('Could not get columns via RPC, trying direct query...')
      
      // Try to add missing columns
      const { error: addCommonalitiesError } = await supabase
        .rpc('exec_sql', { 
          sql: 'ALTER TABLE generated_emails ADD COLUMN IF NOT EXISTS commonalities TEXT;' 
        })

      const { error: addFindingsError } = await supabase
        .rpc('exec_sql', { 
          sql: 'ALTER TABLE generated_emails ADD COLUMN IF NOT EXISTS research_findings TEXT;' 
        })

      const { error: addSearchModeError } = await supabase
        .rpc('exec_sql', { 
          sql: 'ALTER TABLE generated_emails ADD COLUMN IF NOT EXISTS search_mode TEXT DEFAULT \'basic\';' 
        })

      // Test if we can now insert a test record
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000001', // Test user ID
        recipient_name: 'Schema Test',
        recipient_company: 'Test Company',
        recipient_role: 'Test Role',
        purpose: 'Test Purpose',
        search_mode: 'basic',
        research_findings: 'Test research findings',
        commonalities: 'Test commonalities',
        generated_email: 'Test email content'
      }

      const { data: insertData, error: insertError } = await supabase
        .from('generated_emails')
        .insert(testData)
        .select()

      if (insertError) {
        return NextResponse.json({ 
          error: 'Schema fix failed', 
          details: insertError,
          addErrors: {
            commonalities: addCommonalitiesError,
            findings: addFindingsError,
            searchMode: addSearchModeError
          }
        }, { status: 500 })
      }

      // Clean up test data
      await supabase
        .from('generated_emails')
        .delete()
        .eq('recipient_name', 'Schema Test')

      return NextResponse.json({ 
        success: true, 
        message: 'Schema fixed successfully',
        testInsert: insertData?.[0] || null
      })

    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'Schema already correct',
        columns: columns
      })
    }

  } catch (error) {
    console.error('Error in fix-schema API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 