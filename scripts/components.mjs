/**
 * Extracts the 30 components from the design canvas into kapehan-components.js.
 *
 * This is the manifest everything downstream reads: the React and Vue generators, the
 * Blazor package, the Tailwind and Bootstrap variants, and the per-component docs pages.
 * It exists once so those five do not each grow their own copy of the same data.
 *
 * Called by scripts/build.mjs; not run directly.
 */
import { readCanvas, extractLiteral, scanner } from './canvas.mjs';

/** Every key ship-schema.json marks required. A missing one fails the build, not a consumer. */
const REQUIRED = ['label', 'cat', 'props', 'a11y', 'html', 'react', 'vue', 'blazor', 'css'];

/** The UI_NAV groups. A component in an unknown group cannot be placed in the sidebar. */
const CATEGORIES = ['Actions', 'Forms', 'Data', 'Feedback', 'Navigation', 'Overlays'];

const PROP_KEYS = ['name', 'type', 'default', 'required', 'description'];

export async function components() {
  const literal = extractLiteral(await readCanvas(), 'static SHIP', '{', '}');
  const s = scanner(literal);

  s.expect('{');
  const out = [];
  while (true) {
    s.skip();
    if (s.at() === '}') break;
    const key = s.readKey();
    s.expect(':');
    s.skip();
    if (s.at() !== '{') throw new Error(`component "${key}" is not an object`);
    s.expect('{');

    const entry = { key };
    while (true) {
      s.skip();
      if (s.at() === '}') { s.expect('}'); break; }
      const field = s.readKey();
      s.expect(':');
      entry[field] = s.readValue();
    }
    out.push(entry);
  }

  validate(out);
  return out;
}

function validate(list) {
  const seen = new Set();
  for (const c of list) {
    if (seen.has(c.key)) throw new Error(`two components share the key "${c.key}"`);
    seen.add(c.key);

    for (const k of REQUIRED) {
      if (c[k] === undefined) throw new Error(`component "${c.key}" is missing ${k}`);
    }
    if (!CATEGORIES.includes(c.cat)) {
      throw new Error(`component "${c.key}" has cat "${c.cat}", which is not one of ${CATEGORIES.join(', ')}`);
    }
    if (!Array.isArray(c.props)) throw new Error(`component "${c.key}" props is not an array`);
    for (const p of c.props) {
      for (const k of PROP_KEYS) {
        if (p[k] === undefined) throw new Error(`component "${c.key}" prop "${p.name ?? '?'}" is missing ${k}`);
      }
    }
    for (const k of ['roles', 'attrs', 'keys']) {
      if (!Array.isArray(c.a11y?.[k])) throw new Error(`component "${c.key}" a11y.${k} is not an array`);
    }
    // A framework snippet that renders nothing is worse than a missing one, because it
    // looks shipped on the site and copies as an empty string.
    for (const fw of ['html', 'react', 'vue', 'blazor']) {
      if (!c[fw].trim()) throw new Error(`component "${c.key}" has an empty ${fw} snippet`);
    }
  }
}

/**
 * The classes a component's markup actually uses, across all four frameworks.
 *
 * Read out of class attributes only. A plain `kape-` scan also catches the ARIA wiring
 * (`aria-labelledby="kape-dialog-title"`, `aria-controls="kape-combo-list"`) and the
 * `kape-opt-${id}` prefixes, none of which are stylesheet classes, and reports all of them
 * as missing CSS.
 */
export function classesOf(c) {
  const markup = [c.html, c.react, c.vue, c.blazor].join('\n');
  const found = new Set();
  // class="a b", className="a b", :class="..." and Blazor's class="@x kape-y"
  for (const m of markup.matchAll(/(?:^|\s)(?::|v-bind:)?class(?:Name)?\s*=\s*(["'{])([\s\S]*?)(?:\1|})/g)) {
    for (const cls of m[2].match(/kape-[a-z0-9_-]+/g) ?? []) found.add(cls);
  }
  return found;
}

export const COMPONENT_CATEGORIES = CATEGORIES;

export function moduleSource(list) {
  return `/**
 * Kapehan component manifest: ${list.length} components.
 *
 * GENERATED from design/Kapehan.dc.html by scripts/components.mjs. Do not edit by hand;
 * edit the canvas and run \`npm run build\`. npm test fails if this drifts.
 *
 * Each entry carries the markup the package actually ships, plus the props table and the
 * accessibility contract, so every generator and the docs read one source.
 *
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
export const categories = ${JSON.stringify(CATEGORIES)};

export const components = ${JSON.stringify(list, null, 2)};

const INDEX = new Map(components.map((c) => [c.key, c]));

/** Look a component up by key. Returns undefined rather than throwing, like icon lookup. */
export const get = (key) => INDEX.get(key);

/** Components in one UI_NAV group, in canvas order. */
export const byCategory = (cat) => components.filter((c) => c.cat === cat);
`;
}
