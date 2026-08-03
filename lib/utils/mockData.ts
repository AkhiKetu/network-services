import { User, Connection, Billing, Notification } from '@/lib/types'

export const mockUsers: User[] = [
  {
    id: 'user-1',
    phone: '01711111111',
    password: 'password',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    subscriptionStatus: 'active',
    joinDate: '2024-01-15',
    totalPaid: 1200
  },
  {
    id: 'user-2',
    phone: '01722222222',
    password: 'password',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'user',
    subscriptionStatus: 'active',
    joinDate: '2024-02-10',
    totalPaid: 950
  },
  {
    id: 'user-3',
    phone: '01733333333',
    password: 'password',
    email: 'bob@example.com',
    name: 'Bob Wilson',
    role: 'user',
    subscriptionStatus: 'expired',
    joinDate: '2023-12-01',
    totalPaid: 600
  },
  {
    id: 'admin-1',
    phone: '01799999999',
    password: 'admin123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    subscriptionStatus: 'active',
    joinDate: '2024-01-01'
  }
]

export const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    userId: 'user-1',
    name: 'Office WiFi - Main Building',
    activationDate: '2024-01-20',
    expirationDate: '2024-09-20',
    status: 'active',
    monthlyPrice: 99
  },
  {
    id: 'conn-2',
    userId: 'user-1',
    name: 'Office WiFi - Branch Office',
    activationDate: '2024-02-01',
    expirationDate: '2025-02-01',
    status: 'active',
    monthlyPrice: 79
  },
  {
    id: 'conn-3',
    userId: 'user-2',
    name: 'Retail Store WiFi',
    activationDate: '2024-02-15',
    expirationDate: '2024-08-15',
    status: 'active',
    monthlyPrice: 149
  },
  {
    id: 'conn-4',
    userId: 'user-3',
    name: 'Cafe WiFi Network',
    activationDate: '2023-12-10',
    expirationDate: '2024-06-10',
    status: 'expired',
    monthlyPrice: 59
  },
  {
    id: 'conn-5',
    userId: 'user-2',
    name: 'Guest Network',
    activationDate: '2024-03-01',
    expirationDate: '2025-03-01',
    status: 'active',
    monthlyPrice: 49
  }
]

export const mockBillings: Billing[] = [
  {
    id: 'bill-1',
    userId: 'user-1',
    connectionId: 'conn-1',
    amount: 99,
    date: '2024-08-20',
    status: 'paid',
    invoiceNumber: 'INV-001'
  },
  {
    id: 'bill-2',
    userId: 'user-1',
    connectionId: 'conn-2',
    amount: 79,
    date: '2024-08-20',
    status: 'paid',
    invoiceNumber: 'INV-002'
  },
  {
    id: 'bill-3',
    userId: 'user-1',
    connectionId: 'conn-1',
    amount: 99,
    date: '2024-07-20',
    status: 'paid',
    invoiceNumber: 'INV-003'
  },
  {
    id: 'bill-4',
    userId: 'user-2',
    connectionId: 'conn-3',
    amount: 149,
    date: '2024-08-15',
    status: 'paid',
    invoiceNumber: 'INV-004'
  },
  {
    id: 'bill-5',
    userId: 'user-2',
    connectionId: 'conn-5',
    amount: 49,
    date: '2024-08-15',
    status: 'paid',
    invoiceNumber: 'INV-005'
  },
  {
    id: 'bill-6',
    userId: 'user-1',
    connectionId: 'conn-2',
    amount: 79,
    date: '2024-06-20',
    status: 'paid',
    invoiceNumber: 'INV-006'
  },
  {
    id: 'bill-7',
    userId: 'user-2',
    connectionId: 'conn-3',
    amount: 149,
    date: '2024-07-15',
    status: 'paid',
    invoiceNumber: 'INV-007'
  }
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'admin-1',
    title: 'New Connection Request',
    message: 'John Doe requested a new connection: Office WiFi - Main Building',
    timestamp: '2024-08-21T10:30:00',
    read: false,
    type: 'connection'
  },
  {
    id: 'notif-2',
    userId: 'admin-1',
    title: 'Payment Received',
    message: 'Payment of $99 received from John Doe',
    timestamp: '2024-08-21T09:15:00',
    read: true,
    type: 'payment'
  }
]
