import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@astryxdesign/core/Toast'
import { useEffect, useRef } from 'react'
import { ApiError } from '~/shared/api/client'

export function GlobalErrorToast() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const shownRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') return
      const query = event.query
      const state = query.state
      if (state.status !== 'error' || !state.error) return

      const err = state.error
      const queryKey = JSON.stringify(query.queryKey)
      if (shownRef.current.has(queryKey)) return
      shownRef.current.add(queryKey)

      if (err instanceof ApiError && err.status < 500) return

      const message = err instanceof ApiError
        ? err.message
        : err instanceof TypeError
          ? 'Сервер недоступен. Проверьте подключение.'
          : 'Произошла неизвестная ошибка'

      toast({ body: message, type: 'error' })
    })

    return () => unsubscribe()
  }, [queryClient, toast])

  return null
}
