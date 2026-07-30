import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '~/app/providers'
import './app/styles/global.css'

async function start() {
  if (import.meta.env.DEV && !navigator.webdriver) {
    const { worker } = await import('~/shared/mocks/browser')
    await worker.start({
      serviceWorker: {
        url: import.meta.env.BASE_URL + 'mockServiceWorker.js',
      },
    })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers />
    </StrictMode>,
  )
}

start()
