import { test, expect } from '@playwright/test'

test.describe('Cargo Auctions SPA', () => {
  test('should load the auction list page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Аукционы')
  })

  test('should show auction table rows', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  test('should navigate to auction detail', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const firstLink = page.locator('table tbody tr a').first()
    await firstLink.click()
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Маршрут')).toBeVisible()
  })
})
