// Induced charge and capacitors (Griffiths §2.5.4): why C = Q/V depends only
// on geometry, the recipe (Gauss → E → V → C), spherical and coaxial
// capacitors and the parallel-plate limit, the isolated sphere (the Earth's
// 710 μF), grounding an outer shell, energy ½CV² and the force between
// plates at fixed charge, battery connected or not. Transfer: the
// differential capacitive sensor in a MEMS accelerometer. Builds on
// phys2220.E5.1–E5.3.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, KC, sf, field } from './_bvp.js';

const t = String.raw;
const RE = 6.371e6;

/** Two concentric conductors in cross-section, inner radius a and outer b (graph). */
const concentric = (a, b, caption, { coax = false } = {}) => ({
  type: 'graph',
  params: {
    x: [-2.4 * b, 2.4 * b], y: [-1.3 * b, 1.3 * b], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: `sqrt(max(${a * a} - x^2, 0))`, lower: `-sqrt(max(${a * a} - x^2, 0))`, from: -a, to: a, color: 'warn', alpha: 0.35 }],
    curves: [{ param: [`${a}*cos(t)`, `${a}*sin(t)`], t: [0, 2 * Math.PI], color: 'warn', width: 2.5 }, { param: [`${b}*cos(t)`, `${b}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent', width: 3 }],
    arrows: [{ from: [0, 0], to: [a * 0.707, -a * 0.707], color: 'gold', width: 2, label: 'a', labelDx: 4, labelDy: 10 }, { from: [0, 0], to: [-b * 0.866, b * 0.5], color: 'gold', width: 2, label: 'b', labelDx: -14, labelDy: -4 }],
    points: [{ x: 0, y: -1.18 * b, r: 0, label: coax ? 'cross-section of a long coaxial pair' : 'cross-section through the centre', labelAlign: 'center', labelDx: 0, labelDy: 0 }],
  },
  caption,
});

export default lesson({
  id: 'phys3600.M3.2',
  title: 'Induced charge and capacitors',
  minutes: 15, difficulty: 3,
  equation: t`C = \frac{Q}{V}, \qquad W = \frac12CV^2 = \frac{Q^2}{2C}`,
  intro: t`Put $+Q$ on one conductor and $-Q$ on another. Laplace’s equation is linear, so doubling $Q$ doubles the field everywhere and doubles the potential difference $V$ between them: the ratio $C = Q/V$, the **capacitance**, depends only on the shapes and the gap. Finding it is always the same recipe — Gauss’s law for $\vec E$, a line integral from one conductor to the other for $V$, then divide. The energy stored is the work of moving charge across that rising $V$, $\tfrac12CV^2$. The parallel-plate formula $\varepsilon_0A/d$ of [Physics II](#/lesson/phys2220.E5.1) turns out to be the thin-gap limit of every geometry.`,
  symbols: [
    { tex: 'C', text: 'the capacitance, in farads (F = C/V)' },
    { tex: 'Q', text: t`the charge on the positive conductor (the other holds $-Q$), in C` },
    { tex: 'V', text: 'the potential difference between the conductors, in V' },
    { tex: 'W', text: 'the energy stored, in J — all of it in the field between the conductors' },
  ],
  why: t`Capacitive sensors — in phones, inertial measurement units, fuel gauges and the accelerometers of gravity missions — read tiny motions as changes in $C$, and the energy formula is how you compute electrostatic forces in them.`,
  visual: {
    type: 'graph',
    title: 'Every capacitor is a parallel-plate capacitor up close',
    lead: t`Capacitance of two concentric spheres (or two coaxial cylinders) of radii $a$ and $b$, against the gap ratio $b/a$. Blue: exact. Dashed: the parallel-plate estimate $\varepsilon_0A/d$, with $A$ the inner conductor’s area and $d = b - a$.`,
    tasks: [
      t`Slide $b/a$ toward 1: the two curves merge — a thin gap looks flat, and $\varepsilon_0A/d$ is exact in the limit.`,
      t`Spheres, $b/a \to \infty$: the exact curve levels off at 1 — an isolated sphere, $C = 4\pi\varepsilon_0a$. The plate estimate wrongly falls to zero.`,
      t`Switch to cylinders: now even the exact value falls (as $1/\ln(b/a)$) — an isolated infinite wire has no finite capacitance.`,
    ],
    params: {
      x: [1, 6], y: [0, 6], aspect: 'wide', xlabel: 'b / a', ylabel: 'C (scaled)',
      choices: [{ key: 'g', label: 'Geometry', options: [[0, 'spheres'], [1, 'coaxial cylinders']], value: 0, explain: 'Spheres: C in units of 4πε₀a. Cylinders: capacitance per length in units of 2πε₀.' }],
      sliders: [{ key: 'u', label: t`Gap ratio $b/a$`, min: 1.05, max: 6, step: 0.05, value: 1.5, explain: 'The outer radius over the inner one.' }],
      curves: [
        { fn: 'x/(x - 1)', domain: [1.02, 6], color: 'accent', width: 2.6, when: 'step(0.5 - g)' },
        { fn: '1/ln(x)', domain: [1.02, 6], color: 'accent', width: 2.6, when: 'step(g - 0.5)' },
        { fn: '1/(x - 1)', domain: [1.02, 6], color: 'gold', width: 2, dash: [6, 4] },
      ],
      vlines: [{ x: 'u', color: 'violet' }],
      hlines: [{ y: 1, color: 'ink3', when: 'step(0.5 - g)' }],
      legend: [{ label: 'exact', color: 'accent' }, { label: 'parallel-plate estimate', color: 'gold', dash: true }, { label: 'isolated sphere (spheres only)', color: 'ink3', dash: true }],
      legendAt: 'tr',
      readouts: [
        { label: 'exact', expr: 'step(0.5 - g)*u/(u - 1) + step(g - 0.5)/ln(u)', digits: 3 },
        { label: 'plate estimate', expr: '1/(u - 1)', digits: 3 },
        { label: 'exact ÷ estimate', expr: '(step(0.5 - g)*u/(u - 1) + step(g - 0.5)/ln(u))*(u - 1)', digits: 3 },
      ],
    },
    caption: t`Spheres: $C/4\pi\varepsilon_0a = \dfrac{b/a}{b/a - 1}$. Cylinders: $(C/L)/2\pi\varepsilon_0 = 1/\ln(b/a)$. Both exact for ideal conductors in vacuum; real coaxial cables are filled with a dielectric (module M5), which multiplies $C$ by its dielectric constant.`,
  },
  example: {
    prompt: t`Find the capacitance of two concentric metal spheres, radii $a = 5$ cm and $b = 6$ cm, and the energy stored at 1 kV. Then let $b \to \infty$.`,
    visual: concentric(5, 6, t`Inner sphere (orange, $+Q$) and outer shell (blue, $-Q$), to scale. The field lives only in the gap.`),
    steps: [
      { label: 'Field', text: t`Between the spheres a Gaussian sphere encloses $Q$: $E = \dfrac{Q}{4\pi\varepsilon_0r^2}$, outward. Inside the inner one and outside the outer one, $E = 0$.` },
      { label: 'Potential difference', text: t`$V = -\displaystyle\int_b^a E\,dr = \dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1a - \dfrac1b\right) = \dfrac{Q}{4\pi\varepsilon_0}\dfrac{b - a}{ab}$.` },
      { label: 'Divide', text: t`$C = \dfrac{Q}{V} = 4\pi\varepsilon_0\dfrac{ab}{b - a} = 4\pi(8.854\times10^{-12})\dfrac{(0.05)(0.06)}{0.01} \approx ${nice(sf((4 * Math.PI * EPS0 * 0.003) / 0.01 * 1e12, 3))}$ pF. $Q$ cancelled, as it must.` },
      { label: 'Energy', text: t`$W = \tfrac12CV^2 = \tfrac12(${nice(sf((4 * Math.PI * EPS0 * 0.003) / 0.01 * 1e12, 3))}\times10^{-12})(1000)^2 \approx ${nice(sf((0.5 * (4 * Math.PI * EPS0 * 0.003)) / 0.01 * 1e6 * 1e6, 3))}\ \mu\text{J}$.` },
      { label: 'Limits', text: t`Thin gap: $ab/(b - a) \approx a^2/d$, so $C \approx \varepsilon_0(4\pi a^2)/d$ — parallel plates. Outer shell far away: $C \to 4\pi\varepsilon_0a \approx ${nice(sf(4 * Math.PI * EPS0 * 0.05 * 1e12, 3))}$ pF, the capacitance of an isolated sphere.` },
    ],
    answer: t`$C = 4\pi\varepsilon_0\dfrac{ab}{b - a} \approx ${nice(sf((4 * Math.PI * EPS0 * 0.003) / 0.01 * 1e12, 3))}$ pF; $W \approx ${nice(sf((0.5 * (4 * Math.PI * EPS0 * 0.003)) / 0.01 * 1e12, 3))}\ \mu\text{J}$ at 1 kV.`,
  },
  practice: [
    num({
      id: 'earth', difficulty: 1,
      gen(r) {
        const [name, R] = r.pick([['the Earth', RE], ['the Moon', 1.7374e6], ['Mars', 3.3895e6]]);
        const C = 4 * Math.PI * EPS0 * R;
        return {
          prompt: t`Treat ${name} (mean radius $${tex(R, 5)}$ m) as an isolated conducting sphere. What is its capacitance, in microfarads?`,
          visual: concentric(1, 3, 'An isolated sphere is the limit of a spherical capacitor whose outer shell has moved off to infinity.'),
          answer: C * 1e6, units: 'uF', tol: { rel: 0.01 },
          errors: [{ value: (EPS0 * R) * 1e6, feedback: t`An isolated sphere has $C = 4\pi\varepsilon_0R$: you lost the $4\pi$.` }],
          hints: [t`$V = Q/(4\pi\varepsilon_0R)$ for an isolated sphere, so $C = 4\pi\varepsilon_0R$.`],
          teach: 'An isolated conducting sphere has capacitance 4πε₀R: about 111 pF per metre of radius.',
          explain: t`$C = 4\pi\varepsilon_0R = 4\pi(8.854\times10^{-12})(${tex(R, 5)}) \approx ${nice(sf(C * 1e6, 3))}\ \mu\text{F}$ — a whole planet, less than a millifarad. The farad is a huge unit.`,
        };
      },
    }),
    num({
      id: 'coax', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 2]), ratio = r.pick([2.3, 3.5, 5]), b = +(a * ratio).toFixed(2);
        const c = (2 * Math.PI * EPS0) / Math.log(b / a);
        return {
          prompt: t`A long air-filled coaxial line has an inner conductor of radius ${a} mm and an outer one of inner radius ${b} mm. What is its capacitance per metre?`,
          visual: concentric(a, b, t`The coaxial pair in cross-section, to scale: the inner conductor (orange) carries $+\lambda$ per length, the outer (blue) $-\lambda$.`, { coax: true }),
          answer: c * 1e12, units: 'pF/m', tol: { rel: 0.01 },
          errors: [{ value: ((2 * Math.PI * EPS0) / Math.log10(b / a)) * 1e12, feedback: t`The logarithm is natural: $\int dr/r = \ln r$.` }, { value: ((2 * Math.PI * EPS0 * a) / (b - a)) * 1e12, feedback: 'That is the parallel-plate estimate (inner area over gap). The gap here is not thin compared with the radius, so it is badly off.' }],
          hints: [t`Gauss: $E = \lambda/(2\pi\varepsilon_0s)$ between the conductors.`, t`$V = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac ba$, so $\dfrac{C}{L} = \dfrac{2\pi\varepsilon_0}{\ln(b/a)}$.`],
          teach: 'A coaxial pair has C/L = 2πε₀/ln(b/a): only the ratio of the radii matters.',
          explain: t`$\dfrac CL = \dfrac{2\pi(8.854\times10^{-12})}{\ln(${nice(sf(b / a, 4))})} \approx ${nice(sf(c * 1e12, 3))}\ \text{pF/m}$. Only the ratio $b/a$ appears: scaling a cable up or down leaves its capacitance per length — and its impedance — unchanged.`,
        };
      },
    }),
    order({
      id: 'recipe', difficulty: 2,
      prompt: 'Put the steps for finding a capacitance in order.',
      visual: concentric(2, 3, 'Two conductors, +Q on one and −Q on the other.'),
      items: [
        t`Put $+Q$ on one conductor and $-Q$ on the other`,
        t`Find $\vec E$ between them (Gauss’s law, when symmetry allows)`,
        t`Integrate $-\vec E\cdot d\vec l$ from one conductor to the other to get $V$`,
        t`Divide: $C = Q/V$ — the $Q$ must cancel`,
      ],
      hints: ['You cannot integrate a field you have not found yet.'],
      teach: 'Capacitance: charge, field, potential difference, ratio — and Q always cancels.',
      explain: t`Charge → field → potential difference → ratio. If $Q$ does not cancel at the end, something has gone wrong: linearity guarantees $V \propto Q$.`,
    }),
    mcq({
      id: 'ground', difficulty: 3,
      prompt: t`A charged metal sphere ($+Q$) sits at the centre of a neutral, isolated metal shell. You then connect the shell to ground. What happens?`,
      visual: field({ x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 4.5, a: 3, Q: 0 }, charges: [{ x: 0, y: 0, q: 3 }], fieldLines: true, density: 12, equip: true, dV: 400 }, t`Before grounding: a central charge (standing in for the sphere) inside a neutral shell. The shell’s inner wall holds $-Q$ and its outer surface $+Q$.`),
      choices: [
        t`The outer surface’s $+Q$ flows to ground; the inner $-Q$ stays, and the field outside vanishes`,
        t`The inner wall’s $-Q$ flows to ground, and the field outside doubles`,
        t`Nothing changes: the shell was already at zero potential`,
        t`All the shell’s charge flows away, so the field inside the shell vanishes too`,
      ],
      answer: 0,
      why: {
        1: t`The inner $-Q$ is held by the central $+Q$’s field lines, which must end somewhere: on the wall.`,
        2: t`An isolated shell with $+Q$ on its outside sits at $V = kQ/b$, not zero.`,
        3: 'The central charge still sends field lines to the inner wall; that field is unchanged.',
      },
      hints: ['Before grounding, the shell sits at V = kQ/b. Grounding forces V = 0. What has to leave?', 'The field inside the cavity is fixed by the central charge and the wall — only the outer surface is free to change.'],
      teach: 'Grounding fixes a conductor’s potential, not its charge: whatever charge is needed flows in or out.',
      explain: t`Grounding pins the shell at $V = 0$, which means no field outside, so the outer surface must end up with zero charge: its $+Q$ drains to ground. The inner $-Q$ stays to terminate the central sphere’s field lines. This is the standard spherical capacitor — and a shield: nothing outside can tell the charge is there.`,
    }),
    num({
      id: 'force', difficulty: 3,
      gen(r) {
        const Q = r.pick([5, 10, 20]), A = r.pick([50, 100, 200]);
        const F = ((Q * 1e-9) ** 2) / (2 * EPS0 * A * 1e-4);
        return {
          prompt: t`An isolated parallel-plate capacitor holds $\pm${Q}$ nC on plates of area ${A} cm². What force does one plate exert on the other?`,
          visual: { type: 'em-capacitor', params: { A: A * 1e-4, d: 2e-3, connected: false, Q: Q * 1e-9, material: 'vacuum', f: 0, controls: false, show: { charges: true, field: true, energy: false, values: false }, readouts: [], hide: ['Q', 'A'] }, caption: 'An isolated capacitor: its charge is fixed. The plates attract. Fringing ignored.' },
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [{ value: (((Q * 1e-9) ** 2) / (EPS0 * A * 1e-4)) * 1e3, feedback: t`Each plate feels the **other** plate’s field, $\sigma/2\varepsilon_0$, not the full $\sigma/\varepsilon_0$ between them.` }],
          hints: [t`At fixed $Q$, $W = Q^2/2C = Q^2x/(2\varepsilon_0A)$ for a gap $x$, and $F = -dW/dx$.`, t`So $|F| = Q^2/(2\varepsilon_0A)$ — independent of the gap.`],
          teach: 'At fixed charge, the force is minus the derivative of the stored energy; for parallel plates it is Q²/(2ε₀A), whatever the gap.',
          explain: t`$F = \dfrac{Q^2}{2\varepsilon_0A} = \dfrac{(${Q}\times10^{-9})^2}{2(8.854\times10^{-12})(${A}\times10^{-4})} \approx ${nice(sf(F * 1e3, 3))}$ mN, attractive. The same as $Q\cdot\sigma/2\varepsilon_0$: each plate feels only the other’s field — the pressure $\sigma^2/2\varepsilon_0$ of [M3.1](#/lesson/phys3600.M3.1).`,
        };
      },
    }),
    mcq({
      id: 'battery', difficulty: 3,
      prompt: t`You double the gap of a parallel-plate capacitor. Case 1: the battery stays connected. Case 2: it was disconnected first. What happens to the stored energy?`,
      visual: { type: 'em-capacitor', params: { A: 0.01, d: 2e-3, V: 12, connected: true, material: 'vacuum', f: 0, controls: ['d', 'connected'], show: { charges: true, field: true, energy: true, values: false }, readouts: [] }, caption: 'Try both: change the gap with the battery connected and disconnected. (No readouts: reason it out.)' },
      choices: [t`Case 1: it halves. Case 2: it doubles.`, t`Case 1: it doubles. Case 2: it halves.`, t`It halves in both cases`, t`It doubles in both cases`],
      answer: 0,
      why: {
        1: t`Swapped. With $V$ fixed, $W = \tfrac12CV^2$ falls with $C$; with $Q$ fixed, $W = Q^2/2C$ rises.`,
        2: t`With $Q$ fixed, $W = Q^2/2C$ and $C$ halved: the energy doubles — you did work pulling the plates apart.`,
        3: t`With the battery connected, $V$ is fixed and $C$ halves, so $\tfrac12CV^2$ halves. (The battery takes back charge — and more energy than the capacitor lost.)`,
      },
      hints: ['Which quantity is fixed in each case — V or Q?', t`Use $W = \tfrac12CV^2$ when $V$ is fixed and $W = Q^2/2C$ when $Q$ is fixed, with $C \propto 1/d$.`],
      teach: 'Pick the energy formula whose held-fixed quantity matches the situation: ½CV² at fixed V, Q²/2C at fixed Q.',
      explain: t`$C$ halves either way. Connected ($V$ fixed): $W = \tfrac12CV^2$ halves; half the charge flows back into the battery. Disconnected ($Q$ fixed): $W = Q^2/2C$ doubles; the extra is the work you did against the plates’ attraction.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mems', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([0.2, 0.5, 1]), d = r.pick([1.5, 2, 3]), x = r.pick([5, 10, 20]);
        const C0 = (EPS0 * A * 1e-6) / (d * 1e-6), dC = (EPS0 * A * 1e-6) / ((d - x * 1e-3) * 1e-6) - (EPS0 * A * 1e-6) / ((d + x * 1e-3) * 1e-6);
        return {
          prompt: t`The accelerometer in a phone — or in a rocket’s inertial measurement unit — is a proof mass hung on springs between two fixed electrodes. Each gap is ${d} μm and the facing area on each side is ${A} mm² (the sum over many comb fingers). An acceleration shifts the mass ${x} nm toward one electrode. What is the difference $C_1 - C_2$ between the two capacitances, in femtofarads?`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '1.2', lower: '-1.2', from: -3.2, to: -2.8, color: 'ink3', alpha: 0.6 }, { fn: '1.2', lower: '-1.2', from: 2.8, to: 3.2, color: 'ink3', alpha: 0.6 }, { fn: '1', lower: '-1', from: -0.95, to: 0.75, color: 'accent', alpha: 0.35 }], arrows: [{ from: [-0.1, 1.25], to: [-0.6, 1.25], color: 'gold', width: 2, label: 'x', labelDx: -14 }, { from: [-2.8, -1.35], to: [-0.95, -1.35], color: 'ink2', width: 1.5, label: 'd − x', labelDx: -60, labelDy: 14 }, { from: [2.8, -1.35], to: [0.75, -1.35], color: 'ink2', width: 1.5, label: 'd + x', labelDx: 8, labelDy: 14 }], points: [{ x: -0.1, y: 0, r: 0, label: 'proof mass', labelDx: -34 }, { x: -3, y: 1.2, r: 0, label: 'C₁', labelDx: -6, labelDy: -10 }, { x: 3, y: 1.2, r: 0, label: 'C₂', labelDx: -6, labelDy: -10 }] }, caption: 'A differential capacitive sensor (not to scale; the shift is exaggerated about a thousandfold). Moving the mass narrows one gap and widens the other.' },
          answer: dC * 1e15, units: 'fF', tol: { rel: 0.01 },
          errors: [{ value: ((EPS0 * A * 1e-6) / ((d - x * 1e-3) * 1e-6) - C0) * 1e15, feedback: 'That is the change of one side only. The sensor reads the difference between the two sides, which change in opposite directions.' }],
          hints: [t`$C_1 = \varepsilon_0A/(d - x)$, $C_2 = \varepsilon_0A/(d + x)$. Use metres: $A = ${A}\times10^{-6}\ \text{m}^2$.`, t`For $x \ll d$, $C_1 - C_2 \approx 2\varepsilon_0Ax/d^2 = 2C_0\,x/d$ with $C_0 = \varepsilon_0A/d$.`],
          teach: 'A differential capacitive sensor turns a displacement x into a capacitance difference ≈ 2C₀x/d — linear, and twice either side alone.',
          explain: t`$C_0 = \varepsilon_0A/d \approx ${nice(sf(C0 * 1e12, 3))}$ pF and $C_1 - C_2 \approx 2C_0x/d \approx ${nice(sf(dC * 1e15, 3))}$ fF. Electronics resolve far smaller differences than this, which is how a sensor a millimetre across measures accelerations of a thousandth of $g$ (with springs this stiff, ${x} nm is a sizeable acceleration). The differential pair also cancels the drift common to both sides.`,
        };
      },
    }),
    num({
      id: 'cp-sphere-W', difficulty: 3,
      gen(r) {
        const a = r.pick([4, 8]), b = a + r.pick([1, 2]), V = r.pick([2, 5, 10]);
        const C = (4 * Math.PI * EPS0 * a * b * 1e-4) / ((b - a) * 1e-2), W = 0.5 * C * (V * 1e3) ** 2;
        return {
          prompt: t`Concentric metal spheres of radii ${a} cm and ${b} cm are held at a potential difference of ${V} kV. How much energy is stored?`,
          visual: concentric(a, b, 'The two spheres in cross-section, to scale.'),
          answer: W * 1e6, units: 'uJ', tol: { rel: 0.01 },
          errors: [{ value: C * (V * 1e3) ** 2 * 1e6, feedback: t`$W = \tfrac12CV^2$.` }, { value: 0.5 * ((EPS0 * 4 * Math.PI * a * a * 1e-4) / ((b - a) * 1e-2)) * (V * 1e3) ** 2 * 1e6, feedback: t`That uses the parallel-plate estimate with the inner area. The exact value is $4\pi\varepsilon_0ab/(b - a)$, larger by $b/a$.` }],
          hints: [t`$C = 4\pi\varepsilon_0\dfrac{ab}{b - a}$.`, t`Then $W = \tfrac12CV^2$, in metres and volts.`],
          teach: 'Find C from the geometry, then W = ½CV².',
          explain: t`$C = 4\pi\varepsilon_0\dfrac{(${a / 100})(${b / 100})}{${(b - a) / 100}} \approx ${nice(sf(C * 1e12, 3))}$ pF, so $W = \tfrac12CV^2 \approx ${nice(sf(W * 1e6, 3))}\ \mu\text{J}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-geometry', difficulty: 2,
      prompt: t`Why does $C = Q/V$ not depend on $Q$?`,
      visual: concentric(3, 4, 'Any pair of conductors: double the charges, and every field line doubles in strength.'),
      choices: [
        t`Laplace’s equation is linear, so doubling the charges doubles $\vec E$ and $V$ everywhere`,
        t`Because the charge spreads out more as you add it`,
        t`It does: $C$ grows with $Q$`,
        t`Because $V$ is fixed by the battery`,
      ],
      answer: 0,
      why: {
        1: 'The pattern of charge on each conductor keeps its shape; only its size scales.',
        2: 'For a given geometry C is a constant; Q and V rise together.',
        3: 'C is the same whether a battery is attached or not; it is a property of the conductors.',
      },
      hints: ['If V(r) solves the problem with charges ±Q, what solves it with ±2Q?'],
      teach: 'Linearity makes V ∝ Q, so C is pure geometry.',
      explain: t`If $V(\vec r)$ solves Laplace’s equation with the conductors at $V_1$ and $V_2$, then $2V(\vec r)$ solves it with $2V_1, 2V_2$ — and by uniqueness it is the solution, with twice the surface charge. So $Q/V$ is fixed by geometry alone.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §2.5.4', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'NASA Planetary Fact Sheets (radii)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
