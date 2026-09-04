/**
 * Extracts the 28 palettes from the design canvas into palettes.json.
 *
 * The canvas is the source of truth and this is the only thing that reads it, so nobody
 * retypes a hex. Same discipline as the icons: one source, generated output, and a drift
 * gate in npm test that fails if the committed file disagrees with what this produces.
 *
 * Called by scripts/build.mjs; not run directly.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CANVAS = 'design/Kapehan.dc.html';

/** The palette roles every component reads. */
const ROLES = ['paper', 'surface', 'ink', 'accent', 'pop', 'onAccent'];

/**
 * Walks a JS array-of-flat-objects literal and returns plain objects.
 *
 * Hand-written rather than a regex-to-JSON rewrite, because one palette is called
 * "Sago't gulaman". Its escaped apostrophe ends the string early for any regex naive
 * enough to treat quotes as delimiters, and the resulting JSON parse error points at a
 * character 40 lines away from the real cause.
 */
function parseObjectArray(src) {
  let i = 0;
  const out = [];

  const skip = () => { while (i < src.length && /[\s,]/.test(src[i])) i++; };

  const readString = () => {
    const quote = src[i++];
    let s = '';
    while (i < src.length) {
      const ch = src[i++];
      if (ch === '\\') { s += src[i++]; continue; }   // keep the escaped char, drop the slash
      if (ch === quote) return s;
      s += ch;
    }
    throw new Error('unterminated string in the palette literal');
  };

  if (src[i] !== '[') throw new Error('palette literal does not start with [');
  i++;

  while (true) {
    skip();
    if (src[i] === ']') break;
    if (src[i] !== '{') throw new Error(`expected an object at offset ${i}, found ${src[i]}`);
    i++;

    const obj = {};
    while (true) {
      skip();
      if (src[i] === '}') { i++; break; }
      const keyStart = i;
      while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) i++;
      const key = src.slice(keyStart, i);
      if (!key) throw new Error(`expected a property name at offset ${keyStart}`);
      skip();
      if (src[i] !== ':') throw new Error(`expected : after ${key}`);
      i++;
      skip();
      if (src[i] !== "'" && src[i] !== '"') throw new Error(`${key} is not a string, this parser only handles flat string palettes`);
      obj[key] = readString();
    }
    out.push(obj);
  }
  return out;
}

/**
 * Brace-matches a literal out of the canvas. Tracks string state, because the palette
 * entries contain quoted prose with braces and apostrophes in it.
 */
function extractLiteral(src, key, open, close) {
  const at = src.indexOf(key);
  if (at === -1) throw new Error(`${CANVAS} has no ${key}`);
  const start = src.indexOf(open, at);
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
  throw new Error(`${key} in ${CANVAS} never closes, the file is probably truncated`);
}

export async function palettes() {
  const src = await readFile(join(root, CANVAS), 'utf8');
  const parsed = parseObjectArray(extractLiteral(src, 'static PALETTES', '[', ']'));

  const seen = new Set();
  for (const p of parsed) {
    if (!p.key) throw new Error('a palette has no key');
    if (seen.has(p.key)) throw new Error(`two palettes share the key "${p.key}"`);
    seen.add(p.key);
    for (const role of ROLES) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(p[role] ?? '')) {
        throw new Error(`palette "${p.key}" has ${role}="${p[role]}", which is not a 6-digit hex`);
      }
    }
  }
  return parsed;
}

export const PALETTE_ROLES = ROLES;
