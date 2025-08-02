import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getJson } from 'serpapi'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Research function
async function researchRecipient(name: string, role?: string, company?: string) {
  if (!process.env.SEARCHAPI_KEY || process.env.SEARCHAPI_KEY === 'your_actual_searchapi_key_here') {
    console.log('SearchAPI key not configured or invalid')
    return null
  }

  try {
    const searchQueries = [
      `${name} ${company || ''} ${role || ''}`,
      `${name} LinkedIn`,
      `${name} education background`,
      `${name} recent projects deals`,
      `${name} awards achievements`
    ]

    let allFindings: string[] = []

    // Search for each query using SearchAPI
    for (const query of searchQueries) {
      try {
        console.log(`Searching for: "${query}"`)
        
        const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&num=3`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.SEARCHAPI_KEY}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`SearchAPI request failed: ${response.status}`)
        }

        const results = await response.json()

        if (results.organic_results && results.organic_results.length > 0) {
          results.organic_results.forEach((result: any) => {
            if (result.snippet) {
              allFindings.push(result.snippet)
            }
          })
        } else {
          console.log(`No results found for query: "${query}"`)
        }
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error)
        // Continue with other queries even if one fails
      }
    }

    console.log(`Total findings collected: ${allFindings.length}`)
    return allFindings.slice(0, 10) // Return top 10 findings
  } catch (error) {
    console.error('Error researching recipient:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientName, recipientRole, outreachPurpose, context, additionalNotes, tone } = body

    // Validate required fields
    if (!recipientName || !outreachPurpose) {
      return NextResponse.json(
        { error: 'Recipient name and outreach purpose are required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Get user profile data for personalization
    let userProfile = null
    try {
      // Get user profile using user ID from the request
      const userId = body.userId // We'll pass this from the frontend
      if (userId) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (profile) {
          userProfile = profile
        }
      }
    } catch (error) {
      console.log('Could not fetch user profile:', error)
      // Continue without profile data
    }

    // Always research recipient
    let researchFindings: string[] = []
    let researchSummary = ''
    let researchError = ''
    
    const findings = await researchRecipient(recipientName, recipientRole)
    if (findings && findings.length > 0) {
      researchFindings = findings
      researchSummary = `Research Findings: ${findings.join(' | ')}`
    } else {
      researchError = 'Research was attempted but no findings were found. This could be due to an invalid SearchAPI key or limited public information about the recipient.'
    }

    // Create a comprehensive prompt for GPT-4o-mini
    let prompt = `Generate a ${tone} cold email with the following details:
    
Recipient: ${recipientName}
Role/Company: ${recipientRole || 'Not specified'}
Purpose: ${outreachPurpose}
Context/Hook: ${context || 'None provided'}
Additional Notes: ${additionalNotes || 'None provided'}`

    if (researchSummary) {
      prompt += `\n\nWeb Research: ${researchSummary}`
    }

    if (userProfile) {
      prompt += `\n\nUser Profile Information:
- Name: ${userProfile.full_name || 'Not specified'}
- Job Title: ${userProfile.job_title || 'Not specified'}
- Company: ${userProfile.company || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- Education: ${userProfile.education?.school || 'Not specified'} - ${userProfile.education?.major || 'Not specified'} (${userProfile.education?.graduation_year || 'Not specified'})
- Industry: ${userProfile.industry || 'Not specified'}
- Experience: ${userProfile.experience_years || 'Not specified'} years
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Background: ${userProfile.background || 'Not specified'}`

      prompt += `\n\nIMPORTANT: Analyze the research findings and user profile to identify commonalities such as:
- Same school/university
- Same industry or company
- Similar skills or expertise
- Shared interests or hobbies
- Same location or region
- Similar career paths or experiences
- Any other relevant connections

Use these commonalities to create a more personalized and authentic email that shows genuine interest and shared background.`
    }

    if (researchError) {
      prompt += `\n\nNote: ${researchError} Please generate a personalized email based on the provided information without relying on web research.`
    }

    prompt += `

Requirements:
- Make it personalized and authentic
- Use the ${tone} tone appropriately
- Keep it concise (2-3 paragraphs max)
- Include a clear call-to-action
- Make it sound human-written, not robotic
- If context mentions UIUC, LinkedIn, or work, incorporate it naturally
- If research findings are provided, subtly incorporate relevant details to show you've done your homework
- If user profile is available, find and mention specific commonalities to create genuine connections
- End with a professional signature "${userProfile?.full_name || '[Your Name]'}"`

    // If no user profile is available, add a note about the signature
    if (!userProfile) {
      prompt += `\n\nNote: Since no user profile was found, use "[Your Name]" as the signature. The user should update this with their actual name.`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing personalized cold emails that get responses. Your primary goal is to find genuine connections and commonalities between the sender and recipient. Always analyze both the recipient's research findings and the sender's profile to identify shared backgrounds, interests, experiences, or connections. Use these commonalities to create authentic, personalized emails that show genuine interest and shared understanding. Write emails that are specific, value-focused, and demonstrate that you've done your research. Always maintain the requested tone and make the email sound natural and human-written. When research findings are provided, incorporate them subtly and naturally to show genuine interest and preparation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
    })

    const generatedEmail = completion.choices[0].message.content

    if (!generatedEmail) {
      return NextResponse.json(
        { error: 'Failed to generate email content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      email: generatedEmail,
      tone,
      researchFindings: researchFindings,
      researchError: researchError,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating email:', error)
    
    // If OpenAI fails, fall back to mock generation
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate email. Please try again.' },
      { status: 500 }
    )
  }
} 