import { expect, test } from '@playwright/test'

test.describe('Booking flow público', () => {
  test('página /agendar/demo carrega', async ({ page }) => {
    await page.goto('/agendar/demo')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('exibe lista de serviços', async ({ page }) => {
    await page.goto('/agendar/demo')
    await expect(page.locator('[data-testid="service-list"]')).toBeVisible()
  })
})
