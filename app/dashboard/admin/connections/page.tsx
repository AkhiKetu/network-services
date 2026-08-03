'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { ConnectionCard } from '@/components/cards/ConnectionCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Wifi, Search } from 'lucide-react'

export default function AdminConnections() {
  const { connections, users, updateConnection, deleteConnection } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all')

  let filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (filterStatus !== 'all') {
    filteredConnections = filteredConnections.filter(c => c.status === filterStatus)
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unknown'
  }

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
        <h1 className="text-4xl font-bold text-foreground">All Connections</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage all network connections</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            All ({connections.length})
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('active')}
          >
            Active ({connections.filter(c => c.status === 'active').length})
          </Button>
          <Button
            variant={filterStatus === 'expired' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('expired')}
          >
            Expired ({connections.filter(c => c.status === 'expired').length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Connections</p>
          <p className="text-3xl font-bold text-foreground">{connections.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">{connections.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Expired</p>
          <p className="text-3xl font-bold text-red-600">{connections.filter(c => c.status === 'expired').length}</p>
        </div>
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
              showUser
              userName={getUserName(connection.userId)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Wifi className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No connections found' : 'No connections'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search' : 'No connections match the current filters'}
          </p>
        </div>
      )}
    </div>
  )
}
