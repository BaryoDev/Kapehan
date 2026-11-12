import { test, expect } from '@playwright/test';

/**
 * <kape-doodle> ships in the package with the same size= handling as <kape-icon>, so it
 * gets the same hostile-size cases, run against the generated kape-doodle.js.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/doodle.html');
  await page.waitForFunction(() => !!customElements.get('kape-doodle'));
});

test('renders a named doodle at the requested size', async ({ page }) => {
  const svg = page.locator('#plain svg');
  await expect(svg).toHaveAttribute('width', '240');
  await expect(svg).toHaveAttribute('role', 'img');
  expect(await svg.evaluate((el) => el.children.length)).toBeGreaterThan(0);
});

test('an unknown name renders nothing instead of throwing', async ({ page }) => {
  await expect(page.locator('#unknown svg')).toHaveCount(0);
});

test.describe('a hostile size attribute cannot inject', () => {
  test('does not add attributes to the svg', async ({ page }) => {
    const attrs = await page.locator('#attr-break svg').evaluate((el) => [...el.attributes].map((a) => a.name));
    expect(attrs).not.toContain('onload');
  });

  test('does not inject elements', async ({ page }) => {
    expect(await page.locator('kape-doodle img').count()).toBe(0);
    expect(await page.locator('kape-doodle svg[onload]').count()).toBe(0);
  });

  test('does not execute', async ({ page }) => {
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__pwned ?? null)).toBeNull();
    expect(await page.evaluate(() => window.__pwned2 ?? null)).toBeNull();
  });

  test('falls back to a fluid width', async ({ page }) => {
    for (const id of ['#attr-break', '#tag-break', '#junk-size']) {
      await expect(page.locator(`${id} svg`)).toHaveAttribute('width', '100%');
    }
  });
});
