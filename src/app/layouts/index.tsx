import { Suspense } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { AppShell } from '@astryxdesign/core/AppShell'
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav'
import { SideNav, SideNavSection, SideNavItem } from '@astryxdesign/core/SideNav'
import { Skeleton } from '@astryxdesign/core/Skeleton'

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
