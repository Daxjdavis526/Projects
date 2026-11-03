// The Homework Companion: a workspace that stays open beside homework. Type
// the problem; MathVerse reads it (or you pick the subject), offers the tasks
// that fit, works them with real engines — the step-recording differentiator,
// exact row reduction, SymPy in a background worker — and checks every
// answer numerically before showing it. Explore mode hints and reveals one
// step at a time; Step-by-step mode shows the whole justified working.
// Tabs, notes, a saved library, .mathverse export, PNG/SVG/TeX export, and a
// compact side-panel mode (with an always-on-top window on the desktop).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './companion.css';
import { Tex, Markup } from '../ui/tex';
import { Icon } from '../ui/icons';
import { ParamSlider } from '../ui/controls';
import { cas, CasStatus } from '../cas/client';
import { saveProject, openProject, exportFile, isDesktop } from '../project/io';
import type { ParamSpec } from '../core/input/classify';
import {
  Analysis, CompanionState, Problem, Subject, SUBJECTS, TASKS, TASK_KEYS, EXAMPLES, analyze, defaultTask, extraParams, loadState, saveState,
  newProblem, problemTitle, problemToWorkspace, workspaceToProblem,
} from './model';
import { runTask, Work, WorkStep, Check, workToTeX } from './tasks';
import { Viz, VizApi } from './Viz';
import type { DrawCtx } from './draw';

export interface CompanionProps { dark: boolean; compact: boolean; onCompact: (on: boolean) => void; onOpenDemo: (id: string, input?: string) => void }

type Run = { key: string; status: 'idle' | 'running' | 'done' | 'error'; work: Work | null; error: string; started: number };

const CHECK_LABEL: Record<Check['status'], string> = { verified: 'Verified', numerical: 'Numerical', unverified: 'Not verified', failed: 'Check failed' };
const CHECK_ICON: Record<Check['status'], string> = { verified: 'check', numerical: 'axes', unverified: 'warn', failed: 'x' };

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
/** numbers formatted for TeX (2.2\\times 10^{-9}) shown in prose: 2.2×10⁻⁹ */
const plainNumbers = (s: string) => s.replace(/\\times 10\^\{(-?\d+)\}/g, (_m, e: string) => `×10${[...e].map((ch) => SUP[ch] ?? ch).join('')}`);

/** apply plainNumbers outside $…$ only */
const plainOutsideMath = (s: string) => s.split(/(\$[^$]+\$)/g).map((part) => (part.startsWith('$') ? part : plainNumbers(part))).join('');

function CheckBadge({ c, full }: { c: Check; full?: boolean }) {
  const text = plainNumbers(c.text);
  return <span className={`cmp-check ${c.status}`} title={text}><Icon name={CHECK_ICON[c.status]} size={12} />{CHECK_LABEL[c.status]}{full && <span className="why">{text}</span>}</span>;
}

// ── desktop window: compact width and always-on-top (Tauri only) ────────────
let savedSize: unknown = null;
async function tauriWindow() {
  if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) return null;
  const [{ getCurrentWindow }, dpi] = await Promise.all([import('@tauri-apps/api/window'), import('@tauri-apps/api/dpi')]);
  return { win: getCurrentWindow(), dpi };
}
async function setWindowCompact(on: boolean) {
  try {
    const t = await tauriWindow();
    if (!t) return;
    if (on) {
      const size = await t.win.innerSize();
      const scale = await t.win.scaleFactor();
      savedSize = size;
      await t.win.setSize(new t.dpi.LogicalSize(420, Math.max(640, size.height / scale)));
    } else if (savedSize) {
      await t.win.setSize(savedSize as InstanceType<typeof t.dpi.PhysicalSize>);
      savedSize = null;
    }
  } catch { /* the window stays as it is */ }
}
async function setOnTop(on: boolean): Promise<boolean> {
  try { const t = await tauriWindow(); if (!t) return false; await t.win.setAlwaysOnTop(on); return true; } catch { return false; }
}

export function Companion({ dark, compact, onCompact, onOpenDemo }: CompanionProps) {
  const [state, setState] = useState<CompanionState>(() => loadState());
  useEffect(() => { const t = setTimeout(() => saveState(state), 250); return () => clearTimeout(t); }, [state]);
  const p = state.tabs[state.active];
  const now = () => new Date().toISOString();
  const update = useCallback((patch: Partial<Problem> | ((p: Problem) => Partial<Problem>)) => setState((s) => ({
    ...s, tabs: s.tabs.map((t, i) => (i === s.active ? { ...t, ...(typeof patch === 'function' ? patch(t) : patch), modified: now() } : t)),
  })), []);
  const setParam = useCallback((key: string, v: number) => update((t) => ({ params: { ...t.params, [key]: v } })), [update]);

  // ── the input (committed after a pause in typing, or on Enter) ────────────
  const [draft, setDraft] = useState(p.input);
  useEffect(() => { setDraft(p.input); }, [p.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (draft === p.input) return;
    const t = setTimeout(() => update({ input: draft, revealed: 0 }), 650);
    return () => clearTimeout(t);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps
  const commit = (s = draft) => { setDraft(s); update({ input: s, revealed: 0, task: '', viz: '' }); };

  const parsed = useMemo((): { an: Analysis | null; error: string } => {
    if (!p.input.trim()) return { an: null, error: '' };
    try { return { an: analyze(p.input, p.subject), error: '' }; } catch (e) { return { an: null, error: (e as Error).message }; }
  }, [p.input, p.subject]);
  const an = parsed.an;
  const task = an ? (an.tasks.some((t) => t.id === p.task) ? p.task : defaultTask(an)) : '';
  const preferred = ({ definite: 'area', series: 'taylor', solve: an?.kind === 'equation' ? 'sides' : 'graph' } as Record<string, string>)[task];
  const viz = an ? (an.vizes.some((v) => v.id === p.viz) ? p.viz : an.vizes.find((v) => v.id === preferred)?.id ?? an.vizes[0]?.id ?? '') : '';
  const specs: ParamSpec[] = useMemo(() => (an ? [...an.params, ...extraParams(an, task, viz)] : []), [an, task, viz]);
  const values = useMemo(() => Object.fromEntries(specs.map((s) => [s.key, p.params[s.key] ?? s.value])) as Record<string, number>, [specs, p.params]);

  // ── running the task ──────────────────────────────────────────────────────
  const [nonce, setNonce] = useState(0);
  const [run, setRun] = useState<Run>({ key: '', status: 'idle', work: null, error: '', started: 0 });
  const token = useRef(0);
  const relevant = an ? [...an.params.map((q) => q.key), ...(TASK_KEYS[task] ?? [])] : [];
  const runKey = JSON.stringify([p.input, p.subject, task, p.at, relevant.map((k) => values[k]), nonce]);
  useEffect(() => {
    if (!an || !task) { setRun({ key: runKey, status: 'idle', work: null, error: '', started: 0 }); return; }
    const id = ++token.current;
    const def = TASKS[task];
    setRun((r) => ({ ...r, key: runKey, status: 'running', error: '', started: performance.now(), work: r.work && r.work.task === task ? r.work : null }));
    const timer = setTimeout(() => {
      runTask({ an, task, params: values, at: p.at, cas })
        .then((w) => { if (id === token.current) setRun((r) => ({ ...r, status: 'done', work: w, error: '' })); })
        .catch((e) => { if (id === token.current) setRun((r) => ({ ...r, status: 'error', work: null, error: (e as Error).message })); });
    }, def?.cas ? 380 : 30);
    return () => clearTimeout(timer);
  }, [runKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const work = run.work;

  // the algebra engine's status, and elapsed time for long jobs
  const [casStatus, setCasStatus] = useState<CasStatus>(cas.status);
  useEffect(() => { const off = cas.onStatus(setCasStatus); return () => { off(); }; }, []);
  const [, tick] = useState(0);
  useEffect(() => {
    if (run.status !== 'running' || !TASKS[task]?.cas) return;
    const i = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(i);
  }, [run.status, task]);
  const elapsed = run.status === 'running' ? (performance.now() - run.started) / 1000 : 0;

  // ── steps: selection, hints, reveal ───────────────────────────────────────
  const [sel, setSel] = useState<number | null>(null);
  const [hintFor, setHintFor] = useState<number | null>(null);
  useEffect(() => { setSel(null); setHintFor(null); }, [p.id, task, p.input]);
  const steps = work?.steps ?? [];
  const explore = p.mode === 'explore';
  const revealed = explore ? Math.min(p.revealed, steps.length) : steps.length;
  const allShown = revealed >= steps.length;
  const selStep = sel !== null && sel < revealed ? steps[sel] : null;
  const visual = selStep?.visual ?? null;

  // ── animation of sliders ──────────────────────────────────────────────────
  const [animating, setAnimating] = useState<Set<string>>(new Set());
  const dirs = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!animating.size) return;
    let raf = 0, last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000); last = t;
      update((q) => {
        const params = { ...q.params };
        for (const k of animating) {
          const s = specs.find((x) => x.key === k); if (!s) continue;
          const [lo, hi] = q.ranges[k] ?? [s.min, s.max];
          const dir = dirs.current[k] ?? 1;
          let v = (params[k] ?? s.value) + dir * dt * (hi - lo) / 6;
          if (v > hi) { v = hi; dirs.current[k] = -1; } else if (v < lo) { v = lo; dirs.current[k] = 1; }
          params[k] = +v.toFixed(5);
        }
        return { params };
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animating, specs, update]);

  // ── tabs, library, files ──────────────────────────────────────────────────
  const [toast, setToast] = useState('');
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };
  const [library, setLibrary] = useState(false);
  const [preview, setPreview] = useState(false);
  const [onTop, setOnTopState] = useState(false);
  const vizApi = useRef<VizApi | null>(null);

  const addTab = (prob = newProblem('')) => setState((s) => ({ ...s, tabs: [...s.tabs, prob], active: s.tabs.length }));
  const closeTab = (i: number) => setState((s) => {
    const tabs = s.tabs.filter((_, k) => k !== i);
    if (!tabs.length) tabs.push(newProblem(''));
    return { ...s, tabs, active: Math.min(tabs.length - 1, i <= s.active ? Math.max(0, s.active - 1) : s.active) };
  });
  const saveToLibrary = () => {
    setState((s) => {
      const cur = s.tabs[s.active];
      const saved = s.saved.some((q) => q.id === cur.id) ? s.saved.map((q) => (q.id === cur.id ? { ...cur } : q)) : [{ ...cur }, ...s.saved];
      return { ...s, saved };
    });
    flash('Saved to your problem library (kept on this computer)');
  };
  const openSaved = (q: Problem) => {
    const i = state.tabs.findIndex((t) => t.id === q.id);
    if (i >= 0) setState((s) => ({ ...s, active: i, tabs: s.tabs.map((t, k) => (k === i ? { ...q } : t)) }));
    else addTab({ ...q });
    setLibrary(false);
  };
  const exportProject = async () => {
    try {
      const r = await saveProject({ format: 'mathverse', version: 1, name: 'Homework', created: state.tabs[0]?.created ?? now(), modified: '', tabs: state.tabs.map(problemToWorkspace), active: state.active });
      if (r) flash(`Exported ${r}`);
    } catch (e) { flash(`Could not export: ${(e as Error).message}`); }
  };
  const importProject = async () => {
    try {
      const r = await openProject();
      if (!r) return;
      const probs = r.project.tabs.map(workspaceToProblem);
      setState((s) => ({ ...s, tabs: [...s.tabs, ...probs], active: s.tabs.length }));
      flash(`Opened ${probs.length} problem${probs.length === 1 ? '' : 's'} from ${r.path}`);
    } catch (e) { flash(`Could not open: ${(e as Error).message}`); }
  };
  const base = problemTitle(p).replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'problem';
  const exportPNG = async () => { const d = vizApi.current?.png(); if (d) { const r = await exportFile(`${base}.png`, d, 'image/png', 'png'); if (r) flash(`Saved ${r}`); } };
  const exportSVG = async () => { const d = vizApi.current?.svg(); if (d) { const r = await exportFile(`${base}.svg`, d, 'image/svg+xml', 'svg'); if (r) flash(`Saved ${r}`); } else flash('SVG export is for 2D pictures; use PNG for 3D'); };
  const exportTeX = async () => { if (!work || !an) return; const r = await exportFile(`${base}.tex`, workToTeX(problemTitle(p), an.originalTeX, work), 'application/x-tex', 'tex'); if (r) flash(`Saved ${r}`); };
  const toggleCompact = () => { const on = !compact; onCompact(on); void setWindowCompact(on); };
  const toggleOnTop = async () => { const ok = await setOnTop(!onTop); if (ok) setOnTopState(!onTop); };
  useEffect(() => () => { if (compact) { void setWindowCompact(false); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const drawCtx: DrawCtx | null = an ? { an, viz, values, work: work && work.task === task ? work : null, at: p.at, dark, setParam } : null;

  // ── sections ──────────────────────────────────────────────────────────────
  const inputSec = (
    <section className="cmp-input">
      <form className={`cmp-entry ${parsed.error ? 'bad' : ''}`} onSubmit={(e) => { e.preventDefault(); commit(); }}>
        <Icon name="pen" size={16} />
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type the problem:  x^2 sin x    ∫ x e^x dx    lim x→0 sin(x)/x    x² − 5x + 6 = 0    [[2,1],[1,2]]    dy/dt = −2y"
          aria-label="The problem you are working on" spellCheck={false} />
        <button type="submit" className="primary" title="Work on it (Enter)">Go</button>
      </form>
      {parsed.error && <p className="cmp-error" role="alert">{parsed.error}</p>}
      <div className="cmp-row">
        <label className="cmp-field"><span>Subject</span>
          <select value={p.subject} onChange={(e) => update({ subject: e.target.value as Subject, task: '', revealed: 0 })}>
            {SUBJECTS.map(([k, l]) => <option key={k} value={k}>{k === 'auto' && an ? `Auto-detect (${SUBJECTS.find(([s]) => s === an.guessed)?.[1]})` : l}</option>)}
          </select>
        </label>
        <div className="cmp-field"><span>Mode</span>
          <div className="seg cmp-mode">
            <button className={explore ? 'on' : ''} onClick={() => update({ mode: 'explore' })} title="Experiment and visualize; hints and one step at a time">Explore</button>
            <button className={!explore ? 'on' : ''} onClick={() => update({ mode: 'steps' })} title="The full justified working, every rule named">Step-by-step</button>
          </div>
        </div>
      </div>
    </section>
  );

  const examplesSec = !p.input.trim() && (
    <section className="cmp-examples">
      <p className="muted">Type the equation you are working on — or start from an example:</p>
      {EXAMPLES.map(([g, xs]) => (
        <div key={g} className="cmp-ex-group"><span>{g}</span><div className="examples">{xs.map((x) => <button key={x} onClick={() => commit(x)}>{x}</button>)}</div></div>
      ))}
    </section>
  );

  const eqSec = an && (
    <section className="cmp-eq">
      <div className="cmp-eq-row"><span className="lbl">Original</span><div className="equation"><Tex tex={an.originalTeX} display /></div></div>
      {an.rearranged && <div className="cmp-eq-row"><span className="lbl">{an.rearranged.label}</span><div className="equation"><Tex tex={an.rearranged.tex} display /></div></div>}
      {work?.answer && allShown && (
        <div className="cmp-eq-row answer"><span className="lbl">{work.answer.label}</span><div className="equation"><Tex tex={work.answer.tex} display /></div><CheckBadge c={work.check} full /></div>
      )}
      <p className="cmp-describe">{an.describe}</p>
      {an.warnings.map((w, i) => <p key={i} className="cmp-warn"><Icon name="warn" size={13} /> {w}</p>)}
    </section>
  );

  const taskSec = an && (
    <section className="cmp-tasks">
      <div className="cmp-chips" role="tablist" aria-label="What to do">
        {an.tasks.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === task} className={`chip ${t.id === task ? 'on' : ''} ${t.subjects.includes(an.subject) ? '' : 'other'}`} title={t.blurb} onClick={() => update({ task: t.id, revealed: 0, viz: '' })}>
            {t.label}{t.cas && <span className="tag">SymPy</span>}
          </button>
        ))}
      </div>
      {TASKS[task] && <p className="cmp-blurb">{TASKS[task].blurb}</p>}
      {(task === 'limit' || task === 'series') && !an.intent.at && (
        <label className="cmp-at">{task === 'limit' ? <Tex tex={`${an.vars[0] ?? 'x'} \\to`} /> : <span>about</span>}
          <input value={p.at} onChange={(e) => update({ at: e.target.value })} spellCheck={false} aria-label="The point" />
          <span className="muted small">a number, pi/2, inf, -inf</span>
        </label>
      )}
      {run.status === 'running' && TASKS[task]?.cas && (
        <div className="cmp-busy" role="status">
          <span className="spinner" />
          <span>{casStatus === 'loading' ? 'Loading SymPy in the background (first use: a few seconds)…' : 'SymPy is working…'} {elapsed >= 1 ? `${elapsed.toFixed(0)} s` : ''}</span>
          <button onClick={() => cas.cancel()}>Cancel</button>
        </div>
      )}
      {run.status === 'error' && (
        <div className="cmp-failed" role="alert"><Icon name="warn" size={14} /> <span>{run.error === 'Cancelled' ? 'Cancelled.' : run.error}</span><button onClick={() => setNonce((n) => n + 1)}>Try again</button></div>
      )}
      {casStatus === 'error' && <p className="cmp-warn">The algebra engine is unavailable ({cas.error}); tasks that need SymPy cannot run. Derivatives, row reduction and the pictures still work.</p>}
    </section>
  );

  const renderStep = (s: WorkStep, i: number) => (
    <li key={i} className={`cmp-step d${Math.min(3, s.depth ?? 0)} ${sel === i ? 'sel' : ''} ${s.visual ? 'has-vis' : ''}`} onClick={() => setSel(sel === i ? null : i)}>
      <div className="cmp-step-head">
        <span className="n">{i + 1}</span>
        <b>{s.title}</b>
        {s.rule && <span className="rule">{s.rule}</span>}
        {s.check && <CheckBadge c={s.check} />}
        {s.visual && <span className="vis" title="Click to see this step in the picture"><Icon name="image" size={13} /></span>}
      </div>
      {s.tex && <div className="cmp-step-tex"><Tex tex={s.tex} display /></div>}
      {s.detail && <Markup className="cmp-step-detail" text={plainOutsideMath(s.detail)} />}
    </li>
  );

  const stepsSec = an && (
    <section className="cmp-work-steps">
      <div className="cmp-sec-head">
        <h3>{explore ? 'Work it out' : 'Worked solution'}</h3>
        {work && <span className="muted small">{work.engine}</span>}
      </div>
      {!work && run.status !== 'error' && <p className="muted">{run.status === 'running' ? 'Working…' : ''}</p>}
      {work && (
        <>
          <ol className="cmp-steps">{steps.slice(0, revealed).map(renderStep)}</ol>
          {explore && !allShown && (
            <div className="cmp-next">
              <p className="muted">{revealed === 0 ? 'Explore the picture and the sliders first. When you want help:' : `Step ${revealed + 1} of ${steps.length}.`}</p>
              {hintFor === revealed && steps[revealed].hint && <div className="task"><Icon name="spark" size={15} /><Markup text={`**Hint.** ${steps[revealed].hint}`} /></div>}
              <div className="btn-row">
                {steps[revealed]?.hint && hintFor !== revealed && <button onClick={() => setHintFor(revealed)}><Icon name="spark" size={13} /> Hint</button>}
                <button className="primary" onClick={() => update({ revealed: revealed + 1 })}>Show next step</button>
                <button onClick={() => update({ mode: 'steps' })} title="Switch to the full worked solution">Show the full solution</button>
              </div>
            </div>
          )}
          {allShown && (
            <div className="cmp-verify"><CheckBadge c={work.check} full /></div>
          )}
          {allShown && work.notes.map((n, i) => <p key={i} className="muted small">{n}</p>)}
        </>
      )}
    </section>
  );

  const notesSec = (
    <section className="cmp-notes">
      <div className="cmp-sec-head">
        <h3>Notes</h3>
        <div className="btn-row">
          {work?.answer && allShown && <button onClick={() => update({ notes: `${p.notes}${p.notes && !p.notes.endsWith('\n') ? '\n' : ''}$$${work.answer!.tex}$$\n` })} title="Append the answer (as LaTeX) to the notes">Add answer</button>}
          <button className={preview ? 'on' : ''} onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
        </div>
      </div>
      {preview ? <Markup className="cmp-notes-preview" text={p.notes || '*No notes yet.*'} />
        : <textarea className="notes" value={p.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Your notes — $\LaTeX$ in dollars renders in Preview. Saved automatically." />}
    </section>
  );

  const vizSec = an && drawCtx && (
    <section className="cmp-visual">
      <div className="cmp-viz-bar">
        {an.vizes.length > 1 && <div className="seg">{an.vizes.map((v) => <button key={v.id} className={v.id === viz && !visual ? 'on' : ''} onClick={() => { setSel(null); update({ viz: v.id }); }}>{v.label}</button>)}</div>}
        {visual && <button className="cmp-back" onClick={() => setSel(null)} title="Back to the problem's picture"><Icon name="x" size={12} /> Step {sel! + 1}</button>}
        <span className="grow" />
        <button className="icon-btn sm" title="Export PNG" onClick={exportPNG}><Icon name="image" size={16} /></button>
        <button className="icon-btn sm" title="Export SVG (2D)" onClick={exportSVG}><Icon name="down" size={16} /></button>
        {an.demoInput && <button className="icon-btn sm" title="Open as a full demonstration (new tab)" onClick={() => onOpenDemo('explore', an.demoInput!)}><Icon name="expand" size={16} /></button>}
      </div>
      {an.vizes.length || visual ? <Viz c={drawCtx} visual={visual} visualKey={sel === null ? '' : `${task}:${sel}`} apiRef={vizApi} /> : <div className="cmp-viz empty"><p className="muted">No picture for a single number.</p></div>}
    </section>
  );

  const paramsSec = an && specs.length > 0 && (
    <section className="cmp-params">
      <h3>Parameters</h3>
      {specs.map((s) => (
        <ParamSlider key={s.key} spec={s} value={values[s.key]} range={p.ranges[s.key]} animating={animating.has(s.key)} sound={false}
          onChange={(v) => setParam(s.key, s.step === 1 ? Math.round(v) : v)} onRange={(r) => update((t) => ({ ranges: { ...t.ranges, [s.key]: r } }))}
          onAnimate={() => setAnimating((a) => { const n = new Set(a); if (n.has(s.key)) n.delete(s.key); else n.add(s.key); return n; })} />
      ))}
    </section>
  );

  const libSec = library && (
    <div className="cmp-library" role="dialog" aria-label="Saved problems">
      <div className="cmp-sec-head"><h3>Saved problems</h3><button className="icon-btn sm" onClick={() => setLibrary(false)} title="Close"><Icon name="x" size={14} /></button></div>
      {state.saved.length === 0 && <p className="muted small">Nothing saved yet. “Save” keeps the current problem, its notes and settings on this computer.</p>}
      <ul>
        {state.saved.map((q) => (
          <li key={q.id}>
            <button className="open" onClick={() => openSaved(q)}><b>{problemTitle(q)}</b><span>{q.input}</span><small>{new Date(q.modified).toLocaleString()}</small></button>
            <button className="tab-x" title="Delete from the library" onClick={() => setState((s) => ({ ...s, saved: s.saved.filter((x) => x.id !== q.id) }))}><Icon name="x" size={12} /></button>
          </li>
        ))}
      </ul>
      <div className="btn-row"><button onClick={importProject}><Icon name="open" size={13} /> Open .mathverse…</button></div>
    </div>
  );

  return (
    <div className={`cmp ${compact ? 'compact' : ''}`}>
      <div className="cmp-top">
        <div className="tabs cmp-tabs" role="tablist">
          {state.tabs.map((t, i) => (
            <div key={t.id} className={`tab ${i === state.active ? 'on' : ''}`} role="tab" aria-selected={i === state.active}>
              <button onClick={() => setState((s) => ({ ...s, active: i }))} title={t.input}>{problemTitle(t)}</button>
              <button className="tab-x" title="Close tab" onClick={() => closeTab(i)}><Icon name="x" size={12} /></button>
            </div>
          ))}
          <button className="tab-new" title="New problem" onClick={() => addTab()}><Icon name="plus" size={14} /></button>
        </div>
        <div className="cmp-actions">
          <button className="icon-btn sm" title="Save this problem to the library" onClick={saveToLibrary}><Icon name="save" size={16} /></button>
          <button className={`icon-btn sm ${library ? 'on' : ''}`} title="Saved problems" onClick={() => setLibrary(!library)}><Icon name="book" size={16} /></button>
          <button className="icon-btn sm" title="Export all tabs as a .mathverse project" onClick={exportProject}><Icon name="layers" size={16} /></button>
          <button className="icon-btn sm" title="Export the worked solution as LaTeX" onClick={exportTeX} disabled={!work}><Icon name="clipboard" size={16} /></button>
          {isDesktop() && <button className={`icon-btn sm ${onTop ? 'on' : ''}`} title={onTop ? 'Always on top: on' : 'Keep the window on top of others'} onClick={toggleOnTop}><Icon name="panel" size={16} /></button>}
          <button className={`icon-btn sm ${compact ? 'on' : ''}`} title={compact ? 'Leave the side-panel mode' : 'Side-panel mode: a narrow column beside your PDF or homework site'} onClick={toggleCompact}><Icon name="compact" size={16} /></button>
        </div>
      </div>
      {libSec}
      {compact ? (
        <div className="cmp-body one">
          {inputSec}{examplesSec}{eqSec}{taskSec}{vizSec}{paramsSec && <details className="cmp-params-wrap"><summary>Parameters ({specs.length})</summary>{paramsSec}</details>}{stepsSec}{notesSec}
        </div>
      ) : (
        <div className="cmp-body">
          <div className="cmp-left">{inputSec}{examplesSec}{eqSec}{taskSec}{stepsSec}{notesSec}</div>
          <div className="cmp-right">{vizSec || <div className="cmp-viz empty"><p className="muted">The picture appears here.</p></div>}{paramsSec}</div>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
