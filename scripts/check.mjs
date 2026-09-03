/**
 * Fails if anything on disk differs from what kapehan-icons.js generates, if two icons
 * claim the same name or alias, or if a mono build kept a literal colour.
 * A drifted icons/ folder is invisible in review and ships straight to npm, so this is the gate.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons, categories, monoOf } from '../kapehan-icons.js';
import { artifacts } from './build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fail = [];

const expected = await artifacts();
for (const [path, body] of expected) {
  const actual = await readFile(join(root, path), 'utf8').catch(() => null);
  if (actual === null) fail.push(`missing ${path}, run npm run build`);
  else if (actual !== body) fail.push(`${path} is stale, run npm run build`);
}

const seen = new Map();
for (const icon of icons) {
  for (const key of [icon.name, ...icon.aliases]) {
    if (seen.has(key)) fail.push(`"${key}" is claimed by both ${seen.get(key)} and ${icon.name}`);
    else seen.set(key, icon.name);
  }
  if (!categories.includes(icon.category)) fail.push(`${icon.name}: unknown category ${icon.category}`);
  if (!icon.tags?.length) fail.push(`${icon.name}: no tags, so search will never find it`);
  // currentColor is the whole promise of the mono track; a stray hex breaks theming silently.
  const stray = monoOf(icon).match(/(?:fill|stroke)="#[0-9A-Fa-f]{3,8}"/g);
  if (stray) fail.push(`${icon.name}: mono build keeps a literal colour ${stray[0]}`);
}

if (fail.length) {
  for (const f of fail) console.error('x', f);
  process.exit(1);
}
console.log(`ok: ${icons.length} icons, ${expected.size} generated files, all in sync`);
