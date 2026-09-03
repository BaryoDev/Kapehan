/**
 * Renders docs/og.png, the 1200x630 social card, from the real icon data.
 *
 *   npm run og
 *
 * Kept out of `npm run build` on purpose: that has to stay dependency-free so
 * prepublishOnly can run it. This one needs Playwright, so it is a separate script
 * and the PNG is committed.
 */
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons, wrap } from '../kapehan-icons.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// A spread across the groups, so the card shows the range rather than nine cups.
const SHOWN = [
  'barako', 'pour-over', 'matcha', 'cold-brew',
  'espresso-machine', 'milk-tea', 'halo-halo', 'moka-pot',
  'ube-latte', 'coffee-bean', 'watermelon-shake', 'french-press',
];

const byName = (n) => icons.find((i) => i.name === n);
const tile = (n) =>
  `<div class="tile">${wrap(n, byName(n).body, 88)}</div>`;

const html = `<!doctype html>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: #17100B; color: #FBF6EE;
         display: flex; align-items: center; gap: 56px; padding: 64px 72px;
         font-family: 'Bricolage Grotesque', sans-serif; overflow: hidden; }
  .left { flex: 1 1 0; min-width: 0; }
  .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 17px; letter-spacing: .18em;
             text-transform: uppercase; color: #E5901A; margin-bottom: 22px; }
  h1 { font-weight: 800; font-size: 92px; line-height: .97; letter-spacing: -.03em; }
  .sub { font-size: 27px; font-weight: 600; line-height: 1.35; color: rgba(251,246,238,.74); margin-top: 22px; max-width: 22ch; }
  .meta { font-family: 'JetBrains Mono', monospace; font-size: 19px; color: rgba(251,246,238,.5); margin-top: 34px; }
  .meta b { color: #E5901A; font-weight: 400; }
  .grid { flex: 0 0 464px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .tile { aspect-ratio: 1; display: grid; place-items: center; border-radius: 20px;
          background: rgba(251,246,238,.05); border: 1px solid rgba(251,246,238,.1); }
</style>
<body>
  <div class="left">
    <div class="eyebrow">Filipino for coffee house</div>
    <h1>Kapehan</h1>
    <div class="sub">Thirty-seven hand-drawn coffee icons.</div>
    <div class="meta">MIT &middot; <b>npm i kapehan</b></div>
  </div>
  <div class="grid">${SHOWN.map(tile).join('')}</div>
</body>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
// Without this the card renders in the fallback face on a cold cache.
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

await writeFile(join(root, 'docs/og.png'), png);
console.log(`wrote docs/og.png (${(png.length / 1024).toFixed(1)} kB, 1200x630, ${SHOWN.length} icons)`);
