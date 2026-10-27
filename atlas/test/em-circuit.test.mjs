// The DOM-free circuit model behind the em-circuit simulation.
//   node atlas/test/em-circuit.test.mjs
// Kirchhoff's junction and loop rules hold to 1e-12 on random networks and on
// every preset in every switch position; RC curves match V₀(1 − e^(−t/RC));
// multi-capacitor transients match a fine RK4 integration; energy is conserved.

import * as M from '../src/viz/model/em-circuit.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-12, abs = 0) => Math.abs(a - b) <= abs + rel * Math.max(Math.abs(a), Math.abs(b));
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// the voltage drop a→b of an element from its own law (not from node potentials)
function lawDrop(e, I, vC) {
  if (e.kind === 'R' || e.kind === 'L' || e.kind === 'G') return I * e.R;
  if (e.kind === 'B') return -e.emf + (e.r || 0) * I;
  if (e.kind === 'C') return vC[e.id] ?? 0;
  return 0;   // wire, ammeter, closed switch
}

/** KCL at every node, KVL around every fundamental loop (from element laws), Tellegen's ΣP = 0. */
function kirchhoff(circuit, st, vC = {}) {
  const live = circuit.elements.filter(M.present);
  // scales: the largest current, but never below a physical one (emf over the largest resistance),
  // so a circuit whose currents are all zero is not judged by its rounding noise
  const emf = Math.max(0, ...live.filter((e) => e.kind === 'B').map((e) => Math.abs(e.emf)), ...Object.values(vC).map(Math.abs));
  const Rmax = Math.max(1, ...live.filter((e) => e.R).map((e) => e.R));
  const Iscale = Math.max(1e-300, emf / Rmax, ...live.map((e) => Math.abs(st.I[e.id])));
  const Vscale = Math.max(1e-300, emf, ...live.map((e) => Math.abs(lawDrop(e, st.I[e.id], vC))), ...st.V.map(Math.abs));
  let kcl = 0;
  for (let n = 0; n < circuit.nodes; n++) {
    let s = 0;
    for (const e of live) { if (e.a === n) s += st.I[e.id]; if (e.b === n) s -= st.I[e.id]; }
    kcl = Math.max(kcl, Math.abs(s) / Iscale);
  }
  // a spanning forest of the live elements; every other element closes one fundamental loop
  const adj = Array.from({ length: circuit.nodes }, () => []);
  const tree = new Set(), parent = new Array(circuit.nodes).fill(null), depth = new Array(circuit.nodes).fill(-1);
  for (const e of live) { adj[e.a].push([e, e.b, +1]); adj[e.b].push([e, e.a, -1]); }
  for (let r = 0; r < circuit.nodes; r++) {
    if (depth[r] >= 0) continue;
    depth[r] = 0;
    const stack = [r];
    while (stack.length) {
      const u = stack.pop();
      for (const [e, v, dir] of adj[u]) if (depth[v] < 0) { depth[v] = depth[u] + 1; parent[v] = [u, e, dir]; tree.add(e.id); stack.push(v); }
    }
  }
  // drop from node x up to the root along the tree: Σ (V_x − V_parent)
  const upDrop = (x) => { let s = 0; while (parent[x]) { const [u, e, dir] = parent[x]; s += -dir * lawDrop(e, st.I[e.id], vC); x = u; } return s; };
  let kvl = 0, loops = 0;
  for (const e of live) {
    if (tree.has(e.id)) continue;
    loops++;
    // around the loop: a → b through e, then b back up to a through the tree
    const sum = lawDrop(e, st.I[e.id], vC) + upDrop(e.b) - upDrop(e.a);
    kvl = Math.max(kvl, Math.abs(sum) / Vscale);
  }
  const Psum = live.reduce((s, e) => s + st.drop[e.id] * st.I[e.id], 0), Pabs = live.reduce((s, e) => s + Math.abs(st.drop[e.id] * st.I[e.id]), 0);
  return { kcl, kvl, loops, tellegen: Math.abs(Psum) / Math.max(1e-300, Pabs, (emf * emf) / Rmax) };
}

// ─── random resistor networks with batteries ──────────────────────────────
{
  let worst = { kcl: 0, kvl: 0, tellegen: 0 }, loops = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const r = rng(seed);
    const N = 3 + Math.floor(r() * 8);
    const els = [];
    let id = 0;
    const randEl = (a, b, tree) => {
      const u = r();
      if (u < 0.2) return { id: `B${id++}`, kind: 'B', a, b, emf: 1 + 23 * r(), r: 0.05 + 2 * r() };
      if (tree && u < 0.35) return { id: `W${id++}`, kind: 'W', a, b };
      return { id: `R${id++}`, kind: 'R', a, b, R: 10 ** (3 * r()) };
    };
    for (let i = 1; i < N; i++) els.push(randEl(i, Math.floor(r() * i), true));
    const extra = 1 + Math.floor(r() * 2 * N);
    for (let k = 0; k < extra; k++) {
      const a = Math.floor(r() * N); let b = Math.floor(r() * N); if (b === a) b = (a + 1) % N;
      els.push(randEl(a, b, false));
    }
    const circuit = { nodes: N, elements: els };
    const st = M.solve(circuit);
    const k = kirchhoff(circuit, st);
    loops += k.loops;
    for (const q of ['kcl', 'kvl', 'tellegen']) worst[q] = Math.max(worst[q], k[q]);
  }
  check(`random networks: the junction rule holds to 1e-12 (worst ${worst.kcl.toExponential(1)})`, worst.kcl < 1e-12);
  check(`random networks: the loop rule holds to 1e-12 around ${loops} loops (worst ${worst.kvl.toExponential(1)})`, worst.kvl < 1e-12);
  check(`random networks: power delivered = power absorbed (worst ${worst.tellegen.toExponential(1)})`, worst.tellegen < 1e-12);
}

// ─── random RC networks: Kirchhoff at every instant, energy conserved ─────
{
  let worst = 0, worstE = 0, nets = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const r = rng(1000 + seed);
    const N = 3 + Math.floor(r() * 6);
    const els = [];
    let id = 0;
    // capacitors and wires only on tree edges, every chord resistive: no loop of capacitors and wires
    for (let i = 1; i < N; i++) {
      const u = r(), a = i, b = Math.floor(r() * i);
      els.push(u < 0.35 ? { id: `C${id++}`, kind: 'C', a, b, C: 10 ** (-4 + 2 * r()) } : u < 0.5 ? { id: `B${id++}`, kind: 'B', a, b, emf: 1 + 23 * r(), r: 0.1 + r() } : { id: `R${id++}`, kind: 'R', a, b, R: 10 ** (1 + 3 * r()) });
    }
    for (let k = 0; k < 1 + Math.floor(r() * N); k++) {
      const a = Math.floor(r() * N); let b = Math.floor(r() * N); if (b === a) b = (a + 1) % N;
      els.push(r() < 0.2 ? { id: `B${id++}`, kind: 'B', a, b, emf: 1 + 23 * r(), r: 0.1 + r() } : { id: `R${id++}`, kind: 'R', a, b, R: 10 ** (1 + 3 * r()) });
    }
    const c = { nodes: N, elements: els };
    const v0 = Object.fromEntries(els.filter((e) => e.kind === 'C').map((e) => [e.id, 10 * r() - 5]));
    const tr = M.transient(c, v0);
    nets++;
    const T = tr.tau.length ? tr.tau[0] : 1;
    for (const t of [0, 0.13 * T, T, 4 * T]) {
      const k = kirchhoff(c, tr.state(t), tr.vAt(t));
      worst = Math.max(worst, k.kcl, k.kvl, k.tellegen);
      const en = Object.values(tr.energy(t));
      // relative to the energies involved, floored by a physical scale (at t = 0 they are all rounding noise)
      const Emax = Math.max(...els.filter((e) => e.kind === 'B').map((e) => e.emf), ...Object.values(v0).map(Math.abs), 1);
      const Rbig = Math.max(...els.filter((e) => e.R).map((e) => e.R), 1);
      const floor = els.filter((e) => e.kind === 'C').reduce((a, e) => a + 0.5 * e.C * Emax * Emax, 0) + ((Emax * Emax) / Rbig) * Math.max(t, T);
      const tot = Math.max(1e-300, floor, en.reduce((a, b) => a + Math.abs(b), 0));
      worstE = Math.max(worstE, Math.abs(en.reduce((a, b) => a + b, 0)) / tot);
    }
  }
  check(`random RC networks (${nets}): Kirchhoff and ΣP = 0 at every instant to 1e-12 (worst ${worst.toExponential(1)})`, worst < 1e-12);
  check(`random RC networks: battery work = stored + dissipated, exactly (worst ${worstE.toExponential(1)})`, worstE < 1e-11);
}

// ─── textbook circuits against closed forms ───────────────────────────────
const at = (name, o, values, sw) => { const pre = M.preset(name, o); const c = M.circuitOf(pre, values, sw); return { pre, c, st: M.solve(c) }; };
{
  const { st, c } = at('series', { n: 3 }, { E: 12, r: 0, R1: 4, R2: 8, R3: 12 });
  check('series: I = E/(R₁+R₂+R₃) = 0.5 A in every element', ['E', 'R1', 'R2', 'R3'].every((id) => near(Math.abs(st.I[id]), 0.5)));
  check('series: drops 2, 4 and 6 V', near(st.drop.R1, 2) && near(st.drop.R2, 4) && near(Math.abs(st.drop.R3), 6));
  const k = kirchhoff(c, st);
  check('series: Kirchhoff to 1e-12', k.kcl < 1e-12 && k.kvl < 1e-12 && k.tellegen < 1e-12);
}
{
  const { st } = at('series', { n: 2, amm: true }, { E: 9, r: 0, R1: 10, R2: 20 });
  check('series with ammeters: the same current before and after the resistors (not used up)', near(st.I.A1, 0.3) && near(Math.abs(st.I.A2), 0.3));
}
{
  const { st } = at('single', {}, { E: 12, r: 0.5, R1: 5.5 });
  check('internal resistance: I = E/(R + r) = 2 A, terminal voltage E − Ir = 11 V', near(st.I.E, 2) && near(st.V[1] - st.V[0], 11));
  check('internal resistance: emf power = I²r + I²R', near(12 * 2, 2 * 2 * 0.5 + st.P.R1));
}
{
  const { st } = at('parallel', { n: 3 }, { E: 12, r: 0, R1: 4, R2: 12, R3: 6 });
  check('parallel: branch currents E/R', near(st.I.R1, 3) && near(st.I.R2, 1) && near(st.I.R3, 2));
  check('parallel: the battery supplies the sum, 6 A = E/R_eq with R_eq = 2 Ω', near(st.I.E, 6) && near(12 / M.parallelR(4, 12, 6), 6));
  const sw = at('parallel', { n: 3, bsw: true }, { E: 12, r: 0.3, R1: 4, R2: 12, R3: 6 }, { S2: false });
  check('parallel: opening one branch leaves the others running', sw.st.I.R2 === 0 && sw.st.I.R1 > 0 && sw.st.I.R3 > 0);
}
{
  const { st } = at('combo', {}, { E: 12, r: 0, R1: 2, R2: 6, R3: 3 });
  check('combination: R_eq = R₁ + R₂∥R₃ = 4 Ω, I = 3 A splitting 1 A + 2 A', near(st.I.E, 3) && near(st.I.R2, 1) && near(st.I.R3, 2));
}
{
  const { st } = at('ladder', {}, { E: 12, r: 0, R1: 2, R2: 4, R3: 2, R4: 2 });
  const Req = 2 + M.parallelR(4, 2 + 2);
  check('ladder: R_eq = R₁ + R₂∥(R₃+R₄) = 4 Ω', near(st.I.E, 12 / Req) && near(Req, 4));
}
for (const [R1, R2, R3, R4, Rg] of [[120, 120, 120, 120, 50], [100, 200, 150, 300, 80], [120, 120, 120, 120.24, 1e3], [470, 330, 220, 680, 25]]) {
  const { st, c } = at('bridge', { det: 'galv' }, { E: 10, r: 0, R1, R2, R3, R4, Rg });
  // Thevenin seen from the galvanometer (mL → mR)
  const Vth = 10 * (R2 / (R1 + R2) - R4 / (R3 + R4)), Rth = M.parallelR(R1, R2) + M.parallelR(R3, R4);
  check(`bridge ${R1}/${R2}/${R3}/${R4}: galvanometer current = V_th/(R_th + R_g)`, near(st.I.Rg, Vth / (Rth + Rg), 1e-11, 1e-15), `${st.I.Rg} vs ${Vth / (Rth + Rg)}`);
  const k = kirchhoff(c, st);
  check(`bridge ${R1}/${R2}/${R3}/${R4}: Kirchhoff to 1e-12`, k.kcl < 1e-12 && k.kvl < 1e-12);
  if (R1 / R2 === R3 / R4) check('bridge: balanced (R₁/R₂ = R₃/R₄) → no galvanometer current', Math.abs(st.I.Rg) < 1e-15);
}
{
  // quarter bridge with a strain gauge: V_out = V_R − V_L
  const R0 = 350, GF = 2.0, eps = 1e-3, Rg = R0 * (1 + GF * eps), E = 10;
  const { st } = at('bridge', { det: 'volt' }, { E, r: 0, R1: R0, R2: R0, R3: R0, R4: Rg });
  const exact = E * (Rg / (R0 + Rg) - 0.5);
  check('quarter bridge: V_out = E(R_g/(R₀+R_g) − ½), about E·GF·ε/4 for small strain', near(st.drop.Vout, exact) && Math.abs(exact / (E * GF * eps / 4) - 1) < 2e-3);
}
for (const flip of [false, true]) {
  const v = { E1: 12, r1: 0.4, E2: 6, r2: 0.7, R1: 4, R2: 2, R3: 6 };
  const { st, c, pre } = at('twoloop', { flip }, v);
  // closed form: KCL at the top middle node c with the bottom at 0 V
  const s2 = flip ? -1 : 1;
  const Vc = (v.E1 / (v.R1 + v.r1) + (s2 * v.E2) / (v.R2 + v.r2)) / (1 / (v.R1 + v.r1) + 1 / (v.R2 + v.r2) + 1 / v.R3);
  check(`two-loop${flip ? ' (E₂ reversed)' : ''}: the middle node sits at the closed-form potential`, near(st.V[2], Vc));
  check(`two-loop${flip ? ' (E₂ reversed)' : ''}: I₁ + I₂ = I₃ at the junction`, near(st.I.R1 - st.I.R2, st.I.R3));
  const k = kirchhoff(c, st);
  check(`two-loop${flip ? ' (E₂ reversed)' : ''}: Kirchhoff to 1e-12`, k.kcl < 1e-12 && k.kvl < 1e-12 && k.loops === 2);
  for (const [name, loop] of Object.entries(pre.loops)) {
    let sum = 0;
    loop.forEach((n, i) => { const m = loop[(i + 1) % loop.length]; const e = c.elements.find((x) => (x.a === n && x.b === m) || (x.a === m && x.b === n)); sum += (e.a === n ? -1 : 1) * st.drop[e.id]; });
    check(`two-loop${flip ? ' (E₂ reversed)' : ''}: the ${name} loop's potential changes sum to zero`, Math.abs(sum) < 1e-12 * 12, sum);
  }
}
check('the default two-loop circuit drives current backwards through E₂ (a teachable twist)', (() => { const { st } = at('twoloop', {}, {}); return st.I.E2 < 0 && st.I.E1 > 0 && st.I.R3 > 0 && Math.abs(st.V[2] - 72 / 11) < 1e-12; })());
check('a battery shorted by a wire is reported, not solved', (() => { try { M.solve({ nodes: 2, elements: [{ id: 'E', kind: 'B', a: 0, b: 1, emf: 9, r: 0 }, { id: 'w', kind: 'W', a: 1, b: 0 }] }); return false; } catch (e) { return /singular/.test(e.message); } })());
check('a floating part is referred to its own node, not an error', (() => { const st = M.solve({ nodes: 4, elements: [{ id: 'E', kind: 'B', a: 0, b: 1, emf: 9, r: 0 }, { id: 'R', kind: 'R', a: 1, b: 0, R: 3 }, { id: 'R2', kind: 'R', a: 2, b: 3, R: 5 }] }); return near(st.I.R, 3) && st.I.R2 === 0; })());

// ─── every preset in every switch position ────────────────────────────────
{
  const variants = [
    ['single', {}], ['single', { sw: true, amm: true, volt: true, lamp: true }], ['series', { n: 2 }], ['series', { n: 3, sw: true, amm: true, lamp: true }],
    ['parallel', { n: 2 }], ['parallel', { n: 3, sw: true, line: true, bsw: true, lamp: true }], ['combo', { sw: true }], ['ladder', {}],
    ['bridge', { det: 'volt', sw: true }], ['bridge', { det: 'galv' }], ['twoloop', {}], ['twoloop', { flip: true }],
    ['rc', { net: 'single' }], ['rc', { net: 'series' }], ['rc', { net: 'parallel' }], ['rc', { net: 'combo' }], ['firing', {}],
  ];
  let worst = 0, count = 0, ok = true;
  for (const [name, o] of variants) {
    const pre = M.preset(name, o);
    const keys = M.keysOf(pre);
    check(`preset ${name} ${JSON.stringify(o)}: every value key has a default`, keys.every((k) => pre.defaults[k] !== undefined || /^r\d?$/.test(k)), keys.filter((k) => pre.defaults[k] === undefined).join(','));
    const sws = pre.switches;
    const states = [];
    for (let m = 0; m < 2 ** sws.length; m++) states.push(Object.fromEntries(sws.map((s, i) => [s, s === 'mode' ? ((m >> i) & 1 ? 'discharge' : 'charge') : !!((m >> i) & 1)])));
    for (const sw of states) {
      const c = M.circuitOf(pre, {}, sw);
      try {
        const tr = M.transient(c, Object.fromEntries(c.elements.filter((e) => e.kind === 'C').map((e) => [e.id, 3])));
        for (const t of [0, 0.37, 2.5]) {
          const vC = tr.vAt(t), st = tr.state(t);
          const k = kirchhoff(c, st, vC);
          worst = Math.max(worst, k.kcl, k.kvl, k.tellegen); count++;
        }
      } catch (e) { ok = false; console.log(`  ${name} ${JSON.stringify(o)} ${JSON.stringify(sw)}: ${e.message}`); }
    }
  }
  check('every preset solves in every switch position', ok);
  check(`every preset, every switch position, three instants: Kirchhoff and ΣP = 0 to 1e-12 (${count} states, worst ${worst.toExponential(1)})`, worst < 1e-12);
}

// ─── RC transients ─────────────────────────────────────────────────────────
{
  const E = 12, Rv = 4700, Cv = 220e-6, tau = Rv * Cv;
  const pre = M.preset('rc', { net: 'single' });
  const tr = M.transient(M.circuitOf(pre, { E, R: Rv, C: Cv }, { mode: 'charge' }), { C: 0 });
  check('RC charging: one time constant, τ = RC', tr.tau.length === 1 && near(tr.tau[0], tau));
  let worst = 0;
  for (let k = 0; k <= 200; k++) { const t = (k / 40) * tau; worst = Math.max(worst, Math.abs(tr.vAt(t).C - E * (1 - Math.exp(-t / tau))) / E); }
  check(`RC charging: V(t) = V₀(1 − e^(−t/RC)) to 1e-12 (worst ${worst.toExponential(1)})`, worst < 1e-12);
  check('RC charging: 63.2% at t = τ, 99.3% at 5τ', near(tr.vAt(tau).C / E, 1 - Math.exp(-1)) && Math.abs(tr.vAt(5 * tau).C / E - 0.99326) < 1e-5);
  let worstI = 0;
  for (const t of [0, 0.3 * tau, tau, 3 * tau]) worstI = Math.max(worstI, Math.abs(tr.state(t).I.R - (E / Rv) * Math.exp(-t / tau)) / (E / Rv));
  check('RC charging: I(t) = (V₀/R) e^(−t/RC); at t = 0 the capacitor acts like a wire', worstI < 1e-12);
  const d = M.transient(M.circuitOf(pre, { E, R: Rv, C: Cv }, { mode: 'discharge' }), { C: E });
  let worstD = 0;
  for (let k = 0; k <= 200; k++) { const t = (k / 40) * tau; worstD = Math.max(worstD, Math.abs(d.vAt(t).C - E * Math.exp(-t / tau)) / E); }
  check(`RC discharging: V(t) = V₀ e^(−t/RC) to 1e-12 (worst ${worstD.toExponential(1)})`, worstD < 1e-12);
  // energy: from empty to full, the resistor turns exactly half the battery's work into heat
  const en = tr.energy(60 * tau);
  check('RC charging: battery work CV₀² — half stored as ½CV₀², half dissipated in R, whatever R is', near(-en.E, Cv * E * E, 1e-12) && near(en.C, 0.5 * Cv * E * E, 1e-12) && near(en.R, 0.5 * Cv * E * E, 1e-12));
  const enD = d.energy(60 * tau);
  check('RC discharging: the resistor dissipates all ½CV₀²', near(enD.R, 0.5 * Cv * E * E, 1e-12));
  const q = tr.charge(60 * tau);
  check('RC charging: the charge through the battery equals the capacitor’s final charge CV₀', near(q.E, Cv * E, 1e-12));
  const withR = M.transient(M.circuitOf(pre, { E, r: 300, R: Rv, C: Cv }, { mode: 'charge' }), { C: 0 });
  check('RC charging: a battery’s internal resistance adds to R in τ', near(withR.tau[0], (Rv + 300) * Cv));
}
{
  const E = 10, Rv = 1000, C1 = 1e-3, C2 = 3e-3;
  const par = M.transient(M.circuitOf(M.preset('rc', { net: 'parallel' }), { E, R: Rv, C1, C2 }, { mode: 'charge' }), {});
  check('parallel capacitors charge as one: τ = R(C₁ + C₂)', par.tau.length === 1 && near(par.tau[0], Rv * (C1 + C2)));
  check('parallel capacitors: the same voltage, charge in proportion to C', [0.2, 1, 4].every((t) => near(par.vAt(t).C1, par.vAt(t).C2, 1e-12, 1e-14)));
  const ser = M.transient(M.circuitOf(M.preset('rc', { net: 'series' }), { E, R: Rv, C1, C2 }, { mode: 'charge' }), {});
  const Cs = M.seriesC(C1, C2);
  check('series capacitors: τ = R·C₁C₂/(C₁ + C₂)', ser.tau.length === 1 && near(ser.tau[0], Rv * Cs));
  check('series capacitors: equal charges at every instant', [0.1, 0.5, 2, 10].every((t) => { const v = ser.vAt(t); return near(C1 * v.C1, C2 * v.C2, 1e-12, 1e-16); }));
  check('series capacitors: the smaller capacitor takes the larger share of the voltage', near(ser.final.C1, (E * C2) / (C1 + C2)) && near(ser.final.C2, (E * C1) / (C1 + C2)));
  // the middle node's trapped charge: start C1 and C2 with unequal charges; C2·v2 − C1·v1 never changes
  const ser2 = M.transient(M.circuitOf(M.preset('rc', { net: 'series' }), { E, R: Rv, C1, C2 }, { mode: 'charge' }), { C1: 2, C2: 5 });
  const trapped = (v) => C2 * v.C2 - C1 * v.C1;
  check('series capacitors: charge on the node between them is conserved (a λ = 0 mode)', [0, 0.3, 1, 5, 50].every((t) => near(trapped(ser2.vAt(t)), C2 * 5 - C1 * 2, 1e-11)));
}
{
  // a capacitor bridged by a resistor: Thevenin, τ = (R₁∥R₂)C, V∞ = E R₂/(R₁+R₂)
  const E = 9, R1 = 2000, R2 = 3000, Cv = 1e-4;
  const c = { nodes: 3, elements: [{ id: 'E', kind: 'B', a: 0, b: 1, emf: E, r: 0 }, { id: 'R1', kind: 'R', a: 1, b: 2, R: R1 }, { id: 'R2', kind: 'R', a: 2, b: 0, R: R2 }, { id: 'C', kind: 'C', a: 2, b: 0, C: Cv }] };
  const tr = M.transient(c, {});
  const tau = M.parallelR(R1, R2) * Cv, Vinf = (E * R2) / (R1 + R2);
  check('Thevenin RC: τ = (R₁∥R₂)C', near(tr.tau[0], tau));
  check('Thevenin RC: V(t) = V∞(1 − e^(−t/τ))', [0.01, 0.1, 0.3].every((t) => near(tr.vAt(t).C, Vinf * (1 - Math.exp(-t / tau)), 1e-12, 1e-14)));
}
// two capacitors in a ladder (two distinct time constants) against RK4 with a tiny step
{
  const c = { nodes: 4, elements: [
    { id: 'E', kind: 'B', a: 0, b: 1, emf: 12, r: 0.5 }, { id: 'R1', kind: 'R', a: 1, b: 2, R: 1000 }, { id: 'C1', kind: 'C', a: 2, b: 0, C: 1e-3 },
    { id: 'R2', kind: 'R', a: 2, b: 3, R: 2200 }, { id: 'C2', kind: 'C', a: 3, b: 0, C: 4.7e-4 }, { id: 'R3', kind: 'R', a: 3, b: 0, R: 5600 }] };
  const tr = M.transient(c, { C1: 1, C2: 7 });
  check('RC ladder: two time constants', tr.tau.length === 2 && tr.tau[0] > tr.tau[1]);
  const f = (v) => { const st = M.solve(c, { C1: v[0], C2: v[1] }); return [st.I.C1 / 1e-3, st.I.C2 / 4.7e-4]; };
  let v = [1, 7], t = 0;
  const h = 2e-4, T = 4;
  let worst = 0;
  while (t < T - 1e-12) {
    const k1 = f(v), k2 = f(v.map((x, i) => x + (h / 2) * k1[i])), k3 = f(v.map((x, i) => x + (h / 2) * k2[i])), k4 = f(v.map((x, i) => x + h * k3[i]));
    v = v.map((x, i) => x + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    t += h;
    if (Math.abs(t * 2 - Math.round(t * 2)) < 1e-9) { const ex = tr.vAt(t); worst = Math.max(worst, Math.abs(ex.C1 - v[0]), Math.abs(ex.C2 - v[1])); }
  }
  check(`RC ladder: the exact modal solution matches RK4 to 1e-9 V (worst ${worst.toExponential(1)})`, worst < 1e-9);
  // energy bookkeeping, exact: the elements' absorbed energies sum to zero at any t
  let worstE = 0;
  for (const tt of [0.05, 0.4, 1.7, 9]) { const en = tr.energy(tt); const vals = Object.values(en); worstE = Math.max(worstE, Math.abs(vals.reduce((a, b) => a + b, 0)) / vals.reduce((a, b) => a + Math.abs(b), 0)); }
  check(`RC ladder: battery work = stored + dissipated energy to 1e-12 (worst ${worstE.toExponential(1)})`, worstE < 1e-12);
  // ∫P dt from the closed form against a fine trapezoid sum of the instantaneous power
  let num = 0;
  const n = 20000, T2 = 3;
  for (let k = 0; k < n; k++) { const a = tr.state((k * T2) / n).P.R2, b = tr.state(((k + 1) * T2) / n).P.R2; num += ((a + b) / 2) * (T2 / n); }
  check('RC ladder: closed-form resistor energy agrees with integrating the power numerically', near(tr.energy(T2).R2, num, 1e-6));
}
{
  // the firing circuit: charge through Rc, fire through the bridgewire
  const pre = M.preset('firing');
  const v = { E: 28, r: 0.05, Rc: 1000, C: 4.7e-3, Rb: 1.05 };
  const ch = M.transient(M.circuitOf(pre, v, { S1: true, S2: false }), {});
  check('firing circuit: charging τ = (R_c + r)C', near(ch.tau[0], (1000 + 0.05) * 4.7e-3));
  const fire = M.transient(M.circuitOf(pre, v, { S1: false, S2: true }), { C: 28 });
  check('firing circuit: the bank discharges through the igniter with τ = R_b C', near(fire.tau[0], 1.05 * 4.7e-3));
  check('firing circuit: the igniter starts at V₀/R_b', near(fire.state(0).I.Rb, 28 / 1.05));
  check('firing circuit: the igniter absorbs the bank’s whole ½CV₀²', near(fire.energy(1).Rb, 0.5 * 4.7e-3 * 28 * 28, 1e-12));
}
// ─── formulas ─────────────────────────────────────────────────────────────
check('series and parallel combinations', near(M.seriesR(2, 3, 5), 10) && near(M.parallelR(3, 6), 2) && near(M.seriesC(2, 2), 1) && near(M.parallelC(1, 2), 3));
check('wire resistance: 10 m of 1.0 mm copper is about 0.21 Ω', Math.abs(M.wireR(M.MATERIALS.copper.rho, 10, 1e-3) - 0.2139) < 1e-3);
check('drift speed: 1 A in 1 mm² copper is about 74 µm/s', Math.abs(M.driftSpeed(1, M.MATERIALS.copper.n, 1e-6) - 7.37e-5) < 0.01e-5);
check('names: R1 → R₁', M.nameOf('R1') === 'R₁' && M.nameOf('C12') === 'C₁₂' && M.nameOf('Rc') === 'Rc');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
