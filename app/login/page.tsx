'use client'

import LoginForm from '@/components/LoginForm'
import Header from '@/components/Header'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Welcome to Reachful</h1>
            <p className="text-gray-600">Sign in to start generating personalized outreach emails</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 