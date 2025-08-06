'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Zap, Crown, Users, MessageSquare, Search, Edit, Infinity, Calendar } from 'lucide-react'
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
              Start free with basic research, upgrade to pro for deep insights and unlimited access.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <div className="text-6xl font-bold text-gray-700 mb-2">$0</div>
                  <div className="text-gray-600">Forever</div>
                </div>
                <CardTitle className="text-3xl font-bold">Free</CardTitle>
                <p className="text-gray-600 mt-2">
                  Perfect for getting started with AI-powered outreach
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">What's included:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span><strong>Basic search</strong> - Standard research capabilities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span><strong>2 generations per day</strong> - Email generation limit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Standard tone (Professional)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Export to email clients</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Email history</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/generate">
                    <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white text-lg py-6">
                      Start Free
                    </Button>
                  </Link>
                </div>

                <div className="text-center text-gray-500 text-sm">
                  No credit card required
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-[#6366F1] shadow-xl relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-[#6366F1] text-white px-4 py-2 text-sm font-semibold rounded-bl-lg">
                RECOMMENDED
              </div>
              
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <div className="text-6xl font-bold text-[#6366F1] mb-2">$10</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Crown className="h-8 w-8 text-[#6366F1]" />
                  Pro
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Advanced features for power users and teams
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Everything in Free, plus:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Search className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                      <span><strong>Deep research</strong> - 12-phase progressive search with 3x more data</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Infinity className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                      <span><strong>Unlimited generations</strong> - No daily limits</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                      <span><strong>Tone customization</strong> - Casual, Formal, Confident, and more</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Edit className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                      <span><strong>Email editing</strong> - AI-powered email refinement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                      <span>Advanced commonality analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                      <span>Advanced analytics & insights</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00">
                    <Button className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-lg py-6">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>

                <div className="text-center text-gray-500 text-sm">
                  Cancel anytime
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Comparison */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold">Features</th>
                      <th className="text-center py-4 px-6 font-semibold">Free</th>
                      <th className="text-center py-4 px-6 font-semibold text-[#6366F1]">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-4 px-6">Search Type</td>
                      <td className="py-4 px-6 text-center">Basic (4 searches)</td>
                      <td className="py-4 px-6 text-center text-[#6366F1] font-semibold">Deep (12 progressive searches)</td>
                    </tr>
                    <tr className="bg-gray-25">
                      <td className="py-4 px-6">Daily Generations</td>
                      <td className="py-4 px-6 text-center">2 per day</td>
                      <td className="py-4 px-6 text-center text-[#6366F1] font-semibold">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6">Generation Time</td>
                      <td className="py-4 px-6 text-center">30 seconds</td>
                      <td className="py-4 px-6 text-center text-[#6366F1] font-semibold">90 seconds</td>
                    </tr>
                    <tr className="bg-gray-25">
                      <td className="py-4 px-6">Tone Options</td>
                      <td className="py-4 px-6 text-center">1 (Professional)</td>
                      <td className="py-4 px-6 text-center text-[#6366F1] font-semibold">Multiple (Casual, Formal, Confident)</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6">Email Editing</td>
                      <td className="py-4 px-6 text-center">❌</td>
                      <td className="py-4 px-6 text-center text-[#6366F1] font-semibold">✅</td>
                    </tr>
                    <tr className="bg-gray-25">
                      <td className="py-4 px-6">Research Depth</td>
                      <td className="py-4 px-6 text-center">Standard</td>
                      <td className="py-4 px-6 text-center text-[#6366F1] font-semibold">Comprehensive (3x more data)</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6">Support</td>
                      <td className="py-4 px-6 text-center">Standard</td>
                      <td className="py-4 px-6 text-center text-[#6366F1] font-semibold">Priority</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">What's the difference between basic and deep search?</h3>
                <p className="text-gray-600">
                  Basic search uses 4 standard queries (30s), while deep search uses 12 progressive AI-guided searches (90s) for 3x more comprehensive data.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">Can I upgrade anytime?</h3>
                <p className="text-gray-600">
                  Yes! You can upgrade to Pro anytime and get immediate access to all premium features.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">What happens if I cancel?</h3>
                <p className="text-gray-600">
                  You'll keep Pro features until your billing period ends, then automatically switch to the free plan. No data is lost.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">Is my data secure?</h3>
                <p className="text-gray-600">
                  Absolutely. We use enterprise-grade security and never share your data. All information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Outreach?</h2>
              <p className="text-xl mb-6 opacity-90">
                Start free, upgrade when you need more power. No commitments, no hidden fees.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/generate">
                  <Button className="bg-white text-[#6366F1] hover:bg-gray-100 text-lg px-8 py-4">
                    Start Free
                  </Button>
                </Link>
                <Link href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00">
                  <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#6366F1] text-lg px-8 py-4">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  )
} 