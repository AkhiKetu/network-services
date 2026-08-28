'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Bell, DollarSign, TrendingUp, Users, Wifi } from 'lucide-react'
import { ConnectionCard } from '@/components/cards/ConnectionCard'
import type { AdminBilling, AdminCollection, AdminConnection, AdminNotification, AdminProfile } from '@/lib/types/admin'
import { getAdminBillingMetrics } from '@/lib/utils/adminMetrics'
import { getConnectionStatus } from '@/lib/utils/connectionStatus'

type DashboardData = {
  profiles: AdminProfile[]
  connections: AdminConnection[]
  billings: AdminBilling[]
  collections: AdminCollection[]
  notifications: AdminNotification[]
}

const money = (value: number) => `৳${value.toLocaleString('en-BD')}`
const links = [
  ['Bill Collection', '/dashboard/admin/collections'],
  ['Users', '/dashboard/admin/users'],
  ['Connections', '/dashboard/admin/connections'],
  ['Analytics', '/dashboard/admin/analytics'],
] as const

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(() => {
    return fetch('/api/admin/dashboard', { cache: 'no-store' })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setData(result)
        setError('')
      })
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Unable to load dashboard.'))
  }, [])

  useEffect(() => {
    void loadDashboard()
    window.addEventListener('focus', loadDashboard)
    return () => window.removeEventListener('focus', loadDashboard)
  }, [loadDashboard])

  const metrics = useMemo(
    () => data && getAdminBillingMetrics(data.profiles, data.connections, data.billings, data.collections),
    [data]
  )

  if (error) return <PageMessage error={error} />
  if (!data || !metrics) return <PageMessage>Loading dashboard…</PageMessage>

  const cards = [
    ['Monthly Total Bill', money(metrics.monthlyTotalBill), DollarSign],
    ['Monthly Collected', money(metrics.paidThisMonth), DollarSign],
    ['Monthly Unpaid', money(metrics.unpaidThisMonth), DollarSign],
    ['Yearly Total Bill', money(metrics.yearlyTotalBill), TrendingUp],
    ['Customers', metrics.customers, Users],
    ['Active Connections', metrics.activeConnections, Wifi],
    ['Expiring Soon', metrics.expiringSoon, Wifi],
  ] as const
  const unread = data.notifications.filter(notification => !notification.is_read).slice(0, 3)

  return (
    <main className="min-h-screen pb-10 pt-4 sm:pb-12 sm:pt-6">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 sm:space-y-6 sm:px-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Business Overview</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <article key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="h-5 w-5 text-primary" /></div>
              <p className="mt-4 text-2xl font-bold">{value}</p>
            </article>
          ))}
        </section>

        {unread.length > 0 && <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="mb-4 flex gap-2 font-bold"><Bell className="h-5 w-5" />Recent Notifications</h2>
          {unread.map(item => <div key={item.id} className="mb-2 rounded-2xl bg-muted/50 p-3"><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.message}</p></div>)}
        </section>}

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="mb-4 font-bold">Quick Links</h2>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {links.map(([label, href]) => <Link key={href} href={href} className="flex items-center justify-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:text-primary">{label}<ArrowRight className="h-4 w-4" /></Link>)}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Recent Connections</h2>
          {data.connections.filter(connection => !connection.deleted_at).length ? <div className="grid gap-4 md:grid-cols-2">
            {data.connections.filter(connection => !connection.deleted_at).slice(0, 4).map(connection => {
              const user = data.profiles.find(profile => profile.id === connection.user_id)
              return <ConnectionCard key={connection.id} showUser userName={user?.name ?? undefined} expiringSoonDays={3} connection={{ id: connection.id, userId: connection.user_id, name: connection.package_name, packageName: connection.package_name, activationDate: connection.start_date, expirationDate: connection.renewal_date, status: getConnectionStatus(connection) === 'active' ? 'active' : 'expired', monthlyPrice: connection.monthly_price, deleted: Boolean(connection.deleted_at) }} />
            })}
          </div> : <div className="rounded-3xl border border-border bg-card p-10 text-center"><Wifi className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />No Connections</div>}
        </section>
      </div>
    </main>
  )
}

function PageMessage({ children, error }: { children?: React.ReactNode; error?: string }) {
  return <main className="mx-auto max-w-6xl p-6"><p role={error ? 'alert' : undefined} className={error ? 'rounded-xl bg-red-500/10 p-4 text-red-600' : 'text-muted-foreground'}>{error ?? children}</p></main>
}
