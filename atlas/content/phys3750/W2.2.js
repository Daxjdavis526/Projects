// Beats and energy exchange: start one of two coupled identical oscillators
// alone and it is a sum of both normal modes; in complex form
// e^{−iω₁t} + e^{−iω₂t} = 2cos(Δω t/2) e^{−iω̄t}, a fast carrier inside a slow
// envelope, and the energy sloshes across in a time π/Δω.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;

// the worked example: two identical antenna booms on one spacecraft, coupled through the bus
const EX = (() => {
  const f1 = 0.5, f2 = 0.52, df = f2 - f1, fbar = (f1 + f2) / 2;
  return { f1, f2, df, fbar, T: 1 / (2 * df), n: fbar / (2 * df), dw: 2 * Math.PI * df };
})();

// x₁ and x₂ of two identical oscillators when the first starts alone (released from rest, unit amplitude)
const beatPic = (w1, w2, T, caption, o = {}) => curvesPic([
  { fn: `cos(${(w1 + w2) / 2}*x)*cos(${(w2 - w1) / 2}*x)`, color: 'accent', width: 1.6, label: o.l1 ?? 'x₁', labelAt: o.at1 ?? T * 0.02, labelDy: -8 },
  ...(o.two === false ? [] : [{ fn: `sin(${(w1 + w2) / 2}*x)*sin(${(w2 - w1) / 2}*x) - 2.6`, color: 'violet', width: 1.6, label: o.l2 ?? 'x₂ (shifted down)', labelAt: o.at2 ?? T * 0.02, labelDy: 14 }]),
  ...(o.envelope ? [{ fn: `abs(cos(${(w2 - w1) / 2}*x))`, color: 'ink4', dash: [4, 4], width: 1 }] : []),
], [0, T], o.two === false ? [-1.25, 1.25] : [-3.8, 1.25], caption, { xlabel: 't (s)', ylabel: '', yticks: 0, ...(o.more || {}) });

export default lesson({
  id: 'phys3750.W2.2',
  title: 'Beats and energy exchange',
  minutes: 12, difficulty: 2,
  intro: t`Pull one of two identical coupled oscillators aside and let go. That start is not a normal mode — it is **half of each**: $(1, 0) = \tfrac12(1, 1) + \tfrac12(1, -1)$. The two modes run at slightly different frequencies, and in complex form their sum factors into a fast oscillation inside a slow envelope:

$$e^{-i\omega_1 t} + e^{-i\omega_2 t} = 2\cos\!\Big(\frac{\Delta\omega}{2}t\Big)\,e^{-i\bar\omega t}, \qquad \bar\omega = \frac{\omega_1 + \omega_2}{2},\quad \Delta\omega = \omega_2 - \omega_1$$

As the two modes drift out of step, the first oscillator falls still and the second takes all the energy; then it comes back. The weaker the coupling, the closer the frequencies and the slower the exchange.`,
  symbols: [
    { tex: '\\omega_1,\\ \\omega_2', text: 'the two normal-mode angular frequencies (in phase and anti-phase), in rad/s' },
    { tex: '\\bar\\omega', text: 'their average: the fast **carrier** at which each oscillator swings' },
    { tex: '\\Delta\\omega', text: 'their difference: it sets the slow **envelope** $\\cos(\\Delta\\omega\\,t/2)$' },
    { tex: 'T_{\\text{ex}} = \\pi/\\Delta\\omega', text: 'the time for the energy to pass completely from one oscillator to the other, in s' },
    { tex: 'E_1/E = \\cos^2(\\Delta\\omega\\,t/2)', text: 'the share of the energy in oscillator 1 (weak coupling; the coupling spring’s own small share is ignored)' },
  ],
  why: t`Beats are how two close frequencies reveal themselves, and the mode beating of this lesson is the seed of group velocity: a wave packet is many modes drifting in and out of step.`,
  visual: {
    type: 'de-modes',
    title: 'Energy sloshing between two coupled oscillators',
    lead: t`Mass 1 starts alone. Watch the energy bars: oscillator 1’s energy drains into oscillator 2 and returns. The graph below shows the fast swings inside the slow envelope.`,
    tasks: [t`Halve $k_c$: the frequencies move closer and the exchange takes about twice as long.`, 'Start in mode 1 or mode 2: the energy bars stop moving — a single mode never exchanges energy.', t`Make $k_c$ large: the beats are no longer slow and the envelope picture blurs.`],
    params: { system: 'pair', m: 1, m2: 1, k: 10, kc: 1, controls: ['kc'], start: 'one', energy: true },
  },
  example: {
    prompt: t`A spacecraft carries two identical antenna booms, coupled weakly through the flexible bus. Their normal modes are at $f_1 = ${EX.f1}$ Hz (swinging together) and $f_2 = ${EX.f2}$ Hz (swinging oppositely). A thruster plume knocks boom 1 alone. How long until boom 2 swings fully while boom 1 is momentarily still, and how many swings does boom 1 make on the way?`,
    steps: [
      { label: 'Split the start into modes', text: t`Boom 1 alone, $(1, 0)$, is $\tfrac12(1, 1) + \tfrac12(1, -1)$: equal parts of both modes. Released from rest, $\tilde x_1 = \tfrac12\big(e^{-i\omega_1t} + e^{-i\omega_2t}\big)$ and $\tilde x_2 = \tfrac12\big(e^{-i\omega_1t} - e^{-i\omega_2t}\big)$.` },
      { label: 'Factor out the average', text: t`Pull out $e^{-i\bar\omega t}$: $\tilde x_1 = \cos(\Delta\omega\,t/2)\,e^{-i\bar\omega t}$ and $\tilde x_2 = i\sin(\Delta\omega\,t/2)\,e^{-i\bar\omega t}$. Real parts: $x_1 = \cos(\Delta\omega\,t/2)\cos\bar\omega t$, $x_2 = \sin(\Delta\omega\,t/2)\sin\bar\omega t$.` },
      { label: 'Full transfer', text: t`Boom 1’s envelope first reaches zero when $\Delta\omega\,t/2 = \pi/2$: $T_{\text{ex}} = \pi/\Delta\omega = 1/(2\Delta f) = 1/(2 \times ${tn(EX.df, 2)}\ \text{Hz}) = ${tn(EX.T, 2)}$ s.` },
      { label: 'Count the swings', text: t`Meanwhile boom 1 swings at the carrier $\bar f = ${tn(EX.fbar, 2)}$ Hz, so it completes about $\bar f\,T_{\text{ex}} = ${tn(EX.n, 3)}$ cycles of shrinking amplitude.` },
      { label: 'Sense check', text: t`The frequencies differ by 4%, so it takes about $1/0.04 \div 2 \approx 12$ carrier cycles to drift half a cycle out of step. A stiffer bus would split the modes further and speed the exchange.` },
    ],
    answer: t`About $${tn(EX.T, 2)}$ s, during which boom 1 makes about $${Math.round(EX.n)}$ dying swings.`,
    visual: beatPic(2 * Math.PI * EX.f1, 2 * Math.PI * EX.f2, 52, t`Boom 1 (top) and boom 2 (shifted down) after boom 1 is knocked: ${EX.f1} Hz and ${EX.f2} Hz modes, equal amplitudes. Small motions, no damping.`, { l1: 'boom 1', l2: 'boom 2 (shifted down)' }),
  },
  practice: [
    num({
      id: 'transfer', difficulty: 2,
      gen(r) {
        const w1 = r.pick([20, 25, 30]), dw = r.pick([0.5, 0.8, 1, 1.25, 2]), w2 = w1 + dw;
        return {
          prompt: t`Two identical cantilevered sensor masts stand on one vibration fixture. Their normal modes are at $\omega_1 = ${w1}$ rad/s and $\omega_2 = ${+w2.toFixed(3)}$ rad/s. A test engineer taps mast 1 only. How long until mast 1 is still and mast 2 carries all the motion, in s?`,
          visual: beatPic(w1, w2, (3 * Math.PI) / dw, 'The two masts after mast 1 is tapped (the time axis carries no numbers). Small motions, no damping.', { more: { xticks: 0 } }),
          answer: Math.PI / dw, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.PI) / dw, feedback: t`$2\pi/\Delta\omega$ is the time for the energy to go over **and come back**. Half of that gets it across once.` }, { value: 1 / dw, feedback: t`Set the envelope $\cos(\Delta\omega\,t/2)$ to zero: $t = \pi/\Delta\omega$.` }],
          hints: [t`Mast 1 moves as $\cos(\Delta\omega\,t/2)\cos\bar\omega t$.`, t`The envelope first vanishes when $\Delta\omega\,t/2 = \pi/2$.`],
          teach: t`Complete transfer takes $T_{\text{ex}} = \pi/\Delta\omega$, half the period of the energy’s round trip.`,
          explain: t`$\Delta\omega = ${tn(dw, 3)}$ rad/s, so $T_{\text{ex}} = \pi/${tn(dw, 3)} = ${tn(Math.PI / dw)}$ s.`,
        };
      },
    }),
    expr({
      id: 'product', difficulty: 2,
      gen(r) {
        const c = r.pick([8, 10, 12, 15]), d = r.pick([1, 2]), a = c - d, b = c + d;
        return {
          prompt: t`Write $x(t) = \tfrac12\big[\cos(${a}t) + \cos(${b}t)\big]$ as a product of two cosines.`,
          visual: curvesPic([{ fn: `0.5*(cos(${a}x) + cos(${b}x))`, color: 'accent', width: 1.5 }], [0, (2 * Math.PI) / d], [-1.2, 1.2], t`$x(t)$ over one full envelope cycle, $t$ in s.`, { xlabel: 't (s)', ylabel: 'x' }),
          answer: `cos(${d} t) cos(${c} t)`, answerTeX: t`\cos(${d}t)\cos(${c}t)`,
          lhs: 'x(t)', vars: { t: [0, 3] },
          errors: [{ answer: `cos(${2 * d} t) cos(${c} t)`, feedback: t`The envelope frequency is **half** the difference: $(${b} - ${a})/2 = ${d}$.` }, { answer: `2 cos(${d} t) cos(${c} t)`, feedback: t`$\cos A + \cos B = 2\cos\frac{A - B}{2}\cos\frac{A + B}{2}$, and the $\tfrac12$ in front cancels the 2.` }],
          hints: [t`$e^{-i${a}t} + e^{-i${b}t} = e^{-i${c}t}\big(e^{i${d}t} + e^{-i${d}t}\big)$.`, t`$e^{i${d}t} + e^{-i${d}t} = 2\cos(${d}t)$; take real parts.`],
          teach: t`Factor out the average frequency: $\cos A + \cos B = 2\cos\frac{A - B}{2}\cos\frac{A + B}{2}$ — a slow envelope times a fast carrier.`,
          explain: t`$\bar\omega = ${c}$ rad/s and $\Delta\omega/2 = ${d}$ rad/s, so $x = \cos(${d}t)\cos(${c}t)$: the carrier at ${c} rad/s inside an envelope at ${d} rad/s.`,
        };
      },
    }),
    num({
      id: 'energy-share', difficulty: 2,
      gen(r) {
        const dw = r.pick([0.4, 0.5, 0.8]), frac = r.pick([0.15, 0.2, 0.3, 0.35, 0.4]);
        const tt = +(frac * (2 * Math.PI) / dw).toFixed(1), E2 = Math.sin((dw * tt) / 2) ** 2;
        return {
          prompt: t`Two identical, weakly coupled oscillators have mode frequencies differing by $\Delta\omega = ${dw}$ rad/s. Oscillator 1 starts alone. What fraction of the energy is in oscillator 2 at $t = ${tt}$ s?`,
          visual: beatPic(12, 12 + dw, (2 * Math.PI) / dw, t`$x_1$ and $x_2$ over one full round trip of the energy, $2\pi/\Delta\omega = ${tn((2 * Math.PI) / dw)}$ s (carrier slowed for clarity).`),
          answer: E2, tol: { rel: 0.02, abs: 0.005 },
          errors: [{ value: Math.sin(dw * tt) ** 2, feedback: t`The envelope is $\sin(\Delta\omega\,t/2)$ — half the difference frequency.` }, { value: Math.cos((dw * tt) / 2) ** 2, feedback: 'That is the share still in oscillator 1.' }],
          hints: [t`Oscillator 2’s amplitude grows as $\sin(\Delta\omega\,t/2)$.`, t`Energy goes as amplitude squared: $E_2/E = \sin^2(\Delta\omega\,t/2)$.`],
          teach: t`The energy shares are $\cos^2(\Delta\omega\,t/2)$ and $\sin^2(\Delta\omega\,t/2)$: they always add to 1.`,
          explain: t`$\Delta\omega\,t/2 = ${tn((dw * tt) / 2)}$ rad, so $E_2/E = \sin^2(${tn((dw * tt) / 2)}) = ${tn(E2)}$.`,
        };
      },
    }),
    mcq({
      id: 'halve-coupling', difficulty: 2,
      prompt: t`For two identical oscillators ($\omega_0 = \sqrt{k/m}$) with a weak coupling spring $k_c \ll k$, the mode splitting is $\Delta\omega \approx k_c/(m\omega_0)$. If you halve $k_c$, the time for a complete energy transfer:`,
      visual: beatPic(10, 10.5, (2 * Math.PI) / 0.5, t`Oscillator 1 alone at first, with the coupling as it is now: one complete round trip of the energy.`),
      choices: ['doubles', 'halves', 'is unchanged, because the frequencies barely change', t`grows by $\sqrt 2$`],
      answer: 0,
      why: {
        1: 'Weaker coupling brings the two mode frequencies closer, so they take longer to drift out of step.',
        2: t`Both frequencies barely change — but the exchange time depends on their *difference*, which halves.`,
        3: t`The square root sits inside $\omega_2 = \sqrt{(k + 2k_c)/m}$; for weak coupling, $\Delta\omega$ is proportional to $k_c$ itself.`,
      },
      hints: [t`$T_{\text{ex}} = \pi/\Delta\omega$.`, t`$\Delta\omega \propto k_c$ for weak coupling.`],
      teach: t`Exchange time $\propto 1/\Delta\omega \propto 1/k_c$: weak coupling, slow sloshing.`,
      explain: t`$\omega_2 = \omega_0\sqrt{1 + 2k_c/k} \approx \omega_0(1 + k_c/k)$, so $\Delta\omega \approx \omega_0k_c/k = k_c/(m\omega_0)$. Halving $k_c$ halves $\Delta\omega$ and doubles $T_{\text{ex}} = \pi/\Delta\omega$.`,
    }),
    num({
      id: 'from-record', difficulty: 3,
      gen(r) {
        const fbar = r.pick([2, 2.5, 4]), df = r.pick([0.1, 0.125, 0.2, 0.25]);
        const f2 = fbar + df / 2;
        return {
          prompt: t`The record below is oscillator 1 of a coupled pair after it was started alone. Its fast swings have period $${tn(1 / fbar, 3)}$ s. Read the time between the envelope’s zeros from the graph and find the **higher** normal-mode frequency, in Hz.`,
          visual: curvesPic([{ fn: `cos(${2 * Math.PI * fbar}*x)*cos(${Math.PI * df}*x)`, color: 'accent', width: 1.2 }, { fn: `abs(cos(${Math.PI * df}*x))`, color: 'ink4', dash: [4, 4], width: 1 }], [0, 2.2 / df], [-1.2, 1.2], 'Displacement of oscillator 1 (arbitrary units) against time in s; dashed, its envelope.', { xlabel: 't (s)', ylabel: 'x₁', xticks: 11 }),
          answer: f2, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: fbar + df, feedback: t`The envelope’s zeros are $1/\Delta f$ apart, so $\Delta f$ is their inverse — but the higher mode is only **half** of $\Delta f$ above the carrier.` }, { value: fbar - df / 2, feedback: 'That is the lower mode.' }],
          hints: [t`$x_1 = \cos(\pi\Delta f\,t)\cos(2\pi\bar f t)$: the envelope’s zeros are spaced by $1/\Delta f$.`, t`The carrier frequency is $\bar f = 1/(\text{its period})$; then $f_2 = \bar f + \Delta f/2$.`],
          teach: t`From a beat record: the carrier gives the average frequency and the envelope zeros (spaced $1/\Delta f$) give the difference.`,
          explain: t`The zeros are $${tn(1 / df)}$ s apart, so $\Delta f = ${df}$ Hz; the carrier is $\bar f = ${fbar}$ Hz. So $f_2 = ${fbar} + ${df / 2} = ${tn(f2, 4)}$ Hz (and $f_1 = ${tn(fbar - df / 2, 4)}$ Hz).`,
        };
      },
    }),
    mcq({
      id: 'detuned', difficulty: 3,
      prompt: t`The picture shows complete energy exchange between two **identical** coupled oscillators. If instead oscillator 2 is made a little heavier than oscillator 1 (the coupling still weak) and oscillator 1 again starts alone, what happens?`,
      visual: { type: 'de-modes', params: { system: 'pair', m: 1, m2: 1, k: 10, kc: 0.6, controls: [], starts: false, start: 'one', play: false, readout: false }, caption: 'Identical oscillators, oscillator 1 started alone: the energy passes over completely and comes back.' },
      choices: ['The energy still sloshes, but only part of it crosses: oscillator 1 never comes fully to rest', 'Exactly as before: the energy crosses completely, just a little more slowly', 'No energy crosses at all, because the two are no longer in resonance', 'All of the energy crosses over to oscillator 2 and then stays there for good'],
      answer: 0,
      why: {
        1: t`Complete transfer needs the start $(1, 0)$ to be **equal** parts of the two modes. Detuning tilts the mode shapes, so the parts are unequal and the envelope never reaches zero.`,
        2: 'Some energy still crosses: a small detuning compared with the coupling only reduces the exchange.',
        3: 'The motion is a sum of two modes with fixed amplitudes; it is periodic in the envelope, and the energy always comes back.',
      },
      hints: ['Complete transfer happens when oscillator 1’s two mode parts cancel exactly at some moment.', 'Can two unequal amplitudes cancel?'],
      teach: 'Complete exchange needs identical oscillators: detuning leaves the two mode amplitudes unequal, so oscillator 1 never stops.',
      explain: t`Write $x_1 = a\cos\omega_1t + b\cos\omega_2t$. Its envelope swings between $|a + b|$ and $|a - b|$; it reaches zero only if $a = b$, which needs symmetric modes. Try it in the Explore: set $m_2$ in [the previous lesson](#/lesson/phys3750.W2.1) and pull mass 1.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-swings', difficulty: 3, transfer: true,
      gen(r) {
        const f1 = r.pick([0.8, 1.2, 2.0]), pct = r.pick([2, 2.5, 4, 5]), f2 = +(f1 * (1 + pct / 100)).toFixed(4);
        const fbar = (f1 + f2) / 2, T = 1 / (2 * (f2 - f1)), n = fbar * T;
        return {
          prompt: t`Two identical solar-array wings on a satellite are coupled through the bus; their normal modes are at ${f1} Hz and ${tn(f2, 4)} Hz. An attitude thruster sets wing 1 swinging alone. How many swings (carrier cycles) does wing 1 make before it first comes to rest?`,
          visual: beatPic(2 * Math.PI * 1, 2 * Math.PI * (1 + pct / 100), 1 / (pct / 100), 'Wing 1 and wing 2 (shifted down) after wing 1 is set swinging; the time axis carries no numbers. Small motions, no damping.', { l1: 'wing 1', l2: 'wing 2 (shifted down)', more: { xticks: 0 } }),
          answer: n, tol: { rel: 0.02 },
          errors: [{ value: 2 * n, feedback: t`That counts a full round trip, $1/\Delta f$. Wing 1 first stops after $1/(2\Delta f)$.` }],
          hints: [t`First find $T_{\text{ex}} = 1/(2\Delta f)$.`, t`Wing 1 swings at the average $\bar f$, so it makes $\bar f\,T_{\text{ex}}$ swings.`],
          teach: t`Swings before a full transfer: $\bar f/(2\Delta f)$ — about half the inverse of the fractional splitting.`,
          explain: t`$\Delta f = ${tn(f2 - f1, 2)}$ Hz, $T_{\text{ex}} = ${tn(T)}$ s, $\bar f = ${tn(fbar, 4)}$ Hz: about $${tn(n)}$ swings.`,
        };
      },
    }),
    num({
      id: 'cp-kc', difficulty: 3,
      gen(r) {
        const m = r.pick([0.2, 0.5, 1.0]), w0 = r.pick([10, 15, 20]), T = r.pick([20, 30, 40]);
        const dw = Math.PI / T, w2 = w0 + dw, kc = (m * (w2 * w2 - w0 * w0)) / 2;
        return {
          prompt: t`Two identical pendulums (mass ${m} kg, each with $\omega_0 = ${w0}$ rad/s alone) are joined by a weak spring. Started with one pendulum alone, the energy crosses completely in ${T} s. What is the coupling spring constant $k_c$, in N/m? (The modes are $\omega_0$ and $\sqrt{\omega_0^2 + 2k_c/m}$.)`,
          visual: beatPic(w0 / 4, (w0 + dw) / 4, (2 * Math.PI) / (dw / 4), 'The two pendulums after one is started alone (carrier slowed for clarity).', { more: { xticks: 0 } }),
          answer: kc, units: 'N/m', tol: { rel: 0.02 },
          errors: [{ value: m * (dw * dw) / 2, feedback: t`$k_c$ comes from the difference of the **squares**: $2k_c/m = \omega_2^2 - \omega_0^2$.` }, { value: (m * ((w0 + 2 * dw) ** 2 - w0 * w0)) / 2, feedback: t`$T_{\text{ex}} = \pi/\Delta\omega$, so $\Delta\omega = \pi/T_{\text{ex}}$, not $2\pi/T_{\text{ex}}$.` }],
          hints: [t`$\Delta\omega = \pi/T_{\text{ex}}$, so $\omega_2 = \omega_0 + \pi/T_{\text{ex}}$.`, t`$k_c = \tfrac12m(\omega_2^2 - \omega_0^2)$.`],
          teach: t`Measuring the exchange time measures the coupling: $\Delta\omega = \pi/T_{\text{ex}}$ and $\omega_2^2 - \omega_1^2 = 2k_c/m$.`,
          explain: t`$\Delta\omega = \pi/${T} = ${tn(dw)}$ rad/s, $\omega_2 = ${tn(w2, 5)}$ rad/s, so $k_c = \tfrac12(${m})(${tn(w2, 5)}^2 - ${w0}^2) = ${tn(kc)}$ N/m (about $m\omega_0\Delta\omega$).`,
        };
      },
    }),
    mcq({
      id: 'cp-envelope', difficulty: 2,
      prompt: t`In $e^{-i\omega_1t} + e^{-i\omega_2t} = 2\cos\!\big(\tfrac{\Delta\omega}{2}t\big)e^{-i\bar\omega t}$, which factor is the slowly varying **envelope**, and why can it be treated as an amplitude?`,
      visual: beatPic(10, 11, 4 * Math.PI, 'Oscillator 1’s motion with its envelope dashed: the fast carrier fills the slowly changing outline.', { two: false, envelope: true }),
      choices: [t`$2\cos(\Delta\omega\,t/2)$: it changes little in one carrier cycle when $\Delta\omega \ll \bar\omega$`, t`$e^{-i\bar\omega t}$: it is the factor with the larger frequency of the two`, t`$2\cos(\Delta\omega\,t/2)$: it is real, and every real factor is an amplitude`, t`$e^{-i\bar\omega t}$: it has magnitude 1, so it sets the size of the motion`],
      answer: 0,
      why: {
        1: t`$e^{-i\bar\omega t}$ is the fast **carrier**; it changes completely in one cycle.`,
        2: t`Being real is not enough: if $\Delta\omega$ were close to $\bar\omega$, the “envelope” would change within one carrier swing and the picture of a slowly varying amplitude would fail.`,
        3: t`A factor of magnitude 1 cannot set the size; the size comes from $2|\cos(\Delta\omega\,t/2)|$.`,
      },
      hints: ['Compare the two frequencies in the product.', t`An amplitude should stay almost constant over one carrier period $2\pi/\bar\omega$.`],
      teach: t`Beats are a slow envelope at $\Delta\omega/2$ on a fast carrier at $\bar\omega$ — a clean picture only when $\Delta\omega \ll \bar\omega$.`,
      explain: t`For close frequencies the cosine factor barely changes during one swing of $e^{-i\bar\omega t}$, so it acts as a slowly varying amplitude. The same separation of scales returns with wave packets and group velocity.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 2: Coupled Oscillators', url: 'https://digitalcommons.usu.edu/foundation_wave/21/' },
    { label: 'Georgi, The Physics of Waves, ch. 3 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
