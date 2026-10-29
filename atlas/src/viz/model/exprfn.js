// Compile author-written expressions ("a*sin(b*x)", "v0*t - g*t^2/2") into
// fast functions of an environment object, using the Atlas's own parser, so
// data-driven simulations need no code. DOM-free.

import { parse, compile, canon } from '../../core/expr.js';

const cache = new Map();

/**
 * @param {string|number} src expression or number
 * @param {string[]} vars names it may use
 * @returns {(env:object) => number}
 */
export function fn(src, vars) {
  if (typeof src === 'number') return () => src;
  if (typeof src === 'function') return src;
  const key = `${src}|${vars.join(',')}`;
  let f = cache.get(key);
  if (!f) {
    const ast = parse(String(src), { vars });
    const g = compile(ast);
    f = (env) => g(env);
    cache.set(key, f);
  }
  return f;
}

/** Evaluate once (numbers pass through). */
export const val = (src, env, vars) => fn(src, vars)(env);

/** Canonical variable names for an environment built from params. */
export const names = (keys) => keys.map(canon);
