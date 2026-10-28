// Gauss's law: the net flux out of any closed surface is the charge inside
// divided by ε₀ — whatever the surface's shape or size, whatever charges sit
// outside. It follows from the inverse-square law and superposition.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { EPS0, tn, s3, field, fieldLive } from './_efield.js';

const t = String.raw;
const GN = 6.674e-11;

// charges in cm and nC with a Gaussian sphere around the origin
const gaussPic = (charges, r, caption, extra = {}) => field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges, gauss: { shape: 'sphere', x: 0, y: 0, r }, fieldLines: true, density: 10, labels: true, ...extra }, caption);

// a cube's edges, with a charge at one corner (3D)
const cubeCorner = (() => {
  const s = 1.6, P = (x, y, z) => [x * s, y * s, z * s];
  const E = [[0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 1, 0], [1, 0, 0, 1, 0, 1], [0, 1, 0, 1, 1, 0], [0, 1, 0, 0, 1, 1], [0, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1], [1, 1, 0, 1, 1, 1], [1, 0, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1]];
  return {
    type: 'calc-vectors3d',
    params: {
      range: 2.2,
      segments: E.map(([a, b, c, d, e, f]) => ({ from: P(a, b, c), to: P(d, e, f), color: 'good' })),
      points: [{ at: [0, 0, 0], color: 'bad', label: 'q' }],
      vectors: [[1, 1, 1], [1, 0.3, 0.6], [0.4, 1, 0.5], [0.5, 0.4, 1]].map((d) => { const m = Math.hypot(...d); return { from: [0, 0, 0], to: d.map((v) => +((2.2 * v) / m).toFixed(3)), color: 'bad' }; }),
    },
    caption: 'A cube (green edges) with a point charge q at one corner, and a few of its field lines (red), all heading out through the three far faces. Drag to turn it.',
  };
})();

export default lesson({
  id: 'phys2220.E3.2',
  title: 'Gauss’s law',
  minutes: 12, difficulty: 3,
  intro: t`Draw any closed surface — a sphere, a box, a potato. The net flux of the electric field out of it counts the charge inside it:

$$\oint \vec E\cdot d\vec A = \frac{Q_\text{enc}}{\varepsilon_0}$$

The shape and size of the surface do not matter, and charges **outside** it add nothing to the net flux: every field line of theirs that comes in goes out again. Their field on the surface is real, though — Gauss's law fixes the total flux, not the field at each point. It is one of Maxwell's four equations.`,
  symbols: [
    { tex: '\\oint', text: 'an integral over a **closed** surface — one with an inside and an outside (the Gaussian surface)' },
    { tex: 'd\\vec A', text: 'a small piece of the surface as a vector, pointing **outward**' },
    { tex: '\\vec E', text: 'the total field at the surface, from all charges, inside and out, in N/C' },
    { tex: 'Q_\\text{enc}', text: 'the net charge enclosed by the surface, in C, counting signs: $+3$ nC and $-5$ nC inside make $-2$ nC' },
    { tex: '\\varepsilon_0', text: 'the permittivity of free space, $8.854\\times10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$; Coulomb’s $k = 1/4\\pi\\varepsilon_0$' },
  ],
  why: 'Gauss’s law turns symmetric field problems into one line of algebra (next lesson), proves that charge on a conductor sits on its surface, and — rewritten for gravity — is the Newtonian limit that Einstein’s field equations had to reproduce.',
  visual: {
    type: 'em-field',
    title: 'Flux counts the charge inside',
    lead: t`A closed Gaussian surface (green) around some charges, cut by the page. Its flux is integrated numerically over the whole 3D surface and shown beside $Q_\text{enc}/\varepsilon_0$. Move it with the lower handle, resize it with the upper one, change its shape, and drag the charges in and out.`,
    tasks: [
      'Change the shape and the size: as long as the same charges are inside, the flux does not change.',
      'Drag the +3 nC charge inside, then out again: it changes the flux by exactly 3 nC/ε₀ — and by nothing while it is outside, though its field still crosses the surface.',
      'Turn on the flux arrows and put only the +2 and −1 charges inside: field goes out in some places and in at others.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-6, 6],
      charges: [{ x: -1, y: 0.5, q: 2 }, { x: 1.5, y: -1, q: -1 }, { x: 6, y: 2, q: 3 }],
      gauss: { shape: 'sphere', x: 0, y: 0, r: 3.5 }, shapes: ['sphere', 'cube', 'lumpy'],
      readouts: ['flux', 'Qenc', 'Qeps'], fieldLines: true, density: 10, arrows: false, labels: true, edit: true,
      toggles: ['normals', 'fieldLines'],
    },
    caption: 'Field lines are drawn in the plane of the page only. The flux is integrated over the whole closed surface in 3D (by adaptive quadrature); “≈” marks a value that has not fully converged, which happens when a charge is almost on the surface.',
  },
  example: {
    prompt: t`(a) Show that for a point charge $q$ at the centre of a sphere of radius $r$, $\oint\vec E\cdot d\vec A = q/\varepsilon_0$, whatever $r$. (b) A closed surface contains charges of $+3.0$ nC and $-5.0$ nC; a $+7.0$ nC charge sits outside it. What is the net flux through it?`,
    visual: gaussPic([{ x: -1.2, y: 0.8, q: 3 }, { x: 1.2, y: -0.8, q: -5 }, { x: 6.5, y: 1.5, q: 7 }], 3.2, 'The Gaussian sphere with two charges inside and one outside. Field lines in the plane of the page.', { normals: true }),
    steps: [
      { label: 'On the sphere', text: t`At every point of the sphere $\vec E$ points straight out (along $d\vec A$) and has the same size $E = kq/r^2$. So $\vec E\cdot d\vec A = E\,dA$ and $E$ comes out of the integral.` },
      { label: 'Integrate', text: t`$\oint\vec E\cdot d\vec A = E\oint dA = \dfrac{kq}{r^2}\cdot 4\pi r^2 = 4\pi kq = \dfrac{q}{\varepsilon_0}$, using $k = 1/4\pi\varepsilon_0$. The $r^2$ cancels: a bigger sphere has a weaker field over a larger area.` },
      { label: 'Any shape', text: t`A lumpy surface around the same charge is crossed by exactly the same field lines, so its flux is the same. That is why only the inverse-square law makes this work.` },
      { label: '(b) Count inside', text: t`$Q_\text{enc} = +3.0 - 5.0 = -2.0$ nC. The $+7.0$ nC outside adds zero net flux.` },
      { label: 'Flux', text: t`$\Phi = \dfrac{Q_\text{enc}}{\varepsilon_0} = \dfrac{-2.0\times10^{-9}}{8.854\times10^{-12}} = ${tn(-2e-9 / EPS0)}$ N·m²/C — negative: more field goes in than comes out.` },
    ],
    answer: t`(a) $4\pi r^2\cdot kq/r^2 = q/\varepsilon_0$, independent of $r$. (b) $${tn(-2e-9 / EPS0)}$ N·m²/C.`,
  },
  practice: [
    num({
      id: 'flux-from-charges', difficulty: 1,
      gen(r) {
        const a = r.pick([1, 2, 4]), b = -r.pick([1, 3]), c = r.pick([2, 5]);
        const Phi = ((a + b) * 1e-9) / EPS0;
        return {
          prompt: t`A closed surface surrounds charges of $+${a}$ nC and $${b}$ nC. A $+${c}$ nC charge sits outside it. What is the net electric flux through the surface?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: [{ value: ((a + b + c) * 1e-9) / EPS0, feedback: 'The charge outside contributes no net flux: its field lines go in and come out again.' }, { value: ((a - b) * 1e-9) / EPS0, feedback: 'Add the enclosed charges with their signs.' }],
          hints: [t`$\Phi = Q_\text{enc}/\varepsilon_0$, counting only charges inside, with their signs.`],
          teach: 'Only the charge inside a closed surface sets its net flux: $\\Phi = Q_\\text{enc}/\\varepsilon_0$.',
          explain: t`$Q_\text{enc} = ${a} + (${b}) = ${a + b}$ nC, so $\Phi = \dfrac{${a + b}\times10^{-9}}{8.854\times10^{-12}} = ${tn(Phi)}$ N·m²/C.`,
          visual: gaussPic([{ x: -1.3, y: 0.6, q: a }, { x: 1.4, y: -0.7, q: b }, { x: 6.5, y: 2, q: c }], 3.4, 'The Gaussian surface (green) with the two charges inside and one outside.'),
        };
      },
    }),
    mcq({
      id: 'shape', difficulty: 1,
      prompt: 'A point charge sits inside a spherical Gaussian surface. The sphere is replaced by a lumpy surface twice as big that still encloses only the charge. What happens to the net flux?',
      choices: ['It stays the same', 'It doubles, because the surface is bigger', 'It falls to a quarter, because the field is weaker farther away', 'It changes in a way that depends on the details of the lumps'],
      answer: 0,
      why: {
        1: 'More area, but a weaker field over it: the two effects cancel exactly for an inverse-square field.',
        2: 'The field is weaker farther out, but there is more surface to cross — the same field lines cross both surfaces.',
        3: 'The lumps change where the flux crosses, not how much crosses in total.',
      },
      hints: ['Count field lines: does any line from the charge cross one surface but not the other?'],
      teach: 'The flux through a closed surface depends only on the charge inside, not on the surface’s shape or size.',
      explain: 'Every field line from the charge crosses the sphere once and the lumpy surface once (net), so the fluxes are equal: both q/ε₀.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: 0.3, y: 0.2, q: 2 }], gauss: { shape: 'lumpy', x: 0, y: 0, r: 4.2, angle: 15 }, fieldLines: true, density: 12 }, 'A lumpy closed surface around a point charge, cut by the page.'),
    }),
    mcq({
      id: 'zero-flux', difficulty: 2,
      prompt: 'The net flux through a closed surface is zero. What can you conclude?',
      choices: [
        'The net charge inside is zero — but the field on the surface need not be',
        'The electric field is zero everywhere on the surface',
        'There are no charges inside the surface at all',
        'There are no charges near the surface, inside or out',
      ],
      answer: 0,
      why: {
        1: 'Charges outside, or equal + and − charges inside, make a field on the surface whose flux in and out cancels.',
        2: 'Equal and opposite charges inside also give zero net flux.',
        3: 'Charges outside add no net flux, so they could be anywhere — even right next to the surface.',
      },
      hints: ['What could make the field go in on one side and out on the other?'],
      teach: 'Zero net flux means zero net enclosed charge, not zero field: outside charges thread field through the surface.',
      explain: 'Gauss’s law fixes the total flux, $Q_\\text{enc}/\\varepsilon_0 = 0$. Field lines from an outside charge cross the surface twice — in, then out — so the field on the surface is far from zero, yet the flux cancels.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: -6.5, y: 0.5, q: 3 }], gauss: { shape: 'sphere', x: 1, y: 0, r: 3.5 }, normals: true, fieldLines: true, density: 12 }, 'A Gaussian surface with no charge inside and a charge outside. Green arrows: field leaving; orange: field entering.'),
    }),
    num({
      id: 'cube-face', difficulty: 2,
      gen(r) {
        const q = r.pick([2, 3, 6, 9]), Phi = (q * 1e-9) / (6 * EPS0);
        return {
          prompt: t`A $${q}$ nC point charge sits at the exact centre of a closed cube. What is the flux through **one** face of the cube?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: [{ value: (q * 1e-9) / EPS0, feedback: 'That is the flux through the whole cube. The six faces share it.' }],
          hints: ['The whole cube carries q/ε₀.', 'By symmetry, the six identical faces carry equal shares.'],
          teach: 'Symmetry shares the total flux q/ε₀ equally among identical faces.',
          explain: t`$\Phi_\text{face} = \dfrac{1}{6}\cdot\dfrac{q}{\varepsilon_0} = \dfrac{${q}\times10^{-9}}{6(8.854\times10^{-12})} = ${tn(Phi)}$ N·m²/C.`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: 0, y: 0, q }], gauss: { shape: 'cube', x: 0, y: 0, r: 3.5 }, fieldLines: true, density: 12 }, 'The cube cut through its middle by the page (a square), with the charge at its centre.'),
        };
      },
    }),
    num({
      id: 'cube-corner', difficulty: 3,
      gen(r) {
        const q = r.pick([4, 8, 12]), Phi = (q * 1e-9) / (8 * EPS0);
        return {
          prompt: t`A $${q}$ nC point charge sits exactly at one corner of a cube. What is the net flux through the cube's surface?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: [{ value: (q * 1e-9) / EPS0, feedback: 'Only part of the charge’s field passes through this cube: most of it goes elsewhere.' }, { value: (q * 1e-9) / (6 * EPS0), feedback: 'That is the share of one face for a charge at the centre. Here the charge is at a corner.' }],
          hints: ['Imagine 8 identical cubes meeting at the charge’s corner: together they surround it completely.', t`The 8 cubes together carry $q/\varepsilon_0$, shared equally.`],
          teach: 'A clever choice of surrounding surfaces — here 8 cubes around a corner — lets symmetry do the integral.',
          explain: t`Eight cubes meeting at the corner enclose the charge, so together they carry $q/\varepsilon_0$; by symmetry each carries an eighth: $\dfrac{${q}\times10^{-9}}{8(8.854\times10^{-12})} = ${tn(Phi)}$ N·m²/C. (The three faces that meet at the charge carry none — the field runs along them.)`,
          visual: cubeCorner,
        };
      },
    }),
    num({
      id: 'find-charge', difficulty: 2,
      gen(r) {
        const Phi = r.pick([-4500, -1200, 850, 2600, 6000]), Q = Phi * EPS0;
        return {
          prompt: t`Measurements show a net electric flux of $${tn(Phi)}$ N·m²/C out of a closed box. What is the net charge inside it, in nC?`,
          answer: Q * 1e9, units: 'nC', tol: { rel: 0.01 },
          errors: [{ value: (Phi / EPS0) * 1e9, feedback: t`Multiply by $\varepsilon_0$: $Q_\text{enc} = \varepsilon_0\Phi$.` }],
          hints: [t`$Q_\text{enc} = \varepsilon_0\Phi$.`],
          teach: 'Gauss’s law runs both ways: measure the flux out of a closed surface and you know the charge inside.',
          explain: t`$Q_\text{enc} = \varepsilon_0\Phi = (8.854\times10^{-12})(${tn(Phi)}) = ${tn(Q)}$ C $= ${tn(Q * 1e9)}$ nC.${Phi < 0 ? ' Negative: more field enters than leaves.' : ''}`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], gauss: { shape: 'box', x: 0, y: 0, w: 9, h: 6, depth: 6 }, fieldLines: false, notes: { points: [{ x: 0, y: 0, color: 'ink3', r: 0.01, label: '?', ldx: -4, ldy: 0 }] } }, 'A closed box (cut by the page). What is inside is unknown; only the flux through it was measured.'),
        };
      },
    }),
    multi({
      id: 'which-charges', difficulty: 2,
      prompt: 'A Gaussian surface encloses charge A; charge B sits outside it. Which statements are true?',
      choices: [
        'Both A and B contribute to the field at points on the surface',
        'Only A contributes to the net flux through the surface',
        'Only A contributes to the field at points on the surface',
        'Moving B closer to the surface (still outside) changes the net flux',
        'Moving A around inside the surface leaves the net flux unchanged',
      ],
      answer: [0, 1, 4],
      why: {
        2: 'Every charge makes a field everywhere, including on the surface. B’s field crosses it — in and out.',
        3: 'B’s flux in and out cancel wherever B is, as long as it stays outside.',
      },
      hints: ['Separate two questions: what makes the field at a point, and what makes the net flux?'],
      teach: 'Every charge makes the field on a Gaussian surface; only the charges inside make its net flux.',
      explain: 'The field anywhere is the sum of the fields of all charges, A and B. But B’s field lines enter and leave, so its net flux is zero: the flux is $Q_A/\\varepsilon_0$, wherever A is inside and wherever B is outside.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: -1, y: 0, q: 2, label: 'A' }, { x: 6, y: 1, q: 2, label: 'B' }], gauss: { shape: 'sphere', x: -0.5, y: 0, r: 3.5 }, fieldLines: true, density: 12 }, 'Charge A inside the Gaussian surface, charge B outside it.'),
    }),
    mcq({
      id: 'dipole-error', difficulty: 3, kind: 'error',
      prompt: 'A Gaussian sphere surrounds a dipole: +q and −q a short distance apart. A student writes: “The enclosed charge is zero, so the flux is zero, so the electric field is zero everywhere on the sphere.” Where does the reasoning fail?',
      choices: [
        'At the last step: zero net flux means the outward and inward flux cancel, not that the field vanishes',
        'At the first step: the enclosed charge is 2q',
        'At the second step: Gauss’s law does not apply to a dipole',
        'Nowhere: a dipole has no field outside itself',
      ],
      answer: 0,
      why: {
        1: 'Charges are counted with their signs: +q and −q make zero.',
        2: 'Gauss’s law holds for every closed surface and every arrangement of charges.',
        3: 'A dipole’s field falls off as 1/r³ — fast, but it is not zero.',
      },
      hints: ['Draw the field lines of a dipole. Do any cross the sphere?', 'Near the + charge the field points out; near the − charge, in.'],
      teach: 'Gauss’s law fixes the total flux; it gives the field itself only when symmetry makes the field the same all over the surface.',
      explain: 'The dipole’s field leaves the sphere near the + charge and enters near the − charge. Those fluxes cancel, so Φ = 0 — but the field is not zero anywhere on the sphere except at special points. Only with symmetry (next lesson) can you get E from the flux.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: -1, y: 0, q: 2 }, { x: 1, y: 0, q: -2 }], gauss: { shape: 'sphere', x: 0, y: 0, r: 3.5 }, normals: true, fieldLines: true, density: 12 }, 'A Gaussian sphere around a dipole. Green arrows: field leaving; orange: field entering.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gravity', difficulty: 3, transfer: true,
      gen(r) {
        const [name, M] = r.pick([['Earth', 5.972e24], ['the Moon', 7.342e22], ['Mars', 6.417e23]]), Phi = -4 * Math.PI * GN * M;
        return {
          prompt: t`Newton's gravity obeys the same law: for any closed surface, $\oint\vec g\cdot d\vec A = -4\pi G M_\text{enc}$, where $\vec g$ is the gravitational field (acceleration) and $M_\text{enc}$ the mass inside. What is the flux of gravity through any closed surface around ${name} ($M = ${tn(M, 4)}$ kg), and nothing else? ($G = 6.674\times10^{-11}\ \text{N·m}^2/\text{kg}^2$)`,
          answer: Phi, units: 'm^3/s^2', tol: { rel: 0.01 },
          errors: [{ value: -Phi, feedback: 'Gravity pulls inward, so its flux is negative: the law has a minus sign.' }, { value: -GN * M, feedback: t`Keep the $4\pi$: the flux is $-4\pi GM$.` }],
          hints: [t`Only the mass inside matters: $\Phi_g = -4\pi GM$.`, 'The minus sign: gravity’s field points inward, toward mass.'],
          teach: 'Gauss’s law works for any inverse-square field: for gravity, the flux through a closed surface counts the mass inside.',
          explain: t`$\Phi_g = -4\pi(6.674\times10^{-11})(${tn(M, 4)}) = ${tn(Phi)}\ \text{m}^3/\text{s}^2$, through a sphere, a cube or a potato around it. Taken on a sphere of radius $r$ it gives $g = GM/r^2$ at once; written for a point it becomes Poisson's equation, $\nabla^2\Phi = 4\pi G\rho$ — the Newtonian limit that Einstein's field equations had to reproduce.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.6, 2.6], y: [-1.7, 1.7], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              shade: [{ fn: 'sqrt(max(0, 0.64 - x^2))', lower: '-sqrt(max(0, 0.64 - x^2))', from: -0.8, to: 0.8, color: 'teal', alpha: 0.6 }],
              curves: [{ polar: '1.45 + 0.18*sin(3*theta) + 0.08*cos(5*theta)', theta: [0, 6.2832], color: 'good', width: 2.4 }],
              arrows: [0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k * Math.PI) / 4 + 0.3; return { from: [+(2.3 * Math.cos(a)).toFixed(3), +(1.5 * Math.sin(a)).toFixed(3)], to: [+(1.05 * Math.cos(a)).toFixed(3), +(1.05 * Math.sin(a)).toFixed(3)], color: 'accent' }; }),
            },
            caption: `${name[0].toUpperCase()}${name.slice(1)} (teal), a closed surface around it (green) and its gravitational field (blue arrows), which points inward everywhere. Not to scale.`,
          },
        };
      },
    }),
    num({
      id: 'cp-net', difficulty: 2,
      gen(r) {
        const a = r.pick([5, 8]), b = -r.pick([2, 6]), c = r.pick([1, 4]), Phi = ((a + b + c) * 1e-9) / EPS0;
        return {
          prompt: t`Three charges, $+${a}$ nC, $${b}$ nC and $+${c}$ nC, all sit inside a closed surface. What is the net flux through it?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          hints: [t`$\Phi = Q_\text{enc}/\varepsilon_0$.`],
          teach: 'Add the enclosed charges with their signs, then divide by ε₀.',
          explain: t`$Q_\text{enc} = ${a + b + c}$ nC, so $\Phi = ${tn(Phi)}$ N·m²/C.`,
          visual: gaussPic([{ x: -1.5, y: 0.8, q: a }, { x: 1.4, y: 1, q: b }, { x: 0.2, y: -1.5, q: c }], 3.6, 'The three charges inside the Gaussian surface.'),
        };
      },
    }),
    mcq({
      id: 'cp-move-outside', difficulty: 2,
      prompt: 'A charge outside a closed surface is moved closer to it, staying outside. What happens?',
      choices: [
        'The field on the surface changes, but the net flux through it stays the same',
        'Both the field on the surface and the net flux increase',
        'Neither changes: Gauss’s law ignores charges outside',
        'The net flux becomes negative as the charge approaches',
      ],
      answer: 0,
      why: {
        1: 'The field grows, but the extra flux it carries in is carried out again.',
        2: 'Gauss’s law ignores outside charges only for the net flux. Their fields on the surface are real and change as they move.',
        3: 'Its flux is zero whether it is near or far, as long as it stays outside.',
      },
      hints: ['Separate the field at each point from the total flux.'],
      teach: 'Outside charges change the field on a Gaussian surface but never its net flux.',
      explain: 'Moving the charge changes the field all over the surface — more strongly on the near side. But each of its field lines still enters and leaves, so its net flux is still zero, and the total stays $Q_\\text{enc}/\\varepsilon_0$.',
      visual: fieldLive({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: 6.5, y: 1, q: 3 }], gauss: { shape: 'sphere', x: -1, y: 0, r: 3.5, move: false, resize: false }, normals: true, fieldLines: true, density: 12 }, 'A Gaussian surface and a charge outside it (you can drag the charge). Green arrows: field leaving; orange: entering.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §6.2 Explaining Gauss’s Law', url: 'https://openstax.org/books/university-physics-volume-2/pages/6-2-explaining-gausss-law' },
    { label: 'OpenStax University Physics Vol. 1, §13.2 Gravitation near Earth’s surface', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-2-gravitation-near-earths-surface' },
  ],
});
