// The MATH 1220 boss: a deep-space probe whose flight computer can only add
// and multiply. Convergence verdicts, Taylor polynomials with guaranteed
// error bounds, integrals that need the right technique, and two
// applications (a polar area and the work to empty a tank) — each item tagged
// with the lesson whose skill it measures.
import { boss, mcq, multi, num, match } from '../../src/core/content.js';
import { nice, fmt, tex as texNum } from '../../src/core/format.js';

const t = String.raw;
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const C_KMS = 299792.458;   // speed of light, km/s

export default boss({
  title: 'The Infinite Series Challenge',
  intro: t`A deep-space probe is three years out from Earth. Its flight computer can only add, multiply and compare, so every function it uses — every trajectory, burn and fuel estimate — has to be built from sums it can trust. You are the mission’s mathematician: decide which sums exist, how many terms are enough, and which integrals the ground team can do exactly. Four rounds, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Does the sum exist?',
      story: t`The navigation software is handed infinite series to total. Before you trust any total, decide whether it exists — and when it does, what it is.`,
      items: [
        multi({
          id: 'r1-verdicts', skill: 'math1220.C2-4.9', difficulty: 3,
          prompt: t`Which of these series converge? Select all that do.`,
          choices: [
            t`$\displaystyle\sum_{n=1}^\infty \frac{n}{n^2 + 1}$`,
            t`$\displaystyle\sum_{n=1}^\infty \frac{3^n}{n!}$`,
            t`$\displaystyle\sum_{n=1}^\infty \frac{(-1)^n}{\sqrt n}$`,
            t`$\displaystyle\sum_{n=2}^\infty \frac{1}{n\ln n}$`,
            t`$\displaystyle\sum_{n=1}^\infty \frac{n^2}{2^n}$`,
            t`$\displaystyle\sum_{n=1}^\infty \cos\frac{1}{n}$`,
          ],
          answer: [1, 2, 4],
          why: {
            0: t`Its terms behave like $\frac1n$: limit comparison with the harmonic series — diverges.`,
            3: t`Integral test: $\int_2^\infty \frac{dx}{x\ln x} = \big[\ln\ln x\big]_2^\infty = \infty$ — diverges, very slowly.`,
            5: t`The terms tend to $\cos 0 = 1$, not $0$: the divergence test settles it.`,
          },
          hints: ['Start with the divergence test, then match the shape of each term to a test.', t`Factorials and powers $c^n$: ratio test. Alternating signs: alternating series test. Powers of $n$: compare with a p-series. $\frac{1}{n\ln n}$: integral test.`],
          teach: 'The shape of the terms picks the test: ratio for factorials and exponentials, comparison for powers of n, the alternating series test for alternating signs.',
          explain: t`$\frac{3^n}{n!}$: ratio test, $L = 0$. $\frac{(-1)^n}{\sqrt n}$: alternating, terms decrease to $0$ — converges (conditionally). $\frac{n^2}{2^n}$: ratio test, $L = \tfrac12$. The other three diverge: like $\frac1n$; by the integral test; and with terms that tend to $1$.`,
        }),
        num({
          id: 'r1-burns', skill: 'math1220.C2-4.3', difficulty: 2,
          gen(r) {
            const a = r.pick([4, 6, 12]), q = r.pick([0.6, 0.75, 0.8, 0.9]), S = a / (1 - q);
            return {
              prompt: t`To hold its station, the probe fires a sequence of correction burns. The first changes its velocity by ${a} cm/s, and each later burn is ${q} times the one before. If the sequence continued for ever, what would the total velocity change be?`,
              answer: S, units: 'cm/s', tol: { rel: 0.005 },
              errors: [{ value: (a * q) / (1 - q), feedback: t`That leaves out the first burn: the sum starts with ${a}, so it is $\frac{${a}}{1 - ${q}}$.` }],
              hints: [t`A geometric series with first term $a = ${a}$ and ratio $r = ${q}$.`, t`$\sum_{n=0}^\infty ar^n = \dfrac{a}{1 - r}$ for $|r| < 1$.`],
              teach: 'A geometric series with |r| < 1 sums to (first term)/(1 − r).',
              explain: t`$\dfrac{${a}}{1 - ${q}} = ${nice(S)}$ cm/s.`,
              visual: { type: 'calc-series', params: { view: 'sums', term: `${a}*${q}^(n-1)`, N: 6, x: [0, 7] }, caption: 'The first six burns (bars) and the running total (dots). The question is where the dots would level off.' },
            };
          },
        }),
        num({
          id: 'r1-alternating', skill: 'math1220.C2-4.7', difficulty: 3,
          gen(r) {
            const p = r.pick([2, 3]), [tol, tolT] = r.pick([[1e-3, '10^{-3}'], [1e-4, '10^{-4}']]);
            let N = 0;
            while (!(1 / (N + 1) ** p < tol)) N++;
            return {
              prompt: t`The computer sums $\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{n^${p}}$ term by term. What is the smallest number of terms $N$ for which the alternating series bound guarantees $|S - S_N| < ${tolT}$?`,
              answer: N, tol: { rel: 0, abs: 0.01 },
              errors: [{ value: N + 1, feedback: t`That makes $b_N$ small enough, but the bound uses the first term left out, $b_{N+1}$ — one term fewer suffices.` }],
              hints: [t`$|S - S_N| \le b_{N+1} = \dfrac{1}{(N+1)^${p}}$.`, t`Solve $(N+1)^${p} > ${tol === 1e-3 ? '1000' : '10\\,000'}$ for the smallest whole $N$.`],
              teach: 'For an alternating series that passes the test, the error after N terms is at most the first omitted term.',
              explain: t`$b_{${N + 1}} = ${texNum(1 / (N + 1) ** p, 3)} < ${tolT}$, while $b_{${N}} = ${texNum(1 / N ** p, 3)}$ is not, so $N = ${N}$.`,
              visual: { type: 'graph', params: { x: [1, Math.ceil(1.5 * (N + 1))], y: [Math.log10(tol) - 1, 0.3], xlabel: 'n', ylabel: 'log₁₀ bₙ', curves: [{ fn: `-${p}*log10(x)`, color: 'accent' }], hlines: [{ y: Math.log10(tol), label: 'tolerance', color: 'gold' }] }, caption: t`The size of the $n$-th term on a logarithmic scale.` },
            };
          },
        }),
      ],
    },
    {
      title: 'Polynomials in the flight computer',
      story: t`The computer evaluates cosines, exponentials and the relativistic clock correction with polynomials. How good are they — guaranteed?`,
      items: [
        num({
          id: 'r2-lagrange', skill: 'math1220.C2-5.5', difficulty: 3,
          gen(r) {
            const b = r.pick([0.3, 0.5, 0.8]), B = b ** 5 / 120;
            return {
              prompt: t`The attitude software uses $\cos\theta \approx P_4(\theta) = 1 - \dfrac{\theta^2}{2} + \dfrac{\theta^4}{24}$ for $|\theta| \le ${b}$ rad. Using the Lagrange remainder with $n = 4$ and $M = 1$, what is the guaranteed bound on the error?`,
              answer: B, tol: { rel: 0.01 },
              errors: [{ value: b ** 4 / 24, feedback: t`That uses the $n$-th term. The remainder after degree $4$ involves the 5th derivative: $\dfrac{M}{5!}|\theta|^5$.` }],
              hints: [t`$|R_4(\theta)| \le \dfrac{M}{5!}|\theta|^5$, and every derivative of $\cos$ is at most $1$ in size.`, t`Evaluate $\dfrac{${b}^5}{120}$.`],
              teach: 'The Lagrange bound after degree n is M|x − a|^(n+1)/(n+1)!, with M bounding the (n+1)-th derivative.',
              explain: t`$\dfrac{${b}^5}{120} = ${texNum(B, 3)}$. The true worst error is smaller still (about $${texNum(Math.abs(Math.cos(b) - (1 - b * b / 2 + b ** 4 / 24)), 2)}$), because the $\theta^5$ term of the series is zero.`,
              visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-0.8, 1.3], curves: [{ fn: 'cos(x)', color: 'ink3', width: 1.6 }, { fn: '1 - x^2/2 + x^4/24', color: 'gold' }], vlines: [{ x: -b }, { x: b, label: `±${b}` }] }, caption: t`$\cos\theta$ (grey) and $P_4$ (gold): indistinguishable inside $|\theta| \le ${b}$.` },
            };
          },
        }),
        num({
          id: 'r2-degree', skill: 'math1220.C2-5.5', difficulty: 3,
          gen(r) {
            const [tol, k] = r.pick([[1e-4, 4], [1e-5, 5], [1e-6, 6]]);
            let n = 0;
            while (!(3 / fact(n + 1) < tol)) n++;
            const pts = Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: Math.log10(3 / fact(i + 1)), color: 'violet', r: 4 }));
            return {
              prompt: t`The computer evaluates $e^x$ for $0 \le x \le 1$ with a Maclaurin polynomial of degree $n$. Taking $M = 3$ (because $e^c < 3$ there), what is the smallest $n$ for which the Lagrange bound guarantees an error below $10^{-${k}}$?`,
              answer: n, tol: { rel: 0, abs: 0.01 },
              errors: [{ value: n + 1, feedback: t`It looks as if you bounded with $\dfrac{3}{n!}$. After degree $n$ the bound is $\dfrac{3}{(n+1)!}$.` }],
              hints: [t`You need $\dfrac{3}{(n+1)!} < 10^{-${k}}$, i.e. $(n+1)! > 3\times10^{${k}}$.`, 'Tabulate factorials: 7! = 5040, 8! = 40 320, 9! = 362 880, 10! = 3 628 800.'],
              teach: 'To choose a degree, find the first n whose Lagrange bound drops below the tolerance.',
              explain: t`$(n+1)! > 3\times10^{${k}}$ first holds at $n + 1 = ${n + 1}$ ($${n + 1}! = ${fact(n + 1)}$), so $n = ${n}$.`,
              visual: { type: 'graph', params: { x: [0, 13], y: [-9, 0.8], xlabel: 'm = n + 1', ylabel: '', points: pts, hlines: [{ y: -k, label: `10⁻${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]}`, color: 'warn' }] }, caption: t`$\log_{10}$ of the bound $3/m!$ against $m = n + 1$. Points under the dashed line meet the tolerance.` },
            };
          },
        }),
        num({
          id: 'r2-clock', skill: 'math1220.C2-5.7', difficulty: 3,
          gen(r) {
            const [name, v] = r.pick([['Voyager 1, receding at about 17.0 km/s,', 17.0], ['a probe on Earth-escape speed, 11.2 km/s,', 11.2]]);
            const beta = v / C_KMS, g1 = (beta * beta) / 2;
            return {
              prompt: t`The ground station corrects the clock of ${name} for time dilation, which needs $\gamma - 1$, where $\gamma = (1 - \beta^2)^{-1/2}$ and $\beta = v/c$ with $c = 299\,792$ km/s. Subtracting $1$ from a computed $\gamma$ would lose most of the digits, so use the first term of the binomial series instead. What is $\gamma - 1$? Give 3 significant figures.`,
              answer: g1, tol: { rel: 0.005 },
              errors: [{ value: beta * beta, feedback: t`$(1 - \beta^2)^{-1/2} \approx 1 + \tfrac12\beta^2$: keep the factor $\tfrac12$.` }, { value: beta / 2, feedback: t`Square $\beta$: the series is in powers of $\beta^2$.` }],
              hints: [t`$(1 + u)^{k} \approx 1 + ku$ with $u = -\beta^2$ and $k = -\tfrac12$.`, t`$\gamma - 1 \approx \tfrac12\beta^2$ with $\beta = ${texNum(beta, 4)}$.`],
              teach: 'For small β the binomial series gives γ ≈ 1 + β²/2, so γ − 1 ≈ β²/2 without catastrophic cancellation.',
              explain: t`$\beta = ${texNum(beta, 4)}$, so $\gamma - 1 \approx \tfrac12\beta^2 = ${texNum(g1, 3)}$: its clock loses about ${fmt(g1 * 86400 * 1e6, 2)} μs a day to its speed alone. The next term, $\tfrac38\beta^4$, is smaller by another factor of about $10^{9}$.`,
              visual: { type: 'graph', params: { x: [0, 0.75], y: [0, 0.55], xlabel: 'β = v/c', ylabel: 'γ − 1', curves: [{ fn: '1/sqrt(1 - x^2) - 1', color: 'accent', label: 'γ − 1', labelAt: 0.66 }, { fn: 'x^2/2', color: 'gold', dash: true, label: 'β²/2', labelAt: 0.7, labelDy: 14 }] }, caption: t`$\gamma - 1$ and its first binomial term. They part company only at large speeds; at the probe’s $\beta \approx ${texNum(beta, 2)}$ they agree to many digits.` },
            };
          },
        }),
      ],
    },
    {
      title: 'Integrals the ground team can do',
      story: t`Thrust curves and orbit models arrive as integrals. Each yields — to the right technique.`,
      items: [
        match({
          id: 'r3-technique', skill: 'math1220.C2-2.8', difficulty: 2,
          prompt: t`Match each integral with the technique that finishes it.`,
          left: [t`$\displaystyle\int x\,e^{x^2}\,dx$`, t`$\displaystyle\int x^2 e^{x}\,dx$`, t`$\displaystyle\int \frac{dx}{x^2 - 4}$`, t`$\displaystyle\int \frac{dx}{x^2\sqrt{x^2 + 4}}$`],
          right: [t`substitution $u = x^2$`, 'integration by parts, twice', 'partial fractions', t`trigonometric substitution $x = 2\tan\theta$`],
          answer: [0, 1, 2, 3],
          hints: ['Look for an inside function whose derivative is also present; then for a product of unrelated factors; then for a factorable denominator; then for √(x² + a²).'],
          teach: 'Substitution when the derivative of an inside function is present, parts for products of unrelated factors, partial fractions for factorable rational functions, trig substitution for √(a² ± x²).',
          explain: t`$x\,dx = \tfrac12\,d(x^2)$; $x^2e^x$ needs parts twice to bring $x^2$ down to a constant; $x^2 - 4 = (x - 2)(x + 2)$ splits into partial fractions; $\sqrt{x^2 + 4}$ becomes $2\sec\theta$ with $x = 2\tan\theta$.`,
        }),
        num({
          id: 'r3-impulse', skill: 'math1220.C2-2.1', difficulty: 2,
          gen(r) {
            const A = r.pick([5, 8, 12]), T = r.pick([2, 3, 4]), I = A * (1 - (T + 1) * Math.exp(-T));
            return {
              prompt: t`A thruster’s output rises and decays as $F(t) = ${A}\,t\,e^{-t}$ newtons for $0 \le t \le ${T}$ s, then shuts off. Find the total impulse $\displaystyle\int_0^{${T}} F(t)\,dt$. Give 3 significant figures.`,
              answer: I, units: 'N s', tol: { rel: 0.005 },
              errors: [{ value: A * (1 - (1 - T) * Math.exp(-T)), feedback: t`Check the sign in $uv - \int v\,du$: with $u = t$ and $v = -e^{-t}$, the antiderivative is $-te^{-t} - e^{-t}$.` }],
              hints: [t`Integrate by parts with $u = t$, $dv = e^{-t}\,dt$.`, t`$\int te^{-t}\,dt = -te^{-t} - e^{-t} + C$.`],
              teach: 'For a polynomial times an exponential, integrate by parts with u the polynomial.',
              explain: t`$${A}\left[-te^{-t} - e^{-t}\right]_0^{${T}} = ${A}\left(1 - ${T + 1}e^{-${T}}\right) \approx ${fmt(I)}$ N s.`,
              visual: { type: 'graph', params: { x: [-0.2, T + 0.8], y: [-0.1 * A, 0.5 * A], xlabel: 't (s)', ylabel: 'F (N)', curves: [{ fn: `${A}*x*exp(-x)`, color: 'accent', domain: [0, T] }], shade: [{ fn: `${A}*x*exp(-x)`, from: 0, to: T, color: 'accent', alpha: 0.25 }] }, caption: 'The thrust curve; the impulse is the shaded area.' },
            };
          },
        }),
        num({
          id: 'r3-improper', skill: 'math1220.C2-2.11', difficulty: 3,
          gen(r) {
            const a = r.pick([1, 2, 3]), V = Math.log((a + 1) / a);
            return {
              prompt: t`An orbit model needs $\displaystyle\int_{${a}}^\infty \frac{dx}{x(x + 1)}$. It converges. Find its value to 3 significant figures.`,
              answer: V, tol: { rel: 0.005 },
              errors: [{ value: 1 / a, feedback: t`That is the **series** $\sum_{n=${a}}^\infty \frac{1}{n(n+1)}$, which telescopes to $\frac{1}{${a}}$. The integral is a different number.` }],
              hints: [t`Partial fractions: $\dfrac{1}{x(x + 1)} = \dfrac1x - \dfrac{1}{x + 1}$.`, t`$\displaystyle\int_{${a}}^b \left(\frac1x - \frac1{x+1}\right)dx = \Big[\ln\frac{x}{x+1}\Big]_{${a}}^b$; let $b \to \infty$.`],
              teach: 'Evaluate an improper integral as a limit of ordinary integrals; partial fractions first when the integrand is rational.',
              explain: t`$\Big[\ln\frac{x}{x+1}\Big]_{${a}}^b = \ln\frac{b}{b+1} - \ln\frac{${a}}{${a + 1}} \to 0 + \ln\frac{${a + 1}}{${a}} \approx ${fmt(V)}$.`,
              visual: { type: 'graph', params: { x: [a - 0.5, a + 9], y: [-0.05, 1 / (a * (a + 1)) * 1.3], curves: [{ fn: '1/(x*(x + 1))', color: 'accent', domain: [a - 0.4, a + 9] }], shade: [{ fn: '1/(x*(x + 1))', from: a, to: a + 9, color: 'accent', alpha: 0.25 }] }, caption: 'The integrand, with the area from the lower limit shaded as far as the plot goes; the area continues to infinity but stays finite.' },
            };
          },
        }),
      ],
    },
    {
      title: 'Coverage and fuel',
      story: t`Two last numbers for the mission plan: the ground area the probe’s antenna covers, and the energy needed to empty a propellant tank on the test stand.`,
      items: [
        num({
          id: 'r4-coverage', skill: 'math1220.C2-6.4', difficulty: 2,
          gen(r) {
            const a = r.pick([8, 10, 12, 15]), A = 1.5 * Math.PI * a * a;
            return {
              prompt: t`Around a ground station, the region where the antenna’s signal is strong enough is bounded by the cardioid $r = ${a}(1 + \cos\theta)$ km, with the station at the pole. What area does it cover? Give 3 significant figures.`,
              answer: A, units: 'km^2', tol: { rel: 0.005 },
              errors: [{ value: 2 * A, feedback: t`Remember the $\tfrac12$ in $A = \tfrac12\int r^2\,d\theta$.` }, { value: 2 * Math.PI * a, feedback: t`That is $\int r\,d\theta$, which has units of length. Area needs $\tfrac12\int r^2\,d\theta$.` }],
              hints: [t`$A = \tfrac12\displaystyle\int_0^{2\pi} ${a * a}(1 + \cos\theta)^2\,d\theta$.`, t`$\int_0^{2\pi}(1 + \cos\theta)^2\,d\theta = 2\pi + 0 + \pi = 3\pi$.`],
              teach: 'Polar area: A = ½∫r² dθ over one tracing of the curve.',
              explain: t`$A = \tfrac12\cdot${a * a}\cdot 3\pi = \tfrac{${3 * a * a}\pi}{2} \approx ${fmt(A)}$ km².`,
              visual: { type: 'calc-polar', params: { grid: 'polar', aspect: 'wide', x: [-0.6 * a, 2.3 * a], y: [-1.45 * a, 1.45 * a], rstep: a >= 10 ? 5 : 4, fills: [{ polar: `${a}*(1 + cos(theta))`, theta: [0, '2*pi'], color: 'accent', alpha: 0.22 }], curves: [{ polar: `${a}*(1 + cos(theta))`, theta: [0, '2*pi'], color: 'accent' }], points: [{ x: 0, y: 0, color: 'gold', size: 6, label: 'station', labelDx: -60, labelDy: 0 }] }, caption: `The coverage region, rings ${a >= 10 ? 5 : 4} km apart. Real antenna patterns are measured, not exact cardioids — this one is idealised.` },
            };
          },
        }),
        num({
          id: 'r4-pump', skill: 'math1220.C2-1.6', difficulty: 3,
          gen(r) {
            const R = r.pick([0.8, 1, 1.2]), H = r.pick([2, 3, 4]), rho = 810, g = 9.8;
            const W = (rho * g * Math.PI * R * R * H * H) / 2 / 1000;
            const y0 = 0.35 * H;
            return {
              prompt: t`An upright cylindrical tank of radius ${R} m and height ${H} m is full of RP-1 kerosene (density about $810$ kg/m³). How much work does it take to pump all of it out over the top rim? Use $g = 9.8$ m/s² and give the answer in kJ to 3 significant figures.`,
              answer: W, units: 'kJ', tol: { rel: 0.005 },
              errors: [
                { value: 2 * W, feedback: 'Not every layer rises the full height: a layer at height y rises only H − y. Integrate.' },
                { value: W / g, feedback: t`Weight is mass times $g$: include $g = 9.8$ m/s².` },
              ],
              hints: [t`A thin layer at height $y$ has volume $\pi(${R})^2\,dy$ and must rise $${H} - y$ metres.`, t`$W = \displaystyle\int_0^{${H}} 810\cdot 9.8\cdot\pi(${R})^2\,(${H} - y)\,dy$.`],
              teach: 'Pumping work: slice the liquid into layers, each lifted its own distance, and integrate ρg·(area)·(distance) dy.',
              explain: t`$W = 810\cdot9.8\cdot\pi(${R})^2\cdot\dfrac{${H}^2}{2} \approx ${texNum(W * 1000, 4)}$ J $\approx ${fmt(W)}$ kJ — the same as lifting the whole mass by half the tank’s height, to where its centre of mass sits.`,
              visual: {
                type: 'calc-polar',
                params: {
                  grid: 'cartesian', aspect: 'wide', x: [-2.2 * R, 2.2 * R], y: [-0.3, H + 0.6], xlabel: 'x (m)', ylabel: 'y (m)',
                  fills: [{ fn: `${H}`, lower: '0', from: -R, to: R, color: 'accent', alpha: 0.14 }, { fn: `${y0 + 0.08 * H}`, lower: `${y0}`, from: -R, to: R, color: 'gold', alpha: 0.7 }],
                  segments: [{ from: [-R, 0], to: [-R, H], color: 'ink2' }, { from: [R, 0], to: [R, H], color: 'ink2' }, { from: [-R, 0], to: [R, 0], color: 'ink2' }],
                  arrows: [{ from: [1.3 * R, y0 + 0.04 * H], to: [1.3 * R, H], color: 'warn', label: `${H} − y`, labelDx: 8, labelDy: 10 }],
                },
                caption: 'Cross-section of the tank. The gold layer at height y is lifted H − y to the rim.',
              },
            };
          },
        }),
      ],
    },
  ],
});
