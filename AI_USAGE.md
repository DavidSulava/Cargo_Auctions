# AI Usage Guide

## Project Overview
Cargo Auctions SPA — React 19 + TypeScript 6 + TanStack Router/Query + RHF + Zod + MSW + Astryx + Tailwind v4.

## Key Decisions

### UI Library: Astryx + Tailwind bridge
- `@astryxdesign/core` provides Astryx components (Dialog, Button, Input, Select, etc.)
- Astryx uses its own design tokens system. **Do NOT** add custom CSS overrides to match Astryx — rely on `@astryxdesign/core/tailwind-theme.css` for Tailwind utility classes tied to Astryx design tokens.
- CSS layers order in `src/index.css`: Tailwind base → Astryx system → Tailwind utilities.
- See `wayfinder/assets/astryx-component-map.md` for the component mapping reference.

### State Management
- **Server state**: TanStack Query (all API data)
- **UI state**: Zustand (modals, filters, toasts)
- **URL state**: TanStack Router search params parsed via Zod schema (`filter-schema.ts`)

### API Layer
- MSW handles all requests in dev and test mode.
- API paths: `/api/auctions/list` (POST), `/api/auctions/:uuid`, `/api/auctions/:uuid/bets`, `/api/cities` (GET).
- Client base URL: `/api` (from `VITE_API_BASE` env var, defaults to `/api`).
- Error handling: `ApiError extends Error` with `status` and `code` fields.

### Routing
- TanStack Router with 4 flat routes: `/` (list), `/auctions/$id` (detail), `/auctions/$id/bets` (bets tab), `/auctions/$id/bet` (bet form).
- Search params serialized via filterSchema for filters/pagination persistence in URL.
- GitHub Pages base path: `/Cargo_Auctions/`.

### Forms
- React Hook Form + Zod resolver.
- Bet amount validation: min/max/step from auction data, passed as contextual params to `createBetSchema(min, max, step)`.
- Bet form is a dedicated page (`/auctions/$uuid/bid`), not a dialog.

### VAT semantics (decision)
- Bet price is entered and ranked **without VAT** (comparison base, as in 44-FZ/223-FZ procurement).
- `has_nds=true` → payer of VAT: `price_with_nds = base × 1.2`, `price_without_nds = base`.
- `has_nds=false` → both equal the base.
- Rate constant + helpers live in `src/shared/lib/vat.ts` (`VAT_RATE = 0.2`).
- `current_price`, `available_price`, `min/max/step` are always in the «без НДС» scale.

### Mock Data
- `src/shared/mocks/db.ts`: stateful in-memory store with 47 mock auctions, bets per auction, filter/paginate/mutate.
- MSW handlers in `src/shared/mocks/handlers/`.

### Testing
- **Vitest** for unit tests (schemas, API client logic).
- **Playwright** for e2e tests (basic navigation, form submission).
- MSW auto-mocked in dev; Playwright runs against real Vite dev server.

### FSD Structure
- `entities/` — domain types (auction, bet)
- `pages/` — page-level components (4 pages)
- `widgets/` — reusable blocks (filters panel, table, bet form)
- `shared/` — API client, MSW, Zod schemas, utilities
- `app/` — entry points, providers, router definition

### Build & Deploy
- Docker: multi-stage build (node → nginx alpine), serves on `:80`, exposed as `:8080`.
- GitHub Pages: base `/Cargo_Auctions/`, 404.html SPA fallback.
- `npm run test:e2e` starts dev server automatically via Playwright webServer config.
