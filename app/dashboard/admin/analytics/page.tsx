'use client'

import { useApp } from '@/lib/context/AppContext'
import { StatCard } from '@/components/cards/StatCard'
import { DollarSign, TrendingUp, Users, Wifi, BarChart3 } from 'lucide-react'
import { calculateYearlyIncomeFromBillings, calculateMonthlyRevenue, formatCurrency, getRevenueByMonth } from '@/lib/utils/billCalculator'

export default function AdminAnalytics() {
  const { users, connections, billings } = useApp()

  const monthlyRevenue = calculateMonthlyRevenue(billings)
  const yearlyRevenue = calculateYearlyIncomeFromBillings(billings)
  const totalBillings = billings.length
  const paidBillings = billings.filter(b => b.status === 'paid').length
  const revenueByMonth = getRevenueByMonth(billings)

  const regularUsers = users.filter(u => u.role === 'user')
  const activeUsers = regularUsers.filter(u => u.subscriptionStatus === 'active')
  const expiredUsers = regularUsers.filter(u => u.subscriptionStatus === 'expired')

  const totalMonthlyValue = connections
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyPrice, 0)

  const topUsers = [...regularUsers]
    .sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0))
    .slice(0, 5)

  const averageRevenue = paidBillings > 0 ? (yearlyRevenue / 12).toFixed(2) : '0.00'

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-10 pt-4 sm:space-y-6 sm:px-6 sm:pt-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-2">View detailed financial and operational metrics</p>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          icon={DollarSign}
          description="Current month"
        />
        <StatCard
          title="Yearly Revenue"
          value={formatCurrency(yearlyRevenue)}
          icon={TrendingUp}
          description="This year"
        />
        <StatCard
          title="Average Monthly"
          value={formatCurrency(parseFloat(averageRevenue))}
          icon={BarChart3}
          description="12-month average"
        />
      </div>

      {/* User Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={regularUsers.length}
          icon={Users}
          description="All registered users"
        />
        <StatCard
          title="Active Subscriptions"
          value={activeUsers.length}
          icon={Wifi}
          description="Currently active"
        />
        <StatCard
          title="Expired Subscriptions"
          value={expiredUsers.length}
          icon={Users}
          description="Need renewal"
        />
        <StatCard
          title="Active Connections"
          value={connections.filter(c => c.status === 'active').length}
          icon={Wifi}
          description="Running now"
        />
      </div>

      {/* Billing Metrics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Billing Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Invoices</span>
              <span className="font-bold text-2xl">{totalBillings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Paid Invoices</span>
              <span className="font-bold text-green-600">{paidBillings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending Invoices</span>
              <span className="font-bold text-amber-600">{totalBillings - paidBillings}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-semibold text-foreground">Collection Rate</span>
              <span className="font-bold">{totalBillings > 0 ? ((paidBillings / totalBillings) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Connection Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Connections</span>
              <span className="font-bold text-2xl">{connections.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Connections</span>
              <span className="font-bold text-green-600">{connections.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending/Expired</span>
              <span className="font-bold text-red-600">{connections.filter(c => c.status !== 'active').length}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-semibold text-foreground">Monthly Value</span>
              <span className="font-bold">{formatCurrency(totalMonthlyValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Breakdown */}
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-2xl font-bold text-foreground mb-6">Monthly Revenue Breakdown</h2>
        {Object.keys(revenueByMonth).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(revenueByMonth).map(([month, revenue]) => (
              <div key={month} className="bg-secondary/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{month}</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(revenue)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No revenue data available</p>
        )}
      </div>

      {/* Top Users */}
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-2xl font-bold text-foreground mb-6">Top 5 Users by Revenue</h2>
        {topUsers.length > 0 ? (
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
                <p className="font-bold text-lg">{formatCurrency(user.totalPaid || 0)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No user data available</p>
        )}
      </div>
    </main>
  )
}
