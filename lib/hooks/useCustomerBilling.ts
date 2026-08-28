'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AdminBilling, AdminCollection, AdminConnection, AdminProfile } from '@/lib/types/admin'
import { getConnectionStatus } from '@/lib/utils/connectionStatus'

export type CustomerBillingData = {
  profile: AdminProfile
  connections: AdminConnection[]
  billings: AdminBilling[]
  collections: AdminCollection[]
}

export function useCustomerBilling() {
  const [data, setData] = useState<CustomerBillingData | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/user/billing', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to load billing information.')
      setData(result)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load billing information.')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const activeConnections = useMemo(
    () => data?.connections.filter(connection => getConnectionStatus(connection) === 'active') ?? [],
    [data]
  )
  const totalPaid = useMemo(
    () => data?.collections.reduce((sum, collection) => sum + Number(collection.amount), 0) ?? 0,
    [data]
  )

  return { data, error, load, activeConnections, totalPaid }
}
