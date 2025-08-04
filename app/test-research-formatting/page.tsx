'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ReactMarkdown from 'react-markdown'

export default function TestResearchFormatting() {
  const [testMode, setTestMode] = useState<'pro' | 'basic'>('pro')
  const [recipientName, setRecipientName] = useState('mark chong')
  const [recipientCompany, setRecipientCompany] = useState('cdw')
  const [recipientRole, setRecipientRole] = useState('svp')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    researchFindings: string
    commonalities: string
    rawResponse: any
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testResearchGeneration = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName,
          recipientCompany,
          recipientRole,
          purpose: 'Networking',
          tone: 'Professional',
          searchMode: testMode,
          userProfile: {
            full_name: 'Test User',
            job_title: 'Software Engineer',
            company: 'Tech Corp',
            education: { school: 'MIT' },
            background: 'Software development',
            skills: ['JavaScript', 'React'],
            interests: ['AI', 'Machine Learning']
          }
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate research')
      }

      setResults({
        researchFindings: data.researchFindings || '',
        commonalities: data.commonalities || '',
        rawResponse: data
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const testSpacingFunction = () => {
    const testText = `# Research Report: mark chong

## Overview

mark chong works at cdw as svp.

## **1. Professional Background**

mark chong is the Senior Vice President of Product & Partner Management at CDW, managing crucial relationships with technology partners.

## **2. Education & Credentials**

mark chong holds an MBA from the Wharton School at the University of Pennsylvania and a bachelor's degree in Physics from the University of Chicago.

## **3. Recent Achievements & News**

In January 2024, mark chong transitioned to his current role as Senior Vice President of Product & Partner Management.

## **4. Professional Interests & Focus Areas**

mark chong's main areas of expertise include product management, partner relations, and integration management.

## **5. Company Role & Responsibilities**

At CDW, mark chong oversees the development and management of partner relationships and strategic initiatives.

## **6. Public Presence & Thought Leadership**

mark chong has served as past Chair of the Board of Directors for the Make-A-Wish Foundation.`

    // Test the spacing function logic
    const lines = testText.split('\n')
    const processedLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isBoldLine = line.includes('**') || line.startsWith('#') || line.startsWith('##')
      
      // Add empty line before bold lines (if not at start and previous line isn't empty)
      if (isBoldLine && i > 0 && lines[i - 1].trim() !== '') {
        processedLines.push('')
      }
      
      // Add the current line
      processedLines.push(line)
      
      // Add empty line after bold lines (if not at end and next line isn't empty)
      if (isBoldLine && i < lines.length - 1 && lines[i + 1].trim() !== '') {
        processedLines.push('')
      }
    }
    
    const processedText = processedLines.join('\n').replace(/\n\n\n/g, '\n\n')
    
    setResults({
      researchFindings: processedText,
      commonalities: 'Test spacing function completed',
      rawResponse: { processedText }
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Research Formatting Tester</h1>
        <p className="text-gray-600">Debug research findings spacing and formatting issues</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testMode">Test Mode</Label>
              <Select value={testMode} onValueChange={(value: 'pro' | 'basic') => setTestMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">Pro Search</SelectItem>
                  <SelectItem value="basic">Basic Search</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Textarea
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient name"
              />
            </div>
            <div>
              <Label htmlFor="recipientCompany">Recipient Company</Label>
              <Textarea
                id="recipientCompany"
                value={recipientCompany}
                onChange={(e) => setRecipientCompany(e.target.value)}
                placeholder="Enter recipient company"
              />
            </div>
            <div>
              <Label htmlFor="recipientRole">Recipient Role</Label>
              <Textarea
                id="recipientRole"
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                placeholder="Enter recipient role"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={testResearchGeneration} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Testing...' : `Test ${testMode === 'pro' ? 'Pro' : 'Basic'} Research Generation`}
            </Button>
            <Button 
              onClick={testSpacingFunction} 
              variant="outline"
              className="flex-1"
            >
              Test Spacing Function
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Findings (Raw)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{results.researchFindings}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Research Findings (Rendered)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-md border prose prose-sm max-w-none [&>*]:mb-4 [&>*:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2:first-of-type]:mt-0 [&_p]:mb-4 [&_p:last-child]:mb-0">
                <ReactMarkdown>
                  {results.researchFindings}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commonalities (Raw)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{results.commonalities}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commonalities (Rendered)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-md border prose prose-sm max-w-none [&>*]:mb-4 [&>*:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2:first-of-type]:mt-0 [&_p]:mb-4 [&_p:last-child]:mb-0">
                <ReactMarkdown>
                  {results.commonalities}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Raw API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-xs overflow-auto">
                  {JSON.stringify(results.rawResponse, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 