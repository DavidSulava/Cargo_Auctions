import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@astryxdesign/core/Button'
import { useAuctionList } from '~/entities/auction/queries'
import { AuctionFiltersPanel } from '~/widgets/auction-card/filters'
import { AuctionListTable } from '~/widgets/auction-card/table'
import { Pagination } from '@astryxdesign/core/Pagination'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Banner } from '@astryxdesign/core/Banner'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Section } from '@astryxdesign/core/Section'

export default function AuctionListPage() {
  const filters = useSearch({ from: '/' })
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useAuctionList(filters as never)
  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  const setFilter = useCallback(
    (key: string, value: unknown) => {
      const next = { ...filters, page: 1 }
      if (value === undefined || value === '') {
        delete (next as Record<string, unknown>)[key]
      } else {
        (next as Record<string, unknown>)[key] = value
      }
      navigate({ search: next as never })
    },
    [filters, navigate],
  )

  const setPage = useCallback(
    (page: number) => {
      navigate({ to: '/', search: { page } as never })
    },
    [navigate],
  )

  const clearFilters = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  if (isError) {
    return (
      <div className="p-4">
        <Banner status="error" title="Ошибка загрузки">
          {error instanceof Error ? error.message : 'Не удалось загрузить список аукционов'}
        </Banner>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-primary">Аукционы</h1>

      <AuctionFiltersPanel filters={filters} onFilterChange={setFilter} onClear={clearFilters} />

      <Section>
        {isLoading ? (
          <div className="space-y-3 p-4">
              {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} width="100%" height="40px" />
              ))}
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="content-enter space-y-4">
            <EmptyState
              title="Аукционы не найдены"
              description="Попробуйте изменить параметры фильтров"
            />
            <Button label="Сбросить фильтры" variant="secondary" onClick={clearFilters} />
          </div>
        ) : data ? (
          <div className="content-enter" key={filters.page ?? 1}>
            <AuctionListTable items={data.items} search={filters} />
            {totalPages > 1 && (
              <Pagination
                className="pt-4"
                variant="pages"
                totalItems={data.total}
                page={filters.page ?? 1}
                totalPages={totalPages}
                onChange={setPage}
              />
            )}
          </div>
        ) : null}
      </Section>
    </div>
  )
}
