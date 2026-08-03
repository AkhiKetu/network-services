import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { AppProvider } from '@/lib/context/AppContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'

// Runs before React hydrates so the correct theme class is on <html> for
// the very first paint (no light-then-dark flash). Kept tiny and inline.
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var saved = window.localStorage.getItem('theme');
    var theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`

export const metadata: Metadata = {
  title: 'Network Services - WiFi Management',
  description: 'Manage your WiFi network connections and billing',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0066cc' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AppProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </AppProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
