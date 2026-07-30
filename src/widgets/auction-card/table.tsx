import { useNavigate, Link } from '@tanstack/react-router'
import { Badge } from '@astryxdesign/core/Badge'
import { Table, proportional, pixel } from '@astryxdesign/core/Table'
import type { TablePlugin, BodyRowRenderProps, TableColumn } from '@astryxdesign/core/Table'
import type { AuctionListItem } from '~/entities/auction/types'

interface Props {
  items: AuctionListItem[]
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

const AUCTION_TYPE_COLORS: Record<string, 'purple' | 'teal' | 'pink' | 'neutral'> = {
  Request: 'purple',
  Up: 'teal',
  Down: 'pink',
  FixPrice: 'neutral',
}

export function AuctionListTable({ items }: Props) {
  const navigate = useNavigate()

  const clickableRowPlugin: TablePlugin<AuctionListItem> = {
    transformBodyRow: (props: BodyRowRenderProps, item: AuctionListItem) => ({
      ...props,
      htmlProps: {
        ...props.htmlProps,
        onClick: () => navigate({ to: `/auctions/${item.uuid}` }),
        className: 'auction-row',
        style: { ...props.htmlProps.style, cursor: 'pointer' },
      },
    }),
  }

  const columns: TableColumn<AuctionListItem>[] = [
    {
      key: 'cargo_num',
      header: '№',
      width: pixel(120),
      renderCell: (item) => <Link to={`/auctions/${item.uuid}`}>{item.cargo_num}</Link>,
    },
    {
      key: 'auc_type',
      header: 'Тип',
      width: pixel(80),
      renderCell: (item) => (
        <Badge variant={AUCTION_TYPE_COLORS[item.auc_type] ?? 'neutral'}>
          {item.auc_type}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      width: pixel(80),
      renderCell: (item) => {
        const badge = STATUS_BADGE[item.status] ?? { variant: 'neutral' as const, label: item.status }
        return <Badge variant={badge.variant}>{badge.label}</Badge>
      },
    },
    {
      key: 'trading_status',
      header: 'Торговый статус',
      width: pixel(140),
      renderCell: (item) => {
        const badge = TRADING_STATUS[item.trading_status] ?? { variant: 'neutral' as const, label: item.trading_status }
        return <Badge variant={badge.variant}>{badge.label}</Badge>
      },
    },
    {
      key: 'route',
      header: 'Маршрут',
      width: proportional(1),
      renderCell: (item) => (
        <div>{item.load_city} → {item.unload_city}</div>
      ),
    },
    {
      key: 'cargo',
      header: 'Груз',
      width: proportional(1),
      renderCell: (item) => (
        <>
          <div>{item.cargo_name}</div>
          <div className="text-secondary">{item.cargo_weight_kg} кг / {item.cargo_volume_m3} м³</div>
        </>
      ),
    },
    {
      key: 'price',
      header: 'Цена',
      width: proportional(1),
      renderCell: (item) => (
        <>
          <div>{item.current_price.toLocaleString('ru-RU')} ₽</div>
          <div className="text-secondary">{item.price_per_km} ₽/км</div>
        </>
      ),
    },
  ]

  return (
    <Table
      data={items}
      columns={columns}
      idKey="uuid"
      density="balanced"
      dividers="rows"
      hasHover
      plugins={[clickableRowPlugin]}
    />
  )
}
