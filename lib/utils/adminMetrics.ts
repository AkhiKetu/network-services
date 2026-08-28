import type { AdminBilling, AdminCollection, AdminConnection, AdminProfile } from '@/lib/types/admin'
import { getConnectionStatus } from '@/lib/utils/connectionStatus'

export function isInCurrentMonth(value: string, date = new Date()) {
  const item = new Date(value)
  return item.getFullYear() === date.getFullYear() && item.getMonth() === date.getMonth()
}

export function getAdminBillingMetrics(
  profiles: AdminProfile[],
  connections: AdminConnection[],
  billings: AdminBilling[],
  collections: AdminCollection[],
  date = new Date()
) {
  const customers = profiles.filter(profile => profile.role === 'user' && !profile.deleted_at)
  const customerIds = new Set(customers.map(customer => customer.id))
  const customerConnections = connections.filter(connection => customerIds.has(connection.user_id) && !connection.deleted_at)
  // Invoice and collection history is immutable. Keep it in financial totals
  // even after a customer is deactivated, while excluding deactivated records
  // from operational customer/connection counts.
  const monthlyBills = billings.filter(billing => isInCurrentMonth(billing.billing_month, date))
  const monthlyTotalBill = monthlyBills.reduce((sum, billing) => sum + Number(billing.amount), 0)
  const paidThisMonth = collections
    .filter(collection => isInCurrentMonth(collection.created_at, date))
    .reduce((sum, collection) => sum + collection.amount, 0)

  return {
    customers: customers.length,
    monthlyTotalBill,
    yearlyTotalBill: collections
      .filter(collection => new Date(collection.created_at).getFullYear() === date.getFullYear())
      .reduce((sum, collection) => sum + Number(collection.amount), 0),
    paidThisMonth,
    unpaidThisMonth: Math.max(monthlyTotalBill - paidThisMonth, 0),
    activeConnections: customerConnections.filter(connection => getConnectionStatus(connection, date) === 'active').length,
    expiredConnections: customerConnections.filter(connection => getConnectionStatus(connection, date) === 'expired').length,
    deletedConnections: connections.filter(connection => customerIds.has(connection.user_id) && Boolean(connection.deleted_at)).length,
    expiringSoon: customerConnections.filter(connection => {
      if (connection.deleted_at || getConnectionStatus(connection, date) !== 'active') return false
      const remaining = Math.ceil((new Date(`${connection.renewal_date}T12:00:00`).getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000)
      return remaining > 0 && remaining <= 3
    }).length,
  }
}
