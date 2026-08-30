import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase.from('profiles').select('role, deleted_at').eq('id', user.id).maybeSingle()
  if (!profile || profile.deleted_at) redirect('/')
  if (profile.role === 'collector') redirect('/dashboard/admin/collections')
  if (profile.role === 'owner' || profile.role === 'admin') redirect('/dashboard/admin')
  return children
}
