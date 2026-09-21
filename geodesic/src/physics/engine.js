/* =============================================================================
   ENGINE — the only object the renderer is allowed to see
   -----------------------------------------------------------------------------
   Imports nothing from three.js and touches no DOM, so the whole model runs
   under Node. That is not incidental: it is what makes the physics testable
   without a browser, and the test suite existing is what keeps it honest.
   ========================================================================== */

import { Body } from './body.js';
import {
  accelerations, totalEnergy, angularMomentum, centerOfMass,
  suggestTimestep, circularSpeed,
} from './nbody.js';
import { INTEGRATORS } from './integrators.js';
import { G, C, V_NEWTONIAN_MAX } from './constants.js';
import { resolveCollisions, rocheLimit } from './collisions.js';

export class Engine {
  constructor(opts = {}) {
    this.bodies = [];
    this.t = 0;                       // simulation time, years
    this.steps = 0;
    this.integrator = opts.integrator ?? 'verlet';
    this.relativistic = opts.relativistic ?? false;
    this.softening = opts.softening ?? 0;
    this.collisions = opts.collisions ?? true;
    this.dt = opts.dt ?? 1e-3;
    this.autoTimestep = opts.autoTimestep ?? true;
    this._store = {};
    this._accelOpts = {};
    this.events = [];                 // merges, horizon crossings, warnings

    this._E0 = null; this._L0 = null;
  }

  /* --- composition ------------------------------------------------------- */
  add(bodyOrOpts) {
    const b = bodyOrOpts instanceof Body ? bodyOrOpts : new Body(bodyOrOpts);
    this.bodies.push(b);
    this._invalidate();
    return b;
  }

  remove(id) {
    const i = this.bodies.findIndex(b => b.id === id);
    if (i >= 0) { this.bodies.splice(i, 1); this._invalidate(); }
  }

  clear() {
    this.bodies.length = 0;
    this.t = 0; this.steps = 0; this.events.length = 0;
    this._invalidate();
  }

  get(id) { return this.bodies.find(b => b.id === id) ?? null; }

  /* Call after editing a body in place: re-picks the timestep for the new
     configuration and re-baselines the conservation diagnostics, so the drift
     readout measures drift since the edit rather than since the last preset. */
  touch() { this._invalidate(); }

  /* Place a body in a circular orbit around another. Uses the two-body value
     sqrt(G(M+m)/r), not the test-particle sqrt(GM/r), because for comparable
     masses the latter does not actually close the orbit. */
  placeInOrbit(body, primary, radius, { inclination = 0, phase = 0, retrograde = false } = {}) {
    const v = circularSpeed(primary.mass, body.mass, radius) * (retrograde ? -1 : 1);
    const ci = Math.cos(inclination), si = Math.sin(inclination);
    const cp = Math.cos(phase), sp = Math.sin(phase);
    body.pos = [
      primary.pos[0] + radius * cp,
      primary.pos[1] + radius * sp * si,
      primary.pos[2] + radius * sp * ci,
    ];
    body.vel = [
      primary.vel[0] - v * sp,
      primary.vel[1] + v * cp * si,
      primary.vel[2] + v * cp * ci,
    ];
    this._invalidate();
    return body;
  }

  _invalidate() {
    this._store = {};
    if (this.autoTimestep && this.bodies.length > 1) {
      this.dt = suggestTimestep(this.bodies);
    }
    this._E0 = null; this._L0 = null;
  }

  /* --- integration -------------------------------------------------------- */
  _accelFn = (bodies, out) => {
    this._accelOpts.softening = this.softening;
    this._accelOpts.relativistic = this.relativistic;
    return accelerations(bodies, out, this._accelOpts);
  };

  /* Advance exactly n fixed steps. Accelerated time takes MORE steps, never
     larger ones — a symplectic integrator loses its conservation property the
     moment the step size varies. */
  step(n = 1) {
    const integ = INTEGRATORS[this.integrator] ?? INTEGRATORS.verlet;
    for (let k = 0; k < n; k++) {
      integ.fn(this.bodies, this.dt, this._accelFn, this._store);
      this.t += this.dt;
      this.steps++;
      if (this.collisions) {
        const merged = resolveCollisions(this.bodies);
        if (merged.length) {
          /* Stamp the simulation time so the UI can say when it happened
             rather than leaving a merge notice on screen forever. */
          for (const e of merged) e.at = this.t;
          this.events.push(...merged);
          this._invalidate();
        }
      }
    }
    if (this._E0 === null && this.bodies.length) {
      this._E0 = totalEnergy(this.bodies, this.softening);
      this._L0 = angularMomentum(this.bodies);
    }
  }

  /* Advance by a wall-clock frame at a given time multiplier, capped so the
     simulation never silently integrates garbage to keep up. */
  advance(wallDt, multiplier, maxSteps = 20000) {
    const target = wallDt * multiplier;               // simulated years wanted
    const want = Math.max(0, Math.round(target / this.dt));
    const n = Math.min(want, maxSteps);
    if (n > 0) this.step(n);
    return { requested: want, taken: n, limited: n < want };
  }

  /* --- diagnostics -------------------------------------------------------- */
  diagnostics() {
    if (!this.bodies.length) {
      return { energy: 0, energyDrift: 0, L: [0, 0, 0], LDrift: 0, com: null, warnings: [] };
    }
    const E = totalEnergy(this.bodies, this.softening);
    const L = angularMomentum(this.bodies);
    const E0 = this._E0 ?? E, L0 = this._L0 ?? L;
    const L0m = Math.hypot(...L0), Lm = Math.hypot(...L);

    const warnings = [];
    for (const b of this.bodies) {
      const v = Math.hypot(...b.vel);
      if (v > V_NEWTONIAN_MAX * C) {
        warnings.push({
          kind: 'relativistic-speed', body: b.id,
          text: `${b.name} is moving at ${(v / C * 100).toFixed(1)}% of c — the Newtonian layer is no longer trustworthy here.`,
        });
      }
      if (b.violatesBuchdahl && !b.isBlackHole) {
        warnings.push({
          kind: 'buchdahl', body: b.id,
          text: `${b.name} exceeds the Buchdahl bound (C = ${b.compactness.toFixed(3)} > 8/9). No static body can support itself at this compactness.`,
        });
      }
    }
    /* The 1PN term is applied relative to the dominant mass; say so when that
       assumption is shaky. */
    if (this.relativistic && this.bodies.length > 1) {
      const sorted = [...this.bodies].sort((a, b) => b.mass - a.mass);
      if (sorted[1].mass > 0.1 * sorted[0].mass) {
        warnings.push({
          kind: 'pn-validity',
          text: 'Post-Newtonian correction assumes one dominant mass. With comparable masses the full EIH equations would be needed; the correction shown is indicative only.',
        });
      }
    }

    return {
      energy: E,
      energyDrift: E0 !== 0 ? Math.abs((E - E0) / E0) : 0,
      L, LDrift: L0m > 0 ? Math.abs((Lm - L0m) / L0m) : 0,
      com: centerOfMass(this.bodies),
      warnings,
    };
  }

  /* Roche limits of every satellite against every primary, for UI flags. */
  rocheFlags() {
    const flags = [];
    for (const prim of this.bodies) {
      for (const sat of this.bodies) {
        if (sat === prim || sat.mass > prim.mass) continue;
        const d = Math.hypot(
          sat.pos[0] - prim.pos[0], sat.pos[1] - prim.pos[1], sat.pos[2] - prim.pos[2]);
        const { fluid, rigid } = rocheLimit(prim, sat);
        if (d < fluid) flags.push({ primary: prim.id, satellite: sat.id, d, fluid, rigid });
      }
    }
    return flags;
  }

  snapshot() {
    return {
      t: this.t, steps: this.steps, dt: this.dt,
      integrator: this.integrator, relativistic: this.relativistic,
      softening: this.softening,
      bodies: this.bodies.map(b => b.snapshot()),
      diagnostics: this.diagnostics(),
      events: this.events.slice(-8),
    };
  }

  /* Deep copy for rewind. Cheap at these body counts. */
  saveState() {
    return {
      t: this.t, steps: this.steps,
      bodies: this.bodies.map(b => ({
        id: b.id, name: b.name, material: b.material, color: b.color,
        mass: b.mass, radius: b.radius, fixed: b.fixed,
        pos: [...b.pos], vel: [...b.vel], spin: [...b.spin],
      })),
    };
  }

  restoreState(s) {
    this.t = s.t; this.steps = s.steps;
    this.bodies = s.bodies.map(d => new Body(d));
    this._invalidate();
  }
}
