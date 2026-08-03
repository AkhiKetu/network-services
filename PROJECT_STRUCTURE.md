# Network Services Portal — Project Structure

```
network-services-portal/
├── app/                                  # Next.js App Router pages
│   ├── auth/
│   │   ├── layout.tsx                    # Shared layout for all auth pages (has ThemeToggle)
│   │   └── login/page.tsx                # Login page (used by both roles)
│   ├── dashboard/
│   │   ├── layout.tsx                    # Shared layout: fixed CapsuleNavbar + whole-page scroll
│   │   ├── admin/
│   │   │   ├── page.tsx                  # Admin dashboard home
│   │   │   ├── analytics/page.tsx        # Admin > Analytics
│   │   │   ├── connections/page.tsx      # Admin > Connections
│   │   │   ├── settings/page.tsx         # Admin > Settings
│   │   │   └── users/page.tsx            # Admin > Users management
│   │   └── user/
│   │       ├── page.tsx                  # User dashboard home
│   │       ├── billing/page.tsx          # User > Billing
│   │       ├── connections/page.tsx      # User > Connections
│   │       └── settings/page.tsx         # User > Settings
│   ├── layout.tsx                        # Root app layout
│   ├── page.tsx                          # Root / landing page
│   └── globals.css                       # Global styles (Tailwind base)
│
├── components/
│   ├── cards/
│   │   ├── BillingCard.tsx               # Used by dashboard/user/billing
│   │   ├── ConnectionCard.tsx            # Used by connections pages (admin + user)
│   │   ├── StatCard.tsx                  # Used by dashboard home pages
│   │   └── UserCard.tsx                  # Used by admin/users
│   ├── common/
│   │   └── ThemeToggle.tsx               # Single-icon light/dark switch — reused everywhere
│   ├── navigation/
│   │   └── CapsuleNavbar.tsx             # The one floating nav for all dashboard pages (links + welcome + theme + logout)
│   └── ui/                               # Low-level primitives (shadcn-style)
│       ├── badge.tsx
│       ├── button.tsx
│       └── input.tsx
│
├── lib/
│   ├── context/
│   │   ├── AppContext.tsx                # Global app state provider (users, connections, billing...)
│   │   ├── AuthContext.tsx               # Auth state provider (login/logout/updateProfile)
│   │   └── ThemeContext.tsx              # Light/dark theme provider, synced across tabs
│   ├── types/
│   │   └── index.ts                      # Shared TypeScript types
│   ├── utils/
│   │   ├── billCalculator.ts             # Logic feeding BillingCard
│   │   ├── dateUtils.ts                  # Date helpers
│   │   └── mockData.ts                   # Mock/dummy data for dev
│   └── utils.ts                          # General shared helper (e.g. cn())
│
├── public/                               # Static assets
│   ├── apple-icon.png
│   ├── icon.svg / icon-dark-32x32.png / icon-light-32x32.png
│   └── placeholder-logo.png/.svg, placeholder-user.jpg, placeholder.jpg/.svg
│
├── components.json                       # shadcn/ui config
├── next.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── .gitignore
```

## How things connect

- `app/dashboard/layout.tsx` wraps every page under `dashboard/`. It no longer splits the screen into a sidebar + content area — it renders one fixed `CapsuleNavbar` on top and lets the whole page scroll underneath it (`main` just gets top padding so content starts below the pill).
- `components/navigation/CapsuleNavbar.tsx` is the single nav for the whole dashboard: logo, role-based links (with icons), the "Welcome, {name}" text, `ThemeToggle`, and Logout — all in one floating rounded pill, same visual language as the landing page's navbar in `app/page.tsx`. On scroll (`window.scrollY > 40`) it shrinks: labels/welcome text fade out and only icons remain, exactly like the landing page's `scrolled` behavior.
- `app/dashboard/admin/*` and `app/dashboard/user/*` are parallel role-based sections, each with their own `page.tsx`. `CapsuleNavbar` picks the right link set (`ADMIN_LINKS` vs `USER_LINKS`) based on the `role` prop it's given.
- `components/cards/*` are reusable pieces consumed by dashboard pages (e.g. `BillingCard.tsx` → `user/billing/page.tsx`)
- `lib/context/*` provides app-wide state consumed across `app/`: `AppContext` (data), `AuthContext` (session/login), `ThemeContext` (light/dark)
- `lib/utils/*` holds business logic (billing calculations, dates, mock data) kept separate from UI

## Theme system (light/dark)

- **`lib/context/ThemeContext.tsx`** — single source of truth. Saves the choice to `localStorage["theme"]` and toggles a `light`/`dark` class on `<html>`. Every color in `app/globals.css` is a CSS variable keyed off that class, so all pages/components automatically match.
- **`app/layout.tsx`** — has a tiny inline `<script>` that runs before React hydrates, so the correct theme is applied on the very first paint (no flash of the wrong theme). `ThemeProvider` wraps the whole app here.
- **Cross-tab sync** — when you flip the switch in one tab, the browser's native `storage` event fires in every other open tab of the same browser, and `ThemeContext` listens for it and updates instantly. No extra setup needed; it just works as long as both tabs are on the same site.
- **`components/common/ThemeToggle.tsx`** — a single round icon button. Shows a **moon** in light mode (tap → dark) and a **sun** in dark mode (tap → light). One click, one icon, no separate switch states.
- Currently wired into: `app/auth/layout.tsx` (login pages), `app/page.tsx` (landing navbar — forced to white icon since that navbar's background is always dark navy by design), and `components/navigation/CapsuleNavbar.tsx` (all dashboard pages).

## Admin login, name, and the capsule navbar

- The very first admin account is hardcoded in `lib/utils/mockData.ts` (`phone: 01799999999`, `password: admin123`, `name: "Admin User"`). This is just a seed — real account creation from the UI happens in Admin → Settings → "Add Admin".
- `components/navigation/CapsuleNavbar.tsx` is the rounded "capsule" bar fixed at the top of every dashboard page — it shows **"Welcome, {name}"** using whatever name is on the current session, the nav links for that role, the shared `ThemeToggle`, and a `Logout` button.
- To change that starter name: Admin → Settings → Admin Profile → **Edit** next to Full Name → **Save**. This calls `updateProfile()` in `lib/context/AuthContext.tsx`, which updates both the active session and the shared users list (`updateUser()` in `lib/context/AppContext.tsx`), so the navbar greeting reflects it immediately everywhere.
