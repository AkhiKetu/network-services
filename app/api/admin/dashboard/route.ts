import { NextResponse } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/supabase/adminData'
import { loadAdminBusinessData } from '@/lib/supabase/adminBusinessData'

export async function GET() {
  try {
    const { admin } = await requireAdmin()
    const data = await loadAdminBusinessData(admin, { notifications: true })
    return NextResponse.json(data)
  } catch (error) {
    return errorResponse(error)
  }
}
