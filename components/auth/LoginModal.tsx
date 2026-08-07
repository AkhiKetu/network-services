'use client'

import { FormEvent, useEffect, useState,} from 'react'
import { useRouter } from 'next/navigation'
import { X, Wifi, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/context/AuthContext'
import { AnimatePresence, motion } from 'motion/react'


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

  useEffect(() => {
    if (!open) return

    setPhone('')
    setPassword('')
    setError('')
    setShowForgot(false)
  }, [open])

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(phone.trim(), password)

      onClose()

      router.push(
        user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'
      )
    } catch {
      setError('Invalid phone number or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          initial="closed"
          animate="open"
          exit="closed"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close login"
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-black/60"
            variants={{
              closed: { opacity: 0, backdropFilter: 'blur(0px)' },
              open: { opacity: 1, backdropFilter: 'blur(6px)' },
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm"
            variants={{
              closed: {
                opacity: 0,
                y: 40,
                scale: 0.92,
                filter: 'blur(4px)',
              },
              open: {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
              },
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 26,
              mass: 0.9,
              opacity: { duration: 0.25 },
              filter: { duration: 0.25 },
            }}
          >
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 cursor-pointer text-muted-foreground transition-[color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 space-y-2 text-center">
                <div className="mb-2 flex justify-center">
                  <motion.div
                    className="rounded-lg bg-primary p-3"
                    initial={{ scale: 0.7, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 18,
                      delay: 0.12,
                    }}
                  >
                    <Wifi className="h-7 w-7 text-white" />
                  </motion.div>
                </div>

                <h2
                  id="login-modal-title"
                  className="text-2xl font-bold text-foreground"
                >
                  Login
                </h2>

                <p className="text-sm text-muted-foreground">
                  Use your phone number to access your account
                </p>
              </div>

              {!showForgot ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </label>

                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Lock className="h-4 w-4" />
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="cursor-pointer text-xs text-primary transition-colors duration-200 ease-out hover:text-primary/70"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  {/* <div className="space-y-1 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Demo accounts</p>
                    <p>User: 01711111111 / password</p>
                    <p>Admin: 01799999999 / admin123</p>
                  </div> */}

                  <p className="text-center text-xs text-muted-foreground">
                    New here? Your account is created by an admin — contact
                    support to get connected.
                  </p>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Password resets are handled by an admin. Contact support
                    with your registered phone number and we&apos;ll reset it
                    for you.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
                    onClick={() => setShowForgot(false)}
                  >
                    Back to login
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}