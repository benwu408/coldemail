import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to add spacing around bold lines
function addSpacingAroundBoldLines(text: string): string {
  // Split into lines and process each line
  const lines = text.split('\n')
  const processedLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isBoldLine = line.includes('**') || line.startsWith('#') || line.startsWith('##')
    
    // Always add empty line before bold lines (except at the very start)
    if (isBoldLine && i > 0) {
      processedLines.push('')
    }
    
    // Add the current line
    processedLines.push(line)
    
    // Always add empty line after bold lines (except at the very end)
    if (isBoldLine && i < lines.length - 1) {
      processedLines.push('')
    }
  }
  
  // Join and clean up any triple line breaks, but preserve double line breaks
  return processedLines.join('\n').replace(/\n\n\n+/g, '\n\n')
}

export async function POST(request: NextRequest) {
  console.log('=== Email Generation API Started ===')
  
  try {
    // Check environment variables
    console.log('Checking environment variables...')
    console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('SEARCHAPI_KEY exists:', !!process.env.SEARCHAPI_KEY)
    
    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    
    // Initialize Supabase client inside the function
    console.log('Initializing Supabase client...')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    console.log('Supabase client initialized successfully')

    console.log('Parsing request body...')
    const body = await request.json()
    console.log('Request body parsed successfully')
    console.log('Request body keys:', Object.keys(body))
    
    const {
      recipientName,
      recipientCompany,
      recipientRole,
      purpose,
      tone,
      userProfile,
      searchMode = 'basic' // 'basic' or 'deep'
    } = body

    console.log('Extracted fields:', { recipientName, recipientCompany, recipientRole, purpose, tone, searchMode })

    if (!recipientName || !recipientCompany || !recipientRole || !purpose) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('All required fields present, proceeding with email generation...')

    let researchFindings = ''
    let commonalities = ''

    if (searchMode === 'deep') {
      // Deep search mode using GPT-4.1 with web_search_preview
      console.log('Starting deep search mode with GPT-4.1...')
      
      // Generate comprehensive search query
      const searchQuery = `"${recipientName}" "${recipientCompany}" ${recipientRole} professional background education experience achievements recent news articles LinkedIn profile`
      
      try {
        // Try using the responses API format for web_search_preview
        console.log('Attempting web_search_preview with GPT-4.1...')
        console.log('Search query:', searchQuery)
        
        const searchResponse = await openai.responses.create({
          model: "gpt-4.1",
          tools: [{ type: "web_search_preview" }],
          input: `Please conduct an EXTENSIVE and COMPREHENSIVE search for detailed information about: ${recipientName} who works at ${recipientCompany} as ${recipientRole}. 

IMPORTANT: 
- The person's name is: ${recipientName}
- The company they work at is: ${recipientCompany}
- Their role/position is: ${recipientRole}

SEARCH REQUIREMENTS - COMPILE AS MUCH RELEVANT INFORMATION AS POSSIBLE:

1. **Professional Background & Career History:**
   - Current role and responsibilities at ${recipientCompany}
   - Previous positions and companies
   - Career progression and timeline
   - Key achievements and milestones
   - Leadership roles and team sizes managed

2. **Education & Credentials:**
   - Degrees, institutions, and graduation years
   - Certifications and professional qualifications
   - Academic achievements and honors
   - Relevant coursework or specializations

3. **Recent Activities & News:**
   - Recent promotions, role changes, or company moves
   - Speaking engagements, conferences, or presentations
   - Awards, recognitions, or industry accolades
   - Recent media mentions or interviews
   - Company announcements involving this person

4. **Professional Interests & Expertise:**
   - Areas of specialization and expertise
   - Industry focus and market knowledge
   - Technical skills and technologies
   - Strategic initiatives they've led
   - Thought leadership areas

5. **Company Role & Impact:**
   - Specific responsibilities at ${recipientCompany}
   - Key projects and initiatives they've led
   - Team structure and reporting relationships
   - Strategic contributions to the company
   - Industry relationships and partnerships

6. **Public Presence & Thought Leadership:**
   - LinkedIn profile and activity
   - Articles, blog posts, or publications
   - Social media presence and engagement
   - Industry participation and memberships
   - Speaking engagements and conferences

7. **Industry & Market Knowledge:**
   - Industry trends they follow or comment on
   - Market insights and perspectives
   - Competitive landscape understanding
   - Future outlook and predictions

8. **Personal & Professional Connections:**
   - Professional network and relationships
   - Mentorship or advisory roles
   - Board positions or advisory committees
   - Industry associations and memberships

9. **Recent News & Developments:**
   - Any recent news articles mentioning this person
   - Company announcements or press releases
   - Industry events or conferences they've attended
   - Recent achievements or recognitions

10. **Social Media & Online Presence:**
    - LinkedIn activity and connections
    - Twitter/X presence and engagement
    - Professional blog or website
    - Online articles or contributions

COMPILE EVERY PIECE OF RELEVANT INFORMATION YOU CAN FIND. Be thorough and comprehensive. Include specific details, dates, numbers, and concrete examples. The more detailed and specific the information, the better.

Do NOT confuse the person's name with the company name. Search for ${recipientName} specifically at ${recipientCompany}.`
        })

        console.log('Web search preview response received')
        console.log('Response model:', searchResponse.model)
        console.log('Response tools used:', searchResponse.tools)
        
        // Extract search results from the response
        let searchResults = ''
        if (searchResponse.output_text) {
          searchResults = searchResponse.output_text
          console.log('Using output_text format')
        } else if (searchResponse.output && Array.isArray(searchResponse.output)) {
          // Handle the complex output array format from GPT-4.1
          const outputArray = searchResponse.output
          const messageItem = outputArray.find((item: any) => item.type === 'message')
          if (messageItem && (messageItem as any).content && Array.isArray((messageItem as any).content)) {
            const textContent = (messageItem as any).content.find((content: any) => content.type === 'output_text')
            if (textContent && textContent.text) {
              searchResults = textContent.text
              console.log('Using output array message format')
            }
          }
        }
        
        console.log('Search results extracted, length:', searchResults.length)
        
        if (!searchResults || searchResults.trim() === '') {
          throw new Error('No search results extracted from response')
        }
        
        // Now use the search results to generate a comprehensive report
        console.log('Generating comprehensive report with GPT-4o...')
        
        const reportPrompt = `Based on these comprehensive search results about ${recipientName} who works at ${recipientCompany} as ${recipientRole}:

${searchResults}

IMPORTANT: 
- The person's name is: ${recipientName}
- The company they work at is: ${recipientCompany}
- Their role/position is: ${recipientRole}

Create a DETAILED and COMPREHENSIVE professional report in EXACTLY this format with proper spacing. Include as much specific information as possible:

# Research Report: ${recipientName}

## Overview

${recipientName} works at ${recipientCompany} as ${recipientRole}.

## **1. Professional Background**

[Include their current role, company, and key responsibilities with extensive details. Include career progression, previous positions, companies worked for, key achievements, leadership roles, team sizes managed, and specific accomplishments. Be as detailed and specific as possible with dates, numbers, and concrete examples.]

## **2. Education & Credentials**

[Include degrees, institutions, graduation years, certifications, professional qualifications, academic achievements, honors, relevant coursework, specializations, and any additional educational background. Be comprehensive and specific.]

## **3. Recent Achievements & News**

[Include notable accomplishments, awards, recent promotions, role changes, company moves, speaking engagements, conferences, presentations, media mentions, interviews, company announcements, industry accolades, and any recent developments. Include specific dates and details.]

## **4. Professional Interests & Focus Areas**

[Include their areas of expertise, specializations, industry focus, market knowledge, technical skills, technologies they work with, strategic initiatives they've led, thought leadership areas, and professional interests. Be specific about their expertise areas.]

## **5. Company Role & Responsibilities**

[Include their specific role at ${recipientCompany}, key projects and initiatives they've led, team structure, reporting relationships, strategic contributions, industry relationships, partnerships, and their impact on the company. Include specific details about their responsibilities.]

## **6. Public Presence & Thought Leadership**

[Include publications, articles, blog posts, speaking engagements, conferences, LinkedIn activity, social media presence, industry participation, memberships, thought leadership content, and public appearances. Include specific examples and details.]

## **7. Industry & Market Knowledge**

[Include industry trends they follow, market insights, perspectives on the industry, competitive landscape understanding, future outlook, predictions, and their industry expertise. Include specific insights and viewpoints.]

## **8. Professional Network & Connections**

[Include professional relationships, mentorship roles, advisory positions, board memberships, industry associations, network connections, and professional affiliations. Include specific details about their network.]

## **9. Recent News & Developments**

[Include any recent news articles, company announcements, press releases, industry events, conferences attended, recent achievements, recognitions, and current developments. Include specific dates and details.]

## **10. Social Media & Online Presence**

[Include LinkedIn activity, connections, Twitter/X presence, professional blog, website, online articles, contributions, and digital footprint. Include specific details about their online presence.]

CRITICAL: You MUST include empty lines before and after every ## header. The format must be exactly as shown above with proper spacing. Copy the exact spacing pattern shown above.

BE EXTREMELY DETAILED AND COMPREHENSIVE. Include specific dates, numbers, names, companies, achievements, and concrete examples. The more detailed and specific the information, the better.`

        const reportResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a professional research analyst. Based on the search results provided, create a comprehensive report about the person. Structure it clearly with proper spacing between each numbered section and include all relevant professional information."
            },
            {
              role: "user",
              content: reportPrompt
            }
          ]
        })

        researchFindings = reportResponse.choices[0]?.message?.content || ''
        console.log('Report generation completed, length:', researchFindings.length)
        
        // Add proper spacing around bold lines
        researchFindings = addSpacingAroundBoldLines(researchFindings)

      } catch (error) {
        console.log('Web search preview error:', error)
        console.log('Falling back to enhanced analysis...')
        
        // Fallback to enhanced GPT-4o analysis
        const fallbackPrompt = `Please provide a COMPREHENSIVE and DETAILED analysis and report on: ${recipientName} who works at ${recipientCompany} as ${recipientRole}. 

IMPORTANT: 
- The person's name is: ${recipientName}
- The company they work at is: ${recipientCompany}
- Their role/position is: ${recipientRole}

Create a DETAILED and COMPREHENSIVE professional report in EXACTLY this format with proper spacing. Include as much specific information as possible:

# Research Report: ${recipientName}

## Overview

${recipientName} works at ${recipientCompany} as ${recipientRole}.

## **1. Professional Background**

[Include their current role, company, and key responsibilities with extensive details. Include career progression, previous positions, companies worked for, key achievements, leadership roles, team sizes managed, and specific accomplishments. Be as detailed and specific as possible with dates, numbers, and concrete examples.]

## **2. Education & Credentials**

[Include degrees, institutions, graduation years, certifications, professional qualifications, academic achievements, honors, relevant coursework, specializations, and any additional educational background. Be comprehensive and specific.]

## **3. Recent Achievements & News**

[Include notable accomplishments, awards, recent promotions, role changes, company moves, speaking engagements, conferences, presentations, media mentions, interviews, company announcements, industry accolades, and any recent developments. Include specific dates and details.]

## **4. Professional Interests & Focus Areas**

[Include their areas of expertise, specializations, industry focus, market knowledge, technical skills, technologies they work with, strategic initiatives they've led, thought leadership areas, and professional interests. Be specific about their expertise areas.]

## **5. Company Role & Responsibilities**

[Include their specific role at ${recipientCompany}, key projects and initiatives they've led, team structure, reporting relationships, strategic contributions, industry relationships, partnerships, and their impact on the company. Include specific details about their responsibilities.]

## **6. Public Presence & Thought Leadership**

[Include publications, articles, blog posts, speaking engagements, conferences, LinkedIn activity, social media presence, industry participation, memberships, thought leadership content, and public appearances. Include specific examples and details.]

## **7. Industry & Market Knowledge**

[Include industry trends they follow, market insights, perspectives on the industry, competitive landscape understanding, future outlook, predictions, and their industry expertise. Include specific insights and viewpoints.]

## **8. Professional Network & Connections**

[Include professional relationships, mentorship roles, advisory positions, board memberships, industry associations, network connections, and professional affiliations. Include specific details about their network.]

## **9. Recent News & Developments**

[Include any recent news articles, company announcements, press releases, industry events, conferences attended, recent achievements, recognitions, and current developments. Include specific dates and details.]

## **10. Social Media & Online Presence**

[Include LinkedIn activity, connections, Twitter/X presence, professional blog, website, online articles, contributions, and digital footprint. Include specific details about their online presence.]

CRITICAL: You MUST include empty lines before and after every ## header. The format must be exactly as shown above with proper spacing. Copy the exact spacing pattern shown above.

BE EXTREMELY DETAILED AND COMPREHENSIVE. Include specific dates, numbers, names, companies, achievements, and concrete examples. The more detailed and specific the information, the better.`

        const searchResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a professional research analyst with access to current information. Analyze and provide comprehensive information about the person mentioned. Format your response with proper spacing between each numbered section."
            },
            {
              role: "user",
              content: fallbackPrompt
            }
          ]
        })

        researchFindings = searchResponse.choices[0]?.message?.content || ''
        console.log('Fallback analysis completed, length:', researchFindings.length)
        
        // Add proper spacing around bold lines
        researchFindings = addSpacingAroundBoldLines(researchFindings)

      }

      // Find commonalities between user profile and recipient
      if (userProfile) {
        console.log('Generating commonalities with user profile...')
        
        const commonalitiesPrompt = `SENDER'S PROFILE (the person writing the email):
${JSON.stringify(userProfile, null, 2)}

RECIPIENT'S INFORMATION (the person being emailed):
${researchFindings}

Create a DETAILED and COMPREHENSIVE list of specific connections between the SENDER and RECIPIENT in EXACTLY this format with proper spacing. Be extremely thorough and find as many connections as possible:

# Connections & Shared Experiences

## Educational Connections

**Connection:** [Specific educational connection - e.g., "Both attended business school" or "Shared interest in computer science"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific details, institutions, degrees, years, coursework, or academic interests they share]

## Professional Connections

**Connection:** [Specific professional connection - e.g., "Both work in product management" or "Similar career progression"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific roles, companies, career paths, responsibilities, or professional experiences they share]

## Geographic Connections

**Connection:** [Specific geographic connection - e.g., "Both lived in San Francisco" or "Shared experience in tech hubs"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific locations, cities, regions, or geographic experiences they share]

## Industry Connections

**Connection:** [Specific industry connection - e.g., "Both in SaaS industry" or "Similar market focus"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific industries, markets, sectors, or business areas they share]

## Skill Connections

**Connection:** [Specific skill connection - e.g., "Both experienced with React" or "Shared expertise in data analysis"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific skills, technologies, tools, methodologies, or technical expertise they share]

## Interest Connections

**Connection:** [Specific interest connection - e.g., "Both passionate about AI" or "Shared interest in startups"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific interests, passions, hobbies, or areas of enthusiasm they share]

## Career Stage Connections

**Connection:** [Specific career stage connection - e.g., "Both mid-career professionals" or "Similar career trajectory"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific career stages, experience levels, or career progression patterns they share]

## Company Size/Type Connections

**Connection:** [Specific company connection - e.g., "Both work at large tech companies" or "Similar company culture experience"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific company types, sizes, cultures, or organizational experiences they share]

## Technology Connections

**Connection:** [Specific technology connection - e.g., "Both work with cloud technologies" or "Shared experience with specific tools"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific technologies, platforms, tools, or technical environments they share]

## Leadership Connections

**Connection:** [Specific leadership connection - e.g., "Both have leadership experience" or "Similar management styles"]

**Details:** [Detailed explanation of this connection - 2-3 sentences with specific leadership roles, management experience, team sizes, or leadership approaches they share]

CRITICAL: You MUST include empty lines before and after every ## header. The format must be exactly as shown above with proper spacing. Copy the exact spacing pattern shown above.

BE EXTREMELY THOROUGH AND DETAILED. Find as many connections as possible. Each connection should be specific and actionable. Include concrete details, examples, and specific information that could be used in a networking email. Focus on finding actual connections and shared experiences, not just comparing two separate profiles. Each connection should represent something they genuinely have in common that could create a meaningful conversation starter.`

        const commonalitiesResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a networking expert. Analyze the sender's profile and the recipient's information to find meaningful commonalities that could create genuine connections for a networking email."
            },
            {
              role: "user",
              content: commonalitiesPrompt
            }
          ]
        })

        commonalities = commonalitiesResponse.choices[0]?.message?.content || ''
        console.log('Commonalities generated successfully')
        
        // Add proper spacing around bold lines
        commonalities = addSpacingAroundBoldLines(commonalities)
      }

    } else {
      // Basic search mode using GPT-4o-mini for basic information
      console.log('Using basic search mode with GPT-4o-mini...')
      
      const searchQuery = `"${recipientName}" "${recipientCompany}" ${recipientRole}`
      console.log('Search query:', searchQuery)
      
      try {
        console.log('Making GPT-4o-mini web_search_preview request for basic information...')
        
        // Try using the responses API format for web search
        const searchResponse = await openai.responses.create({
          model: "gpt-4o-mini",
          tools: [{ type: "web_search_preview" }],
          input: `Please search for and provide basic information about: ${recipientName} who works at ${recipientCompany} as ${recipientRole}. 

IMPORTANT: 
- The person's name is: ${recipientName}
- The company they work at is: ${recipientCompany}
- Their role/position is: ${recipientRole}

Do NOT confuse the person's name with the company name. Search for ${recipientName} specifically at ${recipientCompany}. Focus on their professional role, company, and any notable background information. Keep it brief and factual.`,
        })

        console.log('GPT-4o-mini web_search_preview response received')
        console.log('Response model:', searchResponse.model)
        console.log('Response tools used:', searchResponse.tools)
        
        // Handle different possible response formats
        let searchResults = ''
        if (searchResponse.output_text) {
          searchResults = searchResponse.output_text
          console.log('Using output_text format for basic search')
        } else if (searchResponse.output && typeof searchResponse.output === 'string') {
          searchResults = searchResponse.output
          console.log('Using output string format for basic search')
        } else if (searchResponse.output && Array.isArray(searchResponse.output)) {
          searchResults = searchResponse.output.map(item => 
            typeof item === 'string' ? item : JSON.stringify(item)
          ).join('\n')
          console.log('Using output array format for basic search')
        } else {
          console.log('Unexpected response format for basic search:', searchResponse)
          searchResults = JSON.stringify(searchResponse)
        }
        
        console.log('Basic search results extracted, length:', searchResults.length)
        
        if (searchResults) {
          // Generate the same structured format as pro search
          const basicReportPrompt = `Based on these search results about ${recipientName} who works at ${recipientCompany} as ${recipientRole}:

${searchResults}

IMPORTANT: 
- The person's name is: ${recipientName}
- The company they work at is: ${recipientCompany}
- Their role/position is: ${recipientRole}

Create a brief professional report in EXACTLY this format with proper spacing:

# Research Report: ${recipientName}

## Overview

${recipientName} works at ${recipientCompany} as ${recipientRole}.

## **1. Professional Background**

[Brief summary of their current role and key responsibilities - 1-2 sentences max]

## **2. Education & Credentials**

[Brief summary of education - degrees and institutions only]

## **3. Recent Achievements & News**

[Brief mention of any notable recent accomplishments - 1 sentence max]

## **4. Professional Interests & Focus Areas**

[Brief summary of their main areas of expertise - 1 sentence max]

## **5. Company Role & Responsibilities**

[Brief description of their role at ${recipientCompany} - 1-2 sentences max]

## **6. Public Presence & Thought Leadership**

[Brief mention of any public presence or thought leadership - 1 sentence max]

CRITICAL: You MUST include empty lines before and after every ## header. The format must be exactly as shown above with proper spacing. Copy the exact spacing pattern shown above.`

          const basicReportResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a professional research analyst. Based on the search results provided, create a comprehensive report about the person. Structure it clearly with proper spacing between each numbered section and include all relevant professional information."
              },
              {
                role: "user",
                content: basicReportPrompt
              }
            ]
          })

          researchFindings = basicReportResponse.choices[0]?.message?.content || ''
          console.log('Research findings generated successfully from GPT web_search_preview')
          
          // Add proper spacing around bold lines
          researchFindings = addSpacingAroundBoldLines(researchFindings)

        } else {
          researchFindings = `# Research Report: ${recipientName}

## Overview
${recipientName} works at ${recipientCompany} as ${recipientRole}.

Basic information about ${recipientName} (the recipient) at ${recipientCompany} as ${recipientRole}.`
          console.log('No search results found, using basic info')
        }
        
      } catch (searchError) {
        console.error('GPT web_search_preview error:', searchError)
        console.log('Falling back to basic GPT-4o-mini without web search...')
        
        // Fallback to basic GPT-4o-mini without web search
        const fallbackResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that provides basic, factual information about people based on publicly available knowledge. Keep responses concise and focused on professional background. Be very clear about who you are researching and do not confuse person names with company names."
            },
            {
              role: "user",
              content: `Please provide basic information about: ${recipientName} who works at ${recipientCompany} as ${recipientRole}. 

IMPORTANT: 
- The person's name is: ${recipientName}
- The company they work at is: ${recipientCompany}
- Their role/position is: ${recipientRole}

This research is about ${recipientName} (the person being emailed), NOT the person writing the email.

Focus on ${recipientName}'s professional role at ${recipientCompany}, and any notable background information. Keep it brief and factual.

Remember: This is research about ${recipientName} at ${recipientCompany} as ${recipientRole}. Do NOT confuse the person's name with the company name.`
            }
          ],
          max_tokens: 200
        })

        const fallbackResults = fallbackResponse.choices[0]?.message?.content || ''
        
        // Generate the same structured format as pro search for fallback
        const fallbackReportPrompt = `Based on this basic information about ${recipientName} who works at ${recipientCompany} as ${recipientRole}:

${fallbackResults}

IMPORTANT: 
- The person's name is: ${recipientName}
- The company they work at is: ${recipientCompany}
- Their role/position is: ${recipientRole}

Create a brief basic report in EXACTLY this format with proper spacing:

# Research Report: ${recipientName}

## Overview

${recipientName} works at ${recipientCompany} as ${recipientRole}.

## **1. Professional Background**

[Brief summary of their current role and key responsibilities - 1-2 sentences max]

## **2. Education & Credentials**

[Brief summary of education - degrees and institutions only]

## **3. Recent Achievements & News**

[Brief mention of any notable recent accomplishments - 1 sentence max]

## **4. Professional Interests & Focus Areas**

[Brief summary of their main areas of expertise - 1 sentence max]

## **5. Company Role & Responsibilities**

[Brief description of their role at ${recipientCompany} - 1-2 sentences max]

## **6. Public Presence & Thought Leadership**

[Brief mention of any public presence or thought leadership - 1 sentence max]

CRITICAL: You MUST include empty lines before and after every ## header. The format must be exactly as shown above with proper spacing.`

        const fallbackReportResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a professional research analyst. Based on the information provided, create a comprehensive report about the person. Structure it clearly with proper spacing between each numbered section and include all relevant professional information."
            },
            {
              role: "user",
              content: fallbackReportPrompt
            }
          ]
        })

        researchFindings = fallbackReportResponse.choices[0]?.message?.content || ''
        console.log('Fallback research findings generated successfully')
        
        // Add proper spacing around bold lines
        researchFindings = addSpacingAroundBoldLines(researchFindings)
      }

      // Find commonalities (existing logic)
      if (userProfile) {
        console.log('Generating commonalities with user profile...')
        const commonalitiesResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `=== SENDER'S PROFILE (THE PERSON WRITING THE EMAIL) ===\n${JSON.stringify(userProfile)}\n\n=== RECIPIENT'S INFORMATION (THE PERSON BEING EMAILED) ===\n- Name: ${recipientName}\n- Company: ${recipientCompany}\n- Role: ${recipientRole}\n\n=== RESEARCH ABOUT THE RECIPIENT ===\n${researchFindings}\n\nCreate a list of specific connections between the SENDER and RECIPIENT in EXACTLY this format with proper spacing:

# Connections & Shared Experiences

## Educational Connections

**Connection:** [Specific educational connection - e.g., "Both attended business school" or "Shared interest in computer science"]

**Details:** [Brief details about this connection - 1-2 sentences]

## Professional Connections

**Connection:** [Specific professional connection - e.g., "Both work in product management" or "Similar career progression"]

**Details:** [Brief details about this connection - 1-2 sentences]

## Geographic Connections

**Connection:** [Specific geographic connection - e.g., "Both lived in San Francisco" or "Shared experience in tech hubs"]

**Details:** [Brief details about this connection - 1-2 sentences]

## Industry Connections

**Connection:** [Specific industry connection - e.g., "Both in SaaS industry" or "Similar market focus"]

**Details:** [Brief details about this connection - 1-2 sentences]

## Skill Connections

**Connection:** [Specific skill connection - e.g., "Both experienced with React" or "Shared expertise in data analysis"]

**Details:** [Brief details about this connection - 1-2 sentences]

## Interest Connections

**Connection:** [Specific interest connection - e.g., "Both passionate about AI" or "Shared interest in startups"]

**Details:** [Brief details about this connection - 1-2 sentences]

CRITICAL: You MUST include empty lines before and after every ## header. The format must be exactly as shown above with proper spacing.

Focus on finding actual connections and shared experiences, not just comparing two separate profiles. Each connection should represent something they genuinely have in common.

IMPORTANT: Clearly distinguish between:
- SENDER: ${userProfile.full_name || '[Your Name]'} (the person writing the email)
- RECIPIENT: ${recipientName} (the person being emailed)

Do not confuse their names, companies, or roles.`
            }
          ]
        })

        commonalities = commonalitiesResponse.choices[0]?.message?.content || ''
        console.log('Commonalities generated successfully')
        
        // Add proper spacing around bold lines
        commonalities = addSpacingAroundBoldLines(commonalities)
      }
    }

    // Generate the email using the research findings and commonalities
    console.log('Building email generation prompt...')
    
    let prompt = 'Generate a personalized outreach email for networking purposes.\n\n'
    prompt += `=== RECIPIENT INFORMATION (THE PERSON YOU ARE EMAILING) ===\n`
    prompt += `RECIPIENT NAME: ${recipientName}\n`
    prompt += `RECIPIENT COMPANY: ${recipientCompany}\n`
    prompt += `RECIPIENT ROLE: ${recipientRole}\n`
    prompt += `PURPOSE OF OUTREACH: ${purpose}\n\n`
    
    if (researchFindings) {
      prompt += `=== RESEARCH ABOUT THE RECIPIENT ===\n`
      prompt += `${researchFindings}\n\n`
    }
    
    if (commonalities) {
      prompt += `=== COMMONALITIES BETWEEN SENDER AND RECIPIENT ===\n`
      prompt += `${commonalities}\n\n`
    }
    
    if (userProfile) {
      prompt += `=== SENDER PROFILE (YOUR BACKGROUND - THE PERSON WRITING THE EMAIL) ===\n`
      prompt += `SENDER NAME: ${userProfile.full_name || '[Your Name]'}\n`
      prompt += `SENDER JOB TITLE: ${userProfile.job_title || 'Not specified'}\n`
      prompt += `SENDER COMPANY: ${userProfile.company || 'Not specified'}\n`
      prompt += `SENDER EDUCATION: ${userProfile.education?.school || 'Not specified'}\n`
      prompt += `SENDER BACKGROUND: ${userProfile.background || 'Not specified'}\n`
      prompt += `SENDER SKILLS: ${userProfile.skills?.join(', ') || 'Not specified'}\n`
      prompt += `SENDER INTERESTS: ${userProfile.interests?.join(', ') || 'Not specified'}\n\n`
    }
    
    if (userProfile?.resume_text) {
      prompt += `=== SENDER RESUME CONTEXT ===\n`
      prompt += `${userProfile.resume_text}\n\n`
    }
    
    prompt += `=== EMAIL REQUIREMENTS ===\n`
    prompt += `- Write from the SENDER'S perspective (${userProfile?.full_name || '[Your Name]'}) to the RECIPIENT (${recipientName})\n`
    prompt += `- Use the ${tone} tone appropriately\n`
    prompt += `- Keep it concise (2-3 paragraphs max)\n`
    prompt += `- Include a clear call-to-action\n`
    prompt += `- Make it sound human-written, not robotic\n`
    prompt += `- If research findings are provided, subtly incorporate relevant details about the RECIPIENT (${recipientName}) to show you've done your homework\n`
    prompt += `- If commonalities are found, mention specific connections between the SENDER and the RECIPIENT to create genuine connections\n`
    prompt += `- Use the SENDER'S background and experience to relate to the RECIPIENT'S background\n`
    prompt += `- End with a professional signature using the SENDER'S name: "${userProfile?.full_name || '[Your Name]'}"\n\n`
    prompt += `=== CRITICAL INSTRUCTIONS ===\n`
    prompt += `- The SENDER is ${userProfile?.full_name || '[Your Name]'} (the person writing the email)\n`
    prompt += `- The RECIPIENT is ${recipientName} (the person being emailed)\n`
    prompt += `- NEVER confuse the SENDER and RECIPIENT names, companies, or roles\n`
    prompt += `- The email should be written from ${userProfile?.full_name || '[Your Name]'} to ${recipientName}\n`
    prompt += `- Use "I" to refer to the SENDER and "you" to refer to the RECIPIENT\n`
    prompt += `- Do not mix up the sender's company (${userProfile?.company || 'Not specified'}) with the recipient's company (${recipientCompany})\n`
    prompt += `- IMPORTANT: Return ONLY the email content. Do NOT include the research findings, commonalities, or any other information in the email text\n`
    prompt += `- The email should be a clean, professional message that incorporates insights from the research but does not list or reference the research findings directly\n`
    prompt += `- Do not include headers like "Research Findings:" or "Commonalities:" in the email content\n`
    prompt += `- The email should read like a natural, personalized message, not a research report\n`

    // If no user profile is available, add a note about the signature
    if (!userProfile) {
      prompt += `\n\nNote: Since no user profile was found, use "[Your Name]" as the signature. The user should update this with their actual name.`
    }

    console.log('Generating email with prompt length:', prompt.length)
    
    try {
      console.log('Making email generation request to OpenAI...')
      const emailResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at writing personalized, professional networking emails that sound authentic and human-written. IMPORTANT: Return ONLY the email content - do not include research findings, commonalities, or any other information in the email text. The email should be a clean, professional message that incorporates insights from the research but does not list or reference the research findings directly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      console.log('Email response received:', JSON.stringify(emailResponse, null, 2))
      
      const generatedEmail = emailResponse.choices[0]?.message?.content || ''
      console.log('Email generated successfully, length:', generatedEmail.length)
      console.log('Generated email content:', generatedEmail)

      if (!generatedEmail || generatedEmail.trim() === '') {
        throw new Error('No email content generated from OpenAI response')
      }

      // Save the generated email to the database (optional - only if user is authenticated)
      try {
        const authHeader = request.headers.get('authorization')
        const userId = authHeader ? authHeader.replace('Bearer ', '') : null
        
        if (userId) {
          console.log('Saving email to database for user:', userId)
          console.log('Data to save:', {
            user_id: userId,
            recipient_name: recipientName,
            recipient_company: recipientCompany,
            recipient_role: recipientRole,
            purpose: purpose,
            search_mode: searchMode,
            research_findings: researchFindings,
            commonalities: commonalities,
            generated_email: generatedEmail
          })
          
          const { data: savedData, error: saveError } = await supabase
            .from('generated_emails')
            .insert({
              user_id: userId,
              recipient_name: recipientName,
              recipient_company: recipientCompany,
              recipient_role: recipientRole,
              purpose: purpose,
              search_mode: searchMode,
              research_findings: researchFindings,
              commonalities: commonalities,
              generated_email: generatedEmail
            })
            .select()
          
          if (saveError) {
            console.error('Supabase save error:', saveError)
            throw saveError
          }
          
          console.log('Email saved to database successfully:', savedData)
        } else {
          console.log('No authenticated user found, skipping database save')
        }
      } catch (dbError) {
        console.log('Database save failed (continuing anyway):', dbError)
        console.error('Database error details:', dbError)
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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('NEXT_PUBLIC_SUPABASE_URL')) {
        return NextResponse.json(
          { error: 'Database configuration error: Supabase URL not configured' },
          { status: 500 }
        )
      }
      if (error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        return NextResponse.json(
          { error: 'Database configuration error: Supabase service key not configured' },
          { status: 500 }
        )
      }
      if (error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json(
          { error: 'AI configuration error: OpenAI API key not configured' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: `Configuration error: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate email - unknown error occurred' },
      { status: 500 }
    )
  }
}