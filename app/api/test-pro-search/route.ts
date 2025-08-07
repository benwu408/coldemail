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
        console.log('=== PHASE 2: ChatGPT Generated Searches (Round 1) ===')
        
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

      // Phase 2.5: ChatGPT generates second round of targeted searches
      if (testPhase === 'all' || testPhase === 'phase2') {
        console.log('=== PHASE 2.5: ChatGPT Generated Searches (Round 2) ===')
        
        const allPhase1And2Results = [
          ...(results.phase1?.results || []),
          ...(results.phase2?.results || [])
        ]
        
        if (allPhase1And2Results.length === 0) {
          console.log('Skipping Phase 2.5 - no previous results')
          results.phase2_5 = { error: 'No previous results to base searches on' }
        } else {
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

          console.log('Phase 2.5 prompt length:', phase2_5QueryPrompt.length)
          
          try {
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
              console.log(`Phase 2.5 - Query ${i + 1}: ${query}`)
              
              try {
                const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_KEY}&num=5`)
                
                console.log(`Phase 2.5 - Query ${i + 1} response status:`, response.status)
                
                if (!response.ok) {
                  const errorText = await response.text()
                  console.error(`Phase 2.5 - Query ${i + 1} failed:`, response.status, errorText)
                  results.errors.push(`Phase 2.5 Query ${i + 1} failed: ${response.status} - ${errorText}`)
                  continue
                }
                
                const data = await response.json()
                console.log(`Phase 2.5 - Query ${i + 1} results count:`, data.organic_results?.length || 0)
                
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
                console.error(`Phase 2.5 - Query ${i + 1} error:`, searchError)
                results.errors.push(`Phase 2.5 Query ${i + 1} error: ${searchError}`)
                continue
              }
            }
            
            results.phase2_5 = {
              generatedQueries: phase2_5Queries,
              results: phase2_5Results,
              totalResults: phase2_5Results.length
            }
            
            console.log(`Phase 2.5 completed. Found ${phase2_5Results.length} results.`)
          } catch (error) {
            console.error('Phase 2.5 ChatGPT error:', error)
            results.phase2_5 = { error: `ChatGPT error: ${error}` }
            results.errors.push(`Phase 2.5 ChatGPT error: ${error}`)
          }
        }
      }

      // Phase 3: ChatGPT generates final report
      if (testPhase === 'all' || testPhase === 'phase3') {
        console.log('=== PHASE 3: Final Report Generation ===')
        
        const allResults = [
          ...(results.phase1?.results || []),
          ...(results.phase2?.results || []),
          ...(results.phase2_5?.results || [])
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
        totalSearchResults: (results.phase1?.totalResults || 0) + (results.phase2?.totalResults || 0) + (results.phase2_5?.totalResults || 0),
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