"""Pre-flight validation of a simulation definition.

Every rule returns :class:`Finding` records with a stable ``code`` (for the
UI and tests), a severity, a plain-language message and, where there is
one, what to do about it. ERROR blocks meshing and solving; WARNING is
shown and recorded in the run manifest; INFO is context the engineer
should see (the expected regime, the real-gas bias, and so on).

The rules encode the physics hazards in DESIGN.md section 6. They run in
milliseconds because they use only the quasi-1D theory, so the UI can run
them on every keystroke.
"""

from __future__ import annotations

import enum
import math
from dataclasses import dataclass

from .. import rarefaction, realgas
from ..model.definition import (
    CadFile,
    ConicalNozzle,
    FixedTemperature,
    Inviscid,
    KOmegaSST,
    Laminar,
    MassFlowInlet,
    MeshForm,
    Plume,
    ReservoirInlet,
    SimulationDefinition,
    Transient,
    TruncatedAtExit,
    WallProfile,
    resolve_gas,
)
from ..profile import Profile
from ..stagnation import nominal_p0
from ..theory import isentropic as isen
from ..theory import nozzle

# The envelope V1 is built and verified for (DESIGN.md section 0).
P0_VALIDATED = (5e5, 3e6)
P0_SUPPORTED = (1e5, 5e6)
T0_SUPPORTED = (200.0, 350.0)  # cold gas, constant cp
HEATED_T0_SUPPORTED = 1100.0  # K: the top of the cp(T) fits
REAL_GAS_WARN = 0.005  # mass-flow bias above which the perfect-gas result is flagged
TYPICAL_BOTTLE = (300e5, 300.0)  # for the regulator-cooling hint
LAMINAR_TRANSITION_RE = 1.0e6  # throat Re of transition in critical-flow venturis
# A startup whose inlet jumps by more than this pressure ratio at t = 0 is
# flagged: V1 opened instantly against its 1000:1 start diverged in ten steps.
INSTANT_OPENING_RATIO = 100.0
VIRIAL_VERIFIED_P0 = 30e5  # Pa: the virial gas's choked flux is within 0.013 % up to here


class Severity(enum.IntEnum):
    INFO = 0
    WARNING = 1
    ERROR = 2


@dataclass(frozen=True)
class Finding:
    severity: Severity
    code: str
    message: str
    hint: str = ""


def has_errors(findings: list[Finding]) -> bool:
    return any(f.severity is Severity.ERROR for f in findings)


# The solver names a definition may ask for ("auto" is rhoPimpleFoam).
SOLVERS = ("auto", "rhoPimpleFoam", "rhoCentralFoam")


def _fmt_bar(p: float) -> str:
    return f"{p / 1e5:.3g} bar"


def resolve_profile(defn: SimulationDefinition) -> Profile | None:
    """The wall profile, where it is known without geometry processing."""
    if isinstance(defn.geometry, (ConicalNozzle, WallProfile)):
        return defn.geometry.profile(defn.mesh.planar_width or None)
    return None


def validate(defn: SimulationDefinition, profile: Profile | None = None) -> list[Finding]:
    """Check a definition. ``profile`` is the nozzle wall recovered from CAD
    when the geometry is a file; parametric geometry supplies its own."""
    findings: list[Finding] = []
    add = findings.append
    if profile is None:
        profile = resolve_profile(defn)
    try:
        defn = resolve_gas(defn)
    except ValueError as e:
        return [Finding(Severity.ERROR, "gas.unsupported", str(e))]

    try:
        gas = defn.gas.model()
    except ValueError as e:
        return [Finding(Severity.ERROR, "gas.unsupported", str(e))]
    if gas.name != "N2":
        add(Finding(Severity.WARNING, "gas.not_nitrogen",
                    f"The gas is {gas.name} (gamma {gas.gamma:.3f}). SONICLINE is validated for "
                    "nitrogen; air is provided to compare with air experiments (E1, E2)."))

    inlet = defn.boundaries.inlet
    ambient = defn.boundaries.ambient
    pa = ambient.pressure
    T0 = inlet.T0

    # -- stagnation state -------------------------------------------------
    if isinstance(inlet, ReservoirInlet):
        p0 = inlet.p0
    elif profile is not None and inlet.mass_flow > 0.0:
        # Quasi-1D inversion gives the chamber pressure a mass flow needs.
        p0 = nominal_p0(defn, profile)
        add(Finding(Severity.INFO, "inlet.implied_p0",
                    f"This mass flow implies a chamber pressure of {_fmt_bar(p0)} in the ideal "
                    "nozzle (Cd = 1); the CFD finds the real one, higher by about 1/Cd, and "
                    "reports it."))
    else:
        p0 = None

    if p0 is not None:
        if p0 <= pa:
            add(Finding(Severity.ERROR, "inlet.no_driving_pressure",
                        f"Chamber pressure {_fmt_bar(p0)} does not exceed ambient {_fmt_bar(pa)}: "
                        "there is no flow to solve for."))
            return findings
        if not P0_SUPPORTED[0] <= p0 <= P0_SUPPORTED[1]:
            add(Finding(Severity.WARNING, "envelope.p0",
                        f"Chamber pressure {_fmt_bar(p0)} is outside the supported range "
                        f"{_fmt_bar(P0_SUPPORTED[0])}-{_fmt_bar(P0_SUPPORTED[1])}.",
                        "Results outside the envelope have not been verified."))
        elif not P0_VALIDATED[0] <= p0 <= P0_VALIDATED[1]:
            add(Finding(Severity.INFO, "envelope.p0_unvalidated",
                        f"Chamber pressure {_fmt_bar(p0)} is supported but outside the "
                        f"verified band {_fmt_bar(P0_VALIDATED[0])}-{_fmt_bar(P0_VALIDATED[1])}."))
    heated = gas.janaf is not None
    t_max = HEATED_T0_SUPPORTED if heated else T0_SUPPORTED[1]
    if not T0_SUPPORTED[0] <= T0 <= t_max:
        add(Finding(Severity.WARNING, "envelope.T0",
                    f"Chamber temperature {T0:.1f} K is outside {T0_SUPPORTED[0]:.0f}-{t_max:.0f} K"
                    + ("." if heated else " for constant cp; a heated gas needs cp(T) "
                       "(heat_capacity \"temperature_dependent\" or \"auto\").")))
    elif heated:
        add(Finding(Severity.INFO, "gas.heated",
                    f"Heated gas: cp varies with temperature (cp(T), {gas.cp_at(T0):.0f} J/(kg K) at "
                    f"{T0:.0f} K against {gas.cp_at(300.0):.0f} at 300 K). The quasi-1D prediction "
                    "takes cp at the chamber temperature; the CFD and its checks use cp(T)."))
    time = defn.flow.time
    if isinstance(time, Transient) and time.initial == "ambient" and time.ramp_time == 0.0 and p0 is not None:
        start = max(pa, 1e-3 * p0)  # foam.case.start_pressure
        if p0 / start > INSTANT_OPENING_RATIO:
            add(Finding(Severity.WARNING, "transient.instant_opening",
                        f"The valve opens instantly against a {p0 / start:.0f}:1 pressure jump. "
                        "rhoCentralFoam diverged within ten steps doing this to V1 at 1000:1.",
                        "Give the valve an opening time (ramp); V15 uses a tenth of the run."))

    # -- real gas and regulator cooling -------------------------------------
    if p0 is not None and realgas.available(gas):
        choke = realgas.choked_mass_flux(gas, p0, T0)
        # A warning only when the CFD leaves the effect out.
        sev = Severity.WARNING if choke.bias > REAL_GAS_WARN and not defn.gas.real_gas else Severity.INFO
        add(Finding(sev, "gas.real_gas_bias",
                    f"At {_fmt_bar(p0)} and {T0:.0f} K real nitrogen chokes at "
                    f"{100 * choke.bias:+.2f} % mass flux relative to the perfect-gas model"
                    + (" (the Peng-Robinson CFD over-shoots this; the reported estimate "
                       "corrects it to the reference equation of state)." if defn.gas.peng_robinson
                       else " (the virial CFD includes it)." if defn.gas.virial
                       else " the CFD uses."),
                    "The perfect-gas mass flow and thrust are reported together with this "
                    "correction; the virial equation of state puts it in the CFD."
                    if sev is Severity.WARNING and not defn.gas.real_gas else ""))
        p_b, T_b = TYPICAL_BOTTLE
        if p0 < p_b and gas.name == "N2":
            T_reg = realgas.regulator_outlet_temperature(gas, p_b, T_b, p0)
            add(Finding(Severity.INFO, "gas.regulator_cooling",
                        f"T0 is the gas temperature in the chamber. Regulating from a "
                        f"{_fmt_bar(p_b)}, {T_b:.0f} K bottle to {_fmt_bar(p0)} cools nitrogen "
                        f"to about {T_reg:.0f} K (Joule-Thomson), before any warming in the lines."))

    # -- operating regime -----------------------------------------------------
    exit_domain = defn.boundaries.exit_domain
    if p0 is not None and profile is not None:
        perf = nozzle.analyse(gas, p0, T0, pa, profile.throat_area, profile.area(profile.x_exit))
        _regime_findings(gas, perf, p0, pa, profile, exit_domain, add)
        _condensation_findings(gas, perf, add)
        _rarefaction_findings(gas, perf, p0, T0, profile, add, defn)
        _turbulence_findings(defn, gas, p0, T0, profile, add)
    elif isinstance(exit_domain, TruncatedAtExit) and pa > 0.0:
        add(Finding(Severity.WARNING, "domain.truncated_unchecked",
                    "The domain ends at the exit plane with a non-zero ambient pressure, and the "
                    "regime cannot be checked until the geometry is processed."))

    # -- walls --------------------------------------------------------------
    wall = defn.boundaries.wall_thermal
    if isinstance(wall, FixedTemperature) and not 20.0 <= wall.temperature <= 1000.0:
        add(Finding(Severity.ERROR, "wall.temperature",
                    f"Wall temperature {wall.temperature:.1f} K is not physical for this application."))
    if isinstance(inlet, MassFlowInlet) and inlet.mass_flow <= 0.0:
        add(Finding(Severity.ERROR, "inlet.mass_flow", "Mass flow must be positive."))

    # -- real gas in the CFD -------------------------------------------------
    if defn.gas.virial and gas.name != "N2":
        add(Finding(Severity.ERROR, "gas.virial_species",
                    f"The virial equation of state is fitted for nitrogen only, not {gas.name}."))
    elif defn.gas.virial:
        add(Finding(Severity.INFO, "gas.virial",
                    "The CFD uses the virial equation of state, fitted to nitrogen's reference "
                    "equation: real-gas choked flux within about 0.01 % up to 30 bar."))
        if p0 is not None and p0 > VIRIAL_VERIFIED_P0:
            add(Finding(Severity.WARNING, "gas.virial_pressure",
                        f"Above {_fmt_bar(VIRIAL_VERIFIED_P0)} the truncated virial series loses "
                        "accuracy (0.07 % in choked flux at 50 bar and 250 K)."))
    elif defn.gas.peng_robinson:
        # OpenFOAM offers Peng-Robinson with constant cp only in enthalpy
        # form, which rhoCentralFoam cannot use (it assumes internal energy).
        name = "Peng-Robinson"
        central = defn.numerics.solver == "rhoCentralFoam"
        if p0 is not None and profile is not None and not central:
            shock = nozzle.analyse(gas, p0, T0, pa, profile.throat_area, profile.area(profile.x_exit))
            central = shock.regime is nozzle.Regime.SHOCK_IN_NOZZLE or shock.separation.likely
        if central:
            add(Finding(Severity.ERROR, "gas.real_gas_solver",
                        f"The {name} gas runs only with rhoPimpleFoam, and this case needs "
                        "rhoCentralFoam (a shock stands inside the nozzle, or it was asked for).",
                        "Use the virial gas, which runs on both solvers and is closer."))
        else:
            add(Finding(Severity.INFO, "gas.peng_robinson",
                        "The CFD uses the Peng-Robinson equation of state. For nitrogen near 300 K "
                        "it over-predicts real-gas density: its choked-flux correction is about "
                        "25 % larger than the reference equation of state's."))

    if defn.mesh.form is MeshForm.PLANAR and isinstance(defn.geometry, CadFile):
        add(Finding(Severity.ERROR, "mesh.planar_cad",
                    "A planar mesh needs a parametric or tabulated wall; CAD import reads bodies "
                    "of revolution only.", "Describe the nozzle as a wall_profile."))

    # -- numerics -----------------------------------------------------------
    solver = defn.numerics.solver
    if solver not in SOLVERS:
        add(Finding(Severity.ERROR, "numerics.solver",
                    f"Unknown solver {solver!r}; choose one of {', '.join(SOLVERS)}."))
    return findings


def _regime_findings(gas, perf, p0, pa, profile, exit_domain, add) -> None:
    R = nozzle.Regime
    eps = profile.expansion_ratio
    pe = perf.exit_pressure
    if perf.regime is R.SUBSONIC:
        add(Finding(Severity.WARNING, "regime.unchoked",
                    f"The nozzle is not choked: ambient {_fmt_bar(pa)} is above the first critical "
                    f"pressure {_fmt_bar(perf.critical.first)}. Flow is subsonic throughout.",
                    "Raise the chamber pressure if a choked thruster was intended."))
    elif perf.regime is R.SHOCK_IN_NOZZLE:
        add(Finding(Severity.WARNING, "regime.shock_in_nozzle",
                    f"Quasi-1D theory puts a normal shock inside the nozzle at A/At = "
                    f"{perf.shock_area_ratio:.2f} (M = {perf.shock_mach:.2f}). A real nozzle "
                    "separates at a shock this strong; the result is sensitive to the "
                    "turbulence model.", "Compare laminar and SST results."))
    elif perf.regime is R.OVEREXPANDED:
        sep = perf.separation
        if sep.likely:
            where = ", ".join(
                f"{name} A/At = {ar:.2f}" for name, ar in
                (("Schmucker", sep.schmucker_area_ratio), ("Summerfield", sep.summerfield_area_ratio))
                if ar is not None)
            add(Finding(Severity.WARNING, "regime.separation_likely",
                        f"Overexpanded: the exit pressure would be {pe / pa:.2f} of ambient "
                        f"(ε = {eps:.2f}). Flow is likely to separate inside the nozzle ({where}). "
                        "Separation location and thrust are sensitive to the turbulence model.",
                        f"A nozzle expanding exactly to ambient at this pressure has "
                        f"ε = {nozzle.optimum_area_ratio(gas.gamma, p0, pa):.2f}."))
        else:
            add(Finding(Severity.INFO, "regime.overexpanded",
                        f"Overexpanded but expected to stay attached: pe/pa = {pe / pa:.2f}. "
                        "Oblique shocks form at the lip."))
    elif perf.regime is R.MATCHED:
        add(Finding(Severity.INFO, "regime.matched",
                    f"Near-ideal expansion: pe = {_fmt_bar(pe)} against ambient {_fmt_bar(pa)}."))
    else:
        add(Finding(Severity.INFO, "regime.underexpanded",
                    f"Underexpanded: pe/pa = {pe / pa:.2f}" if pa > 0.0 else
                    "Expanding into vacuum."))

    if isinstance(exit_domain, TruncatedAtExit):
        if pa == 0.0:
            pass
        elif exit_domain.fixed_pressure:
            add(Finding(Severity.INFO, "domain.fixed_exit_pressure",
                        f"The exit plane's static pressure is held at {_fmt_bar(pa)}: the quasi-1D "
                        "internal-flow problem. Right for verification against it; a thruster "
                        "exhausting into its surroundings needs a plume region."))
        elif perf.regime is R.UNDEREXPANDED and pe >= 2.0 * pa:
            add(Finding(Severity.WARNING, "domain.truncated_underexpanded",
                        "The domain ends at the exit plane. With an under-expanded exit this is an "
                        "approximation: the subsonic wall layer still feels the ambient pressure.",
                        "Use a plume region for a physical exit condition."))
        else:
            add(Finding(Severity.ERROR, "domain.truncated_not_supersonic",
                        "The domain ends at the exit plane, but at this ambient pressure the "
                        "surroundings reach back into the nozzle (through the subsonic boundary "
                        "layer, a separated region or a subsonic exit). Fixing a pressure on the "
                        "exit plane would give an unphysical answer.",
                        "Use a plume region (the default)."))
    elif isinstance(exit_domain, Plume):
        if exit_domain.length < 5.0 or exit_domain.radius < 2.0:
            add(Finding(Severity.WARNING, "domain.plume_small",
                        "The plume region is small enough that its boundaries may influence the "
                        "exit flow. At least 10 exit diameters long and 3 in radius is recommended."))


def _condensation_findings(gas, perf, add) -> None:
    if not realgas.available(gas) or perf.regime is nozzle.Regime.SUBSONIC:
        return
    sat = realgas.saturation_temperature(gas, perf.exit_pressure)
    margin = perf.exit_temperature - sat.temperature
    approx = " (approximate: below the triple point)" if sat.approximate else ""
    if margin < 0.0:
        add(Finding(Severity.WARNING, "gas.condensation",
                    f"The ideal expansion reaches {perf.exit_temperature:.1f} K at the exit, below "
                    f"nitrogen's saturation temperature {sat.temperature:.1f} K at "
                    f"{perf.exit_pressure:.0f} Pa{approx}. The CFD treats the gas as a "
                    "supersaturated vapour; exit conditions and Isp beyond the saturation point "
                    "are upper bounds.", "Raising T0 (chamber heating) moves the expansion away "
                    "from saturation."))
    else:
        add(Finding(Severity.INFO, "gas.condensation_margin",
                    f"Exit static temperature {perf.exit_temperature:.1f} K is {margin:.0f} K above "
                    f"saturation{approx}."))


def _rarefaction_findings(gas, perf, p0, T0, profile, add, defn=None) -> None:
    """Knudsen number at the throat and the exit by quasi-1D (core.rarefaction),
    and the slip walls' own conditions."""
    slip = defn is not None and defn.boundaries.wall_slip is not None
    if slip:
        if isinstance(defn.flow.turbulence, Inviscid):
            add(Finding(Severity.WARNING, "wall.slip_inviscid",
                        "Wall slip is set on an inviscid run, whose walls slip freely already: it is ignored."))
        elif (defn.numerics.solver == "rhoCentralFoam" or isinstance(defn.flow.time, Transient)
              or perf.regime is nozzle.Regime.SHOCK_IN_NOZZLE):
            add(Finding(Severity.INFO, "wall.slip_central",
                        "This case runs on rhoCentralFoam: with slip walls SONICLINE builds and runs its "
                        "own copy of it, whose energy equation keeps the slip friction in the gas (the "
                        "first slip run builds it, which needs OpenFOAM's development package)."))
    g = gas.gamma
    p_star = p0 * (2.0 / (g + 1.0)) ** (g / (g - 1.0))
    T_star = T0 * 2.0 / (g + 1.0)
    kn_t = rarefaction.knudsen(gas, p_star, T_star, 2.0 * profile.throat_radius)
    kn_e = (rarefaction.knudsen(gas, perf.exit_pressure, perf.exit_temperature, 2.0 * profile.exit_radius)
            if perf.exit_pressure > 0 and perf.exit_temperature > 0 else 0.0)
    worst = max(kn_t, kn_e)
    where = "throat" if kn_t >= kn_e else "exit"
    if worst > rarefaction.TRANSITION:
        add(Finding(Severity.ERROR, "flow.rarefied",
                    f"Knudsen number about {worst:.2g} at the {where} (quasi-1D): the gas is in the "
                    "transition regime, where continuum CFD does not apply.",
                    "Raise the chamber pressure or enlarge the nozzle; or model it with DSMC."))
    elif worst > rarefaction.SLIP_WARNING and slip:
        add(Finding(Severity.INFO, "flow.slip_modelled",
                    f"Knudsen number about {worst:.2g} at the {where} (quasi-1D): slip flow, modelled by "
                    "the first-order slip walls this run has."))
    elif worst > rarefaction.SLIP_WARNING:
        add(Finding(Severity.WARNING, "flow.slip",
                    f"Knudsen number about {worst:.2g} at the {where} (quasi-1D): slip flow. The CFD's "
                    "no-slip walls overstate friction and heat transfer there; thrust and Cd read low.",
                    "A larger nozzle or a higher chamber pressure lowers it."))
    elif worst > rarefaction.CONTINUUM:
        if slip:
            add(Finding(Severity.INFO, "flow.knudsen",
                        f"Knudsen number about {worst:.1g} at the {where} (quasi-1D): first-order slip "
                        "walls model the slip there."))
            return
        add(Finding(Severity.INFO, "flow.knudsen",
                    f"Knudsen number about {worst:.1g} at the {where} (quasi-1D, on the axis): the "
                    "edge of the slip regime. No-slip walls overstate the wall friction by roughly "
                    f"{800 * worst:.0f} % there; the hotter gas at the wall runs higher, and the run "
                    "reports it."))


def _turbulence_findings(defn, gas, p0, T0, profile, add) -> None:
    g, R = gas.gamma, gas.R
    Dt = 2.0 * profile.throat_radius
    mdot = isen.choked_mass_flow(g, R, p0, T0, profile.throat_area)
    T_star = T0 / isen.T0_over_T(g, 1.0)
    re_t = 4.0 * mdot / (math.pi * Dt * gas.viscosity(T_star))
    turb = defn.flow.turbulence
    if isinstance(turb, KOmegaSST) and re_t < LAMINAR_TRANSITION_RE:
        add(Finding(Severity.INFO, "turbulence.laminar_bracket",
                    f"Throat Reynolds number is {re_t:.2g}, below the ~1e6 at which throat "
                    "boundary layers turn turbulent in critical-flow nozzles, and the strong "
                    "acceleration near the throat tends to relaminarise them. A fully turbulent "
                    "SST boundary layer may be the wrong physics here.",
                    "Run the same case laminar as well; the spread is the model uncertainty "
                    "(for the 20 bar reference thruster: +0.07 % mass flow, +0.18 % thrust)."))
    elif isinstance(turb, Laminar) and re_t > 2.0 * LAMINAR_TRANSITION_RE:
        add(Finding(Severity.WARNING, "turbulence.likely_turbulent",
                    f"Throat Reynolds number is {re_t:.2g}; the boundary layer is likely turbulent.",
                    "Use k-omega SST, or run both."))
