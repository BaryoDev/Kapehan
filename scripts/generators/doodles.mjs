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
 *
 * A third thing shapes the <style> both tracks carry. An SVG <style> is not scoped. Open
 * doodles/loading.svg on its own and that does not matter, but the idiom README.md teaches
 * for this repo's SVG assets, and the thing the canvas's Copy button exists for, is pasting
 * the file's contents inline into a page. Then every rule in it is a rule of the host
 * document. The canvas's reduced-motion block contains `* { transition-duration:.01ms }`,
 * so a pasted doodle used to kill every transition on the whole page for any reader with
 * prefers-reduced-motion set, and its @keyframes names used to overwrite the host's own
 * k-spin. So: every selector is scoped, to `kape-doodle` for the element and to the root's
 * own `svg.kape-doodle-<name>` class for a standalone file, and every keyframe name is
 * emitted under KEYFRAME_PREFIX. Nothing this package writes may name a host's node.
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
  // kape-doodle.js is imported for one side effect, customElements.define('kape-doodle').
  // It exports DOODLES and KapeDoodle as well, so a bundler told the package is side-effect
  // free will keep those two bindings if they are used and drop the define() call, and the
  // element silently never registers. package.json must name the file.
  sideEffects: ['./kape-doodle.js'],
};

/** Motion, in every form this repo can produce it. The still track must contain none. */
const MOTION_ELEMENTS = ['animate', 'animateTransform', 'animateMotion', 'set'];
const MOTION_PROPERTIES = /^(animation|transition|offset-path|offset-distance)/;

/**
 * What every @keyframes this package emits is called.
 *
 * A pasted standalone .svg puts its @keyframes in the host document, where the name is
 * global and unqualifiable: there is no scoping construct for one. `k-spin` is a name a
 * host page could plausibly have picked itself, and whichever definition came second wins.
 * A prefix is the only defence, so the emitted files say kape-k-spin and the canvas keeps
 * saying k-spin.
 */
const KEYFRAME_PREFIX = 'kape-';

/** The class the standalone files put on their root, so their own <style> can name it. */
const scopeClass = (doodleName) => `kape-doodle-${doodleName}`;

const readSource = () => readFile(join(root, SOURCE), 'utf8');

// ---------------------------------------------------------------------------
// Tag walking. Hand-written HTML, so a scanner over `<name ...>` is enough and
// does not need a DOM, but it has to parse what HTML allows rather than what
// the canvas happens to contain today: rewriteTags reserialises from what
// parseAttrs returned, so an attribute the parser cannot see is an attribute
// deleted from the output. It raises instead.
// ---------------------------------------------------------------------------

/**
 * Splits a start tag's attribute text into ordered [name, value] pairs, value null for a
 * valueless attribute.
 *
 * Handles the three quoting forms HTML allows, not just the double quotes the canvas uses
 * today. It used to match `name="value"` only, and since rewriteTags rebuilds the tag from
 * these pairs, one `fill='#3F2A1D'` (which plenty of editors and formatters emit) meant a
 * shape shipped with no fill at all, in both tracks, with every gate green.
 */
function parseAttrs(text, where = SOURCE) {
  const out = [];
  const n = text.length;
  let i = 0;
  while (i < n) {
    // A solidus between attributes is stray markup, not part of a name.
    while (i < n && /[\s/]/.test(text[i])) i++;
    if (i >= n) break;

    const name = /[^\s"'>/=]+/y;
    name.lastIndex = i;
    const m = name.exec(text);
    if (!m) throw new Error(`${where}: cannot read an attribute name at "${text.slice(i, i + 40)}"`);
    i = name.lastIndex;

    let j = i;
    while (j < n && /\s/.test(text[j])) j++;
    if (text[j] !== '=') { out.push([m[0], null]); continue; }

    j++;
    while (j < n && /\s/.test(text[j])) j++;
    const quote = text[j];
    if (quote === '"' || quote === "'") {
      const end = text.indexOf(quote, j + 1);
      if (end === -1) throw new Error(`${where}: attribute ${m[0]} has no closing ${quote}`);
      out.push([m[0], text.slice(j + 1, end)]);
      i = end + 1;
      continue;
    }
    const unquoted = /[^\s"'`<>=]+/y;
    unquoted.lastIndex = j;
    const u = unquoted.exec(text);
    if (!u) throw new Error(`${where}: attribute ${m[0]} has an = but no value`);
    out.push([m[0], u[0]]);
    i = unquoted.lastIndex;
  }
  return out;
}

/** Values keep their source bytes, so the quote has to move rather than the value. */
const quoteAttr = (v) =>
  !v.includes('"') ? `"${v}"` : !v.includes("'") ? `'${v}'` : `"${v.replace(/"/g, '&quot;')}"`;

const serializeAttrs = (pairs) =>
  pairs.map(([k, v]) => (v === null ? ` ${k}` : ` ${k}=${quoteAttr(v)}`)).join('');

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

// ---------------------------------------------------------------------------
// Keyframe references inside inline styles
// ---------------------------------------------------------------------------

/** Splits a CSS value on top-level commas, so `steps(1,end)` stays one token. */
function splitTopLevel(value) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) { out.push(value.slice(start, i)); start = i + 1; }
  }
  out.push(value.slice(start));
  return out;
}

/** Every top-level identifier in a CSS value, as [start, end, text]. Skips function args. */
function identRuns(value) {
  const runs = [];
  let depth = 0;
  let i = 0;
  while (i < value.length) {
    const ch = value[i];
    if (ch === '(') { depth++; i++; continue; }
    if (ch === ')') { depth--; i++; continue; }
    if (depth === 0 && /[A-Za-z_-]/.test(ch)) {
      let j = i;
      while (j < value.length && /[-\w]/.test(value[j])) j++;
      runs.push([i, j, value.slice(i, j)]);
      i = j;
      continue;
    }
    i++;
  }
  return runs;
}

const NOT_A_KEYFRAME = /^\s*(none|inherit|initial|unset|revert|revert-layer)\s*$/;

/**
 * Renames every @keyframes reference in an SVG's inline styles to its prefixed name, and
 * reports which ones it found.
 *
 * It matches identifiers against the names the canvas actually defines rather than taking
 * whatever word follows `animation:`. The shorthand is order-free: `animation:2.1s k-drip
 * ease-in infinite` is as valid as `animation:k-drip 2.1s ease-in infinite`, and reading
 * the first word used to yield no keyframe at all, so the standalone .svg shipped without
 * the @keyframes it referenced, animated nothing, and the gate that exists to catch exactly
 * that iterated over the same empty list and passed.
 *
 * A declaration that resolves to no name and is not `none` comes back in `unresolved`, so a
 * keyframe the canvas renamed out from under a drawing is a failure rather than a silent
 * still.
 */
function bindKeyframes(svg, names) {
  const used = new Set();
  const unresolved = [];

  const out = rewriteTags(svg, (tag, attrs) => {
    const at = attrs.findIndex(([k]) => k === 'style');
    if (at === -1 || attrs[at][1] === null) return attrs;

    let touched = false;
    const decls = parseStyle(attrs[at][1]).map(([prop, value]) => {
      if (prop !== 'animation' && prop !== 'animation-name') return [prop, value];
      touched = true;
      const parts = splitTopLevel(value).map((part) => {
        let rebuilt = '';
        let last = 0;
        let hit = false;
        for (const [start, end, ident] of identRuns(part)) {
          const to = names.get(ident);
          if (!to) continue;
          used.add(to);
          hit = true;
          rebuilt += part.slice(last, start) + to;
          last = end;
        }
        if (!hit && !NOT_A_KEYFRAME.test(part)) unresolved.push(`${prop}:${part.trim()}`);
        return rebuilt + part.slice(last);
      });
      return [prop, parts.join(',')];
    });

    if (!touched) return attrs;
    const copy = attrs.slice();
    copy[at] = ['style', serializeStyle(decls)];
    return copy;
  });

  return { svg: out, used: [...used].sort(), unresolved };
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
  const names = new Map();
  const rules = [];
  let reduced = null;

  for (const block of topLevelBlocks(css)) {
    const kf = /^@keyframes\s+([A-Za-z_][-\w]*)/.exec(block.prelude);
    if (kf) {
      names.set(kf[1], KEYFRAME_PREFIX + kf[1]);
      keyframes.set(KEYFRAME_PREFIX + kf[1], block.body.trim());
      continue;
    }
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
  return { keyframes, names, rules, reduced };
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

/**
 * Confines a selector from the canvas to one drawing.
 *
 * The canvas writes `svg [style*="animation"]`, meaning an animated node inside an svg, and
 * `*`, meaning the whole page. Both are true statements about the canvas, which owns its
 * document. Neither is a thing this package may say about somebody else's, in either track:
 * the element injects its CSS into the host document, and a standalone .svg pasted inline
 * has its <style> read as the host's.
 *
 * Where the leading compound is `svg`, that is the root the file already is, so the scope
 * replaces it. Everything else becomes a descendant of the scope.
 */
function scopeSelector(sel, scope) {
  return sel
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (!scope ? s : /^svg(?![-\w])/.test(s) ? scope + s.slice(3) : `${scope} ${s}`))
    .join(', ');
}

/** Re-emits the motion CSS, scoped under a selector. Unscoped only where nothing hosts it. */
function renderMotionCss({ rules, reduced }, names, keyframes, prefix = '') {
  const scope = (sel) => scopeSelector(sel, prefix);

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

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/**
 * HTML attribute text -> the string it stands for.
 *
 * parseAttrs returns the source bytes, which is what the drawing wants: a `d` or a `fill`
 * goes back out unchanged. Prose does not. `data-screen-label="Coffee &amp; donut"` is the
 * correct way to write an ampersand in HTML and means the four characters `Coffee & donut`,
 * but xmlEscape then escaped the escape and the emitted <title> read "Coffee &amp; donut"
 * out loud. So the two attributes that are prose, aria-label and data-screen-label, are
 * decoded on the way in and escaped once on the way out.
 *
 * An entity it does not know is an error rather than a passthrough, because a passthrough
 * is the double-escape again.
 */
function decodeEntities(text, where = SOURCE) {
  return text.replace(/&(#[0-9]+|#[xX][0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]*);/g, (whole, body) => {
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : Number(body.slice(1));
      if (!Number.isInteger(cp) || cp < 1 || cp > 0x10ffff) throw new Error(`${where}: ${whole} is not a character`);
      return String.fromCodePoint(cp);
    }
    const ch = NAMED_ENTITIES[body];
    if (ch === undefined) throw new Error(`${where}: ${whole} is an entity this generator cannot decode`);
    return ch;
  });
}

/**
 * An <svg> element's own start tag and everything inside it.
 *
 * The end of the start tag is found with findTagEnd, not indexOf('>'), because a `>` is
 * legal inside an attribute value and an aria-label is prose. Cutting at the first `>`
 * spliced the tail of that attribute into the drawing as visible text, in all 24 files,
 * with the gate green.
 */
function splitSvgRoot(raw, where = SOURCE) {
  const end = findTagEnd(raw, 0);
  const close = raw.lastIndexOf('</svg>');
  if (close === -1 || close < end) throw new Error(`${where}: an <svg> start tag has no </svg>`);
  return { open: raw.slice(0, end + 1), inner: raw.slice(end + 1, close) };
}

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
  const { names: keyframeNames } = motionCss(src);
  const out = [];

  // Walked with findTagEnd + parseAttrs rather than one `<figure[^>]*>` regex, for the same
  // reason the <svg> below is: a `>` inside data-screen-label is legal and would end the
  // match early, and the label is prose.
  const opens = /<figure\b/g;
  let m;
  while ((m = opens.exec(src))) {
    const tagEnd = findTagEnd(src, m.index);
    opens.lastIndex = tagEnd + 1;

    const figureAttrs = new Map(parseAttrs(src.slice(m.index + '<figure'.length, tagEnd)));
    const doodleName = figureAttrs.get('data-doodle');
    if (!doodleName) continue;
    const label = decodeEntities(figureAttrs.get('data-screen-label') || doodleName);

    const svgStart = src.indexOf('<svg', tagEnd);
    const figureEnd = skipElement(src, 'figure', tagEnd + 1);
    if (svgStart === -1 || svgStart > figureEnd) throw new Error(`${SOURCE}: ${doodleName} has no <svg>`);
    const svgEnd = skipElement(src, 'svg', findTagEnd(src, svgStart) + 1);
    const { open, inner } = splitSvgRoot(src.slice(svgStart, svgEnd));

    const attrs = new Map(parseAttrs(open.slice('<svg'.length, -1)));
    const viewBox = attrs.get('viewBox');
    const aria = attrs.get('aria-label');
    if (!viewBox) throw new Error(`${SOURCE}: ${doodleName} has no viewBox`);
    if (!aria) throw new Error(`${SOURCE}: ${doodleName} has no aria-label`);

    const { svg: coloured, moved } = tokeniseColours(inner, vars);
    const { svg: body, used, unresolved } = bindKeyframes(coloured, keyframeNames);

    const [, , w, h] = viewBox.trim().split(/\s+/).map(Number);
    out.push({
      name: doodleName,
      label,
      aria: decodeEntities(aria),
      viewBox: viewBox.trim(),
      width: w,
      height: h,
      body: dedent(body),
      still: dedent(stripMotion(body)),
      keyframes: used,
      unresolved,
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.viewBox}" width="${d.width}" height="${d.height}" role="img" class="${scopeClass(d.name)}" aria-label="${xmlEscape(d.aria)}">
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
    //
    // The scope is the root's own class, because this <style> is not scoped by the file
    // boundary: pasted inline, which is the idiom the README teaches, every rule in it is a
    // rule of the host document.
    const style = d.keyframes.length
      ? renderMotionCss(css, d.keyframes, css.keyframes, `svg.${scopeClass(d.name)}`)
      : '';
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

  // An animation declaration naming nothing the canvas defines animates nothing. It used to
  // be invisible: the name was read positionally, so a shorthand written duration-first
  // yielded no keyframe, and every gate below iterated over that empty list.
  for (const d of list) {
    for (const u of d.unresolved) {
      fail.push(`${d.name}: "${u}" names no @keyframes the canvas defines, so it animates nothing`);
    }
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

  // Nothing either track emits may name a node, or a keyframe, it does not own. A standalone
  // .svg pasted inline puts its whole <style> into the host document, so an unscoped rule
  // there is a rule about the host's page: the canvas's `*{transition-duration:.01ms}` under
  // prefers-reduced-motion killed every transition on it.
  //
  // The expected scope is written out here rather than built from scopeClass(), so that
  // changing the scoping in the generator fails this instead of moving with it.
  for (const d of list) {
    fail.push(...unscopedSelectors(files.get(`doodles/${d.name}.svg`) ?? '', `svg.kape-doodle-${d.name}`, `doodles/${d.name}.svg`));
  }
  fail.push(...unscopedSelectors(files.get('kape-doodle.js') ?? '', 'kape-doodle', 'kape-doodle.js'));

  // The keyframe binder, on input the canvas does not contain today. Order in the shorthand
  // is free, `steps(1,end)` holds a comma that is not an animation separator, and `none` is
  // a declaration that legitimately names no keyframe.
  const kfNames = new Map([['k-drip', 'kape-k-drip'], ['k-blink', 'kape-k-blink']]);
  const durationFirst = bindKeyframes('<g style="animation:2.1s k-drip ease-in infinite"></g>', kfNames);
  if (!durationFirst.used.includes('kape-k-drip')) fail.push('bindKeyframes() misses a duration-first animation shorthand');
  if (durationFirst.unresolved.length) fail.push('bindKeyframes() calls a duration-first shorthand unresolved');
  if (!durationFirst.svg.includes('animation:2.1s kape-k-drip ease-in infinite')) {
    fail.push('bindKeyframes() does not rename a duration-first shorthand in place');
  }
  const withFn = bindKeyframes('<g style="animation:k-blink 1.7s steps(1,end) infinite"></g>', kfNames);
  if (withFn.used.join() !== 'kape-k-blink' || withFn.unresolved.length) {
    fail.push('bindKeyframes() mis-splits a shorthand containing steps(1,end)');
  }
  if (bindKeyframes('<g style="animation:none"></g>', kfNames).unresolved.length) {
    fail.push('bindKeyframes() calls animation:none an unresolved keyframe');
  }
  if (!bindKeyframes('<g style="animation:k-nope 2s linear"></g>', kfNames).unresolved.length) {
    fail.push('bindKeyframes() lets an animation naming no keyframe through');
  }

  // rewriteTags reserialises every tag from what parseAttrs returned, so an attribute form
  // the parser cannot see is an attribute deleted from the drawing. All three HTML quoting
  // forms have to survive the round trip.
  const quoting = `<path d='M0 0' fill="#3F2A1D" data-flag stroke=none></path>`;
  const pairs = parseAttrs(` d='M0 0' fill="#3F2A1D" data-flag stroke=none `, 'a test');
  const byName = new Map(pairs);
  if (byName.get('d') !== 'M0 0') fail.push('parseAttrs() cannot read a single-quoted attribute');
  if (byName.get('stroke') !== 'none') fail.push('parseAttrs() cannot read an unquoted attribute');
  if (!pairs.some(([k, v]) => k === 'data-flag' && v === null)) fail.push('parseAttrs() cannot read a valueless attribute');
  const round = rewriteTags(quoting, (tag, attrs) => attrs);
  for (const want of ['d="M0 0"', 'fill="#3F2A1D"', ' data-flag', 'stroke="none"']) {
    if (!round.includes(want)) fail.push(`a tag round trip loses ${want}`);
  }

  // A `>` is legal inside an attribute value, and an aria-label is prose. Cutting the start
  // tag at the first `>` spliced the tail of that attribute into the drawing as text.
  const tricky = '<svg viewBox="0 0 4 4" aria-label="a > b"><circle r="1"></circle></svg>';
  const split = splitSvgRoot(tricky, 'a test');
  if (split.inner !== '<circle r="1"></circle>') fail.push('splitSvgRoot() cuts the start tag at a > inside an attribute value');
  if (new Map(parseAttrs(split.open.slice('<svg'.length, -1), 'a test')).get('aria-label') !== 'a > b') {
    fail.push('splitSvgRoot() does not keep an attribute value containing >');
  }

  // A label written the correct way for HTML must be read back as the characters it stands
  // for, and escaped once, not twice.
  if (decodeEntities('Coffee &amp; donut', 'a test') !== 'Coffee & donut') fail.push('decodeEntities() does not decode &amp;');
  if (decodeEntities('&#39;s &#x3C;', 'a test') !== "'s <") fail.push('decodeEntities() does not decode a numeric entity');
  if (xmlEscape(decodeEntities('Coffee &amp; donut', 'a test')) !== 'Coffee &amp; donut') {
    fail.push('a label written with an entity comes out escaped twice');
  }

  // The canvas draws its motion in CSS and holds no SMIL at all today, so the code that
  // strips <animate> and friends would never run on real input and could rot unnoticed.
  // A gate that only ever sees input it already handles proves nothing, so it is given some.
  // The four properties are written out rather than read from MOTION_PROPERTIES, so that
  // dropping an alternative from that regex fails here instead of quietly matching less.
  const smil =
    `<g style="animation:k-bob 4s linear infinite;transition:opacity .3s ease;` +
    `offset-path:path('M0 0 L10 10');offset-distance:40%;fill:red">` +
    '<animate attributeName="r" to="9"/>' +
    '<circle r="2"><set attributeName="fill" to="#000"></set></circle>' +
    '<animateTransform type="rotate"></animateTransform>' +
    '<animateMotion path="M0 0"/></g>';
  const stripped = stripMotion(smil);
  for (const el of MOTION_ELEMENTS) {
    if (stripped.includes(`<${el}`)) fail.push(`stripMotion() leaves <${el}> behind`);
  }
  for (const prop of ['animation', 'transition', 'offset-path', 'offset-distance']) {
    if (new RegExp(`(?:^|[;"])${prop}\\s*:`).test(stripped)) fail.push(`stripMotion() leaves ${prop} behind, so the still track is not still`);
  }
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
    for (const m of body.matchAll(/(?:^|[;"{\s])(animation|transition|offset-path|offset-distance)(?:-[a-z-]+)?\s*:/g)) {
      fail.push(`${path} still declares ${m[1]}, so it is not a still`);
    }
    if (body.includes('@keyframes')) fail.push(`${path} carries @keyframes, which a still has no use for`);
  }

  return fail;
}

/**
 * Every rule in an emitted file's CSS that could match, or rename, something the host owns.
 *
 * Reads the CSS out of the bytes that ship rather than out of renderMotionCss(), because a
 * scoping promise is only kept by the file. @keyframes are checked by name: there is no way
 * to scope one, so the only defence is a prefix nobody else would pick.
 */
function unscopedSelectors(text, scope, where) {
  const fail = [];
  let css;
  if (where.endsWith('.js')) {
    // The element carries its CSS as one JSON string literal, on one line.
    const at = text.indexOf('const CSS = ');
    if (at === -1) return [`${where} declares no CSS, so <kape-doodle> would not animate`];
    try {
      css = JSON.parse(text.slice(at + 'const CSS = '.length, text.indexOf(';\n', at)));
    } catch (e) {
      return [`${where}: cannot read the CSS literal back: ${e.message}`];
    }
  } else {
    // A doodle drawn without motion carries no <style> at all, and has nothing to scope.
    const at = text.indexOf('<style>');
    if (at === -1) return [];
    css = text.slice(at + '<style>'.length, text.indexOf('</style>', at));
  }

  const walk = (blocks) => {
    for (const b of blocks) {
      const kf = /^@keyframes\s+([-\w]+)/.exec(b.prelude);
      if (kf) {
        if (!kf[1].startsWith('kape-')) fail.push(`${where} defines @keyframes ${kf[1]}, a global name the host page may already use`);
        continue;
      }
      if (/^@media/.test(b.prelude)) { walk(topLevelBlocks(b.body)); continue; }
      for (const sel of b.prelude.split(',').map((s) => s.trim()).filter(Boolean)) {
        if (!sel.startsWith(scope)) fail.push(`${where} has the unscoped rule "${sel}", which matches nodes on the host page`);
      }
    }
  };
  walk(topLevelBlocks(css));
  return fail;
}
