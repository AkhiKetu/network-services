"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  Flame,
  X,
} from "lucide-react";

interface InternetPackage {
  id: string;
  name: string;
  speed: number;
  price: number;
  accent: string;
  description: string;
  features: string[];
}

const PACKAGES: InternetPackage[] = [
  {
    id: "8mbps-rng",
    name: "8Mbps-RNG",
    speed: 8,
    price: 500,
    accent: "#64748b",
    description: "Reliable internet for basic browsing and everyday use.",
    features: [
      "Stable internet connection",
      "BDIX connectivity",
      "Optical fiber connection",
      "YouTube & social media",
      "24/7 customer support",
    ],
  },
  {
    id: "10mbps-rng",
    name: "10Mbps-RNG",
    speed: 10,
    price: 600,
    accent: "#fb7185",
    description: "Balanced speed for browsing, streaming, and social media.",
    features: [
      "Stable internet connection",
      "BDIX connectivity",
      "Optical fiber connection",
      "HD streaming support",
      "24/7 customer support",
    ],
  },
  {
    id: "20mbps-rng",
    name: "20Mbps-RNG",
    speed: 20,
    price: 800,
    accent: "#0ea5e9",
    description: "Fast connectivity for streaming and multiple devices.",
    features: [
      "High-speed internet",
      "BDIX connectivity",
      "Optical fiber connection",
      "HD & Full HD streaming",
      "24/7 customer support",
    ],
  },
  {
    id: "25mbps-pack",
    name: "25Mbps_Pack",
    speed: 25,
    price: 1000,
    accent: "#8b5cf6",
    description: "A powerful package for families and multiple devices.",
    features: [
      "High-speed internet",
      "BDIX connectivity",
      "Optical fiber connection",
      "4K streaming support",
      "24/7 customer support",
    ],
  },
  {
    id: "30mbps-sk",
    name: "30Mbps-SK",
    speed: 30,
    price: 1100,
    accent: "#14b8a6",
    description: "Smooth internet for streaming, gaming, and daily work.",
    features: [
      "High-speed internet",
      "BDIX connectivity",
      "Optical fiber connection",
      "Gaming & streaming support",
      "24/7 customer support",
    ],
  },
  {
    id: "40mbps-sk",
    name: "40Mbps-SK",
    speed: 40,
    price: 1200,
    accent: "#f59e0b",
    description: "Premium speed for demanding users and larger households.",
    features: [
      "Premium internet speed",
      "BDIX connectivity",
      "Optical fiber connection",
      "4K streaming support",
      "24/7 priority support",
    ],
  },
  {
    id: "15mbps-pro",
    name: "15Mbps-PRO",
    speed: 15,
    price: 700,
    accent: "#ef4444",
    description: "Professional everyday internet for work and entertainment.",
    features: [
      "Stable internet connection",
      "BDIX connectivity",
      "Optical fiber connection",
      "Streaming support",
      "24/7 customer support",
    ],
  },
];

interface PricingSectionProps {
  onBuyPackage: (packageItem: InternetPackage) => void;
}

export default function PricingSection({
  onBuyPackage,
}: PricingSectionProps) {
  const [selectedPackage, setSelectedPackage] =
    useState<InternetPackage | null>(null);

  useEffect(() => {
    if (!selectedPackage) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPackage(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPackage]);

  return (
    <>
      <section
        id="pricing"
        className="scroll-mt-24 bg-transparent py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="mb-9">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Internet Packages
            </p>

            <h2 className="mb-3 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
              Choose the Right Plan for You
            </h2>

            <p className="max-w-2xl text-slate-600 dark:text-white/60">
              Choose an internet package that fits your needs and budget.
            </p>
          </div>

          <div className="group/pricing grid gap-4 sm:grid-cols-2 lg:gap-5">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackage(pkg)}
                className="group/card relative min-h-56 w-full cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-[transform,opacity,border-color,box-shadow] duration-200 group-hover/pricing:scale-[0.985] group-hover/pricing:opacity-55 hover:!z-10 hover:!scale-[1.015] hover:!opacity-100 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl dark:border-white/15 dark:bg-black sm:min-h-60 sm:p-6"
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-15 blur-2xl transition-transform duration-300 group-hover/card:scale-125"
                  style={{ backgroundColor: pkg.accent }}
                />

                <div className="relative flex h-full flex-col">
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Flame
                          className="h-5 w-5"
                          style={{ color: pkg.accent }}
                        />

                        <h3 className="text-lg font-bold text-slate-950 dark:text-white sm:text-xl">
                          {pkg.name}
                        </h3>
                      </div>

                      <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-white/55">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="rounded-full border border-slate-200 p-2 text-slate-500 transition group-hover/card:rotate-12 dark:border-white/15 dark:text-white/55">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
                    <div
                      className="rounded-2xl px-4 py-3 text-xl font-extrabold text-white shadow-md sm:px-5 sm:text-2xl"
                      style={{ backgroundColor: pkg.accent }}
                    >
                      {pkg.speed} Mbps
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
                        ৳{pkg.price}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-white/50">
                        per month
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <motion.button
              type="button"
              aria-label="Close package details"
              onClick={() => setSelectedPackage(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 cursor-default bg-slate-950/70"
            />

            <motion.article
              role="dialog"
              aria-modal="true"
              aria-labelledby={`package-title-${selectedPackage.id}`}
              initial={{ opacity: 0, y: 18, scale: 0.975 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.985 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/15 dark:bg-slate-950"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedPackage(null)}
                className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:rotate-90 hover:text-primary dark:border-white/15 dark:bg-black dark:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid md:grid-cols-2 xl:grid-cols-[0.95fr_1.25fr_0.95fr]">
                <div className="border-b border-slate-200 p-5 dark:border-white/10 sm:p-7 md:border-b-0 md:border-r">
                  <div className="mb-4 flex items-center gap-2">
                    <Flame
                      className="h-6 w-6"
                      style={{ color: selectedPackage.accent }}
                    />

                    <h2
                      id={`package-title-${selectedPackage.id}`}
                      className="text-2xl font-bold text-slate-950 dark:text-white"
                    >
                      {selectedPackage.name}
                    </h2>
                  </div>

                  <p className="mb-6 text-sm leading-6 text-slate-500 dark:text-white/55">
                    {selectedPackage.description}
                  </p>

                  <div
                    className="inline-flex rounded-2xl px-5 py-4 text-2xl font-extrabold text-white shadow-md sm:text-3xl"
                    style={{ backgroundColor: selectedPackage.accent }}
                  >
                    {selectedPackage.speed} Mbps
                  </div>
                </div>

                <div className="border-b border-slate-200 p-5 dark:border-white/10 sm:p-7 md:border-b-0 xl:border-r">
                  <h3 className="mb-5 font-semibold text-slate-950 dark:text-white">
                    Package benefits
                  </h3>

                  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    {selectedPackage.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-white/65"
                      >
                        <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-center bg-slate-50 p-5 text-center dark:bg-white/5 sm:p-7 md:col-span-2 xl:col-span-1">
                  <p className="mb-1 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                    ৳{selectedPackage.price}
                    <span className="text-sm font-medium text-slate-500 dark:text-white/50 sm:text-base">
                      /mo
                    </span>
                  </p>

                  <p className="mb-6 text-sm text-slate-500 dark:text-white/50">
                    Monthly internet package
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const pkg = selectedPackage;
                      setSelectedPackage(null);
                      onBuyPackage(pkg);
                    }}
                    className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary dark:bg-white dark:text-slate-950"
                  >
                    Buy {selectedPackage.name}
                  </button>
                </div>
              </div>
            </motion.article>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}