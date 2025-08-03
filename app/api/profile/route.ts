import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Get the user from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Extract user ID from the authorization header
    // This assumes the frontend sends the user ID in the authorization header
    const userId = authHeader.replace('Bearer ', '')

    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    // Fetch the user profile from the database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    console.log('Received profile data:', body)
    
    // Get the user from the request headers (same as GET method)
    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', authHeader)
    
    if (!authHeader) {
      console.log('No authorization header found')
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Extract user ID from the authorization header
    const userId = authHeader.replace('Bearer ', '')
    console.log('Extracted user ID:', userId)

    if (!userId) {
      console.log('Invalid user ID')
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    // Prepare profile data for upsert
    const profileData = {
      user_id: userId,
      full_name: body.full_name || null,
      job_title: body.job_title || null,
      company: body.company || null,
      education: {
        school: body.education?.school || null,
        degree: body.education?.degree || null,
        major: body.education?.major || null,
        graduation_year: body.education?.graduation_year || null
      },
      location: body.location || null,
      industry: body.industry || null,
      experience_years: body.experience_years || null,
      skills: body.skills || [],
      interests: body.interests || [],
      background: body.background || null,
      linkedin_url: body.linkedin_url || null,
      website: body.website || null,
      resume_text: body.resume_text || null,
      resume_filename: body.resume_filename || null,
      updated_at: new Date().toISOString()
    }

    console.log('Saving profile data:', JSON.stringify(profileData, null, 2))

    // Upsert the profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Supabase error saving profile:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Failed to save profile',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('Profile saved successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error in profile POST API:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 