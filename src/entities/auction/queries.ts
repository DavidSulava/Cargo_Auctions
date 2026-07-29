import { useQuery } from '@tanstack/react-query'
import { fetchAuctions, fetchAuctionDetail } from './api'
import type { AuctionFilters } from './types'

export const auctionKeys = {
  all: ['auctions'] as const,
  list: (filters: AuctionFilters) => ['auctions', 'list', filters] as const,
  detail: (uuid: string) => ['auctions', 'detail', uuid] as const,
}

export function useAuctionList(filters: AuctionFilters) {
  return useQuery({
    queryKey: auctionKeys.list(filters),
    queryFn: ({ signal }) => fetchAuctions(filters, signal),
  })
}

export function useAuctionDetail(uuid: string) {
  return useQuery({
    queryKey: auctionKeys.detail(uuid),
    queryFn: ({ signal }) => fetchAuctionDetail(uuid, signal),
    enabled: !!uuid,
  })
}
