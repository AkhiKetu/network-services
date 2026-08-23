'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { CapsuleNavbar } from '@/components/navigation/CapsuleNavbar'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !currentUser && mounted) {
      router.push('/')
      return
    }
    if (!isLoading && currentUser && mounted) {
      const requestedRole = pathname.startsWith('/dashboard/admin') ? 'admin' : 'user'
      if (currentUser.role !== requestedRole) {
        router.replace(`/dashboard/${currentUser.role}`)
      }
    }
  }, [isLoading, currentUser, router, mounted, pathname])

  if (!mounted || isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-950 dark:text-white">
      <CapsuleNavbar role={currentUser.role} />
      <main className="pt-24 sm:pt-28">
        {children}
      </main>
    </div>
  )
}
