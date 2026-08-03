'use client'

import { Billing } from '@/lib/types'
import { formatDate } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/billCalculator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, Clock } from 'lucide-react'

interface BillingCardProps {
  billing: Billing
  onDownload?: (id: string) => void
  onPay?: (id: string) => void
  connectionName?: string
}

export const BillingCard: React.FC<BillingCardProps> = ({
  billing,
  onDownload,
  onPay,
  connectionName
}) => {
  const isPaid = billing.status === 'paid'

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{billing.invoiceNumber}</h3>
            {connectionName && (
              <p className="text-xs text-muted-foreground">{connectionName}</p>
            )}
          </div>
        </div>
        <Badge variant={isPaid ? "default" : "secondary"} className={isPaid ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-300" : ""}>
          {isPaid ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <Clock className="w-3 h-3 mr-1" />
          )}
          {isPaid ? 'Paid' : 'Pending'}
        </Badge>
      </div>

      {/* Amount and Date */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Amount</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(billing.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Date</p>
          <p className="font-medium text-foreground">{formatDate(billing.date)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        {onDownload && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(billing.id)}
            className="flex-1"
          >
            Download
          </Button>
        )}
        {!isPaid && onPay && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onPay(billing.id)}
          >
            Pay Now
          </Button>
        )}
      </div>
    </div>
  )
}
