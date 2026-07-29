export type AuctionType = 'Request' | 'Up' | 'Down' | 'FixPrice'

export type AuctionStatus =
  | 'Active'
  | 'Closed'
  | 'Cancelled'
  | 'Pending'
  | 'Finished'

export type TradingStatus =
  | 'Leading'
  | 'Losing'
  | 'Winner'
  | 'Participant'
  | 'None'

export type CargoBodyType =
  | 'Tent'
  | 'Refrigerator'
  | 'Isothermal'
  | 'Flatbed'
  | 'Container'
  | 'Tanker'

export interface RoutePoint {
  id: string
  city: string
  address?: string
  date_from: string
  date_to: string
  type: 'load' | 'unload'
}

export interface AuctionListItem {
  uuid: string
  cargo_num: string
  auc_type: AuctionType
  status: AuctionStatus
  trading_status: TradingStatus
  load_city: string
  unload_city: string
  load_date_from: string
  load_date_to: string
  cargo_name: string
  cargo_weight_kg: number
  cargo_volume_m3: number
  cargo_body_type: CargoBodyType
  current_price: number
  price_per_km: number
  bet_step: number
  has_my_bet: boolean
  can_set_bet: boolean
  is_available: boolean
  is_bidder: boolean
  hide_bets_history: boolean
  hide_points_address_and_contacts: boolean
  no_view_cargo_price: boolean
  organizer_name: string
}

export interface AuctionListResponse {
  items: AuctionListItem[]
  total: number
  page: number
  per_page: number
}

export interface AuctionOrganizer {
  name: string
  rating: number
  deals_count: number
  phone?: string
  email?: string
}

export interface AuctionTrading {
  can_set_bet: boolean
  current_price: number
  available_price: number
  min_price?: number
  max_price?: number
  step: number
  my_bet?: {
    value: number
    has_nds: boolean
  }
}

export interface AuctionDetail {
  uuid: string
  cargo_num: string
  auc_type: AuctionType
  status: AuctionStatus
  trading_status: TradingStatus
  organizer: AuctionOrganizer
  route: RoutePoint[]
  cargo_name: string
  cargo_weight_kg: number
  cargo_volume_m3: number
  cargo_body_type: CargoBodyType
  cargo_description?: string
  payment_terms?: string
  load_date_from: string
  load_date_to: string
  unload_date_from?: string
  unload_date_to?: string
  trading: AuctionTrading
  hide_points_address_and_contacts: boolean
  hide_bets_history: boolean
  no_view_cargo_price: boolean
  created_at: string
  updated_at: string
}

export interface AuctionFilters {
  cargo_num?: string
  status?: AuctionStatus
  statuses?: AuctionStatus[]
  auc_type?: AuctionType
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
}
