import { Metadata } from 'next'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MessageSquare, Clock, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us | Reachful',
  description: 'Contact Reachful - AI-powered cold email generator. Get in touch with our team for support, questions, or feedback.',
  keywords: [
    'Reachful contact',
    'contact us',
    'support',
    'help',
    'customer service',
    'Reachful support'
  ],
  openGraph: {
    title: 'Contact Us | Reachful',
    description: 'Contact Reachful - AI-powered cold email generator.',
    url: 'https://reachful.io/contact',
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contact <span className="text-[#6366F1]">Reachful</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions, feedback, or need support? We're here to help you get the most out of our AI-powered email generator.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Send us a message</CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" className="mt-1" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your question or feedback..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Direct Contact */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Get in touch</CardTitle>
                <p className="text-gray-600">
                  Choose the best way to reach us based on your needs.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-[#6366F1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email Support</h3>
                    <p className="text-gray-600 mb-2">For general questions and support</p>
                    <a href="mailto:support@reachful.io" className="text-[#6366F1] hover:underline">
                      support@reachful.io
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Live Chat</h3>
                    <p className="text-gray-600 mb-2">Get instant help during business hours</p>
                    <span className="text-green-600 font-medium">Available 9 AM - 6 PM EST</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Response Time</h3>
                    <p className="text-gray-600 mb-2">We typically respond within</p>
                    <span className="text-purple-600 font-medium">24 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Frequently Asked Questions</CardTitle>
                <p className="text-gray-600">
                  Quick answers to common questions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">How does the AI research work?</h4>
                    <p className="text-gray-600 text-sm">
                      Our AI automatically searches the web for information about your prospects and finds genuine commonalities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Is my data secure?</h4>
                    <p className="text-gray-600 text-sm">
                      Yes, we take security seriously. All data is encrypted and we never share your personal information.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Can I export my emails?</h4>
                    <p className="text-gray-600 text-sm">
                      Absolutely! You can copy emails to clipboard, download them, or open directly in Gmail.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <a href="/faq" className="text-[#6366F1] hover:underline font-medium">
                    View all FAQs →
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Reachful</h4>
                      <p className="text-gray-600 text-sm">
                        AI-powered cold email generator<br />
                        Making outreach feel warm and authentic
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      © 2024 Reachful. All rights reserved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 