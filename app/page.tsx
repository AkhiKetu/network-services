"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/LoginModal";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import WifiConnectingAnimation from "@/components/animation/WifiConnectingAnimation";
import DarkModeLandingBackground from "@/components/animation/DarkModeBackground";
import {
  Wifi,
  BarChart3,
  Users,
  Lock,
  MessageSquare,
  ChevronRight,
  Home as HomeIcon,
  Info,
  Tag,
  BadgePercent,
  MapPin,
  Phone,
  LogIn,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home", icon: HomeIcon },
  { label: "About", href: "#about", icon: Info },
  { label: "Offers", href: "#offers", icon: Tag },
  { label: "Pricing", href: "#pricing", icon: BadgePercent },
  { label: "Coverage", href: "#coverage", icon: MapPin },
  { label: "Contact", href: "#contact", icon: Phone },
];

const PACKAGES = [
  { speed: 50, price: 890 },
  { speed: 80, price: 1050 },
  { speed: 100, price: 1260 },
  { speed: 150, price: 1575 },
  { speed: 200, price: 2100 },
  { speed: 250, price: 3150 },
  { speed: 300, price: 4200 },
];

const SERVICES = [
  {
    icon: Wifi,
    title: "Connection Tracking",
    description: "Real-time monitoring of all network connections",
  },
  {
    icon: BarChart3,
    title: "Billing Analytics",
    description: "Track payments and revenue at a glance",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Manage users and subscriptions efficiently",
  },
  {
    icon: Lock,
    title: "Secure & Reliable",
    description: "Enterprise-grade security for your data",
  },
];

const COMPANY_NAME = "Welcome, To Creative Cable and Networks";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [typedCompanyName, setTypedCompanyName] = useState("");

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

  useEffect(() => {
    let index = 0;
    let timerId: number;

    const typeCompanyName = () => {
      if (index < COMPANY_NAME.length) {
        index += 1;
        setTypedCompanyName(COMPANY_NAME.slice(0, index));
        timerId = window.setTimeout(typeCompanyName, 55);
        return;
      }

      timerId = window.setTimeout(() => {
        index = 0;
        setTypedCompanyName("");
        timerId = window.setTimeout(typeCompanyName, 300);
      }, 3000);
    };

    typeCompanyName();

    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-white text-slate-950 dark:bg-black dark:text-white">
      <DarkModeLandingBackground />

      <div className="relative z-10">
      <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
        {/* Customize this single capsule navbar here; dark: classes automatically change it in dark mode. */}
        <nav
          className={`flex max-w-[calc(100vw-2rem)] items-center rounded-full border border-white/60 bg-white/60 shadow-[0_8px_30px_rgba(15,23,42,0.16)] backdrop-blur-3xl backdrop-saturate-150 transition-[padding,gap,background-color,border-color,box-shadow] duration-500 ease-out dark:border-white/10 dark:bg-black/55 dark:shadow-[0_10px_35px_rgba(0,0,0,0.55)] ${
            scrolled ? "gap-0.5 px-3 py-2" : "gap-1 px-4 py-2.5"
          }`}
        >
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  title={link.label}
                  className={`flex shrink-0 cursor-pointer items-center rounded-full py-2 text-sm font-medium text-slate-700 transition-[padding,color,transform] duration-200 ease-out hover:-translate-y-1 hover:text-primary active:translate-y-0 dark:text-white/85 dark:hover:text-primary ${
                    scrolled ? "px-2.5" : "px-3"
                  }`}
                >
                  <Icon className="h-5.5 w-5.5 shrink-0" />

                  <span
                    className={`overflow-hidden whitespace-nowrap transition-[max-width,margin,opacity] duration-300 ease-out ${
                      scrolled
                        ? "ml-0 max-w-0 opacity-0"
                        : "ml-2 max-w-24 opacity-100"
                    }`}
                  >
                    {link.label}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="ml-1 flex shrink-0 items-center gap-1">
            <ThemeToggle className="cursor-pointer border-0 bg-transparent text-slate-800! transition-[color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-transparent! hover:text-primary! active:translate-y-0 dark:text-white! dark:hover:text-primary!" />

            <Button
              type="button"
              size={scrolled ? "icon" : "default"}
              variant="ghost"
              onClick={() => setLoginOpen(true)}
              title="Login"
              className="cursor-pointer rounded-full border border-slate-300/70 bg-transparent text-slate-800 transition-[border-color,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/50 hover:bg-transparent hover:text-primary active:translate-y-0 dark:border-white/15 dark:text-white dark:hover:border-primary/60 dark:hover:bg-transparent dark:hover:text-primary"
            >
              {scrolled ? <LogIn className="h-4 w-4" /> : "Login"}
            </Button>
          </div>
        </nav>
      </header>

      <section
        id="home"
        className="relative overflow-hidden bg-transparent pt-32"
      >
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p
                aria-label={COMPANY_NAME}
                className="mb-5 min-h-20 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-black dark:text-white sm:min-h-24 sm:text-4xl md:min-h-32 md:text-5xl"
              >
                <span aria-hidden="true">{typedCompanyName}</span>
              </p>

              <h1 className="mb-4 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl md:text-4xl dark:text-white">
                Experience Uninterrupted Internet
                <br />
                with Our <span className="text-primary">Premium Packages</span>
              </h1>

              <p className="mb-8 max-w-xl text-base text-slate-600 md:text-lg dark:text-white/60">
                Track connections, monitor billing, and manage your network
                infrastructure all in one place.
              </p>

              <div className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.speed}
                    type="button"
                    onClick={() => setLoginOpen(true)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-left transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/50 active:translate-y-0 md:p-4 dark:border-white/15 dark:bg-black"
                  >
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-primary md:text-2xl">
                        {pkg.speed}
                      </span>

                      <span className="text-xs text-slate-500 dark:text-white/50">
                        /Mbps
                      </span>
                    </div>

                    <div className="rounded-md bg-slate-100 px-2 py-1.5 text-center text-sm font-semibold text-slate-950 dark:bg-white/10 dark:text-white">
                      {pkg.price} TK
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <div className="relative aspect-square w-full max-w-md">
                <WifiConnectingAnimation />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="bg-transparent px-4 py-16 md:px-6 md:py-24"
      >
        <div className="container mx-auto">
          <div className="mb-12">
            <h2 className="mb-2 text-2xl font-bold text-slate-950 md:text-3xl dark:text-white">
              Services & Solutions
            </h2>

            <p className="text-slate-600 dark:text-white/60">
              Join today to take advantage of NetFlow&apos;s great features.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/15 dark:bg-black"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="mb-2 font-semibold text-slate-950 dark:text-white">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-white/60">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 pb-16 md:px-6 md:pb-24">
        <div className="container mx-auto">
          <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-8 text-center md:p-12 dark:border-white/15 dark:bg-black">
            <h2 className="text-2xl font-bold text-slate-950 md:text-3xl dark:text-white">
              Get Started Today
            </h2>

            <p className="mx-auto max-w-2xl text-slate-600 dark:text-white/60">
              Login with your phone number to manage your connections and
              billing. New accounts are set up by an admin.
            </p>

            <Button
              size="lg"
              className="cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
              onClick={() => setLoginOpen(true)}
            >
              Login
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-transparent py-8 dark:border-white/15">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-white/50">
          <p>
            &copy; {new Date().getFullYear()} NetFlow. All rights reserved. |
            This is a demo frontend application.
          </p>
        </div>
      </footer>

      <button
        type="button"
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-[background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    </div>
  );
}