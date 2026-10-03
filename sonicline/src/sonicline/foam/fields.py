"""Edit the fields of a stopped OpenFOAM run: the convergence aids of
run.acceleration act through these, and slip-wall fields that OpenFOAM
writes back unreadable are repaired here."""

from __future__ import annotations

import re
from pathlib import Path

import numpy as np

from . import parse


def _scale_internal(path: Path, factor: float, mask: np.ndarray) -> int:
    """Multiply the masked cells of a scalar field's internal field by
    ``factor``; returns the number of cells changed."""
    text = path.read_text(encoding="utf-8")
    m = re.search(r"internalField\s+(uniform|nonuniform)", text)
    if m is None:
        raise ValueError(f"{path}: no internalField")
    if m.group(1) == "uniform":
        um = re.compile(r"\s*(" + parse._NUMBER + r")\s*;").match(text, m.end())
        values = np.full(len(mask), float(um.group(1)))
        end = um.end()
    else:
        lm = re.compile(r"\s*List<scalar>").match(text, m.end())
        values, list_end = parse._read_list(text, lm.end())
        end = text.index(";", list_end) + 1
    if len(values) != len(mask):
        raise ValueError(f"{path}: {len(values)} cells, mask has {len(mask)}")
    values = values.copy()
    values[mask] *= factor
    body = "\n".join(f"{v:.12g}" for v in values)
    text = (text[:m.start()] + f"internalField   nonuniform List<scalar> \n{len(values)}\n(\n{body}\n)\n;"
            + text[end:])
    path.write_text(text, encoding="utf-8", newline="\n")
    return int(mask.sum())


def _labels(path: Path) -> np.ndarray:
    text = path.read_text(encoding="utf-8", errors="replace")
    body = text[text.index("}", text.index("FoamFile")) + 1:] if "FoamFile" in text else text
    m = re.search(r"(\d+)\s*\(", body)
    start = m.end()
    return np.array(body[start:body.index(")", start)].split(), dtype=np.int64)


def scale_pressure(case: Path, factor: float, region: np.ndarray) -> dict:
    """Scale p by ``factor`` in the cells where ``region`` (one flag per
    cell of the whole mesh) is set, at the latest written time: in every
    processor directory of a decomposed case, otherwise in the case itself.
    Temperature and velocity are left alone, so density scales with the
    pressure; rhoCentralFoam rebuilds rho, rhoU and rhoE from p, T and U
    when it starts."""
    region = np.asarray(region, dtype=bool)
    procs = sorted(case.glob("processor[0-9]*"), key=lambda p: int(p.name[9:]))
    changed = 0
    time = None
    if procs:
        for proc in procs:
            time = parse.latest_time(proc)
            if time is None:
                raise ValueError(f"{proc}: no written time to correct")
            addressing = _labels(proc / "constant" / "polyMesh" / "cellProcAddressing")
            changed += _scale_internal(proc / time / "p", factor, region[addressing])
    else:
        time = parse.latest_time(case)
        if time is None:
            raise ValueError(f"{case}: no written time to correct")
        changed = _scale_internal(case / time / "p", factor, region)
    return {"time": time, "cells": changed}


# OpenFOAM v2512's smoluchowskiJumpT loses its field names when copied (the
# copy constructor skips them), so reconstructPar writes ``U ;`` and three
# more empty entries into T on a slip wall, which no OpenFOAM reader accepts
# back (DESIGN.md finding 81). The solver's own processor files are intact.
_EMPTY_NAME = re.compile(r"^[ \t]+(U|rho|psi|mu)[ \t]+;[ \t]*\n", re.M)


def repair_reconstructed(case: Path) -> list[str]:
    """Remove the empty name entries from the latest reconstructed time;
    returns the files changed."""
    time = parse.latest_time(case)
    if time is None:
        return []
    changed = []
    for f in sorted((case / time).iterdir()):
        if not f.is_file():
            continue
        text = f.read_text(encoding="utf-8", errors="replace")
        if "smoluchowskiJumpT" not in text:
            continue
        fixed = _EMPTY_NAME.sub("", text)
        if fixed != text:
            f.write_text(fixed, encoding="utf-8", newline="\n")
            changed.append(f.name)
    return changed
