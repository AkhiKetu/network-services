import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/** Returns only the signed-in customer's persistent service and billing data. */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const [profileResult, connectionsResult, billingsResult, collectionsResult] = await Promise.all([
    admin.from('profiles').select('id, customer_id, name, phone, zone, role, created_at, deleted_at').eq('id', user.id).maybeSingle(),
    admin.from('connections').select('id, user_id, package_name, monthly_price, connection_type, status, start_date, renewal_date, billing_start_date, created_at, deleted_at').eq('user_id', user.id).is('deleted_at', null).order('created_at', { ascending: false }),
    admin.from('billings').select('id, user_id, connection_id, amount, billing_month, due_date, status, paid_at, customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot, created_at').eq('user_id', user.id).order('billing_month', { ascending: false }),
    admin.from('collections').select('id, user_id, billing_id, connection_id, amount, payment_method, reference_note, collected_by, billing_month, customer_id_snapshot, customer_name_snapshot, zone_snapshot, package_name_snapshot, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const error = profileResult.error ?? connectionsResult.error ?? billingsResult.error ?? collectionsResult.error
  if (error) {
    console.error('Customer billing fetch failed:', error)
    return NextResponse.json({ error: 'Unable to load your billing information.' }, { status: 500 })
  }
  if (!profileResult.data || profileResult.data.deleted_at) {
    return NextResponse.json({ error: 'Your portal profile is unavailable.' }, { status: 403 })
  }

  const collectorIds = [...new Set((collectionsResult.data ?? []).map(collection => collection.collected_by).filter(Boolean))]
  const { data: collectors, error: collectorsError } = collectorIds.length
    ? await admin.from('profiles').select('id, name').in('id', collectorIds)
    : { data: [], error: null }
  if (collectorsError) {
    console.error('Collector names fetch failed:', collectorsError)
    return NextResponse.json({ error: 'Unable to load your billing information.' }, { status: 500 })
  }
  const collectorNames = new Map((collectors ?? []).map(collector => [collector.id, collector.name ?? 'Unknown collector']))

  return NextResponse.json({
    profile: profileResult.data,
    connections: connectionsResult.data ?? [],
    billings: billingsResult.data ?? [],
    collections: (collectionsResult.data ?? []).map(collection => ({ ...collection, collector_name: collectorNames.get(collection.collected_by) ?? 'Unknown collector' })),
  })
}
