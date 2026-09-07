/**
 * Compares what the README says about the registry with what the registry says.
 *
 *   npm run check:published
 *
 * Deliberately NOT part of `npm test`. That gate runs offline with nothing installed,
 * because prepublishOnly and the publish workflow both call it, and a network fact would
 * make it fail on a plane and flake in CI. The offline half of this claim, that the version
 * the README names is the version in package.json, is checked there.
 *
 * Run this when the README's "not yet published" warnings are about to change, or after a
 * release, to confirm they are still true.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { root } from './registry.mjs';

const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const readme = await readFile(join(root, 'README.md'), 'utf8');

let latest;
try {
  const res = await fetch('https://registry.npmjs.org/kapehan', {
    headers: { accept: 'application/vnd.npm.install-v1+json' },
  });
  if (!res.ok) throw new Error(`registry returned ${res.status}`);
  latest = (await res.json())['dist-tags']?.latest;
} catch (e) {
  console.error(`could not reach the npm registry: ${e.message}`);
  process.exit(2); // 2, not 1: unreachable is not the same as wrong
}

const fail = [];
console.log(`package.json  ${pkg.version}`);
console.log(`npm latest    ${latest}`);

const warned = [...readme.matchAll(/`npm i kapehan` gives you (\d+\.\d+\.\d+) today/g)].map((m) => m[1]);

if (pkg.version === latest) {
  // Published. Every "not yet published" warning is now false.
  if (warned.length) {
    fail.push(
      `${pkg.version} is on npm, but README.md still warns "npm i kapehan gives you ${warned[0]} today" ` +
        `in ${warned.length} place(s); delete those warnings`,
    );
  }
} else {
  // Not published. The warnings must exist and must name what npm actually serves.
  if (!warned.length) {
    fail.push(
      `package.json is ${pkg.version} but npm serves ${latest}, and README.md does not say so; ` +
        'a reader will install something older than the docs describe',
    );
  }
  for (const v of warned) {
    if (v !== latest) fail.push(`README.md says npm gives you ${v} today, npm actually serves ${latest}`);
  }
}

if (fail.length) {
  for (const f of fail) console.error('x', f);
  process.exit(1);
}
console.log('ok: the README describes the registry correctly');
