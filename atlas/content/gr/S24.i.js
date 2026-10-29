// Light bending and gravitational lensing — Intuition Mode. Light follows
// null geodesics; passing a mass at impact parameter b it bends by 4GM/(c²b),
// 1.75″ at the Sun's limb — twice the equivalence-principle value. Lenses
// make multiple images, Einstein rings, microlensing brightenings and black-
// hole shadows (2·3√3 GM/c²D: 53 μas for Sgr A*, 40 μas for M87*).
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, M_SUN, R_SUN, M_EARTH, R_EARTH, AU, PC, sci, round } from './_fasttrack.js';
import { bend, bendSeenFrom, einsteinRadius, magnifications, focalDistance, shadowDiameter, massLength, RAD_TO_ARCSEC } from '../../src/viz/model/gr-lensing.js';

const t = String.raw;

const MAS = RAD_TO_ARCSEC * 1e3, UAS = RAD_TO_ARCSEC * 1e6;
const LIMB = bend(M_SUN, R_SUN) * RAD_TO_ARCSEC;            // arcsec
const M1 = massLength(M_SUN);
const SGR = { m: 4.30e6, D: 8275 * PC }, M87 = { m: 6.5e9, D: 16.8e6 * PC };

// the shadow, the photon sphere and the horizon, to scale (units of GM/c²)
const shadowPicture = {
  type: 'graph',
  params: {
    x: [-7.5, 7.5], y: [-6.2, 6.2], equal: true, xlabel: 'GM/c²', ylabel: ' ',
    curves: [
      { param: [`${round(Math.sqrt(27), 5)}cos(t)`, `${round(Math.sqrt(27), 5)}sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.6 },
      { param: ['3cos(t)', '3sin(t)'], t: [0, 6.2832], color: 'accent', dash: true },
      { param: ['2cos(t)', '2sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2.2 },
    ],
    points: [
      { x: 3.7, y: 3.7, r: 0.5, color: 'gold', label: 'shadow edge: 3√3 = 5.2' },
      { x: 0.2, y: 3.15, r: 0.5, color: 'accent', label: 'photon sphere: 3' },
      { x: 0.2, y: 1.2, r: 0.5, color: 'ink2', label: 'horizon: 2' },
    ],
  },
  caption: 'Radii in units of GM/c², for a non-spinning black hole. The shadow’s edge is set by light that skims the photon sphere; seen from far away it looks 3√3 GM/c² in radius — 2.6 times the horizon.',
};

// a microlensing light curve: a lens passes the star with closest offset u0
const lightCurve = (u0) => ({
  type: 'graph',
  params: {
    x: [-40, 40], y: [0.9, Math.ceil(magnifications(u0).total + 1)], xlabel: 'days from closest approach', ylabel: 'brightening',
    constants: { u: u0, tE: 20 },
    curves: [{ fn: '(u^2 + (x/tE)^2 + 2)/(sqrt(u^2 + (x/tE)^2)*sqrt(u^2 + (x/tE)^2 + 4))', color: 'gold' }],
    hlines: [{ y: 1, label: 'unlensed' }],
  },
  caption: 'A microlensing event: a star in our Galaxy drifts in front of a more distant one (Einstein-radius crossing time 20 days). The two images are far too close to separate, so all you see is the combined brightening.',
});

// starlight bent by a round body of radius 1, angles hugely exaggerated. Each ray comes in level at
// height b and leaves bent by a: y = b − a(x + √(x² + b²))/2. With an observer, the dashed line is
// the direction the star is seen in.
const bendPic = ({ rays, body = 'Sun', observer = false, caption }) => {
  const X0 = -7, X1 = 9;
  const path = ({ b, a }) => `${round(b, 4)} - ${round(a, 4)}*(x + sqrt(x^2 + ${round(b * b, 5)}))/2`;
  const y = ({ b, a }, x) => b - (a * (x + Math.hypot(x, b))) / 2;
  const curves = [], points = [];
  for (const r of rays) {
    curves.push({ fn: String(round(r.b, 4)), domain: [-1.5, X1], color: 'ink4', dash: true, width: 1 });
    curves.push({ fn: path(r), domain: [X0, X1], color: r.color || 'gold', label: r.label, labelAt: X0 + 0.2 });
  }
  let low = -1.4;
  if (observer) {
    const r = rays[0], yE = y(r, X1), s = (-r.a * (1 + X1 / Math.hypot(X1, r.b))) / 2;
    curves.push({ fn: `${round(yE, 5)} + ${round(s, 5)}*(x - ${X1})`, domain: [X0, X1], color: 'accent', dash: true, width: 1.4 });
    points.push({ x: X1, y: round(yE, 4), color: 'teal', label: 'you' }, { x: X0 + 0.1, y: round(yE + s * (X0 + 0.1 - X1) + 0.15, 4), r: 0.5, color: 'accent', label: 'where the star is seen' });
    low = Math.min(low, yE - 0.5);
  }
  points.push({ x: -0.55, y: -1.55, r: 0.5, color: 'gold', label: body });
  const top = Math.max(...rays.map((r) => r.b)) + (observer ? 1.7 : 0.8);
  return {
    type: 'graph',
    params: {
      x: [X0 - 0.3, X1 + 1.4], y: [round(low - 0.5, 3), round(top, 3)], equal: true, grid: false, axes: false,
      shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'gold', alpha: 0.8 }],
      curves, points,
    },
    caption,
  };
};
const GRAZE = { b: 1.08, a: 0.16 };

// Gaia's geometry: Earth at (−1, 0), the Sun at the origin, starlight arriving at angle Φ from the Sun's direction
const elongationPic = (ph) => {
  const p = (ph * Math.PI) / 180, ux = Math.cos(p), uy = Math.sin(p), L = 2.1;
  const fx = -1 + ux * Math.cos(p), fy = uy * Math.cos(p);           // the closest approach to the Sun
  const sx = -1 + L * ux, sy = L * uy;                                // far along the ray, toward the star
  const xs = [-1, 0, fx, sx], ys = [0, fy, sy];
  return {
    type: 'graph',
    params: {
      x: [round(Math.min(...xs) - 0.45, 3), round(Math.max(...xs) + 0.75, 3)], y: [round(Math.min(...ys, 0) - 0.35, 3), round(Math.max(...ys) + 0.3, 3)],
      equal: true, grid: false, axes: false,
      curves: [
        { param: [`-1 + t*${round(ux, 5)}`, `t*${round(uy, 5)}`], t: [Math.min(0, round(Math.cos(p), 5)), 0], color: 'ink3', dash: true, width: 1.2 },
        { param: ['t', '0'], t: [-1, 0], color: 'ink4', dash: true, width: 1 },
        { param: [`${round(fx, 5)}*t`, `${round(fy, 5)}*t`], t: [0, 1], color: 'bad', width: 1.6 },
      ],
      arrows: [{ from: [round(sx, 4), round(sy, 4)], to: [round(-1 + 0.06 * ux, 4), round(0.06 * uy, 4)], color: 'gold' }],
      points: [
        { x: 0, y: 0, color: 'gold', r: 7, label: 'Sun' }, { x: -1, y: 0, color: 'accent', r: 5 }, { x: -1.42, y: -0.17, r: 0.5, color: 'accent', label: 'Earth' },
        { x: round(fx, 4), y: round(fy, 4), color: 'bad', r: 3.5 }, { x: round(fx / 2 + 0.04, 4), y: round(fy / 2, 4), r: 0.5, color: 'bad', label: 'b' },
        { x: round(sx, 4), y: round(sy, 4), r: 0.5, color: 'gold', label: 'from the star' },
        { x: round(-1 + 0.5 * Math.cos(p / 2) - 0.08, 4), y: round(0.5 * Math.sin(p / 2) - 0.07, 4), r: 0.5, color: 'ink2', label: `Φ = ${ph}°` },
      ],
    },
    caption: 'Seen from above the plane: starlight (gold) reaches Earth at angle Φ from the direction of the Sun. Red: the ray’s closest approach to the Sun, b = (1 AU) sin Φ — on the far side of Earth when Φ is more than 90°.',
  };
};

// the lens seen side-on: light from the source reaches you from both sides of the lens (2D cut of a ring)
const lensSide = (dl, m) => {
  const h = 0.2 * dl, top = (8 * h) / dl;
  const ray = (sg) => [
    { fn: `${round(sg * h / dl, 5)}*x`, domain: [0, dl], color: 'gold' },
    { fn: `${round(sg * h, 4)}*(8 - x)/${8 - dl}`, domain: [dl, 8], color: 'gold' },
    { fn: `${round(sg * h / dl, 5)}*x`, domain: [dl, 8], color: 'accent', dash: true, width: 1.2 },
  ];
  return {
    type: 'graph',
    params: {
      x: [-0.9, 9.0], y: [-2.05, 2.05], grid: false, axes: false,
      curves: [{ fn: '0', domain: [0, 8], color: 'ink4', dash: true, width: 1 }, ...ray(1), ...ray(-1)],
      points: [
        { x: 0, y: 0, color: 'teal' }, { x: -0.85, y: -0.3, r: 0.5, color: 'teal', label: 'you' },
        { x: dl, y: 0, color: 'ink', r: 6 }, { x: dl - 0.35, y: round(-h - 0.45, 3), r: 0.5, color: 'ink2', label: `lens, ${m} M☉` },
        { x: 8, y: 0, color: 'gold', label: 'source' },
        { x: 8, y: round(top, 4), color: 'accent', r: 3, label: 'image' }, { x: 8, y: round(-top, 4), color: 'accent', r: 3 },
      ],
    },
    caption: 'Side view, angles hugely exaggerated. Light from the source bends at the lens and reaches you from both sides — in three dimensions, from a whole ring. θE is the angle between the lens and that ring as you see it.',
  };
};

// the Sun as a lens: rays at ±b meet on the axis behind it (not to scale)
const focusPic = (k) => {
  const b = 1.1 * k, F = 7.5, a = (2 * b) / (F + Math.hypot(F, b));
  const ray = (sg) => ({ fn: `${sg * round(b, 4)} - ${sg * round(a, 5)}*(x + sqrt(x^2 + ${round(b * b, 5)}))/2`, domain: [-6.5, F + 1.6], color: 'gold' });
  return {
    type: 'graph',
    params: {
      x: [-6.8, F + 2.2], y: [round(-b - 0.9, 3), round(b + 0.9, 3)], equal: true, grid: false, axes: false,
      shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'gold', alpha: 0.8 }],
      curves: [{ fn: '0', domain: [-6.5, F + 2], color: 'ink4', dash: true, width: 1 }, ray(1), ray(-1)],
      arrows: [{ from: [0, round(-b - 0.45, 3)], to: [F, round(-b - 0.45, 3)], color: 'ink2', label: 'd = ?' }],
      points: [{ x: F, y: 0, color: 'accent', r: 5 }, { x: F + 0.05, y: -0.75, r: 0.5, color: 'accent', label: 'focus' }, { x: -0.5, y: round(b + 0.25, 3), r: 0.5, color: 'gold', label: `b = ${k} R☉` }],
    },
    caption: 'The Sun as a lens, hugely out of scale: light passing at distance b on every side is bent inward and meets on the axis behind the Sun.',
  };
};

// what a black-hole image shows, with the real sizes overlaid (units of GM/c², non-spinning hole)
const imagePicture = {
  type: 'graph',
  params: {
    x: [-9.5, 9.5], y: [-7.4, 7.4], equal: true, grid: false, axes: false,
    curves: [
      { param: ['5.75cos(t)', '5.75sin(t)'], t: [0, 6.2832], color: 'gold', width: 13 },
      { param: ['3cos(t)', '3sin(t)'], t: [0, 6.2832], color: 'accent', dash: true, width: 1.6 },
      { param: ['2cos(t)', '2sin(t)'], t: [0, 6.2832], color: 'bad', width: 1.8 },
      { param: ['-2.819 - 4.6t', '-1.026 - 2.3t'], t: [0, 1], color: 'accent', width: 1 },
    ],
    shade: [{ fn: 'sqrt(max(27 - x^2, 0))', lower: '-sqrt(max(27 - x^2, 0))', from: -5.197, to: 5.197, color: '#000000', alpha: 0.9 }],
    points: [
      { x: -1.15, y: -0.25, r: 0.5, color: 'bad', label: 'horizon' },
      { x: -9.6, y: -3.75, r: 0.5, color: 'accent', label: 'photon sphere' },
      { x: 4.3, y: 5.6, r: 0.5, color: 'gold', label: 'dark region’s edge' },
    ],
  },
  caption: 'Sketch of a black-hole image with sizes to scale for a non-spinning hole: the dark region (radius 3√3 ≈ 5.2 GM/c²), the photon sphere (3) and the horizon (2). The glow of the ring is not to scale.',
};

export default lesson({
  id: 'gr.S24.i',
  title: 'Light bends: eclipses, lenses and Einstein rings',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`Light follows geodesics too, and passing a mass its path bends — by the angle above, where $b$ is how close the ray comes. For a ray grazing the Sun that is $${sci(LIMB)}''$, **twice** what the equivalence principle alone gives, because for light curved space matters as much as curved time. The eclipse expeditions of 1919, organised by Dyson and Eddington, photographed stars beside the darkened Sun and favoured the full value; radio telescopes have since confirmed it to about 1 part in 10 000. Bending makes **gravitational lenses**: a mass between you and a distant source makes two or more images, an **Einstein ring** when the alignment is perfect, and around a black hole a dark shadow ringed with light. A ring's angular radius is

$$\theta_E = \sqrt{\frac{4GM}{c^2}\,\frac{D_{LS}}{D_L\,D_S}}$$`,
  equation: t`\alpha = \frac{4GM}{c^2\,b}`,
  symbols: [
    { tex: '\\alpha', text: 'the bending angle, in radians (1 rad = 206 265″)' },
    { tex: 'G,\\ M', text: 'the gravitational constant and the lensing mass; $GM/c^2 = 1477$ m for the Sun' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: 'b', text: 'the impact parameter: how close the ray passes to the mass’s centre, in m' },
    { tex: '\\theta_E', text: 'the Einstein radius: the angular radius of the ring seen when source, lens and you line up' },
    { tex: 'D_L,\\ D_S,\\ D_{LS}', text: 'distances from you to the lens, from you to the source, and from the lens to the source' },
  ],
  why: 'Lensing is a working tool: it weighs galaxy clusters and maps dark matter, finds planets around distant stars, and — through black-hole shadows — lets the Event Horizon Telescope test spacetime near a horizon.',
  visual: {
    type: 'gr-lensing',
    title: 'Make an Einstein ring',
    lead: t`Your sky is on the right, ray-traced through a point-mass lens at its centre. Drag the dashed circle — where the galaxy really is — toward the lens, or use the slider.`,
    tasks: ['Start at an offset of 2: one bright image a little outside the galaxy’s true position, and a faint second image on the far side, close to the lens.', 'Move toward 0: both images stretch into arcs and brighten.', 'At exactly 0 they merge into an Einstein ring. Faint background stars near the ring are stretched into arcs too.'],
    params: { beta: 0.35, size: 0.16, system: 'star' },
  },
  example: {
    prompt: t`How much does the Sun bend the light of a star whose light just grazes its edge — and what did the 1919 eclipse expeditions see?`,
    steps: [
      { label: 'The Sun as a length', text: t`$GM_\odot/c^2 = ${sci(M1, 4)}$ m, and the grazing ray has $b = R_\odot = 6.957\times10^{8}$ m.` },
      { label: 'Bending', text: t`$\alpha = 4\times${sci(M1, 4)}/(6.957\times10^{8}) = ${sci(bend(M_SUN, R_SUN))}$ rad $= ${sci(LIMB)}''$.` },
      { label: 'Half from each', text: t`The equivalence principle — curved time alone — gives half, $${sci(LIMB / 2)}''$. Light, moving at $c$, also feels curved space, which supplies the other half.` },
      { label: 'Which way it looks', text: t`The light arrives bent toward the Sun, and you see the star along the direction the light finally comes from: so the star appears pushed **outward**, away from the Sun, by up to $${sci(LIMB)}''$.` },
      { label: '1919', text: t`During the total eclipse of 29 May 1919, stars beside the darkened Sun were photographed from Sobral (Brazil) and Príncipe (off West Africa) and compared with night plates of the same field. The shifts favoured the full value over the half, though with uncertainties of tens of percent.` },
      { label: 'Today', text: t`Radio interferometers now watch quasars pass near the Sun and confirm the full bending to about one part in ten thousand.` },
    ],
    answer: t`$\alpha = ${sci(LIMB)}''$ for a ray grazing the Sun — twice the equivalence-principle value of $${sci(LIMB / 2)}''$. The 1919 eclipse plates favoured the full value.`,
  },
  practice: [
    mcq({
      id: 'massless', difficulty: 1,
      prompt: 'Light has no mass. Why does gravity bend it?',
      choices: [
        'Light follows the straightest paths of curved spacetime; no force, and no mass, is needed',
        'Light has a very small mass, which gravity pulls on',
        'The Sun’s hot atmosphere refracts light, like a lens made of glass',
        'Newton’s law of gravity acts on light’s energy, and that gives the whole effect',
      ],
      answer: 0,
      why: {
        1: 'Light is massless, and anyway the bending in general relativity does not depend on what is moving, only on where it goes.',
        2: 'Plasma refraction depends on frequency and is corrected for; the gravitational bending is the same for radio waves and visible light, and appears far from the Sun’s atmosphere.',
        3: 'A Newtonian calculation that treats light as a fast particle gives only half of the measured bending.',
      },
      hints: ['In general relativity, what replaces the force of gravity for anything moving freely?'],
      teach: 'Light bends because it follows null geodesics of curved spacetime, not because a force acts on a mass.',
      explain: 'Everything moving freely follows geodesics; for light they are the ones with zero proper time. Near a mass those geodesics are bent — by curved time and curved space equally — giving 4GM/(c²b).',
      visual: bendPic({ rays: [{ ...GRAZE, label: 'starlight' }], observer: true, caption: 'Starlight grazing the Sun, with the bending exaggerated about 19 000 times. Grey dashed: its path if the Sun were not there. You see the star along the direction the light finally arrives from.' }),
    }),
    num({
      id: 'grazing', difficulty: 2,
      gen(r) {
        const [what, M, R, rtex] = r.pick([
          ['Jupiter (1.898×10²⁷ kg, radius 71 490 km)', 1.898e27, 7.149e7, t`7.149\times10^{7}`],
          ['Earth (5.972×10²⁴ kg, radius 6371 km)', M_EARTH, R_EARTH, t`6.371\times10^{6}`],
          ['a white dwarf of 1 solar mass and radius 5800 km', M_SUN, 5.8e6, t`5.8\times10^{6}`],
          ['the Sun, passing at twice its radius', M_SUN, 2 * R_SUN, t`1.391\times10^{9}`],
        ]);
        const a = bend(M, R) * RAD_TO_ARCSEC;
        const short = what.split(' (')[0].replace(/, passing.*$/, '').replace(/^a white dwarf.*$/, 'white dwarf');
        return {
          visual: bendPic({ rays: [{ ...GRAZE, label: 'starlight' }], body: short.charAt(0).toUpperCase() + short.slice(1), caption: 'A ray of starlight skimming the body, with the bending hugely exaggerated. Grey dashed: its path if the body were not there.' }),
          prompt: t`A ray of starlight just skims ${what}. By how many arcseconds is it bent? ($b = ${rtex}$ m)`,
          answer: a, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: a / 2, feedback: 'That is the Newtonian (equivalence-principle) half. General relativity’s bending is 4GM/(c²b).' }, { value: bend(M, R), feedback: 'That is in radians. Multiply by 206 265 to get arcseconds.' }],
          hints: [t`$\alpha = 4GM/(c^2 b)$, in radians; $G = 6.674\times10^{-11}$, $c = 2.998\times10^{8}$.`, t`$4GM/c^2 = ${sci((4 * massLength(M)))}$ m; divide by $b$ and multiply by 206 265.`],
          teach: 'The bending 4GM/(c²b) grows with the mass and shrinks with the distance of closest approach.',
          explain: t`$\alpha = ${sci((4 * massLength(M)))}/${rtex} = ${sci(bend(M, R))}$ rad, which is ${a >= 0.1 ? `$${sci(a)}''$` : `$${sci(a * 1e3)}$ milliarcseconds (mas)`}.`,
        };
      },
    }),
    num({
      id: 'elongation', difficulty: 3,
      gen(r) {
        const ph = r.pick([90, 60, 120, 45]);
        const p = (ph * Math.PI) / 180, b = AU * Math.sin(p);
        const d = bendSeenFrom(M_SUN, AU, p) * MAS;
        return {
          visual: elongationPic(ph),
          prompt: t`Satellites such as Gaia measure the bending of starlight all over the sky. Seen from Earth, a star ${ph}° from the Sun has its light pass the Sun at $b = (1\ \text{AU})\sin ${ph}^\circ$, and only the bending that happens before the light reaches us counts: $\delta\theta = \dfrac{4GM_\odot}{c^2 b}\cdot\dfrac{1 + \cos\Phi}{2}$, with $\Phi = ${ph}^\circ$. Find $\delta\theta$ in milliarcseconds. ($4GM_\odot/c^2 = ${sci(4 * M1, 4)}$ m, 1 AU $= 1.496\times10^{11}$ m)`,
          answer: d, units: 'mas', tol: { rel: 0.01 },
          errors: [{ value: bend(M_SUN, b) * MAS, feedback: 'You used the full bending 4GM/(c²b). The light still had part of its path to go — multiply by (1 + cos Φ)/2.' }, { value: bend(M_SUN, AU) * MAS * ((1 + Math.cos(p)) / 2), feedback: 'b is the closest approach, (1 AU) sin Φ, not 1 AU itself.' }].filter((e) => Math.abs(e.value - d) > 0.02 * d),
          hints: [t`$b = 1.496\times10^{11}\times\sin ${ph}^\circ = ${sci(b, 4)}$ m.`, t`$4GM/(c^2 b) = ${sci(bend(M_SUN, b) * MAS, 4)}$ mas; multiply by $(1 + \cos ${ph}^\circ)/2 = ${sci((1 + Math.cos(p)) / 2, 3)}$.`],
          teach: 'Even far from the Sun, starlight is bent by milliarcseconds — measurable by astrometry satellites all over the sky.',
          explain: t`$\delta\theta = ${sci(bend(M_SUN, b) * MAS, 4)}\ \text{mas}\times${sci((1 + Math.cos(p)) / 2, 3)} = ${sci(d)}$ mas. A tempting slip is to use $4GM/(c^2\cdot 1\,\text{AU}) = ${sci(bend(M_SUN, AU) * MAS)}$ mas, which assumes we sit infinitely far from the Sun.`,
        };
      },
    }),
    mcq({
      id: 'ring', difficulty: 2,
      prompt: 'When does a lens produce a complete Einstein ring?',
      choices: [
        'When you, the lens and the source lie exactly on one line',
        'Whenever the lens is a black hole',
        'Whenever the source is very bright',
        'Whenever the lens is very far away',
      ],
      answer: 0,
      why: {
        1: 'Any mass makes a ring for perfect alignment; a black hole lens does not need to be special.',
        2: 'Brightness does not change the geometry of the light paths.',
        3: 'Distance changes the ring’s size, not whether it forms.',
      },
      hints: ['Drag the galaxy in the picture until the two images merge.'],
      teach: 'An Einstein ring needs perfect alignment: by symmetry, light then reaches you equally from every side of the lens.',
      explain: t`With the source exactly behind the lens, every direction around the lens is equivalent, so the two images spread into a full circle of angular radius $\theta_E$. Slightly off line, the ring breaks into two arcs.`,
      visual: { type: 'gr-lensing', params: { beta: 0.6, size: 0.14, system: 'galaxy' } },
    }),
    num({
      id: 'einstein-radius', difficulty: 3,
      gen(r) {
        const m = r.pick([0.3, 0.5, 1.0]), dl = r.pick([2, 4, 6]);
        const th = einsteinRadius(m * M_SUN, dl * 1e3 * PC, 8e3 * PC) * MAS;
        return {
          visual: lensSide(dl, m),
          prompt: t`A ${m}-solar-mass star ${dl} kpc away passes in front of a star 8 kpc away, near the centre of our Galaxy. What is its Einstein radius, in milliarcseconds? (1 kpc $= 3.086\times10^{19}$ m; $GM_\odot/c^2 = ${sci(M1, 4)}$ m)`,
          answer: th, units: 'mas', tol: { rel: 0.01 },
          errors: [{ value: th / Math.SQRT2, feedback: 'Use 4GM/c² — twice the Schwarzschild radius — not 2GM/c².' }, { value: th * th, feedback: 'Take the square root at the end.' }].filter((e) => Math.abs(e.value - th) > 0.02 * th),
          hints: [t`$\theta_E^2 = \dfrac{4GM}{c^2}\,\dfrac{D_{LS}}{D_L D_S}$ with $D_{LS} = D_S - D_L$.`, t`$4GM/c^2 = ${sci(4 * m * M1)}$ m and $D_{LS}/(D_L D_S) = ${8 - dl}/(${dl}\times8)$ per kpc; convert kpc to m, take the root, then convert radians to mas (×2.063×10⁸).`],
          teach: 'Stellar Einstein radii are about a milliarcsecond — far too small to resolve, so microlensing is seen only as a brightening.',
          explain: t`$\theta_E = ${sci(th / MAS)}$ rad $= ${sci(th)}$ mas. Telescopes cannot separate images that close, so the event shows up as the star brightening and fading over weeks.`,
        };
      },
    }),
    num({
      id: 'brightening', difficulty: 2,
      gen(r) {
        const u0 = r.pick([0.1, 0.2, 0.3, 0.5]);
        const mu = magnifications(u0).total;
        return {
          prompt: t`In a microlensing event the lens passes the background star with closest offset $u_0 = ${u0}$ Einstein radii. The combined brightening of the two images is $\mu = \dfrac{u^2 + 2}{u\sqrt{u^2 + 4}}$. How many times brighter is the star at closest approach?`,
          answer: mu, tol: { rel: 0.01 },
          errors: [{ value: magnifications(u0).outer, feedback: 'That is the brighter image alone. Both images add: use the total.' }],
          hints: [t`Put $u = ${u0}$ into the formula: $u^2 + 2 = ${round(u0 * u0 + 2, 4)}$, $\sqrt{u^2 + 4} = ${sci(Math.sqrt(u0 * u0 + 4), 4)}$.`],
          teach: 'The closer the alignment, the greater the brightening: about 1/u for small offsets u.',
          explain: t`$\mu = ${round(u0 * u0 + 2, 4)}/(${u0}\times${sci(Math.sqrt(u0 * u0 + 4), 4)}) = ${sci(mu)}$. A planet orbiting the lens star can add a brief extra spike — that is how microlensing surveys find planets.`,
          visual: lightCurve(u0),
        };
      },
    }),
    num({
      id: 'shadow', difficulty: 3,
      gen(r) {
        const [name, s] = r.pick([['Sagittarius A* (4.30 million solar masses, 8.275 kpc away)', SGR], ['M87* (6.5 billion solar masses, 16.8 Mpc away)', M87]]);
        const d = shadowDiameter(s.m * M_SUN, s.D) * UAS;
        return {
          prompt: t`A non-spinning black hole's shadow has angular diameter $2\sqrt{27}\,GM/(c^2 D)$. Find it for ${name}, in microarcseconds (μas). ($GM_\odot/c^2 = ${sci(M1, 4)}$ m, 1 pc $= 3.086\times10^{16}$ m, 1 rad $= 2.063\times10^{11}$ μas)`,
          answer: d, tol: { rel: 0.01 },
          errors: [{ value: d / 2, feedback: 'That is the radius. The diameter is 2√27 GM/(c²D).' }, { value: (d * 2) / Math.sqrt(27), feedback: 'That is the size of the horizon (diameter 4GM/c²), not the shadow, which is √27/2 ≈ 2.6 times larger.' }],
          hints: [t`$GM/c^2 = ${s.m >= 1e9 ? sci(s.m / 1e9, 2) + '\\times10^{9}' : sci(s.m / 1e6, 3) + '\\times10^{6}'}\times${sci(M1, 4)}$ m $= ${sci(massLength(s.m * M_SUN))}$ m.`, t`$D = ${sci(s.D)}$ m. Compute $2\sqrt{27}\,(GM/c^2)/D$ in radians, then multiply by $2.063\times10^{11}$.`],
          teach: 'A black hole’s shadow is about 2.6 times the diameter of its horizon — tens of microarcseconds for Sgr A* and M87*.',
          explain: t`$2\sqrt{27}\times${sci(massLength(s.m * M_SUN))}/${sci(s.D)} = ${sci(d / UAS)}$ rad $= ${sci(d)}$ μas. The Event Horizon Telescope measured rings of ${s === SGR ? '51.8 ± 2.3 μas (2022)' : '42 ± 3 μas (2019)'}: the ring is lensed light just outside the shadow, consistent with general relativity to about 10%.`,
          visual: shadowPicture,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-limb', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3, 5]);
        return {
          visual: bendPic({
            rays: k === 1 ? [{ ...GRAZE, label: 'grazing' }] : [{ ...GRAZE, label: 'grazing' }, { b: GRAZE.b * k, a: GRAZE.a / k, color: 'accent', label: `${k} solar radii out` }],
            caption: 'Starlight passing the Sun, with the bending hugely exaggerated. Grey dashed: the paths the light would take without the Sun.',
          }),
          prompt: t`Starlight passes the Sun at ${k === 1 ? 'its very edge' : `${k} solar radii from its centre`}. By how many arcseconds is it bent? (Grazing the edge gives $${sci(LIMB)}''$.)`,
          answer: LIMB / k, units: 'arcsec', tol: { rel: 0.01 },
          hints: [t`$\alpha = 4GM/(c^2 b)$ falls off as $1/b$.`],
          teach: 'Light bending falls off as 1/b: twice as far from the Sun, half the bending.',
          explain: t`$${sci(LIMB)}''/${k} = ${sci(LIMB / k)}''$.`,
        };
      },
    }),
    mcq({
      id: 'cp-eht', difficulty: 2,
      prompt: 'What is the dark central region in the Event Horizon Telescope’s images of M87* and Sagittarius A*?',
      choices: [
        'The shadow: the patch of sky from which no light reaches us, because rays traced back from it fall into the hole — about 2.6 times the horizon’s diameter',
        'The event horizon itself, photographed directly',
        'A cloud of dark gas in front of the black hole',
        'The singularity at the centre',
      ],
      answer: 0,
      why: {
        1: 'No light comes from the horizon. The dark patch is larger than the horizon because the black hole bends light strongly around it.',
        2: 'The darkness is set by geometry — lensing near the photon sphere — not by obscuring gas.',
        3: 'The singularity is hidden behind the horizon; nothing from it can reach us.',
      },
      hints: ['Light passing closer than the critical impact parameter, 3√3 GM/c², is captured.'],
      teach: 'Black-hole images show a shadow ringed by lensed light; the shadow is about 2.6 times the horizon’s size.',
      explain: 'Rays aimed closer than 3√3 GM/c² spiral in, so that patch of sky is dark. The bright ring around it is glowing gas whose light has been bent around the hole. The horizon itself is never seen.',
      visual: imagePicture,
    }),
    num({
      id: 'cp-focus', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([1, 1.5, 2]);
        const d = focalDistance(M_SUN, k * R_SUN) / AU;
        return {
          visual: focusPic(k),
          prompt: t`The Sun is a lens. Light from a distant star passing the Sun at $b = ${k}\,R_\odot$ is bent by $\alpha = 4GM_\odot/(c^2 b)$ and crosses the axis behind the Sun at distance $d = b/\alpha$. How far away is that, in AU? ($4GM_\odot/c^2 = ${sci(4 * M1, 4)}$ m, $R_\odot = 6.957\times10^{8}$ m)`,
          answer: d, units: 'AU', tol: { rel: 0.01 },
          errors: [{ value: d * AU, feedback: 'That is in metres. Convert to AU: 1 AU = 1.496×10¹¹ m.' }, { value: d / k, feedback: 'Both b and α depend on b: d = b/α = b²c²/(4GM).' }].filter((e) => Math.abs(e.value - d) > 0.02 * d),
          hints: [t`$d = b/\alpha = \dfrac{b^2}{4GM/c^2}$.`, t`$b = ${sci(k * R_SUN, 4)}$ m, so $d = (${sci(k * R_SUN, 4)})^2/${sci(4 * M1, 4)}$ m; divide by $1.496\times10^{11}$.`],
          teach: 'The Sun’s gravitational lens focuses light no closer than 548 AU — a mission concept for imaging exoplanets, far beyond any spacecraft so far.',
          explain: t`$d = ${sci(d * AU)}$ m $= ${sci(d)}$ AU. A telescope there could use the Sun as an enormous lens; such missions have only been studied as concepts. For scale, Voyager 1, the most distant spacecraft, is about 170 AU out after half a century.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Will, “The Confrontation between General Relativity and Experiment”, Living Rev. Relativ. 17, 4 (2014), §3.4', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Event Horizon Telescope Collaboration, Sgr A* Paper I (2022)', url: 'https://iopscience.iop.org/article/10.3847/2041-8213/ac6674' },
    { label: 'Event Horizon Telescope Collaboration, M87* Paper I (2019)', url: 'https://arxiv.org/abs/1906.11238' },
  ],
});
