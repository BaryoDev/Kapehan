/**
 * The Vue package: plain ESM render functions, no SFC compilation, no build step.
 *
 * Vue is a peer, never bundled, for the same reason React is: a design-system package that
 * ships its own copy of the framework gives the consumer two runtimes and a broken
 * `instanceof`. So nothing here compiles a .vue file. Everything is `h()` calls in plain
 * ESM, which means `import { KapeButton } from 'kapehan/vue'` works in Vite, Nuxt, a
 * plain <script type="module"> and node, with nothing installed but vue itself.
 *
 * WHERE THE COMPONENTS COME FROM
 * ------------------------------
 * kapehan-components.js carries a `vue` snippet per component, written as <script setup>
 * SFC source. That snippet is the specification, not the shipped code:
 *
 *   props   parsed straight out of its defineProps()/defineModel() and re-emitted verbatim,
 *           so a default can never drift from the canvas. Nothing is retyped.
 *   emits   the union of defineEmits(), every $emit()/emit() in the snippet, an
 *           update:modelValue when it uses defineModel, and the manifest's own on* props
 *           mapped to event names (onChange -> 'change'), so the Vue surface and the React
 *           surface describe the same component.
 *   render  hand-written h() below, one per component key. This is the only part that is
 *           not derived, because there is no way to derive it: compiling <template> needs
 *           @vue/compiler-sfc, which is a build step this package refuses to have.
 *
 * The snippets are also emitted untouched as vue/src/*.vue. They are copy material for a
 * future `npx kapehan add`, NOT for import: nothing resolves them and package consumers
 * would need a compiler. That is why they live under src/ rather than beside the modules.
 *
 * SPLIT SUBPATHS
 * --------------
 * vue/icons.js and vue/components.js are separate entry points on purpose. Someone who
 * wants three icons should not pull 30 components' render functions through their bundler,
 * and the icon data is the larger half. vue/index.js re-exports both for the lazy path.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { icons, monoOf } from '../../kapehan-icons.js';
import { components as manifest, classesOf } from '../components.mjs';

export const name = 'vue';

export const pkg = {
  exports: {
    './vue': './vue/index.js',
    './vue/index.js': './vue/index.js',
    './vue/icons.js': './vue/icons.js',
    './vue/components.js': './vue/components.js',
    './vue/src/*': './vue/src/*',
  },
  files: ['vue'],
};

const BANNER = 'MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan';
const stripHints = (b) => b.replace(/\s*data-mono="drop"/g, '');
const pascal = (s) => s.replace(/(^|[-_])([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const nameOf = (key) => 'Kape' + pascal(key);

/* ------------------------------------------------------------------ *
 * Reading the SFC snippet
 * ------------------------------------------------------------------ */

/**
 * Brace-matches from an opening bracket, tracking string state. The snippets contain
 * apostrophes inside prose defaults ("Type a command or search") and arrow functions inside
 * object values, so a naive bracket count ends the scan in the wrong place.
 */
function balanced(src, start) {
  const open = src[start];
  const close = { '(': ')', '{': '}', '[': ']' }[open];
  if (!close) throw new Error(`balanced() called on ${open}, not a bracket`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error('a bracket in the snippet never closes');
}

const scriptOf = (vue) => (vue.match(/<script setup>([\s\S]*?)<\/script>/) ?? [, ''])[1];

/** The source of a macro's single argument, or null when the macro is not called. */
function macroArg(script, macro) {
  const at = script.search(new RegExp(`(?<![A-Za-z0-9_$])${macro}\\s*\\(`));
  if (at === -1) return null;
  const paren = script.indexOf('(', at);
  return balanced(script, paren).slice(1, -1).trim();
}

/**
 * Top-level `key: value` pairs of an object literal, values kept as raw source. They are
 * re-emitted verbatim, so `{ type: Array, default: () => [] }` stays a factory rather than
 * a shared array, which is the bug you get from rebuilding these by hand.
 */
function entries(objSrc) {
  const body = objSrc.slice(1, -1);
  const out = [];
  let i = 0;
  const skip = () => { while (i < body.length && /[\s,]/.test(body[i])) i++; };
  while (true) {
    skip();
    if (i >= body.length) return out;
    const keyStart = i;
    while (i < body.length && /[A-Za-z0-9_$]/.test(body[i])) i++;
    const key = body.slice(keyStart, i);
    if (!key) throw new Error(`expected a property name at ${body.slice(i, i + 24)}`);
    skip();
    if (body[i] !== ':') throw new Error(`property "${key}" has no value`);
    i++;
    skip();
    const valStart = i;
    let depth = 0;
    let quote = null;
    let escaped = false;
    for (; i < body.length; i++) {
      const ch = body[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) depth--;
      else if (ch === ',' && depth === 0) break;
    }
    out.push([key, body.slice(valStart, i).trim().replace(/\s+/g, ' ')]);
  }
}

/** onChange -> change, onFiles -> files. The manifest names callbacks the React way. */
const eventOf = (prop) => prop.slice(2, 3).toLowerCase() + prop.slice(3);

/** props, emits and whether the snippet uses v-model, all read out of the snippet. */
function surfaceOf(c) {
  const script = scriptOf(c.vue);
  const props = [];

  const declared = macroArg(script, 'defineProps');
  if (declared) {
    if (declared[0] !== '{') throw new Error(`${c.key}: defineProps is not an object literal`);
    props.push(...entries(declared));
  }

  const hasModel = /(?<![A-Za-z0-9_$])defineModel\s*\(/.test(script);
  if (hasModel) props.push(['modelValue', macroArg(script, 'defineModel') || '{}']);

  const emits = new Set();
  const declaredEmits = macroArg(script, 'defineEmits');
  if (declaredEmits) for (const m of declaredEmits.matchAll(/["']([^"']+)["']/g)) emits.add(m[1]);
  // The $ has to sit inside the lookbehind's shadow, not before it: with (?<!...) placed
  // after \$?, the template's $emit('cancel') never matches, because the character before
  // "emit" is the $ the class excludes. That dropped upload's cancel event, and the only
  // reason it was not silently wrong everywhere is that most of these events are also
  // named by the manifest's on* props.
  for (const m of c.vue.matchAll(/(?<![A-Za-z0-9_$.])\$?emit\s*\(\s*["']([^"']+)["']/g)) emits.add(m[1]);
  if (hasModel) emits.add('update:modelValue');
  // The manifest's own props table names the callbacks; a Vue user expects them as events.
  for (const p of c.props) if (/^on[A-Z]/.test(p.name)) emits.add(eventOf(p.name));

  return { props, emits: [...emits].sort(), hasModel };
}

/* ------------------------------------------------------------------ *
 * The render functions
 *
 * One per component key, translated from the snippet's <template>. Emitted into a
 * setup(props, { emit, slots }) body, so they close over props/emit/slots and whatever the
 * body declares above the returned closure.
 *
 * No backticks and no ${ anywhere below: these strings are spliced into a template literal.
 * ------------------------------------------------------------------ */
const RENDER = {
  button: `    return () => h('button', {
      class: ['kape-btn', { 'kape-btn--primary': props.variant === 'primary', 'kape-btn--ghost': props.variant === 'ghost' }],
      disabled: props.disabled,
      onClick: (e) => emit('click', e),
    }, [
      props.icon ? h(KapeIcon, { name: props.icon, size: 20 }) : null,
      h('span', null, props.label),
    ]);`,

  chip: `    const pick = ref(props.options[0]);
    watch(() => props.options, (list) => { if (!list.includes(pick.value)) pick.value = list[0]; });

    return () => props.options.map((c) => h('button', {
      key: c,
      class: 'kape-chip',
      'aria-pressed': pick.value === c,
      onClick: () => { pick.value = c; emit('change', c); },
    }, c));`,

  input: `    const model = useModel(props, emit, '');

    return () => h('label', { class: 'kape-input' }, [
      props.icon ? h(KapeIcon, { name: props.icon, size: 18 }) : null,
      h('input', {
        type: props.type,
        placeholder: props.placeholder,
        value: model.value == null ? '' : model.value,
        onInput: (e) => { model.value = e.target.value; },
      }),
    ]);`,

  seg: `    const mode = useModel(props, emit, props.options[0]);

    return () => h('div', { class: 'kape-seg', role: 'group', 'aria-label': 'Fulfilment' },
      props.options.map((m) => h('button', {
        key: m,
        type: 'button',
        'aria-pressed': mode.value === m,
        onClick: () => { mode.value = m; emit('change', m); },
      }, m)));`,

  toast: `    // Cleared on unmount: a toast that unmounts before its timeout would otherwise emit
    // close into a dead component, and in a list of toasts that fires once per dismissal.
    let timer = null;
    onMounted(() => {
      if (props.timeout > 0 && props.tone !== 'warn') timer = setTimeout(() => emit('close'), props.timeout);
    });
    onBeforeUnmount(() => { if (timer) clearTimeout(timer); });

    return () => h('div', {
      class: ['kape-toast', { 'kape-toast--warn': props.tone === 'warn' }],
      role: props.tone === 'warn' ? 'alert' : 'status',
    }, [
      h(KapeIcon, { name: props.tone === 'warn' ? 'coffee-bean' : 'coffee-cup', size: 20 }),
      h('span', { class: 'kape-toast__text' }, props.message),
      props.actionLabel
        ? h('button', { class: 'kape-toast__action', type: 'button', onClick: () => emit('action') }, props.actionLabel)
        : null,
    ]);`,

  stamps: `    return () => [
      h('div', { class: 'kape-stamps', role: 'group', 'aria-label': props.label },
        Array.from({ length: props.total }, (_, i) => i + 1).map((i) => h('span', {
          key: i,
          'data-on': i <= props.filled ? '' : null,
          'aria-hidden': 'true',
        }, i <= props.filled ? [h(KapeIcon, { name: props.icon, size: 16 })] : null))),
      // The row above is aria-hidden, so the count is the only thing announced.
      h('p', { class: 'kape-sr' }, props.filled + ' of ' + props.total + ' stamps earned'),
    ];`,

  row: `    return () => props.items.map((d) => h('div', {
      key: d.id,
      class: 'kape-row',
      onClick: () => emit('pick', d),
    }, [
      h('span', { class: 'kape-row__art' }, [h(KapeIcon, { name: d.icon, size: 40 })]),
      h('div', { class: 'kape-row__body' }, [
        h('p', { class: 'kape-row__title' }, [
          h('span', null, d.name),
          d.badge ? h('span', { class: 'kape-badge' }, d.badge) : null,
        ]),
        h('p', { class: 'kape-row__sub' }, d.sub),
      ]),
      h('span', { class: 'kape-row__price' }, d.price),
    ]));`,

  stepper: `    const qty = useModel(props, emit, props.min);
    const step = (n) => {
      const next = Math.min(props.max, Math.max(props.min, Number(qty.value) + n));
      if (next === qty.value) return;
      qty.value = next;
      emit('change', next);
    };
    const onKeydown = (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); step(-1); }
    };

    return () => h('div', { class: 'kape-stepper', onKeydown }, [
      h('button', { type: 'button', 'aria-label': 'Fewer', disabled: qty.value <= props.min, onClick: () => step(-1) }, '\\u2212'),
      h('output', { 'aria-live': 'polite' }, String(qty.value)),
      h('button', { type: 'button', 'aria-label': 'More', disabled: qty.value >= props.max, onClick: () => step(1) }, '+'),
    ]);`,

  switch: `    const on = useModel(props, emit, false);

    return () => [
      h('label', { class: 'kape-switch' }, [
        h('input', {
          type: 'checkbox',
          checked: !!on.value,
          disabled: props.disabled,
          'aria-label': props.label,
          onChange: (e) => { on.value = e.target.checked; },
        }),
      ]),
      h('span', null, props.label),
    ];`,

  check: `    const many = () => props.mode !== 'radio';
    const model = useModel(props, emit, many() ? [] : null);
    const list = () => (Array.isArray(model.value) ? model.value : []);
    const isOn = (s) => (many() ? list().includes(s) : model.value === s);
    const toggle = (s) => {
      if (!many()) { model.value = s; return; }
      model.value = list().includes(s) ? list().filter((x) => x !== s) : [...list(), s];
    };

    return () => props.options.map((s) => h('label', {
      key: s,
      class: many() ? 'kape-check' : 'kape-radio',
    }, [
      h('input', { type: props.mode, name: props.name, value: s, checked: isOn(s), onChange: () => toggle(s) }),
      h('span', null, s),
    ]));`,

  select: `    const model = useModel(props, emit, undefined);

    return () => h('label', { class: 'kape-select' }, [
      h('select', {
        value: model.value,
        onChange: (e) => { model.value = e.target.value; },
      }, props.options.map((b) => h('option', {
        key: b.id,
        value: b.id,
        // Set on the option as well as the select: without it a server-rendered select
        // comes back with nothing chosen, because value is a property, not an attribute.
        selected: b.id === model.value,
      }, b.name))),
    ]);`,

  tabs: `    const tab = useModel(props, emit, props.tabs[0]);
    const go = (t) => { if (t !== undefined && t !== tab.value) { tab.value = t; emit('change', t); } };
    const move = (n) => {
      const i = props.tabs.indexOf(tab.value);
      go(props.tabs[(i + n + props.tabs.length) % props.tabs.length]);
    };
    const onKeydown = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
      else if (e.key === 'Home') { e.preventDefault(); go(props.tabs[0]); }
      else if (e.key === 'End') { e.preventDefault(); go(props.tabs[props.tabs.length - 1]); }
    };

    return () => h('div', { class: 'kape-tabs', role: 'tablist', onKeydown },
      props.tabs.map((t) => h('button', {
        key: t,
        type: 'button',
        role: 'tab',
        'aria-selected': tab.value === t,
        tabindex: tab.value === t ? 0 : -1,
        onClick: () => go(t),
      }, t)));`,

  card: `    return () => h('article', { class: 'kape-card' }, [
      h(KapeIcon, { name: props.item.icon, size: props.size }),
      h('p', { class: 'kape-card__title' }, props.item.name),
      h('p', { class: 'kape-card__sub' }, [
        h('span', null, props.item.size),
        ' \\u00b7 ',
        h('span', null, props.item.temp),
      ]),
      h('div', { class: 'kape-card__foot' }, [
        h('span', { class: 'kape-row__price' }, props.item.price),
        h('button', {
          class: ['kape-btn', 'kape-btn--primary'],
          type: 'button',
          onClick: () => emit('add', props.item),
        }, 'Add'),
      ]),
    ]);`,

  tag: `    return () => h('span', {
      class: ['kape-tag', { 'kape-tag--accent': props.tone === 'accent', 'kape-tag--ink': props.tone === 'ink' }],
    }, props.label);`,

  avatar: `    return () => h('div', { class: 'kape-avatars' }, [
      ...props.people.slice(0, props.max).map((c) => h('span', { key: c.id, class: 'kape-avatar' }, c.initials)),
      props.people.length > props.max
        ? h('span', { class: 'kape-avatar', title: (props.people.length - props.max) + ' more' }, '+' + (props.people.length - props.max))
        : null,
    ]);`,

  dialog: `    const el = ref(null);
    // showModal() is what makes the backdrop, the focus trap and Escape real. Calling it on
    // an already-open dialog throws InvalidStateError, so both directions are guarded.
    const sync = (open) => {
      const d = el.value;
      if (!d || typeof d.showModal !== 'function') return;
      if (open && !d.open) d.showModal();
      else if (!open && d.open) d.close();
    };
    onMounted(() => sync(props.open));
    watch(() => props.open, sync);

    return () => h('dialog', {
      ref: el,
      class: 'kape-dialog',
      'aria-labelledby': 'kape-dialog-title',
      onClose: () => emit('close'),
      onCancel: () => emit('close'),
    }, [
      h('h2', { id: 'kape-dialog-title' }, props.title),
      h('p', null, props.body),
      h('div', { class: 'kape-dialog__actions' }, [
        h('button', { class: ['kape-btn', 'kape-btn--ghost'], type: 'button', autofocus: true, onClick: () => emit('close') }, 'Keep it'),
        h('button', { class: ['kape-btn', 'kape-btn--ink'], type: 'button', onClick: () => emit('confirm') }, props.confirmLabel),
      ]),
    ]);`,

  tip: `    return () => h('button', {
      class: ['kape-btn', 'kape-tip'],
      type: 'button',
      'data-tip': props.text,
    }, slots.default ? slots.default() : null);`,

  skeleton: `    return () => h('div', { 'aria-busy': props.loading }, props.loading
      ? Array.from({ length: props.lines }, (_, i) => h('span', { key: i, class: 'kape-skeleton', style: { width: props.width } }))
      : (slots.default ? slots.default() : null));`,

  progress: `    return () => h('span', {
      class: 'kape-progress',
      role: 'progressbar',
      'aria-valuenow': props.value,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-label': props.label,
    }, [h('span', { style: { width: props.value + '%' } })]);`,

  pager: `    const list = computed(() => Array.from({ length: props.pages }, (_, i) => i + 1));

    return () => h('nav', { class: 'kape-pager', 'aria-label': 'Pages' }, [
      h('button', { type: 'button', 'aria-label': 'Previous', disabled: props.page === 1, onClick: () => emit('change', props.page - 1) }, '\\u2039'),
      ...list.value.map((p) => h('button', {
        key: p,
        type: 'button',
        'aria-current': p === props.page ? 'page' : undefined,
        onClick: () => emit('change', p),
      }, String(p))),
      h('button', { type: 'button', 'aria-label': 'Next', disabled: props.page === props.pages, onClick: () => emit('change', props.page + 1) }, '\\u203a'),
    ]);`,

  acc: `    return () => props.items.map((f, i) => h('details', {
      key: f.id,
      class: 'kape-acc',
      open: Boolean(props.openFirst && i === 0),
    }, [
      h('summary', null, f.q),
      h('p', null, f.a),
    ]));`,

  table: `    return () => h('table', { class: 'kape-table' }, [
      h('caption', { class: 'kape-sr' }, props.caption),
      h('thead', null, [h('tr', null, [
        h('th', { scope: 'col' }, 'Order'),
        h('th', { scope: 'col' }, 'Items'),
        h('th', { scope: 'col' }, 'Status'),
        h('th', { scope: 'col', class: 'num' }, 'Total'),
      ])]),
      h('tbody', null, props.rows.map((o) => h('tr', { key: o.id }, [
        h('td', null, ['#', h('span', null, String(o.id))]),
        h('td', null, o.summary),
        h('td', null, [h('span', { class: ['kape-tag', { 'kape-tag--accent': o.status === 'making' }] }, o.status)]),
        h('td', { class: 'num' }, o.total),
      ]))),
    ]);`,

  crumbs: `    return () => h('nav', { 'aria-label': props.label }, [
      h('ol', { class: 'kape-crumbs' }, props.trail.map((t, i) => h('li', {
        key: t.href,
        'aria-current': i === props.trail.length - 1 ? 'page' : undefined,
      }, [
        i < props.trail.length - 1 ? h('a', { href: t.href }, t.label) : h('span', null, t.label),
      ]))),
    ]);`,

  upload: `    const over = ref(false);
    const take = (list) => {
      if (!list) return;
      emit('files', Array.from(list).filter((f) => f.size <= props.maxSize));
    };

    return () => [
      h('label', {
        class: ['kape-drop', { 'is-over': over.value }],
        onDragover: (e) => { e.preventDefault(); over.value = true; },
        onDragleave: () => { over.value = false; },
        onDrop: (e) => { e.preventDefault(); over.value = false; take(e.dataTransfer && e.dataTransfer.files); },
      }, [
        h(KapeIcon, { name: 'coffee-sack', size: 36 }),
        h('strong', null, 'Drop the menu sheet here'),
        h('span', null, ['CSV or XLSX, up to 10 MB. Or ', h('u', null, 'browse'), '.']),
        h('input', { type: 'file', accept: props.accept, hidden: true, onChange: (e) => take(e.target.files) }),
      ]),
      ...props.files.map((f) => h('div', { key: f.name, class: 'kape-file' }, [
        h('span', { class: 'kape-file__ext' }, f.ext),
        h('div', { class: 'kape-file__body' }, [
          h('span', null, f.name),
          h('span', {
            class: 'kape-progress',
            role: 'progressbar',
            'aria-valuenow': f.pct,
            'aria-label': 'Uploading ' + f.name,
          }, [h('span', { style: { width: f.pct + '%' } })]),
        ]),
        h('button', { type: 'button', 'aria-label': 'Cancel', onClick: () => emit('cancel', f) }, '\\u00d7'),
      ])),
    ];`,

  edit: `    const editing = ref(null);
    const draft = ref('');
    const field = ref(null);
    const status = ref('');

    const start = async (d) => {
      if (editing.value === d.id) return;
      editing.value = d.id;
      draft.value = String(d.price);
      await nextTick();
      const input = field.value;
      if (input && input.focus) { input.focus(); if (input.select) input.select(); }
    };
    // Enter and blur both land here, and blur fires after Enter has already committed, so
    // the id guard is what stops a second save emitting with a stale draft.
    const commit = (d) => {
      if (editing.value !== d.id) return;
      editing.value = null;
      const n = Number(draft.value);
      if (draft.value.trim() === '' || Number.isNaN(n)) { status.value = 'Not a number, ' + d.name + ' unchanged'; return; }
      status.value = d.name + ' saved at ' + n;
      emit('save', d.id, n);
    };
    const cancel = () => {
      if (editing.value === null) return;
      editing.value = null;
      status.value = 'Edit cancelled';
    };

    return () => [
      h('table', { class: ['kape-table', 'kape-table--edit'] }, [
        h('thead', null, [h('tr', null, [
          h('th', { scope: 'col' }, 'Drink'),
          h('th', { scope: 'col' }, 'Size'),
          h('th', { scope: 'col', class: 'num' }, 'Price'),
          h('th', { scope: 'col', class: 'num' }, 'Stock'),
        ])]),
        h('tbody', null, props.rows.map((d) => h('tr', {
          key: d.id,
          class: { 'is-editing': editing.value === d.id },
          onDblclick: () => start(d),
          onKeydown: (e) => { if (e.key === 'F2') { e.preventDefault(); start(d); } },
        }, [
          h('td', null, d.name),
          h('td', null, d.size),
          h('td', { class: 'num' }, [
            editing.value === d.id
              ? h('input', {
                  ref: field,
                  value: draft.value,
                  inputmode: 'numeric',
                  onInput: (e) => { draft.value = e.target.value; },
                  onKeydown: (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); commit(d); }
                    else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
                  },
                  onBlur: () => commit(d),
                })
              : h('span', null, d.price),
          ]),
          h('td', { class: 'num' }, [
            h('span', null, d.stock),
            editing.value === d.id
              ? h('button', {
                  class: ['kape-btn', 'kape-btn--sm'],
                  type: 'button',
                  // mousedown, not click: the input's blur would commit and unmount this
                  // button before a click ever landed on it.
                  onMousedown: (e) => { e.preventDefault(); commit(d); },
                }, 'Save')
              : null,
          ]),
        ]))),
      ]),
      h('p', { class: 'kape-sr', 'aria-live': 'polite' }, status.value),
    ];`,

  combo: `    const model = useModel(props, emit, []);
    const q = ref('');
    const open = ref(false);
    const cursor = ref(0);

    const picked = () => (Array.isArray(model.value) ? model.value : []);
    const hits = computed(() => props.options.filter((a) => a.name.toLowerCase().includes(q.value.toLowerCase())));
    const byId = (id) => props.options.find((a) => a.id === id);
    // The filter can shrink under the cursor while the user types, and an out-of-range
    // cursor points aria-activedescendant at an id that is no longer in the DOM.
    watch(hits, () => { if (cursor.value >= hits.value.length) cursor.value = 0; });

    const toggle = (id) => {
      const next = picked().includes(id) ? picked().filter((x) => x !== id) : [...picked(), id];
      model.value = next;
      emit('change', next);
    };
    const move = (n) => {
      if (!hits.value.length) return;
      cursor.value = (cursor.value + n + hits.value.length) % hits.value.length;
    };
    const onKeydown = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); open.value = true; move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && open.value) {
        e.preventDefault();
        const hit = hits.value[cursor.value];
        if (hit) toggle(hit.id);
      } else if (e.key === 'Escape') { open.value = false; }
      else if (e.key === 'Tab') { open.value = false; }
      else if (e.key === 'Backspace' && !q.value && picked().length) {
        const next = picked().slice(0, -1);
        model.value = next;
        emit('change', next);
      }
    };

    return () => h('div', {
      class: 'kape-combo',
      role: 'combobox',
      'aria-expanded': open.value,
      'aria-haspopup': 'listbox',
      'aria-controls': 'kape-combo-list',
    }, [
      h('div', { class: 'kape-combo__field' }, [
        ...picked().map((id) => h('span', { key: id, class: 'kape-chip' }, [
          h('span', null, byId(id) ? byId(id).name : id),
          h('button', { type: 'button', 'aria-label': 'Remove ' + (byId(id) ? byId(id).name : id), onClick: () => toggle(id) }, '\\u00d7'),
        ])),
        h('input', {
          value: q.value,
          placeholder: props.placeholder,
          'aria-activedescendant': open.value && hits.value[cursor.value] ? 'kape-opt-' + hits.value[cursor.value].id : undefined,
          onInput: (e) => { q.value = e.target.value; open.value = true; },
          onFocus: () => { open.value = true; },
          onKeydown,
        }),
      ]),
      open.value
        ? h('ul', { id: 'kape-combo-list', class: 'kape-combo__list', role: 'listbox', 'aria-multiselectable': 'true' },
            hits.value.map((a, i) => h('li', {
              id: 'kape-opt-' + a.id,
              key: a.id,
              role: 'option',
              'aria-selected': picked().includes(a.id),
              class: { 'is-active': i === cursor.value },
              // mousedown with preventDefault, so the input never loses focus and
              // aria-activedescendant stays the thing that moves.
              onMousedown: (e) => { e.preventDefault(); toggle(a.id); },
            }, [
              h('span', null, a.name),
              h('small', null, '+' + a.price),
            ])))
        : null,
    ]);`,

  multi: `    const model = useModel(props, emit, []);
    const open = ref(false);
    const cursor = ref(0);

    const picked = () => (Array.isArray(model.value) ? model.value : []);
    const full = computed(() => props.max !== null && picked().length >= props.max);
    const byId = (id) => props.options.find((o) => o.id === id);
    const blocked = (id) => full.value && !picked().includes(id);

    const set = (next) => { model.value = next; };
    const toggle = (id) => {
      if (blocked(id)) return;
      set(picked().includes(id) ? picked().filter((x) => x !== id) : [...picked(), id]);
    };
    const move = (n) => {
      if (!props.options.length) return;
      cursor.value = (cursor.value + n + props.options.length) % props.options.length;
    };
    const onKeydown = (e) => {
      const k = e.key;
      if (k === 'ArrowDown') { e.preventDefault(); open.value = true; move(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (k === ' ' || k === 'Enter') {
        e.preventDefault();
        if (!open.value) { open.value = true; return; }
        const o = props.options[cursor.value];
        if (o) toggle(o.id);
      } else if (k === 'Home') { e.preventDefault(); cursor.value = 0; }
      else if (k === 'End') { e.preventDefault(); cursor.value = Math.max(0, props.options.length - 1); }
      else if (k === 'Escape') { open.value = false; }
      else if (k === 'Backspace' && picked().length) { e.preventDefault(); set(picked().slice(0, -1)); }
    };

    return () => h('div', {
      class: 'kape-combo',
      role: 'combobox',
      'aria-expanded': open.value,
      'aria-haspopup': 'listbox',
      'aria-controls': 'kape-multi-list',
      'aria-describedby': 'kape-multi-count',
    }, [
      h('div', {
        class: 'kape-combo__field',
        tabindex: 0,
        onKeydown,
        onClick: () => { open.value = !open.value; },
      }, [
        ...picked().map((id) => h('span', { key: id, class: 'kape-chip' }, [
          h('span', null, byId(id) ? byId(id).name : id),
          h('button', {
            type: 'button',
            'aria-label': 'Remove ' + (byId(id) ? byId(id).name : id),
            onClick: (e) => { e.stopPropagation(); toggle(id); },
          }, '\\u00d7'),
        ])),
        picked().length ? null : h('span', { class: 'kape-combo__hint' }, 'Pick your branches'),
      ]),
      open.value
        ? h('ul', { id: 'kape-multi-list', class: 'kape-combo__list', role: 'listbox', 'aria-multiselectable': 'true' },
            props.options.map((o, i) => h('li', {
              key: o.id,
              role: 'option',
              'aria-selected': picked().includes(o.id),
              // Blocked options stay in the list and stay announced: removing them at max
              // makes the list silently change length under a screen reader.
              'aria-disabled': blocked(o.id),
              class: { 'is-active': i === cursor.value },
              onMousedown: (e) => { e.preventDefault(); toggle(o.id); },
            }, o.name)))
        : null,
      h('p', { id: 'kape-multi-count', class: 'kape-sr', 'aria-live': 'polite' },
        picked().length + ' of ' + props.options.length + ' selected'),
    ]);`,

  range: `    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
    const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const open = ref(false);
    const view = ref(startOfMonth(props.month || new Date()));
    const draft = ref({ from: props.from, to: props.to });
    const focused = ref(midnight(props.from || new Date()));
    const grid = ref(null);

    const days = computed(() => {
      const first = view.value;
      const total = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      return Array.from({ length: total }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1));
    });
    const at = (d) => (d ? midnight(d).getTime() : null);
    const sameDay = (a, b) => a !== null && b !== null && a === b;
    const today = midnight(new Date()).getTime();
    const classOf = (d) => {
      const t = at(d);
      const a = at(draft.value.from);
      const b = at(draft.value.to);
      return {
        'is-start': sameDay(t, a),
        'is-end': sameDay(t, b),
        'in-range': a !== null && b !== null && t > a && t < b,
      };
    };
    const isEnd = (d) => { const c = classOf(d); return c['is-start'] || c['is-end']; };
    const pick = (d) => {
      const from = draft.value.from;
      const to = draft.value.to;
      draft.value = from && !to && at(d) > at(from) ? { from, to: d } : { from: d, to: null };
    };
    const shift = (n) => {
      const next = new Date(focused.value);
      next.setDate(next.getDate() + n);
      focused.value = next;
      view.value = startOfMonth(next);
    };
    const shiftMonth = (n) => {
      const next = new Date(focused.value.getFullYear(), focused.value.getMonth() + n, 1);
      const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(focused.value.getDate(), last));
      focused.value = next;
      view.value = startOfMonth(next);
    };
    const refocus = async () => {
      await nextTick();
      const box = grid.value;
      if (!box || !box.querySelector) return;
      const btn = box.querySelector('[tabindex="0"]');
      if (btn && btn.focus) btn.focus();
    };
    const onKeydown = (e) => {
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (step) { e.preventDefault(); shift(step); refocus(); }
      else if (e.key === 'PageUp') { e.preventDefault(); shiftMonth(-1); refocus(); }
      else if (e.key === 'PageDown') { e.preventDefault(); shiftMonth(1); refocus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(focused.value); }
      else if (e.key === 'Escape') {
        e.preventDefault();
        draft.value = { from: props.from, to: props.to };
        open.value = false;
        emit('cancel');
      }
    };
    const fmt = (d) => (d ? d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
    const label = computed(() => (draft.value.from ? fmt(draft.value.from) + ' to ' + (draft.value.to ? fmt(draft.value.to) : '\\u2026') : 'Pick a range'));

    return () => h('div', { class: 'kape-range' }, [
      h('button', {
        class: 'kape-range__trigger',
        type: 'button',
        'aria-expanded': open.value,
        onClick: () => { open.value = !open.value; },
      }, [
        h(KapeIcon, { name: 'stamp-card', size: 18 }),
        h('span', null, label.value),
      ]),

      open.value ? h('div', { class: 'kape-range__pop' }, [
        h('ul', { class: 'kape-range__presets' }, props.presets.map((p) => h('li', {
          key: p.label,
          'aria-current': at(draft.value.from) === at(p.from) && at(draft.value.to) === at(p.to) ? 'true' : undefined,
          onClick: () => { draft.value = { from: p.from, to: p.to }; },
        }, p.label))),

        h('div', { class: 'kape-cal', onKeydown }, [
          h('header', null, [
            h('button', { type: 'button', 'aria-label': 'Previous month', onClick: () => shiftMonth(-1) }, '\\u2039'),
            h('span', null, view.value.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })),
            h('button', { type: 'button', 'aria-label': 'Next month', onClick: () => shiftMonth(1) }, '\\u203a'),
          ]),
          h('div', { ref: grid, class: 'kape-cal__grid', role: 'group', 'aria-label': 'Days' },
            days.value.map((d) => h('button', {
              key: d.getTime(),
              type: 'button',
              class: classOf(d),
              'aria-label': fmt(d),
              'aria-current': at(d) === today ? 'date' : undefined,
              'aria-pressed': isEnd(d) ? true : undefined,
              // One tab stop for the whole grid: arrows move within it, Tab leaves it.
              tabindex: at(d) === at(focused.value) ? 0 : -1,
              onClick: () => { focused.value = midnight(d); pick(d); },
            }, String(d.getDate())))),
        ]),

        h('footer', null, [
          h('button', {
            class: 'kape-btn',
            type: 'button',
            onClick: () => { draft.value = { from: props.from, to: props.to }; open.value = false; emit('cancel'); },
          }, 'Cancel'),
          h('button', {
            class: ['kape-btn', 'kape-btn--ink'],
            type: 'button',
            disabled: !draft.value.from || !draft.value.to,
            onClick: () => { open.value = false; emit('apply', draft.value); },
          }, 'Apply'),
        ]),
      ]) : null,
    ]);`,

  cmdk: `    const el = ref(null);
    const field = ref(null);
    const q = ref('');
    const cursor = ref(0);
    let opener = null;

    const hits = computed(() => props.commands.filter((c) => c.label.toLowerCase().includes(q.value.toLowerCase())));
    const groups = computed(() => [...new Set(hits.value.map((c) => c.group))]);

    // Bound in onMounted, not at module scope: window does not exist on a server, and this
    // package is imported by Nuxt before a browser is ever involved.
    const onHotkey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === props.hotkey) {
        e.preventDefault();
        opener = document.activeElement;
        emit('update:open', !props.open);
      }
    };
    const sync = async (open) => {
      const d = el.value;
      if (!d || typeof d.showModal !== 'function') return;
      if (open) {
        if (!d.open) d.showModal();
        q.value = '';
        cursor.value = 0;
        await nextTick();
        if (field.value && field.value.focus) field.value.focus();
      } else {
        if (d.open) d.close();
        if (opener && opener.focus) opener.focus();
      }
    };
    onMounted(() => { window.addEventListener('keydown', onHotkey); sync(props.open); });
    onBeforeUnmount(() => window.removeEventListener('keydown', onHotkey));
    watch(() => props.open, sync);
    watch(hits, () => { cursor.value = 0; });

    const move = (n) => {
      if (hits.value.length) cursor.value = (cursor.value + n + hits.value.length) % hits.value.length;
    };
    const run = (c) => {
      const cmd = c || hits.value[cursor.value];
      if (!cmd) return;
      emit('update:open', false);
      if (typeof cmd.run === 'function') cmd.run();
    };
    const onKeydown = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); run(); }
    };

    return () => h('dialog', {
      ref: el,
      class: 'kape-cmdk',
      'aria-label': 'Command palette',
      onClose: () => emit('update:open', false),
    }, [
      h('label', null, [
        h(KapeIcon, { name: 'grinder', size: 18 }),
        h('input', {
          ref: field,
          value: q.value,
          placeholder: props.placeholder,
          role: 'combobox',
          'aria-expanded': 'true',
          'aria-controls': 'kape-cmdk-list',
          'aria-activedescendant': hits.value[cursor.value] ? 'kape-cmd-' + hits.value[cursor.value].id : undefined,
          onInput: (e) => { q.value = e.target.value; },
          onKeydown,
        }),
        h('kbd', null, 'esc'),
      ]),

      h('ul', { id: 'kape-cmdk-list', role: 'listbox' }, groups.value.flatMap((g) => [
        // presentation, not an option: a heading counted as an option makes the listbox
        // report the wrong size and lets the cursor land on a non-command.
        h('li', { key: 'g:' + g, class: 'kape-cmdk__group', role: 'presentation' }, g),
        ...hits.value.filter((c) => c.group === g).map((c) => h('li', {
          id: 'kape-cmd-' + c.id,
          key: c.id,
          role: 'option',
          'aria-selected': hits.value[cursor.value] ? hits.value[cursor.value].id === c.id : false,
          onMousedown: (e) => { e.preventDefault(); cursor.value = hits.value.indexOf(c); run(c); },
        }, [h('span', null, c.label)])),
      ])),

      h('footer', null, [
        h('kbd', null, '\\u2191\\u2193'), ' move ',
        h('kbd', null, '\\u21b5'), ' run ',
        h('kbd', null, 'esc'), ' close',
        h('span', { class: 'kape-sr', 'aria-live': 'polite' }, hits.value.length + ' results'),
      ]),
    ]);`,

  drawer: `    const el = ref(null);
    const closer = ref(null);
    let opener = null;

    const sync = async (open) => {
      const d = el.value;
      if (!d || typeof d.showModal !== 'function') return;
      if (open) {
        opener = document.activeElement;
        if (!d.open) d.showModal();
        await nextTick();
        if (closer.value && closer.value.focus) closer.value.focus();
      } else {
        if (d.open) d.close();
        if (opener && opener.focus) opener.focus();
      }
    };
    onMounted(() => sync(props.open));
    watch(() => props.open, sync);

    const total = () => props.lines.reduce((n, l) => n + Number(String(l.total).replace(/[^0-9.]/g, '')), 0);

    return () => h('dialog', {
      ref: el,
      class: 'kape-drawer',
      // The stylesheet pins the panel to the right edge; a left drawer flips the three
      // properties that decide the edge and nothing else.
      style: props.side === 'left' ? { inset: '0 auto 0 0', borderLeft: 0, borderRight: '1px solid var(--line)' } : null,
      'aria-labelledby': 'kape-drawer-title',
      onClose: () => emit('close'),
      onCancel: () => emit('close'),
    }, [
      h('header', null, [
        h('span', { id: 'kape-drawer-title' }, props.title),
        h('button', { ref: closer, type: 'button', 'aria-label': 'Close', onClick: () => emit('close') }, '\\u00d7'),
      ]),

      h('div', { class: 'kape-drawer__body' }, [
        ...props.lines.map((l) => h('div', { key: l.id, class: 'kape-line' }, [
          h('span', null, [h('span', null, String(l.qty)), ' \\u00d7 ', h('span', null, l.name)]),
          h('span', { class: 'num' }, l.total),
        ])),
        h('div', { class: ['kape-line', 'kape-line--total'] }, [
          h('span', null, 'Total'),
          h('span', { class: 'num' }, String(total())),
        ]),
      ]),

      h('footer', null, [
        h('button', { class: ['kape-btn', 'kape-btn--ink'], type: 'button', onClick: () => emit('ready') }, 'Mark ready'),
        h('button', { class: 'kape-btn', type: 'button', onClick: () => emit('refund') }, 'Refund'),
      ]),
    ]);`,
};

/* ------------------------------------------------------------------ *
 * Emitting
 * ------------------------------------------------------------------ */

function iconsSource() {
  const data = JSON.stringify(
    icons.map((i) => ({ name: i.name, aliases: i.aliases, body: stripHints(i.body), mono: stripHints(monoOf(i)) })),
  );

  const singles = icons
    .map((i) => `export const KapeIcon${pascal(i.name)} = /* @__PURE__ */ single(${JSON.stringify(i.name)});`)
    .join('\n');
  const map = icons.map((i) => `  ${JSON.stringify(i.name)}: KapeIcon${pascal(i.name)},`).join('\n');

  return `/**
 * Kapehan icons for Vue: ${icons.length} single-icon components plus the lookup component.
 *
 *   import { KapeIcon, KapeIconBarako } from 'kapehan/vue/icons.js';
 *
 *   <KapeIcon name="cup-cold" :size="32" />   name is data, resolved at runtime
 *   <KapeIconBarako :size="32" mono />        the icon is the component, tree-shakeable
 *
 * Render functions, not SFCs: vue is a peer and this package has no build step. The svg
 * body is build-time data from kapehan-icons.js, never anything a caller passes, which is
 * what makes innerHTML safe here.
 *
 * GENERATED by scripts/generators/vue.mjs. Do not edit by hand.
 * ${BANNER}
 */
import { h } from 'vue';

export const icons = ${data};

const INDEX = new Map();
for (const i of icons) {
  INDEX.set(i.name, i);
  for (const a of i.aliases) if (!INDEX.has(a)) INDEX.set(a, i);
}

/** The icon record for a name or alias, or undefined. Lookup never throws. */
export const getIcon = (name) => INDEX.get(String(name == null ? '' : name).trim());

const sizeProp = { type: [Number, String], default: 24 };

export const KapeIcon = {
  name: 'KapeIcon',
  props: {
    name: { type: String, required: true },
    size: sizeProp,
    mono: { type: Boolean, default: false },
    // The colour track is the default, so \`colour\` reads as documentation on a call site
    // that wants to be explicit. It is deliberately inert.
    colour: { type: Boolean, default: false },
    label: { type: String, default: null },
  },
  setup(props) {
    return () => {
      const icon = getIcon(props.name);
      if (!icon) return null;
      const n = Number(props.size);
      const size = Number.isFinite(n) && n > 0 ? n : 24;
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 48 48',
        fill: 'none',
        role: 'img',
        'aria-label': props.label || icon.name.replace(/-/g, ' '),
        innerHTML: props.mono ? icon.mono : icon.body,
      });
    };
  },
};

const single = (name) => ({
  name: 'KapeIcon' + name.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase()),
  props: { size: sizeProp, mono: { type: Boolean, default: false }, label: { type: String, default: null } },
  setup(props) {
    return () => h(KapeIcon, { name, size: props.size, mono: props.mono, label: props.label });
  },
});

${singles}

/** Every single-icon component, keyed by icon name. Aliases resolve through KapeIcon. */
export const iconComponents = {
${map}
};
`;
}

function componentSource(c, surface) {
  const body = RENDER[c.key];
  if (!body) throw new Error(`vue: no render function for component "${c.key}"`);
  const pName = nameOf(c.key);

  const props = surface.props.length
    ? '{\n' + surface.props.map(([k, v]) => `    ${k}: ${v},`).join('\n') + '\n  }'
    : '{}';

  const doc = [
    `/**`,
    ` * ${c.label} (${c.cat}).`,
    ` *`,
    // The manifest's props table is the documented surface, but it is a superset: it lists
    // React callbacks and props some snippets never declared. What is listed here is what
    // the component actually takes.
    ...(surface.props.length ? [' * Props: ' + surface.props.map(([k]) => k).join(', ')] : []),
    ...(surface.emits.length ? [' * Emits: ' + surface.emits.join(', ')] : []),
    ...c.a11y.keys.map((k) => ` * Keys: ${k}`),
    ` */`,
  ].join('\n');

  return `${doc}
export const ${pName} = {
  name: '${pName}',
  props: ${props},
  emits: ${JSON.stringify(surface.emits)},
  setup(props, { emit, slots }) {
${body}
  },
};`;
}

function componentsSource(list, surfaces) {
  const blocks = list.map((c) => componentSource(c, surfaces.get(c.key)));
  const map = list.map((c) => `  ${JSON.stringify(c.key)}: ${nameOf(c.key)},`).join('\n');

  return `/**
 * Kapehan components for Vue: ${list.length} render functions, no SFC compilation.
 *
 *   import { KapeButton } from 'kapehan/vue/components.js';
 *   import 'kapehan/kapehan.css';
 *
 * Every component is a plain object with props, emits and a setup() that returns an h()
 * closure, so it imports in node, in Vite with no plugin, and from a bare
 * <script type="module">. vue is a peer dependency and is never bundled.
 *
 * The class names are exactly the ones in kapehan.css. Nothing here holds a colour: the
 * stylesheet reads var(--accent) and friends, and swapping a palette restyles all of it.
 * No component fetches anything.
 *
 * Props and emits are derived from the <script setup> snippets in kapehan-components.js,
 * which are the specification. Those snippets ship untouched as vue/src/*.vue, as copy
 * material rather than as modules to import.
 *
 * GENERATED by scripts/generators/vue.mjs. Do not edit by hand.
 * ${BANNER}
 */
import { h, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { KapeIcon } from './icons.js';

/**
 * v-model that also works with no v-model bound.
 *
 * A caller who never binds modelValue still gets a working control, because the value is
 * held locally and the parent is only notified. Binding it makes the parent the owner: the
 * watch pulls its value back in. Without the local copy an unbound <KapeSeg /> is dead on
 * click, which is how these read in a docs page.
 */
const useModel = (props, emit, seed) => {
  const local = ref(props.modelValue !== undefined ? props.modelValue : seed);
  watch(() => props.modelValue, (v) => { if (v !== undefined) local.value = v; });
  return computed({
    get: () => local.value,
    set: (v) => { local.value = v; emit('update:modelValue', v); },
  });
};

${blocks.join('\n\n')}

/** Every component, keyed the way kapehan-components.js keys them. */
export const components = {
${map}
};

/** Look a component up by key. Returns undefined rather than throwing, like getIcon. */
export const getComponent = (key) => components[key];
`;
}

const indexSource = () => `/**
 * Kapehan for Vue.
 *
 *   import { KapeButton, KapeIcon } from 'kapehan/vue';
 *
 * Re-exports both halves. They are separate subpaths on purpose: someone who wants three
 * icons should import 'kapehan/vue/icons.js' and leave the components out of the bundle.
 *
 * GENERATED by scripts/generators/vue.mjs. Do not edit by hand.
 * ${BANNER}
 */
export * from './icons.js';
export * from './components.js';
`;

export async function artifacts() {
  const out = new Map();
  const list = await manifest();

  const surfaces = new Map(list.map((c) => [c.key, surfaceOf(c)]));

  out.set('vue/icons.js', iconsSource());
  out.set('vue/components.js', componentsSource(list, surfaces));
  out.set('vue/index.js', indexSource());

  // Copy material for a future `npx kapehan add`, not modules. A .vue file needs a
  // compiler, so nothing in the package imports these; they exist to be pasted.
  for (const c of list) {
    out.set(`vue/src/${nameOf(c.key)}.vue`, c.vue.trimEnd() + '\n');
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * Gates
 * ------------------------------------------------------------------ */

/**
 * The kape- classes an emitted module puts on an element.
 *
 * Class positions only. A bare kape- scan over the same source also picks up
 * 'kape-combo-list', 'kape-opt-' and 'kape-dialog-title', which are element ids the ARIA
 * wiring points at, and reports every one of them as a stylesheet class the CSS is
 * missing. Reading only the value that follows `class:` is what separates them.
 */
function emittedClasses(js) {
  const found = new Set();
  for (const m of js.matchAll(/(?:^|[\s,{([])class\s*:\s*/g)) {
    let i = m.index + m[0].length;
    const startsBracket = '([{'.includes(js[i]);
    let depth = 0;
    let quote = null;
    let escaped = false;
    const from = i;
    for (; i < js.length; i++) {
      const ch = js[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) { if (--depth === 0 && startsBracket) { i++; break; } if (depth < 0) break; }
      else if (ch === ',' && depth === 0 && !startsBracket) break;
      else if (ch === '\n' && depth === 0 && !startsBracket) break;
    }
    for (const cls of js.slice(from, i).match(/kape-[a-z0-9_-]+/g) ?? []) found.add(cls);
  }
  return found;
}

/** Browser globals evaluated at module scope, which is what breaks Nuxt on the import. */
function moduleScopeGlobals(js) {
  const bad = [];
  let depth = 0;
  let quote = null;
  let escaped = false;
  let word = '';
  const globals = new Set(['document', 'window', 'HTMLElement', 'customElements', 'navigator', 'localStorage']);
  for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; word = ''; continue; }
    if (ch === '/' && js[i + 1] === '/') { while (i < js.length && js[i] !== '\n') i++; continue; }
    if (ch === '/' && js[i + 1] === '*') { i = js.indexOf('*/', i) + 1; continue; }
    if (/[A-Za-z0-9_$]/.test(ch)) { word += ch; continue; }
    if (depth === 0 && globals.has(word)) bad.push(word);
    word = '';
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
  }
  return [...new Set(bad)];
}

export async function check({ root: repo, expected }) {
  const fail = [];
  const list = await manifest();

  const cssText = await readFile(join(repo, 'kapehan.css'), 'utf8');
  const cssClasses = new Set((cssText.match(/\.kape-[a-z0-9_-]+/g) ?? []).map((x) => x.slice(1)));

  const files = expected ?? (await artifacts());
  const get = (p) => files.get(p) ?? '';

  // 1. Every class an emitted component puts on an element must exist in kapehan.css.
  //    A snippet naming a class the stylesheet does not define renders unstyled, and looks
  //    perfectly fine in a diff. Both the modules and the .vue copy material are checked:
  //    the .vue files are what a consumer pastes, so an unstyled class there ships too.
  for (const [path, body] of files) {
    if (!path.startsWith('vue/')) continue;
    const used = path.endsWith('.vue')
      ? classesOf({ html: '', react: '', vue: body, blazor: '' })
      : emittedClasses(body);
    for (const cls of used) {
      if (cls === 'kape-icon' || cls === 'kape-doodle') continue; // elements, not classes
      if (!cssClasses.has(cls)) fail.push(`${path} uses .${cls}, which kapehan.css does not define`);
    }
  }

  // 2. Nothing may touch a browser global at module scope. Shipped 0.2.0 threw
  //    ReferenceError: HTMLElement is not defined on any server that imported the package,
  //    and nothing caught it because the file is only ever loaded in a browser.
  for (const path of ['vue/icons.js', 'vue/components.js', 'vue/index.js']) {
    for (const g of moduleScopeGlobals(get(path))) {
      fail.push(`${path} touches ${g} at module scope, so importing it on a server throws`);
    }
  }

  // 3. Every component must be emitted, and every event it fires must be declared. An
  //    undeclared emit falls through to $attrs and silently becomes a DOM listener.
  const js = get('vue/components.js');
  for (const c of list) {
    const pName = nameOf(c.key);
    if (!js.includes(`export const ${pName} = {`)) fail.push(`vue/components.js does not export ${pName}`);
    if (!files.has(`vue/src/${pName}.vue`)) fail.push(`vue/src/${pName}.vue is missing, so there is nothing to copy`);
  }
  for (const block of js.split(/^export const /m).slice(1)) {
    const pName = block.slice(0, block.indexOf(' '));
    if (!pName.startsWith('Kape')) continue;
    const declared = new Set(JSON.parse((block.match(/emits: (\[[^\]]*\])/) ?? [, '[]'])[1]));
    for (const m of block.matchAll(/(?<![A-Za-z0-9_$.])emit\(\s*'([^']+)'/g)) {
      if (!declared.has(m[1])) fail.push(`${pName} emits "${m[1]}" but does not declare it in emits[]`);
    }
  }

  // 4. Import them for real when vue resolves. This is the gate that would have caught a
  //    browser global inside an object literal, which the scan above cannot see. It is
  //    skipped rather than failed when vue is absent, because check.mjs has to run with
  //    nothing installed (prepublishOnly and the publish workflow both call it).
  let hasVue = true;
  try {
    await import('vue');
  } catch {
    hasVue = false;
  }
  if (hasVue) {
    try {
      const mod = await import(pathToFileURL(join(repo, 'vue/index.js')).href);
      if (typeof mod.KapeIcon !== 'object') fail.push('vue/index.js exports no KapeIcon component');
      for (const c of list) {
        const comp = mod[nameOf(c.key)];
        if (!comp || typeof comp.setup !== 'function') fail.push(`vue/index.js exports no working ${nameOf(c.key)}`);
      }
    } catch (e) {
      fail.push(`vue/index.js cannot be imported in node: ${e.message}`);
    }
  }

  return fail;
}
