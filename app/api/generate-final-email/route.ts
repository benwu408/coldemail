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
      recipientLinkedIn,
      purpose,
      tone,
      researchFindings,
      commonalities,
      searchMode
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

    if (!purpose) {
      return NextResponse.json(
        { error: 'Purpose is required' },
        { status: 400 }
      )
    }

    if (!researchFindings) {
      return NextResponse.json(
        { error: 'Research findings are required' },
        { status: 400 }
      )
    }

    console.log('=== Final Email Generation Started ===')
    console.log('User ID:', userId)
    console.log('Recipient:', recipientName, recipientCompany, recipientRole)
    console.log('Purpose:', purpose)
    console.log('Tone:', tone)
    console.log('Search Mode:', searchMode)

    // Get user's subscription status to determine which model to use
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: subscriptionProfile, error: subscriptionError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status')
      .eq('user_id', userId)
      .single()
    
    if (subscriptionError) {
      console.error('Error getting user profile:', subscriptionError)
      // If profile doesn't exist, default to free tier
      console.log('Profile not found, defaulting to free tier')
    }

    const isPro = subscriptionProfile?.subscription_plan === 'pro' && subscriptionProfile?.subscription_status === 'active'
    const model = isPro ? 'gpt-4o' : 'o4-mini'
    
    console.log(`Using model: ${model} (Pro: ${isPro})`)

    // Get sender profile from database (using existing supabase client)

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

    console.log('Using sender profile for email generation:', {
      fullName: profile.full_name,
      company: profile.company,
      jobTitle: profile.job_title,
      location: profile.location,
      linkedin: profile.linkedin_url,
      email: profile.email
    })

    // Generate the final email
    const emailPrompt = `Write a professional cold email to ${recipientName}${recipientCompany ? ` at ${recipientCompany}` : ''}${recipientRole ? ` (${recipientRole})` : ''}.

SENDER INFORMATION:
- Name: ${profile.full_name || 'Not provided'}
- Company: ${profile.company || 'Not provided'}
- Job Title: ${profile.job_title || 'Not provided'}
- Location: ${profile.location || 'Not provided'}
- LinkedIn: ${profile.linkedin_url || 'Not provided'}
- Email: ${profile.email || 'Not provided'}

RECIPIENT RESEARCH:
${researchFindings}

COMMONALITIES/CONNECTIONS:
${commonalities || 'No specific commonalities identified'}

EMAIL PURPOSE:
${purpose}

TONE: ${tone || 'Professional and friendly'}

INSTRUCTIONS:
- Write a compelling, personalized cold email
- Use the research findings to show you've done your homework
- Incorporate the commonalities naturally to build rapport
- Keep it concise (150-200 words)
- Include a clear call-to-action
- Use the specified tone
- Make it feel personal and relevant to the recipient
- IMPORTANT: End the email with a proper signature using the sender's ACTUAL name and information from the SENDER INFORMATION above
- Do NOT use placeholder text like [Your Name] or [Your Company]
- Use the real sender information provided above

Format the email with proper greeting, body, and signature using the actual sender details.`

    const emailResponse = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional email writer who creates compelling, personalized cold emails. Always use the actual sender information provided and never use placeholder text like [Your Name] or [Your Company]. Include the sender\'s real name, job title, company, and contact information in the signature.'
        },
        {
          role: 'user',
          content: emailPrompt
        }
      ],
      max_completion_tokens: 1000
      // GPT-5 models only support default temperature (1)
    })

    const generatedEmail = emailResponse.choices[0]?.message?.content?.trim() || 'Unable to generate email'
    
    console.log('Generated email content:', generatedEmail)
    console.log('Email response choices:', emailResponse.choices)

    // Note: Database saving is handled in the main generate-email route

    console.log('Final email generated and saved successfully')

    return NextResponse.json({
      success: true,
      email: generatedEmail,
      message: 'Email generated successfully'
    })

  } catch (error: any) {
    console.error('Final email generation error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to generate final email', details: error?.message || error },
      { status: 500 }
    )
  }
}