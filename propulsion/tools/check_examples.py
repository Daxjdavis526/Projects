#!/usr/bin/env python3
"""Recompute every registered worked example against tools/rocket.py."""
import sys, os, glob, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import rocket

def run(path):
    spec = importlib.util.spec_from_file_location("ex", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    bad = 0
    ex = getattr(m, "EXAMPLES", [])
    for e in ex:
        try:
            got = getattr(rocket, e["fn"])(**e["args"])
        except Exception as err:
            bad += 1; print(f"  ERROR {e['id']}: {err}"); continue
        exp = e["expect"]; tol = e.get("tol", 0.01)
        if abs(got - exp) > tol * abs(exp) + 1e-12:
            bad += 1; print(f"  FAIL {e['id']}: got {got:.6g}, expected {exp:.6g}")
    return len(ex), bad

total = fails = 0
for p in sorted(glob.glob(os.path.join(HERE, "examples", "*.py"))):
    n, b = run(p)
    total += n; fails += b
    print(f"{os.path.basename(p)}: {n} examples, {b} failures")
print(f"\nTOTAL {total} examples, {fails} failures")
sys.exit(1 if fails else 0)
