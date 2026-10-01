"""Uncertainty budgets (core.uncertainty) on metrics shaped like a run's:
the components, their sources, the input sensitivities and what is left
unbounded."""

import math

import pytest

from sonicline.core import model as m
from sonicline.core import uncertainty as U
from sonicline.core.validate import resolve_profile


def _defn(**kw):
    base = dict(name="u", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
                boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5, T0=300.0)),
                flow=m.Flow(turbulence=m.KOmegaSST()),
                mesh=m.MeshSpec(form=m.MeshForm.WEDGE, quality=m.MeshQuality.STANDARD, first_cell_yplus=30.0),
                gas=m.GasSpec(equation_of_state="virial"))
    base.update(kw)
    return m.SimulationDefinition(**base)


METRICS = {
    "mass_flow": {"inlet": 14.27e-3, "imbalance_inlet_exit": 2e-6, "real_gas_correction": 0.0},
    "thrust": {"total": 8.35, "control_volume_disagreement": 3e-4, "wall_viscous_drag": 0.0857},
    "specific_impulse": {"cfd": 59.7},
    "conditions": {"p0": 20e5, "T0": 300.0},
    "regime": {},
}


def test_components_and_total():
    d = _defn()
    b = U.budgets(d, resolve_profile(d), METRICS)
    mf, th = b["mass_flow"], b["thrust"]
    assert set(mf.components) == {"discretisation", "iterative", "gas model"}
    assert set(th.components) == {"discretisation", "iterative", "gas model", "wall treatment"}
    assert mf.total == pytest.approx(math.sqrt(sum(c * c for c in mf.components.values())))
    assert mf.absolute == pytest.approx(mf.total * 14.27e-3)
    # The virial gas moves thrust a fortieth as much as mass flow (V18).
    assert th.components["gas model"] == pytest.approx(0.025 * mf.components["gas model"])
    # y+ 30 wall functions: drag 6.4 % high, scaled by drag / thrust.
    assert th.components["wall treatment"] == pytest.approx(0.064 * 0.0857 / 8.35)
    assert "estimate from verification" in mf.sources["discretisation"]
    assert not mf.unquantified


def test_a_study_replaces_the_estimate():
    d = _defn()
    b = U.budgets(d, resolve_profile(d), METRICS, study={"mass_flow": 4e-4, "thrust": 1e-3})
    assert b["mass_flow"].components["discretisation"] == 4e-4
    assert "grid study" in b["mass_flow"].sources["discretisation"]
    assert "estimate" in b["specific_impulse"].sources["discretisation"]


def test_sharp_throats_and_coarse_meshes_cost_more():
    sharp = _defn(geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88, throat_rc_upstream=0.625))
    gentle = _defn(geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88, throat_rc_upstream=2.0))
    e_sharp = U.discretisation_estimate(sharp, resolve_profile(sharp))["mass_flow"]
    e_gentle = U.discretisation_estimate(gentle, resolve_profile(gentle))["mass_flow"]
    assert e_sharp == pytest.approx(2.5e-3) and e_gentle == pytest.approx(0.6e-3)
    coarse = _defn(mesh=m.MeshSpec(form=m.MeshForm.WEDGE, quality=m.MeshQuality.COARSE))
    assert U.discretisation_estimate(coarse, resolve_profile(coarse))["thrust"] == pytest.approx(2.8 * 1.5e-3)


def test_input_tolerances_carry_through_quasi_1d():
    d = _defn(tolerances=m.Tolerances(p0_relative=0.01, T0=3.0, throat_diameter=0.01e-3))
    prof = resolve_profile(d)
    sens = U.input_sensitivities(d, prof, METRICS)
    # choked: mdot ~ p0 At / sqrt(T0)
    assert sens["p0"]["mass_flow"] == pytest.approx(1.0, abs=1e-3)
    assert sens["throat_diameter"]["mass_flow"] == pytest.approx(2.0, abs=1e-3)
    assert sens["T0"]["mass_flow"] == pytest.approx(-0.5, abs=1e-3)
    b = U.budgets(d, prof, METRICS)["mass_flow"]
    assert b.components["input: throat_diameter"] == pytest.approx(2.0 * 0.01 / 2.0, rel=1e-3)  # 1 %
    assert b.components["input: p0"] == pytest.approx(0.01, rel=1e-3)
    assert b.components["input: T0"] == pytest.approx(0.5 * 3.0 / 300.0, rel=1e-3)


def test_what_cannot_be_bounded_is_said():
    inviscid = _defn(flow=m.Flow(turbulence=m.Inviscid()))
    b = U.budgets(inviscid, resolve_profile(inviscid), METRICS)
    assert "wall treatment" not in b["thrust"].components
    assert any("inviscid" in n for n in b["thrust"].unquantified)
    shocked = dict(METRICS, regime={"shock_area_ratio": 2.0})
    b = U.budgets(_defn(), resolve_profile(_defn()), shocked)
    assert any("shock" in n for n in b["thrust"].unquantified)


def test_gas_model_sizes():
    d = _defn(gas=m.GasSpec(equation_of_state="perfect_gas"))
    mt = dict(METRICS, mass_flow=dict(METRICS["mass_flow"], real_gas_correction=0.0071))
    b = U.budgets(d, resolve_profile(d), mt)
    assert b["mass_flow"].components["gas model"] == pytest.approx(0.0071)  # the unapplied correction
    hot = _defn(boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5, T0=800.0)),
                gas=m.GasSpec(equation_of_state="virial", heat_capacity="constant"))
    mh = dict(METRICS, conditions={"p0": 20e5, "T0": 800.0})
    u = U.budgets(hot, resolve_profile(hot), mh)["mass_flow"].components["gas model"]
    assert u == pytest.approx(math.hypot(2.1e-4, 9.4e-3))  # constant cp on an 800 K gas
    to_json = U.to_json(U.budgets(hot, resolve_profile(hot), mh))
    assert to_json["thrust"]["relative"] > 0 and "components" in to_json["thrust"]
