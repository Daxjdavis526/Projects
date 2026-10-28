// Adding waves of different frequency: beats and group velocity (Hecht
// §7.2), optical and brief: PHYS 3750 W6.4 derived v_g = dω/dk with ocean
// swell, plasma and pulsars. Here: two lasers beating on a photodiode (the
// detector follows |ν₁ − ν₂|, gigahertz, not 10¹⁴ Hz — heterodyne detection);
// the envelope moving at Δω/Δk while crests slide through it; in glass the
// group index n_g = n − λ₀ dn/dλ₀ from the Sellmeier fits (fused silica at
// 1550 nm: n = 1.4440, n_g = 1.4626, with its minimum near 1.27 µm where
// dispersion vanishes); group delays of pulses at different colours. Transfers:
// the Doppler beat of a LEO laser-comm downlink, the arrival time over a fibre.
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, sf, nOf, MATS } from './_op.js';

const t = String.raw;
/** n, dn/dλ (per µm) and the group index n_g of a material at λ (nm). */
function disp(mat, nm) {
  const h = 0.01, n = nOf(mat, nm), d = ((nOf(mat, nm + h) - nOf(mat, nm - h)) / (2 * h)) * 1000;
  return { n, d, ng: n - (nm / 1000) * d };
}
const EX = { L: 10, ...disp('silica', 1550) };
EX.tp = (EX.L * 1000 * EX.n) / C;       // s, at the phase velocity
EX.tg = (EX.L * 1000 * EX.ng) / C;      // s, at the group velocity

/** The beat pattern of two waves: carrier k₀, envelope Δk, frozen at one instant. */
const beatPic = (dk, caption) => ({
  type: 'graph', caption,
  params: { x: [0, 30], y: [-2.4, 2.4], aspect: 'wide', xlabel: 'position', ylabel: 'field', yticks: 4,
    curves: [{ fn: `2*cos(${dk / 2}*x)*cos(12*x)`, color: 'gold', width: 1.6, samples: 2000 }, { fn: `2*abs(cos(${dk / 2}*x))`, color: 'violet', width: 1.4, dash: [5, 4] }, { fn: `-2*abs(cos(${dk / 2}*x))`, color: 'violet', width: 1.4, dash: [5, 4] }] },
});

/** The group index of fused silica and N-BK7 against wavelength (µm). */
const ngPic = (caption, mark = null) => {
  const S = (B, Cc) => `sqrt(1 + ${B[0]}*x^2/(x^2 - ${Cc[0]}) + ${B[1]}*x^2/(x^2 - ${Cc[1]}) + ${B[2]}*x^2/(x^2 - ${Cc[2]}))`;
  const si = S([0.6961663, 0.4079426, 0.8974794], [0.004679148, 0.013512063, 97.93400254]);
  const bk = S([1.03961212, 0.231792344, 1.01046945], [0.00600069867, 0.0200179144, 103.560653]);
  const dg = (e) => `(${e.replace(/x/g, '(x + 0.0005)')} - ${e.replace(/x/g, '(x - 0.0005)')})/0.001`;
  return { type: 'graph', caption, params: { x: [0.45, 1.7], y: [1.43, 1.57], aspect: 'wide', xlabel: 'vacuum wavelength (µm)', ylabel: 'index', yticks: 4,
    curves: [{ fn: si, color: 'teal', width: 1.6, dash: [5, 4] }, { fn: `${si} - x*${dg(si)}`, color: 'teal', width: 2.4, label: 'silica group', labelAt: 0.6, labelDy: -10 }, { fn: bk, color: 'accent', width: 1.6, dash: [5, 4] }, { fn: `${bk} - x*${dg(bk)}`, color: 'accent', width: 2.4, label: 'N-BK7 group', labelAt: 1.4, labelDy: -10 }],
    ...(mark ? { vlines: [{ x: mark, color: 'gold' }] } : {}),
    legend: [{ label: 'phase index n', color: 'ink2', dash: [5, 4] }, { label: 'group index', color: 'ink2' }], legendAt: 'tr' } };
};

export default lesson({
  id: 'phys4650.O5.2',
  title: 'Adding waves of different frequency: beats and group velocity',
  minutes: 13, difficulty: 3,
  intro: t`Add two waves of slightly different frequency and the sum is a fast **carrier** at the average frequency inside a slow **envelope** at half the difference — beats. A photodiode cannot follow light’s $10^{14}$ Hz, but it follows the envelope: two lasers mixed on a detector give a signal at $|\nu_1 - \nu_2|$, gigahertz. The crests move at the phase velocity $\omega/k$; the envelope — and any pulse, and the energy — moves at the **group velocity** ([PHYS 3750 W6.4](#/lesson/phys3750.W6.4)). In glass, where $n$ depends on wavelength:

$$v_g = \frac{d\omega}{dk} = \frac{c}{n_g}, \qquad n_g = n - \lambda_0\frac{dn}{d\lambda_0}$$`,
  symbols: [
    { tex: 'v_g', text: 'the group velocity: the speed of the envelope, a pulse, and the energy, in m/s' },
    { tex: 'n_g', text: t`the group index; in transparent glass $dn/d\lambda_0 < 0$ (normal dispersion), so $n_g > n$ and pulses travel slower than crests` },
    { tex: 'n', text: t`the ordinary (phase) index: crests move at $c/n$` },
    { tex: '\\lambda_0', text: 'the vacuum wavelength' },
    { tex: 'dn/d\\lambda_0', text: 'how fast the index changes with wavelength (per µm, for example)' },
  ],
  why: t`Coherent laser-comm receivers, lidar and fibre timing all work with beats and group delays — and every short pulse in glass travels at $c/n_g$, not $c/n$.`,
  visual: {
    type: 'graph',
    title: 'Crests and envelope',
    lead: t`Two equal waves with wavenumbers $k_0 \pm \Delta k/2$ add to a carrier inside an envelope (violet). Move time forward: the gold dot rides a crest at the phase velocity, the violet dot marks the envelope’s peak at the group velocity.`,
    tasks: [
      t`With $v_g = v_p$ (no dispersion) the crest and envelope travel together.`,
      t`Set $v_g$ below $v_p$, as in glass: crests are born at the back of each group, slide forward through it and die at the front.`,
      t`Halve $\Delta k$: the groups get twice as long. Beat length and frequency difference are inversely related.`,
    ],
    params: {
      x: [0, 30], y: [-2.6, 2.6], aspect: 'wide', xlabel: 'position', ylabel: 'field', yticks: 4,
      sliders: [
        { key: 'T', label: 'Time $t$', min: 0, max: 10, step: 0.05, value: 0, explain: 'Moves both waves forward.' },
        { key: 'vp', label: 'Phase velocity $v_p$', min: 0.5, max: 2, step: 0.05, value: 1, explain: 'How fast the crests move (= ω/k).' },
        { key: 'vg', label: 'Group velocity $v_g$', min: 0.2, max: 2, step: 0.05, value: 0.6, explain: 'How fast the envelope moves (= dω/dk).' },
        { key: 'dk', label: 'Wavenumber difference $\\Delta k$', min: 0.3, max: 2, step: 0.05, value: 0.8, explain: 'Sets the length of each group: 2π/Δk between beats.' },
      ],
      curves: [
        { fn: '2*cos(dk/2*(x - vg*T))*cos(12*(x - vp*T))', color: 'gold', width: 1.5, samples: 2400 },
        { fn: '2*abs(cos(dk/2*(x - vg*T)))', color: 'violet', width: 1.3, dash: [5, 4] },
        { fn: '-2*abs(cos(dk/2*(x - vg*T)))', color: 'violet', width: 1.3, dash: [5, 4] },
      ],
      points: [{ x: 'vp*T', y: '2*cos(dk/2*(vp*T - vg*T))', color: 'gold', r: 5 }, { x: 'vg*T', y: 2.25, color: 'violet', r: 5, label: 'envelope peak', labelDy: -4 }],
    },
    caption: t`A frozen pair of equal waves at two wavenumbers, $2\cos(\tfrac12\Delta k(x - v_gt))\cos(k_0(x - v_pt))$; the speeds are set independently to show the idea. In a real medium both follow from $\omega(k)$.`,
  },
  example: {
    prompt: t`A 1550 nm pulse travels ${EX.L} km through fused silica. From the Sellmeier fit, $n = ${sf(EX.n, 5)}$ and $dn/d\lambda_0 = ${sf(EX.d, 4)}\ \mu\text{m}^{-1}$ there. Find the group index and how long the pulse takes, and compare with the time the phase velocity would suggest.`,
    visual: ngPic(t`Phase index (dashed) and group index (solid) of fused silica (teal) and N-BK7 (blue) from their Sellmeier fits; the gold line marks 1550 nm.`, 1.55),
    steps: [
      { label: 'Group index', text: t`$n_g = n - \lambda_0\,dn/d\lambda_0 = ${sf(EX.n, 5)} - (1.55)(${sf(EX.d, 4)}) = ${sf(EX.ng, 5)}$. The index falls with wavelength, so $n_g > n$.` },
      { label: 'Pulse time', text: t`$t_g = Ln_g/c = ${sf(EX.tg * 1e6, 5)}\ \mu\text{s}$.` },
      { label: 'Phase time', text: t`$Ln/c = ${sf(EX.tp * 1e6, 5)}\ \mu\text{s}$: the crests would arrive $${sf((EX.tg - EX.tp) * 1e9, 3)}$ ns sooner. No signal arrives then: information rides the envelope.` },
      { label: 'Sense check', text: t`Telecom fibre’s group index is about 1.468 (its core is doped): a rule of thumb of 5 µs per km of fibre, which sets the latency of every undersea link.` },
    ],
    answer: t`$n_g = ${sf(EX.ng, 5)}$; the pulse takes $${sf(EX.tg * 1e6, 4)}\ \mu\text{s}$, $${sf((EX.tg - EX.tp) * 1e9, 3)}$ ns longer than $Ln/c$.`,
  },
  practice: [
    num({
      id: 'laser-beat', difficulty: 1,
      gen(r) {
        const l1 = r.pick([1064, 1550, 633]), dl = r.pick([0.01, 0.02, 0.05, 0.08]);
        const f = ((C / ((l1) * 1e-9)) - (C / ((l1 + dl) * 1e-9))) / 1e9;
        return {
          prompt: t`Two lasers at ${l1}.00 nm and $${sf(l1 + dl, 6)}$ nm shine on the same fast photodiode with their beams aligned. At what frequency does the photocurrent oscillate, in GHz?`,
          visual: beatPic(1, t`Two waves of nearly equal frequency add to a fast carrier in a slow envelope; the detector follows only the envelope. Frequencies hugely compressed.`),
          answer: f, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: f / 2, feedback: 'The irradiance (what the detector sees) beats at the full difference |ν₁ − ν₂|; the field’s envelope cosine has half that, but it is squared.' }, { value: (C / (l1 * 1e-9)) / 1e9, feedback: 'That is the optical frequency itself, far too fast for any photodiode.' }],
          hints: [t`$\nu = c/\lambda$ for each laser; subtract.`, t`Or $\Delta\nu \approx c\,\Delta\lambda/\lambda^2$.`],
          teach: t`Two lasers beat at $|\nu_1 - \nu_2| \approx c\Delta\lambda/\lambda^2$ — microwave frequencies a photodiode can follow.`,
          explain: t`$\Delta\nu = c\,\Delta\lambda/\lambda^2 = ${sf(f, 3)}$ GHz. This is **heterodyne detection**: the beat carries the optical phase and frequency of the signal into electronics.`,
        };
      },
    }),
    mcq({
      id: 'why-beat', difficulty: 2,
      prompt: t`The irradiance of two superposed lasers contains terms at $2\nu_1$, $2\nu_2$, $\nu_1 + \nu_2$ and $\nu_1 - \nu_2$. Why does the photodiode’s output show only the difference frequency (plus a steady part)?`,
      visual: beatPic(0.7, t`The summed field: fast carrier (gold), slow envelope (violet). Compressed scale.`),
      choices: ['The detector responds to the irradiance averaged over its response time (picoseconds at best); only terms slower than that survive.', 'The sum-frequency terms cancel exactly.', 'Photodiodes only absorb light at the difference frequency.', 'The difference term is the only one that carries energy.'],
      answer: 0,
      why: { 1: 'They do not cancel; they average to zero over any realistic response time.', 2: 'The photodiode absorbs the light at its optical frequency; what it cannot do is follow 10¹⁴ Hz oscillations of the power.', 3: 'Energy is in the steady part mostly; the beat is a modulation of it.' },
      hints: ['How fast can electrons in a photodiode respond: femtoseconds or picoseconds?'],
      teach: 'Square-law detectors average away optical-frequency terms and keep the slow beat — the basis of heterodyne and coherent detection.',
      explain: t`$|E_1 + E_2|^2$ has terms at optical frequencies and their sums, which average to zero in a picosecond, plus $I_1 + I_2 + 2\sqrt{I_1I_2}\cos(2\pi(\nu_1 - \nu_2)t + \phi)$. A gigahertz beat is slow enough to follow.`,
    }),
    num({
      id: 'group-index', difficulty: 2,
      gen(r) {
        const mat = r.pick(['bk7', 'f2', 'sf11', 'silica']), nm = r.pick([532, 800, 1064]);
        const D = disp(mat, nm);
        return {
          prompt: t`At ${nm} nm, ${MATS[mat].name} has $n = ${sf(D.n, 5)}$ and $dn/d\lambda_0 = ${sf(D.d, 4)}\ \mu\text{m}^{-1}$. What is its group index?`,
          visual: ngPic(t`Phase (dashed) and group (solid) indices of fused silica and N-BK7; the gold line marks ${nm} nm.`, nm / 1000),
          answer: D.ng, tol: { rel: 2e-4 },
          errors: [{ value: D.n + (nm / 1000) * D.d, feedback: t`Sign: $n_g = n - \lambda_0\,dn/d\lambda_0$, and $dn/d\lambda_0$ is negative, so $n_g > n$.` }, { value: D.n - nm * D.d, feedback: t`Keep units consistent: λ in µm with $dn/d\lambda_0$ per µm.` }],
          hints: [t`$n_g = n - \lambda_0\,dn/d\lambda_0$ with $\lambda_0 = ${nm / 1000}\ \mu\text{m}$.`],
          teach: t`Normal dispersion ($dn/d\lambda < 0$) makes the group index larger than the phase index.`,
          explain: t`$n_g = ${sf(D.n, 5)} - (${nm / 1000})(${sf(D.d, 4)}) = ${sf(D.ng, 5)}$: pulses travel at $c/${sf(D.ng, 4)}$.`,
        };
      },
    }),
    num({
      id: 'colour-delay', difficulty: 3,
      gen(r) {
        const mat = r.pick(['bk7', 'f2', 'silica']), L = r.pick([5, 10, 20]);
        const a = disp(mat, 532), b = disp(mat, 1064);
        const dt = ((L / 1000) * (a.ng - b.ng)) / C * 1e12;
        return {
          prompt: t`A laser emits simultaneous short pulses at 1064 nm and at its second harmonic, 532 nm. They cross a ${L} mm block of ${MATS[mat].name}, whose group indices are $${sf(b.ng, 5)}$ at 1064 nm and $${sf(a.ng, 5)}$ at 532 nm. How far behind does the green pulse emerge, in ps?`,
          visual: ngPic(t`Group indices of fused silica and N-BK7; the gold lines mark the two wavelengths. Higher group index: slower pulse.`, 0.532),
          answer: dt, units: 'ps', tol: { rel: 0.01 },
          errors: [{ value: ((L / 1000) * (a.n - b.n)) / C * 1e12, feedback: t`Use the group indices: a pulse moves at $c/n_g$, not $c/n$.` }],
          hints: [t`Each pulse takes $Ln_g/c$.`, t`$\Delta t = L(n_{g,532} - n_{g,1064})/c$.`],
          teach: t`Pulses of different colours separate in glass by $L\,\Delta n_g/c$: group-velocity walk-off.`,
          explain: t`$\Delta t = (${L}\times 10^{-3}\ \text{m})(${sf(a.ng - b.ng, 4)})/c = ${sf(dt, 3)}$ ps. For femtosecond pulses that is a complete separation — a problem in frequency doubling crystals.`,
        };
      },
    }),
    mcq({
      id: 'vg-vs-vp', difficulty: 2,
      prompt: t`In clear glass the index falls with wavelength (normal dispersion). Which statement about a light pulse in the glass is right?`,
      visual: ngPic(t`Phase index (dashed) and group index (solid) of two glasses: the group index is the higher curve everywhere in the transparent range.`),
      choices: [t`The pulse moves at $c/n_g$, slower than the crests ($c/n$), which run forward through it.`, t`The pulse moves at $c/n$, the same as the crests.`, t`The pulse moves faster than the crests, at $c\,n_g$.`, t`The pulse moves at $c$: only the crests are slowed by the glass.`],
      answer: 0,
      why: { 1: t`That holds only without dispersion ($n$ independent of $\lambda$).`, 2: t`Normal dispersion gives $n_g > n$, so $v_g < v_p$.`, 3: 'Both the crests and the pulse are slowed; the pulse more so.' },
      hints: [t`$n_g = n - \lambda\,dn/d\lambda$ with $dn/d\lambda < 0$.`],
      teach: t`In normal dispersion $v_g < v_p$: crests slide forward through the pulse.`,
      explain: t`$n_g > n$ here, so $v_g = c/n_g < c/n = v_p$. Near an absorption line (anomalous dispersion) $n_g$ can drop below 1 or go negative, yet no signal outruns $c$: the pulse is reshaped and absorbed, and its front still travels at $c$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-doppler', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([2, 4, 5.5, 7]), nm = r.pick([1550, 1064]);
        const f = (v * 1000) / (nm * 1e-9) / 1e9;
        return {
          prompt: t`A satellite in low Earth orbit sends a ${nm} nm laser-comm downlink while moving toward the ground station at ${v} km/s along the line of sight. The coherent receiver mixes the signal with a local laser tuned to the transmitter’s nominal frequency. At what beat frequency does the signal appear, in GHz? (First-order Doppler shift.)`,
          visual: beatPic(1.4, t`The received light beating against the local laser: the envelope frequency is the Doppler shift. Compressed scale.`),
          answer: f, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: 2 * f, feedback: 'A one-way link shifts by v/λ; the factor 2 belongs to a radar echo.' }, { value: f / 1000, feedback: 'Units: v/λ with v in m/s and λ in m gives Hz.' }],
          hints: [t`To first order the received frequency is shifted by $\Delta\nu = \nu\,v/c$.`, t`$\nu/c = 1/\lambda$, so $\Delta\nu = v/\lambda$ with $v$ in m/s and $\lambda$ in m.`],
          teach: t`A transmitter approaching at $v$ is shifted by $v/\lambda$: gigahertz at orbital speeds, which a coherent receiver must track.`,
          explain: t`$\Delta\nu = v/\lambda = ${sf(f, 3)}$ GHz. The shift sweeps through zero and changes sign during each pass, so the receiver’s local laser has to follow it.`,
        };
      },
    }),
    num({
      id: 'cp-fibre-time', difficulty: 2, transfer: true,
      gen(r) {
        const L = r.pick([40, 100, 400, 1000]), ng = 1.468;
        const tt = ((L * 1000 * ng) / C) * 1000;
        return {
          prompt: t`A ground station is linked to a mission control centre ${L} km away by telecom fibre with group index ${ng}. How long does a timing pulse take to arrive, in ms?`,
          visual: ngPic(t`Group indices of glasses; telecom fibre at 1550 nm has $n_g \approx 1.468$, a little above pure silica because its core is doped.`, 1.55),
          answer: tt, units: 'ms', tol: { rel: 0.005 },
          errors: [{ value: ((L * 1000) / C) * 1000, feedback: t`Light in fibre travels at $c/n_g$, not $c$.` }, { value: ((L * 1000 * 1.444) / C) * 1000, feedback: 'That uses the phase index; pulses travel at the group velocity.' }],
          hints: [t`$t = Ln_g/c$.`],
          teach: t`Signals in fibre travel at $c/n_g$: about 4.9 µs per km.`,
          explain: t`$t = ${L * 1000}\times${ng}/c = ${sf(tt, 3)}$ ms — about 47% longer than a free-space or radio path.`,
        };
      },
    }),
    mcq({
      id: 'cp-beat-speed', difficulty: 3,
      prompt: t`Two waves $\cos(k_1x - \omega_1t)$ and $\cos(k_2x - \omega_2t)$ add to an envelope $\cos(\tfrac12\Delta k\,x - \tfrac12\Delta\omega\,t)$. At what speed does the envelope move?`,
      visual: beatPic(0.8, t`The sum of two waves: carrier and envelope at one instant.`),
      choices: [t`$\Delta\omega/\Delta k$, which tends to $d\omega/dk$ as the frequencies approach each other.`, t`$\bar\omega/\bar k$, the average phase velocity.`, t`$\Delta\omega\,\Delta k$.`, t`$c$, always.`],
      answer: 0,
      why: { 1: 'That is the speed of the carrier crests.', 2: 'The dimensions are wrong: a speed is a frequency over a wavenumber.', 3: 'In a dispersive medium neither the crests nor the envelope move at c.' },
      hints: ['Follow a point where the envelope has a fixed value, such as its peak.', t`Constant envelope phase: $\tfrac12\Delta k\,x - \tfrac12\Delta\omega\,t = \text{const}$; solve for $x(t)$.`],
      teach: 'The envelope of a beat moves at Δω/Δk: the group velocity in the limit.',
      explain: t`Constant envelope phase means $x = (\Delta\omega/\Delta k)\,t + \text{const}$. For a pulse with many closely spaced frequencies that becomes $d\omega/dk$.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §7.2 (beats, group velocity)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'I. H. Malitson, Interspecimen comparison of the refractive index of fused silica, J. Opt. Soc. Am. 55, 1205 (1965)', url: 'https://doi.org/10.1364/JOSA.55.001205' },
  ],
});
