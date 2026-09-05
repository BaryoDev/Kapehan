/**
 * Kapehan component manifest: 30 components.
 *
 * GENERATED from design/Kapehan.dc.html by scripts/components.mjs. Do not edit by hand;
 * edit the canvas and run `npm run build`. npm test fails if this drifts.
 *
 * Each entry carries the markup the package actually ships, plus the props table and the
 * accessibility contract, so every generator and the docs read one source.
 *
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
export const categories = ["Actions","Forms","Data","Feedback","Navigation","Overlays"];

export const components = [
  {
    "key": "button",
    "label": "Button",
    "cat": "Actions",
    "props": [
      {
        "name": "label",
        "type": "string",
        "default": "Order now",
        "required": true,
        "description": "Text inside the button"
      },
      {
        "name": "variant",
        "type": "'primary' | 'default' | 'ghost'",
        "default": "default",
        "required": false,
        "description": "Fill treatment"
      },
      {
        "name": "icon",
        "type": "string | null",
        "default": "null",
        "required": false,
        "description": "Kapehan icon name shown before the label"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "default": "false",
        "required": false,
        "description": "Blocks pointer and keyboard activation"
      },
      {
        "name": "onClick",
        "type": "() => void",
        "default": "—",
        "required": false,
        "description": "Fired on activation"
      }
    ],
    "a11y": {
      "roles": [
        "Native button element, no role override needed"
      ],
      "attrs": [
        "disabled",
        "aria-busy on a submitting button",
        "aria-label when the button is icon-only"
      ],
      "keys": [
        "Enter or Space activates",
        "Tab moves in and out"
      ]
    },
    "html": "<button class=\"kape-btn kape-btn--primary\">\n  <kape-icon name=\"coffee-cup\" size=\"20\"></kape-icon>\n  Order now\n</button>\n<button class=\"kape-btn\">Deliver</button>\n<button class=\"kape-btn kape-btn--ghost\">Cancel</button>",
    "react": "import { KapeIcon } from 'kapehan/react';\n\n<button className=\"kape-btn kape-btn--primary\">\n  <KapeIcon name=\"coffee-cup\" size={20} />\n  Order now\n</button>\n<button className=\"kape-btn\">Deliver</button>",
    "css": ".kape-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px; font: inherit; font-size: 14px; font-weight: 600; line-height: 1; color: var(--ink); background: var(--surface); border: 1.5px solid var(--line-strong); border-radius: var(--pill); cursor: pointer; }\n.kape-btn--primary { background: var(--accent); color: var(--on-accent); border-color: transparent; }\n.kape-btn--ghost { background: transparent; border-color: transparent; color: var(--muted); }"
  },
  {
    "key": "chip",
    "label": "Chips",
    "cat": "Actions",
    "props": [
      {
        "name": "options",
        "type": "string[]",
        "default": "[]",
        "required": true,
        "description": "Chip labels"
      },
      {
        "name": "modelValue",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "Selected label"
      },
      {
        "name": "onChange",
        "type": "(value: string) => void",
        "default": "—",
        "required": true,
        "description": "Fired with the newly pressed chip"
      }
    ],
    "a11y": {
      "roles": [
        "Each chip is a button; the group needs no role"
      ],
      "attrs": [
        "aria-pressed reflects selection on every chip, not just the selected one"
      ],
      "keys": [
        "Tab steps through chips",
        "Enter or Space presses one"
      ]
    },
    "html": "<button class=\"kape-chip\" aria-pressed=\"true\">All</button>\n<button class=\"kape-chip\">Hot</button>\n<button class=\"kape-chip\">Iced</button>",
    "react": "const [pick, setPick] = useState('All');\n\n{['All', 'Hot', 'Iced'].map((c) => (\n  <button key={c} className=\"kape-chip\"\n    aria-pressed={pick === c} onClick={() => setPick(c)}>{c}</button>\n))}",
    "css": ".kape-chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; font: inherit; font-size: 13px; font-weight: 500; color: var(--muted); background: var(--surface); border: 1px solid var(--line); border-radius: var(--pill); cursor: pointer; }\n.kape-chip[aria-pressed=\"true\"] { background: var(--ink); color: var(--paper); border-color: var(--ink); }"
  },
  {
    "key": "input",
    "label": "Input",
    "cat": "Forms",
    "props": [
      {
        "name": "modelValue",
        "type": "string",
        "default": "\"\"",
        "required": true,
        "description": "Field value"
      },
      {
        "name": "placeholder",
        "type": "string",
        "default": "Search the menu",
        "required": false,
        "description": "Empty-state hint"
      },
      {
        "name": "icon",
        "type": "string | null",
        "default": "grinder",
        "required": false,
        "description": "Leading Kapehan icon"
      },
      {
        "name": "type",
        "type": "string",
        "default": "search",
        "required": false,
        "description": "Native input type"
      }
    ],
    "a11y": {
      "roles": [
        "Wrapping label makes the icon and field one hit target"
      ],
      "attrs": [
        "A visible label or aria-label is required",
        "aria-describedby for hint or error text"
      ],
      "keys": [
        "Tab focuses the field; the wrapper takes the focus ring via :focus-within"
      ]
    },
    "html": "<label class=\"kape-input\">\n  <kape-icon name=\"grinder\" size=\"18\"></kape-icon>\n  <input type=\"search\" placeholder=\"Search the menu\">\n</label>",
    "react": "<label className=\"kape-input\">\n  <KapeIcon name=\"grinder\" size={18} />\n  <input type=\"search\" placeholder=\"Search the menu\"\n    value={q} onChange={(e) => setQ(e.target.value)} />\n</label>",
    "css": ".kape-input { display: flex; align-items: center; gap: 10px; padding: 11px 14px; font: inherit; font-size: 14px; color: var(--ink); background: var(--surface); border: 1.5px solid var(--line); border-radius: var(--radius-sm); }\n.kape-input:focus-within { border-color: var(--accent); }\n.kape-input input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; font: inherit; color: inherit; }"
  },
  {
    "key": "seg",
    "label": "Segmented",
    "cat": "Actions",
    "props": [
      {
        "name": "options",
        "type": "string[]",
        "default": "[]",
        "required": true,
        "description": "Segment labels, two or three"
      },
      {
        "name": "modelValue",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "Selected segment"
      },
      {
        "name": "onChange",
        "type": "(value: string) => void",
        "default": "—",
        "required": true,
        "description": "Fired with the picked segment"
      }
    ],
    "a11y": {
      "roles": [
        "role=\"group\" on the wrapper with an aria-label naming the choice"
      ],
      "attrs": [
        "aria-pressed on each segment"
      ],
      "keys": [
        "Tab into the group, Enter or Space to pick",
        "Arrow keys are not bound; segments are buttons, not a radiogroup"
      ]
    },
    "html": "<div class=\"kape-seg\" role=\"group\">\n  <button aria-pressed=\"true\">Pick up</button>\n  <button>Deliver</button>\n</div>",
    "react": "<div className=\"kape-seg\" role=\"group\">\n  {['Pick up', 'Deliver'].map((m) => (\n    <button key={m} aria-pressed={mode === m}\n      onClick={() => setMode(m)}>{m}</button>\n  ))}\n</div>",
    "css": ".kape-seg { display: inline-flex; padding: 3px; gap: 2px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--pill); }\n.kape-seg button { padding: 7px 14px; font: inherit; font-size: 13px; font-weight: 500; color: var(--muted); background: none; border: 0; border-radius: var(--radius-xs); cursor: pointer; }\n.kape-seg button[aria-pressed=\"true\"] { background: var(--ink); color: var(--paper); font-weight: 600; }"
  },
  {
    "key": "toast",
    "label": "Toast",
    "cat": "Feedback",
    "props": [
      {
        "name": "message",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "One sentence, no title"
      },
      {
        "name": "tone",
        "type": "'info' | 'warn'",
        "default": "info",
        "required": false,
        "description": "Ink fill or accent outline"
      },
      {
        "name": "actionLabel",
        "type": "string | null",
        "default": "null",
        "required": false,
        "description": "Optional single action"
      },
      {
        "name": "timeout",
        "type": "number",
        "default": "6000",
        "required": false,
        "description": "Auto-dismiss delay in ms; 0 keeps it open"
      }
    ],
    "a11y": {
      "roles": [
        "role=\"status\" for info, role=\"alert\" for warn"
      ],
      "attrs": [
        "aria-live is implied by the role; never set both",
        "The action must be reachable before auto-dismiss, so warn toasts do not time out"
      ],
      "keys": [
        "Tab reaches the action while the toast is mounted"
      ]
    },
    "html": "<div class=\"kape-toast\" role=\"status\">\n  <kape-icon name=\"coffee-cup\" size=\"20\"></kape-icon>\n  <span class=\"kape-toast__text\">Order #2381 is being made</span>\n  <button class=\"kape-toast__action\">View</button>\n</div>\n<div class=\"kape-toast kape-toast--warn\" role=\"alert\">\n  <kape-icon name=\"coffee-bean\" size=\"18\"></kape-icon>\n  <span class=\"kape-toast__text\">Card declined. Try another or pay at the counter.</span>\n</div>",
    "react": "<div className=\"kape-toast\" role=\"status\">\n  <KapeIcon name=\"coffee-cup\" size={20} />\n  <span className=\"kape-toast__text\">{message}</span>\n  <button className=\"kape-toast__action\" onClick={onView}>View</button>\n</div>",
    "css": ".kape-toast { display: flex; align-items: center; gap: 12px; padding: 12px 14px; font-size: 13.5px; color: var(--paper); background: var(--ink); border-radius: var(--radius-sm); }\n.kape-toast--warn { color: var(--ink); background: var(--surface); border: 1.5px solid var(--accent); }\n.kape-toast > kape-icon { color: var(--pop); flex-shrink: 0; }\n.kape-toast--warn > kape-icon { color: var(--accent); }\n.kape-toast__text { flex: 1; min-width: 0; }\n.kape-toast__action { font-size: 12.5px; font-weight: 600; opacity: .8; background: none; border: 0; color: inherit; cursor: pointer; }"
  },
  {
    "key": "stamps",
    "label": "Stamp card",
    "cat": "Feedback",
    "props": [
      {
        "name": "total",
        "type": "number",
        "default": "10",
        "required": true,
        "description": "Punches on the card"
      },
      {
        "name": "filled",
        "type": "number",
        "default": "0",
        "required": true,
        "description": "Punches earned"
      },
      {
        "name": "label",
        "type": "string",
        "default": "Loyalty card",
        "required": false,
        "description": "Accessible name for the card"
      },
      {
        "name": "icon",
        "type": "string",
        "default": "coffee-bean",
        "required": false,
        "description": "Glyph drawn in a filled slot"
      }
    ],
    "a11y": {
      "roles": [
        "The card is a group; each slot is a span, never a button — the user does not punch it"
      ],
      "attrs": [
        "role=\"group\" with aria-label naming the reward",
        "aria-hidden on every slot, plus one visually hidden sentence carrying the real count",
        "data-on marks a filled slot for CSS; do not rely on colour alone, filled slots also carry the bean glyph"
      ],
      "keys": [
        "Not focusable; it is a readout, not a control"
      ]
    },
    "html": "<div class=\"kape-stamps\" role=\"group\" aria-label=\"Tenth cup free\">\n  <span data-on aria-hidden=\"true\"><kape-icon name=\"coffee-bean\" size=\"16\"></kape-icon></span>\n  <span data-on aria-hidden=\"true\"><kape-icon name=\"coffee-bean\" size=\"16\"></kape-icon></span>\n  <span data-on aria-hidden=\"true\"><kape-icon name=\"coffee-bean\" size=\"16\"></kape-icon></span>\n  <span data-on aria-hidden=\"true\"><kape-icon name=\"coffee-bean\" size=\"16\"></kape-icon></span>\n  <span data-on aria-hidden=\"true\"><kape-icon name=\"coffee-bean\" size=\"16\"></kape-icon></span>\n  <span data-on aria-hidden=\"true\"><kape-icon name=\"coffee-bean\" size=\"16\"></kape-icon></span>\n  <span data-on aria-hidden=\"true\"><kape-icon name=\"coffee-bean\" size=\"16\"></kape-icon></span>\n  <span aria-hidden=\"true\"></span>\n  <span aria-hidden=\"true\"></span>\n  <span aria-hidden=\"true\"></span>\n</div>\n<p class=\"kape-sr\">7 of 10 stamps earned</p>",
    "react": "export function KapeStamps({ total = 10, filled = 0, label = \"Loyalty card\" }) {\n  return (\n    <>\n      <div className=\"kape-stamps\" role=\"group\" aria-label={label}>\n        {Array.from({ length: total }, (_, i) => (\n          <span key={i} data-on={i < filled ? \"\" : undefined} aria-hidden=\"true\">\n            {i < filled && <KapeIcon name=\"coffee-bean\" size={16} />}\n          </span>\n        ))}\n      </div>\n      <p className=\"kape-sr\">{filled} of {total} stamps earned</p>\n    </>\n  );\n}",
    "css": ".kape-stamps { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 6px; }\n.kape-stamps > span { aspect-ratio: 1; display: grid; place-items: center; border: 1.5px dashed var(--line-strong); border-radius: var(--pill); color: var(--faint); }\n.kape-stamps > span[data-on] { background: var(--accent); color: var(--on-accent); }\n.kape-sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }"
  },
  {
    "key": "row",
    "label": "Menu row",
    "cat": "Data",
    "props": [
      {
        "name": "items",
        "type": "MenuItem[]",
        "default": "[]",
        "required": true,
        "description": "Rows to render; each needs id, name, sub, price, icon"
      },
      {
        "name": "onPick",
        "type": "(item: MenuItem) => void",
        "default": "—",
        "required": false,
        "description": "Fired when a row is activated"
      },
      {
        "name": "badge",
        "type": "string | null",
        "default": "null",
        "required": false,
        "description": "Optional flag drawn beside the title"
      }
    ],
    "a11y": {
      "roles": [
        "A plain row is not interactive; wrap it in a button or anchor when it navigates"
      ],
      "attrs": [
        "The price must stay in the same reading order as the name",
        "Decorative drink art gets aria-hidden"
      ],
      "keys": [
        "Only interactive rows take focus; do not put tabindex on a static row"
      ]
    },
    "html": "<div class=\"kape-row\">\n  <span class=\"kape-row__art\"><kape-icon name=\"ube-latte\" size=\"40\" colour></kape-icon></span>\n  <div class=\"kape-row__body\">\n    <p class=\"kape-row__title\">Ube latte <span class=\"kape-badge\">New</span></p>\n    <p class=\"kape-row__sub\">Purple yam, layered, iced</p>\n  </div>\n  <span class=\"kape-row__price\">₱135</span>\n</div>",
    "react": "{drinks.map((d) => (\n  <div key={d.id} className=\"kape-row\">\n    <span className=\"kape-row__art\"><KapeIcon name={d.icon} size={40} colour /></span>\n    <div className=\"kape-row__body\">\n      <p className=\"kape-row__title\">{d.name}{d.isNew && <span className=\"kape-badge\">New</span>}</p>\n      <p className=\"kape-row__sub\">{d.note}</p>\n    </div>\n    <span className=\"kape-row__price\">₱{d.price}</span>\n  </div>\n))}",
    "css": ".kape-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--line); color: var(--ink); }\n.kape-row__art { display: grid; place-items: center; width: 44px; height: 44px; flex-shrink: 0; background: var(--surface); border-radius: var(--radius-sm); }\n.kape-row__body { flex: 1; min-width: 0; }\n.kape-row__title { margin: 0; font-size: 14.5px; font-weight: 600; }\n.kape-row__sub { margin: 2px 0 0; font-size: 12.5px; color: var(--muted); }\n.kape-row__price { font-family: ui-monospace, monospace; font-size: 13px; }\n.kape-badge { font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--on-accent); background: var(--accent); border-radius: var(--radius-xs); padding: 2px 6px; margin-left: 8px; }"
  },
  {
    "key": "stepper",
    "label": "Stepper",
    "cat": "Forms",
    "props": [
      {
        "name": "modelValue",
        "type": "number",
        "default": "1",
        "required": true,
        "description": "Current quantity"
      },
      {
        "name": "min",
        "type": "number",
        "default": "1",
        "required": false,
        "description": "Lower bound"
      },
      {
        "name": "max",
        "type": "number",
        "default": "99",
        "required": false,
        "description": "Upper bound"
      },
      {
        "name": "onChange",
        "type": "(value: number) => void",
        "default": "—",
        "required": true,
        "description": "Fired with the clamped value"
      }
    ],
    "a11y": {
      "roles": [
        "Two buttons around a native output element"
      ],
      "attrs": [
        "aria-label on each button (Fewer, More), never a bare minus sign",
        "aria-live=\"polite\" on the output so screen readers hear the new count"
      ],
      "keys": [
        "Enter or Space on either button",
        "Arrow Up and Arrow Down step while the group has focus"
      ]
    },
    "html": "<div class=\"kape-stepper\">\n  <button aria-label=\"Fewer\">−</button>\n  <output>2</output>\n  <button aria-label=\"More\">+</button>\n</div>",
    "react": "<div className=\"kape-stepper\">\n  <button aria-label=\"Fewer\" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>\n  <output>{qty}</output>\n  <button aria-label=\"More\" onClick={() => setQty(qty + 1)}>+</button>\n</div>",
    "css": ".kape-stepper { display: inline-flex; align-items: center; border: 1.5px solid var(--line-strong); border-radius: var(--pill); color: var(--ink); }\n.kape-stepper button { padding: 6px 10px; font: inherit; font-size: 15px; line-height: 1; background: none; border: 0; color: inherit; cursor: pointer; }\n.kape-stepper output { min-width: 16px; text-align: center; font-size: 13px; font-weight: 600; }"
  },
  {
    "key": "switch",
    "label": "Switch",
    "cat": "Actions",
    "props": [
      {
        "name": "modelValue",
        "type": "boolean",
        "default": "false",
        "required": true,
        "description": "On or off"
      },
      {
        "name": "label",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "What the switch controls"
      },
      {
        "name": "disabled",
        "type": "boolean",
        "default": "false",
        "required": false,
        "description": "Blocks toggling"
      }
    ],
    "a11y": {
      "roles": [
        "A native checkbox inside a label; role=\"switch\" is optional and only if you also manage aria-checked"
      ],
      "attrs": [
        "The label text must be adjacent, not a title attribute"
      ],
      "keys": [
        "Space toggles",
        "Tab focuses the input, which is visually hidden but not display:none"
      ]
    },
    "html": "<label class=\"kape-switch\"><input type=\"checkbox\" checked></label> Oat milk",
    "react": "<label className=\"kape-switch\">\n  <input type=\"checkbox\" checked={oat} onChange={(e) => setOat(e.target.checked)} />\n</label>",
    "css": ".kape-switch { position: relative; display: inline-block; width: 40px; height: 24px; border-radius: var(--pill); background: var(--line-strong); cursor: pointer; }\n.kape-switch::after { content: \"\"; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: var(--pill); background: var(--surface); transition: left .15s; }\n.kape-switch:has(input:checked) { background: var(--accent); }\n.kape-switch:has(input:checked)::after { left: 19px; }\n.kape-switch input { position: absolute; opacity: 0; inset: 0; margin: 0; }"
  },
  {
    "key": "check",
    "label": "Checkbox · Radio",
    "cat": "Forms",
    "props": [
      {
        "name": "options",
        "type": "string[]",
        "default": "[]",
        "required": true,
        "description": "Choice labels"
      },
      {
        "name": "modelValue",
        "type": "string | string[]",
        "default": "—",
        "required": true,
        "description": "Selected value, or values for checkbox mode"
      },
      {
        "name": "mode",
        "type": "'checkbox' | 'radio'",
        "default": "radio",
        "required": false,
        "description": "Which control to render"
      },
      {
        "name": "name",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "Shared name for radio grouping"
      }
    ],
    "a11y": {
      "roles": [
        "Native inputs inside labels; wrap a radio set in a fieldset with a legend"
      ],
      "attrs": [
        "name must match across a radio group",
        "aria-describedby for a helper line under the set"
      ],
      "keys": [
        "Radio: arrow keys move and select within the group",
        "Checkbox: Space toggles, Tab moves"
      ]
    },
    "html": "<label class=\"kape-check\"><input type=\"checkbox\" checked> Extra shot</label>\n<label class=\"kape-radio\"><input type=\"radio\" name=\"size\" checked> 12 oz</label>\n<label class=\"kape-radio\"><input type=\"radio\" name=\"size\"> 16 oz</label>",
    "react": "{sizes.map((s) => (\n  <label key={s} className=\"kape-radio\">\n    <input type=\"radio\" name=\"size\" checked={size === s} onChange={() => setSize(s)} /> {s}\n  </label>\n))}",
    "css": ".kape-check, .kape-radio { display: inline-flex; align-items: center; gap: 9px; font-size: 14px; color: var(--ink); cursor: pointer; }\n.kape-check input, .kape-radio input { appearance: none; width: 18px; height: 18px; margin: 0; border: 1.5px solid var(--line-strong); border-radius: var(--radius-xs); background: var(--surface); display: grid; place-items: center; }\n.kape-radio input { border-radius: var(--pill); }\n.kape-check input:checked { background: var(--ink); border-color: var(--ink); }\n.kape-check input:checked::after { content: \"\"; width: 5px; height: 9px; border: solid var(--paper); border-width: 0 2px 2px 0; transform: translateY(-1px) rotate(45deg); }\n.kape-radio input:checked { border-color: var(--accent); border-width: 5px; }"
  },
  {
    "key": "select",
    "label": "Select",
    "cat": "Forms",
    "props": [
      {
        "name": "options",
        "type": "Array<{ id: string, name: string }>",
        "default": "[]",
        "required": true,
        "description": "Choices"
      },
      {
        "name": "modelValue",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "Selected id"
      },
      {
        "name": "label",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "Visible label text"
      }
    ],
    "a11y": {
      "roles": [
        "Native select; do not rebuild it unless you need a combobox"
      ],
      "attrs": [
        "A label element wrapping or bound by for/id",
        "aria-invalid on a failed submit"
      ],
      "keys": [
        "Native: arrows open and move, Enter commits, Escape reverts"
      ]
    },
    "html": "<label class=\"kape-select\">\n  <select>\n    <option>Kalayaan branch</option>\n    <option>Maginhawa branch</option>\n  </select>\n</label>",
    "react": "<label className=\"kape-select\">\n  <select value={branch} onChange={(e) => setBranch(e.target.value)}>\n    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}\n  </select>\n</label>",
    "css": ".kape-select { display: inline-flex; align-items: center; padding: 10px 14px; font: inherit; font-size: 14px; color: var(--ink); background: var(--surface); border: 1.5px solid var(--line); border-radius: var(--radius-sm); }\n.kape-select select { appearance: none; border: 0; outline: 0; background: none; font: inherit; color: inherit; padding-right: 18px; }\n.kape-select::after { content: \"\"; width: 7px; height: 7px; margin-left: -22px; border: solid var(--muted); border-width: 0 1.5px 1.5px 0; transform: translateY(-2px) rotate(45deg); pointer-events: none; }"
  },
  {
    "key": "tabs",
    "label": "Tabs",
    "cat": "Navigation",
    "props": [
      {
        "name": "tabs",
        "type": "string[]",
        "default": "[]",
        "required": true,
        "description": "Tab labels"
      },
      {
        "name": "modelValue",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "Selected tab"
      },
      {
        "name": "onChange",
        "type": "(tab: string) => void",
        "default": "—",
        "required": true,
        "description": "Fired with the new tab"
      }
    ],
    "a11y": {
      "roles": [
        "role=\"tablist\" on the wrapper, role=\"tab\" on each button, role=\"tabpanel\" on the panel"
      ],
      "attrs": [
        "aria-selected on every tab",
        "aria-controls pointing at the panel id, and aria-labelledby back on the panel",
        "tabindex=\"-1\" on unselected tabs so the set is one tab stop"
      ],
      "keys": [
        "Arrow Left and Arrow Right move selection",
        "Home and End jump to the first and last tab"
      ]
    },
    "html": "<div class=\"kape-tabs\" role=\"tablist\">\n  <button role=\"tab\" aria-selected=\"true\">Menu</button>\n  <button role=\"tab\">Beans</button>\n  <button role=\"tab\">Our shop</button>\n</div>",
    "react": "<div className=\"kape-tabs\" role=\"tablist\">\n  {tabs.map((t) => (\n    <button key={t} role=\"tab\" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>\n  ))}\n</div>",
    "css": ".kape-tabs { display: flex; gap: 22px; border-bottom: 1px solid var(--line); }\n.kape-tabs button { padding: 10px 0; font: inherit; font-size: 14px; font-weight: 500; color: var(--muted); background: none; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; cursor: pointer; }\n.kape-tabs button[aria-selected=\"true\"] { color: var(--ink); font-weight: 600; border-bottom-color: var(--accent); }"
  },
  {
    "key": "card",
    "label": "Card",
    "cat": "Data",
    "props": [
      {
        "name": "item",
        "type": "MenuItem",
        "default": "—",
        "required": true,
        "description": "Drink to show"
      },
      {
        "name": "onAdd",
        "type": "(item: MenuItem) => void",
        "default": "—",
        "required": false,
        "description": "Fired by the Add button"
      },
      {
        "name": "size",
        "type": "number",
        "default": "64",
        "required": false,
        "description": "Drink art size in px"
      }
    ],
    "a11y": {
      "roles": [
        "article for a standalone card"
      ],
      "attrs": [
        "The title should be a heading when cards are a list of products",
        "Drink art is decorative: aria-hidden"
      ],
      "keys": [
        "Only the Add button takes focus; the whole card is not clickable"
      ]
    },
    "html": "<article class=\"kape-card\">\n  <kape-icon name=\"barako\" size=\"64\" colour></kape-icon>\n  <p class=\"kape-card__title\">Kapeng barako</p>\n  <p class=\"kape-card__sub\">12 oz · hot</p>\n  <div class=\"kape-card__foot\">\n    <span class=\"kape-row__price\">₱65</span>\n    <button class=\"kape-btn kape-btn--primary\">Add</button>\n  </div>\n</article>",
    "react": "<article className=\"kape-card\">\n  <KapeIcon name={d.icon} size={64} colour />\n  <p className=\"kape-card__title\">{d.name}</p>\n  <p className=\"kape-card__sub\">{d.size} · {d.temp}</p>\n  <div className=\"kape-card__foot\">\n    <span className=\"kape-row__price\">₱{d.price}</span>\n    <button className=\"kape-btn kape-btn--primary\" onClick={() => add(d)}>Add</button>\n  </div>\n</article>",
    "css": ".kape-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; color: var(--ink); }\n.kape-card__title { margin: 0; font-size: 15px; font-weight: 600; }\n.kape-card__sub { margin: 2px 0 0; font-size: 12.5px; color: var(--muted); }\n.kape-card__foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; }"
  },
  {
    "key": "tag",
    "label": "Badge",
    "cat": "Data",
    "props": [
      {
        "name": "label",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "Short word, one or two"
      },
      {
        "name": "tone",
        "type": "'default' | 'accent' | 'ink'",
        "default": "default",
        "required": false,
        "description": "Fill treatment"
      }
    ],
    "a11y": {
      "roles": [
        "Plain span; a badge is not a status region"
      ],
      "attrs": [
        "When the badge is the only carrier of state (Sold out), repeat it in the row text or add a visually hidden phrase"
      ],
      "keys": [
        "Not focusable"
      ]
    },
    "html": "<span class=\"kape-tag\">Hot</span>\n<span class=\"kape-tag kape-tag--accent\">New</span>\n<span class=\"kape-tag kape-tag--ink\">Sold out</span>",
    "react": "<span className={`kape-tag ${d.isNew ? \"kape-tag--accent\" : \"\"}`}>\n  {d.isNew ? \"New\" : d.temp}\n</span>",
    "css": ".kape-tag { display: inline-flex; align-items: center; padding: 3px 9px; font-size: 12px; font-weight: 600; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: var(--pill); }\n.kape-tag--accent { color: var(--on-accent); background: var(--accent); border-color: transparent; }\n.kape-tag--ink { color: var(--paper); background: var(--ink); border-color: transparent; }"
  },
  {
    "key": "avatar",
    "label": "Avatar",
    "cat": "Navigation",
    "props": [
      {
        "name": "people",
        "type": "Array<{ id: string, initials: string }>",
        "default": "[]",
        "required": true,
        "description": "Crew to stack"
      },
      {
        "name": "max",
        "type": "number",
        "default": "2",
        "required": false,
        "description": "How many before the overflow chip"
      },
      {
        "name": "accentIndex",
        "type": "number | null",
        "default": "null",
        "required": false,
        "description": "Which avatar takes the accent fill"
      }
    ],
    "a11y": {
      "roles": [
        "Decorative group; the names must also appear as text nearby"
      ],
      "attrs": [
        "aria-hidden on the stack when the same names are listed in the row",
        "The overflow chip needs a real label, e.g. 3 more"
      ],
      "keys": [
        "Not focusable unless each avatar links to a profile"
      ]
    },
    "html": "<div class=\"kape-avatars\">\n  <span class=\"kape-avatar\">AR</span>\n  <span class=\"kape-avatar kape-avatar--accent\">JD</span>\n  <span class=\"kape-avatar\">+3</span>\n</div>",
    "react": "<div className=\"kape-avatars\">\n  {crew.slice(0, 2).map((c) => <span key={c.id} className=\"kape-avatar\">{c.initials}</span>)}\n  {crew.length > 2 && <span className=\"kape-avatar\">+{crew.length - 2}</span>}\n</div>",
    "css": ".kape-avatar { display: inline-grid; place-items: center; width: 36px; height: 36px; font-size: 13px; font-weight: 600; color: var(--paper); background: var(--ink); border: 1.5px solid var(--paper); border-radius: var(--pill); }\n.kape-avatar--accent { background: var(--accent); color: var(--on-accent); }\n.kape-avatars { display: inline-flex; }\n.kape-avatars .kape-avatar + .kape-avatar { margin-left: -10px; }"
  },
  {
    "key": "dialog",
    "label": "Dialog",
    "cat": "Feedback",
    "props": [
      {
        "name": "open",
        "type": "boolean",
        "default": "false",
        "required": true,
        "description": "Whether the modal is shown"
      },
      {
        "name": "title",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "One question or one statement"
      },
      {
        "name": "body",
        "type": "string",
        "default": "—",
        "required": false,
        "description": "One or two lines of consequence"
      },
      {
        "name": "confirmLabel",
        "type": "string",
        "default": "Confirm",
        "required": false,
        "description": "Destructive action label"
      },
      {
        "name": "onConfirm",
        "type": "() => void",
        "default": "—",
        "required": true,
        "description": "Fired by the confirm button"
      },
      {
        "name": "onClose",
        "type": "() => void",
        "default": "—",
        "required": true,
        "description": "Fired by cancel, backdrop or Escape"
      }
    ],
    "a11y": {
      "roles": [
        "Native dialog element gives role=\"dialog\" and aria-modal for free"
      ],
      "attrs": [
        "aria-labelledby pointing at the heading",
        "Focus must land on the least destructive action, not the confirm"
      ],
      "keys": [
        "Escape closes (native)",
        "Tab is trapped inside while modal (native)"
      ]
    },
    "html": "<dialog class=\"kape-dialog\" open>\n  <h2>Cancel this order?</h2>\n  <p>#2381 is already being made. The barista will be told.</p>\n  <div class=\"kape-dialog__actions\">\n    <button class=\"kape-btn kape-btn--ghost\">Keep it</button>\n    <button class=\"kape-btn kape-btn--ink\">Cancel order</button>\n  </div>\n</dialog>",
    "react": "const ref = useRef();\n\n<dialog ref={ref} className=\"kape-dialog\">\n  <h2>Cancel this order?</h2>\n  <p>#{order.id} is already being made.</p>\n  <div className=\"kape-dialog__actions\">\n    <button className=\"kape-btn kape-btn--ghost\" onClick={() => ref.current.close()}>Keep it</button>\n    <button className=\"kape-btn kape-btn--ink\" onClick={cancel}>Cancel order</button>\n  </div>\n</dialog>\n// open with ref.current.showModal()",
    "css": ".kape-dialog { width: min(440px, 100%); padding: 24px; color: var(--ink); background: var(--surface); border: 1.5px solid var(--line-strong); border-radius: var(--radius); }\n.kape-dialog::backdrop { background: color-mix(in oklab, var(--ink) 55%, transparent); }\n.kape-dialog h2 { margin: 0 0 6px; font-size: 18px; font-weight: 700; }\n.kape-dialog p { margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: var(--muted); }\n.kape-dialog__actions { display: flex; justify-content: flex-end; gap: 8px; }"
  },
  {
    "key": "tip",
    "label": "Tooltip",
    "cat": "Navigation",
    "props": [
      {
        "name": "text",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "One short phrase, no sentences"
      },
      {
        "name": "placement",
        "type": "'top' | 'bottom'",
        "default": "top",
        "required": false,
        "description": "Which side the bubble sits on"
      }
    ],
    "a11y": {
      "roles": [
        "The tip is CSS-only, so the text must also be reachable"
      ],
      "attrs": [
        "Mirror the tip into aria-describedby or a title-free aria-label",
        "Never put essential information only in the tooltip"
      ],
      "keys": [
        "Shows on :focus-visible as well as hover, so keyboard users get it",
        "Escape does not dismiss a CSS tooltip; keep tips non-blocking"
      ]
    },
    "html": "<button class=\"kape-btn kape-tip\" data-tip=\"Batangas liberica, brewed strong\">Barako</button>",
    "react": "<button className=\"kape-btn kape-tip\" data-tip={d.note}>{d.name}</button>",
    "css": ".kape-tip { position: relative; }\n.kape-tip::after { content: attr(data-tip); position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); white-space: nowrap; padding: 6px 10px; font-size: 12.5px; color: var(--paper); background: var(--ink); border-radius: var(--radius-xs); opacity: 0; pointer-events: none; transition: opacity .12s; }\n.kape-tip:hover::after, .kape-tip:focus-visible::after { opacity: 1; }"
  },
  {
    "key": "skeleton",
    "label": "Skeleton",
    "cat": "Data",
    "props": [
      {
        "name": "lines",
        "type": "number",
        "default": "3",
        "required": false,
        "description": "How many bars to draw"
      },
      {
        "name": "width",
        "type": "string",
        "default": "60%",
        "required": false,
        "description": "Bar width, per line or shared"
      },
      {
        "name": "loading",
        "type": "boolean",
        "default": "true",
        "required": true,
        "description": "Swap for real content when false"
      }
    ],
    "a11y": {
      "roles": [
        "The loading region needs aria-busy on the container, not on each bar"
      ],
      "attrs": [
        "aria-busy=\"true\" while skeletons show",
        "A visually hidden Loading orders line so the wait is announced once"
      ],
      "keys": [
        "Skeletons are never focusable; keep tab order stable when they swap out"
      ]
    },
    "html": "<span class=\"kape-skeleton\" style=\"width: 44px; height: 44px\"></span>\n<span class=\"kape-skeleton\" style=\"width: 60%\"></span>\n<span class=\"kape-skeleton\" style=\"width: 40%\"></span>",
    "react": "{loading\n  ? Array.from({ length: 5 }).map((_, i) => <span key={i} className=\"kape-skeleton\" style={{ width: \"60%\" }} />)\n  : rows}",
    "css": ".kape-skeleton { display: block; height: 14px; border-radius: var(--radius-xs); background: repeating-linear-gradient(90deg, var(--line) 0 40%, var(--line-strong) 50%, var(--line) 60% 100%); background-size: 200% 100%; animation: kape-shimmer 1.4s linear infinite; }\n@keyframes kape-shimmer { to { background-position: -200% 0; } }"
  },
  {
    "key": "progress",
    "label": "Progress",
    "cat": "Feedback",
    "props": [
      {
        "name": "value",
        "type": "number",
        "default": "0",
        "required": true,
        "description": "Percentage, 0 to 100"
      },
      {
        "name": "label",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "What is progressing"
      }
    ],
    "a11y": {
      "roles": [
        "role=\"progressbar\""
      ],
      "attrs": [
        "aria-valuenow, and aria-valuemin/max when they are not 0 and 100",
        "aria-label or aria-labelledby naming the task"
      ],
      "keys": [
        "Not focusable; it reports, it does not accept input"
      ]
    },
    "html": "<span class=\"kape-progress\" role=\"progressbar\" aria-valuenow=\"60\">\n  <span style=\"width: 60%\"></span>\n</span>",
    "react": "<span className=\"kape-progress\" role=\"progressbar\" aria-valuenow={pct}>\n  <span style={{ width: `${pct}%` }} />\n</span>",
    "css": ".kape-progress { display: block; height: 8px; overflow: hidden; background: var(--line); border-radius: var(--pill); }\n.kape-progress > span { display: block; height: 100%; background: var(--accent); border-radius: inherit; }"
  },
  {
    "key": "pager",
    "label": "Pagination",
    "cat": "Navigation",
    "props": [
      {
        "name": "page",
        "type": "number",
        "default": "1",
        "required": true,
        "description": "Current page, 1-based"
      },
      {
        "name": "pages",
        "type": "number",
        "default": "1",
        "required": true,
        "description": "Total pages"
      },
      {
        "name": "onChange",
        "type": "(page: number) => void",
        "default": "—",
        "required": true,
        "description": "Fired with the requested page"
      }
    ],
    "a11y": {
      "roles": [
        "nav with an aria-label such as Menu pages"
      ],
      "attrs": [
        "aria-current=\"page\" on the active number",
        "disabled on the arrows at the ends, not aria-disabled"
      ],
      "keys": [
        "Tab through the numbers",
        "Enter or Space activates; arrow keys are left to the browser"
      ]
    },
    "html": "<nav class=\"kape-pager\">\n  <button disabled>‹</button>\n  <button aria-current=\"page\">1</button>\n  <button>2</button>\n  <button>3</button>\n  <button>›</button>\n</nav>",
    "react": "<nav className=\"kape-pager\">\n  <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>\n  {pages.map((p) => <button key={p} aria-current={p === page ? \"page\" : undefined} onClick={() => setPage(p)}>{p}</button>)}\n  <button disabled={page === pages.length} onClick={() => setPage(page + 1)}>›</button>\n</nav>",
    "css": ".kape-pager { display: inline-flex; align-items: center; gap: 4px; }\n.kape-pager button { min-width: 34px; height: 34px; padding: 0 8px; font: inherit; font-size: 13px; font-weight: 500; color: var(--muted); background: none; border: 1px solid transparent; border-radius: var(--radius-xs); cursor: pointer; }\n.kape-pager button[aria-current=\"page\"] { color: var(--paper); background: var(--ink); }\n.kape-pager button:disabled { opacity: .35; cursor: default; }"
  },
  {
    "key": "acc",
    "label": "Accordion",
    "cat": "Data",
    "props": [
      {
        "name": "items",
        "type": "Array<{ id: string, q: string, a: string }>",
        "default": "[]",
        "required": true,
        "description": "Question and answer pairs"
      },
      {
        "name": "openFirst",
        "type": "boolean",
        "default": "false",
        "required": false,
        "description": "Open the first panel on mount"
      }
    ],
    "a11y": {
      "roles": [
        "Native details and summary; no ARIA needed"
      ],
      "attrs": [
        "Do not add role=\"button\" to summary, the browser already exposes it",
        "aria-expanded is managed by the open attribute"
      ],
      "keys": [
        "Enter or Space toggles a summary",
        "Tab moves between summaries"
      ]
    },
    "html": "<details class=\"kape-acc\" open>\n  <summary>Where do the beans come from?</summary>\n  <p>Liberica from Batangas, roasted every Tuesday.</p>\n</details>\n<details class=\"kape-acc\">\n  <summary>Do you deliver?</summary>\n  <p>Within 5 km, until 9 pm.</p>\n</details>",
    "react": "{faqs.map((f) => (\n  <details key={f.id} className=\"kape-acc\">\n    <summary>{f.q}</summary>\n    <p>{f.a}</p>\n  </details>\n))}",
    "css": ".kape-acc { border-top: 1px solid var(--line); }\n.kape-acc summary { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; font-size: 14.5px; font-weight: 600; color: var(--ink); list-style: none; cursor: pointer; }\n.kape-acc summary::after { content: \"+\"; font-size: 18px; font-weight: 400; color: var(--muted); }\n.kape-acc[open] summary::after { content: \"−\"; }\n.kape-acc p { margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: var(--muted); }"
  },
  {
    "key": "table",
    "label": "Table",
    "cat": "Data",
    "props": [
      {
        "name": "rows",
        "type": "Order[]",
        "default": "[]",
        "required": true,
        "description": "Rows to render"
      },
      {
        "name": "caption",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "What the table lists"
      },
      {
        "name": "numericColumns",
        "type": "string[]",
        "default": "[]",
        "required": false,
        "description": "Columns that get the mono right-aligned treatment"
      }
    ],
    "a11y": {
      "roles": [
        "Real table, thead, th; never divs with role=\"table\" unless you also wire every role"
      ],
      "attrs": [
        "A caption element, or aria-label on the table",
        "scope=\"col\" on header cells"
      ],
      "keys": [
        "Table content is read in DOM order; keep the money column last in both markup and layout"
      ]
    },
    "html": "<table class=\"kape-table\">\n  <thead><tr><th>Order</th><th>Items</th><th>Status</th><th class=\"num\">Total</th></tr></thead>\n  <tbody>\n    <tr><td>#2381</td><td>2 × Barako, 1 × Ube latte</td><td><span class=\"kape-tag kape-tag--accent\">Making</span></td><td class=\"num\">₱265</td></tr>\n    <tr><td>#2380</td><td>1 × Latte</td><td><span class=\"kape-tag\">Ready</span></td><td class=\"num\">₱120</td></tr>\n  </tbody>\n</table>",
    "react": "<table className=\"kape-table\">\n  <thead><tr><th>Order</th><th>Items</th><th>Status</th><th className=\"num\">Total</th></tr></thead>\n  <tbody>\n    {orders.map((o) => (\n      <tr key={o.id}>\n        <td>#{o.id}</td><td>{o.summary}</td>\n        <td><span className={`kape-tag ${o.status === \"making\" ? \"kape-tag--accent\" : \"\"}`}>{o.status}</span></td>\n        <td className=\"num\">₱{o.total}</td>\n      </tr>\n    ))}\n  </tbody>\n</table>",
    "css": ".kape-table { width: 100%; border-collapse: collapse; font-size: 13.5px; color: var(--ink); }\n.kape-table th { text-align: left; padding: 10px 12px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line-strong); }\n.kape-table td { padding: 12px; border-bottom: 1px solid var(--line); }\n.kape-table td.num { font-family: ui-monospace, monospace; text-align: right; }"
  },
  {
    "key": "crumbs",
    "label": "Breadcrumb",
    "cat": "Navigation",
    "props": [
      {
        "name": "trail",
        "type": "Array<{ href: string, label: string }>",
        "default": "[]",
        "required": true,
        "description": "Path from root to here, current page last"
      },
      {
        "name": "label",
        "type": "string",
        "default": "Breadcrumb",
        "required": false,
        "description": "aria-label for the nav"
      }
    ],
    "a11y": {
      "roles": [
        "nav wrapping an ordered list"
      ],
      "attrs": [
        "aria-current=\"page\" on the last item, which is text and not a link",
        "The separator is CSS content, so it is never read out"
      ],
      "keys": [
        "Tab through the ancestor links only"
      ]
    },
    "html": "<ol class=\"kape-crumbs\">\n  <li><a href=\"/\">Tindahan</a></li>\n  <li><a href=\"/menu\">Menu</a></li>\n  <li aria-current=\"page\">Ube latte</li>\n</ol>",
    "react": "<ol className=\"kape-crumbs\">\n  {trail.map((t, i) => (\n    <li key={t.href} aria-current={i === trail.length - 1 ? \"page\" : undefined}>\n      {i === trail.length - 1 ? t.label : <a href={t.href}>{t.label}</a>}\n    </li>\n  ))}\n</ol>",
    "css": ".kape-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }\n.kape-crumbs a { color: inherit; text-decoration: none; }\n.kape-crumbs li { display: contents; }\n.kape-crumbs li + li::before { content: \"/\"; color: var(--faint); }\n.kape-crumbs [aria-current] { color: var(--ink); font-weight: 600; }"
  },
  {
    "key": "upload",
    "label": "File upload",
    "cat": "Forms",
    "props": [
      {
        "name": "accept",
        "type": "string",
        "default": ".csv,.xlsx",
        "required": false,
        "description": "Allowed extensions"
      },
      {
        "name": "maxSize",
        "type": "number",
        "default": "10485760",
        "required": false,
        "description": "Byte ceiling, 10 MB by default"
      },
      {
        "name": "files",
        "type": "UploadFile[]",
        "default": "[]",
        "required": false,
        "description": "Files in flight, each with name, ext and pct"
      },
      {
        "name": "onFiles",
        "type": "(files: File[]) => void",
        "default": "—",
        "required": true,
        "description": "Fired for both drop and browse"
      }
    ],
    "a11y": {
      "roles": [
        "A label wrapping a real file input; the drop zone is not a button"
      ],
      "attrs": [
        "The input stays in the DOM (hidden attribute, not display:none on a wrapper)",
        "Each in-flight row needs its own progressbar with an aria-label naming the file"
      ],
      "keys": [
        "Tab focuses the input, Enter or Space opens the picker",
        "Drag and drop is an enhancement, never the only path"
      ]
    },
    "html": "<label class=\"kape-drop\">\n  <kape-icon name=\"coffee-sack\" size=\"36\"></kape-icon>\n  <strong>Drop the menu sheet here</strong>\n  <span>CSV or XLSX, up to 10 MB. Or <u>browse</u>.</span>\n  <input type=\"file\" accept=\".csv,.xlsx\" hidden>\n</label>\n<div class=\"kape-file\">\n  <span class=\"kape-file__ext\">CSV</span>\n  <div class=\"kape-file__body\"><span>menu-september.csv</span><span class=\"kape-progress\"><span style=\"width: 64%\"></span></span></div>\n  <button aria-label=\"Cancel\">✕</button>\n</div>",
    "react": "const onDrop = (e) => { e.preventDefault(); upload(e.dataTransfer.files[0]); };\n\n<label className=\"kape-drop\" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>\n  <KapeIcon name=\"coffee-sack\" size={36} />\n  <strong>Drop the menu sheet here</strong>\n  <input type=\"file\" hidden onChange={(e) => upload(e.target.files[0])} />\n</label>\n{files.map((f) => (\n  <div key={f.name} className=\"kape-file\">\n    <span className=\"kape-file__ext\">{f.ext}</span>\n    <div className=\"kape-file__body\"><span>{f.name}</span><span className=\"kape-progress\"><span style={{ width: f.pct + '%' }} /></span></div>\n  </div>\n))}",
    "css": ".kape-drop { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 26px 20px; text-align: center; font-size: 13px; color: var(--muted); background: var(--surface); border: 1.5px dashed var(--line-strong); border-radius: var(--radius); cursor: pointer; }\n.kape-drop > kape-icon { color: var(--accent); }\n.kape-drop strong { font-size: 14px; color: var(--ink); }\n.kape-drop:focus-within, .kape-drop.is-over { border-color: var(--accent); border-style: solid; }\n.kape-file { display: flex; align-items: center; gap: 12px; margin-top: 10px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm); font-size: 13px; color: var(--ink); }\n.kape-file__ext { display: grid; place-items: center; width: 36px; height: 36px; font: 600 10px ui-monospace, monospace; color: var(--muted); background: var(--paper); border-radius: var(--radius-xs); }\n.kape-file__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; font-weight: 600; }\n.kape-file button { background: none; border: 0; color: var(--faint); cursor: pointer; }"
  },
  {
    "key": "edit",
    "label": "Editable table",
    "cat": "Data",
    "props": [
      {
        "name": "rows",
        "type": "Drink[]",
        "default": "[]",
        "required": true,
        "description": "Rows to render"
      },
      {
        "name": "editingId",
        "type": "string | null",
        "default": "null",
        "required": false,
        "description": "Row currently in edit mode; leave unset to let the component own it"
      },
      {
        "name": "onSave",
        "type": "(id: string, price: number) => void",
        "default": "—",
        "required": true,
        "description": "Fired on Enter or Save"
      },
      {
        "name": "columns",
        "type": "string[]",
        "default": "[]",
        "required": false,
        "description": "Header labels, in order"
      }
    ],
    "a11y": {
      "roles": [
        "Real table; the edit affordance is a cell input, not a dialog"
      ],
      "attrs": [
        "aria-live=\"polite\" on a status line so a save is announced",
        "The input inherits the column header via scope=\"col\"; do not aria-label it with the value"
      ],
      "keys": [
        "Enter commits, Escape reverts and returns focus to the cell",
        "F2 or double-click enters edit mode",
        "Tab out commits, matching spreadsheet behaviour"
      ]
    },
    "html": "<table class=\"kape-table kape-table--edit\">\n  <thead><tr><th>Drink</th><th>Size</th><th>Price</th><th class=\"num\">Stock</th></tr></thead>\n  <tbody>\n    <tr><td>Kapeng barako</td><td>12 oz</td><td class=\"num\">₱65</td><td class=\"num\">48</td></tr>\n    <tr class=\"is-editing\"><td>Café latte</td><td>12 oz</td>\n      <td class=\"num\"><input value=\"120\" inputmode=\"numeric\" autofocus></td>\n      <td class=\"num\">31 <button class=\"kape-btn kape-btn--sm\">Save</button></td></tr>\n  </tbody>\n</table>",
    "react": "const [editing, setEditing] = useState(null);\n\n<tr className={editing === d.id ? 'is-editing' : ''} onDoubleClick={() => setEditing(d.id)}>\n  <td>{d.name}</td><td>{d.size}</td>\n  <td className=\"num\">{editing === d.id\n    ? <input defaultValue={d.price} inputMode=\"numeric\" autoFocus\n        onKeyDown={(e) => { if (e.key === 'Enter') save(d.id, e.target.value); if (e.key === 'Escape') setEditing(null); }} />\n    : '₱' + d.price}</td>\n  <td className=\"num\">{d.stock}</td>\n</tr>",
    "css": ".kape-table--edit td { cursor: text; }\n.kape-table--edit tr.is-editing td { background: color-mix(in oklab, var(--accent) 16%, transparent); padding-top: 7px; padding-bottom: 7px; }\n.kape-table--edit input { width: 80px; padding: 5px 8px; font: inherit; font-family: ui-monospace, monospace; color: var(--ink); background: var(--surface); border: 1.5px solid var(--accent); border-radius: var(--radius-xs); outline: 0; }\n.kape-btn--sm { padding: 4px 8px; font-size: 11.5px; }"
  },
  {
    "key": "combo",
    "label": "Combobox",
    "cat": "Forms",
    "props": [
      {
        "name": "options",
        "type": "Array<{ id: string, name: string, price: number }>",
        "default": "[]",
        "required": true,
        "description": "Everything selectable"
      },
      {
        "name": "modelValue",
        "type": "string[]",
        "default": "[]",
        "required": true,
        "description": "Selected ids"
      },
      {
        "name": "placeholder",
        "type": "string",
        "default": "Add…",
        "required": false,
        "description": "Hint in the free-text field"
      },
      {
        "name": "onChange",
        "type": "(ids: string[]) => void",
        "default": "—",
        "required": true,
        "description": "Fired with the new id list"
      }
    ],
    "a11y": {
      "roles": [
        "role=\"combobox\" on the wrapper, role=\"listbox\" on the popup, role=\"option\" on each row"
      ],
      "attrs": [
        "aria-expanded on the combobox",
        "aria-multiselectable on the listbox and aria-selected on every option",
        "aria-activedescendant on the input, pointing at the active option id — focus never leaves the input",
        "aria-controls linking input to listbox"
      ],
      "keys": [
        "Arrow Down and Arrow Up move the active option",
        "Enter toggles the active option and keeps the list open",
        "Backspace on an empty field removes the last chip",
        "Escape closes the list, Tab closes and moves on"
      ]
    },
    "html": "<div class=\"kape-combo\" role=\"combobox\" aria-expanded=\"true\">\n  <div class=\"kape-combo__field\">\n    <span class=\"kape-chip\">Oat milk <button aria-label=\"Remove\">✕</button></span>\n    <span class=\"kape-chip\">Extra shot <button aria-label=\"Remove\">✕</button></span>\n    <input placeholder=\"Add…\" value=\"al\">\n  </div>\n  <ul class=\"kape-combo__list\" role=\"listbox\" aria-multiselectable=\"true\">\n    <li role=\"option\" aria-selected=\"false\" class=\"is-active\">Almond milk <small>+₱30</small></li>\n    <li role=\"option\" aria-selected=\"true\">Oat milk <small>+₱30</small></li>\n    <li role=\"option\" aria-selected=\"false\">Salted caramel <small>+₱25</small></li>\n  </ul>\n</div>",
    "react": "const [picked, setPicked] = useState(['oat', 'shot']);\nconst [q, setQ] = useState('');\nconst hits = addons.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));\n\n<div className=\"kape-combo\" role=\"combobox\" aria-expanded={open}>\n  <div className=\"kape-combo__field\">\n    {picked.map((id) => <span key={id} className=\"kape-chip\">{byId(id).name}<button onClick={() => remove(id)}>✕</button></span>)}\n    <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} />\n  </div>\n  {open && <ul className=\"kape-combo__list\" role=\"listbox\" aria-multiselectable>\n    {hits.map((a) => <li key={a.id} role=\"option\" aria-selected={picked.includes(a.id)} onClick={() => toggle(a.id)}>{a.name}<small>+₱{a.price}</small></li>)}\n  </ul>}\n</div>",
    "css": ".kape-combo { position: relative; font-size: 13.5px; color: var(--ink); }\n.kape-combo__field { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 8px 10px; background: var(--surface); border: 1.5px solid var(--line); border-radius: var(--radius-sm); }\n.kape-combo[aria-expanded=\"true\"] .kape-combo__field { border-color: var(--accent); border-bottom-left-radius: 0; border-bottom-right-radius: 0; }\n.kape-combo__field input { flex: 1; min-width: 60px; border: 0; outline: 0; background: none; font: inherit; color: inherit; }\n.kape-combo__field .kape-chip { padding: 4px 6px 4px 10px; font-size: 12.5px; background: var(--paper); }\n.kape-combo__field .kape-chip button { border: 0; background: none; color: var(--faint); cursor: pointer; }\n.kape-combo__list { margin: 0; padding: 6px; list-style: none; background: var(--surface); border: 1.5px solid var(--line); border-top: 0; border-radius: 0 0 var(--radius-sm) var(--radius-sm); }\n.kape-combo__list li { display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 34px; border-radius: var(--radius-xs); position: relative; cursor: pointer; }\n.kape-combo__list li::before { content: \"\"; position: absolute; left: 10px; width: 16px; height: 16px; box-sizing: border-box; border: 1.5px solid var(--line-strong); border-radius: var(--radius-xs); }\n.kape-combo__list li[aria-selected=\"true\"]::before { background: var(--accent); border-color: var(--accent); }\n.kape-combo__list li.is-active, .kape-combo__list li:hover { background: color-mix(in oklab, var(--accent) 16%, transparent); }\n.kape-combo__list small { margin-left: auto; font-family: ui-monospace, monospace; font-size: 11.5px; color: var(--muted); }"
  },
  {
    "key": "multi",
    "label": "Multi-select",
    "cat": "Forms",
    "props": [
      {
        "name": "options",
        "type": "Array<{ id: string, name: string }>",
        "default": "[]",
        "required": true,
        "description": "Everything selectable"
      },
      {
        "name": "modelValue",
        "type": "string[]",
        "default": "[]",
        "required": true,
        "description": "Selected ids"
      },
      {
        "name": "max",
        "type": "number | null",
        "default": "null",
        "required": false,
        "description": "Ceiling on selections; further options go disabled"
      },
      {
        "name": "summaryLabel",
        "type": "(n: number) => string",
        "default": "—",
        "required": false,
        "description": "Overrides the chip overflow wording"
      }
    ],
    "a11y": {
      "roles": [
        "Same combobox pattern as above, but the field is read-only: it lists chips and opens a listbox"
      ],
      "attrs": [
        "aria-multiselectable on the listbox",
        "aria-selected on every option, including unselected ones",
        "aria-describedby pointing at the count line so the total is announced after each toggle",
        "aria-disabled on options blocked by max, never removed from the list"
      ],
      "keys": [
        "Arrow keys move, Space or Enter toggles without closing",
        "Escape closes, Home and End jump the list",
        "Backspace removes the last chip when the field has focus"
      ]
    },
    "html": "<div class=\"kape-combo\" role=\"combobox\" aria-expanded=\"true\" aria-controls=\"branches\" aria-describedby=\"branch-count\">\n  <div class=\"kape-combo__field\" tabindex=\"0\">\n    <span class=\"kape-chip\">Kalayaan <button aria-label=\"Remove Kalayaan\">✕</button></span>\n    <span class=\"kape-chip\">Maginhawa <button aria-label=\"Remove Maginhawa\">✕</button></span>\n  </div>\n  <ul id=\"branches\" class=\"kape-combo__list\" role=\"listbox\" aria-multiselectable=\"true\">\n    <li role=\"option\" aria-selected=\"true\">Kalayaan</li>\n    <li role=\"option\" aria-selected=\"true\">Maginhawa</li>\n    <li role=\"option\" aria-selected=\"false\" class=\"is-active\">Katipunan</li>\n    <li role=\"option\" aria-selected=\"false\" aria-disabled=\"true\">Balara (closed)</li>\n  </ul>\n  <p id=\"branch-count\" class=\"kape-sr\">2 of 4 selected</p>\n</div>",
    "react": "const [picked, setPicked] = useState(['kalayaan', 'maginhawa']);\nconst [open, setOpen] = useState(false);\nconst [cursor, setCursor] = useState(0);\n\nconst toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));\nconst onKeyDown = (e) => {\n  if (e.key === 'ArrowDown') { setOpen(true); setCursor((c) => (c + 1) % branches.length); e.preventDefault(); }\n  else if (e.key === 'ArrowUp') { setCursor((c) => (c - 1 + branches.length) % branches.length); e.preventDefault(); }\n  else if (e.key === ' ' || e.key === 'Enter') { open ? toggle(branches[cursor].id) : setOpen(true); e.preventDefault(); }\n  else if (e.key === 'Escape') setOpen(false);\n  else if (e.key === 'Backspace' && picked.length) setPicked(picked.slice(0, -1));\n};\n\n<div className=\"kape-combo\" role=\"combobox\" aria-expanded={open} aria-controls=\"branches\" aria-describedby=\"branch-count\">\n  <div className=\"kape-combo__field\" tabIndex={0} onKeyDown={onKeyDown} onClick={() => setOpen(!open)}>\n    {picked.map((id) => (\n      <span key={id} className=\"kape-chip\">{byId(id).name}\n        <button aria-label={`Remove ${byId(id).name}`} onClick={(e) => { e.stopPropagation(); toggle(id); }}>✕</button>\n      </span>\n    ))}\n    {!picked.length && <span className=\"kape-combo__hint\">Pick your branches</span>}\n  </div>\n  {open && (\n    <ul id=\"branches\" className=\"kape-combo__list\" role=\"listbox\" aria-multiselectable>\n      {branches.map((b, i) => (\n        <li key={b.id} role=\"option\" aria-selected={picked.includes(b.id)} aria-disabled={b.closed || undefined}\n          className={i === cursor ? 'is-active' : ''} onMouseDown={(e) => { e.preventDefault(); toggle(b.id); }}>{b.name}</li>\n      ))}\n    </ul>\n  )}\n  <p id=\"branch-count\" className=\"kape-sr\" aria-live=\"polite\">{picked.length} of {branches.length} selected</p>\n</div>",
    "css": "/* Reuses .kape-combo wholesale; a multi-select is a combobox with a read-only field. */\n.kape-combo__field[tabindex] { cursor: pointer; }\n.kape-combo__field:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }\n.kape-combo__hint { color: var(--faint); }\n.kape-combo__list li[aria-disabled=\"true\"] { opacity: .45; cursor: not-allowed; }\n.kape-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }"
  },
  {
    "key": "range",
    "label": "Date range",
    "cat": "Forms",
    "props": [
      {
        "name": "from",
        "type": "Date | null",
        "default": "null",
        "required": true,
        "description": "Start of the range"
      },
      {
        "name": "to",
        "type": "Date | null",
        "default": "null",
        "required": true,
        "description": "End of the range"
      },
      {
        "name": "month",
        "type": "Date",
        "default": "today",
        "required": false,
        "description": "Month on show"
      },
      {
        "name": "presets",
        "type": "Array<{ label: string, from: Date, to: Date }>",
        "default": "[]",
        "required": false,
        "description": "Shortcut list down the left"
      },
      {
        "name": "onApply",
        "type": "(range: { from: Date, to: Date }) => void",
        "default": "—",
        "required": true,
        "description": "Fired by Apply, not by each click"
      }
    ],
    "a11y": {
      "roles": [
        "The grid is a group of buttons, one per day; the trigger is a button with aria-expanded"
      ],
      "attrs": [
        "aria-label on each day button carrying the full date, since the visible text is just a number",
        "aria-current=\"date\" on today",
        "aria-pressed on the two endpoints; in-range days are styling only",
        "aria-current=\"true\" on the active preset"
      ],
      "keys": [
        "Arrow keys move a day at a time, Page Up and Page Down a month",
        "Enter picks the start, then the end; Escape reverts to the last applied range",
        "Tab reaches presets, grid, then Cancel and Apply"
      ]
    },
    "html": "<div class=\"kape-range\">\n  <button class=\"kape-range__trigger\"><kape-icon name=\"stamp-card\" size=\"18\"></kape-icon> Sep 1 to Sep 14, 2026</button>\n  <div class=\"kape-range__pop\">\n    <ul class=\"kape-range__presets\"><li>Today</li><li>Last 7 days</li><li aria-current=\"true\">First half</li><li>This month</li></ul>\n    <div class=\"kape-cal\">\n      <header><button>‹</button> September 2026 <button>›</button></header>\n      <div class=\"kape-cal__grid\"><!-- 7 weekday labels, then one <button> per day; .is-start .is-end .in-range --></div>\n    </div>\n    <footer><button class=\"kape-btn\">Cancel</button><button class=\"kape-btn kape-btn--ink\">Apply</button></footer>\n  </div>\n</div>",
    "react": "const [range, setRange] = useState({ from: new Date(2026, 8, 1), to: new Date(2026, 8, 14) });\nconst pick = (d) => setRange(range.from && !range.to && d > range.from ? { ...range, to: d } : { from: d, to: null });\n\n<div className=\"kape-cal__grid\">\n  {days.map((d) => {\n    const t = d.getTime(), a = range.from?.getTime(), b = range.to?.getTime();\n    const cls = [t === a && 'is-start', t === b && 'is-end', a && b && t > a && t < b && 'in-range'].filter(Boolean).join(' ');\n    return <button key={t} className={cls} onClick={() => pick(d)}>{d.getDate()}</button>;\n  })}\n</div>",
    "css": ".kape-range { position: relative; font-size: 13.5px; color: var(--ink); }\n.kape-range__trigger { display: inline-flex; align-items: center; gap: 10px; padding: 9px 12px; font: inherit; background: var(--surface); border: 1.5px solid var(--line); border-radius: var(--radius-sm); cursor: pointer; }\n.kape-range__trigger > kape-icon { color: var(--faint); }\n.kape-range__pop { display: grid; grid-template-columns: 130px 1fr; margin-top: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }\n.kape-range__presets { margin: 0; padding: 12px; list-style: none; border-right: 1px solid var(--line); font-size: 13px; }\n.kape-range__presets li { padding: 7px 10px; border-radius: var(--radius-xs); cursor: pointer; }\n.kape-range__presets li[aria-current] { background: color-mix(in oklab, var(--accent) 16%, transparent); font-weight: 600; }\n.kape-cal { padding: 14px 16px; }\n.kape-cal header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 600; font-size: 13px; }\n.kape-cal header button { border: 0; background: none; color: var(--faint); cursor: pointer; }\n.kape-cal__grid { display: grid; grid-template-columns: repeat(7, 30px); gap: 2px; }\n.kape-cal__grid button { height: 30px; font: inherit; font-size: 12.5px; color: var(--ink); background: none; border: 0; border-radius: var(--radius-xs); cursor: pointer; }\n.kape-cal__grid .in-range { background: color-mix(in oklab, var(--accent) 16%, transparent); }\n.kape-cal__grid .is-start, .kape-cal__grid .is-end { background: var(--accent); color: var(--on-accent); font-weight: 700; }\n.kape-range__pop footer { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--line); }\n.kape-btn--ink { background: var(--ink); color: var(--paper); border-color: transparent; }"
  },
  {
    "key": "cmdk",
    "label": "Command palette",
    "cat": "Overlays",
    "props": [
      {
        "name": "commands",
        "type": "Array<{ id: string, label: string, group: string, run: () => void }>",
        "default": "[]",
        "required": true,
        "description": "Everything runnable"
      },
      {
        "name": "open",
        "type": "boolean",
        "default": "false",
        "required": true,
        "description": "Whether the palette is mounted and modal"
      },
      {
        "name": "hotkey",
        "type": "string",
        "default": "k",
        "required": false,
        "description": "Key paired with Cmd or Ctrl"
      },
      {
        "name": "placeholder",
        "type": "string",
        "default": "Type a command or search",
        "required": false,
        "description": "Hint in the field"
      }
    ],
    "a11y": {
      "roles": [
        "Native dialog for the shell, role=\"listbox\" on the results, role=\"option\" on each hit"
      ],
      "attrs": [
        "aria-activedescendant on the input so focus stays in the field while the cursor moves",
        "aria-expanded and aria-controls on the input",
        "Group headings are presentation only: they must not be options",
        "aria-live=\"polite\" count of hits so an empty search is announced"
      ],
      "keys": [
        "Cmd K or Ctrl K opens and closes",
        "Arrow Down and Arrow Up move the cursor, wrapping at the ends",
        "Enter runs the active command, Escape closes and restores focus to the opener"
      ]
    },
    "html": "<dialog class=\"kape-cmdk\" open>\n  <label><kape-icon name=\"grinder\" size=\"18\"></kape-icon><input placeholder=\"Type a command or search\" value=\"void\"><kbd>esc</kbd></label>\n  <ul role=\"listbox\">\n    <li class=\"kape-cmdk__group\">Actions</li>\n    <li role=\"option\" aria-selected=\"true\"><kape-icon name=\"coffee-cup\" size=\"20\"></kape-icon> Void an order <kbd>⏎</kbd></li>\n    <li role=\"option\"><kape-icon name=\"coffee-bean\" size=\"18\"></kape-icon> Void today's refunds report</li>\n    <li class=\"kape-cmdk__group\">Orders</li>\n    <li role=\"option\"><small>#2377</small> Doppio, Kalayaan <span>Refunded</span></li>\n  </ul>\n  <footer><kbd>↑↓</kbd> move <kbd>⏎</kbd> run <kbd>⌘K</kbd> open</footer>\n</dialog>",
    "react": "useEffect(() => {\n  const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen((o) => !o); } };\n  window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);\n}, []);\nconst hits = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));\n\n{open && <dialog className=\"kape-cmdk\" open>\n  <label><KapeIcon name=\"grinder\" size={18} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} /><kbd>esc</kbd></label>\n  <ul role=\"listbox\">{hits.map((c, i) => <li key={c.id} role=\"option\" aria-selected={i === cursor} onClick={c.run}>{c.label}</li>)}</ul>\n</dialog>}",
    "css": ".kape-cmdk { width: min(560px, 100%); padding: 0; color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong); border-radius: var(--radius); overflow: hidden; font-size: 13.5px; }\n.kape-cmdk::backdrop { background: color-mix(in oklab, var(--ink) 35%, transparent); }\n.kape-cmdk label { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--line); }\n.kape-cmdk label > kape-icon { color: var(--faint); }\n.kape-cmdk input { flex: 1; border: 0; outline: 0; background: none; font: inherit; color: inherit; }\n.kape-cmdk kbd { font: 11px ui-monospace, monospace; color: var(--faint); border: 1px solid var(--line); border-radius: var(--radius-xs); padding: 2px 6px; }\n.kape-cmdk ul { margin: 0; padding: 6px; list-style: none; }\n.kape-cmdk__group { padding: 6px 10px 4px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--faint); }\n.kape-cmdk [role=\"option\"] { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius-xs); cursor: pointer; }\n.kape-cmdk [role=\"option\"] kbd, .kape-cmdk [role=\"option\"] span { margin-left: auto; color: var(--muted); font-size: 12px; }\n.kape-cmdk [aria-selected=\"true\"], .kape-cmdk [role=\"option\"]:hover { background: color-mix(in oklab, var(--accent) 16%, transparent); }\n.kape-cmdk footer { display: flex; gap: 14px; padding: 8px 14px; border-top: 1px solid var(--line); font-size: 11.5px; color: var(--faint); }"
  },
  {
    "key": "drawer",
    "label": "Drawer",
    "cat": "Overlays",
    "props": [
      {
        "name": "open",
        "type": "boolean",
        "default": "false",
        "required": true,
        "description": "Whether the drawer is shown"
      },
      {
        "name": "title",
        "type": "string",
        "default": "—",
        "required": true,
        "description": "What the drawer is about"
      },
      {
        "name": "lines",
        "type": "Array<{ id: string, qty: number, name: string, total: string }>",
        "default": "[]",
        "required": false,
        "description": "Order lines"
      },
      {
        "name": "side",
        "type": "'right' | 'left'",
        "default": "right",
        "required": false,
        "description": "Which edge it slides from"
      },
      {
        "name": "onClose",
        "type": "() => void",
        "default": "—",
        "required": true,
        "description": "Fired by the close button, backdrop or Escape"
      }
    ],
    "a11y": {
      "roles": [
        "Native dialog, so role=\"dialog\" and aria-modal come free and the backdrop is real"
      ],
      "attrs": [
        "aria-labelledby pointing at the header text",
        "Focus moves to the close button on open and back to the opener on close",
        "inert is unnecessary: showModal already blocks the page"
      ],
      "keys": [
        "Escape closes (native)",
        "Tab cycles inside the drawer only (native)",
        "The footer actions are the last two stops, in destructive-last order"
      ]
    },
    "html": "<dialog class=\"kape-drawer\" open>\n  <header>Order #2381 <button aria-label=\"Close\">✕</button></header>\n  <div class=\"kape-drawer__body\">\n    <div class=\"kape-line\"><span>2 × Kapeng barako</span><span class=\"num\">₱130</span></div>\n    <div class=\"kape-line\"><span>1 × Ube latte</span><span class=\"num\">₱135</span></div>\n    <div class=\"kape-line kape-line--total\"><span>Total</span><span class=\"num\">₱265</span></div>\n    <span class=\"kape-tag kape-tag--accent\">Making</span>\n  </div>\n  <footer><button class=\"kape-btn\">Refund</button><button class=\"kape-btn kape-btn--ink\">Mark ready</button></footer>\n</dialog>",
    "react": "const ref = useRef();\nuseEffect(() => { open ? ref.current.showModal() : ref.current.close(); }, [open]);\n\n<dialog ref={ref} className=\"kape-drawer\" onClose={() => setOpen(false)}>\n  <header>Order #{order.id} <button onClick={() => setOpen(false)} aria-label=\"Close\">✕</button></header>\n  <div className=\"kape-drawer__body\">{order.lines.map((l) => <div key={l.id} className=\"kape-line\"><span>{l.qty} × {l.name}</span><span className=\"num\">₱{l.total}</span></div>)}</div>\n  <footer><button className=\"kape-btn\" onClick={refund}>Refund</button><button className=\"kape-btn kape-btn--ink\" onClick={ready}>Mark ready</button></footer>\n</dialog>",
    "css": ".kape-drawer { position: fixed; inset: 0 0 0 auto; width: min(420px, 100%); height: 100%; max-height: none; margin: 0; padding: 0; display: flex; flex-direction: column; color: var(--ink); background: var(--paper); border: 0; border-left: 1px solid var(--line); font-size: 13.5px; }\n.kape-drawer::backdrop { background: color-mix(in oklab, var(--ink) 35%, transparent); }\n.kape-drawer header, .kape-drawer footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 14px 16px; font-weight: 600; }\n.kape-drawer header { border-bottom: 1px solid var(--line); }\n.kape-drawer header button { border: 0; background: none; color: var(--faint); cursor: pointer; }\n.kape-drawer__body { flex: 1; overflow: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }\n.kape-drawer footer { border-top: 1px solid var(--line); }\n.kape-drawer footer .kape-btn { flex: 1; justify-content: center; }\n.kape-line { display: flex; justify-content: space-between; }\n.kape-line .num { font-family: ui-monospace, monospace; }\n.kape-line--total { padding-top: 10px; border-top: 1px solid var(--line); font-weight: 600; }"
  }
];

const INDEX = new Map(components.map((c) => [c.key, c]));

/** Look a component up by key. Returns undefined rather than throwing, like icon lookup. */
export const get = (key) => INDEX.get(key);

/** Components in one UI_NAV group, in canvas order. */
export const byCategory = (cat) => components.filter((c) => c.cat === cat);
