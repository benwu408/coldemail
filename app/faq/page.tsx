'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  ArrowLeft, 
  Search, 
  Brain, 
  Shield, 
  Zap,
  Users,
  HelpCircle,
  MessageSquare,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

interface FAQItem {
  question: string
  answer: string
  category: string
  icon: React.ReactNode
}

const faqData: FAQItem[] = [
  {
    question: "How does the AI research work?",
    answer: "Our AI automatically searches the web for information about your prospect, including their LinkedIn profile, recent posts, company information, and professional background. It then identifies commonalities between you and the prospect to create personalized connections in your email.",
    category: "AI & Research",
    icon: <Search className="h-5 w-5" />
  },
  {
    question: "What information does the AI look for?",
    answer: "The AI searches for: education background, work experience, recent achievements, company information, location, industry, recent social media posts, and any public information that could create meaningful connections.",
    category: "AI & Research",
    icon: <Search className="h-5 w-5" />
  },
  {
    question: "How personalized are the generated emails?",
    answer: "Very personalized! The AI incorporates specific details about your prospect, finds genuine commonalities (same school, industry, location, etc.), and references their recent work or posts. This makes each email unique and shows you've done your homework.",
    category: "AI & Research",
    icon: <Brain className="h-5 w-5" />
  },
  {
    question: "Can I edit the generated emails?",
    answer: "Absolutely! You can edit any generated email using the inline editor. You can also regenerate emails, adjust the tone (casual, formal, confident), or shorten them while maintaining the key points.",
    category: "Features",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    question: "What tone options are available?",
    answer: "We offer three tone options: Casual (friendly and approachable), Formal (professional and respectful), and Confident (assertive and self-assured). You can adjust the tone after generation to match your style.",
    category: "Features",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    question: "How long does it take to generate an email?",
    answer: "Typically 1-2 minutes. The process includes AI research, finding commonalities, and generating a personalized email. The time may vary slightly depending on the amount of research needed.",
    category: "Features",
    icon: <Zap className="h-5 w-5" />
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes! We take privacy seriously. Your personal information and generated emails are encrypted and never shared. We don't store the content of your emails, and all research is done securely through our API partners.",
    category: "Privacy & Security",
    icon: <Shield className="h-5 w-5" />
  },
  {
    question: "What information do I need to provide?",
    answer: "At minimum, you need the recipient's name and your outreach purpose. Additional helpful information includes their company/role, any context you already have, and your own background details (which you can set up in your profile).",
    category: "Getting Started",
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    question: "How do I set up my profile for better personalization?",
    answer: "Go to your Profile page and fill in your background information including education, work experience, skills, interests, and location. This helps the AI find better commonalities between you and your prospects.",
    category: "Getting Started",
    icon: <Users className="h-5 w-5" />
  },
  {
    question: "Can I export my emails?",
    answer: "Yes! You can copy emails to your clipboard, download them as text files, or open them directly in Gmail with all the content pre-filled. This makes it easy to send your personalized emails.",
    category: "Features",
    icon: <Mail className="h-5 w-5" />
  },
  {
    question: "What if the AI can't find information about my prospect?",
    answer: "If limited information is available, the AI will still generate a professional email based on the information you provide. You can always add your own research findings in the 'Additional Notes' section.",
    category: "AI & Research",
    icon: <Search className="h-5 w-5" />
  },
  {
    question: "Is there a limit on how many emails I can generate?",
    answer: "Currently, we offer generous limits for email generation. Check our pricing page for specific details on your plan's limits and features.",
    category: "Pricing",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    question: "Can I use this for different types of outreach?",
    answer: "Yes! Our tool works for various outreach purposes including job inquiries, networking, coffee chats, partnership proposals, mentorship requests, speaking opportunities, and more.",
    category: "Features",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    question: "How accurate is the AI research?",
    answer: "The AI research is quite accurate, pulling from reliable sources like LinkedIn, company websites, and public profiles. However, we always recommend reviewing the generated content and adding any personal insights you may have.",
    category: "AI & Research",
    icon: <Brain className="h-5 w-5" />
  },
  {
    question: "What makes your emails different from generic templates?",
    answer: "Unlike generic templates, our emails are truly personalized with real research findings, genuine commonalities, and specific references to the recipient's work. They sound human-written because they're based on actual information about the person.",
    category: "Features",
    icon: <MessageSquare className="h-5 w-5" />
  }
]

const categories = [
  { name: "All", value: "all" },
  { name: "AI & Research", value: "AI & Research" },
  { name: "Features", value: "Features" },
  { name: "Getting Started", value: "Getting Started" },
  { name: "Privacy & Security", value: "Privacy & Security" },
  { name: "Pricing", value: "Pricing" }
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const filteredFAQs = selectedCategory === "all" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory)

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111]">
      {/* Header */}
      <Header showBackButton={true} showNavigation={false} />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#111] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to know about ColdEmail AI and how to create personalized cold emails that get responses.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={`${
                selectedCategory === category.value 
                  ? 'bg-[#3B82F6] text-white' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <Card key={index} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader 
                className="pb-2 cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {faq.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold text-left">
                      {faq.question}
                    </CardTitle>
                  </div>
                  <div className="p-1">
                    {expandedItems.has(index) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedItems.has(index) && (
                <CardContent className="pt-0">
                  <div className="pl-11">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <Card className="border-gray-100 shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-[#3B82F6]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-6">
                Can't find the answer you're looking for? We're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.location.href = 'mailto:support@coldemailai.com'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                >
                  Try ColdEmail AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 