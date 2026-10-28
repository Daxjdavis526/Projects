// Picture builders for the Research in Physics course (research.*), all made
// from the `graph` simulation: two-set Venn diagrams for Boolean searches and
// precision/recall, data with error bars, schematic citation graphs, and
// horizontal time bars (reading passes, project plans). Each returns a visual
// spec; the lesson supplies the caption.

/** Round for display inside expressions (keeps generated specs short). */
const r6 = (v) => +(+v).toPrecision(6);

// ---------------------------------------------------------------- Venn ----
// Two unit circles, A centred at (−0.55, 0) and B at (0.55, 0).
const UA = 'sqrt(max(0, 1 - (x + 0.55)^2))';
const UB = 'sqrt(max(0, 1 - (x - 0.55)^2))';
/** Shading for one region: 'a', 'b', 'and', 'or', 'andnot' (A but not B), 'bnota'. */
function region(op, color, alpha, when) {
  const w = when === undefined ? {} : { when };
  const S = (fn, lower, from, to) => ({ fn, lower, from, to, color, alpha, ...w });
  switch (op) {
    case 'a': return [S(UA, `-${UA}`, -1.55, 0.45)];
    case 'b': return [S(UB, `-${UB}`, -0.45, 1.55)];
    case 'and': return [S(`min(${UA}, ${UB})`, `-min(${UA}, ${UB})`, -0.45, 0.45)];
    case 'or': return [S(`max(${UA}, ${UB})`, `-max(${UA}, ${UB})`, -1.55, 1.55)];
    case 'andnot': return [S(UA, `min(${UA}, ${UB})`, -1.55, 0.45), S(`-min(${UA}, ${UB})`, `-${UA}`, -1.55, 0.45)];
    case 'bnota': return [S(UB, `min(${UA}, ${UB})`, -0.45, 1.55), S(`-min(${UA}, ${UB})`, `-${UB}`, -0.45, 1.55)];
    default: return [];
  }
}

/**
 * A two-set Venn diagram.
 *   op       the shaded region (see region()), or null for none
 *   A, B     plain-text set labels drawn above each circle
 *   counts   optional { a, ab, b }: plain-text numbers written in the three regions
 *   choice   optional { key, label, options: [[k, text, op], …], value }: an
 *            interactive choice of shaded region (k = 0, 1, 2 …)
 */
export function venn({ op = null, A = 'A', B = 'B', counts = null, choice = null, color = 'accent', caption }) {
  const shade = [];
  let choices;
  if (choice) {
    choice.options.forEach(([k, , o]) => shade.push(...region(o, color, 0.32, `step(0.5 - abs(${choice.key} - ${k}))`)));
    choices = [{ key: choice.key, label: choice.label, value: choice.value ?? choice.options[0][0], options: choice.options.map(([k, text]) => [k, text]), explain: choice.explain || 'Which combination of the two result sets the search returns.' }];
  } else if (op) shade.push(...region(op, color, 0.32));
  const points = [
    { x: -1.05, y: 1.08, r: 0, label: A, color: 'accent2', labelAlign: 'center', labelDx: 0, labelDy: 0 },
    { x: 1.05, y: 1.08, r: 0, label: B, color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 },
  ];
  if (counts) {
    if (counts.a !== undefined) points.push({ x: -0.95, y: 0, r: 0, label: String(counts.a), color: 'ink', labelAlign: 'center', labelDx: 0, labelDy: 0 });
    if (counts.ab !== undefined) points.push({ x: 0, y: 0, r: 0, label: String(counts.ab), color: 'ink', labelAlign: 'center', labelDx: 0, labelDy: 0 });
    if (counts.b !== undefined) points.push({ x: 0.95, y: 0, r: 0, label: String(counts.b), color: 'ink', labelAlign: 'center', labelDx: 0, labelDy: 0 });
  }
  return {
    type: 'graph',
    params: {
      x: [-2.1, 2.1], y: [-1.2, 1.3], aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      curves: [
        { param: ['-0.55 + cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent2', width: 2 },
        { param: ['0.55 + cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 },
      ],
      shade, points, ...(choices ? { choices } : {}),
    },
    caption,
  };
}

// ------------------------------------------------------ error bars -------
/**
 * Curves drawing vertical error bars (with small caps) for points [x, y, s]:
 * each bar runs from y − s to y + s. `cap` is the half-width of a cap in x
 * units (0 for none). For a log axis pass coordinates already in log₁₀.
 */
export function errorBars(pts, { color = 'accent', cap = 0, width = 1.6, when } = {}) {
  const w = when === undefined ? {} : { when };
  const out = [];
  for (const [x, y, s, s2] of pts) {
    const lo = r6(y - (s2 ?? s)), hi = r6(y + s);
    out.push({ param: [String(r6(x)), `${lo} + (${r6(hi - lo)})*t`], t: [0, 1], color, width, samples: 10, ...w });
    if (cap > 0) {
      out.push({ param: [`${r6(x - cap)} + ${r6(2 * cap)}*t`, String(lo)], t: [0, 1], color, width, samples: 10, ...w });
      out.push({ param: [`${r6(x - cap)} + ${r6(2 * cap)}*t`, String(hi)], t: [0, 1], color, width, samples: 10, ...w });
    }
  }
  return out;
}

/** The points themselves, as graph points. */
export const dots = (pts, { color = 'accent', r = 3.5, when } = {}) => pts.map(([x, y]) => ({ x: r6(x), y: r6(y), color, r, ...(when === undefined ? {} : { when }) }));

/**
 * Data with error bars on a graph: params is the rest of the graph spec
 * (window, labels, extra curves …); data is [[x, y, σ], …].
 */
export function dataPlot(data, params = {}, { color = 'accent', cap = 0, caption } = {}) {
  const { curves = [], points = [], ...rest } = params;
  return {
    type: 'graph',
    params: { aspect: 'wide', axesAt: 'edge', ...rest, curves: [...curves, ...errorBars(data, { color, cap })], points: [...dots(data, { color }), ...points] },
    caption,
  };
}

// ------------------------------------------------- citation graphs -------
/**
 * A schematic citation graph. nodes: [{ id, x, y, label, color, when }];
 * edges: [[citing, cited, { color, when, dash }]] — the arrow points from the
 * citing paper to the paper it cites (backwards in time). Arrows stop short
 * of the dots.
 */
export function citeGraph(nodes, edges, params = {}, caption) {
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const arrows = edges.map(([a, b, o = {}]) => {
    const p = N[a], q = N[b];
    const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy);
    // stop 14% short at each end in world units scaled by the window
    const f0 = Math.min(0.32, 0.55 / L), f1 = 1 - Math.min(0.32, 0.6 / L);
    return { from: [r6(p.x + f0 * dx), r6(p.y + f0 * dy)], to: [r6(p.x + f1 * dx), r6(p.y + f1 * dy)], color: o.color || 'ink3', width: o.width || 1.6, ...(o.dash ? { dash: o.dash } : {}), ...(o.when !== undefined ? { when: o.when } : {}) };
  });
  const points = nodes.map((n) => ({ x: n.x, y: n.y, label: n.label, color: n.color || 'accent', r: n.r ?? 6, labelDx: n.labelDx ?? 8, labelDy: n.labelDy ?? -10, ...(n.when !== undefined ? { when: n.when } : {}) }));
  return { type: 'graph', params: { aspect: 'wide', axesAt: 'edge', grid: false, ylabel: '', yticks: 0, ...params, arrows, points: [...points, ...(params.points || [])] }, caption };
}

// ------------------------------------------------------ time bars --------
/**
 * Horizontal bars: rows [{ y, from, to, color, label, when }], drawn as
 * shaded rectangles of half-height h, each with its label at its left end.
 */
export function timeBars(rows, params = {}, { h = 0.3, caption } = {}) {
  const shade = rows.map((b) => ({ fn: String(r6(b.y + h)), lower: String(r6(b.y - h)), from: r6(b.from), to: r6(b.to), color: b.color || 'accent', alpha: b.alpha ?? 0.55, ...(b.when !== undefined ? { when: b.when } : {}) }));
  const points = rows.filter((b) => b.label).map((b) => ({ x: r6(b.labelX ?? b.from), y: r6(b.y + h), r: 0, label: b.label, color: 'ink', labelDx: b.labelDx ?? 2, labelDy: b.labelDy ?? -9, ...(b.when !== undefined ? { when: b.when } : {}) }));
  return { type: 'graph', params: { aspect: 'wide', axesAt: 'edge', ylabel: '', yticks: 0, ...params, shade: [...shade, ...(params.shade || [])], points: [...points, ...(params.points || [])] }, caption };
}

// ------------------------------------------------------- Gaussians -------
/** A normal density as a graph expression. */
export const gaussFn = (mu, s) => `exp(-((x - ${r6(mu)})^2)/(2*${r6(s)}^2))/(${r6(s)}*sqrt(2*pi))`;

/** Common references for the course. */
export const SRC = {
  arxivApi: { label: 'arXiv API User’s Manual (search_query field prefixes and Boolean operators)', url: 'https://info.arxiv.org/help/api/user-manual.html' },
  adsSyntax: { label: 'NASA ADS help: search syntax', url: 'https://ui.adsabs.harvard.edu/help/search/search-syntax' },
  adsSecond: { label: 'NASA ADS help: second-order operators', url: 'https://ui.adsabs.harvard.edu/help/search/second-order' },
  adsCites: { label: 'NASA ADS help: citations and references operators', url: 'https://ui.adsabs.harvard.edu/help/search/citations-and-references' },
  inspire: { label: 'INSPIRE help: search tips for papers (check the live site for current syntax)', url: 'https://inspirehep.net/help/knowledge-base/inspire-paper-search/' },
  gw150914: { label: 'Abbott et al. (LIGO and Virgo), “Observation of gravitational waves from a binary black hole merger”, PRL 116, 061102 (2016), arXiv:1602.03837', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
  keshav: { label: 'S. Keshav, “How to read a paper”, ACM SIGCOMM Computer Communication Review 37(3), 83–84 (2007)', url: 'https://doi.org/10.1145/1273445.1273458' },
  will: { label: 'C. M. Will, “The confrontation between general relativity and experiment”, Living Rev. Relativ. 17, 4 (2014)', url: 'https://doi.org/10.12942/lrr-2014-4' },
  shoes: { label: 'Riess et al., “A comprehensive measurement of the local value of the Hubble constant…” (SH0ES), ApJL 934, L7 (2022), arXiv:2112.04510', url: 'https://arxiv.org/abs/2112.04510' },
  planck: { label: 'Planck Collaboration, “Planck 2018 results. VI. Cosmological parameters”, A&A 641, A6 (2020), arXiv:1807.06209', url: 'https://arxiv.org/abs/1807.06209' },
  pulsar: { label: 'J. M. Weisberg & Y. Huang, “Relativistic measurements from timing the binary pulsar PSR B1913+16”, ApJ 829, 55 (2016), arXiv:1606.02744', url: 'https://doi.org/10.3847/0004-637X/829/1/55' },
  hogg: { label: 'D. W. Hogg, J. Bovy & D. Lang, “Data analysis recipes: fitting a model to data” (2010), arXiv:1008.4686', url: 'https://arxiv.org/abs/1008.4686' },
  kass: { label: 'R. E. Kass & A. E. Raftery, “Bayes factors”, J. Am. Stat. Assoc. 90, 773–795 (1995)', url: 'https://doi.org/10.1080/01621459.1995.10476572' },
  trotta: { label: 'R. Trotta, “Bayes in the sky: Bayesian inference and model selection in cosmology”, Contemp. Phys. 49, 71 (2008), arXiv:0803.4089', url: 'https://arxiv.org/abs/0803.4089' },
  pdgStats: { label: 'Particle Data Group, Review of Particle Physics: “Statistics” (G. Cowan)', url: 'https://pdg.lbl.gov/2024/reviews/rpp2024-rev-statistics.pdf' },
  oberkampf: { label: 'W. L. Oberkampf & C. J. Roy, Verification and Validation in Scientific Computing (Cambridge University Press, 2010)', url: 'https://doi.org/10.1017/CBO9780511760396' },
  roache: { label: 'P. J. Roache, “Quantification of uncertainty in computational fluid dynamics”, Annu. Rev. Fluid Mech. 29, 123–160 (1997)', url: 'https://doi.org/10.1146/annurev.fluid.29.1.123' },
};
