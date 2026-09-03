import { test, expect } from '@playwright/test';

/**
 * Its own file on purpose: site.spec.js has a beforeEach that waits for 37 icon cards,
 * which can never appear with JS off.
 *
 * #app is empty in the HTML, so before this fallback existed a blocked CDN, a failed
 * SRI check or JS off left a completely blank page for people and crawlers alike.
 */
test.use({ javaScriptEnabled: false });

test('the page still says what it is without javascript', async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.locator('.hov-card')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Coffee icons');
  // Regex, not a string. getByText with a string matches on innerText, which comes
  // back empty for nodes inside <noscript>; the regex form matches textContent and
  // finds them. Verified both ways: string 0 matches, regex 1, same element.
  await expect(page.getByText(/npm i kapehan/)).toBeVisible();
  await expect(page.locator('a[href="https://github.com/BaryoDev/Kapehan"]')).toBeVisible();
});

test('the fallback explains itself rather than looking broken', async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.getByText(/needs JavaScript/i)).toBeVisible();
});
