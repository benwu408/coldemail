'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        setStatus('Testing Supabase connection...')
        
        // Test basic connection
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        setStatus('Supabase connection successful!')
        console.log('Supabase session:', data)
      } catch (err: any) {
        setError(err.message)
        setStatus('Supabase connection failed')
        console.error('Supabase error:', err)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
        <div className="space-y-4">
          <div>
            <strong>Status:</strong> {status}
          </div>
          {error && (
            <div className="text-red-600">
              <strong>Error:</strong> {error}
            </div>
          )}
          <div className="text-sm text-gray-600">
            <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </div>
        </div>
      </div>
    </div>
  )
} 