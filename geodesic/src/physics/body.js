/* =============================================================================
   BODY
   -----------------------------------------------------------------------------
   A gravitating object. Mass, radius and density are mutually constrained; the
   UI edits any two and this derives the third. Everything relativistic about a
   body (horizon radius, compactness, surface time dilation) follows from mass
   and radius alone, which is why the simulator can let a user slide a star
   toward a black hole and watch the regime change rather than switching models.
   ========================================================================== */

import { G, C2, SI, MATERIALS, BUCHDAHL_LIMIT } from './constants.js';

let nextId = 1;

export class Body {
  constructor(opts = {}) {
    this.id = opts.id ?? nextId++;
    this.name = opts.name ?? `Body ${this.id}`;
    this.material = opts.material ?? 'rock';
    this.color = opts.color ?? null;

    this.mass = opts.mass ?? 1e-6;               // Msun
    this.pos = [...(opts.pos ?? [0, 0, 0])];     // AU
    this.vel = [...(opts.vel ?? [0, 0, 0])];     // AU/yr
    this.acc = [0, 0, 0];

    /* Spin angular momentum, Msun AU^2 / yr. Only matters for frame dragging
       and the Kerr parameter; a non-spinning body is perfectly legal. */
    this.spin = [...(opts.spin ?? [0, 0, 0])];

    /* Radius: explicit, or implied by the material's density. */
    if (opts.radius != null) this.radius = opts.radius;
    else this.radius = Body.radiusFor(this.mass, this.material);

    this.fixed = !!opts.fixed;      // pinned in place (useful for a central mass)
    this.alive = true;
  }

  /* --- radius <-> density ------------------------------------------------- */
  static radiusFor(mass, material) {
    const m = MATERIALS[material];
    if (!m || m.rhoInternal == null) {
      /* Black hole: the radius IS the horizon. */
      return 2 * G * mass / C2;
    }
    return Math.cbrt(mass / ((4 / 3) * Math.PI * m.rhoInternal));
  }

  /* Mean density, Msun/AU^3 */
  get density() {
    const v = (4 / 3) * Math.PI * this.radius ** 3;
    return v > 0 ? this.mass / v : Infinity;
  }
  set density(rho) {
    this.radius = Math.cbrt(this.mass / ((4 / 3) * Math.PI * rho));
  }
  /* Mean density in kg/m^3, for display */
  get densitySI() {
    return this.density * SI.M_SUN / (SI.AU ** 3);
  }

  /* --- relativistic characterisation -------------------------------------- */

  /* Schwarzschild radius, AU. Defined for any mass; for ordinary bodies it is
     simply far inside them (for the Sun, 3 km inside a 700 000 km star). */
  get schwarzschildRadius() { return 2 * G * this.mass / C2; }

  /* Compactness C = r_s / R. The single number that says which regime a body
     is in: Sun 4e-6, white dwarf 1e-4, neutron star ~0.3, horizon at 1. */
  get compactness() {
    return this.radius > 0 ? this.schwarzschildRadius / this.radius : Infinity;
  }

  get isBlackHole() { return this.compactness >= 1; }

  /* Above 8/9 no static body can support itself (Buchdahl). Between the
     Buchdahl bound and 1 a body is not a black hole yet but cannot exist
     statically either — the UI flags this rather than pretending. */
  get violatesBuchdahl() { return this.compactness > BUCHDAHL_LIMIT; }

  /* Gravitational time dilation at the surface, dtau/dt. Exact Schwarzschild
     exterior value; -> 0 at the horizon. */
  get surfaceTimeDilation() {
    const x = 1 - this.compactness;
    return x > 0 ? Math.sqrt(x) : 0;
  }

  /* Newtonian surface gravity, AU/yr^2 */
  get surfaceGravity() {
    return this.radius > 0 ? G * this.mass / (this.radius ** 2) : Infinity;
  }

  /* Escape velocity, AU/yr. Equals c exactly at the horizon, which is a nice
     way to see why the horizon is where it is. */
  get escapeVelocity() {
    return this.radius > 0 ? Math.sqrt(2 * G * this.mass / this.radius) : Infinity;
  }

  /* Dimensionless Kerr spin a* = cJ/(GM^2). |a*| > 1 would be a naked
     singularity; the cosmic censorship conjecture says nature forbids it, and
     so does this simulator. */
  get spinParameter() {
    const J = Math.hypot(...this.spin);
    if (this.mass <= 0) return 0;
    return J * Math.sqrt(C2) / (G * this.mass ** 2);
  }

  /* Innermost stable circular orbit and photon sphere, Schwarzschild values. */
  get iscoRadius() { return 3 * this.schwarzschildRadius; }
  get photonSphereRadius() { return 1.5 * this.schwarzschildRadius; }

  clone(overrides = {}) {
    return new Body({
      name: this.name + ' copy', material: this.material, color: this.color,
      mass: this.mass, radius: this.radius, pos: this.pos, vel: this.vel,
      spin: this.spin, fixed: this.fixed, ...overrides,
    });
  }

  snapshot() {
    return {
      id: this.id, name: this.name, material: this.material, color: this.color,
      mass: this.mass, radius: this.radius,
      pos: [...this.pos], vel: [...this.vel], acc: [...this.acc],
      spin: [...this.spin], fixed: this.fixed,
      density: this.density, densitySI: this.densitySI,
      rs: this.schwarzschildRadius, compactness: this.compactness,
      isBlackHole: this.isBlackHole, violatesBuchdahl: this.violatesBuchdahl,
      timeDilation: this.surfaceTimeDilation,
      vEsc: this.escapeVelocity, gSurf: this.surfaceGravity,
      spinParam: this.spinParameter,
    };
  }
}
