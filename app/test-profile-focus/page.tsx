'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'
import { Loader2, User, Briefcase, Code, Heart } from 'lucide-react'
import Header from '@/components/Header'

interface ProfileData {
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
  job_experiences: {
    company: string
    title: string
    start_date: string
    end_date: string
    description: string
    is_current: boolean
  }[]
  skills: string[]
  interests: string[]
  background: string
  linkedin_url: string
  website: string
}

function ProfileFocusTester() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [testResults, setTestResults] = useState<string[]>([])
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    job_title: '',
    company: '',
    education: {
      school: '',
      degree: '',
      major: '',
      graduation_year: ''
    },
    location: '',
    industry: '',
    experience_years: '',
    job_experiences: [],
    skills: [],
    interests: [],
    background: '',
    linkedin_url: '',
    website: ''
  })
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const profileRef = useRef<ProfileData>(profile)

  // Update ref whenever profile changes
  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  // Add test result
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  // Monitor profile changes
  useEffect(() => {
    addTestResult(`Profile state changed - full_name: "${profile.full_name}"`)
  }, [profile.full_name])

  useEffect(() => {
    addTestResult(`Profile state changed - job_title: "${profile.job_title}"`)
  }, [profile.job_title])

  useEffect(() => {
    addTestResult(`Profile state changed - company: "${profile.company}"`)
  }, [profile.company])

  useEffect(() => {
    addTestResult(`Profile state changed - industry: "${profile.industry}"`)
  }, [profile.industry])

  useEffect(() => {
    addTestResult(`Profile state changed - background: "${profile.background}"`)
  }, [profile.background])

  useEffect(() => {
    addTestResult(`Profile state changed - job_experiences length: ${profile.job_experiences.length}`)
  }, [profile.job_experiences])

  useEffect(() => {
    addTestResult(`Profile state changed - skills: [${profile.skills.join(', ')}]`)
  }, [profile.skills])

  useEffect(() => {
    addTestResult(`Profile state changed - interests: [${profile.interests.join(', ')}]`)
  }, [profile.interests])

  useEffect(() => {
    addTestResult(`Profile state changed - linkedin_url: "${profile.linkedin_url}"`)
  }, [profile.linkedin_url])

  useEffect(() => {
    addTestResult(`Profile state changed - website: "${profile.website}"`)
  }, [profile.website])

  // Monitor auto-save timeout changes
  useEffect(() => {
    addTestResult(`Auto-save timeout changed: ${autoSaveTimeout ? 'set' : 'cleared'}`)
  }, [autoSaveTimeout])

  useEffect(() => {
    if (user) {
      setIsLoading(false)
    }
  }, [user])

  const saveProfileSilently = useCallback(async (profileData: ProfileData) => {
    addTestResult(`Auto-save triggered with full_name: "${profileData.full_name}"`)
    // Don't actually save, just log
  }, [])

  const triggerAutoSave = useCallback(() => {
    addTestResult('triggerAutoSave called')
    // Clear any existing timeout to prevent multiple saves
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
      addTestResult('Cleared existing auto-save timeout')
    }
    
    // Set new timeout for debounced auto-save
    const timeout = setTimeout(() => {
      addTestResult('Auto-save timeout executed')
      // Use the current profile state at the time of save
      saveProfileSilently(profileRef.current)
      setAutoSaveTimeout(null)
    }, 2000)
    
    setAutoSaveTimeout(timeout)
    addTestResult('Set new auto-save timeout')
  }, [autoSaveTimeout, saveProfileSilently])

  const handleInputChange = (field: string, value: any) => {
    addTestResult(`handleInputChange called - field: ${field}, value: "${value}"`)
    const newProfile = {
      ...profile,
      [field]: value
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const handleEducationChange = (field: string, value: string) => {
    addTestResult(`handleEducationChange called - field: ${field}, value: "${value}"`)
    const newProfile = {
      ...profile,
      education: {
        ...profile.education,
        [field]: value
      }
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const handleArrayChange = (field: 'skills' | 'interests', value: string) => {
    addTestResult(`handleArrayChange called - field: ${field}, value: "${value}"`)
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    const newProfile = {
      ...profile,
      [field]: items
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const addJobExperience = () => {
    addTestResult('addJobExperience called')
    const newExperience = {
      company: '',
      title: '',
      start_date: '',
      end_date: '',
      description: '',
      is_current: false
    }
    const newProfile = {
      ...profile,
      job_experiences: [...profile.job_experiences, newExperience]
    }
    setProfile(newProfile)
  }

  const removeJobExperience = (index: number) => {
    addTestResult(`removeJobExperience called - index: ${index}`)
    const newProfile = {
      ...profile,
      job_experiences: profile.job_experiences.filter((_, i) => i !== index)
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const handleJobExperienceChange = (index: number, field: string, value: string | boolean) => {
    addTestResult(`handleJobExperienceChange called - index: ${index}, field: ${field}, value: "${value}"`)
    const newProfile = {
      ...profile,
      job_experiences: profile.job_experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const handleCurrentJobChange = (index: number, isCurrent: boolean) => {
    addTestResult(`handleCurrentJobChange called - index: ${index}, isCurrent: ${isCurrent}`)
    const newProfile = {
      ...profile,
      job_experiences: profile.job_experiences.map((exp, i) => 
        i === index ? { 
          ...exp, 
          is_current: isCurrent,
          end_date: isCurrent ? '' : exp.end_date // Clear end date if current job
        } : exp
      )
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const clearTestResults = () => {
    setTestResults([])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading tester...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Focus Tester</h1>
          <p className="text-gray-600">
            Test each input field to see which ones cause focus loss. Watch the logs below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information (Working)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-full_name">Full Name</Label>
                  <Input
                    id="test-full_name"
                    value={profile.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Type here to test..."
                  />
                </div>
                <div>
                  <Label htmlFor="test-job_title">Job Title</Label>
                  <Input
                    id="test-job_title"
                    value={profile.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="Type here to test..."
                  />
                </div>
                <div>
                  <Label htmlFor="test-company">Company</Label>
                  <Input
                    id="test-company"
                    value={profile.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Type here to test..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information (Problematic)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-industry">Industry</Label>
                  <Input
                    id="test-industry"
                    value={profile.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="Type here to test..."
                  />
                </div>
                <div>
                  <Label htmlFor="test-background">Background</Label>
                  <Textarea
                    id="test-background"
                    value={profile.background}
                    onChange={(e) => handleInputChange('background', e.target.value)}
                    placeholder="Type here to test..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills & Interests (Problematic)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-skills">Skills</Label>
                  <Input
                    id="test-skills"
                    value={profile.skills.join(', ')}
                    onChange={(e) => handleArrayChange('skills', e.target.value)}
                    placeholder="Type here to test..."
                  />
                </div>
                <div>
                  <Label htmlFor="test-interests">Interests</Label>
                  <Input
                    id="test-interests"
                    value={profile.interests.join(', ')}
                    onChange={(e) => handleArrayChange('interests', e.target.value)}
                    placeholder="Type here to test..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Professional Links (Problematic)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="test-linkedin_url"
                    value={profile.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="Type here to test..."
                  />
                </div>
                <div>
                  <Label htmlFor="test-website">Website</Label>
                  <Input
                    id="test-website"
                    value={profile.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Type here to test..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Experience Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={addJobExperience} className="w-full">
                  Add Job Experience
                </Button>
                
                {profile.job_experiences.map((experience, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJobExperience(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`test-company-${index}`}>Company</Label>
                        <Input
                          id={`test-company-${index}`}
                          value={experience.company}
                          onChange={(e) => handleJobExperienceChange(index, 'company', e.target.value)}
                          placeholder="Type here to test..."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`test-title-${index}`}>Job Title</Label>
                        <Input
                          id={`test-title-${index}`}
                          value={experience.title}
                          onChange={(e) => handleJobExperienceChange(index, 'title', e.target.value)}
                          placeholder="Type here to test..."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`test-description-${index}`}>Description</Label>
                        <Textarea
                          id={`test-description-${index}`}
                          value={experience.description}
                          onChange={(e) => handleJobExperienceChange(index, 'description', e.target.value)}
                          placeholder="Type here to test..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Results & Logs</CardTitle>
                <Button onClick={clearTestResults} variant="outline" size="sm">
                  Clear Logs
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                  {testResults.length === 0 ? (
                    <p className="text-gray-500">Start typing in the fields above to see logs...</p>
                  ) : (
                    testResults.map((result, index) => (
                      <div key={index} className="mb-1">
                        {result}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Profile State</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default function ProfileFocusTesterPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ProfileFocusTester />
      </ProtectedRoute>
    </AuthProvider>
  )
} 