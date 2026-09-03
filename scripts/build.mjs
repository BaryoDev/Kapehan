/**
 * Generates every shipped artifact from kapehan-icons.js, the single source of truth:
 *
 *   icons/<name>.svg        full colour, 48x48
 *   icons/mono/<name>.svg   one colour, 24x24, currentColor
 *   kape-icon.js            the <kape-icon> web component, icon data inlined
 *   docs/kapehan-icons.js   the site's copy of the source
 *   docs/favicon.svg        the site's tab icon
 *
 * Run `npm run build` after editing kapehan-icons.js, then commit the result.
 * `npm test` re-runs this in memory and fails if anything on disk drifted.
 */
import { mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons, monoOf, wrap } from '../kapehan-icons.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const componentSource = (data) => `/**
 * <kape-icon>: Kapehan icons with no build step.
 *
 *   <script type="module" src="kape-icon.js"></script>
 *   <kape-icon name="barako" size="32"></kape-icon>
 *   <kape-icon name="cup-cold" mono></kape-icon>
 *
 * Attributes: name (icon name or alias), size (px, default 24), mono (boolean, uses currentColor).
 * GENERATED from kapehan-icons.js by scripts/build.mjs. Do not edit by hand.
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
const ICONS = ${data};

const INDEX = new Map();
for (const i of ICONS) {
  INDEX.set(i.name, i);
  for (const a of i.aliases) if (!INDEX.has(a)) INDEX.set(a, i);
}

const SVG_NS = 'http://www.w3.org/2000/svg';

class KapeIcon extends HTMLElement {
  static get observedAttributes() { return ['name', 'size', 'mono']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    const icon = INDEX.get((this.getAttribute('name') || '').trim());
    if (!icon) { this.replaceChildren(); return; }

    // size comes from the host page and may be hostile. Concatenating it into an
    // attribute string lets size='24" onload="..."' break out of the tag, so it is
    // coerced to a number and every attribute is set on the node instead. Only
    // build-time icon data reaches innerHTML.
    const n = Number(this.getAttribute('size'));
    const size = Number.isFinite(n) && n > 0 ? n : 24;
    const body = this.hasAttribute('mono') ? icon.mono : icon.body;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 48 48');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', icon.name.replace(/-/g, ' '));
    svg.innerHTML = body;

    this.style.display = this.style.display || 'inline-flex';
    this.replaceChildren(svg);
  }
}
if (!customElements.get('kape-icon')) customElements.define('kape-icon', KapeIcon);
export { ICONS, KapeIcon };
`;

/** Every file the build owns, as path to contents. Nothing is written from anywhere else. */
export async function artifacts() {
  const out = new Map();
  const stripHints = (b) => b.replace(/\s*data-mono="drop"/g, '');

  for (const icon of icons) {
    out.set(`icons/${icon.name}.svg`, wrap(icon.name, icon.body, 48));
    out.set(`icons/mono/${icon.name}.svg`, wrap(icon.name, monoOf(icon), 24));
  }

  const data = JSON.stringify(
    icons.map((i) => ({
      name: i.name,
      aliases: i.aliases,
      body: stripHints(i.body),
      mono: stripHints(monoOf(i)),
    })),
  );
  out.set('kape-icon.js', componentSource(data));
  out.set('docs/kapehan-icons.js', await readFile(join(root, 'kapehan-icons.js'), 'utf8'));
  // The site is served from docs/, which cannot reach ../icons, so the tab icon is copied in.
  out.set('docs/favicon.svg', wrap('barako', icons.find((i) => i.name === 'barako').body, 48));

  return out;
}

/** Stale SVGs from a renamed or removed icon would otherwise ship forever. */
async function pruneIcons(keep) {
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
  const files = await artifacts();
  await mkdir(join(root, 'icons/mono'), { recursive: true });
  await mkdir(join(root, 'docs'), { recursive: true });
  for (const [path, body] of files) await writeFile(join(root, path), body);
  await pruneIcons(new Set(files.keys()));
  console.log(`built ${files.size} files from ${icons.length} icons`);
}
