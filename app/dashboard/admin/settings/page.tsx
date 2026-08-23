'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useApp } from '@/lib/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Phone, Settings as SettingsIcon, Database, Shield, Plus, X, Check, Pencil } from 'lucide-react'

export default function AdminSettings() {
  const { currentUser, updateProfile } = useAuth()
  const { users, addUser, isPhoneTaken } = useApp()

  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [formError, setFormError] = useState('')

  // Editable display name. The account starts out with a hardcoded name
  // (set in mock data) — this lets the admin finalize it to their own.
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [nameSaved, setNameSaved] = useState(false)

  if (!currentUser) return null

  const startEditingName = () => {
    setNameDraft(currentUser.name)
    setIsEditingName(true)
    setNameSaved(false)
  }

  const cancelEditingName = () => {
    setIsEditingName(false)
    setNameDraft('')
  }

  const saveName = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = nameDraft.trim()
    if (!trimmed) return
    updateProfile({ name: trimmed })
    setIsEditingName(false)
    setNameSaved(true)
  }

  const admins = users.filter(u => u.role === 'admin')

  const handleAddAdmin = (e: React.FormEvent) => {
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
      id: `admin-${Date.now()}`,
      phone,
      password: newPassword,
      name: newName.trim(),
      role: 'admin',
      subscriptionStatus: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id
    })

    setNewName('')
    setNewPhone('')
    setNewPassword('')
    setShowAddAdmin(false)
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-10 pt-4 sm:space-y-6 sm:px-6 sm:pt-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">Configure system settings and integrations</p>
      </div>

      {/* Admin Profile */}
      <div className="w-full rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6 space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Admin Profile</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>

            {!isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={currentUser.name}
                  disabled
                  className="bg-muted"
                />
                <Button type="button" variant="outline" size="default" onClick={startEditingName} className="gap-1.5 shrink-0">
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            ) : (
              <form onSubmit={saveName} className="flex items-center gap-2">
                <Input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                  required
                />
                <Button type="submit" size="default" className="gap-1.5 shrink-0">
                  <Check className="w-4 h-4" />
                  Save
                </Button>
                <Button type="button" variant="outline" size="default" onClick={cancelEditingName} className="gap-1.5 shrink-0">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </form>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              This is the name shown in the navbar greeting. It starts out as
              the default account name until you finalize it here.
            </p>
            {nameSaved && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Name updated — the navbar greeting now reflects your new name.
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number (login ID)
            </label>
            <Input
              type="tel"
              value={currentUser.phone}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Admin Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admin Status
            </label>
            <div className="inline-block px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300 rounded font-medium">
              Super Admin
            </div>
          </div>
        </div>
      </div>

      {/* Manage Admins */}
      <div className="w-full rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6" /> Admin Accounts
          </h2>
          <Button size="sm" onClick={() => setShowAddAdmin(!showAddAdmin)} className="gap-2">
            {showAddAdmin ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddAdmin ? 'Cancel' : 'Add Admin'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground -mt-4">
          Only existing admins can create new admin accounts.
        </p>

        {showAddAdmin && (
          <form onSubmit={handleAddAdmin} className="space-y-4 border-t border-border pt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Admin Name" required />
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
            <Button type="submit" className="w-full">Create Admin</Button>
          </form>
        )}

        <div className="space-y-2">
          {admins.map(admin => (
            <div key={admin.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{admin.name}</p>
                <p className="text-xs text-muted-foreground">{admin.phone}</p>
              </div>
              {admin.id === currentUser.id && (
                <span className="text-xs text-primary font-medium">You</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Settings */}
      <div className="w-full rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6 space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" /> System Settings
        </h2>

        <div className="space-y-4">
          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-foreground mb-2">Platform Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">System-wide settings for the platform</p>
            <Button variant="outline" className="w-full">
              Configure (Coming Soon)
            </Button>
          </div>

          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-foreground mb-2">Notification Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage how you receive notifications</p>
            <Button variant="outline" className="w-full">
              Configure Notifications (Coming Soon)
            </Button>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Email Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">Set up email notifications and templates</p>
            <Button variant="outline" className="w-full">
              Configure Email (Coming Soon)
            </Button>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="w-full rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6 space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-6 h-6" /> Integrations
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">MongoDB Database</p>
              <p className="text-sm text-muted-foreground">Backend data storage</p>
            </div>
            <span className="text-amber-600 font-medium">Coming Soon</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Google Authentication</p>
              <p className="text-sm text-muted-foreground">OAuth 2.0 login integration</p>
            </div>
            <span className="text-amber-600 font-medium">Coming Soon</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Stripe Payments</p>
              <p className="text-sm text-muted-foreground">Payment processing and subscriptions</p>
            </div>
            <span className="text-amber-600 font-medium">Coming Soon</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Email Service</p>
              <p className="text-sm text-muted-foreground">SendGrid or similar SMTP provider</p>
            </div>
            <span className="text-amber-600 font-medium">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Security & Compliance */}
      <div className="w-full rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6 space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6" /> Security & Compliance
        </h2>

        <div className="space-y-4">
          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-foreground mb-2">Data Backup</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage automated backups and recovery</p>
            <Button variant="outline" className="w-full">
              Configure Backups (Coming Soon)
            </Button>
          </div>

          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-foreground mb-2">Audit Logs</h3>
            <p className="text-sm text-muted-foreground mb-4">View system activity and user actions</p>
            <Button variant="outline" className="w-full">
              View Audit Logs (Coming Soon)
            </Button>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">API Keys</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage API keys for external integrations</p>
            <Button variant="outline" className="w-full">
              Manage API Keys (Coming Soon)
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-950 sm:p-6">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
        <p className="text-muted-foreground mb-4">These actions are irreversible and affect all users.</p>
        <div className="space-y-2">
          <Button variant="destructive" className="w-full">
            Reset All Data (Coming Soon)
          </Button>
          <Button variant="destructive" className="w-full">
            Export System Report (Coming Soon)
          </Button>
        </div>
      </div>
    </main>
  )
}
