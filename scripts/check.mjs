/**
 * Fails if anything on disk differs from what kapehan-icons.js generates, if two icons
 * claim the same name or alias, or if a mono build kept a literal colour.
 * A drifted icons/ folder is invisible in review and ships straight to npm, so this is the gate.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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

// The package entry point is a browser web component, but anything server-rendering
// it (Next, Nuxt, Astro, Remix) evaluates the import on the server first. Shipped 0.2.0
// threw ReferenceError: HTMLElement is not defined on that path, and nothing caught it
// because the file is only ever loaded in a browser by the tests.
try {
  const mod = await import(join(root, 'kape-icon.js'));
  if (!Array.isArray(mod.ICONS) || !mod.ICONS.length) fail.push('kape-icon.js exports no ICONS when imported in node');
} catch (e) {
  fail.push(`kape-icon.js cannot be imported outside a browser: ${e.message}`);
}

// kapehan.css states its own contract at the top: "Components never hold a hex; they read
// the variables below." That is only true while nobody adds one, so it is checked rather
// than trusted. Palette roles live in :root; everything after it must use var().
try {
  const css = await readFile(join(root, 'kapehan.css'), 'utf8');
  const rootEnd = css.indexOf('[data-edges="square"]');
  if (rootEnd === -1) fail.push('kapehan.css: cannot find the end of the :root block, so the hex check cannot run');
  else {
    const components = css.slice(rootEnd);
    const stray = components.match(/#[0-9A-Fa-f]{3,8}/g);
    if (stray) fail.push(`kapehan.css: ${stray.length} hard-coded colour(s) outside :root (${stray.slice(0, 3).join(', ')}), components must read var()`);
  }

  // The canvas has now shipped .kape-btn--ink twice, identically, in two separate exports.
  // A duplicated rule is harmless until the two copies drift, at which point the later one
  // silently wins and nobody knows which was intended.
  const rules = css.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('.kape-') && l.endsWith('}'));
  const dupes = new Set(rules.filter((r, i) => rules.indexOf(r) !== i));
  for (const d of dupes) fail.push(`kapehan.css declares this rule more than once: ${d.slice(0, 70)}`);
} catch {
  fail.push('kapehan.css is missing, but package.json ships it');
}

// A file listed in exports but absent from files is a 404 for anyone who installs it.
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
for (const target of Object.values(pkg.exports ?? {})) {
  const rel = target.replace(/^\.\//, '');
  if (rel.includes('*')) continue;
  const top = rel.split('/')[0];
  if (!(pkg.files ?? []).includes(top)) fail.push(`package.json exports ${target} but files[] does not ship ${top}`);
}

// Whatever the site and the README promise must actually exist. Both are read by people
// who then run the command, so a promise the tarball does not keep is a broken install,
// not a typo. Checked mechanically because it is exactly the thing nobody re-reads.
const readme = await readFile(join(root, 'README.md'), 'utf8');
const site = await readFile(join(root, 'docs/index.html'), 'utf8');

const subpathOk = (sub) =>
  Object.keys(pkg.exports ?? {}).some(
    (k) => k === sub || (k.includes('*') && new RegExp('^' + k.replace(/\*/g, '.*') + '$').test(sub)),
  );

// Only code counts as a promise. Prose says things like "every kapehan/... path", which is
// not an install anyone can run, and treating it as one made this gate fail on its own
// documentation the first time it ran.
const codeOnly = (text) =>
  [...(text.match(/```[\s\S]*?```/g) ?? []), ...(text.match(/`[^`\n]+`/g) ?? []), ...(text.match(/(?:src|href)="[^"]*"/g) ?? [])].join('\n');

for (const [where, text] of [['README.md', codeOnly(readme)], ['docs/index.html', codeOnly(site) + site]]) {
  for (const ref of new Set(text.match(/kapehan\/[a-zA-Z0-9/._-]+/g) ?? [])) {
    if (ref.includes('..')) continue;
    const sub = './' + ref.slice('kapehan/'.length);
    if (!subpathOk(sub)) fail.push(`${where} promises ${ref}, which package.json exports does not resolve`);
    else if (!existsSync(join(root, sub))) fail.push(`${where} promises ${ref}, which is exported but missing on disk`);
  }
}

// The version shown to a visitor and the version they would install must agree.
const shown = [...new Set(site.match(/v\d+\.\d+/g) ?? [])];
const want = 'v' + pkg.version.split('.').slice(0, 2).join('.');
for (const v of shown) if (v !== want) fail.push(`docs/index.html shows ${v} but package.json is ${pkg.version}`);

// Every icon the docs name must be a real name or alias, or the copy-paste snippet renders nothing.
const named = new Set([...readme.matchAll(/kape-icon name="([a-z-]+)"/g)].map((m) => m[1]));
for (const m of site.matchAll(/kape-icon name=&quot;([a-z-]+)&quot;|kape-icon name="([a-z-]+)"/g)) named.add(m[1] ?? m[2]);
const known = new Set(icons.flatMap((i) => [i.name, ...i.aliases]));
for (const n of named) if (!known.has(n)) fail.push(`the docs show <kape-icon name="${n}">, which is not an icon or an alias`);

if (fail.length) {
  for (const f of fail) console.error('x', f);
  process.exit(1);
}
console.log(`ok: ${icons.length} icons, ${expected.size} generated files, all in sync`);
