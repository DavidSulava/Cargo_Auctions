import { lazy } from 'react'

export const AuctionListPage = lazy(() => import('~/pages/auction-list'))
export const AuctionDetailPage = lazy(() => import('~/pages/auction-detail'))
export const AuctionBetsPage = lazy(() => import('~/pages/auction-bets'))
export const BetFormPage = lazy(() => import('~/pages/bet-form'))
