import type { AuctionListItem, AuctionType, AuctionStatus, TradingStatus, CargoBodyType } from './types'
import type { Bet } from './types'
import { CITIES } from '~/shared/lib/cities'

const CARGO_NAMES = [
  'Строительные материалы', 'Продукты питания', 'Оборудование',
  'Металлопрокат', 'Химическая продукция', 'Текстиль',
  'Мебель', 'Бытовая техника', 'Запчасти', 'Упаковка',
]

const BODY_TYPES: CargoBodyType[] = ['Tent', 'Refrigerator', 'Isothermal', 'Flatbed', 'Container', 'Tanker']

const STATUSES: AuctionStatus[] = ['Active', 'Closed', 'Cancelled', 'Pending', 'Finished']
const AUCTION_TYPES: AuctionType[] = ['Request', 'Up', 'Down', 'FixPrice']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(start: Date, days: number) {
  const d = new Date(start)
  d.setDate(d.getDate() + randomInt(0, days))
  return d.toISOString().split('T')[0]
}

const USER_CITIES = {
  load: 'Москва',
  unload: 'Санкт-Петербург',
}

function generateMockAuction(index: number): AuctionListItem & { organizer_phone?: string; organizer_email?: string; route?: any[]; payment_terms?: string; cargo_description?: string; unload_date_from?: string; unload_date_to?: string } {
  const uuid = `auction-${String(index).padStart(4, '0')}`
  const loadCity = randomFrom(CITIES)
  let unloadCity = randomFrom(CITIES)
  while (unloadCity === loadCity) unloadCity = randomFrom(CITIES)

  const loadDate = new Date()
  loadDate.setDate(loadDate.getDate() + randomInt(-5, 30))
  const loadFrom = loadDate.toISOString().split('T')[0]
  const loadTo = new Date(loadDate.getTime() + randomInt(1, 3) * 86400000).toISOString().split('T')[0]

  const status = randomFrom(STATUSES)
  const aucType = randomFrom(AUCTION_TYPES)
  const basePrice = randomInt(10000, 200000)
  const step = aucType === 'FixPrice' ? 0 : randomInt(500, 5000)

  return {
    uuid,
    cargo_num: `CARGO-${String(index).padStart(5, '0')}`,
    auc_type: aucType,
    status,
    trading_status: randomFrom<TradingStatus>(['Leading', 'Losing', 'Winner', 'Participant', 'None']),
    load_city: loadCity,
    unload_city: unloadCity,
    load_date_from: loadFrom,
    load_date_to: loadTo,
    cargo_name: randomFrom(CARGO_NAMES),
    cargo_weight_kg: randomInt(500, 25000),
    cargo_volume_m3: randomInt(5, 120),
    cargo_body_type: randomFrom(BODY_TYPES),
    current_price: basePrice,
    price_per_km: randomInt(20, 150),
    bet_step: step,
    has_my_bet: false,
    can_set_bet: status === 'Active',
    is_available: status === 'Active',
    is_bidder: Math.random() > 0.4,
    hide_bets_history: Math.random() > 0.85,
    hide_points_address_and_contacts: Math.random() > 0.8,
    no_view_cargo_price: Math.random() > 0.9,
    organizer_name: `ООО "Перевозчик ${randomInt(1, 50)}"`,
    organizer_phone: Math.random() > 0.3 ? `+7 (${randomInt(900, 999)}) ${randomInt(100, 999)}-${randomInt(10, 99)}-${randomInt(10, 99)}` : undefined,
    organizer_email: Math.random() > 0.3 ? `org${index}@example.com` : undefined,
    payment_terms: randomFrom(['Предоплата 50%', 'Оплата по факту', 'Наличный расчет', 'Безналичный расчет']),
    cargo_description: Math.random() > 0.5 ? `Описание груза для заявки ${index}` : undefined,
    unload_date_from: Math.random() > 0.5 ? randomDate(new Date(loadDate.getTime() + 3 * 86400000), 5) : undefined,
    unload_date_to: Math.random() > 0.5 ? randomDate(new Date(loadDate.getTime() + 5 * 86400000), 5) : undefined,
  }
}

function generateMockBets(auctionUuid: string, count: number): Bet[] {
  const carriers = [
    'ООО "Логистика Про"', 'ИП Иванов А.В.', 'ООО "ТрансСервис"',
    'АО "Грузоперевозки"', 'ИП Петров С.М.', 'ООО "АвтоТрейд"',
    'ООО "СКАЙ-ЛОГИСТИКа"', 'ИП Смирнова Е.О.',
  ]

  return Array.from({ length: count }, (_, i) => {
    const price = randomInt(5000, 200000)
    const hasNds = Math.random() > 0.5
    const ndsRate = hasNds ? 1.2 : 1
    return {
      id: `bet-${auctionUuid}-${i}`,
      auction_uuid: auctionUuid,
      carrier_name: carriers[i % carriers.length],
      price,
      price_with_nds: Math.round(price * ndsRate),
      price_without_nds: Math.round(price / ndsRate),
      has_nds: hasNds,
      is_winner: i === 0,
      is_cancelled: Math.random() > 0.85,
      cancel_reason: undefined,
      rank: i + 1,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    }
  })
}

const MOCK_ITEMS = Array.from({ length: 47 }, (_, i) => generateMockAuction(i))

const mockBetsMap = new Map<string, Bet[]>()
MOCK_ITEMS.forEach((item) => {
  const betCount = randomInt(0, 12)
  if (betCount > 0) {
    mockBetsMap.set(item.uuid, generateMockBets(item.uuid, betCount))
  }
})

export type MockAuction = (typeof MOCK_ITEMS)[number]

export const db = {
  auctions: [...MOCK_ITEMS] as MockAuction[],
  bets: mockBetsMap,

  getAuctions(filters: {
    cargo_num?: string
    status?: string
    statuses?: string[]
    auc_type?: string
    load_city?: string
    unload_city?: string
    load_date_from?: string
    load_date_to?: string
    is_available?: boolean
    is_bidder?: boolean
    price_from?: number
    price_to?: number
    page?: number
    per_page?: number
  }) {
    let filtered = [...this.auctions]

    if (filters.cargo_num) {
      filtered = filtered.filter((a) =>
        a.cargo_num.toLowerCase().includes(filters.cargo_num!.toLowerCase()),
      )
    }
    if (filters.status) {
      filtered = filtered.filter((a) => a.status === filters.status)
    }
    if (filters.statuses?.length) {
      filtered = filtered.filter((a) => filters.statuses!.includes(a.status))
    }
    if (filters.auc_type) {
      filtered = filtered.filter((a) => a.auc_type === filters.auc_type)
    }
    if (filters.load_city) {
      filtered = filtered.filter((a) =>
        a.load_city.toLowerCase().includes(filters.load_city!.toLowerCase()),
      )
    }
    if (filters.unload_city) {
      filtered = filtered.filter((a) =>
        a.unload_city.toLowerCase().includes(filters.unload_city!.toLowerCase()),
      )
    }
    if (filters.load_date_from) {
      filtered = filtered.filter((a) => a.load_date_from >= filters.load_date_from!)
    }
    if (filters.load_date_to) {
      filtered = filtered.filter((a) => a.load_date_to <= filters.load_date_to!)
    }
    if (filters.is_available !== undefined) {
      filtered = filtered.filter((a) => a.is_available === filters.is_available)
    }
    if (filters.is_bidder !== undefined) {
      filtered = filtered.filter((a) => a.is_bidder === filters.is_bidder)
    }
    if (filters.price_from !== undefined) {
      filtered = filtered.filter((a) => a.current_price >= filters.price_from!)
    }
    if (filters.price_to !== undefined) {
      filtered = filtered.filter((a) => a.current_price <= filters.price_to!)
    }

    const page = filters.page ?? 1
    const perPage = filters.per_page ?? 10
    const total = filtered.length
    const start = (page - 1) * perPage
    const items = filtered.slice(start, start + perPage)

    return { items, total, page, per_page: perPage }
  },

  getAuctionDetail(uuid: string): (MockAuction & { organizer: any; route: any[]; trading: any }) | undefined {
    const item = this.auctions.find((a) => a.uuid === uuid)
    if (!item) return undefined

    return {
      ...item,
      organizer: {
        name: item.organizer_name,
        rating: 4.5,
        deals_count: randomInt(50, 500),
        phone: (item as any).organizer_phone,
        email: (item as any).organizer_email,
      },
      route: [
        {
          id: 'point-1',
          city: item.load_city,
          address: item.hide_points_address_and_contacts ? undefined : `ул. ${randomFrom(['Ленина', 'Пушкина', 'Гагарина', 'Мира', 'Советская'])}, д. ${randomInt(1, 100)}`,
          date_from: item.load_date_from,
          date_to: item.load_date_to,
          type: 'load' as const,
        },
        {
          id: 'point-2',
          city: item.unload_city,
          address: item.hide_points_address_and_contacts ? undefined : `ул. ${randomFrom(['Ленина', 'Пушкина', 'Гагарина', 'Мира', 'Советская'])}, д. ${randomInt(1, 100)}`,
          date_from: item.load_date_to,
          date_to: item.load_date_to,
          type: 'unload' as const,
        },
      ],
      trading: {
        can_set_bet: item.can_set_bet,
        current_price: item.current_price,
        available_price: item.current_price + item.bet_step * 2,
        min_price: item.auc_type === 'Down' ? 1000 : item.current_price,
        max_price: item.auc_type === 'Up' ? item.current_price * 2 : undefined,
        step: item.bet_step,
        my_bet: item.has_my_bet
          ? { value: item.current_price + item.bet_step, has_nds: true }
          : undefined,
      },
      cargo_description: (item as any).cargo_description,
      payment_terms: (item as any).payment_terms,
      unload_date_from: (item as any).unload_date_from,
      unload_date_to: (item as any).unload_date_to,
    }
  },

  getBets(auctionUuid: string) {
    const bets = this.bets.get(auctionUuid) ?? []
    return {
      items: bets,
      total: bets.length,
      participants_count: new Set(bets.map((b) => b.carrier_name)).size,
    }
  },

  placeBet(auctionUuid: string, data: { price: number; has_nds?: boolean }) {
    const auction = this.auctions.find((a) => a.uuid === auctionUuid)
    if (!auction) {
      throw { status: 404, message: 'Аукцион не найден' }
    }
    if (!auction.can_set_bet) {
      throw { status: 422, message: 'Ставки на этот аукцион закрыты', details: { can_set_bet: false } }
    }
    if (data.price <= 0) {
      throw { status: 422, message: 'Цена должна быть больше 0', details: { price: 'must be positive' } }
    }

    auction.current_price = data.price
    auction.has_my_bet = true
    auction.trading_status = 'Leading'

    const existing = this.bets.get(auctionUuid) ?? []
    const existingBetIndex = existing.findIndex((b) => b.carrier_name === 'Вы')

    if (existingBetIndex !== -1) {
      const old = existing[existingBetIndex]
      existing[existingBetIndex] = {
        ...old,
        price: data.price,
        price_with_nds: Math.round(data.price * (data.has_nds ? 1.2 : 1)),
        price_without_nds: Math.round(data.price / (data.has_nds ? 1.2 : 1)),
        has_nds: data.has_nds ?? true,
        created_at: new Date().toISOString(),
      }
      this.bets.set(auctionUuid, existing)
    } else {
      const bet: Bet = {
        id: `bet-${auctionUuid}-${Date.now()}`,
        auction_uuid: auctionUuid,
        carrier_name: 'Вы',
        price: data.price,
        price_with_nds: Math.round(data.price * (data.has_nds ? 1.2 : 1)),
        price_without_nds: Math.round(data.price / (data.has_nds ? 1.2 : 1)),
        has_nds: data.has_nds ?? true,
        is_winner: true,
        is_cancelled: false,
        rank: 1,
        created_at: new Date().toISOString(),
      }
      this.bets.set(auctionUuid, [bet, ...existing])
    }

    return {
      price: data.price,
      has_nds: data.has_nds ?? true,
      is_winner: true,
    }
  },
}
