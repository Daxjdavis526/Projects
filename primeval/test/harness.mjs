// A very small assert harness. Kept separate from run.mjs so the suites can
// import it without forming an import cycle with run.mjs's top-level await.

export const results = { passed: 0, failed: 0, failures: [] };

export function test(name, fn) {
  try {
    fn();
    results.passed++;
    process.stdout.write('.');
  } catch (e) {
    results.failed++;
    results.failures.push(`${name}\n    ${e.message}`);
    process.stdout.write('x');
  }
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

export function near(a, b, tol, msg) {
  if (!(Math.abs(a - b) <= tol)) {
    throw new Error(`${msg || 'not near'}: ${a} vs ${b} (tolerance ${tol})`);
  }
}

export function finite(v, msg) {
  if (!Number.isFinite(v)) throw new Error(`${msg || 'value'} is not finite: ${v}`);
}
