"""
Module 22 — Solid motor cases: worked-example inputs and expected outputs.

Only the entries whose arithmetic maps onto a function in ``tools/rocket.py``
appear in EXAMPLES.  Module 22 is a structures module and most of its
arithmetic is pressure-vessel mechanics, which the library does not (yet)
carry; those examples are reproduced by ``check()`` below and documented in
the comments so the numbers printed in the text can be regenerated.

Run:  python3 tools/examples/22-cases.py
"""
from __future__ import annotations
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import rocket  # noqa: E402

G0 = rocket.G0

# ---------------------------------------------------------------------------
# Library-mapped examples
# ---------------------------------------------------------------------------
# WE3(d): stage delta-v for the same generic motor (mp = 121,110 kg,
# Isp = 280 s vac, 8,000 kg payload) with a D6AC steel case and with an
# IM7 carbon/epoxy case.  The whole difference is case material.
#   steel : m_i = 16,359 kg -> m0 = 145,469 kg, mf = 24,359 kg
#   carbon: m_i =  8,270 kg -> m0 = 137,380 kg, mf = 16,270 kg
# N6: same motor, steel case, MEOP raised 7.0 -> 8.0 MPa
#   m_i = 17,844 kg -> m0 = 146,954 kg, mf = 25,844 kg
# Q8: mp = 121,000 kg, m_i 16,400 -> 13,200 kg, 8,000 kg payload
EXAMPLES = [
    {"id": "22.WE3d-steel", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 145469.0, "mf": 24359.0},
     "expect": 4907.0, "tol": 0.01},
    {"id": "22.WE3d-carbon", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 137380.0, "mf": 16270.0},
     "expect": 5858.1, "tol": 0.01},
    {"id": "22.N6", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 146954.0, "mf": 25844.0},
     "expect": 4772.4, "tol": 0.01},
    {"id": "22.Q8-before", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 145400.0, "mf": 24400.0},
     "expect": 4901.1, "tol": 0.01},
    {"id": "22.Q8-after", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 142200.0, "mf": 21200.0},
     "expect": 5226.0, "tol": 0.01},
]

# ---------------------------------------------------------------------------
# Pressure-vessel arithmetic not in rocket.py (Eqs. 3.1, 3.6, 3.8, 3.10-3.12)
# ---------------------------------------------------------------------------


def hoop_stress(p, R, t):
    """Eq. 3.1  sigma_theta = pR/t  [Pa]."""
    return p * R / t


def wall_thickness(p_b, R, Ftu):
    """Membrane wall sized so that the burst hoop stress equals Ftu  [m]."""
    return p_b * R / Ftu


def mass_per_length(rho, R, t):
    """Membrane mass of one metre of cylinder, mean-radius basis  [kg/m]."""
    return rho * 2.0 * math.pi * (R + 0.5 * t) * t


def critical_flaw_depth(K_Ic, sigma):
    """Eq. 3.6  a_c = (1/pi)(K_Ic / 1.12 sigma)^2  [m]."""
    return (1.0 / math.pi) * (K_Ic / (1.12 * sigma)) ** 2


def netting(p_b, R, sigma_f, alpha_deg, Vf):
    """Eq. 3.8 -> (t_helical, t_hoop, t_fibre_total, t_laminate)  [m]."""
    a = math.radians(alpha_deg)
    t_a = p_b * R / (2.0 * sigma_f * math.cos(a) ** 2)
    t_90 = p_b * R / sigma_f * (1.0 - 0.5 * math.tan(a) ** 2)
    t_f = t_a + t_90
    return t_a, t_90, t_f, t_f / Vf


def pv_over_w_metal(sigma, rho):
    """Eq. 3.10, cylinder:  PV/W = sigma / (2 rho g0)  [m]."""
    return sigma / (2.0 * rho * G0)


def pv_over_w_netting(sigma_f, Vf, rho):
    """Eq. 3.11, netting cylinder:  PV/W = sigma_f Vf / (3 rho g0)  [m]."""
    return sigma_f * Vf / (3.0 * rho * G0)


def zeta(mp, mi):
    """Propellant mass fraction."""
    return mp / (mp + mi)


def check():
    ok = True

    def near(label, got, want, tol=0.01):
        nonlocal ok
        good = abs(got - want) <= tol * abs(want)
        ok = ok and good
        print(f"  [{'ok ' if good else 'FAIL'}] {label:38s} {got:12.4f}  (expect {want})")

    print("WE1 — 3.00 m ID, MEOP 7.0 MPa, jb = 1.5, D6AC 1520 MPa")
    R, MEOP, jb = 1.50, 7.0e6, 1.5
    p_b = jb * MEOP
    t = wall_thickness(p_b, R, 1520e6)
    near("t steel (mm)", t * 1e3, 10.36)
    near("sigma_hoop at MEOP (MPa)", hoop_stress(MEOP, R, t) / 1e6, 1013.3)
    near("m' steel (kg/m)", mass_per_length(7830.0, R, t), 767.3)
    ta, t90, tf, tL = netting(p_b, R, 3500e6, 20.0, 0.60)
    near("t_helical (mm)", ta * 1e3, 2.548)
    near("t_hoop (mm)", t90 * 1e3, 4.202)
    near("t_laminate carbon (mm)", tL * 1e3, 11.25)
    near("m' carbon (kg/m)", mass_per_length(1580.0, R, tL), 168.15)
    near("a_c at K=90 MPa.m^0.5 (mm)",
         critical_flaw_depth(90e6, hoop_stress(MEOP, R, t)) * 1e3, 2.00)

    print("WE2 — vessel performance index PV/W (km)")
    near("D6AC steel", pv_over_w_metal(1520e6, 7830.0) / 1e3, 9.90)
    near("Ti-6Al-4V", pv_over_w_metal(1100e6, 4430.0) / 1e3, 12.66)
    near("S-glass/epoxy", pv_over_w_netting(2300e6, 0.60, 2000.0) / 1e3, 23.46)
    near("Kevlar 49/epoxy", pv_over_w_netting(2600e6, 0.60, 1380.0) / 1e3, 38.44)
    near("IM7 carbon/epoxy", pv_over_w_netting(3500e6, 0.60, 1580.0) / 1e3, 45.19)

    print("WE3 — mass fraction of the generic 3.0 m x 10 m motor")
    L, k_dome, m_other = 10.0, 1.35, 6000.0
    V = math.pi * R ** 2 * L + (2.0 / 3.0) * math.pi * R ** 3
    mp = 0.88 * V * 1770.0
    near("case internal volume (m^3)", V, 77.75)
    near("propellant mass (kg)", mp, 121110.0)
    mi_steel = mass_per_length(7830.0, R, t) * L * k_dome + m_other
    mi_carb = mass_per_length(1580.0, R, tL) * L * k_dome + m_other
    near("zeta, steel case", zeta(mp, mi_steel), 0.8810)
    near("zeta, carbon case", zeta(mp, mi_carb), 0.9361)
    near("dzeta per 1000 kg inert", -1000.0 * mp / (mp + mi_steel) ** 2, -0.0064, 0.02)

    print("Library-mapped EXAMPLES")
    for ex in EXAMPLES:
        got = getattr(rocket, ex["fn"])(**ex["args"])
        near(ex["id"], got, ex["expect"], ex["tol"])

    print("\nALL OK" if ok else "\nFAILURES ABOVE")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(check())
