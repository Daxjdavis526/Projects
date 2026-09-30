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

