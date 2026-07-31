import { Suspense, lazy } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { AppShell } from '@astryxdesign/core/AppShell'
import { TopNav } from '@astryxdesign/core/TopNav'
import { TopNavHeading } from '@astryxdesign/core/TopNav'
import { SideNav } from '@astryxdesign/core/SideNav'
import { SideNavSection } from '@astryxdesign/core/SideNav'
import { SideNavItem } from '@astryxdesign/core/SideNav'
import { Skeleton } from '@astryxdesign/core/Skeleton'

export const AuctionListPage = lazy(() => import('~/pages/auction-list'))
export const AuctionDetailPage = lazy(() => import('~/pages/auction-detail'))
export const AuctionBetsPage = lazy(() => import('~/pages/auction-bets'))
export const BetFormPage = lazy(() => import('~/pages/bet-form'))

function PageLoader() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton width="60%" height="32px" />
      <Skeleton width="100%" height="200px" />
      <Skeleton width="100%" height="200px" />
    </div>
  )
}

export function RootLayout() {
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
}

export function NotFound() {
  return (
    <div className="content-enter flex items-center justify-center h-[60vh] text-primary">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p>Страница не найдена</p>
      </div>
    </div>
  )
}
