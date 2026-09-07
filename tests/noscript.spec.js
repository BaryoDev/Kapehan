import { test, expect } from '@playwright/test';

/**
 * Its own file on purpose: site.spec.js waits for the tablist, which can never appear with
 * JS off.
 *
 * The site is a React bundle that compiles its own JSX in the browser, so with JS disabled,
 * a blocked CDN or a failed compile, the page renders nothing on its own. The runtime's
 * built-in fallback is a single line saying JavaScript is required, which is what a crawler
 * would otherwise index. These cover the fallback that replaces it.
 */
test.use({ javaScriptEnabled: false });

test('the page still says what it is without javascript', async ({ page }) => {
  await page.goto('/docs/');
  // Regex, not a string. getByText with a string matches innerText, which comes back empty
  // for nodes inside <noscript>; the regex form matches textContent and finds them.
  await expect(page.getByText(/Kapehan: free coffee icons/)).toBeVisible();
  await expect(page.getByText(/Icons, doodles, drink palettes/)).toBeVisible();
  await expect(page.getByText(/npm i kapehan/)).toBeVisible();
});

test('the fallback links out rather than dead-ending', async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.getByText(/github\.com\/BaryoDev\/Kapehan/)).toBeVisible();
});

test('the fallback explains itself rather than looking broken', async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.getByText(/needs JavaScript/i)).toBeVisible();
});
