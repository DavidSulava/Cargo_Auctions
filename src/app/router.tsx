import { createRootRouteWithContext, createRoute, createRouter, Outlet, Link } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient } from './query-client'
import { Suspense, lazy } from 'react'
import { AppShell } from '@astryxdesign/core/AppShell'
import { TopNav } from '@astryxdesign/core/TopNav'
import { TopNavHeading } from '@astryxdesign/core/TopNav'
import { SideNav } from '@astryxdesign/core/SideNav'
import { SideNavSection } from '@astryxdesign/core/SideNav'
import { SideNavItem } from '@astryxdesign/core/SideNav'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { filterSchema } from '~/shared/lib/filter-schema'

const AuctionListPage = lazy(() => import('~/pages/auction-list'))
const AuctionDetailPage = lazy(() => import('~/pages/auction-detail'))
const AuctionBetsPage = lazy(() => import('~/pages/auction-bets'))
const BetFormPage = lazy(() => import('~/pages/bet-form'))

function PageLoader() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton width="60%" height="32px" />
      <Skeleton width="100%" height="200px" />
      <Skeleton width="100%" height="200px" />
    </div>
  )
}

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => {
    return (
      <AppShell
        topNav={
          <TopNav
            heading={<TopNavHeading heading="Грузовые аукционы" />}
          />
        }
        sideNav={
          <SideNav>
            <SideNavSection title="Меню">
              <SideNavItem as={Link} label="Аукционы" href="/" />
            </SideNavSection>
          </SideNav>
        }
      >
        <Suspense fallback={<PageLoader />}>
          <div className="page-enter">
            <Outlet />
          </div>
        </Suspense>
      </AppShell>
    )
  },
  notFoundComponent: () => (
    <div className="content-enter flex items-center justify-center h-[60vh] text-primary">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p>Страница не найдена</p>
      </div>
    </div>
  ),
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
