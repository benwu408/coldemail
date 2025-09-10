import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to add spacing around bold lines
function addSpacingAroundBoldLines(text: string): string {
  const lines = text.split('\n')
  const processedLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isBoldLine = line.includes('**') || line.startsWith('#') || line.startsWith('##')
    
    if (isBoldLine && i > 0) {
      processedLines.push('')
    }
    
    processedLines.push(line)
    
    if (isBoldLine && i < lines.length - 1) {
      processedLines.push('')
    }
  }
  
  return processedLines.join('\n').replace(/\n\n\n+/g, '\n\n')
}

export async function POST(request: NextRequest) {
  console.log('=== Email Generation API Started ===')
  
  // Validate required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_SUPABASE_URL is not configured' },
      { status: 500 }
    )
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' },
      { status: 500 }
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured' },
      { status: 500 }
    )
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
  const body = await request.json()
  const {
    recipientName,
    recipientCompany,
    recipientRole,
    recipientLinkedIn,
    purpose,
    tone,
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

    console.log('All required fields present, proceeding with email generation...')

    // Get user's subscription status to determine which model to use
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status')
      .eq('user_id', userId)
      .single()
    
    if (profileError) {
      console.error('Error getting user profile:', profileError)
      // If profile doesn't exist, default to free tier
      console.log('Profile not found, defaulting to free tier')
    }

    const isPro = profile?.subscription_plan === 'pro' && profile?.subscription_status === 'active'
    const model = isPro ? 'gpt-4o' : 'o4-mini'
    
    console.log(`Using model: ${model} (Pro: ${isPro})`)

  // Set effective values based on subscription
  let effectiveSearchMode = searchMode
  let effectiveTone = tone

  // Apply subscription restrictions
    if (!isPro) {
    effectiveSearchMode = 'basic'
    effectiveTone = 'professional'
  }

  let researchFindings = ''
  let commonalities = ''

  if (effectiveSearchMode === 'deep') {
      // Deep search mode using ChatGPT with web search
      console.log('Starting comprehensive deep search mode with ChatGPT web search...')
      
      try {
        console.log('Generating comprehensive deep research report with ChatGPT web search...')
        
        // Use ChatGPT with web search for research generation
        const researchPrompt = `Search the web and create a comprehensive professional research report about ${recipientName}${recipientCompany ? ` at ${recipientCompany}` : ''}${recipientRole ? ` (${recipientRole})` : ''}.

REPORT STRUCTURE:
1. **Professional Background**: Current role, company, career history
2. **Education & Credentials**: Academic background, certifications
3. **Recent Achievements**: Accomplishments, awards, recognitions
4. **Industry Involvement**: Speaking engagements, publications, thought leadership
5. **Recent Activities**: News, projects, developments from 2024-2025
6. **Professional Interests**: Areas of expertise, focus areas
7. **Key Insights**: Relevant information for professional outreach

REQUIREMENTS:
- Use web search to find current, accurate information about this person
- Include specific details and facts from your search results
- Focus on information relevant for business networking
- Be comprehensive but concise
- Provide actionable insights for outreach
- Include citations for sources when possible

FORMAT: Create a structured report with clear sections and bullet points.`

        const researchResponse = await openai.responses.create({
          model: 'gpt-4o', // Use GPT-4o for deep search
          input: researchPrompt,
          reasoning: { effort: "high" },
          tools: [{ type: "web_search_preview" }]
        })

        researchFindings = researchResponse.output_text || 'No research findings generated'
        console.log('ChatGPT web search research completed successfully')
      
    } catch (error) {
      console.error('Error in deep search mode:', error)
      // Fallback to basic search if deep search fails
      console.log('Falling back to basic search mode...')
      effectiveSearchMode = 'basic'
    }
    }

    if (effectiveSearchMode === 'basic') {
    // Basic search mode using ChatGPT with web search
    console.log('Using basic search mode with ChatGPT web search...')
    
    try {
      console.log('Generating basic research report with ChatGPT web search...')
      
      // Create basic research report using ChatGPT with web search capabilities
      const reportPrompt = `Search the web and create a BRIEF but informative professional research report about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}.

${recipientLinkedIn ? `PROVIDED LINKEDIN URL: ${recipientLinkedIn}` : ''}

SEARCH AND CREATE REPORT:
- Use web search to find current information about this person
- Focus on their professional background, education, career progression, and current role
- Keep the report concise but informative (basic level research)
- Decide what 3-5 sections would be most relevant based on search results
- Keep each section brief (1-3 sentences) but make them meaningful and specific
- Include citations for sources when possible

Format the report with clear section headers using markdown.`

      const reportResponse = await openai.responses.create({
          model: model,
          input: reportPrompt,
          reasoning: { effort: "medium" },
          tools: [{ type: "web_search_preview" }]
        })

        researchFindings = reportResponse.output_text?.trim() || ''
        console.log('Basic research report generated successfully')

    } catch (error) {
        console.error('Error in basic search mode:', error)
        researchFindings = 'Unable to generate research report at this time.'
      }
    }

    // Generate commonalities
    console.log('Generating commonalities...')
    
    try {
      const commonalitiesPrompt = `Based on the research findings below, identify potential commonalities or connection points between the sender and ${recipientName}${recipientCompany ? ` at ${recipientCompany}` : ''}.

RESEARCH FINDINGS:
${researchFindings}

SENDER INFORMATION:
- Name: [Sender's Name]
- Company: [Sender's Company]
- Role: [Sender's Role]
- Background: [Sender's Background]

INSTRUCTIONS:
Look for potential commonalities such as:
- Shared educational background (same university, degree, etc.)
- Similar career paths or experiences
- Common industry interests or expertise
- Shared professional connections or networks
- Similar company size, stage, or challenges
- Common goals or values
- Shared experiences or achievements

Format as a brief, bulleted list of potential connection points. If no clear commonalities are found, suggest general professional connection points.`

      const commonalitiesResponse = await openai.responses.create({
        model: model,
        input: commonalitiesPrompt,
        reasoning: { effort: "low" },
      })

      commonalities = commonalitiesResponse.output_text || 'No specific commonalities identified'
    console.log('Commonalities generated successfully')
    
    } catch (error) {
      console.error('Error generating commonalities:', error)
      commonalities = 'Unable to generate commonalities at this time.'
    }

    // Generate the final email
    console.log('Generating final email...')
    
    // Get sender profile for email generation
    const { data: senderProfile, error: senderError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (senderError) {
      console.error('Error getting sender profile:', senderError)
    }

    const emailPrompt = `Write a professional cold email to ${recipientName}${recipientCompany ? ` at ${recipientCompany}` : ''}${recipientRole ? ` (${recipientRole})` : ''}.

SENDER INFORMATION:
- Name: ${senderProfile?.full_name || 'Not provided'}
- Company: ${senderProfile?.company || 'Not provided'}
- Job Title: ${senderProfile?.job_title || 'Not provided'}
- Location: ${senderProfile?.location || 'Not provided'}
- LinkedIn: ${senderProfile?.linkedin_url || 'Not provided'}
- Email: ${senderProfile?.email || 'Not provided'}

PURPOSE: ${purpose}
TONE: ${effectiveTone || 'Professional and friendly'}

RESEARCH FINDINGS:
${researchFindings}

COMMONALITIES:
${commonalities}

INSTRUCTIONS:
- Write a compelling, personalized cold email
- Use the research findings to show you've done your homework
- Incorporate the commonalities naturally to build rapport
- Use ONLY the actual sender information provided above - never use placeholder text like [Your Name], [Your Company], [YourLinkedIn], etc.
- If LinkedIn is not provided, simply omit it from the signature
- Keep it concise (150-200 words)
- Include a clear call-to-action
- Use the specified tone
- Make it feel personal and relevant to the recipient
- End with a professional signature using ONLY the real information provided

Format the email with proper greeting, body, and signature.`

    const emailResponse = await openai.responses.create({
      model: model,
      input: emailPrompt,
      reasoning: { effort: "medium" },
    })

    const generatedEmail = emailResponse.output_text || 'Unable to generate email'
    const formattedEmail = addSpacingAroundBoldLines(generatedEmail)

    console.log('Email generation completed successfully')

    // Save email to database
    try {
      const { error: saveError } = await supabase
        .from('generated_emails')
        .insert({
          user_id: userId,
          recipient_name: recipientName,
          recipient_company: recipientCompany || null,
          recipient_role: recipientRole || null,
          recipient_email: null, // We don't collect this in the form
          purpose: purpose,
          search_mode: effectiveSearchMode || 'basic',
          research_findings: researchFindings,
          commonalities: commonalities,
          generated_email: formattedEmail,
          created_at: new Date().toISOString()
        })

        if (saveError) {
        console.error('Error saving email to database:', JSON.stringify(saveError, null, 2))
      } else {
        console.log('Email saved to database successfully')
      }
    } catch (dbError) {
      console.error('Error saving email to database:', JSON.stringify(dbError, null, 2))
    }

    return NextResponse.json({
      success: true,
      email: formattedEmail,
      researchFindings,
      commonalities,
      searchMode: effectiveSearchMode,
      model: model,
      message: 'Email generated successfully'
    })

  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate email', details: error },
      { status: 500 }
    )
  }
}