# SONICLINE — V1 design proposal

A focused CFD application for cold-gas thrusters: drop in thruster geometry,
set reservoir and ambient conditions, and get a verified OpenFOAM solution
with the propulsion numbers already extracted. OpenFOAM is the numerical
backend and nothing more; everything around it (geometry, case building,
meshing, solver management, monitoring, post-processing, engineering metrics,
verification and the UI) is ours.

**Status: M0 and M1 are complete (see README.md and section 10); M2 is next.**
Section 2 records what was actually run to back the decisions. Section 0
records the answers to the open questions, which override anything later
in this document that assumed otherwise.

---

## 0. Decisions (agreed 2026-09-29)

| question | answer | what it changes |
|---|---|---|
| operating condition | **sea level first**, vacuum later | An external plume region is part of M1, not M5 (§3.5, §8). Ambient back pressure 101 325 Pa is the default. |
| chamber pressures | **15–30 bar** for cold gas (biprop 350–1500 psi later) | The design envelope is below. |
| platform | **Windows** | §3.8 |
| distribution | **personal tool** | The GPL process boundaries in §3.9 are hygiene, not obligations. CAD still runs in a worker process, for crash isolation. |
| name | SONICLINE, `sonicline/` | — |

**Typical cold-gas pressures, checked against hardware.** Moog's flight
cold-gas thrusters are rated at the following nominal inlet pressures (Moog
cold gas thruster datasheet, form 500-1171):

| inlet pressure | thrust |
|---|---|
| 1.5 bar | 10–40 mN |
| 6.9 bar | 120 mN |
| **15.7 bar** | **3.6 N** (SAFER, Pluto Fast Flyby) |
| 90 bar (blowdown, GEO) | 0.9–1.3 N |

MEOPs run from 10 to 27.6 bar. The course module on cold-gas propulsion
(`propulsion/part4-coldgas/28`) gives 2–10 bar as the typical *spacecraft*
plenum range and 2–25 bar at the thruster valves. So 15–30 bar is the top of
normal practice, where multi-newton thrusters and ground-test rigs live.

**Design envelope for V1:**
- p₀ from 1 to 50 bar. Validated effort goes to 5–30 bar.
- T₀ from 200 to 350 K.
- Throat diameter from 0.3 to 10 mm.
- ε from 1 (converging only) to 100.

What 15–30 bar at sea level means (N₂, T₀ = 300 K, ideal):

| p₀ | ε for pₑ = pₐ | Mₑ | Tₑ | Isp at sea level | throat Re, Dₜ = 1 / 2 / 4 mm |
|---|---|---|---|---|---|
| 15 bar | 2.42 | 2.41 | 139 K | 59.0 s | 2.2×10⁵ / 4.4×10⁵ / 8.9×10⁵ |
| 20 bar | 2.88 | 2.59 | 128 K | 61.0 s | 3.0×10⁵ / 5.9×10⁵ / 1.2×10⁶ |
| 30 bar | 3.70 | 2.86 | 114 K | 63.4 s | 4.4×10⁵ / 8.9×10⁵ / 1.8×10⁶ |

Consequences:

- **Sea-level nozzles have low area ratios (about 2–4).** Tₑ stays well
  above the N₂ saturation temperature at 1 atm (77 K), so **condensation is
  not a sea-level concern**. It returns with vacuum nozzles.
- **Running a vacuum nozzle at sea level separates.** ε = 20 at 20 bar exits
  at 5.2 kPa (pₑ/pₐ = 0.05). The regime classifier (§6) matters from day
  one.
- **The laminar-vs-SST bracket is essential.** Throat Re = 2×10⁵–2×10⁶
  straddles the ~10⁶ transition seen in critical-flow venturis.
- **Real-gas bias is about 0.5–1 % on mass flow at 15–30 bar.** That is
  inside the envelope where V1 reports the perfect-gas result together with
  a real-gas correction from `core/gas` (§3.3). The ESI Peng–Robinson option
  is scheduled for M2, after it has been verified against NIST.

Priorities, in order, and every trade-off below is decided by them:
physics correctness → verification → reliability → automation → UX →
visual polish → feature count.

---

## 1. V1 scope

**In:** 3D, compressible, single-phase gaseous nitrogen, non-reacting,
viscous, laminar or RANS-turbulent, steady and transient, adiabatic walls
(prescribed wall temperature as an option), subsonic / choked / supersonic
/ shock-in-nozzle internal flow. STEP and STL input. Reservoir (total
pressure) inlet, mass-flow inlet, pressure outlet, supersonic outlet,
no-slip wall, symmetry, and an optional external plume region with an
ambient boundary.

**Out:** combustion, chemistry, multiphase, condensation modelling,
droplets, cavitation, radiation, liquids, rarefied/slip flow, adaptive
refinement, conjugate heat transfer. The architecture leaves room for each;
none is stubbed.

**Deliberately limited in V1:** automatic extraction of the gas volume from
a *solid* thruster body. It will exist as a previewed suggestion the user
must confirm, never silent automation (section 3.6).

---

## 2. Evidence gathered before proposing

### 2.1 Environment

The toolchain installs cleanly on Ubuntu 24.04 in this container:

| component | version found | note |
|---|---|---|
| OpenFOAM (ESI/OpenCFD) | **v2512** (apt, final) | v2606 exists but the noble apt build is still `2606.0~rc2` |
| OpenFOAM (Foundation) | 13 and **14** (apt) | 14 released Jul 2026 |
| rhoCentralFoam, rhoPimpleFoam, rhoSimpleFoam, snappyHexMesh, cartesianMesh (cfMesh), blockMesh, gmshToFoam, checkMesh, surfaceCheck, foamToVTK | all present in v2512 | |
| gmsh (pip, OCC kernel) | 4.15.2 | needs `libglu1-mesa` et al. on Linux |
| pyvista / VTK | 0.49.0 / 9.7.1 | off-screen rendering via OSMesa works; with no GL at all the VTK wheel segfaults |
| trimesh, meshio, classy_blocks | 5.1.0, 5.3.5, 1.12.0 | classy_blocks has `RevolvedRing`, `Frustum`, `Cylinder`, `Wedge` |
| PySide6, pyvistaqt, pyqtgraph | 6.11.2, 0.13.1, 0.14.0 | a Qt main window with an embedded VTK viewport and a live pyqtgraph residual plot was prototyped and screenshotted under Xvfb |

So the whole pipeline, including a headless OpenFOAM run, can execute in CI
on a stock Ubuntu runner.

### 2.2 Solver spike

A throwaway case (scratch only, not in the repo) to test the solver choice
empirically rather than by reputation:

- Axisymmetric CD nozzle, 5° wedge, 12 000 structured cells, generated with
  blockMesh. Throat radius 1 mm, exit 2.5 mm (ε = 6.25), inlet 3 mm,
  cosine-blended contour, Rc/Rt = 1.62 at the throat.
- N₂, perfect gas, p₀ = 1 MPa, T₀ = 300 K, back pressure 10 kPa (fully
  supersonic exit). **Inviscid slip walls**, so the exact answer is known.

| quantity | rhoPimpleFoam, transonic, LTS | reference | error |
|---|---|---|---|
| mass flow (solver face fluxes) | 7.1678 g/s | 7.2090 g/s (ideal 1D) | −0.57 % |
| discharge coefficient | 0.99428 | 0.99470 (Kliegel–Levine, Rc/Rt = 1.62) | **−0.04 %** |
| inlet vs outlet mass flow | identical to 6 significant figures | — | < 10⁻⁵ |
| mass-averaged exit Mach | 3.4103 | 3.4114 | −0.03 % |
| vacuum thrust | 5.003 N | 5.052 N (ideal 1D) | −0.97 %, mostly the Cd deficit |
| cost | converged in ~1000 iterations, **90 s on one core** | | |

Findings that shaped this design:

1. **Both solvers diverged within ten steps from a uniform initial field.**
   A 100:1 pressure jump at the inlet face is an impulsive shock-tube start.
   Initialising the interior from the quasi-1D isentropic solution fixed it
   for both. → The analytical module is also the case **initialiser**.
2. **rhoCentralFoam is impractically slow to reach steady state.** On the
   same mesh, after 16 minutes it had covered 5×10⁻⁵ s of physical time.
   Its inlet mass flow was still swinging by about ±25 % as pressure waves
   rang through the plenum, and I stopped it there. Its explicit time step is
   set by the smallest cell and the sound speed. A 3D mesh resolved to
   y⁺ ≈ 1 has sub-micron cells at the throat wall, which makes this far
   worse. → Not the steady-state default.
3. **Integrals must come from the solver's own face fluxes.** Re-integrating
   the outlet from reconstructed face values of p, T and U showed a false
   0.13 % mass imbalance that the flux-based function object did not.
4. **Quasi-1D theory is the right yardstick for integrals, not for local
   distributions.** At the throat, wall p/p₀ was 0.457 against 0.525 (1D)
   and 0.498 on the axis. Near the exit the concave wall compresses the
   flow while the axis over-expands. These are real 2D effects. The
   verification suite has to compare integrals to 1D theory and
   distributions to 2D references.

---

## 3. Key technical decisions

### 3.1 OpenFOAM lineage: ESI/OpenCFD, pinned, behind an adapter

- **Target ESI OpenFOAM, pinned to v2512.** Move to v2606 once final debs
  ship, and only after the regression suite passes on it.
- **Why ESI over the Foundation:**
  - ESI application names and dictionary layouts have been stable for about
    a decade.
  - It ships `fluxSummary`, `solverInfo`, isentropic total pressure
    (`pressure` with `mode isentropic`), and `checkMesh -writeChecks json`
    (since v2312), which gives machine-readable mesh quality.
  - It builds Peng–Robinson for `hePsiThermo`, a future real-gas path.
  - It has a native Windows build as well as WSL.
- **Foundation drawbacks for an automation tool:**
  - It re-plumbs every year: modular `foamRun` solvers, renamed dictionaries,
    and new unit syntax in v14.
  - Its `totalPressureCompressible` is the incompressible p + ½ρU², which is
    wrong for supersonic flow.
  - It has no `-writeChecks`.
  - It publishes no Docker images after v11.
- **All OpenFOAM syntax lives in one adapter package.** A Foundation adapter
  can be added later without touching anything else.
- **Every run records the OpenFOAM version and build** in its manifest.

### 3.2 Solver strategy

| situation | primary | cross-check / fallback |
|---|---|---|
| **steady**, choked, supersonic exit (vacuum / design operation) | **rhoPimpleFoam**, `transonic yes`, local time stepping (`localEuler`) | rhoCentralFoam + LTS on verification cases |
| steady, **shock in nozzle** (overexpanded, ground test) | **rhoCentralFoam** + LTS (M2: rhoPimpleFoam misplaces normal shocks, section 11) | — ; V2 checks the shock position against theory |
| **transient** (valve opening, start-up, pulsing) | rhoCentralFoam, Euler time stepping, maxCo 0.2–0.4 | rhoPimpleFoam time-accurate when the low-Mach plenum dynamics dominate |
| mass flow / Cd accuracy with a large near-stagnant plenum | rhoPimpleFoam (pressure-based, well behaved as M → 0) | — |

Reasons:

- **The low-Mach plenum.** A cold-gas thruster has a near-stagnant plenum
  (M ≈ 0.02–0.06) feeding a Mach 3–6 expansion. Pressure-based
  rhoPimpleFoam handles both ends. The density-based Kurganov–Tadmor scheme
  in rhoCentralFoam is known to be dissipative and stiff as M → 0, and it
  is explicit.
- **rhoCentralFoam keeps its place.** It is the best shock capturer
  available in stock OpenFOAM and is well validated on nozzles and jets
  (Nair et al. 2022; Zang et al. 2018), so it stays as the transient solver
  and the shock cross-check.
- **rhoSimpleFoam is excluded.** Transonic SIMPLE is fragile for supersonic
  flow with shocks, and LTS PIMPLE covers the same need more robustly.
- **HiSA** (an implicit density-based solver) is a candidate plug-in later.
  It lags OpenFOAM releases (validated up to v2512) and is weak at low Mach.

**Revised in M2** (section 11): rhoPimpleFoam, transonic or not, steady or
time-accurate, puts a normal shock in the wrong place, so "auto" chooses
rhoCentralFoam whenever quasi-1D theory expects a shock or separation
inside the nozzle, and the verdict refuses a rhoPimpleFoam run there.

The solver is an attribute of the solution strategy, chosen automatically
from the physics definition. The user never picks an application name; the
advanced mode can override.

### 3.3 Nitrogen thermophysics

- **Default thermophysics:**
  - `hePsiThermo`, pure mixture, **perfectGas**, **hConst**, **sensibleInternalEnergy**
  - molWeight 28.0134, Cp 1039.7 J/kg·K (JANAF, 300 K; ideal-gas N₂ cp varies by less than 0.5 % from 30 to 400 K)
  - **sutherland** transport with As = 1.401×10⁻⁶, Ts = 107 K (N₂, not the
    air values some tutorials use)
- **Deliberately not JANAF polynomials.** OpenFOAM's `janafThermo` clamps T
  to [Tlow, Thigh] with only a warning. The standard N₂ entry has
  Tlow = 200 K, and cold-gas expansions go far below that, so it would
  silently corrupt the solution.
- **`sensibleInternalEnergy` is mandatory.** ESI rhoCentralFoam does not
  validate the energy form and would silently misread an enthalpy-based
  thermo. The case builder enforces this, and a unit test asserts it.
- **Perfect-gas validity is checked, not assumed:**

  | reservoir state | real-gas vs ideal choked mass flux | V1 action |
  |---|---|---|
  | 0.5 MPa | +0.2 % | none |
  | 3 MPa | +1 % | warn |
  | 10 MPa | +3.3 % | strong warning |

  The Z table and cp/cv come from NIST data. A real-gas equation of state
  (ESI Peng–Robinson, or tabulated properties) is a later option.
- **Regulator Joule–Thomson cooling is surfaced.** Regulating from 30 MPa at
  300 K to 0.5–3 MPa cools the gas to about 265–271 K. The inlet T₀ is
  therefore an input the user must set deliberately. A helper estimates it
  from bottle conditions.
- **Condensation is detected, not modelled.** An isentropic expansion from
  300 K reaches 37 K at ε = 50, below N₂'s triple point (63 K). The flow
  crosses the saturation/sublimation line at roughly ε ≈ 15–25 depending on
  p₀. The post-processor flags every cell with T < T_sat(p), reports the
  area ratio where that first happens, and labels Isp beyond it as an upper
  bound for a supersaturated vapour. Sutherland viscosity below about 60 K
  is flagged as extrapolated.

### 3.4 Turbulence and wall treatment

- **Default: k-ω SST, wall-resolved (y⁺ ≲ 1). Laminar is a first-class
  option, and the app recommends running both.**
- **Why not SST alone:** the research didn't simply confirm SST as "the"
  answer.
  - Representative throat Reynolds numbers are about 7×10⁴ (1 mm throat,
    0.5 MPa) to 3×10⁵ (2 mm, 1 MPa).
  - The favourable pressure gradient near the throat has an acceleration
    parameter K ≈ 10⁻⁵, above the ~3×10⁻⁶ relaminarisation threshold.
  - Critical-flow-venturi data show laminar-to-turbulent transition at
    Re ≈ 10⁶.
  - So small-thruster boundary layers are likely laminar or relaminarising,
    and a fully turbulent SST throat boundary layer is the *wrong* physics
    there.
- **The model-uncertainty bracket.** The engineering summary shows Cd and
  thrust from laminar and SST side by side. That spread is a model
  uncertainty and is reported as such.
- **Why SST remains the turbulent default:**
  - It is the best-behaved stock two-equation model for adverse pressure
    gradients and separation (overexpanded ground tests).
  - It works wall-resolved.
  - It is available in both lineages.
- **Known SST weaknesses, documented in the README:**
  - separation location in overexpanded nozzles
  - shock/boundary-layer interaction
  - jet shear-layer spreading
- **No stock compressibility correction exists** for SST in either lineage.
- **Wall treatment:** wall-resolved by default. The mesh generator sizes the
  first cell from a target y⁺ using the quasi-1D wall shear estimate, then
  checks the achieved y⁺ from the solution. OpenFOAM has no
  compressible-transformed wall function, so wall functions (Spalding) are
  a fallback that is flagged in results.
- **Swapping models later:** turbulence is a tagged union in the simulation
  definition (`Laminar | KOmegaSST | SpalartAllmaras | …`). The adapter owns
  how each maps to dictionaries and to the fields it needs (k, ω, ν̃, νt,
  αt).

### 3.5 Meshing: tiered, with mesh quality as a hard gate

**Tier 1 — revolved nozzles (the dominant thruster case): generated
structured hex.** This is the default.

- **Why snappyHexMesh fails here:** its layer addition collapses exactly at
  a CD throat. The medial-axis thickness limit starves the layers where wall
  shear peaks. A public CD-nozzle case got 82 % layer coverage and y⁺ up to
  31 at the throat. Snapped walls are also faceted.
- **Profile extraction:**
  - The geometry layer detects a revolved body (coaxial cone, cylinder,
    torus, plane and revolution faces).
  - It extracts the meridional profile r(x).
  - It generates a block-structured mesh with `classy_blocks` (MIT) driving
    blockMesh.
- **Two meshes from one point distribution:**
  - a **5° wedge** for verification and fast previews
  - a **3D O-grid** (butterfly core, no axis singularity) for production 3D
    runs
- **Resolution** is set explicitly: throat, converging and diverging
  refinement, and first-cell height from the target y⁺ with geometric
  growth.
- Wedge and 3D sharing one distribution makes wedge-vs-3D a clean
  consistency test.
- **External plume region (sea level, the default):**
  - A cylinder downstream of the exit plane, about 20 Dₑ long and 6 Dₑ in
    radius (both configurable). It is meshed as structured blocks that
    continue the nozzle's radial lines and are coarsened outward.
  - The annulus in the exit plane outside the lip is either an entrainment
    boundary (a free-standing nozzle, the default) or a wall (a nozzle
    flush with a plate).
  - The ambient boundary uses total pressure/temperature with
    `pressureInletOutletVelocity`, and the far outlet is at ambient
    pressure.
  - Without this region, a sea-level result is not physical: the subsonic
    boundary layer carries the ambient pressure into the nozzle, and a
    fixed-pressure outlet on the exit plane is ill-posed for a supersonic
    core. A domain that ends at the exit is allowed only for vacuum or
    strongly under-expanded runs, where the whole exit plane leaves
    supersonically; the validator enforces this.

**Tier 2 — arbitrary 3D fluid volumes (side ports, non-round
features):** snappyHexMesh as an external process.

- Surface and feature refinement are set from the detected throat and exit
  scales.
- The mesh is **accepted only if** it passes `checkMesh -writeChecks json`
  gates **and** the snappy per-patch layer-coverage report meets thresholds
  (for example ≥ 95 % coverage on nozzle walls, and no uncovered faces near
  the throat). Otherwise the mesh is rejected with the reason shown.
- Fallback: gmsh tetrahedra with extruded prism layers → MSH 2.2 ASCII →
  `gmshToFoam`.
- cfMesh (`cartesianMesh`, present in the v2512 apt build) is evaluated as
  an alternative to snappy at this tier.

**Tier 0 is not a mesh:** the quasi-1D solution computed from the detected
area distribution. It runs instantly, gives the user expected numbers
before meshing, initialises the solver, and is the reference for the sanity
checks in section 4.6.

**Mesh-quality gates:**

| type | conditions |
|---|---|
| hard fail | any negative volume, wrong face orientation, open cells, more than one connected region, or missing patches |
| warning | non-orthogonality > 65° |
| fail | non-orthogonality > 70° unless non-orthogonal correctors are enabled |
| warning / fail | skewness > 4 |
| generator bug | any structured Tier-1 mesh with non-orthogonality > ~40° or skewness > ~1 |

Every mesh gets a stored report: cell count, per-type counts, and max/mean
non-orthogonality, skewness and aspect ratio, plus min determinant and
region count. The report has a pass/warn/fail verdict. Solving is blocked on
fail.

### 3.6 Geometry import and validation

- **STEP (preferred)** is read through the gmsh OCC kernel (pip wheel).
  gmsh gives:
  - import and healing (sew, fix small edges and faces, make solids)
  - volumes and areas
  - inertia axes (which recover the nozzle axis of a rotated part to 10⁻⁷)
  - face types, booleans
  - planar slicing for cross-section area
- **Later:** OCP (OCCT 8 bindings, pip) adds `BRepCheck_Analyzer`, free-edge
  analysis, self-interference, and `BOPAlgo_MakerVolume` for the "fill"
  operation. It is added when those checks are needed, not in V1's first
  cut.
- **STL:**
  - trimesh checks watertightness, winding consistency, positive volume,
    connected components, duplicate faces and degenerate/sliver faces.
  - OpenFOAM `surfaceCheck` handles self-intersection and multiply-connected
    edges. trimesh cannot check self-intersection.
- **Automatic suggestions**, always confirmed by the user in the UI:
  - **axis:** the distinct principal axis of inertia
  - **candidate inlet/outlet:** planar end faces normal to the axis at its
    extremes
  - **throat:** minimum cross-section area from slicing, refined by golden
    section
  - **inlet vs outlet** is *not* decided by area alone, since high-ε exits
    are larger than chambers. It uses the steeper wall angle beside the
    throat on the converging side, plus a constant-area chamber section, and
    is always shown for confirmation.
- **Fluid volume vs solid body** is classified from topology. A single solid
  whose faces carry inner hole loops that enclose a passage is a solid body;
  a closed solid with simple end disks is a fluid volume.
- **V1 fully supports explicit fluid volumes.** For a solid body it offers a
  *previewed* extraction:
  1. Cap the opening loops.
  2. Fragment against a bounding box.
  3. Select the cavity containing the throat.
  4. The user confirms or adjusts it, as in SpaceClaim's and SimScale's
     seed-face workflows.
  
  The step fails loudly when it finds zero or several candidate cavities.
  Why this is not automatic: blind holes, O-ring grooves, knife-edge exit
  lips and multi-part assemblies all defeat it, and commercial tools do not
  automate this either.
- **gmsh licensing:** gmsh is GPL with a linking exception. It runs in a
  worker subprocess, not in the UI process, which also isolates crashes in
  CAD code.

### 3.7 UI and visualization

- **Stack:** PySide6 (LGPL) + pyvista/pyvistaqt (VTK, MIT/BSD) + pyqtgraph.
- **Layout:** a desktop main window with a large central VTK viewport, a
  project/run tree dock, and a staged workflow (Geometry → Physics →
  Mesh → Run → Results) with property panels, tooltips and validation
  badges.
- **Plots:** live residual and integral-quantity plots use pyqtgraph.
  Exported reports and line plots use matplotlib.
- **Reading results:** the VTK OpenFOAM reader reads results directly (it
  handles polyhedra, patches, time directories and decomposed cases), so
  foamToVTK is not needed.
- **Results tools, all exercised in the prototype:**
  - slices and cutting planes
  - glyphs (velocity vectors)
  - streamlines
  - line sampling (centreline and axial plots)
  - point and cell picking (probe)
  - per-patch actors (hide/show)
  - scalar bars
- **Probe values are cell values by default.** VTK point data is
  interpolated from cells *and* wall patches, which misleads near walls.
  Interpolated values are labelled as such.
- **"Open in ParaView"** writes a `case.foam` and launches the user's
  ParaView as an escape hatch. ParaView is not embedded: it is not
  pip-installable and is hard to brand.
- **Rejected:** trame as the V1 UI (trame 4 is three weeks old and the
  pyvista bridge does not support it yet; it is the path for a later remote
  client), and Electron + three.js (a second runtime and a hand-rolled
  renderer).
- **Decoupling:** the UI is a client of a UI-free core. The core emits typed
  events and plain-data scene specifications. The Qt layer renders them. A
  trame client could render the same specs later.

### 3.8 Windows

The application runs natively on Windows: Python with PySide6, VTK, gmsh
and trimesh, all of which ship win_amd64 wheels. OpenFOAM is reached
through a **runner** interface with three backends:

- **WSL2 (default on Windows).**
  - Runs Ubuntu 24.04 with the same `openfoam2512` apt package that CI
    tests, so a result on your machine comes from the same binaries as the
    verification suite.
  - Commands run as `wsl.exe -d <distro> -- bash -lc "source …/etc/bashrc && …"`.
  - Case directories live on the WSL ext4 filesystem, because OpenFOAM's
    many small files are slow on `/mnt/c`.
  - The app reads results over `\\wsl.localhost\<distro>\…`.
  - Paths are translated in one place.
- **Native** (ESI's `OpenFOAM-v2512-windows-mingw.exe`, MS-MPI).
  - Simplest for the user, but not the build CI tests on Linux.
  - Enabled once the verification suite has been run against it; a Windows
    CI job can install it.
- **Local Linux**, for CI and development.

The app detects which backends exist and reports the OpenFOAM build each
one gives. The runner is chosen in settings and recorded in every run
manifest.

Portability rules for our code:

- `pathlib` everywhere.
- No POSIX-only modules (`fcntl`, `selectors` on pipes).
- Process output is read on threads.
- No shell scripts in the pipeline; every stage is a Python call to an
  OpenFOAM executable.
- Line endings are written as `\n` explicitly.

### 3.9 Licensing posture

*(Personal tool: see §0. The boundaries below are kept as good hygiene.)*

OpenFOAM, gmsh and cfMesh are GPL and are only ever run as **external
processes**. PySide6 is LGPL (dynamically linked). VTK, pyvista, trimesh,
classy_blocks, numpy and scipy are permissive. **foamlib and PyFoam (GPL)
are not dependencies**: we write our own small dictionary writer and our own
runner. Neither streams logs the way we need or supports Windows pipes, so
nothing is lost. If you intend to distribute closed-source builds, this
keeps that option open (not legal advice).

---

## 4. Architecture

### 4.1 Packages and dependency direction

```
sonicline/
  core/            pure Python + numpy. NO OpenFOAM syntax, NO Qt, NO VTK.
    units.py         SI internally; explicit unit types at every input boundary
    gas.py           the perfect-gas N2 model the CFD is given (cp, Sutherland)
    realgas.py       reference-EOS checks via CoolProp: real-gas choked flux,
                     regulator (Joule-Thomson) cooling, saturation/sublimation line
    profile.py       axisymmetric wall profiles r(x) from exact lines and arcs
    theory/          quasi-1D isentropic, normal shock, shock-in-nozzle solver,
                     Kliegel-Levine Cd, divergence factor, Fanno, ideal thrust/Cf/Isp
    model/           the simulation definition (4.2) — dataclasses + JSON schema
    validate/        pre-flight rule engine: geometry, BCs, physics, mesh, run
  geometry/        STEP/STL import (gmsh-OCC, trimesh), healing, checks,
                   axis/throat/opening detection, revolved-profile extraction,
                   fluid-volume classification. Runs in a worker process.
  mesh/            mesh strategies: RevolvedStructured (classy_blocks → blockMesh),
                   Snappy, GmshTet; quality report + gates
  foam/            THE ONLY PACKAGE THAT KNOWS OPENFOAM SYNTAX
    dictwriter.py    deterministic FoamFile writer (sorted, fixed float format)
    esi_v2512/       case builder: SimulationDefinition + Mesh → case directory
    parse/           log parser, checkMesh JSON, function-object .dat readers
  run/             process runner (local Linux | WSL2 | native Windows), job
                   state machine, cancellation, restart, run manifest
  monitor/         incremental tailers for postProcessing/*.dat + log → typed
                   events (Residual, Integral, LogLine, Stage, Finished)
  post/            field access (VTK reader, cell-accurate), derived fields
                   (isentropic p0, T0, condensation margin), surface integrals
                   from solver fluxes, line samples
  metrics/         propulsion metrics + trust verdict (4.6) — pure functions of
                   post/ outputs and core/theory
  project/         on-disk project store, run history, reopen
  ui_qt/           PySide6 application — depends on everything above, nothing
                   depends on it
  cli.py           headless entry point: `sonicline run case.json` — the same
                   pipeline the UI drives
tests/  verification/  (section 5)
```

Rules, enforced by an import-linter test:

- `core` imports nothing internal.
- Only `foam/` writes or parses OpenFOAM syntax.
- Only `post/` and `ui_qt/` import VTK.
- Only `ui_qt/` imports Qt.
- The CLI and the UI call the same pipeline functions.

### 4.2 Simulation definition (independent of OpenFOAM)

A versioned, JSON-serialisable tree of frozen dataclasses. Every
dimensional value is stored in SI with its unit in the schema. A sketch:

```python
SimulationDefinition(schema_version=1,
  geometry = GeometryRef(source_file, sha256, units="mm", kind=FLUID_VOLUME,
                         axis=Axis(origin, direction), throat=Throat(x, area),
                         face_groups={"inlet": [...], "outlet": [...], "wall": [...]}),
  gas      = Gas(species="N2", eos=PerfectGas(), thermo=ConstantCp(1039.7),
                 transport=Sutherland(As=1.401e-6, Ts=107.0)),
  boundaries = [ReservoirInlet(patch="inlet", p0=1.0e6, T0=300.0),
                SupersonicOutlet(patch="outlet") | PressureOutlet(patch, p=101325.0),
                Wall(patch="wall", thermal=Adiabatic()), Symmetry(...), Ambient(...)],
  flow     = Flow(time=Steady() | Transient(end_time, max_co),
                  turbulence=Laminar() | KOmegaSST(inlet_intensity=0.02, ...)),
  mesh     = MeshSpec(strategy=RevolvedStructured(form=O_GRID_3D | WEDGE),
                      quality=Quality.STANDARD, first_cell=YPlusTarget(1.0),
                      refinement={throat: ..., converging: ..., diverging: ...}),
  numerics = Numerics(strategy="auto", convergence=ConvergenceCriteria(...)),
  outputs  = Outputs(ambient_for_thrust=[0.0, 101325.0], centerline=True, ...),
)
```

The case builder is a pure function:
`build_case(definition, mesh) → CaseDirectory` with deterministic bytes. The
same definition gives the same files, which is tested by hashing golden
cases.

### 4.3 Project on disk

```
MyThruster.sonicline/
  project.json                     name, created, app version
  geometry/<sha256>.step           imported files, content-addressed
  simulations/<sim-id>/definition.json
  runs/<run-id>/
    manifest.json                  definition hash, app version + git commit, OpenFOAM
                                   version/build, solver + strategy, mesh stats, host,
                                   nProcs, decomposition, start/end, exit status, verdict
    case/                          the generated OpenFOAM case (never hand-edited)
    mesh_report.json   convergence.json   metrics.json   log/
```

Runs are immutable once finished. Reopening a run reads its manifest and
metrics; the case directory is there for audit and for ParaView.

### 4.4 Execution and monitoring

- **Execution:**
  - Each stage (mesh, checkMesh, decompose, solve, reconstruct, post) is a
    separate subprocess, with the environment sourced from the pinned
    OpenFOAM install.
  - The run is a state machine: `Queued → Meshing → MeshChecked → Solving →
    Converged | NotConverged | Diverged | Failed | Cancelled → PostProcessed`.
  - Every transition is written to the manifest.
- **Monitoring sources:**
  - **Primary:** incremental readers of the function-object `.dat` files
    (`solverInfo` residuals, and flux-based mass flow at inlet, throat and
    outlet). They read from saved byte offsets and tolerate a half-written
    last line.
  - **Secondary:** the solver log, for the log panel and error extraction.
  - The process exit code is always checked.
- **Thrust is monitored live**, computed by our code from function-object
  outputs.

### 4.5 Metrics (all computed by us, from solver fluxes)

- **Mass flow** at inlet, throat plane and outlet (via `fluxSummary` /
  `surfaceFieldValue` on phi), their differences, and the mass-conservation
  error.
- **Thrust:** F = ∫(ρu·n)u_x dA + ∫(p − p_a) dA over the exit plane, split
  into momentum and pressure terms. It is cross-checked against the
  wall-force integral (`forces` on the wall patches) when the domain
  includes a plume.
- **Isp** at each requested ambient pressure.
- **Discharge coefficient** against the ideal 1D value, and against
  Kliegel–Levine for the detected Rc/Rt.
- **CFD versus 1D:** thrust, Cf and exit Mach.
- **Choking:** throat Mach (area-averaged and on the sonic surface),
  whether the throat is choked, and where the sonic surface lies.
- **Extremes:** max Mach, max velocity, min/max p and T.
- **Exit plane:** mass-averaged exit Mach, p, T and u.
- **Total pressure** from the isentropic relation.
- **Condensation margin.**
- **Achieved y⁺.**

### 4.6 The trust verdict

Every run ends with one of **Trusted**, **Trusted with warnings**, or **Not
trustworthy**, plus the reasons. Numbers from a not-trustworthy run are
shown greyed with the reason; they are never presented as a result.

The verdict depends on:

- **Convergence** (as built in M1; see section 10 for why):
  - monitored integrals (inlet and exit-plane mass flow, exit-plane thrust)
    steady over the last window: no drift between its halves, and scatter
    below 0.1 %
  - mass imbalance inlet-to-exit below the definition's tolerance (0.1 % by
    default, 2×10⁻⁵ for verification runs)
  - residuals down ≥ 3 orders or below 10⁻⁴: recorded and shown as a warning
    when they stall, but not blocking, because a free jet's shear layer keeps
    global residuals up while the nozzle is converged
  - far-plume drift: a warning that plume images are not converged
- **Mesh:** gates passed.
- **Physics sanity:**
  - An inviscid Cd greater than 1, or above Kliegel–Levine, is a hard fail.
  - Throat Mach consistent with the choked/unchoked prediction.
  - Achieved y⁺ consistent with the wall treatment.
  - Condensation margin.
  - Perfect-gas validity.
  - Back-pressure regime: a separated-flow regime is flagged "model-sensitive".
- **Numerical-error signals:** static temperature inside an adiabatic
  nozzle above the stagnation temperature, and cells sitting at the solver's
  pressure floor, are reported as warnings with their magnitude.
- **Momentum consistency:** thrust from the exit plane against thrust from
  the wall force plus the feed reaction; disagreement above 0.5 % of the
  largest term is a warning.
- **Divergence** (a fatal error or stack trace in the solver log, a
  non-zero exit) is always a hard fail.

---

## 5. Verification and validation

The main deliverable alongside the app. Three kinds of tolerance, kept
separate:

- **Code verification** compares CFD with exact or near-exact theory on the
  finest grid, with a GCI estimate.
- **Validation** compares CFD with experiment, or with theory that carries a
  known model error.
- **Regression** compares code with its own verified baseline.

Build order:

| # | case | reference | tolerance (initial) |
|---|---|---|---|
| V0 | analytical core unit tests | textbook tables, `propulsion/tools/rocket.py` cross-check | 1e-6 relative |
| V1 | conical N₂ nozzle (ε = 6.25, 15°), inviscid, into vacuum | Kliegel–Levine Cd; quasi-1D thrust × Cd × conical divergence factor | Cd within 0.2 %; vacuum thrust 0.5 %. Exit Mach is reported, not checked: a conical exit plane is not one-dimensional |
| V2 | NPARC CDV quasi-1D nozzle: unchoked (p/p₀ = 0.89), shock (0.75), supersonic (0.16) | NASA exact 1D solution files | p/p₀ and M within 1 % away from the shock; shock position within 2 cells or 1 % of divergent length |
| V3 | shock at a prescribed back pressure in the reference nozzle (400 kPa, 600 kPa) | quasi-1D shock-in-nozzle | shock area ratio within 2 % |
| V4 | converging nozzle: (a) choked, (b) subsonic with a straight throat section | Kliegel–Levine Cd; isentropic mass flow with pe = pa | Cd 0.2 %; mass flow 0.5 %. Without the straight section the subsonic jet contracts past the exit (section 10) |
| V5 | throat Cd sweep over Rc/Rt = 0.625…4, inviscid | Kliegel–Levine | 0.1–0.2 % |
| V6 | wedge vs 3D O-grid on the same distribution | self-consistency | 0.1 % mass flow, 0.3 % thrust |
| V7 | solver cross-check: rhoPimpleFoam vs rhoCentralFoam on V1 and V3 | each other | 0.2 % mass flow; shock position within 2 cells |
| V8 | Fanno duct and laminar developing duct flow | analytic / Shah–London | 2–3 % Δp |
| V9 | viscous Cd of an ISO 9300 toroidal-throat venturi, laminar and SST | ISO 9300 Cd(Re), ±0.3 % | ±0.3 % |
| E1 | Back, Massier & Gier 30°/15° and 45°/15° conical nozzles (JPL TR 32-654), wall p | digitised figures | 3–5 % divergent, 10 % throat region (tap-size limited) |
| E2 | Cuffel, Back & Massier 45°/15° | measured Cd = 0.985 | ±1 % |
| E3 | Mason, Putnam & Re, NASA TP-1704, 2D-CD nozzles (tabulated wall p, Cd, F/Fi) | tables | 0.5 % F/Fi attached |
| E4 | Hunter 1998 separated 2D-CD nozzle | NASA data | 2–6 % thrust separated; ±5 % separation location |
| E5 | Whalen NASA TM-100130: low-Re N₂ small nozzles (ε 25–200) | plotted Isp efficiency, Cd | tracked, not gated (low-Re regime) |

**Grid convergence:**

- Every V-case runs on three grids with refinement ratio ≥ 1.3.
- Observed order and GCI follow Celik et al. (2008).
- The asymptotic-range check is part of the pass criteria.

**Regression rules:**

- Compare normalised integrals (Cd, Cf, exit Mach, shock position), not raw
  fields.
- Pin the OpenFOAM version, nProcs and decomposition method.
- Tolerance = max(floor, 3–5× the spread measured across machines).
- Stay away from bistable operating points (the first critical pressure
  ratio, the shock-at-exit limit, separation onset).

**CI:**

- A fast tier runs on every change to `sonicline/`: unit tests, golden-case
  byte hashes, and V1/V4 on coarse wedges, a few minutes in total.
- The full GCI suite runs nightly or on demand.
- Both run in GitHub Actions on Ubuntu with OpenFOAM v2512 from the ESI apt
  repo, following the `strata.yml` pattern.
- A results table (CFD vs reference vs tolerance) is published as a CI
  artifact.

---

## 6. Physics hazards the app must actively catch

These came out of the research. They are where a naive tool would report
confident nonsense:

1. **Sea-level operation of a vacuum nozzle separates.** This is the
   primary hazard now that sea level comes first.
   - ε = 20 at 20 bar exits at pₑ/pₐ = 0.05.
   - The ε = 6.25 reference nozzle at 10 bar has pₑ/pₐ = 0.15.
   - Both are well past the Summerfield criterion (separation for
     pₑ/pₐ ≲ 0.25–0.4). For the reference nozzle:
   - Quasi-1D gives 3.06 N attached. Real separated thrust is estimated at
     3.5–3.8 N.
   - With the domain ending at the exit plane and a fixed back pressure,
     the answer is simply wrong.
   - Before any mesh is built, the validator classifies the regime from
     the 1D back-pressure map: subsonic, shock in nozzle, overexpanded
     attached, overexpanded likely separated (Summerfield/Schmucker),
     matched, or underexpanded.
   - It requires the plume region for anything but vacuum or strongly
     under-expanded exits.
   - It marks separated results as model-sensitive (laminar vs SST
     spread).
2. **Condensation and supersaturation** at high area ratio (section 3.3).
   Not reachable by sea-level nozzles at 15–30 bar (Tₑ > 110 K); it
   matters again for vacuum nozzles.
3. **Laminar or relaminarising boundary layers** in small thrusters
   (section 3.4).
4. **Joule–Thomson cooled inlet temperature** (section 3.3).
5. **Real-gas bias**: about 0.5–1 % on mass flow at 15–30 bar, and
   growing above that (section 3.3). It is reported with every result in
   the envelope.
6. **JANAF temperature clamping and energy-form mismatch** (section 3.3),
   prevented by construction.
7. **Unchoked operation mistaken for choked** (back pressure above the first
   critical ratio). This is predicted before the solve and checked after.

---

## 7. Technical risks

| risk | likelihood | mitigation |
|---|---|---|
| 3D wall-resolved meshes make runs long (10⁶–10⁷ cells) | high | wedge preview first; 90° sector with symmetry planes when the geometry allows; LTS; MPI decomposition; honest runtime estimate before starting |
| Separated-flow predictions are RANS-model-sensitive | certain | detect the regime, bracket laminar/SST, label as model-sensitive, validate against Hunter/Mason |
| Automatic geometry interpretation is wrong (inlet/outlet swap, wrong cavity) | medium | suggestions only, always confirmed; explicit zero/many failure paths |
| snappyHexMesh unreliable on arbitrary geometry | medium–high | Tier 1 covers revolved nozzles without snappy; Tier 2 gated by quality + layer coverage; gmsh fallback |
| OpenFOAM version churn | medium | pin v2512; one adapter package; regression suite gates upgrades |
| Windows support (OpenFOAM via WSL2 or native, path translation) | medium | runner abstraction from day one (§3.8); portable-code rules; Windows CI job for the Python side from M0; WSL2 runner exercised by M3 |
| Sea-level plume region multiplies cell count and brings separated, model-sensitive flow into the default workflow | high | coarsened structured plume blocks; wedge first; matched-expansion verification before overexpanded cases; E3/E4 validation moved to M2 |
| Package size (~280 MB compressed with VTK + Qt) | low | acceptable for engineering software; trim VTK modules later |
| GL problems on user machines (RDP, old drivers) | low–medium | software-rendering switch |
| Verification tolerance flakiness across machines | medium | integral quantities, pinned decomposition, measured spread-based tolerances |

---

## 8. Implementation sequence

Each milestone ends in something that runs and is tested. Nothing is
counted as done until it passes its verification cases.

**I recommend a different first milestone from the brief's.** Build the
headless pipeline and its verification first, and the desktop UI second.
The UI is the lowest-risk part: the prototype already embedded a VTK
viewport and live plots in Qt. The unknowns are physics trust, meshing
robustness and solver behaviour, and a UI built before those are settled
would be built on sand. "Basic 3D visualisation" in M1 means off-screen
pyvista renderings saved with each run, which are also the screenshot
tests.

**M0 — skeleton and analytical core (small)**
- Scaffold `sonicline/`: pyproject with pinned dependencies, the package
  layout above, import-linter rules, pytest, and a CI workflow.
- Write `core/units`, `core/gas` and `core/theory`: quasi-1D, normal shock,
  shock-in-nozzle solver, Kliegel–Levine, and the N₂ property tables.
- Verify against textbook values and `propulsion/tools/rocket.py`.
- Write the simulation-definition dataclasses with a JSON round-trip.
- Update the root README and CLAUDE.md (a third project with its own
  toolchain).

**M1 — headless end-to-end on a known CD nozzle at sea level (the
brief's milestone, minus the UI)** — *done; see section 10*
- **Input:** a revolved CD nozzle supplied as a STEP file (generated from a
  known profile, so the true answer is known), plus a JSON definition.
- **Geometry:** gmsh import → heal → checks → axis, throat and end-face
  detection → profile extraction.
- **Mesh:** Tier 1 structured mesh, both wedge and 3D O-grid, **with the
  external plume region** → checkMesh JSON → quality gates.
- **Reference case:** N₂ at 20 bar and 300 K, sea-level matched nozzle
  (ε ≈ 2.9, 2 mm throat). An overexpanded variant (ε ≈ 6) comes second.
- **Case build:** a deterministic ESI v2512 case with a quasi-1D
  initialisation.
- **Run:** rhoPimpleFoam transonic LTS, local runner, live monitor events on
  the console.
- **Post-processing:** p, Mach, T, ρ, μ, wall shear, mass flows, thrust
  split, Isp, Cd vs 1D and Kliegel–Levine, and the trust verdict.
- **Output:** `metrics.json`, a run manifest, and off-screen renderings of
  Mach, p and T contours plus centreline plots.
- **Acceptance:** V0, V1, V4 and V6 pass, with numbers published in the
  README.

**M2 — verification suite and shocks** (done, with three carry-overs; section 11)
- Carried over from M1: a wall-resolved 3D O-grid run of the sea-level
  case (the mesh passes its gates; it is about 10⁶ cells and was not run),
  the overexpanded sea-level variant, and exercising the WSL2 runner on a
  Windows machine (only its command construction is tested so far).
- The viscous-work term in the energy equation (section 10, finding 12),
  verified against adiabatic-wall recovery and rhoCentralFoam. Until then,
  wall temperatures are not reported.
- V2, V3, V5 and V7.
- Validation cases E3 and E4 (Mason and Hunter): ground-test nozzles with
  shocks and separation in a plume, the sea-level cases that matter most.
- A Peng–Robinson real-gas option, verified against NIST N₂ data.
- The rhoCentralFoam path.
- Laminar vs SST viscous runs.
- GCI automation.
- A nightly CI tier.
- Physics-hazard validators (section 6).
- Viscous Cd case V9.

**M3 — desktop application: Geometry → Physics → Mesh → Run** (done; section 12)
- PySide6 shell and project store (save, reopen, run history).
- Geometry viewport with face picking and confirmation of suggestions.
- Physics and BC panels with sensible defaults, tooltips and live
  validation badges.
- Mesh stage with progress and a quality report.
- Run stage with a live residual/integral plot, log panel and cancel.
- The UI calls the same pipeline as the CLI.

**M4 — Results mode** (done; section 13)
- Field selector and contours on patches.
- Legend with min/max.
- Cutting planes and cross-sections.
- Centreline and axial plots.
- Vectors and streamlines.
- Probe (cell values).
- Hide/show surfaces.
- Engineering summary panel with the trust verdict.
- Report export (PDF/PNG + JSON).
- Screenshot regression tests under Xvfb/OSMesa.

**M5 — broader geometry**
- STL path with surface checks.
- General STEP fluid volumes.
- Tier 2 meshing (snappyHexMesh with gates, gmsh fallback).
- Vacuum operation: domain truncated at the exit, condensation checks
  live.
- Mass-flow inlet.
- Prescribed wall temperature.

**M6 — transient and solid bodies**
- Transient runs (rhoCentralFoam) with time-series metrics and animation.
- Previewed solid-to-fluid extraction.
- Validation cases E1 and E2.

**Later:**
- a real-gas EOS
- solution-adaptive refinement
- remote/cloud runner and a trame client
- a Foundation-lineage adapter
- other gases (the gas model is already parameterised; only N₂ is
  validated)
- an advanced mode exposing numerics

---

## 9. Decisions

Answered on 2026-09-29; see §0. Open for later: bipropellant engines
(350–1500 psi chambers) need combustion products, not nitrogen. That is a
separate gas model and a separate validation effort, and it is out of V1.

---

## 10. M1 record: what was built and what building it taught

Delivered (`sonicline import | check | run | verify`, 200-odd tests, CI with
OpenFOAM v2512 on Linux):

- STEP fluid volumes read through gmsh's OpenCASCADE in a worker process:
  solid count, volume, axis from the inertia tensor, fluid volume vs solid
  body (an annular section means a solid body), roundness, section profile,
  golden-section throat, inlet end from the steeper wall. A known profile
  written to STEP and read back recovers its throat to 10⁻⁵ and its length
  to 10⁻¹³ m.
- A structured mesh generator written directly to OpenFOAM's polyMesh
  (not blockMesh). One cross-section template (wedge sector or butterfly
  O-grid) swept along stations clustered at the throat; wall points exactly
  on the surface; throat and exit planes are exact stations with face zones;
  a plume region of annulus blocks. Direct generation was chosen because
  blockMesh fills a curved block face by interpolating its edges, which puts
  an O-grid's wall off the surface between block edges.
- Case builder, local and WSL2 runners, a convergence monitor that stops the
  solver when the monitored integrals are steady, post-processing from the
  solver's own face fluxes, propulsion metrics, the trust verdict, a run
  manifest, and off-screen images.

Findings, in the order they bit:

1. **A 5° wedge's faces are chords.** Its cross-section is r² sin θ/2, so
   scaling integrals by 2π/θ loses 0.127 % of every flux. The factor is
   2π/sin θ.
2. **`areaNormalIntegrate` is for vector fields**; applied to pressure it
   returns 0 without complaint. The planar inlet and exit use `areaIntegrate`.
3. **`forces` writes force.dat and moment.dat side by side**; reading "the"
   .dat file of a function object has to name the file.
4. **The quasi-1D start makes residual drop an unfair test**: there is less
   to fall from. Residuals pass on a drop or an absolute level.
5. **Global residuals stall with a free jet** (its shear layer never settles)
   while the nozzle's integrals are steady to 10⁻⁶. Integrals decide
   convergence; stalled residuals are reported.
6. **A reservoir inlet jitters by ±0.1 % per iteration** under local time
   stepping while its mean is steady; max-minus-min cannot tell that from
   drift, so the test is drift between window halves plus a scatter bound.
7. **Loosening local-time-step smoothing to speed up the plume crashes the
   first iteration** (`rDeltaTSmoothingCoeff` 1 instead of 0.1). The far plume
   develops slowly; it does not affect thrust, and the verdict says the plume
   images are unconverged when they are.
8. **A subsonic converging nozzle that ends at its curved throat contracts
   past its exit** (vena contracta): the exit plane sat 7.6 % above ambient
   and mass flow 5.8 % below the quasi-1D value. The CFD was right and the
   test case was wrong. With two diameters of straight throat the error is
   0.16 %.
9. **Imposing ambient pressure on the far outlet drives a still-supersonic
   jet core to the solver's pressure floor.** The outlet is non-reflecting;
   the ambient boundaries pin the plume's pressure level.
10. **An O-grid's polygonal wall loses 0.29 % of the area at 48 facets**, and
    choked mass flow with it. The template is scaled so every cross-section
    has the circle's exact area; wedge and 3D mass flow then agree to 0.03 %.
11. **Vertical station lines cut a 45° wall at 45°**, and the thin
    wall-resolved cells there overshot the stagnation temperature by 5 %.
    Bending station lines to meet the wall at right angles fixed it (peak
    299.96 K for T0 = 300 K) without moving thrust or mass flow (both
    within 0.02 %). The verdict now reports both kinds of signal.
12. **rhoPimpleFoam's energy equation omits viscous work.** It is in
    total-energy form (it carries the kinetic energy K) with no
    div(tau & U) term (checked in the v2512 source), so friction never heats
    the gas: an adiabatic wall in the 20 bar case recovered ~40 % of the
    dynamic temperature where ~85-90 % is physical. ESI's
    `viscousDissipation` source adds tau:grad(U), which is right only for an
    internal-energy equation, and over-heated the wall to 348 K with T0 =
    300 K. The two bracket the truth and move mass flow by 0.08 % and thrust
    by 0.13 %. M1 runs without the source, reports that bracket on every
    viscous run, and does not plot wall temperature. The fix, a
    div(tau & U) source (a coded fvOption, which needs OpenFOAM's compiler
    at run time), and its verification against flat-plate recovery
    (r = Pr^(1/3)) and rhoCentralFoam, which does carry viscous work, are M2.

## 11. M2 record

Delivered so far:

- **Viscous work in rhoPimpleFoam** (finding 12). A compiled fvOption,
  `viscousWork` (foam/extensions/), adds div(τ·U) with τ = −devRhoReff to
  the energy equation. It is built with wmake into the user's OpenFOAM
  library directory the first time a viscous run needs it, under a name
  carrying a hash of its source so a stale build is never loaded. A coded
  fvOption would have been simpler, but OpenFOAM refuses to compile code at
  run time as root, which is how containers and CI run. In the 20 bar case
  it lifts the adiabatic-wall recovery factor from 0.25 to 0.877 (the
  expected band is Pr^1/2 = 0.83 laminar to Pr^1/3 = 0.88 turbulent), keeps
  the peak static temperature at 300.006 K for T0 = 300 K, and moves mass
  flow by −0.008 % and thrust by +0.055 %. Viscous runs now report wall
  temperature and the recovery factor.
- **Energy conservation in the verdict.** Flux-weighted total temperature
  at inlet, throat and exit; with adiabatic walls, exit against inlet must
  agree to 0.2 %. The missing viscous work did *not* show here (it
  redistributes energy locally and conserves it globally: −0.06 % with the
  source, +0.02 % without), which is why the recovery factor is checked
  separately, against 0.75–0.95.
- **rhoCentralFoam** as a second solver (`numerics.solver`), with Kurganov
  fluxes, van Leer reconstruction and local time stepping. It carries
  viscous work itself and needs no extension.
- **V7**, rhoPimpleFoam against rhoCentralFoam on the V1 nozzle.
- **V2**, the NPARC nozzle with a normal shock, on a new tabulated-wall
  geometry (`wall_profile`) and a fixed-pressure exit
  (`truncated_at_exit` with `fixed_pressure`).
- **Grid-convergence studies** (`sonicline study`, core/gci.py, run/study.py):
  three meshes refined systematically by one ratio in every direction
  (`mesh.refinement`; default √2), observed order, Richardson
  extrapolation and the GCI of Celik et al. (2008), whose worked example
  the tests reproduce. The quality presets are not such a family (their
  radial counts go 8/12/16 while axial spacing halves), so a study refines
  one preset.
- **V3**, shocks in the 20 bar reference nozzle (pb = 10 and 14 bar), and
  **V5**, the throat Cd sweep over Rc/Rt = 0.625–4 as grid studies.
- **Planar nozzles** (`mesh.form` = `planar`, with `planar_width`): the
  half-channel of a two-dimensional nozzle, one cell deep, a symmetry plane
  on the axis and `empty` front and back. Profile heights replace radii;
  area ratios are ratios of heights.
- **V11**, validation against experiment: NASA TP-1704's nozzle B1 (Mason,
  Putnam and Re 1980), whose wall pressures are printed in tables.
- **Wall functions** for coarse walls (`first_cell_yplus` > 5: Spalding's
  law) and a **warm start** for viscous rhoCentralFoam runs.
- **Nightly CI** runs the whole verification suite
  (.github/workflows/sonicline-nightly.yml).

Findings:

13. **rhoCentralFoam's default local-time-step smoothing leaves the chamber
    ringing.** With `rDeltaTSmoothingCoeff` 0.02 the time step may grow only
    2 % per cell away from the throat's small cells; the chamber gets almost
    no pseudo-time and the inlet mass flow oscillated by ±10 % after 30 000
    iterations. At 1 (a doubling per cell) the oscillation damps. The exit
    flux then kept a 2×10⁻³ limit cycle at maxCo 0.2, which 0.1 removes; 0.4
    diverged. V1 converges in 23 000 iterations (2 minutes on 4 cores for
    3000 cells), so rhoCentralFoam's default iteration limit is 60 000.
    Kurganov and Tadmor fluxes agree on mass flow to 0.1 %.
14. **rhoPimpleFoam misplaces normal shocks.** In the NPARC nozzle
    (pe/p0 = 0.75, shock at x = 7.562 in by quasi-1D theory), started from
    the quasi-1D solution with the shock in place:
    - transonic, local time stepping: the shock leaves the nozzle within
      50 iterations and stays pinned at the exit plane (thrust control
      volumes then disagree by 23 %). Courant number 0.2 or three outer
      correctors only slow it.
    - transonic, time-accurate: the same drift, 31 % of the diverging length
      in 1.2 ms.
    - `transonic no`: it settles, 30 % of the diverging length downstream.
    - rhoCentralFoam, same mesh: +0.23 % on the axis, −0.11 % at the wall,
      Cd within 3×10⁻⁵ of Kliegel–Levine, mass balance 8×10⁻⁶.

    The pressure-based solver does not satisfy the jump conditions across a
    captured shock. That does not touch the design-point cases, whose
    nozzles are shock-free and whose supersonic exit is blind to the plume;
    it does mean the shock cells in rhoPimpleFoam's plume images are
    qualitative. Solver choice changed accordingly (section 3.2).
15. **Explicit rhoCentralFoam is slow on wall-resolved meshes.** The 20 bar
    SST case (21 000 cells, y⁺ < 1) managed about 10 iterations a second on
    4 cores and was still oscillating by 10 % at 4500 iterations, where
    rhoPimpleFoam converges in 1200. Viscous shock-in-nozzle cases (the
    overexpanded sea-level nozzle) will need this addressed: a
    rhoPimpleFoam start followed by rhoCentralFoam, or a coarser wall with
    wall functions.
16. **Kliegel–Levine assumes one throat radius.** With the standard
    downstream radius of 0.382 Rt kept while the upstream one varied, CFD
    minus Kliegel–Levine drifted from −0.21 % (Rc/Rt 0.625) to +0.09 % (4).
    With both radii equal it is one-signed, −0.26 % to −0.06 % on standard
    meshes, and roughly halves on the fine preset: discretisation error.
17. **Extrapolated, the inviscid throat Cd matches Kliegel–Levine to 4×10⁻⁵
    from Rc/Rt = 0.625 to 4.** Observed orders are 1.3–1.6 (the scheme is
    nominally second order; limiters near the sonic line cost some of it).
    Single-mesh Cd on the standard preset is low by about 0.25 % for a sharp
    throat and 0.06 % for a gentle one, and that is the size of the
    discretisation error in any single-mesh Cd SONICLINE reports; a study
    measures it.
18. **A conical nozzle's normal shock is curved, and no simple theory
    places it.** In the reference nozzle it stands further downstream on the
    axis than at the wall by 4.6 % (pb = 10 bar) to 10 % (14 bar) of the
    diverging length. Quasi-1D theory's plane shock lies within 7 % of
    both ends but not always between them; source flow predicts a spherical shock with a fixed 7.5 %
    axis-to-wall offset, which fits neither. The subsonic flow behind the
    shock shapes it. V3 therefore checks position to 10 % and serves as a
    regression guard on a real thruster geometry; V2's gently varying
    nozzle is the tight test.
19. **A slow oscillation fooled the convergence monitor.** rhoCentralFoam
    can settle into a limit cycle of ~10⁻⁴ over ~1000 iterations (a shock
    stepping between cells in V2). A 200-iteration window that lands on a
    turning point looks flat; the reported integrals, averaged over the last
    tenth of the run, then disagreed by 5×10⁻⁴ on V2's mass balance, and a
    V1 run stopped as converged was judged unconverged a hundred iterations
    later. Steadiness is now judged over the same span the integrals are
    averaged over (the last tenth, up to 1000 iterations), the solver stops
    only after the criteria have held for half of it, and the verification
    suite fails any run the verdict does not trust, whatever its checks say.
    Shock cases run to a drift tolerance of 10⁻⁴ (the limit cycle's size)
    with the usual mass balance.
20. **Peng–Robinson over-predicts nitrogen's real-gas mass flux by about a
    quarter.** Its compressibility at 300 K is 0.5 % low at 20 bar; along
    the isentrope its choked-flux bias is +0.89 % against the reference
    equation of state's +0.71 % (+1.31 % vs +1.05 % at 30 bar). It is
    available (`gas.equation_of_state`), verified against its own isentrope
    (V10), and runs with rhoPimpleFoam only: OpenFOAM compiles it with
    constant cp only in enthalpy form, which rhoCentralFoam cannot use. For
    mass flow the perfect gas plus the reference-EOS correction remains the
    more accurate answer, and stays the default.
21. **Laminar vs SST, and what the ISO venturi can and cannot say (V9).**
    ISO 9300's toroidal-throat venturi (Rc = 2d, Cd = 0.9959 − 2.720 Re^−½,
    ±0.3 %) on standard meshes:

    | | Re_d | laminar | SST |
    |---|---|---|---|
    | 2 bar | 5.1×10⁴ | −0.067 % | −0.069 % |
    | 10 bar | 2.6×10⁵ | +0.103 % | 0.000 % |

    At 2 bar SST stays effectively laminar through the throat (μt/μ > 1 in
    278 of 3870 cells, none in the throat boundary layer); at 10 bar it is
    turbulent almost everywhere and reads 0.10 % below laminar. V5 puts the
    single-mesh bias for this throat curvature at about −0.06 %. Every
    result sits inside the correlation's 0.3 %, so a discharge coefficient
    at these Reynolds numbers cannot tell the two models apart; the
    correlation's Re^−½ form is itself the laminar boundary layer's. For the
    20 bar thruster (throat Re ~6×10⁵) laminar gives +0.074 % mass flow,
    +0.18 % thrust and 0.053 N of wall friction against SST's 0.078 N: the
    turbulence-model uncertainty is about 0.2 % of thrust, which the
    pre-flight check states. The recovery factor, measured against the axis
    temperature, is 0.775 laminar and 0.877 SST (flat plate: 0.83 and 0.88);
    the axis is only a proxy for the boundary-layer edge in an accelerating
    conical flow, so the check's band is wide (0.75–0.95). A grid study of
    the venturi cases was stopped: its finest level converges at 4
    iterations a second, and the model spread it would resolve is already
    below the correlation's uncertainty.
22. **A wall-resolved first cell does not suit a large, high-Reynolds nozzle.**
    TP-1704's nozzle has a 27 mm throat at Re ~3×10⁶: a y⁺ = 1 first cell is
    0.2 µm, and the clustering carried into the lip shear layer made cells of
    aspect ratio 55 000 (determinant 4×10⁻¹⁰). rhoPimpleFoam's energy solve
    needed 1000 sweeps on the first step and the run diverged on the second.
    With the first cell at y⁺ = 30 and Spalding's wall law it converges in
    30 seconds. Wall-resolved remains the default for thruster-sized
    nozzles; the planar validation runs with wall functions.
23. **rhoCentralFoam needs limited gradients for k and ω.** With `Gauss
    linear` gradients feeding linearUpwind convection, ω (which varies as
    1/y² near a wall) overshot to ±10³² within ten iterations even for
    attached flow. `cellLimited Gauss linear 1` on grad(k) and grad(ω)
    (rhoPimpleFoam's setting) cures it.
24. **rhoCentralFoam cannot start a viscous jet from the quasi-1D field.**
    Where the jet meets still ambient air across one thin lip cell, its first
    energy update went negative. Two changes: an overexpanded jet core is
    initialised at ambient pressure (carried at its 0.28 atm exit pressure it
    had driven the far outlet to vacuum), and viscous rhoCentralFoam runs
    start with 1000 iterations of rhoPimpleFoam, whose output is set aside so
    the continuation is judged on its own.
25. **A separated nozzle never settles, and the drift test mistook its
    scatter for drift.** In TP-1704's nozzle at NPR 2.46 the inlet mass flow
    is steady to 1.2×10⁻⁴ and the exit mean matches it to 10⁻⁴, but the exit
    flow scatters by 1.7×10⁻³ for 35 000 iterations as the separation shock
    and shear layer move. Two changes. Drift is now judged beyond what the
    scatter alone produces: pure noise gives half-window means that differ
    by ~σ√(4/n), and twice that is allowed. The allowed scatter is a
    criterion (`noise_tolerance`, 10⁻³ by default), and any run that
    converges with more than 10⁻³ is flagged: its numbers are averages over
    pseudo-time, not a steady or a time-accurate solution. V11's separated
    case allows 5×10⁻³.
26. **Validation against TP-1704's nozzle B1 (V11).** Planar, SST with wall
    functions, standard mesh; wall p/pt against the upper-flap tables at ten
    orifices:
    - NPR 8.91, attached: nine orifices within 0.02 of the test's spanwise
      spread, RMS 0.014 against the centreline.
    - NPR 2.46, separated: separation falls between the same two orifices as
      in the test (x/l_e 0.429 and 0.560). The plateau behind it is within
      0.015, and nine orifices are within 0.02 of the spread (RMS 0.024 against
      the centreline). The orifice at the separation line reads 0.321, between
      the test's centreline 0.371 and quarter-span 0.290; the separation line
      is three-dimensional, as TP-1704 notes.
    - Both miss at x/l_e = 0.011, 0.6 mm past the sharp throat (rc = 0.5 h_t),
      by 0.04–0.05, on the standard and the fine mesh alike (0.037 and 0.049
      at NPR 8.91), so not by discretisation. Candidates are what a
      two-dimensional model omits (sidewall boundary layers in a nozzle only
      3.7 throat heights wide) and the orifice's finite size in a gradient of
      about one p/pt per centimetre. The check allows one orifice outside the
      band and names it.

Not done in M2:

- **The wall-resolved 3D run of the sea-level case.** The standard 3D mesh
  is 900 000 cells, about two hours on 4 cores. A coarse comparison
  (268 000 cells) was started twice, and both times the container restarted
  mid-run. It is still owed. V6 already shows 3D and wedge agreeing
  inviscidly (0.03 % mass flow).
- **The WSL2 runner on a Windows machine.** It needs one; it is untested
  beyond its command construction.
- **Hunter's nozzle (1998) as a quantitative case.** Its geometry is
  published exactly, but its wall pressures only as plots. TP-1704 (V11)
  has tables.

## 12. M3 record: the desktop application

Delivered:

- **A project store** (`sonicline.project`, no Qt), as in section 4.3:
  `project.json`, content-addressed geometry, simulations, immutable runs,
  and a run history read from each run's manifest and metrics.
- **An editable draft** (`sonicline.project.draft`). It holds a definition's
  JSON, edited by dotted path, and reports three things, all tested without
  Qt:
  - whether it parses;
  - the pre-flight findings;
  - the quasi-1D prediction.
- **Plain-data scenes** (`sonicline.post.scene`): the nozzle and a mesh's
  patches as numpy arrays. The Qt viewport renders them; nothing below the
  UI knows VTK.
- **Runs as processes.** The UI starts `sonicline run --events json` and
  reads JSON event lines. Live plots come from the same function-object
  tables the convergence monitor reads. Cancelling writes a cancel file that
  the pipeline polls, so the run stops its solver and records itself as
  cancelled. That works on Windows too, which lacks the signals a Linux
  implementation would use. Every stage transition is now in the manifest.
- **The window.** Project tree, the four stages, a pyvista viewport, the
  checks panel with per-stage badges, and live pyqtgraph plots. Tested
  offscreen (10 tests), and screenshot-checked under Xvfb with a real
  OpenFOAM run started from the UI. That run gave the same numbers as the
  CLI (V1: 7.1637 g/s, 4.9456 N).

Findings:

27. **pyvista rejects three-digit hex colours** (`#556`); the offscreen tests,
    which disable the 3D view, could not see it. Only the Xvfb run with the
    real viewport found it. Screenshot runs stay part of UI changes.
28. **The pipeline announced "done" after writing its manifest**, so the
    final transition never reached it. The cancellation test found this.

## 13. M4 record: results

Delivered:

- **`sonicline.post.fieldview`** (pyvista, no Qt). It reads a run's case
  with VTK's OpenFOAM reader (the latest time, or the processor directories
  of a run stopped before reconstruction) and provides:
  - derived fields: Mach, speed, density, total temperature, and total
    pressure isentropic from p and Mach, labelled as such;
  - the meridian plane, mirrored for wedge and planar runs;
  - patches, cutting planes, radial and centreline samples;
  - direction arrows and streamlines;
  - a probe that returns the cell's own values, so a click on the mirrored
    half reads the cell it mirrors;
  - the engineering summary.
- **`sonicline.post.report`** and `sonicline report`: report.json, contour,
  axial and convergence PNGs, and a PDF that opens with the verdict. On a
  machine that cannot render off screen, the images are listed as missing
  and the numbers are still written.
- **The Results stage**, with everything in DESIGN's M4 list:
  - field selector;
  - legend and manual range, stating the data's own min and max;
  - patch visibility;
  - cutting plane;
  - vectors and streamlines;
  - probe;
  - axial plots;
  - engineering summary with the verdict;
  - export.

  The view frames the nozzle and near plume by default.
- **Tests on a synthetic run.** The case builder's quasi-1D initial fields
  stand in for results. They check the following without OpenFOAM:
  - derived fields: T0 and p0 recovered to single precision;
  - centreline against theory;
  - mirroring and the probe;
  - the report;
  - the UI.

  Contour images are compared with stored references. They match within
  2/255 mean difference under both OSMesa and Xvfb, while the Mach and
  pressure pictures differ by more than 20/255.

Findings:

29. **VTK reads OpenFOAM fields in single precision**: exactness tests on
    what the viewer shows hold to 10⁻⁷, not 10⁻⁹.
30. **A scalar bar attaches to the last mapper added.** With vectors or
    streamlines on, the Mach legend showed the velocity range (−75 to 654);
    it is now bound to the field's own mapper. A title on a horizontal bar
    also collides with its labels, so the field name is a heading.
31. **The whole domain is the wrong default frame.** In the sea-level case
    the plume is 20 exit diameters long and the nozzle a speck; the near
    field (nozzle plus three exit diameters) is the default for the view,
    the axial plot and the report images.
32. **Speed-scaled arrows vanish in the chamber** (Mach 0.04 against 3.4 at
    the exit). Arrows show direction at one length; the colour carries the
    magnitude.
33. **Off-screen rendering without a working OpenGL does not raise; it
    kills the process.** On GitHub's GPU-less Windows runner VTK died with
    an access violation inside a report export. Report images are now
    rendered in a child process: a failure there becomes a listed missing
    image. The pipeline writes its manifest before rendering, so a finished
    run survives a crash in its image step.


## 14. M5 record: broader geometry and boundary conditions

Delivered:

- **Mass-flow inlet.** `flowRateInletVelocity` carries the flow (per wedge
  or half-channel, divided by the sector factor), the inlet pressure floats
  (zero gradient), and the total temperature is held.
  - The solver starts from the ideal quasi-1D chamber pressure for that
    flow: `nozzle.stagnation_pressure_for`, choked or not.
  - The CFD's own inlet total pressure becomes p0 in the metrics, and Cd
    and the ideal reference are judged at it.
  - **V12** gives V1's nozzle V1's mass flow. The CFD finds 9.994 bar
    against 10 bar (−0.06 %; tolerance 0.2 %, V1's Cd tolerance carried
    over, since p0 scales with 1/Cd).
  - The UI switches between chamber pressure and mass flow, carrying the
    implied value across.
- **Prescribed wall temperature.** A `wallHeatFlux` function object
  integrates the heat into the gas, and the first law is checked with it:
  mdot cp (T0,exit − T0,inlet) = Q.
  - **V13** runs V1 laminar with a 450 K wall. The gas gains 0.96 % in
    total temperature, and the balance closes to 4×10⁻⁵.
  - Stagnation-temperature and recovery-factor checks now apply only to
    adiabatic walls.
- **Condensation, checked live.** After the run, every cell's temperature
  is compared with nitrogen's saturation temperature at its own pressure
  (CoolProp above the triple point, Clausius–Clapeyron below it, tabulated
  in log p). The nozzle and the plume are checked separately. A
  supersaturated region is a verdict warning that names how many cells, by
  how much and where. The pre-flight exit-plane estimate stays.
- **STL input.** trimesh checks:
  - watertight;
  - manifold;
  - winding;
  - one body;
  - duplicate, zero-area and sliver triangles.

  An inside-out file is flipped with a warning. OpenFOAM's
  `surfaceCheck -checkSelfIntersection` runs when the run starts, and a
  self-intersecting surface is rejected. The analysis then matches the STEP
  analyser: the example nozzle's STL agrees with its STEP to 0.02 % in
  throat radius and 0.2 % in area ratio.
- **General (non-revolved) fluid volumes.** STEP or STL volumes that are
  not bodies of revolution are analysed, not rejected. Their profile is the
  area-equivalent radius, and they are meshed by Tier 2.
  `examples/nozzle-side-port.step` (made by `make_side_port.py`) is the
  2 mm example nozzle with a closed pressure-tap port on its chamber.
- **Tier 2 meshing** (`sonicline.mesh.unstructured`, `"form":
  "unstructured"`, `"mesher": "auto" | "snappy" | "cfmesh" | "gmsh"`):
  - The surface is moved into the canonical nozzle frame and split into
    patches by position and normal (inlet, wall, outlet; lip, ambient and
    far outlet when a plume cylinder is fused on with manifold3d).
  - The snappyHexMesh background grid has planes exactly at the throat and
    exit.
  - The throat and exit face zones are cut in Python: internal faces
    between cells on either side of the plane, oriented along +x.
  - Three meshers, all external processes:
    - snappyHexMesh, the first choice for inviscid runs;
    - cfMesh (`cartesianMesh`), the first choice for viscous runs;
    - gmsh, the last resort: prism layers on the nozzle's closed shell and
      a tetrahedral core, the plume as a second volume through the shared
      exit disk, via MSH 2.2 and `gmshToFoam`.

    A rejected mesh passes the run to the next mesher, with the reason
    recorded.
  - Layer coverage is measured on the mesh, whichever mesher made it: a
    wall face is covered when its cell is no taller than 1.5 × the target
    first cell. The gate needs 95 % of the wall and every face within two
    throat radii of the throat.
  - The polyMesh reader and writer now handle polygons of any size.
  - Cell centres are volume centroids, from face centroids by triangle fan.
- **V14** compares the unstructured mesher with the structured wedge on the
  V1 nozzle.

Findings:

34. **The inertia axis is wrong as soon as symmetry breaks.** A 1.2 mm
    side port on the example nozzle's chamber tilted the principal axes
    enough to read a 47 µm "throat". The axis now comes from two coaxial
    planar end faces at the body's extremes when there are any, and from
    inertia otherwise. With it the side-port nozzle reads the plain
    nozzle's throat and area ratio to 10⁻⁶.
35. **A tessellated body's inertia axis is good to about 10⁻⁵ rad**, not
    the 10⁻⁷ of an exact solid. End-face detection with 10⁻⁶ tolerances
    missed an STL's end disks: 3 mm × 10⁻⁵ is 3×10⁻⁸ m, above the old
    positional tolerance. Those disks decide the inlet end, so the missed
    detection reversed the STL nozzle.
36. **ESI's wall heat flux is right in the internal-energy form.**
    `wallHeatFlux` integrates alphaEff ∂e/∂n. alphaEff carries Cp/Cv
    (heThermo), so that is κ ∂T/∂n, and rhoPimpleFoam's energy equation
    uses the same product. V13's closure confirms it.
37. **Snapped cells do not survive the structured meshes' start.** On the
    first iteration p fell to its floor in wall cells of the supersonic
    cone. They sit at the four azimuths where the Cartesian grid meets the
    wall tangentially and snapping leaves thin cells (determinant ~0.02).
    Upwinding did not help. maxCo 0.3 survived and 0.5 did not, so
    unstructured meshes run at 0.25.
    A level change right at the snapped wall also left 705 concave cells;
    the whole nozzle is now refined to the wall level.
38. **Six cells across the throat radius is not enough in 3D.**
    - At 6 cells (44 k cells) the mass flow read +0.53 % against the
      standard wedge.
    - At 10 cells (174 k) it read −0.06 %, with thrust −0.18 % against the
      1D reference (−0.22 % against the wedge) and Cd 0.08 % below
      Kliegel–Levine.

    The presets are now 10, 14 and 20 cells per throat radius. V14 runs the
    coarse one: the standard one is 480 k cells, too many for a nightly
    check.
39. **A cut through cells is not a plane.**
    - The throat zone of a tetrahedral mesh meets the wall up to a cell away
      from the throat, where the nozzle is wider: its projected area read
      1.8 % above the throat's. Cd on unstructured meshes is therefore
      measured against the geometry's throat. The mesh's faceting (a
      40-sided throat on the coarse snapped mesh is 0.4 % small) then shows
      in Cd, where it belongs.
    - The pressure force on such a zone is the normal integral of p x̂
      (`exprField`, `areaNormalIntegrate`), not ∫p|dS|, which over-counts
      a jagged surface.
    - Mass flow through any closed cut is exact, since it is the solver's
      own face fluxes.
40. **snappyHexMesh cannot layer these nozzles; cfMesh can.**
    - snappy averaged about one layer whatever the settings (layer count,
      feature angle, medial-axis ratio, relaxed tetrahedron quality). On the
      example nozzle with wall functions, 47 % of the wall and 34 % of the
      throat faces carried one. That is the collapse §3.5 anticipated, and
      the gate rejects such a mesh.
    - cfMesh inserts its layers by splitting the boundary cells, and put the
      1.6 µm wall-function first cell on every wall face, throat included.
      On the side-port nozzle with a sea-level plume: 863 k cells, median
      first cell 1.51 µm, non-orthogonality 45°.
    - cfMesh must be asked to fill half a wall cell: asked to fill a whole
      one, it made the first layer half the target.
    - cfMesh writes the neighbour list padded to every face with −1; the
      reader cuts it at the first patch.
41. **gmsh prism layers work only while the stack stays thin, and not
    against a plume.**
    - Extruding the whole boundary inwards, the tetrahedral core failed
      ("a segment and a facet intersect") once the stack approached the
      wall triangle size: extrusions from neighbouring patches cross at the
      sharp inlet and exit rims. The stack is kept to 0.3 of the triangle
      size.
    - With a plume, extruding over the plume's large boundaries gave 3.9 M
      cells and degenerate faces. As two volumes sharing the exit disk it
      gave 2 M cells, and 90° non-orthogonality where the thin exit-disk
      prisms meet the plume tetrahedra. The gate rejects that mesh, so for
      sea-level runs gmsh is a fallback in name only; cfMesh carries them.
    - For a truncated (vacuum) domain it gives a gated mesh: 455 k cells
      with 10 prism layers on the side-port nozzle.
42. **checkMesh's "face tets" error is not a negative volume.** The
    face-tetrahedron decomposition serves particle tracking and point
    interpolation, not the finite-volume solve. Thin layer cells with
    slightly warped faces trip it (17,790 faces on a cfMesh layer mesh), so
    it is a gate warning.
43. **Two latent mesh-reader bugs.**
    - The cell count was taken from the owner list alone; OpenFOAM's last
      cell can appear only as a neighbour.
    - Vertex-averaged face centres put a cube with one hanging node 1.2 %
      off centre; area-weighted centroids do not.

44. **The verdict refused the first sea-level Tier 2 run, rightly.** The
    side-port nozzle ran at 20 bar into a sea-level plume with k-ω SST and
    wall functions, on cfMesh at 0.7 of the coarse preset (7 cells across
    the throat radius, 369 k cells). It converged in 1305 iterations, with
    an inlet–exit mass balance of −0.017 %.
    - Cd came out at 1.0103, which a viscous nozzle cannot have.
    - The mesh's own throat section is within 0.1 % of the geometry's, so
      the extra mass flux is discretisation error: the throat plane already
      reads Mach 1.055, so the sonic line has moved upstream.
    - The run is marked not trustworthy, with that reason.
    - At the coarse preset (10 cells, cfMesh, 863 k cells) Cd is 1.0029,
      and the verdict again refuses the run.
    - Against the structured wedge's SST result for the same nozzle
      without the port (14.275 g/s, Cd 0.990, 8.363 N), mass flow reads
      +2.0 % at 7 cells and +1.3 % at 10, and thrust +0.55 % at 10.
    - Inviscid V14 at 10 cells is within 0.06 % of the wedge, so the bias
      comes with the boundary layer on these meshes. Its cause is not
      found. Candidates: the jump from the layer stack (half a wall cell)
      to the bulk cells, and wall functions on polyhedral wall cells.
      Until it is found, viscous Tier 2 results are not trustworthy at
      these resolutions, and the verdict says so.
45. **Long runs die with the container.** The container is reclaimed when
    the session goes idle. Twice a sea-level run was killed mid-solve
    (at iteration 200, and before its first 100). There is no restart from
    the last write yet; a run is only as durable as the process driving it.

Not done in M5:

- **Viscous Tier 2 is not yet accurate** (finding 44): +1.3 % mass flow at
  the coarse preset. Inviscid Tier 2 is verified (V14). The first M6 task
  is to find the bias: the layer-to-core transition, a y+ 1 layer stack,
  and the standard preset.

- cfMesh has no verification case of its own: V14 checks snappy
  (inviscid). The layered meshes are checked for coverage and quality only.
- The gmsh fallback cannot mesh a plume with layers (finding 41).
- The Tier 2 comparison runs on the coarse preset only. The standard
  preset's 480 k-cell V1 has not been run.
- OCP's `BRepCheck_Analyzer` checks for STEP were not needed and not added.
- Grid-convergence studies (`sonicline study`) run on unstructured meshes,
  but snapped and tetrahedral meshes are not a systematically refined
  family, so their GCI is indicative only.

## 15. M6 record: transients, solid bodies, experiments

Delivered:

- **Transient runs** (`"time": {"transient": {...}}`, `sonicline.post.timeseries`):
  - rhoCentralFoam, Euler in time, at maxCo 0.3. A transient always runs
    the explicit solver.
  - The thruster starts from rest: the domain at ambient pressure and
    temperature (or 10⁻³ p0 in vacuum, which the solver needs above zero),
    and the valve opens at t = 0. With `ramp_time` it opens linearly: the
    inlet is a `uniformTotalPressure` table from the start pressure to p0.
    `"initial": "quasi_1d"` starts from the steady estimate instead.
  - A `volFieldValue` function object integrates ρ over the domain every
    step, beside the existing flux integrals. `timeseries.json` holds
    thrust, mass flow in and out, and the domain's mass at every step.
  - The metrics add rise time (10 % and 90 % of final thrust), peak and
    overshoot, the thrust drift over the last tenth (settled below 1 %),
    and **conservation in time**: the mass gained between the first and
    last step against the trapezoidal integral of net inflow. Above 10⁻³
    the run is not trustworthy. An unsettled run gets a warning, and the
    steady-state checks are not applied to it.
  - The final state (Cd, thrust, every steady metric) is the mean over the
    last tenth of the run (finding 48).
  - Fields are written `frames` times, reconstructed, and rendered on one
    colour scale into `frames/Mach.gif` (in a child process, like every
    render). `sonicline report` makes it for a run that has none.
  - A pre-flight warning flags an instant opening against more than 100:1
    (finding 47).
- **Resume** (`sonicline run --resume`): the run directory's case continues
  from its last written time, with the saved case summary and mesh, and
  the manifest records it. It answers finding 45 for runs whose process
  died; a run is still only as durable as the machine. Tested by killing
  a 0.3 ms startup mid-solve and resuming from its 0.15 ms write: the
  stitched time series is monotonic and conserves mass in time to
  1.8×10⁻⁶ across the restart.
- **Solid-to-fluid extraction** (`sonicline extract`, and a button on the
  Geometry stage when the analyser reports a solid body). In the CAD
  kernel's child process:
  - each inner wire of a planar face (an opening) is capped with a face;
  - the body and the caps are fragmented together with a padded box;
  - the gas passage is the piece that is not the body, does not touch the
    box, and is bounded by at least two caps.

  None, or more than one, is an error that says why. The UI tessellates
  the result, shows it in the viewport, and asks before importing it; the
  import then runs the ordinary analysis on the new STEP.
- **Gases.** Air (γ 1.4, CoolProp "Air") and heated air (γ 1.35, no
  real-gas reference) join N₂, only to run E1 and E2. A non-N₂ gas is a
  warning, and the regulator-cooling and real-gas corrections apply to
  gases that have a reference.
- **Least-squares gradients on unstructured meshes** (finding 46).
- **E1, E2** (validation against experiment) and **V15** (transient
  verification). They are in the default `verify` list and the nightly run.

Findings:

46. **The Tier 2 mass-flow bias is cfMesh's, not the boundary layer's.**
    Finding 44 blamed the layers. V1 inviscid on cfMesh settles it:
    - Gauss gradients, 10 cells across the throat radius (156 k cells):
      Cd +0.91 % against Kliegel–Levine. snappyHexMesh on the same
      preset gives −0.06 % (V14).
    - Two non-orthogonal correctors: unchanged (the mass flow agrees to
      10⁻⁴).
    - Least-squares gradients: +0.67 %. They are now the default on
      unstructured meshes.
    - Least squares at 7 cells (58 k): +1.03 %. From 7 to 10 cells the
      error falls about as h¹. Richardson extrapolation at first order
      puts the limit at −0.2 %, that is, it vanishes with refinement.
    - `keepCellsIntersectingBoundary` (184 k cells): +1.10 %, worse.
      Not adopted.

    So cfMesh's cut cells near the throat are first-order, and viscous runs,
    which cfMesh carries, read about 1 % high at the coarse preset. The
    standard preset (14 cells) should halve it and has not been run. The
    verdict still refuses a Cd above 1; below that the bias is unflagged,
    and the README says so.
47. **An instant opening into vacuum diverges.** V1 opened at t = 0
    against its 1 kPa start (1000:1) sent the temperature to 10⁹⁰ in ten
    steps: the inlet's total-pressure condition imposes a near-vacuum
    Riemann problem at the boundary face. A 0.1 ms linear opening runs
    cleanly, so V15 uses one, and the pre-flight check warns above 100:1.
    A sea-level startup (20:1) has not been tried without a ramp.
48. **A chamber rings long after the nozzle has settled.** At V15's end
    (1 ms, 0.9 ms after the valve is fully open) the exit mass flow is
    steady to 10⁻⁴, but the inlet's rings by ±0.4 % with a period of
    about 70 µs. That is an acoustic mode between the reflecting
    total-pressure inlet and the choked throat, undamped in inviscid flow.
    The steady inlet–exit balance read over the last 10 steps saw one
    phase of it (1.3×10⁻³). Over the last tenth it is 8.6×10⁻⁵. The
    final state is therefore that mean.
49. **Conservation in time closes to solver precision, and a startup
    ends on the steady solution.**
    - V15's domain gains 1.15117×10⁻⁶ kg against 1.15116×10⁻⁶ kg of
      integrated net inflow, an error of 7×10⁻⁷ over 228,505 steps.
    - The same check on the diverging first attempt read NaN, and the run
      was marked failed, so the check cannot pass a broken run.
    - Judged against Kliegel–Levine, V15's end state failed: Cd −0.29 %
      against the standard mesh's 0.2 %. The steady rhoCentralFoam solve
      on the same coarse wedge reads −0.28 %, so the error is the mesh's.
      V15 therefore compares its end state with that steady solve:
      −0.008 % in mass flow, +0.002 % in thrust.
    - Thrust reaches 10 % at 22 µs and 90 % at 92 µs of the 100 µs
      opening, and overshoots by 8 %.
50. **E1: the JPL 45°–15° nozzle** (Back, Massier and Gier, JPL TR 32-654,
    1965, NTRS 19650001801).
    - Wall pressures were digitised from Figure 4. Axes are calibrated
      piecewise from the printed grid lines, since the scan is not linear
      over the page. The markers are open symbols, located as the
      centroids of their holes.
    - Where the test's repeated runs scatter, the band is their spread.
      Reading error is taken as 0.005 in p/pt and 0.02 in in position, and
      the CFD is read over the tap's position ± 0.02 in.
    - The geometry is reproduced exactly by `ConicalNozzle`: throat radius
      0.8 in, rc/rt 0.625 on both sides, 45° in and 15° out, a 1.0 in
      fillet, contraction 9.76, expansion 6.63.
    - Conditions: heated air at 250.2 psia and 833 K, SST with wall
      functions, exhausting to vacuum. The report's hot runs had cooled
      walls, with no wall temperature given; the CFD holds the wall at half
      the total temperature. The report found the wall pressures
      insensitive to cooling, and it found tap size alone moved readings
      by up to 7 % (smaller taps lower), an uncertainty the tolerances do
      not claim to beat.
    - Result: 13 of 13 taps away from the throat within 5 %, 4 of 5 near
      it within 10 %.
    - The miss is 0.05 in past the throat, where the test shows an
      over-expansion and recompression that the CFD, on a mesh sized for
      the throat, smooths out (p/pt 0.296 against 0.218).
    - Down the cone the CFD reads progressively high, reaching +13 % at
      the exit. That matches the constant-γ gas model: quasi-1D p/p0 at
      area ratio 6.63 is 11 % lower at γ 1.4 than at 1.35, and real air
      approaches 1.4 as it cools. The absolute differences (≤ 0.004) fall
      within the reading band, so the check passes. The trend is recorded
      here and in the README rather than hidden by the tolerance.
    - The first E1 run failed mass conservation (1.1×10⁻⁴) on the default
      numerics. E1 and E2 now use the tight preset (2.2×10⁻⁶).
51. **E2: Cd of the same nozzle in cold air** (Cuffel, Back and Massier,
    AIAA J. 7, 1969: measured 0.985). The CFD gives 0.9776, −0.74 %, with
    a 1 % tolerance for the measurement and the digitised geometry.
    - The first attempt, exhausting to 1 atm, was slow on the central
      solver, whose separation estimate at that pressure ratio forced it.
    - A choked nozzle's Cd and an attached supersonic wall flow cannot
      feel the back pressure, so E1 and E2 exhaust to vacuum.
    - That the CFD sits below the measurement is consistent with V5: a
      single mesh at rc/rt 0.625 reads about 0.25 % low.

Not done in M6:

- **cfMesh's bias is found, not fixed** (finding 46). Viscous Tier 2
  results carry about +1 % in mass flow at the coarse preset.
- **The 30°–15° nozzle** of the same report is not digitised: its figure
  overlays too many symbol sets to separate reliably. E1 is the 45°–15°
  nozzle alone.
- **No variable-γ gas.** E1's divergent-section trend (finding 50) is left
  explained, not corrected.
- **The desktop application does not set up transients.** They are
  defined in the definition JSON or through the API. The Results stage
  shows the last written time; the time selector exists in
  `RunResults(time=...)` but not in the window. The animation is a file
  in the run directory.
- A startup against a sea-level plume has not been run; V15 is in vacuum.

## 16. M7 record: closing M6's gaps

M7 was not in the original plan. It takes the "not done" list of §15:
the cfMesh bias, transients in the desktop application, a sea-level
startup, and E1's gas model.

Delivered:

- **Transients in the desktop application.**
  - The Physics stage has a Time group: steady state or a startup, with
    end time, valve opening and frame count. A startup defaults to V15's
    settings (1 ms, opening over 0.1 ms, 40 frames). The frame field takes
    whole numbers only.
  - The Results stage has a time slider over a run's written times, shown
    only when there is more than one. Moving it reloads the fields at that
    time and keeps the field, range and view. An Animation button opens
    `frames/Mach.gif`.
  - The engineering summary adds the startup rows: end time, 10 % and
    90 % thrust times, peak and overshoot, settling, and conservation in
    time.
- **Air with cp(T)** (`"species": "air_hot"`): a NASA-form polynomial fit
  of CoolProp's ideal-gas cp for air, within 0.3 % from 100 K to 1100 K.
  - OpenFOAM gets it as `janaf` thermo, one coefficient set on both sides
    of Tcommon.
  - SONICLINE's own total temperatures, the first-law wall-heat balance and
    the T0 field use the same enthalpy (`PerfectGas.enthalpy`,
    `total_temperature`), so the energy checks stay exact.
  - The quasi-1D theory keeps the constant-cp value at 833 K.
  - Nitrogen stays at constant cp (§3.3).
- **V16**: V4a's choked converging nozzle at 5 bar, started from rest into
  a sea-level plume.
- **cfMesh**: the whole nozzle interior is refined to the wall cell size
  (finding 52), and a cone around the throat to half of it (finding 53),
  which removes the bias. **V17** (manual: about 550 k cells) checks cfMesh
  against the structured wedge on V1.

Findings:

52. **The cfMesh bias is not the converging section's coarse core.**
    cfMesh refined only within a throat radius of the wall, which left the
    3 mm chamber of V1 coarse. Refining the whole nozzle interior added
    12 k cells (168 k) and cut the worst non-orthogonality from 52.7° to
    36.7°, but Cd still read +0.66 %, as before (+0.67 %). The refinement
    is kept for the mesh quality.
    - The wall is not it either. Wall-face centroids sit within 0.05 % of
      the throat radius of the true wall on both cfMesh and snappy meshes,
      worth 0.1 % in area at most.
    - Energy is conserved (T0 exit − inlet: 4×10⁻⁶).
    - The flux exceeds the isentropic choked maximum while the
      plane-averaged total pressure at the throat does not. Cell by cell,
      however, total pressure computed from p, T and U exceeds p0 in
      1,155 cells, by up to 10.6 %. These cells lie in the core of the
      converging section and the throat, not at the wall. The snappy mesh
      has the same artefact, weaker: 807 cells, up to 3.8 %.
    - Both meshers over-predict at coarse resolution (snappy +0.53 % at 6
      cells per throat radius, −0.06 % at 10); cfMesh converges more
      slowly.
    - A steady rhoCentralFoam solve on the cfMesh mesh, meant to separate
      the pressure-based solver from the mesh, did not converge: its mass
      flow still swung ±30 % after 3,000 local-time-step iterations. That
      test is inconclusive.
53. **Refining the throat removes it.** A cfMesh `cone` refinement from
    1.0 throat radius upstream of the throat to 0.5 downstream, radius
    1.3 r_t, at half the wall cell size:
    - Cd −0.05 % against Kliegel–Levine, where it was +0.66 %;
    - against the standard structured wedge, mass flow −0.025 % and thrust
      −0.05 % (V17; V14's tolerances are 0.5 %);
    - inlet–exit balance 1×10⁻⁵, trusted.

    So the error is first-order discretisation error in the transonic
    region, and cfMesh's cells there need to be finer than snappy's for
    the same accuracy. The cost is cells: 551 k instead of 168 k. cfMesh's
    octree balancing spreads the refinement well beyond the cone (a cone of
    radius 2 r_t, 2.5 r_t long, gave 977 k). Snappy is unchanged and stays
    the inviscid first choice; the refinement applies to cfMesh, which
    carries the viscous runs.
54. **The fix carries over to viscous runs.** The test was V1 with k-ω
    SST and wall functions (target y+ 30), exhausting to vacuum: cfMesh
    at the coarse preset (988 k cells, layers included) against the
    standard structured wedge.
    - Results: mass flow +0.032 %, thrust −0.017 %, Cd 0.9891 against
      0.9888. Before the throat refinement, the comparable viscous error
      was +1.3 % (finding 44, on the side-port nozzle at sea level).
    - Residual difference: wall viscous drag reads 6 % lower on cfMesh
      (0.068 N against 0.073 N). cfMesh made the layers thinner than asked
      (median first cell 0.65 µm against a 2.94 µm target), so the wall
      functions sit nearer the buffer layer. Here that is 0.1 % of thrust.
    - The run's integrals were steady to 10⁻⁵ by iteration 2,000, but the
      convergence test, held by a near-zero force component, had not
      stopped it at 3,200. The numbers above are the pipeline's own
      metrics, computed from its integrals at that point.
55. **A sea-level startup conserves mass in time through open
    boundaries.** V16 starts V4a's 5 bar converging nozzle from rest into
    its sea-level plume, valve opening over 0.1 ms, 1 ms run (233,182 steps
    on 1,885 cells).
    - Gas leaves through the outlet and is entrained through the ambient
      boundary throughout (2.2 g/s entrained against 3.6 g/s through the
      nozzle at the end). The domain's gain still matches the integrated
      net inflow to 3×10⁻⁷.
    - Thrust overshoots by 11 % and settles to 1.2×10⁻⁴ drift.
    - The end state matches the steady rhoCentralFoam solve on the same
      mesh to −0.001 % in mass flow and +0.003 % in thrust.
    - The steady solve carried a warning (its far plume was still drifting
      1.7 % per window, with thrust and mass flow converged). The
      comparison then reported a failure, because a pair demanded two fully
      trusted runs. A pair now takes the worse of its two verdicts, as a
      single case would.
56. **An instant opening at sea level is fine.** At 20 bar into 1 atm
    (20:1) with no valve ramp, the startup ran cleanly and conserved mass
    in time to 3.5×10⁻⁶. The 1000:1 opening into vacuum that diverged
    (finding 47) is a different regime. The 100:1 warning threshold
    stands. The thrust overshoot was 81 %, a real pressure surge from the
    sudden opening.
57. **cp(T) air fixes most of E1's drift down the cone.** With constant γ
    1.35, the CFD read +1.3 % at z = 3.6 in, +4.5 % at 4.0 and +13 % at
    5.3–6.0. With cp(T) it reads −2.1 % to +0.8 % from z = 2.64 to 4.62
    and +6 % at the last two taps. Those taps sit at p/pt 0.024–0.037, so
    6 % is 0.0015, inside the digitising's 0.005.
    - Quasi-1D theory had predicted the size: at area ratio 6.63, variable
      cp lowers p/p0 by 9 % against γ 1.35.
    - The rest of the nozzle barely moved (≤ 0.4 %).
    - The miss just past the throat (+34 %) is unchanged; it is not a gas
      effect.

Not done in M7:

- The viscous result above is one nozzle in vacuum. A viscous run against
  a sea-level plume on the refined cfMesh mesh has not been repeated (the
  M5 one was 863 k cells before the refinement).
- V17 is not in the nightly list (its cfMesh run alone is about 550 k
  cells); run it by name.
- snappy keeps 10 cells per throat radius and no throat refinement, since
  V14 shows it does not need them.

## 17. M8 record: real-gas nitrogen in the CFD, and wall treatment

M8 set out to close M7's two gaps (cfMesh's thin layers; a viscous cfMesh
run at sea level) and to remove the largest remaining systematic error for
nitrogen thrusters: the CFD's perfect gas.

Delivered:

- **The virial gas** (`"equation_of_state": "virial"`;
  `foam/extensions/virialGas`, `core/virial.py`).
  - An OpenFOAM equation of state SONICLINE compiles on first use, like
    the viscous-work fvOption. It is pressure-explicit,
    v = RT/p + B(T) + D(T)·p with D = (C − B²)/(RT).
  - B and C are quartics in 1/T, fitted to nitrogen's reference equation
    (Span et al. 2000, through CoolProp) from 70 K to 500 K.
  - Density is explicit, so psiThermo needs no root finding.
  - The enthalpy, entropy, cp and cp − cv departures are the analytic
    integrals of v(p, T). A test checks them against finite differences.
  - It runs as hePsiThermo / hConst / sensibleEnthalpy with constant or
    Sutherland transport.
  - The Python twin (`Virial`) supplies predictions, the metrics' own
    isentrope and V18's reference. It shares Peng–Robinson's choked-flux
    routine.
- **`"auto"`**, the default for new simulations and imports. It runs the
  virial gas wherever rhoPimpleFoam runs (nitrogen) and the perfect gas,
  with the reference correction reported, where a shock needs
  rhoCentralFoam. A real-gas equation of state needs the enthalpy form,
  which rhoCentralFoam cannot use. The pipeline resolves `auto` once the
  geometry is known and records the choice in the manifest. Verification
  cases name their gas explicitly.
- **V18**: V1 at 30 bar, virial against perfect gas on the same mesh. It is
  in the default and nightly list.
- **Rewritten controlDicts keep the case's libraries.** The warm start and
  continuations rewrite system/controlDict; they dropped `libs` before,
  which a virial case cannot survive.
- **`sonicline import` asks for y⁺ 6**, not 30, when it chooses wall
  functions (finding 59).
- **CI retries the OpenFOAM install** four times, minutes apart.
  OpenFOAM's package host served a JavaScript page in place of its apt
  index for hours on 2026-10-01, failing every OpenFOAM job at install.

Findings:

58. **cfMesh's thin throat layers are the price of its accuracy, and
    harmless.** cfMesh cuts its layers from the boundary cells. The throat
    cone (finding 53) halves those, and the layers came out at 0.20 of the
    target first-cell height there, 0.8–0.9 elsewhere. Two attempts to
    restore them:
    - A separate wall patch for the throat, with its own layer count and
      refinement: cfMesh refined the band around the patch and not the
      patch itself, and the layers stayed at 0.39.
      `allowDiscontinuity 1` changed nothing.
    - Keeping the refined cone off the wall (radius 0.8 r_t): the layers
      came back (0.71–0.92 everywhere, 579 k cells instead of 988 k), but
      V17 failed its own Cd check. Mass flow read −0.26 % and thrust
      −0.42 % against the wedge, where the cone reaching the wall gives
      −0.025 % and −0.05 %. The wall cells at the throat need the
      refinement as much as the core.

    The cone reaches the wall again (radius 1.3 r_t). Finding 59 shows the
    thin layers cost nothing.
59. **Wall functions at y⁺ 30 overestimate drag by 6 %.** The test was V1
    with k-ω SST on the standard wedge, against a wall-resolved run (y⁺ 1,
    low-Re treatment) as the reference.

    | first cell | mass flow | thrust | wall drag |
    |---|---|---|---|
    | y⁺ 1 (resolved) | 7.12998 g/s | 4.90580 N | 0.06831 N |
    | y⁺ 6, Spalding | +0.008 % | +0.02 % | −2.4 % |
    | y⁺ 30, Spalding | −0.04 % | −0.07 % | +6.4 % |
    | cfMesh, thin throat layers | −0.008 % | −0.09 % | −0.4 % |

    - The 6 % drag gap M7 attributed to cfMesh's layers (finding 54) was
      the y⁺ 30 wedge being high. cfMesh, with its throat cells near y⁺ 6,
      is the closer of the two.
    - The Spalding law holds through the buffer layer, so a thinner first
      cell is better with it, not worse.
    - Thrust moves by under 0.1 % either way, because drag is 1.4 % of
      thrust here.
60. **The virial gas is fifteen times closer than Peng–Robinson.**
    Choked mass flux against the reference equation of state, from the
    isentropes:

    | p0 / T0 | real-gas effect | virial error | Peng–Robinson error |
    |---|---|---|---|
    | 10 bar / 300 K | +0.356 % | −0.006 % | |
    | 20 bar / 300 K | +0.705 % | −0.006 % | +0.18 % |
    | 30 bar / 300 K | +1.050 % | −0.006 % | +0.26 % |
    | 20 bar / 250 K | +1.346 % | −0.001 % | |
    | 50 bar / 250 K | +3.403 % | +0.073 % | |

    - In the CFD (V18, 30 bar, standard wedge), the mass-flow ratio to the
      perfect gas on the same mesh is 1.01035. The virial isentrope gives
      1.01044 (−0.010 %) and the reference equation 1.0105 (−0.015 %).
      Peng–Robinson's V10 sits at +1.31 %.
    - Above 30 bar the truncated series loses accuracy; validation warns
      there.
    - B alone (no C) was enough to 20 bar but 0.1 % high at 50 bar.
    - Both coefficients must be fitted with a relative weight; an
      unweighted fit let the 60 K end dominate.
61. **Viscous cfMesh at sea level now matches the wedge.** The test was
    the 20 bar sea-level reference nozzle with k-ω SST, wall functions at
    y⁺ 30, a plume 8 × 4 exit diameters and the perfect gas: cfMesh at the
    coarse preset (1.70 M cells) against the standard structured wedge
    (8,298 cells).
    - Mass flow: +0.046 % (14.2745 against 14.2679 g/s). M5's cfMesh run of
      this kind read +1.3 % (finding 44).
    - Thrust from wall forces and feed: +0.018 % (8.3464 against 8.3449 N).
    - Wall drag: −10 %, the y⁺ effect of finding 59 (cfMesh's throat
      cells sit near y⁺ 6).
    - Exit-plane thrust read −1.35 %, and the inlet–exit mass balance was
      off by 0.95 %. That was a fault in the exit plane itself
      (finding 62), not in the flow.
    - The run took 2,000 iterations at about 10 s each on 4 cores. Its far
      plume never met the convergence test, as the wedge's did not either.
      The numbers are the pipeline's own metrics from its integrals at
      iteration 1,900, steady for the last 1,000 iterations.
62. **Face zones on cut-cell meshes were oriented by the wrong rule.**
    `plane_zone` collects the internal faces between cells on either side
    of x. It oriented them by the sign of each face normal's x component,
    which is right for a planar cut (snappy's grid has planes at the throat
    and exit). On cfMesh and gmsh meshes the cut is jagged, and many faces
    are nearly radial.
    - At the throat, where the flow is axial, that cost 2×10⁻⁵.
    - Behind a 15° cone the radial faces carry flux, and the exit zone lost
      0.97 % of the mass flow and 1.35 % of thrust.
    - A face is now flipped exactly when its owner cell is downstream. On
      the same run's fluxes, the exit zone then agrees with the inlet to
      2.8×10⁻⁴ (the run's own unconvergence), against −9.7×10⁻³ before.
    - A unit test builds a jagged cut with downstream-owned radial faces.
      It fails on the old rule.
    - Mass flow and Cd come from the inlet patch and were never affected.
      Exit-plane thrust on cfMesh and gmsh meshes at sea level was, M5's
      +0.55 % for the side-port nozzle included (finding 44). The verdict's
      mass-balance check would have refused such a run as not trustworthy,
      which is the safe failure.

Not done in M8:

- The virial coefficients exist for nitrogen only; air (E1, E2) and other
  gases run as perfect gases.
- The ideal-gas cp stays constant in the virial gas. For nitrogen that
  costs under 0.5 % in cp between 30 and 400 K, but a hot gas would need
  cp(T) as well.
- rhoCentralFoam cannot run a real gas. Shocked nozzles still run the
  perfect gas with the correction reported.

## 18. M9 record: the real gas on both solvers, and heated gas

M9 closes two items M8 left open: rhoCentralFoam could not run a real gas,
and the ideal-gas cp was constant everywhere. It also adds what heated
thrusters need, cp(T), while leaving cold gas on the constant cp that is
right for it.

Delivered:

- **The virial gas in internal-energy form.** The virial-gas library now
  compiles all eight combinations of const/Sutherland transport,
  hConst/janaf thermo and sensibleInternalEnergy/sensibleEnthalpy.
  - OpenFOAM derives internal energy for any equation of state as
    e = h − p/ρ and cv = cp − (cp − cv)_EOS. Both are exact for the virial
    gas, so it runs in e on both solvers. rhoCentralFoam needs that form,
    since it solves for ρE.
  - `auto` now picks the virial gas for nitrogen whatever the solver,
    shocked nozzles included.
  - Peng–Robinson keeps its rhoPimpleFoam-only limit (enthalpy form only).
- **Heat capacity** (`"heat_capacity"`: `auto`, `constant` or
  `temperature_dependent`).
  - `auto`, the default, is cp(T) above a 350 K chamber for a gas with a
    cp(T) fit (nitrogen, air) and constant below it.
  - cp(T) is a quartic in T fitted to CoolProp's ideal-gas cp from 100 to
    1100 K, within 0.23 % for nitrogen. The constant-gamma theory takes cp
    at the chamber temperature, which `resolve_gas` records as
    `reference_temperature`.
  - The CFD runs janaf thermo, alone or under the virial gas.
  - SONICLINE's total temperatures, wall-heat balance, T0 field and Cd
    reference all use h(T). The Cd reference is the gas's own isentrope,
    through `IdealGasCpT` or the virial twin.
  - The supported chamber temperature rises to 1100 K for a heated gas.
- **`resolve_gas`** (core) settles both automatic choices. The pipeline
  applies it before validation and records requested and used choices in
  the manifest; validation and the desktop app's prediction use it too.
- **V19** (V18 on rhoCentralFoam) and **V20** (heated nitrogen at 800 K)
  join the default list. V20 also runs in CI's OpenFOAM tier.

Findings:

63. **Cold gas needs no cp(T); heated gas does.** Nitrogen's ideal-gas cp
    (CoolProp) is 1038.9 J/(kg K) at 100 K, 1039.7 at 300 K and 1041.2 at
    350 K. Above that it climbs: 1074.8 at 600 K, 1122.1 at 800 K, 1167.3 at
    1000 K. Choked mass flux at 20 bar against the reference equation of
    state:

    | chamber | virial + cp(T) | cp(T), ideal gas | constant cold cp |
    |---|---|---|---|
    | 300 K | +0.016 % | −0.68 % | −0.70 % |
    | 600 K | −0.005 % | +0.07 % | +0.39 % |
    | 800 K | +0.020 % | +0.14 % | +0.94 % |
    | 1000 K | −0.004 % | +0.12 % | +1.4 % |

    - Hot, cp(T) matters more than the real gas.
    - Cold, the real gas matters and cp(T) does not.
    - The virial fit (70–500 K) extrapolates well: density within 2×10⁻⁴
      of the reference up to 1000 K and 50 bar.
64. **The real gas on rhoCentralFoam is as accurate as on rhoPimpleFoam.**
    V19's virial/perfect mass-flow ratio on rhoCentralFoam is 1.01029. The
    virial isentrope gives 1.01044 (−0.015 %) and the reference equation
    1.0105 (−0.021 %). V18 on rhoPimpleFoam, now also in internal-energy
    form, gives −0.014 % and −0.020 %.
    - rhoCentralFoam's wave speed is √(γ/ψ), exact for a perfect gas only.
      It sets the Kurganov–Tadmor scheme's dissipation, not what it
      conserves, and the results show no cost.
    - With psiThermo, p = ρ/ψ(p, T) lags one iteration, which a converged
      steady state removes.
65. **A shock barely notices the real gas.** V3a (20 bar, normal shock held
    in the cone by 10 bar) with the virial gas:
    - shock on the axis −2.46 % of the diverging length against quasi-1D,
      against −2.54 % for the perfect gas; at the wall −7.10 % against
      −7.11 %;
    - Cd 0.99317 against 0.99326, measured against each gas's own isentrope;
    - every check passes, and the run is trusted.

Not done in M9:

- Virial and cp(T) coefficients exist for nitrogen (virial and cp(T)) and
  air (cp(T)); other gases need their own fits.
- The quasi-1D prediction in the desktop app keeps constant gamma at the
  chamber temperature. For a heated gas it is a guide; the CFD and its
  checks use cp(T).
- Heated runs are verified against theory (V20) and against air
  experiments at 833 K (E1). There is no heated-nitrogen experiment.
