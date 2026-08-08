"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Network,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/lib/context/AuthContext";

interface CapsuleNavbarProps {
  role: "user" | "admin";
}

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  {
    label: "Bill Collection",
    href: "/dashboard/admin/collections",
    icon: ReceiptText,
  },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  {
    label: "Connections",
    href: "/dashboard/admin/connections",
    icon: Network,
  },
  {
    label: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

const USER_LINKS = [
  { label: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
  {
    label: "Connections",
    href: "/dashboard/user/connections",
    icon: Network,
  },
  {
    label: "Billing",
    href: "/dashboard/user/billing",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/user/settings",
    icon: Settings,
  },
];

function HoverLabel({ children }: { children: string }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 translate-y-1 whitespace-nowrap text-xs font-medium text-foreground opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100">
      {children}
    </span>
  );
}

export function CapsuleNavbar({ role }: CapsuleNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  const { logout } = useAuth();
  const router = useRouter();

  const links = role === "admin" ? ADMIN_LINKS : USER_LINKS;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-3">
      <nav
        className={`flex items-center rounded-full border border-border bg-card/90 shadow-lg backdrop-blur-xl transition-all duration-200 ease-out ${
          scrolled
            ? "gap-0.5 px-2 py-2"
            : "gap-1 px-3 py-2.5"
        }`}
      >
        {/* Logo */}
        <Link
          href={`/dashboard/${role}`}
          aria-label="Creative Cable & Networks"
          className="shrink-0 cursor-pointer px-1"
        >
          <Image
            src="/ccnetworks-logo-transparent.png"
            alt="Creative Cable & Networks"
            width={32}
            height={32}
            priority
            className="h-8 w-8 object-contain"
          />
        </Link>

        {/* Navigation */}
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <div key={link.href} className="group relative shrink-0">
              <Link
                href={link.href}
                aria-label={link.label}
                className="flex cursor-pointer items-center gap-1.5 px-2 py-2 text-sm font-medium text-muted-foreground transition-[color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:text-primary"
              >
                <Icon className="h-4 w-4" />

                {!scrolled && (
                  <span className="hidden whitespace-nowrap sm:inline">
                    {link.label}
                  </span>
                )}
              </Link>

              {/* Only appears after navbar shrinks */}
              {scrolled && <HoverLabel>{link.label}</HoverLabel>}
            </div>
          );
        })}

        {/* Theme */}
        <div className="group relative shrink-0">
          <ThemeToggle className="cursor-pointer border-0 bg-transparent" />

          {scrolled && <HoverLabel>Theme</HoverLabel>}
        </div>

        {/* Logout */}
        <div className="group relative shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-muted-foreground transition-[color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {scrolled && <HoverLabel>Logout</HoverLabel>}
        </div>
      </nav>
    </header>
  );
}