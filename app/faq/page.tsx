'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FAQPage from '@/components/FAQPage'
import { AuthProvider } from '@/contexts/AuthContext'

export default function FAQ() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        <FAQPage />
        <Footer />
      </div>
    </AuthProvider>
  )
} 