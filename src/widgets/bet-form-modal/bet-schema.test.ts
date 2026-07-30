import { describe, it, expect } from 'vitest'
import type { AuctionTrading } from '~/entities/auction/types'
import { createBetSchema } from './bet-schema'

function makeTrading(overrides: Partial<AuctionTrading> = {}): AuctionTrading {
  return {
    can_set_bet: true,
    current_price: 50000,
    available_price: 70000,
    step: 1000,
    ...overrides,
  }
}

describe('createBetSchema', () => {
  it('rejects negative price', () => {
    const schema = createBetSchema(makeTrading())
    const result = schema.safeParse({ price: -100 })
    expect(result.success).toBe(false)
  })

  it('accepts valid price', () => {
    const schema = createBetSchema(makeTrading())
    const result = schema.safeParse({ price: 15000 })
    expect(result.success).toBe(true)
  })

  it('enforces min_price', () => {
    const schema = createBetSchema(makeTrading({ min_price: 10000 }))
    const result = schema.safeParse({ price: 5000 })
    expect(result.success).toBe(false)
  })

  it('enforces max_price', () => {
    const schema = createBetSchema(makeTrading({ max_price: 50000 }))
    const result = schema.safeParse({ price: 75000 })
    expect(result.success).toBe(false)
  })

  it('defaults has_nds to true', () => {
    const schema = createBetSchema(makeTrading())
    const result = schema.parse({ price: 15000 })
    expect(result.has_nds).toBe(true)
  })

  it('accepts price within range', () => {
    const schema = createBetSchema(makeTrading({ min_price: 5000, max_price: 50000 }))
    const result = schema.safeParse({ price: 25000 })
    expect(result.success).toBe(true)
  })

  it('enforces step multiple when step > 0 and min_price is set', () => {
    const schema = createBetSchema(makeTrading({ min_price: 10000, step: 1000 }))
    const valid = schema.safeParse({ price: 15000 })
    const invalid = schema.safeParse({ price: 15100 })
    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it('skips step validation when min_price is not set', () => {
    const schema = createBetSchema(makeTrading({ min_price: undefined, step: 1000 }))
    const result = schema.safeParse({ price: 15100 })
    expect(result.success).toBe(true)
  })
})
