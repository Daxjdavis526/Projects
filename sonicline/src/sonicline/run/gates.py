"""Mesh quality gates applied to checkMesh's report before any solve.

Hard failures are defects no solver setting can compensate for. Warnings
are recorded in the run manifest and shown with the result.

Wall-resolved meshes always have boundary-layer cells with aspect ratios
in the hundreds or thousands, which checkMesh reports as high aspect ratio
and small determinant. Those are expected there and are not failures.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from ..foam.parse import MeshCheck

NON_ORTHO_WARN = 65.0
NON_ORTHO_CORRECT = 55.0  # above this, enable a non-orthogonal corrector
NON_ORTHO_FAIL = 80.0
SKEW_WARN = 4.0
SKEW_FAIL = 20.0

_FATAL_MARKERS = (
    ("negative", "zero or negative cell volumes"),
    ("incorrectly oriented", "incorrectly oriented faces"),
    ("open cells", "open cells"),
    ("face pyramids", "inverted face pyramids"),
    ("illegal", "illegal cell or face definitions"),
)


@dataclass
class GateResult:
    ok: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def to_json(self) -> dict:
        return {"gate_ok": self.ok, "gate_errors": self.errors, "gate_warnings": self.warnings}


def evaluate(check: MeshCheck, viscous: bool) -> GateResult:
    g = GateResult(ok=True)
    if check.cells <= 0:
        g.errors.append("checkMesh reported no cells")
    if check.regions != 1:
        g.errors.append(f"the mesh has {check.regions} disconnected regions")
    for message in check.messages:
        low = message.lower()
        for marker, text in _FATAL_MARKERS:
            if marker in low:
                g.errors.append(f"{text}: {message}")
    if check.max_non_orthogonality > NON_ORTHO_FAIL:
        g.errors.append(f"maximum non-orthogonality {check.max_non_orthogonality:.1f} deg exceeds "
                        f"{NON_ORTHO_FAIL:g}")
    elif check.max_non_orthogonality > NON_ORTHO_WARN:
        g.warnings.append(f"maximum non-orthogonality {check.max_non_orthogonality:.1f} deg")
    if check.max_skewness > SKEW_FAIL:
        g.errors.append(f"maximum skewness {check.max_skewness:.1f} exceeds {SKEW_FAIL:g}")
    elif check.max_skewness > SKEW_WARN:
        g.warnings.append(f"maximum skewness {check.max_skewness:.1f}")
    if not viscous and check.max_aspect_ratio > 1000:
        g.warnings.append(f"aspect ratio {check.max_aspect_ratio:.0f} in an inviscid mesh")
    g.ok = not g.errors
    return g
