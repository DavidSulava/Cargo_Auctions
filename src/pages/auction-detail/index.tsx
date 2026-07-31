import { useParams, useNavigate } from '@tanstack/react-router'
import { useAuctionDetail } from '~/entities/auction'
import { useBetList } from '~/entities/bet'
import type { AuctionDetail } from '~/entities/auction'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Badge } from '@astryxdesign/core/Badge'
import { Table, proportional, pixel } from '@astryxdesign/core/Table'
import { Button } from '@astryxdesign/core/Button'
import { Banner } from '@astryxdesign/core/Banner'
import { Section } from '@astryxdesign/core/Section'
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList'
import { TabList, Tab } from '@astryxdesign/core/TabList'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Avatar } from '@astryxdesign/core/Avatar'
import { useState } from 'react'

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
  Active: { variant: 'success', label: 'Активен' },
  Pending: { variant: 'warning', label: 'Ожидание' },
  Closed: { variant: 'neutral', label: 'Закрыт' },
  Cancelled: { variant: 'error', label: 'Отменён' },
  Finished: { variant: 'info', label: 'Завершён' },
}

const AUCTION_TYPE_BADGE: Record<string, { variant: 'purple' | 'teal' | 'pink' | 'neutral'; label: string }> = {
  Request: { variant: 'purple', label: 'Заявка' },
  Up: { variant: 'teal', label: 'Повышение' },
  Down: { variant: 'pink', label: 'Понижение' },
  FixPrice: { variant: 'neutral', label: 'Фиксированная' },
}

export default function AuctionDetailPage() {
  const { uuid } = useParams({ from: '/auctions/$uuid' })
  const navigate = useNavigate()
  const listSearch = Object.fromEntries(new URLSearchParams(window.location.search)) as Record<string, unknown>
  const { data, isLoading, isError } = useAuctionDetail(uuid)
  const [tab, setTab] = useState('detail')
  const betsQuery = useBetList(tab === 'bets' ? uuid : '')

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
        <div className="content-enter">
          <Banner status="error" title="Аукцион не найден">
            Запрошенный аукцион не существует или был удалён.
          </Banner>
        </div>
        <Button label="Вернуться к списку" variant="secondary" className="mt-4" onClick={() => navigate({ to: '/', search: listSearch })} />
      </div>
    )
  }

  const statusBadge = STATUS_BADGE[data.status] ?? { variant: 'neutral' as const, label: data.status }

  return (
    <div className="content-enter p-4 space-y-6 max-w-5xl" key={uuid}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={AUCTION_TYPE_BADGE[data.auc_type]?.variant ?? 'neutral'} label={AUCTION_TYPE_BADGE[data.auc_type]?.label ?? data.auc_type} />
            <Badge variant={statusBadge.variant} label={statusBadge.label} />
          </div>
          <h1 className="text-2xl font-bold text-primary">{data.cargo_num}</h1>
        </div>
        <Button
          label={data.trading.my_bet ? 'Изменить ставку' : 'Сделать ставку'}
          variant="primary"
          isDisabled={!data.trading.can_set_bet}
          tooltip={data.trading.can_set_bet ? undefined : 'Ставки на этот аукцион закрыты'}
          onClick={() => navigate({ to: `/auctions/${uuid}/bid` })}
        />
      </div>

      <TabList value={tab} onChange={setTab} hasDivider>
        <Tab value="detail" label="Детали" />
        <Tab value="bets" label="Ставки" />
      </TabList>

      {tab === 'detail' && (
        <>
          {data.hide_points_address_and_contacts && (
            <div className="content-enter">
              <Banner status="warning" title="Информация скрыта">
                Контактные данные и адреса точек скрыты организатором.
              </Banner>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-2">Маршрут</h2>
          <Section>
            <MetadataList>
              {(data.route as AuctionDetail['route']).map((point, i) => (
                <MetadataListItem key={point.id} label={i === 0 ? 'Погрузка' : 'Выгрузка'}>
                  <div>{point.city}</div>
                  {point.address && <div className="text-secondary">{point.address}</div>}
                  <div className="text-sm text-secondary">{point.date_from} — {point.date_to}</div>
                </MetadataListItem>
              ))}
            </MetadataList>
          </Section>

          <h2 className="text-lg font-semibold mb-2">Груз и требования</h2>
          <Section>
            <MetadataList>
              <MetadataListItem label="Наименование">{data.cargo_name}</MetadataListItem>
              <MetadataListItem label="Вес">{data.cargo_weight_kg.toLocaleString('ru-RU')} кг</MetadataListItem>
              <MetadataListItem label="Объём">{data.cargo_volume_m3} м³</MetadataListItem>
              <MetadataListItem label="Тип кузова">{data.cargo_body_type}</MetadataListItem>
              {data.cargo_description && (
                <MetadataListItem label="Описание">{data.cargo_description}</MetadataListItem>
              )}
            </MetadataList>
          </Section>

          <h2 className="text-lg font-semibold mb-2">Параметры торгов</h2>
          <Section>
            <MetadataList>
              <MetadataListItem label="Текущая цена">
                <span className="font-bold">{data.trading.current_price.toLocaleString('ru-RU')} ₽</span>
              </MetadataListItem>
              <MetadataListItem label="Доступная цена">{data.trading.available_price.toLocaleString('ru-RU')} ₽</MetadataListItem>
              <MetadataListItem label="Шаг ставки">{data.trading.step.toLocaleString('ru-RU')} ₽</MetadataListItem>
              {data.trading.min_price !== undefined && (
                <MetadataListItem label="Мин. цена">{data.trading.min_price.toLocaleString('ru-RU')} ₽</MetadataListItem>
              )}
              {data.trading.max_price !== undefined && (
                <MetadataListItem label="Макс. цена">{data.trading.max_price.toLocaleString('ru-RU')} ₽</MetadataListItem>
              )}
            </MetadataList>
          </Section>

          <h2 className="text-lg font-semibold mb-2">Организатор</h2>
          <Section>
            <MetadataList>
              <MetadataListItem label="Наименование">{data.organizer.name}</MetadataListItem>
              <MetadataListItem label="Рейтинг">{data.organizer.rating} ★</MetadataListItem>
              {!data.hide_points_address_and_contacts && data.organizer.phone && (
                <MetadataListItem label="Телефон">{data.organizer.phone}</MetadataListItem>
              )}
              {!data.hide_points_address_and_contacts && data.organizer.email && (
                <MetadataListItem label="Email">{data.organizer.email}</MetadataListItem>
              )}
            </MetadataList>
          </Section>

          {data.payment_terms && (
            <>
              <h2 className="text-lg font-semibold mb-2">Условия оплаты</h2>
              <Section>
                <p className="text-sm text-primary">{data.payment_terms}</p>
              </Section>
            </>
          )}
        </>
      )}

      {tab === 'bets' && (
        data.hide_bets_history ? (
          <div className="content-enter">
            <Banner status="info" title="История ставок скрыта">
              Организатор скрыл историю ставок для этого аукциона.
            </Banner>
          </div>
        ) : betsQuery.isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
          </div>
        ) : betsQuery.isError ? (
          <div className="content-enter">
            <Banner status="error" title="Ошибка загрузки ставок" />
          </div>
        ) : betsQuery.data && betsQuery.data.items.length > 0 ? (
          <Section>
            <Table
              data={betsQuery.data.items as unknown as Record<string, unknown>[]}
              idKey="id"
              columns={[
                { key: 'rank', header: '#', width: pixel(60) },
                {
                  key: 'carrier',
                  header: 'Перевозчик',
                  width: proportional(1),
                  renderCell: (bet: Record<string, unknown>) => (
                    <div className="flex items-center gap-2">
                      <Avatar name={bet.carrier_name as string} size="sm" />
                      <span className="text-sm">{bet.carrier_name as string}</span>
                    </div>
                  ),
                },
                {
                  key: 'price',
                  header: 'Цена',
                  width: pixel(120),
                  renderCell: (bet: Record<string, unknown>) => (
                    <span className="font-medium">{(bet.price as number).toLocaleString('ru-RU')} ₽</span>
                  ),
                },
                {
                  key: 'nds',
                  header: 'С НДС / без НДС',
                  width: proportional(1),
                  renderCell: (bet: Record<string, unknown>) => (
                    <>
                      <div>{(bet.price_with_nds as number).toLocaleString('ru-RU')} ₽ с НДС</div>
                      <div className="text-secondary">{(bet.price_without_nds as number).toLocaleString('ru-RU')} ₽ без НДС</div>
                    </>
                  ),
                },
                {
                  key: 'status',
                  header: 'Статус',
                  width: proportional(0.8),
                  renderCell: (bet: Record<string, unknown>) => (
                    <div className="flex gap-1 flex-wrap">
                      {bet.is_winner as boolean && <Badge variant="success" label="Победитель" />}
                      {bet.is_cancelled as boolean && (
                        <Badge variant="error" label="Отменена" />
                      )}
                      {!(bet.is_winner as boolean) && !(bet.is_cancelled as boolean) && (
                        <Badge variant="neutral" label="Активна" />
                      )}
                    </div>
                  ),
                },
                {
                  key: 'created_at',
                  header: 'Дата',
                  width: pixel(160),
                  renderCell: (bet: Record<string, unknown>) => (
                    <span className="text-secondary">{new Date(bet.created_at as string).toLocaleString('ru-RU')}</span>
                  ),
                },
              ]}
              density="balanced"
              dividers="rows"
              hasHover
            />
          </Section>
        ) : (
          <div className="content-enter">
            <EmptyState
              title="Ставок пока нет"
              description="На этот аукцион ещё никто не сделал ставку"
            />
          </div>
        )
      )}
    </div>
  )
}
