# SONICLINE

A focused CFD application for nitrogen cold-gas thrusters. Give it a thruster
geometry, a chamber pressure and the ambient conditions; it meshes the
nozzle and its plume, runs OpenFOAM, and reports what the gas is doing and
what the thruster delivers: mass flow, thrust, Isp, exit state, whether the
throat is choked, and whether the numbers can be trusted.

OpenFOAM is the numerical backend and nothing more. Geometry handling,
meshing, case generation, solver control, monitoring, post-processing, the
propulsion calculations, verification and (from M3) the interface are this
project.

**Status: milestone M1 of [DESIGN.md](DESIGN.md) is complete.** The whole
pipeline runs headless from the command line, from a STEP file or a
parametric nozzle to verified numbers and images. The desktop interface is
M3 and M4. Section 10 of the design records what building M1 taught.

![Mach number in and behind a 20 bar nitrogen thruster at sea level](doc/sea-level-20bar-mach.png)

## What it does

```
pip install -e "./sonicline[geometry,post]"

sonicline import nozzle.step --p0 "20 bar"     # analyse the CAD, write a definition
sonicline check  nozzle.json                   # quasi-1D prediction + pre-flight checks
sonicline run    nozzle.json --processors 4    # mesh, solve, post-process, judge
sonicline verify                               # verification cases vs analytical theory
```

`run` produces a self-describing run directory:

- the definition, the generated OpenFOAM case, the mesh report
- the convergence history
- `metrics.json`: mass flow at inlet, throat and exit; the thrust split into
  momentum and pressure terms, cross-checked from both sides of the control
  volume; Isp; Cd against theory; throat and exit state; extremes; wall y⁺
  and shear; real-gas correction; the trust verdict
- a manifest recording exactly which software and settings produced it
- images: Mach, pressure and temperature on the nozzle and the plume, and
  axial plots against quasi-1D theory

Every run ends **trusted**, **trusted with warnings**, or **not trustworthy**,
with the reasons. A run that did not converge, whose mesh failed its gates,
or whose inviscid Cd exceeds the theoretical bound is never presented as a
result.

## The reference case: 20 bar at sea level

Nitrogen at 20 bar and 300 K through a conical nozzle:

- 2 mm throat and exit-to-throat area ratio of 2.88, which expands to
  ambient at 20 bar
- 45° converge and 15° diverge
- exhausting into 1 atm through a plume region 20 exit diameters long
- k-ω SST, wall-resolved (y⁺ max 0.42), a 21 000-cell wedge
- converged in about 1200 iterations, about 3 minutes on 4 cores

| | CFD | ideal quasi-1D |
|---|---|---|
| mass flow | 14.276 g/s | 14.416 g/s |
| discharge coefficient | 0.990 | — |
| thrust | 8.358 N (momentum 8.318, pressure +0.041) | 8.621 N |
| Isp | 59.7 s | 61.0 s |
| exit Mach (mass-averaged) | 2.539 | 2.594 |
| thrust, exit plane vs wall force + feed | agree to 0.02 % | |

Thrust is 97.0 % of ideal. The throat's discharge coefficient accounts for
1.0 %; the rest comes from the 15° cone's divergence (1.7 % for ideal
source flow) and wall friction (0.08 N on the wall, 0.9 % of thrust). These
overlap, because friction also reduces the exit momentum, and the CFD does
not separate them. Real nitrogen
at 20 bar chokes at +0.71 % mass flux against the perfect gas the CFD uses,
so the real-gas estimate is 14.376 g/s. The same nozzle imported from STEP
gives the same answer to 0.01 %.

![The plume's shock cells](doc/sea-level-20bar-plume.png)
![Axial pressure and Mach against quasi-1D theory](doc/sea-level-20bar-axial.png)

## Verification

`sonicline verify` runs these cases on standard meshes; CI runs V1 and V4a
end to end through OpenFOAM on every change. Every reference is
computed without the CFD.

| case | what | check | error | tolerance |
|---|---|---|---|---|
| V1 | inviscid conical nozzle into vacuum, wedge | Cd vs Kliegel–Levine | −0.022 % | 0.2 % |
| | | thrust vs 1D × Cd × divergence factor | +0.040 % | 0.5 % |
| V1 | same, 3D O-grid | Cd vs Kliegel–Levine | −0.055 % | 0.2 % |
| | | thrust vs 1D × Cd × divergence factor | −0.085 % | 0.5 % |
| V4a | inviscid converging nozzle, choked, into a sea-level plume | Cd vs Kliegel–Levine | +0.054 % | 0.2 % |
| V4b | same, subsonic, with a straight throat section | mass flow vs isentropic | −0.16 % | 0.5 % |
| V6 | 3D O-grid vs wedge on V1 | mass flow / thrust | −0.03 % / −0.12 % | 0.2 % / 0.3 % |
| all | | mass conservation, inlet vs exit | ≤ 4.5×10⁻⁶ | 10⁻⁴ (3×10⁻⁴ for V4b) |
| all | | thrust, exit plane vs wall + feed | ≤ 0.04 % | 0.5 % |

The full table is in [doc/verification-standard.md](doc/verification-standard.md).

**What V4b found.** A subsonic converging nozzle that ends at its curved
throat does not deliver quasi-1D mass flow: the streamlines are still
converging as they leave, so the jet keeps contracting past the exit (a vena
contracta). Its exit plane sat 7.6 % above ambient and its mass flow 5.8 %
below theory. The CFD was right; the first version of the test case was not.
With two diameters of straight throat the flow leaves parallel and the error
is 0.16 %.

## What is exact and what is approximated

The house rule: say plainly where the model stops.

- **Gas.** A calorically perfect gas (cp = 1039.7 J/(kg·K), γ = 1.3995) with
  Sutherland viscosity for N₂. The theory uses the same constants.
  - Real nitrogen chokes at a higher mass flux: +0.36 % at 10 bar, +0.71 % at
    20 bar, +1.05 % at 30 bar (reference equation of state, via CoolProp).
    Every run reports this correction.
  - The chamber temperature is not the bottle temperature: throttling from
    300 bar to 20 bar cools nitrogen to about 268 K.
- **Energy equation.** OpenFOAM's rhoPimpleFoam omits viscous work (checked
  in its v2512 source). Friction never heats the gas, so **wall temperatures
  are not physical** and are not reported. Bracketing the missing term moves
  mass flow by 0.08 % and thrust by 0.13 %, which every viscous run states.
  Adding it properly is the first job of M2.
- **Turbulence.** k-ω SST, resolved to the wall.
  - Throat Reynolds numbers of 10⁵–10⁶ put small thrusters where boundary
    layers may be laminar or relaminarising. The pre-flight check says so;
    the laminar-vs-SST comparison is M2.
  - Separated flow (a vacuum nozzle at sea level) is flagged as
    model-sensitive before the run.
- **Axisymmetry.** The default wedge assumes the flow is axisymmetric, which
  is exact for a revolved nozzle unless separation turns asymmetric.
  - The 3D O-grid is available and agrees with the wedge to 0.03 % in mass
    flow.
  - Its wall is a polygon scaled to preserve the circle's area; its vertices
    sit 0.14 % outside the surface.
- **Convergence.** Integrals decide it: inlet and exit mass flow and exit
  thrust must be steady, and mass must balance. Global residuals often stall
  near 10⁻³ in the plume's shear layer while the nozzle is converged to 10⁻⁶;
  that is reported, not hidden. The far plume develops long after the
  nozzle. It does not affect thrust, but plume images from such a run are
  labelled unconverged.
- **Quasi-1D theory** is exact for integral quantities of an ideal nozzle and
  wrong for local ones. At the throat the wall pressure departs from it by
  tens of percent; the axial plot shows both.
- **Separation** is estimated before the run (Summerfield and Schmucker),
  not predicted.
- **Condensation** is detected, not modelled. It does not arise for
  sea-level nozzles at 15–30 bar, where the exit is at 115–140 K. It does
  arise for vacuum nozzles beyond an area ratio of about 15–25.

## Geometry

STEP fluid volumes are read through gmsh's OpenCASCADE kernel, in a separate
process so a malformed file cannot crash the application. The analyser:

- checks for exactly one closed solid of positive volume
- finds the axis from the inertia tensor
- slices the solid to recover the wall profile and confirm it is a body of
  revolution
- refines the throat
- picks the inlet end from the steeper wall

The geometry is pinned by the SHA-256 of the file, so a changed file cannot
silently change a saved simulation.

A **solid thruster body** (a block with a bore through it) is recognised and
rejected with advice: export the internal gas volume. Automatic extraction
is planned as a previewed, user-confirmed step. **Non-revolved** geometry
needs the general 3D mesher (M5).

## Layout

```
DESIGN.md       the plan, decisions, evidence, and the M1 record (section 10)
src/sonicline/
  core/         units, gas, real gas, profiles, theory, definition, validation
                (no OpenFOAM, Qt or VTK: tests/test_architecture.py enforces it)
  geometry/     STEP analysis in a worker process; STEP writing
  mesh/         structured revolved meshes (wedge and O-grid, with plume)
  foam/         the only package that knows OpenFOAM syntax: writers, case
                builder, parsers
  run/          runners (local, WSL2), convergence, mesh gates, the pipeline
  post/         integrals from solver fluxes, fields, images
  metrics/      propulsion metrics and the trust verdict
  verification/ the verification cases
  cli.py
tests/          about 190 tests; the OpenFOAM ones skip without it
examples/       sea-level-20bar.json (parametric), nozzle-2mm.step + .json (CAD)
doc/            images and the verification table
```

## Requirements

Python 3.11+, and ESI OpenFOAM v2512 for `run` and `verify`.

- **Linux:** `apt install openfoam2512` from the ESI repository.
- **Windows:** the application runs natively and drives OpenFOAM inside WSL2
  (Ubuntu 24.04 with the same package).
  - The WSL2 runner is built and its command construction is tested.
  - It has not yet been exercised on a Windows machine; that is an M2 item.

The core, geometry and meshing tests run on Linux and Windows in CI; the
OpenFOAM tests run on Linux.
