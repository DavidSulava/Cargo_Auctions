import { useState, useEffect } from 'react'
import { TextInput } from '@astryxdesign/core/TextInput'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Selector } from '@astryxdesign/core/Selector'
import { DateInput } from '@astryxdesign/core/DateInput'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Button } from '@astryxdesign/core/Button'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Section } from '@astryxdesign/core/Section'
import { CITIES } from '~/shared/mocks/db'
import type { FilterParams } from '~/shared/lib/filter-schema'

interface Props {
  filters: FilterParams
  onFilterChange: (key: string, value: unknown) => void
  onClear: () => void
  resetKey: number
}

const STATUS_OPTIONS = [
  { label: 'Все статусы', value: '' },
  { label: 'Активные', value: 'Active' },
  { label: 'Завершённые', value: 'Closed' },
  { label: 'Отменённые', value: 'Cancelled' },
  { label: 'Ожидание', value: 'Pending' },
  { label: 'Закончены', value: 'Finished' },
]

const AUCTION_TYPE_OPTIONS = [
  { label: 'Все типы', value: '' },
  { label: 'Request', value: 'Request' },
  { label: 'Up', value: 'Up' },
  { label: 'Down', value: 'Down' },
  { label: 'FixPrice', value: 'FixPrice' },
]

const CITY_OPTIONS = [
  { label: 'Любой город', value: '' },
  ...CITIES.map((c) => ({ label: c, value: c })),
]

function boundValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return String(value)
}

export function AuctionFiltersPanel({ filters, onFilterChange, onClear, resetKey }: Props) {
  const [localAvailable, setLocalAvailable] = useState<boolean | undefined>(undefined)
  const [localBidder, setLocalBidder] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    setLocalAvailable(undefined)
    setLocalBidder(undefined)
  }, [resetKey])

  const isAvailable = localAvailable ?? (filters.is_available === true)
  const isBidder = localBidder ?? (filters.is_bidder === true)

  return (
    <Section>
      <FormLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
          <TextInput
            label="Номер заявки"
            placeholder="CARGO-00123"
            value={boundValue(filters.cargo_num)}
            onChange={(val) => onFilterChange('cargo_num', val)}
            hasClear
          />

          <Selector
            label="Статус"
            options={STATUS_OPTIONS}
            value={filters.status ?? ''}
            onChange={(val) => onFilterChange('status', val || undefined)}
          />

          <Selector
            label="Тип аукциона"
            options={AUCTION_TYPE_OPTIONS}
            value={filters.auc_type ?? ''}
            onChange={(val) => onFilterChange('auc_type', val || undefined)}
          />

          <Selector
            label="Город погрузки"
            options={CITY_OPTIONS}
            value={filters.load_city ?? ''}
            onChange={(val) => onFilterChange('load_city', val || undefined)}
          />

          <Selector
            label="Город выгрузки"
            options={CITY_OPTIONS}
            value={filters.unload_city ?? ''}
            onChange={(val) => onFilterChange('unload_city', val || undefined)}
          />

          <DateInput
            label="Дата погрузки от"
            value={filters.load_date_from ?? ''}
            onChange={(val) => onFilterChange('load_date_from', val)}
            hasClear
          />

          <DateInput
            label="Дата погрузки до"
            value={filters.load_date_to ?? ''}
            onChange={(val) => onFilterChange('load_date_to', val)}
            hasClear
          />

          <NumberInput
            label="Цена от"
            value={filters.price_from ?? ''}
            min={0}
            onChange={(val) => onFilterChange('price_from', val || undefined)}
            hasClear
          />

          <NumberInput
            label="Цена до"
            value={filters.price_to ?? ''}
            min={0}
            onChange={(val) => onFilterChange('price_to', val || undefined)}
            hasClear
          />

          <div className="flex items-end gap-4">
            <CheckboxInput
              label="Доступен"
              value={isAvailable}
              onChange={(checked) => {
                setLocalAvailable(checked)
                onFilterChange('is_available', checked ? 'true' : undefined)
              }}
            />
            <CheckboxInput
              label="Я участник"
              value={isBidder}
              onChange={(checked) => {
                setLocalBidder(checked)
                onFilterChange('is_bidder', checked ? 'true' : undefined)
              }}
            />
          </div>

          <div className="flex items-end">
            <Button label="Сбросить" variant="ghost" onClick={onClear} />
          </div>
        </div>
      </FormLayout>
    </Section>
  )
}
