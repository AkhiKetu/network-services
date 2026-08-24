'use client'

import { useEffect, useMemo, useState } from 'react'
import { DollarSign, TrendingUp, Users, Wifi } from 'lucide-react'
import { StatCard } from '@/components/cards/StatCard'
import type { AdminBilling, AdminCollection, AdminConnection, AdminProfile } from '@/lib/types/admin'
import { getAdminBillingMetrics, isInCurrentMonth } from '@/lib/utils/adminMetrics'

type AnalyticsData = {
  profiles: AdminProfile[]
  connections: AdminConnection[]
  billings: AdminBilling[]
  collections: AdminCollection[]
}
const money = (value: number) => `৳${value.toLocaleString('en-BD')}`

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void fetch('/api/admin/analytics', { cache: 'no-store' })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setData(result)
      })
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Unable to load analytics.'))
  }, [])

  const report = useMemo(() => data && createReport(data), [data])
  if (error) return <Message error={error} />
  if (!data || !report) return <Message>Loading analytics…</Message>

  const stats = getAdminBillingMetrics(data.profiles, data.connections, data.collections)
  const cards = [
    ['Monthly Total Bill', money(stats.monthlyTotalBill), DollarSign],
    ['Yearly Total Bill', money(stats.yearlyTotalBill), TrendingUp],
    ['Customers', stats.customers, Users],
    ['Active Connections', stats.activeConnections, Wifi],
    ['Expired Connections', stats.expiredConnections, Wifi],
    ['Paid This Month', money(stats.paidThisMonth), DollarSign],
    ['Unpaid This Month', money(stats.unpaidThisMonth), DollarSign],
  ] as const

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      <section>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="mt-2 text-muted-foreground">Supabase collections, bills, connections and customer metrics.</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([title, value, icon]) => <StatCard key={title} title={title} value={value} icon={icon} />)}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <ReportList title="Monthly Revenue Breakdown" values={report.months} empty="No collection data available" />
        <ReportList title="Payment Method Breakdown" values={report.methods} empty="No payments this month" />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <ReportList title="Zone Metrics" values={report.zones} />
        <ReportList title="Top Paying Customers" values={report.top} />
      </section>
    </main>
  )
}

function createReport({ profiles, connections, collections }: AnalyticsData) {
  const customers = profiles.filter(profile => profile.role === 'user' && !profile.deleted_at)
  const customerIds = new Set(customers.map(customer => customer.id))
  const monthly = collections.filter(item => customerIds.has(item.user_id))
  const sumBy = (items: AdminCollection[], key: (item: AdminCollection) => string) =>
    items.reduce<Record<string, number>>((totals, item) => {
      const label = key(item)
      totals[label] = (totals[label] ?? 0) + item.amount
      return totals
    }, {})
  const totalBy = (items: AdminCollection[], key: (item: AdminCollection) => string) =>
    Object.entries(sumBy(items, key))
  const paymentByCustomer = sumBy(monthly, item => item.user_id)
  const expectedByCustomer = connections.reduce<Record<string, number>>((totals, connection) => {
    if (!connection.deleted_at) totals[connection.user_id] = (totals[connection.user_id] ?? 0) + connection.monthly_price
    return totals
  }, {})
  const zones = customers.reduce<Record<string, { customers: number; expected: number; collected: number }>>((totals, customer) => {
    const zone = customer.zone ?? 'Unassigned'
    const value = totals[zone] ?? { customers: 0, expected: 0, collected: 0 }
    value.customers += 1
    value.expected += expectedByCustomer[customer.id] ?? 0
    value.collected += getCurrentMonthTotal(monthly, customer.id)
    totals[zone] = value
    return totals
  }, {})

  return {
    months: totalBy(monthly, item => new Date(item.created_at).toLocaleDateString('en-BD', { month: 'short', year: 'numeric' })),
    methods: totalBy(monthly.filter(item => isInCurrentMonth(item.created_at)), item => item.payment_method),
    zones: Object.entries(zones).map(([zone, value]) => [zone, `${value.customers} customers · ${money(value.expected)} expected · ${money(value.collected)} collected`] as const),
    top: customers.map(customer => [customer.name ?? 'Unnamed', paymentByCustomer[customer.id] ?? 0] as const).sort(([, left], [, right]) => right - left).slice(0, 5),
  }
}

function getCurrentMonthTotal(collections: AdminCollection[], customerId: string) {
  return collections.filter(item => item.user_id === customerId && isInCurrentMonth(item.created_at)).reduce((total, item) => total + item.amount, 0)
}

function ReportList({ title, values, empty }: { title: string; values: readonly (readonly [string, string | number])[]; empty?: string }) {
  return <div className="rounded-3xl border border-border bg-card p-5">
    <h2 className="mb-4 text-xl font-bold">{title}</h2>
    {values.length ? values.map(([label, value]) => <p key={label} className="flex justify-between border-b border-border py-2"><span className="capitalize">{label}</span><b>{typeof value === 'number' ? money(value) : value}</b></p>) : <p className="text-muted-foreground">{empty ?? 'No data available'}</p>}
  </div>
}

function Message({ children, error }: { children?: React.ReactNode; error?: string }) {
  return <main className="mx-auto max-w-6xl p-6"><p role={error ? 'alert' : undefined} className={error ? 'rounded-xl bg-red-500/10 p-4 text-red-600' : 'text-muted-foreground'}>{error ?? children}</p></main>
}
