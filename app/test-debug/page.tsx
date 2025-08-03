'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Bug, CheckCircle, XCircle } from 'lucide-react'

export default function TestDebugPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  // Test data
  const [testData, setTestData] = useState({
    recipientName: 'Larry Ellison',
    recipientCompany: 'Oracle',
    recipientRole: 'CTO',
    purpose: 'Want to network',
    tone: 'Casual & Friendly',
    searchMode: 'deep'
  })

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
    setError('')
    setResult(null)
  }

  const testEmailGeneration = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)
    addLog('Starting email generation test...')
    addLog(`Test data: ${JSON.stringify(testData, null, 2)}`)

    try {
      addLog('Making API request to /api/generate-email...')
      
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      addLog(`Response status: ${response.status}`)
      addLog(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`)

      const responseText = await response.text()
      addLog(`Raw response: ${responseText}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }

      const data = JSON.parse(responseText)
      addLog('Response parsed successfully')
      addLog(`Response data keys: ${Object.keys(data).join(', ')}`)
      
      setResult(data)
      addLog('Test completed successfully!')
      
      toast({
        title: "Test Successful",
        description: "Email generation test completed successfully",
      })

    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred'
      addLog(`ERROR: ${errorMessage}`)
      setError(errorMessage)
      
      toast({
        title: "Test Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testBasicSearch = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)
    addLog('Testing basic search mode with GPT-4o-mini...')

    try {
      const testDataBasic = { ...testData, searchMode: 'basic' }
      addLog(`Test data: ${JSON.stringify(testDataBasic, null, 2)}`)

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testDataBasic),
      })

      addLog(`Response status: ${response.status}`)
      const responseText = await response.text()
      addLog(`Raw response: ${responseText}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }

      const data = JSON.parse(responseText)
      setResult(data)
      addLog('Basic search test completed successfully!')

    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred'
      addLog(`ERROR: ${errorMessage}`)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const testProSearch = async () => {
    setIsLoading(true)
    setLogs(prev => [...prev, 'Testing Pro Search (GPT-4.1)...'])
    
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: 'John Smith',
          recipientCompany: 'Google',
          recipientRole: 'Senior Product Manager',
          purpose: 'Networking and informational interview',
          tone: 'casual',
          searchMode: 'deep'
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setLogs(prev => [...prev, '✅ Pro Search successful!'])
        setLogs(prev => [...prev, `Email: ${data.email}`])
        setLogs(prev => [...prev, `Research: ${data.researchFindings}`])
        setLogs(prev => [...prev, `Commonalities: ${data.commonalities}`])
      } else {
        setLogs(prev => [...prev, `❌ Pro Search failed: ${data.error}`])
      }
    } catch (error) {
      setLogs(prev => [...prev, `❌ Pro Search error: ${error}`])
    } finally {
      setIsLoading(false)
    }
  }

  const testGPT41WebSearch = async () => {
    setIsLoading(true)
    setLogs(prev => [...prev, 'Testing GPT-4.1 Web Search Preview...'])
    
    try {
      const response = await fetch('/api/test-gpt41-websearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'John Smith Google Senior Product Manager'
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setLogs(prev => [...prev, '✅ GPT-4.1 Web Search successful!'])
        setLogs(prev => [...prev, `Response: ${JSON.stringify(data, null, 2)}`])
      } else {
        setLogs(prev => [...prev, `❌ GPT-4.1 Web Search failed: ${data.error}`])
      }
    } catch (error) {
      setLogs(prev => [...prev, `❌ GPT-4.1 Web Search error: ${error}`])
    } finally {
      setIsLoading(false)
    }
  }

  const testOpenAIAPI = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)
    addLog('Testing OpenAI API directly...')

    try {
      const response = await fetch('/api/test-openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello, this is a test message'
        }),
      })

      addLog(`Response status: ${response.status}`)
      const responseText = await response.text()
      addLog(`Raw response: ${responseText}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }

      const data = JSON.parse(responseText)
      setResult(data)
      addLog('OpenAI API test completed successfully!')

    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred'
      addLog(`ERROR: ${errorMessage}`)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Bug className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">API Test & Debug</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  value={testData.recipientName}
                  onChange={(e) => setTestData(prev => ({ ...prev, recipientName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="recipientCompany">Company</Label>
                <Input
                  id="recipientCompany"
                  value={testData.recipientCompany}
                  onChange={(e) => setTestData(prev => ({ ...prev, recipientCompany: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="recipientRole">Role</Label>
                <Input
                  id="recipientRole"
                  value={testData.recipientRole}
                  onChange={(e) => setTestData(prev => ({ ...prev, recipientRole: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={testData.purpose}
                  onChange={(e) => setTestData(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={testData.tone} onValueChange={(value) => setTestData(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casual & Friendly">Casual & Friendly</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="searchMode">Search Mode</Label>
                <Select value={testData.searchMode} onValueChange={(value) => setTestData(prev => ({ ...prev, searchMode: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Search</SelectItem>
                    <SelectItem value="deep">Deep Search (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={testEmailGeneration} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test Email Generation
                </Button>
                
                <Button 
                  onClick={testBasicSearch} 
                  disabled={isLoading}
                  variant="outline"
                >
                  Test Basic Search (GPT-4o-mini)
                </Button>
              </div>

              <Button 
                onClick={testProSearch} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Test Pro Search (GPT-4.1)
              </Button>

              <Button 
                onClick={testGPT41WebSearch} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Test GPT-4.1 Web Search Preview
              </Button>

              <Button 
                onClick={testOpenAIAPI} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Test OpenAI API
              </Button>

              <Button 
                onClick={clearLogs} 
                variant="destructive"
                className="w-full"
              >
                Clear Logs
              </Button>
            </CardContent>
          </Card>

          {/* Logs and Results */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900">Error:</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  {logs.length === 0 ? (
                    <p className="text-gray-500">No logs yet. Run a test to see debug information.</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>

                {result && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Result:</h3>
                    <div className="bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 