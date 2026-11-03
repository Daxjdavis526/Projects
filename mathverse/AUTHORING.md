# Writing MathVerse demonstrations

A *demonstration* (demo) is one interactive piece of mathematics: a viewport
(2D, 3D, or split), sliders, choices and switches, live readouts, an
explanation, experiments to try, and optionally a guided tutorial. Modules are
lists of demos. This guide is the contract for writing them.

## Read first
1. `DESIGN.md` — the architecture.
2. `src/modules/types.ts` — `DemoDef`, `DemoCtx`, `DemoInstance`, `TutorialStep`. **The contract.**
3. `src/modules/explore/index.ts` — working demos built on the same API
   (function explorer with a draggable tangent, surface with tangent plane and
   gradient, Frenet frame, vector-field particles, matrix transformation, ODE
   phase plane). Copy their patterns.
4. `src/engine/viewport3d.ts` (3D: `addGraph`, `addSurface`, `addCurve`,
   `addArrow`, `addPoint` with `drag`, `addPlane`, `addVectorField`,
   `addParticles`, `addLabel`, `addObject` for any three.js object, `setBounds`,
   `onFrame`) and `src/engine/plot2d.ts` (2D: `setDraw(g => …)` with `g.fn`,
   `g.parametric`, `g.fillBetween`, `g.path`, `g.polygon`, `g.arrow`,
   `g.field`, `g.slopeField`, `g.implicit`, `g.heatmap`, `g.point`, `g.text`,
   `g.handle` for draggable points; `plot.onClick`; `plot.setView`;
   `opts.equal` for equal axes).
5. `src/core/expr` (parse, compile, derivative, toTeX) and `src/core/numeric`
   (quad, ode, roots, linalg) — use them; do not re-implement.

## How a demo works
- `create(ctx)` runs once: build objects, keep their handles. Return
  `{ update, tick?, reset?, csv?, dispose }`.
- `update()` runs whenever a slider, choice, toggle or the input changes:
  read `ctx.params`, `ctx.choices`, `ctx.toggles`, `ctx.input`; **update the
  existing handles** (`handle.update(...)`, `set(...)`), never rebuild the scene.
- `tick(dt)` runs every frame while the timeline plays (`animated: true`).
  `dt` is already scaled by the speed control. No allocation in hot loops.
- Report through `ctx.setReadouts`, `ctx.setNote` (Markdown-ish: `**bold**`,
  `$TeX$`, `$$display$$`), `ctx.setSteps`, `ctx.warn` ('' clears).
- A dragged point that corresponds to a slider calls `ctx.setParam(key, v)`.
- `dispose()` must remove everything you added (`view3d.clear()` is fine for
  3D-only demos; a 2D demo needs nothing unless it set `plot.onClick`).

## The bar
- **Mathematically exact or honestly labelled.** Compute every number you
  show. Use exact symbolic derivatives (`derivative`) where possible; label
  numerical results as numerical with their error or tolerance. Never show an
  approximation as exact. Fill `accuracy` with what is exact and what is not.
- **Warn, never crash.** Singularities, undefined points, divergence,
  unstable numerical parameters (CFL, r = αΔt/Δx² > ½), ill-conditioning:
  `ctx.warn(...)` in plain language. A thrown error in `update` is shown as an
  error banner — avoid it.
- **Every demo teaches.** A clear `summary`, the governing `tex`, 3–5
  `experiments` that lead to an insight, `connections` to other demos (their
  ids), and readouts that make the key quantity visible as it changes.
- **Tutorials.** Give your module's most important demos a `tutorial`: 4–8
  steps, each with `text` (intuition first, then the rigorous statement), a
  `task`, `set` (controls the step sets up) and, where possible, a `done(ctx)`
  check so the learner sees the task light up when achieved.
- **Interaction is the point.** Prefer something to drag over a slider when
  geometry allows. Smooth, immediate response.
- **Performance.** 60 fps on a laptop: reuse geometry, keep surface
  resolution ≤ 120² (expose quality where it matters), precompute, and keep
  expensive solves out of `tick`.
- **Physics-student audience.** Calculus II level up to graduate mathematical
  physics. Connect to physics where natural (motion, fields, heat, waves,
  orbits, spacetime) — and say what is an analogy.

## Files you may create
- `src/modules/<module>/<name>.ts` — your demos (one or a few per file).
- `src/modules/<module>/index.ts` — the list `export const demos: DemoDef[]`.
- `src/core/numeric/<area>.ts` — DOM-free numerics your module needs (PDE
  solvers, geometry, series…), with tests `tests/<area>.test.ts` (Vitest)
  that check against known exact answers and convergence orders.
- Ids: `<module>.<name>` (e.g. `calc1.tangent`). Check uniqueness.

## Do not
- Edit shared files: `src/engine/*`, `src/ui/*`, `src/modules/types.ts`,
  `src/modules/registry.ts`, `src/modules/explore/*`, `src/core/expr/*`,
  the existing `src/core/numeric/*` files, `src/styles.css`, other modules.
  If you need something there, build it locally (use `view3d.addObject` with
  three.js for custom 3D objects; `g.path`/`g.polygon` for custom 2D), and
  say what you would change in your report.
- Run git commands that change state. The coordinator commits.
- Open anything in `node_modules/`, `public/pyodide/` or `dist/`.

## The loop
```sh
cd /home/user/Projects/mathverse
npx tsc -b                                  # the whole project must type-check (ignore errors in other people's in-progress files)
npx vitest run tests/<area>.test.ts         # your numerics
curl -s -o /dev/null -w "%{http_code}" localhost:1420/ || (npx vite --port 1420 --strictPort > /tmp/vite.log 2>&1 &)   # one shared dev server
node tools/shot.mjs <your scratch dir> <name> demo/<id> 3000      # screenshot a demo; LOOK at the PNG
node tools/shot.mjs <your scratch dir> <name> demo/<id>/tutorial 3000
```
Screenshot every demo, in dark (default) and at least one in light (toggle
with the sun button — or write a small Playwright script that clicks it), and
fix anything that looks wrong: empty views, clipped labels, unreadable colours,
objects off-screen, wrong values. The 3D viewport renders with SwiftShader
here (software WebGL): slower than a real GPU, but correct.

**Memory:** several authors share one machine. Run one heavy process at a
time (a screenshot run, or the test suite — not both), and never start a
second dev server.

## Report (under 400 words)
Demos finished (id, what it shows, what is interactive), tutorials written,
numerics added (with test counts), anything not finished, and any change you
would make to shared files.
