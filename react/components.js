/**
 * Kapehan components for React: 30 components, one per manifest entry.
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
 * hand; edit the canvas and run `npm run build`.
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
import { createElement, Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
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
    .map((x) => x.trim().replace(/^\./, '').toUpperCase())
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

/**
 * Button — Actions.
 *
 * roles: Native button element, no role override needed
 * attrs: disabled
 * attrs: aria-busy on a submitting button
 * attrs: aria-label when the button is icon-only
 * keys:  Enter or Space activates
 * keys:  Tab moves in and out
 */
export function KapeButton({ label = 'Order now', variant = 'default', icon = null, disabled = false, onClick, children, busy = false, size, className, ...rest }) {
  const body = children === undefined ? label : children;
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
  );
}

/**
 * Chips — Actions.
 *
 * roles: Each chip is a button; the group needs no role
 * attrs: aria-pressed reflects selection on every chip, not just the selected one
 * keys:  Tab steps through chips
 * keys:  Enter or Space presses one
 */
export function KapeChip({ options = [], value, onChange, className, ...rest }) {
  // aria-pressed goes on every chip, not only the pressed one, or the unpressed ones
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
  );
}

export { KapeChip as KapeChips };

/**
 * Input — Forms.
 *
 * roles: Wrapping label makes the icon and field one hit target
 * attrs: A visible label or aria-label is required
 * attrs: aria-describedby for hint or error text
 * keys:  Tab focuses the field; the wrapper takes the focus ring via :focus-within
 */
export function KapeInput({ value = '', placeholder = 'Search the menu', icon = 'grinder', type = 'search', onChange, label, describedBy, className, ...rest }) {
  return h(
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
  );
}

/**
 * Segmented — Actions.
 *
 * roles: role="group" on the wrapper with an aria-label naming the choice
 * attrs: aria-pressed on each segment
 * keys:  Tab into the group, Enter or Space to pick
 * keys:  Arrow keys are not bound; segments are buttons, not a radiogroup
 */
export function KapeSeg({ options = [], value, onChange, label, className, ...rest }) {
  return h(
    'div',
    { className: cx('kape-seg', className), role: 'group', 'aria-label': label, ...rest },
    options.map((opt) =>
      h(
        'button',
        { key: opt, type: 'button', 'aria-pressed': value === opt, onClick: () => fire(onChange, opt) },
        opt,
      ),
    ),
  );
}

export { KapeSeg as KapeSegmented };

/**
 * Toast — Feedback.
 *
 * roles: role="status" for info, role="alert" for warn
 * attrs: aria-live is implied by the role; never set both
 * attrs: The action must be reachable before auto-dismiss, so warn toasts do not time out
 * keys:  Tab reaches the action while the toast is mounted
 */
export function KapeToast({ message, tone = 'info', actionLabel = null, timeout = 6000, onAction, onDismiss, icon = 'coffee-cup', className, ...rest }) {
  const warn = tone === 'warn';
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
  );
}

/**
 * Stamp card — Feedback.
 *
 * roles: The card is a group; each slot is a span, never a button — the user does not punch it
 * attrs: role="group" with aria-label naming the reward
 * attrs: aria-hidden on every slot, plus one visually hidden sentence carrying the real count
 * attrs: data-on marks a filled slot for CSS; do not rely on colour alone, filled slots also carry the bean glyph
 * keys:  Not focusable; it is a readout, not a control
 */
export function KapeStamps({ total = 10, filled = 0, label = 'Loyalty card', icon = 'coffee-bean', className, ...rest }) {
  const slots = Math.max(0, Math.floor(Number(total) || 0));
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
  );
}

export { KapeStamps as KapeStampCard };

/**
 * Menu row — Data.
 *
 * roles: A plain row is not interactive; wrap it in a button or anchor when it navigates
 * attrs: The price must stay in the same reading order as the name
 * attrs: Decorative drink art gets aria-hidden
 * keys:  Only interactive rows take focus; do not put tabindex on a static row
 */
export function KapeRow({ items = [], onPick, badge = null, className, ...rest }) {
  return h(
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
  );
}

export { KapeRow as KapeMenuRow };

/**
 * Stepper — Forms.
 *
 * roles: Two buttons around a native output element
 * attrs: aria-label on each button (Fewer, More), never a bare minus sign
 * attrs: aria-live="polite" on the output so screen readers hear the new count
 * keys:  Enter or Space on either button
 * keys:  Arrow Up and Arrow Down step while the group has focus
 */
export function KapeStepper({ value = 1, min = 1, max = 99, onChange, label, className, ...rest }) {
  const set = (next) => {
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
  );
}

/**
 * Switch — Actions.
 *
 * roles: A native checkbox inside a label; role="switch" is optional and only if you also manage aria-checked
 * attrs: The label text must be adjacent, not a title attribute
 * keys:  Space toggles
 * keys:  Tab focuses the input, which is visually hidden but not display:none
 */
export function KapeSwitch({ value = false, label, disabled = false, onChange, className, ...rest }) {
  // The label element is the track, so the visible text lives beside the component and
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
  );
}

/**
 * Checkbox · Radio — Forms.
 *
 * roles: Native inputs inside labels; wrap a radio set in a fieldset with a legend
 * attrs: name must match across a radio group
 * attrs: aria-describedby for a helper line under the set
 * keys:  Radio: arrow keys move and select within the group
 * keys:  Checkbox: Space toggles, Tab moves
 */
export function KapeCheck({ options = [], value, mode = 'radio', name, onChange, legend, describedBy, className, ...rest }) {
  const auto = useId();
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
  return legend ? h('fieldset', rest, h('legend', null, legend), set) : h(Fragment, null, set);
}

export { KapeCheck as KapeCheckboxRadio };

/**
 * Select — Forms.
 *
 * roles: Native select; do not rebuild it unless you need a combobox
 * attrs: A label element wrapping or bound by for/id
 * attrs: aria-invalid on a failed submit
 * keys:  Native: arrows open and move, Enter commits, Escape reverts
 */
export function KapeSelect({ options = [], value, label, onChange, invalid = false, className, ...rest }) {
  return h(
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
  );
}

/**
 * Tabs — Navigation.
 *
 * roles: role="tablist" on the wrapper, role="tab" on each button, role="tabpanel" on the panel
 * attrs: aria-selected on every tab
 * attrs: aria-controls pointing at the panel id, and aria-labelledby back on the panel
 * attrs: tabindex="-1" on unselected tabs so the set is one tab stop
 * keys:  Arrow Left and Arrow Right move selection
 * keys:  Home and End jump to the first and last tab
 */
export function KapeTabs({ tabs = [], value, onChange, label, panelId, className, ...rest }) {
  const stops = useRef([]);
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
  );
}

/**
 * Card — Data.
 *
 * roles: article for a standalone card
 * attrs: The title should be a heading when cards are a list of products
 * attrs: Drink art is decorative: aria-hidden
 * keys:  Only the Add button takes focus; the whole card is not clickable
 */
export function KapeCard({ item = {}, onAdd, size = 64, addLabel = 'Add', className, ...rest }) {
  const sub = [item.size, item.temp].filter(Boolean).join(' · ');
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
  );
}

/**
 * Badge — Data.
 *
 * roles: Plain span; a badge is not a status region
 * attrs: When the badge is the only carrier of state (Sold out), repeat it in the row text or add a visually hidden phrase
 * keys:  Not focusable
 */
export function KapeTag({ label, tone = 'default', children, className, ...rest }) {
  return h(
    'span',
    { className: cx('kape-tag', TAG[tone], className), ...rest },
    children === undefined ? label : children,
  );
}

export { KapeTag as KapeBadge };

/**
 * Avatar — Navigation.
 *
 * roles: Decorative group; the names must also appear as text nearby
 * attrs: aria-hidden on the stack when the same names are listed in the row
 * attrs: The overflow chip needs a real label, e.g. 3 more
 * keys:  Not focusable unless each avatar links to a profile
 */
export function KapeAvatar({ people = [], max = 2, accentIndex = null, className, ...rest }) {
  const shown = people.slice(0, Math.max(0, max));
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
  );
}

/**
 * Dialog — Feedback.
 *
 * roles: Native dialog element gives role="dialog" and aria-modal for free
 * attrs: aria-labelledby pointing at the heading
 * attrs: Focus must land on the least destructive action, not the confirm
 * keys:  Escape closes (native)
 * keys:  Tab is trapped inside while modal (native)
 */
export function KapeDialog({ open = false, title, body, confirmLabel = 'Confirm', onConfirm, onClose, cancelLabel = 'Keep it', children, className, ...rest }) {
  const ref = useRef(null);
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
  );
}

/**
 * Tooltip — Navigation.
 *
 * roles: The tip is CSS-only, so the text must also be reachable
 * attrs: Mirror the tip into aria-describedby or a title-free aria-label
 * attrs: Never put essential information only in the tooltip
 * keys:  Shows on :focus-visible as well as hover, so keyboard users get it
 * keys:  Escape does not dismiss a CSS tooltip; keep tips non-blocking
 */
export function KapeTip({ text, placement = 'top', children, className, ...rest }) {
  const id = useId();
  // The bubble is CSS content, which no screen reader reaches, so the same words are also
  // rendered as visually hidden text. placement is an attribute, not a class: the
  // stylesheet only draws the bubble above, and inventing kape-tip--bottom would be a
  // class kapehan.css does not have.
  return h(
    'span',
    { className: cx('kape-tip', className), 'data-tip': text, 'data-placement': placement, 'aria-describedby': id, ...rest },
    children,
    h('span', { id, className: 'kape-sr' }, text),
  );
}

export { KapeTip as KapeTooltip };

/**
 * Skeleton — Data.
 *
 * roles: The loading region needs aria-busy on the container, not on each bar
 * attrs: aria-busy="true" while skeletons show
 * attrs: A visually hidden Loading orders line so the wait is announced once
 * keys:  Skeletons are never focusable; keep tab order stable when they swap out
 */
export function KapeSkeleton({ lines = 3, width = '60%', loading = true, children, label = 'Loading', className, ...rest }) {
  if (!loading) return h(Fragment, null, children === undefined ? null : children);
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
  );
}

/**
 * Progress — Feedback.
 *
 * roles: role="progressbar"
 * attrs: aria-valuenow, and aria-valuemin/max when they are not 0 and 100
 * attrs: aria-label or aria-labelledby naming the task
 * keys:  Not focusable; it reports, it does not accept input
 */
export function KapeProgress({ value = 0, label, className, ...rest }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
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
  );
}

/**
 * Pagination — Navigation.
 *
 * roles: nav with an aria-label such as Menu pages
 * attrs: aria-current="page" on the active number
 * attrs: disabled on the arrows at the ends, not aria-disabled
 * keys:  Tab through the numbers
 * keys:  Enter or Space activates; arrow keys are left to the browser
 */
export function KapePager({ page = 1, pages = 1, onChange, label = 'Pages', className, ...rest }) {
  const go = (p) => {
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
  );
}

export { KapePager as KapePagination };

/**
 * Accordion — Data.
 *
 * roles: Native details and summary; no ARIA needed
 * attrs: Do not add role="button" to summary, the browser already exposes it
 * attrs: aria-expanded is managed by the open attribute
 * keys:  Enter or Space toggles a summary
 * keys:  Tab moves between summaries
 */
export function KapeAcc({ items = [], openFirst = false, className, ...rest }) {
  // details/summary, so open state, aria-expanded and the keyboard are the browser's.
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
  );
}

export { KapeAcc as KapeAccordion };

/**
 * Table — Data.
 *
 * roles: Real table, thead, th; never divs with role="table" unless you also wire every role
 * attrs: A caption element, or aria-label on the table
 * attrs: scope="col" on header cells
 * keys:  Table content is read in DOM order; keep the money column last in both markup and layout
 */
export function KapeTable({ rows = [], caption, numericColumns = [], columns, className, ...rest }) {
  const keys = columns || (rows.length ? Object.keys(rows[0]).filter((k) => k !== 'id') : []);
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
  );
}

/**
 * Breadcrumb — Navigation.
 *
 * roles: nav wrapping an ordered list
 * attrs: aria-current="page" on the last item, which is text and not a link
 * attrs: The separator is CSS content, so it is never read out
 * keys:  Tab through the ancestor links only
 */
export function KapeCrumbs({ trail = [], label = 'Breadcrumb', className, ...rest }) {
  return h(
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
  );
}

export { KapeCrumbs as KapeBreadcrumb };

/**
 * File upload — Forms.
 *
 * roles: A label wrapping a real file input; the drop zone is not a button
 * attrs: The input stays in the DOM (hidden attribute, not display:none on a wrapper)
 * attrs: Each in-flight row needs its own progressbar with an aria-label naming the file
 * keys:  Tab focuses the input, Enter or Space opens the picker
 * keys:  Drag and drop is an enhancement, never the only path
 */
export function KapeUpload({ accept = '.csv,.xlsx', maxSize = 10485760, files = [], onFiles, onCancel, label = 'Drop the menu sheet here', hint, icon = 'coffee-sack', className, ...rest }) {
  const [over, setOver] = useState(false);
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
  );
}

export { KapeUpload as KapeFileUpload };

/**
 * Editable table — Data.
 *
 * roles: Real table; the edit affordance is a cell input, not a dialog
 * attrs: aria-live="polite" on a status line so a save is announced
 * attrs: The input inherits the column header via scope="col"; do not aria-label it with the value
 * keys:  Enter commits, Escape reverts and returns focus to the cell
 * keys:  F2 or double-click enters edit mode
 * keys:  Tab out commits, matching spreadsheet behaviour
 */
export function KapeEdit({ rows = [], editingId = null, onSave, columns = [], onEditingChange, field = 'price', caption, className, ...rest }) {
  const [own, setOwn] = useState(null);
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
  );
}

export { KapeEdit as KapeEditableTable };

/**
 * Combobox — Forms.
 *
 * roles: role="combobox" on the wrapper, role="listbox" on the popup, role="option" on each row
 * attrs: aria-expanded on the combobox
 * attrs: aria-multiselectable on the listbox and aria-selected on every option
 * attrs: aria-activedescendant on the input, pointing at the active option id — focus never leaves the input
 * attrs: aria-controls linking input to listbox
 * keys:  Arrow Down and Arrow Up move the active option
 * keys:  Enter toggles the active option and keeps the list open
 * keys:  Backspace on an empty field removes the last chip
 * keys:  Escape closes the list, Tab closes and moves on
 */
export function KapeCombo({ options = [], value = [], placeholder = 'Add…', onChange, label, className, ...rest }) {
  const [open, setOpen] = useState(false);
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
  );
}

export { KapeCombo as KapeCombobox };

/**
 * Multi-select — Forms.
 *
 * roles: Same combobox pattern as above, but the field is read-only: it lists chips and opens a listbox
 * attrs: aria-multiselectable on the listbox
 * attrs: aria-selected on every option, including unselected ones
 * attrs: aria-describedby pointing at the count line so the total is announced after each toggle
 * attrs: aria-disabled on options blocked by max, never removed from the list
 * keys:  Arrow keys move, Space or Enter toggles without closing
 * keys:  Escape closes, Home and End jump the list
 * keys:  Backspace removes the last chip when the field has focus
 */
export function KapeMulti({ options = [], value = [], max = null, summaryLabel, onChange, label, hint = 'Pick your branches', className, ...rest }) {
  const [open, setOpen] = useState(false);
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
  );
}

export { KapeMulti as KapeMultiSelect };

/**
 * Date range — Forms.
 *
 * roles: The grid is a group of buttons, one per day; the trigger is a button with aria-expanded
 * attrs: aria-label on each day button carrying the full date, since the visible text is just a number
 * attrs: aria-current="date" on today
 * attrs: aria-pressed on the two endpoints; in-range days are styling only
 * attrs: aria-current="true" on the active preset
 * keys:  Arrow keys move a day at a time, Page Up and Page Down a month
 * keys:  Enter picks the start, then the end; Escape reverts to the last applied range
 * keys:  Tab reaches presets, grid, then Cancel and Apply
 */
export function KapeRange({ from = null, to = null, month, presets = [], onApply, locale, placeholder = 'Pick a range', onCancel, className, ...rest }) {
  const [open, setOpen] = useState(false);
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
  );
}

export { KapeRange as KapeDateRange };

/**
 * Command palette — Overlays.
 *
 * roles: Native dialog for the shell, role="listbox" on the results, role="option" on each hit
 * attrs: aria-activedescendant on the input so focus stays in the field while the cursor moves
 * attrs: aria-expanded and aria-controls on the input
 * attrs: Group headings are presentation only: they must not be options
 * attrs: aria-live="polite" count of hits so an empty search is announced
 * keys:  Cmd K or Ctrl K opens and closes
 * keys:  Arrow Down and Arrow Up move the cursor, wrapping at the ends
 * keys:  Enter runs the active command, Escape closes and restores focus to the opener
 */
export function KapeCmdk({ commands = [], open = false, hotkey = 'k', placeholder = 'Type a command or search', onOpenChange, onRun, className, ...rest }) {
  const [q, setQ] = useState('');
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
  );
}

export { KapeCmdk as KapeCommandPalette };

/**
 * Drawer — Overlays.
 *
 * roles: Native dialog, so role="dialog" and aria-modal come free and the backdrop is real
 * attrs: aria-labelledby pointing at the header text
 * attrs: Focus moves to the close button on open and back to the opener on close
 * attrs: inert is unnecessary: showModal already blocks the page
 * keys:  Escape closes (native)
 * keys:  Tab cycles inside the drawer only (native)
 * keys:  The footer actions are the last two stops, in destructive-last order
 */
export function KapeDrawer({ open = false, title, lines = [], side = 'right', onClose, children, footer, total, className, ...rest }) {
  const ref = useRef(null);
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
  );
}
