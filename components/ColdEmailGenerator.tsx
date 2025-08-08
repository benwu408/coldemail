'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Copy, Download, Mail, Sparkles, Search, User, Edit3, Crown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function ColdEmailGenerator() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Main state variables
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [displayedEmail, setDisplayedEmail] = useState('')
  const [researchFindings, setResearchFindings] = useState('')
  const [commonalities, setCommonalities] = useState('')
  const [searchMode, setSearchMode] = useState<'basic' | 'deep'>('basic')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'email' | 'findings'>('email')
  
  // Edit functionality state
  const [editRequest, setEditRequest] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showEditSection, setShowEditSection] = useState(false)
  
  // Subscription and usage state
  const [userUsage, setUserUsage] = useState<{
    generationsToday: number
    dailyLimit: number | null
    limitReached: boolean
  } | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradePrompt, setUpgradePrompt] = useState<{
    feature: string
    message: string
  } | null>(null)
  const [userSubscription, setUserSubscription] = useState<{
    plan_name: string
    search_type: string
    email_editing_enabled: boolean
  } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientCompany: '',
    recipientRole: '',
    recipientLinkedIn: '',
    purpose: '',
    tone: 'professional'
  })

  // Load user profile on component mount
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
      })
      
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateEmail = async () => {
    if (!formData.recipientName || !formData.purpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields (Name and Purpose).",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedEmail('')
    setDisplayedEmail('')
    setResearchFindings('')
    setCommonalities('')
    setShowEditSection(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate emails.",
          variant: "destructive",
        })
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // For Pro search, use progressive API calls
      if (searchMode === 'deep') {
        // Step 1: Generate research report
        toast({
          title: "Research Phase",
          description: "Conducting comprehensive research (12 searches)...",
        })

        const researchResponse = await fetch('/api/generate-research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          },
          body: JSON.stringify({
            recipientName: formData.recipientName,
            recipientCompany: formData.recipientCompany,
            recipientRole: formData.recipientRole,
            recipientLinkedIn: formData.recipientLinkedIn,
            searchMode: searchMode
          }),
        })

        const researchData = await researchResponse.json()

        if (!researchResponse.ok) {
          throw new Error(researchData.error || 'Failed to generate research report')
        }

        setResearchFindings(researchData.researchFindings)
        
        // Step 2: Generate commonalities
        toast({
          title: "Connections Phase",
          description: "Identifying meaningful connections...",
        })

        const commonalitiesResponse = await fetch('/api/generate-commonalities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          },
          body: JSON.stringify({
            recipientName: formData.recipientName,
            recipientCompany: formData.recipientCompany,
            recipientRole: formData.recipientRole,
            researchFindings: researchData.researchFindings,
            senderProfile: profile
          }),
        })

        const commonalitiesData = await commonalitiesResponse.json()

        if (!commonalitiesResponse.ok) {
          throw new Error(commonalitiesData.error || 'Failed to generate commonalities')
        }

        setCommonalities(commonalitiesData.commonalities)
        
        // Step 3: Generate final email
        toast({
          title: "Email Generation",
          description: "Creating your personalized email...",
        })

        const emailResponse = await fetch('/api/generate-final-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          },
          body: JSON.stringify({
            recipientName: formData.recipientName,
            recipientCompany: formData.recipientCompany,
            recipientRole: formData.recipientRole,
            recipientLinkedIn: formData.recipientLinkedIn,
            purpose: formData.purpose,
            tone: formData.tone,
            researchFindings: researchData.researchFindings,
            commonalities: commonalitiesData.commonalities,
            searchMode: searchMode
          }),
        })

        const emailData = await emailResponse.json()

        if (!emailResponse.ok) {
          throw new Error(emailData.error || 'Failed to generate final email')
        }

        setGeneratedEmail(emailData.email)
        setDisplayedEmail(emailData.email)

      } else {
        // For basic search, use the original single API call
        const response = await fetch('/api/generate-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`
          },
          body: JSON.stringify({
            recipientName: formData.recipientName,
            recipientCompany: formData.recipientCompany,
            recipientRole: formData.recipientRole,
            recipientLinkedIn: formData.recipientLinkedIn,
            purpose: formData.purpose,
            tone: formData.tone,
            userProfile: profile,
            searchMode: searchMode
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle subscription-specific errors
          if (data.errorType === 'SUBSCRIPTION_REQUIRED') {
            setUpgradePrompt({
              feature: data.feature,
              message: data.error
            })
            setShowUpgradeModal(true)
            return
          }
          
          if (data.errorType === 'DAILY_LIMIT_REACHED') {
            setUserUsage(data.usageInfo)
            toast({
              title: "Daily Limit Reached",
              description: data.error,
              variant: "destructive",
            })
            setUpgradePrompt({
              feature: "Unlimited Generations",
              message: data.upgradeMessage || "Upgrade to Pro for unlimited generations"
            })
            setShowUpgradeModal(true)
            return
          }

          throw new Error(data.error || 'Failed to generate email')
        }

        setGeneratedEmail(data.email)
        setDisplayedEmail(data.email)
        setResearchFindings(data.researchFindings)
        setCommonalities(data.commonalities)
      }

      setShowEditSection(true)

      // Refresh usage data after successful generation
      await fetchCurrentUsage()

      toast({
        title: "Email Generated Successfully!",
        description: "Your personalized cold email is ready.",
      })

    } catch (error) {
      console.error('Error generating email:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail)
      toast({
        title: "Copied!",
        description: "Email content copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please copy manually.",
        variant: "destructive",
      })
    }
  }

  const downloadEmail = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedEmail], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `email-to-${formData.recipientName.replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
    toast({
      title: "Downloaded!",
      description: "Email content saved to your device.",
    })
  }

  const editEmail = async () => {
    if (!editRequest.trim()) {
      toast({
        title: "Missing Edit Request",
        description: "Please describe what changes you'd like to make.",
        variant: "destructive",
      })
      return
    }

    setIsEditing(true)
    const originalEmailContent = generatedEmail

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to edit emails.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/edit-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          originalEmail: originalEmailContent,
          editRequest: editRequest,
          recipientName: formData.recipientName,
          recipientCompany: formData.recipientCompany,
          recipientRole: formData.recipientRole,
          recipientLinkedIn: formData.recipientLinkedIn,
          purpose: formData.purpose,
          tone: formData.tone
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle subscription-specific errors
        if (data.errorType === 'SUBSCRIPTION_REQUIRED') {
          setUpgradePrompt({
            feature: data.feature,
            message: data.error
          })
          setShowUpgradeModal(true)
          return
        }

        throw new Error(data.error || 'Failed to edit email')
      }

      setGeneratedEmail(data.editedEmail)
      setDisplayedEmail(data.editedEmail)
      setEditRequest('')

      toast({
        title: "Email Updated!",
        description: "Your email has been successfully updated.",
      })

    } catch (error) {
      console.error('Error editing email:', error)
      toast({
        title: "Edit Failed",
        description: error instanceof Error ? error.message : "Failed to edit email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  // Get user subscription and usage on component mount
  useEffect(() => {
    const getUserSubscriptionAndUsage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Get user subscription from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_plan, subscription_status')
            .eq('user_id', user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
            return
          }

          if (profileData) {
            setUserSubscription({
              plan_name: profileData.subscription_plan,
              status: profileData.subscription_status,
              daily_generation_limit: profileData.subscription_plan === 'pro' ? null : 2,
              email_editing_enabled: profileData.subscription_plan === 'pro',
              priority_support: profileData.subscription_plan === 'pro'
            })
          }
          
          // Get current usage for the day
          await fetchCurrentUsage(user.id)
        }
      } catch (error) {
        console.error('Error getting user subscription and usage:', error)
      }
    }
    
    getUserSubscriptionAndUsage()
  }, [])

  // Function to fetch current usage
  const fetchCurrentUsage = async (userId?: string) => {
    try {
      const userIdToUse = userId || user?.id
      if (!userIdToUse) return

      const { data, error } = await supabase.rpc('check_daily_usage_limit', {
        user_uuid: userIdToUse
      })

      if (error) {
        console.error('Error fetching usage:', error)
        return
      }

      if (data && data.length > 0) {
        const usageData = data[0]
        setUserUsage({
          generationsToday: usageData.generations_today || 0,
          dailyLimit: usageData.daily_limit,
          limitReached: usageData.limit_reached || false
        })
      }
    } catch (error) {
      console.error('Error in fetchCurrentUsage:', error)
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-[#FAFAFA] text-[#111827]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* About the Recipient */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#111827]">
                    <User className="h-6 w-6 text-[#6366F1]" />
                    About the Recipient
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed">
                    Provide the person's name and LinkedIn profile (optional) for personalized outreach.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <Label htmlFor="recipientName" className="text-sm font-medium text-[#111827] mb-2 block">Full Name</Label>
                    <Input
                      id="recipientName"
                      placeholder="e.g., Sarah Johnson"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange('recipientName', e.target.value)}
                      className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will help personalize the greeting and research.</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <Label htmlFor="recipientCompany" className="text-sm font-medium text-[#111827] mb-2 block">Company</Label>
                    <Input
                      id="recipientCompany"
                      placeholder="e.g., Tech Corp"
                      value={formData.recipientCompany}
                      onChange={(e) => handleInputChange('recipientCompany', e.target.value)}
                      className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will help personalize the email's context.</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <Label htmlFor="recipientRole" className="text-sm font-medium text-[#111827] mb-2 block">Role</Label>
                    <Input
                      id="recipientRole"
                      placeholder="e.g., Product Manager"
                      value={formData.recipientRole}
                      onChange={(e) => handleInputChange('recipientRole', e.target.value)}
                      className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will help tailor the email's tone and content.</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <Label htmlFor="recipientLinkedIn" className="text-sm font-medium text-[#111827] mb-2 block">LinkedIn URL (optional)</Label>
                    <Input
                      id="recipientLinkedIn"
                      placeholder="e.g., https://www.linkedin.com/in/sarah-johnson/"
                      value={formData.recipientLinkedIn}
                      onChange={(e) => handleInputChange('recipientLinkedIn', e.target.value)}
                      className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll use this to find more information about the person for better personalization.</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Email Style & Purpose */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#111827]">
                    <Mail className="h-6 w-6 text-[#6366F1]" />
                    Email Style & Purpose
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed">
                    Define your outreach goals and preferred communication style.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <Label htmlFor="purpose" className="text-sm font-medium text-[#111827] mb-2 block">What's your goal?</Label>
                    <Textarea
                      id="purpose"
                      placeholder="e.g., I'm interested in learning about product management opportunities at your company and would love to connect for an informational interview."
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      rows={3}
                      className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Be specific about what you want to achieve. This becomes your email's foundation.</p>
                  </motion.div>

                  <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.0 }}
                      >
                        <Label htmlFor="tone" className="text-sm font-medium text-[#111827] mb-2 block">Tone</Label>
                        <select
                          id="tone"
                          value={formData.tone}
                          onChange={(e) => {
                            const selectedTone = e.target.value
                            if (userSubscription?.plan_name === 'free' && selectedTone !== 'professional') {
                              setUpgradePrompt({
                                feature: "Tone Customization",
                                message: "Unlock casual, formal, and confident tones with Pro"
                              })
                              setShowUpgradeModal(true)
                              return
                            }
                            handleInputChange('tone', selectedTone)
                          }}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#6366F1] focus:ring-[#6366F1] focus:outline-none"
                        >
                          <option value="professional">Professional</option>
                          <option 
                            value="casual"
                            disabled={userSubscription?.plan_name === 'free'}
                          >
                            Casual {userSubscription?.plan_name === 'free' ? '(Pro)' : ''}
                          </option>
                          <option 
                            value="formal"
                            disabled={userSubscription?.plan_name === 'free'}
                          >
                            Formal {userSubscription?.plan_name === 'free' ? '(Pro)' : ''}
                          </option>
                          <option 
                            value="confident"
                            disabled={userSubscription?.plan_name === 'free'}
                          >
                            Confident {userSubscription?.plan_name === 'free' ? '(Pro)' : ''}
                          </option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {userSubscription?.plan_name === 'free' 
                            ? 'Professional tone included. Upgrade to Pro for more options.' 
                            : 'Choose the tone that best fits your outreach style.'
                          }
                        </p>
                      </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Research Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#111827]">
                    <Search className="h-6 w-6 text-[#6366F1]" />
                    Research Depth
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed">
                    Choose how thoroughly you want us to research your recipient.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search Mode Toggle */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSearchMode('basic')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          searchMode === 'basic'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-white text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Search className="h-4 w-4 inline mr-2" />
                        Basic Search
                      </button>
                      <button
                        onClick={() => {
                          if (userSubscription?.plan_name === 'free') {
                            setUpgradePrompt({
                              feature: "Deep Search",
                              message: "Get 3x more comprehensive research with 12-phase progressive search"
                            })
                            setShowUpgradeModal(true)
                          } else {
                            setSearchMode('deep')
                          }
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                          searchMode === 'deep'
                            ? 'bg-[#6366F1] text-white'
                            : userSubscription?.plan_name === 'free'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={userSubscription?.plan_name === 'free'}
                      >
                        <Sparkles className="h-4 w-4 inline mr-2" />
                        Deep Search
                        {userSubscription?.plan_name === 'free' && (
                          <Crown className="h-3 w-3 inline ml-1 text-[#6366F1]" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {searchMode === 'deep' && (
                      <motion.div 
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-2">
                              What you'll get with deep research:
                            </p>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Comprehensive professional background analysis</li>
                              <li>• Education and credentials research</li>
                              <li>• Recent achievements and news coverage</li>
                              <li>• Advanced commonality detection with your profile</li>
                              <li>• Detailed professional interests and focus areas</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upgrade Prompt for Free Users */}
            {userSubscription?.plan_name === 'free' && (
              <motion.div 
                className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="h-6 w-6 text-[#6366F1]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-[#111827] mb-2 flex items-center gap-2">
                      Unlock Pro Features
                      <span className="text-xs bg-[#6366F1] text-white px-2 py-1 rounded-full font-medium">$10/mo</span>
                    </h4>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Get unlimited generations, deep research, custom tones, email editing, and more personalization features.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium shadow-md"
                            size="sm"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                          </Button>
                        </motion.div>
                      </Link>
                      <Link href="/pricing">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-indigo-300 text-[#6366F1] hover:bg-indigo-100 hover:border-indigo-400 font-medium"
                        >
                          View Features
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Enhancement Button - Only show if profile is incomplete */}
            <AnimatePresence>
              {userProfile && (
                (!userProfile.full_name || 
                 !userProfile.job_title || 
                 !userProfile.company || 
                 !userProfile.education?.school || 
                 !userProfile.location || 
                 userProfile.skills?.length === 0 || 
                 userProfile.interests?.length === 0) && (
                  <motion.div 
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-[#6366F1]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-[#111827] mb-2">
                          Get More Personalized Emails
                        </h4>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          Fill out your profile to help AI find connections and create more authentic emails.
                        </p>
                        <Link href="/profile">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-300 text-[#6366F1] hover:bg-purple-100 hover:border-purple-400 font-medium"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Complete Profile
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {/* Generate Button */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {/* Usage Counter for Free Users */}
              {userSubscription?.plan_name === 'free' && userUsage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.85 }}
                  className="mb-4"
                >
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-800 font-medium">
                        Daily Generations
                      </span>
                      <span className="text-amber-900 font-semibold">
                        {userUsage.dailyLimit && userUsage.dailyLimit > 0 
                          ? `${userUsage.generationsToday} / ${userUsage.dailyLimit} used`
                          : `${userUsage.generationsToday} used`
                        }
                      </span>
                    </div>
                    {userUsage.dailyLimit && userUsage.dailyLimit > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-amber-200 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((userUsage.generationsToday / userUsage.dailyLimit) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        {userUsage.limitReached && (
                          <p className="text-xs text-amber-700 mt-1">
                            Daily limit reached. <Link href="/pricing" className="underline hover:text-amber-900">Upgrade to Pro</Link> for unlimited generations.
                          </p>
                        )}
                        {!userUsage.limitReached && userUsage.dailyLimit - userUsage.generationsToday === 1 && (
                          <p className="text-xs text-amber-700 mt-1">
                            1 generation remaining today
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="space-y-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={generateEmail}
                    disabled={isGenerating}
                    className="w-full bg-[#111827] hover:bg-gray-800 text-white rounded-full px-8 py-4 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 group"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Generating Email...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-3 h-6 w-6" />
                        Generate Email
                      </>
                    )}
                  </Button>
                </motion.div>
                <motion.p 
                  className="text-xs text-gray-500 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  {searchMode === 'deep' 
                    ? 'Your email will be generated in about 90 seconds' 
                    : 'Your email will be generated in about 30 seconds'
                  }
                </motion.p>
              </motion.div>
            </motion.div>
          </div>

          {/* Results with Tabs */}
          <motion.div 
            className="lg:col-span-3 space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              whileHover={{ y: -2 }}
            >
              <Card className="border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center justify-between text-xl font-bold text-[#111827]">
                    <span>Generated Results</span>
                    <AnimatePresence>
                      {generatedEmail && (
                        <motion.div 
                          className="flex gap-3"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyToClipboard}
                              className="border-gray-200 hover:border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all duration-200"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={downloadEmail}
                              className="border-gray-200 hover:border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all duration-200"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardTitle>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200">
                    <motion.button
                      onClick={() => setActiveTab('email')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                        activeTab === 'email'
                          ? 'border-[#6366F1] text-[#6366F1]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Generated Email
                    </motion.button>
                    <motion.button
                      onClick={() => setActiveTab('findings')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                        activeTab === 'findings'
                          ? 'border-[#6366F1] text-[#6366F1]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      AI Findings
                    </motion.button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Email Tab */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'email' && (
                      <motion.div
                        key="email"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-md h-[600px] flex flex-col mx-6 mb-6">
                          {/* Email Header */}
                          <div className="border-b border-gray-200 p-6 bg-gray-50 flex-shrink-0">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Mail className="h-6 w-6 text-[#6366F1]" />
                                <span className="text-lg font-bold text-[#111827]">Generated Email</span>
                              </div>
                              {generatedEmail && (
                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="border-gray-200 hover:border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all duration-200"
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadEmail}
                                    className="border-gray-200 hover:border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all duration-200"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">To:</span> {formData.recipientName || 'Recipient'} &lt;{formData.recipientName?.toLowerCase().replace(/\s+/g, '.')}@email.com&gt;
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Subject:</span> {formData.purpose ? formData.purpose.slice(0, 50) + (formData.purpose.length > 50 ? '...' : '') : 'Reaching out to connect'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Email Content */}
                          <div className="flex-1 p-6 overflow-y-auto">
                            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap min-h-full">
                              {isGenerating ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                  <Loader2 className="h-10 w-10 animate-spin mr-4" />
                                  <span className="text-xl">Generating your email...</span>
                                </div>
                              ) : displayedEmail ? (
                                <div className="space-y-6">
                                  <div className="text-gray-500 text-sm">
                                    {new Date().toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </div>
                                  {displayedEmail}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center text-gray-400">
                                    <Mail className="h-16 w-16 mx-auto mb-6 opacity-50" />
                                    <p className="text-xl font-bold mb-3">Your Email Will Appear Here</p>
                                    <p className="text-gray-500">Fill out the form and click "Generate Email" to create your personalized message.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Edit Email Section - Now positioned below the email */}
                        {showEditSection && generatedEmail && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-gray-100 rounded-2xl shadow-md mx-6 mb-6"
                          >
                            <div className="p-6 space-y-4">
                              <div className="flex items-center gap-3">
                                <Edit3 className="h-5 w-5 text-[#6366F1]" />
                                <h4 className="text-lg font-bold text-[#111827]">Edit Email</h4>
                                {isEditing && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating email...
                                  </div>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="editRequest" className="text-sm font-medium text-[#111827] mb-2 block">
                                  Describe the changes you'd like to make:
                                </Label>
                                <Textarea
                                  id="editRequest"
                                  value={editRequest}
                                  onChange={(e) => setEditRequest(e.target.value)}
                                  placeholder="e.g., Make it more formal, add a specific question about their recent project, change the tone to be more casual..."
                                  className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1] min-h-[80px]"
                                  rows={3}
                                  disabled={isEditing}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Be specific about what you want to change. The AI will revise the email based on your request.
                                </p>
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  onClick={editEmail}
                                  disabled={isEditing || !editRequest.trim()}
                                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                                >
                                  {isEditing ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <Edit3 className="mr-2 h-4 w-4" />
                                      Update Email
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowEditSection(false)
                                    setEditRequest('')
                                  }}
                                  className="border-gray-200 hover:border-gray-300"
                                  disabled={isEditing}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Findings Tab */}
                    {activeTab === 'findings' && (
                      <motion.div
                        key="findings"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="h-[600px] overflow-y-auto space-y-8 mx-6 mb-6">
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-md">
                            <div className="border-b border-gray-200 p-6 bg-gray-50">
                              <h4 className="text-lg font-bold text-[#111827] flex items-center gap-3">
                                <Search className="h-6 w-6 text-[#6366F1]" />
                                Research Findings
                              </h4>
                            </div>
                            <div className="p-6">
                              <div className="prose prose-sm max-w-none min-h-[200px] prose-headings:font-bold prose-headings:text-[#111827] prose-headings:text-xl prose-headings:mb-4 prose-headings:mt-6 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base prose-ul:my-4 prose-li:mb-3 prose-li:text-gray-700 prose-strong:text-[#111827] prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-[#6366F1] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 [&>*]:mb-4 [&>*:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2:first-of-type]:mt-0 [&_p]:mb-4 [&_p:last-child]:mb-0">
                                {isGenerating ? (
                                  <div className="flex items-center justify-center h-full text-gray-500">
                                    <Loader2 className="h-10 w-10 animate-spin mr-4" />
                                    <span className="text-xl">Researching...</span>
                                  </div>
                                ) : researchFindings ? (
                                  <ReactMarkdown>{researchFindings}</ReactMarkdown>
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-gray-400">
                                      <Search className="h-16 w-16 mx-auto mb-6 opacity-50" />
                                      <p className="text-xl font-bold mb-3">Research Findings Will Appear Here</p>
                                      <p className="text-gray-500">Generate an email to see detailed research about the recipient.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border border-gray-100 rounded-2xl shadow-md">
                            <div className="border-b border-gray-200 p-6 bg-gray-50">
                              <h4 className="text-lg font-bold text-[#111827] flex items-center gap-3">
                                <User className="h-6 w-6 text-[#6366F1]" />
                                Common Connections
                              </h4>
                            </div>
                            <div className="p-6">
                              <div className="prose prose-sm max-w-none min-h-[150px] prose-headings:font-bold prose-headings:text-[#111827] prose-headings:text-xl prose-headings:mb-4 prose-headings:mt-6 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base prose-ul:my-4 prose-li:mb-3 prose-li:text-gray-700 prose-strong:text-[#111827] prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-[#6366F1] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 [&>*]:mb-4 [&>*:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2:first-of-type]:mt-0 [&_p]:mb-4 [&_p:last-child]:mb-0">
                                {isGenerating ? (
                                  <div className="flex items-center justify-center h-full text-gray-500">
                                    <Loader2 className="h-10 w-10 animate-spin mr-4" />
                                    <span className="text-xl">Finding connections...</span>
                                  </div>
                                ) : commonalities ? (
                                  <ReactMarkdown>{commonalities}</ReactMarkdown>
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-gray-400">
                                      <User className="h-16 w-16 mx-auto mb-6 opacity-50" />
                                      <p className="text-xl font-bold mb-3">Common Connections Will Appear Here</p>
                                      <p className="text-gray-500">Generate an email to see shared interests and connections.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer />

      {/* Upgrade Modal */}
      {showUpgradeModal && upgradePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade to Pro
              </h3>
              
              <p className="text-gray-600 mb-2">
                <strong>{upgradePrompt.feature}</strong> is a Pro feature
              </p>
              
              <p className="text-gray-500 text-sm mb-6">
                {upgradePrompt.message}
              </p>

              {userUsage && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Today's Usage:</span>
                      <span className="font-semibold">
                        {userUsage.generationsToday} / {userUsage.dailyLimit} emails
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-[#6366F1] h-2 rounded-full" 
                        style={{ 
                          width: userUsage.dailyLimit ? 
                            `${Math.min((userUsage.generationsToday / userUsage.dailyLimit) * 100, 100)}%` : 
                            '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Link href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00">
                  <Button className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                    Upgrade to Pro - $10/month
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
} 