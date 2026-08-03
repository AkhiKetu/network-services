'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Phone, Lock, Calendar } from 'lucide-react'

export default function UserSettings() {
  const { currentUser } = useAuth()

  if (!currentUser) return null

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <Input
                type="text"
                value={currentUser.name}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Change name in profile settings (future feature)</p>
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
              <p className="text-xs text-muted-foreground mt-1">Contact an admin to change your registered phone number</p>
            </div>

            {/* Join Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Member Since
              </label>
              <Input
                type="text"
                value={new Date(currentUser.joinDate).toLocaleDateString()}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" /> Security
          </h3>
          <Button variant="outline" className="w-full">
            Change Password (Coming Soon)
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Password reset feature will be available after integration with authentication system</p>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates about your connections</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" disabled />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Billing Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified of upcoming payments</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" disabled />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Expiration Reminders</p>
              <p className="text-sm text-muted-foreground">Receive alerts before connections expire</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" disabled />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-2xl">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
        <p className="text-muted-foreground mb-4">These actions cannot be undone.</p>
        <Button variant="destructive" className="w-full">
          Delete Account (Coming Soon)
        </Button>
      </div>
    </div>
  )
}
