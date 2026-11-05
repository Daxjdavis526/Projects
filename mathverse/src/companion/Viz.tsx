// The Companion's picture: a Plot2D or a Viewport3D (MathVerse's own engines),
// drawn from the problem, its sliders and its worked steps. A selected step
// with a picture of its own (the pieces of a derivative, the lines of a row
// operation) replaces the problem's picture until it is deselected.

import { useEffect, useRef, MutableRefObject } from 'react';
import { Plot2D } from '../engine/plot2d';
import { Viewport3D, Handle } from '../engine/viewport3d';
import type { Visual } from './tasks';
import { DrawCtx, drawDefault, drawVisual, initialView, equalAxes, needs3D, build3D, tone } from './draw';
import { Tex } from '../ui/tex';
import { symbolTeX } from '../core/expr';

export interface VizApi { png(): string | null; svg(): string | null; is3d: boolean }

interface Props { c: DrawCtx; visual: Visual | null; visualKey: string; apiRef: MutableRefObject<VizApi | null> }

export function Viz({ c, visual, visualKey, apiRef }: Props) {
  const three = needs3D(c, visual);
  return (
    <div className="cmp-viz">
      {three ? <Viz3 key="3d" c={c} visual={visual} visualKey={visualKey} apiRef={apiRef} /> : <Viz2 key="2d" c={c} visual={visual} visualKey={visualKey} apiRef={apiRef} />}
      <Legend c={c} visual={visual} />
    </div>
  );
}

function Viz2({ c, visual, visualKey, apiRef }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const plot = useRef<Plot2D | null>(null);
  useEffect(() => {
    const p = new Plot2D(host.current!, {});
    plot.current = p;
    apiRef.current = { png: () => p.screenshot(), svg: () => p.toSVG(), is3d: false };
    return () => { p.dispose(); plot.current = null; apiRef.current = null; };
  }, [apiRef]);
  // frame the picture when the problem, the picture or the selected step changes (not on every slider move)
  const viewKey = `${c.an.originalTeX}|${c.an.kind}|${c.viz}|${visualKey}|${c.work?.task ?? ''}|${c.work ? 1 : 0}`;
  useEffect(() => {
    const p = plot.current;
    if (!p) return;
    p.opts.equal = equalAxes(c.an, c.viz, visual);
    p.setView(initialView(c, visual));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);
  useEffect(() => {
    const p = plot.current;
    if (!p) return;
    p.setTheme(c.dark);
    p.setDraw((g) => { try { if (visual) drawVisual(g, visual, c); else drawDefault(g, c); } catch { /* a picture never takes the page down */ } });
  });
  return <div ref={host} className="cmp-canvas" />;
}

function Viz3({ c, visual, visualKey, apiRef }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<Viewport3D | null>(null);
  const layers = useRef<{ s: Handle[]; d: Handle[] }>({ s: [], d: [] });
  useEffect(() => {
    let v: Viewport3D;
    try { v = new Viewport3D(host.current!); } catch { return; }
    view.current = v;
    apiRef.current = { png: () => v.screenshot(), svg: () => null, is3d: true };
    return () => { v.dispose(); view.current = null; apiRef.current = null; layers.current = { s: [], d: [] }; };
  }, [apiRef]);
  useEffect(() => { view.current?.setTheme(c.dark); }, [c.dark]);
  const typed = JSON.stringify(c.an.params.map((p) => c.values[p.key]));
  const staticKey = `${c.an.originalTeX}|${c.viz}|${visualKey}|${typed}|${c.values.lo}|${c.values.hi}|${c.work?.task ?? ''}|${c.work ? c.work.answer?.tex ?? '' : ''}`;
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    layers.current.s.forEach((h) => h.dispose());
    try { layers.current.s = build3D(v, c, visual, 'static'); } catch { layers.current.s = []; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticKey]);
  const dynKey = `${staticKey}|${c.values.x0}|${c.values.y0}|${c.values.z0}|${JSON.stringify(c.work?.marks?.arrows ?? null)}`;
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    layers.current.d.forEach((h) => h.dispose());
    try { layers.current.d = build3D(v, c, visual, 'dynamic'); } catch { layers.current.d = []; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynKey]);
  return <div ref={host} className="cmp-canvas" />;
}

function Legend({ c, visual }: { c: DrawCtx; visual: Visual | null }) {
  const x = symbolTeX(c.an.vars[0] ?? 'x');
  let rows: { tex: string; color: string; dash?: boolean }[] = [];
  if (visual?.k === 'curves') rows = visual.items.map((it) => ({ tex: it.label, color: tone(it.tone ?? 0), dash: it.dash }));
  else if (visual?.k === 'rows') rows = visual.rows.map((r, i) => ({ tex: `\\text{row } ${i + 1}`, color: tone(i) }));
  else if (!visual) {
    switch (c.an.kind) {
      case 'function':
        rows = c.viz === 'taylor' ? [{ tex: `f(${x})`, color: tone(0) }, { tex: 'P_n', color: tone(1), dash: true }]
          : c.viz === 'area' ? [{ tex: `\\int_a^b f\\,d${x}`, color: tone(0) }]
            : c.work?.task === 'integral' && c.work.marks?.curve ? [{ tex: `f(${x})`, color: tone(0) }, { tex: `F(${x}) = \\int f\\,d${x}`, color: tone(3) }, { tex: '\\text{tangent to } f', color: tone(4), dash: true }]
              : [{ tex: `f(${x})`, color: tone(0) }, { tex: `f'(${x})`, color: tone(1), dash: true }, { tex: '\\text{tangent}', color: tone(4), dash: true }];
        break;
      case 'equation': rows = c.viz === 'zero' ? [{ tex: '\\text{lhs} - \\text{rhs}', color: tone(0) }] : [{ tex: '\\text{left side}', color: tone(0) }, { tex: '\\text{right side}', color: tone(1) }]; break;
      case 'system': rows = c.an.system!.vars.length === 2 ? c.an.system!.A.map((_, i) => ({ tex: `\\text{equation } ${i + 1}`, color: tone(i) })) : []; break;
      case 'ode1': case 'ode2': rows = c.viz === 'phaseplane' ? [{ tex: '\\text{trajectory}', color: tone(1) }] : [{ tex: '\\text{exact (SymPy)}', color: tone(0) }, { tex: '\\text{numerical}', color: tone(3) }]; break;
      case 'surface': rows = c.viz === 'contour' ? [{ tex: '\\nabla f', color: tone(1) }] : [{ tex: '\\text{tangent plane}', color: '#b48cff' }, { tex: '\\nabla f', color: tone(1) }]; break;
    }
  }
  if (!rows.length) return null;
  return (
    <ul className="cmp-legend">
      {rows.map((r, i) => <li key={i}><span className={`sw ${r.dash ? 'dash' : ''}`} style={{ borderColor: r.color }} /><Tex tex={r.tex} /></li>)}
    </ul>
  );
}
