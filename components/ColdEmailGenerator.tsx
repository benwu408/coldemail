'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Copy, 
  Download, 
  Mail, 
  RefreshCw, 
  Scissors, 
  Volume2, 
  Wand2, 
  Search, 
  Info, 
  LogOut, 
  User, 
  ArrowLeft,
  Edit3,
  FileText,
  Send
} from 'lucide-react'
import Link from 'next/link'
import Header from './Header'

type ToneType = 'casual' | 'formal' | 'confident'

interface FormData {
  recipientName: string
  recipientRole: string
  outreachPurpose: string
  context: string
  additionalNotes: string
}

interface ResearchFindings {
  education: string[]
  experience: string[]
  achievements: string[]
  recentWork: string[]
  personalInfo: string[]
}

export default function ColdEmailGenerator() {
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    recipientName: '',
    recipientRole: '',
    outreachPurpose: '',
    context: '',
    additionalNotes: '',
  })
  
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [subjectLine, setSubjectLine] = useState('')
  const [currentTone, setCurrentTone] = useState<ToneType>('formal')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [researchFindings, setResearchFindings] = useState<string[]>([])
  const [showResearch, setShowResearch] = useState(false)
  const [researchError, setResearchError] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive"
      })
    }
  }

  const outreachOptions = [
    'Coffee Chat',
    'Job Inquiry',
    'Introduction',
    'Networking',
    'Startup Pitch',
    'Partnership',
    'Mentorship',
    'Speaking Opportunity'
  ]

  const generateEmail = async () => {
    if (!formData.recipientName || !formData.outreachPurpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the recipient name and outreach purpose.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: formData.recipientName,
          recipientRole: formData.recipientRole,
          outreachPurpose: formData.outreachPurpose,
          context: formData.context,
          additionalNotes: formData.additionalNotes,
          tone: currentTone,
          userId: user?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate email')
      }

      const data = await response.json()
      
      if (data.email) {
        setGeneratedEmail(data.email)
        setSubjectLine(data.subject || `Reaching out - ${formData.outreachPurpose}`)
        if (data.researchFindings && data.researchFindings.length > 0) {
          setResearchFindings(data.researchFindings)
          setShowResearch(true)
        }
        if (data.researchError) {
          setResearchError(data.researchError)
        }
        toast({
          title: "Email Generated!",
          description: "Your personalized cold email is ready.",
        })
      }
    } catch (error) {
      console.error('Error generating email:', error)
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating your email. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateEmail = async () => {
    setIsProcessing(true)
    await generateEmail()
    setIsProcessing(false)
  }

  const shortenEmail = async () => {
    if (!generatedEmail) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/shorten-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: generatedEmail,
          tone: currentTone
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to shorten email')
      }

      const data = await response.json()
      
      if (data.email) {
        setGeneratedEmail(data.email)
        toast({
          title: "Email Shortened",
          description: "Your email has been condensed while maintaining its impact.",
        })
      }
    } catch (error) {
      console.error('Error shortening email:', error)
      toast({
        title: "Shortening Failed",
        description: "An error occurred while shortening your email.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const adjustTone = async (newTone: ToneType) => {
    if (!generatedEmail) return
    
    setCurrentTone(newTone)
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/adjust-tone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: generatedEmail,
          tone: newTone
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to adjust tone')
      }

      const data = await response.json()
      
      if (data.email) {
        setGeneratedEmail(data.email)
        toast({
          title: "Tone Adjusted",
          description: `Your email has been updated to a ${newTone} tone.`,
        })
      }
    } catch (error) {
      console.error('Error adjusting tone:', error)
      toast({
        title: "Tone Adjustment Failed",
        description: "An error occurred while adjusting the tone.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      const fullEmail = `Subject: ${subjectLine}\n\n${generatedEmail}`
      await navigator.clipboard.writeText(fullEmail)
      toast({
        title: "Copied to Clipboard",
        description: "Your email has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive"
      })
    }
  }

  const downloadEmail = () => {
    const fullEmail = `Subject: ${subjectLine}\n\n${generatedEmail}`
    const blob = new Blob([fullEmail], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cold-email-${formData.recipientName.toLowerCase().replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Email Downloaded",
      description: "Your email has been downloaded as a text file.",
    })
  }

  const openInGmail = () => {
    const subject = encodeURIComponent(subjectLine)
    const body = encodeURIComponent(generatedEmail)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${subject}&body=${body}`
    window.open(gmailUrl, '_blank')
    
    toast({
      title: "Opening in Gmail",
      description: "Email pre-filled in Gmail compose window.",
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Wand2 className="h-5 w-5 text-[#3B82F6]" />
                  Email Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName" className="text-sm font-medium text-gray-700">
                      Recipient Name *
                    </Label>
                    <Input
                      id="recipientName"
                      placeholder="e.g., Sarah Kim"
                      value={formData.recipientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientRole" className="text-sm font-medium text-gray-700">
                      Company & Role
                    </Label>
                    <Input
                      id="recipientRole"
                      placeholder="e.g., Product Manager at Google"
                      value={formData.recipientRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientRole: e.target.value }))}
                      className="border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outreachPurpose" className="text-sm font-medium text-gray-700">
                    Purpose of Outreach *
                  </Label>
                  <Select value={formData.outreachPurpose} onValueChange={(value) => setFormData(prev => ({ ...prev, outreachPurpose: value }))}>
                    <SelectTrigger className="border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-[#3B82F6]">
                      <SelectValue placeholder="Select your outreach purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {outreachOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context" className="text-sm font-medium text-gray-700">
                    Context / Hook
                  </Label>
                  <Textarea
                    id="context"
                    placeholder="e.g., We both went to UIUC, Saw your recent LinkedIn post about AI..."
                    value={formData.context}
                    onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                    rows={3}
                    className="border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-[#3B82F6] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any specific details, achievements, or personal connections to mention..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    rows={3}
                    className="border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-[#3B82F6] resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">AI will research and personalize</span>
                  </div>
                </div>

                <Button 
                  onClick={generateEmail}
                  disabled={isGenerating || !formData.recipientName || !formData.outreachPurpose}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl py-4 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Generate Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Research Findings */}
            {showResearch && researchFindings.length > 0 && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Search className="h-4 w-4 text-[#3B82F6]" />
                    AI Research Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {researchFindings.slice(0, 5).map((finding, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Info className="h-4 w-4 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{finding}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Email Output */}
          <div className="space-y-6">
            <Card className="border-gray-100 shadow-sm min-h-[600px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#3B82F6]" />
                    Generated Email
                  </span>
                  {generatedEmail && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-gray-600 hover:text-[#111]"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      {isEditing ? 'Preview' : 'Edit'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!generatedEmail ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No email generated yet</h3>
                    <p className="text-gray-600 max-w-sm">
                      Fill out the form on the left and click "Generate Email" to create your personalized cold email.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Subject Line */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Subject Line</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">{subjectLine}</p>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Email Body</Label>
                      {isEditing ? (
                        <Textarea
                          value={generatedEmail}
                          onChange={(e) => setGeneratedEmail(e.target.value)}
                          className="min-h-[400px] border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-[#3B82F6] resize-none font-mono text-sm"
                          placeholder="Your email content..."
                        />
                      ) : (
                        <div className="p-4 bg-white border border-gray-200 rounded-lg min-h-[400px] font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {generatedEmail}
                        </div>
                      )}
                    </div>

                    {/* Control Bar */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={regenerateEmail}
                        disabled={isProcessing}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isProcessing ? 'animate-spin' : ''}`} />
                        Regenerate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shortenEmail}
                        disabled={isProcessing}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <Scissors className="h-4 w-4 mr-1" />
                        Shorten
                      </Button>
                      <Select value={currentTone} onValueChange={(value: ToneType) => adjustTone(value)}>
                        <SelectTrigger className="w-auto border-gray-200 text-gray-700 hover:bg-gray-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="confident">Confident</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Export Bar */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadEmail}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openInGmail}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Open in Gmail
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 