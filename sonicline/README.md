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

**Status: milestones M1 to M14 of [DESIGN.md](DESIGN.md) are complete.** The
whole pipeline runs from the command line or the desktop application: a
STEP or STL fluid volume (revolved or not, or the gas passage extracted
from a solid body) or a parametric nozzle in, verified numbers, field views
and a report out. It drives either a chamber pressure or a mass flow, with
adiabatic or prescribed-temperature walls, steady or as a startup transient.
Every number comes with an uncertainty budget.
Sections 10–23 of the design record what building each milestone taught.

![Mach number in and behind a 20 bar nitrogen thruster at sea level](doc/sea-level-20bar-mach.png)

## What it does

```
pip install -e "./sonicline[geometry,post]"

sonicline import nozzle.step --p0 "20 bar"     # analyse a STEP or STL volume, write a definition
sonicline check  nozzle.json                   # quasi-1D prediction + pre-flight checks
sonicline run    nozzle.json --processors 4    # mesh, solve, post-process, judge
sonicline run    nozzle.json --resume          # continue a killed run from its last write
sonicline extract body.step                    # a solid body's gas passage, as a STEP volume
sonicline study  nozzle.json --processors 4    # three meshes: grid-convergence index
sonicline sweep  nozzle.json --set "boundaries.inlet.p0=5 bar,10 bar,20 bar" \
                 --set "geometry.expansion_ratio=2,4,8" --predict   # design grid, quasi-1D in seconds
sonicline report runs/nozzle                   # PDF, PNG and JSON report of a run
sonicline verify                               # verification cases vs analytical theory
```

### The desktop application

```
pip install -e "./sonicline[geometry,post,ui]"
sonicline ui MyThruster.sonicline        # opens (or creates) a project
```

A project folder holds its geometry (content-addressed), its simulation
definitions and every run made from them. The window has four stages:

- **Geometry:** a parametric conical nozzle, or an imported STEP fluid
  volume. The analysis suggests which end is the inlet; confirm it, or click
  an end in the 3D view.
- **Physics:** chamber, surroundings, exit domain, viscous model, gas,
  solver, and steady state or a startup (end time, valve opening, frames).
  The quasi-1D prediction updates as you type.
- **Mesh:** form, quality, wall resolution, and a preview of the mesh.
- **Run:** processors, run and cancel, live plots of mass flow, thrust and
  residuals, the log, and the verdict with its reasons.

The checks panel re-runs every pre-flight check on each edit. Each stage's
tab carries a badge when a check there warns or blocks. A run is a separate
process, the same `sonicline run` as the command line, so a solver crash
never takes the window down. Past runs are listed under their simulation
with their verdict and thrust.

![The Run stage after a V1 run](doc/ui-run.png)

The **Results** stage shows a finished run's fields:

- any field, with the range shown and the data's own min and max;
- the meridian plane (mirrored, so axisymmetric and planar runs show the
  whole nozzle), each boundary patch on or off, and a cutting plane;
- velocity vectors and streamlines;
- a probe: click the view to read the cell there, as the solver computed
  it (never interpolated);
- centreline and wall plots against quasi-1D theory;
- the engineering summary and the verdict;
- report export.

The view frames the nozzle and three exit diameters of plume; the whole
domain is one click away. Anything else is in ParaView (File, Open run in
ParaView).

![The Results stage on the 20 bar reference case](doc/ui-results.png)

`sonicline report <run-dir>` writes the same report without the window:
report.json, contour and axial PNGs, and a PDF that opens with the verdict.

### What a run produces

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

A **transient** run (`"time": {"transient": {"end_time": ..., "ramp_time":
..., "frames": ...}}`) starts the thruster from rest: the domain at ambient
pressure (or 1/1000 of p0, in vacuum), the valve opening linearly over
`ramp_time`. It runs rhoCentralFoam, explicit in time, and adds:

- `timeseries.json`: thrust, mass flow in and out, and the gas in the
  domain, at every time step;
- rise time (10 % and 90 % of final thrust), peak and overshoot, and the
  thrust drift over the last tenth of the run (settled below 1 %);
- **conservation in time**: the gas the domain gained must equal the time
  integral of inflow minus outflow, to 10⁻³, or the run is not trustworthy;
- `frames/Mach.gif`, a Mach-number animation on one colour scale
  (made by `run`, or by `sonicline report` for a run that has none).

A transient that has not settled by its end time gets a warning, and the
steady-state checks (Cd, convergence) are not applied to it. An instant
opening against a large pressure jump is flagged before the run: V1 opened
instantly into vacuum diverged within ten steps.

Every run reports an **uncertainty budget** (`metrics.json` →
`uncertainty`): mass flow, thrust and Isp, each as ± an expanded (about
95 %) uncertainty, with the components listed:

- **discretisation**: estimated from the verification record for the mesh
  form and preset, or measured by `sonicline study` on the case;
- **iterative**: the run's own mass balance and thrust cross-check;
- **gas model**: the equation of state and cp against the reference;
- **wall treatment**: by y⁺ and the share of thrust that is wall drag;
- **inputs**: from an optional `"tolerances"` block (`p0_relative`, `T0`,
  `throat_diameter`, `mass_flow_relative`) carried through this nozzle's
  quasi-1D sensitivities.

What evidence cannot bound is listed instead of given a number: the missing
boundary layer of an inviscid run, a shock or separation inside the nozzle,
and a transient's history. For the 20 bar reference thruster, with ±1 % on
chamber pressure, ±3 K and ±0.01 mm on the throat, it reads 14.37 ± 0.22
g/s, 8.37 ± 0.13 N, Isp 59.35 ± 0.32 s. The inputs dominate: the
calculation itself is good to about 0.1 %.

Every run ends **trusted**, **trusted with warnings**, or **not trustworthy**,
with the reasons. A run that did not converge, whose mesh failed its gates,
or whose inviscid Cd exceeds the theoretical bound is never presented as a
result.

### Design sweeps

`sonicline sweep` runs one definition over a grid of values. Each axis is a
dotted path into the definition with its values, written as the definition
writes them. Start with `--predict` (quasi-1D theory, in seconds) to see the
trends and the regime of each point. Then run the CFD on the points that
matter:

```
sonicline sweep thruster.json --set "boundaries.inlet.p0=15 bar,20 bar" --processors 4
```

| p0 | mass flow [g/s] | thrust [N] | Isp [s] | verdict |
|---|---|---|---|---|
| 15 bar | 10.756 ± 0.066 (1D 10.75) | 6.037 ± 0.026 (1D 6.236) | 57.24 ± 0.43 (1D 58.81) | trusted with warnings |
| 20 bar | 14.401 ± 0.11 (1D 14.33) | 8.358 ± 0.036 (1D 8.621) | 59.18 ± 0.52 (1D 60.98) | trusted with warnings |

That is the reference thruster below at the coarse preset; the warnings
are about the far plume's images. The ± is each run's uncertainty budget.

The quasi-1D column has no cone-divergence or wall-friction loss, so it
reads 3 % high in thrust. The CFD's mass flow is above it because real
nitrogen chokes at a higher flux.

The sweep writes `sweep.md`, `sweep.csv`, `sweep.json` and, with
matplotlib, `sweep.png`: thrust and Isp against the first axis with error
bars. A point that is not trustworthy stays in the table, marked, and is
left out of the plot. An invalid point is listed, not run.

## The reference case: 20 bar at sea level

Nitrogen at 20 bar and 300 K through a conical nozzle:

- 2 mm throat and exit-to-throat area ratio of 2.88, which expands to
  ambient at 20 bar
- 45° converge and 15° diverge
- exhausting into 1 atm through a plume region 20 exit diameters long
- k-ω SST, wall-resolved (y⁺ max 0.42), a 21 000-cell wedge
- converged in about 1500 iterations, about 3 minutes on 4 cores

| | CFD | ideal quasi-1D |
|---|---|---|
| mass flow | 14.275 g/s | 14.416 g/s |
| discharge coefficient | 0.990 | — |
| thrust | 8.363 N (momentum 8.323, pressure +0.040) | 8.621 N |
| Isp | 59.7 s | 61.0 s |
| exit Mach (mass-averaged) | 2.541 | 2.594 |
| adiabatic-wall recovery factor (diverging section) | 0.877 (0.82–0.90) | 0.83–0.88 (Pr^½–Pr^⅓) |
| total temperature, exit vs inlet | −0.06 % | 0 |
| thrust, exit plane vs wall force + feed | agree to 0.02 % | |

Thrust is 97.0 % of ideal. The throat's discharge coefficient accounts for
1.0 %; the rest comes from the 15° cone's divergence (1.7 % for ideal
source flow) and wall friction (0.08 N on the wall, 0.9 % of thrust). These
overlap, because friction also reduces the exit momentum, and the CFD does
not separate them. Real nitrogen
at 20 bar chokes at +0.71 % mass flux against the perfect gas the CFD uses,
so the real-gas estimate is 14.376 g/s. The same nozzle imported from STEP
gave the same answer to 0.01 % (M1).

![The plume's shock cells (their positions are qualitative: see Solvers below)](doc/sea-level-20bar-plume.png)
![Axial pressure, Mach and temperature against quasi-1D theory, with the adiabatic wall temperature](doc/sea-level-20bar-axial.png)

The wall temperature's last cell drops to 207 K where the boundary layer
turns and expands around the sharp exit lip.

## Verification

`sonicline verify` runs these cases on standard meshes (about two hours on
4 cores, most of it V14's 3D unstructured run and V15's 230,000 time
steps; both always use the coarse preset). CI runs V1 and V4a end to
end through OpenFOAM on every change, plus all three unstructured meshers on
the side-port nozzle; the whole suite runs nightly. Every reference is
computed without the CFD.

| case | what | check | error | tolerance |
|---|---|---|---|---|
| V1 | inviscid conical nozzle into vacuum, wedge | Cd vs Kliegel–Levine | −0.022 % | 0.2 % |
| | | thrust vs 1D × Cd × divergence factor | +0.040 % | 0.5 % |
| V1 | same, 3D O-grid | Cd vs Kliegel–Levine | −0.055 % | 0.2 % |
| | | thrust vs 1D × Cd × divergence factor | −0.085 % | 0.5 % |
| V1 | same, rhoCentralFoam | Cd vs Kliegel–Levine | −0.077 % | 0.2 % |
| | | thrust vs 1D × Cd × divergence factor | +0.106 % | 0.5 % |
| V2 | inviscid NPARC nozzle, normal shock in the diverging section (pe/p0 = 0.75) | shock position vs quasi-1D, axis / wall | +0.23 % / −0.11 % of the diverging length | 2 % |
| | | Cd vs Kliegel–Levine | +0.003 % | 0.2 % |
| V3 | inviscid 20 bar reference nozzle, shock held inside by pb = 10 / 14 bar | shock position vs quasi-1D, axis and wall | within −7.1 % … +6.3 % of the diverging length | 10 % (the shock is curved; see below) |
| V4a | inviscid converging nozzle, choked, into a sea-level plume | Cd vs Kliegel–Levine | +0.054 % | 0.2 % |
| V4b | same, subsonic, with a straight throat section | mass flow vs isentropic | −0.16 % | 0.5 % |
| V5 | inviscid throat Cd, Rc/Rt = 0.625, 1, 2, 4 (three-mesh studies) | extrapolated Cd vs Kliegel–Levine | within 4×10⁻⁵ | 5×10⁻⁴ |
| V6 | 3D O-grid vs wedge on V1 | mass flow / thrust | −0.03 % / −0.12 % | 0.2 % / 0.3 % |
| V7 | rhoCentralFoam vs rhoPimpleFoam on V1 | mass flow / thrust | −0.055 % / +0.066 % | 0.1 % / 0.2 % |
| V9 | ISO 9300 toroidal venturi, Re_d 5×10⁴ and 2.6×10⁵, laminar and SST | Cd vs ISO 9300 | −0.07 % … +0.10 % | 0.3 % (the standard's uncertainty) |
| V10 | V1 nozzle at 30 bar, Peng–Robinson vs perfect gas | mass-flow ratio vs the Peng–Robinson isentrope (+1.314 %) | −0.009 % | 0.02 % |
| V18 | V1 nozzle at 30 bar, virial gas vs perfect gas | mass-flow ratio vs the virial isentrope (+1.044 %) / vs the reference equation of state (+1.050 %) | −0.014 % / −0.020 % | 0.02 % / 0.05 % |
| V19 | the same on rhoCentralFoam | the same | −0.015 % / −0.021 % | 0.02 % / 0.05 % |
| V20 | V1 nozzle with heated nitrogen, 20 bar and 800 K, virial gas with cp(T) | Cd vs Kliegel–Levine (own isentrope) / total temperature exit vs inlet | −0.024 % / 9×10⁻⁷ | 0.2 % / 2×10⁻³ |
| V12 | V1 driven by V1's own mass flow (mass-flow inlet) | chamber pressure found vs 10 bar | −0.06 % | 0.2 % |
| V13 | V1 laminar with a 450 K wall | total-temperature rise vs wall heat / (ṁ cp) | 4×10⁻⁵ of T0 (the gas gains 0.96 %) | 2×10⁻³ |
| V14 | V1 on the unstructured mesher (snappyHexMesh, coarse: 10 cells across the throat radius, 174 k cells) vs the structured wedge | mass flow / thrust | −0.06 % / −0.22 % | 0.5 % / 0.5 % |
| V11 | **experiment:** NASA TP-1704 planar nozzle B1, NPR 8.91 (attached) and 2.46 (separated), SST with wall functions | wall p/pt at 10 orifices within the test's spanwise spread ± 0.02 | 9 of 10 at both (the miss: 0.6 mm past the sharp throat); separation between the same orifices as the test | 9 of 10 |
| V15 | V1 started from vacuum, time-accurate (rhoCentralFoam, coarse wedge, valve opened over 0.1 ms, 1 ms run) | gas gained vs integrated net inflow | 7×10⁻⁷ | 10⁻³ |
| | | thrust drift over the last tenth (settled) | 0.03 % | 1 % |
| | | end state vs the steady rhoCentralFoam solve on the same mesh: mass flow / thrust | −0.008 % / +0.002 % | 0.1 % / 0.2 % |
| V16 | V4a started from rest into its sea-level plume (5 bar, coarse wedge, valve opened over 0.1 ms, 1 ms run) | gas gained vs integrated net inflow, through open boundaries | 3×10⁻⁷ | 10⁻³ |
| | | end state vs the steady rhoCentralFoam solve on the same mesh: mass flow / thrust | −0.001 % / +0.003 % | 0.1 % / 0.2 % |
| V17 | V1 on cfMesh (coarse, throat refined, 551 k cells) vs the structured wedge; run by name, not nightly | mass flow / thrust | −0.025 % / −0.05 % | 0.5 % / 0.5 % |
| E1 | **experiment:** JPL 45°–15° conical nozzle (Back, Massier and Gier, JPL TR 32-654), heated air (cp(T)) at 17.2 bar and 833 K, SST | wall p/pt at 18 taps | 13 of 13 away from the throat within 5 %; 4 of 5 near the throat within 10 % | all / one miss |
| E2 | **experiment:** the same nozzle, air at 294 K (Cuffel, Back and Massier 1969) | Cd vs measured 0.985 | −0.74 % (0.9776) | 1 % |
| E3 | **experiment:** unheated nitrogen, 20° and 25° cones, area ratio 50, throat Re ≈ 1800, laminar (Whalen, NASA TM-100130) | thrust coefficient F/(p_c A*) vs measured 1.51 / 1.50 | −0.31 % / +0.55 % | 5 % (the report's) |
| E3c, E3d | **experiment:** the same nozzles at Re ≈ 458 (wall Kn 0.05–0.06), without and with wall slip | thrust coefficient vs measured 1.40 / 1.34 | no slip −3.25 % / +1.62 %; slip −4.97 % / −0.10 % | 5 % |
| V21 | planar microchannel, 20 µm, outlet Kn 0.017: Maxwell slip vs Arkilic, Schmidt and Breuer (1997) with the streamwise momentum flux | mass flow: no slip / slip / the slip effect alone | −0.29 % / −0.12 % / +0.17 % | 0.5 % / 0.5 % / 0.3 % |
| V22 | E3a with and without slip on both solvers (rhoCentralFoam with SONICLINE's slip build) | the slip effect on Cd, rhoCentralFoam vs rhoPimpleFoam (+0.372 %) | +0.016 % (the effect on C_T, −0.34 % against −0.16 %, is reported, not checked: see below the table) | 0.05 % |
| all | | mass conservation, inlet vs exit | ≤ 2×10⁻⁵ | 10⁻⁴ (3×10⁻⁴ for V4b) |
| all | | thrust, exit plane vs wall + feed | ≤ 0.04 % | 0.5 % |

The full table is in [doc/verification-standard.md](doc/verification-standard.md).

**What E1 shows, and what it does not.** Measured wall pressures in a real
nozzle, digitised from the report's Figure 4 (DESIGN.md §15 has the
method). The gas is air with its real, temperature-dependent cp. Upstream
of the throat and down the supersonic cone to z = 4.6 in the CFD is within
2.1 % of the test, except at z = 2.25 in, 0.3 in ahead of the throat, where
it reads 6.1 % low (inside the throat region's 10 %). Two places it is
not:

- **Just past the throat** (z = 2.60 in, 0.05 in downstream) the test
  reads p/pt 0.218 and the CFD 0.296. The test's taps show a local
  over-expansion and recompression where the 0.625 in throat radius meets
  the 15° cone that the CFD does not resolve. That is the tap the throat
  region is allowed to miss.
- **The last two taps** (z = 5.3 and 6.0 in) read 6 % high. The
  pressures there are small (p/pt 0.024–0.037), so 6 % is 0.0015, inside
  the digitising's reading error of 0.005, and the check passes.

With a constant γ of 1.35 (the report's own value for the heated air) the
CFD read increasingly high down the cone, reaching +13 % at the exit: real
air's γ climbs back towards 1.4 as it expands and cools, which lowers the
pressure at a given area ratio. Air with cp(T) halved that excess and
brought the middle of the cone from +4.5 % to within 2 %, which is why E1
uses it (DESIGN.md §16).

**What E3 shows, and what it does not.** This is the thruster SONICLINE is
for (cold nitrogen into vacuum) against a thrust stand, at a low Reynolds
number (1800) where the boundary layer is a large part of the nozzle and
wall drag is a quarter of the thrust. The CFD's thrust coefficient is within
0.6 % of the test on every mesh, against a stated measurement error of 5 %.

- **Mass flow is not checked.** The CFD passes about 6 % less gas for the
  measured chamber pressure than the test's flowmeter recorded (Cd 0.924
  against about 0.98), so it predicts 6 % more Isp than the test. The
  flowmeter was calibrated for hydrogen. The same figure shows Cd of 1.00
  where no real nozzle reaches it, and the report's own viscous code also
  passes less gas than measured. The doubt sits with the measurement, but
  nothing settles it. DESIGN.md §19 has the detail.
- The chamber gauge reads to ±16 % of these pressures, so the 0.3–0.6 %
  agreement is better than the test can confirm.
- The first version of E3 kept a 1.5 mm straight throat land that the
  drawing dimensions "before blending". At this Reynolds number the extra
  length cost 6 % in Cd and thrust coefficient. Small throats are this
  sensitive, so model a real throat as it was finished, not as drawn
  before blending.

**What V22 shows, and what it does not.** Both solvers agree on what slip
does at E3a's throat: it thins the displacement layer and raises Cd by
0.37–0.39 %. They do not agree on what it does to thrust (−0.16 % on
rhoPimpleFoam, −0.34 % on rhoCentralFoam), and that comparison is not a
fair test of slip. Without slip the solvers' thrust coefficients already
differ by 0.4 %, nearly all of it in the exit-plane pressure force, which
differs by 16 %. E3a's model ends at the exit plane, where a subsonic wall
layer leaves the domain, and the two solvers' outflow conditions treat that
layer differently. Slip changes that layer, so its effect on thrust carries
the disagreement with it. A thrust prediction for a nozzle this viscous,
cut at its exit plane, carries that 0.4 % of uncertainty. A run with the
plume modelled does not cut the layer there, but the solvers have not yet
been compared that way (DESIGN.md §23, finding 80).

**What V15 shows.** A startup from vacuum, with the valve opening over
0.1 ms, reaches 10 % of final thrust at 22 µs and 90 % at 92 µs, overshoots
by 8 %, and settles well inside 1 ms. It ends where the steady solve on the
same mesh lands, and the gas in the domain accounts for everything that
flowed in and out to 7×10⁻⁷. The chamber keeps ringing acoustically (inlet
mass flow ±0.4 % at 1 ms) after the nozzle flow has settled, so a
transient's final numbers are means over the last tenth of the run, not the
last step. On this coarse mesh Cd reads 0.28 % below Kliegel–Levine, steady
or transient; that is the mesh, as V5 measures.

**What V2 found.** rhoPimpleFoam, the pressure-based solver SONICLINE
uses for shock-free nozzles, does not hold this shock. Run steady or
time-accurate, it either pushes the shock out of the nozzle or settles 30 %
of the diverging length downstream. rhoCentralFoam puts it within 0.3 %, so
SONICLINE now picks rhoCentralFoam by itself whenever a shock is expected
inside the nozzle, and a rhoPimpleFoam run there is marked not trustworthy.

**What V5 found.** On one standard mesh a sharp throat (Rc/Rt = 0.625)
reads 0.26 % below the Kliegel–Levine Cd. On three systematically refined
meshes the error falls at order 1.3–1.6, and the extrapolated Cd matches
the correlation to 4×10⁻⁵ at every curvature tested. The single-mesh
shortfall is discretisation error: about 0.25 % for a sharp throat and
0.06 % for a gentle one. `sonicline study` measures it for any case.

**What V3 cannot do.** In a 15° cone the normal shock is curved, 5–10 % of
the diverging length further downstream on the axis than at the wall. No
simple theory predicts that shape, so V3 checks the position only to 10 %.
V2 is the precise test.

**What V11 shows.** Against measured wall pressures in a planar nozzle
(Mason, Putnam and Re, NASA TP-1704, 1980), the CFD reproduces:

- the attached expansion to within 0.02 at nine of ten orifices;
- at NPR 2.46, the separation between the same two orifices as the test,
  and the pressure plateau behind it to 0.015.

The miss is the orifice 0.6 mm past the sharp throat, 0.04–0.05 low on
every mesh, where a two-dimensional model cannot see the sidewalls. The
separated case never settles; SONICLINE says so and reports averages.

**What V4b found.** A subsonic converging nozzle that ends at its curved
throat does not deliver quasi-1D mass flow: the streamlines are still
converging as they leave, so the jet keeps contracting past the exit (a vena
contracta). Its exit plane sat 7.6 % above ambient and its mass flow 5.8 %
below theory. The CFD was right; the first version of the test case was not.
With two diameters of straight throat the flow leaves parallel and the error
is 0.16 %.

## What is exact and what is approximated

The house rule: say plainly where the model stops.

- **Continuum, no-slip walls.** SONICLINE solves the Navier–Stokes
  equations with the gas stuck to the walls. That stops holding as the
  molecules' mean free path becomes comparable with the nozzle: small
  throats, low chamber pressures, and the thin gas near the exit.
  - Every run reports the Knudsen number (mean free path over the local
    diameter) along the axis and the wall, and the pre-flight check
    estimates it.
  - Above 0.01 (slip flow), a viscous run warns. The real gas slips along
    the wall, so the CFD overstates friction and heat transfer, and thrust
    and Cd read somewhat low.
  - Above 0.1 (transition), the run is not trustworthy: continuum CFD does
    not apply there, and DSMC does.
  - The slip error is listed in the uncertainty budget, not given a
    number. E3, the low-Reynolds test, reaches 0.024 at the wall near its
    exit.
  - **Wall slip** models the slip regime: `"wall_slip": {"accommodation":
    1.0}` on the boundaries.
    - It applies Maxwell's velocity slip, and Smoluchowski's temperature
      jump on a fixed-temperature wall.
    - It is verified against an analytical microchannel solution (V21), to
      0.2 %.
    - It runs on both solvers. Stock OpenFOAM carries the slip friction
      out through the wall as work (DESIGN.md findings 73 and 76).
      SONICLINE's viscous-work term keeps it in for rhoPimpleFoam. For
      rhoCentralFoam, which a shock in the nozzle or a transient needs, the
      first slip run builds SONICLINE's own copy of the installed solver
      with that one change.
  - **What slip does to a nozzle.** It cuts wall friction, but it also
    thins the boundary layer, so the gas expands further and pushes less on
    the diverging wall. In Whalen's nozzles the second effect wins: slip
    lowers the thrust coefficient by 0.2 % at Re 1830 and 1.8 % at Re 458.
  - **Whether it should be on.** The test data (±5 %) cannot say which is
    closer, so slip is opt-in. For a small, low-pressure thruster, run both
    and treat the difference as part of the uncertainty.

- **Gas.** A calorically perfect gas (cp = 1039.7 J/(kg·K), γ = 1.3995) with
  Sutherland viscosity for N₂. The theory uses the same constants.
  - Air (γ 1.4), "hot air" (cp(T), a fit to air's ideal-gas cp within
    0.3 % from 100 to 1100 K, given to OpenFOAM as a JANAF polynomial) and
    "heated air" (constant γ 1.35) exist only to run the air experiments
    E1 and E2. They are not validated for anything else, and a run with
    them carries a warning. Nitrogen keeps its constant cp: between 30 K
    and 400 K it varies by under 0.5 %.
  - Real nitrogen chokes at a higher mass flux: +0.36 % at 10 bar, +0.71 % at
    20 bar, +1.05 % at 30 bar (reference equation of state, via CoolProp).
    Every run reports this correction.
  - The chamber temperature is not the bottle temperature: throttling from
    300 bar to 20 bar cools nitrogen to about 268 K.
- **Energy equation.** OpenFOAM's rhoPimpleFoam omits viscous work
  (checked in its v2512 source), so friction never heats the gas. SONICLINE
  adds the missing term with its own small OpenFOAM extension, compiled on
  first use (it needs `openfoam2512-dev`).
  - The adiabatic wall now recovers 0.88 of the dynamic temperature, where
    0.83–0.88 is physical and 0.25 was the uncorrected value. Viscous runs
    report wall temperature and the recovery factor.
  - Every run checks energy conservation: with adiabatic walls, total
    temperature leaving the nozzle must match what enters to 0.2 %.
- **Real gas in the CFD: the virial gas.** New simulations use
  `"equation_of_state": "auto"`, which runs nitrogen as a virial gas on
  either solver, shocked nozzles included. Other gases run as perfect gases
  with the reference correction reported beside their numbers.
  - The virial equation, v = RT/p + B(T) + D(T)·p, has B and C fitted to
    the reference equation of state from 70 to 500 K. SONICLINE compiles it
    into OpenFOAM as its own small library, like the viscous-work term.
  - Its choked mass flux matches the reference equation to 0.013 % from 10
    to 30 bar, and 0.07 % at 50 bar (a warning above 30 bar). In the CFD at
    30 bar it lands 0.020 % from the reference on rhoPimpleFoam (V18) and
    0.021 % on rhoCentralFoam (V19).
  - Through a normal shock (V3a, 20 bar into 10 bar) it moves the shock by
    0.001 of the diverging length against the perfect gas, and every check
    still passes.
  - Peng–Robinson is still available. It over-predicts the real-gas effect
    by about a quarter (+0.89 % against the reference equation's +0.71 % at
    20 bar).
  - Verification cases state their gas explicitly, mostly the perfect gas,
    since that is what the theory they are checked against assumes.
- **Heat capacity: constant for cold gas, cp(T) for heated gas.** A cold
  thruster's nitrogen has a constant ideal-gas cp, within 0.14 % up to
  350 K. Heated nitrogen does not: +3.4 % at 600 K, +7.9 % at 800 K, +12 %
  at 1000 K.
  - `"heat_capacity": "auto"`, the default, uses constant cp up to a 350 K
    chamber and cp(T) above it. `"constant"` and `"temperature_dependent"`
    force either.
  - cp(T) is a polynomial fitted to CoolProp's ideal-gas cp from 100 to
    1100 K: within 0.23 % for nitrogen and 0.3 % for air. OpenFOAM gets it as
    JANAF thermo, with or without the virial gas.
  - SONICLINE's own total temperatures, energy checks and Cd reference use
    the same h(T).
  - Choked mass flux of heated nitrogen at 20 bar against the reference
    equation of state:

    | chamber | virial + cp(T) | constant cold cp |
    |---|---|---|
    | 600 K | −0.005 % | +0.39 % |
    | 800 K | +0.020 % | +0.94 % |
    | 1000 K | −0.004 % | +1.4 % |

    V20 runs V1 at 800 K. Cd is 0.024 % from Kliegel–Levine against its
    own isentrope, and total temperature is conserved to 10⁻⁶.
  - The quasi-1D prediction in the window takes cp at the chamber
    temperature, so for a heated gas it is a guide, not a reference.
- **Solvers.** rhoPimpleFoam (pressure-based) for shock-free nozzles;
  rhoCentralFoam (density-based) wherever quasi-1D theory expects a shock or
  separation inside the nozzle, because rhoPimpleFoam puts a normal shock in
  the wrong place (30 % of the diverging length off in V2). The two agree to
  0.05 % on a shock-free nozzle (V7). The shock cells in a rhoPimpleFoam
  plume image are qualitative; thrust does not depend on them.
- **Turbulence.** k-ω SST, resolved to the wall.
  - Throat Reynolds numbers of 10⁵–10⁶ put small thrusters where boundary
    layers may be laminar or relaminarising. Run laminar, the 20 bar case
    gives +0.07 % mass flow and +0.18 % thrust; that spread is the
    turbulence-model uncertainty, and the pre-flight check says so.
  - The ISO 9300 venturi (V9) matches both models within the standard's
    0.3 %, so discharge coefficients cannot decide between them.
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
- **Convergence aids** (M14) take over when a steady run shows one of three
  slow modes. Each fires only on that signature, so a run that converges
  without it is untouched, and each is listed in the manifest and the
  run's messages.
  - A rhoPimpleFoam run stuck in a limit cycle (a slow, very viscous
    channel) has its Courant number stepped down, 0.5 → 0.2 → 0.1.
  - A rhoPimpleFoam run that is steady but does not balance mass has its
    pressure solved a hundred times tighter (to 10⁻⁴ of its residual): the
    looser solve leaves a fixed point that leaks 10⁻⁴–10⁻³ of the flow.
  - A rhoCentralFoam run driven by a mass flow has its chamber pressure
    corrected so the choked throat passes the inflow. The explicit solver
    otherwise fills a Mach-0.01 chamber at the speed of sound.
  - What none of them fixes: on a chamber that slow (Whalen's E3a),
    rhoCentralFoam's thrust settles but its mass balance stays 1–3×10⁻⁴
    off, because the chamber's own flow still develops one acoustic step at
    a time. rhoPimpleFoam converges the same nozzle in 3000 iterations and
    is the solver for such flows.
- **Quasi-1D theory** is exact for integral quantities of an ideal nozzle and
  wrong for local ones. At the throat the wall pressure departs from it by
  tens of percent; the axial plot shows both.
- **Separation** is estimated before the run (Summerfield and Schmucker),
  not predicted.
- **Condensation** is detected, not modelled. After every run each cell's
  temperature is compared with nitrogen's saturation temperature at its own
  pressure, in the nozzle and the plume. Supersaturated cells are a
  warning that says how many, by how much and where; beyond that point the
  results are bounds. It does not arise for sea-level nozzles at 15–30 bar,
  where the exit is at 115–140 K. It does arise for vacuum nozzles beyond
  an area ratio of about 15–25. Below nitrogen's triple point (12.5 kPa) the
  saturation line is extrapolated (Clausius–Clapeyron), and the warning
  says so.
- **Mass-flow inlet.** The flow is imposed and the chamber pressure floats.
  The run reports the chamber pressure the CFD needed, and Cd and the ideal
  reference are judged at that pressure. The pressure is the total pressure
  at the inlet face (area-averaged static, raised by the mass-averaged Mach
  number, a few hundredths).
- **Prescribed wall temperature.** Heat through the wall is integrated
  (κ ∂T/∂n) and must account for the gas's total-temperature change to
  0.2 %. The wall-temperature and recovery-factor checks apply to adiabatic
  walls only.
- **Unstructured meshes** are coarser for their cost than the structured
  ones: 3D, and snapped or tetrahedral at the wall.
  - V14 bounds the coarse preset at 0.2 % in mass flow and thrust for an
    inviscid nozzle.
  - The throat of a coarse snapped mesh is a 40-sided polygon, 0.4 % short
    of the circle, and that shows in Cd.
  - The throat area Cd is judged against is the geometry's, not the mesh's.
  - **cfMesh needs a finer throat than snappy.** Its mass-flow error is
    first order in the cell size around the throat. At the preset
    resolution it read 0.7 % high (1.3 % in a viscous run), so cfMesh now
    refines a cone around the throat to half the wall cell size. With it,
    V1 on cfMesh matches the structured wedge to −0.025 % in mass flow
    inviscid (V17) and +0.032 % with k-ω SST, thrust within 0.05 %
    (DESIGN.md findings 46 and 52–54). At sea level with k-ω SST, against
    the wedge, mass flow reads +0.046 % and thrust +0.018 % (finding 61).
    The refinement costs cells: about three times as many as before at the
    coarse preset (1.7 M for a sea-level run).
  - Throat and exit planes on cfMesh and gmsh meshes are jagged cuts
    through cells. Before M8 they were oriented by the wrong rule, and a
    sea-level exit plane lost 1 % of the mass flow (finding 62). Runs
    affected were refused by the verdict's mass balance; it is fixed.
  - **Wall functions at y⁺ 30 overestimate wall drag.** On V1 with k-ω SST
    against a wall-resolved run (y⁺ 1):
    - wall functions at y⁺ 30: drag +6.4 %, thrust −0.07 %;
    - at y⁺ 6: drag −2.4 %, thrust +0.02 %.

    The Spalding wall function SONICLINE uses holds from the viscous
    sublayer to the log layer, so a thinner first cell is closer, not
    worse. `sonicline import` now asks for y⁺ 6 when it picks wall
    functions. The default for definitions is wall-resolved (y⁺ 1).
  - cfMesh's layers come out thinner than asked at the throat, around y⁺ 6
    for a y⁺ 30 target. Its viscous drag on V1 is 0.4 % from the
    wall-resolved value. Keeping the throat refinement off the wall to
    restore the layers cost 0.26 % in mass flow and 0.42 % in thrust, so it
    stays (DESIGN.md findings 58 and 59).
  - For a volume that is not a body of revolution, quasi-1D theory uses the
    radius of a circle of the same section area. Its "ideal" numbers are a
    reference, not a prediction.

## Geometry

**STEP** fluid volumes are read through gmsh's OpenCASCADE kernel, in a
separate process so a malformed file cannot crash the application.
**STL** surfaces are read with trimesh and checked before anything is
measured on them: watertight, manifold, consistently wound, one body, no
duplicate or zero-area triangles (slivers are counted). OpenFOAM's
`surfaceCheck` then looks for self-intersection when the run starts, since
trimesh cannot. An STL file has no units: `--unit` (default mm) says what
they are.

The analyser, for either format:

- finds the axis: the line through two coaxial planar end faces when there
  are some (a side port or a boss skews the inertia tensor, and the end
  faces still say where the nozzle points), otherwise the distinct
  principal axis of inertia
- slices the volume to recover the wall profile and whether it is a body of
  revolution
- refines the throat by golden section on the section area
- picks the inlet end from the steeper wall

The geometry is pinned by the SHA-256 of the file, so a changed file cannot
silently change a saved simulation.

**Volumes that are not bodies of revolution** (a side port, a non-round
section) get the radius of a circle of the same section area as their
profile. That is what quasi-1D theory, the initial field and the checks use,
and it is an approximation wherever the section is far from round. They are
meshed by the **unstructured (Tier 2) mesher**:

- **snappyHexMesh** carves a Cartesian grid aligned with the nozzle axis
  (grid planes exactly at the throat and exit), refined to 10, 14 or 20
  cells across the throat radius (coarse, standard, fine).
- Wall layers are accepted only if they cover 95 % of the wall and every
  face near the throat, measured on the finished mesh. snappy's layer
  addition collapses to about one layer on these nozzles, whatever its
  settings.
- **cfMesh** (`cartesianMesh`) is therefore the first choice for viscous
  runs. Its layers put the wall-function first cell (1.6 µm at 20 bar) on
  every wall face, throat included.
- **gmsh** is the last resort: prism layers on the nozzle and tetrahedra
  filling the rest. Its layered meshes pass the gate in vacuum but not
  against a sea-level plume.
- A rejected mesh passes the run to the next mesher, with the reason
  recorded.
- checkMesh gates the result like any other mesh.
- V14 checks it against the structured wedge on V1.

Two other ways to give the wall, besides a CAD file or the parametric
conical nozzle:

- **`wall_profile`:** a table of (x, r) points, for a nozzle defined by a
  formula or a method-of-characteristics contour.
- **Planar nozzles** (`"mesh": {"form": "planar", "planar_width": ...}`): a
  rectangular two-dimensional nozzle. The profile is then the half-height
  and area ratios are ratios of heights. See
  `examples/planar-tp1704-b1-npr2.46.json`, the V11 validation nozzle.

A **solid thruster body** (a block with a bore through it) is recognised,
and its gas passage can be extracted: `sonicline extract body.step`, or the
**Extract gas passage** button on the Geometry stage, which shows the
extracted volume in the 3D view and asks before using it. The extraction
caps each opening in the body's planar faces, cuts a box around the lot, and
keeps the one piece that is neither body nor outside air and is bounded by
at least two caps. It refuses a body with no such piece, or with several
(two separate bores: export the one you mean). Openings that are not in
planar faces cannot be capped; export the gas volume from CAD for those.
The extracted STEP then goes through the same analysis as any other.

## Layout

```
DESIGN.md       the plan, decisions, evidence, and the M1 record (section 10)
src/sonicline/
  core/         units, gas, real gas, profiles, theory, definition, validation
                (no OpenFOAM, Qt or VTK: tests/test_architecture.py enforces it)
  geometry/     STEP analysis in a worker process, STL checks and analysis
                (trimesh); STEP writing and tessellation
  mesh/         structured revolved meshes (wedge and O-grid, with plume);
                unstructured meshes (snappyHexMesh, cfMesh, gmsh) of any volume
  foam/         the only package that knows OpenFOAM syntax: writers, case
                builder, parsers, and the viscous-work extension (C++)
  run/          runners (local, WSL2), convergence and its aids, mesh gates,
                the pipeline
  post/         integrals from solver fluxes, field views, reports, images
  metrics/      propulsion metrics and the trust verdict
  verification/ the verification cases
  project/      the project store and the editable draft (no Qt)
  ui/           the desktop application (PySide6, pyvista, pyqtgraph)
  cli.py
tests/          about 420 tests; the OpenFOAM, UI and rendering ones skip without them
examples/       sea-level-20bar.json (parametric), nozzle-2mm.step + .json (CAD),
                nozzle-side-port.step + .json (not revolved; make_side_port.py
                builds it), planar-tp1704-b1-npr2.46.json (planar, separated)
doc/            images and the verification table
```

## Requirements

Python 3.11+, and ESI OpenFOAM v2512 for `run` and `verify`.

- **Linux:** `apt install openfoam2512 openfoam2512-dev` from the ESI
  repository. The development package compiles SONICLINE's viscous-work
  extension on the first viscous run.
- **Windows:** the application runs natively and drives OpenFOAM inside WSL2
  (Ubuntu 24.04 with the same package).
  - The WSL2 runner is built and its command construction is tested.
  - It has not yet been exercised on a Windows machine; that is an M2 item.

The core, geometry and meshing tests run on Linux and Windows in CI; the
OpenFOAM tests run on Linux.
