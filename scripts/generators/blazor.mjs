/**
 * The Blazor package: Kapehan.Components, a Razor class library published to NuGet.
 *
 * Same premise as every other generator here. kapehan-components.js already carries a
 * `blazor` snippet per component, written in the canvas alongside the html, react and vue
 * ones, so the .razor files are generated from it rather than hand-kept in parallel. A
 * hand-maintained .NET port drifts from the canvas the first time a class name changes,
 * and nothing catches it because C# and the stylesheet never meet.
 *
 * What this owns:
 *
 *   Kapehan.Components/*.razor            the 30 components, one file each
 *   Kapehan.Components/KapeIcon.razor     the icon element the snippets call
 *   Kapehan.Components/KapeIcons.g.cs     the 42 icons, from kapehan-icons.js
 *   Kapehan.Components/_Imports.razor     the usings the snippets assume
 *   Kapehan.Components/wwwroot/           kapehan.css, the interop shim and both icon tracks
 *   Kapehan.Components/README.md          PackageReadmeFile
 *
 * What it does NOT own, because none of it is derived from the canvas:
 *
 *   Kapehan.Components/Kapehan.Components.csproj
 *   Kapehan.Components/Models.cs          the record types the snippets bind to
 *   Directory.Build.props
 *
 * Those are hand-written and checked below rather than generated, so that a canvas edit
 * needing a new model type fails `dotnet build` loudly instead of being papered over.
 *
 * Deliberate rewrites of the canvas text, all mechanical, each one asserted so a silent
 * no-op is impossible, and all listed by name so nobody mistakes them for the snippet:
 *
 *   1. `import "./kapehan.interop.js"` becomes the _content path. A Razor class library's
 *      static assets live under _content/<PackageId>/, so the canvas path resolves against
 *      the consuming page and 404s in every app that is not serving the file itself.
 *   2. The trailing `@* wwwroot/kapehan.interop.js ... *@` block in the dialog snippet is
 *      dropped, because that file is generated here and a second copy in a comment is the
 *      duplicate this repo exists to avoid.
 *   3. A required reference parameter written `= default!` renders nothing instead of
 *      throwing. EditorRequired is a warning in the consumer's project, never an error, so
 *      `<KapeCard />` with no attributes reaches the markup with a null Item and threw
 *      NullReferenceException: a 500 under prerender, a dead circuit on Blazor Server.
 *   4. `.First(` on an id lookup becomes `.FirstOrDefault(` with null-safe reads. The
 *      canvas writes these as a JS `find`, which yields undefined; the Vue generator kept
 *      that with `?.`, and First() throws instead. Options arriving from a service one
 *      render after Value is the ordinary case, and it must not be an exception.
 *   5. The native <dialog> dismissals are bound. The canvas prop table says OnClose fires
 *      on Escape, and nothing was listening, so Escape closed the element in the DOM and
 *      the parent was never told. Escape now reports through @oncancel and @onclose
 *      resyncs _shown. What the port still cannot do is a backdrop click, so that word is
 *      struck from the shipped XML doc (see DESCRIPTION_FIXES) rather than left to lie in
 *      the consumer's IntelliSense.
 *   6. A DotNetObjectReference and the handle a subscribing interop call returns are both
 *      captured in fields and released in DisposeAsync. The canvas calls bindHotkey
 *      through InvokeVoidAsync, which discards the handle the function returns, so every
 *      mount of the palette left another window keydown listener bound to a dead
 *      component.
 *
 * Every rewrite above is gated in check(), and the gates are on what the rewrite produced
 * rather than on a word it leaves lying in the file. Three of them were the latter and all
 * three passed clean over the exact bug they were written for: the null guard could be
 * deleted as long as the `?` stayed, @oncancel could be bound to a handler that reported
 * nothing, and a receiver renamed by one assignment was no longer interop at all. A gate
 * that greps for its own vocabulary teaches the next person the area is covered.
 *
 * What is still not verified here, and cannot be from this repo: the browser side of the
 * bindHotkey handle. DotNet.createJSObjectReference marshalling that object back so
 * IJSObjectReference.InvokeVoidAsync("dispose") reaches it, and removeEventListener then
 * unbinding the listener, need a Blazor host and a DOM, and there is neither. What is
 * checked instead is the seam the two sides meet at: the method name C# invokes is compared
 * against the methods the handle in kapehan.interop.js actually carries, and a function that
 * binds a listener must be released through a method that removes one. Kapehan.Components.Tests
 * runs the managed half for real.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { icons, monoOf, stripHints, wrap } from '../../kapehan-icons.js';
import { components } from '../components.mjs';
import { root } from '../registry.mjs';

export const name = 'blazor';

/** The NuGet id, the assembly name and the _content/ segment are all this one string. */
export const PACKAGE_ID = 'Kapehan.Components';
const DIR = PACKAGE_ID;

/**
 * Nothing. The Razor library ships through NuGet; putting .razor and a second copy of
 * kapehan.css in the npm tarball would grow it for consumers who cannot use either.
 * Declared explicitly rather than omitted so the intent is on the record.
 */
export const pkg = { exports: {}, files: [] };

const INTEROP = 'kapehan.interop.js';

/* ------------------------------------------------------------------ helpers */

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** A Razor comment ends at the first `*@`, so any in the prose would truncate the file. */
const razorComment = (s) => String(s).replace(/\*@/g, '* @');
const csString = (s) =>
  '"' +
  String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t') +
  '"';

/**
 * Whether a props-table default is an actual value. The canvas writes a lone dash where
 * there is none, so anything without a letter, digit, quote or bracket is that placeholder
 * and must not be repeated as "Canvas default: ...".
 */
const hasDefault = (d) => Boolean(d) && /[A-Za-z0-9"'[(]/.test(d);

/**
 * The component's file name, taken from the `@* KapeButton.razor *@` line the canvas
 * snippet opens with. Guessing it from the key instead would rename KapeMenuRow to
 * KapeRow and silently break every consumer's markup on the next canvas edit.
 */
function fileNameOf(snippet, key) {
  const m = snippet.match(/^@\*\s*([A-Za-z0-9_]+\.razor)\b/);
  if (!m) throw new Error(`component "${key}": the blazor snippet does not open with @* <Name>.razor *@`);
  return m[1];
}

/**
 * Prop descriptions from the manifest, keyed by the .razor parameter they document.
 *
 * The two sides do not share a naming convention: the canvas props table is the framework
 * neutral one (modelValue, onChange), while the Blazor snippet uses the .NET names (Value,
 * ValueChanged). Mapping is best-effort by design. An unmatched prop is left undocumented
 * rather than attached to whichever parameter came closest, because a doc comment on the
 * wrong parameter is worse than none.
 */
/**
 * Canvas descriptions that the Blazor port cannot keep, with what it does instead.
 *
 * These become XML docs in the shipped .nupkg, which is the consumer's IntelliSense and so
 * the contract they code against. The canvas says OnClose fires on "cancel, backdrop or
 * Escape". Escape now does fire it (rewrite 5), the cancel and close buttons always did,
 * but a backdrop click on a native <dialog> is not a dismissal at all without JS or
 * closedby="any", so that word would be a promise the package does not keep.
 *
 * `was` is matched exactly. If the canvas rewords the trigger list this override quietly
 * stops applying, which is deliberate: it does not fail the build over prose, and check()
 * below fails on any surviving Escape or backdrop claim the markup cannot back.
 */
const DESCRIPTION_FIXES = [
  {
    key: 'dialog',
    param: 'OnClose',
    was: 'Fired by cancel, backdrop or Escape',
    now: 'Fired by the cancel button or by Escape',
  },
  {
    key: 'drawer',
    param: 'OnClose',
    was: 'Fired by the close button, backdrop or Escape',
    now: 'Fired by the close button or by Escape',
  },
];

function docsFor(component) {
  const pascal = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const out = new Map();
  for (const p of component.props) {
    const names = new Set([pascal(p.name)]);
    if (p.name === 'modelValue') names.add('Value');
    const on = p.name.match(/^on([A-Z].*)$/);
    if (on) {
      names.add('On' + on[1]);
      names.add(on[1] + 'Changed');
      if (on[1] === 'Change') names.add('ValueChanged');
    }
    for (const n of names) if (!out.has(n)) out.set(n, p);
  }
  for (const f of DESCRIPTION_FIXES) {
    if (f.key !== component.key) continue;
    const p = out.get(f.param);
    if (p?.description === f.was) out.set(f.param, { ...p, description: f.now });
  }
  return out;
}

const PARAM_LINE = /^(\s*)(\[Parameter(?:\([^)]*\))?(?:\s*,\s*EditorRequired)?\]\s*public\s+.+?\s+(\w+)\s*\{\s*get;)/;

/** Hangs the manifest's prop description off the matching [Parameter], as real XML docs. */
function annotate(snippet, docs) {
  return snippet
    .split('\n')
    .flatMap((line) => {
      const m = line.match(PARAM_LINE);
      if (!m) return [line];
      const p = docs.get(m[3]);
      if (!p) return [line];
      const indent = m[1];
      const doc = [`${indent}/// <summary>${xml(p.description)}.</summary>`];
      if (hasDefault(p.default)) doc.push(`${indent}/// <remarks>Canvas default: <c>${xml(p.default)}</c>.</remarks>`);
      return [...doc, line];
    })
    .join('\n');
}

function header(c, file) {
  const bullets = (label, list) =>
    list.map((x, i) => `      ${i === 0 ? label : ' '.repeat(label.length)}${razorComment(x)}`).join('\n');
  const props = c.props.map((p) => `      ${p.name}${p.required ? '*' : ''}: ${razorComment(p.type)}`).join('\n');
  return `@*
  ${file}: Kapehan "${razorComment(c.label)}" (${c.cat}).

  GENERATED from kapehan-components.js by scripts/generators/blazor.mjs. Do not edit by
  hand; edit design/Kapehan.dc.html and run \`npm run build\`. npm test fails if this drifts.

  Styling comes entirely from kapehan.css. Reference it once in the host app:
      <link rel="stylesheet" href="_content/${PACKAGE_ID}/kapehan.css" />

  Props (* = required):
${props || '      none'}

  Accessibility contract:
${bullets('roles: ', c.a11y.roles)}
${bullets('attrs: ', c.a11y.attrs)}
${bullets('keys:  ', c.a11y.keys)}
*@
`;
}

/** The canvas snippet, minus its own filename banner and interop transcript. */
function body(snippet) {
  let out = snippet.replace(/^@\*[^*]*\*@\n?/, '');
  // Drop any trailing razor comment that transcribes the interop file; it is generated.
  out = out.replace(/\n@\*\s*wwwroot\/kapehan\.interop\.js[\s\S]*?\*@\s*$/, '\n');
  // An RCL serves its static assets from _content/<PackageId>/, never from the page root.
  out = out.replace(/(["'])\.\/kapehan\.interop\.js\1/g, `"./_content/${PACKAGE_ID}/${INTEROP}"`);
  return out.trimEnd() + '\n';
}

/* ------------------------------------------------------------------ canvas rewrites */

/**
 * Where the @code block starts. Everything above it is rendered during prerender; below it
 * is C# the render tree only reaches through something the markup names.
 */
function codeAt(text) {
  const at = text.search(/^@code\s*\{/m);
  return at === -1 ? text.length : at;
}

/** The index just past the block opened before `from`, tracking nesting. */
function blockEnd(text, from) {
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      if (depth === 0) return i;
      depth--;
    }
  }
  return text.length;
}

const REQUIRED_MODEL_PARAM =
  /\[Parameter,\s*EditorRequired\]\s*public\s+([A-Z]\w*)\s+(\w+)\s*\{\s*get;\s*set;\s*\}\s*=\s*default!;/g;

/**
 * Rewrite 3. A required reference parameter renders nothing rather than throwing.
 *
 * `= default!` is a promise the consumer's compiler does not keep: EditorRequired is a
 * warning in their project, so `<KapeCard />` compiles, reaches the markup with a null Item
 * and throws NullReferenceException out of BuildRenderTree. The parameter becomes nullable,
 * which is what it actually is, and the markup moves inside a null guard, which is what
 * <KapeIcon> already does with a name it cannot resolve.
 */
function guardRequiredModels(text, file) {
  const split = codeAt(text);
  const guarded = [];
  const code = text.slice(split).replace(REQUIRED_MODEL_PARAM, (_, type, name) => {
    guarded.push(name);
    return `[Parameter, EditorRequired] public ${type}? ${name} { get; set; }`;
  });
  if (!guarded.length) return text;

  const markup = text.slice(0, split);
  const needed = guarded.filter((n) => new RegExp(`\\b${n}\\.`).test(markup));
  if (!needed.length) return markup + code;

  const lines = markup.replace(/\s+$/, '').split('\n');
  let head = 0;
  for (const l of lines) {
    if (l.trim() === '' || /^@(?:inject|implements|using|inherits|typeparam|attribute|layout|page)\b/.test(l)) head++;
    else break;
  }
  const guard = needed.map((n) => `${n} is not null`).join(' && ');
  const wrapped = [
    ...lines.slice(0, head),
    `@* A consumer's first move is dropping the tag in with no attributes, and EditorRequired`,
    `   is a warning in their project rather than an error, so a missing ${needed.join(' or ')} renders`,
    `   nothing here instead of throwing through the whole render tree. *@`,
    `@if (${guard})`,
    '{',
    ...lines.slice(head).map((l) => (l.trim() === '' ? l : '    ' + l)),
    '}',
    '',
    '',
  ];
  return wrapped.join('\n') + code;
}

/**
 * Rewrite 4. An id lookup that misses renders nothing rather than throwing.
 *
 * The canvas writes these as `options.find(o => o.id === id)`, which yields undefined, and
 * the Vue generator keeps that with `?.`. `Enumerable.First` is not that function: it
 * throws InvalidOperationException. Options loaded from a service while Value comes from
 * saved state means one render with a populated Value and an empty Options, which is
 * ordinary rather than exceptional.
 */
function nullSafeLookups(text, file) {
  const decl = /^([ \t]*)var (\w+) = ([\w.]+)\.First\(/m;
  let out = text;
  for (let m = out.match(decl); m; m = out.match(decl)) {
    const at = m.index;
    out = out.slice(0, at) + m[0].replace('.First(', '.FirstOrDefault(') + out.slice(at + m[0].length);

    const name = m[2];
    const stmt = out.indexOf(';', at) + 1;
    if (stmt === 0) throw new Error(`${file}: the ${name} lookup has no terminating semicolon`);
    const end = blockEnd(out, stmt);

    let uses = 0;
    const scoped = out.slice(stmt, end).replace(new RegExp(`\\b${name}\\.`, 'g'), () => {
      uses++;
      return `${name}?.`;
    });
    // A lookup nobody reads would mean the scan found the wrong block, and leaving a
    // non-null read of a now-nullable local is the bug this rewrite exists to remove.
    if (!uses) throw new Error(`${file}: ${name} is looked up with First() but never read in its own block`);
    out = out.slice(0, stmt) + scoped + out.slice(end);
  }
  return out;
}

/**
 * Rewrite 5. The native <dialog> dismissals report back to the parent.
 *
 * Escape closes a modal <dialog> in the DOM with no involvement from Blazor. Nothing was
 * listening, so the parent's Open stayed true, _shown stayed true, and the component could
 * never be reopened. cancel now reports the dismissal the same way the close button does,
 * and close resyncs _shown so the state the component holds is the state the DOM is in.
 */
function bindNativeDismissal(text, file) {
  if (!/<dialog\b[^>]*@ref="_el"/.test(text)) return text;

  const report = /\[Parameter\]\s*public\s+EventCallback\s+OnClose\b/.test(text)
    ? 'OnClose.InvokeAsync()'
    : /\[Parameter\]\s*public\s+EventCallback<bool>\s+OpenChanged\b/.test(text)
      ? 'OpenChanged.InvokeAsync(false)'
      : null;
  // Nothing to report a dismissal through is not a bug to paper over here; it is a
  // component whose parent cannot be told, and check() below is where that is judged.
  if (!report) return text;
  if (!/\b_shown\b/.test(text)) throw new Error(`${file}: a <dialog> with a close callback has no _shown gate to resync`);

  const bound = text.replace('@ref="_el"', '@ref="_el" @oncancel="OnNativeCancel" @onclose="OnNativeClose"');
  if (bound === text) throw new Error(`${file}: could not bind the native dialog events`);

  const close = bound.lastIndexOf('\n}');
  if (close === -1) throw new Error(`${file}: the @code block does not close, so the dismissal handlers have nowhere to go`);
  const handlers = `
    // Escape closes the element in the DOM without telling Blazor. cancel reports that the
    // way the close button does; close resyncs _shown, so the next Open still shows.
    private Task OnNativeCancel() => ${report};

    private void OnNativeClose() => _shown = false;
`;
  return bound.slice(0, close + 1) + handlers + bound.slice(close + 1);
}

/**
 * Rewrite 6. The DotNetObjectReference and the JS subscription handle are both released.
 *
 * The canvas passes `DotNetObjectReference.Create(this)` straight into InvokeVoidAsync,
 * which throws away both: the reference is never disposed, and the handle bindHotkey
 * returns is discarded, so the window keydown listener outlives the component. Under Blazor
 * Server, navigating away and back leaves one dead instance per mount and Ctrl+K fires
 * Toggle on all of them. Only functions the interop file actually returns a handle from are
 * rewritten, so this cannot invent a handle that does not exist.
 */
function captureInteropHandles(text, file, handleReturning) {
  if (!/DotNetObjectReference\.Create\(this\)/.test(text)) return text;

  const call = /^([ \t]*)await (_\w+)\.InvokeVoidAsync\("(\w+)", DotNetObjectReference\.Create\(this\)([^;]*)\);$/m;
  const m = text.match(call);
  if (!m) throw new Error(`${file}: a DotNetObjectReference is created but not in a call this can rewrite`);
  const [, indent, module, fn, rest] = m;
  if (!handleReturning.has(fn)) {
    throw new Error(`${file}: ${fn}() in ${INTEROP} returns no handle, so its listener can never be removed`);
  }
  if (!/@implements IAsyncDisposable/.test(text)) throw new Error(`${file}: creates a DotNetObjectReference without implementing IAsyncDisposable`);

  const cls = file.replace(/\.razor$/, '');
  let out =
    text.slice(0, m.index) +
    `${indent}_self = DotNetObjectReference.Create(this);\n` +
    `${indent}_subscription = await ${module}.InvokeAsync<IJSObjectReference>("${fn}", _self${rest});` +
    text.slice(m.index + m[0].length);

  const field = `    private IJSObjectReference? ${module};`;
  if (!out.includes(field)) throw new Error(`${file}: no ${module} field to hang the handle fields off`);
  out = out.replace(
    field,
    `${field}\n    private IJSObjectReference? _subscription;\n    private DotNetObjectReference<${cls}>? _self;`,
  );

  const sig = out.indexOf('public async ValueTask DisposeAsync()');
  if (sig === -1) throw new Error(`${file}: implements IAsyncDisposable with no DisposeAsync to extend`);
  const open = out.indexOf('{', sig);
  const end = blockEnd(out, open + 1);
  const body = `public async ValueTask DisposeAsync()
    {
        // bindHotkey listens for the life of the component, not the page, so the handle it
        // returns has to be used. A circuit that has already gone is the ordinary way this
        // runs, and JSDisconnectedException there is not worth throwing out of teardown.
        try
        {
            if (_subscription is not null)
            {
                await _subscription.InvokeVoidAsync("dispose");
                await _subscription.DisposeAsync();
            }

            if (${module} is not null)
            {
                await ${module}.DisposeAsync();
            }
        }
        catch (JSDisconnectedException)
        {
        }

        _self?.Dispose();
    }`;
  return out.slice(0, sig) + body + out.slice(end + 1);
}

/** Every rewrite, in order. Each one asserts rather than quietly leaving the snippet as-is. */
function fixups(text, file) {
  let out = guardRequiredModels(text, file);
  out = nullSafeLookups(out, file);
  out = bindNativeDismissal(out, file);
  out = captureInteropHandles(out, file, handleReturning());
  return out;
}

/* ------------------------------------------------------------------ fixed files */

const IMPORTS = `@* GENERATED by scripts/generators/blazor.mjs. Do not edit by hand. *@
@using System
@using System.Collections.Generic
@using System.Globalization
@using System.Linq
@using System.Threading
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using Microsoft.AspNetCore.Components.Forms
@using Microsoft.AspNetCore.Components.Rendering
@using Microsoft.AspNetCore.Components.Routing
@using Microsoft.AspNetCore.Components.Web
@using Microsoft.JSInterop
@using ${PACKAGE_ID}
`;

/**
 * One file serving both shapes the canvas snippets ask for: a module with named exports
 * (the command palette imports it) and window.kapehan globals (the dialog and drawer call
 * those directly). Splitting them into two files would mean two <script> stories for one
 * package, and the dialog snippet would need a module import it does not have.
 */
const INTEROP_JS = `/**
 * Kapehan Blazor interop: the four calls that genuinely need JavaScript.
 *
 * <dialog>.showModal() has no managed equivalent, so it is the only reason this file
 * exists. Every caller is behind an OnAfterRenderAsync gate, because during prerender
 * there is no JS runtime at all and an unguarded call throws there.
 *
 * GENERATED by scripts/generators/blazor.mjs. Do not edit by hand.
 * MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan
 */
export function showModal(el) {
  if (el && !el.open) el.showModal();
}

export function closeModal(el) {
  if (el && el.open) el.close();
}

export function focus(el) {
  if (el) el.focus();
}

/**
 * Ctrl or Cmd plus <key> calls back into the component. The listener belongs to the
 * component that bound it, not to the page: a Blazor Server circuit that navigates away and
 * back mounts a second palette, and without the handle below the first one keeps listening
 * forever with a DotNetObjectReference nobody can release.
 *
 * The handle goes back through createJSObjectReference so the caller can hold it as an
 * IJSObjectReference and call dispose() on it. A plain object would serialise to {}, and
 * every consumer would get the leak with no way to see it.
 */
export function bindHotkey(dotnet, key) {
  const onKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key) {
      e.preventDefault();
      dotnet.invokeMethodAsync('Toggle');
    }
  };
  window.addEventListener('keydown', onKey);
  return DotNet.createJSObjectReference({
    dispose: () => window.removeEventListener('keydown', onKey),
  });
}

// The dialog and drawer components call these as globals rather than importing a module,
// so the same four functions are published both ways.
window.kapehan = window.kapehan || {};
window.kapehan.dialog = { show: showModal, close: closeModal };
window.kapehan.focus = focus;
`;

/**
 * The handles ${INTEROP} hands back, read out of the file this generator writes rather than
 * described twice: for each exporting function, the methods on the object it returns, what
 * each of those methods does, and whether the function bound a listener that one of them
 * has to remove.
 *
 * All three matter to a caller. A caller that ignores the handle leaks a listener. A caller
 * that holds it and invokes a name this object does not carry leaks the same listener while
 * looking like it released it, and nothing in C# can see that, because the name is a string.
 */
function interopHandles(src = INTEROP_JS) {
  const out = new Map();
  for (const m of src.matchAll(/export function (\w+)\s*\([^)]*\)\s*\{/g)) {
    const fnBody = src.slice(m.index, blockEnd(src, m.index + m[0].length));
    const at = fnBody.indexOf('DotNet.createJSObjectReference(');
    if (at === -1) continue;
    const open = fnBody.indexOf('{', at);
    if (open === -1) throw new Error(`${INTEROP}: ${m[1]}() returns a handle that is not an object literal`);
    const literal = fnBody.slice(open + 1, blockEnd(fnBody, open + 1));

    const methods = new Map();
    const keys = [...literal.matchAll(/(?:^|,)\s*(\w+)\s*:/g)];
    keys.forEach((k, i) => {
      const from = k.index + k[0].length;
      const to = i + 1 < keys.length ? keys[i + 1].index : literal.length;
      methods.set(k[1], literal.slice(from, to));
    });
    if (!methods.size) throw new Error(`${INTEROP}: the handle ${m[1]}() returns carries no methods`);
    out.set(m[1], { methods, binds: /addEventListener\(/.test(fnBody) });
  }
  return out;
}

/** Just the names, which is all the rewrite needs. */
function handleReturning(src = INTEROP_JS) {
  return new Set(interopHandles(src).keys());
}

function iconComponent() {
  return `@* GENERATED by scripts/generators/blazor.mjs from kapehan-icons.js. Do not edit by hand. *@
@*
  <KapeIcon Name="barako" /> renders the one-colour build, which inherits currentColor.
  <KapeIcon Name="barako" Colour /> renders the full-colour build.

  The body is build-time data out of kapehan-icons.js, never anything a caller supplies,
  which is why MarkupString is safe here. An unknown name renders nothing rather than
  throwing, matching <kape-icon> in the browser package.
*@
@if (_icon is not null)
{
    <svg width="@Px" height="@Px" viewBox="0 0 48 48" fill="none" role="img"
         aria-label="@_icon.Value.Label" aria-hidden="@AriaHidden" @attributes="Extra">@Body</svg>
}

@code {
    /// <summary>Icon name or alias, e.g. <c>barako</c> or <c>shot</c>.</summary>
    [Parameter, EditorRequired] public string Name { get; set; } = "";

    /// <summary>Rendered width and height in px. Non-positive values fall back to 24.</summary>
    [Parameter] public int Size { get; set; } = 24;

    /// <summary>Render the full-colour build. Off by default, so the icon inherits text colour.</summary>
    [Parameter] public bool Colour { get; set; }

    /// <summary>Hide from assistive tech, for an icon that only repeats adjacent text.</summary>
    [Parameter] public bool Decorative { get; set; }

    /// <summary>Anything else lands on the svg element.</summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public IReadOnlyDictionary<string, object>? Extra { get; set; }

    private KapeIconData? _icon;

    protected override void OnParametersSet() => _icon = KapeIcons.Find(Name);

    private int Px => Size > 0 ? Size : 24;
    private string? AriaHidden => Decorative ? "true" : null;
    private MarkupString Body => (MarkupString)(_icon is null ? "" : Colour ? _icon.Value.Body : _icon.Value.Mono);
}
`;
}

function iconData() {
  const entries = icons
    .map(
      (i) =>
        `        new(${csString(i.name)}, ${csString(i.name.replace(/-/g, ' '))}, new[] { ${i.aliases
          .map(csString)
          .join(', ')} },\n` +
        `            ${csString(stripHints(i.body).trim())},\n` +
        `            ${csString(stripHints(monoOf(i)).trim())}),`,
    )
    .join('\n');

  return `// <auto-generated />
//
// The ${icons.length} Kapehan icons, both tracks.
//
// GENERATED from kapehan-icons.js by scripts/generators/blazor.mjs. Do not edit by hand;
// edit kapehan-icons.js and run \`npm run build\`. npm test fails if this drifts.
//
// MIT (c) BaryoDev. https://github.com/BaryoDev/Kapehan

// <auto-generated /> turns the nullable context off for this file no matter what the
// project says, so Find(string?) would warn without this line.
#nullable enable

using System;
using System.Collections.Generic;

namespace ${PACKAGE_ID};

/// <summary>One icon: the full-colour body and the currentColor body, plus its aliases.</summary>
/// <param name="Name">Canonical name, e.g. <c>cup-cold</c>.</param>
/// <param name="Label">Human label used as the SVG's aria-label.</param>
/// <param name="Aliases">Other names that resolve to this icon.</param>
/// <param name="Body">Full-colour SVG children.</param>
/// <param name="Mono">One-colour SVG children, every fill and stroke flattened to currentColor.</param>
public readonly record struct KapeIconData(
    string Name,
    string Label,
    IReadOnlyList<string> Aliases,
    string Body,
    string Mono);

/// <summary>The icon set. Lookup is by name or alias, and never throws on a miss.</summary>
public static class KapeIcons
{
    /// <summary>Every icon, in canvas order.</summary>
    public static readonly IReadOnlyList<KapeIconData> All = new KapeIconData[]
    {
${entries}
    };

    private static readonly Dictionary<string, KapeIconData> Index = BuildIndex();

    private static Dictionary<string, KapeIconData> BuildIndex()
    {
        var map = new Dictionary<string, KapeIconData>(StringComparer.Ordinal);
        foreach (var icon in All)
        {
            map[icon.Name] = icon;
        }

        // Names win over aliases. kapehan-icons.js already fails the build on a collision,
        // so this only decides the order, not who is right.
        foreach (var icon in All)
        {
            foreach (var alias in icon.Aliases)
            {
                if (!map.ContainsKey(alias))
                {
                    map[alias] = icon;
                }
            }
        }

        return map;
    }

    /// <summary>Look an icon up by name or alias. Returns null when there is no match.</summary>
    public static KapeIconData? Find(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }

        return Index.TryGetValue(name.Trim(), out var icon) ? icon : null;
    }

    /// <summary>Every name and alias that <see cref="Find"/> resolves.</summary>
    public static IReadOnlyCollection<string> Names => Index.Keys;
}
`;
}

function readme(comps) {
  const list = comps.map((c) => `| \`<${c.file.replace('.razor', '')}>\` | ${c.cat} | ${c.label} |`).join('\n');
  return `# ${PACKAGE_ID}

Hand-drawn coffee-shop UI for Blazor: ${comps.length} components and ${icons.length} icons, styled
entirely by CSS variables. No JavaScript except \`<dialog>.showModal()\`, no data fetching,
no hard-coded colour anywhere.

\`\`\`sh
dotnet add package ${PACKAGE_ID}
\`\`\`

Reference the stylesheet once, in \`App.razor\` or \`index.html\`:

\`\`\`html
<link rel="stylesheet" href="_content/${PACKAGE_ID}/kapehan.css" />
\`\`\`

The dialog, drawer and command palette need one script for \`showModal()\`:

\`\`\`html
<script type="module" src="_content/${PACKAGE_ID}/${INTEROP}"></script>
\`\`\`

Then:

\`\`\`razor
@using ${PACKAGE_ID}

<KapeButton Label="Order now" Variant="primary" Icon="barako" OnClick="Order" />
<KapeIcon Name="cup-cold" Size="32" Colour />
\`\`\`

## Theming

Every component reads CSS variables, so a palette is six declarations:

\`\`\`css
:root {
  --paper: #FFF7EC;
  --surface: #FFFFFF;
  --ink: #241A13;
  --accent: #A3663B;
  --pop: #D98E4A;
  --on-accent: #FFF7EC;
}
\`\`\`

The 28 palettes on the site are the same six keys. \`palettes.json\` in the npm package
carries them all.

## Components

| Tag | Group | Name |
| --- | --- | --- |
${list}

## Prerendering

\`KapeDialog\`, \`KapeDrawer\` and \`KapeCommandPalette\` inject \`IJSRuntime\`. Every interop
call is behind an \`OnAfterRenderAsync\` gate, so server prerendering, which has no JS
runtime, does not touch them. Nothing else in the package needs JavaScript.

## Licence

MIT (c) BaryoDev. Source: <https://github.com/BaryoDev/Kapehan>
`;
}

/* ------------------------------------------------------------------ artifacts */

/** Every component with its resolved file name, shared by artifacts() and check(). */
async function plan() {
  const comps = await components();
  return comps.map((c) => ({ ...c, file: fileNameOf(c.blazor, c.key) }));
}

export async function artifacts() {
  const out = new Map();
  const comps = await plan();

  const seen = new Map();
  for (const c of comps) {
    if (seen.has(c.file)) throw new Error(`components "${seen.get(c.file)}" and "${c.key}" both claim ${c.file}`);
    seen.set(c.file, c.key);
    out.set(`${DIR}/${c.file}`, header(c, c.file) + '\n' + annotate(fixups(body(c.blazor), c.file), docsFor(c)));
  }

  out.set(`${DIR}/_Imports.razor`, IMPORTS);
  out.set(`${DIR}/KapeIcon.razor`, iconComponent());
  out.set(`${DIR}/KapeIcons.g.cs`, iconData());
  out.set(`${DIR}/README.md`, readme(comps));

  // Static web assets. A consumer reaches these at _content/Kapehan.Components/<path>.
  out.set(`${DIR}/wwwroot/kapehan.css`, await readFile(join(root, 'kapehan.css'), 'utf8'));
  out.set(`${DIR}/wwwroot/${INTEROP}`, INTEROP_JS);
  for (const icon of icons) {
    out.set(`${DIR}/wwwroot/icons/${icon.name}.svg`, wrap(icon.name, icon.body, 48));
    out.set(`${DIR}/wwwroot/icons/mono/${icon.name}.svg`, wrap(icon.name, monoOf(icon), 24));
  }

  return out;
}

/* ------------------------------------------------------------------ gates */

/**
 * Every name in the file that can reach the JS runtime, followed through assignment.
 *
 * Matching the injected name textually was not enough. A field declared `IJSRuntime? _js`
 * and assigned from the injected one in OnInitializedAsync is the same runtime under a
 * different name, and the receiver set that only knew `@inject IJSRuntime JS` plus
 * IJSObjectReference fields read that as no interop at all. So the seed is every
 * declaration of a runtime or a module handle, whatever the shape of the declaration, and
 * then assignment is followed to a fixpoint: `_js = JS`, `var js = JS`, a module handle
 * copied to a local, all of them land in the set.
 */
function interopReceivers(text) {
  const names = new Set();
  const DECL = /\bIJS(?:Runtime|InProcessRuntime|ObjectReference|InProcessObjectReference)\s*\??\s+([A-Za-z_]\w*)\b/g;
  for (const m of text.matchAll(DECL)) names.add(m[1]);
  for (const m of text.matchAll(/@inject\s+IJSRuntime\s+([A-Za-z_]\w*)/g)) names.add(m[1]);

  const ASSIGN = /(?:^|[;{}\n(,]|\bvar\s+)\s*([A-Za-z_]\w*)\s*=\s*(?:await\s+)?([A-Za-z_]\w*)\s*[;,)]/g;
  for (let grew = true; grew; ) {
    grew = false;
    for (const m of text.matchAll(ASSIGN)) {
      if (names.has(m[2]) && !names.has(m[1])) {
        names.add(m[1]);
        grew = true;
      }
    }
  }
  return names;
}

/**
 * A regex matching any use of the JS runtime in a file, or null when it has none.
 *
 * Two shapes count, because two shapes reach JavaScript. A member access on a receiver is
 * the ordinary call, and it is written `.Invoke*Async` today but an extension method
 * tomorrow, so the member name is not part of the test. A receiver passed as an argument is
 * a call this file cannot see the inside of, and a helper that takes IJSRuntime and does
 * the interop itself is exactly as fatal during prerender as doing it here.
 *
 * What is deliberately not matched is a receiver on its own: `if (_module is null)` is the
 * null check that makes prerender safe, not a call.
 */
function interopCalls(text) {
  const names = [...interopReceivers(text)];
  if (!names.length) return null;
  const alt = names.join('|');
  const source = `\\b(${alt})\\s*\\??\\.\\w|[(,]\\s*(${alt})\\s*[,)]`;
  return new RegExp(source).test(text) ? new RegExp(source) : null;
}

/**
 * The markup as prerender sees it: comments dropped, and event handler attributes dropped
 * with them. A handler is a name the markup mentions but prerender never calls, so counting
 * it as reached would fail every component that touches JS from a click.
 */
function prerenderMarkup(markup) {
  return markup.replace(/@\*[\s\S]*?\*@/g, ' ').replace(/@on[a-zA-Z]+(?::\w+)?="[^"]*"/g, ' ');
}

/** Methods and computed properties in the @code block, with their bodies. */
function membersOf(code) {
  const out = new Map();
  const re = /^[ \t]+(?:\[[^\]]*\]\s*)*(?:public|private|protected|internal)\s[^\n;{}=]*?\b(\w+)\s*(?:\([^)]*\))?\s*(=>|\{)/gm;
  for (const m of code.matchAll(re)) {
    const start = m.index + m[0].length;
    let body;
    if (m[2] === '{') {
      body = code.slice(start, blockEnd(code, start));
    } else {
      // expression bodied: to the semicolon that ends the statement, not one inside a string
      let i = start;
      let quote = null;
      for (; i < code.length; i++) {
        const ch = code[i];
        if (quote) {
          if (ch === '\\') i++;
          else if (ch === quote) quote = null;
          continue;
        }
        if (ch === '"' || ch === "'") quote = ch;
        else if (ch === ';') break;
      }
      body = code.slice(start, i);
    }
    out.set(m[1], out.has(m[1]) ? `${out.get(m[1])}\n${body}` : body);
  }
  return out;
}

/** Lifecycle members that have run by the time prerendered HTML exists. */
const BEFORE_FIRST_RENDER = [
  'SetParametersAsync',
  'OnInitialized',
  'OnInitializedAsync',
  'OnParametersSet',
  'OnParametersSetAsync',
  'ShouldRender',
];

/**
 * Every member prerender can arrive at, following calls rather than file order.
 *
 * Roots are the lifecycle methods that run before the first render plus whatever the markup
 * names, since the markup is what prerendering evaluates. A helper is reached if something
 * reached names it, wherever in the file it happens to be declared.
 */
function reachableBeforeFirstRender(markup, members) {
  const seen = new Set();
  const queue = [];
  for (const name of BEFORE_FIRST_RENDER) if (members.has(name)) queue.push(name);
  for (const m of prerenderMarkup(markup).matchAll(/[A-Za-z_]\w*/g)) if (members.has(m[0])) queue.push(m[0]);

  while (queue.length) {
    const name = queue.pop();
    if (seen.has(name)) continue;
    seen.add(name);
    for (const m of members.get(name).matchAll(/[A-Za-z_]\w*/g)) if (members.has(m[0]) && !seen.has(m[0])) queue.push(m[0]);
  }
  return seen;
}

/**
 * Razor comments blanked to spaces of the same length, so offsets still line up.
 *
 * Every gate below reads the markup by position. Deleting a comment would shift everything
 * after it; a gate that then found `@oncancel=` inside a comment and called the element
 * bound is the shape of blindness this file keeps producing.
 */
function blankComments(text) {
  return text.replace(/@\*[\s\S]*?\*@/g, (m) => ' '.repeat(m.length));
}

/** The index just past the `)` that closes the `(` at `open`, strings respected. */
function parensEnd(text, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i + 1;
  }
  return text.length;
}

/** The index just past a Razor expression whose `@` sits at `at`. */
function razorExpressionEnd(text, at) {
  let i = at + 1;
  if (text[i] === '(') return parensEnd(text, i);
  while (i < text.length && /[\w.]/.test(text[i])) i++;
  return text[i] === '(' ? parensEnd(text, i) : i;
}

/**
 * One attribute value, starting at the first character after the `=`.
 *
 * Razor writes these three ways and this package uses all three: quoted ("barako",
 * "@Item.Icon"), an unquoted Razor expression (Name=@("cup-cold")), and a bare token
 * (Size=24). A reader that insists on a quote sees only the first, which is exactly how a
 * bogus name inside `Name=@(...)` stayed invisible to the icon gate.
 */
function readValue(text, from) {
  const ch = text[from];
  if (ch === '"' || ch === "'") {
    // A quote inside a Razor `@( ... )` belongs to the expression, not to the attribute.
    let depth = 0;
    for (let i = from + 1; i < text.length; i++) {
      const c = text[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ch && depth <= 0) return { value: text.slice(from + 1, i), end: i };
    }
    return null;
  }
  if (ch === '@') {
    const end = razorExpressionEnd(text, from);
    return { value: text.slice(from, end), end: end - 1 };
  }
  let i = from;
  while (i < text.length && !/[\s>/]/.test(text[i])) i++;
  return i === from ? null : { value: text.slice(from, i), end: i - 1 };
}

/**
 * The attributes of the tag opening at `start`, as name to raw value. A valueless attribute
 * (`Colour`, `autofocus`) maps to null, which is not the same as absent.
 */
function tagAttributes(text, start) {
  const out = new Map();
  let i = start + 1;
  while (i < text.length && /[\w.:-]/.test(text[i])) i++;
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i++;
    if (i >= text.length || text[i] === '>' || (text[i] === '/' && text[i + 1] === '>')) break;

    const nameAt = i;
    while (i < text.length && /[@\w.:-]/.test(text[i])) i++;
    if (i === nameAt) {
      i++;
      continue;
    }
    const attr = text.slice(nameAt, i);

    let j = i;
    while (j < text.length && /\s/.test(text[j])) j++;
    if (text[j] !== '=') {
      out.set(attr, null);
      continue;
    }
    j++;
    while (j < text.length && /\s/.test(text[j])) j++;
    const read = readValue(text, j);
    if (!read) {
      out.set(attr, null);
      i = j + 1;
      continue;
    }
    out.set(attr, read.value);
    i = read.end + 1;
  }
  return out;
}

/**
 * String literals an expression can produce, which is every literal in it except the
 * operands of a comparison. `Tone == "warn" ? "coffee-bean" : "coffee-cup"` names two icons
 * and one tone, and only the two icons have to exist.
 */
function resultLiterals(expr) {
  const out = [];
  for (const m of expr.matchAll(/"([^"]*)"/g)) {
    const before = expr.slice(0, m.index).trimEnd();
    const after = expr.slice(m.index + m[0].length).trimStart();
    if (/[=!]=$/.test(before) || /^[=!]=/.test(after)) continue;
    if (m[1]) out.push(m[1]);
  }
  return out;
}

/** The literal default of a string [Parameter], which is what renders when nobody sets it. */
function parameterDefault(text, name) {
  const m = text.match(new RegExp(`\\[Parameter[^\\]]*\\]\\s*public\\s+string\\??\\s+${name}\\s*\\{\\s*get;\\s*set;\\s*\\}\\s*=\\s*"([^"]*)"`));
  return m?.[1] ?? null;
}

/**
 * Every icon name a file can be shown to ask for, in all three forms the package uses: the
 * literal attribute, a literal inside an expression, and the default of a parameter handed
 * straight to Name. A name coming off a model (`Name="@Item.Icon"`) is the consumer's data
 * and is not checkable here, so it is left alone rather than guessed at.
 */
function iconClaims(text) {
  const claims = [];
  const t = blankComments(text);
  for (const m of t.matchAll(/<KapeIcon\b/g)) {
    const value = tagAttributes(t, m.index).get('Name');
    if (value == null) continue;

    if (/^[a-z][a-z0-9-]*$/.test(value)) {
      claims.push({ name: value, how: `Name=${value}` });
      continue;
    }
    if (!value.startsWith('@')) continue;
    for (const lit of resultLiterals(value)) claims.push({ name: lit, how: `Name=${value}` });

    // A parameter handed straight to Name renders its own default whenever a consumer sets
    // nothing, so that default is an icon name this package promises. Only the whole
    // expression counts: an identifier used inside one, like the tone a ternary switches
    // on, is not the name being rendered.
    const passed = value.match(/^@\(?([A-Za-z_]\w*)\)?$/);
    const fallback = passed && parameterDefault(text, passed[1]);
    if (fallback) claims.push({ name: fallback, how: `the default of ${passed[1]}, which Name=${value} renders` });
  }
  return claims;
}

/** Each XML doc summary with the declaration it sits on. */
function summaries(text) {
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/\/\/\/ <summary>(.*)<\/summary>/);
    if (!m) continue;
    let j = i + 1;
    while (j < lines.length && lines[j].trim().startsWith('///')) j++;
    out.push([m[1], lines[j] ?? '']);
  }
  return out;
}

/**
 * Whether anything reachable from the member `from` matches `re`.
 *
 * A binding is only worth as much as what it is bound to. `@oncancel="OnNativeCancel"` with
 * an OnNativeCancel that returns Task.CompletedTask is a dialog that still swallows Escape,
 * and a gate that greps for the attribute name calls that fixed.
 */
function reaches(members, from, re) {
  const seen = new Set();
  const queue = [from];
  while (queue.length) {
    const at = queue.pop();
    if (seen.has(at) || !members.has(at)) continue;
    seen.add(at);
    const body = members.get(at);
    if (re.test(body)) return true;
    for (const m of body.matchAll(/[A-Za-z_]\w*/g)) if (members.has(m[0]) && !seen.has(m[0])) queue.push(m[0]);
  }
  return false;
}

/**
 * The handler bound to `event` on the file's own <dialog>, or null.
 *
 * Read off the element, with comments blanked. The attribute appearing anywhere in the file
 * is not the same claim: a commented-out binding, or one on some other element, leaves the
 * dialog exactly as deaf as no binding at all.
 */
function dialogBinding(text, event) {
  const markup = blankComments(text.slice(0, codeAt(text)));
  const at = markup.search(/<dialog\b/);
  if (at === -1) return null;
  const value = tagAttributes(markup, at).get(event);
  return value == null ? null : value.replace(/^@/, '').trim();
}

/** What a close callback firing looks like, whichever of the two names the component has. */
const REPORTS_CLOSE = /\b(?:OnClose|OpenChanged)\s*\.\s*InvokeAsync\b/;

/**
 * Required reference parameters the markup dereferences with nothing guarding them.
 *
 * Rewrite 3 does two things: it makes the parameter nullable and it wraps the markup in a
 * null guard. Only the first half was gated, so dropping the `@if` while leaving the `?`
 * put the NullReferenceException back with a green suite. The guard has to actually cover
 * the dereference, so the block it opens is measured rather than the line being grepped for.
 */
function unguardedRequiredModels(text) {
  const split = codeAt(text);
  const markup = blankComments(text.slice(0, split));
  const code = text.slice(split);
  const bad = new Set();

  for (const m of code.matchAll(/\[Parameter,\s*EditorRequired\]\s*public\s+([A-Z]\w*)\?\s+(\w+)\s*\{\s*get;/g)) {
    const name = m[2];
    const covered = [];
    for (const g of markup.matchAll(new RegExp(`@if\\s*\\(([^)]*\\b${name}\\s+is\\s+not\\s+null[^)]*)\\)`, 'g'))) {
      const open = markup.indexOf('{', g.index + g[0].length);
      if (open !== -1) covered.push([open, blockEnd(markup, open + 1)]);
    }
    for (const use of markup.matchAll(new RegExp(`\\b${name}\\s*\\.`, 'g'))) {
      if (!covered.some(([a, b]) => use.index > a && use.index < b)) bad.add(name);
    }
  }
  return [...bad];
}

/** Types the snippets may name without Models.cs having to define them. */
const FRAMEWORK_TYPES = new Set([
  'string', 'int', 'bool', 'long', 'decimal', 'double', 'object', 'DateOnly', 'DateTime', 'TimeSpan',
  'MarkupString', 'RenderFragment', 'EventCallback', 'ElementReference', 'IJSObjectReference',
  'IBrowserFile', 'InputFileChangeEventArgs', 'MouseEventArgs', 'KeyboardEventArgs', 'ChangeEventArgs',
  'FocusEventArgs', 'KapeIconData', 'Task', 'ValueTask',
]);

export async function check({ expected }) {
  const fail = [];
  const comps = await plan();
  const razor = new Map([...expected].filter(([p]) => p.startsWith(`${DIR}/`) && p.endsWith('.razor')));

  // 1. Every component in the manifest reached a file. A snippet that vanished from the
  //    canvas would otherwise leave the .NET package one component short and still green.
  for (const c of comps) {
    if (!razor.has(`${DIR}/${c.file}`)) fail.push(`component "${c.key}" produced no ${DIR}/${c.file}`);
  }

  // 2. The SSR gate. 0.2.0 shipped a browser-only import that threw on any server that
  //    evaluated it; the .NET shape of that bug is interop during prerender, where there
  //    is no JS runtime. Every injecting component must call JS only after first render.
  //
  //    Reachability, not position. This gate used to compare the offset of a call against
  //    the offset of the string "OnAfterRenderAsync", so interop reached from
  //    OnInitializedAsync through a helper declared further down the file read as safe.
  //    What matters is whether anything the prerender runs can arrive at the call, so the
  //    @code block is walked as a call graph from the members prerendering actually
  //    enters: the lifecycle methods that run before the first render, and whatever the
  //    markup names outside an event handler.
  for (const [path, text] of razor) {
    const calls = interopCalls(text);
    if (!calls) continue;

    if (!/@inject\s+IJSRuntime/.test(text)) {
      fail.push(`${path} calls JavaScript but never injects IJSRuntime`);
      continue;
    }
    if (!/OnAfterRenderAsync\(bool firstRender\)/.test(text)) {
      fail.push(`${path} injects IJSRuntime but has no OnAfterRenderAsync, so interop can run during prerender`);
    }
    if (!/_interactive/.test(text)) {
      fail.push(`${path} injects IJSRuntime with no _interactive gate, so interop can run during prerender`);
    }

    const markup = text.slice(0, codeAt(text));
    const code = text.slice(codeAt(text));
    const members = membersOf(code);
    if (calls.test(prerenderMarkup(markup))) {
      fail.push(`${path} calls JavaScript from its markup, which prerender renders`);
    }
    for (const member of reachableBeforeFirstRender(markup, members)) {
      const hit = members.get(member).match(calls);
      if (hit) fail.push(`${path} reaches the JS runtime through ${hit[1] ?? hit[2]} from ${member}(), which prerender runs before there is a JS runtime`);
    }
  }

  // 3. Icons named in the markup must exist, or the component renders an empty element and
  //    looks fine in a diff. Every form the generated output uses counts, not just the
  //    literal one: a bogus name inside KapeToast's ternary and a bogus C# default on the
  //    parameter KapeStamps passes to Name were both invisible to this gate, which is two
  //    of the three forms in the package.
  const known = new Set(icons.flatMap((i) => [i.name, ...i.aliases]));
  for (const [path, text] of razor) {
    for (const claim of iconClaims(text)) {
      if (!known.has(claim.name)) fail.push(`${path} renders the icon "${claim.name}" through ${claim.how}, which is not an icon or an alias`);
    }
  }

  // 3b. The rewrites in this file, checked in the output rather than assumed. Each one is a
  //     bug that shipped, and each one would come back the moment a rewrite stopped
  //     matching the canvas, which is exactly the kind of silence the rewrite exists to end.
  //
  //     Every gate here is on the thing the rewrite produced, not on a word the rewrite
  //     happens to leave in the file. Two of them used to be the latter, and both passed
  //     clean over the exact bug they were written for: the guard could be deleted as long
  //     as the `?` stayed, and @oncancel could be bound to a handler that reported nothing.
  const handles = interopHandles();
  for (const [path, text] of razor) {
    const code = text.slice(codeAt(text));
    const members = membersOf(code);

    if (/\[Parameter[^\]]*\]\s*public\s+[^\n]*?=\s*default!;/.test(text)) {
      fail.push(`${path} defaults a [Parameter] to default!, and EditorRequired is a warning in the consumer's project, so the bare tag renders a null`);
    }
    for (const name of unguardedRequiredModels(text)) {
      fail.push(`${path} makes the required ${name} nullable but dereferences it outside a null guard, so the bare tag throws through the render tree`);
    }
    if (/\.First\(/.test(text)) {
      fail.push(`${path} looks a row up with .First(), which throws when Value holds an id Options does not carry yet`);
    }

    // A <dialog> the parent can be told about must hear the dismissals Blazor cannot see,
    // and the handler it names must be the one that tells the parent.
    if (/<dialog\b/.test(text) && /\[Parameter\]\s*public\s+EventCallback(?:<bool>)?\s+(?:OnClose|OpenChanged)\b/.test(text)) {
      const cancel = dialogBinding(text, '@oncancel');
      if (!cancel) {
        fail.push(`${path} has a <dialog> and a close callback but the <dialog> binds no @oncancel, so Escape closes it without telling the parent`);
      } else if (!reaches(members, cancel, REPORTS_CLOSE)) {
        fail.push(`${path} binds @oncancel to ${cancel}(), which never reaches OnClose or OpenChanged, so Escape still closes it without telling the parent`);
      }

      const closed = dialogBinding(text, '@onclose');
      if (!closed) {
        fail.push(`${path} has a <dialog> but the <dialog> binds no @onclose, so _shown keeps the state the DOM has already left and the next Open shows nothing`);
      } else if (!reaches(members, closed, /\b_shown\s*=/)) {
        fail.push(`${path} binds @onclose to ${closed}(), which never resyncs _shown, so the next Open shows nothing`);
      }
    }

    // What the .nupkg's XML docs claim is the consumer's IntelliSense, so a trigger named
    // there has to be a trigger the markup binds to something that actually reports it.
    for (const [claim, line] of summaries(text)) {
      if (!/\[Parameter[^\]]*\]\s*public\s+EventCallback/.test(line)) continue;
      if (/\bescape\b/i.test(claim)) {
        const cancel = dialogBinding(text, '@oncancel');
        const heard = (cancel !== null && reaches(members, cancel, REPORTS_CLOSE)) || /@onkeydown=/.test(text);
        if (!heard) fail.push(`${path} documents "${claim}" but nothing it binds reports an Escape`);
      }
      if (/\bbackdrop\b/i.test(claim) && !/closedby=/.test(text) && !/<dialog\b[^>]*@onclick=/.test(text)) {
        fail.push(`${path} documents "${claim}" but a native <dialog> does not dismiss on a backdrop click and nothing here makes it`);
      }
    }

    // An interop function that hands back a dispose handle is a subscription. Dropping the
    // handle leaks a listener per mount, which on Blazor Server is per navigation. Holding
    // it and invoking a name the handle does not carry leaks the same listener while
    // looking released: the method name crosses the language boundary as a string, so
    // nothing but this gate compares the two sides.
    for (const [fn, handle] of handles) {
      if (!text.includes(`"${fn}"`)) continue;
      const held = text.match(new RegExp(`(_\\w+) = await [^;\\n]*InvokeAsync<IJSObjectReference>\\("${fn}"`));
      if (!held) {
        fail.push(`${path} calls ${fn}(), which returns a dispose handle, through a call that throws the handle away`);
        continue;
      }
      const on = held[1];
      const invoked = new Set([...text.matchAll(new RegExp(`${on}\\s*\\??\\.InvokeVoidAsync\\("(\\w+)"`, 'g'))].map((m) => m[1]));
      if (!invoked.size) fail.push(`${path} holds the ${fn}() handle in ${on} but invokes nothing on it`);
      for (const called of invoked) {
        if (!handle.methods.has(called)) {
          fail.push(`${path} calls ${on}.InvokeVoidAsync("${called}") but the handle ${fn}() returns in ${INTEROP} carries only ${[...handle.methods.keys()].join(', ')}`);
        }
      }
      if (handle.binds && ![...invoked].some((c) => /removeEventListener\(/.test(handle.methods.get(c) ?? ''))) {
        fail.push(`${path} calls ${fn}(), which binds a listener, but nothing it invokes on ${on} removes it`);
      }
      if (!new RegExp(`${on}\\s*\\??\\.DisposeAsync\\(\\)`).test(text)) {
        fail.push(`${path} never disposes the ${fn}() handle in ${on}, so the JS object reference outlives the component`);
      }
    }
    if (/DotNetObjectReference\.Create\(this\)/.test(text)) {
      const held = text.match(/(_\w+) = DotNetObjectReference\.Create\(this\)/);
      if (!held) fail.push(`${path} creates a DotNetObjectReference inline, so nothing can dispose it`);
      else if (!new RegExp(`${held[1]}\\??\\.Dispose\\(\\)`).test(text)) fail.push(`${path} never disposes ${held[1]}`);
    }
  }

  // 4. Model types. Models.cs is hand-written because none of it is in the canvas, so a
  //    canvas edit that introduces a new record type has to be noticed here rather than
  //    three weeks later in someone's CI.
  const models = await readFile(join(root, DIR, 'Models.cs'), 'utf8').catch(() => null);
  if (models === null) fail.push(`${DIR}/Models.cs is missing, the generated .razor files will not compile`);
  else {
    const defined = new Set([...models.matchAll(/\b(?:record|class|struct|enum)\s+(?:struct\s+)?(\w+)/g)].map((m) => m[1]));
    const wanted = new Set();
    for (const text of razor.values()) {
      for (const m of text.matchAll(/(?:IReadOnlyList|IEnumerable|List|EventCallback)<\s*([A-Z]\w*)\s*>/g)) wanted.add(m[1]);
      for (const m of text.matchAll(/\[Parameter[^\]]*\]\s*public\s+([A-Z]\w*)\??\s+\w+\s*\{\s*get;/g)) wanted.add(m[1]);
    }
    for (const t of wanted) {
      if (!FRAMEWORK_TYPES.has(t) && !defined.has(t)) {
        fail.push(`${DIR}/Models.cs does not define ${t}, which a generated .razor binds to`);
      }
    }
  }

  // 5. The project file and Directory.Build.props. Both hand-written, and between them
  //    every published promise: the id on nuget.org, the two frameworks CI must both
  //    build, the licence and the readme. Which of the two files carries a given property
  //    is an MSBuild detail, so the properties are checked against the pair. What is not
  //    negotiable is that they are set somewhere before a pack.
  const csproj = await readFile(join(root, DIR, `${PACKAGE_ID}.csproj`), 'utf8').catch(() => null);
  const props = await readFile(join(root, 'Directory.Build.props'), 'utf8').catch(() => null);

  if (csproj === null) fail.push(`${DIR}/${PACKAGE_ID}.csproj is missing`);
  else {
    if (!/<TargetFrameworks>net8\.0;net10\.0<\/TargetFrameworks>/.test(csproj)) {
      fail.push(`${DIR}/${PACKAGE_ID}.csproj must multi-target net8.0;net10.0`);
    }
    if (!/Sdk="Microsoft\.NET\.Sdk\.Razor"/.test(csproj)) fail.push(`${DIR}/${PACKAGE_ID}.csproj is not a Razor class library`);
  }
  if (props === null) fail.push('Directory.Build.props is missing, so the NuGet version has no single home');

  const msbuild = `${csproj ?? ''}\n${props ?? ''}`;
  for (const [what, re] of [
    ['<PackageId>Kapehan.Components</PackageId>', /<PackageId>Kapehan\.Components<\/PackageId>/],
    ['<PackageLicenseExpression>MIT</PackageLicenseExpression>', /<PackageLicenseExpression>MIT<\/PackageLicenseExpression>/],
    ['<PackageReadmeFile>README.md</PackageReadmeFile>', /<PackageReadmeFile>README\.md<\/PackageReadmeFile>/],
    ['<RepositoryUrl>https://github.com/BaryoDev/Kapehan</RepositoryUrl>', /<RepositoryUrl>https:\/\/github\.com\/BaryoDev\/Kapehan<\/RepositoryUrl>/],
    ['a three-part <Version>', /<Version>\d+\.\d+\.\d+/],
  ]) {
    if (csproj !== null && props !== null && !re.test(msbuild)) {
      fail.push(`neither ${DIR}/${PACKAGE_ID}.csproj nor Directory.Build.props sets ${what}`);
    }
  }

  // The readme has to be packed as well as named, or NuGet rejects the push with an error
  // that names the property rather than the missing None item.
  if (csproj !== null && !/<None\s+Include="README\.md"[^>]*Pack="true"/.test(csproj)) {
    fail.push(`${DIR}/${PACKAGE_ID}.csproj names a PackageReadmeFile but never packs README.md`);
  }

  // 7. The publish workflow must build both frameworks. A multi-target build that stops at
  //    the first success is the specific way this goes quiet: net8.0 passes, net10.0 was
  //    never compiled, and the package ships one empty lib/ folder.
  const wf = await readFile(join(root, '.github/workflows/publish-nuget.yml'), 'utf8').catch(() => null);
  if (wf === null) fail.push('.github/workflows/publish-nuget.yml is missing');
  else {
    for (const v of ['8.0.', '10.0.']) {
      if (!wf.includes(v)) fail.push(`.github/workflows/publish-nuget.yml never installs a ${v}x SDK`);
    }
    // Compiling is not the promise. Rendering every component with nothing set, and with no
    // JS runtime, is, and that only happens if the suite actually runs before a publish.
    if (!/dotnet test\b/.test(wf)) {
      fail.push('.github/workflows/publish-nuget.yml never runs dotnet test, so the package can publish with the prerender suite red');
    }
  }

  return fail;
}
