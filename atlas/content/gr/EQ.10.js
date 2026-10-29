// The FLRW metric, dissected: cosmic time, the scale factor, the comoving
// radial and angular parts, and the spatial curvature k. Convention: a is
// dimensionless with a = 1 today, r is a comoving distance and k is a
// curvature in m⁻² (Ω_k = −kc²/H₀²); signature (−,+,+,+). Verified with
// sympy: its Einstein tensor gives the Friedmann equations (gr.EQ.11).
// Avoids repeating gr.S30.i (Hubble-law speeds, z → a, CMB temperature,
// Hubble time, horizon, supernova time dilation).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C, sci, round, lcdm, GYR, H0, hubble, MPC } from './_eq.js';

const t = String.raw;

const FLRW = t`ds^2 = -c^2\,dt^2 + a(t)^2\left[\frac{dr^2}{1 - k r^2} + r^2\left(d\theta^2 + \sin^2\theta\,d\phi^2\right)\right]`;

// comoving grid at two moments (teaching model)
const grid = (s = 1.6, caption) => {
  const pts = [], arrows = [];
  for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) {
    pts.push({ x: i, y: j, r: 3, color: 'ink4' });
    if (i || j) arrows.push({ from: [i, j], to: [round(s * i, 4), round(s * j, 4)], color: 'accent' });
    pts.push({ x: round(s * i, 4), y: round(s * j, 4), r: 4.5, color: i || j ? 'accent' : 'gold' });
  }
  return {
    type: 'graph',
    params: { x: [-3.9, 3.9], y: [-2.1, 2.1], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', arrows, points: pts },
    caption: caption ?? `Teaching model, in two dimensions: galaxies keep their comoving grid labels while every distance between them grows by the same factor (here ${s}). Faint: earlier; blue: later; gold: any galaxy you choose as “home” — each sees all the others recede.`,
  };
};

// a(t) for flat ΛCDM (Planck 2018), with emission and reception marked
const T0 = lcdm.age() / GYR;
const aPlot = (z) => {
  const aE = 1 / (1 + z);
  return {
    type: 'graph',
    params: {
      x: [0, 16], y: [0, 1.25], xlabel: 'time since the Big Bang (Gyr)', ylabel: 'scale factor a',
      curves: [{ fn: lcdm.expr(), domain: [0, 16], color: 'accent' }],
      vlines: [{ x: round(T0, 4), label: 'today' }],
      hlines: [{ y: 1 }, ...(z ? [{ y: round(aE, 5), label: 'emission', color: 'gold' }] : [])],
    },
    caption: t`The scale factor $a(t)$ of a flat universe with $\Omega_m = 0.315$ and $\Omega_\Lambda = 0.685$ (Planck 2018), radiation neglected. ${z ? 'The gold line marks the scale factor when the light set out.' : ''}`,
  };
};

// circumference ÷ (2π × radius) in closed, flat and open space
const ratioGraph = (slider) => ({
  type: 'graph',
  params: {
    x: [0, 3.1], y: [0, 2.6], xlabel: 'radius ÷ curvature radius', ylabel: 'C / (2π × radius)',
    ...(slider ? {
      sliders: [{ key: 's', label: 'Circle radius, in units of the curvature radius', min: 0.05, max: 3, step: 0.01, value: 1, explain: 'A circle drawn in space with this proper radius, measured from its centre.' }],
      points: [{ x: 's', y: 'sin(s)/s', color: 'bad' }, { x: 's', y: '1', color: 'ink2' }, { x: 's', y: 'sinh(s)/s', color: 'accent' }],
      readouts: [
        { label: 'closed ($k > 0$)', expr: 'sin(s)/s', digits: 3 },
        { label: 'flat ($k = 0$)', expr: '1', digits: 3 },
        { label: 'open ($k < 0$)', expr: 'sinh(s)/s', digits: 3 },
      ],
    } : {}),
    curves: [
      { fn: 'sin(x)/x', domain: [0.001, 3.1], color: 'bad', label: 'closed, k > 0', labelAt: 2.2, labelDy: 14 },
      { fn: '1', color: 'ink2', dash: true, label: 'flat, k = 0', labelAt: 2.3, labelDy: -12 },
      { fn: 'sinh(x)/x', domain: [0.001, 2.75], color: 'accent', label: 'open, k < 0', labelAt: 1.5, labelDx: -96, labelDy: -6 },
    ],
  },
  caption: t`Draw a circle in space at one moment and compare its circumference $C$ with $2\pi$ times its radius (both measured with rulers). Flat space gives exactly 1; in closed space ($k > 0$) circles are smaller than Euclid says, in open space ($k < 0$) larger. The effect is noticeable only for circles comparable to the curvature radius.`,
});

export default lesson({
  id: 'gr.EQ.10',
  kind: 'dissection',
  title: 'The FLRW metric',
  minutes: 8, difficulty: 3,
  badges: ['est-obs'],
  equation: t`\part{1}{ds^2} = \part{2}{-c^2\,dt^2} + \part{3}{a(t)^2}\left[\part{4}{\frac{dr^2}{1 - \part{6}{k}\,r^2}} + \part{5}{r^2\left(d\theta^2 + \sin^2\theta\,d\phi^2\right)}\right]`,
  intro: t`On scales of hundreds of megaparsecs the universe looks the same everywhere and in every direction — the **cosmological principle**, borne out by galaxy surveys and the cosmic microwave background. Spacetime that obeys it must have this form, named after Friedmann, Lemaître, Robertson and Walker. All that is left to choose is one function of time, the scale factor $a(t)$, and one number, the curvature $k$.

Conventions here: signature $(-,+,+,+)$; $a$ is dimensionless with $a = 1$ today; $r$ is a **comoving** distance (in Mpc, say); $k$ is a curvature in $\text{m}^{-2}$. Many books instead scale $k$ to $-1$, $0$ or $+1$ and give $a$ units of length — the same physics. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`ds^2`, name: 'the line element', badge: 'est-der', units: t`$\text{m}^2$`,
      text: t`The interval between two nearby events, here split into time and space. For a galaxy at rest in the expanding grid — fixed $r$, $\theta$, $\phi$ — it reduces to $ds^2 = -c^2dt^2$: such a **comoving** galaxy's own clock reads $t$. For light $ds^2 = 0$, which fixes how far it gets as the universe expands.`,
    },
    {
      tex: t`-c^2\,dt^2`, name: 'cosmic time', badge: 'est-der', units: t`$\text{m}^2$`,
      text: t`$t$ is **cosmic time**: the proper time of every comoving observer, counted from the Big Bang (13.8 billion years for us). There is no factor in front of $c^2dt^2$, so every comoving clock ticks at the same rate — no galaxy is "lower" than another in this uniform universe.

That gives "now" a meaning across the universe: the moment at which every comoving observer sees the cosmic background at the same temperature, 2.725 K.`,
    },
    {
      tex: t`a(t)^2`, name: 'the scale factor', badge: 'est-obs',
      text: t`$a(t)$ multiplies **every** distance in space by the same growing factor: two galaxies at comoving separation $\chi$ are $d = a(t)\,\chi$ apart. It is 1 today and was smaller in the past; its rate of change gives the Hubble parameter, $H = \dot a/a$, and with it the Hubble law $\dot d = H d$.

Light's wavelength stretches with it too: light emitted when the scale factor was $a$ arrives with $1 + z = 1/a$. That the universe expands is observed; how $a(t)$ grows is set by its contents, through the Friedmann equations.`,
    },
    {
      tex: t`\frac{dr^2}{1 - k r^2}`, name: 'the radial part', badge: 'est-der', units: t`$\text{m}^2$ (before the factor $a^2$)`,
      text: t`Steps toward or away from us, in the comoving coordinate $r$. Galaxies keep their values of $r$: the coordinate grid expands with them, and $a(t)$ supplies the growth. A galaxy at comoving coordinate $r$ is today a proper distance $\int_0^r dr'/\sqrt{1 - kr'^2}$ away.

When $k = 0$ that is just $r$: radial distances are Euclidean. When $k \neq 0$ they are not, and that is how the curvature of space shows up.`,
    },
    {
      tex: t`r^2\left(d\theta^2 + \sin^2\theta\,d\phi^2\right)`, name: 'the angular part', badge: 'est-der', units: t`$\text{m}^2$ (before the factor $a^2$)`,
      text: t`Steps across the sky: $\theta$ and $\phi$ are directions, as on a celestial sphere. A sphere of comoving coordinate $r$ has proper area $4\pi a^2r^2$, so $r$ is fixed by areas, as in Schwarzschild's metric.

This is what sets the angular size of distant objects: a galaxy of proper size $D$ at comoving coordinate $r$ spans an angle $D/(a\,r)$, with $a$ the scale factor when its light left. It is why the angular sizes of the cosmic background's spots measure the curvature.`,
    },
    {
      tex: t`k`, name: 'the spatial curvature', badge: 'est-obs', units: t`$\text{m}^{-2}$`,
      text: t`The curvature of space today. $k > 0$: space is **closed**, like a three-dimensional sphere of radius $1/\sqrt k$ — finite, with circles smaller than $2\pi$ times their radius and triangles' angles adding to more than $180^\circ$. $k = 0$: **flat**, Euclidean. $k < 0$: **open**, saddle-like and infinite.

In cosmology it is quoted as $\Omega_k = -kc^2/H_0^2$. Planck with galaxy surveys finds $\Omega_k = 0.001 \pm 0.002$: space is flat to within a few tenths of a percent, as far as we can see.`,
    },
  ],
  readAloud: t`In a uniform, expanding universe the interval is cosmic time, ticking alike for every galaxy, plus space — flat, or curved by $k$ — whose every distance is multiplied by the growing scale factor $a(t)$.`,
  why: t`This metric is the stage of all of cosmology: the Hubble law, the redshift of distant light, the cooling of the cosmic background and the age of the universe all come from its one function $a(t)$.`,
  visual: {
    title: 'How the curvature k shows',
    lead: t`The curvature $k$ decides the geometry of space at each moment. Draw a circle in space, measure its radius and its circumference with rulers, and compare. Slide the circle's size, in units of the curvature radius $1/\sqrt{|k|}$.`,
    tasks: [
      'For small circles all three geometries agree: locally, curved space looks flat.',
      'At one curvature radius, a closed space’s circle is 16% short of 2π × radius; an open space’s is 18% long.',
      t`Our universe: Planck finds $|\Omega_k|$ below a few thousandths, so its curvature radius is far larger than the observable universe — every circle we can draw is on the left of this graph.`,
    ],
    ...ratioGraph(true),
  },
  practice: [
    mcq({
      id: 'cosmic-time', difficulty: 1,
      prompt: t`$$ds^2 = \underbrace{-c^2\,dt^2}_{\text{?}} + a(t)^2\left[\frac{dr^2}{1 - kr^2} + r^2\,d\Omega^2\right]$$ There is no factor multiplying $c^2dt^2$. What does that mean? ($d\Omega^2$ is short for $d\theta^2 + \sin^2\theta\,d\phi^2$.)`,
      choices: [
        'Every comoving galaxy’s clock ticks at the same rate, so t — cosmic time — is the proper time of all of them',
        'Time does not pass in an expanding universe',
        'Clocks in distant galaxies run slow, as they would near a mass',
        'Only the Milky Way’s clocks keep cosmic time; the others need a correction',
      ],
      answer: 0,
      why: {
        1: t`Time passes: $ds^2 = -c^2dt^2$ for a comoving galaxy says its clock advances by exactly $dt$.`,
        2: t`Slow clocks would need a factor like $(1 - r_s/r)$ in front of $dt^2$, as in Schwarzschild's metric. Here there is none.`,
        3: 'The cosmological principle makes no galaxy special: the Milky Way is just one comoving observer among all the others.',
      },
      hints: [t`Put $dr = d\theta = d\phi = 0$ (a galaxy at rest in the grid) and compare $ds^2$ with $-c^2d\tau^2$.`],
      teach: 'Cosmic time t is the proper time of every comoving observer — the one clock all galaxies at rest in the expanding grid share.',
      explain: t`For a comoving galaxy $ds^2 = -c^2dt^2 = -c^2d\tau^2$, so $d\tau = dt$ for all of them. That is why "the age of the universe", 13.8 billion years, means the same for every comoving observer.`,
      visual: grid(1.6),
    }),
    num({
      id: 'proper-then', difficulty: 2,
      gen(r) {
        const d0 = r.pick([20, 50, 120]), z = r.pick([1, 3, 9]);
        return {
          prompt: t`Two galaxy clusters, both at rest in the expanding grid, are ${d0} Mpc apart today. The light we receive from $z = ${z}$ left when the scale factor was $a = 1/(1 + z)$. How far apart were the clusters then, in Mpc?`,
          answer: d0 / (1 + z), units: 'Mpc', tol: { rel: 0.005 },
          errors: [{ value: d0 * (1 + z), feedback: 'The universe was smaller then: multiply by a = 1/(1 + z), not by 1 + z.' }, { value: d0 / z, feedback: 'The scale factor is 1/(1 + z), not 1/z.' }],
          hints: [t`Proper distance is $d = a(t)\,\chi$, with comoving separation $\chi = ${d0}$ Mpc fixed.`, t`$a = 1/(1 + ${z}) = ${fmt(1 / (1 + z), 3)}$.`],
          teach: 'Comoving separations stay fixed; proper distances are the scale factor times them.',
          explain: t`$d = a\chi = ${d0}/${1 + z} = ${fmt(d0 / (1 + z), 4)}$ Mpc. The clusters did not move through space: the factor $a(t)^2$ in the metric grew.`,
          visual: aPlot(z),
        };
      },
    }),
    num({
      id: 'circle', difficulty: 3,
      gen(r) {
        const x = r.pick([0.5, 1, 1.5]);
        const ratio = Math.sin(x) / x;
        return {
          prompt: t`In a closed universe ($k > 0$) space at one moment is a three-dimensional sphere of curvature radius $R$. A circle of proper radius $\rho$ there has circumference $C = 2\pi R\sin(\rho/R)$ — as on a globe. For $\rho = ${x}R$, what is $C$ divided by the Euclidean $2\pi\rho$?`,
          answer: ratio, tol: { rel: 0.005 },
          errors: [{ value: Math.sinh(x) / x, feedback: 'That is the open universe (k < 0), with sinh. A closed one uses sin: circles fall short.' }, ...(x !== 1 ? [{ value: Math.sin(x), feedback: 'Divide by ρ/R as well: C/(2πρ) = sin(ρ/R)/(ρ/R).' }] : [])],
          hints: [t`$\dfrac{C}{2\pi\rho} = \dfrac{\sin(\rho/R)}{\rho/R}$, with the angle in radians.`, t`$\sin(${x}) = ${fmt(Math.sin(x), 4)}$; divide by ${x}.`],
          teach: 'In closed space circles are smaller than 2π times their radius — the same deficit as circles on a globe.',
          explain: t`$\sin(${x})/${x} = ${fmt(ratio, 4)}$: the circle falls ${fmt(100 * (1 - ratio), 3)}% short of Euclid. On the Earth, a circle of radius ${round(6371 * x, 4)} km round the North Pole falls short in exactly the same proportion.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: Math.max(5, Math.round(90 - (x * 180) / Math.PI)), transport: false, measure: true, readout: false }, caption: 'A two-dimensional analogue: on a sphere, a circle around the pole is shorter than 2π times its radius measured along the surface. A closed universe does the same in three dimensions.' },
        };
      },
    }),
    mcq({
      id: 'k-sign', difficulty: 2,
      prompt: t`Three huge triangles are surveyed at one moment of cosmic time, with sides along light rays, in three different universes. In which do the triangle's angles add up to **more** than $180^\circ$?`,
      choices: [t`$k > 0$: closed space, curved like a sphere`, t`$k = 0$: flat space`, t`$k < 0$: open space, curved like a saddle`, t`It depends only on $a(t)$, not on $k$`],
      answer: 0,
      why: {
        1: 'Flat space is Euclid’s: exactly 180°.',
        2: 'Saddle-like space makes angles add up to less than 180°.',
        3: t`At one moment $a(t)$ is just a number multiplying every length; it changes sizes, not angles. Angles are set by $k$.`,
      },
      hints: ['On a globe, a triangle with two corners on the equator and one at the North Pole can have three right angles.'],
      teach: 'Positive curvature (k > 0) makes triangle angles add to more than 180°, negative curvature to less.',
      explain: t`With $k > 0$ space is like a 3-sphere, and its triangles behave like those on a globe: angle sum $> 180^\circ$, by an amount equal to the area divided by the curvature radius squared. Measurements of the cosmic background's spot sizes do this test on the largest triangle there is — and find flat.`,
      visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 90, colat: 90, colatSlider: false, transport: false, progress: 1, readout: false }, caption: 'A two-dimensional analogue: a triangle on a sphere with three right angles — 270° in all.' },
    }),
    mcq({
      id: 'redshift', difficulty: 2,
      prompt: t`Light crossing the universe arrives with its wavelength stretched. Which part of the metric does that?`,
      choices: [
        t`The scale factor $a(t)^2$: crests of the wave keep fixed comoving spacing, so their proper spacing grows with $a$`,
        t`The curvature $k$: light bends round curved space`,
        t`The $-c^2dt^2$ term: distant clocks run slow`,
        'None: it is a Doppler shift from galaxies flying through space',
      ],
      answer: 0,
      why: {
        1: t`The redshift happens even with $k = 0$; it depends only on how much $a$ grew while the light travelled.`,
        2: t`Comoving clocks all keep cosmic time — the $dt^2$ term has no factor that could slow them.`,
        3: 'Galaxies at rest in the comoving grid still show it: it is the expansion of space between them, not their motion through it.',
      },
      hints: [t`For light $ds^2 = 0$. Which factor changes between the moment of emission and the moment of reception?`],
      teach: 'Cosmological redshift is the stretching of light by the scale factor: 1 + z = a(reception)/a(emission).',
      explain: t`Successive crests leave a comoving distance apart and stay that far apart in comoving terms; their proper separation — the wavelength — grows in proportion to $a(t)$. So $1 + z = a_\text{now}/a_\text{then}$, whatever $k$ is.`,
      visual: aPlot(2),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-jwst', difficulty: 2, transfer: true,
      gen(r) {
        const z = r.pick([10, 12, 14]);
        const lam = 121.6 * (1 + z);
        return {
          prompt: t`Hydrogen's Lyman-alpha line is emitted at 121.6 nm, in the ultraviolet. The James Webb Space Telescope finds galaxies whose light left them at $z = ${z}$, when the scale factor was $a = 1/(1 + z)$. At what wavelength does that line reach the telescope, in nm?`,
          answer: lam, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: 121.6 * z, feedback: 'Wavelengths stretch by 1 + z, not z.' }, { value: 121.6 / (1 + z), feedback: 'The light is stretched, not squeezed: multiply by 1 + z.' }],
          hints: [t`Wavelength grows with the scale factor: $\lambda_\text{obs} = \lambda_\text{emit}\,(1 + z)$.`],
          teach: 'Light from the first galaxies is stretched into the infrared by the growth of a(t) — which is why JWST observes in the infrared.',
          explain: t`$121.6\times${1 + z} = ${fmt(lam, 4)}$ nm, about $${fmt(lam / 1000, 3)}\ \mu$m: deep in the infrared, where JWST's instruments see and Hubble's mostly cannot. The universe has grown ${1 + z}-fold since that light set out.`,
          visual: aPlot(z),
        };
      },
    }),
    num({
      id: 'cp-curvature', difficulty: 3,
      gen(r) {
        const ok = r.pick([0.002, 0.005, 0.01]);
        const RH = (C / hubble(H0)) / MPC / 1000;   // Gpc
        const Rc = RH / Math.sqrt(ok);
        return {
          prompt: t`The curvature radius of space today is $R_c = 1/\sqrt{|k|}$, and the measured density parameter is $\Omega_k = -kc^2/H_0^2$, so $R_c = \dfrac{c/H_0}{\sqrt{|\Omega_k|}}$. With $c/H_0 = ${fmt(RH, 4)}$ Gpc (for $H_0 = ${H0}$ km/s/Mpc), how large must $R_c$ be if $|\Omega_k| < ${ok}$? Give the smallest value, in Gpc.`,
          answer: Rc, units: 'Gpc', tol: { rel: 0.01 },
          errors: [{ value: RH / ok, feedback: t`Take the square root of $|\Omega_k|$.` }, { value: RH * Math.sqrt(ok), feedback: t`Divide by $\sqrt{|\Omega_k|}$, do not multiply: a small $\Omega_k$ means a huge curvature radius.` }],
          hints: [t`A small $|\Omega_k|$ means a large curvature radius: $R_c$ grows as $1/\sqrt{|\Omega_k|}$.`, t`$R_c = ${fmt(RH, 4)}\ \text{Gpc}/\sqrt{${ok}}$.`],
          teach: t`Because $|\Omega_k|$ is tiny, the curvature radius of space is many times the size of the observable universe: on what we can see, space is flat.`,
          explain: t`$R_c > ${fmt(RH, 4)}/\sqrt{${ok}} = ${fmt(Rc, 3)}$ Gpc — over ${Math.floor(Rc / 14.3)} times the 14 Gpc to the edge of the observable universe. Whether space is exactly flat, slightly closed or slightly open, we cannot yet tell.`,
          visual: ratioGraph(false),
        };
      },
    }),
    mcq({
      id: 'cp-into', difficulty: 2,
      prompt: 'Into what does the universe expand?',
      choices: [
        t`Nothing: the metric has no "outside". $a(t)$ multiplies distances within space; nothing is said about space sitting inside anything else`,
        'Into empty space beyond the outermost galaxies',
        'Into a fourth spatial dimension, as a balloon’s skin expands into the room',
        'Into the region left by the Big Bang’s explosion',
      ],
      answer: 0,
      why: {
        1: 'In a homogeneous universe there are no outermost galaxies and no edge: every comoving observer sees the same thing.',
        2: 'The balloon is a teaching model of a closed universe: its extra dimension is part of the picture, not of the physics, and a flat or open universe has no such picture at all.',
        3: 'The Big Bang happened everywhere at once — every comoving point traces back to a = 0 — not at a centre from which things flew outward.',
      },
      hints: [t`Look at what $a(t)$ multiplies in the metric. Is there any coordinate for "outside"?`],
      teach: 'Expansion is the growth of distances within space — described by a(t) — not the movement of space into something else.',
      explain: t`The FLRW metric describes all of space, and all it says is that distances between comoving points grow as $a(t)$. There is no region outside it to grow into, and no centre: every galaxy sees every other receding.`,
      visual: grid(1.6),
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, ch. 8 (cosmology)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
    { label: 'Davis & Lineweaver, “Expanding confusion” (2004)', url: 'https://arxiv.org/abs/astro-ph/0310808' },
  ],
});
