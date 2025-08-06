'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Toaster } from '@/components/ui/toaster'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // Check if we have a valid session from the password reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        // Try to get session from URL parameters (from email link)
        // Supabase can send tokens as either search params or hash fragments
        let accessToken = searchParams.get('access_token')
        let refreshToken = searchParams.get('refresh_token')
        
        // If not in search params, check hash fragments
        if (!accessToken || !refreshToken) {
          const hash = window.location.hash.substring(1)
          const hashParams = new URLSearchParams(hash)
          accessToken = hashParams.get('access_token')
          refreshToken = hashParams.get('refresh_token')
        }
        
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (!error) {
            setIsValidSession(true)
          } else {
            console.error('Session error:', error)
            toast({
              title: "Invalid Reset Link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
              variant: "destructive"
            })
          }
        } else {
          // Also check if this is coming from Supabase auth callback
          const { data, error } = await supabase.auth.getSession()
          if (data.session) {
            setIsValidSession(true)
          } else {
            toast({
              title: "Invalid Reset Link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
              variant: "destructive"
            })
          }
        }
      }
    }

    checkSession()
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both password fields.",
        variant: "destructive"
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setIsSuccess(true)
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully updated.",
      })

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Password update error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Password Updated!
            </CardTitle>
            <p className="text-gray-600">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">
              Invalid Reset Link
            </CardTitle>
            <p className="text-gray-600">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <p className="text-gray-600">
            Enter your new password below.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login">
              <Button variant="link" className="text-indigo-600 hover:text-indigo-700">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
} 