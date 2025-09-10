'use client'

import { 
  Brain, 
  Target, 
  Users, 
  Zap, 
  Heart, 
  Shield, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Globe,
  Mail,
  BarChart3,
  Lightbulb,
  Star,
  Award,
  MessageSquare,
  Clock
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-24 overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Cold outreach that feels warm</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
              About <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">Reachful</span>
            </h1>
            
            <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed mb-12">
              We're revolutionizing cold outreach by making it feel warm, personal, and authentic. 
              Our AI-powered platform transforms generic emails into meaningful connections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/generate">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Try Reachful Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-700 text-lg px-8 py-4 rounded-full transition-all duration-300">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Background decorations */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-8">The Cold Outreach Problem</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-xl">✗</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Generic Templates</h3>
                      <p className="text-gray-600">One-size-fits-all approaches that ignore individual context and feel robotic.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-xl">✗</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Low Response Rates</h3>
                      <p className="text-gray-600">Traditional cold emails have only 1-2% response rates, wasting time and opportunities.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-xl">✗</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Personalization</h3>
                      <p className="text-gray-600">Recipients can immediately tell the email wasn't written for them specifically.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Solution</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Research</h4>
                      <p className="text-gray-600">Deep web research finds genuine connections and recent activities.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Personalization</h4>
                      <p className="text-gray-600">Creates emails that feel like they were written by a human who did their homework.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Better Response Rates</h4>
                      <p className="text-gray-600">Personalized emails typically perform better than generic templates.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission & Vision</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're on a mission to transform cold outreach from a numbers game into a relationship-building tool.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  To make cold outreach feel warm and authentic by leveraging AI to create personalized, 
                  human-like emails that build genuine connections and drive meaningful conversations.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  A world where every professional interaction feels personal and meaningful, 
                  where technology enhances human connection rather than replacing it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These principles guide everything we do and every decision we make.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Authenticity</h3>
                <p className="text-gray-600">
                  We believe in genuine connections. Every email we generate is designed to feel human, 
                  authentic, and written with real intent to help, not just sell.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Personalization</h3>
                <p className="text-gray-600">
                  No more generic templates. Our AI finds real connections and creates truly personalized 
                  outreach that shows you've done your homework.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Results</h3>
                <p className="text-gray-600">
                  We're obsessed with helping you get better response rates and build meaningful relationships 
                  that lead to real business outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Powered by AI Technology</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine modern AI technology with understanding of human communication 
                to create emails that sound genuinely human.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Brain className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">ChatGPT Web Search</h3>
                      <p className="text-gray-600">
                        Our AI automatically searches the web for prospect information, recent activities, 
                        company news, and potential connections to create highly personalized emails.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Commonality Detection</h3>
                      <p className="text-gray-600">
                        Identifies genuine shared experiences, mutual connections, and relevant touchpoints 
                        that create natural conversation starters.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Human-Like Writing</h3>
                      <p className="text-gray-600">
                        Generates emails that sound like they were written by a human who actually 
                        researched the recipient and cares about building a relationship.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">AI Research Process</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span>Web search for prospect information</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span>Analyze company and industry context</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span>Identify commonalities and connections</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span>Generate personalized email content</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Why Choose Reachful</h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Our AI-powered platform helps you create more personalized and effective cold outreach emails.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">Fast</div>
                <div className="text-lg opacity-90">Generation</div>
                <div className="text-sm opacity-75">30-90 seconds vs hours of research</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">Smart</div>
                <div className="text-lg opacity-90">Research</div>
                <div className="text-sm opacity-75">AI finds genuine connections</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">Personal</div>
                <div className="text-lg opacity-90">Content</div>
                <div className="text-sm opacity-75">Human-like, personalized emails</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">Easy</div>
                <div className="text-lg opacity-90">To Use</div>
                <div className="text-sm opacity-75">Simple interface, powerful results</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Built by Professionals, for Professionals</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our team combines expertise in AI, sales, and human psychology to create 
                the most effective cold outreach platform available.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Experts</h3>
                <p className="text-gray-600">
                  Machine learning engineers with deep expertise in natural language processing 
                  and human communication patterns.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sales Professionals</h3>
                <p className="text-gray-600">
                  Former sales leaders who understand the challenges of cold outreach 
                  and what actually works in real-world scenarios.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">UX Designers</h3>
                <p className="text-gray-600">
                  User experience experts focused on making complex AI technology 
                  simple and intuitive for busy professionals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Outreach?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                Join professionals who are already getting better results with Reachful. 
                Start generating personalized emails in under 30 seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/generate">
                  <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-700 text-lg px-8 py-4 rounded-full transition-all duration-300">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-8 text-sm opacity-75">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>2 free emails per day</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AuthProvider>
  )
} 