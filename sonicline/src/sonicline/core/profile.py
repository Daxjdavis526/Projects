"""Axisymmetric nozzle wall profiles r(x).

A profile is a chain of exact segments (straight lines and circular arcs) in
the meridional (x, r) plane, running from the inlet at the smallest x to the
exit at the largest. The same object feeds the quasi-1D theory, the
structured mesh generator and the STEP writer, so all three see identical
geometry.

:func:`conical` builds the standard conical nozzle: a cylindrical chamber, a
fillet into a converging cone, a circular throat with separate upstream and
downstream radii, and a diverging cone. Profiles recovered from CAD arrive as
polylines via :func:`from_points`.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Union


@dataclass(frozen=True)
class Line:
    x0: float
    r0: float
    x1: float
    r1: float

    def radius(self, x: float) -> float:
        t = (x - self.x0) / (self.x1 - self.x0)
        return self.r0 + t * (self.r1 - self.r0)

    def slope(self, x: float) -> float:
        return (self.r1 - self.r0) / (self.x1 - self.x0)


@dataclass(frozen=True)
class Arc:
    """Arc of a circle centred at (xc, rc) with radius ``R``, spanning
    x in [x0, x1]. ``upper`` selects the branch above the centre (r > rc),
    which is the one a throat uses; a chamber fillet uses the lower branch."""

    xc: float
    rc: float
    R: float
    x0: float
    x1: float
    upper: bool

    def radius(self, x: float) -> float:
        d = max(self.R * self.R - (x - self.xc) ** 2, 0.0)
        return self.rc + math.sqrt(d) if self.upper else self.rc - math.sqrt(d)

    def slope(self, x: float) -> float:
        d = math.sqrt(max(self.R * self.R - (x - self.xc) ** 2, 1e-300))
        s = -(x - self.xc) / d
        return s if self.upper else -s


Segment = Union[Line, Arc]


@dataclass(frozen=True)
class Profile:
    segments: tuple[Segment, ...]
    # Throat location and upstream wall curvature radius, when known exactly
    # from construction; otherwise estimated from the geometry.
    throat_x: float
    throat_radius: float
    throat_curvature_upstream: float | None = None

    def __post_init__(self) -> None:
        if not self.segments:
            raise ValueError("a profile needs at least one segment")
        for a, b in zip(self.segments, self.segments[1:]):
            if abs(a.x1 - b.x0) > 1e-12 * max(1.0, abs(a.x1)):
                raise ValueError("profile segments are not contiguous in x")
        for s in self.segments:
            if not s.x1 > s.x0:
                raise ValueError("profile x must increase along every segment")

    @property
    def x_inlet(self) -> float:
        return self.segments[0].x0

    @property
    def x_exit(self) -> float:
        return self.segments[-1].x1

    def _segment(self, x: float) -> Segment:
        if x < self.x_inlet - 1e-12 or x > self.x_exit + 1e-12:
            raise ValueError(f"x = {x} is outside the profile")
        for s in self.segments:
            if x <= s.x1:
                return s
        return self.segments[-1]

    def radius(self, x: float) -> float:
        return self._segment(x).radius(x)

    def slope(self, x: float) -> float:
        return self._segment(x).slope(x)

    def area(self, x: float) -> float:
        return math.pi * self.radius(x) ** 2

    @property
    def throat_area(self) -> float:
        return math.pi * self.throat_radius**2

    @property
    def inlet_radius(self) -> float:
        return self.radius(self.x_inlet)

    @property
    def exit_radius(self) -> float:
        return self.radius(self.x_exit)

    @property
    def expansion_ratio(self) -> float:
        return (self.exit_radius / self.throat_radius) ** 2

    @property
    def contraction_ratio(self) -> float:
        return (self.inlet_radius / self.throat_radius) ** 2

    @property
    def rc_over_rt(self) -> float | None:
        c = self.throat_curvature_upstream
        return None if c is None else c / self.throat_radius

    def sample(self, n_per_segment: int = 64) -> list[tuple[float, float]]:
        """Points along the wall, including every segment end exactly."""
        pts: list[tuple[float, float]] = []
        for s in self.segments:
            for i in range(n_per_segment):
                x = s.x0 + (s.x1 - s.x0) * i / n_per_segment
                pts.append((x, s.radius(x)))
        last = self.segments[-1]
        pts.append((last.x1, last.radius(last.x1)))
        return pts


def conical(
    throat_radius: float,
    expansion_ratio: float,
    contraction_ratio: float = 9.0,
    converging_half_angle: float = math.radians(45.0),
    diverging_half_angle: float = math.radians(15.0),
    throat_rc_upstream: float = 1.5,
    throat_rc_downstream: float = 0.382,
    fillet_radius: float = 1.0,
    chamber_length: float = 2.0,
) -> Profile:
    """Standard conical CD nozzle with the throat at x = 0.

    Curvature radii and the chamber length are given as multiples of the
    throat radius, following the common 1.5 Rt / 0.382 Rt throat (Sutton &
    Biblarz, ch. 3). ``expansion_ratio`` = 1 gives a converging-only nozzle
    ending at the throat.
    """
    Rt = throat_radius
    if Rt <= 0.0 or expansion_ratio < 1.0 or contraction_ratio <= 1.0:
        raise ValueError("need Rt > 0, expansion ratio >= 1, contraction ratio > 1")
    tc, td = converging_half_angle, diverging_half_angle
    if not (0.0 < tc < math.pi / 2 and 0.0 < td < math.pi / 2):
        raise ValueError("half-angles must lie in (0, 90) degrees")
    Ru, Rd, Rf = throat_rc_upstream * Rt, throat_rc_downstream * Rt, fillet_radius * Rt
    Rch = Rt * math.sqrt(contraction_ratio)
    Re = Rt * math.sqrt(expansion_ratio)

    # Upstream throat arc: centre (0, Rt + Ru), from angle tc back to 0.
    p1 = (-Ru * math.sin(tc), Rt + Ru * (1.0 - math.cos(tc)))
    # Chamber fillet: lower-branch arc of radius Rf tangent to r = Rch.
    p2_r = Rch - Rf * (1.0 - math.cos(tc))
    if p2_r <= p1[1]:
        raise ValueError(
            "contraction ratio too small for these fillet and throat radii: "
            "the converging cone would have negative length"
        )
    p2 = (p1[0] - (p2_r - p1[1]) / math.tan(tc), p2_r)
    xf = p2[0] - Rf * math.sin(tc)  # fillet start, where the chamber ends
    x_in = xf - chamber_length * Rt

    segs: list[Segment] = [
        Line(x_in, Rch, xf, Rch),
        Arc(xf, Rch - Rf, Rf, xf, p2[0], upper=True),
        Line(p2[0], p2[1], p1[0], p1[1]),
        Arc(0.0, Rt + Ru, Ru, p1[0], 0.0, upper=False),
    ]
    if expansion_ratio > 1.0:
        p3 = (Rd * math.sin(td), Rt + Rd * (1.0 - math.cos(td)))
        if Re <= p3[1]:
            # Exit lies on the downstream throat arc itself.
            x_e = math.sqrt(Rd * Rd - (Rt + Rd - Re) ** 2)
            segs.append(Arc(0.0, Rt + Rd, Rd, 0.0, x_e, upper=False))
        else:
            segs.append(Arc(0.0, Rt + Rd, Rd, 0.0, p3[0], upper=False))
            segs.append(Line(p3[0], p3[1], p3[0] + (Re - p3[1]) / math.tan(td), Re))
    return Profile(tuple(segs), throat_x=0.0, throat_radius=Rt, throat_curvature_upstream=Ru)


def from_points(points: list[tuple[float, float]]) -> Profile:
    """Polyline profile from (x, r) points, e.g. extracted from CAD.

    The throat is the minimum-radius vertex refined by a parabola through it
    and its neighbours; the upstream curvature radius comes from a circle
    fitted to the points just upstream of the throat.
    """
    pts = sorted(points)
    if len(pts) < 3:
        raise ValueError("need at least three profile points")
    segs = tuple(Line(a[0], a[1], b[0], b[1]) for a, b in zip(pts, pts[1:]))
    i = min(range(len(pts)), key=lambda k: pts[k][1])
    x_t, r_t = pts[i]
    if 0 < i < len(pts) - 1:
        (xa, ra), (xb, rb), (xc, rc) = pts[i - 1], pts[i], pts[i + 1]
        den = (xa - xb) * (xa - xc) * (xb - xc)
        A = (xc * (rb - ra) + xb * (ra - rc) + xa * (rc - rb)) / den
        B = (xc * xc * (ra - rb) + xb * xb * (rc - ra) + xa * xa * (rb - rc)) / den
        C = (xb * xc * (xb - xc) * ra + xc * xa * (xc - xa) * rb + xa * xb * (xa - xb) * rc) / den
        if A > 0.0:
            x_t = min(max(-B / (2.0 * A), xa), xc)
            r_t = A * x_t * x_t + B * x_t + C
    return Profile(segs, throat_x=x_t, throat_radius=r_t,
                   throat_curvature_upstream=_upstream_curvature(pts, i))


def _upstream_curvature(pts: list[tuple[float, float]], i: int) -> float | None:
    """Radius of the circle through the throat and two upstream points."""
    if i < 2:
        return None
    (x1, y1), (x2, y2), (x3, y3) = pts[i - 2], pts[i - 1], pts[i]
    a = math.dist((x1, y1), (x2, y2))
    b = math.dist((x2, y2), (x3, y3))
    c = math.dist((x1, y1), (x3, y3))
    cross = abs((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1))
    return None if cross < 1e-300 else a * b * c / (2.0 * cross)
