'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Database, User, Mail, CheckCircle, XCircle, Bug } from 'lucide-react'
import Header from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

function TestEmailSavingContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const addResult = (test: string, status: 'success' | 'error', details: string, data?: any) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      details,
      data,
      timestamp: new Date().toISOString()
    }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      
      if (response.ok) {
        addResult('Database Connection', 'success', 'Successfully connected to Supabase database', data)
      } else {
        addResult('Database Connection', 'error', `Failed to connect: ${data.error}`, data)
      }
    } catch (error) {
      addResult('Database Connection', 'error', `Network error: ${error}`, error)
    }
  }

  const testUserAuthentication = async () => {
    if (!user) {
      addResult('User Authentication', 'error', 'No authenticated user found', null)
      return
    }

    addResult('User Authentication', 'success', `User authenticated: ${user.email} (ID: ${user.id})`, {
      email: user.email,
      id: user.id
    })
  }

  const testEmailGenerationAPI = async () => {
    if (!user) {
      addResult('Email Generation API', 'error', 'No authenticated user found', null)
      return
    }

    try {
      const testData = {
        recipientName: 'Test Recipient',
        recipientCompany: 'Test Company',
        recipientRole: 'Test Role',
        purpose: 'Test purpose for email generation',
        tone: 'casual',
        userProfile: {
          full_name: 'Test User',
          job_title: 'Test Job',
          company: 'Test Company'
        },
        searchMode: 'basic'
      }

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult('Email Generation API', 'success', 'Email generated successfully', {
          hasEmail: !!data.email,
          hasFindings: !!data.researchFindings,
          hasCommonalities: !!data.commonalities,
          emailLength: data.email?.length || 0,
          findingsLength: data.researchFindings?.length || 0,
          commonalitiesLength: data.commonalities?.length || 0
        })
      } else {
        addResult('Email Generation API', 'error', `API error: ${data.error}`, data)
      }
    } catch (error) {
      addResult('Email Generation API', 'error', `Network error: ${error}`, error)
    }
  }

  const testDatabaseSchema = async () => {
    try {
      const response = await fetch('/api/test-schema')
      const data = await response.json()
      
      if (response.ok) {
        addResult('Database Schema', 'success', 'Schema check completed', data)
      } else {
        addResult('Database Schema', 'error', `Schema error: ${data.error}`, data)
      }
    } catch (error) {
      addResult('Database Schema', 'error', `Network error: ${error}`, error)
    }
  }

  const testPastEmailsRetrieval = async () => {
    if (!user) {
      addResult('Past Emails Retrieval', 'error', 'No authenticated user found', null)
      return
    }

    try {
      const response = await fetch('/api/past-emails', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult('Past Emails Retrieval', 'success', `Retrieved ${data.emails?.length || 0} past emails`, {
          emailCount: data.emails?.length || 0,
          hasEmails: !!(data.emails && data.emails.length > 0)
        })
      } else {
        addResult('Past Emails Retrieval', 'error', `API error: ${data.error}`, data)
      }
    } catch (error) {
      addResult('Past Emails Retrieval', 'error', `Network error: ${error}`, error)
    }
  }

  const runAllTests = async () => {
    setIsTesting(true)
    setTestResults([])

    // Run tests in sequence
    await testDatabaseConnection()
    await testUserAuthentication()
    await testDatabaseSchema()
    await testEmailGenerationAPI()
    await testPastEmailsRetrieval()

    setIsTesting(false)
    toast({
      title: "Tests Complete",
      description: "All email saving tests have been completed. Check the results below.",
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      <Header />
      
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-full border border-red-100">
              <Bug className="h-3 w-3" />
              Email Saving Debug Tool
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Test Email
              <span className="text-red-600"> Saving</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Comprehensive testing tool to debug email generation, saving, and retrieval issues.
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Test Controls */}
          <Card className="border border-gray-100 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#111827]">
                <Bug className="h-6 w-6 text-red-600" />
                Test Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={runAllTests}
                  disabled={isTesting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Bug className="mr-2 h-4 w-4" />
                      Run All Tests
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={testDatabaseConnection}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Test Database
                </Button>
                
                <Button
                  onClick={testUserAuthentication}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  Test Auth
                </Button>
                
                <Button
                  onClick={testEmailGenerationAPI}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Test Email API
                </Button>
                
                <Button
                  onClick={testDatabaseSchema}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Test Schema
                </Button>
                
                <Button
                  onClick={testPastEmailsRetrieval}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Test Retrieval
                </Button>
                
                <Button
                  onClick={clearResults}
                  variant="outline"
                  className="border-gray-200"
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="border border-gray-100 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#111827]">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Test Results ({testResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bug className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No tests run yet</p>
                  <p>Click "Run All Tests" to start debugging the email saving functionality.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-[#111827] mb-1">
                            {result.test}
                          </h4>
                          <p className={`text-sm ${
                            result.status === 'success' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {result.details}
                          </p>
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                View Details
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Info */}
          <Card className="border border-gray-100 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#111827]">
                <User className="h-6 w-6 text-[#6366F1]" />
                Current User Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Authenticated:</strong> Yes</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Not Authenticated</p>
                  <p>Please log in to test email saving functionality.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function TestEmailSaving() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TestEmailSavingContent />
      </ProtectedRoute>
    </AuthProvider>
  )
} 