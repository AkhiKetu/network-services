"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/context/AuthContext";
import { AnimatePresence, motion } from "motion/react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const INPUT_CLASS =
  "h-11 border-white/40 bg-white/45 shadow-sm backdrop-blur-sm placeholder:text-slate-400 focus-visible:border-primary/60 dark:border-white/10 dark:bg-white/[0.06] dark:placeholder:text-white/30";

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    setEmail("");
    setPassword("");
    setError("");
    setShowForgot(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email.trim(), password);

      onClose();
      router.push(
        user.role === "owner" || user.role === "admin"
          ? "/dashboard/admin"
          : "/dashboard/user"
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* BACKDROP */}
          <motion.button
            type="button"
            aria-label="Close login"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* GLASS MODAL */}
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-white/45 bg-white/55 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/60"
          >
            {/* subtle glass shine */}
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/30" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close login"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* HEADER */}
            <div className="mb-5 text-center">
              <img
                src="/ccnetworks-logo-transparent.png"
                alt="Creative Cable & Networks"
                className="mx-auto mb-0 h-28 w-28 object-contain"
              />

              <h2
                id="login-modal-title"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                {showForgot ? "Reset Password" : "Login"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {showForgot
                  ? "Contact support with your registered email address."
                  : "Sign in to your Creative Cable & Networks account."}
              </p>
            </div>

            {!showForgot ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </label>

                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoFocus
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Lock className="h-4 w-4 text-primary" />
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setShowForgot(true);
                      }}
                      className="cursor-pointer text-xs font-medium text-primary transition-colors hover:text-primary/70"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/15 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="h-11 w-full cursor-pointer bg-sky-500 font-semibold text-slate-950 shadow-sm transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-sky-400 hover:shadow-md active:translate-y-0 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <p className="text-center text-xs leading-5 text-muted-foreground">
                  New here? Your account is created by an admin — contact
                  support to get connected.
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="rounded-xl border border-white/30 bg-white/30 p-4 text-center text-sm leading-6 text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]">
                  Password resets are handled by an admin. Contact support with
                  your registered email address and we&apos;ll reset it for you.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgot(false)}
                  className="h-11 w-full cursor-pointer bg-white/30 backdrop-blur-sm dark:bg-white/[0.04]"
                >
                  Back to login
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
