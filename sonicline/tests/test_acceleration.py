"""Convergence aids (run.acceleration): the Courant step-down for a stalled
rhoPimpleFoam run, the chamber-pressure correction for a mass-flow-driven
rhoCentralFoam nozzle, and the repair of reconstructed slip-wall fields.
All without OpenFOAM."""

from pathlib import Path

import numpy as np
import pytest

from sonicline.core.model.definition import ConvergenceCriteria
from sonicline.foam import case as foam_case
from sonicline.foam import fields as F
from sonicline.foam import parse
from sonicline.foam.parse import Table
from sonicline.run import acceleration as A

CRIT = ConvergenceCriteria()


def _table(values, start=1):
    v = np.asarray(values, dtype=float)
    return Table(["Time", "sum(phi)"], np.arange(start, start + len(v), dtype=float), {"sum(phi)": v})


def test_the_courant_ladder():
    assert A.next_courant(0.5) == 0.2 and A.next_courant(0.25) == 0.1
    assert A.next_courant(0.2) == 0.1 and A.next_courant(0.1) is None


def test_a_limit_cycle_is_a_stall_and_a_dying_transient_is_not():
    n = 4000
    k = np.arange(n)
    steady_exit = _table(np.full(n, 1.0))
    cycle = _table(-(1.0 + 0.01 * np.sin(k)))  # the inlet scatters by 0.7 % for good
    why = A.stalled({"mdot_inlet": cycle, "mdot_exit": steady_exit}, CRIT, since=0)
    assert why and "inlet mass flow" in why and "limit cycle" in why
    dying = _table(-(1.0 + 0.01 * np.exp(-k / 150) * np.sin(k)))
    assert A.stalled({"mdot_inlet": dying, "mdot_exit": steady_exit}, CRIT, since=0) is None
    # both windows must follow the last change of settings
    assert A.stalled({"mdot_inlet": cycle, "mdot_exit": steady_exit}, CRIT, since=n - 1500) is None


def test_the_chamber_correction_factor():
    n = 1500
    inlet = _table(np.full(n, -1.0))
    short = {"mdot_inlet": inlet, "mdot_throat": _table(np.full(n, 0.998))}
    assert A.mass_storage_factor(short, CRIT, since=0) == pytest.approx(1 / 0.998)
    # not before an interval has passed since the last correction
    assert A.mass_storage_factor(short, CRIT, since=n - 500) is None
    # nothing to correct within half the mass-balance tolerance
    close = {"mdot_inlet": inlet, "mdot_throat": _table(np.full(n, 0.9996))}
    assert A.mass_storage_factor(close, CRIT, since=0) is None
    # a throat flow that scatters more than the deficit gives no factor
    noisy = {"mdot_inlet": inlet,
             "mdot_throat": _table(0.998 + 0.002 * np.sin(np.arange(n)))}
    assert A.mass_storage_factor(noisy, CRIT, since=0) is None
    # nor does one still moving: the transient of a start or a correction
    moving = {"mdot_inlet": inlet, "mdot_throat": _table(np.linspace(0.98, 0.995, n))}
    assert A.mass_storage_factor(moving, CRIT, since=0) is None


FIELD = """FoamFile
{{
    format      ascii;
    class       volScalarField;
    object      p;
}}
dimensions      [1 -1 -2 0 0 0 0];

internalField   {internal}

boundaryField
{{
    inlet
    {{
        type            zeroGradient;
    }}
}}
"""


def _labels(n_cells: list[int]) -> str:
    body = "\n".join(str(c) for c in n_cells)
    return f"FoamFile\n{{\n    class labelList;\n}}\n\n{len(n_cells)}\n(\n{body}\n)\n"


def test_pressure_is_scaled_in_the_region_of_every_processor(tmp_path: Path):
    # Four cells; processor0 holds global cells 0 and 2, processor1 cells 3 and 1.
    for proc, cells, internal in ((0, [0, 2], "nonuniform List<scalar> \n2\n(\n100\n200\n)\n;"),
                                  (1, [3, 1], "uniform 300;")):
        d = tmp_path / f"processor{proc}"
        (d / "constant" / "polyMesh").mkdir(parents=True)
        (d / "constant" / "polyMesh" / "cellProcAddressing").write_text(_labels(cells))
        (d / "500").mkdir()
        (d / "1000").mkdir()
        (d / "1000" / "p").write_text(FIELD.format(internal=internal))
    region = np.array([True, True, False, True])  # global cell 2 is outside the nozzle
    done = F.scale_pressure(tmp_path, 1.01, region)
    assert done == {"time": "1000", "cells": 3}
    p0, _ = parse.read_field(tmp_path / "processor0" / "1000" / "p")
    p1, patches = parse.read_field(tmp_path / "processor1" / "1000" / "p")
    assert p0.tolist() == pytest.approx([101.0, 200.0])
    assert p1.tolist() == pytest.approx([303.0, 303.0])
    assert "zeroGradient" in (tmp_path / "processor1" / "1000" / "p").read_text()


def test_a_serial_case_is_scaled_in_place(tmp_path: Path):
    (tmp_path / "200").mkdir()
    (tmp_path / "200" / "p").write_text(FIELD.format(internal="nonuniform List<scalar> \n3\n(\n1\n2\n3\n)\n;"))
    F.scale_pressure(tmp_path, 2.0, np.array([True, False, True]))
    assert parse.read_field(tmp_path / "200" / "p")[0].tolist() == [2.0, 2.0, 6.0]
    with pytest.raises(ValueError, match="mask"):
        F.scale_pressure(tmp_path, 2.0, np.array([True, False]))


def test_reconstructed_slip_temperature_is_repaired(tmp_path: Path):
    t = tmp_path / "1000"
    t.mkdir(parents=True)
    broken = ("boundaryField\n{\n    wall\n    {\n        type            smoluchowskiJumpT;\n"
              "        U               ;\n        rho             ;\n        psi             ;\n"
              "        mu              ;\n        accommodationCoeff 1;\n        Twall           uniform 300;\n"
              "    }\n}\n")
    (t / "T").write_text(broken)
    (t / "U").write_text("boundaryField\n{\n    wall\n    {\n        type            maxwellSlipU;\n    }\n}\n")
    assert F.repair_reconstructed(tmp_path) == ["T"]
    fixed = (t / "T").read_text()
    assert "U               ;" not in fixed and "accommodationCoeff 1;" in fixed and "Twall" in fixed
    assert F.repair_reconstructed(tmp_path) == []


def test_the_courant_number_of_a_running_case_is_changed_in_place(tmp_path: Path):
    (tmp_path / "system").mkdir()
    (tmp_path / "system" / "fvSolution").write_text(
        "PIMPLE\n{\n    nOuterCorrectors 1;\n    maxCo           0.5;\n    maxDeltaT       1;\n}\n")
    assert foam_case.courant(tmp_path) == 0.5
    foam_case.set_courant(tmp_path, 0.2)
    assert foam_case.courant(tmp_path) == 0.2
    assert "maxDeltaT       1;" in (tmp_path / "system" / "fvSolution").read_text()


def test_the_pressure_solve_is_tightened_in_place(tmp_path: Path):
    (tmp_path / "system").mkdir()
    (tmp_path / "system" / "fvSolution").write_text(
        'solvers\n{\n    "(rho|rhoFinal)"\n    {\n        solver diagonal;\n    }\n'
        '    "(p|pFinal)"\n    {\n        solver          GAMG;\n        relTol          0.01;\n    }\n'
        '    "(U|e)"\n    {\n        relTol          0.01;\n    }\n}\n')
    foam_case.set_pressure_tolerance(tmp_path, 1e-4)
    text = (tmp_path / "system" / "fvSolution").read_text()
    assert "relTol          0.0001;" in text and text.count("relTol          0.01;") == 1


def test_steady_but_unbalanced_for_a_window():
    from sonicline.run.convergence import Assessment

    a = Assessment(iterations=5000, converged=False, integrals_flat=True, mass_balanced=False,
                   residuals_dropped=True)
    assert A.unbalanced(a, 4400, CRIT) and not A.unbalanced(a, 4600, CRIT)
    assert not A.unbalanced(a, None, CRIT)
    a.integrals_flat = False
    assert not A.unbalanced(a, 4000, CRIT)
