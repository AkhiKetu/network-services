'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

// Single-icon theme switch: the icon shown is the mode you'll switch INTO.
// Light mode -> shows a moon (tap to go dark). Dark mode -> shows a sun
// (tap to go light). One button, one click, no separate on/off states.
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return <div className={cn('h-9 w-9 rounded-full bg-muted', className)} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 shrink-0',
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
