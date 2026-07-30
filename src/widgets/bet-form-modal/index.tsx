import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '@astryxdesign/core/Dialog'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Button } from '@astryxdesign/core/Button'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Banner } from '@astryxdesign/core/Banner'
import { useEffect, useState } from 'react'
import type { AuctionDetail } from '~/entities/auction/types'
import type { PlaceBetRequest } from '~/entities/bet/types'
import { ApiError } from '~/shared/api/client'

function createBetSchema(auction: AuctionDetail) {
  const schema: Record<string, z.ZodTypeAny> = {
    price: z.number({ required_error: 'Цена обязательна' })
      .positive('Цена должна быть больше 0'),
    has_nds: z.boolean().optional().default(true),
  }

  if (auction.trading.min_price !== undefined) {
    schema.price = (schema.price as z.ZodNumber).min(auction.trading.min_price, `Минимальная цена: ${auction.trading.min_price.toLocaleString('ru-RU')} ₽`)
  }
  if (auction.trading.max_price !== undefined) {
    schema.price = (schema.price as z.ZodNumber).max(auction.trading.max_price, `Максимальная цена: ${auction.trading.max_price.toLocaleString('ru-RU')} ₽`)
  }
  if (auction.trading.step > 0 && auction.trading.min_price !== undefined) {
    const min = auction.trading.min_price
    const step = auction.trading.step
    schema.price = (schema.price as z.ZodNumber).refine(
      (val) => (val - min) % step === 0,
      `Ставка должна быть кратна шагу (${step.toLocaleString('ru-RU')} ₽)`,
    )
  }

  return z.object(schema)
}

type BetFormValues = z.infer<ReturnType<typeof createBetSchema>>

interface Props {
  auction: AuctionDetail
  isPending: boolean
  isOpen?: boolean
  onSubmit: (data: PlaceBetRequest) => Promise<void>
  onClose: () => void
}

export function BetFormModal({ auction, isOpen, isPending, onSubmit, onClose }: Props) {
  const betSchema = createBetSchema(auction)
  const {
    register,
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
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleFormSubmit = async (data: BetFormValues) => {
    setSubmitError(null)
    try {
      await onSubmit(data)
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422 && err.details) {
        const details = err.details as Record<string, unknown>
        for (const [field, msg] of Object.entries(details)) {
          if (field in data) {
            setError(field as keyof BetFormValues, { message: String(msg) })
          }
        }
      }
      setSubmitError(err?.message ?? 'Не удалось разместить ставку')
    }
  }

  return (
    <Dialog isOpen={isOpen ?? true} onOpenChange={(open) => { if (!open) onClose() }} purpose="form" title={auction.trading.my_bet ? 'Изменить ставку' : 'Сделать ставку'}>
      <form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="space-y-4 p-4">
          <div className="text-sm text-secondary space-y-1">
            <p>Текущая цена: <strong>{auction.trading.current_price.toLocaleString('ru-RU')} ₽</strong></p>
            <p>Доступная цена: <strong>{auction.trading.available_price.toLocaleString('ru-RU')} ₽</strong></p>
            <p>Шаг ставки: <strong>{auction.trading.step.toLocaleString('ru-RU')} ₽</strong></p>
            {auction.trading.min_price !== undefined && (
              <p>Мин. цена: <strong>{auction.trading.min_price.toLocaleString('ru-RU')} ₽</strong></p>
            )}
            {auction.trading.max_price !== undefined && (
              <p>Макс. цена: <strong>{auction.trading.max_price.toLocaleString('ru-RU')} ₽</strong></p>
            )}
          </div>

          <FormLayout>
            <NumberInput
              label="Ваша ставка (₽)"
              value={price ?? ''}
              min={auction.trading.min_price ?? 0}
              max={auction.trading.max_price}
              step={auction.trading.step}
              onChange={(val) => setValue('price', Number(val))}
              status={errors.price ? { type: 'error', message: errors.price.message } : undefined}
              disabled={isPending}
            />

            <CheckboxInput
              label="С НДС"
              value={watch('has_nds') ?? true}
              onChange={(checked) => setValue('has_nds', checked)}
              isDisabled={isPending}
            />

            {submitError && (
              <Banner status="error" title={submitError} />
            )}
          </FormLayout>

          <div className="flex justify-end gap-2">
            <Button label="Отмена" variant="secondary" onClick={onClose} disabled={isPending} />
            <Button label={isPending ? 'Отправка...' : 'Подтвердить'} variant="primary" type="submit" isLoading={isPending} />
          </div>
        </div>
      </form>
    </Dialog>
  )
}
