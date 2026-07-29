import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ToastViewport } from '@astryxdesign/core/Toast'
import { router } from './router'
import { GlobalErrorToast } from './global-error-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <GlobalErrorToast />
      <ToastViewport />
    </QueryClientProvider>
  )
}
