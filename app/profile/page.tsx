'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [userSubscription, setUserSubscription] = useState<{ plan_name: string } | null>(null)
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

  useEffect(() => {
    if (user) {
      loadProfile()
      loadUserSubscription()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Profile loaded successfully:', data)
        console.log('Education data from database:', data.education)
        console.log('School value from database:', data.education?.school)
        console.log('School value type:', typeof data.education?.school)
        console.log('School value length:', data.education?.school?.length)

        // Ensure education object exists and has proper structure
        const education = data.education || {}
        const parsedEducation = {
          school: education.school || '',
          degree: education.degree || '',
          major: education.major || '',
          graduation_year: education.graduation_year || ''
        }

        console.log('Parsed education data:', parsedEducation)

        setProfile({
          ...data,
          full_name: data.full_name || '',
          job_title: data.job_title || '',
          company: data.company || '',
          education: parsedEducation,
          location: data.location || '',
          industry: data.industry || '',
          experience_years: data.experience_years || '',
          job_experiences: data.job_experiences || [],
          skills: data.skills || [],
          interests: data.interests || [],
          background: data.background || '',
          linkedin_url: data.linkedin_url || '',
          website: data.website || ''
        })

        // Log the profile state after setting it
        console.log('Profile state after setting:', {
          ...data,
          full_name: data.full_name || '',
          job_title: data.job_title || '',
          company: data.company || '',
          education: parsedEducation,
          location: data.location || '',
          industry: data.industry || '',
          experience_years: data.experience_years || '',
          job_experiences: data.job_experiences || [],
          skills: data.skills || [],
          interests: data.interests || [],
          background: data.background || '',
          linkedin_url: data.linkedin_url || '',
          website: data.website || '',
          resume_text: data.resume_text || '',
          resume_filename: data.resume_filename || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserSubscription = async () => {
    try {
      const { data: subscriptionData, error } = await supabase.rpc('get_user_subscription', {
        user_uuid: user?.id
      })

      if (error) {
        console.error('Error fetching subscription:', error)
        // Default to free plan on error
        setUserSubscription({ plan_name: 'free' })
      } else if (subscriptionData && subscriptionData.length > 0) {
        setUserSubscription(subscriptionData[0])
      } else {
        // Default to free plan if no subscription found
        setUserSubscription({ plan_name: 'free' })
      }
    } catch (error) {
      console.error('Error in loadUserSubscription:', error)
      setUserSubscription({ plan_name: 'free' })
    }
  }

  const isPro = userSubscription?.plan_name === 'pro'

  // Component for Pro-only fields
  const ProOnlyField = ({ children, label }: { children: React.ReactNode, label?: string }) => {
    if (isPro) {
      return <>{children}</>
    }
    
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-4">
            <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Pro Feature</p>
            <p className="text-xs text-gray-500 mb-3">
              {label ? `${label} is` : 'This field is'} only available to Pro users
            </p>
            <Link href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00">
              <Button size="sm" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                <Crown className="mr-1 h-3 w-3" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Simplified component for basic info fields - just shows centered upgrade button
  const BasicInfoProField = ({ children }: { children: React.ReactNode }) => {
    if (isPro) {
      return <>{children}</>
    }
    
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg border-2 border-dashed border-gray-300">
          <Link href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00">
            <Button size="sm" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
              <Crown className="mr-1 h-3 w-3" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      console.log('Sending profile data:', profile)
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(profile),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        toast({
          title: "Profile Saved!",
          description: "Your profile has been updated successfully.",
        })
      } else {
        console.error('API error response:', responseData)
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
      console.log('Auto-saving profile with data:', profileData)
      console.log('School value being saved:', profileData.education?.school)
      console.log('School value length:', profileData.education?.school?.length)
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        console.error('Failed to save profile silently')
        const errorData = await response.json()
        console.error('Error details:', errorData)
      } else {
        console.log('Auto-save successful')
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
      saveProfileSilently(profile)
      setAutoSaveTimeout(null)
    }, 1000)
    
    setAutoSaveTimeout(timeout)
  }, [autoSaveTimeout, saveProfileSilently, profile])

  const handleInputChange = (field: string, value: any) => {
    const newProfile = {
      ...profile,
      [field]: value
    }
    setProfile(newProfile)
    
    // Trigger auto-save with the new profile data
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    const timeout = setTimeout(() => {
      saveProfileSilently(newProfile)
      setAutoSaveTimeout(null)
    }, 1000)
    
    setAutoSaveTimeout(timeout)
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
    
    // Trigger auto-save with the new profile data
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    const timeout = setTimeout(() => {
      saveProfileSilently(newProfile)
      setAutoSaveTimeout(null)
    }, 1000)
    
    setAutoSaveTimeout(timeout)
  }

  const handleArrayChange = (field: 'skills' | 'interests', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    const newProfile = {
      ...profile,
      [field]: items
    }
    setProfile(newProfile)
    
    // Trigger auto-save with the new profile data
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    const timeout = setTimeout(() => {
      saveProfileSilently(newProfile)
      setAutoSaveTimeout(null)
    }, 1000)
    
    setAutoSaveTimeout(timeout)
  }

  // Job experience management functions
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
    
    // Trigger auto-save
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    const timeout = setTimeout(() => {
      saveProfileSilently(newProfile)
      setAutoSaveTimeout(null)
    }, 1000)
    
    setAutoSaveTimeout(timeout)
  }

  const handleJobExperienceChange = (index: number, field: string, value: string | boolean) => {
    const newProfile = {
      ...profile,
      job_experiences: profile.job_experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }
    setProfile(newProfile)
    
    // Trigger auto-save
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    const timeout = setTimeout(() => {
      saveProfileSilently(newProfile)
      setAutoSaveTimeout(null)
    }, 1000)
    
    setAutoSaveTimeout(timeout)
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
          <ProOnlyField label="Professional Information">
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
                                  onChange={(e) => {
                                    handleJobExperienceChange(index, 'is_current', e.target.checked)
                                    if (e.target.checked) {
                                      handleJobExperienceChange(index, 'end_date', '')
                                    }
                                  }}
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
          </ProOnlyField>

          {/* Skills & Interests */}
          <ProOnlyField label="Skills & Interests">
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
                    value={profile.skills.join(', ')}
                    onChange={(e) => handleArrayChange('skills', e.target.value)}
                    placeholder="e.g., JavaScript, React, Product Management, Data Analysis"
                  />
                </div>
                <div>
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={profile.interests.join(', ')}
                    onChange={(e) => handleArrayChange('interests', e.target.value)}
                    placeholder="e.g., AI, Startups, Photography, Travel"
                  />
                </div>
              </CardContent>
            </Card>
          </ProOnlyField>

          {/* Links */}
          <ProOnlyField label="Professional Links">
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
          </ProOnlyField>

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <Button
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signOut()
                  if (error) {
                    console.error('Error signing out:', error)
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
                  console.error('Sign out error:', error)
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

