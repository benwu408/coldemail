import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  console.log('=== GPT-4.1 Web Search Test Started ===')
  
  try {
    const body = await request.json()
    const { query } = body

    console.log('Testing query:', query)

    // Test GPT-4.1 with web_search_preview
    console.log('Making GPT-4.1 web_search_preview request...')
    const searchResponse = await openai.responses.create({
      model: "gpt-4.1",
      tools: [{ type: "web_search_preview" }],
      input: `Please search for and provide information about: ${query}`,
    })

    console.log('GPT-4.1 response received:', JSON.stringify(searchResponse, null, 2))
    
    // Return the raw response for analysis
    return NextResponse.json({
      success: true,
      rawResponse: searchResponse,
      responseType: typeof searchResponse,
      responseKeys: Object.keys(searchResponse),
      hasOutputText: 'output_text' in searchResponse,
      hasOutput: 'output' in searchResponse,
      outputTextValue: (searchResponse as any).output_text,
      outputValue: (searchResponse as any).output,
      outputType: typeof (searchResponse as any).output
    })

  } catch (error) {
    console.error('GPT-4.1 web search test error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: JSON.stringify(error, null, 2)
    }, { status: 500 })
  }
} 