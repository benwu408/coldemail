'use client'

import { Search, Brain, Mail, Zap, Target, Users, Clock, CheckCircle, ArrowRight, TrendingUp, Shield, Lightbulb, Globe, BarChart3, MessageSquare, Send, Edit3, Copy, Download } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthProvider } from '@/contexts/AuthContext'

export default function HowItWorksPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section for How It Works */}
      <section className="relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-24 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl text-center relative z-10">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            How Reachful Works
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Transform cold outreach into warm connections with AI-powered personalization that actually gets responses.
          </p>
          <div className="mt-10">
            <Link href="/generate">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Start Generating Emails
              </Button>
            </Link>
          </div>
        </div>
        {/* Background shapes for visual interest */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#111827] mb-6">The Cold Outreach Problem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional cold emails have a 1-2% response rate. Most fail because they're generic, irrelevant, and don't establish genuine connections.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-[#111827] mb-6">Why Most Cold Emails Fail</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Generic templates</p>
                    <p className="text-gray-600 text-sm">One-size-fits-all approaches that ignore individual context</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">No personalization</p>
                    <p className="text-gray-600 text-sm">Recipients can tell the email wasn't written for them</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Poor timing</p>
                    <p className="text-gray-600 text-sm">Sending without understanding the recipient's situation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Weak value proposition</p>
                    <p className="text-gray-600 text-sm">Focusing on what you want instead of what they need</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Typical Cold Email Response Rate</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Generic templates</span>
                  <span className="text-sm font-medium text-red-600">1-2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '2%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Personalized emails</span>
                  <span className="text-sm font-medium text-green-600">15-25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '20%'}}></div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">*Industry average response rates</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps - Detailed */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#111827] mb-6">How Reachful Solves This</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform transforms cold outreach by creating genuinely personalized emails that establish real connections.
            </p>
          </div>

          {/* Step 1 - Detailed */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Search className="h-8 w-8 text-[#6366F1]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#111827]">Step 1: Smart Input Collection</h3>
                    <p className="text-gray-600">We gather the essential information to create meaningful connections</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Recipient Information</p>
                      <p className="text-gray-600 text-sm">Name, LinkedIn profile, company, and role details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Your Profile</p>
                      <p className="text-gray-600 text-sm">Background, experience, and professional context</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Outreach Purpose</p>
                      <p className="text-gray-600 text-sm">Clear objective and desired outcome</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-4">Example Input</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Recipient:</span>
                    <span className="text-gray-600 ml-2">Sarah Chen, VP of Marketing at TechCorp</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Purpose:</span>
                    <span className="text-gray-600 ml-2">Introduce our AI-powered analytics platform</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Context:</span>
                    <span className="text-gray-600 ml-2">They recently raised Series B funding</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 - Detailed */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-50 p-6 rounded-xl order-2 lg:order-1">
                <h4 className="font-bold text-gray-900 mb-4">AI Research Process</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700">ChatGPT web search analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Real-time company news and updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700">Professional background research</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-700">Industry insights and trends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-700">Personalization opportunities</span>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                    <Brain className="h-8 w-8 text-[#6366F1]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#111827]">Step 2: AI-Powered Research</h3>
                    <p className="text-gray-600">Deep analysis to find genuine connection points</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Professional Background</p>
                      <p className="text-gray-600 text-sm">Career history, achievements, and expertise areas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Company Context</p>
                      <p className="text-gray-600 text-sm">Recent news, challenges, and strategic priorities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Commonalities</p>
                      <p className="text-gray-600 text-sm">Shared experiences, interests, or mutual connections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Detailed */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
                    <Mail className="h-8 w-8 text-[#0F766E]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#111827]">Step 3: Personalized Email Generation</h3>
                    <p className="text-gray-600">AI crafts a compelling, personalized email</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Compelling Subject Line</p>
                      <p className="text-gray-600 text-sm">Attention-grabbing and relevant to their situation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Personalized Opening</p>
                      <p className="text-gray-600 text-sm">References specific details about them or their company</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Value-Driven Content</p>
                      <p className="text-gray-600 text-sm">Focuses on benefits and solutions for their challenges</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Clear Call-to-Action</p>
                      <p className="text-gray-600 text-sm">Specific next step that's easy to take</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-4">Generated Email Features</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700">Professional tone and structure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Ready to copy and send</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700">Export to email client</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-700">Optimized for deliverability</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#111827] mb-6">Why Choose Reachful?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for modern professionals who want to build genuine business relationships.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">Lightning Fast</h3>
              <p className="text-gray-600">
                Generate personalized emails in 30 seconds for basic research or 90 seconds for deep analysis using ChatGPT web search. 
                No more spending hours crafting individual emails.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">Privacy First</h3>
              <p className="text-gray-600">
                Your data is secure and private. We don't store sensitive information and use enterprise-grade 
                security to protect your outreach campaigns.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">Highly Targeted</h3>
              <p className="text-gray-600">
                Our AI finds specific connection points and personalization opportunities that generic 
                templates miss, leading to higher response rates.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">Better Results</h3>
              <p className="text-gray-600">
                Personalized emails typically perform better than generic templates. 
                Build meaningful business relationships that last.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">Time Efficient</h3>
              <p className="text-gray-600">
                Spend your time on high-value activities instead of writing emails. 
                Scale your outreach without sacrificing personalization.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">Professional Network</h3>
              <p className="text-gray-600">
                Build genuine connections with industry leaders, potential clients, and partners. 
                Turn cold outreach into warm relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#111827] mb-6">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade when you need more advanced features and higher volume.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-indigo-300 transition-colors duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#111827] mb-2">Free</h3>
                <p className="text-gray-600">Perfect for getting started</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#111827]">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">2 email generations per day</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Basic research with ChatGPT web search (30 seconds)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Professional email templates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Export to email client</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Email history tracking</span>
                </div>
              </div>
              
              <Link href="/generate">
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">
                  Get Started Free
                </Button>
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="opacity-90">For serious professionals</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$10</span>
                  <span className="opacity-90 ml-2">/month</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Unlimited email generations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Deep research with ChatGPT web search (90 seconds)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Personalized connections</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Tone customization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Email editing & refinement</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Advanced analytics</span>
                </div>
              </div>
              
              <Link href="/pricing">
                <Button className="w-full bg-white text-indigo-700 hover:bg-gray-100">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Outreach?</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-10">
            Join professionals who are building meaningful business relationships with AI-powered personalization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generate">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Start Generating Emails
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-700 text-lg px-8 py-3 rounded-full transition-all duration-300">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </AuthProvider>
  )
}
