// Carrying an arrow around a curved world — Intuition Mode concept lesson.
// Parallel transport on a sphere: the arrow returns rotated by area/R².
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';

const t = String.raw;
const DEG = Math.PI / 180;
const ARCSEC = Math.PI / 648000;
const R_EARTH = 6371;                  // km
const T_SIDEREAL = 23.9344696;         // hours: one turn of the Earth relative to the stars
const PARIS = 48.85;                   // latitude of Foucault’s 1851 pendulum (degrees north)

const grp = (x) => x.toLocaleString('en-US').replace(/,/g, '{,}');   // thousands separator safe inside $…$
const cap = (lat) => 2 * Math.PI * (1 - Math.sin(lat * DEG));        // cap area above latitude λ, unit sphere

const trianglePicture = (dphi, caption) => ({
  type: 'gr-sphere-transport',
  params: { mode: 'triangle', dphi, colat: 90, colatSlider: false, progress: 1, readout: false },
  caption: caption ?? 'The arrow (black) carried around the triangle without turning returns as the red arrow.',
});

export default lesson({
  id: 'gr.S13.i',
  kind: 'concept',
  title: 'Carrying an arrow around a curved world',
  minutes: 5, difficulty: 2, mode: 'intuition', badges: ['est-der', 'est-obs'],
  intro: t`Carry an arrow along a path without ever turning it: **parallel transport**. On a flat sheet, walk any loop and the arrow comes home exactly as it left. On a sphere it comes home **turned**, by the area the loop encloses divided by $R^2$. Walk from the North Pole down to the equator, a quarter of the way around it and back up: three right-angled corners, an eighth of the sphere enclosed — and the arrow returns turned by 90°.

That dependence on the path *is* curvature, and you can detect it without leaving the surface. In spacetime, a gyroscope coasting in free fall is such an arrow. Gravity Probe B carried four around the Earth in 2004–05 and measured their axes turning by 6.6 arcseconds a year — the “geodetic” turning general relativity predicts, from spacetime’s curvature near the Earth.`,
  equation: t`\alpha = \frac{A}{R^2}`,
  symbols: [
    { tex: '\\alpha', text: 'the angle by which the arrow comes back turned, in radians — anticlockwise for a loop travelled anticlockwise (seen from outside)' },
    { tex: 'A', text: 'the area enclosed by the loop, measured on the surface itself, in m²' },
    { tex: 'R', text: t`the sphere’s radius, in m; $1/R^2$ is its curvature, so a flat sheet ($R \to \infty$) gives $\alpha = 0$` },
  ],
  why: 'Curvature in general relativity — the Riemann tensor of step 14 — is defined exactly like this, by how much arrows turn around small loops; orbiting gyroscopes measure it.',
  visual: {
    type: 'gr-sphere-transport',
    title: 'An arrow that is never turned comes back turned',
    lead: t`The arrow starts at the North Pole and is carried down a meridian, along the equator and back up, never turned. Press **Play** to watch.`,
    tasks: [
      'Watch the red arrow: along each straight (great-circle) side it keeps its angle to the path, yet it returns turned 90° from the black one.',
      'Change the angle at the pole: the turn always equals the enclosed area, which here is that angle.',
      'Raise the lower corners toward the pole: a smaller triangle encloses less area and turns the arrow less — tiny loops are almost flat.',
    ],
    params: { mode: 'triangle', dphi: 90, colat: 90, progress: 1 },
  },
  example: {
    prompt: t`Foucault hung his pendulum in Paris, at latitude ${PARIS}°N, in 1851. Earth’s rotation carries the pendulum once around its circle of latitude every sidereal day (${fmt(T_SIDEREAL, 4)} h), and its plane of swing is — to a very good approximation — carried along without being turned. How far is the swing plane turned after one day, and how long does it take to turn once completely relative to the floor?`,
    visual: {
      type: 'gr-sphere-transport',
      params: { mode: 'cap', lat: 49, progress: 1 },
      caption: t`A circle near Paris’s latitude (49°N on the slider), travelled eastward as the Earth turns. Black: the swing direction at the start, pointing north. Red: the same direction carried once around. Unit sphere; Earth’s size does not matter, only the angle.`,
    },
    steps: [
      { label: 'The loop and its area', text: t`The loop is the circle of latitude $\lambda = ${PARIS}^\circ$. It encloses the polar cap above it, of area $A = 2\pi R^2(1 - \sin\lambda)$.` },
      { label: 'The turn', text: t`$\alpha = A/R^2 = 2\pi(1 - \sin ${PARIS}^\circ) = 2\pi(1 - ${fmt(Math.sin(PARIS * DEG), 4)}) = ${fmt(cap(PARIS), 4)}$ rad $= ${fmt(cap(PARIS) / DEG, 3)}^\circ$.` },
      { label: 'Relative to the floor', text: t`The floor’s own “north” comes back to itself after a day, but the swing plane comes back ${fmt(cap(PARIS) / DEG, 3)}° short of a full turn: relative to the floor it has turned (clockwise, seen from above) by $360^\circ - ${fmt(cap(PARIS) / DEG, 3)}^\circ = ${fmt(360 * Math.sin(PARIS * DEG), 4)}^\circ = 360^\circ\sin\lambda$.` },
      { label: 'A full turn, and a sense check', text: t`One full turn relative to the floor takes $${fmt(T_SIDEREAL, 4)}\ \text{h} / \sin\lambda = ${fmt(T_SIDEREAL / Math.sin(PARIS * DEG), 3)}$ h — what Foucault’s audience watched. At the North Pole ($\sin\lambda = 1$) it would take one day; at the equator the plane would not turn at all.` },
    ],
    answer: t`Turned by ${fmt(cap(PARIS) / DEG, 3)}° from where it started — ${fmt(360 * Math.sin(PARIS * DEG), 4)}° clockwise relative to the floor — so a full turn takes about ${fmt(T_SIDEREAL / Math.sin(PARIS * DEG), 3)} hours.`,
  },
  practice: [
    num({
      id: 'pole-triangle', difficulty: 1,
      gen(r) {
        const d = r.pick([30, 45, 60, 120, 150]);
        return {
          prompt: t`A triangle on a sphere has one corner at the North Pole and two on the equator, ${d}° of longitude apart. An arrow is carried once around it without being turned. By how many degrees does it come back turned?`,
          answer: d, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: 'On a curved surface a never-turned arrow does not come back unchanged.' }, { value: 180 + d, feedback: 'That is the sum of the triangle’s angles. The turn is the excess over 180°.' }],
          hints: ['The turn equals the enclosed area divided by R².', t`The triangle covers the fraction ${d}/360 of the northern hemisphere, whose area is $2\pi R^2$.`],
          teach: 'An arrow carried around a loop on a sphere returns turned by the enclosed area divided by R².',
          explain: t`Area $= \dfrac{${d}}{360}\times2\pi R^2$, so $\alpha = A/R^2 = ${fmt(d * DEG, 4)}$ rad $= ${d}^\circ$ — the angle at the pole. Its corners are $90^\circ + 90^\circ + ${d}^\circ$: the excess over 180° is the same ${d}°.`,
          visual: trianglePicture(d),
        };
      },
    }),
    num({
      id: 'angle-excess', difficulty: 2,
      gen(r) {
        const sum = r.pick([200, 230, 250, 270]);
        return {
          prompt: t`A triangle drawn on a sphere, with straight (great-circle) sides, has angles adding up to ${sum}°. By how many degrees does an arrow carried once around it come back turned?`,
          answer: sum - 180, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: sum, feedback: 'The turn is the excess over a flat triangle’s 180°, not the whole sum.' }],
          hints: ['On a flat sheet the angles add up to 180° and the arrow comes back unturned.', 'The turn equals the angle excess: the sum minus 180°.'],
          teach: 'On a sphere a triangle’s angles exceed 180° by its area/R² — exactly the turn of a carried arrow.',
          explain: t`Excess $= ${sum}^\circ - 180^\circ = ${sum - 180}^\circ$, which is the enclosed area divided by $R^2$ — and the turn.`,
          visual: trianglePicture(sum - 180, 'A triangle with this angle excess: two right angles on the equator and the remaining angle at the pole.'),
        };
      },
    }),
    num({
      id: 'earth-triangle', difficulty: 3,
      gen(r) {
        const A = r.pick([1000, 50000, 1000000]);
        const a = A / R_EARTH ** 2;
        return {
          prompt: t`A surveyor carries an arrow, never turning it, around a triangle enclosing ${A.toLocaleString('en-US')} km² of a round Earth of radius ${R_EARTH.toLocaleString('en-US')} km. By how many arcseconds does it come back turned? (1 radian = 206 265″.)`,
          answer: a / ARCSEC, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: A / R_EARTH / ARCSEC, feedback: 'Divide by R squared: α = A/R².' }],
          hints: [t`$\alpha = A/R^2$ in radians, with $A$ in km² and $R$ in km.`, t`$\alpha = ${A}/${R_EARTH}^2 = ${fmt(a, 3)}$ rad; multiply by 206 265.`],
          teach: 'Even on the Earth the turn is measurable for a large enough loop: α = A/R².',
          explain: t`$\alpha = ${grp(A)}/${grp(R_EARTH)}^2 = ${fmt(a, 3)}$ rad $= ${fmt(a / ARCSEC, 3)}''$${a / DEG > 0.5 ? ` (${fmt(a / DEG, 3)}°)` : ''}. Small loops turn arrows very little: curvature only shows over areas comparable with $R^2$.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 30, colat: 25, colatSlider: false, progress: 1, readout: false }, caption: 'Not to scale: a small triangle on a large sphere turns the arrow only a little — the turn is the area divided by R².' },
        };
      },
    }),
    num({
      id: 'latitude-loop', difficulty: 3,
      gen(r) {
        const lat = r.pick([40, 50, 60, 75]);
        return {
          prompt: t`An arrow is carried once eastward around the circle of latitude ${lat}°N, never turned. The circle encloses the polar cap above it, of area $2\pi R^2(1 - \sin\lambda)$. By how many degrees does the arrow come back turned?`,
          answer: cap(lat) / DEG, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: 360 * Math.sin(lat * DEG), feedback: 'That is how far it turns relative to the local north (the Foucault rate). Compared with the arrow it started as, the turn is the cap area: 360°(1 − sin λ).' }, { value: 0, feedback: 'A circle of latitude away from the equator is not a straight path on the sphere: the arrow does not come back unchanged.' }],
          hints: [t`$\alpha = A/R^2 = 2\pi(1 - \sin\lambda)$ radians.`, t`In degrees: $360^\circ(1 - \sin ${lat}^\circ)$.`],
          teach: 'Around a circle of latitude λ a carried arrow returns turned by the cap area, 360°(1 − sin λ).',
          explain: t`$360^\circ(1 - \sin ${lat}^\circ) = 360^\circ\times${fmt(1 - Math.sin(lat * DEG), 4)} = ${fmt(cap(lat) / DEG, 3)}^\circ$.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat, progress: 1, readout: false }, caption: 'Black: the arrow at the start, pointing north. Red: the same arrow after one loop.' },
        };
      },
    }),
    mcq({
      id: 'flat', difficulty: 1,
      prompt: 'On a perfectly flat sheet, an arrow carried once around any closed loop without being turned comes back:',
      choices: ['Exactly as it started', 'Turned by the area of the loop', 'Turned by 360°', 'Pointing the opposite way'],
      answer: 0,
      why: { 1: 'That is the rule on a sphere, where the curvature 1/R² is not zero. On a flat sheet the curvature is zero.', 2: 'A 360° turn is the same as no turn — but the point is that nothing happens: on a flat sheet, “never turned” means “always parallel”.', 3: 'Nothing reverses it: on a flat sheet a never-turned arrow stays parallel to itself.' },
      hints: ['Draw it: slide an arrow around a square on paper without rotating it.'],
      teach: 'On a flat surface parallel transport around any loop changes nothing; the turning is a sign of curvature.',
      explain: 'On a flat sheet, never turning an arrow keeps it parallel to its starting direction everywhere, so it returns unchanged. Curvature zero, turn zero: α = A × 0.',
      visual: { type: 'gr-coordinates', params: { mode: 'field', alpha: 30, readout: false }, caption: 'On a flat sheet a never-turned arrow is the same arrow wherever it is carried — like every arrow in this field. (The grid arrows turn; the arrow does not.)' },
    }),
    mcq({
      id: 'cone', difficulty: 3,
      prompt: 'Cut a wedge of angle 60° out of a flat paper disc and tape the edges together to make a cone. Now carry an arrow once around a loop enclosing the tip, never turning it. What happens?',
      choices: [
        'It comes back turned by 60°: all of the cone’s curvature is concentrated at its tip',
        'It comes back unchanged, because the paper is flat everywhere',
        'It comes back turned by an amount that depends on the loop’s size',
        'It cannot be carried around: the tip blocks the way',
      ],
      answer: 0,
      why: { 1: 'Away from the tip the paper is flat, so small loops that avoid the tip change nothing — but loops around it do.', 2: 'Any loop around the tip gives the same 60°, however big: the curvature is all at the tip.', 3: 'The loop goes around the tip, not through it.' },
      hints: ['Unroll the cone flat: the loop around the tip becomes a path from one cut edge to the other.', 'The two cut edges meet at the 60° that is missing.'],
      teach: 'A loop around a cone’s tip turns arrows by the missing wedge angle: all the curvature is concentrated at the tip.',
      explain: 'Unrolled, the cone is a flat disc missing a 60° wedge. A never-turned arrow stays parallel on the flat paper, but crossing the taped seam joins two directions 60° apart, so it returns turned by 60°. Hypothetical “cosmic strings” would give space just this kind of conical shape (step 34).',
      solution: 'The same rule as the sphere: the turn is the total curvature enclosed. On the cone that curvature is zero everywhere except the tip, where it adds up to the missing angle.',
    }),
    mcq({
      id: 'meaning', difficulty: 2,
      prompt: 'Two-dimensional creatures who cannot see outside their surface find that arrows carried around loops come back turned. What can they conclude?',
      choices: [
        'Their surface is curved — they can measure its curvature without ever leaving it',
        'Nothing, without seeing their surface from outside',
        'Their arrows must be faulty',
        'Their surface must be the surface of a sphere',
      ],
      answer: 0,
      why: { 1: 'Nothing outside is needed: the turn around loops, like triangle angles adding to more than 180°, is measured entirely inside the surface.', 2: 'The arrows were never turned; the surface’s geometry turned them.', 3: 'Many curved surfaces turn arrows; the amount around each loop tells them which.' },
      hints: ['Does anything in the measurement require stepping outside the surface?'],
      teach: 'Path-dependent parallel transport reveals intrinsic curvature, measured from inside — the only kind spacetime can have.',
      explain: 'The turning is intrinsic: it depends only on distances and angles measured within the surface. That is the kind of curvature general relativity assigns to spacetime, which has no “outside” to be viewed from.',
      visual: trianglePicture(90, 'Everything here is measured on the surface: the path, its corners, and the turn of the arrow.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-foucault', difficulty: 2, transfer: true,
      gen(r) {
        const [city, lat] = r.pick([['London', 51.5], ['Rome', 41.9], ['Helsinki', 60.2], ['Seattle', 47.6]]);
        const hours = T_SIDEREAL / Math.sin(lat * DEG);
        return {
          prompt: t`A Foucault pendulum in ${city} (latitude ${lat}°N) turns relative to the floor by $360^\circ\sin\lambda$ every sidereal day of ${fmt(T_SIDEREAL, 4)} hours. How many hours does it take to turn once completely?`,
          answer: hours, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: T_SIDEREAL * Math.sin(lat * DEG), feedback: 'A slower turn takes longer: divide the day by sin λ.' }, { value: T_SIDEREAL / Math.cos(lat * DEG), feedback: 'The rate uses sin λ: it is greatest at the poles, zero at the equator.' }],
          hints: [t`Turn rate $= 360^\circ\sin\lambda$ per ${fmt(T_SIDEREAL, 4)} h.`, t`Full turn: $${fmt(T_SIDEREAL, 4)}\ \text{h} / \sin ${lat}^\circ$.`],
          teach: 'A Foucault pendulum turns once in a sidereal day divided by sin λ: the floor’s north drifts relative to the parallel-carried swing plane.',
          explain: t`$${fmt(T_SIDEREAL, 4)}/\sin ${lat}^\circ = ${fmt(T_SIDEREAL, 4)}/${fmt(Math.sin(lat * DEG), 4)} = ${fmt(hours, 3)}$ h. Each day the swing plane comes back $360^\circ(1 - \sin\lambda) = ${fmt(cap(lat) / DEG, 3)}^\circ$ short of a full turn — the enclosed cap area.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: Math.round(lat), progress: 1, readout: false }, caption: `The circle of latitude near ${city}, carried once around by the Earth’s rotation.` },
        };
      },
    }),
    mcq({
      id: 'cp-gpb', difficulty: 2, transfer: true,
      prompt: 'Gravity Probe B’s gyroscopes coasted around the Earth in free fall, spinning almost perfectly free of torques. Their axes turned by 6.6 arcseconds per year in the plane of the orbit (measured 6601.8 ± 18.3 milliarcseconds per year; general relativity predicts 6606.1). What does this show?',
      choices: [
        'Spacetime around the Earth is curved: a never-turned arrow carried around the orbit does not return to its starting direction',
        'The gyroscopes’ bearings had a small amount of friction',
        'Earth’s magnetic field twisted the gyroscopes',
        'The guide star the gyroscopes were compared with moved across the sky',
      ],
      answer: 0,
      why: { 1: 'The rotors floated in electrostatic suspension; known disturbances were modelled, and what remained matched general relativity’s prediction to about 0.3%.', 2: 'The effect is in the plane of the orbit and has exactly the size relativity predicts; it is not a magnetic torque.', 3: 'The guide star’s own motion was measured independently by radio astronomy and corrected for.' },
      hints: ['A torque-free gyroscope is the spacetime version of a never-turned arrow.'],
      teach: 'A gyroscope in free fall is parallel-transported through spacetime; its slow turning around an orbit measures spacetime curvature.',
      explain: 'A torque-free gyroscope’s axis is carried along its orbit without turning — parallel transport in spacetime. Because spacetime near the Earth is curved, it comes back turned: 6.6″ per year in the orbital plane (the geodetic effect), measured to about 0.3%.',
    }),
    num({
      id: 'cp-angles', difficulty: 2,
      gen(r) {
        const c = r.pick([20, 50, 80, 110]);
        return {
          prompt: t`A triangle on a sphere, with great-circle sides, has angles of 90°, 90° and ${c}°. By how many degrees does an arrow carried once around it come back turned?`,
          answer: c, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 180 + c, feedback: 'The turn is the excess over 180°, not the whole sum.' }],
          hints: ['Turn = angle sum − 180°.'],
          teach: 'The turn around a spherical triangle is its angle excess, which is its area divided by R².',
          explain: t`$90^\circ + 90^\circ + ${c}^\circ - 180^\circ = ${c}^\circ$.`,
          visual: trianglePicture(c, 'A triangle with two right angles at the equator and the third angle at the pole.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'Everitt et al. (2011), Gravity Probe B: final results, Phys. Rev. Lett. 106, 221101', url: 'https://arxiv.org/abs/1105.3456' },
    { label: 'Carroll, Lecture Notes on GR, §3.3 (parallel transport) and §3.6', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, ch. 14 (gyroscopes) and ch. 21', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
  ],
});
