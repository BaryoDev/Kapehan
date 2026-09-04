/**
 * The 24 doodles: an animated SVG, a still SVG, and the <kape-doodle> element.
 *
 * Source of truth is design/Kapehan Doodles v2.dc.html. Nothing here is retyped from it:
 * the paths, the aria labels, the keyframes and the reduced-motion rule are all read out
 * of the canvas, so a redraw there is a rebuild here.
 *
 * Two things about that file shape everything below.
 *
 * 1. The motion is CSS, not SMIL. There is not one <animate> element in the canvas; every
 *    moving part carries `style="animation:k-steam 3.4s ...;animation-play-state:var(--anim,running)"`
 *    and the @keyframes live in the page's <style>, which a standalone .svg does not get.
 *    So the animated track has to carry its own <style>, built from the canvas's, holding
 *    only the keyframes that doodle actually uses.
 * 2. Colour is half tokenised already. The canvas writes the accent as
 *    `style="fill:var(--acc,#C2593A)"` because a presentation attribute cannot hold a var().
 *    Everything else is a bare `fill="#241A13"`. Tokenising those means moving the
 *    attribute into the style attribute, which is done here for the hexes the canvas
 *    itself names, and only those. See COLOURS.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { root } from '../registry.mjs';

export const name = 'doodles';

export const SOURCE = 'design/Kapehan Doodles v2.dc.html';

export const pkg = {
  exports: {
    './kape-doodle.js': './kape-doodle.js',
    './doodles/*': './doodles/*',
  },
  files: ['doodles', 'kape-doodle.js'],
};

/** Motion, in every form this repo can produce it. The still track must contain none. */
const MOTION_ELEMENTS = ['animate', 'animateTransform', 'animateMotion', 'set'];
const MOTION_PROPERTIES = /^(animation|transition|offset-path|offset-distance)/;

const readSource = () => readFile(join(root, SOURCE), 'utf8');

// ---------------------------------------------------------------------------
// Tag walking. The canvas is hand-written HTML with every attribute double
// quoted (verified: the only single quotes in the file are inside the trailing
// <script>), so a scanner over `<name ...>` is enough and does not need a DOM.
// ---------------------------------------------------------------------------

/** Splits a start tag's attribute text into ordered [name, value] pairs. */
function parseAttrs(text) {
  const out = [];
  const re = /([:A-Za-z_][-:.\w]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(text))) out.push([m[1], m[2]]);
  return out;
}

const serializeAttrs = (pairs) => pairs.map(([k, v]) => ` ${k}="${v}"`).join('');

/**
 * Rewrites every start tag through fn(tagName, attrs) -> attrs | null.
 * Returning null drops the element: the tag, and if it has a matching close tag, everything
 * up to it. That is how <animate> and friends leave the still track whether the canvas ever
 * writes them paired or self-closed.
 */
function rewriteTags(html, fn) {
  let out = '';
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) { out += html.slice(i); break; }
    out += html.slice(i, lt);

    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt);
      const stop = end === -1 ? html.length : end + 3;
      out += html.slice(lt, stop);
      i = stop;
      continue;
    }
    if (html[lt + 1] === '/' || html[lt + 1] === '!' || html[lt + 1] === '?') {
      const gt = html.indexOf('>', lt);
      const stop = gt === -1 ? html.length : gt + 1;
      out += html.slice(lt, stop);
      i = stop;
      continue;
    }

    const gt = findTagEnd(html, lt);
    const raw = html.slice(lt, gt + 1);
    const nameMatch = /^<([A-Za-z][-\w]*)/.exec(raw);
    if (!nameMatch) { out += raw; i = gt + 1; continue; }

    const tag = nameMatch[1];
    const selfClosing = /\/>$/.test(raw);
    const attrText = raw.slice(nameMatch[0].length, selfClosing ? -2 : -1);
    const next = fn(tag, parseAttrs(attrText));

    if (next === null) {
      i = selfClosing ? gt + 1 : skipElement(html, tag, gt + 1);
      continue;
    }
    out += `<${tag}${serializeAttrs(next)}${selfClosing ? '/>' : '>'}`;
    i = gt + 1;
  }
  return out;
}

/** End of a start tag, skipping `>` that sit inside a quoted attribute value. */
function findTagEnd(html, at) {
  let quote = null;
  for (let i = at; i < html.length; i++) {
    const ch = html[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '>') return i;
  }
  throw new Error(`${SOURCE}: a start tag at offset ${at} never closes`);
}

/** Position just past this element's matching close tag, counting nested same-name opens. */
function skipElement(html, tag, from) {
  const re = new RegExp(`<${tag}\\b|</${tag}\\s*>`, 'g');
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    if (m[0][1] === '/') { if (--depth === 0) return m.index + m[0].length; }
    else if (!/\/>$/.test(html.slice(m.index, findTagEnd(html, m.index) + 1))) depth++;
  }
  throw new Error(`${SOURCE}: <${tag}> at offset ${from} is never closed`);
}

// ---------------------------------------------------------------------------
// Inline style declarations
// ---------------------------------------------------------------------------

const parseStyle = (text) =>
  text
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const at = d.indexOf(':');
      return at === -1 ? [d, ''] : [d.slice(0, at).trim(), d.slice(at + 1).trim()];
    });

const serializeStyle = (decls) => decls.map(([k, v]) => `${k}:${v}`).join(';');

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

/**
 * hex -> variable name, harvested two ways from the canvas, never written down here.
 *
 * 1. The `var(--name,#hex)` fallbacks the drawings already carry.
 * 2. The canvas's own theme table. Its root element declares `--card:{{ cardBg }}`, and its
 *    renderVals() gives cardBg as `dark ? '#231911' : '#FFFDF9'`. Following that link names
 *    the light-theme hex of every token the canvas themes, which is the one baked into the
 *    drawings, and it is how #FFFDF9 is known to be the surface rather than a guess.
 *
 * If the canvas names a colour neither way, this does not invent a name for it. #F1E8DA
 * (the cream body), #A08F7D (the hatching), #C9B9A6 (the steam) and #3F2A1D (the dark
 * roast) stay literal, because deciding which palette token each of them is would be new
 * design data living in a generator instead of in the canvas.
 */
function colourVars(src) {
  const map = new Map();
  const add = (hex, varName, why) => {
    const key = hex.toUpperCase();
    if (map.has(key) && map.get(key) !== varName) {
      throw new Error(`${SOURCE}: ${key} is named both ${map.get(key)} and ${varName} (${why})`);
    }
    map.set(key, varName);
  };

  for (const m of src.matchAll(/var\(\s*(--[a-z-]+)\s*,\s*(#[0-9A-Fa-f]{3,8})\s*\)/g)) {
    add(m[2], m[1], 'var() fallback');
  }

  // --card:{{ cardBg }} on the root, so cardBg is the name of the --card value.
  const byKey = new Map(
    [...src.matchAll(/(--[a-z-]+)\s*:\s*\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g)].map((m) => [m[2], m[1]]),
  );
  // cardBg: dark ? '#231911' : '#FFFDF9'   and   acc: p.accent ?? '#C2593A'
  // The light branch is the one the drawings bake in, so it is the one taken as the fallback.
  const themed = /([A-Za-z_$][\w$]*)\s*:\s*(?:dark\s*\?\s*'#[0-9A-Fa-f]{3,8}'\s*:\s*)?(?:[^,\n']*\?\?\s*)?'(#[0-9A-Fa-f]{3,8})'/g;
  for (const m of src.matchAll(themed)) {
    const varName = byKey.get(m[1]);
    if (varName) add(m[2], varName, `renderVals ${m[1]}`);
  }

  if (!map.size) throw new Error(`${SOURCE}: no colour tokens found, the theme table has moved`);
  return map;
}

/**
 * Moves `fill="#241A13"` to `style="fill:var(--ink,#241A13)"`.
 *
 * A presentation attribute cannot hold a var(), so this is the only way to tokenise one.
 * It is a promotion in the cascade: an inline style beats a presentation attribute. That is
 * safe here because a child's own attribute still beats an inherited value from its parent,
 * so `<g stroke="#241A13"><path stroke="#F1E8DA">` keeps painting the path cream. What it
 * would not be safe to do is promote a property the element already declares in its style,
 * so that case is left alone.
 */
function tokeniseColours(svg, vars) {
  let moved = 0;
  const out = rewriteTags(svg, (tag, attrs) => {
    const style = parseStyle(attrs.find(([k]) => k === 'style')?.[1] ?? '');
    const declared = new Set(style.map(([k]) => k));
    const kept = [];
    const added = [];

    for (const [k, v] of attrs) {
      if (k === 'style') continue;
      const name = (k === 'fill' || k === 'stroke' || k === 'stop-color') && vars.get(v.toUpperCase());
      if (name && !declared.has(k)) { added.push([k, `var(${name},${v})`]); moved++; }
      else kept.push([k, v]);
    }
    if (!added.length) return attrs;

    const merged = serializeStyle([...added, ...style]);
    const at = kept.findIndex(([k]) => k === 'style');
    if (at === -1) kept.push(['style', merged]);
    else kept[at] = ['style', merged];
    return kept;
  });
  return { svg: out, moved };
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/** Drops the animation elements and the animation/transition declarations. Nothing else. */
function stripMotion(svg) {
  return rewriteTags(svg, (tag, attrs) => {
    if (MOTION_ELEMENTS.includes(tag)) return null;
    const at = attrs.findIndex(([k]) => k === 'style');
    if (at === -1) return attrs;
    const kept = parseStyle(attrs[at][1]).filter(([prop]) => !MOTION_PROPERTIES.test(prop));
    const out = attrs.slice();
    if (!kept.length) out.splice(at, 1);
    else out[at] = ['style', serializeStyle(kept)];
    return out;
  });
}

/** The @keyframes names an SVG's inline styles actually reference. */
function keyframesUsed(svg) {
  const used = new Set();
  for (const m of svg.matchAll(/animation:\s*([A-Za-z_][-\w]*)/g)) used.add(m[1]);
  return used;
}

/**
 * The canvas's motion CSS, split into pieces so the two consumers can re-emit it with
 * different scoping: a standalone .svg needs it unscoped, and <kape-doodle> injects it into
 * a host document where an unscoped `* { transition-duration:.01ms }` would be vandalism.
 */
function motionCss(src) {
  const open = src.indexOf('<style>');
  if (open === -1) throw new Error(`${SOURCE}: no <style> block to read the keyframes from`);
  const close = src.indexOf('</style>', open);
  if (close === -1) throw new Error(`${SOURCE}: the <style> block never closes`);
  const css = src.slice(open + '<style>'.length, close);

  const keyframes = new Map();
  const rules = [];
  let reduced = null;

  for (const block of topLevelBlocks(css)) {
    const kf = /^@keyframes\s+([A-Za-z_][-\w]*)/.exec(block.prelude);
    if (kf) { keyframes.set(kf[1], block.body.trim()); continue; }
    if (/^@media/.test(block.prelude)) {
      if (/prefers-reduced-motion/.test(block.prelude)) {
        reduced = { prelude: block.prelude, rules: topLevelBlocks(block.body) };
      }
      continue;
    }
    if (block.prelude.includes('[style*="animation"]')) rules.push(block);
  }

  if (!keyframes.size) throw new Error(`${SOURCE}: the <style> block declares no @keyframes`);
  if (!rules.length) throw new Error(`${SOURCE}: no transform-box rule for animated nodes`);
  if (!reduced) throw new Error(`${SOURCE}: no prefers-reduced-motion block to honour`);
  return { keyframes, rules, reduced };
}

/** Splits CSS into top-level `prelude { body }` blocks, brace-matched. */
function topLevelBlocks(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    let depth = 0;
    let end = -1;
    for (let j = open; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}' && --depth === 0) { end = j; break; }
    }
    if (end === -1) throw new Error('unbalanced braces in the canvas <style>');
    out.push({ prelude: css.slice(i, open).trim(), body: css.slice(open + 1, end) });
    i = end + 1;
  }
  return out;
}

/** Re-emits the motion CSS, optionally scoped under a prefix. */
function renderMotionCss({ rules, reduced }, names, keyframes, prefix = '') {
  const scope = (sel) =>
    sel
      .split(',')
      .map((s) => (prefix ? `${prefix} ${s.trim()}` : s.trim()))
      .join(', ');

  const lines = rules.map((r) => `${scope(r.prelude)}{${r.body.trim()}}`);
  for (const n of names) lines.push(`@keyframes ${n}{${keyframes.get(n)}}`);
  const inner = reduced.rules.map((r) => `  ${scope(r.prelude)}{${r.body.trim()}}`).join('\n');
  lines.push(`${reduced.prelude}{\n${inner}\n}`);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Reading the doodles out of the canvas
// ---------------------------------------------------------------------------

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const xmlEscape = (s) => s.replace(/[&<>"]/g, (c) => XML_ESCAPES[c]);

/**
 * Every `<figure data-doodle="...">` in the canvas, with its inline SVG.
 *
 * The count is not asserted here on purpose: the canvas is the source, so however many it
 * holds is however many ship. check() catches the case that matters, which is the file
 * being read but yielding nothing.
 */
export async function doodles() {
  const src = await readSource();
  const vars = colourVars(src);
  const out = [];

  const figure = /<figure\b[^>]*\bdata-doodle="([^"]+)"[^>]*>/g;
  let m;
  while ((m = figure.exec(src))) {
    const doodleName = m[1];
    const label = /\bdata-screen-label="([^"]*)"/.exec(m[0])?.[1] ?? doodleName;

    const svgStart = src.indexOf('<svg', m.index);
    const figureEnd = skipElement(src, 'figure', figure.lastIndex);
    if (svgStart === -1 || svgStart > figureEnd) throw new Error(`${SOURCE}: ${doodleName} has no <svg>`);
    const svgEnd = skipElement(src, 'svg', findTagEnd(src, svgStart) + 1);
    const raw = src.slice(svgStart, svgEnd);

    const attrs = new Map(parseAttrs(raw.slice(0, findTagEnd(raw, 0))));
    const viewBox = attrs.get('viewBox');
    const aria = attrs.get('aria-label');
    if (!viewBox) throw new Error(`${SOURCE}: ${doodleName} has no viewBox`);
    if (!aria) throw new Error(`${SOURCE}: ${doodleName} has no aria-label`);

    const inner = raw.slice(raw.indexOf('>', 0) + 1, raw.lastIndexOf('</svg>'));
    const { svg: body, moved } = tokeniseColours(inner, vars);

    const [, , w, h] = viewBox.trim().split(/\s+/).map(Number);
    out.push({
      name: doodleName,
      label,
      aria,
      viewBox: viewBox.trim(),
      width: w,
      height: h,
      body: dedent(body),
      still: dedent(stripMotion(body)),
      keyframes: [...keyframesUsed(body)].sort(),
      tokenised: moved,
    });
  }
  return out;
}

/** The canvas indents its SVG eight levels deep inside the page. Pull it back to two. */
function dedent(svg) {
  const lines = svg.replace(/^\n+|\s+$/g, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const base = Math.min(...indents);
  return lines.map((l) => (l.trim() ? '  ' + l.slice(base) : '')).join('\n');
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const CREDIT = 'MIT (c) BaryoDev. Generated from the Kapehan design canvas, do not edit by hand.';

function svgFile(d, styleBlock) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.viewBox}" width="${d.width}" height="${d.height}" role="img" aria-label="${xmlEscape(d.aria)}">
  <title>${xmlEscape(d.label)}</title>
  <desc>${CREDIT}</desc>
${styleBlock ? `  <style>\n${styleBlock.replace(/^/gm, '    ')}\n  </style>\n` : ''}${d.body}
</svg>
`;
}

function componentSource(data, css) {
  return `/**
 * <kape-doodle>: Kapehan doodles with no build step.
 *
 *   <script type="module" src="kape-doodle.js"></script>
 *   <kape-doodle name="loading"></kape-doodle>
 *   <kape-doodle name="not-found" size="240" still></kape-doodle>
 *
 * Attributes: name (doodle name), size (px width, default: fills its container), still
 * (boolean, holds the drawing on its first frame).
 *
 * Theming, all inherited from the page, nothing to configure here:
 *   --acc         the accent the coffee is painted in
 *   --ink         the contour colour
 *   --bg          the knockout colour used for lettering and highlights
 *   --hatch-op    how strong the shading hatch reads, 0 to 1
 *   --anim        running | paused, a global pause switch
 * A reader with prefers-reduced-motion gets the still drawing whatever the page says.
 *
 * GENERATED by scripts/build.mjs from design/Kapehan Doodles v2.dc.html. Do not edit by hand.
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
const DOODLES = ${data};

const INDEX = new Map(DOODLES.map((d) => [d.name, d]));

const SVG_NS = 'http://www.w3.org/2000/svg';
const STYLE_ID = 'kape-doodle-css';

// The keyframes are document level whichever way they are injected, so they go in once per
// document rather than once per doodle. Every other rule is scoped to the element, because
// the reduced-motion block the canvas ships contains a \`*\` rule, and a component has no
// business turning off transitions on somebody else's page.
const CSS = ${JSON.stringify(css)};

function installCss(doc) {
  if (!doc || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  (doc.head ?? doc.documentElement).append(style);
}

// Evaluated at import time, so a class extending HTMLElement would throw ReferenceError on a
// server. Anything server-rendering this package (Next, Nuxt, Astro, Remix) crashes on the
// import alone, before a browser is ever involved. DOODLES stays usable there; only the
// element is browser-only. kape-icon.js guards itself the same way, for the same reason.
const KapeDoodle = typeof HTMLElement === 'undefined' ? null : class KapeDoodle extends HTMLElement {
  static get observedAttributes() { return ['name', 'size', 'still']; }
  connectedCallback() { installCss(this.ownerDocument); this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const doodle = INDEX.get((this.getAttribute('name') || '').trim());
    if (!doodle) { this.replaceChildren(); return; }

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', doodle.viewBox);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', doodle.aria);

    // size comes from the host page and may be hostile. Concatenating it into an attribute
    // string lets size='240" onload="..."' break out of the tag, so it is coerced to a
    // number and every attribute is set on the node instead. Only build-time doodle data
    // reaches innerHTML.
    const n = Number(this.getAttribute('size'));
    if (Number.isFinite(n) && n > 0) {
      svg.setAttribute('width', n);
      svg.setAttribute('height', Math.round((n * doodle.height) / doodle.width));
    } else {
      svg.setAttribute('width', '100%');
    }
    svg.innerHTML = doodle.body;

    this.style.display = this.style.display || 'block';
    this.replaceChildren(svg);
  }
};

if (KapeDoodle && typeof customElements !== 'undefined' && !customElements.get('kape-doodle')) {
  customElements.define('kape-doodle', KapeDoodle);
}
export { DOODLES, KapeDoodle };
`;
}

export async function artifacts() {
  const src = await readSource();
  const css = motionCss(src);
  const list = await doodles();
  const out = new Map();

  for (const d of list) {
    // "notifications" is drawn without motion. Giving it a keyframe-less <style> would be a
    // block of CSS that animates nothing, so it gets none and its two tracks come out equal.
    const style = d.keyframes.length ? renderMotionCss(css, d.keyframes, css.keyframes) : '';
    out.set(`doodles/${d.name}.svg`, svgFile(d, style));
    out.set(`doodles/still/${d.name}.svg`, svgFile({ ...d, body: d.still }, ''));
  }

  // The element ships one body, the animated one, and holds it still with CSS rather than
  // carrying a second copy of all 24 drawings: the stripped bodies would near enough double
  // the file for a job a rule already does. doodles/still/*.svg is the genuinely stripped
  // track, for print and email, where no CSS runs at all.
  const all = [...new Set(list.flatMap((d) => d.keyframes))].sort();
  const styleText = [
    renderMotionCss(css, all, css.keyframes, 'kape-doodle'),
    `kape-doodle[still] [style*="animation"]{animation:none!important}`,
  ].join('\n');

  const data = JSON.stringify(
    list.map((d) => ({
      name: d.name,
      label: d.label,
      aria: d.aria,
      viewBox: d.viewBox,
      width: d.width,
      height: d.height,
      body: d.body,
    })),
  );
  out.set('kape-doodle.js', componentSource(data, styleText));
  return out;
}

export async function check(ctx) {
  const fail = [];
  const list = await doodles();

  if (!list.length) {
    fail.push(`${SOURCE} yielded no doodles, the figure markup has probably changed`);
    return fail;
  }

  const seen = new Set();
  for (const d of list) {
    if (seen.has(d.name)) fail.push(`two doodles are called "${d.name}"`);
    seen.add(d.name);
    if (!/^[a-z0-9-]+$/.test(d.name)) fail.push(`"${d.name}" is not a filename-safe doodle name`);
    if (!Number.isFinite(d.width) || !Number.isFinite(d.height)) fail.push(`${d.name}: viewBox "${d.viewBox}" is not four numbers`);
    if (d.aria.length < 12) fail.push(`${d.name}: aria-label "${d.aria}" says too little to replace the picture`);
    // The canvas is a template. A {{ placeholder }} that reaches an .svg renders as text.
    if (/\{\{|\}\}/.test(d.body)) fail.push(`${d.name}: an unresolved {{ placeholder }} leaked out of the canvas`);
  }

  // The whole point of the animated track being a standalone file: the page's @keyframes do
  // not come with it, so a keyframe referenced but not carried animates nothing, silently,
  // and only in the downloaded copy.
  const { keyframes } = motionCss(await readSource());
  const files = ctx?.expected ?? (await artifacts());
  for (const d of list) {
    for (const k of d.keyframes) {
      if (!keyframes.has(k)) fail.push(`${d.name} animates with @keyframes ${k}, which the canvas does not define`);
      const emitted = files.get(`doodles/${d.name}.svg`) ?? '';
      if (!emitted.includes(`@keyframes ${k}{`)) fail.push(`doodles/${d.name}.svg uses ${k} but does not carry its @keyframes`);
    }
  }

  // The canvas draws its motion in CSS and holds no SMIL at all today, so the code that
  // strips <animate> and friends would never run on real input and could rot unnoticed.
  // A gate that only ever sees input it already handles proves nothing, so it is given some.
  const smil =
    '<g style="animation:k-bob 4s linear infinite;fill:red">' +
    '<animate attributeName="r" to="9"/>' +
    '<circle r="2"><set attributeName="fill" to="#000"></set></circle>' +
    '<animateTransform type="rotate"></animateTransform>' +
    '<animateMotion path="M0 0"/></g>';
  const stripped = stripMotion(smil);
  for (const el of MOTION_ELEMENTS) {
    if (stripped.includes(`<${el}`)) fail.push(`stripMotion() leaves <${el}> behind`);
  }
  if (/animation\s*:/.test(stripped)) fail.push('stripMotion() leaves an animation declaration behind');
  if (!stripped.includes('<circle r="2">')) fail.push('stripMotion() drops drawing it should keep');
  if (!stripped.includes('fill:red')) fail.push('stripMotion() drops a declaration that is not motion');

  // The still track's one promise. Checked on the emitted bytes, not on the intermediate
  // strings, because what ships is the file.
  const stills = [...files].filter(([p]) => p.startsWith('doodles/still/'));
  if (stills.length !== list.length) fail.push(`${list.length} doodles but ${stills.length} still files`);
  for (const [path, body] of stills) {
    for (const el of MOTION_ELEMENTS) {
      if (new RegExp(`<${el}\\b`).test(body)) fail.push(`${path} still contains a <${el}> element`);
    }
    for (const m of body.matchAll(/(?:^|[;"{\s])(animation|transition)(?:-[a-z-]+)?\s*:/g)) {
      fail.push(`${path} still declares ${m[1]}, so it is not a still`);
    }
    if (body.includes('@keyframes')) fail.push(`${path} carries @keyframes, which a still has no use for`);
  }

  return fail;
}
