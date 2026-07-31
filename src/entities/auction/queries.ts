import { useQuery } from '@tanstack/react-query'
import { fetchAuctions, fetchAuctionDetail } from './api'
import type { AuctionFilters } from './types'
import { auctionKeys } from '~/shared/lib/query-keys'

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
