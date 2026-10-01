"""Deterministic writer for OpenFOAM dictionaries and field files.

Python dicts keep insertion order, floats are written with the shortest
repr that round-trips, and nothing depends on time or environment, so the
same input always produces byte-identical files.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np

BANNER = "// Written by SONICLINE. Generated file: edit the simulation definition, not this.\n"


@dataclass(frozen=True)
class Raw:
    """Emit text verbatim (e.g. ``#includeEtc`` or ``$var``)."""

    text: str


def fmt_scalar(v) -> str:
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, np.integer)):
        return str(int(v))
    if isinstance(v, (float, np.floating)):
        f = float(v)
        if f == int(f) and abs(f) < 1e15:
            return f"{int(f)}"
        return repr(f)
    return str(v)


def fmt_value(v) -> str:
    if isinstance(v, Raw):
        return v.text
    if isinstance(v, (list, tuple, np.ndarray)):
        return "(" + " ".join(fmt_value(x) for x in v) + ")"
    return fmt_scalar(v)


def render(d: dict, indent: int = 0) -> str:
    pad = "    " * indent
    out = []
    for key, val in d.items():
        if isinstance(val, dict):
            out.append(f"{pad}{key}\n{pad}{{\n{render(val, indent + 1)}{pad}}}\n")
        elif val is None:
            out.append(f"{pad}{key};\n")
        else:
            out.append(f"{pad}{key:<16}{fmt_value(val)};\n" if len(key) < 16 else
                       f"{pad}{key} {fmt_value(val)};\n")
    return "".join(out)


def header(cls: str, obj: str, location: str | None = None) -> str:
    loc = f"    location    \"{location}\";\n" if location else ""
    return (
        BANNER
        + "FoamFile\n{\n    version     2.0;\n    format      ascii;\n"
        + f"    arch        \"LSB;label=32;scalar=64\";\n    class       {cls};\n{loc}"
        + f"    object      {obj};\n}}\n\n"
    )


def write_dict(path: Path, obj: str, body: dict, cls: str = "dictionary", location: str | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(header(cls, obj, location) + render(body), encoding="utf-8", newline="\n")


def _nonuniform(values: np.ndarray) -> str:
    values = np.asarray(values, dtype=float)
    if values.ndim == 1:
        body = "\n".join(repr(float(v)) for v in values)
        return f"nonuniform List<scalar>\n{len(values)}\n(\n{body}\n)"
    body = "\n".join("(" + " ".join(repr(float(c)) for c in row) + ")" for row in values)
    return f"nonuniform List<vector>\n{len(values)}\n(\n{body}\n)"


def field_value(v) -> Raw:
    """``uniform x`` for scalars/3-tuples, ``nonuniform List<...>`` for arrays."""
    arr = np.asarray(v, dtype=float)
    if arr.ndim == 0 or (arr.ndim == 1 and arr.shape[0] == 3 and not isinstance(v, np.ndarray)):
        return Raw("uniform " + fmt_value(v if arr.ndim == 0 else list(v)))
    return Raw(_nonuniform(arr))


def write_field(path: Path, name: str, cls: str, dimensions: str, internal, boundary: dict) -> None:
    body = {
        "dimensions": Raw(dimensions),
        "internalField": field_value(internal),
        "boundaryField": boundary,
    }
    write_dict(path, name, body, cls=cls, location=path.parent.name)
