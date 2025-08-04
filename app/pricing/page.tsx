'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Zap, Shield, Users, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/AuthContext'

export default function PricingPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        
        <div className="container mx-auto px-6 py-16 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent <span className="text-[#6366F1]">Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Currently free to use while we're in beta. No hidden fees, no credit card required.
            </p>
          </div>

          {/* Free Plan Card */}
          <div className="max-w-2xl mx-auto mb-16">
            <Card className="border-2 border-[#6366F1] shadow-lg relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-[#6366F1] text-white px-4 py-2 text-sm font-semibold rounded-bl-lg">
                FREE
              </div>
              
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <div className="text-6xl font-bold text-[#6366F1] mb-2">$0</div>
                  <div className="text-gray-600">Forever</div>
                </div>
                <CardTitle className="text-3xl font-bold">Free Plan</CardTitle>
                <p className="text-gray-600 mt-2">
                  Perfect for individuals and small teams getting started with AI-powered outreach
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Everything you need to get started:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Unlimited AI email generation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>AI-powered prospect research</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Commonality detection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Multiple tone options (Casual, Formal, Confident)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Email history and management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Profile customization</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Export to Gmail, clipboard, or download</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Priority customer support</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-6">
                  <Link href="/generate">
                    <Button className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-lg py-6">
                      Start Generating Emails - Free
                    </Button>
                  </Link>
                </div>

                {/* No Credit Card Required */}
                <div className="text-center text-gray-500 text-sm">
                  No credit card required • No hidden fees • Cancel anytime
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Free Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8">Why We're Free</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#6366F1]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Build Our Community</h3>
                <p className="text-gray-600">
                  We're building a community of professionals who believe in authentic, personalized outreach.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Beta Testing</h3>
                <p className="text-gray-600">
                  We're in beta and want to gather feedback from real users to improve our platform.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Prove Value First</h3>
                <p className="text-gray-600">
                  We want you to experience the full value of Reachful before considering any paid plans.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">Is it really free forever?</h3>
                <p className="text-gray-600">
                  Yes! We're currently in beta and offering all features completely free. We'll give plenty of notice if we introduce paid plans in the future.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">Are there any limitations?</h3>
                <p className="text-gray-600">
                  No limitations on the free plan. You get unlimited email generation, AI research, and all features.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">Do I need a credit card?</h3>
                <p className="text-gray-600">
                  No credit card required! Simply sign up with your email and start using Reachful immediately.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">What about data privacy?</h3>
                <p className="text-gray-600">
                  Your data is secure and private. We never share your information and you can delete your account anytime.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Outreach?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of professionals who are already getting better results with Reachful.
              </p>
              <Link href="/generate">
                <Button className="bg-white text-[#6366F1] hover:bg-gray-100 text-lg px-8 py-4">
                  Start Free Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  )
} 