# Error Handling Strategy (Ticket 005)

**Date:** 2026-07-29
**Status:** Resolved

## Strategy

Errors map to one of three visual treatments: **inline Banner**, **form field**, or **toast**.

| Situation | Treatment | Implementation |
|-----------|-----------|----------------|
| List load fail | Inline Banner | `auction-list/index.tsx` — Banner in page |
| Detail load fail | Inline Banner | `auction-detail/index.tsx` — Banner + back button |
| Detail 404 | Inline Banner + back nav | `auction-detail/index.tsx` — `isError \|\| !data` |
| Bets load fail | Inline Banner | `auction-detail/index.tsx` (bets tab), `auction-bets/index.tsx` |
| Bets empty | Inline EmptyState | `auction-detail/index.tsx`, `auction-bets/index.tsx` |
| Bet mutation 422 | Field-level via RHF `setError` | `bet-form-modal/index.tsx` — parses ApiError.details |
| Bet mutation 422 (non-field) | Inline Banner in dialog | `bet-form-modal/index.tsx` — `submitError` state |
| Network error (MSW off) | Global toast | `global-error-toast.tsx` — query cache subscriber |
| Server error (5xx) | Global toast | `global-error-toast.tsx` — skipped if <500 |
| Any unhandled query error | Global toast | `global-error-toast.tsx` — deduped by queryKey |

## Classification

- **Client errors (4xx)**: Shown inline, near the relevant UI. Bet form 422 maps to individual fields via `setError`. 404 shows inline Banner.
- **Server errors (5xx)**: Global toast via `GlobalErrorToast` component (warns once per queryKey).
- **Network errors**: Detected as `TypeError` — shown as global toast with user-friendly message ("Сервер недоступен").
- **Validation errors (422)**: Parsed from `ApiError.details` at the mutation site. Field names matching form fields trigger `setError`.

## Components

### `GlobalErrorToast` (`src/app/global-error-toast.tsx`)
- Subscribes to `QueryCache` events via `queryClient.getQueryCache().subscribe()`
- Filters to error-state queries, deduplicates by `queryKey`
- Skips `ApiError` with status <500 (those are handled inline intentionally)
- Shows one toast per unique queryKey

### `BetFormModal` (`src/widgets/bet-form-modal/index.tsx`)
- Catches `ApiError` on form submit
- If status 422: iterates `err.details` keys, calls `setError(field, { message })` for matching form fields
- Falls back to inline `Banner` for the message when no field matches
