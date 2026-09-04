/**
 * The React package: three split subpaths, no JSX, no build step.
 *
 *   react/icons.js       one component per icon, plus <KapeIcon name="...">
 *   react/components.js  one component per manifest entry
 *   react/index.js       both, for people who want a single import
 *
 * Split on purpose. A single react.js would make a project that wants two icons pull the
 * whole component set, and the two halves have different reasons to change: icons.js is
 * regenerated when kapehan-icons.js changes, components.js when the canvas does.
 *
 * Everything is plain ESM calling React.createElement. There is no JSX because there is no
 * build step: the file that ships is the file that runs, the same promise kape-icon.js
 * makes. React is a peer, imported by bare specifier and never bundled.
 *
 * Nothing here touches a browser global at module scope. kape-icon.js shipped 0.2.0 with a
 * class extending HTMLElement evaluated at import time, which threw ReferenceError under
 * SSR; check() below evaluates both emitted modules in node against a stubbed React to
 * prove this one does not repeat it, and calls every component once.
 *
 * The class names come from kapehan.css and never fork per framework, so check() also
 * fails on any kape- class the stylesheet does not define.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { icons, monoOf, stripHints } from '../../kapehan-icons.js';
import { components } from '../../kapehan-components.js';
import { root } from '../registry.mjs';

export const name = 'react';

export const pkg = {
  exports: {
    './react': './react/index.js',
    './react/index.js': './react/index.js',
    './react/icons.js': './react/icons.js',
    './react/components.js': './react/components.js',
  },
  files: ['react'],
  // Every emitted file imports react by bare specifier and nothing bundles it, so without
  // this a project that runs `npm i kapehan` and imports kapehan/react gets
  // ERR_MODULE_NOT_FOUND with no install hint and no peer warning. useId is 18, so 18 is
  // the floor. Optional because the rest of the package (kape-icon.js, the CSS, the SVGs)
  // is plain browser code: marking it required would make every kapehan install pull React
  // in, and warn in every project that does not use it.
  peerDependencies: { react: '>=18' },
  peerDependenciesMeta: { react: { optional: true } },
};

const ICONS_FILE = 'react/icons.js';
const COMPONENTS_FILE = 'react/components.js';
const INDEX_FILE = 'react/index.js';

/* ------------------------------------------------------------------ names */

const pascal = (s) =>
  String(s)
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

/** Kape + the manifest key, so the export name is derivable from the key and vice versa. */
const componentName = (c) => 'Kape' + pascal(c.key);

/**
 * A second, readable name taken from the canvas label, because KapeAcc and KapeCmdk are
 * not names anyone guesses. Generated, never typed: a renamed label renames the alias.
 * Dropped when it would duplicate another export.
 */
const componentAlias = (c) => {
  const alias = 'Kape' + pascal(c.label);
  return alias === componentName(c) ? null : alias;
};

const iconName = (icon) => pascal(icon.name);

/* ------------------------------------------- props, straight from the manifest */

/** Vue's modelValue is React's value. The only rename, and check() knows about it. */
const RENAME = { modelValue: 'value' };

/**
 * Single quotes to match everything else in the emitted file, but never at the cost of
 * correctness: a palette is called "Sago't gulaman", and a label with an apostrophe in it
 * goes back to JSON's double quotes rather than being escaped by hand.
 */
const quote = (s) => (s.indexOf("'") === -1 && s.indexOf('\\') === -1 ? "'" + s + "'" : JSON.stringify(s));

/**
 * A prop default as a JS literal, or undefined when the manifest default is prose. "—"
 * means "no default" and Date defaults like "today" cannot be spelled as a literal, so the
 * component body supplies those instead.
 */
function literalOf(p) {
  const d = String(p.default == null ? '' : p.default).trim();
  const t = String(p.type || '');
  if (!d || d === '—' || d === '-') return undefined;
  if (d === 'null') return 'null';
  if (d === '[]') return '[]';
  if (d === '""' || d === "''") return "''";
  if (/^(true|false)$/.test(d)) return d;
  if (/^-?\d+(\.\d+)?$/.test(d) && /number/.test(t)) return d;
  if (/string/.test(t) || /'/.test(t)) return quote(d);
  return undefined;
}

/** The destructured signature: every manifest prop, in canvas order, then the extras. */
function params(c, spec) {
  const parts = [];
  for (const p of c.props) {
    const key = RENAME[p.name] || p.name;
    const has = spec.defaults && Object.prototype.hasOwnProperty.call(spec.defaults, p.name);
    const lit = has ? spec.defaults[p.name] : literalOf(p);
    parts.push(lit === undefined ? key : key + ' = ' + lit);
  }
  for (const extra of spec.extra || []) parts.push(extra);
  parts.push('className', '...rest');
  return '{ ' + parts.join(', ') + ' }';
}

const docOf = (c) => {
  const line = (head, list) => list.map((x) => ' * ' + head + x).join('\n');
  return [
    '/**',
    ' * ' + c.label + ' — ' + c.cat + '.',
    ' *',
    line('roles: ', c.a11y.roles),
    line('attrs: ', c.a11y.attrs),
    line('keys:  ', c.a11y.keys),
    ' */',
  ].join('\n');
};

/* ------------------------------------------------------------- the icon module */

function iconsSource() {
  const data = icons.map((i) => ({
    name: i.name,
    aliases: i.aliases,
    body: stripHints(i.body),
    mono: stripHints(monoOf(i)),
  }));

  const exports = icons
    .map(
      (i) =>
        'export const ' +
        iconName(i) +
        ' = (props) => createElement(KapeIcon, Object.assign({}, props, { name: ' +
        quote(i.name) +
        ' }));',
    )
    .join('\n');

  return `/**
 * Kapehan icons for React: ${icons.length} icons, one component each, plus <KapeIcon>.
 *
 *   import { Barako, KapeIcon } from 'kapehan/react/icons.js';
 *
 *   <Barako size={32} />
 *   <KapeIcon name="cup-cold" mono />
 *
 * Props: size (px, default 24), mono (currentColor build), colour (accepted and ignored,
 * the colour build is the default), label (accessible name; pass null for decorative).
 * Anything else lands on the <svg>.
 *
 * No JSX and no build step, so this file is what runs. React is a peer dependency and the
 * only import. Nothing here touches a browser global, so it is safe to render on a server.
 *
 * GENERATED from kapehan-icons.js by scripts/generators/react.mjs. Do not edit by hand.
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
import { createElement } from 'react';

const ICONS = ${JSON.stringify(data)};

const INDEX = new Map();
for (const i of ICONS) {
  INDEX.set(i.name, i);
  for (const a of i.aliases) if (!INDEX.has(a)) INDEX.set(a, i);
}

export function KapeIcon({ name, size = 24, mono = false, colour, label, children, ...rest }) {
  const icon = INDEX.get(typeof name === 'string' ? name.trim() : '');
  if (!icon) return null;

  // size arrives from the host page and may be anything. It is a React prop rather than a
  // string concatenated into markup, but a NaN width still renders a broken box.
  const n = Number(size);
  const px = Number.isFinite(n) && n > 0 ? n : 24;
  const named = label === undefined ? icon.name.replace(/-/g, ' ') : label;

  return createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: px,
    height: px,
    viewBox: '0 0 48 48',
    fill: 'none',
    role: named == null ? 'presentation' : 'img',
    'aria-hidden': named == null ? 'true' : undefined,
    'aria-label': named == null ? undefined : named,
    ...rest,
    // Build-time icon data only. Nothing a caller passes reaches this string.
    dangerouslySetInnerHTML: { __html: mono ? icon.mono : icon.body },
  });
}

${exports}
`;
}

/* ------------------------------------------------------- the component module */

/**
 * One entry per manifest key. `body` is the function body; the signature above it is
 * generated from the manifest props, so a prop added on the canvas appears here or
 * check() fails. `extra` adds props React needs that the props table does not carry
 * (onChange handlers, children), `defaults` overrides a default the manifest states as
 * prose, `native` waives a key the browser already handles.
 */
const IMPL = {
  button: {
    extra: ['children', 'busy = false', 'size'],
    native: { Enter: 'a native button activates on Enter and Space' },
    body: `  const body = children === undefined ? label : children;
  const auto = body ? undefined : typeof icon === 'string' ? icon.replace(/-/g, ' ') : undefined;
  return h(
    'button',
    {
      type: 'button',
      className: cx('kape-btn', BTN[variant], size === 'sm' && 'kape-btn--sm', className),
      disabled: disabled || undefined,
      'aria-busy': busy || undefined,
      'aria-label': auto,
      onClick,
      ...rest,
    },
    iconNode(icon, 20),
    body,
  );`,
  },

  chip: {
    native: { Enter: 'a native button activates on Enter and Space' },
    body: `  // aria-pressed goes on every chip, not only the pressed one, or the unpressed ones
  // are announced as plain buttons.
  return h(
    Fragment,
    null,
    options.map((opt, i) =>
      h(
        'button',
        {
          key: opt,
          type: 'button',
          className: cx('kape-chip', className),
          'aria-pressed': value === opt,
          onClick: () => fire(onChange, opt),
          // One id, on the first chip. See restFor.
          ...restFor(i === 0, rest),
        },
        opt,
      ),
    ),
  );`,
  },

  input: {
    extra: ['onChange', 'label', 'describedBy'],
    body: `  return h(
    'label',
    { className: cx('kape-input', className) },
    iconNode(icon, 18),
    h('input', {
      type,
      value,
      placeholder,
      'aria-label': label,
      'aria-describedby': describedBy,
      onChange: (e) => fire(onChange, e.target.value, e),
      ...rest,
    }),
  );`,
  },

  seg: {
    extra: ['label'],
    native: { Enter: 'a native button activates on Enter and Space' },
    body: `  return h(
    'div',
    { className: cx('kape-seg', className), role: 'group', 'aria-label': label, ...rest },
    options.map((opt) =>
      h(
        'button',
        { key: opt, type: 'button', 'aria-pressed': value === opt, onClick: () => fire(onChange, opt) },
        opt,
      ),
    ),
  );`,
  },

  toast: {
    extra: ['onAction', 'onDismiss', "icon = 'coffee-cup'"],
    body: `  const warn = tone === 'warn';
  useEffect(() => {
    // A warn toast never times out: the manifest requires its action to stay reachable,
    // and an alert that disappears is an alert nobody could act on.
    if (warn || !timeout || !onDismiss) return undefined;
    const t = setTimeout(onDismiss, timeout);
    return () => clearTimeout(t);
  }, [warn, timeout, onDismiss]);

  // aria-live is implied by the role. Setting both makes some readers announce twice.
  return h(
    'div',
    {
      className: cx('kape-toast', warn && 'kape-toast--warn', className),
      role: warn ? 'alert' : 'status',
      ...rest,
    },
    iconNode(icon, 20),
    h('span', { className: 'kape-toast__text' }, message),
    actionLabel
      ? h('button', { type: 'button', className: 'kape-toast__action', onClick: onAction }, actionLabel)
      : null,
  );`,
  },

  stamps: {
    body: `  const slots = Math.max(0, Math.floor(Number(total) || 0));
  const on = Math.min(slots, Math.max(0, Math.floor(Number(filled) || 0)));
  // Every slot is aria-hidden and the count is carried once, in text, so a reader hears
  // "7 of 10" rather than ten anonymous spans.
  return h(
    Fragment,
    null,
    h(
      'div',
      { className: cx('kape-stamps', className), role: 'group', 'aria-label': label, ...rest },
      range(slots).map((i) =>
        h(
          'span',
          { key: i, 'data-on': i < on ? '' : undefined, 'aria-hidden': 'true' },
          i < on ? iconNode(icon, 16) : null,
        ),
      ),
    ),
    h('p', { className: 'kape-sr' }, on + ' of ' + slots + ' stamps earned'),
  );`,
  },

  row: {
    body: `  return h(
    Fragment,
    null,
    items.map((item, i) => {
      const pick = onPick ? () => onPick(item) : undefined;
      const flag = item.badge === undefined ? badge : item.badge;
      return h(
        'div',
        {
          key: item.id === undefined ? i : item.id,
          className: cx('kape-row', className),
          // A static row is not focusable. An interactive one is a real button stop.
          role: pick ? 'button' : undefined,
          tabIndex: pick ? 0 : undefined,
          onClick: pick,
          onKeyDown: pick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pick();
                }
              }
            : undefined,
          // One id, on the first row. See restFor.
          ...restFor(i === 0, rest),
        },
        h('span', { className: 'kape-row__art' }, iconNode(item.icon, 40)),
        h(
          'div',
          { className: 'kape-row__body' },
          h(
            'p',
            { className: 'kape-row__title' },
            item.name,
            flag ? h('span', { className: 'kape-badge' }, flag) : null,
          ),
          item.sub || item.note ? h('p', { className: 'kape-row__sub' }, item.sub || item.note) : null,
        ),
        h('span', { className: 'kape-row__price' }, money(item.price)),
      );
    }),
  );`,
  },

  stepper: {
    extra: ['label'],
    native: { Enter: 'a native button activates on Enter and Space' },
    body: `  const set = (next) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped !== value) fire(onChange, clamped);
  };
  return h(
    'div',
    {
      className: cx('kape-stepper', className),
      onKeyDown: (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          set(value + 1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          set(value - 1);
        }
      },
      ...rest,
    },
    h('button', { type: 'button', 'aria-label': 'Fewer', disabled: value <= min, onClick: () => set(value - 1) }, '−'),
    h('output', { 'aria-live': 'polite', 'aria-label': label }, value),
    h('button', { type: 'button', 'aria-label': 'More', disabled: value >= max, onClick: () => set(value + 1) }, '+'),
  );`,
  },

  switch: {
    extra: ['onChange'],
    body: `  // The label element is the track, so the visible text lives beside the component and
  // the control carries its name through aria-label.
  return h(
    'label',
    { className: cx('kape-switch', className) },
    h('input', {
      type: 'checkbox',
      checked: !!value,
      disabled,
      'aria-label': label,
      onChange: (e) => fire(onChange, e.target.checked, e),
      ...rest,
    }),
  );`,
  },

  check: {
    extra: ['onChange', 'legend', 'describedBy'],
    body: `  const auto = useId();
  const group = name || auto;
  const many = Array.isArray(value);
  const checkbox = mode === 'checkbox';
  const on = (opt) => (many ? value.indexOf(opt) !== -1 : value === opt);
  const pick = (opt) => {
    if (checkbox && many) fire(onChange, on(opt) ? value.filter((v) => v !== opt) : value.concat([opt]));
    else fire(onChange, opt);
  };
  const set = options.map((opt, i) =>
    h(
      'label',
      // With a legend the caller's props go on the fieldset. Without one there is no
      // wrapper element at all, so they go on the first label rather than on every one of
      // them, and rather than being dropped the way they used to be.
      Object.assign({ key: opt, className: cx(checkbox ? 'kape-check' : 'kape-radio', className) }, legend ? null : restFor(i === 0, rest)),
      h('input', {
        type: checkbox ? 'checkbox' : 'radio',
        name: group,
        checked: on(opt),
        'aria-describedby': describedBy,
        onChange: () => pick(opt),
      }),
      ' ',
      opt,
    ),
  );
  // A radio set is a fieldset with a legend whenever the caller gives us one.
  return legend ? h('fieldset', rest, h('legend', null, legend), set) : h(Fragment, null, set);`,
  },

  select: {
    extra: ['onChange', 'invalid = false'],
    native: { Enter: 'a native select commits on Enter', Escape: 'a native select reverts on Escape' },
    body: `  return h(
    'label',
    { className: cx('kape-select', className) },
    label ? h('span', null, label) : null,
    h(
      'select',
      {
        value: value === undefined ? '' : value,
        'aria-invalid': invalid || undefined,
        onChange: (e) => fire(onChange, e.target.value, e),
        ...rest,
      },
      options.map((o) => h('option', { key: o.id, value: o.id }, o.name)),
    ),
  );`,
  },

  tabs: {
    extra: ['label', 'panelId'],
    body: `  const stops = useRef([]);
  const move = (i) => {
    const next = tabs[i];
    if (next === undefined) return;
    fire(onChange, next);
    const node = stops.current[i];
    if (node) node.focus();
  };
  const onKeyDown = (e) => {
    if (!tabs.length) return;
    const i = tabs.indexOf(value);
    const at = i === -1 ? 0 : i;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      move((at + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move((at - 1 + tabs.length) % tabs.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      move(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      move(tabs.length - 1);
    }
  };
  return h(
    'div',
    { className: cx('kape-tabs', className), role: 'tablist', 'aria-label': label, onKeyDown, ...rest },
    tabs.map((t, i) =>
      h(
        'button',
        {
          key: t,
          type: 'button',
          role: 'tab',
          'aria-selected': value === t,
          'aria-controls': panelId,
          // One tab stop for the whole set; the arrows move within it.
          tabIndex: value === t ? 0 : -1,
          ref: (node) => {
            stops.current[i] = node;
          },
          onClick: () => fire(onChange, t),
        },
        t,
      ),
    ),
  );`,
  },

  card: {
    extra: ["addLabel = 'Add'"],
    defaults: { item: '{}' },
    body: `  const sub = [item.size, item.temp].filter(Boolean).join(' · ');
  return h(
    'article',
    { className: cx('kape-card', className), ...rest },
    iconNode(item.icon, size),
    h('p', { className: 'kape-card__title' }, item.name),
    sub ? h('p', { className: 'kape-card__sub' }, sub) : null,
    h(
      'div',
      { className: 'kape-card__foot' },
      h('span', { className: 'kape-row__price' }, money(item.price)),
      onAdd
        ? h(
            'button',
            {
              type: 'button',
              className: 'kape-btn kape-btn--primary',
              'aria-label': item.name ? addLabel + ' ' + item.name : undefined,
              onClick: () => onAdd(item),
            },
            addLabel,
          )
        : null,
    ),
  );`,
  },

  tag: {
    extra: ['children'],
    body: `  return h(
    'span',
    { className: cx('kape-tag', TAG[tone], className), ...rest },
    children === undefined ? label : children,
  );`,
  },

  avatar: {
    body: `  const shown = people.slice(0, Math.max(0, max));
  const extra = people.length - shown.length;
  return h(
    'div',
    { className: cx('kape-avatars', className), ...rest },
    shown.map((p, i) =>
      h(
        'span',
        { key: p.id === undefined ? i : p.id, className: cx('kape-avatar', i === accentIndex && 'kape-avatar--accent') },
        p.initials,
      ),
    ),
    // The overflow chip is the one avatar that carries information, so it gets a name.
    extra > 0 ? h('span', { className: 'kape-avatar', 'aria-label': extra + ' more' }, '+' + extra) : null,
  );`,
  },

  dialog: {
    extra: ["cancelLabel = 'Keep it'", 'children'],
    native: { Escape: 'a native dialog closes on Escape and traps Tab' },
    body: `  const ref = useRef(null);
  const cancel = useRef(null);
  const id = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof node.showModal !== 'function') return undefined;
    if (open && !node.open) {
      node.showModal();
      // Focus lands on the least destructive action, never on the confirm.
      if (cancel.current) cancel.current.focus();
    }
    if (!open && node.open) node.close();
    return undefined;
  }, [open]);

  return h(
    'dialog',
    {
      ref,
      className: cx('kape-dialog', className),
      'aria-labelledby': id,
      onCancel: (e) => {
        e.preventDefault();
        fire(onClose);
      },
      ...rest,
    },
    h('h2', { id }, title),
    body ? h('p', null, body) : null,
    children,
    h(
      'div',
      { className: 'kape-dialog__actions' },
      h('button', { type: 'button', className: 'kape-btn kape-btn--ghost', ref: cancel, onClick: () => fire(onClose) }, cancelLabel),
      h('button', { type: 'button', className: 'kape-btn kape-btn--ink', onClick: () => fire(onConfirm) }, confirmLabel),
    ),
  );`,
  },

  tip: {
    extra: ['children'],
    native: { Escape: 'the manifest is explicit that Escape does not dismiss a CSS tooltip' },
    body: `  const id = useId();
  // The bubble is CSS content, which no screen reader reaches, so the same words are also
  // rendered as visually hidden text. placement is an attribute, not a class: the
  // stylesheet only draws the bubble above, and inventing kape-tip--bottom would be a
  // class kapehan.css does not have.
  return h(
    'span',
    { className: cx('kape-tip', className), 'data-tip': text, 'data-placement': placement, 'aria-describedby': id, ...rest },
    children,
    h('span', { id, className: 'kape-sr' }, text),
  );`,
  },

  skeleton: {
    extra: ['children', "label = 'Loading'"],
    body: `  if (!loading) return h(Fragment, null, children === undefined ? null : children);
  const widths = Array.isArray(width) ? width : null;
  // aria-busy goes on the region, once, and the wait is announced in one sentence rather
  // than once per bar.
  return h(
    'div',
    { 'aria-busy': 'true', className, ...rest },
    h('span', { className: 'kape-sr' }, label),
    range(Math.max(0, lines)).map((i) =>
      h('span', {
        key: i,
        className: 'kape-skeleton',
        style: { width: widths ? widths[i % widths.length] : width },
      }),
    ),
  );`,
  },

  progress: {
    body: `  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return h(
    'span',
    {
      className: cx('kape-progress', className),
      role: 'progressbar',
      'aria-valuenow': pct,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-label': label,
      ...rest,
    },
    h('span', { style: { width: pct + '%' } }),
  );`,
  },

  pager: {
    extra: ["label = 'Pages'"],
    native: { Enter: 'a native button activates on Enter and Space' },
    body: `  const go = (p) => {
    if (p >= 1 && p <= pages && p !== page) fire(onChange, p);
  };
  return h(
    'nav',
    { className: cx('kape-pager', className), 'aria-label': label, ...rest },
    h(
      'button',
      { type: 'button', disabled: page <= 1, 'aria-label': 'Previous page', onClick: () => go(page - 1) },
      '‹',
    ),
    range(Math.max(0, pages)).map((i) =>
      h(
        'button',
        {
          key: i + 1,
          type: 'button',
          // aria-current, not aria-selected: these are links to pages, not options.
          'aria-current': i + 1 === page ? 'page' : undefined,
          'aria-label': 'Page ' + (i + 1),
          onClick: () => go(i + 1),
        },
        i + 1,
      ),
    ),
    h(
      'button',
      { type: 'button', disabled: page >= pages, 'aria-label': 'Next page', onClick: () => go(page + 1) },
      '›',
    ),
  );`,
  },

  acc: {
    native: { Enter: 'a native summary toggles on Enter and Space' },
    body: `  // details/summary, so open state, aria-expanded and the keyboard are the browser's.
  // The open attribute is only ever the initial value: it never changes, so React never
  // patches it back over what the reader did.
  return h(
    Fragment,
    null,
    items.map((item, i) =>
      h(
        'details',
        // One id, on the first panel. See restFor.
        { key: item.id === undefined ? i : item.id, className: cx('kape-acc', className), open: i === 0 && openFirst ? true : undefined, ...restFor(i === 0, rest) },
        h('summary', null, item.q),
        h('p', null, item.a),
      ),
    ),
  );`,
  },

  table: {
    extra: ['columns'],
    body: `  const keys = columns || (rows.length ? Object.keys(rows[0]).filter((k) => k !== 'id') : []);
  const num = numericColumns || [];
  const isNum = (k) => num.indexOf(k) !== -1;
  return h(
    'table',
    { className: cx('kape-table', className), ...rest },
    // A caption the layout does not show is still a caption a reader announces.
    caption ? h('caption', { className: 'kape-sr' }, caption) : null,
    h(
      'thead',
      null,
      h(
        'tr',
        null,
        keys.map((k) => h('th', { key: k, scope: 'col', className: isNum(k) ? 'num' : undefined }, titleCase(k))),
      ),
    ),
    h(
      'tbody',
      null,
      rows.map((r, i) =>
        h(
          'tr',
          { key: r.id === undefined ? i : r.id },
          keys.map((k) => h('td', { key: k, className: isNum(k) ? 'num' : undefined }, r[k])),
        ),
      ),
    ),
  );`,
  },

  crumbs: {
    body: `  return h(
    'nav',
    { 'aria-label': label, ...rest },
    h(
      'ol',
      { className: cx('kape-crumbs', className) },
      trail.map((t, i) => {
        const last = i === trail.length - 1;
        // The last crumb is the current page: text, not a link.
        return h(
          'li',
          { key: t.href === undefined ? i : t.href, 'aria-current': last ? 'page' : undefined },
          last ? t.label : h('a', { href: t.href }, t.label),
        );
      }),
    ),
  );`,
  },

  upload: {
    extra: ['onCancel', "label = 'Drop the menu sheet here'", 'hint', "icon = 'coffee-sack'"],
    native: { Enter: 'a native file input opens the picker on Enter and Space' },
    body: `  const [over, setOver] = useState(false);
  const take = (list) => {
    const all = Array.prototype.slice.call(list || []);
    const ok = all.filter((f) => (!maxSize || f.size <= maxSize) && accepted(f.name, accept));
    if (ok.length) fire(onFiles, ok);
  };
  return h(
    Fragment,
    null,
    h(
      'label',
      {
        className: cx('kape-drop', over && 'is-over', className),
        onDragOver: (e) => {
          e.preventDefault();
          setOver(true);
        },
        onDragLeave: () => setOver(false),
        onDrop: (e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer && e.dataTransfer.files);
        },
        ...rest,
      },
      iconNode(icon, 36),
      h('strong', null, label),
      h('span', null, hint === undefined ? sizeHint(accept, maxSize) : hint),
      // The input stays in the DOM and keeps its own focus ring; drag and drop is the
      // enhancement, never the only path.
      h('input', { type: 'file', accept, multiple: true, hidden: true, onChange: (e) => take(e.target.files) }),
    ),
    files.map((f, i) =>
      h(
        'div',
        { key: f.name === undefined ? i : f.name, className: 'kape-file' },
        h('span', { className: 'kape-file__ext' }, String(f.ext || extOf(f.name)).toUpperCase()),
        h(
          'div',
          { className: 'kape-file__body' },
          h('span', null, f.name),
          h(
            'span',
            {
              className: 'kape-progress',
              role: 'progressbar',
              'aria-valuenow': Number(f.pct) || 0,
              'aria-valuemin': 0,
              'aria-valuemax': 100,
              'aria-label': 'Uploading ' + f.name,
            },
            h('span', { style: { width: (Number(f.pct) || 0) + '%' } }),
          ),
        ),
        onCancel
          ? h('button', { type: 'button', 'aria-label': 'Cancel ' + f.name, onClick: () => onCancel(f) }, '✕')
          : null,
      ),
    ),
  );`,
  },

  edit: {
    extra: ['onEditingChange', "field = 'price'", 'caption'],
    body: `  const [own, setOwn] = useState(null);
  const [said, setSaid] = useState('');
  const cells = useRef({});
  const returning = useRef(null);
  const editing = editingId == null ? own : editingId;
  const keys = rows.length ? Object.keys(rows[0]).filter((k) => k !== 'id') : [];
  const heads = columns.length ? columns : keys.map(titleCase);

  // Escape and Enter both put focus back where the reader left it: on the cell. It has to
  // wait for the render that takes the input away, or focus() lands on a cell that is not
  // focusable yet and the browser drops the reader at the top of the page instead.
  useEffect(() => {
    if (editing != null || returning.current == null) return;
    const node = cells.current[returning.current];
    returning.current = null;
    if (node) node.focus();
  }, [editing]);

  const start = (id) => {
    setOwn(id);
    fire(onEditingChange, id);
  };
  const stop = (id) => {
    returning.current = id;
    setOwn(null);
    fire(onEditingChange, null);
  };
  const commit = (row, raw) => {
    const next = Number(raw);
    if (raw !== '' && Number.isFinite(next) && next !== row[field]) {
      fire(onSave, row.id, next);
      setSaid(String(row[keys[0]]) + ' saved');
    }
    stop(row.id);
  };

  return h(
    Fragment,
    null,
    h(
      'table',
      { className: cx('kape-table', 'kape-table--edit', className), ...rest },
      caption ? h('caption', { className: 'kape-sr' }, caption) : null,
      h(
        'thead',
        null,
        h(
          'tr',
          null,
          keys.map((k, i) =>
            h('th', { key: k, scope: 'col', className: k === field || isNumeric(rows, k) ? 'num' : undefined }, heads[i]),
          ),
        ),
      ),
      h(
        'tbody',
        null,
        rows.map((row) => {
          const hot = editing === row.id;
          return h(
            'tr',
            { key: row.id, className: hot ? 'is-editing' : undefined },
            keys.map((k) => {
              const numeric = k === field || isNumeric(rows, k);
              if (k !== field) return h('td', { key: k, className: numeric ? 'num' : undefined }, row[k]);
              return h(
                'td',
                {
                  key: k,
                  className: numeric ? 'num' : undefined,
                  // The cell is the resting focus stop, so F2 has something to act on.
                  tabIndex: hot ? undefined : 0,
                  ref: (node) => {
                    cells.current[row.id] = node;
                  },
                  onDoubleClick: () => start(row.id),
                  onKeyDown: (e) => {
                    if (!hot && (e.key === 'F2' || e.key === 'Enter')) {
                      e.preventDefault();
                      start(row.id);
                    }
                  },
                },
                hot
                  ? h('input', {
                      defaultValue: row[field],
                      inputMode: 'numeric',
                      autoFocus: true,
                      'aria-label': String(row[keys[0]]) + ' ' + heads[keys.indexOf(field)],
                      // Tab out commits, the way a spreadsheet does.
                      onBlur: (e) => commit(row, e.target.value),
                      onKeyDown: (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commit(row, e.target.value);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          e.target.value = String(row[field]);
                          stop(row.id);
                        }
                      },
                    })
                  : money(row[field]),
              );
            }),
          );
        }),
      ),
    ),
    h('p', { className: 'kape-sr', role: 'status', 'aria-live': 'polite' }, said),
  );`,
  },

  combo: {
    extra: ['label'],
    body: `  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const id = useId();
  const listId = id + 'list';
  const optId = (i) => id + 'opt' + i;

  const hits = useMemo(
    () => options.filter((o) => String(o.name).toLowerCase().indexOf(q.trim().toLowerCase()) !== -1),
    [options, q],
  );
  const active = hits.length ? ((cursor % hits.length) + hits.length) % hits.length : -1;
  const named = (v) => {
    const o = options.find((x) => x.id === v);
    return o ? o.name : v;
  };
  const toggle = (oid) => fire(onChange, value.indexOf(oid) !== -1 ? value.filter((x) => x !== oid) : value.concat([oid]));

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setCursor(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setCursor(active - 1);
    } else if (e.key === 'Enter') {
      // Enter toggles and leaves the list open, so a second add is one keystroke away.
      if (open && hits[active]) {
        e.preventDefault();
        toggle(hits[active].id);
      }
    } else if (e.key === 'Backspace') {
      if (q === '' && value.length) {
        e.preventDefault();
        fire(onChange, value.slice(0, -1));
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return h(
    'div',
    { className: cx('kape-combo', className), role: 'combobox', 'aria-expanded': open, 'aria-haspopup': 'listbox', 'aria-controls': listId, ...rest },
    h(
      'div',
      { className: 'kape-combo__field', onClick: () => setOpen(true) },
      value.map((v) =>
        h(
          'span',
          { key: v, className: 'kape-chip' },
          named(v),
          h(
            'button',
            {
              type: 'button',
              'aria-label': 'Remove ' + named(v),
              onClick: (e) => {
                e.stopPropagation();
                toggle(v);
              },
            },
            '✕',
          ),
        ),
      ),
      h('input', {
        value: q,
        placeholder,
        'aria-label': label,
        'aria-autocomplete': 'list',
        'aria-controls': listId,
        // Focus never leaves the field; the active option is named, not focused.
        'aria-activedescendant': open && active >= 0 ? optId(active) : undefined,
        onChange: (e) => {
          setQ(e.target.value);
          setOpen(true);
          setCursor(0);
        },
        onFocus: () => setOpen(true),
        onKeyDown,
      }),
    ),
    open
      ? h(
          'ul',
          { id: listId, className: 'kape-combo__list', role: 'listbox', 'aria-multiselectable': true },
          hits.map((o, i) =>
            h(
              'li',
              {
                key: o.id,
                id: optId(i),
                role: 'option',
                'aria-selected': value.indexOf(o.id) !== -1,
                className: i === active ? 'is-active' : undefined,
                // mousedown, not click: click would blur the input first and close the list.
                onMouseDown: (e) => {
                  e.preventDefault();
                  toggle(o.id);
                },
              },
              o.name,
              o.price == null ? null : h('small', null, '+' + money(o.price)),
            ),
          ),
        )
      : null,
  );`,
  },

  multi: {
    extra: ['onChange', 'label', "hint = 'Pick your branches'"],
    body: `  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const id = useId();
  const listId = id + 'list';
  const countId = id + 'count';

  const full = max != null && value.length >= max;
  // An option blocked by max stays in the list and goes aria-disabled. Removing it would
  // renumber the list under the reader.
  const blocked = (o) => !!o.closed || !!o.disabled || (full && value.indexOf(o.id) === -1);
  const at = options.length ? ((cursor % options.length) + options.length) % options.length : -1;
  const named = (v) => {
    const o = options.find((x) => x.id === v);
    return o ? o.name : v;
  };
  const toggle = (oid) => {
    const o = options.find((x) => x.id === oid);
    if (o && blocked(o)) return;
    fire(onChange, value.indexOf(oid) !== -1 ? value.filter((x) => x !== oid) : value.concat([oid]));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setCursor(at + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setCursor(at - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setCursor(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setCursor(options.length - 1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      // Toggling never closes: picking three branches is three keystrokes, not six.
      if (open && options[at]) toggle(options[at].id);
      else setOpen(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Backspace') {
      if (value.length) {
        e.preventDefault();
        fire(onChange, value.slice(0, -1));
      }
    }
  };

  const chips = summaryLabel
    ? [h('span', { key: 'summary', className: 'kape-chip' }, summaryLabel(value.length))]
    : value.map((v) =>
        h(
          'span',
          { key: v, className: 'kape-chip' },
          named(v),
          h(
            'button',
            {
              type: 'button',
              'aria-label': 'Remove ' + named(v),
              onClick: (e) => {
                e.stopPropagation();
                toggle(v);
              },
            },
            '✕',
          ),
        ),
      );

  return h(
    'div',
    {
      className: cx('kape-combo', className),
      role: 'combobox',
      'aria-expanded': open,
      'aria-haspopup': 'listbox',
      'aria-controls': listId,
      'aria-describedby': countId,
      ...rest,
    },
    h(
      'div',
      {
        className: 'kape-combo__field',
        tabIndex: 0,
        'aria-label': label,
        onKeyDown,
        onClick: () => setOpen(!open),
      },
      value.length ? chips : h('span', { className: 'kape-combo__hint' }, hint),
    ),
    open
      ? h(
          'ul',
          { id: listId, className: 'kape-combo__list', role: 'listbox', 'aria-multiselectable': true },
          options.map((o, i) =>
            h(
              'li',
              {
                key: o.id,
                role: 'option',
                'aria-selected': value.indexOf(o.id) !== -1,
                'aria-disabled': blocked(o) || undefined,
                className: i === at ? 'is-active' : undefined,
                onMouseDown: (e) => {
                  e.preventDefault();
                  toggle(o.id);
                },
              },
              o.name,
            ),
          ),
        )
      : null,
    // The count is announced after every toggle, which is the only feedback a reader gets
    // from a list that does not close.
    h('p', { id: countId, className: 'kape-sr', 'aria-live': 'polite' }, value.length + ' of ' + options.length + ' selected'),
  );`,
  },

  range: {
    extra: ['locale', "placeholder = 'Pick a range'", 'onCancel'],
    body: `  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ from, to });
  const [view, setView] = useState(() => startOfMonth(month || from || new Date()));
  const [at, setAt] = useState(() => new Date(from || month || new Date()));
  const days = useRef({});

  useEffect(() => {
    setDraft({ from, to });
  }, [from, to]);

  useEffect(() => {
    if (!open) return;
    const node = days.current[dayKey(at)];
    if (node) node.focus();
  }, [open, at]);

  const grid = monthDays(view);
  const pick = (d) => {
    // First Enter sets the start, the second sets the end. A click before the start
    // restarts the range rather than making a backwards one.
    setDraft((r) => (r.from && !r.to && d > r.from ? { from: r.from, to: d } : { from: d, to: null }));
  };
  const shift = (deltaDays, deltaMonths) => {
    const next = new Date(at);
    if (deltaMonths) next.setMonth(next.getMonth() + deltaMonths);
    if (deltaDays) next.setDate(next.getDate() + deltaDays);
    setAt(next);
    setView(startOfMonth(next));
  };
  const close = (apply) => {
    if (apply) fire(onApply, draft);
    else {
      setDraft({ from, to });
      fire(onCancel);
    }
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      shift(-1, 0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      shift(1, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      shift(-7, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      shift(7, 0);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      shift(0, -1);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      shift(0, 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(new Date(at));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(false);
    }
  };

  const today = dayKey(new Date());
  const a = draft.from ? draft.from.getTime() : null;
  const b = draft.to ? draft.to.getTime() : null;

  return h(
    'div',
    { className: cx('kape-range', className), ...rest },
    h(
      'button',
      {
        type: 'button',
        className: 'kape-range__trigger',
        'aria-expanded': open,
        onClick: () => setOpen(!open),
      },
      iconNode('stamp-card', 18),
      spanOf(draft.from, draft.to, locale) || placeholder,
    ),
    open
      ? h(
          'div',
          { className: 'kape-range__pop' },
          h(
            'ul',
            { className: 'kape-range__presets' },
            presets.map((p, i) =>
              h(
                'li',
                {
                  key: p.label === undefined ? i : p.label,
                  'aria-current': a === (p.from ? p.from.getTime() : null) && b === (p.to ? p.to.getTime() : null) ? 'true' : undefined,
                },
                h('button', { type: 'button', onClick: () => setDraft({ from: p.from, to: p.to }) }, p.label),
              ),
            ),
          ),
          h(
            'div',
            { className: 'kape-cal' },
            h(
              'header',
              null,
              h('button', { type: 'button', 'aria-label': 'Previous month', onClick: () => shift(0, -1) }, '‹'),
              monthLabel(view, locale),
              h('button', { type: 'button', 'aria-label': 'Next month', onClick: () => shift(0, 1) }, '›'),
            ),
            h(
              'div',
              { className: 'kape-cal__grid', onKeyDown },
              WEEKDAYS.map((w, i) => h('span', { key: 'w' + i, 'aria-hidden': 'true' }, w)),
              range(grid.blanks).map((i) => h('span', { key: 'b' + i, 'aria-hidden': 'true' })),
              grid.days.map((d) => {
                const t = d.getTime();
                const edge = t === a || t === b;
                return h(
                  'button',
                  {
                    key: t,
                    type: 'button',
                    // The visible text is a bare number, so the full date goes in the name.
                    'aria-label': dayLabel(d, locale),
                    'aria-current': dayKey(d) === today ? 'date' : undefined,
                    'aria-pressed': edge,
                    tabIndex: dayKey(d) === dayKey(at) ? 0 : -1,
                    className: cx(t === a && 'is-start', t === b && 'is-end', a && b && t > a && t < b && 'in-range'),
                    ref: (node) => {
                      days.current[dayKey(d)] = node;
                    },
                    onClick: () => {
                      setAt(d);
                      pick(d);
                    },
                  },
                  d.getDate(),
                );
              }),
            ),
          ),
          h(
            'footer',
            null,
            h('button', { type: 'button', className: 'kape-btn', onClick: () => close(false) }, 'Cancel'),
            h('button', { type: 'button', className: 'kape-btn kape-btn--ink', onClick: () => close(true) }, 'Apply'),
          ),
        )
      : null,
  );`,
  },

  cmdk: {
    extra: ['onOpenChange', 'onRun'],
    body: `  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const ref = useRef(null);
  const field = useRef(null);
  const opener = useRef(null);
  const id = useId();
  const listId = id + 'list';
  const optId = (i) => id + 'opt' + i;

  const hits = useMemo(
    () => commands.filter((c) => String(c.label).toLowerCase().indexOf(q.trim().toLowerCase()) !== -1),
    [commands, q],
  );
  const at = hits.length ? ((cursor % hits.length) + hits.length) % hits.length : -1;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === hotkey) {
        e.preventDefault();
        fire(onOpenChange, !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, hotkey, onOpenChange]);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof node.showModal !== 'function') return undefined;
    if (open && !node.open) {
      opener.current = document.activeElement;
      node.showModal();
      if (field.current) field.current.focus();
    }
    if (!open && node.open) {
      node.close();
      // Focus goes back to whatever opened the palette, not to the top of the page.
      if (opener.current && opener.current.focus) opener.current.focus();
    }
    return undefined;
  }, [open]);

  const run = (c) => {
    if (c && typeof c.run === 'function') c.run();
    fire(onRun, c);
    fire(onOpenChange, false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(at + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(at - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hits[at]) run(hits[at]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      fire(onOpenChange, false);
    }
  };

  let group = null;
  const list = [];
  hits.forEach((c, i) => {
    if (c.group && c.group !== group) {
      group = c.group;
      // A group heading is presentation: an option a reader could land on but not run
      // would be a dead end.
      list.push(h('li', { key: 'g' + c.group, className: 'kape-cmdk__group', role: 'presentation' }, c.group));
    }
    list.push(
      h(
        'li',
        {
          key: c.id === undefined ? i : c.id,
          id: optId(i),
          role: 'option',
          'aria-selected': i === at,
          onMouseDown: (e) => {
            e.preventDefault();
            run(c);
          },
        },
        c.label,
      ),
    );
  });

  return h(
    'dialog',
    {
      ref,
      className: cx('kape-cmdk', className),
      onCancel: (e) => {
        e.preventDefault();
        fire(onOpenChange, false);
      },
      ...rest,
    },
    h(
      'label',
      null,
      iconNode('grinder', 18),
      h('input', {
        ref: field,
        value: q,
        placeholder,
        'aria-label': placeholder,
        'aria-expanded': true,
        'aria-controls': listId,
        'aria-activedescendant': at >= 0 ? optId(at) : undefined,
        onChange: (e) => {
          setQ(e.target.value);
          setCursor(0);
        },
        onKeyDown,
      }),
      h('kbd', null, 'esc'),
    ),
    h('ul', { id: listId, role: 'listbox' }, list),
    h('p', { className: 'kape-sr', 'aria-live': 'polite' }, hits.length + ' results'),
  );`,
  },

  drawer: {
    extra: ['children', 'footer', 'total'],
    native: { Escape: 'a native modal dialog closes on Escape and cycles Tab inside' },
    body: `  const ref = useRef(null);
  const closer = useRef(null);
  const opener = useRef(null);
  const id = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof node.showModal !== 'function') return undefined;
    if (open && !node.open) {
      opener.current = document.activeElement;
      node.showModal();
      if (closer.current) closer.current.focus();
    }
    if (!open && node.open) {
      node.close();
      if (opener.current && opener.current.focus) opener.current.focus();
    }
    return undefined;
  }, [open]);

  // side is an attribute, not a class: kapehan.css only draws the right-hand drawer, and
  // a kape-drawer--left would be a class the stylesheet does not define.
  return h(
    'dialog',
    {
      ref,
      className: cx('kape-drawer', className),
      'data-side': side,
      'aria-labelledby': id,
      onCancel: (e) => {
        e.preventDefault();
        fire(onClose);
      },
      ...rest,
    },
    h(
      'header',
      null,
      h('span', { id }, title),
      h('button', { type: 'button', ref: closer, 'aria-label': 'Close', onClick: () => fire(onClose) }, '✕'),
    ),
    h(
      'div',
      { className: 'kape-drawer__body' },
      lines.map((l, i) =>
        h(
          'div',
          { key: l.id === undefined ? i : l.id, className: 'kape-line' },
          h('span', null, l.qty ? l.qty + ' × ' + l.name : l.name),
          h('span', { className: 'num' }, l.total),
        ),
      ),
      total == null
        ? null
        : h(
            'div',
            { className: 'kape-line kape-line--total' },
            h('span', null, 'Total'),
            h('span', { className: 'num' }, total),
          ),
      children,
    ),
    // The footer actions are the last two stops, destructive last.
    footer ? h('footer', null, footer) : null,
  );`,
  },
};

const PRELUDE = `import { createElement, Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { KapeIcon } from './icons.js';

const h = createElement;

const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Handlers are optional everywhere, so calling one is always guarded. */
const fire = (fn, ...args) => {
  if (typeof fn === 'function') fn(...args);
};

const range = (n) => Array.from({ length: Math.max(0, Math.floor(n) || 0) }, (_, i) => i);

/**
 * The caller's leftover props, for a component that renders a list of siblings.
 *
 * A Fragment takes no props of its own, so a spread inside the map lands on every item:
 * <KapeRow id="menu" items={three} /> emitted three elements carrying id="menu". That is
 * invalid HTML, getElementById returns an arbitrary one of them and an aria-labelledby
 * pointing at it is ambiguous. Props that name a single element go on the first sibling
 * only; everything else (className, data-*, handlers) is per-item and still reaches all of
 * them. ref is on that list because React 19 passes it through as an ordinary prop.
 */
const ONCE = ['id', 'ref'];
const restFor = (first, rest) => {
  if (first) return rest;
  let out = rest;
  for (const k of ONCE) {
    if (out[k] === undefined) continue;
    if (out === rest) out = Object.assign({}, rest);
    delete out[k];
  }
  return out;
};

/** An icon prop is a Kapehan icon name or any node. Icons inside a component are decorative. */
const iconNode = (icon, size) =>
  typeof icon === 'string' ? h(KapeIcon, { name: icon, size, label: null }) : icon === undefined ? null : icon;

const money = (v) => (v == null ? null : '₱' + v);

const titleCase = (s) => String(s).replace(/[-_]/g, ' ').replace(/^./, (m) => m.toUpperCase());

const isNumeric = (rows, k) => rows.length > 0 && typeof rows[0][k] === 'number';

const extOf = (filename) => String(filename || '').split('.').pop();

const accepted = (filename, accept) => {
  const list = String(accept || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length) return true;
  const name = String(filename || '').toLowerCase();
  return list.some((x) => (x.charAt(0) === '.' ? name.endsWith(x) : name.indexOf(x.replace('/*', '')) !== -1));
};

const sizeHint = (accept, maxSize) => {
  const kinds = String(accept || '')
    .split(',')
    .map((x) => x.trim().replace(/^\\./, '').toUpperCase())
    .filter(Boolean)
    .join(' or ');
  const mb = Math.round((Number(maxSize) || 0) / 1048576);
  return [kinds, mb ? 'up to ' + mb + ' MB' : ''].filter(Boolean).join(', ');
};

const BTN = { primary: 'kape-btn--primary', ghost: 'kape-btn--ghost', ink: 'kape-btn--ink' };
const TAG = { accent: 'kape-tag--accent', ink: 'kape-tag--ink' };

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

const dayKey = (d) => d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();

/** The days of one month, plus the blanks before it. Monday first, like the canvas. */
const monthDays = (view) => {
  const first = startOfMonth(view);
  const blanks = (first.getDay() + 6) % 7;
  const last = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  return { blanks, days: range(last).map((i) => new Date(view.getFullYear(), view.getMonth(), i + 1)) };
};

const monthLabel = (d, locale) => d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

const dayLabel = (d, locale) => d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const spanOf = (from, to, locale) => {
  if (!from) return '';
  const short = { month: 'short', day: 'numeric' };
  if (!to) return from.toLocaleDateString(locale, short);
  return (
    from.toLocaleDateString(locale, short) +
    ' to ' +
    to.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  );
};
`;

function componentsSource(list) {
  const blocks = list.map((c) => {
    const spec = IMPL[c.key];
    if (!spec) throw new Error(`react: the manifest has "${c.key}" but scripts/generators/react.mjs has no implementation`);
    const alias = componentAlias(c);
    const head = docOf(c) + '\nexport function ' + componentName(c) + '(' + params(c, spec) + ') {\n' + spec.body + '\n}';
    return alias ? head + '\n\nexport { ' + componentName(c) + ' as ' + alias + ' };' : head;
  });

  return `/**
 * Kapehan components for React: ${list.length} components, one per manifest entry.
 *
 *   import { KapeButton, KapeCombo } from 'kapehan/react/components.js';
 *   import 'kapehan/kapehan.css';
 *
 * Plain ESM calling createElement, so there is no JSX and no build step. React is a peer
 * dependency and the only import besides the icons. Nothing touches a browser global at
 * module scope, so these render on a server.
 *
 * Class names come from kapehan.css and never fork per framework. Vue's modelValue is
 * React's value; every other prop keeps the name the props table gives it, and props the
 * table does not carry (onChange, children) are additions, never replacements.
 *
 * Each component is also exported under a second, readable name taken from its canvas
 * label, so KapeAcc is also KapeAccordion.
 *
 * GENERATED from kapehan-components.js by scripts/generators/react.mjs. Do not edit by
 * hand; edit the canvas and run \`npm run build\`.
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
${PRELUDE}
${blocks.join('\n\n')}
`;
}

const indexSource = (iconCount, componentCount) => `/**
 * Every Kapehan React export: ${iconCount} icons and ${componentCount} components.
 *
 *   import { KapeButton, Barako } from 'kapehan/react';
 *
 * Importing this pulls both halves. Reach for kapehan/react/icons.js on its own when a
 * project only wants icons.
 *
 * GENERATED by scripts/generators/react.mjs. Do not edit by hand.
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
export * from './icons.js';
export * from './components.js';
`;

export async function artifacts() {
  const list = components;
  return new Map([
    [ICONS_FILE, iconsSource()],
    [COMPONENTS_FILE, componentsSource(list)],
    [INDEX_FILE, indexSource(icons.length, list.length)],
  ]);
}

/* ----------------------------------------------------------------- the gates */

/** Key names the manifest states in prose, as KeyboardEvent.key values. */
const KEY_WORDS = [
  [/\bArrow Down\b/i, 'ArrowDown'],
  [/\bArrow Up\b/i, 'ArrowUp'],
  [/\bArrow Left\b/i, 'ArrowLeft'],
  [/\bArrow Right\b/i, 'ArrowRight'],
  [/\bPage Up\b/i, 'PageUp'],
  [/\bPage Down\b/i, 'PageDown'],
  [/\bEscape\b/, 'Escape'],
  [/\bEnter\b/, 'Enter'],
  [/\bBackspace\b/, 'Backspace'],
  [/\bHome\b/, 'Home'],
  [/\bEnd\b/, 'End'],
  [/\bF2\b/, 'F2'],
];

/**
 * Comments carry the a11y prose verbatim, which would satisfy every gate for free, so the
 * gates that read code read it with the comments taken out.
 *
 * This has to be a scanner and not a regex. The emitted upload helper contains the string
 * literal '/*', the MIME wildcard stripper. A regex sees that as the start of a block
 * comment and deletes everything up to the next close marker, 22 lines further down: the
 * BTN and TAG class maps sat in that hole, so five real class names (kape-btn--primary,
 * --ghost, --ink, kape-tag--accent, --ink) were never checked against kapehan.css and a
 * bogus one dropped in there was not caught. String literals are kept, because that is
 * where every class name lives; comments are dropped, newlines and all other spacing left
 * alone so line and offset arithmetic still lines up.
 */
function stripComments(src) {
  const out = [];
  // Whether a / starts a regex literal or is division depends on what came before it.
  const regexOk = (prev) => prev === '' || '(,=:[!&|?{};+-*%~^<>'.indexOf(prev) !== -1;
  let prev = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const d = src[i + 1];

    if (c === '/' && d === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && d === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') out.push('\n');
        i++;
      }
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      out.push(c);
      i++;
      while (i < src.length) {
        if (src[i] === '\\') {
          out.push(src.slice(i, i + 2));
          i += 2;
          continue;
        }
        out.push(src[i]);
        i++;
        if (src[i - 1] === c) break;
      }
      prev = c;
      continue;
    }
    if (c === '/' && regexOk(prev)) {
      out.push(c);
      i++;
      let inClass = false;
      while (i < src.length) {
        const r = src[i];
        if (r === '\\') {
          out.push(src.slice(i, i + 2));
          i += 2;
          continue;
        }
        out.push(r);
        i++;
        if (r === '\n') break;
        if (r === '[') inClass = true;
        else if (r === ']') inClass = false;
        else if (r === '/' && !inClass) break;
      }
      prev = '/';
      continue;
    }

    out.push(c);
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out.join('');
}

/** The body of one exported component, for the gates that read code rather than files. */
function sliceOf(src, fn) {
  const start = src.indexOf('export function ' + fn + '(');
  if (start === -1) return null;
  const next = src.indexOf('\nexport ', start + 1);
  return src.slice(start, next === -1 ? src.length : next);
}

/**
 * Evaluate both modules in node, against a React stub, with no react installed.
 *
 * A data: URL is a real module: it is parsed and its module scope runs. Rewriting the two
 * bare 'react' specifiers to a stub means this gate needs no dependency and still fails
 * the way a server would if anything reached for HTMLElement, window or document at import
 * time. Calling every component afterwards runs the render path once, which is where a
 * typo in a prop name or a missing default actually shows up.
 */
const STUB = `
let id = 0;
export const createElement = (type, props, ...children) => ({ type, props, children });
export const Fragment = Symbol('Fragment');
export const useState = (v) => [typeof v === 'function' ? v() : v, () => {}];
export const useRef = (v) => ({ current: v === undefined ? null : v });
export const useEffect = () => {};
export const useLayoutEffect = () => {};
export const useMemo = (f) => f();
export const useCallback = (f) => f;
export const useId = () => 'kid' + ++id;
export default { createElement, Fragment };
`;

const dataUrl = (src) => 'data:text/javascript;base64,' + Buffer.from(src, 'utf8').toString('base64');

async function evaluate(iconsSrc, componentsSrc) {
  const stub = dataUrl(STUB);
  const iconsUrl = dataUrl(iconsSrc.replace("from 'react'", "from '" + stub + "'"));
  const componentsUrl = dataUrl(
    componentsSrc.replace("from 'react'", "from '" + stub + "'").replace("from './icons.js'", "from '" + iconsUrl + "'"),
  );
  return { icons: await import(iconsUrl), components: await import(componentsUrl) };
}

export async function check(ctx) {
  const fail = [];
  const files = ctx && ctx.expected ? ctx.expected : await artifacts();
  const iconsSrc = files.get(ICONS_FILE);
  const componentsSrc = files.get(COMPONENTS_FILE);
  const indexSrc = files.get(INDEX_FILE);
  if (!iconsSrc || !componentsSrc || !indexSrc) return ['react: the generator did not produce its three files'];

  // 1. The stylesheet never forks per framework. Every kape- token in the emitted code,
  //    comments removed, has to be a class kapehan.css actually defines; a React-only
  //    class renders unstyled and looks perfectly fine in a diff.
  const cssText = await readFile(join(root, 'kapehan.css'), 'utf8');
  const cssClasses = new Set((cssText.match(/\.kape-[a-z0-9_-]+/g) || []).map((x) => x.slice(1)));
  for (const [file, src] of [[ICONS_FILE, iconsSrc], [COMPONENTS_FILE, componentsSrc]]) {
    for (const cls of new Set(stripComments(src).match(/kape-[a-z0-9_-]+/g) || [])) {
      if (!cssClasses.has(cls)) fail.push(`${file} uses .${cls}, which kapehan.css does not define`);
    }
  }

  const bare = stripComments(componentsSrc);

  for (const c of components) {
    const fn = componentName(c);
    const slice = sliceOf(bare, fn);
    if (!slice) {
      fail.push(`react: no component is exported for "${c.key}"`);
      continue;
    }
    const signature = slice.slice(0, slice.indexOf(') {') + 1);

    // 2. Every prop the canvas documents must be a prop the component takes, or the props
    //    table on the site describes something React silently ignores.
    for (const p of c.props) {
      const want = RENAME[p.name] || p.name;
      if (!new RegExp('[{,]\\s*' + want + '\\b').test(signature)) {
        fail.push(`react: ${fn} does not accept "${p.name}", which the props table documents`);
      }
    }

    // 3. Every key the a11y contract names must appear in the code, unless the browser
    //    already handles it on that element. A stubbed keyboard is the failure mode this
    //    exists for: the site would still promise Escape and Backspace.
    const native = (IMPL[c.key] && IMPL[c.key].native) || {};
    const prose = c.a11y.keys.join(' ');
    for (const [re, key] of KEY_WORDS) {
      if (!re.test(prose) || native[key]) continue;
      if (slice.indexOf("'" + key + "'") === -1) {
        fail.push(`react: ${fn} never handles ${key}, which its a11y contract promises`);
      }
    }
  }

  // 4. Nothing may be evaluated at import time that a server does not have, and every
  //    component must render once without throwing.
  let mods;
  try {
    mods = await evaluate(iconsSrc, componentsSrc);
  } catch (e) {
    return fail.concat([`react: the emitted modules cannot be imported outside a browser: ${e.message}`]);
  }

  for (const icon of icons) {
    if (typeof mods.icons[iconName(icon)] !== 'function') fail.push(`react: icons.js exports no component for "${icon.name}"`);
  }
  if (typeof mods.icons.KapeIcon !== 'function') fail.push('react: icons.js exports no KapeIcon');

  for (const c of components) {
    const fn = mods.components[componentName(c)];
    if (typeof fn !== 'function') {
      fail.push(`react: components.js exports no ${componentName(c)}`);
      continue;
    }
    try {
      fn({});
    } catch (e) {
      fail.push(`react: ${componentName(c)} throws when rendered with its documented defaults: ${e.message}`);
    }
  }

  // 5. A caller prop that names one element must land on one element. Components that
  //    render a list return a Fragment, which takes no props, and the spread inside the
  //    map used to stamp every sibling: <KapeRow id="menu"> emitted three id="menu".
  //    Rendering with real list data is the only way to see it, since a component called
  //    with no props renders an empty list and duplicates nothing.
  const PROBE = 'kape-probe-id';
  const sample = (c) => {
    const out = { id: PROBE };
    for (const p of c.props) {
      const t = String(p.type || '');
      if (!/\[\]|Array/.test(t)) continue;
      out[RENAME[p.name] || p.name] = /string\[\]/.test(t)
        ? ['One', 'Two', 'Three']
        : [1, 2, 3].map((n) => ({
            id: 'i' + n,
            name: 'Item ' + n,
            label: 'Item ' + n,
            initials: 'AB',
            q: 'Q' + n,
            a: 'A' + n,
            href: '/' + n,
            price: n,
            total: n,
            qty: n,
          }));
    }
    return out;
  };
  const probes = (node) => {
    if (Array.isArray(node)) return node.reduce((n, x) => n + probes(x), 0);
    if (!node || typeof node !== 'object') return 0;
    const here = node.props && node.props.id === PROBE ? 1 : 0;
    return (node.children || []).reduce((n, x) => n + probes(x), here);
  };

  for (const c of components) {
    const fn = mods.components[componentName(c)];
    if (typeof fn !== 'function') continue;
    let tree;
    try {
      tree = fn(sample(c));
    } catch (e) {
      fail.push(`react: ${componentName(c)} throws when rendered with a list of three items: ${e.message}`);
      continue;
    }
    const n = probes(tree);
    if (n > 1) fail.push(`react: ${componentName(c)} puts the caller's id on ${n} elements; an id names one element`);
  }

  // 6. index.js is the single import, so it must actually carry both halves.
  for (const half of ["export * from './icons.js';", "export * from './components.js';"]) {
    if (indexSrc.indexOf(half) === -1) fail.push(`react: index.js is missing ${half}`);
  }

  return fail;
}
