import { apiRequest } from '~/shared/api/client'
import type { BetListResponse, PlaceBetRequest, PlaceBetResponse } from './types'

export function fetchBets(
  auctionUuid: string,
  signal?: AbortSignal,
): Promise<BetListResponse> {
  return apiRequest<BetListResponse>(`/auctions/${auctionUuid}/bets`, { signal })
}

export function placeBet(
  auctionUuid: string,
  data: PlaceBetRequest,
): Promise<PlaceBetResponse> {
  return apiRequest<PlaceBetResponse>(`/auctions/${auctionUuid}/bets`, {
    method: 'POST',
    body: data,
  })
}
