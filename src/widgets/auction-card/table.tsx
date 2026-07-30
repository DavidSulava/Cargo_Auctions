import { useNavigate, Link } from '@tanstack/react-router'
import { Badge } from '@astryxdesign/core/Badge'
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="p-3 text-left text-sm font-medium text-secondary">№</th>
            <th className="p-3 text-left text-sm font-medium text-secondary">Тип</th>
            <th className="p-3 text-left text-sm font-medium text-secondary">Статус</th>
            <th className="p-3 text-left text-sm font-medium text-secondary">Торговый статус</th>
            <th className="p-3 text-left text-sm font-medium text-secondary">Маршрут</th>
            <th className="p-3 text-left text-sm font-medium text-secondary">Груз</th>
            <th className="p-3 text-left text-sm font-medium text-secondary">Цена</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const statusBadge = STATUS_BADGE[item.status] ?? { variant: 'neutral' as const, label: item.status }
            const tradingBadge = TRADING_STATUS[item.trading_status] ?? { variant: 'neutral' as const, label: item.trading_status }

            return (
              <tr
                key={item.uuid}
                className="border-b border-border hover:bg-surface transition-colors cursor-pointer"
                onClick={() => navigate({ to: `/auctions/${item.uuid}` })}
              >
                <td className="p-3">
                  <Link to={`/auctions/${item.uuid}`}>{item.cargo_num}</Link>
                </td>
                <td className="p-3">
                  <Badge variant={AUCTION_TYPE_COLORS[item.auc_type] ?? 'neutral'}>
                    {item.auc_type}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </td>
                <td className="p-3">
                  <Badge variant={tradingBadge.variant}>{tradingBadge.label}</Badge>
                </td>
                <td className="p-3 text-sm">
                  <div>{item.load_city} → {item.unload_city}</div>
                </td>
                <td className="p-3 text-sm">
                  <div>{item.cargo_name}</div>
                  <div className="text-secondary">{item.cargo_weight_kg} кг / {item.cargo_volume_m3} м³</div>
                </td>
                <td className="p-3 text-sm font-medium">
                  <div>{item.current_price.toLocaleString('ru-RU')} ₽</div>
                  <div className="text-secondary">{item.price_per_km} ₽/км</div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
