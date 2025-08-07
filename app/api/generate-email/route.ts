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

  // Get user ID from authorization header
  const authHeader = request.headers.get('authorization')
  const userId = authHeader ? authHeader.replace('Bearer ', '') : null
  
  if (!userId) {
    console.log('No authenticated user found')
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  console.log('Checking user subscription and usage limits...')

  // Check user's subscription and usage limits
  try {
    // Get user's subscription details
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .rpc('get_user_subscription', { user_uuid: userId })
    
    if (subscriptionError) {
      console.error('Error getting user subscription:', subscriptionError)
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      )
    }

    if (!subscriptionData || subscriptionData.length === 0) {
      console.log('No subscription found, defaulting to free plan')
      // Default to free plan if no subscription found
      subscriptionData.push({
        plan_name: 'free',
        plan_display_name: 'Free',
        search_type: 'basic',
        daily_generation_limit: 2,
        tone_options: ['professional'],
        email_editing_enabled: false,
        priority_support: false,
        status: 'active',
        trial_end_date: null
      })
    }

    const userSubscription = subscriptionData[0]
    console.log('User subscription:', userSubscription)

    // Check if user requested pro features but doesn't have pro plan
    if (userSubscription.plan_name === 'free') {
      // Check if user is trying to use deep search
      if (searchMode === 'deep') {
        return NextResponse.json(
          { 
            error: 'Deep search is a Pro feature',
            errorType: 'SUBSCRIPTION_REQUIRED',
            requiredPlan: 'pro',
            feature: 'Deep Search'
          },
          { status: 403 }
        )
      }

      // Check if user is trying to use non-professional tone
      if (tone && tone !== 'professional') {
        return NextResponse.json(
          { 
            error: 'Custom tones are a Pro feature',
            errorType: 'SUBSCRIPTION_REQUIRED',
            requiredPlan: 'pro',
            feature: 'Tone Customization'
          },
          { status: 403 }
        )
      }

      // Check daily generation limit for free users
      const { data: usageData, error: usageError } = await supabase
        .rpc('check_daily_usage_limit', { user_uuid: userId })
      
      if (usageError) {
        console.error('Error checking usage limit:', usageError)
        return NextResponse.json(
          { error: 'Failed to check usage limits' },
          { status: 500 }
        )
      }

      if (usageData && usageData.length > 0) {
        const usage = usageData[0]
        console.log('User daily usage:', usage)
        
        if (usage.limit_reached) {
          return NextResponse.json(
            { 
              error: `Daily limit reached (${usage.daily_limit} generations per day)`,
              errorType: 'DAILY_LIMIT_REACHED',
              usageInfo: {
                generationsToday: usage.generations_today,
                dailyLimit: usage.daily_limit,
                limitReached: true
              },
              upgradeMessage: 'Upgrade to Pro for unlimited generations'
            },
            { status: 429 }
          )
        }
      }
    }

    // Force basic search for free users
    // const effectiveSearchMode = userSubscription.plan_name === 'free' ? 'basic' : searchMode
    // const effectiveTone = userSubscription.plan_name === 'free' ? 'professional' : tone

    // console.log(`User plan: ${userSubscription.plan_name}, effective search mode: ${effectiveSearchMode}, effective tone: ${effectiveTone}`)

  } catch (error) {
    console.error('Error in subscription check:', error)
    return NextResponse.json(
      { error: 'Failed to validate subscription' },
      { status: 500 }
    )
  }

  console.log('All required fields present and subscription validated, proceeding with email generation...')

  // Set effective values based on subscription
  let effectiveSearchMode = searchMode
  let effectiveTone = tone

  // Apply subscription restrictions
  try {
    const { data: subscriptionData } = await supabase
      .rpc('get_user_subscription', { user_uuid: userId })
    
    if (subscriptionData && subscriptionData.length > 0) {
      const userSubscription = subscriptionData[0]
      effectiveSearchMode = userSubscription.plan_name === 'free' ? 'basic' : searchMode
      effectiveTone = userSubscription.plan_name === 'free' ? 'professional' : tone
    }
  } catch (error) {
    console.error('Error getting subscription for effective values:', error)
    // Default to free restrictions if error
    effectiveSearchMode = 'basic'
    effectiveTone = 'professional'
  }

  let researchFindings = ''
  let commonalities = ''

  if (effectiveSearchMode === 'deep') {
    // Deep search mode using progressive SearchAPI + ChatGPT analysis (same as tester)
    console.log('Starting deep search mode with progressive SearchAPI + ChatGPT analysis...')
    
    try {
      console.log('Deep search - Phase 1: Initial comprehensive searches...')
      
      // Validate SearchAPI key
      if (!process.env.SEARCHAPI_KEY) {
        console.log('SearchAPI key not found, falling back to ChatGPT only...')
        throw new Error('SearchAPI key not configured')
      }
      
      // Phase 1: Initial search queries (same as tester)
      const initialSearchQueries = [
        `site:linkedin.com/in/ "${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}`,
        `"${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}${recipientRole ? ` "${recipientRole}"` : ''} professional background`,
        `"${recipientName}" education university college${recipientCompany ? ` OR "${recipientCompany}"` : ''}`,
        `"${recipientName}" career experience${recipientRole ? ` "${recipientRole}"` : ''}${recipientCompany ? ` "${recipientCompany}"` : ''}`
      ]
      
      console.log('Executing Phase 1 SearchAPI searches...')
      const phase1Results = []
      
      for (let i = 0; i < initialSearchQueries.length; i++) {
        const query = initialSearchQueries[i]
        try {
          console.log(`Phase 1 - Query ${i + 1}: ${query}`)
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
              phase: 1,
              queryIndex: i + 1
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
      
      // Phase 2: ChatGPT generates targeted searches (same as tester)
      console.log('Deep search - Phase 2: ChatGPT Generated Searches (Round 1)...')
      
      if (phase1Results.length === 0) {
        console.log('Skipping Phase 2 - no Phase 1 results')
        throw new Error('No Phase 1 results to base searches on')
      }
      
      const phase1Info = phase1Results.map((result: any) => 
        `**Title:** ${result.title}\n**Snippet:** ${result.snippet}\n**URL:** ${result.link}`
      ).join('\n\n---\n\n')
      
      const phase2QueryPrompt = `Based on the initial search results below about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}, generate 4 more specific and targeted Google search queries that would help gather deeper information about this person.

INITIAL SEARCH RESULTS:
${phase1Info}

INSTRUCTIONS:
- Generate 4 specific Google search queries that would uncover more detailed information
- Focus on areas that weren't fully covered in the initial searches
- Look for: achievements, publications, speaking engagements, projects, industry recognition, social media presence, interviews, news mentions
- Return ONLY the 4 search queries, one per line, no additional text

EXAMPLE FORMAT:
"John Doe" speaking engagements conferences
"John Doe" publications research papers
"John Doe" awards recognition
"John Doe" projects portfolio`

      const phase2Response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that generates targeted Google search queries. Return only the search queries, one per line.'
          },
          {
            role: 'user',
            content: phase2QueryPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })

      const phase2Queries = phase2Response.choices[0]?.message?.content?.trim().split('\n').filter(q => q.trim()) || []
      console.log('Phase 2 generated queries:', phase2Queries)
      
      // Execute Phase 2 searches
      const phase2Results = []
      
      for (let i = 0; i < phase2Queries.length; i++) {
        const query = phase2Queries[i]
        try {
          console.log(`Phase 2 - Query ${i + 1}: ${query}`)
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
              phase: 2,
              queryIndex: i + 1
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
      
      // Phase 2.5: ChatGPT generates second round of targeted searches (same as tester)
      console.log('Deep search - Phase 2.5: ChatGPT Generated Searches (Round 2)...')
      
      const allPhase1And2Results = [...phase1Results, ...phase2Results]
      
      if (allPhase1And2Results.length === 0) {
        console.log('Skipping Phase 2.5 - no previous results')
        throw new Error('No previous results to base searches on')
      }
      
      const allResultsInfo = allPhase1And2Results.map((result: any) => 
        `**Title:** ${result.title}\n**Snippet:** ${result.snippet}\n**URL:** ${result.link}`
      ).join('\n\n---\n\n')
      
      const phase2_5QueryPrompt = `Based on ALL the search results below about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}, generate 4 MORE specific and targeted Google search queries that would help gather the deepest and most comprehensive information about this person.

ALL PREVIOUS SEARCH RESULTS:
${allResultsInfo}

INSTRUCTIONS:
- Generate 4 MORE specific Google search queries that would uncover the deepest information
- Focus on areas that are STILL not fully covered after the previous searches
- Look for: recent news, industry trends, company performance, market analysis, professional networks, industry events, thought leadership, emerging opportunities
- These should be the MOST targeted and specific queries yet
- Return ONLY the 4 search queries, one per line, no additional text

EXAMPLE FORMAT:
"John Doe" 2024 market trends analysis
"John Doe" industry conference keynote
"John Doe" company performance metrics
"John Doe" professional network connections`

      const phase2_5Response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that generates highly targeted Google search queries. Return only the search queries, one per line.'
          },
          {
            role: 'user',
            content: phase2_5QueryPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })

      const phase2_5Queries = phase2_5Response.choices[0]?.message?.content?.trim().split('\n').filter(q => q.trim()) || []
      console.log('Phase 2.5 generated queries:', phase2_5Queries)
      
      // Execute Phase 2.5 searches
      const phase2_5Results = []
      
      for (let i = 0; i < phase2_5Queries.length; i++) {
        const query = phase2_5Queries[i]
        try {
          console.log(`Phase 2.5 - Query ${i + 1}: ${query}`)
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
              phase: 2.5,
              queryIndex: i + 1
            }))
            phase2_5Results.push(...queryResults)
          }
          
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (searchError) {
          console.error(`Error in Phase 2.5 SearchAPI search for query "${query}":`, searchError)
          continue
        }
      }
      
      console.log(`Phase 2.5 completed. Found ${phase2_5Results.length} results.`)
      
      // Final Phase: Generate comprehensive report using all search results (same as tester)
      console.log('Deep search - Final Phase: Generating comprehensive report with all search data...')
      
      const allSearchResults = [...phase1Results, ...phase2Results, ...phase2_5Results]
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
      
      // Compile all search information for final ChatGPT analysis (same as tester)
      const allSearchInfo = allSearchResults.map((result: any) => 
        `**Phase ${result.phase} Result**\n**Source:** ${result.title}\n**URL:** ${result.link}\n**Info:** ${result.snippet}\n**Search Query:** ${result.query}`
      ).join('\n\n---\n\n')
      
      // Generate final comprehensive report (same as tester)
      const finalReportPrompt = `Create a DETAILED and COMPREHENSIVE professional research report about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}.

${recipientLinkedIn ? `PROVIDED LINKEDIN URL: ${recipientLinkedIn}` : ''}
${linkedInUrl && linkedInUrl !== recipientLinkedIn ? `FOUND LINKEDIN URL: ${linkedInUrl}` : ''}

COMPREHENSIVE SEARCH RESULTS FROM 3-PHASE DEEP RESEARCH:
${allSearchInfo || 'Limited search results found'}

INSTRUCTIONS:
Create a comprehensive research report with the following sections:
1. **Professional Background** - Current role, company, and career overview
2. **Education & Credentials** - Academic background and qualifications
3. **Career Experience** - Key positions, companies, and responsibilities
4. **Achievements & Recognition** - Awards, publications, speaking engagements
5. **Recent Activities** - Latest projects, news, or developments
6. **Professional Interests** - Focus areas, expertise, and specializations
7. **Online Presence** - LinkedIn, social media, and digital footprint

Format the report with clear section headers using markdown. Be thorough but concise.`

      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional research analyst. Create detailed, well-structured research reports based on search results.'
          },
          {
            role: 'user',
            content: finalReportPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })

      researchFindings = finalResponse.choices[0]?.message?.content?.trim() || ''
      console.log('Final comprehensive report generated successfully')
      
    } catch (error) {
      console.error('Error in deep search mode:', error)
      // Fallback to basic search if deep search fails
      console.log('Falling back to basic search mode...')
      effectiveSearchMode = 'basic'
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
  prompt += `- Use the ${effectiveTone} tone appropriately\n`
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

    // Increment usage count for successful generation
    try {
      await supabase.rpc('increment_user_usage', { 
        user_uuid: userId, 
        usage_type: 'generation' 
      })
      console.log('Usage count incremented successfully')
    } catch (usageError) {
      console.error('Error incrementing usage count:', usageError)
      // Continue even if usage tracking fails
    }

    // Save the generated email to the database
    try {
      if (userId) {
        console.log('Saving email to database for user:', userId)
        console.log('Data to save:', {
          user_id: userId,
          recipient_name: recipientName,
          recipient_company: recipientCompany,
          recipient_role: recipientRole,
          purpose: purpose,
          search_mode: effectiveSearchMode,
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
            search_mode: effectiveSearchMode,
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