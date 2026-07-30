import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest, ApiError } from './client'

describe('apiRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends GET request with correct headers', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    })

    await apiRequest('/test')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('sends POST with body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    const body = { price: 10000 }
    await apiRequest('/test', { method: 'POST', body })

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      }),
    )
  })

  it('throws ApiError on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Validation Error',
      json: () => Promise.resolve({ message: 'Price must be positive' }),
    })

    await expect(apiRequest('/test')).rejects.toThrow(ApiError)
    await expect(apiRequest('/test')).rejects.toThrow('Price must be positive')
  })

  it('passes params as URL search params', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await apiRequest('/test', { params: { page: '1', status: 'Active' } })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=1'),
      expect.any(Object),
    )
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('status=Active'),
      expect.any(Object),
    )
  })
})
