/**
 * The gate. Fails if anything on disk disagrees with what the generators produce, or if
 * any generator's own checks fail.
 *
 * Runs with nothing installed, which is why prepublishOnly and the publish workflow can
 * both use it.
 *
 * Generator-specific gates live with their generator in scripts/generators/. What stays
 * here is what spans the whole repo: drift, the package manifest, and the promises the
 * docs make.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadGenerators, allArtifacts, requiredPkg, root } from './registry.mjs';
import { icons } from '../kapehan-icons.js';
import { components } from './components.mjs';

const fail = [];
const generators = await loadGenerators();
const expected = await allArtifacts(generators);

// 1. Drift. Every generated file must match what its generator produces right now.
for (const [path, body] of expected) {
  const actual = await readFile(join(root, path), 'utf8').catch(() => null);
  if (actual === null) fail.push(`missing ${path}, run npm run build`);
  else if (actual !== body) fail.push(`${path} is stale, run npm run build`);
}

// 2. Each generator's own gates.
for (const g of generators) {
  if (typeof g.check !== 'function') continue;
  for (const f of await g.check({ root, expected })) fail.push(f);
}

// 3. The package manifest must ship what the generators declare. A generator added without
//    its exports entry produces files nobody can import.
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const want = requiredPkg(generators);
for (const [sub, target] of Object.entries(want.exports)) {
  if (pkg.exports?.[sub] !== target) fail.push(`package.json exports is missing ${sub}: ${target}, which a generator declares`);
}
for (const f of want.files) {
  if (!(pkg.files ?? []).includes(f)) fail.push(`package.json files is missing ${f}, which a generator declares`);
}
// A peer the manifest does not name is ERR_MODULE_NOT_FOUND at import time with no npm
// warning, and sideEffects decides whether a bundler keeps a module that exists only to
// register a custom element.
for (const [dep, range] of Object.entries(want.peerDependencies)) {
  if (pkg.peerDependencies?.[dep] !== range) fail.push(`package.json peerDependencies is missing ${dep}: ${range}, which a generator declares`);
}
for (const f of want.sideEffects) {
  if (!(Array.isArray(pkg.sideEffects) ? pkg.sideEffects : []).includes(f)) {
    fail.push(`package.json sideEffects is missing ${f}, which a generator declares; a bundler will tree-shake it away`);
  }
}
// And nothing may be exported that the tarball does not carry.
for (const target of Object.values(pkg.exports ?? {})) {
  const rel = target.replace(/^\.\//, '');
  if (rel.includes('*')) continue;
  const top = rel.split('/')[0];
  if (!(pkg.files ?? []).includes(top)) fail.push(`package.json exports ${target} but files[] does not ship ${top}`);
}

// 4. The entry point is a browser web component, but anything server-rendering it (Next,
//    Nuxt, Astro, Remix) evaluates the import on the server first. Shipped 0.2.0 threw
//    ReferenceError: HTMLElement is not defined there, and nothing caught it because the
//    file is only ever loaded in a browser by the tests.
try {
  const mod = await import(join(root, 'kape-icon.js'));
  if (!Array.isArray(mod.ICONS) || !mod.ICONS.length) fail.push('kape-icon.js exports no ICONS when imported in node');
} catch (e) {
  fail.push(`kape-icon.js cannot be imported outside a browser: ${e.message}`);
}

// 5. Whatever the site and the README promise must actually exist. Both are read by people
//    who then run the command, so a promise the tarball does not keep is a broken install.
//    Only code counts: prose says things like "every kapehan/... path", which is not an
//    install anyone can run, and treating it as one made this gate fail on its own docs.
const readme = await readFile(join(root, 'README.md'), 'utf8');
const site = await readFile(join(root, 'docs/index.html'), 'utf8');
const codeOnly = (text) =>
  [
    ...(text.match(/```[\s\S]*?```/g) ?? []),
    ...(text.match(/`[^`\n]+`/g) ?? []),
    ...(text.match(/(?:src|href)="[^"]*"/g) ?? []),
  ].join('\n');

const subpathOk = (sub) =>
  Object.keys(pkg.exports ?? {}).some(
    (k) => k === sub || (k.includes('*') && new RegExp('^' + k.replace(/\*/g, '.*') + '$').test(sub)),
  );

for (const [where, text] of [['README.md', codeOnly(readme)], ['docs/index.html', codeOnly(site) + site]]) {
  for (const ref of new Set(text.match(/kapehan\/[a-zA-Z0-9/._-]+/g) ?? [])) {
    if (ref.includes('..')) continue;
    const sub = './' + ref.slice('kapehan/'.length);
    if (!subpathOk(sub)) fail.push(`${where} promises ${ref}, which package.json exports does not resolve`);
    else if (!existsSync(join(root, sub))) fail.push(`${where} promises ${ref}, which is exported but missing on disk`);
  }
}

// The version shown to a visitor and the version they would install must agree.
const shownWant = 'v' + pkg.version.split('.').slice(0, 2).join('.');
for (const v of new Set(site.match(/v\d+\.\d+/g) ?? [])) {
  if (v !== shownWant) fail.push(`docs/index.html shows ${v} but package.json is ${pkg.version}`);
}

// Every icon the docs name must be a real name or alias, or the snippet renders nothing.
const named = new Set([...readme.matchAll(/kape-icon name="([a-z-]+)"/g)].map((m) => m[1]));
for (const m of site.matchAll(/kape-icon name=&quot;([a-z-]+)&quot;|kape-icon name="([a-z-]+)"/g)) named.add(m[1] ?? m[2]);
const known = new Set(icons.flatMap((i) => [i.name, ...i.aliases]));
for (const n of named) if (!known.has(n)) fail.push(`the docs show <kape-icon name="${n}">, which is not an icon or an alias`);

if (fail.length) {
  for (const f of fail) console.error('x', f);
  process.exit(1);
}
const comps = await components();
console.log(
  `ok: ${icons.length} icons, ${comps.length} components, ${expected.size} generated files ` +
    `from ${generators.length} generators, all in sync`,
);
