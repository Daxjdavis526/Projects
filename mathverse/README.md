# MathVerse

An interactive 3D mathematics laboratory for Windows: seven subject modules
(Calculus I–III, Linear Algebra, ODEs, PDEs, Differential Geometry), Fidget
playgrounds, a Homework Companion and guided tutorials — built around one idea:
**don't just show the mathematics; let it be touched.** Drag a point along a
curve and its tangent follows; deform a surface and its gradient responds; drag
the images of the basis vectors and watch space transform; launch a geodesic
across a torus; poke a membrane and watch the waves spread.

Everything runs on your computer. No account, no subscription, no internet
connection needed after installation.

## Getting it

**Windows installer.** Every change to `mathverse/` is built by GitHub
Actions (`.github/workflows/mathverse.yml`) on Windows into an NSIS installer
(`MathVerse_<version>_x64-setup.exe`) and an MSI (`MathVerse_<version>_x64_en-US.msi`).
Open the latest *MathVerse* run on the repository's **Actions** tab and download
**MathVerse-windows-installer-exe** (or `-msi`) from its Artifacts. The workflow
also installs the `.exe` silently, launches MathVerse, and uninstalls it, so a
green run means the installer works. The installer bundles the WebView2
bootstrapper (already present on Windows 10/11), installs per-user (no admin
rights), associates `.mathverse` files, and has an uninstaller.

**Build it yourself on Windows** (Node.js 20+, Rust stable, and the Visual
Studio C++ build tools):

```powershell
cd mathverse
npm ci
npx tauri build          # runs `npm run pyodide` and `npm run build` first
# → src-tauri\target\release\bundle\nsis\MathVerse_0.1.0_x64-setup.exe
# → src-tauri\target\release\bundle\msi\MathVerse_0.1.0_x64_en-US.msi
```

`npm run pyodide` copies the Python runtime (Pyodide 314.0.7 with NumPy, SciPy,
SymPy, mpmath) from `atlas/vendor/` into `public/pyodide/` so it ships inside
the app; it is not stored twice in git.

**Develop** (any OS): `npm ci && npm run pyodide && npm run dev`, then open
http://localhost:1420 in a browser, or `npx tauri dev` for the desktop window.

## Using it

- **Type any mathematics** in the bar at the top — `f(x) = x^3 - 4x`,
  `z = A sin(Bx) cos(Cy)`, `r(t) = (cos t, sin t, t)`, `F(x,y,z) = (y, -x, z)`,
  `A = [[2,1],[1,2]]`, `dy/dt = -2y`, `y'' + c y' + 4y = 0`,
  `∂u/∂t = α ∂²u/∂x²`, `x^2 + y^2 = 1`, `r = 1 + cos(θ)` — and MathVerse picks a
  visualization, makes a slider for every parameter (A, B, C, α…) and shows
  the exact derivatives, gradients, curvature or flow. Mistakes are explained
  in plain language with their position.
- **Modules** (left): every topic as a live demonstration with sliders,
  draggable geometry, readouts, an explanation, experiments to try and, for
  the central ones, a step-by-step tutorial.
- **Fidget playgrounds**: free experimentation — no exercises, no scores.
- **Homework Companion**: a workspace beside your homework — enter a problem,
  see it, step through the working (Explore mode hides the solution; Step-by-step
  mode justifies every step), take notes, keep several problems in tabs, and
  shrink it to a side panel next to a PDF.
- **Tutorials**: guided lessons that drive the demonstrations.

**Parameters.** Every slider's value and limits can be typed exactly (click the
number or the ends); ▶ animates a parameter back and forth across its range; 🔗
links a parameter to an expression of the others (B = 2·A); presets save and
restore parameter sets; Reset restores the defaults.

**3D view.** Left-drag rotates, right-drag (or shift-drag) pans, the wheel
zooms. Display settings: standard views (top/front/side), perspective or
orthographic, axes, grid, wireframe, surface opacity, lighting.

**Keyboard.** Ctrl+K command palette (every command and demonstration) ·
Ctrl+S save · Ctrl+Shift+S save as · Ctrl+O open · Ctrl+T new tab ·
Space play/pause · F maximize the viewport · R reset the camera ·
1–4 top/front/side/iso · P perspective/orthographic · Ctrl+B / Ctrl+I / Ctrl+J
toggle the subjects / inspector / bottom panels.

**Files.** Projects save as `.mathverse` (JSON: the open tabs, each with its
demonstration, expression, parameters and ranges, links, camera, display
settings, notes and timeline). Exports: PNG (any view), SVG (2D plots), CSV
(data behind a picture, where it has some), LaTeX (the equation), and the
parameter configuration as JSON.

## How it is built

See [DESIGN.md](DESIGN.md) for the architecture and the reasons behind it, and
[AUTHORING.md](AUTHORING.md) for how demonstrations are written.

- **Tauri 2** shell (Rust; WebView2 on Windows) — a native window, native file
  dialogs, an installer. The Rust side does no mathematics and makes no network
  connections; the content-security policy allows only the app's own files.
- **React + TypeScript** interface; **three.js** (WebGL 2, GPU) for 3D;
  a canvas 2D engine with SVG export; **KaTeX** for notation.
- **A TypeScript mathematics core** (`src/core`) for everything interactive: a
  safe parser (no `eval`; formulas compile to closures), exact symbolic
  differentiation, adaptive Gauss–Kronrod quadrature, Dormand–Prince ODE
  integration with error control, finite-difference PDE solvers with stability
  checks, dense linear algebra (LU, QR, eigenvalues, SVD), differential
  geometry (fundamental forms, Christoffel symbols, geodesics, parallel transport).
- **SymPy** (with NumPy and SciPy available) running as real CPython in
  WebAssembly (Pyodide) in a background worker, for exact antiderivatives with
  SymPy's own step-by-step rules, partial fractions, series, limits, solving,
  `dsolve` and exact eigenvalues. Its results are re-checked by the TypeScript
  core (an antiderivative is differentiated back and compared at sample points;
  an exact definite integral is compared with quadrature) before they are shown.

## Accuracy

Exact results are exact (symbolic derivatives; SymPy). Numerical results are
labelled numerical, with their method and error estimate or tolerance.
Singularities, undefined points, divergence and unstable numerical parameters
are reported in a banner rather than drawn as if fine. Each demonstration's
**Accuracy** note says what is exact and what is approximated. Embedding
diagrams of curved space are labelled as analogies, distinct from the actual
four-dimensional Lorentzian geometry of spacetime.

## Tests

```sh
npx tsc -b                  # type-check everything
npx vitest run              # mathematics, parser security, solvers, SymPy (Pyodide in Node), project files
npx vite build && node e2e/smoke.mjs   # every demonstration opened in a real browser
```

## Known limitations

See the end of this file (kept current as the project grows).
