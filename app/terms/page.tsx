import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { Shield, FileText, Users, AlertTriangle, Scale, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Reachful',
  description: 'Terms of Service for Reachful - AI-powered cold email generator. Read our terms and conditions for using our platform.',
  keywords: [
    'Reachful terms',
    'terms of service',
    'terms and conditions',
    'Reachful legal',
    'user agreement'
  ],
  openGraph: {
    title: 'Terms of Service | Reachful',
    description: 'Terms of Service for Reachful - AI-powered cold email generator.',
    url: 'https://reachful.io/terms',
  },
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        
        <div className="container mx-auto px-6 py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6366F1] rounded-2xl mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Terms of <span className="text-[#6366F1]">Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our AI-powered cold email generator.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4 mr-2" />
            Last updated: July 15, 2025
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  <a href="#acceptance" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">1. Acceptance of Terms</a>
                  <a href="#description" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">2. Description of Service</a>
                  <a href="#accounts" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">3. User Accounts</a>
                  <a href="#acceptable-use" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">4. Acceptable Use</a>
                  <a href="#privacy" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">5. Privacy and Data</a>
                  <a href="#intellectual-property" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">6. Intellectual Property</a>
                  <a href="#liability" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">7. Limitation of Liability</a>
                  <a href="#termination" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">8. Termination</a>
                  <a href="#changes" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">9. Changes to Terms</a>
                  <a href="#contact" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">10. Contact Information</a>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 lg:p-12">

                <section id="acceptance" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                      <p className="text-gray-700 leading-relaxed">
                        By accessing and using Reachful ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                        If you do not agree to abide by the above, please do not use this service.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="description" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Reachful is an AI-powered cold email generator that helps users create personalized outreach emails. 
                        The Service includes email generation, prospect research, and related features designed to improve your outreach success.
                      </p>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600">
                          <strong>Key Features:</strong> AI-powered email generation, prospect research, personalization tools, 
                          email templates, and analytics dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="accounts" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You are responsible for maintaining the confidentiality of your account and password. 
                        You agree to accept responsibility for all activities that occur under your account.
                      </p>
                      <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>You must provide accurate and complete information when creating your account</li>
                        <li>You are responsible for all activities that occur under your account</li>
                        <li>You must notify us immediately of any unauthorized use of your account</li>
                        <li>We reserve the right to refuse service or terminate accounts at our discretion</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="acceptable-use" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. 
                        You may not use the Service in any manner that could damage, disable, overburden, or impair any server.
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <h3 className="font-semibold text-red-800 mb-2">Prohibited Activities:</h3>
                        <ul className="list-disc pl-6 text-red-700 space-y-1 text-sm">
                          <li>Generate spam or unsolicited commercial emails</li>
                          <li>Violate any applicable laws or regulations</li>
                          <li>Infringe on the rights of others</li>
                          <li>Transmit harmful, offensive, or inappropriate content</li>
                          <li>Attempt to gain unauthorized access to the Service</li>
                          <li>Use the Service for any illegal or unauthorized purpose</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="privacy" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Privacy and Data</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                        to understand our practices regarding the collection and use of your information.
                      </p>
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <p className="text-sm text-indigo-700">
                          <strong>Data Protection:</strong> We implement industry-standard security measures to protect your data 
                          and comply with applicable privacy laws including GDPR and CCPA.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="intellectual-property" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Scale className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        The Service and its original content, features, and functionality are owned by Reachful and are protected by 
                        international copyright, trademark, patent, trade secret, and other intellectual property laws.
                      </p>
                      <div className="bg-yellow-50 rounded-xl p-4">
                        <p className="text-sm text-yellow-700">
                          <strong>Your Content:</strong> You retain ownership of any content you create using our Service, 
                          but grant us a license to use it for providing and improving our services.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="liability" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        In no event shall Reachful, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                        be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
                        loss of profits, data, use, goodwill, or other intangible losses.
                      </p>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600">
                          <strong>Disclaimer:</strong> The Service is provided "as is" without warranties of any kind, 
                          either express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="termination" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
                        under our sole discretion, for any reason whatsoever and without limitation.
                      </p>
                      <div className="bg-orange-50 rounded-xl p-4">
                        <p className="text-sm text-orange-700">
                          <strong>Account Termination:</strong> Upon termination, your right to use the Service will cease immediately. 
                          You may terminate your account at any time by contacting our support team.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="changes" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                        If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                      </p>
                      <div className="bg-teal-50 rounded-xl p-4">
                        <p className="text-sm text-teal-700">
                          <strong>Notification:</strong> We will notify users of any material changes via email or through the Service. 
                          Continued use of the Service after changes constitutes acceptance of the new terms.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="contact" className="mb-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        If you have any questions about these Terms of Service, please contact us:
                      </p>
                      <div className="bg-blue-50 rounded-xl p-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">Email: support@reachful.io</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">Website: https://reachful.io</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </div>
    </AuthProvider>
  )
} 