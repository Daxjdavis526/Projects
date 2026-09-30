/* Flow elements of a lumped gas network, and the actuators that move them.

   An element connects two volumes (or a volume and the atmosphere) and
   decides, each step, how much gas crosses it. Actuated elements carry a
   command (what the control system asked for) and a position (what the
   hardware actually did). Those are deliberately two different things: the
   gap between them is where valves are slow, stick, or fail — and the
   operator only ever sees the command and whatever position indication the
   hardware happens to have.

   Every element exposes fault hooks as plain fields (blockage, leakCdA,
   maxOpen, stuck, strokeScale, …) so the fault engine can alter the physics
   without the elements knowing faults exist. */

import { orificeFlow } from './gas.js';
import { Nozzle } from './nozzle.js';

const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);

/* Smooth travel: a valve accelerates and decelerates rather than moving at
   constant speed. `u` is linear progress 0..1; the flow area follows the
   eased value. */
const ease = u => u * u * (3 - 2 * u);

export class Element {
  constructor(spec, net) {
    this.spec = spec;
    this.id = spec.id;
    this.type = spec.type;
    this.from = net.index(spec.from);
    this.to = net.index(spec.to);
    this.mdot = 0;
    this.Tdeliver = net.ambient.T;
    this.leakCdA = 0;          // fault hook: seat leakage when closed
    this.blockage = 0;         // fault hook: fraction of flow area obstructed
  }
  update(dt, net) {}
  CdA() { return 0; }
  /* Upper bound on the flow area this step, for the step-size controller. */
  CdAbound() { return this.CdA(); }
  flow(net) {
    const a = net.state(this.from), b = net.state(this.to);
    const CdA = this.CdA();
    const m = orificeFlow(CdA, a.P, a.T, b.P, b.T, net.gas);
    this.Tdeliver = m >= 0 ? a.T : b.T;
    return m;
  }
}

/* A fixed restriction: filter element, line loss, calibrated orifice, or a
   leak path to the atmosphere. */
export class Orifice extends Element {
  constructor(spec, net) {
    super(spec, net);
    this.CdA0 = spec.CdA;
  }
  CdA() { return this.CdA0 * (1 - this.blockage); }
}

/* An actuated valve. The actuator kinds differ only in how position follows
   command:
     manual     a technician turns a handle; slow, only from inside the cell
     pneumatic  a pneumatic ball valve: dead time, then a stroke of ~1 s,
                with open/closed limit switches
     solenoid   a direct-acting solenoid, with the coil's electrical dynamics
                modelled (see SolenoidValve)
   `normally` is the fail-safe position: where the valve goes when its
   actuator loses power or air. A command here is always 1 = OPEN,
   0 = CLOSED, whatever the valve's normal position; the valve works out
   whether that means energising. */
export class Valve extends Element {
  constructor(spec, net) {
    super(spec, net);
    this.CdAmax = spec.CdA;
    this.normally = spec.normally || 'closed';
    this.cmd = spec.initial ?? (this.normally === 'open' ? 1 : 0);
    this.pos = this.cmd;          // eased position, 0..1
    this.u = this.cmd;            // linear travel progress
    this.delay = spec.delay ?? 0;
    this.strokeOpen = spec.strokeOpen ?? spec.stroke ?? 0.05;
    this.strokeClose = spec.strokeClose ?? spec.stroke ?? 0.05;
    this.char = spec.char || 'linear';
    this.pending = null;          // {cmd, at} — command waiting out its dead time
    // fault hooks
    this.maxOpen = 1;             // fails to fully open
    this.stuck = false;           // position frozen
    this.strokeScale = 1;         // sluggish actuator
    this.failClosed = false;      // will not open whatever it is told
  }
  command(open, net) {
    const c = open ? 1 : 0;
    if (c === this.cmd && !this.pending) return;
    this.cmd = c;
    this.pending = { cmd: c, at: net.t + this.delay };
  }
  get energized() { return this.normally === 'open' ? this.cmd === 0 : this.cmd === 1; }
  update(dt, net) {
    if (this.pending && net.t >= this.pending.at) { this.target = this.pending.cmd; this.pending = null; }
    if (this.target === undefined) this.target = this.cmd;
    if (this.stuck) return;
    let tgt = this.target;
    if (this.failClosed) tgt = 0;
    tgt = Math.min(tgt, this.maxOpen);
    const stroke = (tgt > this.u ? this.strokeOpen : this.strokeClose) * this.strokeScale;
    const rate = stroke > 0 ? dt / stroke : 1;
    if (this.u < tgt) this.u = Math.min(tgt, this.u + rate);
    else if (this.u > tgt) this.u = Math.max(tgt, this.u - rate);
    this.pos = ease(this.u);
  }
  area(pos) {
    switch (this.char) {
      case 'ball': return Math.pow(pos, 1.8);      // quarter-turn ball: slow start
      case 'quick': return Math.sqrt(pos);         // quick-opening poppet
      default: return pos;
    }
  }
  CdA() {
    const open = this.CdAmax * this.area(this.pos) * (1 - this.blockage);
    return this.leakCdA + (open > 0 ? open : 0);
  }
  CdAbound() { return Math.max(this.CdA(), this.pos > 0 || this.u !== this.target ? this.CdAmax * 0.25 : 0); }
  /* Limit-switch truth (the sensor layer decides whether the switch works). */
  /* zsoAt: where the open limit switch trips. A fault hook — a misadjusted
     switch reports OPEN on a valve that is not. */
  get atOpen() { return this.u >= (this.zsoAt ?? 0.98); }
  get atClosed() { return this.u <= 0.02; }
}

/* A direct-acting solenoid valve with its coil modelled electrically.

       L·di/dt = V − i·R − Ke·(du/dt)

   The armature does not move until the magnetic pull (∝ i²) beats the spring
   plus the pressure load on the seat, so the valve opens later at higher
   inlet pressure; while it moves, its motion induces a back-EMF that puts a
   characteristic dip in the coil current. That dip is how test engineers
   see a solenoid actually stroke — the valve itself has no position sensor.
   On release the flyback diode lets the current decay through the coil; the
   valve closes when it falls below the drop-out current. */
export class SolenoidValve extends Valve {
  constructor(spec, net) {
    super(spec, net);
    const e = spec.coil || {};
    this.V = e.volts ?? 28;
    this.R = e.ohms ?? 24;
    this.L = e.henry ?? 0.12;
    this.Ke = e.backEmf ?? 0.008;           // V per (unit travel / s)
    this.iPull0 = e.pullIn ?? 0.55;          // A at zero ΔP
    this.iPullPerPa = e.pullInPerPa ?? 1.8e-7; // A per Pa of seat ΔP
    this.iDrop = e.dropOut ?? 0.33;
    this.Vdiode = 0.7;
    this.i = 0;
    this.drive = 0;          // driver output, 0/1 (the command, with no dead time)
    this.uRate = 0;
    this.moving = false;
    this.coilOpen = false;   // fault hook: open coil / broken wire
    this.pullScale = 1;      // fault hook: weak coil / binding armature
    // Shot-to-shot scatter: no two actuations of a real solenoid are
    // identical (friction, armature position, coil temperature). Set per
    // actuation from the model's seeded RNG; absent (nominal predictions)
    // it is exactly repeatable.
    this.rng = null;
    this.jitPull = 1; this.jitStroke = 1;
  }
  command(open) {
    const c = open ? 1 : 0;
    if (c !== this.cmd && this.rng) {
      this.jitPull = 1 + 0.012 * this.rng.gauss();
      this.jitStroke = 1 + 0.05 * this.rng.gauss();
    }
    this.cmd = c;
    this.drive = this.normally === 'open' ? 1 - c : c;
  }
  update(dt, net) {
    // electrical
    let v = this.drive ? this.V : (this.i > 0 ? -this.Vdiode : 0);
    if (this.coilOpen) { this.i = 0; v = 0; }
    else {
      const di = (v - this.i * this.R - this.Ke * this.uRate) / this.L;
      this.i += di * dt;
      if (!this.drive && this.i < 0) this.i = 0;
    }
    // mechanical: energised-means-open for a normally-closed valve
    const a = net.state(this.from), b = net.state(this.to);
    const dP = Math.max(0, a.P - b.P);
    const iPull = (this.iPull0 + this.iPullPerPa * dP) * this.pullScale * this.jitPull;
    const nc = this.normally !== 'open';
    // Magnetic pull rises as the air gap closes (force ∝ i²/gap²), so the
    // current needed to keep the armature moving falls with travel: from the
    // pull-in current with the valve shut to the drop-out current when it is
    // seated open. Once it starts to move it completes the stroke.
    const pulled = this.i > iPull + (this.iDrop - iPull) * this.u;
    let tgt = nc ? (pulled ? 1 : 0) : (pulled ? 0 : 1);
    if (this.failClosed) tgt = 0;
    tgt = Math.min(tgt, this.maxOpen);
    const prev = this.u;
    if (!this.stuck) {
      const stroke = (tgt > this.u ? this.strokeOpen : this.strokeClose) * this.strokeScale * this.jitStroke;
      const rate = dt / stroke;
      if (this.u < tgt) this.u = Math.min(tgt, this.u + rate);
      else if (this.u > tgt) this.u = Math.max(tgt, this.u - rate);
    }
    this.uRate = (this.u - prev) / dt;   // signed: opening dips the current, closing bumps it
    this.moving = this.uRate !== 0;
    this.pos = ease(this.u);
    this.target = tgt;
  }
}

/* A dome-loaded pressure-reducing regulator.

   The poppet opens in proportion to how far the outlet has fallen below the
   loading (dome) pressure, with a first-order lag:

       x* = clamp((Pset + SPE·(Pin,ref − Pin) − Pout,g) / band, 0, 1)
       τ·dx/dt = x* − x

   which gives the three behaviours every real single-stage regulator has:
   lock-up at the set pressure when there is no flow; droop (outlet falls as
   flow rises, because the poppet needs an error to open); and supply-pressure
   effect (outlet creeps up as the supply bottle blows down). As the supply
   falls towards the outlet pressure the poppet runs out of travel and the
   outlet simply follows the supply — regulator dropout.

   The dome pressure comes from an electronic pressure controller (EPC-101),
   which slews toward its command at a limited rate. */
export class Regulator extends Element {
  constructor(spec, net) {
    super(spec, net);
    this.CdAmax = spec.CdA;
    this.band = spec.band;              // Pa of outlet error for full stroke
    this.tau = spec.tau ?? 0.001;
    this.spe = spec.spe ?? 0.01;
    this.PinRef = spec.PinRef ?? 0;
    this.domeRate = spec.domeRate ?? 3e5;     // Pa/s the EPC can slew the dome
    this.domeTau = spec.domeTau ?? 0.25;
    this.setCmd = 0;                     // EPC command, Pa gauge
    this.domeRamp = 0;                   // rate-limited command
    this.dome = 0;                       // actual dome pressure, Pa gauge
    this.x = 0;
    this.muJT = net.gas.muJT ?? 0;
    // fault hooks
    this.setBias = 0;                    // Pa: regulator set wrongly (spring/dome offset)
    this.stuckAt = null;                 // poppet frozen at this opening
    this.droopScale = 1;                 // worn/undersized: more droop
    this.creepCdA = 0;                   // seat creep: leaks through when locked up
  }
  command(PsetGauge) { this.setCmd = Math.max(0, PsetGauge); }
  update(dt, net) {
    // EPC: slew-rate-limited ramp, then first-order dome fill
    const d = this.setCmd - this.domeRamp, step = this.domeRate * dt;
    this.domeRamp += Math.abs(d) <= step ? d : Math.sign(d) * step;
    this.dome += (this.domeRamp - this.dome) * Math.min(1, dt / this.domeTau);
    const a = net.state(this.from), b = net.state(this.to);
    const Pout = b.P - net.ambient.P;
    const set = this.dome + this.setBias + this.spe * (this.PinRef - (a.P - net.ambient.P));
    const xt = this.dome <= 1000 ? 0 : clamp01((set - Pout) / (this.band * this.droopScale));
    if (this.stuckAt !== null) { this.x = this.stuckAt; return; }
    this.x += (xt - this.x) * Math.min(1, dt / this.tau);
  }
  CdA() { return this.CdAmax * this.x * (1 - this.blockage) + this.creepCdA; }
  CdAbound() { return Math.max(this.CdA(), this.CdAmax * 0.25); }
  flow(net) {
    const a = net.state(this.from), b = net.state(this.to);
    const m = orificeFlow(this.CdA(), a.P, a.T, b.P, b.T, net.gas);
    // Joule–Thomson cooling across the throttle.
    if (m >= 0) this.Tdeliver = Math.max(40, a.T - this.muJT * (a.P - b.P));
    else this.Tdeliver = Math.max(40, b.T - this.muJT * (b.P - a.P));
    return m;
  }
}

/* A spring-loaded relief valve to atmosphere: cracks at the set pressure,
   reaches full lift at 10 % accumulation, and does not reseat until the
   pressure has fallen by its blowdown (hysteresis). */
export class ReliefValve extends Element {
  constructor(spec, net) {
    super(spec, net);
    this.CdAmax = spec.CdA;
    this.set = spec.set;                 // Pa gauge
    this.full = spec.set * (1 + (spec.accumulation ?? 0.1));
    this.reseat = spec.set * (1 - (spec.blowdown ?? 0.08));
    this.lift = 0;
    this.open = false;
    this.setScale = 1;                   // fault hook: relief set wrong
  }
  update(dt, net) {
    const Pg = net.state(this.from).P - net.ambient.P;
    const set = this.set * this.setScale, full = this.full * this.setScale, reseat = this.reseat * this.setScale;
    if (!this.open && Pg >= set) this.open = true;
    if (this.open && Pg <= reseat) this.open = false;
    const tgt = this.open ? clamp01((Pg - reseat) / (full - reseat)) : 0;
    this.lift += (tgt - this.lift) * Math.min(1, dt / 0.004);
  }
  CdA() { return this.CdAmax * this.lift + this.leakCdA; }
}

/* The thruster's nozzle, venting a volume to atmosphere and producing thrust. */
export class NozzleElement extends Element {
  constructor(spec, net) {
    super(spec, net);
    this.nozzle = new Nozzle(spec.nozzle, net.gas);
    this.F = 0;
  }
  flow(net) {
    const a = net.state(this.from);
    const o = this.nozzle.evaluate(a.P, a.T, net.ambient.P, net.ambient.T);
    this.F = o.F;
    this.Tdeliver = o.mdot >= 0 ? a.T : net.ambient.T;
    return o.mdot;
  }
  CdA() { return this.nozzle.Cd * this.nozzle.Ae; }
}

export const ELEMENT_TYPES = {
  orifice: Orifice,
  filter: Orifice,
  valve: Valve,
  solenoid: SolenoidValve,
  regulator: Regulator,
  relief: ReliefValve,
  nozzle: NozzleElement,
};
