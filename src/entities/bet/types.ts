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

export interface BetListResponse {
  items: Bet[]
  total: number
  participants_count: number
}

export interface PlaceBetRequest {
  price: number
  has_nds?: boolean
  comment?: string
}

export interface PlaceBetResponse {
  id: string
  price: number
  has_nds: boolean
  is_winner: boolean
}
