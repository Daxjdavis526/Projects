/* A turbopump: two centrifugal pumps and an impulse turbine on one shaft.
   No DOM.

   PUMP (one per liquid line). The line's momentum equation gains a source,
   the pressure the impeller adds:

     ΔP = ρ·g·H,   H/H0 = f · (a0·n|n| + a1·n·q) − a2·q²

   with n = N/N_design and q = Q/Q_design. That is the affinity laws in
   their simplest honest form: head goes as speed squared at a given flow
   coefficient, falls with flow along a drooping curve, and at n = 0 the
   only term left is −a2·q² — a stopped pump is a restriction. A pump makes
   HEAD (energy per unit weight of liquid), not pressure: the same impeller
   at the same speed makes 14 % more ΔP pumping LOX than water.

   Shaft power is P0·(ρ/ρ0)·(c0·n³ + c1·n²·q): a radial pump still draws
   about 40 % of its design power at zero flow, all of it going into the
   liquid trapped in the casing as heat. That is what deadheading does —
   it boils the pump.

   f is the CAVITATION factor. The net positive suction head available,
   NPSHa = (P_inlet − P_vapour)/(ρ·g), is compared with what the inducer
   needs, NPSHr ∝ n²·(0.5 + 0.5·x²), x = q/n. By definition NPSHr is where
   the head has fallen 3 %; above it f approaches 1, below it the head
   collapses. A cavitating pump also unloads — and an unloaded pump on a
   turbine that is still being driven speeds up. Running a tank dry does the
   same thing faster: f → 0.

   TURBINE. A single-stage partial-admission impulse turbine on the drive
   gas leaving the network's turbine inlet volume through its nozzles.
   Spouting velocity c0 = √(2·cp·T·(1 − (Pex/Pin)^((γ−1)/γ))); nozzle exit
   c1 = φ·c0; with symmetric blades the Euler torque is

     τ = ṁ·r·(c1·cos α − u)·(1 + ψ)·η_x,    u = ω·r

   which is largest stalled and falls to zero at u = c1·cos α; efficiency
   peaks at u/c0 ≈ ½·φ·cos α. η_x lumps partial-admission and leakage losses.
   The gas leaves cooler by the work taken out of it — measuring that drop
   is how a turbine's efficiency is measured on a cold-gas spin test.

   SHAFT.  J·dω/dt = τ_turbine − Σ τ_pump − τ_bearings − τ_windage.
   Two bearings, each a thermal node heated by its own friction and cooled
   by the propellant that leaks through it (so they run hot with no flow).
   Vibration is an RMS figure built from imbalance (∝ n²), cavitation and
   bearing distress — invented numbers, honest shapes.

   Everything here is lumped and steady-curved; none of it is a CFD answer.
   It is enough to show spin-up and coast-down, the head–flow curve, the
   affinity laws, suction breakdown, deadheading, bearing heating, and the
   runaway that follows when a pump loses its load. */

const G0 = 9.80665;
const TAU = 2 * Math.PI;
const smooth = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/* Vapour pressure of the liquid in the pump, Pa. Water: the Antoine fit
   (1–100 °C, extrapolated beyond). The propellants carry their own `pvap`
   function (physics/propellants.js). */
export function pvapWater(T) {
  const c = T - 273.15;
  return 133.322 * Math.pow(10, 8.07131 - 1730.63 / (233.426 + Math.max(-20, Math.min(c, 250))));
}
export const pvapOf = fluid => fluid?.pvap || pvapWater;

export class Pump {
  constructor(spec) {
    this.spec = spec;
    this.id = spec.id;
    this.H0 = spec.H0;                 // m, design head
    this.Q0 = spec.Q0;                 // m³/s, design flow
    this.rhoD = spec.rhoD;             // kg/m³, the fluid it was designed for
    const [a0, a1, a2] = spec.a || [1.15, -0.03, 0.12];
    this.a0 = a0; this.a1 = a1; this.a2 = a2;
    this.shut = spec.shut ?? 0.4;      // shutoff power, fraction of design
    this.eta = spec.eta;
    this.P0 = spec.rhoD * G0 * spec.H0 * spec.Q0 / spec.eta;   // W, design shaft power
    this.npshr0 = spec.npshr0;         // m at design
    this.CdAsuc = spec.CdAsuc;
    this.Isuc = spec.Isuc ?? 0;
    this.mc = spec.mc ?? 0.3;          // kg of liquid held in the casing
    this.hAc = spec.hAc ?? 1.5;        // W/K casing to the cell
    this.n = 0;                        // set by the shaft each step
    this.f = 1;                        // cavitation factor
    this.Tc = null;                    // casing liquid temperature
    this.Pin = 0; this.Pd = 0; this.dP = 0;
    this.npsha = 0; this.npshr = 0;
    this.tau = 0;                      // N·m drawn from the shaft
    this.Pshaft = 0;
    // fault hooks
    this.headLoss = 0;                 // fraction of head lost (worn impeller, wear-ring clearance)
    this.npshScale = 1;                // damaged inducer: needs more suction head
  }

  /* Source and quadratic resistance the line adds to its momentum equation. */
  terms(rho, mdot) {
    const q = Math.max(0, mdot) / (rho * this.Q0), n = this.n;
    const k = rho * G0 * this.H0 * (1 - this.headLoss);
    const src = k * this.f * (this.a0 * n * Math.abs(n) + this.a1 * n * q);
    const Rq = G0 * this.H0 * this.a2 / (rho * this.Q0 * this.Q0);
    return { src, Rq };
  }

  /* After the line has its new flow: inlet and discharge pressures, the
     suction margin, the torque, the casing temperature. */
  update(dt, line, Pup, Tin, Tamb, dry, md = line.mdot) {
    const rho = line.rho, n = this.n;
    const q = Math.max(0, md) / (rho * this.Q0);
    const Rs = this.CdAsuc > 0 ? 1 / (2 * rho * this.CdAsuc * this.CdAsuc) : 0;
    this.Pin = Pup - Rs * md * Math.abs(md) - this.Isuc * line.mdotDot;
    const { src, Rq } = this.terms(rho, md);
    this.dP = src - Rq * md * Math.abs(md);
    this.Pd = this.Pin + this.dP;
    // suction: the margin against the liquid boiling at the impeller eye
    if (this.Tc === null) this.Tc = Tin;
    const pv = pvapOf(line.fluid)(Math.max(Tin, this.Tc));
    this.npsha = (this.Pin - pv) / (rho * G0);
    const x = q / Math.max(Math.abs(n), 0.05);
    this.npshr = this.npshr0 * this.npshScale * n * n * (0.5 + 0.5 * x * x);
    let ft;
    if (dry) ft = 0;
    else if (this.npshr < 0.05) ft = this.npsha > 0 ? 1 : 0;
    else {
      const r = this.npsha / this.npshr;
      ft = r >= 1 ? 1 - 0.03 * Math.exp(-(r - 1) / 0.12) : 0.97 * smooth((r - 0.5) / 0.5);
    }
    this.f += (ft - this.f) * Math.min(1, dt / 0.006);
    // torque: shutoff power plus a share rising with flow; a cavitating
    // impeller is partly running in vapour and draws less
    const load = (rho / this.rhoD) * (this.shut * n * Math.abs(n) + (1 - this.shut) * n * q) * (0.3 + 0.7 * this.f);
    this.tau = this.P0 / this.spec.wD * load;
    const w = n * this.spec.wD;
    this.Pshaft = this.tau * w;
    // the casing: shaft power not delivered as head is heat in the liquid
    const cp = line.fluid.cp || 4180;
    const heat = Math.max(0, this.Pshaft - Math.max(0, this.dP) * Math.max(0, md) / rho);
    // (a cryogenic pump is kept chilled down — a bleed, not modelled, holds
    // its casing at the liquid's temperature — so the cell's heat is not counted)
    const hAc = line.fluid.cryo ? 0 : this.hAc;
    const dTc = (heat - Math.max(0, md) * cp * (this.Tc - Tin) - hAc * (this.Tc - Tamb)) / (this.mc * cp);
    // implicit in the through-flow term (a large flow pins it to the inlet)
    const a = Math.max(0, md) * cp / (this.mc * cp);
    this.Tc = (this.Tc + dt * (dTc + a * this.Tc)) / (1 + dt * a);
  }
}

export class Turbopump {
  constructor(spec, { ambient, lines, net }) {
    this.spec = spec;
    this.wD = spec.Nd * TAU / 60;              // rad/s at design
    this.J = spec.J;
    this.w = 0;
    this.pumps = {};
    for (const [side, ps] of Object.entries(spec.pumps)) {
      const line = lines.find(l => l.id === side);
      const p = new Pump({ ...ps, wD: this.wD });
      line.pump = p;
      this.pumps[side] = p;
    }
    this.lines = lines;
    const T = spec.turbine;
    this.tur = { ...T, cosA: Math.cos((T.alpha ?? 20) * Math.PI / 180) };
    this.nozzle = net.el(T.el);
    this.inlet = net.vol(T.vol);
    this.gas = net.gas;
    this.ambient = ambient;
    this.tauT = 0; this.Pt = 0; this.c0 = 0;
    // what drives the turbine: by default the stand's gas (its inlet volume
    // and nozzle element); an engine's model plugs in its gas generator
    this.source = null;
    this.Texh = ambient.T;
    const B = spec.bearings;
    this.brg = { pb: ambient.T, tb: ambient.T };
    this.tauB = 0;
    this.vib = 0;
    // fault hooks
    this.brgFactor = 1;                        // bearing friction multiplier (distress)
    this.brgHeatPE = 1;                        // extra heat at the pump-end bearing (its own distress)
    this.imbalance = 1;                        // rotor imbalance multiplier (blade loss, rub)
    this.rub = 0;                              // N·m of rub torque at design speed
    this.turbEff = 1;                          // turbine efficiency multiplier (nozzle or blade damage)
    this.seized = false;
  }

  get n() { return this.w / this.wD; }
  get rpm() { return this.w * 60 / TAU; }

  step(dt) {
    const T = this.tur, Pa = this.ambient.P;
    const v = this.source ? this.source() : { P: this.inlet.P, T: this.inlet.T, Tw: this.inlet.Tw, mdot: this.nozzle.mdot, cp: this.gas.cp, gamma: this.gas.gamma };
    const g = { cp: v.cp, gamma: v.gamma }, md = Math.max(0, v.mdot);
    // spouting velocity of the drive gas, inlet to the exhaust duct
    const Pex = Pa * (1 + 0.05 * Math.min(1, md / (T.mdotD || 0.1)));
    const pr = Pex / Math.max(v.P, 1);
    const x = pr < 1 ? 1 - Math.pow(pr, (g.gamma - 1) / g.gamma) : 0;
    this.c0 = Math.sqrt(2 * g.cp * v.T * x);
    const c1 = (T.phi ?? 0.95) * this.c0 * T.cosA;
    const u = this.w * T.rm;
    this.tauT = md * T.rm * (c1 - u) * (1 + (T.psi ?? 0.85)) * (T.etaX ?? 0.8) * this.turbEff;
    const tauW = (T.kw ?? 0) * this.w * this.w;
    // pumps and bearings
    let tauP = 0;
    for (const p of Object.values(this.pumps)) tauP += p.tau;
    const B = this.spec.bearings;
    const brgDrag = (B.c0 + B.c1 * this.w) * this.brgFactor;
    const rub = this.rub * (0.3 + 0.7 * Math.min(1.5, this.n));
    const drive = this.tauT - tauP - tauW - rub;
    if (this.seized) this.w = Math.max(0, this.w - dt * this.wD * 3);
    else if (this.w <= 0 && drive <= B.c0 * this.brgFactor) { this.w = 0; this.tauB = Math.max(0, drive); }
    else {
      this.tauB = brgDrag;
      this.w = Math.max(0, this.w + dt * (drive - brgDrag) / this.J);
    }
    for (const p of Object.values(this.pumps)) p.n = this.n;
    // the gas leaves colder by the work it did
    this.Pt = this.tauT * this.w;
    if (md > 1e-4) this.Texh = Math.max(60, v.T - this.Pt / (md * g.cp));
    else this.Texh += (v.Tw - this.Texh) * Math.min(1, dt / 3);
    // bearings: friction heat in, propellant leakage cools; the turbine-end
    // one also feels the drive gas
    const pb = this.pumps[B.pumpEnd], fb = this.pumps[B.turbineEnd];
    const lpb = this.lines.find(l => l.id === B.pumpEnd), lfb = this.lines.find(l => l.id === B.turbineEnd);
    const Q = 0.5 * this.tauB * this.w + 0.5 * rub * this.w;
    const cool = (Tb, l, p) => (B.hA0 + B.hAflow * Math.max(0, l.mdot)) * (Tb - (p.Tc ?? this.ambient.T));
    this.brg.pb += dt * (Q * this.brgHeatPE - cool(this.brg.pb, lpb, pb)) / B.C;
    const gas = B.hAgas * Math.min(1, md / 0.02) * (this.Texh - this.brg.tb);
    this.brg.tb += dt * (Q - cool(this.brg.tb, lfb, fb) + gas) / B.C;
    // vibration, g RMS
    const n = this.n;
    let cav = 0;
    for (const p of Object.values(this.pumps)) cav += (1 - p.f) * Math.abs(p.n);
    this.vib = 0.12 + 1.1 * this.imbalance * n * n + 9 * cav + 6 * (this.brgFactor - 1) * n + (this.rub > 0 ? 4 * n : 0);
  }
}
