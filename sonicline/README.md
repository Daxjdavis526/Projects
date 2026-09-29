# SONICLINE

A focused CFD application for nitrogen cold-gas thrusters. Give it a thruster
geometry, a chamber pressure and the ambient conditions; it builds, meshes
and runs an OpenFOAM case, and reports what the gas is doing and what the
thruster delivers: mass flow, thrust, Isp, exit state, whether the throat is
choked, and whether the numbers can be trusted.

OpenFOAM is the numerical backend and nothing more. Geometry handling,
meshing, case generation, solver control, monitoring, post-processing, the
propulsion calculations, verification and the interface are this project.

**Status: milestone M0 of the plan in [DESIGN.md](DESIGN.md).** The
solver-independent core exists and is tested: units, nitrogen properties,
the analytical nozzle theory, the simulation definition, and the pre-flight
checks. The OpenFOAM pipeline (M1) and the desktop interface (M3, M4) are
not built yet. Nothing here runs a CFD case yet.

## What works now

```
pip install -e ./sonicline[dev]
sonicline check sonicline/examples/sea-level-20bar.json
```

`check` reads a simulation definition, prints the ideal quasi-1D prediction
and runs every pre-flight check:

```
quasi-1D prediction (ideal, before CFD)
  throat diameter     2.000 mm, expansion ratio 2.880
  regime              matched
  mass flow           14.4163 g/s   (x Cd 0.9940 for Rc/Rt = 1.50: 14.3305 g/s)
  exit Mach           2.5935
  thrust              8.6206 N (momentum 8.6215, pressure -0.0009)
  specific impulse    60.98 s

checks
  WARN  gas.real_gas_bias: At 20 bar and 300 K real nitrogen chokes at +0.71 % mass flux ...
  info  gas.regulator_cooling: ... Regulating from a 300 bar, 300 K bottle to 20 bar cools nitrogen to about 268 K ...
  info  regime.matched: Near-ideal expansion ...
  info  turbulence.laminar_bracket: Throat Reynolds number is 5.9e+05 ...
```

Definitions are JSON. Any dimensional value can be given with its unit
(`"20 bar"`, `{"value": 300, "unit": "K"}`, `"1 mm"`) and is converted to SI
exactly once. Gauge pressures (`psig`) are refused rather than guessed at.

## Layout

```
DESIGN.md            the plan: decisions, evidence, architecture, V&V, milestones
src/sonicline/
  core/              no OpenFOAM, no Qt, no VTK (enforced by tests/test_architecture.py)
    units.py         unit conversion at the input boundary
    gas.py           the perfect-gas nitrogen model the CFD uses
    realgas.py       how far real nitrogen departs from it (reference EOS via CoolProp)
    profile.py       axisymmetric wall profiles r(x): exact lines and arcs
    theory/          isentropic flow, normal shocks, nozzle regimes and performance,
                     throat discharge coefficient, quasi-1D solution along a profile
    model/           the simulation definition and its canonical JSON
    validate/        pre-flight checks
  cli.py
tests/               140 tests
examples/
```

## What is exact and what is approximated

The house rule: say plainly where the model stops.

- **The gas model is a calorically perfect gas** (cp = 1039.7 J/(kg·K),
  γ = 1.3995) with Sutherland viscosity for N₂. This is what the CFD will be
  given, and the theory uses the same constants, so verification measures
  numerical error rather than a mismatch in gas data.
- **Real nitrogen chokes at a higher mass flux than the perfect-gas model**:
  +0.36 % at 10 bar, +0.71 % at 20 bar, +1.05 % at 30 bar, +3.3 % at 100 bar
  (computed on the Span et al. reference equation of state). The perfect-gas
  result is reported together with this correction, and it is flagged above
  0.5 %.
- **The chamber temperature is not the bottle temperature.** Throttling from
  300 bar to 20 bar cools nitrogen to about 268 K. T0 is an input you should
  set deliberately.
- **Quasi-1D theory is exact for integral quantities of an ideal nozzle and
  wrong for local ones.** The mass flow through a real throat is below the
  1D value by the Kliegel–Levine discharge coefficient (0.994 at
  Rc/Rt = 1.5), and wall pressures near the throat differ from 1D by tens of
  percent. Verification compares integrals against 1D theory and
  distributions against 2D references (DESIGN.md §5).
- **Separation is estimated, not predicted.** Overexpanded nozzles, which
  means any vacuum-style nozzle at sea level, are checked against the
  Summerfield and Schmucker criteria. Both are empirical fits, and RANS is
  not reliable at locating separation either. Results in this regime will be
  labelled model-sensitive.
- **Condensation is detected, not modelled.** Below the triple point
  (63.15 K) the saturation line is extrapolated with Clausius–Clapeyron and
  an approximate sublimation enthalpy, and is labelled approximate. It does
  not arise for sea-level nozzles at 15–30 bar (exit around 115–140 K). It
  does arise for vacuum nozzles beyond an area ratio of about 15–25.

## Verification so far

The core theory is checked against:
- NACA Report 1135 isentropic and normal-shock tables
- the NASA NPARC "CDV" nozzle (critical pressure ratios, shock at
  x = 7.562 in for pe/p0 = 0.75, supersonic exit Mach 1.854)
- the published Kliegel–Levine and Hall discharge-coefficient values
- NIST nitrogen compressibility at 300 K from 1 to 300 bar
- the propulsion course's independent implementation
  (`propulsion/tools/rocket.py`)
- an independently computed reference nozzle: 7.2090 g/s, Mₑ = 3.4114,
  5.0521 N in vacuum and 3.0626 N at sea level

The OpenFOAM verification cases begin in M1.

## Development

Python 3.11 or newer on Windows or Linux. `pip install -e ./sonicline[dev]`
then `python -m pytest sonicline/tests`. CI runs the suite on Linux and
Windows on every change (`.github/workflows/sonicline.yml`).

OpenFOAM (ESI v2512) is only needed from M1 onwards. On Windows it will run
under WSL2 (Ubuntu 24.04, `apt install openfoam2512`); see DESIGN.md §3.8.
