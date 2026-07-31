import { describe, it, expect } from 'vitest'
import {
  canPlaceBet,
  deriveTradingStatus,
  finalizeBets,
  isPriceDirectionValid,
  isWinnerAllowed,
  type MyBetState,
} from '../status-rules'
import type { AuctionStatus, AuctionType } from '../types'
import type { Bet } from '~/entities/bet'

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: 'bet-1',
    auction_uuid: 'auction-0001',
    carrier_name: 'ООО "Логистика Про"',
    price: 10000,
    price_with_nds: 12000,
    price_without_nds: 10000,
    has_nds: true,
    is_winner: false,
    is_cancelled: false,
    rank: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('canPlaceBet', () => {
  it('allows betting only on Active non-FixPrice auctions', () => {
    expect(canPlaceBet('Active', 'Up')).toBe(true)
    expect(canPlaceBet('Active', 'Down')).toBe(true)
    expect(canPlaceBet('Active', 'Request')).toBe(true)
    expect(canPlaceBet('Active', 'FixPrice')).toBe(false)
    expect(canPlaceBet('Pending', 'Up')).toBe(false)
    expect(canPlaceBet('Closed', 'Up')).toBe(false)
    expect(canPlaceBet('Finished', 'Up')).toBe(false)
    expect(canPlaceBet('Cancelled', 'Up')).toBe(false)
  })
})

describe('isPriceDirectionValid', () => {
  it('Up requires a price above the current one', () => {
    expect(isPriceDirectionValid('Up', 11000, 10000)).toBe(true)
    expect(isPriceDirectionValid('Up', 10000, 10000)).toBe(false)
    expect(isPriceDirectionValid('Up', 9000, 10000)).toBe(false)
  })

  it('Down and Request require a price below the current one', () => {
    expect(isPriceDirectionValid('Down', 9000, 10000)).toBe(true)
    expect(isPriceDirectionValid('Down', 10000, 10000)).toBe(false)
    expect(isPriceDirectionValid('Request', 9000, 10000)).toBe(true)
    expect(isPriceDirectionValid('Request', 10000, 10000)).toBe(false)
  })

  it('FixPrice is never a valid direction', () => {
    expect(isPriceDirectionValid('FixPrice', 100, 10000)).toBe(false)
  })
})

describe('isWinnerAllowed', () => {
  it('allows a winner only on Finished auctions', () => {
    expect(isWinnerAllowed('Finished')).toBe(true)
    for (const status of ['Active', 'Closed', 'Cancelled', 'Pending'] as AuctionStatus[]) {
      expect(isWinnerAllowed(status)).toBe(false)
    }
  })
})

describe('deriveTradingStatus', () => {
  const none: MyBetState = { has_my_bet: false, rank: 0, is_winner: false }
  const leading: MyBetState = { has_my_bet: true, rank: 1, is_winner: false }
  const losing: MyBetState = { has_my_bet: true, rank: 2, is_winner: false }
  const winning: MyBetState = { has_my_bet: true, rank: 1, is_winner: true }

  it('maps the full status matrix', () => {
    expect(deriveTradingStatus('Pending', none)).toBe('None')
    expect(deriveTradingStatus('Pending', leading)).toBe('None')

    expect(deriveTradingStatus('Active', none)).toBe('None')
    expect(deriveTradingStatus('Active', leading)).toBe('Leading')
    expect(deriveTradingStatus('Active', losing)).toBe('Losing')
    expect(deriveTradingStatus('Active', winning)).toBe('Leading')

    expect(deriveTradingStatus('Closed', none)).toBe('None')
    expect(deriveTradingStatus('Closed', leading)).toBe('Participant')

    expect(deriveTradingStatus('Finished', none)).toBe('None')
    expect(deriveTradingStatus('Finished', leading)).toBe('Participant')
    expect(deriveTradingStatus('Finished', winning)).toBe('Winner')

    expect(deriveTradingStatus('Cancelled', none)).toBe('None')
    expect(deriveTradingStatus('Cancelled', leading)).toBe('Participant')
  })
})

describe('finalizeBets', () => {
  it('ranks Up auctions by descending price', () => {
    const bets = [
      makeBet({ id: 'a', price: 100 }),
      makeBet({ id: 'b', price: 200 }),
      makeBet({ id: 'c', price: 150 }),
    ]
    const result = finalizeBets(bets, 'Up', 'Active')
    expect(result.map((b) => [b.id, b.rank])).toEqual([
      ['b', 1],
      ['c', 2],
      ['a', 3],
    ])
    expect(result.every((b) => !b.is_winner)).toBe(true)
  })

  it('ranks Down and Request auctions by ascending price', () => {
    const bets = [
      makeBet({ id: 'a', price: 200 }),
      makeBet({ id: 'b', price: 100 }),
      makeBet({ id: 'c', price: 150 }),
    ]
    const down = finalizeBets(bets, 'Down', 'Active')
    const request = finalizeBets(bets, 'Request', 'Active')
    expect(down.map((b) => b.id)).toEqual(['b', 'c', 'a'])
    expect(request.map((b) => b.id)).toEqual(['b', 'c', 'a'])
  })

  it('marks exactly one winner on Finished — the top non-cancelled bet', () => {
    const bets = [
      makeBet({ id: 'a', price: 100 }),
      makeBet({ id: 'b', price: 200, is_cancelled: true }),
      makeBet({ id: 'c', price: 150 }),
    ]
    const result = finalizeBets(bets, 'Up', 'Finished')
    const winners = result.filter((b) => b.is_winner)
    expect(winners).toHaveLength(1)
    expect(winners[0].id).toBe('c')
  })

  it('never marks a winner outside Finished', () => {
    for (const status of ['Active', 'Closed', 'Cancelled', 'Pending'] as AuctionStatus[]) {
      const result = finalizeBets(
        [makeBet({ price: 100 }), makeBet({ price: 50 })],
        'Down',
        status,
      )
      expect(result.filter((b) => b.is_winner)).toHaveLength(0)
    }
  })

  it('a cancelled bet can never be a winner', () => {
    const result = finalizeBets(
      [makeBet({ id: 'a', price: 100, is_cancelled: true }), makeBet({ id: 'b', price: 200 })],
      'Up',
      'Finished',
    )
    expect(result.find((b) => b.is_winner)!.id).toBe('b')
  })

  it('cancelled bets are unranked and sink to the bottom', () => {
    const result = finalizeBets(
      [makeBet({ id: 'a', price: 100 }), makeBet({ id: 'b', price: 200, is_cancelled: true })],
      'Up',
      'Active',
    )
    expect(result.map((b) => b.id)).toEqual(['a', 'b'])
    expect(result[1].rank).toBe(0)
    expect(result[1].is_winner).toBe(false)
  })

  it('does not mutate the input bets', () => {
    const bets = [makeBet({ id: 'a', price: 100 })]
    finalizeBets(bets, 'Down', 'Finished')
    expect(bets[0].rank).toBe(0)
    expect(bets[0].is_winner).toBe(false)
  })

  it('produces at most one winner for any auction type', () => {
    for (const aucType of ['Up', 'Down', 'Request', 'FixPrice'] as AuctionType[]) {
      for (const status of ['Active', 'Closed', 'Cancelled', 'Pending', 'Finished'] as AuctionStatus[]) {
        const bets = [
          makeBet({ price: 100 }),
          makeBet({ price: 200, is_cancelled: Math.random() > 0.5 }),
          makeBet({ price: 150 }),
        ]
        const result = finalizeBets(bets, aucType, status)
        expect(result.filter((b) => b.is_winner).length).toBeLessThanOrEqual(1)
      }
    }
  })
})
