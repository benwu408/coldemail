import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      recipientName,
      recipientCompany,
      recipientRole,
      recipientLinkedIn,
      searchMode
    } = body

    // Validate required fields
    if (!recipientName) {
      return NextResponse.json(
        { error: 'Recipient name is required' },
        { status: 400 }
      )
    }

    if (searchMode !== 'deep') {
      return NextResponse.json(
        { error: 'This endpoint is only for deep search mode' },
        { status: 400 }
      )
    }

    console.log('=== Research Generation Started ===')
    console.log('Recipient:', recipientName, recipientCompany, recipientRole)
    console.log('Search Mode:', searchMode)

    let researchFindings = ''

    // Deep search mode using comprehensive 3-phase progressive SearchAPI + ChatGPT analysis
    console.log('Starting comprehensive deep search mode with 3-phase progressive search...')
    
    try {
      console.log('Deep search - Phase 1: Initial comprehensive searches...')
      
      // Validate SearchAPI key
      if (!process.env.SEARCHAPI_KEY) {
        console.log('SearchAPI key not found, falling back to ChatGPT only...')
        throw new Error('SearchAPI key not configured')
      }
      
      // Phase 1: Initial search queries (4 queries)
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
      
      // Phase 2: ChatGPT generates targeted searches (4 queries)
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
      
      // Phase 2.5: ChatGPT generates second round of targeted searches (4 queries)
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
      
      // Final Phase: Generate comprehensive report using all search results
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
      throw new Error(`Deep search failed: ${error}`)
    }

    return NextResponse.json({
      success: true,
      researchFindings,
      searchMode: 'deep',
      totalSearches: 12,
      message: 'Research report generated successfully'
    })

  } catch (error) {
    console.error('Research generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate research report', details: error },
      { status: 500 }
    )
  }
} 