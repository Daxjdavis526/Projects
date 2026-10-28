// Birefringence and wave plates (Hecht §8.4, §8.7). An anisotropic crystal
// has two refractive indices for the two polarizations along its principal
// axes (ordinary n_o, extraordinary n_e); a plate of thickness d cut with the
// optic axis in its face delays one against the other by Γ = 2π|Δn|d/λ₀.
// Quarter-wave Γ = π/2 (mod 2π), half-wave Γ = π. Real numbers: crystalline
// quartz Δn ≈ 0.0091 in the visible, 0.0083 at 1550 nm (Ghosh 1999); calcite
// −0.172. Zero-order against multi-order plates and their wavelength
// sensitivity (worked example: a 20th-order quartz plate fails 10 nm off its
// design wavelength; a zero-order plate does not). A quarter-wave plate at θ
// to linear light makes an ellipse with b/a = tan θ; a half-wave plate turns
// linear light by 2θ. Uses op2-jones (a variable retarder on the Poincaré
// sphere). Transfers: the transmit/receive isolation of a laser-comm terminal
// (polarizing beam splitter + quarter-wave plate, double pass = half-wave),
// a liquid-crystal variable retarder in a polarimetric imager.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sf } from './_op.js';

const t = String.raw;
// crystalline quartz (ordinary, extraordinary), Ghosh 1999 dispersion formulas, rounded
const QZ = { 589: [1.5443, 1.5534], 633: [1.5427, 1.5518], 1064: [1.5341, 1.5428], 1550: [1.528, 1.5363] };
const dn = (nm) => QZ[nm][1] - QZ[nm][0];
const MGF2_633 = [1.3777, 1.3895];
const CALCITE = [1.6584, 1.4864];     // at 589 nm

// the worked example: zero-order and 20th-order quartz quarter-wave plates for 633 nm, used at 643 nm
const EX = { l0: 633, l1: 643, m: 20, dn: dn(633) };
EX.d0 = (0.25 * EX.l0) / EX.dn / 1000;          // µm
EX.dm = ((EX.m + 0.25) * EX.l0) / EX.dn / 1000;  // µm
EX.w0 = 0.25 * (EX.l0 / EX.l1);                 // waves at 643 nm (Δn taken constant)
EX.wm = (EX.m + 0.25) * (EX.l0 / EX.l1);
EX.err0 = (EX.w0 - 0.25) * 360;                 // degrees
EX.errm = (EX.wm - Math.round(EX.wm - 0.25) - 0.25) * 360;

const jones = (input, elements, caption, extra = {}) => ({ type: 'op2-jones', params: { input, elements, view: 'chain', readout: false, ...extra }, caption });

/** A birefringent plate seen side-on: light entering, the two polarizations drifting apart in phase (schematic). */
const platePic = (caption) => ({
  type: 'graph', caption,
  params: { x: [-1, 11], y: [-1.6, 1.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: '1.4', lower: '-1.4', from: 3, to: 7, color: 'accent', alpha: 0.15 }],
    curves: [
      { fn: 'step(3 - x)*0.6*sin(4*x) + step(x - 3)*step(7 - x)*0.6*sin(4*3 + 4*1.55*(x - 3)) + step(x - 7)*0.6*sin(4*3 + 4*1.55*4 + 4*(x - 7))', color: 'gold', width: 1.8, samples: 1500 },
      { fn: 'step(3 - x)*0.6*sin(4*x) + step(x - 3)*step(7 - x)*0.6*sin(4*3 + 4*1.4*(x - 3)) + step(x - 7)*0.6*sin(4*3 + 4*1.4*4 + 4*(x - 7))', color: 'teal', width: 1.8, samples: 1500, dash: [5, 3] },
    ],
    points: [{ x: 5, y: 1.25, r: 0, label: 'crystal, thickness d', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 9, y: 1.0, r: 0, label: 'out of step by Γ', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 0.8, y: 1.0, r: 0, label: 'in step', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 }],
    legend: [{ label: 'slow-axis component', color: 'gold' }, { label: 'fast-axis component', color: 'teal', dash: [5, 3] }], legendAt: 'bl' },
});

export default lesson({
  id: 'phys4650.O6.3',
  title: 'Birefringence and wave plates',
  minutes: 16, difficulty: 3,
  intro: t`In a crystal such as quartz or calcite the speed of light depends on its polarization: along one axis in the plate’s face the index is $n_o$, along the other $n_e$. Light polarized along the **fast axis** (the lower index) gets ahead of light along the **slow axis**, and after a plate of thickness $d$ the two components are out of step by the **retardance**

$$\Gamma = \frac{2\pi}{\lambda_0}\,|n_e - n_o|\,d$$

A plate with $\Gamma = \pi/2$ (a quarter wave) turns linear light at 45° to its axes into circular light; one with $\Gamma = \pi$ (a half wave) mirrors linear light about its fast axis. These are the Jones matrices $\text{diag}(1, e^{i\Gamma})$ of [O6.2](#/lesson/phys4650.O6.2), made of glass-like crystal.`,
  symbols: [
    { tex: '\\Gamma', text: 'the retardance: the phase lead of the fast-axis component over the slow-axis one, in rad (or in waves, Γ/2π)' },
    { tex: 'n_o,\\ n_e', text: t`the ordinary and extraordinary indices; their difference $\Delta n = n_e - n_o$ is the **birefringence** (quartz $+0.0091$, calcite $-0.172$ in the visible)` },
    { tex: 'd', text: 'the plate’s thickness, in m' },
    { tex: '\\lambda_0', text: 'the vacuum wavelength: a plate is a quarter-wave plate only near its design wavelength' },
  ],
  why: t`Wave plates set and switch the polarization of every laser system, isolate transmit from receive in laser-comm terminals, and make circular polarizers, isolators and polarimeters possible.`,
  visual: {
    type: 'op2-jones',
    title: 'A variable retarder',
    lead: t`Horizontal light passes a plate of retardance $\Gamma$ with its fast axis at $\theta$. Watch the output ellipse and its path on the Poincaré sphere: the plate turns the state about its fast-axis direction (on the equator) by the angle $\Gamma$.`,
    tasks: [
      t`At $\theta = 45^\circ$, raise $\Gamma$ from 0: linear → ellipse → circular at $90^\circ$ → linear at 90° (vertical) at $180^\circ$ → back again at $360^\circ$.`,
      t`At $\Gamma = 90^\circ$, turn $\theta$: the ellipse’s axes follow the plate, with $b/a = \tan\theta$.`,
      t`At $\Gamma = 180^\circ$ (a half-wave plate), the output stays linear, at $2\theta$.`,
    ],
    params: {
      input: { angle: 0 }, elements: [{ kind: 'ret', angle: 45, delta: 60 }], view: 'both', readouts: ['psi', 'chi', 'hand'], play: true,
      controls: [
        { key: 'G', label: 'Retardance $\\Gamma$', min: 0, max: 360, step: 5, value: 60, explain: 'How far the slow-axis component falls behind, in degrees of phase (90° = a quarter wave).', set: [[0, 'delta']] },
        { key: 'th', label: 'Fast axis $\\theta$', min: 0, max: 90, step: 5, value: 45, explain: 'Direction of the plate’s fast axis from horizontal.', set: [[0, 'angle']] },
      ],
    },
    caption: t`Ideal lossless retarder; input horizontal, irradiance 1. The ellipses are seen facing the oncoming wave (Hecht’s convention: counterclockwise = left-circular, the top of the sphere). On the sphere, dashed parts lie behind.`,
  },
  example: {
    prompt: t`Crystalline quartz has $\Delta n = n_e - n_o = ${sf(EX.dn, 2)}$ at 633 nm. How thick is a zero-order quarter-wave plate for 633 nm, and a 20th-order one ($\Gamma = 2\pi\times 20.25$)? What happens to each if it is used at 643 nm?`,
    visual: platePic(t`The two polarization components entering a plate in step and leaving out of step (schematic: the wavelengths in the crystal and the retardance are exaggerated).`),
    steps: [
      { label: 'Zero order', text: t`$\Gamma = 2\pi\Delta n\,d/\lambda_0 = \pi/2$ gives $d = \lambda_0/4\Delta n = 0.633/(4\times${sf(EX.dn, 2)})\ \mu\text{m} = ${sf(EX.d0, 3)}\ \mu\text{m}$ — thinner than a hair, which is why zero-order quartz plates are made as two thicker plates with crossed axes whose retardances subtract.` },
      { label: 'Multi-order', text: t`$\Gamma/2\pi = 20.25$: $d = 20.25\,\lambda_0/\Delta n = ${sf(EX.dm, 4)}\ \mu\text{m}$, about 1.4 mm — robust and cheap.` },
      { label: 'Change the wavelength', text: t`The retardance in waves is $\Delta n\,d/\lambda_0$, so (ignoring the slight change of $\Delta n$) it scales as $1/\lambda_0$. At 643 nm the zero-order plate gives $0.25\times633/643 = ${sf(EX.w0, 4)}$ waves: an error of $${sf(EX.err0, 2)}^\circ$.` },
      { label: 'The multi-order plate', text: t`$20.25\times633/643 = ${sf(EX.wm, 5)}$ waves: $${sf(EX.errm, 3)}^\circ$ away from a quarter wave. It is no longer a quarter-wave plate at all: 45° light comes out strongly elliptical instead of circular.` },
      { label: 'Rule', text: t`The retardance error grows with the order: $\delta\Gamma \approx \Gamma\,\delta\lambda/\lambda$. Use zero-order (or achromatic) plates wherever the wavelength or the temperature can drift.` },
    ],
    answer: t`Zero order: $${sf(EX.d0, 3)}\ \mu\text{m}$, off by only $${sf(Math.abs(EX.err0), 2)}^\circ$ at 643 nm; 20th order: $${sf(EX.dm / 1000, 3)}$ mm, off by $${sf(Math.abs(EX.errm), 3)}^\circ$.`,
  },
  practice: [
    num({
      id: 'qwp-thickness', difficulty: 1,
      gen(r) {
        const [mat, nm, no, ne] = r.pick([['crystalline quartz', 589, ...QZ[589]], ['crystalline quartz', 1064, ...QZ[1064]], ['crystalline quartz', 1550, ...QZ[1550]], ['magnesium fluoride', 633, ...MGF2_633]]);
        const kind = r.pick(['quarter', 'half']);
        const d = ((kind === 'quarter' ? 0.25 : 0.5) * nm) / (ne - no) / 1000;
        return {
          prompt: t`How thick must a zero-order ${kind}-wave plate of ${mat} be for ${nm} nm light? ($n_o = ${no}$, $n_e = ${ne}$.) Give µm.`,
          visual: platePic(t`Two polarization components leaving a birefringent plate out of step (schematic).`),
          answer: d, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: (nm / (ne - no)) / 1000, feedback: `That is a full-wave plate. A ${kind} wave is ${kind === 'quarter' ? '¼' : '½'} of it.` }, { value: ((kind === 'quarter' ? 0.25 : 0.5) * nm) / no / 1000, feedback: t`Divide by the birefringence $n_e - n_o$, not by an index.` }],
          hints: [t`$\Delta n\,d = ${kind === 'quarter' ? '\\lambda_0/4' : '\\lambda_0/2'}$.`],
          teach: t`A zero-order plate of retardance $\Gamma$ has $d = (\Gamma/2\pi)\lambda_0/\Delta n$: micrometres for weakly birefringent crystals.`,
          explain: t`$d = ${kind === 'quarter' ? '0.25' : '0.5'}\times${nm}\ \text{nm}/${sf(ne - no, 3)} = ${sf(d, 3)}\ \mu\text{m}$.`,
        };
      },
    }),
    num({
      id: 'retardance', difficulty: 2,
      gen(r) {
        const d = r.pick([0.5, 0.8, 1, 1.5]), nm = r.pick([589, 633]);
        const waves = (dn(nm) * d * 1000) / nm, frac = waves - Math.floor(waves);
        return {
          prompt: t`A quartz plate ${d} mm thick ($\Delta n = ${sf(dn(nm), 2)}$) is used at ${nm} nm. What is its retardance, in waves (the whole number of waves included)?`,
          visual: platePic(t`The two components leaving the plate out of step (schematic).`),
          answer: waves, tol: { rel: 0.002 },
          errors: [{ value: frac, feedback: 'That is only the fractional part (what matters for the polarization); the question asks for the total, whole waves included.' }, { value: waves * 2 * Math.PI, feedback: 'That is in radians; divide by 2π for waves.' }].filter((e) => e.value > 0.05),
          hints: [t`Waves $= \Delta n\,d/\lambda_0$, with $d$ and $\lambda_0$ in the same unit.`],
          teach: 'Retardance in waves is Δn d / λ₀; only its fractional part affects the polarization at one wavelength.',
          explain: t`$${sf(dn(nm), 2)}\times${d * 1000}\ \mu\text{m}/${nm / 1000}\ \mu\text{m} = ${sf(waves, 4)}$ waves. Its fractional part, ${sf(frac, 3)}, is what the polarization sees: this plate is ${frac > 0.2 && frac < 0.3 ? 'close to a quarter-wave plate' : frac > 0.45 && frac < 0.55 ? 'close to a half-wave plate' : 'neither a quarter- nor a half-wave plate'} at ${nm} nm.`,
        };
      },
    }),
    num({
      id: 'hwp-rotate', difficulty: 2,
      gen(r) {
        const phi = r.pick([20, 30, 50, 70, 90]);
        return {
          prompt: t`Vertically polarized laser light must be turned to ${phi}° from vertical with a half-wave plate. At what angle from vertical should the plate’s fast axis be set (between 0° and 90°)?`,
          visual: jones({ angle: 90 }, [{ kind: 'hwp', angle: 70 }], t`Vertical light and a half-wave plate, drawn at an arbitrary setting (angles from horizontal); the right setting is the question, so the output is hidden.`, { hide: ['out', 'intensity'] }),
          answer: phi / 2, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: phi, feedback: 'A half-wave plate turns the polarization by twice the angle between it and the fast axis.' }],
          hints: ['A half-wave plate mirrors the polarization about its fast axis.', t`Light at angle $\alpha$ from the fast axis comes out at $-\alpha$: turned by $2\alpha$.`],
          teach: 'A half-wave plate turns linear polarization by twice the angle between the light and its fast axis.',
          explain: t`Set the fast axis $${phi / 2}^\circ$ from vertical: the light, $${phi / 2}^\circ$ on one side of the axis, leaves $${phi / 2}^\circ$ on the other — ${phi}° from vertical.`,
        };
      },
    }),
    num({
      id: 'qwp-ellipse', difficulty: 3,
      gen(r) {
        const th = r.pick([10, 15, 20, 30, 35]);
        return {
          prompt: t`Horizontally polarized light meets a quarter-wave plate whose fast axis is at ${th}°. The output is an ellipse. What is the ratio of its minor to major axis, $b/a$?`,
          visual: jones({ angle: 0 }, [{ kind: 'qwp', angle: th }], t`Horizontal light and the plate; the output ellipse is hidden.`, { hide: ['out', 'intensity'] }),
          answer: Math.tan((th * Math.PI) / 180), tol: { rel: 0.005 },
          errors: [{ value: Math.sin((th * Math.PI) / 180), feedback: 'The components along the axes are cos θ and sin θ; their ratio is tan θ.' }, { value: Math.tan((2 * th * Math.PI) / 180), feedback: 'No factor of 2 here: the light is θ from the fast axis.' }],
          hints: [t`Split the field into components along the fast and slow axes: $\cos\theta$ and $\sin\theta$.`, t`A quarter-wave delay puts them $90^\circ$ out of phase: an ellipse with semi-axes $\cos\theta$ and $\sin\theta$ along the plate’s axes.`],
          teach: t`A quarter-wave plate at $\theta$ to linear light gives an ellipse aligned with its axes, $b/a = \tan\theta$; at 45° it is a circle.`,
          explain: t`$b/a = \tan${th}^\circ = ${sf(Math.tan((th * Math.PI) / 180), 3)}$, the major axis along the fast axis. Rotating the plate tunes the ellipticity from 0 to 1.`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-gamma', difficulty: 2,
      prompt: t`A liquid-crystal retarder with its fast axis at 45° sits in horizontally polarized light. Set its retardance (voltage-controlled) so that the light leaves vertically polarized.`,
      visual: { type: 'op2-jones', params: { input: { angle: 0 }, elements: [{ kind: 'ret', angle: 45, delta: 40 }], view: 'both', readout: false,
        controls: [{ key: 'G', label: 'Retardance $\\Gamma$', min: 0, max: 360, step: 5, value: 40, explain: 'Phase delay of the slow axis, in degrees.', set: [[0, 'delta']] }] },
        caption: t`An ideal variable retarder at 45° acting on horizontal light: the chain and the path on the Poincaré sphere.` },
      param: 'G', answer: [175, 185],
      instruction: 'Set Γ so the output is vertical linear light, then check.',
      hints: ['On the sphere, horizontal and vertical are opposite points on the equator; the plate turns about the +45° direction.', 'A half-turn about that axis carries horizontal to vertical.'],
      teach: 'A half-wave retardance at 45° swaps horizontal and vertical polarization.',
      explain: t`$\Gamma = 180^\circ$: a half-wave plate at 45° mirrors horizontal light to vertical. Liquid-crystal retarders switch this way in microseconds to milliseconds — the heart of LCDs and of polarimetric cameras.`,
    },
    mcq({
      id: 'calcite', difficulty: 2,
      prompt: t`Unpolarized light enters a calcite crystal ($n_o = ${CALCITE[0]}$, $n_e = ${CALCITE[1]}$ at 589 nm) at normal incidence, its optic axis tilted in the crystal. Two beams emerge, displaced sideways: the famous double image. What are they?`,
      visual: { type: 'graph', params: { x: [-1, 11], y: [-1.6, 2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '1.4', lower: '-1.2', from: 3, to: 7, color: 'accent', alpha: 0.15 }], curves: [{ param: ['-1 + 4*t', '0'], t: [0, 1], color: 'gold', width: 2.4 }, { param: ['3 + 4*t', '0'], t: [0, 1], color: 'teal', width: 2 }, { param: ['3 + 4*t', '1.0*t'], t: [0, 1], color: 'violet', width: 2 }, { param: ['7 + 4*t', '0'], t: [0, 1], color: 'teal', width: 2 }, { param: ['7 + 4*t', '1.0'], t: [0, 1], color: 'violet', width: 2 }], points: [{ x: 5, y: 1.6, r: 0, label: 'calcite', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: t`One beam goes straight through; the other walks sideways inside the crystal. Schematic; the real walk-off angle in calcite is up to about 6°.` },
      choices: ['Two beams polarized at right angles: the ordinary ray (obeys Snell’s law, goes straight) and the extraordinary ray (walks off sideways).', 'Two colours split by dispersion.', 'The beam and its reflection from the back face.', 'Two beams of the same polarization, split by diffraction.'],
      answer: 0,
      why: { 1: 'At normal incidence ordinary dispersion would not separate the beams sideways; this happens for monochromatic light too.', 2: 'A reflection would go backward; both beams here go through.', 3: 'Turn a polarizer over the two images: they fade alternately, so they are orthogonally polarized.' },
      hints: ['Look at the two images through a polarizer and turn it.', 'In the crystal the energy of one polarization does not flow along its wave vector.'],
      teach: 'A birefringent crystal splits light into two orthogonally polarized beams; with the optic axis tilted, the extraordinary one walks off.',
      explain: t`The o-ray behaves as in glass (index ${CALCITE[0]}). The e-ray’s index depends on its direction relative to the optic axis, and its energy flow is tilted from its wave vector, so it drifts sideways. Polarizing beam displacers and Glan prisms use calcite’s huge birefringence for exactly this.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-tr-isolation', difficulty: 3, transfer: true,
      prompt: t`A laser-comm terminal sends horizontally polarized light through a polarizing beam splitter (it transmits horizontal and reflects vertical), then a quarter-wave plate at 45°, to the telescope. Light coming back retroreflected through the same plate meets the beam splitter again. Where does it go?`,
      visual: jones({ angle: 0 }, [{ kind: 'pol', angle: 0, label: 'PBS (pass)' }, { kind: 'qwp', angle: 45, label: 'λ/4 out' }, { kind: 'qwp', angle: 45, label: 'λ/4 back' }], t`The beam unfolded: out through the plate and back through it again (the retroreflection reverses the circular light’s sense as seen by the returning beam; unfolded, the two passes simply add). The returning state is hidden.`, { hide: ['out', 'intensity'] }),
      choices: ['It returns vertically polarized, so the beam splitter reflects it out of the laser’s path, toward the receiver.', 'It returns horizontally polarized and goes back into the laser.', 'It returns circularly polarized and splits equally.', 'It is absorbed by the quarter-wave plate.'],
      answer: 0,
      why: { 1: 'Two passes through a quarter-wave plate at 45° make a half-wave plate at 45°: horizontal becomes vertical.', 2: 'The second pass turns the circular light back to linear — orthogonal to the original.', 3: 'Wave plates are (ideally) lossless; they change the state, not the power.' },
      hints: ['What is a quarter-wave plate passed twice?', 'A half-wave plate at 45° turns horizontal light to…?'],
      teach: 'A double pass through a quarter-wave plate at 45° rotates linear polarization by 90°: with a polarizing beam splitter this separates transmit from receive.',
      explain: t`Out: horizontal → circular. Back: circular → linear, now vertical. The beam splitter reflects it to the receiver, so the terminal both protects its laser and collects the return. It only works if the far end does not scramble the polarization.`,
    }),
    num({
      id: 'cp-multiorder', difficulty: 3,
      gen(r) {
        const m = r.pick([5, 10, 15]), dl = r.pick([3, 5, 8]);
        const l0 = 1550, w = (m + 0.25) * (l0 / (l0 + dl));
        const err = (w - (m + 0.25)) * 360;
        return {
          prompt: t`A multi-order quartz quarter-wave plate has a retardance of $${m}.25$ waves at 1550 nm. The laser drifts to ${l0 + dl} nm. By how many degrees does the retardance change? (Treat $\Delta n$ as constant: retardance in waves $\propto 1/\lambda$.)`,
          visual: platePic(t`Two polarization components leaving a thick plate out of step (schematic).`),
          answer: err, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: 0.25 * (l0 / (l0 + dl) - 1) * 360, feedback: 'That is the zero-order plate. A multi-order plate scales its whole retardance, m + ¼ waves.' }, { value: -err, feedback: 'Longer wavelength means fewer waves of retardance: the change is negative.' }],
          hints: [t`New retardance $= ${m}.25\times 1550/${l0 + dl}$ waves.`, 'Subtract the old one and multiply by 360°.'],
          teach: 'A multi-order plate’s retardance error is (m + ¼) δλ/λ waves: thick plates are wavelength-sensitive.',
          explain: t`$${m}.25\times(1550/${l0 + dl} - 1)\times 360^\circ = ${sf(err, 3)}^\circ$; a zero-order plate would change by only $${sf(0.25 * (l0 / (l0 + dl) - 1) * 360, 2)}^\circ$.`,
        };
      },
    }),
    num({
      id: 'cp-lc', difficulty: 2, transfer: true,
      gen(r) {
        const dnm = r.pick([0.15, 0.2, 0.25]), d = r.pick([3, 4, 5]), nm = r.pick([550, 650, 800]);
        const w = (dnm * d * 1000) / nm;
        return {
          prompt: t`A polarimetric imager for Earth observation uses a liquid-crystal cell ${d} µm thick as a variable retarder. With no voltage its birefringence is ${dnm}; full voltage brings it near zero. What is the largest retardance it can give at ${nm} nm, in waves?`,
          visual: { type: 'op2-jones', params: { input: { angle: 0 }, elements: [{ kind: 'ret', angle: 45, delta: 130 }], view: 'sphere', readout: false }, caption: t`A retarder at 45° turning horizontal light round the Poincaré sphere; the cell’s range sets how far it can go.` },
          answer: w, tol: { rel: 0.005 },
          errors: [{ value: w * 360, feedback: 'That is in degrees; the question asks for waves.' }, { value: (dnm * d) / nm, feedback: 'Keep units consistent: d in nm (or λ in µm).' }],
          hints: [t`Waves $= \Delta n\,d/\lambda_0$.`],
          teach: 'A liquid-crystal cell is a voltage-tunable wave plate: retardance Δn(V) d / λ.',
          explain: t`$${dnm}\times${d * 1000}\ \text{nm}/${nm}\ \text{nm} = ${sf(w, 3)}$ waves — more than a half wave, so the cell can turn the state anywhere along a full circle of the sphere. Switching it through several retardances lets the imager measure the scene’s Stokes parameters.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §8.4 (birefringence) and §8.7 (retarders)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'G. Ghosh, Dispersion-equation coefficients for the refractive index and birefringence of calcite and quartz crystals, Opt. Commun. 163, 95 (1999)', url: 'https://doi.org/10.1016/S0030-4018(99)00091-7' },
  ],
});
