// Gratings and resolving power (Hecht §10.2.8). PHYS 2220 O4.2 did
// d sin θ = mλ at normal incidence, orders, white-light spectra and R = mN
// (sodium, deuterium, a double star). Here the grating as an instrument: the
// grating equation at oblique incidence d(sin θ_m − sin θ_i) = mλ (angles on
// the same side of the normal positive); angular dispersion m/(d cos θ_m) and
// linear dispersion in a camera's focal plane; overlapping orders and the free
// spectral range λ/m; resolving power mN = W(sin θ_m − sin θ_i)/λ ≤ 2W/λ (only
// the illuminated width W matters); blazing (Littrow: mλ_B = 2d sin θ_B) and
// echelles (coarse ruling, steep blaze, orders near 100). Explore: two close
// wavelengths through N lines, just resolved at Δλ = λ/(mN). Transfers: the
// velocity width c/R of an echelle spectrograph's resolution element, the
// lines needed to split re-entry plasma's oxygen 777 nm lines.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, DEG, sf } from './_op.js';
import { seg, word, pic } from './_op3.js';

const t = String.raw;

// the worked example: an R2 echelle (tan θ_B = 2), 31.6 lines/mm, 100 mm wide, in Littrow at 550 nm
const EX = { lpmm: 31.6, thB: Math.atan(2), W: 0.1, lam: 550e-9 };
EX.d = 1e-3 / EX.lpmm;
EX.mExact = (2 * EX.d * Math.sin(EX.thB)) / EX.lam;
EX.m = Math.round(EX.mExact);
EX.N = EX.lpmm * EX.W * 1e3;
EX.R = EX.m * EX.N;
EX.Rmax = (2 * EX.W * Math.sin(EX.thB)) / EX.lam;
EX.fsr = (EX.lam / EX.m) * 1e9;

/** A transmission grating with an incident ray and a fan of orders (directions schematic). */
function gratingPic(caption, thi = 20, labels = [[-1, -30], [0, 20], [1, 48]]) {
  const rays = labels.map(([m, a]) => ({ from: [0, 0], to: [sf(4 * Math.cos(a * DEG), 4), sf(4 * Math.sin(a * DEG), 4)], color: m === 0 ? 'ink3' : 'gold', width: 2, label: m === 0 ? 'm = 0' : `m = ${m > 0 ? '+' : '−'}${Math.abs(m)}` }));
  return {
    type: 'graph', caption,
    params: pic([-5, 5.4], [-3.2, 3.4], {
      curves: [seg([0, -3], [0, 3], 'ink2', { width: 3, dash: [2, 3] }), seg([-4.5, 0], [4.5, 0], 'ink3', { width: 1, dash: [5, 5] })],
      arrows: [{ from: [sf(-4 * Math.cos(thi * DEG), 4), sf(-4 * Math.sin(thi * DEG), 4)], to: [0, 0], color: 'accent', width: 2.4, label: 'incident' }, ...rays],
      points: [word(0.2, -2.9, 'grating', 'ink3', { labelAlign: 'left' }), word(-4.6, 0.25, 'normal', 'ink3', { labelAlign: 'left' })],
    }),
  };
}

/** A reflection grating's grooves, blazed: sawtooth facets tilted by θ_B. */
function blazePic(caption, thB = 26) {
  const curves = [], h = 0.8, w = h / Math.tan(thB * DEG);
  for (let k = 0; k < 5; k++) {
    const x0 = -4 + k * w * 1.0;
    curves.push(seg([x0, 0], [x0 + w, h], 'gold', { width: 2.4 }), seg([x0 + w, h], [x0 + w, 0], 'gold', { width: 2.4 }));
  }
  const x1 = -4 + 2 * w, mid = [x1 + w / 2, h / 2], n = [-Math.sin(thB * DEG), Math.cos(thB * DEG)];
  return {
    type: 'graph', caption,
    params: pic([-4.6, 5], [-0.6, 3.4], {
      curves: [...curves, seg([-4.3, 0], [4.6, 0], 'ink3', { width: 1 }), seg([4.0, 0], [4.0, 3.0], 'ink3', { dash: [4, 4] }), seg(mid, [mid[0] + 2.6 * n[0], mid[1] + 2.6 * n[1]], 'accent', { dash: [4, 4] })],
      points: [word(4.0, 3.2, 'grating normal', 'ink3'), word(mid[0] + 2.9 * n[0], mid[1] + 2.9 * n[1], 'facet normal', 'accent'), word(1.6, 2.3, 'facets tilted by θ (blaze)', 'ink2')],
    }),
  };
}

export default lesson({
  id: 'phys4650.O8.2',
  title: 'Gratings and resolving power',
  minutes: 17, difficulty: 3,
  intro: t`A grating is $N$ lines a distance $d$ apart. Light arriving at angle $\theta_i$ leaves in the directions where neighbouring lines’ contributions differ by whole wavelengths — the **grating equation**

$$d\,(\sin\theta_m - \sin\theta_i) = m\lambda$$

with both angles measured from the normal, positive on the same side. Each order $m$ spreads the colours by the **angular dispersion** $d\theta/d\lambda = m/(d\cos\theta_m)$, and the peaks are so sharp — width $\sim\lambda/(Nd\cos\theta_m)$ — that two wavelengths separate once $\lambda/\Delta\lambda$ reaches the **resolving power** $\mathcal R = mN$. Written out, $mN = W(\sin\theta_m - \sin\theta_i)/\lambda$ for an illuminated width $W = Nd$: the size of the grating, not its line density, sets the limit.`,
  symbols: [
    { tex: 'd', text: 'the line spacing (1 mm divided by the lines per millimetre)' },
    { tex: '\\theta_i', text: 'the angle of the incoming light, from the grating’s normal' },
    { tex: '\\theta_m', text: 'the angle of order $m$, from the normal' },
    { tex: 'm', text: 'the order: an integer, 0 for the undeviated beam' },
    { tex: '\\lambda', text: 'the wavelength' },
  ],
  why: t`Every astronomical spectrograph — the ones that weigh exoplanets by their stars’ wobble, and the ones that read a rocket plume’s chemistry — is a grating used at the edge of this equation.`,
  visual: {
    type: 'graph',
    title: 'When are two lines resolved?',
    lead: t`Two wavelengths, $\lambda$ and $\lambda + \Delta\lambda$, through a grating of $N$ lines, near order $m$. The horizontal axis is $d\sin\theta/\lambda - m$: how far, in orders, you look from the peak of $\lambda$.`,
    tasks: [
      t`Set $\Delta\lambda/\lambda$ to $1/(mN)$ — read $mN$ from the readout. The second peak sits on the first one’s zero: Rayleigh’s criterion, a dip of about 19% between them.`,
      t`Double $N$: each peak narrows to half, and the pair separates cleanly.`,
      t`Raise the order $m$ with $N$ fixed: the peaks stay the same width but move apart — higher orders disperse more.`,
    ],
    params: {
      x: [-0.06, 0.06], y: [0, 2.2], aspect: 'wide', xlabel: 'offset from the order, d sin θ / λ − m', ylabel: 'irradiance', xticks: 6, yticks: 0,
      sliders: [
        { key: 'N', label: 'Lines illuminated $N$', min: 20, max: 400, step: 10, value: 40, explain: 'How many lines the light covers.' },
        { key: 'm', label: 'Order $m$', min: 1, max: 4, step: 1, value: 1, explain: 'Which diffraction order you look at.' },
        { key: 'e', label: 'Separation $\\Delta\\lambda/\\lambda$', min: 0.0005, max: 0.05, value: 0.01, logScale: true, explain: 'The fractional difference between the two wavelengths.' },
      ],
      curves: [
        { fn: '(sin(N*pi*x + 0.000000001)/(N*sin(pi*x + 0.000000001)))^2', color: 'accent', width: 1.6, samples: 4000 },
        { fn: '(sin(N*pi*((m + x)/(1 + e) - m) + 0.000000001)/(N*sin(pi*((m + x)/(1 + e) - m) + 0.000000001)))^2', color: 'violet', width: 1.6, samples: 4000 },
        { fn: '(sin(N*pi*x + 0.000000001)/(N*sin(pi*x + 0.000000001)))^2 + (sin(N*pi*((m + x)/(1 + e) - m) + 0.000000001)/(N*sin(pi*((m + x)/(1 + e) - m) + 0.000000001)))^2', color: 'gold', width: 2.4, samples: 4000 },
      ],
      readouts: [
        { label: 'resolving power $mN$', expr: 'm*N', digits: 4 },
        { label: '$\\lambda/\\Delta\\lambda$', expr: '1/e', digits: 3 },
      ],
    },
    caption: t`Ideal grating with very narrow lines (no single-line envelope), two equally bright incoherent lines; gold is what a detector sees. Only a small window round one order is shown.`,
  },
  example: {
    prompt: t`**An echelle.** A coarse grating, $${EX.lpmm}$ lines per millimetre, has its facets tilted so that $\tan\theta_B = 2$ ($\theta_B = ${sf(EX.thB / DEG, 3)}^\circ$), and is used in Littrow — light returns along its own path, $\theta_m = -\theta_i = \theta_B$. Which order carries $550$ nm, what resolving power does a $${EX.W * 1000}$ mm wide grating give, and what is its free spectral range?`,
    visual: blazePic(t`A blazed reflection grating in cross-section: each facet is tilted so that its mirror reflection falls in the chosen order. Not to scale.`, sf(EX.thB / DEG, 3)),
    steps: [
      { label: 'Line spacing', text: t`$d = 1\ \text{mm}/${EX.lpmm} = ${sf(EX.d * 1e6, 4)}\ \mu$m — nearly sixty wavelengths.` },
      { label: 'Order', text: t`Littrow turns the grating equation into $m\lambda = 2d\sin\theta_B$, so $m = 2(${sf(EX.d * 1e6, 4)}\ \mu\text{m})(${sf(Math.sin(EX.thB), 4)})/(0.550\ \mu\text{m}) = ${sf(EX.mExact, 4)}$: order $${EX.m}$ sits right on the blaze.` },
      { label: 'Resolving power', text: t`$N = ${EX.lpmm}\times ${EX.W * 1000} = ${sf(EX.N, 4)}$ lines, so $\mathcal R = mN = ${sf(EX.R, 3)}$. Check: $2W\sin\theta_B/\lambda = ${sf(EX.Rmax, 3)}$ — a few thousand coarse lines in a high order do what a fine ruling cannot.` },
      { label: 'Free spectral range', text: t`Orders $m$ and $m + 1$ overlap when $\Delta\lambda = \lambda/m = ${sf(EX.fsr, 2)}$ nm. So a second, low-dispersion element (a prism or a coarse grating) is set across it to stack the orders one above another on the detector: a cross-dispersed echelle.` },
      { label: 'Sense check', text: t`$\lambda/\mathcal R = ${sf((EX.lam / EX.R) * 1e12, 2)}$ pm, a velocity of $c/\mathcal R \approx ${sf(C / EX.R / 1000, 2)}$ km/s: fine enough to see the motions of gas in stellar atmospheres.` },
    ],
    answer: t`Order $${EX.m}$; $\mathcal R \approx ${sf(EX.R, 3)}$; free spectral range $\approx ${sf(EX.fsr, 2)}$ nm, so the orders must be separated by a cross-disperser.`,
  },
  practice: [
    num({
      id: 'oblique', difficulty: 2,
      gen(r) {
        const lpmm = r.pick([300, 600, 1200]), thi = r.pick([10, 20, 30]), lam = r.pick([450, 532, 633]);
        const d = 1e6 / lpmm, s = Math.sin(thi * DEG) + lam / d;
        const ok = s < 1 ? s : Math.sin(thi * DEG) - lam / d;
        const th = Math.asin(ok) / DEG, m = s < 1 ? 1 : -1;
        return {
          prompt: t`A transmission grating has $${lpmm}$ lines per millimetre. Light of $${lam}$ nm arrives at $\theta_i = ${thi}^\circ$ from the normal. At what angle does the order $m = ${m > 0 ? '+1' : '-1'}$ leave (positive on the same side as $\theta_i$)?`,
          visual: gratingPic(t`A grating lit at an angle; the order directions are schematic.`, thi),
          answer: th, units: 'deg', tol: { abs: 0.1 },
          errors: [{ value: (m * Math.asin(lam / d)) / DEG, feedback: t`That is the normal-incidence answer. With light arriving at $\theta_i$, $\sin\theta_m = \sin\theta_i + m\lambda/d$.` }],
          hints: [t`$\sin\theta_m = \sin\theta_i + m\lambda/d$ with $d = 1\ \text{mm}/${lpmm} = ${sf(d, 4)}$ nm.`],
          teach: t`At oblique incidence the grating equation keeps the incoming angle: $d(\sin\theta_m - \sin\theta_i) = m\lambda$.`,
          explain: t`$\sin\theta_m = \sin ${thi}^\circ ${m > 0 ? '+' : '-'} ${lam}/${sf(d, 4)} = ${sf(ok, 4)}$, so $\theta_m = ${sf(th, 3)}^\circ$. The zeroth order goes straight through at $${thi}^\circ$.`,
        };
      },
    }),
    num({
      id: 'linear-disp', difficulty: 2,
      gen(r) {
        const lpmm = r.pick([300, 600, 1200]), f = r.pick([200, 300, 500]), dl = r.pick([0.6, 1, 2]);
        const lam = 589, d = 1e6 / lpmm, th = Math.asin(lam / d);
        const sep = (f * dl) / (d * Math.cos(th));       // mm, with d in nm and dl in nm
        return {
          prompt: t`A spectrometer uses a ${lpmm} lines/mm grating in first order at normal incidence, near $589$ nm, and a camera lens of focal length $${f}$ mm. How far apart on the detector are two lines $${dl}$ nm apart, in millimetres?`,
          visual: gratingPic(t`A grating at normal incidence; the camera lens (not drawn) focuses each direction to a point on the detector. Directions schematic.`, 0, [[-1, -40], [0, 0], [1, 40]]),
          answer: sep, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (f * dl) / d, feedback: t`Include the $\cos\theta_m$: $d\theta/d\lambda = m/(d\cos\theta_m)$, larger at steep angles.` }],
          hints: [t`Differentiate $d\sin\theta = \lambda$: $d\theta/d\lambda = 1/(d\cos\theta)$.`, t`On the detector, $\Delta x = f\,\Delta\theta$, with $\theta = \arcsin(\lambda/d)$.`],
          teach: t`Linear dispersion on a detector is $f\,m/(d\cos\theta_m)$: finer rulings, higher orders and longer cameras spread the spectrum more.`,
          explain: t`$\theta_1 = \arcsin(589/${sf(d, 4)}) = ${sf(th / DEG, 3)}^\circ$, so $\Delta x = \dfrac{f\,\Delta\lambda}{d\cos\theta} = \dfrac{(${f})(${dl})}{(${sf(d, 4)})\cos ${sf(th / DEG, 3)}^\circ}$ mm $= ${sf(sep, 3)}$ mm.`,
        };
      },
    }),
    num({
      id: 'overlap', difficulty: 1,
      gen(r) {
        const m = r.pick([2, 3, 4]), lam = r.pick([600, 660, 720]);
        const l2 = (m * lam) / (m + 1);
        return {
          prompt: t`In a grating spectrum, $${lam}$ nm light in order ${m} lands at the same angle as what wavelength in order ${m + 1}?`,
          visual: gratingPic(t`A grating’s orders (directions schematic). Each order holds a whole spectrum, and high orders overlap.`, 0, [[-1, -30], [0, 0], [1, 30], [m, 62]]),
          answer: l2, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: ((m + 1) * lam) / m, feedback: 'The higher order bends shorter wavelengths to the same angle: mλ is what is shared.' }],
          hints: [t`The same angle means the same $m\lambda$.`],
          teach: t`Orders overlap where $m\lambda$ agrees: order $m$ is clean only over a free spectral range of about $\lambda/m$.`,
          explain: t`$${m}\times ${lam} = ${m + 1}\lambda'$ gives $\lambda' = ${sf(l2, 4)}$ nm. A filter or a cross-disperser keeps them apart.`,
        };
      },
    }),
    num({
      id: 'blaze', difficulty: 3,
      gen(r) {
        const lpmm = r.pick([600, 1200, 1800]), thB = r.pick([8.6, 17.5, 26.7]);
        const lB = 2 * (1e6 / lpmm) * Math.sin(thB * DEG);
        return {
          prompt: t`A reflection grating with ${lpmm} lines per millimetre has facets blazed at $\theta_B = ${thB}^\circ$. Used in Littrow (light returning along its own path), at what first-order wavelength is it most efficient?`,
          visual: blazePic(t`A blazed grating’s facets (not to scale). In Littrow the light meets each facet head on.`, thB),
          answer: lB, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: lB / 2, feedback: t`In Littrow, $\theta_m = -\theta_i$, so the grating equation gives $2d\sin\theta_B = m\lambda$ — the light’s path difference is counted there and back.` }],
          hints: [t`Most efficient when the diffracted order coincides with the facets’ mirror reflection: in Littrow, the light hits each facet along its normal, so $\theta = \theta_B$.`, t`$\lambda_B = 2d\sin\theta_B$ for $m = 1$.`],
          teach: t`A blazed grating puts its light into one order: in Littrow, $m\lambda_B = 2d\sin\theta_B$.`,
          explain: t`$\lambda_B = 2(${sf(1e6 / lpmm, 4)}\ \text{nm})\sin ${thB}^\circ = ${sf(lB, 3)}$ nm. Unblazed, a grating wastes most of its light in the zeroth order, which has no dispersion at all.`,
        };
      },
    }),
    num({
      id: 'rmax', difficulty: 2,
      gen(r) {
        const W = r.pick([25, 50, 100, 200]), lam = r.pick([500, 1064, 1550]);
        const R = (2 * W * 1e-3) / (lam * 1e-9);
        return {
          prompt: t`What is the largest resolving power any grating $${W}$ mm wide (fully illuminated) could give at $${lam}$ nm, whatever its line density or order?`,
          visual: gratingPic(t`The grating equation caps $|\sin\theta_m - \sin\theta_i|$ at 2.`, 70, [[0, 70], [3, -70]]),
          answer: R, tol: { rel: 0.01 },
          errors: [{ value: R / 2, feedback: t`$\sin\theta_m - \sin\theta_i$ can approach 2, with light arriving and leaving at grazing angles on opposite sides.` }],
          hints: [t`$mN = Nd(\sin\theta_m - \sin\theta_i)/\lambda = W(\sin\theta_m - \sin\theta_i)/\lambda$.`, t`The bracket is at most 2.`],
          teach: t`A grating’s resolving power cannot exceed $2W/\lambda$: the illuminated width sets it.`,
          explain: t`$\mathcal R_{\max} = 2W/\lambda = 2(${W}\times10^{-3})/(${lam}\times10^{-9}) = ${tex(R)}$: the number of wavelengths in the round-trip path difference across the grating. Real instruments reach a good fraction of it.`,
        };
      },
    }),
    mcq({
      id: 'what-sets-R', difficulty: 2,
      prompt: t`A spectrograph needs more resolving power, used at the same angles. Which change helps?`,
      visual: gratingPic(t`A grating lit at an angle; order directions schematic.`, 20),
      choices: ['Illuminate a wider grating.', 'Use a grating with twice the lines per millimetre, of the same width, at the same angles.', 'Make each line narrower.', 'Use a brighter light source.'],
      answer: 0,
      why: { 1: 'At fixed angles, doubling the line density halves the order m that lands there: mN, and W(sin θₘ − sin θᵢ)/λ, are unchanged.', 2: 'Line width shapes the envelope — how light is shared among orders — not how sharp each order is.', 3: 'Resolving power is about the width of the peaks, not their height.' },
      hints: ['Write mN in terms of the grating’s width and the angles.', 'mN = W(sin θₘ − sin θᵢ)/λ.'],
      teach: 'At given angles, only the illuminated width of a grating sets its resolving power.',
      explain: t`$mN = W(\sin\theta_m - \sin\theta_i)/\lambda$: the extreme path difference across the grating, counted in wavelengths. Finer rulings or higher orders only pay off when they change the angles — which is why echelles work steeply.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-velocity', difficulty: 2, transfer: true,
      gen(r) {
        const R = r.pick([50000, 80000, 115000, 140000]);
        const v = C / R / 1000;
        return {
          prompt: t`An echelle spectrograph that hunts exoplanets has resolving power $\mathcal R = ${R}$. What Doppler velocity corresponds to one resolution element $\lambda/\mathcal R$, in km/s?`,
          visual: blazePic(t`A blazed echelle’s facets (schematic).`, 63.4),
          answer: v, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: v * 1000, feedback: 'Check the units: c/R comes out in m/s first.' }],
          hints: [t`A Doppler shift $\Delta\lambda/\lambda = v/c$.`, t`Set $\Delta\lambda/\lambda = 1/\mathcal R$: $v = c/\mathcal R$.`],
          teach: t`A spectrograph’s resolution element is a velocity $c/\mathcal R$; planet hunters measure shifts a thousand times smaller by centroiding thousands of lines.`,
          explain: t`$v = c/\mathcal R = ${sf(v, 3)}$ km/s. A Jupiter-like planet moves its star by about $10$ m/s: a few thousandths of a resolution element, measured by fitting the centres of thousands of lines against a stable wavelength reference.`,
        };
      },
    }),
    num({
      id: 'cp-reentry', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([1, 2, 3]);
        const l1 = 777.417, l2 = 777.539, N = Math.ceil((l1 + l2) / 2 / (l2 - l1) / m);
        return {
          prompt: t`Atomic oxygen in the hot shock layer of a re-entering capsule glows at $777.417$ and $777.539$ nm (two components of its 777 nm triplet). An airborne spectrograph uses its grating in order ${m}. At least how many lines must the beam illuminate to resolve the pair?`,
          visual: gratingPic(t`A grating’s orders (directions schematic).`, 0, [[-1, -30], [0, 0], [1, 30], [2, 60]]),
          answer: N, tol: { rel: 0.01 },
          errors: [{ value: Math.ceil((l1 + l2) / 2 / (l2 - l1)), feedback: `In order ${m} each line counts ${m} times: N = λ/(mΔλ).` }].filter((e) => Math.abs(e.value - N) > 0.01 * N),
          hints: [t`Resolving power needed: $\lambda/\Delta\lambda$.`, t`$N = \lambda/(m\,\Delta\lambda)$.`],
          teach: t`The lines a grating needs follow from $mN = \lambda/\Delta\lambda$.`,
          explain: t`$\lambda/\Delta\lambda = 777.48/0.122 = ${sf((l1 + l2) / 2 / (l2 - l1), 4)}$, so $N \geq ${N}$ in order ${m}. Real campaigns also need a wide enough beam and a slit narrow enough to reach that limit.`,
        };
      },
    }),
    num({
      id: 'cp-echelle', difficulty: 3,
      gen(r) {
        const W = r.pick([100, 200, 300]), lam = r.pick([400, 600, 800]);
        const R = (2 * W * 1e-3 * Math.sin(Math.atan(4))) / (lam * 1e-9);
        return {
          prompt: t`An R4 echelle ($\tan\theta_B = 4$, so $\theta_B = ${sf(Math.atan(4) / DEG, 3)}^\circ$) $${W}$ mm long is used in Littrow at $${lam}$ nm. What resolving power does it give?`,
          visual: blazePic(t`An echelle’s steep facets (schematic).`, sf(Math.atan(4) / DEG, 3)),
          answer: R, tol: { rel: 0.01 },
          errors: [{ value: R / 2, feedback: t`In Littrow, $mN = 2W\sin\theta_B/\lambda$: the path difference across the grating is counted both ways.` }],
          hints: [t`In Littrow, $m\lambda = 2d\sin\theta_B$, so $mN = 2Nd\sin\theta_B/\lambda$.`, t`$Nd = W$.`],
          teach: t`An echelle in Littrow gives $\mathcal R = 2W\sin\theta_B/\lambda$, close to the $2W/\lambda$ limit when the blaze is steep.`,
          explain: t`$\mathcal R = 2(${W}\times10^{-3})\sin ${sf(Math.atan(4) / DEG, 3)}^\circ/(${lam}\times10^{-9}) = ${tex(R)}$ — independent of how many lines per millimetre it has.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §10.2.8 (the diffraction grating: grating equation, dispersion, resolving power, blazing, echelles)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'C. Palmer and E. Loewen, Diffraction Grating Handbook, 8th ed. (MKS Newport, 2020)', url: 'https://www.newport.com/n/diffraction-grating-handbook' },
    { label: 'NIST Atomic Spectra Database (O I lines near 777 nm)', url: 'https://physics.nist.gov/PhysRefData/ASD/lines_form.html' },
  ],
});
