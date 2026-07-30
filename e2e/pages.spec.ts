import { test, expect, type Page } from '@playwright/test'

const UUID = '00000000-0000-0000-0000-000000000001'

const mockAuction = {
  uuid: UUID,
  cargo_num: 'CARGO-00001',
  auc_type: 'Request' as const,
  status: 'Active' as const,
  trading_status: 'Leading' as const,
  load_city: 'Москва',
  unload_city: 'Санкт-Петербург',
  load_date_from: '2026-08-01',
  load_date_to: '2026-08-05',
  cargo_name: 'Электроника',
  cargo_weight_kg: 5000,
  cargo_volume_m3: 20,
  cargo_body_type: 'Tent' as const,
  current_price: 150000,
  price_per_km: 50,
  bet_step: 5000,
  has_my_bet: false,
  can_set_bet: true,
  is_available: true,
  is_bidder: false,
  hide_bets_history: false,
  hide_points_address_and_contacts: false,
  no_view_cargo_price: false,
  organizer_name: 'ООО Грузоперевозки',
}

const mockDetail = {
  uuid: UUID,
  cargo_num: 'CARGO-00001',
  auc_type: 'Request' as const,
  status: 'Active' as const,
  trading_status: 'Leading' as const,
  organizer: {
    name: 'ООО Грузоперевозки',
    rating: 4.5,
    deals_count: 128,
    phone: '+7 (495) 123-45-67',
    email: 'info@gruz.ru',
  },
  route: [
    { id: 'r1', city: 'Москва', address: 'ул. Тверская, 1', date_from: '2026-08-01', date_to: '2026-08-01', type: 'load' as const },
    { id: 'r2', city: 'Санкт-Петербург', address: 'Невский пр., 1', date_from: '2026-08-05', date_to: '2026-08-05', type: 'unload' as const },
  ],
  cargo_name: 'Электроника',
  cargo_weight_kg: 5000,
  cargo_volume_m3: 20,
  cargo_body_type: 'Tent' as const,
  cargo_description: 'Хрупкий груз',
  payment_terms: 'Безналичный расчёт, 100% предоплата',
  load_date_from: '2026-08-01',
  load_date_to: '2026-08-05',
  trading: {
    can_set_bet: true,
    current_price: 150000,
    available_price: 150000,
    step: 5000,
    min_price: 140000,
  },
  hide_points_address_and_contacts: false,
  hide_bets_history: false,
  no_view_cargo_price: false,
  created_at: '2026-07-01T10:00:00Z',
  updated_at: '2026-07-28T15:00:00Z',
}

const mockBets = {
  items: [
    {
      id: 'b1',
      auction_uuid: UUID,
      carrier_name: 'ИП Иванов',
      price: 148000,
      price_with_nds: 177600,
      price_without_nds: 123333,
      has_nds: true,
      is_winner: false,
      is_cancelled: false,
      rank: 1,
      created_at: '2026-07-28T14:00:00Z',
    },
  ],
  participants_count: 1,
  total: 1,
}

function mockApi(page: Page) {
  page.route('**/api/auctions/list', async (route) => {
    await route.fulfill({ json: { items: [mockAuction], total: 1, page: 1, per_page: 10 } })
  })
  page.route(`**/api/auctions/${UUID}`, async (route) => {
    await route.fulfill({ json: mockDetail })
  })
  page.route(`**/api/auctions/${UUID}/bets`, async (route) => {
    await route.fulfill({ json: mockBets })
  })
}

const BASE = '/Cargo_Auctions'

test.describe('Cargo Auctions SPA', () => {
  test('home page — renders heading, filters, table columns', async ({ page }) => {
    mockApi(page)
    await page.goto(`${BASE}/`)
    await expect(page.locator('h1')).toContainText('Аукционы')
    await expect(page.getByText('CARGO-00001')).toBeVisible()
    await expect(page.getByText('Электроника')).toBeVisible()
    await expect(page.getByText('Номер заявки')).toBeVisible()
    await expect(page.getByText('Сбросить')).toBeVisible()
    const headers = page.locator('table thead th')
    await expect(headers).toHaveText(['№', 'Тип', 'Статус', 'Торговый статус', 'Маршрут', 'Груз', 'Цена'])
  })

  test('home page — empty state', async ({ page }) => {
    page.route('**/api/auctions/list', async (route) => {
      await route.fulfill({ json: { items: [], total: 0, page: 1, per_page: 10 } })
    })
    await page.goto(`${BASE}/`)
    await expect(page.getByText('Аукционы не найдены')).toBeVisible()
  })

  test('detail page — direct URL', async ({ page }) => {
    mockApi(page)
    await page.goto(`${BASE}/auctions/${UUID}`)
    await expect(page.getByText('CARGO-00001')).toBeVisible()
    await expect(page.getByText('Маршрут')).toBeVisible()
    await expect(page.getByText('Груз и требования')).toBeVisible()
    await expect(page.getByText('Параметры торгов')).toBeVisible()
    await expect(page.getByText('Организатор')).toBeVisible()
  })

  test('detail page — bets tab', async ({ page }) => {
    mockApi(page)
    await page.goto(`${BASE}/auctions/${UUID}`)
    await page.getByRole('button', { name: 'Ставки' }).click()
    await expect(page.getByText('ИП Иванов').last()).toBeVisible()
  })

  test('bets page — direct URL', async ({ page }) => {
    mockApi(page)
    await page.goto(`${BASE}/auctions/${UUID}/bets`)
    await expect(page.getByText('ИП Иванов').last()).toBeVisible()
    await expect(page.getByText('Участников:')).toBeVisible()
    await expect(page.getByText('← Назад')).toBeVisible()
  })

  test('bets page — empty state', async ({ page }) => {
    page.route(`**/api/auctions/${UUID}/bets`, async (route) => {
      await route.fulfill({ json: { items: [], participants: 0, total: 0 } })
    })
    page.route(`**/api/auctions/${UUID}`, async (route) => {
      await route.fulfill({ json: mockDetail })
    })
    await page.goto(`${BASE}/auctions/${UUID}/bets`)
    await expect(page.getByText('Ставок пока нет')).toBeVisible()
  })

  test('bet form page — renders form', async ({ page }) => {
    mockApi(page)
    await page.goto(`${BASE}/auctions/${UUID}/bid`)
    await expect(page.getByTitle('Сделать ставку')).toBeVisible()
    await expect(page.getByText('Текущая цена:')).toBeVisible()
    await expect(page.getByText('Ваша ставка (₽)')).toBeVisible()
    await expect(page.getByText('С НДС')).toBeVisible()
    await expect(page.getByText('Подтвердить')).toBeVisible()
  })

  test('bet form page — auction not found', async ({ page }) => {
    page.route('**/api/auctions/unknown-uuid', async (route) => {
      await route.fulfill({ status: 404, json: { message: 'Аукцион не найден' } })
    })
    await page.goto(`${BASE}/auctions/unknown-uuid/bid`)
    await expect(page.getByText('Аукцион не найден')).toBeVisible()
  })

  test('bet form page — bets closed', async ({ page }) => {
    page.route(`**/api/auctions/closed-uuid`, async (route) => {
      await route.fulfill({ json: { ...mockDetail, uuid: 'closed-uuid', trading: { ...mockDetail.trading, can_set_bet: false } } })
    })
    await page.goto(`${BASE}/auctions/closed-uuid/bid`)
    await expect(page.getByText('Ставки закрыты')).toBeVisible()
  })

  test('404 page — unknown route', async ({ page }) => {
    await page.goto(`${BASE}/nonexistent`)
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Страница не найдена')).toBeVisible()
  })

  test('side nav — navigates home', async ({ page }) => {
    mockApi(page)
    await page.goto(`${BASE}/auctions/${UUID}`)
    await page.getByRole('link', { name: 'Аукционы' }).click()
    await expect(page).toHaveURL(/\/Cargo_Auctions\/?$/)
  })
})
