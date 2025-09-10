import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      recipientName,
      recipientCompany,
      recipientRole,
      researchFindings,
      senderProfile
    } = body

    // Get user ID from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    const userId = authHeader.replace('Bearer ', '')

    // Validate required fields
    if (!recipientName) {
      return NextResponse.json(
        { error: 'Recipient name is required' },
        { status: 400 }
      )
    }

    if (!researchFindings) {
      return NextResponse.json(
        { error: 'Research findings are required' },
        { status: 400 }
      )
    }

    console.log('=== Commonalities Generation Started ===')
    console.log('User ID:', userId)
    console.log('Recipient:', recipientName, recipientCompany, recipientRole)

    // Get sender profile from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let senderInfo = senderProfile
    if (!senderInfo) {
      // Get sender profile from database using user ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError || !profile) {
        console.error('Error getting user profile:', profileError)
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        )
      }

      senderInfo = profile
    }

    // Parse JSON fields
    let educationData = null
    let jobExperiencesData = null
    
    try {
      educationData = senderInfo.education ? JSON.parse(senderInfo.education) : null
    } catch (e) {
      console.log('Could not parse education data:', e)
    }
    
    try {
      jobExperiencesData = senderInfo.job_experiences ? JSON.parse(senderInfo.job_experiences) : null
    } catch (e) {
      console.log('Could not parse job experiences data:', e)
    }

    console.log('Using sender profile for commonalities:', {
      fullName: senderInfo.full_name,
      company: senderInfo.company,
      jobTitle: senderInfo.job_title,
      location: senderInfo.location,
      education: educationData,
      jobExperiences: jobExperiencesData
    })

    // Generate commonalities based on research findings and sender profile
    const commonalitiesPrompt = `Based on the research findings about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''} and the sender's profile, identify meaningful connections and commonalities that could be used in a cold email.

RECIPIENT RESEARCH:
${researchFindings}

SENDER PROFILE:
- Full Name: ${senderInfo.full_name || 'Not provided'}
- Company: ${senderInfo.company || 'Not provided'}
- Job Title: ${senderInfo.job_title || 'Not provided'}
- Location: ${senderInfo.location || 'Not provided'}
- Education: ${educationData ? `${educationData.school || 'Not specified'}${educationData.major ? `, ${educationData.major}` : ''}${educationData.graduation_year ? ` (${educationData.graduation_year})` : ''}` : 'Not provided'}
- Job Experiences: ${jobExperiencesData && jobExperiencesData.length > 0 ? jobExperiencesData.map((job: any) => `${job.title} at ${job.company}`).join(', ') : 'Not provided'}

INSTRUCTIONS:
Identify 3-5 meaningful connections or commonalities between the sender and recipient. Look for:
- Shared educational background (same university, similar field of study)
- Similar professional experience or career paths
- Common industry or sector experience
- Geographic connections (same city, region, or country)
- Shared professional interests or expertise areas
- Mutual connections or networks
- Similar career milestones or achievements
- Common professional challenges or goals

Format as a clear, professional list with brief explanations for each connection. Focus on genuine, relevant connections that would make the email more personal and compelling.`

    const commonalitiesResponse = await openai.responses.create({
      model: 'o4-mini',
      input: commonalitiesPrompt,
      reasoning: { effort: "low" }
    })

    const commonalities = commonalitiesResponse.output_text?.trim() || ''

    console.log('Commonalities generated successfully')

    return NextResponse.json({
      success: true,
      commonalities,
      message: 'Commonalities generated successfully'
    })

  } catch (error) {
    console.error('Commonalities generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate commonalities', details: error },
      { status: 500 }
    )
  }
} 