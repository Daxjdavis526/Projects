// The PHYS 3750 boss, "Chirp": a night shift at a LIGO-like gravitational-wave
// observatory. Decompose: the harmonics of a square-wave calibration line and
// the spectrum of a timing gate (Fourier series and transform). Propagate: the
// suspension fibres' violin mode (standing waves), a pluck splitting into two
// pulses (d'Alembert) and the power a fibre wave carries (energy flux).
// Disperse: a pulse in a microwave waveguide (group velocity) and an electron
// packet in an ion gauge (Schrödinger dispersion). Fields: the photon
// calibrator's radiation-pressure force and a polarization read from two
// components. Chirp: recognise the waveform, size the orbit from its peak
// frequency, and scale its strain with distance (spherical waves). Every
// number comes from its generator; the case functions are exported so an
// independent script can recompute every key.
import { boss, mcq, num } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const C = 299792458, G = 9.81, ME = 9.1093837139e-31, QE = 1.602176634e-19, GMSUN = 1.32712440018e20, RS_SUN = 2953.25;
const RHO_SILICA = 2200;   // kg/m³, fused silica
const r6 = (x) => +(+x).toPrecision(6);

/** Keep only slips whose values are finite and clearly apart from the key (and from each other). */
function apart(errors, key, rel = 0.03) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, 0.012))) kept.push(e);
  return kept;
}

// ── round 1: decompose ─────────────────────────────────────────────────────
/** A square calibration line of amplitude A (nN) at f0 (Hz); the component at n·f0 (n odd). */
export function squareCase(r) {
  const A = r.pick([0.5, 1, 2, 4]), f0 = r.pick([17.1, 33.3, 41.5]), n = r.pick([3, 5, 7]);
  return { A, f0, n, fn: r6(n * f0), key: (4 * A) / (n * Math.PI) };
}
function squarePic(A, n) {
  const terms = [];
  for (let k = 1; k <= n; k += 2) terms.push(`${r6((4 * A) / (k * Math.PI))}*sin(${2 * k}*pi*x)`);
  return curvesPic([
    { fn: `${A}*(2*step(sin(2*pi*x)) - 1)`, color: 'ink3', width: 1.6, samples: 3000 },
    { fn: terms.join(' + '), color: 'accent', width: 2.2, samples: 3000 },
  ], [0, 2], [-1.6 * A, 1.6 * A], t`Two periods of the square line (grey) and the sum of its harmonics up to the one asked about (blue). Time in periods.`, { xlabel: 'time (periods)', ylabel: 'force (nN)' });
}

/** A rectangular timing gate τ (ms) long: the first zero of its spectrum, in Hz. */
export function gateCase(r) {
  const tau = r.pick([0.5, 1, 2, 4, 8]);
  return { tau, key: 1000 / tau };
}

// ── round 2: propagate ─────────────────────────────────────────────────────
/** A violin mode: test mass M (kg) hung on four fused-silica fibres of length L (m) and diameter d (mm). */
export function violinCase(r) {
  const M = r.pick([20, 40]), L = r.pick([0.45, 0.6]), d = r.pick([0.3, 0.4]);
  const T = (M * G) / 4, mu = RHO_SILICA * Math.PI * (d / 2000) ** 2, v = Math.sqrt(T / mu);
  return { M, L, d, T, mu, v, key: v / (2 * L) };
}
/** A pluck of height H on a string with wave speed v (m/s), released from rest: the peaks' separation after t (ms), in mm. */
export function pluckCase(r) {
  const v = r.pick([350, 500, 600]), tms = r.pick([0.2, 0.5, 0.8]);
  return { v, tms, key: 2 * v * tms };   // m/s × ms = mm
}
/** A travelling wave on a fibre: tension T (N), μ (kg/m), frequency f (Hz), amplitude A (μm); mean power in nW. */
export function powerCase(r) {
  const T = r.pick([49, 98]), mu = r.pick([1.56e-4, 2.76e-4]), f = r.pick([300, 500]), A = r.pick([2, 5, 10]);
  const Z = Math.sqrt(T * mu), w = 2 * Math.PI * f;
  return { T, mu, f, A, Z, w, key: 0.5 * Z * w * w * (A * 1e-6) ** 2 * 1e9 };
}

// ── round 3: disperse ──────────────────────────────────────────────────────
/** A pulse at f (GHz) through L (m) of WR-90 waveguide (cutoff fc = 6.557 GHz): transit time in ns. */
export function guideCase(r) {
  const f = r.pick([7.5, 8.2, 10, 12]), L = r.pick([5, 12, 30]), fc = 6.557;
  const vg = C * Math.sqrt(1 - (fc / f) ** 2);
  return { f, L, fc, vg, key: (L / vg) * 1e9 };
}
/** Electrons accelerated through V (volts) cross d (mm): time in ns at the group velocity. */
export function gaugeCase(r) {
  const V = r.pick([50, 100, 150, 200]), d = r.pick([5, 10, 20]);
  const v = Math.sqrt((2 * QE * V) / ME);
  return { V, d, v, key: (d / 1000 / v) * 1e9 };
}

// ── round 4: fields ────────────────────────────────────────────────────────
/** The photon calibrator: laser power P (W) reflected at normal incidence from a mirror of mass M (kg); peak force in nN. */
export function pcalCase(r) {
  const P = r.pick([0.5, 1, 1.5, 2]), M = r.pick([20, 40]);
  const F = (2 * P) / C;
  return { P, M, F, key: F * 1e9, acc: F / M };
}
/** A polarization read from two components E_x = a cos ωt, E_y = b cos(ωt − δ); k: 0 linear, 1 counterclockwise circular, 2 clockwise circular, 3 elliptical. */
export function polarCase(r) {
  const cases = [
    { a: 1, b: r.pick([0.5, 0.7, 1]), d: r.pick([0, 180]), k: 0 },
    { a: 1, b: 1, d: 90, k: 1 },
    { a: 1, b: 1, d: -90, k: 2 },
    r.bool(0.5) ? { a: 1, b: r.pick([0.4, 0.6]), d: r.pick([90, -90]), k: 3 } : { a: 1, b: 1, d: r.pick([45, -60, 135]), k: 3 },
  ];
  return cases[r.int(0, 3)];
}
function componentsPic(a, b, dDeg, caption) {
  const d = r6((dDeg * Math.PI) / 180);
  return curvesPic([
    { fn: `${a}*cos(x)`, color: 'accent', width: 2.2, label: 'Eₓ', labelAt: 0.25, labelDy: -8 },
    { fn: `${b}*cos(x - ${d})`, color: 'gold', width: 2.2, dash: [6, 4], label: 'E (y)', labelAt: 9.2, labelDy: -8 },
  ], [0, 4 * Math.PI], [-1.35, 1.35], caption, { xlabel: 'ωt (rad)', ylabel: 'E', yticks: 0 });
}

// ── round 5: chirp ─────────────────────────────────────────────────────────
const SIGNALS = [
  { name: 'chirp', fn: (s) => `(0.25 + 0.75*x^2)*sin(2*pi*(${s}*x + ${2 * s}*x^3))*step(1 - x)`, label: 'two compact objects spiralling together' },
  { name: 'ringdown', fn: (s) => `e^(-6*(x - 0.15))*step(x - 0.15)*sin(2*pi*${3 * s}*(x - 0.15))`, label: 'a newly formed black hole ringing down' },
  { name: 'continuous', fn: (s) => `0.55*sin(2*pi*${2 * s}*x)`, label: 'a spinning, slightly lumpy neutron star' },
  { name: 'glitch', fn: (s) => `e^(-((x - 0.55)/0.025)^2)*sin(2*pi*${4 * s}*x)`, label: 'a brief instrumental glitch' },
];
/** Which of four waveforms is shown; s sets its frequency scale. */
export function signalCase(r) {
  const k = r.int(0, 3), s = r.pick([4, 5, 6]);
  return { k, s, expr: SIGNALS[k].fn(s) };
}
/** A binary whose waves peak at f (Hz), total mass M (M☉): Newtonian separation in km. */
export function orbitCase(r) {
  const [M, f] = r.pick([[65, 150], [30, 250], [20, 300], [50, 120], [12, 400]]);
  const w = Math.PI * f, a = Math.cbrt((GMSUN * M) / (w * w)) / 1000;
  return { M, f, key: a, rs: (RS_SUN * M) / 1000 };
}
/** The same merger seen from D2 instead of D1 (Mpc): strain in units of 10⁻²¹. */
export function distanceCase(r) {
  const h1 = r.pick([0.8, 1.0, 1.4]), D1 = r.pick([400, 600]), D2 = r.pick([40, 150, 1200, 2000]);
  return { h1, D1, D2, key: (h1 * D1) / D2 };
}

const SKILL = (id) => `phys3750.${id}`;

export default boss({
  title: 'Chirp',
  intro: t`It is your first night shift in the control room of a gravitational-wave observatory — an imagined twin of the LIGO detectors, with their real dimensions and numbers. Four-kilometre arms; 40 kg mirrors hanging on glass fibres; lasers, waveguides and gauges everywhere. Before the universe sends anything, every instrument has to be understood as a wave problem: you will decompose the calibration signals, propagate waves along the suspensions, disperse pulses through the hardware, check the fields of light pushing the mirrors — and then, at 03:14, recognise a chirp. Five rounds, twelve problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Decompose',
      story: t`The detector is calibrated by pushing a mirror with known forces. One calibration line is a square wave; a timing gate opens for a fixed time. Both signals are sums of plane waves, and the data analysts need to know which frequencies they contain.`,
      items: [
        num({
          id: 'r1-square', skill: SKILL('W6.1'), difficulty: 3,
          gen(r) {
            const C0 = squareCase(r);
            const { A, f0, n, fn, key } = C0;
            return {
              prompt: t`A calibration line pushes the mirror with a square wave: $+${A}$ nN for half of each period, $-${A}$ nN for the other half, repeating at $f_0 = ${f0}$ Hz. Written as a sum of sines, what is the amplitude of its component at ${fn} Hz, in nN?`,
              answer: key, units: 'nN', tol: { rel: 0.01 },
              errors: apart([
                { value: (2 * A) / (n * Math.PI), feedback: t`$\tfrac{2A}{n\pi}$ is $|c_n|$, the complex coefficient at $+n\omega_0$ alone. A real sine of amplitude $b$ is $c_n$ and $c_{-n}$ together: $b = 2|c_n|$.` },
                { value: (4 * A) / Math.PI, feedback: t`That is the fundamental, at ${f0} Hz. ${fn} Hz is the harmonic $n = ${n}$, whose amplitude is smaller by $1/n$.` },
                { value: (4 * A) / (n * n * Math.PI), feedback: t`$1/n^2$ belongs to a triangle wave, which has no jumps. A square wave’s jumps make its harmonics fall only as $1/n$.` },
              ], key),
              hints: [t`${fn} Hz is the harmonic $n = ${fn}/${f0} = ${n}$.`, t`For an odd square wave of amplitude $A$: $f(t) = \dfrac{4A}{\pi}\sum_{n\ \text{odd}}\dfrac{\sin n\omega_0t}{n}$.`, t`Amplitude $= 4A/n\pi$ with $A = ${A}$ nN.`],
              teach: 'A square wave contains only odd harmonics, with amplitudes falling as 1/n.',
              explain: t`${fn} Hz is $${n}f_0$, an odd harmonic, so it is present with amplitude $\dfrac{4A}{${n}\pi} = \dfrac{4(${A})}{${n}\pi} = ${tn(key)}$ nN. The even harmonics are exactly zero, because the wave is odd about each jump’s midpoint and has half-wave symmetry. Calibration teams lean on this: the odd harmonics land at known frequencies with known sizes, a free check across the band.`,
              visual: squarePic(A, n),
            };
          },
        }),
        num({
          id: 'r1-gate', skill: SKILL('W6.2'), difficulty: 3,
          gen(r) {
            const { tau, key } = gateCase(r);
            return {
              prompt: t`A timing gate passes the data stream for exactly $\tau = ${tau}$ ms and blocks it otherwise: a rectangular window. Its Fourier transform is $\tilde f(\omega) = \int_{-\tau/2}^{\tau/2}e^{i\omega t}\,dt$. At what frequency $f = \omega/2\pi$ does its spectrum first fall to zero, in Hz?`,
              answer: key, units: 'Hz', tol: { rel: 0.01 },
              errors: apart([
                { value: key / 2, feedback: t`$\tilde f = 2\sin(\omega\tau/2)/\omega$ vanishes when $\omega\tau/2 = \pi$, so $\omega = 2\pi/\tau$ and $f = 1/\tau$ — not $1/2\tau$.` },
                { value: 2 * Math.PI * key, feedback: t`$2\pi/\tau$ is the angular frequency $\omega$. Divide by $2\pi$ for $f$ in hertz.` },
              ], key),
              hints: [t`$\int_{-\tau/2}^{\tau/2}e^{i\omega t}dt = \dfrac{2\sin(\omega\tau/2)}{\omega}$.`, t`The first zero away from $\omega = 0$ is at $\omega\tau/2 = \pi$.`, t`Then $f = \omega/2\pi = 1/\tau$.`],
              teach: 'A window of duration τ has a spectrum of width about 1/τ: short in time, wide in frequency.',
              explain: t`$\tilde f(\omega) = 2\sin(\omega\tau/2)/\omega$, a sinc with its first zeros at $\omega = \pm2\pi/\tau$, so $f = 1/\tau = ${tn(key)}$ Hz. Gating the data smears every spectral line over about $1/\tau$ — which is why analysts taper their windows gently instead of cutting them sharply.`,
              visual: curvesPic([{ fn: `abs(sin(pi*x)/(pi*x + 1e-9))`, color: 'accent', width: 2.4, domain: [-3.5, 3.5], samples: 2000 }], [-3.5, 3.5], [0, 1.15], t`The gate’s spectrum $|\tilde f|$ against frequency (the axis has no numbers: the scale is what you are asked for).`, { xlabel: 'frequency', ylabel: '|f̃|', xticks: 0, yticks: 0 }),
            };
          },
        }),
      ],
    },
    {
      title: 'Propagate',
      story: t`Each mirror hangs from four fibres of fused silica, thinner than a pencil lead. A fibre under tension is a string, and its standing waves — the “violin modes” — show up in the data as sharp lines. When an earthquake plucks one, waves run along it and carry energy into the mirror.`,
      items: [
        num({
          id: 'r2-violin', skill: SKILL('W5.2'), difficulty: 3,
          gen(r) {
            const { M, L, d, T, mu, v, key } = violinCase(r);
            return {
              prompt: t`A ${M} kg mirror hangs from four identical vertical fused-silica fibres, each ${L} m long and ${d} mm in diameter (density 2200 kg/m³), sharing the weight equally. Each fibre is clamped at both ends. What is the frequency of its fundamental violin mode, in Hz? ($g = 9.81\ \text{m/s}^2$.)`,
              answer: key, units: 'Hz', tol: { rel: 0.01 },
              errors: apart([
                { value: key * 2, feedback: t`Each fibre carries a quarter of the weight, $T = Mg/4$. With the whole weight the speed, and the frequency, come out twice as large.` },
                { value: v / L, feedback: t`Fixed at both ends, the fundamental fits half a wavelength: $\lambda = 2L$ and $f_1 = v/2L$.` },
              ], key),
              hints: [t`Tension per fibre: $T = Mg/4$. Mass per length: $\mu = \rho\pi(d/2)^2$.`, t`Wave speed $v = \sqrt{T/\mu}$; fundamental $f_1 = v/2L$.`, t`$T = ${tn(T)}$ N and $\mu = ${tn(mu)}$ kg/m.`],
              teach: t`A fibre clamped at both ends rings at $f_n = \tfrac{n}{2L}\sqrt{T/\mu}$, like any string.`,
              explain: t`$T = ${M}(9.81)/4 = ${tn(T)}$ N, $\mu = 2200\,\pi(${tn(d / 2000)})^2 = ${tn(mu)}$ kg/m, $v = ${tn(v)}$ m/s, and $f_1 = v/2L = ${tn(key)}$ Hz. Real LIGO suspensions have violin modes near 500 Hz; they are built so the modes ring very sharply, confining their noise to narrow lines.`,
              visual: { type: 'wave-string', params: { mode: 'standing', show: 'mode', n: 1, controls: false, play: false, time: 0.004, readout: false }, caption: 'A fibre clamped at both ends in its fundamental mode, drawn horizontally (amplitude exaggerated, numbers not to the problem’s scale).' },
            };
          },
        }),
        num({
          id: 'r2-pluck', skill: SKILL('W5.1'), difficulty: 3,
          gen(r) {
            const { v, tms, key } = pluckCase(r);
            return {
              prompt: t`A seismic jolt bends a long fibre into a narrow bump and releases it from rest. Waves travel along the fibre at ${v} m/s. By d’Alembert’s solution, how far apart are the peaks of the resulting pulses ${tms} ms later, in mm? (Treat the fibre as long enough that the ends do not matter yet.)`,
              answer: key, units: 'mm', tol: { rel: 0.01 },
              errors: apart([
                { value: key / 2, feedback: t`Released from rest, the bump splits into **two** half-height pulses moving apart, each at $v$: their separation grows at $2v$.` },
              ], key),
              hints: [t`Released from rest: $y(x, t) = \tfrac12\big[f(x - vt) + f(x + vt)\big]$.`, t`Each half moves a distance $vt$, in opposite directions.`, t`Separation $= 2vt$; m/s × ms gives mm.`],
              teach: 'A displacement released from rest splits into two half-height copies running apart at the wave speed.',
              explain: t`$y = \tfrac12[f(x - vt) + f(x + vt)]$: two copies of half the height, centred at $\pm vt$. Separation $2vt = 2(${v})(${tms}\times10^{-3}) = ${tn(key / 1000)}$ m $= ${tn(key)}$ mm.`,
              visual: curvesPic([{ fn: 'e^(-x^2/0.5)', color: 'ink3', dash: [5, 4], width: 1.4 }, { fn: '0.5*e^(-(x - 3)^2/0.5) + 0.5*e^(-(x + 3)^2/0.5)', color: 'accent', width: 2.4 }], [-6, 6], [-0.1, 1.15], t`The bump at release (dashed) and some time later (blue): two half-height pulses moving apart. Shapes and distances illustrative.`, { xlabel: 'x', ylabel: 'y', xticks: 0, yticks: 0, arrows: [{ from: [3.3, 0.65], to: [4.6, 0.65], color: 'gold' }, { from: [-3.3, 0.65], to: [-4.6, 0.65], color: 'gold' }] }),
            };
          },
        }),
        num({
          id: 'r2-power', skill: SKILL('W9.1'), difficulty: 3,
          gen(r) {
            const { T, mu, f, A, Z, w, key } = powerCase(r);
            return {
              prompt: t`A travelling wave of amplitude ${A} μm and frequency ${f} Hz runs down a fibre at tension ${T} N with linear density $${tn(mu)}$ kg/m. What average power does it carry toward the mirror, in nW?`,
              answer: key, units: 'nW', tol: { rel: 0.01 },
              errors: apart([
                { value: key * 2, feedback: t`Average over a cycle: $\overline{\cos^2} = \tfrac12$, so $\bar P = \tfrac12Z\omega^2A^2$.` },
                { value: key / (4 * Math.PI * Math.PI), feedback: t`Use the angular frequency $\omega = 2\pi f$, not $f$.` },
                { value: 0.5 * T * w * w * (A * 1e-6) ** 2 * 1e9, feedback: t`The impedance is $Z = \sqrt{T\mu}$, not the tension itself.` },
              ], key),
              hints: [t`$\bar P = \tfrac12Z\omega^2A^2$ with $Z = \sqrt{T\mu}$.`, t`$Z = ${tn(Z)}$ kg/s and $\omega = 2\pi(${f})$ rad/s; $A$ in metres.`],
              teach: t`A harmonic wave on a string carries $\bar P = \tfrac12Z\omega^2A^2$, with impedance $Z = \sqrt{T\mu}$.`,
              explain: t`$Z = \sqrt{${T}\times${tn(mu)}} = ${tn(Z)}$ kg/s, so $\bar P = \tfrac12(${tn(Z)})(${tn(w)})^2(${A}\times10^{-6})^2 = ${tn(key)}$ nW. Tiny — but the mirror’s position is measured to $10^{-19}$ m, so even this much shaking matters.`,
              visual: { type: 'wv2-junction', params: { controls: false, readout: false, play: false }, caption: 'A pulse on a string with its energy density (shaded) and the flux carrying it along. Illustrative, not the fibre’s numbers.' },
            };
          },
        }),
      ],
    },
    {
      title: 'Disperse',
      story: t`Not every wave in the building keeps its shape. Timing pulses for the detector’s radar-band test equipment travel along a hollow metal waveguide, where frequency decides speed; and the vacuum gauges that watch the four-kilometre beam tubes fire electrons, whose matter waves obey Schrödinger’s dispersive equation.`,
      items: [
        num({
          id: 'r3-guide', skill: SKILL('W6.4'), difficulty: 3,
          gen(r) {
            const { f, L, fc, vg, key } = guideCase(r);
            return {
              prompt: t`In a WR-90 rectangular waveguide the lowest mode obeys $\omega^2 = \omega_c^2 + c^2k^2$, with cutoff $f_c = ${fc}$ GHz. A short pulse centred on ${f} GHz travels ${L} m along it. How long does the pulse take, in ns?`,
              answer: key, units: 'ns', tol: { rel: 0.01 },
              errors: apart([
                { value: (L / C) * 1e9, feedback: t`In free space it would take $L/c$; inside the guide the pulse moves at $v_g = c\sqrt{1 - (f_c/f)^2} < c$.` },
                { value: (L / C) * Math.sqrt(1 - (fc / f) ** 2) * 1e9, feedback: t`That uses the phase velocity, $v_p = c/\sqrt{1 - (f_c/f)^2} > c$. The pulse — the envelope — moves at the group velocity $v_g = c^2/v_p$.` },
              ], key),
              hints: [t`$v_g = d\omega/dk = c^2k/\omega$.`, t`$v_g = c\sqrt{1 - (f_c/f)^2}$.`, t`Time $= L/v_g$.`],
              teach: t`A waveguide disperses like a plasma: $v_pv_g = c^2$, and pulses travel at $v_g < c$, slower the closer they are to cutoff.`,
              explain: t`$v_g = c\sqrt{1 - (${fc}/${f})^2} = ${tn(vg / C)}c = ${tn(vg)}$ m/s, so the pulse takes $${L}/${tn(vg)} = ${tn(key)}$ ns, against $${tn((L / C) * 1e9)}$ ns in free space. Its frequencies also travel at different speeds, so it broadens — the closer to cutoff, the worse.`,
              visual: curvesPic([{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4 }, { fn: 'x', color: 'ink3', dash: [5, 4], width: 1.2, label: 'ω = ck', labelAt: 2.6, labelDy: 14 }], [0, 3], [0, 3.3], t`The guide’s dispersion relation in units of the cutoff $\omega_c$ (and $c = 1$): above light’s line, so chords are steeper than $c$ and tangents shallower.`, { xlabel: 'c k / ω (cutoff)', ylabel: 'ω / ω (cutoff)' }),
            };
          },
        }),
        num({
          id: 'r3-gauge', skill: SKILL('W10.1'), difficulty: 3,
          gen(r) {
            const { V, d, v, key } = gaugeCase(r);
            return {
              prompt: t`An ionization gauge on the beam tube accelerates electrons from rest through ${V} V, then lets them fly ${d} mm to its collector. Each electron is a free wave packet obeying $\omega = \hbar k^2/2m$. How long does a packet take to cross, in ns? (Non-relativistic.)`,
              answer: key, units: 'ns', tol: { rel: 0.01 },
              errors: apart([
                { value: key * 2, feedback: t`That times the crests, at $v_p = \hbar k/2m = v/2$. The packet — the electron — moves at $v_g = \hbar k/m = v$.` },
                { value: key * Math.sqrt(2), feedback: t`$eV = \tfrac12mv^2$, so $v = \sqrt{2eV/m}$ — keep the 2.` },
              ], key),
              hints: [t`$eV = \tfrac12m_ev^2$ gives the electron’s speed.`, t`The packet moves at $v_g = d\omega/dk = \hbar k/m = v$.`, t`Time $= d/v$.`],
              teach: t`A Schrödinger packet moves at $v_g = \hbar k/m$ — the classical speed — while its crests move at half of it.`,
              explain: t`$v = \sqrt{2eV/m_e} = ${tn(v)}$ m/s, so $t = ${d}\times10^{-3}/${tn(v)} = ${tn(key)}$ ns. Its de Broglie wavelength, $h/m_ev$, is about $${tn((6.62607015e-34 / (ME * v)) * 1e9)}$ nm.`,
              visual: curvesPic([{ fn: 'x^2/2', color: 'accent', width: 2.4, domain: [0, 3.2] }, { fn: '0.75*x', color: 'violet', dash: [5, 4], width: 1.4, domain: [0, 1.8] }, { fn: '1.5*(x - 1.5) + 1.125', color: 'gold', dash: [5, 4], width: 1.4, domain: [0.75, 2.5] }], [0, 3.2], [0, 5], t`$\omega = \hbar k^2/2m$ (units with $\hbar = m = 1$): the chord (violet, phase velocity) and the tangent (gold, group velocity) at one $k$.`, { xlabel: 'k', ylabel: 'ω', points: [{ x: 1.5, y: 1.125, color: 'ink', r: 4.5 }] }),
            };
          },
        }),
      ],
    },
    {
      title: 'Fields',
      story: t`The mirrors are pushed by light itself. A photon calibrator — a modulated laser aimed at a mirror’s edge — supplies a force known from Maxwell’s equations alone, and the main laser’s polarization must be exactly what the optics expect.`,
      items: [
        num({
          id: 'r4-pcal', skill: SKILL('W12.2'), difficulty: 3,
          gen(r) {
            const { P, M, F, key, acc } = pcalCase(r);
            return {
              prompt: t`The photon calibrator’s laser delivers up to ${P} W to the ${M} kg mirror, striking it at normal incidence and reflecting almost perfectly. What is the peak force on the mirror, in nN?`,
              answer: key, units: 'nN', tol: { rel: 0.01 },
              errors: apart([
                { value: key / 2, feedback: t`Reflected light reverses its momentum: the force is $2P/c$, twice the absorbed value $P/c$.` },
              ], key),
              hints: [t`Light of power $P$ carries momentum $P/c$ per second.`, t`Reflection reverses it: $F = 2P/c$.`],
              teach: t`A reflected beam pushes with $2P/c$: about 6.7 nN per watt.`,
              explain: t`$F = 2P/c = 2(${P})/(2.998\times10^{8}) = ${tn(key)}$ nN, giving the ${M} kg mirror an acceleration of $${tn(acc)}\ \text{m/s}^2$. Modulated, that is enough to move a free mirror by much more than the $10^{-18}$ m a passing wave does — a calibration traceable to a power meter.`,
              visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', shade: [{ fn: '1.1', lower: '-1.1', from: 1.4, to: 2.0, color: 'ink3', alpha: 0.35 }], arrows: [{ from: [-2.8, 0.25], to: [1.35, 0.25], color: 'gold', width: 2.2 }, { from: [1.35, -0.25], to: [-2.8, -0.25], color: 'gold', width: 2.2, dash: [5, 4] }, { from: [2.1, 0], to: [2.9, 0], color: 'good', width: 2.6, label: 'F', labelDx: 4 }] }, caption: 'The calibration beam (gold) reflected straight back from the mirror (grey); the push F. Not to scale.' },
            };
          },
        }),
        mcq({
          id: 'r4-polar', skill: SKILL('W12.2'), difficulty: 3,
          gen(r) {
            const P = polarCase(r);
            const WHY = [
              'Linear needs the components in step or exactly opposite (δ = 0 or 180°), so the tip moves on a line. Here their peaks do not line up that way.',
              t`Counterclockwise circular needs equal amplitudes with $E_y$ lagging $E_x$ by a quarter cycle ($\delta = +90°$).`,
              t`Clockwise circular needs equal amplitudes with $E_y$ leading $E_x$ by a quarter cycle ($\delta = -90°$).`,
              'These amplitudes and phase make one of the special shapes, not a general ellipse: check whether the peaks line up, or are a quarter cycle apart with equal heights.',
            ];
            const why = {};
            for (let i = 0; i < 4; i++) if (i !== P.k) why[i] = WHY[i];
            const ph = P.d === 0 ? '' : P.d > 0 ? ` - ${P.d}°` : ` + ${-P.d}°`;
            return {
              prompt: t`Behind a wave plate, the light travelling toward you (along $+z$, with $\hat x$ right and $\hat y$ up) has $E_x = ${P.a === 1 ? '' : P.a}E_0\cos\omega t$ and $E_y = ${P.b === 1 ? '' : P.b}E_0\cos(\omega t${ph})$. What is its polarization, as you see it?`,
              choices: ['Linear', 'Circular, turning counterclockwise', 'Circular, turning clockwise', 'Elliptical'],
              answer: P.k, fixedOrder: true, why,
              hints: ['Compare the amplitudes, then how far apart in time the two components peak.', t`Equal amplitudes a quarter cycle apart make a circle; if $E_x$ peaks first and $E_y$ a quarter cycle later, the field turns from $+\hat x$ toward $+\hat y$: counterclockwise.`],
              teach: 'Polarization is set by the two components’ amplitudes and relative phase.',
              explain: t`Amplitude ratio ${P.b}/${P.a} and $E_y$ lagging by $${P.d}°$: ${['linear polarization', 'circular, counterclockwise as you face the wave', 'circular, clockwise as you face the wave', 'an ellipse'][P.k]}. The intensity, $\tfrac12c\varepsilon_0E_0^2(${P.a}^2 + ${P.b}^2)$, does not depend on the phase at all.`,
              visual: componentsPic(P.a, P.b, P.d, t`The two components at one place against $\omega t$: $E_x$ (blue) and $E_y$ (gold, dashed).`),
            };
          },
        }),
      ],
    },
    {
      title: 'Chirp',
      story: t`03:14. Both detectors trigger within milliseconds of each other. The trace on your screen rises in pitch and loudness for a fraction of a second, then stops. Is it real, what made it, and how far away was it?`,
      items: [
        mcq({
          id: 'r5-recognise', skill: SKILL('W14.1'), difficulty: 3,
          gen(r) {
            const S = signalCase(r);
            const WHY = [
              'An inspiral sweeps upward in both frequency and amplitude as the orbit shrinks — this trace does not.',
              'A ringdown starts loud and dies away exponentially at a constant frequency — this trace does not.',
              'A spinning neutron star gives a steady tone of constant frequency and amplitude, lasting for years — this trace is not steady.',
              'A glitch is one short, isolated burst, often in only one detector — this trace is not that.',
            ];
            const why = {};
            for (let i = 0; i < 4; i++) if (i !== S.k) why[i] = WHY[i];
            return {
              prompt: t`Which source made the strain signal on the screen?`,
              choices: ['Two compact objects spiralling together', 'A newly formed black hole ringing down', 'A spinning, slightly lumpy neutron star', 'A brief instrumental glitch'],
              answer: S.k, fixedOrder: true, why,
              hints: ['Look at how the frequency and the amplitude change with time.', 'A chirp rises in both; a ringdown keeps its frequency and decays; a steady tone does neither; a glitch is one short blip.'],
              teach: 'A binary inspiral is recognised by its chirp: frequency and amplitude rising together.',
              explain: t`This is ${SIGNALS[S.k].label}. ${['As the orbit shrinks, the waves get faster and stronger: a chirp, exactly what $f_{\\text{gw}} = 2f_{\\text{orb}}$ and Kepler’s law predict for a shrinking orbit.', 'The remnant of a merger rings at fixed frequency with an exponential decay, like a struck bell.', 'A rotating neutron star with a small bump radiates a steady tone at twice its spin frequency; none has yet been detected.', 'Glitches are instrumental; a real signal must appear in both detectors, within the light-travel time between them.'][S.k]}`,
              visual: curvesPic([{ fn: S.expr, color: 'accent', width: 1.8, samples: 4000 }], [0, 1.05], [-1.15, 1.15], t`Strain against time (relative units, about a second of data), with the noise removed.`, { xlabel: 'time', ylabel: 'h', xticks: 0, yticks: 0 }),
            };
          },
        }),
        num({
          id: 'r5-orbit', skill: SKILL('W14.1'), difficulty: 4,
          gen(r) {
            const { M, f, key, rs } = orbitCase(r);
            return {
              prompt: t`The waveform fit says the total mass is about ${M} solar masses, and the waves peaked near ${f} Hz. Treating the orbit at that moment as Newtonian and circular, how far apart were the two bodies, in km? ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$.)`,
              answer: key, units: 'km', tol: { rel: 0.01 },
              errors: apart([
                { value: key / Math.cbrt(4), feedback: t`The orbit turns at half the wave frequency: $\omega_{\text{orb}} = \pi f$, not $2\pi f$.` },
                { value: Math.cbrt((GMSUN * M) / (f * f)) / 1000, feedback: t`Kepler’s law needs the angular frequency in rad/s: $\omega_{\text{orb}} = \pi f$.` },
              ], key),
              hints: [t`$f_{\text{orb}} = f/2$, so $\omega_{\text{orb}} = 2\pi f_{\text{orb}} = \pi f$.`, t`Kepler: $a^3 = GM/\omega_{\text{orb}}^2$.`, t`$GM = ${M}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$.`],
              teach: 'The peak wave frequency and Kepler’s law size the orbit — the way the first detection proved the bodies were black holes.',
              explain: t`$\omega_{\text{orb}} = \pi(${f}) = ${tn(Math.PI * f)}$ rad/s, so $a = (GM/\omega^2)^{1/3} = ${tn(key)}$ km. Their Schwarzschild radii add to $2GM/c^2 \approx ${tn(rs)}$ km: the orbit is only ${tn(key / rs, 2)} times that. Nothing but black holes is that compact at that mass — and this close the Newtonian picture is only a rough guide.`,
              visual: { type: 'gr-chirp', params: { m1: Math.round(M * 0.55), m2: Math.round(M * 0.45), D: 400, sliders: false, play: false, readout: false, ring: false }, caption: 'The leading-order chirp for a binary of this total mass (illustrative split between the two), stopped before the merger.' },
            };
          },
        }),
        num({
          id: 'r5-distance', skill: SKILL('W7.2'), difficulty: 3,
          gen(r) {
            const { h1, D1, D2, key } = distanceCase(r);
            return {
              prompt: t`The event’s peak strain was $${h1}\times10^{-21}$, and its distance about ${D1} Mpc. Gravitational waves spread as spherical waves. What peak strain would an identical merger at ${D2} Mpc produce? Give it in units of $10^{-21}$.`,
              answer: key, tol: { rel: 0.01 },
              errors: apart([
                { value: (h1 * D1 * D1) / (D2 * D2), feedback: t`The *amplitude* of a spherical wave falls as $1/r$; only its intensity, the energy flux, falls as $1/r^2$.` },
                { value: (h1 * D2) / D1, feedback: 'Farther away means weaker: multiply by D₁/D₂, not D₂/D₁.' },
              ], key),
              hints: [t`A spherical wave’s amplitude is $\propto 1/r$, so its energy flux $\propto 1/r^2$ conserves power.`, t`$h_2 = h_1\,D_1/D_2$.`],
              teach: 'Strain is an amplitude: it falls as 1/r, so detectors reach far.',
              explain: t`$h_2 = ${h1}\times${D1}/${D2} = ${tn(key)}\times10^{-21}$. Because detectors measure amplitude, halving their noise doubles the distance they reach and multiplies the volume of universe they survey by eight.`,
              visual: curvesPic([{ fn: '1/x', color: 'accent', width: 2.4, domain: [0.25, 5] }, { fn: '1/x^2', color: 'ink3', dash: [5, 4], width: 1.3, domain: [0.45, 5] }], [0, 5], [0, 4], t`A spherical wave: amplitude $\propto 1/r$ (blue), energy flux $\propto 1/r^2$ (dashed). Relative units.`, { xlabel: 'distance (relative)', ylabel: 'relative size' }),
            };
          },
        }),
      ],
    },
  ],
});
