/**
 * Kapehan component manifest: 30 components.
 *
 * GENERATED from design/Kapehan.dc.html by scripts/components.mjs. Do not edit by hand;
 * edit the canvas and run `npm run build`. npm test fails if this drifts.
 *
 * Each entry carries the markup for four stacks plus the props table and the accessibility
 * contract, so the React, Vue, Blazor, Tailwind and docs generators all read one source.
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
    "vue": "<script setup>\ndefineProps({\n  label: { type: String, default: \"Order now\" },\n  variant: { type: String, default: \"default\" },\n  icon: { type: String, default: null },\n  disabled: Boolean,\n});\n</script>\n\n<template>\n  <button\n    class=\"kape-btn\"\n    :class=\"{ 'kape-btn--primary': variant === 'primary', 'kape-btn--ghost': variant === 'ghost' }\"\n    :disabled=\"disabled\"\n    @click=\"$emit('click', $event)\">\n    <KapeIcon v-if=\"icon\" :name=\"icon\" :size=\"20\" />\n    <span v-text=\"label\"></span>\n  </button>\n</template>",
    "blazor": "@* KapeButton.razor *@\n<button class=\"@Classes\" disabled=\"@Disabled\" @onclick=\"OnClick\">\n    @if (Icon is not null)\n    {\n        <KapeIcon Name=\"@Icon\" Size=\"20\" />\n    }\n    @Label\n</button>\n\n@code {\n    [Parameter] public string Label { get; set; } = \"Order now\";\n    [Parameter] public string Variant { get; set; } = \"default\";\n    [Parameter] public string? Icon { get; set; }\n    [Parameter] public bool Disabled { get; set; }\n    [Parameter] public EventCallback<MouseEventArgs> OnClick { get; set; }\n\n    private string Classes => Variant switch\n    {\n        \"primary\" => \"kape-btn kape-btn--primary\",\n        \"ghost\" => \"kape-btn kape-btn--ghost\",\n        _ => \"kape-btn\",\n    };\n}",
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
    "vue": "<script setup>\nimport { ref } from \"vue\";\nconst props = defineProps({ options: { type: Array, default: () => [\"All\", \"Hot\", \"Iced\"] } });\nconst pick = ref(props.options[0]);\n</script>\n\n<template>\n  <button\n    v-for=\"c in options\"\n    :key=\"c\"\n    class=\"kape-chip\"\n    :aria-pressed=\"pick === c\"\n    @click=\"pick = c\"\n    v-text=\"c\"></button>\n</template>",
    "blazor": "@* KapeChips.razor *@\n@foreach (var c in Options)\n{\n    <button class=\"kape-chip\" aria-pressed=\"@(Value == c)\" @onclick=\"() => Select(c)\">@c</button>\n}\n\n@code {\n    [Parameter] public string[] Options { get; set; } = [\"All\", \"Hot\", \"Iced\"];\n    [Parameter] public string Value { get; set; } = \"All\";\n    [Parameter] public EventCallback<string> ValueChanged { get; set; }\n\n    private Task Select(string c) => ValueChanged.InvokeAsync(c);\n}",
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
    "vue": "<script setup>\ndefineProps({ placeholder: { type: String, default: \"Search the menu\" }, icon: { type: String, default: \"grinder\" }, type: { type: String, default: \"search\" } });\nconst model = defineModel({ type: String, default: \"\" });\n</script>\n\n<template>\n  <label class=\"kape-input\">\n    <KapeIcon v-if=\"icon\" :name=\"icon\" :size=\"18\" />\n    <input v-model=\"model\" :type=\"type\" :placeholder=\"placeholder\" />\n  </label>\n</template>",
    "blazor": "@* KapeInput.razor *@\n<label class=\"kape-input\">\n    @if (Icon is not null)\n    {\n        <KapeIcon Name=\"@Icon\" Size=\"18\" />\n    }\n    <input type=\"@Type\" placeholder=\"@Placeholder\" @bind=\"Value\" @bind:event=\"oninput\" />\n</label>\n\n@code {\n    [Parameter] public string Value { get; set; } = \"\";\n    [Parameter] public EventCallback<string> ValueChanged { get; set; }\n    [Parameter] public string Placeholder { get; set; } = \"Search the menu\";\n    [Parameter] public string? Icon { get; set; } = \"grinder\";\n    [Parameter] public string Type { get; set; } = \"search\";\n}",
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
    "vue": "<script setup>\ndefineProps({ options: { type: Array, default: () => [\"Pick up\", \"Deliver\"] } });\nconst mode = defineModel({ type: String, default: \"Pick up\" });\n</script>\n\n<template>\n  <div class=\"kape-seg\" role=\"group\" aria-label=\"Fulfilment\">\n    <button v-for=\"m in options\" :key=\"m\" :aria-pressed=\"mode === m\" @click=\"mode = m\" v-text=\"m\"></button>\n  </div>\n</template>",
    "blazor": "@* KapeSegmented.razor *@\n<div class=\"kape-seg\" role=\"group\" aria-label=\"@Label\">\n    @foreach (var m in Options)\n    {\n        <button aria-pressed=\"@(Value == m)\" @onclick=\"() => ValueChanged.InvokeAsync(m)\">@m</button>\n    }\n</div>\n\n@code {\n    [Parameter] public string[] Options { get; set; } = [\"Pick up\", \"Deliver\"];\n    [Parameter] public string Value { get; set; } = \"Pick up\";\n    [Parameter] public EventCallback<string> ValueChanged { get; set; }\n    [Parameter] public string Label { get; set; } = \"Fulfilment\";\n}",
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
    "vue": "<script setup>\nimport { onMounted } from \"vue\";\nconst props = defineProps({ message: String, tone: { type: String, default: \"info\" }, actionLabel: { type: String, default: null }, timeout: { type: Number, default: 6000 } });\nconst emit = defineEmits([\"close\", \"action\"]);\nonMounted(() => {\n  if (props.timeout > 0 && props.tone !== \"warn\") setTimeout(() => emit(\"close\"), props.timeout);\n});\n</script>\n\n<template>\n  <div class=\"kape-toast\" :class=\"{ 'kape-toast--warn': tone === 'warn' }\" :role=\"tone === 'warn' ? 'alert' : 'status'\">\n    <KapeIcon :name=\"tone === 'warn' ? 'coffee-bean' : 'coffee-cup'\" :size=\"20\" />\n    <span class=\"kape-toast__text\" v-text=\"message\"></span>\n    <button v-if=\"actionLabel\" class=\"kape-toast__action\" @click=\"emit('action')\" v-text=\"actionLabel\"></button>\n  </div>\n</template>",
    "blazor": "@* KapeToast.razor *@\n@implements IDisposable\n\n<div class=\"kape-toast @(Tone == \"warn\" ? \"kape-toast--warn\" : \"\")\" role=\"@(Tone == \"warn\" ? \"alert\" : \"status\")\">\n    <KapeIcon Name=\"@(Tone == \"warn\" ? \"coffee-bean\" : \"coffee-cup\")\" Size=\"20\" />\n    <span class=\"kape-toast__text\">@Message</span>\n    @if (ActionLabel is not null)\n    {\n        <button class=\"kape-toast__action\" @onclick=\"OnAction\">@ActionLabel</button>\n    }\n</div>\n\n@code {\n    [Parameter] public string Message { get; set; } = \"\";\n    [Parameter] public string Tone { get; set; } = \"info\";\n    [Parameter] public string? ActionLabel { get; set; }\n    [Parameter] public int Timeout { get; set; } = 6000;\n    [Parameter] public EventCallback OnClose { get; set; }\n    [Parameter] public EventCallback OnAction { get; set; }\n\n    private CancellationTokenSource? _cts;\n\n    protected override void OnInitialized()\n    {\n        if (Timeout <= 0 || Tone == \"warn\") return;\n        _cts = new CancellationTokenSource();\n        _ = Task.Delay(Timeout, _cts.Token).ContinueWith(_ => OnClose.InvokeAsync(), TaskContinuationOptions.OnlyOnRanToCompletion);\n    }\n\n    public void Dispose() => _cts?.Cancel();\n}",
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
    "vue": "<script setup>\ndefineProps({\n  total: { type: Number, default: 10 },\n  filled: { type: Number, default: 0 },\n  label: { type: String, default: \"Loyalty card\" },\n  icon: { type: String, default: \"coffee-bean\" },\n});\n</script>\n\n<template>\n  <div class=\"kape-stamps\" role=\"group\" :aria-label=\"label\">\n    <span v-for=\"i in total\" :key=\"i\" :data-on=\"i <= filled ? '' : null\" aria-hidden=\"true\">\n      <KapeIcon v-if=\"i <= filled\" :name=\"icon\" :size=\"16\" />\n    </span>\n  </div>\n  <p class=\"kape-sr\">\n    <span v-text=\"filled\"></span> of <span v-text=\"total\"></span> stamps earned\n  </p>\n</template>",
    "blazor": "@* KapeStamps.razor *@\n<div class=\"kape-stamps\" role=\"group\" aria-label=\"@Label\">\n    @for (var i = 1; i <= Total; i++)\n    {\n        var on = i <= Filled;\n        <span data-on=\"@(on ? \"\" : null)\" aria-hidden=\"true\">\n            @if (on)\n            {\n                <KapeIcon Name=\"@Icon\" Size=\"16\" />\n            }\n        </span>\n    }\n</div>\n<p class=\"kape-sr\">@Filled of @Total stamps earned</p>\n\n@code {\n    [Parameter] public int Total { get; set; } = 10;\n    [Parameter] public int Filled { get; set; }\n    [Parameter] public string Label { get; set; } = \"Loyalty card\";\n    [Parameter] public string Icon { get; set; } = \"coffee-bean\";\n}",
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
    "vue": "<script setup>\ndefineProps({ items: { type: Array, default: () => [] } });\nconst emit = defineEmits([\"pick\"]);\n</script>\n\n<template>\n  <div v-for=\"d in items\" :key=\"d.id\" class=\"kape-row\" @click=\"emit('pick', d)\">\n    <span class=\"kape-row__art\"><KapeIcon :name=\"d.icon\" :size=\"40\" colour /></span>\n    <div class=\"kape-row__body\">\n      <p class=\"kape-row__title\">\n        <span v-text=\"d.name\"></span>\n        <span v-if=\"d.badge\" class=\"kape-badge\" v-text=\"d.badge\"></span>\n      </p>\n      <p class=\"kape-row__sub\" v-text=\"d.sub\"></p>\n    </div>\n    <span class=\"kape-row__price\" v-text=\"d.price\"></span>\n  </div>\n</template>",
    "blazor": "@* KapeMenuRow.razor *@\n@foreach (var d in Items)\n{\n    <div class=\"kape-row\" @onclick=\"() => OnPick.InvokeAsync(d)\">\n        <span class=\"kape-row__art\"><KapeIcon Name=\"@d.Icon\" Size=\"40\" Colour /></span>\n        <div class=\"kape-row__body\">\n            <p class=\"kape-row__title\">\n                @d.Name\n                @if (d.Badge is not null)\n                {\n                    <span class=\"kape-badge\">@d.Badge</span>\n                }\n            </p>\n            <p class=\"kape-row__sub\">@d.Sub</p>\n        </div>\n        <span class=\"kape-row__price\">@d.Price</span>\n    </div>\n}\n\n@code {\n    [Parameter] public IReadOnlyList<MenuItem> Items { get; set; } = [];\n    [Parameter] public EventCallback<MenuItem> OnPick { get; set; }\n}",
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
    "vue": "<script setup>\nconst props = defineProps({ min: { type: Number, default: 1 }, max: { type: Number, default: 99 } });\nconst qty = defineModel({ type: Number, default: 1 });\nconst step = (n) => { qty.value = Math.min(props.max, Math.max(props.min, qty.value + n)); };\n</script>\n\n<template>\n  <div class=\"kape-stepper\" @keydown.up.prevent=\"step(1)\" @keydown.down.prevent=\"step(-1)\">\n    <button aria-label=\"Fewer\" :disabled=\"qty <= min\" @click=\"step(-1)\">&minus;</button>\n    <output aria-live=\"polite\" v-text=\"qty\"></output>\n    <button aria-label=\"More\" :disabled=\"qty >= max\" @click=\"step(1)\">+</button>\n  </div>\n</template>",
    "blazor": "@* KapeStepper.razor *@\n<div class=\"kape-stepper\" @onkeydown=\"OnKey\" tabindex=\"-1\">\n    <button aria-label=\"Fewer\" disabled=\"@(Value <= Min)\" @onclick=\"() => Step(-1)\">&minus;</button>\n    <output aria-live=\"polite\">@Value</output>\n    <button aria-label=\"More\" disabled=\"@(Value >= Max)\" @onclick=\"() => Step(1)\">+</button>\n</div>\n\n@code {\n    [Parameter] public int Value { get; set; } = 1;\n    [Parameter] public EventCallback<int> ValueChanged { get; set; }\n    [Parameter] public int Min { get; set; } = 1;\n    [Parameter] public int Max { get; set; } = 99;\n\n    private Task Step(int n) => ValueChanged.InvokeAsync(Math.Clamp(Value + n, Min, Max));\n\n    private Task OnKey(KeyboardEventArgs e) => e.Key switch\n    {\n        \"ArrowUp\" => Step(1),\n        \"ArrowDown\" => Step(-1),\n        _ => Task.CompletedTask,\n    };\n}",
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
    "vue": "<script setup>\ndefineProps({ label: String, disabled: Boolean });\nconst on = defineModel({ type: Boolean, default: false });\n</script>\n\n<template>\n  <label class=\"kape-switch\">\n    <input type=\"checkbox\" v-model=\"on\" :disabled=\"disabled\" />\n  </label>\n  <span v-text=\"label\"></span>\n</template>",
    "blazor": "@* KapeSwitch.razor *@\n<label class=\"kape-switch\">\n    <input type=\"checkbox\" @bind=\"Value\" disabled=\"@Disabled\" />\n</label>\n<span>@Label</span>\n\n@code {\n    [Parameter] public bool Value { get; set; }\n    [Parameter] public EventCallback<bool> ValueChanged { get; set; }\n    [Parameter] public string Label { get; set; } = \"\";\n    [Parameter] public bool Disabled { get; set; }\n}",
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
    "vue": "<script setup>\ndefineProps({ options: { type: Array, default: () => [\"12 oz\", \"16 oz\"] }, mode: { type: String, default: \"radio\" }, name: { type: String, required: true } });\nconst model = defineModel();\n</script>\n\n<template>\n  <label v-for=\"s in options\" :key=\"s\" :class=\"mode === 'radio' ? 'kape-radio' : 'kape-check'\">\n    <input :type=\"mode\" :name=\"name\" :value=\"s\" v-model=\"model\" />\n    <span v-text=\"s\"></span>\n  </label>\n</template>",
    "blazor": "@* KapeChoice.razor *@\n<fieldset>\n    <legend>@Legend</legend>\n    @foreach (var s in Options)\n    {\n        <label class=\"@(Mode == \"radio\" ? \"kape-radio\" : \"kape-check\")\">\n            <input type=\"@Mode\" name=\"@Name\" value=\"@s\" checked=\"@(Value == s)\" @onchange=\"() => ValueChanged.InvokeAsync(s)\" />\n            <span>@s</span>\n        </label>\n    }\n</fieldset>\n\n@code {\n    [Parameter] public string[] Options { get; set; } = [\"12 oz\", \"16 oz\"];\n    [Parameter] public string Mode { get; set; } = \"radio\";\n    [Parameter] public string Name { get; set; } = \"size\";\n    [Parameter] public string Legend { get; set; } = \"Size\";\n    [Parameter] public string? Value { get; set; }\n    [Parameter] public EventCallback<string> ValueChanged { get; set; }\n}",
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
    "vue": "<script setup>\ndefineProps({ options: { type: Array, default: () => [] } });\nconst model = defineModel({ type: String });\n</script>\n\n<template>\n  <label class=\"kape-select\">\n    <select v-model=\"model\">\n      <option v-for=\"b in options\" :key=\"b.id\" :value=\"b.id\" v-text=\"b.name\"></option>\n    </select>\n  </label>\n</template>",
    "blazor": "@* KapeSelect.razor *@\n<label class=\"kape-select\">\n    <select @bind=\"Value\">\n        @foreach (var b in Options)\n        {\n            <option value=\"@b.Id\">@b.Name</option>\n        }\n    </select>\n</label>\n\n@code {\n    [Parameter] public IReadOnlyList<Branch> Options { get; set; } = [];\n    [Parameter] public string? Value { get; set; }\n    [Parameter] public EventCallback<string> ValueChanged { get; set; }\n}",
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
    "vue": "<script setup>\nconst props = defineProps({ tabs: { type: Array, default: () => [\"Menu\", \"Beans\", \"Our shop\"] } });\nconst tab = defineModel({ type: String, default: \"Menu\" });\nconst move = (n) => {\n  const i = props.tabs.indexOf(tab.value);\n  tab.value = props.tabs[(i + n + props.tabs.length) % props.tabs.length];\n};\n</script>\n\n<template>\n  <div class=\"kape-tabs\" role=\"tablist\" @keydown.left.prevent=\"move(-1)\" @keydown.right.prevent=\"move(1)\">\n    <button\n      v-for=\"t in tabs\"\n      :key=\"t\"\n      role=\"tab\"\n      :aria-selected=\"tab === t\"\n      :tabindex=\"tab === t ? 0 : -1\"\n      @click=\"tab = t\"\n      v-text=\"t\"></button>\n  </div>\n</template>",
    "blazor": "@* KapeTabs.razor *@\n<div class=\"kape-tabs\" role=\"tablist\" @onkeydown=\"OnKey\">\n    @foreach (var t in Tabs)\n    {\n        <button role=\"tab\" aria-selected=\"@(Value == t)\" tabindex=\"@(Value == t ? 0 : -1)\" @onclick=\"() => ValueChanged.InvokeAsync(t)\">@t</button>\n    }\n</div>\n\n@code {\n    [Parameter] public string[] Tabs { get; set; } = [\"Menu\", \"Beans\", \"Our shop\"];\n    [Parameter] public string Value { get; set; } = \"Menu\";\n    [Parameter] public EventCallback<string> ValueChanged { get; set; }\n\n    private Task Move(int n)\n    {\n        var i = Array.IndexOf(Tabs, Value);\n        return ValueChanged.InvokeAsync(Tabs[(i + n + Tabs.Length) % Tabs.Length]);\n    }\n\n    private Task OnKey(KeyboardEventArgs e) => e.Key switch\n    {\n        \"ArrowLeft\" => Move(-1),\n        \"ArrowRight\" => Move(1),\n        \"Home\" => ValueChanged.InvokeAsync(Tabs[0]),\n        \"End\" => ValueChanged.InvokeAsync(Tabs[^1]),\n        _ => Task.CompletedTask,\n    };\n}",
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
    "vue": "<script setup>\ndefineProps({ item: { type: Object, required: true }, size: { type: Number, default: 64 } });\nconst emit = defineEmits([\"add\"]);\n</script>\n\n<template>\n  <article class=\"kape-card\">\n    <KapeIcon :name=\"item.icon\" :size=\"size\" colour />\n    <p class=\"kape-card__title\" v-text=\"item.name\"></p>\n    <p class=\"kape-card__sub\">{{\" \"}}<span v-text=\"item.size\"></span> &middot; <span v-text=\"item.temp\"></span></p>\n    <div class=\"kape-card__foot\">\n      <span class=\"kape-row__price\" v-text=\"item.price\"></span>\n      <button class=\"kape-btn kape-btn--primary\" @click=\"emit('add', item)\">Add</button>\n    </div>\n  </article>\n</template>",
    "blazor": "@* KapeCard.razor *@\n<article class=\"kape-card\">\n    <KapeIcon Name=\"@Item.Icon\" Size=\"@Size\" Colour />\n    <p class=\"kape-card__title\">@Item.Name</p>\n    <p class=\"kape-card__sub\">@Item.Size &middot; @Item.Temp</p>\n    <div class=\"kape-card__foot\">\n        <span class=\"kape-row__price\">@Item.Price</span>\n        <button class=\"kape-btn kape-btn--primary\" @onclick=\"() => OnAdd.InvokeAsync(Item)\">Add</button>\n    </div>\n</article>\n\n@code {\n    [Parameter, EditorRequired] public MenuItem Item { get; set; } = default!;\n    [Parameter] public int Size { get; set; } = 64;\n    [Parameter] public EventCallback<MenuItem> OnAdd { get; set; }\n}",
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
    "vue": "<script setup>\ndefineProps({ label: String, tone: { type: String, default: \"default\" } });\n</script>\n\n<template>\n  <span class=\"kape-tag\" :class=\"{ 'kape-tag--accent': tone === 'accent', 'kape-tag--ink': tone === 'ink' }\" v-text=\"label\"></span>\n</template>",
    "blazor": "@* KapeTag.razor *@\n<span class=\"kape-tag @(Tone == \"accent\" ? \"kape-tag--accent\" : Tone == \"ink\" ? \"kape-tag--ink\" : \"\")\">@Label</span>\n\n@code {\n    [Parameter] public string Label { get; set; } = \"\";\n    [Parameter] public string Tone { get; set; } = \"default\";\n}",
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
    "vue": "<script setup>\ndefineProps({ people: { type: Array, default: () => [] }, max: { type: Number, default: 2 } });\n</script>\n\n<template>\n  <div class=\"kape-avatars\">\n    <span v-for=\"c in people.slice(0, max)\" :key=\"c.id\" class=\"kape-avatar\" v-text=\"c.initials\"></span>\n    <span v-if=\"people.length > max\" class=\"kape-avatar\" :title=\"people.length - max + ' more'\">+<span v-text=\"people.length - max\"></span></span>\n  </div>\n</template>",
    "blazor": "@* KapeAvatars.razor *@\n<div class=\"kape-avatars\">\n    @foreach (var c in People.Take(Max))\n    {\n        <span class=\"kape-avatar\">@c.Initials</span>\n    }\n    @if (People.Count > Max)\n    {\n        <span class=\"kape-avatar\" title=\"@(People.Count - Max) more\">+@(People.Count - Max)</span>\n    }\n</div>\n\n@code {\n    [Parameter] public IReadOnlyList<Person> People { get; set; } = [];\n    [Parameter] public int Max { get; set; } = 2;\n}",
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
    "vue": "<script setup>\nimport { ref, watch } from \"vue\";\nconst props = defineProps({ open: Boolean, title: String, body: String, confirmLabel: { type: String, default: \"Confirm\" } });\nconst emit = defineEmits([\"confirm\", \"close\"]);\nconst el = ref(null);\nwatch(() => props.open, (o) => {\n  if (!el.value) return;\n  if (o) el.value.showModal();\n  else el.value.close();\n});\n</script>\n\n<template>\n  <dialog ref=\"el\" class=\"kape-dialog\" aria-labelledby=\"kape-dialog-title\" @close=\"emit('close')\" @cancel=\"emit('close')\">\n    <h2 id=\"kape-dialog-title\" v-text=\"title\"></h2>\n    <p v-text=\"body\"></p>\n    <div class=\"kape-dialog__actions\">\n      <button class=\"kape-btn kape-btn--ghost\" autofocus @click=\"emit('close')\">Keep it</button>\n      <button class=\"kape-btn kape-btn--ink\" @click=\"emit('confirm')\" v-text=\"confirmLabel\"></button>\n    </div>\n  </dialog>\n</template>",
    "blazor": "@* KapeDialog.razor - showModal needs JS; guarded so prerender never touches it *@\n@inject IJSRuntime JS\n\n<dialog @ref=\"_el\" class=\"kape-dialog\" aria-labelledby=\"kape-dialog-title\">\n    <h2 id=\"kape-dialog-title\">@Title</h2>\n    <p>@Body</p>\n    <div class=\"kape-dialog__actions\">\n        <button class=\"kape-btn kape-btn--ghost\" autofocus @onclick=\"OnClose\">Keep it</button>\n        <button class=\"kape-btn kape-btn--ink\" @onclick=\"OnConfirm\">@ConfirmLabel</button>\n    </div>\n</dialog>\n\n@code {\n    [Parameter] public bool Open { get; set; }\n    [Parameter] public string Title { get; set; } = \"\";\n    [Parameter] public string Body { get; set; } = \"\";\n    [Parameter] public string ConfirmLabel { get; set; } = \"Confirm\";\n    [Parameter] public EventCallback OnConfirm { get; set; }\n    [Parameter] public EventCallback OnClose { get; set; }\n\n    private ElementReference _el;\n    private bool _interactive;\n    private bool _shown;\n\n    // Prerender has no JS runtime, so every interop call waits for the first render.\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (firstRender) _interactive = true;\n        if (!_interactive || Open == _shown) return;\n        _shown = Open;\n        await JS.InvokeVoidAsync(Open ? \"kapehan.dialog.show\" : \"kapehan.dialog.close\", _el);\n    }\n}\n\n@* wwwroot/kapehan.interop.js\n   window.kapehan = window.kapehan || {};\n   window.kapehan.dialog = {\n     show: (el) => el.showModal(),\n     close: (el) => el.close(),\n   }; *@",
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
    "vue": "<script setup>\ndefineProps({ text: { type: String, required: true } });\n</script>\n\n<template>\n  <button class=\"kape-btn kape-tip\" :data-tip=\"text\" :aria-describedby=\"null\" :aria-label=\"undefined\">\n    <slot />\n  </button>\n</template>",
    "blazor": "@* KapeTip.razor *@\n<button class=\"kape-btn kape-tip\" data-tip=\"@Text\">@ChildContent</button>\n\n@code {\n    [Parameter] public string Text { get; set; } = \"\";\n    [Parameter] public RenderFragment? ChildContent { get; set; }\n}",
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
    "vue": "<script setup>\ndefineProps({ lines: { type: Number, default: 3 }, width: { type: String, default: \"60%\" }, loading: { type: Boolean, default: true } });\n</script>\n\n<template>\n  <div :aria-busy=\"loading\">\n    <template v-if=\"loading\">\n      <span v-for=\"i in lines\" :key=\"i\" class=\"kape-skeleton\" :style=\"{ width }\"></span>\n    </template>\n    <slot v-else />\n  </div>\n</template>",
    "blazor": "@* KapeSkeleton.razor *@\n<div aria-busy=\"@Loading\">\n    @if (Loading)\n    {\n        @for (var i = 0; i < Lines; i++)\n        {\n            <span class=\"kape-skeleton\" style=\"width:@Width\"></span>\n        }\n    }\n    else\n    {\n        @ChildContent\n    }\n</div>\n\n@code {\n    [Parameter] public int Lines { get; set; } = 3;\n    [Parameter] public string Width { get; set; } = \"60%\";\n    [Parameter] public bool Loading { get; set; } = true;\n    [Parameter] public RenderFragment? ChildContent { get; set; }\n}",
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
    "vue": "<script setup>\ndefineProps({ value: { type: Number, default: 0 }, label: String });\n</script>\n\n<template>\n  <span class=\"kape-progress\" role=\"progressbar\" :aria-valuenow=\"value\" aria-valuemin=\"0\" aria-valuemax=\"100\" :aria-label=\"label\">\n    <span :style=\"{ width: value + '%' }\"></span>\n  </span>\n</template>",
    "blazor": "@* KapeProgress.razor *@\n<span class=\"kape-progress\" role=\"progressbar\" aria-valuenow=\"@Value\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-label=\"@Label\">\n    <span style=\"width:@(Value)%\"></span>\n</span>\n\n@code {\n    [Parameter] public int Value { get; set; }\n    [Parameter] public string Label { get; set; } = \"\";\n}",
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
    "vue": "<script setup>\nimport { computed } from \"vue\";\nconst props = defineProps({ page: { type: Number, default: 1 }, pages: { type: Number, default: 1 } });\nconst emit = defineEmits([\"change\"]);\nconst list = computed(() => Array.from({ length: props.pages }, (_, i) => i + 1));\n</script>\n\n<template>\n  <nav class=\"kape-pager\" aria-label=\"Pages\">\n    <button :disabled=\"page === 1\" aria-label=\"Previous\" @click=\"emit('change', page - 1)\">&lsaquo;</button>\n    <button v-for=\"p in list\" :key=\"p\" :aria-current=\"p === page ? 'page' : undefined\" @click=\"emit('change', p)\" v-text=\"p\"></button>\n    <button :disabled=\"page === pages\" aria-label=\"Next\" @click=\"emit('change', page + 1)\">&rsaquo;</button>\n  </nav>\n</template>",
    "blazor": "@* KapePager.razor *@\n<nav class=\"kape-pager\" aria-label=\"Pages\">\n    <button disabled=\"@(Page == 1)\" aria-label=\"Previous\" @onclick=\"() => Go(Page - 1)\">&lsaquo;</button>\n    @for (var p = 1; p <= Pages; p++)\n    {\n        var n = p;\n        <button aria-current=\"@(n == Page ? \"page\" : null)\" @onclick=\"() => Go(n)\">@n</button>\n    }\n    <button disabled=\"@(Page == Pages)\" aria-label=\"Next\" @onclick=\"() => Go(Page + 1)\">&rsaquo;</button>\n</nav>\n\n@code {\n    [Parameter] public int Page { get; set; } = 1;\n    [Parameter] public int Pages { get; set; } = 1;\n    [Parameter] public EventCallback<int> PageChanged { get; set; }\n\n    private Task Go(int p) => PageChanged.InvokeAsync(Math.Clamp(p, 1, Pages));\n}",
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
    "vue": "<script setup>\ndefineProps({ items: { type: Array, default: () => [] }, openFirst: Boolean });\n</script>\n\n<template>\n  <details v-for=\"(f, i) in items\" :key=\"f.id\" class=\"kape-acc\" :open=\"openFirst && i === 0\">\n    <summary v-text=\"f.q\"></summary>\n    <p v-text=\"f.a\"></p>\n  </details>\n</template>",
    "blazor": "@* KapeAccordion.razor *@\n@foreach (var (f, i) in Items.Select((f, i) => (f, i)))\n{\n    <details class=\"kape-acc\" open=\"@(OpenFirst && i == 0)\">\n        <summary>@f.Question</summary>\n        <p>@f.Answer</p>\n    </details>\n}\n\n@code {\n    [Parameter] public IReadOnlyList<Faq> Items { get; set; } = [];\n    [Parameter] public bool OpenFirst { get; set; }\n}",
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
    "vue": "<script setup>\ndefineProps({ rows: { type: Array, default: () => [] }, caption: String });\n</script>\n\n<template>\n  <table class=\"kape-table\">\n    <caption class=\"kape-sr\" v-text=\"caption\"></caption>\n    <thead>\n      <tr><th scope=\"col\">Order</th><th scope=\"col\">Items</th><th scope=\"col\">Status</th><th scope=\"col\" class=\"num\">Total</th></tr>\n    </thead>\n    <tbody>\n      <tr v-for=\"o in rows\" :key=\"o.id\">\n        <td>#<span v-text=\"o.id\"></span></td>\n        <td v-text=\"o.summary\"></td>\n        <td><span class=\"kape-tag\" :class=\"{ 'kape-tag--accent': o.status === 'making' }\" v-text=\"o.status\"></span></td>\n        <td class=\"num\" v-text=\"o.total\"></td>\n      </tr>\n    </tbody>\n  </table>\n</template>",
    "blazor": "@* KapeTable.razor *@\n<table class=\"kape-table\">\n    <caption class=\"kape-sr\">@Caption</caption>\n    <thead>\n        <tr><th scope=\"col\">Order</th><th scope=\"col\">Items</th><th scope=\"col\">Status</th><th scope=\"col\" class=\"num\">Total</th></tr>\n    </thead>\n    <tbody>\n        @foreach (var o in Rows)\n        {\n            <tr>\n                <td>#@o.Id</td>\n                <td>@o.Summary</td>\n                <td><span class=\"kape-tag @(o.Status == \"making\" ? \"kape-tag--accent\" : \"\")\">@o.Status</span></td>\n                <td class=\"num\">@o.Total</td>\n            </tr>\n        }\n    </tbody>\n</table>\n\n@code {\n    [Parameter] public IReadOnlyList<Order> Rows { get; set; } = [];\n    [Parameter] public string Caption { get; set; } = \"\";\n}",
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
    "vue": "<script setup>\ndefineProps({ trail: { type: Array, default: () => [] }, label: { type: String, default: \"Breadcrumb\" } });\n</script>\n\n<template>\n  <nav :aria-label=\"label\">\n    <ol class=\"kape-crumbs\">\n      <li v-for=\"(t, i) in trail\" :key=\"t.href\" :aria-current=\"i === trail.length - 1 ? 'page' : undefined\">\n        <a v-if=\"i < trail.length - 1\" :href=\"t.href\" v-text=\"t.label\"></a>\n        <span v-else v-text=\"t.label\"></span>\n      </li>\n    </ol>\n  </nav>\n</template>",
    "blazor": "@* KapeCrumbs.razor *@\n<nav aria-label=\"@Label\">\n    <ol class=\"kape-crumbs\">\n        @foreach (var (t, i) in Trail.Select((t, i) => (t, i)))\n        {\n            var last = i == Trail.Count - 1;\n            <li aria-current=\"@(last ? \"page\" : null)\">\n                @if (last)\n                {\n                    <span>@t.Label</span>\n                }\n                else\n                {\n                    <a href=\"@t.Href\">@t.Label</a>\n                }\n            </li>\n        }\n    </ol>\n</nav>\n\n@code {\n    [Parameter] public IReadOnlyList<Crumb> Trail { get; set; } = [];\n    [Parameter] public string Label { get; set; } = \"Breadcrumb\";\n}",
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
    "vue": "<script setup>\nimport { ref } from \"vue\";\nconst props = defineProps({ accept: { type: String, default: \".csv,.xlsx\" }, maxSize: { type: Number, default: 10485760 }, files: { type: Array, default: () => [] } });\nconst emit = defineEmits([\"files\"]);\nconst over = ref(false);\nconst take = (list) => {\n  emit(\"files\", Array.from(list).filter((f) => f.size <= props.maxSize));\n};\n</script>\n\n<template>\n  <label class=\"kape-drop\" :class=\"{ 'is-over': over }\"\n    @dragover.prevent=\"over = true\" @dragleave=\"over = false\"\n    @drop.prevent=\"over = false; take($event.dataTransfer.files)\">\n    <KapeIcon name=\"coffee-sack\" :size=\"36\" />\n    <strong>Drop the menu sheet here</strong>\n    <span>CSV or XLSX, up to 10 MB. Or <u>browse</u>.</span>\n    <input type=\"file\" :accept=\"accept\" hidden @change=\"take($event.target.files)\" />\n  </label>\n\n  <div v-for=\"f in files\" :key=\"f.name\" class=\"kape-file\">\n    <span class=\"kape-file__ext\" v-text=\"f.ext\"></span>\n    <div class=\"kape-file__body\">\n      <span v-text=\"f.name\"></span>\n      <span class=\"kape-progress\" role=\"progressbar\" :aria-valuenow=\"f.pct\" :aria-label=\"'Uploading ' + f.name\">\n        <span :style=\"{ width: f.pct + '%' }\"></span>\n      </span>\n    </div>\n    <button aria-label=\"Cancel\" @click=\"$emit('cancel', f)\">&times;</button>\n  </div>\n</template>",
    "blazor": "@* KapeUpload.razor *@\n<label class=\"kape-drop\">\n    <KapeIcon Name=\"coffee-sack\" Size=\"36\" />\n    <strong>Drop the menu sheet here</strong>\n    <span>CSV or XLSX, up to 10 MB. Or <u>browse</u>.</span>\n    <InputFile OnChange=\"Take\" accept=\"@Accept\" hidden multiple />\n</label>\n\n@foreach (var f in Files)\n{\n    <div class=\"kape-file\">\n        <span class=\"kape-file__ext\">@f.Ext</span>\n        <div class=\"kape-file__body\">\n            <span>@f.Name</span>\n            <span class=\"kape-progress\" role=\"progressbar\" aria-valuenow=\"@f.Percent\" aria-label=\"Uploading @f.Name\">\n                <span style=\"width:@(f.Percent)%\"></span>\n            </span>\n        </div>\n        <button aria-label=\"Cancel\" @onclick=\"() => OnCancel.InvokeAsync(f)\">&times;</button>\n    </div>\n}\n\n@code {\n    [Parameter] public string Accept { get; set; } = \".csv,.xlsx\";\n    [Parameter] public long MaxSize { get; set; } = 10_485_760;\n    [Parameter] public IReadOnlyList<UploadFile> Files { get; set; } = [];\n    [Parameter] public EventCallback<IReadOnlyList<IBrowserFile>> OnFiles { get; set; }\n    [Parameter] public EventCallback<UploadFile> OnCancel { get; set; }\n\n    private Task Take(InputFileChangeEventArgs e) =>\n        OnFiles.InvokeAsync(e.GetMultipleFiles().Where(f => f.Size <= MaxSize).ToList());\n}",
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
    "vue": "<script setup>\nimport { ref, nextTick } from \"vue\";\ndefineProps({ rows: { type: Array, default: () => [] } });\nconst emit = defineEmits([\"save\"]);\nconst editing = ref(null);\nconst draft = ref(\"\");\nconst field = ref(null);\n\nconst start = async (d) => {\n  editing.value = d.id;\n  draft.value = String(d.price);\n  await nextTick();\n  field.value?.[0]?.focus();\n};\nconst commit = (d) => {\n  const n = Number(draft.value);\n  if (!Number.isNaN(n)) emit(\"save\", d.id, n);\n  editing.value = null;\n};\nconst cancel = () => { editing.value = null; };\n</script>\n\n<template>\n  <table class=\"kape-table kape-table--edit\">\n    <thead>\n      <tr><th scope=\"col\">Drink</th><th scope=\"col\">Size</th><th scope=\"col\" class=\"num\">Price</th><th scope=\"col\" class=\"num\">Stock</th></tr>\n    </thead>\n    <tbody>\n      <tr v-for=\"d in rows\" :key=\"d.id\" :class=\"{ 'is-editing': editing === d.id }\"\n        @dblclick=\"start(d)\" @keydown.f2=\"start(d)\">\n        <td v-text=\"d.name\"></td>\n        <td v-text=\"d.size\"></td>\n        <td class=\"num\">\n          <input v-if=\"editing === d.id\" ref=\"field\" v-model=\"draft\" inputmode=\"numeric\"\n            @keydown.enter.prevent=\"commit(d)\" @keydown.esc.prevent=\"cancel\" @blur=\"commit(d)\" />\n          <span v-else v-text=\"d.price\"></span>\n        </td>\n        <td class=\"num\">\n          <span v-text=\"d.stock\"></span>\n          <button v-if=\"editing === d.id\" class=\"kape-btn kape-btn--sm\" @mousedown.prevent=\"commit(d)\">Save</button>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n  <p class=\"kape-sr\" aria-live=\"polite\" v-text=\"status\"></p>\n</template>",
    "blazor": "@* KapeEditableTable.razor *@\n<table class=\"kape-table kape-table--edit\">\n    <thead>\n        <tr><th scope=\"col\">Drink</th><th scope=\"col\">Size</th><th scope=\"col\" class=\"num\">Price</th><th scope=\"col\" class=\"num\">Stock</th></tr>\n    </thead>\n    <tbody>\n        @foreach (var d in Rows)\n        {\n            var row = d;\n            <tr class=\"@(_editing == row.Id ? \"is-editing\" : \"\")\" @ondblclick=\"() => Start(row)\" @onkeydown=\"e => OnKey(e, row)\">\n                <td>@row.Name</td>\n                <td>@row.Size</td>\n                <td class=\"num\">\n                    @if (_editing == row.Id)\n                    {\n                        <input @bind=\"_draft\" @bind:event=\"oninput\" inputmode=\"numeric\" @onblur=\"() => Commit(row)\" />\n                    }\n                    else\n                    {\n                        @row.Price\n                    }\n                </td>\n                <td class=\"num\">\n                    @row.Stock\n                    @if (_editing == row.Id)\n                    {\n                        <button class=\"kape-btn kape-btn--sm\" @onclick=\"() => Commit(row)\">Save</button>\n                    }\n                </td>\n            </tr>\n        }\n    </tbody>\n</table>\n<p class=\"kape-sr\" aria-live=\"polite\">@_status</p>\n\n@code {\n    [Parameter] public IReadOnlyList<Drink> Rows { get; set; } = [];\n    [Parameter] public EventCallback<(string Id, decimal Price)> OnSave { get; set; }\n\n    private string? _editing;\n    private string _draft = \"\";\n    private string _status = \"\";\n\n    private void Start(Drink d)\n    {\n        _editing = d.Id;\n        _draft = d.Price.ToString();\n    }\n\n    private async Task Commit(Drink d)\n    {\n        if (decimal.TryParse(_draft, out var price))\n        {\n            await OnSave.InvokeAsync((d.Id, price));\n            _status = $\"{d.Name} saved at {price}\";\n        }\n        _editing = null;\n    }\n\n    private async Task OnKey(KeyboardEventArgs e, Drink d)\n    {\n        switch (e.Key)\n        {\n            case \"Enter\": await Commit(d); break;\n            case \"Escape\": _editing = null; break;\n            case \"F2\": Start(d); break;\n        }\n    }\n}",
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
    "vue": "<script setup>\nimport { ref, computed } from \"vue\";\nconst props = defineProps({ options: { type: Array, default: () => [] }, placeholder: { type: String, default: \"Add…\" } });\nconst picked = defineModel({ type: Array, default: () => [] });\n\nconst q = ref(\"\");\nconst open = ref(false);\nconst cursor = ref(0);\n\nconst hits = computed(() => props.options.filter((a) => a.name.toLowerCase().includes(q.value.toLowerCase())));\nconst byId = (id) => props.options.find((a) => a.id === id);\n\nconst toggle = (id) => {\n  picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id];\n};\nconst move = (n) => {\n  if (!hits.value.length) return;\n  cursor.value = (cursor.value + n + hits.value.length) % hits.value.length;\n};\nconst onKeydown = (e) => {\n  if (e.key === \"ArrowDown\") { open.value = true; move(1); e.preventDefault(); }\n  else if (e.key === \"ArrowUp\") { move(-1); e.preventDefault(); }\n  else if (e.key === \"Enter\" && open.value) { toggle(hits.value[cursor.value].id); e.preventDefault(); }\n  else if (e.key === \"Escape\") { open.value = false; }\n  else if (e.key === \"Backspace\" && !q.value && picked.value.length) { picked.value = picked.value.slice(0, -1); }\n};\n</script>\n\n<template>\n  <div class=\"kape-combo\" role=\"combobox\" :aria-expanded=\"open\" aria-haspopup=\"listbox\" aria-controls=\"kape-combo-list\">\n    <div class=\"kape-combo__field\">\n      <span v-for=\"id in picked\" :key=\"id\" class=\"kape-chip\">\n        <span v-text=\"byId(id)?.name\"></span>\n        <button :aria-label=\"'Remove ' + byId(id)?.name\" @click=\"toggle(id)\">&times;</button>\n      </span>\n      <input\n        v-model=\"q\"\n        :placeholder=\"placeholder\"\n        :aria-activedescendant=\"open && hits[cursor] ? 'kape-opt-' + hits[cursor].id : undefined\"\n        @focus=\"open = true\"\n        @keydown=\"onKeydown\" />\n    </div>\n    <ul v-if=\"open\" id=\"kape-combo-list\" class=\"kape-combo__list\" role=\"listbox\" aria-multiselectable=\"true\">\n      <li\n        v-for=\"(a, i) in hits\"\n        :id=\"'kape-opt-' + a.id\"\n        :key=\"a.id\"\n        role=\"option\"\n        :aria-selected=\"picked.includes(a.id)\"\n        :class=\"{ 'is-active': i === cursor }\"\n        @mousedown.prevent=\"toggle(a.id)\">\n        <span v-text=\"a.name\"></span>\n        <small>+<span v-text=\"a.price\"></span></small>\n      </li>\n    </ul>\n  </div>\n</template>",
    "blazor": "@* KapeCombobox.razor *@\n<div class=\"kape-combo\" role=\"combobox\" aria-expanded=\"@_open\" aria-haspopup=\"listbox\" aria-controls=\"kape-combo-list\">\n    <div class=\"kape-combo__field\">\n        @foreach (var id in Value)\n        {\n            var addon = Options.First(a => a.Id == id);\n            <span class=\"kape-chip\">\n                @addon.Name\n                <button aria-label=\"Remove @addon.Name\" @onclick=\"() => Toggle(id)\">&times;</button>\n            </span>\n        }\n        <input @bind=\"_query\" @bind:event=\"oninput\" placeholder=\"@Placeholder\"\n               aria-activedescendant=\"@ActiveId\" @onfocus=\"() => _open = true\" @onkeydown=\"OnKey\" />\n    </div>\n    @if (_open)\n    {\n        <ul id=\"kape-combo-list\" class=\"kape-combo__list\" role=\"listbox\" aria-multiselectable=\"true\">\n            @foreach (var (a, i) in Hits.Select((a, i) => (a, i)))\n            {\n                var addon = a;\n                <li id=\"kape-opt-@addon.Id\" role=\"option\" aria-selected=\"@Value.Contains(addon.Id)\"\n                    class=\"@(i == _cursor ? \"is-active\" : \"\")\" @onclick=\"() => Toggle(addon.Id)\">\n                    @addon.Name <small>+@addon.Price</small>\n                </li>\n            }\n        </ul>\n    }\n</div>\n\n@code {\n    [Parameter] public IReadOnlyList<Addon> Options { get; set; } = [];\n    [Parameter] public IReadOnlyList<string> Value { get; set; } = [];\n    [Parameter] public EventCallback<IReadOnlyList<string>> ValueChanged { get; set; }\n    [Parameter] public string Placeholder { get; set; } = \"Add…\";\n\n    private string _query = \"\";\n    private bool _open;\n    private int _cursor;\n\n    private List<Addon> Hits => Options.Where(a => a.Name.Contains(_query, StringComparison.OrdinalIgnoreCase)).ToList();\n    private string? ActiveId => _open && _cursor < Hits.Count ? $\"kape-opt-{Hits[_cursor].Id}\" : null;\n\n    private Task Toggle(string id)\n    {\n        var next = Value.Contains(id) ? Value.Where(x => x != id).ToList() : [.. Value, id];\n        return ValueChanged.InvokeAsync(next);\n    }\n\n    private void Move(int n)\n    {\n        if (Hits.Count == 0) return;\n        _cursor = (_cursor + n + Hits.Count) % Hits.Count;\n    }\n\n    private async Task OnKey(KeyboardEventArgs e)\n    {\n        switch (e.Key)\n        {\n            case \"ArrowDown\": _open = true; Move(1); break;\n            case \"ArrowUp\": Move(-1); break;\n            case \"Enter\" when _open && _cursor < Hits.Count: await Toggle(Hits[_cursor].Id); break;\n            case \"Escape\": _open = false; break;\n            case \"Backspace\" when _query.Length == 0 && Value.Count > 0:\n                await ValueChanged.InvokeAsync(Value.Take(Value.Count - 1).ToList());\n                break;\n        }\n    }\n}",
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
    "vue": "<script setup>\nimport { ref, computed } from \"vue\";\nconst props = defineProps({ options: { type: Array, default: () => [] }, max: { type: Number, default: null } });\nconst picked = defineModel({ type: Array, default: () => [] });\n\nconst open = ref(false);\nconst cursor = ref(0);\nconst full = computed(() => props.max !== null && picked.value.length >= props.max);\nconst byId = (id) => props.options.find((o) => o.id === id);\nconst blocked = (id) => full.value && !picked.value.includes(id);\n\nconst toggle = (id) => {\n  if (blocked(id)) return;\n  picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id];\n};\nconst move = (n) => {\n  cursor.value = (cursor.value + n + props.options.length) % props.options.length;\n};\nconst onKeydown = (e) => {\n  const k = e.key;\n  if (k === \"ArrowDown\") { open.value = true; move(1); e.preventDefault(); }\n  else if (k === \"ArrowUp\") { move(-1); e.preventDefault(); }\n  else if (k === \" \" || k === \"Enter\") { open.value ? toggle(props.options[cursor.value].id) : (open.value = true); e.preventDefault(); }\n  else if (k === \"Home\") { cursor.value = 0; e.preventDefault(); }\n  else if (k === \"End\") { cursor.value = props.options.length - 1; e.preventDefault(); }\n  else if (k === \"Escape\") { open.value = false; }\n  else if (k === \"Backspace\" && picked.value.length) { picked.value = picked.value.slice(0, -1); }\n};\n</script>\n\n<template>\n  <div class=\"kape-combo\" role=\"combobox\" :aria-expanded=\"open\" aria-haspopup=\"listbox\"\n    aria-controls=\"kape-multi-list\" aria-describedby=\"kape-multi-count\">\n    <div class=\"kape-combo__field\" tabindex=\"0\" @keydown=\"onKeydown\" @click=\"open = !open\">\n      <span v-for=\"id in picked\" :key=\"id\" class=\"kape-chip\">\n        <span v-text=\"byId(id)?.name\"></span>\n        <button :aria-label=\"'Remove ' + byId(id)?.name\" @click.stop=\"toggle(id)\">&times;</button>\n      </span>\n      <span v-if=\"!picked.length\" class=\"kape-combo__hint\">Pick your branches</span>\n    </div>\n    <ul v-if=\"open\" id=\"kape-multi-list\" class=\"kape-combo__list\" role=\"listbox\" aria-multiselectable=\"true\">\n      <li\n        v-for=\"(o, i) in options\"\n        :key=\"o.id\"\n        role=\"option\"\n        :aria-selected=\"picked.includes(o.id)\"\n        :aria-disabled=\"blocked(o.id)\"\n        :class=\"{ 'is-active': i === cursor }\"\n        @mousedown.prevent=\"toggle(o.id)\"\n        v-text=\"o.name\"></li>\n    </ul>\n    <p id=\"kape-multi-count\" class=\"kape-sr\" aria-live=\"polite\">\n      <span v-text=\"picked.length\"></span> of <span v-text=\"options.length\"></span> selected\n    </p>\n  </div>\n</template>",
    "blazor": "@* KapeMultiSelect.razor *@\n<div class=\"kape-combo\" role=\"combobox\" aria-expanded=\"@_open\" aria-haspopup=\"listbox\"\n     aria-controls=\"kape-multi-list\" aria-describedby=\"kape-multi-count\">\n    <div class=\"kape-combo__field\" tabindex=\"0\" @onkeydown=\"OnKey\" @onclick=\"() => _open = !_open\">\n        @foreach (var id in Value)\n        {\n            var o = Options.First(x => x.Id == id);\n            <span class=\"kape-chip\">\n                @o.Name\n                <button aria-label=\"Remove @o.Name\" @onclick:stopPropagation=\"true\" @onclick=\"() => Toggle(id)\">&times;</button>\n            </span>\n        }\n        @if (Value.Count == 0)\n        {\n            <span class=\"kape-combo__hint\">Pick your branches</span>\n        }\n    </div>\n    @if (_open)\n    {\n        <ul id=\"kape-multi-list\" class=\"kape-combo__list\" role=\"listbox\" aria-multiselectable=\"true\">\n            @foreach (var (o, i) in Options.Select((o, i) => (o, i)))\n            {\n                var opt = o;\n                <li role=\"option\" aria-selected=\"@Value.Contains(opt.Id)\" aria-disabled=\"@Blocked(opt.Id)\"\n                    class=\"@(i == _cursor ? \"is-active\" : \"\")\" @onclick=\"() => Toggle(opt.Id)\">@opt.Name</li>\n            }\n        </ul>\n    }\n    <p id=\"kape-multi-count\" class=\"kape-sr\" aria-live=\"polite\">@Value.Count of @Options.Count selected</p>\n</div>\n\n@code {\n    [Parameter] public IReadOnlyList<Branch> Options { get; set; } = [];\n    [Parameter] public IReadOnlyList<string> Value { get; set; } = [];\n    [Parameter] public EventCallback<IReadOnlyList<string>> ValueChanged { get; set; }\n    [Parameter] public int? Max { get; set; }\n\n    private bool _open;\n    private int _cursor;\n\n    private bool Full => Max is not null && Value.Count >= Max;\n    private bool Blocked(string id) => Full && !Value.Contains(id);\n\n    private Task Toggle(string id)\n    {\n        if (Blocked(id)) return Task.CompletedTask;\n        var next = Value.Contains(id) ? Value.Where(x => x != id).ToList() : [.. Value, id];\n        return ValueChanged.InvokeAsync(next);\n    }\n\n    private void Move(int n) => _cursor = (_cursor + n + Options.Count) % Options.Count;\n\n    private async Task OnKey(KeyboardEventArgs e)\n    {\n        switch (e.Key)\n        {\n            case \"ArrowDown\": _open = true; Move(1); break;\n            case \"ArrowUp\": Move(-1); break;\n            case \" \":\n            case \"Enter\":\n                if (_open) await Toggle(Options[_cursor].Id); else _open = true;\n                break;\n            case \"Home\": _cursor = 0; break;\n            case \"End\": _cursor = Options.Count - 1; break;\n            case \"Escape\": _open = false; break;\n            case \"Backspace\" when Value.Count > 0:\n                await ValueChanged.InvokeAsync(Value.Take(Value.Count - 1).ToList());\n                break;\n        }\n    }\n}",
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
    "vue": "<script setup>\nimport { ref, computed } from \"vue\";\nconst props = defineProps({\n  from: { type: Date, default: null },\n  to: { type: Date, default: null },\n  month: { type: Date, default: () => new Date() },\n  presets: { type: Array, default: () => [] },\n});\nconst emit = defineEmits([\"apply\", \"cancel\"]);\n\nconst open = ref(false);\nconst view = ref(new Date(props.month.getFullYear(), props.month.getMonth(), 1));\nconst draft = ref({ from: props.from, to: props.to });\nconst focused = ref(props.from ? new Date(props.from) : new Date());\n\nconst days = computed(() => {\n  const first = new Date(view.value.getFullYear(), view.value.getMonth(), 1);\n  const total = new Date(view.value.getFullYear(), view.value.getMonth() + 1, 0).getDate();\n  return Array.from({ length: total }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1));\n});\nconst stamp = (d) => (d ? d.setHours(0, 0, 0, 0) && d.getTime() : null);\nconst classOf = (d) => {\n  const t = d.getTime(), a = draft.value.from?.getTime(), b = draft.value.to?.getTime();\n  return [t === a && \"is-start\", t === b && \"is-end\", a && b && t > a && t < b && \"in-range\"].filter(Boolean).join(\" \");\n};\nconst pick = (d) => {\n  const { from, to } = draft.value;\n  draft.value = from && !to && d > from ? { from, to: d } : { from: d, to: null };\n};\nconst shift = (days) => {\n  const next = new Date(focused.value);\n  next.setDate(next.getDate() + days);\n  focused.value = next;\n  view.value = new Date(next.getFullYear(), next.getMonth(), 1);\n};\nconst onKeydown = (e) => {\n  const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };\n  if (map[e.key]) { shift(map[e.key]); e.preventDefault(); }\n  else if (e.key === \"PageUp\") { shift(-30); e.preventDefault(); }\n  else if (e.key === \"PageDown\") { shift(30); e.preventDefault(); }\n  else if (e.key === \"Enter\") { pick(focused.value); e.preventDefault(); }\n  else if (e.key === \"Escape\") { draft.value = { from: props.from, to: props.to }; open.value = false; }\n};\nconst fmt = (d) => d?.toLocaleDateString(\"en-PH\", { month: \"short\", day: \"numeric\", year: \"numeric\" });\nconst label = computed(() => (draft.value.from ? fmt(draft.value.from) + \" to \" + fmt(draft.value.to) : \"Pick a range\"));\n</script>\n\n<template>\n  <div class=\"kape-range\">\n    <button class=\"kape-range__trigger\" :aria-expanded=\"open\" @click=\"open = !open\">\n      <KapeIcon name=\"stamp-card\" :size=\"18\" />\n      <span v-text=\"label\"></span>\n    </button>\n\n    <div v-if=\"open\" class=\"kape-range__pop\">\n      <ul class=\"kape-range__presets\">\n        <li v-for=\"p in presets\" :key=\"p.label\" :aria-current=\"draft.from === p.from || undefined\"\n          @click=\"draft = { from: p.from, to: p.to }\" v-text=\"p.label\"></li>\n      </ul>\n\n      <div class=\"kape-cal\" @keydown=\"onKeydown\">\n        <header>\n          <button aria-label=\"Previous month\" @click=\"shift(-30)\">&lsaquo;</button>\n          <span v-text=\"view.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })\"></span>\n          <button aria-label=\"Next month\" @click=\"shift(30)\">&rsaquo;</button>\n        </header>\n        <div class=\"kape-cal__grid\" role=\"group\" aria-label=\"Days\">\n          <button\n            v-for=\"d in days\"\n            :key=\"d.getTime()\"\n            :class=\"classOf(d)\"\n            :aria-label=\"fmt(d)\"\n            :aria-pressed=\"classOf(d).includes('is-') || undefined\"\n            :tabindex=\"d.getDate() === focused.getDate() ? 0 : -1\"\n            @click=\"pick(d)\"\n            v-text=\"d.getDate()\"></button>\n        </div>\n      </div>\n\n      <footer>\n        <button class=\"kape-btn\" @click=\"open = false; emit('cancel')\">Cancel</button>\n        <button class=\"kape-btn kape-btn--ink\" :disabled=\"!draft.from || !draft.to\"\n          @click=\"open = false; emit('apply', draft)\">Apply</button>\n      </footer>\n    </div>\n  </div>\n</template>",
    "blazor": "@* KapeDateRange.razor *@\n<div class=\"kape-range\">\n    <button class=\"kape-range__trigger\" aria-expanded=\"@_open\" @onclick=\"() => _open = !_open\">\n        <KapeIcon Name=\"stamp-card\" Size=\"18\" />\n        @Label\n    </button>\n\n    @if (_open)\n    {\n        <div class=\"kape-range__pop\">\n            <ul class=\"kape-range__presets\">\n                @foreach (var p in Presets)\n                {\n                    var preset = p;\n                    <li aria-current=\"@(_from == preset.From ? \"true\" : null)\"\n                        @onclick=\"() => { _from = preset.From; _to = preset.To; }\">@preset.Label</li>\n                }\n            </ul>\n\n            <div class=\"kape-cal\" @onkeydown=\"OnKey\">\n                <header>\n                    <button aria-label=\"Previous month\" @onclick=\"() => Shift(-30)\">&lsaquo;</button>\n                    <span>@_view.ToString(\"MMMM yyyy\")</span>\n                    <button aria-label=\"Next month\" @onclick=\"() => Shift(30)\">&rsaquo;</button>\n                </header>\n                <div class=\"kape-cal__grid\" role=\"group\" aria-label=\"Days\">\n                    @foreach (var d in Days)\n                    {\n                        var day = d;\n                        <button class=\"@ClassOf(day)\" aria-label=\"@day.ToString(\"MMM d, yyyy\")\"\n                                tabindex=\"@(day == _focus ? 0 : -1)\" @onclick=\"() => Pick(day)\">@day.Day</button>\n                    }\n                </div>\n            </div>\n\n            <footer>\n                <button class=\"kape-btn\" @onclick=\"Cancel\">Cancel</button>\n                <button class=\"kape-btn kape-btn--ink\" disabled=\"@(_from is null || _to is null)\" @onclick=\"Apply\">Apply</button>\n            </footer>\n        </div>\n    }\n</div>\n\n@code {\n    [Parameter] public DateOnly? From { get; set; }\n    [Parameter] public DateOnly? To { get; set; }\n    [Parameter] public IReadOnlyList<RangePreset> Presets { get; set; } = [];\n    [Parameter] public EventCallback<(DateOnly From, DateOnly To)> OnApply { get; set; }\n\n    private bool _open;\n    private DateOnly? _from, _to;\n    private DateOnly _focus = DateOnly.FromDateTime(DateTime.Today);\n    private DateOnly _view = new(DateTime.Today.Year, DateTime.Today.Month, 1);\n\n    protected override void OnParametersSet()\n    {\n        _from ??= From;\n        _to ??= To;\n    }\n\n    private string Label => _from is null ? \"Pick a range\" : $\"{_from:MMM d, yyyy} to {_to:MMM d, yyyy}\";\n\n    private IEnumerable<DateOnly> Days =>\n        Enumerable.Range(1, DateTime.DaysInMonth(_view.Year, _view.Month)).Select(i => new DateOnly(_view.Year, _view.Month, i));\n\n    private string ClassOf(DateOnly d) =>\n        d == _from ? \"is-start\" : d == _to ? \"is-end\" : _from is not null && _to is not null && d > _from && d < _to ? \"in-range\" : \"\";\n\n    private void Pick(DateOnly d)\n    {\n        if (_from is not null && _to is null && d > _from) _to = d;\n        else { _from = d; _to = null; }\n    }\n\n    private void Shift(int days)\n    {\n        _focus = _focus.AddDays(days);\n        _view = new DateOnly(_focus.Year, _focus.Month, 1);\n    }\n\n    private void OnKey(KeyboardEventArgs e)\n    {\n        switch (e.Key)\n        {\n            case \"ArrowLeft\": Shift(-1); break;\n            case \"ArrowRight\": Shift(1); break;\n            case \"ArrowUp\": Shift(-7); break;\n            case \"ArrowDown\": Shift(7); break;\n            case \"PageUp\": Shift(-30); break;\n            case \"PageDown\": Shift(30); break;\n            case \"Enter\": Pick(_focus); break;\n            case \"Escape\": Cancel(); break;\n        }\n    }\n\n    private void Cancel()\n    {\n        _from = From;\n        _to = To;\n        _open = false;\n    }\n\n    private async Task Apply()\n    {\n        _open = false;\n        if (_from is not null && _to is not null) await OnApply.InvokeAsync((_from.Value, _to.Value));\n    }\n}",
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
    "vue": "<script setup>\nimport { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from \"vue\";\nconst props = defineProps({\n  commands: { type: Array, default: () => [] },\n  open: Boolean,\n  hotkey: { type: String, default: \"k\" },\n  placeholder: { type: String, default: \"Type a command or search\" },\n});\nconst emit = defineEmits([\"update:open\"]);\n\nconst el = ref(null);\nconst field = ref(null);\nconst q = ref(\"\");\nconst cursor = ref(0);\nlet opener = null;\n\nconst hits = computed(() => props.commands.filter((c) => c.label.toLowerCase().includes(q.value.toLowerCase())));\nconst groups = computed(() => [...new Set(hits.value.map((c) => c.group))]);\n\nconst onHotkey = (e) => {\n  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === props.hotkey) {\n    e.preventDefault();\n    opener = document.activeElement;\n    emit(\"update:open\", !props.open);\n  }\n};\nonMounted(() => window.addEventListener(\"keydown\", onHotkey));\nonBeforeUnmount(() => window.removeEventListener(\"keydown\", onHotkey));\n\nwatch(() => props.open, async (o) => {\n  if (!el.value) return;\n  if (o) { el.value.showModal(); q.value = \"\"; cursor.value = 0; await nextTick(); field.value?.focus(); }\n  else { el.value.close(); opener?.focus(); }\n});\nwatch(hits, () => { cursor.value = 0; });\n\nconst move = (n) => {\n  if (hits.value.length) cursor.value = (cursor.value + n + hits.value.length) % hits.value.length;\n};\nconst run = () => {\n  const c = hits.value[cursor.value];\n  if (!c) return;\n  emit(\"update:open\", false);\n  c.run();\n};\nconst onKeydown = (e) => {\n  if (e.key === \"ArrowDown\") { move(1); e.preventDefault(); }\n  else if (e.key === \"ArrowUp\") { move(-1); e.preventDefault(); }\n  else if (e.key === \"Enter\") { run(); e.preventDefault(); }\n};\n</script>\n\n<template>\n  <dialog ref=\"el\" class=\"kape-cmdk\" aria-label=\"Command palette\" @close=\"emit('update:open', false)\">\n    <label>\n      <KapeIcon name=\"grinder\" :size=\"18\" />\n      <input\n        ref=\"field\"\n        v-model=\"q\"\n        :placeholder=\"placeholder\"\n        role=\"combobox\"\n        aria-expanded=\"true\"\n        aria-controls=\"kape-cmdk-list\"\n        :aria-activedescendant=\"hits[cursor] ? 'kape-cmd-' + hits[cursor].id : undefined\"\n        @keydown=\"onKeydown\" />\n      <kbd>esc</kbd>\n    </label>\n\n    <ul id=\"kape-cmdk-list\" role=\"listbox\">\n      <template v-for=\"g in groups\" :key=\"g\">\n        <li class=\"kape-cmdk__group\" role=\"presentation\" v-text=\"g\"></li>\n        <li\n          v-for=\"c in hits.filter((h) => h.group === g)\"\n          :id=\"'kape-cmd-' + c.id\"\n          :key=\"c.id\"\n          role=\"option\"\n          :aria-selected=\"hits[cursor]?.id === c.id\"\n          @mousedown.prevent=\"cursor = hits.indexOf(c); run()\">\n          <span v-text=\"c.label\"></span>\n        </li>\n      </template>\n    </ul>\n\n    <footer>\n      <kbd>&uarr;&darr;</kbd> move <kbd>&crarr;</kbd> run <kbd>esc</kbd> close\n      <span class=\"kape-sr\" aria-live=\"polite\"><span v-text=\"hits.length\"></span> results</span>\n    </footer>\n  </dialog>\n</template>",
    "blazor": "@* KapeCommandPalette.razor - showModal needs JS; guarded for prerender *@\n@inject IJSRuntime JS\n@implements IAsyncDisposable\n\n<dialog @ref=\"_el\" class=\"kape-cmdk\" aria-label=\"Command palette\">\n    <label>\n        <KapeIcon Name=\"grinder\" Size=\"18\" />\n        <input @ref=\"_field\" @bind=\"_query\" @bind:event=\"oninput\" placeholder=\"@Placeholder\"\n               role=\"combobox\" aria-expanded=\"true\" aria-controls=\"kape-cmdk-list\"\n               aria-activedescendant=\"@ActiveId\" @onkeydown=\"OnKey\" />\n        <kbd>esc</kbd>\n    </label>\n\n    <ul id=\"kape-cmdk-list\" role=\"listbox\">\n        @foreach (var g in Hits.Select(h => h.Group).Distinct())\n        {\n            <li class=\"kape-cmdk__group\" role=\"presentation\">@g</li>\n            @foreach (var c in Hits.Where(h => h.Group == g))\n            {\n                var cmd = c;\n                <li id=\"kape-cmd-@cmd.Id\" role=\"option\" aria-selected=\"@(ActiveId == $\"kape-cmd-{cmd.Id}\")\"\n                    @onclick=\"() => Run(cmd)\">@cmd.Label</li>\n            }\n        }\n    </ul>\n\n    <footer>\n        <kbd>&uarr;&darr;</kbd> move <kbd>&crarr;</kbd> run <kbd>esc</kbd> close\n        <span class=\"kape-sr\" aria-live=\"polite\">@Hits.Count results</span>\n    </footer>\n</dialog>\n\n@code {\n    [Parameter] public IReadOnlyList<Command> Commands { get; set; } = [];\n    [Parameter] public bool Open { get; set; }\n    [Parameter] public EventCallback<bool> OpenChanged { get; set; }\n    [Parameter] public string Placeholder { get; set; } = \"Type a command or search\";\n\n    private ElementReference _el, _field;\n    private IJSObjectReference? _module;\n    private bool _interactive, _shown;\n    private string _query = \"\";\n    private int _cursor;\n\n    private List<Command> Hits => Commands.Where(c => c.Label.Contains(_query, StringComparison.OrdinalIgnoreCase)).ToList();\n    private string? ActiveId => _cursor < Hits.Count ? $\"kape-cmd-{Hits[_cursor].Id}\" : null;\n\n    // No JS during prerender: every call is behind _interactive.\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (firstRender)\n        {\n            _interactive = true;\n            _module = await JS.InvokeAsync<IJSObjectReference>(\"import\", \"./kapehan.interop.js\");\n            await _module.InvokeVoidAsync(\"bindHotkey\", DotNetObjectReference.Create(this), \"k\");\n        }\n        if (!_interactive || _module is null || Open == _shown) return;\n        _shown = Open;\n        await _module.InvokeVoidAsync(Open ? \"showModal\" : \"closeModal\", _el);\n        if (Open) await _module.InvokeVoidAsync(\"focus\", _field);\n    }\n\n    [JSInvokable]\n    public Task Toggle() => OpenChanged.InvokeAsync(!Open);\n\n    private void Move(int n)\n    {\n        if (Hits.Count > 0) _cursor = (_cursor + n + Hits.Count) % Hits.Count;\n    }\n\n    private async Task Run(Command c)\n    {\n        await OpenChanged.InvokeAsync(false);\n        await c.Run.InvokeAsync();\n    }\n\n    private async Task OnKey(KeyboardEventArgs e)\n    {\n        switch (e.Key)\n        {\n            case \"ArrowDown\": Move(1); break;\n            case \"ArrowUp\": Move(-1); break;\n            case \"Enter\" when _cursor < Hits.Count: await Run(Hits[_cursor]); break;\n        }\n    }\n\n    public async ValueTask DisposeAsync()\n    {\n        if (_module is not null) await _module.DisposeAsync();\n    }\n}",
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
    "vue": "<script setup>\nimport { ref, watch, nextTick } from \"vue\";\nconst props = defineProps({\n  open: Boolean,\n  title: String,\n  lines: { type: Array, default: () => [] },\n  side: { type: String, default: \"right\" },\n});\nconst emit = defineEmits([\"close\", \"refund\", \"ready\"]);\n\nconst el = ref(null);\nconst closer = ref(null);\nlet opener = null;\n\nwatch(() => props.open, async (o) => {\n  if (!el.value) return;\n  if (o) {\n    opener = document.activeElement;\n    el.value.showModal();\n    await nextTick();\n    closer.value?.focus();\n  } else {\n    el.value.close();\n    opener?.focus();\n  }\n});\n\nconst total = () => props.lines.reduce((n, l) => n + Number(String(l.total).replace(/[^0-9.]/g, \"\")), 0);\n</script>\n\n<template>\n  <dialog\n    ref=\"el\"\n    class=\"kape-drawer\"\n    :style=\"side === 'left' ? { inset: '0 auto 0 0', borderLeft: 0, borderRight: '1px solid var(--line)' } : null\"\n    aria-labelledby=\"kape-drawer-title\"\n    @close=\"emit('close')\"\n    @cancel=\"emit('close')\">\n    <header>\n      <span id=\"kape-drawer-title\" v-text=\"title\"></span>\n      <button ref=\"closer\" aria-label=\"Close\" @click=\"emit('close')\">&times;</button>\n    </header>\n\n    <div class=\"kape-drawer__body\">\n      <div v-for=\"l in lines\" :key=\"l.id\" class=\"kape-line\">\n        <span><span v-text=\"l.qty\"></span> &times; <span v-text=\"l.name\"></span></span>\n        <span class=\"num\" v-text=\"l.total\"></span>\n      </div>\n      <div class=\"kape-line kape-line--total\">\n        <span>Total</span>\n        <span class=\"num\" v-text=\"total()\"></span>\n      </div>\n    </div>\n\n    <footer>\n      <button class=\"kape-btn kape-btn--ink\" @click=\"emit('ready')\">Mark ready</button>\n      <button class=\"kape-btn\" @click=\"emit('refund')\">Refund</button>\n    </footer>\n  </dialog>\n</template>",
    "blazor": "@* KapeDrawer.razor - showModal needs JS; guarded for prerender *@\n@inject IJSRuntime JS\n\n<dialog @ref=\"_el\" class=\"kape-drawer\" aria-labelledby=\"kape-drawer-title\">\n    <header>\n        <span id=\"kape-drawer-title\">@Title</span>\n        <button @ref=\"_closer\" aria-label=\"Close\" @onclick=\"OnClose\">&times;</button>\n    </header>\n\n    <div class=\"kape-drawer__body\">\n        @foreach (var l in Lines)\n        {\n            <div class=\"kape-line\">\n                <span>@l.Qty &times; @l.Name</span>\n                <span class=\"num\">@l.Total</span>\n            </div>\n        }\n        <div class=\"kape-line kape-line--total\">\n            <span>Total</span>\n            <span class=\"num\">@Lines.Sum(l => l.Total)</span>\n        </div>\n    </div>\n\n    <footer>\n        <button class=\"kape-btn kape-btn--ink\" @onclick=\"OnReady\">Mark ready</button>\n        <button class=\"kape-btn\" @onclick=\"OnRefund\">Refund</button>\n    </footer>\n</dialog>\n\n@code {\n    [Parameter] public bool Open { get; set; }\n    [Parameter] public string Title { get; set; } = \"\";\n    [Parameter] public IReadOnlyList<OrderLine> Lines { get; set; } = [];\n    [Parameter] public EventCallback OnClose { get; set; }\n    [Parameter] public EventCallback OnRefund { get; set; }\n    [Parameter] public EventCallback OnReady { get; set; }\n\n    private ElementReference _el, _closer;\n    private bool _interactive, _shown;\n\n    // Prerender has no JS runtime; the first render flips the gate.\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (firstRender) _interactive = true;\n        if (!_interactive || Open == _shown) return;\n        _shown = Open;\n        await JS.InvokeVoidAsync(Open ? \"kapehan.dialog.show\" : \"kapehan.dialog.close\", _el);\n        if (Open) await JS.InvokeVoidAsync(\"kapehan.focus\", _closer);\n    }\n}",
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
