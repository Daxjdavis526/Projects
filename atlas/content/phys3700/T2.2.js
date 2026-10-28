// The Einstein solid: N quantum oscillators sharing q quanta, Ω = C(q+N−1, q)
// by stars and bars, its behaviour as quanta are added, and the high-
// temperature limit Ω ≈ (eq/N)^N.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { omega, lnOmega, starsPic, einPic, r4, texNum, thouTeX, EV, apart } from './_count.js';

const t = String.raw;
const W = (N, q) => Number(omega(N, q));
const occ = (N, q, seed = 1) => { const a = Array(N).fill(0); for (let i = 0; i < q; i++) a[(i * (2 + seed) + seed) % N]++; return a; };

// ln Ω/N against q/N: the large-N form and its high-temperature limit
const limitPic = (mark, caption) => ({
  type: 'graph',
  params: {
    x: [0, 12], y: [0, 4], aspect: 'wide', xlabel: 'quanta per oscillator, q / N', ylabel: 'ln Ω / N', axesAt: 'edge',
    curves: [
      { fn: '(1+x)*ln(1+x) - x*ln(x)', domain: [0.001, 12], color: 'accent', label: 'large-N (Stirling) form', labelAt: 9, labelDx: -60, labelDy: 16 },
      { fn: 'ln(e*x)', domain: [0.37, 12], color: 'gold', dash: true, label: 'ln(eq/N), for q ≫ N', labelAt: 5, labelDx: -120, labelDy: -14 },
    ],
    ...(mark ? { vlines: [{ x: mark, label: `q/N = ${mark}`, color: 'ink2' }] } : {}),
  },
  caption: caption ?? 'The multiplicity per oscillator, from Stirling’s formula, and its high-temperature approximation. They merge once there are several quanta per oscillator.',
});

const EX = { N: 3, q: 4, Nb: 300, qb: 3000 };
EX.small = W(EX.N, EX.q); EX.lnExact = lnOmega(EX.Nb, EX.qb); EX.lnHigh = EX.Nb * (Math.log(EX.qb / EX.Nb) + 1);

export default lesson({
  id: 'phys3700.T2.2',
  title: 'The Einstein solid',
  minutes: 12, difficulty: 3,
  intro: t`Einstein modelled a solid as atoms on springs: each atom vibrates in three directions, so $N_\text{atoms}$ atoms make $N = 3N_\text{atoms}$ quantum harmonic oscillators. A quantum oscillator holds energy only in whole **quanta** of $\hbar\omega$, so a solid with energy $U = q\hbar\omega$ (above the ground state) has $q$ identical quanta to share among $N$ oscillators. The number of ways to share them is

$$\Omega(N, q) = \binom{q+N-1}{q} = \frac{(q+N-1)!}{q!\,(N-1)!}.$$

The proof is a picture: write each microstate as $q$ dots and $N-1$ walls in a row (“stars and bars”), and count the rows. This multiplicity grows ferociously with $q$ — which is why heat flows the way it does (T2.3).`,
  symbols: [
    { tex: 'N', text: 'the number of oscillators: three per atom' },
    { tex: 'q', text: 'the number of energy quanta in the whole solid (a whole number)' },
    { tex: '\\hbar\\omega', text: 'one quantum: $\\hbar = 1.055\\times10^{-34}$ J s times the oscillators’ angular frequency $\\omega$; typically a few hundredths of an eV' },
    { tex: 'U = q\\hbar\\omega', text: 'the solid’s energy above its ground state (the zero-point energy is left out)' },
    { tex: '\\Omega(N, q)', text: 'the multiplicity: the number of ways to give the $N$ oscillators $q$ quanta in total' },
  ],
  why: 'The Einstein solid is the simplest system whose entropy, temperature and heat capacity can all be computed exactly from counting — the model every later lesson in this module tests ideas on.',
  visual: {
    type: 'th-einstein',
    title: 'Every microstate of a small Einstein solid',
    lead: t`Each row of boxes is one microstate: which oscillator holds how many quanta. Under each, the same microstate as dots (quanta) and bars (walls between oscillators). Change $N$ and $q$ and count.`,
    tasks: [
      'Set N = 3 and q = 3: ten microstates, as Ω = C(5, 3) = 10.',
      'Add one quantum (q = 4): fifteen. Each extra quantum multiplies Ω by (q + N)/(q + 1).',
      'Set N = 1: whatever q is, there is one microstate — a single oscillator has no choices.',
    ],
    params: { mode: 'list', N: 3, q: 3, controls: ['N', 'q'] },
    caption: 'Every microstate drawn (up to 120 of them). The oscillators are distinguishable — they sit at different places in the crystal — but the quanta are not.',
  },
  example: {
    prompt: t`(a) How many microstates does an Einstein solid with $N = ${EX.N}$ oscillators and $q = ${EX.q}$ quanta have? (b) For $N = ${EX.Nb}$ and $q = ${thouTeX(EX.qb)}$, compare the exact $\ln\Omega$ with the high-temperature estimate $\Omega \approx (eq/N)^N$.`,
    visual: starsPic([2, 0, 2], { title: 'one microstate of N = 3, q = 4: ●●||●●' }),
    steps: [
      { label: 'Stars and bars', text: t`A microstate is a row of $q = ${EX.q}$ dots and $N - 1 = 2$ walls: 6 symbols. Choosing which 4 of the 6 places hold dots fixes the row.` },
      { label: 'Count', text: t`$\Omega = \binom{6}{4} = ${EX.small}$ — the list in the Explore step shows all of them.` },
      { label: 'A larger solid', text: t`For $N = ${EX.Nb}$, $q = ${thouTeX(EX.qb)}$: $\ln\Omega = \ln\binom{${EX.qb + EX.Nb - 1}}{${EX.qb}} = ${fmt(EX.lnExact, 4)}$ exactly (computed with log-factorials), so $\Omega \approx 10^{${Math.round(EX.lnExact / Math.LN10)}}$.` },
      { label: 'High-temperature limit', text: t`With $q \gg N$, Stirling gives $\Omega \approx (eq/N)^N$: $\ln\Omega \approx ${EX.Nb}(\ln 10 + 1) = ${fmt(EX.lnHigh, 4)}$, within ${fmt((100 * (EX.lnExact - EX.lnHigh)) / EX.lnExact, 2)}%.` },
      { label: 'Sense check', text: t`Both are dominated by $N\ln(q/N)$: ten quanta per oscillator gives each oscillator about $e \times 10$ “choices”, and the $N$ choices multiply.` },
    ],
    answer: t`(a) $\Omega = ${EX.small}$. (b) $\ln\Omega = ${fmt(EX.lnExact, 4)}$; the estimate gives $${fmt(EX.lnHigh, 4)}$.`,
  },
  practice: [
    num({
      id: 'omega-small', difficulty: 2,
      gen(r) {
        const N = r.int(3, 5), q = r.int(3, 6), v = W(N, q);
        return {
          prompt: t`How many microstates does an Einstein solid with $N = ${N}$ oscillators and $q = ${q}$ quanta have?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: N ** q, feedback: 'That treats each quantum as a different object choosing an oscillator. Quanta are identical.' }, { value: W(N + 1, q), feedback: t`There are $N - 1$ walls, not $N$: use $\binom{q+N-1}{q}$.` }, { value: W(N, q - 1), feedback: 'Check the top of the binomial: q + N − 1.' }], v),
          hints: [t`Write a microstate as $${q}$ dots and $${N - 1}$ walls.`, t`$\Omega = \binom{${q + N - 1}}{${q}}$.`],
          teach: t`$\Omega(N, q) = \binom{q+N-1}{q}$.`,
          explain: t`$\Omega = \binom{${q + N - 1}}{${q}} = ${v}$.`,
          visual: starsPic(occ(N, q), { title: `one microstate of N = ${N}, q = ${q}` }),
        };
      },
    }),
    mcq({
      id: 'compare', difficulty: 2,
      prompt: t`Which has more microstates: 3 oscillators sharing 4 quanta, or 4 oscillators sharing 3 quanta?`,
      choices: [t`4 oscillators with 3 quanta: $\binom{6}{3} = 20$ against $\binom{6}{4} = 15$`, t`3 oscillators with 4 quanta: more quanta, more ways`, t`They are equal: both have 7 objects`, t`3 oscillators with 4 quanta: $4^3 = 64$ against $3^4 = 81$`],
      answer: 0,
      why: { 1: 'More quanta do not always win: what matters is the number of places for dots among dots-and-walls.', 2: t`Both rows have 6 symbols, but $\binom{6}{3} \ne \binom{6}{4}$.`, 3: 'Powers count distinguishable quanta; quanta are identical.' },
      hints: [t`Use $\binom{q+N-1}{q}$ for each.`, t`$N = 3, q = 4$: $\binom{6}{4}$. $N = 4, q = 3$: $\binom{6}{3}$.`],
      teach: 'Ω depends on N and q differently: an extra oscillator and an extra quantum are not interchangeable.',
      explain: t`$\binom{6}{4} = 15$ and $\binom{6}{3} = 20$. Both rows have 6 symbols, but 3 dots and 3 walls can be arranged in more ways than 4 and 2.`,
      visual: { type: 'th-einstein', params: { mode: 'list', N: 3, q: 4, readouts: false, controls: false }, caption: 'All fifteen microstates of 3 oscillators sharing 4 quanta. How many would 4 oscillators sharing 3 quanta have?' },
    }),
    num({
      id: 'from-energy', difficulty: 2,
      gen(r) {
        const hw = r.pick([20, 25, 40]), q = r.int(3, 6), N = r.pick([3, 4]), U = q * hw, v = W(N, q);
        return {
          prompt: t`A tiny Einstein solid of $${N}$ oscillators, each with quantum $\hbar\omega = ${hw}$ meV, has $${U}$ meV of energy above its ground state. How many microstates does it have?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: W(N, U), feedback: 'Count quanta, not millielectronvolts: q = U/ħω.' }], v),
          hints: [t`$q = U/\hbar\omega = ${q}$.`, t`$\Omega = \binom{${q + N - 1}}{${q}}$.`],
          teach: t`Energy fixes the number of quanta, $q = U/\hbar\omega$; then count.`,
          explain: t`$q = ${U}/${hw} = ${q}$; $\Omega = \binom{${q + N - 1}}{${q}} = ${v}$.`,
          visual: starsPic(occ(N, q, 2), { title: `one way to share ${q} quanta of ${hw} meV among ${N} oscillators` }),
        };
      },
    }),
    num({
      id: 'add-quantum', difficulty: 3,
      gen(r) {
        const N = r.pick([10, 50, 100]), q = r.pick([5, 20, 100, 400]), ratio = (q + N) / (q + 1);
        return {
          prompt: t`An Einstein solid has $N = ${N}$ oscillators and $q = ${q}$ quanta. By what factor does $\Omega$ grow when one more quantum is added?`,
          answer: ratio, tol: { rel: 0.005 },
          errors: apart([{ value: (q + N - 1) / q, feedback: t`Check the factorials: $\Omega(N, q+1)/\Omega(N, q) = \dfrac{(q+N)!\,q!}{(q+1)!\,(q+N-1)!}$.` }, { value: N, feedback: 'Adding a quantum does not multiply the count by N.' }], ratio),
          hints: [t`Write both binomials out and cancel: most factorials cancel.`, t`$\dfrac{\Omega(N, q+1)}{\Omega(N, q)} = \dfrac{q + N}{q + 1}$.`],
          teach: t`Each added quantum multiplies $\Omega$ by $(q+N)/(q+1)$ — a lot when $q \ll N$, little when $q \gg N$.`,
          explain: t`$\dfrac{(q+N)!}{(q+1)!(N-1)!}\cdot\dfrac{q!(N-1)!}{(q+N-1)!} = \dfrac{q+N}{q+1} = \dfrac{${q + N}}{${q + 1}} = ${fmt(ratio, 4)}$. How fast $\ln\Omega$ grows with energy will become the temperature (T3.1): a cold solid (few quanta) gains far more multiplicity per quantum than a hot one.`,
          visual: limitPic(r4(q / N), `ln Ω per oscillator against quanta per oscillator; the solid’s q/N = ${fmt(q / N, 3)} marked. The slope is how fast Ω grows with each quantum.`),
        };
      },
    }),
    num({
      id: 'high-T', difficulty: 3,
      gen(r) {
        const k = r.int(18, 22), m = r.int(1, 3), N = 10 ** k, q = 10 ** (k + m), v = N * (Math.log(q / N) + 1);
        return {
          prompt: t`A crystal has $N = 10^{${k}}$ oscillators sharing $q = 10^{${k + m}}$ quanta. Use the high-temperature form $\Omega \approx (eq/N)^N$ to estimate $\ln\Omega$.`,
          answer: v, tol: { rel: 0.005 },
          errors: apart([{ value: N * Math.log(q / N), feedback: t`$\ln(eq/N) = \ln(q/N) + 1$: keep the 1.` }, { value: (N * (Math.log(q / N) + 1)) / Math.LN10, feedback: 'That is log₁₀ Ω. The question asks for the natural log.' }], v),
          hints: [t`$\ln\Omega \approx N[\ln(q/N) + 1]$.`, t`$\ln(q/N) = ${m}\ln 10 = ${fmt(m * Math.LN10, 4)}$.`],
          teach: t`For $q \gg N$: $\ln\Omega \approx N[\ln(q/N) + 1]$.`,
          explain: t`$\ln\Omega \approx 10^{${k}}(${fmt(m * Math.LN10, 4)} + 1) = ${texNum(v, 4)}$: $\Omega$ is $e$ to that, a number with about $${texNum(v / Math.LN10, 2)}$ digits.`,
          visual: limitPic(Math.min(10, 10 ** m) === 10 ** m ? 10 ** m : null, 'ln Ω per oscillator against quanta per oscillator. Your solid has 10, 100 or 1000 quanta per oscillator — off to the right where the two curves agree.'),
        };
      },
    }),
    code({
      id: 'code-einstein', difficulty: 2,
      prompt: t`Check the formula by brute force. Complete \`count(N, q)\`: loop over every way to give each of $N$ oscillators 0 to $q$ quanta (\`itertools.product(range(q + 1), repeat=N)\`) and count the ones whose total is exactly $q$.`,
      starter: t`from itertools import product
from math import comb

def count(N, q):
    n = 0
    for state in product(range(q + 1), repeat=N):
        pass   # count states whose quanta add up to q
    return n

print(count(3, 4), comb(4 + 3 - 1, 4))
`,
      answer: t`from itertools import product
from math import comb

def count(N, q):
    n = 0
    for state in product(range(q + 1), repeat=N):
        if sum(state) == q:
            n += 1
    return n

print(count(3, 4), comb(4 + 3 - 1, 4))`,
      tests: [
        { name: 'N = 3, q = 4: 15 microstates', code: 'count(3, 4) == 15' },
        { name: 'N = 3, q = 3: 10, as in Schroeder', code: 'count(3, 3) == 10' },
        { name: 'agrees with C(q + N − 1, q) for N = 4, q = 0…5', code: 'all(count(4, q) == comb(q + 3, q) for q in range(6))' },
        { name: 'one oscillator has one microstate', code: 'count(1, 7) == 1' },
      ],
      hints: [t`\`state\` is a tuple of quanta, one per oscillator; \`sum(state)\` is its total.`, t`Replace \`pass\` with \`if sum(state) == q: n += 1\`.`],
      teach: 'Enumeration checks the stars-and-bars count — for small solids only: the loop runs (q + 1)ᴺ times.',
      explain: t`Only tuples summing to $q$ are microstates of the solid; there are $\binom{q+N-1}{q}$ of them. The loop itself visits $(q+1)^N$ tuples — $10^{60}$ for a 60-oscillator solid with 9 quanta — which is why the formula matters.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bolometer', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([20, 30, 40]), q = r.pick([10, 20]), k = r.pick([3, 5]);
        const ratio = W(N, q + k) / W(N, q);
        return {
          prompt: t`A bolometer — the detector type of Planck’s high-frequency instrument — warms when it absorbs a photon. In a toy Einstein-solid model, an absorber of $N = ${N}$ oscillators holds $q = ${q}$ quanta and absorbs a photon worth ${k} quanta. By what factor does its multiplicity grow?`,
          answer: ratio, tol: { rel: 0.01 },
          errors: apart([{ value: ((q + N) / (q + 1)) * k, feedback: 'The factors for successive quanta multiply; they do not add.' }, { value: ((q + N) / (q + 1)) ** k, feedback: 'Close, but the factor changes as q grows: (q+N)/(q+1), then (q+1+N)/(q+2), …' }], ratio),
          hints: [t`Compute $\Omega(N, q + ${k})/\Omega(N, q)$ directly, or multiply the one-quantum factors.`, t`$\prod_{j=0}^{${k - 1}} \dfrac{q + j + N}{q + j + 1}$.`],
          teach: 'Absorbed energy multiplies the number of microstates — the microscopic meaning of the entropy a detector gains.',
          explain: t`$\Omega(${N}, ${q + k})/\Omega(${N}, ${q}) = ${texNum(W(N, q + k), 4)}/${texNum(W(N, q), 4)} = ${fmt(ratio, 4)}$. A real bolometer has some $10^{20}$ oscillators; the model shows only the principle.`,
          visual: starsPic(occ(Math.min(N, 8), 6), { title: 'quanta shared among oscillators (a few drawn)', caption: 'A sketch: quanta (dots) shared among oscillators (separated by bars); the absorber has many more oscillators than drawn.' }),
        };
      },
    }),
    num({
      id: 'cp-omega', difficulty: 2,
      gen(r) {
        const N = r.int(4, 6), q = r.int(2, 5), v = W(N, q);
        return {
          prompt: t`Find $\Omega$ for an Einstein solid with $N = ${N}$ and $q = ${q}$.`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: N ** q, feedback: 'Quanta are identical; use stars and bars.' }], v),
          hints: [t`$\binom{q+N-1}{q}$.`],
          teach: t`$\Omega(N, q) = \binom{q+N-1}{q}$.`,
          explain: t`$\binom{${q + N - 1}}{${q}} = ${v}$.`,
          visual: starsPic(occ(N, q, 3), { title: `one microstate of N = ${N}, q = ${q}` }),
        };
      },
    }),
    mcq({
      id: 'cp-why-3N', difficulty: 2,
      prompt: 'Why does an Einstein solid of N atoms have 3N oscillators?',
      choices: [
        'Each atom can vibrate independently along x, y and z, and each direction is one oscillator',
        'Each atom has three electrons that oscillate',
        'Each oscillator holds three quanta',
        'Kinetic, potential and total energy each count once',
      ],
      answer: 0,
      why: { 1: 'The model concerns the atoms’ vibrations about their lattice sites, not electrons.', 2: 'An oscillator can hold any number of quanta.', 3: 'Total energy is not separate from kinetic plus potential; and each oscillator already has both.' },
      hints: ['How many independent directions can an atom on a spring move in?'],
      teach: 'One oscillator per direction of motion: 3 per atom.',
      explain: 'Each atom sits in a three-dimensional well; its motion along x, y and z separates into three independent oscillators. (Each oscillator then has 2 quadratic degrees of freedom, giving equipartition’s 6 per atom.)',
      visual: einPic({ mode: 'pair', NA: 6, NB: 6, q: 8, cells: true, panels: 'cells', start: 'even' }, 'Two tiny Einstein solids of two atoms each: every box is one oscillator holding its quanta (dots).'),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §2.2', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Einstein, Die Plancksche Theorie der Strahlung und die Theorie der spezifischen Wärme, Ann. Phys. 22, 180 (1907)', url: 'https://doi.org/10.1002/andp.19063270110' },
  ],
});
