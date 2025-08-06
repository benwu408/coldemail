'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const testPasswordReset = async () => {
    if (!email) {
      setMessage('Please enter an email')
      return
    }

    const redirectUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/auth/callback`
      : 'https://www.reachful.io/auth/callback'

    console.log('Testing password reset with URL:', redirectUrl)
    setMessage(`Testing with redirect URL: ${redirectUrl}`)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Success! Check your email and look at the redirect URL in the email.')
      }
    } catch (err) {
      setMessage(`Exception: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Password Reset URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Enter email to test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={testPasswordReset} className="w-full">
            Send Test Reset Email
          </Button>
          {message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm">{message}</p>
            </div>
          )}
          <div className="text-xs text-gray-500">
            <p>Expected redirect URL:</p>
            <p className="font-mono break-all">
              {window.location.hostname === 'localhost' 
                ? `${window.location.origin}/auth/callback`
                : 'https://www.reachful.io/auth/callback'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 