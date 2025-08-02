'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Mail, 
  Search, 
  Brain, 
  Users, 
  Zap, 
  Shield, 
  ArrowRight, 
  Sparkles,
  Target,
  CheckCircle,
  Play,
  Star,
  Quote,
  Briefcase,
  MapPin,
  Heart
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import ColdEmailGenerator from './ColdEmailGenerator'
import Header from './Header'
import Link from 'next/link'

export default function HeroPage() {
  const { user } = useAuth()
  const [demoEmail, setDemoEmail] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [demoName, setDemoName] = useState('')
  const [demoCompanyRole, setDemoCompanyRole] = useState('')
  const [demoPurpose, setDemoPurpose] = useState('')
  const [demoResearch, setDemoResearch] = useState<string[]>([])
  const [isResearching, setIsResearching] = useState(false)
  const [finalEmail, setFinalEmail] = useState('')
  const [emailVisible, setEmailVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [currentPersona, setCurrentPersona] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  // Refs for auto-scrolling
  const researchRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLDivElement>(null)

  // Persona data for carousel
  const personas = [
    {
      name: 'David Thompson',
      role: 'Senior Product Manager',
      company: 'Microsoft',
      purpose: 'Networking',
      email: `Hi David,

I came across your work at Microsoft and was impressed by your recent post about building scalable product teams.

I'm a Stanford grad currently working on a startup in the productivity space. Given your experience, I'd love to get your perspective on some challenges we're facing.

Would you be open to a 15-minute chat next week?

Best,
Emma Rodriguez
Software Engineer & Co-founder`,
      fromEmail: 'emma.rodriguez@startup.com',
      toEmail: 'david.thompson@microsoft.com',
      subject: 'Coffee chat - Product development insights'
    },
    {
      name: 'Sarah Chen',
      role: 'VP of Engineering',
      company: 'Stripe',
      purpose: 'Job Inquiry',
      email: `Hi Sarah,

I've been following Stripe's engineering culture and was impressed by your recent talk about scaling engineering teams.

As a senior engineer with 8+ years of experience, I'm exploring opportunities where I can have significant impact on technical architecture and team development.

Would you be open to a brief conversation about potential opportunities on your team?

Best regards,
Alex Kim
Senior Software Engineer`,
      fromEmail: 'alex.kim@tech.com',
      toEmail: 'sarah.chen@stripe.com',
      subject: 'Engineering opportunities at Stripe'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Founder & CEO',
      company: 'TechFlow',
      purpose: 'Partnership',
      email: `Hi Michael,

I came across TechFlow's Series A announcement and was excited to see your vision for democratizing AI tools for small businesses.

I'm the founder of DataSync, a startup focused on helping small businesses integrate and automate their data workflows.

I believe there could be a great partnership opportunity between our companies. Would you be interested in a 20-minute call to explore synergies?

Best,
Jennifer Park
Founder & CEO, DataSync`,
      fromEmail: 'jennifer.park@datasync.com',
      toEmail: 'michael.rodriguez@techflow.com',
      subject: 'Partnership opportunity - DataSync & TechFlow'
    }
  ]

  // Auto-scroll research findings to bottom when new items are added
  useEffect(() => {
    if (researchRef.current && demoResearch.length > 0) {
      researchRef.current.scrollTop = researchRef.current.scrollHeight
    }
  }, [demoResearch])

  // Auto-scroll email to bottom when new content is added
  useEffect(() => {
    if (emailRef.current && finalEmail.length > 0) {
      emailRef.current.scrollTop = emailRef.current.scrollHeight
    }
  }, [finalEmail])

  // Scroll event listener for dynamic animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Persona carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPersona((prev) => (prev + 1) % personas.length)
    }, 8000) // 8 seconds total cycle (5 seconds for typing + 3 seconds pause)

    return () => clearInterval(interval)
  }, [personas.length])

  // Live demo email typing animation
  useEffect(() => {
    const currentPersonaData = personas[currentPersona]
    
    // Reset and start typing animation
    setDemoEmail('')
    setIsTyping(true)
    setEmailVisible(true)

    let currentIndex = 0
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= currentPersonaData.email.length) {
        setDemoEmail(currentPersonaData.email.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 12) // Fast typing

    return () => clearInterval(typeInterval)
  }, [currentPersona]) // Now depends on currentPersona

  // Interactive demo sequence
  const startDemo = () => {
    setShowDemo(true)
    setDemoStep(0)
    setDemoName('')
    setDemoCompanyRole('')
    setDemoPurpose('')
    setDemoResearch([])
    setFinalEmail('')
    runDemoSequence()
  }

  const runDemoSequence = async () => {
    // Step 1: Type the name, company/role, and purpose
    setDemoStep(1)
    await typeName('David Thompson')
    await typeCompanyRole('Senior Product Manager at Microsoft')
    await typePurpose('Networking')
    
    // Step 2: Show research being done
    setDemoStep(2)
    setIsResearching(true)
    await simulateResearch()
    
    // Step 3: Show final email with research
    setDemoStep(3)
    await generateFinalEmail()
  }

  const typeName = async (name: string) => {
    for (let i = 0; i <= name.length; i++) {
      setDemoName(name.slice(0, i))
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const typeCompanyRole = async (companyRole: string) => {
    for (let i = 0; i <= companyRole.length; i++) {
      setDemoCompanyRole(companyRole.slice(0, i))
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const typePurpose = async (purpose: string) => {
    for (let i = 0; i <= purpose.length; i++) {
      setDemoPurpose(purpose.slice(0, i))
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const simulateResearch = async () => {
    const researchSteps = [
      'Searching for David Thompson on LinkedIn...',
      'Found: Senior Product Manager at Microsoft, 7+ years experience',
      'Discovered: Stanford alum (Computer Science, 2017)',
      'Found recent post: "Building Scalable Product Teams"',
      'Located: Seattle, Washington',
      'Found: Previous experience at Amazon',
      'Discovered: Active in Product Management community'
    ]

    for (const step of researchSteps) {
      setDemoResearch(prev => [...prev, step])
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    setIsResearching(false)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const generateFinalEmail = async () => {
    const email = `Hi David,

I came across your work at Microsoft and was particularly impressed by your recent LinkedIn post about building scalable product teams. Your insights on team dynamics and product strategy really resonated with me.

As a fellow Stanford Computer Science grad (I graduated in 2020), I was excited to see another Cardinal making waves in the tech industry. Your journey from Amazon to Microsoft is inspiring, and I'd love to learn from your experience scaling products at such innovative companies.

I'm currently working on a startup in the productivity space, and given your expertise in product management and your recent focus on team building, I'd love to get your perspective on some challenges we're facing with product development.

Would you be open to a 15-minute chat next week? I'd be happy to work around your schedule.

Best,
Emma Rodriguez
Software Engineer & Co-founder`

    let currentIndex = 0
    const typeInterval = setInterval(() => {
      if (currentIndex <= email.length) {
        setFinalEmail(email.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typeInterval)
      }
    }, 30)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left side - Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-[#6366F1] text-sm font-medium rounded-full border border-indigo-100">
                <Sparkles className="h-3 w-3" />
                AI-powered personalization
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Generate cold emails that actually get
                <span className="text-[#6366F1]"> responses</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Stop sending generic emails. Our AI researches your prospects, finds commonalities, 
                and crafts personalized outreach that sounds human.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/generate"
                className="inline-flex items-center justify-center bg-[#111827] hover:bg-gray-800 text-white rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Start generating emails
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 py-4 text-base font-medium transition-all duration-200"
                onClick={startDemo}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch demo
              </Button>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>30-second generation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>60% higher response rate</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img 
                    src="/headshots/u7958324354_professional_headshot_of_tech_bro_--v_7_aacb0aa5-e8c5-4c5d-993c-db33ff78e493_0.png" 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                  <img 
                    src="/headshots/u7958324354_professional_headshot_of_tech_bro_--v_7_aacb0aa5-e8c5-4c5d-993c-db33ff78e493_3.png" 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                  <img 
                    src="/headshots/u7958324354_professional_headshot_of_woman_working_in_tech_--_338a63fd-5495-4f7d-8fcd-77a14abeec14_1.png" 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-[#111827]">Join 2,000+ professionals</div>
                  <div className="text-gray-600">who've improved their response rates</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Live email preview */}
          <div className="relative">
            {/* Persona info card - positioned above email */}
            <div className="absolute -top-20 left-0 bg-white rounded-xl shadow-md border border-gray-100 p-4 transition-all duration-500 z-10">
              <div className="text-sm">
                <div className="font-bold text-[#111827] mb-1">
                  {personas[currentPersona].name}
                </div>
                <div className="text-gray-600">
                  {personas[currentPersona].role} at {personas[currentPersona].company}
                </div>
                <div className="text-xs text-[#6366F1] font-medium mt-1">
                  Purpose: {personas[currentPersona].purpose}
                </div>
              </div>
            </div>

            <div 
              className={`bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all duration-700 ease-out ${
                emailVisible 
                  ? `opacity-100 translate-y-0 scale-100` 
                  : 'opacity-0 translate-y-8 scale-95'
              } hover:shadow-lg hover:translate-y-[-4px] hover:scale-[1.02] transition-all duration-300 ease-out`}
              style={{
                transform: `translateY(${Math.min(scrollY * 0.1, 20)}px) scale(${1 + Math.min(scrollY * 0.0001, 0.02)})`
              }}
            >
              {/* Email Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">From:</span>
                    <span className="text-sm text-gray-900 transition-all duration-500">
                      {personas[currentPersona].fromEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">To:</span>
                    <span className="text-sm text-gray-900 transition-all duration-500">
                      {personas[currentPersona].toEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Subject:</span>
                    <span className="text-sm text-gray-900 transition-all duration-500">
                      {personas[currentPersona].subject}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Email Body */}
              <div className="p-6">
                <div className="font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {demoEmail}
                  {isTyping && (
                    <span className="inline-block w-2 h-5 bg-[#6366F1] animate-pulse ml-1"></span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Persona indicator */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              {personas.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentPersona 
                      ? 'bg-[#6366F1] scale-125' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div 
              className={`absolute -top-4 -right-4 bg-white rounded-xl shadow-md border border-gray-100 p-3 transition-all duration-700 ease-out delay-300 ${
                emailVisible 
                  ? `opacity-100 translate-y-0 scale-100` 
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
              style={{
                transform: `translateY(${Math.min(scrollY * 0.05, 10)}px)`
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600">AI researching...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why professionals choose ColdEmail AI - Full Width Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#111827] mb-6 tracking-tight">Why professionals choose ColdEmail AI</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform combines cutting-edge technology with human-like personalization to deliver results that generic email tools simply can't match.
            </p>
          </div>
          
          {/* Asymmetric grid layout */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Large feature card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-10 border border-indigo-100 hover:shadow-lg transition-all duration-200 hover:translate-y-1">
              <div className="w-16 h-16 bg-indigo-100 text-[#6366F1] rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">Real-time Research</h3>
              <p className="text-gray-600 text-lg leading-relaxed">AI searches LinkedIn, company websites, and news for fresh insights that make your emails genuinely personal.</p>
            </div>
            
            {/* Large feature card */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-10 border border-teal-100 hover:shadow-lg transition-all duration-200 hover:translate-y-1">
              <div className="w-16 h-16 bg-teal-100 text-[#0F766E] rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">Smart Connections</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Finds alumni, industry, and location-based commonalities that create authentic rapport with prospects.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-1">
              <div className="w-12 h-12 bg-purple-100 text-[#6366F1] rounded-xl flex items-center justify-center mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Human-like Writing</h3>
              <p className="text-gray-600 leading-relaxed">Natural, conversational tone that doesn't sound automated or robotic.</p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-1">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">Your data stays secure and is never shared with third parties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by professionals across industries */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#111827] mb-6 tracking-tight">Trusted by professionals across industries</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From startup founders to Fortune 500 executives, professionals are using ColdEmail AI 
              to build meaningful connections and advance their careers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-100 transition-colors duration-200">
                <Briefcase className="h-8 w-8 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Startup Founders</h3>
              <p className="text-gray-600 leading-relaxed">Connect with investors, partners, and potential customers</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-100 transition-colors duration-200">
                <Users className="h-8 w-8 text-[#0F766E]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Job Seekers</h3>
              <p className="text-gray-600 leading-relaxed">Reach out to hiring managers and industry leaders</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100 transition-colors duration-200">
                <Target className="h-8 w-8 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Sales Professionals</h3>
              <p className="text-gray-600 leading-relaxed">Generate qualified leads and close more deals</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-100 transition-colors duration-200">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Networkers</h3>
              <p className="text-gray-600 leading-relaxed">Build meaningful professional relationships</p>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-gray-100">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-10 border border-indigo-100">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="text-center md:text-left">
                  <div className="text-4xl font-bold text-[#6366F1] mb-2">60%</div>
                  <div className="text-sm text-gray-600 font-medium">Higher response rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#6366F1] mb-2">30s</div>
                  <div className="text-sm text-gray-600 font-medium">Average generation time</div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-4xl font-bold text-[#6366F1] mb-2">2,000+</div>
                  <div className="text-sm text-gray-600 font-medium">Active professionals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#111827] mb-6 tracking-tight">How it works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Three simple steps to create personalized cold emails that get responses
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-100 transition-colors duration-200">
                <Search className="h-8 w-8 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">1. Enter prospect details</h3>
              <p className="text-gray-600 leading-relaxed">
                Provide the recipient's name, role, company, and your outreach purpose. 
                Add any context or connections you already have.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100 transition-colors duration-200">
                <Brain className="h-8 w-8 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">2. AI research & analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI researches the prospect online, finds commonalities with your profile, 
                and identifies personalization opportunities.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-100 transition-colors duration-200">
                <Mail className="h-8 w-8 text-[#0F766E]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-4">3. Get your email</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive a personalized, professional cold email ready to send. 
                Edit, copy, or export directly to your email client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile & Connections Section */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Profile Info */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#6366F1] text-sm font-medium rounded-full border border-purple-100">
                  <Users className="h-3 w-3" />
                  Smart connections
                </div>
                <h2 className="text-4xl font-bold text-[#111827] tracking-tight">
                  Your profile powers personalized connections
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Set up your professional background once, and our AI uses it to find genuine 
                  commonalities with every prospect you reach out to.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Target className="h-5 w-5 text-[#6366F1]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Education & Background</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your school, major, and graduation year help find alumni connections. 
                      "We both went to UIUC" creates instant rapport.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Briefcase className="h-5 w-5 text-[#0F766E]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Work Experience</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your current role, company, and industry help identify professional 
                      connections and shared career paths.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-[#6366F1]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Location & Network</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your location helps find local connections. "I'm also in San Francisco" 
                      can be the start of a great conversation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Interests & Skills</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your hobbies, skills, and interests help find personal connections 
                      that go beyond just professional networking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/profile">
                  <Button 
                    className="bg-[#111827] hover:bg-gray-800 text-white rounded-full px-8 py-3 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Set up your profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Connection Examples */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#6366F1]" />
                  AI-Discovered Connections
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-[#6366F1] rounded-full"></div>
                      <span className="text-sm font-bold text-[#6366F1]">Education Match</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "As a fellow UIUC Computer Science grad, I was excited to see another Illini..."
                    </p>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-[#0F766E] rounded-full"></div>
                      <span className="text-sm font-bold text-[#0F766E]">Industry Connection</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "Given your experience in fintech and my background in SaaS..."
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-[#6366F1] rounded-full"></div>
                      <span className="text-sm font-bold text-[#6366F1]">Location Match</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "I'm also based in San Francisco and would love to grab coffee..."
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <span className="text-sm font-bold text-orange-600">Interest Overlap</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "I noticed you're also passionate about sustainable tech..."
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 text-center leading-relaxed">
                    💡 These connections make your emails feel personal and genuine, 
                    not like generic templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#111827] mb-6 tracking-tight">Trusted by professionals</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See how others are getting better responses with personalized emails
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#FAFAFA] rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-8 leading-relaxed">
                "ColdEmail AI helped me land my dream job at Google. The personalized approach 
                made all the difference - I got responses from 3 out of 5 emails I sent."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="/headshots/u7958324354_professional_headshot_of_tech_bro_--v_7_aacb0aa5-e8c5-4c5d-993c-db33ff78e493_0.png" 
                  alt="Marcus Johnson" 
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                <div>
                  <div className="font-bold text-[#111827]">Marcus Johnson</div>
                  <div className="text-sm text-gray-600">Software Engineer, Google</div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FAFAFA] rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-8 leading-relaxed">
                "As an investment banker, networking is everything. This tool has been a game-changer. 
                The AI research feature finds connections I never would have discovered."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="/headshots/u7958324354_professional_headshot_of_tech_bro_--v_7_aacb0aa5-e8c5-4c5d-993c-db33ff78e493_3.png" 
                  alt="James Wilson" 
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                <div>
                  <div className="font-bold text-[#111827]">James Wilson</div>
                  <div className="text-sm text-gray-600">Investment Banker, Goldman Sachs</div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FAFAFA] rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-8 leading-relaxed">
                "Finally, a cold email tool that doesn't sound robotic. The personalization 
                is incredible and the response rate improvement is real."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="/headshots/u7958324354_professional_headshot_of_woman_working_in_tech_--_338a63fd-5495-4f7d-8fcd-77a14abeec14_1.png" 
                  alt="Priya Patel" 
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                <div>
                  <div className="font-bold text-[#111827]">Priya Patel</div>
                  <div className="text-sm text-gray-600">Product Manager, Microsoft</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#111827] text-white">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to transform your cold emails?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who are getting better responses with AI-powered personalization.
          </p>
          <Link 
            href="/generate"
            className="inline-flex items-center justify-center bg-white text-[#111827] hover:bg-gray-100 rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Start generating now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-[#6366F1] rounded-xl flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#111827]">
                ColdEmail AI
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-[#111827] transition-colors duration-200 font-medium">Terms</a>
              <a href="#" className="hover:text-[#111827] transition-colors duration-200 font-medium">Privacy</a>
              <a href="#" className="hover:text-[#111827] transition-colors duration-200 font-medium">Contact</a>
              <div className="flex items-center gap-3">
                <a href="#" className="hover:text-[#111827] transition-colors duration-200 font-medium">X</a>
                <a href="#" className="hover:text-[#111827] transition-colors duration-200 font-medium">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>&copy; 2024 ColdEmail AI. Built for better networking.</p>
          </div>
        </div>
      </footer>

      {/* Interactive Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#111]">Live Demo</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDemo(false)}
                className="text-gray-500 hover:text-[#111]"
              >
                ✕
              </Button>
            </div>

            {/* Demo Content */}
            <div className="p-6 space-y-6">
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`flex items-center gap-2 ${demoStep >= 1 ? 'text-[#3B82F6]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    demoStep >= 1 ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    1
                  </div>
                  <span className="text-sm font-medium">Enter Name</span>
                </div>
                <div className={`w-12 h-0.5 ${demoStep >= 2 ? 'bg-[#3B82F6]' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${demoStep >= 2 ? 'text-[#3B82F6]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    demoStep >= 2 ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className="text-sm font-medium">AI Research</span>
                </div>
                <div className={`w-12 h-0.5 ${demoStep >= 3 ? 'bg-[#3B82F6]' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${demoStep >= 3 ? 'text-[#3B82F6]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    demoStep >= 3 ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    3
                  </div>
                  <span className="text-sm font-medium">Generate Email</span>
                </div>
              </div>

              {/* Demo Interface */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left: Input Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#111]">Input Form</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Name</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900">{demoName}</span>
                        {demoStep === 1 && (
                          <span className="inline-block w-2 h-5 bg-[#3B82F6] animate-pulse ml-1"></span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Company & Role</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900">{demoCompanyRole}</span>
                        {demoStep === 1 && demoName === 'David Thompson' && demoCompanyRole.length < 'Senior Product Manager at Microsoft'.length && (
                          <span className="inline-block w-2 h-5 bg-[#3B82F6] animate-pulse ml-1"></span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Purpose</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900">{demoPurpose}</span>
                        {demoStep === 1 && demoCompanyRole === 'Senior Product Manager at Microsoft' && demoPurpose.length < 'Networking'.length && (
                          <span className="inline-block w-2 h-5 bg-[#3B82F6] animate-pulse ml-1"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Output */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#111]">AI Research & Email</h3>
                  
                  {/* Research Section */}
                  {demoStep >= 2 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#3B82F6]">
                        <Search className="h-4 w-4" />
                        AI Research in Progress
                        {isResearching && (
                          <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto" ref={researchRef}>
                        {demoResearch.map((finding, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded text-xs">
                            <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="text-gray-700">{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Email Output */}
                  {demoStep >= 3 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                        <Mail className="h-4 w-4" />
                        Generated Email
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto" ref={emailRef}>
                        <div className="font-mono text-xs leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {finalEmail}
                          {demoStep === 3 && (
                            <span className="inline-block w-2 h-5 bg-[#3B82F6] animate-pulse ml-1"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Demo Actions */}
              <div className="flex justify-center pt-6 border-t border-gray-100">
                <Link 
                  href="/generate"
                  className="inline-flex items-center justify-center bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl px-8 py-3 text-base font-medium transition-all duration-200"
                >
                  Try it yourself
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 