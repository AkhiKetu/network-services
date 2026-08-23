import { redirect } from 'next/navigation'

import { DashboardShell } from '@/components/navigation/DashboardShell'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, deleted_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile || profile.deleted_at) redirect('/')
  return <DashboardShell role={profile.role}>{children}</DashboardShell>
}
