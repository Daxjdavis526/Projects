// Stirling's approximation: ln N! ≈ N ln N − N, where it comes from (the
// staircase under ln x), its error ½ ln(2πN), and why the error does not
// matter for the logarithms of very large numbers — but does for the numbers.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { lnFact, lnChoose, stirling, stirling2, r4, texNum, apart } from './_count.js';

const t = String.raw;
const LN10 = Math.LN10;

const EX = { N: 100 };
EX.exact = lnFact(EX.N); EX.crude = stirling(EX.N); EX.full = stirling2(EX.N);
EX.err = (100 * (EX.exact - EX.crude)) / EX.exact;
const BIG = 1e23, bigLn = stirling(BIG), corr = 0.5 * Math.log(2 * Math.PI * BIG);

// ln x and the curve N ln N − N, for problem pictures
const lnPic = (Nmark, caption) => ({
  type: 'graph',
  params: {
    x: [0, 60], y: [0, 190], aspect: 'wide', xlabel: 'N', ylabel: '', axesAt: 'edge',
    curves: [
      { fn: 'ln(gamma(x+1))', color: 'accent', domain: [1, 60], label: 'ln N!', labelAt: 45, labelDx: -40, labelDy: -14 },
      { fn: 'x*ln(x) - x', color: 'gold', domain: [1, 60], dash: true, label: 'N ln N − N', labelAt: 52, labelDx: 4, labelDy: 14 },
    ],
    ...(Nmark ? { vlines: [{ x: Nmark, label: `N = ${Nmark}`, color: 'ink2' }] } : {}),
  },
  caption,
});

export default lesson({
  id: 'phys3700.T0.3',
  title: 'Stirling’s approximation',
  minutes: 10, difficulty: 3,
  intro: t`Multiplicities are built from factorials of numbers like $10^{23}$, which no calculator can hold. Their logarithms are what physics needs, and for those there is a beautifully simple estimate:

$$\ln N! \approx N\ln N - N.$$

It comes from replacing the sum $\ln N! = \ln 1 + \ln 2 + \dots + \ln N$ by the integral $\int_1^N \ln x\,dx$. The better version, $N! \approx N^N e^{-N}\sqrt{2\pi N}$, adds $\tfrac12\ln(2\pi N)$ to the logarithm. That correction is **negligible next to $N \ln N$ when $N$ is huge** — but only in the logarithm: in $N!$ itself it is a factor of almost $10^{12}$.`,
  symbols: [
    { tex: 'N!', text: 'the factorial $1\\cdot2\\cdots N$; for $N = 10^{23}$ it has about $2.3\\times10^{24}$ digits' },
    { tex: '\\ln N!', text: 'its natural logarithm, $\\sum_{k=1}^N \\ln k$: an ordinary-sized number we can compute with' },
    { tex: 'N\\ln N - N', text: 'Stirling’s leading terms: the integral $\\int_1^N \\ln x\\,dx = N\\ln N - N + 1$, without the 1' },
    { tex: '\\tfrac12\\ln(2\\pi N)', text: 'the next correction: about 27 for $N = 10^{23}$, against $5\\times10^{24}$ for the leading terms' },
  ],
  why: 'Every entropy formula in this course — the Einstein solid, the paramagnet, the ideal gas’s Sackur–Tetrode equation — comes from Stirling turning ln of a factorial into something you can differentiate.',
  visual: {
    type: 'graph',
    title: 'ln N! is the area of a staircase under ln x',
    lead: t`Each orange bar is 1 wide and $\ln k$ tall, so together they have area $\ln 2 + \ln 3 + \dots + \ln N = \ln N!$. The blue curve is $\ln x$; the area under it from 1 to $N$ is $N\ln N - N + 1$.`,
    tasks: [
      'Slide N up: the bars overshoot the curve by a sliver each time, so the gap grows only slowly — like ½ ln N.',
      'Watch the relative error fall: about 14% at N = 10, under 4% by N = 40.',
      'Compare the last two readouts: N ln N − N already carries almost all of ln N!.',
    ],
    params: {
      x: [0, 41], y: [-0.2, 4.2], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge',
      sliders: [{ key: 'N', label: '$N$', min: 2, max: 40, step: 1, value: 10, explain: 'The factorial being approximated, N!.' }],
      riemann: { fn: 'ln(x)', from: 1, to: 'N', n: 'N - 1', rule: 'right' },
      curves: [{ fn: 'ln(x)', color: 'accent', domain: [0.6, 41], label: 'ln x', labelAt: 38, labelDy: -14 }],
      readouts: [
        { label: '$\\ln N!$ (the bars)', expr: 'riemann', digits: 5 },
        { label: '$\\int_1^N \\ln x\\,dx$', expr: 'integral', digits: 5 },
        { label: '$N\\ln N - N$', expr: 'N*ln(N) - N', digits: 5 },
        { label: 'relative error', expr: '(riemann - (N*ln(N) - N))/riemann', digits: 3 },
      ],
    },
    caption: 'The bars are exact: their area is ln N!. The approximation is the area under the smooth curve, which misses a thin sliver of each bar.',
  },
  example: {
    prompt: t`Estimate $\ln 100!$ with Stirling’s approximation, with and without the $\tfrac12\ln(2\pi N)$ term, and compare with the exact value $${fmt(EX.exact, 7)}$. Then estimate $\ln N!$ for $N = 10^{23}$.`,
    visual: lnPic(null, 'The exact ln N! (blue) and Stirling’s N ln N − N (gold, dashed). The gap between them is ½ ln(2πN): visible at small N, invisible next to the curves’ growth.'),
    steps: [
      { label: 'Leading terms', text: t`$N\ln N - N = 100\ln 100 - 100 = 460.517 - 100 = ${fmt(EX.crude, 6)}$.` },
      { label: 'Error', text: t`$${fmt(EX.exact, 7)} - ${fmt(EX.crude, 6)} = ${fmt(EX.exact - EX.crude, 3)}$, a relative error of $${fmt(EX.err, 2)}\%$.` },
      { label: 'Correction', text: t`$\tfrac12\ln(2\pi\cdot100) = ${fmt(0.5 * Math.log(200 * Math.PI), 4)}$, giving $${fmt(EX.full, 7)}$ — now off by only $${texNum(EX.exact - EX.full, 2)}$.` },
      { label: 'A mole of factors', text: t`For $N = 10^{23}$: $N\ln N - N = 10^{23}(52.96 - 1) = ${texNum(bigLn, 4)}$, while $\tfrac12\ln(2\pi N) = ${fmt(corr, 3)}$. The correction changes the 23rd significant figure.` },
      { label: 'Sense check', text: t`So $N! = e^{\ln N!} \approx 10^{${texNum(bigLn / LN10, 3)}}$ — a number with $2.3\times10^{24}$ digits. Its logarithm is what we can use.` },
    ],
    answer: t`$\ln 100! \approx ${fmt(EX.crude, 6)}$ (error $${fmt(EX.err, 2)}\%$), or $${fmt(EX.full, 7)}$ with the correction; $\ln(10^{23})! \approx ${texNum(bigLn, 4)}$.`,
  },
  practice: [
    num({
      id: 'crude-big', difficulty: 2,
      gen(r) {
        const k = r.int(20, 26), N = 10 ** k, v = stirling(N);
        return {
          prompt: t`Use $\ln N! \approx N\ln N - N$ to estimate $\ln N!$ for $N = 10^{${k}}$.`,
          answer: v, tol: { rel: 0.005 },
          errors: [{ value: N * Math.log(N), feedback: t`You left out the $-N$: it is about $${fmt(100 / Math.log(N), 2)}\%$ of the answer, not negligible here.` }, { value: N * Math.log10(N) - N, feedback: t`Use the natural log: $\ln 10^{${k}} = ${k}\ln 10$, not ${k}.` }],
          hints: [t`$\ln N = ${k}\ln 10 = ${fmt(k * LN10, 4)}$.`, t`$N\ln N - N = 10^{${k}}(${fmt(k * LN10, 4)} - 1)$.`],
          teach: t`Stirling turns $\ln N!$ into $N(\ln N - 1)$.`,
          explain: t`$\ln N! \approx 10^{${k}}\,(${fmt(k * LN10, 4)} - 1) = ${texNum(v, 4)}$.`,
          visual: { type: 'graph', params: { x: [0, 27], y: [0, 29], aspect: 'wide', xlabel: 'log₁₀ N', ylabel: 'log₁₀ of the term', axesAt: 'edge', curves: [{ fn: 'x + log10(x*ln(10))', domain: [0.5, 27], color: 'accent', label: 'N ln N', labelAt: 6, labelDy: -14 }, { fn: 'x', color: 'gold', dash: true, label: 'N', labelAt: 22, labelDy: 14 }] }, caption: 'The two Stirling terms on log axes: N ln N sits above N by a factor ln N, about 50 for N near 10²³.' },
        };
      },
    }),
    num({
      id: 'error-small', difficulty: 2,
      gen(r) {
        const N = r.pick([5, 10, 20, 50]), e = (100 * (lnFact(N) - stirling(N))) / lnFact(N);
        return {
          prompt: t`For $N = ${N}$, $\ln N! = ${fmt(lnFact(N), 5)}$. What is the percentage error of $N\ln N - N$?`,
          answer: e, units: '%', tol: { rel: 0.01 },
          errors: [{ value: lnFact(N) - stirling(N), feedback: 'That is the absolute error in ln N!. Divide by ln N! and multiply by 100.' }],
          hints: [t`Compute $${N}\ln ${N} - ${N}$ first.`, t`Error $= (\ln N! - (N\ln N - N))/\ln N! \times 100\%$.`],
          teach: 'Stirling is poor for small N and excellent for large N.',
          explain: t`$${N}\ln ${N} - ${N} = ${fmt(stirling(N), 5)}$, so the error is $(${fmt(lnFact(N), 5)} - ${fmt(stirling(N), 5)})/${fmt(lnFact(N), 5)} = ${fmt(e, 3)}\%$. Most of it is the missing $\tfrac12\ln(2\pi N) = ${fmt(0.5 * Math.log(2 * Math.PI * N), 3)}$.`,
          visual: lnPic(N, `ln N! and its Stirling estimate, with N = ${N} marked.`),
        };
      },
    }),
    num({
      id: 'digits', difficulty: 3,
      prompt: t`How many decimal digits does $1000!$ have? Use the full form $\ln N! \approx N\ln N - N + \tfrac12\ln(2\pi N)$. (A number $x \ge 1$ has $\lfloor\log_{10}x\rfloor + 1$ digits.)`,
      answer: Math.floor(lnFact(1000) / LN10) + 1, tol: { rel: 0, abs: 0.5 },
      errors: [{ value: Math.floor(stirling(1000) / LN10) + 1, feedback: 'Without the ½ ln(2πN) term you are 2 digits short: here it matters.' }, { value: Math.floor(lnFact(1000)) + 1, feedback: 'That counts with the natural log. Divide ln N! by ln 10 to get log₁₀ N!.' }],
      hints: [t`$\ln 1000! \approx 1000\ln1000 - 1000 + \tfrac12\ln(2000\pi)$.`, t`$\log_{10} N! = \ln N!/\ln 10$; then round down and add 1.`],
      teach: t`$\log_{10}x = \ln x/\ln 10$ counts the digits of a big number.`,
      explain: t`$\ln 1000! \approx 6907.755 - 1000 + 4.373 = ${fmt(stirling2(1000), 7)}$; divided by $\ln 10$: $${fmt(stirling2(1000) / LN10, 7)}$. So $1000! \approx 4.02\times10^{2567}$, which has 2568 digits.`,
      visual: { type: 'graph', params: { x: [0, 200], y: [0, 400], aspect: 'wide', xlabel: 'N', ylabel: 'digits in N!', axesAt: 'edge', curves: [{ fn: '(x*ln(x) - x + 0.5*ln(2*pi*x))/ln(10) + 1', domain: [1, 200], color: 'accent' }] }, caption: 'The number of digits in N! (Stirling with its correction), up to N = 200. It grows a little faster than a straight line.' },
    }),
    mcq({
      id: 'which-term', difficulty: 2,
      prompt: t`For $N = 10^{23}$, $\ln N! \approx N\ln N - N + \tfrac12\ln(2\pi N)$. Which term can be dropped without changing any result you could measure?`,
      choices: [t`$\tfrac12\ln(2\pi N)$, about 27`, t`$-N$, about $10^{23}$`, t`$N\ln N$`, 'None of them'],
      answer: 0,
      why: { 1: t`$N$ is about 2% of $N\ln N$ here; entropies and temperatures keep it (it is where the “+1” in many entropy formulas comes from).`, 2: 'That is the whole of the leading behaviour.', 3: t`$27$ next to $5\times10^{24}$ changes the 23rd significant figure.` },
      hints: ['Compare each term with N ln N ≈ 5.3 × 10²⁴.'],
      teach: 'For huge N keep N ln N − N and drop the logarithmic correction.',
      explain: t`$N\ln N \approx 5.3\times10^{24}$, $N = 10^{23}$ (2%), $\tfrac12\ln(2\pi N) \approx ${fmt(corr, 3)}$ — a part in $10^{23}$.`,
      visual: { type: 'graph', params: { x: [0.5, 3.5], y: [0, 26], aspect: 'wide', xlabel: '', ylabel: 'log₁₀ of the term', xticks: 0, axesAt: 'edge', shade: [{ fn: String(r4(Math.log10(BIG * Math.log(BIG)))), from: 0.7, to: 1.3, color: 'accent', alpha: 0.6 }, { fn: '23', from: 1.7, to: 2.3, color: 'gold', alpha: 0.6 }, { fn: String(r4(Math.log10(corr))), from: 2.7, to: 3.3, color: 'violet', alpha: 0.6 }], points: [{ x: 1, y: 25.5, r: 0.01, color: 'accent', label: 'N ln N', labelDx: -20 }, { x: 2, y: 23.8, r: 0.01, color: 'gold', label: 'N', labelDx: -4 }, { x: 3, y: 2.6, r: 0.01, color: 'violet', label: '½ ln(2πN)', labelDx: -28 }] }, caption: 'The three terms for N = 10²³, as powers of ten (a log scale: each unit is a factor of 10).' },
    }),
    mcq({
      id: 'factor-vs-log', difficulty: 3,
      prompt: t`For $N = 10^{23}$, the crude formula $N! \approx N^N e^{-N}$ (whose log is $N\ln N - N$) is wrong by a factor of $\sqrt{2\pi N} \approx 8\times10^{11}$. Is it still useful?`,
      choices: [
        t`Yes: $N!$ is about $10^{2.3\times10^{24}}$, so a factor of $10^{12}$ changes its logarithm by a part in $10^{23}$`,
        'No: an error of a trillion times makes it useless',
        'Only if the factor is first divided out, which needs the exact value',
        'Yes, because the error cancels whenever two factorials are divided',
      ],
      answer: 0,
      why: { 1: 'A trillion is tiny next to a number with 10²⁴ digits; everything physical comes from the logarithm.', 2: 'No exact value is needed: the logarithm is accurate to a part in 10²³ as it stands.', 3: 'It does partly cancel in ratios, but that is not why it is harmless — its size relative to ln N! is.' },
      hints: ['Everything physical is built from the logarithm of a multiplicity, not the multiplicity itself.', t`Compare $\ln(8\times10^{11}) \approx 27$ with $\ln N! \approx 5\times10^{24}$.`],
      teach: t`Schroeder’s “very large numbers”: multiplying one by a merely large number leaves its logarithm unchanged.`,
      explain: t`$\ln N! \approx ${texNum(bigLn, 3)}$; the missing factor adds only $${fmt(corr, 3)}$. Entropy is $k\ln\Omega$, so it is the logarithm that matters.`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 1], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0.6', lower: '0.45', from: 0.05, to: 0.95, color: 'accent', alpha: 0.5 }, { fn: '0.6', lower: '0.45', from: 0.95, to: 0.951, color: 'gold', alpha: 1 }], points: [{ x: 0.05, y: 0.75, r: 0.01, color: 'accent', label: 'ln N! ≈ 5.2 × 10²⁴ (the whole bar)', labelDx: 0 }, { x: 0.95, y: 0.3, r: 0.01, color: 'gold', label: 'the error, about 27: far thinner than a pixel', labelDx: -260 }] }, caption: 'ln N! for N = 10²³ drawn as a bar; on this scale the error of the crude formula could not be drawn even one pixel wide.' },
    }),
    num({
      id: 'binom-log', difficulty: 3,
      prompt: t`Estimate $\log_{10}\binom{1000}{500}$ using Stirling’s formula with its $\tfrac12\ln(2\pi N)$ correction for each factorial. (It simplifies to $\ln\binom{2n}{n} \approx 2n\ln2 - \tfrac12\ln(\pi n)$.)`,
      answer: lnChoose(1000, 500) / LN10, tol: { rel: 0.002 },
      errors: [{ value: 1000 * Math.log10(2), feedback: t`That is $\log_{10}2^{1000}$: you kept only the leading terms. The $-\tfrac12\ln(\pi n)$ lowers it by about 1.4.` }, { value: lnChoose(1000, 500), feedback: 'That is the natural log; divide by ln 10.' }],
      hints: [t`$\ln\binom{1000}{500} \approx 1000\ln2 - \tfrac12\ln(500\pi)$.`, t`$= 693.147 - 3.68$; then divide by $\ln10$.`],
      teach: t`$\binom{2n}{n} \approx 2^{2n}/\sqrt{\pi n}$: the middle coefficient is $2^{2n}$ shrunk by only $\sqrt{\pi n}$.`,
      explain: t`$\ln\binom{1000}{500} \approx 693.147 - ${fmt(0.5 * Math.log(500 * Math.PI), 3)} = ${fmt(lnChoose(1000, 500), 6)}$, so $\log_{10} = ${fmt(lnChoose(1000, 500) / LN10, 5)}$: $\binom{1000}{500} \approx 2.7\times10^{299}$.`,
      visual: { type: 'graph', params: { x: [0, 1000], y: [0, 1.15], aspect: 'wide', xlabel: 'n (spins up, of 1000)', ylabel: 'log C(1000, n), relative', yticks: 0, axesAt: 'edge', curves: [{ fn: '((1000*ln(1000) - x*ln(x) - (1000-x)*ln(1000-x)))/(1000*ln(2))', domain: [0.5, 999.5], color: 'accent' }], vlines: [{ x: 500, label: 'n = 500', color: 'gold' }] }, caption: 'ln C(1000, n) against n, in Stirling’s leading approximation, scaled so the axis carries no numbers.' },
    }),
    code({
      id: 'code-stirling', difficulty: 2,
      prompt: t`\`math.lgamma(N + 1)\` returns $\ln N!$ exactly (to double precision) without ever forming $N!$. Write \`rel_error(N)\` returning the relative error of $N\ln N - N$, that is $(\ln N! - (N\ln N - N))/\ln N!$, and print it for $N = 10, 100, 1000, 10^6$.`,
      starter: t`from math import lgamma, log

def rel_error(N):
    exact = lgamma(N + 1)
    # return (exact - approximation) / exact
    pass

for N in [10, 100, 1000, 10**6]:
    print(N, rel_error(N))
`,
      answer: t`from math import lgamma, log

def rel_error(N):
    exact = lgamma(N + 1)
    approx = N * log(N) - N
    return (exact - approx) / exact

for N in [10, 100, 1000, 10**6]:
    print(N, rel_error(N))`,
      tests: [
        { name: 'N = 10: about 13.8%', code: 'abs(rel_error(10) - 0.13761) < 1e-4' },
        { name: 'N = 100: about 0.886%', code: 'abs(rel_error(100) - 0.0088590) < 1e-6' },
        { name: 'the error keeps falling with N', code: 'rel_error(10**6) < rel_error(1000) < rel_error(100)' },
        { name: 'the program prints four lines', code: 'len(_stdout.strip().splitlines()) == 4' },
      ],
      hints: [t`\`approx = N * log(N) - N\` (\`log\` is the natural log in Python).`, t`\`return (exact - approx) / exact\`.`],
      teach: 'lgamma gives logs of huge factorials directly — the computer’s version of Stirling.',
      explain: t`The relative error falls roughly like $\ln(2\pi N)/(2N\ln N)$: 14% at 10, 0.9% at 100, 0.07% at 1000 and about $6\times10^{-7}$ at a million.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-telemetry', difficulty: 3, transfer: true,
      prompt: t`A spacecraft downlinks 40 distinct telemetry packets in a shuffled order and must also send the order itself. The minimum number of bits needed is $\log_2 40!$. Estimate it with Stirling’s formula, including $\tfrac12\ln(2\pi N)$.`,
      answer: stirling2(40) / Math.LN2, tol: { rel: 0.005 },
      errors: apart([{ value: stirling(40) / Math.LN2, feedback: 'At N = 40 the ½ ln(2πN) correction is worth about 4 bits: include it.' }, { value: stirling2(40), feedback: 'That is ln 40!, in nats; divide by ln 2 for bits.' }], stirling2(40) / Math.LN2),
      hints: [t`$\ln 40! \approx 40\ln40 - 40 + \tfrac12\ln(80\pi)$.`, t`Bits: divide the natural log by $\ln 2$.`],
      teach: 'Specifying one of Ω equally likely arrangements takes log₂ Ω bits — the information-theory face of entropy.',
      explain: t`$\ln 40! \approx 147.555 - 40 + 2.761 = ${fmt(stirling2(40), 6)}$; $\div \ln 2$: $${fmt(stirling2(40) / Math.LN2, 5)}$ bits (exact: $${fmt(lnFact(40) / Math.LN2, 5)}$), so 160 bits suffice.`,
      visual: lnPic(40, 'ln N! and Stirling’s leading terms; N = 40 marked. Bits are this logarithm divided by ln 2.'),
    }),
    mcq({
      id: 'cp-derivative', difficulty: 2,
      prompt: t`Later lessons differentiate $\ln N!$ with respect to $N$ (treating $N$ as continuous). Using Stirling, $\dfrac{d}{dN}\ln N! \approx$`,
      choices: [t`$\ln N$`, t`$\ln N - 1$`, t`$N\ln N$`, t`$1/N$`],
      answer: 0,
      why: { 1: t`The product rule gives $\ln N + N\cdot\frac1N = \ln N + 1$; the $-N$ then contributes $-1$.`, 2: 'That is ln N! itself, roughly, not its derivative.', 3: t`That is the derivative of $\ln N$, not of $N\ln N - N$.` },
      hints: [t`Differentiate $N\ln N - N$ with the product rule.`],
      teach: t`$\frac{d}{dN}(N\ln N - N) = \ln N$: adding one particle multiplies $N!$ by about $N$.`,
      explain: t`$\frac{d}{dN}(N\ln N - N) = \ln N + 1 - 1 = \ln N$ — consistent with $\ln (N+1)! - \ln N! = \ln(N+1)$.`,
      visual: lnPic(null, 'ln N! and N ln N − N: the slope of either curve at N is about ln N.'),
    }),
    num({
      id: 'cp-correction', difficulty: 2,
      gen(r) {
        const k = r.int(4, 9), N = 10 ** k, v = 0.5 * Math.log(2 * Math.PI * N);
        return {
          prompt: t`For $N = 10^{${k}}$, by how much does $\ln N!$ exceed $N\ln N - N$? (Use the next term of Stirling’s series.)`,
          answer: v, tol: { rel: 0.01 },
          errors: [{ value: Math.log(2 * Math.PI * N), feedback: 'The correction has a factor ½ in front.' }],
          hints: [t`The next term is $\tfrac12\ln(2\pi N)$.`],
          teach: t`$\ln N! - (N\ln N - N) \approx \tfrac12\ln(2\pi N)$, which grows only logarithmically.`,
          explain: t`$\tfrac12\ln(2\pi\times10^{${k}}) = ${fmt(v, 4)}$ — next to $N\ln N - N \approx ${texNum(stirling(N), 3)}$.`,
          visual: lnPic(null, 'The gap between ln N! and N ln N − N grows, but only like ½ ln N.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §2.4 and Appendix B.3', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Digital Library of Mathematical Functions, §5.11 (Stirling’s series)', url: 'https://dlmf.nist.gov/5.11' },
  ],
});
