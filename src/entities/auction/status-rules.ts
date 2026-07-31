import type { AuctionStatus, AuctionType, TradingStatus } from './types'
import type { Bet } from '~/entities/bet/types'

export function canPlaceBet(status: AuctionStatus, aucType: AuctionType): boolean {
  return status === 'Active' && aucType !== 'FixPrice'
}

export function isPriceDirectionValid(
  aucType: AuctionType,
  price: number,
  currentPrice: number,
): boolean {
  switch (aucType) {
    case 'Up':
      return price > currentPrice
    case 'Down':
    case 'Request':
      return price < currentPrice
    case 'FixPrice':
      return false
  }
}

export function isWinnerAllowed(status: AuctionStatus): boolean {
  return status === 'Finished'
}

export interface MyBetState {
  has_my_bet: boolean
  rank: number
  is_winner: boolean
}

export function deriveTradingStatus(status: AuctionStatus, mine: MyBetState): TradingStatus {
  switch (status) {
    case 'Pending':
      return 'None'
    case 'Active':
      if (!mine.has_my_bet) return 'None'
      return mine.rank === 1 ? 'Leading' : 'Losing'
    case 'Closed':
    case 'Cancelled':
      return mine.has_my_bet ? 'Participant' : 'None'
    case 'Finished':
      if (mine.is_winner) return 'Winner'
      return mine.has_my_bet ? 'Participant' : 'None'
  }
}

export function finalizeBets(bets: Bet[], aucType: AuctionType, status: AuctionStatus): Bet[] {
  const compare = aucType === 'Up'
    ? (a: Bet, b: Bet) => b.price - a.price
    : (a: Bet, b: Bet) => a.price - b.price

  const sorted = bets.toSorted((a, b) => {
    if (a.is_cancelled !== b.is_cancelled) return a.is_cancelled ? 1 : -1
    return compare(a, b)
  })

  let rank = 0
  return sorted.map((bet) => {
    if (bet.is_cancelled) {
      return { ...bet, rank: 0, is_winner: false }
    }
    rank += 1
    return { ...bet, rank, is_winner: rank === 1 && isWinnerAllowed(status) }
  })
}
