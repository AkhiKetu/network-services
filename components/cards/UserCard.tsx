'use client'

import {
  DollarSign,
  Phone,
  Trash2,
  User as UserIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { Connection, User } from '@/lib/types'
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
  onDelete,
}) => {
  const getSubscriptionBadge = (status: string) => {
    if (user.deleted) {
      return (
        <Badge
          variant="secondary"
          className="
            border border-red-200
            bg-red-100
            text-red-700
            hover:bg-red-200
            hover:text-red-800
            dark:border-red-900/60
            dark:bg-red-950/50
            dark:text-red-400
            dark:hover:bg-red-900/60
            dark:hover:text-red-300
          "
        >
          Deleted
        </Badge>
      )
    }

    switch (status) {
      case 'active':
        return (
          <Badge
            className="
              border border-green-200
              bg-green-100
              text-green-800
              hover:bg-green-200
              dark:border-green-900/60
              dark:bg-green-950/50
              dark:text-green-400
              dark:hover:bg-green-900/60
            "
          >
            Active
          </Badge>
        )

      case 'expired':
        return (
          <Badge variant="destructive">
            Expired
          </Badge>
        )

      default:
        return (
          <Badge variant="secondary">
            Inactive
          </Badge>
        )
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {user.name}
            </h3>

            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {user.phone}
            </p>
          </div>
        </div>

        {getSubscriptionBadge(user.subscriptionStatus)}
      </div>

      {/* Details */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Customer ID
          </p>

          <p className="font-medium text-foreground">
            {user.customerId || user.id}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Zone / Area
          </p>

          <p className="font-medium text-foreground">
            {user.zone || 'Unassigned'}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Package
          </p>

          <p className="font-medium text-foreground">
            {connection?.packageName ||
              connection?.name ||
              'No connection'}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Monthly bill
          </p>

          <p className="flex items-center gap-1 font-medium text-foreground">
            <DollarSign className="h-4 w-4" />
            {connection
              ? formatCurrency(connection.monthlyPrice)
              : formatCurrency(0)}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Connection type
          </p>

          <p className="font-medium text-foreground">
            {connection?.connectionType || 'Not set'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border pt-2">
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
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(user)}
            className="cursor-pointer gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
