import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientName, recipientRole, company } = body

    if (!recipientName) {
      return NextResponse.json(
        { error: 'Recipient name is required' },
        { status: 400 }
      )
    }

    // Use ChatGPT with web search for research
    const researchPrompt = `Research ${recipientName}${company ? ` at ${company}` : ''}${recipientRole ? ` (${recipientRole})` : ''} using web search and provide a professional report.

SEARCH FOR AND REPORT:
- Professional background and current role
- Education and credentials
- Recent achievements or activities
- Industry involvement
- Key insights relevant for outreach

INSTRUCTIONS:
- Use web search to find current information
- Provide specific details and facts
- Be concise but informative
- Focus on information useful for business networking

FORMAT: Create a structured report with clear sections.`

    const researchResponse = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: [{ 
        role: 'user', 
        content: researchPrompt 
      }],
      max_completion_tokens: 800
      // GPT-4o models only support default temperature (1)
    })

    const findings = researchResponse.choices[0].message.content || 'No research findings generated'

    return NextResponse.json({
      findings: findings,
      success: true
    })

  } catch (error) {
    console.error('Research recipient error:', error)
    return NextResponse.json(
      { error: 'Failed to research recipient', details: error },
      { status: 500 }
    )
  }
}