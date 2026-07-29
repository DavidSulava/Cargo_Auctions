# Mock Data Design (Ticket 002)

**Date:** 2026-07-29
**Status:** Resolved — implemented in `src/shared/mocks/db.ts`

## DTO Types

### Auction

| Type | File | Key fields |
|------|------|------------|
| `AuctionListItem` | `entities/auction/types.ts:34` | uuid, cargo_num, auc_type, status, trading_status, prices, flags |
| `AuctionDetail` | `entities/auction/types.ts:89` | extends list with organizer, route[], trading, cargo_description |
| `AuctionListResponse` | `entities/auction/types.ts:61` | items[], total, page, per_page |
| `AuctionFilters` | `entities/auction/types.ts:115` | 14 optional fields for filtering |

### Bet

| Type | File | Key fields |
|------|------|------------|
| `Bet` | `entities/bet/types.ts:1` | id, price (with/without nds), rank, is_winner, is_cancelled |
| `BetListResponse` | `entities/bet/types.ts:16` | items[], total, participants_count |
| `PlaceBetRequest` | `entities/bet/types.ts:22` | price, has_nds?, comment? |

## Enums

| Enum | Values |
|------|--------|
| `AuctionType` | Request, Up, Down, FixPrice |
| `AuctionStatus` | Active, Closed, Cancelled, Pending, Finished |
| `TradingStatus` | Leading, Losing, Winner, Participant, None |
| `CargoBodyType` | Tent, Refrigerator, Isothermal, Flatbed, Container, Tanker |

## Mock Dictionaries

- **Cities** (`db.ts:4`): 20 Russian cities
- **Cargo names** (`db.ts:11`): 10 types (building materials, food, equipment, etc.)
- **Body types** (`db.ts:17`): All 6 types from enum
- **Carriers** (`db.ts:92-97`): 8 company/individual names for bets

## Edge Cases Coverage

| Feature | Implementation |
|---------|---------------|
| `hide_bets_history: true/false` | Random 15% of auctions (`db.ts:78`) |
| `can_set_bet: true/false` | Tied to `status === 'Active'` (`db.ts:75`) |
| `no_view_cargo_price: true/false` | Random 10% (`db.ts:80`) |
| `hide_points_address_and_contacts` | Random 20% controls address in route (`db.ts:79`) |
| Empty bet lists | Random bet count 0-12 per auction (`db.ts:123`) |
| Pagination | 47 auctions total, all filters slice in `getAuctions()` |

## MSW Store Design (`db.ts`)

```
db = {
  auctions: MockAuction[]      -- 47 items, mutable
  bets: Map<string, Bet[]>     -- per-auction bets

  getAuctions(filters)         -- filter + paginate
  getAuctionDetail(uuid)       -- compose organizer + route + trading
  getBets(uuid)                -- return bet list
  placeBet(uuid, data)         -- validate → mutate auction + prepend bet
}
```

### API Handler Routes

| Method | Path | Handler |
|--------|------|---------|
| POST | `/api/auctions/list` | `handlers/auctions.ts` → db.getAuctions |
| GET | `/api/auctions/:uuid` | `handlers/auctions.ts` → db.getAuctionDetail |
| GET | `/api/auctions/:uuid/bets` | `handlers/bets.ts` → db.getBets |
| POST | `/api/auctions/:uuid/bets` | `handlers/bets.ts` → db.placeBet (422 on invalid/closed) |
| GET | `/api/cities?q=` | `handlers/cities.ts` → filter from CITIES |

### Error Responses

- **404** — `{ message: "Аукцион не найден" }` when uuid doesn't exist
- **422** — `{ message, details: { price, can_set_bet } }` on validation failure
- **500** — `{ message }` fallback
