'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, CreditCard, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface ProfileData {
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_plan: string
  subscription_status: string
}

export default function SubscriptionDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionData()
  }, [user])

  const fetchSubscriptionData = async () => {
    if (!user?.id) return

    try {
      // Get profile data with subscription info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, stripe_customer_id, stripe_subscription_id')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // If columns don't exist or any other error, create default profile data
        setProfile({
          stripe_customer_id: null,
          stripe_subscription_id: null,
          subscription_plan: 'free',
          subscription_status: 'active'
        })
      } else {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error)
      // Set default data on any error
      setProfile({
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_plan: 'free',
        subscription_status: 'active'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'past_due':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'past_due':
        return 'Payment Past Due'
      case 'cancelled':
        return 'Cancelled'
      case 'expired':
        return 'Expired'
      case 'trialing':
        return 'Trial Period'
      default:
        return 'Unknown'
    }
  }

  const getStatusDescription = (status: string, plan: string) => {
    switch (status) {
      case 'active':
        return plan === 'pro' 
          ? 'Your Pro subscription is active and billing normally.'
          : 'You are on the free plan with limited features.'
      case 'past_due':
        return 'Your payment failed. Please update your payment method to avoid service interruption.'
      case 'cancelled':
        return 'Your subscription has been cancelled. You still have access until the end of your billing period.'
      case 'expired':
        return 'Your subscription has expired. Upgrade to continue using Pro features.'
      case 'trialing':
        return 'You are currently in a trial period. Enjoy Pro features!'
      default:
        return plan === 'pro' 
          ? 'Your Pro subscription is active and billing normally.'
          : 'You are on the free plan with limited features.'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPro = profile?.subscription_plan === 'pro' && profile?.subscription_status === 'active'

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPro ? (
              <Crown className="h-5 w-5 text-[#6366F1]" />
            ) : (
              <CreditCard className="h-5 w-5 text-gray-500" />
            )}
            Current Plan: {isPro ? 'Pro' : 'Free'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(profile?.subscription_status || 'unknown')}
            <div>
              <p className="font-medium">{getStatusText(profile?.subscription_status || 'unknown')}</p>
              <p className="text-sm text-gray-600">
                {getStatusDescription(profile?.subscription_status || 'unknown', profile?.subscription_plan || 'free')}
              </p>
            </div>
          </div>

          {/* Plan Features */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${!isPro ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                <span className="text-sm">
                  {!isPro ? '2 emails per day' : 'Unlimited emails'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm">
                  {isPro ? 'Email editing' : 'No email editing'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm">
                  {isPro ? 'Deep research (12 searches)' : 'Basic research (4 searches)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm">
                  {isPro ? 'Priority support' : 'Standard support'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPro ? (
            <div>
              <p className="text-gray-600 mb-4">
                Upgrade to Pro for unlimited emails, deep research, custom tones, and priority support.
              </p>
              <Link href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00">
                <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro - $10/month
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.subscription_status === 'past_due' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h4 className="font-medium text-amber-800">Payment Issue</h4>
                  </div>
                  <p className="text-amber-700 text-sm mb-3">
                    Your last payment failed. Please update your payment method to avoid losing Pro access.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => window.open('https://billing.stripe.com/p/login/dRm00k5GHeK0dRqfL81ck00', '_blank')}
                  >
                    Update Payment Method
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://billing.stripe.com/p/login/dRm00k5GHeK0dRqfL81ck00', '_blank')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://billing.stripe.com/p/login/dRm00k5GHeK0dRqfL81ck00', '_blank')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Invoices
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                You can cancel your subscription anytime through the billing portal. 
                You'll keep Pro access until the end of your current billing period.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info (only show in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded">
              {JSON.stringify({ profile }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 