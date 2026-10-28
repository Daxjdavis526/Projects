// Velocity addition and the Doppler effect — the velocity transformation
// from the Lorentz transformation, Fizeau's moving water (Fresnel's drag
// coefficient falls out), the Doppler shift at any angle including the
// transverse shift, which is pure time dilation: SS 433's jets (worked
// example), Ives–Stilwell, the CMB dipole (Planck 2018), quasar-jet Doppler
// factors, and the twin paradox counted in signals. The radial formula and
// simple velocity sums are in phys2220.R1.3 and not repeated. Every number
// is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, T_CMB, DT_CMB } from './_constants.js';
import { seg, label, frame, minkowski, spectrumStrip, disc, r6 } from './_diagrams.js';

const t = String.raw;
const g = (b) => 1 / Math.sqrt(1 - b * b);
const add = (u, v) => (u + v) / (1 + u * v);
const doppler = (b, deg) => 1 / (g(b) * (1 - b * Math.cos((deg * Math.PI) / 180)));
const SS = { b: 0.26, Ha: 656.28 };
SS.G = g(SS.b);
const N_WATER = 1.333;

/** SS 433, schematic: a central star with two opposite jets. */
const ss433 = {
  type: 'graph',
  params: frame([-5, 9], [-2.6, 2.6], {
    aspect: 'wide',
    shade: [disc(0, 0, 0.45, 'warn', 0.85)],
    curves: [seg(-2.6, 0, 2.6, 0, 'ink3', 1, true), seg(4.6, -1.6, 4.6, 1.6, 'ink3', 1.2, true)],
    arrows: [{ from: [0.5, 0.4], to: [2.4, 2.0], color: 'violet', width: 2.6, label: 'jet, 0.26c', labelDx: 8, labelDy: 0 }, { from: [-0.5, -0.4], to: [-2.4, -2.0], color: 'violet', width: 2.6, label: 'jet, 0.26c', labelDx: -8, labelDy: 0, labelAlign: 'right' }, { from: [5.2, 0], to: [8.4, 0], color: 'gold', width: 1.8, label: 'to Earth', labelDx: -60, labelDy: -14 }],
    points: [label(0, -0.45, 'SS 433', 'warn', 0, 16, 'center')],
  }),
  caption: 'SS 433, schematic: a compact star feeding on a companion fires two opposite jets of gas at 0.26c. The jets precess, sweeping round a cone every 162 days. Not to scale.',
};

/** A spacetime diagram of the twins exchanging yearly signals (c = 1). */
function signals({ D, b, from = 'earth', caption }) {
  const T = 2 * D / b, tu = D / b, G = g(b), lines = [];
  if (from === 'earth') {
    // Earth sends at t = 1, 2, …; each signal meets the traveller
    for (let k = 1; k < T; k++) {
      const tOut = k / (1 - b);                     // meets the outbound traveller: t = k + x, x = b t
      if (tOut <= tu) lines.push({ pts: [[0, k], [b * tOut, tOut]], color: 'warn', width: 1.1 });
      else {
        const tIn = (k + 2 * D) / (1 + b);           // meets the inbound traveller: t = k + x, x = 2D − b t
        if (tIn <= T) lines.push({ pts: [[0, k], [tIn - k, tIn]], color: 'warn', width: 1.1 });
      }
    }
  }
  return minkowski({
    x: [-0.2 * D, 1.3 * D], t: [-0.04 * T, 1.04 * T], numbers: false, aspect: 'square',
    lines: [{ pts: [[0, 0], [0, T]], color: 'accent', width: 2.6 }, { pts: [[0, 0], [D, tu], [0, T]], color: 'gold', width: 2.6 }, ...lines],
    extra: { points: [label(0, 0.1 * T, 'Earth', 'accent', -8, 0, 'right'), label(D, tu, 'turnaround', 'gold', 10, 0)] },
    caption: caption ?? 'Earth’s frame (c = 1). Orange: Earth’s yearly signals, running at 45° to the traveller (gold). Few reach the traveller on the way out; they pile in on the way home.',
  });
}

export default lesson({
  id: 'phys2710.MP2.5',
  title: 'Velocity addition and the Doppler effect',
  minutes: 14, difficulty: 3,
  intro: t`Follow a moving object through the Lorentz transformation and its velocity transforms too. An object moving at $u$ along $x$ in frame $S$ moves, in $S'$ (itself moving at $v$), at

$$u' = \frac{u - v}{1 - uv/c^2}, \qquad f = \frac{f_0}{\gamma\,(1 - \beta\cos\theta)}$$

The second formula is the Doppler effect for light: a source moving at $\beta = v/c$, whose light reaches you at angle $\theta$ to its direction of motion (measured in your frame), arrives at frequency $f$ instead of its own $f_0$. Head-on it gives $\sqrt{(1 + \beta)/(1 - \beta)}$; receding, its inverse. Unlike sound, there is a shift even at $\theta = 90°$, where the source moves straight across your line of sight: $f = f_0/\gamma$. That **transverse Doppler effect** is time dilation, seen in starlight.

> You met the velocity rule and the radial Doppler formula in [The Lorentz transformation](#/lesson/phys2220.R1.3). Here: what they did to the ether theory, what they show astronomers, and how they settle the twin paradox by counting signals.`,
  symbols: [
    { tex: "u,\\ u'", text: t`an object’s velocity along $x$ in frame $S$ and in frame $S'$, in m/s` },
    { tex: 'v', text: t`the velocity of $S'$ relative to $S$, along $x$, in m/s` },
    { tex: 'f_0', text: 'the frequency of the light in the source’s own frame, in Hz' },
    { tex: 'f', text: 'the frequency you receive, in Hz; wavelengths change by the inverse factor, $\\lambda = \\lambda_0\\,\\gamma(1 - \\beta\\cos\\theta)$' },
    { tex: '\\beta', text: 'the source’s speed as a fraction of $c$' },
    { tex: '\\gamma', text: '$1/\\sqrt{1 - \\beta^2}$' },
    { tex: '\\theta', text: 'the angle, in your frame, between the source’s velocity and the line from the source to you: 0° approaching head-on, 180° receding' },
  ],
  why: 'The Doppler shift of light is how astronomers weigh black holes, find exoplanets and measure our own motion through the universe; and velocity addition is why no sequence of boosts — no staging, however clever — ever reaches c.',
  visual: {
    type: 'graph',
    title: 'Doppler factor against angle, relativistic and classical',
    lead: t`For a source moving at the slider’s $\beta$, the gold curve is the received frequency $f/f_0$ against the angle $\theta$ between its motion and your line of sight. The dashed curve is the classical formula $1/(1 - \beta\cos\theta)$, which has no time dilation.`,
    tasks: [
      'At θ = 90° the classical curve gives exactly 1, but relativity gives 1/γ: at β = 0.26 (SS 433’s jets), 0.966 — a redshift of 3.6%.',
      'Push β to 0.6: head-on (θ = 0) light arrives at twice its frequency, receding (θ = 180°) at half.',
      'Find where the gold curve crosses 1: not at 90° but ahead of it — a source must approach slightly to cancel its time dilation.',
    ],
    params: {
      x: [0, 180], y: [0, 3.2], aspect: 'wide', xlabel: 'angle θ between motion and line of sight (°)', ylabel: 'f / f₀', xticks: 6,
      sliders: [
        { key: 'b', label: 'Source speed $\\beta = v/c$', min: 0, max: 0.8, step: 0.01, value: 0.26, unit: '', explain: 'SS 433’s jets move at 0.26c; quasar jets reach above 0.99c.' },
        { key: 'th', label: 'Angle $\\theta$', min: 0, max: 180, step: 1, value: 90, unit: '^\\circ', explain: '0° means the source comes straight at you; 90°, across your line of sight; 180°, straight away.' },
      ],
      hlines: [{ y: 1, label: 'no shift', color: 'ink3' }],
      curves: [{ fn: '1/(1 - b*cos(x*pi/180))', color: 'ink3', dash: true, width: 1.8 }, { fn: 'sqrt(1 - b^2)/(1 - b*cos(x*pi/180))', color: 'gold', width: 2.6 }],
      points: [{ x: 'th', y: 'sqrt(1 - b^2)/(1 - b*cos(th*pi/180))', color: 'gold', r: 5.5 }],
      readouts: [
        { label: t`$f/f_0$`, expr: 'sqrt(1 - b^2)/(1 - b*cos(th*pi/180))', digits: 4 },
        { label: t`redshift $z = f_0/f - 1$`, expr: '(1 - b*cos(th*pi/180))/sqrt(1 - b^2) - 1', digits: 3 },
        { label: t`classical $f/f_0$`, expr: '1/(1 - b*cos(th*pi/180))', digits: 4 },
        { label: t`$1/\gamma$`, expr: 'sqrt(1 - b^2)', digits: 4 },
      ],
    },
    caption: t`The relativistic Doppler factor $1/(\gamma(1 - \beta\cos\theta))$ (gold) and the classical one (dashed), with $\theta$ measured in the receiver’s frame. Light needs no medium, so only the relative motion matters; the dashed curve is shown only for comparison.`,
  },
  example: {
    prompt: t`SS 433, a binary star about 18 000 light-years away, fires two opposite jets of gas at $${SS.b}c$. Each jet’s hydrogen glows, so the Hα line ($\lambda_0 = ${SS.Ha}$ nm) appears twice — once from each jet — and both copies swing to and fro as the jets precess. Astronomers found that the *average* of the two shifted wavelengths is not 656.28 nm but redshifted by $z \approx 0.036$. Explain the average, and predict it.`,
    visual: spectrumStrip({
      from: 560, to: 800,
      marks: [{ nm: SS.Ha, label: 'Hα at rest', color: 'ink', dy: -12 }, { nm: SS.Ha * SS.G * (1 - SS.b * 0.5), label: 'jet toward us' }, { nm: SS.Ha * SS.G * (1 + SS.b * 0.5), label: 'jet away' }, { nm: SS.Ha * SS.G, label: 'their average', color: 'gold', dy: -26, dash: true }],
      caption: 'The two moving Hα lines of SS 433 at one moment, with the jets at 60° to our line of sight (illustrative), and the rest wavelength. Their average sits redward of the rest line. Screen colours approximate.',
    }),
    steps: [
      { label: 'One jet', text: t`Light from a source moving at angle $\theta$ arrives with $\lambda = \lambda_0\,\gamma\,(1 - \beta\cos\theta)$: a classical part, $-\beta\cos\theta$, and the factor $\gamma$ from the moving atoms’ slow clocks.` },
      { label: 'Two opposite jets', text: t`The other jet moves the opposite way, at $\theta + 180°$: $\lambda = \lambda_0\,\gamma\,(1 + \beta\cos\theta)$. Average the two: the $\pm\beta\cos\theta$ parts cancel, **whatever the angle**, leaving $\bar\lambda = \gamma\,\lambda_0$.` },
      { label: 'Put in the numbers', text: t`$\gamma = 1/\sqrt{1 - ${SS.b}^2} = ${fmt(SS.G, 5)}$, so $z = \gamma - 1 = ${fmt(SS.G - 1, 3)}$, and the average line sits at $${SS.Ha}\times${fmt(SS.G, 5)} = ${fmt(SS.Ha * SS.G, 4)}$ nm.` },
      { label: 'Compare with classical physics', text: t`Without time dilation the average would sit exactly at 656.28 nm. The observed $z \approx 0.036$ matches $\gamma - 1$: the transverse Doppler effect, in a star 18 000 light-years away. Fitting the swinging lines over many years gives the jet speed itself, $0.26c$.` },
      { label: 'Sense check', text: t`$\gamma - 1 \approx \tfrac12\beta^2 = ${fmt(0.5 * SS.b ** 2, 3)}$ — close to ${fmt(SS.G - 1, 3)}, as it should be at a quarter of the speed of light. Time dilation is second order in $\beta$; the classical shift is first order, which is why it dominates each line but cancels in the average.` },
    ],
    answer: t`The average of the two lines is $\gamma\lambda_0$: $z = \gamma - 1 = ${fmt(SS.G - 1, 3)}$, the time dilation of the jets’ atoms, putting the mean at ${fmt(SS.Ha * SS.G, 4)} nm.`,
  },
  practice: [
    num({
      id: 'jets-relative', difficulty: 1,
      prompt: t`SS 433’s two jets move in opposite directions, each at $${SS.b}c$ relative to the star. How fast does one jet move as measured from the other? Give $v/c$.`,
      answer: add(SS.b, SS.b), tol: { rel: 0.003 },
      errors: [{ value: 2 * SS.b, feedback: t`Galileo’s sum, $0.52c$. Velocities combine as $\dfrac{u + v}{1 + uv/c^2}$.` }],
      hints: [t`In the frame of one jet, the star recedes at $${SS.b}c$ and the other jet moves at $${SS.b}c$ beyond it.`, t`$\dfrac{${SS.b} + ${SS.b}}{1 + ${SS.b}^2}$.`],
      teach: 'Speeds in opposite directions combine as (u + v)/(1 + uv/c²), always below c.',
      explain: t`$\dfrac{0.52}{1 + ${fmt(SS.b ** 2, 4)}} = ${fmt(add(SS.b, SS.b), 4)}$, so about $${fmt(add(SS.b, SS.b), 3)}c$ — a few per cent less than Galileo’s 0.52c.`,
      visual: ss433,
    }),
    num({
      id: 'fizeau', difficulty: 3,
      gen(r) {
        const v = r.pick([7.06, 5.0, 10.0]);
        const extra = (C / N_WATER + v) / (1 + v / (N_WATER * C)) - C / N_WATER;
        return {
          prompt: t`In 1851 Fizeau sent light along tubes of flowing water ($n = ${N_WATER}$), with and against the flow. Light moves at $c/n$ relative to the water; the water moves at $v = ${v}$ m/s along the light. Using relativistic velocity addition, by how many m/s is the light faster in the laboratory than $c/n$?`,
          answer: extra, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: v, feedback: t`That is Galileo’s answer: full drag, $c/n + v$. Velocity addition carries only part of $v$: $u \approx c/n + v(1 - 1/n^2)$.` }, { value: v / N_WATER, feedback: t`The fraction carried along is $1 - 1/n^2$, not $1/n$.` }],
          hints: [t`$u = \dfrac{c/n + v}{1 + v/(nc)}$. With $v \ll c$, expand: $u \approx \dfrac{c}{n} + v\left(1 - \dfrac{1}{n^2}\right)$.`, t`$1 - 1/${N_WATER}^2 = ${fmt(1 - 1 / N_WATER ** 2, 4)}$.`],
          teach: 'Fizeau’s partial “ether drag”, a puzzle for fifty years, is just relativistic velocity addition: moving water carries light along by v(1 − 1/n²).',
          explain: t`$v\,(1 - 1/n^2) = ${v}\times${fmt(1 - 1 / N_WATER ** 2, 4)} = ${fmt(extra, 3)}$ m/s. Fresnel had predicted this “drag coefficient” in 1818 by imagining the ether partly dragged by matter; Fizeau measured it, and in 1907 von Laue showed it is simply velocity addition — no ether needed.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 12], y: [0, 12], aspect: 'wide', xlabel: 'water speed v (m/s)', ylabel: 'light’s extra speed (m/s)',
              curves: [{ fn: 'x', color: 'ink3', dash: true, width: 2, label: 'Galileo: full drag', labelAt: 1.5, labelDx: -60, labelDy: -40 }, { fn: `x*${r6(1 - 1 / N_WATER ** 2)}`, color: 'gold', width: 2.6, label: 'relativity: v(1 − 1/n²)', labelAt: 9, labelDx: -40, labelDy: 18 }],
              vlines: [{ x: v, label: `${v} m/s`, color: 'accent' }],
            },
            caption: 'How much faster light moves in water flowing at v than in still water: all of v by Galileo’s rule (dashed), a fraction by relativity (gold).',
          },
        };
      },
    }),
    mcq({
      id: 'transverse', difficulty: 2,
      prompt: t`A source of light moves straight across your line of sight, so that in your frame its light reaches you at $\theta = 90°$ to its velocity. Compared with its own frequency $f_0$, the light you receive is:`,
      visual: { type: 'graph', params: frame([-4, 4], [-1.4, 2.6], { aspect: 'wide', curves: [seg(-3.6, 1.8, 3.6, 1.8, 'ink3', 1, true)], points: [{ x: 0, y: 1.8, r: 6, color: 'warn', label: 'source', labelDx: 0, labelDy: -16, labelAlign: 'center' }, { x: 0, y: -0.9, r: 6, color: 'accent', label: 'you', labelDx: 10, labelDy: 0 }], arrows: [{ from: [0.3, 1.8], to: [2.3, 1.8], color: 'violet', width: 2.2, label: 'v', labelDx: 8, labelDy: 0 }, { from: [0, 1.55], to: [0, -0.6], color: 'gold', width: 1.8 }] }), caption: 'The light reaching you leaves the source at right angles to its motion, in your frame. Not to scale.' },
      choices: [t`Lower, by the factor $1/\gamma$`, 'Unchanged, since the source is neither approaching nor receding', t`Higher, by the factor $\gamma$`, t`Lower, by the factor $1 - \beta$`],
      answer: 0,
      why: {
        1: 'That is the classical prediction. Relativity adds a shift with no classical counterpart: the source’s clock runs slow in your frame.',
        2: 'At θ = 90° in your frame, the moving source’s slow clock makes its waves arrive less often: lower, not higher.',
        3: t`$1 - \beta$ is a first-order shift from approach or recession; across the line of sight the first-order term vanishes and only $1/\gamma$ remains.`,
      },
      hints: [t`Put $\theta = 90°$ into $f = \dfrac{f_0}{\gamma(1 - \beta\cos\theta)}$.`],
      teach: 'The transverse Doppler effect is pure time dilation: a source moving across your line of sight is received at f₀/γ.',
      explain: t`$\cos 90° = 0$, so $f = f_0/\gamma$: redshifted. Ives and Stilwell first saw this in 1938 with fast hydrogen ions; today the Mössbauer effect, storage rings and SS 433 all confirm it.`,
    }),
    num({
      id: 'ives-stilwell', difficulty: 3,
      gen(r) {
        const v = r.pick([0.8e6, 1.0e6, 1.5e6]);
        const b = v / C, shift = 486.13 * (g(b) - 1) * 1e3;
        return {
          prompt: t`Ives and Stilwell (1938) watched fast hydrogen atoms emit the Hβ line ($\lambda_0 = 486.13$ nm) and measured it in light sent straight forward and straight backward. The two wavelengths are $\lambda_0\gamma(1 \mp \beta)$, so their average is $\gamma\lambda_0$. For atoms moving at $${tex(v, 2)}$ m/s, by how many picometres is the average shifted from $\lambda_0$?`,
          answer: shift, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: 486.13 * b * 1e3, feedback: t`The first-order shifts $\pm\beta\lambda_0$ cancel in the average. What remains is $(\gamma - 1)\lambda_0 \approx \tfrac12\beta^2\lambda_0$.` }],
          hints: [t`The shift of the average is $(\gamma - 1)\lambda_0 \approx \tfrac12\beta^2\lambda_0$.`, t`$\beta = ${tex(b, 3)}$, so $\tfrac12\beta^2 = ${tex(0.5 * b * b, 3)}$.`],
          teach: 'Averaging the forward and backward Doppler shifts cancels the classical part and leaves the time-dilation shift (γ − 1)λ₀.',
          explain: t`$(\gamma - 1)\lambda_0 = ${tex(g(b) - 1, 3)}\times486.13\ \text{nm} = ${fmt(shift, 3)}$ pm, toward the red. Ives and Stilwell found shifts of this size, agreeing with $\gamma$ to a few per cent; laser spectroscopy of fast ions now confirms it to parts in a billion.`,
          visual: spectrumStrip({
            from: 483, to: 489.3, xlabel: 'wavelength (nm)',
            marks: [{ nm: 486.13, label: 'Hβ at rest', dy: -18 }, { nm: r6(486.13 * g(b) * (1 - b)), label: 'forward', color: 'accent' }, { nm: r6(486.13 * g(b) * (1 + b)), label: 'backward', color: 'warn' }],
            caption: `A close-up around Hβ for atoms at ${fmt(v / 1e6, 2)} × 10⁶ m/s. The forward and backward lines sit ${fmt(486.13 * b, 2)} nm either side of the rest line; the shift of their average is far too small to see at this scale. Screen colours approximate.`,
          }),
        };
      },
    }),
    num({
      id: 'blob-doppler', difficulty: 2,
      gen(r) {
        const [b, th] = r.pick([[0.98, 5], [0.99, 10], [0.95, 20]]);
        const D = doppler(b, th);
        return {
          prompt: t`A blob of plasma in a quasar’s jet moves at $${b}c$, at ${th}° to our line of sight, approaching. By what factor is the frequency of its light raised? (Use $f/f_0 = 1/[\gamma(1 - \beta\cos\theta)]$.)`,
          answer: D, tol: { rel: 0.01 },
          errors: [{ value: 1 / (1 - b * Math.cos((th * Math.PI) / 180)), feedback: t`That leaves out time dilation; divide by $\gamma = ${fmt(g(b), 4)}$.` }, { value: Math.sqrt((1 + b) / (1 - b)), feedback: `That is the head-on factor (θ = 0). At ${th}° the cosine matters.` }],
          hints: [t`$\gamma = 1/\sqrt{1 - ${b}^2} = ${fmt(g(b), 4)}$ and $\cos ${th}° = ${fmt(Math.cos((th * Math.PI) / 180), 5)}$.`],
          teach: 'Fast jets pointed near our line of sight are Doppler-boosted: their light arrives at many times its emitted frequency.',
          explain: t`$1 - ${b}\times${fmt(Math.cos((th * Math.PI) / 180), 5)} = ${fmt(1 - b * Math.cos((th * Math.PI) / 180), 4)}$, so $f/f_0 = 1/(${fmt(g(b), 4)}\times${fmt(1 - b * Math.cos((th * Math.PI) / 180), 4)}) = ${fmt(D, 3)}$. The brightness is boosted far more — roughly as the cube of this factor — which is why we see the jets pointed toward us and often miss their twins pointed away.`,
          visual: {
            type: 'graph',
            params: frame([-1, 11], [-1.6, 2.6], {
              aspect: 'wide',
              shade: [disc(0, 0, 0.35, 'warn', 0.9)],
              curves: [seg(0.4, 0, 10.6, 0, 'ink3', 1, true)],
              arrows: [{ from: [0.4, 0.07], to: [r6(0.4 + 4 * Math.cos((th * Math.PI) / 180)), r6(4 * Math.sin((th * Math.PI) / 180) + 0.07)], color: 'violet', width: 2.6, label: `blob, ${b}c`, labelDx: 8, labelDy: -6 }],
              points: [label(10.4, 0, 'to Earth', 'gold', 0, 14, 'right'), label(0, -0.35, 'quasar core', 'warn', 0, 16, 'center')],
            }),
            caption: t`A blob in a quasar jet moving at ${th}° to our line of sight (dashed). Not to scale.`,
          },
        };
      },
    }),
    num({
      id: 'twin-signals', difficulty: 2,
      gen(r) {
        const [D, b] = r.pick([[6, 0.6], [12, 0.6], [8, 0.8], [16, 0.8]]);
        const leg = D / b / g(b), k = Math.sqrt((1 - b) / (1 + b));
        const askIn = r.bool(0.5), ans = askIn ? leg / k : leg * k;
        return {
          prompt: t`Earth sends a radio pulse every year of Earth time. A traveller flies to a star ${D} light-years away at $${b}c$ and back; each leg lasts ${fmt(leg, 4)} years on the traveller’s clock. Pulses reach a receding receiver at the Doppler-reduced rate $\sqrt{(1 - \beta)/(1 + \beta)}$ per year and an approaching one at the inverse rate. How many pulses does the traveller receive on the ${askIn ? 'way home' : 'way out'}?`,
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: askIn ? leg * k : leg / k, feedback: askIn ? 'Coming home the traveller flies into the pulses: they arrive faster, not slower.' : 'Going out the traveller runs away from the pulses: they arrive slower, not faster.' }],
          hints: [t`The Doppler factor here is $\sqrt{(1 - ${b})/(1 + ${b})} = ${fmt(k, 4)}$.`, t`Pulses received $=$ rate $\times$ the traveller’s own time on that leg: ${askIn ? t`$${fmt(1 / k, 4)}\times${fmt(leg, 4)}$` : t`$${fmt(k, 4)}\times${fmt(leg, 4)}$`}.`],
          teach: 'Counting light signals settles the twin paradox: the traveller switches from slow to fast reception at the turnaround, halfway through her own trip.',
          explain: t`${askIn ? `On the way home: ${fmt(1 / k, 4)} × ${fmt(leg, 4)} = ${fmt(ans, 3)} pulses` : `On the way out: ${fmt(k, 4)} × ${fmt(leg, 4)} = ${fmt(ans, 3)} pulses`}. In all she receives $${fmt(leg * k + leg / k, 3)}$ pulses — exactly the ${fmt((2 * D) / b, 3)} years Earth ages — while she ages ${fmt(2 * leg, 3)} years. Every observer agrees on how many pulses arrive.`,
          visual: signals({ D, b }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-opposite', difficulty: 2,
      gen(r) {
        const [u, v] = r.pick([[0.6, 0.8], [0.5, 0.9], [0.3, 0.7]]);
        const ans = (v - u) / (1 - u * v);
        return {
          prompt: t`A transport moves at $${v}c$ relative to a space station. It fires a capsule backwards at $${u}c$ relative to itself. How fast does the capsule move relative to the station, and in which direction? Give $v/c$, positive along the transport’s motion.`,
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: v - u, feedback: t`Galileo’s difference. Use $u = \dfrac{u' + v}{1 + u'v/c^2}$ with $u' = -${u}c$.` }],
          hints: [t`With $u' = -${u}$ and $v = ${v}$: $u = \dfrac{-${u} + ${v}}{1 - ${u}\times${v}}$.`],
          teach: 'Velocity addition with a negative velocity: (v − u)/(1 − uv/c²).',
          explain: t`$\dfrac{${fmt(v - u, 3)}}{1 - ${fmt(u * v, 3)}} = ${fmt(ans, 4)}$: the capsule still moves forward, at $${fmt(ans, 3)}c$ — faster than Galileo’s ${fmt(v - u, 2)}c.`,
          visual: { type: 'graph', params: frame([-1.5, 9.5], [-1.2, 1.8], { aspect: 'wide', curves: [seg(-1.4, -0.5, -0.4, -0.5, 'ink2'), seg(-1.4, 0.5, -0.4, 0.5, 'ink2'), seg(-1.4, -0.5, -1.4, 0.5, 'ink2'), seg(-0.4, -0.5, -0.4, 0.5, 'ink2'), seg(3.4, -0.35, 6.4, -0.35, 'accent', 2.2), seg(3.4, 0.35, 6.4, 0.35, 'accent', 2.2), seg(3.4, -0.35, 3.4, 0.35, 'accent', 2.2), seg(6.4, -0.35, 7.2, 0, 'accent', 2.2), seg(6.4, 0.35, 7.2, 0, 'accent', 2.2)], points: [label(-0.9, -0.5, 'station', 'ink2', 0, 16, 'center'), { x: 2.2, y: 0, r: 5, color: 'gold', label: 'capsule', labelDx: 0, labelDy: 18, labelAlign: 'center' }], arrows: [{ from: [4, 1.2], to: [6.4, 1.2], color: 'accent', width: 2.2, label: `transport: ${v}c`, labelDx: 8, labelDy: 0 }, { from: [2.9, 0.6], to: [1.4, 0.6], color: 'gold', width: 2, label: `${u}c back (transport frame)`, labelDx: -10, labelDy: -12, labelAlign: 'right' }] }), caption: 'The transport and the capsule it fires backward. Not to scale.' },
        };
      },
    }),
    num({
      id: 'cp-cmb-dipole', difficulty: 3, transfer: true,
      prompt: t`Moving through the cosmic microwave background makes it look hotter ahead and cooler behind: to first order in $\beta$, $T(\theta) = T_0(1 + \beta\cos\theta)$, with $T_0 = ${T_CMB}$ K. The Planck satellite measured the amplitude of this dipole, $T_0\beta$, as $${fmt(DT_CMB * 1e3, 6)}$ mK. How fast is the Sun moving relative to the CMB? Answer in km/s.`,
      answer: (DT_CMB / T_CMB) * C / 1e3, units: 'km/s', tol: { rel: 0.005 },
      errors: [{ value: (DT_CMB / T_CMB) * 1e3, feedback: t`That is $\beta$ times 1000. Multiply $\beta$ by $c = 299\,792$ km/s.` }],
      hints: [t`$\beta = \Delta T/T_0 = \dfrac{${fmt(DT_CMB * 1e3, 6)}\times10^{-3}\ \text{K}}{${T_CMB}\ \text{K}}$.`, t`$v = \beta c$, with $c = 299\,792$ km/s.`],
      teach: 'A Doppler-shifted blackbody is still a blackbody, hotter ahead and cooler behind, so the CMB’s dipole measures our velocity through it.',
      explain: t`$\beta = ${tex(DT_CMB / T_CMB, 4)}$, so $v = ${fmt((DT_CMB / T_CMB) * C / 1e3, 4)}$ km/s, toward the constellation Crater. Each photon’s frequency is multiplied by $1/(\gamma(1 - \beta\cos\theta))$ — the formula of this lesson — and a Planck spectrum at $T_0$ becomes a Planck spectrum at $T_0/(\gamma(1 - \beta\cos\theta))$, which to first order is the dipole above. Planck used exactly this to measure the Sun’s motion.`,
      visual: { type: 'mp-blackbody', params: { T: T_CMB, axis: 'nu', compare: [r6(T_CMB * 1.05), r6(T_CMB * 0.95)], controls: false, readout: false, swatch: false, peak: false }, caption: 'The CMB’s spectrum (orange) and, exaggerated forty-fold, how it looks ahead of and behind a moving observer (grey): still blackbodies, hotter and cooler. The real dipole is about one part in a thousand.' },
    }),
    mcq({
      id: 'cp-when-switch', difficulty: 3,
      prompt: 'In the twin paradox both twins send yearly signals. Each receives the other’s signals slowly at first and quickly later. Which statement explains why the traveller ends up younger?',
      visual: signals({ D: 6, b: 0.6, caption: 'Earth’s frame (c = 1): Earth’s yearly signals (orange) and the traveller (gold), drawn for a trip to a star 6 light-years away at 0.6c.' }),
      choices: [
        'The traveller switches to fast reception at the turnaround, halfway through her trip; Earth switches only when light from the turnaround arrives, late in its time',
        'Both switch at the same moment, so the slow and fast periods cancel',
        'The traveller’s signals are weakened by distance, so Earth misses some of them',
        'Only the traveller sees a Doppler shift, because only she is moving',
      ],
      answer: 0,
      why: {
        1: 'They switch at different times: the traveller at her turnaround, Earth when the news of it reaches home — for a 6-light-year trip at 0.6c, 16 of Earth’s 20 years in.',
        2: 'Every pulse counts, however faint: Earth eventually receives all of them. The asymmetry is in when the reception rate changes.',
        3: 'Each twin sees the other’s signals Doppler-shifted, by the same factor while they separate and by the inverse while they approach. Motion is relative; the turnaround is not.',
      },
      hints: ['When does the traveller start approaching Earth? When does Earth learn that she has?', 'The turnaround is at Earth time 10 years, 6 light-years away. Its light reaches Earth at year 16 — after 16 slow years of Earth’s 20.'],
      teach: 'The asymmetry of the twin paradox is the turnaround: the traveller switches from slow to fast reception halfway through her trip, Earth only when the light of the turnaround arrives.',
      explain: 'For a trip to a star 6 light-years away at 0.6c, the traveller gets slow pulses for 8 of her years and fast ones for 8 — 4 + 16 = 20 Earth years. Earth gets the traveller’s pulses slowly for 16 of its years (8 pulses) and quickly for 4 (8 more): 16 traveller years. Both counts are facts every observer agrees on.',
    }),
  ],
  sources: [
    { label: 'Margon (1984), Observations of SS 433, Annual Review of Astronomy and Astrophysics 22, 507', url: 'https://doi.org/10.1146/annurev.aa.22.090184.002451' },
    { label: 'Ives & Stilwell (1938), An experimental study of the rate of a moving atomic clock, J. Opt. Soc. Am. 28, 215', url: 'https://doi.org/10.1364/JOSA.28.000215' },
    { label: 'Planck Collaboration (2020), Planck 2018 results I: overview (the CMB dipole)', url: 'https://arxiv.org/abs/1807.06205' },
    { label: 'OpenStax University Physics Vol. 3, §5.6–5.7 Velocity transformation and the Doppler effect for light', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-7-doppler-effect-for-light' },
  ],
});
