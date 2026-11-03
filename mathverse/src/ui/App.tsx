// MathVerse's shell: the universal input bar, workspace tabs, the left sidebar
// (subjects), the centre viewport, the right inspector (equation, parameters,
// readouts, display), the bottom panel (timeline, explanation, steps,
// experiments, tutorial, notes), the command palette and keyboard shortcuts.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEMOS, byId } from '../modules/registry';
import type { DemoDef } from '../modules/types';
import { MODULES } from '../modules/types';
import { exploreDemo } from '../modules/explore';
import { classify, InputError } from '../core/input/classify';
import { DemoHost, HostApi, HostOutputs } from './DemoHost';
import { Sidebar, Place } from './Sidebar';
import { Home, TutorialList, FidgetGallery } from './Home';
import { Palette, Command } from './Palette';
import { ParamSlider, ChoiceControl, ToggleControl, Readouts, Label } from './controls';
import { Tex, Markup } from './tex';
import { Icon } from './icons';
import { loadSettings, saveSettings, Settings } from './settings';
import { Project, Workspace, emptyWorkspace } from '../project/format';
import { saveProject, openProject, exportFile, isDesktop } from '../project/io';
import { Companion } from '../companion/Companion';
import { cas, CasStatus } from '../cas/client';
import { blip } from './sound';
import { parse, compile, freeSymbols } from '../core/expr';

// the list of demonstrations, for the end-to-end smoke test
(window as unknown as { __MV_DEMOS: string[] }).__MV_DEMOS = DEMOS.map((d) => d.id);

/** Recompute linked parameters (key = expression of the others), a few passes so chains settle. */
function withLinks(params: Record<string, number>, links: Record<string, string>): Record<string, number> {
  const keys = Object.keys(links);
  for (let pass = 0; pass < 3 && keys.length; pass++) {
    for (const k of keys) {
      try { const n = parse(links[k]); const v = compile(n, [], params)([]); if (Number.isFinite(v)) params[k] = v; } catch { /* a link to a missing parameter is skipped */ }
    }
  }
  return params;
}

interface Preset { name: string; params: Record<string, number>; choices: Record<string, string>; toggles: Record<string, boolean>; links: Record<string, string> }
const PRESETS_KEY = 'mathverse:presets';
const loadPresets = (): Record<string, Preset[]> => { try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}'); } catch { return {}; } };
const savePresets = (p: Record<string, Preset[]>) => { try { localStorage.setItem(PRESETS_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ } };

const newProject = (): Project => ({ format: 'mathverse', version: 1, name: 'Untitled', created: new Date().toISOString(), modified: '', tabs: [], active: 0 });

export default function App() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);
  const setSettings = useCallback((patch: Partial<Settings>) => setSettingsState((s) => { const n = { ...s, ...patch }; saveSettings(n); return n; }), []);
  const [project, setProject] = useState<Project>(newProject);
  const [projectPath, setProjectPath] = useState<string | undefined>();
  const [dirty, setDirty] = useState(false);
  const [place, setPlace] = useState<Place>({ kind: 'home' });
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [animating, setAnimating] = useState<Set<string>>(new Set());
  const [outputs, setOutputs] = useState<HostOutputs>({ readouts: [], steps: [], note: '', warning: '', error: '' });
  const [palette, setPalette] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [bottomTab, setBottomTab] = useState<'explain' | 'steps' | 'try' | 'tutorial' | 'notes'>('explain');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState<{ msg: string; pos: number } | null>(null);
  const [toast, setToast] = useState('');
  const [casStatus, setCasStatus] = useState<CasStatus>('idle');
  const [compact, setCompact] = useState(false);
  const apiRef = useRef<HostApi | null>(null);
  const dark = settings.theme === 'dark';

  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);
  // direct links: #/demo/<id>, #/demo/<id>/tutorial, #/explore/<expression>, #/companion, #/tutorials, #/fidget
  useEffect(() => {
    const go = () => {
      const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
      if (!h) return;
      const [kind, ...rest] = h.split('/');
      if (kind === 'demo' && rest[0]) openDemo(rest[0] + (rest[1] === 'tutorial' ? '#tutorial' : ''));
      else if (kind === 'explore' && rest.length) tryInput(rest.join('/'));
      else if (kind === 'companion') setPlace({ kind: 'companion' });
      else if (kind === 'tutorials') setPlace({ kind: 'tutorials' });
      else if (kind === 'fidget') setPlace({ kind: 'fidget' });
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => cas.onStatus(setCasStatus) as unknown as () => void, []);
  // warm the algebra engine in the background a few seconds after start-up
  useEffect(() => { const t = setTimeout(() => { cas.start().catch(() => {}); }, 4000); return () => clearTimeout(t); }, []);
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2600); };

  const ws: Workspace | null = place.kind === 'demo' ? project.tabs[project.active] ?? null : null;
  const demo: DemoDef | null = useMemo(() => {
    if (!ws) return null;
    if (ws.demoId === 'explore') { try { return exploreDemo(ws.input || 'f(x) = x^3 - 4x'); } catch { return null; } }
    return byId.get(ws.demoId) ?? null;
    // the explore demo is rebuilt when its input is committed (generation bumps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws?.demoId, ws?.demoId === 'explore' ? ws?.input : '', generation]);

  const updateWs = useCallback((patch: Partial<Workspace> | ((w: Workspace) => Partial<Workspace>)) => {
    setProject((p) => {
      const tabs = p.tabs.slice();
      const cur = tabs[p.active];
      if (!cur) return p;
      tabs[p.active] = { ...cur, ...(typeof patch === 'function' ? patch(cur) : patch) };
      return { ...p, tabs };
    });
    setDirty(true);
  }, []);

  /** Open a demo (in the current tab if it is empty, else a new tab). id may end in #tutorial. */
  const openDemo = useCallback((idWithHash: string, input?: string, newTab = false) => {
    const [id, hash] = idWithHash.split('#');
    const d = id === 'explore' ? null : byId.get(id);
    if (id !== 'explore' && !d) return;
    setProject((p) => {
      const w = { ...emptyWorkspace(id, d?.title ?? 'Explore'), input: input ?? '' };
      const tabs = p.tabs.slice();
      if (!tabs.length || newTab) { tabs.push(w); return { ...p, tabs, active: tabs.length - 1 }; }
      tabs[p.active] = w;
      return { ...p, tabs };
    });
    setPlace({ kind: 'demo', id });
    setPlaying(false); setAnimating(new Set()); setTutorialStep(0);
    setBottomTab(hash === 'tutorial' ? 'tutorial' : 'explain');
    setGeneration((g) => g + 1);
    setInputError(null);
  }, []);

  const tryInput = useCallback((src: string) => {
    try { classify(src); } catch (e) {
      if (e instanceof InputError) { setInputError({ msg: e.message, pos: e.pos }); return; }
      setInputError({ msg: String((e as Error).message), pos: 0 }); return;
    }
    setInputText(src);
    openDemo('explore', src, place.kind === 'demo' && ws?.demoId !== 'explore');
  }, [openDemo, place.kind, ws?.demoId]);

  // ── project files ───────────────────────────────────────────────────────
  const captureView = useCallback((): Partial<Workspace> => {
    const api = apiRef.current;
    return { camera: api?.view3d?.getCamera(), view2d: api?.plot ? { ...api.plot.view } : undefined };
  }, []);
  const doSave = useCallback(async (as = false) => {
    if (!project.tabs.length) { flash('Nothing to save yet — open a demonstration first'); return; }
    const p = { ...project, tabs: project.tabs.map((t, i) => (i === project.active ? { ...t, ...captureView() } : t)) };
    try {
      const path = await saveProject(p, as ? undefined : projectPath);
      if (!path) return;
      setProjectPath(isDesktop() ? path : undefined);
      setDirty(false);
      setSettings({ recent: [{ name: p.name, path: isDesktop() ? path : undefined, at: Date.now() }, ...settings.recent.filter((r) => r.path !== path)].slice(0, 12) });
      flash(`Saved ${path.split(/[\\/]/).pop()}`);
    } catch (e) { flash(`Could not save: ${(e as Error).message}`); }
  }, [project, projectPath, captureView, setSettings, settings.recent]);
  const doOpen = useCallback(async (path?: string) => {
    try {
      const r = await openProject(path);
      if (!r) return;
      setProject(r.project); setProjectPath(isDesktop() ? r.path : undefined); setDirty(false);
      const w = r.project.tabs[r.project.active];
      setPlace({ kind: 'demo', id: w.demoId }); setGeneration((g) => g + 1);
      setSettings({ recent: [{ name: r.project.name, path: isDesktop() ? r.path : undefined, at: Date.now() }, ...settings.recent.filter((x) => x.path !== r.path)].slice(0, 12) });
      flash(`Opened ${r.project.name}`);
    } catch (e) { flash(`Could not open: ${(e as Error).message}`); }
  }, [setSettings, settings.recent]);
  const exportPNG = useCallback(async () => {
    const api = apiRef.current; if (!api) return;
    const url = api.view3d?.screenshot() ?? api.plot?.screenshot();
    if (url) { const p = await exportFile(`${demo?.title ?? 'mathverse'}.png`, url, 'image/png', 'png'); if (p) flash('Image exported'); }
  }, [demo]);
  const exportSVG = useCallback(async () => {
    const plot = apiRef.current?.plot;
    if (!plot) { flash('SVG export is available for 2D plots; use PNG for 3D views'); return; }
    const p = await exportFile(`${demo?.title ?? 'mathverse'}.svg`, plot.toSVG(), 'image/svg+xml', 'svg'); if (p) flash('SVG exported');
  }, [demo]);
  const exportCSV = useCallback(async () => {
    const csv = apiRef.current?.instance?.csv?.();
    if (!csv) { flash('This demonstration has no tabular data to export'); return; }
    const p = await exportFile(`${demo?.title ?? 'mathverse'}.csv`, csv, 'text/csv', 'csv'); if (p) flash('CSV exported');
  }, [demo]);
  const exportTeX = useCallback(async () => {
    if (!demo) return;
    const tex = `% ${demo.title} — exported from MathVerse\n\\[ ${demo.tex} \\]\n${demo.params.map((p) => `% ${p.key} = ${ws?.params[p.key] ?? p.value}`).join('\n')}\n`;
    try { await navigator.clipboard.writeText(demo.tex); } catch { /* clipboard unavailable */ }
    const p = await exportFile(`${demo.title}.tex`, tex, 'text/x-tex', 'tex'); if (p) flash('LaTeX exported (and copied)');
  }, [demo, ws]);
  const exportParams = useCallback(async () => {
    if (!ws) return;
    const p = await exportFile(`${demo?.title ?? 'parameters'}.json`, JSON.stringify({ demo: ws.demoId, input: ws.input, params: ws.params, ranges: ws.paramRanges, choices: ws.choices, toggles: ws.toggles }, null, 2), 'application/json', 'json');
    if (p) flash('Parameters exported');
  }, [ws, demo]);

  // ── commands and shortcuts ──────────────────────────────────────────────
  const view = (w: 'iso' | 'top' | 'front' | 'side') => apiRef.current?.view3d?.view(w);
  const commands: Command[] = useMemo(() => [
    { id: 'save', group: 'File', title: 'Save project', keys: 'Ctrl+S', run: () => doSave() },
    { id: 'saveas', group: 'File', title: 'Save project as…', keys: 'Ctrl+Shift+S', run: () => doSave(true) },
    { id: 'open', group: 'File', title: 'Open project…', keys: 'Ctrl+O', run: () => doOpen() },
    { id: 'png', group: 'Export', title: 'Export image (PNG)', run: exportPNG },
    { id: 'svg', group: 'Export', title: 'Export plot (SVG)', run: exportSVG },
    { id: 'csv', group: 'Export', title: 'Export data (CSV)', run: exportCSV },
    { id: 'tex', group: 'Export', title: 'Export equation (LaTeX)', run: exportTeX },
    { id: 'params', group: 'Export', title: 'Export parameter configuration', run: exportParams },
    { id: 'theme', group: 'View', title: dark ? 'Switch to light mode' : 'Switch to dark mode', run: () => setSettings({ theme: dark ? 'light' : 'dark' }) },
    { id: 'max', group: 'View', title: 'Maximize the viewport', keys: 'F', run: () => setMaximized((m) => !m) },
    { id: 'left', group: 'View', title: 'Toggle the subjects panel', keys: 'Ctrl+B', run: () => setSettings({ leftOpen: !settings.leftOpen }) },
    { id: 'right', group: 'View', title: 'Toggle the inspector', keys: 'Ctrl+I', run: () => setSettings({ rightOpen: !settings.rightOpen }) },
    { id: 'bottom', group: 'View', title: 'Toggle the bottom panel', keys: 'Ctrl+J', run: () => setSettings({ bottomOpen: !settings.bottomOpen }) },
    { id: 'reset-cam', group: 'Camera', title: 'Reset camera', keys: 'R', run: () => { apiRef.current?.view3d?.resetCamera(); } },
    { id: 'v-top', group: 'Camera', title: 'View from the top', keys: '1', run: () => view('top') },
    { id: 'v-front', group: 'Camera', title: 'View from the front', keys: '2', run: () => view('front') },
    { id: 'v-side', group: 'Camera', title: 'View from the side', keys: '3', run: () => view('side') },
    { id: 'v-iso', group: 'Camera', title: 'Isometric view', keys: '4', run: () => view('iso') },
    { id: 'proj', group: 'Camera', title: 'Toggle perspective / orthographic', keys: 'P', run: () => { const v = apiRef.current?.view3d; if (v) v.setProjection(v.getCamera().projection === 'perspective' ? 'orthographic' : 'perspective'); } },
    { id: 'play', group: 'Timeline', title: 'Play / pause', keys: 'Space', run: () => setPlaying((p) => !p) },
    { id: 'rewind', group: 'Timeline', title: 'Reset the timeline', run: () => apiRef.current?.resetTime() },
    { id: 'reset-demo', group: 'Demo', title: 'Reset all parameters', run: () => { updateWs({ params: {}, paramRanges: {}, choices: {}, toggles: {} }); setGeneration((g) => g + 1); } },
    { id: 'newtab', group: 'Tabs', title: 'New tab', keys: 'Ctrl+T', run: () => openDemo('explore', 'f(x) = x^3 - 4x', true) },
    { id: 'sound', group: 'Preferences', title: settings.sound ? 'Mute interaction sounds' : 'Turn on interaction sounds', run: () => setSettings({ sound: !settings.sound }) },
    { id: 'companion', group: 'Go to', title: 'Homework Companion', run: () => setPlace({ kind: 'companion' }) },
    { id: 'tutorials', group: 'Go to', title: 'Tutorials', run: () => setPlace({ kind: 'tutorials' }) },
    { id: 'home', group: 'Go to', title: 'Home', run: () => setPlace({ kind: 'home' }) },
    ...DEMOS.map((d) => ({ id: `demo:${d.id}`, group: MODULES.find((m) => m.id === d.module)?.short ?? 'Fidget', title: d.title, hint: d.topic, run: () => openDemo(d.id) })),
  ], [doSave, doOpen, exportPNG, exportSVG, exportCSV, exportTeX, exportParams, dark, settings, setSettings, openDemo, updateWs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); return; }
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(e.shiftKey); return; }
      if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); doOpen(); return; }
      if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); setSettings({ leftOpen: !settings.leftOpen }); return; }
      if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); setSettings({ rightOpen: !settings.rightOpen }); return; }
      if (mod && e.key.toLowerCase() === 'j') { e.preventDefault(); setSettings({ bottomOpen: !settings.bottomOpen }); return; }
      if (mod && e.key.toLowerCase() === 't') { e.preventDefault(); openDemo('explore', 'f(x) = x^3 - 4x', true); return; }
      if (typing || mod) return;
      if (e.key === ' ' && demo?.animated) { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === 'f' || e.key === 'F') setMaximized((m) => !m);
      else if (e.key === 'Escape') { setMaximized(false); }
      else if (e.key === 'r' || e.key === 'R') apiRef.current?.view3d?.resetCamera();
      else if (e.key === 'p' || e.key === 'P') { const v = apiRef.current?.view3d; if (v) v.setProjection(v.getCamera().projection === 'perspective' ? 'orthographic' : 'perspective'); }
      else if (['1', '2', '3', '4'].includes(e.key)) view((['top', 'front', 'side', 'iso'] as const)[Number(e.key) - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doSave, doOpen, setSettings, settings, demo, openDemo]);

  // tutorial: apply a step's settings when it opens
  const tutorial = demo?.tutorial;
  useEffect(() => {
    if (!tutorial || bottomTab !== 'tutorial') return;
    const st = tutorial[tutorialStep];
    if (!st?.set) return;
    updateWs((w) => ({ params: { ...w.params, ...(st.set!.params ?? {}) }, choices: { ...w.choices, ...(st.set!.choices ?? {}) }, toggles: { ...w.toggles, ...(st.set!.toggles ?? {}) }, input: st.set!.input ?? w.input }));
  }, [tutorialStep, bottomTab, tutorial, updateWs]);
  const stepDone = (() => { const st = tutorial?.[tutorialStep]; const ctx = apiRef.current?.ctx; try { return !!(st?.done && ctx && st.done(ctx)); } catch { return false; } })();

  const onParam = useCallback((k: string, v: number) => updateWs((w) => ({ params: withLinks({ ...w.params, [k]: v }, w.links ?? {}) })), [updateWs]);
  const onLink = useCallback((k: string, expr: string | null) => {
    if (expr) {
      try { const n = parse(expr); const free = [...freeSymbols(n)].filter((s) => s !== k); compile(n, free, {}); } catch (e) { flash(`That link is not a valid expression: ${(e as Error).message}`); return; }
    }
    updateWs((w) => { const links = { ...(w.links ?? {}) }; if (expr) links[k] = expr; else delete links[k]; return { links, params: withLinks({ ...w.params }, links) }; });
  }, [updateWs]);
  const onTime = useCallback((t: number) => updateWs({ t }), [updateWs]);
  const onOutputs = useCallback((o: HostOutputs) => setOutputs(o), []);

  const closeTab = (i: number) => setProject((p) => {
    const tabs = p.tabs.filter((_, j) => j !== i);
    const active = Math.max(0, Math.min(tabs.length - 1, p.active > i ? p.active - 1 : p.active));
    if (!tabs.length) setPlace({ kind: 'home' }); else setPlace({ kind: 'demo', id: tabs[active].demoId });
    setGeneration((g) => g + 1);
    return { ...p, tabs, active };
  });

  // ── render ──────────────────────────────────────────────────────────────
  const centre = place.kind === 'home' ? <Home onTry={tryInput} onOpen={(id) => openDemo(id)} recent={settings.recent} onOpenRecent={(p) => doOpen(p)} completed={settings.completedTutorials} />
    : place.kind === 'tutorials' ? <TutorialList onOpen={(id) => openDemo(id)} completed={settings.completedTutorials} />
    : place.kind === 'fidget' ? <FidgetGallery onOpen={(id) => openDemo(id)} />
    : place.kind === 'companion' ? <Companion dark={dark} compact={compact} onCompact={setCompact} onOpenDemo={(id, input) => openDemo(id, input, true)} />
    : demo && ws ? <DemoHost key={`${ws.demoId}:${project.active}`} demo={demo} ws={ws} dark={dark} playing={playing} speed={speed} animating={animating}
        onParam={onParam} onTime={onTime} onOutputs={onOutputs} apiRef={apiRef} generation={generation}
        onChoice={(k, v) => updateWs((w) => ({ choices: { ...w.choices, [k]: v } }))}
        onToggle={(k, v) => updateWs((w) => ({ toggles: { ...w.toggles, [k]: v } }))}
        onInput={(text) => updateWs({ input: text })} />
    : <div className="home"><p className="muted">This demonstration could not be opened.</p></div>;

  const showInspector = place.kind === 'demo' && !!demo && settings.rightOpen && !maximized;
  const showBottom = place.kind === 'demo' && !!demo && settings.bottomOpen && !maximized;

  return (
    <div className={`app ${maximized ? 'maximized' : ''} ${compact ? 'compact' : ''}`}>
      <header className="topbar">
        <div className="brand" onClick={() => setPlace({ kind: 'home' })}><span className="logo">∯</span>MathVerse</div>
        <form className={`omnibox ${inputError ? 'bad' : ''}`} onSubmit={(e) => { e.preventDefault(); tryInput(inputText); }}>
          <Icon name="wand" size={16} />
          <input value={inputText} onChange={(e) => { setInputText(e.target.value); setInputError(null); }} placeholder="Type any mathematics:  f(x) = x³ − 4x    z = sin(x)cos(y)    dy/dt = −2y    A = [[2,1],[1,2]]" aria-label="Type mathematics to visualize" spellCheck={false} />
          {inputError && <span className="omnibox-error" role="alert">{inputError.msg}</span>}
        </form>
        <div className="top-actions">
          <span className={`cas-dot ${casStatus}`} title={{ idle: 'Algebra engine: idle', loading: 'Algebra engine: loading SymPy…', ready: 'Algebra engine: ready (SymPy)', error: `Algebra engine unavailable: ${cas.error}` }[casStatus]} />
          <button className="icon-btn" title="Open (Ctrl+O)" onClick={() => doOpen()}><Icon name="open" /></button>
          <button className="icon-btn" title="Save (Ctrl+S)" onClick={() => doSave()}><Icon name="save" />{dirty && <span className="dirty" />}</button>
          <button className="icon-btn" title="Export image" onClick={exportPNG}><Icon name="image" /></button>
          <button className="icon-btn" title={settings.sound ? 'Sounds on' : 'Sounds off'} onClick={() => { setSettings({ sound: !settings.sound }); if (!settings.sound) blip(0.6); }}><Icon name={settings.sound ? 'sound' : 'mute'} /></button>
          <button className="icon-btn" title="Light / dark" onClick={() => setSettings({ theme: dark ? 'light' : 'dark' })}><Icon name={dark ? 'sun' : 'moon'} /></button>
          <button className="icon-btn" title="Command palette (Ctrl+K)" onClick={() => setPalette(true)}><Icon name="search" /></button>
        </div>
      </header>
      <div className="body">
        {settings.leftOpen && !maximized && !compact && (
          <aside className="left" style={{ width: settings.leftWidth }}>
            <Sidebar place={place} currentDemo={ws?.demoId} onOpen={(id) => openDemo(id)} onPlace={setPlace} />
            <Resizer side="left" onResize={(dx) => setSettings({ leftWidth: Math.max(200, Math.min(480, settings.leftWidth + dx)) })} />
          </aside>
        )}
        <main className="centre">
          {place.kind === 'demo' && project.tabs.length > 0 && !maximized && (
            <div className="tabs" role="tablist">
              {project.tabs.map((t, i) => (
                <div key={i} className={`tab ${i === project.active ? 'on' : ''}`} role="tab" aria-selected={i === project.active}>
                  <button onClick={() => { setProject((p) => ({ ...p, active: i })); setPlace({ kind: 'demo', id: t.demoId }); setGeneration((g) => g + 1); }}>{t.demoId === 'explore' ? (t.input || 'Explore') : (byId.get(t.demoId)?.title ?? t.title)}</button>
                  <button className="tab-x" title="Close tab" onClick={() => closeTab(i)}><Icon name="x" size={12} /></button>
                </div>
              ))}
              <button className="tab-new" title="New tab (Ctrl+T)" onClick={() => openDemo('explore', 'f(x) = x^3 - 4x', true)}><Icon name="plus" size={14} /></button>
            </div>
          )}
          <div className="stage">
            {centre}
            {place.kind === 'demo' && demo && (outputs.warning || outputs.error) && <div className={`banner ${outputs.error ? 'bad' : 'warn'}`} role="alert"><Icon name="warn" size={15} />{outputs.error || outputs.warning}</div>}
            {place.kind === 'demo' && demo && <button className="max-btn" title={maximized ? 'Restore (F)' : 'Maximize (F)'} onClick={() => setMaximized((m) => !m)}><Icon name="expand" size={16} /></button>}
          </div>
          {showBottom && demo && ws && (
            <section className="bottom" style={{ height: settings.bottomHeight }}>
              <Resizer side="bottom" onResize={(dy) => setSettings({ bottomHeight: Math.max(120, Math.min(520, settings.bottomHeight - dy)) })} />
              {demo.animated && (
                <div className="timeline">
                  <button className="icon-btn" title="Reset to t = 0" onClick={() => { apiRef.current?.resetTime(); }}><Icon name="rewind" /></button>
                  <button className="icon-btn play" title="Play / pause (Space)" onClick={() => setPlaying((p) => !p)}><Icon name={playing ? 'pause' : 'play'} /></button>
                  <span className="t-read">t = {(ws.t ?? 0).toFixed(2)}</span>
                  <label className="speed">speed <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>{[0.1, 0.25, 0.5, 1, 2, 4].map((s) => <option key={s} value={s}>{s}×</option>)}</select></label>
                </div>
              )}
              <div className="bottom-tabs" role="tablist">
                {([['explain', 'Explanation'], ['steps', `Steps${outputs.steps.length ? ` (${outputs.steps.length})` : ''}`], ['try', 'Experiments'], ...(tutorial?.length ? [['tutorial', 'Tutorial']] : []), ['notes', 'Notes']] as [typeof bottomTab, string][]).map(([k, l]) => (
                  <button key={k} className={bottomTab === k ? 'on' : ''} onClick={() => setBottomTab(k)}>{l}</button>
                ))}
              </div>
              <div className="bottom-body">
                {bottomTab === 'explain' && (<div className="explain">{outputs.note && <Markup text={outputs.note} />}<p className="muted">{demo.summary}</p>{demo.accuracy && <p className="accuracy"><b>Accuracy.</b> {demo.accuracy}</p>}{demo.connections.length > 0 && <p className="connections">Connections: {demo.connections.map((c) => byId.get(c) ? <button key={c} className="link" onClick={() => openDemo(c)}>{byId.get(c)!.title}</button> : <span key={c} className="conn">{c}</span>)}</p>}</div>)}
                {bottomTab === 'steps' && (outputs.steps.length ? <ol className="steps">{outputs.steps.map((s, i) => <li key={i}><b>{s.title}</b>{s.rule && <span className="rule">{s.rule}</span>}{s.tex && <Tex tex={s.tex} display />}{s.detail && <Markup text={s.detail} />}</li>)}</ol> : <p className="muted">This demonstration has no worked steps; the Homework Companion works problems step by step.</p>)}
                {bottomTab === 'try' && <ul className="experiments">{demo.experiments.map((x, i) => <li key={i}><Markup text={x} /></li>)}</ul>}
                {bottomTab === 'tutorial' && tutorial && (
                  <div className="tutorial">
                    <div className="tut-progress">Step {tutorialStep + 1} of {tutorial.length}<div className="bar"><span style={{ width: `${((tutorialStep + 1) / tutorial.length) * 100}%` }} /></div></div>
                    <Markup text={tutorial[tutorialStep].text} />
                    {tutorial[tutorialStep].task && <div className={`task ${stepDone ? 'done' : ''}`}><Icon name={stepDone ? 'check' : 'spark'} size={15} /><Markup text={tutorial[tutorialStep].task!} /></div>}
                    <div className="tut-nav">
                      <button disabled={tutorialStep === 0} onClick={() => setTutorialStep((s) => s - 1)}>Back</button>
                      {tutorialStep < tutorial.length - 1
                        ? <button className="primary" onClick={() => { setTutorialStep((s) => s + 1); if (settings.sound) blip(0.7); }}>Next</button>
                        : <button className="primary" onClick={() => { if (!settings.completedTutorials.includes(demo.id)) setSettings({ completedTutorials: [...settings.completedTutorials, demo.id] }); flash('Tutorial complete'); if (settings.sound) blip(0.95); }}>Finish</button>}
                    </div>
                  </div>
                )}
                {bottomTab === 'notes' && <textarea className="notes" value={ws.notes} onChange={(e) => updateWs({ notes: e.target.value })} placeholder="Notes for this workspace — saved with the project." />}
              </div>
            </section>
          )}
        </main>
        {showInspector && demo && ws && (
          <aside className="right" style={{ width: settings.rightWidth }}>
            <Resizer side="right" onResize={(dx) => setSettings({ rightWidth: Math.max(260, Math.min(520, settings.rightWidth - dx)) })} />
            <Inspector demo={demo} ws={ws} animating={animating} sound={settings.sound}
              onInput={(src) => { if (demo.id === 'explore') { tryInput(src); } else updateWs({ input: src }); }}
              onParam={onParam}
              onRange={(k, r) => updateWs((w) => ({ paramRanges: { ...w.paramRanges, [k]: r } }))}
              onAnimate={(k) => setAnimating((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; })}
              onLink={onLink}
              onReset={() => { updateWs({ params: {}, paramRanges: {}, links: {}, choices: {}, toggles: {} }); setAnimating(new Set()); }}
              onApplyPreset={(p) => updateWs({ params: { ...p.params }, choices: { ...p.choices }, toggles: { ...p.toggles }, links: { ...p.links } })}
              onChoice={(k, v) => updateWs((w) => ({ choices: { ...w.choices, [k]: v } }))}
              onToggle={(k, v) => updateWs((w) => ({ toggles: { ...w.toggles, [k]: v } }))}
              onDisplay={(d) => updateWs((w) => ({ display: { ...w.display, ...d } }))}
              readouts={outputs.readouts} api={apiRef} />
          </aside>
        )}
      </div>
      {palette && <Palette commands={commands} onClose={() => setPalette(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Resizer({ side, onResize }: { side: 'left' | 'right' | 'bottom'; onResize: (d: number) => void }) {
  const last = useRef(0);
  return (
    <div className={`resizer ${side}`} onPointerDown={(e) => {
      last.current = side === 'bottom' ? e.clientY : e.clientX;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const move = (ev: PointerEvent) => { const v = side === 'bottom' ? ev.clientY : ev.clientX; onResize(v - last.current); last.current = v; };
      const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    }} />
  );
}

function Inspector({ demo, ws, animating, sound, onInput, onParam, onRange, onAnimate, onChoice, onToggle, onDisplay, readouts, api, onLink, onReset, onApplyPreset }: {
  onLink: (k: string, expr: string | null) => void; onReset: () => void; onApplyPreset: (p: Preset) => void;
  demo: DemoDef; ws: Workspace; animating: Set<string>; sound: boolean; onInput: (s: string) => void; onParam: (k: string, v: number) => void;
  onRange: (k: string, r: [number, number]) => void; onAnimate: (k: string) => void; onChoice: (k: string, v: string) => void; onToggle: (k: string, v: boolean) => void;
  onDisplay: (d: Partial<Workspace['display']>) => void; readouts: HostOutputs['readouts']; api: React.MutableRefObject<HostApi | null>;
}) {
  const [draft, setDraft] = useState(ws.input || demo.input?.value || '');
  useEffect(() => { setDraft(ws.input || demo.input?.value || ''); }, [demo, ws.input]);
  const is3d = demo.view === '3d' || demo.view === 'split3d';
  return (
    <div className="inspector">
      <div className="insp-head">
        <div className="insp-module">{MODULES.find((m) => m.id === demo.module)?.title ?? (demo.module === 'explore' ? 'Explore' : 'Fidget')}</div>
        <h2>{demo.title}</h2>
        <div className="insp-topic">{demo.topic}</div>
        <div className="equation"><Tex tex={demo.tex} display /></div>
      </div>
      {demo.input && (
        <form className="expr-input" onSubmit={(e) => { e.preventDefault(); onInput(draft); }}>
          <label><Label text={demo.input.label} /></label>
          <div className="row"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={demo.input.placeholder} spellCheck={false} /><button type="submit">Apply</button></div>
        </form>
      )}
      {demo.params.length > 0 && <div className="insp-section"><h3>Parameters</h3>
        {demo.params.map((p) => <ParamSlider key={p.key} spec={p} value={ws.params[p.key] ?? p.value} range={ws.paramRanges[p.key]} animating={animating.has(p.key)} sound={sound}
          onChange={(v) => onParam(p.key, v)} onRange={(r) => onRange(p.key, r)} onAnimate={() => onAnimate(p.key)}
          link={ws.links?.[p.key]} onLink={demo.params.length > 1 ? (e) => onLink(p.key, e) : undefined} />)}
        <Presets demoId={demo.id === 'explore' ? `explore:${ws.input}` : demo.id} ws={ws} onApply={onApplyPreset} onReset={onReset} />
      </div>}
      {(demo.choices?.length || demo.toggles?.length) ? <div className="insp-section"><h3>Show</h3>
        {demo.choices?.map((c) => <ChoiceControl key={c.key} spec={c} value={ws.choices[c.key] ?? c.value} onChange={(v) => onChoice(c.key, v)} />)}
        {demo.toggles?.map((t) => <ToggleControl key={t.key} spec={t} value={ws.toggles[t.key] ?? t.value} onChange={(v) => onToggle(t.key, v)} />)}
      </div> : null}
      {readouts.length > 0 && <div className="insp-section"><h3>Computed</h3><Readouts rows={readouts} /></div>}
      <div className="insp-section display"><h3>Display</h3>
        {is3d ? (<>
          <div className="btn-row">
            {(['iso', 'top', 'front', 'side'] as const).map((w) => <button key={w} onClick={() => api.current?.view3d?.view(w)}>{w === 'iso' ? 'Reset' : w[0].toUpperCase() + w.slice(1)}</button>)}
            <button onClick={() => { const v = api.current?.view3d; if (v) v.setProjection(v.getCamera().projection === 'perspective' ? 'orthographic' : 'perspective'); }}>Persp/Ortho</button>
          </div>
          <ToggleControl spec={{ key: 'axes', label: 'Axes', value: true }} value={ws.display.axes} onChange={(v) => onDisplay({ axes: v })} />
          <ToggleControl spec={{ key: 'grid', label: 'Grid', value: true }} value={ws.display.grid} onChange={(v) => onDisplay({ grid: v })} />
          <ToggleControl spec={{ key: 'wire', label: 'Wireframe', value: false }} value={ws.display.wireframe} onChange={(v) => onDisplay({ wireframe: v })} />
          <div className="mini-slider"><span>Surface opacity</span><input type="range" min={0.1} max={1} step={0.01} value={ws.display.opacity} onChange={(e) => onDisplay({ opacity: Number(e.target.value) })} /></div>
          <div className="mini-slider"><span>Lighting</span><input type="range" min={0.2} max={2} step={0.01} value={ws.display.lighting} onChange={(e) => onDisplay({ lighting: Number(e.target.value) })} /></div>
        </>) : (
          <div className="btn-row"><button onClick={() => { const p = api.current?.plot; if (p) p.setView({ x0: -5, x1: 5, y0: -3.5, y1: 3.5 }); }}>Reset view</button><span className="muted small">Drag to pan · scroll to zoom</span></div>
        )}
      </div>
    </div>
  );
}

function Presets({ demoId, ws, onApply, onReset }: { demoId: string; ws: Workspace; onApply: (p: Preset) => void; onReset: () => void }) {
  const [all, setAll] = useState(loadPresets);
  const [naming, setNaming] = useState<string | null>(null);
  const mine = all[demoId] ?? [];
  const store = (list: Preset[]) => { const n = { ...all, [demoId]: list }; setAll(n); savePresets(n); };
  return (
    <div className="presets">
      <button onClick={onReset} title="Every parameter back to its default">Reset</button>
      {mine.map((p, i) => <span key={i}><button onClick={() => onApply(p)} title="Apply this preset">{p.name}</button><button className="del" title="Delete preset" onClick={() => store(mine.filter((_, j) => j !== i))}>×</button></span>)}
      {naming === null
        ? <button onClick={() => setNaming('')} title="Save the current parameters as a preset">+ Preset</button>
        : <form onSubmit={(e) => { e.preventDefault(); if (naming.trim()) store([...mine, { name: naming.trim(), params: { ...ws.params }, choices: { ...ws.choices }, toggles: { ...ws.toggles }, links: { ...(ws.links ?? {}) } }]); setNaming(null); }}>
            <input autoFocus value={naming} onChange={(e) => setNaming(e.target.value)} onBlur={() => setNaming(null)} placeholder="Preset name" />
          </form>}
    </div>
  );
}
