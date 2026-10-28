// Divergence and curl of B; Ampère's law (Griffiths §5.3): from Biot–Savart
// for steady currents, ∇·B = 0 (no magnetic charge, field lines never end)
// and ∇×B = μ₀J; Stokes turns the curl law into Ampère's law. Side by side
// with electrostatics. Thick conductors with J ∝ sⁿ and a hollow tube,
// recovering J from B by the curl in cylindrical coordinates, a thick slab of
// current, the quadrupole-magnet field (div and curl both zero), a field that
// circles a wire yet has no curl. Transfer: a four-spacecraft "curlometer"
// measuring a current density in space. The intro version (Ampère with
// uniform J, coax, solenoid, toroid) is phys2220.B2.2–B2.3.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { pickExpr, fieldPic } from './_toolkit.js';
import { MU0, PI, sf, polygon, bare } from './_mag.js';

const t = String.raw;
const S2 = '(x^2 + y^2)', IN = 'step(1 - (x^2 + y^2))', OUT = 'step((x^2 + y^2) - 1)';
/** An azimuthal field B_φ(s) φ̂ as plane components, from B_φ(s)/s as an expression of s2 = x² + y². */
const azimuthal = (overS) => [`-y*(${overS})`, `x*(${overS})`];
const F0 = azimuthal(`${IN} + ${OUT}/${S2}`);
const F1 = azimuthal(`${IN}*sqrt(${S2}) + ${OUT}/${S2}`);
const F2 = azimuthal(`step(${S2} - 0.36)*${IN}*(${S2} - 0.36)/(0.64*${S2}) + ${OUT}/${S2}`);
const F3 = ['0.5*x', '0.5*y'];

/** A static field2d picture: no probe, no numbers. */
const still = (P, Q, caption, extra = {}) => ({ type: 'field2d', params: { P, Q, x: [-2.5, 2.5], y: [-2.5, 2.5], probe: false, readout: false, density: 15, ...extra }, caption });

export default lesson({
  id: 'phys3600.M6.3',
  title: 'Divergence and curl of B; Ampère’s law',
  minutes: 17, difficulty: 3,
  equation: t`\nabla\cdot\vec B = 0, \qquad \nabla\times\vec B = \mu_0\vec J \quad\Longleftrightarrow\quad \oint\vec B\cdot d\vec l = \mu_0I_{\text{enc}}`,
  intro: t`Take the divergence and the curl of the Biot–Savart integral, as [M1.2](#/lesson/phys3600.M1.2) did for Coulomb’s law. The divergence vanishes identically: $\nabla\cdot\vec B = 0$ — **no magnetic charge**, so field lines never start or end. The curl brings out a delta function, and for steady currents ($\nabla\cdot\vec J = 0$): $\nabla\times\vec B = \mu_0\vec J$ — **currents are the vortices of $\vec B$**. Integrate the curl over any surface and Stokes’s theorem gives Ampère’s law, $\oint\vec B\cdot d\vec l = \mu_0I_{\text{enc}}$. Side by side with electrostatics, $\nabla\cdot\vec E = \rho/\varepsilon_0$ and $\nabla\times\vec E = 0$, the roles swap: $\vec E$ has sources and no swirl, $\vec B$ has swirl and no sources. As with Gauss’s law, the integral form is always true but gives $B$ only when symmetry makes $B$ constant along the loop — which you met in [Physics II](#/lesson/phys2220.B2.2) for uniform currents.`,
  symbols: [
    { tex: '\\nabla\\cdot\\vec B', text: 'the divergence of B: net outflow per unit volume — always zero' },
    { tex: '\\nabla\\times\\vec B', text: t`the curl of B: circulation per unit area, in T/m` },
    { tex: '\\vec J', text: t`the volume current density, in $\text{A/m}^2$: current per unit area across the flow` },
    { tex: '\\mu_0', text: t`the vacuum permeability, $${tex(MU0, 9)}\ \text{N/A}^2$` },
    { tex: 'I_{\\text{enc}}', text: t`the current through any surface bounded by the loop, $\int\vec J\cdot d\vec a$, in A, counted by the right-hand rule` },
  ],
  why: t`Magnetometers on spacecraft infer the currents of space from $\nabla\times\vec B = \mu_0\vec J$, and the zero divergence is why every magnetic field line closes — and why physicists still search for the monopole that would break it.`,
  visual: {
    type: 'field2d',
    title: 'Currents are where B curls',
    lead: t`Long conductors carrying current out of the page, seen end-on; the gold circle is the conductor’s surface (radius 1). Drag the probe: $(\nabla\times\vec B)_z$ is $\mu_0J$ at that point, and $\nabla\cdot\vec B$ should always read 0. The readouts below also compare the circulation round the gold circle with the flux of the curl through it.`,
    tasks: [
      t`**Uniform current**: inside, the curl reads the same everywhere ($\mu_0J$ is uniform); outside, it reads 0, though $\vec B$ still circles. Circulation and the flux of the curl agree: Stokes’s theorem is Ampère’s law.`,
      t`**$J \propto s$**: the curl grows from 0 at the axis to the surface — the current crowds outward, so $B$ rises as $s^2$ inside. **Hollow tube**: no curl and no field in the hole, though current flows all round it.`,
      t`**Not a magnetic field**: $\langle x, y\rangle/2$ has divergence 1. No arrangement of currents can make it; its lines start from nothing.`,
    ],
    params: {
      P: pickExpr('c', [F0[0], F1[0], F2[0], F3[0]]),
      Q: pickExpr('c', [F0[1], F1[1], F2[1], F3[1]]),
      x: [-2.5, 2.5], y: [-2.5, 2.5], probe: [0.5, 0.25], density: 17,
      loop: { r: 1, c: [0, 0] },
      choices: [{ key: 'c', label: 'Field', options: [[0, 'Uniform current'], [1, t`Current density $\propto s$`], [2, t`Hollow tube ($0.6 < s < 1$)`], [3, t`Not a magnetic field: $\langle x, y\rangle/2$`]], value: 0, explain: 'Three conductors with the same total current, and one field no current could make.' }],
    },
    caption: t`Exact fields from Ampère’s law, in units of $\mu_0I/2\pi R$ (so the curl reads $\mu_0J$ in units of $\mu_0I/2\pi R^2$, and $\mu_0I = 2\pi \approx 6.28$). The divergence and curl are computed numerically at the probe and jump at the surface. Arrow lengths are compressed.`,
  },
  example: {
    prompt: t`A long round conductor of radius $R = 1.0$ cm carries 200 A, but the current is not uniform: $J = ks$, growing toward the surface. Find $k$, the field inside and outside, and check the result against $\nabla\times\vec B = \mu_0\vec J$.`,
    visual: still(F1[0], F1[1], t`The conductor’s field (end-on, current out of the page, radius 1): weak near the axis, strongest at the surface, then falling as $1/s$. Lengths compressed.`, { loop: { r: 1, c: [0, 0] } }),
    steps: [
      { label: 'Normalise', text: t`$I = \displaystyle\int_0^R ks\cdot2\pi s\,ds = \frac{2\pi kR^3}{3}$, so $k = \dfrac{3I}{2\pi R^3} = ${tex((3 * 200) / (2 * PI * 1e-6), 3)}\ \text{A/m}^3$.` },
      { label: 'Symmetry', text: t`By the cylindrical symmetry, $\vec B = B(s)\hat\phi$ (the right-hand rule fixes the sense). On a circle of radius $s$, $\oint\vec B\cdot d\vec l = 2\pi sB$.` },
      { label: 'Inside', text: t`$I_{\text{enc}} = I\,(s/R)^3$, so $B = \dfrac{\mu_0Is^2}{2\pi R^3}$. At $s = 0.5$ cm: $${nice(sf(((MU0 * 200 * 0.005 ** 2) / (2 * PI * 1e-6)) * 1e3, 3))}$ mT.` },
      { label: 'Outside', text: t`All the current is enclosed: $B = \dfrac{\mu_0I}{2\pi s}$, $${nice(sf(((MU0 * 200) / (2 * PI * 0.01)) * 1e3, 3))}$ mT at the surface — the two formulas agree there ✓.` },
      { label: 'Curl check', text: t`In cylindrical coordinates $(\nabla\times\vec B)_z = \dfrac1s\dfrac{d}{ds}(sB_\phi) = \dfrac1s\dfrac{d}{ds}\left(\dfrac{\mu_0Is^3}{2\pi R^3}\right) = \dfrac{3\mu_0Is}{2\pi R^3} = \mu_0ks$ ✓. Outside, $sB_\phi$ is constant: curl zero.` },
    ],
    answer: t`$k = ${tex((3 * 200) / (2 * PI * 1e-6), 3)}\ \text{A/m}^3$; $B = \mu_0Is^2/2\pi R^3$ inside ($${nice(sf(((MU0 * 200 * 0.005 ** 2) / (2 * PI * 1e-6)) * 1e3, 3))}$ mT at 0.5 cm), $\mu_0I/2\pi s$ outside ($${nice(sf(((MU0 * 200) / (2 * PI * 0.01)) * 1e3, 3))}$ mT at the surface).`,
  },
  practice: [
    num({
      id: 'power-law', difficulty: 2,
      gen(r) {
        const n = r.pick([0, 1, 2]), R = r.pick([1, 2]), f = r.pick([0.3, 0.5, 0.8]), I = r.pick([50, 100, 300]);
        const s = f * R, B = (MU0 * I * f ** (n + 1)) / (2 * PI * (R / 100));
        return {
          prompt: t`A long round conductor of radius ${R} cm carries ${I} A with current density ${n === 0 ? 'uniform' : n === 1 ? t`$J \propto s$` : t`$J \propto s^2$`} (where $s$ is the distance from the axis). How strong is the field ${nice(s)} cm from the axis?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [0, 1.5], aspect: 'wide', xlabel: 's / R', ylabel: '', curves: [{ fn: `x^${n}`, domain: [0, 1], color: 'gold', width: 2.2, label: 'J', labelAt: 0.9, labelDy: -10 }, { fn: '0', domain: [1, 2], color: 'gold', width: 2.2 }], vlines: [{ x: 1, color: 'ink3', label: 'surface' }, { x: f, color: 'violet' }] }, caption: t`The current density across the conductor (gold, relative to its surface value); the violet line marks the radius asked about.` },
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [
            { value: ((MU0 * I) / (2 * PI * (s / 100))) * 1e3, feedback: t`$\mu_0I/2\pi s$ holds outside, where all the current is enclosed. Inside, only $I_{\text{enc}} = I(s/R)^{${n + 2}}$ is.` },
            ...(n > 0 ? [{ value: ((MU0 * I * f) / (2 * PI * (R / 100))) * 1e3, feedback: t`That is the uniform-current result. Here more of the current flows near the surface: $I_{\text{enc}} \propto s^{${n + 2}}$, not $s^2$.` }] : []),
          ],
          hints: [t`$I_{\text{enc}} = \displaystyle\int_0^s J\,2\pi s'\,ds' \propto s^{${n + 2}}$, so $I_{\text{enc}} = I\,(s/R)^{${n + 2}}$.`, t`Ampère: $2\pi sB = \mu_0I_{\text{enc}}$, so $B = \dfrac{\mu_0I}{2\pi R}\left(\dfrac sR\right)^{${n + 1}}$.`],
          teach: 'Ampère’s law handles any J(s) with cylindrical symmetry: integrate for the enclosed current, then divide by 2πs.',
          explain: t`$B = \dfrac{\mu_0I}{2\pi R}(s/R)^{${n + 1}} = \dfrac{(${tex(MU0, 5)})(${I})}{2\pi(${R / 100})}(${f})^{${n + 1}} \approx ${nice(sf(B * 1e3, 3))}$ mT.`,
        };
      },
    }),
    num({
      id: 'curl-to-J', difficulty: 3,
      gen(r) {
        const m = r.pick([1, 2, 3]), BR = r.pick([2, 5]), R = r.pick([1, 2]);
        const s = R / 2, J = ((m + 1) * BR * 1e-3 * (s / 100) ** (m - 1)) / (MU0 * (R / 100) ** m);
        const P_ = azimuthal(`${IN}*${S2}^${(m - 1) / 2} + ${OUT}/${S2}`);
        return {
          prompt: t`Inside a long straight conductor of radius ${R} cm, a probe finds the field circling the axis with $B_\phi(s) = ${BR}\ \text{mT}\times(s/R)^{${m}}$. What is the current density ${nice(s)} cm from the axis?`,
          visual: still(P_[0], P_[1], t`The measured field, end-on (the conductor’s surface is the gold circle). Lengths compressed.`, { loop: { r: 1, c: [0, 0] } }),
          answer: J / 1e6, units: 'A/mm^2', tol: { rel: 0.01 },
          errors: [
            { value: ((m * BR * 1e-3 * (s / 100) ** (m - 1)) / (MU0 * (R / 100) ** m)) / 1e6, feedback: t`That is $\tfrac{1}{\mu_0}\tfrac{dB_\phi}{ds}$, the Cartesian habit. In cylindrical coordinates $(\nabla\times\vec B)_z = \tfrac1s\tfrac{d}{ds}(sB_\phi)$.` },
            { value: ((BR * 1e-3 * (s / R) ** m) / (MU0 * (s / 100))) / 1e6, feedback: t`$B/\mu_0s$ is not a curl. Differentiate: $J = \tfrac{1}{\mu_0}\tfrac1s\tfrac{d}{ds}(sB_\phi)$.` },
          ].filter((e) => Math.abs(e.value - J / 1e6) > 0.02 * (J / 1e6)),
          hints: [t`$\mu_0J_z = (\nabla\times\vec B)_z = \dfrac1s\dfrac{d}{ds}(sB_\phi)$.`, t`$sB_\phi \propto s^{${m + 1}}$, so $\dfrac1s\dfrac{d}{ds}(sB_\phi) = (${m + 1})\dfrac{B_\phi}{s}$.`],
          teach: 'The differential form runs Ampère backwards: measure B, take its curl, and read off J point by point.',
          explain: t`$J = \dfrac{(${m + 1})B_\phi(s)}{\mu_0s} = \dfrac{(${m + 1})(${nice(sf(BR * (s / R) ** m, 4))}\times10^{-3})}{(${tex(MU0, 5)})(${s / 100})} \approx ${nice(sf(J / 1e6, 3))}\ \text{A/mm}^2$.`,
        };
      },
    }),
    mcq({
      id: 'quadrupole', difficulty: 3,
      prompt: t`An accelerator’s **quadrupole magnet** focuses beams with the field $\vec B = g\,(y\,\hat x + x\,\hat y)$ in its bore, where the beam travels along $z$ and no current flows. Is that a possible magnetic field there?`,
      visual: still('y', 'x', t`The field $\langle y, x\rangle$ in the bore’s cross-section: it points in along one diagonal and out along the other. Lengths compressed.`),
      choices: [
        t`Yes: $\nabla\cdot\vec B = 0$ and $\nabla\times\vec B = 0$, as a current-free region demands`,
        t`No: field lines point into the centre along one diagonal, so it has a sink there`,
        t`No: a magnetic field must circle something`,
        t`Only if a current flows along the axis`,
      ],
      answer: 0,
      why: {
        1: t`$\partial_x(gy) + \partial_y(gx) = 0$: as much flows out along one diagonal as in along the other. No sink.`,
        2: t`Only round a current does $\vec B$ have to circle. In a current-free region it can have any pattern with zero divergence and zero curl.`,
        3: t`$(\nabla\times\vec B)_z = \partial_x(gx) - \partial_y(gy) = 0$: no current is needed in the bore; the coils sit outside it.`,
      },
      hints: [t`Compute $\nabla\cdot\vec B$ and $(\nabla\times\vec B)_z$ for $(gy, gx, 0)$.`, t`In the bore $\vec J = 0$, so both must vanish.`],
      teach: 'In a current-free region a magnetic field needs zero divergence and zero curl — and many non-circling patterns qualify.',
      explain: t`Both vanish, so the quadrupole field is a legal current-free field, made by four poles outside the bore. A particle moving along $z$ is pushed toward the axis in one plane and away in the other: alternating quadrupoles focus a beam overall.`,
    }),
    num({
      id: 'slab', difficulty: 3,
      gen(r) {
        const J = r.pick([1, 2, 5]), a = r.pick([5, 10]), y = r.pick([2, 4]);
        const B = MU0 * J * 1e6 * (y / 1000);
        return {
          prompt: t`A thick, wide plate of conductor occupies $-${a} \le y \le ${a}$ mm and carries a uniform current density $J = ${J}\ \text{A/mm}^2$ along $z$ (out of the page). How strong is the magnetic field inside it at $y = ${y}$ mm?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '0.8', lower: '-0.8', from: -2.6, to: 2.6, color: 'warn', alpha: 0.16 }], curves: [{ fn: '0.8', domain: [-2.6, 2.6], color: 'warn' }, { fn: '-0.8', domain: [-2.6, 2.6], color: 'warn' }, { fn: '0', domain: [-2.6, 2.6], color: 'ink3', dash: [4, 4], width: 1 }, ...polygon([[-0.8, -0.8 * y / a], [0.8, -0.8 * y / a], [0.8, 0.8 * y / a], [-0.8, 0.8 * y / a]], 'violet', { dash: [5, 4] })], points: [{ x: 1.6, y: 1.0, r: 0, label: 'J out of the page', labelDx: 0, color: 'warn' }, { x: 0.85, y: 0.8 * y / a, r: 0, label: `y = ±${y} mm`, labelDx: 6, labelDy: -2, color: 'violet' }] }), caption: t`Edge-on: the plate (orange), its mid-plane (dashed) and a rectangular Amperian loop (violet) reaching to $\pm${y}$ mm. Heights to scale.` },
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: MU0 * J * 1e6 * (a / 1000) * 1e3, feedback: t`$\mu_0Ja$ is the field at and beyond the surface. Inside, the loop encloses only the current between $-y$ and $y$.` }, { value: (B / 2) * 1e3, feedback: t`The loop has **two** sides along $x$, each with $B\ell$, and encloses $J\cdot2y\ell$: $2B\ell = 2\mu_0Jy\ell$.` }],
          hints: [t`By symmetry $\vec B$ is along $\pm x$, reverses across the mid-plane, and is zero on it. Take a rectangle of length $\ell$ spanning $-y$ to $y$.`, t`$\oint\vec B\cdot d\vec l = 2B\ell = \mu_0J(2y\ell)$.`],
          teach: 'Planar symmetry: a rectangular Amperian loop straddling the mid-plane picks up B on its two long sides.',
          explain: t`$B = \mu_0Jy = (${tex(MU0, 5)})(${J}\times10^{6})(${y / 1000}) \approx ${nice(sf(B * 1e3, 3))}$ mT, along $\mp\hat x$ above and below the mid-plane. Check: $(\nabla\times\vec B)_z = -\partial_yB_x = \mu_0J$ ✓.`,
        };
      },
    }),
    order({
      id: 'div-zero', difficulty: 3,
      prompt: t`Put in order the steps showing that the Biot–Savart field has zero divergence.`,
      items: [
        t`Write $\vec B = \dfrac{\mu_0}{4\pi}\displaystyle\int\vec J(\vec r\,')\times\dfrac{\hat{\mathcal R}}{\mathcal R^2}\,d\tau'$`,
        t`Take $\nabla$ inside the integral: it acts on the field point $\vec r$, not on $\vec r\,'$`,
        t`Use $\nabla\cdot(\vec J\times\vec F) = \vec F\cdot(\nabla\times\vec J) - \vec J\cdot(\nabla\times\vec F)$`,
        t`$\nabla\times\vec J(\vec r\,') = 0$, and $\nabla\times(\hat{\mathcal R}/\mathcal R^2) = 0$ since it is $-\nabla(1/\mathcal R)$`,
        t`Both terms vanish, so $\nabla\cdot\vec B = 0$`,
      ],
      hints: ['Start from the law itself, then bring in a product rule.', t`The derivatives act on $\vec r$, the field point.`],
      teach: 'The divergence of B vanishes because the Biot–Savart integrand is a current crossed with a gradient.',
      explain: t`The product rule splits $\nabla\cdot(\vec J\times\hat{\mathcal R}/\mathcal R^2)$ into two curls. One is the curl of a function of $\vec r\,'$ only; the other is the curl of a gradient. Both are zero — no assumption about the current needed. The curl of $\vec B$, by contrast, needs $\nabla\cdot\vec J = 0$ (steady currents) to come out as $\mu_0\vec J$.`,
    }),
    mcq({
      id: 'curl-outside', difficulty: 2,
      prompt: t`Outside a long straight wire, $\vec B = \dfrac{\mu_0I}{2\pi s}\hat\phi$ circles the wire. What is $\nabla\times\vec B$ there?`,
      visual: still(F0[0].replace(IN, '0'), F0[1].replace(IN, '0'), t`The field outside the wire (radius 1, gold circle), circling it. Lengths compressed.`, { loop: { r: 1, c: [0, 0] } }),
      choices: [t`Zero: $sB_\phi$ is constant, so $\tfrac1s\tfrac{d}{ds}(sB_\phi) = 0$`, t`$\dfrac{\mu_0I}{2\pi s^2}\hat z$, since the field circles`, t`$\mu_0I\hat z$ everywhere round the wire`, 'It is not defined, because the field lines are circles'],
      answer: 0,
      why: {
        1: t`Circling is a global property: $\oint\vec B\cdot d\vec l = \mu_0I$ round the wire. The curl is local, and outside the wire there is no current.`,
        2: t`The curl is $\mu_0\vec J$ at the point; the current $I$ sits inside the wire, not out here.`,
        3: 'The curl is defined for any smooth field, circles included.',
      },
      hints: [t`$(\nabla\times\vec B)_z = \dfrac1s\dfrac{d}{ds}(sB_\phi)$ in cylindrical coordinates.`],
      teach: 'A field can circle a wire with zero curl outside it: the curl reads the current at a point, not the shape of the field lines.',
      explain: t`$sB_\phi = \mu_0I/2\pi$ is constant, so the curl is zero everywhere outside, exactly as $\nabla\times\vec B = \mu_0\vec J$ requires where $\vec J = 0$. A tiny paddle wheel there would not spin: the faster flow on its inner side is balanced by the longer arc on its outer side.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-curlometer', difficulty: 4, transfer: true,
      gen(r) {
        const J = r.pick([10, 20, 40]), m0J = (MU0 * J * 1e-9) * 1e6 * 1e9; // nT per 1000 km
        const gxx = r.pick([3, -5]), gxy = r.pick([4, -6]), gyx = gxy + m0J, gyy = -gxx, b0 = [r.pick([18, 25]), r.pick([-6, 4])];
        const round2 = (v) => +v.toFixed(2);
        const P = [[0, 0], [1, 0], [0, 1]];
        const Bv = P.map(([x, y]) => [round2(b0[0] + gxx * x + gxy * y), round2(b0[1] + gyx * x + gyy * y)]);
        let circ = 0; // nT·(1000 km)
        for (let k = 0; k < 3; k++) { const i = k, j = (k + 1) % 3; circ += ((Bv[i][0] + Bv[j][0]) / 2) * (P[j][0] - P[i][0]) + ((Bv[i][1] + Bv[j][1]) / 2) * (P[j][1] - P[i][1]); }
        const Jz = (circ * 1e-9 * 1e6) / (MU0 * 0.5 * 1e12);
        const sc = 0.03, pos = P.map(([x, y]) => [-1.3 + 2.2 * x, -1.0 + 2.2 * y]);
        return {
          prompt: t`ESA’s Cluster mission flew four spacecraft in formation to measure currents in space with Ampère’s law — the **curlometer**. Three of them form a right triangle in the $xy$-plane: S1 at the origin, S2 1000 km along $x$, S3 1000 km along $y$. They measure (in nT) $\vec B_1 = (${Bv[0].join(',\\ ')})$, $\vec B_2 = (${Bv[1].join(',\\ ')})$, $\vec B_3 = (${Bv[2].join(',\\ ')})$, as $(B_x, B_y)$. Assuming $\vec B$ varies linearly between them, find the current density $J_z$ through the triangle.`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.6, 1.6], { curves: polygon(pos, 'ink3', { dash: [5, 4], width: 1.5 }), points: pos.map(([x, y], k) => ({ x, y, r: 5, color: 'violet', label: `S${k + 1}`, labelDx: -24, labelDy: 12 })), arrows: pos.map(([x, y], k) => ({ from: [x, y], to: [x + sc * Bv[k][0], y + sc * Bv[k][1]], color: 'accent', width: 2.2 })) }), caption: t`The three spacecraft (violet) and the measured fields (blue arrows, to one common scale). The triangle is walked S1 → S2 → S3 → S1, anticlockwise, so its normal is $+\hat z$.` },
          answer: Jz * 1e9, units: 'nA/m^2', tol: { rel: 0.02 },
          errors: [{ value: (Jz / 2) * 1e9, feedback: t`The area of a right triangle with legs $L$ is $\tfrac12L^2 = 5\times10^{11}\ \text{m}^2$, not $L^2$.` }],
          hints: [t`For a linear field the trapezoid rule is exact: along each side, $\int\vec B\cdot d\vec l = \tfrac12(\vec B_i + \vec B_j)\cdot(\vec r_j - \vec r_i)$. Go S1 → S2 → S3 → S1.`, t`Then $J_z = \dfrac{\oint\vec B\cdot d\vec l}{\mu_0A}$ with $A = \tfrac12(10^{6}\ \text{m})^2$; 1 nT·km $= 10^{-6}$ T·m.`],
          teach: 'Ampère’s law over a small loop measures the current through it: ∮B·dl ≈ μ₀J·A — how multi-spacecraft missions map currents in space.',
          explain: t`The circulation is $${nice(sf(circ * 1000, 4))}$ nT·km, so $J_z = \dfrac{${tex(circ * 1e-9 * 1e6, 4)}\ \text{T·m}}{(${tex(MU0, 5)})(5\times10^{11}\ \text{m}^2)} \approx ${nice(sf(Jz * 1e9, 3))}\ \text{nA/m}^2$ — typical of the magnetopause or a plasma-sheet current. The fourth spacecraft, out of the plane, gives the other two components of $\vec J$, and $\nabla\cdot\vec B$, which should be zero, measures the method’s error.`,
        };
      },
    }),
    num({
      id: 'cp-tube', difficulty: 3,
      gen(r) {
        const a = r.pick([3, 4]), b = r.pick([6, 8]), I = r.pick([100, 250]), s = r.pick([5, 5.5]);
        const sc = Math.min(s, b - 0.5), B = (MU0 * I * (sc * sc - a * a)) / (2 * PI * (sc / 1000) * (b * b - a * a));
        return {
          prompt: t`A copper tube has inner radius ${a} mm and outer radius ${b} mm and carries ${I} A spread uniformly through its wall. How strong is the magnetic field ${nice(sc)} mm from its axis, inside the wall?`,
          visual: still(F2[0], F2[1], t`A hollow conductor end-on (outer surface the gold circle; the hole not to these dimensions). No field in the hole; it grows through the wall.`, { loop: { r: 1, c: [0, 0] } }),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I) / (2 * PI * (sc / 1000))) * 1e3, feedback: 'Only the part of the wall inside radius s carries enclosed current.' }, { value: ((MU0 * I * sc * sc) / (2 * PI * (sc / 1000) * b * b)) * 1e3, feedback: t`There is no current in the hole: $I_{\text{enc}} \propto s^2 - a^2$, not $s^2$.` }],
          hints: [t`$I_{\text{enc}} = I\dfrac{s^2 - a^2}{b^2 - a^2}$ for $a < s < b$.`, t`$B = \dfrac{\mu_0I_{\text{enc}}}{2\pi s}$.`],
          teach: 'For a hollow conductor the enclosed current counts only the wall inside the Amperian circle.',
          explain: t`$I_{\text{enc}} = ${I}\times\dfrac{${nice(sc * sc)} - ${a * a}}{${b * b} - ${a * a}} \approx ${nice(sf((I * (sc * sc - a * a)) / (b * b - a * a), 3))}$ A, so $B \approx ${nice(sf(B * 1e3, 3))}$ mT.`,
        };
      },
    }),
    multi({
      id: 'cp-which-B', difficulty: 3,
      prompt: t`Which of these could be a magnetostatic field, given suitable currents ($k$ is a constant)?`,
      visual: fieldPic('-y', 'x', { x: [-3.2, 3.2], y: [-1.55, 1.55], n: 15, caption: t`One candidate in the $xy$-plane, $k\langle -y, x, 0\rangle$. Lengths compressed.` }),
      choices: [t`$k\langle -y, x, 0\rangle$`, t`$k\langle 0, 0, x\rangle$`, t`$k\langle x, -2y, z\rangle$`, t`$k\langle x, y, 0\rangle$`, t`$k\langle x^2, 0, 0\rangle$`],
      answer: [0, 1, 2],
      why: {
        3: t`$\nabla\cdot\vec B = 2k \ne 0$: magnetic field lines cannot start from nothing.`,
        4: t`$\nabla\cdot\vec B = 2kx$, not zero.`,
      },
      hints: [t`The only restriction on a magnetostatic field is $\nabla\cdot\vec B = 0$; any curl can be supplied by currents $\vec J = (\nabla\times\vec B)/\mu_0$.`, t`Compute each divergence.`],
      teach: 'Any divergence-free field is a possible magnetostatic field: currents J = ∇×B/μ₀ will make it.',
      explain: t`$\langle -y, x, 0\rangle$ (inside a uniform current), $\langle 0, 0, x\rangle$ (beside a current sheet), and $\langle x, -2y, z\rangle$ (current-free, as its curl is zero) all have zero divergence. The other two do not, and no currents can make them: they would need magnetic charge.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §5.3 and Problem 5.15', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Dunlop et al., Analysis of multipoint magnetometer data (the curlometer), Adv. Space Res. 8 (1988)', url: 'https://doi.org/10.1016/0273-1177(88)90141-X' },
  ],
});
