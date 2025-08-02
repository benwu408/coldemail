'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

function DebugProfilePageContent() {
  const { user } = useAuth()
  const [debugLog, setDebugLog] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  
  // Test profile data
  const [testProfile, setTestProfile] = useState({
    full_name: 'Debug Test User',
    job_title: 'Debug Engineer',
    company: 'Debug Corp',
    education: {
      school: 'Debug University',
      degree: 'BS',
      major: 'Debug Science',
      graduation_year: '2020'
    },
    location: 'Debug City',
    industry: 'Debug Industry',
    experience_years: '5-10',
    skills: ['Debugging', 'Testing', 'Problem Solving'],
    interests: ['Debugging', 'Testing'],
    background: 'Professional debug tester with extensive experience in finding and fixing issues.',
    linkedin_url: 'https://linkedin.com/in/debuguser',
    website: 'https://debuguser.com'
  })

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[${timestamp}] ${message}`)
  }

  const clearLog = () => {
    setDebugLog([])
    setTestResults({})
  }

  const runComprehensiveTest = async () => {
    setLoading(true)
    clearLog()
    
    addLog('🚀 Starting comprehensive profile debug test...')
    
    try {
      // Test 1: Environment Variables
      addLog('📋 Test 1: Checking environment variables...')
      const envVars = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
      }
      addLog(`   Supabase URL: ${envVars.supabaseUrl}`)
      addLog(`   Supabase Key: ${envVars.supabaseKey}`)
      setTestResults(prev => ({ ...prev, envVars }))

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        addLog('❌ Environment variables missing - test cannot continue')
        return
      }

      // Test 2: User Authentication
      addLog('👤 Test 2: Checking user authentication...')
      if (!user?.id) {
        addLog('❌ No authenticated user found')
        setTestResults(prev => ({ ...prev, userAuth: 'FAILED - No user' }))
        return
      }
      addLog(`✅ User authenticated: ${user.id}`)
      addLog(`   User email: ${user.email}`)
      setTestResults(prev => ({ ...prev, userAuth: 'SUCCESS' }))

      // Test 3: Supabase Connection
      addLog('🔌 Test 3: Testing Supabase connection...')
      const { data: connectionTest, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)
      
      if (connectionError) {
        addLog(`❌ Supabase connection failed: ${connectionError.message}`)
        addLog(`   Error code: ${connectionError.code}`)
        addLog(`   Error details: ${connectionError.details}`)
        setTestResults(prev => ({ ...prev, connection: 'FAILED' }))
        return
      }
      addLog('✅ Supabase connection successful')
      setTestResults(prev => ({ ...prev, connection: 'SUCCESS' }))

      // Test 4: Table Structure
      addLog('📊 Test 4: Checking table structure...')
      const { data: tableInfo, error: tableError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1)
      
      if (tableError) {
        addLog(`❌ Table structure check failed: ${tableError.message}`)
        setTestResults(prev => ({ ...prev, tableStructure: 'FAILED' }))
        return
      }
      addLog('✅ Table structure check passed')
      setTestResults(prev => ({ ...prev, tableStructure: 'SUCCESS' }))

      // Test 5: Check for existing profile
      addLog('🔍 Test 5: Checking for existing profile...')
      const { data: existingProfile, error: existingError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (existingError && existingError.code !== 'PGRST116') {
        addLog(`❌ Error checking existing profile: ${existingError.message}`)
        setTestResults(prev => ({ ...prev, existingCheck: 'FAILED' }))
        return
      }
      
      if (existingProfile) {
        addLog(`✅ Existing profile found: ${existingProfile.id}`)
        addLog(`   Created: ${existingProfile.created_at}`)
        addLog(`   Updated: ${existingProfile.updated_at}`)
        setTestResults(prev => ({ ...prev, existingCheck: 'FOUND', existingProfile }))
      } else {
        addLog('ℹ️ No existing profile found - will create new one')
        setTestResults(prev => ({ ...prev, existingCheck: 'NOT_FOUND' }))
      }

      // Test 6: Profile Insert Test
      addLog('➕ Test 6: Testing profile insert...')
      const insertData = {
        user_id: user.id,
        ...testProfile,
        updated_at: new Date().toISOString()
      }
      
      addLog(`   Inserting data: ${JSON.stringify(insertData, null, 2)}`)
      
      const { data: insertResult, error: insertError } = await supabase
        .from('user_profiles')
        .upsert(insertData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
      
      if (insertError) {
        addLog(`❌ Profile insert failed: ${insertError.message}`)
        addLog(`   Error code: ${insertError.code}`)
        addLog(`   Error details: ${insertError.details}`)
        addLog(`   Error hint: ${insertError.hint}`)
        setTestResults(prev => ({ ...prev, insert: 'FAILED', insertError }))
        return
      }
      
      addLog('✅ Profile insert successful')
      addLog(`   Inserted/Updated: ${insertResult?.length || 0} records`)
      setTestResults(prev => ({ ...prev, insert: 'SUCCESS', insertResult }))

      // Test 7: Profile Read Test
      addLog('📖 Test 7: Testing profile read...')
      const { data: readResult, error: readError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (readError) {
        addLog(`❌ Profile read failed: ${readError.message}`)
        setTestResults(prev => ({ ...prev, read: 'FAILED' }))
        return
      }
      
      addLog('✅ Profile read successful')
      addLog(`   Read profile: ${JSON.stringify(readResult, null, 2)}`)
      setTestResults(prev => ({ ...prev, read: 'SUCCESS', readResult }))

      // Test 8: Data Validation
      addLog('✅ Test 8: Validating saved data...')
      const validationChecks = {
        full_name: readResult.full_name === testProfile.full_name,
        job_title: readResult.job_title === testProfile.job_title,
        company: readResult.company === testProfile.company,
        education: JSON.stringify(readResult.education) === JSON.stringify(testProfile.education),
        skills: JSON.stringify(readResult.skills) === JSON.stringify(testProfile.skills),
        interests: JSON.stringify(readResult.interests) === JSON.stringify(testProfile.interests)
      }
      
      Object.entries(validationChecks).forEach(([field, isValid]) => {
        if (isValid) {
          addLog(`   ✅ ${field}: Valid`)
        } else {
          addLog(`   ❌ ${field}: Invalid`)
          addLog(`      Expected: ${JSON.stringify(testProfile[field as keyof typeof testProfile])}`)
          addLog(`      Got: ${JSON.stringify(readResult[field])}`)
        }
      })
      
      const allValid = Object.values(validationChecks).every(Boolean)
      if (allValid) {
        addLog('✅ All data validation checks passed')
      } else {
        addLog('❌ Some data validation checks failed')
      }
      setTestResults(prev => ({ ...prev, validation: validationChecks, allValid }))

      // Test 9: RLS Policy Test
      addLog('🔒 Test 9: Testing RLS policies...')
      const { data: rlsTest, error: rlsError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
      
      if (rlsError) {
        addLog(`❌ RLS policy test failed: ${rlsError.message}`)
        setTestResults(prev => ({ ...prev, rls: 'FAILED' }))
        return
      }
      
      addLog('✅ RLS policies working correctly')
      setTestResults(prev => ({ ...prev, rls: 'SUCCESS' }))

      addLog('🎉 Comprehensive test completed!')

    } catch (error) {
      addLog(`💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      addLog(`   Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`)
    } finally {
      setLoading(false)
    }
  }

  const testSpecificField = async (fieldName: string, value: any) => {
    setLoading(true)
    addLog(`🧪 Testing specific field: ${fieldName}`)
    
    try {
      const testData = {
        user_id: user?.id,
        [fieldName]: value,
        updated_at: new Date().toISOString()
      }
      
      addLog(`   Test data: ${JSON.stringify(testData, null, 2)}`)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(testData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
      
      if (error) {
        addLog(`❌ Field test failed: ${error.message}`)
        addLog(`   Error details: ${JSON.stringify(error, null, 2)}`)
      } else {
        addLog(`✅ Field test successful`)
        addLog(`   Result: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      addLog(`💥 Field test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🔧 Profile Save Debug Tester</CardTitle>
            <p className="text-gray-600">
              Comprehensive debug tool to test every aspect of profile saving functionality
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Current User Info:</h3>
              <div className="text-sm text-blue-800">
                <p><strong>User ID:</strong> {user?.id || 'Not authenticated'}</p>
                <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
                <p><strong>Auth Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
              </div>
            </div>

            {/* Test Controls */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={runComprehensiveTest}
                  disabled={loading || !user}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Running Tests...' : '🚀 Run Comprehensive Test'}
                </Button>
                <Button
                  onClick={clearLog}
                  variant="outline"
                >
                  Clear Log
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  onClick={() => testSpecificField('full_name', 'Test Name')}
                  disabled={loading || !user}
                  size="sm"
                  variant="outline"
                >
                  Test Name
                </Button>
                <Button
                  onClick={() => testSpecificField('job_title', 'Test Job')}
                  disabled={loading || !user}
                  size="sm"
                  variant="outline"
                >
                  Test Job
                </Button>
                <Button
                  onClick={() => testSpecificField('skills', ['Test Skill'])}
                  disabled={loading || !user}
                  size="sm"
                  variant="outline"
                >
                  Test Skills
                </Button>
                <Button
                  onClick={() => testSpecificField('education', { school: 'Test School' })}
                  disabled={loading || !user}
                  size="sm"
                  variant="outline"
                >
                  Test Education
                </Button>
              </div>
            </div>

            {/* Test Results Summary */}
            {Object.keys(testResults).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Test Results Summary:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(testResults).map(([test, result]) => (
                    <div key={test} className="flex items-center gap-2">
                      <span className="font-medium">{test}:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result === 'SUCCESS' || result === 'FOUND' ? 'bg-green-100 text-green-800' :
                        result === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {typeof result === 'object' ? 'OBJECT' : result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Log */}
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">Debug Log:</span>
                <span className="text-gray-400 text-xs">{debugLog.length} entries</span>
              </div>
              {debugLog.length === 0 ? (
                <div className="text-gray-500">No debug entries yet. Run a test to see results.</div>
              ) : (
                <div className="space-y-1">
                  {debugLog.map((entry, index) => (
                    <div key={index} className="whitespace-pre-wrap">{entry}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Copy Results */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const results = {
                    timestamp: new Date().toISOString(),
                    user: { id: user?.id, email: user?.email },
                    testResults,
                    debugLog
                  }
                  navigator.clipboard.writeText(JSON.stringify(results, null, 2))
                }}
                variant="outline"
                size="sm"
              >
                📋 Copy Results to Clipboard
              </Button>
              <Button
                onClick={() => {
                  const logText = debugLog.join('\n')
                  navigator.clipboard.writeText(logText)
                }}
                variant="outline"
                size="sm"
              >
                📋 Copy Log to Clipboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DebugProfilePage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DebugProfilePageContent />
      </ProtectedRoute>
    </AuthProvider>
  )
} 