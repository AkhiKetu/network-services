# Network Services Portal

This is a small Next.js App Router application. The code is organized by responsibility:

```text
app/
  page.tsx                    Landing page
  layout.tsx                  Providers and global metadata
  globals.css                 Theme tokens and shared styles
  dashboard/
    layout.tsx                Auth guard and dashboard navigation
    admin/                    Admin pages
    user/                     Customer pages

components/
  animation/                  Landing-page animations
  auth/                       Login modal
  cards/                      Dashboard cards
  common/                     Shared controls
  navigation/                 Dashboard navigation
  sections/                   Landing-page sections
  ui/                         Small reusable UI primitives

lib/
  context/                    Theme, auth, and application state
  types/                      Shared TypeScript types
  utils/                      Mock data and business logic
```

The main data flow is:

`app/layout.tsx` → `ThemeProvider` → `AppProvider` → `AuthProvider` → pages/components

The public pages use local UI state where appropriate. The authenticated admin area reads and writes Supabase data through the route handlers in `app/api/admin/`; configure the required values in `.env.local` before using those pages.

## Code conventions

- Keep route pages focused on rendering and user interaction; put shared business rules in `lib/utils` and data access in `lib/supabase`.
- Prefer small typed helpers and derived values (`useMemo`) over repeated filtering or long inline expressions.
- Use the existing UI primitives from `components/ui` and shared cards before adding page-specific duplicates.
- Keep client components only where hooks or browser APIs are needed. Server routes and layouts should remain server components.

Useful commands:

```bash
pnpm dev      # start the development server
pnpm build    # create a production build
pnpm start    # serve the production build
```
