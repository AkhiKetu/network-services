import { dateFromInput } from '@/lib/utils/dateUtils'

export type EffectiveConnectionStatus = 'active' | 'expired' | 'deleted'

export interface StatusableConnection {
  renewal_date?: string
  expirationDate?: string
  deleted_at?: string | null
  deleted?: boolean
}

/**
 * The UI always derives service state from the business dates. A stored
 * `status` value is kept for persistence/audit purposes but is never trusted
 * to decide whether service has expired.
 */
export function getConnectionStatus(
  connection: StatusableConnection,
  today = new Date()
): EffectiveConnectionStatus {
  if (connection.deleted_at || connection.deleted) return 'deleted'

  const renewalDate = connection.renewal_date ?? connection.expirationDate
  if (!renewalDate) return 'expired'

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return dateFromInput(renewalDate) < startOfToday ? 'expired' : 'active'
}
