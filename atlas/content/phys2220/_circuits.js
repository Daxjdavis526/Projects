// Picture builders for the PHYS 2220 capacitance and circuit lessons (modules
// E5 and E6): thin wrappers that return ordinary visual specs for the
// em-circuit, em-capacitor, em-field and graph simulations, so the content
// test validates them like any other visual. Not a lesson: the leading
// underscore keeps it out of the registry.

/** ε₀ in F/m (CODATA 2022) and the elementary charge in C (exact). */
export const EPS0 = 8.8541878188e-12;
export const E_CHARGE = 1.602176634e-19;

/** Round to n significant figures, as a number. */
export const sf = (x, n = 3) => (x === 0 ? 0 : +x.toPrecision(n));

/** Keep only the known slips that land well away from the answer (some coincide for some parameters). */
export const apart = (errors, answer, rel = 0.03) => errors.filter((e) => Math.abs(e.value - answer) > rel * Math.abs(answer));

/**
 * A circuit picture for a problem: a still schematic with grey wires, names and
 * values, no readings (show adds them back), no animation.
 */
export function circuit(name, { opts = {}, values = {}, hide = [], show = {}, caption, ...rest } = {}) {
  return {
    type: 'em-circuit',
    params: { circuit: name, opts, values, hide, show: { I: false, V: false, ...show }, ...rest },
    ...(caption ? { caption } : {}),
  };
}

/** A parallel-plate capacitor seen edge-on (em-capacitor), with no controls or readouts. */
export function plates(params = {}, caption) {
  return { type: 'em-capacitor', params: { controls: [], readouts: [], f: 0, ...params }, ...(caption ? { caption } : {}) };
}

/** Two oppositely charged plates in cross-section with their field lines (em-field): the field is uniform between them and fringes at the edges. */
export function fringe({ width = 10, gap = 2, sigma = 200, equip = false, caption } = {}) {
  return {
    type: 'em-field',
    params: {
      unit: 'cm', qunit: 'nC', x: [-(width / 2 + 3), width / 2 + 3], y: [-(gap / 2 + 2.6), gap / 2 + 2.6],
      sheets: [{ x: 0, y: gap / 2, angle: 0, sigma, width }, { x: 0, y: -gap / 2, angle: 0, sigma: -sigma, width }],
      fieldLines: true, density: 24, equip, arrows: false, probe: false, readouts: [], static: true, axes: false, grid: false,
    },
    ...(caption ? { caption } : {}),
  };
}

/** A straight segment as a graph curve (for drawing simple shapes on a graph). */
export const seg = (x0, y0, x1, y1, color = 'ink2', width = 2.4) => ({ param: [`${x0} + (${x1 - x0})*t`, `${y0} + (${y1 - y0})*t`], t: [0, 1], color, width });

/** A plain text label on a graph (a point too small to see). */
export const label = (x, y, text, color = 'ink2', dx = 0, dy = 0) => ({ x, y, r: 0.01, color, label: text, labelDx: dx, labelDy: dy });

/**
 * A capacitor drawn on a graph: two plates of length L, a gap g, centred at (cx, cy),
 * with + and − marks; returns curves and points to merge into a graph's params.
 */
export function capOnGraph(cx, cy, L, g, marks = 4) {
  const curves = [seg(cx - L / 2, cy + g / 2, cx + L / 2, cy + g / 2, 'bad', 4), seg(cx - L / 2, cy - g / 2, cx + L / 2, cy - g / 2, 'accent', 4)];
  const points = [];
  for (let k = 0; k < marks; k++) {
    const x = cx - L / 2 + (L * (k + 0.5)) / marks;
    points.push(label(x, cy + g / 2, '+', 'bad', -4, -12), label(x, cy - g / 2, '−', 'accent', -4, 12));
  }
  return { curves, points };
}

/** Q against V for a capacitor: a line through the origin of slope C, optionally with the triangle under it shaded (the energy). */
export function qvGraph({ C, Vmax, qUnit = 'µC', qScale = 1e6, vUnit = 'V', vScale = 1, at = null, shade = false, points = [], caption, ylabel }) {
  const k = C * qScale * vScale;           // Q (display units) per V (display units): Q = C·(V·vScale), shown ×qScale
  const ymax = k * Vmax * 1.15;
  return {
    type: 'graph',
    params: {
      x: [0, Vmax * 1.05], y: [0, ymax], aspect: 'wide', axesAt: 'edge', xlabel: `V (${vUnit})`, ylabel: ylabel ?? `Q (${qUnit})`,
      curves: [{ fn: `${sf(k, 8)}*x`, color: 'accent', domain: [0, Vmax * 1.05] }],
      shade: shade && at !== null ? [{ fn: `${sf(k, 8)}*x`, from: 0, to: at, color: 'gold', alpha: 0.3 }] : [],
      vlines: at !== null ? [{ x: at, label: `${sf(at, 3)} ${vUnit}`, color: 'ink3' }] : [],
      points,
    },
    ...(caption ? { caption } : {}),
  };
}

/** An RC curve on a graph: V(t) charging toward Vf from 0, or discharging from V0; time in the given unit. */
export function rcGraph({ tau, V0 = 0, Vf, tmax = 5 * tau, tUnit = 's', tScale = 1, vLabel = 'V_C (V)', marks = [], tauLine = true, caption, extra = {} }) {
  const T = tau / tScale, ymax = Math.max(V0, Vf) * 1.15;
  return {
    type: 'graph',
    params: {
      x: [0, tmax / tScale], y: [0, ymax], aspect: 'wide', axesAt: 'edge', xlabel: `t (${tUnit})`, ylabel: vLabel,
      curves: [{ fn: `${sf(Vf, 8)} + (${sf(V0 - Vf, 8)})*e^(-x/${sf(T, 8)})`, color: 'accent', domain: [0, tmax / tScale] }],
      hlines: [{ y: Vf, color: 'ink3' }].filter((h) => h.y > 0),
      vlines: tauLine ? [{ x: T, label: 'τ', color: 'gold' }] : [],
      points: marks,
      ...extra,
    },
    ...(caption ? { caption } : {}),
  };
}
