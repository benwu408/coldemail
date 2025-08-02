'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save, User, GraduationCap, Briefcase, Heart, MapPin, Globe, ArrowLeft, Mail, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import Header from '@/components/Header'

interface UserProfile {
  id?: string
  user_id: string
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
  created_at?: string
  updated_at?: string
}

function ProfilePageContent() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user?.id || '',
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
    skills: [],
    interests: [],
    background: '',
    linkedin_url: '',
    website: ''
  })

  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Load existing profile data
  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user])

  // Auto-save when component unmounts or page is about to unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only save if there are unsaved changes
      if (profile.full_name || profile.job_title || profile.company || profile.location || 
          profile.industry || profile.experience_years || profile.background || 
          profile.linkedin_url || profile.website || profile.skills.length > 0 || 
          profile.interests.length > 0 || profile.education.school || profile.education.degree || 
          profile.education.major || profile.education.graduation_year) {
        // Save profile before leaving
        saveProfileSilently()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Save when user switches tabs or minimizes window
        if (profile.full_name || profile.job_title || profile.company || profile.location || 
            profile.industry || profile.experience_years || profile.background || 
            profile.linkedin_url || profile.website || profile.skills.length > 0 || 
            profile.interests.length > 0 || profile.education.school || profile.education.degree || 
            profile.education.major || profile.education.graduation_year) {
          saveProfileSilently()
        }
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup function - save when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Save when leaving the page
      if (profile.full_name || profile.job_title || profile.company || profile.location || 
          profile.industry || profile.experience_years || profile.background || 
          profile.linkedin_url || profile.website || profile.skills.length > 0 || 
          profile.interests.length > 0 || profile.education.school || profile.education.degree || 
          profile.education.major || profile.education.graduation_year) {
        saveProfileSilently()
      }
    }
  }, [profile, user?.id])

  const loadProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available')
      return
    }

    try {
      setLoading(true)
      console.log('Loading profile for user:', user.id)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('Load profile result:', { data, error })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No existing profile found, starting with empty profile')
          // This is fine - user doesn't have a profile yet
        } else {
          console.error('Error loading profile:', error)
          throw error
        }
      }

      if (data) {
        console.log('Profile loaded successfully:', data)
        setProfile({
          ...data,
          skills: data.skills || [],
          interests: data.interests || []
        })
      } else {
        console.log('No profile data found, using empty profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error Loading Profile",
        description: error instanceof Error ? error.message : "Failed to load your profile data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to save your profile.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      
      // Clean up the profile data - remove empty strings and ensure arrays exist
      const cleanedProfile = {
        user_id: user.id,
        full_name: profile.full_name || null,
        job_title: profile.job_title || null,
        company: profile.company || null,
        education: {
          school: profile.education.school || '',
          degree: profile.education.degree || '',
          major: profile.education.major || '',
          graduation_year: profile.education.graduation_year || ''
        },
        location: profile.location || null,
        industry: profile.industry || null,
        experience_years: profile.experience_years || null,
        skills: profile.skills || [],
        interests: profile.interests || [],
        background: profile.background || null,
        linkedin_url: profile.linkedin_url || null,
        website: profile.website || null,
        updated_at: new Date().toISOString()
      }

      console.log('User ID:', user.id)
      console.log('Saving cleaned profile data:', cleanedProfile)

      // First, let's check if a profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('Existing profile check:', { existingProfile, checkError })

      // Try to save the profile
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(cleanedProfile, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        })

      console.log('Save result:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        
        // If it's a table doesn't exist error, show helpful message
        if (error.message.includes('relation "user_profiles" does not exist')) {
          toast({
            title: "Database Setup Required",
            description: "Please run the SQL script in your Supabase dashboard to create the user_profiles table.",
            variant: "destructive"
          })
          return
        }
        
        throw error
      }

      // Verify the save worked by fetching the profile again
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('Verification after save:', { verifyData, verifyError })

      if (verifyData) {
        console.log('Profile saved successfully:', verifyData)
        setLastSaved(new Date().toLocaleTimeString())
        toast({
          title: "Profile Saved!",
          description: "Your profile has been updated successfully.",
        })
      } else {
        console.error('Profile not found after save:', verifyError)
        toast({
          title: "Save Verification Failed",
          description: "Profile was saved but could not be verified. Please refresh and try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const saveProfileSilently = async () => {
    if (!user?.id) {
      return
    }
    try {
      setSaving(true)
      const cleanedProfile = {
        user_id: user.id,
        full_name: profile.full_name || null,
        job_title: profile.job_title || null,
        company: profile.company || null,
        education: {
          school: profile.education.school || '',
          degree: profile.education.degree || '',
          major: profile.education.major || '',
          graduation_year: profile.education.graduation_year || ''
        },
        location: profile.location || null,
        industry: profile.industry || null,
        experience_years: profile.experience_years || null,
        skills: profile.skills || [],
        interests: profile.interests || [],
        background: profile.background || null,
        linkedin_url: profile.linkedin_url || null,
        website: profile.website || null,
        updated_at: new Date().toISOString()
      }
      const { error } = await supabase
        .from('user_profiles')
        .upsert(cleanedProfile, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
      if (error) {
        console.error('Supabase error during silent save:', error)
      } else {
        setLastSaved(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Error during silent save:', error)
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
      triggerAutoSave()
    }
  }

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
    triggerAutoSave()
  }

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
      triggerAutoSave()
    }
  }

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
    triggerAutoSave()
  }

  // Debounced auto-save function
  const triggerAutoSave = () => {
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      if (profile.full_name || profile.job_title || profile.company || profile.location || 
          profile.industry || profile.experience_years || profile.background || 
          profile.linkedin_url || profile.website || profile.skills.length > 0 || 
          profile.interests.length > 0 || profile.education.school || profile.education.degree || 
          profile.education.major || profile.education.graduation_year) {
        saveProfileSilently()
      }
    }, 2000) // 2 seconds delay

    setAutoSaveTimeout(timeout)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111]">
      {/* Header */}
      <Header
        showBackButton
        showNavigation={false}
        title="Your Profile"
        subtitle="Help us personalize your networking outreach by sharing your background"
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-indigo-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, full_name: e.target.value }))
                      triggerAutoSave()
                    }}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={profile.job_title}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, job_title: e.target.value }))
                      triggerAutoSave()
                    }}
                    placeholder="e.g., Software Engineer, Product Manager"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, company: e.target.value }))
                      triggerAutoSave()
                    }}
                    placeholder="Your current company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, location: e.target.value }))
                      triggerAutoSave()
                    }}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="h-5 w-5 text-green-600" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school">School/University</Label>
                  <Input
                    id="school"
                    value={profile.education.school}
                    onChange={(e) => {
                      setProfile(prev => ({
                        ...prev,
                        education: { ...prev.education, school: e.target.value }
                      }))
                      triggerAutoSave()
                    }}
                    placeholder="e.g., Stanford University"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Select
                    value={profile.education.degree}
                    onValueChange={(value) => {
                      setProfile(prev => ({
                        ...prev,
                        education: { ...prev.education, degree: value }
                      }))
                      triggerAutoSave()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Associate's">Associate's</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                      <SelectItem value="Master's">Master's</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="MBA">MBA</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="major">Major/Field of Study</Label>
                  <Input
                    id="major"
                    value={profile.education.major}
                    onChange={(e) => {
                      setProfile(prev => ({
                        ...prev,
                        education: { ...prev.education, major: e.target.value }
                      }))
                      triggerAutoSave()
                    }}
                    placeholder="e.g., Computer Science, Business"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    value={profile.education.graduation_year}
                    onChange={(e) => {
                      setProfile(prev => ({
                        ...prev,
                        education: { ...prev.education, graduation_year: e.target.value }
                      }))
                      triggerAutoSave()
                    }}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Background */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Professional Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={profile.industry}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, industry: e.target.value }))
                      triggerAutoSave()
                    }}
                    placeholder="e.g., Technology, Finance, Healthcare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Select
                    value={profile.experience_years}
                    onValueChange={(value) => {
                      setProfile(prev => ({ ...prev, experience_years: value }))
                      triggerAutoSave()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-3">2-3 years</SelectItem>
                      <SelectItem value="4-6">4-6 years</SelectItem>
                      <SelectItem value="7-10">7-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">Professional Background</Label>
                <Textarea
                  id="background"
                  value={profile.background}
                  onChange={(e) => {
                    setProfile(prev => ({ ...prev, background: e.target.value }))
                    triggerAutoSave()
                  }}
                  placeholder="Tell us about your professional journey, achievements, and what you're passionate about..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Globe className="h-5 w-5 text-purple-600" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., JavaScript, Project Management)"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Heart className="h-5 w-5 text-red-600" />
                Interests & Hobbies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest (e.g., AI, Travel, Photography)"
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button onClick={addInterest} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {interest}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-orange-600" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    value={profile.linkedin_url}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))
                      triggerAutoSave()
                    }}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, website: e.target.value }))
                      triggerAutoSave()
                    }}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              onClick={saveProfile}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-3"
              size="lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
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