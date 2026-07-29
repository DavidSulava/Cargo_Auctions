import { z } from 'zod'

export const aucTypeEnum = z.enum(['Request', 'Up', 'Down', 'FixPrice'])
export const auctionStatusEnum = z.enum(['Active', 'Closed', 'Cancelled', 'Pending', 'Finished'])

const str = () => z.string().default('').catch('')
const boolFromStr = () => z.enum(['true', 'false']).transform((s) => s === 'true').catch(undefined)
const numFromStr = () => z.coerce.number().catch(undefined)

export const filterSchema = z.object({
  cargo_num: str(),
  status: auctionStatusEnum.catch(undefined),
  statuses: str().transform((s) => s ? s.split(',') : []),
  auc_type: aucTypeEnum.catch(undefined),
  load_city: str(),
  unload_city: str(),
  load_date_from: str(),
  load_date_to: str(),
  is_available: boolFromStr(),
  is_bidder: boolFromStr(),
  price_from: numFromStr(),
  price_to: numFromStr(),
  page: z.coerce.number().min(1).catch(1).default(1),
  per_page: z.coerce.number().min(1).max(100).catch(10).default(10),
})

export type FilterValues = z.input<typeof filterSchema>
export type FilterParams = z.output<typeof filterSchema>
