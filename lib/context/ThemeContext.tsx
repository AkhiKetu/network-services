'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Applies the theme class to <html> and keeps the color-scheme meta in sync
// so native form controls (scrollbars, inputs) also switch correctly.
function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  // No saved preference yet — fall back to the OS/browser preference once.
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initial load (also covers the very first paint after the inline
  // no-flash script in the root layout already set the class on <html>).
  useEffect(() => {
    const initial = getInitialTheme()
    setThemeState(initial)
    applyThemeToDocument(initial)
    setMounted(true)
  }, [])

  // Cross-tab sync: when another tab in the same browser changes the theme,
  // the 'storage' event fires here so this tab updates to match.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return
      const next = event.newValue === 'dark' ? 'dark' : 'light'
      setThemeState(next)
      applyThemeToDocument(next)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyThemeToDocument(next)
    window.localStorage.setItem(THEME_STORAGE_KEY, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyThemeToDocument(next)
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
