// The DOM-free model behind the mech-fbd, mech-frames and mech-drag simulations.
//   node atlas/test/mech-forces.test.mjs

import * as M from '../src/viz/model/mech-forces.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 1e-9) => Math.abs(a - b) <= abs + rel * Math.abs(b);
const g = M.G;

// Newton's second law holds for every body of every scene: the forces drawn add up to m·a
function newton(name, out) {
  for (const b of out.bodies) {
    if (!b.a || b.m === undefined) continue;
    const [Fx, Fy] = M.netForce(b);
    check(`${name}: ΣF = m a for ${b.key}`, near(Fx, b.m * b.a[0], 1e-9, 1e-7) && near(Fy, b.m * b.a[1], 1e-9, 1e-7), `ΣF = (${Fx}, ${Fy}), m a = (${b.m * b.a[0]}, ${b.m * b.a[1]})`);
  }
}
for (const F of [0, 20, 40, 60, 120, 400]) for (const phi of [-30, 0, 25, 60]) for (const moving of [false, true]) {
  newton(`floor F=${F} φ=${phi} moving=${moving}`, M.floor({ m: 10, F, phi, mus: 0.5, muk: 0.3, moving }));
}
for (const theta of [0, 10, 26.5, 35, 60]) for (const F of [0, 30, 90]) for (const moving of [-1, 0, 1]) {
  newton(`incline θ=${theta} F=${F} moving=${moving}`, M.incline({ m: 8, theta, mus: 0.5, muk: 0.4, F, moving }));
}
for (const [th1, th2] of [[30, 60], [45, 45], [10, 10], [70, 0], [20, 80]]) for (const a of [0, 2, -3]) newton(`hang ${th1}/${th2} a=${a}`, M.hang({ m: 15, th1, th2, a }));
newton('hang one rope', M.hang({ m: 5, ropes: 1, a: 1.2 }));
for (const n of [1, 2, 3, 4]) newton(`pulley n=${n}`, M.pulley({ m: 40, n, a: 0.5 }));
for (const a of [-9.8, -4, 0, 3]) newton(`elevator a=${a}`, M.elevator({ m: 70, a }));
for (const [m1, m2] of [[3, 5], [5, 3], [2, 2], [0.5, 9]]) newton(`atwood ${m1}/${m2}`, M.atwood({ m1, m2 }));
for (const theta of [0, 20, 40]) for (const [m2, moving] of [[1, false], [3, false], [6, false], [3, true]]) newton(`table θ=${theta} m2=${m2}`, M.table({ m1: 5, m2, mus: 0.4, muk: 0.25, theta, moving }));
for (const link of ['push', 'pull']) for (const muk of [0, 0.2]) newton(`pair ${link} μk=${muk}`, M.pair({ m1: 4, m2: 2, F: 30, muk, link }));
for (const v of [0, 8, 15, 22, 35]) for (const theta of [0, 12, 30]) newton(`banked v=${v} θ=${theta}`, M.banked({ m: 1200, v, R: 60, theta, mus: 0.5 }));
for (const where of ['hill', 'dip', 'loop-top', 'loop-bottom']) for (const v of [5, 12, 25]) newton(`crest ${where} v=${v}`, M.crest({ m: 800, v, R: 15, where }));
for (const phi of [10, 25, 45, 60]) newton(`turn φ=${phi}`, M.turn({ m: 70000, v: 120, phi }));

// numbers a lesson quotes
const at = M.atwood({ m1: 3, m2: 5 });
check('Atwood 3 kg and 5 kg: a = 2.45 m/s², T = 36.75 N', near(at.info.a, 2.45) && near(at.info.T, 36.75));
check('Atwood: T lies between the two weights', at.info.T > 3 * g && at.info.T < 5 * g);
check('equal Atwood masses: a = 0, T = mg', near(M.atwood({ m1: 2, m2: 2 }).info.a, 0) && near(M.atwood({ m1: 2, m2: 2 }).info.T, 2 * g));

const held = M.floor({ m: 10, F: 49, mus: 0.5, muk: 0.3 }), slid = M.floor({ m: 10, F: 49.5, mus: 0.5, muk: 0.3 });
check('static friction matches the push up to μs N', held.info.state === 'static' && near(held.info.f, -49) && held.info.a === 0);
check('above μs N the block slides with kinetic friction μk N', slid.info.state === 'sliding' && near(slid.info.f, -0.3 * 98) && near(slid.info.a, (49.5 - 29.4) / 10));
check('a gentle push is met by an equal static friction, not μs N', near(M.floor({ m: 20, F: 30, mus: 0.5, muk: 0.4 }).info.f, -30));
check('pulling up at an angle lowers the normal force: N = mg − F sin φ', near(M.floor({ m: 10, F: 40, phi: 30 }).info.N, 98 - 20));
check('pushing down at an angle raises it: N = mg + F sin|φ|', near(M.floor({ m: 10, F: 40, phi: -30 }).info.N, 98 + 20));
check('a big enough upward pull lifts the block off the floor', M.floor({ m: 1, F: 20, phi: 90 }).info.state === 'lifts');

const rep = M.incline({ m: 2, theta: Math.atan(0.6) * 180 / Math.PI, mus: 0.6, muk: 0.45 });
check('incline at the angle of repose (tan θ = μs) still holds', rep.info.state === 'static' && near(rep.info.repose, 30.96375653, 1e-8));
const steep = M.incline({ m: 2, theta: 35, mus: 0.6, muk: 0.45 }), r35 = 35 * Math.PI / 180;
check('above the angle of repose it slides with a = −g(sin θ − μk cos θ)', steep.info.state === 'down' && near(steep.info.a, -g * (Math.sin(r35) - 0.45 * Math.cos(r35))));
check('frictionless slope: a = −g sin θ, N = mg cos θ', near(M.incline({ m: 3, theta: 30 }).info.a, -g / 2) && near(M.incline({ m: 3, theta: 30 }).info.N, 3 * g * Math.cos(Math.PI / 6)));
check('a block at rest on a slope feels friction mg sin θ, not μs N', near(M.incline({ m: 4, theta: 20, mus: 0.8 }).info.f, 4 * g * Math.sin(20 * Math.PI / 180)));
check('sliding up, friction points down the slope: a = −g(sin θ + μk cos θ)', near(M.incline({ m: 1, theta: 30, muk: 0.2, moving: 1 }).info.a, -g * (0.5 + 0.2 * Math.cos(Math.PI / 6))));

const h = M.hang({ m: 15, th1: 30, th2: 60 });
check('hang 30°/60°: T₁ = W cos 60°, T₂ = W cos 30°', near(h.info.T1, 15 * g * 0.5) && near(h.info.T2, 15 * g * Math.cos(Math.PI / 6)));
for (const th of [5, 15, 45, 80]) check(`symmetric hang at ${th}°: T = mg / (2 sin θ)`, near(M.hang({ m: 2, th1: th, th2: th }).info.T1, (2 * g) / (2 * Math.sin(th * Math.PI / 180))));
check('pulled aside by a horizontal force: F = mg cot θ', near(M.hang({ m: 2, th1: 60, th2: 0 }).info.T2, 2 * g / Math.tan(Math.PI / 3)));
check('block and tackle with 4 strands: T = mg/4', near(M.pulley({ m: 40, n: 4 }).info.T, 98));
check('elevator: 60 kg accelerating up at 1.5 m/s² reads 678 N', near(M.elevator({ m: 60, a: 1.5 }).info.N, 678));
check('elevator in free fall: the scale reads zero', M.elevator({ m: 60, a: -g }).info.N === 0);
check('frictionless table: a = m₂g/(m₁ + m₂)', near(M.table({ m1: 6, m2: 2 }).info.a, 2 * g / 8));
check('table with μs holds when m₂ ≤ μs m₁', M.table({ m1: 10, m2: 3, mus: 0.4, muk: 0.3 }).info.state === 'static' && near(M.table({ m1: 10, m2: 3, mus: 0.4 }).info.T, 3 * g));
check('table sliding: T = m₂(g − a)', near(M.table({ m1: 5, m2: 3, muk: 0.2, moving: true }).info.T, 3 * (g - (3 * g - 0.2 * 5 * g) / 8)));
check('two blocks pushed: P = m₂F/(m₁ + m₂), with or without friction', near(M.pair({ m1: 4, m2: 2, F: 18 }).info.P, 6) && near(M.pair({ m1: 4, m2: 2, F: 18, muk: 0.1 }).info.P, 6));
check('the contact forces are a third-law pair: equal and opposite', (() => { const p = M.pair({ m1: 3, m2: 7, F: 20 }); const a = p.bodies[0].forces.find((f) => f.key === 'P'), b = p.bodies[1].forces.find((f) => f.key === 'P'); return near(a.fx, -b.fx) && a.fx < 0; })());

const bk = M.banked({ m: 1000, v: Math.sqrt(80 * g * Math.tan(15 * Math.PI / 180)), R: 80, theta: 15, mus: 0.3 });
check('banked curve at the design speed needs no friction', near(bk.info.f, 0, 1e-9, 1e-6) && bk.info.holds);
const flat = M.banked({ m: 1000, v: 10, R: 50, theta: 0, mus: 0.6 });
check('flat curve: v_max = √(μs g R)', near(flat.info.vmax, Math.sqrt(0.6 * g * 50)) && flat.info.vmin === 0);
const bvm = M.banked({ m: 1000, v: 0, R: 80, theta: 15, mus: 0.3 });
check('banked curve at v_max needs exactly μs N, down the slope', near(M.banked({ m: 1000, v: bvm.info.vmax, R: 80, theta: 15, mus: 0.3 }).info.need, -M.banked({ m: 1000, v: bvm.info.vmax, R: 80, theta: 15, mus: 0.3 }).info.fMax, 1e-9, 1e-6));
const atMin = M.banked({ m: 1000, v: M.banked({ m: 1000, v: 0, R: 80, theta: 40, mus: 0.3 }).info.vmin, R: 80, theta: 40, mus: 0.3 });
check('steep banked curve at v_min needs exactly μs N, up the slope', near(atMin.info.need, atMin.info.fMax, 1e-9, 1e-6) && atMin.info.need > 0);
check('too fast on a flat curve: the car slides outward', M.banked({ m: 1000, v: 30, R: 50, theta: 0, mus: 0.6 }).info.slides === 1);
check('hill crest at √(gR): the road pushes nothing', near(M.crest({ m: 900, v: Math.sqrt(g * 20), R: 20, where: 'hill' }).info.N, 0, 1e-9, 1e-6));
check('loop top at √(gR): the track pushes nothing', near(M.crest({ m: 900, v: Math.sqrt(g * 20), R: 20, where: 'loop-top' }).info.N, 0, 1e-9, 1e-6));
check('bottom of a dip: N = m(g + v²/R)', near(M.crest({ m: 900, v: 10, R: 20, where: 'dip' }).info.N, 900 * (g + 5)));
const tn = M.turn({ m: 70000, v: 120, phi: 25 });
check('level turn: R = v²/(g tan φ), load factor 1/cos φ', near(tn.info.R, 14400 / (g * Math.tan(25 * Math.PI / 180))) && near(tn.info.n, 1 / Math.cos(25 * Math.PI / 180)));

// drag
const vt = M.terminalSpeed(80, 0.43, 1.225);
check('skydiver, 80 kg, C_D A = 0.43 m²: terminal speed ≈ 55 m/s', near(vt, 54.6, 0.01), String(vt));
check('drag equals weight at terminal speed', near(M.dragForce(vt, 0.43, 1.225), 80 * g));
for (const t of [0.5, 2, 5, 10]) {
  const h1 = 1e-4, dv = (M.fallSpeed(t + h1, vt) - M.fallSpeed(t - h1, vt)) / (2 * h1);
  const v = M.fallSpeed(t, vt);
  check(`v_t tanh(gt/v_t) solves dv/dt = g − (g/v_t²) v² at t = ${t} s`, near(dv, g - (g * v * v) / (vt * vt), 1e-6, 1e-6));
}
{
  let s = 0; const T = 12, n = 24000;
  for (let k = 0; k < n; k++) s += (M.fallSpeed((k * T) / n, vt) + M.fallSpeed(((k + 1) * T) / n, vt)) * T / (2 * n);
  check('distance fallen is the integral of the speed', near(M.fallDistance(T, vt), s, 1e-6));
  check('distance formula is stable far beyond terminal speed', Number.isFinite(M.fallDistance(400, 5)) && near(M.fallDistance(400, 5), (25 / g) * ((g * 400) / 5 - Math.LN2), 1e-9));
}
check('time to 95% of terminal speed', near(M.fallSpeed(M.timeToFraction(0.95, vt), vt), 0.95 * vt));
check('linear drag approaches the same terminal speed', near(M.fallSpeedLinear(1e3, 7), 7) && near(M.fallSpeedLinear(0, 7), 0));
check('sea-level density 1.225 kg/m³', M.airDensity(0) === 1.225);
check('density at 30 km from the table', near(M.airDensity(30), 0.01841));
check('density falls with height', [0, 1, 3, 7, 12, 18, 27, 33, 39].every((h, k, A) => k === 0 || M.airDensity(h) < M.airDensity(A[k - 1])));
check('speed of sound 340 m/s at sea level', near(M.soundSpeed(0), 340.3, 1e-3));
check('speed of sound 295 m/s in the cold layer from 11 to 20 km', near(M.soundSpeed(11), 295.1, 1e-3) && near(M.soundSpeed(18), 295.1, 1e-3));
check('speed of sound 302 m/s at 30 km', near(M.soundSpeed(30), 301.7, 1e-3));
check('temperature profile is continuous', [11, 20, 32].every((h) => Math.abs(M.airTemperature(h - 1e-9) - M.airTemperature(h + 1e-9)) < 1e-6));
{
  // a stratospheric jump: falling from 39 km through ever denser air, the speed peaks where it meets the local terminal speed
  const vt0 = 55, k = (2 * g) / (1.225 * vt0 * vt0);
  let h = 38969, v = 0, best = { v: 0, h };
  for (let i = 0; i < 400000 && h > 1000; i++) { const a = g - 0.5 * M.airDensity(h / 1000) * k * v * v; v += a * 0.005; h -= v * 0.005; if (v > best.v) best = { v, h }; }
  const vtThere = vt0 * Math.sqrt(1.225 / M.airDensity(best.h / 1000));
  check('high-altitude jump: speed peaks where drag equals weight', near(best.v, vtThere, 2e-3));
  check('high-altitude jump: peak faster than sound there', best.v > M.soundSpeed(best.h / 1000));
}

// frames
check('train speeding up from rest', near(M.trainAt('speed-up', 2, 0, 3).x, 9) && near(M.trainAt('speed-up', 2, 0, 3).v, 6));
check('braking train stops and stays stopped', near(M.trainAt('brake', 2, 10, 8).x, 25) && M.trainAt('brake', 2, 10, 8).v === 0);
{
  const A = 2, xb = 4, len = 8, tw = Math.sqrt((2 * xb) / A);
  const before = M.ballAt('speed-up', A, 0, tw * 0.9, xb, len), after = M.ballAt('speed-up', A, 0, tw * 1.3, xb, len);
  check('in the ground frame the ball stays put while the car speeds up under it', before.x === xb && !before.pushed && before.v === 0);
  check('until the back wall reaches it and pushes it along', after.pushed && near(after.inCar, 0) && near(after.v, A * tw * 1.3));
  const br = M.ballAt('brake', 2, 6, 1, 4, 8);
  check('braking: the ball keeps the starting speed and slides toward the front', near(br.x, 10) && near(br.inCar, 10 - (6 - 1)));
  const st = M.ballAt('steady', 2, 6, 5, 4, 8);
  check('steady motion: the ball stays at the same place in the car', near(st.inCar, 4) && !st.pushed);
}
check('pendulum in a car accelerating at g hangs at 45°', near(M.pendulumTilt(g), 45));

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
