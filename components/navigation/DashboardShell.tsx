'use client'

import { CapsuleNavbar } from '@/components/navigation/CapsuleNavbar'
import type { User } from '@/lib/types'

export function DashboardShell({ children, role }: { children: React.ReactNode; role: User['role'] }) {
  return <div className="min-h-screen bg-transparent text-slate-950 dark:text-white"><CapsuleNavbar role={role} /><main className="pt-24 sm:pt-28">{children}</main></div>
}
