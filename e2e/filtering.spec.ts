import { test, expect } from '@playwright/test'

const BASE = '/Cargo_Auctions'

const mockAuction = {
  uuid: 'auction-0001',
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
  is_bidder: true,
  hide_bets_history: false,
  hide_points_address_and_contacts: false,
  no_view_cargo_price: false,
  organizer_name: 'ООО Грузоперевозки',
}

const mockAuctionNonBidder = { ...mockAuction, uuid: 'auction-0002', cargo_num: 'CARGO-00002', is_bidder: false }

function setupRouteHandler(page: import('@playwright/test').Page, handler?: (body: Record<string, unknown>) => void) {
  const capturedBodies: Record<string, unknown>[] = []
  page.route('**/api/auctions/list', async (route) => {
    const request = route.request()
    if (request.method() === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}')
      capturedBodies.push(body)
      handler?.(body)
    }
    await route.fulfill({
      json: { items: [mockAuction], total: 1, page: 1, per_page: 10 },
    })
  })
  return capturedBodies
}

test.describe('Filters', () => {
  test('is_bidder checkbox — sends is_bidder in POST body and updates URL', async ({ page }) => {
    const capturedBodies = setupRouteHandler(page)

    await page.goto(`${BASE}/`)
    await expect(page.locator('h1')).toContainText('Аукционы')

    expect(capturedBodies.length).toBeGreaterThanOrEqual(1)
    const initialBody = capturedBodies[capturedBodies.length - 1]
    expect(initialBody.is_bidder).toBeUndefined()

    await page.getByLabel('Я участник').check()
    await page.waitForURL(/is_bidder=true/)
    expect(page.url()).toContain('is_bidder=true')

    await expect.poll(() => {
      const last = capturedBodies[capturedBodies.length - 1]
      return last.is_bidder
    }).toBe(true)
  })

  test('is_bidder checkbox — uncheck removes filter from URL', async ({ page }) => {
    setupRouteHandler(page)

    await page.goto(`${BASE}/`)
    await page.getByLabel('Я участник').check()
    await page.waitForURL(/is_bidder=true/)
    await expect(page.locator('table tbody tr').first()).toBeVisible()

    await page.getByLabel('Я участник').uncheck()
    await page.waitForURL((url) => !url.searchParams.has('is_bidder'))
    expect(page.url()).not.toContain('is_bidder')
  })

  test('cargo_num filter — sends cargo_num in POST body', async ({ page }) => {
    const capturedBodies = setupRouteHandler(page)

    await page.goto(`${BASE}/`)
    await expect(page.locator('h1')).toContainText('Аукционы')
    expect(capturedBodies.length).toBeGreaterThanOrEqual(1)

    const input = page.getByLabel('Номер заявки')
    await input.click()
    await input.fill('CARGO-001')
    await page.waitForURL(/cargo_num/)
    await expect.poll(() => {
      const last = capturedBodies[capturedBodies.length - 1]
      return last.cargo_num
    }).toBe('CARGO-001')
  })
})
