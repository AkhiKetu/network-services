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
  onDelete?: (id: string) => void
  showUser?: boolean
  userName?: string
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onRenew,
  onDelete,
  showUser = false,
  userName
}) => {
  const daysRemaining = getDaysRemaining(connection.expirationDate)
  const isExpiredStatus = isExpired(connection.expirationDate)
  const isExpiringSoonStatus = isExpiringSoon(connection.expirationDate)

  const getStatusBadge = () => {
    if (isExpiredStatus) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Expired</Badge>
    }
    if (isExpiringSoonStatus) {
      return <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-300"><AlertTriangle className="w-3 h-3" /> Expiring Soon</Badge>
    }
    return <Badge className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-300"><CheckCircle className="w-3 h-3" /> Active</Badge>
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Wifi className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{connection.name}</h3>
            {showUser && userName && (
              <p className="text-xs text-muted-foreground">{userName}</p>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
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

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {!isExpiredStatus && onRenew && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRenew(connection)}
            className="flex-1"
          >
            Renew
          </Button>
        )}
        {isExpiredStatus && onRenew && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onRenew(connection)}
          >
            Reactivate
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(connection.id)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
