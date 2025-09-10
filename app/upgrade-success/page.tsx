'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Crown, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'

export default function UpgradeSuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Simulate processing time for webhook to complete
    const timer = setTimeout(() => {
      setIsProcessing(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to <span className="text-[#6366F1]">Reachful Pro!</span>
            </h1>
            
            {isProcessing ? (
              <div className="space-y-4">
                <p className="text-xl text-gray-600">
                  Processing your upgrade...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
                </div>
              </div>
            ) : (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your payment was successful! Your account has been upgraded to Pro. 
                You now have access to all premium features.
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Pro Features */}
            <Card className="border-2 border-[#6366F1] shadow-lg">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center gap-2 mb-4">
                  <Crown className="h-8 w-8 text-[#6366F1]" />
                  <CardTitle className="text-2xl font-bold">Pro Features Unlocked</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span><strong>Deep Search</strong> - Advanced ChatGPT web search research</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span><strong>Unlimited Generations</strong> - No daily limits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span><strong>Multiple Tones</strong> - Casual, Formal, Confident</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span><strong>Email Editing</strong> - AI-powered refinement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span><strong>Priority Support</strong> - Fast response times</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">What's Next?</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#6366F1] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">Start Generating</h3>
                      <p className="text-gray-600 text-sm">Create your first Pro-level email with deep research</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#6366F1] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">Try Different Tones</h3>
                      <p className="text-gray-600 text-sm">Experiment with casual, formal, and confident styles</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#6366F1] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">Use Email Editing</h3>
                      <p className="text-gray-600 text-sm">Refine your emails with AI-powered editing tools</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/generate">
                    <Button className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                      Start Creating Pro Emails
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <CardContent className="py-8">
                <h3 className="text-xl font-bold mb-4">Need Help Getting Started?</h3>
                <p className="text-gray-600 mb-6">
                  As a Pro user, you have access to priority support. We're here to help you get the most out of Reachful.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" className="border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white">
                    Contact Support
                  </Button>
                  <Link href="/generate">
                    <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                      Try Deep Search Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    </AuthProvider>
  )
} 