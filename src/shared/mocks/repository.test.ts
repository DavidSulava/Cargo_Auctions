import { describe, it, expect } from 'vitest'
import type { AuctionListItem } from '~/entities/auction/types'

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
    const list = repo.listAuctions({ page: 1, per_page: 1, is_available: true })
    if (list.items.length === 0) return
    const uuid = list.items[0].uuid
    const result = repo.placeBet(uuid, { price: 25000, has_nds: true })
    expect(result.price).toBe(25000)
    expect(result.is_winner).toBe(true)
  })

  it('placeBet throws 404 for unknown auction', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    expect(() => repo.placeBet('nonexistent', { price: 10000 })).toThrow('Аукцион не найден')
  })

  it('placeBet throws 422 for zero price', async () => {
    const { createMockRepository } = await import('./db')
    const repo = createMockRepository()
    const list = repo.listAuctions({ page: 1, per_page: 1, is_available: true })
    if (list.items.length === 0) return
    const uuid = list.items[0].uuid
    expect(() => repo.placeBet(uuid, { price: 0 })).toThrow('Цена должна быть больше 0')
  })

  it('createMockRepository produces isolated state — mutations dont leak', async () => {
    const { createMockRepository } = await import('./db')
    const repo1 = createMockRepository()
    const repo2 = createMockRepository()

    const target = repo1.listAuctions({ page: 1, per_page: 1, is_available: true })
    if (target.items.length === 0) return
    const uuid = target.items[0].uuid
    repo1.placeBet(uuid, { price: 99999 })

    const detail1 = repo1.getAuctionDetail(uuid)
    const detail2 = repo2.getAuctionDetail(uuid)

    expect(detail1!.trading.current_price).toBe(99999)
    expect(detail2!.trading.current_price).not.toBe(99999)
  })
})
