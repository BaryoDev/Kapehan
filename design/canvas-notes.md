# Handoff: Kapehan design-source data layer

For Claude Code, working in `BaryoDev/Kapehan` against `design/Kapehan.dc.html`.

## What this is

Not a design to recreate. This is a **data and coverage change to the design source you
already generate from**. `palettes.json` is extracted from `PALETTES` and drift-gated in
CI; this round makes five more constants extractable the same way and removes the numbers
that nothing produced.

Everything below is already committed in the design file. Your job is to extend the
generator and the CI gate to cover it — no visual work, no restyling. The two `.dc.html`
files in this bundle are the source of truth; read the constants out of them.

## Fidelity

Not applicable in the usual sense — nothing here is a mock. The design file is the
upstream artifact and the shipped visuals are unchanged. One small piece of UI was added
(a props table and an accessibility breakdown inside the "Ship it" card) because the new
per-component data needed a consumer on the site; it uses the existing card, mono-label
and table idioms already in the file.

## The constants, and what each one is for

All six live in `class Component` in `design/Kapehan.dc.html`. Every one is a flat
literal — no computed keys, no spreads, no template strings.

| Constant | Shape | Count | Extract to |
|---|---|---|---|
| `PALETTES` | array of objects | 28 | `palettes.json` (already wired) |
| `SHIP` | object keyed by component id | 30 | `components/*.json` + per-component pages |
| `BLOCKS` | array of objects | 4 | `blocks.json` |
| `PLACEMENT` | array of objects | 6 | `placement.json` |
| `DOODLES` | array of string keys | 24 | `doodles.json`, cross-check against the doodle file |
| `BREW_STEPS` | array of string keys | 5 | the Brew wizard's step list |

### SHIP entry schema

Every one of the 30 entries now carries all nine keys. Previously only `label`, `html`,
`react` and `css` existed.

```ts
type ShipEntry = {
  label: string;      // display name, e.g. "Editable table"
  cat: string;        // UI_NAV group: Actions | Forms | Data | Feedback | Navigation | Overlays
  props: Array<{
    name: string;
    type: string;     // TS-ish source string, e.g. "'primary' | 'default' | 'ghost'"
    default: string;  // literal, or "—" when there is none
    required: boolean;
    description: string;
  }>;
  a11y: {
    roles: string[];  // what the component depends on structurally
    attrs: string[];  // ARIA and native attributes it depends on
    keys: string[];   // the keyboard map
  };
  html: string;       // plain HTML + kape-* classes
  react: string;      // JSX
  vue: string;        // single-file component, <script setup>
  blazor: string;     // .razor with @code block
  css: string;        // the component's slice of kapehan.css
};
```

104 props documented across the 30 entries. `props` and `a11y` are what the
per-component pages should render; the site now renders both, so you have a reference
implementation to match.

### The 30 components

```
Actions      button, chip, seg, switch
Forms        input, check, select, stepper, upload, combo, multi, range
Data         row, card, table, edit, tag, skeleton, acc
Feedback     toast, stamps, dialog, progress
Navigation   tabs, crumbs, avatar, tip, pager
Overlays     drawer, cmdk
```

Two are new this round: `multi` (multi-select) and `stamps` (the loyalty punch card,
which was in kapehan.css but had no entry and could not be copied from the site).

### BLOCKS entry schema

```ts
type Block = {
  key: string;       // menu | order | login | dash
  label: string;
  note: string;
  cat: string;       // Storefront | Account | Back of house
  surface: string;   // web | ios
  uses: string[];    // SHIP keys this screen is assembled from
  api: string;       // the Barako route it maps to
  html: string;
};
```

The device mockups on the Blocks tab stay as live renders, deliberately — they are
previews in the same sense as `shipPreview`, not copyable source. `html` is the
copyable artifact for each of the four screens.

### PLACEMENT entry schema

```ts
type Rule = { key: string; num: string; kicker: string; title: string; body: string };
```

The Placement tab renders entirely from this now. Six rules.

## Counts: one source, no literals

`tabCounts()` on `Component` is the only place any count is produced:

```js
{
  create:   BREW_STEPS.length,          // 05
  icons:    <loaded icon module>.length, // 42, async — renders '··' until the module lands
  doodles:  DOODLES.length,             // 24
  palettes: PALETTES.length,            // 28
  ui:       Object.keys(SHIP).length,   // 30
  blocks:   BLOCKS.length,              // 04
  place:    PLACEMENT.length,           // 06
}
```

It feeds the tab strip, the footer line and the Placement intro sentence. `TABS` is now
`[key, label]` pairs — the count that used to be its third element is gone.

**The "61 components" claim is gone.** Nothing produced it: SHIP had 28, UI_NAV had 22
anchors, kapehan.css had 34 families, rendered examples came to about 41. It now reads 30,
derived. Worth stating plainly in case it appears in README copy or marketing on your
side: the honest number is 30.

**Suggested CI gate**, matching the palettes one:
- `Object.keys(SHIP).length` equals the components count in any generated docs
- every SHIP entry has all nine keys, and `cat` is one of the six UI_NAV groups
- every class family in kapehan.css appears in at least one entry's `css`
- `DOODLES.length` equals the `data-doodle` node count in `Kapehan Doodles v2.dc.html`
- every `BLOCKS[].uses` entry is a real SHIP key

## Two extraction traps

**1. `</script>` is escaped in the snippet strings.** The Vue snippets contain a real
`</script>` closing tag, which terminates the design file's own script block and breaks
the page. It is written as `<\/script>` in source. When you pull `vue` (or `html`,
`react`, `blazor`) out to disk, unescape it:

```js
snippet.replace(/<\\\//g, '</')
```

**2. The Vue snippets use `v-text` instead of `{{ }}`.** Deliberate: the design file is
itself a template using the same delimiters, so mustaches inside it are a live hazard.
The snippets are valid, idiomatic Vue as-is. If you want mustaches in the published
components, transform on the way out — do not put them back in the design source. This is
the same class of problem as the `Sago't gulaman` palette name that broke the first
extractor: prefer double quotes, keep every constant a flat literal, and do not write data
that a regex has to disentangle later.

## Doodles

`Kapehan Doodles v2.dc.html` now has 24 `data-doodle` nodes, up from 18. New:
`cashier`, `reading-alone`, `latte-art`, `closing-up`, `beans-roasting`,
`cup-pandesal`. Same treatment as the existing 18 — keyed by `data-doodle`, accent via
`--acc`, animation via `--anim` with `animation-play-state`, hatching via
`--hatch-op`, and a `prefers-reduced-motion` still. Each has a `<g id="dd-*">` so it
can be referenced with `<use>`, which is how the in-page phone and browser mockups pull
them in.

Six wide café scenes (640×400) and twelve square states (400×400) plus the six earlier
app/web states.

## kapehan.css

Two additions, both inside existing families so the stylesheet does not fork:

- `.kape-sr` — the visually hidden utility. The new snippets rely on it for live counts,
  table captions and status lines. If you already have an `sr-only` in the consuming app,
  map to it rather than shipping both.
- four `.kape-combo` rules — `__field[tabindex]`, its `:focus-visible`, `__hint`,
  and `li[aria-disabled="true"]` — which multi-select needs.

`.kape-stamps` was already there and is unchanged; it just has an entry now.

## Starter zips

The Vue and Blazor starters previously generated their components by regex-transforming
the HTML snippet. They now emit `SHIP.row.vue` and `SHIP.row.blazor` directly.
`toVue()` and `toRazor()` are deleted. If your CLI has equivalents, delete those too and
read the authored fields.

## Blazor prerender

`dialog`, `drawer` and `cmdk` are the only entries touching `IJSRuntime`, and only for
`showModal`/`close`/`focus`, which have no managed equivalent. Each guards interop
behind a flag set in `OnAfterRenderAsync(firstRender)`, so server prerender never calls
it. The interop shim they expect:

```js
// wwwroot/kapehan.interop.js
window.kapehan = window.kapehan || {};
window.kapehan.dialog = { show: (el) => el.showModal(), close: (el) => el.close() };
window.kapehan.focus = (el) => el.focus();
export function showModal(el) { el.showModal(); }
export function closeModal(el) { el.close(); }
export function focus(el) { el.focus(); }
export function bindHotkey(ref, key) {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key) {
      e.preventDefault();
      ref.invokeMethodAsync('Toggle');
    }
  });
}
```

`cmdk` uses the module form (`IJSObjectReference`); `dialog` and `drawer` use the
`window.kapehan.*` globals. Ship both surfaces or normalise them — your call, but the
snippets are what the site hands users, so whatever you pick should match them.

## Files in this bundle

- `Kapehan.dc.html` — the design source. All six constants, the props table UI, `tabCounts()`.
- `Kapehan Doodles v2.dc.html` — 24 doodles.
- `kapehan.css` — the stylesheet, with the two additions above.
- `ship-schema.json` — the SHIP/BLOCKS/PLACEMENT schemas as JSON Schema, if you want to validate in CI.

## What is not done

From `NEXT_STEPS.md`, untouched by this round: the npm publish, the CLI itself, real
Vue/Blazor component files in the repo (the snippets are authored, but nothing writes them
to `src/` yet), doodles as standalone files and a custom element, Tailwind and Bootstrap
variants, GitHub Pages deploy, and the BarakoCMS typed client.
