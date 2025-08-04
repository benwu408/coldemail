'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Copy, Download, Mail, Sparkles, Search, User, Edit3 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

export default function ColdEmailGenerator() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [researchFindings, setResearchFindings] = useState('')
  const [commonalities, setCommonalities] = useState('')
  const [searchMode, setSearchMode] = useState<'basic' | 'deep'>('basic')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'email' | 'findings'>('email')
  const [isTyping, setIsTyping] = useState(false)
  const [displayedEmail, setDisplayedEmail] = useState('')
  const [displayedFindings, setDisplayedFindings] = useState('')
  const [displayedCommonalities, setDisplayedCommonalities] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientCompany: '',
    recipientRole: '',
    purpose: '',
    tone: 'casual'
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
    if (!formData.recipientName || !formData.recipientCompany || !formData.recipientRole || !formData.purpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedEmail('')
    setResearchFindings('')
    setCommonalities('')

    console.log('Starting email generation...')
    console.log('User ID:', user?.id)
    console.log('Form data:', formData)
    console.log('Search mode:', searchMode)

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          ...formData,
          userProfile,
          searchMode
        }),
      })

      console.log('API Response status:', response.status)
      const data = await response.json()

      if (response.ok) {
        console.log('API Response received:', data)
        console.log('Email content:', data.email)
        console.log('Research findings:', data.researchFindings)
        console.log('Commonalities:', data.commonalities)
        
        setGeneratedEmail(data.email)
        setResearchFindings(data.researchFindings || '')
        setCommonalities(data.commonalities || '')
        
        // Set the displayed content immediately
        setDisplayedEmail(data.email)
        setDisplayedFindings(data.researchFindings || '')
        setDisplayedCommonalities(data.commonalities || '')
        
        console.log('States set - Generated Email:', data.email ? 'Has content' : 'Empty')
        console.log('States set - Research Findings:', data.researchFindings ? 'Has content' : 'Empty')
        console.log('States set - Commonalities:', data.commonalities ? 'Has content' : 'Empty')
        
        toast({
          title: "Email Generated!",
          description: "Your personalized email has been created and saved successfully.",
        })
        
        // Start typewriter effect after a short delay
        setTimeout(() => {
          startTypewriterEffect()
        }, 500)
      } else {
        throw new Error(data.error || 'Failed to generate email')
      }
    } catch (error) {
      console.error('Error generating email:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate email. Please try again.",
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

  const typewriterEffect = async (text: string, setDisplayFunction: (text: string) => void, speed: number = 30) => {
    setDisplayFunction('')
    for (let i = 0; i < text.length; i++) {
      setDisplayFunction(text.slice(0, i + 1))
      await new Promise(resolve => setTimeout(resolve, speed))
    }
  }

  const startTypewriterEffect = async () => {
    setIsTyping(true)
    
    // Type the email first
    if (generatedEmail) {
      await typewriterEffect(generatedEmail, setDisplayedEmail, 20)
    }
    
    // Then type the findings
    if (researchFindings) {
      await typewriterEffect(researchFindings, setDisplayedFindings, 15)
    }
    
    // Finally type the commonalities
    if (commonalities) {
      await typewriterEffect(commonalities, setDisplayedCommonalities, 15)
    }
    
    setIsTyping(false)
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
                    Tell us about the person you want to reach out to. This helps our AI research and personalize your message.
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <div>
                      <Label htmlFor="recipientCompany" className="text-sm font-medium text-[#111827] mb-2 block">Company</Label>
                      <Input
                        id="recipientCompany"
                        placeholder="e.g., Google"
                        value={formData.recipientCompany}
                        onChange={(e) => handleInputChange('recipientCompany', e.target.value)}
                        className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1]"
                      />
                      <p className="text-xs text-gray-500 mt-1">We'll research recent news and company culture.</p>
                    </div>

                    <div>
                      <Label htmlFor="recipientRole" className="text-sm font-medium text-[#111827] mb-2 block">Role/Position</Label>
                      <Input
                        id="recipientRole"
                        placeholder="e.g., Senior Product Manager"
                        value={formData.recipientRole}
                        onChange={(e) => handleInputChange('recipientRole', e.target.value)}
                        className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Helps tailor the message to their expertise.</p>
                    </div>
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
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <Label htmlFor="tone" className="text-sm font-medium text-[#111827] mb-2 block">Communication Style</Label>
                    <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                      <SelectTrigger className="border-gray-200 focus:border-[#6366F1] focus:ring-[#6366F1]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual & Friendly</SelectItem>
                        <SelectItem value="formal">Formal & Professional</SelectItem>
                        <SelectItem value="confident">Confident & Direct</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Choose the tone that best matches your relationship and industry.</p>
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
                  <div className="space-y-4">
                    <motion.div 
                      className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#6366F1] transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        id="basic-search"
                        name="searchMode"
                        value="basic"
                        checked={searchMode === 'basic'}
                        onChange={(e) => setSearchMode(e.target.value as 'basic' | 'deep')}
                        className="text-[#6366F1] focus:ring-[#6366F1] mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="basic-search" className="flex items-center gap-2 cursor-pointer text-[#111827] font-medium">
                          <Search className="h-4 w-4" />
                          Quick Research
                        </Label>
                        <p className="text-gray-600 leading-relaxed mt-1">
                          Basic web search for essential information. Perfect for quick outreach.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#6366F1] transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        id="deep-search"
                        name="searchMode"
                        value="deep"
                        checked={searchMode === 'deep'}
                        onChange={(e) => setSearchMode(e.target.value as 'basic' | 'deep')}
                        className="text-[#6366F1] focus:ring-[#6366F1] mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="deep-search" className="flex items-center gap-2 cursor-pointer text-[#111827] font-medium">
                          <Sparkles className="h-4 w-4 text-[#6366F1]" />
                          Deep Research (Premium)
                        </Label>
                        <p className="text-gray-600 leading-relaxed mt-1">
                          Comprehensive analysis with detailed reports and advanced connection finding.
                        </p>
                      </div>
                    </motion.div>
                  </div>

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
                Your email will be generated in about 30 seconds
              </motion.p>
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
                                <span className="font-medium">To:</span> {formData.recipientName || 'Recipient'} &lt;{formData.recipientName?.toLowerCase().replace(/\s+/g, '.')}@{formData.recipientCompany?.toLowerCase().replace(/\s+/g, '')}.com&gt;
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
                              ) : isTyping ? (
                                <div className="relative">
                                  {displayedEmail}
                                  <span className="animate-pulse text-[#6366F1] text-lg">|</span>
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
                              <div className="prose prose-sm max-w-none min-h-[200px] prose-headings:font-bold prose-headings:text-[#111827] prose-headings:text-xl prose-headings:mb-4 prose-headings:mt-6 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base prose-ul:my-4 prose-li:mb-3 prose-li:text-gray-700 prose-strong:text-[#111827] prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-[#6366F1] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600">
                                {isGenerating ? (
                                  <div className="flex items-center justify-center h-full text-gray-500">
                                    <Loader2 className="h-10 w-10 animate-spin mr-4" />
                                    <span className="text-xl">Researching...</span>
                                  </div>
                                ) : isTyping ? (
                                  <div className="relative">
                                    <ReactMarkdown>{displayedFindings}</ReactMarkdown>
                                    <span className="animate-pulse text-[#6366F1] text-lg">|</span>
                                  </div>
                                ) : displayedFindings ? (
                                  <ReactMarkdown>{displayedFindings}</ReactMarkdown>
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
                              <div className="prose prose-sm max-w-none min-h-[150px] prose-headings:font-bold prose-headings:text-[#111827] prose-headings:text-xl prose-headings:mb-4 prose-headings:mt-6 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base prose-ul:my-4 prose-li:mb-3 prose-li:text-gray-700 prose-strong:text-[#111827] prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-[#6366F1] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600">
                                {isGenerating ? (
                                  <div className="flex items-center justify-center h-full text-gray-500">
                                    <Loader2 className="h-10 w-10 animate-spin mr-4" />
                                    <span className="text-xl">Finding connections...</span>
                                  </div>
                                ) : isTyping ? (
                                  <div className="relative">
                                    <ReactMarkdown>{displayedCommonalities}</ReactMarkdown>
                                    <span className="animate-pulse text-[#6366F1] text-lg">|</span>
                                  </div>
                                ) : displayedCommonalities ? (
                                  <ReactMarkdown>{displayedCommonalities}</ReactMarkdown>
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
    </motion.div>
  )
} 