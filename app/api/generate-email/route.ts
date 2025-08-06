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
  
  // Check environment variables
  console.log('Checking environment variables...')
  console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
  
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
  
  // Initialize Supabase client inside the function
  console.log('Initializing Supabase client...')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  console.log('Supabase client initialized successfully')

  // Parse request body with error handling
  let body
  try {
    console.log('Parsing request body...')
    body = await request.json()
    console.log('Request body parsed successfully')
    console.log('Request body keys:', Object.keys(body))
  } catch (error) {
    console.error('Error parsing request body:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
  
  const {
    recipientName,
    recipientCompany,
    recipientRole,
    recipientLinkedIn,
    purpose,
    tone,
    userProfile,
    searchMode = 'basic' // 'basic' or 'deep'
  } = body

  console.log('Extracted fields:', { recipientName, recipientCompany, recipientRole, recipientLinkedIn, purpose, tone, searchMode })

  if (!recipientName || !purpose) {
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
    // Deep search mode using progressive SearchAPI + ChatGPT analysis
    console.log('Starting deep search mode with progressive SearchAPI + ChatGPT analysis...')
    
    try {
      console.log('Deep search - Phase 1: Initial comprehensive searches...')
      
      // Validate SearchAPI key
      if (!process.env.SEARCHAPI_KEY) {
        console.log('SearchAPI key not found, falling back to ChatGPT only...')
        throw new Error('SearchAPI key not configured')
      }
      
      // Phase 1: Initial search queries (same as basic search)
      const initialSearchQueries = [
        // LinkedIn search
        `site:linkedin.com/in/ "${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}`,
        // General professional information
        `"${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}${recipientRole ? ` "${recipientRole}"` : ''} professional background`,
        // Education search
        `"${recipientName}" education university college${recipientCompany ? ` OR "${recipientCompany}"` : ''}`,
        // Career and experience search
        `"${recipientName}" career experience${recipientRole ? ` "${recipientRole}"` : ''}${recipientCompany ? ` "${recipientCompany}"` : ''}`
      ]
      
      console.log('Executing Phase 1 SearchAPI searches...')
      const phase1Results = []
      
      for (const query of initialSearchQueries) {
        try {
          console.log(`Phase 1 - Searching: ${query}`)
          const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=5`)
          
          if (!response.ok) {
            console.error(`SearchAPI request failed for query "${query}":`, response.status, response.statusText)
            continue
          }
          
          const data = await response.json()
          
          if (data.organic_results && data.organic_results.length > 0) {
            const queryResults = data.organic_results.slice(0, 3).map((result: any) => ({
              title: result.title,
              snippet: result.snippet,
              link: result.link,
              query: query,
              phase: 1
            }))
            phase1Results.push(...queryResults)
          }
          
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (searchError) {
          console.error(`Error in Phase 1 SearchAPI search for query "${query}":`, searchError)
          continue
        }
      }
      
      console.log(`Phase 1 completed. Found ${phase1Results.length} results.`)
      
      // Phase 2: Ask ChatGPT to generate 4 more targeted search queries based on Phase 1 results
      console.log('Deep search - Phase 2: Generating targeted searches based on initial findings...')
      
      const phase1Info = phase1Results.map((result: any) => 
        `**Title:** ${result.title}\n**Snippet:** ${result.snippet}\n**URL:** ${result.link}`
      ).join('\n\n---\n\n')
      
      const phase2QueryPrompt = `Based on the initial search results below about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}, generate 4 more specific and targeted Google search queries that would help gather deeper information about this person.

INITIAL SEARCH RESULTS:
${phase1Info || 'Limited initial results found'}

INSTRUCTIONS:
- Generate 4 specific Google search queries that would uncover more detailed information
- Focus on areas that weren't fully covered in the initial searches
- Look for: achievements, publications, speaking engagements, projects, industry recognition, social media presence, interviews, news mentions
- Make the queries specific and likely to return valuable professional information
- Avoid repeating the same type of searches already done

Please respond with ONLY 4 search queries, one per line, in this exact format:
1. [search query 1]
2. [search query 2] 
3. [search query 3]
4. [search query 4]`

      const phase2Response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a research expert who creates targeted Google search queries to find comprehensive information about professionals. Generate specific, actionable search queries that will uncover deeper insights."
          },
          {
            role: "user",
            content: phase2QueryPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })

      const phase2QueriesText = phase2Response.choices[0]?.message?.content || ''
      const phase2Queries = phase2QueriesText
        .split('\n')
        .filter(line => line.trim() && /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 4)

      console.log('Generated Phase 2 queries:', phase2Queries)
      
      // Execute Phase 2 searches
      const phase2Results = []
      
      for (const query of phase2Queries) {
        if (!query) continue
        
        try {
          console.log(`Phase 2 - Searching: ${query}`)
          const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=5`)
          
          if (!response.ok) {
            console.error(`SearchAPI request failed for query "${query}":`, response.status, response.statusText)
            continue
          }
          
          const data = await response.json()
          
          if (data.organic_results && data.organic_results.length > 0) {
            const queryResults = data.organic_results.slice(0, 3).map((result: any) => ({
              title: result.title,
              snippet: result.snippet,
              link: result.link,
              query: query,
              phase: 2
            }))
            phase2Results.push(...queryResults)
          }
          
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (searchError) {
          console.error(`Error in Phase 2 SearchAPI search for query "${query}":`, searchError)
          continue
        }
      }
      
      console.log(`Phase 2 completed. Found ${phase2Results.length} results.`)
      
      // Phase 3: Ask ChatGPT to generate 4 final targeted search queries based on all previous results
      console.log('Deep search - Phase 3: Generating final targeted searches...')
      
      const combinedPhase1And2Info = [...phase1Results, ...phase2Results].map((result: any) => 
        `**Phase ${result.phase} - Title:** ${result.title}\n**Snippet:** ${result.snippet}\n**URL:** ${result.link}\n**Query:** ${result.query}`
      ).join('\n\n---\n\n')
      
      const phase3QueryPrompt = `Based on all the search results below about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}, generate 4 final specific search queries to fill any remaining gaps and gather the most comprehensive information possible.

ALL PREVIOUS SEARCH RESULTS:
${combinedPhase1And2Info || 'Limited results found in previous phases'}

INSTRUCTIONS:
- Generate 4 final specific Google search queries to complete the research
- Look for any gaps in the information gathered so far
- Focus on: detailed background, specific achievements, industry impact, thought leadership, personal interests, volunteer work, awards, certifications
- Make these queries highly specific and likely to uncover unique information not found yet
- Avoid repeating similar searches already performed

Please respond with ONLY 4 search queries, one per line, in this exact format:
1. [search query 1]
2. [search query 2]
3. [search query 3] 
4. [search query 4]`

      const phase3Response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a research expert who creates highly targeted Google search queries to complete comprehensive professional research. Focus on uncovering unique insights and filling information gaps."
          },
          {
            role: "user",
            content: phase3QueryPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })

      const phase3QueriesText = phase3Response.choices[0]?.message?.content || ''
      const phase3Queries = phase3QueriesText
        .split('\n')
        .filter(line => line.trim() && /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 4)

      console.log('Generated Phase 3 queries:', phase3Queries)
      
      // Execute Phase 3 searches
      const phase3Results = []
      
      for (const query of phase3Queries) {
        if (!query) continue
        
        try {
          console.log(`Phase 3 - Searching: ${query}`)
          const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=5`)
          
          if (!response.ok) {
            console.error(`SearchAPI request failed for query "${query}":`, response.status, response.statusText)
            continue
          }
          
          const data = await response.json()
          
          if (data.organic_results && data.organic_results.length > 0) {
            const queryResults = data.organic_results.slice(0, 3).map((result: any) => ({
              title: result.title,
              snippet: result.snippet,
              link: result.link,
              query: query,
              phase: 3
            }))
            phase3Results.push(...queryResults)
          }
          
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (searchError) {
          console.error(`Error in Phase 3 SearchAPI search for query "${query}":`, searchError)
          continue
        }
      }
      
      console.log(`Phase 3 completed. Found ${phase3Results.length} results.`)
      
      // Final Phase: Generate comprehensive report using all search results
      console.log('Deep search - Final Phase: Generating comprehensive report with all search data...')
      
      const allSearchResults = [...phase1Results, ...phase2Results, ...phase3Results]
      console.log(`Total search results collected: ${allSearchResults.length}`)
      
      // Extract LinkedIn URL if found
      let linkedInUrl = recipientLinkedIn
      if (!linkedInUrl) {
        const linkedInResult = allSearchResults.find((result: any) => 
          result.link && result.link.includes('linkedin.com/in/') && 
          result.title.toLowerCase().includes(recipientName.toLowerCase())
        )
        if (linkedInResult) {
          linkedInUrl = linkedInResult.link
          console.log('Found LinkedIn URL:', linkedInUrl)
        }
      }
      
      // Compile all search information for final ChatGPT analysis
      const allSearchInfo = allSearchResults.map((result: any) => 
        `**Phase ${result.phase} Result**\n**Source:** ${result.title}\n**URL:** ${result.link}\n**Info:** ${result.snippet}\n**Search Query:** ${result.query}`
      ).join('\n\n---\n\n')
      
      // Generate final comprehensive report
      const finalReportPrompt = `Create a DETAILED and COMPREHENSIVE professional research report about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}.

${recipientLinkedIn ? `PROVIDED LINKEDIN URL: ${recipientLinkedIn}` : ''}
${linkedInUrl && linkedInUrl !== recipientLinkedIn ? `FOUND LINKEDIN URL: ${linkedInUrl}` : ''}

COMPREHENSIVE SEARCH RESULTS FROM 3-PHASE DEEP RESEARCH:
${allSearchInfo || 'Limited search results found'}

INSTRUCTIONS:
- Create a detailed and comprehensive professional research report about this person
- Use all the search results above as your primary source of information
- Organize the information logically to tell their complete professional story
- Include as much verified detail as possible from the search results
- If LinkedIn information was found, prioritize that as the most reliable source
- Create sections that make sense based on the actual information found
- Be specific about achievements, background, experience, education, and notable work
- Only include information that can be verified from the search results provided
- If any information seems contradictory, note the discrepancies

Structure the report comprehensively but adapt completely based on what information was actually found. Consider including sections like:

# Research Report: ${recipientName}

## **Professional Overview**
## **Current Role & Responsibilities**
## **Career Background & Progression**
## **Education & Qualifications**
## **Notable Achievements & Recognition**
## **Industry Involvement & Thought Leadership**
## **Publications, Speaking, or Media Presence**
## **Professional Network & Associations**
## **Skills & Expertise Areas**
## **Personal Interests** (if found)
## **LinkedIn Profile Summary**

IMPORTANT FORMATTING REQUIREMENTS:
- This is a DEEP research report - be thorough and detailed
- Use # for the main title
- Use ## **Section Name** for all section headers (with bold formatting)
- Only include sections where you have substantial information from search results
- Be specific about what you found rather than making general assumptions
- Organize information logically and professionally
- Base everything strictly on the search results provided above
- Make this valuable for someone wanting to build a meaningful professional relationship`

      const finalReportResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a senior professional research analyst who creates comprehensive, detailed reports about individuals for high-level networking and business development purposes. Base your analysis strictly on the extensive search results provided and create a thorough, well-organized report."
          },
          {
            role: "user",
            content: finalReportPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500
      })

      researchFindings = finalReportResponse.choices[0]?.message?.content || ''
      console.log('Comprehensive deep research report generated successfully, length:', researchFindings.length)
      
      // Add proper spacing around bold lines
      researchFindings = addSpacingAroundBoldLines(researchFindings)

    } catch (error) {
      console.error('Deep SearchAPI + ChatGPT analysis error:', error)
      console.log('Falling back to basic information...')
      
      // Fallback to basic info
      researchFindings = `# Research Report: ${recipientName}

## **Overview**

${recipientName}${recipientCompany ? ` works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}.

## **Professional Background**

Based on their role${recipientRole ? ` as ${recipientRole}` : ''}${recipientCompany ? ` at ${recipientCompany}` : ''}, they likely have relevant professional experience in their field.

${recipientLinkedIn ? `## **LinkedIn Profile**\n\nLinkedIn Profile: ${recipientLinkedIn}\n\nTheir LinkedIn profile would contain detailed information about their professional background, experience, and achievements.` : '## **Additional Information**\n\nMore detailed information would be available with access to their LinkedIn profile and other professional sources.'}`
      
      console.log('Using fallback basic info')
    }

    // Find commonalities between user profile and recipient
    if (userProfile) {
      console.log('Generating commonalities with user profile...')
      
      const commonalitiesPrompt = `SENDER'S PROFILE (the person writing the email):
${JSON.stringify(userProfile, null, 2)}

RECIPIENT'S INFORMATION (the person being emailed):
${researchFindings}

Create a DETAILED and COMPREHENSIVE list of specific connections between the SENDER and RECIPIENT. Be thorough and find as many potential connections as possible:

# Connections & Shared Experiences

[Create sections based on potential connections you find, such as:
- Educational Connections
- Professional Connections  
- Geographic Connections
- Industry Connections
- Skill Connections
- Interest Connections
- Career Stage Connections
- Company/Industry Type Connections
- Technology Connections
- Leadership Connections
- Any other relevant connections]

For each connection found, use this format:
**Connection:** [Specific connection]
**Details:** [Detailed explanation with specific details that could be used in a networking email]

IMPORTANT FORMATTING:
- Use ## for main section headers
- Use **bold** for connection titles
- Include empty lines before and after section headers
- Focus on finding actual connections and shared experiences
- Each connection should be specific and actionable for networking

Focus on finding genuine commonalities that could create meaningful conversation starters for a networking email.`

      const commonalitiesResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
    // Basic search mode using SearchAPI + ChatGPT analysis
    console.log('Using basic search mode with SearchAPI + ChatGPT analysis...')
    
    try {
      console.log('Starting SearchAPI searches for comprehensive information...')
      
      // Validate SearchAPI key
      if (!process.env.SEARCHAPI_KEY) {
        console.log('SearchAPI key not found, falling back to ChatGPT only...')
        throw new Error('SearchAPI key not configured')
      }
      
      // Define search queries for comprehensive information
      const searchQueries = [
        // LinkedIn search
        `site:linkedin.com/in/ "${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}`,
        // General professional information
        `"${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}${recipientRole ? ` "${recipientRole}"` : ''} professional background`,
        // Education search
        `"${recipientName}" education university college${recipientCompany ? ` OR "${recipientCompany}"` : ''}`,
        // Career and experience search
        `"${recipientName}" career experience${recipientRole ? ` "${recipientRole}"` : ''}${recipientCompany ? ` "${recipientCompany}"` : ''}`
      ]
      
      console.log('Executing SearchAPI searches...')
      const searchResults = []
      
      for (const query of searchQueries) {
        try {
          console.log(`Searching: ${query}`)
          const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=5`)
          
          if (!response.ok) {
            console.error(`SearchAPI request failed for query "${query}":`, response.status, response.statusText)
            continue
          }
          
          const data = await response.json()
          
          if (data.organic_results && data.organic_results.length > 0) {
            // Extract useful information from search results
            const queryResults = data.organic_results.slice(0, 3).map((result: any) => ({
              title: result.title,
              snippet: result.snippet,
              link: result.link,
              query: query
            }))
            searchResults.push(...queryResults)
          }
          
          // Small delay between requests to be respectful
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (searchError) {
          console.error(`Error in SearchAPI search for query "${query}":`, searchError)
          continue
        }
      }
      
      console.log(`SearchAPI searches completed. Found ${searchResults.length} results.`)
      
      // Extract LinkedIn URL if found
      let linkedInUrl = recipientLinkedIn
      if (!linkedInUrl) {
        const linkedInResult = searchResults.find((result: any) => 
          result.link && result.link.includes('linkedin.com/in/') && 
          result.title.toLowerCase().includes(recipientName.toLowerCase())
        )
        if (linkedInResult) {
          linkedInUrl = linkedInResult.link
          console.log('Found LinkedIn URL:', linkedInUrl)
        }
      }
      
      // Compile search information for ChatGPT
      const searchInfo = searchResults.map((result: any) => 
        `**Source:** ${result.title}\n**URL:** ${result.link}\n**Info:** ${result.snippet}\n**Search Query:** ${result.query}`
      ).join('\n\n---\n\n')
      
      console.log('Generating research report with ChatGPT using search results...')
      
      // Create comprehensive report using ChatGPT analysis with search data
      const reportPrompt = `Create a BRIEF but informative professional research report about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}.

${recipientLinkedIn ? `PROVIDED LINKEDIN URL: ${recipientLinkedIn}` : ''}
${linkedInUrl && linkedInUrl !== recipientLinkedIn ? `FOUND LINKEDIN URL: ${linkedInUrl}` : ''}

SEARCH RESULTS FROM THE WEB:
${searchInfo || 'No additional search results found'}

INSTRUCTIONS:
- Create a brief but comprehensive professional report about this person
- Use the search results above as your primary source of information
- If LinkedIn information was found, prioritize that as the most reliable source
- Focus on their professional background, education, career progression, and current role
- Decide what 3-5 sections would be most relevant based on the information found
- Keep each section concise (1-3 sentences) but make them meaningful and specific
- Only include information that can be verified from the search results provided
- If contradictory information is found, note any uncertainties

Structure the report like this but adapt based on what information was actually found:

# Research Report: ${recipientName}

## **Overview**

${recipientName}${recipientCompany ? ` works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}.

## **Professional Background**
[Based on search results - their current role and recent career highlights]

## **Education**
[If found in search results - their educational background]

## **Career Progression**
[If found in search results - their career journey and notable positions]

## **Notable Achievements**
[If found in search results - any achievements, projects, or recognition]

## **LinkedIn Profile**
[If LinkedIn URL was found, mention it and any key insights from LinkedIn results]

IMPORTANT FORMATTING REQUIREMENTS:
- Use # for the main title
- Use ## **Section Name** for all section headers (with bold formatting)
- Only include sections where you have actual information from the search results
- Be specific about what you found rather than making general assumptions
- If limited information was found, be honest about that
- Focus on creating value for networking purposes
- Base everything on the search results provided above`

      const reportResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional research analyst who creates focused reports about individuals for networking purposes. Base your analysis strictly on the search results provided and be specific about what information was found."
          },
          {
            role: "user",
            content: reportPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      researchFindings = reportResponse.choices[0]?.message?.content || ''
      console.log('Research report with SearchAPI data generated successfully, length:', researchFindings.length)
      
      // Add proper spacing around bold lines
      researchFindings = addSpacingAroundBoldLines(researchFindings)

    } catch (error) {
      console.error('SearchAPI + ChatGPT analysis error (basic mode):', error)
      console.log('Falling back to basic info without web search...')
      
      // Fallback to basic info without web search
      researchFindings = `# Research Report: ${recipientName}

## **Overview**

${recipientName}${recipientCompany ? ` works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}.

## **Professional Background**

Based on their role${recipientRole ? ` as ${recipientRole}` : ''}${recipientCompany ? ` at ${recipientCompany}` : ''}, they likely have relevant professional experience in their field.

${recipientLinkedIn ? `## **LinkedIn Profile**\n\nLinkedIn Profile: ${recipientLinkedIn}\n\nTheir LinkedIn profile would contain detailed information about their professional background, experience, and achievements.` : '## **Additional Information**\n\nMore information would be available with access to their professional profiles and web search capabilities.'}`
      
      console.log('Using fallback basic info')
    }
  }

  // Find commonalities (existing logic)
  if (userProfile) {
    console.log('Generating commonalities with user profile...')
    const commonalitiesResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `=== SENDER'S PROFILE (THE PERSON WRITING THE EMAIL) ===\n${JSON.stringify(userProfile)}\n\n=== RECIPIENT'S INFORMATION (THE PERSON BEING EMAILED) ===\n- Name: ${recipientName}\n${recipientCompany ? `- Company: ${recipientCompany}\n` : ''}${recipientRole ? `- Role: ${recipientRole}\n` : ''}${recipientLinkedIn ? `- LinkedIn: ${recipientLinkedIn}\n` : ''}\n=== RESEARCH ABOUT THE RECIPIENT ===\n${researchFindings}\n\nCreate a list of specific connections between the SENDER and RECIPIENT in EXACTLY this format with proper spacing:

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

  // Generate the email using the research findings and commonalities
  console.log('Building email generation prompt...')
  
  let prompt = 'Generate a personalized outreach email for networking purposes.\n\n'
  prompt += `=== RECIPIENT INFORMATION (THE PERSON YOU ARE EMAILING) ===\n`
  prompt += `RECIPIENT NAME: ${recipientName}\n`
  if (recipientCompany) {
    prompt += `RECIPIENT COMPANY: ${recipientCompany}\n`
  }
  if (recipientRole) {
    prompt += `RECIPIENT ROLE: ${recipientRole}\n`
  }
  if (recipientLinkedIn) {
    prompt += `RECIPIENT LINKEDIN: ${recipientLinkedIn}\n`
  }
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
      researchFindings: researchFindings,
      commonalities: commonalities,
      message: 'Email generated successfully'
    })
  } catch (error) {
    console.error('Error generating email:', error)
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    )
  }
}