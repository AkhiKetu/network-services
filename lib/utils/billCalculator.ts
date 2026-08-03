import { Connection, Billing } from '@/lib/types'

export const calculateMonthlyBill = (connections: Connection[]): number => {
  return connections
    .filter(conn => conn.status === 'active')
    .reduce((total, conn) => total + conn.monthlyPrice, 0)
}

export const calculateYearlyRevenue = (connections: Connection[]): number => {
  return connections
    .filter(conn => conn.status === 'active')
    .reduce((total, conn) => total + (conn.monthlyPrice * 12), 0)
}

export const calculateUserTotalPaid = (billings: Billing[], userId: string): number => {
  return billings
    .filter(bill => bill.userId === userId && bill.status === 'paid')
    .reduce((total, bill) => total + bill.amount, 0)
}

export const calculateMonthlyRevenue = (billings: Billing[]): number => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  return billings
    .filter(bill => {
      const billDate = new Date(bill.date)
      return billDate.getMonth() === currentMonth &&
             billDate.getFullYear() === currentYear &&
             bill.status === 'paid'
    })
    .reduce((total, bill) => total + bill.amount, 0)
}

export const calculateYearlyIncomeFromBillings = (billings: Billing[]): number => {
  const today = new Date()
  const currentYear = today.getFullYear()

  return billings
    .filter(bill => {
      const billDate = new Date(bill.date)
      return billDate.getFullYear() === currentYear && bill.status === 'paid'
    })
    .reduce((total, bill) => total + bill.amount, 0)
}

export const getRevenueByMonth = (billings: Billing[]) => {
  const monthlyData: Record<string, number> = {}
  
  billings
    .filter(bill => bill.status === 'paid')
    .forEach(bill => {
      const date = new Date(bill.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + bill.amount
    })

  return monthlyData
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
