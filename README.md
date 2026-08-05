# Drum Tracer — standalone project

A dedicated, standalone Next.js project for **Drum Tracer** (Midal Cables shipment
tracking). It started as a copy of a larger internal admin template (`fat-admin`),
but every restaurant-specific module, auth system, and unused dependency has been
removed — this project contains **only** Drum Tracer.

## Stack

- **Next.js 16.3.0** (App Router, Turbopack)
- **React 19.2** / **TypeScript**
- **Bootstrap 5 + SCSS** (the original template's design system — sidebar, topbar,
  cards, tables, forms)
- **TanStack Table + TanStack Query**, **react-hook-form + zod** — the generic
  `useCRUDTable` / `CRUDTable` / `DetailsModal` system every module below uses
- **Mock API routes** (`src/app/api/**/route.ts`) backed by an **in-memory data
  store** (`src/lib/drum-tracer/store.ts`) — no database, no external backend,
  no login required.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. There's no login — every page is public.

> Data lives in memory and resets when the server process restarts. See "Swapping
> in a real database" below for the migration path.

## What's in this project

```
src/
  app/
    page.tsx                 # Dashboard (stats + recent orders/shipments)
    orders/                  # Orders: list/filter, 2-step create, detail
    shipments/                # Shipments: list/filter, create, and:
      [id]/page.tsx            #   detail page with tabs — Basic Info / Drums / Orders
      [id]/components/          #   assign-drums / assign-orders modals
    drums/                   # Drums: list/filter (status), single + bulk CSV import
    clients/                 # Clients: list/filter, create, detail
    sites/                   # Sites: list/filter, create, detail
    truck-deliveries/        # Truck Deliveries: list/filter, schedule form
    api/                      # Mock REST route handlers for all 6 entities
                              #   (list+search+pagination, create, update,
                              #    bulk-delete, plus shipment sub-resources)
  lib/drum-tracer/store.ts   # In-memory store + seed data
  services/drum-tracer/      # One *.service.ts per entity (calls the API routes)
  types/drum-tracer/         # Domain types per entity
  types/schemas/dt-*.schema.ts  # zod validation schemas per entity's form
  components/Crud/           # useCRUDTable hook, CRUDTable, DetailsModal
                              #   (the reusable table+form+modal system)
  components/layout/         # TopNavigationBar, VerticalNavigationBar (sidebar),
                              #   BaseLayout, AppShell (wires them together)
```

## Seed data

`src/lib/drum-tracer/store.ts` seeds one client (TenneT TSO GMBH), one site,
one order (4500101248), one shipment (SH2026001), and 13 drums (168–180) —
matching the original drumtracer.com screenshots this project was modeled on.

## Swapping in a real database

Every service file in `src/services/drum-tracer/` calls a tiny local fetch
client (`src/services/drum-tracer/client.ts`) that hits the mock `/api/*`
routes. To connect a real backend:

1. Replace `src/lib/drum-tracer/store.ts` with your ORM/DB client (Prisma,
   Drizzle, etc.) inside each `route.ts` handler — the response shapes
   (`{results, count}` for lists) already match what the frontend expects.
2. Or point `client.ts` at an external API instead of `/api/*` directly.
3. Add real authentication if needed — there is currently none in this
   project (see below).

## No authentication

This project intentionally ships with **no login system** — every route is
public. If you need auth before deploying this anywhere real:

- Add your own auth solution (next-auth, Clerk, a simple JWT cookie, etc.)
- Add a `src/middleware.ts` that checks it and redirects unauthenticated
  requests
- Gate `src/app/api/**/route.ts` handlers server-side too, not just the pages

## Upgraded to Next.js 16 ✅

This project now runs on **Next.js 16.3.0** (Turbopack) with **React 19.2**.
Because the restaurant modules and ~47 unused dependencies (FullCalendar,
Google Maps, Leaflet, ApexCharts, Chart.js, jsPDF, Filepond, react-quill,
next-auth, etc.) had already been removed, the upgrade was a single-step
`npm install next@16 react@19.2 react-dom@19.2` with **zero code changes**
needed for the build to pass — the small remaining dependency surface made
this low-risk, as expected.

One follow-up was needed: `eslint-config-next@16` moved off the legacy
`FlatCompat` pattern, so `eslint.config.mjs` now imports
`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
directly instead of going through `@eslint/eslintrc`'s compatibility shim
(the old pattern threw a "circular structure" error with the v16 config).

Two dependencies also needed bumping because their peer dependency ranges
capped out at React 18 (`@hello-pangea/dnd` → `^18.0.1`, `react-flatpickr` →
`^4.0.11`) — both now officially support React 19, so **plain `npm install`
works with no flags**, no `--legacy-peer-deps` needed anymore.

### Known pre-existing lint findings (not introduced by this upgrade)

Running `npx eslint .` surfaces ~10 `react-hooks/set-state-in-effect`
findings — a newer, stricter lint rule that flags `setState` called directly
inside `useEffect` bodies. These are all in original template files this
project inherited (`LanguageContext.tsx`, `useScrollEvent.ts`,
`useNotificationContext.tsx`, `AsyncAutocomplete.tsx`) — not files written
for Drum Tracer, and not build-blocking (`npm run build` passes cleanly).
Worth cleaning up eventually, but out of scope for a version upgrade.


## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
```
