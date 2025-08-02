'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

function DatabaseTest() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setTestResults([])

    const results = []

    try {
      // Test 1: Check if we can connect to Supabase
      results.push({ test: 'Supabase Connection', status: 'Testing...' })
      
      const { data: authData, error: authError } = await supabase.auth.getSession()
      if (authError) {
        results.push({ test: 'Supabase Connection', status: 'FAILED', error: authError.message })
      } else {
        results.push({ test: 'Supabase Connection', status: 'PASSED', data: authData })
      }

      // Test 2: Check if user_profiles table exists
      results.push({ test: 'Table Exists', status: 'Testing...' })
      
      const { data: tableData, error: tableError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      if (tableError) {
        results.push({ test: 'Table Exists', status: 'FAILED', error: tableError.message })
      } else {
        results.push({ test: 'Table Exists', status: 'PASSED', data: tableData })
      }

      // Test 3: Check if we can insert a test record
      if (user?.id) {
        results.push({ test: 'Insert Test Record', status: 'Testing...' })
        
        const testData = {
          user_id: user.id,
          full_name: 'Test User',
          job_title: 'Test Job',
          company: 'Test Company'
        }

        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .upsert(testData, { onConflict: 'user_id' })

        if (insertError) {
          results.push({ test: 'Insert Test Record', status: 'FAILED', error: insertError.message })
        } else {
          results.push({ test: 'Insert Test Record', status: 'PASSED', data: insertData })
        }

        // Test 4: Check if we can read the test record
        results.push({ test: 'Read Test Record', status: 'Testing...' })
        
        const { data: readData, error: readError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (readError) {
          results.push({ test: 'Read Test Record', status: 'FAILED', error: readError.message })
        } else {
          results.push({ test: 'Read Test Record', status: 'PASSED', data: readData })
        }

        // Test 5: Clean up test record
        results.push({ test: 'Cleanup Test Record', status: 'Testing...' })
        
        const { error: deleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', user.id)

        if (deleteError) {
          results.push({ test: 'Cleanup Test Record', status: 'FAILED', error: deleteError.message })
        } else {
          results.push({ test: 'Cleanup Test Record', status: 'PASSED' })
        }
      }

    } catch (error) {
      results.push({ test: 'General Error', status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' })
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">User ID: {user?.id || 'Not logged in'}</p>
          <button 
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Database Tests'}
          </button>
        </div>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{result.test}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.status === 'PASSED' ? 'bg-green-100 text-green-800' :
                  result.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status}
                </span>
              </div>
              {result.error && (
                <p className="text-red-600 text-sm mt-2">{result.error}</p>
              )}
              {result.data && (
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DatabaseTestPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DatabaseTest />
      </ProtectedRoute>
    </AuthProvider>
  )
} 