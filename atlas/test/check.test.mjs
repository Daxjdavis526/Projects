// The answer checker: parsing, units, numeric tolerance and symbolic
// equivalence. Every graded response in the Atlas goes through this code.
//   node atlas/test/check.test.mjs

import { parse, evaluate, toTeX, toText, compile, gammaFn, erf, ParseError } from '../src/core/expr.js';
import { parseUnit, parseQuantity, convert, describeDims } from '../src/core/units.js';
import { grade, countSigFigs, compareExpr } from '../src/core/check.js';
import { makeRng, roundTo } from '../src/core/rng.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-12) => Math.abs(a - b) <= rel * Math.max(1, Math.abs(b));
const ev = (s, env = {}) => evaluate(s, env);
const throws = (fn) => { try { fn(); return false; } catch (e) { return e instanceof ParseError || e.name === 'UnitError' || e instanceof Error; } };

// ─── parsing and evaluation ─────────────────────────────────────────────────
check('precedence: 2+3*4 = 14', ev('2+3*4') === 14);
check('power is right-associative', ev('2^3^2') === 512);
check('unary minus binds looser than ^: -2^2 = -4', ev('-2^2') === -4);
check('negative exponent: 2^-1', ev('2^-1') === 0.5);
check('implicit multiplication 2x', ev('2x', { x: 3 }) === 6);
check('implicit multiplication x(x+1)', ev('x(x+1)', { x: 3 }) === 12);
check('implicit multiplication (x+1)(x-1)', ev('(x+1)(x-1)', { x: 3 }) === 8);
check('letters split into declared variables: mgh', ev('mgh', { m: 2, g: 9.8, h: 10 }) === 196);
check('sinx means sin(x)', near(ev('sinx', { x: 0.5 }), Math.sin(0.5)));
check('sin 2x means sin(2x)', near(ev('sin 2x', { x: 0.3 }), Math.sin(0.6)));
check('sin2x means sin(2x)', near(ev('sin2x', { x: 0.3 }), Math.sin(0.6)));
check('sin x cos x is a product', near(ev('sin x cos x', { x: 0.7 }), Math.sin(0.7) * Math.cos(0.7)));
check('sin x^2 means sin(x²)', near(ev('sin x^2', { x: 1.2 }), Math.sin(1.44)));
check('sin^2 x means (sin x)²', near(ev('sin^2 x', { x: 1.2 }), Math.sin(1.2) ** 2));
check('sin^-1 x means arcsin x', near(ev('sin^-1(0.5)'), Math.asin(0.5)));
check('sin(x)^2 is (sin x)²', near(ev('sin(x)^2', { x: 1.2 }), Math.sin(1.2) ** 2));
check('a/bc is (a/b)c, like a calculator', near(ev('a/bc', { a: 6, b: 2, c: 3 }), 9));
check('ln is natural log', near(ev('ln(e^2)'), 2));
check('log is base 10', near(ev('log(1000)'), 3));
check('e^x with unicode superscripts', near(ev('x²', { x: 3 }), 9) && near(ev('x³', { x: 2 }), 8));
check('unicode: 2πr', near(ev('2πr', { r: 1 }), 2 * Math.PI));
check('unicode minus and times', ev('3 × 4 − 2') === 10);
check('√ symbol', near(ev('√(16)'), 4));
check('Greek variable names: θ and theta are the same', near(ev('sin θ', { theta: 0.4 }), Math.sin(0.4)) && near(ev('sin(theta)', { θ: 0.4 }), Math.sin(0.4)));
check('subscripted variable v_0 = v0', ev('v_0 t', { v0: 3, t: 2 }) === 6 && ev('v0*t', { v_0: 3, t: 2 }) === 6);
check('scientific notation 3.0e8', ev('3.0e8') === 3e8);
check('scientific notation written 3x10^8', ev('3x10^8') === 3e8);
check('e alone is Euler’s number', near(ev('e'), Math.E));
check('e can be a declared variable', ev('2e', { e: 5 }) === 10);
check('absolute value bars', ev('|x-5|', { x: 2 }) === 3 && ev('2|x|', { x: -3 }) === 6);
check('factorial', ev('5!') === 120 && near(ev('(1/2)!'), Math.sqrt(Math.PI) / 2, 1e-12));
check('cube root of a negative is real', near(ev('(-8)^(1/3)'), -2) && near(ev('cbrt(-27)'), -3));
check('sqrt of a negative is NaN', Number.isNaN(ev('sqrt(-1)')));
check('atan2 takes two arguments', near(ev('atan2(1, 1)'), Math.PI / 4));
check('gamma(5) = 24', gammaFn(5) === 24 && near(gammaFn(0.5), Math.sqrt(Math.PI), 1e-13));
check('erf(1) = 0.8427007929497149', near(erf(1), 0.8427007929497149, 1e-13) && near(erf(3.5), 0.9999992569016276, 1e-13));
check('unknown symbol is an error', throws(() => parse('x + q', { vars: ['x'] })));
check('x2 is ambiguous', throws(() => parse('x2', { vars: ['x'] })));
check('missing bracket is an error', throws(() => parse('sin(x', { vars: ['x'] })));
check('empty is an error', throws(() => parse('  ')));
check('TeX preview of a fraction', toTeX(parse('(x+1)/(x-1)', { vars: ['x'] })) === '\\frac{x + 1}{x - 1}');
check('TeX preview of sin^2', toTeX(parse('sin^2 x', { vars: ['x'] })).startsWith('\\sin^{2}'));
check('TeX of v0 is v_{0}', toTeX(parse('v0', { vars: ['v0'] })) === 'v_{0}');
check('TeX of theta is \\theta', toTeX(parse('theta', { vars: ['theta'] })) === '\\theta');
{
  // round trip: toText parses back to the same function
  const rng = makeRng(3);
  const exprs = ['x^2 sin(x) + 3', '-x^2/(1+x)', 'e^(-x/2) cos(3x)', 'ln(x^2+1) - sqrt(x+5)', '|x-1|^3', 'sin^2 x + cos^2 x'];
  for (const s of exprs) {
    const a = parse(s, { vars: ['x'] });
    const b = parse(toText(a), { vars: ['x'] });
    const fa = compile(a), fb = compile(b);
    let ok = true;
    for (let k = 0; k < 20; k++) { const x = rng.float(-0.9, 3); if (!near(fa({ x }), fb({ x }), 1e-12) && !(Number.isNaN(fa({ x })) && Number.isNaN(fb({ x })))) ok = false; }
    check(`toText round-trips ${s}`, ok);
  }
}

// ─── units ─────────────────────────────────────────────────────────────────
check('N = kg m s^-2', near(parseUnit('N').factor, 1) && parseUnit('kg m/s^2').dims.join() === parseUnit('N').dims.join());
check('km/h = 1/3.6 m/s', near(parseUnit('km/h').factor, 1 / 3.6));
check('μs prefix', near(parseUnit('μs').factor, 1e-6) && near(parseUnit('us').factor, 1e-6));
check('ms is millisecond, mm is millimetre', near(parseUnit('ms').factor, 1e-3) && parseUnit('ms').dims[2] === 1 && near(parseUnit('mm').factor, 1e-3));
check('min is minutes, not milli-inches', parseUnit('min').factor === 60);
check('J/(kg K) parses', describeDims(parseUnit('J/(kg K)').dims) === 'm^2·s^-2·K^-1');
check('N·m has the dimensions of energy', describeDims(parseUnit('N·m').dims) === 'energy');
check('m/s² with unicode superscript', describeDims(parseUnit('m/s²').dims) === 'acceleration');
check('MeV to joules', near(parseUnit('MeV').factor, 1.602176634e-13));
check('Mpc', near(parseUnit('Mpc').factor, 3.0856775814913673e22));
check('kWh = 3.6 MJ', near(parseUnit('kWh').factor, 3.6e6));
check('degrees are dimensionless', describeDims(parseUnit('deg').dims) === 'dimensionless');
check('convert 72 km/h → 20 m/s', near(convert(72, 'km/h', 'm/s'), 20));
check('convert 1 ly → 63241 au', Math.abs(convert(1, 'ly', 'au') - 63241.077) < 0.01);
check('quantity "3.0e8 m/s"', near(parseQuantity('3.0e8 m/s').si, 3e8));
check('quantity "4.5 × 10^3 N"', near(parseQuantity('4.5 × 10^3 N').si, 4500));
check('quantity "9.8m/s^2"', near(parseQuantity('9.8m/s^2').si, 9.8));
check('quantity "2pi rad"', near(parseQuantity('2pi rad').si, 2 * Math.PI));
check('quantity "1/2 m"', near(parseQuantity('1/2 m').si, 0.5));
check('quantity "0.6 c"', near(parseQuantity('0.6 c').si, 0.6 * 299792458));
check('quantity "250 mL"', near(parseQuantity('250 mL').si, 2.5e-4));
check('pure number "3/4"', parseQuantity('3/4').unit === null && parseQuantity('3/4').value === 0.75);
check('bad unit fails', throws(() => parseUnit('furlongs')));

// ─── numeric grading ───────────────────────────────────────────────────────
const accel = { type: 'numeric', answer: 5, units: 'm/s^2' };
check('numeric: exact value', grade(accel, '5').correct);
check('numeric: within 1%', grade(accel, '5.04').correct);
check('numeric: outside 1%', !grade(accel, '5.1').correct);
check('numeric: with matching unit typed', grade(accel, '5 m/s^2').correct);
check('numeric: with an equivalent unit', grade(accel, '500 cm/s^2').correct);
check('numeric: wrong dimension is named', /measures speed/.test(grade(accel, '5 m/s').feedback));
check('numeric: sign slip named', /sign/.test(grade(accel, '-5').feedback));
check('numeric: power-of-ten slip named', /factor of 10/.test(grade(accel, '500').feedback));
check('numeric: factor-of-2 slip named', /factor of 2/.test(grade(accel, '10').feedback));
check('numeric: unreadable input is invalid, not wrong', grade(accel, '5 m/s/').status === 'invalid');
check('numeric: empty is invalid', grade(accel, '').status === 'invalid');
check('numeric: expressions are allowed', grade({ type: 'numeric', answer: Math.sqrt(2) / 2, tol: { rel: 1e-6 } }, 'sqrt(2)/2').correct);
check('numeric: known error feedback', grade({ type: 'numeric', answer: 20, errors: [{ value: 80, feedback: 'You squared the speed twice.' }] }, '80').feedback === 'You squared the speed twice.');
check('numeric: typed-unit mode needs a unit', grade({ type: 'numeric', answer: 20, units: 'm/s', unitMode: 'typed' }, '20').status === 'invalid');
check('numeric: typed-unit mode accepts km/h', grade({ type: 'numeric', answer: 20, units: 'm/s', unitMode: 'typed' }, '72 km/h').correct);
check('numeric: zero answer', grade({ type: 'numeric', answer: 0, tol: { abs: 1e-6 } }, '0').correct && !grade({ type: 'numeric', answer: 0, tol: { abs: 1e-6 } }, '0.1').correct);
check('numeric: degrees vs radians named', /degrees and radians/.test(grade({ type: 'numeric', answer: 0.5236 }, '30').feedback));
check('sig figs: 0.00450 → 3', countSigFigs('0.00450') === 3);
check('sig figs: 4500 → 2', countSigFigs('4500') === 2);
check('sig figs: 4.50e3 → 3', countSigFigs('4.50e3') === 3);
check('sig figs: 120. → 3', countSigFigs('120.') === 3);
check('sig figs note does not fail the answer', grade({ type: 'numeric', answer: 9.81, sigfigs: 3 }, '9.8100000').correct);

// ─── expression grading ────────────────────────────────────────────────────
const deriv = { type: 'expression', answer: 'x^2 cos(x) + 2x sin(x)', vars: { x: [-3, 3] } };
check('expr: equivalent form accepted', grade(deriv, '2 x sin x + x² cos x').correct);
check('expr: factored form accepted', grade(deriv, 'x(x cos(x) + 2 sin(x))').correct);
check('expr: wrong answer rejected', !grade(deriv, 'x^2 cos(x)').correct);
check('expr: sign slip named', /sign/.test(grade(deriv, '-(x^2 cos(x) + 2x sin(x))').feedback));
check('expr: factor of 2 named', /factor of 2/.test(grade(deriv, '2x^2 cos(x) + 4x sin(x)').feedback));
check('expr: trig identity accepted', grade({ type: 'expression', answer: 'sin(2x)', vars: ['x'] }, '2 sin x cos x').correct);
check('expr: identity 1', grade({ type: 'expression', answer: '1', vars: ['x'] }, 'sin^2 x + cos^2 x').correct);
check('expr: log(x²) ≠ 2 log x on a domain with negatives? both forms agree for x>0 only', grade({ type: 'expression', answer: 'ln(x^2)', vars: { x: [-3, -0.5] } }, '2 ln(x)').status === 'incorrect');
check('expr: log vs ln slip named', /log base 10/.test(grade({ type: 'expression', answer: 'ln(x)', vars: { x: [0.5, 3] } }, 'log(x)').feedback));
check('expr: antiderivative up to a constant', grade({ type: 'expression', answer: 'x sin(x) + cos(x)', vars: ['x'], mode: 'constant' }, 'x sin x + cos x + 7').correct);
check('expr: antiderivative wrong', !grade({ type: 'expression', answer: 'x sin(x) + cos(x)', vars: ['x'], mode: 'constant' }, 'x sin x - cos x').correct);
// the constant of integration may depend on every variable but the one integrated over
const tortoise = { type: 'expression', answer: 'r + 2M ln(r - 2M)', vars: { r: [3, 9], M: [0.5, 1.4] }, mode: 'constant' };
check('expr: a constant that depends on a parameter (M) is still a constant', grade(tortoise, 'r + 2M ln((r - 2M)/M)').correct);
check('expr: …but not one that depends on the variable integrated over', !grade(tortoise, 'r + 2M ln(r - 2M) + r/M').correct);
check('expr: …and a wrong coefficient is still caught', !grade(tortoise, 'r + M ln(r - 2M)').correct);
check('expr: Bessel J of integer order', grade({ type: 'expression', answer: 'besselj(0, x)', vars: { x: [0, 10] } }, 'besselj(0, x)').correct
  && !grade({ type: 'expression', answer: 'besselj(0, x)', vars: { x: [0, 10] } }, 'besselj(1, x)').correct
  && grade({ type: 'expression', answer: 'besselj(1, x)', vars: { x: [0.5, 10] } }, '-besselj(-1, x)').correct);
check('expr: wrt * wants a true constant (a potential)', grade({ type: 'expression', answer: 'x^2 y', vars: { x: [1, 2], y: [1, 2] }, mode: 'constant', wrt: '*' }, 'x^2 y + 5').correct
  && !grade({ type: 'expression', answer: 'x^2 y', vars: { x: [1, 2], y: [1, 2] }, mode: 'constant', wrt: '*' }, 'x^2 y + y').correct);
check('expr: wrt names the variable of integration', grade({ type: 'expression', answer: 'x t^2/2', vars: { x: [1, 3], t: [0, 2] }, mode: 'constant', wrt: 't' }, 'x t^2/2 + x^3').correct
  && !grade({ type: 'expression', answer: 'x t^2/2', vars: { x: [1, 3], t: [0, 2] }, mode: 'constant', wrt: 't' }, 'x t^2/2 + t').correct);
check('expr: exact mode rejects + C', grade({ type: 'expression', answer: 'x^2', vars: ['x'] }, 'x^2 + 1').feedback.includes('constant'));
check('expr: equation mode accepts a rescaled equation', grade({ type: 'expression', answer: 'y = 2x + 1', vars: ['x', 'y'], mode: 'equation' }, '2y - 4x = 2').correct);
check('expr: equation mode rejects a different line', !grade({ type: 'expression', answer: 'y = 2x + 1', vars: ['x', 'y'], mode: 'equation' }, 'y = 2x - 1').correct);
check('expr: unknown variable is invalid', grade(deriv, 'x + t').status === 'invalid');
check('expr: known error form', grade({ type: 'expression', answer: 'cos(x)', vars: ['x'], errors: [{ answer: '-cos(x)', feedback: 'd/dx sin x is +cos x.' }] }, '-cos x').feedback === 'd/dx sin x is +cos x.');
check('expr: physics symbols', grade({ type: 'expression', answer: 'sqrt(2 g h)', vars: { g: [5, 15], h: [0.1, 10] } }, '√(2gh)').correct);
check('expr: v0 subscripts', grade({ type: 'expression', answer: 'v_0^2 sin(2 theta)/g', vars: { v_0: [1, 30], theta: [0.1, 1.4], g: [9, 10] } }, '2 v0^2 sinθ cosθ / g').correct);
check('expr: forbid abs', grade({ type: 'expression', answer: 'sqrt(x^2)', vars: ['x'], forbid: ['abs'] }, '|x|').status === 'invalid');
check('expr: form expanded accepts the expansion', grade({ type: 'expression', answer: 'x^2 + 2x + 1', vars: ['x'], form: 'expanded' }, '1 + 2x + x^2').correct);
check('expr: form expanded rejects the bracket typed back', !grade({ type: 'expression', answer: 'x^2 + 2x + 1', vars: ['x'], form: 'expanded' }, '(x + 1)^2').correct && !grade({ type: 'expression', answer: 'x^2 - 1', vars: ['x'], form: 'expanded' }, 'x(x + 1) - (x + 1)').correct);
check('expr: form factored accepts a product in any order and sign', grade({ type: 'expression', answer: '(x - 2)(x - 3)', vars: ['x'], form: 'factored' }, '-(3 - x)(x - 2)').correct);
check('expr: form factored rejects the polynomial typed back', !grade({ type: 'expression', answer: '(x - 2)(x - 3)', vars: ['x'], form: 'factored' }, 'x^2 - 5x + 6').correct);
check('expr: form expanded rejects an undone division', !grade({ type: 'expression', answer: 'x^2 + 2x + 4', vars: ['x'], form: 'expanded' }, '(x^3 - 8)/(x - 2)').correct);
check('expr: undefined where key is defined', /undefined/.test(grade({ type: 'expression', answer: 'x', vars: { x: [-2, 2] } }, 'sqrt(x)^2').feedback));
check('expr: compareExpr ratio', compareExpr({ f: (e) => 3 * e.x }, { f: (e) => e.x }, { x: [1, 2] }).ratio === 3);

// ─── choices, order, match, point, slider ──────────────────────────────────
const mcq = { type: 'mcq', choices: ['a', 'b', 'c', 'd'], answer: 2, why: { 0: 'a is a trap because…' } };
check('mcq: right', grade(mcq, 2).correct);
check('mcq: wrong with why', grade(mcq, 0).feedback === 'a is a trap because…');
check('mcq: nothing chosen is invalid', grade(mcq, null).status === 'invalid');
check('multi: exact set', grade({ type: 'multi', choices: ['a', 'b', 'c', 'd'], answer: [0, 2] }, [2, 0]).correct);
check('multi: missing one', !grade({ type: 'multi', choices: ['a', 'b', 'c', 'd'], answer: [0, 2] }, [0]).correct);
check('order: right', grade({ type: 'order', items: ['a', 'b', 'c'] }, [0, 1, 2]).correct);
check('order: wrong position reported', grade({ type: 'order', items: ['a', 'b', 'c'] }, [0, 2, 1]).firstWrong === 1);
check('match: right', grade({ type: 'match', left: ['F', 'm', 'a'], right: ['N', 'kg', 'm/s²'], answer: [0, 1, 2] }, { 0: 0, 1: 1, 2: 2 }).correct);
check('match: one wrong', grade({ type: 'match', left: ['F', 'm', 'a'], right: ['N', 'kg', 'm/s²'], answer: [0, 1, 2] }, { 0: 0, 1: 2, 2: 1 }).wrong === 2);
check('point: inside tolerance', grade({ type: 'point', answer: { x: 1, y: 2 }, tol: { x: 0.1, y: 0.1 } }, { x: 1.05, y: 1.95 }).correct);
check('slider: in range', grade({ type: 'slider', answer: [40, 50] }, 45).correct && !grade({ type: 'slider', answer: [40, 50] }, 51).correct);

// ─── rng ───────────────────────────────────────────────────────────────────
{
  const a = makeRng(42), b = makeRng(42);
  const xs = Array.from({ length: 5 }, () => a.next()), ys = Array.from({ length: 5 }, () => b.next());
  check('rng is reproducible', xs.every((x, k) => x === ys[k]));
  const r = makeRng('phys2210.M5.2/q3#7');
  const ints = Array.from({ length: 1000 }, () => r.int(1, 6));
  check('rng.int stays in range and hits both ends', ints.every((v) => v >= 1 && v <= 6) && ints.includes(1) && ints.includes(6));
  check('roundTo(0.1)', roundTo(2.345, 0.1) === 2.3 && roundTo(2.36, 0.05) === 2.35);
  check('perm is a permutation', makeRng(5).perm(6).slice().sort().join() === '0,1,2,3,4,5');
}

// declared subscripted names keep their subscripts in the preview
check('r_s shows as r_{s}', toTeX(parse('r_s/r', { vars: ['r_s', 'r'] })) === '\\frac{r_{s}}{r}');
check('k_B T shows as k_{B} T', toTeX(parse('k_B T', { vars: ['k_B', 'T'] })) === 'k_{B}\\,T');
check('omega_0 shows as ω₀', toTeX(parse('ω_0 t', { vars: ['omega_0', 't'] })) === '\\omega_{0}\\,t');
check('a subscripted name grades like any other', grade({ type: 'expression', answer: 'r_s/r', vars: { r_s: [1, 2], r: [3, 9] } }, 'rs/r').correct);

// a micro prefix typed as the Greek letter
check('3 μm reads as 3e-6 m', Math.abs(parseQuantity('3 μm').si - 3e-6) < 1e-18);
check('20 µas (micro sign) reads as microarcseconds', Math.abs(parseQuantity('20 µas').si - 20 * Math.PI / 648e9) < 1e-20);
check('5 μs graded against an answer in s', grade({ type: 'numeric', answer: 5e-6, units: 's', tol: { rel: 0.01 } }, '5 μs').correct);

// Celsius: degree-sized, with the offset applied only to a bare temperature
check('20 °C typed for an answer of 20 °C', grade({ type: 'numeric', answer: 20, units: '°C', tol: { rel: 0.001 } }, '20 °C').correct);
check('293.15 K typed for an answer of 20 °C', grade({ type: 'numeric', answer: 20, units: '°C', tol: { rel: 0.001 } }, '293.15 K').correct);
check('−196 °C typed for an answer of 77.15 K', grade({ type: 'numeric', answer: 77.15, units: 'K', tol: { rel: 0.001 } }, '-196 °C').correct);
check('a specific heat in J/(kg °C) equals one in J/(kg K)', grade({ type: 'numeric', answer: 4186, units: 'J/(kg K)', tol: { rel: 0.001 } }, '4186 J/(kg °C)').correct);
check('a temperature change in °C needs no offset', grade({ type: 'numeric', answer: 15, units: 'K', tol: { rel: 0.001 } }, '15').correct);
check('a temperature change typed in °C, for a change in K', grade({ type: 'numeric', answer: 15, units: 'K', difference: true, tol: { rel: 0.001 } }, '15 °C').correct);
check('…but a change is not offset into an absolute temperature', !grade({ type: 'numeric', answer: 15, units: 'K', difference: true, tol: { rel: 0.001 } }, '288.15 °C').correct);
check('Hz is not rad/s', !grade({ type: 'numeric', answer: 6.283, units: 'rad/s', tol: { rel: 0.01 } }, '6.283 Hz').correct && grade({ type: 'numeric', answer: 6.283, units: 'rad/s', tol: { rel: 0.01 } }, '6.283 rad/s').correct && grade({ type: 'numeric', answer: 60, units: 'rpm', tol: { rel: 0.01 } }, '6.283 rad/s').correct);
check('a sound level carries its decibels', grade({ type: 'numeric', answer: 85, units: 'dB', tol: { rel: 0.001 } }, '85 dB').correct && grade({ type: 'numeric', answer: 85, units: 'dB', tol: { rel: 0.001 } }, '85').correct);
check('a decibel is not a deci-anything', !grade({ type: 'numeric', answer: 85, units: 'dB', tol: { rel: 0.001 } }, '8.5 B').correct);

// angles on the sky and reciprocal units
check('43 arcsec in radians', Math.abs(parseQuantity('43 arcsec').si - 43 * Math.PI / 648000) < 1e-15);
check('1 mas = 1e-3 arcsec', Math.abs(parseUnit('mas').factor * 1000 - parseUnit('arcsec').factor) < 1e-20);
check('a reciprocal unit 1/N', describeDims(parseUnit('1/N').dims) === describeDims(parseUnit('N^-1').dims));
check('a number with a reciprocal unit', parseQuantity('2.08e-43 1/N').si === 2.08e-43);
check('arcsec graded against a degree answer', grade({ type: 'numeric', answer: 1.75 / 3600, units: 'deg', tol: { rel: 0.01 } }, '1.75 arcsec').correct);

// thousands separators added when math is typeset
{
  const { groupDigits } = await import('../src/core/markup.js');
  check('a five-digit integer is grouped', groupDigits('a = 42164') === 'a = 42\\,164');
  check('a seven-digit integer is grouped in threes', groupDigits('1234567') === '1\\,234\\,567');
  check('four digits stay whole', groupDigits('5730') === '5730');
  check('decimals, exponents, subscripts and text are left alone', groupDigits('0.0001234567 + 10^{12345} + x_{12345} + \\text{run 12345}') === '0.0001234567 + 10^{12345} + x_{12345} + \\text{run 12345}');
  check('a fraction numerator is grouped', groupDigits('\\frac{12345}{2}') === '\\frac{12\\,345}{2}');
  check('a number already grouped is left alone', groupDigits('26\\,560 + 6{,}371') === '26\\,560 + 6{,}371');
}

// TeX spelled in Unicode, for drop-down options
{
  const { texToPlain } = await import('../src/core/markup.js');
  check('texToPlain: a substitution keeps its function', texToPlain('trigonometric substitution $x = 2\\tan\\theta$') === 'trigonometric substitution x = 2 tan θ');
  check('texToPlain: powers, fractions and roots', texToPlain('$\\dfrac{1}{2}mv^2$') === '1/2 mv²' && texToPlain('$\\sqrt{\\dfrac{GM}{r}}$') === '√(GM/r)');
  check('texToPlain: vectors and hats', texToPlain('$\\vec F = q\\vec v\\times\\vec B$') === 'F\u20d7 = qv\u20d7×B\u20d7' && texToPlain('$\\hat{\\theta}$') === 'θ\u0302');
  check('texToPlain: subscripts', texToPlain('$\\omega_0$ and $T_{\\text{cold}}$') === 'ω₀ and T_cold');
}

check('a power just before a closing bracket: J/(K m^3)', describeDims(parseUnit('J/(K m^3)').dims) === describeDims(parseUnit('J K^-1 m^-3').dims) && parseUnit('m^(1/2)').dims[0] === 0.5);

{
  const item = { type: 'numeric', answer: 10, tol: { rel: 0.02 }, errors: [{ value: 20, feedback: 'far' }, { value: 20.3, feedback: 'near' }] };
  check('overlapping known errors: the nearest one answers', grade(item, '20.3').feedback === 'near' && grade(item, '20').feedback === 'far');
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
