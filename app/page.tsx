'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/auth/LoginModal'
import { ThemeToggle } from '@/components/common/ThemeToggle'
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
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '#', icon: HomeIcon },
  { label: 'About', href: '#about', icon: Info },
  { label: 'Offers', href: '#offers', icon: Tag, badge: 1 },
  { label: 'Pricing', href: '#pricing', icon: BadgePercent },
  { label: 'Coverage', href: '#coverage', icon: MapPin },
  { label: 'Contact', href: '#contact', icon: Phone },
]

const PACKAGES = [
  { speed: 50, price: 890 },
  { speed: 80, price: 1050 },
  { speed: 100, price: 1260 },
  { speed: 150, price: 1575 },
  { speed: 200, price: 2100 },
  { speed: 250, price: 3150 },
  { speed: 300, price: 4200 },
]

const SERVICES = [
  {
    icon: Wifi,
    title: 'Connection Tracking',
    description: 'Real-time monitoring of all network connections',
  },
  {
    icon: BarChart3,
    title: 'Billing Analytics',
    description: 'Track payments and revenue at a glance',
  },
  {
    icon: Users,
    title: 'User Management',
    description: 'Manage users and subscriptions efficiently',
  },
  {
    icon: Lock,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security for your data',
  },
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Capsule Navbar */}
      <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4">
        <nav
          className={`flex items-center justify-between bg-[#0a0e27]/90 backdrop-blur-lg border border-white/10 rounded-full shadow-lg transition-all duration-300 ease-out ${
            scrolled
              ? 'gap-2 px-3 py-2 max-w-fit'
              : 'gap-6 px-6 py-3 w-full max-w-5xl'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="p-2 bg-primary rounded-full">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <span
              className={`font-bold text-white tracking-tight overflow-hidden transition-all duration-300 ${
                scrolled ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-0'
              }`}
            >
              NetFlow
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.label}
                  href={link.href}
                  title={link.label}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span
                    className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
                      scrolled ? 'w-0 opacity-0' : 'w-auto opacity-100'
                    }`}
                  >
                    {link.label}
                  </span>
                  {link.badge && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[10px] font-semibold text-white shrink-0">
                      {link.badge}
                    </span>
                  )}
                </a>
              )
            })}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle className="border-white/20 bg-white/5 !text-white hover:!bg-white/10" />
            <Button
              size={scrolled ? 'icon' : 'default'}
              className="bg-primary hover:bg-primary/90 rounded-full"
              onClick={() => setLoginOpen(true)}
              title="Quick Pay"
            >
              {scrolled ? <Wifi className="w-4 h-4" /> : 'Quick Pay'}
            </Button>
            <Button
              size={scrolled ? 'icon' : 'default'}
              variant="outline"
              className="border-white/20 text-white bg-white/5 hover:bg-white/10 rounded-full"
              onClick={() => setLoginOpen(true)}
              title="Login"
            >
              {scrolled ? <LogIn className="w-4 h-4" /> : 'Login'}
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#141a3d] to-[#1e1550] pt-32">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy + pricing */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Experience Uninterrupted Internet
                <br />
                with Our{' '}
                <span className="text-primary">Premium Packages</span>
              </h1>
              <p className="text-white/60 text-base md:text-lg mb-8 max-w-xl">
                Track connections, monitor billing, and manage your network
                infrastructure all in one place.
              </p>

              {/* Pricing grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-w-xl">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.speed}
                    onClick={() => setLoginOpen(true)}
                    className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-colors p-3 md:p-4 text-left"
                  >
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-xl md:text-2xl font-bold text-primary">
                        {pkg.speed}
                      </span>
                      <span className="text-xs text-white/50">/Mbps</span>
                    </div>
                    <div className="rounded-md bg-white/10 px-2 py-1.5 text-center text-sm font-semibold text-white">
                      {pkg.price} TK
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: illustration placeholder */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                <div className="w-40 h-40 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Wifi className="w-20 h-20 text-primary" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="about" className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Services & Solutions
          </h2>
          <p className="text-muted-foreground">
            Join today to take advantage of NetFlow's great features.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className="p-6 bg-card border border-border rounded-lg"
              >
                <div className="inline-flex p-3 bg-primary/10 rounded-lg mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="bg-card border border-border rounded-lg p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Get Started Today
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Login with your phone number to manage your connections and
            billing. New accounts are set up by an admin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => setLoginOpen(true)}>
              Login
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-secondary/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 NetFlow. All rights reserved. | This is a demo frontend application.</p>
        </div>
      </footer>

      {/* Chat bubble */}
      <button className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
        <MessageSquare className="w-6 h-6" />
      </button>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
