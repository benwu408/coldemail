// API Endpoints
export const API_ENDPOINTS = {
  PROFILE: '/api/profile',
  GENERATE_EMAIL: '/api/generate-email',
  GENERATE_RESEARCH: '/api/generate-research',
  GENERATE_COMMONALITIES: '/api/generate-commonalities',
  GENERATE_FINAL_EMAIL: '/api/generate-final-email',
  PAST_EMAILS: '/api/past-emails',
  RESEARCH_RECIPIENT: '/api/research-recipient',
  EDIT_EMAIL: '/api/edit-email',
  ADJUST_TONE: '/api/adjust-tone',
  SHORTEN_EMAIL: '/api/shorten-email',
  CHECK_USER_STATUS: '/api/check-user-status',
  STRIPE_WEBHOOK: '/api/stripe-webhook',
} as const

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
} as const

// Search Modes
export const SEARCH_MODES = {
  BASIC: 'basic',
  DEEP: 'deep',
} as const

// Usage Limits
export const USAGE_LIMITS = {
  FREE_DAILY_GENERATIONS: 2,
  PRO_DAILY_GENERATIONS: null, // unlimited
} as const

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 2000,
  TOAST_DURATION: 5000,
} as const

// Email Templates
export const EMAIL_TEMPLATES = {
  SUBJECT_PREFIXES: {
    CONNECTION: 'Quick question about',
    COLLABORATION: 'Partnership opportunity',
    INTRODUCTION: 'Introduction from',
    FOLLOW_UP: 'Following up on',
  },
} as const

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to access this feature.',
  RATE_LIMIT: 'You have reached your daily limit. Upgrade to Pro for unlimited access.',
  PROFILE_NOT_FOUND: 'User profile not found. Please complete your profile first.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  EMAIL_GENERATED: 'Email generated successfully!',
  PROFILE_SAVED: 'Profile saved successfully!',
  EMAIL_SAVED: 'Email saved successfully!',
  EMAIL_DELETED: 'Email deleted successfully!',
} as const
