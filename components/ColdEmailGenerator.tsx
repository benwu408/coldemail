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
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

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

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userProfile,
          searchMode
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedEmail(data.email)
        setResearchFindings(data.researchFindings || '')
        setCommonalities(data.commonalities || '')
        
        toast({
          title: "Email Generated!",
          description: "Your personalized email has been created successfully.",
        })
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

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generate Personalized Email
          </h1>
          <p className="text-gray-600">
            Create authentic, research-backed outreach emails that get responses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Recipient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    placeholder="e.g., Sarah Johnson"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="recipientCompany">Company *</Label>
                  <Input
                    id="recipientCompany"
                    placeholder="e.g., Google"
                    value={formData.recipientCompany}
                    onChange={(e) => handleInputChange('recipientCompany', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="recipientRole">Role/Position *</Label>
                  <Input
                    id="recipientRole"
                    placeholder="e.g., Senior Product Manager"
                    value={formData.recipientRole}
                    onChange={(e) => handleInputChange('recipientRole', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="purpose">Purpose of Outreach *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="e.g., I'm interested in learning about product management opportunities at your company and would love to connect for an informational interview."
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tone">Email Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="formal">Formal & Professional</SelectItem>
                      <SelectItem value="confident">Confident & Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Search Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Research Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="basic-search"
                      name="searchMode"
                      value="basic"
                      checked={searchMode === 'basic'}
                      onChange={(e) => setSearchMode(e.target.value as 'basic' | 'deep')}
                      className="text-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <Label htmlFor="basic-search" className="flex items-center gap-2 cursor-pointer">
                      <Search className="h-4 w-4" />
                      Basic Search
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Quick web search for basic information about the recipient.
                  </p>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="deep-search"
                      name="searchMode"
                      value="deep"
                      checked={searchMode === 'deep'}
                      onChange={(e) => setSearchMode(e.target.value as 'basic' | 'deep')}
                      className="text-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <Label htmlFor="deep-search" className="flex items-center gap-2 cursor-pointer">
                      <Sparkles className="h-4 w-4 text-[#6366F1]" />
                      Deep Search (Premium)
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Comprehensive AI-powered research with detailed reports and advanced commonality detection.
                  </p>
                </div>

                {searchMode === 'deep' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Deep Search Features:
                        </p>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• Comprehensive professional background analysis</li>
                          <li>• Education and credentials research</li>
                          <li>• Recent achievements and news coverage</li>
                          <li>• Advanced commonality detection with your profile</li>
                          <li>• Detailed professional interests and focus areas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Enhancement Button */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Get More Personalized Emails
                  </h4>
                  <p className="text-xs text-blue-700 mb-3">
                    Fill out your profile to help AI find connections and create more authentic emails.
                  </p>
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <Button
              onClick={generateEmail}
              disabled={isGenerating}
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Generate Email
                </>
              )}
            </Button>
          </div>

          {/* Results with Tabs */}
          <div className="space-y-6">
            {(generatedEmail || researchFindings || commonalities) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Results</span>
                    {generatedEmail && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadEmail}
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                  
                  {/* Tabs */}
                  <div className="flex border-b">
                    {generatedEmail && (
                      <button
                        onClick={() => setActiveTab('email')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'email'
                            ? 'border-[#6366F1] text-[#6366F1]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Generated Email
                      </button>
                    )}
                    {(researchFindings || commonalities) && (
                      <button
                        onClick={() => setActiveTab('findings')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'findings'
                            ? 'border-[#6366F1] text-[#6366F1]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        AI Findings
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Email Tab */}
                  {activeTab === 'email' && generatedEmail && (
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {generatedEmail}
                    </div>
                  )}

                  {/* Findings Tab */}
                  {activeTab === 'findings' && (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {researchFindings && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Research Findings
                          </h4>
                          <div className="bg-blue-50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                            {researchFindings}
                          </div>
                        </div>
                      )}

                      {commonalities && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Common Connections
                          </h4>
                          <div className="bg-green-50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                            {commonalities}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 