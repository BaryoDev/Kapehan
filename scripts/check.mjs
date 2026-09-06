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
const comps = await components();
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

// An entry is either a bare path or a conditions object once it carries types. Both forms
// resolve to the same runtime file, which is what the rest of this section is about.
const runtimeTarget = (entry) => (typeof entry === 'string' ? entry : entry?.default);

for (const [sub, target] of Object.entries(want.exports)) {
  if (runtimeTarget(pkg.exports?.[sub]) !== target) {
    fail.push(`package.json exports is missing ${sub}: ${target}, which a generator declares`);
  }
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
// And nothing may be exported that the tarball does not carry, whichever condition names it.
// A types condition pointing at a .d.ts that files[] omits publishes an untyped package
// that looks typed in the manifest.
for (const entry of Object.values(pkg.exports ?? {})) {
  const targets = typeof entry === 'string' ? [entry] : Object.values(entry ?? {});
  for (const target of targets) {
    if (typeof target !== 'string') continue;
    const rel = target.replace(/^\.\//, '');
    if (rel.includes('*')) continue;
    const top = rel.split('/')[0];
    if (!(pkg.files ?? []).includes(top)) fail.push(`package.json exports ${target} but files[] does not ship ${top}`);
  }
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

// 6. Counts. The site and the README both state how many icons and how many components
//    there are, in prose and in social metadata that no test ever renders. The site said
//    37 icons in seven places, including four meta tags, for as long as there have been 42.
//    A number typed by hand beside a number that is derived will drift; these assert the
//    typed ones still agree with the source.
const WORDS = {
  30: 'Thirty', 34: 'Thirty-four', 35: 'Thirty-five', 37: 'Thirty-seven',
  42: 'Forty-two', 48: 'Forty-eight',
};
const stale = Object.entries(WORDS).filter(([n]) => Number(n) !== icons.length);

// The count word must sit directly against the noun: "42 hand-drawn", "Forty-two drinks".
// A window of a few characters instead matches the code embedded in the page, where
// exportSvg(icon, 48, ...) reads as "48 icons" and the gate fails on a size argument.
const COUNTED = '(?:hand-drawn|icons?\\b|drinks|SVGs)';
for (const [n, word] of stale) {
  const claim = new RegExp(`\\b(?:${n}|${word})[\\s-]+${COUNTED}`, 'i');
  if (claim.test(site)) fail.push(`docs/index.html still says ${n} icons somewhere; there are ${icons.length}`);
  if (claim.test(readme)) fail.push(`README.md still says ${n} icons somewhere; there are ${icons.length}`);
}

// The two component numbers the README states. Whether a family has a component and whether
// a component has CSS is already both-ways in the components generator; this only checks
// that the README's arithmetic still describes what is on disk.
//
// kape-sr is excluded for the same reason the generator excludes it: it is the
// screen-reader utility class, not a component family. Counting it gives 35 and makes the
// README's long-standing 34 look wrong when it is right.
const UTILITY_CLASSES = new Set(['kape-sr']);
const family = (cls) => cls.replace(/(--|__).*$/, '');
const css = await readFile(join(root, 'kapehan.css'), 'utf8');
const cssFamilies = new Set(
  [...css.matchAll(/\.(kape-[a-z0-9_-]+)/g)].map((m) => family(m[1])).filter((f) => !UTILITY_CLASSES.has(f)),
);

const claimedFamilies = readme.match(/styles (\d+) component families/);
if (!claimedFamilies) fail.push('README.md no longer states how many component families kapehan.css styles');
else if (Number(claimedFamilies[1]) !== cssFamilies.size) {
  fail.push(`README.md says ${claimedFamilies[1]} component families, kapehan.css defines ${cssFamilies.size}`);
}

const claimedComps = readme.match(/manifest describes (\d+)\s*\n?\s*components/);
if (!claimedComps) fail.push('README.md no longer states how many components the manifest describes');
else if (Number(claimedComps[1]) !== comps.length) {
  fail.push(`README.md says the manifest describes ${claimedComps[1]} components, it describes ${comps.length}`);
}

// The README carries a "not yet published" warning naming two versions. Both are claims
// about the world, so they are checked rather than trusted:
//
//   "Ships in X"        must be this package's version, or the warning describes a release
//                       that is not the one in the repo.
//   "gives you Y today" must NOT be this package's version, because if they match there is
//                       nothing left to warn about and the warning should be deleted.
//
// Whether X is actually on the registry is a network fact, so it lives in
// `npm run check:published` instead. npm test has to run offline, with nothing installed,
// as prepublishOnly and the publish workflow both call it.
for (const m of readme.matchAll(/Ships in \*\*(\d+\.\d+\.\d+)\*\*/g)) {
  if (m[1] !== pkg.version) {
    fail.push(`README.md says "Ships in ${m[1]}" but package.json is ${pkg.version}`);
  }
}
for (const m of readme.matchAll(/`npm i kapehan` gives you (\d+\.\d+\.\d+) today/g)) {
  if (m[1] === pkg.version) {
    fail.push(
      `README.md warns that npm gives you ${m[1]} today, which is this package's own version; ` +
        'if it is published, delete the warning',
    );
  }
}

// 7. No published surface may OFFER a parked stack. Vue and Blazor stay in the canvas as
//    source, so this is about what the package and the docs advertise, not the word.
//    docs/index.html is itself a Vue 3 page, so banning the string would fail on the site's
//    own runtime: "const { createApp } = Vue" is how it mounts, not a stack on offer.
const OFFERS = [
  [/\bVue\b\s*(?:or|,|and)\s*Blazor|\bBlazor\b\s*(?:or|,|and)\s*Vue/i, 'offers Vue or Blazor as a stack'],
  [/kapehan\/vue|kapehan\/blazor/i, 'promises a parked subpath'],
  [/\.razor\b/i, 'references a .razor file'],
  [/Kapehan\.Components/i, 'references the parked Blazor package'],
];
for (const [where, text] of [['README.md', readme], ['docs/index.html', site]]) {
  for (const [re, why] of OFFERS) {
    if (re.test(text)) fail.push(`${where} ${why}, which is parked`);
  }
}
// The README has no Vue or Blazor runtime of its own, so there the bare word is an offer.
for (const parked of ['Vue', 'Blazor']) {
  if (new RegExp(`\\b${parked}\\b`).test(readme)) fail.push(`README.md mentions ${parked}, which is parked`);
}
const manifestSrc = await readFile(join(root, 'kapehan-components.js'), 'utf8');
for (const parked of ['vue', 'blazor']) {
  if (new RegExp(`"${parked}"\\s*:`).test(manifestSrc)) {
    fail.push(`kapehan-components.js carries a ${parked} field, which is parked`);
  }
}

if (fail.length) {
  for (const f of fail) console.error('x', f);
  process.exit(1);
}
console.log(
  `ok: ${icons.length} icons, ${comps.length} components, ${expected.size} generated files ` +
    `from ${generators.length} generators, all in sync`,
);
