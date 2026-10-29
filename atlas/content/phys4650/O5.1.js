// Adding waves of the same frequency (Hecht §7.1), brief and optical. PHYS
// 3750 did superposition on strings; here the point is light: waves of one
// frequency add as phasors, E₀² = E₀₁² + E₀₂² + 2E₀₁E₀₂ cos(α₂ − α₁), so
// irradiances do not simply add — there is an interference term. Coherent
// sources (fixed phase) keep it; incoherent ones (phases wandering faster
// than the detector responds) average it to zero and their irradiances add.
// N equal phasors: N² in phase against N incoherently; incremental phase δ
// gives E₀ sin(Nδ/2)/sin(δ/2), the seed of the grating (O8). Transfers:
// coherent beam combining of fibre amplifiers (one amplifier out of phase),
// fringe visibility with unequal beams.
import { lesson, mcq, num } from '../../src/core/content.js';
import { DEG, sf } from './_op.js';

const t = String.raw;

// the worked example: three waves of one frequency
const EX = { E: [3, 4, 2], a: [0, 60, 150] };
EX.x = EX.E.reduce((s, e, i) => s + e * Math.cos(EX.a[i] * DEG), 0);
EX.y = EX.E.reduce((s, e, i) => s + e * Math.sin(EX.a[i] * DEG), 0);
EX.E0 = Math.hypot(EX.x, EX.y);
EX.al = Math.atan2(EX.y, EX.x) / DEG;
EX.Isum = EX.E.reduce((s, e) => s + e * e, 0);

/** A phasor chain drawn head to tail, with the resultant (gold). amps and phases (deg). */
function chain(amps, phs, caption, { resultant = true, labels = true, pad = 0.6 } = {}) {
  let x = 0, y = 0;
  const arrows = [], pts = [[0, 0]];
  const cols = ['accent', 'teal', 'violet', 'warn', 'good', 'accent2', 'bad', 'ink2'];
  amps.forEach((a, i) => {
    const nx = x + a * Math.cos(phs[i] * DEG), ny = y + a * Math.sin(phs[i] * DEG);
    arrows.push({ from: [sf(x, 5), sf(y, 5)], to: [sf(nx, 5), sf(ny, 5)], color: cols[i % cols.length], width: 2.4, ...(labels ? { label: `E${'₁₂₃₄₅₆₇₈'[i]}` } : {}) });
    x = nx; y = ny; pts.push([x, y]);
  });
  if (resultant) arrows.push({ from: [0, 0], to: [sf(x, 5), sf(y, 5)], color: 'gold', width: 3, ...(labels ? { label: 'E', labelDx: -22, labelDy: 4 } : {}) });
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1);
  return { type: 'graph', caption, params: { x: [sf(Math.min(...xs) - pad * span, 4), sf(Math.max(...xs) + pad * span, 4)], y: [sf(Math.min(...ys) - pad * span, 4), sf(Math.max(...ys) + pad * span, 4)], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', arrows, curves: [{ fn: '0', color: 'ink4', width: 1, dash: [4, 4] }] } };
}

/** Two waves of one frequency and their sum against time (ωt in units of π). */
const waves = (a1, a2, d, caption, extra = {}) => ({
  type: 'graph', caption,
  params: { x: [0, 4], y: [-(a1 + a2) * 1.15, (a1 + a2) * 1.15], aspect: 'wide', xlabel: 'ωt / π', ylabel: 'field', yticks: 4,
    curves: [{ fn: `${a1}*cos(pi*x)`, color: 'accent', width: 1.6, dash: [5, 4] }, { fn: `${a2}*cos(pi*x + ${sf(d * DEG, 6)})`, color: 'teal', width: 1.6, dash: [5, 4] }, ...(extra.sum === false ? [] : [{ fn: `${a1}*cos(pi*x) + ${a2}*cos(pi*x + ${sf(d * DEG, 6)})`, color: 'gold', width: 2.6 }])],
    legend: [{ label: 'wave 1', color: 'accent', dash: [5, 4] }, { label: 'wave 2', color: 'teal', dash: [5, 4] }, ...(extra.sum === false ? [] : [{ label: 'sum', color: 'gold' }])], legendAt: 'br' },
});

export default lesson({
  id: 'phys4650.O5.1',
  title: 'Adding waves of the same frequency',
  minutes: 13, difficulty: 2,
  intro: t`Two light waves of the same frequency at one point, $E_1 = E_{01}\cos(\omega t + \alpha_1)$ and $E_2 = E_{02}\cos(\omega t + \alpha_2)$, add to a third of the same frequency. Draw each as a **phasor** — an arrow of length $E_0$ at angle $\alpha$ — and add the arrows head to tail ([PHYS 3750](#/lesson/phys3750.W6.1) used the same complex amplitudes). The law of cosines gives the result:

$$E_0^2 = E_{01}^2 + E_{02}^2 + 2E_{01}E_{02}\cos(\alpha_2 - \alpha_1)$$

Irradiance goes as $E_0^2$, so the last term — the **interference term** — makes two beams give anything from nearly nothing to twice the sum of their irradiances. It survives only if the phase difference holds still: the sources must be **coherent**.`,
  symbols: [
    { tex: 'E_{01},\\ E_{02}', text: 'the amplitudes of the two waves at the point, in V/m' },
    { tex: '\\alpha_1,\\ \\alpha_2', text: 'their phases there (they include $kr$, the phase built up on the way), in rad' },
    { tex: 'E_0', text: t`the amplitude of the sum; the irradiance is $I = \tfrac12 c\varepsilon_0E_0^2$ ([O2.2](#/lesson/phys4650.O2.2))` },
    { tex: '\\alpha_2 - \\alpha_1', text: 'the phase difference: 0 adds the amplitudes, π subtracts them' },
  ],
  why: t`Every interferometer, grating and phased array — and the decision whether intensities or fields add — starts from this one line.`,
  visual: {
    type: 'graph',
    title: 'Adding two phasors',
    lead: t`Wave 1 (blue) has amplitude 1; wave 2 (teal) is added head to tail at a phase difference $\delta$. The gold arrow is the sum; its length squared is the irradiance. The dashed circle is every place wave 2 could end as $\delta$ changes.`,
    tasks: [
      t`At $\delta = 0$ with equal amplitudes the sum is 2 and the irradiance **4** — twice the 2 you would get by adding irradiances.`,
      t`At $\delta = 180^\circ$ equal waves cancel completely. Unequal waves never do: the gold arrow cannot reach the origin.`,
      t`Averaged over every $\delta$ (an incoherent source), the irradiance readout averages to the sum $1 + a^2$: the interference term averages away.`,
    ],
    params: {
      x: [-2.4, 3.4], y: [-2.3, 2.3], aspect: 'wide', equal: true, axes: true, grid: true, xlabel: 'Re', ylabel: 'Im',
      sliders: [
        { key: 'a', label: 'Amplitude ratio $E_{02}/E_{01}$', min: 0, max: 1.5, step: 0.05, value: 1, explain: 'How strong the second wave is compared with the first.' },
        { key: 'd', label: 'Phase difference $\\delta = \\alpha_2 - \\alpha_1$', min: 0, max: 360, step: 1, value: 60, unit: '^\\circ', explain: 'How far wave 2 leads wave 1.' },
      ],
      curves: [{ param: ['1 + a*cos(t)', 'a*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1, dash: [4, 4] }],
      arrows: [
        { from: [0, 0], to: [1, 0], color: 'accent', width: 2.6, label: 'E₁' },
        { from: [1, 0], to: ['1 + a*cos(d*pi/180)', 'a*sin(d*pi/180)'], color: 'teal', width: 2.6, label: 'E₂' },
        { from: [0, 0], to: ['1 + a*cos(d*pi/180)', 'a*sin(d*pi/180)'], color: 'gold', width: 3.2, label: 'E', labelDx: -22, labelDy: 4 },
      ],
      readouts: [
        { label: 'irradiance $E_0^2$ (wave 1 = 1)', expr: '1 + a^2 + 2*a*cos(d*pi/180)', digits: 3 },
        { label: 'incoherent sum $1 + a^2$', expr: '1 + a^2', digits: 3 },
      ],
    },
    caption: t`Phasors in the complex plane; the whole picture turns at $\omega$ (about $3\times10^{15}$ rad/s for visible light), so only the lengths and relative angles matter. Ideal, perfectly monochromatic waves.`,
  },
  example: {
    prompt: t`Three waves of one frequency meet at a point: amplitudes ${EX.E.join(', ')} V/m with phases $${EX.a[0]}^\circ$, $${EX.a[1]}^\circ$ and $${EX.a[2]}^\circ$. Find the amplitude and phase of their sum. How does its irradiance compare with the sum of the three irradiances?`,
    visual: chain(EX.E, EX.a, t`The three phasors head to tail (blue, teal, violet) and their sum (gold). Lengths to scale.`),
    steps: [
      { label: 'Components', text: t`Each phasor has $x$-part $E_0\cos\alpha$ and $y$-part $E_0\sin\alpha$. Summing: $X = 3 + 4\cos60^\circ + 2\cos150^\circ = ${sf(EX.x, 4)}$ and $Y = 0 + 4\sin60^\circ + 2\sin150^\circ = ${sf(EX.y, 4)}$ (V/m).` },
      { label: 'Amplitude', text: t`$E_0 = \sqrt{X^2 + Y^2} = ${sf(EX.E0, 4)}$ V/m.` },
      { label: 'Phase', text: t`$\alpha = \arctan(Y/X) = ${sf(EX.al, 4)}^\circ$; $X > 0$, so no quadrant correction. The sum is $${sf(EX.E0, 4)}\cos(\omega t + ${sf(EX.al, 3)}^\circ)$ V/m.` },
      { label: 'Irradiances', text: t`$E_0^2 = ${sf(EX.E0 ** 2, 4)}$ against $3^2 + 4^2 + 2^2 = ${EX.Isum}$ (V/m)²: the coherent sum is $${sf(EX.E0 ** 2 / EX.Isum, 3)}$ times the incoherent one. The extra comes from the interference terms, $2E_{0i}E_{0j}\cos(\alpha_j - \alpha_i)$ for each pair.` },
    ],
    answer: t`$E_0 = ${sf(EX.E0, 3)}$ V/m at $\alpha = ${sf(EX.al, 3)}^\circ$; irradiance $${sf(EX.E0 ** 2 / EX.Isum, 3)}$ times the sum of the three.`,
  },
  practice: [
    num({
      id: 'two-amp', difficulty: 1,
      gen(r) {
        const a1 = r.pick([2, 3, 5]), a2 = r.pick([1, 2, 4]), d = r.pick([30, 45, 90, 120, 135]);
        const E0 = Math.sqrt(a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(d * DEG));
        return {
          prompt: t`Two waves of one frequency, amplitudes ${a1} V/m and ${a2} V/m, meet with a phase difference of ${d}°. What is the amplitude of their sum, in V/m?`,
          visual: waves(a1, a2, d, t`The two waves (dashed) and their sum (gold) against time at one point.`),
          answer: E0, units: 'V/m', tol: { rel: 0.005 },
          errors: [{ value: a1 + a2, feedback: 'Amplitudes add directly only in phase (δ = 0).' }, { value: Math.sqrt(a1 * a1 + a2 * a2), feedback: 'That leaves out the interference term, 2E₀₁E₀₂ cos δ.' }, { value: Math.sqrt(a1 * a1 + a2 * a2 - 2 * a1 * a2 * Math.cos(d * DEG)), feedback: t`Sign: phasors add head to tail, so the term is $+2E_{01}E_{02}\cos\delta$.` }].filter((e) => Math.abs(e.value - E0) > 0.01 * E0),
          hints: [t`$E_0^2 = E_{01}^2 + E_{02}^2 + 2E_{01}E_{02}\cos\delta$.`],
          teach: 'Same-frequency waves add as arrows: the resultant amplitude follows the law of cosines.',
          explain: t`$E_0 = \sqrt{${a1 * a1} + ${a2 * a2} + 2(${a1})(${a2})\cos${d}^\circ} = ${sf(E0, 3)}$ V/m.`,
        };
      },
    }),
    num({
      id: 'two-phase', difficulty: 2,
      gen(r) {
        const a1 = r.pick([1, 2, 3]), a2 = r.pick([2, 3, 4]), d = r.pick([60, 100, 150]);
        const al = Math.atan2(a2 * Math.sin(d * DEG), a1 + a2 * Math.cos(d * DEG)) / DEG;
        return {
          prompt: t`$E_1 = ${a1}\cos\omega t$ and $E_2 = ${a2}\cos(\omega t + ${d}^\circ)$ (V/m). The sum is $E_0\cos(\omega t + \alpha)$. What is $\alpha$, in degrees?`,
          visual: chain([a1, a2], [0, d], t`The two phasors head to tail and their sum (gold); lengths to scale.`),
          answer: al, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: Math.atan((a2 * Math.sin(d * DEG)) / (a1 + a2 * Math.cos(d * DEG))) / DEG, feedback: 'The x-component is negative: add 180° to the arctangent (or use atan2).' }, { value: d / 2, feedback: 'The phase of the sum lies halfway only when the amplitudes are equal.' }].filter((e) => Math.abs(e.value - al) > 0.01 * Math.abs(al)),
          hints: [t`$\tan\alpha = \dfrac{E_{01}\sin\alpha_1 + E_{02}\sin\alpha_2}{E_{01}\cos\alpha_1 + E_{02}\cos\alpha_2}$.`, 'Check the sign of the denominator: if it is negative, the phasor points into the left half-plane.'],
          teach: 'The phase of the sum is the direction of the resultant phasor; watch the quadrant.',
          explain: t`$X = ${sf(a1 + a2 * Math.cos(d * DEG), 4)}$, $Y = ${sf(a2 * Math.sin(d * DEG), 4)}$, so $\alpha = ${sf(al, 4)}^\circ$.`,
        };
      },
    }),
    mcq({
      id: 'flashlights', difficulty: 2,
      prompt: t`Two identical flashlights shine on the same wall. Why is the overlap just twice as bright as one spot, with no bright and dark fringes?`,
      visual: waves(1, 1, 0, t`Two waves at one instant; for two flashlights the phase difference wanders randomly, about every $10^{-14}$ s.`, { sum: false }),
      choices: ['Their phase difference changes randomly far faster than any detector responds, so the interference term averages to zero and irradiances add.', 'Light from different sources cannot overlap.', 'The fringes are there but always exactly λ/2 apart, too close to see.', 'Each flashlight’s light is polarized differently, always at right angles.'],
      answer: 0,
      why: { 1: 'Light superposes wherever it overlaps; the question is what the detector averages.', 2: 'With a random phase, the fringe pattern moves randomly too, and blurs out.', 3: 'Flashlight light is unpolarized; orthogonal polarizations would also kill the cross term, but that is not why.' },
      hints: [t`Average $\cos(\alpha_2 - \alpha_1)$ over a phase that takes every value equally often.`],
      teach: 'Incoherent sources: the time-averaged interference term is zero, so irradiances add.',
      explain: t`Thermal sources emit in uncorrelated bursts lasting femtoseconds. $\langle\cos(\alpha_2 - \alpha_1)\rangle = 0$ over the detector’s response time, so $I = I_1 + I_2$. Two lasers of slightly different frequency do interfere — the fringes race past at the beat frequency (O5.2).`,
    }),
    num({
      id: 'n-coherent', difficulty: 2,
      gen(r) {
        const N = r.pick([4, 7, 16, 19, 64]);
        return {
          prompt: t`${N} identical fibre amplifiers are combined into one beam. On the beam’s axis in the far field, by what factor is the irradiance higher when they are locked in phase (coherent combining) than when their phases are random (incoherent)?`,
          visual: chain(Array(Math.min(N, 8)).fill(1), [0, 211, 47, 300, 128, 262, 15, 170].slice(0, Math.min(N, 8)), t`Random phases: the phasors wander (a random walk, drawn for ${Math.min(N, 8)} of them); in phase they would line up into one arrow ${N} long.`, { labels: false, pad: 0.3 }),
          answer: N, tol: { rel: 1e-6, abs: 0.01 },
          errors: [{ value: N * N, feedback: 'N² is coherent against one amplifier; incoherently N amplifiers already give N.' }, { value: Math.sqrt(N), feedback: 'Amplitudes: coherent N, incoherent √N on average; irradiances go as their squares.' }],
          hints: [t`Coherent: amplitude $NE$, irradiance $N^2I_1$.`, t`Incoherent: irradiances add, $NI_1$.`],
          teach: 'N coherent emitters in phase give N² times one; incoherent, only N times.',
          explain: t`$N^2I_1/(NI_1) = ${N}$. The total power is the same either way; coherence concentrates it on the axis — the principle of phased arrays and laser beam combining.`,
        };
      },
    }),
    num({
      id: 'n-incremental', difficulty: 3,
      gen(r) {
        const N = r.pick([3, 4, 5, 6]), d = r.pick([20, 30, 40, 50]);
        const E = Math.sin((N * d * DEG) / 2) / Math.sin((d * DEG) / 2);
        return {
          prompt: t`${N} waves of equal amplitude $E_1$ arrive with phases $0, \delta, 2\delta, \dots$ with $\delta = ${d}^\circ$ (as from ${N} equally spaced slits viewed at an angle). What is the amplitude of the sum, in units of $E_1$?`,
          visual: chain(Array(N).fill(1), Array(N).fill(0).map((_, i) => i * d), t`${N} equal phasors, each turned ${d}° from the last, and their sum (gold): they lie on an arc of a circle.`, { labels: false }),
          answer: Math.abs(E), tol: { rel: 0.005 },
          errors: [{ value: N, feedback: 'That is the in-phase sum (δ = 0). Each phasor is turned by δ.' }, { value: Math.sqrt(N), feedback: 'That is the incoherent (random-phase) average, not this fixed phase step.' }],
          hints: [t`The phasors are chords of a circle; the sum is the chord across $N\delta$.`, t`$E_0 = E_1\,\dfrac{\sin(N\delta/2)}{\sin(\delta/2)}$.`],
          teach: t`$N$ equal phasors stepped by $\delta$ sum to $E_1\sin(N\delta/2)/\sin(\delta/2)$: the formula behind gratings and phased arrays.`,
          explain: t`$E_0 = \dfrac{\sin(${N}\times${d}^\circ/2)}{\sin(${d}^\circ/2)}E_1 = ${sf(Math.abs(E), 4)}E_1$. When $N\delta = 360^\circ$ the arc closes into a polygon and the sum is zero: a dark direction of a grating (O8).`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-3x', difficulty: 2,
      prompt: t`Two coherent beams of equal irradiance $I_1$ overlap. Set their phase difference (between 0° and 180°) so that the combined irradiance is exactly $3I_1$.`,
      visual: { type: 'graph', params: { x: [-1.3, 2.4], y: [-1.6, 1.6], aspect: 'wide', equal: true, axes: true, grid: true, xlabel: 'Re', ylabel: 'Im',
        sliders: [{ key: 'd', label: 'Phase difference $\\delta$', min: 0, max: 180, step: 1, value: 120, unit: '^\\circ', explain: 'How far wave 2 leads wave 1.' }],
        curves: [{ param: ['1 + cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1, dash: [4, 4] }],
        arrows: [{ from: [0, 0], to: [1, 0], color: 'accent', width: 2.6, label: 'E₁' }, { from: [1, 0], to: ['1 + cos(d*pi/180)', 'sin(d*pi/180)'], color: 'teal', width: 2.6, label: 'E₂' }, { from: [0, 0], to: ['1 + cos(d*pi/180)', 'sin(d*pi/180)'], color: 'gold', width: 3.2, label: 'E', labelDx: -22, labelDy: 4 }] },
        caption: t`Two equal phasors and their sum (gold); each alone has length 1, irradiance 1.` },
      param: 'd', answer: [59, 61],
      instruction: 'Set δ so the gold arrow’s length squared is 3, then check.',
      hints: [t`$I = 2I_1(1 + \cos\delta)$.`, t`$1 + \cos\delta = 3/2$, so $\cos\delta = 1/2$.`],
      teach: t`Two equal coherent beams give $I = 2I_1(1 + \cos\delta) = 4I_1\cos^2(\delta/2)$.`,
      explain: t`$\cos\delta = 0.5$: $\delta = 60^\circ$, and the gold arrow is $\sqrt3$ long.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-combine', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([7, 16, 19, 32]);
        const ratio = ((N - 2) / N) ** 2;
        return {
          prompt: t`A laser power-beaming array coherently combines ${N} equal emitters. One of them drifts exactly half a cycle out of phase. On the beam’s axis, what fraction of the ideal (all in phase) irradiance remains?`,
          visual: chain([N - 1, 1], [0, 180], t`${N - 1} phasors in line (drawn as one long arrow) and one reversed (teal).`, { labels: false, pad: 0.15 }),
          answer: ratio, tol: { rel: 0.005 },
          errors: [{ value: (N - 1) / N, feedback: 'The reversed emitter does not just drop out: it cancels another one. Amplitude N − 2.' }, { value: ((N - 1) / N) ** 2, feedback: 'That is with the emitter switched off. Reversed, it subtracts: amplitude N − 2.' }, { value: (N - 2) / N, feedback: 'Irradiance goes as the amplitude squared.' }],
          hints: [t`In phase: amplitude $N E_1$. With one reversed: $(N - 1)E_1 - E_1$.`, 'Square the ratio of amplitudes.'],
          teach: 'In a coherent array, one emitter out of phase costs twice its share of amplitude — and the loss is squared.',
          explain: t`$\left(\dfrac{N - 2}{N}\right)^2 = ${sf(ratio, 3)}$. That is why combined lasers need active phase locking to a small fraction of a wavelength.`,
        };
      },
    }),
    mcq({
      id: 'cp-stars', difficulty: 2,
      prompt: t`Two faint stars fall on the same pixel of a star tracker’s detector. How should their signals be combined to predict the pixel’s reading?`,
      visual: waves(1, 0.6, 75, t`Two waves at one instant; for two stars the phase difference changes randomly from moment to moment.`, { sum: false }),
      choices: ['Add the irradiances: the stars are independent, incoherent sources.', 'Add the field amplitudes, then square.', 'Take the larger of the two.', 'It depends on whether the stars are in phase, which is random: the pixel flickers between dark and bright.'],
      answer: 0,
      why: { 1: 'That assumes a fixed phase difference; for independent sources the cross term averages to zero.', 2: 'Both stars deposit energy; the reading is their sum.', 3: 'The phase wanders in femtoseconds; a detector integrating for milliseconds sees only the average.' },
      hints: ['What is the time average of the interference term for independent sources?'],
      teach: 'For incoherent sources, irradiances (and photon counts) add.',
      explain: t`The two stars’ fields have no fixed phase relation, so over the exposure $\langle 2E_1E_2\cos\delta\rangle = 0$ and $I = I_1 + I_2$. (Light from one star, split and recombined, is a different matter: that is interferometry, O7 and O10.)`,
    }),
    num({
      id: 'cp-visibility', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([2, 4, 9, 16]);
        const Vis = (2 * Math.sqrt(k)) / (1 + k);
        return {
          prompt: t`The two arms of an interferometer return coherent beams whose irradiances differ by a factor of ${k}. As the phase difference changes, the output swings between $I_{\max}$ and $I_{\min}$. What is the fringe visibility $(I_{\max} - I_{\min})/(I_{\max} + I_{\min})$?`,
          visual: waves(1, sf(1 / Math.sqrt(k), 3), 0, t`The two returning waves in phase (amplitudes in the ratio $\sqrt{${k}}$ to 1) and their sum.`),
          answer: Vis, tol: { rel: 0.005 },
          errors: [{ value: (k - 1) / (k + 1), feedback: t`Use amplitudes: $I_{\max,\min} = (\sqrt{I_1} \pm \sqrt{I_2})^2$.` }, { value: 1, feedback: t`Unequal beams cannot cancel completely: $I_{\min}$ is not zero.` }],
          hints: [t`$I_{\max} = (\sqrt{I_1} + \sqrt{I_2})^2$ and $I_{\min} = (\sqrt{I_1} - \sqrt{I_2})^2$.`, t`Visibility $= 2\sqrt{I_1I_2}/(I_1 + I_2)$.`],
          teach: t`Fringe visibility $2\sqrt{I_1I_2}/(I_1 + I_2)$: even a 4:1 imbalance keeps it at 0.8.`,
          explain: t`$V = 2\sqrt{${k}}/(1 + ${k}) = ${sf(Vis, 3)}$. Visibility is forgiving of imbalance; it is far more sensitive to lost coherence (O10).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §7.1 (addition of waves of the same frequency)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'T. Y. Fan, Laser beam combining for high-power, high-radiance sources, IEEE J. Sel. Top. Quantum Electron. 11, 567 (2005)', url: 'https://doi.org/10.1109/JSTQE.2005.850241' },
  ],
});
