export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const getDaysRemaining = (expirationDate: string): number => {
  const expiry = new Date(expirationDate)
  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export const isExpiringSoon = (expirationDate: string, days: number = 30): boolean => {
  return getDaysRemaining(expirationDate) <= days && getDaysRemaining(expirationDate) > 0
}

export const isExpired = (expirationDate: string): boolean => {
  return getDaysRemaining(expirationDate) <= 0
}

export const getMonthFromDate = (date: string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
