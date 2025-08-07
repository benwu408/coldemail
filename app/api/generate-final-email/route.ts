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
    console.log('Recipient:', recipientName, recipientCompany, recipientRole)
    console.log('Purpose:', purpose)
    console.log('Tone:', tone)
    console.log('Search Mode:', searchMode)

    // Get sender profile from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
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

Format the email with proper greeting, body, and signature.`

    const emailResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional email writer who creates compelling, personalized cold emails.'
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
        user_id: user.id,
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