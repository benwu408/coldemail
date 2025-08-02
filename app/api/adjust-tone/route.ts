import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { email, subject, tone } = await request.json()

    if (!email || !tone) {
      return NextResponse.json({ error: 'Email content and tone are required' }, { status: 400 })
    }

    const toneInstructions = {
      casual: "Rewrite this email in a casual, friendly tone. Use more conversational language, contractions, and a relaxed approach while maintaining professionalism.",
      formal: "Rewrite this email in a formal, professional tone. Use proper business language, avoid contractions, and maintain a respectful, professional approach.",
      confident: "Rewrite this email in a confident, assertive tone. Use strong, decisive language while maintaining professionalism and respect."
    }

    const prompt = `${toneInstructions[tone as keyof typeof toneInstructions]}

Email:
${email}

Please return the rewritten email in the same format. Keep the greeting and signature, but adjust the tone of the body according to the instructions.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional email editor. Your task is to adjust the tone of emails while maintaining all key points and professional standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const adjustedEmail = completion.choices[0]?.message?.content || email

    return NextResponse.json({
      email: adjustedEmail,
      subject: subject
    })

  } catch (error) {
    console.error('Error adjusting tone:', error)
    return NextResponse.json(
      { error: 'Failed to adjust tone' },
      { status: 500 }
    )
  }
} 