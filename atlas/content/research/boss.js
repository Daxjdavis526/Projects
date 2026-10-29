// The Research in Physics boss, "The Mini-Thesis": one research project in
// miniature, from the question to the abstract, on one of the three projects
// the guided mini-papers practised. GW150914's chirp mass from a synthetic
// chirp (research.P.1): the published detector-frame 𝓜 = 30.4 +2.1/−1.9 M☉,
// source frame 28.0 +2.0/−1.7 M☉, both medians with 90% credible intervals
// (Abbott et al. 2016, PRL 116, 241102, Table I); the discovery letter's
// ≃ 30 M☉, masses 36 and 29 M☉, remnant 62 M☉. Kepler-10b's radius from a
// synthetic transit (research.P.3): R_p/R★ = 0.01261, R_p = 1.47 +0.03/−0.02
// R⊕, R★ = 1.065 ± 0.009 R☉ (Dumusque et al. 2014), P = 0.837495 d (Batalha
// et al. 2011). Mercury's perihelion advance by integration (research.P.4):
// 42.98″ per century (Will 2014), the formula 6πGM/(c²a(1−e²)) per orbit
// (42.9807″ per century here), P.4's exaggerated runs and null tests, and
// Clemence's 1947 tally (≈5600 observed, ≈5025 equinoxes, ≈532 planets).
// Four rounds: scope it (the question, the right published number, the size
// of the effect), reproduce it (the number from synthetic readings, a fit in
// Python, a check that could fail), judge it (the budget, the tension in σ,
// what agreement establishes), present it (the key figure, the abstract
// sentence, what makes it reproducible).
//
// One project per attempt. The boss page instantiates the item at position k
// of attempt a with variant 500 + 37a + k; projectOf() inverts that, so every
// item of one attempt follows the same project (attempt 1: GW150914, 2:
// Kepler-10b, 3: Mercury, 4: GW150914 …). Any other variant (a later review,
// the test's first seeds) lets the item's own generator pick a project — so
// every prompt names its project and is complete on its own. Every number a
// learner reads comes from a generator; the case functions are exported so a
// script can recompute every key another way.
import { boss, mcq, multi, num, code } from '../../src/core/content.js';
import { makeRng } from '../../src/core/rng.js';
import { errorBars, dots, timeBars } from './_rs.js';
import { r6, sci, notebookOrder } from './_rs2.js';

const t = String.raw;

// ── published values and constants ──────────────────────────────────────────
export const TSUN = 4.925491e-6;                          // G M☉ / c³, s
export const MC_PUB = 30.4, MC_UP = 2.1, MC_LO = 1.9;      // detector-frame chirp mass, 90% credible
export const Z90 = 1.6449;                                // a central 90% interval spans ±1.645σ for a Gaussian
export const K10 = 0.01261, RSTAR = 1.065, SRSTAR = 0.009; // Kepler-10b's radius ratio; the star's radius (R☉)
export const RP_PUB = 1.47, RP_UP = 0.03, RP_LO = 0.02;    // R⊕ (Dumusque et al. 2014)
export const P10 = 0.837495, DUR_H = 1.8, CAD_H = 0.5;     // period (d), transit duration and cadence (h)
export const REARTH = 109.08;                             // R☉ / R⊕, IAU 2015 nominal (equatorial)
const GMSUN = 1.32712440018e20, CLIGHT = 299792458, AU = 1.495978707e11;
export const ARC = 648000 / Math.PI;                      // arcseconds per radian
export const A_M = 0.387098, E_M = 0.20563, P_M = 87.969;  // Mercury: AU, eccentricity, days
/** The leading-order relativistic advance per orbit, rad, with the term exaggerated by λ. */
export const perOrbit = (lam = 1) => (lam * 6 * Math.PI * GMSUN) / (CLIGHT ** 2 * A_M * AU * (1 - E_M ** 2));
export const FORMULA = +((perOrbit() * ARC * 36525) / P_M).toFixed(4);    // ″ per century: 42.9807
export const PER = [[100, 42.9822], [300, 42.9852], [1000, 42.9957], [3000, 43.0256]];   // advance ÷ λ from research.P.4's runs
export const NULLT = [[1e-10, 0.0744], [1e-12, 0.0008]];                                  // P.4's Newton-only drift, ″ per century

/** Leading-order chirp: time to coalescence from frequency f, GW cycles left, and the frequency τ before coalescence. */
export const tau = (Mc, f) => (5 / 256) * (Math.PI * f) ** (-8 / 3) * (Mc * TSUN) ** (-5 / 3);
export const cycles = (Mc, f) => (f * Mc * TSUN) ** (-5 / 3) / (32 * Math.PI ** (8 / 3));
export const fOf = (Mc, tc) => (5 / (256 * tc)) ** 0.375 / (Math.PI * (Mc * TSUN) ** 0.625);
export const fdot = (Mc, f) => (96 / 5) * Math.PI ** (8 / 3) * (Mc * TSUN) ** (5 / 3) * f ** (11 / 3);

// ── one project per attempt ─────────────────────────────────────────────────
export const PROJECTS = ['gw', 'transit', 'mercury'];
const SLOT = {};                                          // item id → its position in the battle (filled in below)
/** The project of a variant: the attempt's own on the boss page, else the generator's pick. */
export function projectOf(r, id, v) {
  const a = (v - 500 - SLOT[id]) / 37;
  return Number.isInteger(a) && a >= 0 ? PROJECTS[(a + 2) % 3] : r.pick(PROJECTS);
}
const TITLE = {
  gw: 'GW150914’s chirp mass',
  transit: 'Kepler-10b’s radius',
  mercury: 'Mercury’s perihelion advance',
};
const LINK = {
  gw: '[GW150914: find the chirp](#/lesson/research.P.1)',
  transit: '[Kepler-10b: a planet from a light curve](#/lesson/research.P.3)',
  mercury: '[Mercury’s perihelion by numerical integration](#/lesson/research.P.4)',
};

/** Keep only the slips whose values are finite and clearly apart from the key (and from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v), 1e-12);
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  return kept;
}
/** Standard normal draws from a seeded generator (pictures only). */
function normals(seed) {
  const g = makeRng(seed);
  return () => Math.sqrt(-2 * Math.log(1 - g.next())) * Math.cos(2 * Math.PI * g.next());
}
/** The published interval on the side facing a value, as one standard deviation. */
export const sigmaPub = (P, v) => (P === 'gw' ? (v >= MC_PUB ? MC_UP : MC_LO) / Z90 : P === 'transit' ? (v >= RP_PUB ? RP_UP : RP_LO) : 0);
export const pubValue = (P) => (P === 'gw' ? MC_PUB : P === 'transit' ? RP_PUB : FORMULA);
/** A result’s tension with the published value, in standard deviations. */
export const tension = (P, v, s) => Math.abs(v - pubValue(P)) / Math.hypot(s, sigmaPub(P, v));

// ── pictures ─────────────────────────────────────────────────────────────────
/** A chirp's frequency against time on the record, coalescing at tc; optional readings P, Q and a fitted second track. */
function trackPic(Mc, caption, { tc = 0.3, pts = [], fit = null, scatter = 0, extra = {} } = {}) {
  const fn = (m) => `(5/(256*max(${tc} - x, 0.0004)))^0.375/(pi*${(m * TSUN).toExponential(5)}^0.625)`;
  const curves = [{ fn: fn(Mc), domain: [0, r6(tc - 0.0012)], color: 'accent', width: 2.2 }];
  if (fit) curves.push({ fn: fn(fit), domain: [0, r6(tc - 0.0012)], color: 'gold', width: 1.8, dash: [6, 4] });
  return {
    type: 'graph',
    params: {
      x: [0, r6(tc + 0.02)], y: [0, 260], aspect: 'wide', axesAt: 'edge', xlabel: 'time on the record (s)', ylabel: 'GW frequency (Hz)', xticks: 6, yticks: 4,
      curves,
      points: [
        ...pts.map(([x, y, label]) => ({ x: r6(x), y: r6(y), color: 'gold', r: 5, label, labelDx: -16, labelDy: -8 })),
        ...(scatter ? (() => { const g = normals(150914); return Array.from({ length: 40 }, (_, i) => { const x = (0.96 * tc * i) / 39; return { x: r6(x), y: r6(fOf(MC_PUB, tc - x) * (1 + scatter * g())), color: 'ink3', r: 2.6 }; }); })() : []),
      ],
      ...extra,
    },
    caption,
  };
}
/** A folded transit: synthetic points (seeded) and the box model, in ppm against hours from mid-transit. */
function foldPic(caption, { depth = K10 ** 2 * 1e6, noise = 100, seed = 10, model = true, hl = [], base = 0 } = {}) {
  const g = normals(seed), u = makeRng(seed + 1);
  const pts = Array.from({ length: 150 }, () => { const h = -6 + 12 * u.next(); return [h, base + (Math.abs(h) < 0.9 ? -depth : 0) + noise * g()]; });
  return {
    type: 'graph',
    params: {
      x: [-6, 6], y: [r6(base - depth - 3.2 * noise), r6(base + 3.2 * noise)], aspect: 'wide', axesAt: 'edge', xlabel: 'hours from mid-transit', ylabel: 'flux change (ppm)', xticks: 6, yticks: 4,
      points: pts.map(([x, y]) => ({ x: r6(x), y: r6(y), r: 2.2, color: 'ink3' })),
      ...(model ? { curves: [{ fn: `-${r6(depth)}*step(0.9 - abs(x))`, color: 'gold', width: 2.4, samples: 3000 }] } : {}),
      hlines: hl,
    },
    caption,
  };
}
/** Mercury's orbit with the relativistic term hugely exaggerated, so the turning shows. */
const orbitPic = (caption) => ({ type: 'cm3-orbit', params: { force: 'gr', delta: 0.01, L: 1, E: -0.3, sliders: [], turns: 6, panels: ['orbit'], readouts: [], play: false, dragE: false, labels: false }, caption });
/** Advance ÷ λ against λ: given points, optionally the straight-line fit. */
function lamPic(pts, caption, { fit = false } = {}) {
  const ys = pts.map((p) => p[1]);
  const lo = Math.min(...ys, FORMULA), hi = Math.max(...ys);
  const sl = pts.length > 1 ? (pts[pts.length - 1][1] - pts[0][1]) / (pts[pts.length - 1][0] - pts[0][0]) : 0;
  const b0 = pts[0][1] - sl * pts[0][0];
  return {
    type: 'graph',
    params: {
      x: [-200, 3300], y: [r6(lo - 0.006), r6(hi + 0.006)], aspect: 'wide', axesAt: 'edge', xlabel: 'exaggeration factor λ', ylabel: '', xticks: 6, yticks: 4,
      points: pts.map(([x, y]) => ({ x, y, color: 'gold', r: 5 })),
      ...(fit ? { curves: [{ fn: `${r6(b0)} + ${r6(sl)}*x`, domain: [0, 3200], color: 'accent', dash: [6, 4], width: 1.6 }] } : {}),
    },
    caption,
  };
}
/** Your result beside the published one, with error bars (asymmetric for the published value); `flaw` drafts a bad figure. */
function comparePic({ v, s, pv, pu, pl, ylabel, caption, flaw = null, pubLabel = 'published' }) {
  const mine = [[1, v, s]], theirs = [[2, pv, pu, pl]];
  let y = [Math.min(v - s, pv - pl), Math.max(v + s, pv + pu)];
  const pad = 0.35 * (y[1] - y[0]);
  y = [y[0] - pad, y[1] + 1.25 * pad];
  if (flaw === 'nobars') { const d = Math.max(Math.abs(v - pv), 0.15 * s); y = [Math.min(v, pv) - 0.7 * d, Math.max(v, pv) + 0.9 * d]; }
  const curves = [], points = [...dots(mine, { color: 'accent', r: 5 })];
  if (flaw !== 'nobars') curves.push(...errorBars(mine, { color: 'accent', cap: 0.07, width: 2 }));
  if (flaw !== 'nocompare') {
    points.push(...dots(theirs, { color: 'gold', r: 5 }));
    if (flaw !== 'nobars') curves.push(...errorBars(theirs, { color: 'gold', cap: 0.07, width: 2 }));
  }
  const top = y[1] - 0.06 * (y[1] - y[0]);
  points.push({ x: 1, y: r6(top), r: 0, label: 'this thesis', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 });
  if (flaw !== 'nocompare') points.push({ x: 2, y: r6(top), r: 0, label: pubLabel, color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 });
  return {
    type: 'graph',
    params: { x: flaw === 'nocompare' ? [0.3, 1.7] : [0.3, 2.7], y: [r6(y[0]), r6(y[1])], aspect: 'wide', axesAt: 'edge', xticks: 0, yticks: 4, xlabel: '', ylabel, curves, points },
    caption,
  };
}
const YLAB = { gw: 'chirp mass (M☉)', transit: 'planet radius (R⊕)', mercury: '' };          // Mercury's long tick labels leave no room: its unit is in the caption
/** Each project's numbers for a comparison picture. */
const cmp = (P, v, s) => (P === 'gw' ? { v, s, pv: MC_PUB, pu: MC_UP / Z90, pl: MC_LO / Z90 } : P === 'transit' ? { v, s, pv: RP_PUB, pu: RP_UP, pl: RP_LO } : { v, s, pv: FORMULA, pu: 0, pl: 0, pubLabel: 'formula' });
const CMPCAP = {
  gw: 'Your synthetic-data result (blue, ±1σ) beside the published detector-frame chirp mass (gold; its 90% credible interval drawn as ±1σ, i.e. divided by 1.645).',
  transit: 'Your synthetic-data result (blue, ±1σ) beside Dumusque et al.’s published radius (gold, +0.03/−0.02 R⊕).',
  mercury: 'Advance in ″ per century: your integration (blue, ±1σ numerical uncertainty) beside the formula’s value for the same model (gold), which is exact and has no error bar.',
};
/** Clemence's 1947 tally of Mercury's perihelion turning, as bars (″ per century). */
const tallyPic = (caption) => timeBars([
  { y: 3, from: 0, to: 5600, color: 'ink3', label: 'observed from Earth ≈ 5600', alpha: 0.45 },
  { y: 2, from: 0, to: 5025, color: 'accent', label: 'precession of the equinoxes ≈ 5025' },
  { y: 1, from: 5025, to: 5557, color: 'violet', label: 'other planets ≈ 532', labelX: 2500 },
  { y: 0, from: 5557, to: 5600, color: 'gold', label: 'the rest ≈ 43', labelX: 3300 },
], { x: [-150, 6000], y: [-0.6, 3.8], xlabel: 'perihelion turning (″ per century)', xticks: 6 }, { h: 0.28, caption });
/** A budget's inputs as a Monte Carlo cloud (labx-stats), numbers hidden. */
const mcPic = (f, x, y, names, caption) => ({ type: 'labx-stats', params: { mode: 'mc', f, x, y, N: 20000, xname: names[0], yname: names[1], fname: names[2], controls: false, readout: false, hide: ['mc'], seed: 4 }, caption });
/** A notebook whose cells were run out of order. */
const NB = {
  gw: ['make synthetic chirp', 'read frequency track', 'template bank', 'fit chirp mass', 'figure'],
  transit: ['make light curve', 'detrend', 'period search', 'fold and fit', 'figure'],
  mercury: ['constants', 'integrate', 'null test', 'extrapolate', 'figure'],
};
const nbPic = (P, caption) => notebookOrder(NB[P].map((label, i) => ({ page: i + 1, run: [1, 4, 2, 5, 3][i], label })), { caption });

// ── round 1: choose and scope ────────────────────────────────────────────────
const QUESTIONS = {
  gw: {
    setting: t`You have a semester, a laptop and the published papers on the first black-hole merger ever detected.`,
    right: t`Does a leading-order matched filter, run on a synthetic chirp built with GW150914’s published detector-frame chirp mass, recover that mass — and with what uncertainty?`,
    wrong: [
      { text: 'Is general relativity correct? GW150914 is the cleanest strong-field test there is, so a semester on it should settle the question.', why: t`No single project shows a theory correct, and this question names no observable and no rival prediction your data could separate.` },
      { text: 'What are the masses of GW150914’s two black holes, separately, from the same synthetic chirp and the same leading-order filter?', why: t`A leading-order chirp depends on the masses only through the chirp mass $\mathcal M$: two pairs with the same $\mathcal M$ give the same waveform, so your model cannot answer this.` },
      { text: 'Find every binary black-hole merger in LIGO’s public data with the same matched filter, and measure each one’s chirp mass.', why: t`That is a survey of several years of data, not a semester: the result you must have would come months after the deadline. Scope creep.` },
      { text: 'Why are black holes of about 30 solar masses so common — what does GW150914 say about how massive stars die?', why: t`An open question about how massive stars live and die; one event’s chirp, real or synthetic, cannot answer it.` },
    ],
    explain: t`A good question names **one observable** (the chirp mass), **the comparison that settles it** (the published $30.4^{+2.1}_{-1.9}\,M_\odot$, detector frame) and **data that can reach it** (a synthetic chirp you control, so you know the right answer). The rest name no observable, ask what a leading-order model cannot see, or would take years. This is the project of ${LINK.gw}.`,
    pic: () => ({ type: 'gr-chirp', params: { m1: 36, m2: 29, D: 410, sliders: false, play: false, readout: false }, caption: 'A leading-order chirp from black holes of 36 and 29 solar masses at 410 Mpc (GW150914’s published values) and the detector arms it stretches, enormously exaggerated. No merger or ringdown is modelled.' }),
  },
  transit: {
    setting: t`You have a semester, a laptop and the published papers on Kepler’s first rocky planet.`,
    right: t`Does a detrend–search–fold pipeline recover Kepler-10b’s published radius ratio, $R_p/R_\star = 0.01261$, from synthetic Kepler-like photometry — and with what uncertainty?`,
    wrong: [
      { text: 'Is Kepler-10b rocky — does its light curve show a solid surface rather than a thick gas envelope?', why: t`Rock or gas is decided by the density, which needs the mass — and the mass comes from the star’s radial-velocity wobble, which a light curve cannot give.` },
      { text: 'Does Kepler-10 also have an Earth-sized planet in its habitable zone, hidden in the same forty days of photometry?', why: t`An Earth-sized transit there is under 100 ppm deep and comes about once a year: forty days of photometry cannot answer it either way.` },
      { text: 'Measure the radius of every planet Kepler found, with the same detrend–search–fold pipeline and the same noise model.', why: t`Thousands of light curves, each with its own star and systematics: a survey, not a semester. Scope creep.` },
      { text: 'Why are there so many planets smaller than Neptune — what does Kepler-10b say about how such planets form?', why: t`A population question for thousands of planets and models of how they form; one planet’s light curve cannot answer it.` },
    ],
    explain: t`A good question names **one observable** (the radius ratio, then the radius), **the comparison that settles it** (Dumusque et al.’s $0.01261$ and $1.47\,R_\oplus$) and **data that can reach it** (synthetic photometry with Kepler-like noise, so you know the right answer). The rest need a mass, years of data or thousands of planets. This is the project of ${LINK.transit}.`,
    pic: () => foldPic('A synthetic folded transit with Kepler-10b’s published depth: every orbit stacked on one time axis, 100 ppm noise, with the box model (gold). No limb darkening.'),
  },
  mercury: {
    setting: t`You have a semester, a laptop with SciPy and the published tests of general relativity.`,
    right: t`Does Newtonian gravity plus the leading general-relativistic term, integrated numerically, reproduce Mercury’s $42.98''$ per century — with the integrator’s own drift shown to be far smaller?`,
    wrong: [
      { text: t`Account for all $5600''$ per century of Mercury’s observed perihelion turning, from one numerical integration of its orbit.`, why: t`About $5025''$ of it is the precession of Earth’s equinoxes and $532''$ the other planets’ pull: a reference-frame and many-body problem far beyond one semester.` },
      { text: 'Prove that general relativity is correct, by matching its prediction for Mercury to more decimal places than anyone before.', why: t`Reproducing a prediction tests your code, and even a real measurement agreeing with it is evidence, not proof.` },
      { text: t`Is there an undiscovered planet, Vulcan, inside Mercury’s orbit that could produce the same $43''$ per century?`, why: t`A different question, answered by searching the sky — and the anomaly that once suggested Vulcan is the general-relativistic term itself.` },
      { text: 'Does general relativity break down near the Sun, where its field is strongest anywhere in the solar system?', why: t`An open-ended question with no stated observable or rival prediction; a simulation of GR’s own equation cannot show GR failing.` },
    ],
    explain: t`A good question names **one observable** (the advance per century), **the comparison that settles it** (the published $42.98''$) and **a test that could fail** (the integrator’s drift, measured with the relativistic term switched off). The rest are too big, name no observable or need telescopes. This is the project of ${LINK.mercury}.`,
    pic: () => orbitPic('Newton plus the relativistic term: the orbit’s ellipse turns a little each time round. The effect is exaggerated hundreds of thousands of times here; Mercury’s is 0.1″ per orbit.'),
  },
};

/** Which comparison number: fixed per project (the published papers list several). */
const TARGETS = {
  gw: {
    prompt: t`Thesis: **${TITLE.gw}**. Your matched filter runs on a synthetic chirp *as a detector receives it*: there is no cosmology anywhere in your code. The properties paper (Abbott et al. 2016, PRL 116, 241102) lists several masses, each a median with a 90% credible interval. Which is the right comparison for your result?`,
    choices: [
      t`The detector-frame chirp mass, $30.4^{+2.1}_{-1.9}\,M_\odot$: the universe’s expansion stretches every period by $1 + z$, so a filter on received data measures $(1 + z)\mathcal M$`,
      t`The source-frame chirp mass, $28.0^{+2.0}_{-1.7}\,M_\odot$, because that is the binary’s true property`,
      t`The final black hole’s mass, $62\,M_\odot$, the headline number of the discovery`,
      t`The total source-frame mass, $36 + 29 = 65\,M_\odot$`,
    ],
    why: {
      1: t`That is $\mathcal M$ with the redshift divided out ($z \approx 0.09$), which needs the distance from the signal’s amplitude and a cosmology — steps your analysis never took. Compare like with like.`,
      2: t`The remnant’s mass is set by the merger and ringdown, which a leading-order chirp does not model — and it is not a chirp mass at all.`,
      3: t`The chirp mass is a different combination, $(m_1m_2)^{3/5}/(m_1 + m_2)^{1/5}$ (for equal masses $0.435$ times the total) — and this one is in the source frame too.`,
    },
    explain: t`A leading-order chirp is fixed by $G\mathcal M/c^3$, a time. Every time in the received wave is stretched by $1 + z$, so data analysed as received give $(1+z)\mathcal M$ — the **detector-frame** $30.4\,M_\odot$, the paper’s $\mathcal M \simeq 30\,M_\odot$. Dividing by $1 + z$ to reach $28.0\,M_\odot$ needs a distance and a cosmology. And note the convention: the intervals are **90% credible**, not one standard deviation.`,
    pic: () => ({
      type: 'graph',
      params: {
        x: [-0.3, 0], y: [0, 260], aspect: 'wide', axesAt: 'edge', xlabel: 'time before coalescence (s)', ylabel: 'GW frequency (Hz)', xticks: 6, yticks: 4,
        curves: [
          { fn: `(5/(256*max(-x, 0.0004)))^0.375/(pi*${(28.0 * TSUN).toExponential(5)}^0.625)`, domain: [-0.3, -0.0012], color: 'violet', width: 2, dash: [6, 4] },
          { fn: `(5/(256*max(-x, 0.0004)))^0.375/(pi*${(30.4 * TSUN).toExponential(5)}^0.625)`, domain: [-0.3, -0.0012], color: 'accent', width: 2 },
        ],
        legend: [{ label: 'chirp mass 28.0 M☉', color: 'violet', dash: [6, 4] }, { label: 'chirp mass 30.4 M☉', color: 'accent' }], legendAt: 'tl',
      },
      caption: 'Leading-order chirps for the two published chirp masses: the heavier sweeps through the band sooner. A redshift stretches the received chirp in time, which makes it look heavier.',
    }),
  },
  transit: {
    prompt: t`Thesis: **${TITLE.transit}**. From the synthetic light curve your pipeline measures one thing: the transit depth $\delta$, the fraction of the star’s light the planet blocks. Which published number does that measurement test most directly?`,
    choices: [
      t`The radius ratio $R_p/R_\star = 0.01261$ (Dumusque et al. 2014), through $\delta = (R_p/R_\star)^2$: a light curve measures the ratio alone`,
      t`The planet’s radius, $1.47\,R_\oplus$, since the radius is what the thesis is about`,
      t`The planet’s mass, $3.33\,M_\oplus$`,
      t`The orbital period, $0.837\,495$ d`,
    ],
    why: {
      1: t`The radius also needs the star’s radius, $R_\star = 1.065\,R_\odot$, which your light curve never measured. Test the ratio first; then bring in $R_\star$ as a separate entry in the budget.`,
      2: t`A transit measures a size, not a mass: the mass came from the star’s radial-velocity wobble.`,
      3: t`Your period search should recover it — a good check of the search — but the period says nothing about the planet’s size, the thesis’s number.`,
    },
    explain: t`The depth is an area ratio, $\delta = (R_p/R_\star)^2$, so the light curve tests $R_p/R_\star = 0.01261$ directly ($\delta = 159$ ppm). The radius in Earth radii adds an outside input, the asteroseismic $R_\star = 1.065 \pm 0.009\,R_\odot$, with its own uncertainty: compare the ratio, then propagate the star.`,
    pic: () => foldPic('A synthetic folded transit (grey) with its box model (gold). The light curve knows nothing about the star’s size in kilometres.'),
  },
  mercury: {
    prompt: t`Thesis: **${TITLE.mercury}**. Your simulation contains the Sun, Mercury and the leading general-relativistic term — nothing else. Clemence’s 1947 tally of the observed turning (the bars) has several entries. Which number does your simulation reproduce?`,
    choices: [
      t`About $43''$ per century: the general-relativistic part, $42.98''$ (Will 2014)`,
      t`About $5600''$ per century, the turning observed from Earth`,
      t`About $532''$ per century, from the other planets’ pull`,
      t`About $575''$ per century, all that is left once the equinoxes are removed`,
    ],
    why: {
      1: t`Most of that ($\approx 5025''$) is Earth’s equinoxes precessing — the reference frame turning, not Mercury — and $\approx 532''$ comes from the planets. Your model has neither.`,
      2: t`That is Newtonian many-body gravity from Venus, Earth, Jupiter and the rest, none of which is in your simulation.`,
      3: t`That is the planets’ $532''$ and relativity’s $43''$ together. With no planets in your model you would come out $532''$ short — and wrongly announce an anomaly.`,
    },
    explain: t`A Sun-plus-relativity model can produce only the relativistic entry: $42.98''$ per century. The equinoxes are a property of the Earth-based frame, the planets a Newtonian many-body problem — both deliberately left out, and the thesis must say so.`,
    pic: () => tallyPic('Mercury’s perihelion turning as seen from Earth, split into its causes (Clemence 1947, rounded). The bars are to scale: the relativistic part is the thin sliver at the end.'),
  },
};

/** The size of the effect, before any data: a chirp's time or cycles in band; a transit's folded SNR; the advance per orbit at λ. */
export function estimateCase(r, P) {
  if (P === 'gw') {
    const kind = r.pick(['tau', 'cycles']), flo = r.pick([20, 25, 30, 35, 40]);
    const key = kind === 'tau' ? tau(MC_PUB, flo) : cycles(MC_PUB, flo);
    return { P, kind, flo, key };
  }
  if (P === 'transit') {
    const sig = r.pick([100, 150, 200, 300]), T = r.pick([30, 40, 60, 90]);
    const depth = K10 ** 2 * 1e6, nin = (T / P10) * (DUR_H / CAD_H);
    return { P, sig, T, depth, nin, key: (depth * Math.sqrt(nin)) / sig };
  }
  const lam = r.pick([100, 300, 1000, 3000, 10000]);
  const GMp = 1.327e20, cp = 2.998e8, ap = 0.3871 * 1.496e11, ep = 0.2056;      // the constants as printed
  const rad = (lam * 6 * Math.PI * GMp) / (cp * cp * ap * (1 - ep * ep));
  return { P, lam, rad, key: rad * ARC };
}

// ── round 2: reproduce the number ────────────────────────────────────────────
/** Synthetic readings → the number: two chirp readings; two transit means; two exaggerated runs. */
export function numberCase(r, P) {
  if (P === 'gw') {
    const f1 = r.pick([35, 40, 45]), f2 = r.pick([90, 110, 130]);
    const t2true = tau(MC_PUB, f1) - tau(MC_PUB, f2);
    const n = () => (r.next() + r.next() + r.next() - 1.5) * 0.012;              // a reading error of about 0.6%
    const F1 = +(f1 * (1 + n())).toFixed(1), F2 = +(f2 * (1 + n())).toFixed(1), T2 = +t2true.toFixed(4);
    const K = (F1 ** (-8 / 3) - F2 ** (-8 / 3)) / ((256 / 5) * Math.PI ** (8 / 3) * T2);
    return { P, F1, F2, T2, K, key: K ** 0.6 / TSUN, tc: tau(MC_PUB, f1) };
  }
  if (P === 'transit') {
    const o = r.int(5, 12), i = r.int(146, 162);                               // ppm above and below the median
    const depth = o + i, k = Math.sqrt(depth * 1e-6);
    return { P, o, i, depth, k, key: k * RSTAR * REARTH };
  }
  const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  const [a, b] = r.pick(pairs), [l1, y1] = PER[a], [l2, y2] = PER[b];
  const slope = (y2 - y1) / (l2 - l1);
  return { P, l1, y1, l2, y2, slope, key: y1 - slope * l1 };
}

// the Python for the code item, one listing per project
const CODE = {
  gw: {
    prelude: t`import numpy as np

TSUN = 4.925491e-6                     # G M_sun / c^3, in seconds

# SYNTHETIC data: the frequency of a leading-order chirp built with the
# chirp mass 30.2 M_sun (near the published 30.4), read off a
# time-frequency map at 40 moments, each reading with 1.5% scatter
rng = np.random.default_rng(150914)
tc = 0.25                              # coalescence, s on the record
t = np.linspace(0.0, 0.24, 40)         # s
f = (5 / (256 * (tc - t)))**0.375 / (np.pi * (30.2 * TSUN)**0.625)
f = f * (1 + 0.015 * rng.normal(size=t.size))       # Hz
`,
    fn: t`def chirp_mass(t, f):
    """Chirp mass in solar masses, from a straight-line fit of f**(-8/3) against t."""
`,
    body: t`    slope = np.polyfit(t, f**(-8 / 3), 1)[0]
    return (-slope * 5 / 256 * np.pi**(-8 / 3))**0.6 / TSUN
`,
    call: 'print(chirp_mass(t, f))\n',
    prompt: t`Thesis: **${TITLE.gw}**. The listing makes the synthetic data: 40 readings of the chirp’s frequency \`f\` at times \`t\`. At leading order $$f^{-8/3} = \frac{256}{5}\,\pi^{8/3}\left(\frac{G\mathcal M}{c^3}\right)^{5/3}(t_c - t),$$ a straight line in $t$ whose slope fixes $\mathcal M$ — whatever the unknown $t_c$. Write \`chirp_mass(t, f)\`: fit a straight line to \`f**(-8/3)\` against \`t\` (\`np.polyfit\`) and turn its slope into a chirp mass in solar masses (\`TSUN\` is $GM_\odot/c^3$ in seconds).`,
    tests: [
      { name: 'a clean 25 M☉ chirp gives 25 exactly', code: 'abs(chirp_mass(t, (5 / (256 * (0.3 - t)))**0.375 / (np.pi * (25 * TSUN)**0.625)) - 25) < 1e-6' },
      { name: 'the answer does not depend on the coalescence time', code: 'abs(chirp_mass(t, (5 / (256 * (0.27 - t)))**0.375 / (np.pi * (40 * TSUN)**0.625)) - 40) < 1e-6' },
      { name: 'the synthetic readings give the injected 30.2 M☉ within 1 M☉', code: 'abs(chirp_mass(t, f) - 30.2) < 1.0' },
    ],
    hints: [t`\`np.polyfit(t, f**(-8 / 3), 1)\` returns \`[slope, intercept]\`; the slope is negative, since $t_c - t$ shrinks.`, t`Set the slope equal to $-\tfrac{256}{5}\pi^{8/3}T^{5/3}$ with $T = G\mathcal M/c^3$: then $T = \bigl(-\text{slope}\cdot\tfrac{5}{256}\pi^{-8/3}\bigr)^{3/5}$.`, t`Divide $T$ (seconds) by \`TSUN\` to get solar masses.`],
    explain: t`The fit uses all 40 readings, so the scatter of any one matters little: these give $30.35\,M_\odot$, within $0.2\,M_\odot$ of the $30.2$ built in, and the two clean tracks come back exactly. A real analysis fits the whole waveform to the whitened strain; this is the same physics, $\dot f \propto \mathcal M^{5/3}f^{11/3}$, read from the frequency track. The method is that of ${LINK.gw}.`,
  },
  transit: {
    prelude: t`import numpy as np

# SYNTHETIC folded light curve: 40 days of 30-minute photometry folded on
# Kepler-10b's period (0.837495 d); a box transit 1.8 h long whose depth is
# the published radius ratio squared, 0.01261**2; 100 ppm white noise
rng = np.random.default_rng(10)
hours = rng.uniform(-10.05, 10.05, 1920)            # hours from mid-transit
flux = 1 - 0.01261**2 * (np.abs(hours) < 0.9) + 100e-6 * rng.normal(size=hours.size)
`,
    fn: t`def planet_radius(hours, flux, Rs=1.065):
    """Planet radius in Earth radii, for a star of Rs solar radii (1 R_sun = 109.08 R_earth)."""
`,
    body: t`    depth = flux[np.abs(hours) > 1.8].mean() - flux[np.abs(hours) < 0.9].mean()
    return np.sqrt(depth) * Rs * 109.08
`,
    call: 'print(planet_radius(hours, flux))\n',
    prompt: t`Thesis: **${TITLE.transit}**. The listing makes the synthetic data: a folded light curve, \`flux\` against \`hours\` from mid-transit. Write \`planet_radius(hours, flux, Rs=1.065)\`: take the depth as the mean flux out of transit ($|h| > 1.8$ h) minus the mean in transit ($|h| < 0.9$ h), turn it into the radius ratio, and return the planet’s radius in Earth radii for a star of \`Rs\` solar radii ($1\,R_\odot = 109.08\,R_\oplus$).`,
    tests: [
      { name: 'a clean 400 ppm box in front of a 1 R☉ star gives 2.1816 R⊕', code: 'abs(planet_radius(hours, 1 - 4e-4 * (np.abs(hours) < 0.9), 1.0) - 2.1816) < 1e-9' },
      { name: 'the radius scales with the star’s radius', code: 'abs(planet_radius(hours, flux, 2.13) / planet_radius(hours, flux) - 2) < 1e-9' },
      { name: 'the synthetic transit gives the published 1.465 R⊕ within 0.05', code: 'abs(planet_radius(hours, flux) - 0.01261 * 1.065 * 109.08) < 0.05' },
    ],
    hints: ['Two boolean masks, `np.abs(hours) > 1.8` and `np.abs(hours) < 0.9`, select the points out of and in transit.', t`The depth is an area ratio, $\delta = (R_p/R_\star)^2$: the ratio is \`np.sqrt(depth)\`.`, 'Multiply the ratio by `Rs * 109.08`.'],
    explain: t`The folded curve holds about 170 in-transit points, so the depth comes out within a few per cent of $159$ ppm: here $R_p = 1.470\,R_\oplus$, against the $1.465\,R_\oplus$ built in. The gap between 0.9 and 1.8 hours keeps points near the edges, where a real transit is only partly deep, out of both averages. The method is that of ${LINK.transit}.`,
  },
  mercury: {
    prelude: t`import numpy as np

# SYNTHETIC perihelion directions (radians), as an orbit-averaged
# integration of Newton plus lam times the GR term would give them at 20
# successive perihelion passages, for four exaggeration factors lam; the
# advance has a small lam**2 part, and each angle 1e-8 rad of jitter
rng = np.random.default_rng(1859)
ARC = 206264.806                       # arcseconds per radian
CENTURY = 36525                        # days
P = 87.969                             # Mercury's orbital period, days
t = P * np.arange(20)                  # days
lams = [100, 300, 1000, 3000]
w = {lam: 0.5 + lam * (42.9807 + 1.495e-5 * lam) / ARC / CENTURY * t
          + 1e-8 * rng.normal(size=t.size) for lam in lams}
`,
    fn: t`def rate(t, w, lam):
    """The advance divided by lam, in arcseconds per century, from a straight-line fit of w against t."""
`,
    body: t`    return np.polyfit(t, w, 1)[0] * ARC * CENTURY / lam
`,
    fn2: t`
def extrapolate(lams, rates):
    """The straight line through the points (lam, rate), evaluated at lam = 0."""
`,
    body2: t`    return np.polyfit(lams, rates, 1)[1]
`,
    call: 'rates = [rate(t, w[l], l) for l in lams]\nprint(*rates)\nprint(extrapolate(lams, rates))\n',
    prompt: t`Thesis: **${TITLE.mercury}**. The listing makes the synthetic data: the perihelion direction \`w[lam]\` (radians) at times \`t\` (days), for each exaggeration factor in \`lams\`. Write \`rate(t, w, lam)\`: fit a straight line to \`w\` against \`t\` and return its slope in arcseconds per century, **divided by** \`lam\`. Then write \`extrapolate(lams, rates)\`: fit a straight line to the rates against $\lambda$ and return its value at $\lambda = 0$ — the general-relativistic advance.`,
    tests: [
      { name: 'a clean line turning 2×10⁻⁶ rad a day, at λ = 10, gives 1506.9″ per century', code: 'abs(rate(t, 0.1 + 2e-6 * t, 10) - 2e-6 * ARC * CENTURY / 10) < 1e-9' },
      { name: 'the λ = 1000 runs advance 42.9957″ per century per unit λ', code: 'abs(rate(t, w[1000], 1000) - 42.9957) < 0.001' },
      { name: 'extrapolating the four rates to λ = 0 gives 42.981', code: 'abs(extrapolate(lams, [rate(t, w[l], l) for l in lams]) - 42.9807) < 0.001' },
      { name: 'extrapolate is a straight line’s intercept', code: 'abs(extrapolate([1, 2], [3, 5]) - 1) < 1e-12' },
    ],
    hints: ['`np.polyfit(t, w, 1)[0]` is the slope, in radians per day.', 'Radians per day times `ARC * CENTURY` is arcseconds per century; then divide by `lam`.', '`np.polyfit(lams, rates, 1)` returns `[slope, intercept]`: the intercept is the value at λ = 0.'],
    explain: t`Each rate is the slope of the perihelion direction against time, converted to arcseconds per century and divided by $\lambda$: $42.9822$ at $\lambda = 100$ rising to $43.0255$ at 3000, the $\lambda^2$ part showing. The straight line through them meets $\lambda = 0$ at $42.9808''$ per century — the formula’s $42.9807''$ and Will’s $42.98''$. The method is that of ${LINK.mercury}.`,
  },
};
/** The code item for a project: prompt, starter, reference solution and tests. */
export function codeCase(P) {
  const C = CODE[P];
  const starter = C.prelude + '\n' + C.fn + '    pass\n' + (C.fn2 ? C.fn2 + '    pass\n' : '') + '\n' + C.call;
  const answer = C.prelude + '\n' + C.fn + C.body + (C.fn2 ? C.fn2 + C.body2 : '') + '\n' + C.call;
  return { prompt: C.prompt, starter, answer, tests: C.tests, hints: C.hints, explain: C.explain };
}

/** A check that could fail: the numbers each project's reply quotes. */
export function checkCase(r, P) {
  if (P === 'gw') return { P, inj: r.pick([[22, 40], [20, 36], [25, 45]]), v: +(30.4 + r.pick([-0.6, -0.3, 0.2, 0.4, 0.7])).toFixed(1), s: r.pick([0.9, 1.1, 1.3]) };
  if (P === 'transit') return { P, inj: r.pick([[80, 400], [60, 300], [100, 500]]), v: +(1.465 + r.pick([-0.02, -0.01, 0.01, 0.02])).toFixed(2), s: r.pick([0.04, 0.05]) };
  const [rtol, drift] = r.pick(NULLT);
  return { P, rtol, drift, pct: (100 * drift) / 42.98 };
}

// ── round 3: the budget and the verdict ─────────────────────────────────────
/** The uncertainty budget: a power law in quadrature (chirp mass, radius) or three numerical entries (Mercury). */
export function budgetCase(r, P) {
  if (P === 'gw') {
    const v = +(30.4 + r.pick([-0.5, -0.2, 0.1, 0.3, 0.6])).toFixed(1), a = r.pick([0.5, 1, 1.5]), b = r.pick([3, 4, 5, 6, 8]);
    return { P, v, a, b, key: (v * 0.6 * Math.hypot((11 / 3) * a, b)) / 100 };
  }
  if (P === 'transit') {
    const d = r.int(150, 168), sd = r.pick([6, 8, 10, 12]);
    const Rp = Math.sqrt(d * 1e-6) * RSTAR * REARTH;
    return { P, d, sd, Rp, key: Rp * Math.hypot(sd / (2 * d), SRSTAR / RSTAR) };
  }
  const d = r.pick([0.0004, 0.0006, 0.0008]), D = r.pick([0.006, 0.009, 0.012, 0.015]), e = r.pick([0.0002, 0.0003, 0.0005]);
  const fine = +(FORMULA + r.pick([0.0003, 0.0005, 0.0008])).toFixed(4), coarse = +(fine + D).toFixed(4);
  const u = (coarse - fine) / 15;
  return { P, d, D, e, fine, coarse, u, key: Math.sqrt(d * d + u * u + e * e) };
}
/** Your result against the published one. */
export function tensionCase(r, P) {
  if (P === 'gw') {
    const s = r.pick([0.8, 1.0, 1.2, 1.5]), v = +(MC_PUB + r.sign() * r.float(0.8, 3.0, 0.1)).toFixed(1);
    return { P, v, s, sp: sigmaPub(P, v), key: tension(P, v, s) };
  }
  if (P === 'transit') {
    const s = r.pick([0.03, 0.04, 0.05]), v = +(RP_PUB + r.sign() * r.float(0.03, 0.15, 0.01)).toFixed(2);
    return { P, v, s, sp: sigmaPub(P, v), key: tension(P, v, s) };
  }
  const s = r.pick([0.0008, 0.001, 0.0012, 0.0015]), v = +(FORMULA + r.sign() * r.float(0.0006, 0.004, 0.0001)).toFixed(4);
  return { P, v, s, sp: 0, key: tension(P, v, s) };
}
/** A result that agrees (|z| < 1.3): what does that establish? */
export function verdictCase(r, P) {
  for (;;) {
    const C = tensionCase(r, P);
    const v = P === 'gw' ? +(MC_PUB + (C.v - MC_PUB) / 2.5).toFixed(1) : P === 'transit' ? +(RP_PUB + (C.v - RP_PUB) / 3).toFixed(2) : +(FORMULA + (C.v - FORMULA) / 3).toFixed(4);
    const z = tension(P, v, C.s);
    if (z < 1.3 && z > 0.15) return { P, v, s: C.s, z };
  }
}

// ── round 4: present it ─────────────────────────────────────────────────────
/** A result written to the precision of its uncertainty, with the over-precise version a draft might carry. */
export function abstractCase(r, P) {
  const C = verdictCase(r, P);
  const dec = P === 'gw' ? 1 : P === 'transit' ? 2 : 4;
  const jitter = (x, k) => x + (r.next() - 0.5) * 10 ** -(k + 1);
  return { ...C, dec, vLong: jitter(C.v, dec).toFixed(dec + 3), sLong: jitter(C.s, dec).toFixed(dec + 3), seed: r.int(1, 99999) };
}

// ── the battle ───────────────────────────────────────────────────────────────
const ROUNDS = [
  {
    title: 'Choose and scope',
    story: t`Before a line of code: what exactly is the question, which published number answers it, and how big is the thing you are trying to measure? Three projects are on the shelf — **${TITLE.gw}** from a synthetic gravitational-wave chirp, **${TITLE.transit}** from a synthetic transit, **${TITLE.mercury}** from your own integration — and this attempt has drawn one of them. Every problem names it.`,
    items: [
      mcq({
        id: 'r1-question', skill: 'research.R3.1', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r1-question', v), Q = QUESTIONS[P];
          const wrong = r.shuffle(Q.wrong).slice(0, 3);
          return {
            prompt: t`Your mini-thesis: **${TITLE[P]}**. ${Q.setting} Which research question should the thesis set out to answer?`,
            choices: [Q.right, ...wrong.map((w) => w.text)],
            answer: 0,
            why: { 1: wrong[0].why, 2: wrong[1].why, 3: wrong[2].why },
            hints: [t`Which question names one number, the data that will produce it and the published value it will be held against?`, t`Rule out the questions your model cannot see, the ones that name no observable, and the ones that would take years.`],
            teach: t`A research question is answerable when it names an observable, the comparison that will settle it, and data that can reach the precision needed.`,
            explain: Q.explain,
            visual: Q.pic(),
          };
        },
      }),
      mcq({
        id: 'r1-target', skill: 'research.R2.1', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r1-target', v), T = TARGETS[P];
          return {
            prompt: T.prompt, choices: T.choices, answer: 0, why: T.why,
            hints: [t`What does your analysis actually contain — and what does it leave out?`, t`Rule out every number that needs an ingredient your analysis does not have: a distance and a cosmology, a star’s radius, other planets.`],
            teach: t`Compare like with like: the published number must measure exactly what your analysis measures, in the same frame and with the same ingredients.`,
            explain: T.explain,
            visual: T.pic(),
          };
        },
      }),
      num({
        id: 'r1-estimate', skill: 'research.R3.2', difficulty: 3, transfer: true,
        gen(r, v) {
          const P = projectOf(r, 'r1-estimate', v), C = estimateCase(r, P);
          if (P === 'gw') {
            const T30 = MC_PUB * TSUN, f = C.flo;
            if (C.kind === 'tau') {
              return {
                prompt: t`Thesis: **${TITLE.gw}**. Size the signal before you write a template. At leading order a chirp reaches coalescence a time $$\tau = \frac{5}{256}\,(\pi f)^{-8/3}\left(\frac{G\mathcal M}{c^3}\right)^{-5/3}$$ after its frequency passes $f$. For the published detector-frame $\mathcal M = 30.4\,M_\odot$, how long, in seconds, does the signal take from $${f}$ Hz to coalescence? ($GM_\odot/c^3 = 4.925\times10^{-6}$ s.)`,
                answer: C.key, units: 's', tol: { rel: 0.01 },
                errors: apart([
                  { value: (5 / 256) * f ** (-8 / 3) * T30 ** (-5 / 3), feedback: t`The $\pi$ sits inside the bracket with $f$: $(\pi f)^{-8/3}$.` },
                  { value: (5 / 256) * (Math.PI * f) ** (-8 / 3) * T30 ** (-3 / 5), feedback: t`The exponent on $G\mathcal M/c^3$ is $-5/3$, not $-3/5$.` },
                  { value: (5 / 256) * (Math.PI * f) ** (-8 / 3) * T30 ** (-5 / 3) * 1e3, feedback: 'That is in milliseconds; the answer is wanted in seconds.' },
                ], C.key),
                hints: [t`First $G\mathcal M/c^3 = 30.4 \times 4.925\times10^{-6}$ s $= ${sci(T30, 4)}$ s.`, t`Then $(\pi \times ${f})^{-8/3}$ and $(${sci(T30, 4)})^{-5/3}$; multiply by $5/256$.`],
                teach: t`Sizing the signal first tells you how long a record and a template you need — and checks your reading of the paper against its own description.`,
                explain: t`$\tau = \tfrac{5}{256}(\pi\cdot${f})^{-8/3}(${sci(T30, 4)})^{-5/3} = ${C.key.toFixed(3)}$ s. A heavy binary crosses the band fast: the discovery paper describes about 8 cycles in 0.2 s, from 35 to 150 Hz, where the merger (not in this formula) takes over. So a 4-second record holds the whole chirp with plenty of noise around it to measure the background.`,
                visual: trackPic(MC_PUB, `A leading-order chirp of 30.4 M☉ coalescing at 0.3 s on the record; the dashed line is ${f} Hz.`, { extra: { hlines: [{ y: f, label: `${f} Hz`, color: 'ink3' }] } }),
              };
            }
            return {
              prompt: t`Thesis: **${TITLE.gw}**. Size the signal before you write a template: a matched filter gains from every cycle it can line up. At leading order the number of gravitational-wave cycles between frequency $f$ and coalescence is $$N = \frac{1}{32\,\pi^{8/3}}\left(\frac{G\mathcal M f}{c^3}\right)^{-5/3}.$$ For the published detector-frame $\mathcal M = 30.4\,M_\odot$, how many cycles lie between $${f}$ Hz and coalescence? ($GM_\odot/c^3 = 4.925\times10^{-6}$ s.)`,
              answer: C.key, tol: { rel: 0.01 },
              errors: apart([
                { value: (T30 * f) ** (-5 / 3) / (32 * Math.PI), feedback: t`The prefactor is $1/(32\pi^{8/3})$, not $1/(32\pi)$.` },
                { value: (T30 * f) ** (-3 / 5) / (32 * Math.PI ** (8 / 3)), feedback: t`The exponent is $-5/3$, not $-3/5$.` },
              ], C.key),
              hints: [t`$G\mathcal M f/c^3 = 30.4 \times 4.925\times10^{-6}\ \text{s} \times ${f}\ \text{Hz}$ — a pure number.`, t`Raise it to the power $-5/3$ and divide by $32\pi^{8/3} = ${(32 * Math.PI ** (8 / 3)).toFixed(1)}$.`],
              teach: t`Sizing the signal first tells you how much there is to filter — and checks your reading of the paper against its own description.`,
              explain: t`$G\mathcal M f/c^3 = ${sci(T30 * f, 4)}$, so $N = ${C.key.toFixed(1)}$ cycles. The discovery paper describes about 8 cycles from 35 to 150 Hz, where the merger (not in this formula) takes over: a heavy binary gives a short, loud chirp, and a template of a few tenths of a second covers it.`,
              visual: trackPic(MC_PUB, `A leading-order chirp of 30.4 M☉ coalescing at 0.3 s on the record; the dashed line is ${f} Hz.`, { extra: { hlines: [{ y: f, label: `${f} Hz`, color: 'ink3' }] } }),
            };
          }
          if (P === 'transit') {
            const { sig, T, depth, nin, key } = C;
            const verdict = key >= 7.1 ? t`above Kepler’s detection threshold of $7.1\sigma$, so the project is feasible` : t`below Kepler’s detection threshold of $7.1\sigma$: with this much noise the thesis needs more days of data before it starts`;
            return {
              prompt: t`Thesis: **${TITLE.transit}**. Is it feasible? The published ratio $R_p/R_\star = 0.01261$ fixes the depth you are hunting. Your synthetic light curve will have one point every 30 minutes for ${T} days, with ${sig} ppm of white noise per point; the transit lasts 1.8 hours and repeats every $0.837\,495$ days. Estimate the signal-to-noise ratio of the folded depth, $\delta/(\sigma/\sqrt{n_{\text{in}}})$, where $n_{\text{in}}$ is the number of points in transit.`,
              answer: key, tol: { rel: 0.02 },
              errors: apart([
                { value: (K10 * 1e6 * Math.sqrt(nin)) / sig, feedback: t`The depth is the **square** of the radius ratio: $\delta = (0.01261)^2$.` },
                { value: (depth * nin) / sig, feedback: t`Averaging $n$ points shrinks the noise by $\sqrt n$, not by $n$.` },
                { value: (depth * Math.sqrt((T * 24) / CAD_H)) / sig, feedback: t`Only the points **in transit** carry the signal: $n_{\text{in}} = (\text{days}/P)\times(1.8\ \text{h}/0.5\ \text{h})$.` },
              ], key),
              hints: [t`$\delta = (0.01261)^2 = ${depth.toFixed(0)}$ ppm.`, t`$n_{\text{in}} = \dfrac{${T}}{0.837\,495}\times\dfrac{1.8}{0.5}$: transits in the data times points per transit.`],
              teach: t`Feasibility is the expected effect divided by the uncertainty you can reach; averaging $n$ points divides the noise by $\sqrt n$.`,
              explain: t`$\delta = ${depth.toFixed(0)}$ ppm and $n_{\text{in}} = ${(T / P10).toFixed(1)} \times 3.6 = ${nin.toFixed(0)}$, so the folded depth has SNR $${depth.toFixed(0)}\sqrt{${nin.toFixed(0)}}/${sig} = ${key.toFixed(1)}$ — ${verdict}.`,
              visual: foldPic(`A synthetic folded transit of Kepler-10b’s depth with ${sig} ppm noise per point.`, { noise: sig, seed: 10 + sig }),
            };
          }
          const { lam, rad, key } = C;
          return {
            prompt: t`Thesis: **${TITLE.mercury}**. Size the effect your integrator must resolve. The leading-order advance per orbit, with the relativistic term exaggerated by $\lambda$, is $$\Delta\phi = \lambda\,\frac{6\pi GM}{c^2a(1-e^2)},$$ with $GM = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $c = 2.998\times10^8$ m/s, and Mercury’s $a = 0.3871$ AU ($1\ \text{AU} = 1.496\times10^{11}$ m) and $e = 0.2056$. Your first run uses $\lambda = ${lam}$. How large is the advance per orbit, in arcseconds?`,
            answer: key, units: 'arcsec', tol: { rel: 0.01 },
            errors: apart([
              { value: rad, feedback: t`That is in radians. Multiply by $206\,265''$ per radian.` },
              { value: key * (1 - 0.2056 ** 2), feedback: t`Keep the $1 - e^2$ in the denominator: Mercury’s orbit is noticeably eccentric.` },
              { value: key / lam, feedback: t`That is the unexaggerated advance; multiply by $\lambda = ${lam}$.` },
              { value: (key * 36525) / 87.969, feedback: 'That is per century; the question asks per orbit.' },
            ], key),
            hints: [t`$a = 0.3871 \times 1.496\times10^{11}$ m $= ${sci(0.3871 * 1.496e11, 4)}$ m.`, t`$6\pi GM/(c^2a(1-e^2))$ is in radians; multiply by $\lambda$, then by $206\,265''$ per radian.`],
            teach: t`Size the effect before simulating: an advance of a tenth of an arcsecond per orbit is what the integrator’s own error must stay far below.`,
            explain: t`$\Delta\phi = ${lam}\times${sci(rad / lam, 4)}$ rad $= ${sci(rad, 4)}$ rad $= ${key.toFixed(key < 100 ? 2 : 1)}''$ per orbit. Unexaggerated it is $${((rad / lam) * ARC).toFixed(4)}''$ — about one part in ${(1.296e6 / ((rad / lam) * ARC) / 1e6).toFixed(0)} million of a turn per orbit, which is why the thesis exaggerates the term, and why it must show the integrator’s drift is smaller still.`,
            visual: orbitPic('The orbit turns a little each time round under Newton plus the relativistic term, exaggerated hundreds of thousands of times here.'),
          };
        },
      }),
    ],
  },
  {
    title: 'Reproduce the number',
    story: t`Now the data. They are **synthetic**: built from the published value, with noise added, and labelled synthetic in every file and figure. Extract the number by hand, then in code — and then convince a referee that it measures the physics, not your pipeline.`,
    items: [
      num({
        id: 'r2-number', skill: 'research.R7.2', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r2-number', v), C = numberCase(r, P);
          if (P === 'gw') {
            const { F1, F2, T2, K, key } = C;
            const slipNoDiff = ((F1 ** (-8 / 3)) / ((256 / 5) * Math.PI ** (8 / 3) * T2)) ** 0.6 / TSUN;
            return {
              prompt: t`Thesis: **${TITLE.gw}**. The synthetic chirp (built with $\mathcal M = 30.4\,M_\odot$, plus noise) is read off a time–frequency map at two moments: at $t_P = 0$ the frequency is $f_P = ${F1}$ Hz, and at $t_Q = ${T2}$ s it is $f_Q = ${F2}$ Hz. At leading order $f^{-8/3}$ falls linearly in time, $$f^{-8/3} = \frac{256}{5}\,\pi^{8/3}\left(\frac{G\mathcal M}{c^3}\right)^{5/3}(t_c - t),$$ with $t_c$ unknown. What chirp mass do the two readings give, in solar masses? ($GM_\odot/c^3 = 4.925\times10^{-6}$ s.)`,
              answer: key, units: 'Msun', tol: { rel: 0.01 },
              errors: apart([
                { value: K ** 0.6, feedback: t`That is $G\mathcal M/c^3$ in seconds; divide by $4.925\times10^{-6}$ s per solar mass.` },
                { value: K / TSUN, feedback: t`The bracket is $(G\mathcal M/c^3)^{5/3}$: raise it to the power $3/5$ before converting.` },
                { value: slipNoDiff, feedback: t`Neither reading is at coalescence: use the **difference** $f_P^{-8/3} - f_Q^{-8/3}$ over the time between them, and $t_c$ drops out.` },
              ], key),
              hints: [t`Subtract the equation at $Q$ from the one at $P$: $f_P^{-8/3} - f_Q^{-8/3} = \tfrac{256}{5}\pi^{8/3}(G\mathcal M/c^3)^{5/3}\,(t_Q - t_P)$.`, t`Solve for $(G\mathcal M/c^3)^{5/3}$, raise to $3/5$ to get seconds, then divide by $4.925\times10^{-6}$ s.`, t`Here $f_P^{-8/3} - f_Q^{-8/3} = ${sci(F1 ** (-8 / 3) - F2 ** (-8 / 3), 4)}\ \text{Hz}^{-8/3}$.`],
              teach: t`Two readings of a chirp’s frequency fix its chirp mass, with the unknown coalescence time cancelling in the difference.`,
              explain: t`$$\left(\frac{G\mathcal M}{c^3}\right)^{5/3} = \frac{${sci(F1 ** (-8 / 3) - F2 ** (-8 / 3), 4)}}{\tfrac{256}{5}\pi^{8/3}\times${T2}} = ${sci(K, 4)}\ \text{s}^{5/3},$$ so $G\mathcal M/c^3 = ${sci(K ** 0.6, 4)}$ s and $\mathcal M = ${key.toFixed(1)}\,M_\odot$ — within reading error of the $30.4$ built in. Two points are the least a fit can use; the code item uses forty.`,
              visual: trackPic(MC_PUB, 'The synthetic chirp’s frequency on the record (blue) and the two readings P and Q (gold). Leading order; the merger is not modelled.', { tc: r6(C.tc), pts: [[0, F1, 'P'], [T2, F2, 'Q']] }),
            };
          }
          if (P === 'transit') {
            const { o, i, depth, k, key } = C;
            return {
              prompt: t`Thesis: **${TITLE.transit}**. Fold the synthetic light curve on the period and average: relative to the light curve’s median, the out-of-transit points average $+${o}$ ppm and the in-transit points $-${i}$ ppm. The star’s radius is $R_\star = 1.065\,R_\odot$ and $1\,R_\odot = 109.08\,R_\oplus$. What is the planet’s radius, in Earth radii?`,
              answer: key, tol: { rel: 0.005 },
              errors: apart([
                { value: Math.sqrt(i * 1e-6) * RSTAR * REARTH, feedback: 'Measure the depth from the out-of-transit level, not from the median: add the two.' },
                { value: depth * 1e-6 * RSTAR * REARTH, feedback: t`The depth is the **square** of the radius ratio: take $\sqrt\delta$ first.` },
                { value: k * RSTAR, feedback: 'That is in solar radii; multiply by 109.08 for Earth radii.' },
                { value: k * REARTH, feedback: t`Multiply by the star’s radius too, $1.065\,R_\odot$.` },
              ], key, 0.012),
              hints: [t`The depth is out minus in: $\delta = ${o} + ${i}$ ppm.`, t`$R_p/R_\star = \sqrt{\delta}$ with $\delta$ as a fraction, then $R_p = \sqrt\delta \times 1.065 \times 109.08\,R_\oplus$.`],
              teach: t`The depth is measured from the out-of-transit level, and it is an area ratio: the radius ratio is its square root.`,
              explain: t`$\delta = ${depth}$ ppm, so $R_p/R_\star = \sqrt{${depth}\times10^{-6}} = ${k.toFixed(5)}$ and $R_p = ${k.toFixed(5)} \times 1.065 \times 109.08 = ${key.toFixed(3)}\,R_\oplus$ — against the $0.01261$ and $1.465\,R_\oplus$ built into the synthetic data.`,
              visual: foldPic('The synthetic folded transit (grey), with the out-of-transit and in-transit averages (dashed). No limb darkening.', { model: false, depth, base: o, hl: [{ y: o, label: 'out of transit', color: 'good' }, { y: -i, label: 'in transit', color: 'gold' }] }),
            };
          }
          const { l1, y1, l2, y2, slope, key } = C;
          return {
            prompt: t`Thesis: **${TITLE.mercury}**. Two exaggerated runs give the advance divided by $\lambda$: $${y1.toFixed(4)}''$ per century at $\lambda = ${l1}$ and $${y2.toFixed(4)}''$ at $\lambda = ${l2}$. The quotient is a straight line in $\lambda$ (a small $\lambda^2$ part of the advance makes it rise). Extrapolate to $\lambda = 0$: what is the general-relativistic advance, in arcseconds per century, to four decimal places?`,
            answer: key, tol: { rel: 0, abs: 0.0003 },
            errors: apart([
              { value: y1, feedback: t`That is the $\lambda = ${l1}$ run itself. Extend the straight line through both points back to $\lambda = 0$.` },
              { value: (y1 + y2) / 2, feedback: 'Averaging the two runs keeps the λ² bias; extrapolate to λ = 0 instead.' },
              { value: y1 + slope * l1, feedback: t`Wrong direction: the line rises with $\lambda$, so at $\lambda = 0$ it lies **below** both points.` },
            ], key, 1e-5, 1e-6),
            hints: [t`The slope is $(${y2.toFixed(4)} - ${y1.toFixed(4)})/(${l2} - ${l1})$ per unit $\lambda$.`, t`The intercept is $${y1.toFixed(4)} - \text{slope}\times${l1}$.`],
            teach: t`Exaggerate an effect too small to resolve, then extrapolate the scaled result back to the true value — the λ² part drops out at λ = 0.`,
            explain: t`Slope $= {${sci(slope, 4)}}''$ per century per unit $\lambda$, so the intercept is $${y1.toFixed(4)} - ${sci(slope, 4)}\times${l1} = ${key.toFixed(4)}''$ per century — the formula’s $${FORMULA.toFixed(4)}''$ and the published $42.98''$.`,
            visual: lamPic([[l1, y1], [l2, y2]], 'The two exaggerated runs: the advance divided by λ (″ per century, vertical) against λ. The line back to λ = 0 is yours to draw.'),
          };
        },
      }),
      code({
        id: 'r2-code', skill: 'research.R6.1', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r2-code', v), C = codeCase(P);
          return {
            prompt: C.prompt, starter: C.starter, answer: C.answer, tests: C.tests, hints: C.hints,
            teach: t`A straight-line fit to many synthetic readings turns the model’s equation into a measurement — and a clean input with a known answer tests the code before the noisy one does.`,
            explain: C.explain,
          };
        },
      }),
      mcq({
        id: 'r2-check', skill: 'research.R5.1', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r2-check', v), C = checkCase(r, P);
          const same = t`Rerunning the script reproduces the result to every digit, on two different computers`;
          const sameWhy = t`That shows the analysis is reproducible, not that it is right: a biased pipeline returns the same biased number every time.`;
          if (P === 'gw') {
            return {
              prompt: t`Thesis: **${TITLE.gw}**. Your pipeline returns $\mathcal M = ${C.v} \pm ${C.s}\,M_\odot$ from the synthetic chirp built with $30.4\,M_\odot$. A referee asks how you know it measures the chirp mass, rather than returning something near 30 whatever the data hold. Which reply is strongest?`,
              choices: [
                t`Chirps of other known masses, $${C.inj[0]}$ and $${C.inj[1]}\,M_\odot$, injected into fresh noise and analysed blind, come back within their uncertainties`,
                t`The result agrees with the published $30.4\,M_\odot$, well inside the uncertainties`,
                same,
                t`The peak SNR is far above anything the noise alone produces, so the signal is unmistakable`,
              ],
              answer: 0,
              why: { 1: t`The data were built with 30.4: a pipeline that ignored them and printed 30 would agree too. A check must be able to fail.`, 2: sameWhy, 3: t`Significance says a chirp is present; it says nothing about whether its mass comes out unbiased.` },
              hints: ['Which of these tests could the pipeline fail if it were broken?', 'Feed it an input whose right answer is known and different from the published one.'],
              teach: t`A check is evidence only if it could have failed: inject a known input that differs from the published value (or no signal at all) and see the pipeline return it.`,
              explain: t`Injection and recovery at other masses is a test the pipeline could fail: a bias toward 30, a units slip or a bank that never reaches 22 would all show. Agreement with 30.4 cannot, because the data were built with it. LIGO validates its searches the same way, with thousands of simulated signals injected into real noise.`,
              visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 1, seed: 3, panels: ['data', 'snr'], controls: false, readout: false }, caption: 'A synthetic one-second record hiding a 30 M☉ chirp (top) and the matched filter’s output (bottom). The simulation’s noise, not the thesis’s data.' },
            };
          }
          if (P === 'transit') {
            return {
              prompt: t`Thesis: **${TITLE.transit}**. Your pipeline returns $R_p = ${C.v.toFixed(2)} \pm ${C.s.toFixed(2)}\,R_\oplus$ from synthetic photometry built with the published radius ratio. A referee asks how you know the detrending and folding do not distort the depth. Which reply is strongest?`,
              choices: [
                t`Transits of other known depths, ${C.inj[0]} and ${C.inj[1]} ppm, and a light curve with no transit at all, injected into fresh noise, come back within their uncertainties — zero for the empty one`,
                t`The radius agrees with the published $1.47\,R_\oplus$, well inside the uncertainties`,
                same,
                t`The folded transit looks clean and box-shaped, with no trace of the stellar wobble left`,
              ],
              answer: 0,
              why: { 1: t`The data were built with the published ratio: agreement is what a working pipeline must give, but a test must be able to fail.`, 2: sameWhy, 3: t`A fold can look clean while a detrending filter has eaten a third of the depth — a filter narrower than the transit does exactly that. Only a number tested against a known input shows it.` },
              hints: ['Which of these tests could the pipeline fail if it were broken?', 'Feed it inputs whose right answers are known — including zero.'],
              teach: t`A check is evidence only if it could have failed: inject a known input that differs from the published value (or no signal at all) and see the pipeline return it.`,
              explain: t`Injection and recovery tests exactly what the referee doubts: a filter that eats part of the transit would return too little depth at every injected value, and a pipeline that invents dips would find one where there is none. Kepler’s planet statistics rest on this kind of test.`,
              visual: foldPic('A synthetic folded transit with its box model (gold). Whether the pipeline kept all of the depth cannot be seen by eye.'),
            };
          }
          const rt = C.rtol === 1e-10 ? t`10^{-10}` : t`10^{-12}`;
          return {
            prompt: t`Thesis: **${TITLE.mercury}**. Your integration (solver tolerance $\text{rtol} = ${rt}$) reproduces $42.98''$ per century. A referee asks how you know the advance comes from the relativistic term and not from the integrator. Which reply is strongest?`,
            choices: [
              t`With the relativistic term switched off ($\lambda = 0$) the same code gives $${C.drift}''$ per century — ${C.pct < 0.01 ? C.pct.toFixed(3) : C.pct.toFixed(2)}% of the signal — and the advance grows in proportion to $\lambda$, as the physics requires`,
              t`The result matches the published $42.98''$ to all four significant figures`,
              same,
              t`DOP853, an eighth-order method, is well tested and widely used for orbits`,
            ],
            answer: 0,
            why: { 1: t`Matching the number you were aiming for could be luck or tuning; the referee asks for a test that could have failed.`, 2: sameWhy, 3: t`A good method can still be misused — too loose a tolerance, a wrong initial condition. Only tests on this problem show it worked here.` },
            hints: ['Which of these tests could the integration fail if the integrator were the cause?', 'What should a Newton-only orbit do?'],
            teach: t`A check is evidence only if it could have failed: switch the effect off and see the result vanish, or vary it and see the result scale.`,
            explain: t`A null test could have failed: at a looser tolerance ($\text{rtol} = 10^{-8}$) the same code reports $4.7''$ of fake precession per century. At $\text{rtol} = ${rt}$ the drift is $${C.drift}''$, far below the $43''$ signal, and the linear growth with $\lambda$ is a second test the physics had to pass.`,
            visual: orbitPic('Newton plus the relativistic term, exaggerated hundreds of thousands of times so the turning shows. An integrator’s error can turn an orbit too.'),
          };
        },
      }),
    ],
  },
  {
    title: 'The budget and the verdict',
    story: t`A number without an uncertainty can neither agree nor disagree with anything. Build the budget, put your result beside the published one in standard deviations, and decide what the agreement does — and does not — establish.`,
    items: [
      num({
        id: 'r3-budget', skill: 'research.R8.2', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r3-budget', v), C = budgetCase(r, P);
          if (P === 'gw') {
            const { v: M, a, b, key } = C, fd = fdot(M, 100);
            return {
              prompt: t`Thesis: **${TITLE.gw}**. Your chirp mass, $\mathcal M = ${M}\,M_\odot$, comes from the frequency and its rate of rise at one moment of the synthetic chirp, through $$\mathcal M \propto \bigl(f^{-11/3}\,\dot f\bigr)^{3/5}.$$ Your fit gives $f$ to ${a}% and $\dot f$ to ${b}% (independent standard uncertainties). What is the standard uncertainty of $\mathcal M$, in solar masses?`,
              answer: key, units: 'Msun', tol: { rel: 0.02 },
              errors: apart([
                { value: (M * 0.6 * ((11 / 3) * a + b)) / 100, feedback: 'Independent uncertainties add in quadrature, not linearly.' },
                { value: (M * Math.hypot((11 / 3) * a, b)) / 100, feedback: t`The outer power $3/5$ multiplies every relative uncertainty: include it.` },
                { value: (M * 0.6 * Math.hypot(a, b)) / 100, feedback: t`A power multiplies a relative uncertainty: $f^{-11/3}$ carries $\tfrac{11}{3}$ times the ${a}% of $f$.` },
              ], key),
              hints: [t`For $q \propto x^p y^s$, $\;\sigma_q/q = \sqrt{(p\,\sigma_x/x)^2 + (s\,\sigma_y/y)^2}$.`, t`Here the powers are $\tfrac35\cdot\tfrac{11}{3} = \tfrac{11}{5}$ on $f$ and $\tfrac35$ on $\dot f$.`, t`So $\sigma_{\mathcal M}/\mathcal M = \sqrt{(\tfrac{11}{5}\times${a}\%)^2 + (\tfrac35\times${b}\%)^2}$.`],
              teach: t`Each input enters a budget weighted by its power in the formula, and independent entries add in quadrature — so a steep power can make a small input uncertainty dominate.`,
              explain: t`$\sigma_{\mathcal M}/\mathcal M = \sqrt{(${(2.2 * a).toFixed(2)}\%)^2 + (${(0.6 * b).toFixed(2)}\%)^2} = ${((100 * key) / M).toFixed(2)}\%$, so $\sigma_{\mathcal M} = ${key.toFixed(2)}\,M_\odot$. ${2.2 * a > 0.6 * b ? t`The frequency, though better measured, dominates: its power $\tfrac{11}{5}$ amplifies it.` : t`The rate $\dot f$ dominates — that is the entry to work on.`} The picture propagates the same inputs by Monte Carlo at $f = 100$ Hz.`,
              visual: mcPic('((5/96)*pi^(-8/3)*x^(-11/3)*y)^0.6/0.000004925491', [100, a], [r6(fd), r6((fd * b) / 100)], ['f (Hz)', 'ḟ (Hz/s)', 'chirp mass (M☉)'], t`Monte Carlo propagation: each dot one draw of $f$ and $\dot f$ (at 100 Hz on your chirp) with your relative uncertainties, the histogram the chirp masses they give. The dashed curve is linear propagation.`),
            };
          }
          if (P === 'transit') {
            const { d, sd, Rp, key } = C;
            return {
              prompt: t`Thesis: **${TITLE.transit}**. Your fit to the synthetic light curve gives a depth $\delta = ${d} \pm ${sd}$ ppm, and the star’s radius is $R_\star = 1.065 \pm 0.009\,R_\odot$ (asteroseismology; independent). With $R_p = \sqrt\delta\,R_\star$ and $1\,R_\odot = 109.08\,R_\oplus$, $R_p = ${Rp.toFixed(3)}\,R_\oplus$. What is its standard uncertainty, in Earth radii?`,
              answer: key, tol: { rel: 0.02 },
              errors: apart([
                { value: Rp * Math.hypot(sd / d, SRSTAR / RSTAR), feedback: t`The square root halves the depth’s relative uncertainty: $\tfrac12\,\sigma_\delta/\delta$.` },
                { value: Rp * (sd / (2 * d) + SRSTAR / RSTAR), feedback: 'Independent uncertainties add in quadrature, not linearly.' },
                { value: (Rp * sd) / (2 * d), feedback: t`Include the star: $R_\star$’s 0.85% is a second, independent entry.` },
              ], key),
              hints: [t`For $R_p \propto \delta^{1/2}R_\star$: $\;\sigma_{R_p}/R_p = \sqrt{(\tfrac12\sigma_\delta/\delta)^2 + (\sigma_{R_\star}/R_\star)^2}$.`, t`$\tfrac12\times${sd}/${d} = ${((50 * sd) / d).toFixed(2)}\%$ and $0.009/1.065 = 0.85\%$.`],
              teach: t`Each input enters a budget weighted by its power in the formula, and independent entries add in quadrature: the square root halves the depth’s share.`,
              explain: t`$\sigma_{R_p}/R_p = \sqrt{(${((50 * sd) / d).toFixed(2)}\%)^2 + (0.85\%)^2} = ${((100 * key) / Rp).toFixed(2)}\%$, so $\sigma_{R_p} = ${key.toFixed(3)}\,R_\oplus$. The depth dominates: more transits (or quieter photometry) would help; a better star would barely move it.`,
              visual: mcPic('sqrt(x/1000000)*y*109.08', [d, sd], [RSTAR, SRSTAR], ['depth (ppm)', 'R★ (R☉)', 'Rₚ (R⊕)'], t`Monte Carlo propagation: each dot one draw of the depth and the star’s radius with their uncertainties, the histogram the planet radii they give. The dashed curve is linear propagation.`),
            };
          }
          const { d, D, e, fine, coarse, u, key } = C;
          return {
            prompt: t`Thesis: **${TITLE.mercury}**. Your result’s budget has three independent entries, in arcseconds per century: the integrator’s drift from the null test, $${d.toFixed(4)}''$; the extrapolation to $\lambda = 0$, $${e.toFixed(4)}''$; and the step size. For that one, fixed-step RK4 runs (order 4) at 1000 and 2000 steps per orbit give $${coarse.toFixed(4)}''$ and $${fine.toFixed(4)}''$. Estimate the error left in the finer run from the two, then combine the three entries. What is the total standard uncertainty, in arcseconds per century?`,
            answer: key, tol: { rel: 0.02 },
            errors: apart([
              { value: Math.sqrt(d * d + D * D + e * e), feedback: t`The difference of the two runs is mostly the **coarse** run’s error. For order 4, the error left in the fine run is the difference divided by $2^4 - 1 = 15$.` },
              { value: d + u + e, feedback: 'Independent uncertainties add in quadrature, not linearly.' },
              { value: Math.hypot(d, e), feedback: 'Include the step-size entry, estimated from the two runs.' },
            ], key, 0.05),
            hints: [t`Richardson: with order $p$, the fine run’s error is about $|q_N - q_{2N}|/(2^p - 1)$.`, t`Here $(${coarse.toFixed(4)} - ${fine.toFixed(4)})/15 = ${u.toFixed(5)}''$.`, t`Then $\sqrt{d^2 + u^2 + e^2}$ with all three in the same units.`],
            teach: t`A simulation’s budget is numerical: drift, discretization (from a resolution study) and any extrapolation, combined in quadrature like any other entries.`,
            explain: t`The step-size entry is $${D.toFixed(4)}/15 = ${u.toFixed(5)}''$, so the total is $\sqrt{${d.toFixed(4)}^2 + ${u.toFixed(5)}^2 + ${e.toFixed(4)}^2} = ${key.toFixed(5)}''$ per century — about ${((100 * key) / 42.98).toFixed(3)}% of the signal. Constants such as $GM_\odot$ and Mercury’s orbit are known far better and stay out of the budget.`,
            visual: { type: 'graph', params: { x: [2.8, 3.5], y: [r6(fine - 0.25 * D), r6(coarse + 0.3 * D)], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'steps per orbit', ylabel: '', xticks: 3, yticks: 4, points: [{ x: 3, y: coarse, color: 'accent', r: 5, label: 'N = 1000', labelDx: 8, labelDy: -6 }, { x: r6(Math.log10(2000)), y: fine, color: 'accent', r: 5, label: 'N = 2000', labelDx: -64, labelDy: -8 }] }, caption: 'The two resolution runs of your study (fixed-step RK4): the advance in ″ per century against steps per orbit. Halving the step shrinks a fourth-order error sixteenfold.' },
          };
        },
      }),
      num({
        id: 'r3-tension', skill: 'research.R0.1', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r3-tension', v), C = tensionCase(r, P), { v: x, s, sp, key } = C;
          const d = Math.abs(x - pubValue(P));
          if (P === 'gw') {
            const side = x >= MC_PUB ? MC_UP : MC_LO;
            return {
              prompt: t`Thesis: **${TITLE.gw}**. Your synthetic-data result is $\mathcal M = ${x.toFixed(1)} \pm ${s.toFixed(1)}\,M_\odot$ (one standard deviation). The published detector-frame value is $30.4^{+2.1}_{-1.9}\,M_\odot$ — a median with a **90% credible** interval, which for a Gaussian spans $\pm 1.645\sigma$. Using the side of the published interval that faces your value, by how many standard deviations do the two differ?`,
              answer: key, tol: { rel: 0.02 },
              errors: apart([
                { value: d / Math.hypot(s, side), feedback: t`The published interval is a 90% interval, not $1\sigma$: divide $${side}$ by $1.645$ first.` },
                { value: d / (s + sp), feedback: 'Independent uncertainties combine in quadrature, not linearly.' },
                { value: d / s, feedback: 'The published value has an uncertainty too: combine both in quadrature.' },
                { value: d / Math.hypot(s, (x >= MC_PUB ? MC_LO : MC_UP) / Z90), feedback: t`Use the side of the interval that faces your value: it lies ${x >= MC_PUB ? 'above' : 'below'} 30.4, so the ${x >= MC_PUB ? t`$+2.1$` : t`$-1.9$`} side.` },
              ], key),
              hints: [t`Convert: $\sigma_{\text{pub}} = ${side}/1.645 = ${sp.toFixed(2)}\,M_\odot$.`, t`$z = |\mathcal M - 30.4|/\sqrt{\sigma^2 + \sigma_{\text{pub}}^2}$.`],
              teach: t`Agreement is a number: the difference over the combined uncertainty — after converting every interval to the same convention.`,
              explain: t`$\sigma_{\text{pub}} = ${side}/1.645 = ${sp.toFixed(2)}$, so $z = ${d.toFixed(1)}/\sqrt{${s.toFixed(1)}^2 + ${sp.toFixed(2)}^2} = ${key.toFixed(2)}$. ${key < 2 ? 'Consistent: a difference this size happens by chance often.' : 'Worth a look: before claiming anything, hunt for a difference in inputs or conventions.'} Taking the 90% half-width as if it were $1\sigma$ would have made the agreement look better than it is.`,
              visual: comparePic({ ...cmp(P, x, s), ylabel: YLAB[P], caption: CMPCAP[P] }),
            };
          }
          if (P === 'transit') {
            const side = x >= RP_PUB ? RP_UP : RP_LO;
            return {
              prompt: t`Thesis: **${TITLE.transit}**. Your synthetic-data result is $R_p = ${x.toFixed(2)} \pm ${s.toFixed(2)}\,R_\oplus$ (one standard deviation). Dumusque et al. (2014) give $1.47^{+0.03}_{-0.02}\,R_\oplus$ (one standard deviation, each side). Using the side of the published interval that faces your value, by how many standard deviations do the two differ?`,
              answer: key, tol: { rel: 0.02 },
              errors: apart([
                { value: d / (s + sp), feedback: 'Independent uncertainties combine in quadrature, not linearly.' },
                { value: d / s, feedback: 'The published value has an uncertainty too: combine both in quadrature.' },
                { value: d / Math.hypot(s, x >= RP_PUB ? RP_LO : RP_UP), feedback: t`Use the side facing your value: it lies ${x >= RP_PUB ? 'above' : 'below'} 1.47, so the ${x >= RP_PUB ? t`$+0.03$` : t`$-0.02$`} side.` },
              ], key),
              hints: [t`The published side facing ${x.toFixed(2)} is $${side}\,R_\oplus$.`, t`$z = |R_p - 1.47|/\sqrt{\sigma^2 + \sigma_{\text{pub}}^2}$.`],
              teach: t`Agreement is a number: the difference over the combined uncertainty, using the side of an asymmetric interval that faces the other value.`,
              explain: t`$z = ${d.toFixed(2)}/\sqrt{${s.toFixed(2)}^2 + ${side}^2} = ${key.toFixed(2)}$. ${key < 2 ? 'Consistent: a difference this size happens by chance often.' : 'Worth a look: before claiming anything, hunt for a difference in inputs or conventions — the stellar radius first.'}`,
              visual: comparePic({ ...cmp(P, x, s), ylabel: YLAB[P], caption: CMPCAP[P] }),
            };
          }
          return {
            prompt: t`Thesis: **${TITLE.mercury}**. Your integration gives $${x.toFixed(4)}'' \pm ${s.toFixed(4)}''$ per century (numerical uncertainty, one standard deviation). The formula $6\pi GM/(c^2a(1-e^2))$ per orbit, with the same constants, gives $${FORMULA.toFixed(4)}''$ — exact for this model, so it carries no uncertainty of its own (Will’s $42.98''$ is the same number rounded). By how many standard deviations do they differ?`,
            answer: key, tol: { rel: 0.02 },
            errors: apart([
              { value: Math.abs(x - 42.98) / s, feedback: t`Compare with the formula’s full $${FORMULA.toFixed(4)}''$: the rounded $42.98''$ is quoted to the nearest $0.01''$, ten times coarser than your uncertainty.` },
              { value: d / (Math.SQRT2 * s), feedback: 'The formula’s value is exact: only your uncertainty enters.' },
            ], key),
            hints: [t`$z = |A - ${FORMULA.toFixed(4)}|/\sigma$, since the formula has no uncertainty.`, t`Here $|A - ${FORMULA.toFixed(4)}| = ${d.toFixed(4)}''$.`],
            teach: t`Agreement is a number — the difference over the combined uncertainty — and the comparison must be made at the precision of the better number, not a rounded one.`,
            explain: t`$z = ${d.toFixed(4)}/${s.toFixed(4)} = ${key.toFixed(2)}$. ${key < 2 ? 'Consistent with the formula.' : 'More than your budget allows: look for a missed entry (the λ² part? the orbit averaging?) before claiming anything.'} Rounded to $42.98''$ the published number could not tell such differences apart; the formula can.`,
            visual: comparePic({ ...cmp(P, x, s), ylabel: YLAB[P], caption: CMPCAP[P] }),
          };
        },
      }),
      mcq({
        id: 'r3-verdict', skill: 'research.R7.2', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r3-verdict', v), C = verdictCase(r, P), { v: x, s, z } = C;
          const val = P === 'gw' ? t`$\mathcal M = ${x.toFixed(1)} \pm ${s.toFixed(1)}\,M_\odot$` : P === 'transit' ? t`$R_p = ${x.toFixed(2)} \pm ${s.toFixed(2)}\,R_\oplus$` : t`$${x.toFixed(4)}'' \pm ${s.toFixed(4)}''$ per century`;
          const pub = P === 'gw' ? t`$30.4^{+2.1}_{-1.9}\,M_\odot$` : P === 'transit' ? t`$1.47^{+0.03}_{-0.02}\,R_\oplus$` : t`formula’s $${FORMULA.toFixed(4)}''$`;
          const confirm = {
            gw: [t`It independently confirms GW150914’s published chirp mass: two analyses now agree`, t`The synthetic chirp was built with $30.4\,M_\odot$, so a working pipeline had to find it. Confirming the event’s mass needs the real strain data — a replication, with new data.`],
            transit: [t`It independently confirms Kepler-10b’s published radius: two analyses now agree`, t`The synthetic light curve was built with the published ratio, so a working pipeline had to find it. Confirming the planet’s radius needs the real Kepler photometry.`],
            mercury: [t`It confirms general relativity: the simulated orbit turns by just the observed amount`, t`You reproduced a prediction of general relativity from general relativity’s own equation. The test of the theory is the comparison with the observed anomaly — which your project did not make.`],
          }[P];
          const combine = {
            gw: [t`It can now be combined with the published value to shrink the chirp mass’s uncertainty`, t`Your data contain nothing about the real event — only the number that was put in. Combining would count the published information twice.`],
            transit: [t`It can now be combined with the published value to shrink the radius’s uncertainty`, t`Your light curve holds no new photons from Kepler-10: only the ratio that was put in. Combining would count the published information twice.`],
            mercury: [t`Your error bar must be too large, since the agreement is closer than one standard deviation`, t`One comparison within $1\sigma$ happens two times in three. Only many comparisons — say a $\chi^2$ over many runs — could show the bars are too large.`],
          }[P];
          return {
            prompt: t`Thesis: **${TITLE[P]}**. Your result, ${val}, lies within $${z.toFixed(1)}\sigma$ of the published ${pub}. What does this agreement establish?`,
            choices: [
              t`That your analysis reproduces the published number from data built with it — a check of the method, not a new measurement of nature`,
              confirm[0],
              combine[0],
              P === 'mercury' ? t`The published uncertainty can now be reduced, since a second, independent calculation agrees` : t`Your error bar must be too large, since the agreement is closer than one standard deviation`,
            ],
            answer: 0,
            why: {
              1: confirm[1],
              2: combine[1],
              3: P === 'mercury' ? t`The formula’s value is exact for the model, and the observed $42.98''$’s uncertainty is set by decades of planetary ranging; your simulation adds no observations.` : t`One comparison within $1\sigma$ happens two times in three. Only many comparisons — a $\chi^2$ over many injections — could show the bars are too large.`,
            },
            hints: ['Where did the synthetic data come from?', 'What would a new, independent measurement need that this project did not have?'],
            teach: t`Agreement on synthetic data built from the published value validates the method; only new data can replicate the measurement.`,
            explain: t`The data were built from the published value, so agreement within $${z.toFixed(1)}\sigma$ shows the pipeline works — a **reproduction** of the method. A **replication** of the result needs new data: ${P === 'gw' ? 'the real LIGO strain, whitened against its coloured noise' : P === 'transit' ? 'the real Kepler light curve, with a limb-darkened transit model' : 'the observed perihelion, with planets and the reference frame put back in'}. Saying so is what makes the thesis honest.`,
            visual: comparePic({ ...cmp(P, x, s), ylabel: YLAB[P], caption: CMPCAP[P] }),
          };
        },
      }),
    ],
  },
  {
    title: 'Present it',
    story: t`The committee looks at one figure, reads one sentence of the abstract, and asks whether anyone else could get your number again. Make each of them honest.`,
    items: [
      mcq({
        id: 'r4-figure', skill: 'research.R2.2', difficulty: 2,
        gen(r, v) {
          const P = projectOf(r, 'r4-figure', v), C = verdictCase(r, P), flaw = r.pick(['nobars', 'nocompare']);
          const bars = t`Draw the error bars — yours and the published interval, with its confidence level stated: without them nobody can judge agreement, and the zoomed axis makes a small gap look large`;
          const pub = t`Mark the published value, with its interval, on the same axis: the figure’s claim is a comparison, and it shows only one side of it`;
          const answer = flaw === 'nobars' ? 0 : 1;
          return {
            prompt: t`Thesis: **${TITLE[P]}**. This is the draft of the key figure: your synthetic-data result, to be judged against the published value. What must change before it goes in the thesis?`,
            choices: [bars, pub, t`Use a logarithmic vertical axis, so that values of any size sit comfortably on one scale`, t`Start the vertical axis at zero, so that the difference between the two cannot look exaggerated`],
            answer,
            why: {
              ...(flaw === 'nobars' ? { 1: t`The published value is there (gold). What is missing is how uncertain each number is.` } : { 0: t`Your point has its error bar. What is missing is the number it is meant to agree with.` }),
              2: t`A logarithmic axis suits quantities spanning decades. These differ by a few per cent; a log axis would change nothing that matters.`,
              3: t`For points with error bars a zoomed axis is right — the bars set the scale. At zero both points would squash into one line, hiding the very comparison the figure makes.`,
            },
            hints: ['What does a reader need to see to decide, by eye, whether the two numbers agree?', 'Check the picture for each of: both values, both uncertainties.'],
            teach: t`A comparison figure must show both values and both uncertainties, with the interval’s convention stated; only then is a zoomed axis honest.`,
            explain: flaw === 'nobars'
              ? t`Without error bars the zoomed axis turns a difference of $${C.z.toFixed(1)}\sigma$ into what looks like a gulf. With both bars drawn — the published one converted to the same convention, or labelled as what it is — the reader sees at once that they overlap.`
              : t`The thesis claims agreement with the published value, so the figure must show that value with its interval on the same axis; a lone point with an error bar asks the reader to take the comparison on trust.`,
            visual: comparePic({ ...cmp(P, C.v, C.s), ylabel: YLAB[P], flaw, caption: 'The draft figure, as the student drew it.' }),
          };
        },
      }),
      mcq({
        id: 'r4-abstract', skill: 'research.R8.2', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r4-abstract', v), C = abstractCase(r, P), { v: x, s, z, dec, vLong, sLong } = C;
          const X = x.toFixed(dec), S = s.toFixed(dec), Z = z.toFixed(1);
          const L = {
            gw: {
              good: t`“On synthetic data built with GW150914’s published parameters, a leading-order matched filter recovers $\mathcal M = ${X} \pm ${S}\,M_\odot$ (detector frame), within $${Z}\sigma$ of the published $30.4^{+2.1}_{-1.9}\,M_\odot$: a check of the method, not a new measurement of the event.”`,
              long: t`“We measure GW150914’s chirp mass to be $${vLong} \pm ${sLong}\,M_\odot$, consistent with the published $30.4\,M_\odot$.”`,
              conf: t`“Our matched-filter analysis confirms the chirp mass of GW150914, in excellent agreement with LIGO’s published value.”`,
              prove: t`“On synthetic data our pipeline finds $\mathcal M = ${X}\,M_\odot$, proving the published value of $30.4\,M_\odot$ correct.”`,
              pic: trackPic(MC_PUB, 'The thesis’s key fit: 40 synthetic frequency readings with 1.5% scatter (grey), the chirp they were built from (blue) and the fitted chirp (gold, dashed). Leading order, no merger.', { fit: x, scatter: 0.015 }),
            },
            transit: {
              good: t`“On synthetic photometry built with Kepler-10b’s published parameters, our detrend–search–fold pipeline recovers $R_p = ${X} \pm ${S}\,R_\oplus$, within $${Z}\sigma$ of the published $1.47^{+0.03}_{-0.02}\,R_\oplus$: a check of the method, not a new measurement of the planet.”`,
              long: t`“We measure Kepler-10b’s radius to be $${vLong} \pm ${sLong}\,R_\oplus$, consistent with the published $1.47\,R_\oplus$.”`,
              conf: t`“Our detrend–search–fold analysis confirms the radius of Kepler-10b, in excellent agreement with the published value.”`,
              prove: t`“On synthetic data our pipeline finds $R_p = ${X}\,R_\oplus$, proving the published radius of $1.47\,R_\oplus$ correct.”`,
              pic: foldPic('The thesis’s key fit: the synthetic folded transit (grey) and the fitted box (gold). No limb darkening.'),
            },
            mercury: {
              good: t`“Integrating Newtonian gravity plus the leading relativistic term, with a null test bounding the integrator’s drift, we find a perihelion advance of $${X}'' \pm ${S}''$ per century for Mercury, within $${Z}\sigma$ of the formula’s $${FORMULA.toFixed(4)}''$ (the published $42.98''$); planets and the reference frame were left out.”`,
              long: t`“We find Mercury’s relativistic perihelion advance to be $${vLong}'' \pm ${sLong}''$ per century, consistent with the published $42.98''$.”`,
              conf: t`“Our numerical integration of Mercury’s orbit confirms general relativity, in excellent agreement with observation.”`,
              prove: t`“Our integration gives $${X}''$ per century, proving the published $42.98''$ correct.”`,
              pic: lamPic(PER, 'The thesis’s key fit: the advance divided by λ (″ per century, vertical) from the exaggerated runs (gold) and the straight line back to λ = 0 (dashed).', { fit: true }),
            },
          }[P];
          return {
            prompt: t`Thesis: **${TITLE[P]}**. Which sentence should carry the result in the abstract?`,
            choices: [L.good, L.long, L.conf, L.prove],
            answer: 0,
            why: {
              1: t`Digits far beyond the uncertainty (round it to one or two significant figures, and the value to match) — and “we measure” hides that the data were synthetic, so it reads as a measurement of nature.`,
              2: t`No number, no uncertainty, and “confirms”: data built from the published value cannot confirm it, and “excellent agreement” is an adjective where a number of $\sigma$ belongs.`,
              3: t`No uncertainty, and “proving”: agreement on data built from that value proves only that the pipeline works.`,
            },
            hints: ['Look for: the number with its uncertainty, at sensible precision; the agreement in σ; and what the data were.', 'Rule out every sentence that claims more than synthetic data can support.'],
            teach: t`The result sentence gives the number with its uncertainty at matching precision, the agreement in standard deviations, and the limits of what was done.`,
            explain: t`The good sentence is checkable in every part: the data (synthetic), the method, the number with an uncertainty rounded to it, the comparison in $\sigma$, and the honest scope. A referee can disagree with it — which is what makes it a result.`,
            visual: L.pic,
          };
        },
      }),
      multi({
        id: 'r4-repro', skill: 'research.R7.1', difficulty: 3,
        gen(r, v) {
          const P = projectOf(r, 'r4-repro', v), seed = r.int(1, 99999);
          const knob = {
            gw: t`The template bank: its range and its spacing in chirp mass`,
            transit: t`The running-median filter’s width (49 points, one day) and the trial-period grid`,
            mercury: t`The solver, its tolerance \`rtol\`, and the values of $\lambda$ extrapolated from`,
          }[P];
          return {
            prompt: t`Thesis: **${TITLE[P]}**. Another student must regenerate your number, digit for digit, a year from now. Your notebook’s cells were run in the order shown. Which of these must the thesis’s data-and-code statement record? Select all.`,
            choices: [
              t`The seed of the generator that made the synthetic data, \`np.random.default_rng(${seed})\``,
              t`The commit, or a tag such as \`thesis-v1\`, of the code that produced the number`,
              t`The versions of Python, NumPy and SciPy`,
              knob,
              t`The final figure, as a high-resolution image`,
              t`The notebook as last saved, with its outputs`,
            ],
            answer: [0, 1, 2, 3],
            why: {
              4: t`A picture of the result, not the means to make it: nobody can regenerate a number from a PNG.`,
              5: t`Its cells ran out of order (picture), so the saved outputs may come from a state no top-to-bottom run produces. The test is Restart & Run All; the record is the code, its inputs and its environment.`,
            },
            hints: ['What would change the number if it were different on someone else’s machine?', 'Randomness, code, environment and every analysis choice — not the outputs.'],
            teach: t`A number is reproducible only when its code version, its data (or the seed that makes them), its environment and every analysis setting are recorded.`,
            explain: t`Seed, commit, environment and the analysis settings together regenerate the number; a figure or a saved notebook only shows it. Run the notebook top to bottom from a fresh kernel before you tag it.`,
            visual: nbPic(P, 'Your notebook: each cell’s place on the page (top cell highest) against the order it was run. The figure cell ran before the fit was redone.'),
          };
        },
      }),
    ],
  },
];
{ let k = 0; for (const R of ROUNDS) for (const it of R.items) SLOT[it.id] = k++; }

export default boss({
  title: 'The Mini-Thesis',
  intro: t`A mini-thesis is research in miniature: **one published number**, reproduced from data you understand completely, and presented with an uncertainty a referee can check. Three projects are on the shelf — **${TITLE.gw}** from a synthetic gravitational-wave chirp, **${TITLE.transit}** from a synthetic transit, and **${TITLE.mercury}** from your own integration — and each attempt draws one of them, so a retry is a new thesis. Four rounds take it from the question to the abstract: scope it, reproduce it, judge it, present it. Twelve problems, one of them in code; no hints, one try each. Every data set is synthetic, built from the published values, and every problem says so.`,
  pass: 0.7,
  rounds: ROUNDS,
});
