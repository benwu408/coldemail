'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Database, User, Mail, CheckCircle, XCircle, Bug, Search, Plus, Trash2 } from 'lucide-react'
import Header from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabase'

function TestPastEmailsContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const addResult = (test: string, status: 'success' | 'error' | 'info', details: string, data?: any) => {
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

  const testTableStructure = async () => {
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('generated_emails')
        .select('*')
        .limit(1)

      if (tableError) {
        addResult('Table Structure', 'error', `Failed to access generated_emails table: ${tableError.message}`, tableError)
      } else {
        addResult('Table Structure', 'success', 'Successfully accessed generated_emails table', {
          hasData: tableInfo && tableInfo.length > 0,
          sampleRecord: tableInfo?.[0] || null
        })
      }
    } catch (error) {
      addResult('Table Structure', 'error', `Error testing table structure: ${error}`, error)
    }
  }

  const testDirectQuery = async () => {
    if (!user) {
      addResult('Direct Query', 'error', 'No authenticated user found', null)
      return
    }

    try {
      console.log('Testing direct query for user:', user.id)
      
      const { data, error } = await supabase
        .from('generated_emails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        addResult('Direct Query', 'error', `Supabase query error: ${error.message}`, error)
      } else {
        addResult('Direct Query', 'success', `Query successful. Found ${data?.length || 0} emails`, {
          emailCount: data?.length || 0,
          emails: data || [],
          firstEmail: data?.[0] || null
        })
      }
    } catch (error) {
      addResult('Direct Query', 'error', `Exception during query: ${error}`, error)
    }
  }

  const testInsertTestEmail = async () => {
    if (!user) {
      addResult('Insert Test Email', 'error', 'No authenticated user found', null)
      return
    }

    try {
      const testEmailData = {
        user_id: user.id,
        recipient_name: 'Test Recipient',
        recipient_company: 'Test Company',
        recipient_role: 'Test Role',
        purpose: 'Test Purpose',
        search_mode: 'basic',
        research_findings: 'Test research findings',
        commonalities: 'Test commonalities',
        generated_email: 'This is a test email content for debugging purposes.'
      }

      console.log('Inserting test email with data:', testEmailData)

      const { data, error } = await supabase
        .from('generated_emails')
        .insert(testEmailData)
        .select()

      if (error) {
        addResult('Insert Test Email', 'error', `Failed to insert test email: ${error.message}`, error)
      } else {
        addResult('Insert Test Email', 'success', 'Test email inserted successfully', {
          insertedEmail: data?.[0] || null
        })
      }
    } catch (error) {
      addResult('Insert Test Email', 'error', `Exception during insert: ${error}`, error)
    }
  }

  const testDeleteTestEmails = async () => {
    if (!user) {
      addResult('Delete Test Emails', 'error', 'No authenticated user found', null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('generated_emails')
        .delete()
        .eq('user_id', user.id)
        .eq('recipient_name', 'Test Recipient')

      if (error) {
        addResult('Delete Test Emails', 'error', `Failed to delete test emails: ${error.message}`, error)
      } else {
        addResult('Delete Test Emails', 'success', 'Test emails deleted successfully', {
          deletedCount: data ? 'Success' : 'No data returned'
        })
      }
    } catch (error) {
      addResult('Delete Test Emails', 'error', `Exception during delete: ${error}`, error)
    }
  }

  const testPastEmailsAPI = async () => {
    if (!user) {
      addResult('Past Emails API', 'error', 'No authenticated user found', null)
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
        addResult('Past Emails API', 'success', `API call successful. Found ${data.emails?.length || 0} emails`, {
          emailCount: data.emails?.length || 0,
          emails: data.emails || [],
          firstEmail: data.emails?.[0] || null
        })
      } else {
        addResult('Past Emails API', 'error', `API error: ${data.error}`, data)
      }
    } catch (error) {
      addResult('Past Emails API', 'error', `Network error: ${error}`, error)
    }
  }

  const testEmailGenerationAndSave = async () => {
    if (!user) {
      addResult('Email Generation & Save', 'error', 'No authenticated user found', null)
      return
    }

    try {
      const testData = {
        recipientName: 'Debug Test Recipient',
        recipientCompany: 'Debug Test Company',
        recipientRole: 'Debug Test Role',
        purpose: 'Debug Test Purpose',
        tone: 'casual',
        userProfile: {
          full_name: 'Debug Test User',
          job_title: 'Debug Test Job',
          company: 'Debug Test Company'
        },
        searchMode: 'basic'
      }

      console.log('Testing email generation with data:', testData)

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
        addResult('Email Generation & Save', 'success', 'Email generated and saved successfully', {
          hasEmail: !!data.email,
          hasFindings: !!data.researchFindings,
          hasCommonalities: !!data.commonalities,
          emailLength: data.email?.length || 0
        })
      } else {
        addResult('Email Generation & Save', 'error', `Generation failed: ${data.error}`, data)
      }
    } catch (error) {
      addResult('Email Generation & Save', 'error', `Network error: ${error}`, error)
    }
  }

  const testRowLevelSecurity = async () => {
    if (!user) {
      addResult('Row Level Security', 'error', 'No authenticated user found', null)
      return
    }

    try {
      // Test if we can see our own emails
      const { data: ownEmails, error: ownError } = await supabase
        .from('generated_emails')
        .select('*')
        .eq('user_id', user.id)

      if (ownError) {
        addResult('Row Level Security', 'error', `Cannot access own emails: ${ownError.message}`, ownError)
      } else {
        addResult('Row Level Security', 'success', `Can access own emails. Found ${ownEmails?.length || 0}`, {
          ownEmailCount: ownEmails?.length || 0
        })
      }
    } catch (error) {
      addResult('Row Level Security', 'error', `Exception during RLS test: ${error}`, error)
    }
  }

  const testSchemaFix = async () => {
    try {
      const response = await fetch('/api/fix-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult('Schema Fix', 'success', data.message, data)
      } else {
        addResult('Schema Fix', 'error', `Schema fix failed: ${data.error}`, data)
      }
    } catch (error) {
      addResult('Schema Fix', 'error', `Network error: ${error}`, error)
    }
  }

  const runAllTests = async () => {
    setIsTesting(true)
    setTestResults([])

    // Run tests in sequence
    await testUserAuthentication()
    await testDatabaseConnection()
    await testTableStructure()
    await testSchemaFix() // Add schema fix test
    await testDirectQuery()
    await testRowLevelSecurity()
    await testPastEmailsAPI()
    await testEmailGenerationAndSave()
    await testInsertTestEmail()
    await testDirectQuery() // Query again to see if test email appears
    await testDeleteTestEmails()

    setIsTesting(false)
    toast({
      title: "Tests Complete",
      description: "All past emails tests have been completed. Check the results below.",
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
              Past Emails Debug Tool
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Test Past
              <span className="text-red-600"> Emails</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Comprehensive testing tool to debug past emails loading, saving, and retrieval issues.
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
                  onClick={testUserAuthentication}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  Test Auth
                </Button>
                
                <Button
                  onClick={testDatabaseConnection}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Test DB
                </Button>
                
                <Button
                  onClick={testDirectQuery}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Test Query
                </Button>
                
                <Button
                  onClick={testEmailGenerationAndSave}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Test Generation
                </Button>
                
                <Button
                  onClick={testSchemaFix}
                  disabled={isTesting}
                  variant="outline"
                  className="border-gray-200"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Fix Schema
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
                  <p>Click "Run All Tests" to start debugging the past emails functionality.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : result.status === 'error'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : result.status === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-[#111827] mb-1">
                            {result.test}
                          </h4>
                          <p className={`text-sm ${
                            result.status === 'success' ? 'text-green-700' : 
                            result.status === 'error' ? 'text-red-700' : 'text-blue-700'
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
                  <p>Please log in to test past emails functionality.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function TestPastEmails() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TestPastEmailsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
} 