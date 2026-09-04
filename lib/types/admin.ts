import type { EffectiveConnectionStatus } from '@/lib/utils/connectionStatus'

export type AdminRole = 'owner' | 'admin' | 'collector'
export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'bank'
export type BillingStatus = 'paid' | 'partial' | 'unpaid'
export type PaymentType = 'full' | 'partial' | 'advance'

export interface AdminProfile {
  id: string
  customer_id: string | null
  name: string | null
  username: string | null
  phone: string | null
  zone: string | null
  role: 'owner' | 'admin' | 'collector' | 'user'
  created_at: string | null
  deleted_at: string | null
}

export interface AdminConnection {
  id: string
  user_id: string
  package_name: string
  monthly_price: number
  connection_type: string | null
  connection_date: string | null
  onu_receive_power: string | null
  onu_mac_address: string | null
  pon_number: string | null
  mikrotik_password: string | null
  status: 'active' | 'expired' | 'pending'
  start_date: string
  renewal_date: string
  billing_start_date: string | null
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
  customer_id_snapshot: string | null
  customer_name_snapshot: string | null
  zone_snapshot: string | null
  package_name_snapshot: string | null
  created_at: string | null
}

export interface AdminCollection {
  id: string
  user_id: string
  billing_id: string | null
  connection_id: string | null
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod
  reference_note: string | null
  collected_by: string
  billing_month: string | null
  customer_id_snapshot: string | null
  customer_name_snapshot: string | null
  zone_snapshot: string | null
  package_name_snapshot: string | null
  created_at: string
  collector_name?: string
}

export interface AdminCollectionAllocation {
  id: string
  collection_id: string
  billing_id: string
  amount: number
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
