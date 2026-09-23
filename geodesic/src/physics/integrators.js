/* =============================================================================
   INTEGRATORS
   -----------------------------------------------------------------------------
   For bound orbits integrated over many periods, SYMPLECTICITY MATTERS MORE
   THAN ORDER. A symplectic method conserves a slightly-perturbed Hamiltonian
   exactly, so its energy error oscillates within a bound forever. A
   non-symplectic method of higher order has smaller error per step but that
   error accumulates secularly: RK4 will visibly spiral a planet into or out of
   its orbit over a few thousand periods, while 2nd-order velocity Verlet will
   not, ever.

   That is why the default here is Verlet and not RK4, despite RK4 being the
   more famous name.

   Symplectic integrators also require a FIXED timestep. Varying it destroys
   the conservation property. Accelerated time therefore takes MORE STEPS, never
   bigger ones.
   ========================================================================== */

/* --- scratch, to keep the integrators allocation-free in the hot loop ------ */
function ensureScratch(store, n) {
  if (!store.acc || store.acc.length !== n) {
    store.acc = Array.from({ length: n }, () => [0, 0, 0]);
  }
  return store.acc;
}

/* -----------------------------------------------------------------------------
   VELOCITY VERLET (leapfrog) — 2nd order, symplectic, time-reversible.

     v(t+h/2) = v(t) + (h/2) a(t)
     r(t+h)   = r(t) + h v(t+h/2)
     a(t+h)   = A(r(t+h))
     v(t+h)   = v(t+h/2) + (h/2) a(t+h)

   One force evaluation per step, reusing the previous step's accelerations.
-------------------------------------------------------------------------------*/
export function velocityVerlet(bodies, h, accelFn, store = {}) {
  const n = bodies.length;
  const acc = ensureScratch(store, n);

  if (!store.primed) { accelFn(bodies, acc); store.primed = true; }

  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.fixed) continue;
    const a = acc[i];
    b.vel[0] += 0.5 * h * a[0];
    b.vel[1] += 0.5 * h * a[1];
    b.vel[2] += 0.5 * h * a[2];
    b.pos[0] += h * b.vel[0];
    b.pos[1] += h * b.vel[1];
    b.pos[2] += h * b.vel[2];
  }

  accelFn(bodies, acc);

  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.fixed) continue;
    const a = acc[i];
    b.vel[0] += 0.5 * h * a[0];
    b.vel[1] += 0.5 * h * a[1];
    b.vel[2] += 0.5 * h * a[2];
    b.acc[0] = a[0]; b.acc[1] = a[1]; b.acc[2] = a[2];
  }
  return store;
}

/* -----------------------------------------------------------------------------
   YOSHIDA 4th ORDER — symplectic, built by composing three leapfrog steps with
   the classic triple-jump coefficients:

     w1 =  1 / (2 - 2^(1/3))
     w0 = -2^(1/3) / (2 - 2^(1/3))

   The negative middle step is what cancels the 3rd-order error term. Three
   force evaluations per step buys several orders of magnitude in accuracy over
   Verlet at the same step size.
-------------------------------------------------------------------------------*/
const CBRT2 = Math.cbrt(2);
const W1 = 1 / (2 - CBRT2);
const W0 = -CBRT2 / (2 - CBRT2);
/* drift-kick-drift composition coefficients */
const YC = [W1 / 2, (W0 + W1) / 2, (W0 + W1) / 2, W1 / 2];
const YD = [W1, W0, W1];

export function yoshida4(bodies, h, accelFn, store = {}) {
  const n = bodies.length;
  const acc = ensureScratch(store, n);

  for (let stage = 0; stage < 4; stage++) {
    const c = YC[stage] * h;
    for (let i = 0; i < n; i++) {
      const b = bodies[i];
      if (b.fixed) continue;
      b.pos[0] += c * b.vel[0];
      b.pos[1] += c * b.vel[1];
      b.pos[2] += c * b.vel[2];
    }
    if (stage < 3) {
      accelFn(bodies, acc);
      const d = YD[stage] * h;
      for (let i = 0; i < n; i++) {
        const b = bodies[i];
        if (b.fixed) continue;
        const a = acc[i];
        b.vel[0] += d * a[0];
        b.vel[1] += d * a[1];
        b.vel[2] += d * a[2];
        b.acc[0] = a[0]; b.acc[1] = a[1]; b.acc[2] = a[2];
      }
    }
  }
  store.primed = false;   // Verlet would need re-priming after this
  return store;
}

/* -----------------------------------------------------------------------------
   RK4 — 4th order, NOT symplectic. Provided so the simulator can DEMONSTRATE
   the difference: run a circular orbit for a few thousand periods under RK4
   and watch the energy march off, then switch to Verlet and watch it stop.
   That is a genuine lesson about numerical methods, so the option earns its
   place; it is not the default and the UI says why.
-------------------------------------------------------------------------------*/
export function rk4(bodies, h, accelFn, store = {}) {
  const n = bodies.length;
  const acc = ensureScratch(store, n);
  const p0 = bodies.map(b => [...b.pos]);
  const v0 = bodies.map(b => [...b.vel]);
  const kp = [[], [], [], []], kv = [[], [], [], []];

  const evalAt = (stage, frac, srcP, srcV) => {
    for (let i = 0; i < n; i++) {
      bodies[i].pos[0] = p0[i][0] + frac * h * srcV[i][0];
      bodies[i].pos[1] = p0[i][1] + frac * h * srcV[i][1];
      bodies[i].pos[2] = p0[i][2] + frac * h * srcV[i][2];
    }
    accelFn(bodies, acc);
    for (let i = 0; i < n; i++) {
      kv[stage][i] = [...acc[i]];
      kp[stage][i] = [
        v0[i][0] + frac * h * (srcP === null ? 0 : srcP[i][0]),
        v0[i][1] + frac * h * (srcP === null ? 0 : srcP[i][1]),
        v0[i][2] + frac * h * (srcP === null ? 0 : srcP[i][2]),
      ];
    }
  };

  evalAt(0, 0, null, v0);
  evalAt(1, 0.5, kv[0], kp[0]);
  evalAt(2, 0.5, kv[1], kp[1]);
  evalAt(3, 1.0, kv[2], kp[2]);

  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.fixed) { b.pos = [...p0[i]]; b.vel = [...v0[i]]; continue; }
    for (let d = 0; d < 3; d++) {
      b.pos[d] = p0[i][d] + (h / 6) * (kp[0][i][d] + 2 * kp[1][i][d] + 2 * kp[2][i][d] + kp[3][i][d]);
      b.vel[d] = v0[i][d] + (h / 6) * (kv[0][i][d] + 2 * kv[1][i][d] + 2 * kv[2][i][d] + kv[3][i][d]);
    }
  }
  store.primed = false;
  return store;
}

export const INTEGRATORS = {
  verlet:   { label: 'Velocity Verlet', order: 2, symplectic: true,  evals: 1, fn: velocityVerlet },
  yoshida4: { label: 'Yoshida 4th',     order: 4, symplectic: true,  evals: 3, fn: yoshida4 },
  rk4:      { label: 'Runge-Kutta 4',   order: 4, symplectic: false, evals: 4, fn: rk4 },
};
