import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  console.log('=== Edit Email API Started ===')
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    const {
      originalEmail,
      editRequest,
      recipientName,
      recipientCompany,
      recipientRole,
      recipientLinkedIn,
      purpose,
      tone
    } = body

    if (!originalEmail || !editRequest) {
      return NextResponse.json(
        { error: 'Missing original email or edit request' },
        { status: 400 }
      )
    }

    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null
    
    if (!userId) {
      console.log('No authenticated user found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('Checking user subscription for email editing feature...')

    // Check if user has Pro subscription for email editing
    try {
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_subscription', { user_uuid: userId })
      
      if (subscriptionError) {
        console.error('Error getting user subscription:', subscriptionError)
        return NextResponse.json(
          { error: 'Failed to check subscription status' },
          { status: 500 }
        )
      }

      if (!subscriptionData || subscriptionData.length === 0) {
        console.log('No subscription found, defaulting to free plan')
        return NextResponse.json(
          { 
            error: 'Email editing is a Pro feature',
            errorType: 'SUBSCRIPTION_REQUIRED',
            requiredPlan: 'pro',
            feature: 'Email Editing'
          },
          { status: 403 }
        )
      }

      const userSubscription = subscriptionData[0]
      console.log('User subscription for editing:', userSubscription)

      // Check if user has email editing enabled
      if (!userSubscription.email_editing_enabled) {
        return NextResponse.json(
          { 
            error: 'Email editing is a Pro feature',
            errorType: 'SUBSCRIPTION_REQUIRED',
            requiredPlan: 'pro',
            feature: 'Email Editing',
            currentPlan: userSubscription.plan_name
          },
          { status: 403 }
        )
      }

      console.log('Email editing permission granted for Pro user')

    } catch (error) {
      console.error('Error in subscription check for editing:', error)
      return NextResponse.json(
        { error: 'Failed to validate subscription for editing' },
        { status: 500 }
      )
    }

    console.log('Generating edited email with ChatGPT...')

    const editPrompt = `You are an expert email editor. The user wants to modify an existing networking email based on their feedback.

ORIGINAL EMAIL:
${originalEmail}

REQUESTED CHANGES:
${editRequest}

RECIPIENT CONTEXT:
- Name: ${recipientName}
${recipientCompany ? `- Company: ${recipientCompany}` : ''}
${recipientRole ? `- Role: ${recipientRole}` : ''}
${recipientLinkedIn ? `- LinkedIn: ${recipientLinkedIn}` : ''}
- Purpose: ${purpose}
- Tone: ${tone}

INSTRUCTIONS:
- Take the original email and apply the requested changes
- Maintain the professional networking tone unless specifically asked to change it
- Keep the core structure and purpose of the email
- Make sure the edited version still sounds natural and human-written
- Preserve any personalization and research insights from the original
- Return ONLY the edited email content, no explanations or notes

Generate the improved email based on the user's feedback:`

    const editResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert email editor who helps improve networking emails based on user feedback. Always maintain professionalism while incorporating the requested changes."
        },
        {
          role: "user",
          content: editPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    })

    const editedEmail = editResponse.choices[0]?.message?.content || ''
    
    if (!editedEmail || editedEmail.trim() === '') {
      throw new Error('No edited email content generated')
    }

    console.log('Email edited successfully, length:', editedEmail.length)

    return NextResponse.json({
      editedEmail: editedEmail,
      message: 'Email edited successfully'
    })

  } catch (error) {
    console.error('Error editing email:', error)
    return NextResponse.json(
      { error: 'Failed to edit email' },
      { status: 500 }
    )
  }
} 