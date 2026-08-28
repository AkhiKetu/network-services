'use client'

import Link from 'next/link'
import { Calendar, DollarSign, TrendingUp, Wifi } from 'lucide-react'

import { ConnectionCard } from '@/components/cards/ConnectionCard'
import { StatCard } from '@/components/cards/StatCard'
import { Button } from '@/components/ui/button'
import { useCustomerBilling } from '@/lib/hooks/useCustomerBilling'

const money = (value: number) => `৳${value.toLocaleString('en-BD')}`

export default function UserDashboard() {
  const { data, error, activeConnections, totalPaid } = useCustomerBilling()
  if (error) return <Message error={error} />
  if (!data) return <Message>Loading dashboard…</Message>

  const monthlyBill = activeConnections.reduce((sum, connection) => sum + Number(connection.monthly_price), 0)
  return <main className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-10 pt-4 sm:space-y-6 sm:px-6 sm:pt-6">
    <div><h1 className="text-4xl font-bold text-foreground">Welcome, {data.profile.name}</h1><p className="mt-2 text-muted-foreground">Manage your network connections and billing.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Active Connections" value={activeConnections.length} icon={Wifi} description={`${data.connections.length} total`} />
      <StatCard title="Monthly Bill" value={money(monthlyBill)} icon={DollarSign} description="Active services" />
      <StatCard title="Subscription Status" value={activeConnections.length ? 'Active' : 'Inactive'} icon={Calendar} description="Based on service dates" />
      <StatCard title="Total Paid" value={money(totalPaid)} icon={TrendingUp} description="Saved payments" />
    </div>
    <div className="rounded-3xl border border-border bg-card p-5"><h2 className="mb-4 text-2xl font-bold">Quick Actions</h2><div className="flex flex-wrap gap-3"><Link href="/dashboard/user/connections"><Button>View All Connections</Button></Link><Link href="/dashboard/user/billing"><Button variant="outline">View Billing</Button></Link><Link href="/dashboard/user/settings"><Button variant="outline">Account Settings</Button></Link></div></div>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">Recent Connections</h2><Link href="/dashboard/user/connections"><Button variant="ghost">View All</Button></Link></div>{data.connections.length ? <div className="grid gap-4 md:grid-cols-2">{data.connections.slice(0, 4).map(connection => <ConnectionCard key={connection.id} connection={{ id: connection.id, userId: connection.user_id, name: connection.package_name, packageName: connection.package_name, activationDate: connection.start_date, expirationDate: connection.renewal_date, status: activeConnections.some(item => item.id === connection.id) ? 'active' : 'expired', monthlyPrice: Number(connection.monthly_price) }} />)}</div> : <Empty />}</section>
  </main>
}

function Empty() { return <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">No connections yet. Contact support to add your first connection.</div> }
function Message({ children, error }: { children?: React.ReactNode; error?: string }) { return <main className="mx-auto max-w-6xl p-6"><p role={error ? 'alert' : undefined} className={error ? 'rounded-xl bg-red-500/10 p-4 text-red-600' : 'text-muted-foreground'}>{error ?? children}</p></main> }
