import { NextResponse } from 'next/server'

import { errorResponse, requireAdmin, requireCollectionsAccess } from '@/lib/supabase/adminData'
import { loadAdminBusinessData, toCustomers, toRecentCollections } from '@/lib/supabase/adminBusinessData'
import type { PaymentMethod, PaymentType } from '@/lib/types/admin'
import { paymentStatus } from '@/lib/utils/paymentAccounting'

const METHODS = new Set<PaymentMethod>(['cash', 'bkash', 'nagad', 'bank'])
const PAYMENT_TYPES = new Set<PaymentType>(['full', 'partial', 'advance'])

export async function GET(request: Request) {
  try {
    const { admin, profile } = await requireCollectionsAccess()
    const { profiles, connections, billings, collections, allocations } = await loadAdminBusinessData(admin)
    const requestedMonth = new URL(request.url).searchParams.get('month')
    const selectedMonth = /^\d{4}-\d{2}$/.test(requestedMonth ?? '') ? `${requestedMonth}-01` : `${new Date().toISOString().slice(0, 7)}-01`
    const paidByBilling = new Map<string, number>()
    for (const allocation of allocations) paidByBilling.set(allocation.billing_id, (paidByBilling.get(allocation.billing_id) ?? 0) + Number(allocation.amount))
    const collectorNames = new Map(profiles.map(profile => [profile.id, profile.name ?? 'Unknown collector']))
    const collectionById = new Map(collections.map(collection => [collection.id, collection]))
    const allocationsByCollection = new Map<string, typeof allocations>()
    for (const allocation of allocations) allocationsByCollection.set(allocation.collection_id, [...(allocationsByCollection.get(allocation.collection_id) ?? []), allocation])
    const bills = billings.map(billing => {
      const amountPaid = paidByBilling.get(billing.id) ?? 0
      return { ...billing, amount_paid: amountPaid, unpaid_amount: Math.max(Number(billing.amount) - amountPaid, 0), payment_status: paymentStatus(Number(billing.amount), amountPaid) }
    })
    const history = bills.filter(billing => billing.billing_month === selectedMonth).map(billing => {
      const matching = allocations.filter(allocation => allocation.billing_id === billing.id).map(allocation => collectionById.get(allocation.collection_id)).filter(Boolean)
      return {
        ...billing,
        payment_dates: matching.map(payment => payment!.created_at),
        collector_names: matching.map(payment => collectorNames.get(payment!.collected_by) ?? 'Unknown collector'),
        payment_records: matching.map(payment => ({ id: payment!.id, amount: payment!.amount, created_at: payment!.created_at, collector_name: collectorNames.get(payment!.collected_by) ?? 'Unknown collector' })),
      }
    })
    const partialBalances = bills.filter(bill => bill.payment_status === 'partial').map(bill => ({ ...bill, customer: profiles.find(profile => profile.id === bill.user_id), connection: connections.find(connection => connection.id === bill.connection_id) }))
    const advancePayments = collections.filter(collection => collection.payment_type === 'advance').map(collection => {
      const allocatedBills = (allocationsByCollection.get(collection.id) ?? []).map(allocation => bills.find(bill => bill.id === allocation.billing_id)).filter(Boolean)
      const paidBills = allocatedBills.filter(bill => bill!.payment_status === 'paid')
      const latestPaid = paidBills.sort((a, b) => b!.billing_month.localeCompare(a!.billing_month))[0]
      const nextBill = bills.filter(bill => bill.connection_id === collection.connection_id && bill.billing_month > (latestPaid?.billing_month ?? '')).sort((a, b) => a.billing_month.localeCompare(b.billing_month))[0]
      return { ...collection, customer: profiles.find(profile => profile.id === collection.user_id), connection: connections.find(connection => connection.id === collection.connection_id), months_covered: paidBills.length, paid_through: latestPaid?.billing_month ?? null, next_billing: nextBill ?? null }
    })
    const monthlyCollected = allocations.filter(allocation => bills.find(bill => bill.id === allocation.billing_id)?.billing_month === selectedMonth).reduce((sum, allocation) => sum + Number(allocation.amount), 0)
    const today = new Date().toDateString()
    const monthBills = bills.filter(bill => bill.billing_month === selectedMonth)
    return NextResponse.json({
      customers: toCustomers(profiles.filter(profile => profile.role === 'user' && !profile.deleted_at), connections, bills, allocations), records: toRecentCollections(collections, profiles), canDeleteCollections: profile.role === 'owner' || profile.role === 'admin', selectedMonth,
      availableMonths: Array.from(new Set(billings.map(billing => billing.billing_month))).sort().reverse(), history, partialBalances, advancePayments,
      totals: {
        expected: monthBills.reduce((sum, bill) => sum + Number(bill.amount), 0), collected: monthlyCollected, unpaid: monthBills.reduce((sum, bill) => sum + bill.unpaid_amount, 0),
        partialOutstanding: partialBalances.reduce((sum, bill) => sum + bill.unpaid_amount, 0),
        advanceCollected: collections.filter(collection => collection.payment_type === 'advance' && collection.created_at.slice(0, 7) === selectedMonth.slice(0, 7)).reduce((sum, collection) => sum + Number(collection.amount), 0),
        todayCollection: collections.filter(collection => new Date(collection.created_at).toDateString() === today).reduce((sum, collection) => sum + Number(collection.amount), 0),
      },
    })
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    const { admin, profile } = await requireCollectionsAccess()
    const body = await request.json() as { userId?: string; billingId?: string; amount?: number; paymentType?: PaymentType; paymentMethod?: string; referenceNote?: string }
    const amount = Number(body.amount); const paymentMethod = body.paymentMethod?.toLowerCase() as PaymentMethod; const paymentType = body.paymentType as PaymentType
    if (!body.userId || (!body.billingId && paymentType !== 'advance') || !Number.isFinite(amount) || amount <= 0 || !METHODS.has(paymentMethod) || !PAYMENT_TYPES.has(paymentType)) return NextResponse.json({ error: 'Provide a customer, payment type, valid amount, and payment method.' }, { status: 400 })
    const { data: connection, error: connectionError } = await admin.from('connections').select('id').eq('user_id', body.userId).is('deleted_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (connectionError) throw connectionError
    if (!connection) return NextResponse.json({ error: 'This customer does not have an active business record.' }, { status: 400 })
    const { data, error } = await admin.rpc('record_collection_payment_v2', { p_user_id: body.userId, p_connection_id: connection.id, p_amount: amount, p_payment_type: paymentType, p_payment_method: paymentMethod, p_reference_note: typeof body.referenceNote === 'string' ? body.referenceNote.trim() || null : null, p_collected_by: profile.id, p_billing_id: body.billingId ?? null }).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, payment: data })
  } catch (error) { return errorResponse(error) }
}

export async function DELETE(request: Request) {
  try {
    const { admin, profile } = await requireAdmin()
    const body = await request.json() as { collectionId?: string }
    if (!body.collectionId) return NextResponse.json({ error: 'Collection is required.' }, { status: 400 })
    const { error } = await admin.rpc('reverse_collection_payment_v2', { p_collection_id: body.collectionId, p_deleted_by: profile.id })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) { return errorResponse(error) }
}
