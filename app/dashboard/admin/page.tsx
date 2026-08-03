'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { useApp } from '@/lib/context/AppContext'
import { ConnectionCard } from '@/components/cards/ConnectionCard'
import { Button } from '@/components/ui/button'
import {
  Users,
  TrendingUp,
  Wifi,
  DollarSign,
  Bell,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { calculateYearlyIncomeFromBillings, calculateMonthlyRevenue, formatCurrency } from '@/lib/utils/billCalculator'

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const { users, connections, billings, notifications, markNotificationAsRead, getUnreadNotifications } = useApp()

  if (!currentUser) return null

  const monthlyRevenue = calculateMonthlyRevenue(billings)
  const yearlyRevenue = calculateYearlyIncomeFromBillings(billings)
  const totalUsers = users.filter(u => u.role === 'user').length
  const activeUsers = users.filter(u => u.role === 'user' && u.subscriptionStatus === 'active').length
  const activeConnections = connections.filter(c => c.status === 'active').length
  const unreadNotifications = getUnreadNotifications()

  const stats = [
    {
      label: 'Monthly Revenue',
      value: formatCurrency(monthlyRevenue),
      note: 'Current month',
      icon: DollarSign,
    },
    {
      label: 'Yearly Revenue',
      value: formatCurrency(yearlyRevenue),
      note: 'This year',
      icon: TrendingUp,
    },
    {
      label: 'Active Users',
      value: activeUsers,
      note: `${totalUsers} total users`,
      icon: Users,
    },
    {
      label: 'Active Connections',
      value: activeConnections,
      note: `${connections.length} total connections`,
      icon: Wifi,
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Welcome capsule banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0a0e27] via-[#141a3d] to-[#1e1550] px-6 py-8 md:px-10 md:py-10">
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Welcome back</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome, {currentUser.name.split(' ')[0]}
              </h1>
              <p className="text-white/50 text-sm mt-1">{currentUser.phone}</p>
            </div>
          </div>

          {/* Inline pill quick-facts */}
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
              {totalUsers} users
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
              {activeConnections} active connections
            </span>
            {unreadNotifications.length > 0 && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                <Bell className="w-3.5 h-3.5" />
                {unreadNotifications.length} new
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stat capsules */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="rounded-3xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">Recent Notifications</h2>
          <div className="space-y-2">
            {unreadNotifications.slice(0, 3).map(notif => (
              <div
                key={notif.id}
                className="flex items-start justify-between gap-4 bg-white dark:bg-blue-900 p-4 rounded-2xl"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full shrink-0"
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  Mark read
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin/users">
            <Button className="rounded-full gap-1.5">
              Manage Users <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard/admin/connections">
            <Button variant="outline" className="rounded-full gap-1.5">
              View Connections <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard/admin/analytics">
            <Button variant="outline" className="rounded-full gap-1.5">
              View Analytics <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Connections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recent Connections</h2>
          <Link href="/dashboard/admin/connections">
            <Button variant="ghost" className="rounded-full">View All</Button>
          </Link>
        </div>
        {connections.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {connections.slice(0, 4).map(connection => {
              const user = users.find(u => u.id === connection.userId)
              return (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  showUser
                  userName={user?.name}
                />
              )
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <Wifi className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Connections</h3>
            <p className="text-muted-foreground">No connections created yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
