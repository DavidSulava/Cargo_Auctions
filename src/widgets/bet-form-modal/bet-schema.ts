import { z } from 'zod'
import type { AuctionTrading } from '~/entities/auction/types'

export function createBetSchema(trading: AuctionTrading) {
  const schema: Record<string, z.ZodTypeAny> = {
    price: z
      .number({ required_error: 'Цена обязательна' })
      .positive('Цена должна быть больше 0'),
    has_nds: z.boolean().optional().default(true),
  }

  if (trading.min_price !== undefined) {
    schema.price = (schema.price as z.ZodNumber).min(
      trading.min_price,
      `Минимальная цена: ${trading.min_price.toLocaleString('ru-RU')} ₽`,
    )
  }
  if (trading.max_price !== undefined) {
    schema.price = (schema.price as z.ZodNumber).max(
      trading.max_price,
      `Максимальная цена: ${trading.max_price.toLocaleString('ru-RU')} ₽`,
    )
  }
  if (trading.step > 0 && trading.min_price !== undefined) {
    const min = trading.min_price
    const step = trading.step
    schema.price = (schema.price as z.ZodNumber).refine(
      (val) => (val - min) % step === 0,
      `Ставка должна быть кратна шагу (${step.toLocaleString('ru-RU')} ₽)`,
    )
  }

  return z.object(schema)
}

export type BetFormValues = z.infer<ReturnType<typeof createBetSchema>>
