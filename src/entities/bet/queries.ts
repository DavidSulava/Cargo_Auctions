import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBets, placeBet } from './api'
import { auctionKeys } from '~/entities/auction/queries'
import type { PlaceBetRequest } from './types'

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

export function usePlaceBet(auctionUuid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlaceBetRequest) => placeBet(auctionUuid, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: betKeys.list(auctionUuid) })
      void queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionUuid) })
      void queryClient.invalidateQueries({ queryKey: auctionKeys.lists() })
    },
  })
}
