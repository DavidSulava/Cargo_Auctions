import { setupWorker } from 'msw/browser'
import { auctionHandlers } from './handlers/auctions'
import { betHandlers } from './handlers/bets'
import { cityHandlers } from './handlers/cities'

export const worker = setupWorker(
  ...auctionHandlers,
  ...betHandlers,
  ...cityHandlers,
)
