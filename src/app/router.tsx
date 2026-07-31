import { createRootRouteWithContext, createRoute, createRouter } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient } from './query-client'
import {
  AuctionListPage,
  AuctionDetailPage,
  AuctionBetsPage,
  BetFormPage,
  RootLayout,
  NotFound,
} from './router-components'
import { filterSchema } from '~/shared/lib/filter-schema'

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

export const auctionListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: filterSchema,
  component: AuctionListPage,
})

const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$uuid',
  component: AuctionDetailPage,
})

const auctionBetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$uuid/bets',
  component: AuctionBetsPage,
})

const betFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$uuid/bid',
  component: BetFormPage,
})

const routeTree = rootRoute.addChildren([
  auctionListRoute,
  auctionDetailRoute,
  auctionBetsRoute,
  betFormRoute,
])

const basepath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/+$/, '')

export const router = createRouter({
  routeTree,
  basepath,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadDelay: 50,
})
