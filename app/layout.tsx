import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { AuthProvider } from "@/lib/context/AuthContext";
import { AppProvider } from "@/lib/context/AppContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";

const SITE_URL = "https://ccnetworks.vercel.app";

const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var saved = window.localStorage.getItem("theme");

    var theme =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    var root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: "Creative Cable & Networks",

  description:
    "Fast, stable, and reliable internet services with flexible packages from Creative Cable & Networks.",

  generator: "Akhi Ketu Chakma",

  openGraph: {
    title: "Creative Cable & Networks",

    description:
      "Experience fast and reliable internet with our premium packages.",

    url: SITE_URL,

    siteName: "Creative Cable & Networks",

    type: "website",

    images: [
      {
        url: `${SITE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Creative Cable & Networks",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Creative Cable & Networks",

    description:
      "Experience fast and reliable internet with our premium packages.",

    images: [`${SITE_URL}/opengraph-image.png`],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",

  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#0066cc",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#1a1a2e",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: NO_FLASH_THEME_SCRIPT,
          }}
        />
      </head>

      <body>
        <ThemeProvider>
          <AppProvider>
            <AuthProvider>{children}</AuthProvider>
          </AppProvider>
        </ThemeProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}