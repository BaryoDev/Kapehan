<div align="center">
  <img src="icons/barako.svg" width="88" height="88" alt="Kapehan" />
  <h1>Kapehan</h1>
  <p><em>Free, hand-drawn coffee icons. &#9749;</em></p>
  <p>
    <a href="https://www.npmjs.com/package/kapehan"><img src="https://img.shields.io/npm/v/kapehan?style=flat-square&color=E5901A" alt="npm" /></a>
    <img src="https://img.shields.io/badge/icons-37-E5901A?style=flat-square" alt="37 icons" />
    <img src="https://img.shields.io/badge/license-MIT-241A13?style=flat-square" alt="MIT" />
  </p>
  <p><a href="https://baryodev.github.io/Kapehan/"><strong>Browse the set</strong></a></p>
</div>

---

**Kapehan** (Filipino for *coffee house*) is a set of 37 icons for coffee shops. A love letter to Barako. Two tracks ship from the same drawings:

| Folder | Grid | Colour | For |
|---|---|---|---|
| `icons/` | 48&times;48 | full palette | marketing, merch, empty states, hero art |
| `icons/mono/` | 24&times;24 | `currentColor` | UI, favicons, buttons, embroidery, one-colour print |

The mono build is not a separate drawing. It is the same geometry with the highlight layers dropped
and every fill flattened to `currentColor`, so it inherits text colour and size and stays a clean
solid pictogram at 16px. Colour is the recommendation at 24px and up.

## Install

```bash
npm i kapehan
```

## Use

Plain `<img>`, full colour:

```html
<img src="kapehan/icons/latte.svg" width="48" height="48" alt="latte" />
```

Inline mono, inherits text colour and size:

```html
<span style="color:#6F4E37">
  <!-- paste the contents of icons/mono/espresso.svg -->
</span>
```

Web component, no build step. Aliases work, so `cup-cold` finds `cold-brew`:

```html
<script type="module" src="https://unpkg.com/kapehan/kape-icon.js"></script>

<kape-icon name="barako" size="32"></kape-icon>
<kape-icon name="cup-cold" mono></kape-icon>
```

React, via your bundler's SVGR:

```tsx
import Latte from "kapehan/icons/mono/latte.svg";

<Latte className="size-5 text-[#6F4E37]" />;
```

The raw icon data, if you want to build your own component:

```js
import { icons, palette, monoOf, wrap } from "kapehan/kapehan-icons.js";
```

## The system

Every icon draws from one palette and rests on one baseline, so a row of them reads as a family
instead of a pile.

| Token | Hex | Role |
|---|---|---|
| `ink` | `#241A13` | darkest coffee, liquid, knobs |
| `roast` | `#5A3520` | coffee body |
| `brown` | `#8C5A32` | crema, mid brown, wood |
| `crema` | `#D6A164` | light crema, burlap |
| `milk` | `#F5E9D6` | foam, milk |
| `ceramic` | `#F4E8D6` | warm white ceramic |
| `ceramicDeep` | `#DBC5A4` | shadow side of ceramic |
| `barako` | `#E5901A` | brand accent |
| `barakoDeep` | `#BE7008` | accent shadow |
| `clay` | `#C2593A` | terracotta vessel |
| `clayDeep` | `#9E4025` | terracotta shadow |
| `slate` | `#A7B3BA` | metal |
| `slateDeep` | `#77878F` | metal shadow |
| `glass` | `#CBDCE3` | glassware |
| `matcha` | `#7A9B5A` | matcha |
| `matchaLight` | `#94B571` | whisked matcha crema |
| `ube` | `#8E6BA8` | ube |
| `ubeLight` | `#B392C9` | ube milk layer |
| `amber` | `#C08A3E` | brewed tea, salabat |
| `mango` | `#F0B34A` | mango |
| `citrus` | `#D9C63E` | calamansi juice |
| `leaf` | `#8FAF4E` | calamansi rind |
| `melon` | `#DE7286` | watermelon, halo-halo |
| `pandan` | `#A8C486` | buko pandan |

- **Grid**: 48&times;48, 3px optical padding, optically centred on `x=24`.
- **Baseline**: everything rests on `y=42`. Saucer lips at `cy 39.4 / 40.6`.
- **Vessels** pick exactly one of ceramic, clay, barako or slate/glass. A non-coffee drink may introduce ONE hue token of its own (matcha, ube, amber, mango, citrus), held at the same muted chroma so it still sits in a row with the coffee icons. Liquid always runs ink to crema; foam is always milk. Ceramic is deliberately warm-tinted, not white, because pure white ceramic disappears on the light backgrounds these icons actually sit on.
- **Strokes**: steam and drizzle 2px round cap; handles 3 to 3.8px, drawn *behind* the body.
- **Flat fills only**, no outlines, so the artwork survives 16px and screen printing alike.

## Icons

### Drinks

| | Name | Aliases |
|---|---|---|
| <img src="icons/espresso.svg" width="36" height="36" alt="espresso" /> | `espresso` | `shot`, `cup-sm` |
| <img src="icons/americano.svg" width="36" height="36" alt="americano" /> | `americano` | `long-black`, `cup-black` |
| <img src="icons/latte.svg" width="36" height="36" alt="latte" /> | `latte` | `glass-latte`, `cup-tall` |
| <img src="icons/macchiato.svg" width="36" height="36" alt="macchiato" /> | `macchiato` | `cup-marked`, `piccolo` |
| <img src="icons/cappuccino.svg" width="36" height="36" alt="cappuccino" /> | `cappuccino` | `cup-foam`, `capp` |
| <img src="icons/mocha.svg" width="36" height="36" alt="mocha" /> | `mocha` | `cup-choco`, `mochaccino` |
| <img src="icons/barako.svg" width="36" height="36" alt="barako" /> | `barako` | `kapeng-barako`, `cup-barako` |
| <img src="icons/cold-brew.svg" width="36" height="36" alt="cold-brew" /> | `cold-brew` | `iced`, `cup-cold` |
| <img src="icons/tablea.svg" width="36" height="36" alt="tablea" /> | `tablea` | `tsokolate`, `cacao-tablet` |

### Tea & more

| | Name | Aliases |
|---|---|---|
| <img src="icons/tea.svg" width="36" height="36" alt="tea" /> | `tea` | `hot-tea`, `tsaa` |
| <img src="icons/matcha.svg" width="36" height="36" alt="matcha" /> | `matcha` | `green-tea-latte`, `usucha` |
| <img src="icons/salabat.svg" width="36" height="36" alt="salabat" /> | `salabat` | `ginger-tea`, `ginger` |
| <img src="icons/hot-chocolate.svg" width="36" height="36" alt="hot-chocolate" /> | `hot-chocolate` | `cocoa`, `tsokolate-drink` |
| <img src="icons/milk-tea.svg" width="36" height="36" alt="milk-tea" /> | `milk-tea` | `boba`, `pearl-tea` |
| <img src="icons/ube-latte.svg" width="36" height="36" alt="ube-latte" /> | `ube-latte` | `ube`, `purple-yam` |

### Tropical

| | Name | Aliases |
|---|---|---|
| <img src="icons/mango-shake.svg" width="36" height="36" alt="mango-shake" /> | `mango-shake` | `shake`, `smoothie` |
| <img src="icons/buko-juice.svg" width="36" height="36" alt="buko-juice" /> | `buko-juice` | `coconut`, `buko` |
| <img src="icons/calamansi.svg" width="36" height="36" alt="calamansi" /> | `calamansi` | `citrus`, `juice` |
| <img src="icons/halo-halo.svg" width="36" height="36" alt="halo-halo" /> | `halo-halo` | `halohalo`, `shaved-ice` |
| <img src="icons/sago-gulaman.svg" width="36" height="36" alt="sago-gulaman" /> | `sago-gulaman` | `samalamig`, `gulaman` |
| <img src="icons/buko-pandan.svg" width="36" height="36" alt="buko-pandan" /> | `buko-pandan` | `pandan`, `coconut-pandan` |
| <img src="icons/watermelon-shake.svg" width="36" height="36" alt="watermelon-shake" /> | `watermelon-shake` | `pakwan`, `melon-shake` |
| <img src="icons/avocado-shake.svg" width="36" height="36" alt="avocado-shake" /> | `avocado-shake` | `avocado`, `green-shake` |
| <img src="icons/pineapple-juice.svg" width="36" height="36" alt="pineapple-juice" /> | `pineapple-juice` | `pinya`, `pineapple` |

### Vessels

| | Name | Aliases |
|---|---|---|
| <img src="icons/coffee-cup.svg" width="36" height="36" alt="coffee-cup" /> | `coffee-cup` | `takeaway`, `cup-togo` |

### Beans

| | Name | Aliases |
|---|---|---|
| <img src="icons/coffee-bean.svg" width="36" height="36" alt="coffee-bean" /> | `coffee-bean` | `bean` |
| <img src="icons/coffee-sack.svg" width="36" height="36" alt="coffee-sack" /> | `coffee-sack` | `sack`, `beans-bag` |
| <img src="icons/drip-bag.svg" width="36" height="36" alt="drip-bag" /> | `drip-bag` | `sachet`, `drip-sachet` |
| <img src="icons/stamp-card.svg" width="36" height="36" alt="stamp-card" /> | `stamp-card` | `loyalty`, `punch-card` |

### Brewers

| | Name | Aliases |
|---|---|---|
| <img src="icons/french-press.svg" width="36" height="36" alt="french-press" /> | `french-press` | `press`, `plunger` |
| <img src="icons/pour-over.svg" width="36" height="36" alt="pour-over" /> | `pour-over` | `v60`, `dripper` |
| <img src="icons/moka-pot.svg" width="36" height="36" alt="moka-pot" /> | `moka-pot` | `moka`, `stovetop` |
| <img src="icons/aeropress.svg" width="36" height="36" alt="aeropress" /> | `aeropress` | `press-air` |
| <img src="icons/barako-pot.svg" width="36" height="36" alt="barako-pot" /> | `barako-pot` | `palayok`, `clay-pot` |
| <img src="icons/kettle.svg" width="36" height="36" alt="kettle" /> | `kettle` | `gooseneck`, `tea-kettle` |

### Equipment

| | Name | Aliases |
|---|---|---|
| <img src="icons/grinder.svg" width="36" height="36" alt="grinder" /> | `grinder` | `mill`, `gilingan` |
| <img src="icons/espresso-machine.svg" width="36" height="36" alt="espresso-machine" /> | `espresso-machine` | `machine`, `barista-bar` |

## Contributing an icon

[`kapehan-icons.js`](kapehan-icons.js) is the only file you edit. Both SVG tracks, the web
component and the site's data are generated from it:

```bash
npm run build         # regenerate icons/, icons/mono/, kape-icon.js, docs/
npm test              # fails if anything on disk drifted from the source
npm run test:browser  # drives the component and the site in a real browser
npm run serve         # then open http://localhost:4173/docs/
```

`npm test` needs nothing installed. `npm run test:browser` needs `npm ci` and
`npx playwright install chromium` first. CI runs both on every pull request.

Draw on the 48&times;48 grid, rest it on `y=42`, use only palette tokens, and mark any pure-highlight
layer with `data-mono="drop"` so the mono build stays legible. If flattening would cost the icon its
defining feature, add a hand-drawn `monoBody` (see `coffee-bean`, `latte` and `stamp-card`, where the
crease, heart and stamps become negative space via `fill-rule="evenodd"`) and the generator will use
it instead. Add the entry with `name`, `aliases`, `tags` and `category`, run the build, and commit
the generated files with it.

## License

The icons in [`icons/`](icons/) are **MIT**: personal and commercial use, in products and on merch
you sell. No attribution required.

If they earned a spot in something you're proud of, a star on GitHub, a link back, or a share is
always welcome. None of it is required. If you do want to credit it:

```html
Coffee icons by <a href="https://github.com/BaryoDev/Kapehan">Kapehan</a> &middot; MIT
```

**Not** covered: BaryoDev brand assets. The BaryoDev, Kapehan, Barako, barakoCMS, Talaan and
BaryoClub names and logos are &copy; BaryoDev, all rights reserved. See [LICENSE](LICENSE).
