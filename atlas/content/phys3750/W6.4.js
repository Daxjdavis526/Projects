// Dispersion, phase and group velocity. The dispersion relation ω(k) gives two
// speeds: the crests move at v_p = ω/k, the envelope (and the energy and the
// news) at v_g = dω/dk — derived from two beating waves. Ocean swell
// (ω = √(gk): v_g = v_p/2, long periods arrive first), capillary waves, the
// chain's zero group velocity at the zone edge, plasma (ω² = ω_p² + c²k²:
// v_p v_g = c²), and pulsar dispersion measures: the Crab's low frequencies
// arrive over a second late.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const C = 299792458, E = 1.602176634e-19, ME = 9.1093837139e-31, EPS0 = 8.8541878188e-12, PC = 3.0856775814913673e16, G = 9.81;
// dispersion delay Δt = K_DM · DM / f², with DM in pc cm⁻³ and f in Hz
const K_DM = ((E * E) / (8 * Math.PI ** 2 * EPS0 * ME * C)) * PC * 1e6;
const delay = (DM, f) => (K_DM * DM) / (f * f);

// the worked example: the Crab pulsar (DM ≈ 56.77 pc cm⁻³, P ≈ 33.7 ms)
const EX = (() => {
  const DM = 56.77, P = 0.0337, f1 = 1.4e9, f2 = 0.4e9;
  const t1 = delay(DM, f1), t2 = delay(DM, f2), dt = t2 - t1;
  const ne = 0.03e6, fp = Math.sqrt((ne * E * E) / (EPS0 * ME)) / (2 * Math.PI);    // a typical ISM density, 0.03 cm⁻³
  return { DM, P, f1, f2, t1, t2, dt, turns: dt / P, fp, kms: K_DM * 1e-15 };
})();

// the chain's dispersion relation in units with a = 1, √(k/m) = 1, and a tangent at the slider value q
const chainGraph = (more = {}) => ({
  x: [0, 3.6], y: [0, 2.5], aspect: 'wide', xlabel: 'q a (rad)', ylabel: 'ω/√(k/m)', xticks: 7, yticks: 5,
  curves: [{ fn: '2*sin(x/2)', color: 'accent', width: 2.4 }, { fn: '2*sin(q/2) + cos(q/2)*(x - q)', color: 'gold', dash: [6, 4], width: 1.6 }],
  points: [{ x: 'q', y: '2*sin(q/2)', color: 'gold', r: 5 }],
  ...more,
});

export default lesson({
  id: 'phys3750.W6.4',
  title: 'Dispersion, phase and group velocity',
  minutes: 18, difficulty: 3,
  intro: t`Put $e^{i(kx - \omega t)}$ into any linear wave equation and you get its **dispersion relation** $\omega(k)$ — as the chain gave $\omega = 2\sqrt{k/m}|\sin(qa/2)|$ in [normal modes of a chain](#/lesson/phys3750.W3.2). Unless $\omega \propto k$, it hands a packet two different speeds:

$$v_p = \frac{\omega}{k}, \qquad v_g = \frac{d\omega}{dk}$$

Add two waves $k_0 \pm \delta k$: the sum is $2\cos(\delta k\,x - \delta\omega\,t)\,e^{i(k_0x - \omega_0t)}$ — a carrier moving at $\omega_0/k_0$ under an envelope moving at $\delta\omega/\delta k \to d\omega/dk$. Crests ride at the **phase velocity**; the packet, its energy and any message ride at the **group velocity**. In deep water the crests outrun the packet; in a plasma the crests outrun light while the signal never does.`,
  symbols: [
    { tex: '\\omega(k)', text: 'the dispersion relation: the frequency (rad/s) each wavenumber $k$ (rad/m) must have to solve the equation' },
    { tex: 'v_p = \\omega/k', text: 'the phase velocity, in m/s: how fast one crest moves — the slope of the chord from the origin to the curve' },
    { tex: 'v_g = d\\omega/dk', text: 'the group velocity, in m/s: how fast the envelope moves — the slope of the tangent to the curve' },
    { tex: '\\delta k,\\ \\delta\\omega', text: 'half the differences in wavenumber and frequency between two beating waves' },
  ],
  why: t`Group velocity is how fast anything real travels — swell from a storm, a radio pulse through plasma, an electron in quantum mechanics (W10) — and its frequency dependence is how astronomers weigh the electrons between us and a pulsar.`,
  visual: {
    type: 'mp-packet',
    title: 'Crests and envelope part company',
    lead: t`A packet of waves under four dispersion relations. The violet dot rides one crest (phase velocity), the gold dot the envelope’s peak (group velocity). Below: $\omega(k)$, the chord (slope $v_p$) and the tangent (slope $v_g$) at $k_0$.`,
    tasks: [
      t`Deep water: crests appear at the back of the packet, run through it, and vanish at the front — they move at twice the envelope’s speed.`,
      t`Free particle ($\omega \propto k^2$): now the envelope is twice as fast as the crests, and the packet spreads.`,
      t`Relativistic particle — the same maths as a plasma: the chord is steeper than the line $\omega = k$ and the tangent shallower. $v_p > 1 > v_g$, with $v_pv_g = 1$.`,
    ],
    params: { view: 'build', disp: 'water', sk: 0.6, N: 41, controls: ['disp', 'sk'] },
    caption: t`Dimensionless units ($c = 1$ for the line $\omega = k$; deep water with $g = 1$). A finite sum of $N$ plane waves; the packet would repeat far off screen.`,
  },
  example: {
    prompt: t`The Crab pulsar’s radio pulses cross about 2 kpc of interstellar plasma. Its **dispersion measure** — the electrons along the way, $\mathrm{DM} = \int n_e\,dl$ — is about ${EX.DM} pc cm⁻³. How much later does a pulse arrive at ${tn(EX.f2 / 1e6)} MHz than at ${tn(EX.f1 / 1e9)} GHz?`,
    steps: [
      { label: 'Plasma dispersion', text: t`Free electrons give light the relation $\omega^2 = \omega_p^2 + c^2k^2$, with plasma frequency $\omega_p^2 = n_ee^2/\varepsilon_0m_e$. For the interstellar $n_e \approx 0.03\ \text{cm}^{-3}$, $f_p = \omega_p/2\pi \approx ${tn(EX.fp / 1e3, 2)}$ kHz — far below radio.` },
      { label: 'Group velocity', text: t`$2\omega\,d\omega = 2c^2k\,dk$, so $v_g = c^2k/\omega$ $= c\sqrt{1 - \omega_p^2/\omega^2}$ $\approx c\Big(1 - \dfrac{\omega_p^2}{2\omega^2}\Big)$: lower frequencies travel slower. (And $v_p = \omega/k > c$, with $v_pv_g = c^2$.)` },
      { label: 'Delay', text: t`Travel time $\int dl/v_g$ $\approx L/c + \dfrac{e^2}{2\varepsilon_0m_ec\,\omega^2}\int n_e\,dl$. With $\omega = 2\pi f$, the extra delay is

$$\begin{gathered}\Delta t = \frac{e^2}{8\pi^2\varepsilon_0m_ec}\,\frac{\mathrm{DM}}{f^2} \\ = ${tn(EX.kms, 4)}\ \text{ms} \times \frac{\mathrm{DM}/(\text{pc cm}^{-3})}{(f/\text{GHz})^2}\end{gathered}$$` },
      { label: 'The Crab', text: t`At ${tn(EX.f1 / 1e9)} GHz: $${tn(EX.t1, 3)}$ s; at ${tn(EX.f2 / 1e6)} MHz: $${tn(EX.t2, 3)}$ s. The difference is $${tn(EX.dt, 3)}$ s.` },
      { label: 'Sense check', text: t`That is about ${Math.round(EX.turns)} turns of the 33.7 ms pulsar: without correcting for dispersion (“dedispersion”) a wide-band receiver would smear the pulses into a continuous hiss. The $1/f^2$ sweep is how pulses and fast radio bursts are recognised as astronomical.` },
    ],
    answer: t`About $${tn(EX.dt, 3)}$ s later at ${tn(EX.f2 / 1e6)} MHz, since $\Delta t \propto \mathrm{DM}/f^2$. Measuring the sweep gives DM; dividing by the distance gives the mean electron density of the Galaxy along the way.`,
    visual: curvesPic([
      { fn: `${K_DM * 56.77 / 1e18}/x^2`, color: 'accent', width: 2.4, domain: [0.25, 2] },
    ], [0.2, 2], [0, 4], t`The Crab’s dispersion delay (s, relative to infinite frequency) against observing frequency (GHz), $\Delta t \propto 1/f^2$. Cold-plasma approximation, valid since $f \gg f_p$.`, { xlabel: 'frequency (GHz)', ylabel: 'delay (s)', points: [{ x: 1.4, y: EX.t1, color: 'gold', label: '1.4 GHz', labelDy: -12 }, { x: 0.4, y: EX.t2, color: 'gold', label: '400 MHz', labelDx: 10 }] }),
  },
  practice: [
    num({
      id: 'swell-speed', difficulty: 2,
      gen(r) {
        const T = r.pick([8, 12, 16, 20]);
        const vp = (G * T) / (2 * Math.PI), vg = vp / 2;
        return {
          prompt: t`Deep-water waves obey $\omega = \sqrt{gk}$. A swell has period $T = ${T}$ s. At what speed does a group of these waves (and their energy) cross the ocean, in m/s? Use $g = 9.81\ \text{m/s}^2$.`,
          visual: curvesPic([{ fn: 'sqrt(x)', color: 'accent', width: 2.4, domain: [0, 4] }, { fn: '(2/3)*x', color: 'violet', dash: [5, 4], width: 1.4, domain: [0, 3.2], label: 'chord: v (phase)', labelAt: 3.0, labelDx: -120, labelDy: -6 }, { fn: '1.5 + (x - 2.25)/3', color: 'gold', dash: [5, 4], width: 1.4, label: 'tangent: v (group)', labelAt: 3.9, labelDy: 18, labelDx: -100 }], [0, 4], [0, 2.2], t`$\omega = \sqrt{gk}$ in units with $g = 1$: at one wavenumber, the chord from the origin (slope $v_p$) and the tangent (slope $v_g$).`, { xlabel: 'k', ylabel: 'ω', points: [{ x: 2.25, y: 1.5, r: 4.5, color: 'ink' }] }),
          answer: vg, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: vp, feedback: t`That is the phase velocity $\omega/k = gT/2\pi$, the speed of one crest. The group moves at half of it.` }],
          hints: [t`$v_g = \dfrac{d\omega}{dk} = \dfrac12\sqrt{g/k} = \dfrac{v_p}{2}$.`, t`$v_p = \omega/k = g/\omega = gT/2\pi$, so $v_g = gT/4\pi$.`],
          teach: t`Deep water: $v_g = v_p/2 = gT/4\pi$ — longer-period swell travels faster.`,
          explain: t`$v_p = gT/2\pi = ${tn(vp)}$ m/s, $v_g = ${tn(vg)}$ m/s — about $${tn(vg * 3.6)}$ km/h, ${tn(vg * 86.4, 3)} km per day.`,
        };
      },
    }),
    {
      type: 'slider', id: 'zero-group', difficulty: 2,
      prompt: t`On the chain’s dispersion curve $\omega = 2\sqrt{k/m}\,\sin(qa/2)$ (blue), the gold line is the tangent at $q$. Move $q$ to where a wave packet would not move at all.`,
      visual: { type: 'graph', params: chainGraph({ sliders: [{ key: 'q', label: 'Wavenumber $qa$', min: 0.2, max: 3.5, step: 0.02, value: 1, unit: '\\text{rad}', explain: 'The central wavenumber of the packet, times the spacing $a$.' }] }), caption: t`The chain’s dispersion relation in units of $\sqrt{k/m}$, with the tangent (gold, dashed) at the chosen wavenumber.` },
      param: 'q', answer: [3.08, 3.2],
      instruction: 'Set the wavenumber where the group velocity is zero, then check.',
      hints: [t`The packet moves at $v_g = d\omega/dq$: the tangent’s slope.`, t`$\dfrac{d\omega}{dq} = a\sqrt{k/m}\cos(qa/2)$ vanishes at $qa = \pi$.`],
      teach: t`Where $\omega(k)$ is flat, $v_g = 0$: the crests still move, but the packet and its energy stand still.`,
      explain: t`At $qa = \pi$ the tangent is horizontal. Neighbours move exactly opposite; the wave is a standing pattern and carries no energy — the edge of the Brillouin zone, where crystals reflect waves (Bragg reflection).`,
    },
    mcq({
      id: 'faster-than-light', difficulty: 3,
      prompt: t`In the ionosphere, radio waves obey $\omega^2 = \omega_p^2 + c^2k^2$, so the phase velocity is $v_p = c/\sqrt{1 - \omega_p^2/\omega^2} > c$. Does this break special relativity?`,
      visual: curvesPic([{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4, label: 'ω(k)', labelAt: 2.2, labelDy: -14 }, { fn: 'x', color: 'ink3', dash: [5, 4], width: 1.2, label: 'ω = ck', labelAt: 2.6, labelDy: 16 }], [0, 3], [0, 3.3], t`The plasma’s dispersion relation (units with $c = 1$, $\omega_p = 1$): every chord from the origin is steeper than light’s line, every tangent shallower.`, { xlabel: 'c k / ωₚ', ylabel: 'ω / ωₚ' }),
      choices: [
        t`No: crests carry no information; signals and energy move at $v_g = c\sqrt{1 - \omega_p^2/\omega^2} < c$`,
        t`Yes: anything moving faster than $c$ violates relativity, so the formula must fail in practice`,
        t`No, because the ionosphere’s electrons drag the light forward, adding their speed to it`,
        t`Yes, but only by a tiny amount, too small to have been measured in the ionosphere`,
      ],
      answer: 0,
      why: {
        1: 'Relativity limits the speed of signals and energy, not of patterns. A crest is a pattern: you cannot send a message by it without modulating the wave, and a modulation is a packet.',
        2: 'The electrons oscillate in place; they do not carry the wave along. The superluminal phase velocity is pure geometry of ω(k).',
        3: t`The effect is not tiny: near $\omega_p$ the phase velocity becomes arbitrarily large. Ionosondes and GPS receivers measure the group delay routinely.`,
      },
      hints: [t`What travels at $v_g$, and what at $v_p$?`, t`$v_pv_g = c^2$ here: if one is above $c$, the other is below.`],
      teach: 'Phase velocity may exceed c; the group (signal, energy) velocity in a normal medium does not.',
      explain: t`$v_g = d\omega/dk = c^2k/\omega = c^2/v_p < c$. GPS receivers correct for exactly this ionospheric group delay, comparing two frequencies — the same $1/f^2$ trick as pulsar dispersion.`,
    }),
    num({
      id: 'iono-vg', difficulty: 3,
      gen(r) {
        const ne = r.pick([0.5, 1, 2]) * 1e12, f = r.pick([15, 20, 30]) * 1e6;
        const fp = Math.sqrt((ne * E * E) / (EPS0 * ME)) / (2 * Math.PI), ratio = Math.sqrt(1 - (fp / f) ** 2);
        return {
          prompt: t`At the peak of the ionosphere the electron density is $n_e = ${tn(ne)}\ \text{m}^{-3}$. What is the group velocity of a ${tn(f / 1e6)} MHz radio signal there, as a fraction of $c$? Use $\omega_p^2 = n_ee^2/\varepsilon_0m_e$. Give 3 significant figures.`,
          visual: curvesPic([{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4 }, { fn: 'x', color: 'ink3', dash: [5, 4], width: 1.2 }], [0, 3], [0, 3.3], t`The plasma’s $\omega(k)$ in units of $\omega_p$ (and $c = 1$); the dashed line is light in vacuum.`, { xlabel: 'c k / ωₚ', ylabel: 'ω / ωₚ' }),
          answer: ratio, tol: { rel: 0.003 },
          errors: [{ value: 1 / ratio, feedback: t`That is $v_p/c$, above 1. The group velocity is $c\sqrt{1 - f_p^2/f^2}$.` }, { value: 1 - 0.5 * (fp / f) ** 2, feedback: t`The approximation $1 - \omega_p^2/2\omega^2$ is too rough this close to $f_p$: use the square root.` }].filter((e) => Math.abs(e.value - ratio) > 0.004 * ratio),
          hints: [t`$f_p = \dfrac{1}{2\pi}\sqrt{\dfrac{n_ee^2}{\varepsilon_0m_e}} \approx 8.98\sqrt{n_e}$ Hz.`, t`$v_g/c = \sqrt{1 - (f_p/f)^2}$.`],
          teach: t`In a plasma $v_g = c\sqrt{1 - \omega_p^2/\omega^2}$: slower the closer the frequency is to $\omega_p$, and zero at it.`,
          explain: t`$f_p = ${tn(fp / 1e6)}$ MHz, so $v_g/c = \sqrt{1 - (${tn(fp / 1e6)}/${tn(f / 1e6)})^2} = ${tn(ratio, 4)}$. Below $f_p$ there is no real $k$ at all: the wave is reflected — which is how shortwave radio bounces round the Earth.`,
        };
      },
    }),
    expr({
      id: 'capillary', difficulty: 3,
      gen(r) {
        const [name, sym, what, p] = r.pick([['alpha', 'α', 'capillary ripples', 3], ['beta', 'β', 'bending waves on a thin plate', 4]]);
        const ans = p === 3 ? `(3/2)*sqrt(${name}*k)` : `2*sqrt(${name})*k`;
        return {
          prompt: t`For ${what} the dispersion relation is $\omega^2 = ${sym}k^{${p}}$ (with $${sym}$ a constant of the medium). Find the group velocity $v_g(k)$.`,
          visual: curvesPic([{ fn: `x^${p / 2}`, color: 'accent', width: 2.4 }], [0, 2], [0, p === 3 ? 2.9 : 4.2], t`$\omega = \sqrt{${sym}k^{${p}}}$ with $${sym} = 1$: it bends upward, so tangents are steeper than chords.`, { xlabel: 'k', ylabel: 'ω' }),
          answer: ans,
          answerTeX: p === 3 ? t`\tfrac32\sqrt{${sym}k}` : t`2\sqrt{${sym}}\,k`,
          lhs: 'v_g', vars: { k: [0.5, 4], [name]: [0.5, 3] }, keys: [[sym, name]],
          errors: [{ answer: p === 3 ? `sqrt(${name}*k)` : `sqrt(${name})*k`, feedback: t`That is the phase velocity $\omega/k$. The group velocity is the derivative $d\omega/dk$.` }],
          hints: [t`$\omega = \sqrt{${sym}}\,k^{${p}/2}$.`, t`$\dfrac{d\omega}{dk} = \dfrac{${p}}{2}\sqrt{${sym}}\,k^{${p}/2 - 1}$; compare with $v_p = \omega/k$.`],
          teach: t`For a power law $\omega \propto k^n$, $v_g = n\,v_p$: deep water ($n = \tfrac12$) has slow groups, ripples and plates ($n > 1$) fast ones.`,
          explain: t`$v_g = \dfrac{${p}}{2}\sqrt{${sym}}\,k^{${p}/2 - 1} = ${p === 3 ? t`\tfrac32\sqrt{${sym}k}` : t`2\sqrt{${sym}}\,k`}$, which is $\tfrac{${p}}{2}v_p$. ${p === 3 ? 'Drop a pebble in a pond: the short ripples run out ahead of the group.' : 'Tap a plate: the high frequencies arrive first, so the click becomes a “chirp” down in pitch.'}`,
        };
      },
    }),
    num({
      id: 'two-waves', difficulty: 2,
      gen(r) {
        const k1 = r.pick([2, 3, 4]), dk = r.pick([0.1, 0.2]), w1 = r.pick([5, 6, 8]), dw = r.pick([0.15, 0.3, 0.45]);
        const vg = dw / dk, vp = (w1 + dw / 2) / (k1 + dk / 2);
        return {
          prompt: t`Two waves of equal amplitude travel together: $k_1 = ${k1}$ rad/m with $\omega_1 = ${w1}$ rad/s, and $k_2 = ${k1 + dk}$ rad/m with $\omega_2 = ${tn(w1 + dw, 4)}$ rad/s. At what speed do the beats (the envelope) move, in m/s?`,
          visual: curvesPic([{ fn: `cos(${k1}*x) + cos(${k1 + dk}*x)`, color: 'accent', samples: 4000 }, { fn: `2*abs(cos(${dk / 2}*x))`, color: 'gold', dash: [5, 4], width: 1.2 }], [0, (2 * Math.PI) / dk * 1.2], [-2.3, 2.3], t`The two waves’ sum at $t = 0$ (blue) and its envelope (dashed), $x$ in m.`, { xlabel: 'x (m)', ylabel: '' }),
          answer: vg, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: vp, feedback: t`That is the phase velocity of the carrier, $\bar\omega/\bar k$. The envelope moves at $\Delta\omega/\Delta k$.` }].filter((e) => Math.abs(e.value - vg) > 0.05 * vg),
          hints: [t`The sum is $2\cos\big(\tfrac{\Delta k}{2}x - \tfrac{\Delta\omega}{2}t\big)\times$ (carrier).`, t`The envelope moves at $\Delta\omega/\Delta k$.`],
          teach: t`Two beating waves: envelope speed $\Delta\omega/\Delta k$, which becomes $d\omega/dk$ for a narrow band.`,
          explain: t`$\Delta\omega/\Delta k = ${tn(dw)}/${tn(dk)} = ${tn(vg)}$ m/s, while the crests move at $\approx ${tn(vp)}$ m/s.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pulsar-dm', difficulty: 3, transfer: true,
      gen(r) {
        const DM = r.pick([12.4, 26.8, 71, 140]), fl = r.pick([0.15, 0.3, 0.6]), fh = 1.4;
        const dt = delay(DM, fl * 1e9) - delay(DM, fh * 1e9);
        return {
          prompt: t`A newly found pulsar has dispersion measure ${DM} pc cm⁻³. How much later do its pulses arrive at ${tn(fl * 1000)} MHz than at ${fh} GHz, in s? Use $\Delta t = ${tn(K_DM * 1e-15, 4)}\ \text{ms} \times \mathrm{DM}/(f/\text{GHz})^2$, with DM in pc cm⁻³.`,
          visual: curvesPic([{ fn: `${(K_DM * DM) / 1e18}/x^2`, color: 'accent', width: 2.4, domain: [0.1, 2] }], [0.1, 2], [0, (K_DM * DM) / 1e18 / (fl * fl) * 1.3], t`Dispersion delay (s, relative to infinite frequency) against frequency (GHz) for this DM.`, { xlabel: 'frequency (GHz)', ylabel: 'delay (s)' }),
          answer: dt, units: 's', tol: { rel: 0.01 },
          errors: [{ value: delay(DM, fl * 1e9), feedback: 'That is the delay at the low frequency relative to infinite frequency; subtract the delay at the high frequency.' }, { value: (K_DM * DM) / (fl * 1e9) - (K_DM * DM) / (fh * 1e9), feedback: t`The delay goes as $1/f^2$, not $1/f$.` }],
          hints: [t`$\Delta t(f) = ${tn(K_DM * 1e-15, 4)}\ \text{ms} \times \mathrm{DM}/f_{\text{GHz}}^2$ at each frequency.`, t`Subtract: $\Delta t(${fl}) - \Delta t(${fh})$.`],
          teach: t`Plasma delays a pulse by $\propto \mathrm{DM}/f^2$: low frequencies arrive last.`,
          explain: t`$${tn(delay(DM, fl * 1e9), 3)} - ${tn(delay(DM, fh * 1e9), 3)} = ${tn(dt, 3)}$ s.`,
        };
      },
    }),
    num({
      id: 'cp-swell', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([4000, 8000, 11000]), T1 = r.pick([18, 20, 22]), T2 = r.pick([10, 12, 14]);
        const v1 = (G * T1) / (4 * Math.PI), v2 = (G * T2) / (4 * Math.PI), dt = (D * 1000) / v2 / 3600 - (D * 1000) / v1 / 3600;
        return {
          prompt: t`A Southern Ocean storm raises swell of every period. A surf forecaster ${D} km away sees ${T1} s swell arrive first. How many hours later does the ${T2} s swell arrive? (Deep water: $v_g = gT/4\pi$, $g = 9.81\ \text{m/s}^2$.)`,
          visual: curvesPic([{ fn: `${(G / (4 * Math.PI)).toFixed(5)}*x`, color: 'accent', width: 2.4 }], [0, 25], [0, 20], t`Deep-water group velocity (m/s) against wave period (s): long swell travels fastest.`, { xlabel: 'period (s)', ylabel: 'v (group) (m/s)', points: [{ x: T1, y: v1, color: 'gold' }, { x: T2, y: v2, color: 'gold' }] }),
          answer: dt, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: dt / 2, feedback: t`Groups travel at $gT/4\pi$, half the crest speed $gT/2\pi$.` }],
          hints: [t`Each period travels at $v_g = gT/4\pi$; arrival time $= D/v_g$.`, t`Find both times in hours and subtract.`],
          teach: 'Dispersion sorts swell by period: the long waves arrive first, and the delay tells you how far away the storm was.',
          explain: t`$v_g = ${tn(v1)}$ and $${tn(v2)}$ m/s; travel times $${tn((D * 1000) / v1 / 3600)}$ h and $${tn((D * 1000) / v2 / 3600)}$ h, so $${tn(dt)}$ h apart. Munk and colleagues used this sorting in 1963 to trace swell reaching Alaska back to storms near Antarctica.`,
        };
      },
    }),
    mcq({
      id: 'cp-information', difficulty: 2,
      prompt: t`A wave packet travels through a medium where $v_p = 2v_g$. Which speed tells you how soon a message carried by the packet arrives?`,
      visual: curvesPic([{ fn: 'e^(-x^2/8)*cos(4*x)', color: 'accent', samples: 3000 }, { fn: 'e^(-x^2/8)', color: 'gold', dash: [5, 4], width: 1.2 }, { fn: '-e^(-x^2/8)', color: 'gold', dash: [5, 4], width: 1.2 }], [-8, 8], [-1.3, 1.3], t`A packet: the crests (blue) and the envelope (gold) that carries the message.`, { xlabel: 'x', ylabel: '' }),
      choices: [t`The group velocity $v_g$: the message is the envelope`, t`The phase velocity $v_p$: the crests arrive first`, t`Their average, $(v_p + v_g)/2$`, t`Neither: a packet in a dispersive medium carries no information`],
      answer: 0,
      why: {
        1: 'Crests arriving first carry nothing: a crest looks the same before and after the message. Only a change — the envelope — can carry news.',
        2: 'No such average appears: the envelope moves at dω/dk and the crests at ω/k.',
        3: 'Dispersion spreads a packet, but it still delivers its energy and its message, at about the group velocity.',
      },
      hints: [t`A message means a change: switching on, switching off, modulating.`, t`Changes in amplitude travel with the envelope.`],
      teach: 'Information and energy travel with the envelope, at the group velocity (in normal media).',
      explain: t`Crests slide through the packet — appearing at the back and vanishing at the front when $v_p > v_g$ — but the bump of energy moves at $v_g$. (In strongly absorbing media even $v_g$ can misbehave; the true limit is the front velocity, which never exceeds $c$.)`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, §8.5: The Dispersion Relation (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Jodrell Bank Crab Pulsar Monthly Ephemeris (Lyne, Pritchard & Graham-Smith 1993, MNRAS 265, 1003): DM ≈ 56.77 pc cm⁻³, slowly varying', url: 'https://www.jb.man.ac.uk/pulsar/crab.html' },
    { label: 'Lorimer & Kramer, Handbook of Pulsar Astronomy (CUP, 2005), §4.1: dispersion', url: 'https://www.cambridge.org/9780521828239' },
    { label: 'Munk et al., Directional recording of swell from distant storms, Phil. Trans. R. Soc. A 255, 505 (1963)', url: 'https://doi.org/10.1098/rsta.1963.0011' },
  ],
});
