import { http, HttpResponse } from 'msw'
import { db } from '../db'

export const betHandlers = [
  http.get('/api/auctions/:uuid/bets', ({ params }) => {
    const result = db.getBets(params.uuid as string)
    return HttpResponse.json(result)
  }),

  http.post('/api/auctions/:uuid/bets', async ({ params, request }) => {
    try {
      const body = await request.json() as { price: number; has_nds?: boolean }
      const result = db.placeBet(params.uuid as string, body)
      return HttpResponse.json(result, { status: 201 })
    } catch (err: any) {
      if (err.status === 422) {
        return HttpResponse.json(
          { message: err.message, details: err.details },
          { status: 422 },
        )
      }
      return HttpResponse.json(
        { message: err.message ?? 'Internal error' },
        { status: err.status ?? 500 },
      )
    }
  }),
]
