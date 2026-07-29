import { useCallback, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuctionList } from '~/entities/auction/queries'
import type { FilterParams } from '~/shared/lib/filter-schema'
import { AuctionFiltersPanel } from '~/widgets/auction-card/filters'
import { AuctionListTable } from '~/widgets/auction-card/table'
import { Pagination } from '@astryxdesign/core/Pagination'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Banner } from '@astryxdesign/core/Banner'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Section } from '@astryxdesign/core/Section'

const FILTER_STORAGE_KEY = 'auction-filters'

function loadSavedFilters(): Partial<Record<string, string>> {
  try {
    return JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function isDefaultFilters(f: FilterParams): boolean {
  return !f.cargo_num && !f.status && f.statuses.length === 0 && !f.auc_type
    && !f.load_city && !f.unload_city && !f.load_date_from && !f.load_date_to
    && f.is_available === undefined && f.is_bidder === undefined
    && f.price_from === undefined && f.price_to === undefined
}

export default function AuctionListPage() {
  const filters = useSearch({ from: '/' })
  const navigate = useNavigate()

  useEffect(() => {
    if (isDefaultFilters(filters)) {
      const saved = loadSavedFilters()
      if (Object.keys(saved).length > 0) {
        navigate({ search: saved, replace: true })
      }
    }
  }, [])

  const { data, isLoading, isError, error } = useAuctionList(filters)
  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  const setFilter = useCallback(
    (key: string, value: unknown) => {
      const saved = loadSavedFilters()
      saved[key] = String(value ?? '')
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(saved))
      navigate({ search: { ...filters, [key]: value, page: 1 } })
    },
    [filters, navigate],
  )

  const setPage = useCallback(
    (page: number) => {
      navigate({ search: { ...filters, page } })
    },
    [filters, navigate],
  )

  const clearFilters = useCallback(() => {
    localStorage.removeItem(FILTER_STORAGE_KEY)
    navigate({ search: {} })
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
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
          </div>
        ) : data && data.items.length === 0 ? (
          <EmptyState
            title="Аукционы не найдены"
            description="Попробуйте изменить параметры фильтров"
            action={{ label: 'Сбросить фильтры', onClick: clearFilters }}
          />
        ) : data ? (
          <>
            <AuctionListTable items={data.items} />
            {totalPages > 1 && (
              <Pagination
                variant="pages"
                totalItems={data.total}
                page={filters.page ?? 1}
                totalPages={totalPages}
                onChange={setPage}
              />
            )}
          </>
        ) : null}
      </Section>
    </div>
  )
}
