"use client";

import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/LoginModal";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import NetworkingAnimation from "@/components/animation/NetworkingAnimation";
import DarkModeLandingBackground from "@/components/animation/DarkModeBackground";
import CompanyNameTyping from "@/components/animation/CompanyNameTyping";
import PricingSection from "@/components/sections/PricingSection";
import { useEffect, useState } from "react";
import {
  Wifi,
  BarChart3,
  Users,
  Lock,
  MessageSquare,
  ChevronRight,
  Home as HomeIcon,
  Info,
  BadgePercent,
  MapPin,
  Phone,
  LogIn,
  Mail,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home", icon: HomeIcon },
  { label: "About", href: "#about", icon: Info },
  { label: "Pricing", href: "#pricing", icon: BadgePercent },
  { label: "Contact", href: "#contact", icon: Phone },
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

/*
  MAIN WEBSITE WIDTH

  max-w-4xl = narrower
  max-w-5xl = current portfolio-style width
  max-w-6xl = wider
*/
const PAGE_WIDTH = "mx-auto w-full max-w-5xl px-4 sm:px-6";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-transparent text-slate-950 dark:text-white">
      {/*
        This component now uses a static CSS background.
        It no longer runs a full-screen Lottie animation.
      */}
      <DarkModeLandingBackground />

      <div className="relative z-10">
        <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
          <nav
            className={`flex max-w-[calc(100vw-2rem)] items-center rounded-full border border-white/60 bg-white/75 shadow-[0_8px_30px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-[padding,gap,background-color,border-color,box-shadow] duration-300 ease-out dark:border-white/10 dark:bg-black/70 dark:shadow-[0_10px_35px_rgba(0,0,0,0.45)] ${
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
                    className={`flex shrink-0 cursor-pointer items-center rounded-full py-2 text-sm font-medium text-slate-700 transition-[padding,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:text-primary active:translate-y-0 dark:text-white/85 dark:hover:text-primary ${
                      scrolled ? "px-2.5" : "px-3"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />

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

        {/* HOME */}
        <section
          id="home"
          className="relative scroll-mt-24 bg-transparent pt-28 sm:pt-32"
        >
          <div className={`${PAGE_WIDTH} pb-6 sm:pb-10`}>
            <div className="flex justify-center">
              <div className="aspect-4/3 w-full max-w-65 sm:max-w-xs md:max-w-sm">
                <NetworkingAnimation />
              </div>
            </div>

            <div className="mx-auto mt-4 max-w-3xl text-center sm:mt-6">
              <p
                aria-label={COMPANY_NAME}
                className="mb-10 min-h-20 text-3xl font-bold leading-tight tracking-tight text-black dark:text-white sm:min-h-24 sm:text-4xl lg:text-5xl"
              >
                <CompanyNameTyping
                  text={COMPANY_NAME}
                  speed={65}
                  pause={3000}
                />
              </p>

              <h1 className="mb-4 text-2xl font-semibold leading-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
                Experience Uninterrupted Internet
                <br className="hidden sm:block" />
                <span className="sm:ml-2">
                  with Our{" "}
                  <span className="text-primary">Premium Packages</span>
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-white/60 sm:text-lg">
                Track connections, monitor billing, and manage your network
                infrastructure all in one place.
              </p>

              {/* HERO HIGHLIGHTS */}
              <div className="mx-auto mt-7 grid w-full max-w-180 grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/3">
                <div className="flex min-h-24 flex-col items-center justify-center gap-2.5 px-2 py-4 text-center transition-transform duration-200 hover:-translate-y-0.5">
                  <Wifi className="h-5 w-5 text-primary sm:h-6 sm:w-6" />

                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white sm:text-[15px]">
                      50–300 Mbps
                    </p>

                    <p className="mt-0.5 hidden text-xs text-slate-500 dark:text-white/50 sm:block">
                      Flexible speeds
                    </p>
                  </div>
                </div>

                <div className="flex min-h-24 flex-col items-center justify-center gap-2.5 border-x border-slate-200 px-2 py-4 text-center transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/10">
                  <Lock className="h-5 w-5 text-primary sm:h-6 sm:w-6" />

                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white sm:text-[15px]">
                      Fiber Network
                    </p>

                    <p className="mt-0.5 hidden text-xs text-slate-500 dark:text-white/50 sm:block">
                      Stable connection
                    </p>
                  </div>
                </div>

                <div className="flex min-h-24 flex-col items-center justify-center gap-2.5 px-2 py-4 text-center transition-transform duration-200 hover:-translate-y-0.5">
                  <Phone className="h-5 w-5 text-primary sm:h-6 sm:w-6" />

                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white sm:text-[15px]">
                      24/7 Support
                    </p>

                    <p className="mt-0.5 hidden text-xs text-slate-500 dark:text-white/50 sm:block">
                      Always available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="scroll-mt-24 bg-transparent pb-10 pt-6 sm:pb-14 sm:pt-8"
        >
          <div className={PAGE_WIDTH}>
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                Services & Solutions
              </h2>

              <p className="max-w-2xl text-slate-600 dark:text-white/60">
                Join today to take advantage of NetFlow&apos;s great features.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {SERVICES.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg dark:border-white/15 dark:bg-black"
                  >
                    <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    <h3 className="mb-2 font-semibold text-slate-950 dark:text-white">
                      {service.title}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-white/60">
                      {service.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <PricingSection
          onBuyPackage={() => {
            setLoginOpen(true);
          }}
        />

        {/* GET STARTED */}
        <section className="bg-transparent py-10 sm:py-14">
          <div className={PAGE_WIDTH}>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/15 dark:bg-black sm:p-10">
              <h2 className="mb-3 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                Get Started Today
              </h2>

              <p className="mx-auto mb-6 max-w-2xl text-slate-600 dark:text-white/60">
                Login with your phone number to manage your connections and
                billing. New accounts are set up by an admin.
              </p>

              <Button
                type="button"
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

        {/* CONTACT */}
        <section
          id="contact"
          role="region"
          aria-labelledby="contact-heading"
          className="scroll-mt-24 bg-transparent py-10 sm:py-14"
        >
          <div className={PAGE_WIDTH}>
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Contact
              </p>

              <h2
                id="contact-heading"
                className="mb-3 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl"
              >
                Need Help or a New Connection?
              </h2>

              <p className="max-w-2xl text-slate-600 dark:text-white/60">
                Contact our support team for package information, account help,
                or connection availability.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-black">
                <div className="mb-4 inline-flex rounded-xl p-1">
                  <Phone className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mb-2 font-semibold text-slate-950 dark:text-white">
                  Phone
                </h3>

                <p className="text-sm text-slate-600 dark:text-white/60">
                  +880-1556545295
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-black">
                <div className="mb-4 inline-flex rounded-xl p-1">
                  <Mail className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mb-2 font-semibold text-slate-950 dark:text-white">
                  Email
                </h3>

                <p className="break-all text-sm text-slate-600 dark:text-white/60">
                  creativecisc@gmail.com
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-black">
                <div className="mb-4 inline-flex rounded-xl p-1">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mb-2 font-semibold text-slate-950 dark:text-white">
                  Office
                </h3>

                <p className="text-sm text-slate-600 dark:text-white/60">
                  Rajdwip, Rangamati
                </p>
              </article>
            </div>
          </div>
        </section>

        <footer className="bg-transparent py-8">
          <div className={`${PAGE_WIDTH} text-center`}>
            <p className="text-sm text-slate-500 dark:text-white/50">
              &copy; {new Date().getFullYear()} CCNetworks. All rights reserved.
            </p>
          </div>
        </footer>

        <button
          type="button"
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-[background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        >
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    </div>
  );
}
