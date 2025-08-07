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

    // Get sender profile from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error getting user profile:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Generate the final email
    const emailPrompt = `Write a professional cold email to ${recipientName}${recipientCompany ? ` at ${recipientCompany}` : ''}${recipientRole ? ` (${recipientRole})` : ''}.

SENDER INFORMATION:
- Name: ${profile.full_name || 'Not provided'}
- Company: ${profile.company || 'Not provided'}
- Job Title: ${profile.job_title || 'Not provided'}
- Location: ${profile.location || 'Not provided'}
- LinkedIn: ${profile.linkedin || 'Not provided'}
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
      model: 'gpt-4o-mini',
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
      max_tokens: 1000,
      temperature: 0.7
    })

    const generatedEmail = emailResponse.choices[0]?.message?.content?.trim() || ''

    // Save to database
    const { data: savedEmail, error: saveError } = await supabase
      .from('generated_emails')
      .insert({
        user_id: userId,
        recipient_name: recipientName,
        recipient_company: recipientCompany || null,
        recipient_role: recipientRole || null,
        recipient_linkedin: recipientLinkedIn || null,
        purpose: purpose,
        search_mode: searchMode || 'basic',
        research_findings: researchFindings,
        commonalities: commonalities || null,
        generated_email: generatedEmail
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving email to database:', saveError)
      // Continue even if save fails
    }

    console.log('Final email generated and saved successfully')

    return NextResponse.json({
      success: true,
      email: generatedEmail,
      emailId: savedEmail?.id,
      message: 'Email generated successfully'
    })

  } catch (error) {
    console.error('Final email generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate final email', details: error },
      { status: 500 }
    )
  }
} 