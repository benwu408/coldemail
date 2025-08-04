'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Trash2, 
  Mail, 
  Calendar,
  User,
  Building,
  Target,
  Clock,
  ArrowLeft,
  Eye,
  ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

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

function PastEmailsPageContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [emails, setEmails] = useState<GeneratedEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPurpose, setFilterPurpose] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

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

  // Load emails on component mount
  useEffect(() => {
    if (user?.id) {
      loadEmails()
    }
  }, [user])

  const loadEmails = async () => {
    try {
      setLoading(true)
      console.log('Loading emails for user:', user?.id)
      
      const { data, error } = await supabase
        .from('generated_emails')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Emails loaded from database:', data)
      console.log('Number of emails found:', data?.length || 0)
      
      setEmails(data || [])
    } catch (error) {
      console.error('Error loading emails:', error)
      toast({
        title: "Error",
        description: "Failed to load your emails.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('generated_emails')
        .delete()
        .eq('id', emailId)

      if (error) throw error
      
      setEmails(emails.filter(email => email.id !== emailId))
      toast({
        title: "Email Deleted",
        description: "The email has been permanently deleted.",
      })
    } catch (error) {
      console.error('Error deleting email:', error)
      toast({
        title: "Error",
        description: "Failed to delete the email.",
        variant: "destructive"
      })
    }
  }

  // Filter and sort emails
  const filteredEmails = emails
    .filter(email => {
      const matchesSearch = email.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.recipient_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPurpose = filterPurpose === 'all' || email.purpose === filterPurpose
      
      return matchesSearch && matchesPurpose
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === 'name') {
        return a.recipient_name.localeCompare(b.recipient_name)
      }
      return 0
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Generate subject line from email content
  const generateSubject = (email: GeneratedEmail) => {
    const firstLine = email.generated_email.split('\n')[0]
    if (firstLine && firstLine.length > 50) {
      return firstLine.substring(0, 50) + '...'
    }
    return firstLine || email.purpose
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/generate">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-[#111827]">
                <ArrowLeft className="h-4 w-4" />
                Back to Generator
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Past Emails</h1>
          <p className="text-gray-600">View and manage all your previously generated emails.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Purpose Filter */}
            <Select value={filterPurpose} onValueChange={setFilterPurpose}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                {outreachOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-sm text-gray-600">
              {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Emails List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your emails...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterPurpose !== 'all' 
                ? "Try adjusting your search or filters."
                : "Start generating emails to see them here."
              }
            </p>
            {!searchTerm && filterPurpose === 'all' && (
              <Link href="/generate">
                <Button className="bg-[#111827] hover:bg-gray-800 text-white rounded-full px-6 py-3">
                  Generate Your First Email
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEmails.map((email) => (
              <Link key={email.id} href={`/past-emails/${email.id}`} className="block">
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-200 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-[#111827] truncate group-hover:text-[#6366F1] transition-colors">
                              {email.recipient_name}
                            </span>
                          </div>
                          {email.recipient_company && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{email.recipient_company}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 truncate mb-1">
                          {generateSubject(email)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {email.purpose}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(email.created_at)}
                          </div>
                          {email.search_mode && (
                            <div className="flex items-center gap-1">
                              <span className="capitalize">{email.search_mode}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-gray-400 group-hover:text-[#6366F1] transition-colors">
                          <Eye className="h-4 w-4" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteEmail(email.id)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function PastEmailsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <PastEmailsPageContent />
      </ProtectedRoute>
    </AuthProvider>
  )
} 