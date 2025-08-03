import { Metadata } from 'next'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Zap, Shield, Users, MessageSquare, Lock, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing | Reachful - Free AI Email Generator with Premium Features',
  description: 'Start free with unlimited email generation, or upgrade to Premium for advanced AI research, deeper personalization, and workflow integrations. Only $14.99/month.',
  keywords: [
    'Reachful pricing',
    'free email generator',
    'AI email tool pricing',
    'cold email generator cost',
    'premium email outreach',
    'freemium email tool'
  ],
  openGraph: {
    title: 'Pricing | Reachful - Free AI Email Generator with Premium Features',
    description: 'Start free with unlimited email generation, or upgrade to Premium for advanced AI research and deeper personalization.',
    url: 'https://reachful.io/pricing',
  },
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent <span className="text-[#6366F1]">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free with unlimited email generation, or unlock advanced AI research and deeper personalization with Premium.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200 shadow-lg relative">
            <CardHeader className="text-center pb-8">
              <div className="mb-4">
                <div className="text-6xl font-bold text-gray-900 mb-2">$0</div>
                <div className="text-gray-600">Forever</div>
              </div>
              <CardTitle className="text-3xl font-bold">Free Plan</CardTitle>
              <p className="text-gray-600 mt-2">
                Perfect for getting started with AI-powered outreach
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Everything you need to start:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Unlimited email generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Basic AI research & personalization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Multiple tone options</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Email history & management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Basic profile customization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Copy to clipboard & download</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Community support</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-6">
                <Link href="/generate">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-lg py-6">
                    Start Free Now
                  </Button>
                </Link>
              </div>

              {/* No Credit Card Required */}
              <div className="text-center text-gray-500 text-sm">
                No credit card required • No hidden fees
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-[#6366F1] shadow-lg relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-[#6366F1] text-white px-4 py-2 text-sm font-semibold rounded-bl-lg">
              MOST POPULAR
            </div>
            
            <CardHeader className="text-center pb-8">
              <div className="mb-4">
                <div className="text-6xl font-bold text-[#6366F1] mb-2">$14.99</div>
                <div className="text-gray-600">per month</div>
              </div>
              <CardTitle className="text-3xl font-bold">Premium</CardTitle>
              <p className="text-gray-600 mt-2">
                Advanced features for serious networkers and professionals
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Everything in Free, plus:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span className="font-medium">Advanced AI research & deep personalization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span className="font-medium">Multiple email variations & A/B testing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span className="font-medium">Smart commonality detection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span className="font-medium">Gmail/Outlook integration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span className="font-medium">One-click email sending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span className="font-medium">Email tracking & follow-up reminders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span className="font-medium">Remove "Generated by Reachful" branding</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <span className="font-medium">Priority customer support</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-6">
                <Link href="/generate">
                  <Button className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-lg py-6">
                    Start 7-Day Free Trial
                  </Button>
                </Link>
              </div>

              {/* Annual Option */}
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800 font-medium">
                    Save 17% with annual billing
                  </div>
                  <div className="text-xs text-green-600">
                    $149.99/year (effectively $12.50/month)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Why Choose Premium?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deeper Personalization</h3>
              <p className="text-gray-600">
                Advanced AI research finds specific connections, recent updates, and personal details that make your outreach truly stand out.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time & Effort</h3>
              <p className="text-gray-600">
                One-click sending, email tracking, and workflow integrations turn Reachful into your personal outreach assistant.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Polish</h3>
              <p className="text-gray-600">
                Remove branding, get multiple email variations, and access priority support for a truly professional experience.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-3 gap-0">
              {/* Header */}
              <div className="p-6 bg-gray-50 border-r border-gray-200">
                <h3 className="font-semibold text-lg mb-2">Feature</h3>
              </div>
              <div className="p-6 bg-gray-50 border-r border-gray-200 text-center">
                <h3 className="font-semibold text-lg mb-2">Free</h3>
              </div>
              <div className="p-6 bg-[#6366F1] text-white text-center">
                <h3 className="font-semibold text-lg mb-2">Premium</h3>
              </div>
              
              {/* Features */}
              <div className="p-4 border-r border-gray-200 flex items-center">
                <span className="font-medium">Email Generation</span>
              </div>
              <div className="p-4 border-r border-gray-200 text-center">
                <Check className="h-5 w-5 text-green-500 mx-auto" />
              </div>
              <div className="p-4 text-center">
                <Check className="h-5 w-5 text-white mx-auto" />
              </div>

              <div className="p-4 border-r border-gray-200 flex items-center bg-gray-50">
                <span className="font-medium">AI Research</span>
              </div>
              <div className="p-4 border-r border-gray-200 text-center bg-gray-50">
                <span className="text-sm text-gray-600">Basic</span>
              </div>
              <div className="p-4 text-center bg-gray-50">
                <span className="text-sm font-medium text-[#6366F1]">Advanced</span>
              </div>

              <div className="p-4 border-r border-gray-200 flex items-center">
                <span className="font-medium">Email Variations</span>
              </div>
              <div className="p-4 border-r border-gray-200 text-center">
                <span className="text-sm text-gray-600">1 version</span>
              </div>
              <div className="p-4 text-center">
                <span className="text-sm font-medium text-white">Multiple</span>
              </div>

              <div className="p-4 border-r border-gray-200 flex items-center bg-gray-50">
                <span className="font-medium">Gmail Integration</span>
              </div>
              <div className="p-4 border-r border-gray-200 text-center bg-gray-50">
                <span className="text-sm text-gray-600">Manual copy</span>
              </div>
              <div className="p-4 text-center bg-gray-50">
                <Check className="h-5 w-5 text-[#6366F1] mx-auto" />
              </div>

              <div className="p-4 border-r border-gray-200 flex items-center">
                <span className="font-medium">Email Tracking</span>
              </div>
              <div className="p-4 border-r border-gray-200 text-center">
                <span className="text-sm text-gray-600">Not available</span>
              </div>
              <div className="p-4 text-center">
                <Check className="h-5 w-5 text-white mx-auto" />
              </div>

              <div className="p-4 border-r border-gray-200 flex items-center bg-gray-50">
                <span className="font-medium">Remove Branding</span>
              </div>
              <div className="p-4 border-r border-gray-200 text-center bg-gray-50">
                <span className="text-sm text-gray-600">Not available</span>
              </div>
              <div className="p-4 text-center bg-gray-50">
                <Check className="h-5 w-5 text-[#6366F1] mx-auto" />
              </div>

              <div className="p-4 border-r border-gray-200 flex items-center">
                <span className="font-medium">Customer Support</span>
              </div>
              <div className="p-4 border-r border-gray-200 text-center">
                <span className="text-sm text-gray-600">Community</span>
              </div>
              <div className="p-4 text-center">
                <span className="text-sm font-medium text-white">Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-3">Can I really use the free plan forever?</h3>
              <p className="text-gray-600">
                Yes! The free plan includes unlimited email generation with no time limits. You can use it as much as you want.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-3">What's the difference in AI research?</h3>
              <p className="text-gray-600">
                Free users get basic personalization. Premium users get deep AI research that finds specific connections, recent updates, and personal details from multiple sources.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-3">Do I need a credit card for the free trial?</h3>
              <p className="text-gray-600">
                No credit card required for the 7-day Premium trial. You can cancel anytime during the trial period.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-3">Can I switch between plans?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade to Premium anytime, and downgrade back to Free if needed. No long-term commitments required.
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/generate">
                <Button className="bg-white text-[#6366F1] hover:bg-gray-100 text-lg px-8 py-4">
                  Start Free Now
                </Button>
              </Link>
              <Link href="/generate">
                <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#6366F1] text-lg px-8 py-4">
                  Try Premium Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 