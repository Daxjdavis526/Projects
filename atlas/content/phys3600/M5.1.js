// Polarization and bound charge (Griffiths §4.1–4.2): atomic polarizability
// and the size of the stretch it describes, P as dipole moment per volume,
// the bound charges σ_b = P·n̂ and ρ_b = −∇·P from the dipole potential, the
// uniformly polarized sphere (via M4.4's σ₀cos θ result), the radially
// polarized ball and cylinder (zero field outside, ρ_b = −∇·P inside), the
// shape-dependent depolarizing field (slab, cylinder, sphere, needle), and
// the misconception that bound charge is fictitious. Transfer: the quartz
// pressure transducers on a rocket test stand. The intro dielectric is
// phys2220.E5.4; this lesson is what is underneath it.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { pickExpr, fieldPic } from './_toolkit.js';
import { EPS0, QE, PI, DEG, sf, arrowsAt, grid, circle, polygon, bare } from './_mag.js';

const t = String.raw;
// Griffiths Table 4.1 (from the CRC Handbook): α/4πε₀ for hydrogen, in m³; Bohr radius (CODATA 2022)
const ALPHA_H = 0.667e-30, A0 = 5.29177210544e-11;
// quartz piezoelectric coefficient d₁₁ (magnitude), C/N
const D11 = 2.3e-12;

/** E (units P/ε₀) of a uniformly polarized sphere (R = 1, P along +y), in the plane through its axis. */
const sphereE = (x, y) => {
  const r2 = x * x + y * y;
  if (r2 < 1) return [0, -1 / 3];
  const r5 = r2 ** 2.5;
  return [(x * y) / r5, (3 * y * y - r2) / (3 * r5)];
};
const offSurface = ([x, y]) => Math.abs(Math.hypot(x, y) - 1) > 0.1;

/** Bound-charge marks round a sphere polarized along +y: dots on the surface, orange where σ_b = P cos θ > 0, blue where < 0, sized by |cos θ|. */
const signs = (R = 1) => [15, 35, 55, 75, 105, 125, 145, 165].flatMap((a) => [1, -1].map((s) => {
  return { x: R * Math.cos(a * DEG), y: s * R * Math.sin(a * DEG), r: 1.5 + 4 * Math.abs(Math.sin(a * DEG)), color: s > 0 ? 'warn' : 'accent' };
}));

/** The uniformly polarized sphere in cross-section: its E field (arrows), outline and bound-charge signs. */
const spherePic = (caption, extra = {}) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    curves: [circle(1, 'ink2')],
    arrows: [...arrowsAt(grid([-2.6, 2.6], [-1.25, 1.25], 17).filter(offSurface).filter(([x, y]) => Math.abs(x) > 0.2 || Math.hypot(x, y) > 1), sphereE, { len: 0.26 }), { from: [0, -0.55], to: [0, 0.55], color: 'violet', width: 3.4, label: 'P', labelDx: 8, labelDy: 6 }],
    points: signs(),
    ...extra,
  }),
  caption,
});

/** A sphere with P = k rⁿ r̂ inside (gold arrows), optionally a Gaussian sphere of radius g. */
const radialPic = (n, caption, g = null) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    curves: [circle(1, 'ink2'), ...(g ? [circle(g, 'violet', { dash: [5, 4] })] : [])],
    arrows: arrowsAt(grid([-1, 1], [-1, 1], 8).filter(([x, y]) => Math.hypot(x, y) < 0.93), (x, y) => { const s = Math.hypot(x, y); return [x * s ** (n - 1), y * s ** (n - 1)]; }, { len: 0.24, color: 'gold' }),
    ...(g ? { points: [{ x: 1.12, y: -0.55, r: 0, label: 'Gaussian sphere, radius r (dashed)', labelDx: 0, labelDy: 0, color: 'violet' }] } : {}),
  }),
  caption,
});

// ── the Explore field: long cylinders, a genuinely 2D problem, so the probe's divergence and curl are exact ──
const IN = 'step(1 - (x^2 + y^2))', OUT = 'step((x^2 + y^2) - 1)';
const S4 = '(x^2 + y^2)^2';

export default lesson({
  id: 'phys3600.M5.1',
  title: 'Polarization and bound charge',
  minutes: 16, difficulty: 3,
  equation: t`\sigma_b = \vec P\cdot\hat n, \qquad \rho_b = -\nabla\cdot\vec P`,
  intro: t`Put an insulator in a field and every atom stretches a little: its nucleus moves along $\vec E$, its electron cloud the other way, leaving a tiny dipole $\vec p = \alpha\vec E$ (polar molecules, like water, also turn to line up). The **polarization** $\vec P$ is the dipole moment per unit volume. Add up the dipole potentials of all of them and integrate by parts: the result is exactly the potential of two very real charge distributions — a **surface charge** $\sigma_b = \vec P\cdot\hat n$ where the dipoles’ ends pile up at the boundary, and a **volume charge** $\rho_b = -\nabla\cdot\vec P$ wherever the polarization spreads out and leaves a deficit behind. These **bound charges** produce the field of polarized matter, by Coulomb’s law and every method of M1–M4. You met dielectrics in [Physics II](#/lesson/phys2220.E5.4) as a factor $\kappa$; this is what lies underneath it.`,
  symbols: [
    { tex: '\\vec P', text: t`the polarization: dipole moment per unit volume, in $\text{C·m}/\text{m}^3 = \text{C/m}^2$` },
    { tex: '\\hat n', text: 'the outward unit normal of the material’s surface' },
    { tex: '\\sigma_b', text: t`the bound surface charge density, in $\text{C/m}^2$: charge that is there, but cannot leave its molecules` },
    { tex: '\\rho_b', text: t`the bound volume charge density, in $\text{C/m}^3$` },
    { tex: '\\nabla\\cdot\\vec P', text: 'the divergence of P: how fast the polarization spreads out from a point, in C/m³' },
  ],
  why: t`Every capacitor dielectric, every piezoelectric pressure sensor and every electret microphone works through bound charge — and the same mathematics, with currents in place of charges, describes magnets in M7.`,
  visual: {
    type: 'field2d',
    title: 'Bound charge makes the field',
    lead: t`Long cylinders of polarized material, seen end-on (radius 1; the cylinder’s edge is the gold circle). Because nothing depends on the coordinate along the cylinder, this slice is exact, so the probe’s divergence is $\rho/\varepsilon_0$ for the charge actually present. Choose a polarization and drag the probe.`,
    tasks: [
      t`**Uniform $\vec P$ across the axis**: inside, $\vec E$ is uniform and points **against** $\vec P$; outside, a dipole pattern. The divergence reads 0 inside and out — a uniform $\vec P$ has $\rho_b = 0$. All the bound charge sits on the surface, $\sigma_b = P\cos\phi$.`,
      t`**Radial $\vec P = ks\,\hat s$**: the field inside points inward and the probe reads $\nabla\cdot\vec E = -2$: the bound volume charge $\rho_b = -2k$. Outside the field is **zero** — the positive $\sigma_b = kR$ on the surface exactly cancels it.`,
      t`Choose **the polarization itself** for the radial case: now the probe reads $\nabla\cdot\vec P = +2$, and $\rho_b = -\nabla\cdot\vec P$ — the minus sign is the deficit left where $\vec P$ spreads out.`,
    ],
    params: {
      P: pickExpr('c', [`${OUT}*x*y/${S4}`, `-${IN}*x`, `${IN}*x`]),
      Q: pickExpr('c', [`-0.5*${IN} + ${OUT}*(y^2 - x^2)/(2*${S4})`, `-${IN}*y`, `${IN}*y`]),
      potential: pickExpr('c', [`${IN}*y/2 + ${OUT}*y/(2*(x^2 + y^2))`, `${IN}*(x^2 + y^2 - 1)/2`, '0']),
      x: [-2.5, 2.5], y: [-2.5, 2.5], probe: [0.4, 0.3], density: 17,
      loop: { r: 1, c: [0, 0] },
      choices: [{ key: 'c', label: 'Show', options: [[0, t`$\vec E$: uniform $\vec P$ across the axis`], [1, t`$\vec E$: radial $\vec P = ks\,\hat s$`], [2, t`$\vec P$ itself: radial case`]], value: 0, explain: 'The field of the bound charges, or the polarization that produces them.' }],
    },
    caption: t`Exact fields of infinitely long cylinders, in units of $P/\varepsilon_0$ (uniform case) or $kR/\varepsilon_0$ (radial case). The gold circle marks the surface; its circulation readout is the curl test ($\oint\vec E\cdot d\vec l = 0$ for any electrostatic field). Arrow lengths are compressed. A sphere differs only in its numbers: $-\vec P/3\varepsilon_0$ inside instead of $-\vec P/2\varepsilon_0$.`,
  },
  example: {
    prompt: t`A sphere of radius $R = 3.0$ cm is polarized uniformly, $\vec P = P\hat z$ with $P = 4.0\ \mu\text{C/m}^2$. Find its bound charges and the field inside and just outside its north pole.`,
    visual: spherePic(t`The sphere’s field, computed from its bound charges (lengths compressed; colour shows strength). Inside it is uniform and points against $\vec P$ (violet); outside it is a pure dipole’s. Dots on the surface mark $\sigma_b = P\cos\theta$: orange positive, blue negative, larger where it is denser.`),
    steps: [
      { label: 'Bound charges', text: t`$\vec P$ is constant, so $\rho_b = -\nabla\cdot\vec P = 0$. On the surface $\hat n = \hat r$, so $\sigma_b = \vec P\cdot\hat r = P\cos\theta$: positive on the northern half, negative on the southern, zero round the equator.` },
      { label: 'Borrow a result', text: t`A sphere carrying $\sigma_0\cos\theta$ is the problem solved by Legendre polynomials in [M4.4](#/lesson/phys3600.M4.4): with $\sigma_0 = P$, $V = \dfrac{P}{3\varepsilon_0}r\cos\theta$ inside and $V = \dfrac{PR^3}{3\varepsilon_0}\dfrac{\cos\theta}{r^2}$ outside.` },
      { label: 'Inside', text: t`$r\cos\theta = z$, so $V = Pz/3\varepsilon_0$ and $\vec E = -\nabla V = -\dfrac{\vec P}{3\varepsilon_0}$: uniform, opposite to $\vec P$. Size: $\dfrac{${tex(4e-6, 2)}}{3(${tex(EPS0, 5)})} \approx ${tex(4e-6 / (3 * EPS0), 3)}$ V/m.` },
      { label: 'Outside', text: t`That is the potential of a point dipole $p = \tfrac43\pi R^3P \approx ${tex((4 / 3) * PI * 0.03 ** 3 * 4e-6, 3)}$ C·m — the total moment of the sphere. Just outside the north pole, $E = \dfrac{2p}{4\pi\varepsilon_0R^3} = \dfrac{2P}{3\varepsilon_0} \approx ${tex((2 * 4e-6) / (3 * EPS0), 3)}$ V/m, pointing outward.` },
      { label: 'Check the jump', text: t`Across the north pole $E_\perp$ jumps from $-P/3\varepsilon_0$ to $+2P/3\varepsilon_0$: by $P/\varepsilon_0 = \sigma_b/\varepsilon_0$, exactly the jump [M2.2](#/lesson/phys3600.M2.2) demands of a surface charge ✓. Bound charge obeys the same laws as any other.` },
    ],
    answer: t`$\rho_b = 0$, $\sigma_b = P\cos\theta$ (up to $\pm4.0\ \mu\text{C/m}^2$); inside $\vec E = -\vec P/3\varepsilon_0$, size $${tex(4e-6 / (3 * EPS0), 3)}$ V/m; just outside the pole $${tex((2 * 4e-6) / (3 * EPS0), 3)}$ V/m outward.`,
  },
  practice: [
    num({
      id: 'atom-stretch', difficulty: 2,
      gen(r) {
        const E = r.pick([1e6, 3e6, 1e7]);
        const p = 4 * PI * EPS0 * ALPHA_H * E, d = p / QE;
        return {
          prompt: t`A hydrogen atom has polarizability $\alpha = 4\pi\varepsilon_0\,(${tex(ALPHA_H, 3)}\ \text{m}^3)$. In a field of $${tex(E, 2)}$ V/m, how far does the centre of its electron cloud shift from the proton? Treat the induced dipole as $\vec p = e\vec d$.`,
          visual: { type: 'graph', params: bare([-2.3, 2.3], [-1.12, 1.12], { shade: [{ fn: 'sqrt(max(1 - (x + 0.18)^2, 0))', lower: '-sqrt(max(1 - (x + 0.18)^2, 0))', from: -1.18, to: 0.82, color: 'accent', alpha: 0.2 }], curves: [circle(1, 'accent', { width: 1.5 }, -0.18, 0)], points: [{ x: 0, y: 0, r: 5, color: 'warn', label: 'proton', labelDx: 8, labelDy: -10 }, { x: -0.18, y: 0, r: 3, color: 'accent', label: 'cloud centre', labelDx: -86, labelDy: 14 }], arrows: [{ from: [1.25, 0.6], to: [2.1, 0.6], color: 'violet', width: 2.6, label: 'E', labelDx: 4, labelDy: -6 }] }), caption: 'The atom in a field (violet): the proton is pulled along E, the electron cloud (blue) the other way. The shift is drawn about ten thousand times too large.' },
          answer: d * 1e15, units: 'fm', tol: { rel: 0.02 },
          errors: [{ value: ((ALPHA_H * E) / QE) * 1e15, feedback: t`The number in brackets is $\alpha/4\pi\varepsilon_0$, a volume. Multiply by $4\pi\varepsilon_0$ to get $\alpha$ in $\text{C·m}^2/\text{V}$.` }],
          hints: [t`$p = \alpha E = 4\pi\varepsilon_0(${tex(ALPHA_H, 3)})E$, in C·m.`, t`$d = p/e$, with $e = ${tex(QE, 4)}$ C; $1\ \text{fm} = 10^{-15}$ m.`],
          teach: 'An atom’s polarizability is about its own volume, times 4πε₀; even strong lab fields stretch it by a tiny fraction of its size.',
          explain: t`$p = 4\pi\varepsilon_0\alpha' E \approx ${tex(p, 3)}$ C·m, so $d = p/e \approx ${tex(d, 3)}$ m $= ${nice(sf(d * 1e15, 3))}$ fm — about $${tex(d / A0, 2)}$ of the Bohr radius. Polarization is a minute distortion of each atom, made large by the number of atoms: $10^{28}$ or so per cubic metre in a solid.`,
        };
      },
    }),
    num({
      id: 'sigma-angle', difficulty: 2,
      gen(r) {
        const P = r.pick([2, 5, 8]), th = r.pick([30, 45, 60, 120, 135, 150]);
        const ans = P * Math.cos(th * DEG);
        return {
          prompt: t`A sphere is polarized uniformly, $\vec P = ${P}\ \mu\text{C/m}^2\ \hat z$. What is the bound surface charge density at the point of its surface where $\theta = ${th}°$ (measured from $+\hat z$)?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { curves: [circle(1, 'ink2')], arrows: [...[-0.5, 0, 0.5].map((x) => ({ from: [x, -0.45], to: [x, 0.45], color: 'gold', width: 2.2 })), { from: [Math.sin(th * DEG), Math.cos(th * DEG)], to: [1.45 * Math.sin(th * DEG), 1.45 * Math.cos(th * DEG)], color: 'violet', width: 2.4, label: 'n̂', labelDx: 6 }], points: [{ x: Math.sin(th * DEG), y: Math.cos(th * DEG), r: 4, color: 'violet' }, { x: -0.5, y: 0.45, r: 0, label: 'P', labelDx: -16, labelDy: 0, color: 'gold' }] }), caption: t`The sphere (axis vertical), its uniform polarization (gold) and the outward normal at $\theta = ${th}°$ (violet).` },
          answer: ans, units: 'uC/m^2', tol: { rel: 0.01 },
          errors: [
            { value: P * Math.sin(th * DEG), feedback: t`$\vec P\cdot\hat n = P\cos\theta$, with $\theta$ the angle between $\vec P$ and the normal, here the polar angle.` },
            { value: P, feedback: t`Only where $\hat n$ is parallel to $\vec P$ (the poles) is $\sigma_b = P$. Elsewhere only the normal part of $\vec P$ counts.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(ans)),
          hints: [t`$\sigma_b = \vec P\cdot\hat n$, and on a sphere $\hat n = \hat r$.`, t`$\hat z\cdot\hat r = \cos\theta$.`],
          teach: 'Bound surface charge is the normal component of P: the dipoles’ ends that pile up against the surface.',
          explain: t`$\sigma_b = P\cos ${th}° = ${nice(sf(ans, 3))}\ \mu\text{C/m}^2$${th > 90 ? ' — negative on the lower half, where the dipoles’ tails meet the surface' : ''}. Integrated over the whole sphere it gives zero: polarization moves charge, it does not create it.`,
        };
      },
    }),
    expr({
      id: 'rho-b', difficulty: 3,
      gen(r) {
        const sph = r.bool(0.5), n = r.pick([1, 2, 3]), v = sph ? 'r' : 's';
        const c = sph ? n + 2 : n + 1, p = n - 1;
        const body = (k) => (p === 0 ? `${k}*k` : `${k}*k*${v}^${p}`);
        const texBody = p === 0 ? `${c}k` : p === 1 ? `${c}k${v}` : `${c}k${v}^{${p}}`;
        return {
          prompt: sph
            ? t`A ball is polarized radially, $\vec P = k r^{${n}}\,\hat r$ (with $k$ a constant). Find the bound volume charge density inside it.`
            : t`A long cylinder is polarized radially, $\vec P = k s^{${n}}\,\hat s$, where $s$ is the distance from its axis. Find the bound volume charge density inside it.`,
          visual: radialPic(n, sph ? t`A slice through the ball: the polarization $k r^{${n}}\hat r$ (gold) grows outward.` : t`The cylinder end-on: the polarization $k s^{${n}}\hat s$ (gold) grows outward.`),
          answer: `-${body(c)}`, answerTeX: `-${texBody}`, lhs: t`\rho_b`,
          vars: { k: [0.5, 3], [v]: [0.2, 2] },
          errors: [
            { answer: body(c), feedback: t`$\rho_b = -\nabla\cdot\vec P$: where $\vec P$ spreads out, the tails it leaves behind make a **deficit**.` },
            { answer: `-${body(n)}`, feedback: t`That is $-dP/d${v}$, the Cartesian habit. In ${sph ? 'spherical' : 'cylindrical'} coordinates $\nabla\cdot\vec P = ${sph ? t`\tfrac{1}{r^2}\tfrac{d}{dr}(r^2P_r)` : t`\tfrac1s\tfrac{d}{ds}(sP_s)`}$.` },
          ],
          hints: [t`$\rho_b = -\nabla\cdot\vec P$, with the divergence in ${sph ? 'spherical' : 'cylindrical'} coordinates (M0.3).`, sph ? t`$\nabla\cdot(P_r\hat r) = \dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot kr^{${n}}\right) = \dfrac{1}{r^2}\dfrac{d}{dr}\left(kr^{${n + 2}}\right)$.` : t`$\nabla\cdot(P_s\hat s) = \dfrac1s\dfrac{d}{ds}\left(s\cdot ks^{${n}}\right) = \dfrac1s\dfrac{d}{ds}\left(ks^{${n + 1}}\right)$.`],
          teach: 'Bound volume charge is minus the divergence of P, and a divergence in curvilinear coordinates carries its scale factors.',
          explain: sph
            ? t`$\nabla\cdot\vec P = \dfrac{1}{r^2}(${n + 2})kr^{${n + 1}} = ${texBody}$, so $\rho_b = -${texBody}$. The surface carries $\sigma_b = kR^{${n}}$, and the two totals cancel: $-\int\rho_b\,d\tau$ over the ball equals $4\pi R^2\sigma_b$.`
            : t`$\nabla\cdot\vec P = \dfrac1s(${n + 1})ks^{${n}} = ${texBody}$, so $\rho_b = -${texBody}$. The surface carries $\sigma_b = kR^{${n}}$, which cancels it in total.`,
        };
      },
    }),
    mcq({
      id: 'real', difficulty: 2,
      prompt: t`A slab of glass fills the gap of a charged capacitor. Its faces carry bound surface charge. Which statement about that bound charge is right?`,
      visual: { type: 'em-capacitor', params: { A: 0.01, d: 2e-3, V: 12, material: 'pyrex', f: 1, connected: true, controls: [], readouts: [] }, caption: 'A capacitor whose gap is filled by glass: free charge on the plates, bound charge (paler marks) on the slab’s faces, facing the plates with the opposite sign. Fringing ignored; not to scale.' },
      choices: [
        'It is real charge — the ends of stretched molecules — and its field is as real as any other; it just cannot leave its molecules',
        'It is a bookkeeping device: no actual charge sits on the faces',
        'It exists, but produces no field, because the slab as a whole is neutral',
        'It is free charge that has leaked from the plates onto the glass',
      ],
      answer: 0,
      why: {
        1: t`The bound charge is the net charge of the molecular dipoles’ ends at the surface — measurable, with a field you could feel. Calling it “bound” says only that it cannot move off its molecule.`,
        2: 'Neutral overall is not neutral everywhere: + on one face and − on the other make a field inside the slab, which is exactly why the capacitor’s field drops.',
        3: 'Glass is an insulator; no charge crosses from the plates. The bound charge is the glass’s own, displaced a fraction of an atom.',
      },
      hints: ['Think of the column of stretched molecules running from one face to the other. What is left uncancelled at each end?'],
      teach: 'Bound charge is real: it is the uncancelled ends of the molecular dipoles, and it produces field by Coulomb’s law like any charge.',
      explain: t`Inside the slab each dipole’s head sits next to its neighbour’s tail and they cancel; at the faces they do not. The result is a genuine layer of charge, $\sigma_b = \vec P\cdot\hat n$, opposite in sign to the plate it faces — which is why the field in the glass is weaker than in an empty gap. Treating it as fictitious is a documented misconception; its field is what reduces the voltage.`,
    }),
    num({
      id: 'radial-inside', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 5, 10]), rc = r.pick([2, 4, 6]);
        const ans = (k * 1e-6 * rc * 1e-2) / EPS0;
        return {
          prompt: t`A ball of radius 10 cm is polarized radially, $\vec P = kr\,\hat r$ with $k = ${k}\ \mu\text{C/m}^3$. There is no free charge. How strong is the field ${rc} cm from the centre?`,
          visual: radialPic(1, t`A slice through the ball: the polarization (gold) and a Gaussian sphere of radius ${rc} cm (violet, dashed). Not to scale.`, 0.15 + rc * 0.12),
          answer: ans / 1e3, units: 'kV/m', tol: { rel: 0.01 },
          errors: [
            { value: ans / 3e3, feedback: t`$\rho_b = -\nabla\cdot(kr\,\hat r) = -\tfrac{1}{r^2}\tfrac{d}{dr}(kr^3) = -3k$, not $-k$.` },
            { value: 0, feedback: 'The total bound charge is zero, so the field outside vanishes. Inside, the Gaussian sphere encloses only the negative volume charge.' },
          ],
          hints: [t`$\rho_b = -\nabla\cdot\vec P = -3k$ (uniform). The surface charge lies outside your Gaussian sphere.`, t`Gauss: $E\cdot4\pi r^2 = \dfrac{1}{\varepsilon_0}(-3k)\tfrac43\pi r^3$.`],
          teach: t`Bound charge enters Gauss’s law like any other: find $\rho_b$ and $\sigma_b$, then use symmetry.`,
          explain: t`$Q_{\text{enc}} = -4\pi kr^3$, so $E = -\dfrac{kr}{\varepsilon_0}$: $${nice(sf(ans / 1e3, 3))}$ kV/m, pointing **inward**. Note $\vec E = -\vec P/\varepsilon_0$ inside. Outside, $\sigma_b = kR$ adds $+4\pi kR^3$ and the total is zero: no field at all. The polarized ball is invisible from outside.`,
        };
      },
    }),
    multi({
      id: 'no-rho', difficulty: 3,
      prompt: t`For which of these polarizations is the bound **volume** charge $\rho_b$ zero throughout the material?`,
      visual: fieldPic('y', '0', { x: [-3.2, 3.2], y: [-1.55, 1.55], n: 15, caption: t`One of them, $\vec P = ky\,\hat x$: arrows that slide past each other without spreading out (lengths compressed).` }),
      choices: [t`$\vec P = P_0\hat z$, uniform`, t`$\vec P = ky\,\hat x$`, t`$\vec P = \dfrac{k}{s}\hat s$ in a cylindrical shell $a < s < b$`, t`$\vec P = \dfrac{k}{r^2}\hat r$ in a spherical shell $a < r < b$`, t`$\vec P = kr\,\hat r$ in a ball`, t`$\vec P = kx\,\hat x$ in a slab`],
      answer: [0, 1, 2, 3],
      why: {
        4: t`$\nabla\cdot(kr\,\hat r) = 3k$: $\rho_b = -3k$.`,
        5: t`$\partial_x(kx) = k$: $\rho_b = -k$, uniform.`,
      },
      hints: [t`Compute $\nabla\cdot\vec P$ for each, in the coordinates that suit it.`, t`$\tfrac{1}{r^2}\tfrac{d}{dr}\left(r^2\cdot\tfrac{k}{r^2}\right) = 0$, and $\tfrac1s\tfrac{d}{ds}\left(s\cdot\tfrac ks\right) = 0$.`],
      teach: 'Only a polarization that spreads out (non-zero divergence) leaves bound charge inside; a uniform or divergence-free P leaves it all on the surface.',
      explain: t`The uniform, the sheared ($\partial_x(ky) = 0$), the $1/s$ and the $1/r^2$ polarizations are all divergence-free where the material is (the last two blow up only at the axis or centre, which the shells exclude). Their bound charge sits on the surfaces alone. The $kr\,\hat r$ and $kx\,\hat x$ polarizations spread out, leaving $\rho_b = -3k$ and $-k$.`,
    }),
    mcq({
      id: 'error-cartesian', difficulty: 3, kind: 'error',
      prompt: t`For a ball with $\vec P = kr\,\hat r$, a student writes: “$\rho_b = -\dfrac{dP_r}{dr} = -k$, so the ball holds bound charge $-k\cdot\tfrac43\pi R^3$, and the surface holds $kR\cdot4\pi R^2$. Total: $\tfrac83\pi kR^3 \ne 0$ — polarization has created charge.” Where is the slip?`,
      visual: radialPic(1, t`The ball’s polarization (gold), growing in proportion to $r$.`),
      choices: [
        t`The divergence in spherical coordinates is $\tfrac{1}{r^2}\tfrac{d}{dr}(r^2P_r)$, giving $\rho_b = -3k$; then the totals cancel`,
        t`The surface charge is $\sigma_b = -kR$, since $\hat n$ points inward`,
        t`Nothing: radial polarization does create net charge`,
        t`$\rho_b$ should be $+k$, since $\rho_b = \nabla\cdot\vec P$`,
      ],
      answer: 0,
      why: {
        1: t`$\hat n$ is the **outward** normal, $\hat r$ on the surface: $\sigma_b = +kR$.`,
        2: t`Bound charges always total zero for a neutral material: $\oint\vec P\cdot d\vec a - \int\nabla\cdot\vec P\,d\tau = 0$ by the divergence theorem.`,
        3: t`The sign is $\rho_b = -\nabla\cdot\vec P$; and the magnitude is also wrong.`,
      },
      hints: ['Check the totals with the divergence theorem: they must cancel.', t`Recompute $\nabla\cdot\vec P$ with the spherical formula from M0.3.`],
      teach: 'The bound charges of a neutral body always cancel in total — a quick check that catches a wrong divergence.',
      explain: t`$\nabla\cdot(kr\,\hat r) = \tfrac{1}{r^2}\tfrac{d}{dr}(kr^3) = 3k$, so $\rho_b = -3k$ and the volume holds $-4\pi kR^3$, exactly cancelling the surface’s $+4\pi kR^3$. The divergence theorem guarantees it: $\int\rho_b\,d\tau + \oint\sigma_b\,da = -\int\nabla\cdot\vec P\,d\tau + \oint\vec P\cdot d\vec a = 0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-quartz', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([3, 7, 12, 20]), A = r.pick([20, 30, 50]);
        const F = p * 1e6 * A * 1e-6, Q = D11 * F;
        return {
          prompt: t`The chamber-pressure sensors on a rocket test stand are often **piezoelectric**: squeeze a quartz plate across its faces and it polarizes, $P = d_{11}\,\sigma_{\text{stress}}$, with $d_{11} = 2.3$ pC/N. The bound charge $\sigma_b = \vec P\cdot\hat n$ on each face draws an equal and opposite charge onto the electrodes, which a charge amplifier measures. A ${A} mm² diaphragm transmits a chamber pressure of ${p} MPa to the plate. How much charge appears on an electrode?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1.45, 1.45], { shade: [{ fn: '0.45', lower: '-0.45', from: -1.4, to: 1.4, color: 'teal', alpha: 0.25 }], curves: [...polygon([[-1.4, -0.45], [1.4, -0.45], [1.4, 0.45], [-1.4, 0.45]], 'teal'), { fn: '0.5', domain: [-1.5, 1.5], color: 'ink2', width: 3 }, { fn: '-0.5', domain: [-1.5, 1.5], color: 'ink2', width: 3 }], arrows: [{ from: [0, 1.4], to: [0, 0.62], color: 'violet', width: 2.6, label: 'F', labelDx: 10, labelDy: -14 }, { from: [0, -1.4], to: [0, -0.62], color: 'violet', width: 2.6, label: 'F', labelDx: 10, labelDy: 12 }, { from: [-2.1, -0.35], to: [-2.1, 0.35], color: 'gold', width: 2.6, label: 'P', labelDx: 8 }], points: [...[-1.1, -0.55, 0, 0.55, 1.1].map((x) => ({ x, y: 0.33, r: 0, label: '+', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'warn' })), ...[-1.1, -0.55, 0, 0.55, 1.1].map((x) => ({ x, y: -0.33, r: 0, label: '−', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'accent' })), { x: 1.55, y: 0.5, r: 0, label: 'electrode', labelDx: 6, color: 'ink2' }] }), caption: 'A quartz plate (teal) squeezed between electrodes: the stress polarizes it, and bound charge appears on its faces. The sign depends on how the crystal is cut. Real sensors stack several plates under a preload; one plate is drawn.' },
          answer: Q * 1e12, units: 'pC', tol: { rel: 0.01 },
          errors: [{ value: D11 * p * 1e6 * 1e12, feedback: t`The stress is the pressure, but the charge is $\sigma_b$ times the plate’s area: $Q = d_{11}\sigma_{\text{stress}}A = d_{11}F$. Use the force, $F = pA$.` }],
          hints: [t`$\sigma_b = P = d_{11}\sigma_{\text{stress}}$, and the charge on a face of area $A$ is $\sigma_bA = d_{11}(\sigma_{\text{stress}}A) = d_{11}F$.`, t`$F = pA = (${p}\times10^{6}\ \text{Pa})(${A}\times10^{-6}\ \text{m}^2) = ${nice(F)}$ N.`],
          teach: t`A piezoelectric sensor turns force into bound surface charge, $\sigma_b = \vec P\cdot\hat n$, so the charge it gives is proportional to the force.`,
          explain: t`$Q = d_{11}F = (2.3\times10^{-12}\ \text{C/N})(${nice(F)}\ \text{N}) \approx ${nice(sf(Q * 1e12, 3))}$ pC. Charge, not voltage, is measured because it is independent of cable capacitance — and the bound charge itself leaks away slowly, which is why piezoelectric gauges suit fast pressure oscillations (combustion instability) rather than steady pressures.`,
        };
      },
    }),
    mcq({
      id: 'cp-shape', difficulty: 3,
      prompt: t`Four bodies of the same material carry the same uniform polarization $\vec P$. Inside which one is the field produced by its own bound charge — the **depolarizing field** — strongest?`,
      visual: { type: 'graph', params: bare([-3.3, 3.3], [-1.55, 1.55], { curves: [...polygon([[-3, -0.12], [-1.3, -0.12], [-1.3, 0.12], [-3, 0.12]], 'teal'), circle(0.6, 'teal', {}, 0, 0), ...polygon([[2.0, -1.1], [2.16, -1.1], [2.16, 1.35], [2.0, 1.35]], 'teal')], arrows: [{ from: [-2.15, -0.5], to: [-2.15, 0.5], color: 'gold', width: 2.6, label: 'P', labelDx: 6 }, { from: [0, -0.35], to: [0, 0.35], color: 'gold', width: 2.6, label: 'P', labelDx: 6 }, { from: [2.6, -0.5], to: [2.6, 0.5], color: 'gold', width: 2.6, label: 'P', labelDx: 6 }], points: [{ x: -2.15, y: -0.9, r: 0, label: 'thin slab', labelAlign: 'center', labelDx: 0 }, { x: 0, y: -0.9, r: 0, label: 'sphere', labelAlign: 'center', labelDx: 0 }, { x: 2.08, y: -1.35, r: 0, label: 'long needle', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }), caption: t`Three of the shapes, cut through, with $\vec P$ (gold) the same in each. The fourth is a long cylinder polarized across its axis. Not to scale.` },
      choices: [t`The thin slab polarized across its thickness: $E = P/\varepsilon_0$`, t`The sphere: $E = P/3\varepsilon_0$`, t`The long cylinder polarized across its axis: $E = P/2\varepsilon_0$`, t`The long needle polarized along its length: its bound charge is farthest apart`],
      answer: 0,
      why: {
        1: t`The sphere’s $P/3\varepsilon_0$ is the middle of the range. Its bound charge is spread round the curve, partly at the sides.`,
        2: t`$P/2\varepsilon_0$ (the Explore picture) is weaker than the slab’s: the cylinder’s charge sits partly off to the sides.`,
        3: t`Backwards: the needle’s bound charge is two tiny end caps far apart, so the field inside nearly vanishes.`,
      },
      hints: [t`The bound charge is $\pm P$ per unit area on the faces that $\vec P$ crosses. Where is it, relative to the middle?`, t`A thin slab is a parallel-plate capacitor with $\sigma = \pm P$.`],
      teach: 'The field of a body’s own bound charge depends on its shape: strongest for a thin slab polarized across it, nearly zero for a long needle polarized along it.',
      explain: t`The slab is a capacitor with $\pm P$ on its faces: $E = P/\varepsilon_0$, opposing $\vec P$. Then the cylinder ($P/2\varepsilon_0$), the sphere ($P/3\varepsilon_0$) and the needle ($\approx 0$). These **depolarization factors** 1, ½, ⅓, 0 are why the same material polarizes more readily as a needle along the field than as a plate across it.`,
    }),
    num({
      id: 'cp-sphere-axis', difficulty: 3,
      gen(r) {
        const P = r.pick([2, 5, 10]), R = r.pick([1, 2]), rr = r.pick([4, 5, 8]);
        const p = (4 / 3) * PI * (R / 100) ** 3 * P * 1e-6, E = (2 * p) / (4 * PI * EPS0 * (rr / 100) ** 3);
        return {
          prompt: t`A sphere of radius ${R} cm is polarized uniformly with $P = ${P}\ \mu\text{C/m}^2$. How strong is its field on its axis, ${rr} cm from its centre?`,
          visual: spherePic(t`The uniformly polarized sphere, its polarization (violet) and its field; the axis is vertical. Lengths compressed.`, { points: [...signs(), { x: 0, y: 1.18, r: 4, color: 'good', label: 'field point (not to scale)', labelDx: 8, labelDy: 2 }] }),
          answer: E / 1e3, units: 'kV/m', tol: { rel: 0.01 },
          errors: [
            { value: (P * 1e-6) / (3 * EPS0) / 1e3, feedback: t`$P/3\varepsilon_0$ is the field **inside**. Outside, the sphere acts as a point dipole of moment $\tfrac43\pi R^3P$.` },
            { value: E / 2e3, feedback: t`On the axis a dipole’s field is $2p/4\pi\varepsilon_0r^3$; $p/4\pi\varepsilon_0r^3$ is its value across the axis.` },
          ],
          hints: [t`Outside, the field is exactly that of a point dipole $p = \tfrac43\pi R^3P$ at the centre.`, t`On the axis, $E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{2p}{r^3} = \dfrac{2PR^3}{3\varepsilon_0r^3}$.`],
          teach: 'Outside, a uniformly polarized sphere is exactly a point dipole of moment (4/3)πR³P.',
          explain: t`$p = \tfrac43\pi(${R / 100})^3(${P}\times10^{-6}) \approx ${tex(p, 3)}$ C·m, and $E = \dfrac{2p}{4\pi\varepsilon_0r^3} \approx ${nice(sf(E / 1e3, 3))}$ kV/m along $\vec P$. Equivalently $\tfrac{2P}{3\varepsilon_0}(R/r)^3$: the surface value, falling as $1/r^3$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §4.1–4.2 and Table 4.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
    { label: 'Gautschi, Piezoelectric Sensorics (Springer, 2002): quartz d₁₁ and pressure transducers', url: 'https://doi.org/10.1007/978-3-662-04732-3' },
  ],
});
