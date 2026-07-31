# Domain glossary

Ubiquitous language for Cargo_Auctions. Names for modules and seams used in architecture discussions.

## Terms

- **Auction** (Аукцион) — a cargo auction listing: cargo info, route, organizer, status. Types: `Request`, `Up`, `Down`, `FixPrice`. Statuses: `Active`, `Pending`, `Closed`, `Cancelled`, `Finished`.
- **Bet** (Ставка) — a carrier's price offer on an auction. Compared without VAT; `has_nds` decides whether the payable amount includes 20% VAT (`price_with_nds`).
- **Bet placement** (размещение ставки) — the act of placing or changing a Bet on an auction. Implemented as one deep module (`widgets/bet-form` + `usePlaceBet` in `entities/bet/queries`): gate (`trading.can_set_bet`), price schema, submit, error mapping, and cache invalidation all live behind its interface.
- **trading** — the auction's bidding state as computed by the backend: current/available price, step, min/max price, the caller's own Bet, and whether Bets can be set. The result of `status-rules` applied server-side (mock) and consumed read-only by the UI.
- **VAT** (НДС) — 20% rate, single source `shared/lib/vat.ts`, used by both the UI and the mock backend.
- **Auction filters** — the search/filter state shared by the URL schema, the filter panel, and the mock's list endpoint.
