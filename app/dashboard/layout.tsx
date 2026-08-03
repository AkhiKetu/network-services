'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import { CapsuleNavbar } from '@/components/navigation/CapsuleNavbar'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !currentUser && mounted) {
      router.push('/')
    }
  }, [isLoading, currentUser, router, mounted])

  if (!mounted || isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // No more side-by-side sidebar + independently scrolling main area.
  // The capsule navbar floats fixed at the top (same as the landing page
  // navbar) and the whole page scrolls underneath it as one unit.
  return (
    <div className="min-h-screen bg-background">
      <CapsuleNavbar role={currentUser.role} />
      <main className="pt-24 sm:pt-28">
        {children}
      </main>
    </div>
  )
}
