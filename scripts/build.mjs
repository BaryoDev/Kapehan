/**
 * Writes everything the package ships.
 *
 * The build itself owns nothing. Each generator in scripts/generators/ declares the files
 * it writes, and this merges them. Adding a generator means adding a file there; this
 * script does not change. That is deliberate: React, Vue, Blazor, doodles, types and the
 * Tailwind variants each add one, and when they all edited a single artifacts() function
 * they collided on it.
 *
 *   npm run build     write everything
 *   npm test          fail if anything on disk drifted from what this produces
 */
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { loadGenerators, allArtifacts, root } from './registry.mjs';

export async function artifacts() {
  return allArtifacts(await loadGenerators());
}

/** Stale files from a renamed or removed icon would otherwise ship forever. */
async function prune(keep) {
  for (const dir of ['icons', 'icons/mono']) {
    const entries = await readdir(join(root, dir), { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith('.svg')) continue;
      const rel = `${dir}/${e.name}`;
      if (!keep.has(rel)) {
        await rm(join(root, rel));
        console.log('pruned', rel);
      }
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const generators = await loadGenerators();
  const files = await allArtifacts(generators);

  for (const [path, body] of files) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), body);
  }
  await prune(new Set(files.keys()));

  console.log(`built ${files.size} files from ${generators.length} generators: ${generators.map((g) => g.name).join(', ')}`);
}
