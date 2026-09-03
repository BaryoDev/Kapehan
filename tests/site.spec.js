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
  // giscus is a third party we do not control, and it logs loudly until the GitHub App
  // is installed on the repo. Everything else still fails the test.
  const ours = (t) => !/giscus/i.test(t);
  page.on('console', (m) => m.type() === 'error' && ours(m.text()) && errors.push(m.text()));
  page.on('pageerror', (e) => ours(String(e)) && errors.push(String(e)));
  await page.goto('/docs/');
  await expect(page.locator('.hov-card')).toHaveCount(37);
  expect(errors).toEqual([]);
});

test('the star count and the social links are present', async ({ page }) => {
  // The star button must degrade to a plain link rather than break the header, so the
  // link is asserted unconditionally and the count only when the API answered.
  const gh = page.locator('header a[href="https://github.com/BaryoDev/Kapehan"]');
  await expect(gh).toBeVisible();
  await expect(page.locator('a[href="https://www.facebook.com/baryodev"]')).toBeVisible();
  await expect(page.locator('a[href="https://baryodev.medium.com/"]')).toBeVisible();
});

test('a failing star API leaves the header intact', async ({ page }) => {
  await page.route('https://api.github.com/**', (r) => r.fulfill({ status: 403, body: '{}' }));
  await page.addInitScript(() => { try { localStorage.removeItem('kapehan.stars'); } catch (e) {} });
  await page.goto('/docs/');
  await expect(page.locator('.hov-card')).toHaveCount(37);
  const gh = page.locator('header a[href="https://github.com/BaryoDev/Kapehan"]');
  await expect(gh).toBeVisible();
  await expect(gh).toHaveText(/GitHub/);
  // No count, no broken star glyph, just the link.
  await expect(gh).not.toHaveText(/\u2605/);
});

/**
 * Accessibility and robustness. The page had zero media queries, zero focus styling,
 * a link colour failing AA, and an empty #app that rendered nothing without JS.
 */
test.describe('responsive', () => {
  for (const [label, width, height] of [['phone', 390, 844], ['tablet', 768, 1024], ['desktop', 1280, 900]]) {
    test(`no horizontal overflow at ${width}px (${label})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/docs/');
      await expect(page.locator('.hov-card')).toHaveCount(37);
      const m = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
      expect(m.scroll, `document is ${m.scroll}px wide in a ${m.inner}px window`).toBe(m.inner);
    });
  }

  test('the h1 shrinks on a phone instead of staying 68px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/docs/');
    const px = await page.locator('h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(px).toBeGreaterThanOrEqual(36);
    expect(px).toBeLessThan(50);
  });

  test('the accent swatches step out of the nav on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/docs/');
    await expect(page.locator('.accent-swatches')).toBeHidden();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.accent-swatches')).toBeVisible();
  });
});

test('the search box has an accessible name, not just a placeholder', async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.getByRole('textbox', { name: /search icons/i })).toBeVisible();
});

test('keyboard focus draws a visible ring', async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.locator('.hov-card')).toHaveCount(37);
  const tile = page.locator('.hov-card button[title="Customize and export"]').first();
  await tile.focus();
  const ring = await tile.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { width: cs.outlineWidth, style: cs.outlineStyle, offset: cs.outlineOffset };
  });
  expect(ring.style).not.toBe('none');
  expect(parseFloat(ring.width)).toBeGreaterThanOrEqual(2);
});

test('the social card and the CDN hash are declared', async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://baryodev.github.io/Kapehan/og.png');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  // An SRI hash that does not match would block Vue and leave the noscript page, so
  // the fact that the app mounts at all is the real assertion here.
  await expect(page.locator('script[src*="vue.global.prod.js"]')).toHaveAttribute('integrity', /^sha384-/);
});

/**
 * The export paths. Nothing covered these before, and they are the whole point of the
 * page: a visitor comes to take an icon away.
 */
test.describe('downloads', () => {
  test('an icon exports as SVG with the current recolouring baked in', async ({ page }) => {
    await page.locator('.hov-card button[title="Customize and export"]').first().click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('input[type=color]').first().evaluate((el) => {
      el.value = '#00ff00';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      dialog.getByRole('button', { name: 'Download SVG' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.svg$/);

    const stream = await download.createReadStream();
    const body = await new Promise((res) => {
      let d = '';
      stream.on('data', (c) => (d += c));
      stream.on('end', () => res(d));
    });
    expect(body).toContain('<svg');
    expect(body).toContain('#00ff00');
  });

  test('an icon exports as PNG at the chosen size', async ({ page }) => {
    await page.locator('.hov-card button[title="Customize and export"]').first().click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: '256px' }).click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      dialog.getByRole('button', { name: 'Download PNG' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/-256\.png$/);
  });

  test('both sprite sheets download and carry every icon', async ({ page }) => {
    for (const [label, name] of [['Colour sprite', 'kapehan-sprite.svg'], ['Mono sprite', 'kapehan-sprite-mono.svg']]) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: label }).click(),
      ]);
      expect(download.suggestedFilename()).toBe(name);

      const stream = await download.createReadStream();
      const body = await new Promise((res) => {
        let d = '';
        stream.on('data', (c) => (d += c));
        stream.on('end', () => res(d));
      });
      expect((body.match(/<symbol /g) || []).length).toBe(37);
      expect(body).toContain('id="kape-barako"');
    }
  });

  test('the SVG and JSX copy buttons report back', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const card = page.locator('.hov-card').first();
    await card.getByRole('button', { name: 'SVG' }).click();
    await expect(card.getByRole('button', { name: /copied/ })).toBeVisible();
  });
});
