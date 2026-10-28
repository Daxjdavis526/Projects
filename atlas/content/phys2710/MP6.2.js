// Wave packets — adding plane waves with a spread of wavenumbers Δk makes a
// packet of length Δx ≈ 1/(2Δk). Crests move at the phase velocity ω/k, the
// packet at the group velocity dω/dk; for matter waves dω/dk = dE/dp is the
// particle’s velocity, while the phase velocity (c²/v) carries nothing.
// Dispersion spreads a packet: σ(t) = σ₀√(1 + (ħt/2mσ₀²)²). Ocean swell,
// femtosecond laser pulses, and GPS signals in the ionosphere (group delay
// 40.3·TEC/f², carrier advanced by the same amount). Every number is
// computed here or in model/mp-packet.js.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, HBAR, ME, QE } from './_constants.js';
import { seg, label, frame, r6 } from './_diagrams.js';
import { G0, IONO } from './_quanta.js';

const t = String.raw;
const tau = (s0) => (2 * ME * s0 * s0) / HBAR;                     // s: the spreading time of an electron packet of width s0 (m)
const width = (s0, time) => s0 * Math.sqrt(1 + (time / tau(s0)) ** 2);
const GPS = { L1: 1575.42e6, L2: 1227.6e6, L5: 1176.45e6 };

/** The simulation as a still picture for a question. */
const still = (params, caption) => ({ type: 'mp-packet', params: { view: 'build', play: false, controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** ω against k for a relativistic particle (units of mc²/ħ and mc/ħ): the chord (phase velocity) and the tangent (group velocity) at one k. */
function hyperbola(beta, { ask = true } = {}) {
  const g = 1 / Math.sqrt(1 - beta * beta), k = g * beta, w = g;
  return {
    type: 'graph',
    params: {
      x: [-0.2, 5], y: [0, 2.6], aspect: 'wide', equal: true, xlabel: 'k (units of mc/ħ)', ylabel: 'ω (units of mc²/ħ)',
      curves: [
        { fn: 'sqrt(1 + x^2)', domain: [0, 5], color: 'accent', width: 2.4 },
        { fn: 'x', domain: [0, 2.6], color: 'ink4', width: 1.2, dash: true },
        { fn: `${r6(w / k)}*x`, domain: [0, r6(Math.min(2.6, 2.6 * k / w))], color: 'violet', width: 1.6, dash: true },
        { fn: `${r6(w)} + ${r6(beta)}*(x - ${r6(k)})`, domain: [r6(Math.max(0, k - 0.9)), r6(k + 0.9)], color: 'gold', width: 1.8 },
      ],
      points: [{ x: r6(k), y: r6(w), r: 5, color: 'ink', label: ask ? 'chord slope = ?' : 'chord: phase velocity', labelDx: 12, labelDy: 14 }],
    },
    caption: `A matter wave’s frequency against its wavenumber (blue), ħω = √((pc)² + (mc²)²), beside light’s ω = ck (grey dashes). At the particle’s k (here for v = ${beta}c) the chord from the origin (violet) has slope ω/k, the phase velocity; the tangent (gold) has slope dω/dk, the group velocity. The light line ω = ck lies between them.`,
  };
}

/** A packet’s width against time, in units of its starting width and of τ = 2mσ₀²/ħ. */
const spreadGraph = {
  type: 'graph',
  params: {
    x: [0, 4], y: [0, 4.3], aspect: 'wide', xlabel: 'time t / τ, with τ = 2mσ₀²/ħ', ylabel: 'width σ / σ₀',
    curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4, label: 'σ(t) = σ₀√(1 + (t/τ)²)', labelAt: 2.6, labelDx: -10, labelDy: -14, labelAlign: 'right' }, { fn: 'x', color: 'ink4', width: 1.2, dash: true, label: 'late times: σ ≈ Δv t', labelAt: 3.6, labelDx: 8, labelDy: 14 }],
    hlines: [{ y: 2, label: 'twice as wide', color: 'gold' }],
  },
  caption: 'How a free Gaussian packet spreads: slowly at first, then in proportion to time, at the speed spread Δv = ħ/2mσ₀ that the uncertainty principle gives it.',
};

/** A few-cycle laser pulse: the field and its envelope. */
const pulse = (fs) => ({
  type: 'graph',
  params: {
    x: [-3, 3], y: [-1.3, 1.5], aspect: 'wide', xlabel: 'time', ylabel: '', xticks: 0, yticks: 0,
    curves: [{ fn: 'exp(-2.7726*x^2)*cos(9.5*x)', domain: [-3, 3], color: 'bad', width: 2 }, { fn: 'exp(-2.7726*x^2)', domain: [-3, 3], color: 'gold', width: 1.4, dash: true }],
    arrows: [{ from: [0, 0.5], to: [0.5, 0.5], color: 'gold', width: 1.4 }, { from: [0, 0.5], to: [-0.5, 0.5], color: 'gold', width: 1.4 }],
    points: [label(0, 0.5, `full width at half maximum: ${fs} fs`, 'gold', 0, -14, 'center')],
  },
  caption: 'A short laser pulse: the electric field (red) under its Gaussian envelope (dashed). Few cycles fit inside, so the pulse must contain a broad spread of frequencies. Drawn with fewer cycles than a real 800 nm pulse has.',
});

/** A GPS satellite’s signal crossing the ionosphere. */
const ionosphere = {
  type: 'graph',
  params: frame([-5, 5], [-0.6, 3.6], {
    aspect: 'wide',
    shade: [{ fn: '2.2', lower: '1.4', from: -4.8, to: 4.8, color: 'violet', alpha: 0.18 }],
    curves: [seg(-4.8, 0, 4.8, 0, 'good', 2.5), seg(2.6, 3.2, -0.6, 0.05, 'gold', 1.8, true)],
    points: [{ x: 2.6, y: 3.2, r: 6, color: 'ink' }, label(2.6, 3.2, 'GPS satellite, 20 200 km up', 'ink', 10, 0), { x: -0.6, y: 0.05, r: 5, color: 'accent' }, label(-0.6, 0, 'receiver', 'accent', 0, 14, 'center'), label(-4.6, 1.8, 'ionosphere: free electrons, roughly 100–1000 km up', 'violet', 0, 0, 'left')],
  }),
  caption: 'A GPS signal on its way down passes through the ionosphere, where free electrons make the speed of radio waves depend on their frequency. Not to scale.',
};

export default lesson({
  id: 'phys2710.MP6.2',
  title: 'Wave packets',
  minutes: 14, difficulty: 3,
  intro: t`A single plane wave $e^{i(kx - \omega t)}$ has one wavelength but fills all of space — no particle is like that. Add many waves with nearby wavenumbers and they reinforce in one region and cancel everywhere else: a **wave packet**, whose length $\Delta x$ shrinks as the spread of wavenumbers $\Delta k$ grows ($\Delta x\,\Delta k \ge \tfrac12$). The crests move at the phase velocity, but the packet itself — where the particle is — moves at the group velocity:

$$v_\text{phase} = \frac{\omega}{k}, \qquad v_\text{group} = \frac{d\omega}{dk}$$

For a matter wave $E = \hbar\omega$ and $p = \hbar k$, so $v_\text{group} = dE/dp$ — exactly the particle’s velocity — while the phase velocity carries nothing and may even exceed light. And because a matter wave’s $\omega$ is not proportional to $k$, its component waves drift out of step: **every free packet spreads**.

> The first look at packets and the uncertainty principle was [Wave–particle duality and the uncertainty principle](#/lesson/phys2220.Q1.4).`,
  symbols: [
    { tex: '\\omega', text: t`the angular frequency of a wave, in rad/s; for a matter wave $\omega = E/\hbar$` },
    { tex: 'k', text: t`the wavenumber $2\pi/\lambda$, in rad/m; for a matter wave $k = p/\hbar$` },
    { tex: 'v_\\text{phase}', text: 'the speed of the crests of one component wave' },
    { tex: 'v_\\text{group}', text: 'the speed of the packet — of the envelope, and of the energy and information it carries' },
    { tex: '\\hbar', text: t`$h/2\pi = 1.055\times10^{-34}$ J s` },
  ],
  why: 'Packets are how quantum mechanics describes a particle that is somewhere, and group velocity is how every signal travels — through glass fibres, through the ionosphere to a GPS receiver, and across the ocean as swell.',
  visual: {
    type: 'mp-packet',
    title: 'Build a packet from plane waves',
    lead: t`Top: a packet made of $N$ plane waves (solid: its real part; dashed: its envelope). The violet dot rides one crest, the gold dot the envelope’s peak. Bottom: the dispersion relation $\omega(k)$ — the chord from the origin gives the phase velocity, the tangent the group velocity — with the waves’ amplitudes as bars.`,
    tasks: [
      'Watch the free particle: the crest drifts backward through the envelope, since v(phase) = v(group)/2, and the packet spreads as it goes.',
      'Choose no dispersion: crest and envelope move together and the shape never changes. Choose deep water: crests run forward through the envelope, born at its back and dying at its front, as on the sea.',
      'Lower N to 5: the single packet becomes a repeating train. Then raise Δk: the packet shortens — and, for the free particle, spreads faster.',
    ],
    params: { view: 'build', disp: 'free', sk: 0.8, N: 31 },
  },
  example: {
    prompt: t`For a free, slow electron, find the group and phase velocities of its matter wave in terms of its speed $v$. Then: an electron packet starts with width $\sigma_0 = 0.10$ nm, about an atom’s size. How wide is it 1.0 fs later? Compare a bacterium of mass $10^{-15}$ kg whose position is known to 1 μm.`,
    visual: still({ disp: 'free', sk: 0.8, N: 41, t: 1.2, dispersion: true }, 'A free-particle packet (dimensionless units) after it has travelled a while: the crests (violet dot) lag behind the envelope (gold dot), and the packet has spread. Below, ω = ħk²/2m: the tangent is twice as steep as the chord.'),
    steps: [
      { label: 'Frequency and wavenumber', text: t`With $E = \hbar\omega$, $p = \hbar k$ and $E = p^2/2m$: $\;\omega(k) = \dfrac{\hbar k^2}{2m}$.` },
      { label: 'Group velocity', text: t`$v_\text{group} = \dfrac{d\omega}{dk} = \dfrac{\hbar k}{m} = \dfrac{p}{m} = v$ — the packet moves with the particle, as it must.` },
      { label: 'Phase velocity', text: t`$v_\text{phase} = \dfrac{\omega}{k} = \dfrac{\hbar k}{2m} = \dfrac v2$. Count the rest energy too, $E = \gamma mc^2$, and it becomes $c^2/v$ instead: the phase velocity depends on where energy is counted from, so it cannot be measured — only $d\omega/dk$ means anything.` },
      { label: 'Spreading', text: t`A Gaussian packet widens as $\sigma(t) = \sigma_0\sqrt{1 + (t/\tau)^2}$ with $\tau = 2m\sigma_0^2/\hbar$. For the electron $\tau = \dfrac{2(9.109\times10^{-31})(1.0\times10^{-10})^2}{1.055\times10^{-34}}\ \text{s} = ${tex(tau(1e-10), 3)}$ s, so after 1.0 fs, $\sigma = 0.10\ \text{nm}\times\sqrt{1 + (${fmt(1e-15 / tau(1e-10), 3)})^2} = ${fmt(width(1e-10, 1e-15) * 1e9, 2)}$ nm.` },
      { label: 'A bacterium', text: t`$\tau = \dfrac{2(10^{-15})(10^{-6})^2}{1.055\times10^{-34}}\ \text{s} = ${tex((2 * 1e-15 * 1e-12) / HBAR, 2)}$ s — about ${Math.round((2 * 1e-15 * 1e-12) / HBAR / 86400)} days before its position blurs noticeably, and long before then it has bumped into a molecule.` },
      { label: 'Sense check', text: t`At late times $\sigma \approx \hbar t/2m\sigma_0 = \Delta v\,t$: the packet spreads at the velocity spread $\Delta v = \hbar/2m\sigma_0$ the uncertainty principle demands. Squeezing it harder makes it spread faster.` },
    ],
    answer: t`$v_\text{group} = v$, $v_\text{phase} = v/2$. The electron packet grows from 0.10 nm to $${fmt(width(1e-10, 1e-15) * 1e9, 2)}$ nm in 1 fs; the bacterium’s takes about ${Math.round((2 * 1e-15 * 1e-12) / HBAR / 86400)} days to spread noticeably.`,
  },
  practice: [
    num({
      id: 'swell', difficulty: 1,
      gen(r) {
        const lam = r.pick([50, 100, 200, 300]), vp = Math.sqrt((G0 * lam) / (2 * Math.PI));
        return {
          prompt: t`Waves on deep water obey $\omega = \sqrt{gk}$. Ocean swell of wavelength ${lam} m runs out from a distant storm. How fast does the swell — the group of waves, carrying their energy — travel, in m/s? ($g = 9.81\ \text{m/s}^2$.)`,
          answer: vp / 2, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: vp, feedback: t`That is the phase velocity $\omega/k = \sqrt{g/k}$ of the crests. The group travels at $d\omega/dk$, half of it.` }],
          hints: [t`$k = 2\pi/\lambda$; $v_\text{phase} = \omega/k = \sqrt{g/k}$.`, t`$v_\text{group} = \dfrac{d\omega}{dk} = \dfrac12\sqrt{\dfrac gk} = \dfrac{v_\text{phase}}{2}$.`],
          teach: 'On deep water the group travels at half the speed of the crests; energy and information go with the group.',
          explain: t`$k = 2\pi/${lam} = ${fmt((2 * Math.PI) / lam, 3)}\ \text{m}^{-1}$, so $v_\text{phase} = ${fmt(vp, 3)}$ m/s and $v_\text{group} = ${fmt(vp / 2, 3)}$ m/s. Longer swell travels faster, so after a storm the longest waves reach the coast first — which is how surfers read a storm’s distance from the swell’s arrival.`,
          visual: still({ disp: 'water', sk: 0.8, N: 41, t: 30 }, 'A packet of deep-water waves (dimensionless units): crests (violet dot) run forward through the envelope (gold dot), born at its back and dying at its front.'),
        };
      },
    }),
    num({
      id: 'phase-faster', difficulty: 2,
      gen(r) {
        const beta = r.pick([0.3, 0.6, 0.8, 0.9]);
        return {
          prompt: t`An electron moves at $${beta}c$. Counting its whole energy, $E = \gamma mc^2 = \hbar\omega$, what is the phase velocity of its matter wave, in units of $c$?`,
          answer: 1 / beta, tol: { rel: 0.005 },
          errors: [{ value: beta, feedback: t`That is the group velocity — the electron’s own speed. The phase velocity is $\omega/k = E/p$.` }, { value: beta / 2, feedback: t`$v/2$ comes from counting only the kinetic energy $p^2/2m$. With $E = \gamma mc^2$, $\omega/k = E/p = c^2/v$.` }],
          hints: [t`$v_\text{phase} = \dfrac{\omega}{k} = \dfrac{E}{p} = \dfrac{\gamma mc^2}{\gamma mv}$.`],
          teach: 'With the rest energy counted, a matter wave’s phase velocity is c²/v — always above c, and harmless, since nothing travels with it.',
          explain: t`$v_\text{phase} = c^2/v = c/${beta} = ${fmt(1 / beta, 4)}c$. No relativity is broken: crests carry no energy or signal. The product $v_\text{phase}v_\text{group} = c^2$, and the packet, the particle and every signal move at $v_\text{group} = ${beta}c$.`,
          visual: hyperbola(beta),
        };
      },
    }),
    mcq({
      id: 'which-velocity', difficulty: 2,
      prompt: 'An electron’s matter wave has crests moving at one speed and a packet moving at another. Which speed is the electron’s?',
      choices: [
        'The group velocity dω/dk, the speed of the packet',
        'The phase velocity ω/k, the speed of the crests',
        'Their average',
        'The speed of light, since matter waves are electromagnetic',
      ],
      answer: 0,
      why: {
        1: 'The phase velocity depends on how energy is counted (v/2 or c²/v) and can exceed c: it cannot be the particle’s speed.',
        2: 'No averaging is involved: dω/dk = dE/dp is exactly the classical velocity.',
        3: 'Matter waves are not electromagnetic waves; an electron’s wave moves with the electron.',
      },
      hints: [t`Where is the particle likely to be found? Follow that region as time passes.`],
      teach: 'The packet — and so the particle — moves at the group velocity, dω/dk = dE/dp = v.',
      explain: t`$|\psi|^2$ is large only inside the envelope, and the envelope moves at $d\omega/dk$. With $\hbar\omega = E$ and $\hbar k = p$ that is $dE/dp$, which for $E = p^2/2m$ is $p/m = v$ — the classical velocity, as it had to be.`,
      visual: still({ disp: 'free', sk: 0.8, N: 41, t: 0.6 }, 'A free-particle packet (dimensionless units), with one crest (violet) and the envelope’s peak (gold) marked.'),
    }),
    num({
      id: 'double-time', difficulty: 2,
      gen(r) {
        const s = r.pick([0.1, 1, 10]), T2 = Math.sqrt(3) * tau(s * 1e-9);
        return {
          prompt: t`An electron is prepared in a Gaussian packet of width $\sigma_0 = ${s}$ nm. How long until its width has doubled, in seconds? (A free packet widens as $\sigma_0\sqrt{1 + (t/\tau)^2}$ with $\tau = 2m\sigma_0^2/\hbar$.)`,
          answer: T2, units: 's', tol: { rel: 0.01 },
          errors: [{ value: tau(s * 1e-9), feedback: t`At $t = \tau$ the width is only $\sqrt2\,\sigma_0$. Doubling needs $1 + (t/\tau)^2 = 4$.` }],
          hints: [t`Doubling means $\sqrt{1 + (t/\tau)^2} = 2$, so $t = \sqrt3\,\tau$.`, t`$\tau = \dfrac{2(9.109\times10^{-31}\ \text{kg})(${s}\times10^{-9}\ \text{m})^2}{1.055\times10^{-34}\ \text{J s}}$.`],
          teach: 'The spreading time scales as mσ₀²/ħ: ten times narrower, a hundred times faster.',
          explain: t`$\tau = ${tex(tau(s * 1e-9), 3)}$ s, so $t = \sqrt3\,\tau = ${tex(T2, 3)}$ s. An electron confined to an atom’s size and then set free blurs out in less than a femtosecond.`,
          visual: spreadGraph,
        };
      },
    }),
    num({
      id: 'pulse-bandwidth', difficulty: 2,
      gen(r) {
        const fs = r.pick([5, 10, 20, 50]), dnu = 0.441 / (fs * 1e-15), dl = ((800e-9) ** 2 * dnu) / C * 1e9;
        return {
          prompt: t`A titanium–sapphire laser makes pulses of light at 800 nm lasting ${fs} fs (full width at half maximum). For a Gaussian pulse the narrowest possible spread of frequencies is $\Delta\nu = 0.441/\Delta t$ (also full widths). What spread of wavelengths, $\Delta\lambda = \lambda^2\Delta\nu/c$, must the pulse contain, in nm?`,
          answer: dl, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: dl / 0.441, feedback: t`Keep the 0.441: $\Delta\nu = 0.441/\Delta t$ for Gaussian pulses measured by their full widths.` }],
          hints: [t`$\Delta\nu = 0.441/(${fs}\times10^{-15}\ \text{s})$.`, t`$\Delta\lambda = \dfrac{(800\times10^{-9}\ \text{m})^2\,\Delta\nu}{3.00\times10^{8}\ \text{m/s}}$.`],
          teach: 'A short pulse is a wave packet in time: Δν·Δt has a floor, so the shorter the pulse, the broader its spectrum.',
          explain: t`$\Delta\nu = ${tex(dnu, 3)}$ Hz, so $\Delta\lambda = ${fmt(dl, 3)}$ nm. ${fs <= 10 ? 'That is a sizeable slice of the visible spectrum’s width — such pulses look white, not red.' : 'Halve the pulse and the spectrum doubles in width.'} The same trade-off, with $E = h\nu$, is the energy–time uncertainty of the next lesson.`,
          visual: pulse(fs),
        };
      },
    }),
    mcq({
      id: 'why-spread', difficulty: 2,
      prompt: 'Why does a free electron’s wave packet spread out as it travels, while a light pulse in vacuum keeps its shape?',
      choices: [
        'Its component waves have phase velocities that depend on k (ω ∝ k² is dispersive), so they drift out of step; light in vacuum has ω = ck, the same speed for every component',
        'The electron loses energy as it travels, so its packet slows and stretches',
        'Electrons repel the other electrons in the packet',
        'Light pulses spread too, at exactly the same rate as electron packets',
      ],
      answer: 0,
      why: {
        1: 'A free packet keeps its energy: nothing acts on it. Its spread of momenta was there from the start.',
        2: 'A packet describes one electron; there is nothing for it to repel.',
        3: 'In vacuum ω = ck for every component, so a light pulse keeps its shape; only in a medium (a glass fibre) do pulses spread.',
      },
      hints: [t`Write the phase velocity $\omega/k$ for $\omega = \hbar k^2/2m$ and for $\omega = ck$. Which depends on $k$?`],
      teach: 'A packet spreads when its components travel at different speeds — when ω is not proportional to k.',
      explain: t`For $\omega = \hbar k^2/2m$ the components move at different speeds and the packet broadens; equivalently, a packet with momentum spread $\Delta p$ contains velocities spread by $\Delta p/m$. In vacuum light has $\omega = ck$: every component keeps pace and the pulse keeps its shape. In a fibre, $\omega(k)$ is slightly curved and pulses do spread — the limit on how fast data can be sent.`,
      visual: still({ disp: 'free', sk: 1.2, N: 51, t: 1.6 }, 'A free-particle packet (dimensionless units) some time after it was prepared: already much wider than it started.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const tecu = r.pick([10, 30, 50, 100]), [band, f] = r.pick(Object.entries(GPS));
        const err = (IONO * tecu * 1e16) / (f * f);
        return {
          prompt: t`In the ionosphere, radio waves obey $\omega^2 = \omega_p^2 + c^2k^2$, where the plasma frequency $\omega_p$ grows with the density of free electrons. A GPS receiver measures range by timing the signal’s code, which travels at the group velocity. Integrated along the path, this makes the measured range too long by $40.3\,\text{TEC}/f^2$ metres, where TEC is the number of free electrons per square metre of path and $f$ the frequency in Hz. With ${tecu} TEC units ($${tecu}\times10^{16}\ \text{m}^{-2}$) on the path, what is the range error on the ${band} signal, $f = ${fmt(f / 1e6, 6)}$ MHz, in metres?`,
          answer: err, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (IONO * tecu * 1e16) / f, feedback: t`Square the frequency: the error falls as $1/f^2$.` }],
          hints: [t`$v_\text{group} = c\sqrt{1 - \omega_p^2/\omega^2} < c$, so the code is late; the formula collects that delay along the path.`, t`Error $= 40.3\times(${tecu}\times10^{16})/(${fmt(f / 1e6, 6)}\times10^{6})^2$ m.`],
          teach: 'Dispersion in the ionosphere delays GPS signals by an amount that falls as 1/f², which is why receivers use two frequencies.',
          explain: t`$40.3\times${tex(tecu * 1e16, 2)}/(${tex(f, 6)})^2 = ${fmt(err, 3)}$ m. Because the error goes as $1/f^2$, a receiver timing two frequencies (L1 and L2, or L1 and L5) can solve for it and remove it — the difference between a 10 m and a 1 m position fix.`,
          visual: ionosphere,
        };
      },
    }),
    mcq({
      id: 'cp-carrier', difficulty: 3,
      prompt: t`In the ionosphere $v_\text{phase}\,v_\text{group} = c^2$. A GPS receiver can also track the radio *carrier wave’s phase*. Compared with travel in vacuum, which statement is true?`,
      choices: [
        'The code (group) arrives late and the carrier phase arrives early, by the same distance',
        'Both are delayed by the same amount',
        'The carrier phase is delayed and the code arrives early',
        'Neither is affected, since radio waves travel at c',
      ],
      answer: 0,
      why: {
        1: t`They travel at different speeds: $v_\text{group} < c < v_\text{phase}$.`,
        2: t`Backwards: the phase velocity exceeds $c$ in a plasma, so the carrier phase gets ahead.`,
        3: 'Only in vacuum. Free electrons make ω depend on k, so neither speed equals c.',
      },
      hints: [t`If $v_\text{group} < c$, then $v_\text{phase} = c^2/v_\text{group}$ is greater or less than $c$?`, t`To first order in $\omega_p^2/\omega^2$, $v_\text{group} \approx c(1 - \epsilon)$ and $v_\text{phase} \approx c(1 + \epsilon)$: equal and opposite.`],
      teach: 'In a plasma the code is delayed and the carrier advanced by equal amounts — the ionospheric divergence GPS engineers correct for.',
      explain: t`With $\omega^2 = \omega_p^2 + c^2k^2$, $v_\text{phase} = c/\sqrt{1 - \omega_p^2/\omega^2} > c$ and $v_\text{group} = c\sqrt{1 - \omega_p^2/\omega^2} < c$. To first order the code is late and the carrier early by the same ${'$40.3\\,\\text{TEC}/f^2$'} metres. No signal outruns light: the carrier’s phase carries no information until it is modulated, and modulations ride at the group velocity.`,
      visual: still({ disp: 'massive', sk: 0.8, N: 41, t: 6, dispersion: true }, 'Waves with ω² = ω₀² + c²k² — the ionosphere’s dispersion relation, here in dimensionless units: crests (violet) run ahead of the envelope (gold), and the chord (phase velocity) is steeper than the light line while the tangent (group velocity) is shallower.'),
    }),
    num({
      id: 'cp-flight', difficulty: 3,
      gen(r) {
        const s0 = r.pick([10, 50, 100]), K = r.pick([100, 1000]);
        const v = Math.sqrt((2 * K * QE) / ME), T = 1 / v, s = width(s0 * 1e-9, T);
        return {
          prompt: t`An electron of ${K} eV is prepared in a packet ${s0} nm wide (Gaussian $\sigma_0$) and flies 1.0 m through a vacuum. How wide is its packet when it arrives, in μm?`,
          answer: s * 1e6, units: 'μm', tol: { rel: 0.01 },
          errors: [{ value: s0 * 1e-3, feedback: 'It does spread: over 1 m of flight the packet grows enormously. Find the flight time and compare it with τ = 2mσ₀²/ħ.' }],
          hints: [t`Flight time: $t = (1.0\ \text{m})/v$ with $v = \sqrt{2K/m_e}$.`, t`$\sigma = \sigma_0\sqrt{1 + (t/\tau)^2}$ with $\tau = 2m_e\sigma_0^2/\hbar$; here $t \gg \tau$, so $\sigma \approx \hbar t/(2m_e\sigma_0)$.`],
          teach: 'An electron packet narrower than a micrometre spreads far over a laboratory flight path — the narrower it starts, the wider it ends.',
          explain: t`$v = ${tex(v, 3)}$ m/s, so $t = ${tex(T, 3)}$ s; $\tau = ${tex(tau(s0 * 1e-9), 3)}$ s. Then $\sigma = ${fmt(s * 1e6, 3)}\ \mu\text{m}$. The narrower packet ends wider — the uncertainty principle again: a small $\sigma_0$ means a large spread of velocities.`,
          visual: spreadGraph,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §7.1–7.2 (wave functions and the uncertainty principle)', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-2-the-heisenberg-uncertainty-principle' },
    { label: 'Klobuchar (1987), Ionospheric time-delay algorithm for single-frequency GPS users, IEEE Trans. Aerosp. Electron. Syst. AES-23, 325', url: 'https://doi.org/10.1109/TAES.1987.310829' },
    { label: 'NOAA Space Weather Prediction Center: the ionosphere and total electron content', url: 'https://www.swpc.noaa.gov/phenomena/ionosphere' },
  ],
});
