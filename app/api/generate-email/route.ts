import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  // Initialize Supabase client inside the function
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    const {
      recipientName,
      recipientCompany,
      recipientRole,
      purpose,
      tone,
      userProfile,
      searchMode = 'basic' // 'basic' or 'deep'
    } = body

    if (!recipientName || !recipientCompany || !recipientRole || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let researchFindings = ''
    let commonalities = ''

    if (searchMode === 'deep') {
      // Deep search mode using GPT-4.1 with web_search_preview
      console.log('Starting deep search mode with GPT-4.1...')
      
      // Generate comprehensive search query
      const searchQuery = `${recipientName} ${recipientCompany} ${recipientRole} professional background education experience achievements recent news articles LinkedIn profile`
      
      try {
        // Try using the responses API format for web_search_preview
        console.log('Attempting web_search_preview with GPT-4.1...')
        const searchResponse = await openai.responses.create({
          model: "gpt-4.1",
          tools: [{ type: "web_search_preview" }],
          input: `Please search for and provide a comprehensive report on: ${searchQuery}`,
        })

        console.log('Web search preview response received:', searchResponse)
        const searchResults = searchResponse.output_text || ''
        
        // Now use the search results to generate a comprehensive report
        const reportResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a professional research analyst. Based on the search results provided, create a comprehensive report about the person. Structure it clearly and include all relevant professional information.`
            },
            {
              role: "user",
              content: `Based on these search results about ${recipientName} at ${recipientCompany}:
              
              ${searchResults}
              
              Please create a detailed professional report covering:
              1. Professional Background
              2. Education & Credentials  
              3. Recent Achievements & News
              4. Professional Interests & Focus Areas
              5. Company Role & Responsibilities
              6. Public Presence & Thought Leadership
              
              Format as a clear, structured report.`
            }
          ]
        })

        researchFindings = reportResponse.choices[0]?.message?.content || ''

      } catch (error) {
        console.log('Web search preview error:', error)
        console.log('Error details:', JSON.stringify(error, null, 2))
        console.log('Falling back to enhanced analysis...')
        
        // Fallback to enhanced GPT-4o analysis
        const searchResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a professional research analyst with access to current information. Analyze and provide comprehensive information about the person mentioned. Focus on:
              1. Professional background and career highlights
              2. Education and credentials
              3. Recent achievements or news
              4. Professional interests and focus areas
              5. Company role and responsibilities
              6. Any public speaking, publications, or thought leadership
              7. Social media presence and professional activities
              
              Format your response as a structured report with clear sections.`
            },
            {
              role: "user",
              content: `Please provide a comprehensive analysis and report on: ${searchQuery}`
            }
          ]
        })

        const searchResults = searchResponse.choices[0]?.message?.content || ''
        
        // Generate detailed report from analysis
        const reportResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a professional research analyst. Based on the analysis provided, create a comprehensive report about the person. Structure it clearly and include all relevant professional information.`
            },
            {
              role: "user",
              content: `Based on this analysis about ${recipientName} at ${recipientCompany}:
              
              ${searchResults}
              
              Please create a detailed professional report covering:
              1. Professional Background
              2. Education & Credentials  
              3. Recent Achievements & News
              4. Professional Interests & Focus Areas
              5. Company Role & Responsibilities
              6. Public Presence & Thought Leadership
              
              Format as a clear, structured report.`
            }
          ]
        })

        researchFindings = reportResponse.choices[0]?.message?.content || ''
      }

      // Find commonalities between user profile and recipient
      if (userProfile) {
        const commonalitiesResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a networking expert. Analyze the user's profile and the recipient's information to find meaningful commonalities that could create genuine connections. Focus on:
              1. Shared educational background
              2. Similar professional interests
              3. Common industry experience
              4. Geographic connections
              5. Shared skills or expertise areas
              6. Similar career paths or goals
              7. Resume-based connections (if resume is available)
              
              Format as a clear list of specific commonalities.`
            },
            {
              role: "user",
              content: `User Profile:
              ${JSON.stringify(userProfile, null, 2)}
              
              Recipient Information:
              ${researchFindings}
              
              Please identify specific commonalities between the user and recipient that could be mentioned in a networking email.`
            }
          ]
        })

        commonalities = commonalitiesResponse.choices[0]?.message?.content || ''
      }

    } else {
      // Basic search mode (existing web search functionality)
      console.log('Using basic search mode...')
      
      const searchQuery = `${recipientName} ${recipientCompany} ${recipientRole}`
      console.log('Search query:', searchQuery)
      
      try {
        if (!process.env.SEARCHAPI_KEY) {
          console.log('SEARCHAPI_KEY not found, skipping web search')
          researchFindings = `Basic information for ${recipientName} at ${recipientCompany} as ${recipientRole}`
        } else {
          console.log('Making SearchAPI request...')
          
          const searchResponse = await fetch('https://www.searchapi.io/api/v1/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SEARCHAPI_KEY}`,
            },
            body: JSON.stringify({
              q: searchQuery,
              num: 5,
            }),
          })

          console.log('SearchAPI response status:', searchResponse.status)

          if (!searchResponse.ok) {
            const errorText = await searchResponse.text()
            console.log('SearchAPI error response:', errorText)
            throw new Error(`Search API request failed: ${searchResponse.status} - ${errorText}`)
          }

          const searchData = await searchResponse.json()
          console.log('SearchAPI response data keys:', Object.keys(searchData))
          
          if (searchData.organic_results && searchData.organic_results.length > 0) {
            const results = searchData.organic_results
              .slice(0, 3)
              .map((result: any) => `${result.title}\n${result.snippet}`)
              .join('\n\n')
            
            researchFindings = `Research findings for ${recipientName}:\n\n${results}`
            console.log('Research findings generated successfully')
          } else {
            researchFindings = `Basic information for ${recipientName} at ${recipientCompany} as ${recipientRole}`
            console.log('No search results found, using basic info')
          }
        }
      } catch (searchError) {
        console.error('SearchAPI error:', searchError)
        researchFindings = `Basic information for ${recipientName} at ${recipientCompany} as ${recipientRole}`
        console.log('Using fallback research findings due to search error')
      }

      // Find commonalities (existing logic)
      if (userProfile) {
        console.log('Generating commonalities with user profile...')
        const commonalitiesResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a networking expert. Find meaningful commonalities between the user's profile and the recipient's information that could create genuine connections."
            },
            {
              role: "user",
              content: `User Profile: ${JSON.stringify(userProfile)}\n\nRecipient Info: ${recipientName} at ${recipientCompany} as ${recipientRole}\n\nResearch: ${researchFindings}\n\nFind specific commonalities that could be mentioned in a networking email.`
            }
          ]
        })

        commonalities = commonalitiesResponse.choices[0]?.message?.content || ''
        console.log('Commonalities generated successfully')
      }
    }

    // Generate the email using the research findings and commonalities
    let prompt = `Generate a personalized outreach email for networking purposes.

Recipient Information:
- Name: ${recipientName}
- Company: ${recipientCompany}
- Role: ${recipientRole}
- Purpose: ${purpose}

${researchFindings ? `Research Findings:\n${researchFindings}\n` : ''}
${commonalities ? `Commonalities Found:\n${commonalities}\n` : ''}

${userProfile?.resume_text ? `User Resume Context:\n${userProfile.resume_text}\n` : ''}

Requirements:
- Make it personalized and authentic
- Use the ${tone} tone appropriately
- Keep it concise (2-3 paragraphs max)
- Include a clear call-to-action
- Make it sound human-written, not robotic
- If context mentions UIUC, LinkedIn, or work, incorporate it naturally
- If research findings are provided, subtly incorporate relevant details to show you've done your homework
- If user profile is available, find and mention specific commonalities to create genuine connections
- If resume text is available, use it to find additional connections and make the email more specific to the user's background
- End with a professional signature "${userProfile?.full_name || '[Your Name]'}"`

    // If no user profile is available, add a note about the signature
    if (!userProfile) {
      prompt += `\n\nNote: Since no user profile was found, use "[Your Name]" as the signature. The user should update this with their actual name.`
    }

    console.log('Generating email with prompt length:', prompt.length)
    
    try {
      const emailResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at writing personalized, professional networking emails that sound authentic and human-written."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      const generatedEmail = emailResponse.choices[0]?.message?.content || ''
      console.log('Email generated successfully, length:', generatedEmail.length)

      // Save the generated email to the database (optional - only if user is authenticated)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          console.log('Saving email to database for user:', user.id)
          await supabase
            .from('generated_emails')
            .insert({
              user_id: user.id,
              recipient_name: recipientName,
              recipient_company: recipientCompany,
              recipient_role: recipientRole,
              purpose: purpose,
              tone: tone,
              email_content: generatedEmail,
              research_findings: researchFindings,
              commonalities: commonalities,
              search_mode: searchMode
            })
          console.log('Email saved to database successfully')
        } else {
          console.log('No authenticated user found, skipping database save')
        }
      } catch (dbError) {
        console.log('Database save failed (continuing anyway):', dbError)
        // Continue even if database save fails
      }

      return NextResponse.json({
        email: generatedEmail,
        researchFindings,
        commonalities
      })

    } catch (emailError) {
      console.error('Error generating email:', emailError)
      console.error('Error details:', JSON.stringify(emailError, null, 2))
      return NextResponse.json(
        { error: 'Failed to generate email. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error generating email:', error)
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    )
  }
} 