# MathVerse — architecture and decisions

MathVerse is an interactive 3D mathematics laboratory for Windows 10/11:
seven subject modules, a free-form *Fidget* mode, a *Homework Companion*,
tutorials, and a universal input bar that turns typed mathematics into a
picture you can grab.

## The architecture

```
┌──────────────────────── Tauri 2 window (WebView2 on Windows) ───────────────────────┐
│ React + TypeScript UI                                                                │
│   layout · command palette · inspector · tutorials · companion · project files      │
│        │                                                                            │
│        ├── engine/  Viewport3D (three.js, WebGL2/GPU) · Plot2D (canvas, SVG export) │
│        ├── core/    DOM-free mathematics in TypeScript — parser, compiler, symbolic │
│        │            differentiation, numerics (quadrature, ODE/PDE solvers, linear  │
│        │            algebra, differential geometry) — fast enough for 60 fps        │
│        └── cas/     SymPy + NumPy + SciPy in a Web Worker (Pyodide, bundled)        │
│                     — exact integrals, step-by-step algebra, series, solving        │
│ Rust: native window, file dialogs and file I/O (Tauri plugins), installer           │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### One change from the suggested stack: Python runs *inside* the app (Pyodide), not as a sidecar

The brief suggests a Python + SymPy sidecar process. MathVerse runs the same
SymPy, NumPy and SciPy instead as CPython compiled to WebAssembly (Pyodide), in
a Web Worker inside the app. Reasons:

- **Reliability.** A sidecar means freezing a Python interpreter with
  PyInstaller into a separate `.exe`, launching it, and talking to it over
  pipes. Frozen Python executables are slow to start (5–10 s), are a common
  antivirus false positive, and are a second program that can crash or be
  blocked. A worker inside the app has none of these.
- **The same libraries.** It is real CPython 3.14 with real SymPy 1.14,
  NumPy 2 and SciPy 1.18 — not a reimplementation — and it is fully offline:
  the files ship inside the installer.
- **The UI never blocks.** The worker is its own thread; a long symbolic
  integration can be cancelled by terminating it, which a sidecar cannot do as
  cleanly.
- **One codebase.** The same build runs as a desktop app and, for
  development and testing, in a browser.

The cost is a one-time ~3–8 s load of the Python runtime the first time a
symbolic feature is used (it is warmed in the background at start-up), and an
installer about 50 MB larger.

### Two engines, checking each other

Interaction needs answers in microseconds — a tangent line follows the mouse
at 60 fps — so all *interactive* mathematics runs in a TypeScript core
(`src/core`): a safe parser, a compiler from expression trees to fast
closures, exact symbolic differentiation, and numerical methods
(adaptive Gauss–Kronrod quadrature, RK4/Dormand–Prince with error control,
finite-difference PDE solvers with stability checks, QR/Jacobi eigenvalues,
SVD, geodesic and parallel-transport integrators). SymPy does what needs a
full computer-algebra system: antiderivatives, partial fractions, series,
solving, and step-by-step working. Where both can answer, they are compared:
a symbolic antiderivative from SymPy is differentiated back by the core and
checked numerically at sample points before it is shown, and a symbolic
definite integral is compared with adaptive quadrature. A result that is
numerical is labelled *numerical* with its error estimate; nothing
approximate is shown as exact.

### Safety

User input is never executed. The parser accepts a fixed grammar (numbers,
named symbols, operators, a whitelist of functions) and produces a tree;
evaluation walks or compiles that tree. Expressions sent to SymPy are
re-emitted from the tree in a canonical form and parsed there with
`parse_expr` restricted to an explicit local dictionary — no `eval` of user
text. Project files (`.mathverse`) are JSON validated against a schema on
load; nothing in them is ever run as code.

## Layout of the code

```
mathverse/
  src/core/        DOM-free mathematics (tested by Vitest in Node)
    expr/          lexer, parser, AST, compiler, derivative, simplifier, LaTeX
    numeric/       quadrature, roots, ode, pde, linalg, geometry, series
    input/         classify typed input → a visualization and its sliders
  src/cas/         the SymPy worker and its typed client
  src/engine/      Viewport3D (three.js) and Plot2D (canvas)
  src/modules/     calc1 · calc2 · calc3 · linalg · ode · pde · geometry
                   (each a set of demos sharing one Demo interface)
  src/fidget/      the playgrounds
  src/companion/   Homework Companion (tabs, steps, notes, exports)
  src/tutorials/   guided lessons that drive demos step by step
  src/project/     the .mathverse format, save/open/recent
  src/ui/          shell, panels, command palette, controls
  src-tauri/       the Rust shell, configuration, icons
  tests/           Vitest — mathematics, parser security, solvers, project files
  e2e/             Playwright smoke test of the built app
  examples/        example .mathverse projects
```

## Building the Windows installer

Tauri builds Windows installers (NSIS `.exe` and WiX `.msi`) on Windows. The
repository's GitHub Actions workflow (`.github/workflows/mathverse.yml`)
does it on `windows-latest` for every change to `mathverse/`, and uploads
both installers as build artifacts; it also runs the tests. To build locally
on Windows: see README.md.
