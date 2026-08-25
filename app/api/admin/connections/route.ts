import { NextResponse } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/supabase/adminData'
import { loadAdminBusinessData } from '@/lib/supabase/adminBusinessData'
import { isConnectionType } from '@/lib/utils/customerOptions'

export async function GET() {
  try {
    const { admin } = await requireAdmin()
    const { profiles, connections } = await loadAdminBusinessData(admin)
    return NextResponse.json({ profiles, connections })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const { admin } = await requireAdmin()
    const body = await request.json() as { id?: string; packageName?: string; monthlyPrice?: number; connectionType?: string; startDate?: string; renewalDate?: string; status?: 'active' | 'expired' | 'pending' }
    if (!body.id) return NextResponse.json({ error: 'Connection is required.' }, { status: 400 })
    const update: Record<string, string | number> = {}
    if (typeof body.packageName === 'string' && body.packageName.trim()) update.package_name = body.packageName.trim()
    if (typeof body.monthlyPrice === 'number' && Number.isFinite(body.monthlyPrice) && body.monthlyPrice >= 0) update.monthly_price = body.monthlyPrice
    if (typeof body.connectionType === 'string' && isConnectionType(body.connectionType.trim())) update.connection_type = body.connectionType.trim()
    if (typeof body.startDate === 'string') update.start_date = body.startDate
    if (typeof body.renewalDate === 'string') update.renewal_date = body.renewalDate
    if (body.status) update.status = body.status
    if (!Object.keys(update).length) return NextResponse.json({ error: 'No valid changes were provided.' }, { status: 400 })
    const { data, error } = await admin.from('connections').update(update).eq('id', body.id).select().single()
    if (error) throw error
    return NextResponse.json({ connection: data })
  } catch (error) {
    return errorResponse(error)
  }
}
