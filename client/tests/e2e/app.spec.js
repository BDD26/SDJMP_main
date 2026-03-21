import { expect, test } from 'playwright/test'

test('public home renders the main brand', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner').getByRole('link', { name: 'SkillMatch' })).toBeVisible()
})
