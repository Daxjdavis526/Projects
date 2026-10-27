// Electric flux: how much field passes through a surface. Φ = EA cos θ for a
// flat surface in a uniform field; Φ = ∫E·dA in general; for a closed
// surface the normal points out, so field leaving counts positive.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, field, fieldLive } from './_efield.js';

const t = String.raw;
const rad = (d) => (d * Math.PI) / 180;

// a flat square standing across the page, seen edge-on, in a uniform field pointing right
const patchPic = (normalDeg, caption, extra = {}) => field({ unit: 'cm', x: [-8, 8], y: [-5, 5], uniform: [2000, 0], fieldLines: true, density: 10, patch: { shape: 'square', x: 0, y: 0, angle: normalDeg, size: 6 }, ...extra }, caption);

// a tilted rectangle in 3D, its normal (60° from the field) and the field, for the worked example.
// The field runs along y, which the default camera shows left to right.
const rect3d = (() => {
  const c = [0, 0, 0.6], u = [0, 1.6 * Math.cos(rad(30)), -1.6 * Math.sin(rad(30))], v = [2, 0, 0];
  const n = [0, Math.sin(rad(30)), Math.cos(rad(30))], r4 = (a) => a.map((x) => +x.toFixed(4));
  return {
    type: 'calc-vectors3d',
    params: {
      range: 2.4,
      parallelograms: [{ at: r4(c.map((x, i) => x - u[i] / 2 - v[i] / 2)), u: r4(u), v, color: 'gold', alpha: 0.35 }],
      vectors: [
        { from: c, to: r4(c.map((x, i) => x + 1.4 * n[i])), color: 'gold', label: '\\hat n' },
        ...[-0.7, 0.7].map((x) => ({ from: [x, -2.2, 0.6], to: [x, 2.0, 0.6], color: 'accent' })),
        { from: [0, -2.2, 0.6], to: [0, 2.0, 0.6], color: 'accent', label: '\\vec E' },
      ],
    },
    caption: 'The rectangle (gold) tilted 30° from the field direction, its normal n̂ (60° from the field) and the uniform field (blue) passing through it. Drag to turn the picture.',
  };
})();

export default lesson({
  id: 'phys2220.E3.1',
  title: 'Electric flux',
  minutes: 11, difficulty: 2,
  intro: t`**Flux** measures how much field passes through a surface. For a flat surface of area $A$ in a uniform field, only the part of $\vec E$ that crosses the surface counts: $\Phi_E = EA\cos\theta$, where $\theta$ is the angle between $\vec E$ and the surface's **normal**, the direction straight out of it. For a curved surface or a field that varies, add up the contributions of many small pieces:

$$\Phi_E = \int \vec E\cdot d\vec A$$

For a **closed** surface the normal always points **outward**, so field leaving the surface counts as positive flux and field entering it as negative.`,
  symbols: [
    { tex: '\\Phi_E', text: 'the electric flux through the surface, in N·m²/C' },
    { tex: 'd\\vec A', text: 'a small piece of the surface as a vector: its size is the piece’s area, its direction the normal — outward, for a closed surface' },
    { tex: '\\vec E\\cdot d\\vec A', text: 'the dot product $E\\,dA\\cos\\theta$: the field’s component along the normal, times the area' },
    { tex: '\\theta', text: 'the angle between $\\vec E$ and the normal — not the angle between $\\vec E$ and the surface itself' },
    { tex: '\\int', text: 'add over every piece of the surface; for a flat surface in a uniform field it is just $EA\\cos\\theta$' },
  ],
  why: 'Flux is the quantity in Gauss’s law, the next lesson: the flux out of any closed surface counts the charge inside it. The same idea measures sunlight on a solar panel and air through a duct.',
  visual: {
    type: 'em-field',
    title: 'Turn a surface in a field',
    lead: t`A square, 6 cm on a side, stands across the page; you see it edge-on as a gold line, with its normal $\hat n$. Turn it with the handle at the tip of $\hat n$, move it by its centre, and read the flux through it.`,
    tasks: [
      'Turn the square until the flux is zero: the field then skims along it (θ = 90°).',
      'Keep turning past 90°: the flux goes negative — the normal now points against the field.',
      'Switch to the point charge and drag the square toward it: the flux grows, because the field there is stronger.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-6, 6],
      presets: [
        { id: 'uniform', label: 'Uniform field', uniform: ['E0', 0], patch: { shape: 'square', x: 0, y: 0, angle: 30, size: 6 } },
        { id: 'point', label: 'Point charge', charges: [{ x: -6, y: 0, q: 3, drag: false }], patch: { shape: 'square', x: 1, y: 0, angle: 0, size: 6 } },
      ],
      sliders: [{ key: 'E0', label: 'Uniform field $E$', min: 0, max: 4000, step: 100, value: 2000, unit: '\\mathrm{N/C}', explain: 'Pointing to the right (used by the uniform-field arrangement).' }],
      preset: 'uniform', readouts: ['flux'], arrows: false, fieldLines: true, density: 10,
    },
    caption: 'The square extends 3 cm in front of and behind the page. Its flux is computed by integrating E·dA over the whole square, so it is right for the point charge too, where the field changes across it.',
  },
  example: {
    prompt: t`(a) A flat rectangle 0.20 m by 0.30 m sits in a uniform field of 500 N/C. Its surface is tilted 30° from the direction of the field. What is the flux through it? (b) A closed cube 0.10 m on a side sits in the same field, two of its faces at right angles to the field. What is the flux through each face, and in total?`,
    visual: rect3d,
    steps: [
      { label: 'Find θ', text: t`$\theta$ is measured from the **normal**. The surface is 30° from the field, so its normal is $90^\circ - 30^\circ = 60^\circ$ from it.` },
      { label: '(a) Flux', text: t`$\Phi_E = EA\cos\theta = (500)(0.20 \times 0.30)\cos 60^\circ = (500)(0.060)(0.5) = 15$ N·m²/C.` },
      { label: '(b) Each face', text: t`Each face has $A = 0.010$ m². On the face the field enters, the outward normal points against $\vec E$: $\Phi = -EA = -5.0$ N·m²/C. On the face it leaves: $+5.0$ N·m²/C. On the other four faces the field skims along the surface: $\cos 90^\circ = 0$.` },
      { label: 'Total', text: t`$-5.0 + 5.0 + 0 = 0$. Every field line that enters the cube also leaves it.` },
    ],
    answer: t`(a) 15 N·m²/C. (b) $-5.0$ and $+5.0$ N·m²/C through the two faces across the field, 0 through the others: 0 in total.`,
  },
  practice: [
    num({
      id: 'flat-flux', difficulty: 1,
      gen(r) {
        const E = r.pick([200, 500, 800, 1500]), side = r.pick([0.1, 0.2, 0.3]), th = r.pick([0, 30, 45, 60]);
        const Phi = E * side * side * Math.cos(rad(th));
        return {
          prompt: t`A square ${side} m on a side sits in a uniform field of ${E} N/C. Its normal makes ${th}° with the field. What is the flux through it?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: th === 0 || th === 45 ? [] : [{ value: E * side * side * Math.sin(rad(th)), feedback: t`$\theta$ is the angle between $\vec E$ and the **normal**: use $\cos\theta$.` }],
          hints: [t`$\Phi_E = EA\cos\theta$ with $A = (${side})^2$ m².`],
          teach: 'For a flat surface in a uniform field the flux is EA cos θ, with θ measured from the normal.',
          explain: t`$\Phi_E = (${E})(${s3(side * side, 3)})\cos ${th}^\circ = ${tn(Phi)}$ N·m²/C.`,
          visual: patchPic(th, `The square seen edge-on (gold), its normal at ${th}° to the field.`),
        };
      },
    }),
    mcq({
      id: 'max-flux', difficulty: 1,
      prompt: 'How should a flat surface be turned in a uniform field to get the largest flux through it?',
      choices: [
        'With its normal along the field: the surface faces the field head-on',
        'With the surface parallel to the field, so the field runs along it',
        'At 45°, halfway between the two',
        'It makes no difference: the flux depends only on E and A',
      ],
      answer: 0,
      why: {
        1: 'Then θ = 90° and cos θ = 0: no field crosses the surface at all.',
        2: 'cos 45° ≈ 0.71: less than head-on.',
        3: 'The cos θ factor matters: the same surface can catch all of the field, or none.',
      },
      hints: [t`$\Phi_E = EA\cos\theta$. When is $\cos\theta$ largest?`],
      teach: 'Flux is largest when the surface faces the field head-on (normal along E) and zero when the field skims along it.',
      explain: t`$\cos\theta$ is largest, 1, when $\theta = 0$: the normal points along $\vec E$, so the surface meets the field head-on and $\Phi_E = EA$.`,
      visual: patchPic(50, 'A square in a uniform field, seen edge-on, with its normal.'),
    }),
    num({
      id: 'surface-angle', difficulty: 2,
      gen(r) {
        const E = r.pick([300, 600, 900]), a = r.pick([0.2, 0.25, 0.4]), b = r.pick([0.3, 0.5]), al = r.pick([20, 30, 60, 70]);
        const Phi = E * a * b * Math.sin(rad(al));
        return {
          prompt: t`A flat ${a} m × ${b} m panel sits in a uniform ${E} N/C field. The panel itself is tilted ${al}° away from the field direction. What is the flux through it?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: [{ value: E * a * b * Math.cos(rad(al)), feedback: t`${al}° is the angle between the field and the **surface**. The normal is $90^\circ - ${al}^\circ = ${90 - al}^\circ$ from the field.` }],
          hints: ['Find the angle between the field and the normal first.', t`$\theta = 90^\circ - ${al}^\circ$, so $\cos\theta = \sin ${al}^\circ$.`],
          teach: 'Measure θ from the normal: a surface tilted α from the field has its normal at 90° − α, so Φ = EA sin α.',
          explain: t`$\theta = 90^\circ - ${al}^\circ = ${90 - al}^\circ$, so $\Phi_E = (${E})(${s3(a * b, 3)})\cos ${90 - al}^\circ = ${tn(Phi)}$ N·m²/C.`,
          visual: patchPic(90 - al, `The panel seen edge-on, tilted ${al}° from the field; its normal (n̂) is ${90 - al}° from the field.`),
        };
      },
    }),
    num({
      id: 'disc', difficulty: 2,
      gen(r) {
        const E = r.pick([1000, 2500, 4000]), R = r.pick([5, 10, 15]), th = r.pick([0, 25, 50]);
        const Phi = E * Math.PI * (R / 100) ** 2 * Math.cos(rad(th));
        return {
          prompt: t`A flat disc of radius ${R} cm sits in a uniform field of ${E} N/C, its normal at ${th}° to the field. What is the flux through it?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: [{ value: E * 2 * Math.PI * (R / 100) * Math.cos(rad(th)), feedback: t`That uses the circumference, $2\pi r$. The area of a disc is $\pi r^2$.` }],
          hints: [t`$A = \pi r^2$ with $r = ${R / 100}$ m.`],
          teach: 'Φ = EA cos θ works for any flat shape: only its area and tilt matter in a uniform field.',
          explain: t`$A = \pi(${R / 100})^2 = ${tn(Math.PI * (R / 100) ** 2)}$ m², so $\Phi_E = (${E})(${tn(Math.PI * (R / 100) ** 2)})\cos ${th}^\circ = ${tn(Phi)}$ N·m²/C.`,
          visual: field({ unit: 'cm', x: [-20, 20], y: [-12, 12], uniform: [E, 0], fieldLines: true, density: 10, patch: { shape: 'disk', x: 0, y: 0, angle: th, size: 2 * R } }, 'The disc seen edge-on (its diameter is the gold line), with its normal.'),
        };
      },
    }),
    num({
      id: 'hemisphere', difficulty: 2,
      gen(r) {
        const E = r.pick([500, 800, 1200]), R = r.pick([0.1, 0.2, 0.3]), Phi = E * Math.PI * R * R;
        return {
          prompt: t`A hemisphere (a bowl with no lid) of radius ${R} m sits in a uniform field of ${E} N/C, its open face at right angles to the field, so the field passes in through the open face and out through the curved surface. What is the flux through the curved surface?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: [{ value: E * 2 * Math.PI * R * R, feedback: t`$2\pi R^2$ is the curved area, but the field crosses most of it at a slant. Count field lines instead: every line through the open face comes out through the curved surface.` }],
          hints: ['Every field line that crosses the flat open face also crosses the curved surface.', t`So the flux through the curved surface equals the flux through the flat disc of radius $R$: $E\pi R^2$.`],
          teach: 'Flux counts the field lines crossing a surface; two surfaces with the same edge, crossed by the same lines, carry the same flux.',
          explain: t`The field lines through the flat face are exactly those through the curved face, so $\Phi = E\pi R^2 = (${E})\pi(${R})^2 = ${tn(Phi)}$ N·m²/C. Integrating $E\cos\theta\,dA$ over the curved surface gives the same answer, with more work.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.8, 1.8], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [-1.5708, 1.5708], color: 'gold', width: 3 }, { param: ['0', 't'], t: [-1, 1], color: 'gold', width: 1.5, dash: true }],
              arrows: [-0.75, -0.25, 0.25, 0.75].map((y) => ({ from: [-1.7, y], to: [1.7, y], color: 'accent' })),
            },
            caption: 'The hemisphere in cross-section (gold), its open face dashed, and the uniform field (blue).',
          },
        };
      },
    }),
    mcq({
      id: 'closed-uniform', difficulty: 2,
      prompt: 'A closed surface of any shape sits in a uniform electric field, with no charge inside it. What is the net flux through it?',
      choices: [
        'Zero: every field line that enters it also leaves it',
        'EA, where A is its total surface area',
        'Positive, because the field points out through some of it',
        'It depends on the shape of the surface',
      ],
      answer: 0,
      why: {
        1: 'Only the parts crossing the field count, and the outward normal makes the entering flux negative.',
        2: 'Field leaves through part of it — but enters through another part, and that flux is negative.',
        3: 'The shape changes how the flux is shared out over the surface, not the total.',
      },
      hints: ['Field entering counts negative, field leaving positive. In a uniform field, does any line start or stop inside?'],
      teach: 'For a closed surface with no charge inside, every field line that goes in comes out: the net flux is zero.',
      explain: 'The outward normal makes flux in negative and flux out positive. A uniform field has no sources: each line that enters leaves again, so the two parts cancel exactly — whatever the shape.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], uniform: [1500, 0], fieldLines: true, density: 10, gauss: { shape: 'lumpy', x: 0, y: 0, r: 3.5, angle: 20, move: false, resize: false }, normals: true }, 'A closed lumpy surface in a uniform field, cut by the page. Green arrows: field leaving; orange: field entering. Their lengths show E·n̂.'),
    }),
    num({
      id: 'non-uniform', difficulty: 3,
      gen(r) {
        const b = r.pick([500, 1000, 2000]), L = r.pick([0.1, 0.2]), a = r.pick([0.1, 0.3, 0.5]);
        const Phi = b * L ** 3;
        return {
          prompt: t`In a region the field is $\vec E = (b x)\,\hat\imath$ with $b = ${b}$ N/(C·m) — pointing along $x$ and growing with $x$. A cube of side ${L} m has its faces at $x = ${a}$ m and $x = ${+(a + L).toFixed(3)}$ m. What is the net flux out of the cube?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: [{ value: b * (a + L) * L * L, feedback: 'That is only the flux out through the far face. The near face lets field in: subtract it.' }, { value: 0, feedback: 'The field is not uniform here: more leaves through the far face than enters through the near one.' }],
          hints: ['Only the two faces at right angles to x have flux; the field skims along the other four.', t`Out through $x = ${+(a + L).toFixed(3)}$: $+b(${+(a + L).toFixed(3)})L^2$. In through $x = ${a}$: $-b(${a})L^2$.`, t`Net: $bL^2[(a + L) - a] = bL^3$.`],
          teach: 'In a field that grows across a closed surface, more flux leaves than enters: the net flux is not zero.',
          explain: t`$\Phi = b(a + L)L^2 - baL^2 = bL^3 = (${b})(${L})^3 = ${tn(Phi)}$ N·m²/C — the same wherever the cube sits along $x$. Gauss's law (next lesson) will say there must be charge in the cube: $\varepsilon_0\Phi$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 0.8], y: [0, b * 0.85], aspect: 'wide', xlabel: 'x (m)', ylabel: 'Eₓ (N/C)',
              curves: [{ fn: `${b}*x`, color: 'accent', width: 2.4 }],
              shade: [{ fn: `${b}*x`, from: a, to: a + L, color: 'gold', alpha: 0.25 }],
              vlines: [{ x: a, label: 'near face' }, { x: +(a + L).toFixed(3), label: 'far face' }],
            },
            caption: 'The field along x grows steadily; the cube spans the shaded stretch. Its far face sees a stronger field than its near face.',
          },
        };
      },
    }),
    mcq({
      id: 'angle-slip', difficulty: 3, kind: 'error',
      prompt: t`A 0.50 m² window faces south and sits in a 200 N/C field pointing straight down. A student writes: “The field makes 90° with the window, so $\Phi = EA\cos 90^\circ = 0$... no, wait, the field is perpendicular to it, so $\Phi = EA = 100$ N·m²/C.” Which is right, and why?`,
      choices: [
        'Zero: the window is vertical, so its normal is horizontal and at 90° to the downward field, which skims along the glass',
        t`100 N·m²/C: a field perpendicular to the window passes straight through it`,
        t`$EA\cos 45^\circ$, because the window is neither across nor along the field`,
        'It cannot be found without knowing which way the window faces',
      ],
      answer: 0,
      why: {
        1: 'The field is perpendicular to the window’s normal — so it is parallel to the glass, not through it.',
        2: 'A vertical window and a vertical field: the field runs along the glass; θ = 90° exactly.',
        3: 'Facing south fixes the normal as horizontal, which is all that matters for a vertical field.',
      },
      hints: ['A window facing south is vertical: which way does its normal point?', 'Compare the normal with the field, not the glass with the field.'],
      teach: 'Measure θ from the normal: a field running along a surface gives zero flux, however strong it is.',
      explain: t`The window is vertical, so its normal is horizontal (pointing south). The field points down: $\theta = 90^\circ$ from the normal, and $\Phi = EA\cos 90^\circ = 0$. The field runs along the glass without crossing it.`,
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], uniform: [0, -200], fieldLines: true, density: 10, patch: { shape: 'square', x: 0, y: 0, angle: 0, size: 7 } }, 'The window seen edge-on (gold, standing vertically) with its horizontal normal, in a field pointing straight down.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-roof', difficulty: 2, transfer: true,
      gen(r) {
        const E = r.pick([100, 120, 150]), w = r.pick([8, 10, 12]), l = r.pick([10, 15, 20]), Phi = -E * w * l;
        return {
          prompt: t`On a fine day the air near the ground carries an electric field of about ${E} N/C pointing straight down. What is the flux through a flat roof ${w} m × ${l} m, taking its normal to point up?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          errors: [{ value: E * w * l, feedback: 'The normal points up and the field points down: θ = 180°, so the flux is negative.' }],
          hints: [t`$\theta$ between the upward normal and the downward field is $180^\circ$.`],
          teach: 'The sign of a flux depends on which way the normal is chosen: field against the normal gives negative flux.',
          explain: t`$\Phi = EA\cos 180^\circ = -(${E})(${w * l}) = ${tn(Phi)}$ N·m²/C. Negative, because the field crosses the roof against its upward normal.`,
          visual: field({ unit: 'm', x: [-10, 10], y: [-4, 8], uniform: [0, -E], fieldLines: true, density: 10, patch: { shape: 'square', x: 0, y: 2, angle: 90, size: 8 }, notes: { lines: [{ from: [-10, -1], to: [10, -1], color: 'ink3', width: 2 }] } }, 'The roof seen edge-on (gold) with its upward normal, the ground below, and the fair-weather field pointing down.'),
        };
      },
    }),
    num({
      id: 'cp-tilted', difficulty: 2,
      gen(r) {
        const E = r.pick([400, 700, 1000]), A = r.pick([0.05, 0.08, 0.12]), th = r.pick([20, 40, 55]), Phi = E * A * Math.cos(rad(th));
        return {
          prompt: t`A flat plate of area ${A} m² sits in a uniform field of ${E} N/C, its normal at ${th}° to the field. What is the flux through it?`,
          answer: Phi, units: 'N m^2/C', tol: { rel: 0.01 },
          hints: [t`$\Phi_E = EA\cos\theta$.`],
          teach: 'Φ = EA cos θ, with θ measured from the normal.',
          explain: t`$\Phi_E = (${E})(${A})\cos ${th}^\circ = ${tn(Phi)}$ N·m²/C.`,
          visual: patchPic(th, `The plate seen edge-on, its normal at ${th}° to the field.`),
        };
      },
    }),
    mcq({
      id: 'cp-cylinder', difficulty: 2,
      prompt: 'A closed cylinder (a can, with both ends) sits in a uniform field pointing along its axis. Which describes the flux through its parts?',
      choices: [
        'Negative through one end, equal and positive through the other, zero through the curved side: zero in all',
        'Positive through both ends, zero through the side',
        'Zero through both ends, positive through the curved side',
        'Positive through every part, so the total is EA for the whole surface',
      ],
      answer: 0,
      why: {
        1: 'At the end where the field enters, the outward normal points against it: that flux is negative.',
        2: 'The field runs along the curved side, parallel to it: no flux there. The ends face the field head-on.',
        3: 'Flux in counts negative for a closed surface; it cancels the flux out.',
      },
      hints: ['Draw the outward normal on each part and compare it with the field.'],
      teach: 'With outward normals, a uniform field gives −EA in, +EA out and zero along the sides: zero net flux.',
      explain: t`End where the field enters: $-EA$. End where it leaves: $+EA$. Curved side: the field runs along it, $\cos 90^\circ = 0$. Total: zero.`,
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], uniform: [1500, 0], fieldLines: true, density: 10, gauss: { shape: 'box', x: 0, y: 0, w: 8, h: 5, depth: 5, move: false, resize: false }, normals: true }, 'The cylinder cut lengthwise by the page (a rectangle in cross-section), with arrows showing field leaving (green) and entering (orange).'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §6.1 Electric Flux', url: 'https://openstax.org/books/university-physics-volume-2/pages/6-1-electric-flux' },
  ],
});
