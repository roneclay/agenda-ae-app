import { expect, test } from '@playwright/test'

test.describe('Auth flow', () => {
  test('página de cadastro carrega', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.locator('form')).toBeVisible()
  })

  test('página de login carrega', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('form')).toBeVisible()
  })

  test('dashboard redireciona para login sem auth', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })
})
