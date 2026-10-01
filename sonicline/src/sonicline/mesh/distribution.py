"""One-dimensional point distributions used to build structured meshes."""

from __future__ import annotations

import math

import numpy as np
from scipy.optimize import brentq


def geometric(length: float, h0: float, h1: float, n: int | None = None) -> np.ndarray:
    """Points from 0 to ``length`` whose spacing varies geometrically from
    about ``h0`` at the start to about ``h1`` at the end.

    With ``n`` omitted the cell count follows from the mean spacing. The
    spacings are rescaled to fit ``length`` exactly, so the end spacings
    are honoured to within that rescaling.
    """
    if length <= 0.0 or h0 <= 0.0 or h1 <= 0.0:
        raise ValueError("length and spacings must be positive")
    if n is None:
        mean = h0 if abs(h1 / h0 - 1.0) < 1e-9 else (h1 - h0) / math.log(h1 / h0)
        n = max(1, round(length / mean))
    if n == 1:
        return np.array([0.0, length])
    ratio = (h1 / h0) ** (1.0 / (n - 1))
    spacing = h0 * ratio ** np.arange(n)
    spacing *= length / spacing.sum()
    return np.concatenate([[0.0], np.cumsum(spacing)])


def wall_clustered(length: float, first: float, n: int) -> np.ndarray:
    """``n`` cells over ``length`` with the first spacing exactly ``first`` at
    position ``length`` (the wall) and geometric growth away from it.

    Returned points run from 0 (away from the wall) to ``length`` (the wall).
    """
    if first * n >= length:
        # Uniform spacing is already finer than asked for at the wall.
        return np.linspace(0.0, length, n + 1)
    f = lambda r: first * (r**n - 1.0) / (r - 1.0) - length  # noqa: E731
    ratio = brentq(f, 1.0 + 1e-12, 10.0, xtol=1e-14)
    from_wall = first * ratio ** np.arange(n)  # spacings starting at the wall
    pts = length - np.concatenate([[0.0], np.cumsum(from_wall)])
    pts[-1] = 0.0
    return pts[::-1].copy()


def cells_for_wall_clustering(length: float, first: float, growth: float, cap: float) -> int:
    """Cells needed to cover ``length`` starting at ``first`` next to a wall,
    growing by ``growth`` per cell until the spacing reaches ``cap``."""
    n, covered, h = 0, 0.0, first
    while covered < length:
        covered += h
        h = min(h * growth, cap)
        n += 1
    return n


def capped_from_wall(length: float, first: float, growth: float, cap: float, n: int) -> np.ndarray:
    """``n`` cells over ``length`` measured *from* the wall (point 0 at the
    wall): spacings start at ``first``, grow by ``growth`` until ``cap``,
    then stay constant, and are rescaled to fit ``length``.

    Two such distributions with different ``first`` but the same ``n``,
    ``growth`` and ``cap`` coincide away from the wall, so blending between
    them moves only the near-wall levels.
    """
    h = np.minimum(first * growth ** np.arange(n), cap)
    h *= length / h.sum()
    return np.concatenate([[0.0], np.cumsum(h)])
