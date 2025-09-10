# Reachful - AI-Powered Cold Email Generator

A modern Next.js application that uses AI to generate personalized cold emails with ChatGPT web search capabilities.

## 🚀 Features

- **AI-Powered Research**: Uses ChatGPT with web search to research recipients
- **Personalized Emails**: Generates highly personalized cold emails based on research
- **Two Search Modes**: 
  - Basic search (Free users) - 30 seconds
  - Deep search (Pro users) - 90 seconds with comprehensive analysis
- **User Profiles**: Complete profile management with professional information
- **Email History**: Track and manage all generated emails
- **Subscription Management**: Stripe integration for Pro subscriptions
- **Responsive Design**: Modern, mobile-friendly interface

## 🏗️ Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── generate-email/      # Main email generation
│   │   ├── generate-research/   # Research generation
│   │   ├── generate-commonalities/ # Commonality analysis
│   │   ├── profile/             # User profile management
│   │   ├── past-emails/         # Email history
│   │   └── stripe-webhook/      # Stripe integration
│   ├── (pages)/                 # Public pages
│   │   ├── about/               # About page
│   │   ├── pricing/             # Pricing page
│   │   ├── how-it-works/        # How it works
│   │   ├── faq/                 # FAQ page
│   │   ├── privacy/             # Privacy policy
│   │   └── terms/               # Terms of service
│   └── (auth)/                  # Authentication pages
│       ├── login/               # Login page
│       ├── profile/             # User profile
│       └── generate/            # Email generation
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

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI GPT-5 & GPT-5-mini
- **UI Components**: Custom components with Lucide React icons
- **Animations**: Framer Motion
- **Deployment**: Vercel

## 🚀 Getting Started

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
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
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
   - Run the SQL scripts to set up tables and functions
   - Set up Row Level Security (RLS) policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Key Directories

### `/app/api/`
Contains all API routes for the application:
- **Email Generation**: Core email generation logic
- **Research**: AI-powered recipient research
- **Profile**: User profile management
- **Stripe**: Payment processing

### `/components/`
React components organized by functionality:
- **UI Components**: Reusable UI elements in `/ui/`
- **Layout Components**: Header, Footer, etc.
- **Feature Components**: Email generator, profile management

### `/types/`
Centralized TypeScript type definitions for:
- User and profile data
- API request/response types
- Component props
- Database schemas

### `/constants/`
Application constants including:
- API endpoints
- Subscription plans
- Usage limits
- Error messages

### `/utils/`
Utility functions organized by purpose:
- **Email**: Email formatting and validation
- **Validation**: Input validation functions
- **Formatting**: Text and date formatting
- **Date**: Date manipulation utilities

## 🔧 Configuration

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

The application uses the following main tables:
- `profiles` - User profile information
- `past_emails` - Generated email history
- `subscriptions` - User subscription data

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 📝 API Documentation

### Email Generation

**POST** `/api/generate-email`

Generates a personalized cold email based on recipient information.

**Request Body:**
```json
{
  "recipientName": "John Doe",
  "recipientCompany": "Acme Corp",
  "recipientRole": "VP of Sales",
  "purpose": "Partnership opportunity",
  "searchMode": "deep"
}
```

**Response:**
```json
{
  "success": true,
  "email": "Generated email content",
  "subject": "Email subject",
  "researchFindings": "Research data",
  "commonalities": "Common connections"
}
```

### Profile Management

**GET** `/api/profile` - Get user profile
**POST** `/api/profile` - Update user profile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@reachful.io or create an issue in the repository.
