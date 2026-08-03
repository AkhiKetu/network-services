'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { UserCard } from '@/components/cards/UserCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Search, Phone, Plus, X } from 'lucide-react'
import { User } from '@/lib/types'

export default function AdminUsers() {
  const { users, addUser, isPhoneTaken } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<'all' | 'active' | 'inactive'>('all')

  // Add-user form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [formError, setFormError] = useState('')

  const regularUsers = users.filter(u => u.role === 'user')

  let filteredUsers = regularUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  if (selectedRole === 'active') {
    filteredUsers = filteredUsers.filter(u => u.subscriptionStatus === 'active')
  } else if (selectedRole === 'inactive') {
    filteredUsers = filteredUsers.filter(u => u.subscriptionStatus !== 'active')
  }

  const handleManage = (user: User) => {
    alert(`Manage user: ${user.name}\n\nFull integration coming with MongoDB and payment system`)
  }

  const handleContact = (user: User) => {
    alert(`Call/SMS: ${user.phone}\n\nMessaging integration coming soon`)
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const phone = newPhone.trim()
    if (!phone || !newName.trim() || !newPassword) {
      setFormError('All fields are required.')
      return
    }
    if (isPhoneTaken(phone)) {
      setFormError('This phone number is already registered.')
      return
    }

    addUser({
      id: `user-${Date.now()}`,
      phone,
      password: newPassword,
      name: newName.trim(),
      role: 'user',
      subscriptionStatus: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      totalPaid: 0,
      createdBy: 'admin-1'
    })

    setNewName('')
    setNewPhone('')
    setNewPassword('')
    setShowAddForm(false)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all users and their subscriptions. Users register only when you create their account here.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add User'}
        </Button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddUser}
          className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-xl"
        >
          <h2 className="font-semibold text-foreground">New User Account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number (login ID)</label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="01XXXXXXXXX" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Temporary Password</label>
            <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Set a password" required />
          </div>
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {formError}
            </div>
          )}
          <Button type="submit" className="w-full">Create User</Button>
        </form>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users by name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedRole === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedRole('all')}
          >
            All Users ({regularUsers.length})
          </Button>
          <Button
            variant={selectedRole === 'active' ? 'default' : 'outline'}
            onClick={() => setSelectedRole('active')}
          >
            Active ({regularUsers.filter(u => u.subscriptionStatus === 'active').length})
          </Button>
          <Button
            variant={selectedRole === 'inactive' ? 'default' : 'outline'}
            onClick={() => setSelectedRole('inactive')}
          >
            Inactive ({regularUsers.filter(u => u.subscriptionStatus !== 'active').length})
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-3xl font-bold text-foreground">{regularUsers.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold text-green-600">{regularUsers.filter(u => u.subscriptionStatus === 'active').length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-600">
            ${regularUsers.reduce((sum, u) => sum + (u.totalPaid || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onManage={handleManage}
              onEmail={handleContact}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No users found' : 'No users'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search' : 'No users match the current filters'}
          </p>
        </div>
      )}
    </div>
  )
}
