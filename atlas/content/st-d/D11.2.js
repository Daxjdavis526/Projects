// Quasinormal modes: a black hole's ringdown is a sum of damped tones, each a
// pole ω = 2πf − i/τ of its response in the lower half of the complex
// frequency plane — the residues of D11.1, with causality putting the poles
// below the axis. Going beyond D8.1 (which read off one frequency): the
// damping time and quality factor; how many cycles a ringdown lasts; the
// overtone that dies three times faster; spin (Kerr values from Leaver's
// continued fraction, computed for this course); the photon-sphere (eikonal)
// estimate and the Regge–Wheeler barrier the waves leak through; black-hole
// spectroscopy as a test of the no-hair theorem. Worked example: GW150914's
// remnant, redshift and all. Transfer: a LISA-band supermassive ringdown.
import { lesson, mcq, num } from '../../src/core/content.js';
import { num as nm, apart } from './_cx.js';
import { QNM, KERR, TSUN, r4 } from './_cx3.js';

const t = String.raw;
const PI = Math.PI;
const SQ27 = 3 * Math.sqrt(3);
const kerr = (chi) => KERR.find((k) => k[0] === chi);
const ring = (poles, o = {}, caption) => ({ type: 'cx3-causal', params: { poles, drag: false, showT: false, readout: false, panels: ['w', 't'], t: 10, T: [-10, 90], window: { re: [-0.75, 0.75], im: [-0.4, 0.15] }, names: { w: 'Mω', t: 't/M', G: 'h(t)' }, labels: false, arc: false, ...o }, caption });
const pole = ([re, im], amp = 1) => ({ re: r4(re), im: r4(im), amp });
const RW = (l) => `(1 - 2/x)*(${l * (l + 1)}/x^2 - 6/x^3)`;

// GW150914 (Abbott et al. 2016): remnant 62 M☉ (source frame), spin 0.67, redshift 0.09
const GW = (() => {
  const M = 62 * 1.09 * TSUN, [, wr, wi] = kerr(0.67);
  return { M, f: wr / (2 * PI * M), tau: M / -wi, Q: wr / (2 * -wi), fS: QNM.s20[0] / (2 * PI * M), tauS: M / -QNM.s20[1] };
})();

export default lesson({
  id: 'st-d.D11.2',
  title: 'Quasinormal modes of black holes',
  minutes: 15, difficulty: 4,
  intro: t`When two black holes merge, the newborn hole is lopsided and shakes the shape off in gravitational waves: a **ringdown**, $h(t) = \sum A\,e^{-t/\tau}\cos(2\pi f t + \varphi)$. Each damped tone is a **simple pole** of the hole’s response in the lower half of the complex frequency plane — the residues of D11.1, with causality keeping every pole below the axis:

$$\omega = 2\pi f - \frac{i}{\tau},\qquad \frac{GM}{c^3}\,\omega_{220} = 0.37367 - 0.08896\,i$$

The second equation is the fundamental $\ell = m = 2$ mode of a **non-spinning** (Schwarzschild) hole, from Leaver’s continued fraction (D8.1 used it to read off a pitch). Mass enters only as the time unit $GM/c^3$, $4.9255\ \mu\text{s}$ per solar mass: heavier holes ring lower and longer. Spin changes the numbers. These are not normal modes: energy leaks away, out to infinity and down the horizon, so every frequency is complex.`,
  symbols: [
    { tex: t`\omega`, text: 'a complex quasinormal frequency, rad/s: real part the pitch, imaginary part minus the decay rate' },
    { tex: 'f', text: t`the ringing frequency, $\operatorname{Re}\omega/2\pi$, in Hz` },
    { tex: t`\tau`, text: t`the damping time, $-1/\operatorname{Im}\omega$: the amplitude falls by a factor $e$ in $\tau$` },
    { tex: 'M', text: t`the black hole’s mass; $GM/c^3$ turns it into a time ($4.9255\ \mu\text{s}$ for one solar mass)` },
    { tex: t`\ell, m, n`, text: t`the mode’s labels: angular shape ($\ell \ge 2$ for gravitational waves, $|m| \le \ell$) and overtone number $n = 0, 1, 2, \ldots$ ($n = 0$ decays slowest)` },
    { tex: 'G, c', text: 'Newton’s constant and the speed of light' },
  ],
  why: t`Ringdowns are black-hole fingerprints: by the no-hair theorem every tone is fixed by just the mass and spin, so measuring two of them tests general relativity in the strongest gravity there is — LIGO, Virgo and KAGRA now resolve more than one mode in their loudest events.`,
  visual: {
    type: 'cx3-causal',
    title: 'Two poles, one ringdown',
    lead: t`The complex plane of $M\omega$ (with $G = c = 1$): the fundamental pole pair of a non-spinning hole and its first overtone, further down. Below, the ringdown they make after a kick at $t = 0$, in units of $M$. Drag the fundamental pole and watch the tone change.`,
    tasks: [
      t`Drag the fundamental pole to the right: the ringdown’s pitch rises — that is what spin does (a hole spinning at $\chi = 0.9$ has its pole at $0.672 - 0.065i$).`,
      t`Drag it down: the tone dies faster. The overtone, three times further below the axis, is gone after the first cycle or two; the late ringdown is the fundamental alone.`,
      t`Drag it above the axis: the ringing appears *before* the kick. Causality is why every quasinormal pole lies in the lower half-plane.`,
    ],
    params: { poles: [pole(QNM.s20), pole(QNM.s21, 0.6)], drag: true, snap: 0.005, panels: ['w', 't'], t: 15, T: [-15, 90], window: { re: [-0.75, 0.75], im: [-0.4, 0.15] }, names: { w: 'Mω', t: 't/M', G: 'h(t)' }, readout: ['pole', 'causal'], arc: false },
    caption: t`Pole positions from Leaver’s continued fraction (Schwarzschild, $\ell = 2$, $n = 0$ and $1$). The overtone’s amplitude, $0.6$, is chosen for the picture; in a real merger the amplitudes depend on how the hole was formed, and the earliest part of the ringdown is not a clean sum of modes.`,
  },
  example: {
    prompt: t`GW150914’s remnant had a mass of about $62\,M_\odot$ and spin $\chi = a/M \approx 0.67$, and the signal reached us redshifted by $z \approx 0.09$. Predict the frequency and damping time of its fundamental ringdown tone as LIGO recorded it.`,
    visual: ring([pole(kerr(0.67).slice(1))], { T: [-10, 60], window: { re: [-0.75, 0.75], im: [-0.3, 0.12] } }, t`The fundamental pole for $\chi = 0.67$, $M\omega = 0.520 - 0.082i$, and its ringdown in units of $M$. One $e$-folding takes about $12M$, roughly one cycle.`),
    steps: [
      { label: 'Redshift', text: t`Cosmic expansion stretches every period by $1 + z$; for a ringdown that is the same as a hole $1 + z$ times heavier. So use $M = 62\times1.09 = 67.6\,M_\odot$, i.e. $GM/c^3 = 67.6\times4.9255\ \mu\text{s} = ${nm(GW.M * 1e6, 3)}\ \mu\text{s}$.` },
      { label: 'Spin', text: t`For $\chi = 0.67$ the fundamental $\ell = m = 2$ pole is at $M\omega = 0.5199 - 0.0818\,i$ (Leaver’s continued fraction for Kerr, solved for this course; Berti, Cardoso and Will’s fitting formula agrees to about 1%). Spin raises the pitch: the hole drags the wave round with it.` },
      { label: 'Frequency', text: t`$f = \dfrac{0.5199}{2\pi\times${nm(GW.M * 1e6, 3)}\ \mu\text{s}} = ${nm(GW.f, 3)}$ Hz.` },
      { label: 'Damping', text: t`$\tau = \dfrac{${nm(GW.M * 1e6, 3)}\ \mu\text{s}}{0.0818} = ${nm(GW.tau * 1e3, 3)}$ ms. The quality factor $Q = \pi f\tau = ${nm(GW.Q, 3)}$: the amplitude falls by $e$ in about one cycle — a dull thud, not a bell.` },
      { label: 'Honesty', text: t`Ignoring spin (the Schwarzschild value) would give $${nm(GW.fS, 3)}$ Hz and $${nm(GW.tauS * 1e3, 3)}$ ms: spin matters. The mass and spin are uncertain by several percent, and so is this prediction; it is consistent with the damped tone LIGO fitted to the end of the signal, near 250 Hz and 4 ms.` },
    ],
    answer: t`$f \approx ${nm(GW.f, 3)}$ Hz, $\tau \approx ${nm(GW.tau * 1e3, 2)}$ ms`,
  },
  practice: [
    num({
      id: 'tau', difficulty: 2,
      gen(r) {
        const M = r.pick([10, 30, 62, 150, 8]);
        const tm = M * TSUN, ans = (tm / -QNM.s20[1]) * 1e3;
        return {
          prompt: t`A non-spinning black hole of $${M}\,M_\odot$ rings in its fundamental mode, $GM\omega/c^3 = 0.37367 - 0.08896\,i$. What is the damping time $\tau$, in milliseconds? ($GM_\odot/c^3 = 4.9255\ \mu\text{s}$.)`,
          visual: ring([pole(QNM.s20)], {}, 'The fundamental pole and its ringdown, in units of M (the same picture for every mass).'),
          answer: ans, units: 'ms', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (tm / QNM.s20[0]) * 1e3, feedback: t`The real part sets the pitch; $\tau$ comes from the imaginary part: $\tau = M/0.08896$.` }, { value: tm * -QNM.s20[1] * 1e3, feedback: t`$\tau = -1/\operatorname{Im}\omega$: divide $GM/c^3$ by $0.08896$, don’t multiply.` }]),
          hints: [t`$GM/c^3 = ${M}\times4.9255\ \mu\text{s} = ${nm(tm * 1e6, 4)}\ \mu\text{s}$.`, t`$\operatorname{Im}\omega = -0.08896/(GM/c^3)$, so $\tau = (GM/c^3)/0.08896$.`],
          teach: t`$\tau = -1/\operatorname{Im}\omega$; for a non-spinning hole $\tau \approx 11.2\,GM/c^3$, so it scales with mass.`,
          explain: t`$\tau = ${nm(tm * 1e6, 4)}\ \mu\text{s}/0.08896 = ${nm(ans, 4)}$ ms — about $11.2\,GM/c^3$. A hole ten times heavier rings ten times longer (and ten times lower).`,
        };
      },
    }),
    num({
      id: 'quality', difficulty: 2,
      gen(r) {
        const [chi, wr, wi] = r.pick(KERR.filter((k) => k[0] !== 0.67));
        const ans = wr / (2 * -wi);
        return {
          prompt: t`For a black hole with spin $\chi = ${chi}$, the fundamental $\ell = m = 2$ quasinormal frequency is $M\omega = ${wr.toFixed(4)} - ${(-wi).toFixed(4)}\,i$ (with $G = c = 1$). Its **quality factor** is $Q = \pi f\tau = \dfrac{\operatorname{Re}\omega}{2|\operatorname{Im}\omega|}$. Find $Q$.`,
          visual: ring([pole([wr, wi])], {}, t`The pole for $\chi = ${chi}$ and its ringdown.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: wr / -wi, feedback: t`$Q = \pi f\tau$ with $f = \operatorname{Re}\omega/2\pi$ and $\tau = 1/|\operatorname{Im}\omega|$: that leaves a factor $\tfrac12$.` }, { value: (2 * -wi) / wr, feedback: 'That is 1/Q: put the real part on top.' }]),
          hints: [t`$f\tau = \dfrac{\operatorname{Re}\omega}{2\pi}\cdot\dfrac{1}{|\operatorname{Im}\omega|}$ — the mass cancels.`, t`$Q = \dfrac{${wr.toFixed(4)}}{2\times${(-wi).toFixed(4)}}$.`],
          teach: 'The quality factor is the pole’s real part over twice its distance below the axis: independent of mass, rising with spin.',
          explain: t`$Q = ${nm(ans, 4)}$. A non-spinning hole has $Q = 2.10$; spin lifts the pole’s real part and moves it toward the axis, so fast spinners ring longer — near-extremal ones much longer.`,
        };
      },
    }),
    num({
      id: 'cycles', difficulty: 3,
      gen(r) {
        const drop = r.pick([10, 100, 1000]), [chi, wr, wi] = r.pick([KERR[0], KERR[5], KERR[7]]);
        const ans = (wr / (2 * PI)) * (Math.log(drop) / -wi);
        return {
          prompt: t`A ringdown with $M\omega = ${wr.toFixed(4)} - ${(-wi).toFixed(4)}\,i$ (spin $\chi = ${chi}$) starts loud. How many full oscillation cycles pass before its amplitude has fallen by a factor of ${drop}? (The answer does not depend on the mass.)`,
          visual: ring([pole([wr, wi])], { T: [-5, 90] }, 'The ringdown in units of M: count how quickly the swings shrink.'),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (wr / (2 * PI)) / -wi, feedback: t`That is the number of cycles in one $\tau$ (a factor $e$). A factor ${drop} takes $\ln ${drop} = ${nm(Math.log(drop), 4)}$ damping times.` }, { value: (wr * Math.log(drop)) / -wi, feedback: t`Cycles are $f\,t$ with $f = \operatorname{Re}\omega/2\pi$: divide by $2\pi$.` }]),
          hints: [t`The amplitude is $e^{-t/\tau}$: it falls by ${drop} after $t = \tau\ln ${drop}$.`, t`Cycles $= f t = \dfrac{\operatorname{Re}\omega}{2\pi}\cdot\dfrac{\ln ${drop}}{|\operatorname{Im}\omega|}$ — the $M$ cancels.`],
          teach: 'A black hole’s ringdown lasts only a few cycles: Q ≈ 2–5 for most spins.',
          explain: t`$\dfrac{${wr.toFixed(4)}}{2\pi}\cdot\dfrac{${nm(Math.log(drop), 4)}}{${(-wi).toFixed(4)}} = ${nm(ans, 3)}$ cycles. Compare a guitar string ($Q \sim 1000$): black holes are about the worst bells in the universe, which is why their ringdowns are so hard to measure.`,
        };
      },
    }),
    mcq({
      id: 'not-normal', difficulty: 2,
      prompt: t`A violin string has **normal** modes with real frequencies (ignoring friction). Why are a black hole’s mode frequencies complex — *quasi*normal — even in perfect vacuum?`,
      visual: { type: 'graph', params: { x: [2, 14], y: [-0.02, 0.42], aspect: 'wide', xlabel: 'r (units of GM/c²)', ylabel: 'barrier height', axesAt: 'edge',
        curves: [{ fn: RW(2), domain: [2, 14], color: 'accent', width: 2.4, label: 'ℓ = 2', labelAt: 5, labelDx: 6 }, { fn: RW(3), domain: [2, 14], color: 'violet', width: 2, label: 'ℓ = 3', labelAt: 3.6, labelDx: 8, labelDy: -6 }],
        vlines: [{ x: 2, color: 'ink2', label: 'horizon' }, { x: 3, color: 'ink3', label: 'photon sphere' }] },
        caption: t`The Regge–Wheeler potential barrier that gravitational waves feel round a non-spinning black hole, peaking near the photon sphere $r = 3GM/c^2$ (in the tortoise coordinate the horizon is infinitely far left).` },
      choices: [
        'The waves are trapped only partly, near the photon sphere: they leak out to infinity and fall through the horizon, so every mode loses energy and decays',
        'Space near a black hole has friction, which damps the waves',
        'The modes are complex because the black hole is spinning',
        'Their frequencies are real; the imaginary part is just a mathematical convenience',
      ],
      answer: 0,
      why: {
        1: 'Vacuum has no friction. The loss is radiation: the system is open.',
        2: 'A non-spinning hole has complex frequencies too: 0.37367 − 0.08896i.',
        3: 'The imaginary part is the measured decay: LIGO sees the ringdown die in milliseconds.',
      },
      hints: ['Where can the energy of a vibration round a black hole go?', 'A string is fixed at both ends; a black hole’s “string” has open ends at the horizon and at infinity.'],
      teach: 'Quasinormal modes are the resonances of an open system: they leak, so they decay, and they do not form a complete orthogonal set the way normal modes do.',
      explain: t`Waves round a black hole are held loosely by the barrier near the photon sphere, $r \approx 3GM/c^2$; they tunnel out to infinity (that is what LIGO detects) and in through the horizon. Leaking systems have complex resonances. Unlike a string’s normal modes, quasinormal modes do not form a complete orthogonal set — the start of a ringdown cannot be written exactly as their sum.`,
    }),
    num({
      id: 'eikonal', difficulty: 3,
      gen(r) {
        const l = r.pick([2, 3, 4]);
        const ans = (l + 0.5) / SQ27, exact = { 2: QNM.s20, 3: QNM.s30, 4: QNM.s40 }[l][0];
        let vmax = 0;
        for (let x = 2; x <= 12; x += 0.01) vmax = Math.max(vmax, (1 - 2 / x) * ((l * (l + 1)) / (x * x) - 6 / x ** 3));
        return {
          prompt: t`Light can circle a non-spinning black hole on the **photon sphere**, $r = 3GM/c^2$, with angular frequency $\Omega_c = \dfrac{c^3}{3\sqrt3\,GM}$ — unstably, leaking off at a rate also set by $\Omega_c$. Waves of angular number $\ell$ trapped there ring at about $\operatorname{Re}\omega \approx (\ell + \tfrac12)\Omega_c$. Estimate $\operatorname{Re}(M\omega)$ (with $G = c = 1$) for $\ell = ${l}$.`,
          visual: { type: 'graph', params: { x: [2, 12], y: [-0.02, r4(1.15 * vmax)], aspect: 'wide', xlabel: 'r (units of M)', ylabel: 'barrier', axesAt: 'edge', curves: [{ fn: RW(l), domain: [2, 12], color: 'accent', width: 2.4, label: `ℓ = ${l}`, labelAt: 6, labelDx: 6 }], vlines: [{ x: 3, color: 'gold', label: 'r = 3M' }] }, caption: t`The ℓ = ${l} barrier: its peak sits close to the photon sphere, where the trapped waves live.` },
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: l / SQ27, feedback: t`It is $\ell + \tfrac12$, not $\ell$: the half comes from the wave’s angular structure.` }, { value: (l + 0.5) / 3, feedback: t`$\Omega_c = 1/(3\sqrt3\,M)$, not $1/(3M)$: the orbital period at $r = 3M$ is $2\pi\cdot3\sqrt3\,M$.` }]),
          hints: [t`With $G = c = 1$, $M\Omega_c = 1/(3\sqrt3) = ${nm(1 / SQ27, 4)}$.`, t`Multiply by $\ell + \tfrac12 = ${l + 0.5}$.`],
          teach: 'Quasinormal modes are waves trapped at the photon sphere: the pitch is the light-ring orbital frequency times ℓ + ½.',
          explain: t`$(${l} + \tfrac12)/(3\sqrt3) = ${nm(ans, 4)}$. Leaver’s exact value is $${exact.toFixed(4)}$: the estimate is ${nm((100 * (ans - exact)) / exact, 2)}% high, and improves as $\ell$ grows (the eikonal approximation is a large-$\ell$ limit). The imaginary part estimate, $-\tfrac12\cdot\frac{1}{3\sqrt3} = -0.096$, is already close to the exact $-0.089$: the decay is the rate at which light peels off the unstable photon orbit.`,
        };
      },
    }),
    num({
      id: 'kerr-f', difficulty: 3,
      gen(r) {
        const [chi, wr] = r.pick([KERR[2], KERR[5], KERR[6], KERR[7]]), M = r.pick([20, 40, 80]);
        const ans = wr / (2 * PI * M * TSUN);
        return {
          prompt: t`A merger leaves a ${M}$\,M_\odot$ black hole spinning at $\chi = ${chi}$ (no redshift: it is close by). Its fundamental mode is at $M\omega = ${wr.toFixed(4)} - \ldots i$ (with $G = c = 1$). What frequency, in Hz, does it ring at?`,
          visual: { type: 'graph', params: { x: [0, 0.95], y: [0.3, 0.75], aspect: 'wide', xlabel: 'spin χ', ylabel: 'Re Mω', axesAt: 'edge', curves: [{ fn: '1.5251 - 1.1568*(1 - x)^0.1292', color: 'ink3', width: 1.6, dash: [5, 4], label: 'fitting formula', labelAt: 0.25, labelDy: 14 }], points: KERR.map(([c, w]) => ({ x: c, y: w, color: 'accent', r: 3.5 })) },
            caption: 'Leaver’s values of Re Mω for the fundamental ℓ = m = 2 mode at several spins (dots), and Berti, Cardoso and Will’s fitting formula (dashed). Spin raises the pitch.' },
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: QNM.s20[0] / (2 * PI * M * TSUN), feedback: t`That is the non-spinning value. Use $\operatorname{Re}(M\omega) = ${wr.toFixed(4)}$ for $\chi = ${chi}$.` }, { value: wr / (M * TSUN), feedback: t`That is $\operatorname{Re}\omega$ in rad/s; divide by $2\pi$.` }]),
          hints: [t`$GM/c^3 = ${M}\times4.9255\ \mu\text{s} = ${nm(M * TSUN * 1e6, 4)}\ \mu\text{s}$.`, t`$f = \dfrac{${wr.toFixed(4)}}{2\pi\times${nm(M * TSUN * 1e6, 4)}\ \mu\text{s}}$.`],
          teach: t`$f = \operatorname{Re}(M\omega)/(2\pi\,GM/c^3)$: the mass sets the scale, the spin the number.`,
          explain: t`$f = ${nm(ans, 4)}$ Hz, against $${nm(QNM.s20[0] / (2 * PI * M * TSUN), 4)}$ Hz if it did not spin.`,
        };
      },
    }),
    mcq({
      id: 'spectroscopy', difficulty: 3,
      prompt: t`In general relativity an isolated black hole is fixed by two numbers, its mass and spin (the **no-hair theorem**), so every quasinormal frequency is a function of $M$ and $\chi$ alone. A detector measures two modes in one ringdown — say the $(2,2,0)$ tone and the $(2,2,1)$ overtone, each with a frequency and a damping time. Why does that test general relativity?`,
      visual: ring([pole(QNM.s20), pole(QNM.s21, 0.6)], {}, 'Two poles of one black hole: the fundamental and the first overtone. Both positions are fixed by the same M and χ.'),
      choices: [
        'Four measured numbers must be fitted by only two (M and χ): if GR is right, the second mode lands where the first predicts',
        'Two modes are needed to find the mass at all',
        'The overtone measures the hole’s charge',
        'Two modes prove the hole is not spinning',
      ],
      answer: 0,
      why: {
        1: 'One mode already gives two numbers (f and τ), enough for M and χ.',
        2: 'Astrophysical black holes have negligible charge; the no-hair theorem allows it, but here it is assumed zero.',
        3: 'Spinning or not, both modes are fixed by M and χ; the test works for any spin.',
      },
      hints: ['Count unknowns and measurements.', 'One mode’s f and τ already pin down M and χ.'],
      teach: '“Black-hole spectroscopy”: more measured tones than parameters makes an overdetermined, testable system — like identifying an element by several spectral lines.',
      explain: t`The first mode’s two numbers determine $M$ and $\chi$; the second mode’s two numbers must then agree with the values GR predicts for that $M$ and $\chi$. A hole with “hair” — anything beyond mass and spin — would generally break the agreement. The loudest recent events (e.g. GW250114) show more than one mode, consistent with Kerr to within the errors.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mass', difficulty: 3,
      gen(r) {
        const f = r.pick([120, 180, 250, 400, 600]);
        const ans = QNM.s20[0] / (2 * PI * f * TSUN);
        return {
          prompt: t`A ringdown is heard at $f = ${f}$ Hz. Assuming the remnant does not spin (fundamental mode $GM\omega/c^3 = 0.37367 - 0.08896\,i$) and ignoring redshift, what is its mass, in solar masses?`,
          visual: ring([pole(QNM.s20)], {}, 'The fundamental pole: its real part, divided by 2πM, is the heard frequency.'),
          answer: ans, units: 'Msun', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: QNM.s20[0] / (f * TSUN), feedback: t`$f$ is in hertz: $2\pi f = \operatorname{Re}\omega$. Include the $2\pi$.` }, { value: 1 / (2 * PI * f * TSUN), feedback: t`$\operatorname{Re}(GM\omega/c^3) = 0.37367$, not 1.` }]),
          hints: [t`$2\pi f\cdot\dfrac{GM}{c^3} = 0.37367$.`, t`$\dfrac{GM}{c^3} = \dfrac{0.37367}{2\pi\times${f}}$ s; divide by $4.9255\ \mu\text{s}$ per solar mass.`],
          teach: 'Invert f = 0.37367/(2π GM/c³) to weigh a black hole by its pitch.',
          explain: t`$GM/c^3 = ${nm((QNM.s20[0] / (2 * PI * f)) * 1e6, 4)}\ \mu\text{s}$, so $M = ${nm(ans, 4)}\,M_\odot$. If the hole actually spins, it is heavier than this for the same pitch — mass and spin must be found together, from $f$ and $\tau$.`,
        };
      },
    }),
    num({
      id: 'cp-overtone', difficulty: 3,
      gen(r) {
        const M = r.pick([30, 60, 100]), tms = r.pick([1, 2, 3]);
        const tm = M * TSUN, rate = (-QNM.s21[1] + QNM.s20[1]) / tm, ans = Math.exp(-rate * tms * 1e-3);
        return {
          prompt: t`A non-spinning ${M}$\,M_\odot$ remnant starts ringing with its fundamental ($M\omega = 0.3737 - 0.0890\,i$) and first overtone ($M\omega = 0.3467 - 0.2739\,i$) at **equal** amplitudes. What is the overtone’s amplitude divided by the fundamental’s, ${tms} ms later?`,
          visual: ring([pole(QNM.s20), pole(QNM.s21)], {}, 'The two poles and their combined ringdown. The lower pole dies faster.'),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.exp((QNM.s21[1] * tms * 1e-3) / tm), feedback: 'That is the overtone’s own decay; the fundamental decays too, so take the ratio.' }, { value: Math.exp(-(rate * tms * 1e-3) / 2), feedback: t`Amplitudes go as $e^{-t/\tau}$ with $1/\tau = |\operatorname{Im}\omega|$ — no factor of 2 (that would be for energy the other way round).` }]),
          hints: [t`Each amplitude is $e^{-|\operatorname{Im}\omega|t}$. The ratio is $e^{-(|\operatorname{Im}\omega_1| - |\operatorname{Im}\omega_0|)t}$.`, t`$|\operatorname{Im}\omega_1| - |\operatorname{Im}\omega_0| = (0.2739 - 0.0890)/(GM/c^3)$, with $GM/c^3 = ${nm(tm * 1e6, 4)}\ \mu\text{s}$.`],
          teach: 'Overtones sit further from the real axis, so they die first: late ringdowns are the fundamental alone.',
          explain: t`The rate difference is $0.1850/${nm(tm * 1e6, 4)}\ \mu\text{s} = ${nm(rate, 4)}\ \text{s}^{-1}$, so after ${tms} ms the ratio is $e^{-${nm(rate * tms * 1e-3, 4)}} = ${nm(ans, 3)}$. Overtones matter only in the first few milliseconds after the peak.`,
        };
      },
    }),
    num({
      id: 'cp-lisa', difficulty: 3, transfer: true,
      gen(r) {
        const [what, M] = r.pick([['a million-solar-mass black hole formed in a galaxy merger', 1e6], ['a black hole like Sagittarius A* ($4.3\\times10^6\\,M_\\odot$), if it were kicked into ringing', 4.3e6], ['a 300 000-solar-mass black hole formed in a merger at the heart of a dwarf galaxy', 3e5]]), chi = 0.7, [, wr] = kerr(chi);
        const ans = (wr / (2 * PI * M * TSUN)) * 1e3;
        return {
          prompt: t`The space-based detector LISA will listen between about 0.1 and 100 mHz. Consider ${what}, spinning at $\chi = 0.7$ (fundamental mode $M\omega = 0.5326 - 0.0808\,i$). Ignoring redshift, at what frequency does it ring, in mHz?`,
          visual: ring([pole(kerr(0.7).slice(1))], {}, t`The pole for $\chi = 0.7$ and its ringdown in units of $M$ — the same shape as a stellar black hole’s, stretched in time by the mass.`),
          answer: ans, units: 'mHz', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (QNM.s20[0] / (2 * PI * M * TSUN)) * 1e3, feedback: t`Use the spinning value, $0.5326$.` }, { value: (wr / (M * TSUN)) * 1e3, feedback: t`Divide $\operatorname{Re}\omega$ by $2\pi$ to get hertz.` }]),
          hints: [t`$GM/c^3 = ${nm(M, 3)}\times4.9255\ \mu\text{s} = ${nm(M * TSUN, 4)}$ s.`, t`$f = \dfrac{0.5326}{2\pi\times${nm(M * TSUN, 4)}\ \text{s}}$; convert to mHz.`],
          teach: 'Ringdown frequency scales as 1/M: supermassive black holes ring in LISA’s millihertz band.',
          explain: t`$f = ${nm(ans, 3)}$ mHz${ans > 0.1 && ans < 100 ? ', inside LISA’s band' : ''}; it rings for $\tau = M/0.0808 = ${nm(M * TSUN / 0.0808, 3)}$ s. The same $M\omega$ that gives a LIGO thud at a few hundred hertz gives a LISA hum whose damping time is ${M * TSUN / 0.0808 > 120 ? 'minutes' : M * TSUN / 0.0808 > 45 ? 'about a minute' : 'tens of seconds'}.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Leaver, “An analytic representation for the quasi-normal modes of Kerr black holes”, Proc. R. Soc. A 402, 285 (1985)', url: 'https://doi.org/10.1098/rspa.1985.0119' },
    { label: 'Berti, Cardoso & Starinets, “Quasinormal modes of black holes and black branes”, Class. Quantum Grav. 26, 163001 (2009)', url: 'https://arxiv.org/abs/0905.2975' },
    { label: 'Berti, Cardoso & Will, “On gravitational-wave spectroscopy of massive black holes with LISA”, Phys. Rev. D 73, 064030 (2006) — the fitting formulas', url: 'https://arxiv.org/abs/gr-qc/0512160' },
    { label: 'LIGO/Virgo, “Observation of gravitational waves from a binary black hole merger”, Phys. Rev. Lett. 116, 061102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
  ],
});
