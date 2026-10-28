// Waveguides (Griffiths §9.5.1–9.5.2). A hollow pipe with perfectly
// conducting walls: E∥ = 0 and B⊥ = 0 at the walls. No TEM wave can live in a
// hollow guide (E_z = B_z = 0 would make the transverse E curl-free and
// divergence-free with E∥ = 0 on one closed wall: zero). TE_mn modes,
// B_z = B₀cos(mπx/a)cos(nπy/b), k = √(ω²/c² − K²), cutoff f_mn =
// (c/2)√((m/a)² + (n/b)²); below it the fields die away (evanescent). Above
// it v_p = c/√(1 − (f_mn/f)²) > c and v_g = c√(1 − (f_mn/f)²) < c, v_p v_g =
// c²; the zigzag of two plane waves bouncing at sin θ = f_mn/f explains both.
// A real WR-90 X-band guide (0.900 × 0.400 in = 22.86 × 10.16 mm; TE₁₀ at
// 6.557 GHz, TE₂₀ 13.11, TE₀₁ 14.75; recommended band 8.2–12.4 GHz). Uses the
// new em4b-guide simulation. Transfers: the X-band feed of a deep-space
// antenna (WR-112, 8.42 GHz), a waveguide-below-cutoff honeycomb vent.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { C, PI, sf, cutoff, guide, WR90 } from './_em4b.js';

const t = String.raw;
// standard rectangular waveguides (EIA RS-261-B), inner dimensions in mm, and recommended bands in GHz
const WR = {
  'WR-28': { a: 7.112, b: 3.556, band: 'Ka band, 26.5–40 GHz' },
  'WR-62': { a: 15.80, b: 7.90, band: 'Ku band, 12.4–18 GHz' },
  'WR-90': { a: 22.86, b: 10.16, band: 'X band, 8.2–12.4 GHz' },
  'WR-112': { a: 28.50, b: 12.62, band: '7.05–10 GHz' },
  'WR-137': { a: 34.85, b: 15.80, band: 'C band, 5.85–8.2 GHz' },
};
const fc = (g, m, n) => cutoff(WR[g].a / 1e3, WR[g].b / 1e3, m, n);
const gd = (g, m, n, f) => guide(WR[g].a / 1e3, WR[g].b / 1e3, m, n, f);

// the worked example: WR-90 at 10 GHz
const EX = (() => {
  const a = WR90.a, b = WR90.b, f = 10e9, g = guide(a, b, 1, 0, f);
  return { a, b, f, g, f10: cutoff(a, b, 1, 0), f20: cutoff(a, b, 2, 0), f01: cutoff(a, b, 0, 1), tg: 1 / g.vg, t0: 1 / C };
})();

/** An em4b-guide picture without controls; `hide` puts “?” in readout rows. */
const guidePic = (params, caption) => ({ type: 'em4b-guide', params: { controls: false, phase: 70, ...params }, caption });

const r4 = (v) => +(+v).toPrecision(4);

/** The zigzag picture: two plane waves bouncing between the side walls at angle θ (deg) to the axis, with their crests. */
function zigzagPic(thDeg, caption) {
  const th = (thDeg * PI) / 180, W = 1, L = 6, run = W / Math.tan(th);
  const curves = [{ fn: '0', domain: [0, L], color: 'ink2', width: 3 }, { fn: String(W), domain: [0, L], color: 'ink2', width: 3 }];
  let x = 0, up = true;
  while (x < L - 1e-9) {
    const x2 = Math.min(L, x + run), f = (x2 - x) / run;
    curves.push({ param: [`${r4(x)} + ${r4(x2 - x)}*t`, up ? `${r4(f * W)}*t` : `${W} - ${r4(f * W)}*t`], t: [0, 1], color: 'gold', width: 2 });
    x = x2; up = !up;
  }
  const ax = Math.min(2.4, run * 0.5 + 0.3);
  return {
    type: 'graph',
    params: {
      x: [0, L], y: [-0.25, 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves,
      arrows: [{ from: [0.2, -0.13], to: [1.6, -0.13], color: 'accent', width: 2, label: 'along the guide', labelDy: 0 }],
      points: [{ x: r4(Math.min(run, L) * 0.5 + 0.12), y: 0.2, r: 0, label: 'θ', color: 'gold' }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4600.M3.5',
  title: 'Waveguides',
  minutes: 18, difficulty: 4,
  equation: t`\begin{gathered}k = \sqrt{\frac{\omega^2}{c^2} - \pi^2\left(\frac{m^2}{a^2} + \frac{n^2}{b^2}\right)}, \\ f_{mn} = \frac c2\sqrt{\left(\frac ma\right)^2 + \left(\frac nb\right)^2}\end{gathered}`,
  intro: t`A hollow metal pipe can carry a microwave a long way with little loss, but not just any wave. At a perfect conductor’s surface the tangential $\vec E$ and the normal $\vec B$ must vanish, and a wave that fits inside a rectangular pipe of width $a$ and height $b$ has to be a standing wave across it — $m$ half-wavelengths across the width, $n$ across the height — while it travels along it. Each pattern is a **mode**. In a transverse-electric (TE) mode, $\vec E$ lies across the guide and only $\vec B$ has a part along it. The pattern across the guide uses up part of the wave number: what is left for travelling, $k$, is the formula above. Below the mode’s **cutoff frequency** $f_{mn}$, $k$ is imaginary and the mode cannot travel at all. Above it, the pattern’s crests race along faster than light, while the energy (and any signal) goes slower than light — with $v_pv_g = c^2$.`,
  symbols: [
    { tex: 'k', text: t`the propagation constant along the guide, in rad/m; the guide wavelength is $\lambda_g = 2\pi/k$` },
    { tex: '\\omega', text: t`the angular frequency, $2\pi f$, in rad/s` },
    { tex: 'a,\\ b', text: t`the guide’s inner width and height, in m ($a \ge b$ by convention)` },
    { tex: 'm,\\ n', text: t`the mode numbers: half-wavelengths of the pattern across $a$ and across $b$ (whole numbers, not both zero, for TE)` },
    { tex: 'f_{mn}', text: t`the cutoff frequency of the $\text{TE}_{mn}$ mode, in Hz` },
    { tex: 'c', text: 'the speed of light in vacuum (the guide is hollow)' },
  ],
  why: t`Radar, satellite ground stations, the Deep Space Network’s receivers and particle accelerators all move their microwaves through rectangular waveguides — and the same mode-and-cutoff logic governs optical fibres and the shielding vents of every electronics enclosure.`,
  visual: {
    type: 'em4b-guide',
    title: 'Inside a WR-90 waveguide',
    lead: t`A standard X-band guide, ${nice(WR90.a * 1e3)} mm × ${nice(WR90.b * 1e3)} mm inside. Top: the cross-section, with the electric field (violet arrows) and the field along the guide, $B_z$ (shading). Middle: the guide from above, with $E$ coming out of the page (shading) and $\vec B$ in the page (teal arrows). Bottom: frequency against the propagation constant for the lowest modes, with the operating point in gold.`,
    tasks: [
      t`At 10 GHz in $\text{TE}_{10}$: $E$ is strongest in the middle and zero at the side walls, and the guide wavelength (the repeat length in the middle picture) is longer than the free-space 3.00 cm.`,
      t`Lower $f$ through the cutoff, 6.56 GHz: the pattern stops travelling and dies away along the guide, and $v_g$ falls to zero.`,
      t`Try $\text{TE}_{20}$ and $\text{TE}_{01}$ at 10 GHz: both are below their cutoffs (13.1 and 14.8 GHz). From 6.56 to 13.1 GHz this guide carries one mode only.`,
    ],
    params: { a: 22.86, b: 10.16, m: 1, n: 0, f: 10, readouts: ['fc', 'lamg', 'vp', 'vg', 'decay', 'next'] },
    caption: t`Perfectly conducting walls; one TE mode at one frequency; TM modes (from $\text{TM}_{11}$ up) are not drawn. Cross-section and top view are to scale; arrows and shading show only relative strength within each picture.`,
  },
  example: {
    prompt: t`A WR-90 guide is ${nice(WR90.a * 1e3)} mm × ${nice(WR90.b * 1e3)} mm inside. Over what band does it carry only one mode, and at 10 GHz what are the guide wavelength, the phase and group velocities, and the time a pulse takes to travel 1 m of guide?`,
    visual: guidePic({ a: 22.86, b: 10.16, m: 1, n: 0, f: 10, panels: ['disp'], readout: false }, t`Dispersion diagram for WR-90: the lowest modes, the light line (dashed) and 10 GHz in gold.`),
    steps: [
      { label: 'Cutoffs', text: t`$f_{mn} = \tfrac c2\sqrt{(m/a)^2 + (n/b)^2}$: $\text{TE}_{10}$ at $c/2a = ${nice(sf(EX.f10 / 1e9, 4))}$ GHz, $\text{TE}_{20}$ at $c/a = ${nice(sf(EX.f20 / 1e9, 4))}$ GHz, $\text{TE}_{01}$ at $c/2b = ${nice(sf(EX.f01 / 1e9, 4))}$ GHz. Between the first two only $\text{TE}_{10}$ travels. (The lowest TM mode, $\text{TM}_{11}$, is higher still.)` },
      { label: 'Why that band', text: t`The recommended band, 8.2–12.4 GHz, keeps clear of both ends: near cutoff the group velocity and the wall losses change rapidly with frequency, and near 13.1 GHz a second mode could start to carry power.` },
      { label: 'Guide wavelength', text: t`$\lambda_0 = c/f = ${nice(sf((C / EX.f) * 100, 4))}$ cm and $\lambda_g = \lambda_0/\sqrt{1 - (f_{10}/f)^2} = ${nice(sf(EX.g.lamg * 100, 4))}$ cm — longer than in free space.` },
      { label: 'Velocities', text: t`$v_p = c/\sqrt{1 - (f_{10}/f)^2} = ${nice(sf(EX.g.vp / C, 4))}c$ and $v_g = c\sqrt{1 - (f_{10}/f)^2} = ${nice(sf(EX.g.vg / C, 4))}c$; their product is $c^2$ ✓.` },
      { label: 'Delay', text: t`A pulse rides at $v_g$: 1 m takes $${nice(sf(EX.tg * 1e9, 3))}$ ns, against $${nice(sf(EX.t0 * 1e9, 3))}$ ns in free space.` },
      { label: 'Sense check', text: t`$\lambda_g/2 \approx ${nice(sf(EX.g.lamg * 50, 3))}$ cm is the spacing of the standing-wave peaks a slotted-line probe finds in a shorted X-band guide — the classic laboratory measurement of these formulas.` },
    ],
    answer: t`Single-mode from ${nice(sf(EX.f10 / 1e9, 4))} to ${nice(sf(EX.f20 / 1e9, 4))} GHz; at 10 GHz $\lambda_g \approx ${nice(sf(EX.g.lamg * 100, 3))}$ cm, $v_p \approx ${nice(sf(EX.g.vp / C, 3))}c$, $v_g \approx ${nice(sf(EX.g.vg / C, 3))}c$, and 1 m takes $${nice(sf(EX.tg * 1e9, 3))}$ ns.`,
  },
  practice: [
    num({
      id: 'cutoff', difficulty: 2,
      gen(r) {
        const g = r.pick(['WR-28', 'WR-62', 'WR-90', 'WR-137']);
        const [m, n] = r.pick([[1, 0], [2, 0], [0, 1], [1, 1]]);
        const f = fc(g, m, n);
        return {
          prompt: t`A ${g} waveguide (${WR[g].band}) is ${WR[g].a} mm × ${WR[g].b} mm inside. What is the cutoff frequency of its $\text{TE}_{${m}${n}}$ mode, in GHz?`,
          visual: guidePic({ a: WR[g].a, b: WR[g].b, m, n, f: Math.min(f / 1e9 * 1.3, 60), fmax: Math.max(25, f / 1e9 * 1.4), panels: ['section'], readout: false }, t`The $\text{TE}_{${m}${n}}$ pattern in this guide’s cross-section (to scale): $E$ arrows, $B_z$ shading.`),
          answer: f / 1e9, units: 'GHz', tol: { rel: 0.005 },
          errors: [
            { value: (C * Math.sqrt((m / WR[g].a) ** 2 + (n / WR[g].b) ** 2) * 1e3) / 1e9, feedback: t`The cutoff is $\tfrac c2\sqrt{(m/a)^2 + (n/b)^2}$: half a wavelength fits across, not a whole one.` },
            ...(m && n ? [{ value: (C / 2) * (m / WR[g].a + n / WR[g].b) * 1e3 / 1e9, feedback: t`The two parts add in quadrature, $\sqrt{(m/a)^2 + (n/b)^2}$, not directly.` }] : []),
          ],
          hints: [t`$f_{mn} = \dfrac c2\sqrt{\left(\dfrac ma\right)^2 + \left(\dfrac nb\right)^2}$, with $a$ and $b$ in metres.`, m && n ? t`Both terms count: $m = ${m}$ over $a$ and $n = ${n}$ over $b$.` : t`With ${m ? 'n = 0' : 'm = 0'} only one term survives: $f = ${m ? t`${m}c/2a` : t`${n}c/2b`}$.`],
          teach: t`Cutoff: $f_{mn} = \tfrac c2\sqrt{(m/a)^2 + (n/b)^2}$; the $\text{TE}_{10}$ cutoff $c/2a$ is where half a wavelength just fits across the width.`,
          explain: t`$f_{${m}${n}} = \tfrac c2\sqrt{(${m}/a)^2 + (${n}/b)^2} \approx ${nice(sf(f / 1e9, 4))}$ GHz.`,
        };
      },
    }),
    num({
      id: 'lamg', difficulty: 2,
      gen(r) {
        const f = r.pick([8.2, 9, 10.5, 11.2, 12.4]);
        const g = gd('WR-90', 1, 0, f * 1e9);
        return {
          prompt: t`A ${f} GHz signal travels in the $\text{TE}_{10}$ mode of WR-90 ($a = 22.86$ mm). What is the guide wavelength $\lambda_g$, in cm?`,
          visual: guidePic({ m: 1, n: 0, f, panels: ['side'], readouts: ['fc', 'lamg'], hide: ['lamg'] }, t`The guide from above: $E$ out of the page (shading) and $\vec B$ in it (arrows), over 120 mm. The pattern repeats every guide wavelength.`),
          answer: g.lamg * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: g.lam0 * 100, feedback: t`That is the free-space wavelength. Part of the wave number goes into the pattern across the guide, so $\lambda_g = \lambda_0/\sqrt{1 - (f_c/f)^2}$ is longer.` }, { value: g.lam0 * Math.sqrt(1 - (g.fc / (f * 1e9)) ** 2) * 100, feedback: t`Divide by $\sqrt{1 - (f_c/f)^2}$, don’t multiply: the guide wavelength is **longer** than $\lambda_0$.` }],
          hints: [t`$f_c = c/2a \approx 6.557$ GHz for $\text{TE}_{10}$.`, t`$\lambda_g = \dfrac{\lambda_0}{\sqrt{1 - (f_c/f)^2}}$ with $\lambda_0 = c/f$.`],
          teach: t`In a guide the wavelength along the axis is longer than in free space: $\lambda_g = \lambda_0/\sqrt{1 - (f_c/f)^2}$.`,
          explain: t`$\lambda_0 = ${nice(sf(g.lam0 * 100, 4))}$ cm and $\sqrt{1 - (f_c/f)^2} = ${nice(sf(g.lam0 / g.lamg, 4))}$, so $\lambda_g \approx ${nice(sf(g.lamg * 100, 4))}$ cm. It grows without limit as $f$ falls toward cutoff.`,
        };
      },
    }),
    mcq({
      id: 'no-tem', difficulty: 3,
      prompt: t`A coaxial cable carries a TEM wave (both $\vec E$ and $\vec B$ purely across the cable) at any frequency, down to DC. Why can a hollow rectangular guide carry no TEM wave at all?`,
      visual: guidePic({ m: 1, n: 0, f: 10, panels: ['section'], readout: false }, t`The $\text{TE}_{10}$ mode’s cross-section: its $\vec B$ has a part along the guide (shading), so it is not TEM.`),
      choices: [
        t`With $E_z = B_z = 0$, Maxwell’s equations make the transverse $\vec E$ both curl-free and divergence-free — a static-like field that must vanish inside one closed conductor, which has no second conductor to end its field lines on`,
        'A hollow guide is too small for TEM waves; a large enough one would carry them',
        'TEM waves need a dielectric to travel in, and the guide is hollow',
        t`The walls absorb any TEM wave within a skin depth`,
      ],
      answer: 0,
      why: {
        1: t`Size does not help: the argument holds for any cross-section bounded by a single conductor.`,
        2: t`TEM waves travel in vacuum perfectly well — a coax can be air-filled.`,
        3: t`Perfect walls absorb nothing; the problem is that no TEM field pattern can satisfy the boundary conditions inside one closed wall.`,
      },
      hints: [t`Set $E_z = 0$ and $B_z = 0$ in Faraday’s law and Gauss’s law: what do $\nabla\times\vec E$ and $\nabla\cdot\vec E$ become in the cross-section?`, 'A field with zero curl and zero divergence is the gradient of a potential that solves Laplace’s equation. What is that potential on a single closed conductor?'],
      teach: 'TEM needs two separate conductors; a single hollow pipe carries only TE and TM modes, each with a cutoff.',
      explain: t`TEM makes the transverse field a solution of Laplace’s equation in the cross-section, with $V$ constant over the boundary. If the boundary is one conductor, $V$ is constant everywhere and $\vec E = 0$. A coax has two conductors at different potentials, so a TEM field exists, with no cutoff.`,
    }),
    mcq({
      id: 'vp-c', difficulty: 2,
      prompt: t`In WR-90 at 7 GHz the phase velocity is about $2.9c$. Does this let a signal travel down the guide faster than light?`,
      visual: guidePic({ m: 1, n: 0, f: 7, panels: ['disp'], readout: false }, t`The dispersion diagram at 7 GHz: the dashed violet line from the origin has slope $v_p$; the curve’s slope at the gold point is $v_g$.`),
      choices: [
        t`No: crests are a pattern, not a thing; information and energy travel at the group velocity, $v_g = c^2/v_p \approx 0.35c$`,
        'Yes, but only over distances shorter than a guide wavelength',
        t`Yes: it is one of the known exceptions to relativity`,
        t`No, because the phase velocity cannot really exceed $c$; the formula fails near cutoff`,
      ],
      answer: 0,
      why: {
        1: t`No distance helps: a signal is a change in the wave, and changes travel at $v_g$.`,
        2: t`Relativity has no such exceptions; a phase velocity above $c$ carries nothing.`,
        3: t`The formula is right: the crests really do move along the axis faster than $c$, the way the crossing point of two scissor blades can.`,
      },
      hints: [t`Which speed belongs to the envelope of a pulse? (See [PHYS 3750 W6.4](#/lesson/phys3750.W6.4).)`, t`$v_pv_g = c^2$.`],
      teach: t`In a waveguide $v_p > c$ but $v_g < c$: the crests outrun light, the energy and any message do not.`,
      explain: t`$v_g = c\sqrt{1 - (f_c/f)^2} \approx ${nice(sf(gd('WR-90', 1, 0, 7e9).vg / C, 2))}c$ at 7 GHz. In the zigzag picture each plane wave moves at $c$ along a slanted path: the crests sweep along the axis faster than $c$, like the point where a breaking wave meets a sea wall, while the energy advances only at $c\cos\theta$.`,
    }),
    num({
      id: 'single-band', difficulty: 3,
      gen(r) {
        const a = r.pick([20, 25, 30]), ratio = r.pick([0.4, 0.45, 0.6, 0.75]);
        const b = +(a * ratio).toFixed(2);
        const f10 = cutoff(a / 1e3, b / 1e3, 1, 0), f20 = cutoff(a / 1e3, b / 1e3, 2, 0), f01 = cutoff(a / 1e3, b / 1e3, 0, 1);
        const top = Math.min(f20, f01);
        return {
          prompt: t`A rectangular guide is ${a} mm × ${b} mm inside. Above what frequency does a second mode start to propagate, ending its single-mode band? Give it in GHz.`,
          visual: guidePic({ a, b, m: 1, n: 0, f: (f10 / 1e9) * 1.2, fmax: 25, panels: ['section'], readout: false }, t`The guide’s cross-section (to scale) with its lowest mode, $\text{TE}_{10}$.`),
          answer: top / 1e9, units: 'GHz', tol: { rel: 0.005 },
          errors: [
            ...(Math.abs(f20 - top) > 0.01 * top ? [{ value: f20 / 1e9, feedback: t`$\text{TE}_{20}$ is not always next: when $b > a/2$, $\text{TE}_{01}$ (cutoff $c/2b$) comes first.` }] : []),
            ...(Math.abs(f01 - top) > 0.01 * top ? [{ value: f01 / 1e9, feedback: t`$\text{TE}_{01}$ is not always next: when $b < a/2$, $\text{TE}_{20}$ (cutoff $c/a$) comes first.` }] : []),
            { value: f10 / 1e9, feedback: 'That is where the first mode starts; the question asks where the second one starts.' },
          ],
          hints: [t`List the cutoffs of $\text{TE}_{10}$, $\text{TE}_{20}$ and $\text{TE}_{01}$.`, t`The candidates for second place are $c/a$ ($\text{TE}_{20}$) and $c/2b$ ($\text{TE}_{01}$): take the lower.`],
          teach: 'A guide with b < a/2 stays single-mode up to twice the TE₁₀ cutoff; a taller one loses that to TE₀₁.',
          explain: t`$f_{10} = ${nice(sf(f10 / 1e9, 4))}$, $f_{20} = ${nice(sf(f20 / 1e9, 4))}$ and $f_{01} = ${nice(sf(f01 / 1e9, 4))}$ GHz, so the second mode starts at $${nice(sf(top / 1e9, 4))}$ GHz. That is why standard guides are made with $b$ a little under $a/2$: it buys the widest single-mode band, an octave.`,
        };
      },
    }),
    mcq({
      id: 'zigzag', difficulty: 3,
      prompt: t`The $\text{TE}_{10}$ mode is two plane waves bouncing between the side walls at angle $\theta$ to the axis, each travelling at $c$. As the frequency falls toward cutoff, what happens?`,
      visual: zigzagPic(50, t`The direction of one of the two plane waves in $\text{TE}_{10}$, zigzagging between the side walls (seen from above). Schematic.`),
      choices: [
        t`$\theta$ steepens toward $90^\circ$: the waves bounce almost straight across, so the energy advances along the guide ever more slowly ($v_g = c\cos\theta \to 0$)`,
        t`$\theta$ shrinks toward $0$: the waves run along the axis and $v_g \to c$`,
        t`$\theta$ stays fixed by the guide’s shape; only the wavelength changes`,
        t`The waves stop bouncing and are absorbed by the walls`,
      ],
      answer: 0,
      why: {
        1: t`That is what happens far **above** cutoff, where the wavelength is small compared with the guide.`,
        2: t`The angle is set by the frequency: $\sin\theta = f_c/f$ — exactly half a wavelength must fit across the guide between successive bounces.`,
        3: t`Perfect walls absorb nothing; below cutoff the field is evanescent, not absorbed.`,
      },
      hints: [t`For the two waves to make a pattern with nodes at the side walls, their wave vectors’ component across the guide must be $\pi/a$.`, t`$k_0\sin\theta = \pi/a$, i.e. $\sin\theta = f_c/f$.`],
      teach: t`The zigzag picture: $\sin\theta = f_c/f$, so $v_g = c\cos\theta$ falls to zero at cutoff and $v_p = c/\cos\theta$ grows without limit.`,
      explain: t`With $\sin\theta = f_c/f$, the energy moves along the axis at $c\cos\theta = c\sqrt{1 - (f_c/f)^2} = v_g$, and the crests at $c/\cos\theta = v_p$. At cutoff $\theta = 90^\circ$: the waves only bounce back and forth across the guide, and nothing travels.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dsn', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([8.42, 8.45, 7.17]), L = r.pick([10, 25, 40]);
        const g = gd('WR-112', 1, 0, f * 1e9), extra = (L / g.vg - L / C) * 1e9;
        return {
          prompt: t`At a deep-space station, the ${f} GHz ${f < 8 ? 'uplink' : 'downlink'} signal runs through ${L} m of WR-112 waveguide (28.50 mm × 12.62 mm, $\text{TE}_{10}$) between the antenna and the equipment room. How much longer does a pulse take to cross it than it would take to cross the same distance in free space, in ns?`,
          visual: guidePic({ a: 28.5, b: 12.62, m: 1, n: 0, f, panels: ['disp'], readout: false }, t`The dispersion diagram of WR-112 with the operating frequency (gold).`),
          answer: extra, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: (L / g.vp - L / C) * 1e9, feedback: 'A pulse travels at the group velocity, not the phase velocity (which gives a negative answer).' }, { value: (L / g.vg) * 1e9, feedback: 'That is the whole travel time; subtract the free-space time L/c.' }],
          hints: [t`$f_c = c/2a$ for $\text{TE}_{10}$; $v_g = c\sqrt{1 - (f_c/f)^2}$.`, t`Extra delay $= L/v_g - L/c$.`],
          teach: t`Pulses cross a guide at $v_g < c$, a delay that ranging systems must calibrate out.`,
          explain: t`$f_c \approx ${nice(sf(g.fc / 1e9, 4))}$ GHz, $v_g \approx ${nice(sf(g.vg / C, 4))}c$, so the extra delay is $L/v_g - L/c \approx ${nice(sf(extra, 3))}$ ns — as long as light takes to cross another ${nice(sf(extra * 0.2998, 2))} m. Spacecraft ranging calibrates such station delays out by measuring them.`,
        };
      },
    }),
    num({
      id: 'cp-vent', difficulty: 3, transfer: true,
      gen(r) {
        const w = r.pick([3, 5, 6]), L = r.pick([15, 20, 25]), f = r.pick([0.1, 1, 2.4]);
        const g = guide(w / 1e3, w / 1e3, 1, 0, f * 1e9), A = 20 * Math.log10(Math.exp(g.kappa * L * 1e-3));
        return {
          prompt: t`A shielded instrument box breathes through a honeycomb vent whose cells are square tubes ${w} mm across and ${L} mm long. Each cell is a waveguide far below cutoff. How many decibels does a ${f >= 1 ? `${f} GHz` : `${f * 1000} MHz`} field lose in passing through one cell, in its lowest ($\text{TE}_{10}$) mode?`,
          visual: guidePic({ a: w, b: w, m: 1, n: 0, f, fmax: Math.max(f * 1.2, 2.5), len: L, panels: ['side'], readout: false }, t`A field entering one cell below cutoff, seen from above: it does not travel, it dies away along the tube. To scale.`),
          answer: A, units: 'dB', tol: { rel: 0.01 },
          errors: [{ value: 10 * Math.log10(Math.exp(g.kappa * L * 1e-3)), feedback: t`The field falls as $e^{-\kappa z}$; for a field ratio use $20\log_{10}$.` }],
          hints: [t`Below cutoff $\kappa = \dfrac{2\pi}{c}\sqrt{f_c^2 - f^2}$, with $f_c = c/2w$.`, t`The loss is $20\log_{10}e^{\kappa L} = 8.69\,\kappa L$ dB; far below cutoff $\kappa \approx \pi/w$.`],
          teach: t`Below cutoff a tube is an attenuator: about 27 dB for each width of length, whatever the frequency, so long as $f \ll f_c$.`,
          explain: t`$f_c = c/2w \approx ${nice(sf(g.fc / 1e9, 3))}$ GHz, far above ${f >= 1 ? `${f} GHz` : `${f * 1000} MHz`}, so $\kappa \approx ${nice(sf(g.kappa, 3))}$ m⁻¹ (close to $\pi/w$) and the loss is $8.69\kappa L \approx ${nice(sf(A, 3))}$ dB. Air flows freely; microwaves do not — the same reason a microwave oven’s door mesh keeps 2.45 GHz in.`,
        };
      },
    }),
    mcq({
      id: 'cp-wider', difficulty: 2,
      prompt: t`A designer needs a hollow rectangular guide for a lower frequency band than WR-90 serves. Which change lowers the $\text{TE}_{10}$ cutoff?`,
      visual: guidePic({ m: 1, n: 0, f: 10, panels: ['section'], readout: false }, t`WR-90’s cross-section with the $\text{TE}_{10}$ field: half a wavelength across the width.`),
      choices: [
        t`Making the guide wider: $f_{10} = c/2a$ depends on the width alone`,
        t`Making the guide taller: $f_{10}$ depends on the height`,
        'Making the walls thicker',
        'Making the guide longer',
      ],
      answer: 0,
      why: {
        1: t`$\text{TE}_{10}$ has no variation across the height ($n = 0$), so $b$ does not enter its cutoff — though it does set where $\text{TE}_{01}$ starts.`,
        2: t`The fields live inside; with perfect walls their thickness is irrelevant (real walls need only be several skin depths thick).`,
        3: 'Length sets losses and delay, not which frequencies can travel.',
      },
      hints: [t`For $\text{TE}_{10}$, half a free-space wavelength must fit across the width.`, t`$f_{10} = c/2a$.`],
      teach: t`Lower bands need wider guides: $f_{10} = c/2a$.`,
      explain: t`$f_{10} = c/2a$, so a wider guide passes lower frequencies: WR-137 (34.85 mm) cuts off at ${nice(sf(fc('WR-137', 1, 0) / 1e9, 3))} GHz, WR-90 at ${nice(sf(fc('WR-90', 1, 0) / 1e9, 3))} GHz. At L band (1–2 GHz) guides are tens of centimetres wide, which is why coaxial cable takes over at low frequencies.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §9.5', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Pozar, Microwave Engineering (4th ed.), §3.3 and Appendix I (standard rectangular waveguides)', url: 'https://www.wiley.com/en-us/Microwave+Engineering%2C+4th+Edition-p-9780470631553' },
  ],
});
