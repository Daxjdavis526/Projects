// Atomic spectra — hydrogen's lines as the physicists of 1900 met them: data
// in search of a theory. Balmer's formula (1885), Rydberg's generalization,
// the series, Ritz's combination principle, and why a classical orbiting
// electron cannot produce them. Vacuum wavelengths from the Rydberg constant
// for hydrogen (CODATA 2022 R∞, proton recoil included); the Bohr model that
// explains them is module MP5. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, RH, RINF, A0, RE, MEC2, MDC2, MP_ME } from './_constants.js';
import { seg, label, frame, spectrumStrip, r6 } from './_diagrams.js';

const t = String.raw;

/** Vacuum wavelength (nm) of hydrogen's line n2 → n1 (n2 = Infinity: the series limit). */
const lam = (n2, n1) => 1e9 / (RH * (1 / (n1 * n1) - (Number.isFinite(n2) ? 1 / (n2 * n2) : 0)));
const B_BALMER = (4 / RH) * 1e9;                 // nm: Balmer's constant, the series limit
const NAME = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett', 5: 'Pfund' };
const GREEK = ['α', 'β', 'γ', 'δ', 'ε'];
const lineName = (n2, n1) => `${NAME[n1]}-${GREEK[n2 - n1 - 1] ?? `${n2}→${n1}`}`;
const COLLAPSE = A0 ** 3 / (4 * RE * RE * C);    // s
const PERIOD_A0 = (2 * Math.PI * A0) / (C / 137.035999177);   // s, one orbit at a₀ (speed αc)
const ME_MD = MEC2 / MDC2, ME_MP = 1 / MP_ME;
const D_SHIFT = lam(3, 2) * (ME_MP - ME_MD) / (1 + ME_MP);    // nm
const nmT = (x, n = 5) => fmt(x, n);

/**
 * Hydrogen's series on one logarithmic wavelength axis: a row of lines for
 * each series, crowding toward its limit (dashed). `omit` leaves out one line
 * (a problem asks for it); `ask` marks the row it belongs to.
 */
function seriesMap({ series = [1, 2, 3, 4], omit = null, limits = true, caption, highlight = null } = {}) {
  const curves = [], points = [], shade = [];
  const X = (nm) => r6(Math.log10(nm));
  shade.push({ fn: '5.2', lower: '0.4', from: X(380), to: X(750), color: 'gold', alpha: 0.1 });
  points.push(label(X(530), 5.2, 'visible', 'gold', 0, 10, 'center'));
  for (const n1 of series) {
    const y = 5 - n1;
    for (let n2 = n1 + 1; n2 <= n1 + 7; n2++) {
      if (omit && omit[0] === n2 && omit[1] === n1) continue;
      const hl = highlight && highlight[0] === n2 && highlight[1] === n1;
      curves.push(seg(X(lam(n2, n1)), y - 0.28, X(lam(n2, n1)), y + 0.28, hl ? 'gold' : 'accent', hl ? 3 : 2));
    }
    if (limits) curves.push(seg(X(lam(Infinity, n1)), y - 0.36, X(lam(Infinity, n1)), y + 0.36, 'ink3', 1.4, true));
    points.push(label(X(lam(n1 + 1, n1)), y, `${NAME[n1]} (n₁ = ${n1})`, 'ink2', 8, -16, 'left'));
    if (omit && omit[1] === n1) points.push(label(X(lam(omit[0], n1)), y + 0.3, '?', 'gold', 0, -10, 'center'));
  }
  return {
    type: 'graph',
    params: { x: [1.85, 4.05], y: [0.2, 5.6], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'wavelength (nm)', ylabel: '', yticks: 0, grid: false, curves, points, shade },
    caption: caption ?? 'Hydrogen’s spectral series on one logarithmic axis: each row is the lines ending on one value of n₁, crowding toward the series limit (dashed). Vacuum wavelengths; the visible band is shaded.',
  };
}

/** Ritz's terms R/n² as a ladder (in units of R), with jumps drawn as arrows. */
function terms(arrows, caption) {
  const curves = [], points = [];
  const y = (n) => r6(-1 / (n * n));
  for (let n = 1; n <= 6; n++) {
    curves.push(seg(0, y(n), 6, y(n), 'ink2', n <= 4 ? 2 : 1.4));
    if (n <= 4) points.push(label(6, y(n), `n = ${n}: term R/${n * n}`, 'ink2', 8, 0));
  }
  curves.push(seg(0, 0, 6, 0, 'ink3', 1.2, true));
  points.push(label(6, 0, 'n → ∞: 0', 'ink3', 8, 0));
  return {
    type: 'graph',
    params: frame([-0.6, 9.6], [-1.12, 0.12], { equal: false, aspect: 'wide', curves, points, arrows: arrows.map(([a, b, x, col, text]) => ({ from: [x, y(a)], to: [x, y(b)], color: col, label: text, labelDx: 6, labelDy: 14 })) }),
    caption: caption ?? 'Ritz’s terms R/n², to scale: every hydrogen line has a wavenumber 1/λ equal to the gap between two of them.',
  };
}

export default lesson({
  id: 'phys2710.MP1.3',
  title: 'Atomic spectra',
  minutes: 13, difficulty: 2,
  intro: t`Pass a spark through hydrogen and it glows at only a handful of sharp wavelengths; put cool hydrogen in front of a hot source and it absorbs exactly those. In 1885 Johann Balmer, a Swiss schoolteacher, found that hydrogen’s four visible lines obey a simple formula, and Johannes Rydberg generalized it to every series:

$$\frac{1}{\lambda} = R_H\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)$$

with whole numbers $n_2 > n_1$ and one constant fitted to the data. Classical physics could not explain any of it. An electron circling a nucleus is an accelerating charge: it should radiate, **spiral into the nucleus in about $10^{-11}$ s**, and emit a smear of frequencies on the way — not a set of sharp lines arranged by whole numbers.

> You met hydrogen’s levels and Bohr’s model in [Atomic spectra and the Bohr model](#/lesson/phys2220.A1.1). Here the lines come first, as the physicists of 1900 met them: precise data in search of a theory. The theory is module MP5.`,
  symbols: [
    { tex: '\\lambda', text: 'the wavelength of a spectral line in vacuum, in m (laboratory tables often quote wavelengths in air, about 0.03% shorter)' },
    { tex: 'R_H', text: t`the Rydberg constant for hydrogen, $${tex(RH, 7)}\ \text{m}^{-1}$ — a number fitted to the lines, later explained (it is $R_\infty = ${tex(RINF, 7)}\ \text{m}^{-1}$ corrected for the proton’s recoil)` },
    { tex: 'n_1', text: 'a whole number that labels the series: 1 Lyman (ultraviolet), 2 Balmer (visible), 3 Paschen (infrared), 4 Brackett, 5 Pfund' },
    { tex: 'n_2', text: 'a whole number labelling the line within the series: $n_1 + 1$, $n_1 + 2$, … As $n_2 \\to \\infty$ the lines crowd toward the series limit, $\\lambda = n_1^2/R_H$' },
  ],
  why: 'Spectral lines are the fingerprints of atoms — they tell astronomers what stars are made of and how fast they move — and the whole numbers in them were the clue that forced quantum mechanics into being.',
  visual: {
    type: 'qm-hydrogen',
    title: 'Whole numbers make the lines',
    lead: t`Right: the lines of one series, in emission or absorption, in approximate true colour. Left: Rydberg’s formula as a ladder — each rung is a term $R_H/n^2$, drawn as an energy, and each line is a jump between two rungs. *Why* the terms are energies is the Bohr model’s story; for now, read the ladder as bookkeeping for the formula.`,
    tasks: [
      'Balmer series (n₁ = 2): step the upper level from 3 to 7 — the lines crowd toward 364.7 nm, the series limit.',
      'Switch to Lyman (n₁ = 1): every line is ultraviolet, between 121.6 nm and the limit at 91.2 nm.',
      'Switch to absorption: the dark lines fall at exactly the same wavelengths as the bright ones.',
    ],
    params: { mode: 'emission', series: 2, n: 3, picture: 'none', controls: ['mode', 'series', 'n'] },
    caption: 'Hydrogen’s levels (left, to scale above the break) and the spectrum of one series (right). Vacuum wavelengths; fine structure, a few parts in 10⁵, is ignored. Screen colours are approximate.',
  },
  example: {
    prompt: t`Balmer noticed that hydrogen’s visible lines fit $\lambda = B\,\dfrac{n^2}{n^2 - 4}$ for $n = 3, 4, 5, 6$. The red line Hα ($n = 3$) has a vacuum wavelength of $${nmT(lam(3, 2), 6)}$ nm. Find $B$, predict the violet line Hδ ($n = 6$), and show that Balmer’s formula is Rydberg’s with $n_1 = 2$.`,
    visual: spectrumStrip({ from: 350, to: 690, marks: [{ nm: lam(3, 2), label: 'Hα 656.5' }, { nm: lam(4, 2), label: 'Hβ 486.3' }, { nm: lam(5, 2), label: 'Hγ', dx: 0 }, { nm: lam(6, 2), label: 'Hδ', dy: -24 }, { nm: B_BALMER, label: 'limit', color: 'ink3', dash: true }], caption: 'Hydrogen’s Balmer lines (vacuum wavelengths) and the series limit, on the visible spectrum. Screen colours are approximate.' }),
    steps: [
      { label: 'Fit B to one line', text: t`With $n = 3$: $B = \lambda_3\,\dfrac{n^2 - 4}{n^2} = ${nmT(lam(3, 2), 6)}\ \text{nm}\times\dfrac{5}{9} = ${nmT(B_BALMER, 6)}$ nm.` },
      { label: 'Predict another', text: t`With $n = 6$: $\lambda_6 = ${nmT(B_BALMER, 6)}\times\dfrac{36}{32} = ${nmT(lam(6, 2), 6)}$ nm — violet, and exactly where Hδ is measured. Balmer’s fitted formula reproduced the four lines then known to better than one part in a thousand.` },
      { label: 'Turn it upside down', text: t`$\dfrac{1}{\lambda} = \dfrac{1}{B}\,\dfrac{n^2 - 4}{n^2} = \dfrac{4}{B}\left(\dfrac{1}{2^2} - \dfrac{1}{n^2}\right)$: Rydberg’s form with $n_1 = 2$ and $R_H = 4/B = 4/(${nmT(B_BALMER, 6)}\times10^{-9}\ \text{m}) = ${tex(RH, 5)}\ \text{m}^{-1}$.` },
      { label: 'The limit', text: t`As $n \to \infty$, $\lambda \to B = ${nmT(B_BALMER, 4)}$ nm: the lines crowd together toward the near ultraviolet and stop there — the Balmer limit.` },
      { label: 'Sense check', text: t`Rydberg’s form invites other values of $n_1$. Lyman found the $n_1 = 1$ series in the ultraviolet (1906–1914) and Paschen the $n_1 = 3$ series in the infrared (1908), at the predicted wavelengths. A formula that predicts lines nobody has yet seen is more than curve fitting.` },
    ],
    answer: t`$B = ${nmT(B_BALMER, 5)}$ nm, Hδ at $${nmT(lam(6, 2), 5)}$ nm, and $R_H = 4/B = ${tex(RH, 4)}\ \text{m}^{-1}$.`,
  },
  practice: [
    num({
      id: 'balmer-predict', difficulty: 1,
      gen(r) {
        const n = r.pick([4, 5, 7, 8]);
        const ans = (B_BALMER * n * n) / (n * n - 4);
        const known = [3, 4, 5, 6, 7, 8].filter((k) => k !== n && k <= 6);
        return {
          prompt: t`Balmer’s formula is $\lambda = B\,\dfrac{n^2}{n^2 - 4}$ with $B = ${nmT(B_BALMER, 5)}$ nm (vacuum). What is the wavelength of hydrogen’s Balmer line with $n = ${n}$?`,
          answer: ans, units: 'nm', tol: { rel: 0.001 },
          errors: [{ value: (B_BALMER * (n * n - 4)) / (n * n), feedback: t`Upside down: $\lambda = B\,n^2/(n^2 - 4)$, which is always longer than $B$.` }],
          hints: [t`$\lambda = ${nmT(B_BALMER, 5)}\times\dfrac{${n * n}}{${n * n - 4}}$ nm.`],
          teach: 'Balmer’s formula: each visible hydrogen line is B times n²/(n² − 4), crowding toward B as n grows.',
          explain: t`$\lambda = ${nmT(B_BALMER, 5)}\times\dfrac{${n * n}}{${n * n - 4}} = ${nmT(ans, 5)}$ nm${n >= 7 ? ' — in the near ultraviolet, just past the violet end of vision, close to the series limit' : n === 4 ? ' — blue-green Hβ' : ' — violet Hγ'}.`,
          visual: spectrumStrip({ from: 350, to: 690, marks: [...known.map((k) => ({ nm: lam(k, 2), label: `n = ${k}`, dy: k === 6 ? -24 : -12 })), { nm: B_BALMER, label: 'limit', color: 'ink3', dash: true, dy: -24 }], caption: t`The Balmer lines already known, and the series limit. Where does $n = ${n}$ fall?` }),
        };
      },
    }),
    num({
      id: 'rydberg-line', difficulty: 2,
      gen(r) {
        const [n2, n1] = r.pick([[2, 1], [3, 1], [4, 3], [5, 3], [5, 4]]);
        const ans = lam(n2, n1);
        return {
          prompt: t`Use Rydberg’s formula with $R_H = ${tex(RH, 5)}\ \text{m}^{-1}$ to find the vacuum wavelength of hydrogen’s line with $n_1 = ${n1}$ and $n_2 = ${n2}$ (the ${lineName(n2, n1)} line). Answer in nm.`,
          answer: ans, units: 'nm', tol: { rel: 0.002 },
          errors: [
            { value: 1e9 / (RH * (1 / n1 - 1 / n2)), feedback: t`Square the whole numbers: $1/n_1^2 - 1/n_2^2$.` },
            { value: 1e9 * RH * (1 / (n1 * n1) - 1 / (n2 * n2)) * 1e-18, feedback: t`The formula gives $1/\lambda$: take the reciprocal at the end.` },
          ],
          hints: [t`$\dfrac{1}{\lambda} = R_H\left(\dfrac{1}{${n1 * n1}} - \dfrac{1}{${n2 * n2}}\right)$.`, t`$\dfrac{1}{\lambda} = ${tex(RH * (1 / (n1 * n1) - 1 / (n2 * n2)), 5)}\ \text{m}^{-1}$; invert and convert to nm.`],
          teach: t`Rydberg’s formula gives every hydrogen line from two whole numbers: $1/\lambda = R_H(1/n_1^2 - 1/n_2^2)$.`,
          explain: t`$\dfrac{1}{\lambda} = ${tex(RH, 5)}\times\left(\dfrac{1}{${n1 * n1}} - \dfrac{1}{${n2 * n2}}\right) = ${tex(RH * (1 / (n1 * n1) - 1 / (n2 * n2)), 5)}\ \text{m}^{-1}$, so $\lambda = ${nmT(ans, 5)}$ nm — ${ans < 380 ? 'ultraviolet' : ans > 750 ? 'infrared' : 'visible'}.`,
          visual: seriesMap({ series: [1, 2, 3, 4], omit: [n2, n1] }),
        };
      },
    }),
    num({
      id: 'series-limit', difficulty: 2,
      gen(r) {
        const n1 = r.pick([1, 2, 3, 4]);
        const ans = lam(Infinity, n1);
        return {
          prompt: t`As $n_2 \to \infty$ the lines of a hydrogen series crowd toward a shortest wavelength, the series limit. What is it for the ${NAME[n1]} series ($n_1 = ${n1}$)? ($R_H = ${tex(RH, 5)}\ \text{m}^{-1}$.)`,
          answer: ans, units: 'nm', tol: { rel: 0.002 },
          errors: [{ value: lam(n1 + 1, n1), feedback: t`That is the *first* line of the series ($n_2 = ${n1 + 1}$), its longest wavelength. The limit is the other end: $n_2 \to \infty$.` }],
          hints: [t`With $n_2 \to \infty$, $1/n_2^2 \to 0$, so $1/\lambda = R_H/n_1^2$.`, t`$\lambda = n_1^2/R_H = ${n1 * n1}/(${tex(RH, 5)}\ \text{m}^{-1})$.`],
          teach: t`A series limit is $\lambda = n_1^2/R_H$: the wavelength the lines approach as the upper number grows without bound.`,
          explain: t`$\lambda = \dfrac{${n1 * n1}}{${tex(RH, 5)}\ \text{m}^{-1}} = ${nmT(ans, 5)}$ nm. Beyond the limit hydrogen absorbs a continuous band instead of lines${n1 === 1 ? ' — which is why interstellar hydrogen blocks almost all starlight shortward of 91.2 nm' : ''}.`,
          visual: seriesMap({ series: [n1], limits: false, caption: t`The ${NAME[n1]} series on a logarithmic axis: where do the lines pile up?` }),
        };
      },
    }),
    num({
      id: 'ritz', difficulty: 2,
      gen(r) {
        const [what, a, b, sign, ansN, desc] = r.pick([
          ['Lyman-α (2 → 1) and Hα (3 → 2)', [2, 1], [3, 2], 1, [3, 1], 'Lyman-β (3 → 1)'],
          ['Lyman-α (2 → 1) and Hβ (4 → 2)', [2, 1], [4, 2], 1, [4, 1], 'Lyman-γ (4 → 1)'],
          ['Hβ (4 → 2) and Hα (3 → 2)', [4, 2], [3, 2], -1, [4, 3], 'Paschen-α (4 → 3)'],
        ]);
        const la = lam(...a), lb = lam(...b), ans = 1 / (1 / la + sign / lb);
        return {
          prompt: t`In 1908 Walther Ritz noticed that the wavenumbers $1/\lambda$ of hydrogen’s lines add and subtract: ${sign > 0 ? 'the sum' : 'the difference'} of the wavenumbers of two lines is the wavenumber of a third. From ${what}, at $${nmT(la, 6)}$ nm and $${nmT(lb, 6)}$ nm, predict the wavelength of ${desc}.`,
          answer: ans, units: 'nm', tol: { rel: 0.001 },
          errors: [{ value: la + sign * lb, feedback: t`Wavelengths do not add; wavenumbers do. Combine $1/\lambda$ values, then invert.` }, { value: 1 / (1 / la - sign / lb), feedback: t`Check the sign: ${sign > 0 ? 'the third line is the sum of the two jumps' : 'the third line is the difference'}, so ${sign > 0 ? 'add' : 'subtract'} the wavenumbers.` }],
          hints: [t`$\dfrac{1}{\lambda} = \dfrac{1}{${nmT(la, 6)}\ \text{nm}} ${sign > 0 ? '+' : '-'} \dfrac{1}{${nmT(lb, 6)}\ \text{nm}}$.`],
          teach: 'Ritz’s combination principle: hydrogen’s line wavenumbers are differences of terms, so they add and subtract like steps on a ladder.',
          explain: t`$\dfrac{1}{\lambda} = ${fmt(1 / la, 5)} ${sign > 0 ? '+' : '-'} ${fmt(1 / lb, 5)} = ${fmt(1 / ans, 5)}\ \text{nm}^{-1}$, so $\lambda = ${nmT(ans, 5)}$ nm — exactly ${desc}. Every line is the gap between two terms $R_H/n^2$, so two gaps that share a rung combine into a third.`,
          // a sum is a two-step path (tip to tail at one x); a difference sets the two jumps side by side
          visual: terms([[a[0], a[1], 1.4, 'accent', `${a[0]} → ${a[1]}`], [b[0], b[1], sign > 0 ? 1.4 : 3.2, 'violet', `${b[0]} → ${b[1]}`], [ansN[0], ansN[1], 4.6, 'gold', '?']]),
        };
      },
    }),
    num({
      id: 'collapse', difficulty: 3,
      prompt: t`Larmor’s formula for the power radiated by an accelerating charge, applied to an electron circling a proton, predicts that a classical hydrogen atom shrinks from radius $a_0$ to nothing in a time $t = \dfrac{a_0^3}{4r_e^2c}$, where $a_0 = 5.292\times10^{-11}$ m is the atom’s radius and $r_e = 2.818\times10^{-15}$ m is the “classical electron radius”. How long would a classical hydrogen atom last? Answer in picoseconds.`,
      answer: COLLAPSE * 1e12, units: 'ps', tol: { rel: 0.01 },
      errors: [{ value: (A0 ** 3 / (4 * RE * C)) * 1e12, feedback: t`Square $r_e$: the time is $a_0^3/(4r_e^2c)$.` }],
      hints: [t`$a_0^3 = (5.292\times10^{-11})^3 = ${tex(A0 ** 3, 4)}\ \text{m}^3$.`, t`$4r_e^2c = 4\times(2.818\times10^{-15})^2\times2.998\times10^{8} = ${tex(4 * RE * RE * C, 4)}\ \text{m}^3/\text{s}$.`],
      teach: 'Classical electromagnetism predicts that an orbiting electron radiates its energy away and spirals into the nucleus in about 10⁻¹¹ s.',
      explain: t`$t = ${tex(A0 ** 3, 4)}/${tex(4 * RE * RE * C, 4)} = ${tex(COLLAPSE, 3)}$ s, or $${fmt(COLLAPSE * 1e12, 3)}$ ps — after only about $${tex(COLLAPSE / PERIOD_A0, 1)}$ orbits. Real hydrogen atoms have lasted 13.8 billion years. Something in classical physics had to give way.`,
      visual: {
        type: 'graph',
        params: frame([-1.25, 1.25], [-1.15, 1.15], {
          aspect: 'wide',
          curves: [{ polar: '1 - theta/(2*pi*5.4)', theta: [0, 2 * Math.PI * 5.2], color: 'accent', width: 1.8 }],
          points: [{ x: 0, y: 0, r: 7, color: 'bad', label: 'proton', labelDx: 10, labelDy: 14 }, { x: 1, y: 0, r: 5, color: 'accent', label: 'electron', labelDx: 10, labelDy: -10 }],
          arrows: [[30, 1.02], [120, 0.92], [210, 0.84], [300, 0.75]].map(([d, rr]) => { const a = (d * Math.PI) / 180; return { from: [r6(rr * Math.cos(a)), r6(rr * Math.sin(a))], to: [r6((rr + 0.22) * Math.cos(a)), r6((rr + 0.22) * Math.sin(a))], color: 'gold', width: 1.6 }; }),
        }),
        caption: 'The classical prediction, schematic: the electron radiates (gold) as it circles, loses energy and spirals in. The real spiral would make about 100 000 turns; this one makes five.',
      },
    }),
    mcq({
      id: 'not-harmonics', difficulty: 2,
      prompt: t`A charge moving periodically radiates at its orbital frequency $f_0$ and at whole multiples $2f_0, 3f_0, \ldots$ — an evenly spaced comb. Hydrogen’s visible lines sit at 456.7, 616.5, 690.5 and 730.7 THz. What about them rules out that classical picture?`,
      visual: {
        type: 'graph',
        params: {
          x: [380, 860], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'frequency (THz)', ylabel: '', yticks: 0, grid: false,
          curves: [
            ...[456.67, 616.51, 690.49, 730.68, 754.91, 770.64, 780.89].map((f) => seg(f, 1.9, f, 2.6, 'accent', 2.2)),
            seg(822.0, 1.8, 822.0, 2.7, 'ink3', 1.4, true),
            ...[420, 480, 540, 600, 660, 720, 780, 840].map((f) => seg(f, 0.4, f, 1.1, 'violet', 2)),
          ],
          points: [label(390, 2.25, 'hydrogen (Balmer)', 'accent', 0, -26, 'left'), label(822, 2.7, 'limit', 'ink3', 0, -10, 'center'), label(390, 0.75, 'a classical comb: f₀, 2f₀, 3f₀ …', 'violet', 0, -26, 'left')],
        },
        caption: 'Top: hydrogen’s Balmer lines by frequency, crowding toward a limit. Bottom: the evenly spaced comb a periodic classical orbit would radiate (its spacing chosen for illustration).',
      },
      choices: [
        'They are not whole multiples of one frequency: they crowd together toward a limit instead of spreading out evenly',
        'Their frequencies are too high for an electron to produce',
        'They are bright lines, while a classical atom would only absorb',
        'Their wavelengths are thousands of times larger than the atom',
      ],
      answer: 0,
      why: {
        1: 'An electron orbiting at atomic size would radiate around 10¹⁵ Hz — the right order of magnitude. The trouble is the pattern, not the scale.',
        2: 'A classical accelerating charge emits; that is exactly why it was expected to spiral in.',
        3: 'That is true of any atom radiating visible light, quantum or classical, and is no contradiction: a radio antenna is far smaller than the waves it sends.',
      },
      hints: ['Look at the spacing between neighbouring lines as the frequency rises.', 'Harmonics are equally spaced; Balmer lines get closer and closer.'],
      teach: 'Hydrogen’s lines are differences of terms that converge to a limit, not harmonics of an orbital frequency — a pattern classical radiation cannot make.',
      explain: 'The gaps shrink — 160, 74, 40 THz… — and the lines pile up at 822 THz, the Balmer limit. A classical orbit would radiate an evenly spaced comb of harmonics, and a decaying orbit would smear that comb into a continuum. Rydberg’s whole numbers and Ritz’s differences of terms were a new kind of pattern.',
    }),
    num({
      id: 'deuterium', difficulty: 3,
      prompt: t`The Rydberg constant depends slightly on the mass $M$ of the nucleus: $R_M = \dfrac{R_\infty}{1 + m_e/M}$ (a correction you will derive with the Bohr model). Ordinary hydrogen has $m_e/m_p = 1/1836.15$; deuterium, whose nucleus is a proton and a neutron, has $m_e/m_d = 1/3670.48$. Hydrogen’s Hα line is at 656.470 nm. How much shorter is deuterium’s Hα? Answer in nm.`,
      answer: D_SHIFT, units: 'nm', tol: { rel: 0.01 },
      errors: [{ value: lam(3, 2) * ME_MD, feedback: t`The shift comes from the *difference* of the two corrections, $m_e/m_p - m_e/m_d$: hydrogen’s line already carries its own.` }],
      hints: [t`Wavelength scales as $1/R_M$, so $\dfrac{\lambda_D}{\lambda_H} = \dfrac{1 + m_e/m_d}{1 + m_e/m_p}$.`, t`$\lambda_H - \lambda_D = \lambda_H\left(1 - \dfrac{1 + 1/3670.48}{1 + 1/1836.15}\right)$.`],
      teach: 'A heavier nucleus raises the Rydberg constant slightly, so isotopes of one element show lines shifted by tiny but measurable amounts.',
      explain: t`$\lambda_H - \lambda_D = 656.470\times\left(1 - \dfrac{1.000\,272\,4}{1.000\,544\,6}\right) = ${fmt(D_SHIFT, 3)}$ nm. In 1931 Harold Urey and colleagues evaporated liquid hydrogen to concentrate the heavy isotope, and found faint companion lines just this far to the blue of Hα and Hβ: the discovery of deuterium.`,
      visual: spectrumStrip({ from: 655.6, to: 656.8, xlabel: 'wavelength (nm), vacuum', marks: [{ nm: lam(3, 2), label: 'hydrogen Hα' }], caption: 'A close-up of the red end of the spectrum, around Hα. Deuterium’s line lies a little to the blue (left). Screen colours approximate.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-identify', difficulty: 2,
      gen(r) {
        const n = r.pick([4, 5, 6, 7]);
        const l = lam(n, 2);
        return {
          prompt: t`A hydrogen lamp shows a line at $${nmT(l, 6)}$ nm (vacuum). It belongs to the Balmer series ($n_1 = 2$). What is its upper whole number $n_2$? ($R_H = ${tex(RH, 6)}\ \text{m}^{-1}$.)`,
          answer: n, tol: { rel: 0, abs: 0.3 },
          hints: [t`Solve $\dfrac{1}{\lambda} = R_H\left(\dfrac14 - \dfrac{1}{n_2^2}\right)$ for $n_2$: $\dfrac{1}{n_2^2} = \dfrac14 - \dfrac{1}{R_H\lambda}$.`],
          teach: 'Rydberg’s formula runs backwards too: a measured wavelength identifies the pair of whole numbers behind a line.',
          explain: t`$R_H\lambda = ${fmt(RH * l * 1e-9, 5)}$, so $\dfrac{1}{n_2^2} = 0.25 - ${fmt(1 / (RH * l * 1e-9), 5)} = ${fmt(1 / (n * n), 4)}$ and $n_2 = ${n}$ — the ${lineName(n, 2)} line.`,
          visual: spectrumStrip({ from: 350, to: 690, marks: [{ nm: l, label: 'this line' }, { nm: B_BALMER, label: 'limit', color: 'ink3', dash: true, dy: -24 }], caption: 'The measured line on the visible spectrum, with the Balmer series limit.' }),
        };
      },
    }),
    num({
      id: 'cp-quasar', difficulty: 3, transfer: true,
      gen(r) {
        const z = r.pick([2.5, 3.0, 4.5, 6.3]);
        const obs = lam(2, 1) * (1 + z);
        return {
          prompt: t`Quasars are so distant that the expansion of the universe has stretched their light: every wavelength arrives multiplied by $1 + z$. Hydrogen’s Lyman-α line (2 → 1) is emitted at $${nmT(lam(2, 1), 6)}$ nm, in the far ultraviolet. At what wavelength does it arrive from a quasar at $z = ${z}$?`,
          answer: obs, units: 'nm', tol: { rel: 0.002 },
          errors: [{ value: lam(2, 1) * z, feedback: t`Multiply by $1 + z$, not by $z$: at $z = 0$ nothing is stretched.` }],
          hints: [t`$\lambda_{\text{obs}} = (1 + z)\,\lambda_{\text{emit}}$.`, t`$\lambda_{\text{obs}} = ${1 + z}\times${nmT(lam(2, 1), 6)}$ nm.`],
          teach: 'Cosmological redshift multiplies every emitted wavelength by 1 + z, carrying ultraviolet lines into the visible.',
          explain: t`$\lambda_{\text{obs}} = ${1 + z}\times${nmT(lam(2, 1), 6)} = ${nmT(obs, 5)}$ nm${z === 3 ? ' — exactly where Hβ sits in the laboratory, since Rydberg’s formula makes 4 × λ(2 → 1) equal to λ(4 → 2). Astronomers therefore identify a redshifted line by the pattern of its neighbours, whose wavelength ratios the formula fixes, never by one line alone' : obs > 750 ? ' — in the near infrared. Hydrogen clouds between us and such a quasar absorb its light at every wavelength shorter than this, so its spectrum goes dark below it' : ' — now visible light. The pattern of the other lines, whose ratios Rydberg’s formula fixes, confirms the identification'}.`,
          visual: seriesMap({ series: [1], limits: true, highlight: [2, 1], caption: 'The Lyman series where it is emitted, in the far ultraviolet (Lyman-α highlighted). Redshift stretches the whole pattern by the factor 1 + z, keeping its ratios.' }),
        };
      },
    }),
    mcq({
      id: 'cp-more-than-fit', difficulty: 2,
      prompt: t`Rydberg’s formula writes every hydrogen line as the difference of two terms $R_H/n^2$. What did it predict that Balmer’s formula for the visible lines did not?`,
      visual: seriesMap({ caption: 'Hydrogen’s series on a logarithmic wavelength axis, with the visible band shaded.' }),
      choices: [
        'Whole further series, ending on n₁ = 1, 3, 4, …, in the ultraviolet and infrared — later found at the predicted wavelengths',
        'How bright each line is',
        'That cool hydrogen absorbs the same wavelengths it emits',
        'The spectra of helium and every other element',
      ],
      answer: 0,
      why: {
        1: 'The formula gives only where lines fall, not how bright they are; brightness needed quantum mechanics.',
        2: 'Kirchhoff and Bunsen had established emission–absorption matching around 1860, before either formula.',
        3: 'Other elements have different, more complicated terms; only one-electron systems follow Rydberg’s simple form exactly.',
      },
      hints: ['Balmer’s formula has n₁ fixed at 2. What happens if you let n₁ be another whole number?'],
      teach: 'Rydberg’s generalization predicted unseen series — Lyman in the ultraviolet, Paschen and Brackett in the infrared — that were later found where it said.',
      explain: 'Letting the lower number be 1, 3, 4 or 5 predicts series nobody had seen; Lyman (1906), Paschen (1908), Brackett (1922) and Pfund (1924) found them. That predictive power, together with Ritz’s combination rule, told physicists that the terms R/n² meant something physical — the clue Bohr followed in 1913.',
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §6.4 Bohr’s model of the hydrogen atom (line spectra)', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-4-bohrs-model-of-the-hydrogen-atom' },
    { label: 'NIST Atomic Spectra Database: hydrogen lines', url: 'https://www.nist.gov/pml/atomic-spectra-database' },
    { label: 'CODATA 2022 recommended values (NIST): the Rydberg constant', url: 'https://physics.nist.gov/cuu/Constants/' },
    { label: 'Urey, Brickwedde & Murphy (1932), A hydrogen isotope of mass 2, Phys. Rev. 39, 164', url: 'https://doi.org/10.1103/PhysRev.39.164' },
  ],
});
