import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Reachful - Cold outreach that feels warm | AI-Powered Email Generator',
    template: '%s | Reachful'
  },
  description: 'Cold outreach that feels warm. Generate personalized cold emails with AI that sound human and get responses. Our AI-powered email generator creates authentic outreach emails for networking, sales, and business development.',
  keywords: [
    'cold outreach that feels warm',
    'AI cold email generator',
    'personalized email outreach',
    'cold email writer AI',
    'business email generator',
    'professional email templates',
    'sales email automation',
    'networking email tool',
    'outreach email generator',
    'Reachful',
    'warm cold emails'
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
    title: 'Reachful - Cold outreach that feels warm',
    description: 'Cold outreach that feels warm. Generate personalized cold emails with AI that sound human and get responses. Perfect for networking, sales, and business development.',
    siteName: 'Reachful',
    images: [
      {
        url: '/reachful_logo.png',
        width: 1200,
        height: 630,
        alt: 'Reachful - Cold outreach that feels warm',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reachful - Cold outreach that feels warm',
    description: 'Cold outreach that feels warm. Generate personalized cold emails with AI that sound human and get responses.',
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

        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-T6TL688KEN"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-T6TL688KEN');
            `
          }}
        />
        
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
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://reachful.io/#organization",
                  "name": "Reachful",
                  "url": "https://reachful.io",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://reachful.io/reachful_logo.png",
                    "width": 512,
                    "height": 512
                  },
                  "slogan": "Cold outreach that feels warm",
                  "description": "AI-powered cold email generator that creates personalized outreach emails",
                  "foundingDate": "2024",
                  "sameAs": [
                    "https://twitter.com/reachful",
                    "https://linkedin.com/company/reachful"
                  ]
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://reachful.io/#software",
                  "name": "Reachful - AI Cold Email Generator",
                  "description": "Generate personalized cold emails with AI that sound human and get responses. Our AI-powered email generator creates authentic outreach emails for networking, sales, and business development.",
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
                    "@id": "https://reachful.io/#organization"
                  },
                  "publisher": {
                    "@id": "https://reachful.io/#organization"
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://reachful.io/#website",
                  "url": "https://reachful.io",
                  "name": "Reachful",
                  "description": "AI-powered cold email generator that creates personalized outreach emails",
                  "publisher": {
                    "@id": "https://reachful.io/#organization"
                  },
                  "potentialAction": [
                    {
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://reachful.io/search?q={search_term_string}"
                      },
                      "query-input": "required name=search_term_string"
                    }
                  ]
                }
              ]
            })
          }}
        />
        
        {/* Additional Logo Schema for Google Knowledge Panel */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Brand",
              "name": "Reachful",
              "slogan": "Cold outreach that feels warm",
              "description": "AI-powered cold email generator that creates personalized outreach emails",
              "url": "https://reachful.io",
              "logo": "https://reachful.io/reachful_logo.png",
              "image": "https://reachful.io/reachful_logo.png",
              "brand": {
                "@type": "Brand",
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