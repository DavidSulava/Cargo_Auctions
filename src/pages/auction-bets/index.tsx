import { useParams, useNavigate } from '@tanstack/react-router'
import { useBetList } from '~/entities/bet'
import type { Bet } from '~/entities/bet'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Badge } from '@astryxdesign/core/Badge'
import { Banner } from '@astryxdesign/core/Banner'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Button } from '@astryxdesign/core/Button'
import { Avatar } from '@astryxdesign/core/Avatar'

export default function AuctionBetsPage() {
  const { uuid } = useParams({ from: '/auctions/$uuid/bets' })
  const navigate = useNavigate()
  const { data, isLoading, isError } = useBetList(uuid)

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton width="200px" height="28px" />
        <Skeleton width="100%" height="40px" />
        <Skeleton width="100%" height="40px" />
        <Skeleton width="100%" height="40px" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="content-enter">
          <Banner status="error" title="Ошибка загрузки ставок" />
        </div>
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button label="← Назад к аукциону" variant="ghost" onClick={() => navigate({ to: `/auctions/${uuid}` })} />
        </div>
        <div className="content-enter">
          <EmptyState
            title="Ставок пока нет"
            description="На этот аукцион ещё никто не сделал ставку"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="content-enter p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button label="← Назад" variant="ghost" onClick={() => navigate({ to: `/auctions/${uuid}` })} />
        </div>
        <div className="text-sm text-secondary">
          Участников: {data.participants_count} · Ставок: {data.total}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left text-sm font-medium text-secondary">#</th>
              <th className="p-3 text-left text-sm font-medium text-secondary">Перевозчик</th>
              <th className="p-3 text-left text-sm font-medium text-secondary">Цена</th>
              <th className="p-3 text-left text-sm font-medium text-secondary">С НДС / без НДС</th>
              <th className="p-3 text-left text-sm font-medium text-secondary">Статус</th>
              <th className="p-3 text-left text-sm font-medium text-secondary">Дата</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((bet: Bet) => (
              <tr key={bet.id} className="border-b border-border hover:bg-surface">
                <td className="p-3 text-sm">{bet.rank}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={bet.carrier_name} size="sm" />
                    <span className="text-sm">{bet.carrier_name}</span>
                  </div>
                </td>
                <td className="p-3 text-sm font-medium">
                  {bet.price.toLocaleString('ru-RU')} ₽
                </td>
                <td className="p-3 text-sm">
                  <div>{bet.price_with_nds.toLocaleString('ru-RU')} ₽ с НДС</div>
                  <div className="text-secondary">{bet.price_without_nds.toLocaleString('ru-RU')} ₽ без НДС</div>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {bet.is_winner && <Badge variant="success" label="Победитель" />}
                    {bet.is_cancelled && (
                      <Badge variant="error" label="Отменена" />
                    )}
                    {!bet.is_winner && !bet.is_cancelled && (
                      <Badge variant="neutral" label="Активна" />
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm text-secondary">
                  {new Date(bet.created_at).toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
