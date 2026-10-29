// Decay laws and half-lives, at Krane’s level: decay constants, mean life
// and branching (partial half-lives add as rates); decay chains solved by
// Bateman’s equations; secular equilibrium (radium and radon, the whole
// uranium-238 series, radon in homes) and transient equilibrium (the
// molybdenum-99 → technetium-99m generator, the daughter’s peak time);
// K–Ar dating with its branching, on Mars. Coding: radon progeny with
// solve_ivp. PHYS 2220 A1.3 did the exponential law, half-lives from data,
// carbon dating, activity and RTG power; this lesson does not repeat them.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as K from '../../src/viz/model/nuc-chain.js';
import { NA, YEAR, r6, seg, label } from './_nuclear.js';

const t = String.raw;
const LN2 = Math.LN2;

// the worked example: a tonne of uranium-238 in old ore
const N_U = (1e6 / 238.0508) * NA, A_U = N_U * (LN2 / (4.468e9 * YEAR));
const M_RA = (A_U / (LN2 / (1600 * YEAR)) / NA) * 226.0254, N_RN = A_U / (LN2 / (3.8215 * 86400));

/** A decay scheme: the parent above, an arrow to each daughter with its branch. */
function scheme(parent, T, branches, { caption } = {}) {
  const n = branches.length, xs = n === 1 ? [5] : [2.6, 7.4];
  return {
    type: 'graph',
    params: {
      x: [0, 10], y: [-0.9, 4.2], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [seg(3.2, 3.2, 6.8, 3.2, 'gold', 3), ...branches.map((b, i) => seg(xs[i] - 1.4, 0, xs[i] + 1.4, 0, 'accent', 3))],
      arrows: branches.map((b, i) => ({ from: [5, 3.1], to: [xs[i], 0.12], color: 'ink2', width: 1.8 })),
      points: [label(5, 3.2, `${parent}   T½ = ${T}`, 'gold', 0, -14, 'center'),
        ...branches.flatMap((b, i) => [label(xs[i], 0, b.to, 'accent', 0, 16, 'center'), label((5 + xs[i]) / 2, 1.6, `${b.mode} ${b.pct}`, 'ink', i ? 10 : -10, 0, i ? 'left' : 'right')])],
    },
    caption: caption ?? 'A decay scheme: each nucleus has one half-life, and its decays are shared among the branches in fixed proportions. Heights are schematic.',
  };
}

export default lesson({
  id: 'phys3710.N2.1',
  title: 'Decay laws and half-lives',
  minutes: 18, difficulty: 3,
  intro: t`Every unstable nucleus has a fixed probability per unit time of decaying, its **decay constant** $\lambda$, so a sample shrinks exponentially (you met that in [PHYS 2220 A1.3](#/lesson/phys2220.A1.3)). But the daughter is often radioactive too, and *its* number grows as it is fed and shrinks as it decays:

$$\frac{dN_2}{dt} = \lambda_1N_1 - \lambda_2N_2, \qquad N_1 = N_0e^{-\lambda_1t}$$

Chains of these equations — solved by Bateman in 1910 — explain why uranium ore contains radium, why radon seeps from the ground at a steady rate, and how a hospital “milks” a molybdenum generator for technetium. When a parent lives far longer than its daughter, the daughter settles into **secular equilibrium**: it decays exactly as fast as it is made, $\lambda_2N_2 = \lambda_1N_1$.`,
  symbols: [
    { tex: 'N_1,\\ N_2', text: 'the numbers of parent and daughter nuclei at time $t$' },
    { tex: 'N_0', text: 'the number of parent nuclei at $t = 0$, when no daughter is present' },
    { tex: '\\lambda_1,\\ \\lambda_2', text: t`the decay constants, $\lambda = \ln 2/T_{1/2}$, in $\text{s}^{-1}$: each nucleus’s probability of decaying per unit time` },
    { tex: '\\lambda N', text: t`the **activity**: decays per second, in becquerels (Bq); the older unit, the curie, is $3.7\times10^{10}$ Bq` },
    { tex: 't', text: 'time since the parent was separated pure' },
  ],
  why: 'Every natural radiation dose, every uranium–lead and potassium–argon age, and every medical isotope supply chain is a decay chain at work.',
  visual: {
    type: 'nuc-chain',
    params: { chain: 'pair', ratio: 0.1, time: 2, controls: true },
    title: 'A parent and its daughter',
    lead: t`Start with a pure parent (blue). The daughter (orange) grows from nothing, peaks, and then — if it is the shorter-lived of the two — falls in step with its parent. Time is counted in parent half-lives; set the daughter’s half-life with the slider.`,
    tasks: [
      'Slide the ratio down to 0.01: the daughter’s activity rises to meet the parent’s and then rides on it — secular equilibrium.',
      'Set it near 0.3 and switch to the log scale: after a while the two lines are parallel, the daughter a fixed factor above the parent — transient equilibrium.',
      'Push it above 1: the daughter outlives its parent, overtakes it and is left decaying on its own. No equilibrium.',
    ],
  },
  example: {
    prompt: t`A body of uranium ore, billions of years old, holds 1.000 tonne of uranium-238 (238.05 g/mol, $T_{1/2} = 4.468\times10^9$ yr). (a) What is its uranium-238 activity? (b) How much radium-226 (226.03 g/mol, 1600 yr) does it contain? (c) How many atoms of radon-222 (3.8215 d) are in it at any moment?`,
    visual: { type: 'nuc-chain', params: { chain: 'u238', time: 8 }, caption: 'Activities in the uranium-238 series after a sample of pure uranium is sealed away, each divided by the uranium’s. Thorium-234 catches up within months; uranium-234, thorium-230 and radium-226 (with the radon and its progeny hidden under its curve) within a few million years. Ore older than that is in secular equilibrium. Bateman’s solution, NUBASE2020 half-lives; time on a log scale.' },
    steps: [
      { label: 'Uranium nuclei', text: t`$N_U = \dfrac{10^6\ \text{g}}{238.05\ \text{g/mol}}\times6.022\times10^{23} = ${tex(N_U, 4)}$.` },
      { label: 'Its activity', text: t`$\lambda_U = \dfrac{\ln 2}{4.468\times10^9\times3.156\times10^7\ \text{s}} = ${tex(LN2 / (4.468e9 * YEAR), 4)}\ \text{s}^{-1}$, so $A = \lambda_UN_U = ${tex(A_U, 4)}$ Bq — about a third of a curie.` },
      { label: 'Secular equilibrium', text: t`Every member of the chain lives far less than uranium-238, and the ore is far older than the slowest of them (uranium-234, 245 000 yr). So each member decays as fast as it is made: $\lambda_{\text{Ra}}N_{\text{Ra}} = \lambda_UN_U$, the same $${tex(A_U, 3)}$ Bq.` },
      { label: 'Radium', text: t`$N_{\text{Ra}} = N_U\,\dfrac{T_{\text{Ra}}}{T_U} = ${tex(N_U, 4)}\times\dfrac{1600}{4.468\times10^9}$, a mass of $${fmt(M_RA, 3)}$ g. Atoms of a long-lived member pile up in proportion to its half-life.` },
      { label: 'Radon', text: t`$N_{\text{Rn}} = A/\lambda_{\text{Rn}} = ${tex(A_U, 3)}\times\dfrac{3.8215\times86\,400\ \text{s}}{\ln 2} = ${tex(N_RN, 3)}$ atoms — ${fmt(N_RN / NA * 222.0176 * 1e6, 2)} μg, renewed every few days.` },
      { label: 'Sense check', text: t`Marie and Pierre Curie processed tonnes of pitchblende residues to isolate about a tenth of a gram of radium chloride in 1902: a third of a gram per tonne of uranium is the most there can be.` },
    ],
    answer: t`$A = ${tex(A_U, 3)}$ Bq; $${fmt(M_RA, 3)}$ g of radium-226; $${tex(N_RN, 3)}$ radon atoms.`,
  },
  practice: [
    num({
      id: 'branch', difficulty: 2,
      gen(r) {
        const [p, T, unit, a, b] = r.pick([
          ['potassium-40', 1.248e9, 'yr', { to: 'argon-40', mode: 'electron capture', pct: 10.72 }, { to: 'calcium-40', mode: 'β⁻', pct: 89.28 }],
          ['bismuth-212', 60.55, 'min', { to: 'thallium-208', mode: 'α', pct: 35.94 }, { to: 'polonium-212', mode: 'β⁻', pct: 64.06 }],
          ['copper-64', 12.70, 'h', { to: 'nickel-64', mode: 'EC/β⁺', pct: 61.5 }, { to: 'zinc-64', mode: 'β⁻', pct: 38.5 }],
        ]);
        const which = r.pick([a, b]), Tp = T / (which.pct / 100);
        const show = (x) => (x >= 1e5 ? tex(x, 4) : fmt(x, 4));
        return {
          prompt: t`${p[0].toUpperCase() + p.slice(1)} has a half-life of $${show(T)}$ ${unit}. ${a.pct}% of its decays are ${a.mode} to ${a.to}, ${b.pct}% ${b.mode} to ${b.to}. What is the **partial half-life** for the ${which.mode} branch alone — the half-life it would have if that were its only way to decay — in ${unit}?`,
          answer: Tp, units: unit, tol: { rel: 0.003 },
          errors: [{ value: T * (which.pct / 100), feedback: t`A rarer branch means a *longer* partial half-life: the partial decay constant is $\lambda_i = f_i\lambda$, so $T_i = T/f_i$.` }],
          hints: [t`Decay constants of competing branches add: $\lambda = \lambda_a + \lambda_b$, and $\lambda_i = f_i\lambda$ for a branch taking a fraction $f_i$.`, t`$T_i = \dfrac{\ln 2}{\lambda_i} = \dfrac{T_{1/2}}{f_i} = \dfrac{${show(T)}}{${r6(which.pct / 100)}}$.`],
          teach: 'Competing decays add their rates, not their half-lives: each branch has λᵢ = fᵢλ and a partial half-life T½/fᵢ.',
          explain: t`$T_i = ${show(T)}/${r6(which.pct / 100)} = ${show(Tp)}$ ${unit}. The nucleus still has only one half-life, $${show(T)}$ ${unit}: every branch’s products appear with that same time dependence, in fixed proportions.${p === 'potassium-40' ? ' The argon branch is what K–Ar dating counts.' : ''}`,
          visual: scheme(p, `${T >= 1e5 ? `${fmt(T / 1e9, 4)} billion` : fmt(T, 4)} ${unit}`, [{ to: a.to, mode: a.mode, pct: `${a.pct}%` }, { to: b.to, mode: b.mode, pct: `${b.pct}%` }]),
        };
      },
    }),
    num({
      id: 'curie', difficulty: 1,
      prompt: t`The curie was defined in 1910 as the activity of one gram of radium-226. With today’s half-life of 1600 years and molar mass 226.03 g/mol, what is the activity of 1.000 g of radium-226, in becquerels?`,
      answer: (1 / 226.0254) * NA * (LN2 / (1600 * YEAR)), units: 'Bq', tol: { rel: 0.005 },
      errors: [{ value: (1 / 226.0254) * NA * (LN2 / 1600), feedback: 'Convert the half-life to seconds (1 yr = 3.156 × 10⁷ s): a becquerel is one decay per second.' }, { value: (1 / 226.0254) * NA / (1600 * YEAR), feedback: t`$\lambda = \ln 2/T_{1/2}$: you left out the $\ln 2$.` }],
      hints: [t`$N = (1/226.03)\times6.022\times10^{23}$ and $\lambda = \ln 2/(1600\times3.156\times10^7\ \text{s})$.`, t`$A = \lambda N$.`],
      teach: 'Activity is λN: a long half-life means few decays per atom, but a gram holds a great many atoms.',
      explain: t`$N = ${tex(NA / 226.0254, 4)}$, $\lambda = ${tex(LN2 / (1600 * YEAR), 4)}\ \text{s}^{-1}$, $A = ${tex((NA / 226.0254) * (LN2 / (1600 * YEAR)), 4)}$ Bq — 0.988 Ci by today’s definition, $3.7\times10^{10}$ Bq exactly. The half-life known in 1910 was a little different, which is why the curie was later fixed as a number.`,
      visual: scheme('radium-226', '1600 yr', [{ to: 'radon-222 + α', mode: 'α', pct: '100%' }], { caption: 'Radium-226 decays only by alpha emission, to radon-222. Heights are schematic.' }),
    }),
    num({
      id: 'ingrowth', difficulty: 2,
      gen(r) {
        const d = r.pick([2, 5, 7, 10, 14]), f = K.ingrowth(d, 3.8215);
        return {
          prompt: t`A radium standard is sealed in a glass ampoule after all its radon has been pumped away. Radium-226 lives 1600 years; radon-222, 3.8215 days. ${d} days later, what is the radon’s activity as a percentage of the radium’s?`,
          answer: f * 100, units: '%', tol: { rel: 0.005 },
          errors: [{ value: 2 ** (-d / 3.8215) * 100, feedback: t`That is the fraction of radon that would be *left* if it were not replenished. Here it starts at zero and grows: $1 - 2^{-t/T}$.` }],
          hints: ['On a scale of days the radium does not decay: radon is made at a constant rate and decays at its own.', t`$A_{\text{Rn}}/A_{\text{Ra}} = 1 - e^{-\lambda_{\text{Rn}}t} = 1 - 2^{-t/3.8215\ \text{d}}$.`],
          teach: t`A short-lived daughter grows toward its long-lived parent’s activity as $1 - e^{-\lambda_2t}$: half-way after one daughter half-life.`,
          explain: t`$1 - 2^{-${d}/3.8215} = ${fmt(f, 4)}$, i.e. $${fmt(f * 100, 3)}$%. After about 30 days (eight radon half-lives) the ampoule is in secular equilibrium: its radon decays as fast as the radium makes it. The same balance keeps the radon under a house topped up.`,
          visual: { type: 'nuc-chain', params: { chain: 'radium', readout: false }, caption: 'Radon (orange) growing into a sealed sample of pure radium (blue), with bismuth-214 (green) a few hours behind it. Activities divided by the radium’s. Bateman’s solution, NUBASE2020 half-lives.' },
        };
      },
    }),
    num({
      id: 'moly-peak', difficulty: 2,
      prompt: t`A technetium-99m generator holds molybdenum-99 ($T_{1/2} = 65.98$ h), whose decays feed technetium-99m ($6.007$ h). The hospital washes out (“elutes”) all the technetium and then waits. How many hours after elution is the technetium-99m activity greatest? The peak of a daughter growing from a pure parent is at $t_{\max} = \dfrac{\ln(\lambda_2/\lambda_1)}{\lambda_2 - \lambda_1}$.`,
      answer: K.peakTime(LN2 / 65.976, LN2 / 6.0067), units: 'h', tol: { rel: 0.005 },
      errors: [{ value: 1 / (LN2 / 6.0067 - LN2 / 65.976), feedback: t`Keep the logarithm in the numerator: $t_{\max} = \ln(\lambda_2/\lambda_1)/(\lambda_2 - \lambda_1)$.` }],
      hints: [t`$\lambda_1 = \ln 2/65.98\ \text{h} = ${fmt(LN2 / 65.976, 4)}\ \text{h}^{-1}$, $\lambda_2 = \ln 2/6.007\ \text{h} = ${fmt(LN2 / 6.0067, 4)}\ \text{h}^{-1}$.`, t`$\ln(\lambda_2/\lambda_1) = \ln(65.98/6.007)$.`],
      teach: 'A daughter’s activity peaks when it equals the parent’s; for Tc-99m that is about a day after elution, so generators are milked daily.',
      explain: t`$t_{\max} = \ln(${fmt(65.976 / 6.0067, 4)})/${fmt(LN2 / 6.0067 - LN2 / 65.976, 4)}\ \text{h}^{-1} = ${fmt(K.peakTime(LN2 / 65.976, LN2 / 6.0067), 4)}$ h. At the peak the daughter’s activity equals the parent’s fed share, and afterwards the two fall together (transient equilibrium). Only 87.5% of molybdenum decays feed technetium-99m, which scales the curve but does not move the peak.`,
      visual: { type: 'nuc-chain', params: { chain: 'moly', readout: false }, caption: 'Molybdenum-99 (blue) and the technetium-99m it feeds (orange), after the generator is emptied at t = 0. 87.5% of molybdenum decays feed technetium-99m. Bateman’s solution, NUBASE2020 half-lives.' },
    }),
    mcq({
      id: 'secular', difficulty: 2,
      prompt: 'Old uranium ore is in secular equilibrium. Compare radium-226 (1600 yr) with radon-222 (3.8 days) in it.',
      choices: [
        'They have the same activity, but there are about 150 000 times as many radium atoms as radon atoms',
        'They have the same number of atoms and the same activity',
        'Radon, being short-lived, has the greater activity',
        'Both decline with radon’s half-life, 3.8 days',
      ],
      answer: 0,
      why: {
        1: 'Equal activities, λN, mean unequal numbers: the long-lived member must have more atoms to decay as often.',
        2: 'In secular equilibrium radon decays exactly as fast as it is made — no faster.',
        3: 'The chain is governed by its long-lived parent: everything falls with uranium-238’s half-life, 4.5 billion years.',
      },
      hints: ['In equilibrium, what is the rate at which radon is made, and the rate at which it decays?', t`Equal activities: $\lambda_{\text{Ra}}N_{\text{Ra}} = \lambda_{\text{Rn}}N_{\text{Rn}}$.`],
      teach: 'Secular equilibrium means equal activities, so atom numbers are in proportion to half-lives.',
      explain: t`$\lambda_{\text{Ra}}N_{\text{Ra}} = \lambda_{\text{Rn}}N_{\text{Rn}}$, so $N_{\text{Ra}}/N_{\text{Rn}} = T_{\text{Ra}}/T_{\text{Rn}} = (1600\times365.25)/3.8215 = ${tex((1600 * 365.25) / 3.8215, 3)}$. A Geiger counter cannot tell the long-lived atoms from the short-lived ones: each contributes the same count rate.`,
      visual: { type: 'nuc-chain', params: { chain: 'u238', readout: false }, caption: 'The uranium-238 series growing toward secular equilibrium, activities divided by the uranium’s (log scales). Radium-226 and the radon below it share one curve once they balance.' },
    }),
    num({
      id: 'transient', difficulty: 3,
      gen(r) {
        const [p, d, T1, T2, u] = r.pick([['lead-212', 'bismuth-212', 10.64, 60.55 / 60, 'h'], ['barium-140', 'lanthanum-140', 12.7527, 1.67855, 'd']]), eq = K.equilibrium(T1, T2);
        return {
          prompt: t`${p[0].toUpperCase() + p.slice(1)} ($T_{1/2} = ${fmt(T1, 4)}$ ${u}) decays to ${d} ($${fmt(T2, 4)}$ ${u}). Starting from pure ${p}, the two reach transient equilibrium. What is then the ratio of the daughter’s activity to the parent’s, $A_2/A_1$?`,
          answer: eq.ratio, tol: { rel: 0.002 },
          errors: [{ value: 1, feedback: t`Equal activities hold only in *secular* equilibrium, when the parent barely decays. Here it does: $A_2/A_1 = \lambda_2/(\lambda_2 - \lambda_1)$.` }, { value: T1 / T2, feedback: 'That is the ratio of numbers of atoms in secular equilibrium. Compare activities, and keep the parent’s decay in the formula.' }],
          hints: [t`Late on, $N_2 \propto e^{-\lambda_1t}$ too. Put that into $dN_2/dt = \lambda_1N_1 - \lambda_2N_2$.`, t`$\dfrac{A_2}{A_1} = \dfrac{\lambda_2}{\lambda_2 - \lambda_1} = \dfrac{T_1}{T_1 - T_2}$.`],
          teach: 'In transient equilibrium the daughter outruns its parent by λ₂/(λ₂ − λ₁): it decays at the parent’s pace from a raised level.',
          explain: t`$A_2/A_1 = \dfrac{T_1}{T_1 - T_2} = \dfrac{${fmt(T1, 4)}}{${fmt(T1, 4)} - ${fmt(T2, 4)}} = ${fmt(eq.ratio, 4)}$. The daughter is ${fmt((eq.ratio - 1) * 100, 3)}% more active than its parent, and both fall with the parent’s half-life. As $T_1/T_2$ grows the ratio tends to 1: secular equilibrium is the limit.`,
          visual: { type: 'nuc-chain', params: { chain: 'pair', ratio: r6(T2 / T1), logy: true, readout: false, controls: false }, caption: 'Parent and daughter activities on a log scale, time in parent half-lives. Late on the lines run parallel: a fixed ratio.' },
        };
      },
    }),
    code({
      id: 'bateman', difficulty: 3,
      prompt: t`Radon detectors fill a cell with air and count alpha particles — but the count is only trustworthy once radon’s short-lived progeny have caught up. Integrate the chain radon-222 → polonium-218 → lead-214 → bismuth-214 with \`solve_ivp\`, starting from pure radon. Finish \`rates(t, N)\`, which returns $dN_i/dt = \lambda_{i-1}N_{i-1} - \lambda_iN_i$, and \`ratio(t)\`, the bismuth-214 activity divided by the radon activity at time \`t\` (minutes). Then \`t90\` finds when the ratio first reaches 0.9.`,
      starter: t`import numpy as np
from scipy.integrate import solve_ivp
from scipy.optimize import brentq

T = np.array([3.8215 * 1440, 3.098, 27.06, 19.9])   # half-lives in minutes: Rn-222, Po-218, Pb-214, Bi-214
lam = np.log(2) / T

def rates(t, N):
    # return [dN0/dt, dN1/dt, dN2/dt, dN3/dt]
    return np.zeros(4)

def ratio(t):
    sol = solve_ivp(rates, (0, t), [1e6, 0, 0, 0], method="LSODA", rtol=1e-10, atol=1e-6)
    N = sol.y[:, -1]
    return 0.0

t90 = brentq(lambda t: ratio(t) - 0.9, 10, 300)
print(f"Bi-214/Rn-222 after 3 h: {ratio(180):.4f}")
print(f"90% of equilibrium after {t90:.1f} min")
`,
      answer: t`import numpy as np
from scipy.integrate import solve_ivp
from scipy.optimize import brentq

T = np.array([3.8215 * 1440, 3.098, 27.06, 19.9])
lam = np.log(2) / T

def rates(t, N):
    feed = np.concatenate(([0.0], lam[:-1] * N[:-1]))
    return feed - lam * N

def ratio(t):
    sol = solve_ivp(rates, (0, t), [1e6, 0, 0, 0], method="LSODA", rtol=1e-10, atol=1e-6)
    N = sol.y[:, -1]
    return lam[3] * N[3] / (lam[0] * N[0])

t90 = brentq(lambda t: ratio(t) - 0.9, 10, 300)
print(f"Bi-214/Rn-222 after 3 h: {ratio(180):.4f}")
print(f"90% of equilibrium after {t90:.1f} min")`,
      tests: [
        { name: t`\`rates\` conserves nuclei apart from bismuth’s own decay`, code: 'abs(sum(rates(0, np.array([1.0, 2.0, 3.0, 4.0]))) + lam[3] * 4.0) < 1e-12' },
        { name: 'after 1 hour bismuth-214 has 49% of radon’s activity', code: 'abs(ratio(60) - 0.4916) < 0.002' },
        { name: 'after 3 hours it has 97%', code: 'abs(ratio(180) - 0.9719) < 0.002' },
        { name: t`\`t90\` is about 134 minutes`, code: 'abs(t90 - 134.1) < 0.5' },
      ],
      hints: [t`Write \`dN = -lam * N\`, then add the feeding terms: \`dN[1:] += lam[:-1] * N[:-1]\`, and return \`dN\`.`, t`Activity is $\lambda N$: return \`lam[3] * N[3] / (lam[0] * N[0])\`.`],
      teach: 'A chain of linear decay equations integrates in a few lines; the slowest intermediate member sets how long the progeny take to catch up.',
      explain: t`Bismuth-214 reaches 90% of radon’s activity after about 134 minutes and 97% after 3 hours; lead-214 (27 min) and bismuth-214 (20 min) set the pace, not polonium-218 (3 min). That is why radon cells are counted at least three hours after filling. The integrator agrees with Bateman’s exact solution — the nuc-chain simulation draws it.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-radon', difficulty: 2,
      gen(r) {
        const pCi = r.pick([2, 4, 8]), Bq = pCi * 0.037, n = K.atomsFor(Bq, 3.8215 * 86400);
        return {
          prompt: t`Radon is the largest source of natural radiation dose for most people; the US Environmental Protection Agency recommends action above 4 picocuries per litre of air. A basement measures ${pCi} pCi/L ($1\ \text{pCi} = 0.037$ Bq). How many radon-222 atoms ($T_{1/2} = 3.8215$ days) are in each litre of its air?`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: Bq * 3.8215 * 86400, feedback: t`$N = A/\lambda = A\,T_{1/2}/\ln 2$: you left out the $\ln 2$.` }, { value: Bq * 3.8215 / LN2, feedback: 'Convert the half-life to seconds: activity is in decays per second.' }],
          hints: [t`$A = ${pCi}\times0.037 = ${fmt(Bq, 3)}$ Bq per litre.`, t`$N = A/\lambda = A\times\dfrac{3.8215\times86\,400\ \text{s}}{\ln 2}$.`],
          teach: 'A tiny number of atoms gives a measurable activity: N = A·T½/ln 2.',
          explain: t`$N = ${fmt(Bq, 3)}\times${tex((3.8215 * 86400) / LN2, 4)} = ${tex(n, 3)}$ atoms per litre — among about $2.5\times10^{22}$ molecules of air. The dose comes mostly from the short-lived progeny (polonium-218 and polonium-214), which stick to dust and lodge in the lungs.`,
          visual: { type: 'nuc-chain', params: { chain: 'radon', readout: false }, caption: 'Radon’s short-lived progeny growing in from pure radon (a fresh air sample), activities divided by the radon’s. In a room they are near equilibrium, minus what plates out on surfaces. Bateman’s solution, NUBASE2020 half-lives.' },
        };
      },
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      gen(r) {
        const x = r.pick([0.6, 0.8, 1.0, 1.2]), age = K.kArAge(x) / 1e9;
        return {
          prompt: t`In 2013 the Curiosity rover dated a Martian mudstone, “Cumberland”, by heating it and measuring both its potassium and the argon-40 released. Potassium-40 ($T_{1/2} = 1.248\times10^9$ yr) decays to argon-40 in 10.72% of its decays (the rest go to calcium-40). Suppose the rock holds ${x} argon-40 atoms made by decay for every potassium-40 atom left. How old is it, in billions of years?`,
          answer: age, units: 'Gyr', tol: { rel: 0.005 },
          errors: [{ value: (1.248 / LN2) * Math.log(1 + x), feedback: t`Only 10.72% of decays make argon: the number of decays is $\text{Ar}/0.1072$. So $t = \dfrac{T}{\ln 2}\ln\left(1 + \dfrac{\text{Ar}/\text{K}}{0.1072}\right)$.` }],
          hints: [t`Decays so far: $N_K(e^{\lambda t} - 1)$, of which a fraction 0.1072 made argon: $\text{Ar} = 0.1072\,N_K(e^{\lambda t} - 1)$.`, t`$t = \dfrac{1.248\ \text{Gyr}}{\ln 2}\ln\left(1 + \dfrac{${x}}{0.1072}\right)$.`],
          teach: 'With a branching decay, only the branch you count makes the daughter: divide by its fraction before taking the logarithm.',
          explain: t`$t = 1.800\ \text{Gyr}\times\ln(1 + ${fmt(x / 0.1072, 4)}) = ${fmt(age, 3)}$ Gyr. Curiosity’s measurement gave $4.21 \pm 0.35$ Gyr (Farley et al., 2014) — the first rock dated on another planet, by an instrument designed for chemistry rather than dating. Argon is a gas, so heating or impacts can let it escape: K–Ar ages are minimum ages unless the rock kept its argon.`,
          visual: scheme('potassium-40', '1.248 Gyr', [{ to: 'argon-40 (counted)', mode: 'EC', pct: '10.72%' }, { to: 'calcium-40', mode: 'β⁻', pct: '89.28%' }], { caption: 'Potassium-40’s two branches. Argon, a noble gas, is trapped in the rock as it forms; calcium-40 is too common to be useful. Heights are schematic.' }),
        };
      },
    }),
    num({
      id: 'cp-chain', difficulty: 2,
      prompt: t`A sample of old uranium ore shows a uranium-238 activity of 50 Bq. The uranium-238 series has 14 radioactive members (8 alpha emitters, 6 beta emitters) ending at stable lead-206, and the ore is in secular equilibrium. What is the total activity of the series in it, in Bq? (Ignore the tiny side branches and the uranium-235 series.)`,
      answer: 700, units: 'Bq', tol: { rel: 0, abs: 0.5 },
      errors: [{ value: 400, feedback: 'Count every radioactive member, the beta emitters too: 14 in all.' }, { value: 50, feedback: 'Every member of the chain has the parent’s activity in secular equilibrium — and there are 14 of them.' }, { value: 750, feedback: 'Lead-206, the end of the chain, is stable and does not decay.' }],
      hints: ['In secular equilibrium every member has the parent’s activity.', 'Add up 14 equal activities.'],
      teach: 'An equilibrium chain multiplies its parent’s activity by the number of radioactive members.',
      explain: t`$14\times50 = 700$ Bq, of which 400 Bq are alpha decays. Separated chemically, pure uranium starts at 50 Bq and grows toward 700 Bq over a million years — the uranium–lead and uranium-series dating methods read exactly that ingrowth.`,
      visual: { type: 'nuc-chain', params: { chain: 'u238', readout: false, time: 9 }, caption: 'The uranium-238 series (log scales): after a few million years every member has the parent’s activity. Some curves hide others: polonium-214, for example, lies exactly under bismuth-214’s, which is under radium-226’s.' },
    }),
  ],
  sources: [
    { label: 'Krane, Introductory Nuclear Physics (Wiley, 1988), ch. 6: radioactive decay', url: 'https://www.wiley.com/en-us/Introductory+Nuclear+Physics%2C+3rd+Edition-p-9780471805533' },
    { label: 'Kondev et al. (2021), The NUBASE2020 evaluation of nuclear physics properties, Chinese Physics C 45, 030001', url: 'https://doi.org/10.1088/1674-1137/abddae' },
    { label: 'Farley et al. (2014), In situ radiometric and exposure age dating of the Martian surface, Science 343, 1247166', url: 'https://doi.org/10.1126/science.1247166' },
    { label: 'US EPA, A Citizen’s Guide to Radon', url: 'https://www.epa.gov/radon/citizens-guide-radon-guide-protecting-yourself-and-your-family-radon' },
  ],
});
