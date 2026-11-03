// The .mathverse project format: plain JSON, validated field by field on load.
// Nothing in a project file is ever executed — expressions are strings that go
// through the same safe parser as typing, and unknown fields are dropped.

export const FORMAT = 'mathverse';
export const VERSION = 1;

export interface Workspace {
  demoId: string;                         // which demo (or 'explore' for typed input)
  title: string;
  input: string;                          // the expression field
  params: Record<string, number>;
  paramRanges: Record<string, [number, number]>;
  choices: Record<string, string>;
  toggles: Record<string, boolean>;
  camera?: { position: [number, number, number]; target: [number, number, number]; projection: 'perspective' | 'orthographic'; zoom: number };
  view2d?: { x0: number; x1: number; y0: number; y1: number };
  display: { wireframe: boolean; opacity: number; axes: boolean; grid: boolean; lighting: number };
  notes: string;
  t: number;                              // timeline position
}

export interface Project {
  format: typeof FORMAT;
  version: number;
  name: string;
  created: string;
  modified: string;
  tabs: Workspace[];
  active: number;
}

export class ProjectError extends Error {}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 20000) => (typeof v === 'string' && v.length <= max ? v : '');
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const v3 = (v: unknown): [number, number, number] | null => (Array.isArray(v) && v.length === 3 && v.every((x) => typeof x === 'number' && Number.isFinite(x)) ? [v[0], v[1], v[2]] : null);
function rec<T>(v: unknown, pick: (x: unknown) => T | undefined, maxKeys = 200): Record<string, T> {
  const out: Record<string, T> = Object.create(null);
  if (!isObj(v)) return out;
  for (const [k, x] of Object.entries(v).slice(0, maxKeys)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]{0,40}$/.test(k)) continue;           // plain names only (no __proto__ tricks)
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    const y = pick(x);
    if (y !== undefined) out[k] = y;
  }
  return out;
}

function workspace(v: unknown): Workspace {
  if (!isObj(v)) throw new ProjectError('A workspace in the file is not an object');
  const cam = isObj(v.camera) ? v.camera : null;
  const pos = cam && v3(cam.position), tgt = cam && v3(cam.target);
  const d = isObj(v.display) ? v.display : {};
  const v2 = isObj(v.view2d) ? v.view2d : null;
  return {
    demoId: str(v.demoId, 100) || 'explore',
    title: str(v.title, 200),
    input: str(v.input, 4000),
    params: rec(v.params, (x) => (typeof x === 'number' && Number.isFinite(x) ? x : undefined)),
    paramRanges: rec(v.paramRanges, (x) => (Array.isArray(x) && x.length === 2 && x.every((y) => typeof y === 'number' && Number.isFinite(y)) && x[0] < x[1] ? [x[0], x[1]] as [number, number] : undefined)),
    choices: rec(v.choices, (x) => (typeof x === 'string' && x.length < 100 ? x : undefined)),
    toggles: rec(v.toggles, (x) => (typeof x === 'boolean' ? x : undefined)),
    camera: pos && tgt ? { position: pos, target: tgt, projection: cam!.projection === 'orthographic' ? 'orthographic' : 'perspective', zoom: num(cam!.zoom, 1) } : undefined,
    view2d: v2 ? { x0: num(v2.x0, -5), x1: num(v2.x1, 5), y0: num(v2.y0, -3), y1: num(v2.y1, 3) } : undefined,
    display: { wireframe: d.wireframe === true, opacity: Math.min(1, Math.max(0.05, num(d.opacity, 1))), axes: d.axes !== false, grid: d.grid !== false, lighting: Math.min(2, Math.max(0, num(d.lighting, 1))) },
    notes: str(v.notes, 200000),
    t: num(v.t, 0),
  };
}

/** Parse and validate a project file's text. Throws ProjectError with a readable message. */
export function readProject(text: string): Project {
  if (text.length > 20_000_000) throw new ProjectError('The file is too large to be a MathVerse project');
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new ProjectError('The file is not valid JSON — it may be damaged'); }
  if (!isObj(data) || data.format !== FORMAT) throw new ProjectError('This is not a MathVerse project file');
  const version = num(data.version, 0);
  if (version > VERSION) throw new ProjectError(`This project was saved by a newer MathVerse (format ${version}); update MathVerse to open it`);
  const tabs = Array.isArray(data.tabs) ? data.tabs.slice(0, 50).map(workspace) : [];
  if (!tabs.length) throw new ProjectError('The project has no workspaces');
  return {
    format: FORMAT, version: VERSION, name: str(data.name, 200) || 'Untitled', created: str(data.created, 40), modified: str(data.modified, 40),
    tabs, active: Math.min(tabs.length - 1, Math.max(0, Math.floor(num(data.active, 0)))),
  };
}

export function writeProject(p: Project): string {
  return JSON.stringify({ ...p, format: FORMAT, version: VERSION, modified: new Date().toISOString() }, null, 2);
}

export function emptyWorkspace(demoId: string, title = ''): Workspace {
  return { demoId, title, input: '', params: {}, paramRanges: {}, choices: {}, toggles: {}, display: { wireframe: false, opacity: 1, axes: true, grid: true, lighting: 1 }, notes: '', t: 0 };
}
