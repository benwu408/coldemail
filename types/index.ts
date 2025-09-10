// User and Profile Types
export interface User {
  id: string
  email: string
}

export interface ProfileData {
  full_name: string
  job_title: string
  company: string
  education: {
    school: string
    degree: string
    major: string
    graduation_year: string
  }
  location: string
  industry: string
  experience_years: string
  job_experiences: {
    company: string
    title: string
    start_date: string
    end_date: string
    description: string
    is_current: boolean
  }[]
  skills: string[]
  interests: string[]
  background: string
  linkedin_url: string
  website: string
}

// Subscription Types
export interface UserSubscription {
  plan_name: string
  status: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

export interface UserUsage {
  generationsToday: number
  dailyLimit: number | null
  limitReached: boolean
}

// Email Generation Types
export interface EmailGenerationRequest {
  recipientName: string
  recipientCompany?: string
  recipientRole?: string
  purpose: string
  searchMode: 'basic' | 'deep'
}

export interface GeneratedEmail {
  id: string
  content: string
  subject: string
  recipient_name: string
  recipient_company?: string
  recipient_role?: string
  purpose: string
  research_findings: string
  commonalities: string
  search_mode: 'basic' | 'deep'
  created_at: string
  user_id: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Component Props Types
export interface HeaderProps {
  showBackButton?: boolean
  backUrl?: string
  showNavigation?: boolean
  title?: string
  subtitle?: string
}

export interface ProtectedRouteProps {
  children: React.ReactNode
}

// Toast Types
export interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}
