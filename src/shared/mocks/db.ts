import type { AuctionListItem, AuctionType, AuctionStatus, CargoBodyType, AuctionListResponse, AuctionDetail } from '~/entities/auction/types'
import type { Bet, BetListResponse, PlaceBetRequest, PlaceBetResponse } from '~/entities/bet/types'
import { canPlaceBet, deriveTradingStatus, finalizeBets, isPriceDirectionValid, type MyBetState } from '~/entities/auction/status-rules'
import { CITIES } from '~/shared/lib/cities'
import { priceWithVat } from '~/shared/lib/vat'

const CARGO_NAMES = [
  'Строительные материалы', 'Продукты питания', 'Оборудование',
  'Металлопрокат', 'Химическая продукция', 'Текстиль',
  'Мебель', 'Бытовая техника', 'Запчасти', 'Упаковка',
]

const BODY_TYPES: CargoBodyType[] = ['Tent', 'Refrigerator', 'Isothermal', 'Flatbed', 'Container', 'Tanker']

const STATUSES: AuctionStatus[] = ['Active', 'Closed', 'Cancelled', 'Pending', 'Finished']
const AUCTION_TYPES: AuctionType[] = ['Request', 'Up', 'Down', 'FixPrice']

const CARRIERS = [
  'ООО "Логистика Про"', 'ИП Иванов А.В.', 'ООО "ТрансСервис"',
  'АО "Грузоперевозки"', 'ИП Петров С.М.', 'ООО "АвтоТрейд"',
  'ООО "СКАЙ-ЛОГИСТИКа"', 'ИП Смирнова Е.О.',
]

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

interface DetailEnrichmentFields {
  organizer_phone?: string
  organizer_email?: string
  payment_terms?: string
  cargo_description?: string
  unload_date_from?: string
  unload_date_to?: string
}

interface MockScenario {
  status: AuctionStatus
  auc_type?: AuctionType
  include_me?: boolean
  my_position?: 1 | 2
}

const FIXED_SCENARIOS: MockScenario[] = [
  { status: 'Active', auc_type: 'Down', include_me: true, my_position: 1 },
  { status: 'Active', auc_type: 'Up', include_me: true, my_position: 2 },
  { status: 'Finished', auc_type: 'Down', include_me: true, my_position: 1 },
  { status: 'Finished', auc_type: 'Up', include_me: true, my_position: 2 },
  { status: 'Cancelled', auc_type: 'Request', include_me: true },
  { status: 'Pending', auc_type: 'Up' },
  { status: 'Closed', auc_type: 'Down', include_me: true, my_position: 2 },
  { status: 'Active', auc_type: 'Up' },
]

function randomScenario(index: number): MockScenario {
  if (index < FIXED_SCENARIOS.length) return FIXED_SCENARIOS[index]
  const status = randomFrom(STATUSES)
  const aucType = randomFrom(AUCTION_TYPES)
  const includeMe = status !== 'Pending' && aucType !== 'FixPrice' && Math.random() < 0.25
  return {
    status,
    auc_type: aucType,
    include_me: includeMe || undefined,
    my_position: includeMe ? (Math.random() < 0.5 ? 1 : 2) : undefined,
  }
}

function generateMockAuction(index: number, scenario: MockScenario): AuctionListItem & DetailEnrichmentFields {
  const uuid = `auction-${String(index).padStart(4, '0')}`
  const loadCity = randomFrom(CITIES)
  let unloadCity = randomFrom(CITIES)
  while (unloadCity === loadCity) unloadCity = randomFrom(CITIES)

  const loadDate = new Date()
  loadDate.setDate(loadDate.getDate() + randomInt(-5, 30))
  const loadFrom = loadDate.toISOString().split('T')[0]
  const loadTo = new Date(loadDate.getTime() + randomInt(1, 3) * 86400000).toISOString().split('T')[0]

  const status = scenario.status
  const aucType = scenario.auc_type ?? randomFrom(AUCTION_TYPES)
  const basePrice = randomInt(10000, 200000)
  const step = aucType === 'FixPrice' ? 0 : randomInt(500, 5000)

  return {
    uuid,
    cargo_num: `CARGO-${String(index).padStart(5, '0')}`,
    auc_type: aucType,
    status,
    trading_status: 'None',
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
    can_set_bet: canPlaceBet(status, aucType),
    is_available: status === 'Active',
    is_bidder: false,
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

function generateMockBets(auction: AuctionListItem, scenario: MockScenario): Bet[] {
  const ascending = auction.auc_type !== 'Up'
  const includeMe = scenario.include_me === true
  const myIndex = includeMe ? (scenario.my_position === 2 ? 1 : 0) : -1
  const total = randomInt(1, 6) + (includeMe ? 1 : 0)

  const prices: number[] = []
  let last = auction.current_price
  for (let i = 0; i < total; i++) {
    const delta = randomInt(1, 5) * Math.max(auction.bet_step, 1)
    const price = ascending ? Math.max(1000, last - delta) : last + delta
    prices.push(price)
    last = price
  }
  prices.sort(ascending ? (a, b) => a - b : (a, b) => b - a)

  return prices.map((price, i) => {
    const hasNds = Math.random() > 0.5
    return {
      id: `bet-${auction.uuid}-${i}`,
      auction_uuid: auction.uuid,
      carrier_name: i === myIndex ? 'Вы' : CARRIERS[randomInt(0, CARRIERS.length - 1)],
      price,
      price_with_nds: hasNds ? priceWithVat(price) : price,
      price_without_nds: price,
      has_nds: hasNds,
      is_winner: false,
      is_cancelled: false,
      rank: 0,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    }
  })
}

function findMyBet(bets: Bet[] | undefined): MyBetState {
  const mine = bets?.find((b) => b.carrier_name === 'Вы')
  return { has_my_bet: mine !== undefined, rank: mine?.rank ?? 0, is_winner: mine?.is_winner ?? false }
}

type AuctionFilterParams = {
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
}

export function filterAuctions(
  items: AuctionListItem[],
  filters: AuctionFilterParams,
): AuctionListItem[] {
  let filtered = [...items]

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

  return filtered
}

export interface AuctionRepository {
  listAuctions(filters: AuctionFilterParams & { page?: number; per_page?: number }): AuctionListResponse
  getAuctionDetail(uuid: string): AuctionDetail | undefined
  getBets(auctionUuid: string): BetListResponse
  placeBet(auctionUuid: string, data: PlaceBetRequest): PlaceBetResponse
}

const _scenarios: MockScenario[] = Array.from({ length: 47 }, (_, i) => randomScenario(i))
const _mockAuctions: (AuctionListItem & DetailEnrichmentFields)[] = _scenarios.map((scenario, i) => generateMockAuction(i, scenario))

const _mockBetsMap = new Map<string, Bet[]>()
_mockAuctions.forEach((auction, i) => {
  if (auction.status === 'Pending' || auction.auc_type === 'FixPrice') return
  let bets = generateMockBets(auction, _scenarios[i])
  if (auction.status === 'Cancelled') {
    bets = bets.map((b) => ({ ...b, is_cancelled: true }))
  }
  const finalized = finalizeBets(bets, auction.auc_type, auction.status)
  _mockBetsMap.set(auction.uuid, finalized)
  const leader = finalized.find((b) => b.rank === 1)
  if (leader) auction.current_price = leader.price
})

_mockAuctions.forEach((auction) => {
  const mine = findMyBet(_mockBetsMap.get(auction.uuid))
  auction.has_my_bet = mine.has_my_bet
  auction.is_bidder = mine.has_my_bet
  auction.trading_status = deriveTradingStatus(auction.status, mine)
})

export function createMockRepository(): AuctionRepository {
  let auctions = structuredClone(_mockAuctions)
  let bets = new Map(Array.from(_mockBetsMap.entries()).map(([k, v]) => [k, structuredClone(v)]))

  return {
    listAuctions(filters) {
      const filtered = filterAuctions(auctions, filters)
      const page = filters.page ?? 1
      const perPage = filters.per_page ?? 10
      const total = filtered.length
      const start = (page - 1) * perPage
      const items = filtered.slice(start, start + perPage)
      return { items, total, page, per_page: perPage }
    },

    getAuctionDetail(uuid: string) {
      const item = auctions.find((a) => a.uuid === uuid)
      if (!item) return undefined

      const myBet = bets.get(item.uuid)?.find((b) => b.carrier_name === 'Вы' && !b.is_cancelled)

      return {
        ...item,
        organizer: {
          name: item.organizer_name,
          rating: 4.5,
          deals_count: randomInt(50, 500),
          phone: item.organizer_phone,
          email: item.organizer_email,
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
          available_price: item.auc_type === 'Up'
            ? item.current_price + item.bet_step * 2
            : item.auc_type === 'FixPrice'
              ? item.current_price
              : Math.max(1000, item.current_price - item.bet_step * 2),
          min_price: item.auc_type === 'Down' || item.auc_type === 'Request' ? 1000 : item.current_price,
          max_price: item.auc_type === 'Up' ? item.current_price * 2 : undefined,
          step: item.bet_step,
          my_bet: myBet
            ? { value: myBet.price, has_nds: myBet.has_nds }
            : undefined,
        },
        cargo_description: item.cargo_description,
        payment_terms: item.payment_terms,
        unload_date_from: item.unload_date_from,
        unload_date_to: item.unload_date_to,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },

    getBets(auctionUuid: string) {
      const items = bets.get(auctionUuid) ?? []
      return {
        items,
        total: items.length,
        participants_count: new Set(items.map((b) => b.carrier_name)).size,
      }
    },

    placeBet(auctionUuid: string, data: PlaceBetRequest) {
      const auction = auctions.find((a) => a.uuid === auctionUuid)
      if (!auction) {
        throw { status: 404, message: 'Аукцион не найден' }
      }
      if (!canPlaceBet(auction.status, auction.auc_type)) {
        throw { status: 422, message: 'Ставки на этот аукцион закрыты', details: { can_set_bet: false } }
      }
      if (data.price <= 0) {
        throw { status: 422, message: 'Цена должна быть больше 0', details: { price: 'must be positive' } }
      }
      if (!isPriceDirectionValid(auction.auc_type, data.price, auction.current_price)) {
        const message = auction.auc_type === 'Up'
          ? 'Цена должна быть выше текущей'
          : 'Цена должна быть ниже текущей'
        throw { status: 422, message, details: { price: message } }
      }

      const existing = bets.get(auctionUuid) ?? []
      const existingIndex = existing.findIndex((b) => b.carrier_name === 'Вы')
      const hasNds = data.has_nds ?? true
      const now = new Date().toISOString()

      let myBet: Bet
      if (existingIndex !== -1) {
        const old = existing[existingIndex]
        myBet = {
          ...old,
          price: data.price,
          price_with_nds: hasNds ? priceWithVat(data.price) : data.price,
          price_without_nds: data.price,
          has_nds: hasNds,
          is_cancelled: false,
          created_at: now,
        }
        existing[existingIndex] = myBet
      } else {
        myBet = {
          id: `bet-${auctionUuid}-${Date.now()}`,
          auction_uuid: auctionUuid,
          carrier_name: 'Вы',
          price: data.price,
          price_with_nds: hasNds ? priceWithVat(data.price) : data.price,
          price_without_nds: data.price,
          has_nds: hasNds,
          is_winner: false,
          is_cancelled: false,
          rank: 0,
          created_at: now,
        }
        existing.push(myBet)
      }

      const finalized = finalizeBets(existing, auction.auc_type, auction.status)
      bets.set(auctionUuid, finalized)
      const mine = finalized.find((b) => b.id === myBet.id)!

      auction.current_price = mine.price
      auction.has_my_bet = true
      auction.is_bidder = true
      auction.trading_status = deriveTradingStatus(auction.status, {
        has_my_bet: true,
        rank: mine.rank,
        is_winner: mine.is_winner,
      })

      return {
        id: mine.id,
        price: data.price,
        has_nds: hasNds,
        is_winner: mine.is_winner,
      }
    },
  }
}

export const db = createMockRepository()
