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

    console.log('=== Research Generation Started ===')
    console.log('User ID:', userId)
    console.log('Recipient:', recipientName, recipientCompany, recipientRole)
    console.log('Search Mode:', searchMode)

    // Get user's subscription status to determine which model to use
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error getting user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      )
    }

    const isPro = profile?.subscription_plan === 'pro' && profile?.subscription_status === 'active'
    const model = isPro ? 'gpt-5' : 'gpt-5-mini'
    
    console.log(`Using model: ${model} (Pro: ${isPro})`)

    let researchFindings = ''

    // Use ChatGPT with web search for research generation
    console.log('Starting ChatGPT web search research generation...')
    
    try {
      // Create a comprehensive research prompt for ChatGPT with web search
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
        model: model,
        input: researchPrompt,
        reasoning: { effort: isPro ? "high" : "medium" },
        text: { verbosity: isPro ? "high" : "medium" },
        tools: [{ type: "web_search" }]
      })

      researchFindings = researchResponse.output_text || 'No research findings generated'
      console.log('ChatGPT web search research completed successfully')
      
        } catch (searchError) {
      console.error('Error in ChatGPT web search research:', searchError)
      throw searchError
    }

    return NextResponse.json({
      success: true,
      researchFindings,
      searchMode: searchMode || 'basic',
      model: model,
      message: 'Research report generated successfully'
    })

  } catch (error) {
    console.error('Research generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate research report', details: error },
      { status: 500 }
    )
  }
} 