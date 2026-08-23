'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, Plus, X, Pencil } from 'lucide-react'

import { useApp } from '@/lib/context/AppContext'
import { UserCard } from '@/components/cards/UserCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Connection, User } from '@/lib/types'

type FormValues = { customerId: string; name: string; email: string; phone: string; zone: string; packageName: string; monthlyPrice: string; password: string }
type RemoteProfile = Pick<User, 'id' | 'customer_id' | 'name' | 'phone' | 'zone' | 'role' | 'created_at' | 'deleted_at'>
type RemoteConnection = { id: string; user_id: string; package_name: string; monthly_price: number | string; status: Connection['status']; start_date: string; renewal_date: string; deleted_at: string | null }

const blankForm = (): FormValues => ({ customerId: `CCN-${Date.now().toString().slice(-6)}`, name: '', email: '', phone: '', zone: '', packageName: '', monthlyPrice: '', password: '' })
const toPortalUser = (profile: RemoteProfile): User => ({ id: profile.id, customer_id: profile.customer_id, customerId: profile.customer_id ?? undefined, name: profile.name, phone: profile.phone, zone: profile.zone ?? undefined, role: profile.role, joinDate: profile.created_at ?? new Date().toISOString(), subscriptionStatus: profile.deleted_at ? 'inactive' : 'active', deleted: Boolean(profile.deleted_at), deleted_at: profile.deleted_at })
const toPortalConnection = (connection: RemoteConnection): Connection => ({ id: connection.id, userId: connection.user_id, name: connection.package_name, packageName: connection.package_name, monthlyPrice: Number(connection.monthly_price), status: connection.status, activationDate: connection.start_date, expirationDate: connection.renewal_date, deleted: Boolean(connection.deleted_at) })

export default function AdminUsers() {
  const { users: localUsers, connections: localConnections, updateUser, deleteUser, addConnection, updateConnection } = useApp()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all')
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<FormValues>(blankForm)
  const [formError, setFormError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [remoteProfiles, setRemoteProfiles] = useState<RemoteProfile[]>([])
  const [remoteConnections, setRemoteConnections] = useState<RemoteConnection[]>([])
  const [loadError, setLoadError] = useState('')

  const loadCustomers = async () => {
    const response = await fetch('/api/admin/customers', { cache: 'no-store' })
    if (!response.ok) {
      setLoadError('Unable to load Supabase customers. Please refresh and try again.')
      return
    }
    const data = await response.json()
    setRemoteProfiles(data.profiles ?? [])
    setRemoteConnections(data.connections ?? [])
    setLoadError('')
  }

  useEffect(() => { void loadCustomers() }, [])

  const users = [...remoteProfiles.map(toPortalUser), ...localUsers.filter(user => !remoteProfiles.some(profile => profile.id === user.id))]
  const connections = [...remoteConnections.map(toPortalConnection), ...localConnections.filter(connection => !remoteConnections.some(remote => remote.id === connection.id))]
  const regularUsers = users.filter(user => user.role === 'user')
  const filteredUsers = regularUsers.filter(user => {
    const matchesSearch = [user.name, user.phone, user.customerId, user.zone].filter(Boolean).some(value => value!.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'deleted' ? user.deleted : !user.deleted && (selectedStatus === 'active' ? user.subscriptionStatus === 'active' : user.subscriptionStatus !== 'active'))
    return matchesSearch && matchesStatus
  })
  const getConnection = (userId: string) => connections.find(connection => connection.userId === userId)
  const setField = (field: keyof FormValues, value: string) => setForm(current => ({ ...current, [field]: value }))
  const closeForm = () => { if (!isCreating) setFormMode(null) }
  const openAdd = () => { setForm(blankForm()); setFormError(''); setEditingUser(null); setFormMode('add') }
  const openEdit = (user: User) => {
    const connection = getConnection(user.id)
    setEditingUser(user)
    setForm({ customerId: user.customerId || user.id, name: user.name, email: user.email || '', phone: user.phone, zone: user.zone || '', packageName: connection?.packageName || connection?.name || '', monthlyPrice: connection ? String(connection.monthlyPrice) : '', password: '' })
    setFormError(''); setFormMode('edit')
  }

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault()
    const monthlyPrice = Number(form.monthlyPrice)
    if (!form.customerId.trim() || !form.name.trim() || !form.phone.trim() || !form.zone.trim() || !form.packageName.trim() || !Number.isFinite(monthlyPrice) || monthlyPrice < 0) { setFormError('Complete every field and enter a valid monthly bill amount.'); return }

    if (formMode === 'add') {
      if (!form.email.trim() || !form.password) { setFormError('Email and a temporary password are required.'); return }
      setIsCreating(true); setFormError('')
      try {
        const response = await fetch('/api/admin/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, monthlyPrice }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to create customer.')
        await loadCustomers()
        router.refresh()
        setFormMode(null)
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Unable to create customer.')
      } finally { setIsCreating(false) }
      return
    }

    if (editingUser) {
      updateUser({ ...editingUser, customerId: form.customerId.trim(), name: form.name.trim(), phone: form.phone.trim(), zone: form.zone.trim() })
      const existingConnection = getConnection(editingUser.id)
      if (existingConnection) updateConnection({ ...existingConnection, name: form.packageName.trim(), packageName: form.packageName.trim(), monthlyPrice })
      else {
        const today = new Date().toISOString().slice(0, 10)
        addConnection({ id: `conn-${Date.now()}`, userId: editingUser.id, name: form.packageName.trim(), packageName: form.packageName.trim(), activationDate: today, expirationDate: today, status: 'active', monthlyPrice })
      }
      setFormMode(null)
    }
  }

  const fields: Array<[keyof FormValues, string, string]> = [['customerId', 'Customer ID', 'CCN-000001'], ['name', 'Customer name', 'Full name'], ['zone', 'Zone / area', 'Area or zone'], ['phone', 'Contact number', '01XXXXXXXXX'], ['packageName', 'Package name', 'e.g. Gold 50 Mbps'], ['monthlyPrice', 'Monthly bill amount (৳)', '0']]

  return <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Customer management</p><h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Users</h1><p className="mt-1 text-sm text-muted-foreground sm:text-base">Create and manage customer accounts, packages, zones and monthly bills.</p></div><Button onClick={openAdd} className="w-full cursor-pointer gap-2 sm:w-auto"><Plus className="h-4 w-4" /> Add customer</Button></section>
    <section className="grid gap-3 sm:grid-cols-3">{[['Total customers', regularUsers.length, 'text-foreground'], ['Active accounts', regularUsers.filter(user => user.subscriptionStatus === 'active').length, 'text-emerald-600'], ['Monthly billing', `৳${connections.filter(connection => connection.status === 'active').reduce((sum, connection) => sum + connection.monthlyPrice, 0).toLocaleString()}`, 'text-primary']].map(([label, value, color]) => <article key={String(label)} className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p></article>)}</section>
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search name, ID, phone or zone..." className="h-11 pl-10" /></div><div className="grid grid-cols-2 gap-2 sm:flex">{(['all', 'active', 'inactive', 'deleted'] as const).map(status => <Button key={status} variant={selectedStatus === status ? 'default' : 'outline'} onClick={() => setSelectedStatus(status)} className="cursor-pointer capitalize">{status}</Button>)}</div></div>{loadError && <p role="alert" className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-600">{loadError}</p>}</section>
    {filteredUsers.length ? <section className="grid gap-4 md:grid-cols-2">{filteredUsers.map(user => <UserCard key={user.id} user={user} connection={getConnection(user.id)} onManage={user.deleted ? undefined : openEdit} onDelete={user.deleted ? undefined : () => { if (window.confirm(`Delete ${user.name}? They will remain available in the Deleted filter.`)) deleteUser(user.id) }} />)}</section> : <section className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm"><Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" /><h2 className="font-semibold text-foreground">{selectedStatus === 'deleted' ? 'No deleted users' : 'No customers yet'}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedStatus === 'deleted' ? 'Deleted customers will appear here.' : 'Add your first customer to create their connection and billing record.'}</p></section>}
    {formMode && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true"><form onSubmit={saveUser} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-foreground">{formMode === 'add' ? 'Add customer' : 'Edit customer'}</h2><p className="mt-1 text-sm text-muted-foreground">Customer, area, package and bill details are saved together.</p></div><Button type="button" variant="ghost" size="icon" onClick={closeForm} disabled={isCreating} className="cursor-pointer"><X className="h-5 w-5" /></Button></div><div className="grid gap-4 sm:grid-cols-2">{fields.map(([field, label, placeholder]) => <label key={field} className="block text-sm font-medium text-foreground">{label}<Input type={field === 'monthlyPrice' ? 'number' : 'text'} min={field === 'monthlyPrice' ? '0' : undefined} value={form[field]} onChange={event => setField(field, event.target.value)} placeholder={placeholder} className="mt-2 h-11" required /></label>)}{formMode === 'add' && <><label className="block text-sm font-medium text-foreground">Email<Input type="email" autoComplete="email" value={form.email} onChange={event => setField('email', event.target.value)} placeholder="customer@example.com" className="mt-2 h-11" required /></label><label className="block text-sm font-medium text-foreground">Temporary password<Input type="password" autoComplete="new-password" value={form.password} onChange={event => setField('password', event.target.value)} placeholder="At least 8 characters" className="mt-2 h-11" required /></label></>}</div>{formError && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600">{formError}</p>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={closeForm} disabled={isCreating} className="cursor-pointer">Cancel</Button><Button type="submit" disabled={isCreating} className="cursor-pointer gap-2"><Pencil className="h-4 w-4" /> {isCreating ? 'Creating...' : formMode === 'add' ? 'Create customer' : 'Save changes'}</Button></div></form></div>}
  </main>
}
