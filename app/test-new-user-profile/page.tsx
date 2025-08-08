'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface TestResult {
  timestamp: string
  test: string
  success: boolean
  error?: string
  data?: any
  details?: string
}

export default function TestNewUserProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testPassword, setTestPassword] = useState('')

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getCurrentUser()
  }, [])

  const addResult = (test: string, success: boolean, error?: string, data?: any, details?: string) => {
    const result: TestResult = {
      timestamp: new Date().toLocaleTimeString(),
      test,
      success,
      error,
      data,
      details
    }
    setResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
  }

  const runAllTests = async () => {
    setIsRunning(true)
    clearResults()

    try {
      // Test 1: Check if user is authenticated
      addResult('User Authentication', !!user, undefined, { userId: user?.id, email: user?.email })
      
      if (!user) {
        addResult('Test Aborted', false, 'No authenticated user found')
        return
      }

      // Test 2: Check if profiles table exists
      try {
        const { data: tableCheck, error: tableError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
        
        if (tableError) {
          addResult('Profiles Table Check', false, tableError.message, tableError)
        } else {
          addResult('Profiles Table Check', true, undefined, { tableExists: true })
        }
      } catch (error) {
        addResult('Profiles Table Check', false, error instanceof Error ? error.message : 'Unknown error')
      }

      // Test 3: Check if user profile exists
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            addResult('User Profile Exists', false, 'Profile not found', { error: profileError.message })
          } else {
            addResult('User Profile Check', false, profileError.message, profileError)
          }
        } else {
          addResult('User Profile Exists', true, undefined, { profile })
        }
      } catch (error) {
        addResult('User Profile Check', false, error instanceof Error ? error.message : 'Unknown error')
      }

      // Test 4: Check profiles table structure
      try {
        const { data: structure, error: structureError } = await supabase
          .rpc('get_table_structure', { table_name: 'profiles' })
        
        if (structureError) {
          // Fallback: try to get structure by selecting all columns
          const { data: columns, error: columnsError } = await supabase
            .from('profiles')
            .select('*')
            .limit(0)
          
          if (columnsError) {
            addResult('Table Structure Check', false, columnsError.message, columnsError)
          } else {
            addResult('Table Structure Check', true, undefined, { columns: 'Table exists but structure check failed' })
          }
        } else {
          addResult('Table Structure Check', true, undefined, { structure })
        }
      } catch (error) {
        addResult('Table Structure Check', false, error instanceof Error ? error.message : 'Unknown error')
      }

      // Test 5: Try to create a profile manually
      try {
        const testProfile = {
          user_id: user.id,
          full_name: 'Test User',
          job_title: null,
          company: null,
          email: null,
          phone: null,
          background: null,
          education: '{"major": null, "degree": null, "school": null, "graduation_year": null}',
          skills: [],
          interests: [],
          resume_text: null,
          subscription_plan: 'free',
          subscription_status: 'active',
          job_experiences: '[]',
          location: null,
          industry: null,
          linkedin_url: null,
          website: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(testProfile, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select()

        if (createError) {
          addResult('Manual Profile Creation', false, createError.message, createError, JSON.stringify(testProfile))
        } else {
          addResult('Manual Profile Creation', true, undefined, { createdProfile })
        }
      } catch (error) {
        addResult('Manual Profile Creation', false, error instanceof Error ? error.message : 'Unknown error')
      }

      // Test 6: Check if trigger function exists
      try {
        const { data: triggerCheck, error: triggerError } = await supabase
          .rpc('check_trigger_exists', { trigger_name: 'create_profile_on_signup' })
        
        if (triggerError) {
          // Fallback: check if trigger exists by querying pg_trigger directly
          const { data: directCheck, error: directError } = await supabase
            .from('pg_trigger')
            .select('tgname')
            .eq('tgname', 'create_profile_on_signup')
            .single()
          
          if (directError) {
            addResult('Trigger Function Check', false, 'Trigger function not found - run fix-trigger-and-functions.sql', { 
              error: triggerError.message,
              suggestion: 'Execute the SQL script to create missing functions'
            })
          } else {
            addResult('Trigger Function Check', true, undefined, { triggerExists: true, method: 'direct_check' })
          }
        } else {
          addResult('Trigger Function Check', true, undefined, { triggerExists: triggerCheck })
        }
      } catch (error) {
        addResult('Trigger Function Check', false, 'Trigger check failed - function may not exist. Run fix-trigger-and-functions.sql', {
          error: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Execute the SQL script to create missing functions'
        })
      }

      // Test 7: Check RLS policies
      try {
        const { data: policies, error: policiesError } = await supabase
          .rpc('get_rls_policies', { table_name: 'profiles' })
        
        if (policiesError) {
          // Fallback: check RLS policies directly using a simpler query
          try {
            const { data: directPolicies, error: directPoliciesError } = await supabase
              .from('pg_policy')
              .select('polname, polcmd')
              .limit(10)
            
            if (directPoliciesError) {
              addResult('RLS Policies Check', false, 'RLS policies check failed - run fix-trigger-and-functions.sql', {
                error: policiesError.message,
                suggestion: 'Execute the SQL script to create missing functions'
              })
            } else {
              addResult('RLS Policies Check', true, undefined, { 
                policies: directPolicies,
                method: 'direct_check',
                note: 'Using direct query - some functions may be missing'
              })
            }
          } catch (fallbackError) {
            addResult('RLS Policies Check', false, 'RLS policies check failed - run fix-trigger-and-functions.sql', {
              error: policiesError.message,
              fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
              suggestion: 'Execute the SQL script to create missing functions'
            })
          }
        } else {
          addResult('RLS Policies Check', true, undefined, { policies })
        }
      } catch (error) {
        addResult('RLS Policies Check', false, 'RLS policies check failed - run fix-trigger-and-functions.sql', {
          error: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Execute the SQL script to create missing functions'
        })
      }

      // Test 8: Test profile API endpoint
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        })

        const responseData = await response.json()

        if (!response.ok) {
          addResult('Profile API Test', false, responseData.error || 'API request failed', responseData)
        } else {
          addResult('Profile API Test', true, undefined, { profile: responseData })
        }
      } catch (error) {
        addResult('Profile API Test', false, error instanceof Error ? error.message : 'Unknown error')
      }

    } catch (error) {
      addResult('Test Suite', false, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsRunning(false)
    }
  }

  const testNewUserSignup = async () => {
    if (!testEmail || !testPassword) {
      addResult('New User Signup Test', false, 'Email and password required')
      return
    }

    setIsRunning(true)
    addResult('New User Signup Test', true, undefined, { email: testEmail })

    try {
      // Test signup
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      if (signupError) {
        addResult('Signup Process', false, signupError.message, signupError)
      } else {
        addResult('Signup Process', true, undefined, { user: signupData.user })

        // Wait a moment for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Check if profile was created
        if (signupData.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', signupData.user.id)
            .single()

          if (profileError) {
            addResult('Profile Creation After Signup', false, profileError.message, profileError)
          } else {
            addResult('Profile Creation After Signup', true, undefined, { profile })
          }
        }
      }
    } catch (error) {
      addResult('New User Signup Test', false, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New User Profile Creation Tester</h1>
          <p className="text-gray-600">
            This page helps debug issues with new user profile creation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Test Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="testPassword">Test Password</Label>
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="flex-1"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    'Run All Tests'
                  )}
                </Button>
                <Button
                  onClick={testNewUserSignup}
                  disabled={isRunning || !testEmail || !testPassword}
                  variant="outline"
                >
                  Test New User Signup
                </Button>
              </div>
              <Button
                onClick={clearResults}
                variant="outline"
                className="w-full"
              >
                Clear Results
              </Button>
            </CardContent>
          </Card>

          {/* Current User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current User Info</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-gray-500">No user authenticated</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No tests run yet. Click "Run All Tests" to start.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.test}</span>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                    {result.error && (
                      <p className="text-red-700 text-sm mb-2">{result.error}</p>
                    )}
                    {result.details && (
                      <p className="text-gray-600 text-sm mb-2">{result.details}</p>
                    )}
                    {result.data && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          View Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 