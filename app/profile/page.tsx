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
import { 
  User, 
  Building, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  Code, 
  Heart, 
  Loader2,
  Crown,
  Lock,
  Plus,
  Trash2
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubscriptionDashboard from '@/components/SubscriptionDashboard'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

function ProfilePageContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userSubscription, setUserSubscription] = useState<{ plan_name: string, status: string } | null>(null)
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
  const [skillsDisplay, setSkillsDisplay] = useState('')
  const [interestsDisplay, setInterestsDisplay] = useState('')

  // Update ref whenever profile changes
  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Parse JSON strings for education and job_experiences
        let parsedData = { ...data }
        
        // Parse education if it's a JSON string
        if (typeof data.education === 'string') {
          try {
            parsedData.education = JSON.parse(data.education)
          } catch (e) {
            console.error('Error parsing education:', e)
            parsedData.education = {
              school: null,
              degree: null,
              major: null,
              graduation_year: null
            }
          }
        }
        
        // Parse job_experiences if it's a JSON string
        if (typeof data.job_experiences === 'string') {
          try {
            parsedData.job_experiences = JSON.parse(data.job_experiences)
          } catch (e) {
            console.error('Error parsing job_experiences:', e)
            parsedData.job_experiences = []
          }
        }
        
        // Ensure skills and interests are arrays
        if (!Array.isArray(parsedData.skills)) {
          parsedData.skills = []
        }
        if (!Array.isArray(parsedData.interests)) {
          parsedData.interests = []
        }
        
        setProfile(parsedData)
        
        // Set display values for skills and interests
        setSkillsDisplay(parsedData.skills.join(', '))
        setInterestsDisplay(parsedData.interests.join(', '))
        
        // Set subscription status from profile data
        setUserSubscription({
          plan_name: data.subscription_plan,
          status: data.subscription_status
        })
      } else {
        console.error('Failed to load profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const ProOnlyField = ({ children, label }: { children: React.ReactNode, label?: string }) => {
    // Check both plan and status
    if (userSubscription?.plan_name === 'pro' && userSubscription?.status === 'active') {
      return <>{children}</>
    }
    
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              {label || 'This feature is available for Pro users'}
            </p>
            <Link href="/pricing">
              <Button size="sm">Upgrade to Pro</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const BasicInfoProField = ({ children }: { children: React.ReactNode }) => {
    // Check both plan and status
    if (userSubscription?.plan_name === 'pro' && userSubscription?.status === 'active') {
      return <>{children}</>
    }
    
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Button size="sm">Upgrade to Pro</Button>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is Pro once and store it
  const isProUser = userSubscription?.plan_name === 'pro'

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(profile),
      })

      const responseData = await response.json()

      if (response.ok) {
        toast({
          title: "Profile Saved!",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error(responseData.error || responseData.details || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const saveProfileSilently = useCallback(async (profileData: ProfileData) => {
    try {
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
      } else {
      }
    } catch (error) {
      console.error('Error saving profile silently:', error)
    }
  }, [user?.id])

  const triggerAutoSave = useCallback(() => {
    // Clear any existing timeout to prevent multiple saves
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    // Set new timeout for debounced auto-save
    const timeout = setTimeout(() => {
      // Use the current profile state at the time of save
      saveProfileSilently(profileRef.current)
      setAutoSaveTimeout(null)
    }, 2000)
    
    setAutoSaveTimeout(timeout)
  }, [autoSaveTimeout, saveProfileSilently])

  const handleInputChange = (field: string, value: any) => {
    const newProfile = {
      ...profile,
      [field]: value
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const handleEducationChange = (field: string, value: string) => {
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
    // Update the display value immediately for natural typing
    if (field === 'skills') {
      setSkillsDisplay(value)
    } else if (field === 'interests') {
      setInterestsDisplay(value)
    }
    
    // Process the array for saving
    const processedItems = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
    
    const newProfile = {
      ...profile,
      [field]: processedItems
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const addJobExperience = () => {
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
    const newProfile = {
      ...profile,
      job_experiences: profile.job_experiences.filter((_, i) => i !== index)
    }
    setProfile(newProfile)
    
    // Use the optimized triggerAutoSave instead of inline logic
    triggerAutoSave()
  }

  const handleJobExperienceChange = (index: number, field: string, value: string | boolean) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-600">
            Complete your profile to help AI generate more personalized emails with better connections.
          </p>
        </div>

        <div className="space-y-6">
          {/* Subscription Management */}
          <SubscriptionDashboard />

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={profile.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school">School/University</Label>
                  <Input
                    id="school"
                    value={profile.education.school}
                    onChange={(e) => handleEducationChange('school', e.target.value)}
                    placeholder="e.g., University of Illinois"
                  />
                </div>
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={profile.education.degree}
                    onChange={(e) => handleEducationChange('degree', e.target.value)}
                    placeholder="e.g., Bachelor's"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="major">Major/Field of Study</Label>
                  <Input
                    id="major"
                    value={profile.education.major}
                    onChange={(e) => handleEducationChange('major', e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    value={profile.education.graduation_year}
                    onChange={(e) => handleEducationChange('graduation_year', e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          {isProUser ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={profile.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="e.g., Technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      value={profile.experience_years}
                      onChange={(e) => handleInputChange('experience_years', e.target.value)}
                      placeholder="e.g., 3-5 years"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="background">Professional Background</Label>
                  <Textarea
                    id="background"
                    value={profile.background}
                    onChange={(e) => handleInputChange('background', e.target.value)}
                    placeholder="Brief description of your professional background, key achievements, and career goals..."
                    rows={3}
                  />
                </div>

                {/* Job Experiences Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addJobExperience}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>
                  
                  {profile.job_experiences.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No work experience added yet.</p>
                      <p className="text-sm">Click "Add Experience" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile.job_experiences.map((experience, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeJobExperience(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`company-${index}`}>Company</Label>
                              <Input
                                id={`company-${index}`}
                                value={experience.company}
                                onChange={(e) => handleJobExperienceChange(index, 'company', e.target.value)}
                                placeholder="e.g., Google"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`title-${index}`}>Job Title</Label>
                              <Input
                                id={`title-${index}`}
                                value={experience.title}
                                onChange={(e) => handleJobExperienceChange(index, 'title', e.target.value)}
                                placeholder="e.g., Senior Software Engineer"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                              <Input
                                id={`start-date-${index}`}
                                type="month"
                                value={experience.start_date}
                                onChange={(e) => handleJobExperienceChange(index, 'start_date', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`end-date-${index}`}>End Date</Label>
                              <Input
                                id={`end-date-${index}`}
                                type="month"
                                value={experience.end_date}
                                onChange={(e) => handleJobExperienceChange(index, 'end_date', e.target.value)}
                                disabled={experience.is_current}
                                placeholder={experience.is_current ? "Current Position" : ""}
                              />
                              <div className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  id={`current-${index}`}
                                  checked={experience.is_current}
                                  onChange={(e) => handleCurrentJobChange(index, e.target.checked)}
                                  className="mr-2"
                                />
                                <Label htmlFor={`current-${index}`} className="text-sm">
                                  I currently work here
                                </Label>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`description-${index}`}>Job Description</Label>
                            <Textarea
                              id={`description-${index}`}
                              value={experience.description}
                              onChange={(e) => handleJobExperienceChange(index, 'description', e.target.value)}
                              placeholder="Describe your role, responsibilities, and key achievements..."
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Professional Information is available for Pro users
                  </p>
                  <Link href="/pricing">
                    <Button size="sm">Upgrade to Pro</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills & Interests */}
          {isProUser ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills & Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={skillsDisplay}
                    onChange={(e) => handleArrayChange('skills', e.target.value)}
                    placeholder="e.g., JavaScript, React, Product Management, Data Analysis"
                  />
                </div>
                <div>
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={interestsDisplay}
                    onChange={(e) => handleArrayChange('interests', e.target.value)}
                    placeholder="e.g., AI, Startups, Photography, Travel"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills & Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Skills & Interests is available for Pro users
                  </p>
                  <Link href="/pricing">
                    <Button size="sm">Upgrade to Pro</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {isProUser ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Professional Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    value={profile.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Professional Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Professional Links is available for Pro users
                  </p>
                  <Link href="/pricing">
                    <Button size="sm">Upgrade to Pro</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <Button
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signOut()
                  if (error) {
                    toast({
                      title: "Error",
                      description: "Failed to sign out. Please try again.",
                      variant: "destructive",
                    })
                  } else {
                    toast({
                      title: "Signed Out",
                      description: "You have been successfully signed out.",
                    })
                    // Redirect will be handled by the auth context
                    window.location.href = '/'
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to sign out. Please try again.",
                    variant: "destructive",
                  })
                }
              }}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            >
              Sign Out
            </Button>
            
            <Button
              onClick={saveProfile}
              disabled={isSaving}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ProfilePageContent />
      </ProtectedRoute>
    </AuthProvider>
  )
} 

