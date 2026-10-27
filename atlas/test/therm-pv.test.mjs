// The DOM-free model behind the PV-diagram simulation (sims/therm-pv.js):
// ideal-gas processes checked against the first law and against numerical
// integration of P dV and dQ/T, entropy as a state function, the Carnot, Otto
// and Brayton efficiencies against their closed forms, and the sim's
// parameter validation.
//   node atlas/test/therm-pv.test.mjs

import * as M from '../src/viz/model/therm-pv.js';
import { validate } from '../src/viz/sims/therm-pv.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 1e-12) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;

// ∫ P dV and ∫ dQ/T along a leg's samples (trapezoids on a fine sampling)
function integrals(L, n, g, N = 20000) {
  const s = M.sampleLeg(L, n, g, N);
  let W = 0, Q = 0, S = 0;
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i];
    const dW = 0.5 * (a.P + b.P) * (b.V - a.V);
    const dQ = n * M.cv(g) * (b.T - a.T) + dW;
    W += dW; Q += dQ; S += dQ / (0.5 * (a.T + b.T));
  }
  return { W, Q, S };
}

// ─── states and heat capacities ────────────────────────────────────────────
check('R is k_B N_A', near(M.R, 1.380649e-23 * 6.02214076e23, 1e-9));
check('C_P − C_V = R for any γ', [5 / 3, 1.4, 1.2].every((g) => near(M.cp(g) - M.cv(g), M.R)));
check('monatomic: C_V = 3R/2, C_P = 5R/2', near(M.cv(5 / 3), 1.5 * M.R) && near(M.cp(5 / 3), 2.5 * M.R));
check('diatomic: C_V = 5R/2, C_P = 7R/2', near(M.cv(1.4), 2.5 * M.R) && near(M.cp(1.4), 3.5 * M.R));
{
  const s = M.state({ P: 101325, T: 273.15 }, 1);
  check('one mole at STP fills 22.41 L', near(s.V, 0.022414, 1e-4), String(s.V));
  const t = M.state({ P: s.P, V: s.V }, 1);
  check('state round trip', near(t.T, 273.15, 1e-12));
}

// ─── every kind of leg obeys the first law, and its W and Q are the integrals ─
{
  const n = 0.8, A = M.state({ P: 200e3, V: 4e-3 }, n);
  for (const g of [5 / 3, 1.4]) {
    const cases = [
      ['isothermal', M.reach('isothermal', A, { V: 9e-3 }, n, g)],
      ['isothermal', M.reach('isothermal', A, { P: 500e3 }, n, g)],
      ['isobaric', M.reach('isobaric', A, { V: 7e-3 }, n, g)],
      ['isobaric', M.reach('isobaric', A, { T: 0.6 * A.T }, n, g)],
      ['isochoric', M.reach('isochoric', A, { P: 350e3 }, n, g)],
      ['isochoric', M.reach('isochoric', A, { T: 0.5 * A.T }, n, g)],
      ['adiabatic', M.reach('adiabatic', A, { V: 10e-3 }, n, g)],
      ['adiabatic', M.reach('adiabatic', A, { P: 900e3 }, n, g)],
      ['adiabatic', M.reach('adiabatic', A, { T: 1.3 * A.T }, n, g)],
      ['line', M.state({ P: 60e3, V: 9e-3 }, n)],
      ['line', M.state({ P: 400e3, V: 1.5e-3 }, n)],
    ];
    for (const [kind, B] of cases) {
      const L = M.leg(kind, A, B, n, g);
      const tag = `${kind} to ${(B.V * 1e3).toFixed(2)} L, γ = ${g.toFixed(2)}`;
      check(`${tag}: B lies on the process`, M.onProcess(kind, A, B, g, 1e-9));
      check(`${tag}: ΔE_int = Q − W`, near(L.dU, L.Q - L.W, 1e-9, 1e-9), `${L.dU} vs ${L.Q - L.W}`);
      const I = integrals(L, n, g);
      check(`${tag}: W = ∫P dV`, near(L.W, I.W, 1e-6, 1e-6), `${L.W} vs ${I.W}`);
      check(`${tag}: Q = ∫dQ`, near(L.Q, I.Q, 1e-6, 1e-6), `${L.Q} vs ${I.Q}`);
      check(`${tag}: ΔS = ∫dQ/T`, near(L.dS, I.S, 1e-5, 1e-8), `${L.dS} vs ${I.S}`);
      check(`${tag}: heat in minus heat out is Q`, near(L.Qin - L.Qout, L.Q, 1e-9, 1e-9));
    }
  }
}
{
  const n = 1, g = 1.4, A = M.state({ T: 300, V: 0.01 }, n);
  const iso = M.leg('isothermal', A, M.reach('isothermal', A, { V: 0.03 }, n, g), n, g);
  check('isothermal: W = nRT ln(V₂/V₁) and ΔE_int = 0', near(iso.W, M.R * 300 * Math.log(3)) && Math.abs(iso.dU) < 1e-9 && near(iso.Q, iso.W));
  const bar = M.leg('isobaric', A, M.reach('isobaric', A, { T: 400 }, n, g), n, g);
  check('isobaric: W = nRΔT, Q = nC_PΔT', near(bar.W, M.R * 100) && near(bar.Q, 3.5 * M.R * 100));
  const cho = M.leg('isochoric', A, M.reach('isochoric', A, { T: 400 }, n, g), n, g);
  check('isochoric: W = 0, Q = nC_VΔT', cho.W === 0 && near(cho.Q, 2.5 * M.R * 100));
  const B = M.reach('adiabatic', A, { V: 0.001 }, n, g);
  const ad = M.leg('adiabatic', A, B, n, g);
  check('adiabatic: T V^(γ−1) is constant (10:1 compression of air, 300 K → 754 K)', near(B.T, 300 * 10 ** 0.4, 1e-12) && near(B.T, M.adiabaticT(300, 10, g), 1e-12));
  check('adiabatic: Q = 0 and W = −nC_VΔT', ad.Q === 0 && near(ad.W, -2.5 * M.R * (B.T - 300)));
  check('adiabatic: ΔS = 0', Math.abs(ad.dS) < 1e-12);
  const pts = M.sampleLeg(ad, n, g, 50);
  check('adiabatic: P V^γ constant along the drawn curve', pts.every((s) => near(s.P * s.V ** g, A.P * A.V ** g, 1e-12)));
  check('adiabatic in T–P form: T₂ = T₁ (P₂/P₁)^((γ−1)/γ)', near(B.T, M.adiabaticTp(300, B.P / A.P, g), 1e-12));
}

// ─── a straight line whose heat changes sign part-way ─────────────────────
{
  const n = 1, g = 5 / 3, A = M.state({ P: 300e3, V: 2e-3 }, n), B = M.state({ P: 50e3, V: 14e-3 }, n);
  const L = M.leg('line', A, B, n, g);
  const s = M.sampleLeg(L, n, g, 40000);
  let qin = 0, qout = 0;
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i];
    const dQ = n * M.cv(g) * (b.T - a.T) + 0.5 * (a.P + b.P) * (b.V - a.V);
    if (dQ > 0) qin += dQ; else qout -= dQ;
  }
  check('line: the heat really does change sign part-way (this one)', L.Qin > 1 && L.Qout > 1, `${L.Qin}, ${L.Qout}`);
  check('line: heat taken in matches the integral of its positive part', near(L.Qin, qin, 1e-6, 1e-6), `${L.Qin} vs ${qin}`);
  check('line: heat given out matches the integral of its negative part', near(L.Qout, qout, 1e-6, 1e-6), `${L.Qout} vs ${qout}`);
}

// ─── free expansion and entropy as a state function ──────────────────────
{
  const n = 2, g = 1.4, A = M.state({ T: 300, V: 0.02 }, n);
  const B = M.reach('free', A, { V: 0.04 }, n, g);
  const L = M.leg('free', A, B, n, g);
  check('free expansion: Q = W = ΔE_int = 0, T unchanged', L.Q === 0 && L.W === 0 && Math.abs(L.dU) < 1e-12 && near(B.T, 300));
  check('free expansion: ΔS = nR ln 2 > 0 though no heat flows', near(L.dS, 2 * M.R * Math.log(2)) && !L.reversible);
  // two reversible routes between the same pair of states change S by the same amount
  const X = M.state({ P: 100e3, V: 0.01 }, 1), Y = M.state({ P: 300e3, V: 0.025 }, 1);
  const via1 = M.path(X, [{ kind: 'isobaric', B: M.state({ P: 100e3, V: 0.025 }, 1) }, { kind: 'isochoric', B: Y }], 1, g);
  const via2 = M.path(X, [{ kind: 'isochoric', B: M.state({ P: 300e3, V: 0.01 }, 1) }, { kind: 'isobaric', B: Y }], 1, g);
  const sum = (legs, k) => legs.reduce((s, q) => s + q[k], 0);
  check('ΔS is path-independent', near(sum(via1, 'dS'), sum(via2, 'dS'), 1e-12));
  check('ΔE_int is path-independent', near(sum(via1, 'dU'), sum(via2, 'dU'), 1e-12));
  check('W is not: the two routes do different work', Math.abs(sum(via1, 'W') - sum(via2, 'W')) > 1000, `${sum(via1, 'W')} vs ${sum(via2, 'W')}`);
  check('…and the work difference is (300 − 100) kPa × 15 L = 3000 J', near(sum(via2, 'W') - sum(via1, 'W'), 3000, 1e-9));
}

// ─── cycles ───────────────────────────────────────────────────────────────
for (const g of [5 / 3, 1.4]) {
  for (const [Th, Tc, ratio] of [[600, 300, 2], [900, 290, 3.5], [373, 273, 1.5]]) {
    const n = 0.3, c = M.carnot({ Th, Tc, VA: 1e-3, ratio, n, g });
    const legs = M.cycleLegs(c, n, g), A = M.analyse(legs, n, g);
    const tag = `Carnot ${Th}/${Tc} K, γ = ${g.toFixed(2)}`;
    check(`${tag}: closed, ΔE_int = 0, ΔS = 0`, A.closed && Math.abs(A.dU) < 1e-9 * A.Qin && Math.abs(A.dS) < 1e-12);
    check(`${tag}: e = 1 − Tc/Th`, near(A.e, M.carnotEfficiency(Tc, Th), 1e-12), `${A.e}`);
    check(`${tag}: Q_h/T_h = Q_c/T_c`, near(A.Qin / Th, A.Qout / Tc, 1e-12));
    check(`${tag}: Q_h = nRT_h ln ratio`, near(A.Qin, n * M.R * Th * Math.log(ratio), 1e-12));
    check(`${tag}: the Carnot limit of its own extremes is its efficiency`, near(A.carnot, A.e, 1e-9));
    const back = M.analyse(M.cycleLegs(M.reversed(c), n, g), n, g);
    check(`${tag} backwards: W changes sign`, near(back.W, -A.W, 1e-12));
    check(`${tag} backwards: cooling COP = Tc/(Th − Tc)`, near(back.copRef, Tc / (Th - Tc), 1e-9), `${back.copRef}`);
    check(`${tag} backwards: heating COP = Th/(Th − Tc) = 1/e`, near(back.copHP, Th / (Th - Tc), 1e-9) && near(back.copHP, 1 / A.e, 1e-9));
  }
}
for (const g of [1.4, 5 / 3]) {
  for (const r of [6, 8, 10, 12]) {
    const c = M.otto({ T1: 300, P1: 100e3, V1: 5e-4, r, T3: 2200, g });
    const A = M.analyse(M.cycleLegs(c, c.n, g), c.n, g);
    const tag = `Otto r = ${r}, γ = ${g.toFixed(2)}`;
    check(`${tag}: e = 1 − r^(1−γ)`, near(A.e, M.ottoEfficiency(r, g), 1e-12), `${A.e} vs ${M.ottoEfficiency(r, g)}`);
    check(`${tag}: e = 1 − T₁/T₂`, near(A.e, 1 - 300 / c.states[1].T, 1e-12));
    check(`${tag}: below the Carnot limit of its extremes`, A.e < A.carnot);
    check(`${tag}: closed, ΔE_int = 0`, A.closed && Math.abs(A.dU) < 1e-9 * A.Qin);
  }
}
check('Otto at r = 10 with air: 60.2 %', near(M.ottoEfficiency(10, 1.4), 0.6019, 2e-4));
for (const g of [1.4, 5 / 3]) {
  for (const rp of [5, 10, 20, 40]) {
    const n = 1000 / 28.965, c = M.brayton({ T1: 288, P1: 101325, rp, T3: 1600, n, g });
    const A = M.analyse(M.cycleLegs(c, n, g), n, g);
    const tag = `Brayton rp = ${rp}, γ = ${g.toFixed(2)}`;
    check(`${tag}: e = 1 − rp^(−(γ−1)/γ)`, near(A.e, M.braytonEfficiency(rp, g), 1e-12), `${A.e} vs ${M.braytonEfficiency(rp, g)}`);
    check(`${tag}: e = 1 − T₁/T₂ = 1 − T₄/T₃`, near(A.e, 1 - 288 / c.states[1].T, 1e-12) && near(A.e, 1 - c.states[3].T / 1600, 1e-12));
    if (c.states[1].T < 1600) check(`${tag}: below the Carnot limit`, A.e < A.carnot);
  }
}
check('Brayton at rp = 40 with air: 65.1 %', near(M.braytonEfficiency(40, 1.4), 0.651, 1e-3));
{
  // a Brayton cycle whose turbine inlet is cooler than the compressor outlet runs as a refrigerator (an air-cycle machine)
  const n = 1, g = 1.4, c = M.brayton({ T1: 290, P1: 100e3, rp: 3, T3: 320, n, g });
  const A = M.analyse(M.cycleLegs(c, n, g), n, g);
  check('Brayton with T₃ < T₂: net work is done on the gas', A.W < 0, String(A.W));
  check('…and its cooling COP is 1/(rp^((γ−1)/γ) − 1)', near(A.copRef, 1 / (3 ** (0.4 / 1.4) - 1), 1e-9), `${A.copRef}`);
}
{
  const n = 0.05, g = 5 / 3, c = M.rect({ V1: 1e-3, V2: 3e-3, P1: 100e3, P2: 300e3, n });
  const A = M.analyse(M.cycleLegs(c, n, g), n, g);
  check('rectangle: W = ΔP ΔV = 400 J', near(A.W, 400, 1e-12));
  check('rectangle: Q_in on the two legs that heat it', near(A.Qin, 1.5 * 200e3 * 1e-3 + 2.5 * 300e3 * 2e-3, 1e-12), String(A.Qin));
  check('rectangle: e below the Carnot limit', A.e < A.carnot && near(A.carnot, 1 - c.states[0].T / c.states[2].T, 1e-12));
}

// ─── the sim's parameter check ─────────────────────────────────────────────
const ok = (p) => validate(p).length === 0;
check('validate: a process', ok({ mode: 'process', start: { P: 100, V: 1 }, process: 'adiabatic', end: { V: 0.2 }, controls: ['end', 'gas'], gases: ['air', 'He'] }), validate({ mode: 'process', start: { P: 100, V: 1 }, process: 'adiabatic', end: { V: 0.2 } }).join('; '));
check('validate: an isochoric process may end at a temperature', ok({ mode: 'process', start: { P: 100, T: 300 }, process: 'isochoric', end: { T: 450 } }));
check('validate: an unknown process is caught', !ok({ mode: 'process', process: 'isentropic' }));
check('validate: an isochoric process cannot end at a volume', !ok({ mode: 'process', process: 'isochoric', end: { V: 3 } }));
check('validate: a process that goes nowhere is caught', !ok({ mode: 'process', process: 'isothermal', start: { P: 100, V: 1 }, end: { V: 1 } }));
const two = { mode: 'paths', states: { A: { P: 300, V: 1 }, B: { P: 100, V: 3 }, C: { P: 300, V: 3 }, D: { P: 100, V: 1 } }, paths: [{ from: 'A', legs: [['isobaric', 'C'], ['isochoric', 'B']] }, { from: 'A', legs: [['isochoric', 'D'], ['isobaric', 'B']] }] };
check('validate: two paths', ok(two), validate(two).join('; '));
check('validate: a leg that is not the process it claims', !ok({ ...two, paths: [{ from: 'A', legs: [['isobaric', 'B']] }] }));
check('validate: an unknown state', !ok({ ...two, paths: [{ from: 'A', legs: [['line', 'Z']] }] }));
check('validate: a cycle with sliders', ok({ mode: 'cycle', cycle: 'brayton', rp: 20, T3: 1600, controls: ['rp', 'T3'], vunit: 'm3', n: 34.5 }));
check('validate: a slider value outside its range', !ok({ mode: 'cycle', cycle: 'brayton', rp: 80, controls: ['rp'] }));
check('validate: Carnot needs Th > Tc', !ok({ mode: 'cycle', cycle: 'carnot', Th: 300, Tc: 400 }));
check('validate: an energy-flow diagram must balance', ok({ mode: 'flow', Qh: 1000, Qc: 650, W: 350 }) && !ok({ mode: 'flow', Qh: 1000, Qc: 650, W: 300 }));
check('validate: unknown readouts are caught', !ok({ mode: 'process', readouts: ['efficiency'] }));
check('validate: state readouts are allowed', ok({ mode: 'process', readouts: ['T2', 'W'] }));

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
