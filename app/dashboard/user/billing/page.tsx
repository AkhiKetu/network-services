'use client'

import { Calendar, DollarSign, TrendingUp } from 'lucide-react'

import { StatCard } from '@/components/cards/StatCard'
import { useCustomerBilling } from '@/lib/hooks/useCustomerBilling'

const money = (value: number) => `৳${value.toLocaleString('en-BD')}`

export default function UserBilling() {
  const { data, error, activeConnections, totalPaid } = useCustomerBilling()
  if (error) return <Message error={error} />
  if (!data) return <Message>Loading billing…</Message>
  const currentMonth = `${new Date().toISOString().slice(0, 7)}-01`
  const currentBills = data.billings.filter(bill => bill.billing_month === currentMonth)
  const monthlyBill = currentBills.reduce((sum, bill) => sum + Number(bill.amount), 0)
  const paymentsByBill = new Map<string, number>()
  for (const collection of data.collections) if (collection.billing_id) paymentsByBill.set(collection.billing_id, (paymentsByBill.get(collection.billing_id) ?? 0) + Number(collection.amount))
  return <main className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-10 pt-4 sm:space-y-6 sm:px-6 sm:pt-6">
    <div><h1 className="text-4xl font-bold">Billing & Invoices</h1><p className="mt-2 text-muted-foreground">Your permanent billing and payment history.</p></div>
    <div className="grid gap-3 sm:grid-cols-3"><StatCard title="Monthly Bill" value={money(monthlyBill)} icon={DollarSign} description="Current billing month" /><StatCard title="Total Paid" value={money(totalPaid)} icon={TrendingUp} description="Saved payments" /><StatCard title="Invoices" value={data.billings.length} icon={Calendar} description={`${data.billings.filter(bill => bill.status === 'paid').length} fully paid`} /></div>
    <section className="rounded-3xl border border-border bg-card shadow-sm"><div className="border-b border-border p-5"><h2 className="font-bold">Invoices</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr>{['Month', 'Package', 'Bill', 'Paid', 'Due', 'Payment date', 'Status'].map(label => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{data.billings.map(bill => { const paid = paymentsByBill.get(bill.id) ?? 0; const unpaid = Math.max(Number(bill.amount) - paid, 0); const paymentDates = data.collections.filter(collection => collection.billing_id === bill.id).map(collection => new Date(collection.created_at).toLocaleDateString()).join(', '); return <tr key={bill.id} className="border-t border-border"><td className="px-4 py-3">{new Date(`${bill.billing_month}T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td><td className="px-4 py-3">{bill.package_name_snapshot ?? '—'}</td><td className="px-4 py-3">{money(Number(bill.amount))}</td><td className="px-4 py-3">{money(paid)}</td><td className="px-4 py-3">{money(unpaid)}</td><td className="px-4 py-3">{paymentDates || '—'}</td><td className="px-4 py-3 capitalize">{paid >= Number(bill.amount) ? 'paid' : paid > 0 ? 'partial' : 'unpaid'}</td></tr> })}{!data.billings.length && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No invoices yet.</td></tr>}</tbody></table></div></section>
    {data.collections.length > 0 && <section className="rounded-3xl border border-border bg-card p-5 shadow-sm"><h2 className="font-bold">Payment History</h2><div className="mt-3 space-y-2 text-sm">{data.collections.map(collection => <p key={collection.id}>{new Date(collection.created_at).toLocaleString()} — Collected By: {collection.collector_name ?? 'Unknown collector'}</p>)}</div></section>}
    <p className="text-sm text-muted-foreground">{activeConnections.length} active connection{activeConnections.length === 1 ? '' : 's'}. Contact your administrator to record a payment.</p>
  </main>
}

function Message({ children, error }: { children?: React.ReactNode; error?: string }) { return <main className="mx-auto max-w-6xl p-6"><p role={error ? 'alert' : undefined} className={error ? 'rounded-xl bg-red-500/10 p-4 text-red-600' : 'text-muted-foreground'}>{error ?? children}</p></main> }
