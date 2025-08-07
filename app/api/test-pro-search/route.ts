import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('=== Pro Search Tester Started ===')
  
  // Environment checks
  const envChecks = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    SEARCHAPI_KEY: !!process.env.SEARCHAPI_KEY,
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  }
  
  console.log('Environment checks:', envChecks)
  
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }
  
  if (!process.env.SEARCHAPI_KEY) {
    return NextResponse.json({ error: 'SEARCHAPI_KEY not configured' }, { status: 500 })
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // Initialize results object outside try block so it's accessible in all catch blocks
  let results: any = {
    testInfo: {
      timestamp: new Date().toISOString(),
      searchMode: 'unknown',
      testPhase: 'unknown',
      recipientName: 'unknown',
      recipientCompany: 'unknown',
      recipientRole: 'unknown',
      environmentChecks: envChecks,
      validationTests: null
    },
    phase1: null,
    phase2: null,
    phase2_5: null,
    phase3: null,
    finalReport: null,
    errors: [],
    databaseSimulation: null
  }

  try {
    const body = await request.json()
    const { 
      recipientName, 
      recipientCompany, 
      recipientRole, 
      searchMode = 'deep',
      testPhase = 'all',
      simulateDatabase = false,
      validateSearchMode = true
    } = body

    console.log('Request body:', { recipientName, recipientCompany, recipientRole, searchMode, testPhase, simulateDatabase, validateSearchMode })

    // Update results with actual values
    results.testInfo.searchMode = searchMode
    results.testInfo.testPhase = testPhase
    results.testInfo.recipientName = recipientName
    results.testInfo.recipientCompany = recipientCompany
    results.testInfo.recipientRole = recipientRole
    results.testInfo.validationTests = validateSearchMode ? {
      exactMatch: searchMode === 'deep',
      includesDeep: searchMode?.includes('deep'),
      startsWithDeep: searchMode?.startsWith('deep'),
      endsWithDeep: searchMode?.endsWith('deep'),
      toLowerCase: searchMode?.toLowerCase() === 'deep',
      trim: searchMode?.trim() === 'deep',
      regexTest: /^deep$/.test(searchMode),
      arrayIncludes: ['basic', 'deep'].includes(searchMode)
    } : null
    results.databaseSimulation = simulateDatabase ? {
      searchModeValidation: {
        received: searchMode,
        type: typeof searchMode,
        length: searchMode?.length,
        isValid: ['basic', 'deep'].includes(searchMode)
      }
    } : null

    // Validate searchMode format (exactly like the real Pro search)
    if (validateSearchMode) {
      console.log('=== VALIDATING SEARCH MODE ===')
      console.log('Search mode received:', searchMode)
      console.log('Search mode type:', typeof searchMode)
      console.log('Search mode length:', searchMode?.length)
      
      // Test different validation patterns
      const validationTests = {
        exactMatch: searchMode === 'deep',
        includesDeep: searchMode?.includes('deep'),
        startsWithDeep: searchMode?.startsWith('deep'),
        endsWithDeep: searchMode?.endsWith('deep'),
        toLowerCase: searchMode?.toLowerCase() === 'deep',
        trim: searchMode?.trim() === 'deep',
        regexTest: /^deep$/.test(searchMode),
        arrayIncludes: ['basic', 'deep'].includes(searchMode),
        switchTest: (() => {
          switch(searchMode) {
            case 'deep': return true
            case 'basic': return true
            default: return false
          }
        })()
      }
      
      console.log('Validation test results:', validationTests)
      
      // Simulate database constraint validation
      if (simulateDatabase) {
        console.log('=== SIMULATING DATABASE VALIDATION ===')
        
        // Test what the database might be expecting
        const dbValidationTests = {
          checkConstraint: searchMode === 'basic' || searchMode === 'deep',
          enumValidation: ['basic', 'deep'].includes(searchMode),
          stringPattern: /^(basic|deep)$/.test(searchMode),
          lengthCheck: searchMode.length <= 10,
          notNull: searchMode !== null && searchMode !== undefined
        }
        
        console.log('Database validation tests:', dbValidationTests)
        
        // Simulate potential database errors
        if (!dbValidationTests.checkConstraint) {
          console.error('DATABASE CONSTRAINT ERROR: searchMode must be "basic" or "deep"')
          return NextResponse.json({ 
            error: 'string didn\'t match expected pattern',
            details: {
              received: searchMode,
              expected: ['basic', 'deep'],
              validationTests: dbValidationTests
            }
          }, { status: 400 })
        }
      }
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
      // Phase 1: Initial SearchAPI searches (same as email generator)
      if (testPhase === 'all' || testPhase === 'phase1') {
        console.log('=== PHASE 1: Initial SearchAPI Searches (same as email generator) ===')
        
        // Phase 1: Initial search queries (reduced to 3 for speed) - EXACT SAME AS EMAIL GENERATOR
        const initialSearchQueries = [
          `site:linkedin.com/in/ "${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}`,
          `"${recipientName}"${recipientCompany ? ` "${recipientCompany}"` : ''}${recipientRole ? ` "${recipientRole}"` : ''} professional background`,
          `"${recipientName}" education university college${recipientCompany ? ` OR "${recipientCompany}"` : ''}`
        ]
        
        console.log('Phase 1 queries (same as email generator):', initialSearchQueries)
        
        const phase1Results = []
        
        for (let i = 0; i < initialSearchQueries.length; i++) {
          const query = initialSearchQueries[i]
          try {
            console.log(`Phase 1 - Query ${i + 1}: ${query}`)
            const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=3`)
            
            if (!response.ok) {
              console.error(`SearchAPI request failed for query "${query}":`, response.status, response.statusText)
              continue
            }
            
            const data = await response.json()
            
            if (data.organic_results && data.organic_results.length > 0) {
              const queryResults = data.organic_results.slice(0, 2).map((result: any) => ({
                title: result.title,
                snippet: result.snippet,
                link: result.link,
                query: query,
                phase: 1,
                queryIndex: i + 1
              }))
              phase1Results.push(...queryResults)
            }
            
            await new Promise(resolve => setTimeout(resolve, 100)) // Reduced delay - SAME AS EMAIL GENERATOR
          } catch (searchError) {
            console.error(`Error in Phase 1 SearchAPI search for query "${query}":`, searchError)
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

      // Phase 2: ChatGPT generates targeted searches (same as email generator)
      if (testPhase === 'all' || testPhase === 'phase2') {
        console.log('=== PHASE 2: ChatGPT Generated Searches (same as email generator) ===')
        
        if (!results.phase1 || results.phase1.results.length === 0) {
          console.log('Skipping Phase 2 - no Phase 1 results')
          results.phase2 = { error: 'No Phase 1 results to base searches on' }
        } else {
          const phase1Info = results.phase1.results.map((result: any) => 
            `**Title:** ${result.title}\n**Snippet:** ${result.snippet}\n**URL:** ${result.link}`
          ).join('\n\n---\n\n')
          
          // EXACT SAME PROMPT AS EMAIL GENERATOR
          const phase2QueryPrompt = `Based on the initial search results below about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}, generate 2 more specific and targeted Google search queries that would help gather deeper information about this person.

INITIAL SEARCH RESULTS:
${phase1Info}

INSTRUCTIONS:
- Generate 2 specific Google search queries that would uncover more detailed information
- Focus on areas that weren't fully covered in the initial searches
- Look for: achievements, publications, speaking engagements, projects, industry recognition
- Return ONLY the 2 search queries, one per line, no additional text

EXAMPLE FORMAT:
"John Doe" speaking engagements conferences
"John Doe" publications research papers`

          console.log('Phase 2 prompt (same as email generator):', phase2QueryPrompt)
          
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
              max_tokens: 100, // Reduced for speed - SAME AS EMAIL GENERATOR
              temperature: 0.7
            })

            const phase2Queries = phase2Response.choices[0]?.message?.content?.trim().split('\n').filter(q => q.trim()) || []
            console.log('Phase 2 generated queries (same as email generator):', phase2Queries)
            
            // Execute Phase 2 searches (same as email generator)
            const phase2Results = []
            
            for (let i = 0; i < phase2Queries.length; i++) {
              const query = phase2Queries[i]
              try {
                console.log(`Phase 2 - Query ${i + 1}: ${query}`)
                const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=3`)
                
                if (!response.ok) {
                  console.error(`SearchAPI request failed for query "${query}":`, response.status, response.statusText)
                  continue
                }
                
                const data = await response.json()
                
                if (data.organic_results && data.organic_results.length > 0) {
                  const queryResults = data.organic_results.slice(0, 2).map((result: any) => ({
                    title: result.title,
                    snippet: result.snippet,
                    link: result.link,
                    query: query,
                    phase: 2,
                    queryIndex: i + 1
                  }))
                  phase2Results.push(...queryResults)
                }
                
                await new Promise(resolve => setTimeout(resolve, 100)) // Reduced delay - SAME AS EMAIL GENERATOR
              } catch (searchError) {
                console.error(`Error in Phase 2 SearchAPI search for query "${query}":`, searchError)
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

      // Phase 3: Generate final report (same as email generator)
      if (testPhase === 'all' || testPhase === 'phase3') {
        console.log('=== PHASE 3: Final Report Generation (same as email generator) ===')
        
        const allSearchResults = [
          ...(results.phase1?.results || []),
          ...(results.phase2?.results || [])
        ]
        
        if (allSearchResults.length === 0) {
          console.log('No search results to generate report from')
          results.phase3 = { error: 'No search results to generate report from' }
        } else {
          // Compile all search information for final ChatGPT analysis (same as email generator)
          const allSearchInfo = allSearchResults.map((result: any) => 
            `**Phase ${result.phase} Result**\n**Source:** ${result.title}\n**URL:** ${result.link}\n**Info:** ${result.snippet}\n**Search Query:** ${result.query}`
          ).join('\n\n---\n\n')
          
          // Generate final comprehensive report (optimized for speed) - EXACT SAME AS EMAIL GENERATOR
          const finalReportPrompt = `Create a DETAILED professional research report about ${recipientName}${recipientCompany ? ` who works at ${recipientCompany}` : ''}${recipientRole ? ` as ${recipientRole}` : ''}.

SEARCH RESULTS FROM DEEP RESEARCH:
${allSearchInfo || 'Limited search results found'}

INSTRUCTIONS:
Create a comprehensive research report with these sections:
1. **Professional Background** - Current role, company, and career overview
2. **Education & Credentials** - Academic background and qualifications
3. **Career Experience** - Key positions, companies, and responsibilities
4. **Achievements & Recognition** - Awards, publications, speaking engagements
5. **Recent Activities** - Latest projects, news, or developments

Format with clear section headers using markdown. Be thorough but concise.`

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
              max_tokens: 1000, // Reduced for speed - SAME AS EMAIL GENERATOR
              temperature: 0.3
            })

            const finalReport = finalResponse.choices[0]?.message?.content?.trim() || ''
            
            results.phase3 = {
              report: finalReport,
              reportLength: finalReport.length
            }
            
            console.log('Final comprehensive report generated successfully (same as email generator)')
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
  } catch (error) {
    console.error('Pro Search Tester error:', error)
    results.errors.push(`Main error: ${error}`)
    return NextResponse.json(results, { status: 500 })
  }
} 