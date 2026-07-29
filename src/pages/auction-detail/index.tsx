import { useParams, useNavigate } from '@tanstack/react-router'
import { useAuctionDetail } from '~/entities/auction/queries'
import { useBetList, usePlaceBet } from '~/entities/bet/queries'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Banner } from '@astryxdesign/core/Banner'
import { Section } from '@astryxdesign/core/Section'
import { MetadataList } from '@astryxdesign/core/MetadataList'
import { TabList } from '@astryxdesign/core/TabList'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Avatar } from '@astryxdesign/core/Avatar'
import { BetFormModal } from '~/widgets/bet-form-modal'
import { useState } from 'react'

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
  Active: { variant: 'success', label: 'Активен' },
  Pending: { variant: 'warning', label: 'Ожидание' },
  Closed: { variant: 'neutral', label: 'Закрыт' },
  Cancelled: { variant: 'error', label: 'Отменён' },
  Finished: { variant: 'info', label: 'Завершён' },
}

const AUCTION_TYPE_BADGE: Record<string, { variant: 'purple' | 'teal' | 'pink' | 'neutral'; label: string }> = {
  Request: { variant: 'purple', label: 'Request' },
  Up: { variant: 'teal', label: 'Up' },
  Down: { variant: 'pink', label: 'Down' },
  FixPrice: { variant: 'neutral', label: 'FixPrice' },
}

export default function AuctionDetailPage() {
  const { uuid } = useParams({ from: '/auctions/$uuid' })
  const navigate = useNavigate()
  const { data, isLoading, isError } = useAuctionDetail(uuid)
  const [tab, setTab] = useState('detail')
  const [betModalOpen, setBetModalOpen] = useState(false)
  const betsQuery = useBetList(tab === 'bets' ? uuid : '')
  const placeBetMutation = usePlaceBet(uuid)

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton width="40%" height="32px" />
        <Skeleton width="100%" height="120px" />
        <Skeleton width="100%" height="120px" />
        <Skeleton width="100%" height="120px" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-4">
        <Banner status="error" title="Аукцион не найден">
          Запрошенный аукцион не существует или был удалён.
        </Banner>
        <Button label="Вернуться к списку" variant="secondary" className="mt-4" onClick={() => navigate({ to: '/' })} />
      </div>
    )
  }

  const statusBadge = STATUS_BADGE[data.status] ?? { variant: 'neutral' as const, label: data.status }

  return (
    <div className="p-4 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={AUCTION_TYPE_BADGE[data.auc_type]?.variant ?? 'neutral'}>
              {data.auc_type}
            </Badge>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-primary">{data.cargo_num}</h1>
        </div>
        {data.trading.can_set_bet ? (
          <Button
            label={data.trading.my_bet ? 'Изменить ставку' : 'Сделать ставку'}
            variant="primary"
            onClick={() => setBetModalOpen(true)}
          />
        ) : (
          <Button label="Сделать ставку" variant="primary" disabled />
        )}
        <BetFormModal
          auction={data}
          isPending={placeBetMutation.isPending}
          onSubmit={async (d) => { await placeBetMutation.mutateAsync(d); setBetModalOpen(false) }}
          onClose={() => setBetModalOpen(false)}
        />
      </div>

      <TabList
        tabs={[
          { id: 'detail', label: 'Детали' },
          { id: 'bets', label: 'Ставки' },
        ]}
        selectedId={tab}
        onChange={setTab}
        hasDivider
      />

      {tab === 'detail' && (
        <>
          {data.hide_points_address_and_contacts && (
            <Banner status="warning" title="Информация скрыта">
              Контактные данные и адреса точек скрыты организатором.
            </Banner>
          )}

          <Section title="Маршрут">
            <MetadataList>
              {data.route.map((point, i) => (
                <MetadataList.Row key={point.id}>
                  <MetadataList.Term>{i === 0 ? 'Погрузка' : 'Выгрузка'}</MetadataList.Term>
                  <MetadataList.Detail>
                    <div>{point.city}</div>
                    {point.address && <div className="text-secondary">{point.address}</div>}
                    <div className="text-sm text-secondary">{point.date_from} — {point.date_to}</div>
                  </MetadataList.Detail>
                </MetadataList.Row>
              ))}
            </MetadataList>
          </Section>

          <Section title="Груз и требования">
            <MetadataList>
              <MetadataList.Row><MetadataList.Term>Наименование</MetadataList.Term><MetadataList.Detail>{data.cargo_name}</MetadataList.Detail></MetadataList.Row>
              <MetadataList.Row><MetadataList.Term>Вес</MetadataList.Term><MetadataList.Detail>{data.cargo_weight_kg.toLocaleString('ru-RU')} кг</MetadataList.Detail></MetadataList.Row>
              <MetadataList.Row><MetadataList.Term>Объём</MetadataList.Term><MetadataList.Detail>{data.cargo_volume_m3} м³</MetadataList.Detail></MetadataList.Row>
              <MetadataList.Row><MetadataList.Term>Тип кузова</MetadataList.Term><MetadataList.Detail>{data.cargo_body_type}</MetadataList.Detail></MetadataList.Row>
              {data.cargo_description && (
                <MetadataList.Row><MetadataList.Term>Описание</MetadataList.Term><MetadataList.Detail>{data.cargo_description}</MetadataList.Detail></MetadataList.Row>
              )}
            </MetadataList>
          </Section>

          <Section title="Параметры торгов">
            <MetadataList>
              <MetadataList.Row>
                <MetadataList.Term>Текущая цена</MetadataList.Term>
                <MetadataList.Detail className="font-bold">{data.trading.current_price.toLocaleString('ru-RU')} ₽</MetadataList.Detail>
              </MetadataList.Row>
              <MetadataList.Row>
                <MetadataList.Term>Доступная цена</MetadataList.Term>
                <MetadataList.Detail>{data.trading.available_price.toLocaleString('ru-RU')} ₽</MetadataList.Detail>
              </MetadataList.Row>
              <MetadataList.Row>
                <MetadataList.Term>Шаг ставки</MetadataList.Term>
                <MetadataList.Detail>{data.trading.step.toLocaleString('ru-RU')} ₽</MetadataList.Detail>
              </MetadataList.Row>
              {data.trading.min_price !== undefined && (
                <MetadataList.Row><MetadataList.Term>Мин. цена</MetadataList.Term><MetadataList.Detail>{data.trading.min_price.toLocaleString('ru-RU')} ₽</MetadataList.Detail></MetadataList.Row>
              )}
              {data.trading.max_price !== undefined && (
                <MetadataList.Row><MetadataList.Term>Макс. цена</MetadataList.Term><MetadataList.Detail>{data.trading.max_price.toLocaleString('ru-RU')} ₽</MetadataList.Detail></MetadataList.Row>
              )}
            </MetadataList>
          </Section>

          <Section title="Организатор">
            <MetadataList>
              <MetadataList.Row><MetadataList.Term>Наименование</MetadataList.Term><MetadataList.Detail>{data.organizer.name}</MetadataList.Detail></MetadataList.Row>
              <MetadataList.Row><MetadataList.Term>Рейтинг</MetadataList.Term><MetadataList.Detail>{data.organizer.rating} ★</MetadataList.Detail></MetadataList.Row>
              {!data.hide_points_address_and_contacts && data.organizer.phone && (
                <MetadataList.Row><MetadataList.Term>Телефон</MetadataList.Term><MetadataList.Detail>{data.organizer.phone}</MetadataList.Detail></MetadataList.Row>
              )}
              {!data.hide_points_address_and_contacts && data.organizer.email && (
                <MetadataList.Row><MetadataList.Term>Email</MetadataList.Term><MetadataList.Detail>{data.organizer.email}</MetadataList.Detail></MetadataList.Row>
              )}
            </MetadataList>
          </Section>

          {data.payment_terms && (
            <Section title="Условия оплаты">
              <p className="text-sm text-primary">{data.payment_terms}</p>
            </Section>
          )}
        </>
      )}

      {tab === 'bets' && (
        data.hide_bets_history ? (
          <Banner status="info" title="История ставок скрыта">
            Организатор скрыл историю ставок для этого аукциона.
          </Banner>
        ) : betsQuery.isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
          </div>
        ) : betsQuery.isError ? (
          <Banner status="error" title="Ошибка загрузки ставок" />
        ) : betsQuery.data && betsQuery.data.items.length > 0 ? (
          <Section>
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
                  {betsQuery.data.items.map((bet) => (
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
                          {bet.is_winner && <Badge variant="success">Победитель</Badge>}
                          {bet.is_cancelled && (
                            <Badge variant="error" title={bet.cancel_reason}>
                              Отменена
                            </Badge>
                          )}
                          {!bet.is_winner && !bet.is_cancelled && (
                            <Badge variant="neutral">Активна</Badge>
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
          </Section>
        ) : (
          <EmptyState
            title="Ставок пока нет"
            description="На этот аукцион ещё никто не сделал ставку"
          />
        )
      )}
    </div>
  )
}
