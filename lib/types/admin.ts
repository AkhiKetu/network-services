import type { EffectiveConnectionStatus } from '@/lib/utils/connectionStatus'

export type AdminRole = 'owner' | 'admin'
export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'bank'
export type BillingStatus = 'paid' | 'unpaid'

export interface AdminProfile {
  id: string
  customer_id: string | null
  name: string | null
  phone: string | null
  zone: string | null
  role: 'owner' | 'admin' | 'user'
  created_at: string | null
  deleted_at: string | null
}

export interface AdminConnection {
  id: string
  user_id: string
  package_name: string
  monthly_price: number
  status: 'active' | 'expired' | 'pending'
  start_date: string
  renewal_date: string
  created_at: string | null
  deleted_at: string | null
}

export interface AdminBilling {
  id: string
  user_id: string
  connection_id: string
  amount: number
  billing_month: string
  due_date: string
  status: BillingStatus
  paid_at: string | null
  created_at: string | null
}

export interface AdminCollection {
  id: string
  user_id: string
  billing_id: string | null
  amount: number
  payment_method: PaymentMethod
  reference_note: string | null
  collected_by: string
  created_at: string
}

export interface AdminNotification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface AdminCustomer extends AdminProfile {
  connection: AdminConnection | null
  connection_status: EffectiveConnectionStatus | null
  unpaid_billing: AdminBilling | null
}

export interface RecentCollection extends AdminCollection {
  customer_name: string
  customer_phone: string
  customer_zone: string
  collector_name: string
}
