# Next steps for Kapehan

Kapehan is the front-end starter for BarakoCMS: someone with no design experience picks a
palette and a stack here, downloads a starter, points it at their Barako API, and gets a
front end that looks designed.

The design canvas (`Kapehan.dc.html`) is the source of truth for the look and the content.
Everything below is the engineering that turns it into a real, installable product. Build in
order; each phase is shippable on its own.

## What exists today

| Thing | State |
|---|---|
| `kapehan-icons.js` | 42 icons, 8 categories, one palette, colour + `currentColor` mono. Real, in this repo. |
| `icons/`, `icons/mono/` | Generated from the source above by `npm run build`. Real. |
| `kapehan.css` | Token-driven component CSS (`.kape-*`). Real, hand-maintained, in this repo. |
| `kape-icon.js` | `<kape-icon>` web component with alias lookup. Real. |
| npm package | **Real.** `kapehan` is published: 0.2.0 on 2026-09-03, 0.3.0 adds the desserts and the CSS. Ships icons, both tracks, the web component, the icon source and `kapehan.css`. |
| Public site | `docs/index.html`, live at baryodev.github.io/Kapehan. The icons-only browser, not the 7-tab design. |
| `Kapehan.dc.html` | The full site: Brew, Icons, Doodles, Palettes (28), Components (61), Blocks, Placement. **In the design canvas only, not in this repo.** |
| `Kapehan Doodles v2.dc.html` | 18 doodles (6 scenes, 12 states), inline SVG only. **Not yet exported as files.** |
| Starter zip download | Generated in-browser by the design canvas. **Not in this repo.** |
| `npx kapehan create`, NuGet package | **Described on the site, do not exist.** |
| Vue + Blazor component logic | **Generated from HTML; state is a stub.** |
| Tailwind + Bootstrap | **Token bridge only; markup is not utility classes.** |

> The rows above are checked against the registry and this repo, not copied forward. If you
> edit this file, re-check rather than assume: an earlier revision claimed the npm package did
> not exist for a day after it was published.

## Phase 1: finish the package

`npm i kapehan` works today and gives you icons, the web component and `kapehan.css`. What is
still missing is everything a *starter kit* needs.

**Remaining delta:**

```
kapehan/
  palettes.json         all 28 palettes with the 5 roles + the `use` badge   [missing]
  doodles/*.svg         18, see phase 4                                      [missing]
  react/index.js        the SHIP components as real React                    [missing]
  vue/index.js          the SHIP components as real Vue SFCs                 [missing]
```

- `palettes.json` must be generated from `Component.PALETTES` in `Kapehan.dc.html`, not
  retyped. Write a small extractor so the canvas stays the source of truth. The icons already
  work this way; match that.
- `react/` and `vue/` depend on phase 3.

**Definition of done:** in a blank Vite app, `npm i kapehan`, import the CSS and
`kape-icon.js`, paste any HTML snippet from Ship it, and it looks exactly like the canvas.

## Phase 2: the CLI

`npx kapehan create` is the promise that makes Kapehan feel like a product rather than a
gallery.

```
npx kapehan create [dir]
  --palette   <key>        one of the 28 (barako default)
  --edges     rounded|square
  --font      instrument|bricolage|newsreader|...
  --icons     colour|mono
  --css       kapehan|tailwind|bootstrap
  --framework html|react|vue|blazor
  --api       <barako api url>
  --yes                    skip prompts
```

- With no flags, run an interactive prompt with the same five questions as the Brew tab, in
  the same order, with the same defaults.
- Read/write `kapehan.json` so a project can be re-themed later with
  `npx kapehan theme --palette ube`.
- Output per framework must match the starter zips the canvas already generates. **Port
  `downloadStarter` out of `Kapehan.dc.html` into the CLI** so there is one template set, then
  have the canvas call the same templates. Do not maintain two.
- `npx kapehan add <component>` copies one component into the project in the chosen framework,
  shadcn-style. Needs phase 3 first.

**Definition of done:** `npx kapehan create shop --palette kraft --framework react --yes`
produces a Next.js app that runs, renders a menu from a Barako endpoint, and matches Kraft.

## Phase 3: real components, not generated markup

Today Vue and Blazor markup is derived from the HTML snippet in SHIP. Anything with state
(combobox, multi-select, drawer, command palette, editable table, date range picker) ships a
stub `ref` / `@code` block, not working logic. React is the only one written by hand.

For each of the 61 components, state-heavy first:

1. **Vue**: `components/kape/*.vue`, `<script setup>`, `defineProps` for the Barako item
   shape, `ref` state, `@keydown` for combobox and command palette, `v-model` on inputs.
2. **Blazor**: `Kapehan.Components/*.razor`, `[Parameter]`, `EventCallback`, `@bind`,
   `IJSRuntime` only where `<dialog>.showModal()` is needed.
3. **React**: promote the existing snippets to real files with props and keyboard handling.

Rules that must hold across all three:

- Identical class names to `kapehan.css`. The CSS never forks per framework.
- Keyboard and ARIA parity: combobox (`role="combobox"`, arrows, Enter, Escape), command
  palette (⌘K, arrows, Enter), drawer (focus trap, Escape), date range (arrow keys).
- No component imports a colour. Everything reads `var(--accent)` and friends. `npm test`
  already enforces this for the CSS; extend it to the components.

**Definition of done:** an accessibility pass (keyboard only, then screen reader) on the six
state-heavy components in all three frameworks.

## Phase 4: export the doodles

The 18 doodles only exist as inline SVG inside `Kapehan Doodles v2.dc.html`.

- Write a generator that extracts each `<svg>` by `data-doodle`, inlines the current palette,
  and writes `doodles/<name>.svg` (animated) and `doodles/still/<name>.svg` (motion stripped,
  for print and email).
- Same treatment as icons: one source, generated files, committed, drift-checked by `npm test`.
- Draw the remaining 6 of the original 24: cashier, reading alone, latte art pour, closing up
  shop, beans roasting, cup with pandesal.
- Add a `<kape-doodle name="loading">` element alongside `<kape-icon>`, honouring `--acc`,
  `--anim` and `prefers-reduced-motion`.

## Phase 5: Tailwind and Bootstrap for real

Currently a token bridge: `@theme` and `_kapehan.scss` map the five palette roles so `.kape-*`
works inside those stacks, but the markup is not utility classes, which is what Tailwind users
actually want.

- Add a `tw` variant per SHIP entry: same DOM, utilities instead of `.kape-*`
  (`bg-accent text-paper rounded-kape border border-line`).
- Add a `bs` variant using Bootstrap classes where an equivalent exists (`.btn.btn-primary`,
  `.form-control`, `.card`) and `.kape-*` where it does not.
- Ship it switches the markup tab to these automatically when the stack is Tailwind or
  Bootstrap (the switch already exists; it just needs the variants).
- Publish `@kapehan/tailwind` as a preset so `--color-accent` and `rounded-kape` come from one
  place.

## Phase 6: the public site

- Replace `docs/index.html` (the icons-only page) with a port of `Kapehan.dc.html`: all seven
  tabs, the Components sidebar, Brew, Ship it, the starter download. There is one Kapehan page;
  the old one is retired, not kept alongside.
- The current page already carries an audit pass: fluid type, mobile nav, `:focus-visible`,
  `prefers-reduced-motion`, `og:image`, SRI on the CDN script, WCAG AA links, and a `noscript`
  fallback. **Carry every one of those across rather than rediscovering them.** The Playwright
  suite in `tests/` asserts them; keep it green.
- One page per component with a props table, shadcn-style, generated from the component source
  rather than written by hand.
- Keep the canvas as the content source: palettes, icon list, component list and starter
  templates all read from the same modules the package ships.

## Phase 7: Barako integration

This is what separates Kapehan from a generic UI kit.

- A tiny typed client (`@kapehan/barako`) for the endpoints the Blocks assume: menu,
  categories, orders, branches, loyalty.
- Map Barako content types to Kapehan components: a `MenuItem` renders as a menu row or a
  drink card; a `Page` renders as a Block. Document the shape each component expects.
- A BarakoCMS starter template that ships with Kapehan preselected, so "new Barako project"
  gives a working storefront on the first run.

## Non-goals

- No component framework of our own. Plain CSS classes plus thin per-framework wrappers.
- No design freedom beyond the five tokens, the edges switch and the type pairing. The point is
  that a non-designer cannot make it ugly.
- No icon requests outside the coffee-shop world. It stays a coffee house.
