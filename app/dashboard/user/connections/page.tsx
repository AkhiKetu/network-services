'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useApp } from '@/lib/context/AppContext'
import { ConnectionCard } from '@/components/cards/ConnectionCard'
import { Input } from '@/components/ui/input'
import { Wifi, Search } from 'lucide-react'

export default function UserConnections() {
  const { currentUser } = useAuth()
  const { getUserConnections, updateConnection, deleteConnection } = useApp()
  const [searchTerm, setSearchTerm] = useState('')

  if (!currentUser) return null

  const connections = getUserConnections(currentUser.id)
  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRenew = (connection: typeof connections[0]) => {
    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    updateConnection({
      ...connection,
      expirationDate: expirationDate.toISOString().split('T')[0],
      status: 'active',
    })
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">My Connections</h1>
        <p className="text-muted-foreground mt-2">Manage all your network connections</p>
      </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search connections..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-10" />
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Total Connections', connections.length, 'text-foreground'],
          ['Active', connections.filter(c => c.status === 'active').length, 'text-green-600'],
          ['Expired', connections.filter(c => c.status === 'expired').length, 'text-red-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="mb-1 text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Connections Grid */}
      {filteredConnections.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredConnections.map(connection => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onRenew={handleRenew}
              onDelete={deleteConnection}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Wifi className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">{searchTerm ? 'No connections found' : 'No connections yet'}</h3>
          <p className="text-muted-foreground">{searchTerm ? 'Try adjusting your search' : 'Contact support to add your first connection'}</p>
        </div>
      )}
    </div>
  )
}
