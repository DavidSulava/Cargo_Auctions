import { useMutation, useQueryClient } from '@tanstack/react-query'
import { placeBet } from '~/entities/bet/api'
import type { PlaceBetRequest } from '~/entities/bet/types'
import { auctionKeys } from '~/entities/auction/queries'
import { betKeys } from '~/entities/bet/queries'

export function usePlaceBet(auctionUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlaceBetRequest) => placeBet(auctionUuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: betKeys.list(auctionUuid) })
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionUuid) })
      queryClient.invalidateQueries({ queryKey: auctionKeys.all() })
    },
  })
}
