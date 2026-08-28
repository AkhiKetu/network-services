import { NextResponse } from 'next/server'

import { errorResponse, requireAdmin } from '@/lib/supabase/adminData'
import { loadAdminBusinessData, toCustomers, toRecentCollections } from '@/lib/supabase/adminBusinessData'
import type { PaymentMethod } from '@/lib/types/admin'
import { getConnectionStatus } from '@/lib/utils/connectionStatus'
import { getRenewalDate } from '@/lib/utils/dateUtils'

const METHODS = new Set<PaymentMethod>(['cash', 'bkash', 'nagad', 'bank'])

export async function GET(request: Request) {
  try {
    const { admin } = await requireAdmin()
    const { profiles, connections, billings, collections } = await loadAdminBusinessData(admin)

    const requestedMonth = new URL(request.url).searchParams.get('month')
    const selectedMonth = /^\d{4}-\d{2}$/.test(requestedMonth ?? '')
      ? `${requestedMonth}-01`
      : `${new Date().toISOString().slice(0, 7)}-01`
    const paymentsByBilling = new Map<string, typeof collections>()
    for (const payment of collections) {
      if (payment.billing_id) paymentsByBilling.set(payment.billing_id, [...(paymentsByBilling.get(payment.billing_id) ?? []), payment])
    }
    const history = billings.filter(billing => billing.billing_month === selectedMonth).map(billing => {
      const payments = paymentsByBilling.get(billing.id) ?? []
      const amountPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
      return { ...billing, amount_paid: amountPaid, unpaid_amount: Math.max(Number(billing.amount) - amountPaid, 0), payment_dates: payments.map(payment => payment.created_at), payment_status: amountPaid >= Number(billing.amount) ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid' }
    })
    return NextResponse.json({
      customers: toCustomers(profiles.filter(profile => profile.role === 'user' && !profile.deleted_at), connections, billings),
      records: toRecentCollections(collections, profiles),
      selectedMonth,
      availableMonths: Array.from(new Set(billings.map(billing => billing.billing_month))).sort().reverse(),
      history,
      totals: { expected: history.reduce((sum, item) => sum + Number(item.amount), 0), collected: history.reduce((sum, item) => sum + item.amount_paid, 0), unpaid: history.reduce((sum, item) => sum + item.unpaid_amount, 0) },
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const { admin, user } = await requireAdmin()
    const body = await request.json() as {
      userId?: string
      amount?: number
      paymentMethod?: string
      referenceNote?: string
    }
    const amount = Number(body.amount)
    const paymentMethod = body.paymentMethod?.toLowerCase() as PaymentMethod

    if (!body.userId || !Number.isFinite(amount) || amount <= 0 || !METHODS.has(paymentMethod)) {
      return NextResponse.json({ error: 'Provide a customer, valid amount, and payment method.' }, { status: 400 })
    }

    const [{ data: profile, error: profileError }, { data: connection, error: connectionError }] = await Promise.all([
      admin.from('profiles').select('id, customer_id, name, zone').eq('id', body.userId).eq('role', 'user').is('deleted_at', null).maybeSingle(),
      admin.from('connections').select('id, user_id, package_name, monthly_price, status, renewal_date, deleted_at').eq('user_id', body.userId).is('deleted_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    if (profileError || connectionError) throw profileError ?? connectionError
    if (!profile || !connection) return NextResponse.json({ error: 'This customer does not have an active business record.' }, { status: 400 })

    // A paid bill is not eligible for collection again. This is the first
    // guard against renewing the same billing period twice.
    const { data: currentBilling, error: billingError } = await admin
      .from('billings')
      .select('id, amount, billing_month, due_date, status, paid_at')
      .eq('user_id', body.userId)
      .eq('connection_id', connection.id)
      .eq('status', 'unpaid')
      .order('billing_month', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (billingError) throw billingError
    if (!currentBilling) return NextResponse.json({ error: 'There is no unpaid bill available for this customer.' }, { status: 400 })

    const { data: previousPayments, error: previousPaymentsError } = await admin
      .from('collections').select('amount').eq('billing_id', currentBilling.id)
    if (previousPaymentsError) throw previousPaymentsError
    const currentPaid = (previousPayments ?? []).reduce((sum, item) => sum + Number(item.amount), 0)
    if (amount > Math.max(Number(currentBilling.amount) - currentPaid, 0)) {
      return NextResponse.json({ error: 'Payment cannot be greater than the remaining bill amount.' }, { status: 400 })
    }

    const { data: collection, error: collectionError } = await admin
      .from('collections')
      .insert({
        user_id: body.userId,
        billing_id: currentBilling.id,
        connection_id: connection.id,
        amount,
        payment_method: paymentMethod,
        reference_note: typeof body.referenceNote === 'string' ? body.referenceNote.trim() || null : null,
        collected_by: user.id,
        billing_month: currentBilling.billing_month,
        customer_id_snapshot: profile.customer_id,
        customer_name_snapshot: profile.name,
        zone_snapshot: profile.zone,
        package_name_snapshot: connection.package_name,
      })
      .select('id')
      .single()
    if (collectionError || !collection) throw collectionError ?? new Error('Collection was not created.')
    const { data: collections, error: collectionsError } = await admin
      .from('collections')
      .select('amount')
      .eq('billing_id', currentBilling.id)
    if (collectionsError) throw collectionsError

    const totalPaid = (collections ?? []).reduce((sum, item) => sum + Number(item.amount), 0)
    const billAmount = Number(currentBilling.amount) || Number(connection.monthly_price)
    if (totalPaid < billAmount) {
      return NextResponse.json({ success: true, renewed: false, totalPaid, unpaid: billAmount - totalPaid })
    }

    const wasActive = getConnectionStatus(connection) === 'active'
    const renewalDate = getRenewalDate(wasActive ? new Date(`${connection.renewal_date}T12:00:00`) : new Date())
    const nextBillingMonth = `${renewalDate.slice(0, 7)}-01`

    try {
      // This conditional update is the authoritative duplicate-renewal guard.
      // Only the request that changes unpaid -> paid may renew the connection.
      const { data: paidBilling, error: paidError } = await admin
        .from('billings')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', currentBilling.id)
        .eq('status', 'unpaid')
        .select('id')
        .maybeSingle()
      if (paidError) throw paidError
      if (!paidBilling) return NextResponse.json({ success: true, renewed: false, totalPaid })

      const { error: renewalError } = await admin
        .from('connections')
        .update({ start_date: wasActive ? connection.renewal_date : new Date().toISOString().slice(0, 10), renewal_date: renewalDate, status: 'active' })
        .eq('id', connection.id)
      if (renewalError) throw renewalError

      const { data: nextBilling, error: nextBillingError } = await admin
        .from('billings')
        .select('id')
        .eq('connection_id', connection.id)
        .eq('billing_month', nextBillingMonth)
        .maybeSingle()
      if (nextBillingError) throw nextBillingError

      if (!nextBilling) {
        const { error: createBillingError } = await admin.from('billings').insert({
          user_id: body.userId,
          connection_id: connection.id,
          amount: connection.monthly_price,
          billing_month: nextBillingMonth,
          due_date: renewalDate,
          status: 'unpaid',
          paid_at: null,
          customer_id_snapshot: profile.customer_id,
          customer_name_snapshot: profile.name,
          zone_snapshot: profile.zone,
          package_name_snapshot: connection.package_name,
        })
        if (createBillingError) throw createBillingError
      }
    } catch (error) {
      await admin.from('connections').update({ renewal_date: connection.renewal_date, status: connection.status }).eq('id', connection.id)
      await admin.from('billings').update({ status: 'unpaid', paid_at: null }).eq('id', currentBilling.id)
      await admin.from('collections').delete().eq('id', collection.id)
      throw error
    }

    return NextResponse.json({ success: true, renewed: true, renewalDate, totalPaid })
  } catch (error) {
    return errorResponse(error)
  }
}
