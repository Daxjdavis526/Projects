// The muon lifetime — the lab view: cosmic-ray muons that stop in a plastic
// scintillator and decay, the time between the two flashes histogrammed,
// and N(t) = A e^(−t/τ) + B fitted by binned Poisson maximum likelihood.
// Two honest complications: afterpulsing (a systematic of the photomultiplier
// that fakes early decays, removed by starting the fit at 1 μs and visible in
// the residuals), and physics — negative muons captured by carbon nuclei
// disappear faster, so a sea-level μ⁺/μ⁻ mix gives about 2.12 μs, not the
// free muon's 2.1969811 μs (PDG). Counting statistics (σ_τ ≈ τ/√N), how
// many events a question needs, and a muon storage ring as the transfer.
// Theory: phys3710.R4.1, phys2710.MP2.2. Every number is computed here from
// the seeded model the labg-rig simulation draws with (_labg.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { G, rig, pmT, resT, f, tex, zT, SIMNOTE, SRC } from './_labg.js';
import { r6 } from './_labf.js';

const t = String.raw;
const TAU = G.K.tauMu, TAUC = G.K.tauMuC;
const MIX = G.muMixTau(1.0);

// ── the worked example: seed 4, afterpulsing present, 4000 events ──
const EXa = G.run('muon', { seed: 4, analysis: 'all' });
const EXc = G.run('muon', { seed: 4, analysis: 'cut' });
const Ra = EXa.results[0], Rc = EXc.results[0];

// ── the code exercise: seed 11, 6000 events, no afterpulsing ──
const CR = G.run('muon', { seed: 11, analysis: 'all', flags: { afterpulse: false }, N: 6000 });
const CF = G.muFit(CR.edges, CR.counts, 0);

const expPic = (caption, extra = {}) => ({ type: 'graph', params: { aspect: 'wide', x: [0, 12], y: [0, 1.1], xlabel: 't (μs)', ylabel: 'fraction surviving', axesAt: 'edge', curves: [{ fn: `exp(-x/${TAU})`, color: 'accent' }], ...extra }, caption });

export default lesson({
  id: 'lab.E.15',
  title: 'The muon lifetime',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`Cosmic rays make muons high in the atmosphere, and enough survive to sea level — thanks to time dilation ([how we know](#/lesson/phys3710.R4.1)) — to stop in a block of plastic scintillator a few times a minute. A stopping muon makes one flash; when it decays, its electron makes a second. The delays between the two follow the decay law, plus a flat floor of accidental coincidences:

$$N(t) = N_0\,e^{-t/\tau} + B$$

Histogram a few thousand delays and fit. The counts in each bin are Poisson, many of them small, so the fit maximizes the **Poisson likelihood** rather than a χ² with $\sqrt n$ error bars. And the answer is not quite the free muon’s lifetime: **a negative muon can be captured by a carbon nucleus**, so μ⁻ disappear faster than μ⁺, and the mix at sea level gives a shorter mean.`,
  symbols: [
    { tex: 'N(t)', text: 'the expected number of decays per bin at delay $t$' },
    { tex: 'N_0', text: 'the decay curve’s height at $t = 0$, per bin' },
    { tex: 't', text: 'the delay between the stop flash and the decay flash, in μs' },
    { tex: '\\tau', text: 'the lifetime: 2.196 981 1 μs for a free muon (PDG); 2.026 μs for a μ⁻ bound to carbon (Suzuki et al. 1987)' },
    { tex: 'B', text: 'the flat background per bin: unrelated particles arriving at random inside the timing window' },
  ],
  why: t`The muon lifetime fixes the strength of the weak interaction (the Fermi constant), and it is the classic proof that moving clocks run slow — muons are relativity you can count on a lab bench.`,
  visual: {
    type: 'labg-rig',
    title: 'The bench: stopped cosmic-ray muons in a scintillator',
    lead: t`The top panel is the histogram of decay delays in 0.25 μs bins with the fitted curve. Below: the counts on a log scale, where an exponential is a straight line, and the residuals in units of σ. The readout compares $\tau$ with the free muon’s lifetime and with what the μ⁺/μ⁻ mix should give.`,
    tasks: [
      'With afterpulsing on, fit every bin: τ drops to about 1.95 μs, and the first residuals sit several σ high. Switch to “Fit from 1 μs”: the early excess is excluded and τ returns near 2.1.',
      'Slide N from 4000 to 40 000 events: σ of τ shrinks as 1/√N, from about 0.05 to 0.017 μs — enough to see that τ sits below the free muon’s 2.197 μs, at the mix’s 2.12.',
      'Turn afterpulsing off and fit every bin: the two analyses now agree. Cutting early bins costs a little precision and buys protection.',
    ],
    params: { exp: 'muon', seed: 4 },
    caption: t`Simulated delays: muons with μ⁺/μ⁻ = 1.27 (approximate, for the momenta that stop), μ⁺ decaying with 2.197 μs and μ⁻ in carbon with 2.026 μs, 4 % accidental background, and afterpulses (5 % of events, within a few tenths of a μs) when switched on. Counts per bin are Poisson. ${SIMNOTE}`,
  },
  example: {
    prompt: t`Two days of running record 4000 stop–decay pairs. A Poisson fit of $N_0e^{-t/\tau} + B$ to every bin gives $\tau = ${resT(Ra)}$ μs with a Poisson $\chi^2/\nu = ${EXa.fit.chi2r.toFixed(2)}$ ($\nu = ${EXa.fit.dof}$) and the first bins’ residuals far off the curve. Starting the fit at 1.0 μs gives $\tau = ${resT(Rc)}$ μs, $\chi^2/\nu = ${EXc.fit.chi2r.toFixed(2)}$. What do you report, and how does it compare with the muon’s lifetime?`,
    visual: rig('muon', { seed: 4, analysis: 'all', raw: false }, t`The fit to every bin, on a log scale, with normalized residuals: the excess in the first bins is afterpulsing. ${SIMNOTE}`),
    steps: [
      { label: 'Read the residuals', text: t`A good fit leaves residuals scattered within about ±2σ. Here the first bin sits far above the curve and the next few scatter widely about it: extra counts at short delays, which the fit tries to absorb by shortening $\tau$ — and fails.` },
      { label: 'Name the cause', text: t`A photomultiplier sometimes fires again a few hundred nanoseconds after a big pulse — an afterpulse. It looks like a very early decay. It is a property of the tube, not of muons.` },
      { label: 'Cut', text: t`Fit only $t \ge 1.0$ μs, where afterpulses have died away. A cut does not bias an exponential: $e^{-t/\tau}$ has the same shape from any starting point. $\tau = ${resT(Rc)}$ μs, with $\chi^2/\nu = ${EXc.fit.chi2r.toFixed(2)}$.` },
      { label: 'Compare', text: t`Against the free muon’s 2.1970 μs: $z = ${zT(Rc.z)}$. Against the μ⁺/μ⁻ mix, $${MIX.toFixed(3)}$ μs: $z = ${zT((Rc.value - MIX) / Rc.sigma)}$. With 4000 events the two cannot be told apart.` },
      { label: 'Sense check', text: t`$\sigma_\tau \approx \tau/\sqrt N$: $2.1/\sqrt{4000} = ${(2.1 / Math.sqrt(4000)).toFixed(3)}$ μs; the fit’s $${Rc.sigma.toFixed(3)}$ is a little larger because the cut and the background cost information.` },
    ],
    answer: t`$\tau = ${resT(Rc)}$ μs (fit from 1 μs): consistent with the sea-level μ⁺/μ⁻ mix ($${MIX.toFixed(3)}$ μs) and, at this statistics, with the free muon. The all-bins $${resT(Ra)}$ μs is biased by afterpulsing.`,
  },
  practice: [
    num({
      id: 'survive', difficulty: 1,
      gen(r) {
        const tt = r.pick([1, 2, 3, 4, 5, 6, 8]);
        const ans = Math.exp(-tt / TAU);
        return {
          prompt: t`What fraction of stopped (free) muons are still undecayed ${tt} μs after stopping? ($\tau = 2.197$ μs.)`,
          visual: expPic('Survival of muons at rest; the gold line marks the time asked about.', { vlines: [{ x: tt, color: 'gold' }] }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(-tt * Math.LN2 / TAU), feedback: t`$\tau$ is the mean lifetime, not the half-life: the survival is $e^{-t/\tau}$.` }, { value: 1 - ans, feedback: 'That is the fraction that has decayed.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Survival is $e^{-t/\tau}$.`],
          teach: t`An exponential decay keeps $e^{-t/\tau}$ of the sample after a time $t$.`,
          explain: t`$e^{-${tt}/2.197} = ${ans.toFixed(4)}$. After 10 μs fewer than 1 % remain — the window of a muon-lifetime setup is usually 10–20 μs, and its far end measures the flat background.`,
        };
      },
    }),
    num({
      id: 'how-many', difficulty: 2,
      gen(r) {
        const pc = r.pick([0.5, 1, 2, 3, 5]);
        const ans = 1 / (pc / 100) ** 2;
        return {
          prompt: t`For a pure exponential with negligible background, a fit gives $\sigma_\tau \approx \tau/\sqrt N$. About how many decays must you record to measure $\tau$ to ${pc} %?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [2, 5.5], y: [-0.5, 1.5], xlabel: 'log₁₀ N', ylabel: 'log₁₀ (σ/τ in %)', axesAt: 'edge', curves: [{ fn: '2 - x/2', color: 'accent' }], hlines: [{ y: r6(Math.log10(pc)), color: 'gold' }] }, caption: 'The relative uncertainty of τ falls as 1/√N (log–log axes); the gold line is the precision asked for.' },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: 100 / pc, feedback: 'The uncertainty falls as 1/√N, so N grows as the square of the improvement.' }].filter((e) => Math.abs(e.value - ans) > 0.05 * ans),
          hints: [t`$\sigma_\tau/\tau = 1/\sqrt N$, so $N = (\tau/\sigma_\tau)^2$.`],
          teach: 'Counting precision costs the square: twice as good needs four times the events.',
          explain: t`$N = 1/(${pc / 100})^2 = ${ans.toFixed(0)}$ decays. At a few stopping muons a minute, ${ans >= 10000 ? 'that is weeks of running' : 'that is a day or two'} — the reason muon-lifetime setups run unattended.`,
        };
      },
    }),
    num({
      id: 'mix', difficulty: 3,
      gen(r) {
        const R = r.pick([1.15, 1.2, 1.25, 1.3, 1.35]);
        const fp = R / (1 + R), fm = 1 / (1 + R);
        const dm = fm * (TAUC / TAU);
        const ans = (fp * TAU + dm * TAUC) / (fp + dm);
        return {
          prompt: t`Stopping muons arrive with μ⁺/μ⁻ = ${R}. A μ⁺ decays with $\tau_+ = 2.1970$ μs. A μ⁻ caught by a carbon nucleus disappears with $\tau_- = 2.026$ μs, and only the fraction $\tau_-/\tau_+$ of them decay (the rest are captured, with no decay electron). What is the mean delay of the recorded decays?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0, 1.1], xlabel: 't (μs)', ylabel: 'decay-time density (scaled)', axesAt: 'edge', curves: [{ fn: `exp(-x/${TAU})`, color: 'accent', label: 'μ⁺', labelAt: 4, labelDy: -10 }, { fn: `${r6(TAU / TAUC)}*exp(-x/${TAUC})*${r6((dm / (fp + dm)) / (fp / (fp + dm)))}`, color: 'violet', label: 'μ⁻ in carbon', labelAt: 2.2, labelDy: 18 }] }, caption: 'The two populations’ decay-time densities, with their weights in the recorded events (illustrative heights).' },
          answer: ans, units: 'us', tol: { rel: 0.001 },
          errors: [{ value: fp * TAU + fm * TAUC, feedback: 'Captured μ⁻ leave no decay electron: weight the μ⁻ by the fraction that decay, τ₋/τ₊.' }, { value: TAU, feedback: 'That ignores the μ⁻ entirely.' }, { value: (TAU + TAUC) / 2, feedback: 'The two charges are not equally common, and captures remove some μ⁻ decays.' }].filter((e) => Math.abs(e.value - ans) > 0.0015 * ans),
          hints: [t`Weights: $f_+ = R/(1 + R)$ for μ⁺ and $f_-\tau_-/\tau_+$ for decaying μ⁻, with $f_- = 1/(1 + R)$.`, t`The mean delay is $(w_+\tau_+ + w_-\tau_-)/(w_+ + w_-)$.`],
          teach: 'A mixture of exponentials has a mean lifetime weighted by how many of each actually decay — physics, not error, pulls a sea-level measurement below the free muon’s.',
          explain: t`$w_+ = ${fp.toFixed(4)}$, $w_- = ${fm.toFixed(4)} \times ${(TAUC / TAU).toFixed(4)} = ${dm.toFixed(4)}$, mean $= ${ans.toFixed(4)}$ μs — about ${((1 - ans / TAU) * 100).toFixed(1)} % below 2.1970 μs. A fit of one exponential to the mix returns close to this mean.`,
        };
      },
    }),
    mcq({
      id: 'poisson', difficulty: 2,
      prompt: t`Beyond about 10 μs most bins hold 0 to 5 counts. Why fit by Poisson likelihood rather than by χ² with error bars $\sqrt{n_i}$?`,
      visual: rig('muon', { seed: 2, analysis: 'cut', data: false }, t`The histogram: thousands of counts in the first bins, a handful in the last. ${SIMNOTE}`),
      choices: ['With σ = √n, low bins get small error bars and too much weight (a zero bin gets infinite weight), which biases the fit; the Poisson likelihood treats small counts correctly', 'Poisson likelihood fits run faster than χ² fits', 'χ² cannot fit an exponential', 'The last bins contain no information and must be excluded'],
      answer: 0,
      why: {
        1: 'Speed is not the issue; correctness is.',
        2: 'χ² fits exponentials routinely; the trouble is the error bars at low counts.',
        3: 'The tail bins measure the background B; dropping them leaves it poorly known.',
      },
      hints: ['A bin that fluctuated low gets a smaller √n — and so more weight. Which way does that push the curve?'],
      teach: 'At low counts, use the Poisson likelihood: √n error bars weight downward fluctuations too heavily.',
      explain: t`With $\sigma_i = \sqrt{n_i}$, a bin that fluctuated down claims a smaller error and pulls the curve down — systematically. Maximizing $\prod_i \text{Pois}(n_i; \mu_i)$ uses the model’s own $\mu_i$ for the spread and is unbiased; its minimum statistic $2\sum[\mu_i - n_i + n_i\ln(n_i/\mu_i)]$ also serves as a goodness-of-fit measure.`,
    }),
    mcq({
      id: 'afterpulse', difficulty: 2,
      prompt: t`A fit to every bin gives $\tau = 1.94$ μs, with the first residual near $+5\sigma$, the next few disturbed, and the rest flat. What is the best next step?`,
      visual: rig('muon', { seed: 6, analysis: 'all', raw: false }, t`A fit to every bin, with normalized residuals. ${SIMNOTE}`),
      choices: ['Refit starting from about 1 μs, and check that τ is stable as the start moves later', 'Report 1.94 μs: the fit converged', 'Inflate all error bars until the residuals look normal', 'Fit a second exponential with a free lifetime to the whole range'],
      answer: 0,
      why: {
        1: 'Convergence does not mean the model is right; the residuals say it is not, at early times.',
        2: 'The problem is localized at early times; inflating every error bar hides it and degrades the result.',
        3: 'A free second component can absorb afterpulses, but it also trades off against τ; cutting is simpler and testable.',
      },
      hints: ['Where are the bad residuals? What instrument effect lives only there?'],
      teach: 'Localized residuals point to a localized effect: exclude the affected region and show that the result no longer depends on the cut.',
      explain: t`Afterpulses add counts only in the first few tenths of a microsecond. Refitting from 0.5, 1.0 and 1.5 μs and seeing $\tau$ settle tells you the early-time effect is gone — a stability test is part of the evidence.`,
    }),
    code({
      id: 'poisson-fit', difficulty: 3,
      prompt: t`Fit the 80 bins (0.25 μs wide, from 0 to 20 μs) by Poisson maximum likelihood. Write \`nll(p)\`, the negative log-likelihood $\sum_i(\mu_i - n_i\ln\mu_i)$ with $\mu_i = A\tau\bigl(e^{-t_i/\tau} - e^{-t_{i+1}/\tau}\bigr) + Bw$ (the decay curve integrated over bin $i$, plus $B$ per μs times the width $w$). Minimize it with \`scipy.optimize.minimize\` from \`[2000, 2.0, 5]\` and set \`tau\`.`,
      starter: t`import numpy as np
from scipy.optimize import minimize

n = np.array(${JSON.stringify(CR.counts)})
edges = np.arange(81) * 0.25        # μs
w = 0.25

def nll(p):
    A, tau, B = p
    # your code: mu for every bin, then the negative log-likelihood
    return 0.0

# your code: minimize, then tau
tau = 0.0
print(f"tau = {tau:.3f} us")`,
      answer: t`import numpy as np
from scipy.optimize import minimize

n = np.array(${JSON.stringify(CR.counts)})
edges = np.arange(81) * 0.25        # μs
w = 0.25

def nll(p):
    A, tau, B = p
    if tau <= 0 or B < 0:
        return 1e30
    mu = A * tau * (np.exp(-edges[:-1] / tau) - np.exp(-edges[1:] / tau)) + B * w
    return np.sum(mu - n * np.log(mu))

res = minimize(nll, [2000, 2.0, 5], method='Nelder-Mead', options={'xatol': 1e-9, 'fatol': 1e-10, 'maxiter': 20000})
A, tau, B = res.x
print(f"tau = {tau:.3f} us")`,
      tests: [
        { name: t`\`nll\` is the Poisson negative log-likelihood (checked at the reference best fit)`, code: `abs(nll([${CF.p.join(', ')}]) - (${(() => { const mu = CR.counts.map((_, i) => CF.p[0] * CF.p[1] * (Math.exp(-CR.edges[i] / CF.p[1]) - Math.exp(-CR.edges[i + 1] / CF.p[1])) + CF.p[2] * 0.25); return mu.reduce((s, m, i) => s + m - CR.counts[i] * Math.log(m), 0); })()})) < 1e-6` },
        { name: t`τ matches the reference maximum-likelihood fit, $${CF.p[1].toFixed(4)}$ μs`, code: `abs(tau - ${CF.p[1]}) < 2e-3` },
      ],
      hints: [t`\`mu = A * tau * (np.exp(-edges[:-1]/tau) - np.exp(-edges[1:]/tau)) + B * w\`; return \`np.sum(mu - n*np.log(mu))\` (the $\ln n_i!$ term is a constant and can be dropped).`, t`\`res = minimize(nll, [2000, 2.0, 5], method='Nelder-Mead', options={'xatol': 1e-9, 'fatol': 1e-10, 'maxiter': 20000})\`, then \`tau = res.x[1]\`. Guard against $\tau \le 0$ inside \`nll\`.`],
      teach: 'The Poisson likelihood needs no error bars: the model’s own μᵢ sets each bin’s spread.',
      explain: t`$\tau = ${CF.p[1].toFixed(3)} \pm ${CF.sp[1].toFixed(3)}$ μs from 6000 events: $z = ${zT((CF.p[1] - TAU) / CF.sp[1])}$ against the free muon, $${zT((CF.p[1] - MIX) / CF.sp[1])}$ against the mix. The uncertainty comes from the curvature of the log-likelihood (here quoted from the reference fit).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ring', difficulty: 2, transfer: true,
      gen(r) {
        const gam = r.pick([29.3, 12, 20, 50]);
        const ans = gam * TAU;
        return {
          prompt: t`In a muon storage ring the muons circle at Lorentz factor $\gamma = ${gam}$${gam === 29.3 ? ' (the “magic” value of the g − 2 experiments)' : ''}. What lifetime does the lab measure for them?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 200], y: [0, 1.1], xlabel: 'lab time (μs)', ylabel: 'muons remaining', axesAt: 'edge', curves: [{ fn: `exp(-x/${TAU})`, color: 'ink3', dash: [5, 4], label: 'at rest', labelAt: 6, labelDy: -6 }, { fn: `exp(-x/${r6(ans)})`, color: 'accent', label: 'in the ring', labelAt: 90, labelDy: -10 }] }, caption: 'Muons at rest against muons in the ring, on the lab’s clock.' },
          answer: ans, units: 'us', tol: { rel: 0.003 },
          errors: [{ value: TAU / gam, feedback: 'Moving clocks run slow: the lab sees the lifetime stretched, γτ.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`Time dilation: $\tau_{\text{lab}} = \gamma\tau$.`],
          teach: 'A moving muon’s lifetime in the lab is γτ — measured directly in storage rings to parts per thousand.',
          explain: t`$\tau_{\text{lab}} = ${gam} \times 2.197 = ${ans.toFixed(1)}$ μs. At $\gamma = 29.3$ that is the 64.4 μs that lets muons survive hundreds of turns in the Fermilab ring — and the CERN experiments of the 1970s checked $\gamma\tau$ to 0.1 %.`,
        };
      },
    }),
    num({
      id: 'cp-events', difficulty: 3,
      gen(r) {
        const ns = r.pick([2, 3, 4, 5]);
        const d = TAU - MIX;
        const ans = (ns * MIX / d) ** 2;
        return {
          prompt: t`To show that a sea-level measurement sits below the free muon’s 2.1970 μs because of the μ⁻ captures (expected about $${MIX.toFixed(3)}$ μs), you want the difference to be ${ns}σ. Using $\sigma_\tau \approx \tau/\sqrt N$, how many decays do you need?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [2.0, 2.3], y: [0, 1.2], xlabel: 'τ (μs)', ylabel: '', yticks: 0, axesAt: 'edge', vlines: [{ x: TAU, color: 'good', label: 'free μ' }, { x: r6(MIX), color: 'violet', label: 'μ⁺/μ⁻ mix' }] }, caption: 'The two values to be told apart.' },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: (MIX / d) ** 2, feedback: `That is for a 1σ difference. Scale σ down by ${ns}.` }, { value: ns * (MIX / d) ** 2, feedback: 'σ falls as 1/√N, so N grows with the square of the number of σ.' }].filter((e) => Math.abs(e.value - ans) > 0.05 * ans),
          hints: [t`You need $\sigma_\tau = \Delta/${ns}$ with $\Delta = ${d.toFixed(3)}$ μs.`, t`$N = (\tau/\sigma_\tau)^2$.`],
          teach: 'Plan the statistics before the run: N = (n·τ/Δ)² to resolve a difference Δ at nσ.',
          explain: t`$\sigma_\tau = ${d.toFixed(4)}/${ns} = ${(d / ns).toFixed(4)}$ μs, so $N = (${MIX.toFixed(3)}/${(d / ns).toFixed(4)})^2 \approx ${ans.toFixed(0)}$ — before the background and an early-time cut, which add perhaps 10–20 %.`,
        };
      },
    }),
    mcq({
      id: 'cp-conclude', difficulty: 3,
      prompt: t`With 40 000 events and a fit from 1 μs, you find $\tau = 2.121 \pm 0.017$ μs. What is the right conclusion?`,
      visual: rig('muon', { seed: 7, analysis: 'cut', N: 40000, data: false }, t`A 40 000-event histogram with the fit. ${SIMNOTE}`),
      choices: ['It is about 4σ below the free muon’s 2.197 μs and agrees with the 2.12 μs expected for the μ⁺/μ⁻ mix with μ⁻ capture: the deficit is physics', 'There is an unknown systematic: the result must equal the PDG value', 'The free muon lifetime is wrong by 3 %', 'The background was underestimated; refit until τ = 2.197 μs'],
      answer: 0,
      why: {
        1: 'The PDG value is for free muons. Your scintillator binds some of them to carbon.',
        2: 'The free lifetime is known to a part per million from dedicated experiments with μ⁺ beams.',
        3: 'Tuning an analysis toward the expected answer is how confirmation bias enters a measurement.',
      },
      hints: ['Which value is the right comparison for muons stopping in plastic?', 'Compute z against both 2.197 μs and the mix’s 2.12 μs.'],
      teach: 'Compare a measurement with the prediction for your actual conditions — here a μ⁺/μ⁻ mix in carbon, not free μ⁺.',
      explain: t`$(2.121 - 2.197)/0.017 = ${((2.121 - TAU) / 0.017).toFixed(1)}\sigma$ from the free value, $${zT((2.121 - MIX) / 0.017)}\sigma$ from the mix. Knowing what your apparatus should give — including the physics of capture — is what lets you trust a result that “disagrees” with the tables.`,
    }),
  ],
  sources: [
    SRC.pdg,
    { label: 'T. Suzuki, D. F. Measday & J. P. Roalsvig, Total nuclear capture rates for negative muons, Phys. Rev. C 35, 2212 (1987)', url: 'https://doi.org/10.1103/PhysRevC.35.2212' },
    { label: 'T. Coan & J. Ye, Muon Physics (TeachSpin apparatus manual)', url: 'https://www.teachspin.com/muon-physics' },
    { label: 'J. Bailey et al., Measurements of relativistic time dilatation for positive and negative muons in a circular orbit, Nature 268, 301 (1977)', url: 'https://doi.org/10.1038/268301a0' },
  ],
});
