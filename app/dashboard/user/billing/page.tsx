'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { useApp } from '@/lib/context/AppContext'
import { BillingCard } from '@/components/cards/BillingCard'
import { StatCard } from '@/components/cards/StatCard'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { calculateMonthlyBill, formatCurrency } from '@/lib/utils/billCalculator'

export default function UserBilling() {
  const { currentUser } = useAuth()
  const { getUserConnections, getUserBillings } = useApp()

  if (!currentUser) return null

  const connections = getUserConnections(currentUser.id)
  const billings = getUserBillings(currentUser.id)
  const monthlyBill = calculateMonthlyBill(connections)

  const getConnectionName = (connectionId: string) => {
    const conn = connections.find(c => c.id === connectionId)
    return conn?.name || 'Unknown'
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Billing & Invoices</h1>
        <p className="text-muted-foreground mt-2">View your billing history and invoices</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Bill"
          value={formatCurrency(monthlyBill)}
          icon={DollarSign}
          description="Current month"
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(currentUser.totalPaid || 0)}
          icon={TrendingUp}
          description="Lifetime"
        />
        <StatCard
          title="Invoices"
          value={billings.length}
          icon={Calendar}
          description={`${billings.filter(b => b.status === 'paid').length} paid`}
        />
      </div>

      {/* Billing Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Connections</span>
              <span className="font-medium">{connections.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Amount</span>
              <span className="font-bold text-lg">{formatCurrency(monthlyBill)}</span>
            </div>
            <div className="border-t border-border pt-3 mt-3 flex justify-between">
              <span className="text-foreground font-semibold">Due Next Month</span>
              <span className="font-bold text-lg">{formatCurrency(monthlyBill)}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Subscription Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="font-medium capitalize text-green-600">{currentUser.subscriptionStatus}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Member Since</p>
              <p className="font-medium">{new Date(currentUser.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Auto-Renewal</p>
              <p className="font-medium text-amber-600">Enabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Recent Invoices</h2>
        {billings.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {billings.slice().reverse().map(billing => (
              <BillingCard
                key={billing.id}
                billing={billing}
                connectionName={getConnectionName(billing.connectionId)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Invoices Yet</h3>
            <p className="text-muted-foreground">Your invoices will appear here once billing starts</p>
          </div>
        )}
      </div>
    </div>
  )
}
