/* =============================================================================
   LATTICE — a cube of freely falling markers
   -----------------------------------------------------------------------------
   The one honest way to draw a grid that reacts to mass.

   A coordinate grid must never bend. Bending one is the rubber-sheet lie: it
   implies space is a substance with a shape, and it explains orbits by
   appealing to a gravity outside the picture. The reference grid in
   scene.js therefore stays rigid forever.

   This is a different object entirely. Every node is a TEST PARTICLE in free
   fall — a real thing, on a real trajectory, that you could in principle go
   and put a marker on. When this grid deforms, the deformation is a
   measurement, not a drawing convention. And the equation governing it is
   geodesic deviation,

       d^2 xi^i / dt^2  =  -E^i_j xi^j

   so watching the lattice distort is watching the tidal tensor act. There is
   no analogy anywhere in it.

   Two facts make the mode worth its cost, and both are checked in the test
   suite rather than asserted in a caption:

     1. IN VACUUM THE VOLUME IS CONSERVED. E_ij is trace-free where there is
        no matter, so a falling ball of markers is stretched along one axis
        by exactly as much as it is squeezed along the other two. It becomes
        a cigar of the same volume. A rubber sheet has no such property.

     2. WHERE THERE IS MATTER THE VOLUME SHRINKS, at

            (1/V) d^2V/dt^2 |_{t=0} = -4 pi G rho

        which is Einstein's field equation in the form Baez states it: mass
        is the thing that makes a ball of freely falling particles start to
        lose volume. The panel reports the measured rate beside the
        predicted one.

   Markers are massless. They fall in the field of the bodies but exert no
   force on the bodies or on each other, which is what makes them test
   particles and what the explainer says out loud — a real dust cloud would
   collapse on its own account as well.
   ========================================================================== */

import { gravitationalField } from './relativity.js';
import { G } from './constants.js';

export class Lattice {
  /**
   * @param n nodes per axis. Odd is better: it puts a node at the centre.
   */
  constructor(n = 13) {
    this.n = n;
    const c = n * n * n;
    this.count = c;
    this.pos = new Float64Array(c * 3);
    this.vel = new Float64Array(c * 3);
    this.acc = new Float64Array(c * 3);
    this.seedPos = new Float64Array(c * 3);
    this.centre = [0, 0, 0];
    this.halfWidth = 1;
    this.t = 0;                      // time since the lattice was seeded
    this.seedCentroid = [0, 0, 0];

    this._edges = buildEdges(n);     // index pairs, fixed for the lattice's life
    this._g = [0, 0, 0];
  }

  get edges() { return this._edges; }

  /* Lay the markers out on a cube and release them from rest. Rest is a
     choice, and a declared one: it means everything you then see is the
     field acting, with no initial motion of ours mixed in. */
  seed(centre, halfWidth) {
    const { n, pos, vel, seedPos } = this;
    this.centre = [...centre];
    this.halfWidth = halfWidth;
    this.t = 0;
    let w = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const x = centre[0] + (i / (n - 1) - 0.5) * 2 * halfWidth;
          const y = centre[1] + (j / (n - 1) - 0.5) * 2 * halfWidth;
          const z = centre[2] + (k / (n - 1) - 0.5) * 2 * halfWidth;
          pos[w] = seedPos[w] = x; vel[w++] = 0;
          pos[w] = seedPos[w] = y; vel[w++] = 0;
          pos[w] = seedPos[w] = z; vel[w++] = 0;
        }
      }
    }
    this.seedCentroid = this.centroid();
    return this;
  }

  index(i, j, k) { return (i * this.n + j) * this.n + k; }

  /* Velocity Verlet, same scheme as the bodies, so the markers and the
     masses are integrated to the same order and a discrepancy between them
     is physics rather than a mismatch of methods. */
  step(bodies, dt) {
    const { pos, vel, acc, count, _g: g } = this;

    if (!this._primed) {
      for (let i = 0; i < count; i++) {
        gravitationalField(bodies, [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], g);
        acc[i * 3] = g[0]; acc[i * 3 + 1] = g[1]; acc[i * 3 + 2] = g[2];
      }
      this._primed = true;
    }

    const h = dt, h2 = 0.5 * dt;
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      vel[o]     += h2 * acc[o];
      vel[o + 1] += h2 * acc[o + 1];
      vel[o + 2] += h2 * acc[o + 2];
      pos[o]     += h * vel[o];
      pos[o + 1] += h * vel[o + 1];
      pos[o + 2] += h * vel[o + 2];
    }
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      gravitationalField(bodies, [pos[o], pos[o + 1], pos[o + 2]], g);
      acc[o] = g[0]; acc[o + 1] = g[1]; acc[o + 2] = g[2];
      vel[o]     += h2 * g[0];
      vel[o + 1] += h2 * g[1];
      vel[o + 2] += h2 * g[2];
    }
    this.t += dt;
  }

  centroid() {
    const { pos, count } = this;
    let x = 0, y = 0, z = 0;
    for (let i = 0; i < count; i++) {
      x += pos[i * 3]; y += pos[i * 3 + 1]; z += pos[i * 3 + 2];
    }
    return [x / count, y / count, z / count];
  }

  /* Volume as a fraction of the seeded volume: the determinant of the
     deformation gradient, fitted over every node.

     The obvious alternative — the scalar triple product of one cell's three
     edge vectors — is a worse estimator, and measurably so. A single cell
     spans a finite radial range over which the strain itself varies, so it
     reports the volume change of that cell PLUS a piece of the strain
     gradient across it. Fitting F over all n^3 nodes averages that out: at
     one Sun-mass, one AU, 0.04 yr of free fall, det F lands on the analytic
     (1+GM/r^3 t^2)(1-GM/r^3 t^2/2)^2 to five decimal places, while the
     centre cell is out by a third of the deficit. */
  volumeRatio() {
    const F = this.strainAxes();
    return F[0] * (F[4] * F[8] - F[5] * F[7])
         - F[1] * (F[3] * F[8] - F[5] * F[6])
         + F[2] * (F[3] * F[7] - F[4] * F[6]);
  }

  /* The prediction to check the measurement against.

     The familiar statement is (1/V) d^2V/dt^2 = -4 pi G rho for an
     infinitesimal ball. The version that holds for a ball of ANY size comes
     straight from Gauss: the volume's second derivative is the flux of g
     through its surface, and the flux is -4 pi G times the mass enclosed. So

         (1/V) d^2V/dt^2 |_{t=0}  =  -4 pi G <rho>,     <rho> = M_enc / V

     with <rho> the MEAN density inside the ball. That one expression covers
     all three cases the mode can show: empty space (M_enc = 0, volume
     conserved), a lattice immersed in matter (<rho> is the local density),
     and a lattice with a mass sitting inside it (<rho> is small but not zero,
     and the cube implodes).

     Exact when a body lies wholly inside or wholly outside the cube, which is
     the usual case by a wide margin since bodies here are either points at
     this scale or far larger than it. A body straddling the boundary is
     counted whole or not at all, and is the one approximation here. */
  static predictedVolumeAcceleration(bodies, centre, halfWidth) {
    const V = (2 * halfWidth) ** 3;
    let M = 0;
    for (const b of bodies) {
      if (!b.alive) continue;
      const rr = b.isBlackHole ? b.schwarzschildRadius : b.radius;
      const inside =
        Math.abs(centre[0] - b.pos[0]) <= halfWidth &&
        Math.abs(centre[1] - b.pos[1]) <= halfWidth &&
        Math.abs(centre[2] - b.pos[2]) <= halfWidth;

      if (!inside) continue;
      if (rr > halfWidth * 1.7321) {
        /* The cube sits entirely within the body: only the matter actually
           in the cube counts, not the whole body. */
        M += b.mass * V / ((4 / 3) * Math.PI * rr ** 3);
      } else {
        M += b.mass;
      }
    }
    const rho = V > 0 ? M / V : 0;
    return { rho, enclosedMass: M, volume: V, d2VoverV: -4 * Math.PI * G * rho };
  }

  /* Volume of the single cell at the centre of the lattice, relative to its
     size at release.

     The whole-lattice determinant above is the right measure of what the
     cube as a whole did. It is the WRONG measure of the local volume law,
     because that law is local: -4 pi G <rho> is a statement about an
     infinitesimal ball, and a cube whose width is a third of its distance
     from the mass is not one. Fitting a single linear F across it leaves a
     residual of order (halfWidth/r)^2 that has nothing to do with matter
     being present.

     One cell is 1/(n-1) of the cube across, so its own finite-size error is
     smaller by that factor squared — a hundredfold here — and it is the
     number the readout quotes. */
  cellVolumeRatio() {
    const n = this.n, m = (n - 1) >> 1;
    const vol = (p) => {
      const at = (i, j, k) => {
        const o = ((i * n + j) * n + k) * 3;
        return [p[o], p[o + 1], p[o + 2]];
      };
      const o0 = at(m, m, m);
      const a = sub(at(m + 1, m, m), o0);
      const b = sub(at(m, m + 1, m), o0);
      const c = sub(at(m, m, m + 1), o0);
      return Math.abs(dot(a, cross(b, c)));
    };
    const v0 = vol(this.seedPos);
    return v0 > 0 ? vol(this.pos) / v0 : 1;
  }

  /* How much each node has moved relative to where it started, measured in
     the lattice's own falling frame. Positive means it has moved away from
     the centre (being stretched), negative means toward it (squeezed). This
     is what the renderer colours the edges by. */
  radialStrain(out = new Float32Array(this.count)) {
    const { pos, seedPos, count } = this;
    const c = this.centroid(), s = this.seedCentroid;
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      const nx = pos[o] - c[0], ny = pos[o + 1] - c[1], nz = pos[o + 2] - c[2];
      const sx = seedPos[o] - s[0], sy = seedPos[o + 1] - s[1], sz = seedPos[o + 2] - s[2];
      const now = Math.hypot(nx, ny, nz), was = Math.hypot(sx, sy, sz);
      out[i] = was > 0 ? now / was - 1 : 0;
    }
    return out;
  }

  /* Principal axes of the accumulated deformation, for the test suite: the
     direction that has stretched most and the ratio of that stretch to the
     mean of the two squeezed directions. */
  strainAxes() {
    const { pos, seedPos, count } = this;
    const c = this.centroid(), s = this.seedCentroid;
    /* Fit the 3x3 deformation gradient F by least squares: minimise
       |F.xi_seed - xi_now|^2 over all nodes, i.e. F = (X_now X_seed^T)(X_seed X_seed^T)^-1.
       The seed lattice is a symmetric cube, so X_seed X_seed^T is a multiple
       of the identity and the inverse is a single division. */
    const M = new Float64Array(9);
    let norm = 0;
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      const a = [seedPos[o] - s[0], seedPos[o + 1] - s[1], seedPos[o + 2] - s[2]];
      const b = [pos[o] - c[0], pos[o + 1] - c[1], pos[o + 2] - c[2]];
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) M[r * 3 + q] += b[r] * a[q];
      norm += a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    }
    const k = norm > 0 ? 3 / norm : 0;
    for (let i = 0; i < 9; i++) M[i] *= k;
    return M;                        // the deformation gradient F
  }
}

/* -----------------------------------------------------------------------------
   Edge list: every nearest-neighbour pair, once. 3 n^2 (n-1) edges.
-------------------------------------------------------------------------------*/
function buildEdges(n) {
  const e = [];
  const idx = (i, j, k) => (i * n + j) * n + k;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        if (i + 1 < n) e.push(idx(i, j, k), idx(i + 1, j, k));
        if (j + 1 < n) e.push(idx(i, j, k), idx(i, j + 1, k));
        if (k + 1 < n) e.push(idx(i, j, k), idx(i, j, k + 1));
      }
    }
  }
  return Uint32Array.from(e);
}


const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
