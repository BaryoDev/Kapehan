/**
 * Reading data out of design/Kapehan.dc.html.
 *
 * The canvas data is JSON-shaped but is not JSON: keys are unquoted identifiers, quoting is
 * mixed (`label: 'Button'` next to `cat: "Actions"`), and there are trailing commas.
 * JSON.parse fails on every one of the four constants.
 *
 * It is also not safe to eval. So it is parsed, by hand, once, here. Both extractors use
 * this rather than each carrying its own scanner.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CANVAS = 'design/Kapehan.dc.html';

export const readCanvas = () => readFile(join(root, CANVAS), 'utf8');

/**
 * Brace-matches a literal out of the canvas, tracking string state so that quoted prose
 * containing braces or apostrophes does not end the scan early. One palette is called
 * "Sago't gulaman"; naive matching stops inside it.
 */
export function extractLiteral(src, key, open, close) {
  const at = src.indexOf(key);
  if (at === -1) throw new Error(`${CANVAS} has no ${key}`);
  const start = src.indexOf(open, at);
  // Without this, a missing delimiter gives -1, the loop starts before the string and
  // scans from 0, and it can return an unrelated balanced literal from earlier in the
  // file rather than failing. A wrong literal that parses is worse than a crash.
  if (start === -1) throw new Error(`${key} in ${CANVAS} is not followed by ${open}`);
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

/** A cursor over a literal, so the two parsers below share their primitives. */
export function scanner(src) {
  let i = 0;

  const skip = () => {
    while (i < src.length) {
      if (/[\s,]/.test(src[i])) { i++; continue; }
      // the canvas carries // comments between entries
      if (src[i] === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      break;
    }
  };

  const readString = () => {
    const quote = src[i++];
    let out = '';
    while (i < src.length) {
      const ch = src[i++];
      if (ch === '\\') {
        const esc = src[i++];
        // The canvas writes <\/script> so the literal cannot close its own script tag,
        // and \n for real newlines inside the framework snippets.
        out += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc === 'r' ? '\r' : esc;
        continue;
      }
      if (ch === quote) return out;
      out += ch;
    }
    throw new Error('unterminated string');
  };

  /** Nested arrays and objects in the canvas ARE valid JSON, so hand them to JSON.parse. */
  const readJson = () => {
    const open = src[i];
    const close = open === '[' ? ']' : '}';
    const start = i;
    let depth = 0;
    let quote = null;
    let escaped = false;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === open) depth++;
      else if (ch === close && --depth === 0) { i++; break; }
    }
    const raw = src.slice(start, i);
    try {
      return JSON.parse(raw);
    } catch (e) {
      throw new Error(`nested value is not valid JSON: ${e.message}`);
    }
  };

  const readValue = () => {
    skip();
    const ch = src[i];
    if (ch === "'" || ch === '"') return readString();
    if (ch === '[' || ch === '{') return readJson();
    throw new Error(`unsupported value at offset ${i}: ${src.slice(i, i + 30)}`);
  };

  const readKey = () => {
    skip();
    if (src[i] === '"' || src[i] === "'") return readString();
    const start = i;
    while (i < src.length && /[A-Za-z0-9_$-]/.test(src[i])) i++;
    const key = src.slice(start, i);
    if (!key) throw new Error(`expected a property name at offset ${start}`);
    return key;
  };

  return {
    skip,
    readValue,
    readKey,
    at: () => src[i],
    expect: (ch) => {
      skip();
      if (src[i] !== ch) throw new Error(`expected ${ch} at offset ${i}, found ${src[i]}`);
      i++;
    },
    done: () => i >= src.length,
  };
}
