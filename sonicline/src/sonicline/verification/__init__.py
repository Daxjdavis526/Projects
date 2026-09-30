"""Verification cases: CFD against independent analytical references.

Each case is a simulation definition plus checks. A check compares one
number from the run with a reference computed *without* the CFD (quasi-1D
theory, the Kliegel-Levine throat correlation, the conical divergence
factor) and passes within a stated tolerance. The suite is how a change to
the code proves it has not degraded the physics (DESIGN.md section 5).

What each reference can and cannot judge is stated with the case. In
particular a conical nozzle's exit plane is not one-dimensional, so its
exit Mach number is reported but never checked against quasi-1D theory;
thrust, corrected for divergence, is.
"""

from __future__ import annotations

import dataclasses
import json
import math
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Callable

from ..core import model as m
from ..core.gas import NITROGEN
from ..core.theory import discharge, isentropic as isen, nozzle
from ..core.units import ATM


@dataclass
class Check:
    name: str
    value: float | None
    reference: float
    tolerance: float
    relative: bool = True
    passed: bool = False
    note: str = ""

    def evaluate(self) -> "Check":
        if self.value is None or not math.isfinite(self.value):
            self.passed = False
            return self
        err = self.error
        self.passed = abs(err) <= self.tolerance
        return self

    @property
    def error(self) -> float:
        if self.value is None:
            return math.nan
        if self.relative:
            return self.value / self.reference - 1.0
        return self.value - self.reference


@dataclass
class CaseResult:
    case: str
    title: str
    status: str
    trust: str
    checks: list[Check] = field(default_factory=list)
    seconds: float = 0.0
    run_dir: str = ""

    @property
    def passed(self) -> bool:
        # A run the verdict does not trust fails whatever its numbers say.
        return (self.status == "completed" and self.trust != "not_trustworthy"
                and all(c.passed for c in self.checks))


@dataclass(frozen=True)
class Case:
    name: str
    title: str
    definition: Callable[[str, str], m.SimulationDefinition]  # (quality, form) -> definition
    checks: Callable[[dict, m.SimulationDefinition], list[Check]]
    form: str = "wedge"


# ----------------------------------------------------------------------------- V1


# Verification runs converge further than a design run needs (half its drift
# tolerance, a fiftieth of its mass imbalance), so the checks measure
# discretisation error rather than an unfinished iteration. Tighter than
# 5e-5 drift sits inside the reservoir inlet's iteration-to-iteration jitter
# on coarse meshes and can never be met.
TIGHT = m.Numerics(convergence=m.ConvergenceCriteria(integral_tolerance=5e-5, mass_imbalance=2e-5))


def _v1_definition(quality: str, form: str = "wedge") -> m.SimulationDefinition:
    return m.SimulationDefinition(
        name="V1 inviscid conical nozzle into vacuum",
        geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=6.25),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=10e5, T0=300.0),
                                ambient=m.Ambient(pressure=0.0),
                                exit_domain=m.TruncatedAtExit()),
        flow=m.Flow(turbulence=m.Inviscid()),
        mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality)),
        numerics=TIGHT,
    )


def _common_checks(metrics: dict) -> list[Check]:
    return [
        Check("mass conservation, inlet vs exit", metrics["mass_flow"]["imbalance_inlet_exit"],
              0.0, 1e-4, relative=False),
        # The exit-plane momentum flux is integrated with linearly interpolated
        # U, the solver's own convective flux is upwinded: they differ by
        # O(dx) where gradients are steep (a sonic exit plane most of all).
        Check("thrust: exit plane vs wall + feed", metrics["thrust"]["control_volume_disagreement"],
              0.0, 5e-3, relative=False),
    ]


def _v1_checks_at(p0: float, thrust: bool = True) -> Callable[[dict, m.SimulationDefinition], list[Check]]:
    def checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
        g = defn.geometry
        gas = NITROGEN
        kl = discharge.kliegel_levine(gas.gamma, g.throat_rc_upstream)
        lam = discharge.conical_divergence_factor(g.diverging_half_angle)
        At = math.pi * g.throat_radius**2
        Ae = At * g.expansion_ratio
        ideal = nozzle.analyse(gas, p0, 300.0, 0.0, At, Ae)
        f_ref = kl * lam * ideal.momentum_thrust + ideal.exit_pressure * Ae
        out = [Check("discharge coefficient vs Kliegel-Levine", metrics["discharge_coefficient"]["cfd"],
                     kl, 2e-3, relative=False, note=f"Rc/Rt = {g.throat_rc_upstream}")]
        if thrust and not defn.gas.peng_robinson:
            out.append(Check("vacuum thrust vs 1D x Cd(K-L) x divergence factor", metrics["thrust"]["total"],
                             f_ref, 5e-3, note=f"lambda = {lam:.5f} for a "
                                              f"{math.degrees(g.diverging_half_angle):g} deg cone"))
        return out + _common_checks(metrics)
    return checks


_v1_checks = _v1_checks_at(10e5)


# ----------------------------------------------------------------------------- V2


# Some cases never become strictly steady. An inviscid subsonic jet (V4b):
# its undamped shear layer feeds back to the exit plane, where the mass
# flow oscillates by ~2e-4. A captured normal shock (V2, V3) settles into a
# limit cycle of ~1e-4 as it moves between cells.
DESIGN_LEVEL = m.Numerics(convergence=m.ConvergenceCriteria(integral_tolerance=1e-4,
                                                            mass_imbalance=3e-4))
# A captured shock needs only the drift allowance; its mass balance is as
# tight as any other case's.
SHOCK_LEVEL = m.Numerics(convergence=m.ConvergenceCriteria(integral_tolerance=1e-4,
                                                           mass_imbalance=2e-5))




def nparc_area(x: float) -> float:
    """The NPARC Alliance transonic diffuser test nozzle ("CDV"), in inches
    and square inches: inlet area 2.5 at x = 0, throat 1.0 at x = 5, exit 1.5
    at x = 10, every station meeting its neighbours with zero slope."""
    if x <= 5.0:
        return 1.75 - 0.75 * math.cos((0.2 * x - 1.0) * math.pi)
    return 1.25 - 0.25 * math.cos((0.2 * x - 1.0) * math.pi)


def nparc_profile_points(n: int = 200) -> tuple[tuple[float, float], ...]:
    """The NPARC nozzle revolved: r = sqrt(A / pi), in inches."""
    return tuple((10.0 * i / n, math.sqrt(nparc_area(10.0 * i / n) / math.pi)) for i in range(n + 1))


# NPARC's exit-to-stagnation pressure ratio for the case with a normal shock
# in the diverging section; quasi-1D theory puts the shock at x = 7.562 in.
V2_PRESSURE_RATIO = 0.75


def _v2_definition(quality: str, form: str = "wedge") -> m.SimulationDefinition:
    p0 = 2e5
    return m.SimulationDefinition(
        name="V2 NPARC nozzle, normal shock in the diverging section",
        geometry=m.WallProfile(points=nparc_profile_points(), length_unit="in"),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=p0, T0=300.0),
                                ambient=m.Ambient(pressure=V2_PRESSURE_RATIO * p0, temperature=300.0),
                                exit_domain=m.TruncatedAtExit(fixed_pressure=True)),
        flow=m.Flow(turbulence=m.Inviscid()),
        mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality)),
        numerics=SHOCK_LEVEL,
    )


def _shock_checks(tolerance: float) -> Callable[[dict, m.SimulationDefinition], list[Check]]:
    def checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
        shock = metrics.get("shock") or {}
        L = shock.get("diverging_length") or math.nan
        x_ref = shock.get("x_quasi_1d", math.nan)

        def offset(key):
            x = shock.get(key)
            return None if x is None else (x - x_ref) / L

        kl = discharge.kliegel_levine(NITROGEN.gamma, defn.geometry.profile().rc_over_rt)
        return [
            Check("shock position on the axis vs quasi-1D (fraction of diverging length)",
                  offset("x_centreline"), 0.0, tolerance, relative=False,
                  note=f"quasi-1D shock Mach {metrics['regime']['shock_mach']:.3f}"),
            Check("shock position at the wall vs quasi-1D (fraction of diverging length)",
                  offset("x_wall"), 0.0, tolerance, relative=False),
            Check("choked discharge coefficient vs Kliegel-Levine", metrics["discharge_coefficient"]["cfd"],
                  kl, 2e-3, relative=False),
        ] + _common_checks(metrics)
    return checks


_v2_checks = _shock_checks(2e-2)


# ----------------------------------------------------------------------------- V3


def _v3_definition(pb: float) -> Callable[[str, str], m.SimulationDefinition]:
    """The 20 bar reference thruster nozzle, inviscid, with a normal shock
    held inside it by a fixed exit pressure."""
    def build(quality: str, form: str = "wedge") -> m.SimulationDefinition:
        return m.SimulationDefinition(
            name=f"V3 reference nozzle, shock at pb = {pb / 1e5:g} bar",
            geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
            boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5, T0=300.0),
                                    ambient=m.Ambient(pressure=pb, temperature=300.0),
                                    exit_domain=m.TruncatedAtExit(fixed_pressure=True)),
            flow=m.Flow(turbulence=m.Inviscid()),
            mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality)),
            numerics=SHOCK_LEVEL,
        )
    return build


# A conical nozzle is not one-dimensional: its normal shock is curved,
# standing further downstream on the axis than at the wall by 4.6 % (pb =
# 10 bar) to 10 % (14 bar) of the diverging length. Quasi-1D theory places
# a plane shock and source flow a spherical one (7.5 % axis-to-wall); the
# subsonic flow behind the shock shapes it and neither is exact. V3 guards
# the solver on a real thruster geometry within 10 %; V2's near-1D nozzle is
# the tight test of shock position.
V3_TOLERANCE = 1e-1


# ----------------------------------------------------------------------------- V5


# Throat curvature from sharp (0.625, one of Back, Massier and Cuffel's 1965
# test nozzles) to gentle, with the same radius either side of the throat
# as Kliegel-Levine assume. On one mesh the sharpest throat reads 0.26 %
# low; that is discretisation error, falling at order ~1.3, so each ratio
# runs as a three-level grid study and the check is on the extrapolated,
# mesh-independent Cd (DESIGN.md section 11).
V5_RATIOS = (0.625, 1.0, 2.0, 4.0)
V5_TOLERANCE = 5e-4


def _v5_definition(rc: float, quality: str) -> m.SimulationDefinition:
    d = _v1_definition(quality)
    return dataclasses.replace(
        d, name=f"V5 inviscid throat, Rc/Rt = {rc:g}",
        geometry=dataclasses.replace(d.geometry, throat_rc_upstream=rc, throat_rc_downstream=rc))


def throat_cd_study(rc: float, quality: str, out: Path, processors: int = 1,
                    on_event=None) -> CaseResult:
    from ..run import study

    defn = _v5_definition(rc, quality)
    if processors > 1:
        defn = dataclasses.replace(defn, numerics=dataclasses.replace(defn.numerics, processors=processors))
    t0 = time.time()
    run_dir = out / f"V5-rc{rc:g}-{quality}"
    s = study.run(defn, run_dir, on_event=on_event)
    kl = discharge.kliegel_levine(NITROGEN.gamma, rc)
    r = CaseResult(f"V5 (Rc/Rt {rc:g})", f"Inviscid throat Cd, Rc/Rt = {rc:g}, grid study",
                   "completed" if s.valid else "failed",
                   "trusted" if all(t == "trusted" for t in s.trust) else "not_trustworthy",
                   seconds=round(time.time() - t0, 1), run_dir=str(run_dir))
    if s.valid:
        g = s.quantity("discharge coefficient").result
        note = (f"{g.convergence}, p = {g.order:.2f}, GCI {100 * g.gci_fine:.3f} %, "
                f"finest mesh {g.values[0]:.6f}" if g.order is not None else g.convergence)
        r.checks = [Check(f"extrapolated Cd vs Kliegel-Levine, Rc/Rt = {rc:g}", g.extrapolated, kl,
                          V5_TOLERANCE, relative=False, note=note).evaluate()]
    return r


# ----------------------------------------------------------------------------- V4


def _v4_definition(p0: float, name: str, throat_length: float,
                   numerics: m.Numerics = TIGHT) -> Callable[[str, str], m.SimulationDefinition]:
    def build(quality: str, form: str = "wedge") -> m.SimulationDefinition:
        return m.SimulationDefinition(
            name=name,
            geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=1.0,
                                     throat_length=throat_length),
            boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=p0, T0=300.0),
                                    ambient=m.Ambient(pressure=ATM, temperature=300.0),
                                    exit_domain=m.Plume(length=8.0, radius=4.0)),
            flow=m.Flow(turbulence=m.Inviscid()),
            mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality)),
            numerics=numerics,
        )
    return build


def _v4a_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    kl = discharge.kliegel_levine(NITROGEN.gamma, defn.geometry.throat_rc_upstream)
    return [
        Check("choked discharge coefficient vs Kliegel-Levine", metrics["discharge_coefficient"]["cfd"],
              kl, 2e-3, relative=False),
    ] + _common_checks(metrics)


def _v4b_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    g = NITROGEN
    At = math.pi * defn.geometry.throat_radius**2
    p0 = defn.boundaries.inlet.p0
    M = isen.mach_from_pressure_ratio(g.gamma, p0 / ATM)
    mdot = isen.mass_flux(g.gamma, g.R, p0, 300.0, M) * At
    common = _common_checks(metrics)
    common[0].tolerance = 3e-4  # time-averaged over the jet's oscillation
    return [
        Check("subsonic mass flow vs isentropic (pe = pa)", metrics["mass_flow"]["inlet"], mdot, 5e-3,
              note=f"exit Mach {M:.3f}; parallel exit flow"),
    ] + common


# ----------------------------------------------------------------------------- V9


def iso9300_toroidal_cd(re_d: float) -> float:
    """ISO 9300:2022 discharge coefficient of a toroidal-throat critical-flow
    venturi, Cd = 0.9959 - 2.720 Re_d^-0.5 for 2.1e4 <= Re_d <= 3.2e7, with
    Re_d = 4 qm / (pi d mu0) at stagnation viscosity. Its stated
    uncertainty is 0.3 %. The Re^-0.5 is a laminar boundary layer's
    displacement thickness: the correlation describes laminar throats."""
    if not 2.1e4 <= re_d <= 3.2e7:
        raise ValueError(f"Re_d = {re_d:.3g} is outside ISO 9300's range 2.1e4 to 3.2e7")
    return 0.9959 - 2.720 * re_d**-0.5


ISO9300_UNCERTAINTY = 3e-3


def _v9_definition(p0: float, turbulence) -> Callable[[str, str], m.SimulationDefinition]:
    """An ISO 9300 toroidal-throat venturi: throat curvature radius 2d on
    both sides (Rc/Rt = 4), a 4 deg conical diffuser longer than d, run
    choked into vacuum (Cd is independent of the back pressure once choked).
    The inlet is a 45 deg cone tangent to the toroid where ISO continues the
    toroid; the flow at the throat does not see the difference."""
    def build(quality: str, form: str = "wedge") -> m.SimulationDefinition:
        return m.SimulationDefinition(
            name=f"V9 ISO 9300 venturi, {p0 / 1e5:g} bar, {turbulence.TAG}",
            geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=1.3,
                                     diverging_half_angle=math.radians(4.0),
                                     throat_rc_upstream=4.0, throat_rc_downstream=4.0),
            boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=p0, T0=300.0),
                                    ambient=m.Ambient(pressure=0.0),
                                    exit_domain=m.TruncatedAtExit()),
            flow=m.Flow(turbulence=turbulence),
            mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality)),
        )
    return build


def throat_reynolds(metrics: dict, defn: m.SimulationDefinition) -> float:
    d_t = 2.0 * defn.geometry.throat_radius
    mu0 = defn.gas.model().viscosity(defn.boundaries.inlet.T0)
    return 4.0 * metrics["mass_flow"]["inlet"] / (math.pi * d_t * mu0)


def _v9_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    re_d = throat_reynolds(metrics, defn)
    return [Check("Cd vs ISO 9300 toroidal venturi", metrics["discharge_coefficient"]["cfd"],
                  iso9300_toroidal_cd(re_d), ISO9300_UNCERTAINTY,
                  note=f"Re_d = {re_d:.3g}, {defn.flow.turbulence.TAG}")] + _common_checks(metrics)


# ----------------------------------------------------------------------------- V10


V10_P0 = 30e5  # the top of the cold-gas band, where the real-gas effect is largest


def _v10_definition(eos: str) -> Callable[[str, str], m.SimulationDefinition]:
    def build(quality: str, form: str = "wedge") -> m.SimulationDefinition:
        d = _v1_definition(quality, form)
        return dataclasses.replace(
            d, name=f"V10 V1 nozzle at 30 bar, {eos}", gas=m.GasSpec(equation_of_state=eos),
            boundaries=dataclasses.replace(d.boundaries, inlet=m.ReservoirInlet(p0=V10_P0, T0=300.0)))
    return build


def peng_robinson_check(perfect: tuple[CaseResult, dict | None],
                        real: tuple[CaseResult, dict | None]) -> CaseResult:
    """V10: the Peng-Robinson CFD against the Peng-Robinson isentrope. The
    mass-flow ratio of the two runs on the same mesh cancels most of the
    discretisation error, leaving the equation of state."""
    from ..core import pengrobinson

    (ra, ma), (rb, mb) = perfect, real
    r = CaseResult("V10", "Peng-Robinson CFD vs the Peng-Robinson isentrope, 30 bar",
                   "completed" if ra.status == rb.status == "completed" else "failed",
                   "trusted" if ra.trust == rb.trust == "trusted" else "not_trustworthy")
    if ma and mb:
        pr = pengrobinson.choked_mass_flux(pengrobinson.PengRobinson(NITROGEN), V10_P0, 300.0)
        r.checks = [Check("mass flow, Peng-Robinson / perfect gas", mb["mass_flow"]["inlet"] / ma["mass_flow"]["inlet"],
                          1.0 + pr.bias, 2e-4, note=f"isentrope: {100 * pr.bias:+.3f} %").evaluate()]
    return r


# ----------------------------------------------------------------------------- V11
# Validation against experiment: Mason, Putnam and Re, "The effect of throat
# contouring on two-dimensional converging-diverging nozzles at static
# conditions", NASA TP-1704 (1980), nozzle B1 (Fig. 2(b); all lengths cm).
# Air at Tt ~ 300 K into still air; the CFD runs nitrogen (gamma 1.3995
# against 1.3997), and compares p / pt,j, which the gas barely changes.

MASON_B1 = {"h_t": 1.37e-2, "h_e": 2.46e-2, "h_i": 3.52e-2, "r_c": 0.68e-2, "width": 10.157e-2,
            "theta": 20.84, "epsilon": 10.85}
# Orifice stations x / l_e (x from the throat, l_e the throat-to-exit length).
# One orifice may miss: 0.6 mm past the sharp throat the CFD reads 0.04-0.05
# below the test on standard and fine meshes alike, which is not
# discretisation (DESIGN.md section 11).
V11_TOLERANCE = 0.02
V11_ATTACHED_NPR = 2.94  # TP-1704 B1 is attached at every orifice from here up
MASON_STATIONS = (-0.209, -0.099, 0.011, 0.077, 0.143, 0.286, 0.429, 0.560, 0.736, 0.890)
# Table III(a): upper-flap static pressure p / pt,j on the centreline
# (y / (w_t/2) = 0) and at y / (w_t/2) = 0.450, points 2 and 15.
MASON_B1_UPPER = {
    2.46: ((.842, .746, .293, .259, .288, .276, .234, .371, .375, .380),
           (.848, .756, .298, .247, .286, .274, .234, .290, .355, .373)),
    8.91: ((.842, .743, .295, .256, .288, .273, .234, .187, .141, .112),
           (.849, .747, .301, .242, .287, .272, .233, .188, .142, .112)),
}


def _v11_definition(npr: float) -> Callable[[str, str], m.SimulationDefinition]:
    """TP-1704 nozzle B1 as a planar nozzle, k-omega SST with wall functions
    (throat Re ~3e6 at NPR 8.91: a y+ = 1 first cell is 0.2 micron and makes
    cells in the lip shear layer 55 000:1)."""
    g = MASON_B1

    def build(quality: str, form: str = "planar") -> m.SimulationDefinition:
        return m.SimulationDefinition(
            name=f"V11 TP-1704 nozzle B1, NPR {npr:g}",
            geometry=m.ConicalNozzle(
                throat_radius=g["h_t"], expansion_ratio=g["h_e"] / g["h_t"],
                contraction_ratio=g["h_i"] / g["h_t"],
                converging_half_angle=math.radians(g["theta"]),
                diverging_half_angle=math.radians(g["epsilon"]),
                throat_rc_upstream=g["r_c"] / g["h_t"], throat_rc_downstream=g["r_c"] / g["h_t"]),
            boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=npr * ATM, T0=300.0),
                                    ambient=m.Ambient(pressure=ATM, temperature=300.0),
                                    exit_domain=m.Plume(length=10.0, radius=4.0)),
            flow=m.Flow(turbulence=m.KOmegaSST()),
            mesh=m.MeshSpec(form=m.MeshForm.PLANAR, quality=m.MeshQuality(quality),
                            planar_width=g["width"], first_cell_yplus=30.0),
            # Separated (NPR 2.46), the exit flow keeps a 1.7e-3 scatter
            # while its mean is steady to 1e-4 (DESIGN.md section 11).
            numerics=m.Numerics(convergence=m.ConvergenceCriteria(
                noise_tolerance=5e-3 if npr < V11_ATTACHED_NPR else 1e-3)),
        )
    return build


def wall_pressure_at(metrics_dir: Path, stations: tuple[float, ...]) -> list[float] | None:
    """CFD wall p / p0 at stations x / l_e, from the run's profiles.json."""
    f = metrics_dir / "profiles.json"
    m_f = metrics_dir / "metrics.json"
    if not f.is_file() or not m_f.is_file():
        return None
    import numpy as np

    wall = json.loads(f.read_text(encoding="utf-8"))["wall"]
    metrics = json.loads(m_f.read_text(encoding="utf-8"))
    defn = m.load(metrics_dir / "definition.json")
    prof = defn.geometry.profile(defn.mesh.planar_width or None)
    le = prof.x_exit - prof.throat_x
    x = np.asarray(wall["x"])
    p = np.asarray(wall["p"]) / metrics["conditions"]["p0"]
    return [float(np.interp(prof.throat_x + s * le, x, p)) for s in stations]


def _v11_checks_for(npr: float) -> Callable[[dict, m.SimulationDefinition], list[Check]]:
    exp_c, exp_q = MASON_B1_UPPER[npr]

    def checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
        cfd = metrics.get("_wall_pressure")
        if cfd is None:
            return [Check("wall pressure available", None, 0.0, 0.0)]
        # The test's own spanwise spread (centreline to y/(w/2) = 0.45) is
        # part of the comparison: at the separation line it reaches 0.08.
        lo = [min(a, b) - V11_TOLERANCE for a, b in zip(exp_c, exp_q)]
        hi = [max(a, b) + V11_TOLERANCE for a, b in zip(exp_c, exp_q)]
        inside = [lo_ <= c <= hi_ for c, lo_, hi_ in zip(cfd, lo, hi)]
        rms = math.sqrt(sum((c - e) ** 2 for c, e in zip(cfd, exp_c)) / len(cfd))
        missed = ", ".join(f"x/l_e {x:g} ({c:.3f} vs {e:.3f})"
                           for x, c, e, ok in zip(MASON_STATIONS, cfd, exp_c, inside) if not ok)
        out = [Check(f"orifices within the test's spanwise spread +- {V11_TOLERANCE:g} (of 10)",
                     float(sum(inside)), 10.0, 1.0, relative=False,
                     note=f"RMS vs centreline {rms:.3f}; outside: {missed or 'none'}")]
        if npr == 2.46:
            # Separated between x/l_e 0.429 (attached, .234) and 0.560 (.371).
            out.append(Check("separation between the same orifices as the test (p/pt at 0.429 and "
                             "0.560 either side of 0.30)", float((cfd[6] < 0.30) and (cfd[7] > 0.30)),
                             1.0, 0.0, relative=False,
                             note=f"CFD {cfd[6]:.3f} / {cfd[7]:.3f}, test {exp_c[6]:.3f} / {exp_c[7]:.3f}"))
        return out
    return checks


def run_validation_case(npr: float, quality: str, out: Path, processors: int = 1,
                        on_event=None) -> CaseResult:
    name = f"V11 (NPR {npr:g})"
    case = Case(name, f"TP-1704 nozzle B1 wall pressure, NPR {npr:g}", _v11_definition(npr),
                _v11_checks_for(npr), form="planar")
    defn = case.definition(quality, "planar")
    if processors > 1:
        defn = dataclasses.replace(defn, numerics=dataclasses.replace(defn.numerics, processors=processors))
    from ..run import pipeline

    t0 = time.time()
    run_dir = out / f"V11-npr{npr:g}-{quality}"
    result = pipeline.run(defn, run_dir, on_event=on_event, render=False)
    checks = []
    if result.metrics:
        metrics = dict(result.metrics, _wall_pressure=wall_pressure_at(run_dir, MASON_STATIONS))
        checks = [c.evaluate() for c in case.checks(metrics, defn)]
    return CaseResult(name, case.title, result.status, result.trust, checks,
                      round(time.time() - t0, 1), str(run_dir))


# ----------------------------------------------------------------------------- V12, V13


def v12_mass_flow() -> float:
    """What V1's nozzle passes at 10 bar: ideal choked flow times
    Kliegel-Levine's Cd for its throat."""
    g = _v1_definition("coarse").geometry
    At = math.pi * g.throat_radius**2
    return (discharge.kliegel_levine(NITROGEN.gamma, g.throat_rc_upstream)
            * isen.choked_mass_flow(NITROGEN.gamma, NITROGEN.R, 10e5, 300.0, At))


def _v12_definition(quality: str, form: str = "wedge") -> m.SimulationDefinition:
    d = _v1_definition(quality, form)
    return dataclasses.replace(
        d, name="V12 V1 driven by mass flow",
        boundaries=dataclasses.replace(d.boundaries, inlet=m.MassFlowInlet(mass_flow=v12_mass_flow(),
                                                                           T0=300.0)))


def _v12_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    """V1 inverted: give the nozzle V1's mass flow and it must find V1's
    chamber pressure. The tolerance is V1's Cd tolerance carried over, as
    p0 scales with 1/Cd."""
    return [
        Check("chamber pressure found by the CFD vs V1's 10 bar", metrics["conditions"]["p0"], 10e5, 2e-3),
        Check("inlet mass flow vs imposed", metrics["mass_flow"]["inlet_minus_imposed"], 0.0, 1e-4,
              relative=False),
    ] + _v1_checks_at(10e5)(metrics, defn)


V13_WALL_T = 450.0


def _v13_definition(quality: str, form: str = "wedge") -> m.SimulationDefinition:
    d = _v1_definition(quality, form)
    return dataclasses.replace(
        d, name="V13 V1 laminar with a heated wall",
        boundaries=dataclasses.replace(d.boundaries, wall_thermal=m.FixedTemperature(temperature=V13_WALL_T)),
        flow=m.Flow(turbulence=m.Laminar()))


def _v13_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    """The first law with heat: the rise in flux-weighted total temperature
    from inlet to exit is the wall heat flux divided by mdot cp. Nothing
    external predicts the heat itself, so the check is that the solver's
    energy equation and its own wall flux agree."""
    heat = metrics.get("wall_heat", {})
    return [
        Check("wall heat flux into the gas (a hot wall heats the gas)",
              1.0 if (heat.get("heat_into_gas") or 0.0) > 0.0 else 0.0, 1.0, 0.0, relative=False),
        Check("energy balance: total temperature rise vs wall heat / (mdot cp)",
              heat.get("balance_error"), 0.0, 2e-3, relative=False),
    ] + _common_checks(metrics)


# ----------------------------------------------------------------------------- E1, E2

INCH = 0.0254
# Back, Massier and Gier, JPL Technical Report 32-654 (1964), Fig. 4: the
# 45-15-deg conical nozzle. Throat radius 0.800 in, throat radius of
# curvature 0.500 in (0.625 Rt) on both sides, inlet arc 0.800 in after
# 0.310 in of 2.5 in chamber; contraction 9.76, expansion 6.63. Throat at
# z = 2.554 in.
BMG45 = {"r_t": 0.800, "z_t": 2.554, "cr": 9.76, "er": 6.63, "rc": 0.625, "fillet": 1.0,
         "chamber": 0.310 / 0.800}
# Wall p / pt digitised from the scanned Fig. 4 (hot flow, 1500 R, cooled
# walls; the attached tests, 150-250 psia): marker positions located as the
# centroids of their hollow symbols after calibrating the axes on the grid
# lines. (z in, p/pt, half the spread between the overlapping tests at that
# tap.) Reading error about 0.005 in p/pt and 0.02 in z. Beyond z = 5 only
# the 199.6 and 250.2 psia tests are attached; those are the points taken.
BMG45_WALL = (
    (0.80, 0.998, 0.003), (1.01, 0.998, 0.002), (1.18, 0.994, 0.004), (1.38, 0.993, 0.002),
    (1.74, 0.988, 0.002), (1.92, 0.974, 0.004), (2.08, 0.950, 0.012), (2.25, 0.854, 0.017),
    (2.45, 0.510, 0.026), (2.60, 0.218, 0.010), (2.64, 0.242, 0.005), (2.79, 0.197, 0.012),
    (3.11, 0.181, 0.004), (3.63, 0.126, 0.008), (3.96, 0.095, 0.004), (4.62, 0.059, 0.007),
    (5.29, 0.035, 0.005), (6.00, 0.023, 0.005),
)
# DESIGN.md section 5: 10 % in the throat region (tap size alone moves
# readings by up to 7 % there: TR 32-654 section V), 5 % elsewhere; never
# tighter than the tests' own spread plus the reading error.
E1_THROAT_BAND = 0.35  # in either side of the throat: tangency (2.200) to tangency, and the recompression
E1_TOL_THROAT, E1_TOL_ELSEWHERE, E1_READING = 0.10, 0.05, 0.005
E1_Z_READING = 0.02  # in: a tap's axial position as read off the figure
E1_THROAT_MISSES = 1  # taps in the throat region allowed outside (tap size alone moves them 7 %)
# Cuffel, Back and Massier (AIAA J. 7(7), 1969): the same nozzle geometry,
# cold air, measured discharge coefficient.
E2_CD, E2_TOL = 0.985, 0.01


def _bmg45(name: str, gas: str, T0: float, p0: float, wall: object) -> Callable[[str, str], m.SimulationDefinition]:
    g = BMG45

    def build(quality: str, form: str = "wedge") -> m.SimulationDefinition:
        return m.SimulationDefinition(
            name=name,
            geometry=m.ConicalNozzle(
                throat_radius=g["r_t"] * INCH, expansion_ratio=g["er"], contraction_ratio=g["cr"],
                converging_half_angle=math.radians(45.0), diverging_half_angle=math.radians(15.0),
                throat_rc_upstream=g["rc"], throat_rc_downstream=g["rc"], fillet_radius=g["fillet"],
                chamber_length=g["chamber"]),
            gas=m.GasSpec(species=gas),
            # Into vacuum: the tests exhausted to 1 atm, but at 250 psia the
            # flow is attached to beyond the last tap, and attached supersonic
            # flow cannot feel the back pressure; nor can a choked throat's
            # Cd. (At 1 atm the separation estimate sends the run to the
            # explicit solver, twenty times slower.)
            boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=p0, T0=T0),
                                    ambient=m.Ambient(pressure=0.0, temperature=294.0),
                                    exit_domain=m.TruncatedAtExit(), wall_thermal=wall),
            flow=m.Flow(turbulence=m.KOmegaSST()),
            # Throat Re ~ 4e6: a resolved wall is a 0.1 micron first cell.
            mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality), first_cell_yplus=30.0),
            numerics=TIGHT,
        )
    return build


def wall_pressure_x(run_dir: Path, xs: list[float]) -> list[float] | None:
    """CFD wall p / p0 at axial positions x (profile coordinates)."""
    import numpy as np

    f, m_f = Path(run_dir) / "profiles.json", Path(run_dir) / "metrics.json"
    if not f.is_file() or not m_f.is_file():
        return None
    wall = json.loads(f.read_text(encoding="utf-8"))["wall"]
    p0 = json.loads(m_f.read_text(encoding="utf-8"))["conditions"]["p0"]
    return [float(np.interp(x, wall["x"], np.asarray(wall["p"]) / p0)) for x in xs]


def _e1_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    """Each tap within its tolerance: a relative band (10 % in the throat
    region, 5 % elsewhere), never tighter than the tests' own spread plus
    the reading error; the CFD is taken over the tap's position +- its
    reading error, which matters where the pressure falls steeply."""
    prof = defn.geometry.profile()
    run_dir = Path(metrics.get("_run_dir", "."))
    offsets = (-E1_Z_READING, 0.0, E1_Z_READING)
    tallies = {"throat": [0, 0, []], "elsewhere": [0, 0, []]}
    for z, p, spread in BMG45_WALL:
        xs = [prof.throat_x + (z + dz - BMG45["z_t"]) * INCH for dz in offsets]
        cfd = wall_pressure_x(run_dir, xs)
        if cfd is None:
            return [Check("wall pressure available", None, 0.0, 0.0)]
        region = "throat" if abs(z - BMG45["z_t"]) <= E1_THROAT_BAND else "elsewhere"
        rel = E1_TOL_THROAT if region == "throat" else E1_TOL_ELSEWHERE
        allowed = max(rel * p, spread + E1_READING)
        ok = min(cfd) - allowed <= p <= max(cfd) + allowed
        t = tallies[region]
        t[0] += ok
        t[1] += 1
        if not ok:
            t[2].append(f"z {z:g} in (CFD {cfd[1]:.3f}, test {p:.3f})")
    th, el = tallies["throat"], tallies["elsewhere"]
    return [
        Check(f"wall taps away from the throat within 5 % (of {el[1]})", float(el[0]), float(el[1]), 0.0,
              relative=False, note="outside: " + (", ".join(el[2]) or "none")),
        Check(f"throat-region taps within 10 % (of {th[1]}, one may miss)", float(th[0]), float(th[1]),
              float(E1_THROAT_MISSES), relative=False, note="outside: " + (", ".join(th[2]) or "none")),
    ] + _common_checks(metrics)


def _e2_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    return [Check("discharge coefficient vs Cuffel, Back and Massier (measured)",
                  metrics["discharge_coefficient"]["cfd"], E2_CD, E2_TOL, relative=False)] + _common_checks(metrics)


# ----------------------------------------------------------------------------- V15

V15_END_TIME = 1e-3  # s: the startup's acoustic ringing decays below 1e-4 of the flow by then
V15_RAMP = 1e-4  # s: the valve opening, a tenth of the run


def _v15_definition(quality: str, form: str = "wedge") -> m.SimulationDefinition:
    # Always the coarse wedge, like V14: explicit time steps on the standard
    # mesh take eight times as long (twice the steps, four times the cells).
    d = _v1_definition("coarse", form)
    return dataclasses.replace(d, name="V15 V1 started from vacuum (transient)",
                               flow=m.Flow(turbulence=m.Inviscid(),
                                           time=m.Transient(end_time=V15_END_TIME, initial="ambient", ramp_time=V15_RAMP, frames=20)))


def _v15_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    """The startup must conserve mass in time and settle; that it settles
    on the steady solution is the comparison in run_suite."""
    tr = metrics.get("transient") or {}
    return [
        Check("mass conservation in time: domain gain vs integrated net inflow",
              tr.get("conservation_error"), 0.0, 1e-3, relative=False),
        Check("settled by the end time (thrust drift over the last tenth)",
              tr.get("thrust_drift_last_tenth"), 0.0, 0.01, relative=False),
    ] + _common_checks(metrics)


CASES: dict[str, Case] = {
    "V1": Case("V1", "Inviscid conical CD nozzle into vacuum (throat Cd, vacuum thrust)",
               _v1_definition, _v1_checks),
    "V2": Case("V2", "Inviscid NPARC nozzle with a normal shock in the diverging section",
               _v2_definition, _v2_checks),
    "V3a": Case("V3a", "Inviscid reference nozzle, normal shock late in the cone (pb = 10 bar)",
                _v3_definition(10e5), _shock_checks(V3_TOLERANCE)),
    "V3b": Case("V3b", "Inviscid reference nozzle, normal shock early in the cone (pb = 14 bar)",
                _v3_definition(14e5), _shock_checks(V3_TOLERANCE)),
    "V9a": Case("V9a", "ISO 9300 toroidal venturi, 2 bar (Re_d ~ 5e4), laminar",
                _v9_definition(2e5, m.Laminar()), _v9_checks),
    "V9b": Case("V9b", "ISO 9300 toroidal venturi, 10 bar (Re_d ~ 3e5), laminar",
                _v9_definition(10e5, m.Laminar()), _v9_checks),
    "V9c": Case("V9c", "ISO 9300 toroidal venturi, 2 bar, k-omega SST",
                _v9_definition(2e5, m.KOmegaSST()), _v9_checks),
    "V9d": Case("V9d", "ISO 9300 toroidal venturi, 10 bar, k-omega SST",
                _v9_definition(10e5, m.KOmegaSST()), _v9_checks),
    "V10-perfect": Case("V10-perfect", "V1 nozzle at 30 bar, perfect gas", _v10_definition("perfect_gas"),
                        _v1_checks_at(V10_P0)),
    "V10-pr": Case("V10-pr", "V1 nozzle at 30 bar, Peng-Robinson", _v10_definition("peng_robinson"),
                   _v1_checks_at(V10_P0)),
    "V4a": Case("V4a", "Inviscid converging nozzle, choked, sea-level plume",
                _v4_definition(5e5, "V4a choked converging nozzle", 0.0), _v4a_checks),
    # A converging nozzle ending at a curved throat keeps contracting past its
    # exit (vena contracta), so its exit plane sits above ambient and its
    # subsonic mass flow is ~6 % below quasi-1D theory -- real physics, found
    # by this case. A straight throat section of two diameters delivers
    # parallel flow, where quasi-1D theory with pe = pa applies.
    "V4b": Case("V4b", "Inviscid converging nozzle with straight throat, subsonic, sea-level plume",
                _v4_definition(1.5e5, "V4b subsonic converging nozzle", 4.0, DESIGN_LEVEL), _v4b_checks),
    # Air experiments: SONICLINE's gas models include air for these alone.
    # 250.2 psia (test 351), 1500 R, walls cooled to Tw/Tt 0.40-0.59: the
    # report's own gamma (1.35) for the methanol-heated air.
    "E1": Case("E1", "JPL 45-15 conical nozzle (Back, Massier & Gier): wall pressure, heated air",
               _bmg45("E1 JPL 45-15 nozzle, 250 psia, 1500 R", "air_heated", 833.3, 250.2 * 6894.757,
                      m.FixedTemperature(temperature=0.5 * 833.3)), _e1_checks),
    "E2": Case("E2", "JPL 45-15 conical nozzle (Cuffel, Back & Massier): discharge coefficient, cold air",
               _bmg45("E2 JPL 45-15 nozzle, cold air", "air", 294.0, 250.2 * 6894.757, m.Adiabatic()),
               _e2_checks),
    "V15": Case("V15", "V1 started from vacuum, time-accurate, coarse wedge: conservation in time and the steady end state",
                _v15_definition, _v15_checks),
    "V12": Case("V12", "V1 driven by its own mass flow: the CFD must find 10 bar", _v12_definition, _v12_checks),
    "V13": Case("V13", "V1 laminar with a 450 K wall: energy balance with heat transfer",
                _v13_definition, _v13_checks),
}


# Comparison cases run_suite builds from other runs.
COMPARISONS = ("V5", "V6", "V7", "V10", "V11", "V14", "V15")
V15_MASS_TOLERANCE = 1e-3  # V7's: the same solver, mesh and equations, reached two ways
V15_THRUST_TOLERANCE = 2e-3
V14_MASS_TOLERANCE = 5e-3
V14_THRUST_TOLERANCE = 5e-3

def run_case(case: Case, quality: str, out: Path, processors: int = 1, form: str | None = None,
             on_event=None, solver: str = "auto") -> tuple[CaseResult, dict | None]:
    import dataclasses

    from ..run import pipeline

    defn = case.definition(quality, form or case.form)
    numerics = defn.numerics
    if processors > 1:
        numerics = dataclasses.replace(numerics, processors=processors)
    if solver != "auto":
        numerics = dataclasses.replace(numerics, solver=solver)
    defn = dataclasses.replace(defn, numerics=numerics)
    t0 = time.time()
    run_dir = out / (f"{case.name}-{form or case.form}-{quality}"
                     + ("" if solver == "auto" else f"-{solver}"))
    result = pipeline.run(defn, run_dir, on_event=on_event, render=False)
    checks = ([c.evaluate() for c in case.checks(dict(result.metrics, _run_dir=str(run_dir)), defn)]
              if result.metrics else [])
    variant = [v for v in ((form if form and form != case.form else None),
                           (solver if solver != "auto" else None)) if v]
    label = case.name + (f" ({', '.join(variant)})" if variant else "")
    title = case.title + "".join(f", {v}" for v in variant)
    return CaseResult(label, title, result.status, result.trust, checks,
                      round(time.time() - t0, 1), str(run_dir)), result.metrics


def _pair(name: str, title: str, a: tuple[CaseResult, dict | None], b: tuple[CaseResult, dict | None],
          label: str, mass_tol: float, thrust_tol: float) -> CaseResult:
    """A comparison case: the second run must agree with the first."""
    (ra, ma), (rb, mb) = a, b
    r = CaseResult(name, title, "completed" if ra.status == rb.status == "completed" else "failed",
                   "trusted" if ra.trust == rb.trust == "trusted" else "not_trustworthy")
    if ma and mb:
        r.checks = [c.evaluate() for c in (
            Check(f"{label} mass flow", mb["mass_flow"]["inlet"], ma["mass_flow"]["inlet"], mass_tol),
            Check(f"{label} thrust", mb["thrust"]["total"], ma["thrust"]["total"], thrust_tol),
        )]
    return r


def run_suite(names: list[str], quality: str, out: Path, processors: int = 1,
              on_event=None) -> list[CaseResult]:
    """Runs each case once. V6 (wedge vs 3D O-grid) and V7 (rhoPimpleFoam vs
    rhoCentralFoam) are comparisons built on V1; V1 runs once whichever of
    them asks for it."""
    out.mkdir(parents=True, exist_ok=True)
    results: list[CaseResult] = []
    runs: dict[tuple[str, str, str, str], tuple[CaseResult, dict | None]] = {}

    def once(case: str, form: str = "wedge", solver: str = "auto", at: str | None = None, listed: bool = True):
        """``listed=False``: a reference run only, whose own checks are not
        reported (the comparison still requires it to complete, trusted)."""
        key = (case, form, solver, at or quality)
        if key not in runs:
            runs[key] = run_case(CASES[case], at or quality, out, processors, form, on_event, solver)
        if listed and runs[key][0] not in results:
            results.append(runs[key][0])
        return runs[key]

    for name in names:
        if name == "V6":
            # The 3D O-grid shares the wedge's axial and wall-normal
            # distribution; the two must agree with each other.
            results.append(_pair("V6", "Wedge vs 3D O-grid on the V1 nozzle", once("V1"),
                                 once("V1", "o_grid_3d"), "3D vs wedge:", 2e-3, 3e-3))
        elif name == "V7":
            # Two independent discretisations of the same equations: a
            # pressure-based PIMPLE solver and a density-based central-upwind
            # (Kurganov-Tadmor) one. Agreement bounds the error neither
            # reference-based check can see in the other.
            results.append(_pair("V7", "rhoPimpleFoam vs rhoCentralFoam on the V1 nozzle", once("V1"),
                                 once("V1", solver="rhoCentralFoam"), "central vs PIMPLE:", 1e-3, 2e-3))
        elif name == "V14":
            # The unstructured (Tier 2) mesher against the structured wedge on
            # the same nozzle: snapped, faceted walls and polyhedral cells
            # must still give the wedge's mass flow and thrust.
            # Always on the coarse unstructured preset (10 cells across the
            # throat radius, 174k cells): the standard one is three times
            # the cells of a full 3D run for a nightly check.
            results.append(_pair("V14", "Unstructured (snappyHexMesh, coarse) vs structured wedge on the V1 nozzle",
                                 once("V1"), once("V1", "unstructured", at="coarse"), "unstructured vs wedge:",
                                 V14_MASS_TOLERANCE, V14_THRUST_TOLERANCE))
        elif name == "V15":
            # A startup must end where the steady solve lands on the same
            # (coarse) mesh with the same solver. Against Kliegel-Levine the
            # coarse mesh's own discretisation error (Cd -0.28 %) would be
            # judged with the standard mesh's tolerance, so the steady run is
            # a reference here, not a case.
            start = once("V15", at="coarse")
            results.append(_pair("V15 end state", "V15's end state vs the steady rhoCentralFoam solve, coarse wedge",
                                 once("V1", solver="rhoCentralFoam", at="coarse", listed=False), start,
                                 "startup end vs steady:", V15_MASS_TOLERANCE, V15_THRUST_TOLERANCE))
        elif name == "V11":
            for npr in sorted(MASON_B1_UPPER):
                results.append(run_validation_case(npr, quality, out, processors, on_event))
        elif name == "V10":
            results.append(peng_robinson_check(once("V10-perfect"), once("V10-pr")))
        elif name == "V5":
            for rc in V5_RATIOS:
                results.append(throat_cd_study(rc, quality, out, processors, on_event))
        else:
            once(name)
    (out / "verification.json").write_text(
        json.dumps([asdict(r) | {"passed": r.passed} for r in results], indent=2, default=str) + "\n",
        encoding="utf-8")
    (out / "verification.md").write_text(markdown(results, quality), encoding="utf-8")
    return results


def markdown(results: list[CaseResult], quality: str) -> str:
    lines = [f"Verification results ({quality} meshes)", "",
             "| case | check | CFD | reference | error | tolerance | result |",
             "|---|---|---|---|---|---|---|"]
    for r in results:
        if not r.checks:
            lines.append(f"| {r.case} | run {r.status} ({r.trust}) | | | | | **FAIL** |")
        for c in r.checks:
            err = f"{100 * c.error:+.3f} %" if c.relative else f"{c.error:+.2e}"
            tol = f"{100 * c.tolerance:.2g} %" if c.relative else f"{c.tolerance:.0e}"
            val = "n/a" if c.value is None else f"{c.value:.6g}"
            lines.append(f"| {r.case} | {c.name} | {val} | {c.reference:.6g} | {err} | {tol} | "
                         f"{'pass' if c.passed else '**FAIL**'} |")
    return "\n".join(lines) + "\n"
