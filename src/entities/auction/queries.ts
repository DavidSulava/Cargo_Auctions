import { useQuery } from '@tanstack/react-query'
import { fetchAuctions, fetchAuctionDetail } from './api'
import type { AuctionFilters } from './types'

export const auctionKeys = {
  all: () => ['auctions'] as const,
  lists: () => [...auctionKeys.all(), 'list'] as const,
  list: (filters: AuctionFilters) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all(), 'detail'] as const,
  detail: (uuid: string) => [...auctionKeys.details(), uuid] as const,
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
