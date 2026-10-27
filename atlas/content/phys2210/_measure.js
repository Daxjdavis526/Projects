// Picture builders for PHYS 2210 module M1 (units, measurement, estimation).
// Each returns an ordinary `graph` visual spec, so the content test validates
// it like any other visual. Nothing here is a simulation of its own.

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** 10 with a Unicode superscript exponent, for canvas labels: pow10(-6) → "10⁻⁶". */
export const pow10 = (n) => `10${String(n).replace(/-/g, '⁻').replace(/\d/g, (d) => SUP[d])}`;

const tickText = (v) => (Math.abs(v) >= 1000 ? v.toLocaleString('en-US') : String(+v.toPrecision(6)));
const clean = (v) => +v.toPrecision(12);

/**
 * One quantity on two scales. The axis counts unit B; the ticks above it count
 * unit A; a gold bar marks `value` (given in A). `perA` is how many B make one A
 * (1 lbf = 4.448 N → perA 4.448). The axis is labelled coarsely (`ticksB`
 * labels or so), so the picture shows the size and direction of a conversion
 * without being precise enough to read an answer off.
 */
export function dualScale({ value, perA, unitA, unitB, stepA, maxA, ticksB = 4, caption }) {
  const top = maxA ?? Math.ceil((value * 1.3) / stepA) * stepA;
  const X = (a) => clean(a * perA);
  const ticks = [];
  for (let k = 0; k * stepA <= top + 1e-9; k++) ticks.push(clean(k * stepA));
  const span = X(top);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.03 * span, 1.04 * span], y: [0.2, 3.2], xticks: ticksB, yticks: 0.001, xlabel: unitB, ylabel: ' ',
      alt: `A scale in ${unitA} drawn above a scale in ${unitB}`,
      shade: [{ fn: '1.25', lower: '0.55', from: 0, to: X(value), color: 'gold', alpha: 0.5 }],
      curves: [
        ...ticks.map((a) => ({ param: [String(X(a)), 't'], t: [1.55, 1.95], color: 'ink2', width: 1.4 })),
        { param: [String(X(value)), 't'], t: [1.4, 2.05], color: 'gold', width: 3 },
      ],
      points: [
        ...ticks.map((a) => ({ x: X(a), y: 2.25, r: 0.01, color: 'ink2', label: tickText(a) })),
        { x: 0, y: 2.95, r: 0.01, color: 'ink2', label: `${unitA} ↓` },
        { x: X(value), y: 0.9, r: 4, color: 'gold', label: `${tickText(value)} ${unitA}` },
      ],
    },
    caption: caption ?? `One quantity, two scales: the ticks above count ${unitA}, the axis below counts ${unitB}. Drawn to proportion — use it to check the direction of a conversion, then compute the value.`,
  };
}

/** A 1 cm square ruled into 1 mm squares: why area units convert with the square of the length factor. */
export function areaGrid() {
  const lines = [];
  for (let k = 1; k < 10; k++) {
    lines.push({ param: [String(k / 10), 't'], t: [0, 1], color: 'ink4', width: 1 });
    lines.push({ param: ['t', String(k / 10)], t: [0, 1], color: 'ink4', width: 1 });
  }
  const edge = (param) => ({ param, t: [0, 1], color: 'accent', width: 2.4 });
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.05, 1.05], y: [-0.05, 1.05], equal: true, xticks: 0.001, yticks: 0.001, xlabel: ' ', ylabel: ' ',
      alt: 'A one-centimetre square divided into one hundred one-millimetre squares',
      shade: [{ fn: '1', from: 0, to: 1, color: 'accent', alpha: 0.08 }, { fn: '0.1', from: 0, to: 0.1, color: 'gold', alpha: 0.8 }],
      curves: [...lines, edge(['0', 't']), edge(['1', 't']), edge(['t', '0']), edge(['t', '1'])],
      points: [
        { x: 0.1, y: 0.1, r: 0.01, color: 'gold', label: '1 mm²' },
        { x: 0.38, y: 1.0, r: 0.01, color: 'accent', label: '1 cm' },
        { x: 1.0, y: 0.5, r: 0.01, color: 'accent', label: '1 cm² = 10 × 10 = 100 mm²' },
      ],
    },
    caption: 'Ten millimetres make a centimetre, so ten rows of ten — 100 — square millimetres make a square centimetre. An area unit converts with the square of the length factor; a volume unit with its cube.',
  };
}

/**
 * A millimetre ruler from `from` to `to` (in cm) with a gold object whose end
 * sits at `value` cm: for practising how many digits a reading supports.
 */
export function ruler({ from, to, value, caption }) {
  const ticks = [];
  for (let mm = Math.round(from * 10); mm <= Math.round(to * 10); mm++) {
    const len = mm % 10 === 0 ? 0.3 : mm % 5 === 0 ? 0.2 : 0.12;
    ticks.push({ param: [String(mm / 10), 't'], t: [0.6 - len, 0.6], color: 'ink2', width: 1.3 });
  }
  const labels = [];
  for (let cm = Math.ceil(from); cm <= Math.floor(to); cm++) labels.push({ x: cm - 0.035, y: 0.12, r: 0.01, color: 'ink', label: String(cm) });
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [from - 0.05, to + 0.05], y: [-0.1, 1.4], xticks: 0.001, yticks: 0.001, xlabel: 'cm', ylabel: ' ',
      alt: 'A millimetre ruler with the end of an object lying between two marks',
      shade: [{ fn: '0.6', lower: '0', from, to, color: 'ink4', alpha: 0.25 }, { fn: '1.2', lower: '0.72', from: from - 0.05, to: value, color: 'gold', alpha: 0.65 }],
      curves: ticks,
      points: labels,
    },
    caption: caption ?? 'A ruler marked in millimetres, magnified. The gold object’s left end is lined up with a mark off to the left; read where its right end falls.',
  };
}

/** Measurements drawn as ranges, best ± δ, stacked one above another on a common axis. */
export function intervals(items, { x, xlabel, xticks = 6, caption }) {
  const n = items.length;
  const band = (i) => [1 - (i + 1) / n + 0.08, 1 - i / n - 0.08];
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x, y: [0.02, 1.02], xticks, yticks: 0.001, xlabel, ylabel: ' ',
      alt: 'Measurements drawn as ranges on a number line',
      shade: items.map((m, i) => ({ fn: String(band(i)[1]), lower: String(band(i)[0]), from: m.best - m.delta, to: m.best + m.delta, color: m.color || 'accent', alpha: 0.45 })),
      // a dot at the best value; the label sits just past the right end of the bar
      points: items.flatMap((m, i) => {
        const y = (band(i)[0] + band(i)[1]) / 2;
        return [{ x: m.best, y, r: 4, color: m.color || 'accent' }, { x: m.best + m.delta, y: y + 0.06, r: 0.01, color: m.color || 'accent', label: m.label }];
      }),
    },
    caption: caption ?? 'Each bar runs from best − δ to best + δ.',
  };
}

/** A rectangle with its largest and smallest possible outlines, the uncertainties exaggerated for visibility. */
export function rectangleBounds({ L, W, dL, dW, unit = 'm', times = 10 }) {
  const box = (l, w, style) => [
    { param: ['t', '0'], t: [0, l], ...style }, { param: ['t', String(w)], t: [0, l], ...style },
    { param: ['0', 't'], t: [0, w], ...style }, { param: [String(l), 't'], t: [0, w], ...style },
  ];
  const big = [L + times * dL, W + times * dW], small = [L - times * dL, W - times * dW];
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.15 * L, 1.75 * L], y: [-0.15 * W, 1.25 * W + times * dW], equal: true, xticks: 0.001, yticks: 0.001, xlabel: ' ', ylabel: ' ',
      alt: 'A rectangle with dashed outlines showing its largest and smallest possible sizes',
      shade: [{ fn: String(W), from: 0, to: L, color: 'accent', alpha: 0.18 }],
      curves: [...box(big[0], big[1], { color: 'warn', width: 1.4, dash: true }), ...box(small[0], small[1], { color: 'warn', width: 1.4, dash: true }), ...box(L, W, { color: 'accent', width: 2.4 })],
      points: [
        { x: big[0], y: W / 2, r: 0.01, color: 'ink', label: `W = ${W.toFixed(2)} ± ${dW} ${unit}` },
        { x: L * 0.3, y: big[1], r: 0.01, color: 'ink', label: `L = ${L.toFixed(2)} ± ${dL} ${unit}` },
      ],
    },
    caption: `Solid: the measured rectangle. Dashed: the largest and smallest rectangles the uncertainties allow, exaggerated ${times}× so they show. The area’s uncertainty comes from both sides at once.`,
  };
}

/**
 * A Fermi estimate as a staircase on a logarithmic axis: each factor is a
 * vertical step of height log₁₀(factor), so the top of the staircase is
 * log₁₀ of the product. `reference` (optional) draws a measured value to
 * compare with.
 */
export function staircase(steps, { reference, unit = '', caption, top } = {}) {
  let y = 0;
  const arrows = [], curves = [], points = [];
  steps.forEach((s, i) => {
    const y1 = y + Math.log10(s.factor);
    arrows.push({ from: [i + 1, clean(y)], to: [i + 1, clean(y1)], color: i === steps.length - 1 ? 'gold' : 'accent' });
    points.push({ x: i + 1.1, y: clean((y + y1) / 2), r: 0.01, color: 'ink', label: s.label });
    if (i < steps.length - 1) curves.push({ fn: String(clean(y1)), domain: [i + 1, i + 2], color: 'ink3', width: 1, dash: true });
    y = y1;
  });
  const [m, e] = (10 ** y).toExponential(1).split('e');
  points.push({ x: steps.length, y: clean(y), r: 4.5, color: 'gold', label: `≈ ${m} × ${pow10(+e)}${unit ? ' ' + unit : ''}` });
  const yTop = top ?? Math.ceil(Math.max(y, reference ? Math.log10(reference.value) : 0) + 1);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0.4, steps.length + 3.4], y: [0, yTop], xticks: 0.001, yticks: Math.min(14, yTop + 1), xlabel: ' ', ylabel: 'log₁₀',
      alt: 'A staircase on a logarithmic scale: each factor of the estimate is one step up',
      arrows, curves, points,
      hlines: reference ? [{ y: clean(Math.log10(reference.value)), label: reference.label, color: 'good' }] : [],
    },
    caption: caption ?? 'Logarithmic scale: multiplying by a factor adds a step of height log₁₀(factor), so the top of the staircase is the order of magnitude of the product.',
  };
}
