import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePlaceBet } from './queries'
import { placeBet } from './api'

vi.mock('./api', () => ({
  fetchBets: vi.fn(),
  placeBet: vi.fn(),
}))

const placeBetMock = vi.mocked(placeBet)

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('usePlaceBet', () => {
  beforeEach(() => {
    placeBetMock.mockReset()
    placeBetMock.mockResolvedValue({ id: 'b1', price: 100, has_nds: true, is_winner: false })
  })

  it('places the bet through the entity transport', async () => {
    const queryClient = new QueryClient()
    const { result } = renderHook(() => usePlaceBet('auc-1'), { wrapper: wrapper(queryClient) })

    await act(async () => {
      await result.current.mutateAsync({ price: 100, has_nds: false })
    })

    expect(placeBetMock).toHaveBeenCalledWith('auc-1', { price: 100, has_nds: false })
  })

  it('invalidates the bet list, the auction detail and auction lists on success', async () => {
    const queryClient = new QueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => usePlaceBet('auc-1'), { wrapper: wrapper(queryClient) })

    await act(async () => {
      await result.current.mutateAsync({ price: 100, has_nds: true })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['bets', 'auc-1'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['auctions', 'detail', 'auc-1'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['auctions', 'list'] })
  })

  it('does not invalidate anything on failure', async () => {
    placeBetMock.mockRejectedValue(new Error('boom'))
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => usePlaceBet('auc-1'), { wrapper: wrapper(queryClient) })

    await act(async () => {
      await expect(result.current.mutateAsync({ price: 100, has_nds: true })).rejects.toThrow(
        'boom',
      )
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})
