import { ProfileData } from '@/types'

/**
 * Validates profile data
 */
export function validateProfile(profile: Partial<ProfileData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!profile.full_name?.trim()) {
    errors.push('Full name is required')
  }
  
  if (!profile.job_title?.trim()) {
    errors.push('Job title is required')
  }
  
  if (!profile.company?.trim()) {
    errors.push('Company is required')
  }
  
  if (profile.linkedin_url && !isValidUrl(profile.linkedin_url)) {
    errors.push('LinkedIn URL must be a valid URL')
  }
  
  if (profile.website && !isValidUrl(profile.website)) {
    errors.push('Website URL must be a valid URL')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates email generation request
 */
export function validateEmailRequest(data: {
  recipientName: string
  purpose: string
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.recipientName?.trim()) {
    errors.push('Recipient name is required')
  }
  
  if (!data.purpose?.trim()) {
    errors.push('Purpose is required')
  }
  
  if (data.recipientName && data.recipientName.length < 2) {
    errors.push('Recipient name must be at least 2 characters')
  }
  
  if (data.purpose && data.purpose.length < 10) {
    errors.push('Purpose must be at least 10 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
