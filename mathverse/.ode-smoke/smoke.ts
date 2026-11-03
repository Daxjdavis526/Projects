// Headless smoke test of every ODE demo: every choice, every toggle, extreme slider values, ticks, csv.
import { demos } from '../src/modules/ode';
import { Graphics } from '../src/engine/plot2d';
import type { DemoCtx } from '../src/modules/types';

(globalThis as any).requestAnimationFrame = (f: any) => setTimeout(f, 0);
(globalThis as any).cancelAnimationFrame = () => {};
(globalThis as any).ImageData = class { constructor(public width: number, public height: number) { (this as any).data = new Uint8ClampedArray(width * height * 4); } };

function mockPlot() {
  const p: any = { view: { x0: -5, x1: 5, y0: -3.5, y1: 3.5 }, opts: {}, fn: null as any, onClick: undefined,
    setDraw(fn: any) { p.fn = fn; p.render(); }, setView(v: any) { p.view = { ...v }; },
    render() { if (!p.fn) return; const g = new Graphics(p.view, 700, 600); p.fn(g); for (const h of g.handles) { h.onDrag(h.constrain ? h.constrain(h.at) : h.at); } p.count = g.cmds.length; },
  };
  return p;
}
const handle = () => ({ object: { material: {} }, dispose() {}, visible() {}, set() {}, get: () => [0, 0, 0], update() {}, setColor() {} });
function mockView() {
  return new Proxy({ getBounds: () => ({ x: [-3, 3], y: [-3, 3], z: [-3, 3] }) } as any, { get(t, k) { if (k in t) return t[k]; if (String(k).startsWith('add')) return (..._a: any[]) => { const h: any = handle(); if (k === 'addPoint') { h.object = { material: {} }; } return h; }; return () => {}; } });
}
let fails = 0;
for (const d of demos) {
  const plot = mockPlot(), plot2 = mockPlot();
  const params: Record<string, number> = {}, choices: Record<string, string> = {}, toggles: Record<string, boolean> = {};
  for (const p of d.params) params[p.key] = p.value;
  for (const c of d.choices ?? []) choices[c.key] = c.value;
  for (const t of d.toggles ?? []) toggles[t.key] = t.value;
  const warns: string[] = [];
  const ctx: DemoCtx = { view3d: (d.view === '3d' || d.view === 'split3d') ? mockView() : null, plot: d.view === '3d' ? null : plot, plot2: d.view === 'split2d' ? plot2 : null, params, choices, toggles, input: d.input?.value ?? '', setParam: (k, v) => { params[k] = v; }, setReadouts() {}, setSteps() {}, setNote() {}, warn: (w) => { if (w) warns.push(w); }, time: { t: 0, playing: true, speed: 1 }, dark: true };
  const run = (what: string, f: () => void) => { try { f(); } catch (e) { fails++; console.log(`FAIL ${d.id} [${what}]: ${(e as Error).stack?.split('\n').slice(0, 3).join(' | ')}`); } };
  const t0 = Date.now();
  let inst: any;
  run('create', () => { inst = d.create(ctx); inst.update(); });
  if (!inst) continue;
  const tick = () => { for (let i = 0; i < 5; i++) { ctx.time.t += 0.37; inst.tick?.(0.37); } };
  run('tick', tick);
  for (const c of d.choices ?? []) for (const [v] of c.options) run(`choice ${c.key}=${v}`, () => { choices[c.key] = v; inst.update(); tick(); });
  for (const c of d.choices ?? []) choices[c.key] = c.value;
  for (const t of d.toggles ?? []) run(`toggle ${t.key}`, () => { toggles[t.key] = !toggles[t.key]; inst.update(); tick(); toggles[t.key] = !toggles[t.key]; });
  for (const p of d.params) for (const v of [p.min, p.max, 0]) if (v >= p.min && v <= p.max) run(`param ${p.key}=${v}`, () => { const old = params[p.key]; params[p.key] = v; inst.update(); tick(); params[p.key] = old; });
  for (const s of d.tutorial ?? []) run('tutorial step', () => { Object.assign(params, s.set?.params ?? {}); Object.assign(choices, s.set?.choices ?? {}); Object.assign(toggles, s.set?.toggles ?? {}); if (s.set?.input) (ctx as any).input = s.set.input; inst.update(); tick(); s.done?.(ctx); });
  run('csv', () => { const c = inst.csv?.(); if (c !== undefined && !c.includes(',')) throw new Error('empty csv'); });
  run('reset', () => { inst.reset?.(); inst.update(); });
  run('dispose', () => inst.dispose());
  console.log(`${d.id}: ${Date.now() - t0} ms${warns.length ? '  warnings seen: ' + [...new Set(warns)].slice(0, 3).join(' / ').slice(0, 200) : ''}`);
}
console.log(fails ? `${fails} failures` : 'all demos passed');
