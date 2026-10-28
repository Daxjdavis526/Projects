// The PHYS 3700 boss, "The Black-Hole Engine": a thought experiment on the
// thermodynamics of black holes — theory throughout, since Hawking radiation
// has never been observed. An imagined far-future engineer finds Ember, a
// small primordial black hole, and wants to run a heat engine on it with the
// cosmic microwave background as the cold reservoir. Round 1 weighs and
// counts it (Hawking temperature, entropy in bits, multiplicity under
// doubling); round 2 shows it gets hotter as it shrinks (T from dS/dU, a
// negative heat capacity, why no heat bath can hold it); round 3 asks which
// way the energy flows, how efficient a Carnot engine on it could be, and how
// much it would actually deliver; round 4 feeds it (the generalized second law,
// its free energy Mc²/2); round 5 looks back to where black holes come from
// (the Chandrasekhar mass) and forward to Ember's end (its evaporation time).
// Every number a learner reads comes from its generator; the case functions
// are exported so a script can recompute every key another way.
import { boss, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, HBAR, CL, G, MSUN, T_CMB, SIGMA, YEAR, LN2, hawkingT, bhS, bhC, bhLife, rs, chandra, M_CROSS, hawkingPic, entropyPic, r4, texNum, apart } from './_th4.js';

const t = String.raw;
const S_N2 = 6.84e3;          // J/K for 1 kg of nitrogen at 298 K and 1 bar (191.6 J/(mol K) ÷ 0.028 kg/mol, CODATA key values)

// ── round 1 ──────────────────────────────────────────────────────────────────
const EMBER = [3e21, 5e21, 8e21, 1.2e22, 2e22, 3e22];   // kg: all lighter than the crossover, so hotter than the CMB
/** Ember's Hawking temperature. */
export function tempCase(r) { const M = r.pick(EMBER); return { M, T: hawkingT(M) }; }
/** Ember's entropy in bits. */
export function bitsCase(r) { const M = r.pick(EMBER); return { M, S: bhS(M), bits: bhS(M) / LN2 }; }

// ── round 2 ──────────────────────────────────────────────────────────────────
/** Ember's heat capacity. */
export function capCase(r) { const M = r.pick(EMBER); return { M, C: bhC(M), T: hawkingT(M) }; }

// ── round 3 ──────────────────────────────────────────────────────────────────
const FLOW = [[1e21, '$10^{21}$ kg, a large asteroid’s mass'], [1e22, '$10^{22}$ kg, a seventh of the Moon’s mass'], [3e22, '$3\\times10^{22}$ kg'], [7.3e22, 'one Moon mass, $7.3\\times10^{22}$ kg'], [6e24, 'one Earth mass, $6\\times10^{24}$ kg'], [2e30, 'one solar mass, $2\\times10^{30}$ kg']];
/** Which way net energy flows between a hole and the CMB. */
export function flowCase(r) { const [M, what] = r.pick(FLOW); const T = hawkingT(M); return { M, what, T, out: T > T_CMB }; }
/** A Carnot engine between Ember's radiation and the CMB. */
export function carnotCase(r) { const M = r.pick(EMBER); const T = hawkingT(M); return { M, T, eff: 1 - T_CMB / T }; }
/** Ember's net radiated power: photons only, a perfect blackbody of the horizon's area, minus what it absorbs from the CMB. */
export function powerCase(r) {
  const M = r.pick(EMBER), T = hawkingT(M), A = 4 * Math.PI * rs(M) ** 2;
  return { M, T, A, P: SIGMA * A * (T ** 4 - T_CMB ** 4), Pout: SIGMA * A * T ** 4 };
}

// ── round 4 ──────────────────────────────────────────────────────────────────
/** The generalized second law: a box of nitrogen dropped into a hole. */
export function gslCase(r) {
  const [M, what] = r.pick([[1.2e22, 'Ember'], [10 * MSUN, 'a ten-solar-mass black hole']]), m = r.pick([1, 5, 20]);
  const T = hawkingT(M), dS = (m * CL * CL) / T, Sbox = m * S_N2;
  return { M, what, m, T, dS, Sbox, ratio: dS / Sbox, lg: Math.log10(dS / Sbox) };
}
/** The hole's Helmholtz free energy F = U − T S, with U = Mc². */
export function freeCase(r) { const M = r.pick(EMBER); const U = M * CL * CL, T = hawkingT(M), S = bhS(M) * KB; return { M, U, T, S, F: U - T * S }; }

// ── round 5 ──────────────────────────────────────────────────────────────────
const CORES = [[2, 'carbon and oxygen', '2'], [56 / 26, 'iron-56', '56/26'], [62 / 28, 'nickel-62', '62/28']];
/** The ideal Chandrasekhar mass for a core composition. */
export function chandraCase(r) { const [mue, what, frac] = r.pick(CORES); return { mue, what, frac, M: chandra(mue) / MSUN, M2: chandra(2) / MSUN }; }
/** Ember's evaporation time once the CMB has cooled away (photons only). */
export function lifeCase(r) { const M = r.pick(EMBER); return { M, t: bhLife(M) / YEAR }; }

/** U, TS and F as bars. */
function freePic() {
  const B = (x, y, col) => ({ fn: String(y), lower: '0', from: x - 0.32, to: x + 0.32, color: col, alpha: 0.6 });
  return {
    type: 'graph',
    params: {
      x: [-0.2, 3.2], y: [0, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'energy (units of Mc²)', xticks: 0, yticks: 0,
      shade: [B(0.5, 1, 'accent'), { ...B(1.5, 0.8, 'warn'), alpha: 0.2 }, { ...B(2.5, 0.8, 'gold'), alpha: 0.2 }],
      points: [{ x: 0.5, y: 1.05, r: 0.01, color: 'accent', label: 'U = Mc²', labelDx: 0, labelAlign: 'center' }, { x: 1.5, y: 0.85, r: 0.01, color: 'warn', label: 'TS = ?', labelDx: 0, labelAlign: 'center' }, { x: 2.5, y: 0.85, r: 0.01, color: 'gold', label: 'F = ?', labelDx: 0, labelAlign: 'center' }],
    },
    caption: 'Sketch of the bookkeeping: the hole’s energy U = Mc², the product TS of its temperature and entropy, and the free energy F = U − TS. The faint bars are placeholders: their real heights are what you are asked to find.',
  };
}

export default boss({
  title: 'The Black-Hole Engine',
  intro: t`A thought experiment, built from theory that has **never been observed**: Hawking radiation is a firm prediction of quantum field theory near a horizon, but no telescope has seen it. In the far future an engineer finds **Ember**, a small black hole left over from the Big Bang (such primordial holes are allowed by theory, but none has ever been found), drifting through empty space with only the cosmic microwave background, at $2.725$ K, around it. The plan: run a heat engine between Ember’s Hawking radiation and the CMB. Before anyone builds anything, the thermodynamics has to be checked — counting states, temperature from entropy, heat capacities, engines, free energy, information, stars and blackbody radiation, all at once. Five rounds, thirteen problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'Weigh it and count it',
      story: t`Ember’s mass comes from the orbit of a probe sent past it. From the mass alone, Hawking and Bekenstein’s formulas give its temperature and its entropy — the number of hidden states behind its horizon.`,
      items: [
        num({
          id: 'r1-temp', skill: 'phys3700.T11.2', difficulty: 2,
          gen(r) {
            const { M, T } = tempCase(r);
            return {
              prompt: t`Ember’s mass is $${texNum(M, 2)}$ kg. What Hawking temperature does theory predict for it, $T_H = \dfrac{\hbar c^3}{8\pi GMk}$, in kelvin?`,
              answer: T, units: 'K', tol: { rel: 0.01 },
              errors: apart([{ value: T / 2, feedback: 'The denominator is 8πGMk, not 16π.' }, { value: (HBAR * CL * CL) / (8 * Math.PI * G * M * KB), feedback: 'c is cubed in ħc³.' }], T),
              hints: [t`$\dfrac{\hbar c^3}{8\pi Gk} = ${texNum(hawkingT(1), 4)}$ K kg.`, t`Divide by the mass: $T_H \propto 1/M$.`],
              teach: 'T(H) = ħc³/(8πGMk): lighter holes are hotter.',
              explain: t`$T_H = ${texNum(hawkingT(1), 4)}/${texNum(M, 2)} = ${fmt(T, 3)}$ K — warmer than the CMB, because Ember is lighter than the crossover mass of $${texNum(M_CROSS, 2)}$ kg (0.6 Moon masses). A prediction: no Hawking radiation has ever been detected.`,
              visual: hawkingPic({ M, caption: 'Predicted Hawking temperature against mass (log axes); the gold line is Ember’s mass. Theory: never observed.' }),
            };
          },
        }),
        num({
          id: 'r1-bits', skill: 'phys3700.T9.2', difficulty: 3,
          gen(r) {
            const { M, S, bits } = bitsCase(r);
            return {
              prompt: t`Ember ($M = ${texNum(M, 2)}$ kg) has Bekenstein–Hawking entropy $S = \dfrac{4\pi GkM^2}{\hbar c}$. Read as missing information, how many **bits** is that?`,
              answer: bits, tol: { rel: 0.01 },
              errors: apart([{ value: S, feedback: 'That is S/k, in natural units. One bit is k ln 2: divide by ln 2.' }, { value: S / Math.log(10), feedback: 'Divide by ln 2 for bits, not ln 10.' }, { value: S * LN2, feedback: 'Bits = S/(k ln 2): divide by ln 2, do not multiply.' }], bits),
              hints: [t`First $S/k = 4\pi GM^2/(\hbar c) = ${texNum(bhS(1), 4)}\times M^2$ with $M$ in kg.`, t`One bit of missing information is $k\ln 2$ of entropy.`, t`Bits $= (S/k)/\ln 2$.`],
              teach: 'Entropy in bits is S/(k ln 2): a black hole hides an enormous number of yes/no questions.',
              explain: t`$S/k = ${texNum(S, 3)}$, so Ember hides $${texNum(bits, 3)}$ bits — a quarter of its horizon area counted in Planck areas, then divided by $\ln 2$. What those bits are, physically, is one of the deepest open questions in physics.`,
              visual: entropyPic({ M, caption: 'Bekenstein–Hawking entropy against mass (log axes): S ∝ M². The gold line is Ember. Theory.' }),
            };
          },
        }),
        mcq({
          id: 'r1-double', skill: 'phys3700.T2.4', difficulty: 3,
          prompt: t`If Ember swallowed enough matter to **double** its mass, by what factor would its multiplicity $\Omega = e^{S/k}$ change?`,
          choices: [t`It would be raised to the 4th power: $\Omega \to \Omega^4$`, t`It would double: $\Omega \to 2\Omega$`, t`It would be multiplied by 4: $\Omega \to 4\Omega$`, t`It would be squared: $\Omega \to \Omega^2$`],
          answer: 0,
          why: { 1: 'Ω is exponential in S. Doubling M quadruples S, and e^(4S/k) = (e^(S/k))⁴.', 2: 'That would be true if S grew by k ln 4. It grows by a factor of 4, which multiplies Ω by e^(3S/k).', 3: 'S ∝ M², so doubling M quadruples S (not doubles it), and Ω goes to the fourth power.' },
          hints: [t`$S \propto M^2$, so doubling $M$ multiplies $S$ by 4.`, t`$\Omega = e^{S/k}$: what is $e^{4S/k}$ in terms of $\Omega$?`],
          teach: 'Multiplicity is exponential in entropy: multiplying S by n raises Ω to the n-th power.',
          explain: t`$S \propto M^2$, so $S \to 4S$ and $\Omega = e^{S/k} \to e^{4S/k} = \Omega^4$. For Ember, whose $\Omega$ is already $10^{10^{37}}$ or so, that is a number beyond any picture.`,
          visual: entropyPic({ caption: 'Bekenstein–Hawking entropy against mass (log axes): slope 2, so twice the mass is four times the entropy. Theory.' }),
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'Hotter as it shrinks',
      story: t`The engineer notices something odd in the formulas: Ember’s temperature goes *up* as its mass goes down. That has consequences for any attempt to keep it in balance with its surroundings.`,
      items: [
        expr({
          id: 'r2-temp', skill: 'phys3700.T3.1', difficulty: 3,
          prompt: t`Take Ember’s entropy $S = \dfrac{4\pi GkM^2}{\hbar c}$ and its energy $U = Mc^2$. Using $\dfrac1T = \dfrac{dS}{dU}$, find its temperature $T$ in terms of $M$ and the constants.`,
          answer: 'hbar*c^3/(8*pi*G*M*k)',
          answerTeX: t`\frac{\hbar c^3}{8\pi GMk}`,
          vars: { hbar: [0.5, 2], c: [0.5, 2], G: [0.5, 2], M: [0.5, 2], k: [0.5, 2] },
          keys: [['ħ', 'hbar']],
          lhs: 'T',
          errors: [{ answer: 'hbar*c/(8*pi*G*M*k)', feedback: 'dU = c² dM, so dS/dU = (1/c²) dS/dM: that brings in two more powers of c.' }, { answer: 'hbar*c^3/(4*pi*G*M*k)', feedback: 'dS/dM = 8πGkM/(ħc): the derivative of M² is 2M.' }, { answer: '8*pi*G*M*k/(hbar*c^3)', feedback: 'That is 1/T. Invert it.' }],
          hints: [t`$\dfrac{dS}{dU} = \dfrac{1}{c^2}\dfrac{dS}{dM}$.`, t`$\dfrac{dS}{dM} = \dfrac{8\pi GkM}{\hbar c}$.`, t`So $\dfrac1T = \dfrac{8\pi GkM}{\hbar c^3}$; invert.`],
          teach: 'Temperature is the inverse slope of S(U) — for black holes too, giving Hawking’s formula from Bekenstein’s entropy.',
          explain: t`$\dfrac1T = \dfrac{1}{c^2}\cdot\dfrac{8\pi GkM}{\hbar c} \Rightarrow T = \dfrac{\hbar c^3}{8\pi GMk}$ — exactly Hawking’s temperature. Bekenstein’s entropy and Hawking’s radiation are one consistent thermodynamics, though only the mathematics, not the radiation, has been checked.`,
          visual: { type: 'graph', params: { x: [0, 2], y: [0, 4.2], aspect: 'wide', axesAt: 'edge', xlabel: 'energy U = Mc² (arbitrary units)', ylabel: 'entropy S (arbitrary units)', xticks: 0, yticks: 0, curves: [{ fn: 'x^2', domain: [0, 2], color: 'violet', width: 2.4, label: 'S ∝ U²', labelAt: 1.75, labelDx: -50 }], tangent: { fn: 'x^2', at: 1.2 } }, caption: 'Entropy against energy for a black hole (theory): S ∝ U². The slope dS/dU is 1/T, and it gets steeper as U grows — so T falls.' },
        }),
        num({
          id: 'r2-cap', skill: 'phys3700.T1.5', difficulty: 3,
          gen(r) {
            const { M, C, T } = capCase(r);
            return {
              prompt: t`What is Ember’s heat capacity $C = dU/dT$, with $U = Mc^2$ and $T = T_H$, for $M = ${texNum(M, 2)}$ kg? Give it in J/K, with its sign.`,
              answer: C, units: 'J/K', tol: { rel: 0.01 },
              errors: apart([{ value: -C, feedback: 'T(H) falls as M rises, so dU/dT is negative.' }, { value: C / 2, feedback: 'C = −Mc²/T(H) = −8πGM²k/(ħc).' }, { value: -(M * CL * CL) * T, feedback: 'dU/dT = −U/T: divide by the temperature.' }], C),
              hints: [t`$T_H \propto 1/M$, so $U = Mc^2 \propto 1/T$.`, t`If $U = a/T$ then $dU/dT = -a/T^2 = -U/T$.`, t`$C = -Mc^2/T_H$ with $T_H = ${fmt(T, 3)}$ K.`],
              teach: 'A black hole’s heat capacity is negative: it cools as it absorbs energy and heats as it radiates.',
              explain: t`$C = -\dfrac{Mc^2}{T_H} = -\dfrac{(${texNum(M, 2)})(${texNum(CL * CL, 4)})}{${fmt(T, 3)}} = ${texNum(C, 3)}$ J/K. Huge and negative: every joule Ember radiates makes it hotter.`,
              visual: { type: 'graph', params: { x: [0.2, 3], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'mass M (arbitrary units)', ylabel: 'T(H) (arbitrary units)', curves: [{ fn: '1/x', domain: [0.34, 3], color: 'violet', width: 2.4 }], arrows: [{ from: [1, 1], to: [1.5, 0.6667], color: 'warn', label: 'gain energy: cooler', labelDx: 6 }, { from: [1, 1], to: [0.6, 1.6667], color: 'accent', label: 'lose energy: hotter', labelDx: 6 }], points: [{ x: 1, y: 1, r: 5, color: 'gold' }] }, caption: 'T(H) ∝ 1/M (theory): moving right along the curve adds energy and lowers the temperature.' },
            };
          },
        }),
        mcq({
          id: 'r2-bath', skill: 'phys3700.T9.1', difficulty: 3,
          prompt: 'The engineer proposes to hold Ember steady by surrounding it with a huge reservoir kept exactly at Ember’s temperature. Will Ember stay in equilibrium with it?',
          choices: [
            'No: any small fluctuation runs away, because with C < 0 a hole that gains energy cools and so gains more, while one that loses energy heats and loses more',
            'Yes: equal temperatures mean no net heat flow, and the reservoir damps any fluctuation',
            'Yes, provided the reservoir is large enough',
            'No, because black holes cannot exchange heat with anything',
          ],
          answer: 0,
          why: { 1: 'Equal temperatures give no net flow, but stability needs a positive heat capacity: a fluctuation must push the temperature back, and here it pushes it further away.', 2: 'The reservoir’s size does not help: in the canonical ensemble σ(E)² = kT²C, which cannot be negative.', 3: 'They absorb everything that falls in and (in theory) radiate: they exchange heat freely.' },
          hints: ['Suppose Ember absorbs a little extra from the reservoir. What happens to its temperature, and so to the next exchange?', t`In the canonical ensemble $\sigma_E^2 = kT^2C$. What if $C < 0$?`],
          teach: 'A system with negative heat capacity cannot sit in stable equilibrium with a heat bath.',
          explain: t`Gaining energy lowers $T_H$ below the reservoir, so Ember absorbs more and keeps cooling; losing energy raises $T_H$, so it radiates more and keeps heating. The equilibrium exists but is unstable — the canonical formula $\sigma_E^2 = kT^2C$ would need a negative variance. A black hole can be in stable equilibrium only inside a box small enough, with its total energy fixed — the microcanonical ensemble (Hawking, 1976).`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 4], aspect: 'wide', axesAt: 'edge', xlabel: 'energy U', ylabel: 'temperature T', xticks: 0, yticks: 0, curves: [{ fn: '0.6 + 0.8*x', domain: [0, 4], color: 'accent', label: 'ordinary body, C > 0', labelAt: 2.6, labelDy: -12, labelDx: -40 }, { fn: '4/(x + 0.6)', domain: [0.4, 4], color: 'violet', label: 'black hole, C < 0', labelAt: 3.1, labelDy: 14 }], hlines: [{ y: 1.6, color: 'ink3', label: 'reservoir' }] }, caption: 'Sketch: an ordinary body (blue) is pushed back to the reservoir’s temperature by heat flow; a black hole (violet) is pushed away from it.' },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'Which way does the energy flow?',
      story: t`An engine needs a hot reservoir and a cold one. Ember radiates (in theory) at $T_H$; the universe around it is the CMB at $2.725$ K. Before building, the engineer checks the direction of the flow, the best possible efficiency, and the power actually on offer.`,
      items: [
        mcq({
          id: 'r3-flow', skill: 'phys3700.T11.2', difficulty: 3,
          gen(r) {
            const { M, what, T, out } = flowCase(r);
            const choices = ['Net energy flows out of the hole: it shrinks, and so heats up further', 'Net energy flows into the hole: it grows, and so cools further', 'Net energy flows into the hole: it grows, and so warms up', 'Net energy flows out of the hole: it shrinks, and so cools down'];
            const answer = out ? 0 : 1;
            const why = out
              ? { 1: t`Its predicted $T_H = ${texNum(T, 3)}$ K is above the CMB’s $2.725$ K, so it emits more than it absorbs.`, 2: 'It is hotter than the CMB, so energy leaves; and gaining mass would cool it, not warm it.', 3: 'Losing mass raises T(H) ∝ 1/M: it heats as it shrinks.' }
              : { 0: t`Its predicted $T_H = ${texNum(T, 3)}$ K is below the CMB’s $2.725$ K, so it absorbs more than it emits.`, 2: 'Gaining mass lowers T(H) ∝ 1/M: it cools as it grows.', 3: 'It is colder than the CMB, so energy flows in, not out.' };
            return {
              prompt: t`A black hole of ${what} sits in today’s CMB at $2.725$ K. Treating both as blackbodies, which way does net energy flow, and what happens to the hole’s temperature as a result?`,
              choices, answer, why,
              hints: [t`Compute $T_H = ${texNum(hawkingT(1), 4)}\ \text{K kg}/M$ and compare it with $2.725$ K.`, 'Heat flows net from the hotter body to the colder one.', t`Then use $T_H \propto 1/M$: does the hole’s temperature move towards the CMB’s or away from it?`],
              teach: 'Holes lighter than about 0.6 Moon masses are (in theory) hotter than the CMB and evaporate faster and faster; heavier ones are colder and grow colder still.',
              explain: t`$T_H = ${texNum(T, 3)}$ K, ${out ? 'above' : 'below'} the CMB’s $2.725$ K. So net energy flows ${out ? 'out' : 'in'}; the hole ${out ? 'loses mass, and since T(H) ∝ 1/M it heats up — a runaway towards evaporation' : 'gains mass, and since T(H) ∝ 1/M it cools — it falls ever further below the CMB'}. Negative heat capacity makes both directions runaways. Every black hole yet observed is far heavier than the crossover, so all of them are growing.`,
              visual: hawkingPic({ M, caption: 'Predicted Hawking temperature against mass (log axes, theory), with this hole’s mass in gold and today’s CMB in orange.' }),
            };
          },
        }),
        num({
          id: 'r3-carnot', skill: 'phys3700.T4.1', difficulty: 3,
          gen(r) {
            const { M, T, eff } = carnotCase(r);
            return {
              prompt: t`The engine would take heat from Ember’s radiation, at $T_H = ${fmt(T, 4)}$ K (for $M = ${texNum(M, 2)}$ kg), and dump waste heat into the CMB at $2.725$ K. What is the largest efficiency any engine between these two reservoirs could have? Give a fraction.`,
              answer: eff, tol: { rel: 0.005 },
              errors: apart([{ value: T_CMB / T, feedback: 'That is T(c)/T(h), the share of heat that must be thrown away. The efficiency is 1 − T(c)/T(h).' }, { value: 1 - (T_CMB + 273.15) / (T + 273.15), feedback: 'Use absolute temperatures in kelvin, not Celsius.' }], eff),
              hints: ['The Carnot limit: e = 1 − T(c)/T(h), with absolute temperatures.', t`$T_h = ${fmt(T, 4)}$ K, $T_c = 2.725$ K.`],
              teach: 'No engine beats the Carnot efficiency 1 − T(c)/T(h) — even one burning a black hole’s radiation.',
              explain: t`$e_\text{max} = 1 - 2.725/${fmt(T, 4)} = ${fmt(eff, 3)}$. The second law does not care what the hot reservoir is made of. (And with $C < 0$, every joule taken from Ember makes it hotter, so the efficiency would creep up as it ran.)`,
              visual: { type: 'therm-pv', params: { mode: 'flow', device: 'engine', Qh: 4, Qc: 1, W: 3, labels: { Qh: 'Q(h)', Qc: 'Q(c) = ?', W: 'W = ?', hot: 'Ember at T(H)', cold: 'CMB at 2.725 K', device: 'Carnot engine' } }, caption: 'Energy flow through an engine taking heat Q(h) from Ember’s radiation and rejecting Q(c) to the CMB. Arrow widths are illustrative, not this engine’s numbers.' },
            };
          },
        }),
        num({
          id: 'r3-power', skill: 'phys3700.T7.4', difficulty: 4,
          gen(r) {
            const { M, T, A, P, Pout } = powerCase(r);
            return {
              prompt: t`How much power would Ember actually supply? Model it as a perfect blackbody with the horizon’s area $A = 4\pi r_s^2$ ($r_s = 2GM/c^2$), emitting only photons at $T_H = ${fmt(T, 4)}$ K and absorbing the CMB at $2.725$ K. For $M = ${texNum(M, 2)}$ kg, what is the **net** power it radiates, in watts?`,
              answer: P, units: 'W', tol: { rel: 0.01 },
              errors: apart([{ value: Pout, feedback: 'Subtract what it absorbs from the CMB: P = σA(T(H)⁴ − T(CMB)⁴).' }, { value: SIGMA * Math.PI * rs(M) ** 2 * (T ** 4 - T_CMB ** 4), feedback: 'A sphere’s area is 4πr², not πr².' }, { value: SIGMA * A * (T - T_CMB) ** 4, feedback: 'Subtract the fourth powers, not the temperatures: σA(T(H)⁴ − T(CMB)⁴).' }], P),
              hints: [t`$r_s = 2GM/c^2 = ${texNum(rs(M), 3)}$ m, so $A = ${texNum(A, 3)}\ \text{m}^2$.`, t`Stefan–Boltzmann: $P = \sigma A\,(T_H^4 - T_\text{CMB}^4)$ with $\sigma = 5.670\times10^{-8}$ W m⁻² K⁻⁴.`],
              teach: 'Net radiated power between two blackbodies is σA(T₁⁴ − T₂⁴).',
              explain: t`$A = ${texNum(A, 3)}\ \text{m}^2$ — Ember’s horizon is $${fmt(2 * rs(M) * 1e6, 3)}$ μm across — so $P = \sigma A(T_H^4 - T_\text{CMB}^4) = ${texNum(P, 3)}$ W. A thousand Embers would not light an LED. The engine is a thermodynamic curiosity, not a power plant: only holes far lighter, and far hotter, radiate usefully — and none is known. (Real emission would include gravitons and neutrinos and would be filtered by greybody factors; the order of magnitude stands.)`,
              visual: { type: 'mp-blackbody', params: { T: r4(T), axis: 'log', compare: ['cmb'], peak: false, readout: false, controls: false, swatch: false, band: false, window: 'all' }, caption: `Ember’s predicted spectrum as an ideal ${fmt(T, 3)} K blackbody beside the CMB (faint). Theory: Hawking radiation has never been observed.` },
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'Feeding the hole',
      story: t`The engineer wonders about the reverse: dumping waste into a black hole. Doesn’t that delete its entropy from the universe? And how much of a hole’s energy could ever be turned into work?`,
      items: [
        num({
          id: 'r4-gsl', skill: 'phys3700.T3.4', difficulty: 4,
          gen(r) {
            const { M, what, m, T, dS, Sbox, lg } = gslCase(r);
            return {
              prompt: t`A $${m}$ kg canister of nitrogen at room conditions, with entropy $${texNum(Sbox, 3)}$ J/K, falls into ${what} ($M = ${texNum(M, 2)}$ kg, $T_H = ${texNum(T, 3)}$ K). Its entropy disappears from the outside world, but the hole gains energy $mc^2$, raising its entropy by $\Delta S = mc^2/T_H$ (the thermodynamic identity $dS = dU/T$). What is $\log_{10}$ of $\Delta S_\text{hole}/S_\text{canister}$?`,
              answer: lg, tol: { rel: 0, abs: 0.02 },
              errors: [{ value: Math.log10((m * CL) / T / Sbox), feedback: 'The energy added is mc², with c squared.' }, { value: Math.log10(dS), feedback: 'Divide by the canister’s entropy before taking the logarithm.' }],
              hints: [t`$\Delta S_\text{hole} = mc^2/T_H$.`, t`$mc^2 = ${texNum(m * CL * CL, 3)}$ J; divide by $T_H$, then by $${texNum(Sbox, 3)}$ J/K.`],
              teach: 'The generalized second law: what falls in adds far more entropy to the hole than it takes from outside.',
              explain: t`$\Delta S_\text{hole} = ${texNum(dS, 3)}$ J/K, so the ratio is $10^{${fmt(lg, 3)}}$. Total entropy — outside plus horizon — goes up enormously: Bekenstein’s generalized second law, the reason he gave black holes entropy in the first place.`,
              visual: hawkingPic({ M, caption: 'Predicted Hawking temperature against mass (theory), with this hole in gold. The colder the hole, the more entropy each joule adds: dS = dU/T.' }),
            };
          },
        }),
        num({
          id: 'r4-free', skill: 'phys3700.T5.1', difficulty: 4,
          gen(r) {
            const { M, U, T, S, F } = freeCase(r);
            return {
              prompt: t`Treat Ember ($M = ${texNum(M, 2)}$ kg) as a thermodynamic system with energy $U = Mc^2$, temperature $T_H = \dfrac{\hbar c^3}{8\pi GMk}$ and entropy $S = \dfrac{4\pi GkM^2}{\hbar c}$. What is its Helmholtz free energy $F = U - T_HS$, in joules?`,
              answer: F, units: 'J', tol: { rel: 0.01 },
              errors: apart([{ value: U, feedback: 'Subtract T(H)S: it is not zero.' }, { value: T * S, feedback: 'That is T(H)S alone; F = U − T(H)S.' }, { value: -F, feedback: 'Check the sign: F = U − TS.' }], F),
              hints: [t`Multiply the formulas: $T_HS = \dfrac{\hbar c^3}{8\pi GMk}\cdot\dfrac{4\pi GkM^2}{\hbar c}$.`, t`Almost everything cancels: $T_HS = \tfrac12Mc^2$.`, t`So $F = Mc^2 - \tfrac12Mc^2$.`],
              teach: 'For a black hole T(H)S = Mc²/2, so F = Mc²/2 whatever its mass (Smarr’s relation, for a non-rotating hole).',
              explain: t`$T_HS = \tfrac12Mc^2$ for every Schwarzschild hole, so $F = \tfrac12Mc^2 = ${texNum(F, 3)}$ J — the same half for every mass. Free energy bounds the work extractable at fixed temperature; but Ember cannot be held at fixed temperature (round 2), so even this is an idealization.`,
              visual: freePic(),
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'Origins and endings',
      story: t`Most black holes are not like Ember: they are born when the core of a massive star grows too heavy for its degenerate electrons to hold up. And Ember itself will not last for ever.`,
      items: [
        num({
          id: 'r5-chandra', skill: 'phys3700.T11.1', difficulty: 3,
          gen(r) {
            const { mue, what, frac, M, M2 } = chandraCase(r);
            return {
              prompt: t`A stellar core made of ${what} has $\mu_e = ${frac}$ nucleons per electron. Its ideal Chandrasekhar mass is $M_\text{Ch} = 3.098\left(\dfrac{\hbar c}{G}\right)^{3/2}\dfrac{1}{(\mu_e m_p)^2}$, which is $${fmt(M2, 4)}\,M_\odot$ for $\mu_e = 2$. What is it for this core, in solar masses?`,
              answer: M, units: 'Msun', tol: { rel: 0.005 },
              errors: apart([{ value: M2 * (2 / mue), feedback: 'M(Ch) ∝ 1/μₑ²: square the ratio 2/μₑ.' }, { value: M2 * (mue / 2) ** 2, feedback: 'More nucleons per electron means fewer electrons for the same mass: the limit falls.' }], M),
              hints: [t`$M_\text{Ch} \propto 1/\mu_e^2$, so $M_\text{Ch} = ${fmt(M2, 4)}\,(2/\mu_e)^2\,M_\odot$.`, t`$\mu_e = ${fmt(mue, 4)}$.`],
              teach: 'Electron degeneracy can hold up at most about 1.4 solar masses: above it, a core collapses.',
              explain: t`$M_\text{Ch} = ${fmt(M2, 4)}\times(2/${fmt(mue, 4)})^2 = ${fmt(M, 3)}\,M_\odot$. ${mue === 2 ? 'This is the white-dwarf limit.' : 'An iron-group core that outgrows this collapses in under a second;'} if what is left is heavy enough, not even neutron pressure stops it, and a stellar black hole forms — a hole of several solar masses, tens of millions of times colder than the CMB.`,
              visual: { type: 'graph', params: { x: [1.8, 2.3], y: [1.0, 1.9], aspect: 'wide', axesAt: 'edge', xlabel: 'nucleons per electron μₑ', ylabel: 'M(Ch) (M☉)', curves: [{ fn: `${r4(M2)}*(2/x)^2`, domain: [1.8, 2.3], color: 'accent', width: 2.4 }], vlines: [{ x: r4(mue), color: 'gold' }] }, caption: 'The ideal Chandrasekhar mass against nucleons per electron (cold, non-rotating; the proton mass as the mass per nucleon). The gold line is this core.' },
            };
          },
        }),
        num({
          id: 'r5-life', skill: 'phys3700.T11.2', difficulty: 3,
          gen(r) {
            const { M, t: life } = lifeCase(r);
            return {
              prompt: t`In the far future the CMB will have cooled far below Ember’s temperature, and Ember will evaporate unopposed. Counting photons only, a hole evaporates in $t = \dfrac{5120\pi G^2M^3}{\hbar c^4}$. For $M = ${texNum(M, 2)}$ kg, how long is that, in years?`,
              answer: life, units: 'yr', tol: { rel: 0.01 },
              errors: apart([{ value: life * YEAR, feedback: 'That is in seconds: divide by 3.156 × 10⁷ s per year.' }, { value: (5120 * Math.PI * G * G * M * M) / (HBAR * CL ** 4) / YEAR, feedback: 'The mass is cubed: M³, not M².' }], life),
              hints: [t`$\dfrac{5120\pi G^2}{\hbar c^4} = ${texNum((5120 * Math.PI * G * G) / (HBAR * CL ** 4), 4)}$ s kg⁻³.`, t`Multiply by $M^3$, then divide by $3.156\times10^7$ s/yr.`],
              teach: 'Evaporation time grows as M³: holes much heavier than a mountain outlive the present universe by unimaginable factors.',
              explain: t`$t = ${texNum(life, 3)}$ yr — some $10^{${Math.floor(Math.log10(life / 1.38e10))}}$ times the present age of the universe. Its last moments would be the fastest: with $C < 0$ it heats as it shrinks, ending (in theory) in a burst of radiation. Real emission includes other particles, which shortens this somewhat; and all of it remains unobserved.`,
              visual: { type: 'graph', params: { x: [20, 24], y: [36, 50], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'mass (kg)', ylabel: 'lifetime (yr), photons only', curves: [{ fn: `${r4(Math.log10(bhLife(1) / YEAR))} + 3*x`, domain: [20, 24], color: 'violet' }], vlines: [{ x: r4(Math.log10(M)), color: 'gold' }] }, caption: 'Photons-only evaporation time against mass (log axes): a line of slope 3. The gold line is Ember. Theory.' },
            };
          },
        }),
      ],
    },
  ],
});

