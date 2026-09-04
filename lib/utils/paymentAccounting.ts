export type PaymentType = 'full' | 'partial' | 'advance'

export const money = (value: number) => `৳${Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 2 })}`

export function paymentStatus(amount: number, paid: number): 'unpaid' | 'partial' | 'paid' {
  return paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
}

export function monthLabel(value: string | null | undefined) {
  return value ? new Date(`${value.slice(0, 7)}-01T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'
}

export function matchesCustomerSearch(query: string, customer: { customer_id?: string | null; name?: string | null; username?: string | null }) {
  const needle = query.trim().toLowerCase()
  return !needle || [customer.customer_id, customer.name, customer.username].some(value => value?.toLowerCase().includes(needle))
}
