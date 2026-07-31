import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BetForm } from './index'
import { ApiError } from '~/shared/api/client'
import { placeBet } from '~/entities/bet/api'
import type { AuctionDetail } from '~/entities/auction/types'

vi.mock('~/entities/bet/api', () => ({
  fetchBets: vi.fn(),
  placeBet: vi.fn(),
}))

const placeBetMock = vi.mocked(placeBet)

const auction: AuctionDetail = {
  uuid: 'auc-1',
  cargo_num: 'C-100',
  auc_type: 'Up',
  status: 'Active',
  trading_status: 'None',
  organizer: { name: 'Перевозчик', rating: 5, deals_count: 10 },
  route: [],
  cargo_name: 'Груз',
  cargo_weight_kg: 1000,
  cargo_volume_m3: 10,
  cargo_body_type: 'Tent',
  load_date_from: '2026-08-01',
  load_date_to: '2026-08-02',
  trading: {
    can_set_bet: true,
    current_price: 100000,
    available_price: 120000,
    min_price: 100000,
    max_price: 120000,
    step: 5000,
  },
  hide_points_address_and_contacts: false,
  hide_bets_history: false,
  no_view_cargo_price: false,
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('BetForm', () => {
  beforeEach(() => {
    placeBetMock.mockReset()
    placeBetMock.mockResolvedValue({ id: 'b1', price: 100000, has_nds: true, is_winner: false })
  })

  it('shows a closed banner when the auction does not allow bets', () => {
    render(
      <BetForm
        auction={{ ...auction, trading: { ...auction.trading, can_set_bet: false } }}
        onComplete={vi.fn()}
        onBack={vi.fn()}
      />,
      { wrapper },
    )

    expect(screen.getByText('Ставки закрыты')).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('places the bet with the typed price and completes', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<BetForm auction={auction} onComplete={onComplete} onBack={vi.fn()} />, { wrapper })

    const priceInput = screen.getByRole('spinbutton')
    await user.clear(priceInput)
    await user.type(priceInput, '120000')
    await user.click(screen.getByRole('button', { name: 'Подтвердить' }))

    await waitFor(() => expect(onComplete).toHaveBeenCalled())
    expect(placeBetMock).toHaveBeenCalledWith('auc-1', { price: 120000, has_nds: true })
  })

  it('maps 422 details to field errors and shows the server message', async () => {
    placeBetMock.mockRejectedValue(
      new ApiError(422, 'Цена ниже минимальной', { price: 'Слишком низкая цена' }),
    )
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<BetForm auction={auction} onComplete={onComplete} onBack={vi.fn()} />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'Подтвердить' }))

    await waitFor(() => expect(screen.getByText('Слишком низкая цена')).toBeInTheDocument())
    expect(screen.getByText('Цена ниже минимальной')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('does not submit when the default price violates the schema', async () => {
    const user = userEvent.setup()
    render(
      <BetForm
        auction={{
          ...auction,
          trading: { ...auction.trading, current_price: 100001, min_price: 100000, step: 3000 },
        }}
        onComplete={vi.fn()}
        onBack={vi.fn()}
      />,
      { wrapper },
    )

    await user.click(screen.getByRole('button', { name: 'Подтвердить' }))

    await waitFor(() => expect(screen.getByText(/кратна шагу/)).toBeInTheDocument())
    expect(placeBetMock).not.toHaveBeenCalled()
  })
})
