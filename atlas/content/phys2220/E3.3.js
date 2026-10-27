// Applying Gauss's law: with spherical, cylindrical or planar symmetry, the
// field is the same size all over a well-chosen Gaussian surface, and Gauss's
// law gives it in one line.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { K, EPS0, tn, s3, field, fieldLive } from './_efield.js';

const t = String.raw;
const R_EARTH = 6.371e6;

// the worked example: a uniformly charged ball, R = 10 cm, Q = 5.0 nC
const WX = { Q: 5e-9, R: 0.1 };
WX.Ein = (K * WX.Q * 0.05) / WX.R ** 3;
WX.ER = (K * WX.Q) / WX.R ** 2;
WX.Eout = (K * WX.Q) / 0.2 ** 2;

// E(r) for a uniformly charged ball of radius 10 cm and charge 5.0 nC, in N/C with r in cm:
// kQr/R³ = 449.4 r inside, kQ/r² = 449 400/r² outside — the smaller of the two at every r
const ballE = 'min(449.4*x, 449400/max(x, 0.01)^2)';

export default lesson({
  id: 'phys2220.E3.3',
  title: 'Applying Gauss’s law to symmetric charges',
  minutes: 14, difficulty: 3,
  intro: t`When the charge has enough symmetry, you can tell which way the field points and that its size is the same all over a well-chosen Gaussian surface. Then $E$ comes straight out of the flux integral:

$$E\,A_\text{G} = \frac{Q_\text{enc}}{\varepsilon_0}$$

**Spherical** symmetry, with a sphere of radius $r$: $E\cdot 4\pi r^2 = Q_\text{enc}/\varepsilon_0$. **Cylindrical**, for a long line or cylinder, with a coaxial cylinder: $E\cdot 2\pi rL = \lambda L/\varepsilon_0$. **Planar**, for a large sheet, with a pillbox through it: $E\cdot 2A = \sigma A/\varepsilon_0$. The art is choosing the surface: wherever the field crosses it, the field must be perpendicular to it and the same size; wherever it is not, the field must run along it.`,
  symbols: [
    { tex: 'E', text: 'the size of the field on the part of the Gaussian surface it crosses — the same everywhere there, by symmetry; in N/C' },
    { tex: 'A_\\text{G}', text: 'the area of that part of the surface: $4\\pi r^2$ for a sphere, the curved side $2\\pi rL$ of a cylinder, the two faces $2A$ of a pillbox; in m²' },
    { tex: 'Q_\\text{enc}', text: 'the charge inside the Gaussian surface, in C: often only part of the object’s charge' },
    { tex: '\\varepsilon_0', text: 'the permittivity of free space, $8.854\\times10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$' },
  ],
  why: 'These three results — the sphere, the line and the sheet — are the building blocks for capacitors, coaxial cables, Earth’s own electric charge, and, by the same argument for gravity, the shell theorem behind every orbit.',
  visual: {
    type: 'em-field',
    title: 'Let symmetry do the integral',
    lead: t`Pick a symmetric charge. The green Gaussian surface is chosen to match it: resize it with the upper handle. The readout gives the flux, the charge it encloses, and the field's size on the surface.`,
    tasks: [
      'Ball: shrink the sphere inside the ball. The charge enclosed falls as r³ and the area as r², so E grows in proportion to r. Outside, E falls as 1/r².',
      'Line: double the cylinder’s radius. The same charge, twice the area: E halves.',
      'Sheet: widen the pillbox (the box straddling the sheet). Its end faces move away from the sheet, but E on them does not change.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-6, 6],
      presets: [
        { id: 'ball', label: 'Charged ball', balls: [{ x: 0, y: 0, R: 3, Q: 4 }], gauss: { shape: 'sphere', x: 0, y: 0, r: 2, move: false } },
        { id: 'shell', label: 'Thin shell', balls: [{ x: 0, y: 0, R: 3, Q: 4, shell: true }], gauss: { shape: 'sphere', x: 0, y: 0, r: 2, move: false } },
        { id: 'line', label: 'Long line', lines: [{ x: 0, y: 0, lambda: 20, drag: false }], gauss: { shape: 'cylinder', x: 0, y: 0, r: 2.5, depth: 6, move: false } },
        { id: 'sheet', label: 'Large sheet', sheets: [{ x: 0, y: 0, angle: 90, sigma: 30 }], gauss: { shape: 'box', x: 0, y: 0, w: 4, h: 3, depth: 3, move: false } },
      ],
      preset: 'ball', readouts: ['Esurf', 'flux', 'Qenc'], arrows: false, fieldLines: true, density: 12, ref: [9, 5],
    },
    caption: 'Ball and shell: 3.0 cm radius, 4.0 nC. Line: 20 nC/m, running through the page; the cylinder is 6 cm long. Sheet: 30 nC/m², edge-on; the box reaches 1.5 cm in front of and behind the page. Flux is integrated numerically over the whole 3D surface.',
  },
  example: {
    prompt: t`A ball of radius 10 cm carries 5.0 nC spread evenly through its volume. Find the electric field (a) 5.0 cm from its centre, (b) at its surface, (c) 20 cm from its centre.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 30], y: [0, 5200], aspect: 'wide', xlabel: 'distance from the centre r (cm)', ylabel: 'E (N/C)',
        curves: [{ fn: ballE, domain: [0, 30], color: 'accent', width: 2.6 }],
        vlines: [{ x: 10, label: 'surface' }],
        points: [{ x: 5, y: +WX.Ein.toFixed(1), color: 'gold' }, { x: 10, y: +WX.ER.toFixed(1), color: 'gold' }, { x: 20, y: +WX.Eout.toFixed(1), color: 'gold' }],
      },
      caption: 'The field of the uniformly charged ball against distance: rising in proportion to r inside, falling as 1/r² outside, largest at the surface.',
    },
    steps: [
      { label: 'Symmetry', text: t`The charge looks the same from every direction, so the field points straight out from the centre and has the same size at every point a distance $r$ away. Choose a Gaussian sphere of radius $r$: $\oint\vec E\cdot d\vec A = E\cdot4\pi r^2$.` },
      { label: '(a) Inside', text: t`A sphere of radius $r < R$ encloses only part of the charge: $Q_\text{enc} = Q\,r^3/R^3$. So $E\cdot4\pi r^2 = \dfrac{Qr^3}{\varepsilon_0R^3}$, giving $E = \dfrac{kQr}{R^3} = \dfrac{(8.988\times10^{9})(5.0\times10^{-9})(0.050)}{(0.10)^3} = ${tn(WX.Ein)}$ N/C.` },
      { label: '(b) Surface', text: t`At $r = R$: $E = kQ/R^2 = ${tn(WX.ER)}$ N/C — the largest anywhere.` },
      { label: '(c) Outside', text: t`For $r > R$ the sphere encloses all of $Q$: $E = kQ/r^2 = ${tn(WX.Eout)}$ N/C, exactly as if the charge sat at the centre.` },
      { label: 'Sense check', text: t`Inside, $E \propto r$ (zero at the centre, where symmetry forbids any direction); outside, $1/r^2$; the two agree at $r = R$. Newton needed calculus to show that a ball's gravity acts as if from its centre — Gauss's law does it in a line.` },
    ],
    answer: t`(a) $${tn(WX.Ein)}$ N/C; (b) $${tn(WX.ER)}$ N/C; (c) $${tn(WX.Eout)}$ N/C, all pointing radially outward.`,
  },
  practice: [
    num({
      id: 'outside-sphere', difficulty: 1,
      gen(r) {
        const Q = r.pick([2, 5, 8]), R = r.pick([5, 10]), d = r.pick([15, 20, 30]), E = (K * Q * 1e-9) / (d / 100) ** 2;
        return {
          prompt: t`A plastic sphere of radius ${R} cm carries $${Q}$ nC spread evenly through it. How strong is its field ${d} cm from its centre?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (K * Q * 1e-9) / ((d - R) / 100) ** 2, feedback: 'Measure from the centre, not from the surface: outside, the sphere acts like a point charge at its centre.' }],
          hints: [t`Outside, a Gaussian sphere of radius $r$ encloses all of $Q$: $E = kQ/r^2$.`],
          teach: 'Outside any spherically symmetric charge, the field is that of a point charge at the centre.',
          explain: t`$E = \dfrac{kQ}{r^2} = \dfrac{(8.988\times10^{9})(${Q}\times10^{-9})}{(${d / 100})^2} = ${tn(E)}$ N/C.`,
          visual: field({ unit: 'cm', x: [-35, 35], y: [-20, 20], balls: [{ x: 0, y: 0, R, Q }], probe: { x: d, y: 0, label: 'P' }, probeArrow: false, gauss: { shape: 'sphere', x: 0, y: 0, r: d }, fieldLines: true, density: 12 }, 'The charged sphere and a Gaussian sphere (green) through the point P.'),
        };
      },
    }),
    num({
      id: 'inside-ball', difficulty: 2,
      gen(r) {
        const Q = r.pick([3, 6, 9]), R = r.pick([8, 12]), f = r.pick([0.25, 0.5, 0.75]), d = f * R, E = (K * Q * 1e-9 * (d / 100)) / (R / 100) ** 3;
        return {
          prompt: t`A ball of radius ${R} cm carries $${Q}$ nC spread evenly through its volume. How strong is the field ${s3(d, 3)} cm from its centre, inside the ball?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (K * Q * 1e-9) / (d / 100) ** 2, feedback: t`That counts all the charge. A Gaussian sphere inside the ball encloses only $Q(r/R)^3$.` }, { value: 0, feedback: 'The field is zero inside a conductor or an empty shell, but this ball is charged right through.' }],
          hints: [t`Enclosed charge: $Q_\text{enc} = Q\,(r/R)^3$.`, t`$E\cdot4\pi r^2 = Q_\text{enc}/\varepsilon_0$, so $E = kQr/R^3$.`],
          teach: 'Inside a uniformly charged ball only the charge closer to the centre counts: E = kQr/R³, growing in proportion to r.',
          explain: t`$Q_\text{enc} = ${Q}\times(${s3(f, 2)})^3 = ${s3(Q * f ** 3, 3)}$ nC, and $E = \dfrac{kQr}{R^3} = \dfrac{(8.988\times10^{9})(${Q}\times10^{-9})(${s3(d / 100, 3)})}{(${R / 100})^3} = ${tn(E)}$ N/C.`,
          visual: field({ unit: 'cm', x: [-16, 16], y: [-10, 10], balls: [{ x: 0, y: 0, R, Q }], probe: { x: +d.toFixed(3), y: 0, label: 'P' }, probeArrow: false, gauss: { shape: 'sphere', x: 0, y: 0, r: +d.toFixed(3) }, fieldLines: false }, 'The charged ball and a Gaussian sphere (green) through P, inside it.'),
        };
      },
    }),
    num({
      id: 'line', difficulty: 2,
      gen(r) {
        const lam = r.pick([5, 10, 25, 40]), d = r.pick([1, 2, 5, 8]), E = (lam * 1e-9) / (2 * Math.PI * EPS0 * (d / 100));
        return {
          prompt: t`A long straight wire carries $${lam}$ nC/m. Using a coaxial Gaussian cylinder, find the field ${d} cm from it.`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (lam * 1e-9) / (4 * Math.PI * EPS0 * (d / 100) ** 2), feedback: 'That is a point charge’s field. A long line gives a field that falls off as 1/r, through a cylinder’s side 2πrL.' }],
          hints: [t`The field points straight out from the wire, so it crosses only the cylinder's curved side, area $2\pi rL$.`, t`$E\cdot2\pi rL = \lambda L/\varepsilon_0$, so $E = \dfrac{\lambda}{2\pi\varepsilon_0 r}$.`],
          teach: 'For a long line of charge a coaxial cylinder gives E·2πrL = λL/ε₀: E = λ/(2πε₀r).',
          explain: t`$E = \dfrac{${lam}\times10^{-9}}{2\pi(8.854\times10^{-12})(${d / 100})} = ${tn(E)}$ N/C — the same as $2k\lambda/r$, found by integration in lesson E2.3, now in one line.`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], lines: [{ x: 0, y: 0, lambda: lam }], gauss: { shape: 'cylinder', x: 0, y: 0, r: Math.min(d, 5), depth: 6 }, fieldLines: true, density: 12 }, 'The wire seen end-on and a coaxial Gaussian cylinder (green, also running through the page). Not to scale.'),
        };
      },
    }),
    num({
      id: 'sheet', difficulty: 2,
      gen(r) {
        const sig = r.pick([10, 25, 50, 80]), E = (sig * 1e-9) / (2 * EPS0);
        return {
          prompt: t`A large flat sheet carries $${sig}$ nC/m². Use a pillbox through the sheet to find the field just beside it.`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (sig * 1e-9) / EPS0, feedback: 'The pillbox has two faces the field crosses, one on each side: E·2A = σA/ε₀.' }],
          hints: [t`The field points straight away from the sheet on both sides and crosses only the two end faces, each of area $A$.`, t`$E\cdot2A = \sigma A/\varepsilon_0$.`],
          teach: 'A pillbox through a sheet catches field on both faces: E·2A = σA/ε₀, so E = σ/(2ε₀).',
          explain: t`$E = \dfrac{\sigma}{2\varepsilon_0} = \dfrac{${sig}\times10^{-9}}{2(8.854\times10^{-12})} = ${tn(E)}$ N/C, the same at any distance from a large sheet.`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], sheets: [{ x: 0, y: 0, angle: 90, sigma: sig }], gauss: { shape: 'box', x: 0, y: 0, w: 4, h: 3, depth: 3 }, fieldLines: true, density: 10 }, 'The sheet edge-on and a pillbox (green) straddling it.'),
        };
      },
    }),
    match({
      id: 'choose-surface', difficulty: 1,
      prompt: 'Match each charge distribution to the Gaussian surface that gives its field.',
      left: ['A uniformly charged ball', 'A long straight charged wire', 'A large flat charged sheet', 'A short charged rod'],
      right: ['A sphere centred on it', 'A cylinder around it, sharing its axis', 'A pillbox crossing it', 'None: no surface has a constant field over it', 'A cube centred on it'],
      answer: [0, 1, 2, 3],
      hints: ['Choose a surface on which the field is perpendicular and the same size wherever it crosses.'],
      teach: 'Choose the Gaussian surface to match the symmetry: sphere, coaxial cylinder or pillbox.',
      explain: 'Ball → sphere (spherical symmetry). Wire → coaxial cylinder (cylindrical). Sheet → pillbox (planar). A short rod has no such symmetry: Gauss’s law still holds for it, but no surface lets you pull E out of the integral.',
      visual: field({ unit: 'cm', x: [-12, 12], y: [-6, 6], balls: [{ x: -8, y: 0, R: 1.8, Q: 2 }], lines: [{ x: -2.5, y: 0, lambda: 10 }], sheets: [{ x: 3, y: 0, angle: 90, sigma: 20, width: 9 }], rods: [{ x1: 7, y1: -1.5, x2: 10, y2: 1.5, Q: 2 }], fieldLines: false }, 'A ball, a long wire seen end-on, a sheet seen edge-on and a short rod.'),
    }),
    mcq({
      id: 'shell-inside', difficulty: 2,
      prompt: 'A thin spherical shell carries charge spread evenly over its surface. What is the field at a point inside it, off-centre?',
      choices: [
        'Zero: a Gaussian sphere inside encloses no charge, and by symmetry its field would be the same all over it',
        'Strongest near the wall closest to the point',
        'The same as just outside the shell, kQ/R²',
        'Zero only at the very centre',
      ],
      answer: 0,
      why: {
        1: 'The nearby wall pushes harder per unit of charge, but the far side has more charge in the cone it fills — they balance exactly (an inverse-square result).',
        2: 'Outside, the field is kQ/r²; inside, a Gaussian sphere encloses nothing.',
        3: 'By symmetry the field on a concentric Gaussian sphere has the same size everywhere, and its flux is zero: so the field is zero at every point inside, not just the centre.',
      },
      hints: ['Draw a concentric Gaussian sphere through the point, inside the shell. What does it enclose?'],
      teach: 'Inside a uniformly charged spherical shell the field is zero everywhere — the same shell theorem as for gravity.',
      explain: 'A concentric Gaussian sphere inside the shell encloses no charge, so its flux is zero; by symmetry E has the same size all over it, so E = 0 there — at every radius inside. Newton’s shell theorem for gravity is the same statement.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], balls: [{ x: 0, y: 0, R: 4, Q: 4, shell: true }], probe: { x: 1.8, y: 1.2, label: 'P' }, probeArrow: false, gauss: { shape: 'sphere', x: 0, y: 0, r: 2.163 }, fieldLines: true, density: 12 }, 'The charged shell, a point P inside it and a concentric Gaussian sphere through P (green).'),
    }),
    num({
      id: 'two-sheets', difficulty: 2,
      gen(r) {
        const sig = r.pick([20, 40, 60]), E = (sig * 1e-9) / EPS0;
        return {
          prompt: t`Two large parallel sheets carry $+${sig}$ nC/m² and $-${sig}$ nC/m². How strong is the field between them?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: E / 2, feedback: 'That is one sheet’s field. Between the sheets both fields point the same way, from + to −: they add.' }, { value: 0, feedback: 'Outside the pair the fields cancel; between them they add.' }],
          hints: [t`Each sheet alone gives $\sigma/2\varepsilon_0$ on both sides of itself.`, 'Between the sheets, the two fields point the same way.'],
          teach: 'Two oppositely charged sheets: their fields add between them (σ/ε₀) and cancel outside — the parallel-plate capacitor.',
          explain: t`Between the sheets: $\dfrac{\sigma}{2\varepsilon_0} + \dfrac{\sigma}{2\varepsilon_0} = \dfrac{\sigma}{\varepsilon_0} = ${tn(E)}$ N/C, from the + sheet toward the − sheet. Outside, the two fields point opposite ways and cancel.`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], sheets: [{ x: -2, y: 0, angle: 90, sigma: sig }, { x: 2, y: 0, angle: 90, sigma: -sig }], fieldLines: true, density: 10 }, 'The two sheets edge-on. They extend far beyond the picture.'),
        };
      },
    }),
    mcq({
      id: 'cube-error', difficulty: 3, kind: 'error',
      prompt: t`A solid cube of side $a$ carries charge $Q$ spread evenly through it. A student encloses it in a slightly larger Gaussian cube and writes: “$E\cdot6a^2 = Q/\varepsilon_0$, so the field on each face is $E = Q/(6\varepsilon_0a^2)$.” What is wrong?`,
      choices: [
        'The field is not the same size, nor perpendicular, all over the cube’s faces, so E cannot be taken out of the integral',
        'The flux through the cube is not Q/ε₀, because the surface is a cube',
        'They should have used 4πr² for the area',
        'Nothing: the result is right on every face',
      ],
      answer: 0,
      why: {
        1: 'Gauss’s law holds for any closed surface: the total flux really is Q/ε₀.',
        2: 'No sphere fits a cube’s symmetry either: the field on a sphere around a cube is not uniform.',
        3: 'The field is stronger at the middle of a face than at its corners, and tilted there.',
      },
      hints: ['Is the field the same at the centre of a face and at a corner?', 'When can E be pulled out of ∮E·dA?'],
      teach: 'Gauss’s law is always true but gives E only when symmetry makes E constant and perpendicular over the surface.',
      explain: 'The total flux, Q/ε₀, is right. But E·dA is not the same everywhere on the cube: the field is strongest at face centres and points at an angle near the edges. So E cannot leave the integral, and the formula gives only an average. A cube of charge needs a numerical integral.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [-1.2, 0, 1.2].flatMap((x) => [-1.2, 0, 1.2].map((y) => ({ x, y, q: 0.5 }))), gauss: { shape: 'cube', x: 0, y: 0, r: 3.2 }, normals: true, fieldLines: false }, 'A square grid of point charges standing in for the charged cube, inside a Gaussian cube (green). The arrows show E·n̂ around its edge: far from uniform.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-earth', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([100, 120, 150]), Q = -E * 4 * Math.PI * EPS0 * R_EARTH ** 2;
        return {
          prompt: t`In fair weather the field at Earth's surface is about ${E} N/C, pointing straight down, nearly the same all over the globe. Treat the Earth as a sphere of radius 6371 km. What is its net charge? Give the sign.`,
          answer: Q, units: 'C', tol: { rel: 0.01 },
          errors: [{ value: -Q, feedback: 'The field points down, into the Earth: field lines end on negative charge.' }],
          hints: ['Use a Gaussian sphere just above the ground, enclosing the whole Earth.', t`$E\cdot4\pi R^2 = |Q|/\varepsilon_0$; a field pointing inward means $Q$ is negative.`],
          teach: 'A Gaussian sphere around a planet turns its surface field into its total charge: Q = ε₀E·4πR².',
          explain: t`$|Q| = \varepsilon_0E\cdot4\pi R^2 = (8.854\times10^{-12})(${E})(4\pi)(6.371\times10^{6})^2 = ${tn(-Q)}$ C, and the field points inward, so $Q = ${tn(Q)}$ C — about half a million coulombs. Thunderstorms keep charging it; the slightly conducting air leaks the charge away again in fair weather, and the positive charge in the atmosphere above nearly balances it.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.6, 2.6], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'teal', alpha: 0.6 }],
              curves: [{ param: ['1.12*cos(t)', '1.12*sin(t)'], t: [0, 6.2832], color: 'good', width: 2.2 }],
              arrows: [0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k * Math.PI) / 4 + 0.39; return { from: [+(1.55 * Math.cos(a)).toFixed(3), +(1.55 * Math.sin(a)).toFixed(3)], to: [+(1.18 * Math.cos(a)).toFixed(3), +(1.18 * Math.sin(a)).toFixed(3)], color: 'accent' }; }),
            },
            caption: 'The Earth (teal), a Gaussian sphere just above the ground (green) and the fair-weather field (blue), pointing inward. The field arrows are not to scale.',
          },
        };
      },
    }),
    num({
      id: 'cp-coax', difficulty: 3,
      gen(r) {
        const lam = r.pick([10, 20, 30]), d = r.pick([0.5, 1.0, 1.5]), E = (lam * 1e-9) / (2 * Math.PI * EPS0 * (d / 100));
        return {
          prompt: t`A coaxial cable has a thin inner wire carrying $+${lam}$ nC/m and an outer metal tube, 2.0 cm in radius, carrying $-${lam}$ nC/m. How strong is the field ${d} cm from the axis, between the wire and the tube?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: 'Zero is the field outside the tube, where the cylinder encloses +λ and −λ. Between them it encloses only the wire.' }],
          hints: ['A coaxial Gaussian cylinder of radius r between the wire and the tube encloses only the wire’s charge.', t`$E = \dfrac{\lambda}{2\pi\varepsilon_0r}$.`],
          teach: 'Choose the Gaussian cylinder’s radius to sit where you want the field; it counts only the charge inside it.',
          explain: t`$E = \dfrac{${lam}\times10^{-9}}{2\pi(8.854\times10^{-12})(${d / 100})} = ${tn(E)}$ N/C. Outside the tube a cylinder encloses $+\lambda - \lambda = 0$: no field leaks out of the cable.`,
          visual: field({ unit: 'cm', x: [-4, 4], y: [-2.6, 2.6], lines: [{ x: 0, y: 0, lambda: lam }], fieldLines: true, density: 12, gauss: { shape: 'cylinder', x: 0, y: 0, r: d, depth: 2 } }, 'The cable in cross-section: the inner wire (centre) and a Gaussian cylinder (green). The outer tube, 2.0 cm out, is not drawn.'),
        };
      },
    }),
    mcq({
      id: 'cp-graph', difficulty: 2,
      prompt: 'Which curve shows the field of a uniformly charged ball (solid, radius R) against distance from its centre?',
      choices: ['A', 'B', 'C', 'D'],
      answer: 0,
      why: {
        1: 'B is zero inside: that is a thin charged shell, whose inside encloses no charge.',
        2: 'C is constant inside: no charge distribution gives that field — inside a ball, the enclosed charge grows as r³.',
        3: 'D grows without limit at the centre: a point charge, not a ball.',
      },
      hints: ['Inside, the enclosed charge grows as r³ and the area as r²: E ∝ r.'],
      teach: 'A uniformly charged ball’s field grows linearly inside and falls as 1/r² outside, peaking at the surface.',
      explain: 'Inside, E = kQr/R³ grows in a straight line from zero; outside, E = kQ/r². Curve A. (B is a shell; D is a point charge; C matches nothing.)',
      visual: {
        type: 'graph',
        params: {
          x: [0, 3.2], y: [0, 1.6], aspect: 'wide', xlabel: 'r (in units of R)', ylabel: 'E', xticks: 4, yticks: 0.001,
          curves: [
            { fn: 'min(x, 1/max(x, 0.01)^2)', domain: [0, 3.2], color: 'accent', width: 2.4, label: 'A', labelAt: 0.88, labelDx: -18, labelDy: -6 },
            { fn: 'step(x - 1)*1.25/max(x, 0.01)^2', domain: [1.001, 3.2], color: 'gold', width: 2.4, label: 'B', labelAt: 1.5, labelDy: -12 },
            { fn: 'min(0.6, 0.6/max(x, 0.01)^2)', domain: [0, 3.2], color: 'violet', width: 2.4, label: 'C', labelAt: 0.2, labelDy: -12 },
            { fn: '0.3/x^2', domain: [0.44, 3.2], color: 'teal', width: 2.4, label: 'D', labelAt: 0.6, labelDx: 6 },
          ],
          vlines: [{ x: 1, label: 'R' }],
        },
        caption: 'Four possible field curves, E against distance from the centre (not to the same scale).',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §6.3 Applying Gauss’s Law', url: 'https://openstax.org/books/university-physics-volume-2/pages/6-3-applying-gausss-law' },
  ],
});
