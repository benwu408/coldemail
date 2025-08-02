'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestProfilePage() {
  const { user } = useAuth()
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDatabaseConnection = async () => {
    setLoading(true)
    setTestResult('Testing...')
    
    try {
      // Test 1: Basic connection
      const { data: test1, error: error1 } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)
      
      setTestResult(prev => prev + '\n1. Basic connection: ' + (error1 ? 'FAILED - ' + error1.message : 'SUCCESS'))
      
      if (error1) {
        console.error('Test 1 failed:', error1)
        return
      }

      // Test 2: Check if user exists
      if (user?.id) {
        const { data: test2, error: error2 } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        setTestResult(prev => prev + '\n2. User profile check: ' + (error2 ? 'FAILED - ' + error2.message : 'SUCCESS - Found: ' + (test2 ? 'Yes' : 'No')))
        
        if (error2 && error2.code !== 'PGRST116') {
          console.error('Test 2 failed:', error2)
          return
        }

        // Test 3: Try to insert a simple profile
        const testProfile = {
          user_id: user.id,
          full_name: 'Test User',
          job_title: 'Test Job',
          company: 'Test Company',
          education: {
            school: 'Test School',
            degree: 'Test Degree',
            major: 'Test Major',
            graduation_year: '2020'
          },
          location: 'Test Location',
          industry: 'Test Industry',
          experience_years: '5-10',
          skills: ['Test Skill'],
          interests: ['Test Interest'],
          background: 'Test background',
          linkedin_url: 'https://test.com',
          website: 'https://test.com',
          updated_at: new Date().toISOString()
        }

        const { data: test3, error: error3 } = await supabase
          .from('user_profiles')
          .upsert(testProfile, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
        
        setTestResult(prev => prev + '\n3. Insert test: ' + (error3 ? 'FAILED - ' + error3.message : 'SUCCESS'))
        
        if (error3) {
          console.error('Test 3 failed:', error3)
          console.error('Error details:', {
            message: error3.message,
            details: error3.details,
            hint: error3.hint,
            code: error3.code
          })
        }
      } else {
        setTestResult(prev => prev + '\n2. User profile check: SKIPPED - No user ID')
      }

    } catch (error) {
      setTestResult(prev => prev + '\nERROR: ' + (error instanceof Error ? error.message : 'Unknown error'))
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Save Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
              <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
            </div>
            
            <Button 
              onClick={testDatabaseConnection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Run Database Tests'}
            </Button>
            
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 