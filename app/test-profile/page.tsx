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

  const testUIUCTruncation = async () => {
    setIsLoading(true)
    addLog('=== Testing UIUC Truncation Issue ===')
    
    try {
      addLog(`User ID: ${user?.id}`)
      
      // Test data with UIUC
      const testDataWithUIUC = {
        ...testData,
        education: {
          ...testData.education,
          school: 'University of Illinois Urbana-Champaign (UIUC)'
        }
      }
      
      addLog(`Test data with UIUC: ${JSON.stringify(testDataWithUIUC, null, 2)}`)
      
      // First, save the data
      const saveResponse = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(testDataWithUIUC),
      })

      addLog(`Save response status: ${saveResponse.status}`)
      const saveResponseText = await saveResponse.text()
      addLog(`Save response: ${saveResponseText}`)

      if (saveResponse.ok) {
        addLog('✅ Profile save successful')
        
        // Now load the data back to see what was actually saved
        addLog('Loading profile to check what was saved...')
        
        const loadResponse = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id}`,
          },
        })

        addLog(`Load response status: ${loadResponse.status}`)
        const loadResponseText = await loadResponse.text()
        addLog(`Load response: ${loadResponseText}`)

        if (loadResponse.ok) {
          const loadedData = JSON.parse(loadResponseText)
          addLog('✅ Profile load successful')
          addLog(`Loaded education data: ${JSON.stringify(loadedData.education, null, 2)}`)
          
          const originalSchool = testDataWithUIUC.education.school
          const savedSchool = loadedData.education?.school
          
          addLog(`Original school: "${originalSchool}" (length: ${originalSchool.length})`)
          addLog(`Saved school: "${savedSchool}" (length: ${savedSchool?.length || 0})`)
          
          if (originalSchool === savedSchool) {
            addLog('✅ School name saved correctly - no truncation')
          } else {
            addLog('❌ School name was truncated or modified')
            addLog(`Difference: "${originalSchool}" vs "${savedSchool}"`)
          }
        } else {
          addLog(`❌ Profile load failed: ${loadResponse.status}`)
        }
      } else {
        addLog(`❌ Profile save failed: ${saveResponse.status}`)
      }
    } catch (error) {
      addLog(`❌ UIUC truncation test error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabaseSchema = async () => {
    setIsLoading(true)
    addLog('=== Testing Database Schema ===')
    
    try {
      addLog('Testing database column constraints...')
      
      const response = await fetch('/api/test-schema', {
        method: 'GET',
      })

      addLog(`Response status: ${response.status}`)
      const responseText = await response.text()
      addLog(`Raw response: ${responseText}`)

      if (response.ok) {
        addLog('✅ Database schema test successful')
      } else {
        addLog(`❌ Database schema test failed: ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ Database schema test error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testLastCharacterTruncation = async () => {
    setIsLoading(true)
    addLog('=== Testing Last Character Truncation ===')
    
    try {
      addLog(`User ID: ${user?.id}`)
      
      // Test multiple strings with different endings to identify the pattern
      const testStrings = [
        'UIUC',
        'University of Illinois Urbana-Champaign',
        'MIT',
        'Stanford University',
        'Harvard',
        'Test String',
        'A',
        'AB',
        'ABC',
        'ABCD',
        'ABCDE'
      ]
      
      for (const testString of testStrings) {
        addLog(`\n--- Testing: "${testString}" (length: ${testString.length}) ---`)
        
        const testDataWithString = {
          ...testData,
          education: {
            ...testData.education,
            school: testString
          }
        }
        
        // Save the data
        const saveResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id}`,
          },
          body: JSON.stringify(testDataWithString),
        })

        if (saveResponse.ok) {
          // Load the data back
          const loadResponse = await fetch('/api/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.id}`,
            },
          })

          if (loadResponse.ok) {
            const loadedData = await loadResponse.json()
            const savedSchool = loadedData.education?.school || ''
            
            addLog(`Original: "${testString}" (${testString.length} chars)`)
            addLog(`Saved:    "${savedSchool}" (${savedSchool.length} chars)`)
            
            if (testString === savedSchool) {
              addLog('✅ No truncation')
            } else {
              addLog('❌ TRUNCATED!')
              addLog(`Difference: "${testString}" vs "${savedSchool}"`)
              
              // Check if it's the last character
              if (savedSchool === testString.slice(0, -1)) {
                addLog('🔍 PATTERN: Last character was cut off!')
              } else if (savedSchool === testString.slice(1)) {
                addLog('🔍 PATTERN: First character was cut off!')
              } else {
                addLog('🔍 PATTERN: Different truncation pattern')
              }
            }
          } else {
            addLog(`❌ Failed to load profile for "${testString}"`)
          }
        } else {
          addLog(`❌ Failed to save profile for "${testString}"`)
        }
      }
      
      addLog('\n=== Truncation Test Summary ===')
      addLog('This test helps identify if there\'s a consistent pattern')
      addLog('to the character truncation issue.')
      
    } catch (error) {
      addLog(`❌ Last character truncation test error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testStringProcessing = async () => {
    setIsLoading(true)
    addLog('=== Testing String Processing ===')
    
    try {
      addLog('Testing if the issue is in string processing...')
      
      // Test with a string that has special characters and spaces
      const testString = 'University of Illinois Urbana-Champaign (UIUC) - Test String with Spaces and Special Characters!'
      
      addLog(`Test string: "${testString}"`)
      addLog(`Length: ${testString.length}`)
      addLog(`Last character: "${testString.slice(-1)}"`)
      addLog(`Last 5 characters: "${testString.slice(-5)}"`)
      
      // Test JSON stringify/parse
      const jsonString = JSON.stringify({ school: testString })
      addLog(`JSON stringified: ${jsonString}`)
      
      const parsed = JSON.parse(jsonString)
      addLog(`JSON parsed: "${parsed.school}"`)
      addLog(`Parsed length: ${parsed.school.length}`)
      
      if (testString === parsed.school) {
        addLog('✅ JSON processing works correctly')
      } else {
        addLog('❌ JSON processing is causing truncation')
      }
      
      // Test the actual API call
      const testDataWithString = {
        ...testData,
        education: {
          ...testData.education,
          school: testString
        }
      }
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(testDataWithString),
      })

      addLog(`API response status: ${response.status}`)
      const responseText = await response.text()
      addLog(`API response: ${responseText}`)
      
    } catch (error) {
      addLog(`❌ String processing test error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testAutoSaveTruncation = async () => {
    setIsLoading(true)
    addLog('=== Testing Auto-Save Truncation ===')
    
    try {
      addLog(`User ID: ${user?.id}`)
      
      // Test string that should trigger truncation
      const testString = 'UIUC'
      addLog(`Testing with: "${testString}" (length: ${testString.length})`)
      
      // First, save a clean profile
      const initialData = {
        ...testData,
        education: {
          ...testData.education,
          school: 'Initial School'
        }
      }
      
      addLog('Step 1: Saving initial profile...')
      const initialSaveResponse = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(initialData),
      })

      if (!initialSaveResponse.ok) {
        addLog('❌ Failed to save initial profile')
        return
      }
      addLog('✅ Initial profile saved')

      // Step 2: Load the profile to see initial state
      addLog('Step 2: Loading initial profile...')
      const initialLoadResponse = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (initialLoadResponse.ok) {
        const initialData = await initialLoadResponse.json()
        addLog(`Initial school: "${initialData.education?.school}"`)
      }

      // Step 3: Simulate auto-save by calling the API multiple times with the test string
      addLog('Step 3: Simulating auto-save with test string...')
      
      for (let i = 1; i <= 3; i++) {
        addLog(`Auto-save attempt ${i}...`)
        
        const autoSaveData = {
          ...testData,
          education: {
            ...testData.education,
            school: testString
          }
        }
        
        const autoSaveResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id}`,
          },
          body: JSON.stringify(autoSaveData),
        })

        if (autoSaveResponse.ok) {
          addLog(`✅ Auto-save ${i} successful`)
          
          // Immediately load to check what was saved
          const checkResponse = await fetch('/api/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.id}`,
            },
          })

          if (checkResponse.ok) {
            const checkData = await checkResponse.json()
            const savedSchool = checkData.education?.school || ''
            
            addLog(`After auto-save ${i}: "${savedSchool}" (${savedSchool.length} chars)`)
            
            if (testString !== savedSchool) {
              addLog(`❌ TRUNCATION DETECTED after auto-save ${i}!`)
              addLog(`Expected: "${testString}" vs Got: "${savedSchool}"`)
              
              if (savedSchool === testString.slice(0, -1)) {
                addLog('🔍 PATTERN: Last character was cut off during auto-save!')
              }
            } else {
              addLog(`✅ No truncation after auto-save ${i}`)
            }
          }
        } else {
          addLog(`❌ Auto-save ${i} failed`)
        }
      }
      
      addLog('\n=== Auto-Save Test Summary ===')
      addLog('This test simulates the auto-save behavior to see')
      addLog('if the truncation happens during rapid saves.')
      
    } catch (error) {
      addLog(`❌ Auto-save truncation test error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDebouncedAutoSave = async () => {
    setIsLoading(true)
    addLog('=== Testing Debounced Auto-Save ===')
    
    try {
      addLog(`User ID: ${user?.id}`)
      
      const testString = 'UIUC'
      addLog(`Testing with: "${testString}"`)
      
      // Simulate rapid changes like the auto-save would do
      addLog('Simulating rapid auto-save calls...')
      
      const promises = []
      for (let i = 1; i <= 5; i++) {
        addLog(`Queuing auto-save call ${i}...`)
        
        const promise = fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id}`,
          },
          body: JSON.stringify({
            ...testData,
            education: {
              ...testData.education,
              school: testString
            }
          }),
        }).then(async (response) => {
          if (response.ok) {
            // Check what was actually saved
            const checkResponse = await fetch('/api/profile', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.id}`,
              },
            })
            
            if (checkResponse.ok) {
              const checkData = await checkResponse.json()
              return checkData.education?.school || ''
            }
          }
          return null
        })
        
        promises.push(promise)
      }
      
      // Wait for all auto-save calls to complete
      addLog('Waiting for all auto-save calls to complete...')
      const results = await Promise.all(promises)
      
      addLog('Results:')
      results.forEach((result, index) => {
        if (result) {
          addLog(`Auto-save ${index + 1}: "${result}" (${result.length} chars)`)
          if (result !== testString) {
            addLog(`❌ Truncation detected in auto-save ${index + 1}!`)
          }
        } else {
          addLog(`Auto-save ${index + 1}: Failed`)
        }
      })
      
    } catch (error) {
      addLog(`❌ Debounced auto-save test error: ${error}`)
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
                  onClick={testUIUCTruncation} 
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test UIUC Truncation
                </Button>
                
                <Button 
                  onClick={testDatabaseSchema} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test Database Schema
                </Button>
                
                <Button 
                  onClick={testLastCharacterTruncation} 
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test Last Char Truncation
                </Button>
                
                <Button 
                  onClick={testStringProcessing} 
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test String Processing
                </Button>
                
                <Button 
                  onClick={testAutoSaveTruncation} 
                  disabled={isLoading}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test Auto-Save Truncation
                </Button>

                <Button 
                  onClick={testDebouncedAutoSave} 
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Test Debounced Auto-Save
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