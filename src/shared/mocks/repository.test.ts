import { describe, it, expect } from 'vitest'
import type { AuctionListItem } from '~/entities/auction'

function makeItem(overrides: Partial<AuctionListItem> = {}): AuctionListItem {
  return {
    uuid: 'auction-0001',
    cargo_num: 'CARGO-00001',
    auc_type: 'Request',
    status: 'Active',
    trading_status: 'None',
    load_city: 'Москва',
    unload_city: 'Санкт-Петербург',
    load_date_from: '2026-08-01',
    load_date_to: '2026-08-03',
    cargo_name: 'Строительные материалы',
    cargo_weight_kg: 5000,
    cargo_volume_m3: 20,
    cargo_body_type: 'Tent',
    current_price: 50000,
    price_per_km: 80,
    bet_step: 1000,
    has_my_bet: false,
    can_set_bet: true,
    is_available: true,
    is_bidder: false,
    hide_bets_history: false,
    hide_points_address_and_contacts: false,
    no_view_cargo_price: false,
    organizer_name: 'ООО "Тест"',
    ...overrides,
  }
}

describe('filterAuctions', () => {
  it('returns all items when no filters applied', async () => {
    const { filterAuctions } = await import('./db')
    const items = [makeItem(), makeItem({ uuid: 'auction-0002' })]
    expect(filterAuctions(items, {})).toHaveLength(2)
  })

  it('filters by cargo_num substring', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ cargo_num: 'CARGO-00123' }),
      makeItem({ cargo_num: 'CARGO-00456' }),
    ]
    const result = filterAuctions(items, { cargo_num: '123' })
    expect(result).toHaveLength(1)
    expect(result[0].cargo_num).toBe('CARGO-00123')
  })

  it('filters by status', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ status: 'Active' }),
      makeItem({ status: 'Closed' }),
    ]
    const result = filterAuctions(items, { status: 'Active' })
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('Active')
  })

  it('filters by multiple statuses', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ status: 'Active' }),
      makeItem({ status: 'Closed' }),
      makeItem({ status: 'Cancelled' }),
    ]
    const result = filterAuctions(items, { statuses: ['Active', 'Closed'] })
    expect(result).toHaveLength(2)
  })

  it('filters by auc_type', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ auc_type: 'Request' }),
      makeItem({ auc_type: 'Up' }),
    ]
    const result = filterAuctions(items, { auc_type: 'Up' })
    expect(result).toHaveLength(1)
  })

  it('filters by load_city substring', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ load_city: 'Москва' }),
      makeItem({ load_city: 'Казань' }),
    ]
    const result = filterAuctions(items, { load_city: 'мос' })
    expect(result).toHaveLength(1)
  })

  it('filters by unload_city substring', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ unload_city: 'Санкт-Петербург' }),
      makeItem({ unload_city: 'Казань' }),
    ]
    const result = filterAuctions(items, { unload_city: 'Петербург' })
    expect(result).toHaveLength(1)
  })

  it('filters by load_date_from', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ load_date_from: '2026-08-01' }),
      makeItem({ load_date_from: '2026-07-15' }),
    ]
    const result = filterAuctions(items, { load_date_from: '2026-08-01' })
    expect(result).toHaveLength(1)
  })

  it('filters by load_date_to', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ load_date_to: '2026-08-01' }),
      makeItem({ load_date_to: '2026-08-10' }),
    ]
    const result = filterAuctions(items, { load_date_to: '2026-08-05' })
    expect(result).toHaveLength(1)
  })

  it('filters by is_available', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ is_available: true }),
      makeItem({ is_available: false }),
    ]
    const result = filterAuctions(items, { is_available: true })
    expect(result).toHaveLength(1)
  })

  it('filters by is_bidder', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ is_bidder: true }),
      makeItem({ is_bidder: false }),
    ]
    const result = filterAuctions(items, { is_bidder: true })
    expect(result).toHaveLength(1)
  })

  it('filters by price_from', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ current_price: 10000 }),
      makeItem({ current_price: 50000 }),
    ]
    const result = filterAuctions(items, { price_from: 20000 })
    expect(result).toHaveLength(1)
    expect(result[0].current_price).toBe(50000)
  })

  it('filters by price_to', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ current_price: 10000 }),
      makeItem({ current_price: 50000 }),
    ]
    const result = filterAuctions(items, { price_to: 20000 })
    expect(result).toHaveLength(1)
    expect(result[0].current_price).toBe(10000)
  })

  it('combines multiple filters', async () => {
    const { filterAuctions } = await import('./db')
    const items = [
      makeItem({ status: 'Active', auc_type: 'Request', load_city: 'Москва' }),
      makeItem({ status: 'Active', auc_type: 'Up', load_city: 'Москва' }),
      makeItem({ status: 'Closed', auc_type: 'Request', load_city: 'Москва' }),
    ]
    const result = filterAuctions(items, { status: 'Active', auc_type: 'Request' })
    expect(result).toHaveLength(1)
  })
})

describe('AuctionRepository', () => {
  it('listAuctions returns paginated results', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const result = repo.listAuctions({ page: 1, per_page: 5 })
    expect(result.items).toHaveLength(5)
    expect(result.total).toBeGreaterThanOrEqual(47)
    expect(result.page).toBe(1)
  })

  it('listAuctions defaults to page 1 with 10 per page', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const result = repo.listAuctions({})
    expect(result.items).toHaveLength(10)
    expect(result.page).toBe(1)
  })

  it('listAuctions returns remaining items on last page', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const page1 = repo.listAuctions({ page: 1, per_page: 10 })
    const page2 = repo.listAuctions({ page: 2, per_page: 10 })
    const page5 = repo.listAuctions({ page: 5, per_page: 10 })
    expect(page1.items).toHaveLength(10)
    expect(page2.items).toHaveLength(10)
    expect(page5.items).toHaveLength(7)
    expect(page5.total).toBe(47)
  })

  it('getAuctionDetail returns detail for valid uuid', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const list = repo.listAuctions({ page: 1, per_page: 1 })
    const uuid = list.items[0].uuid
    const detail = repo.getAuctionDetail(uuid)
    expect(detail).toBeDefined()
    expect(detail!.uuid).toBe(uuid)
    expect(detail!.organizer).toBeDefined()
    expect(detail!.route).toHaveLength(2)
    expect(detail!.trading).toBeDefined()
  })

  it('getAuctionDetail returns undefined for unknown uuid', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    expect(repo.getAuctionDetail('nonexistent')).toBeUndefined()
  })

  it('getBets returns bets for an auction', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const auctionWithBets = all.items.find((a) => repo.getBets(a.uuid).total > 0)
    if (auctionWithBets) {
      const result = repo.getBets(auctionWithBets.uuid)
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.participants_count).toBeGreaterThan(0)
    }
  })

  it('getBets returns empty for auction with no bets', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const result = repo.getBets('nonexistent')
    expect(result.items).toHaveLength(0)
    expect(result.total).toBe(0)
  })

  it('placeBet succeeds with valid data', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const up = all.items.find((a) => a.auc_type === 'Up' && a.status === 'Active')
    if (!up) return
    const result = repo.placeBet(up.uuid, { price: 999999, has_nds: true })
    expect(result.price).toBe(999999)
    expect(result.is_winner).toBe(false)
    const detail = repo.getAuctionDetail(up.uuid)
    expect(detail!.trading_status).toBe('Leading')
  })

  it('placeBet with has_nds=true stores gross as +VAT and base as net', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const up = all.items.find((a) => a.auc_type === 'Up' && a.status === 'Active')
    if (!up) return
    const price = 700000
    repo.placeBet(up.uuid, { price, has_nds: true })
    const mine = repo.getBets(up.uuid).items.find((b) => b.carrier_name === 'Вы')
    expect(mine!.price).toBe(price)
    expect(mine!.price_without_nds).toBe(price)
    expect(mine!.price_with_nds).toBe(price * 1.2)
  })

  it('placeBet with has_nds=false keeps gross and net equal to the base', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const up = all.items.find((a) => a.auc_type === 'Up' && a.status === 'Active')
    if (!up) return
    const price = 700000
    repo.placeBet(up.uuid, { price, has_nds: false })
    const mine = repo.getBets(up.uuid).items.find((b) => b.carrier_name === 'Вы')
    expect(mine!.price).toBe(price)
    expect(mine!.price_with_nds).toBe(price)
    expect(mine!.price_without_nds).toBe(price)
  })

  it('placeBet throws 404 for unknown auction', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    expect(() => repo.placeBet('nonexistent', { price: 10000 })).toThrow('Аукцион не найден')
  })

  it('placeBet throws 422 for zero price', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const up = all.items.find((a) => a.auc_type === 'Up' && a.status === 'Active')
    if (!up) return
    expect(() => repo.placeBet(up.uuid, { price: 0 })).toThrow('Цена должна быть больше 0')
  })

  it('placeBet rejects a price not above the current one on Up auctions', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const up = all.items.find((a) => a.auc_type === 'Up' && a.status === 'Active')
    if (!up) return
    expect(() => repo.placeBet(up.uuid, { price: up.current_price })).toThrow('Цена должна быть выше текущей')
  })

  it('placeBet rejects a price not below the current one on Down/Request auctions', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const down = all.items.find((a) => a.auc_type === 'Down' && a.status === 'Active')
    if (!down) return
    expect(() => repo.placeBet(down.uuid, { price: down.current_price })).toThrow('Цена должна быть ниже текущей')
  })

  it('placeBet is rejected on FixPrice auctions', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const fixPrice = all.items.find((a) => a.auc_type === 'FixPrice')
    if (!fixPrice) return
    expect(() => repo.placeBet(fixPrice.uuid, { price: 1000 })).toThrow('Ставки на этот аукцион закрыты')
  })

  it('placeBet never marks a winner while trading is active', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    const up = all.items.find((a) => a.auc_type === 'Up' && a.status === 'Active')
    if (!up) return
    repo.placeBet(up.uuid, { price: 999999 })
    const bets = repo.getBets(up.uuid)
    expect(bets.items.filter((b) => b.is_winner)).toHaveLength(0)
  })

  it('all mock auctions satisfy status invariants', async () => {
    const { createMockRepository } = await import('./db')
    const { deriveTradingStatus } = await import('~/entities/auction/status-rules')
    const repo = createMockRepository()
    const all = repo.listAuctions({ page: 1, per_page: 47 })
    for (const a of all.items) {
      const bets = repo.getBets(a.uuid)
      const winners = bets.items.filter((b) => b.is_winner)

      expect(winners.length).toBeLessThanOrEqual(1)
      for (const w of winners) {
        expect(a.status).toBe('Finished')
        expect(w.is_cancelled).toBe(false)
      }
      if (a.status === 'Finished' && bets.items.length > 0) {
        expect(winners).toHaveLength(1)
      }
      if (a.status === 'Pending' || a.auc_type === 'FixPrice') {
        expect(bets.items).toHaveLength(0)
      }
      if (a.status === 'Cancelled') {
        expect(bets.items.every((b) => b.is_cancelled)).toBe(true)
      }

      const mine = bets.items.find((b) => b.carrier_name === 'Вы')
      const expected = deriveTradingStatus(a.status, {
        has_my_bet: mine !== undefined,
        rank: mine?.rank ?? 0,
        is_winner: mine?.is_winner ?? false,
      })
      expect(a.trading_status).toBe(expected)
      expect(a.has_my_bet).toBe(mine !== undefined)
      expect(a.is_bidder).toBe(mine !== undefined)
      expect(a.can_set_bet).toBe(a.status === 'Active' && a.auc_type !== 'FixPrice')
    }
  })

  it('createMockRepository produces isolated state — mutations dont leak', async () => {
    const { createMockRepository } = await import('./db')
    const repo1 = createMockRepository()
    const repo2 = createMockRepository()

    const target = repo1.listAuctions({ page: 1, per_page: 47 })
    const up = target.items.find((a) => a.auc_type === 'Up' && a.status === 'Active')
    if (!up) return
    const uuid = up.uuid
    repo1.placeBet(uuid, { price: 999999 })

    const detail1 = repo1.getAuctionDetail(uuid)
    const detail2 = repo2.getAuctionDetail(uuid)

    expect(detail1!.trading.current_price).toBe(999999)
    expect(detail2!.trading.current_price).not.toBe(999999)
  })
})
