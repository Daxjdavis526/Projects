"""Grid convergence: observed order, Richardson extrapolation and the Grid
Convergence Index, following Celik et al., "Procedure for estimation and
reporting of uncertainty due to discretization in CFD applications",
J. Fluids Eng. 130 (2008) 078001.

Three solutions of one quantity on systematically refined meshes give:

- the observed order of accuracy p, from how fast the differences shrink;
- the extrapolated, mesh-independent value phi_ext;
- GCI_fine = 1.25 |phi_1 - phi_2| / |phi_1| / (r21^p - 1): a band around
  the finest solution that contains the mesh-independent value with about
  95 % confidence when the solutions are in the asymptotic range.

Pure arithmetic; no solver knowledge.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

SAFETY_FACTOR = 1.25  # Roache's factor for three-grid studies


@dataclass(frozen=True)
class GridStudy:
    values: tuple[float, float, float]  # phi_1 (finest), phi_2, phi_3 (coarsest)
    spacings: tuple[float, float, float]  # representative cell size h, same order
    order: float | None  # observed order p; None when it cannot be determined
    convergence: str  # "monotone", "oscillatory", "divergent" or "converged"
    extrapolated: float | None
    relative_error_fine: float  # |phi_1 - phi_2| / |phi_1|
    extrapolated_error_fine: float | None  # |phi_ext - phi_1| / |phi_ext|
    gci_fine: float | None  # relative, on phi_1

    @property
    def ratio_fine(self) -> float:
        return self.spacings[1] / self.spacings[0]

    def band(self) -> tuple[float, float] | None:
        """phi_1 +- GCI_fine, as absolute values."""
        if self.gci_fine is None:
            return None
        half = abs(self.values[0]) * self.gci_fine
        return self.values[0] - half, self.values[0] + half


def representative_spacing(cells: int, measure: float, dimensions: int) -> float:
    """h = (measure / N)^(1/D): the mean cell size of a mesh of N cells
    filling a volume (D = 3) or an area (D = 2)."""
    return (measure / cells) ** (1.0 / dimensions)


def study(values: tuple[float, float, float], spacings: tuple[float, float, float],
          tolerance: float = 1e-12) -> GridStudy:
    """``values`` and ``spacings`` ordered finest first."""
    f1, f2, f3 = values
    h1, h2, h3 = spacings
    if not h1 < h2 < h3:
        raise ValueError("spacings must increase from the finest to the coarsest mesh")
    r21, r32 = h2 / h1, h3 / h2
    e21, e32 = f2 - f1, f3 - f2
    scale = max(abs(f1), abs(f2), abs(f3), 1e-300)
    rel21 = abs(e21) / abs(f1) if f1 else math.inf

    def result(order, kind, ext, gci):
        ext_err = None if ext is None or ext == 0 else abs((ext - f1) / ext)
        return GridStudy(values, spacings, order, kind, ext, rel21, ext_err, gci)

    if abs(e21) <= tolerance * scale and abs(e32) <= tolerance * scale:
        return result(None, "converged", f1, 0.0)
    if abs(e21) <= tolerance * scale or abs(e32) <= tolerance * scale:
        # One difference vanishes: the order is undefined. Report the
        # finest value with the spread as the uncertainty.
        spread = max(abs(e21), abs(e32)) / abs(f1)
        return result(None, "oscillatory", None, SAFETY_FACTOR * spread)
    ratio = e32 / e21
    s = 1.0 if ratio > 0 else -1.0
    kind = "monotone" if 0 < e21 / e32 < 1 else ("oscillatory" if s < 0 else "divergent")
    if kind == "divergent":
        return result(None, kind, None, None)

    # Fixed-point iteration for p (Celik eq. 5): p = |ln|e32/e21| + q(p)| / ln r21,
    # q(p) = ln((r21^p - s) / (r32^p - s)).
    p = abs(math.log(abs(ratio))) / math.log(r21)
    for _ in range(200):
        try:
            q = math.log((r21**p - s) / (r32**p - s))
        except (ValueError, ZeroDivisionError, OverflowError):
            return result(None, kind, None, None)
        p_new = abs(math.log(abs(ratio)) + q) / math.log(r21)
        if abs(p_new - p) < 1e-10:
            p = p_new
            break
        p = p_new
    if kind == "oscillatory":
        # Richardson extrapolation assumes monotone convergence; the spread of
        # the three solutions is the honest uncertainty.
        spread = (max(values) - min(values)) / abs(f1)
        return result(p, kind, None, SAFETY_FACTOR * spread)
    rp = r21**p
    ext = (rp * f1 - f2) / (rp - 1.0)
    gci = SAFETY_FACTOR * rel21 / (rp - 1.0)
    return result(p, kind, ext, gci)
