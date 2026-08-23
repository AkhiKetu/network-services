'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

interface ProfileRow {
  id: string
  customer_id: string | null
  name: string | null
  phone: string | null
  zone: string | null
  role: User['role']
  created_at: string | null
  deleted_at: string | null
}

interface AuthContextType {
  currentUser: User | null
  isLoading: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Pick<User, 'name'>>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function toCurrentUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    customer_id: profile.customer_id,
    customerId: profile.customer_id ?? undefined,
    name: profile.name ?? 'CCNetworks customer',
    phone: profile.phone ?? '',
    zone: profile.zone ?? undefined,
    role: profile.role,
    joinDate: profile.created_at ?? new Date().toISOString(),
    subscriptionStatus: 'active',
    deleted_at: profile.deleted_at,
  }
}

function readableAuthError(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return 'Invalid email or password.'
  }

  return message
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = async (userId: string) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, customer_id, name, phone, zone, role, created_at, deleted_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      throw new Error(`Unable to load profile: ${error.message}`)
    }

    if (!data) {
      throw new Error('No portal profile found for this account.')
    }

    if (data.deleted_at) {
      throw new Error('This account has been deactivated.')
    }

    return toCurrentUser(data as ProfileRow)
  }

  useEffect(() => {
    const supabase = createClient()
    let active = true

    const restoreSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (!active) return

      if (error || !session?.user) {
        setCurrentUser(null)
        setIsLoading(false)
        return
      }

      try {
        const profile = await loadProfile(session.user.id)

        if (active) {
          setCurrentUser(profile)
        }
      } catch (error) {
        console.error(error)

        if (active) {
          setCurrentUser(null)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void restoreSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT' || !session?.user) {
        setCurrentUser(null)
        setIsLoading(false)
        return
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        void loadProfile(session.user.id)
          .then(profile => {
            if (active) setCurrentUser(profile)
          })
          .catch(error => {
            console.error(error)
            if (active) setCurrentUser(null)
          })
          .finally(() => {
            if (active) setIsLoading(false)
          })
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.user) {
        throw new Error(
          readableAuthError(error?.message ?? 'Unable to sign in.')
        )
      }

      const profile = await loadProfile(data.user.id)

      setCurrentUser(profile)

      return profile
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    setCurrentUser(null)

    if (error) {
      throw new Error(`Unable to sign out: ${error.message}`)
    }
  }

  const updateProfile = async (
    updates: Partial<Pick<User, 'name'>>
  ) => {
    if (!currentUser || !updates.name?.trim()) return

    const name = updates.name.trim()
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', currentUser.id)

    if (error) {
      throw new Error(`Unable to update profile: ${error.message}`)
    }

    setCurrentUser(user =>
      user ? { ...user, name } : null
    )
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        loading: isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
