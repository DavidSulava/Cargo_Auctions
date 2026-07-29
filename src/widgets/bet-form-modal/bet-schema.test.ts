import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('Bet validation schema', () => {
  function createBetSchema(opts: { min?: number; max?: number; step?: number }) {
    let priceSchema = z.number({ required_error: 'Цена обязательна' })
      .positive('Цена должна быть больше 0')

    if (opts.min !== undefined) {
      priceSchema = priceSchema.min(opts.min)
    }
    if (opts.max !== undefined) {
      priceSchema = priceSchema.max(opts.max)
    }

    return z.object({
      price: priceSchema,
      has_nds: z.boolean().optional().default(true),
    })
  }

  it('validates positive price', () => {
    const schema = createBetSchema({})
    const result = schema.safeParse({ price: -100 })
    expect(result.success).toBe(false)
  })

  it('accepts valid price', () => {
    const schema = createBetSchema({})
    const result = schema.safeParse({ price: 15000 })
    expect(result.success).toBe(true)
  })

  it('enforces min price', () => {
    const schema = createBetSchema({ min: 10000 })
    const result = schema.safeParse({ price: 5000 })
    expect(result.success).toBe(false)
  })

  it('enforces max price', () => {
    const schema = createBetSchema({ max: 50000 })
    const result = schema.safeParse({ price: 75000 })
    expect(result.success).toBe(false)
  })

  it('defaults has_nds to true', () => {
    const schema = createBetSchema({})
    const result = schema.parse({ price: 15000 })
    expect(result.has_nds).toBe(true)
  })

  it('accepts price within range', () => {
    const schema = createBetSchema({ min: 5000, max: 50000 })
    const result = schema.safeParse({ price: 25000 })
    expect(result.success).toBe(true)
  })
})
