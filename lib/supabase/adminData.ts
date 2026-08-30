import 'server-only'

import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { AdminProfile, AdminRole } from '@/lib/types/admin'

export async function requireAdmin() {
  const sessionClient = await createClient()
  const { data: { user }, error: authError } = await sessionClient.auth.getUser()
  if (authError || !user) throw new AdminApiError('You must be signed in.', 401)

  const { data: profile, error: profileError } = await sessionClient
    .from('profiles')
    .select('id, customer_id, name, phone, zone, role, created_at, deleted_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile || profile.deleted_at) {
    throw new AdminApiError('Your portal profile is unavailable.', 403)
  }
  if (profile.role !== 'owner' && profile.role !== 'admin') {
    throw new AdminApiError('You are not allowed to access admin data.', 403)
  }

  return { user, profile: profile as AdminProfile & { role: AdminRole }, admin: createAdminClient() }
}

export async function requireCollectionsAccess() {
  const sessionClient = await createClient()
  const { data: { user }, error: authError } = await sessionClient.auth.getUser()
  if (authError || !user) throw new AdminApiError('You must be signed in.', 401)

  const { data: profile, error: profileError } = await sessionClient
    .from('profiles')
    .select('id, customer_id, name, phone, zone, role, created_at, deleted_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile || profile.deleted_at) throw new AdminApiError('Your portal profile is unavailable.', 403)
  if (profile.role !== 'owner' && profile.role !== 'admin' && profile.role !== 'collector') {
    throw new AdminApiError('You are not allowed to access collections.', 403)
  }

  return { user, profile: profile as AdminProfile & { role: AdminRole }, admin: createAdminClient() }
}

export class AdminApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof AdminApiError) return NextResponse.json({ error: error.message }, { status: error.status })
  console.error('Admin API failure:', error)
  return NextResponse.json({ error: 'Unable to complete the request.' }, { status: 500 })
}
