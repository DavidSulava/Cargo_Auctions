import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Button } from '@astryxdesign/core/Button'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Banner } from '@astryxdesign/core/Banner'
import { Section } from '@astryxdesign/core/Section'
import { useState } from 'react'
import type { AuctionDetail } from '~/entities/auction/types'
import type { PlaceBetRequest } from '~/entities/bet/types'
import { ApiError } from '~/shared/api/client'
import { priceWithVat } from '~/shared/lib/vat'
import { createBetSchema, type BetFormValues } from './bet-schema'

interface Props {
  auction: AuctionDetail
  isPending: boolean
  onSubmit: (data: PlaceBetRequest) => Promise<void>
  onBack: () => void
}

export function BetForm({ auction, isPending, onSubmit, onBack }: Props) {
  const betSchema = createBetSchema(auction.trading)
  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<BetFormValues>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      price: auction.trading.my_bet?.value ?? auction.trading.current_price,
      has_nds: auction.trading.my_bet?.has_nds ?? true,
    },
  })

  const price = watch('price')
  const hasNds = watch('has_nds') ?? true
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleFormSubmit = async (formData: BetFormValues) => {
    setSubmitError(null)
    try {
      await onSubmit({ price: formData.price, has_nds: formData.has_nds } as PlaceBetRequest)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.details) {
        const details = err.details as Record<string, unknown>
        for (const [field, msg] of Object.entries(details)) {
          if (field in formData) {
            setError(field as keyof BetFormValues, { message: String(msg) })
          }
        }
      }
      setSubmitError((err as Error)?.message ?? 'Не удалось разместить ставку')
    }
  }

  return (
    <Section>
      <form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="space-y-4 p-4">
          <div className="text-sm text-secondary space-y-1">
            <p>Текущая цена (без НДС): <strong>{auction.trading.current_price.toLocaleString('ru-RU')} ₽</strong>{hasNds && ` · с НДС: ${priceWithVat(auction.trading.current_price).toLocaleString('ru-RU')} ₽`}</p>
            <p>Доступная цена (без НДС): <strong>{auction.trading.available_price.toLocaleString('ru-RU')} ₽</strong></p>
            <p>Шаг ставки: <strong>{auction.trading.step.toLocaleString('ru-RU')} ₽</strong></p>
            {auction.trading.min_price !== undefined && (
              <p>Мин. цена (без НДС): <strong>{auction.trading.min_price.toLocaleString('ru-RU')} ₽</strong></p>
            )}
            {auction.trading.max_price !== undefined && (
              <p>Макс. цена (без НДС): <strong>{auction.trading.max_price.toLocaleString('ru-RU')} ₽</strong></p>
            )}
          </div>

          <FormLayout>
            <NumberInput
              label="Ваша ставка (₽, без НДС)"
              value={price ?? ''}
              min={auction.trading.min_price ?? 0}
              max={auction.trading.max_price}
              step={auction.trading.step}
              onChange={(val) => setValue('price', Number(val))}
              status={errors.price ? { type: 'error' as const, message: String(errors.price.message ?? '') } : undefined}
              isDisabled={isPending}
            />

            <CheckboxInput
              label="С НДС"
              value={hasNds ?? true}
              onChange={(checked) => setValue('has_nds', checked)}
              isDisabled={isPending}
            />

            <p className="text-sm text-secondary">
              {hasNds
                ? <>К оплате с НДС: <strong>{price > 0 ? priceWithVat(price).toLocaleString('ru-RU') : '—'} ₽</strong></>
                : 'НДС не выделяется — к оплате указанная сумма.'}
            </p>

            {submitError && (
              <Banner status="error" title={submitError} />
            )}
          </FormLayout>

          <div className="flex justify-end gap-2">
            <Button label="Назад" variant="secondary" onClick={onBack} isDisabled={isPending} />
            <Button label={isPending ? 'Отправка...' : 'Подтвердить'} variant="primary" type="submit" isLoading={isPending} />
          </div>
        </div>
      </form>
    </Section>
  )
}
