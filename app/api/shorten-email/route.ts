import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { email, subject } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email content is required' }, { status: 400 })
    }

    const prompt = `Please shorten this email while keeping all the key points and maintaining its professional tone. Make it more concise but don't lose any important information.

Email:
${email}

Please return the shortened email in the same format. Keep the greeting and signature, but make the body more concise.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional email editor. Your task is to shorten emails while maintaining all key points and professional tone."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 1000,
      temperature: 0.7,
    })

    const shortenedEmail = completion.choices[0]?.message?.content || email

    return NextResponse.json({
      email: shortenedEmail,
      subject: subject
    })

  } catch (error) {
    console.error('Error shortening email:', error)
    return NextResponse.json(
      { error: 'Failed to shorten email' },
      { status: 500 }
    )
  }
} 