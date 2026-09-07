import { test, expect } from '@playwright/test';
import { icons } from '../kapehan-icons.js';
import { components } from '../scripts/components.mjs';

/**
 * The published site in docs/: the seven-tab browser for icons, doodles, palettes,
 * components, blocks, placement and the starter. It is the shop window for the package, so
 * a tab that does not switch or a panel that pushes the page sideways is a shipping bug.
 *
 * The page is a React bundle that compiles its own JSX in the browser, so nothing exists
 * until that finishes. Every test waits on the tablist rather than on a timeout.
 */
const ICON_COUNT = icons.length;

/** Tab key to panel id, which is also what the nav wires aria-controls to. */
const PANELS = {
  icons: 'sec-icons',
  doodles: 'sec-doodles',
  place: 'sec-place',
  ui: 'sec-ui',
  create: 'sec-create',
  blocks: 'sec-blocks',
  palettes: 'sec-palettes',
};

const tablist = (page) => page.locator('#kapehan-tablist');
const tabs = (page) => page.locator('#kapehan-tablist [role="tab"]');
const tab = (page, label) => tabs(page).filter({ hasText: new RegExp('^' + label) }).first();

/** Which panels are in the DOM. Real tabs render one; the old build rendered all seven. */
const livePanels = (page) =>
  page.evaluate((ids) => ids.filter((id) => document.getElementById(id)), Object.values(PANELS));

async function open(page, hash = '') {
  await page.goto('/docs/' + hash);
  await expect(tablist(page)).toBeVisible({ timeout: 20000 });
  await expect(tabs(page)).toHaveCount(7);
}

test.beforeEach(async ({ page }) => {
  // The header fetches a live star count. Unstubbed, a full run spends the GitHub 60/hr
  // per-IP budget, starts collecting 403s and logs them, which made the console-error test
  // fail two runs in three and would flake harder on a shared CI runner.
  await page.route('https://api.github.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ stargazers_count: 7 }) }));
  // Only the star cache. addInitScript runs before EVERY document, so clearing all of
  // localStorage here also wipes it on reload, which quietly broke the one test whose whole
  // subject is what survives a reload. Each test gets a fresh context anyway.
  await page.addInitScript(() => {
    try { localStorage.removeItem('kapehan.stars'); } catch (e) {}
  });
});

test('opens on Icons with only that panel rendered', async ({ page }) => {
  await open(page);
  await expect(tab(page, 'Icons')).toHaveAttribute('aria-selected', 'true');
  expect(await livePanels(page)).toEqual(['sec-icons']);
});

test('every tab carries its own count, derived not typed', async ({ page }) => {
  await open(page);
  const comps = await components();
  await expect(tab(page, 'Icons')).toContainText(String(ICON_COUNT));
  await expect(tab(page, 'Components')).toContainText(String(comps.length));
});

test('picking a tab swaps the panel rather than scrolling to it', async ({ page }) => {
  await open(page);
  await tab(page, 'Palettes').click();
  await expect(tab(page, 'Palettes')).toHaveAttribute('aria-selected', 'true');
  expect(await livePanels(page)).toEqual(['sec-palettes']);
  // The whole point of real tabs: the other six are gone, not merely scrolled past.
  await expect(page.locator('#sec-icons')).toHaveCount(0);
});

test('a tab is a link you can send someone', async ({ page }) => {
  await open(page, '#doodles');
  await expect(tab(page, 'Doodles')).toHaveAttribute('aria-selected', 'true');
  expect(await livePanels(page)).toEqual(['sec-doodles']);
});

test('back and forward walk the tabs', async ({ page }) => {
  await open(page, '#doodles');
  await tab(page, 'Brew').click();
  await expect(page).toHaveURL(/#create$/);

  await page.goBack();
  await expect(tab(page, 'Doodles')).toHaveAttribute('aria-selected', 'true');
  await page.goForward();
  await expect(tab(page, 'Brew')).toHaveAttribute('aria-selected', 'true');
});

test('arrow keys move between tabs and focus follows', async ({ page }) => {
  await open(page);
  await tab(page, 'Icons').focus();
  await page.keyboard.press('ArrowRight');
  await expect(tab(page, 'Doodles')).toHaveAttribute('aria-selected', 'true');
  await expect(tab(page, 'Doodles')).toBeFocused();

  await page.keyboard.press('ArrowLeft');
  await expect(tab(page, 'Icons')).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('End');
  await expect(tab(page, 'Palettes')).toHaveAttribute('aria-selected', 'true');
});

test('the tablist is wired for a screen reader', async ({ page }) => {
  await open(page);
  await expect(tablist(page)).toHaveAttribute('role', 'tablist');
  const selected = tab(page, 'Icons');
  await expect(selected).toHaveAttribute('aria-controls', 'sec-icons');
  await expect(selected).toHaveAttribute('tabindex', '0');
  // Roving tabindex: one stop for the whole group, not seven.
  await expect(tab(page, 'Doodles')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#sec-icons')).toHaveAttribute('role', 'tabpanel');
});

test('switching tabs does not throw the reader back above the hero', async ({ page }) => {
  await open(page);
  await page.mouse.wheel(0, 2500);
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(0);

  await tab(page, 'Palettes').click();
  // Lands at the top of the new panel, just under the sticky nav, not at the document top.
  const panelTop = await page.evaluate(() =>
    Math.round(document.getElementById('sec-palettes').getBoundingClientRect().top));
  expect(panelTop).toBeGreaterThan(0);
  expect(panelTop).toBeLessThan(120);
});

test.describe('responsive', () => {
  for (const [label, width] of [['phone', 390], ['tablet', 768], ['desktop', 1280]]) {
    test(`no horizontal overflow on any tab at ${width}px (${label})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      for (const key of Object.keys(PANELS)) {
        await page.evaluate((k) => { window.location.hash = k; }, key);
        await expect(page.locator('#' + PANELS[key])).toHaveCount(1);
        const over = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${key} tab at ${width}px`).toBe(0);
      }
    });
  }
});

test('doodles sit beside each other on a wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, '#doodles');
  const perRow = await page.evaluate(() => {
    const grids = [...document.querySelectorAll('#sec-doodles *')]
      .filter((e) => getComputedStyle(e).display === 'grid' && e.children.length > 4);
    return grids.map((g) => {
      const tops = new Set([...g.children].map((k) => Math.round(k.getBoundingClientRect().top)));
      return g.children.length / tops.size;
    });
  });
  expect(perRow.length).toBeGreaterThan(0);
  for (const n of perRow) expect(n).toBeGreaterThanOrEqual(2);
});

test('every doodle card keeps a frame, including the ones drawn to the edge', async ({ page }) => {
  await open(page, '#doodles');
  // About half the doodles are drawn "cropped tight" and fill their frame edge to edge. The
  // card has a radius but no border, so on those the frame vanished and the drawing read as
  // cut off, while the centred ones sat in a clean white card. An inset ring fixes it
  // without changing the box, so this checks the ring rather than a border.
  const missing = await page.evaluate(() =>
    [...document.querySelectorAll('#sec-doodles figure > div')]
      .filter((card) => !getComputedStyle(card).boxShadow.includes('inset'))
      .length);
  expect(missing).toBe(0);
});

test('a doodle is one grid cell, not a stack of six', async ({ page }) => {
  await open(page, '#doodles');
  // The laptop figure once closed after the six that follow it, nesting them in one cell.
  await expect(page.locator('#sec-doodles figure figure')).toHaveCount(0);
});

test('the page declares itself to a crawler and a screen reader', async ({ page }) => {
  await open(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /coffee/i);
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
});

test('the starter offers only the stacks the package ships', async ({ page }) => {
  await open(page, '#create');
  const body = await page.locator('#sec-create').innerText();
  expect(body).not.toMatch(/\bVue\b/);
  expect(body).not.toMatch(/\bBlazor\b/);
});

test('the primary call to action clears AA on every accent, in both themes', async ({ page }) => {
  await open(page);
  // It was #FBF6EE on the raw accent at 4.08:1, in both themes. No single text colour fixes
  // that: the visitor picks one of six accents and three of them fail against light AND dark
  // text at full strength, so the button background is darkened only as far as it takes.
  const results = await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const lum = (c) => {
      const m = c.match(/[\d.]+/g).map(Number);
      const [r, g, b] = m.slice(0, 3).map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a, b) => {
      const x = lum(a), y = lum(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const cta = () => [...document.querySelectorAll('button')].find((b) => /Brew yours/.test(b.textContent || ''));
    const swatches = [...document.querySelectorAll('button[aria-label^="Accent"]')];
    const toggle = [...document.querySelectorAll('button')].find((b) => /^(Dark|Light)$/.test(b.textContent.trim()));

    const out = [];
    for (const theme of ['light', 'dark']) {
      for (const sw of swatches) {
        sw.click();
        await sleep(250);
        const cs = getComputedStyle(cta());
        out.push({ theme, accent: sw.getAttribute('aria-label'), ratio: ratio(cs.color, cs.backgroundColor) });
      }
      if (theme === 'light') { toggle.click(); await sleep(500); }
    }
    return out;
  });

  expect(results.length).toBe(12); // six accents, two themes
  const failures = results.filter((r) => r.ratio < 4.5);
  expect(failures, JSON.stringify(failures)).toEqual([]);
});

test('the page loads with no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await open(page);
  for (const key of ['doodles', 'ui', 'palettes']) {
    await page.evaluate((k) => { window.location.hash = k; }, key);
    await expect(page.locator('#' + PANELS[key])).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('the theme toggle survives a reload', async ({ page }) => {
  await open(page);
  const toggle = page.getByRole('button', { name: /^(Dark|Light)$/ }).first();
  const before = (await toggle.innerText()).trim();
  await toggle.click();
  await expect(toggle).not.toHaveText(before);
  const after = (await toggle.innerText()).trim();

  await page.reload();
  await expect(tablist(page)).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('button', { name: /^(Dark|Light)$/ }).first()).toHaveText(after);
});
