"""
Applies the UI/UX review fixes to a published Kapehan design export.

    python3 design/apply-site-fixes.py <Kapehan.html> [out.html]

The input is the self-contained bundle exported from the Kapehan design project, which is
not tracked here because it is ~3.2 MB of inlined Babel, fonts and JSX. The output is the
same bundle with these changes:

  copy      hero drops the BarakoCMS framing and the Tailwind, Bootstrap, Vue and Blazor
            claims, so the page only advertises what the package ships
  tabs      the seven sections were all rendered at once (every tabXxx flag hardcoded true)
            behind a scroll-spy nav. They become real tabs: one panel, deep links, back and
            forward, arrow keys, and the ARIA a tablist needs
  mobile    390px went from 299px of horizontal overflow to none
  a11y      lang, description, og tags, reduced motion, visible focus, 44px tab targets
  doodles   the laptop <figure> closed after the six figures that follow it, nesting them in
            one grid cell; it now closes after its own <svg>

The bundle keeps its page as a JSON-escaped string on the __bundler/template line and its
sub-canvases as gzipped base64 in the manifest, so both are decoded, patched and re-encoded.

Every edit asserts that it applied. A silent no-op here is indistinguishable from a working
fix by eye, and two of these fixes shipped looking correct while matching nothing.
"""
import json, sys, re, os, base64, gzip

if len(sys.argv) < 2:
    sys.exit(__doc__.strip().split("\n\n")[1].strip())

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "docs/index.html"

lines = open(SRC, encoding="utf-8").read().split("\n")
TPL_LINE = None
for i, ln in enumerate(lines):
    if ln.startswith('"<!DOCTYPE html>'):
        TPL_LINE = i
        break
assert TPL_LINE is not None, "template line not found"

# The manifest is the line right after the <script type="__bundler/manifest"> tag.
MAN_LINE = None
for i, ln in enumerate(lines):
    if '__bundler/manifest' in ln and i + 1 < len(lines) and lines[i + 1].startswith('{"'):
        MAN_LINE = i + 1
        break
assert MAN_LINE is not None, "manifest line not found"
t = json.loads(lines[TPL_LINE])
orig_len = len(t)

applied = []


def sub(old, new, label, count=1):
    """Replace and prove it happened."""
    global t
    n = t.count(old)
    assert n == count, "%s: expected %d occurrence(s) of %r, found %d" % (label, count, old[:70], n)
    t = t.replace(old, new)
    applied.append(label)


def resub(pattern, repl, label, count):
    global t
    t, n = re.subn(pattern, repl, t)
    assert n == count, "%s: expected %d matches, got %d" % (label, count, n)
    applied.append(label)


# ---------------------------------------------------------------- 1. copy
sub(
    ">The front-end starter for BarakoCMS</p>",
    ">Free coffee icons, doodles and parts</p>",
    "hero eyebrow drops the BarakoCMS framing",
)

sub(
    "Barako is the headless CMS; Kapehan is what you put in front of it. Icons, doodles, "
    "drink palettes, primitives and whole screens that all follow one hand, so you can pick a "
    "palette and an edge and have a front end that looks designed without hiring a designer. "
    "Ships as plain CSS, Tailwind or Bootstrap, in HTML, React, Vue or Blazor. "
    "Kapehan is Filipino for coffee house. I just love coffee, that’s all.",
    "Icons, doodles, drink palettes, primitives and whole screens that all follow one hand, so "
    "you can pick a palette and an edge and have a front end that looks designed without hiring "
    "a designer. Ships as plain CSS, in HTML or React. "
    "Kapehan is Filipino for coffee house. I just love coffee, that’s all.",
    "hero body drops the CMS coupling, Tailwind, Bootstrap, Vue and Blazor",
)

# The stack pickers must only offer what the package actually ships.
sub(
    "static CSS_OPTS = { kapehan: 'Plain CSS', tailwind: 'Tailwind', bootstrap: 'Bootstrap' };",
    "static CSS_OPTS = { kapehan: 'Plain CSS' };",
    "CSS_OPTS offers only what ships",
)
sub(
    "static FW_OPTS = { html: 'HTML', react: 'React', vue: 'Vue', blazor: 'Blazor' };",
    "static FW_OPTS = { html: 'HTML', react: 'React' };",
    "FW_OPTS offers only what ships",
)

# ------------------------------------------------- 2. mobile overflow (299px)
# Two segmented rows are flex with no wrap inside a 390px viewport. The page,
# not a scroll container, carried the overflow.
sub(
    '<div style="display:flex;gap:4px;background:var(--k-track);border-radius:10px;padding:4px" data-comment-anchor="2020371584-div">',
    '<div style="display:flex;flex-wrap:wrap;gap:4px;max-width:100%;background:var(--k-track);border-radius:10px;padding:4px" data-comment-anchor="2020371584-div">',
    "category chip row wraps",
)
sub(
    '<div style="display:flex;gap:4px;background:var(--k-track);border-radius:10px;padding:4px">',
    '<div style="display:flex;flex-wrap:wrap;gap:4px;max-width:100%;background:var(--k-track);border-radius:10px;padding:4px">',
    "size chip row wraps",
)

# ------------------------------------------------------------- 3. real tabs
# Every section flag was hardcoded true, so all seven rendered at once and the
# nav could only scroll-spy. Bind them to the selected tab instead.
sub(
    "tabs, tabIcons: true, tabDoodles: true, tabPlace: true, tabPalettes: true, "
    "tabUi: true, tabBlocks: true, tabCreate: true, _tab: tab === 'create',",
    "tabs, tabIcons: tab === 'icons', tabDoodles: tab === 'doodles', tabPlace: tab === 'place', "
    "tabPalettes: tab === 'palettes', tabUi: tab === 'ui', tabBlocks: tab === 'blocks', "
    "tabCreate: tab === 'create', _tab: tab === 'create',",
    "section visibility follows the selected tab",
)

# The active tab comes from selection, not from where the scroll happens to be.
sub(
    "    const tab = this.state.here || 'icons';",
    "    const tab = this.activeTab();",
    "active tab is selection state",
)

sub(
    "      onPick: () => this.jump(key),",
    "      id: 'tab-' + key,\n"
    "      panelId: Component.SECTION_IDS[key],\n"
    "      tabIndex: tab === key ? 0 : -1,\n"
    "      onPick: () => this.select(key),",
    "tab click selects, roving tabindex",
)

# jump()/spy() are replaced by real tab selection with hash routing.
sub(
    """  jump(key) {
    const el = document.getElementById(Component.SECTION_IDS[key]);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 58;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  spy = () => {
    let here = Component.TABS[0][0];
    for (const [key] of Component.TABS) {
      const el = document.getElementById(Component.SECTION_IDS[key]);
      if (el && el.getBoundingClientRect().top <= 140) here = key;
    }
    if (here !== this.state.here) this.setState({ here });
  };
""",
    """  static isTab(k) { return Component.TABS.some(([key]) => key === k); }

  /** The selected tab. Falls back through the URL, storage, the prop, then the first tab. */
  activeTab() {
    if (Component.isTab(this.state.tab)) return this.state.tab;
    return Component.TABS[0][0];
  }

  /** What the URL asks for, if anything. Shareable links are the point of real tabs. */
  static tabFromHash() {
    try {
      const k = (window.location.hash || '').replace(/^#/, '');
      return Component.isTab(k) ? k : null;
    } catch (e) { return null; }
  }

  select = (key, push) => {
    if (!Component.isTab(key) || key === this.activeTab()) return;
    this.setState({ tab: key });
    try { localStorage.setItem('kapehan.tab', key); } catch (e) {}
    if (push !== false) {
      try { window.history.pushState(null, '', '#' + key); } catch (e) {}
    }
    // Land at the top of the new panel, not the top of the document. Sending the reader back
    // above the hero on every switch loses their place; leaving the scroll alone drops them
    // into the middle of a panel they have not seen yet.
    //
    // Measured off the panel, which is a plain block. The nav cannot be used as the anchor:
    // it is position:sticky, so both getBoundingClientRect().top and the offsetTop chain
    // report where it is painted (0 once stuck), not where it sits in the document, and the
    // arithmetic quietly reduces to "scroll to where you already are".
    //
    // Deferred a tick because the panel for the new tab does not exist until React renders.
    setTimeout(() => {
      try {
        const panel = document.getElementById(Component.SECTION_IDS[key]);
        if (!panel) return;
        const top = panel.getBoundingClientRect().top + window.pageYOffset - 58;
        if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'auto' });
      } catch (e) {}
    }, 0);
  };

  _onHash = () => {
    const k = Component.tabFromHash();
    if (k) this.select(k, false);
  };

  /** Arrow keys move between tabs, per the tablist pattern. */
  _onTabKey = (e) => {
    const list = document.getElementById('kapehan-tablist');
    if (!list || !list.contains(e.target)) return;
    const keys = Component.TABS.map(([k]) => k);
    const i = keys.indexOf(this.activeTab());
    let next = null;
    if (e.key === 'ArrowRight') next = keys[(i + 1) % keys.length];
    else if (e.key === 'ArrowLeft') next = keys[(i - 1 + keys.length) % keys.length];
    else if (e.key === 'Home') next = keys[0];
    else if (e.key === 'End') next = keys[keys.length - 1];
    if (!next) return;
    e.preventDefault();
    this.select(next);
    // Focus follows selection so the keyboard user keeps their place.
    setTimeout(() => { const b = document.getElementById('tab-' + next); if (b) b.focus(); }, 0);
  };
""",
    "jump/spy replaced by tab selection, hash routing and arrow keys",
)

sub(
    """  componentDidMount() {
    window.addEventListener('scroll', this.spy, { passive: true });
    this.spy();
    window.addEventListener('keydown', this._onKey);""",
    """  componentDidMount() {
    const initial = Component.tabFromHash() || (() => {
      try { const s = localStorage.getItem('kapehan.tab'); if (Component.isTab(s)) return s; } catch (e) {}
      const p = this.props.defaultTab;
      return Component.isTab(p) ? p : null;
    })();
    if (initial) this.setState({ tab: initial });
    window.addEventListener('hashchange', this._onHash);
    window.addEventListener('keydown', this._onTabKey);
    window.addEventListener('keydown', this._onKey);""",
    "mount restores the tab from the URL, storage or the prop",
)

sub(
    "  componentWillUnmount() { clearTimeout(this._t); window.removeEventListener('keydown', this._onKey); window.removeEventListener('scroll', this.spy); }",
    "  componentWillUnmount() { clearTimeout(this._t); window.removeEventListener('keydown', this._onKey); "
    "window.removeEventListener('keydown', this._onTabKey); window.removeEventListener('hashchange', this._onHash); }",
    "unmount drops the new listeners",
)

# Nav markup: a real tablist, with panels wired to their tabs.
sub(
    '<div style="flex:1;min-width:0;display:flex;gap:4px;overflow-x:auto">',
    '<div id="kapehan-tablist" role="tablist" aria-label="Sections" style="flex:1;min-width:0;display:flex;gap:4px;overflow-x:auto">',
    "nav container is a tablist",
)
sub(
    '<button type="button" sc-camel-on-click="{{ t.onPick }}" aria-selected="{{ t.on }}" role="tab" '
    'style="background:none;border:0;border-bottom:2px solid {{ t.underline }};',
    '<button type="button" sc-camel-on-click="{{ t.onPick }}" aria-selected="{{ t.on }}" role="tab" '
    'id="{{ t.id }}" aria-controls="{{ t.panelId }}" tabindex="{{ t.tabIndex }}" '
    'style="background:none;border:0;border-bottom:2px solid {{ t.underline }};',
    "tab buttons carry id, aria-controls and roving tabindex",
)

# Each section becomes the panel its tab controls.
for key, sec in [("icons", "sec-icons"), ("doodles", "sec-doodles"), ("place", "sec-place"),
                 ("ui", "sec-ui"), ("create", "sec-create"), ("blocks", "sec-blocks"),
                 ("palettes", "sec-palettes")]:
    sub(
        '<section id="%s" style="scroll-margin-top:62px;' % sec,
        '<section id="%s" role="tabpanel" tabindex="-1" aria-labelledby="tab-%s" style="scroll-margin-top:62px;' % (sec, key),
        "%s is a tabpanel" % sec,
    )

# The header carried a second copy of the seven section names, so the page had two
# navigations for one job. With real tabs that is worse than redundant: two controls, one
# of which has the counts, the ARIA and the sticky position. Keep that one. The header
# stays for the brand, the accent swatches, the theme toggle and the GitHub link.
sub(
    '        <sc-for list="{{ tabs }}" as="t" hint-placeholder-count="4">\n'
    '          <button type="button" sc-camel-on-click="{{ t.onPick }}" style="background:none;border:0;padding:0;'
    'font:inherit;font-size:14px;cursor:pointer;color:{{ t.navColor }}" style-hover="opacity:.7">{{ t.label }}</button>\n'
    '        </sc-for>\n',
    "",
    "header drops its duplicate section nav",
)

# The Components sidebar/content split needs a stable hook for the mobile rule below.
sub(
    '<div style="display:grid;grid-template-columns:200px minmax(0,1fr);gap:40px;align-items:start">',
    '<div data-kape-split style="display:grid;grid-template-columns:200px minmax(0,1fr);gap:40px;align-items:start">',
    "components split carries a hook attribute",
)

# A visitor should land on the first tab, which is also the headline offering. The
# canvas default was Brew, which made the nav open with nothing selected.
sub(
    "defaultTab&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;default&quot;:&quot;create&quot;",
    "defaultTab&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;default&quot;:&quot;icons&quot;",
    "landing tab is Icons",
)

# --------------------------------------------- 4/5. head, a11y, touch targets
HEAD = """<meta name="description" content="Kapehan is a free set of coffee icons, doodles, drink palettes and UI parts that all follow one hand. Plain CSS, in HTML or React. MIT.">
<meta property="og:type" content="website">
<meta property="og:title" content="Kapehan: free coffee icons">
<meta property="og:description" content="Coffee icons, doodles, drink palettes and UI parts that all follow one hand. Plain CSS, in HTML or React. MIT.">
<meta property="og:url" content="https://baryodev.github.io/Kapehan/">
<meta name="twitter:card" content="summary_large_image">
<style>
  /* Honour the OS setting. The page advertises that every doodle can be stilled. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
  /* Keyboard focus was close to invisible: one focus-visible rule against one outline:none. */
  :focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 4px;
  }
  /* Comfortable touch targets for the page chrome on phones and tablets. */
  @media (pointer: coarse) {
    #kapehan-tablist button { min-height: 44px; }
  }
  /* white-space: pre-wrap will not break a long unbroken URL, and the snippets are full
     of them. This was the last page-level overflow on six of the seven tabs. */
  pre, code { overflow-wrap: anywhere; }
  /* Each component demo has a natural minimum width. Let the demo scroll inside its own
     card rather than squashing the component or pushing the page sideways. */
  [data-ship] { overflow-x: auto; }
  /* The Components index is a fixed 200px sidebar beside the demos. On a 390px screen that
     left 86px for the demos themselves, so their contents spilled out of the page. Stack it.
     !important because the declaration it overrides is inline. It hangs off a real attribute
     rather than [style*=...] because the runtime re-serialises inline styles, so the source
     spelling minmax(0,1fr) reaches the DOM as minmax(0px, 1fr) and a substring selector
     written against the source silently matches nothing. */
  @media (max-width: 720px) {
    [data-kape-split] {
      grid-template-columns: minmax(0, 1fr) !important;
      gap: 24px !important;
    }
  }
</style>
"""

# Anchored on the document's own head. The viewport meta alone appears four times,
# because the embedded doodles canvas carries its own head too.
sub(
    '<html><head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<html lang="en"><head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + HEAD,
    "html lang, description, og tags, reduced-motion, focus-visible, touch targets",
)

# ------------------------------------------- the doodles sub-canvas (manifest)
# The Cafe moments grid rendered 2 up for the first five doodles and then one per row from
# "Cashier" on. The grid was never at fault: the laptop <figure> is closed at the very end
# of the section instead of after its own <svg>, so the six figures that follow it are
# nested INSIDE it and stack in a single 514px cell. Move laptop's closing block back to
# where it belongs and all twelve become direct grid children.
#
# This one lives in the bundler manifest as gzipped base64, not in the template.
DOODLES_UUID = "b4414f3a"

LAPTOP_CLOSE = """      </div>
          <figcaption style="display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:12px 2px 0">
            <div style="font-size:14px"><span style="font-weight:600">Laptop</span> <span style="color:var(--muted,#7A6A5C)">bean on the lid, one hand clicking</span></div>
            <div style="display:flex;gap:14px;font-size:13px;font-weight:600">
              <button type="button" onClick="{{ copySvg }}" style="all:unset;cursor:pointer;color:var(--muted,#7A6A5C);border-bottom:1px solid var(--line,#EFE4D3)" style-hover="{color:'#241A13'}">Copy</button>
              <button type="button" onClick="{{ downloadSvg }}" style="all:unset;cursor:pointer;color:var(--ink,#241A13);border-bottom:1px solid var(--ink,#241A13)" style-hover="{color:'#C2593A'}">Download</button>
            </div>
          </figcaption>
        </figure>
"""

manifest = json.loads(lines[MAN_LINE])
key = [k for k in manifest if k.startswith(DOODLES_UUID)]
assert len(key) == 1, "expected exactly one doodles entry, found %d" % len(key)
key = key[0]
entry = manifest[key]
doodles = gzip.decompress(base64.b64decode(entry["data"])).decode("utf-8")

# 1. Lift the misplaced closing block out of its position after the last figure.
assert doodles.count(LAPTOP_CLOSE) == 1, "laptop closing block not found verbatim"
doodles = doodles.replace(LAPTOP_CLOSE, "", 1)

# 2. Put it back directly after laptop's own </svg>, before the cashier figure opens.
ANCHOR = '            </svg>\n    \n        <figure data-doodle="cashier"'
assert doodles.count(ANCHOR) == 1, "laptop/cashier boundary not found"
doodles = doodles.replace(
    ANCHOR,
    '            </svg>\n' + LAPTOP_CLOSE + '\n        <figure data-doodle="cashier"',
    1,
)

# Prove the nesting is gone: every figure in the file must now close before the next opens.
order = [m.group(0) for m in re.finditer(r"<figure\b|</figure>", doodles)]
depth = 0
worst = 0
for tag in order:
    depth += 1 if tag.startswith("<figure") else -1
    worst = max(worst, depth)
assert worst == 1, "figures are still nested (max depth %d, expected 1)" % worst
assert depth == 0, "figure tags are unbalanced (ends at %d)" % depth
assert len(order) == 48, "expected 24 figures, saw %d tags" % len(order)

entry["data"] = base64.b64encode(
    gzip.compress(doodles.encode("utf-8"), mtime=0)
).decode("ascii")
lines[MAN_LINE] = json.dumps(manifest).replace("</", "<\\u002F")
applied.append("laptop figure closes before cashier, so all 12 cafe doodles sit in the grid")

# ------------------------------------------------------------------- write
# The payload lives inside a <script> element, so a literal "</script>" anywhere in it
# would close the tag early. The bundle escapes every forward slash as / for exactly
# that reason; json.dumps does not, so restore it or the page dies on an unterminated string.
encoded = json.dumps(t).replace("<\\/", "<\\u002F").replace("</", "<\\u002F")
assert "</" not in encoded, "payload still contains a raw </ which would close the script tag"
lines[TPL_LINE] = encoded
open(OUT, "w", encoding="utf-8").write("\n".join(lines))

# Prove the file we just wrote decodes back to exactly the template we built. The first
# attempt at this shipped a payload that closed its own script tag and the page died on
# load, which looked nothing like an encoding bug from the outside.
check = open(OUT, encoding="utf-8").read().split("\n")[TPL_LINE]
assert json.loads(check) == t, "round trip failed: the written payload does not decode to the patched template"

print("template %d -> %d bytes" % (orig_len, len(t)))
print("output %s (%d bytes)" % (OUT, os.path.getsize(OUT)))
print("\n%d edits applied:" % len(applied))
for a in applied:
    print("  -", a)
