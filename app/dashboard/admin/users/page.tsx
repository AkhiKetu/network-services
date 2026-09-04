'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Pencil, Plus, Search, Users, X } from 'lucide-react'

import { UserCard } from '@/components/cards/UserCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Connection, User } from '@/lib/types'
import type { AdminCustomer } from '@/lib/types/admin'
import { CONNECTION_TYPES, CUSTOMER_PACKAGES, CUSTOMER_ZONES } from '@/lib/utils/customerOptions'

type FormValues = {
  customerId: string
  name: string
  username: string
  phone: string
  zone: string
  packageName: string
  monthlyPrice: string
  connectionType: string
  connectionDate: string
  onuReceivePower: string
  onuMacAddress: string
  ponNumber: string
  mikrotikPassword: string
  email: string
  password: string
}

const blank = (): FormValues => ({
  customerId: `CCN-${Date.now().toString().slice(-6)}`,
  name: '',
  username: '',
  phone: '',
  zone: '',
  packageName: '',
  monthlyPrice: '',
  connectionType: '',
  connectionDate: '',
  onuReceivePower: '',
  onuMacAddress: '',
  ponNumber: '',
  mikrotikPassword: '',
  email: '',
  password: '',
})

async function readJson(response: Response): Promise<{ error?: string; [key: string]: unknown }> {
  const body = await response.text()
  if (!body) return {}
  try { return JSON.parse(body) as { error?: string; [key: string]: unknown } } catch { return {} }
}

const toUser = (customer: AdminCustomer): User => ({
  id: customer.id,
  customerId: customer.customer_id ?? undefined,
  name: customer.name ?? 'Unnamed customer',
  username: customer.username ?? undefined,
  phone: customer.phone ?? '',
  zone: customer.zone ?? undefined,
  role: 'user',
  subscriptionStatus:
    customer.connection_status === 'active' ? 'active' : 'expired',
  joinDate: customer.created_at ?? '',
  deleted: Boolean(customer.deleted_at),
})

const toConnection = (
  customer: AdminCustomer
): Connection | undefined =>
  customer.connection
    ? {
        id: customer.connection.id,
        userId: customer.connection.user_id,
        name: customer.connection.package_name,
        packageName: customer.connection.package_name,
        monthlyPrice: customer.connection.monthly_price,
        connectionType: customer.connection.connection_type,
        connectionDate: customer.connection.connection_date,
        onuReceivePower: customer.connection.onu_receive_power,
        onuMacAddress: customer.connection.onu_mac_address,
        ponNumber: customer.connection.pon_number,
        mikrotikPassword: customer.connection.mikrotik_password,
        status:
          customer.connection_status === 'active'
            ? 'active'
            : 'expired',
        activationDate: customer.connection.start_date,
        expirationDate: customer.connection.renewal_date,
        deleted: Boolean(customer.connection.deleted_at),
      }
    : undefined

export default function AdminUsers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<
    'all' | 'active' | 'inactive' | 'deleted'
  >('all')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState<AdminCustomer | null>(null)
  const [adding, setAdding] = useState(false)

  const [form, setForm] = useState<FormValues>(blank)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [showMikroTikPassword, setShowMikroTikPassword] = useState(false)

  const setField = (field: keyof FormValues, value: string) => {
    setForm(current => ({
      ...current,
      [field]: value,
    }))
  }

  const selectPackage = (packageName: string) => {
    const customerPackage = CUSTOMER_PACKAGES.find(
      item => item.name === packageName
    )

    setForm(current => ({
      ...current,
      packageName,
      monthlyPrice: customerPackage
        ? String(customerPackage.monthlyPrice)
        : '',
    }))
  }

  const load = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/admin/customers', {
        cache: 'no-store',
      })

      const data = await readJson(response)

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to load customers.')
      }

      const profiles = data.profiles as AdminCustomer[]
      const connections =
        data.connections as AdminCustomer['connection'][]
      const billings =
        data.billings as AdminCustomer['unpaid_billing'][]

      setCustomers(
        profiles.map(profile => {
          const connection =
            connections.find(
              item => item?.user_id === profile.id
            ) ?? null

          const unpaid_billing = connection
            ? billings.find(
                item =>
                  item?.connection_id === connection.id &&
                  item.status === 'unpaid'
              ) ?? null
            : null

          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const renewal = connection?.renewal_date
            ? new Date(`${connection.renewal_date}T12:00:00`)
            : null

          const connection_status = !connection
            ? null
            : connection.deleted_at
              ? 'deleted'
              : renewal && renewal < today
                ? 'expired'
                : 'active'

          return {
            ...profile,
            connection,
            unpaid_billing,
            connection_status,
          }
        })
      )

      setError('')
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to load customers.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const visible = useMemo(() => {
    return customers.filter(customer => {
      const text = `
        ${customer.name ?? ''}
        ${customer.username ?? ''}
        ${customer.phone ?? ''}
        ${customer.customer_id ?? ''}
        ${customer.zone ?? ''}
      `.toLowerCase()

      const matchingStatus =
        status === 'all' ||
        (status === 'deleted'
          ? Boolean(customer.deleted_at)
          : !customer.deleted_at &&
            (status === 'active'
              ? customer.connection_status === 'active'
              : customer.connection_status !== 'active'))

      return (
        text.includes(query.toLowerCase()) &&
        matchingStatus
      )
    })
  }, [customers, query, status])

  const active = customers.filter(
    customer =>
      !customer.deleted_at &&
      customer.connection_status === 'active'
  ).length

  const monthlyBilling = customers
    .filter(
      customer =>
        !customer.deleted_at &&
        customer.connection_status !== 'deleted'
    )
    .reduce(
      (sum, customer) =>
        sum + (customer.connection?.monthly_price ?? 0),
      0
    )

  const openAdd = () => {
    setEditing(null)
    setForm(blank())
    setFormError('')
    setAdding(true)
  }

  const closeAdd = () => {
    if (saving) return

    setAdding(false)
    setFormError('')
  }

  const openEdit = (customer: AdminCustomer) => {
    setAdding(false)
    setFormError('')
    setEditing(customer)

    setForm({
      customerId: customer.customer_id ?? '',
      name: customer.name ?? '',
      username: customer.username ?? '',
      phone: customer.phone ?? '',
      zone: customer.zone ?? '',
      packageName:
        customer.connection?.package_name ?? '',
      monthlyPrice: String(
        customer.connection?.monthly_price ?? ''
      ),
      connectionType: customer.connection?.connection_type ?? '',
      connectionDate: customer.connection?.connection_date ?? '',
      onuReceivePower: customer.connection?.onu_receive_power ?? '',
      onuMacAddress: customer.connection?.onu_mac_address ?? '',
      ponNumber: customer.connection?.pon_number ?? '',
      mikrotikPassword: customer.connection?.mikrotik_password ?? '',
      email: '',
      password: '',
    })
  }

  const create = async (event: React.FormEvent) => {
    event.preventDefault()

    if (saving) return

    const monthlyPrice = Number(form.monthlyPrice)

    if (
      !form.customerId.trim() ||
      !form.name.trim() ||
      !form.username.trim() ||
      !form.zone.trim() ||
      !form.phone.trim() ||
      !form.packageName.trim() ||
      !form.connectionType ||
      !form.email.trim() ||
      !form.password
    ) {
      setFormError('Please complete all required fields.')
      return
    }

    if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
      setFormError('Enter a valid monthly bill amount.')
      return
    }

    if (form.password.length < 8) {
      setFormError(
        'Temporary password must be at least 8 characters.'
      )
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const response = await fetch(
        '/api/admin/customers',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: form.customerId.trim(),
            name: form.name.trim(),
            username: form.username.trim(),
            zone: form.zone.trim(),
            phone: form.phone.trim(),
            packageName: form.packageName.trim(),
            monthlyPrice,
            connectionType: form.connectionType,
            connectionDate: form.connectionDate,
            onuReceivePower: form.onuReceivePower,
            onuMacAddress: form.onuMacAddress,
            ponNumber: form.ponNumber,
            mikrotikPassword: form.mikrotikPassword,
            email: form.email.trim(),
            password: form.password,
          }),
        }
      )

      const data = await readJson(response)

      if (!response.ok) {
        throw new Error(
          data.error ?? 'Unable to create customer.'
        )
      }

      setAdding(false)
      setForm(blank())

      await load()
    } catch (cause) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : 'Unable to create customer.'
      )
    } finally {
      setSaving(false)
    }
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!editing?.connection || saving) return

    const monthlyPrice = Number(form.monthlyPrice)

    if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
      setFormError('Enter a valid monthly bill amount.')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const response = await fetch(
        '/api/admin/customers',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editing.id,
            connectionId: editing.connection.id,
            customerId: form.customerId.trim(),
            name: form.name.trim(),
            username: form.username.trim(),
            phone: form.phone.trim(),
            zone: form.zone.trim(),
            packageName: form.packageName.trim(),
            monthlyPrice,
            connectionType: form.connectionType,
            connectionDate: form.connectionDate,
            onuReceivePower: form.onuReceivePower,
            onuMacAddress: form.onuMacAddress,
            ponNumber: form.ponNumber,
            mikrotikPassword: form.mikrotikPassword,
          }),
        }
      )

      const data = await readJson(response)

      if (!response.ok) {
        throw new Error(
          data.error ?? 'Unable to update customer.'
        )
      }

      setEditing(null)

      await load()
    } catch (cause) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : 'Unable to update customer.'
      )
    } finally {
      setSaving(false)
    }
  }

  const remove = async (customer: AdminCustomer) => {
    if (
      !window.confirm(
        `Deactivate ${customer.name ?? 'this customer'}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/customers?id=${customer.id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await readJson(response)

      if (!response.ok) {
        throw new Error(
          data.error ?? 'Unable to deactivate customer.'
        )
      }

      await load()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to deactivate customer.'
      )
    }
  }

  const editFields: Array<
    [keyof FormValues, string, string]
  > = [
    ['customerId', 'Customer ID', 'CCN-000001'],
    ['username', 'Username', 'arun01'],
    ['name', 'Customer Name', 'Full name'],
    ['zone', 'Zone / area', 'Area or zone'],
    ['phone', 'Contact number', '01XXXXXXXXX'],
    ['packageName', 'Package name', 'e.g. Gold 50 Mbps'],
    ['monthlyPrice', 'Monthly bill amount (৳)', '0'],
    ['connectionDate', 'Connection Date', 'YYYY-MM-DD'],
    ['onuReceivePower', 'ONU Receive Power', '-25 dBm'],
    ['onuMacAddress', 'ONU MAC Address', '00:00:00:00:00:00'],
    ['ponNumber', 'PON Number', 'PON-1'],
    ['mikrotikPassword', 'MikroTik Password', 'Network credential'],
  ]

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Customer management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Users
          </h1>

          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Manage customer accounts, packages, zones and
            monthly bills.
          </p>
        </div>

        <Button
          onClick={openAdd}
          className="w-full cursor-pointer gap-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add customer
        </Button>
      </section>

      {/* Statistics */}
      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total customers
          </p>

          <p className="mt-2 text-2xl font-bold text-foreground">
            {
              customers.filter(
                customer => !customer.deleted_at
              ).length
            }
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Active accounts
          </p>

          <p className="mt-2 text-2xl font-bold text-foreground">
            {active}
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Monthly billing
          </p>

          <p className="mt-2 text-2xl font-bold text-foreground">
            ৳{monthlyBilling.toLocaleString()}
          </p>
        </article>
      </section>

      {/* Search */}
      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

            <Input
              value={query}
              onChange={event =>
                setQuery(event.target.value)
              }
              placeholder="Search name, ID, phone or zone..."
              className="h-11 pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            {(
              [
                'all',
                'active',
                'inactive',
                'deleted',
              ] as const
            ).map(item => (
              <Button
                key={item}
                variant={
                  status === item ? 'default' : 'outline'
                }
                onClick={() => setStatus(item)}
                className="cursor-pointer capitalize"
              >
                {item}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </section>

      {/* Customers */}
      {loading ? (
        <section className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
          Loading customers…
        </section>
      ) : visible.length ? (
        <section className="grid gap-4 md:grid-cols-2">
          {visible.map(customer => (
            <UserCard
              key={customer.id}
              user={toUser(customer)}
              connection={toConnection(customer)}
              showMikroTikPassword
              onManage={
                customer.deleted_at
                  ? undefined
                  : () => openEdit(customer)
              }
              onDelete={
                customer.deleted_at
                  ? undefined
                  : () => void remove(customer)
              }
            />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />

          <h2 className="font-semibold text-foreground">
            No customers found
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a customer or adjust the selected filter.
          </p>
        </section>
      )}

      {/* ADD CUSTOMER MODAL */}
      {adding && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={create}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-primary/20 bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  Customer registration
                </p>

                <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                  Add customer
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Customer, area, package and bill details are
                  saved together.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeAdd}
                disabled={saving}
                className="cursor-pointer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-foreground">
                Customer ID
                <Input
                  value={form.customerId}
                  onChange={event =>
                    setField(
                      'customerId',
                      event.target.value
                    )
                  }
                  placeholder="CCN-000001"
                  className="mt-2 h-11"
                  required
                />
              </label>

              <label className="text-sm font-medium text-foreground">
                Username
                <Input
                  value={form.username}
                  onChange={event => setField('username', event.target.value)}
                  placeholder="arun01"
                  className="mt-2 h-11"
                  required
                />
              </label>

              <label className="text-sm font-medium text-foreground">
                MikroTik Password
                <div className="relative mt-2">
                  <Input
                    type={showMikroTikPassword ? 'text' : 'password'}
                    value={form.mikrotikPassword}
                    onChange={event => setField('mikrotikPassword', event.target.value)}
                    placeholder="Network credential"
                    className="h-11 pr-10"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-11 w-10" onClick={() => setShowMikroTikPassword(value => !value)} aria-label={showMikroTikPassword ? 'Hide MikroTik password' : 'Show MikroTik password'}>
                    {showMikroTikPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </label>

              <label className="text-sm font-medium text-foreground">
                Customer Name
                <Input
                  value={form.name}
                  onChange={event =>
                    setField('name', event.target.value)
                  }
                  placeholder="Full name"
                  className="mt-2 h-11"
                  required
                />
              </label>

              <label className="text-sm font-medium text-foreground">
                Zone / area
                <select
                  value={form.zone}
                  onChange={event =>
                    setField('zone', event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"
                  required
                >
                  <option value="">Select zone</option>
                  {CUSTOMER_ZONES.map(zone => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-foreground">
                Contact number
                <Input
                  value={form.phone}
                  onChange={event =>
                    setField('phone', event.target.value)
                  }
                  placeholder="01XXXXXXXXX"
                  className="mt-2 h-11"
                  required
                />
              </label>

              <label className="text-sm font-medium text-foreground">
                Package
                <select
                  value={form.packageName}
                  onChange={event =>
                    selectPackage(event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"
                  required
                >
                  <option value="">Select package</option>
                  {CUSTOMER_PACKAGES.map(customerPackage => (
                    <option
                      key={customerPackage.name}
                      value={customerPackage.name}
                    >
                      {customerPackage.name} — ৳{customerPackage.monthlyPrice}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-foreground">
                Monthly bill amount (৳)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlyPrice}
                  readOnly
                  placeholder="0"
                  className="mt-2 h-11"
                  required
                />
              </label>

              <label className="text-sm font-medium text-foreground">
                Connection Type
                <select
                  value={form.connectionType}
                  onChange={event =>
                    setField('connectionType', event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"
                  required
                >
                  <option value="">Select connection type</option>
                  {CONNECTION_TYPES.map(connectionType => (
                    <option key={connectionType} value={connectionType}>
                      {connectionType}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-foreground">
                Connection Date
                <Input
                  type="date"
                  value={form.connectionDate}
                  onChange={event => setField('connectionDate', event.target.value)}
                  className="mt-2 h-11"
                />
              </label>

              <label className="text-sm font-medium text-foreground">
                ONU Receive Power
                <Input value={form.onuReceivePower} onChange={event => setField('onuReceivePower', event.target.value)} placeholder="-25 dBm" className="mt-2 h-11" />
              </label>

              <label className="text-sm font-medium text-foreground">
                ONU MAC Address
                <Input value={form.onuMacAddress} onChange={event => setField('onuMacAddress', event.target.value)} placeholder="00:00:00:00:00:00" className="mt-2 h-11" />
              </label>

              <label className="text-sm font-medium text-foreground">
                PON Number
                <Input value={form.ponNumber} onChange={event => setField('ponNumber', event.target.value)} placeholder="PON-1" className="mt-2 h-11" />
              </label>

              <label className="text-sm font-medium text-foreground">
                Email
                <Input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={event =>
                    setField('email', event.target.value)
                  }
                  placeholder="customer@example.com"
                  className="mt-2 h-11"
                  required
                />
              </label>

              <label className="text-sm font-medium text-foreground">
                Temporary password
                <Input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={form.password}
                  onChange={event =>
                    setField(
                      'password',
                      event.target.value
                    )
                  }
                  placeholder="Minimum 8 characters"
                  className="mt-2 h-11"
                  required
                />
              </label>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              The temporary password is used only to create
              the customer&apos;s Supabase login account. It
              is not stored in the customer profile.
            </p>

            {formError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500"
              >
                {formError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeAdd}
                disabled={saving}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="cursor-pointer gap-2"
              >
                <Plus className="h-4 w-4" />
                {saving
                  ? 'Creating...'
                  : 'Create customer'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {editing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={save}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Edit customer
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Customer and package details are saved to
                  Supabase.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={saving}
                onClick={() => setEditing(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {editFields.map(
                ([field, label, placeholder]) => (
                  <label
                    key={field}
                    className="relative text-sm font-medium text-foreground"
                  >
                    {label}

                    <Input
                      type={
                        field === 'monthlyPrice'
                          ? 'number'
                          : field === 'mikrotikPassword'
                            ? showMikroTikPassword ? 'text' : 'password'
                          : 'text'
                      }
                      min={
                        field === 'monthlyPrice'
                          ? '0'
                          : undefined
                      }
                      value={form[field]}
                      onChange={event =>
                        setField(
                          field,
                          event.target.value
                        )
                      }
                      placeholder={placeholder}
                      className={`mt-2 h-11 ${field === 'mikrotikPassword' ? 'pr-10' : ''}`}
                      required
                    />
                    {field === 'mikrotikPassword' && (
                      <Button type="button" variant="ghost" size="icon" className="absolute bottom-0 right-0 h-11 w-10" onClick={() => setShowMikroTikPassword(value => !value)} aria-label={showMikroTikPassword ? 'Hide MikroTik password' : 'Show MikroTik password'}>
                        {showMikroTikPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                  </label>
                )
              )}

              <label className="text-sm font-medium text-foreground">
                Connection Type
                <select
                  value={form.connectionType}
                  onChange={event =>
                    setField('connectionType', event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"
                  required
                >
                  <option value="">Select connection type</option>
                  {CONNECTION_TYPES.map(connectionType => (
                    <option key={connectionType} value={connectionType}>
                      {connectionType}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {formError && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600"
              >
                {formError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
