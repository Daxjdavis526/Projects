// The DOM-free model behind the energy diagrams (sims/mech-energy.js):
// turning points, allowed regions and equilibria of a potential, and motion in
// it — with and without friction, on a line and as a bead on a wire — checked
// against closed-form results.
//   node atlas/test/mech-energy.test.mjs

import * as ME from '../src/viz/model/mech-energy.js';
import { validate } from '../src/viz/sims/mech-energy.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const run = (sys, s, T, frame = 1 / 120) => { for (let t = 0; t < T - 1e-12 && !s.rest; t += frame) ME.advance(sys, s, Math.min(frame, T - t), 20); return s; };

// ─── analysis of a landscape ──────────────────────────────────────────────
{
  const spring = (x) => 2 * x * x;                    // k = 4 N/m
  const tp = ME.turningPoints(spring, 8, [-3, 3]);
  check('spring: turning points at ±√(2E/k) = ±2 m', tp.length === 2 && near(tp[0], -2) && near(tp[1], 2), JSON.stringify(tp));
  const well = (x) => (x * x - 4) ** 2;              // double well, barrier 16 J at x = 0
  const eq = ME.equilibria(well, [-3, 3]);
  check('double well: three equilibria', eq.length === 3, JSON.stringify(eq));
  check('double well: stable, unstable, stable', eq.map((q) => q.kind).join() === 'stable,unstable,stable');
  check('double well: at −2, 0 and 2 m', near(eq[0].x, -2, 1e-6) && near(eq[1].x, 0, 1e-6) && near(eq[2].x, 2, 1e-6));
  const iv = ME.allowed(well, 9, [-3, 3]);
  check('double well below the barrier: two allowed stretches, 1 ≤ |x| ≤ √7', iv.length === 2 && near(iv[0][0], -Math.sqrt(7)) && near(iv[0][1], -1) && near(iv[1][0], 1) && near(iv[1][1], Math.sqrt(7)), JSON.stringify(iv));
  const iv2 = ME.allowed(well, 20, [-3, 3]);
  check('double well above the barrier: one stretch across it', iv2.length === 1 && iv2[0][0] < -2 && iv2[0][1] > 2, JSON.stringify(iv2));
  const flat = ME.equilibria((x) => Math.max(0, x * x - 1), [-3, 3]);
  check('a level stretch is one neutral equilibrium', flat.length === 1 && flat[0].kind === 'neutral' && near(flat[0].from, -1, 0.01) && near(flat[0].to, 1, 0.01), JSON.stringify(flat));
  const vee = ME.equilibria((x) => Math.abs(x - 0.3), [-2, 2]);
  check('the bottom of a V is stable', vee.length === 1 && vee[0].kind === 'stable' && near(vee[0].x, 0.3, 1e-6), JSON.stringify(vee));
  check('downhill from 0.5 m in the double well ends at the 2 m minimum', near(ME.downhill(well, 0.5, [-3, 3]), 2, 1e-6));
  // a molecule-like (Morse) well: equilibrium at r0, and turning points for a bound energy
  const D = 4.5, a = 2, r0 = 0.74;
  const morse = (r) => D * (1 - Math.exp(-a * (r - r0))) ** 2 - D;
  const eqm = ME.equilibria(morse, [0.3, 4]);
  check('Morse well: one stable equilibrium at r0', eqm.length === 1 && eqm[0].kind === 'stable' && near(eqm[0].x, r0, 1e-6), JSON.stringify(eqm));
  const E = -2, tpm = ME.turningPoints(morse, E, [0.3, 4]);
  const exact = [r0 - Math.log(1 + Math.sqrt((E + D) / D)) / a, r0 - Math.log(1 - Math.sqrt((E + D) / D)) / a];
  check('Morse well: turning points match the closed form', tpm.length === 2 && near(tpm[0], exact[0], 1e-9) && near(tpm[1], exact[1], 1e-9), `${tpm} vs ${exact}`);
}

// ─── motion without friction ──────────────────────────────────────────────
{
  const k = 4, m = 1, sys = ME.system({ U: (x) => 0.5 * k * x * x, m, span: 6 });
  const T = 2 * Math.PI * Math.sqrt(m / k);
  const s = run(sys, ME.state(1, 0), T / 2, T / 200);
  check('spring: after half a period x = −A', near(s.x, -1, 1e-8) && Math.abs(s.v) < 1e-7, `${s.x}, ${s.v}`);
  const w = ME.system({ U: (x) => (x * x - 4) ** 2, m: 1, span: 6 });
  const q = ME.state(0.5, 1), E0 = ME.energies(w, q).E;
  run(w, q, 100, 1 / 60);
  check('double well: energy conserved over 100 s of RK4', near(ME.energies(w, q).E, E0, 1e-8), String(ME.energies(w, q).E - E0));
  const p = ME.state(1.3, -0.4);
  p.v = 0.9; ME.project(w, p, 7);
  check('project puts K on E − U exactly', near(ME.energies(w, p).E, 7, 1e-12));
}

// ─── kinetic friction of fixed size (a block on a spring on a rough floor) ──
{
  const k = 10, m = 1, f = 0.7, sys = ME.system({ U: (x) => 0.5 * k * x * x, m, friction: () => f, span: 4 });
  const s = ME.state(1, 0);
  // each half swing loses 2f/k of amplitude: 1 → −0.86 → 0.72 → … ; it stops at the first turning point with |x| ≤ f/k
  const first = ME.state(1, 0);
  let xmin = 1;
  for (let i = 0; i < 20000; i++) { ME.advance(sys, first, 1e-4, 2); xmin = Math.min(xmin, first.x); if (first.v > 0) break; }
  const turns = [xmin];
  for (let i = 0; i < 4000 && !s.rest; i++) ME.advance(sys, s, 1 / 240, 20);
  const amp = [1]; while (amp[amp.length - 1] > f / k) amp.push(amp[amp.length - 1] - 2 * f / k);
  const stopAt = (amp.length % 2 ? 1 : -1) * amp[amp.length - 1];
  check('friction: the block comes to rest', s.rest);
  check('friction: it stops where the amplitude ladder says', near(s.x, stopAt, 1e-6), `${s.x} vs ${stopAt}`);
  check('friction: first turning point at −(1 − 2f/k)', near(turns[0], -(1 - 2 * f / k), 1e-6), String(turns[0]));
  check('friction: thermal energy = energy lost', near(s.th, 0.5 * k - 0.5 * k * s.x * s.x, 1e-6), `${s.th}`);
  const stuck = ME.state(0.05, 0);
  ME.advance(sys, stuck, 1, 20);
  check('friction: released inside |x| ≤ f/k it never moves', stuck.rest && stuck.x === 0.05);
}

// ─── a bead on a wire ─────────────────────────────────────────────────────
{
  const sys = ME.system({ h: (x) => x * x / 2, m: 2, span: 4 });
  const s = ME.state(1, 0);
  let vmax = 0;
  const E0 = ME.energies(sys, s).E;
  for (let i = 0; i < 3000; i++) { ME.advance(sys, s, 1 / 600, 20); vmax = Math.max(vmax, ME.speed(sys, s)); }
  check('bead: fastest at the bottom, v = √(2gh)', near(vmax, Math.sqrt(2 * 9.8 * 0.5), 1e-6), `${vmax}`);
  check('bead: energy conserved along the wire', near(ME.energies(sys, s).E, E0, 1e-8));
  check('bead: K uses the speed along the wire', near(ME.kinetic(sys, { x: 1, v: 1 }), 0.5 * 2 * 2 * 1, 1e-6));
  check('bead: the force along the wire is −mg sin θ', near(ME.force(sys, 1), -2 * 9.8 / Math.sqrt(2), 1e-6));
  // a rough level stretch: it stops after v²/(2μg)
  const mu = 0.25, rough = ME.system({ h: () => 0, m: 3, friction: (x) => (x >= 0 && x <= 10 ? mu * 3 * 9.8 : 0), span: 12 });
  const r = ME.state(-0.5, 4);
  run(rough, r, 10);
  check('rough stretch: stops after v²/(2μg)', r.rest && near(r.x, 16 / (2 * mu * 9.8), 1e-3), `${r.x}`);
  check('rough stretch: thermal energy = the kinetic energy it had', near(r.th, 0.5 * 3 * 16, 1e-6), `${r.th}`);
}

// ─── the simulation's parameter check ─────────────────────────────────────
{
  check('validate: a plain potential is fine', validate({ U: '2*x^2', E: 3 }).length === 0, validate({ U: '2*x^2', E: 3 }).join('; '));
  check('validate: a track is fine', validate({ h: '2 - x^2/4', x: [-3, 3] }).length === 0);
  check('validate: a bad expression is caught', validate({ U: '2*x^^2', E: 3 }).length > 0);
  check('validate: U or h is required', validate({}).length > 0);
  check('validate: a rough stretch on a slope is caught', validate({ h: 'x', x: [0, 5], rough: [{ from: 1, to: 2, mu: 0.2 }] }).length > 0);
  check('validate: a level rough stretch is fine', validate({ h: 'max(0, 2 - x)', x: [0, 6], rough: [{ from: 3, to: 5, mu: 0.2 }] }).length === 0, validate({ h: 'max(0, 2 - x)', x: [0, 6], rough: [{ from: 3, to: 5, mu: 0.2 }] }).join('; '));
  check('validate: unknown readouts are caught', validate({ U: 'x^2', E: 1, readouts: ['K', 'speedo'] }).length > 0);
  check('validate: sliders may set E and x0', validate({ U: 'k*x^2/2', sliders: [{ key: 'k', label: 'k', min: 1, max: 5, value: 2 }, { key: 'E', label: 'E', min: 0, max: 5, value: 2 }] }).length === 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
