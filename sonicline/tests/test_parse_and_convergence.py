from pathlib import Path

import numpy as np
import pytest

from sonicline.core.model.definition import ConvergenceCriteria
from sonicline.foam import parse
from sonicline.run import convergence, gates
from sonicline.run.runner import WSLRunner, windows_to_wsl


def _write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def test_table_merges_restarts_and_skips_partial_line(tmp_path):
    fo = tmp_path / "mdot_inlet"
    _write(fo / "0" / "surfaceFieldValue.dat",
           "# Region type : patch inlet\n# Time\tsum(phi)\n1\t-1.0\n2\t-2.0\n3\t-3.0\n")
    _write(fo / "2" / "surfaceFieldValue.dat",
           "# Time\tsum(phi)\n2\t-2.5\n3\t-3.5\n4\t-4.")  # restart; last line half-written
    t = parse.read_table(fo)
    assert t.time.tolist() == [1, 2, 3]
    assert t.values["sum(phi)"].tolist() == [-1.0, -2.5, -3.5]


def test_force_table_needs_a_file_name(tmp_path):
    fo = tmp_path / "wall_force"
    header = "# Time\ttotal_x total_y total_z\tpressure_x pressure_y pressure_z\n"
    _write(fo / "0" / "force.dat", header + "1 1 2 3 4 5 6\n")
    _write(fo / "0" / "moment.dat", header + "1 9 9 9 9 9 9\n")
    with pytest.raises(ValueError, match="name the one"):
        parse.read_table(fo)
    t = parse.read_table(fo, "force.dat")
    assert t.values["total_x"][0] == 1 and t.values["pressure_z"][0] == 6


def test_vectors_and_strings(tmp_path):
    fo = tmp_path / "x"
    _write(fo / "0" / "a.dat", "# Time\tweightedSum(U)\tsolver\n1\t(1 2 3)\tGAMG\n")
    t = parse.read_table(fo)
    assert t.values["weightedSum(U)"].tolist() == [[1, 2, 3]]
    assert "solver" not in t.values


def test_field_reader(tmp_path):
    _write(tmp_path / "p", """FoamFile { class volScalarField; object p; }
dimensions [1 -1 -2 0 0 0 0];
internalField   nonuniform List<scalar>
3
(
1.5
2.5
3.5
)
;
boundaryField
{
    wall
    {
        type            zeroGradient;
        value           nonuniform List<scalar> 2(4 5);
    }
    inlet
    {
        type            fixedValue;
        value           uniform 7;
    }
}
""")
    internal, patches = parse.read_field(tmp_path / "p")
    assert internal.tolist() == [1.5, 2.5, 3.5]
    assert patches["wall"].tolist() == [4, 5] and patches["inlet"].tolist() == [7]


def test_log_failure_ignores_the_fpe_banner():
    assert parse.log_failure("trapFpe: Floating point exception trapping enabled (FOAM_SIGFPE).") is None
    assert parse.log_failure("--> FOAM FATAL ERROR: (openfoam-2512)") is not None
    assert parse.log_failure("#0  Foam::error::printStack(Foam::Ostream&)") is not None


def test_checkmesh_log_and_gates(tmp_path):
    log = """    cells:            1500
    Number of regions: 1 (OK).
    Mesh non-orthogonality Max: 43.8 average: 5.1
    Max skewness = 0.92 OK.
    Max aspect ratio = 25.4 OK.
Mesh OK.
"""
    check = parse.read_checkmesh(tmp_path, log)
    assert check.cells == 1500 and check.max_non_orthogonality == 43.8 and check.regions == 1
    assert gates.evaluate(check, viscous=False).ok
    bad = parse.read_checkmesh(tmp_path, log + " ***Zero or negative cell volume detected.\nFailed 1 mesh checks.\n")
    result = gates.evaluate(bad, viscous=False)
    assert not result.ok and "negative" in result.errors[0]


def _tables(n, drift=0.0, imbalance=0.0, residual=1e-7):
    it = np.arange(1, n + 1, dtype=float)
    inlet = -1.0 * (1 + drift * it / n)
    mk = lambda cols: parse.Table(list(cols), it, cols)  # noqa: E731
    return {
        "mdot_inlet": mk({"sum(phi)": np.full(n, 1.0) * inlet}),
        "mdot_exit": mk({"sum(phi)": np.full(n, 1.0 - imbalance)}),
        "momentum_exit": mk({"weightedSum(U)": np.tile([5.0, 0, 0], (n, 1))}),
        "pforce_exit": mk({"areaIntegrate(p)": np.full(n, 0.3)}),
        "residuals": mk({"p_initial": np.geomspace(1e-2, residual, n),
                         "Uz_initial": np.full(n, 1e-2)}),
    }


def test_converged_run():
    a = convergence.assess(_tables(500), ConvergenceCriteria(), wedge=True)
    assert a.converged, a.reasons


def test_drifting_integral_is_not_converged():
    a = convergence.assess(_tables(500, drift=0.01), ConvergenceCriteria(), wedge=True)
    assert not a.converged and any("inlet mass flow" in r for r in a.reasons)


def test_mass_imbalance_is_not_converged():
    a = convergence.assess(_tables(500, imbalance=0.01), ConvergenceCriteria(), wedge=True)
    assert not a.mass_balanced and not a.converged


def test_wedge_ignores_uz_but_3d_does_not():
    assert convergence.assess(_tables(500), ConvergenceCriteria(), wedge=True).residuals_dropped
    assert not convergence.assess(_tables(500), ConvergenceCriteria(), wedge=False).residuals_dropped


def test_stalled_residuals_are_reported_but_do_not_block():
    a = convergence.assess(_tables(500, residual=5e-3), ConvergenceCriteria(), wedge=True)
    assert a.converged and not a.residuals_dropped
    assert a.residual_notes and not a.reasons


def test_wsl_command_and_paths():
    assert windows_to_wsl(r"C:\Users\me\runs") == "/mnt/c/Users/me/runs"
    assert windows_to_wsl(r"\\wsl.localhost\Ubuntu-24.04\home\me\run") == "/home/me/run"
    cmd = WSLRunner().command(["rhoPimpleFoam"], Path(r"C:\runs\a b"))
    assert cmd[:3] == ["wsl.exe", "-d", "Ubuntu-24.04"]
    assert "cd '/mnt/c/runs/a b'" in cmd[-1] and cmd[-1].endswith("exec rhoPimpleFoam")


def test_kliegel_levine_bound_only_applies_when_choked():
    from sonicline.core import model as m
    from sonicline.metrics import Trust, verdict

    defn = m.SimulationDefinition(
        name="t", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=1.0),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=1.5e5)),
        flow=m.Flow(turbulence=m.Inviscid()))
    metrics = {"discharge_coefficient": {"cfd": 0.998, "kliegel_levine": 0.994},
               "thrust": {"control_volume_disagreement": 0.0},
               "regime": {"quasi_1d": "subsonic", "separation_expected": False}}
    assert verdict(defn, "completed", True, [], None, metrics, None).trust is Trust.TRUSTED
    metrics["regime"]["quasi_1d"] = "underexpanded"
    assert verdict(defn, "completed", True, [], None, metrics, None).trust is Trust.NOT_TRUSTWORTHY


def test_rhopimplefoam_is_not_trusted_with_a_shock_inside():
    from sonicline.core import model as m
    from sonicline.metrics import Trust, verdict

    defn = m.SimulationDefinition(
        name="t", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=1.5),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=2e5)),
        flow=m.Flow(turbulence=m.Inviscid()))
    metrics = {"discharge_coefficient": {"cfd": 0.999, "kliegel_levine": 0.9995},
               "thrust": {"control_volume_disagreement": 0.0}, "solver": "rhoCentralFoam",
               "regime": {"quasi_1d": "shock_in_nozzle", "separation_expected": False}}
    v = verdict(defn, "completed", True, [], None, metrics, None)
    assert v.trust is Trust.TRUSTED and not v.warnings  # inviscid: the shock position is exact
    metrics["solver"] = "rhoPimpleFoam"
    v = verdict(defn, "completed", True, [], None, metrics, None)
    assert v.trust is Trust.NOT_TRUSTWORTHY and "misplaces" in v.reasons[0]


def test_shock_front_is_located_between_foot_and_head():
    import numpy as np

    from sonicline.metrics import shock_front

    x = np.linspace(0.0, 1.0, 101)
    # Supersonic expansion, a jump spread over three cells centred on 0.605,
    # then a slow subsonic recompression.
    p = np.where(x < 0.59, 1.0 - 0.3 * x, np.where(x > 0.62, 2.5 + 0.2 * (x - 0.62), np.nan))
    ramp = (x >= 0.59) & (x <= 0.62)
    p[ramp] = np.interp(x[ramp], [0.59, 0.62], [1.0 - 0.3 * 0.59, 2.5])
    xs = shock_front({"x": list(x), "p": list(p)}, 0.1, 0.95)
    assert xs == pytest.approx(0.605, abs=0.005)
    assert shock_front({"x": list(x), "p": list(1.0 - x)}, 0.1, 0.95) is None
