"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  Download,
  ReceiptText,
  Smartphone,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/context/AppContext";
import { useAuth } from "@/lib/context/AuthContext";

type PaymentMethod = "Cash" | "bKash" | "Nagad" | "Bank";

type CustomerOption = {
  id: string;
  name: string;
  phone: string;
  zone: string;
  monthlyBill: number;
};

type CollectionRecord = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  zone: string;
  amount: number;
  method: PaymentMethod;
  note: string;
  collectedBy: string;
  createdAt: string;
};

const STORAGE_KEY = "ccnetworks-collections";

const METHODS: {
  label: PaymentMethod;
  icon: typeof Banknote;
}[] = [
  { label: "Cash", icon: Banknote },
  { label: "bKash", icon: Smartphone },
  { label: "Nagad", icon: WalletCards },
  { label: "Bank", icon: Building2 },
];

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary";

const money = (value: number) =>
  `৳${value.toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;

const sameDay = (value: string, compare: Date) => {
  const date = new Date(value);
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  );
};

const sameMonth = (value: string, compare: Date) => {
  const date = new Date(value);
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth()
  );
};

const displayDateTime = (value: string) => {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-BD", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
    day: new Intl.DateTimeFormat("en-BD", {
      weekday: "long",
    }).format(date),
  };
};

const csvValue = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;

export default function CollectionsPage() {
  const { currentUser } = useAuth();
  const { users, connections } = useApp();

  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [zone, setZone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const customers = useMemo<CustomerOption[]>(() => {
    return users
      .filter((user) => user.role === "user")
      .map((user) => {
        const userWithZone = user as typeof user & {
          zone?: string;
          area?: string;
        };

        const connection = connections.find(
          (item) =>
            item.userId === user.id && item.status === "active"
        ) as
          | {
              userId: string;
              status: string;
              monthlyPrice?: number;
            }
          | undefined;

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          zone: userWithZone.zone ?? userWithZone.area ?? "Unassigned",
          monthlyBill: connection?.monthlyPrice ?? 0,
        };
      });
  }, [connections, users]);

  const zones = useMemo(
    () =>
      Array.from(new Set(customers.map((customer) => customer.zone))).sort(),
    [customers]
  );

  const visibleCustomers = useMemo(
    () =>
      zone
        ? customers.filter((customer) => customer.zone === zone)
        : customers,
    [customers, zone]
  );

  const selectedCustomer = customers.find(
    (customer) => customer.id === customerId
  );

  const now = new Date();

  const alreadyPaid = selectedCustomer
    ? records.find(
        (record) =>
          record.customerId === selectedCustomer.id &&
          sameMonth(record.createdAt, now)
      )
    : undefined;

  const todayRecords = records.filter((record) =>
    sameDay(record.createdAt, now)
  );

  const todayTotal = todayRecords.reduce(
    (sum, record) => sum + record.amount,
    0
  );
  const cashTotal = todayRecords
    .filter((record) => record.method === "Cash")
    .reduce((sum, record) => sum + record.amount, 0);
  const digitalTotal = todayTotal - cashTotal;

  useEffect(() => {
    try {
      const savedRecords = window.localStorage.getItem(STORAGE_KEY);

      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    } catch {
      setRecords([]);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records, storageReady]);

  const handleZoneChange = (value: string) => {
    setZone(value);
    setCustomerId("");
    setAmount("");
    setSaved(false);
  };

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setSaved(false);

    const customer = customers.find((item) => item.id === value);
    setAmount(
      customer?.monthlyBill ? String(customer.monthlyBill) : ""
    );
  };

  const handleSave = () => {
    if (!selectedCustomer || !amount || alreadyPaid) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    const record: CollectionRecord = {
      id: crypto.randomUUID(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      phone: selectedCustomer.phone,
      zone: selectedCustomer.zone,
      amount: numericAmount,
      method,
      note: note.trim(),
      collectedBy: currentUser?.name ?? "Admin",
      createdAt: new Date().toISOString(),
    };

    setRecords((current) => [record, ...current]);
    setCustomerId("");
    setAmount("");
    setNote("");
    setMethod("Cash");
    setSaved(true);
  };

  const exportCsv = () => {
    if (!records.length) return;

    const header = [
      "Date",
      "Day",
      "Time",
      "Customer",
      "Phone",
      "Zone",
      "Amount",
      "Payment Method",
      "Note",
      "Collected By",
    ];

    const rows = records.map((record) => {
      const formatted = displayDateTime(record.createdAt);

      return [
        formatted.date,
        formatted.day,
        formatted.time,
        record.customerName,
        record.phone,
        record.zone,
        record.amount,
        record.method,
        record.note,
        record.collectedBy,
      ];
    });

    const csv = [
      header.map(csvValue).join(","),
      ...rows.map((row) => row.map(csvValue).join(",")),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ccnetworks-collections-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="pb-10 pt-4 sm:pb-12 sm:pt-6">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 sm:space-y-6 sm:px-6">
        {/* HEADER */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Payment Collection
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              Collections
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Record customer payments in the field. Date, day and time are
              added automatically.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            disabled={!records.length}
            className="w-full cursor-pointer rounded-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </section>

        {/* TODAY STATS */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Today", money(todayTotal)],
            ["Payments", String(todayRecords.length)],
            ["Cash", money(cashTotal)],
            ["Digital", money(digitalTotal)],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <p className="text-xs text-muted-foreground sm:text-sm">
                {label}
              </p>
              <p className="mt-2 truncate text-xl font-bold text-foreground sm:text-2xl">
                {value}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.85fr_1.35fr]">
          {/* ENTRY FORM */}
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <ReceiptText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">
                  Collect Payment
                </h2>
                <p className="text-xs text-muted-foreground">
                  Zone → Customer → Method → Save
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="collection-zone"
                  className="mb-2 block text-sm font-medium"
                >
                  Zone
                </label>
                <select
                  id="collection-zone"
                  value={zone}
                  onChange={(event) =>
                    handleZoneChange(event.target.value)
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">All zones</option>
                  {zones.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="collection-customer"
                  className="mb-2 block text-sm font-medium"
                >
                  Customer
                </label>
                <select
                  id="collection-customer"
                  value={customerId}
                  onChange={(event) =>
                    handleCustomerChange(event.target.value)
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">Select customer</option>
                  {visibleCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} · {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="rounded-2xl bg-muted/50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Zone</span>
                    <span className="font-medium">
                      {selectedCustomer.zone}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      Monthly bill
                    </span>
                    <span className="font-semibold">
                      {selectedCustomer.monthlyBill
                        ? money(selectedCustomer.monthlyBill)
                        : "Enter manually"}
                    </span>
                  </div>
                </div>
              )}

              {alreadyPaid && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  This customer already has a payment recorded for this month.
                </div>
              )}

              <div>
                <label
                  htmlFor="collection-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Amount
                </label>
                <Input
                  id="collection-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="h-11"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  Payment Method
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((item) => {
                    const Icon = item.icon;
                    const selected = method === item.label;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setMethod(item.label)}
                        className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="collection-note"
                  className="mb-2 block text-sm font-medium"
                >
                  Reference / Note
                </label>
                <Input
                  id="collection-note"
                  placeholder="Optional"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="h-11"
                />
              </div>

              {saved && (
                <p className="rounded-xl bg-emerald-500/10 p-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Payment recorded successfully.
                </p>
              )}

              <Button
                type="button"
                size="lg"
                onClick={handleSave}
                disabled={
                  !selectedCustomer ||
                  !amount ||
                  Number(amount) <= 0 ||
                  Boolean(alreadyPaid)
                }
                className="h-11 w-full cursor-pointer"
              >
                Save Payment
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Date, day, time and collector are saved automatically.
              </p>
            </div>
          </div>

          {/* HISTORY */}
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-foreground">
                  Recent Collections
                </h2>
                <p className="text-xs text-muted-foreground">
                  {records.length} saved payment
                  {records.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {records.length ? (
              <>
                {/* MOBILE CARDS */}
                <div className="space-y-3 md:hidden">
                  {records.slice(0, 12).map((record) => {
                    const formatted = displayDateTime(record.createdAt);

                    return (
                      <article
                        key={record.id}
                        className="rounded-2xl border border-border p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {record.customerName}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {record.zone} · {record.method}
                            </p>
                          </div>
                          <p className="shrink-0 font-bold text-primary">
                            {money(record.amount)}
                          </p>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                          {formatted.date} · {formatted.day} ·{" "}
                          {formatted.time}
                        </p>
                      </article>
                    );
                  })}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Zone</th>
                        <th className="pb-3 font-medium">Method</th>
                        <th className="pb-3 font-medium">Date & Time</th>
                        <th className="pb-3 text-right font-medium">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.slice(0, 20).map((record) => {
                        const formatted = displayDateTime(record.createdAt);

                        return (
                          <tr
                            key={record.id}
                            className="border-b border-border/60 last:border-0"
                          >
                            <td className="py-3">
                              <p className="font-medium text-foreground">
                                {record.customerName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {record.phone}
                              </p>
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {record.zone}
                            </td>
                            <td className="py-3">{record.method}</td>
                            <td className="py-3 text-muted-foreground">
                              {formatted.date}, {formatted.time}
                            </td>
                            <td className="py-3 text-right font-semibold">
                              {money(record.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <ReceiptText className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-medium text-foreground">
                  No collections yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Record the first payment using the form.
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Frontend prototype: records are stored only in this browser until
          the database is connected.
        </p>
      </div>
    </main>
  );
}