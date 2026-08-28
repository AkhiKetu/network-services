export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const getDaysRemaining = (expirationDate: string): number => {
  const expiry = dateFromInput(expirationDate)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffTime = expiry.getTime() - startOfToday.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const isExpiringSoon = (expirationDate: string, days: number = 3): boolean => {
  const daysRemaining = getDaysRemaining(expirationDate)
  return daysRemaining <= days && daysRemaining > 0
}

export const isExpired = (expirationDate: string): boolean => {
  return getDaysRemaining(expirationDate) < 0
}

export const getMonthFromDate = (date: string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export const addCalendarMonth = (date = new Date()): Date => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return next
}

export const getRenewalDate = (date = new Date()): string =>
  addCalendarMonth(date).toISOString().slice(0, 10)

/** Converts a database date (YYYY-MM-DD) without applying a UTC offset. */
export const dateFromInput = (value: string): Date => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}
