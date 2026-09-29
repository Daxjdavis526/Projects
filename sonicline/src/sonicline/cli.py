"""Command-line entry point.

    sonicline check <definition.json>   validate a definition and print the
                                        quasi-1D prediction for it

The same pipeline functions back the desktop UI; the CLI is also how CI and
the verification suite drive the application.
"""

from __future__ import annotations

import argparse
import sys

from .core import model
from .core.theory import discharge, nozzle
from .core.validate import Severity, has_errors, resolve_profile, validate

_MARK = {Severity.INFO: "info ", Severity.WARNING: "WARN ", Severity.ERROR: "ERROR"}


def _check(path: str) -> int:
    try:
        defn = model.load(path)
    except (OSError, model.DefinitionError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    print(f"{defn.name}  (definition {model.definition_hash(defn)[:12]})")
    profile = resolve_profile(defn)
    inlet = defn.boundaries.inlet
    if profile is not None and isinstance(inlet, model.ReservoirInlet):
        gas = defn.gas.model()
        pa = defn.boundaries.ambient.pressure
        perf = nozzle.analyse(gas, inlet.p0, inlet.T0, pa, profile.throat_area,
                              profile.area(profile.x_exit))
        rc = profile.rc_over_rt
        cd = discharge.kliegel_levine(gas.gamma, rc) if rc else None
        print()
        print("quasi-1D prediction (ideal, before CFD)")
        print(f"  throat diameter     {2e3 * profile.throat_radius:.3f} mm, "
              f"expansion ratio {profile.expansion_ratio:.3f}")
        print(f"  regime              {perf.regime.value}")
        print(f"  mass flow           {1e3 * perf.mass_flow:.4f} g/s"
              + (f"   (x Cd {cd:.4f} for Rc/Rt = {rc:.2f}: {1e3 * cd * perf.mass_flow:.4f} g/s)"
                 if cd else ""))
        print(f"  exit Mach           {perf.exit_mach:.4f}")
        print(f"  exit pressure       {perf.exit_pressure:.1f} Pa")
        print(f"  exit temperature    {perf.exit_temperature:.2f} K")
        print(f"  thrust              {perf.thrust:.4f} N "
              f"(momentum {perf.momentum_thrust:.4f}, pressure {perf.pressure_thrust:+.4f})")
        print(f"  specific impulse    {nozzle.specific_impulse(perf):.2f} s")

    findings = validate(defn, profile)
    print()
    print("checks")
    for f in sorted(findings, key=lambda f: -f.severity):
        print(f"  {_MARK[f.severity]} {f.code}: {f.message}")
        if f.hint:
            print(f"        -> {f.hint}")
    return 1 if has_errors(findings) else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="sonicline", description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check", help="validate a simulation definition")
    check.add_argument("definition")
    args = parser.parse_args(argv)
    if args.command == "check":
        return _check(args.definition)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
