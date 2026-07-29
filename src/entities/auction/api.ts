import { apiRequest } from '~/shared/api/client'
import type { AuctionFilters, AuctionListResponse, AuctionDetail } from './types'

export function fetchAuctions(
  filters: AuctionFilters,
  signal?: AbortSignal,
): Promise<AuctionListResponse> {
  return apiRequest<AuctionListResponse>('/auctions/list', {
    method: 'POST',
    body: filters,
    signal,
  })
}

export function fetchAuctionDetail(
  uuid: string,
  signal?: AbortSignal,
): Promise<AuctionDetail> {
  return apiRequest<AuctionDetail>(`/auctions/${uuid}`, { signal })
}
