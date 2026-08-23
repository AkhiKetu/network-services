export interface User {
  id: string
  customerId?: string
  phone: string
  password: string
  email?: string
  name: string
  role: 'user' | 'admin'
  subscriptionStatus: 'active' | 'inactive' | 'expired'
  joinDate: string
  totalPaid?: number
  createdBy?: string
  zone?: string
  deleted?: boolean
}

export interface Connection {
  id: string
  userId: string
  name: string
  packageName?: string
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
