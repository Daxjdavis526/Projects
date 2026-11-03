// Helpers shared by the Calculus II demos: number formatting, theme-aware ink,
// logarithmic axes for the 2D plot, and a non-blocking SymPy runner that shows
// MathVerse's own exact working at once and appends SymPy's steps when ready.

import type { DemoCtx, StepRow, TutorialStep } from '../types';
import type { Graphics } from '../../engine/plot2d';
import { SERIES } from '../../engine/colors';
import { niceStep, fmtTick } from '../../engine/viewport3d';
import { cas, integrateSymbolic, IntegralResult } from '../../cas/client';
import { parse, compile, Node } from '../../core/expr';

export const fmt = (v: number, d = 5) => (Number.isFinite(v) ? String(+v.toPrecision(d)) : Number.isNaN(v) ? 'undefined' : v > 0 ? '∞' : '−∞');
export const fmtE = (v: number, d = 2) => (v === 0 ? '0' : Number.isFinite(v) ? (Math.abs(v) < 1e-3 || Math.abs(v) >= 1e5 ? v.toExponential(d).replace('e', '×10^').replace(/\^\+?(-?)(\d+)/, (_, s, n) => `^${s}${n}`) : fmt(v, d + 2)) : fmt(v));
/** TeX for a number: scientific form as a × 10^{k}. */
export const texNum = (v: number, d = 5) => {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? '\\text{undefined}' : v > 0 ? '\\infty' : '-\\infty';
  if (v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e6)) { const [m, e] = v.toExponential(d - 1).split('e'); return `${+m}\\times 10^{${+e}}`; }
  return String(+v.toPrecision(d));
};

export const [BLUE, GOLD, RED, GREEN, VIOLET, CYAN, ORANGE, PINK] = SERIES;
export const ink = (ctx: DemoCtx) => (ctx.dark ? '#e6e9ef' : '#1b1f2a');
export const muted = (ctx: DemoCtx) => (ctx.dark ? '#8b93a7' : '#5b6375');
export const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const FONT = '600 13px Inter, system-ui, sans-serif';
export const FONT_SM = '12px Inter, system-ui, sans-serif';

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export const pow10Label = (k: number) => (k === 0 ? '1' : k === 1 ? '10' : '10' + String(k).split('').map((c) => SUP[c] ?? c).join(''));

/**
 * Axes for a plot drawn in transformed coordinates: when xLog / yLog is set the
 * plot's coordinate is log10 of the value, and ticks are labelled as powers of
 * ten. Set plot.opts.axes = plot.opts.grid = false and call this first.
 */
export function customAxes(g: Graphics, dark: boolean, o: { xLog?: boolean; yLog?: boolean; xLabel?: string; yLabel?: string }) {
  const { x0, x1, y0, y1 } = g.view;
  const grid = dark ? 'rgba(160,170,190,0.13)' : 'rgba(40,50,70,0.12)';
  const minor = dark ? 'rgba(160,170,190,0.05)' : 'rgba(40,50,70,0.05)';
  const tick = dark ? '#8b93a7' : '#5b6375';
  const font = '11px Inter, system-ui, sans-serif';
  const ppy = g.pxH / (y1 - y0);
  const ticks = (lo: number, hi: number, log: boolean, px: number) => {
    if (log) { const out: number[] = []; const step = Math.max(1, Math.ceil((hi - lo) / Math.max(2, px / 55))); for (let k = Math.ceil(lo / step) * step; k <= hi; k += step) out.push(k); return { major: out, step }; }
    const s = niceStep((hi - lo) / Math.max(3, px / 80)); const out: number[] = []; for (let v = Math.ceil(lo / s) * s; v <= hi + 1e-12; v += s) out.push(+v.toFixed(10)); return { major: out, step: s };
  };
  const tx = ticks(x0, x1, !!o.xLog, g.pxW), ty = ticks(y0, y1, !!o.yLog, g.pxH);
  if (o.xLog && tx.step === 1) for (let k = Math.floor(x0); k <= x1; k++) for (let m = 2; m < 10; m++) { const v = k + Math.log10(m); if (v > x0 && v < x1) g.line([v, y0], [v, y1], { color: minor, width: 1 }); }
  if (o.yLog && ty.step === 1) for (let k = Math.floor(y0); k <= y1; k++) for (let m = 2; m < 10; m++) { const v = k + Math.log10(m); if (v > y0 && v < y1) g.line([x0, v], [x1, v], { color: minor, width: 1 }); }
  for (const v of tx.major) g.line([v, y0], [v, y1], { color: grid, width: 1 });
  for (const v of ty.major) g.line([x0, v], [x1, v], { color: grid, width: 1 });
  const yb = y0 + 4 / ppy;
  for (const v of tx.major) g.text([v, yb], o.xLog ? pow10Label(v) : fmtTick(v), { color: tick, font, align: 'center', baseline: 'bottom' });
  for (const v of ty.major) if (Math.abs(v - y0) * ppy > 16) g.text([x0, v], o.yLog ? pow10Label(v) : fmtTick(v), { color: tick, font, align: 'left', baseline: 'middle' }, 6, 0);
  if (o.xLabel) g.text([x1, y0], o.xLabel, { color: tick, font: 'italic 13px Inter, sans-serif', align: 'right', baseline: 'bottom' }, -6, -20);
  if (o.yLabel) g.text([x0, y1], o.yLabel, { color: tick, font: 'italic 13px Inter, sans-serif', align: 'left', baseline: 'top' }, 6, 6);
}

/** Parse a formula in one variable (parameters fixed); null with a message on failure. */
export function compileInput(src: string, v: string, params: Record<string, number> = {}): { node: Node; f: (x: number) => number } | { error: string } {
  try {
    const node = parse(src.replace(/^\s*[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)\s*=/, ''), { names: [v, ...Object.keys(params)] });
    const c = compile(node, [v], params);
    const f = (x: number) => c([x]);
    return { node, f };
  } catch (e) { return { error: (e as Error).message }; }
}

/** SymPy's integration steps as rows for the Steps panel. */
export function sympyRows(r: IntegralResult): StepRow[] {
  const rows: StepRow[] = r.steps.map((s) => ({ title: `${s.depth ? '↳ '.padStart(2 * s.depth + 2, ' ') : ''}${s.title}`, tex: s.tex || undefined, detail: s.detail || undefined, rule: 'SymPy' }));
  if (r.antiderivative) rows.push({ title: r.antiderivative.verified ? 'SymPy’s antiderivative — verified: MathVerse differentiated it back and it matches the integrand' : 'SymPy’s antiderivative — NOT verified by differentiation; treat with care', tex: `${r.antiderivative.tex} + C`, rule: 'SymPy' });
  else rows.push({ title: 'SymPy found no closed form', detail: 'The numerical value is still exact to the quoted tolerance.', rule: 'SymPy' });
  return rows;
}

/**
 * Runs SymPy in the background: request() shows `local` rows at once (with a
 * "loading" line), then appends SymPy's rows when they arrive. Identical keys
 * are not re-sent; a newer request supersedes an older one; nothing is shown
 * after dispose().
 */
export function symbolicRunner(ctx: DemoCtx) {
  let seq = 0, alive = true, lastKey = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let local: StepRow[] = [], extra: StepRow[] = [];
  const show = () => ctx.setSteps([...local, ...extra]);
  return {
    /** replace the local rows without re-running SymPy */
    setLocal(rows: StepRow[]) { local = rows; show(); },
    request(key: string, rows: StepRow[], job: () => Promise<StepRow[]>) {
      local = rows;
      if (key === lastKey) { show(); return; }
      lastKey = key;
      const my = ++seq;
      extra = [{ title: cas.status === 'ready' ? 'SymPy is working…' : 'SymPy is loading (a few seconds the first time) — the numbers above are already final', rule: 'SymPy' }];
      show();
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try { const r = await job(); if (alive && my === seq) { extra = r; show(); } }
        catch (e) { if (alive && my === seq) { extra = [{ title: 'SymPy could not answer', detail: (e as Error).message, rule: 'SymPy' }]; show(); } }
      }, 300);
    },
    dispose() { alive = false; clearTimeout(timer); },
  };
}

/** ∫ src dx by SymPy, as step rows (src uses only x and numbers). */
export async function sympyIntegralRows(src: string, x = 'x'): Promise<StepRow[]> {
  const node = parse(src, { names: [x] });
  const r = await integrateSymbolic(node, x, {});
  return sympyRows(r);
}

/** Visible y-range of samples of f on [a, b], padded. */
export function rangeOf(fs: ((x: number) => number)[], a: number, b: number, pad = 0.12, n = 300): [number, number] {
  let lo = Infinity, hi = -Infinity;
  for (const f of fs) for (let i = 0; i <= n; i++) { const y = f(a + ((b - a) * i) / n); if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
  if (!Number.isFinite(lo)) return [-1, 1];
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const p = (hi - lo) * pad;
  return [lo - p, hi + p];
}

/**
 * Markup-safe TeX: the shell's Markup turns newlines into <br>, which breaks
 * the SVG paths KaTeX emits for \sqrt. Rewrite \sqrt{…} (balanced braces) as
 * \surd\overline{…}, which renders without SVG. Use for notes, tutorial text,
 * experiments and step details (Tex-rendered readouts and steps are fine).
 */
export function mtex(text: string): string {
  let out = '', i = 0;
  while (i < text.length) {
    const j = text.indexOf('\\sqrt{', i);
    if (j < 0) { out += text.slice(i); break; }
    out += text.slice(i, j);
    let depth = 0, k = j + 5;
    for (; k < text.length; k++) { if (text[k] === '{') depth++; else if (text[k] === '}') { depth--; if (depth === 0) break; } }
    out += `\\surd\\overline{${mtex(text.slice(j + 6, k))}}`;
    i = k + 1;
  }
  return out;
}

/** mtex applied to every tutorial step's text and task. */
export function safeTutorial(steps: TutorialStep[]): TutorialStep[] {
  return steps.map((s) => ({ ...s, text: mtex(s.text), task: s.task && mtex(s.task) }));
}
