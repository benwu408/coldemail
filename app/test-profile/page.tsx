'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Loader2, CheckCircle, XCircle, Bug } from 'lucide-react'
import Header from '@/components/Header'

interface TestProfileData {
  full_name: string
  job_title: string
  company: string
  education: {
    school: string
    degree: string
    major: string
    graduation_year: string
  }
  location: string
  industry: string
  experience_years: string
  skills: string[]
  interests: string[]
  background: string
  linkedin_url: string
  website: string
}

function TestProfileContent() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [testData, setTestData] = useState<TestProfileData>({
    full_name: 'John Doe',
    job_title: 'Software Engineer',
    company: 'Test Company',
    education: {
      school: 'Test University',
      degree: 'Bachelor\'s',
      major: 'Computer Science',
      graduation_year: '2020'
    },
    location: 'San Francisco, CA',
    industry: 'Technology',
    experience_years: '3-5 years',
    skills: ['JavaScript', 'React', 'Node.js'],
    interests: ['AI', 'Startups'],
    background: 'Experienced software engineer with focus on web development.',
    linkedin_url: 'https://linkedin.com/in/johndoe',
    website: 'https://johndoe.com'
  })

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testProfileLoad = async () => {
    setIsLoading(true)
    addLog('=== Testing Profile Load ===')
    
    try {
      addLog(`User ID: ${user?.id}`)
      addLog(`User email: ${user?.email}`)
      
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      addLog(`Response status: ${response.status}`)
      const responseText = await response.text()
      addLog(`Raw response: ${responseText}`)

      if (response.ok) {
        const data = JSON.parse(responseText)
        addLog('✅ Profile load successful')
        addLog(`Profile data: ${JSON.stringify(data, null, 2)}`)
      } else {
        addLog(`❌ Profile load failed: ${response.status}`)
        addLog(`Error response: ${responseText}`)
      }
    } catch (error) {
      addLog(`❌ Profile load error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testProfileSave = async () => {
    setIsLoading(true)
    addLog('=== Testing Profile Save ===')
    
    try {
      addLog(`User ID: ${user?.id}`)
      addLog(`Test data: ${JSON.stringify(testData, null, 2)}`)
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(testData),
      })

      addLog(`Response status: ${response.status}`)
      const responseText = await response.text()
      addLog(`Raw response: ${responseText}`)

      if (response.ok) {
        const data = JSON.parse(responseText)
        addLog('✅ Profile save successful')
        addLog(`Response data: ${JSON.stringify(data, null, 2)}`)
      } else {
        addLog(`❌ Profile save failed: ${response.status}`)
        addLog(`Error response: ${responseText}`)
      }
    } catch (error) {
      addLog(`❌ Profile save error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setIsLoading(true)
    addLog('=== Testing Database Connection ===')
    
    try {
      addLog('Testing Supabase connection...')
      
      // Test a simple query to see if we can connect to the database
      const response = await fetch('/api/test-db', {
        method: 'GET',
      })

      addLog(`Response status: ${response.status}`)
      const responseText = await response.text()
      addLog(`Raw response: ${responseText}`)

      if (response.ok) {
        addLog('✅ Database connection successful')
      } else {
        addLog(`❌ Database connection failed: ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ Database connection error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testEnvironmentVariables = async () => {
    setIsLoading(true)
    addLog('=== Testing Environment Variables ===')
    
    try {
      addLog('Testing environment variable access...')
      
      const response = await fetch('/api/test-env', {
        method: 'GET',
      })

      addLog(`Response status: ${response.status}`)
      const responseText = await response.text()
      addLog(`Raw response: ${responseText}`)

      if (response.ok) {
        addLog('✅ Environment variables accessible')
      } else {
        addLog(`❌ Environment variables failed: ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ Environment variables error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Save Tester</h1>
          <p className="text-gray-600">
            Test profile saving functionality and debug issues.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Test Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={testEnvironmentVariables} 
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Test Env Vars
                  </Button>
                  
                  <Button 
                    onClick={testDatabaseConnection} 
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Test DB Connection
                  </Button>
                </div>
                
                <Button 
                  onClick={testProfileLoad} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test Profile Load
                </Button>
                
                <Button 
                  onClick={testProfileSave} 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test Profile Save
                </Button>
                
                <Button 
                  onClick={clearLogs} 
                  variant="outline"
                  className="w-full"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear Logs
                </Button>
              </CardContent>
            </Card>

            {/* Test Data */}
            <Card>
              <CardHeader>
                <CardTitle>Test Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={testData.full_name}
                    onChange={(e) => setTestData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Job Title</Label>
                  <Input
                    value={testData.job_title}
                    onChange={(e) => setTestData(prev => ({ ...prev, job_title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={testData.company}
                    onChange={(e) => setTestData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <p className="text-gray-500">No logs yet. Run a test to see results.</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestProfilePage() {
  return (
    <AuthProvider>
      <TestProfileContent />
    </AuthProvider>
  )
} 