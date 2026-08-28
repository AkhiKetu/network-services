export interface User {
  id: string
  /** Supabase profile column; customerId remains for the local business-data prototype. */
  customer_id?: string | null
  customerId?: string
  phone: string
  email?: string
  name: string
  username?: string
  role: 'owner' | 'admin' | 'user'
  subscriptionStatus: 'active' | 'inactive' | 'expired'
  joinDate: string
  totalPaid?: number
  createdBy?: string
  zone?: string
  deleted?: boolean
  deleted_at?: string | null
  created_at?: string
}

export interface Connection {
  id: string
  userId: string
  name: string
  packageName?: string
  connectionType?: string | null
  connectionDate?: string | null
  onuReceivePower?: string | null
  onuMacAddress?: string | null
  ponNumber?: string | null
  mikrotikPassword?: string | null
  activationDate: string
  expirationDate: string
  status: 'active' | 'expired' | 'pending'
  monthlyPrice: number
  deleted?: boolean
}

export interface Billing {
  id: string
  userId: string
  connectionId: string
  amount: number
  date: string
  status: 'paid' | 'pending'
  invoiceNumber: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'connection' | 'payment' | 'alert'
}
