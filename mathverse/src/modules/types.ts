// The contract between MathVerse's shell and every demonstration. A module is
// a list of DemoDefs; the shell builds the viewport(s), the sliders and the
// panels from the definition, calls create() once, update() whenever a control
// changes, and tick() every frame while the timeline plays.

import type { Viewport3D } from '../engine/viewport3d';
import type { Plot2D } from '../engine/plot2d';
import type { ParamSpec } from '../core/input/classify';

export type ModuleId = 'calc1' | 'calc2' | 'calc3' | 'linalg' | 'ode' | 'pde' | 'geometry' | 'explore' | 'fidget';

export interface ModuleInfo { id: ModuleId; title: string; short: string; blurb: string; color: string }

export const MODULES: ModuleInfo[] = [
  { id: 'calc1', title: 'Calculus I', short: 'Calc I', blurb: 'Limits, derivatives, tangent lines, optimization, Riemann sums and the Fundamental Theorem.', color: '#6aa9ff' },
  { id: 'calc2', title: 'Calculus II', short: 'Calc II', blurb: 'Integration techniques, solids of revolution, parametric and polar curves, sequences and Taylor series.', color: '#f2c14e' },
  { id: 'calc3', title: 'Calculus III', short: 'Calc III', blurb: 'Surfaces, gradients, tangent planes, multiple integrals, vector fields and the great theorems.', color: '#6fcf97' },
  { id: 'linalg', title: 'Linear Algebra', short: 'Lin Alg', blurb: 'Vectors, transformations, determinants, eigenvectors, projections, Gram–Schmidt and the SVD.', color: '#b48cff' },
  { id: 'ode', title: 'Ordinary Differential Equations', short: 'ODE', blurb: 'Direction fields, oscillators, phase portraits, stability and numerical solvers.', color: '#ef6b73' },
  { id: 'pde', title: 'Partial Differential Equations', short: 'PDE', blurb: 'Heat, waves, membranes, Laplace and Poisson, Fourier series and finite differences.', color: '#4fd1d9' },
  { id: 'geometry', title: 'Differential Geometry', short: 'Diff Geo', blurb: 'Curves and surfaces, curvature, geodesics, parallel transport, metrics and curved spacetime.', color: '#ff9f5a' },
];

export interface ChoiceSpec {
  key: string;
  label: string;
  options: [string, string][];     // [value, label]
  value: string;
}
export interface ToggleSpec { key: string; label: string; value: boolean }

export interface Readout { label: string; value: string; tex?: boolean; tone?: 'good' | 'warn' | 'bad' | 'muted' }
export interface StepRow { title: string; tex?: string; detail?: string; rule?: string }

/** What a demo can use and report through. */
export interface DemoCtx {
  view3d: Viewport3D | null;
  plot: Plot2D | null;
  /** a second 2D plot for split views (e.g. a phase portrait beside a time plot) */
  plot2: Plot2D | null;
  params: Record<string, number>;
  choices: Record<string, string>;
  toggles: Record<string, boolean>;
  /** the demo's own expression field (when it declares `input`) */
  input: string;
  /** move a slider from inside the demo (a dragged point, an animation) */
  setParam(key: string, value: number): void;
  /** change a choice or switch from inside the demo (a preset button, a mode change) */
  setChoice(key: string, value: string): void;
  setToggle(key: string, value: boolean): void;
  /** replace the demo's expression field (e.g. a preset matrix) */
  setInput(text: string): void;
  setReadouts(rows: Readout[]): void;
  setSteps(rows: StepRow[]): void;
  /** a short explanation (Markdown-ish: **bold**, $TeX$, line breaks) shown under the viewport */
  setNote(text: string): void;
  /** a warning banner (domain problems, instability); '' clears it */
  warn(text: string): void;
  /** the timeline (animated demos) */
  time: { t: number; playing: boolean; speed: number };
  /** current theme, for demos that draw their own colours */
  dark: boolean;
}

export interface DemoInstance {
  /** a slider, choice, toggle or the input changed */
  update(): void;
  /** called every frame while the timeline plays; dt in seconds, already scaled by speed */
  tick?(dt: number): void;
  /** the timeline was reset to t = 0 */
  reset?(): void;
  /** data behind the picture, for Export CSV */
  csv?(): string;
  dispose(): void;
}

export interface TutorialStep {
  /** what to read */
  text: string;
  /** set these controls when the step opens */
  set?: { params?: Record<string, number>; choices?: Record<string, string>; toggles?: Record<string, boolean>; input?: string };
  /** an optional check: the step is "done" when this returns true (the learner did the thing) */
  done?: (ctx: DemoCtx) => boolean;
  /** what to try */
  task?: string;
}

export interface DemoDef {
  id: string;                      // globally unique, e.g. 'calc1.tangent'
  module: ModuleId;
  title: string;
  topic: string;                   // the syllabus topic(s) it covers
  summary: string;                 // one or two sentences
  tex: string;                     // the governing equation (KaTeX)
  view: '2d' | '3d' | 'split2d' | 'split3d';   // split2d: two plots; split3d: a plot beside a 3D view
  params: ParamSpec[];
  choices?: ChoiceSpec[];
  toggles?: ToggleSpec[];
  input?: { label: string; value: string; placeholder?: string };
  animated?: boolean;
  /** things to try (shown as a checklist) */
  experiments: string[];
  /** related ideas, ideally ids of other demos */
  connections: string[];
  /** an optional guided tutorial for this demo */
  tutorial?: TutorialStep[];
  /** honesty note: what is exact, what is numerical or approximated */
  accuracy?: string;
  create(ctx: DemoCtx): DemoInstance;
}
