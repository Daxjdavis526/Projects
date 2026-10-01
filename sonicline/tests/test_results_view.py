"""Results viewing and report export on a synthetic run (quasi-1D fields in
0/, no OpenFOAM needed), including image regression against stored
references. Skipped without pyvista."""

import json
import os
from pathlib import Path

import numpy as np
import pytest

pytest.importorskip("pyvista")

import synthetic_run  # noqa: E402

from sonicline.post import fieldview, report  # noqa: E402

IMAGES = Path(__file__).resolve().parent / "images"


@pytest.fixture(scope="module")
def run(tmp_path_factory):
    d = tmp_path_factory.mktemp("synthetic") / "run"
    defn, _ = synthetic_run.make(d)
    return d, defn


def test_fields_and_derived_quantities(run):
    d, defn = run
    r = fieldview.RunResults(d)
    fields = r.fields()  # reads the case
    assert r.form == "wedge" and r.time == "0"
    assert {"Mach", "p", "T", "speed", "rho", "T0", "p0"} <= set(fields)
    cd = r.internal.cell_data
    # Every cell holds a quasi-1D state: T0 and p0 recovered to the single
    # precision VTK reads fields in.
    inlet = defn.boundaries.inlet
    nozzle = np.asarray(r.internal.cell_centers().points[:, 0]) <= r.profile.x_exit
    assert np.allclose(np.asarray(cd["T0"])[nozzle], inlet.T0, rtol=1e-6)
    assert np.allclose(np.asarray(cd["p0"])[nozzle], inlet.p0, rtol=1e-6)
    lo, hi = r.range("Mach")
    assert 0.0 < lo < 0.1 and 3.3 < hi < 3.5


def test_centreline_matches_quasi_1d(run):
    d, defn = run
    r = fieldview.RunResults(d)
    c = r.centreline(200)
    inside = (c["x"] > r.profile.x_inlet) & (c["x"] < r.profile.x_exit)
    # Cells hold the quasi-1D value at their centres; the sample point sits
    # anywhere within the cell, so compare against theory at a coarse tolerance.
    theory = synthetic_run.q1d_mach(defn, c["x"][inside])
    assert np.max(np.abs(c["Mach"][inside] - theory)) < 0.12


def test_meridian_is_mirrored_and_probe_reads_the_same_cell(run):
    d, _ = run
    r = fieldview.RunResults(d)
    m = r.meridian()
    b = m.bounds
    assert b[2] == pytest.approx(-b[3], rel=1e-9)
    x = r.profile.throat_x + 0.2 * (r.profile.x_exit - r.profile.throat_x)
    up, down = r.probe((x, 3e-4, 0.0)), r.probe((x, -3e-4, 0.0))
    assert up is not None and up["cell"] == down["cell"] and up["kind"] == "cell value"
    raw = np.asarray(r.internal.cell_data["p"])[up["cell"]] * 1e-5
    assert up["values"]["p"] == pytest.approx(raw)  # shown in bar, the cell's own value
    assert r.probe((10.0, 0.0, 0.0)) is None


def test_cross_section_vectors_streamlines_patches(run):
    d, _ = run
    r = fieldview.RunResults(d)
    cs = r.cross_section(r.profile.throat_x)
    assert len(cs["r"]) > 50 and np.all(np.diff(cs["r"]) > 0)
    assert r.vectors(r.meridian()).n_points > 0
    lines = r.streamlines(6)
    assert lines.n_lines >= 6
    assert set(r.display_patches()) == {"inlet", "wall", "outlet"}


def test_summary_and_axial(run):
    d, _ = run
    r = fieldview.RunResults(d)
    s = r.summary()
    assert s["trust"] == "trusted" and s["rows"][0][0] == "Mass flow"
    assert "7.1600 g/s" in s["rows"][0][1]
    ax = r.axial()
    assert {"centreline", "wall", "quasi_1d"} <= set(ax)


def test_report_writes_json_and_pdf(run, tmp_path):
    d, _ = run
    files = report.export(d, tmp_path / "rep")
    data = json.loads(files["json"].read_text())
    assert data["summary"]["trust"] == "trusted" and data["definition"]["name"].startswith("V1")
    assert files["pdf"].read_bytes()[:4] == b"%PDF"
    # Images are made when off-screen rendering works, and listed as missing otherwise.
    assert set(data["images"]["written"]) | {m.split(":")[0] for m in data["images"]["missing"]} >= {
        "contour_Mach", "contour_p", "contour_T", "axial"}


def _mean_difference(a: Path, b: Path) -> float:
    import matplotlib.image as mpimg

    x, y = mpimg.imread(a)[..., :3], mpimg.imread(b)[..., :3]
    assert x.shape == y.shape, (x.shape, y.shape)
    return float(np.mean(np.abs(x - y)) * 255.0)


@pytest.mark.parametrize("field", ["Mach", "p"])
def test_contour_image_matches_its_reference(run, tmp_path, field):
    """Screenshot regression: the meridian contour of the synthetic run
    against a stored image. SONICLINE_UPDATE_IMAGES=1 rewrites references."""
    d, _ = run
    out = tmp_path / f"{field}.png"
    try:  # in a child process: without usable OpenGL, VTK crashes rather than raises
        report.contour_image_isolated(d, field, out, size=(800, 350))
    except Exception as e:
        pytest.skip(f"off-screen rendering unavailable: {e}")
    ref = IMAGES / f"synthetic_contour_{field}.png"
    if os.environ.get("SONICLINE_UPDATE_IMAGES") == "1" or not ref.exists():
        IMAGES.mkdir(exist_ok=True)
        ref.write_bytes(out.read_bytes())
        if os.environ.get("SONICLINE_UPDATE_IMAGES") != "1":
            pytest.skip("reference image created")
    # Mean absolute difference per channel on a 0-255 scale; text rendering
    # varies a little between machines, the picture must not.
    assert _mean_difference(out, ref) < 2.0


def test_the_image_metric_can_tell_pictures_apart():
    a, b = IMAGES / "synthetic_contour_Mach.png", IMAGES / "synthetic_contour_p.png"
    if not (a.exists() and b.exists()):
        pytest.skip("no reference images")
    assert _mean_difference(a, b) > 10 * 2.0


def test_report_command(run, tmp_path, capsys):
    from sonicline.cli import main

    d, _ = run
    assert main(["report", str(d), "--out", str(tmp_path / "r")]) == 0
    assert "report.pdf" in capsys.readouterr().out
    assert main(["report", str(tmp_path)]) == 1  # not a run
