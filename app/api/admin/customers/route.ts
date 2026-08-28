import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getCustomerPackage, isConnectionType, isCustomerZone } from '@/lib/utils/customerOptions'
import { getRenewalDate } from '@/lib/utils/dateUtils'

export const runtime = 'nodejs'

type CustomerPayload = {
  customerId?: unknown
  name?: unknown
  username?: unknown
  email?: unknown
  phone?: unknown
  zone?: unknown
  packageName?: unknown
  monthlyPrice?: unknown
  connectionType?: unknown
  connectionDate?: unknown
  onuReceivePower?: unknown
  onuMacAddress?: unknown
  ponNumber?: unknown
  mikrotikPassword?: unknown
  password?: unknown
}

type NormalizedCustomer = {
  customerId: string
  name: string
  username: string
  email: string
  phone: string
  zone: string
  packageName: string
  monthlyPrice: number
  connectionType: string
  connectionDate: string
  onuReceivePower: string
  onuMacAddress: string
  ponNumber: string
  mikrotikPassword: string
  password: string
}

type CustomerResult =
  | { success: true; customer: NormalizedCustomer }
  | { success: false; error: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function normalizeCustomer(payload: CustomerPayload): CustomerResult {
  const customerId =
    typeof payload.customerId === 'string' ? payload.customerId.trim() : ''

  const name =
    typeof payload.name === 'string' ? payload.name.trim() : ''
  const username =
    typeof payload.username === 'string' ? payload.username.trim().toLowerCase() : ''

  const email =
    typeof payload.email === 'string'
      ? payload.email.trim().toLowerCase()
      : ''

  const phone =
    typeof payload.phone === 'string' ? payload.phone.trim() : ''

  const zone =
    typeof payload.zone === 'string' ? payload.zone.trim() : ''

  const packageName =
    typeof payload.packageName === 'string'
      ? payload.packageName.trim()
      : ''

  const connectionType =
    typeof payload.connectionType === 'string'
      ? payload.connectionType.trim()
      : ''

  const password =
    typeof payload.password === 'string' ? payload.password : ''
  const connectionDate = typeof payload.connectionDate === 'string' ? payload.connectionDate.trim() : ''
  const onuReceivePower = typeof payload.onuReceivePower === 'string' ? payload.onuReceivePower.trim() : ''
  const onuMacAddress = typeof payload.onuMacAddress === 'string' ? payload.onuMacAddress.trim() : ''
  const ponNumber = typeof payload.ponNumber === 'string' ? payload.ponNumber.trim() : ''
  const mikrotikPassword = typeof payload.mikrotikPassword === 'string' ? payload.mikrotikPassword : ''

  if (
    !customerId ||
    !name ||
    !username ||
    !email ||
    !phone ||
    !zone ||
    !packageName ||
    !connectionType
  ) {
    return {
      success: false,
      error: 'Complete all customer fields.',
    }
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      success: false,
      error: 'Enter a valid email address.',
    }
  }

  if (password.length < 8) {
    return {
      success: false,
      error: 'Temporary password must be at least 8 characters.',
    }
  }

  if (!isCustomerZone(zone)) {
    return {
      success: false,
      error: 'Select a valid customer zone.',
    }
  }

  const customerPackage = getCustomerPackage(packageName)

  if (!customerPackage) {
    return {
      success: false,
      error: 'Select a valid customer package.',
    }
  }

  if (!isConnectionType(connectionType)) {
    return {
      success: false,
      error: 'Select a valid connection type.',
    }
  }

  return {
    success: true,
    customer: {
      customerId,
      name,
      username,
      email,
      phone,
      zone,
      packageName,
      monthlyPrice: customerPackage.monthlyPrice,
      connectionType,
      connectionDate,
      onuReceivePower,
      onuMacAddress,
      ponNumber,
      mikrotikPassword,
      password,
    },
  }
}

async function requirePrivilegedUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: apiError('You must be signed in.', 401),
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, deleted_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile || profile.deleted_at) {
    return {
      error: apiError('Your portal profile is unavailable.', 403),
    }
  }

  if (profile.role !== 'owner' && profile.role !== 'admin') {
    return {
      error: apiError(
        'You are not allowed to manage customers.',
        403
      ),
    }
  }

  return {
    user,
    supabase,
  }
}

async function emailAlreadyExists(email: string) {
  const admin = createAdminClient()

  const pageSize = 1000
  let page = 1

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: pageSize,
    })

    if (error) {
      throw error
    }

    const exists = data.users.some(
      user => user.email?.toLowerCase() === email
    )

    if (exists) {
      return true
    }

    if (data.users.length < pageSize) {
      return false
    }

    page += 1
  }
}

export async function GET() {
  const authorization = await requirePrivilegedUser()

  if ('error' in authorization) {
    return authorization.error
  }

  const admin = createAdminClient()

  const [
    { data: profiles, error: profilesError },
    { data: connections, error: connectionsError },
    { data: billings, error: billingsError },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select(
        'id, customer_id, name, username, phone, zone, role, created_at, deleted_at'
      )
      .eq('role', 'user')
      .order('created_at', { ascending: false }),

    admin
      .from('connections')
      .select(
        'id, user_id, package_name, monthly_price, connection_type, connection_date, onu_receive_power, onu_mac_address, pon_number, mikrotik_password, status, start_date, renewal_date, billing_start_date, created_at, deleted_at'
      ),

    admin
      .from('billings')
      .select('id, user_id, connection_id, amount, billing_month, due_date, status, paid_at, customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot, created_at')
      .order('created_at', { ascending: false }),
  ])

  if (profilesError) {
    console.error('Profiles fetch failed:', profilesError)

    return apiError('Unable to load customer profiles.', 500)
  }

  if (connectionsError) {
    console.error('Connections fetch failed:', connectionsError)

    return apiError('Unable to load customer connections.', 500)
  }

  if (billingsError) {
    console.error('Billings fetch failed:', billingsError)
    return apiError('Unable to load customer billings.', 500)
  }

  return NextResponse.json({
    profiles: profiles ?? [],
    connections: connections ?? [],
    billings: billings ?? [],
  })
}

export async function POST(request: Request) {
  const authorization = await requirePrivilegedUser()

  if ('error' in authorization) {
    return authorization.error
  }

  let payload: CustomerPayload

  try {
    payload = await request.json()
  } catch {
    return apiError('Invalid request body.', 400)
  }

  const result = normalizeCustomer(payload)

  if (!result.success) {
    return apiError(result.error, 400)
  }

  const customer = result.customer
  const admin = createAdminClient()

  const [
    { data: matchingPhone, error: phoneError },
    { data: matchingCustomerId, error: customerIdError },
    { data: matchingUsername, error: usernameError },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id')
      .eq('phone', customer.phone)
      .maybeSingle(),
    admin.from('profiles').select('id').eq('username', customer.username).maybeSingle(),

    admin
      .from('profiles')
      .select('id')
      .eq('customer_id', customer.customerId)
      .maybeSingle(),
  ])

  if (phoneError) {
    console.error('Phone duplicate check failed:', phoneError)

    return apiError('Unable to validate contact number.', 500)
  }

  if (customerIdError) {
    console.error('Customer ID duplicate check failed:', customerIdError)

    return apiError('Unable to validate customer ID.', 500)
  }
  if (usernameError) {
    console.error('Username duplicate check failed:', usernameError)
    return apiError('Unable to validate username.', 500)
  }

  if (matchingPhone) {
    return apiError(
      'This contact number is already registered.',
      409
    )
  }

  if (matchingCustomerId) {
    return apiError(
      'This customer ID is already registered.',
      409
    )
  }
  if (matchingUsername) return apiError('This username is already taken. Please choose another one.', 409)

  try {
    if (await emailAlreadyExists(customer.email)) {
      return apiError(
        'This email address is already registered.',
        409
      )
    }
  } catch (error) {
    console.error('Email duplicate check failed:', error)

    return apiError(
      'Unable to validate the email address.',
      500
    )
  }

  const {
    data: authData,
    error: createAuthError,
  } = await admin.auth.admin.createUser({
    email: customer.email,
    password: customer.password,
    email_confirm: true,
  })

  if (createAuthError || !authData.user) {
    console.error('Auth user creation failed:', createAuthError)

    const message =
      /already been registered|already exists|duplicate/i.test(
        createAuthError?.message ?? ''
      )
        ? 'This email address is already registered.'
        : 'Unable to create the customer login account.'

    return apiError(message, 409)
  }

  const userId = authData.user.id
  const actualActivationDate = new Date().toISOString().slice(0, 10)
  const billingStartDate = actualActivationDate < '2026-09-01' ? '2026-09-01' : actualActivationDate

  const {
    data: profile,
    error: profileInsertError,
  } = await admin
    .from('profiles')
    .insert({
      id: userId,
      customer_id: customer.customerId,
      name: customer.name,
      username: customer.username,
      phone: customer.phone,
      zone: customer.zone,
      role: 'user',
      deleted_at: null,
    })
    .select(
      'id, customer_id, name, username, phone, zone, role, created_at, deleted_at'
    )
    .single()

  if (profileInsertError || !profile) {
    console.error('Profile creation failed:', profileInsertError)

    await admin.auth.admin.deleteUser(userId)

    return apiError(
      'Unable to create the customer profile. The login account was rolled back.',
      500
    )
  }

  const {
    data: connection,
    error: connectionInsertError,
  } = await admin
    .from('connections')
    .insert({
      user_id: userId,
      package_name: customer.packageName,
      monthly_price: customer.monthlyPrice,
      connection_type: customer.connectionType,
      connection_date: customer.connectionDate || null,
      onu_receive_power: customer.onuReceivePower || null,
      onu_mac_address: customer.onuMacAddress || null,
      pon_number: customer.ponNumber || null,
      mikrotik_password: customer.mikrotikPassword || null,
      status: 'active',
      start_date: billingStartDate,
      billing_start_date: billingStartDate,
      renewal_date: getRenewalDate(new Date(`${billingStartDate}T12:00:00`)),
      deleted_at: null,
    })
    .select(
      'id, user_id, package_name, monthly_price, connection_type, connection_date, onu_receive_power, onu_mac_address, pon_number, mikrotik_password, status, start_date, renewal_date, billing_start_date, created_at, deleted_at'
    )
    .single()

  if (connectionInsertError || !connection) {
    console.error('Connection creation failed:', connectionInsertError)

    await admin
      .from('profiles')
      .delete()
      .eq('id', userId)

    await admin.auth.admin.deleteUser(userId)

    return apiError(
      'Unable to create the customer connection. The login account was rolled back.',
      500
    )
  }

  const billingMonth = `${billingStartDate.slice(0, 7)}-01`
  const { error: billingInsertError } = await admin
    .from('billings')
    .insert({
      user_id: userId,
      connection_id: connection.id,
      amount: customer.monthlyPrice,
      billing_month: billingMonth,
      due_date: connection.renewal_date,
      status: 'unpaid',
      paid_at: null,
      customer_id_snapshot: customer.customerId,
      customer_name_snapshot: customer.name,
      zone_snapshot: customer.zone,
      package_name_snapshot: customer.packageName,
    })

  if (billingInsertError) {
    console.error('Initial billing creation failed:', billingInsertError)

    await admin.from('connections').delete().eq('id', connection.id)
    await admin.from('profiles').delete().eq('id', userId)
    await admin.auth.admin.deleteUser(userId)

    return apiError(
      'Unable to create the first customer invoice. The customer was rolled back.',
      500
    )
  }

  return NextResponse.json(
    {
      profile,
      connection,
    },
    { status: 201 }
  )
}

export async function PATCH(request: Request) {
  const authorization = await requirePrivilegedUser()
  if ('error' in authorization) return authorization.error

  let payload: { id?: string; connectionId?: string; customerId?: string; name?: string; username?: string; phone?: string; zone?: string; packageName?: string; monthlyPrice?: number; connectionType?: string; connectionDate?: string; onuReceivePower?: string; onuMacAddress?: string; ponNumber?: string; mikrotikPassword?: string }
  try {
    payload = await request.json()
  } catch {
    return apiError('Invalid request body.', 400)
  }

  const customerPackage = getCustomerPackage(payload.packageName?.trim() ?? '')
  if (!payload.id || !payload.connectionId || !payload.customerId?.trim() || !payload.name?.trim() || !payload.username?.trim() || !payload.phone?.trim() || !payload.zone?.trim() || !customerPackage || !isCustomerZone(payload.zone.trim()) || !isConnectionType(payload.connectionType?.trim() ?? '')) {
    return apiError('Complete every customer field and provide a valid monthly bill.', 400)
  }

  const admin = createAdminClient()
  const username = payload.username.trim().toLowerCase()
  const { data: matchingUsername, error: usernameError } = await admin.from('profiles').select('id').eq('username', username).neq('id', payload.id).maybeSingle()
  if (usernameError) return apiError('Unable to validate username.', 500)
  if (matchingUsername) return apiError('This username is already taken. Please choose another one.', 409)
  const [{ data: profile, error: profileError }, { data: connection, error: connectionError }] = await Promise.all([
    admin.from('profiles').update({ customer_id: payload.customerId.trim(), name: payload.name.trim(), username, phone: payload.phone.trim(), zone: payload.zone.trim() }).eq('id', payload.id).eq('role', 'user').is('deleted_at', null).select('id, customer_id, name, username, phone, zone, role, created_at, deleted_at').single(),
    admin.from('connections').update({ package_name: customerPackage.name, monthly_price: customerPackage.monthlyPrice, connection_type: payload.connectionType!.trim(), connection_date: payload.connectionDate?.trim() || null, onu_receive_power: payload.onuReceivePower?.trim() || null, onu_mac_address: payload.onuMacAddress?.trim() || null, pon_number: payload.ponNumber?.trim() || null, mikrotik_password: payload.mikrotikPassword || null }).eq('id', payload.connectionId).eq('user_id', payload.id).is('deleted_at', null).select('id, user_id, package_name, monthly_price, connection_type, connection_date, onu_receive_power, onu_mac_address, pon_number, mikrotik_password, status, start_date, renewal_date, billing_start_date, created_at, deleted_at').single(),
  ])

  if (profileError || connectionError || !profile || !connection) {
    console.error('Customer update failed:', profileError ?? connectionError)
    return apiError('Unable to update this customer.', 500)
  }
  return NextResponse.json({ profile, connection })
}

export async function DELETE(request: Request) {
  const authorization = await requirePrivilegedUser()
  if ('error' in authorization) return authorization.error

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return apiError('Customer is required.', 400)

  const admin = createAdminClient()
  const deletedAt = new Date().toISOString()
  const [{ error: profileError }, { error: connectionError }] = await Promise.all([
    admin.from('profiles').update({ deleted_at: deletedAt }).eq('id', id).eq('role', 'user'),
    admin.from('connections').update({ deleted_at: deletedAt }).eq('user_id', id),
  ])
  if (profileError || connectionError) {
    console.error('Customer soft delete failed:', profileError ?? connectionError)
    return apiError('Unable to deactivate this customer.', 500)
  }
  return NextResponse.json({ success: true })
}
