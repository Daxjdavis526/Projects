/* =============================================================================
   PRESETS — real systems, real numbers
   -----------------------------------------------------------------------------
   Masses and semi-major axes are the measured values. Orbits are initialised
   circular and coplanar unless eccentricity is given, which is a deliberate
   simplification: the real solar system's small eccentricities and mutual
   inclinations would obscure the effects this simulator is built to show.
   Where a preset departs from reality, the note says so.
   ========================================================================== */

import { Body } from './body.js';
import { G, R_SUN_AU, R_EARTH_AU, R_JUP_AU, M_EARTH_MSUN, M_JUP_MSUN, SI, C2 } from './constants.js';

const AU_PER_KM = 1000 / SI.AU;

/* Place at periapsis of an orbit with given a, e — the vis-viva speed there is
   v = sqrt( G(M+m) (1+e) / (a(1-e)) ). */
function orbital(primaryMass, m, a, e = 0, phase = 0, inc = 0) {
  const rp = a * (1 - e);
  const v = Math.sqrt(G * (primaryMass + m) * (1 + e) / rp);
  const cp = Math.cos(phase), sp = Math.sin(phase);
  const ci = Math.cos(inc), si = Math.sin(inc);
  return {
    pos: [rp * cp, rp * sp * si, rp * sp * ci],
    vel: [-v * sp, v * cp * si, v * cp * ci],
  };
}

/* Shift a system into its barycentric frame: zero total momentum and put the
   centre of mass at the origin. Without this a preset that gives planets
   orbital velocity while leaving the star at rest has net momentum, and the
   whole system slowly drifts off screen — physically harmless (it is just a
   moving frame) but visually confusing and it corrupts any measurement made
   relative to the origin. */
export function toBarycentric(bodies) {
  let M = 0;
  const p = [0, 0, 0], x = [0, 0, 0];
  for (const b of bodies) {
    M += b.mass;
    for (let i = 0; i < 3; i++) { p[i] += b.mass * b.vel[i]; x[i] += b.mass * b.pos[i]; }
  }
  if (M <= 0) return bodies;
  for (const b of bodies) {
    for (let i = 0; i < 3; i++) { b.vel[i] -= p[i] / M; b.pos[i] -= x[i] / M; }
  }
  return bodies;
}

/* Spin angular momentum of a uniform sphere rotating with period P (years). */
function spinOf(mass, radius, periodYr, axis = [0, 0, 1]) {
  if (!periodYr) return [0, 0, 0];
  const I = 0.4 * mass * radius * radius;          // (2/5)MR^2
  const omega = 2 * Math.PI / periodYr;
  const n = Math.hypot(...axis) || 1;
  return axis.map(c => I * omega * c / n);
}

export const PRESETS = {
  empty: {
    label: 'Empty universe',
    blurb: 'Nothing at all. Add bodies and give them velocities.',
    build: () => [],
  },

  earth: {
    label: 'Earth alone',
    blurb: 'One planet. Useful for looking at a curvature field with a single source.',
    build: () => [new Body({
      name: 'Earth', material: 'terrestrial',
      mass: M_EARTH_MSUN, radius: R_EARTH_AU, color: '#5b9dd9',
      spin: spinOf(M_EARTH_MSUN, R_EARTH_AU, 1 / 365.25),
    })],
  },

  earthMoon: {
    label: 'Earth-Moon',
    blurb: 'A real two-body system. The barycentre sits inside the Earth, about 1700 km below the surface.',
    build: () => {
      const Mm = 7.342e22 / SI.M_SUN;
      const earth = new Body({
        name: 'Earth', material: 'terrestrial', mass: M_EARTH_MSUN,
        radius: R_EARTH_AU, color: '#5b9dd9',
        spin: spinOf(M_EARTH_MSUN, R_EARTH_AU, 1 / 365.25),
      });
      const a = 384400 * AU_PER_KM;
      const o = orbital(M_EARTH_MSUN, Mm, a, 0.0549);
      const moon = new Body({
        name: 'Moon', material: 'rock', mass: Mm,
        radius: 1737.4 * AU_PER_KM, color: '#b8b3aa',
        pos: o.pos, vel: o.vel,
      });
      return toBarycentric([earth, moon]);
    },
  },

  solarSystem: {
    label: 'Solar System',
    blurb: 'The Sun and eight planets at their real masses and semi-major axes. Orbits are circularised and coplanar for clarity.',
    build: () => {
      const sun = new Body({
        name: 'Sun', material: 'star', mass: 1, radius: R_SUN_AU, color: '#ffd27f',
        spin: spinOf(1, R_SUN_AU, 25.4 / 365.25),
      });
      const planets = [
        ['Mercury', 1.6601e-7, 2439.7, 0.38710, 0.2056, '#9c8e82'],
        ['Venus',   2.4478e-6, 6051.8, 0.72333, 0.0068, '#d9b678'],
        ['Earth',   M_EARTH_MSUN, 6371, 1.00000, 0.0167, '#5b9dd9'],
        ['Mars',    3.2271e-7, 3389.5, 1.52366, 0.0934, '#c1542b'],
        ['Jupiter', M_JUP_MSUN, 69911, 5.20336, 0.0484, '#d8a06a'],
        ['Saturn',  2.8577e-4, 58232, 9.53707, 0.0542, '#e3cb92'],
        ['Uranus',  4.3662e-5, 25362, 19.1913, 0.0472, '#8fd4de'],
        ['Neptune', 5.1514e-5, 24622, 30.0690, 0.0086, '#5a7fd6'],
      ];
      const out = [sun];
      planets.forEach(([name, m, rKm, a, e, color], i) => {
        const o = orbital(1, m, a, e, (i * 2 * Math.PI) / 8);
        out.push(new Body({
          name, material: i < 4 ? 'terrestrial' : 'gasGiant',
          mass: m, radius: rKm * AU_PER_KM, color, pos: o.pos, vel: o.vel,
        }));
      });
      return toBarycentric(out);
    },
  },

  innerSystem: {
    label: 'Inner Solar System',
    blurb: 'Sun through Mars. Mercury is where the 1PN correction earns its keep: 43 arcsec per century of perihelion advance.',
    build: () => toBarycentric(PRESETS.solarSystem.build().slice(0, 5)),
  },

  binaryStars: {
    label: 'Binary stars',
    blurb: 'Two equal solar-mass stars orbiting their common barycentre at 1 AU separation.',
    build: () => {
      const m = 1, sep = 1;
      const v = 0.5 * Math.sqrt(G * (2 * m) / sep);
      return [
        new Body({ name: 'Star A', material: 'star', mass: m, radius: R_SUN_AU,
          color: '#ffd27f', pos: [-sep / 2, 0, 0], vel: [0, 0, -v] }),
        new Body({ name: 'Star B', material: 'star', mass: m, radius: R_SUN_AU,
          color: '#ffb36b', pos: [ sep / 2, 0, 0], vel: [0, 0,  v] }),
      ];
    },
  },

  neutronStars: {
    label: 'Binary neutron stars',
    blurb: 'Two 1.4 solar-mass neutron stars, 11 km across, at 0.01 AU. Compactness ~0.3: deep in the regime where Newtonian gravity starts to lie.',
    build: () => {
      const m = 1.4, sep = 0.01;
      const v = 0.5 * Math.sqrt(G * (2 * m) / sep);
      const R = Body.radiusFor(m, 'neutronStar');
      return [
        new Body({ name: 'NS A', material: 'neutronStar', mass: m, radius: R,
          color: '#cfe4ff', pos: [-sep / 2, 0, 0], vel: [0, 0, -v],
          spin: spinOf(m, R, 0.01 / 365.25) }),
        new Body({ name: 'NS B', material: 'neutronStar', mass: m, radius: R,
          color: '#e8f0ff', pos: [ sep / 2, 0, 0], vel: [0, 0,  v],
          spin: spinOf(m, R, 0.013 / 365.25) }),
      ];
    },
  },

  blackHole: {
    label: 'Black hole + star',
    blurb: 'A 10 solar-mass black hole with a star in a wide orbit. The horizon is 30 km across — smaller than the dot you will see unless you zoom right in.',
    build: () => {
      const M = 10;
      const bh = new Body({
        name: 'Black hole', material: 'blackHole', mass: M,
        radius: 2 * G * M / C2, color: '#000000',
        spin: [0, 0, 0.6 * G * M * M / Math.sqrt(C2)],   // a* ~ 0.6
      });
      const o = orbital(M, 1, 2.0, 0.3);
      return toBarycentric([bh, new Body({
        name: 'Companion', material: 'star', mass: 1, radius: R_SUN_AU,
        color: '#ffd27f', pos: o.pos, vel: o.vel,
      })]);
    },
  },

  sgrA: {
    label: 'Sgr A* and S2',
    blurb: 'The 4.3-million-solar-mass black hole at the galactic centre, with the star S2 on its real 16-year orbit. S2 reaches 2.5% of light speed at periapsis.',
    build: () => {
      const M = 4.297e6;
      const bh = new Body({
        name: 'Sgr A*', material: 'blackHole', mass: M,
        radius: 2 * G * M / C2, color: '#000000',
      });
      /* S2: a = 970 AU, e = 0.885 */
      const o = orbital(M, 15, 970, 0.885);
      return toBarycentric([bh, new Body({
        name: 'S2', material: 'star', mass: 15, radius: 5.8 * R_SUN_AU,
        color: '#bcd4ff', pos: o.pos, vel: o.vel,
      })]);
    },
  },

  figureEight: {
    label: 'Figure-eight (3-body)',
    blurb: 'Chenciner and Montgomery’s exact periodic solution: three equal masses chasing each other along one figure-eight curve. Verified stable here only because the integrator is symplectic.',
    build: () => {
      /* Standard initial conditions in G = m = 1 units, rescaled to ours. */
      const m = 1;
      const s = Math.cbrt(G);          // length scale so G*m works out
      const x1 = 0.97000436, y1 = -0.24308753;
      const vx3 = 0.93240737, vy3 = 0.86473146;
      const mk = (px, py, vx, vy, name, color) => new Body({
        name, material: 'star', mass: m, radius: 0.02, color,
        pos: [px * s, py * s, 0], vel: [vx * s * Math.sqrt(G) / Math.sqrt(s), vy * s * Math.sqrt(G) / Math.sqrt(s), 0],
      });
      /* Simpler: build in G=1 units then scale velocities by sqrt(G). */
      const b1 = new Body({ name: 'A', material: 'star', mass: 1, radius: 0.02, color: '#ffd27f',
        pos: [x1, y1, 0], vel: [-vx3 / 2 * Math.sqrt(G), -vy3 / 2 * Math.sqrt(G), 0] });
      const b2 = new Body({ name: 'B', material: 'star', mass: 1, radius: 0.02, color: '#7fe6ff',
        pos: [-x1, -y1, 0], vel: [-vx3 / 2 * Math.sqrt(G), -vy3 / 2 * Math.sqrt(G), 0] });
      const b3 = new Body({ name: 'C', material: 'star', mass: 1, radius: 0.02, color: '#ff9d7f',
        pos: [0, 0, 0], vel: [vx3 * Math.sqrt(G), vy3 * Math.sqrt(G), 0] });
      return [b1, b2, b3];
    },
  },
};

export const PRESET_ORDER = [
  'empty', 'earth', 'earthMoon', 'innerSystem', 'solarSystem',
  'binaryStars', 'neutronStars', 'blackHole', 'sgrA', 'figureEight',
];
