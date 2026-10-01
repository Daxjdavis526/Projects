"""The nozzle frame, and the judgements that set it, shared by the STEP
worker and the STL analyser. numpy only.

The nozzle frame has x along the thruster axis from the inlet plane towards
the exit and its origin on the axis in the inlet plane: every mesher and
post-processor works in it.
"""

from __future__ import annotations

import math

import numpy as np


def principal_axis(evals: np.ndarray, evecs: np.ndarray) -> tuple[np.ndarray, bool]:
    """The inertia axis whose moment differs most from the other two (a
    nozzle's axis of near-symmetry), and whether the other two agree (a
    body of revolution has two equal moments)."""
    distinct = [min(abs(evals[i] - evals[j]) for j in range(3) if j != i) for i in range(3)]
    i = int(np.argmax(distinct))
    others = [evals[j] for j in range(3) if j != i]
    axis = np.asarray(evecs[:, i], dtype=float)
    return axis / np.linalg.norm(axis), abs(others[0] - others[1]) <= 1e-3 * max(abs(others[0]), 1e-300)


def perpendicular(axis: np.ndarray) -> np.ndarray:
    helper = np.array([1.0, 0.0, 0.0]) if abs(axis[0]) < 0.9 else np.array([0.0, 1.0, 0.0])
    u = np.cross(axis, helper)
    return u / np.linalg.norm(u)


def choose_inlet_end(rows: list[tuple[float, float]], s_t: float, r_t: float,
                     inlet_end: str) -> tuple[str, str, list[str]]:
    """Which end of the axis the inlet is at: the converging side of a
    thruster nozzle is steeper than the diverging side. Returns the end,
    the confidence ("high", "low" or "user") and warnings."""
    arr = np.array(sorted(rows))
    slope = np.abs(np.gradient(arr[:, 1], arr[:, 0]))
    near = np.abs(arr[:, 0] - s_t) < 3.0 * r_t
    up = slope[(arr[:, 0] < s_t) & near]
    down = slope[(arr[:, 0] > s_t) & near]
    steep_min = up.mean() if len(up) else 0.0
    steep_max = down.mean() if len(down) else 0.0
    guess = "min" if steep_min >= steep_max else "max"
    ratio = max(steep_min, steep_max) / max(min(steep_min, steep_max), 1e-12)
    warnings = []
    if inlet_end in ("min", "max"):
        if inlet_end != guess and ratio > 1.5:
            warnings.append(f"the inlet was set at the {inlet_end} end, but the steeper "
                            "(converging) wall is at the other end")
        return inlet_end, "user", warnings
    if ratio <= 1.5:
        warnings.append("the inlet end could not be identified confidently; "
                        "confirm it (inlet_end in the definition)")
    return guess, ("high" if ratio > 1.5 else "low"), warnings


def nozzle_profile(rows: list[tuple[float, float]], s_min: float, s_max: float,
                   inlet_end: str) -> list[tuple[float, float]]:
    """Section rows (axial position from the centroid, radius) in the
    nozzle frame."""
    if inlet_end == "min":
        return sorted((s - s_min, r) for s, r in rows)
    return sorted((s_max - s, r) for s, r in rows)


def to_nozzle_frame(origin, direction, extent, inlet_end: str) -> np.ndarray:
    """4x4 transform from the file's frame (metres) to the nozzle frame.
    ``origin`` is the point on the axis the extent is measured from (the
    centroid), ``extent`` the axial (min, max) of the body."""
    a = np.asarray(direction, dtype=float)
    a = a / np.linalg.norm(a)
    s0 = extent[0] if inlet_end == "min" else extent[1]
    ex = a if inlet_end == "min" else -a
    ey = perpendicular(ex)
    ez = np.cross(ex, ey)
    o = np.asarray(origin, dtype=float) + s0 * a
    R = np.vstack([ex, ey, ez])
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = -R @ o
    return T


def equivalent_radius(area: float) -> float:
    return math.sqrt(max(area, 0.0) / math.pi)


def end_face_axis(planes: list[tuple[np.ndarray, np.ndarray, float]], points: np.ndarray,
                  span: float) -> tuple[np.ndarray, np.ndarray] | None:
    """The thruster axis from its end faces: two parallel planar faces at
    the two extremes of the body along their common normal, the line
    through their centroids along that normal. It is what defines a
    nozzle's axis even when a side port or a boss skews the inertia
    tensor. ``planes`` holds (normal, centroid, area) per planar face.
    Returns (unit axis, a point on it) for the widest-apart pair, or None."""
    tol = 1e-6 * span
    best = None
    for i in range(len(planes)):
        ni, ci, _ = planes[i]
        for j in range(i + 1, len(planes)):
            nj, cj, _ = planes[j]
            if abs(abs(float(ni @ nj)) - 1.0) > 1e-6:
                continue
            d = cj - ci
            length = float(np.linalg.norm(d))
            if length < tol:
                continue
            u = d / length
            if abs(abs(float(u @ ni)) - 1.0) > 1e-6:
                continue  # offset sideways: not coaxial end faces
            proj = points @ u
            if abs(float(ci @ u) - proj.min()) > tol or abs(float(cj @ u) - proj.max()) > tol:
                continue
            if best is None or length > best[0]:
                best = (length, u, ci)
    if best is None:
        return None
    return best[1], best[2]
