'use client'

import { Connection, User } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User as UserIcon, Phone, DollarSign, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/billCalculator'

interface UserCardProps {
  user: User
  connection?: Connection
  onManage?: (user: User) => void
  onEmail?: (user: User) => void
  onDelete?: (user: User) => void
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  connection,
  onManage,
  onEmail,
  onDelete
}) => {
  const getSubscriptionBadge = (status: string) => {
    if (user.deleted) return <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Deleted</Badge>
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-300">Active</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="secondary">Inactive</Badge>
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{user.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3" /> {user.phone}
            </p>
          </div>
        </div>
        {getSubscriptionBadge(user.subscriptionStatus)}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Customer ID</p>
          <p className="font-medium text-foreground">{user.customerId || user.id}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Zone / Area</p>
          <p className="font-medium text-foreground">{user.zone || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Package</p>
          <p className="font-medium text-foreground">{connection?.packageName || connection?.name || 'No connection'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Monthly bill</p>
          <p className="font-medium text-foreground flex items-center gap-1"><DollarSign className="w-4 h-4" />{connection ? formatCurrency(connection.monthlyPrice) : formatCurrency(0)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        {onManage && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onManage(user)}
          >
            Manage
          </Button>
        )}
        {onEmail && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEmail(user)}
          >
            Contact
          </Button>
        )}
        {onDelete && (
          <Button size="sm" variant="destructive" onClick={() => onDelete(user)} className="cursor-pointer gap-1">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        )}
      </div>
    </div>
  )
}
