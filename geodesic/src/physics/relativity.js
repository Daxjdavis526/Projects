/* =============================================================================
   RELATIVITY — the quantities the curvature visualization actually draws
   -----------------------------------------------------------------------------
   Reference: Nichols et al., "Visualizing Spacetime Curvature via Frame-Drag
   Vortexes and Tidal Tendexes I", Phys. Rev. D 84, 124014 (2011),
   arXiv:1108.5486.

   The Weyl curvature tensor, split relative to an observer, gives two spatial,
   symmetric, TRACE-FREE 3x3 tensors:

     E_ij  the TIDAL field      (electric part)  -> tendex lines
     B_ij  the FRAME-DRAG field (magnetic part)  -> vortex lines

   E_ij is the one worth understanding first, because of a fact that surprises
   people: it has no c in it at all. In the Newtonian limit

     E_ij = d_i d_j Phi

   i.e. the leading term of the Riemann tensor IS the familiar Newtonian tidal
   tensor. Tides are not a consequence of spacetime curvature — at leading
   order they ARE spacetime curvature, and they have been measurable on every
   beach for all of human history.

   E_ij is also the honest thing to draw, because gravitational "force" is
   coordinate-dependent — a freely falling observer feels none — whereas tidal
   stretching cannot be transformed away in any frame. What survives every
   change of coordinates is exactly what a visualization should show.

   And because Phi superposes linearly in the weak field, so does E_ij. A
   sandbox with twelve bodies has a well-defined total tidal field.
   ========================================================================== */

import { G, C2, C } from './constants.js';

/* =============================================================================
   TIDAL FIELD
   ========================================================================== */

/* For a single point mass, Phi = -GM/r gives

     E_ij = (GM/r^3) (delta_ij - 3 n_i n_j),   n = r-hat

   whose eigenvalues are

     radial      -2GM/r^3   (negative => STRETCH)
     transverse  +GM/r^3    (positive => SQUEEZE), twice

   summing to zero, as a vacuum (trace-free) field must.

   Sign convention follows the reference: negative tendicity stretches,
   positive squeezes. Two freely falling particles separated by xi have
   relative acceleration  Da^j = -E^j_k xi^k.

   `out` is a flat 9-element array in row-major order.  */
export function tidalTensor(bodies, p, out = new Float64Array(9), softening = 0) {
  out.fill(0);
  const eps2 = softening * softening;

  for (const b of bodies) {
    if (!b.alive) continue;
    const dx = p[0] - b.pos[0], dy = p[1] - b.pos[1], dz = p[2] - b.pos[2];
    const r2 = dx * dx + dy * dy + dz * dz + eps2;
    if (r2 <= 0) continue;
    const r = Math.sqrt(r2);

    /* Inside a body of uniform density the exterior 1/r^3 law is wrong: the
       enclosed mass falls as r^3, giving a UNIFORM tidal field
       E_ij = (4/3)pi G rho (delta_ij - 3 n_i n_j) * ... Interior curvature is
       finite, not divergent, and the simulator says so rather than drawing a
       singularity where there is only rock. */
    let k;
    if (r < b.radius && b.radius > 0 && !b.isBlackHole) {
      k = G * b.mass / (b.radius ** 3);          // interior: constant
    } else {
      k = G * b.mass / (r * r * r);              // exterior
    }

    const nx = dx / r, ny = dy / r, nz = dz / r;
    out[0] += k * (1 - 3 * nx * nx);
    out[1] += k * (   - 3 * nx * ny);
    out[2] += k * (   - 3 * nx * nz);
    out[3] += k * (   - 3 * ny * nx);
    out[4] += k * (1 - 3 * ny * ny);
    out[5] += k * (   - 3 * ny * nz);
    out[6] += k * (   - 3 * nz * nx);
    out[7] += k * (   - 3 * nz * ny);
    out[8] += k * (1 - 3 * nz * nz);
  }
  return out;
}

/* Relative acceleration of two free-fall test particles separated by xi:
   Da^j = -E^j_k xi^k. This is geodesic deviation, and it is what "curvature"
   means operationally. */
export function tidalAcceleration(E, xi, out = [0, 0, 0]) {
  out[0] = -(E[0] * xi[0] + E[1] * xi[1] + E[2] * xi[2]);
  out[1] = -(E[3] * xi[0] + E[4] * xi[1] + E[5] * xi[2]);
  out[2] = -(E[6] * xi[0] + E[7] * xi[1] + E[8] * xi[2]);
  return out;
}

/* A scalar "how curved is it here" for colour maps: the Frobenius norm of
   E_ij. Related to the Kretschmann scalar for vacuum Schwarzschild, and
   crucially NOT the potential — a point can sit deep in a potential well with
   almost no tidal field (the interior of a large hollow shell, or far inside
   a supermassive black hole's horizon). */
export function curvatureMagnitude(E) {
  let s = 0;
  for (let i = 0; i < 9; i++) s += E[i] * E[i];
  return Math.sqrt(s);
}

/* =============================================================================
   FRAME-DRAG FIELD
   -----------------------------------------------------------------------------
   Unlike E_ij this carries an explicit c^2 and has NO Newtonian counterpart:
   it is irreducibly relativistic. A spinning mass drags inertial frames around
   with angular velocity (Lense-Thirring)

     Omega_fd = (G / c^2 r^3) [ 3 (S.n) n - S ]

   and the frame-drag field is its gradient, B_ij = d_(j Omega_i).
   ========================================================================== */

export function frameDragOmega(bodies, p, out = [0, 0, 0]) {
  out[0] = out[1] = out[2] = 0;
  for (const b of bodies) {
    if (!b.alive) continue;
    const S = b.spin;
    if (S[0] === 0 && S[1] === 0 && S[2] === 0) continue;
    const dx = p[0] - b.pos[0], dy = p[1] - b.pos[1], dz = p[2] - b.pos[2];
    const r = Math.hypot(dx, dy, dz);
    if (r <= 0) continue;
    const nx = dx / r, ny = dy / r, nz = dz / r;
    const Sn = S[0] * nx + S[1] * ny + S[2] * nz;
    const k = G / (C2 * r * r * r);
    out[0] += k * (3 * Sn * nx - S[0]);
    out[1] += k * (3 * Sn * ny - S[1]);
    out[2] += k * (3 * Sn * nz - S[2]);
  }
  return out;
}

/* B_ij by central differences of Omega_fd. Symmetrised and de-traced, since
   the frame-drag field is symmetric and trace-free like its tidal cousin. */
export function frameDragTensor(bodies, p, out = new Float64Array(9), h = 1e-4) {
  const a = [0, 0, 0], bv = [0, 0, 0];
  const q = [0, 0, 0];
  const grad = new Float64Array(9);

  for (let j = 0; j < 3; j++) {
    q[0] = p[0]; q[1] = p[1]; q[2] = p[2];
    q[j] = p[j] + h; frameDragOmega(bodies, q, a);
    q[j] = p[j] - h; frameDragOmega(bodies, q, bv);
    for (let i = 0; i < 3; i++) grad[i * 3 + j] = (a[i] - bv[i]) / (2 * h);
  }
  /* symmetrise */
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) out[i * 3 + j] = 0.5 * (grad[i * 3 + j] + grad[j * 3 + i]);
  }
  /* remove trace */
  const tr = (out[0] + out[4] + out[8]) / 3;
  out[0] -= tr; out[4] -= tr; out[8] -= tr;
  return out;
}

/* =============================================================================
   POTENTIAL, FIELD, TIME DILATION
   ========================================================================== */

/* Newtonian potential, AU^2/yr^2. Negative everywhere, -> 0 at infinity. */
export function potential(bodies, p, softening = 0) {
  let phi = 0;
  const eps2 = softening * softening;
  for (const b of bodies) {
    if (!b.alive) continue;
    const dx = p[0] - b.pos[0], dy = p[1] - b.pos[1], dz = p[2] - b.pos[2];
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz + eps2);
    if (r <= 0) continue;
    /* Inside a uniform sphere: Phi = -GM(3R^2 - r^2)/(2R^3), which is finite
       at the centre. The exterior formula would wrongly diverge. */
    if (r < b.radius && b.radius > 0 && !b.isBlackHole) {
      phi -= G * b.mass * (3 * b.radius ** 2 - r * r) / (2 * b.radius ** 3);
    } else {
      phi -= G * b.mass / r;
    }
  }
  return phi;
}

/* Newtonian gravitational field g = -grad Phi, AU/yr^2. */
export function gravitationalField(bodies, p, out = [0, 0, 0], softening = 0) {
  out[0] = out[1] = out[2] = 0;
  const eps2 = softening * softening;
  for (const b of bodies) {
    if (!b.alive) continue;
    const dx = b.pos[0] - p[0], dy = b.pos[1] - p[1], dz = b.pos[2] - p[2];
    const r2 = dx * dx + dy * dy + dz * dz + eps2;
    if (r2 <= 0) continue;
    const r = Math.sqrt(r2);
    let k;
    if (r < b.radius && b.radius > 0 && !b.isBlackHole) {
      k = G * b.mass / (b.radius ** 3);         // interior: g grows linearly
      out[0] += k * dx; out[1] += k * dy; out[2] += k * dz;
    } else {
      k = G * b.mass / (r2 * r);
      out[0] += k * dx; out[1] += k * dy; out[2] += k * dz;
    }
  }
  return out;
}

/* -----------------------------------------------------------------------------
   GRAVITATIONAL TIME DILATION — dtau/dt for a static observer.

   THIS IS THE COMPONENT THAT ACTUALLY CAUSES ORBITS. In the weak field the
   geodesic equation reduces to

     d^2 x^i / dt^2  =  -Gamma^i_00 c^2  =  -d_i Phi

   and Gamma^i_00 comes from g_00 = -(1 + 2Phi/c^2): the TIME-time component of
   the metric. Spatial curvature contributes at order (v/c)^2 and is negligible
   for anything slower than light.

   So a visualization that dents SPACE is showing the component that barely
   matters. A visualization that shows clocks running slow is showing the one
   that does.
-------------------------------------------------------------------------------*/
export function timeDilation(bodies, p) {
  /* Exact Schwarzschild if a single body dominates and we are outside it;
     weak-field superposition otherwise. */
  let sum = 0;
  for (const b of bodies) {
    if (!b.alive) continue;
    const r = Math.hypot(p[0] - b.pos[0], p[1] - b.pos[1], p[2] - b.pos[2]);
    const rs = b.schwarzschildRadius;
    if (r <= 0) continue;
    if (r >= b.radius) {
      sum += rs / r;                              // exterior
    } else if (!b.isBlackHole && b.radius > 0) {
      /* Interior of a uniform sphere: the potential is shallower than the
         exterior formula would suggest, and finite at the centre. */
      sum += rs * (3 * b.radius ** 2 - r * r) / (2 * b.radius ** 3);
    } else {
      sum += 1;                                   // inside a horizon
    }
  }
  const x = 1 - sum;
  return x > 0 ? Math.sqrt(x) : 0;
}

/* =============================================================================
   SCHWARZSCHILD GEOMETRY — exact, for a single body
   ========================================================================== */

/* Proper radial distance element: dl = dr / sqrt(1 - rs/r).

   Space near a mass is "longer" than the coordinate radius suggests: a shell
   between r and r+dr contains more ruler-distance than dr. This is REAL
   spatial curvature and it is a completely different statement from time
   dilation. */
export function properRadialStretch(rs, r) {
  const x = 1 - rs / r;
  return x > 0 ? 1 / Math.sqrt(x) : Infinity;
}

/* Flamm's paraboloid: z(r) = 2 sqrt(rs (r - rs)).

   The embedding diagram of the equatorial plane of Schwarzschild spacetime.
   It is EXACTLY correct as a statement about the geometry of that spatial
   slice — and it explains precisely nothing about why planets orbit, because
   orbits come from the time component. The famous picture is true and
   irrelevant at the same time, which is worth seeing. */
export function flammZ(rs, r) {
  return r >= rs ? 2 * Math.sqrt(rs * (r - rs)) : 0;
}

/* Effective potential for a massive test particle in Schwarzschild, per unit
   mass, with L the specific angular momentum:

     V_eff(r) = (1 - rs/r)(1 + L^2/(c^2 r^2))

   Circular orbits sit at its extrema; the ISCO at r = 3 rs is where the
   minimum and maximum merge and stable orbits cease to exist. Newtonian
   gravity has no such radius — this is a purely relativistic feature. */
export function schwarzschildVeff(rs, L, r) {
  return (1 - rs / r) * (1 + (L * L) / (C2 * r * r));
}

/* Photon sphere at 1.5 rs; ISCO at 3 rs; horizon at rs. */
export function schwarzschildRadii(rs) {
  return { horizon: rs, photonSphere: 1.5 * rs, isco: 3 * rs };
}

/* Orbital velocity for a circular orbit in Schwarzschild, as measured by a
   local static observer. Equals c at the photon sphere. */
export function schwarzschildCircularSpeed(rs, r) {
  const x = 1 - 1.5 * rs / r;
  if (x <= 0) return NaN;
  return C * Math.sqrt(rs / (2 * r)) / Math.sqrt(x);
}

/* =============================================================================
   SYMMETRIC 3x3 EIGENDECOMPOSITION (cyclic Jacobi)
   -----------------------------------------------------------------------------
   Needed for every lattice sample, so it must be fast and must not fail on
   degenerate eigenvalues — which happen constantly here, since the two
   transverse tidal eigenvalues of a spherical body are exactly equal. Jacobi
   rotation handles degeneracy gracefully where closed-form cubic solutions
   lose precision.
   ========================================================================== */
export function eigenSymmetric3(m, evals = new Float64Array(3), evecs = new Float64Array(9)) {
  const a = new Float64Array(m);        // working copy
  /* V = identity */
  evecs.fill(0); evecs[0] = evecs[4] = evecs[8] = 1;

  for (let sweep = 0; sweep < 12; sweep++) {
    let off = Math.abs(a[1]) + Math.abs(a[2]) + Math.abs(a[5]);
    if (off < 1e-30) break;

    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      const apq = a[p * 3 + q];
      if (Math.abs(apq) < 1e-32) continue;
      const app = a[p * 3 + p], aqq = a[q * 3 + q];
      const theta = (aqq - app) / (2 * apq);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1);
      const s = t * c;

      /* rotate A */
      for (let k = 0; k < 3; k++) {
        const akp = a[k * 3 + p], akq = a[k * 3 + q];
        a[k * 3 + p] = c * akp - s * akq;
        a[k * 3 + q] = s * akp + c * akq;
      }
      for (let k = 0; k < 3; k++) {
        const apk = a[p * 3 + k], aqk = a[q * 3 + k];
        a[p * 3 + k] = c * apk - s * aqk;
        a[q * 3 + k] = s * apk + c * aqk;
      }
      /* accumulate V */
      for (let k = 0; k < 3; k++) {
        const vkp = evecs[k * 3 + p], vkq = evecs[k * 3 + q];
        evecs[k * 3 + p] = c * vkp - s * vkq;
        evecs[k * 3 + q] = s * vkp + c * vkq;
      }
    }
  }

  evals[0] = a[0]; evals[1] = a[4]; evals[2] = a[8];
  return { values: evals, vectors: evecs };
}

/* Convenience: eigen-decompose the tidal field and return principal directions
   sorted most-stretching first (most negative tendicity first). Columns of
   `vectors` are the eigenvectors. */
export function tendexFrame(E) {
  const { values, vectors } = eigenSymmetric3(E);
  const idx = [0, 1, 2].sort((i, j) => values[i] - values[j]);
  return idx.map(i => ({
    tendicity: values[i],
    dir: [vectors[0 * 3 + i], vectors[1 * 3 + i], vectors[2 * 3 + i]],
    stretching: values[i] < 0,
  }));
}
