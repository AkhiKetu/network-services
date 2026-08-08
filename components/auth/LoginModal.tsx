"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/context/AuthContext";
import { AnimatePresence, motion } from "motion/react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    setPhone("");
    setPassword("");
    setError("");
    setShowForgot(false);

    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(phone.trim(), password);

      onClose();
      router.push(
        user.role === "admin" ? "/dashboard/admin" : "/dashboard/user",
      );
    } catch {
      setError("Invalid phone number or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-white/40 border-white/30 backdrop-blur-md dark:bg-white/[0.06] dark:border-white/10";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close login"
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-sm dark:bg-black/70"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="
              relative z-10 w-full max-w-sm
              rounded-2xl border border-white/30
              bg-white/65 p-6
              shadow-xl backdrop-blur-2xl
              dark:border-white/10
              dark:bg-zinc-900/70
            "
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close login"
              className="
                absolute right-4 top-4
                flex h-8 w-8 cursor-pointer items-center justify-center
                rounded-full
                text-muted-foreground
                transition-all duration-200
                hover:bg-black/5 hover:text-foreground
                dark:hover:bg-white/10
              "
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <img
                src="/ccnetworks-logo-transparent.png"
                alt="Creative Cable & Networks"
                className="mx-auto mb-2 h-32 w-32 object-contain"
              />

              <h2
                id="login-modal-title"
                className="text-2xl font-bold text-foreground"
              >
                Login
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to your Creative Cable & Networks account.
              </p>
            </div>

            {!showForgot ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>

                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="01-XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoFocus
                    className={inputClass}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Lock className="h-4 w-4" />
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="cursor-pointer text-xs text-primary hover:text-primary/70"
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
                    className={inputClass}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                {/* Login */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="
                    w-full cursor-pointer
                    bg-sky-500 text-slate-900
                    font-semibold
                    shadow-sm
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-sky-300
                    hover:shadow-md
                    active:translate-y-0
                    dark:bg-white
                    dark:text-black
                    dark:font-bold
                    dark:hover:bg-white/90
                  "
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  New here? Your account is created by an admin — contact
                  support to get connected.
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  Password resets are handled by an admin. Contact support with
                  your registered phone number and we&apos;ll reset it for you.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgot(false)}
                  className="w-full cursor-pointer"
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
