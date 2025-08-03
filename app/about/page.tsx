import { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'About Reachful - AI-Powered Cold Email Generator',
  description: 'Learn about Reachful, the AI-powered cold email generator that creates personalized outreach emails. Discover our mission to make cold outreach feel warm and authentic.',
  keywords: [
    'About Reachful',
    'Reachful company',
    'Reachful mission',
    'Reachful team',
    'Reachful story',
    'cold email generator company'
  ],
  openGraph: {
    title: 'About Reachful - AI-Powered Cold Email Generator',
    description: 'Learn about Reachful, the AI-powered cold email generator that creates personalized outreach emails.',
    url: 'https://reachful.io/about',
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-[#6366F1]">Reachful</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to make cold outreach feel warm and authentic. 
            Our AI-powered platform helps professionals create personalized emails that actually get responses.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At Reachful, we believe that meaningful connections start with authentic communication. 
            Traditional cold emails often feel robotic and impersonal, leading to low response rates and missed opportunities.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            That's why we built an AI-powered platform that researches your prospects, finds genuine commonalities, 
            and crafts personalized outreach emails that sound human and get responses. Our slogan "Cold outreach that feels warm" 
            isn't just a tagline—it's our promise to help you build authentic connections.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-2xl font-bold mb-4">What We Do</h3>
            <ul className="space-y-3 text-gray-700">
              <li>• AI-powered prospect research</li>
              <li>• Personalized email generation</li>
              <li>• Commonality identification</li>
              <li>• Professional email templates</li>
              <li>• Response rate optimization</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-2xl font-bold mb-4">Who We Help</h3>
            <ul className="space-y-3 text-gray-700">
              <li>• Sales professionals</li>
              <li>• Business developers</li>
              <li>• Job seekers</li>
              <li>• Networkers</li>
              <li>• Entrepreneurs</li>
            </ul>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-3 text-[#6366F1]">Authenticity</h4>
              <p className="text-gray-700">
                We believe in genuine connections. Every email we generate is designed to feel human and authentic.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-3 text-[#6366F1]">Personalization</h4>
              <p className="text-gray-700">
                No more generic templates. Our AI finds real connections and creates truly personalized outreach.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-3 text-[#6366F1]">Results</h4>
              <p className="text-gray-700">
                We're obsessed with helping you get better response rates and build meaningful relationships.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Technology</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Reachful combines cutting-edge AI technology with deep understanding of human communication. 
            Our platform uses advanced natural language processing to research prospects and generate emails 
            that sound like they were written by a human who actually did their homework.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xl font-semibold mb-3">AI Research Engine</h4>
              <p className="text-gray-700">
                Automatically searches the web for prospect information, recent activities, and potential connections.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-3">Smart Personalization</h4>
              <p className="text-gray-700">
                Identifies genuine commonalities and incorporates them naturally into email content.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Outreach?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of professionals who are already getting better results with Reachful.
          </p>
          <a 
            href="/generate" 
            className="inline-flex items-center justify-center bg-white text-[#6366F1] rounded-full px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Generating Emails
          </a>
        </div>
      </div>
    </div>
  )
} 