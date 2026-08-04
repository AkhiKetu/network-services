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

The app currently uses local storage and mock data, so no backend or database is required to run it locally.

Useful commands:

```bash
pnpm dev      # start the development server
pnpm build    # create a production build
pnpm start    # serve the production build
```
