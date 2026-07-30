import { http, HttpResponse } from 'msw'
import { db } from '../db'

export const auctionHandlers = [
  http.post('/api/auctions/list', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as any
    const result = db.listAuctions(body)
    return HttpResponse.json(result)
  }),

  http.get('/api/auctions/:uuid', ({ params }) => {
    const detail = db.getAuctionDetail(params.uuid as string)
    if (!detail) {
      return HttpResponse.json({ message: 'Аукцион не найден' }, { status: 404 })
    }
    return HttpResponse.json(detail)
  }),
]
