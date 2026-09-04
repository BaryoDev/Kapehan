# The design canvas

These are the source of truth for the look and the content. Everything the site and the
package ship is either generated from here or should be.

| File | Holds |
|---|---|
| `Kapehan.dc.html` | The seven-tab site. `PALETTES` (28), `SHIP` (28 components), `UI_NAV`, `TABS`, `CSS_OPTS`, `FW_OPTS`, `ACCENTS`, and `downloadStarter`. |
| `Kapehan Doodles v2.dc.html` | 18 doodles as inline SVG, keyed by `data-doodle`. |
| `support.js` | Vendored Claude Design runtime. Committed so the canvases open offline; not ours, do not edit. |

Open either file in a browser to view it.

## Why they are here

They existed only in a browser tab. Five roadmap phases read from them, and losing the tab
would have lost 28 palettes, 28 component definitions and 18 drawn doodles with no backup.

## Do not hand-edit generated output

The same rule the icons already follow. If you change a palette or a component here, the
extractor regenerates the data modules and `npm test` fails until the committed output
matches. Never edit the generated file to match the canvas.
