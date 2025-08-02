import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientName, recipientRole, company } = body

    if (!recipientName) {
      return NextResponse.json(
        { error: 'Recipient name is required' },
        { status: 400 }
      )
    }

    // Check if SearchAPI key is available
    if (!process.env.SEARCHAPI_KEY) {
      return NextResponse.json(
        { error: 'SearchAPI key not configured' },
        { status: 500 }
      )
    }

    const searchQueries = [
      `${recipientName} ${company || ''} ${recipientRole || ''}`,
      `${recipientName} LinkedIn`,
      `${recipientName} education background`,
      `${recipientName} recent projects deals`,
      `${recipientName} awards achievements`
    ]

    let allFindings: string[] = []

    // Search for each query using SearchAPI
    for (const query of searchQueries) {
      try {
        const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&num=5`, {
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
        }
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error)
      }
    }

    // Process and extract relevant information
    const processedFindings = processFindings(allFindings, recipientName, recipientRole, company)

    return NextResponse.json({
      findings: processedFindings,
      rawFindings: allFindings.slice(0, 10), // Return first 10 raw findings for debugging
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error researching recipient:', error)
    return NextResponse.json(
      { error: 'Failed to research recipient' },
      { status: 500 }
    )
  }
}

function processFindings(findings: string[], name: string, role?: string, company?: string) {
  const processed: {
    education: string[]
    experience: string[]
    achievements: string[]
    recentWork: string[]
    personalInfo: string[]
  } = {
    education: [],
    experience: [],
    achievements: [],
    recentWork: [],
    personalInfo: []
  }

  findings.forEach(finding => {
    const lowerFinding = finding.toLowerCase()
    const lowerName = name.toLowerCase()

    // Skip if finding doesn't contain the person's name
    if (!lowerFinding.includes(lowerName)) return

    // Education
    if (lowerFinding.includes('university') || lowerFinding.includes('college') || 
        lowerFinding.includes('bachelor') || lowerFinding.includes('master') || 
        lowerFinding.includes('phd') || lowerFinding.includes('mba')) {
      processed.education.push(finding)
    }

    // Experience
    if (lowerFinding.includes('experience') || lowerFinding.includes('worked') || 
        lowerFinding.includes('joined') || lowerFinding.includes('previously') ||
        lowerFinding.includes('former') || lowerFinding.includes('current')) {
      processed.experience.push(finding)
    }

    // Achievements
    if (lowerFinding.includes('award') || lowerFinding.includes('achievement') || 
        lowerFinding.includes('recognized') || lowerFinding.includes('featured') ||
        lowerFinding.includes('successful') || lowerFinding.includes('led')) {
      processed.achievements.push(finding)
    }

    // Recent work
    if (lowerFinding.includes('recent') || lowerFinding.includes('latest') || 
        lowerFinding.includes('current') || lowerFinding.includes('project') ||
        lowerFinding.includes('deal') || lowerFinding.includes('launch')) {
      processed.recentWork.push(finding)
    }

    // Personal info
    if (lowerFinding.includes('based') || lowerFinding.includes('location') || 
        lowerFinding.includes('interests') || lowerFinding.includes('passionate') ||
        lowerFinding.includes('focus') || lowerFinding.includes('specializes')) {
      processed.personalInfo.push(finding)
    }
  })

  // Remove duplicates and limit results
  Object.keys(processed).forEach(key => {
    processed[key as keyof typeof processed] = [...new Set(processed[key as keyof typeof processed])].slice(0, 3)
  })

  return processed
} 