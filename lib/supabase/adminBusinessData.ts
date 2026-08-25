import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { getConnectionStatus } from '@/lib/utils/connectionStatus'
import type { AdminBilling, AdminCollection, AdminConnection, AdminCustomer, AdminNotification, AdminProfile, RecentCollection } from '@/lib/types/admin'

const PROFILE_FIELDS = 'id, customer_id, name, phone, zone, role, created_at, deleted_at'
const CONNECTION_FIELDS = 'id, user_id, package_name, monthly_price, connection_type, status, start_date, renewal_date, created_at, deleted_at'
const BILLING_FIELDS = 'id, user_id, connection_id, amount, billing_month, due_date, status, paid_at, created_at'
const COLLECTION_FIELDS = 'id, user_id, billing_id, amount, payment_method, reference_note, collected_by, created_at'

export async function loadAdminBusinessData(admin: SupabaseClient, options?: { notifications?: boolean }) {
  const requests = [
    admin.from('profiles').select(PROFILE_FIELDS).order('created_at', { ascending: false }),
    admin.from('connections').select(CONNECTION_FIELDS).order('created_at', { ascending: false }),
    admin.from('billings').select(BILLING_FIELDS).order('created_at', { ascending: false }),
    admin.from('collections').select(COLLECTION_FIELDS).order('created_at', { ascending: false }),
  ] as const
  const results = await Promise.all(requests)
  const [profilesResult, connectionsResult, billingsResult, collectionsResult] = results
  const errors = results.map(result => result.error).filter(Boolean)
  if (errors.length) throw errors[0]

  let notifications: AdminNotification[] = []
  if (options?.notifications) {
    const { data, error } = await admin.from('notifications').select('id, user_id, title, message, is_read, created_at').order('created_at', { ascending: false }).limit(20)
    if (error) throw error
    notifications = (data ?? []) as AdminNotification[]
  }

  return {
    profiles: (profilesResult.data ?? []) as AdminProfile[],
    connections: (connectionsResult.data ?? []) as AdminConnection[],
    billings: (billingsResult.data ?? []) as AdminBilling[],
    collections: (collectionsResult.data ?? []) as AdminCollection[],
    notifications,
  }
}

export function toCustomers(
  profiles: AdminProfile[], connections: AdminConnection[], billings: AdminBilling[]
): AdminCustomer[] {
  return profiles.map(profile => {
    const connection = connections.find(item => item.user_id === profile.id && !item.deleted_at) ?? null
    const unpaid = connection
      ? billings.find(item => item.connection_id === connection.id && item.status === 'unpaid') ?? null
      : null
    return { ...profile, connection, connection_status: connection ? getConnectionStatus(connection) : null, unpaid_billing: unpaid }
  })
}

export function toRecentCollections(
  collections: AdminCollection[], profiles: AdminProfile[]
): RecentCollection[] {
  const profileById = new Map(profiles.map(profile => [profile.id, profile]))
  return collections.map(record => {
    const customer = profileById.get(record.user_id)
    const collector = profileById.get(record.collected_by)
    return {
      ...record,
      customer_name: customer?.name ?? 'Unknown customer',
      customer_phone: customer?.phone ?? '',
      customer_zone: customer?.zone ?? 'Unassigned',
      collector_name: collector?.name ?? 'Admin',
    }
  })
}
