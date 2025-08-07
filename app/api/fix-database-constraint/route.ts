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

    console.log('=== Fixing Database Constraint ===')

    // Drop any check constraints on search_mode column
    const { error: dropConstraintError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          DO $$
          BEGIN
            -- Drop any check constraints on search_mode column
            IF EXISTS (
              SELECT 1 FROM information_schema.table_constraints 
              WHERE table_name = 'generated_emails' 
              AND constraint_name LIKE '%search_mode%'
              AND constraint_type = 'CHECK'
            ) THEN
              EXECUTE 'ALTER TABLE generated_emails DROP CONSTRAINT IF EXISTS generated_emails_search_mode_check';
            END IF;
          END $$;
        `
      })

    if (dropConstraintError) {
      console.error('Error dropping constraint:', dropConstraintError)
      return NextResponse.json({ 
        error: 'Failed to drop constraint',
        details: dropConstraintError
      }, { status: 500 })
    }

    // Verify the column exists and has no constraints
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            column_name, 
            data_type, 
            column_default,
            is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'generated_emails' 
          AND column_name = 'search_mode';
        `
      })

    if (columnError) {
      console.error('Error getting column info:', columnError)
      return NextResponse.json({ 
        error: 'Failed to get column info',
        details: columnError
      }, { status: 500 })
    }

    // Show any remaining constraints on the table
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            constraint_name,
            constraint_type
          FROM information_schema.table_constraints 
          WHERE table_name = 'generated_emails';
        `
      })

    if (constraintsError) {
      console.error('Error getting constraints:', constraintsError)
      return NextResponse.json({ 
        error: 'Failed to get constraints',
        details: constraintsError
      }, { status: 500 })
    }

    // Test insert with 'deep' value
    const { data: testInsert, error: testInsertError } = await supabase
      .from('generated_emails')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001', // Test user ID
        recipient_name: 'Database Test',
        recipient_company: 'Test Company',
        recipient_role: 'Test Role',
        purpose: 'Test Purpose',
        search_mode: 'deep', // This should now work
        research_findings: 'Test research findings',
        commonalities: 'Test commonalities',
        generated_email: 'Test email content'
      })
      .select()

    if (testInsertError) {
      console.error('Test insert failed:', testInsertError)
      return NextResponse.json({ 
        error: 'Test insert failed',
        details: testInsertError
      }, { status: 500 })
    }

    // Clean up test data
    const { error: cleanupError } = await supabase
      .from('generated_emails')
      .delete()
      .eq('recipient_name', 'Database Test')

    if (cleanupError) {
      console.error('Cleanup failed:', cleanupError)
    }

    console.log('Database constraint fix completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Database constraint fixed successfully',
      columnInfo,
      constraints,
      testInsert: testInsert ? 'Success' : 'Failed'
    })

  } catch (error) {
    console.error('Error fixing database constraint:', error)
    return NextResponse.json({ 
      error: 'Failed to fix database constraint',
      details: error
    }, { status: 500 })
  }
} 