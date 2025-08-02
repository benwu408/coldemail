'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bug, 
  Database, 
  Save, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface DebugResult {
  timestamp: string
  operation: string
  success: boolean
  data?: any
  error?: any
  details?: string
}

interface TestCase {
  id: string
  name: string
  description: string
  testFunction: () => Promise<void>
}

function DebugProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [debugResults, setDebugResults] = useState<DebugResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testData, setTestData] = useState({
    fullName: 'Debug Test User',
    school: 'UIUC',
    major: 'Computer Science',
    degree: "Bachelor's",
    graduationYear: '2024'
  })

  const addDebugResult = (result: DebugResult) => {
    setDebugResults(prev => [result, ...prev.slice(0, 49)]) // Keep last 50 results
  }

  const clearDebugResults = () => {
    setDebugResults([])
  }

  const copyDebugResults = () => {
    const resultsText = debugResults.map(r => 
      `[${r.timestamp}] ${r.operation}: ${r.success ? 'SUCCESS' : 'FAILED'}\n${r.details || ''}\n${r.error ? `Error: ${JSON.stringify(r.error, null, 2)}` : ''}\n`
    ).join('\n')
    
    navigator.clipboard.writeText(resultsText)
    toast({
      title: "Debug Results Copied",
      description: "Debug results have been copied to clipboard",
    })
  }

  // Test 1: Database Connection
  const testDatabaseConnection = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)
      
      if (error) throw error
      
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Database Connection Test',
        success: true,
        data: data,
        details: 'Successfully connected to user_profiles table'
      })
    } catch (error) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Database Connection Test',
        success: false,
        error: error,
        details: 'Failed to connect to database'
      })
    }
  }

  // Test 2: Check if user profile exists
  const testProfileExists = async (): Promise<void> => {
    if (!user?.id) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Profile Existence Check',
        success: false,
        error: 'No user ID available',
        details: 'User not authenticated'
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code === 'PGRST116') {
        addDebugResult({
          timestamp: new Date().toLocaleTimeString(),
          operation: 'Profile Existence Check',
          success: true,
          data: null,
          details: 'No profile exists for this user (this is normal for new users)'
        })
        return
      }
      
      if (error) throw error
      
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Profile Existence Check',
        success: true,
        data: data,
        details: `Profile found with ID: ${data.id}`
      })
    } catch (error) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Profile Existence Check',
        success: false,
        error: error,
        details: 'Error checking profile existence'
      })
    }
  }

  // Test 3: Save test profile
  const testSaveProfile = async (): Promise<void> => {
    if (!user?.id) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Save Profile Test',
        success: false,
        error: 'No user ID available',
        details: 'User not authenticated'
      })
      return
    }

    try {
      const testProfile = {
        user_id: user.id,
        full_name: testData.fullName,
        job_title: 'Debug Tester',
        company: 'Debug Corp',
        education: {
          school: testData.school,
          degree: testData.degree,
          major: testData.major,
          graduation_year: testData.graduationYear
        },
        location: 'Debug City',
        industry: 'Technology',
        experience_years: '1-2',
        skills: ['Debugging', 'Testing'],
        interests: ['Problem Solving'],
        background: 'Professional debug tester',
        linkedin_url: 'https://linkedin.com/in/debug',
        website: 'https://debug.com',
        updated_at: new Date().toISOString()
      }

      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Save Profile Test - Data Prepared',
        success: true,
        data: testProfile,
        details: 'Test profile data prepared for saving'
      })

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(testProfile, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })

      if (error) throw error

      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Save Profile Test - Database Save',
        success: true,
        data: data,
        details: 'Profile saved to database successfully'
      })
    } catch (error) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Save Profile Test',
        success: false,
        error: error,
        details: 'Failed to save profile to database'
      })
    }
  }

  // Test 4: Load profile and verify data
  const testLoadProfile = async (): Promise<void> => {
    if (!user?.id) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Load Profile Test',
        success: false,
        error: 'No user ID available',
        details: 'User not authenticated'
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Load Profile Test - Raw Data',
        success: true,
        data: data,
        details: 'Raw profile data loaded from database'
      })

      // Check education data specifically
      if (data.education) {
        addDebugResult({
          timestamp: new Date().toLocaleTimeString(),
          operation: 'Load Profile Test - Education Data',
          success: true,
          data: data.education,
          details: `Education data: school="${data.education.school}", type=${typeof data.education.school}, length=${data.education.school?.length}`
        })
      } else {
        addDebugResult({
          timestamp: new Date().toLocaleTimeString(),
          operation: 'Load Profile Test - Education Data',
          success: false,
          error: 'No education data found',
          details: 'Education field is null or undefined'
        })
      }

      // Verify specific fields
      const verification = {
        fullName: data.full_name === testData.fullName,
        school: data.education?.school === testData.school,
        major: data.education?.major === testData.major,
        degree: data.education?.degree === testData.degree,
        graduationYear: data.education?.graduation_year === testData.graduationYear
      }

      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Load Profile Test - Data Verification',
        success: Object.values(verification).every(v => v),
        data: verification,
        details: `Data verification: ${JSON.stringify(verification)}`
      })

      // Additional education data logging
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Load Profile Test - Education Values',
        success: true,
        data: {
          expected: {
            school: testData.school,
            major: testData.major,
            degree: testData.degree,
            graduationYear: testData.graduationYear
          },
          actual: {
            school: data.education?.school,
            major: data.education?.major,
            degree: data.education?.degree,
            graduationYear: data.education?.graduation_year
          }
        },
        details: 'Comparing expected vs actual education values'
      })

    } catch (error) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Load Profile Test',
        success: false,
        error: error,
        details: 'Failed to load profile from database'
      })
    }
  }

  // Test 5: Delete test profile
  const testDeleteProfile = async (): Promise<void> => {
    if (!user?.id) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Delete Profile Test',
        success: false,
        error: 'No user ID available',
        details: 'User not authenticated'
      })
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Delete Profile Test',
        success: true,
        details: 'Test profile deleted successfully'
      })
    } catch (error) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Delete Profile Test',
        success: false,
        error: error,
        details: 'Failed to delete test profile'
      })
    }
  }

  // Test 6: Run full cycle test
  const testFullCycle = async (): Promise<void> => {
    setIsRunning(true)
    
    try {
      // Step 1: Check database connection
      await testDatabaseConnection()
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Check if profile exists
      await testProfileExists()
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 3: Save test profile
      await testSaveProfile()
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 4: Load and verify profile
      await testLoadProfile()
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 5: Clean up - delete test profile
      await testDeleteProfile()

      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Full Cycle Test',
        success: true,
        details: 'Complete test cycle finished successfully'
      })

    } catch (error) {
      addDebugResult({
        timestamp: new Date().toLocaleTimeString(),
        operation: 'Full Cycle Test',
        success: false,
        error: error,
        details: 'Full cycle test failed'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const testCases: TestCase[] = [
    {
      id: 'connection',
      name: 'Database Connection',
      description: 'Test if we can connect to the database',
      testFunction: testDatabaseConnection
    },
    {
      id: 'exists',
      name: 'Profile Existence',
      description: 'Check if a profile exists for the current user',
      testFunction: testProfileExists
    },
    {
      id: 'save',
      name: 'Save Profile',
      description: 'Save a test profile with sample data',
      testFunction: testSaveProfile
    },
    {
      id: 'load',
      name: 'Load Profile',
      description: 'Load the profile and verify the data integrity',
      testFunction: testLoadProfile
    },
    {
      id: 'delete',
      name: 'Delete Profile',
      description: 'Delete the test profile to clean up',
      testFunction: testDeleteProfile
    },
    {
      id: 'full-cycle',
      name: 'Full Cycle Test',
      description: 'Run all tests in sequence to identify issues',
      testFunction: testFullCycle
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111]">
      <Header
        showBackButton
        showNavigation={false}
        title="Profile Debug Tester"
        subtitle="Comprehensive testing and debugging tools for profile functionality"
      />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Test Controls */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bug className="h-5 w-5 text-red-600" />
                  Test Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Test Data Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Test Data</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Full Name</Label>
                      <Input
                        value={testData.fullName}
                        onChange={(e) => setTestData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Test Name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">School</Label>
                      <Input
                        value={testData.school}
                        onChange={(e) => setTestData(prev => ({ ...prev, school: e.target.value }))}
                        placeholder="UIUC"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Major</Label>
                      <Input
                        value={testData.major}
                        onChange={(e) => setTestData(prev => ({ ...prev, major: e.target.value }))}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Graduation Year</Label>
                      <Input
                        value={testData.graduationYear}
                        onChange={(e) => setTestData(prev => ({ ...prev, graduationYear: e.target.value }))}
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>

                {/* Individual Test Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Individual Tests</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {testCases.slice(0, -1).map((testCase) => (
                      <Button
                        key={testCase.id}
                        onClick={testCase.testFunction}
                        disabled={isRunning}
                        variant="outline"
                        className="justify-start"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {testCase.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Full Cycle Test */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Full Cycle Test</Label>
                  <Button
                    onClick={testFullCycle}
                    disabled={isRunning}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running Tests...
                      </>
                    ) : (
                      <>
                        <Bug className="h-4 w-4 mr-2" />
                        Run Full Cycle Test
                      </>
                    )}
                  </Button>
                </div>

                {/* Debug Actions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Debug Actions</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={clearDebugResults}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Results
                    </Button>
                    <Button
                      onClick={copyDebugResults}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Results
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Results */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Database className="h-5 w-5 text-blue-600" />
                  Debug Results
                  <Badge variant="secondary" className="ml-auto">
                    {debugResults.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {debugResults.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No debug results yet</p>
                      <p className="text-sm">Run a test to see results here</p>
                    </div>
                  ) : (
                    debugResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.success 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{result.operation}</span>
                              <span className="text-xs text-gray-500">{result.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{result.details}</p>
                            {result.error && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-red-600 hover:text-red-800">
                                  Error Details
                                </summary>
                                <pre className="mt-1 p-2 bg-red-100 rounded text-red-800 overflow-x-auto">
                                  {JSON.stringify(result.error, null, 2)}
                                </pre>
                              </details>
                            )}
                            {result.data && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                  Data
                                </summary>
                                <pre className="mt-1 p-2 bg-blue-100 rounded text-blue-800 overflow-x-auto">
                                  {JSON.stringify(result.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
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

export default function DebugProfilePageWrapper() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DebugProfilePage />
      </ProtectedRoute>
    </AuthProvider>
  )
} 