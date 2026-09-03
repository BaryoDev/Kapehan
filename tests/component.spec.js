import { test, expect } from '@playwright/test';

/**
 * <kape-icon> is the package entry point, so these run against the generated
 * kape-icon.js exactly as npm ships it.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/component.html');
  await page.waitForFunction(() => !!customElements.get('kape-icon'));
});

test('renders a named icon at the requested size', async ({ page }) => {
  const svg = page.locator('#plain svg');
  await expect(svg).toHaveAttribute('width', '48');
  await expect(svg).toHaveAttribute('height', '48');
  await expect(svg).toHaveAttribute('viewBox', '0 0 48 48');
  await expect(svg).toHaveAttribute('aria-label', 'barako');
  expect(await svg.evaluate((el) => el.children.length)).toBeGreaterThan(0);
});

test('an alias resolves to its icon', async ({ page }) => {
  await expect(page.locator('#alias svg')).toHaveAttribute('aria-label', 'cold brew');
});

test('mono renders currentColor and no literal hex', async ({ page }) => {
  const counts = await page.locator('#mono').evaluate((el) => ({
    currentColor: el.querySelectorAll('[fill="currentColor"], [stroke="currentColor"]').length,
    hex: el.querySelectorAll('[fill^="#"], [stroke^="#"]').length,
  }));
  expect(counts.currentColor).toBeGreaterThan(0);
  expect(counts.hex).toBe(0);
});

test('an unknown name renders nothing instead of throwing', async ({ page }) => {
  await expect(page.locator('#unknown svg')).toHaveCount(0);
});

/**
 * The regression this file exists for. size comes from the host page. When it was
 * concatenated into an attribute string, size='24" onload="..."' escaped the tag and
 * ran. npm test only proves the icons are in sync, so nothing else catches this.
 */
test.describe('a hostile size attribute cannot inject', () => {
  test('does not add attributes to the svg', async ({ page }) => {
    const attrs = await page.locator('#attr-break svg').evaluate((el) => [...el.attributes].map((a) => a.name));
    expect(attrs).not.toContain('onload');
    expect(attrs.sort()).toEqual(['aria-label', 'fill', 'height', 'role', 'viewBox', 'width']);
  });

  test('does not inject elements', async ({ page }) => {
    expect(await page.locator('kape-icon img').count()).toBe(0);
    expect(await page.locator('kape-icon svg[onload]').count()).toBe(0);
  });

  test('does not execute', async ({ page }) => {
    // Give an injected handler every chance to run before asserting it did not.
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__pwned ?? null)).toBeNull();
    expect(await page.evaluate(() => window.__pwned2 ?? null)).toBeNull();
  });

  test('falls back to the default size', async ({ page }) => {
    for (const id of ['#attr-break', '#tag-break', '#junk-size']) {
      await expect(page.locator(`${id} svg`)).toHaveAttribute('width', '24');
    }
  });

  test('still renders the icon it was asked for', async ({ page }) => {
    await expect(page.locator('#attr-break svg')).toHaveAttribute('aria-label', 'barako');
  });
});
