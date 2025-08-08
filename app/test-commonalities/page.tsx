'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Users, FileText, Mail } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'

export default function TestCommonalities() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      console.log('Loading user profile...')
      
      // First get the current user to get their ID
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('User auth error:', userError)
        toast({
          title: "Authentication Error",
          description: "Please sign in to access this page",
          variant: "destructive",
        })
        return
      }

      console.log('User authenticated:', user.id)
      
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      })

      console.log('Profile response status:', response.status)
      console.log('Profile response headers:', response.headers)

      if (response.ok) {
        const profile = await response.json()
        console.log('Profile loaded:', profile)
        setUserProfile(profile)
      } else {
        const errorText = await response.text()
        console.error('Failed to load profile:', response.status, errorText)
        toast({
          title: "Error",
          description: `Failed to load profile: ${response.status} - ${errorText}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: `Error loading profile: ${error}`,
        variant: "destructive",
      })
    }
  }

  const runTest = async () => {
    if (!userProfile) {
      toast({
        title: "No Profile",
        description: "Please complete your profile first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTestResults(null)

    try {
      console.log('Starting commonalities test...')
      console.log('Using profile:', userProfile)

      // Simulated research findings
      const researchFindings = `## **Professional Background**
John Doe is a Senior Marketing Manager at Test Company with over 8 years of experience in digital marketing and brand strategy.

## **Education & Credentials**
Bachelor's degree in Marketing from University of California, Berkeley.

## **Career Experience**
- Senior Marketing Manager at Test Company (2020-Present)
- Marketing Specialist at Previous Corp (2018-2020)
- Marketing Intern at Startup Inc (2016-2018)

## **Achievements & Recognition**
- Led successful rebranding campaign that increased brand awareness by 40%
- Received "Marketing Excellence Award" in 2022

## **Professional Interests**
Specializes in digital marketing, brand strategy, and customer acquisition.`

      // Test commonalities generation
      const commonalitiesResponse = await fetch('/api/generate-commonalities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: 'John Doe',
          recipientCompany: 'Test Company',
          recipientRole: 'Senior Marketing Manager',
          researchFindings: researchFindings,
          senderProfile: userProfile
        }),
      })

      console.log('Commonalities response status:', commonalitiesResponse.status)
      const commonalitiesData = await commonalitiesResponse.json()
      console.log('Commonalities data:', commonalitiesData)

      if (!commonalitiesResponse.ok) {
        throw new Error(commonalitiesData.error || 'Failed to generate commonalities')
      }

      // Test final email generation
      const emailResponse = await fetch('/api/generate-final-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: 'John Doe',
          recipientCompany: 'Test Company',
          recipientRole: 'Senior Marketing Manager',
          recipientLinkedIn: 'https://linkedin.com/in/johndoe',
          purpose: 'Test commonalities generation',
          tone: 'professional',
          researchFindings: researchFindings,
          commonalities: commonalitiesData.commonalities,
          searchMode: 'deep'
        }),
      })

      console.log('Email response status:', emailResponse.status)
      const emailData = await emailResponse.json()
      console.log('Email data:', emailData)

      if (!emailResponse.ok) {
        throw new Error(emailData.error || 'Failed to generate final email')
      }

      setTestResults({
        research: researchFindings,
        commonalities: commonalitiesData.commonalities,
        email: emailData.email,
        emailId: emailData.emailId
      })

      toast({
        title: "Test Completed!",
        description: "Check the results below to verify profile usage.",
      })

    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      <Header />
      
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-[#6366F1]" />
            Simple Commonalities Test
          </h1>
          <p className="text-gray-600">
            Simple test to verify that commonalities generation uses your profile data correctly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Test Button */}
            <Card className="border border-gray-100 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#111827]">
                  Run Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={runTest} 
                  disabled={isLoading || !userProfile}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Test Commonalities
                    </>
                  )}
                </Button>
                {!userProfile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Loading profile...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* User Profile Display */}
            {userProfile && (
              <Card className="border border-gray-100 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#111827]">
                    Your Profile (Used in Test)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div><strong>Full Name:</strong> {userProfile.full_name || 'Not set'}</div>
                    <div><strong>Company:</strong> {userProfile.company || 'Not set'}</div>
                    <div><strong>Job Title:</strong> {userProfile.job_title || 'Not set'}</div>
                    <div><strong>Location:</strong> {userProfile.location || 'Not set'}</div>
                    <div><strong>Education:</strong> {
                      userProfile.education ? 
                        (() => {
                          try {
                            const edu = typeof userProfile.education === 'string' ? 
                              JSON.parse(userProfile.education) : userProfile.education
                            return `${edu.degree} in ${edu.major} from ${edu.school} (${edu.graduation_year})`
                          } catch (e) {
                            return userProfile.education
                          }
                        })() 
                        : 'Not set'
                    }</div>
                    <div><strong>Skills:</strong> {userProfile.skills ? userProfile.skills.join(', ') : 'Not set'}</div>
                    <div><strong>Interests:</strong> {userProfile.interests ? userProfile.interests.join(', ') : 'Not set'}</div>
                    <div><strong>LinkedIn:</strong> {userProfile.linkedin_url || 'Not set'}</div>
                    <div><strong>Background:</strong> {userProfile.background || 'Not set'}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Test Results */}
          <div className="space-y-6">
            {testResults ? (
              <>
                {/* Commonalities */}
                <Card className="border border-gray-100 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#111827] flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Commonalities/Connections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{testResults.commonalities}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                {/* Generated Email */}
                <Card className="border border-gray-100 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#111827] flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Generated Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{testResults.email}</ReactMarkdown>
                    </div>
                    {testResults.emailId && (
                      <div className="mt-4 text-xs text-gray-500">
                        <strong>Email ID:</strong> {testResults.emailId}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border border-gray-100 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-[#111827]">
                    Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    Click "Test Commonalities" to start testing
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