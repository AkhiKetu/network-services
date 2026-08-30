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
  role: "user" | "admin" | "owner" | "collector";
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

const COLLECTOR_LINKS = [
  { label: "Bill Collection", href: "/dashboard/admin/collections", icon: ReceiptText },
];

function HoverLabel({ children }: { children: string }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-full z-[60] mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg transition-[opacity,transform] duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100">
      {children}
    </span>
  );
}

export function CapsuleNavbar({ role }: CapsuleNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  const { logout } = useAuth();
  const router = useRouter();

  const isPrivileged = role === "owner" || role === "admin";
  const isCollector = role === "collector";
  const links = isPrivileged ? ADMIN_LINKS : isCollector ? COLLECTOR_LINKS : USER_LINKS;

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Unable to sign out:", error);
    }
    router.push("/");
  };

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-2 sm:px-3">
      <nav
        className={`flex max-w-[calc(100vw-1.5rem)] items-center rounded-full border border-border bg-card/90 shadow-lg backdrop-blur-xl transition-all duration-200 ease-out ${
          scrolled
            ? "gap-0 px-1 py-1.5 sm:gap-0.5 sm:px-2 sm:py-2"
            : "gap-0 px-1.5 py-1.5 sm:gap-1 sm:px-3 sm:py-2.5"
        }`}
      >
        {/* Logo */}
        <Link
          href={isPrivileged ? "/dashboard/admin" : isCollector ? "/dashboard/admin/collections" : "/dashboard/user"}
          aria-label="Creative Cable & Networks"
          className="shrink-0 cursor-pointer px-1"
        >
          <Image
            src="/ccnetworks-logo-transparent.png"
            alt="Creative Cable & Networks"
            width={32}
            height={32}
            priority
            className="h-7 w-7 object-contain sm:h-8 sm:w-8"
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
                title={scrolled ? link.label : undefined}
                className="flex cursor-pointer items-center gap-1.5 px-1.5 py-1.5 text-sm font-medium text-muted-foreground transition-[color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:text-primary sm:px-2 sm:py-2"
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
        {!isCollector && <div className="group relative shrink-0">
          <ThemeToggle className="h-8 w-8 cursor-pointer border-0 bg-transparent sm:h-9 sm:w-9" />

          {scrolled && <HoverLabel>Theme</HoverLabel>}
        </div>}

        {/* Logout */}
        <div className="group relative shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-[color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:text-primary sm:h-9 sm:w-9"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {scrolled && <HoverLabel>Logout</HoverLabel>}
        </div>
      </nav>
    </header>
  );
}
