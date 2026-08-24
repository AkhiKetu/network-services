import { NextResponse } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/supabase/adminData'
import { loadAdminBusinessData } from '@/lib/supabase/adminBusinessData'

export async function GET() {
  try {
    const { admin } = await requireAdmin()
    return NextResponse.json(await loadAdminBusinessData(admin))
  } catch (error) {
    return errorResponse(error)
  }
}
