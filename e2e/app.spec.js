const { test, expect } = require('@playwright/test');

test('has logo', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const logo = page.locator('img[alt="logo"]');
  await expect(logo).toBeVisible();
});

test('has Jenkins in the body', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const isVisible = await page.locator('a:has-text("Learn Jenkins By Kanishk")').isVisible();
  expect(isVisible).toBeTruthy();
});

test('has expected app version', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const version = await page.textContent('p');
  expect(version).toContain('Application version: 1');
});
