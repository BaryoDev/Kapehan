/**
 * A small Vue-shaped runtime, so the vue generator's behavioural gates need nothing
 * installed.
 *
 * WHY THIS EXISTS
 * ---------------
 * The behavioural gates in vue.mjs used to sit behind `try { await import('vue') } catch`.
 * Nothing in this repo installs vue, so in CI every one of them was skipped, silently, and
 * check still printed ok. Eight gates that proved nothing, which is worse than no gate:
 * the next person reads the list and believes the area is covered.
 *
 * The two honest ways out are a loud failure ("cannot verify X because vue is absent") or
 * not needing vue. A loud failure would turn every green run red on a machine with nothing
 * installed, which is exactly the machine check.mjs is written for (prepublishOnly and the
 * publish workflow both run it against a bare checkout). So: not needing vue.
 *
 * WHAT IT IS AND IS NOT
 * ---------------------
 * This implements the nine names vue/components.js imports - h, ref, computed, watch,
 * onMounted, onBeforeUnmount, nextTick, useId, getCurrentInstance - with the semantics the
 * gates depend on, and nothing else. It is not a Vue. It has no scheduler priorities, no
 * component tree, no keyed diff, no SSR, no directives, no slots beyond the ones passed in.
 *
 * The parts that had to match Vue exactly, because a gate's verdict turns on them:
 *
 *   props are shallow-reactive       a watcher on () => props.month must re-run when the
 *                                    parent passes a new Date, and must not when it passes
 *                                    an equal one. That distinction is the whole of new-1.
 *   watch compares with Object.is    a getter returning a fresh array therefore fires every
 *                                    time its deps change, the way Vue's does.
 *   props are camelized              a parent binding :model-value reaches a component that
 *                                    declares modelValue, and emit('update:modelValue')
 *                                    finds an onUpdate:model-value listener. That is open-3.
 *   vnode.props keeps raw keys       useModel decides ownership by reading them, so kebab
 *                                    keys have to arrive as kebab keys.
 *   h() normalizes class             createVNode does it, so `class: ['a', {b: true}]`
 *                                    reads back as the string "a b" under both runtimes.
 *
 * KEEPING IT HONEST
 * -----------------
 * A shim that answers differently from the real thing is a gate that proves nothing, which
 * is the bug this file exists to fix. So vue.mjs runs the same battery through a real-vue
 * adapter as well whenever `vue` does resolve, and the two must agree. On a bare checkout
 * only this runtime runs; on a machine with vue installed both do.
 */

/* ------------------------------------------------------------------ *
 * Reactivity
 * ------------------------------------------------------------------ */

let activeEffect = null;
const pending = new Set();
let flushing = null;

function schedule(job) {
  pending.add(job);
  if (!flushing) {
    flushing = Promise.resolve().then(() => {
      flushing = null;
      for (let round = 0; pending.size && round < 100; round++) {
        const jobs = [...pending];
        pending.clear();
        for (const j of jobs) j();
      }
    });
  }
  return flushing;
}

/** Resolves after the queued watcher jobs have run, like Vue's. */
export function nextTick(fn) {
  const p = flushing ?? Promise.resolve();
  return fn ? p.then(fn) : p.then(() => undefined);
}

class Dep {
  constructor() {
    this.subs = new Set();
  }
  track() {
    if (activeEffect) {
      this.subs.add(activeEffect);
      activeEffect.deps.add(this);
    }
  }
  trigger() {
    for (const s of [...this.subs]) s.notify();
  }
}

class ReactiveEffect {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.deps = new Set();
    this.active = true;
  }
  run() {
    if (!this.active) return this.fn();
    for (const d of this.deps) d.subs.delete(this);
    this.deps.clear();
    const prev = activeEffect;
    activeEffect = this;
    try {
      return this.fn();
    } finally {
      activeEffect = prev;
    }
  }
  notify() {
    if (this.scheduler) this.scheduler();
    else this.run();
  }
  stop() {
    for (const d of this.deps) d.subs.delete(this);
    this.deps.clear();
    this.active = false;
  }
}

export function ref(initial) {
  const dep = new Dep();
  let value = initial;
  return {
    __v_isRef: true,
    get value() {
      dep.track();
      return value;
    },
    set value(next) {
      if (Object.is(next, value)) return;
      value = next;
      dep.trigger();
    },
  };
}

export const isRef = (r) => !!r && r.__v_isRef === true;

export function computed(optionOrGetter) {
  const getter = typeof optionOrGetter === 'function' ? optionOrGetter : optionOrGetter.get;
  const setter = typeof optionOrGetter === 'function' ? null : optionOrGetter.set;
  const dep = new Dep();
  let value;
  let dirty = true;
  const effect = new ReactiveEffect(getter, () => {
    if (!dirty) {
      dirty = true;
      dep.trigger();
    }
  });
  return {
    __v_isRef: true,
    get value() {
      if (dirty) {
        value = effect.run();
        dirty = false;
      }
      dep.track();
      return value;
    },
    set value(next) {
      if (!setter) throw new Error('write to a read-only computed');
      setter(next);
    },
  };
}

/**
 * watch(getterOrRef, cb). Object.is on the produced value, like Vue's non-deep watch, so a
 * getter that builds a fresh array or Date fires whenever its dependencies change.
 */
export function watch(source, cb) {
  const getter = typeof source === 'function' ? source : () => source.value;
  let old;
  const job = () => {
    const value = effect.run();
    if (!Object.is(value, old)) {
      const previous = old;
      old = value;
      cb(value, previous);
    }
  };
  const effect = new ReactiveEffect(getter, () => schedule(job));
  old = effect.run();
  return () => effect.stop();
}

/** Shallow-reactive, which is what Vue makes a component's props object. */
function shallowReactive(target) {
  const deps = new Map();
  const depFor = (key) => {
    let d = deps.get(key);
    if (!d) deps.set(key, (d = new Dep()));
    return d;
  };
  return new Proxy(target, {
    get(t, key, receiver) {
      if (typeof key === 'string') depFor(key).track();
      return Reflect.get(t, key, receiver);
    },
    set(t, key, value, receiver) {
      const had = Object.is(t[key], value);
      const ok = Reflect.set(t, key, value, receiver);
      if (typeof key === 'string' && !had) depFor(key).trigger();
      return ok;
    },
    has(t, key) {
      if (typeof key === 'string') depFor(key).track();
      return Reflect.has(t, key);
    },
  });
}

/* ------------------------------------------------------------------ *
 * Vnodes
 * ------------------------------------------------------------------ */

/** normalizeClass, as createVNode applies it: arrays and objects become one string. */
export function normalizeClass(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(normalizeClass).filter(Boolean).join(' ');
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .filter((k) => value[k])
      .join(' ');
  }
  return '';
}

export function h(type, props, children) {
  const p = props ? { ...props } : {};
  if (p.class !== undefined && p.class !== null && typeof p.class !== 'string') p.class = normalizeClass(p.class);
  return { __vnode: true, type, props: p, children: children === undefined ? null : children };
}

/* ------------------------------------------------------------------ *
 * Instances
 * ------------------------------------------------------------------ */

let currentInstance = null;
let uid = 0;

export function getCurrentInstance() {
  return currentInstance;
}

export function useId() {
  if (!currentInstance) throw new Error('useId() called outside a component instance');
  return `v${currentInstance.uid}-${currentInstance.ids++}`;
}

export function onMounted(fn) {
  if (currentInstance) currentInstance.mountedHooks.push(fn);
}

export function onBeforeUnmount(fn) {
  if (currentInstance) currentInstance.unmountHooks.push(fn);
}

const camelize = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const hyphenate = (s) => s.replace(/\B([A-Z])/g, '-$1').toLowerCase();

/** Declared props resolved out of raw vnode props, camelizing keys the way Vue does. */
function resolveProps(declared, raw) {
  const out = {};
  for (const [key, opt] of Object.entries(declared ?? {})) {
    const given = key in raw ? raw[key] : raw[hyphenate(key)];
    if (given !== undefined) {
      out[key] = given;
      continue;
    }
    const spec = opt && typeof opt === 'object' && !Array.isArray(opt) ? opt : { type: opt };
    if ('default' in spec) {
      const d = spec.default;
      out[key] = typeof d === 'function' && spec.type !== Function ? d() : d;
    } else if (spec.type === Boolean) out[key] = false;
    else out[key] = undefined;
  }
  return out;
}

/** emit('update:modelValue') has to find onUpdate:modelValue or onUpdate:model-value. */
function handlerFor(raw, event) {
  const names = [
    'on' + capitalize(camelize(event)),
    'on' + capitalize(hyphenate(event)),
    'on' + capitalize(event),
  ];
  for (const n of names) if (typeof raw[n] === 'function') return raw[n];
  return null;
}

function withInstance(instance, fn) {
  const prev = currentInstance;
  currentInstance = instance;
  try {
    return fn();
  } finally {
    currentInstance = prev;
  }
}

/**
 * Mount one component and hand back a handle the gates drive.
 *
 * Lifecycle hooks are NOT run by default, which matches a server render: KapeCmdk binds a
 * window listener in onMounted and node has no window. `{ hooks: true }` runs them.
 */
export function __mount(Component, rawProps = {}, options = {}) {
  const instance = {
    uid: ++uid,
    vnode: { props: { ...rawProps } },
    ids: 0,
    mountedHooks: [],
    unmountHooks: [],
  };
  const props = shallowReactive(resolveProps(Component.props, instance.vnode.props));
  const emitted = [];
  const emit = (event, ...args) => {
    emitted.push({ event, args });
    const fn = handlerFor(instance.vnode.props, event);
    if (fn) fn(...args);
  };
  const render = withInstance(instance, () =>
    Component.setup(props, { emit, slots: options.slots ?? {}, attrs: {}, expose() {} }),
  );
  if (typeof render !== 'function') throw new Error(`${Component.name}: setup() did not return a render function`);
  if (options.hooks) for (const hook of instance.mountedHooks) hook();

  return {
    emitted,
    /** A fresh render, flattened. Re-rendering is how a parent re-render is modelled. */
    nodes: () => flatten(withInstance(instance, render)),
    /** A parent re-render with new props, including new identities for equal values. */
    setProps(next) {
      instance.vnode.props = { ...next };
      const resolved = resolveProps(Component.props, instance.vnode.props);
      for (const key of Object.keys(resolved)) props[key] = resolved[key];
    },
    tick: () => nextTick(),
    unmount() {
      for (const hook of instance.unmountHooks) hook();
    },
  };
}

/** The flat node shape both runtimes are normalized to: { tag, props, text, parent }. */
export function flatten(node, out = [], parent = null) {
  if (node === null || node === undefined || node === false || node === true) return out;
  if (Array.isArray(node)) {
    for (const child of node) flatten(child, out, parent);
    return out;
  }
  if (typeof node !== 'object') return out;
  const tag = typeof node.type === 'string' ? node.type : (node.type && node.type.name) || 'component';
  const entry = { tag, props: node.props ?? {}, text: directText(node.children), parent };
  out.push(entry);
  flatten(node.children, out, entry);
  return out;
}

function directText(children) {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (!Array.isArray(children)) return '';
  return children
    .filter((c) => typeof c === 'string' || typeof c === 'number')
    .map(String)
    .join('');
}
