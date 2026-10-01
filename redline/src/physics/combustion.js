/* The combustion chamber of a bipropellant engine, lumped. No DOM.

   What enters: liquid oxidiser and fuel from the injector (liquid.js), and
   purge nitrogen through the same orifices (the gas network). What leaves:
   gas through the throat, and — while nothing burns — liquid spraying out of
   the nozzle.

     Pools        Injected liquid is spray in transit (a few grams at most)
                  plus, while nothing burns, a share that wets the walls
                  and puddles. Unlit, spray leaves through the nozzle in
                  milliseconds; the puddle lingers. Lit, both vaporise and
                  burn at  b = m / τ_v,  τ_v growing with the amount — but
                  each propellant only as fast as the other lets it (a
                  flammable mixture range). Delay ignition and the puddle
                  grows; light it late and it all goes at once: a HARD
                  START.
     Ignition     A spark igniter. The engine lights when the spark is on,
                  both propellants are present, and their ratio is inside
                  the flammability limits — after an ignition delay of a few
                  milliseconds. Nothing here is hypergolic: no spark, no
                  fire, and the pools keep filling.
     Gas          Two species — products and nitrogen — in one volume.
                  P·V = Σ m·R·T, carried as the single quantity Q = P·V;
                  products arrive with R·T = (η·c*(MR)·Γ)², the definition of
                  characteristic velocity; nitrogen arrives cold.
     Throat       Choked or subsonic flow of the mixture, Γ from a mass-
                  weighted γ. Thrust from an ideal nozzle at the throat's
                  conditions, with a crude allowance for separation.
     Walls        A copper heat-sink chamber: two thermal nodes (chamber
                  wall, throat), heated by the gas at a rate ∝ Pc^0.8, losing
                  heat slowly to the stand. It is not cooled: run long
                  enough and the throat overheats — that is the burn-time
                  limit, and the wall keeps getting hotter after shutdown
                  (soak-back).
     Instability  NOT resolved. Two onset criteria, honestly lumped:
                  CHUG (low frequency, feed-coupled) grows when the injector
                  is too soft — injector ΔP below ~20 % of Pc on either side
                  — and modulates the burn rate at ~110 Hz.
                  SCREECH (high frequency, acoustic, 1st longitudinal mode at
                  ~3.3 kHz) grows only when a fault drives it, and multiplies
                  the wall heat flux. Neither is a solution of the governing
                  equations; both are a model of WHEN, not of HOW. */

const R_N2 = 296.8, GAM_N2 = 1.4, GAM_P = 1.22, R_P = 340;
// unlit liquid: spray leaves through the nozzle in milliseconds; a share
// wets the walls and lingers. Burning pairs are limited to a flammable range.
const CHUG_STIFF = 0.2;            // injector ΔP/Pc below which the feed system and chamber couple
const TAU_SPRAY = 0.006, TAU_PUDDLE = 0.5, PUDDLE = 0.06, MR_MIN = 0.5, MR_MAX = 3;
const Gam = g => Math.sqrt(g * Math.pow(2 / (g + 1), (g + 1) / (g - 1)));

/* Exit-to-chamber pressure ratio for an area ratio ε (supersonic branch),
   by bisection on the isentropic area relation. */
function pressureRatio(eps, g) {
  const area = M => (1 / M) * Math.pow((2 / (g + 1)) * (1 + (g - 1) / 2 * M * M), (g + 1) / (2 * (g - 1)));
  let lo = 1.0001, hi = 10;
  for (let i = 0; i < 80; i++) { const m = 0.5 * (lo + hi); if (area(m) > eps) hi = m; else lo = m; }
  const M = 0.5 * (lo + hi);
  return Math.pow(1 + (g - 1) / 2 * M * M, -g / (g - 1));
}

export class Chamber {
  constructor(spec, { ambient, rng = null }) {
    this.spec = spec;
    this.V = spec.V;
    this.Pa = ambient.P; this.Ta = ambient.T;
    this.At = Math.PI / 4 * spec.throatDia ** 2;
    this.Ae = Math.PI / 4 * spec.exitDia ** 2;
    this.eps = this.Ae / this.At;
    this.Cd = spec.Cd ?? 0.98;
    this.peP = pressureRatio(this.eps, GAM_P);
    this.peN = pressureRatio(this.eps, GAM_N2);
    this.cstar = spec.cstar;                       // (MR) => ideal c*, m/s
    this.eta = spec.etaCstar ?? 0.94;              // as built: mixing and vaporisation efficiency
    this.rng = rng;
    // state: chamber starts full of cell air (treated as nitrogen)
    this.mN = this.Pa * this.V / (R_N2 * this.Ta);
    this.mP = 0;
    this.Q = this.Pa * this.V;
    this.pool = { ox: 0, fu: 0 };                                  // spray in transit, kg
    this.puddle = { ox: 0, fu: 0 };                                // wall film / puddle, kg
    this.burning = false;
    this.ignAt = null;
    this.quiet = 0;
    this.igniter = { cmd: 0, on: false, fail: false, open: false, weak: 0 };   // fault hooks: fail (no spark), open (exciter dead), weak (extra delay, s)
    this.chug = { A: 0, phase: 0 };
    this.hf = { A: 0, phase: 0, drive: 0 };                        // fault hook: drive (1/s)
    this.walls = { ch: ambient.T, th: ambient.T };
    this.film = 1;                                                 // fault hook: >1 = film cooling lost
    this.etaLeak = 1;                                              // fuel entering off the injector burns poorly
    this.mdotOut = 0; this.F = 0; this.burnRate = 0; this.MRb = NaN;
    this.Pobs = this.Pa;
    this.impulse = 0;
    this.peak = { P: this.Pa, hf: 0, chug: 0, Tth: ambient.T };   // what the hardware has been through (for inspections)
    this.t = 0;
  }

  get m() { return this.mN + this.mP; }
  get P() { return this.Q / this.V; }
  get gamma() { const m = this.m; return m > 0 ? (this.mP * GAM_P + this.mN * GAM_N2) / m : GAM_N2; }
  get RT() { return this.Q / Math.max(this.m, 1e-12); }
  get Tgas() { const m = this.m; return this.RT / (m > 0 ? (this.mP * R_P + this.mN * R_N2) / m : R_N2); }

  /* One step. inj = { ox: kg/s, fu: kg/s } of liquid; n2 = kg/s of nitrogen
     in (from the network, already integrated by it); stiffness = smallest
     injector ΔP/Pc of the sides flowing. */
  step(dt, inj, n2, stiffness) {
    this.t += dt;
    const ig = this.igniter;
    ig.on = ig.cmd === 1 && !ig.fail && !ig.open;
    // liquid in the chamber: most of it is spray in transit, a little
    // collects on the walls as a puddle that does not leave
    const lit = this.burning, wet = lit ? 0 : PUDDLE;
    for (const k of ['ox', 'fu']) { this.pool[k] += inj[k] * dt * (1 - wet); this.puddle[k] += inj[k] * dt * wet; }
    const po = this.pool.ox + this.puddle.ox, pf = this.pool.fu + this.puddle.fu;
    const MRp = pf > 1e-9 ? po / pf : Infinity;
    // ignition
    if (!this.burning) {
      const ready = ig.on && po > 2e-4 && pf > 2e-4 && MRp > 0.25 && MRp < 8;
      if (ready && this.ignAt === null) this.ignAt = this.t + 0.006 + (this.rng ? this.rng.next() * 0.006 : 0.003) + ig.weak;
      if (!ready) this.ignAt = null;
      if (this.ignAt !== null && this.t >= this.ignAt) { this.burning = true; this.ignAt = null; this.quiet = 0; }
    }
    // burn or drain
    let bo = 0, bf = 0;
    if (this.burning) {
      // vaporisation: the spray in a time that grows with its size, the
      // puddle as fast as the flame can boil it — accumulated propellant
      // burns as fast as it can, which is not instantly
      const vap = k => { const s = this.pool[k], w = this.puddle[k]; return s / (0.0025 + 3 * s) + w / (0.004 + 2 * w); };
      // chug: burn rate modulated at the feed-coupled frequency
      const mod = 1 + this.chug.A * Math.sin(this.chug.phase);
      const vo = vap('ox') * mod, vf = vap('fu') * mod;
      // a propellant burns only with the other: vapour beyond the
      // flammable mixture range waits (or leaves unburned)
      bo = Math.max(0, Math.min(vo, MR_MAX * vf)); bf = Math.max(0, Math.min(vf, vo / MR_MIN));
      const take = (k, v, b) => {
        if (v <= 0) return;
        const f = b / v, s = this.pool[k], w = this.puddle[k];
        const ds = s / (0.0025 + 3 * s), dw = w / (0.004 + 2 * w), tot = ds + dw || 1;
        this.pool[k] = Math.max(0, s - Math.min(s, f * v * (ds / tot) * dt) - (1 - f) * s * dt / TAU_SPRAY);
        this.puddle[k] = Math.max(0, w - Math.min(w, f * v * (dw / tot) * dt));
      };
      take('ox', vo, bo); take('fu', vf, bf);
      // flameout: nothing left that can burn
      if (bo + bf < 2e-3 && inj.ox + inj.fu < 1e-3) { this.quiet += dt; if (this.quiet > 0.02) this.burning = false; } else this.quiet = 0;
    } else {
      for (const k of ['ox', 'fu']) {
        this.pool[k] -= this.pool[k] * Math.min(1, dt / TAU_SPRAY);
        this.puddle[k] -= this.puddle[k] * Math.min(1, dt / TAU_PUDDLE);
      }
    }
    const b = bo + bf;
    this.burnRate = b;
    this.MRb = bf > 1e-9 ? bo / bf : NaN;
    // gas in
    if (b > 0) {
      const MR = Math.min(8, Math.max(0.25, bo / Math.max(bf, 1e-9)));
      const cs = this.eta * this.etaLeak * this.cstar(MR);
      const RTp = (cs * Gam(GAM_P)) ** 2;
      this.mP += b * dt;
      this.Q += b * RTp * dt;
    }
    if (n2 > 0) { this.mN += n2 * dt; this.Q += n2 * R_N2 * this.Ta * dt; }
    // throat
    const P = this.P, g = this.gamma, RT = this.RT;
    let mdot = 0;
    if (P > this.Pa) {
      const crit = Math.pow(2 / (g + 1), g / (g - 1));
      const r = this.Pa / P;
      if (r <= crit) mdot = this.Cd * this.At * P * Gam(g) / Math.sqrt(RT);
      else mdot = this.Cd * this.At * P * Math.sqrt(2 * g / ((g - 1) * RT) * (Math.pow(r, 2 / g) - Math.pow(r, (g + 1) / g)));
    }
    const m = this.m;
    const out = Math.min(mdot * dt, 0.5 * m);
    const fP = this.mP / m;
    this.mP -= out * fP; this.mN -= out * (1 - fP);
    this.Q -= out * RT;
    // the gas cools toward the wall when there is no combustion to feed it
    const Tw = this.walls.ch;
    const RTwall = (this.mP * R_P + this.mN * R_N2) * Tw;
    if (!this.burning) this.Q += (RTwall - this.Q) * Math.min(1, dt / 0.05);
    if (this.Q < 1) this.Q = 1;
    this.mdotOut = mdot;
    // thrust: ideal nozzle at the throat's conditions; if the exit would be
    // far below ambient the flow separates — crudely, stop expanding at
    // 0.4·Pa (Summerfield) over half the exit area
    const choked = this.Pa / P <= Math.pow(2 / (g + 1), g / (g - 1));
    if (choked) {
      const pr = fP * this.peP + (1 - fP) * this.peN;
      let Pe = pr * P, Aeff = this.Ae;
      if (Pe < 0.4 * this.Pa) { Pe = 0.4 * this.Pa; Aeff = 0.5 * this.Ae; }
      const Ve = Math.sqrt(Math.max(0, 2 * g / (g - 1) * RT * (1 - Math.pow(Pe / P, (g - 1) / g))));
      this.F = Math.max(0, mdot * Ve + (Pe - this.Pa) * Aeff);
    } else this.F = Math.max(0, (P - this.Pa) * this.At * this.Cd * 1.1);
    this.impulse += this.F * dt;
    // instabilities
    const ch = this.chug;
    if (this.burning && P > 2 * this.Pa) {
      const sigma = Math.max(-60, Math.min(60, 600 * (CHUG_STIFF - stiffness)));
      ch.A = Math.min(0.35, Math.max(1e-4, ch.A * (1 + sigma * dt)));
    } else ch.A *= Math.max(0, 1 - 30 * dt);
    ch.phase += 2 * Math.PI * (this.spec.fChug ?? 110) * dt;
    const hf = this.hf;
    if (this.burning && P > 2 * this.Pa) hf.A = Math.min(0.25, Math.max(1e-5, hf.A * (1 + (hf.drive - 25) * dt)));
    else hf.A *= Math.max(0, 1 - 200 * dt);
    hf.phase += 2 * Math.PI * (this.spec.fHF ?? 3300) * dt;
    this.Pobs = P * (1 + hf.A * Math.sin(hf.phase) + (this.burning ? 0.004 * (this.rng ? this.rng.gauss() : 0) : 0));
    // walls: a heat-sink chamber's own; a regeneratively cooled one is
    // stepped by its jacket (cooling.js), which writes walls.ch / walls.th
    if (!this.spec.regen) {
      const Pn = this.spec.Pnom;
      const flux = this.burning ? Math.pow(Math.max(P, this.Pa) / Pn, 0.8) * this.film * (1 + 4 * hf.A) : 0.02;
      const Taw = this.burning ? 0.85 * this.Tgas : this.Tgas;
      const W = this.walls, k = this.spec.wall;
      const qch = k.hAch * flux * (Taw - W.ch), qth = k.hAth * flux * (Taw - W.th);
      const cond = k.Gcond * (W.th - W.ch);
      W.ch += dt * (qch + cond - k.Gamb * (W.ch - this.Ta)) / k.Cch;
      W.th += dt * (qth - cond - 0.3 * k.Gamb * (W.th - this.Ta)) / k.Cth;
    }
    const W = this.walls;
    const pk = this.peak;
    if (P > pk.P) pk.P = P; if (hf.A > pk.hf) pk.hf = hf.A; if (ch.A > pk.chug) pk.chug = ch.A; if (W.th > pk.Tth) pk.Tth = W.th;
  }

  /* Largest stable step for the chamber and the oscillators. */
  stableDt() {
    const res = this.m / Math.max(this.mdotOut + this.burnRate, 1e-6);
    let dt = 0.3 * res;
    if (this.burning) dt = Math.min(dt, 5e-5);
    if (this.hf.A > 1e-3) dt = Math.min(dt, 1 / (20 * (this.spec.fHF ?? 3300)));
    return Math.max(dt, 2e-6);
  }
}

export { Gam, GAM_P, R_P };
