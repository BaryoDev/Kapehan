/**
 * The 42 icons: both SVG tracks, the web component, and the site's copies.
 * Source of truth is kapehan-icons.js, the only hand-edited icon file.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { icons, monoOf, wrap } from '../../kapehan-icons.js';
import { root } from '../registry.mjs';

export const name = 'icons';

export const pkg = {
  exports: {
    '.': './kape-icon.js',
    './kape-icon.js': './kape-icon.js',
    './kapehan-icons.js': './kapehan-icons.js',
    './icons/*': './icons/*',
  },
  files: ['icons', 'kape-icon.js', 'kapehan-icons.js'],
};

const stripHints = (b) => b.replace(/\s*data-mono="drop"/g, '');

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

// Evaluated at import time, so a class extending HTMLElement would throw
// ReferenceError on a server. Anything server-rendering this package (Next, Nuxt,
// Astro, Remix) crashes on the import alone, before a browser is ever involved.
// ICONS stays usable there; only the element is browser-only.
const KapeIcon = typeof HTMLElement === 'undefined' ? null : class KapeIcon extends HTMLElement {
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
};

if (KapeIcon && typeof customElements !== 'undefined' && !customElements.get('kape-icon')) {
  customElements.define('kape-icon', KapeIcon);
}
export { ICONS, KapeIcon };
`;

export async function artifacts() {
  const out = new Map();

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

export async function check() {
  const fail = [];
  const seen = new Map();
  for (const icon of icons) {
    for (const key of [icon.name, ...icon.aliases]) {
      if (seen.has(key)) fail.push(`"${key}" is claimed by both ${seen.get(key)} and ${icon.name}`);
      else seen.set(key, icon.name);
    }
    if (!icon.tags?.length) fail.push(`${icon.name}: no tags, so search will never find it`);
    // currentColor is the whole promise of the mono track; a stray hex breaks theming silently.
    const stray = monoOf(icon).match(/(?:fill|stroke)="#[0-9A-Fa-f]{3,8}"/g);
    if (stray) fail.push(`${icon.name}: mono build keeps a literal colour ${stray[0]}`);
  }
  return fail;
}
