// Radiation from a point charge: the Larmor formula (Griffiths §11.2.1). The
// acceleration field of M4.4, E_rad = (q/4πε₀c²R) R̂×(R̂×a) for a slow
// charge, gives S ∝ sin²θ/R² about a and the total P = μ₀q²a²/6πc; Liénard's
// generalization P = (μ₀q²γ⁶/6πc)(a² − |v×a|²/c²) is γ⁴ for circular motion
// and γ⁶ for straight-line acceleration, with the radiation beamed into a
// cone of half-angle ~1/γ. Explore: a graph of Liénard's angular pattern
// against β, a ⟂ v or a ∥ v. Worked example: energy lost per turn at LEP
// (104.5 GeV electrons, ρ = 3096 m: 3.4 GeV) against the LHC (6.8 TeV
// protons, ρ = 2804 m: 6 keV). Twist: for the same force, circular motion
// radiates γ² more than straight-line acceleration. Transfers: a 3 GeV light
// source's RF bill, the LHC's own loss, the classical atom's collapse.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, C, QE, ME, PI, sf, larmor, lossPerTurn, MEC2, MPC2 } from './_em4c.js';

const t = String.raw;
const A0 = 5.29177210544e-11;         // Bohr radius, m (CODATA 2022)
const RHO = { lep: 3096.2, lhc: 2803.95 };   // bending radii, m

// the worked example: LEP at 104.5 GeV against the LHC at 6.8 TeV
const EX = { Ee: 104.5, Ep: 6800 };
EX.ge = EX.Ee / MEC2; EX.gp = EX.Ep / MPC2;
EX.Ue = lossPerTurn(EX.Ee, MEC2, RHO.lep);
EX.Up = lossPerTurn(EX.Ep, MPC2, RHO.lhc);
// check: the same from Liénard's power times the time for a turn
{
  const b = Math.sqrt(1 - 1 / EX.ge ** 2), v = b * C, a = (v * v) / RHO.lep;
  const U = (larmor(QE, a) * EX.ge ** 4 * (2 * PI * RHO.lep)) / v / QE;
  if (Math.abs(U / EX.Ue - 1) > 1e-9) throw new Error('M5.3: loss per turn two ways');
}

// Liénard's angular patterns as graph expressions of the polar angle t from v (along x), slider b = β:
//   a ⟂ v (in the plane of v and a): [1 − sin²t/(γ²(1 − β cos t)²)]/(1 − β cos t)³, largest (1 − β)⁻³ straight ahead;
//   a ∥ v: sin²t/(1 − β cos t)⁵, largest at cos t = (√(1 + 15β²) − 1)/3β.
const PERP = '(1 - sin(t)^2*(1 - b^2)/(1 - b*cos(t))^2)/(1 - b*cos(t))^3*(1 - b)^3';
const CM = '((sqrt(1 + 15*b^2) - 1)/(3*b))';
const PAR = `sin(t)^2/(1 - b*cos(t))^5/((1 - ${CM}^2)/(1 - b*${CM})^5)`;
const SEL = (k) => `step(0.5 - abs(mode - ${k}))`;

/** Liénard's pattern (normalized to its peak) at speed beta, for a ⟂ v (mode 1) or a ∥ v (mode 2); static unless sliders are given. */
function beamPic(caption, { beta = 0.5, mode = 1, live = false, cone = false } = {}) {
  const sliders = live ? [{ key: 'b', label: t`Speed $\beta = v/c$`, min: 0.02, max: 0.95, step: 0.01, value: beta, explain: 'The charge’s speed at the moment it radiates, as a fraction of c.' }] : [];
  const choices = live ? [{ key: 'mode', label: 'Acceleration', options: [[1, t`across the velocity (circular motion)`], [2, t`along the velocity (speeding up)`]], value: mode, explain: 'Which way the charge is being accelerated relative to its motion.' }] : [];
  const constants = live ? {} : { b: beta, mode };
  const curves = [
    { param: [`(${PERP})*cos(t)`, `(${PERP})*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.6, when: SEL(1), samples: 3000 },
    { param: [`(${PAR})*cos(t)`, `(${PAR})*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.6, when: SEL(2), samples: 3000 },
  ];
  if (cone) curves.push({ param: ['t*cos(sqrt(1 - b^2))', 't*sin(sqrt(1 - b^2))'], t: [0, 1.15], color: 'ink3', width: 1.2, dash: [4, 4] }, { param: ['t*cos(sqrt(1 - b^2))', '-t*sin(sqrt(1 - b^2))'], t: [0, 1.15], color: 'ink3', width: 1.2, dash: [4, 4] });
  return {
    type: 'graph',
    params: {
      x: [-0.75, 1.25], y: [-0.62, 0.62], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      sliders, choices, constants, curves,
      arrows: [
        { from: [0, 0], to: [0.42, 0], color: 'accent', width: 2.4, label: 'v', labelDx: 4, labelDy: 14 },
        { from: [0, 0], to: [0, 0.42], color: 'warn', width: 2.4, label: 'a', labelDx: 6, labelDy: 0, when: SEL(1) },
        { from: [0, 0.05], to: [0.3, 0.05], color: 'warn', width: 2.4, label: 'a', labelDx: 4, labelDy: -10, when: SEL(2) },
      ],
      points: [{ x: 0, y: 0, r: 5, color: 'bad' }],
      ...(live ? { readouts: [
        { label: t`$\gamma$`, expr: '1/sqrt(1 - b^2)', digits: 3 },
        { label: t`$1/\gamma$ in degrees`, expr: '57.2958*sqrt(1 - b^2)', digits: 3 },
        { label: t`power $\div$ Larmor’s (same $a$)`, expr: `${SEL(1)}*(1 - b^2)^(-2) + ${SEL(2)}*(1 - b^2)^(-3)`, digits: 3 },
      ] } : {}),
    },
    caption,
  };
}

/** Energy lost per turn against beam energy, log–log, for electrons and protons on LEP's and the LHC's bending radii. */
function lossPic(caption, { marks = true } = {}) {
  // log10 of U (eV) against log10 of E (GeV): U = e²β³γ⁴/3ε₀ρ ≈ (e/3ε₀ρ)(E/mc²)⁴ for γ ≫ 1
  const k = (m, rho) => Math.log10(QE / (3 * EPS0 * rho)) - 4 * Math.log10(m);
  const ke = +k(MEC2, RHO.lep).toFixed(4), kp = +k(MPC2, RHO.lhc).toFixed(4);
  return {
    type: 'graph',
    params: {
      x: [0, 4.3], y: [-6, 10.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'beam energy (GeV)', ylabel: 'energy lost per turn (eV)', yticks: 6,
      curves: [
        { fn: `${ke} + 4*x`, domain: [0, 2.3], color: 'accent', width: 2.4, label: 'electrons, ρ = 3.1 km', labelAt: 0.35, labelDx: 8, labelDy: -6 },
        { fn: `${kp} + 4*x`, domain: [1, 4.3], color: 'warn', width: 2.4, label: 'protons, ρ = 2.8 km', labelAt: 2.6, labelDx: 10, labelDy: 14 },
      ],
      points: marks ? [
        { x: +Math.log10(EX.Ee).toFixed(4), y: +Math.log10(EX.Ue).toFixed(4), r: 5, color: 'accent', label: 'LEP', labelDx: -10, labelDy: -10, labelAlign: 'right' },
        { x: +Math.log10(EX.Ep).toFixed(4), y: +Math.log10(EX.Up).toFixed(4), r: 5, color: 'warn', label: 'LHC', labelDx: -10, labelDy: -10, labelAlign: 'right' },
      ] : [],
    },
    caption,
  };
}

/** em4b-kink: a charge kicked into motion, with its radiation shell. */
const kickPic = (caption, extra = {}) => ({ type: 'em4b-kink', params: { mode: 'start', beta: 0.4, tau: 0.6, time: 3, controls: false, readout: false, probe: null, panels: ['field'], ...extra }, caption });

export default lesson({
  id: 'phys4600.M5.3',
  title: 'Radiation from a point charge: the Larmor formula',
  minutes: 18, difficulty: 3,
  equation: t`P = \frac{\mu_0q^2a^2}{6\pi c}`,
  intro: t`In [M4.4](#/lesson/phys4600.M4.4) the field of an accelerating charge split in two, and only the acceleration part, $\vec E_{\text{rad}} = \dfrac{q}{4\pi\varepsilon_0c^2R}\,\hat R\times(\hat R\times\vec a)$ for a slow charge, falls as $1/R$. Its Poynting vector is $S = \dfrac{\mu_0q^2a^2}{16\pi^2c}\dfrac{\sin^2\theta}{R^2}$, with $\theta$ measured from the acceleration — the dipole doughnut again, aligned with $\vec a$. Integrating over a sphere gives **Larmor’s formula**. It depends on the acceleration, **not on the speed**: a coasting charge, however fast, does not radiate. For fast charges Liénard’s version adds powers of $\gamma = 1/\sqrt{1 - v^2/c^2}$ — $\gamma^4$ in a circle, $\gamma^6$ in a straight line — and squeezes the radiation into a forward cone about $1/\gamma$ wide.`,
  symbols: [
    { tex: 'P', text: 'the power the charge radiates, in watts (at the retarded time)' },
    { tex: 'q', text: 'the charge, in coulombs' },
    { tex: 'a', text: t`the size of its acceleration, in $\text{m/s}^2$ (slow charge, $v \ll c$)` },
    { tex: '\\mu_0', text: t`the permeability of free space, $1.257\times10^{-6}$ N/A²` },
    { tex: 'c', text: 'the speed of light' },
  ],
  why: t`Larmor’s formula sets the energy bill of every circular accelerator, makes the synchrotron light that X-ray sources sell, and — applied to an electron orbiting a nucleus — predicted that classical atoms collapse in about $10^{-11}$ s, one of the cracks that let quantum mechanics in.`,
  visual: {
    ...beamPic(t`Liénard’s angular pattern at one instant, in the plane of $\vec v$ and $\vec a$, scaled so its peak is 1 (the true peak grows enormously with $\gamma$). The charge (red) moves to the right. Dashed: the half-angle $1/\gamma$. Instantaneous pattern; the radiation seen later by a detector is also bunched in time.`, { beta: 0.3, mode: 1, live: true, cone: true }),
    title: 'The headlight effect',
    lead: t`The power per unit solid angle that a charge radiates in each direction (gold), for acceleration **across** its motion (circular) or **along** it (speeding up). At low speed both are the dipole pattern of [M5.1](#/lesson/phys4600.M5.1), $\sin^2$ of the angle from $\vec a$. Push the speed up.`,
    tasks: [
      t`Circular motion at $\beta = 0.02$: the two lobes point along $\pm\vec v$ — nothing goes along $\vec a$. At $\beta = 0.9$ nearly everything points forward, inside the dashed $1/\gamma$ cone.`,
      t`Speeding up: at low $\beta$ it is a doughnut around $\vec v$; at high $\beta$ the doughnut folds forward into a hollow cone, with still nothing exactly straight ahead.`,
      t`Watch the last readout: at $\beta = 0.95$ a circling charge radiates about 100 times Larmor’s value for the same acceleration, and one speeding up about 1000 times.`,
    ],
  },
  example: {
    prompt: t`LEP, in the 27 km tunnel that now houses the LHC, accelerated electrons to ${EX.Ee} GeV on bends of radius $\rho = ${nice(RHO.lep)}$ m. The LHC carries ${EX.Ep / 1e3} TeV protons on bends of radius ${nice(RHO.lhc)} m. How much energy does each particle radiate per turn?`,
    visual: lossPic(t`Energy lost per turn against beam energy, both on logarithmic scales: a straight line of slope 4 for each particle ($U \propto \gamma^4$). The electron line sits $(m_p/m_e)^4 \approx 10^{13}$ above the proton line. Straight sections, where nothing bends, are ignored.`),
    steps: [
      { label: 'Circular motion', text: t`On a bend $\vec a \perp \vec v$ with $a = v^2/\rho$, and Liénard’s formula gives $P = \dfrac{\mu_0q^2a^2}{6\pi c}\gamma^4$ — Larmor’s value times $\gamma^4$.` },
      { label: 'Per turn', text: t`A turn of bending takes $2\pi\rho/v$, so $U = P\cdot\dfrac{2\pi\rho}{v} = \dfrac{e^2}{3\varepsilon_0\rho}\beta^3\gamma^4$.` },
      { label: 'LEP', text: t`$\gamma = E/m_ec^2 = ${tex(EX.ge, 3)}$, so $U \approx ${nice(sf(EX.Ue / 1e9, 3))}$ GeV per turn — over 3% of the beam’s energy, put back each turn by radio-frequency cavities.` },
      { label: 'LHC', text: t`$\gamma = E/m_pc^2 = ${nice(sf(EX.gp, 4))}$, so $U \approx ${nice(sf(EX.Up / 1e3, 2))}$ keV per turn — a billionth of the beam’s energy.` },
      { label: 'Why so different', text: t`At the same energy and radius $U \propto (E/mc^2)^4$, and $(m_p/m_e)^4 \approx ${tex((MPC2 / MEC2) ** 4, 2)}$. That is why a collider for the highest energies uses protons, and why a future electron collider is either much bigger or straight.` },
      { label: 'Sense check', text: t`Both are $e^2/3\varepsilon_0\rho = ${tex(QE / (3 * EPS0 * RHO.lep), 3)}$ eV times $\gamma^4$ — a tiny number times a huge one, as it must be for a 3 km bend.` },
    ],
    answer: t`LEP: about ${nice(sf(EX.Ue / 1e9, 2))} GeV per electron per turn; the LHC: about ${nice(sf(EX.Up / 1e3, 2))} keV per proton per turn.`,
  },
  practice: [
    mcq({
      id: 'speed', difficulty: 1,
      prompt: t`Which of these electrons radiates?`,
      visual: kickPic(t`Field lines of a charge that has just been kicked into motion: the sideways field in the shell is the radiation. $c = 1$, lengths in arbitrary units.`),
      choices: ['One moving at constant speed around a circle', 'One coasting in a straight line at 0.99c', 'One at rest in a strong uniform magnetic field', 'One coasting at 0.5c between two parallel wires carrying no current'],
      answer: 0,
      why: {
        1: 'Speed alone never radiates: in its own rest frame the electron is a static charge.',
        2: 'A magnetic field exerts no force on a charge at rest, so it does not accelerate.',
        3: 'With no force there is no acceleration and no radiation, whatever the speed.',
      },
      hints: [t`Larmor’s formula depends on $a$, not $v$.`, 'Constant speed around a circle still means a changing velocity.'],
      teach: 'A charge radiates when it accelerates — and turning a corner at constant speed is acceleration.',
      explain: t`On a circle $a = v^2/r \ne 0$ even though the speed is constant, so the electron radiates: that is synchrotron radiation. The coasting electrons have $a = 0$.`,
    }),
    num({
      id: 'linac', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 5, 20, 50]);   // MV/m
        const a = (QE * E * 1e6) / ME, P = larmor(QE, a);
        return {
          prompt: t`A slow electron starts from rest in an accelerating field of ${E} MV/m. What power does it radiate, according to Larmor? Give it in units of $10^{-15}$ W.`,
          visual: kickPic(t`A charge kicked into motion (here, a short push; the problem’s push lasts). The kink in the field lines is the radiation. $c = 1$; arbitrary units.`, { mode: 'start', beta: 0.3, tau: 1.2 }),
          answer: P / 1e-15, tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * QE * QE * a) / (6 * PI * C)) / 1e-15, feedback: t`Square the acceleration: $P \propto a^2$.` }, { value: ((MU0 * QE * QE * a * a) / (6 * PI * C ** 3)) / 1e-15, feedback: t`Larmor’s formula in SI is $\mu_0q^2a^2/6\pi c$ — one power of $c$ (or $q^2a^2/6\pi\varepsilon_0c^3$).` }],
          hints: [t`$a = eE/m_e$.`, t`$P = \dfrac{\mu_0e^2a^2}{6\pi c}$.`],
          teach: 'Larmor’s power grows as the square of the acceleration — but the numbers for single electrons are tiny.',
          explain: t`$a = ${tex(a, 3)}\ \text{m/s}^2$ and $P \approx ${tex(P, 3)}$ W. Compared with the ${E} MeV it gains per metre, the radiated energy is utterly negligible: straight-line acceleration barely radiates.`,
        };
      },
    }),
    num({
      id: 'bohr', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 2, 3]);
        const rn = n * n * A0, a = (QE * QE) / (4 * PI * EPS0 * ME * rn * rn), P = larmor(QE, a);
        return {
          prompt: t`Treat hydrogen’s electron classically, on a circle of radius $r = ${n === 1 ? '' : n * n}a_0$ ($a_0 = ${tex(A0, 4)}$ m) held by the Coulomb force. What power would it radiate, in nanowatts?`,
          visual: kickPic(t`Any accelerated charge throws off kinked field lines like these; an orbiting electron would do so continuously. $c = 1$; arbitrary units.`, { mode: 'stop', beta: 0.5, tau: 0.5 }),
          answer: P * 1e9, units: 'nW', tol: { rel: 0.01 },
          errors: [{ value: larmor(QE, (QE * QE) / (4 * PI * EPS0 * ME * rn)) * 1e9, feedback: t`The Coulomb force falls as $1/r^2$: $a = e^2/4\pi\varepsilon_0m_er^2$.` }],
          hints: [t`Newton: $m_ea = \dfrac{e^2}{4\pi\varepsilon_0r^2}$.`, t`Then $P = \mu_0e^2a^2/6\pi c$; the electron is slow ($v \approx c/137$), so Larmor applies.`],
          teach: 'A classical orbiting electron radiates tens of nanowatts — enough to spiral in within about 10⁻¹¹ s.',
          explain: t`$a \approx ${tex(a, 3)}\ \text{m/s}^2$, $P \approx ${nice(sf(P * 1e9, 3))}$ nW. ${n === 1 ? t`Against a binding energy of only 13.6 eV, that drains the orbit fast: integrating as the orbit shrinks gives a collapse time $a_0^3/4r_e^2c \approx 1.6\times10^{-11}$ s.` : t`On larger orbits the acceleration is smaller (as $1/r^2$) and the power falls as $1/r^4$, but the collapse still takes far less than a microsecond.`} Real atoms are stable; classical electrodynamics cannot explain why.`,
        };
      },
    }),
    mcq({
      id: 'beam', difficulty: 2,
      prompt: t`An ultra-relativistic electron circles in a storage ring. Where does its radiation go?`,
      visual: beamPic(t`Liénard’s pattern for a charge moving right at $\beta = 0.8$ and accelerated upward, scaled to its peak. Dashed: the half-angle $1/\gamma$.`, { beta: 0.8, mode: 1, cone: true }),
      choices: [
        t`Forward along its velocity, into a cone of half-angle about $1/\gamma$`,
        t`Along its acceleration, toward the centre of the ring`,
        t`Out of the plane of the ring, along the field of the bending magnets`,
        'Equally in all directions',
      ],
      answer: 0,
      why: {
        1: t`At low speed nothing goes along $\vec a$ (the $\sin^2$ pattern has a null there); at high speed everything is thrown forward.`,
        2: t`The pattern lies around the velocity; very little goes out of the plane.`,
        3: 'Relativistic aberration crowds everything into the forward direction.',
      },
      hints: ['Raise β in the Explore graph and watch where the lobes go.', t`Aberration squeezes angles by about $1/\gamma$ toward the direction of motion.`],
      teach: 'A fast charge’s radiation is beamed forward into a cone about 1/γ wide — the synchrotron headlight.',
      explain: t`In the electron’s own frame the pattern is the slow-charge $\sin^2$; transformed to the lab, nearly all of it lands within a few times $1/\gamma$ of $\vec v$. A light-source beamline sees a flash each time the cone sweeps past.`,
    }),
    num({
      id: 'cone', difficulty: 2,
      gen(r) {
        const E = r.pick([1.5, 3, 6, 8]);
        const g = E / MEC2;
        return {
          prompt: t`The electrons in a synchrotron light source have ${E} GeV of energy. What is the opening half-angle $1/\gamma$ of their radiation cone, in microradians? ($m_ec^2 = 0.511$ MeV.)`,
          visual: beamPic(t`The pattern at $\beta = 0.9$, scaled to its peak — at ${E} GeV the cone is thousands of times narrower. Dashed: $1/\gamma$.`, { beta: 0.9, mode: 1, cone: true }),
          answer: 1e6 / g, units: 'urad', tol: { rel: 0.01 },
          errors: [{ value: (1e6 / g) * (180 / PI), feedback: 'The answer is in microradians, not micro-degrees.' }, { value: 1e6 / Math.sqrt(g), feedback: t`The half-angle is $1/\gamma$, not $1/\sqrt\gamma$.` }],
          hints: [t`$\gamma = E/m_ec^2$, with both in the same units.`, t`$1/\gamma$ is already in radians.`],
          teach: 'Synchrotron light leaves in a cone of half-angle 1/γ: microradians for GeV electrons.',
          explain: t`$\gamma = ${nice(sf(g, 4))}$, so $1/\gamma \approx ${nice(sf(1e6 / g, 3))}\ \mu\text{rad}$. Light from a bending magnet spreads sideways into a flat fan as the electron turns, but vertically it stays within about $1/\gamma$: 30 m downstream the fan is only about $${nice(sf((2 * 30) / g * 1e3, 2))}$ mm tall — the brightness that makes these machines useful.`,
        };
      },
    }),
    num({
      id: 'ring', difficulty: 3,
      gen(r) {
        const E = r.pick([1.5, 2, 3, 6]), rho = r.pick([4, 7, 10, 25]);
        const U = lossPerTurn(E, MEC2, rho);
        return {
          prompt: t`An electron storage ring runs at ${E} GeV with dipole magnets that bend the beam on a radius of ${rho} m. How much energy does each electron radiate per turn, in keV? (Use $U = \dfrac{e^2}{3\varepsilon_0\rho}\beta^3\gamma^4$; $m_ec^2 = 0.511$ MeV.)`,
          visual: lossPic('Energy lost per turn against energy, log–log: the slope is 4. The marked points are LEP and the LHC; a light source’s tighter bends move the electron line up.', { marks: true }),
          answer: U / 1e3, units: 'keV', tol: { rel: 0.01 },
          errors: [{ value: U / 1e3 / (E / MEC2) ** 2, feedback: t`Circular motion brings $\gamma^4$, not $\gamma^2$.` }],
          hints: [t`$\gamma = E/m_ec^2$; $\beta \approx 1$.`, t`$e^2/3\varepsilon_0\rho$ is in joules; divide by $e$ to get eV: $e/3\varepsilon_0\rho$ volts.`],
          teach: 'Electrons on a bend lose U = e²γ⁴/3ε₀ρ per turn — about 88.5 keV × E⁴/ρ with E in GeV and ρ in metres.',
          explain: t`$\gamma = ${tex(E / MEC2, 3)}$, so $U \approx ${nice(sf(U / 1e3, 3))}$ keV per turn — the engineer’s rule $88.5\ \text{keV}\times E[\text{GeV}]^4/\rho[\text{m}]$.`,
        };
      },
    }),
    mcq({
      id: 'same-force', difficulty: 4,
      prompt: t`The same force $F$ acts on an ultra-relativistic electron in two ways: along its velocity (a linear accelerator) or across it (a bending magnet). Using Liénard’s formula, how do the radiated powers compare?`,
      visual: beamPic(t`The pattern for acceleration along the velocity at $\beta = 0.8$: a hollow forward cone. Scaled to its peak.`, { beta: 0.8, mode: 2, cone: false }),
      choices: [
        t`The bend radiates $\gamma^2$ times more: along $\vec v$, $F = \gamma^3ma$ and the power is independent of $\gamma$; across, $F = \gamma ma$ and the power is $\gamma^2$ times larger`,
        t`The linear accelerator radiates more, because $\gamma^6 > \gamma^4$`,
        'They radiate the same: the force is the same',
        t`The bend radiates $\gamma^4$ times more`,
      ],
      answer: 0,
      why: {
        1: t`$\gamma^6 > \gamma^4$ compares equal **accelerations**. A given force produces far less acceleration along the motion ($\gamma^3m$ inertia) than across it ($\gamma m$).`,
        2: 'The radiated power depends on the acceleration and its direction, and the same force gives different accelerations.',
        3: t`$\gamma^4$ is the ratio for equal accelerations across and with no motion. Express each power in terms of $F$.`,
      },
      hints: [t`Relativistic Newton: along $\vec v$, $F = \gamma^3ma$; across it, $F = \gamma ma$.`, t`Linear: $P \propto \gamma^6a^2 = \gamma^6(F/\gamma^3m)^2$. Circular: $P \propto \gamma^4a^2 = \gamma^4(F/\gamma m)^2$.`],
      teach: 'For a given force, bending radiates γ² times more than pushing along the motion — why linear colliders avoid synchrotron losses.',
      explain: t`Linear: $P = \dfrac{\mu_0q^2}{6\pi c}\gamma^6\left(\dfrac{F}{\gamma^3m}\right)^2 = \dfrac{\mu_0q^2F^2}{6\pi cm^2}$, independent of $\gamma$. Circular: $\gamma^4(F/\gamma m)^2$ gives $\gamma^2$ times that. A linear collider pays almost nothing to radiation while accelerating; a ring pays at every bend.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lhc', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([4, 6.5, 6.8, 7]), U = lossPerTurn(E * 1e3, MPC2, RHO.lhc);
        return {
          prompt: t`In the LHC, protons of ${E} TeV are bent on a radius of ${nice(RHO.lhc)} m. How much energy does each proton radiate per turn, in keV? ($m_pc^2 = 938.3$ MeV; $U = \dfrac{e^2}{3\varepsilon_0\rho}\beta^3\gamma^4$.)`,
          visual: lossPic('Energy lost per turn against energy for electrons on LEP’s bends and protons on the LHC’s, log–log. Straight sections are ignored.', { marks: false }),
          answer: U / 1e3, units: 'keV', tol: { rel: 0.01 },
          errors: [{ value: lossPerTurn(E * 1e3, MEC2, RHO.lhc) / 1e3, feedback: t`That is for an electron. A proton’s $\gamma$ is $m_p/m_e \approx 1836$ times smaller at the same energy.` }],
          hints: [t`$\gamma = E/m_pc^2$.`, t`$e/3\varepsilon_0\rho$ (in volts) times $\gamma^4$ gives the loss in eV.`],
          teach: 'Protons radiate (mₑ/mₚ)⁴ ≈ 10⁻¹³ as much as electrons of the same energy on the same bend.',
          explain: t`$\gamma = ${nice(sf((E * 1e3) / MPC2, 4))}$, so $U \approx ${nice(sf(U / 1e3, 3))}$ keV per turn. Tiny per proton — but the LHC’s superconducting magnets sit at 1.9 K, and the few kilowatts of synchrotron light per beam must still be removed by a screen inside the beam pipe.`,
        };
      },
    }),
    num({
      id: 'cp-rf', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([2.5, 3, 6]), rho = r.pick([7, 9, 23]), I = r.pick([0.2, 0.3, 0.5]);
        const U = lossPerTurn(E, MEC2, rho), P = U * I;   // U in volts × current
        return {
          prompt: t`A synchrotron light source stores a ${I * 1e3} mA electron beam at ${E} GeV, bent on a radius of ${rho} m. Each electron radiates $U = \dfrac{e^2}{3\varepsilon_0\rho}\gamma^4$ per turn. How much power must the radio-frequency cavities feed back into the beam, in kW?`,
          visual: beamPic(t`Each electron throws its light forward into a narrow cone as it rounds a bend (here drawn at $\beta = 0.9$; the real cone is far narrower).`, { beta: 0.9, mode: 1, cone: true }),
          answer: P / 1e3, units: 'kW', tol: { rel: 0.01 },
          errors: [{ value: (U * I) / 1e3 / (2 * PI), feedback: t`The beam current already counts how many electrons pass a point per second, so power $= (U/e)\times I$ — no factor of $2\pi$.` }],
          hints: [t`If each electron loses $U$ per turn, and $I/e$ electrons pass any point per second, the beam loses $U\cdot I/e$ per second.`, t`$U/e$ in volts times $I$ in amperes is watts.`],
          teach: 'A stored beam radiates P = (U/e) I: for GeV electrons that is hundreds of kilowatts of synchrotron light.',
          explain: t`$U/e \approx ${nice(sf(U / 1e6, 3))}$ MV per turn, times ${I} A, is $${nice(sf(P / 1e3, 3))}$ kW — the light the beamlines use, and the RF power bill that pays for it.`,
        };
      },
    }),
    mcq({
      id: 'cp-protons', difficulty: 2, transfer: true,
      prompt: t`CERN’s 27 km tunnel held LEP, an electron–positron collider that peaked at about 105 GeV per beam. It now holds the LHC, colliding protons at 6.8 TeV. Why could the same tunnel not take electrons to TeV energies?`,
      visual: lossPic('Energy lost per turn against energy, log–log, for electrons (LEP’s bends) and protons (the LHC’s).', { marks: true }),
      choices: [
        t`At fixed radius, the loss per turn grows as $(E/mc^2)^4$: TeV electrons would radiate more per turn than they could be given`,
        'Electrons are too light to be steered by magnets',
        'Electrons cannot be accelerated beyond about 100 GeV',
        'Protons radiate more, so they are easier to slow down for collisions',
      ],
      answer: 0,
      why: {
        1: 'Magnets bend electrons easily; the problem is what they radiate while being bent.',
        2: 'Linear accelerators have reached 50 GeV and could go further; there is no such limit.',
        3: t`Protons radiate far **less**, by $(m_e/m_p)^4$ at the same energy.`,
      },
      hints: [t`$U \propto \gamma^4/\rho$ with $\gamma = E/mc^2$.`, t`At 1 TeV an electron’s $\gamma$ is about $2\times10^6$.`],
      teach: 'Synchrotron loss ∝ (E/m)⁴/ρ caps circular electron machines; heavy protons escape it.',
      explain: t`At 1 TeV and $\rho \approx 3$ km an electron would lose about $${nice(sf(lossPerTurn(1000, MEC2, RHO.lep) / 1e12, 2))}$ TeV per turn — more than its own energy. Protons, $1836$ times heavier, lose $10^{13}$ times less.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §11.2.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Jackson, Classical Electrodynamics (3rd ed.), §14.2–14.3 (Liénard’s formula, angular distributions)', url: 'https://www.wiley.com/en-us/Classical+Electrodynamics%2C+3rd+Edition-p-9780471309321' },
    { label: 'Particle Data Group, Review of Particle Physics: accelerator physics of colliders (LEP, LHC parameters)', url: 'https://pdg.lbl.gov/' },
  ],
});
