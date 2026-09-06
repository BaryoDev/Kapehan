/**
 * The 30 components: the manifest the React, Vue, Blazor, Tailwind and docs generators
 * all read, so those five cannot each grow their own copy of the same data.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { components, classesOf, moduleSource, COMPONENT_CATEGORIES } from '../components.mjs';
import { root } from '../registry.mjs';

export const name = 'components';

export const pkg = {
  exports: { './kapehan-components.js': './kapehan-components.js', './kapehan.css': './kapehan.css' },
  files: ['kapehan-components.js', 'kapehan.css'],
};

export async function artifacts() {
  // The manifest ships only the stacks the package actually has a generator for. The canvas
  // still carries vue and blazor markup for all 30, and it stays there, but publishing a
  // .blazor field advertises a track that does not exist. Whatever the package promises
  // must exist, and a field a consumer can read is a promise.
  const shipped = (await components()).map(({ vue, blazor, ...rest }) => rest);
  return new Map([['kapehan-components.js', moduleSource(shipped)]]);
}

export async function check() {
  const fail = [];
  const comps = await components();

  // Selectors only. A bare kape- scan also picks up the @keyframes name kape-shimmer,
  // which is not a class anyone can put on an element.
  const cssText = await readFile(join(root, 'kapehan.css'), 'utf8');
  const cssClasses = new Set((cssText.match(/\.kape-[a-z0-9_-]+/g) ?? []).map((x) => x.slice(1)));

  // The premise is that the CSS never forks per framework: React, Vue, Blazor and the HTML
  // snippet render the same class names. A snippet naming a class the stylesheet does not
  // define renders unstyled, and looks perfectly fine in a diff.
  for (const c of comps) {
    for (const cls of classesOf(c)) {
      if (cls === 'kape-icon' || cls === 'kape-doodle') continue; // elements, not classes
      if (!cssClasses.has(cls)) fail.push(`component "${c.key}" uses .${cls}, which kapehan.css does not define`);
    }
  }

  // A family with CSS but no component is something the stylesheet ships that nobody can
  // copy. kape-stamps was exactly that until the second canvas export added an entry.
  const usedFamilies = new Set(comps.flatMap((c) => [...classesOf(c)]).map((x) => x.replace(/(--|__).*$/, '')));
  for (const cls of cssClasses) {
    const family = cls.replace(/(--|__).*$/, '');
    if (family === 'kape-sr') continue; // a screen-reader utility, not a component
    if (!usedFamilies.has(family)) fail.push(`kapehan.css defines .${family} but no component uses it, so nobody can copy it`);
  }

  for (const cat of COMPONENT_CATEGORIES) {
    if (!comps.some((c) => c.cat === cat)) fail.push(`no component is in the "${cat}" group`);
  }

  // The stylesheet states its own contract: components never hold a hex. True only while
  // nobody adds one, so it is checked rather than trusted.
  const rootEnd = cssText.indexOf('[data-edges="square"]');
  if (rootEnd === -1) fail.push('kapehan.css: cannot find the end of the :root block, so the hex check cannot run');
  else {
    const stray = cssText.slice(rootEnd).match(/#[0-9A-Fa-f]{3,8}/g);
    if (stray) fail.push(`kapehan.css: ${stray.length} hard-coded colour(s) outside :root (${stray.slice(0, 3).join(', ')}), components must read var()`);
  }

  // Compare selectors, not whole lines. Two rules sharing a selector with different
  // declarations are not equal as strings, so a line-wise check passes while the later
  // rule silently overrides the earlier one.
  const selectors = cssText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('.kape-') && l.includes('{') && l.endsWith('}'))
    .map((l) => l.slice(0, l.indexOf('{')).trim());
  for (const d of new Set(selectors.filter((sel, i) => selectors.indexOf(sel) !== i))) {
    fail.push(`kapehan.css declares ${d} more than once, the later rule silently wins`);
  }

  return fail;
}
