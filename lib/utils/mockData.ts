import { User, Connection, Billing, Notification } from '@/lib/types'

export const mockUsers: User[] = [
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

export const mockConnections: Connection[] = []

export const mockBillings: Billing[] = []

export const mockNotifications: Notification[] = []
