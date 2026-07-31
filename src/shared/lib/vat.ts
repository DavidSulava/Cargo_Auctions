export const VAT_RATE = 0.2

export function priceWithVat(base: number) {
  return Math.round(base * (1 + VAT_RATE))
}

export function priceWithoutVat(gross: number) {
  return Math.round(gross / (1 + VAT_RATE))
}
