import { describe, expect, it } from 'vitest'
import { priceWithVat, priceWithoutVat, VAT_RATE } from './vat'

describe('vat helpers', () => {
  it('exposes the VAT rate', () => {
    expect(VAT_RATE).toBe(0.2)
  })

  it('adds VAT to a base price without VAT', () => {
    expect(priceWithVat(100000)).toBe(120000)
    expect(priceWithVat(85000)).toBe(102000)
  })

  it('extracts the base price from a gross amount', () => {
    expect(priceWithoutVat(120000)).toBe(100000)
    expect(priceWithoutVat(102000)).toBe(85000)
  })

  it('round-trips within one rouble', () => {
    for (const base of [1000, 5000, 12345, 99999, 200000]) {
      expect(Math.abs(priceWithoutVat(priceWithVat(base)) - base)).toBeLessThanOrEqual(1)
    }
  })

  it('rounds half-up on fractional VAT amounts', () => {
    expect(priceWithVat(123)).toBe(148)
  })
})
