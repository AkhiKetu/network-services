"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  DollarSign,
  TrendingUp,
  Users,
  Wifi,
} from "lucide-react";

import { ConnectionCard } from "@/components/cards/ConnectionCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";
import {
  calculateMonthlyRevenue,
  calculateYearlyIncomeFromBillings,
  formatCurrency,
} from "@/lib/utils/billCalculator";

const PAGE_WIDTH = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export default function AdminDashboard() {
  const { currentUser } = useAuth();

  const {
    users,
    connections,
    billings,
    markNotificationAsRead,
    getUnreadNotifications,
  } = useApp();

  if (!currentUser) return null;

  const monthlyRevenue = calculateMonthlyRevenue(billings);
  const yearlyRevenue =
    calculateYearlyIncomeFromBillings(billings);

  const totalUsers = users.filter(
    (user) => user.role === "user"
  ).length;

  const activeUsers = users.filter(
    (user) =>
      user.role === "user" &&
      user.subscriptionStatus === "active"
  ).length;

  const activeConnections = connections.filter(
    (connection) => connection.status === "active"
  ).length;

  const unreadNotifications = getUnreadNotifications();

  const stats = [
    {
      label: "Monthly Revenue",
      value: formatCurrency(monthlyRevenue),
      note: "Current month",
      icon: DollarSign,
    },
    {
      label: "Yearly Revenue",
      value: formatCurrency(yearlyRevenue),
      note: "This year",
      icon: TrendingUp,
    },
    {
      label: "Active Users",
      value: activeUsers,
      note: `${totalUsers} total users`,
      icon: Users,
    },
    {
      label: "Active Connections",
      value: activeConnections,
      note: `${connections.length} total connections`,
      icon: Wifi,
    },
  ];

  return (
    <main className="pb-10 pt-20 sm:pt-24">
      <div className={`${PAGE_WIDTH} space-y-5 sm:space-y-6`}>
        {/* WELCOME */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Welcome back
              </p>

              <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
                Welcome, {currentUser.name.split(" ")[0]}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {currentUser.phone}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                {totalUsers} users
              </span>

              <span className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                {activeConnections} active
              </span>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {stat.label}
                  </p>

                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>

                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  {stat.value}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.note}
                </p>
              </article>
            );
          })}
        </section>

        {/* NOTIFICATIONS */}
        {unreadNotifications.length > 0 && (
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />

              <h2 className="font-bold text-foreground">
                Recent Notifications
              </h2>
            </div>

            <div className="space-y-2">
              {unreadNotifications
                .slice(0, 3)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className="flex flex-col gap-3 rounded-2xl bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {notification.title}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        markNotificationAsRead(
                          notification.id
                        )
                      }
                      className="cursor-pointer rounded-full"
                    >
                      Mark read
                    </Button>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* QUICK LINKS */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Quick Links
          </h2>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/dashboard/admin/collections"
              className="flex cursor-pointer items-center justify-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:text-primary"
            >
              Bill Collection
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/admin/users"
              className="flex cursor-pointer items-center justify-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:text-primary"
            >
              Users
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/admin/connections"
              className="flex cursor-pointer items-center justify-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:text-primary"
            >
              Connections
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/admin/analytics"
              className="flex cursor-pointer items-center justify-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:text-primary"
            >
              Analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* RECENT CONNECTIONS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Recent Connections
            </h2>

            <Link
              href="/dashboard/admin/connections"
              className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              View All
            </Link>
          </div>

          {connections.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {connections
                .slice(0, 4)
                .map((connection) => {
                  const user = users.find(
                    (item) =>
                      item.id === connection.userId
                  );

                  return (
                    <ConnectionCard
                      key={connection.id}
                      connection={connection}
                      showUser
                      userName={user?.name}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <Wifi className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />

              <h3 className="font-semibold text-foreground">
                No Connections
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                No connections created yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}