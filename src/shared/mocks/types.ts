export type AuctionType = 'Request' | 'Up' | 'Down' | 'FixPrice'

export type AuctionStatus = 'Active' | 'Closed' | 'Cancelled' | 'Pending' | 'Finished'

export type TradingStatus = 'Leading' | 'Losing' | 'Winner' | 'Participant' | 'None'

export type CargoBodyType = 'Tent' | 'Refrigerator' | 'Isothermal' | 'Flatbed' | 'Container' | 'Tanker'

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

export interface Bet {
  id: string
  auction_uuid: string
  carrier_name: string
  price: number
  price_with_nds: number
  price_without_nds: number
  has_nds: boolean
  is_winner: boolean
  is_cancelled: boolean
  cancel_reason?: string
  rank: number
  created_at: string
}
