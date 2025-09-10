/**
 * Gets the current date in ISO format
 */
export function getCurrentDate(): string {
  return new Date().toISOString()
}

/**
 * Gets the start of today in ISO format
 */
export function getTodayStart(): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString()
}

/**
 * Gets the end of today in ISO format
 */
export function getTodayEnd(): string {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return today.toISOString()
}

/**
 * Checks if a date is today
 */
export function isToday(date: string | Date): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Gets relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return d.toLocaleDateString()
}
