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

    // Fetch the user profile from the database (match by user_id)
    const { data: profile, error } = await supabase
      .from('profiles')
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

    // Check if user is Pro (for restricting profile fields)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error checking subscription:', profileError)
      return NextResponse.json({ error: 'Failed to check subscription status' }, { status: 500 })
    }

    let isPro = profile?.subscription_plan === 'pro' && profile?.subscription_status === 'active'
    console.log('User is Pro:', isPro, 'Plan:', profile?.subscription_plan, 'Status:', profile?.subscription_status)

    // Prepare profile data for upsert - restrict fields for non-Pro users
    let payload: Record<string, any> = {
      user_id: userId,
      full_name: body.full_name || null, // Always allow name
      // Only allow these fields for Pro users
      job_title: isPro ? (body.job_title || null) : null,
      company: isPro ? (body.company || null) : null,
      education: isPro ? {
        school: body.education?.school || null,
        degree: body.education?.degree || null,
        major: body.education?.major || null,
        graduation_year: body.education?.graduation_year || null
      } : {
        school: null,
        degree: null,
        major: null,
        graduation_year: null
      },
      location: isPro ? (body.location || null) : null,
      industry: isPro ? (body.industry || null) : null,
      skills: isPro ? (body.skills || []) : [],
      interests: isPro ? (body.interests || []) : [],
      background: isPro ? (body.background || null) : null,
      linkedin_url: isPro ? (body.linkedin_url || null) : null,
      website: isPro ? (body.website || null) : null,
      updated_at: new Date().toISOString()
    }

    // Remove undefined keys to avoid noisy payload
    payload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined))

    console.log('Saving profile data:', JSON.stringify(payload, null, 2))

    // Upsert the profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, {
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