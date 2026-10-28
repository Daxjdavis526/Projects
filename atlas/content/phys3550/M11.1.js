// Scattering angles and cross sections (Taylor ch. 14; Goldstein §3.10):
// a uniform beam, the impact parameter b and the scattering angle θ(b); the
// ring 2πb db maps onto the cone 2π sin θ dθ, so dσ/dΩ = (b/sin θ)|db/dθ|;
// σ = ∫(dσ/dΩ) dΩ; the count rate N_inc·n_t·(dσ/dΩ)·ΔΩ. Hard spheres:
// b = R cos(θ/2), dσ/dΩ = R²/4 — isotropic — and σ = πR² (two spheres:
// π(R₁ + R₂)²). Lab against centre-of-mass angles for equal masses
// (θ_lab = θ_cm/2). Transfer: a Schwarzschild black hole's photon-capture
// cross section 27πG²M²/c⁴. Links PHYS 3710 N1.1 (nuclear radii from
// scattering) and N3.1 (barns and reaction rates) rather than repeating them.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci, gpic, seg, lab, distinct } from './_cm5.js';
import { GM_SUN, C } from './_cm3.js';

const t = String.raw;
const DEG = 180 / Math.PI;
const U = 1.66053906892e-27;     // kg per u

/** A hard sphere of radius 1 with a beam of rays at the given impact parameters, each bounced off the surface. */
function bouncePic(bs, caption, { highlight = null, labels = false, angle = false, alt } = {}) {
  const curves = [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2.4 }];
  const points = [];
  bs.forEach((b, i) => {
    const xe = -Math.sqrt(1 - b * b), th = Math.PI - 2 * Math.asin(b), col = i === highlight ? 'warn' : 'accent', w = i === highlight ? 2.4 : 1.5;
    curves.push(seg([-3.2, b], [xe, b], col, w));
    curves.push(seg([xe, b], [xe + 2.6 * Math.cos(th), b + 2.6 * Math.sin(th)], col, w));
    if (i === highlight) {
      curves.push(seg([0, 0], [xe, b], 'ink4', 1, true));
      curves.push(seg([xe, b], [xe + 1.2, b], 'ink4', 1, true));
      if (angle) curves.push({ param: [`${+xe.toFixed(5)} + 0.45*cos(t)`, `${b} + 0.45*sin(t)`], t: [0, +th.toFixed(5)], color: 'gold', width: 1.6 });
    }
  });
  if (labels && highlight !== null) {
    const b = bs[highlight], xe = -Math.sqrt(1 - b * b), th = Math.PI - 2 * Math.asin(b);
    points.push(lab(-2.9, b / 2, 'b', 'warn', 0, 0), lab(0.35, -0.25, 'R', 'ink3', 0, 0));
    if (angle) points.push(lab(xe + 0.6 * Math.cos(th / 2), b + 0.6 * Math.sin(th / 2) + 0.05, 'θ', 'gold', 0, 0));
    curves.push(seg([-2.75, 0], [-2.75, b], 'warn', 1.2));
    curves.push(seg([0, 0], [0.7071, -0.7071], 'ink3', 1));
  }
  curves.push(seg([-3.2, 0], [3.2, 0], 'ink4', 1, true));
  return gpic({ x: [-3.2, 3.2], y: [-1.6, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points }, caption, alt || 'Rays coming in from the left bounce off a sphere');
}

export default lesson({
  id: 'phys3550.M11.1',
  title: 'Scattering angles and cross sections',
  minutes: 16, difficulty: 3,
  intro: t`Nobody can aim a single alpha particle or neutron at a nucleus. A scattering experiment instead sends a **uniform beam** at a target and counts how many particles come out in each direction. Each particle's fate is set by its **impact parameter** $b$ — how far off-centre it was aimed — which fixes its scattering angle $\theta$. Particles aimed through a thin ring of area $2\pi b\,db$ come out into a cone of solid angle $d\Omega = 2\pi\sin\theta\,d\theta$, and the ratio of the two is the **differential cross section**: the target's effective area for sending particles into each unit of solid angle. Integrate it over all directions and you get the **total cross section** $\sigma$, the area the target blocks. This is how Rutherford found the nucleus, how nuclear radii are measured ([N1.1](#/lesson/phys3710.N1.1)) and why reaction rates come in barns ([N3.1](#/lesson/phys3710.N3.1)).`,
  equation: t`\frac{d\sigma}{d\Omega} = \frac{b}{\sin\theta}\left|\frac{db}{d\theta}\right|, \qquad \sigma = \int\frac{d\sigma}{d\Omega}\,d\Omega`,
  symbols: [
    { tex: 'b', text: 'the **impact parameter**: the perpendicular distance between the incoming line of flight and the target’s centre, in m' },
    { tex: '\\theta', text: 'the **scattering angle**: between the incoming and outgoing directions, from 0 (straight through) to $\\pi$ (straight back)' },
    { tex: 'd\\Omega', text: 'an element of **solid angle**, $\\sin\\theta\\,d\\theta\\,d\\varphi$, in steradians (sr); the whole sphere is $4\\pi$ sr' },
    { tex: '\\frac{d\\sigma}{d\\Omega}', text: 'the **differential cross section**, in $\\text{m}^2/\\text{sr}$ (or barns per steradian, $1\\ \\text{b} = 10^{-28}\\ \\text{m}^2$)' },
    { tex: '\\sigma', text: 'the **total cross section**, in $\\text{m}^2$: the beam area the target removes' },
  ],
  why: t`Cross sections are the language of every collision experiment, from Rutherford's gold foil to the LHC, and of every rate that depends on things hitting things: reactor neutrons, interstellar dust on a probe's shield, photons captured by a black hole.`,
  visual: {
    type: 'graph',
    title: 'A ring of beam, a cone of directions',
    lead: t`A hard sphere of radius $R = 1$ and two rays of the beam, at impact parameters $b$ and $b + db$ (the shaded band is a slice of the ring between them). Each bounces off the surface like light off a mirror. The readouts compare the band's area with the solid angle it is sent into.`,
    tasks: [
      t`Slide $b$ from 0 to 0.8: head-on rays bounce straight back ($\theta = 180^\circ$), grazing ones are barely deflected.`,
      t`Watch $d\sigma/d\Omega$ as you move $b$: it stays at $0.25$ (that is $R^2/4$) whatever the angle — the hard sphere scatters equally into every solid angle.`,
      t`Make $db$ small: the readout settles exactly on $0.25$, as the formula is a limit $db \to 0$.`,
    ],
    params: {
      x: [-3.2, 3.2], y: [-1.6, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'b', label: 'Impact parameter $b$', min: 0, max: 0.8, step: 0.01, value: 0.45, unit: 'R', explain: 'How far off-centre the ray is aimed, in units of the sphere’s radius.' },
        { key: 'db', label: 'Band width $db$', min: 0.01, max: 0.15, step: 0.01, value: 0.08, unit: 'R', explain: 'The width of the ring of beam whose particles we follow.' },
      ],
      shade: [{ fn: 'b + db', lower: 'b', from: -3.2, to: -1.05, color: 'warn', alpha: 0.35 }],
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2.4 },
        { param: ['-3.2 + t*(3.2 - sqrt(1 - b^2))', 'b'], t: [0, 1], color: 'accent', width: 1.8 },
        { param: ['-3.2 + t*(3.2 - sqrt(1 - (b + db)^2))', 'b + db'], t: [0, 1], color: 'warn', width: 1.8 },
        { param: ['-sqrt(1 - b^2) + t*cos(pi - 2*asin(b))', 'b + t*sin(pi - 2*asin(b))'], t: [0, 2.6], color: 'accent', width: 1.8 },
        { param: ['-sqrt(1 - (b + db)^2) + t*cos(pi - 2*asin(b + db))', 'b + db + t*sin(pi - 2*asin(b + db))'], t: [0, 2.6], color: 'warn', width: 1.8 },
        { param: ['-t*sqrt(1 - b^2)', 't*b'], t: [0, 1], color: 'ink4', width: 1, dash: true },
        { param: ['t', '0'], t: [-3.2, 3.2], color: 'ink4', width: 1, dash: true },
      ],
      readouts: [
        { label: '$\\theta$', expr: '(pi - 2*asin(b))*180/pi', unit: '^\\circ', digits: 4 },
        { label: '$d\\theta$', expr: '2*(asin(b + db) - asin(b))*180/pi', unit: '^\\circ', digits: 3 },
        { label: 'ring area $2\\pi b\\,db$', expr: '2*pi*(b + db/2)*db', unit: 'R^2', digits: 3 },
        { label: 'solid angle $2\\pi\\sin\\theta\\,d\\theta$', expr: '2*pi*sin(pi - 2*asin(b + db/2))*2*(asin(b + db) - asin(b))', unit: '\\mathrm{sr}', digits: 3 },
        { label: '$d\\sigma/d\\Omega$', expr: '(b + db/2)*db/(sin(pi - 2*asin(b + db/2))*2*(asin(b + db) - asin(b)))', unit: 'R^2/\\mathrm{sr}', digits: 3 },
      ],
      alt: 'Two rays of a beam bounce off a sphere, the band between them shaded',
    },
    caption: t`A rigid sphere fixed in place (an infinitely heavy target) and point particles; drawn in one plane, though the band is really a ring all the way round the axis and the outgoing rays a cone. Readouts use the band's midpoint, so they are exact only as $db \to 0$.`,
  },
  example: {
    prompt: t`Point particles bounce elastically off a fixed hard sphere of radius $R$. Find $\theta(b)$, then the differential and total cross sections.`,
    visual: bouncePic([0.55], t`One ray at impact parameter $b$ (orange). It leaves at the mirror angle about the radius to the point of impact (dashed), turned through $\theta$ (gold) from its incoming direction (dotted).`, { highlight: 0, labels: true, angle: true }),
    steps: [
      { label: 'Geometry', text: t`The ray meets the surface where the radius makes angle $\alpha$ with the axis, $\sin\alpha = b/R$. Reflection reverses the radial part of the velocity and keeps the tangential part, so the ray turns through $\theta = \pi - 2\alpha$.` },
      { label: 'Invert', text: t`$\alpha = \pi/2 - \theta/2$, so $b = R\sin\alpha = R\cos(\theta/2)$: $b = R$ grazes ($\theta = 0$), $b = 0$ bounces straight back ($\theta = \pi$).` },
      { label: 'Differentiate', text: t`$\left|\dfrac{db}{d\theta}\right| = \dfrac{R}{2}\sin\dfrac{\theta}{2}$.` },
      { label: 'Cross section', text: t`$\dfrac{d\sigma}{d\Omega} = \dfrac{R\cos(\theta/2)}{\sin\theta}\cdot\dfrac{R}{2}\sin\dfrac{\theta}{2} = \dfrac{R^2}{4}$, using $\sin\theta = 2\sin\dfrac\theta2\cos\dfrac\theta2$.` },
      { label: 'Total', text: t`$\sigma = \dfrac{R^2}{4}\times4\pi = \pi R^2$.` },
      { label: 'Sense check', text: t`The total is the sphere's shadow, as it must be: every particle aimed inside radius $R$ is scattered, every one outside misses. The scattering is **isotropic** — equal per steradian in every direction — which is why a hard-sphere gas is the simplest model of molecular collisions.` },
    ],
    answer: t`$b = R\cos(\theta/2)$, $\dfrac{d\sigma}{d\Omega} = \dfrac{R^2}{4}$ (isotropic), $\sigma = \pi R^2$.`,
  },
  practice: [
    num({
      id: 'theta-of-b', difficulty: 1,
      gen(r) {
        const f = r.pick([0.2, 0.3, 0.5, 0.6, 0.8, 0.9]);
        const key = 2 * Math.acos(f) * DEG;
        return {
          prompt: t`A point particle hits a fixed, hard sphere with impact parameter $b = ${f}R$. Through what angle is it scattered?`,
          answer: key, units: 'deg', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.acos(f) * DEG, feedback: t`$\theta = 2\arccos(b/R)$: the reflection turns the ray through twice the angle between its path and the surface's tangent.` }, { value: 2 * Math.asin(f) * DEG, feedback: t`$b = R\cos(\theta/2)$, so $\theta = 2\arccos(b/R)$, not $\arcsin$: head-on ($b = 0$) must give $180^\circ$.` }, { value: 180 - Math.asin(f) * DEG, feedback: t`The deflection is $\pi - 2\alpha$ with $\sin\alpha = b/R$ — both reflections' worth.` }], key),
          hints: [t`$b = R\cos(\theta/2)$ for a hard sphere.`],
          teach: t`For a hard sphere, $b = R\cos(\theta/2)$: head-on bounces back, grazing barely turns.`,
          explain: t`$\theta = 2\arccos(${f}) = ${sci(key, 3)}^\circ$.`,
          visual: bouncePic([f], t`The ray (orange) and the sphere, with the radius to the point of impact dashed. Not every angle is marked.`, { highlight: 0, labels: true }),
        };
      },
    }),
    num({
      id: 'two-spheres', difficulty: 2,
      gen(r) {
        const R1 = r.pick([0.15, 0.18, 0.2]), R2 = r.pick([0.12, 0.17, 0.19]);
        const key = Math.PI * (R1 + R2) ** 2;
        return {
          prompt: t`Treat two gas molecules as hard spheres of radii $${R1}$ nm and $${R2}$ nm. What is their collision cross section, in $\text{nm}^2$?`,
          answer: key, units: 'nm^2', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.PI * (R1 * R1 + R2 * R2), feedback: t`Two spheres touch when their centres are $R_1 + R_2$ apart: $\sigma = \pi(R_1 + R_2)^2$, not the sum of the two areas.` }, { value: Math.PI * R1 * R2, feedback: t`The contact distance is $R_1 + R_2$, and $\sigma = \pi(R_1 + R_2)^2$.` }, { value: Math.PI * ((R1 + R2) / 2) ** 2, feedback: t`Use the sum of the radii, not their average.` }], key),
          hints: [t`They collide if their centres pass within $R_1 + R_2$. Shrink one molecule to a point and grow the other to radius $R_1 + R_2$.`],
          teach: t`Two hard spheres collide within impact parameter $R_1 + R_2$: $\sigma = \pi(R_1 + R_2)^2$.`,
          explain: t`$\sigma = \pi(${R1} + ${R2})^2 = ${sci(key, 3)}\ \text{nm}^2$. This is the $\sigma$ in the kinetic theory's mean free path, $\lambda = 1/(n\sigma\sqrt2)$.`,
          visual: gpic({ x: [-1.3, 1.3], y: [-0.75, 0.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: `sqrt(max(0, ${R1 * R1} - (x + 0.6)^2))`, lower: `-sqrt(max(0, ${R1 * R1} - (x + 0.6)^2))`, from: -0.6 - R1, to: -0.6 + R1, color: 'accent', alpha: 0.6 }, { fn: `sqrt(max(0, ${R2 * R2} - (x - 0.5)^2))`, lower: `-sqrt(max(0, ${R2 * R2} - (x - 0.5)^2))`, from: 0.5 - R2, to: 0.5 + R2, color: 'warn', alpha: 0.6 }], curves: [{ param: [`0.5 + ${R1 + R2}*cos(t)`, `${R1 + R2}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true }, seg([-1.3, 0], [1.3, 0], 'ink4', 1, true)], arrows: [{ from: [-1.2, 0.3], to: [-0.85, 0.3], color: 'accent' }], points: [lab(0.5, 0.42, 'contact circle', 'ink3', 0, -10)] }, t`Two molecules (radii drawn to scale with each other); the dashed circle is where the first one's centre touches the second.`, 'Two spheres and a dashed circle of radius equal to the sum of their radii'),
        };
      },
    }),
    mcq({
      id: 'isotropic', difficulty: 2,
      prompt: t`For hard-sphere scattering $d\sigma/d\Omega = R^2/4$, the same in every direction. Then the number of particles scattered into a band of angles between $\theta$ and $\theta + 1^\circ$:`,
      visual: gpic({ x: [0, 180], y: [0, 1.15], axesAt: 'edge', xlabel: 'scattering angle θ (degrees)', ylabel: 'relative', curves: [{ fn: '0.25*4', domain: [0, 180], color: 'accent', width: 2.2, label: 'dσ/dΩ (per steradian)', labelAt: 30, labelDx: 0, labelDy: -14 }] }, t`Hard-sphere scattering per steradian (scaled to 1): flat. The question is what it looks like per degree.`, 'A flat line over scattering angle'),
      choices: [t`Is largest near $90^\circ$, in proportion to $\sin\theta$, because the band of directions there is widest`, t`Is the same for every $\theta$`, t`Is largest near $0^\circ$, because most particles are deflected only slightly`, t`Is largest near $180^\circ$, because head-on collisions are most likely`],
      answer: 0,
      why: { 1: t`Equal *per steradian*, but a $1^\circ$ band near $90^\circ$ is a wide belt round the sphere of directions, $2\pi\sin\theta\,d\theta$, while near $0^\circ$ or $180^\circ$ it is a tiny cap.`, 2: t`Grazing rays ($b$ near $R$) do come out near $0^\circ$, but a thin ring at large $b$ carries no more beam than its share of solid angle.`, 3: t`Head-on means $b$ near 0: a tiny central disc of the beam.` },
      hints: [t`$dN \propto \dfrac{d\sigma}{d\Omega}\,d\Omega$ and $d\Omega = 2\pi\sin\theta\,d\theta$.`],
      teach: t`Isotropic means equal per steradian; per unit angle, scattering goes as $\sin\theta$.`,
      explain: t`$dN/d\theta \propto (d\sigma/d\Omega)\,2\pi\sin\theta$, a hump peaking at $90^\circ$. Detectors near $90^\circ$ collect most per degree; isotropy is a statement per steradian.`,
    }),
    num({
      id: 'count-rate', difficulty: 3,
      gen(r) {
        const I = r.pick([2, 5, 8]) * 1e9, mg = r.pick([0.5, 1, 2]), ds = r.pick([5, 12, 30]), A = r.pick([0.5, 1, 2]), d = r.pick([10, 20]);
        const nt = (mg * 1e-6 / 1e-4) / (197 * U), dO = (A * 1e-4) / (d * 1e-2) ** 2;
        const key = I * nt * ds * 1e-28 * dO;
        return {
          prompt: t`A beam of $${sci(I, 1)}$ alpha particles per second hits a gold foil of ${mg} mg/cm² (gold: 197 u per atom, $1\ \text{u} = 1.661\times10^{-27}$ kg). At the angle of interest, $d\sigma/d\Omega = ${ds}$ b/sr. A detector of area ${A} cm² sits ${d} cm from the foil, facing it. How many alphas per second does it count?`,
          answer: key, units: 's^-1', tol: { rel: 0.01 },
          errors: distinct([{ value: key * 1e4, feedback: t`Convert the foil to nuclei per **square metre**: $1\ \text{mg/cm}^2 = 10^{-2}\ \text{kg/m}^2$.` }, { value: key * d * 1e-2, feedback: t`The solid angle is the detector's area over the distance **squared**, $A/d^2$.` }], key),
          hints: [t`Rate $= I\,n_t\,\dfrac{d\sigma}{d\Omega}\,\Delta\Omega$, with $n_t$ the gold nuclei per unit area of foil.`, t`$n_t = (\text{mass per area})/(197\ \text{u})$ and $\Delta\Omega = A/d^2$.`],
          teach: t`Counts per second = beam rate × target nuclei per area × $d\sigma/d\Omega$ × detector solid angle.`,
          explain: t`$n_t = ${sci(mg * 1e-2, 2)}\ \text{kg/m}^2 / (197 \times 1.661\times10^{-27}\ \text{kg}) = ${sci(nt, 3)}\ \text{m}^{-2}$; $\Delta\Omega = ${A}\times10^{-4}/(${d}\times10^{-2})^2 = ${sci(dO, 3)}$ sr; rate $= ${sci(I, 1)}\times${sci(nt, 3)}\times${ds}\times10^{-28}\times${sci(dO, 3)} = ${sci(key, 3)}\ \text{s}^{-1}$. A thin foil scatters a tiny fraction of the beam — which is why each nucleus acts alone.`,
          visual: gpic({ x: [-4, 6], y: [-2.2, 2.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-0.05, -1.6], [-0.05, 1.6], 'gold', 4), seg([0, 0], [4.2, 2.1], 'ink4', 1, true), seg([3.95, 2.4], [4.45, 1.8], 'accent', 6)], arrows: [{ from: [-3.8, 0], to: [-0.3, 0], color: 'warn', width: 2.6 }, { from: [0.1, 0], to: [2.5, 1.25], color: 'warn', width: 1.4 }], points: [lab(-2, 0.35, 'beam', 'warn', 0, 0), lab(0, -1.9, 'foil', 'gold', 0, 0), lab(4.7, 2.3, 'detector', 'accent', 0, 0)] }, t`Beam, foil and detector, schematic and not to scale.`, 'A beam hits a thin foil and one scattered particle heads to a small detector'),
        };
      },
    }),
    expr({
      id: 'general-formula', difficulty: 3,
      prompt: t`A hypothetical soft target deflects particles by $\theta = \pi(1 - b/a)$ for $b < a$ (and not at all beyond). Use $\dfrac{d\sigma}{d\Omega} = \dfrac{b}{\sin\theta}\left|\dfrac{db}{d\theta}\right|$ to find $d\sigma/d\Omega$ as a function of $\theta$ and $a$. Type $\theta$ as theta.`,
      answer: 'a^2*(1 - theta/pi)/(pi*sin(theta))', answerTeX: t`\frac{a^2(1 - \theta/\pi)}{\pi\sin\theta}`,
      lhs: '\\frac{d\\sigma}{d\\Omega}', vars: { theta: [0.3, 2.8], a: [0.5, 2] },
      errors: [{ answer: 'a*(1 - theta/pi)/sin(theta)', feedback: t`You left out $|db/d\theta| = a/\pi$.` }, { answer: 'a^2*(1 - theta/pi)/pi', feedback: t`Divide by $\sin\theta$: the ring maps onto a cone whose solid angle is $2\pi\sin\theta\,d\theta$.` }],
      hints: [t`Invert: $b = a(1 - \theta/\pi)$, so $|db/d\theta| = a/\pi$.`, t`Multiply $b/\sin\theta$ by $a/\pi$.`],
      teach: t`Any deflection law $\theta(b)$ gives a cross section through $d\sigma/d\Omega = (b/\sin\theta)|db/d\theta|$.`,
      explain: t`$\dfrac{d\sigma}{d\Omega} = \dfrac{a(1 - \theta/\pi)}{\sin\theta}\cdot\dfrac{a}{\pi}$. Check: integrating over all $\Omega$ gives $\int_0^\pi \dfrac{a^2(1 - \theta/\pi)}{\pi\sin\theta}2\pi\sin\theta\,d\theta = \pi a^2$, the disc of radius $a$ — every particle aimed within $a$ is deflected.`,
      visual: gpic({ x: [0, 1.15], y: [0, 3.4], axesAt: 'edge', xlabel: 'b / a', ylabel: 'θ (rad)', curves: [{ fn: 'pi*(1 - x)', domain: [0, 1], color: 'accent', width: 2.4 }, { fn: '0', domain: [1, 1.15], color: 'accent', width: 2.4 }] }, t`The hypothetical deflection law $\theta(b)$: straight back at $b = 0$, undeflected for $b \ge a$.`, 'A straight line falling from pi at b = 0 to zero at b = a'),
    }),
    mcq({
      id: 'lab-frame', difficulty: 3,
      prompt: t`Two equal billiard balls collide elastically, one initially at rest. In the centre-of-mass frame the cue ball scatters through $\theta_{\text{cm}}$. What is its angle in the lab?`,
      visual: { type: 'mech-collide', params: { dim: 2, m1: 1, m2: 1, u1: 2, u2: 0, dir1: 0, b: 0.5, e: 1, view: 'snapshots', sliders: [], bars: [], values: false, readout: false }, caption: t`An elastic collision of equal pucks, one at rest (seen from above, in the lab). The two leave at right angles.` },
      choices: [t`$\theta_{\text{cm}}/2$ — so it can never exceed $90^\circ$ in the lab`, t`$\theta_{\text{cm}}$: the angle is the same in every frame`, t`$2\theta_{\text{cm}}$`, t`$180^\circ - \theta_{\text{cm}}$`],
      answer: 0,
      why: { 1: t`Changing frame adds the centre of mass's velocity to every velocity, which turns directions. Angles are frame-dependent.`, 2: t`That would put it beyond $180^\circ$ for most collisions.`, 3: t`That is the *target's* lab angle measured from the other side; the cue ball's is $\theta_{\text{cm}}/2$.` },
      hints: [t`In the CM frame each ball keeps its speed $u/2$ and turns through $\theta_{\text{cm}}$. Add back the CM velocity $u/2$ along the beam.`, t`Adding two vectors of equal length $u/2$ at angle $\theta_{\text{cm}}$ gives a vector along the bisector.`],
      teach: t`For equal masses $\theta_{\text{lab}} = \theta_{\text{cm}}/2$, so lab and CM cross sections differ by a Jacobian.`,
      explain: t`Lab velocity $= \vec V_{\text{cm}} + \vec v_{\text{cm}}$, two vectors of length $u/2$ at angle $\theta_{\text{cm}}$: their sum bisects them, at $\theta_{\text{cm}}/2$. So the lab cross section is the CM one times $d\Omega_{\text{cm}}/d\Omega_{\text{lab}}$ — and a hard sphere's isotropic CM scattering is **not** isotropic in the lab. For a heavy target (gold) the two frames nearly coincide.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-blackhole', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([1.4, 5, 10, 30, 62]);
        const m = (GM_SUN * M) / (C * C), key = (27 * Math.PI * m * m) / 1e6;
        return {
          prompt: t`Light passing a black hole of mass $M$ is captured if its impact parameter is below $b_c = 3\sqrt3\,GM/c^2$ (from the photon's effective potential in Schwarzschild spacetime). What is the capture cross section, in $\text{km}^2$, of a ${M}-solar-mass black hole? ($GM_\odot/c^2 = 1.477$ km.)`,
          answer: key, units: 'km^2', tol: { rel: 0.01 },
          errors: distinct([{ value: (Math.PI * (2 * m) ** 2) / 1e6, feedback: t`That is the area of the horizon's silhouette, $\pi r_s^2$. Light is captured from further out: $b_c = 3\sqrt3\,GM/c^2 \approx 2.6\,r_s$.` }, { value: (3 * Math.sqrt(3) * Math.PI * m * m) / 1e6, feedback: t`$\sigma = \pi b_c^2 = \pi(3\sqrt3)^2(GM/c^2)^2 = 27\pi(GM/c^2)^2$: square the whole $b_c$.` }, { value: (27 * Math.PI * m) / 1e3, feedback: t`Square $GM/c^2$ too.` }], key),
          hints: [t`Every photon with $b < b_c$ is captured: $\sigma = \pi b_c^2$.`, t`$\sigma = 27\pi(GM/c^2)^2$ with $GM/c^2 = ${M}\times1.477$ km.`],
          teach: t`A capture cross section is the area of the disc of impact parameters that do not escape.`,
          explain: t`$GM/c^2 = ${sci(m / 1e3, 4)}$ km, $b_c = ${sci((3 * Math.sqrt(3) * m) / 1e3, 4)}$ km, $\sigma = 27\pi(${sci(m / 1e3, 4)})^2 = ${sci(key, 3)}\ \text{km}^2$ — about $6.75$ times the horizon's own disc. It is also the size of the black hole's **shadow**: the dark disc imaged by the Event Horizon Telescope has radius $b_c$ (as seen from far away), not $r_s$.`,
          visual: gpic({ x: [-3.2, 3.2], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(0, 0.148 - x^2))', lower: '-sqrt(max(0, 0.148 - x^2))', from: -0.385, to: 0.385, color: 'void', alpha: 1 }], curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'warn', width: 1.4, dash: true }, seg([-3.2, 1.25], [3.2, 1.25], 'accent', 1.6), seg([-3.2, 0.6], [0, 0.6], 'gold', 1.6)], points: [lab(1.6, 1.43, 'escapes', 'accent', 0, 0), lab(-2.4, 0.42, 'captured', 'gold', 0, 0), lab(1.25, -0.9, 'capture radius', 'warn', 0, 0)] }, t`Side view, schematic: a ray whose impact parameter is less than $b_c$ (the dashed circle's radius) is captured; one aimed further out escapes. The black disc is the horizon, radius $2GM/c^2$, to the same scale. The rays' bending is not drawn.`, 'A small black disc inside a larger dashed circle, with two straight rays passing'),
        };
      },
    }),
    num({
      id: 'cp-fraction', difficulty: 2,
      gen(r) {
        const A = r.pick([1, 2, 4]), d = r.pick([10, 20, 40]);
        const dO = (A * 1e-4) / (d * 1e-2) ** 2, key = (100 * dO) / (4 * Math.PI);
        return {
          prompt: t`Neutrons scatter off a nucleus treated as a hard sphere. A detector of area ${A} cm² is ${d} cm away. What percentage of the **scattered** neutrons does it catch, whatever angle it is placed at?`,
          answer: key, units: '%', tol: { rel: 0.01 },
          errors: distinct([{ value: (100 * dO) / (2 * Math.PI), feedback: t`The whole sphere of directions is $4\pi$ sr.` }, { value: (100 * dO) / Math.PI, feedback: t`Divide the total cross section $\pi R^2$ into $(R^2/4)\Delta\Omega$: the fraction is $\Delta\Omega/4\pi$.` }], key),
          hints: [t`Fraction $= \dfrac{(d\sigma/d\Omega)\Delta\Omega}{\sigma} = \dfrac{(R^2/4)\Delta\Omega}{\pi R^2}$.`],
          teach: t`Isotropic scattering sends a fraction $\Delta\Omega/4\pi$ of the scattered particles into any solid angle $\Delta\Omega$.`,
          explain: t`$\Delta\Omega = ${A}\ \text{cm}^2/(${d}\ \text{cm})^2 = ${sci(dO, 3)}$ sr, and $\Delta\Omega/4\pi = ${sci(key / 100, 3)} = ${sci(key, 3)}\%$, at any angle — the signature of hard-sphere scattering (true for slow neutrons in the CM frame, where only the head-on, s-wave part of the scattering counts).`,
          visual: bouncePic([0.15, 0.35, 0.55, 0.75, 0.92], t`A hard sphere bouncing a beam (one plane of it); the outgoing rays fill all directions evenly per steradian.`),
        };
      },
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: t`A nucleus has a geometric size of about 7 fm, but its total cross section for some reaction is $10^4$ b — far more than its area. What does that say?`,
      visual: bouncePic([0.3, 0.6, 0.9], t`The hard-sphere picture, in which the cross section equals the target's shadow.`),
      choices: [t`A cross section is an effective area — the reaction rate divided by the incoming flux — and need not equal the target's physical size`, t`The measurement must be wrong`, t`The nucleus must be $10^4$ times bigger than thought`, t`Cross sections are always larger than geometric areas`],
      answer: 0,
      why: { 1: t`Such values are measured routinely: slow neutrons on xenon-135 or gadolinium have cross sections of tens of thousands to millions of barns.`, 2: t`Size is measured independently (by electron scattering) and is a few fm.`, 3: t`They can be much smaller too: neutrinos have cross sections of order $10^{-19}$ b.` },
      hints: [t`What does a cross section measure: a size, or a rate per unit flux?`],
      teach: t`A cross section is defined by counting: rate divided by flux, an effective area.`,
      explain: t`$\sigma$ is defined operationally: (events per second) ÷ (particles per second per area). For a hard sphere this equals its shadow; for long-range forces or wave effects it can be enormously larger (or smaller). See [Q-values and cross sections](#/lesson/phys3710.N3.1).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 14: collision theory', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. Goldstein, C. Poole and J. Safko, Classical Mechanics, 3rd ed. (2002), §3.10: scattering in a central force field', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000006389' },
    { label: 'S. Carroll, Spacetime and Geometry (2004), ch. 5: geodesics of Schwarzschild', url: 'https://doi.org/10.1017/9781108770385' },
  ],
});
