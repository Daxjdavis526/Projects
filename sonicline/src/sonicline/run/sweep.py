"""Design sweeps: one definition over a grid of parameter values.

Each axis is a dotted path into the definition's JSON (the same paths the
desktop editor uses) and a list of values, written as the definition would
write them: numbers in SI or strings with units ("5 bar", "0.8 mm"). The
sweep runs every combination (the Cartesian product of the axes).

Every point is built through the editor's draft, so it is parsed and
validated exactly as a definition file would be, and carries the quasi-1D
prediction beside the CFD. A point whose definition is invalid is listed,
not run. With ``predict_only`` nothing is run: the table is quasi-1D theory
(with the Kliegel-Levine Cd), in seconds, for choosing which points deserve
CFD.

Each CFD point reports its value with the run's own uncertainty budget
(core.uncertainty) and its trust verdict. A point that is not trustworthy
is kept in the table, marked, and left out of the plot: a sweep is read as
a trend, and a bad point would draw a false one.
"""

from __future__ import annotations

import csv
import dataclasses
import io
import itertools
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from ..core import model as d
from ..project.draft import Draft
from . import pipeline

# (key, label, path into metrics.json, uncertainty key)
QUANTITIES: tuple[tuple[str, str, tuple[str, ...], str | None], ...] = (
    ("mass_flow", "mass flow [g/s]", ("mass_flow", "inlet"), "mass_flow"),
    ("thrust", "thrust [N]", ("thrust", "total"), "thrust"),
    ("specific_impulse", "Isp [s]", ("specific_impulse", "cfd"), "specific_impulse"),
    ("discharge_coefficient", "Cd", ("discharge_coefficient", "cfd"), None),
    ("p0", "chamber p0 [bar]", ("conditions", "p0"), None),
)
SCALE = {"mass_flow": 1e3, "p0": 1e-5}  # SI to the table's units
MAX_POINTS = 200


class SweepError(ValueError):
    """The sweep itself is malformed (not one of its points)."""


@dataclass
class Axis:
    path: str
    values: list

    @staticmethod
    def parse(text: str) -> "Axis":
        """``path=v1,v2,...``. A value that reads as a number is a number;
        anything else (``5 bar``) is passed to the definition as written."""
        if "=" not in text:
            raise SweepError(f"{text!r}: an axis is path=value,value,... "
                             "(for example boundaries.inlet.p0=5 bar,10 bar)")
        path, raw = text.split("=", 1)
        path = path.strip()
        values = [_value(v.strip()) for v in raw.split(",") if v.strip()]
        if not path or not values:
            raise SweepError(f"{text!r}: needs a path and at least one value")
        return Axis(path, values)


def _value(text: str):
    try:
        return int(text) if re.fullmatch(r"[+-]?\d+", text) else float(text)
    except ValueError:
        return text


@dataclass
class Point:
    index: int
    settings: dict[str, object]  # path -> value as given
    si: dict[str, float | None] = field(default_factory=dict)  # path -> the parsed value, SI
    error: str | None = None  # the definition is invalid: not run
    prediction: dict | None = None
    run_dir: str | None = None
    status: str | None = None
    trust: str | None = None
    values: dict[str, float | None] = field(default_factory=dict)
    uncertainty: dict[str, float | None] = field(default_factory=dict)  # absolute, same units


@dataclass
class SweepResult:
    axes: list[Axis]
    points: list[Point]
    predict_only: bool

    @property
    def ok(self) -> bool:
        return all(p.error is None and (self.predict_only or p.trust in ("trusted", "trusted_with_warnings"))
                   for p in self.points)


def _get(metrics: dict | None, path: tuple[str, ...]):
    for k in path:
        if not isinstance(metrics, dict) or k not in metrics:
            return None
        metrics = metrics[k]
    return metrics


def _slug(settings: dict) -> str:
    parts = []
    for path, v in settings.items():
        key = path.rsplit(".", 1)[-1]
        parts.append(f"{key}={v}")
    return re.sub(r"[^A-Za-z0-9=._-]+", "", "_".join(parts))[:80]


def build_points(base: dict, axes: list[Axis]) -> list[tuple[Point, d.SimulationDefinition | None]]:
    """Every combination of the axes, each parsed, validated and predicted."""
    from ..core.validate import Severity

    n = 1
    for a in axes:
        n *= len(a.values)
    if n > MAX_POINTS:
        raise SweepError(f"{n} points; a sweep is limited to {MAX_POINTS}")
    out = []
    for i, combo in enumerate(itertools.product(*(a.values for a in axes))):
        draft = Draft(base)
        settings = {}
        for a, v in zip(axes, combo):
            draft.set(a.path, v)
            settings[a.path] = v
        point = Point(i, settings)
        assessment = draft.assess()
        if assessment.definition is None:
            point.error = assessment.error
        else:
            parsed = Draft.from_definition(assessment.definition)
            point.si = {path: (v if isinstance(v := parsed.get(path), (int, float)) else None)
                        for path in settings}
            errors = [f.message for f in assessment.findings if f.severity is Severity.ERROR]
            if errors:
                point.error = "; ".join(errors)
        p = assessment.prediction
        if p is not None:
            point.prediction = {"mass_flow": p.mass_flow_cd if p.mass_flow_cd else p.mass_flow,
                                "thrust": p.thrust, "specific_impulse": p.isp, "p0": p.p0,
                                "regime": p.regime, "exit_mach": p.exit_mach}
        out.append((point, assessment.definition if point.error is None else None))
    # A misspelt path fails every point the same way: that is the sweep's
    # error, not its points'.
    errors = {p.error for p, _ in out}
    if len(out) > 1 and len(errors) == 1 and None not in errors:
        raise SweepError(f"every point is invalid: {errors.pop()}")
    return out


def run(base: d.SimulationDefinition | dict, axes: list[Axis], out: Path, predict_only: bool = False,
        processors: int | None = None, on_event: Callable | None = None, base_dir: Path | None = None,
        runner: Callable = pipeline.run) -> SweepResult:
    if not axes:
        raise SweepError("a sweep needs at least one axis")
    data = json.loads(d.dumps(base)) if isinstance(base, d.SimulationDefinition) else base
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    points = []
    for point, defn in build_points(data, axes):
        points.append(point)
        if predict_only or defn is None:
            continue
        if processors:
            defn = dataclasses.replace(defn, numerics=dataclasses.replace(defn.numerics, processors=processors))
        run_dir = out / f"p{point.index:03d}-{_slug(point.settings)}"
        if on_event:
            on_event(pipeline.Event("sweep", f"point {point.index + 1}: "
                                    + ", ".join(f"{k} = {v}" for k, v in point.settings.items())))
        r = runner(defn, run_dir, on_event=on_event, render=False, base_dir=base_dir)
        point.run_dir, point.status, point.trust = str(r.run_dir), r.status, r.trust
        for key, _, path, ukey in QUANTITIES:
            point.values[key] = _get(r.metrics, path)
            point.uncertainty[key] = _get(r.metrics, ("uncertainty", ukey, "absolute")) if ukey else None
    result = SweepResult(axes, points, predict_only)
    (out / "sweep.json").write_text(json.dumps(dataclasses.asdict(result), indent=2) + "\n", encoding="utf-8")
    (out / "sweep.csv").write_text(to_csv(result), encoding="utf-8", newline="")
    (out / "sweep.md").write_text(markdown(result), encoding="utf-8")
    plot(result, out / "sweep.png")
    return result


def _scaled(key: str, v):
    return None if v is None else v * SCALE.get(key, 1.0)


def _fmt(v, digits: int = 5) -> str:
    return "" if v is None else f"{v:.{digits}g}"


def to_csv(s: SweepResult) -> str:
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    header = [a.path for a in s.axes] + ["status", "trust"]
    for key, label, _, _ in QUANTITIES:
        header += [f"{label} CFD", f"{label} ±95%", f"{label} quasi-1D"]
    w.writerow(header + ["error"])
    for p in s.points:
        row = [p.settings[a.path] for a in s.axes] + [p.status or "", p.trust or ""]
        for key, _, _, _ in QUANTITIES:
            pred = (p.prediction or {}).get(key)
            row += [_fmt(_scaled(key, p.values.get(key)), 8), _fmt(_scaled(key, p.uncertainty.get(key)), 3),
                    _fmt(_scaled(key, pred), 8)]
        w.writerow(row + [p.error or ""])
    return buf.getvalue()


def markdown(s: SweepResult) -> str:
    cols = [a.path.rsplit(".", 1)[-1] for a in s.axes]
    shown = ("mass_flow", "thrust", "specific_impulse", "p0")
    labels = {k: lab for k, lab, _, _ in QUANTITIES}
    title = "Design sweep (quasi-1D prediction only)" if s.predict_only else "Design sweep"
    lines = [title, "", "| " + " | ".join(cols + [labels[k] for k in shown] + ["1D regime", "verdict"]) + " |",
             "|" + "---|" * (len(cols) + len(shown) + 2)]
    for p in s.points:
        cells = [str(p.settings[a.path]) for a in s.axes]
        for k in shown:
            pred = _scaled(k, (p.prediction or {}).get(k))
            if s.predict_only or p.error:
                cells.append(_fmt(pred))
                continue
            v, u = _scaled(k, p.values.get(k)), _scaled(k, p.uncertainty.get(k))
            text = _fmt(v) + (f" ± {_fmt(u, 2)}" if u else "")
            cells.append(f"{text} (1D {_fmt(pred, 4)})" if pred is not None and v is not None else text)
        verdict = (f"invalid: {p.error}" if p.error else "not run" if s.predict_only
                   else ("**NOT TRUSTWORTHY**" if p.trust == "not_trustworthy" else p.trust or p.status or ""))
        regime = str((p.prediction or {}).get("regime") or "").replace("_", " ")
        lines.append("| " + " | ".join(cells + [regime, verdict]) + " |")
    lines.append("")
    if not s.predict_only:
        lines.append("± is each run's 95 % uncertainty budget; (1D ...) is quasi-1D theory with the "
                     "Kliegel-Levine Cd. Points that are not trustworthy are left out of the plot.")
    return "\n".join(lines) + "\n"


# Axis display units by the field's name: (scale from SI, unit).
DISPLAY = {"p0": (1e-5, "bar"), "pressure": (1e-5, "bar"), "throat_radius": (1e3, "mm"),
           "T0": (1.0, "K"), "temperature": (1.0, "K"), "mass_flow": (1e3, "g/s")}


def _display(path: str) -> tuple[float, str]:
    return DISPLAY.get(path.rsplit(".", 1)[-1], (1.0, ""))


def plot(s: SweepResult, path: Path) -> Path | None:
    """Thrust and Isp against the first axis, one line per value of the
    others, with error bars; quasi-1D dashed. Skipped without matplotlib
    (the post extra) or when the first axis is not numeric."""
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return None
    first = s.axes[0]
    scale, unit = _display(first.path)
    numeric = all(p.si.get(first.path) is not None for p in s.points)

    def x(p: Point) -> float:
        return p.si[first.path] * scale if numeric else first.values.index(p.settings[first.path])

    groups: dict[tuple, list[Point]] = {}
    for p in s.points:
        key = tuple(p.settings[a.path] for a in s.axes[1:])
        groups.setdefault(key, []).append(p)
    fig, axs = plt.subplots(1, 2, figsize=(10, 4))
    for ax, key in zip(axs, ("thrust", "specific_impulse")):
        for gkey, pts in groups.items():
            label = ", ".join(f"{a.path.rsplit('.', 1)[-1]} {v}" for a, v in zip(s.axes[1:], gkey)) or None
            good = [p for p in pts if p.values.get(key) is not None and p.trust != "not_trustworthy"]
            if good:
                line = ax.errorbar([x(p) for p in good], [p.values[key] for p in good],
                                   yerr=[p.uncertainty.get(key) or 0.0 for p in good], marker="o",
                                   capsize=3, label=label)
                colour = line[0].get_color()
            else:
                colour = None
            pred = [p for p in pts if (p.prediction or {}).get(key) is not None]
            if pred:
                ax.plot([x(p) for p in pred], [p.prediction[key] for p in pred],
                        linestyle="--", color=colour, alpha=0.7,
                        label=None if good else (f"{label} (quasi-1D)" if label else "quasi-1D"))
        ax.set_xlabel(first.path.rsplit(".", 1)[-1] + (f" [{unit}]" if numeric and unit else ""))
        ax.set_ylabel("thrust [N]" if key == "thrust" else "Isp [s]")
        if not numeric:
            ax.set_xticks(range(len(first.values)), [str(v) for v in first.values])
        ax.grid(alpha=0.3)
    if len(s.axes) > 1:
        axs[0].legend(fontsize=8)
    fig.suptitle("Design sweep: CFD with 95 % uncertainty; dashed: quasi-1D")
    fig.tight_layout()
    fig.savefig(path, dpi=120)
    plt.close(fig)
    return path
