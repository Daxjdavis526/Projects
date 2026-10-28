// Probability distributions and averages: normalisation, ⟨f⟩ = Σ f P, the
// variance, densities for continuous variables, and the binomial's 1/√N —
// the on-ramp for counting microstates.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { KB, AMU, MOLAR, bars, binomBars, r4 } from './_count.js';

const t = String.raw;

// the worked example: one atom's vibration found in level n with these probabilities
const EX = { n: [0, 1, 2, 3], P: [0.5, 0.25, 0.125, 0.125], eps: 30 };   // ε in meV
EX.mean = EX.n.reduce((s, n, i) => s + n * EX.P[i], 0);
EX.m2 = EX.n.reduce((s, n, i) => s + n * n * EX.P[i], 0);
EX.var = EX.m2 - EX.mean ** 2;
EX.sd = Math.sqrt(EX.var);

// a discrete distribution as bars, with optional mean line and a gold "?" bar
function distBars(xs, ps, { ask = null, mean = false, unit = '', xlabel = 'outcome x', caption, alt } = {}) {
  const data = xs.map((x, i) => (i === ask ? { x, y: 0 } : { x, y: ps[i], label: String(nice(ps[i])) }));
  const span = Math.max(...xs) - Math.min(...xs) || 1, w = Math.min(0.8, (0.6 * span) / Math.max(1, xs.length - 1));
  const top = Math.max(...ps.filter((p, i) => i !== ask), 0.3);
  const m = xs.reduce((s, x, i) => s + x * ps[i], 0);
  return bars(data, {
    x: [r4(Math.min(...xs) - 0.12 * span - w), r4(Math.max(...xs) + 0.12 * span + w)], y: [0, r4(top * 1.3)], width: w,
    xlabel: unit ? `${xlabel} (${unit})` : xlabel, ylabel: 'P',
    points: ask !== null ? [{ x: r4(xs[ask]), y: r4(top * 0.25), r: 0.01, color: 'gold', label: 'P = ?', labelDx: -16, labelDy: 0 }] : [],
    vlines: mean ? [{ x: r4(m), label: 'mean', color: 'gold' }] : [],
    caption, alt: alt || 'A discrete probability distribution as bars',
  });
}

// the Maxwell speed density for nitrogen at 300 K (for the checkpoint)
const mN2 = MOLAR.N2 * AMU, vp = Math.sqrt((2 * KB * 300) / mN2);
const peakDensity = (4 / Math.sqrt(Math.PI)) * Math.exp(-1) / vp;      // per (m/s), at v = v_p
const maxwellExpr = `4/sqrt(pi)*x^2/${r4(vp)}^3*e^(-(x/${r4(vp)})^2)`;

export default lesson({
  id: 'phys3700.T0.1',
  title: 'Probability distributions and averages',
  minutes: 11, difficulty: 2,
  intro: t`Thermal physics never follows one molecule. It asks how likely each possibility is, and what the **average** comes out to. A probability distribution $P(x)$ gives every outcome $x$ a probability, with $\sum_x P(x) = 1$, and any quantity $f$ that depends on the outcome has the average

$$\langle f\rangle = \sum_x f(x)\,P(x).$$

The spread about the mean is the standard deviation $\sigma_x = \sqrt{\langle x^2\rangle - \langle x\rangle^2}$. For a continuous variable, $P$ becomes a density $p(x)$ and the sum becomes an integral. Every pressure, energy and temperature in this course is an average of this kind — and thermodynamics works because, for $10^{23}$ particles, **the spread is a vanishingly small fraction of the mean**.`,
  symbols: [
    { tex: 'P(x)', text: 'the probability of outcome $x$: a pure number from 0 to 1, and all of them add to 1' },
    { tex: 'f(x)', text: 'any quantity fixed by the outcome — an energy, a speed, $x$ itself or $x^2$' },
    { tex: '\\langle f\\rangle', text: 'the average (expectation value) of $f$: each value weighted by how often it occurs; same units as $f$' },
    { tex: '\\sigma_x', text: 'the standard deviation of $x$, its typical distance from the mean, in the units of $x$; $\\sigma_x^2$ is the variance' },
    { tex: 'p(x)', text: 'for a continuous $x$, a probability density: probability per unit $x$ (units of $1/x$), so $P(a < x < b) = \\int_a^b p(x)\\,dx$' },
  ],
  why: 'Thermodynamic quantities are averages over microscopic possibilities, and their fluctuations shrink like 1/√N — the reason a litre of gas has one pressure, not a jittering one.',
  visual: {
    type: 'graph',
    title: 'The binomial distribution: the fraction narrows as N grows',
    lead: t`$N$ independent trials, each a success with chance $p$ — coin tosses, or spins pointing up. The bars show the probability of each *fraction* of successes, drawn as a density so the area under them is 1. The gold curve is a Gaussian with the same mean and spread.`,
    tasks: [
      'Take N from 10 to 40: the bars grow tall and narrow — four times the trials, half the spread of the fraction.',
      'Set p = 0.1 with N small: the distribution is lopsided. Raise N and it turns into the Gaussian.',
      'The readout Σ P stays at 1 whatever you do: the distribution is normalised.',
    ],
    params: {
      x: [-0.03, 1.03], y: [0, 10.5], aspect: 'wide', xlabel: 'fraction of successes, k/N', ylabel: 'probability per unit fraction', axesAt: 'edge',
      sliders: [
        { key: 'N', label: 'Trials $N$', min: 1, max: 150, step: 1, value: 10, explain: 'How many independent trials (tosses, spins, molecules).' },
        { key: 'p', label: 'Chance of success $p$', min: 0.05, max: 0.95, step: 0.05, value: 0.5, explain: 'The probability that any one trial succeeds; ½ for a fair coin.' },
      ],
      riemann: { fn: 'N*gamma(N+1)/(gamma(floor(x*N+0.5)+1)*gamma(N-floor(x*N+0.5)+1))*p^floor(x*N+0.5)*(1-p)^(N-floor(x*N+0.5))', from: '-0.5/N', to: '1+0.5/N', n: 'N+1', rule: 'mid' },
      curves: [{ fn: '1/sqrt(2*pi*p*(1-p)/N)*e^(-(x-p)^2/(2*p*(1-p)/N))', color: 'gold', width: 2, when: 'step(N - 4.5)' }],
      vlines: [{ x: 'p', label: 'mean Np', color: 'ink2' }],
      readouts: [
        { label: 'mean $Np$', expr: 'N*p', digits: 4 },
        { label: '$\\sigma = \\sqrt{Np(1-p)}$', expr: 'sqrt(N*p*(1-p))', digits: 3 },
        { label: '$\\sigma/\\text{mean}$', expr: 'sqrt((1-p)/(N*p))', digits: 3 },
        { label: '$\\Sigma P$', expr: 'riemann', digits: 4 },
      ],
    },
    caption: 'Exact binomial probabilities, drawn as bars 1/N wide and N times as tall, so their area is the probability. The Gaussian appears once N passes 4; it matches better as N grows (fastest near p = ½).',
  },
  example: {
    prompt: t`One atom’s vibration is found, over many looks, in level $n = 0, 1, 2, 3$ with probabilities $${EX.P.join(',\\ ')}$. Each level holds energy $E_n = n\varepsilon$ with $\varepsilon = ${EX.eps}$ meV. Find $\langle n\rangle$, $\sigma_n$ and the average energy.`,
    visual: distBars(EX.n, EX.P, { mean: true, xlabel: 'level n', caption: 'The probabilities of the four levels; the gold line is the mean, the balance point of the bars.' }),
    steps: [
      { label: 'Check normalisation', text: t`$${EX.P.join(' + ')} = 1$ ✓. A distribution that does not add to 1 is not finished.` },
      { label: 'The mean', text: t`$\langle n\rangle = \sum n P(n) = 0(0.5) + 1(0.25) + 2(0.125) + 3(0.125) = ${EX.mean}$.` },
      { label: 'The mean square', text: t`$\langle n^2\rangle = 0 + 1(0.25) + 4(0.125) + 9(0.125) = ${EX.m2}$. Square *first*, then average.` },
      { label: 'The spread', text: t`$\sigma_n^2 = \langle n^2\rangle - \langle n\rangle^2 = ${EX.m2} - ${EX.mean}^2 = ${nice(EX.var)}$, so $\sigma_n = ${fmt(EX.sd, 3)}$.` },
      { label: 'Average energy', text: t`Averages are linear: $\langle E\rangle = \varepsilon\langle n\rangle = ${EX.eps} \times ${EX.mean} = ${nice(EX.eps * EX.mean)}$ meV.` },
      { label: 'Sense check', text: t`The mean ${EX.mean} sits between the outcomes and nearer the heavy bar at 0; the spread, about one level, matches the width of the bars.` },
    ],
    answer: t`$\langle n\rangle = ${EX.mean}$, $\sigma_n \approx ${fmt(EX.sd, 3)}$, $\langle E\rangle = ${nice(EX.eps * EX.mean)}$ meV.`,
  },
  practice: [
    num({
      id: 'normalise', difficulty: 1,
      gen(r) {
        const a = r.int(2, 6) * 0.05, b = r.int(2, 6) * 0.05, c = r.int(1, 4) * 0.05;
        const miss = +(1 - a - b - c).toFixed(2);
        const xs = [0, 1, 2, 3], ps = [a, b, miss, c].map((v) => +v.toFixed(2));
        return {
          prompt: t`A molecule can be found in four states, labelled 0 to 3. States 0, 1 and 3 have probabilities $${nice(ps[0])}$, $${nice(ps[1])}$ and $${nice(ps[3])}$. What is the probability of state 2?`,
          answer: miss, tol: { rel: 0, abs: 0.004 },
          errors: [{ value: +(a + b + c).toFixed(2), feedback: 'That is the probability of *not* being in state 2. Subtract it from 1.' }],
          hints: ['The four probabilities must add to exactly 1.'],
          teach: t`Normalisation: $\sum_x P(x) = 1$ — the system is certainly in *some* state.`,
          explain: t`$P(2) = 1 - ${nice(ps[0])} - ${nice(ps[1])} - ${nice(ps[3])} = ${nice(miss)}$.`,
          visual: distBars(xs, ps, { ask: 2, xlabel: 'state', caption: 'Three of the four probabilities; the fourth is missing.' }),
        };
      },
    }),
    num({
      id: 'mean', difficulty: 2,
      gen(r) {
        const xs = [r.int(1, 3), r.int(4, 6), r.int(7, 9)], k = r.pick([[0.2, 0.5, 0.3], [0.5, 0.3, 0.2], [0.25, 0.25, 0.5], [0.1, 0.6, 0.3]]);
        const m = xs.reduce((s, x, i) => s + x * k[i], 0);
        const plain = (xs[0] + xs[1] + xs[2]) / 3;
        return {
          prompt: t`A photon counter, read many times, shows $x = ${xs.join(',\\ ')}$ counts with probabilities $${k.join(',\\ ')}$. What is $\langle x\rangle$?`,
          answer: m, tol: { rel: 0, abs: 0.005 },
          errors: Math.abs(plain - m) > 0.02 ? [{ value: plain, feedback: 'That is the plain average of the three values. Weight each by its probability.' }] : [],
          hints: [t`$\langle x\rangle = \sum x\,P(x)$: multiply each value by its probability and add.`],
          teach: 'An average weights each outcome by how likely it is.',
          explain: t`$\langle x\rangle = ${xs.map((x, i) => `${x}(${k[i]})`).join(' + ')} = ${nice(m)}$.`,
          visual: distBars(xs, k, { xlabel: 'counts x', caption: 'The distribution of readings. Where would it balance?' }),
        };
      },
    }),
    num({
      id: 'sd', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), d = r.int(2, 5), p = r.pick([0.5, 0.25, 0.75, 0.2]);
        const xs = [a, a + d], ps = [1 - p, p];
        const m = xs[0] * ps[0] + xs[1] * ps[1], m2 = xs[0] ** 2 * ps[0] + xs[1] ** 2 * ps[1], s = Math.sqrt(m2 - m * m);
        return {
          prompt: t`A quantity takes the value $${xs[0]}$ with probability $${nice(ps[0])}$ and $${xs[1]}$ with probability $${nice(ps[1])}$. Find its standard deviation $\sigma$.`,
          answer: s, tol: { rel: 0.01 },
          errors: [{ value: m2 - m * m, feedback: t`That is the variance $\sigma^2$. Take its square root.` }, { value: Math.sqrt(m2), feedback: t`You took $\sqrt{\langle x^2\rangle}$ (the rms value). Subtract $\langle x\rangle^2$ first.` }],
          hints: [t`Find $\langle x\rangle$ and $\langle x^2\rangle$ separately.`, t`$\sigma = \sqrt{\langle x^2\rangle - \langle x\rangle^2}$.`],
          teach: t`The variance is the mean of the square minus the square of the mean.`,
          explain: t`$\langle x\rangle = ${nice(m)}$, $\langle x^2\rangle = ${nice(m2)}$, so $\sigma = \sqrt{${nice(m2)} - ${nice(m)}^2} = ${fmt(s, 3)}$. For two outcomes this is always $d\sqrt{p(1-p)}$ with $d = ${d}$.`,
          visual: distBars(xs, ps, { mean: true, caption: 'Two outcomes and their mean (gold). The spread measures how far the bars sit from it.' }),
        };
      },
    }),
    mcq({
      id: 'x2-vs-mean2', difficulty: 2,
      prompt: t`For any probability distribution, how does $\langle x^2\rangle$ compare with $\langle x\rangle^2$?`,
      choices: [t`$\langle x^2\rangle \ge \langle x\rangle^2$, with equality only when $x$ has no spread`, t`They are always equal`, t`$\langle x^2\rangle \le \langle x\rangle^2$`, t`Either can be larger, depending on the distribution`],
      answer: 0,
      why: { 1: t`Try $x = 1$ or $3$ with equal chances: $\langle x^2\rangle = 5$ but $\langle x\rangle^2 = 4$. Averaging and squaring do not commute.`, 2: t`Their difference is $\sigma^2$, an average of squares, which cannot be negative.`, 3: t`The difference is always the variance, never negative — so the order is fixed.` },
      hints: [t`What is $\langle x^2\rangle - \langle x\rangle^2$ called?`],
      teach: t`$\langle x^2\rangle - \langle x\rangle^2 = \langle (x - \langle x\rangle)^2\rangle = \sigma^2 \ge 0$.`,
      explain: t`Expanding the mean squared deviation gives $\langle (x-\langle x\rangle)^2\rangle = \langle x^2\rangle - \langle x\rangle^2$, an average of squares, so it is never negative. This is why the rms speed of a gas always exceeds its mean speed.`,
      visual: distBars([1, 3], [0.5, 0.5], { mean: true, caption: 'x = 1 or 3, equally likely: the mean is 2, so ⟨x⟩² = 4, while ⟨x²⟩ = (1 + 9)/2 = 5.' }),
    }),
    num({
      id: 'barometric', difficulty: 3,
      gen(r) {
        const Hs = r.pick([7.5, 8.0, 8.5]), h = r.pick([5, 10, 12, 15, 20]);
        const P = Math.exp(-h / Hs);
        return {
          prompt: t`In an isothermal atmosphere, a given air molecule’s height has the probability density $p(z) = \dfrac{1}{H}e^{-z/H}$ for $z \ge 0$, with scale height $H = ${Hs}$ km. What is the probability that the molecule is above $${h}$ km?`,
          answer: P, tol: { rel: 0.01 }, integrand: `(1/${Hs})*e^(-x/${Hs})`, limits: [h, 'inf'], vars: { x: [0, 60] },
          errors: [{ value: 1 - P, feedback: t`That is the chance of being *below* $${h}$ km.` }, { value: Math.exp(-h / Hs) / Hs, feedback: t`That is the density $p(${h}\text{ km})$, a probability *per kilometre*. Integrate it from $${h}$ km upward.` }],
          hints: [t`A probability from a density is an area: $P = \int_{${h}}^{\infty} p(z)\,dz$.`, t`$\int_{h}^{\infty} \tfrac1H e^{-z/H}dz = e^{-h/H}$.`],
          teach: 'For a continuous variable the probability is the area under the density, not its height.',
          explain: t`$P(z > ${h}) = \int_{${h}}^\infty \tfrac1H e^{-z/H}\,dz = e^{-${h}/${Hs}} = ${fmt(P, 3)}$. A real atmosphere is not isothermal, so this is a model.`,
          visual: { type: 'graph', params: { x: [0, 40], y: [0, 0.15], aspect: 'wide', xlabel: 'height z (km)', ylabel: 'p (per km)', curves: [{ fn: `(1/${Hs})*e^(-x/${Hs})`, color: 'accent' }], shade: [{ fn: `(1/${Hs})*e^(-x/${Hs})`, from: h, to: 40, color: 'gold', alpha: 0.35 }], vlines: [{ x: h, label: `${h} km`, color: 'gold' }] }, caption: 'The height density of one molecule; the shaded area beyond the line is the probability asked for. An isothermal atmosphere is a simplification.' },
        };
      },
    }),
    num({
      id: 'binomial-sd', difficulty: 2,
      gen(r) {
        const N = r.pick([40, 60, 80, 100]), p = r.pick([0.2, 0.3, 0.5, 0.7]);
        const s = Math.sqrt(N * p * (1 - p));
        return {
          prompt: t`A small paramagnet has $N = ${N}$ independent spins, each pointing up with probability $p = ${p}$. What is the standard deviation of the number pointing up? (For $N$ independent trials, $\langle k\rangle = Np$ and $\sigma_k^2 = Np(1-p)$.)`,
          answer: s, tol: { rel: 0.01 },
          errors: [{ value: N * p * (1 - p), feedback: t`That is the variance. Take the square root.` }, { value: Math.sqrt(N * p), feedback: t`Include the factor $(1-p)$: $\sigma^2 = Np(1-p)$.` }],
          hints: [t`Use $\sigma_k = \sqrt{Np(1-p)}$.`],
          teach: 'Variances of independent trials add: N trials of variance p(1 − p) give Np(1 − p).',
          explain: t`$\sigma = \sqrt{${N}(${p})(${nice(1 - p)})} = ${fmt(s, 3)}$ — about $${fmt((100 * s) / (N * p), 2)}\%$ of the mean $${nice(N * p)}$.`,
          visual: binomBars(N, p, { mean: true, caption: `The exact distribution of the number of up spins for N = ${N}, p = ${p}.` }),
        };
      },
    }),
    mcq({
      id: 'scaling', difficulty: 2,
      prompt: t`A sample of $N$ independent molecules gives a relative fluctuation $\sigma/\langle k\rangle$ in some count. If the sample is made 100 times larger, the relative fluctuation becomes:`,
      choices: ['10 times smaller', '100 times smaller', '10 times larger', 'unchanged'],
      answer: 0,
      why: { 1: t`The spread itself *grows*, like $\sqrt N$; only relative to the mean (which grows like $N$) does it shrink — by $\sqrt{100} = 10$.`, 2: 'The absolute spread does grow, by 10, but the mean grows by 100.', 3: t`The ratio $\sqrt{N}/N = 1/\sqrt N$ depends on $N$.` },
      hints: [t`$\sigma \propto \sqrt N$ and $\langle k\rangle \propto N$.`],
      teach: t`Relative fluctuations scale as $1/\sqrt N$.`,
      explain: t`$\sigma/\langle k\rangle = \sqrt{Np(1-p)}/(Np) \propto 1/\sqrt N$. For a mole, $1/\sqrt{6\times10^{23}} \approx 10^{-12}$: no instrument could ever see it.`,
      visual: { type: 'graph', params: { x: [0.2, 0.8], y: [0, 42], aspect: 'wide', xlabel: 'fraction of successes', ylabel: 'probability per unit fraction', axesAt: 'edge', curves: [{ fn: '1/sqrt(2*pi*0.25/100)*e^(-(x-0.5)^2/(2*0.25/100))', color: 'accent', label: 'N = 100', labelAt: 0.58, labelDx: 8 }, { fn: '1/sqrt(2*pi*0.25/10000)*e^(-(x-0.5)^2/(2*0.25/10000))', color: 'gold', label: 'N = 10 000', labelAt: 0.505, labelDx: 8 }] }, caption: 'The distribution of the fraction of successes for N = 100 and N = 10 000 (Gaussian approximations, p = ½).' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cubesat', difficulty: 2, transfer: true,
      gen(r) {
        const N = r.pick([80, 100, 120, 150]), p = r.pick([0.02, 0.04, 0.05]);
        const s = Math.sqrt(N * p * (1 - p));
        return {
          prompt: t`A cubesat’s solar array has ${N} cells. Over the mission each cell fails independently with probability ${p}. What is the standard deviation of the number of failed cells?`,
          answer: s, tol: { rel: 0.01 },
          errors: [{ value: N * p, feedback: 'That is the expected number of failures, not the spread.' }, { value: N * p * (1 - p), feedback: 'That is the variance; take its square root.' }],
          hints: [t`Each cell is one trial: $\sigma = \sqrt{Np(1-p)}$.`, t`$\sqrt{${N}\times${p}\times${nice(1 - p)}}$.`],
          teach: 'Independent failures follow the binomial distribution.',
          explain: t`$\langle k\rangle = ${nice(N * p)}$ and $\sigma = \sqrt{${N}(${p})(${nice(1 - p)})} = ${fmt(s, 3)}$ — a designer sizing the array for $\langle k\rangle + 2\sigma \approx ${fmt(N * p + 2 * s, 2)}$ failures covers about 97% of missions.`,
          visual: binomBars(N, p, { xmax: 20, caption: `The binomial distribution of failures for ${N} cells, shown up to 20 failures (the rest are negligible). Real failures are not always independent: one radiation event can take out a string.` }),
        };
      },
    }),
    num({
      id: 'cp-mean-energy', difficulty: 2,
      gen(r) {
        const eps = r.pick([10, 20, 25, 40]), P = r.pick([[0.6, 0.3, 0.1], [0.7, 0.2, 0.1], [0.5, 0.35, 0.15], [0.8, 0.15, 0.05]]);
        const m = eps * (P[1] + 2 * P[2]);
        return {
          prompt: t`A molecule’s rotational energy is $0$, $${eps}$ meV or $${2 * eps}$ meV with probabilities $${P.join(',\\ ')}$. What is its average rotational energy?`,
          answer: m, units: 'meV', tol: { rel: 0.005 },
          errors: [{ value: eps, feedback: 'That is the plain average of the three energies; weight each by its probability.' }],
          hints: [t`$\langle E\rangle = \sum E\,P(E)$.`],
          teach: 'An average energy weights each level by its probability.',
          explain: t`$\langle E\rangle = 0(${P[0]}) + ${eps}(${P[1]}) + ${2 * eps}(${P[2]}) = ${nice(m)}$ meV.`,
          visual: distBars([0, eps, 2 * eps], P, { xlabel: 'energy', unit: 'meV', caption: 'The three energies and their probabilities.' }),
        };
      },
    }),
    mcq({
      id: 'cp-density', difficulty: 3,
      prompt: t`The speed density of nitrogen at 300 K peaks near $v = ${Math.round(vp)}$ m/s, where $p(v) \approx ${fmt(peakDensity, 2)}$ per (m/s). Roughly what is the probability that a molecule’s speed lies between $${Math.round(vp)}$ and $${Math.round(vp) + 1}$ m/s?`,
      choices: [t`about $${fmt(peakDensity, 2)}$`, '0, since no molecule has exactly one speed', t`about $${fmt(peakDensity * 100, 2)}$`, '1, since it is the most probable speed'],
      answer: 0,
      why: { 1: 'Exactly one speed has zero probability, but a 1 m/s *interval* has an area p Δv.', 2: 'You multiplied by 100 m/s; the interval is 1 m/s wide.', 3: 'Most probable means the density is highest there, not that the speed is certain.' },
      hints: ['A density times an interval width is a probability.', t`$P \approx p(v)\,\Delta v$ with $\Delta v = 1$ m/s.`],
      teach: 'A probability density has units: per (m/s) here. Multiply by an interval to get a probability.',
      explain: t`$P \approx p\,\Delta v = ${fmt(peakDensity, 2)}\ (\text{m/s})^{-1} \times 1\ \text{m/s} = ${fmt(peakDensity, 2)}$ — a fifth of a per cent.`,
      visual: { type: 'graph', params: { x: [0, 1300], y: [0, 0.0024], aspect: 'wide', xlabel: 'speed v (m/s)', ylabel: 'p(v), per (m/s)', curves: [{ fn: maxwellExpr, color: 'accent' }], vlines: [{ x: r4(vp), label: `${Math.round(vp)} m/s`, color: 'gold' }] }, caption: 'The Maxwell speed density of N₂ at 300 K (an ideal gas). The total area under it is 1.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, Appendix B and §2.1', url: 'https://physics.weber.edu/thermal/' },
    { label: 'MIT OCW 8.044 Statistical Physics I (Spring 2013): probability', url: 'https://ocw.mit.edu/courses/8-044-statistical-physics-i-spring-2013/' },
  ],
});
