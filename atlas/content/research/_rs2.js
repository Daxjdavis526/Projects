// Picture builders and shared numbers for research.R7–R9 and the miniature
// projects research.P.*, all drawn with the `graph` simulation: a commit
// history being bisected, a notebook's execution order against its page
// order, page layouts (posters, reports, proposals) as shaded blocks, and a
// few small numerical helpers. Each builder returns a visual spec; the lesson
// supplies the caption.

/** Round for display inside expressions (keeps generated specs short). */
export const r6 = (v) => +(+v).toPrecision(6);

/** A number as TeX with a ×10ⁿ exponent when it needs one. */
export function sci(x, d = 3) {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -2 && e <= 4) return (+x.toPrecision(d)).toString();
  const m = x / 10 ** e;
  return `${(+m.toPrecision(d)).toString()}\\times10^{${e}}`;
}

// ----------------------------------------------------------- bisection ---
/**
 * git bisect on commits 0 … N, where 0 is known good and N known bad and the
 * first bad commit is `culprit` (1 ≤ culprit ≤ N). Returns the steps:
 * [{ lo, hi }] before each test, then the test made ({ mid, bad }).
 */
export function bisect(N, culprit) {
  let lo = 0, hi = N;
  const steps = [];
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2), bad = mid >= culprit;
    steps.push({ lo, hi, mid, bad });
    if (bad) hi = mid; else lo = mid;
  }
  steps.push({ lo, hi, mid: null, bad: null });
  return steps;
}

/**
 * A commit history as dots along the x-axis, the analysis result of each
 * tested commit at its height. `steps` from bisect(); `key` is a slider key
 * (the number of tests run) or null for a static picture of the first
 * `upto` tests. good/bad are the two result values.
 */
export function commitLine({ N, culprit, good, bad, y, key = null, upto = 0, ylabel = 'result', shadeLast = true, unknownY }) {
  const steps = bisect(N, culprit);
  const nTests = steps.length - 1;
  const uy = unknownY ?? y[0] + 0.12 * (y[1] - y[0]);
  const live = (j) => (key ? `step(${key} - ${j} + 0.5)` : (j <= upto ? 1 : 0));
  const at = (j) => (key ? `step(0.5 - abs(${key} - ${j}))` : (j === upto ? 1 : 0));
  const tested = new Map();
  steps.slice(0, nTests).forEach((s, j) => tested.set(s.mid, j + 1));
  const points = [];
  for (let i = 0; i <= N; i++) {
    if (i === 0) { points.push({ x: 0, y: good, color: 'good', r: 4.5, label: 'good', labelDx: 6, labelDy: -8 }); continue; }
    if (i === N) { points.push({ x: N, y: bad, color: 'bad', r: 4.5, label: 'bad', labelDx: -30, labelDy: -8 }); continue; }
    const j = tested.get(i);
    if (j) {
      const v = i >= culprit ? bad : good;
      points.push({ x: i, y: v, color: i >= culprit ? 'bad' : 'good', r: 4, when: live(j) });
      points.push({ x: i, y: uy, color: 'ink4', r: 2.5, hollow: true, when: key ? `step(${j} - 0.5 - ${key})` : (j > upto ? 1 : 0) });
    } else points.push({ x: i, y: uy, color: 'ink4', r: 2.5, hollow: true });
  }
  const shade = shadeLast ? steps.map((s, j) => ({ fn: String(y[1]), lower: String(y[0]), from: s.lo + 0.5, to: s.hi + 0.5, color: 'gold', alpha: 0.14, when: at(j) })) : [];
  return {
    steps, nTests,
    params: {
      x: [-1, N + 1.5], y, aspect: 'wide', axesAt: 'edge', xlabel: 'commit number', ylabel, xticks: 6, yticks: 4,
      shade, points,
      hlines: [{ y: good, color: 'good' }, { y: bad, color: 'bad' }],
    },
  };
}

// --------------------------------------------------- notebook order ------
/**
 * A notebook's cells: position on the page (top = 1) against the order they
 * were run (In [n]). cells: [{ page, run, label }] (run null = never run).
 * Arrows join the runs in order.
 */
export function notebookOrder(cells, { caption } = {}) {
  const ran = cells.filter((c) => c.run).sort((a, b) => a.run - b.run);
  const n = cells.length;
  const arrows = [];
  const Y = (c) => n + 1 - c.page;   // the top cell is drawn highest
  for (let i = 1; i < ran.length; i++) arrows.push({ from: [ran[i - 1].run, Y(ran[i - 1])], to: [ran[i].run, Y(ran[i])], color: 'ink3', width: 1.4 });
  const points = ran.map((c) => ({ x: c.run, y: Y(c), color: 'accent', r: 5, label: c.label, labelDx: 9, labelDy: 4 }));
  return {
    type: 'graph',
    params: {
      x: [0.4, ran.length + 1.9], y: [0.4, n + 0.6], aspect: 'wide', axesAt: 'edge', xlabel: 'order run (execution count)', ylabel: 'page: top cell highest', xticks: ran.length, yticks: 0, grid: true,
      arrows, points,
    },
    caption,
  };
}

// ----------------------------------------------------------- page blocks -
/**
 * A page (poster, report, proposal) as labelled blocks. blocks: [{ x0, x1,
 * y0, y1, label, color, alpha, when }] in page units; W, H the page size.
 */
export function pageBlocks(blocks, { W = 1, H = 1, caption, pad = 0.04, extra = {} } = {}) {
  const shade = blocks.map((b) => ({ fn: String(r6(b.y1)), lower: String(r6(b.y0)), from: r6(b.x0), to: r6(b.x1), color: b.color || 'accent', alpha: b.alpha ?? 0.3, ...(b.when !== undefined ? { when: b.when } : {}) }));
  const points = blocks.filter((b) => b.label).map((b) => ({ x: r6((b.x0 + b.x1) / 2), y: r6((b.y0 + b.y1) / 2), r: 0, label: b.label, color: 'ink', labelAlign: 'center', labelDx: 0, labelDy: 0, ...(b.when !== undefined ? { when: b.when } : {}) }));
  const frame = [
    { param: [`${W}*t`, '0'], t: [0, 1], color: 'ink3', width: 1.5 }, { param: [`${W}*t`, String(H)], t: [0, 1], color: 'ink3', width: 1.5 },
    { param: ['0', `${H}*t`], t: [0, 1], color: 'ink3', width: 1.5 }, { param: [String(W), `${H}*t`], t: [0, 1], color: 'ink3', width: 1.5 },
  ];
  return {
    type: 'graph',
    params: { x: [-pad * W, W * (1 + pad)], y: [-pad * H, H * (1 + pad)], axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', ...extra, shade: [...shade, ...(extra.shade || [])], points: [...points, ...(extra.points || [])], curves: [...frame, ...(extra.curves || [])] },
    caption,
  };
}

/** References used by several of these lessons. */
export const SRC2 = {
  nasem: { label: 'National Academies of Sciences, Engineering, and Medicine, Reproducibility and Replicability in Science (The National Academies Press, 2019)', url: 'https://doi.org/10.17226/25303' },
  gitbook: { label: 'S. Chacon & B. Straub, Pro Git, 2nd ed. (Apress, 2014), §7.10 “Debugging with Git” (git bisect)', url: 'https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git' },
  wilson: { label: 'G. Wilson et al., “Good enough practices in scientific computing”, PLoS Comput. Biol. 13(6), e1005510 (2017)', url: 'https://doi.org/10.1371/journal.pcbi.1005510' },
  numpyRng: { label: 'NumPy documentation: Random Generator (numpy.random.default_rng)', url: 'https://numpy.org/doc/stable/reference/random/generator.html' },
  scipyWin: { label: 'SciPy documentation: window functions (scipy.signal.windows)', url: 'https://docs.scipy.org/doc/scipy/reference/signal.windows.html' },
  losc: { label: 'LIGO/GWOSC event tutorial for GW150914 (losc-tutorial/LOSC_Event_tutorial on GitHub)', url: 'https://github.com/losc-tutorial/LOSC_Event_tutorial' },
  gw150914: { label: 'Abbott et al. (LIGO and Virgo), “Observation of gravitational waves from a binary black hole merger”, PRL 116, 061102 (2016), arXiv:1602.03837', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
  gwprops: { label: 'Abbott et al. (LIGO and Virgo), “Properties of the binary black hole merger GW150914”, PRL 116, 241102 (2016), arXiv:1602.03840', url: 'https://doi.org/10.1103/PhysRevLett.116.241102' },
  brout: { label: 'D. Brout et al., “The Pantheon+ analysis: cosmological constraints”, ApJ 938, 110 (2022), arXiv:2202.04077', url: 'https://arxiv.org/abs/2202.04077' },
  scolnic: { label: 'D. Scolnic et al., “The Pantheon+ analysis: the full data set and light-curve release”, ApJ 938, 113 (2022), arXiv:2112.03863', url: 'https://arxiv.org/abs/2112.03863' },
  shoes: { label: 'A. G. Riess et al., “A comprehensive measurement of the local value of the Hubble constant with 1 km/s/Mpc uncertainty from the Hubble Space Telescope and the SH0ES team”, ApJL 934, L7 (2022), arXiv:2112.04510', url: 'https://arxiv.org/abs/2112.04510' },
  planck: { label: 'Planck Collaboration, “Planck 2018 results. VI. Cosmological parameters”, A&A 641, A6 (2020), arXiv:1807.06209', url: 'https://arxiv.org/abs/1807.06209' },
  batalha: { label: 'N. M. Batalha et al., “Kepler’s first rocky planet: Kepler-10b”, ApJ 729, 27 (2011)', url: 'https://doi.org/10.1088/0004-637X/729/1/27' },
  dumusque: { label: 'X. Dumusque et al., “The Kepler-10 planetary system revisited by HARPS-N: a hot rocky world and a solid Neptune-mass planet”, ApJ 789, 154 (2014), arXiv:1405.7881', url: 'https://doi.org/10.1088/0004-637X/789/2/154' },
  will: { label: 'C. M. Will, “The confrontation between general relativity and experiment”, Living Rev. Relativ. 17, 4 (2014)', url: 'https://doi.org/10.12942/lrr-2014-4' },
  iau2015: { label: 'IAU 2015 Resolution B3 on recommended nominal conversion constants for selected solar and planetary properties (Prša et al., AJ 152, 41, 2016)', url: 'https://doi.org/10.3847/0004-6256/152/2/41' },
  pdgCR: { label: 'Particle Data Group, Review of Particle Physics: “Cosmic rays” (sea-level muon intensity and its cos²θ dependence)', url: 'https://pdg.lbl.gov/2024/reviews/rpp2024-rev-cosmic-rays.pdf' },
  cosmicwatch: { label: 'S. N. Axani, K. Frankiewicz & J. M. Conrad, “The CosmicWatch Desktop Muon Detector: a self-contained, pocket sized particle detector”, JINST 13, P03019 (2018), arXiv:1801.03029', url: 'https://arxiv.org/abs/1801.03029' },
  lindegren: { label: 'L. Lindegren et al., “Gaia Early Data Release 3: parallax bias versus magnitude, colour, and position”, A&A 649, A4 (2021), arXiv:2012.01742', url: 'https://doi.org/10.1051/0004-6361/202039653' },
  babusiaux: { label: 'Gaia Collaboration, C. Babusiaux et al., “Gaia Data Release 2: observational Hertzsprung–Russell diagrams”, A&A 616, A10 (2018), arXiv:1804.09378', url: 'https://doi.org/10.1051/0004-6361/201832843' },
  wgs84: { label: 'NIMA TR8350.2, Department of Defense World Geodetic System 1984, 3rd ed. (2000): the normal-gravity (Somigliana) formula', url: 'https://earth-info.nga.mil/php/download.php?file=coord-wgs84' },
  clemence: { label: 'G. M. Clemence, “The relativity effect in planetary motions”, Rev. Mod. Phys. 19, 361 (1947)', url: 'https://doi.org/10.1103/RevModPhys.19.361' },
};
