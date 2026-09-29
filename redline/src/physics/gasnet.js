/* A lumped-parameter gas network: control volumes joined by flow elements.

   Each volume holds a mass and an internal energy of ideal gas; pressure and
   temperature follow from those. Each step:

     1. actuators move (valves stroke, regulators respond, coils charge)
     2. every element computes its mass flow from the states either side
     3. every volume integrates  dm/dt = Σ mdot
                                 dU/dt = Σ mdot·cp·T_in − Σ mdot·cp·T + Q_wall

   Filling a small volume compresses the gas already in it and heats it;
   blowing a large one down cools it; the walls pull both back toward the
   wall temperature, and the walls themselves slowly exchange heat with the
   room. That is the whole of the thermal model and it is enough to make a
   bottle chill during a long run and a thruster body frost after a long
   firing.

   The integrator is explicit Euler with an automatically chosen step: small
   volumes joined by large valves are stiff, and the step is bounded by the
   fastest linearised pressure-equalisation rate anywhere in the network.
   Nothing here knows about thrusters, sensors, or procedures. */

import { prepareGas, maxConductance } from './gas.js';
import { ELEMENT_TYPES } from './elements.js';

const AMBIENT = -1;

export class GasNetwork {
  constructor({ gas, ambient, volumes, elements }) {
    this.gas = prepareGas(gas);
    this.ambient = { P: ambient.P, T: ambient.T };
    this._ambState = { P: ambient.P, T: ambient.T };
    this.t = 0;
    this.volumes = volumes.map(v => this._makeVolume(v));
    this.byVol = new Map(this.volumes.map((v, i) => [v.id, i]));
    this.elements = elements.map(s => {
      const C = ELEMENT_TYPES[s.type];
      if (!C) throw new Error(`unknown element type ${s.type}`);
      return new C(s, this);
    });
    this.byEl = new Map(this.elements.map(e => [e.id, e]));
    this.dtMin = 2e-6;
    this.dtMax = 1e-4;
  }

  _makeVolume(v) {
    const g = this.gas;
    const T = v.T0 ?? this.ambient.T;
    const P = v.P0 ?? this.ambient.P;
    const m = P * v.V / (g.R * T);
    const w = v.wall || {};
    return {
      id: v.id, V: v.V, m, U: m * g.cv * T, P, T,
      dm: 0, dU: 0, through: 0,
      wallC: w.C ?? 0, hA0: w.hA ?? 0, hAk: w.hAflow ?? 0, hAamb: w.hAamb ?? 0,
      Tw: w.T0 ?? this.ambient.T,
      extQ: 0,                                   // external heat, W (fault/test hook)
    };
  }

  index(id) {
    if (id === 'ambient' || id === undefined || id === null) return AMBIENT;
    const i = this.byVol ? this.byVol.get(id) : this.volumes.findIndex(v => v.id === id);
    if (i === undefined || i < 0) throw new Error(`unknown volume ${id}`);
    return i;
  }
  state(i) { return i === AMBIENT ? this._ambState : this.volumes[i]; }
  vol(id) { return this.volumes[this.index(id)]; }
  el(id) { return this.byEl.get(id); }

  /* Largest stable step: 0.4 / (fastest equalisation rate). */
  stableDt() {
    const g = this.gas;
    let worst = 0;
    for (const v of this.volumes) v._lam = 0;
    for (const e of this.elements) {
      const a = e.CdAbound();
      if (a <= 0) continue;
      const T = e.from >= 0 ? this.volumes[e.from].T : this.ambient.T;
      const G = maxConductance(a, T, g);
      if (e.from >= 0) { const v = this.volumes[e.from]; v._lam += G * g.R * v.T / v.V; }
      if (e.to >= 0) { const v = this.volumes[e.to]; v._lam += G * g.R * v.T / v.V; }
    }
    for (const v of this.volumes) if (v._lam > worst) worst = v._lam;
    if (worst <= 0) return this.dtMax;
    return Math.max(this.dtMin, Math.min(this.dtMax, 0.4 / worst));
  }

  step(dt) {
    const g = this.gas, cp = g.cp, cv = g.cv;
    const els = this.elements, vols = this.volumes;
    for (let i = 0; i < els.length; i++) els[i].update(dt, this);
    for (let i = 0; i < vols.length; i++) { const v = vols[i]; v.dm = 0; v.dU = 0; v.through = 0; }
    for (let i = 0; i < els.length; i++) {
      const e = els[i];
      let m = e.flow(this);
      if (!Number.isFinite(m)) m = 0;
      e.mdot = m;
      let src = e.from, dst = e.to;
      if (m < 0) { src = e.to; dst = e.from; m = -m; }
      if (m === 0) continue;
      if (src >= 0) { const v = vols[src]; v.dm -= m; v.dU -= m * cp * v.T; v.through += m; }
      if (dst >= 0) { const v = vols[dst]; v.dm += m; v.dU += m * cp * e.Tdeliver; v.through += m; }
    }
    const Ta = this.ambient.T;
    for (let i = 0; i < vols.length; i++) {
      const v = vols[i];
      if (v.wallC > 0) {
        const hA = v.hA0 + v.hAk * v.through;
        const Q = hA * (v.Tw - v.T);
        v.dU += Q;
        v.Tw += dt * (-Q + v.hAamb * (Ta - v.Tw)) / v.wallC;
      }
      v.dU += v.extQ;
      v.m += v.dm * dt;
      v.U += v.dU * dt;
      if (v.m < 1e-12) { v.m = 1e-12; }
      let T = v.U / (v.m * cv);
      if (T < 30) { T = 30; v.U = v.m * cv * T; }
      v.T = T;
      v.P = v.m * g.R * T / v.V;
    }
    this.t += dt;
  }

  totalMass() { return this.volumes.reduce((s, v) => s + v.m, 0); }
}
