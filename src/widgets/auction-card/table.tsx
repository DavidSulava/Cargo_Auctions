import { useNavigate, Link } from '@tanstack/react-router'
import { Badge } from '@astryxdesign/core/Badge'
import { Table, proportional, pixel } from '@astryxdesign/core/Table'
import type { TablePlugin, BodyRowRenderProps, TableColumn } from '@astryxdesign/core/Table'
import type { AuctionListItem } from '~/entities/auction'
import type { FilterParams } from '~/shared/lib/filter-schema'

interface Props {
  items: AuctionListItem[]
  search: FilterParams
}

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
  Active: { variant: 'success', label: 'Активен' },
  Pending: { variant: 'warning', label: 'Ожидание' },
  Closed: { variant: 'neutral', label: 'Закрыт' },
  Cancelled: { variant: 'error', label: 'Отменён' },
  Finished: { variant: 'info', label: 'Завершён' },
}

const TRADING_STATUS: Record<string, { variant: 'blue' | 'green' | 'orange' | 'purple' | 'neutral'; label: string }> = {
  Leading: { variant: 'blue', label: 'Лидируете' },
  Losing: { variant: 'orange', label: 'Проигрываете' },
  Winner: { variant: 'green', label: 'Победитель' },
  Participant: { variant: 'purple', label: 'Участник' },
  None: { variant: 'neutral', label: 'Не участвуете' },
}

const AUCTION_TYPE_BADGE: Record<string, { variant: 'purple' | 'teal' | 'pink' | 'neutral'; label: string }> = {
  Request: { variant: 'purple', label: 'Заявка' },
  Up: { variant: 'teal', label: 'Повышение' },
  Down: { variant: 'pink', label: 'Понижение' },
  FixPrice: { variant: 'neutral', label: 'Фиксированная' },
}

export function AuctionListTable({ items, search }: Props) {
  const navigate = useNavigate()

  const clickableRowPlugin: TablePlugin<Record<string, unknown>> = {
    transformBodyRow: (props: BodyRowRenderProps, item: Record<string, unknown>) => ({
      ...props,
      htmlProps: {
        ...props.htmlProps,
        onClick: () => navigate({ to: `/auctions/${item.uuid as string}`, search }),
        className: 'auction-row',
        style: { ...props.htmlProps.style, cursor: 'pointer' },
      },
    }),
  }

  const columns: TableColumn<Record<string, unknown>>[] = [
    {
      key: 'cargo_num',
      header: '№',
      width: pixel(120),
      renderCell: (item: Record<string, unknown>) => <Link to="/auctions/$uuid" params={{ uuid: item.uuid as string }} search={search}>{(item).cargo_num as string}</Link>,
    },
    {
      key: 'auc_type',
      header: 'Тип',
      width: pixel(120),
      renderCell: (item: Record<string, unknown>) => {
        const badge = AUCTION_TYPE_BADGE[item.auc_type as string] ?? { variant: 'neutral' as const, label: item.auc_type as string }
        return <Badge variant={badge.variant} label={badge.label} />
      },
    },
    {
      key: 'status',
      header: 'Статус',
      width: pixel(100),
      renderCell: (item: Record<string, unknown>) => {
        const badge = STATUS_BADGE[item.status as string] ?? { variant: 'neutral' as const, label: item.status as string }
        return <Badge variant={badge.variant} label={badge.label} />
      },
    },
    {
      key: 'trading_status',
      header: 'Торговый статус',
      width: pixel(140),
      renderCell: (item: Record<string, unknown>) => {
        const badge = TRADING_STATUS[item.trading_status as string] ?? { variant: 'neutral' as const, label: item.trading_status as string }
        return <Badge variant={badge.variant} label={badge.label} />
      },
    },
    {
      key: 'route',
      header: 'Маршрут',
      width: proportional(1),
      renderCell: (item: Record<string, unknown>) => (
        <div>{(item).load_city as string} → {(item).unload_city as string}</div>
      ),
    },
    {
      key: 'cargo',
      header: 'Груз',
      width: proportional(1),
      renderCell: (item: Record<string, unknown>) => (
        <>
          <div>{(item).cargo_name as string}</div>
          <div className="text-secondary">{(item).cargo_weight_kg as number} кг / {(item).cargo_volume_m3 as number} м³</div>
        </>
      ),
    },
    {
      key: 'price',
      header: 'Цена',
      width: proportional(1),
      renderCell: (item: Record<string, unknown>) => (
        <>
          <div>{(item.current_price as number).toLocaleString('ru-RU')} ₽</div>
          <div className="text-secondary">{(item).price_per_km as number} ₽/км</div>
        </>
      ),
    },
  ]

  return (
    <Table
      data={items as unknown as Record<string, unknown>[]}
      columns={columns}
      idKey="uuid"
      density="balanced"
      dividers="rows"
      hasHover
      plugins={{ clickableRow: clickableRowPlugin }}
    />
  )
}
