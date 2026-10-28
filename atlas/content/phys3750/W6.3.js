// Wave packets and bandwidth: a packet is a carrier under an envelope, i.e. a
// band of plane waves; the narrower the envelope, the wider the band —
// Δx Δk ≳ 1 in space and Δω Δt ≳ 1 in time (σσ ≥ ½ for rms widths, equality
// only for a Gaussian). Applications: how many cycles a pulse has and how
// broad its spectrum is, telemetry symbol rates, femtosecond lasers, and
// radar pulse compression with chirps (range resolution c/2B).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const C = 299792458;

// the worked example: a spaceborne radar, plain pulse against chirp (representative numbers)
const EX = (() => {
  const tau = 10e-6, B = 50e6;
  const Bplain = 1 / tau, Rplain = C * tau / 2, tc = 1 / B, Rchirp = C / (2 * B), BT = B * tau;
  return { tau, B, Bplain, Rplain, tc, Rchirp, BT };
})();

const gaussPulse = (s, f, more = {}) => [
  { fn: `e^(-x^2/(2*${s}^2))*cos(2*pi*${f}*x)`, color: 'accent', samples: 3000, ...more },
  { fn: `e^(-x^2/(2*${s}^2))`, color: 'gold', dash: [5, 4], width: 1.2 },
  { fn: `-e^(-x^2/(2*${s}^2))`, color: 'gold', dash: [5, 4], width: 1.2 },
];

export default lesson({
  id: 'phys3750.W6.3',
  title: 'Wave packets and bandwidth',
  minutes: 14, difficulty: 3,
  intro: t`A single plane wave $e^{i(kx - \omega t)}$ fills all of space and all of time; it carries no news. Anything that starts, stops or is somewhere — a pulse, a word of telemetry, a radar echo — is a **wave packet**: a carrier under an envelope, which by the [Fourier transform](#/lesson/phys3750.W6.2) is a band of plane waves around $k_0$ (or $\omega_0$). The band and the envelope trade off:

$$\Delta x\,\Delta k \gtrsim 1, \qquad \Delta t\,\Delta\omega \gtrsim 1$$

Measured as rms widths of $|f|^2$ and $|\tilde f|^2$ the bound is exactly $\sigma_x\sigma_k \ge \tfrac12$ (and $\sigma_t\sigma_\omega \ge \tfrac12$), reached only by a Gaussian. So a short pulse **needs** a wide bandwidth: that is why fast data links need wide channels and sharp radars need wide sweeps.`,
  symbols: [
    { tex: 'k_0,\\ \\omega_0', text: 'the carrier’s wavenumber (rad/m) and angular frequency (rad/s): what you would call “the” wavelength and frequency' },
    { tex: '\\Delta x,\\ \\Delta t', text: 'the packet’s length in space (m) and duration in time (s)' },
    { tex: '\\Delta k,\\ \\Delta\\omega', text: 'the spread of wavenumbers (rad/m) and angular frequencies (rad/s) it contains: its **bandwidth**' },
    { tex: '\\sigma_t,\\ \\sigma_\\omega', text: 'rms widths of $|f(t)|^2$ and $|\\tilde f(\\omega)|^2$, the precise version of $\\Delta t$ and $\\Delta\\omega$' },
  ],
  why: t`The same trade-off limits radar resolution, data rates, the shortest laser pulses — and, with $p = \hbar k$, it is Heisenberg’s uncertainty principle in quantum mechanics.`,
  visual: {
    type: 'mp-packet',
    title: 'A packet is a band of waves',
    lead: t`Top: the sum of $N$ plane waves (blue) with amplitudes spread over a band $\Delta k$ around $k_0$, and its envelope (dashed). Bottom: each wave’s amplitude as a bar, on the line $\omega = ck$.`,
    tasks: [
      t`Set $N = 1$: one wave, no packet. Raise $N$ to 3, 5, 9: a repeating train, then a single packet.`,
      t`Double the spread $\Delta k$: the packet halves in length. Halve it: the packet stretches out.`,
      t`With no dispersion the packet glides along without changing shape; try another dispersion relation for a preview of W6.4.`,
    ],
    params: { view: 'build', disp: 'none', sk: 0.8, N: 31, controls: ['sk', 'N', 'disp'] },
    caption: t`Dimensionless units; the waves’ amplitudes are Gaussian in $k$ around $k_0 = 6$. With a finite $N$ the packet repeats far away (off screen): a true single packet needs a continuous band.`,
  },
  example: {
    prompt: t`A spaceborne radar sends pulses $\tau = ${EX.tau * 1e6}\ \mu\text{s}$ long. (a) If each pulse is a plain burst of carrier, how well can it tell apart two targets at different ranges? (b) If instead the frequency sweeps linearly across $B = ${EX.B / 1e6}$ MHz during the pulse (a **chirp**), and the receiver compresses each echo with a matched filter, how well then? (Numbers typical of a synthetic-aperture radar.)`,
    steps: [
      { label: 'Resolution is duration', text: t`Two echoes blur together if they overlap in time. An echo of duration $\Delta t$ fixes the round trip only to $\Delta t$, i.e. the range to $\Delta R = c\,\Delta t/2$ (there and back).` },
      { label: 'Plain pulse', text: t`$\Delta t = \tau$: $\Delta R = (${tn(C, 4)})(${tn(EX.tau)})/2 = ${tn(EX.Rplain)}$ m. Its bandwidth is only $\Delta f \approx 1/\tau = ${tn(EX.Bplain / 1e3)}\ \text{kHz}$.` },
      { label: 'Chirp', text: t`The chirp is still $\tau$ long, but it contains every frequency across $B$: its bandwidth is $B$, not $1/\tau$. The matched filter delays each frequency so they all arrive together; by $\Delta t\,\Delta f \approx 1$, the shortest pulse a band $B$ can make lasts $1/B = ${tn(EX.tc * 1e9)}$ ns.` },
      { label: 'Resolution', text: t`$\Delta R = c/(2B) = ${tn(EX.Rchirp)}$ m — ${tn(EX.Rplain / EX.Rchirp)} times better, the pulse’s time–bandwidth product $B\tau = ${tn(EX.BT)}$.` },
      { label: 'Sense check', text: t`The rule $\Delta t\,\Delta f \gtrsim 1$ is a lower bound: the chirp has $\Delta t\,\Delta f = ${tn(EX.BT)} \gg 1$ — long **and** broad. Long keeps the transmitter’s peak power low; broad buys the resolution.` },
    ],
    answer: t`(a) About ${tn(EX.Rplain / 1000, 2)} km. (b) About ${tn(EX.Rchirp, 2)} m. Resolution comes from bandwidth, $\Delta R = c/2B$, not from pulse length.`,
    visual: curvesPic([
      { fn: `step(x + 1)*step(1 - x)*cos(2*pi*(4*(x + 1) + 3*(x + 1)^2))`, color: 'accent', samples: 4000 },
    ], [-1.3, 1.3], [-1.4, 1.4], t`A chirp: the frequency rises steadily across the pulse (time in units of $\tau/2$). Drawn with a few cycles; a real radar chirp has thousands.`, { xlabel: 't / (τ/2)', ylabel: '', yticks: 0 }),
  },
  practice: [
    num({
      id: 'cycles-band', difficulty: 2,
      gen(r) {
        const f = r.pick([2, 3.5, 5, 7.5]), N = r.pick([2, 3, 4, 6]);
        const df = f / N;
        return {
          prompt: t`An ultrasound probe sends pulses of about ${N} cycles at ${f} MHz. Using $\Delta f\,\Delta t \approx 1$, roughly what bandwidth $\Delta f$ does each pulse occupy, in MHz?`,
          visual: curvesPic(gaussPulse(N / 2.5, 1), [-N, N], [-1.25, 1.25], t`A pulse of about ${N} cycles (time in carrier periods), with its envelope dashed.`, { xlabel: 't / (carrier period)', ylabel: '' }),
          answer: df, units: 'MHz', tol: { rel: 0.02 },
          errors: [{ value: f, feedback: t`The carrier frequency is not the bandwidth: a pulse of ${N} cycles lasts $\Delta t = ${N}/f$, so $\Delta f \approx f/${N}$.` }, { value: N / f, feedback: t`That is the duration in μs, $\Delta t = N/f$. The bandwidth is its inverse.` }].filter((e) => Math.abs(e.value - df) > 0.05 * df),
          hints: [t`$N$ cycles of a carrier at $f$ last $\Delta t = N/f$.`, t`$\Delta f \approx 1/\Delta t = f/N$.`],
          teach: t`A pulse of $N$ cycles has a fractional bandwidth $\Delta f/f \approx 1/N$: short pulses are broadband.`,
          explain: t`$\Delta t = ${N}/(${f}\ \text{MHz}) = ${tn(N / f)}\ \mu\text{s}$, so $\Delta f \approx ${tn(df)}$ MHz — ${tn(100 / N, 2)}% of the carrier. Few-cycle pulses give sharp images precisely because they are broadband.`,
        };
      },
    }),
    mcq({
      id: 'shorter-packet', difficulty: 2,
      prompt: t`You want a shorter wave packet (smaller $\Delta x$). What must you change about the plane waves you add up?`,
      visual: curvesPic([...gaussPulse(2.2, 1)], [-6, 6], [-1.25, 1.25], t`A wave packet: the carrier (blue) under its envelope (dashed).`, { xlabel: 'x (carrier wavelengths)', ylabel: '' }),
      choices: [
        t`Spread their wavenumbers over a wider band $\Delta k$`,
        t`Raise the central wavenumber $k_0$, so each wave is shorter`,
        t`Give every wave a larger amplitude, keeping the same band`,
        t`Use fewer waves, keeping the same central wavenumber $k_0$`,
      ],
      answer: 0,
      why: {
        1: t`A larger $k_0$ shortens the carrier’s crests, not the envelope: a packet of 50 short crests is as long as before.`,
        2: 'Amplitude scales the whole packet up; it does not change its shape or length.',
        3: t`Fewer waves over the same band just repeat sooner; the length of each bump is set by the **width** of the band.`,
      },
      hints: [t`The envelope is the Fourier transform of the amplitudes as a function of $k$.`, t`$\Delta x\,\Delta k \gtrsim 1$: to shrink $\Delta x$, grow $\Delta k$.`],
      teach: t`The envelope’s length is set by the band’s width, $\Delta x \sim 1/\Delta k$; the carrier’s wavelength is set by $k_0$. They are independent.`,
      explain: t`Waves with wavenumbers spread by $\Delta k$ stay in step only over a distance $\sim 1/\Delta k$; beyond it they cancel. That distance is the packet.`,
    }),
    num({
      id: 'telemetry', difficulty: 2, transfer: true,
      gen(r) {
        const B = r.pick([0.5, 2, 6, 12]);    // MHz
        return {
          prompt: t`A Mars orbiter is allocated a downlink channel ${B} MHz wide. Using $\Delta f\,\Delta t \approx 1$, what is roughly the shortest symbol (one pulse of data) it can send without spilling out of the channel, in ns?`,
          visual: curvesPic([{ fn: `step(x)*step(1 - x)*1 + step(x - 1)*step(2 - x)*(-1) + step(x - 2)*step(3 - x)*1 + step(x - 3)*step(4 - x)*1`, color: 'accent', samples: 2000 }], [-0.3, 4.3], [-1.4, 1.4], t`A stream of four symbols, each one symbol time long; the sharp edges are idealised (a real modem rounds them to stay in band).`, { xlabel: 't (symbol times)', ylabel: '' }),
          answer: 1000 / B, units: 'ns', tol: { rel: 0.02 },
          errors: [{ value: 1000 / (2 * Math.PI * B), feedback: t`The rule uses ordinary frequency here: $\Delta t \approx 1/\Delta f$ with $\Delta f$ in Hz.` }, { value: B, feedback: t`Invert: $\Delta t \approx 1/\Delta f$.` }],
          hints: [t`$\Delta t \approx 1/\Delta f$.`, t`$1/(${B} \times 10^6\ \text{Hz})$ in ns.`],
          teach: t`Symbol rate is bounded by bandwidth: about one symbol per second per hertz.`,
          explain: t`$\Delta t \approx 1/(${B}\ \text{MHz}) = ${tn(1000 / B)}$ ns, about $${tn(B)}$ million symbols per second. Coding several bits per symbol raises the bit rate, but the symbol rate itself is set by the bandwidth.`,
        };
      },
    }),
    mcq({
      id: 'fs-laser', difficulty: 2,
      prompt: t`A titanium–sapphire laser emits pulses only 10 fs long, centred on 800 nm ($\nu \approx 3.7 \times 10^{14}$ Hz). Is the light of one pulse “800 nm light”?`,
      visual: curvesPic(gaussPulse(1.6, 1), [-5, 5], [-1.25, 1.25], t`A 10 fs pulse holds only a few optical cycles (time in optical periods of 2.7 fs).`, { xlabel: 't (optical periods)', ylabel: '' }),
      choices: [
        t`No: $\Delta\nu \approx 1/\Delta t \approx 10^{14}$ Hz, about a quarter of $\nu$, so it spans roughly 700–920 nm`,
        t`Yes: the laser’s gain medium fixes the wavelength at 800 nm whatever the pulse length`,
        t`Yes: a pulse has a single frequency, the one at which its electric field oscillates`,
        t`No: a short pulse contains only frequencies above 800 nm’s, so it is shifted into the blue`,
      ],
      answer: 0,
      why: {
        1: 'The gain medium must supply the bandwidth (Ti:sapphire’s is very broad) — but the pulse’s duration decides how much of it is used.',
        2: 'A short pulse is the classic counterexample: it contains a band of frequencies, wider the shorter it is.',
        3: t`The band is spread on both sides of the carrier: $\nu_0 \pm \Delta\nu/2$.`,
      },
      hints: [t`$\Delta\nu \approx 1/\Delta t$.`, t`$1/(10^{-14}\ \text{s}) = 10^{14}$ Hz. Compare with $3.7 \times 10^{14}$ Hz.`],
      teach: t`A pulse lasting a few cycles has a bandwidth comparable to its carrier frequency.`,
      explain: t`$\Delta\nu \sim 10^{14}$ Hz around $3.7 \times 10^{14}$ Hz is $\pm 13\%$: the spectrum covers hundreds of nanometres. “Wavelength” only means something sharp for long pulses.`,
    }),
    num({
      id: 'gauss-min', difficulty: 3,
      gen(r) {
        const st = r.pick([0.2, 0.5, 1.5, 4]);    // ps
        const sf = 1 / (4 * Math.PI * st * 1e-12) / 1e9;
        return {
          prompt: t`A Gaussian laser pulse has an intensity profile $|f(t)|^2$ with rms duration $\sigma_t = ${st}$ ps. A Gaussian sits exactly at the limit $\sigma_t\sigma_\omega = \tfrac12$. What is the rms width $\sigma_f = \sigma_\omega/2\pi$ of its power spectrum, in GHz?`,
          visual: curvesPic([{ fn: `e^(-x^2/2)`, color: 'accent' }], [-4, 4], [0, 1.2], t`The intensity profile against $t/\sigma_t$.`, { xlabel: 't / σₜ', ylabel: '|f|² (relative)' }),
          answer: sf, units: 'GHz', tol: { rel: 0.01 },
          errors: [{ value: sf * 2 * Math.PI, feedback: t`That is $\sigma_\omega$ in units of $10^9$ rad/s; divide by $2\pi$.` }, { value: sf * 2, feedback: t`The limit is $\sigma_t\sigma_\omega = \tfrac12$, not 1.` }],
          hints: [t`$\sigma_\omega = 1/(2\sigma_t)$.`, t`$\sigma_f = \sigma_\omega/2\pi = 1/(4\pi\sigma_t)$.`],
          teach: t`For rms widths of $|f|^2$ and $|\tilde f|^2$, $\sigma_t\sigma_\omega \ge \tfrac12$, with equality for a Gaussian: the “transform-limited” pulse.`,
          explain: t`$\sigma_f = 1/(4\pi \times ${tn(st * 1e-12)}\ \text{s}) = ${tn(sf)}$ GHz. A real pulse with a chirp or noise has more bandwidth than this, never less.`,
        };
      },
    }),
    num({
      id: 'compression', difficulty: 3,
      gen(r) {
        const tau = r.pick([5, 20, 40]), B = r.pick([10, 30, 100]);    // μs, MHz
        const ratio = tau * B;
        return {
          prompt: t`A weather radar transmits $${tau}\ \mu\text{s}$ chirps sweeping ${B} MHz. By what factor is its range resolution better than that of a plain ${tau} μs pulse?`,
          visual: curvesPic([{ fn: 'step(x + 1)*step(1 - x)*cos(2*pi*(3*(x + 1) + 4*(x + 1)^2))', color: 'accent', samples: 4000 }], [-1.3, 1.3], [-1.4, 1.4], t`A chirp’s waveform: the frequency sweeps across the band during the pulse (few cycles drawn).`, { xlabel: 't / (τ/2)', ylabel: '', yticks: 0 }),
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: ratio / 2, feedback: t`Both resolutions carry the same factor $c/2$: the ratio is $(c\tau/2)/(c/2B) = B\tau$.` }],
          hints: [t`Plain pulse: $\Delta R = c\tau/2$. Chirp: $\Delta R = c/(2B)$.`, t`Ratio $= B\tau$, with $B$ in Hz and $\tau$ in s.`],
          teach: t`Pulse compression improves resolution by the time–bandwidth product $B\tau$.`,
          explain: t`$B\tau = (${B} \times 10^6)(${tn(tau * 1e-6)}) = ${tn(ratio)}$: from $${tn((C * tau * 1e-6) / 2)}$ m to $${tn(C / (2 * B * 1e6))}$ m.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-altimeter', difficulty: 2, transfer: true,
      gen(r) {
        const B = r.pick([320, 160, 640]);
        return {
          prompt: t`An ocean radar altimeter on a satellite measures sea height from the echo’s timing. Its chirp sweeps $B = ${B}$ MHz${B === 320 ? ' (the bandwidth of Jason-3’s Poseidon-3B)' : ''}. What range resolution $c/2B$ does that give, in m?`,
          visual: curvesPic([{ fn: 'step(x + 1)*step(1 - x)*cos(2*pi*(3*(x + 1) + 5*(x + 1)^2))', color: 'accent', samples: 4000 }], [-1.3, 1.3], [-1.4, 1.4], t`The altimeter’s chirp, drawn with a few cycles.`, { xlabel: 't / (τ/2)', ylabel: '', yticks: 0 }),
          answer: C / (2 * B * 1e6), units: 'm', tol: { rel: 0.01 },
          errors: [{ value: C / (B * 1e6), feedback: t`The echo goes there and back: $\Delta R = c\,\Delta t/2$ with $\Delta t = 1/B$.` }],
          hints: [t`The compressed pulse lasts $\Delta t \approx 1/B$.`, t`$\Delta R = c/(2B)$.`],
          teach: t`Range resolution is set by bandwidth: $\Delta R = c/2B$.`,
          explain: t`$\Delta R = ${tn(C, 4)}/(2 \times ${B} \times 10^6) = ${tn(C / (2 * B * 1e6))}$ m. Averaging many echoes then pins the mean sea surface to centimetres — far finer than one resolution cell.`,
        };
      },
    }),
    mcq({
      id: 'cp-single-freq', difficulty: 2,
      prompt: t`A student says: “My signal generator makes one cycle of a 1 kHz sine and stops — so the signal is at 1 kHz.” What is the best reply?`,
      visual: curvesPic([{ fn: 'step(x)*step(1 - x)*sin(2*pi*x)', color: 'accent', samples: 2000 }], [-1, 2], [-1.3, 1.3], t`One cycle of a sine, zero before and after (time in ms).`, { xlabel: 't (ms)', ylabel: '' }),
      choices: [
        'It lasts only 1 ms, so its spectrum is about 1 kHz wide: it contains a broad band of frequencies around 1 kHz, from near zero upward',
        'It is at 1 kHz: the frequency is set by the generator, not by how long the signal runs',
        'It is at 1 kHz, with a small error that shrinks as the generator’s clock is made more accurate',
        'It has no frequency at all, because a frequency is only defined for a signal that never stops',
      ],
      answer: 0,
      why: {
        1: 'The duration matters: Δf Δt ≳ 1 limits how sharply any signal’s frequency can be defined.',
        2: 'Clock accuracy cannot help: even a perfect 1 ms burst has a spread of about 1 kHz.',
        3: 'It has a spectrum, just not a single line; one can still say where the band is centred.',
      },
      hints: [t`What is $\Delta t$? Then use $\Delta f \approx 1/\Delta t$.`, 'Compare the spread with the centre frequency.'],
      teach: 'A short signal cannot have a single frequency: the shorter it is, the wider its band.',
      explain: t`$\Delta t = 1$ ms gives $\Delta f \approx 1$ kHz — as wide as the centre frequency itself. A frequency is sharp only for a signal of many cycles.`,
    }),
    num({
      id: 'cp-packet-length', difficulty: 3,
      gen(r) {
        const lam = r.pick([0.5, 1, 2]), frac = r.pick([0.02, 0.05, 0.1]);
        const k0 = (2 * Math.PI) / lam, sk = frac * k0, sx = 1 / (2 * sk);
        return {
          prompt: t`A Gaussian packet of water waves has central wavelength ${lam} m and an rms spread of wavenumbers $\sigma_k$ equal to ${tn(frac * 100)}% of $k_0$ (spreads of $|\tilde f|^2$ and $|f|^2$). What is the rms length $\sigma_x$ of the packet’s $|f|^2$, in m?`,
          visual: curvesPic(gaussPulse(1 / (2 * frac * 2 * Math.PI), 1), [-1 / (frac * 2 * Math.PI) * 2.5, 1 / (frac * 2 * Math.PI) * 2.5], [-1.25, 1.25], t`The packet against $x$ in central wavelengths (envelope dashed).`, { xlabel: 'x (wavelengths)', ylabel: '' }),
          answer: sx, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: 1 / sk, feedback: t`For a Gaussian $\sigma_x\sigma_k = \tfrac12$ exactly, not 1.` }, { value: sx * 2 * Math.PI, feedback: t`Use the wavenumber $k_0 = 2\pi/\lambda$, not $1/\lambda$.` }],
          hints: [t`$k_0 = 2\pi/\lambda$, so $\sigma_k = ${frac}k_0$.`, t`$\sigma_x = 1/(2\sigma_k)$.`],
          teach: t`$\sigma_x\sigma_k = \tfrac12$ for a Gaussian packet.`,
          explain: t`$k_0 = ${tn(k0)}$ rad/m, $\sigma_k = ${tn(sk)}$ rad/m, so $\sigma_x = ${tn(sx)}$ m — about $${tn(sx / lam)}$ wavelengths.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 8–9 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Skolnik, Introduction to Radar Systems, 3rd ed., §6: pulse compression', url: 'https://www.mheducation.com/highered/product/introduction-radar-systems-skolnik/M9780072909807.html' },
    { label: 'Jason-3 Products Handbook (CNES/EUMETSAT/NASA/NOAA): Poseidon-3B, 320 MHz Ku-band bandwidth', url: 'https://www.aviso.altimetry.fr/en/missions/current-missions/jason-3.html' },
  ],
});
