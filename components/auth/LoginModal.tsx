'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Wifi, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/context/AuthContext'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  // Reset form state whenever the modal is (re)opened
  useEffect(() => {
    if (open) {
      setPhone('')
      setPassword('')
      setError('')
      setShowForgot(false)
    }
  }, [open])

  // Lock background scroll while the modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(phone.trim(), password)
      onClose()
      router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user')
    } catch (err) {
      setError('Invalid phone number or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        aria-label="Close login"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary rounded-lg">
              <Wifi className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Login</h2>
          <p className="text-sm text-muted-foreground">
            Use your phone number to access your account
          </p>
        </div>

        {!showForgot ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Demo accounts</p>
              <p>User: 01711111111 / password</p>
              <p>Admin: 01799999999 / admin123</p>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              New here? Your account is created by an admin — contact support
              to get connected.
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Password resets are handled by an admin. Contact support with
              your registered phone number and we'll reset it for you.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setShowForgot(false)}>
              Back to login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
