'use client'

import { useEffect, useMemo, useState } from 'react'
import { Banknote, Building2, Download, ReceiptText, Smartphone, WalletCards } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AdminCustomer, RecentCollection } from '@/lib/types/admin'

type Method = 'cash' | 'bkash' | 'nagad' | 'bank'

const methods: Array<[Method, typeof Banknote, string]> = [
  ['cash', Banknote, 'Cash'], ['bkash', Smartphone, 'bKash'],
  ['nagad', WalletCards, 'Nagad'], ['bank', Building2, 'Bank'],
]
const money = (value: number) => `৳${value.toLocaleString('en-BD', { maximumFractionDigits: 2 })}`
const sameDay = (value: string, date: Date) => { const item = new Date(value); return item.getFullYear() === date.getFullYear() && item.getMonth() === date.getMonth() && item.getDate() === date.getDate() }

export default function CollectionsPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [records, setRecords] = useState<RecentCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [zone, setZone] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<Method>('cash')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = async () => { setLoading(true); try { const response = await fetch('/api/admin/collections', { cache: 'no-store' }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Unable to load collections.'); setCustomers(data.customers); setRecords(data.records); setError('') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load collections.') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])

  const zones = useMemo(() => Array.from(new Set(customers.map(customer => customer.zone ?? 'Unassigned'))).sort(), [customers])
  const visibleCustomers = customers.filter(customer => !zone || customer.zone === zone)
  const selected = customers.find(customer => customer.id === customerId)
  const remainingDue = useMemo(() => { if (!selected) return 0; const currentBill = selected.unpaid_billing; const paid = currentBill ? records.filter(record => record.billing_id === currentBill.id).reduce((sum, record) => sum + record.amount, 0) : 0; return Math.max((currentBill?.amount ?? selected.connection?.monthly_price ?? 0) - paid, 0) }, [records, selected])
  const today = new Date()
  const todayRecords = records.filter(record => sameDay(record.created_at, today))
  const total = todayRecords.reduce((sum, item) => sum + item.amount, 0)
  const cash = todayRecords.filter(item => item.payment_method === 'cash').reduce((sum, item) => sum + item.amount, 0)

  const selectCustomer = (id: string) => { setCustomerId(id); setSaved(false); const customer = customers.find(item => item.id === id); const currentBill = customer?.unpaid_billing; const paid = currentBill ? records.filter(record => record.billing_id === currentBill.id).reduce((sum, record) => sum + record.amount, 0) : 0; setAmount(String(Math.max((currentBill?.amount ?? customer?.connection?.monthly_price ?? 0) - paid, 0))) }
  const save = async () => { if (!selected || !amount) return; setSaving(true); try { const response = await fetch('/api/admin/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: selected.id, amount: Number(amount), paymentMethod: method, referenceNote: note }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Unable to save payment.'); setCustomerId(''); setAmount(''); setNote(''); setMethod('cash'); setSaved(true); await load() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save payment.') } finally { setSaving(false) } }
  const exportCsv = () => { if (!records.length) return; const lines = [['Date','Customer','Phone','Zone','Amount','Payment Method','Reference','Collected By'], ...records.map(record => [new Date(record.created_at).toLocaleString(),record.customer_name,record.customer_phone,record.customer_zone,record.amount,record.payment_method,record.reference_note ?? '',record.collector_name])].map(row => row.map(value => `"${String(value).replaceAll('"','""')}"`).join(',')); const url = URL.createObjectURL(new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = `ccnetworks-collections-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url) }

  return <main className="pb-10 pt-4 sm:pb-12 sm:pt-6"><div className="mx-auto w-full max-w-6xl space-y-5 px-4 sm:space-y-6 sm:px-6">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Payment Collection</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Collections</h1><p className="mt-1 text-sm text-muted-foreground">Record customer payments in the field. Date, day and time are added automatically.</p></div><Button variant="outline" onClick={exportCsv} disabled={!records.length}><Download/>Export CSV</Button></section>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Today',money(total)],['Payments',String(todayRecords.length)],['Cash',money(cash)],['Digital',money(total-cash)]].map(([label,value])=><article key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></article>)}</section>
    {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
    {loading ? <section className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">Loading collections…</section> : <section className="grid gap-5 lg:grid-cols-[0.85fr_1.35fr]">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"><div className="mb-5 flex gap-3"><div className="rounded-2xl bg-primary/10 p-3"><ReceiptText className="h-5 w-5 text-primary"/></div><div><h2 className="font-bold">Collect Payment</h2><p className="text-xs text-muted-foreground">Zone → Customer → Method → Save</p></div></div><div className="space-y-4">
        <label className="block text-sm font-medium">Zone<select value={zone} onChange={event=>{setZone(event.target.value);setCustomerId('');setAmount('')}} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"><option value="">All zones</option>{zones.map(item=><option key={item}>{item}</option>)}</select></label>
        <label className="block text-sm font-medium">Customer<select value={customerId} onChange={event=>selectCustomer(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"><option value="">Select customer</option>{visibleCustomers.map(customer=><option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}</select></label>
        {selected&&<div className="rounded-2xl bg-muted/50 p-3 text-sm"><p>Customer ID: <b>{selected.customer_id}</b></p><p className="mt-2">Name: <b>{selected.name}</b></p><p className="mt-2">Phone: <b>{selected.phone}</b></p><p className="mt-2">Zone: <b>{selected.zone}</b></p><p className="mt-2">Package: <b>{selected.connection?.package_name ?? 'No package'}</b></p><p className="mt-2">Connection Type: <b>{selected.connection?.connection_type ?? 'Not set'}</b></p><p className="mt-2">Monthly bill: <b>{money(selected.connection?.monthly_price ?? 0)}</b></p><p className="mt-2">Remaining due: <b>{money(remainingDue)}</b></p></div>}
        <label className="block text-sm font-medium">Amount<Input type="number" min="0" value={amount} onChange={event=>setAmount(event.target.value)} className="mt-2 h-11"/></label><div><p className="mb-2 text-sm font-medium">Payment Method</p><div className="grid grid-cols-2 gap-2">{methods.map(([key,Icon,label])=><button key={key} type="button" onClick={()=>setMethod(key)} className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium ${method===key?'border-primary bg-primary text-primary-foreground':'border-border'}`}><Icon className="h-4 w-4"/>{label}</button>)}</div></div><label className="block text-sm font-medium">Reference / Note<Input value={note} onChange={event=>setNote(event.target.value)} placeholder="Optional" className="mt-2 h-11"/></label>{saved&&<p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700">Payment recorded successfully.</p>}<Button size="lg" onClick={save} disabled={!selected||!amount||saving} className="h-11 w-full">{saving?'Saving…':'Save Payment'}</Button>
      </div></div>
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"><h2 className="font-bold">Recent Collections</h2><p className="mb-4 text-xs text-muted-foreground">{records.length} saved payment{records.length===1?'':'s'}</p>{records.length?<div className="space-y-3">{records.slice(0,20).map(record=><article key={record.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border p-4"><div><p className="font-semibold">{record.customer_name}</p><p className="text-xs text-muted-foreground">{record.customer_zone} · {record.payment_method} · {new Date(record.created_at).toLocaleString()}</p>{record.reference_note&&<p className="mt-1 text-xs text-muted-foreground">{record.reference_note}</p>}</div><p className="font-bold text-primary">{money(record.amount)}</p></article>)}</div>:<div className="flex min-h-64 flex-col items-center justify-center text-center"><ReceiptText className="mb-3 h-10 w-10 text-muted-foreground/30"/><p className="font-medium">No collections yet</p></div>}</div>
    </section>}
  </div></main>
}
