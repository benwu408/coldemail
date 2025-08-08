'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface TestResult {
  test: string
  success: boolean
  error?: string
  data?: any
}

export default function TestTriggerSimplePage() {
  const [user, setUser] = useState<any>(null)
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getCurrentUser()
  }, [])

  const addResult = (test: string, success: boolean, error?: string, data?: any) => {
    setResults(prev => [...prev, { test, success, error, data }])
  }

  const clearResults = () => {
    setResults([])
  }

  const testTriggerDirectly = async () => {
    setIsRunning(true)
    clearResults()

    try {
      // Test 1: Check if profiles table exists
      const { data: tableData, error: tableError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (tableError) {
        addResult('Profiles table check', false, tableError.message, tableError)
        return
      } else {
        addResult('Profiles table check', true, undefined, { tableExists: true })
      }

      // Test 2: Check if trigger exists by querying pg_trigger directly
      try {
        const { data: triggerData, error: triggerError } = await supabase
          .from('pg_trigger')
          .select('tgname, tgenabled')
          .eq('tgname', 'create_profile_on_signup')
          .single()

        if (triggerError) {
          if (triggerError.code === 'PGRST116') {
            addResult('Trigger existence check', false, 'Trigger not found - needs to be created', {
              suggestion: 'Run the fix-trigger-and-functions.sql script'
            })
          } else {
            addResult('Trigger existence check', false, triggerError.message, triggerError)
          }
        } else {
          addResult('Trigger existence check', true, undefined, { 
            trigger: triggerData,
            enabled: triggerData.tgenabled === 'O'
          })
        }
      } catch (error) {
        addResult('Trigger existence check', false, 'Failed to check trigger', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Test 3: Check if current user has a profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            addResult('Current user profile', false, 'Profile not found - trigger may not be working', {
              suggestion: 'Run the fix-trigger-and-functions.sql script'
            })
          } else {
            addResult('Current user profile', false, profileError.message, profileError)
          }
        } else {
          addResult('Current user profile', true, undefined, { profile })
        }
      }

      // Test 4: Try to create a test user and see if profile is created
      const testEmail = `test-trigger-${Date.now()}@example.com`
      const testPassword = 'testpassword123'

      addResult('Creating test user', true, undefined, { email: testEmail })

      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      if (signupError) {
        addResult('Test user signup', false, signupError.message, signupError)
      } else {
        addResult('Test user signup', true, undefined, { user: signupData.user })

        // Wait for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Check if profile was created
        if (signupData.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', signupData.user.id)
            .single()

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              addResult('Profile creation after signup', false, 'Profile not created - trigger not working', {
                suggestion: 'Run the fix-trigger-and-functions.sql script',
                userId: signupData.user.id
              })
            } else {
              addResult('Profile creation after signup', false, profileError.message, profileError)
            }
          } else {
            addResult('Profile creation after signup', true, undefined, { profile })
          }
        }
      }

    } catch (error) {
      addResult('Test suite', false, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple Trigger Tester</h1>
          <p className="text-gray-600">
            This page tests the trigger function without relying on helper functions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testTriggerDirectly}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Trigger...
                  </>
                ) : (
                  'Test Trigger Function'
                )}
              </Button>
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
                No tests run yet. Click "Test Trigger Function" to start.
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
                    </div>
                    {result.error && (
                      <p className="text-red-700 text-sm mb-2">{result.error}</p>
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