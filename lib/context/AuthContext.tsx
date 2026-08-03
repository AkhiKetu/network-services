'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { useApp } from '@/lib/context/AppContext'

interface AuthContextType {
  currentUser: User | null
  isLoading: boolean
  login: (phone: string, password: string) => Promise<User>
  logout: () => void
  updateProfile: (updates: Partial<Pick<User, 'name'>>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, updateUser } = useApp()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        // Older cached sessions won't have a phone field — discard those
        // rather than restoring a broken session.
        if (parsed && typeof parsed.phone === 'string') {
          setCurrentUser(parsed)
        } else {
          localStorage.removeItem('currentUser')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setIsLoading(false)
  }, [])

  // Login is unified for both roles: the phone number is the account id,
  // and the account's own role (set at creation time) decides where it lands.
  const login = async (phone: string, password: string) => {
    setIsLoading(true)
    try {
      const user = users.find(u => u.phone === phone && u.password === password)
      if (!user) {
        throw new Error('Invalid phone number or password')
      }
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
      return user
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  // Lets the logged-in account "finalize" details set at creation time
  // (e.g. the hardcoded initial admin name) into whatever they choose.
  // Keeps the active session and the shared users list both in sync.
  const updateProfile = (updates: Partial<Pick<User, 'name'>>) => {
    if (!currentUser) return
    const updated = { ...currentUser, ...updates }
    setCurrentUser(updated)
    localStorage.setItem('currentUser', JSON.stringify(updated))
    updateUser(updated)
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
