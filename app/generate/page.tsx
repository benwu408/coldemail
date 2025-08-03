import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ColdEmailGenerator from '@/components/ColdEmailGenerator'
import { Toaster } from '@/components/ui/toaster'
import { Metadata } from 'next'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI Cold Email Generator | Create Personalized Outreach Emails',
  description: 'Generate personalized cold emails with AI that sound human and get responses. Our intelligent email generator creates authentic outreach emails for networking, sales, and business development.',
  keywords: [
    'AI cold email generator',
    'personalized email outreach',
    'cold email writer',
    'business email generator',
    'sales email automation',
    'networking email tool'
  ],
  openGraph: {
    title: 'AI Cold Email Generator | Create Personalized Outreach Emails',
    description: 'Generate personalized cold emails with AI that sound human and get responses. Perfect for networking, sales, and business development.',
    url: 'https://reachful.io/generate',
  },
  alternates: {
    canonical: '/generate',
  },
}

export default function GeneratePage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ColdEmailGenerator />
      </ProtectedRoute>
      <Toaster />
    </AuthProvider>
  )
} 