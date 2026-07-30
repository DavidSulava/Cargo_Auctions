import { useQuery } from '@tanstack/react-query'
import { fetchBets } from './api'

export const betKeys = {
  all: () => ['bets'] as const,
  list: (auctionUuid: string) => [...betKeys.all(), auctionUuid] as const,
}

export function useBetList(auctionUuid: string) {
  return useQuery({
    queryKey: betKeys.list(auctionUuid),
    queryFn: ({ signal }) => fetchBets(auctionUuid, signal),
    enabled: !!auctionUuid,
  })
}
