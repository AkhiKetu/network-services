import type { AdminCollection, AdminConnection, AdminProfile } from '@/lib/types/admin'
import { getConnectionStatus } from '@/lib/utils/connectionStatus'

export function getRemainingMonthsInYear(date = new Date()) {
  return 12 - date.getMonth()
}

export function isInCurrentMonth(value: string, date = new Date()) {
  const item = new Date(value)
  return item.getFullYear() === date.getFullYear() && item.getMonth() === date.getMonth()
}

export function getAdminBillingMetrics(
  profiles: AdminProfile[],
  connections: AdminConnection[],
  collections: AdminCollection[],
  date = new Date()
) {
  const customers = profiles.filter(profile => profile.role === 'user' && !profile.deleted_at)
  const customerIds = new Set(customers.map(customer => customer.id))
  const customerConnections = connections.filter(connection => customerIds.has(connection.user_id))
  const monthlyTotalBill = customerConnections
    .filter(connection => !connection.deleted_at)
    .reduce((sum, connection) => sum + connection.monthly_price, 0)
  const paidThisMonth = collections
    .filter(collection => customerIds.has(collection.user_id) && isInCurrentMonth(collection.created_at, date))
    .reduce((sum, collection) => sum + collection.amount, 0)

  return {
    customers: customers.length,
    monthlyTotalBill,
    yearlyTotalBill: monthlyTotalBill * getRemainingMonthsInYear(date),
    paidThisMonth,
    unpaidThisMonth: Math.max(monthlyTotalBill - paidThisMonth, 0),
    activeConnections: customerConnections.filter(connection => getConnectionStatus(connection, date) === 'active').length,
    expiredConnections: customerConnections.filter(connection => getConnectionStatus(connection, date) === 'expired').length,
    deletedConnections: customerConnections.filter(connection => getConnectionStatus(connection, date) === 'deleted').length,
  }
}
