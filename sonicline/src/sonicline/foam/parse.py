"""Read what OpenFOAM writes: function-object tables, checkMesh reports,
solver logs and ASCII field files."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

import numpy as np

_NUMBER = r"[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?"


@dataclass
class Table:
    columns: list[str]
    time: np.ndarray
    values: dict[str, np.ndarray]  # column -> (n,) scalars or (n, 3) vectors

    def last(self, column: str):
        return self.values[column][-1]


def _parse_cell(token: str):
    token = token.strip()
    if token.startswith("("):
        return [float(v) for v in re.findall(_NUMBER, token)]
    try:
        return float(token)
    except ValueError:
        return token


def read_table(fo_dir: Path, filename: str | None = None) -> Table | None:
    """Read a function object's .dat output across restarts.

    OpenFOAM writes one sub-directory per start time; later rows win when
    times overlap. A half-written final line (the solver is still running)
    is ignored. Function objects that write several files into one
    directory (``forces`` writes force.dat and moment.dat) need
    ``filename``; otherwise the directory must hold a single .dat file.
    """
    if not fo_dir.is_dir():
        return None
    starts = sorted((d for d in fo_dir.iterdir() if d.is_dir()), key=lambda d: float(d.name))
    columns: list[str] | None = None
    rows: dict[float, list] = {}
    for start in starts:
        dats = sorted(start.glob(filename or "*.dat"))
        if len(dats) > 1:
            raise ValueError(f"{start} holds {len(dats)} tables; name the one to read")
        for dat in dats:
            text = dat.read_text(encoding="utf-8", errors="replace")
            lines = text.split("\n")
            complete = lines[:-1] if not text.endswith("\n") else lines
            for line in complete:
                if not line.strip():
                    continue
                if line.startswith("#"):
                    header = line.lstrip("#").strip()
                    if header.startswith("Time"):
                        cols = [c.strip() for c in re.split(r"\t+", header) if c.strip()]
                        columns = cols
                    continue
                cells = re.findall(r"\([^)]*\)|[^\s()]+", line)
                try:
                    t = float(cells[0])
                except ValueError:
                    continue
                rows[t] = [_parse_cell(c) for c in cells[1:]]
    if columns is None or not rows:
        return None
    times = np.array(sorted(rows))
    data = [rows[t] for t in times]
    width = min(len(r) for r in data)
    values: dict[str, np.ndarray] = {}
    names = columns[1:]
    if len(names) != width:  # force.dat: grouped vector headers, scalar columns
        names = _expand_force_columns(columns[1:], width)
    for i, name in enumerate(names[:width]):
        col = [r[i] for r in data]
        if isinstance(col[0], str):
            continue
        values[name] = np.array(col, dtype=float)
    return Table(names[:width], times, values)


def _expand_force_columns(headers: list[str], width: int) -> list[str]:
    names = []
    for h in headers:
        names += h.split()
    return names if len(names) == width else [f"c{i}" for i in range(width)]


# ----------------------------------------------------------------------------- checkMesh


@dataclass
class MeshCheck:
    cells: int
    max_non_orthogonality: float
    max_skewness: float
    max_aspect_ratio: float
    min_determinant: float | None
    regions: int
    failed_checks: int
    messages: list[str]
    raw: dict


def read_checkmesh(case: Path, log_text: str) -> MeshCheck:
    """Prefer checkMesh's JSON report (ESI >= v2312); fall back to the log."""
    raw: dict = {}
    js = case / "checkMesh.json"
    if js.is_file():
        try:
            raw = json.loads(js.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            raw = {}

    def find(pattern, cast=float, default=None):
        m = re.search(pattern, log_text)
        return cast(m.group(1)) if m else default

    cells = find(r"cells:\s+(\d+)", int, 0)
    nonortho = find(r"non-orthogonality Max:\s*(" + _NUMBER + ")", float, float("nan"))
    skew = find(r"Max skewness = (" + _NUMBER + ")", float, float("nan"))
    aspect = find(r"Max aspect ratio[:=]\s*(" + _NUMBER + ")", float, float("nan"))
    determinant = find(r"Cell determinant \(wellposedness\) : minimum: (" + _NUMBER + ")", float)
    regions = find(r"Number of regions: (\d+)", int, 1)
    failed = find(r"Failed (\d+) mesh checks", int, 0)
    messages = [ln.strip().lstrip("*") for ln in log_text.splitlines() if ln.strip().startswith("***")]
    return MeshCheck(cells, nonortho, skew, aspect, determinant, regions, failed, messages, raw)


# ----------------------------------------------------------------------------- fields


def latest_time(case: Path) -> str | None:
    times = []
    for d in case.iterdir():
        if d.is_dir():
            try:
                times.append((float(d.name), d.name))
            except ValueError:
                pass
    times.sort()
    return times[-1][1] if times and times[-1][0] > 0 else None


def _read_list(text: str, start: int) -> tuple[np.ndarray, int]:
    """Parse ``N ( ... )`` beginning at ``start``; returns array and end."""
    m = re.compile(r"\s*(\d+)\s*\(").match(text, start)
    if not m:
        raise ValueError("expected a counted list")
    n = int(m.group(1))
    body_start = m.end()
    if text[body_start:body_start + 20].lstrip().startswith("("):  # vectors
        end = body_start
        depth = 1
        while depth:
            c = text[end]
            depth += c == "("
            depth -= c == ")"
            end += 1
        vals = np.array(re.findall(_NUMBER, text[body_start:end - 1]), dtype=float).reshape(n, -1)
        return vals, end
    end = text.index(")", body_start)
    vals = np.array(text[body_start:end].split(), dtype=float)
    return vals, end + 1


def read_field(path: Path) -> tuple[np.ndarray, dict[str, np.ndarray]]:
    """Internal field and per-patch ``value`` arrays of an ASCII field file."""
    text = path.read_text(encoding="utf-8", errors="replace")
    m = re.search(r"internalField\s+(uniform|nonuniform)", text)
    if m.group(1) == "uniform":
        um = re.compile(r"\s*(\([^)]*\)|" + _NUMBER + r")").match(text, m.end())
        internal = np.array(re.findall(_NUMBER, um.group(1)), dtype=float)
    else:
        lm = re.compile(r"\s*List<\w+>").match(text, m.end())
        internal, _ = _read_list(text, lm.end())
    patches: dict[str, np.ndarray] = {}
    bf = text.find("boundaryField")
    for pm in re.finditer(r"\n\s{4}(\w+)\s*\n\s{4}\{", text[bf:]):
        name = pm.group(1)
        block_start = bf + pm.end()
        block_end = text.find("\n    }", block_start)
        block = text[block_start:block_end]
        vm = re.search(r"\bvalue\s+nonuniform\s+List<\w+>", block)
        if vm:
            arr, _ = _read_list(text, block_start + vm.end())
            patches[name] = arr
        else:
            um = re.search(r"\bvalue\s+uniform\s+(\([^)]*\)|" + _NUMBER + ")", block)
            if um:
                patches[name] = np.array(re.findall(_NUMBER, um.group(1)), dtype=float)
    return internal, patches


# ----------------------------------------------------------------------------- logs

def log_failure(text: str) -> str | None:
    """The first line that marks a solver failure, if any."""
    for line in text.splitlines():
        # "trapFpe: Floating point exception trapping enabled" is a banner line.
        if "FOAM FATAL" in line or "printStack" in line or "sigFpe::sigHandler" in line:
            return line.strip()
        if re.search(r"\bnan\b", line, re.IGNORECASE) and "Solving for" in line:
            return line.strip()
    return None
