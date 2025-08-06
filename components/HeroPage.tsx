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
  Heart,
  Crown,
  User
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import ColdEmailGenerator from './ColdEmailGenerator'
import Header from './Header'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HeroPage() {
  const { user } = useAuth()
  const [userSubscription, setUserSubscription] = useState<{ plan_name: string } | null>(null)
  const [demoEmail, setDemoEmail] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [emailVisible, setEmailVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [currentPersona, setCurrentPersona] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  
  // Demo section scroll states
  const [demoStep1Visible, setDemoStep1Visible] = useState(false)
  const [demoStep2Visible, setDemoStep2Visible] = useState(false)
  const [demoStep3Visible, setDemoStep3Visible] = useState(false)
  const [researchItemsVisible, setResearchItemsVisible] = useState(0)
  const [emailContentVisible, setEmailContentVisible] = useState(0)
  
  // Basic info fields states
  const [recipientNameVisible, setRecipientNameVisible] = useState(false)
  const [companyRoleVisible, setCompanyRoleVisible] = useState(false)
  const [purposeVisible, setPurposeVisible] = useState(false)
  
  // Research completion states
  const [researchStep1Complete, setResearchStep1Complete] = useState(false)
  const [researchStep2Complete, setResearchStep2Complete] = useState(false)
  const [researchStep3Complete, setResearchStep3Complete] = useState(false)
  const [researchStep4Complete, setResearchStep4Complete] = useState(false)
  
  // Email completion state
  const [emailComplete, setEmailComplete] = useState(false)

  // Persona data for carousel
  const personas = [
    {
      name: 'David Thompson',
      role: 'Senior Product Manager',
      company: 'Microsoft',
      purpose: 'Networking',
      email: `Hi David,

I came across your work at Microsoft and was impressed by your recent post about building scalable product teams.

As a Stanford grad working on a startup in the productivity space, I'd love to get your perspective on some challenges we're facing.

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

As a senior engineer with 8+ years at Google and Meta, I'm exploring opportunities where I can have significant impact on technical architecture.

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

I'm the founder of DataSync, focused on helping small businesses integrate and automate their data workflows. I noticed we both graduated from MIT and share a passion for empowering small businesses.

I believe there could be a great partnership opportunity between our companies. Would you be interested in a 20-minute call to explore synergies?

Best,
Jennifer Park
Founder & CEO, DataSync`,
      fromEmail: 'jennifer.park@datasync.com',
      toEmail: 'michael.rodriguez@techflow.com',
      subject: 'Partnership opportunity - DataSync & TechFlow'
    }
  ]

  // Reset demo states on mount
  useEffect(() => {
    setDemoStep1Visible(false)
    setDemoStep2Visible(false)
    setDemoStep3Visible(false)
    setResearchItemsVisible(0)
    setEmailContentVisible(0)
    setRecipientNameVisible(false)
    setCompanyRoleVisible(false)
    setPurposeVisible(false)
  }, [])

  // Load user subscription status
  useEffect(() => {
    const loadUserSubscription = async () => {
      if (user) {
        try {
          const { data: subscriptionData, error } = await supabase.rpc('get_user_subscription', {
            user_uuid: user.id
          })

          if (error) {
            console.error('Error fetching subscription:', error)
            setUserSubscription({ plan_name: 'free' })
          } else if (subscriptionData && subscriptionData.length > 0) {
            setUserSubscription(subscriptionData[0])
          } else {
            setUserSubscription({ plan_name: 'free' })
          }
        } catch (error) {
          console.error('Error in loadUserSubscription:', error)
          setUserSubscription({ plan_name: 'free' })
        }
      }
    }

    loadUserSubscription()
  }, [user])

  // Scroll event listener for dynamic animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Demo section scroll animations
      const demoSection = document.getElementById('demo-section')
      if (demoSection) {
        const rect = demoSection.getBoundingClientRect()
        const windowHeight = window.innerHeight
        
        // Calculate when each step crosses the bottom fifth of the screen
        const bottomFifth = windowHeight * 0.8 // 80% down the screen
        
        console.log('Scroll Debug:', {
          rectTop: rect.top,
          windowHeight,
          bottomFifth,
          step1Visible: rect.top < bottomFifth,
          step2Visible: rect.top < bottomFifth - 400,
          step3Visible: rect.top < bottomFifth - 800
        })
        
        // Step 1: Show when section crosses bottom fifth
        if (rect.top < bottomFifth - 300) {
          setDemoStep1Visible(true)
          
          // Progressive filling of basic info fields
          if (rect.top < bottomFifth - 400) {
            setRecipientNameVisible(true)
          } else {
            setRecipientNameVisible(false)
          }
          if (rect.top < bottomFifth - 500) {
            setCompanyRoleVisible(true)
          } else {
            setCompanyRoleVisible(false)
          }
          if (rect.top < bottomFifth - 600) {
            setPurposeVisible(true)
          } else {
            setPurposeVisible(false)
          }
        } else {
          setDemoStep1Visible(false)
          setRecipientNameVisible(false)
          setCompanyRoleVisible(false)
          setPurposeVisible(false)
        }
        
        // Step 2: Show research items progressively
        if (rect.top < bottomFifth - 600) {
          setDemoStep2Visible(true)
          const step2Progress = Math.max(0, Math.min(1, (bottomFifth - 600 - rect.top) / 200))
          const researchItemsCount = Math.floor(step2Progress * 4)
          setResearchItemsVisible(researchItemsCount)
          
          // Set research completion states based on progress
          setResearchStep1Complete(researchItemsCount >= 1)
          setResearchStep2Complete(researchItemsCount >= 2)
          setResearchStep3Complete(researchItemsCount >= 3)
          setResearchStep4Complete(researchItemsCount >= 4)
        } else {
          setDemoStep2Visible(false)
          setResearchItemsVisible(0)
          setResearchStep1Complete(false)
          setResearchStep2Complete(false)
          setResearchStep3Complete(false)
          setResearchStep4Complete(false)
        }
        
        // Step 3: Show email content progressively
        if (rect.top < bottomFifth - 1000) {
          setDemoStep3Visible(true)
          const step3Progress = Math.max(0, Math.min(1, (bottomFifth - 1000 - rect.top) / 800))
          const emailProgress = Math.floor(step3Progress * 100)
          setEmailContentVisible(emailProgress)
          setEmailComplete(emailProgress >= 100)
        } else {
          setDemoStep3Visible(false)
          setEmailContentVisible(0)
          setEmailComplete(false)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    // Trigger on mount to set initial state
    handleScroll()
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
        
        // Auto-scroll to keep cursor visible
        setTimeout(() => {
          const emailContainer = document.getElementById('email-container')
          if (emailContainer) {
            emailContainer.scrollTop = emailContainer.scrollHeight
          }
        }, 10)
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 12) // Fast typing

    return () => clearInterval(typeInterval)
  }, [currentPersona]) // Now depends on currentPersona

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 max-w-7xl relative overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
          {/* Left side - Content */}
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-[#6366F1] text-sm font-medium rounded-full border border-indigo-100">
                <Sparkles className="h-3 w-3" />
                AI-powered deep research
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Cold outreach that feels
                <span className="text-[#6366F1]"> warm</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Transform generic emails into personalized conversations. Our AI conducts deep research, 
                finds genuine connections, and crafts human-sounding outreach that gets responses.
              </p>
              
              {/* Key features highlight */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-[#6366F1] rounded-full"></div>
                  <span className="text-gray-700"><strong>Progressive AI Research</strong> - 12-phase deep search with 3x more data</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-[#6366F1] rounded-full"></div>
                  <span className="text-gray-700"><strong>Smart Connections</strong> - Finds alumni, industry, and location matches</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-[#6366F1] rounded-full"></div>
                  <span className="text-gray-700"><strong>Human-like Writing</strong> - Natural tone that doesn't sound robotic</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {userSubscription?.plan_name === 'pro' ? (
                // Pro user CTAs
                <>
                  <Link 
                    href="/generate"
                    className="inline-flex items-center justify-center bg-[#111827] hover:bg-gray-800 text-white rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                  >
                    Start generating emails
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:animate-pulse transition-all duration-200" />
                  </Link>
                  <Link 
                    href="/profile"
                    className="inline-flex items-center justify-center bg-white border-2 border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                  >
                    <User className="mr-2 h-5 w-5" />
                    Manage Profile
                  </Link>
                </>
              ) : (
                // Free user CTAs
                <>
                  <Link 
                    href={user ? "/generate" : "/login"}
                    className="inline-flex items-center justify-center bg-[#111827] hover:bg-gray-800 text-white rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                  >
                    Start free - 2 emails/day
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:animate-pulse transition-all duration-200" />
                  </Link>
                  <Link 
                    href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00"
                    className="inline-flex items-center justify-center bg-white border-2 border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Upgrade to Pro
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              {userSubscription?.plan_name === 'pro' ? (
                // Pro user features
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited emails & deep research</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>All tone options & email editing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-[#6366F1]" />
                    <span>Pro member</span>
                  </div>
                </>
              ) : (
                // Free user features
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>30s basic / 90s deep search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>60% higher response rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div className="pt-4 border-t border-gray-100">
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
          <div className="relative mt-8">
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
              } hover:shadow-xl hover:translate-y-[-4px] hover:scale-[1.02] hover:border-[#6366F1]/20 hover:shadow-[#6366F1]/10 transition-all duration-300 ease-out`}
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
              <div className="p-6 h-96 overflow-y-auto" id="email-container">
                <div 
                  className="font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: (demoEmail + (isTyping ? '<span class="inline-block w-2 h-5 bg-[#6366F1] animate-pulse"></span>' : ''))
                      .replace(
                        /(your recent post about building scalable product teams)/g,
                        '<span class="animate-pulse bg-yellow-100 px-1 rounded">$1</span>'
                      )
                      .replace(
                        /(Stanford grad)/g,
                        '<span class="animate-pulse bg-indigo-100 px-1 rounded">$1</span>'
                      )
                      .replace(
                        /(startup in the productivity space)/g,
                        '<span class="animate-pulse bg-yellow-100 px-1 rounded">$1</span>'
                      )
                      .replace(
                        /(experience at Amazon and now Microsoft)/g,
                        '<span class="animate-pulse bg-yellow-100 px-1 rounded">$1</span>'
                      )
                      .replace(
                        /(recent talk about scaling engineering teams)/g,
                        '<span class="animate-pulse bg-yellow-100 px-1 rounded">$1</span>'
                      )
                      .replace(
                        /(8\+ years of experience at Google and Meta)/g,
                        '<span class="animate-pulse bg-indigo-100 px-1 rounded">$1</span>'
                      )
                      .replace(
                        /(Series A announcement)/g,
                        '<span class="animate-pulse bg-yellow-100 px-1 rounded">$1</span>'
                      )
                      .replace(
                        /(both graduated from MIT)/g,
                        '<span class="animate-pulse bg-indigo-100 px-1 rounded">$1</span>'
                      )
                      .replace(
                        /(passion for empowering small businesses)/g,
                        '<span class="animate-pulse bg-yellow-100 px-1 rounded">$1</span>'
                      )
                  }}
                />
              </div>

              {/* Animated typing indicator - moved to bottom */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-[#111827]">
                      {personas[currentPersona].fromEmail.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} is writing...
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">[</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full typing-dot-1"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full typing-dot-2"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full typing-dot-3"></span>
                    <span className="text-gray-400 text-sm">]</span>
                  </div>
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
                {emailComplete ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <span className="text-xs font-medium text-gray-600">
                  {emailComplete ? 'Email complete' : 'AI researching...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile & Connections Section - Moved up */}
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
                    className="bg-[#111827] hover:bg-gray-800 text-white rounded-full px-8 py-3 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                  >
                    Set up your profile
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:animate-pulse transition-all duration-200" />
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

      {/* Scroll-to-Play Demo Section - Moved right after hero */}
      <section id="demo-section" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#111827] mb-6 tracking-tight">See how AI research transforms outreach</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From basic prospect details to comprehensive professional insights, watch our AI 
              conduct progressive research and create personalized emails that get responses.
            </p>
            
            {/* Tier highlight */}
            <div className="flex justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Free: Basic Search (4 queries)</span>
              </div>
              <div className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
                <Crown className="h-4 w-4 text-[#6366F1]" />
                <span className="text-sm font-medium text-[#6366F1]">Pro: Deep Search (12 queries)</span>
              </div>
            </div>
          </div>
          
          {/* Step 1: Enter Details */}
          <div className={`mb-16 transition-all duration-1000 ${demoStep1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-[#6366F1] text-sm font-medium rounded-full border border-indigo-100">
                  <Search className="h-3 w-3" />
                  Step 1: Enter prospect details
                </div>
                <h3 className="text-3xl font-bold text-[#111827] tracking-tight">
                  Start with basic information
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Provide the recipient's name, role, company, and your outreach purpose. 
                  Our AI will do the heavy lifting to find personalization opportunities.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Name</label>
                    <div className={`p-4 bg-white rounded-lg border border-gray-300 shadow-sm transition-all duration-500 ${
                      recipientNameVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}>
                      <span className="text-gray-900 font-medium">David Thompson</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Company & Role</label>
                    <div className={`p-4 bg-white rounded-lg border border-gray-300 shadow-sm transition-all duration-500 delay-200 ${
                      companyRoleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}>
                      <span className="text-gray-900 font-medium">Senior Product Manager at Microsoft</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Purpose</label>
                    <div className={`p-4 bg-white rounded-lg border border-gray-300 shadow-sm transition-all duration-500 delay-400 ${
                      purposeVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}>
                      <span className="text-gray-900 font-medium">Networking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: AI Research */}
          <div className={`mb-16 transition-all duration-1000 delay-300 ${demoStep2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#6366F1] text-sm font-medium rounded-full border border-purple-100">
                  <Brain className="h-3 w-3" />
                  Step 2: AI research & analysis
                </div>
                <h3 className="text-3xl font-bold text-[#111827] tracking-tight">
                  AI discovers personal connections
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our AI searches LinkedIn, company websites, and news to find genuine 
                  commonalities and recent activities that make your email personal.
                </p>
              </div>
              
              <div className="lg:order-1 bg-gray-50 rounded-2xl p-8 border border-gray-200 relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#6366F1] mb-4">
                    <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-pulse"></div>
                    AI Research in Progress
                  </div>
                  <div className="space-y-2">
                    {[
                      "Found: Stanford alum (Computer Science, 2017)",
                      "Recent post: \"Building Scalable Product Teams\"",
                      "Previous experience at Amazon",
                      "Located: Seattle, Washington"
                    ].map((item, index) => (
                      <div 
                        key={index}
                        className={`flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200 transition-all duration-500 ${
                          index < researchItemsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}
                        style={{ transitionDelay: `${index * 200}ms` }}
                      >
                        <div className="flex-shrink-0 mt-1.5">
                          {index === 0 && researchStep1Complete ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : index === 1 && researchStep2Complete ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : index === 2 && researchStep3Complete ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : index === 3 && researchStep4Complete ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Generated Email */}
          <div className={`mb-16 transition-all duration-1000 delay-600 ${demoStep3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-[#0F766E] text-sm font-medium rounded-full border border-teal-100">
                  <Mail className="h-3 w-3" />
                  Step 3: Get your personalized email
                </div>
                <h3 className="text-3xl font-bold text-[#111827] tracking-tight">
                  Ready-to-send personalized email
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Receive a professional, personalized outreach email that incorporates 
                  the research findings and creates genuine connections.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Email Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">From:</span>
                      <span className="text-sm text-gray-900">emma.rodriguez@startup.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">To:</span>
                      <span className="text-sm text-gray-900">david.thompson@microsoft.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Subject:</span>
                      <span className="text-sm text-gray-900">Coffee chat - Product development insights</span>
                    </div>
                  </div>
                </div>
                
                {/* Email Body */}
                <div className="p-6 h-96 overflow-y-auto">
                  <div 
                    className="font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        const fullText = `Hi David,

I came across your work at Microsoft and was particularly impressed by your recent LinkedIn post about building scalable product teams.

As a fellow Stanford Computer Science grad, I was excited to see another Cardinal making waves in the tech industry. Your journey from Amazon to Microsoft is inspiring.

I'm currently working on a startup in the productivity space, and given your expertise in product management, I'd love to get your perspective on some challenges we're facing.

Would you be open to a 15-minute chat next week?

Best,
Emma Rodriguez
Software Engineer & Co-founder`
                        
                        const visibleText = fullText.slice(0, Math.floor(emailContentVisible * fullText.length / 100))
                        
                        return visibleText
                          .replace(
                            /(your recent LinkedIn post about building scalable product teams)/g,
                            '<span class="animate-pulse bg-yellow-100 px-1 rounded">$1</span>'
                          )
                          .replace(
                            /(fellow Stanford Computer Science grad)/g,
                            '<span class="animate-pulse bg-indigo-100 px-1 rounded">$1</span>'
                          )
                          .replace(
                            /(journey from Amazon to Microsoft)/g,
                            '<span class="animate-pulse bg-yellow-100 px-1 rounded">$1</span>'
                          )
                      })()
                    }}
                  />
                  {emailContentVisible < 100 && (
                    <span className="inline-block w-2 h-5 bg-[#6366F1] animate-pulse ml-1"></span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link 
              href={user ? "/generate" : "/login"}
              className="inline-flex items-center justify-center bg-[#111827] hover:bg-gray-800 text-white rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group"
            >
              Try it yourself
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why professionals choose ColdEmail AI - Full Width Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl text-center">
          <h2 className="text-4xl font-bold text-[#111827] mb-6 tracking-tight">Two tiers. Maximum flexibility.</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Start free with powerful AI research, then upgrade to Pro for advanced features, 
            unlimited access, and comprehensive deep search capabilities.
          </p>
        </div>
        
        {/* Only show pricing comparison for non-Pro users */}
        {userSubscription?.plan_name !== 'pro' && (
          <>
            {/* Free vs Pro Comparison */}
            <div className="container mx-auto px-6 max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-8 mb-16 mt-12">
                {/* Free Plan Features */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 border border-gray-200 hover:shadow-lg transition-all duration-200">
                  <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-4 flex items-center gap-2">
                    Free Plan
                    <span className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">$0/mo</span>
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span><strong>Basic search</strong> - 4 targeted queries for essential insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span><strong>2 generations/day</strong> - Perfect for getting started</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Professional tone & commonality detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Export to email clients & history</span>
                    </div>
                  </div>
                </div>
                
                {/* Pro Plan Features */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-10 border border-indigo-200 hover:shadow-lg transition-all duration-200 relative">
                  <div className="absolute top-4 right-4 bg-[#6366F1] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    RECOMMENDED
                  </div>
                  <div className="w-16 h-16 bg-indigo-100 text-[#6366F1] rounded-2xl flex items-center justify-center mb-6">
                    <Crown className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-4 flex items-center gap-2">
                    Pro Plan
                    <span className="text-sm bg-[#6366F1] text-white px-3 py-1 rounded-full font-medium">$10/mo</span>
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#6366F1] flex-shrink-0" />
                      <span><strong>Deep search</strong> - 12-phase progressive research with 3x more data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#6366F1] flex-shrink-0" />
                      <span><strong>Unlimited generations</strong> - No daily limits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#6366F1] flex-shrink-0" />
                      <span><strong>Multiple tones</strong> - Casual, Formal, Confident options</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#6366F1] flex-shrink-0" />
                      <span><strong>Email editing</strong> - AI-powered refinement & revision</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#6366F1] flex-shrink-0" />
                      <span>Priority support & advanced analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Show Pro features for Pro users */}
        {userSubscription?.plan_name === 'pro' && (
          <div className="container mx-auto px-6 max-w-4xl mt-12">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-10 border border-indigo-200 text-center">
              <div className="w-16 h-16 bg-indigo-100 text-[#6366F1] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Crown className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">You're a Pro Member!</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Enjoy unlimited email generations, deep research, custom tones, email editing, and all premium features.
              </p>
              <Link 
                href="/generate"
                className="inline-flex items-center justify-center bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full px-8 py-3 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Start Generating Emails
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
          
        {/* Advanced Features Grid */}
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-1">
              <div className="w-12 h-12 bg-purple-100 text-[#6366F1] rounded-xl flex items-center justify-center mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Progressive Research</h3>
              <p className="text-gray-600 text-sm leading-relaxed">AI-guided multi-phase search that gets deeper with each iteration</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-1">
              <div className="w-12 h-12 bg-teal-100 text-[#0F766E] rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Smart Gating</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Seamless upgrade prompts when you need more powerful features</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-1">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Usage Tracking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Transparent daily limits with visual progress indicators</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 text-[#6366F1] rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Data Security</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Enterprise-grade security with user data protection</p>
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
                  <div className="text-4xl font-bold text-[#6366F1] mb-2">30-90s</div>
                  <div className="text-sm text-gray-600 font-medium">Generation time</div>
                  <div className="text-xs text-gray-500 mt-1">Basic vs Deep search</div>
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
              Three simple steps to create personalized outreach emails that get responses
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
                Receive a personalized, professional outreach email ready to send. 
                Edit, copy, or export directly to your email client.
              </p>
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
                "Reachful helped me land my dream job at Google. The personalized approach 
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
                "Finally, an outreach tool that doesn't sound robotic. The personalization 
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
          {userSubscription?.plan_name === 'pro' ? (
            // Pro user CTA
            <>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to create amazing emails?</h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
                You have unlimited access to all Pro features. Start generating personalized outreach emails now.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
                <Link 
                  href="/generate"
                  className="inline-flex items-center justify-center bg-white text-[#111827] hover:bg-gray-100 rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group w-full sm:w-auto"
                >
                  Generate Email
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="/past-emails"
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#111827] rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group w-full sm:w-auto"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  View Past Emails
                </Link>
              </div>
              
              <div className="flex items-center justify-center gap-8 mt-8 text-sm opacity-75">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-[#6366F1]" />
                  <span>Pro member</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Unlimited generations</span>
                </div>
              </div>
            </>
          ) : (
            // Free user CTA
            <>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to transform your outreach?</h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Start free with 2 emails per day, then upgrade to Pro for unlimited access and advanced features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
                <Link 
                  href={user ? "/generate" : "/login"}
                  className="inline-flex items-center justify-center bg-white text-[#111827] hover:bg-gray-100 rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group w-full sm:w-auto"
                >
                  Start free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="https://buy.stripe.com/dRm00k5GHeK0dRqfL81ck00"
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#111827] rounded-full px-8 py-4 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group w-full sm:w-auto"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  View Pro plans
                </Link>
              </div>
              
              <div className="flex items-center justify-center gap-8 mt-8 text-sm opacity-75">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Start free, upgrade anytime</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img 
                src="/reachful_logo.png" 
                alt="Reachful" 
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold text-[#111827]">
                Reachful
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
            <p>&copy; 2025 Reachful. Cold outreach that feels warm.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 