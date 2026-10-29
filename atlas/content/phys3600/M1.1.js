// Coulomb's law and continuous distributions (Griffiths §2.1–2.2.1): the
// field as an integral over ρ(r′) with the separation vector set up
// carefully, the on-axis fields of a ring, a disk and a finite segment, and
// every one checked against its limits (far: a point charge; near: a line or
// a plane). Builds on phys2220.E2.3, which introduces dq and the ring.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { KC, EPS0, ringE, diskE, segE, scene3, sf, pickExpr, is } from './_toolkit.js';

const t = String.raw;
const PI = Math.PI;

// On-axis fields in units of kQ/a², as functions of u = z/a (s/a for the segment of half-length a)
const U = '(10^x)';
const RING = `${U}/(${U}^2 + 1)^1.5`;
const DISK = `2/(sqrt(${U}^2 + 1)*(sqrt(${U}^2 + 1) + ${U}))`;
const SEG = `1/(${U}*sqrt(${U}^2 + 1))`;
const NEAR = [`${U}`, '2', `1/${U}`];
const logE = (e) => `log10(${e})`;

/** Ring of radius a seen edge-on (a vertical bar), its axis, a field point P at distance z, and the two dE arrows from the top and bottom of the ring. */
function ringSide(z, a, { caption, sum = false } = {}) {
  const L = 0.9, d = Math.hypot(z, a), ux = z / d, uy = a / d;
  return {
    type: 'graph',
    params: {
      x: [-0.6, z + 1.4], y: [-a - 0.5, a + 0.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ fn: '0', domain: [-0.5, z + 1.3], color: 'ink3', dash: true }],
      arrows: [
        { from: [0, -a], to: [0, a], color: 'warn', width: 5 },
        { from: [z, 0], to: [+(z + L * ux).toFixed(3), +(-L * uy).toFixed(3)], color: 'accent', label: 'dE (top)', labelDx: 4, labelDy: 12 },
        { from: [z, 0], to: [+(z + L * ux).toFixed(3), +(L * uy).toFixed(3)], color: 'accent', label: 'dE (bottom)', labelDx: 4, labelDy: -6 },
        { from: [0, a], to: [z, 0], color: 'ink3', dash: true },
        { from: [0, -a], to: [z, 0], color: 'ink3', dash: true },
        ...(sum ? [{ from: [z, 0], to: [+(z + 2 * L * ux).toFixed(3), 0], color: 'gold', width: 3, label: 'sum', labelDx: 4 }] : []),
      ],
      points: [{ x: z, y: 0, color: 'gold', r: 5, label: 'P', labelDx: -6, labelDy: 16 }, { x: 0, y: a, r: 0, label: 'ring (edge-on)', labelDx: 8, labelDy: -4 }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys3600.M1.1',
  title: 'Coulomb’s law and continuous distributions',
  minutes: 15, difficulty: 3,
  equation: t`\vec E(\vec r) = \frac{1}{4\pi\varepsilon_0}\int\frac{\rho(\vec r\,')}{\mathcal R^2}\,\hat{\mathcal R}\,d\tau'`,
  intro: t`Coulomb’s law for one point charge, summed over many and taken to the limit, is the integral above: chop the charge into pieces $dq = \rho\,d\tau'$, give each the inverse-square field it would make alone, and add the vectors. For a line charge $dq = \lambda\,dl'$, for a surface charge $dq = \sigma\,da'$. You met this in [Physics II](#/lesson/phys2220.E2.3). Here the job is to do it properly: set up $\vec{\mathcal R} = \vec r - \vec r\,'$ from the source point to the field point, use symmetry to kill components **before** integrating, and then check every answer against its limits. Far away, any finite blob of charge must look like a point charge; close up, a big disk must look like an infinite plane and a long rod like an infinite line.`,
  symbols: [
    { tex: '\\vec E(\\vec r)', text: t`the electric field at the field point $\vec r$, in N/C (= V/m)` },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}\ \text{C}^2/(\text{N·m}^2)$; $\tfrac{1}{4\pi\varepsilon_0} = 8.988\times10^{9}\ \text{N·m}^2/\text{C}^2$` },
    { tex: '\\rho(\\vec r\\,\')', text: t`the charge density at the source point $\vec r\,'$, in C/m³ (for lines and surfaces, $\lambda$ in C/m and $\sigma$ in C/m²)` },
    { tex: '\\vec{\\mathcal R} = \\vec r - \\vec r\\,\'', text: t`the separation vector from the source point to the field point; $\mathcal R$ its length, $\hat{\mathcal R}$ its direction` },
    { tex: 'd\\tau\'', text: t`a volume element at the source; the prime marks what is integrated over` },
  ],
  why: t`Most real charge is spread out — on electrodes, plates, grids and beams — and the limits are how you know an integral came out right.`,
  visual: {
    type: 'graph',
    title: 'Three shapes, two limits each',
    lead: t`On log–log axes, the on-axis field of a ring, a disk or a rod (blue) against distance, both scaled to the object’s size $a$. The dashed grey line is a point charge $Q$; the dashed violet line is the near-field limit. A power law is a straight line here, and its slope is the power.`,
    tasks: [
      t`Ring: far away its field hugs the point-charge line (slope $-2$). Close to the centre it grows **linearly** with $z$ (slope $+1$): at the centre the pieces cancel.`,
      t`Disk: close up the field is flat — an infinite plane’s $\sigma/2\varepsilon_0$ — and far off it falls onto the point-charge line.`,
      t`Rod: close up it falls with slope $-1$ like an infinite line, $\lambda/2\pi\varepsilon_0 s$. Slide the probe out to 10 sizes and read the ratio to the point charge: within a percent.`,
    ],
    params: {
      x: [-2, 2], y: [-4, 1.5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'distance / size', ylabel: 'E / (kQ/a²)',
      choices: [{ key: 'g', label: 'Charge', options: [[0, 'Ring, on its axis'], [1, 'Disk, on its axis'], [2, 'Rod, on its bisector']], value: 1, explain: t`A ring of radius $a$, a uniform disk of radius $a$, or a uniform rod of length $2a$, each of total charge $Q$. Distance is $z$ along the axis (for the rod, $s$ out from its middle).` }],
      sliders: [{ key: 'u', label: t`Probe distance (in units of $a$)`, min: 0.01, max: 100, value: 3, step: 0.01, logScale: true, explain: 'Where along the axis to compare the exact field with the point-charge formula.' }],
      curves: [
        { fn: '-2*x', color: 'ink3', dash: true, width: 1.6, label: 'point charge', labelAt: -1.7, labelDx: 8 },
        { fn: logE(NEAR[0]), color: 'violet', dash: true, width: 1.6, domain: [-2, 0.3], when: is('g', 0) },
        { fn: logE(NEAR[1]), color: 'violet', dash: true, width: 1.6, domain: [-2, 0.6], when: is('g', 1) },
        { fn: logE(NEAR[2]), color: 'violet', dash: true, width: 1.6, domain: [-2, 0.6], when: is('g', 2) },
        { fn: logE(RING), color: 'accent', width: 2.6, when: is('g', 0) },
        { fn: logE(DISK), color: 'accent', width: 2.6, when: is('g', 1) },
        { fn: logE(SEG), color: 'accent', width: 2.6, when: is('g', 2) },
      ],
      points: [{ x: 'log10(u)', y: `log10(${pickExpr('g', [RING, DISK, SEG]).replace(/10\^x/g, 'u')})`, color: 'gold', r: 5 }],
      legend: [{ label: 'exact on-axis field', color: 'accent' }, { label: 'point charge Q', color: 'ink3', dash: true }, { label: 'near limit (line, plane or linear)', color: 'violet', dash: true }],
      legendAt: 'bl',
      readouts: [
        { label: t`$E\,/\,(kQ/a^2)$`, expr: pickExpr('g', [RING, DISK, SEG]).replace(/10\^x/g, 'u'), digits: 4 },
        { label: t`$E\,/\,E_{\text{point}}$`, expr: `u^2*(${pickExpr('g', [RING, DISK, SEG]).replace(/10\^x/g, 'u')})`, digits: 4 },
      ],
    },
    caption: t`Exact formulas, drawn on logarithmic axes; $k = 1/4\pi\varepsilon_0$. Every object has the same total charge $Q$; only points on the axis are shown, where symmetry makes the field point along it.`,
  },
  example: {
    prompt: t`Find the field on the axis of a uniformly charged disk (surface charge $\sigma$, radius $a$) at height $z > 0$; check both limits; then evaluate it for $\sigma = 20$ nC/m², $a = 10$ cm, $z = 5$ cm.`,
    visual: scene3({ range: 1.8, curves: [0.4, 0.8, 1.2].map((s) => ({ param: [`${s}*cos(t)`, `${s}*sin(t)`, '0'], t: [0, 2 * PI], color: 'warn' })), points: [{ at: [0, 0, 1.4], color: 'gold', label: 'P' }], vectors: [{ from: [0.8, 0, 0], to: [0, 0, 1.4], color: 'ink3', label: '\\vec{\\mathcal R}' }, { from: [0, 0, 1.4], to: [-0.35, 0, 2.0], color: 'accent', label: 'd\\vec E' }, { from: [0, 0, 1.4], to: [0.35, 0, 2.0], color: 'accent' }] }, t`The disk cut into rings (three drawn). From one ring, at P: $\vec{\mathcal R}$ from a source point to P, and the fields of two opposite pieces, whose sideways parts cancel. Drag to rotate.`),
    steps: [
      { label: 'Slice into rings', text: t`A ring of radius $s'$ and width $ds'$ holds $dq = \sigma\,2\pi s'\,ds'$. Every piece of it is a distance $\mathcal R = \sqrt{z^2 + s'^2}$ from P.` },
      { label: 'Symmetry first', text: t`Opposite pieces cancel sideways, so only the $z$-components survive: each piece contributes $\tfrac{1}{4\pi\varepsilon_0}\tfrac{dq}{\mathcal R^2}\cos\alpha$ with $\cos\alpha = z/\mathcal R$. One ring gives $dE_z = \tfrac{1}{4\pi\varepsilon_0}\tfrac{z\,dq}{(z^2 + s'^2)^{3/2}}$.` },
      { label: 'Integrate', text: t`$E_z = \dfrac{\sigma z}{2\varepsilon_0}\displaystyle\int_0^a\frac{s'\,ds'}{(z^2 + s'^2)^{3/2}} = \dfrac{\sigma}{2\varepsilon_0}\left[1 - \dfrac{z}{\sqrt{z^2 + a^2}}\right]$.` },
      { label: 'Near limit', text: t`For $a \to \infty$ (or $z \ll a$) the bracket tends to $1$: $E = \sigma/2\varepsilon_0$, the infinite plane ✓.` },
      { label: 'Far limit', text: t`For $z \gg a$, $\tfrac{z}{\sqrt{z^2 + a^2}} = \left(1 + \tfrac{a^2}{z^2}\right)^{-1/2} \approx 1 - \tfrac{a^2}{2z^2}$, so $E \approx \tfrac{\sigma}{2\varepsilon_0}\cdot\tfrac{a^2}{2z^2} = \tfrac{1}{4\pi\varepsilon_0}\tfrac{\sigma\pi a^2}{z^2}$: a point charge $Q = \sigma\pi a^2$ ✓.` },
      { label: 'Numbers', text: t`$\tfrac{\sigma}{2\varepsilon_0} = ${nice(sf(20e-9 / (2 * EPS0), 4))}$ N/C and $1 - \tfrac{5}{\sqrt{125}} = ${nice(sf(1 - 5 / Math.sqrt(125), 4))}$, so $E \approx ${nice(sf(diskE(20e-9, 0.1, 0.05), 3))}$ N/C, pointing away from the disk.` },
    ],
    answer: t`$E_z = \dfrac{\sigma}{2\varepsilon_0}\left[1 - \dfrac{z}{\sqrt{z^2 + a^2}}\right] \approx ${nice(sf(diskE(20e-9, 0.1, 0.05), 3))}$ N/C here; a plane close up, a point charge far away.`,
  },
  practice: [
    num({
      id: 'ring-axis', difficulty: 2,
      gen(r) {
        const Q = r.pick([2, 3, 5, 8]), a = r.pick([3, 4, 6]), z = r.pick([2, 4, 5, 8]);
        const ans = ringE(Q * 1e-9, a / 100, z / 100);
        return {
          prompt: t`A ring of radius ${a} cm carries ${Q} nC spread uniformly. Find the field on its axis, ${z} cm from its centre.`,
          visual: ringSide(z / a * 1.2, 1.2, { caption: t`The ring seen edge-on (red bar), its axis (dashed) and the point P. The fields from the top and bottom of the ring are drawn: their sideways parts cancel. Not to scale.` }),
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: (KC * Q * 1e-9) / (z / 100) ** 2, feedback: t`That treats the ring as a point charge at its centre, which is only right far away. Every piece is $\sqrt{z^2 + a^2}$ away, and only the axial part of its field survives.` },
            { value: (KC * Q * 1e-9) / ((z / 100) ** 2 + (a / 100) ** 2), feedback: t`You added the magnitudes of the pieces’ fields. They point in different directions; keep only the $z$-components, each times $\cos\alpha = z/\sqrt{z^2 + a^2}$.` },
          ],
          hints: [t`Every piece is the same distance $\mathcal R = \sqrt{z^2 + a^2}$ away, and by symmetry only $z$-components survive.`, t`$E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Qz}{(z^2 + a^2)^{3/2}}$. Work in metres and coulombs.`],
          teach: t`On a ring’s axis, $E = \tfrac{1}{4\pi\varepsilon_0}\tfrac{Qz}{(z^2 + a^2)^{3/2}}$: the inverse-square law times the cosine that survives the symmetry.`,
          explain: t`$E = (8.988\times10^{9})\dfrac{(${Q}\times10^{-9})(${z / 100})}{((${z / 100})^2 + (${a / 100})^2)^{3/2}} \approx ${tex(ans, 3)}$ N/C, along the axis away from the ring. A point charge would give ${nice(sf((KC * Q * 1e-9) / (z / 100) ** 2, 3))} N/C.`,
        };
      },
    }),
    num({
      id: 'ring-max', difficulty: 2,
      gen(r) {
        const a = r.pick([4, 6, 10, 12, 15]);
        const ans = a / Math.SQRT2;
        return {
          prompt: t`At what distance from its centre, along its axis, is the field of a ring of radius ${a} cm strongest?`,
          visual: { type: 'graph', params: { x: [-1.3, 1.3], y: [-2.6, 1.2], xlog: true, ylog: true, aspect: 'wide', xlabel: 'z / a', ylabel: 'E / (kQ/a²)', curves: [{ fn: 'x', color: 'violet', dash: true, domain: [-1.3, 0.3], label: 'near: E ∝ z', labelAt: -1.1, labelDy: -12 }, { fn: '-2*x', color: 'ink3', dash: true, domain: [-0.3, 1.3], label: 'far: E ∝ 1/z²', labelAt: 0.7, labelDy: -12 }] }, caption: t`The ring’s field grows like $z$ near the centre and falls like $1/z^2$ far away, so it must peak in between. Only the two limits are drawn.` },
          answer: ans, units: 'cm', tol: { rel: 0.005 },
          errors: [
            { value: a, feedback: t`Set $dE/dz = 0$ rather than guessing: the peak is a little inside $z = a$.` },
            { value: a / 2, feedback: t`Check the derivative: $\tfrac{d}{dz}\tfrac{z}{(z^2 + a^2)^{3/2}} = \tfrac{a^2 - 2z^2}{(z^2 + a^2)^{5/2}}$.` },
          ],
          hints: [t`Maximize $f(z) = \dfrac{z}{(z^2 + a^2)^{3/2}}$.`, t`$f'(z) = \dfrac{(z^2 + a^2) - 3z^2}{(z^2 + a^2)^{5/2}} = 0$ gives $a^2 = 2z^2$.`],
          teach: t`Between a near-field that grows and a far-field that falls there is a maximum; for the ring it is at $z = a/\sqrt2$.`,
          explain: t`$a^2 - 2z^2 = 0$ gives $z = a/\sqrt2 = ${a}/\sqrt2 \approx ${nice(sf(ans, 4))}$ cm. Electrostatic ion traps and some ion-thruster grids exploit exactly this shape of on-axis field.`,
        };
      },
    }),
    num({
      id: 'disk-axis', difficulty: 2,
      gen(r) {
        const s = r.pick([10, 25, 40]), a = r.pick([5, 8, 12]), z = r.pick([2, 5, 10, 20]);
        const ans = diskE(s * 1e-9, a / 100, z / 100), plane = (s * 1e-9) / (2 * EPS0), Q = s * 1e-9 * PI * (a / 100) ** 2;
        return {
          prompt: t`A disk of radius ${a} cm carries a uniform ${s} nC/m². Find the field on its axis ${z} cm above its centre.`,
          visual: { type: 'graph', params: { x: [-a * 1.3, a * 1.3], y: [-2, Math.max(z, a) * 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0', domain: [-a, a], color: 'warn', width: 6 }, { param: ['0', 't'], t: [0, Math.max(z, a) * 1.2], color: 'ink3', dash: true }], points: [{ x: 0, y: z, color: 'gold', r: 5, label: `P, ${z} cm up`, labelDx: 8 }, { x: a, y: 0, r: 0, label: `${a} cm`, labelDx: -16, labelDy: 18 }] }, caption: t`The disk edge-on (red) and the point P on its axis. To scale.` },
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: plane, feedback: t`That is the infinite-plane value $\sigma/2\varepsilon_0$, the near limit. At ${z} cm above a ${a} cm disk the bracket $1 - z/\sqrt{z^2 + a^2}$ is not close to 1.` },
            { value: (KC * Q) / (z / 100) ** 2, feedback: t`That is the point-charge value, the far limit. Here $z$ is not much larger than $a$.` },
          ],
          hints: [t`$E = \dfrac{\sigma}{2\varepsilon_0}\left[1 - \dfrac{z}{\sqrt{z^2 + a^2}}\right]$.`, t`$\sigma/2\varepsilon_0 = ${nice(sf(plane, 4))}$ N/C; now the bracket.`],
          teach: t`The disk’s on-axis field is the plane’s $\sigma/2\varepsilon_0$ times a geometric factor that falls from 1 to 0 as you move away.`,
          explain: t`$\tfrac{\sigma}{2\varepsilon_0} = ${nice(sf(plane, 4))}$ N/C and $1 - \tfrac{${z}}{\sqrt{${z}^2 + ${a}^2}} = ${nice(sf(1 - z / Math.hypot(z, a), 4))}$, so $E \approx ${nice(sf(ans, 3))}$ N/C. For comparison: plane ${nice(sf(plane, 3))} N/C, point charge ${nice(sf((KC * Q) / (z / 100) ** 2, 3))} N/C — the exact value always lies below both.`,
        };
      },
    }),
    mcq({
      id: 'sep-vector', difficulty: 2,
      prompt: t`A ring of radius $a$ lies in the $xy$-plane, centred on the origin. A piece of it sits at $\vec r\,' = (a\cos\phi',\ a\sin\phi',\ 0)$, and you want the field at $\vec r = (0, 0, z)$. What is $\vec{\mathcal R}$ in Coulomb’s law?`,
      visual: scene3({ range: 1.8, curves: [{ param: ['cos(t)', 'sin(t)', '0'], t: [0, 2 * PI], color: 'warn' }], points: [{ at: [0.766, 0.643, 0], color: 'warn', label: "\\vec r\\,'" }, { at: [0, 0, 1.3], color: 'gold', label: '\\vec r' }], vectors: [{ to: [0.766, 0.643, 0], color: 'ink3', dash: true }, { to: [0, 0, 1.3], color: 'ink3', dash: true }] }, t`The ring, a source point $\vec r\,'$ on it and the field point $\vec r$ on the axis, with their position vectors (dashed). Drag to rotate.`),
      choices: [t`$(-a\cos\phi',\ -a\sin\phi',\ z)$`, t`$(a\cos\phi',\ a\sin\phi',\ -z)$`, t`$(0,\ 0,\ z)$`, t`$(a\cos\phi',\ a\sin\phi',\ z)$`],
      answer: 0,
      why: {
        1: t`That is $\vec r\,' - \vec r$, pointing from the field point to the source. Coulomb’s field points **away** from a positive source, along $\vec r - \vec r\,'$.`,
        2: t`That is the field point’s position, measured from the ring’s centre, not from the piece of charge.`,
        3: t`That adds the positions. The separation is a difference: field point minus source point.`,
      },
      hints: [t`$\vec{\mathcal R} = \vec r - \vec r\,'$: field point minus source point.`],
      teach: t`$\vec{\mathcal R} = \vec r - \vec r\,'$ runs from the source to the field point; swapping them flips every field.`,
      explain: t`$\vec{\mathcal R} = (0, 0, z) - (a\cos\phi', a\sin\phi', 0) = (-a\cos\phi', -a\sin\phi', z)$, with $\mathcal R = \sqrt{a^2 + z^2}$. Its $x$- and $y$-parts integrate to zero round the ring ($\int_0^{2\pi}\cos\phi'\,d\phi' = 0$): that is the symmetry argument, done honestly — with $\hat x$ and $\hat y$, which, unlike $\hat s$, are constant and may leave the integral.`,
    }),
    match({
      id: 'limits', difficulty: 2,
      prompt: t`Match each situation to the field it must approach. ($Q$ is the total charge; $k = 1/4\pi\varepsilon_0$.)`,
      left: [t`Ring of radius $a$, far away ($z \gg a$)`, t`Disk of radius $a$, close up ($z \ll a$)`, t`Rod of length $2L$, close to its middle ($s \ll L$)`, t`Ring of radius $a$, near its centre ($z \ll a$)`],
      right: ['kQ/z², a point charge', 'σ/2ε₀, an infinite plane', 'λ/(2πε₀ s), an infinite line', 'kQz/a³, growing linearly', 'zero'],
      answer: [0, 1, 2, 3],
      visual: { type: 'graph', params: { x: [-2, 2], y: [-4, 1.5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'distance / size', ylabel: 'E / (kQ/a²)', curves: [{ fn: logE(RING), color: 'accent', width: 2.2 }, { fn: logE(DISK), color: 'teal', width: 2.2 }, { fn: logE(SEG), color: 'violet', width: 2.2 }, { fn: '-2*x', color: 'ink3', dash: true }], legend: [{ label: 'ring', color: 'accent' }, { label: 'disk', color: 'teal' }, { label: 'rod', color: 'violet' }, { label: 'point charge', color: 'ink3', dash: true }], legendAt: 'bl' }, caption: 'The three exact on-axis fields on log–log axes, all with the same total charge. Read the slopes at each end.' },
      hints: ['Far from anything finite, the whole charge looks like a point.', 'Close up, a big object looks infinite; at the very centre of a ring the pieces cancel.'],
      teach: 'Every finite distribution looks like a point charge far away; close up, the nearest infinite idealization takes over.',
      explain: t`Ring far: $\tfrac{kQz}{(z^2 + a^2)^{3/2}} \to \tfrac{kQ}{z^2}$. Disk close: $\sigma/2\varepsilon_0$. Rod close: $\tfrac{2k\lambda L}{s\sqrt{s^2 + L^2}} \to \tfrac{2k\lambda}{s} = \tfrac{\lambda}{2\pi\varepsilon_0 s}$. Ring near centre: $\tfrac{kQz}{a^3}$, zero at the centre itself, where opposite pieces cancel.`,
    }),
    num({
      id: 'annulus', difficulty: 3,
      gen(r) {
        const s = r.pick([15, 30, 50]), b = r.pick([2, 3, 4]), a = r.pick([8, 10, 12]), z = r.pick([3, 5, 6]);
        const E = (R) => (s * 1e-9) / (2 * EPS0) * (z / 100) / Math.hypot(z / 100, R / 100);
        const ans = E(b) - E(a);
        return {
          prompt: t`A washer-shaped plate — a disk of radius ${a} cm with a hole of radius ${b} cm cut from its centre — carries a uniform ${s} nC/m². Find the field on its axis ${z} cm from its centre.`,
          visual: { type: 'graph', params: { x: [-a * 1.3, a * 1.3], y: [-2, z * 1.6 + 2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0', domain: [-a, -b], color: 'warn', width: 6 }, { fn: '0', domain: [b, a], color: 'warn', width: 6 }, { param: ['0', 't'], t: [0, z * 1.5], color: 'ink3', dash: true }], points: [{ x: 0, y: z, color: 'gold', r: 5, label: 'P', labelDx: 8 }] }, caption: 'The washer edge-on (red), with its hole, and the point P on the axis. To scale.' },
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: diskE(s * 1e-9, a / 100, z / 100), feedback: 'That is the full disk. Subtract the field of the missing hole, a disk of the same σ and radius equal to the hole’s.' },
            { value: diskE(s * 1e-9, a / 100, z / 100) + diskE(s * 1e-9, b / 100, z / 100), feedback: 'The hole is charge that is not there: superpose the full disk with a disk of charge density −σ.' },
          ],
          hints: [t`Superposition: washer = full disk of radius ${a} cm **minus** a disk of radius ${b} cm with the same $\sigma$.`, t`$E = \dfrac{\sigma}{2\varepsilon_0}\left[\dfrac{z}{\sqrt{z^2 + b^2}} - \dfrac{z}{\sqrt{z^2 + a^2}}\right]$.`],
          teach: 'A hole is a patch of negative charge laid over a whole object: superpose, and reuse a field you already know.',
          explain: t`$E = \tfrac{\sigma}{2\varepsilon_0}\left[\tfrac{${z}}{\sqrt{${z * z + b * b}}} - \tfrac{${z}}{\sqrt{${z * z + a * a}}}\right] = ${nice(sf((s * 1e-9) / (2 * EPS0), 4))}\times${nice(sf(z / Math.hypot(z, b) - z / Math.hypot(z, a), 4))} \approx ${nice(sf(ans, 3))}$ N/C. As $b \to 0$ it becomes the full disk; as $z \to 0$ it vanishes, since the centre of the hole is surrounded symmetrically.`,
        };
      },
    }),
    mcq({
      id: 'error-pull-out', difficulty: 3, kind: 'error',
      prompt: t`A student computes the field on a ring’s axis: “Every piece is $\mathcal R = \sqrt{z^2 + a^2}$ away, so $E = \displaystyle\int\frac{k\,dq}{\mathcal R^2} = \frac{kQ}{z^2 + a^2}$.” What is wrong?`,
      visual: ringSide(1.6, 1.2, { sum: true, caption: t`Two opposite pieces of the ring and their fields at P: the sideways parts cancel, and only the axial parts (gold) add up. Not to scale.` }),
      choices: [
        t`They added magnitudes; the pieces’ fields point in different directions, so only the axial parts, each $\times\,z/\mathcal R$, add`,
        t`$\mathcal R$ should be $z$, the distance to the ring’s centre`,
        t`Nothing: the result is correct`,
        t`The integral should be over the ring’s area, $\pi a^2$`,
      ],
      answer: 0,
      why: {
        1: t`The distance from P to each piece really is $\sqrt{z^2 + a^2}$; using $z$ treats the ring as a point at its centre.`,
        2: t`Check the limit $z = 0$: their formula gives $kQ/a^2$, but at the centre the pieces cancel exactly and $E = 0$.`,
        3: 'A ring has no area; its charge is on its circumference, dq = λ a dφ′.',
      },
      hints: ['Test their formula at the centre of the ring, z = 0.', t`$\hat{\mathcal R}$ is different for each piece; it cannot come out of the integral.`],
      teach: t`$\hat{\mathcal R}$ changes from piece to piece: add vectors, or components, never magnitudes.`,
      explain: t`The correct sum keeps $\hat{\mathcal R}$ inside: only $\cos\alpha = z/\mathcal R$ of each piece’s field survives, giving $\tfrac{kQz}{(z^2 + a^2)^{3/2}}$. Their formula fails the $z = 0$ check (it gives $kQ/a^2$ instead of $0$) and the far check (it is right only to leading order).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-segment', difficulty: 2,
      gen(r) {
        const Q = r.pick([4, 6, 10]), L = r.pick([5, 10, 15]), s = r.pick([3, 5, 8, 12]);
        const lam = (Q * 1e-9) / (2 * L / 100), ans = segE(lam, L / 100, s / 100);
        return {
          prompt: t`A rod of length ${2 * L} cm carries ${Q} nC spread uniformly. Find the field ${s} cm from its midpoint, on the line through the midpoint perpendicular to the rod.`,
          visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-L - 8, L + 8], y: [-4, s + 5], rods: [{ x1: -L, y1: 0, x2: L, y2: 0, Q }], fieldLines: true, arrows: false, probe: { x: 0, y: s, label: 'P' }, readouts: [], static: true }, caption: 'The rod and the point P on its perpendicular bisector, with field lines in the plane. To scale.' },
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: (KC * Q * 1e-9) / (s / 100) ** 2, feedback: 'That is the point-charge limit, right only far from the rod.' },
            { value: lam / (2 * PI * EPS0 * s / 100), feedback: 'That is the infinite-line limit, right only very close to the rod.' },
          ],
          hints: [t`By symmetry only the perpendicular component survives. For a rod of half-length $L$: $E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{2\lambda L}{s\sqrt{s^2 + L^2}}$.`, t`$\lambda = Q/2L$; work in metres.`],
          teach: t`On a rod’s bisector, $E = \tfrac{1}{4\pi\varepsilon_0}\tfrac{Q}{s\sqrt{s^2 + L^2}}$, between the line and point-charge limits.`,
          explain: t`$E = \tfrac{kQ}{s\sqrt{s^2 + L^2}} = \tfrac{(8.988\times10^{9})(${Q}\times10^{-9})}{(${s / 100})\sqrt{${s / 100}^2 + ${L / 100}^2}} \approx ${tex(ans, 3)}$ N/C. Point charge: ${nice(sf((KC * Q * 1e-9) / (s / 100) ** 2, 3))}; infinite line: ${nice(sf(lam / (2 * PI * EPS0 * s / 100), 3))} N/C.`,
        };
      },
    }),
    num({
      id: 'cp-array', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([2, 3.5, 5]), [X, Xt] = r.pick([[0.01, '1%'], [0.001, '0.1%'], [0.02, '2%']]);
        const f = (u) => 2 * u * u * (1 / (Math.sqrt(u * u + 1) * (Math.sqrt(u * u + 1) + u)));
        let lo = 0.5, hi = 1e4;
        for (let i = 0; i < 200; i++) { const m = Math.sqrt(lo * hi); if (f(m) < 1 - X) lo = m; else hi = m; }
        const ans = a * Math.sqrt(lo * hi);
        return {
          prompt: t`In geostationary orbit, a spacecraft’s flat circular antenna of radius ${a} m charges up uniformly. Out along its axis, how far from its centre must you be for the exact field to come within ${Xt} of the point-charge value $kQ/z^2$?`,
          visual: { type: 'graph', params: { x: [0, 2.2], y: [-0.5, 0.05], xlog: true, aspect: 'wide', xlabel: 'z / a', ylabel: 'E / E(point charge) − 1', curves: [{ fn: `2*${U}^2/(sqrt(${U}^2 + 1)*(sqrt(${U}^2 + 1) + ${U})) - 1`, color: 'accent', width: 2.4 }], hlines: [{ y: 0, color: 'ink3' }] }, caption: 'How far the disk’s exact on-axis field falls short of the point-charge formula, against distance in disk radii (logarithmic axis). It never quite reaches zero.' },
          answer: ans, units: 'm', tol: { rel: 0.02 },
          errors: [
            { value: a / Math.sqrt(X), feedback: t`Expand with care: $E/E_{\text{point}} = 2u^2\left(1 - \tfrac{u}{\sqrt{u^2 + 1}}\right) \approx 1 - \tfrac{3}{4u^2}$ with $u = z/a$. The $\tfrac34$ matters.` },
          ],
          hints: [t`With $u = z/a$, the ratio is $\dfrac{E}{kQ/z^2} = 2u^2\left(1 - \dfrac{u}{\sqrt{u^2 + 1}}\right)$.`, t`Binomial expansion to second order: $\tfrac{u}{\sqrt{u^2 + 1}} = 1 - \tfrac{1}{2u^2} + \tfrac{3}{8u^4} - \dots$, so the ratio is $\approx 1 - \tfrac{3}{4u^2}$. Set $\tfrac{3}{4u^2} = ${X}$.`],
          teach: 'The first correction to a far-field limit, from a binomial expansion, tells you how far away "far" is.',
          explain: t`$1 - \tfrac{3}{4u^2} = 1 - ${X}$ gives $u \approx \sqrt{3/(4\cdot${X})} = ${nice(sf(Math.sqrt(3 / (4 * X)), 3))}$; solving exactly gives $u = ${nice(sf(ans / a, 4))}$, so $z \approx ${nice(sf(ans, 3))}$ m. Beyond about ${nice(Math.round(Math.sqrt(3 / (4 * X))))} radii the antenna is, electrically, a point.`,
        };
      },
    }),
    multi({
      id: 'cp-limits', difficulty: 3,
      prompt: t`A classmate proposes that the field on the axis of a uniformly charged disk is $E = \dfrac{\sigma}{2\varepsilon_0}\,\dfrac{z}{\sqrt{z^2 + a^2}}$. Which checks does this formula **fail**? Select all that apply.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 1.15], aspect: 'wide', xlabel: 'z / a', ylabel: 'E / (σ/2ε₀)', curves: [{ fn: 'x/sqrt(x^2 + 1)', color: 'bad', width: 2.4, label: 'proposed', labelAt: 3.5, labelDy: -12 }] }, caption: 'The proposed formula, in units of σ/2ε₀, against distance in disk radii.' },
      choices: [
        t`Far away ($z \gg a$) it tends to $\sigma/2\varepsilon_0$ instead of falling like $kQ/z^2$`,
        t`For an infinitely wide disk ($a \to \infty$) it gives $0$ instead of $\sigma/2\varepsilon_0$`,
        t`Its units are not those of a field`,
        t`It changes sign when $z \to -z$`,
      ],
      answer: [0, 1],
      why: {
        2: t`$\sigma/\varepsilon_0$ has units of N/C and the fraction is dimensionless, so the units are fine. Units alone cannot catch this error.`,
        3: t`That is correct behaviour: below the disk the field points the other way, so $E_z$ must be odd in $z$.`,
      },
      hints: ['Take each limit: z much larger than a, and a much larger than z.', 'What must a finite blob of charge look like far away? What must an infinite sheet give?'],
      teach: 'Limits catch errors that units cannot: test every field formula far away and close up.',
      explain: t`It is the correct formula with the bracket turned inside out: the truth is $\tfrac{\sigma}{2\varepsilon_0}\left[1 - \tfrac{z}{\sqrt{z^2 + a^2}}\right]$, which vanishes far away and tends to $\sigma/2\varepsilon_0$ for a huge disk. Both limits fail for the proposal; its units and its oddness in $z$ are fine.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §2.1–2.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'CODATA 2018: vacuum electric permittivity', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?ep0' },
  ],
});
