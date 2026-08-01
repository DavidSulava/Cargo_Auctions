import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ToastViewport } from '@astryxdesign/core/Toast'
import { Theme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import { router } from '../router'
import { GlobalErrorToast } from './global-error-toast'
import { queryClient } from './query-client'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function Providers() {
  return (
    <Theme theme={neutralTheme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <GlobalErrorToast />
        <ToastViewport />
      </QueryClientProvider>
    </Theme>
  )
}
