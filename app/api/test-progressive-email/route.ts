import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  console.log('=== Progressive Email Generation Test Started ===')
  
  const results = {
    environment: { success: false, details: {} },
    authentication: { success: false, details: {} },
    profile: { success: false, details: {} },
    research: { success: false, details: {} },
    commonalities: { success: false, details: {} },
    emailGeneration: { success: false, details: {} },
    usageTracking: { success: false, details: {} },
    databaseSave: { success: false, details: {} },
    cleanup: { success: false, details: {} }
  }

  try {
    const body = await request.json()
    const {
      recipientName = 'John Doe',
      recipientCompany = 'Test Company',
      recipientRole = 'Test Role',
      recipientLinkedIn = 'https://linkedin.com/in/johndoe',
      purpose = 'Test email generation',
      tone = 'professional',
      testMode = 'full' // 'full', 'research-only', 'commonalities-only', 'email-only'
    } = body

    // Test 1: Environment Variables
    console.log('Testing environment variables...')
    results.environment = {
      success: true,
      details: {
        openaiKey: !!process.env.OPENAI_API_KEY,
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        searchApiKey: !!process.env.SEARCHAPI_KEY
      }
    }

    if (!process.env.OPENAI_API_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      results.environment.success = false
      return NextResponse.json(results)
    }

    // Test 2: Authentication
    console.log('Testing authentication...')
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      results.authentication = {
        success: false,
        details: { error: 'No valid authorization header found' }
      }
      return NextResponse.json(results)
    }
    
    const userId = authHeader.replace('Bearer ', '')
    results.authentication = {
      success: true,
      details: { userId, authHeader: authHeader.substring(0, 20) + '...' }
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Test 3: User Profile
    console.log('Testing user profile retrieval...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      results.profile = {
        success: false,
        details: { error: profileError, userId }
      }
      return NextResponse.json(results)
    }

    results.profile = {
      success: true,
      details: {
        userId,
        fullName: profile.full_name,
        company: profile.company,
        jobTitle: profile.job_title,
        email: profile.email
      }
    }

    // Test 4: Research Generation (if not email-only)
    if (testMode !== 'email-only') {
      console.log('Testing research generation...')
      try {
        // Simulate research findings
        const researchFindings = `## **Professional Background**
John Doe is a Senior Marketing Manager at Test Company with over 8 years of experience in digital marketing and brand strategy.

## **Education & Credentials**
Bachelor's degree in Marketing from University of California, Berkeley.

## **Career Experience**
- Senior Marketing Manager at Test Company (2020-Present)
- Marketing Specialist at Previous Corp (2018-2020)
- Marketing Intern at Startup Inc (2016-2018)

## **Achievements & Recognition**
- Led successful rebranding campaign that increased brand awareness by 40%
- Received "Marketing Excellence Award" in 2022

## **Recent Activities**
Currently leading digital transformation initiatives and expanding market presence in the tech sector.

## **Professional Interests**
Specializes in digital marketing, brand strategy, and customer acquisition.

## **Online Presence**
Active on LinkedIn with 500+ connections and regular industry content sharing.`

        results.research = {
          success: true,
          details: { researchFindings: researchFindings.substring(0, 100) + '...' }
        }
      } catch (error) {
        results.research = {
          success: false,
          details: { error: error }
        }
        return NextResponse.json(results)
      }
    }

    // Test 5: Commonalities Generation (if not email-only)
    if (testMode !== 'email-only') {
      console.log('Testing commonalities generation...')
      try {
        const commonalities = `## **Professional Connections**

1. **Industry Experience**: Both work in the marketing and business development space, with shared understanding of customer acquisition strategies and brand building.

2. **Educational Background**: Similar academic focus on business and marketing principles, providing common ground for professional discussions.

3. **Career Growth**: Both have progressed through similar career paths, from entry-level positions to senior management roles.

4. **Digital Marketing Expertise**: Shared experience in digital marketing tools and strategies, creating opportunities for knowledge exchange.

5. **Professional Network**: Both are active in the marketing community and likely have overlapping professional connections.`

        results.commonalities = {
          success: true,
          details: { commonalities: commonalities.substring(0, 100) + '...' }
        }
      } catch (error) {
        results.commonalities = {
          success: false,
          details: { error: error }
        }
        return NextResponse.json(results)
      }
    }

    // Test 6: Email Generation
    console.log('Testing email generation...')
    try {
      const researchFindings = results.research?.success ? (results.research.details as any).researchFindings : 'Test research findings'
      const commonalities = results.commonalities?.success ? (results.commonalities.details as any).commonalities : 'Test commonalities'

      const emailPrompt = `Write a professional cold email to ${recipientName}${recipientCompany ? ` at ${recipientCompany}` : ''}${recipientRole ? ` (${recipientRole})` : ''}.

SENDER INFORMATION:
- Name: ${profile.full_name || 'Test User'}
- Company: ${profile.company || 'Test Company'}
- Job Title: ${profile.job_title || 'Test Role'}
- Location: ${profile.location || 'Test Location'}
- LinkedIn: ${profile.linkedin || 'https://linkedin.com/in/testuser'}
- Email: ${profile.email || 'test@example.com'}

RECIPIENT RESEARCH:
${researchFindings}

COMMONALITIES/CONNECTIONS:
${commonalities}

EMAIL PURPOSE:
${purpose}

TONE: ${tone}

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

      results.emailGeneration = {
        success: true,
        details: { 
          email: generatedEmail.substring(0, 200) + '...',
          fullEmail: generatedEmail
        }
      }
    } catch (error) {
      results.emailGeneration = {
        success: false,
        details: { error: error }
      }
      return NextResponse.json(results)
    }

    // Test 7: Usage Tracking
    console.log('Testing usage tracking...')
    try {
      const { error: usageError } = await supabase
        .rpc('increment_user_usage', { user_uuid: userId })
      
      if (usageError) {
        results.usageTracking = {
          success: false,
          details: { error: usageError }
        }
      } else {
        results.usageTracking = {
          success: true,
          details: { message: 'Usage incremented successfully' }
        }
      }
    } catch (error) {
      results.usageTracking = {
        success: false,
        details: { error: error }
      }
    }

    // Test 8: Database Save
    console.log('Testing database save...')
    try {
      const testEmailData = {
        user_id: userId,
        recipient_name: recipientName,
        recipient_company: recipientCompany,
        recipient_role: recipientRole,
        recipient_linkedin: recipientLinkedIn,
        purpose: purpose,
        search_mode: 'deep',
        research_findings: results.research?.success ? (results.research.details as any).researchFindings : 'Test research',
        commonalities: results.commonalities?.success ? (results.commonalities.details as any).commonalities : 'Test commonalities',
        generated_email: results.emailGeneration.success ? results.emailGeneration.details.fullEmail : 'Test email content'
      }

      console.log('Attempting to save email data:', {
        user_id: testEmailData.user_id,
        recipient_name: testEmailData.recipient_name,
        search_mode: testEmailData.search_mode,
        email_length: testEmailData.generated_email.length
      })

      const { data: savedEmail, error: saveError } = await supabase
        .from('generated_emails')
        .insert(testEmailData)
        .select()
        .single()

      if (saveError) {
        console.error('Database save error:', saveError)
        results.databaseSave = {
          success: false,
          details: { 
            error: saveError,
            attemptedData: testEmailData
          }
        }
      } else {
        console.log('Email saved successfully:', savedEmail)
        results.databaseSave = {
          success: true,
          details: { 
            savedEmailId: savedEmail.id,
            savedData: {
              user_id: savedEmail.user_id,
              recipient_name: savedEmail.recipient_name,
              search_mode: savedEmail.search_mode,
              created_at: savedEmail.created_at
            }
          }
        }

        // Test 9: Cleanup (delete test record)
        console.log('Testing cleanup...')
        try {
          const { error: deleteError } = await supabase
            .from('generated_emails')
            .delete()
            .eq('id', savedEmail.id)

          if (deleteError) {
            results.cleanup = {
              success: false,
              details: { error: deleteError }
            }
          } else {
            results.cleanup = {
              success: true,
              details: { message: 'Test record deleted successfully' }
            }
          }
        } catch (cleanupError) {
          results.cleanup = {
            success: false,
            details: { error: cleanupError }
          }
        }
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError)
      results.databaseSave = {
        success: false,
        details: { error: dbError }
      }
    }

    console.log('=== Progressive Email Generation Test Completed ===')
    return NextResponse.json(results)

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error,
      partialResults: results
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return await POST(request)
} 