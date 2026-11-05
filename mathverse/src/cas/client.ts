// The typed client for the SymPy worker, and the checks that stand between
// SymPy and the screen: an antiderivative is differentiated back by MathVerse's
// own engine and compared with the integrand at sample points; an exact
// definite integral is compared with adaptive quadrature. A result that fails
// its check is shown as unverified, never silently.

import { Node, parse, toSympy, freeSymbols, derivative, compile } from '../core/expr';
import { integrate as quad } from '../core/numeric/quad';

export type CasStatus = 'idle' | 'loading' | 'ready' | 'error';
export interface CasOut { latex: string; text: string; numeric: boolean; value?: number | null }
export interface Step { depth: number; rule: string; title: string; detail: string; tex: string }

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> };

class Cas {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  status: CasStatus = 'idle';
  error = '';
  private listeners = new Set<(s: CasStatus) => void>();

  onStatus(f: (s: CasStatus) => void) { this.listeners.add(f); return () => this.listeners.delete(f); }
  private set(s: CasStatus) { this.status = s; this.listeners.forEach((f) => f(s)); }

  /** Start the engine (the first symbolic request calls this; the app also warms it at start-up). */
  start(): Promise<void> {
    if (this.ready) return this.ready;
    this.set('loading');
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const base = new URL('./pyodide/', document.baseURI).href;
    this.ready = new Promise<void>((resolve, reject) => {
      this.worker!.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'ready') { this.set('ready'); resolve(); }
        else if (m.type === 'fatal') { this.error = m.error; this.set('error'); reject(new Error(m.error)); }
        else if (m.type === 'result') {
          const p = this.pending.get(m.id);
          if (!p) return;
          this.pending.delete(m.id); clearTimeout(p.timer);
          const r = JSON.parse(m.json);
          if (r.ok) p.resolve(r); else p.reject(new Error(r.error));
        }
      };
      this.worker!.onerror = (e) => { this.error = e.message; this.set('error'); reject(new Error(e.message)); };
    });
    this.worker.postMessage({ type: 'init', base });
    return this.ready;
  }

  /** Cancel everything in flight (terminates and restarts the worker). */
  cancel() {
    this.worker?.terminate();
    this.worker = null; this.ready = null;
    for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error('Cancelled')); }
    this.pending.clear();
    this.set('idle');
  }

  async call<T>(op: string, args: Record<string, unknown>, timeoutMs = 30000): Promise<T> {
    await this.start();
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => { this.cancel(); reject(new Error(`SymPy took longer than ${timeoutMs / 1000} s — cancelled`)); }, timeoutMs);
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
      this.worker!.postMessage({ type: 'call', id, request: JSON.stringify({ op, args }) });
    });
  }
}

export const cas = new Cas();

const namesOf = (...ns: Node[]) => { const s = new Set<string>(); ns.forEach((n) => freeSymbols(n, s)); return [...s]; };

/** Check F′ = f numerically at several points of [lo, hi] (parameters fixed at the given values). */
export function verifyAntiderivative(F: Node, f: Node, x: string, params: Record<string, number>, lo = -2, hi = 2): { ok: boolean; checked: number } {
  const others = Object.keys(params);
  let dF: Node;
  try { dF = derivative(F, x); } catch { return { ok: false, checked: 0 }; }
  const g = compile(dF, [x], params), h = compile(f, [x], params);
  let checked = 0;
  for (let i = 0; i < 9; i++) {
    const t = lo + ((hi - lo) * (i + 0.37)) / 9;
    const a = g([t]), b = h([t]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    checked++;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(b))) return { ok: false, checked };
  }
  void others;
  return { ok: checked >= 3, checked };
}

export interface IntegralResult {
  antiderivative: { tex: string; node: Node | null; verified: boolean } | null;
  steps: Step[];
  definite?: { exactTex: string | null; value: number | null; numeric: number; numericError: number; agrees: boolean | null; warning?: string };
}

/** ∫ f dx (and ∫_a^b), symbolic from SymPy, checked by MathVerse's own engine. */
export async function integrateSymbolic(f: Node, x: string, params: Record<string, number>, a?: number, b?: number): Promise<IntegralResult> {
  const names = namesOf(f);
  const args: Record<string, unknown> = { expr: toSympy(f), names, var: x };
  if (a !== undefined && b !== undefined) { args.a = String(a); args.b = String(b); }
  const r = await cas.call<{ antiderivative: CasOut | null; steps: Step[]; definite?: CasOut | null }>('integrate', args);
  let anti: IntegralResult['antiderivative'] = null;
  if (r.antiderivative) {
    let node: Node | null = null;
    try { node = parse(r.antiderivative.text, { names }); } catch { node = null; }
    const lo = a ?? -2, hi = b ?? 2;
    const verified = node ? verifyAntiderivative(node, f, x, params, Math.min(lo, hi), Math.max(lo, hi)).ok : false;
    anti = { tex: r.antiderivative.latex, node, verified };
  }
  const out: IntegralResult = { antiderivative: anti, steps: r.steps };
  if (a !== undefined && b !== undefined) {
    const fx = compile(f, [x], params);
    const q = quad((t) => fx([t]), a, b, 1e-10);
    const exact = r.definite ?? null;
    const v = exact?.value ?? null;
    out.definite = {
      exactTex: exact?.latex ?? null, value: v, numeric: q.value, numericError: q.error,
      agrees: v === null ? null : Math.abs(v - q.value) <= Math.max(1e-6 * Math.abs(q.value), 10 * q.error, 1e-9),
      warning: q.warning,
    };
  }
  return out;
}
