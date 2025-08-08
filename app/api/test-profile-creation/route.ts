import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    const { userId, testType = 'full' } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const results: any[] = []

    // Test 1: Check if profiles table exists
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (tableError) {
        results.push({
          test: 'Profiles Table Check',
          success: false,
          error: tableError.message,
          data: tableError
        })
      } else {
        results.push({
          test: 'Profiles Table Check',
          success: true,
          data: { tableExists: true }
        })
      }
    } catch (error) {
      results.push({
        test: 'Profiles Table Check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Check if user profile already exists
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          results.push({
            test: 'Existing Profile Check',
            success: false,
            error: 'Profile not found',
            data: profileError
          })
        } else {
          results.push({
            test: 'Existing Profile Check',
            success: false,
            error: profileError.message,
            data: profileError
          })
        }
      } else {
        results.push({
          test: 'Existing Profile Check',
          success: true,
          data: { existingProfile }
        })
      }
    } catch (error) {
      results.push({
        test: 'Existing Profile Check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Try to create a profile with minimal data
    try {
      const minimalProfile = {
        user_id: userId,
        subscription_plan: 'free',
        subscription_status: 'active'
      }

      const { data: minimalCreated, error: minimalError } = await supabase
        .from('profiles')
        .upsert(minimalProfile, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()

      if (minimalError) {
        results.push({
          test: 'Minimal Profile Creation',
          success: false,
          error: minimalError.message,
          data: { error: minimalError, attemptedData: minimalProfile }
        })
      } else {
        results.push({
          test: 'Minimal Profile Creation',
          success: true,
          data: { createdProfile: minimalCreated }
        })
      }
    } catch (error) {
      results.push({
        test: 'Minimal Profile Creation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Try to create a profile with full data (if testType is 'full')
    if (testType === 'full') {
      try {
        const fullProfile = {
          user_id: userId,
          full_name: null,
          job_title: null,
          company: null,
          email: null,
          phone: null,
          background: null,
          education: '{"major": null, "degree": null, "school": null, "graduation_year": null}',
          skills: [],
          interests: [],
          resume_text: null,
          subscription_plan: 'free',
          subscription_status: 'active',
          job_experiences: '[]',
          location: null,
          industry: null,
          linkedin_url: null,
          website: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: fullCreated, error: fullError } = await supabase
          .from('profiles')
          .upsert(fullProfile, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select()

        if (fullError) {
          results.push({
            test: 'Full Profile Creation',
            success: false,
            error: fullError.message,
            data: { error: fullError, attemptedData: fullProfile }
          })
        } else {
          results.push({
            test: 'Full Profile Creation',
            success: true,
            data: { createdProfile: fullCreated }
          })
        }
      } catch (error) {
        results.push({
          test: 'Full Profile Creation',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 5: Check table structure
    try {
      const { data: structure, error: structureError } = await supabase
        .rpc('get_table_structure', { table_name: 'profiles' })
      
      if (structureError) {
        results.push({
          test: 'Table Structure Check',
          success: false,
          error: structureError.message,
          data: structureError
        })
      } else {
        results.push({
          test: 'Table Structure Check',
          success: true,
          data: { structure }
        })
      }
    } catch (error) {
      results.push({
        test: 'Table Structure Check',
        success: false,
        error: 'Structure check failed - function may not exist'
      })
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    })

  } catch (error) {
    console.error('Error in test-profile-creation API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Use POST method to test profile creation',
    example: {
      method: 'POST',
      body: {
        userId: 'user-uuid-here',
        testType: 'full' // or 'minimal'
      }
    }
  })
} 