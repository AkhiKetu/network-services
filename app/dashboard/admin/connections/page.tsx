"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Pencil,
  Search,
  UserRound,
  Wifi,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminConnection, AdminProfile } from "@/lib/types/admin";
import { getConnectionStatus } from "@/lib/utils/connectionStatus";
import { CONNECTION_TYPES } from "@/lib/utils/customerOptions";
import { getRenewalDate } from "@/lib/utils/dateUtils";

export default function AdminConnections() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [connections, setConnections] = useState<AdminConnection[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "expired" | "deleted"
  >("all");
  const [editing, setEditing] = useState<AdminConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/connections", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to load connections.");
      setProfiles(data.profiles);
      setConnections(data.connections);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load connections.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const customerConnections = useMemo(() => {
    const customerIds = new Set(
      profiles
        .filter((profile) => profile.role === "user")
        .map((profile) => profile.id),
    );
    return connections.filter((connection) =>
      customerIds.has(connection.user_id),
    );
  }, [connections, profiles]);
  const rows = useMemo(
    () =>
      customerConnections
        .map((connection) => ({
          connection,
          customer: profiles.find(
            (profile) => profile.id === connection.user_id,
          ),
          effective: getConnectionStatus(connection),
        }))
        .filter(({ connection, customer, effective }) => {
          const text =
            `${connection.package_name} ${connection.connection_type ?? ""} ${customer?.name ?? ""} ${customer?.zone ?? ""}`.toLowerCase();
          return (
            text.includes(query.toLowerCase()) &&
            (filter === "all" || effective === filter)
          );
        }),
    [customerConnections, profiles, query, filter],
  );
  const counts = {
    active: customerConnections.filter(
      (item) => getConnectionStatus(item) === "active",
    ).length,
    expired: customerConnections.filter(
      (item) => getConnectionStatus(item) === "expired",
    ).length,
    deleted: customerConnections.filter(
      (item) => getConnectionStatus(item) === "deleted",
    ).length,
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    try {
      const response = await fetch("/api/admin/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          packageName: editing.package_name,
          monthlyPrice: editing.monthly_price,
          connectionType: editing.connection_type,
          startDate: editing.start_date,
          renewalDate: editing.renewal_date,
          status: editing.status,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to update connection.");
      setEditing(null);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to update connection.",
      );
    }
  };
  const renew = async (connection: AdminConnection) => {
    const renewalDate = getRenewalDate(
      getConnectionStatus(connection) === "active"
        ? new Date(`${connection.renewal_date}T12:00:00`)
        : new Date(),
    );
    try {
      const response = await fetch("/api/admin/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: connection.id,
          renewalDate,
          status: "active",
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to renew connection.",
      );
    }
  };

  return (
    <main className="pb-10 pt-4 sm:pb-12 sm:pt-6">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 sm:space-y-6 sm:px-6">
        <section>
          <p className="text-sm font-medium text-primary">Service management</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Connections
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage every customer package, monthly bill, and service date from
            one place.
          </p>
        </section>
        <section className="grid grid-cols-4 gap-3">
          {[
            ["All", connections.length],
            ["Active", counts.active],
            ["Expired", counts.expired],
            ["Deleted", counts.deleted],
          ].map(([label, value]) => (
            <article
              key={String(label)}
              className="rounded-2xl border border-border bg-card p-3 shadow-sm"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-xl font-bold">{value}</p>
            </article>
          ))}
        </section>
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer, zone, or package..."
                className="h-11 pl-10"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["all", "active", "expired", "deleted"] as const).map(
                (item) => (
                  <Button
                    key={item}
                    variant={filter === item ? "default" : "outline"}
                    onClick={() => setFilter(item)}
                    className="capitalize"
                  >
                    {item}
                  </Button>
                ),
              )}
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>
        {loading ? (
          <section className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
            Loading connections…
          </section>
        ) : rows.length ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {rows.map(({ connection, customer, effective }) => (
              <article
                key={connection.id}
                className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <div className="flex justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3">
                      <Wifi className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold">{connection.package_name}</h2>
                      <p className="text-xs text-muted-foreground">
                        Connection #{connection.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold capitalize text-green-700 dark:bg-green-950/50 dark:text-green-400">
                    {effective}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
                  <div>
                    <p className="flex gap-1 text-xs text-muted-foreground">
                      <UserRound className="h-3.5 w-3.5" />
                      Customer
                    </p>
                    <p className="mt-1 font-medium">
                      {customer?.name ?? "Unknown customer"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer?.customer_id ?? customer?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="flex gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      Zone / area
                    </p>
                    <p className="mt-1 font-medium">
                      {customer?.zone ?? "Unassigned"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Monthly bill
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary">
                      ৳{connection.monthly_price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Connection type
                    </p>
                    <p className="mt-1 font-medium">
                      {connection.connection_type ?? "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="flex gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Renews
                    </p>
                    <p className="mt-1 font-medium">
                      {new Date(
                        `${connection.renewal_date}T12:00:00`,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {effective !== "deleted" && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      onClick={() => void renew(connection)}
                    >
                      Renew
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing({ ...connection })}
                    >
                      <Pencil />
                      Edit
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-border bg-card p-12 text-center">
            <Wifi className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <h2 className="font-semibold">No connections found</h2>
          </section>
        )}
      </div>
      {editing && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 p-4">
          <form
            onSubmit={save}
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-5"
          >
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-bold">Edit connection</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditing(null)}
              >
                <X />
              </Button>
            </div>
            <div className="space-y-4">
              <label>
                Package name
                <Input
                  value={editing.package_name}
                  onChange={(event) =>
                    setEditing(
                      (current) =>
                        current && {
                          ...current,
                          package_name: event.target.value,
                        },
                    )
                  }
                />
              </label>
              <label>
                Monthly bill amount
                <Input
                  type="number"
                  min="0"
                  value={editing.monthly_price}
                  onChange={(event) =>
                    setEditing(
                      (current) =>
                        current && {
                          ...current,
                          monthly_price: Number(event.target.value),
                        },
                    )
                  }
                />
              </label>
              <label>
                Connection Type
                <select
                  required
                  value={editing.connection_type ?? ""}
                  onChange={(event) =>
                    setEditing(
                      (current) =>
                        current && {
                          ...current,
                          connection_type: event.target.value,
                        },
                    )
                  }
                  className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"
                >
                  <option value="">Select connection type</option>
                  {CONNECTION_TYPES.map((connectionType) => (
                    <option key={connectionType} value={connectionType}>
                      {connectionType}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  Activation date
                  <Input
                    type="date"
                    value={editing.start_date}
                    onChange={(event) =>
                      setEditing(
                        (current) =>
                          current && {
                            ...current,
                            start_date: event.target.value,
                          },
                      )
                    }
                  />
                </label>
                <label>
                  Renewal date
                  <Input
                    type="date"
                    value={editing.renewal_date}
                    onChange={(event) =>
                      setEditing(
                        (current) =>
                          current && {
                            ...current,
                            renewal_date: event.target.value,
                          },
                      )
                    }
                  />
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
