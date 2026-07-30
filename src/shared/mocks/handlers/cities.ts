import { http, HttpResponse } from 'msw'
import { CITIES } from '~/shared/lib/cities'

export const cityHandlers = [
  http.get('/api/cities', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.toLowerCase() ?? ''

    const filtered = query
      ? CITIES.filter((c: string) => c.toLowerCase().includes(query))
      : CITIES

    return HttpResponse.json(filtered.slice(0, 10))
  }),
]
