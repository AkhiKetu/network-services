'use client'

import { useState } from 'react'
import { CalendarDays, MapPin, Pencil, Search, UserRound, Wifi, X } from 'lucide-react'

import { Connection } from '@/lib/types'
import { useApp } from '@/lib/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminConnections() {
  const { connections, users, updateConnection } = useApp()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'expired' | 'deleted'>('all')
  const [editing, setEditing] = useState<Connection | null>(null)

  const visibleConnections = connections.filter(connection => {
    const customer = users.find(user => user.id === connection.userId)
    const searchText = `${connection.name} ${connection.packageName || ''} ${customer?.name || ''} ${customer?.zone || ''}`.toLowerCase()
    const isExpired = connection.status === 'expired' || new Date(connection.expirationDate) < new Date()
    const matchesStatus = status === 'all' || (status === 'deleted' ? connection.deleted === true : !connection.deleted && (status === 'expired' ? isExpired : connection.status === 'active' && !isExpired))
    return searchText.includes(query.toLowerCase()) && matchesStatus
  })

  const activeCount = connections.filter(connection => !connection.deleted && connection.status === 'active' && new Date(connection.expirationDate) >= new Date()).length
  const expiredCount = connections.filter(connection => !connection.deleted && (connection.status === 'expired' || new Date(connection.expirationDate) < new Date())).length
  const deletedCount = connections.filter(connection => connection.deleted).length

  const connectionStatus = (connection: Connection) => {
    if (connection.deleted) {
      return { label: 'Deleted', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' }
    }
    if (connection.status === 'expired' || new Date(connection.expirationDate) < new Date()) {
      return { label: 'Expired', className: 'bg-red-500/10 text-red-600 dark:text-red-400' }
    }
    if (connection.status === 'pending') {
      return { label: 'Pending', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' }
    }
    return { label: 'Active', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' }
  }

  const saveConnection = (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing || !editing.name.trim() || editing.monthlyPrice < 0) return
    updateConnection({ ...editing, name: editing.name.trim(), packageName: editing.name.trim() })
    setEditing(null)
  }

  const renewConnection = (connection: Connection) => {
    const expiration = new Date()
    expiration.setMonth(expiration.getMonth() + 1)
    updateConnection({ ...connection, status: 'active', expirationDate: expiration.toISOString().slice(0, 10) })
  }

  return (
    <main className="pb-10 pt-4 sm:pb-12 sm:pt-6">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 sm:space-y-6 sm:px-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Service management</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Connections</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">Manage every customer package, monthly bill, and service date from one place.</p>
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">{connections.length} total connections</div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {[
            ['All', connections.length, 'text-foreground'],
            ['Active', activeCount, 'text-emerald-600 dark:text-emerald-400'],
            ['Expired', expiredCount, 'text-red-600 dark:text-red-400'],
            ['Deleted', deletedCount, 'text-slate-500'],
          ].map(([label, value, color]) => (
            <article key={String(label)} className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
              <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
              <p className={`mt-2 text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search customer, zone, or package..." className="h-11 pl-10" />
            </div>
            <div className="grid grid-cols-3 gap-2 md:flex">
              {(['all', 'active', 'expired', 'deleted'] as const).map(item => (
                <Button key={item} type="button" variant={status === item ? 'default' : 'outline'} onClick={() => setStatus(item)} className="cursor-pointer capitalize">{item}</Button>
              ))}
            </div>
          </div>
        </section>

        {visibleConnections.length ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {visibleConnections.map(connection => {
              const customer = users.find(user => user.id === connection.userId)
              const badge = connectionStatus(connection)
              return (
                <article key={connection.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10"><Wifi className="h-5 w-5 text-primary" /></div>
                      <div className="min-w-0"><h2 className="truncate font-bold text-foreground">{connection.packageName || connection.name}</h2><p className="mt-0.5 text-xs text-muted-foreground">Connection #{connection.id.slice(-6)}</p></div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
                    <div className="min-w-0"><p className="flex items-center gap-1 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5" /> Customer</p><p className="mt-1 truncate font-medium text-foreground">{customer?.name || 'Unknown customer'}</p><p className="truncate text-xs text-muted-foreground">{customer?.customerId || customer?.phone || connection.userId}</p></div>
                    <div className="min-w-0"><p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Zone / area</p><p className="mt-1 truncate font-medium text-foreground">{customer?.zone || 'Unassigned'}</p><p className="truncate text-xs text-muted-foreground">{customer?.phone || 'No contact number'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Monthly bill</p><p className="mt-1 text-lg font-bold text-primary">৳{connection.monthlyPrice.toLocaleString()}</p></div>
                    <div><p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Expires</p><p className="mt-1 font-medium text-foreground">{new Date(connection.expirationDate).toLocaleDateString()}</p></div>
                  </div>

                  {!connection.deleted && <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button type="button" variant="outline" onClick={() => renewConnection(connection)} className="cursor-pointer">Renew</Button>
                    <Button type="button" variant="outline" onClick={() => setEditing({ ...connection })} className="cursor-pointer gap-2"><Pencil className="h-4 w-4" /> Edit</Button>
                  </div>}
                </article>
              )
            })}
          </section>
        ) : (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <Wifi className="mb-3 h-11 w-11 text-muted-foreground/35" />
            <h2 className="font-semibold text-foreground">No connections found</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Connections are automatically added when you create a customer with a package and monthly bill.</p>
          </section>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Edit connection">
          <form onSubmit={saveConnection} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-bold text-foreground">Edit connection</h2><p className="mt-1 text-sm text-muted-foreground">Update the customer package and billing information.</p></div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(null)} className="cursor-pointer"><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium">Package name<Input value={editing.name} onChange={event => setEditing(current => current && { ...current, name: event.target.value })} className="mt-2 h-11" required /></label>
              <label className="block text-sm font-medium">Monthly bill amount (৳)<Input type="number" min="0" value={editing.monthlyPrice} onChange={event => setEditing(current => current && { ...current, monthlyPrice: Number(event.target.value) })} className="mt-2 h-11" required /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">Activation date<Input type="date" value={editing.activationDate} onChange={event => setEditing(current => current && { ...current, activationDate: event.target.value })} className="mt-2 h-11" /></label>
                <label className="block text-sm font-medium">Expiration date<Input type="date" value={editing.expirationDate} onChange={event => setEditing(current => current && { ...current, expirationDate: event.target.value })} className="mt-2 h-11" /></label>
              </div>
              <label className="block text-sm font-medium">Status<select value={editing.status} onChange={event => setEditing(current => current && { ...current, status: event.target.value as Connection['status'] })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-foreground"><option value="active">Active</option><option value="expired">Expired</option><option value="pending">Pending</option></select></label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => setEditing(null)} className="cursor-pointer">Cancel</Button><Button type="submit" className="cursor-pointer">Save changes</Button></div>
          </form>
        </div>
      )}
    </main>
  )
}
