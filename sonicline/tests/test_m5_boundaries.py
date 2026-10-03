"""Mass-flow inlet, prescribed wall temperature and the condensation check
(no OpenFOAM needed; V12 and V13 run them for real)."""

import json

import numpy as np
import pytest

from sonicline.core import model as m
from sonicline.core.gas import NITROGEN
from sonicline.core.stagnation import nominal_p0
from sonicline.core.theory import nozzle
from sonicline.core.validate import resolve_profile, validate
from sonicline.foam.case import build_case
from sonicline.mesh import revolved, sizing

At = 3.14159e-6


@pytest.mark.parametrize("p0, pa", [(10e5, 101325.0), (20e5, 0.0), (1.2e5, 1e5), (1.01e5, 1e5)])
def test_mass_flow_inverts_to_the_stagnation_pressure(p0, pa):
    """Choked, vacuum, and two subsonic nozzles: mass flow back to p0."""
    mdot = nozzle.analyse(NITROGEN, p0, 300.0, pa, At, 3 * At).mass_flow
    assert nozzle.stagnation_pressure_for(NITROGEN, mdot, 300.0, pa, At, 3 * At) == pytest.approx(p0, rel=1e-9)


def _defn(inlet, wall=None, turbulence=None):
    return m.SimulationDefinition(
        name="t", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
        boundaries=m.Boundaries(inlet=inlet, wall_thermal=wall or m.Adiabatic()),
        flow=m.Flow(turbulence=turbulence or m.Inviscid()),
        mesh=m.MeshSpec(form=m.MeshForm.WEDGE, quality=m.MeshQuality.COARSE))


def _build(tmp_path, defn):
    profile = resolve_profile(defn)
    mesh, meta = revolved.build(profile, sizing.spec_for(defn, profile))
    return build_case(tmp_path / "case", defn, profile, mesh, meta, "libtest.so")


def test_mass_flow_inlet_case(tmp_path):
    reservoir = _defn(m.ReservoirInlet(p0=20e5))
    mdot = nozzle.analyse(NITROGEN, 20e5, 300.0, 101325.0, resolve_profile(reservoir).throat_area,
                          resolve_profile(reservoir).area(resolve_profile(reservoir).x_exit)).mass_flow
    defn = _defn(m.MassFlowInlet(mass_flow=mdot))
    assert nominal_p0(defn, resolve_profile(defn)) == pytest.approx(20e5, rel=1e-9)
    s = _build(tmp_path, defn)
    U = (s.path / "0/U").read_text()
    assert "flowRateInletVelocity" in U
    rate = float(U.split("massFlowRate")[1].split(";")[0])
    assert rate * s.sector_factor == pytest.approx(mdot, rel=1e-12)  # per wedge
    p = (s.path / "0/p").read_text()
    inlet = p.split("inlet")[1].split("}")[0]
    assert "zeroGradient" in inlet and "totalPressure" not in inlet
    assert s.p0_nominal == pytest.approx(20e5, rel=1e-9)
    findings = {f.code for f in validate(defn)}
    assert "inlet.implied_p0" in findings


def test_fixed_wall_temperature_records_the_heat_flux(tmp_path):
    s = _build(tmp_path, _defn(m.ReservoirInlet(p0=20e5), m.FixedTemperature(temperature=400.0), m.Laminar()))
    control = (s.path / "system/controlDict").read_text()
    assert "type wallHeatFlux" in " ".join(control.split())
    assert "heat_wall" in control
    assert "400" in (s.path / "0/T").read_text().split("wall")[1].split("}")[0]


def _metrics(**over):
    base = {"discharge_coefficient": {"cfd": 0.99, "kliegel_levine": None},
            "thrust": {"control_volume_disagreement": 0.0},
            "regime": {"quasi_1d": "underexpanded", "separation_expected": False},
            "mass_flow": {}}
    base.update(over)
    return base


def test_energy_balance_with_heat_and_the_imposed_flow_are_checked():
    from sonicline.metrics import Trust, verdict

    defn = _defn(m.MassFlowInlet(mass_flow=7e-3), m.FixedTemperature(temperature=400.0), m.Laminar())
    good = _metrics(energy={"exit_minus_inlet": 0.010},
                    wall_heat={"heat_over_enthalpy_flow": 0.0101, "balance_error": -1e-4},
                    mass_flow={"inlet_minus_imposed": 1e-6})
    assert verdict(defn, "completed", True, [], None, good, None).trust is Trust.TRUSTED
    bad = _metrics(energy={"exit_minus_inlet": 0.010},
                   wall_heat={"heat_over_enthalpy_flow": 0.004, "balance_error": 0.006},
                   mass_flow={"inlet_minus_imposed": 0.01})
    v = verdict(defn, "completed", True, [], None, bad, None)
    assert v.trust is Trust.WARNINGS
    assert any("wall heat flux accounts" in w for w in v.warnings)
    assert any("imposed mass flow" in w for w in v.warnings)
    # A hot wall may heat the gas above T0: no stagnation-temperature warning.
    hot = _metrics(extremes={"nozzle": {"T_max": 390.0, "mach_max": 2.0}})
    assert not verdict(defn, "completed", True, [], None, hot, None).warnings


def test_the_cfd_measures_p0_for_a_mass_flow_inlet():
    from sonicline.metrics import inlet_total_pressure
    from sonicline.post.results import Integrals

    T, u, p, A = 299.8, 20.0, 9.9e5, 2.8e-5
    it = Integrals(1, 1, 1, None, None, 0, 0, 0, p * A, 0, 0, {}, {}, {}, {},
                   {"T": T, "magSqr(U)": u * u})
    m2 = u * u / (NITROGEN.gamma * NITROGEN.R * T)
    g = NITROGEN.gamma
    assert inlet_total_pressure(NITROGEN, it, A) == pytest.approx(p * (1 + 0.5 * (g - 1) * m2) ** (g / (g - 1)))


def test_condensation_is_found_cell_by_cell():
    pytest.importorskip("CoolProp")
    from sonicline.metrics import Trust, condensation, verdict

    # One bar saturates at 77.24 K: 60 K there is supersaturated, 90 K is not.
    p = np.array([1e5, 1e5, 1e5, 1e5])
    T = np.array([300.0, 90.0, 60.0, 70.0])
    x = np.array([0.0, 1e-3, 2e-3, 20e-3])
    c = condensation(NITROGEN, p, T, x, 5e-3)
    assert c["nozzle"]["cells_supersaturated"] == 1 and c["nozzle"]["x_min_margin"] == 2e-3
    assert c["nozzle"]["min_margin"] == pytest.approx(60.0 - 77.24, abs=0.02)
    assert c["plume"]["cells_supersaturated"] == 1
    v = verdict(_defn(m.ReservoirInlet(p0=20e5)), "completed", True, [], None, _metrics(condensation=c), None)
    assert v.trust is Trust.WARNINGS and sum("supersaturated" in w for w in v.warnings) == 2


def test_run_p0_prefers_what_the_cfd_measured():
    from sonicline.core.stagnation import run_p0

    defn = _defn(m.MassFlowInlet(mass_flow=7e-3))
    prof = resolve_profile(defn)
    assert run_p0(defn, prof, {"conditions": {"p0": 20.3e5}}) == 20.3e5
    assert run_p0(defn, prof, None) == pytest.approx(nominal_p0(defn, prof))
    json.dumps(m.dumps(defn))  # the definition still serialises


def _slip_defn(wall=None, solver="auto", time=None):
    d = _defn(m.ReservoirInlet(p0=20e5), wall, m.Laminar())
    return m.SimulationDefinition(
        name="s", geometry=d.geometry,
        boundaries=m.Boundaries(inlet=d.boundaries.inlet, wall_thermal=d.boundaries.wall_thermal,
                                wall_slip=m.WallSlip(accommodation=0.9)),
        flow=m.Flow(turbulence=m.Laminar(), time=time or m.Steady()), mesh=d.mesh,
        numerics=m.Numerics(solver=solver))


def _wall(path) -> str:
    """The wall patch's entry in a field file, whitespace-collapsed."""
    import re

    block = re.search(r"^\s*wall\s*\{([^}]*)\}", path.read_text(), re.M).group(1)
    return " ".join(block.split())


def test_slip_walls_write_maxwell_and_smoluchowski(tmp_path):
    s = _build(tmp_path, _slip_defn(m.FixedTemperature(temperature=400.0)))
    U = _wall(s.path / "0/U")
    assert "type maxwellSlipU" in U and "accommodationCoeff 0.9" in U and "curvature false" in U
    T = _wall(s.path / "0/T")
    assert "type smoluchowskiJumpT" in T and "Twall uniform 400" in T
    assert "librhoCentralFoam.so" in (s.path / "system/controlDict").read_text()
    import re
    thermo = (s.path / "constant/thermophysicalProperties").read_text()
    assert re.search(r"transport\s*\{[^}]*\bPr\b", thermo)  # smoluchowskiJumpT reads it
    # an adiabatic wall slips but has no temperature jump
    a = _build(tmp_path / "a", _slip_defn())
    assert "zeroGradient" in _wall(a.path / "0/T")
    # no slip asked: the walls are unchanged
    plain = _build(tmp_path / "p", _defn(m.ReservoirInlet(p0=20e5), None, m.Laminar()))
    assert "noSlip" in (plain.path / "0/U").read_text()
    assert "librhoCentralFoam" not in (plain.path / "system/controlDict").read_text()


def test_slip_on_rhocentralfoam_is_written_and_noted(tmp_path):
    # M13: rhoCentralFoam takes slip too; the pipeline runs SONICLINE's build
    # of it (foam/extensions slipCentralFoam), whose patch is checked below.
    s = _build(tmp_path, _slip_defn(solver="rhoCentralFoam"))
    assert "maxwellSlipU" in _wall(s.path / "0/U")
    from sonicline.core.validate import Severity
    codes = {f.code: f.severity for f in validate(_slip_defn(solver="rhoCentralFoam"))}
    assert codes["wall.slip_central"] is Severity.INFO
    assert "wall.slip_central" not in {f.code for f in validate(_slip_defn())}
    with pytest.raises(ValueError):
        m.WallSlip(accommodation=0.0)


def test_the_central_solver_patch_is_anchored_and_named():
    from sonicline.foam import extensions as e

    assert "slipCentralFoam" in e.APPLICATIONS
    assert e.library_name("slipCentralFoam").startswith("soniclineCentralFoam_")
    (f1, a1, r1), (f2, a2, r2) = e.PATCHES["slipCentralFoam"]
    assert f1 == f2 == "rhoCentralFoam.C"
    assert "wallFvPatch.H" in r1 and r2.startswith(a2) and "sigmaDotU.boundaryFieldRef()" in r2


def test_slip_round_trips_through_json():
    d = _slip_defn()
    back = m.loads(m.dumps(d))
    assert back.boundaries.wall_slip == m.WallSlip(accommodation=0.9)
    assert m.loads(m.dumps(_defn(m.ReservoirInlet(p0=20e5)))).boundaries.wall_slip is None
