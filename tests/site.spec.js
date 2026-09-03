import { test, expect } from '@playwright/test';

/**
 * The published site in docs/. It is the shop window for the package, so a broken
 * search or a recolour that stops propagating is a shipping bug, not a cosmetic one.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.locator('.hov-card')).toHaveCount(37);
});

const search = (page) => page.locator('input.search');
const cardNames = (page) => page.locator('.hov-card p.mono');

test('renders every icon and names the groups', async ({ page }) => {
  await expect(page.getByText('37 icons · 7 groups')).toBeVisible();
  await expect(page.locator('.hov-card svg')).toHaveCount(37);
});

test('search finds an icon by tag and by alias', async ({ page }) => {
  await search(page).fill('palayok');
  await expect(cardNames(page)).toHaveText(['barako-pot']);

  await search(page).fill('cup-cold');
  await expect(cardNames(page)).toHaveText(['cold-brew']);
});

test('a search with no hits shows the empty state', async ({ page }) => {
  await search(page).fill('zzzz');
  await expect(page.locator('.hov-card')).toHaveCount(0);
  await expect(page.getByText('Nothing brewing under that name.')).toBeVisible();
});

test('a category filters the grid', async ({ page }) => {
  await page.getByRole('button', { name: 'Tropical', exact: true }).click();
  await expect(page.locator('.hov-card')).toHaveCount(9);
});

test('one colour leaves no literal hex behind', async ({ page }) => {
  await page.getByRole('button', { name: /one colour/ }).click();
  const counts = await page.evaluate(() => ({
    hex: document.querySelectorAll('.hov-card svg [fill^="#"], .hov-card svg [stroke^="#"]').length,
    currentColor: document.querySelectorAll('.hov-card svg [fill="currentColor"]').length,
  }));
  expect(counts.hex).toBe(0);
  expect(counts.currentColor).toBeGreaterThan(0);
});

test('recolouring a token follows it across the whole set', async ({ page }) => {
  await page.locator('.hov-card button[title="Customize and export"]').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.locator('input[type=color]').first().evaluate((el) => {
    el.value = '#00ff00';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // The point of shared tokens: one edit reaches every icon that paints with it,
  // not just the one in the dialog.
  await expect
    .poll(() => page.evaluate(() => document.querySelectorAll('svg [fill="#00ff00"]').length))
    .toBeGreaterThan(1);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('a palette value that is not a colour is refused', async ({ page }) => {
  await page.locator('.hov-card button[title="Customize and export"]').first().click();
  const swatch = page.getByRole('dialog').locator('input[type=color]').first();

  await swatch.evaluate((el) => {
    el.value = '#00ff00';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect
    .poll(() => page.evaluate(() => document.querySelectorAll('svg [fill="#00ff00"]').length))
    .toBeGreaterThan(1);

  // A colour input normalises anything invalid to #000000 before a handler ever sees
  // it, so the type is dropped to text to put a hostile string on the wire at all.
  // These values are substituted into the SVG source the page renders and exports.
  await swatch.evaluate((el) => {
    el.type = 'text';
    el.value = '" onload="window.__pwned = 1';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(150);

  expect(await page.evaluate(() => window.__pwned ?? null)).toBeNull();
  expect(await page.evaluate(() => document.body.innerHTML.includes('onload="window.__pwned'))).toBe(false);
  // The refused write must not clobber the good one either.
  expect(await page.evaluate(() => document.querySelectorAll('svg [fill="#00ff00"]').length)).toBeGreaterThan(1);
});

test('the theme toggle survives a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('[data-theme="dark"]').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-theme="dark"]').first()).toBeVisible();
});

test('the page loads with no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/docs/');
  await expect(page.locator('.hov-card')).toHaveCount(37);
  expect(errors).toEqual([]);
});
