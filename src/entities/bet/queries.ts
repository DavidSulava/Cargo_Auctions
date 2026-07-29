import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBets, placeBet } from './api'
import type { PlaceBetRequest } from './types'
import { auctionKeys } from '~/entities/auction/queries'

export const betKeys = {
  list: (auctionUuid: string) => ['bets', auctionUuid] as const,
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
      queryClient.invalidateQueries({ queryKey: betKeys.list(auctionUuid) })
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionUuid) })
      queryClient.invalidateQueries({ queryKey: auctionKeys.all })
    },
  })
}
