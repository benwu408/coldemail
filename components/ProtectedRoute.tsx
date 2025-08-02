'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginForm from './LoginForm'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, error } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Please check your Supabase configuration:</p>
            <p>1. Verify your .env.local file has correct Supabase credentials</p>
            <p>2. Make sure your Supabase project is active</p>
            <p>3. Check that email authentication is enabled</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <>{children}</>
} 