import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase.from('profiles').select('role, deleted_at').eq('id', user.id).maybeSingle()
  if (!profile || profile.deleted_at) redirect('/')
  if (profile.role === 'user') redirect('/dashboard/user')
  return children
}
