import { Metadata } from 'next'
import Header from '@/components/Header'
import FAQPage from '@/components/FAQPage'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Reachful',
  description: 'Find answers to common questions about Reachful, our AI-powered cold email generator. Learn how to create personalized outreach emails that get responses.',
  keywords: [
    'Reachful FAQ',
    'cold email generator FAQ',
    'AI email tool questions',
    'outreach email help',
    'email generator support'
  ],
  openGraph: {
    title: 'FAQ - Frequently Asked Questions | Reachful',
    description: 'Find answers to common questions about Reachful, our AI-powered cold email generator.',
    url: 'https://reachful.io/faq',
  },
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <FAQPage />
    </div>
  )
} 