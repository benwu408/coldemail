import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { Shield, Eye, Database, Lock, Users, Globe, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Reachful',
  description: 'Privacy Policy for Reachful - AI-powered cold email generator. Learn how we collect, use, and protect your personal information.',
  keywords: [
    'Reachful privacy',
    'privacy policy',
    'data protection',
    'Reachful GDPR',
    'personal information'
  ],
  openGraph: {
    title: 'Privacy Policy | Reachful',
    description: 'Privacy Policy for Reachful - AI-powered cold email generator.',
    url: 'https://reachful.io/privacy',
  },
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        
        <div className="container mx-auto px-6 py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6366F1] rounded-2xl mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Privacy <span className="text-[#6366F1]">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
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
                  <a href="#information-collection" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">1. Information We Collect</a>
                  <a href="#how-we-use" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">2. How We Use Your Information</a>
                  <a href="#information-sharing" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">3. Information Sharing</a>
                  <a href="#data-security" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">4. Data Security</a>
                  <a href="#data-retention" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">5. Data Retention</a>
                  <a href="#your-rights" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">6. Your Rights</a>
                  <a href="#cookies" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">7. Cookies and Tracking</a>
                  <a href="#third-party" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">8. Third-Party Services</a>
                  <a href="#children-privacy" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">9. Children's Privacy</a>
                  <a href="#international-transfers" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">10. International Transfers</a>
                  <a href="#policy-changes" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">11. Changes to This Policy</a>
                  <a href="#contact-us" className="block text-sm text-gray-600 hover:text-[#6366F1] transition-colors">12. Contact Us</a>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 lg:p-12">

                <section id="information-collection" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        We collect information you provide directly to us, such as when you create an account, use our services, or contact us. 
                        We also collect certain information automatically when you use our Service.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Personal Information
                          </h3>
                          <ul className="space-y-2 text-blue-800 text-sm">
                            <li>• Email address and account information</li>
                            <li>• Profile information (name, company, role)</li>
                            <li>• Usage data and preferences</li>
                            <li>• Communication history with support</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Usage Information
                          </h3>
                          <ul className="space-y-2 text-green-800 text-sm">
                            <li>• Email generation history</li>
                            <li>• Feature usage and interactions</li>
                            <li>• Technical information (IP, browser)</li>
                            <li>• Device and location data</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="how-we-use" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        We use the information we collect to provide, maintain, and improve our services, 
                        and to communicate with you about our products and services.
                      </p>
                      
                      <div className="bg-purple-50 rounded-xl p-6">
                        <h3 className="font-semibold text-purple-900 mb-4">Primary Uses:</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <ul className="space-y-2 text-purple-800 text-sm">
                            <li>• Provide and maintain our services</li>
                            <li>• Generate personalized email content</li>
                            <li>• Process transactions and payments</li>
                            <li>• Send technical notices and updates</li>
                          </ul>
                          <ul className="space-y-2 text-purple-800 text-sm">
                            <li>• Respond to your comments and questions</li>
                            <li>• Monitor and analyze usage trends</li>
                            <li>• Protect against fraudulent activity</li>
                            <li>• Improve user experience</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="information-sharing" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                        except as described in this section.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <h3 className="font-semibold text-red-900 mb-2">Service Providers</h3>
                          <p className="text-red-800 text-sm">
                            We may share information with trusted third-party service providers who assist us in operating our platform, 
                            conducting our business, or serving our users.
                          </p>
                        </div>
                        
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                          <h3 className="font-semibold text-orange-900 mb-2">Legal Requirements</h3>
                          <p className="text-orange-800 text-sm">
                            We may disclose information if required by law or to protect our rights, property, or safety, 
                            or that of our users or others.
                          </p>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <h3 className="font-semibold text-yellow-900 mb-2">Business Transfers</h3>
                          <p className="text-yellow-800 text-sm">
                            In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                            as part of that transaction.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="data-security" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        We implement appropriate security measures to protect your personal information against unauthorized access, 
                        alteration, disclosure, or destruction.
                      </p>
                      
                      <div className="bg-indigo-50 rounded-xl p-6">
                        <h3 className="font-semibold text-indigo-900 mb-4">Security Measures:</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <ul className="space-y-2 text-indigo-800 text-sm">
                            <li>• SSL/TLS encryption for data transmission</li>
                            <li>• Encrypted data storage</li>
                            <li>• Regular security audits</li>
                            <li>• Access controls and authentication</li>
                          </ul>
                          <ul className="space-y-2 text-indigo-800 text-sm">
                            <li>• Secure data centers</li>
                            <li>• Employee security training</li>
                            <li>• Incident response procedures</li>
                            <li>• Regular software updates</li>
                          </ul>
                        </div>
                        <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
                          <p className="text-indigo-700 text-sm">
                            <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet 
                            is 100% secure, and we cannot guarantee absolute security.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="data-retention" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Database className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
                        outlined in this policy.
                      </p>
                      
                      <div className="bg-teal-50 rounded-xl p-6">
                        <h3 className="font-semibold text-teal-900 mb-4">Retention Periods:</h3>
                        <div className="space-y-3 text-teal-800 text-sm">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span>Account data</span>
                            <span className="font-medium">Until account deletion</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span>Usage analytics</span>
                            <span className="font-medium">2 years</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span>Support communications</span>
                            <span className="font-medium">3 years</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span>Legal compliance data</span>
                            <span className="font-medium">7 years</span>
                          </div>
                        </div>
                        <p className="mt-4 text-teal-700 text-sm">
                          You may request deletion of your account and associated data at any time by contacting our support team.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="your-rights" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        You have certain rights regarding your personal information. We will honor these rights in accordance with applicable law.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-green-50 rounded-xl p-4">
                            <h3 className="font-semibold text-green-900 mb-2">Access & Portability</h3>
                            <ul className="space-y-1 text-green-800 text-sm">
                              <li>• Access your personal information</li>
                              <li>• Request a copy of your data</li>
                              <li>• Export your data in a portable format</li>
                            </ul>
                          </div>
                          
                          <div className="bg-blue-50 rounded-xl p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">Control & Deletion</h3>
                            <ul className="space-y-1 text-blue-800 text-sm">
                              <li>• Update your information</li>
                              <li>• Request account deletion</li>
                              <li>• Object to certain processing</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-purple-50 rounded-xl p-4">
                            <h3 className="font-semibold text-purple-900 mb-2">Communication Preferences</h3>
                            <ul className="space-y-1 text-purple-800 text-sm">
                              <li>• Opt out of marketing emails</li>
                              <li>• Manage notification settings</li>
                              <li>• Control cookie preferences</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 rounded-xl p-4">
                            <h3 className="font-semibold text-orange-900 mb-2">Legal Rights</h3>
                            <ul className="space-y-1 text-orange-800 text-sm">
                              <li>• Right to rectification</li>
                              <li>• Right to restriction</li>
                              <li>• Right to data portability</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="cookies" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Eye className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        We use cookies and similar tracking technologies to enhance your experience, analyze usage, 
                        and provide personalized content.
                      </p>
                      
                      <div className="bg-yellow-50 rounded-xl p-6">
                        <h3 className="font-semibold text-yellow-900 mb-4">Types of Cookies:</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span className="font-medium">Essential Cookies</span>
                            <span className="text-sm text-gray-600">Required for basic functionality</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span className="font-medium">Analytics Cookies</span>
                            <span className="text-sm text-gray-600">Help us understand usage patterns</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span className="font-medium">Preference Cookies</span>
                            <span className="text-sm text-gray-600">Remember your settings</span>
                          </div>
                        </div>
                        <p className="mt-4 text-yellow-700 text-sm">
                          You can control cookie settings through your browser preferences or our cookie consent banner.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="third-party" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        Our service may contain links to third-party websites or integrate with third-party services. 
                        We are not responsible for the privacy practices of these external sites and services.
                      </p>
                      
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Third-Party Integrations:</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Analytics & Monitoring</h4>
                            <ul className="space-y-1 text-gray-600">
                              <li>• Google Analytics</li>
                              <li>• Error tracking services</li>
                              <li>• Performance monitoring</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Communication & Support</h4>
                            <ul className="space-y-1 text-gray-600">
                              <li>• Email service providers</li>
                              <li>• Customer support tools</li>
                              <li>• Notification services</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="children-privacy" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                      </p>
                      
                      <div className="bg-pink-50 rounded-xl p-6">
                        <h3 className="font-semibold text-pink-900 mb-3">Age Restrictions</h3>
                        <p className="text-pink-800 text-sm mb-4">
                          If you are under 13, please do not use our Service or provide any personal information to us. 
                          If we learn that we have collected personal information from a child under 13, we will delete that information immediately.
                        </p>
                        <p className="text-pink-700 text-sm">
                          If you believe we might have any information from or about a child under 13, please contact us immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="international-transfers" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Transfers</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        Your information may be transferred to and processed in countries other than your own. 
                        We ensure appropriate safeguards are in place to protect your information.
                      </p>
                      
                      <div className="bg-cyan-50 rounded-xl p-6">
                        <h3 className="font-semibold text-cyan-900 mb-4">Data Transfer Safeguards:</h3>
                        <ul className="space-y-2 text-cyan-800 text-sm">
                          <li>• Standard Contractual Clauses (SCCs) for EU transfers</li>
                          <li>• Adequacy decisions where applicable</li>
                          <li>• Binding Corporate Rules for internal transfers</li>
                          <li>• Data Processing Agreements with all processors</li>
                        </ul>
                        <p className="mt-4 text-cyan-700 text-sm">
                          We comply with applicable data protection laws including GDPR, CCPA, and other regional privacy regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="policy-changes" className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy 
                        on this page and updating the "Last updated" date.
                      </p>
                      
                      <div className="bg-violet-50 rounded-xl p-6">
                        <h3 className="font-semibold text-violet-900 mb-4">Notification Process:</h3>
                        <div className="space-y-3 text-violet-800 text-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p>We will post the updated policy on this page with a new "Last updated" date</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p>For material changes, we will provide at least 30 days notice via email</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p>Continued use of our Service after changes constitutes acceptance of the new policy</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="contact-us" className="mb-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                      </p>
                      
                      <div className="bg-blue-50 rounded-xl p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">Email</p>
                              <p className="text-blue-700 text-sm">privacy@reachful.io</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">Website</p>
                              <p className="text-blue-700 text-sm">https://reachful.io</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">Data Protection Officer</p>
                              <p className="text-blue-700 text-sm">dpo@reachful.io</p>
                            </div>
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