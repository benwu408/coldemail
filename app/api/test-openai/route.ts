import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    console.log('Testing OpenAI API with message:', message)

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: message || "Hello, this is a test message"
        }
      ],
      max_tokens: 100
    })

    const result = response.choices[0]?.message?.content || 'No response'

    console.log('OpenAI API test successful:', result)

    return NextResponse.json({
      success: true,
      response: result,
      model: response.model,
      usage: response.usage
    })

  } catch (error) {
    console.error('OpenAI API test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 