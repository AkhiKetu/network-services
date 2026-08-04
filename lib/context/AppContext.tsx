'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Connection, Billing, Notification } from '@/lib/types'
import { mockUsers, mockConnections, mockBillings, mockNotifications } from '@/lib/utils/mockData'

interface AppContextType {
  users: User[]
  connections: Connection[]
  billings: Billing[]
  notifications: Notification[]
  addConnection: (connection: Connection) => void
  updateConnection: (connection: Connection) => void
  deleteConnection: (id: string) => void
  addBilling: (billing: Billing) => void
  addUser: (user: User) => void
  updateUser: (user: User) => void
  isPhoneTaken: (phone: string) => boolean
  getUserConnections: (userId: string) => Connection[]
  getUserBillings: (userId: string) => Billing[]
  getUnreadNotifications: () => Notification[]
  markNotificationAsRead: (id: string) => void
}

// Bump this whenever the shape of stored data changes (e.g. User fields).
// Prevents old cached localStorage data from silently breaking the app
// after an update.
const DATA_VERSION = '2'

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [billings, setBillings] = useState<Billing[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const storedVersion = localStorage.getItem('appDataVersion')

    if (storedVersion !== DATA_VERSION) {
      // Schema changed since this data was cached — wipe it and reseed
      // from the current mock data rather than loading incompatible records.
      localStorage.removeItem('appUsers')
      localStorage.removeItem('appConnections')
      localStorage.removeItem('appBillings')
      localStorage.removeItem('appNotifications')
      localStorage.removeItem('currentUser')
      localStorage.setItem('appDataVersion', DATA_VERSION)

      setUsers(mockUsers)
      setConnections(mockConnections)
      setBillings(mockBillings)
      setNotifications(mockNotifications)
      return
    }

    const savedUsers = localStorage.getItem('appUsers')
    const savedConnections = localStorage.getItem('appConnections')
    const savedBillings = localStorage.getItem('appBillings')
    const savedNotifications = localStorage.getItem('appNotifications')

    try {
      setUsers(savedUsers ? JSON.parse(savedUsers) : mockUsers)
      setConnections(savedConnections ? JSON.parse(savedConnections) : mockConnections)
      setBillings(savedBillings ? JSON.parse(savedBillings) : mockBillings)
      setNotifications(savedNotifications ? JSON.parse(savedNotifications) : mockNotifications)
    } catch (error) {
      console.error('Error loading app data:', error)
      setUsers(mockUsers)
      setConnections(mockConnections)
      setBillings(mockBillings)
      setNotifications(mockNotifications)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('appUsers', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem('appConnections', JSON.stringify(connections))
  }, [connections])

  useEffect(() => {
    localStorage.setItem('appBillings', JSON.stringify(billings))
  }, [billings])

  useEffect(() => {
    localStorage.setItem('appNotifications', JSON.stringify(notifications))
  }, [notifications])

  const addConnection = (connection: Connection) => {
    setConnections(prev => [...prev, connection])
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'admin-1',
      title: 'New Connection Created',
      message: `A new connection has been created: ${connection.name}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'connection'
    }
    setNotifications(prev => [...prev, notification])
  }

  const updateConnection = (updatedConnection: Connection) => {
    setConnections(prev => prev.map(conn =>
      conn.id === updatedConnection.id ? updatedConnection : conn
    ))
  }

  const deleteConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id))
  }

  const addBilling = (billing: Billing) => {
    setBillings(prev => [...prev, billing])
  }

  // Used e.g. when an admin/user finalizes their display name in Settings.
  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)))
  }

  const isPhoneTaken = (phone: string) => {
    return users.some(u => u.phone === phone)
  }

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user])
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'admin-1',
      title: user.role === 'admin' ? 'New Admin Created' : 'New User Account Created',
      message: `${user.name} (${user.phone}) was added as ${user.role === 'admin' ? 'an admin' : 'a user'}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'alert'
    }
    setNotifications(prev => [...prev, notification])
  }

  const getUserConnections = (userId: string) => {
    return connections.filter(conn => conn.userId === userId)
  }

  const getUserBillings = (userId: string) => {
    return billings.filter(bill => bill.userId === userId)
  }

  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.read)
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  return (
    <AppContext.Provider value={{
      users,
      connections,
      billings,
      notifications,
      addConnection,
      updateConnection,
      deleteConnection,
      addBilling,
      addUser,
      updateUser,
      isPhoneTaken,
      getUserConnections,
      getUserBillings,
      getUnreadNotifications,
      markNotificationAsRead
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
