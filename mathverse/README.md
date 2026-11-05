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

## What is inside

121 demonstrations (113 in the seven modules, 8 Fidget playgrounds), 55 of
them with a step-by-step tutorial (marked ★). Every demonstration has
sliders with editable ranges, an explanation, experiments to try, an accuracy
note, and PNG/CSV export.

**Calculus I** (14, 5★) — limits and continuity as the ε–δ game · the
derivative as a limit (secant → tangent, Δx slider)★ · f, f′ and f″ together
(concavity, inflection) · product/quotient/power rules · the chain rule★ ·
implicit differentiation · related rates · critical points and extrema ·
optimization★ · Fermat's fastest path · Riemann sums (left/right/mid/trapezoid,
click to add a divider, click one to remove it, drag to resize)★ ·
accumulation functions · the Fundamental Theorem★ · position, velocity,
acceleration.

**Calculus II** (17, 16★) — by parts as a picture · trigonometric integrals ·
trigonometric substitution · partial fractions (exact) · improper integrals ·
numerical integration with measured orders · arc length · surface area of
revolution · disks/washers and cylindrical shells (rotatable 3D solids,
cut-away sections, a draggable slice, build animation) · parametric curves ·
polar curves and areas · sequences and series · convergence tests · Taylor and
Maclaurin series (order slider, error bound, radius) · power series and the
interval of convergence · the pendulum as a Taylor approximation.

**Calculus III** (18, 6★) — Cartesian/cylindrical/spherical coordinates · dot and
cross products, lines and planes · vector-valued functions (velocity,
acceleration, curvature) · partial and directional derivatives · gradient,
level curves and tangent plane★ · the multivariable chain rule · critical
points and the second-derivative test · Lagrange multipliers★ · double
integrals over chosen regions · triple integrals in three systems · change of
variables and the Jacobian★ · 3D vector fields with particles · divergence and
curl with a paddle wheel · line integrals along a draggable path · flux ·
Green's★, Stokes'★ and the divergence theorem★ (both sides computed
independently).

**Linear Algebra** (18, 7★) — vectors · span and independence · change of
basis · 2D transformations★ · 3×3 transformations · multiplication as
composition · the determinant as signed area/volume★ · inverses · linear
systems with animated row reduction · rank, null and column space ·
eigenvectors★ · diagonalization · the SVD★ · projection★ · least squares★ ·
Gram–Schmidt★ · inertia tensors · normal modes.

**ODE** (16, 6★) — direction fields★ · separable equations · linear first-order
equations · existence and uniqueness · characteristic roots · the
mass–spring–damper in 3D★ · nonhomogeneous equations · resonance★ · phase
portraits and the trace–determinant plane★ · stability and linearization ·
the pendulum★ · Lotka–Volterra · van der Pol · the Lorenz attractor · Euler
vs Runge–Kutta★ · adaptive steps on an orbit.

**PDE** (14, 5★) — classification · the heat equation on a rod (exact series vs
FTCS / BTCS / Crank–Nicolson)★ · boundary conditions side by side · heat on a
plate (3D, draggable hot spots) · waves on a string★ · drum modes
(rectangular and circular)★ · Laplace's equation as a soap film★ · Poisson's
equation · diffusion as random walkers · separation of variables by shooting ·
Fourier series and Gibbs · Jacobi/Gauss–Seidel/SOR · von Neumann stability
and CFL★ · heat vs Schrödinger.

**Differential Geometry** (16, 6★) — space curves (κ, τ, arc length) · a curve
rebuilt from κ(s), τ(s)★ · surfaces and tangent spaces★ · first and second
fundamental forms · Gaussian and mean curvature (Gauss–Bonnet)★ · Theorema
Egregium · manifolds and charts · the metric tensor (Tissot ellipses) ·
covariant derivative and Christoffel symbols · geodesics on 11 surfaces or
your own★ · flat vs curved triangles and circles · geodesic deviation and
tides · parallel transport and holonomy★ · Riemann, Ricci and scalar curvature
(up to the 4D Schwarzschild metric) · embedding diagrams (Flamm's paraboloid,
labelled as an analogy) · light cones in curved spacetime★.

**Fidget** (8, 4★) — Vector Playground★ · Surface Sculptor · Derivative
Explorer · Taylor Builder★ · Eigenvector Machine★ · Curvature Explorer★ · Wave
Laboratory · Flow Field.

**Homework Companion** — type a problem (`d/dx …`, `∫_0^pi … dx`,
`lim x→0 …`, `solve …`, `taylor …`, a matrix, an ODE, a system); every
answer carries a status (Verified, Numerical, Not verified, Check failed);
derivatives and row reduction come with every step and its rule; integrals,
limits, series, solving, `dsolve` and eigenvalues come from SymPy and are
re-checked. Explore mode reveals one hint/step at a time. Tabs, notes with
LaTeX preview, a saved-problem library, exports, and a compact 420 px mode
with always-on-top for working beside a PDF.

**Examples** — five example projects (`examples/*.mathverse`), openable from
the home page or the command palette.

## Known limitations

Honest list, kept current:

- **Windows installer is built by CI, not on this machine.** The development
  environment is Linux; the installer exists only as a GitHub Actions artifact
  (see *Getting it*). It is unsigned, so Windows SmartScreen will warn on first
  run ("More info → Run anyway").
- **SymPy is slow to start**: the first symbolic request loads Python in
  WebAssembly (a few seconds on a desktop, up to ~30 s on a weak machine).
  Everything numerical works before it is ready, and the Companion shows a
  progress bar with Cancel. Cancel stops *all* pending SymPy jobs, not only
  the Companion's.
- **The timeline cannot run backwards.** "Rewind" resets to t = 0; simulations
  step forward and are not stored, so there is no scrubbing back.
- **No dedicated "functions" demonstration** in Calculus I — functions are
  explored by typing them (the Explore view); the module starts at limits.
- **Trigonometric integrals** is the one Calculus II demonstration without a
  tutorial; Calculus III, ODE, PDE and Geometry have tutorials for the central
  demonstrations only (see ★ above).
- **3D surfaces are drawn at true scale** — there is no vertical exaggeration,
  so some surfaces look very tall or flat; adjust the parameters or the view.
- **Numerical torsion**: `calc3.vecfn` computes torsion from a numerical third
  derivative (Geometry's curve demonstrations use exact derivatives).
- **Geometry, Riemann demo**: one set of sliders is shared between spaces (for
  Schwarzschild "shape b" is the mass M); the 4D Schwarzschild computation takes
  a few seconds the first time on software rendering.
- **Integrator errors** in the geodesic and transport demonstrations are shown as
  measured drift (of conserved quantities), not as rigorous error bounds.
- **Companion pictures**: no picture yet for 3×3 matrix transformations (it
  links to the full demonstration) or for implicit 3D level surfaces.
- **SVG export** is for 2D plots; 3D views export as PNG.
- **Desktop only**: built and tested for Windows 10/11 through Tauri; the
  same interface runs in a browser for development, but there is no
  supported web or phone version.
