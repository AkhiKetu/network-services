'use client'

import { Connection } from '@/lib/types'
import { formatDate, getDaysRemaining, isExpiringSoon, isExpired } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/billCalculator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ConnectionCardProps {
  connection: Connection
  onRenew?: (connection: Connection) => void
  showUser?: boolean
  userName?: string
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onRenew,
  showUser = false,
  userName
}) => {
  const daysRemaining = getDaysRemaining(connection.expirationDate)
  const isExpiredStatus = isExpired(connection.expirationDate)
  const isExpiringSoonStatus = isExpiringSoon(connection.expirationDate)

  const getStatusBadge = () => {
    if (connection.deleted) {
      return <Badge variant="secondary" className="flex items-center gap-1 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"><XCircle className="w-3 h-3" /> Deleted</Badge>
    }
    if (isExpiredStatus) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Expired</Badge>
    }
    if (isExpiringSoonStatus) {
      return <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-300"><AlertTriangle className="w-3 h-3" /> Expiring Soon</Badge>
    }
    return <Badge className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-300"><CheckCircle className="w-3 h-3" /> Active</Badge>
  }

  return (
    <article className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Wifi className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="truncate font-semibold text-foreground">{connection.packageName || connection.name}</h3>
            {showUser && userName && (
              <p className="text-xs text-muted-foreground">{userName}</p>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Activation Date</p>
          <p className="font-medium text-foreground">{formatDate(connection.activationDate)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Expiration Date</p>
          <p className="font-medium text-foreground">{formatDate(connection.expirationDate)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Monthly Price</p>
          <p className="font-medium text-foreground">{formatCurrency(connection.monthlyPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Days Remaining</p>
          <p className={`font-medium ${daysRemaining <= 0 ? 'text-red-600' : 'text-foreground'}`}>
            {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days`}
          </p>
        </div>
      </div>

      {onRenew && (
        <div className="flex border-t border-border pt-3">
          <Button
            size="sm"
            variant={isExpiredStatus ? 'default' : 'outline'}
            onClick={() => onRenew(connection)}
            className="flex-1 cursor-pointer"
          >
            {isExpiredStatus ? 'Reactivate' : 'Renew'}
          </Button>
        </div>
      )}
    </article>
  )
}
