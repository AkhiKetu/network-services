'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Trend */}
      {trend && (
        <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% this month
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  )
}
