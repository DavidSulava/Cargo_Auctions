import { test, expect } from '@playwright/test'

const UUID = '00000000-0000-0000-0000-000000000001'
const BASE = '/Cargo_Auctions'

test('debug detail page', async ({ page }) => {
  const log: string[] = []
  page.on('request', req => log.push(`REQ: ${req.method()} ${req.url()}`))
  page.on('response', res => log.push(`RES: ${res.status()} ${res.url()}`))

  page.route(`**/api/auctions/00000000-0000-0000-0000-000000000001`, async (route) => {
    log.push('DETAIL MOCK HIT')
    await route.fulfill({ json: { uuid: UUID, cargo_num: 'CARGO-00001', auc_type: 'Request', status: 'Active', trading_status: 'Leading', organizer: { name: 'OOO', rating: 4.5, deals_count: 128 }, route: [], cargo_name: 'Electro', cargo_weight_kg: 5000, cargo_volume_m3: 20, cargo_body_type: 'Tent', trading: { can_set_bet: true, current_price: 150000, available_price: 150000, step: 5000 }, hide_points_address_and_contacts: false, hide_bets_history: false, no_view_cargo_price: false, created_at: '', updated_at: '' } })
  })

  await page.goto(`${BASE}/auctions/${UUID}`)
  await page.waitForTimeout(3000)
  for (const l of log) console.log(l)
})
