import { describe, it, expect } from 'vitest'
import { filterSchema } from '../filter-schema'

describe('filterSchema', () => {
  it('parses empty search params with defaults', () => {
    const result = filterSchema.parse({})
    expect(result.cargo_num).toBe('')
    expect(result.page).toBe(1)
    expect(result.per_page).toBe(10)
    expect(result.statuses).toEqual([])
    expect(result.is_available).toBe(undefined)
  })

  it('parses valid filters', () => {
    const result = filterSchema.parse({
      cargo_num: 'CARGO-001',
      status: 'Active',
      auc_type: 'Up',
      is_available: 'true',
      page: '3',
      per_page: '20',
    })
    expect(result.cargo_num).toBe('CARGO-001')
    expect(result.status).toBe('Active')
    expect(result.auc_type).toBe('Up')
    expect(result.is_available).toBe(true)
    expect(result.page).toBe(3)
    expect(result.per_page).toBe(20)
  })

  it('handles statuses as comma-separated string', () => {
    const result = filterSchema.parse({ statuses: 'Active,Pending' })
    expect(result.statuses).toEqual(['Active', 'Pending'])
  })

  it('provides safe fallback for invalid page', () => {
    const result = filterSchema.parse({ page: '-1' })
    expect(result.page).toBe(1)
  })

  it('parses price ranges', () => {
    const result = filterSchema.parse({
      price_from: '10000',
      price_to: '50000',
    })
    expect(result.price_from).toBe(10000)
    expect(result.price_to).toBe(50000)
  })
})
