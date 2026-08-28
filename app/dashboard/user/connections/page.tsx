'use client'

import { useMemo, useState } from 'react'
import { Search, Wifi } from 'lucide-react'

import { ConnectionCard } from '@/components/cards/ConnectionCard'
import { Input } from '@/components/ui/input'
import { useCustomerBilling } from '@/lib/hooks/useCustomerBilling'

export default function UserConnections() {
  const { data, error, activeConnections } = useCustomerBilling()
  const [searchTerm, setSearchTerm] = useState('')
  const connections = useMemo(() => data?.connections.filter(connection => connection.package_name.toLowerCase().includes(searchTerm.toLowerCase())) ?? [], [data, searchTerm])
  if (error) return <Message error={error} />
  if (!data) return <Message>Loading connections…</Message>
  const activeIds = new Set(activeConnections.map(connection => connection.id))
  const expired = data.connections.length - activeConnections.length
  return <main className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-10 pt-4 sm:space-y-6 sm:px-6 sm:pt-6">
    <section><p className="text-sm font-medium text-primary">My internet service</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">My Connections</h1><p className="mt-1 text-sm text-muted-foreground">View your active packages, monthly bills and renewal dates.</p></section>
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm"><div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input placeholder="Search connections..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="h-11 pl-10" /></div></section>
    <div className="grid grid-cols-3 gap-3">{[['Total Connections', data.connections.length, 'text-foreground'], ['Active', activeConnections.length, 'text-green-600'], ['Expired', expired, 'text-red-600']].map(([label, value, color]) => <article key={String(label)} className="rounded-2xl border border-border bg-card p-3 shadow-sm"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-2 text-xl font-bold ${color}`}>{value}</p></article>)}</div>
    {connections.length ? <section className="grid gap-4 md:grid-cols-2">{connections.map(connection => <ConnectionCard key={connection.id} connection={{ id: connection.id, userId: connection.user_id, name: connection.package_name, packageName: connection.package_name, activationDate: connection.start_date, expirationDate: connection.renewal_date, status: activeIds.has(connection.id) ? 'active' : 'expired', monthlyPrice: Number(connection.monthly_price) }} />)}</section> : <section className="rounded-3xl border border-border bg-card p-12 text-center"><Wifi className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" /><h3 className="mb-2 text-lg font-semibold">No connections found</h3></section>}
  </main>
}

function Message({ children, error }: { children?: React.ReactNode; error?: string }) { return <main className="mx-auto max-w-6xl p-6"><p role={error ? 'alert' : undefined} className={error ? 'rounded-xl bg-red-500/10 p-4 text-red-600' : 'text-muted-foreground'}>{error ?? children}</p></main> }
