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
    id: "silver-plus",
    name: "Silver+",
    speed: 50,
    price: 890,
    accent: "#64748b",
    description:
      "A reliable starter package for browsing, social media, and everyday internet use.",
    features: [
      "High-speed BDIX and CDN connectivity",
      "Smooth YouTube and Facebook streaming",
      "Optical fiber connection",
      "IPv6 public IP support",
      "24/7 phone and online support",
      "1:8 contention ratio",
    ],
  },
  {
    id: "gold-plus",
    name: "Gold+",
    speed: 80,
    price: 1050,
    accent: "#fb7185",
    description:
      "A balanced package for streaming, remote work, gaming, and multiple devices.",
    features: [
      "High-speed BDIX and CDN connectivity",
      "4K YouTube and Facebook streaming",
      "Optical fiber connection",
      "IPv6 public IP support",
      "24/7 phone and online support",
      "1:8 contention ratio",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    speed: 100,
    price: 1260,
    accent: "#0ea5e9",
    description:
      "High-speed internet for active households, entertainment, and professional work.",
    features: [
      "Premium BDIX and CDN connectivity",
      "Stable 4K streaming support",
      "Optical fiber connection",
      "IPv6 public IP support",
      "24/7 priority support",
      "1:8 contention ratio",
    ],
  },
  {
    id: "diamond",
    name: "Diamond",
    speed: 150,
    price: 1575,
    accent: "#8b5cf6",
    description:
      "Fast connectivity for gaming, content creation, and larger households.",
    features: [
      "Premium BDIX and CDN connectivity",
      "Multi-device 4K streaming",
      "Low-latency optical fiber connection",
      "IPv6 public IP support",
      "24/7 priority support",
      "Optimized contention ratio",
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    speed: 200,
    price: 2100,
    accent: "#14b8a6",
    description:
      "Powerful internet for advanced users, offices, cloud work, and downloads.",
    features: [
      "Ultra-fast BDIX and CDN connectivity",
      "Multiple simultaneous 4K streams",
      "Low-latency optical fiber connection",
      "IPv6 public IP support",
      "24/7 priority support",
      "Business-ready reliability",
    ],
  },
  {
    id: "turbo",
    name: "Turbo",
    speed: 250,
    price: 3150,
    accent: "#f59e0b",
    description:
      "A premium package for demanding homes, creators, and small businesses.",
    features: [
      "Premium local and international routing",
      "High-capacity 4K streaming",
      "Low-latency optical fiber connection",
      "IPv6 public IP support",
      "24/7 premium support",
      "Enhanced network priority",
    ],
  },
  {
    id: "maximum",
    name: "Maximum",
    speed: 300,
    price: 4200,
    accent: "#ef4444",
    description:
      "Maximum performance for power users, offices, and high-demand networks.",
    features: [
      "Maximum-speed BDIX and CDN connectivity",
      "Heavy multi-device streaming support",
      "Enterprise-grade optical fiber connection",
      "IPv6 public IP support",
      "24/7 premium support",
      "Highest network priority",
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
              Hover over a package to focus it, then click to view the complete
              package details.
            </p>
          </div>

          {/*
            PERFORMANCE:
            This uses CSS-only hover effects. It does not update React state
            during hover and does not use filter blur on every card.
          */}
          <div className="group/pricing grid gap-4 sm:grid-cols-2 lg:gap-5">
            {PACKAGES.map((packageItem) => (
              <button
                key={packageItem.id}
                type="button"
                onClick={() => setSelectedPackage(packageItem)}
                className="group/card relative min-h-56 w-full cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-[transform,opacity,border-color,box-shadow] duration-200 ease-out group-hover/pricing:scale-[0.985] group-hover/pricing:opacity-55 hover:!z-10 hover:!scale-[1.015] hover:!opacity-100 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl active:translate-y-0 dark:border-white/15 dark:bg-black sm:min-h-60 sm:p-6"
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-15 blur-2xl transition-transform duration-300 group-hover/card:scale-125"
                  style={{
                    backgroundColor: packageItem.accent,
                  }}
                />

                <div className="relative flex h-full flex-col">
                  <div className="mb-7 flex items-start justify-between gap-4 sm:mb-9">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Flame
                          className="h-5 w-5"
                          style={{ color: packageItem.accent }}
                        />

                        <h3 className="text-lg font-bold text-slate-950 dark:text-white sm:text-xl">
                          {packageItem.name}
                        </h3>
                      </div>

                      <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-white/55">
                        {packageItem.description}
                      </p>
                    </div>

                    <div className="rounded-full border border-slate-200 p-2 text-slate-500 transition-[border-color,color,transform] duration-200 group-hover/card:rotate-12 group-hover/card:border-primary/40 group-hover/card:text-primary dark:border-white/15 dark:text-white/55">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
                    <div
                      className="rounded-2xl px-4 py-3 text-xl font-extrabold text-white shadow-md sm:px-5 sm:text-2xl"
                      style={{
                        backgroundColor: packageItem.accent,
                      }}
                    >
                      {packageItem.speed} Mbps
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
                        TK{packageItem.price}
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
            {/*
              A dark overlay is much smoother than backdrop-blur over the
              entire animated website.
            */}
            <motion.button
              type="button"
              aria-label="Close package details"
              onClick={() => setSelectedPackage(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="absolute inset-0 cursor-default bg-slate-950/70"
            />

            <motion.article
              role="dialog"
              aria-modal="true"
              aria-labelledby={`package-title-${selectedPackage.id}`}
              initial={{
                opacity: 0,
                y: 18,
                scale: 0.975,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.985,
              }}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10 max-h-[92vh] w-full max-w-4xl transform-gpu overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl will-change-transform dark:border-white/15 dark:bg-slate-950"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedPackage(null)}
                className="absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-[color,transform] duration-200 hover:rotate-90 hover:text-primary dark:border-white/15 dark:bg-black dark:text-white sm:right-4 sm:top-4"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid md:grid-cols-2 xl:grid-cols-[0.95fr_1.25fr_0.95fr]">
                <div className="border-b border-slate-200 p-5 sm:p-7 md:border-b-0 md:border-r dark:border-white/10">
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
                    style={{
                      backgroundColor: selectedPackage.accent,
                    }}
                  >
                    {selectedPackage.speed} Mbps
                  </div>
                </div>

                <div className="border-b border-slate-200 p-5 sm:p-7 md:border-b-0 xl:border-r dark:border-white/10">
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
                    TK{selectedPackage.price}
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
                      const packageItem = selectedPackage;
                      setSelectedPackage(null);
                      onBuyPackage(packageItem);
                    }}
                    className="w-full cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-primary active:translate-y-0 dark:bg-white dark:text-slate-950 dark:hover:bg-primary dark:hover:text-white"
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