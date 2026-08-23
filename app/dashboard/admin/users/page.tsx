'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { UserCard } from '@/components/cards/UserCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Search, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { Connection, User } from '@/lib/types'

type FormValues = {
  customerId: string
  name: string
  phone: string
  zone: string
  packageName: string
  monthlyPrice: string
  password: string
}

const blankForm = (): FormValues => ({
  customerId: `CCN-${Date.now().toString().slice(-6)}`,
  name: '', phone: '', zone: '', packageName: '', monthlyPrice: '', password: '',
})

export default function AdminUsers() {
  const { users, connections, addUser, updateUser, deleteUser, addConnection, updateConnection, isPhoneTaken } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all')
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<FormValues>(blankForm)
  const [formError, setFormError] = useState('')

  const regularUsers = users.filter(user => user.role === 'user')
  const filteredUsers = regularUsers.filter(user => {
    const matchesSearch = [user.name, user.phone, user.customerId, user.zone]
      .filter(Boolean).some(value => value!.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'deleted' ? user.deleted === true : !user.deleted && (selectedStatus === 'active' ? user.subscriptionStatus === 'active' : user.subscriptionStatus !== 'active'))
    return matchesSearch && matchesStatus
  })

  const getConnection = (userId: string) => connections.find(connection => connection.userId === userId)

  const openAdd = () => {
    setForm(blankForm())
    setFormError('')
    setEditingUser(null)
    setFormMode('add')
  }

  const openEdit = (user: User) => {
    const connection = getConnection(user.id)
    setEditingUser(user)
    setForm({
      customerId: user.customerId || user.id,
      name: user.name,
      phone: user.phone,
      zone: user.zone || '',
      packageName: connection?.packageName || connection?.name || '',
      monthlyPrice: connection ? String(connection.monthlyPrice) : '',
      password: user.password,
    })
    setFormError('')
    setFormMode('edit')
  }

  const closeForm = () => setFormMode(null)
  const setField = (field: keyof FormValues, value: string) => setForm(current => ({ ...current, [field]: value }))

  const saveUser = (event: React.FormEvent) => {
    event.preventDefault()
    const monthlyPrice = Number(form.monthlyPrice)
    if (!form.customerId.trim() || !form.name.trim() || !form.phone.trim() || !form.zone.trim() || !form.packageName.trim() || !form.password || !Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
      setFormError('Complete every field and enter a valid monthly bill amount.')
      return
    }
    if ((!editingUser || editingUser.phone !== form.phone.trim()) && isPhoneTaken(form.phone.trim())) {
      setFormError('This contact number is already registered.')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    if (formMode === 'add') {
      const userId = `user-${Date.now()}`
      const connectionId = `conn-${Date.now()}`
      addUser({ id: userId, customerId: form.customerId.trim(), name: form.name.trim(), phone: form.phone.trim(), password: form.password, zone: form.zone.trim(), role: 'user', subscriptionStatus: 'active', joinDate: today, totalPaid: 0, createdBy: 'admin-1' })
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + 1)
      addConnection({ id: connectionId, userId, name: form.packageName.trim(), packageName: form.packageName.trim(), activationDate: today, expirationDate: expiry.toISOString().split('T')[0], status: 'active', monthlyPrice })
    } else if (editingUser) {
      updateUser({ ...editingUser, customerId: form.customerId.trim(), name: form.name.trim(), phone: form.phone.trim(), password: form.password, zone: form.zone.trim() })
      const existingConnection = getConnection(editingUser.id)
      if (existingConnection) {
        updateConnection({ ...existingConnection, name: form.packageName.trim(), packageName: form.packageName.trim(), monthlyPrice })
      } else {
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + 1)
      addConnection({ id: `conn-${Date.now()}`, userId: editingUser.id, name: form.packageName.trim(), packageName: form.packageName.trim(), activationDate: today, expirationDate: expiry.toISOString().split('T')[0], status: 'active', monthlyPrice })
      }
    }
    closeForm()
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Customer management</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">Create and manage customer accounts, packages, zones and monthly bills.</p>
        </div>
        <Button onClick={openAdd} className="w-full cursor-pointer gap-2 sm:w-auto"><Plus className="h-4 w-4" /> Add customer</Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[["Total customers", regularUsers.length, 'text-foreground'], ['Active accounts', regularUsers.filter(user => user.subscriptionStatus === 'active').length, 'text-emerald-600'], ['Monthly billing', `৳${connections.filter(connection => connection.status === 'active').reduce((sum, connection) => sum + connection.monthlyPrice, 0).toLocaleString()}`, 'text-primary']].map(([label, value, color]) => (
          <article key={String(label)} className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p></article>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search name, ID, phone or zone..." className="h-11 pl-10" /></div>
        <div className="grid grid-cols-2 gap-2 sm:flex">{(['all', 'active', 'inactive', 'deleted'] as const).map(status => <Button key={status} variant={selectedStatus === status ? 'default' : 'outline'} onClick={() => setSelectedStatus(status)} className="cursor-pointer capitalize">{status}</Button>)}</div>
        </div>
      </section>

      {filteredUsers.length ? <section className="grid gap-4 md:grid-cols-2">{filteredUsers.map(user => <UserCard key={user.id} user={user} connection={getConnection(user.id)} onManage={user.deleted ? undefined : openEdit} onDelete={user.deleted ? undefined : () => { if (window.confirm(`Delete ${user.name}? They will remain available in the Deleted filter.`)) deleteUser(user.id) }} />)}</section> : <section className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm"><Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" /><h2 className="font-semibold text-foreground">{selectedStatus === 'deleted' ? 'No deleted users' : 'No customers yet'}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedStatus === 'deleted' ? 'Deleted customers will appear here.' : 'Add your first customer to create their connection and billing record.'}</p></section>}

      {formMode && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
        <form onSubmit={saveUser} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-foreground">{formMode === 'add' ? 'Add customer' : 'Edit customer'}</h2><p className="mt-1 text-sm text-muted-foreground">Customer, area, package and bill details are saved together.</p></div><Button type="button" variant="ghost" size="icon" onClick={closeForm} className="cursor-pointer"><X className="h-5 w-5" /></Button></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[['customerId', 'Customer ID', 'CCN-000001'], ['name', 'Customer name', 'Full name'], ['zone', 'Zone / area', 'Area or zone'], ['phone', 'Contact number', '01XXXXXXXXX'], ['packageName', 'Package name', 'e.g. Gold 50 Mbps'], ['monthlyPrice', 'Monthly bill amount (৳)', '0']].map(([field, label, placeholder]) => <label key={field} className="block text-sm font-medium text-foreground">{label}<Input type={field === 'monthlyPrice' ? 'number' : 'text'} min={field === 'monthlyPrice' ? '0' : undefined} value={form[field as keyof FormValues]} onChange={event => setField(field as keyof FormValues, event.target.value)} placeholder={placeholder} className="mt-2 h-11" required /></label>)}
            <label className="block text-sm font-medium text-foreground sm:col-span-2">{formMode === 'add' ? 'Temporary password' : 'Password'}<Input type="text" value={form.password} onChange={event => setField('password', event.target.value)} className="mt-2 h-11" required /></label>
          </div>
          {formError && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600">{formError}</p>}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={closeForm} className="cursor-pointer">Cancel</Button><Button type="submit" className="cursor-pointer gap-2"><Pencil className="h-4 w-4" /> {formMode === 'add' ? 'Create customer' : 'Save changes'}</Button></div>
        </form>
      </div>}
    </main>
  )
}
