"""Mesh sizing from the simulation definition.

The first cell next to the wall is sized for the target y+ at the throat,
where the wall shear stress peaks. The shear is estimated from a turbulent
skin-friction correlation at the throat Reynolds number, doubled for the
strong favourable pressure gradient there; overestimating the shear gives a
smaller first cell, which errs towards resolving the wall. The achieved y+
is measured from the solution afterwards and reported; this is only the
starting guess.
"""

from __future__ import annotations

import math

from ..core.model import definition as d
from ..core.profile import Profile
from ..core.theory import isentropic as isen
from .revolved import Form, PlumeRegion, Resolution, RevolvedMeshSpec


def throat_first_cell(defn: d.SimulationDefinition, profile: Profile) -> float:
    """First-cell height (m) for the target y+ at the throat."""
    gas = defn.gas.model()
    inlet = defn.boundaries.inlet
    g, R = gas.gamma, gas.R
    T_star = inlet.T0 / isen.T0_over_T(g, 1.0)
    p_star = inlet.p0 / isen.p0_over_p(g, 1.0)
    rho = p_star / (R * T_star)
    u = math.sqrt(g * R * T_star)
    mu = gas.viscosity(T_star)
    re_d = rho * u * 2.0 * profile.throat_radius / mu
    cf = 2.0 * 0.0592 * re_d**-0.2
    u_tau = math.sqrt(0.5 * cf) * u
    return defn.mesh.first_cell_yplus * mu / (rho * u_tau)


def spec_for(defn: d.SimulationDefinition, profile: Profile) -> RevolvedMeshSpec:
    viscous = not isinstance(defn.flow.turbulence, d.Inviscid)
    exit_domain = defn.boundaries.exit_domain
    plume = None
    if isinstance(exit_domain, d.Plume):
        De = 2.0 * profile.exit_radius
        plume = PlumeRegion(exit_domain.length * De, exit_domain.radius * De,
                            lip_is_wall=exit_domain.lip is d.Lip.WALL)
    form = {d.MeshForm.WEDGE: Form.WEDGE, d.MeshForm.PLANAR: Form.PLANAR,
            d.MeshForm.O_GRID_3D: Form.O_GRID}[defn.mesh.form]
    return RevolvedMeshSpec(
        form=form,
        resolution=Resolution.preset(defn.mesh.quality.value).refined(defn.mesh.refinement),
        wall_first_cell=throat_first_cell(defn, profile) / defn.mesh.refinement if viscous else None,
        wedge_angle=defn.mesh.wedge_angle,
        plume=plume,
    )
