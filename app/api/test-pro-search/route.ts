import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  console.log('=== Pro Search Tester Started ===')
  
  // Check environment variables
  console.log('Environment check:')
  console.log('- SEARCHAPI_KEY exists:', !!process.env.SEARCHAPI_KEY)
  console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
  console.log('- NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  // Parse request body
  let body
  try {
    body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
  } catch (error) {
    console.error('Error parsing request body:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  
  const {
    recipientName = 'John Doe',
    recipientCompany = 'Google',
    recipientRole = 'Software Engineer',
    searchMode = 'deep',
    testPhase = 'all' // 'phase1', 'phase2', 'phase3', 'all'
  } = body

  console.log('Test parameters:')
  console.log('- recipientName:', recipientName)
  console.log('- recipientCompany:', recipientCompany)
  console.log('- recipientRole:', recipientRole)
  console.log('- searchMode:', searchMode)
  console.log('- testPhase:', testPhase)

  // Initialize Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: any = {
    testInfo: {
      timestamp: new Date().toISOString(),
      searchMode,
      testPhase,
      recipientName,
      recipientCompany,
      recipientRole
    },
    phase1: null,
    phase2: null,
    phase3: null,
    finalReport: null,
    errors: []
  }

  try {
    // Phase 1: Initial SearchAPI searches
    if (testPhase === 'all' || testPhase === 'phase1') {
      console.log('=== PHASE 1: Initial SearchAPI Searches ===')
      
      const initialSearchQueries = [
        `site:linkedin.com/in/ "${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}`,
        `"${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}${recipientRole ? ` "${recipientRole}"` : ''} professional background`,
        `"${recipientName}" education university college${recipientCompany ? ` OR "${recipientCompany}"` : ''}`,
        `"${recipientName}" career experience${recipientRole ? ` "${recipientRole}"` : ''}${recipientCompany ? ` "${recipientCompany}"` : ''}`
      ]

      console.log('Phase 1 queries:', initialSearchQueries)
      
      const phase1Results = []
      
      for (let i = 0; i < initialSearchQueries.length; i++) {
        const query = initialSearchQueries[i]
        console.log(`Phase 1 - Query ${i + 1}: ${query}`)
        
        try {
          const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=5`)
          
          console.log(`Phase 1 - Query ${i + 1} response status:`, response.status)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`Phase 1 - Query ${i + 1} failed:`, response.status, errorText)
            results.errors.push(`Phase 1 Query ${i + 1} failed: ${response.status} - ${errorText}`)
            continue
          }
          
          const data = await response.json()
          console.log(`Phase 1 - Query ${i + 1} results count:`, data.organic_results?.length || 0)
          
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
          console.error(`Phase 1 - Query ${i + 1} error:`, searchError)
          results.errors.push(`Phase 1 Query ${i + 1} error: ${searchError}`)
          continue
        }
      }
      
      results.phase1 = {
        queries: initialSearchQueries,
        results: phase1Results,
        totalResults: phase1Results.length
      }
      
      console.log(`Phase 1 completed. Found ${phase1Results.length} results.`)
    }

    // Phase 2: ChatGPT generates targeted searches
    if (testPhase === 'all' || testPhase === 'phase2') {
      console.log('=== PHASE 2: ChatGPT Generated Searches ===')
      
      if (!results.phase1 || results.phase1.results.length === 0) {
        console.log('Skipping Phase 2 - no Phase 1 results')
        results.phase2 = { error: 'No Phase 1 results to base searches on' }
      } else {
        const phase1Info = results.phase1.results.map((result: any) => 
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

        console.log('Phase 2 prompt:', phase2QueryPrompt)
        
        try {
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
            console.log(`Phase 2 - Query ${i + 1}: ${query}`)
            
            try {
              const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=5`)
              
              console.log(`Phase 2 - Query ${i + 1} response status:`, response.status)
              
              if (!response.ok) {
                const errorText = await response.text()
                console.error(`Phase 2 - Query ${i + 1} failed:`, response.status, errorText)
                results.errors.push(`Phase 2 Query ${i + 1} failed: ${response.status} - ${errorText}`)
                continue
              }
              
              const data = await response.json()
              console.log(`Phase 2 - Query ${i + 1} results count:`, data.organic_results?.length || 0)
              
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
              console.error(`Phase 2 - Query ${i + 1} error:`, searchError)
              results.errors.push(`Phase 2 Query ${i + 1} error: ${searchError}`)
              continue
            }
          }
          
          results.phase2 = {
            generatedQueries: phase2Queries,
            results: phase2Results,
            totalResults: phase2Results.length
          }
          
          console.log(`Phase 2 completed. Found ${phase2Results.length} results.`)
        } catch (error) {
          console.error('Phase 2 ChatGPT error:', error)
          results.phase2 = { error: `ChatGPT error: ${error}` }
          results.errors.push(`Phase 2 ChatGPT error: ${error}`)
        }
      }
    }

    // Phase 3: ChatGPT generates final report
    if (testPhase === 'all' || testPhase === 'phase3') {
      console.log('=== PHASE 3: Final Report Generation ===')
      
      const allResults = [
        ...(results.phase1?.results || []),
        ...(results.phase2?.results || [])
      ]
      
      if (allResults.length === 0) {
        console.log('Skipping Phase 3 - no search results')
        results.phase3 = { error: 'No search results to analyze' }
      } else {
        const allResultsInfo = allResults.map((result: any) => 
          `**Title:** ${result.title}\n**Snippet:** ${result.snippet}\n**URL:** ${result.link}\n**Query:** ${result.query}\n**Phase:** ${result.phase}`
        ).join('\n\n---\n\n')
        
        const finalReportPrompt = `Based on the comprehensive search results below about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}, create a detailed professional research report.

SEARCH RESULTS:
${allResultsInfo}

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

        console.log('Phase 3 prompt length:', finalReportPrompt.length)
        
        try {
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

          const finalReport = finalResponse.choices[0]?.message?.content?.trim()
          console.log('Final report generated, length:', finalReport?.length)
          
          results.phase3 = {
            report: finalReport,
            reportLength: finalReport?.length || 0
          }
          
          console.log('Phase 3 completed.')
        } catch (error) {
          console.error('Phase 3 ChatGPT error:', error)
          results.phase3 = { error: `ChatGPT error: ${error}` }
          results.errors.push(`Phase 3 ChatGPT error: ${error}`)
        }
      }
    }

    // Summary
    results.summary = {
      totalSearchResults: (results.phase1?.totalResults || 0) + (results.phase2?.totalResults || 0),
      totalErrors: results.errors.length,
      success: results.errors.length === 0
    }

    console.log('=== Pro Search Tester Completed ===')
    console.log('Summary:', results.summary)

    return NextResponse.json(results)

  } catch (error) {
    console.error('Pro Search Tester error:', error)
    results.errors.push(`Main error: ${error}`)
    return NextResponse.json(results, { status: 500 })
  }
} 