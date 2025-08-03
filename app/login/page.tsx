'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import { Toaster } from '@/components/ui/toaster'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
      <Toaster />
    </AuthProvider>
  )
} 