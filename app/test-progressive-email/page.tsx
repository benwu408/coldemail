'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, TestTube } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

export default function TestProgressiveEmail() {
  const { toast } = useToast()
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    recipientName: 'John Doe',
    recipientCompany: 'Test Company',
    recipientRole: 'Test Role',
    recipientLinkedIn: 'https://linkedin.com/in/johndoe',
    purpose: 'Test email generation',
    tone: 'professional',
    testMode: 'full'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const runTest = async () => {
    setIsTesting(true)
    setTestResults(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to run tests.",
          variant: "destructive",
        })
        return
      }

      setUser(user)

      const response = await fetch('/api/test-progressive-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify(formData),
      })

      const results = await response.json()

      if (!response.ok) {
        throw new Error(results.error || 'Test failed')
      }

      setTestResults(results)

      // Check if all tests passed
      const allPassed = Object.values(results).every((test: any) => test.success)
      
      if (allPassed) {
        toast({
          title: "All Tests Passed!",
          description: "Progressive email generation is working correctly.",
        })
      } else {
        toast({
          title: "Some Tests Failed",
          description: "Check the results below for details.",
          variant: "destructive",
        })
      }

    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const renderTestResult = (testName: string, result: any) => {
    const isSuccess = result.success
    const details = result.details

    return (
      <Card key={testName} className={`mb-4 ${isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-sm font-semibold ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
            {testName}: {isSuccess ? '✅ PASSED' : '❌ FAILED'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(details, null, 2)}
          </pre>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      <Header />
      
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-4 flex items-center gap-3">
            <TestTube className="h-8 w-8 text-[#6366F1]" />
            Progressive Email Generation Test
          </h1>
          <p className="text-gray-600">
            Comprehensive test for the progressive email generation system to debug database saving issues.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <Card className="border border-gray-100 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#111827]">
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="recipientCompany">Recipient Company</Label>
                <Input
                  id="recipientCompany"
                  value={formData.recipientCompany}
                  onChange={(e) => handleInputChange('recipientCompany', e.target.value)}
                  placeholder="Test Company"
                />
              </div>

              <div>
                <Label htmlFor="recipientRole">Recipient Role</Label>
                <Input
                  id="recipientRole"
                  value={formData.recipientRole}
                  onChange={(e) => handleInputChange('recipientRole', e.target.value)}
                  placeholder="Test Role"
                />
              </div>

              <div>
                <Label htmlFor="recipientLinkedIn">Recipient LinkedIn</Label>
                <Input
                  id="recipientLinkedIn"
                  value={formData.recipientLinkedIn}
                  onChange={(e) => handleInputChange('recipientLinkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div>
                <Label htmlFor="purpose">Email Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="Test email generation"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tone">Email Tone</Label>
                <Input
                  id="tone"
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                  placeholder="professional"
                />
              </div>

              <div>
                <Label htmlFor="testMode">Test Mode</Label>
                <select
                  id="testMode"
                  value={formData.testMode}
                  onChange={(e) => handleInputChange('testMode', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="full">Full Test (All Phases)</option>
                  <option value="email-only">Email Generation Only</option>
                </select>
              </div>

              <Button 
                onClick={runTest} 
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Run Comprehensive Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="space-y-4">
            <Card className="border border-gray-100 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#111827]">
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults ? (
                  <div className="space-y-4">
                    {Object.entries(testResults).map(([testName, result]) => 
                      renderTestResult(testName, result)
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Click "Run Comprehensive Test" to start testing
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Info */}
            {user && (
              <Card className="border border-gray-100 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#111827]">
                    Current User
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div><strong>ID:</strong> {user.id}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 