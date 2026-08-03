'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { useApp } from '@/lib/context/AppContext'
import { StatCard } from '@/components/cards/StatCard'
import { ConnectionCard } from '@/components/cards/ConnectionCard'
import { Button } from '@/components/ui/button'
import { Wifi, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { calculateMonthlyBill } from '@/lib/utils/billCalculator'

export default function UserDashboard() {
  const { currentUser } = useAuth()
  const { getUserConnections, updateConnection } = useApp()

  if (!currentUser) return null

  const connections = getUserConnections(currentUser.id)
  const activeConnections = connections.filter(c => c.status === 'active')
  const monthlyBill = calculateMonthlyBill(activeConnections)

  const handleRenew = (connection: typeof connections[0]) => {
    const updatedConnection = {
      ...connection,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active' as const
    }
    updateConnection(updatedConnection)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Welcome, {currentUser.name}</h1>
        <p className="text-muted-foreground mt-2">Manage your network connections and billing</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          title="Active Connections"
          value={activeConnections.length}
          icon={Wifi}
          description={`${connections.length} total`}
        />
        <StatCard
          title="Monthly Bill"
          value={`$${monthlyBill.toFixed(2)}`}
          icon={DollarSign}
          description="Current month"
        />
        <StatCard
          title="Subscription Status"
          value={currentUser.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
          icon={Calendar}
          description={`Joined ${new Date(currentUser.joinDate).toLocaleDateString()}`}
        />
        <StatCard
          title="Total Paid"
          value={`$${(currentUser.totalPaid || 0).toFixed(2)}`}
          icon={TrendingUp}
          description="Lifetime"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/user/connections">
            <Button>View All Connections</Button>
          </Link>
          <Link href="/dashboard/user/billing">
            <Button variant="outline">View Billing</Button>
          </Link>
          <Link href="/dashboard/user/settings">
            <Button variant="outline">Account Settings</Button>
          </Link>
        </div>
      </div>

      {/* Recent Connections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Connections</h2>
          <Link href="/dashboard/user/connections">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        {connections.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {connections.slice(0, 4).map(connection => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onRenew={handleRenew}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Wifi className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Connections Yet</h3>
            <p className="text-muted-foreground">Contact support to add your first connection</p>
          </div>
        )}
      </div>
    </div>
  )
}
