'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft,
  Copy,
  Download,
  Trash2,
  User,
  Building,
  Target,
  Clock,
  Mail,
  Search,
  Users
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

// Custom CSS for extra spacing
const customStyles = `
  .extra-spacing h1, .extra-spacing h2, .extra-spacing h3, .extra-spacing h4, .extra-spacing h5, .extra-spacing h6 {
    margin-bottom: 1.5rem !important;
    margin-top: 2rem !important;
  }
  .extra-spacing p {
    margin-bottom: 1rem !important;
  }
  .extra-spacing strong {
    display: block !important;
    margin-bottom: 1rem !important;
  }
  .extra-spacing ul, .extra-spacing ol {
    margin-bottom: 1.5rem !important;
  }
  .extra-spacing li {
    margin-bottom: 0.5rem !important;
  }
`

interface GeneratedEmail {
  id: string
  user_id: string
  recipient_name: string
  recipient_company?: string
  recipient_role?: string
  recipient_email?: string
  purpose: string
  search_mode?: string
  research_findings?: string
  commonalities?: string
  generated_email: string
  created_at: string
}

function EmailDetailPageContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const [email, setEmail] = useState<GeneratedEmail | null>(null)
  const [loading, setLoading] = useState(true)

  const emailId = params.id as string

  // Load email on component mount
  useEffect(() => {
    if (user?.id && emailId) {
      loadEmail()
    }
  }, [user, emailId])

  const loadEmail = async () => {
    try {
      setLoading(true)
      console.log('Loading email:', emailId)
      
      const { data, error } = await supabase
        .from('generated_emails')
        .select('*')
        .eq('id', emailId)
        .eq('user_id', user?.id)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Email loaded:', data)
      setEmail(data)
    } catch (error) {
      console.error('Error loading email:', error)
      toast({
        title: "Error",
        description: "Failed to load the email.",
        variant: "destructive"
      })
      router.push('/past-emails')
    } finally {
      setLoading(false)
    }
  }

  const deleteEmail = async () => {
    if (!email) return
    
    try {
      const { error } = await supabase
        .from('generated_emails')
        .delete()
        .eq('id', email.id)

      if (error) throw error
      
      toast({
        title: "Email Deleted",
        description: "The email has been permanently deleted.",
      })
      router.push('/past-emails')
    } catch (error) {
      console.error('Error deleting email:', error)
      toast({
        title: "Error",
        description: "Failed to delete the email.",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async () => {
    if (!email) return
    
    try {
      const emailText = `${email.generated_email}`
      await navigator.clipboard.writeText(emailText)
      toast({
        title: "Copied!",
        description: "Email copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy email.",
        variant: "destructive"
      })
    }
  }

  const downloadEmail = () => {
    if (!email) return
    
    const emailText = `${email.generated_email}`
    const blob = new Blob([emailText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-${email.recipient_name}-${new Date(email.created_at).toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
        <Header />
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading email...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
        <Header />
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email not found</h3>
            <p className="text-gray-600 mb-6">The email you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link href="/past-emails">
              <Button className="bg-[#111827] hover:bg-gray-800 text-white rounded-full px-6 py-3">
                Back to Past Emails
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      <style jsx>{customStyles}</style>
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/past-emails">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-[#111827]">
                <ArrowLeft className="h-4 w-4" />
                Back to Past Emails
              </Button>
            </Link>
          </div>
          
          {/* Email Header Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <h1 className="text-2xl font-bold text-[#111827]">
                    {email.recipient_name}
                  </h1>
                  {email.recipient_role && email.recipient_company && (
                    <span className="text-lg text-gray-600">
                      {email.recipient_role} at {email.recipient_company}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {email.purpose}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(email.created_at)}
                  </div>
                  {email.search_mode && (
                    <div className="flex items-center gap-1">
                      <Search className="h-4 w-4" />
                      <span className="capitalize">{email.search_mode} search</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadEmail}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteEmail}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="mb-8">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#111827]">
                <Mail className="h-5 w-5" />
                Email Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {email.generated_email}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research and Commonalities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Research Findings */}
          <div className="lg:col-span-1">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#111827]">
                  <Search className="h-5 w-5" />
                  Research Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {email.research_findings ? (
                  <div className="extra-spacing prose prose-sm max-w-none min-h-[200px] prose-headings:font-bold prose-headings:text-[#111827] prose-headings:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-ul:my-6 prose-li:text-gray-700 prose-strong:text-[#111827] prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-[#6366F1] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 [&>*]:mb-4 [&>*:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2:first-of-type]:mt-0 [&_p]:mb-4 [&_p:last-child]:mb-0">
                    <ReactMarkdown>{email.research_findings}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No research findings</p>
                    <p>This email was generated without research.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Commonalities */}
          <div className="lg:col-span-1">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#111827]">
                  <Users className="h-5 w-5" />
                  Commonalities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {email.commonalities ? (
                  <div className="extra-spacing prose prose-sm max-w-none min-h-[200px] prose-headings:font-bold prose-headings:text-[#111827] prose-headings:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-ul:my-6 prose-li:text-gray-700 prose-strong:text-[#111827] prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-[#6366F1] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 [&>*]:mb-4 [&>*:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2:first-of-type]:mt-0 [&_p]:mb-4 [&_p:last-child]:mb-0">
                    <ReactMarkdown>{email.commonalities}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No commonalities found</p>
                    <p>No shared connections were identified.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function EmailDetailPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <EmailDetailPageContent />
      </ProtectedRoute>
    </AuthProvider>
  )
} 