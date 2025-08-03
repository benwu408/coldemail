import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Reachful - AI-Powered Cold Email Generator | Personalized Outreach That Feels Warm',
    template: '%s | Reachful'
  },
  description: 'Generate personalized cold emails with AI that sound human and get responses. Our AI-powered email generator creates authentic outreach emails for networking, sales, and business development.',
  keywords: [
    'AI cold email generator',
    'personalized email outreach',
    'cold email writer AI',
    'business email generator',
    'professional email templates',
    'sales email automation',
    'networking email tool',
    'outreach email generator'
  ],
  authors: [{ name: 'Reachful' }],
  creator: 'Reachful',
  publisher: 'Reachful',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://reachful.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://reachful.io',
    title: 'Reachful - AI-Powered Cold Email Generator',
    description: 'Generate personalized cold emails with AI that sound human and get responses. Perfect for networking, sales, and business development.',
    siteName: 'Reachful',
    images: [
      {
        url: '/reachful_logo.png',
        width: 1200,
        height: 630,
        alt: 'Reachful - AI Cold Email Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reachful - AI-Powered Cold Email Generator',
    description: 'Generate personalized cold emails with AI that sound human and get responses.',
    images: ['/reachful_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google verification code
  },
}

// Force dynamic rendering to prevent static generation and caching
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Add favicon */}
        <link rel="icon" type="image/png" href="/reachful_logo.png" />
        <link rel="shortcut icon" type="image/png" href="/reachful_logo.png" />
        <link rel="apple-touch-icon" href="/reachful_logo.png" />
        
        {/* Add meta tags to prevent caching */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Add version parameter to force cache busting */}
        <meta name="version" content={Date.now().toString()} />
        
        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Reachful",
              "description": "AI-powered cold email generator that creates personalized outreach emails",
              "url": "https://reachful.io",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              },
              "author": {
                "@type": "Organization",
                "name": "Reachful"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
} 