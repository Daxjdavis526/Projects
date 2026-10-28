// Jones vectors and matrices (Hecht §8.13). The polarization of a
// fully polarized beam is a complex 2-vector (E_x, E_y) — amplitudes and
// relative phase — and every linear optical element a 2×2 matrix: a polarizer
// at θ is [[cos², cs], [cs, sin²]], a retarder with its fast axis at θ is
// R(−θ) diag(1, e^{iΓ}) R(θ). A chain multiplies right to left. Hecht's
// convention, (1, i)/√2 = left-circular, counterclockwise facing the wave (as
// in PHYS 3750 W12.2). Worked example: 45° light through a quarter-wave plate
// and a polarizer. A wave plate between crossed polarizers passes ½ sin²2θ;
// a half-wave plate turns horizontal light to (cos 2θ, sin 2θ). Uses the new
// op2-jones sim (chain and Poincaré sphere). Transfers: a Faraday isolator in a
// laser-comm terminal; circular light through any analyser.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { DEG, sf } from './_op.js';
import * as J from '../../src/viz/model/op2-jones.js';

const t = String.raw;
/** An op2-jones visual. */
const jones = (input, elements, caption, extra = {}) => ({ type: 'op2-jones', params: { input, elements, view: 'chain', readout: false, ...extra }, caption });

// the worked example: 45° light → QWP (fast axis horizontal) → polarizer at 30°
const EX = { th: 30 };
EX.v1 = J.apply(J.qwp(0), J.linear(45 * DEG));
EX.v2 = J.apply(J.polarizer(EX.th * DEG), EX.v1);
EX.I = J.intensity(EX.v2);

export default lesson({
  id: 'phys4650.O6.2',
  title: 'Jones vectors and matrices',
  minutes: 17, difficulty: 3,
  intro: t`A fully polarized beam is described by two complex numbers: the amplitudes and phases of its $x$ and $y$ field components, the **Jones vector** $\tilde{\mathbf E} = (E_{0x}e^{i\varphi_x},\ E_{0y}e^{i\varphi_y})$. Only the relative phase matters, so $(1, 0)$ is horizontal light, $(1, 1)/\sqrt2$ light at 45°, and $(1, i)/\sqrt2$ circular light. Every linear element — polarizer, wave plate, rotator — is a 2×2 matrix, and a chain of them is a product taken **right to left**, the first element rightmost:

$$\tilde{\mathbf E}_{\text{out}} = \mathbf M_n\cdots\mathbf M_2\mathbf M_1\,\tilde{\mathbf E}_{\text{in}}$$

It is the matrix method of [O4.2](#/lesson/phys4650.O4.2) again, with complex numbers. The irradiance is $|E_x|^2 + |E_y|^2$.`,
  symbols: [
    { tex: '\\tilde{\\mathbf E}', text: t`the Jones vector, $(E_x, E_y)$ as complex amplitudes. Convention (Hecht’s): the field is the real part of $\tilde{\mathbf E}e^{i(kz - \omega t)}$, so $(1, i)/\sqrt2$ turns counterclockwise as you face the oncoming wave — Hecht’s **left**-circular` },
    { tex: '\\mathbf M_k', text: t`the Jones matrix of the $k$-th element; a polarizer at $\theta$ is $\begin{pmatrix}\cos^2\theta & \sin\theta\cos\theta \\ \sin\theta\cos\theta & \sin^2\theta\end{pmatrix}$` },
    { tex: '\\text{QWP}', text: t`a quarter-wave plate with its fast axis horizontal is $\begin{pmatrix} 1 & 0 \\ 0 & i\end{pmatrix}$: it delays $E_y$ by a quarter cycle (an overall phase is dropped)` },
  ],
  why: t`Jones calculus designs every polarization instrument — isolators, circular polarizers, polarimeters — and the 2×2 complex algebra is exactly the algebra of a spin-½ particle you will meet in quantum mechanics.`,
  visual: {
    type: 'op2-jones',
    title: 'Linear light through a wave plate',
    lead: t`Linearly polarized light (angle $\alpha$) passes a quarter-wave plate whose fast axis is at $\theta$. Above, the field’s ellipse before and after, seen facing the wave; below, the same states on the Poincaré sphere, where the plate turns the state about its fast axis by 90°.`,
    tasks: [
      t`Set the input to 45° and the plate to 0°: the output is circular (counterclockwise, Hecht’s left) — the north pole of the sphere.`,
      t`Turn the plate to −45° (or 135°): clockwise circular, the south pole.`,
      t`Put the plate parallel to the input: nothing changes — light along an axis of the plate is an eigenstate.`,
    ],
    params: {
      input: { angle: 45 }, elements: [{ kind: 'qwp', angle: 0 }], view: 'both', readouts: ['jones', 'psi', 'chi', 'hand'], play: true,
      controls: [
        { key: 'a', label: 'Input angle $\\alpha$', min: -90, max: 90, step: 5, value: 45, explain: 'Direction of the incoming linear polarization, from horizontal.', set: 'in' },
        { key: 'th', label: 'Fast axis $\\theta$', min: -90, max: 90, step: 5, value: 0, explain: 'Direction of the quarter-wave plate’s fast axis, from horizontal.', set: [[0, 'angle']] },
      ],
    },
    caption: t`Ideal, lossless quarter-wave plate; the input has irradiance 1. Ellipses are seen facing the oncoming wave. On the sphere (Stokes parameters): horizontal at right, $+45^\circ$ into the picture (behind the centre), counterclockwise circular at the top; dashed parts lie behind.`,
  },
  example: {
    prompt: t`Light polarized at 45° passes a quarter-wave plate with its fast axis horizontal, then a polarizer at ${EX.th}°. Use Jones calculus to find the state after the plate and the irradiance that leaves the polarizer (input irradiance 1).`,
    visual: jones({ angle: 45 }, [{ kind: 'qwp', angle: 0 }, { kind: 'pol', angle: EX.th }], t`The chain, with the state after each element and its irradiance.`),
    steps: [
      { label: 'Input', text: t`$\tilde{\mathbf E}_{\text{in}} = \dfrac{1}{\sqrt2}\begin{pmatrix}1 \\ 1\end{pmatrix}$, irradiance $\tfrac12 + \tfrac12 = 1$.` },
      { label: 'Wave plate', text: t`$\begin{pmatrix}1 & 0 \\ 0 & i\end{pmatrix}\dfrac{1}{\sqrt2}\begin{pmatrix}1 \\ 1\end{pmatrix} = \dfrac{1}{\sqrt2}\begin{pmatrix}1 \\ i\end{pmatrix}$: equal amplitudes, $E_y$ a quarter cycle ahead in phase — circular, turning counterclockwise as you face the wave.` },
      { label: 'Polarizer', text: t`At $\theta = ${EX.th}^\circ$: $\begin{pmatrix}\cos^2\theta & \sin\theta\cos\theta \\ \sin\theta\cos\theta & \sin^2\theta\end{pmatrix}\dfrac{1}{\sqrt2}\begin{pmatrix}1 \\ i\end{pmatrix} = \dfrac{\cos\theta + i\sin\theta}{\sqrt2}\begin{pmatrix}\cos\theta \\ \sin\theta\end{pmatrix}$.` },
      { label: 'Irradiance', text: t`$|E_x|^2 + |E_y|^2 = \tfrac12(\cos^2\theta + \sin^2\theta) = ${sf(EX.I, 3)}$ — for **any** $\theta$: circular light sends half through every analyser, just as unpolarized light does.` },
      { label: 'Order matters', text: t`The product is $\mathbf M_{\text{pol}}\mathbf M_{\text{QWP}}\tilde{\mathbf E}$. In the other order, polarizer first, the polarizer would pass $\cos^2(45^\circ - ${EX.th}^\circ) = ${sf(Math.cos(15 * DEG) ** 2, 3)}$ and the plate would not change the irradiance at all.` },
    ],
    answer: t`After the plate: $(1, i)/\sqrt2$, counterclockwise circular; after the polarizer: irradiance $\tfrac12$, whatever its angle.`,
  },
  practice: [
    mcq({
      id: 'name-state', difficulty: 1,
      gen(r) {
        const opts = [
          [t`$(1, -i)/\sqrt2$`, 'circular, clockwise as you face the wave (Hecht’s right-circular)', 'cw'],
          [t`$(1, i)/\sqrt2$`, 'circular, counterclockwise as you face the wave (Hecht’s left-circular)', 'ccw'],
          [t`$(1, -1)/\sqrt2$`, 'linear at −45°', 'lin'],
          [t`$(2, i)/\sqrt5$`, 'elliptical, counterclockwise, major axis horizontal', 'ell'],
        ];
        const k = r.int(0, 3), [vec] = opts[k];
        const choices = opts.map((o) => o[1]);
        const vecs = { cw: J.CW, ccw: J.CCW, lin: [[Math.SQRT1_2, 0], [-Math.SQRT1_2, 0]], ell: J.elliptical(2 / Math.sqrt(5), 1 / Math.sqrt(5), Math.PI / 2) };
        return {
          prompt: t`What polarization state is the Jones vector ${vec}?`,
          visual: jones({ jones: vecs[opts[k][2]] }, [], t`The state’s field, seen facing the oncoming wave (hidden).`, { hide: ['states', 'out'] }),
          choices, answer: k,
          why: Object.fromEntries([0, 1, 2, 3].filter((i) => i !== k).map((i) => [i, i === 2 ? 'A real Jones vector (no relative phase) is always linear; this one has an imaginary component.' : k === 2 ? 'Both components are real: the field just oscillates along one line.' : 'Check the amplitudes (equal for circular) and the sign of the relative phase (+i counterclockwise, −i clockwise in this convention).'])),
          hints: [t`Equal magnitudes and a phase of $\pm 90^\circ$: circular. Real components: linear. Otherwise elliptical.`, t`In Hecht’s convention $+i$ means $E_y$ leads: the field turns from $+x$ toward $+y$, counterclockwise facing the wave.`],
          teach: 'Read a Jones vector by its two magnitudes and their relative phase.',
          explain: t`${vec} is ${opts[k][1]}. At $\omega t = 0$ the field is $(\text{Re}\,E_x, \text{Re}\,E_y)$; a quarter period later it is $(\text{Im}\,E_x, \text{Im}\,E_y)$ — follow those two points to see the turn.`,
        };
      },
    }),
    mcq({
      id: 'order', difficulty: 2, kind: 'error',
      prompt: t`Light passes a polarizer $\mathbf P$, then a quarter-wave plate $\mathbf Q$, then a half-wave plate $\mathbf H$. A student computes $\tilde{\mathbf E}_{\text{out}} = \mathbf P\,\mathbf Q\,\mathbf H\,\tilde{\mathbf E}_{\text{in}}$. What is wrong?`,
      visual: jones({ angle: 20 }, [{ kind: 'pol', angle: 0 }, { kind: 'qwp', angle: 30 }, { kind: 'hwp', angle: 10 }], t`The chain in the order the light meets it, left to right.`, { hide: ['intensity'] }),
      choices: [t`The order: matrices act right to left, so the first element is rightmost: $\mathbf H\,\mathbf Q\,\mathbf P\,\tilde{\mathbf E}_{\text{in}}$.`, 'Nothing: Jones matrices commute.', 'The Jones vector should be on the left.', 'The matrices should be added.'],
      answer: 0,
      why: { 1: 'A polarizer and a wave plate at different angles do not commute: try a polarizer at 0° and a half-wave plate at 22.5° in both orders.', 2: 'With column vectors the matrix that acts first stands next to the vector, on its right.', 3: 'Each element transforms what the previous one handed it: composition, a product.' },
      hints: ['Which matrix must act on the input vector first?'],
      teach: 'Jones matrices multiply right to left: the first element the light meets stands next to the input vector.',
      explain: t`$\tilde{\mathbf E}_{\text{out}} = \mathbf H(\mathbf Q(\mathbf P\tilde{\mathbf E}_{\text{in}}))$. The student’s product describes light going through the elements in reverse order, which gives a different output in general.`,
    }),
    num({
      id: 'between-crossed', difficulty: 2,
      gen(r) {
        const th = r.pick([10, 15, 22.5, 30, 35]), kind = r.pick(['qwp', 'hwp']);
        const v = J.apply(J.polarizer(90 * DEG), J.apply(kind === 'qwp' ? J.qwp(th * DEG) : J.hwp(th * DEG), J.linear(0)));
        const I = J.intensity(v);
        return {
          prompt: t`Horizontally polarized light (irradiance 1) passes a ${kind === 'qwp' ? 'quarter' : 'half'}-wave plate with its fast axis at ${th}°, then a vertical polarizer. What irradiance gets through?`,
          visual: jones({ angle: 0 }, [{ kind, angle: th }, { kind: 'pol', angle: 90 }], t`Horizontal light, the plate, and a crossed polarizer; the output is hidden.`, { hide: ['out', 'intensity'] }),
          answer: I, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: 'The wave plate changes the state, so the crossed polarizer no longer blocks everything.' }, { value: kind === 'qwp' ? Math.sin(2 * th * DEG) ** 2 : 0.5 * Math.sin(2 * th * DEG) ** 2, feedback: kind === 'qwp' ? 'That is for a half-wave plate. A quarter-wave plate gives half of it.' : 'That is for a quarter-wave plate. A half-wave plate gives twice as much.' }].filter((e) => Math.abs(e.value - I) > 0.01 * I),
          hints: [t`Apply the plate’s matrix to $(1, 0)$, then keep only the $y$-component (the vertical polarizer).`, t`A retarder of retardance $\Gamma$ between crossed polarizers passes $\sin^2 2\theta\,\sin^2(\Gamma/2)$.`],
          teach: t`A retarder between crossed polarizers passes $\sin^2 2\theta\sin^2(\Gamma/2)$: most at $\theta = 45^\circ$.`,
          explain: t`$|E_y|^2 = \sin^2(2\times${th}^\circ)\sin^2(${kind === 'qwp' ? 45 : 90}^\circ) = ${sf(I, 3)}$. This is how stress in glass shows up between crossed polarizers (photoelasticity).`,
        };
      },
    }),
    expr({
      id: 'hwp-output', difficulty: 3,
      prompt: t`A half-wave plate with its fast axis at angle $\theta$ has the Jones matrix $\begin{pmatrix}\cos 2\theta & \sin 2\theta \\ \sin 2\theta & -\cos 2\theta\end{pmatrix}$ (up to an overall phase). Horizontal light $(1, 0)$ passes it. What is the $y$-component of the output?`,
      visual: jones({ angle: 0 }, [{ kind: 'hwp', angle: 25 }], t`Horizontal light through a half-wave plate at 25°: still linear, but turned.`),
      answer: 'sin(2 theta)', answerTeX: t`\sin 2\theta`, vars: { theta: [-1.4, 1.4] }, lhs: 'E_y', keys: [['θ', 'theta']],
      errors: [{ answer: 'sin(theta)', feedback: 'The matrix has 2θ: a half-wave plate turns linear light by twice its angle.' }, { answer: 'cos(2 theta)', feedback: 'That is the x-component.' }],
      hints: [t`Multiply the matrix by the column $(1, 0)$: you get its first column.`, t`The first column is $(\cos 2\theta, \sin 2\theta)$.`],
      teach: 'A half-wave plate at θ reflects linear polarization about its fast axis: horizontal light comes out at 2θ.',
      explain: t`$\tilde{\mathbf E}_{\text{out}} = (\cos 2\theta, \sin 2\theta)$: linear light at $2\theta$. Rotating the plate by $\theta$ turns the polarization by $2\theta$ — the standard way to set a laser’s polarization.`,
    }),
    {
      type: 'slider', id: 'make-circular', difficulty: 2,
      prompt: t`Horizontally polarized laser light must become circular (either sense) for a measurement. Turn the quarter-wave plate until the output traces a circle.`,
      visual: { type: 'op2-jones', params: { input: { angle: 0 }, elements: [{ kind: 'qwp', angle: 10 }], view: 'chain', readout: false,
        controls: [{ key: 'th', label: 'Fast axis $\\theta$', min: 0, max: 90, step: 1, value: 10, explain: 'Direction of the plate’s fast axis from horizontal.', set: [[0, 'angle']] }] },
        caption: t`Horizontal light through a quarter-wave plate; the right-hand ellipse is the output, seen facing the wave.` },
      param: 'th', answer: [44, 46],
      instruction: 'Set the fast axis so the output is circular, then check.',
      hints: ['Circular light needs equal components along the fast and slow axes.', 'Horizontal light splits equally between two axes at ±45° to it.'],
      teach: 'A quarter-wave plate makes circular light from linear light at 45° to its axes.',
      explain: t`At $\theta = 45^\circ$ the horizontal field splits into equal fast and slow components, and the plate delays one by a quarter cycle: circular light (here clockwise facing the wave; at $-45^\circ$ it would be counterclockwise).`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-circular-analyser', difficulty: 2,
      gen(r) {
        const th = r.pick([0, 20, 55, 80, 120]);
        const res = J.chain('unpolarized', [{ kind: 'pol', angle: 0 }, { kind: 'qwp', angle: 45 }, { kind: 'pol', angle: th }]);
        return {
          prompt: t`Unpolarized light (irradiance 1) passes a horizontal polarizer, then a quarter-wave plate with its fast axis at 45°, then a second polarizer at ${th}°. What irradiance leaves the second polarizer?`,
          visual: jones('unpolarized', [{ kind: 'pol', angle: 0 }, { kind: 'qwp', angle: 45 }, { kind: 'pol', angle: th }], t`The chain; the last state and the irradiances are hidden.`, { hide: ['out', 'intensity'] }),
          answer: res[3].I, tol: { rel: 0.005 },
          errors: [{ value: 0.5 * Math.cos(th * DEG) ** 2, feedback: 'The wave plate makes the light circular; an analyser then passes half at any angle.' }, { value: 0.5, feedback: 'The first polarizer already halves the unpolarized light.' }].filter((e) => Math.abs(e.value - res[3].I) > 0.005),
          hints: ['After the first polarizer: horizontal light of irradiance ½.', 'The plate turns it circular; circular light gives half its irradiance to any linear analyser.'],
          teach: 'Circular light passes half its irradiance through a polarizer at any angle.',
          explain: t`$\tfrac12\times\tfrac12 = ${sf(res[3].I, 3)}$, independent of the angle ${th}°.`,
        };
      },
    }),
    mcq({
      id: 'cp-isolator', difficulty: 3, transfer: true,
      prompt: t`A laser-comm terminal protects its laser from back-reflections with a Faraday isolator: a polarizer at 0°, a Faraday rotator that turns the polarization by +45° (in the same absolute sense, whichever way the light travels), and a polarizer at 45°. Light reflected back from the telescope retraces the path. What happens to it?`,
      visual: jones({ angle: 0 }, [{ kind: 'pol', angle: 0 }, { kind: 'rot', angle: 45 }, { kind: 'pol', angle: 45 }], t`The forward pass: horizontal light, turned 45° by the rotator, passes the 45° polarizer.`),
      choices: ['It passes the 45° polarizer, is turned another 45° to 90° by the rotator, and is blocked by the 0° polarizer.', 'It is turned back to 0° by the rotator and returns to the laser.', 'It is blocked by the 45° polarizer.', 'Half of it returns, because the rotator mixes the polarizations.'],
      answer: 0,
      why: { 1: 'That would happen with an ordinary (reciprocal) rotator such as a sugar solution; the Faraday effect is non-reciprocal.', 2: 'The reflected light is at 45°, along that polarizer’s axis: it passes.', 3: 'An ideal rotator only turns linear polarization; it does not split it.' },
      hints: ['Follow the reflected light’s polarization at each element on the way back.', 'The Faraday rotation is fixed by the magnetic field, not by the direction of travel: the two passes add.'],
      teach: 'A Faraday rotator is non-reciprocal: rotations on the way out and back add, so 45° + 45° = 90° and the input polarizer blocks the return.',
      explain: t`Back through the rotator the light goes from 45° to 90°, crossed with the 0° polarizer: blocked. In Jones terms the return trip is not described by the inverse of the forward matrix — the magneto-optic medium breaks time-reversal symmetry. That is what keeps a high-power amplifier from destabilizing its seed laser.`,
    }),
    mcq({
      id: 'cp-same-state', difficulty: 3,
      prompt: t`Do the Jones vectors $(1, i)$ and $(i, -1)$ describe the same polarization state?`,
      visual: jones('ccw', [], t`The state $(1, i)/\sqrt2$, seen facing the wave.`),
      choices: [t`Yes: $(i, -1) = i\,(1, i)$, the same vector times an overall phase, which no measurement of polarization can see.`, t`No: one is left- and the other right-circular.`, t`No: $(i, -1)$ is linear.`, t`Only if they have different irradiances.`],
      answer: 0,
      why: { 1: t`The sense of rotation depends on the relative phase between $E_y$ and $E_x$, which is the same (+90°) in both.`, 2: 'Both components have magnitude 1 and a 90° relative phase: circular.', 3: 'They have the same irradiance, 2, and describe the same state.' },
      hints: ['Factor a common complex number out of the second vector.', t`Polarization depends on the ratio $E_y/E_x$.`],
      teach: t`A Jones vector is defined up to an overall phase: only the ratio $E_y/E_x$ (and the total irradiance) matter.`,
      explain: t`$E_y/E_x = i$ for both. The overall phase only shifts the moment the field is at its maximum — physically the same light. (In quantum mechanics the same holds for a spin state, which is why the Poincaré sphere is also the Bloch sphere.)`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §8.13 (a mathematical description of polarization: Jones and Stokes)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'R. C. Jones, A new calculus for the treatment of optical systems, J. Opt. Soc. Am. 31, 488 (1941)', url: 'https://doi.org/10.1364/JOSA.31.000488' },
  ],
});
