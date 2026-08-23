import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRenewalDate } from '@/lib/utils/dateUtils'

export const runtime = 'nodejs'

type CustomerPayload = {
  customerId?: unknown
  name?: unknown
  email?: unknown
  phone?: unknown
  zone?: unknown
  packageName?: unknown
  monthlyPrice?: unknown
  password?: unknown
}

type NormalizedCustomer = {
  customerId: string
  name: string
  email: string
  phone: string
  zone: string
  packageName: string
  monthlyPrice: number
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

  const password =
    typeof payload.password === 'string' ? payload.password : ''

  const monthlyPrice =
    typeof payload.monthlyPrice === 'number'
      ? payload.monthlyPrice
      : Number(payload.monthlyPrice)

  if (
    !customerId ||
    !name ||
    !email ||
    !phone ||
    !zone ||
    !packageName
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

  if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
    return {
      success: false,
      error: 'Enter a valid monthly bill amount.',
    }
  }

  return {
    success: true,
    customer: {
      customerId,
      name,
      email,
      phone,
      zone,
      packageName,
      monthlyPrice,
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
  ] = await Promise.all([
    admin
      .from('profiles')
      .select(
        'id, customer_id, name, phone, zone, role, created_at, deleted_at'
      )
      .eq('role', 'user')
      .order('created_at', { ascending: false }),

    admin
      .from('connections')
      .select(
        'id, user_id, package_name, monthly_price, status, start_date, renewal_date, created_at, deleted_at'
      ),
  ])

  if (profilesError) {
    console.error('Profiles fetch failed:', profilesError)

    return apiError('Unable to load customer profiles.', 500)
  }

  if (connectionsError) {
    console.error('Connections fetch failed:', connectionsError)

    return apiError('Unable to load customer connections.', 500)
  }

  return NextResponse.json({
    profiles: profiles ?? [],
    connections: connections ?? [],
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
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id')
      .eq('phone', customer.phone)
      .maybeSingle(),

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
  const today = new Date().toISOString().slice(0, 10)

  const {
    data: profile,
    error: profileInsertError,
  } = await admin
    .from('profiles')
    .insert({
      id: userId,
      customer_id: customer.customerId,
      name: customer.name,
      phone: customer.phone,
      zone: customer.zone,
      role: 'user',
      deleted_at: null,
    })
    .select(
      'id, customer_id, name, phone, zone, role, created_at, deleted_at'
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
      status: 'active',
      start_date: today,
      renewal_date: getRenewalDate(new Date(today)),
      deleted_at: null,
    })
    .select(
      'id, user_id, package_name, monthly_price, status, start_date, renewal_date, created_at, deleted_at'
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

  return NextResponse.json(
    {
      profile,
      connection,
    },
    { status: 201 }
  )
}