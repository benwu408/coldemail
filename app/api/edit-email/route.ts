import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { originalEmail, editRequest, recipientName, recipientCompany, recipientRole, purpose, tone } = await request.json()

    if (!originalEmail || !editRequest) {
      return NextResponse.json(
        { error: 'Original email and edit request are required' },
        { status: 400 }
      )
    }

    console.log('Editing email for:', recipientName)
    console.log('Edit request:', editRequest)

    const prompt = `You are an expert email editor. I have an original cold email and I want you to revise it based on the user's specific request.

ORIGINAL EMAIL:
${originalEmail}

USER'S EDIT REQUEST:
${editRequest}

RECIPIENT CONTEXT:
- Name: ${recipientName}
- Company: ${recipientCompany}
- Role: ${recipientRole}
- Purpose: ${purpose}
- Tone: ${tone}

Please revise the email based on the user's request. Maintain the same professional quality and structure, but incorporate the requested changes. The email should still be:
- Professional and well-written
- Personalized to the recipient
- Clear and concise
- Appropriate for the stated purpose and tone

Return ONLY the revised email content, without any additional commentary or explanations.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "You are an expert email editor who can revise cold emails based on specific user requests while maintaining professional quality and personalization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const revisedEmail = completion.choices[0]?.message?.content?.trim()

    if (!revisedEmail) {
      throw new Error('Failed to generate revised email')
    }

    console.log('Email revised successfully')

    return NextResponse.json({
      success: true,
      email: revisedEmail,
      message: 'Email revised successfully'
    })

  } catch (error) {
    console.error('Error editing email:', error)
    return NextResponse.json(
      { error: 'Failed to edit email' },
      { status: 500 }
    )
  }
} 