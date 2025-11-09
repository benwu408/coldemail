# Reachful - AI-Powered Cold Email Generator

A Next.js app that generates personalized cold emails using AI. It researches recipients, finds commonalities, and creates emails that actually get responses.

## Features

- AI-powered recipient research using ChatGPT web search
- Personalized email generation based on research and commonalities
- Two search modes: Basic (30s) for free users, Deep (90s) for pro users
- User profile management for personalization
- Email history tracking
- Stripe subscription management
- Mobile-responsive design

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── generate-email/      # Main email generation
│   │   ├── generate-research/   # Research generation
│   │   ├── generate-commonalities/ # Commonality analysis
│   │   ├── profile/             # User profile management
│   │   ├── past-emails/         # Email history
│   │   └── stripe-webhook/      # Stripe integration
│   ├── about/                   # About page
│   ├── pricing/                 # Pricing page
│   ├── how-it-works/            # How it works
│   ├── faq/                     # FAQ page
│   ├── privacy/                 # Privacy policy
│   ├── terms/                   # Terms of service
│   ├── login/                   # Login page
│   ├── profile/                 # User profile
│   ├── generate/                # Email generation
│   └── past-emails/             # Email history
├── components/                   # React Components
│   ├── ui/                      # Reusable UI components
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Site footer
│   ├── HeroPage.tsx             # Landing page
│   ├── ColdEmailGenerator.tsx   # Main email generator
│   └── SubscriptionDashboard.tsx # Subscription management
├── contexts/                     # React Contexts
│   └── AuthContext.tsx          # Authentication context
├── hooks/                        # Custom React Hooks
│   └── use-toast.ts             # Toast notifications
├── lib/                          # Utility Libraries
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # General utilities
├── types/                        # TypeScript Type Definitions
│   └── index.ts                 # All type definitions
├── constants/                    # Application Constants
│   └── index.ts                 # All constants
├── utils/                        # Utility Functions
│   ├── email.ts                 # Email utilities
│   ├── validation.ts            # Validation functions
│   ├── formatting.ts            # Text formatting
│   └── date.ts                  # Date utilities
└── public/                       # Static Assets
    ├── reachful_logo.png        # Logo
    ├── sitemap.xml              # SEO sitemap
    └── robots.txt               # SEO robots
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o & GPT-4o-mini
- **UI Components**: Custom components with Lucide React icons
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cold-email-writer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Set up the required tables: `profiles`, `generated_emails`, `subscription_plans`, `user_subscriptions`
   - Configure Row Level Security (RLS) policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Key Directories

- `/app/api/` - API routes for email generation, research, profile management, and Stripe
- `/components/` - React components including UI components, Header, Footer, and main features
- `/types/` - TypeScript type definitions
- `/constants/` - App constants like API endpoints and subscription plans
- `/utils/` - Utility functions for email, validation, formatting, and dates

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |

### Database Schema

Main tables:
- `profiles` - User profile information
- `generated_emails` - Generated email history
- `subscription_plans` - Available subscription plans
- `user_subscriptions` - User subscription data

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

Or build manually:
```bash
npm run build
npm start
```

## API Endpoints

- `POST /api/generate-email` - Generate personalized cold email
- `POST /api/generate-research` - Research recipient using AI
- `POST /api/generate-commonalities` - Find shared connections
- `POST /api/generate-final-email` - Generate final email with all context
- `POST /api/edit-email` - Edit generated email
- `POST /api/adjust-tone` - Adjust email tone
- `POST /api/shorten-email` - Shorten email length
- `POST /api/research-recipient` - Alternative research endpoint
- `GET/POST /api/profile` - User profile management
- `GET /api/past-emails` - Email history
- `GET /api/check-user-status` - Check user usage and subscription status
- `POST /api/stripe-webhook` - Stripe webhook handler

## Support

For issues or questions, create an issue in the repository.
