// Equipotentials: surfaces of equal V. Field lines cross them at right
// angles, pointing toward lower V, and their spacing gives the field:
// E ≈ ΔV/Δs. A conductor in equilibrium is one of them.
import { lesson, mcq, num } from '../../src/core/content.js';
import { K, EPS0, QE, MP, tn, s3, r6, field } from './_efield.js';

const t = String.raw;

// the worked example: a +2.0 nC point charge and its 300, 200 and 100 V equipotentials
const WX = { q: 2e-9 };
WX.r = [300, 200, 100].map((V) => (K * WX.q) / V);
WX.E1 = 100 / (WX.r[1] - WX.r[0]);
WX.E2 = 100 / (WX.r[2] - WX.r[1]);
WX.Emid = (K * WX.q) / ((WX.r[0] + WX.r[1]) / 2) ** 2;

// flat ground (a conductor at 0 V) under a fair-weather field E pointing down, in metres
const ground = (E, caption, extra = {}) => field({
  unit: 'm', x: [-4, 4], y: [-0.6, 4.4], sheets: [{ x: 0, y: 0, angle: 0, sigma: r6(-EPS0 * E * 1e9) }], uniform: [0, r6(-E / 2)], ref: [0, 0],
  equip: true, fieldLines: false, arrows: 'linear', gridN: 9,
  notes: { lines: Array.from({ length: 21 }, (_, k) => ({ from: [-4 + 0.4 * k, 0], to: [-4.35 + 0.4 * k, -0.35], color: 'ink3', width: 1.2 })) }, ...extra,
}, caption);

// the +3 nC and −1 nC pair (cm, nC), four marked points and the field's size at each (N/C)
const PAIR = [{ x: -2.5, y: 0, q: 3 }, { x: 3, y: 0, q: -1 }];
const SPOTS = [['A', -2.5, 4], ['B', 2.4, -0.7], ['C', 7, 3], ['D', -8, -4]];
const STRONG = SPOTS.map(([, x, y]) => {
  let ex = 0, ey = 0;
  for (const c of PAIR) { const dx = (x - c.x) / 100, dy = (y - c.y) / 100, r = Math.hypot(dx, dy); ex += (K * c.q * 1e-9 * dx) / r ** 3; ey += (K * c.q * 1e-9 * dy) / r ** 3; }
  return Math.hypot(ex, ey);
});

// four candidate directions at P, on the −400 V equipotential of a −2.0 nC charge (cm)
const DIR = (() => {
  const r = (K * 2e-9) / 400 * 100, u = [0.8, 0.6], P = [r6(r * u[0]), r6(r * u[1])], L = 1.8;
  const tip = (d, k = L) => [r6(P[0] + k * d[0]), r6(P[1] + k * d[1])];
  const slant = [Math.cos(-0.23), Math.sin(-0.23)];
  return { P, arrows: [
    { from: P, to: tip([-u[1], u[0]]), label: 'A', color: 'gold' },
    { from: P, to: tip(u), label: 'B', color: 'gold' },
    { from: P, to: tip([-u[0], -u[1]]), label: 'C', color: 'gold', ldx: -16, ldy: 12 },
    { from: P, to: tip(slant, 1.9), label: 'D', color: 'gold', ldx: 6, ldy: 12 },
  ] };
})();

// the proton in an electrostatic analyser: a line charge of −10 nC/m on the axis, an orbit of 4 cm
const AN = { lam: -10e-9, r: 0.04 };
AN.v = Math.sqrt((2 * K * -AN.lam * QE) / MP);
AN.T = (2 * Math.PI * AN.r) / AN.v;

export default lesson({
  id: 'phys2220.E4.3',
  title: 'Equipotentials',
  minutes: 12, difficulty: 2,
  intro: t`An **equipotential** is a surface on which $V$ has the same value everywhere; in a flat picture it shows as a line, like a contour on a map. Moving a charge along one takes no work, so the field has no part along it: **field lines cross equipotentials at right angles**, pointing toward lower $V$. Draw equipotentials at equal steps $\Delta V$, and their spacing $\Delta s$ measures the field:

$$E \approx \frac{|\Delta V|}{\Delta s}$$

Where they crowd together the field is strong; where they spread out it is weak. A conductor in equilibrium is itself an equipotential — surface and inside alike. And a charge released from rest never sets off along an equipotential: it moves across them, toward lower $V$ if it is positive.`,
  symbols: [
    { tex: '\\Delta V', text: 'the step in potential between neighbouring equipotentials, in V' },
    { tex: '\\Delta s', text: 'the distance between them, measured straight across (along the field), in m' },
    { tex: 'E', text: 'the size of the field there, in V/m (the same as N/C); the estimate improves as the step shrinks' },
  ],
  why: 'A map of equipotentials shows at a glance where a field is strong enough to spark — around the edge of an electrode, the tip of a lightning rod or the top of a person standing in a field. Engineers shape electron optics, insulators and ion-thruster grids by shaping these lines.',
  visual: {
    type: 'em-field',
    title: 'Contour lines of the potential',
    lead: t`The violet dashed lines are equipotentials, labelled in volts; the grey lines are field lines. Drag the charges and the probe, or put the proton somewhere and launch it from rest.`,
    tasks: [
      'Field lines cross the equipotentials at right angles everywhere — even where both bend sharply.',
      'Drag the probe along one equipotential: V stays fixed while |E| changes. Where the equipotentials crowd, |E| is large.',
      'Launch the proton from rest on an equipotential: it sets off straight across them, toward lower V — never along one.',
      'Metal sphere: the sphere itself is an equipotential, and the others bend around it.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-6, 6],
      presets: [
        { id: 'dipole', label: 'Dipole', charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: -2 }], probe: { x: 0, y: 3.5 }, particle: { kind: 'proton', x: -6.5, y: 2.5, speed: 0 } },
        { id: 'unequal', label: '+3 nC and −1 nC', charges: [{ x: -2.5, y: 0, q: 3 }, { x: 3, y: 0, q: -1 }], probe: { x: 0, y: 3.5 }, particle: { kind: 'proton', x: -0.5, y: -3.5, speed: 0 } },
        { id: 'sphere', label: 'Metal sphere in a uniform field', conductor: { x: 0, y: 0, R: 2.5, Q: 0 }, uniform: [3000, 0], dV: 50, probe: { x: 3.5, y: 3 }, particle: { kind: 'proton', x: -7, y: 1.5, speed: 0 } },
        { id: 'strips', label: 'Two charged strips', sheets: [{ x: 0, y: 1.5, angle: 0, sigma: 20, width: 8 }, { x: 0, y: -1.5, angle: 0, sigma: -20, width: 8 }], probe: { x: 5.5, y: 2.5 }, particle: { kind: 'proton', x: -2, y: 1, speed: 0 } },
      ],
      preset: 'dipole', readouts: ['V', 'E'], toggles: ['equip', 'fieldLines'], equip: true, fieldLines: true, density: 10, arrows: false,
    },
    caption: 'Charges in nC; the uniform field is 3000 N/C and the strips carry ±20 nC/m². Equipotentials are drawn at a tidy step in volts.',
  },
  example: {
    prompt: t`A $+2.0$ nC point charge sits alone. (a) Find the radii of its 300 V, 200 V and 100 V equipotentials. (b) Use their spacing to estimate the field between the 300 V and 200 V surfaces, and between the 200 V and 100 V surfaces. (c) How much work does the field do on a $+1.0$ nC charge carried from the 300 V surface to the 100 V surface?`,
    visual: field({ unit: 'cm', x: [-20, 20], y: [-12.5, 12.5], charges: [{ x: 0, y: 0, q: 2 }], equip: true, levels: [100, 200, 300], fieldLines: true, density: 12, notes: { arrows: [{ from: [r6(WX.r[0] * 100 * 0.6), r6(-WX.r[0] * 100 * 0.8)], to: [r6(WX.r[1] * 100 * 0.6), r6(-WX.r[1] * 100 * 0.8)], label: 'Δs', color: 'gold', ldx: 8, ldy: 8 }] } }, 'The charge, its field lines (grey) and its 300, 200 and 100 V equipotentials (violet): spheres, seen as circles. Equal steps in V, ever wider gaps.'),
    steps: [
      { label: '(a) Radii', text: t`On an equipotential $kq/r = V$, so $r = kq/V$. With $kq = (8.988\times10^{9})(2.0\times10^{-9}) = 17.98$ V·m: $r_{300} = ${tn(WX.r[0] * 100)}$ cm, $r_{200} = ${tn(WX.r[1] * 100)}$ cm, $r_{100} = ${tn(WX.r[2] * 100)}$ cm.` },
      { label: '(b) Spacing', text: t`From 300 V to 200 V the surfaces are $${tn((WX.r[1] - WX.r[0]) * 100)}$ cm apart: $E \approx \dfrac{100\ \text{V}}{${s3(WX.r[1] - WX.r[0], 3)}\ \text{m}} = ${tn(WX.E1)}$ V/m. From 200 V to 100 V they are $${tn((WX.r[2] - WX.r[1]) * 100)}$ cm apart: $E \approx ${tn(WX.E2)}$ V/m — weaker further out, as the wider gap shows.` },
      { label: 'Check', text: t`The exact field halfway between the first pair, at $r = ${tn(((WX.r[0] + WX.r[1]) / 2) * 100)}$ cm, is $kq/r^2 = ${tn(WX.Emid)}$ V/m: the estimate is within ${Math.round((100 * (WX.E1 - WX.Emid)) / WX.Emid)}%. It points straight out, across the circles, from 300 V toward 100 V.` },
      { label: '(c) Work', text: t`The work depends only on the two potentials: $W = q(V_A - V_B) = (1.0\times10^{-9})(300 - 100) = 2.0\times10^{-7}$ J, by any path. Any part of the path that runs along an equipotential adds nothing.` },
    ],
    answer: t`(a) ${tn(WX.r[0] * 100)}, ${tn(WX.r[1] * 100)} and ${tn(WX.r[2] * 100)} cm; (b) about $${tn(WX.E1)}$ V/m and $${tn(WX.E2)}$ V/m, pointing outward; (c) $2.0\times10^{-7}$ J.`,
  },
  practice: [
    num({
      id: 'spacing-E', difficulty: 1,
      gen(r) {
        const dV = r.pick([5, 10, 20]), ds = r.pick([2, 4, 5]), E = dV / (ds / 1000);
        return {
          prompt: t`Neighbouring equipotentials in a region of uniform field are ${dV} V apart and ${ds} mm apart. How strong is the field?`,
          answer: E, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: dV * (ds / 1000), feedback: t`Field is volts per metre: divide the step in $V$ by the spacing.` }],
          hints: [t`$E \approx \Delta V/\Delta s$, with $\Delta s$ in metres.`],
          teach: 'The field is the step in V divided by the distance across which it happens: E ≈ ΔV/Δs.',
          explain: t`$E = \dfrac{\Delta V}{\Delta s} = \dfrac{${dV}\ \text{V}}{${ds / 1000}\ \text{m}} = ${tn(E)}$ V/m, pointing across the equipotentials toward lower $V$.`,
          visual: field({ unit: 'mm', x: [-2.6 * ds, 2.6 * ds], y: [-1.625 * ds, 1.625 * ds], uniform: [r6(E), 0], ref: [0, 0], equip: true, levels: [-2, -1, 0, 1, 2].map((k) => k * dV), fieldLines: false, arrows: 'linear', gridN: 9, notes: { arrows: [{ from: [0, r6(-1.2 * ds)], to: [ds, r6(-1.2 * ds)], label: 'Δs', color: 'gold', ldx: -6, ldy: 16 }] } }, 'Equipotentials (violet, labelled) in a uniform field (arrows), and the spacing between neighbours (gold).'),
        };
      },
    }),
    mcq({
      id: 'why-perpendicular', difficulty: 1,
      prompt: 'Why do field lines always cross equipotentials at right angles?',
      choices: [
        'If the field had a part along an equipotential, it would do work on a charge moving along it — but V does not change there, so no work can be done',
        'Because field lines start on charges and equipotentials are circles around them',
        'It is only a convention for drawing them neatly',
        'Because the field is zero on an equipotential',
      ],
      answer: 0,
      why: {
        1: 'Around a lone point charge, yes — but they cross at right angles everywhere, also where the equipotentials are far from circles (near the strips, around the metal sphere).',
        2: 'It is forced by energy: the work done along a path is −qΔV, and along an equipotential ΔV = 0.',
        3: 'The field is generally not zero there: V is the same along the surface, which says nothing about how fast V changes across it.',
      },
      hints: ['How much work does the field do on a charge carried along an equipotential?'],
      teach: 'No work is done moving along an equipotential, so the field has no component along it: field lines cross equipotentials at right angles.',
      explain: 'Carrying a charge along an equipotential, ΔV = 0, so the field does no work: the field has no component along the surface. All of it points straight across — toward lower V.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: -2.5, y: 0, q: 3 }, { x: 3, y: 0, q: -1 }], equip: true, equipLabels: false, fieldLines: true, density: 12 }, 'A +3 nC and a −1 nC charge: field lines (grey) and equipotentials (violet).'),
    }),
    mcq({
      id: 'strongest', difficulty: 1, fixedOrder: true,
      prompt: 'At which of the marked points is the field strongest?',
      choices: ['A', 'B', 'C', 'D'],
      answer: 1,
      why: {
        0: 'A is fairly close to the +3 nC charge, but at B the equipotentials are packed far more tightly.',
        2: 'At C the equipotentials are far apart: the field there is weak.',
        3: 'D is far from both charges, where the equipotentials spread out.',
      },
      hints: ['Look for the point where neighbouring equipotentials (equal steps in V) are closest together.'],
      teach: 'With equipotentials drawn at equal steps, the field is strongest where they crowd together.',
      explain: `B sits close to the −1 nC charge, where the equipotentials crowd together, so V changes fastest with distance there: about ${STRONG.map((e) => (+e.toPrecision(2)).toLocaleString('en-US').replace(/,/g, '\u2009')).join(', ').replace(/, ([^,]*)$/, ' and $1')} N/C at A, B, C and D. A small charge close by can beat a large one further away.`,
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: PAIR, equip: true, levels: Array.from({ length: 21 }, (_, k) => -1600 + 200 * k), equipLabels: false, fieldLines: false, notes: { points: SPOTS.map(([label, x, y]) => ({ x, y, label, color: 'gold' })) } }, 'A +3 nC charge (left) and a −1 nC charge (right), with equipotentials every 200 V.'),
    }),
    mcq({
      id: 'released', difficulty: 2,
      prompt: 'A proton is released from rest at the point P, on an equipotential. Which way does it start to move?',
      choices: [
        'Straight across the equipotentials, toward lower V',
        'Along the equipotential through P, where its energy can stay the same',
        'Nowhere: V does not change along the equipotential, so there is no force',
        'Straight across the equipotentials, toward higher V',
      ],
      answer: 0,
      why: {
        1: 'Starting from rest it has no motion along the equipotential to keep, and the force has no part along it. The force points straight across.',
        2: 'V is constant along the equipotential but not across it. The force is set by how fast V changes, and across the equipotential it changes.',
        3: 'A positive charge’s potential energy qV falls toward lower V; that is the way the force pushes it.',
      },
      hints: ['The force on the proton is qE. Which way does E point relative to the equipotentials?'],
      teach: 'Released from rest, a charge starts moving along the field: straight across the equipotentials, toward lower V if it is positive.',
      explain: 'The force qE points along the field, which crosses the equipotential at right angles, toward lower V. So the proton sets off straight across the equipotentials, downhill in V, gaining kinetic energy as it goes. (Its path then curves, following the field lines only roughly once it has speed.)',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: -2 }], equip: true, fieldLines: false, probe: { x: -5.063, y: 2.063, label: 'P' }, probeArrow: false }, 'A dipole’s equipotentials (violet, every 200 V; some labelled) and the point P, on the 400 V equipotential.'),
    }),
    mcq({
      id: 'direction', difficulty: 2, fixedOrder: true,
      prompt: 'The picture shows the equipotentials around a −2.0 nC charge. Which arrow shows the direction of the field at P?',
      choices: ['A', 'B', 'C', 'D'],
      answer: 2,
      why: {
        0: 'A runs along the equipotential, where V does not change: the field has no part along it.',
        1: 'B points straight across the equipotentials, but toward higher V (they get less negative outward). The field points toward lower V.',
        3: 'D crosses the equipotential at a slant. The field always crosses at a right angle.',
      },
      hints: ['The field is perpendicular to the equipotentials.', 'It points toward lower V. Near a negative charge, where is V lowest?'],
      teach: 'The field at a point is perpendicular to the equipotential there and points toward lower V.',
      explain: 'The field crosses the equipotential at a right angle, toward lower V. Near a negative charge V is most negative close in, so the field points inward, toward the charge: arrow C.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], charges: [{ x: 0, y: 0, q: -2 }], equip: true, levels: [-1000, -800, -600, -400, -200], fieldLines: false, probe: { x: DIR.P[0], y: DIR.P[1], label: 'P' }, probeArrow: false, notes: { arrows: DIR.arrows } }, 'A −2.0 nC charge, its equipotentials every 200 V (violet, labelled), and four candidate directions at P, on the −400 V equipotential.'),
    }),
    mcq({
      id: 'conductor', difficulty: 2,
      prompt: 'A charged metal sphere sits near a negative point charge. What is the potential inside the metal?',
      choices: [
        'The same as on its surface, everywhere inside: the whole conductor is one equipotential',
        'Zero, because the field inside is zero',
        'Highest on the side away from the negative charge, where the surface charge is densest',
        'It varies from point to point, because the surface charge is uneven',
      ],
      answer: 0,
      why: {
        1: 'E = 0 inside means V does not change inside — not that it is zero. Here the sphere sits at a few hundred volts.',
        2: 'The surface charge is uneven, but it arranges itself exactly so that V is the same all over the conductor.',
        3: 'If V varied, there would be a field in the metal, and the free charge would move until it no longer varied.',
      },
      hints: ['What is the field inside the metal? What does that say about how V changes from point to point there?'],
      teach: 'A conductor in equilibrium is one equipotential throughout, though its surface charge is uneven.',
      explain: 'The field in the metal is zero, so moving from point to point inside changes V by nothing: the whole sphere — surface and inside — sits at one potential. Its surface is one of the equipotentials (the others wrap around it), which is why field lines meet it at right angles. That potential is not zero: E = 0 does not mean V = 0.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], conductor: { x: -2, y: 0, R: 2.5, Q: 4 }, charges: [{ x: 5, y: 0, q: -2 }], equip: true, fieldLines: false }, 'The charged sphere (grey), the negative charge and their equipotentials (violet, labelled in volts).'),
    }),
    num({
      id: 'radii', difficulty: 2,
      gen(r) {
        const q = r.pick([1, 2, 5]), [V1, V2] = r.pick([[100, 50], [300, 150], [200, 100]]);
        const r1 = (K * q * 1e-9) / V1, r2 = (K * q * 1e-9) / V2, d = r2 - r1;
        return {
          prompt: t`How far apart are the ${V1} V and ${V2} V equipotentials of a lone $+${q}$ nC point charge?`,
          answer: d * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: ((K * q * 1e-9) / (V1 - V2)) * 100, feedback: t`$kq/\Delta V$ is not a distance between surfaces. Find each radius, $r = kq/V$, then subtract.` }],
          hints: [t`Each equipotential is a sphere of radius $r = kq/V$.`],
          teach: 'A point charge’s equipotentials are spheres of radius kq/V: equal steps in V give ever wider gaps further out.',
          explain: t`$r_{${V1}} = \dfrac{kq}{${V1}} = ${tn(r1 * 100)}$ cm and $r_{${V2}} = \dfrac{kq}{${V2}} = ${tn(r2 * 100)}$ cm, so they are $${tn(d * 100)}$ cm apart. The field there is about $${V1 - V2}\ \text{V}/${s3(d, 3)}\ \text{m} = ${tn((V1 - V2) / d)}$ V/m.`,
          visual: field({ unit: 'cm', x: [-2.2 * r2 * 100, 2.2 * r2 * 100], y: [-1.375 * r2 * 100, 1.375 * r2 * 100], axes: false, grid: false, charges: [{ x: 0, y: 0, q }], equip: true, levels: [V2, V1], fieldLines: true, density: 12 }, 'The charge and its two equipotentials (violet, labelled), with field lines (grey).'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fair-weather', difficulty: 2, transfer: true,
      gen(r) {
        const E = r.pick([100, 120, 150]), h = r.pick([1.5, 1.8, 2.0]), V = E * h;
        return {
          prompt: t`Over open, flat ground in fair weather, the atmosphere's field is about ${E} V/m, pointing down. Taking the ground as 0 V, what is the potential ${h} m up — before anyone stands there?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: E / h, feedback: t`$V$ rises by $E$ for every metre of height: multiply.` }],
          hints: ['The field points down, so V rises going up.', t`$V = Eh$.`],
          teach: 'In a uniform field the equipotentials are planes, and V changes by E for every metre across them.',
          explain: t`$V = Eh = (${E}\ \text{V/m})(${h}\ \text{m}) = ${tn(V)}$ V. The equipotentials are level surfaces, ${E} V apart for every metre of height: the air at head height is at a couple of hundred volts.`,
          visual: ground(E, `Flat ground (hatched), the downward fair-weather field (arrows, ${E} V/m) and the equipotentials every 50 V (violet): level planes, seen edge-on.`, { levels: [1, 2, 3, 4, 5, 6].map((k) => k * 50) }),
        };
      },
    }),
    mcq({
      id: 'cp-person', difficulty: 2, transfer: true,
      prompt: 'So a person 1.8 m tall standing on that ground has about 200 V of air potential between head height and their feet. Why don’t they feel it?',
      choices: [
        'Their body conducts: it becomes part of the grounded equipotential, and the equipotentials bend up and over them',
        'They do feel it, but 200 V is too small to notice',
        'The air insulates them from the field',
        'The field is zero close to the ground',
      ],
      answer: 0,
      why: {
        1: 'There is no 200 V across them at all: charge moves in the body until it is all at ground potential.',
        2: 'The field acts through air perfectly well. What matters is that the body conducts, so it settles at one potential.',
        3: 'Over flat open ground the field reaches right down to the surface. It is the person who changes it nearby.',
      },
      hints: ['A human body conducts electricity, if poorly. What does a conductor in equilibrium do to the potential?'],
      teach: 'A grounded conductor joins the ground’s equipotential; the equipotentials of the field outside bend around it.',
      explain: 'A person standing on the ground is a (poor) conductor connected to it: a little charge flows until their whole body is at the ground’s potential, 0 V. Their surface is now part of the 0 V equipotential, so the others bend up and over them, crowding above the head — where the field is several times stronger than over flat ground. That is also why lightning rods and tall masts, with sharp tops, see the strongest fields.',
      visual: field({ unit: 'm', x: [-5, 5], y: [0.02, 6.27], conductor: { x: 0, y: 0, R: 1.8, Q: 0 }, uniform: [0, -120], ref: [0, 0], equip: true, levels: [1, 2, 3, 4, 5, 6, 7].map((k) => k * 100), fieldLines: true, density: 14, notes: { lines: [{ from: [-5, 0.05], to: [5, 0.05], color: 'ink2', width: 3 }] } }, 'A grounded conducting dome, 1.8 m high — a rough stand-in for a person, a tree or a building — in a fair-weather field of 120 V/m. The equipotentials (violet, every 100 V) bend over it and crowd at its top, where the field is three times as strong as over flat ground.'),
    }),
    mcq({
      id: 'cp-analyser', difficulty: 2, transfer: true,
      prompt: 'In an electrostatic analyser, ions fly along a circular arc between two curved metal plates, following an equipotential. What happens to an ion’s speed as it goes round?',
      choices: [
        'It stays the same: the field is perpendicular to the motion, so it does no work — it only bends the path',
        'It increases: the field keeps pushing on the ion',
        'It decreases: the ion loses energy to the field as it goes',
        'The ion cannot move along an equipotential at all',
      ],
      answer: 0,
      why: {
        1: 'The field pushes sideways, toward the centre of the arc, never along the motion. A sideways push turns an ion without speeding it up.',
        2: 'Along an equipotential V does not change, so neither does the ion’s potential energy, nor — with no other forces — its kinetic energy.',
        3: 'Released from rest it could not start along one; but already moving along one, it can stay on it if the field bends its path just right.',
      },
      hints: ['How much work does a force do when it is perpendicular to the motion?'],
      teach: 'A charge moving along an equipotential keeps its speed: the field is perpendicular to its motion and does no work.',
      explain: 'Along an equipotential qV stays fixed, so the ion’s kinetic energy does too: the field points straight across the equipotential, toward the centre, and supplies only the centripetal force. Only ions of one particular energy follow the arc between the plates — others hit a plate — which is how analysers in mass spectrometers and on spacecraft plasma instruments sort particles by energy.',
      visual: field({ unit: 'cm', x: [-8, 8], y: [-5, 5], lines: [{ x: 0, y: 0, lambda: -10 }], equip: true, equipLabels: false, fieldLines: false, particle: { kind: 'proton', x: 4, y: 0, speed: r6(AN.v), angle: 90, path: true, tmax: r6(AN.T / 3) } }, 'The field between an analyser’s curved plates (not drawn) is that of a line of charge on their common axis: circular equipotentials (violet). A proton (gold path) moving at the right speed follows one.'),
    }),
    num({
      id: 'cp-edge', difficulty: 2, transfer: true,
      gen(r) {
        const dV = r.pick([500, 1000]), ds = r.pick([0.25, 0.4, 0.8]), E = dV / (ds / 1000);
        return {
          prompt: t`A field map of a high-voltage electrode pair shows equipotentials ${dV} V apart. Around the sharp edge of one electrode they crowd to just ${ds} mm apart. Estimate the field there. (Dry air breaks down at about $3\times10^{6}$ V/m.)`,
          answer: E, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: dV * (ds / 1000), feedback: t`Divide the step in $V$ by the spacing: $E \approx \Delta V/\Delta s$.` }],
          hints: [t`$E \approx \Delta V/\Delta s$, with $\Delta s$ in metres.`],
          teach: 'Crowded equipotentials mark a strong field: E ≈ ΔV/Δs, largest at sharp edges.',
          explain: t`$E \approx \dfrac{${dV}\ \text{V}}{${ds / 1000}\ \text{m}} = ${tn(E)}$ V/m. ${E >= 3e6 ? 'That is above the breakdown field: the air at the edge would ionise and spark or glow (corona).' : 'That is below the breakdown field, but not by a wide margin.'} Designers round off electrode edges to spread the equipotentials out.`,
          visual: field({ unit: 'mm', x: [-10, 10], y: [-6.25, 6.25], sheets: [{ x: 0, y: 1.2, angle: 0, sigma: 20000, width: 10 }, { x: 0, y: -1.2, angle: 0, sigma: -20000, width: 10 }], equip: true, equipLabels: false, levels: Array.from({ length: 11 }, (_, k) => -2500 + 500 * k), fieldLines: false }, 'Two thin electrodes edge-on, with equipotentials (violet) at equal steps: spread evenly between the electrodes, crowded tightly around their edges.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §7.5 Equipotential Surfaces and Conductors', url: 'https://openstax.org/books/university-physics-volume-2/pages/7-5-equipotential-surfaces-and-conductors' },
  ],
});
