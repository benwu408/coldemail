import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Test 1: Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to access user_profiles table',
        details: tableError
      }, { status: 500 })
    }

    // Test 2: Try to insert a test record with long school name
    const testData = {
      user_id: 'test-user-schema-check',
      full_name: 'Test User',
      job_title: 'Test Job',
      company: 'Test Company',
      education: {
        school: 'University of Illinois Urbana-Champaign (UIUC) - This is a very long school name to test truncation',
        degree: 'Bachelor\'s',
        major: 'Computer Science',
        graduation_year: '2020'
      },
      location: 'Test Location',
      industry: 'Technology',
      experience_years: '3-5 years',
      skills: ['Test Skill'],
      interests: ['Test Interest'],
      background: 'Test background',
      linkedin_url: 'https://test.com',
      website: 'https://test.com',
      updated_at: new Date().toISOString()
    }

    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .upsert(testData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert test data',
        details: insertError,
        testData: testData
      }, { status: 500 })
    }

    // Test 3: Retrieve the test data to see if it was truncated
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', 'test-user-schema-check')
      .single()

    if (retrieveError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve test data',
        details: retrieveError
      }, { status: 500 })
    }

    // Test 4: Clean up test data
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', 'test-user-schema-check')

    const originalSchool = testData.education.school
    const savedSchool = retrievedData.education?.school

    return NextResponse.json({
      success: true,
      message: 'Database schema test completed',
      results: {
        originalSchool: originalSchool,
        savedSchool: savedSchool,
        originalLength: originalSchool.length,
        savedLength: savedSchool?.length || 0,
        wasTruncated: originalSchool !== savedSchool,
        difference: originalSchool !== savedSchool ? {
          original: originalSchool,
          saved: savedSchool
        } : null
      },
      tableStructure: tableInfo ? 'Table accessible' : 'Table not accessible',
      insertTest: insertData ? 'Insert successful' : 'Insert failed',
      retrieveTest: retrievedData ? 'Retrieve successful' : 'Retrieve failed',
      cleanupTest: deleteError ? 'Cleanup failed' : 'Cleanup successful'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 