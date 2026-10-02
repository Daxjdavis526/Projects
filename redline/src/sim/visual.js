/* What a camera and a microphone in the test cell would pick up, worked out
   from the TRUE state of the model. No DOM, no three.js: the 3D cell view
   and the sound engine are drawn FROM this, and the tests check it
   headlessly.

   The plume is the part that has to follow the engine, so it is the part
   with physics in it:

     Regime       from the nozzle's area ratio and Pc/Pa: subsonic, separated
                  (Summerfield: the exit would be below ~0.4 Pa), over-
                  expanded, matched, underexpanded.
     Jet          the fully expanded jet Mach number Mj and diameter Dj
                  (isentropic from Pc/Pa; mass conservation from the throat).
     Diamonds     shock-cell spacing from the vortex-sheet model,
                  L ≈ 1.306·Dj·√(Mj² − 1) (Tam's form of Prandtl's result);
                  they live in the supersonic core, x/Dj ≈ 4.2 + 1.1·Mj²
                  (an empirical fit), and they are as strong as the
                  pressure mismatch at the exit: a matched nozzle shows
                  faint ones, a badly over- or underexpanded one bright
                  ones, and past a threshold a Mach disk.
     Colour       the exit temperature from the expansion; shock-heated
                  gas in the diamonds close to the chamber temperature;
                  soot from how fuel-rich the burning mixture is; cold
                  nitrogen glows not at all (it shows only as condensation
                  in humid air).
     Walls        a heat-sink chamber's throat and wall temperatures, as
                  the visible part of a blackbody: nothing below ~750 K,
                  then dull red, orange, yellow.

   What is NOT physics: the visible plume LENGTH and spread past the core,
   the turbulence, the smoke. Those are shaped to look right at this scale,
   and the README says so. */

const GAM_P = 1.22, GAM_N2 = 1.4;
export const SEP_RATIO = 0.4;       // Summerfield: separation when pe < 0.4·Pa

/* ---- isentropic one-dimensional relations -------------------------- */
export const areaRatio = (M, g) => (1 / M) * Math.pow((2 / (g + 1)) * (1 + (g - 1) / 2 * M * M), (g + 1) / (2 * (g - 1)));
export const prOfMach = (M, g) => Math.pow(1 + (g - 1) / 2 * M * M, -g / (g - 1));
export const machOfPr = (pr, g) => Math.sqrt(Math.max(0, 2 / (g - 1) * (Math.pow(pr, -(g - 1) / g) - 1)));
/* Supersonic Mach number for an area ratio, by bisection. */
export function machOfArea(eps, g) {
  if (eps <= 1) return 1;
  let lo = 1.0001, hi = 12;
  for (let i = 0; i < 70; i++) { const m = 0.5 * (lo + hi); if (areaRatio(m, g) > eps) hi = m; else lo = m; }
  return 0.5 * (lo + hi);
}

/* The jet leaving a nozzle. Pc, Pa in Pa abs; Tc in K; Dt, De in m.
   Returns the regime and everything the plume renderer needs, in metres. */
export function jetState({ Pc, Pa, Tc, g = GAM_P, R = 340, Dt, De }) {
  const eps = (De / Dt) ** 2;
  const out = { regime: 'none', eps, Me: 0, pe: Pa, peRatio: 1, Mj: 0, Dj: De, Uj: 0, Te: Tc, cell: 0, core: 0, diamonds: 0, strength: 0, machDisk: false, sepFrac: 0, choked: false };
  if (!(Pc > Pa * 1.0005)) return out;
  const crit = Math.pow(2 / (g + 1), g / (g - 1));
  const prA = Pa / Pc;
  out.choked = prA <= crit;
  // fully expanded jet: Mach from Pc/Pa; diameter from the throat by continuity
  const Mj = machOfPr(prA, g);
  out.Mj = Mj;
  out.Uj = Mj * Math.sqrt(g * R * Tc / (1 + (g - 1) / 2 * Mj * Mj));
  if (!out.choked) {
    out.regime = 'subsonic';
    out.Me = Mj; out.Te = Tc / (1 + (g - 1) / 2 * Mj * Mj);
    out.Dj = De;
    return out;
  }
  out.Dj = Dt * Math.sqrt(areaRatio(Math.max(1, Mj), g));
  const Me = machOfArea(eps, g), pe = prOfMach(Me, g) * Pc;
  out.Me = Me; out.pe = pe; out.peRatio = pe / Pa;
  out.Te = Tc / (1 + (g - 1) / 2 * Me * Me);
  if (pe < SEP_RATIO * Pa) {
    // separated inside the nozzle: the flow leaves the wall where its own
    // pressure has fallen to ~0.4 Pa — the jet that exits is narrower,
    // already shocked, and unsteady (side loads)
    out.regime = 'separated';
    const Mx = machOfPr(SEP_RATIO * Pa / Pc, g);
    const Ax = areaRatio(Math.max(1, Mx), g);           // separation point area / throat
    out.sepFrac = Math.max(0, Math.min(1, 1 - (Math.sqrt(Ax) - 1) / (Math.sqrt(eps) - 1)));
    out.Me = Mx;
  } else out.regime = pe > Pa * 1.03 ? 'underexpanded' : pe < Pa * 0.97 ? 'overexpanded' : 'matched';
  if (Mj > 1.02) {
    out.cell = 1.306 * out.Dj * Math.sqrt(Mj * Mj - 1);
    out.core = out.Dj * (4.2 + 1.1 * Mj * Mj);
    out.diamonds = Math.max(0, Math.min(12, Math.floor(out.core / out.cell)));
    // strength from the pressure mismatch: |ln(pe/Pa)|; even a matched
    // nozzle shows weak cells (it is never matched everywhere)
    const mis = Math.abs(Math.log(Math.max(1e-3, out.peRatio)));
    out.strength = Math.min(1, 0.3 + 1.4 * mis);
    out.machDisk = out.regime === 'separated' || out.peRatio < 0.62 || out.peRatio > 2.2;
  }
  return out;
}

/* ---- colour --------------------------------------------------------- */
/* sRGB-ish colour of a blackbody, normalised so the largest channel is 1
   (a fit, good to a few percent between 1000 K and 12 000 K). */
export function blackbody(T) {
  const t = Math.max(600, Math.min(15000, T)) / 100;
  let r, g, b;
  if (t <= 66) { r = 255; g = 99.4708 * Math.log(t) - 161.1196; b = t <= 19 ? 0 : 138.5177 * Math.log(t - 10) - 305.0448; }
  else { r = 329.6987 * Math.pow(t - 60, -0.1332); g = 288.1222 * Math.pow(t - 60, -0.0755); b = 255; }
  const c = [r, g, b].map(x => Math.max(0, Math.min(255, x)) / 255);
  const m = Math.max(...c);
  return c.map(x => x / m);
}
/* Visible radiance of a hot wall relative to one at 1500 K: nothing below
   the Draper point (~798 K), then steeply up (the visible band sits on the
   Wien side of the curve, so it climbs much faster than T⁴). */
export function glow(T) {
  if (!(T > 760)) return 0;
  const x = (T - 760) / (1500 - 760);
  return Math.min(4, x * x * x * (1 + 0.5 * x));
}

/* How a flame of this propellant pair looks. MR is the burning mixture
   ratio; MRst its stoichiometric value; soot (0–1) the fuel's tendency to
   make it (alcohol low, kerosene high). */
export function flameLook({ Tc, MR, MRst = 2.0, soot = 0.25, lum = 1 }) {
  const rich = Number.isFinite(MR) ? Math.max(0, Math.min(1, (MRst / Math.max(0.2, MR) - 1) / 1.5)) : 0;
  const s = Math.min(1, soot * (0.3 + 1.4 * rich));
  // a clean flame's core is the faint blue-violet of its band emission; soot
  // adds the yellow-orange continuum of hot particles; diamonds are
  // reheated gas, near chamber temperature
  const clean = [0.55, 0.6, 1.0], hot = blackbody(Tc * 0.62), dia = blackbody(Math.max(1500, Tc * 0.9));
  const mix = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
  return {
    core: mix(clean, hot, 0.25 + 0.6 * s),
    edge: mix([1.0, 0.55, 0.25], hot, 0.5),
    diamond: mix(dia, [1, 0.95, 0.8], 0.4),
    soot: s,
    afterburn: rich,                 // unburned fuel meeting air at the plume edge
    lum,
  };
}

/* ---- the whole cell ------------------------------------------------- */
const clamp01 = x => Math.max(0, Math.min(1, x));

/* A snapshot of everything visible and audible, from a running Session. */
export function cellState(S) {
  const m = S.model, c = S.controller, f = c.facility, net = m.net, def = S.def, p = def.physics;
  const Pa = net.ambient.P, Ta = net.ambient.T;
  const st = {
    t: S.t, clock: S.clock, program: def.program, stand: def.id,
    area: f.area, beacon: f.beacon, personnel: f.area === 'OPEN' ? (f.personnel ?? 2) : 0,
    tech: c.tech?.task || null,
    seq: c.seq ? c.seq.state || 'RUN' : null,
    armed: !!c.armed,
    valves: {}, tanks: [], vents: [], frost: {},
    jet: null, spray: null, purge: 0, walls: null, igniter: false, tp: null,
    sound: { jetPower: 0, chug: 0, chugF: 0, hf: 0, hfF: 0, sep: 0, gas: 0, vent: 0, rpm: 0, cav: 0, grind: 0, liquid: 0 },
  };
  for (const e of net.elements) if ('pos' in e) st.valves[e.id] = e.pos;
  for (const l of m.lines || []) {
    st.valves[l.valve.id] = l.valve.pos; if (l.spec.throttle) st.valves[l.spec.throttle.id] = l.thr;
    if (l.tap) { st.valves[l.tap.valve.id] = l.tap.valve.pos; if (l.spec.tap?.throttle) st.valves[l.spec.tap.throttle.id] = l.tap.thr; }
  }
  for (const l of m.lines || []) st.tanks.push({ line: l.id, fill: clamp01(l.mL / (l.Vtank * l.rho)), fluid: l.fluid.name });
  for (const v of net.volumes) if (v.T < 268 && v.id !== 'ambient') st.frost[v.id] = clamp01((268 - v.T) / 60);
  let vent = 0;
  for (const id of def.ventElements || []) {
    const e = net.el(id); if (!e) continue;
    const md = Math.max(0, e.mdot || 0);
    vent += md;
    if (md > 1e-5) st.vents.push({ id, mdot: md, T: e.from != null ? net.state(e.from)?.T ?? Ta : Ta });
  }
  st.sound.vent = vent;

  const C = m.chamber;
  if (C) {
    // a bipropellant chamber: products and/or nitrogen through its nozzle
    const g = C.gamma, burning = C.burning;
    const Dt = C.spec.throatDia, De = C.spec.exitDia;
    const fP = C.m > 0 ? C.mP / C.m : 0;
    const j = jetState({ Pc: C.P, Pa, Tc: Math.max(C.Tgas, 1), g, R: fP * 340 + (1 - fP) * 296.8, Dt, De });
    const look = flameLook({ Tc: C.Tgas, MR: C.MRb, MRst: def.flame?.MRst ?? 2.0, soot: def.flame?.soot ?? 0.25 });
    const lum = burning ? clamp01(C.P / (C.spec.Pnom || C.P)) * Math.pow(Math.min(1.2, C.Tgas / 3000), 2) * fP : 0;
    st.jet = { ...j, lit: burning, products: fP, mdot: C.mdotOut, F: C.F, Pc: C.P, Pnom: C.spec.Pnom, peakP: C.peak.P, Tc: C.Tgas, MR: C.MRb, Dt, De, look: { ...look, lum },
      chug: C.chug.A, chugF: C.spec.fChug ?? 110, hf: C.hf.A, hfF: C.spec.fHF ?? 3300 };
    st.igniter = !!C.igniter.on;
    st.walls = { ch: C.walls.ch, th: C.walls.th, glowCh: glow(C.walls.ch), glowTh: glow(C.walls.th), colorTh: blackbody(C.walls.th), breached: !!m.jacket?.breached, regen: !!C.spec.regen };
    // unlit, the injected liquid leaves through the nozzle as spray
    const liq = burning ? 0 : (m.lines || []).reduce((a, l) => a + Math.max(0, l.mdotInj), 0);
    const vJet = (m.lines || []).reduce((a, l) => a + (l.mdotInj > 1e-6 ? l.Fjet / Math.max(0.3, l.spec.jetAxial ?? 0.87) : 0), 0) / Math.max(1e-6, liq);
    st.spray = liq > 1e-5 ? { mdot: liq, v: Math.max(5, Math.min(60, vJet || 20)) } : null;
    // nitrogen through the chamber unlit: the purge
    st.purge = burning ? 0 : C.mdotOut * (1 - fP);
    st.sound.jetPower = 0.5 * C.mdotOut * j.Uj * j.Uj * (burning ? 1 : 0.6);
    st.sound.chug = burning ? C.chug.A : 0; st.sound.chugF = st.jet.chugF;
    st.sound.hf = burning ? C.hf.A : 0; st.sound.hfF = st.jet.hfF;
    st.sound.sep = j.regime === 'separated' ? 1 : 0;
    st.sound.liquid = liq;
  } else if (m.nozzleEl) {
    // a cold-gas thruster
    const nz = m.nozzleEl, N = nz.nozzle, up = net.state(nz.from);
    const g = net.gas.gamma ?? GAM_N2;
    const j = jetState({ Pc: up.P, Pa, Tc: up.T, g, R: net.gas.R, Dt: N.throatDia, De: N.exitDia });
    st.jet = { ...j, lit: false, products: 0, mdot: Math.max(0, nz.mdot), F: nz.F, Pc: up.P, Pnom: up.P, Tc: up.T, Dt: N.throatDia, De: N.exitDia, look: null,
      // expanding nitrogen is cold: humid air condenses in it
      fog: clamp01((240 - j.Te) / 120) };
    st.sound.jetPower = 0.5 * Math.max(0, nz.mdot) * j.Uj * j.Uj;
    st.sound.sep = j.regime === 'separated' ? 1 : 0;
  }
  const tp = m.tp;
  if (tp) {
    const pumps = Object.fromEntries(Object.entries(tp.pumps).map(([k, pu]) => [k, { cav: clamp01(1 - pu.f), dP: pu.dP, Tc: pu.Tc }]));
    const tn = tp.nozzle, G = m.gg;
    st.tp = {
      rpm: tp.n * tp.spec.Nd, n: tp.n, vib: tp.vib, pumps,
      // on a gas-generator engine the turbine's nozzles are the gas
      // generator's throat: its outflow is the exhaust, burning or not
      exhaust: { mdot: Math.max(0, (G ? G.mdotOut : tn?.mdot) || 0), T: tp.Texh, lit: !!G?.burning && tp.Texh > 500 },
      discharge: Object.fromEntries((m.lines || []).map(l => [l.id, Math.max(0, l.mdotInj)])),
      brg: tp.brgFactor, rub: tp.rub, seized: tp.seized,
    };
    st.sound.rpm = st.tp.rpm;
    st.sound.cav = Math.max(...Object.values(pumps).map(x => x.cav), 0);
    st.sound.grind = clamp01((tp.brgFactor - 1) / 3 + tp.rub * 20);
    st.sound.gas = st.tp.exhaust.mdot;
    if (!C) st.sound.liquid = (m.lines || []).reduce((a, l) => a + Math.max(0, l.mdotInj), 0);
  }
  const G = m.gg;
  if (G) st.gg = { lit: !!G.burning, T: G.Tgas, P: G.P, mdot: Math.max(0, G.mdotOut), igniter: !!G.igniter.on, glow: G.burning ? glow(Math.min(1100, 0.55 * G.Tgas + 0.45 * G.walls.ch)) : glow(G.walls.ch) };
  st.load = m.stand?.y ?? 0;
  return st;
}

/* Discrete happenings the eye and ear notice, found by comparing one
   snapshot with the last: light-up, a hard start, shutdown, and the moment
   a rotor starts or stops turning. A hard-start spike lasts milliseconds —
   shorter than a video frame — so it is read from the peak the chamber has
   been through (the hardware's own memory), not from the frame's pressure. */
export class CellEvents {
  constructor() { this.prev = null; this.litAt = null; this.peak0 = 0; this.hard = false; }
  update(st) {
    const ev = [], p = this.prev, j = st.jet;
    if (p && j && p.jet) {
      if (j.lit && !p.jet.lit) { ev.push({ type: 'ignition' }); this.litAt = st.t; this.peak0 = p.jet.peakP ?? 0; this.hard = false; }
      if (j.lit && this.litAt !== null && st.t - this.litAt < 0.3 && !this.hard && j.peakP > this.peak0) {
        const r = Math.max(j.peakP, j.Pc) / Math.max(1, j.Pnom);
        if (r > 1.35) { ev.push({ type: 'hardstart', ratio: r }); this.hard = true; }
      }
      if (!j.lit && p.jet.lit) ev.push({ type: 'shutdown' });
    }
    if (p?.tp && st.tp) {
      if (st.tp.rpm > 300 && p.tp.rpm <= 300) ev.push({ type: 'spinup' });
      if (st.tp.rpm <= 300 && p.tp.rpm > 300) ev.push({ type: 'spindown' });
    }
    this.prev = st;
    return ev;
  }
}

/* The cell's tape: cellState at 100 Hz from a second before T-0 until a few
   seconds after the sequence ends — what a high-speed camera and the cell
   microphone caught, for replay (slowed down, if you like). Attach with
   session.samplers.add(tape.sampler). */
export class Tape {
  constructor({ rate = 100, pre = 1, post = 4 } = {}) {
    this.dt = 1 / rate; this.pre = pre; this.post = post;
    this.rec = null; this.last = null;
    this.sampler = S => this.sample(S);
  }
  sample(S) {
    const q = S.controller.seq;
    if (q && S.t >= q.tFire - this.pre) {
      if (!this.rec || this.rec.tFire !== q.tFire) this.rec = { tFire: q.tFire, frames: [], next: S.t, end: Infinity, plan: q.plan?.mode };
      this.rec.end = Infinity;
    } else if (this.rec && this.rec.end === Infinity) this.rec.end = S.t + this.post;
    const r = this.rec;
    if (!r) return;
    if (S.t >= r.next) { r.frames.push(cellState(S)); r.next = S.t + this.dt; }
    if (S.t >= r.end || r.frames.length > 12000) { this.last = r; this.rec = null; }
  }
  /* the frame at tape time t (seconds from T-0) */
  at(t, tape = this.last) {
    const f = tape?.frames; if (!f?.length) return null;
    const T = tape.tFire + t;
    let lo = 0, hi = f.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (f[m].t <= T) lo = m; else hi = m - 1; }
    return f[lo];
  }
  span(tape = this.last) { const f = tape?.frames; return f?.length ? [f[0].t - tape.tFire, f[f.length - 1].t - tape.tFire] : [0, 0]; }
}
