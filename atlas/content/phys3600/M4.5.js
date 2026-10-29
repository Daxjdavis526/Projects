// The multipole expansion (Griffiths §3.4): 1/𝓇 expanded in Legendre
// polynomials, the monopole, dipole and quadrupole terms, the lowest
// non-zero moment winning far away (each term one power of r faster), the
// dipole moment's dependence on the origin when Q ≠ 0, the pure dipole's
// field, a water molecule's partial charges from its measured dipole, and
// the linear quadrupole (CO₂). Transfer: Earth's J₂ — the gravitational
// quadrupole — and the inclination of a sun-synchronous orbit.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { KC, sf, field, P } from './_bvp.js';

const t = String.raw;
const PI = Math.PI;
const DEG = PI / 180;
// water (NIST CCCBDB, experimental): O–H 95.84 pm, H–O–H 104.45°, dipole 1.8546 D
const D_SI = 3.33564e-30, P_W = 1.8546 * D_SI, R_OH = 95.84e-12, ANG_W = 104.45;
// Earth (EGM2008 / WGS 84)
const MU = 3.986004418e14, RE = 6378.137e3, J2 = 1.08262668e-3, SSO = (2 * PI) / (365.2422 * 86400);

// configurations on the z-axis (charge in units of q, position in units of d)
const CONFIGS = [
  { name: 'dipole: +q above, −q below', q: [[1, 0.5], [-1, -0.5]] },
  { name: 'linear quadrupole: +q, −2q, +q', q: [[1, 1], [-2, 0], [1, -1]] },
  { name: 'one charge, off the origin', q: [[1, 1]] },
  { name: 'neutral, lopsided: +2q, −q, −q', q: [[2, 1], [-1, 0], [-1, -1]] },
];
const mom = (cs) => [0, 1, 2].map((n) => cs.reduce((s, [q, z]) => s + q * z ** n, 0));
const when = (j) => `step(0.5 - abs(m - ${j}))`;
const C_TH = 'cos(th*pi/180)';
/** |V| of the charges at distance R (an expression) along the direction th, as log10. */
const exactAbs = (cs, R) => `abs(${cs.map(([q, z]) => `${q}/sqrt((${R})^2 - 2*(${R})*${z}*${C_TH} + ${z * z})`).join(' + ')})`;
const P2c = '(1.5*cos(th*pi/180)^2 - 0.5)';
const termExpr = (n, M) => (n === 0 ? `${M}/(10^x)` : n === 1 ? `${M}*cos(th*pi/180)/(10^x)^2` : `${M}*${P2c}/(10^x)^3`);
const curves = [];
CONFIGS.forEach((C, j) => {
  const M = mom(C.q);
  curves.push({ fn: `log10(${exactAbs(C.q, '10^x')} + 1e-9)`, color: 'ink', width: 2.6, when: when(j), domain: [0.18, 2] });
  ['accent', 'gold', 'violet'].forEach((col, n) => { if (Math.abs(M[n]) > 1e-12) curves.push({ fn: `log10(abs(${termExpr(n, M[n])}) + 1e-9)`, color: col, width: 1.8, dash: [6, 4], when: when(j) }); });
});
const atR = (j) => { const C = CONFIGS[j], M = mom(C.q); return { exact: exactAbs(C.q, '10^L'), approx: `abs(${[0, 1, 2].map((n) => termExpr(n, M[n]).replaceAll('10^x', '10^L')).join(' + ')})` }; };
const pick = (k) => CONFIGS.map((_, j) => `${when(j)}*${atR(j)[k]}`).join(' + ');

/** Point charges on a vertical axis as a picture (graph): [q, z] in units of q and d. */
const chargesPic = (cs, caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [-2.5, 2.5], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['0', 't'], t: [-1.5, 1.5], color: 'ink3', dash: [3, 4], width: 1 }],
    points: cs.map(([q, z]) => ({ x: 0, y: z, r: 5 + 2 * Math.abs(q), color: q > 0 ? 'warn' : 'accent', label: `${q > 0 ? '+' : '−'}${Math.abs(q) === 1 ? '' : Math.abs(q)}q`, labelDx: 12 })),
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys3600.M4.5',
  title: 'The multipole expansion',
  minutes: 18, difficulty: 4,
  equation: t`V(\vec r) = \frac{1}{4\pi\varepsilon_0}\sum_{n=0}^{\infty}\frac{1}{r^{n+1}}\int (r')^n\,P_n(\cos\alpha)\,\rho(\vec r\,')\,d\tau'`,
  intro: t`Far from a lump of charge, its potential is nearly that of a point charge — but how nearly, and what comes next? Expand $1/\mathscr r$ in powers of $r'/r$: the coefficients turn out to be exactly the Legendre polynomials of [M4.4](#/lesson/phys3600.M4.4), $\dfrac1{\mathscr r} = \sum_n\dfrac{(r')^n}{r^{n+1}}P_n(\cos\alpha)$, with $\alpha$ the angle between $\vec r$ and $\vec r\,'$. Each term of $V$ falls one power faster than the last: the **monopole** $Q/r$, the **dipole** $\vec p\cdot\hat r/r^2$ with $\vec p = \int\vec r\,'\rho\,d\tau'$, the **quadrupole** as $1/r^3$, and so on. Far enough away, **the lowest non-zero term wins** — and its moment is what a measurement from afar can tell you about the source. Molecules, nuclei and planets are all described this way.`,
  symbols: [
    { tex: 'r', text: 'the distance from the origin (inside the charge) to the field point, in m — large compared with the source' },
    { tex: '\\vec r\\,\'', text: 'the position of a bit of the source charge, in m' },
    { tex: '\\alpha', text: t`the angle between $\vec r$ and $\vec r\,'$` },
    { tex: 'P_n', text: 'the Legendre polynomial of degree n' },
    { tex: '\\rho(\\vec r\\,\')\\,d\\tau\'', text: 'the charge in a small volume of the source, in C' },
    { tex: 'n', text: 'the order: 0 monopole (total charge), 1 dipole, 2 quadrupole, 3 octupole …' },
  ],
  why: t`Earth’s gravity field is catalogued as a multipole series — its $J_2$ quadrupole steers every low orbit — and gravitational waves are quadrupole radiation, because mass has no dipole that can oscillate.`,
  visual: {
    type: 'graph',
    title: 'Which term wins far away',
    lead: t`Four arrangements of charges on a vertical axis. Black: the exact $|V|$ along a line at angle $\theta$ from the axis, on log–log axes. Dashed: the monopole (blue), dipole (gold) and quadrupole (violet) terms on their own. On these axes a term $\propto r^{-(n+1)}$ is a straight line of slope $-(n+1)$.`,
    tasks: [
      t`The dipole: no monopole line; far away the black curve lies on the gold line, slope $-2$.`,
      t`The linear quadrupole: no monopole, no dipole; the exact curve falls with slope $-3$. Set $\theta = 54.7°$, where $P_2(\cos\theta) = 0$: the quadrupole vanishes and the next term takes over.`,
      t`One charge off the origin: all three terms exist, because the origin is in the wrong place. Far away the monopole wins and the others are corrections that fade.`,
    ],
    params: {
      x: [0, 2], y: [-6, 0.6], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'r / d', ylabel: '|V| (units of q/4πε₀d)',
      choices: [{ key: 'm', label: 'Charges', options: CONFIGS.map((C, j) => [j, C.name]), value: 0, explain: 'All on one axis; d sets the size.' }],
      sliders: [
        { key: 'th', label: t`Direction $\theta$ from the axis`, min: 0, max: 90, step: 0.5, value: 30, unit: '°', explain: 'The angle of the line along which V is plotted.' },
        { key: 'L', label: t`Probe distance, $\log_{10}(r/d)$`, min: 0.2, max: 2, step: 0.05, value: 0.5, explain: 'Where the readouts compare the exact potential with the three-term sum.' },
      ],
      curves,
      vlines: [{ x: 'L', color: 'ink3' }],
      legend: [{ label: 'exact', color: 'ink' }, { label: 'monopole', color: 'accent', dash: true }, { label: 'dipole', color: 'gold', dash: true }, { label: 'quadrupole', color: 'violet', dash: true }],
      legendAt: 'bl',
      readouts: [
        { label: 'exact |V|', expr: pick('exact'), digits: 4 },
        { label: 'monopole + dipole + quadrupole', expr: pick('approx'), digits: 4 },
      ],
    },
    caption: t`Exact sums of point-charge potentials, in units of $q/4\pi\varepsilon_0d$. Near $r \approx d$ the series converges slowly or not at all; the expansion is for $r$ larger than the source.`,
  },
  example: {
    prompt: t`A water molecule has O–H bonds 95.84 pm long at 104.45° and a measured dipole moment of 1.855 D ($1\ \text{D} = 3.336\times10^{-30}$ C·m). Model it as $-2\delta$ on the oxygen and $+\delta$ on each hydrogen. Find $\delta$, and the field 1 nm away along the dipole’s axis.`,
    visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-0.9, 0.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['t*sin(52.225*pi/180)', '-t*cos(52.225*pi/180)'], t: [0, 0.9584], color: 'ink3', width: 3 }, { param: ['-t*sin(52.225*pi/180)', '-t*cos(52.225*pi/180)'], t: [0, 0.9584], color: 'ink3', width: 3 }], points: [{ x: 0, y: 0, r: 11, color: 'accent', label: 'O, −2δ', labelDx: 14 }, { x: 0.9584 * Math.sin(52.225 * DEG), y: -0.9584 * Math.cos(52.225 * DEG), r: 7, color: 'warn', label: 'H, +δ', labelDx: 10 }, { x: -0.9584 * Math.sin(52.225 * DEG), y: -0.9584 * Math.cos(52.225 * DEG), r: 7, color: 'warn', label: 'H, +δ', labelDx: -46 }], arrows: [{ from: [0, -0.1], to: [0, -0.55], color: 'gold', width: 2.6, label: 'p', labelDx: 8, labelDy: 6 }] }, caption: 'The water molecule to scale (lengths in units of 100 pm). The dipole moment (gold) points from the negative oxygen toward the positive hydrogens. The point charges are a model of a smeared electron cloud.' },
    steps: [
      { label: 'Monopole', text: t`Total charge $-2\delta + \delta + \delta = 0$: no $1/r$ term. So the dipole moment does not depend on the origin; put it on the oxygen.` },
      { label: 'Dipole moment', text: t`$\vec p = \sum q_i\vec r_i$. Each hydrogen sits $d\cos(104.45°/2)$ along the axis, so $p = 2\delta\,d\cos 52.225° = 2\delta(95.84\ \text{pm})(${nice(sf(Math.cos(52.225 * DEG), 4))})$.` },
      { label: 'Solve for delta', text: t`$\delta = \dfrac{p}{2d\cos 52.225°} = \dfrac{${tex(P_W, 4)}}{${tex(2 * R_OH * Math.cos((ANG_W / 2) * DEG), 4)}} \approx ${tex(P_W / (2 * R_OH * Math.cos((ANG_W / 2) * DEG)), 3)}$ C, about $${nice(sf(P_W / (2 * R_OH * Math.cos((ANG_W / 2) * DEG)) / 1.602176634e-19, 2))}e$.` },
      { label: 'Field on the axis', text: t`A pure dipole’s field on its axis is $E = \dfrac{2kp}{r^3} = \dfrac{2(8.988\times10^9)(${tex(P_W, 4)})}{(10^{-9})^3} \approx ${tex((2 * KC * P_W) / 1e-27, 3)}$ V/m.` },
      { label: 'Honesty', text: t`At 1 nm — ten bond lengths — the dipole term dominates, but the molecule also has a quadrupole moment, falling as $1/r^4$ in the field. The point charges are a model: the real charge is a smeared electron cloud.` },
    ],
    answer: t`$\delta \approx ${nice(sf(P_W / (2 * R_OH * Math.cos((ANG_W / 2) * DEG)) / 1.602176634e-19, 2))}e$; the field 1 nm away on the axis is $\approx ${tex((2 * KC * P_W) / 1e-27, 2)}$ V/m.`,
  },
  practice: [
    num({
      id: 'moments', difficulty: 2,
      gen(r) {
        const qa = r.pick([1, 2, 3]), za = r.pick([1, 2]), zb = r.pick([-1, -2]);
        // a third charge makes the total zero
        const cs = [[qa, za], [-qa - 1, 0], [1, zb]];
        const p = mom(cs)[1];
        return {
          prompt: t`Charges sit on the $z$-axis: $${qa === 1 ? '' : qa}q$ at $z = ${za}d$, $${-qa - 1}q$ at the origin and $+q$ at $z = ${zb}d$. What is the dipole moment, in units of $qd$?`,
          visual: chargesPic(cs.map(([q, z]) => [q, z * 0.6]), 'The three charges on the axis (not to scale). Their total is zero.'),
          answer: p, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: qa * za, feedback: 'Every charge contributes q·z, including the one below the origin (negative z).' }].filter((e) => e.value !== p),
          hints: [t`$p = \sum_iq_iz_i$.`, t`$p = ${qa}\cdot${za} + (${-qa - 1})\cdot0 + 1\cdot(${zb})$, in units of $qd$.`],
          teach: 'The dipole moment of point charges is Σ qᵢ rᵢ; when the total charge is zero it does not depend on the origin.',
          explain: t`$p = ${qa * za} + 0 + (${zb}) = ${p}\,qd$${p === 0 ? '' : t`, along $${p > 0 ? '+' : '-'}\hat z$`}. The total charge is zero, so this is the same about any origin.`,
        };
      },
    }),
    mcq({
      id: 'origin', difficulty: 3,
      prompt: t`A single point charge $q$ sits at $z = a$. What is its dipole moment?`,
      visual: chargesPic([[1, 0.6]], 'One charge, a distance a above the origin.', { points: [{ x: 0, y: 0.6, r: 7, color: 'warn', label: '+q', labelDx: 12 }, { x: 0, y: 0, r: 3, color: 'ink2', label: 'origin', labelDx: 10 }] }),
      choices: [t`$qa\,\hat z$ about the origin, zero about the charge itself: with $Q \ne 0$, $\vec p$ depends on the origin`, t`Zero: a single charge has no dipole moment`, t`$qa\,\hat z$, whatever origin you choose`, t`$2qa\,\hat z$`],
      answer: 0,
      why: {
        1: 'About the origin, p = Σ q r = q a ẑ. Only about its own position is it zero.',
        2: t`Shift the origin by $\vec b$ and $\vec p$ changes by $-Q\vec b$. Only a neutral distribution has an origin-free dipole moment.`,
        3: 'There is one charge, at distance a: p = qa.',
      },
      hints: [t`$\vec p = \sum q_i\vec r_i$ — measured from wherever you put the origin.`, t`Move the origin by $\vec b$: $\vec r_i \to \vec r_i - \vec b$, so $\vec p \to \vec p - Q\vec b$.`],
      teach: 'When the total charge is not zero, the dipole moment depends on the origin: put the origin at the centre of charge to make it vanish.',
      explain: t`$\vec p = qa\,\hat z$ about the origin. The expansion is still right — its dipole term just corrects for having put the origin off the charge. Put the origin on the charge and the series is the monopole alone. This origin dependence is a documented trap.`,
    }),
    mcq({
      id: 'dominant', difficulty: 2,
      prompt: t`Charges $+q$, $-2q$, $+q$ sit in a line at $z = d, 0, -d$. Far away, how does the potential fall with distance?`,
      visual: chargesPic([[1, 0.8], [-2, 0], [1, -0.8]], 'The linear quadrupole.'),
      choices: [t`As $1/r^3$`, t`As $1/r$`, t`As $1/r^2$`, t`It is exactly zero far away`],
      answer: 0,
      why: { 1: 'The total charge is zero: no monopole.', 2: t`The dipole moment $\sum q_iz_i = qd + 0 - qd = 0$: no dipole either.`, 3: 'The quadrupole moment is not zero: Σ qᵢ zᵢ² = 2qd².' },
      hints: ['Compute the total charge, then Σ qᵢ zᵢ, then Σ qᵢ zᵢ².', 'The first non-zero one sets the fall-off.'],
      teach: 'The lowest non-zero moment sets how fast the potential falls: monopole 1/r, dipole 1/r², quadrupole 1/r³.',
      explain: t`$Q = 0$, $p = 0$, but $\sum q_iz_i^2 = 2qd^2$: the quadrupole term $\dfrac{1}{4\pi\varepsilon_0}\dfrac{2qd^2}{r^3}P_2(\cos\theta)$ leads. Carbon dioxide, O=C=O, is built this way: no dipole, a strong quadrupole.`,
    }),
    num({
      id: 'quad-V', difficulty: 3,
      gen(r) {
        const q = r.pick([1, 2, 5]), d = r.pick([1, 2]), rr = r.pick([10, 20]), th = r.pick([0, 90]);
        const Pc = P(2, Math.cos(th * DEG)), ans = (KC * q * 1e-9 * 2 * (d / 1000) ** 2 * Pc) / (rr / 100) ** 3;
        return {
          prompt: t`A linear quadrupole has $+${q}$ nC at $z = \pm${d}$ mm and $-${2 * q}$ nC at the origin. Use the leading term of the multipole expansion to find $V$ at ${rr} cm from the origin, ${th === 0 ? 'on the axis' : 'in the perpendicular plane'}.`,
          visual: field({ unit: 'mm', x: [-8, 8], y: [-5, 5], charges: [{ x: 0, y: d, q }, { x: 0, y: 0, q: -2 * q }, { x: 0, y: -d, q }], fieldLines: true, density: 14, equip: false, grid: false }, t`The three charges (axis vertical) and their field lines close in. Far away the field falls as $1/r^4$.`),
          answer: ans * 1e3, units: 'mV', tol: { rel: 0.01 },
          errors: [{ value: ((KC * q * 1e-9 * 2 * (d / 1000) ** 2) / (rr / 100) ** 3) * 1e3 * (th === 0 ? -1 : 1), feedback: th === 0 ? 'Check the sign: on the axis P₂(1) = +1, and Σ qz² = +2qd² is positive.' : t`In the perpendicular plane $\theta = 90°$, and $P_2(0) = -\tfrac12$.` }].filter((e) => Math.abs(e.value - ans * 1e3) > 1e-9),
          hints: [t`$V \approx \dfrac{1}{4\pi\varepsilon_0}\dfrac{1}{r^3}\sum_iq_iz_i^2\,P_2(\cos\theta)$, with $\sum q_iz_i^2 = 2qd^2$.`, t`$P_2(\cos ${th}°) = ${nice(Pc)}$.`],
          teach: 'For a neutral, dipole-free source the leading term is the quadrupole, with its P₂(cos θ) pattern: twice as strong on the axis as in the equatorial plane, and of opposite sign.',
          explain: t`$V \approx \dfrac{k\cdot2qd^2}{r^3}P_2(\cos ${th}°) = \dfrac{(8.988\times10^9)(2)(${q}\times10^{-9})(${d / 1000})^2}{(${rr / 100})^3}\times(${nice(Pc)}) \approx ${nice(sf(ans * 1e3, 3))}$ mV. The exact sum of the three Coulomb potentials differs only in the next term, smaller by about $(d/r)^2$.`,
        };
      },
    }),
    num({
      id: 'dipole-field', difficulty: 3,
      gen(r) {
        const p = r.pick([1, 2, 5]), th = r.pick([0, 30, 60, 90]), rr = r.pick([5, 10]);
        const ans = ((KC * p * 1e-12) / (rr / 100) ** 3) * Math.sqrt(1 + 3 * Math.cos(th * DEG) ** 2);
        return {
          prompt: t`A small dipole has $p = ${p}\times10^{-12}$ C·m. How strong is its field ${rr} cm away, in a direction ${th}° from the dipole’s axis?`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: 0, y: 0.4, q: 1 }, { x: 0, y: -0.4, q: -1 }], fieldLines: true, density: 14, grid: false }, 'A small dipole (axis vertical) and its field lines. To the far field, only p matters.'),
          answer: ans, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: (2 * KC * p * 1e-12) / (rr / 100) ** 3, feedback: t`$2kp/r^3$ holds only on the axis. Off the axis there is also a $\hat\theta$ component.` }].filter((e) => th !== 0),
          hints: [t`$\vec E = \dfrac{p}{4\pi\varepsilon_0r^3}\left(2\cos\theta\,\hat r + \sin\theta\,\hat\theta\right)$.`, t`Its size is $\dfrac{kp}{r^3}\sqrt{4\cos^2\theta + \sin^2\theta} = \dfrac{kp}{r^3}\sqrt{1 + 3\cos^2\theta}$.`],
          teach: 'A pure dipole’s field falls as 1/r³ and is twice as strong along its axis as across it.',
          explain: t`$E = \dfrac{kp}{r^3}\sqrt{1 + 3\cos^2 ${th}°} \approx ${nice(sf(ans, 3))}$ V/m — from $-\nabla$ of $V = kp\cos\theta/r^2$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sso', difficulty: 4, transfer: true,
      gen(r) {
        const h = r.pick([500, 600, 700, 800]);
        const a = RE + h * 1e3, n = Math.sqrt(MU / a ** 3);
        const cosI = -SSO / (1.5 * n * J2 * (RE / a) ** 2), I = Math.acos(cosI) / DEG;
        return {
          prompt: t`Gravity has the same multipole expansion. Earth’s equatorial bulge gives its potential a quadrupole term, $\Phi = -\dfrac{GM}{r}\left[1 - J_2\left(\dfrac{R}{r}\right)^2P_2(\cos\theta)\right]$, with $J_2 = ${tex(J2, 6)}$ and $R = 6\,378$ km. That term turns a circular orbit’s plane about Earth’s axis at $\dot\Omega = -\tfrac32\,n\,J_2\left(\dfrac Ra\right)^2\cos i$, where $n = \sqrt{GM/a^3}$ and $GM = ${tex(MU, 10)}\ \text{m}^3/\text{s}^2$. A **sun-synchronous** orbit turns once a year, eastward, to keep the same lighting. What inclination $i$ does that need at an altitude of ${h} km?`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-1.25, 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ polar: '1 - 0.08*(3*sin(theta)^2 - 1)/2', theta: [0, 2 * PI], color: 'accent', width: 2.4 }, { param: ['cos(t)', 'sin(t)'], t: [0, 2 * PI], color: 'ink4', width: 1, dash: [4, 4] }, { param: ['1.35*cos(t)*cos(1.1)', '1.35*cos(t)*sin(1.1)'], t: [0, PI], color: 'gold', width: 2.2 }, { fn: '0', domain: [-1.6, 1.6], color: 'ink4', dash: [2, 4], width: 1 }, { param: ['0', 't'], t: [-1.2, 1.2], color: 'ink4', dash: [2, 4], width: 1 }], points: [{ x: 0, y: 1.15, r: 0, label: 'Earth’s axis', labelDx: 6 }] }, caption: t`An oblate Earth (flattening exaggerated about 25 times; dashed: a sphere) with its equator (dotted) and an orbit seen edge-on (gold), tilted from the equator (the tilt drawn is arbitrary). The bulge’s pull on the tilted orbit makes its plane precess. The precession formula comes from celestial mechanics; the $J_2$ in it is the quadrupole of this lesson.` },
          answer: I, units: 'deg', tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 180 - I, feedback: t`Sun-synchronous needs $\dot\Omega > 0$ (eastward). With the minus sign in the formula, $\cos i$ must be negative: a retrograde orbit, $i > 90°$.` }],
          hints: [t`Required rate: $\dot\Omega = 2\pi/(365.2422 \times 86\,400\ \text{s}) \approx ${tex(SSO, 4)}$ rad/s. With $a = R + h$, find $n$.`, t`$\cos i = -\dfrac{\dot\Omega}{\tfrac32nJ_2(R/a)^2}$; at $h = ${h}$ km, $n \approx ${tex(n, 4)}$ rad/s.`],
          teach: 'Earth’s quadrupole (J₂) makes orbit planes precess; choosing the inclination sets the rate — at about 98° for low orbits, once a year.',
          explain: t`$a = ${nice(sf(a / 1e3, 5))}$ km, $n \approx ${tex(n, 4)}$ rad/s, so $\cos i \approx ${nice(sf(cosI, 4))}$ and $i \approx ${nice(sf(I, 4))}°$. Landsat, Sentinel-2 and most Earth-imaging satellites fly in exactly such orbits: the lowest non-trivial multipole of Earth’s gravity, put to work.`,
        };
      },
    }),
    num({
      id: 'cp-lopsided', difficulty: 3,
      gen(r) {
        const q = r.pick([1, 2]), d = r.pick([1, 2]), rr = r.pick([20, 50]);
        const p = mom([[2, 1], [-1, 0], [-1, -1]])[1] * q * 1e-9 * (d / 1000);
        const V = (KC * p) / (rr / 100) ** 2;
        return {
          prompt: t`Charges $+${2 * q}$ nC at $z = ${d}$ mm, $-${q}$ nC at the origin and $-${q}$ nC at $z = -${d}$ mm. Using the leading term of the multipole expansion, find $V$ on the $+z$ axis ${rr} cm away.`,
          visual: chargesPic([[2, 0.8], [-1, 0], [-1, -0.8]], 'The three charges on the axis (not to scale). Total charge zero.'),
          answer: V * 1e3, units: 'mV', tol: { rel: 0.01 },
          errors: [{ value: ((KC * 2 * q * 1e-9 * (d / 1000)) / (rr / 100) ** 2) * 1e3, feedback: 'Include every charge in Σ qᵢzᵢ — the one below the origin adds to it.' }],
          hints: [t`$Q = 0$; $p = \sum q_iz_i = (${2 * q})(${d}) + 0 + (-${q})(-${d})$ nC·mm.`, t`On the axis $V = kp/r^2$.`],
          teach: 'Find the first non-zero moment, then use its term: here the dipole, kp cos θ/r².',
          explain: t`$p = ${3 * q * d}$ nC·mm $= ${tex(p, 3)}$ C·m, so $V = kp/r^2 \approx ${nice(sf(V * 1e3, 3))}$ mV.`,
        };
      },
    }),
    mcq({
      id: 'cp-co2', difficulty: 2,
      prompt: t`Carbon dioxide (O=C=O, straight and symmetric) and water (bent) are both neutral. Far from each, which term of the multipole expansion leads?`,
      visual: chargesPic([[-1, 0.9], [2, 0], [-1, -0.9]], 'A charge model of CO₂ drawn along a vertical axis: −δ on each oxygen, +2δ on the carbon.'),
      choices: ['CO₂: quadrupole. Water: dipole.', 'Both: dipole', 'Both: monopole', 'CO₂: dipole. Water: quadrupole.'],
      answer: 0,
      why: { 1: 'CO₂’s two bond dipoles point in opposite directions and cancel: p = 0.', 2: 'Both are neutral: Q = 0.', 3: 'Backwards: symmetry kills CO₂’s dipole; water’s bend leaves one.' },
      hints: ['Is either molecule symmetric under reflection through its centre?', 'A centre of symmetry forces the dipole moment to vanish.'],
      teach: 'Symmetry kills moments: a centre of inversion forbids a dipole, leaving the quadrupole to lead.',
      explain: t`CO₂ has a centre of symmetry, so $\vec p = 0$ and its quadrupole leads (about $-1.4\times10^{-39}$ C·m², measured). Water’s bend leaves $p = 1.85$ D. That is why water is a superb solvent for ions and CO₂ is not.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §3.4', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'NIST CCCBDB: water geometry and dipole moment', url: 'https://cccbdb.nist.gov/' },
    { label: 'Pavlis et al., The EGM2008 Earth gravitational model (JGR 117, 2012)', url: 'https://doi.org/10.1029/2011JB008916' },
    { label: 'Vallado, Fundamentals of Astrodynamics and Applications (4th ed.), §9.6: J₂ perturbations and sun-synchronous orbits', url: 'https://www.microcosminc.com/' },
  ],
});
