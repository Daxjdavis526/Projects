// Runs one demo: builds its views, hands it a context, feeds it control
// changes, and drives the timeline and animated parameters every frame.

import { useEffect, useRef, useState, useCallback } from 'react';
import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../modules/types';
import { Viewport3D } from '../engine/viewport3d';
import { Plot2D } from '../engine/plot2d';
import type { Workspace } from '../project/format';

export interface HostOutputs { readouts: Readout[]; steps: StepRow[]; note: string; warning: string; error: string }

export interface HostApi {
  view3d: Viewport3D | null;
  plot: Plot2D | null;
  plot2: Plot2D | null;
  instance: DemoInstance | null;
  ctx: DemoCtx | null;
  resetTime(): void;
}

interface Props {
  demo: DemoDef;
  ws: Workspace;
  dark: boolean;
  playing: boolean;
  speed: number;
  /** keys of parameters currently animating (sweeping through their ranges) */
  animating: Set<string>;
  onParam: (key: string, value: number) => void;
  onChoice?: (key: string, value: string) => void;
  onToggle?: (key: string, value: boolean) => void;
  onInput?: (text: string) => void;
  onTime: (t: number) => void;
  onOutputs: (o: HostOutputs) => void;
  apiRef: React.MutableRefObject<HostApi | null>;
  /** bump to force re-creation (Reset demo) */
  generation: number;
}

export function DemoHost({ demo, ws, dark, playing, speed, animating, onParam, onChoice, onToggle, onInput, onTime, onOutputs, apiRef, generation }: Props) {
  const mainRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<DemoInstance | null>(null);
  const ctxRef = useRef<DemoCtx | null>(null);
  const outRef = useRef<HostOutputs>({ readouts: [], steps: [], note: '', warning: '', error: '' });
  const pendingOut = useRef(false);
  const [crash, setCrash] = useState('');
  const live = useRef({ playing, speed, animating, onParam, onChoice, onToggle, onInput, onTime, ws });
  live.current = { playing, speed, animating, onParam, onChoice, onToggle, onInput, onTime, ws };

  const flush = useCallback(() => {
    if (pendingOut.current) return;
    pendingOut.current = true;
    requestAnimationFrame(() => { pendingOut.current = false; onOutputs({ ...outRef.current }); });
  }, [onOutputs]);

  // build the views and the instance
  useEffect(() => {
    const main = mainRef.current!, side = sideRef.current;
    let view3d: Viewport3D | null = null, plot: Plot2D | null = null, plot2: Plot2D | null = null;
    setCrash('');
    outRef.current = { readouts: [], steps: [], note: '', warning: '', error: '' };
    try {
      if (demo.view === '3d' || demo.view === 'split3d') view3d = new Viewport3D(demo.view === '3d' ? main : side!);
      if (demo.view === '2d' || demo.view === 'split2d' || demo.view === 'split3d') plot = new Plot2D(main);
      if (demo.view === 'split2d') plot2 = new Plot2D(side!);
      view3d?.setTheme(dark); plot?.setTheme(dark); plot2?.setTheme(dark);
      if (view3d && ws.camera) view3d.setCamera(ws.camera);
      if (plot && ws.view2d) plot.setView(ws.view2d);
      if (view3d) applyDisplay(view3d, ws);
    } catch (e) {
      setCrash(`The graphics could not start: ${(e as Error).message}. MathVerse needs WebGL 2 (any GPU from the last decade).`);
      return;
    }
    const params: Record<string, number> = {};
    for (const p of demo.params) params[p.key] = ws.params[p.key] ?? p.value;
    const choices: Record<string, string> = {};
    for (const c of demo.choices ?? []) choices[c.key] = ws.choices[c.key] ?? c.value;
    const toggles: Record<string, boolean> = {};
    for (const t of demo.toggles ?? []) toggles[t.key] = ws.toggles[t.key] ?? t.value;
    let busy = false, needUpdate = false;
    const ctx: DemoCtx = {
      view3d, plot, plot2, params, choices, toggles,
      input: ws.input || demo.input?.value || '',
      time: { t: ws.t || 0, playing: live.current.playing, speed: live.current.speed },
      dark,
      // A demo moving its own slider from an event (a drag) gets update() on the next
      // frame; inside update()/tick() the demo is already redrawing, so no extra call.
      setParam: (k, v) => { params[k] = v; live.current.onParam(k, v); if (!busy) needUpdate = true; },
      setChoice: (k, v) => { choices[k] = v; live.current.onChoice?.(k, v); },
      setToggle: (k, v) => { toggles[k] = v; live.current.onToggle?.(k, v); },
      setInput: (text) => { ctx.input = text; live.current.onInput?.(text); },
      setReadouts: (rows) => { outRef.current.readouts = rows; flush(); },
      setSteps: (rows) => { outRef.current.steps = rows; flush(); },
      setNote: (text) => { outRef.current.note = text; flush(); },
      warn: (text) => { outRef.current.warning = text; flush(); },
    };
    ctxRef.current = ctx;
    let inst: DemoInstance | null = null;
    try { busy = true; inst = demo.create(ctx); instRef.current = inst; inst.update(); }
    catch (e) { console.error(e); outRef.current.error = `This demo hit an error: ${(e as Error).message}`; flush(); }
    finally { busy = false; needUpdate = false; }
    apiRef.current = {
      view3d, plot, plot2, instance: inst, ctx,
      resetTime: () => { busy = true; try { ctx.time.t = 0; inst?.reset?.(); inst?.update(); } finally { busy = false; } live.current.onTime(0); },
    };
    // the frame loop: timeline and animated parameters
    let raf = 0, last = performance.now(), sinceT = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const L = live.current;
      let changed = false;
      if (L.animating.size) {
        for (const key of L.animating) {
          const spec = demo.params.find((p) => p.key === key);
          if (!spec) continue;
          const [lo, hi] = L.ws.paramRanges[key] ?? [spec.min, spec.max];
          // sweep back and forth across the range over ~6 s
          const phase = ((ctx.params[key] - lo) / (hi - lo || 1));
          const dir = (ctx as unknown as { _dir?: Record<string, number> })._dir ??= {};
          dir[key] = dir[key] ?? 1;
          let next = phase + dir[key] * dt / 6 * L.speed;
          if (next >= 1) { next = 1; dir[key] = -1; } else if (next <= 0) { next = 0; dir[key] = 1; }
          const v = lo + next * (hi - lo);
          ctx.params[key] = v;
          L.onParam(key, v);
          changed = true;
        }
      }
      if (needUpdate) { changed = true; needUpdate = false; }
      busy = true;
      if (changed && inst) { try { inst.update(); } catch (e) { outRef.current.error = (e as Error).message; flush(); } }
      if (L.playing && inst?.tick) {
        const sdt = dt * L.speed;
        ctx.time.t += sdt;
        try { inst.tick(sdt); } catch (e) { outRef.current.error = (e as Error).message; flush(); }
        sinceT += dt;
        if (sinceT > 0.1) { sinceT = 0; L.onTime(ctx.time.t); }
      }
      busy = false;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      try { inst?.dispose(); } catch { /* ignore */ }
      view3d?.dispose(); plot?.dispose(); plot2?.dispose();
      instRef.current = null; ctxRef.current = null; apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, generation]);

  // controls changed → update the instance
  useEffect(() => {
    const ctx = ctxRef.current, inst = instRef.current;
    if (!ctx || !inst) return;
    let dirty = false;
    for (const p of demo.params) { const v = ws.params[p.key] ?? p.value; if (ctx.params[p.key] !== v) { ctx.params[p.key] = v; dirty = true; } }
    for (const c of demo.choices ?? []) { const v = ws.choices[c.key] ?? c.value; if (ctx.choices[c.key] !== v) { ctx.choices[c.key] = v; dirty = true; } }
    for (const t of demo.toggles ?? []) { const v = ws.toggles[t.key] ?? t.value; if (ctx.toggles[t.key] !== v) { ctx.toggles[t.key] = v; dirty = true; } }
    const input = ws.input || demo.input?.value || '';
    if (ctx.input !== input) { ctx.input = input; dirty = true; }
    if (dirty) { try { outRef.current.error = ''; inst.update(); } catch (e) { outRef.current.error = (e as Error).message; flush(); } }
  }, [ws.params, ws.choices, ws.toggles, ws.input, demo, flush]);

  useEffect(() => { if (ctxRef.current) { ctxRef.current.time.playing = playing; ctxRef.current.time.speed = speed; } }, [playing, speed]);

  // theme and display settings
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.view3d?.setTheme(dark); api.plot?.setTheme(dark); api.plot2?.setTheme(dark);
    if (ctxRef.current) { ctxRef.current.dark = dark; try { instRef.current?.update(); } catch { /* reported elsewhere */ } }
  }, [dark, apiRef]);
  useEffect(() => { const v = apiRef.current?.view3d; if (v) applyDisplay(v, ws); }, [ws.display, apiRef, ws]);

  const split = demo.view === 'split2d' || demo.view === 'split3d';
  return (
    <div className={`demo-host ${split ? 'split' : ''}`}>
      <div className="viewport" ref={mainRef} data-testid="viewport" />
      {split && <div className="viewport" ref={sideRef} />}
      {crash && <div className="viewport-error">{crash}</div>}
    </div>
  );
}

function applyDisplay(v: Viewport3D, ws: Workspace) {
  v.setWireframe(ws.display.wireframe);
  v.setSurfaceOpacity(ws.display.opacity);
  v.setAxesVisible(ws.display.axes);
  v.setGridVisible(ws.display.grid);
  v.setLighting(ws.display.lighting);
}
