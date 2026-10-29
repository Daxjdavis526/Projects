import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const katex = (await import('/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/dl/katex@0.19.0/package/dist/katex.mjs')).default;
const h = katex.renderToString('\\oint \\mathbf{E}\\cdot d\\mathbf{A} = Q/\\varepsilon_0', { throwOnError: true });
let caught = null; try { katex.renderToString('\\frac{a}{', { throwOnError: true }); } catch (e) { caught = e.name; }
console.log('katex in node: renders', h.length, 'chars; malformed TeX throws', caught);
const math = require('/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/dl/mathjs@15.2.0/package/lib/browser/math.js');
console.log('mathjs in node via createRequire:', math.version);
// seeded PRNG + randomized numeric equivalence (WeBWorK-style defaults: 5 points in [-2,2], rel tol 1e-4)
function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; }; }
function equiv(a, b, vars, { n = 5, lo = -2, hi = 2, rtol = 1e-4, atol = 1e-12, seed = 1, maxTries = 50 } = {}) {
  const fa = math.compile(a), fb = math.compile(b), r = rng(seed); let ok = 0, tries = 0;
  while (ok < n && tries++ < maxTries) {
    const scope = Object.fromEntries(vars.map(v => [v, lo + (hi - lo) * r()]));
    const va = fa.evaluate(scope), vb = fb.evaluate(scope);
    if (typeof va !== 'number' || typeof vb !== 'number' || !isFinite(va) || !isFinite(vb)) continue; // undefined/complex point: resample
    if (Math.abs(va - vb) > Math.max(atol, rtol * Math.max(Math.abs(va), Math.abs(vb)))) return false;
    ok++;
  }
  return ok === n ? true : undefined;
}
const cases = [['sin(x)^2+cos(x)^2','1',['x']],['(x+1)^2','x^2+2x+1',['x']],['sqrt(x^2)','x',['x']],['log(x^2)','2*log(x)',['x']],['exp(i*pi)','-1',[]],['x^3/3','x^3/3+7',['x']],['(a+b)^2','a^2+b^2',['a','b']]];
for (const [a,b,v] of cases) console.log(' ', a, 'vs', b, '->', equiv(a,b,v));
const t0 = performance.now(); for (let k = 0; k < 1000; k++) equiv('sin(x)^2+cos(x)^2','1',['x'],{seed:k}); console.log('1000 checks (5 pts each):', Math.round(performance.now()-t0), 'ms');
const sp = math.unit('36 km/h'); console.log('units: 36 km/h ->', sp.toNumber('m/s'), 'm/s; 5 N equalBase kg m/s^2:', math.unit('5 N').equalBase(math.unit('1 kg m / s^2')), '; 5 N equalBase 5 J:', math.unit('5 N').equalBase(math.unit('5 J')));
