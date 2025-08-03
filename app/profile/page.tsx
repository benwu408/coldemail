'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Building, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  Skills, 
  Heart, 
  FileText, 
  Upload, 
  File,
  X,
  Loader2
} from 'lucide-react'
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
  skills: string[]
  interests: string[]
  background: string
  linkedin_url: string
  website: string
  resume_text?: string
  resume_filename?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
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
    skills: [],
    interests: [],
    background: '',
    linkedin_url: '',
    website: '',
    resume_text: '',
    resume_filename: ''
  })

  useEffect(() => {
    if (user) {
      loadProfile()
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
          skills: data.skills || [],
          interests: data.interests || [],
          background: data.background || '',
          linkedin_url: data.linkedin_url || '',
          website: data.website || '',
          resume_text: data.resume_text || '',
          resume_filename: data.resume_filename || ''
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

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        toast({
          title: "Profile Saved!",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const saveProfileSilently = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        console.error('Failed to save profile silently')
      }
    } catch (error) {
      console.error('Error saving profile silently:', error)
    }
  }

  const triggerAutoSave = () => {
    // Debounce auto-save
    setTimeout(() => {
      saveProfileSilently()
    }, 1000)
  }

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
    triggerAutoSave()
  }

  const handleEducationChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      education: {
        ...prev.education,
        [field]: value
      }
    }))
    triggerAutoSave()
  }

  const handleArrayChange = (field: 'skills' | 'interests', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setProfile(prev => ({
      ...prev,
      [field]: items
    }))
    triggerAutoSave()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => ({
          ...prev,
          resume_text: data.resume_text,
          resume_filename: file.name
        }))
        
        toast({
          title: "Resume Uploaded!",
          description: "Your resume has been processed and added to your profile.",
        })
        
        // Auto-save the profile with the new resume data
        triggerAutoSave()
      } else {
        throw new Error('Failed to upload resume')
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeResume = () => {
    setProfile(prev => ({
      ...prev,
      resume_text: '',
      resume_filename: ''
    }))
    triggerAutoSave()
    toast({
      title: "Resume Removed",
      description: "Your resume has been removed from your profile.",
    })
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

          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume">Upload Resume (PDF)</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="resume"
                    className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? 'Processing...' : 'Choose PDF File'}
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Upload your resume to help AI understand your background and find better connections.
                </p>
              </div>

              {profile.resume_filename && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      {profile.resume_filename}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeResume}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {profile.resume_text && (
                <div className="mt-4">
                  <Label>Resume Content Preview</Label>
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700">
                      {profile.resume_text.substring(0, 200)}...
                    </p>
                  </div>
                </div>
              )}
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
                    placeholder="e.g., 2023"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Skills & Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Skills className="h-5 w-5" />
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

          {/* Links */}
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

          {/* Save Button */}
          <div className="flex justify-end">
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
    </div>
  )
} 
} 
} 