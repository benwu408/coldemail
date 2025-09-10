import { GeneratedEmail } from '@/types'

/**
 * Formats email content by adding proper spacing around bold lines
 */
export function addSpacingAroundBoldLines(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '\n**$1**\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extracts subject line from email content
 */
export function extractSubjectFromEmail(content: string): string {
  const lines = content.split('\n')
  const subjectLine = lines.find(line => 
    line.toLowerCase().includes('subject:') || 
    line.toLowerCase().includes('re:')
  )
  
  if (subjectLine) {
    return subjectLine.replace(/^(subject:|re:)\s*/i, '').trim()
  }
  
  return 'Cold Email'
}

/**
 * Formats email for display with proper line breaks
 */
export function formatEmailForDisplay(content: string): string {
  return content
    .replace(/\n\n/g, '\n')
    .replace(/\*\*(.*?)\*\*/g, '**$1**')
    .trim()
}

/**
 * Validates email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generates a preview of the email content
 */
export function generateEmailPreview(content: string, maxLength: number = 150): string {
  const cleanContent = content.replace(/\*\*/g, '').replace(/\n/g, ' ')
  return cleanContent.length > maxLength 
    ? cleanContent.substring(0, maxLength) + '...'
    : cleanContent
}
