'use client'

import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft, Crown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  showBackButton?: boolean
  backUrl?: string
  showNavigation?: boolean
  title?: string
  subtitle?: string
}

export default function Header({ 
  showBackButton = false, 
  backUrl = '/', 
  showNavigation = true,
  title,
  subtitle 
}: HeaderProps) {
  const [userPlan, setUserPlan] = useState<string>('free')
  const [userUsage, setUserUsage] = useState<{
    generationsToday: number
    dailyLimit: number | null
    limitReached: boolean
  } | null>(null)
  
  // Handle case where AuthProvider might not be available during static generation
  let user = null
  try {
    const auth = useAuth()
    user = auth?.user
  } catch (error) {
    // AuthProvider not available, continue without user data
    user = null
  }

  // Fetch user's subscription plan and usage
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return

      try {
        // Get user subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase.rpc('get_user_subscription', {
          user_uuid: user.id
        })

        if (subscriptionError) {
          console.error('Error fetching user subscription:', subscriptionError)
        } else if (subscriptionData && subscriptionData.length > 0) {
          setUserPlan(subscriptionData[0].plan_name || 'free')
        } else {
          setUserPlan('free')
        }

        // Get usage data for free users
        const { data: usageData, error: usageError } = await supabase.rpc('check_daily_usage_limit', {
          user_uuid: user.id
        })

        if (usageError) {
          console.error('Error fetching usage:', usageError)
        } else if (usageData && usageData.length > 0) {
          const usage = usageData[0]
          setUserUsage({
            generationsToday: usage.generations_today || 0,
            dailyLimit: usage.daily_limit,
            limitReached: usage.limit_reached || false
          })
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error)
        setUserPlan('free')
      }
    }

    fetchUserData()
  }, [user?.id])

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Left: Logo and Back Button */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-gray-600 hover:text-[#111827] transition-colors duration-200"
                onClick={() => window.location.href = backUrl}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
              <img 
                src="/reachful_logo.png" 
                alt="Reachful" 
                className="h-16 w-auto"
              />
              <span className="text-3xl font-bold text-[#111827]">
                Reachful
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          {showNavigation && (
            <div className="hidden md:flex items-center gap-8 text-sm">
              {user && (
                <Link href="/generate">
                  <Button
                    className="bg-[#111827] hover:bg-gray-800 text-white rounded-full px-6 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Generate Email
                  </Button>
                </Link>
              )}
              {user && (
                <Link href="/past-emails">
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-[#111827] transition-colors duration-200 font-medium"
                  >
                    Past Emails
                  </Button>
                </Link>
              )}
              <Link href="/#how-it-works" className="text-gray-600 hover:text-[#111827] transition-colors duration-200 font-medium">
                How it works
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-[#111827] transition-colors duration-200 font-medium">
                About
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-[#111827] transition-colors duration-200 font-medium">
                Pricing
              </Link>
              <a href="/faq" className="text-gray-600 hover:text-[#111827] transition-colors duration-200 font-medium">
                FAQ
              </a>
            </div>
          )}

          {/* Right: User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile">
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-[#111827] transition-colors duration-200 font-medium"
                  >
                    Profile
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <span className="text-gray-600 font-medium">{user.email}</span>
                  </div>
                  
                  {/* Plan Badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    userPlan === 'pro' 
                      ? 'bg-[#6366F1] text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {userPlan === 'pro' && <Crown className="h-3 w-3" />}
                    {userPlan === 'pro' ? 'Pro' : 'Free'}
                  </div>

                  {/* Usage Counter for Free Users */}
                  {userPlan === 'free' && userUsage && userUsage.dailyLimit && userUsage.dailyLimit > 0 && (
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      userUsage.limitReached 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : userUsage.generationsToday >= userUsage.dailyLimit - 1
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {userUsage.generationsToday}/{userUsage.dailyLimit} today
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-[#111827] transition-colors duration-200 font-medium"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    className="bg-[#111827] hover:bg-gray-800 text-white rounded-full px-6 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 