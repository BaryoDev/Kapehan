# Next steps for Kapehan

Kapehan is a UI resource site. It gives you **palettes, icons, components and doodles**, and
nothing else. You browse it, take what you want, and paste it into whatever you are building.

It is a static site on GitHub Pages at <https://baryodev.github.io/Kapehan/>, plus an npm
package for the people who would rather install than copy. It does not talk to a backend, it
does not ship a client for any CMS, and it does not care what you build with it.

The design canvas (`Kapehan.dc.html`) is the source of truth for the look and the content.
Everything below is the engineering that turns it into a real, installable resource.

## What we are building next

In priority order:

1. **The site.** The seven-tab browser: Brew, Icons, Doodles, Palettes, Components, Blocks,
   Placement. Today `docs/index.html` is the icons-only page.
2. **JSX.** Real React components, not markup generated from an HTML snippet.
3. **Blazor.** The same components as `.razor`, with the state machines ported to C#. The
   `Kapehan.Components.csproj` lives **in this repo** and ships as a NuGet package, so Kapehan
   has two release channels: npm for the web, NuGet for .NET.
4. **Theming.** The 28 palettes as data, so picking one retints icons, components and doodles
   together.

Then the CLI (phase 2) and the Tailwind and Bootstrap variants (phase 5). Both are wanted;
they are sequenced after the four, not cut.

## What exists today

| Thing | State |
|---|---|
| `kapehan-icons.js` | 42 icons, 8 categories, one palette, colour + `currentColor` mono. Real, in this repo. |
| `icons/`, `icons/mono/` | Generated from the source above by `npm run build`. Real. |
| `kapehan.css` | Token-driven component CSS: 65 selectors across 34 component families. Real, hand-maintained. |
| `kape-icon.js` | `<kape-icon>` web component with alias lookup. Real. |
| npm package | **Real.** `kapehan` is published: 0.2.0 on 2026-09-03, 0.3.0 adds the desserts and the CSS. |
| Public site | `docs/index.html`, deployed to GitHub Pages by `.github/workflows/pages.yml`. The icons-only browser. |
| `Kapehan.dc.html` | The full seven-tab site. **In the design canvas only, not in this repo.** |
| `Kapehan Doodles v2.dc.html` | 18 doodles (6 scenes, 12 states), inline SVG only. **Not yet exported as files.** |
| Palettes | 28 of them, in the canvas. **Not extracted as data.** |
| React, Vue, Blazor components | **None exist.** `git ls-files` matching `.jsx .tsx .vue .razor .cs` returns nothing. |
| Tailwind + Bootstrap | **Token bridge only; markup is not utility classes.** |

> The rows above are checked against the registry and this repo, not copied forward. If you
> edit this file, re-check rather than assume: an earlier revision claimed the npm package did
> not exist for a day after it was published, and described Kapehan as a CMS starter kit, which
> it is not.

## Phase 1: finish the package surface

`npm i kapehan` works today and gives you icons, the web component and `kapehan.css`. What is
still missing is the theming data and the framework entries.

```
kapehan/
  palettes.json           all 28 palettes with the 5 roles + the `use` badge   [SHIPPED]
  react/icons, react/components   the components as real React                [missing, phase 3]
  vue/icons,   vue/components     the components as real Vue                  [missing, phase 3]
  package.json export     some bundlers deep-import it                        [missing]
  types                   .d.ts for the entries                               [missing]
```

- `palettes.json` is **done**: `scripts/palettes.mjs` extracts it from `PALETTES` in the
  canvas, `npm run build` emits it, and `npm test` fails if the committed file drifts. Nobody
  retypes a hex. Copy that shape for the component and doodle extractors.
- Framework entries use **split subpaths**: `kapehan/react/icons` and `kapehan/react/components`,
  same for vue. One generator per file, no overwrite risk, and importing icons does not drag in
  30 components.
- Theming as a whole is still open: applying a palette across components and doodles, and the
  contrast problem in the shipped palette data.
- The doodles are **not** part of this phase. They are phase 4, which owns the motion decision.

**Definition of done:** in a blank Vite app, `npm i kapehan`, import the CSS and
`kape-icon.js`, paste any snippet from Ship it, and it looks exactly like the site.

## Phase 2: the CLI

Sequenced after the four above, but wanted.

`npx kapehan create` scaffolds a project already wired to a palette, a font pairing and an
icon track, so someone can start from a themed page instead of an empty one.

```
npx kapehan create [dir]
  --palette   <key>        one of the 28 (barako default)
  --edges     rounded|square
  --font      instrument|bricolage|newsreader|...
  --icons     colour|mono
  --css       kapehan|tailwind|bootstrap
  --framework html|react|vue|blazor
  --yes                    skip prompts
```

- With no flags, run an interactive prompt with the same questions as the Brew tab, in the same
  order, with the same defaults.
- Read/write `kapehan.json` so a project can be re-themed later with
  `npx kapehan theme --palette ube`.
- Output per framework must match the starter zips the canvas already generates. **Port
  `downloadStarter` out of `Kapehan.dc.html` into the CLI** so there is one template set, then
  have the canvas call the same templates. Do not maintain two.

**Definition of done:** `npx kapehan create shop --palette kraft --framework react --yes`
produces an app that runs and matches the Kraft palette.

## Phase 3: real components (JSX and Blazor)

This is priority 2 and 3. Today Vue and Blazor markup is derived from the HTML snippet in SHIP.
Anything with state (combobox, multi-select, drawer, command palette, editable table, date
range picker) ships a stub, not working logic.

For each of the 34 component families, state-heavy first:

1. **React**: real files with props and keyboard handling. This is the priority.
2. **Blazor**: `Kapehan.Components/*.razor`, `[Parameter]`, `EventCallback`, `@bind`,
   `IJSRuntime` only where `<dialog>.showModal()` is needed. The six state machines have to be
   ported to C#; they cannot reuse the JS ones.

   **Packaging, decided:** `Kapehan.Components.csproj` is a Razor class library living in this
   repo, published to NuGet. It ships `kapehan.css` and the SVGs under `wwwroot/`, so consumers
   reference `_content/Kapehan.Components/kapehan.css`. That means a second release channel and
   a `dotnet build` leg in CI, neither of which exists today. The npm and NuGet versions must be
   driven from one place or they drift, the same problem the icons already solved.
3. **Vue**: `<script setup>`, `defineProps`, `ref` state, `v-model`. Lowest of the three.

Rules that must hold across all of them:

- Identical class names to `kapehan.css`. The CSS never forks per framework.
- Keyboard and ARIA parity: combobox (`role="combobox"`, arrows, Enter, Escape), command
  palette, drawer (focus trap, Escape), date range (arrow keys).
- No component imports a colour. Everything reads `var(--accent)` and friends. `npm test`
  already enforces this for the CSS; extend it to the components.

**Definition of done:** an accessibility pass (keyboard only, then screen reader) on the six
state-heavy components in React and Blazor.

## Phase 4: export the doodles

Doodles are one of the four things the site gives you, and they only exist as inline SVG inside
`Kapehan Doodles v2.dc.html`.

- Write a generator that extracts each `<svg>` by `data-doodle`, inlines the current palette,
  and writes `doodles/<name>.svg` (animated) and `doodles/still/<name>.svg` (motion stripped,
  for print and email).
- Same treatment as icons: one source, generated files, committed, drift-checked by `npm test`.
- Draw the remaining 6 of the original 24: cashier, reading alone, latte art pour, closing up
  shop, beans roasting, cup with pandesal.
- Add a `<kape-doodle name="loading">` element alongside `<kape-icon>`, honouring `--acc`,
  `--anim` and `prefers-reduced-motion`.

## Phase 5: Tailwind and Bootstrap

Sequenced after the four above, but wanted. Most people asking for a component kit want
utility classes, not another stylesheet.

Currently a token bridge: `@theme` and `_kapehan.scss` map the five palette roles so `.kape-*`
works inside those stacks, but the markup is not utility classes, which is what Tailwind users
actually want.

- Add a `tw` variant per SHIP entry: same DOM, utilities instead of `.kape-*`.
- Add a `bs` variant using Bootstrap classes where an equivalent exists.
- Publish `@kapehan/tailwind` as a preset so `--color-accent` and `rounded-kape` come from one
  place.

## Phase 6: the site

This is priority 1.

- Replace `docs/index.html` (the icons-only page) with a port of `Kapehan.dc.html`: all seven
  tabs, the Components sidebar, Brew, Ship it, the starter download. There is one Kapehan page;
  the old one is retired, not kept alongside.
- The current page already carries an audit pass: fluid type, mobile nav, `:focus-visible`,
  `prefers-reduced-motion`, `og:image`, SRI on the CDN script, WCAG AA links, and a `noscript`
  fallback. **Carry every one of those across rather than rediscovering them.** The Playwright
  suite in `tests/` asserts them; keep it green.
- One page per component with a props table, generated from the component source rather than
  written by hand.
- Keep the canvas as the content source: palettes, icon list, component list and starter
  templates all read from the same modules the package ships.
- It stays a static site on GitHub Pages. No server, no API, no build service.

## Non-goals

- **No backend, and no CMS coupling.** Kapehan is a resource site. It does not ship a client
  for BarakoCMS or anything else, and no component fetches data. If you want to render a menu,
  that is your app's job; Kapehan gives you the row component and the icon.
- No component framework of our own. Plain CSS classes plus thin per-framework wrappers.
- No design freedom beyond the five tokens, the edges switch and the type pairing. The point is
  that a non-designer cannot make it ugly.
- No icon requests outside the coffee-shop world. It stays a coffee house.
