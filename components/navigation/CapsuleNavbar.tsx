'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Wifi, LayoutDashboard, Network, BarChart3, Settings, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuth } from '@/lib/context/AuthContext'
import { useApp } from '@/lib/context/AppContext'

interface CapsuleNavbarProps {
  role: 'user' | 'admin'
}

const ADMIN_LINKS = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
  { label: 'Connections', href: '/dashboard/admin/connections', icon: Network },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
]

const USER_LINKS = [
  { label: 'Dashboard', href: '/dashboard/user', icon: LayoutDashboard },
  { label: 'Connections', href: '/dashboard/user/connections', icon: Network },
  { label: 'Billing', href: '/dashboard/user/billing', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/user/settings', icon: Settings },
]

// The single floating "capsule" navbar for every dashboard page — same
// fixed, shrink-on-scroll pill treatment as the public landing page navbar
// (see app/page.tsx), but built from theme variables so it follows
// light/dark instead of a hardcoded color. This replaces what used to be
// a separate left Sidebar + top Topbar: all nav links, the welcome
// message, the theme toggle, and logout now live in one place.
export const CapsuleNavbar: React.FC<CapsuleNavbarProps> = ({ role }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, currentUser } = useAuth()
  const { getUnreadNotifications } = useApp()
  const unreadCount = getUnreadNotifications().length

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = role === 'admin' ? ADMIN_LINKS : USER_LINKS
  const rootHref = `/dashboard/${role}`
  const isActive = (href: string) =>
    pathname === href || (href !== rootHref && pathname.startsWith(href))

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4">
      <nav
        className={`flex items-center bg-card/90 backdrop-blur-lg border border-border rounded-full shadow-lg transition-all duration-300 ease-out ${
          scrolled ? 'gap-2 px-3 py-2 max-w-fit' : 'gap-3 px-4 py-2.5 w-full max-w-6xl'
        }`}
      >
        {/* Logo */}
        <Link href={rootHref} className="flex items-center gap-2 shrink-0">
          <div className="p-2 bg-primary rounded-full">
            <Wifi className="w-4 h-4 text-primary-foreground" />
          </div>
          <span
            className={`hidden sm:inline-block font-bold text-foreground tracking-tight overflow-hidden whitespace-nowrap transition-all duration-300 ${
              scrolled ? 'sm:w-0 sm:opacity-0' : 'sm:w-auto sm:opacity-100'
            }`}
          >
            NetFlow
          </span>
        </Link>

        {/* Nav links (was the left Sidebar) */}
        <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {links.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span
                  className={`hidden md:inline-block overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    scrolled ? 'md:w-0 md:opacity-0' : 'md:w-auto md:opacity-100'
                  }`}
                >
                  {link.label}
                </span>
                {link.label === 'Dashboard' && unreadCount > 0 && role === 'admin' && (
                  <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white shrink-0">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Welcome + theme + logout */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`hidden lg:inline-block text-sm text-muted-foreground overflow-hidden whitespace-nowrap transition-all duration-300 ${
              scrolled ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'
            }`}
          >
            Welcome, <span className="font-semibold text-foreground">{currentUser?.name}</span>
          </span>

          <ThemeToggle />

          <Button
            onClick={handleLogout}
            variant="outline"
            size={scrolled ? 'icon' : 'default'}
            className="rounded-full gap-1.5 shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            {!scrolled && <span className="hidden sm:inline">Logout</span>}
          </Button>
        </div>
      </nav>
    </header>
  )
}
