'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useApp } from '@/lib/context/AppContext'
import { ConnectionCard } from '@/components/cards/ConnectionCard'
import { Input } from '@/components/ui/input'
import { Wifi, Search } from 'lucide-react'
import { getRenewalDate } from '@/lib/utils/dateUtils'

export default function UserConnections() {
  const { currentUser } = useAuth()
  const { getUserConnections, updateConnection } = useApp()
  const [searchTerm, setSearchTerm] = useState('')

  if (!currentUser) return null

  const connections = getUserConnections(currentUser.id)
  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRenew = (connection: typeof connections[0]) => {
    updateConnection({
      ...connection,
      expirationDate: getRenewalDate(),
      status: 'active',
    })
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-10 pt-4 sm:space-y-6 sm:px-6 sm:pt-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-primary">My internet service</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">My Connections</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">View your active packages, monthly bills and renewal dates.</p>
      </div>

      {/* Search */}
      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"><div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input placeholder="Search connections..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-11 pl-10" /></div></section>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Total Connections', connections.length, 'text-foreground'],
          ['Active', connections.filter(c => c.status === 'active').length, 'text-green-600'],
          ['Expired', connections.filter(c => c.status === 'expired').length, 'text-red-600'],
        ].map(([label, value, color]) => (
          <article key={label} className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
            <p className={`mt-2 text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
          </article>
        ))}
      </div>

      {/* Connections Grid */}
      {filteredConnections.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {filteredConnections.map(connection => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onRenew={handleRenew}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
          <Wifi className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">{searchTerm ? 'No connections found' : 'No connections yet'}</h3>
          <p className="text-muted-foreground">{searchTerm ? 'Try adjusting your search' : 'Contact support to add your first connection'}</p>
        </section>
      )}
    </main>
  )
}
