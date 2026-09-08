# Fluid property reference

**The single source of numbers for this course.** Compiled 2026-09-08 from
`_verify-properties.md`, `_verify-methane.md` and `_verify-oxygen.md`, which
remain in this directory as the audit trail.

## How to use this file

1. **Every physical number a module prints must come from this file.** Quote it as
   written, including its units and its reference condition.
2. **If a number you need is not here, it must not be printed.** Add it here first,
   with its source and a confidence label, then use it. Do not fill a gap from
   memory or from a search summary.
3. **Carry the caveat with the number.** Where a row is labelled **C**, or sits in
   [§14 Contested and unverified figures](#14-contested-and-unverified-figures),
   the caveat is part of the fact. Quoting the value without it is an error.
4. **Never write a density, an expansion ratio or a "standard volume" without
   stating the temperature.** See the reference-condition convention below. Most
   published disagreement in cryogenic safety literature is undeclared reference
   conditions, not disagreement about physics.
5. **Standards citations do not come from here.** They come from `standards.md`,
   with an edition and year. Source citations come from `sources.md`.

### Confidence key

| Label | Meaning |
|---|---|
| **A** | Primary. NIST reference equations of state, NIST Chemistry WebBook, a named government standard (OSHA / NIOSH / US Bureau of Mines), or a value computed directly here from A-grade data with the computation stated. |
| **B** | Reputable secondary. National-laboratory report, industrial gas producer's published safety literature (Air Products, EIGA), peer-reviewed paper. |
| **C** | Unconfirmed. Widely repeated, not traced to an accessible primary source. **Do not put a C value in front of students as fact** — quote it with its caveat, or leave it out. |

### Reference-condition convention

| Shorthand | Exact meaning |
|---|---|
| **NBP** | Normal boiling point: saturation at *P* = 1 atm = 1.01325 bar = 101.325 kPa exactly. |
| **1 atm** | 101.325 kPa exactly. All pressures absolute unless marked gauge. |
| **0 °C** | 273.15 K, 1 atm. |
| **15 °C** | 288.15 K, 1 atm. ISO 2533 standard-atmosphere sea level; common in European gas literature. |
| **20 °C** | 293.15 K, 1 atm. "NTP" as used by Sandia and Air Products (68 °F). |
| **70 °F** | 294.2611 K, 1 atm. **The basis of the expansion ratios quoted in US safety literature.** |
| **25 °C** | 298.15 K, 1 atm. |

> **Do not use the term "STP" in a load-bearing sentence.** It is ambiguous: IUPAC
> redefined it in 1982 from 0 °C/1 atm to 0 °C/1 bar, a 1.3 % change in gas
> density; NIST's own standard for gas volumes is 20 °C/1 atm; US industrial gas
> practice ("scf") is usually 70 °F/1 atm. Where the course must say it, write
> **0 °C and 1 atm** and give the number.

---

## 1. Identity and fixed points

All **Confidence A**, read from the NIST *Thermophysical Properties of Fluid
Systems* database (the reference equations of state that also underlie REFPROP),
retrieved 2026-09-08. Reference EOS by fluid: oxygen — Schmidt & Wagner (1985) /
Lemmon & Jacobsen; nitrogen — Span et al. (2000); methane — Setzmann & Wagner
(1991); hydrogen and parahydrogen — Leachman et al. (2009); helium —
Ortiz-Vega et al.; argon — Tegeler et al. (1999).

| Fluid | Formula | M (g/mol) | NBP (K) | NBP (°C) | NBP (°F) |
|---|---|---|---|---|---|
| Oxygen | O₂ | 31.9988 | **90.1875** | −182.962 | −297.332 |
| Nitrogen | N₂ | 28.0134 | **77.3549** | −195.795 | −320.431 |
| Methane | CH₄ | 16.0425 | **111.667** | −161.483 | −258.669 |
| Hydrogen (normal) | H₂ | 2.01588 | **20.3689** | −252.781 | −423.006 |
| Parahydrogen | p-H₂ | 2.01588 | **20.2712** | −252.879 | −423.182 |
| Helium (⁴He) | He | 4.002602 | **4.2238** | −268.926 | −452.067 |
| Argon | Ar | 39.948 | **87.302** | −185.848 | −302.526 |

### Triple point and critical point

| Fluid | Triple *T* (K) | Triple *T* (°C) | Triple *P* (bar) | *T*_c (K) | *T*_c (°C) | *P*_c (bar) | ρ_c (kg/m³) |
|---|---|---|---|---|---|---|---|
| O₂ | 54.361 | −218.789 | 0.0014628 | 154.581 | −118.569 | 50.430 | 436.1 |
| N₂ | 63.151 | −209.999 | 0.125198 | 126.192 | −146.958 | 33.958 | 313.30 |
| CH₄ | **90.6941** | −182.456 | 0.116961 | 190.564 | −82.586 | 45.992 | 162.66 |
| H₂ (normal) | 13.957 | −259.193 | 0.0735782 | 33.145 | −240.005 | 12.964 | 31.262 |
| p-H₂ | 13.8033 | −259.347 | 0.0704108 | 32.938 | −240.212 | 12.858 | 31.323 |
| He (⁴He) | *none — see note* | — | — | 5.1953 | −267.955 | 2.2832 | 69.58 |
| Ar | 83.8058 | −189.344 | 0.688909 | 150.687 | −122.463 | 48.630 | 535.599 |

**Helium has no triple point in the ordinary sense and does not freeze at any
temperature at 1 atm.** Solid helium requires roughly 25 bar. The lower limit of
the NIST saturation table, 2.1768 K / 0.0503933 bar, is the **lambda point** —
the He I / superfluid He II transition — not a solid/liquid/vapour triple point.
Confidence A. Course implication: helium cannot plug a line by freezing itself,
but at 4.2 K it is cold enough to freeze *every other substance*, including air,
hydrogen, and any trapped moisture.

**Freezing point at 1 atm.** For every fluid here except helium the triple-point
pressure is far below 1 atm, so the 1 atm melting point differs from the
triple-point temperature only in the third decimal. **Use the triple-point
temperature as the freezing point and say so.** Air Products' published freezing
points agree on conversion: N₂ −210.0 °C, O₂ −218.8 °C, H₂ −259.3 °C (see §14.11
for the hydrogen nuance).

**Argon's triple point is at 0.689 bar** — by far the highest here. A partially
evacuated argon system can reach the triple point at a pressure an ordinary
vacuum pump easily produces. Argon is carried in this course as a *contrast*
fluid: chemically inert like nitrogen, but denser than air at every temperature
(§6), which makes it the worst asphyxiation hazard of the inert cryogens in pits,
trenches and below-grade spaces.

---

## 2. Saturated liquid and vapour at NBP

**Confidence A** — NIST reference EOS at exactly *P* = 1.01325 bar, by linear
interpolation between adjacent tabulated saturation states (interval under
0.02 bar in every case; interpolation error negligible). Latent heat is
*h*(sat. vapour) − *h*(sat. liquid) at 1 atm.

| Fluid | ρ_liquid (kg/m³) | ρ_sat.vapour (kg/m³) | Δh_vap (kJ/kg) | Δh_vap (kJ/mol) |
|---|---|---|---|---|
| O₂ | **1141.18** | 4.4671 | **213.06** | 6.818 |
| N₂ | **806.085** | 4.61213 | **199.18** | 5.580 |
| CH₄ | **422.355** | 1.81643 | **510.83** | 8.195 |
| H₂ (normal) | **70.8484** | 1.33217 | **448.71** | 0.9045 |
| p-H₂ | **70.8281** | 1.33861 | **446.07** | 0.8992 |
| He | **124.670** | 16.9025 | **20.564** | 0.08231 |
| Ar | **1395.40** | 5.77357 | **161.14** | 6.437 |

Helium's latent heat is one-tenth of nitrogen's and one twenty-fifth of methane's.
A given heat leak boils off vastly more helium than anything else, and helium's
saturated vapour at NBP is unusually dense (16.9 kg/m³, only 7.4× less dense than
the liquid) — which is why helium dewars vent so freely.

### Other liquid properties at NBP (Confidence A)

| Fluid | *c*_p liquid (kJ/kg·K) | *k* liquid (W/m·K) | μ liquid (µPa·s) | σ (N/m) |
|---|---|---|---|---|
| O₂ | 1.6994 | 0.15085 | 194.674 | 0.013146 |
| N₂ | 2.0415 | 0.14485 | 160.662 | 0.008880 |
| CH₄ | 3.4811 | 0.18370 | 116.769 | 0.012921 |
| H₂ (normal) | 9.7724 | 0.10371 | 13.4901 | 0.0019117 |
| p-H₂ | 9.7290 | 0.10070 | — | — |
| He | 5.1798 | 0.018619 | 3.15549 | 0.00008840 |
| Ar | 1.1173 | 0.12852 | 260.294 | 0.012534 |

Liquid helium's thermal conductivity is quoted for **He I above the lambda
point**. Below 2.1768 K, superfluid He II transports heat by a different
mechanism and an ordinary conductivity is meaningless — do not extrapolate this
number downward.

---

## 3. Gas density versus reference condition

**Confidence A** — NIST reference EOS, real gas, along the 1 atm isobar. These are
the denominators of every ratio in §4.

| Fluid | 0 °C | 15 °C | 20 °C | 70 °F (21.11 °C) | 25 °C |
|---|---|---|---|---|---|
| | kg/m³ | kg/m³ | kg/m³ | kg/m³ | kg/m³ |
| O₂ | 1.42905 | 1.35437 | **1.33120** | 1.32615 | 1.30879 |
| N₂ | 1.25040 | 1.18511 | **1.16484** | 1.16042 | 1.14525 |
| CH₄ | 0.71746 | 0.67984 | **0.66816** | 0.66563 | 0.65689 |
| H₂ (normal) | 0.08988 | 0.08521 | **0.08375** | 0.08344 | 0.08235 |
| p-H₂ | 0.08988 | 0.08521 | **0.08375** | 0.08344 | 0.08235 |
| He | 0.17848 | 0.16920 | **0.16631** | 0.16569 | 0.16353 |
| Ar | 1.78398 | 1.69076 | **1.66184** | 1.65553 | 1.63387 |
| **Dry air** | **1.2922** | **1.2250** | **1.2041** | **1.1996** | **1.1839** |

Ortho/para makes **no** difference to gas density (same molar mass; the spin
isomers differ in heat capacity, not density) — hence identical rows. They differ
substantially in *c*_p: see §5.

**Air row basis:** ρ = *PM*/*RT* with *M*(dry air) = 28.9647 g/mol (CIPM-2007) and
*R* = 8.314462 J/mol·K. Confidence A; the real-gas correction is under 0.1 %,
smaller than the effect of humidity. The 15 °C value, 1.2250 kg/m³, is the
ISO 2533 sea-level density and agrees to four significant figures. Saturated air
at 20 °C is about 1.19 kg/m³, ~1 % lighter than dry, because H₂O (18) is lighter
than air (29). Noise for safety reasoning; not noise for precise buoyancy work.

### Vapour specific gravity (relative to dry air at the same temperature, 20 °C)

| Fluid | ρ_gas / ρ_air at 20 °C | A *warm* release |
|---|---|---|
| O₂ | **1.1056** | sinks |
| N₂ | **0.9674** | rises, but only just |
| CH₄ | **0.5549** | rises strongly |
| H₂ | **0.0696** | rises very strongly |
| He | **0.1381** | rises strongly |
| Ar | **1.3802** | sinks strongly |

Air Products publishes 1.11 (O₂), 0.967 (N₂) and 0.0696 (H₂) at 68 °F — exact
agreement with the computed values. Confidence A/B concordant.

Note the nitrogen result: **warm nitrogen vapour is slightly *lighter* than air**
(0.967), because air is 21 % oxygen and ~0.9 % argon, both heavier than N₂. A
room-temperature nitrogen release drifts weakly upward; a cold one falls. See §6.

---

## 4. Liquid-to-gas expansion ratios

**The ratio is ρ_liquid(at NBP) ÷ ρ_gas(at the stated warm condition, 1 atm).**
Never quote one of these numbers without its reference condition.

### 4a. Computed from NIST data (Confidence A)

| Fluid | → 0 °C | → 15 °C | → 20 °C | → 70 °F | → 25 °C | → sat. vapour at NBP |
|---|---|---|---|---|---|---|
| O₂ | 798.6 | 842.6 | **857.3** | **860.5** | 871.9 | 255.5 |
| N₂ | 644.7 | 680.2 | **692.0** | **694.6** | 703.9 | 174.8 |
| CH₄ | 588.7 | 621.3 | **632.1** | **634.5** | 643.0 | 232.5 |
| H₂ (normal) | 788.2 | 831.5 | **845.9** | **849.1** | 860.3 | 53.2 |
| p-H₂ | 788.0 | 831.3 | **845.7** | **848.9** | 860.1 | 52.9 |
| He | 698.5 | 736.8 | **749.6** | **752.5** | 762.4 | 7.4 |
| Ar | 782.2 | 825.3 | **839.7** | **842.9** | 854.0 | 241.7 |

### 4b. The industry figures, and their exact basis

**Air Products Safetygram-27, Table 1, "Expansion Ratios at 70 °F of Common
Cryogenic Fluids (Liquid to Gas)".** Confidence B (industrial primary). The
document's own worked example fixes the basis beyond doubt: *"1 cubic foot of
liquid argon will create 841 cubic feet of gaseous argon at 70 °F."*

| Fluid | Air Products @ 70 °F | Computed @ 70 °F | Agreement |
|---|---|---|---|
| Argon | 1 : **841** | 842.9 | 0.2 % |
| Helium | 1 : **754** | 752.5 | 0.2 % |
| Hydrogen | 1 : **848** | 849.1 | 0.1 % |
| Nitrogen | 1 : **696** | 694.6 | 0.2 % |
| Oxygen | 1 : **861** | 860.5 | 0.06 % |

Use these five when the course wants "the industry figure". The basis is
**liquid at NBP → gas at 70 °F and 1 atm**.

**Methane has no Air Products Safetygram in this series** (it is sold as LNG, not
as a pure industrial cryogen), which is why circulating methane expansion ratios
scatter from about 600 to 650. Use **632 : 1 at 20 °C** or **634 : 1 at 70 °F**,
computed here, and state the basis. See §14.1 for Sandia's 648.

### 4c. The 694-versus-696 lesson — teach this one

Air Products *Safetygram-7 (Liquid Nitrogen)* states *"Expansion Ratio, Liquid to
Gas, BP to 68 °F (20 °C) — 1 to 694."* Air Products *Safetygram-27* states
**696 at 70 °F**. Same publisher, two different numbers, and **both are right**:
they differ only by the 2 °F difference in reference temperature. The computed
values bracket them identically — 692.0 at 20 °C, 694.6 at 70 °F.

This is the worked example the course should use to make the reference-condition
point. It is a real, citable, same-publisher disagreement that dissolves entirely
once the basis is stated. **Use 696 with the 70 °F basis** for consistency with
the rest of the Safetygram-27 table; note that 694 exists and why.

> **The ratio that actually matters in a confined space.** The 600–860 : 1 figures
> assume the gas ends up at room temperature. In the first seconds of a spill it
> does not — it is cold and dense. The *immediate* volume produced is the last
> column of §4a: only 175 : 1 for nitrogen, 7.4 : 1 for helium. The
> room-temperature ratio is the right number for "how much gas will eventually
> exist" (asphyxiation inventory, relief sizing); the NBP ratio is closer to the
> right number for "how fast is the cloud growing right now". Quote the large
> number, and know that it is an upper bound.

---

## 5. Gas-phase heat capacity and thermal conductivity

**Confidence A**, NIST reference EOS at 20 °C (293.15 K), 1 atm.

| Fluid | *c*_p gas (kJ/kg·K) | *k* gas (W/m·K) |
|---|---|---|
| O₂ | 0.91896 | 0.025946 |
| N₂ | 1.04134 | 0.025473 |
| CH₄ | 2.22060 | 0.033271 |
| H₂ (normal) | **14.2877** | 0.183389 |
| p-H₂ | **14.8923** | 0.190572 |
| He | 5.19320 | 0.153504 |
| Ar | 0.52161 | 0.017496 |

**This is where normal-H₂ and parahydrogen genuinely diverge** — 4 % at room
temperature, far more at low temperature. The ortho→para conversion is exothermic
(about **703 kJ/kg** released at 20 K, which *exceeds* hydrogen's latent heat of
449 kJ/kg), so freshly liquefied normal hydrogen boils itself away over days as
ortho converts to para. This is why all stored LH₂ is catalytically converted to
≥95 % para at the liquefier. **Use parahydrogen properties for stored LH₂ and
normal-hydrogen properties for ambient gaseous H₂.** Confidence A for the
property values; the 703 kJ/kg conversion enthalpy is Confidence B.

---

## 6. Vapour buoyancy — does the cold cloud sink or rise?

**Method (Confidence A):** the crossover temperature is where ρ_vapour(*T*, 1 atm)
from the NIST reference EOS equals ρ_air(20 °C, 1 atm) = 1.2041 kg/m³. This is the
right question for a *small* leak, where the bulk of the room air stays near
ambient.

| Fluid | NBP (K) | Crossover *T* (K) | Crossover *T* (°C) | Warming needed above NBP | Verdict |
|---|---|---|---|---|---|
| **Methane** | 111.667 | **164.25** | −108.90 | **+52.6 K** | Cold vapour sinks and stays down a long time |
| **Hydrogen (n)** | 20.3689 | **22.09** | −251.06 | **+1.7 K** | Sinks over a vanishingly narrow band, then rises |
| Parahydrogen | 20.2712 | 22.07 | −251.08 | +1.8 K | as above |
| **Helium** | 4.2238 | **40.45** | −232.70 | +36.2 K | Sinks briefly, then rises strongly |
| Nitrogen | 77.3549 | 283.62 | **+10.47** | +206 K | Sinks until nearly room temperature |
| Oxygen | 90.1875 | 323.99 | +50.84 | +234 K | Sinks at all realistic temperatures |
| Argon | 87.302 | *never* | — | — | **Denser than air at every temperature**; always sinks |

**Methane, cross-checked.** Computed here from the NIST EOS: **164.25 K**.
Sandia SAND2016-6456 J: *"methane needs to warm up 53.3 K, from 111 K to 164.3 K,
before its gas-phase density equals that of NTP air"* (Confidence B). **Agreement
to 0.05 K.** A methane spill therefore produces a cold, ground-hugging,
*flammable* cloud that must warm by more than 52 K before it will lift.
Combined with methane's LFL of 5 % (§8), this is the central methalox ground
hazard: the cloud goes sideways into trenches, pits and doorways, not up.

**Hydrogen, cross-checked.** Computed: **22.09 K** (normal), 22.07 K (para).
Sandia: *"hydrogen will become more buoyant than NTP air … at 22.07 K … hydrogen
release from LH₂ need only warm up by ~2 K."* Exact agreement. The correct
statement is neither "hydrogen always rises" nor "cold hydrogen sinks" but:
**cold hydrogen vapour is denser than air only within about 1.7 K of its boiling
point, so in practice a hydrogen release becomes buoyant almost immediately.**
This is the reason hydrogen and methane need different ventilation strategies —
hydrogen wants a high vent; methane wants low-level detection and no trenches.

**Helium** crosses at **40.45 K** and warms through it almost instantly, so in
practice helium always rises and collects at ceilings. That is where the sensor
goes and where your head should not.

**Caveat that must travel with this table.** The analysis is for pure vapour
warming in ambient air. A large spill entrains and *chills* the surrounding air,
and the resulting cold air/fuel mixture can stay negatively buoyant well past
these temperatures. **The crossover temperature is a floor on buoyant behaviour,
not a guarantee of it.**

---

## 7. Vapour pressure tables

**Confidence A** — NIST reference EOS saturation lines, retrieved 2026-09-08.
First row is the triple point (lambda point for helium); the 1 atm row is exact by
construction; the last row approaches the critical point. Enough points to draw a
usable *P*–*T* curve; densities included so the same table serves two-phase
inventory work.

### Oxygen

| *T* (K) | *T* (°C) | *P*_sat (bar) | *P*_sat (kPa) | *P*_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 54.361 (triple) | −218.79 | 0.0014628 | 0.14628 | 0.02122 | 1306.08 | 0.010358 |
| 60 | −213.15 | 0.0072593 | 0.72593 | 0.10529 | 1282.00 | 0.046601 |
| 70 | −203.15 | 0.062628 | 6.2628 | 0.90835 | 1236.95 | 0.34575 |
| 77.355 | −195.79 | 0.20763 | 20.763 | 3.0114 | 1202.90 | 1.0434 |
| 80 | −193.15 | 0.30125 | 30.125 | 4.3693 | 1190.46 | 1.4685 |
| **90.1875** | **−182.96** | **1.01325** | **101.325** | **14.696** | **1141.18** | **4.4671** |
| 100 | −173.15 | 2.5401 | 254.01 | 36.841 | 1090.88 | 10.425 |
| 110 | −163.15 | 5.4341 | 543.41 | 78.815 | 1035.47 | 21.281 |
| 120 | −153.15 | 10.223 | 1022.3 | 148.27 | 973.85 | 39.308 |
| 140 | −133.15 | 27.878 | 2787.8 | 404.34 | 813.23 | 116.76 |
| 154.581 (crit.) | −118.57 | 50.430 | 5043.0 | 731.4 | 436.1 | 436.1 |

### Nitrogen

| *T* (K) | *T* (°C) | *P*_sat (bar) | *P*_sat (kPa) | *P*_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 63.151 (triple) | −210.00 | 0.125198 | 12.520 | 1.8158 | 867.22 | 0.67427 |
| 65 | −208.15 | 0.17405 | 17.405 | 2.5244 | 859.60 | 0.91310 |
| 70 | −203.15 | 0.38546 | 38.546 | 5.5906 | 838.51 | 1.8960 |
| **77.3549** | **−195.80** | **1.01325** | **101.325** | **14.696** | **806.08** | **4.6121** |
| 80 | −193.15 | 1.3687 | 136.87 | 19.852 | 793.94 | 6.0895 |
| 90 | −183.15 | 3.6046 | 360.46 | 52.281 | 745.02 | 15.079 |
| 100 | −173.15 | 7.7828 | 778.28 | 112.88 | 689.35 | 31.961 |
| 110 | −163.15 | 14.659 | 1465.9 | 212.60 | 621.45 | 62.581 |
| 120 | −153.15 | 25.106 | 2510.6 | 364.13 | 523.36 | 125.09 |
| 126.192 (crit.) | −146.96 | 33.958 | 3395.8 | 492.5 | 313.30 | 313.30 |

### Methane

| *T* (K) | *T* (°C) | *P*_sat (bar) | *P*_sat (kPa) | *P*_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 90.6941 (triple) | −182.46 | 0.116961 | 11.696 | 1.6963 | 451.475 | 0.25074 |
| 95 | −178.15 | 0.19815 | 19.815 | 2.8740 | 445.71 | 0.40703 |
| 100 | −173.15 | 0.34377 | 34.377 | 4.9860 | 438.88 | 0.67459 |
| 105 | −168.15 | 0.56376 | 56.376 | 8.1767 | 431.92 | 1.0613 |
| **111.667** | **−161.48** | **1.01325** | **101.325** | **14.696** | **422.36** | **1.8164** |
| 120 | −153.15 | 1.9143 | 191.43 | 27.765 | 409.90 | 3.2619 |
| 130 | −143.15 | 3.6733 | 367.33 | 53.276 | 394.04 | 5.9805 |
| 140 | −133.15 | 6.4119 | 641.19 | 92.997 | 376.86 | 10.152 |
| 160 | −113.15 | 15.921 | 1592.1 | 230.91 | 336.31 | 25.382 |
| 180 | −93.15 | 32.852 | 3285.2 | 476.48 | 276.23 | 61.376 |
| 190.564 (crit.) | −82.59 | 45.992 | 4599.2 | 667.1 | 162.66 | 162.66 |

### Hydrogen (normal)

| *T* (K) | *T* (°C) | *P*_sat (bar) | *P*_sat (kPa) | *P*_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 13.957 (triple) | −259.19 | 0.0735782 | 7.3578 | 1.0672 | 77.004 | 0.12985 |
| 15 | −258.15 | 0.12899 | 12.899 | 1.8708 | 76.137 | 0.21346 |
| 16 | −257.15 | 0.20755 | 20.755 | 3.0103 | 75.264 | 0.32507 |
| 18 | −255.15 | 0.46602 | 46.602 | 6.7591 | 73.375 | 0.66527 |
| **20.3689** | **−252.78** | **1.01325** | **101.325** | **14.696** | **70.848** | **1.3322** |
| 22 | −251.15 | 1.5913 | 159.12 | 23.079 | 68.893 | 2.0090 |
| 24 | −249.15 | 2.5807 | 258.07 | 37.431 | 66.199 | 3.1562 |
| 26 | −247.15 | 3.9398 | 393.98 | 57.143 | 63.079 | 4.7674 |
| 28 | −245.15 | 5.7359 | 573.59 | 83.193 | 59.339 | 7.0490 |
| 30 | −243.15 | 8.0432 | 804.32 | 116.66 | 54.538 | 10.445 |
| 33.145 (crit.) | −240.01 | 12.964 | 1296.4 | 188.0 | 31.262 | 31.262 |

### Parahydrogen

| *T* (K) | *T* (°C) | *P*_sat (bar) | *P*_sat (kPa) | *P*_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 13.8033 (triple) | −259.35 | 0.0704108 | 7.0411 | 1.0212 | 76.977 | 0.12555 |
| 15 | −258.15 | 0.13434 | 13.434 | 1.9484 | 75.996 | 0.22240 |
| 16 | −257.15 | 0.21548 | 21.548 | 3.1253 | 75.133 | 0.33766 |
| 18 | −255.15 | 0.48149 | 48.149 | 6.9835 | 73.252 | 0.68802 |
| **20.2712** | **−252.88** | **1.01325** | **101.325** | **14.696** | **70.828** | **1.3386** |
| 22 | −251.15 | 1.6350 | 163.50 | 23.713 | 68.743 | 2.0708 |
| 24 | −249.15 | 2.6478 | 264.78 | 38.403 | 66.010 | 3.2546 |
| 26 | −247.15 | 4.0384 | 403.84 | 58.572 | 62.827 | 4.9236 |
| 28 | −245.15 | 5.8749 | 587.49 | 85.209 | 58.980 | 7.2998 |
| 30 | −243.15 | 8.2319 | 823.19 | 119.39 | 53.976 | 10.871 |
| 32.938 (crit.) | −240.21 | 12.858 | 1285.8 | 186.5 | 31.323 | 31.323 |

### Helium (⁴He)

| *T* (K) | *T* (°C) | *P*_sat (bar) | *P*_sat (kPa) | *P*_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 2.1768 (lambda) | −270.97 | 0.0503933 | 5.0393 | 0.73089 | 146.016 | 1.1744 |
| 2.5 | −270.65 | 0.10228 | 10.228 | 1.4834 | 144.884 | 2.1395 |
| 3.0 | −270.15 | 0.24061 | 24.061 | 3.4898 | 141.201 | 4.4535 |
| 3.5 | −269.65 | 0.47038 | 47.038 | 6.8223 | 135.903 | 8.0655 |
| 4.0 | −269.15 | 0.81510 | 81.510 | 11.822 | 128.739 | 13.548 |
| **4.2238** | **−268.93** | **1.01325** | **101.325** | **14.696** | **124.670** | **16.902** |
| 4.5 | −268.65 | 1.3006 | 130.06 | 18.863 | 118.493 | 22.255 |
| 5.0 | −268.15 | 1.9623 | 196.23 | 28.461 | 99.841 | 39.707 |
| 5.1953 (crit.) | −267.96 | 2.2832 | 228.32 | 33.11 | 69.58 | 69.58 |

Helium's critical point is 5.2 K and 2.28 bar — barely 1 K above its boiling
point. **Helium is very easily driven supercritical.** A dewar that warms
slightly, or a transfer line pressurised above 2.3 bar, has no liquid/vapour
interface at all. Do not reason about helium systems with boiling-liquid
intuition imported from nitrogen.

### Argon

| *T* (K) | *T* (°C) | *P*_sat (bar) | *P*_sat (kPa) | *P*_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 83.8058 (triple) | −189.34 | 0.688909 | 68.891 | 9.9920 | 1416.77 | 4.0547 |
| 85 | −188.15 | 0.78897 | 78.897 | 11.443 | 1409.51 | 4.5908 |
| **87.302** | **−185.85** | **1.01325** | **101.325** | **14.696** | **1395.40** | **5.7736** |
| 90 | −183.15 | 1.3351 | 133.51 | 19.364 | 1378.63 | 7.4362 |
| 95 | −178.15 | 2.1305 | 213.05 | 30.900 | 1346.77 | 11.435 |
| 100 | −173.15 | 3.2377 | 323.77 | 46.959 | 1313.70 | 16.859 |
| 110 | −163.15 | 6.6526 | 665.26 | 96.488 | 1242.77 | 33.287 |
| 120 | −153.15 | 12.130 | 1213.0 | 175.94 | 1162.82 | 60.145 |
| 140 | −133.15 | 31.682 | 3168.2 | 459.51 | 943.71 | 178.86 |
| 150.687 (crit.) | −122.46 | 48.630 | 4863.0 | 705.3 | 535.60 | 535.60 |

---

## 8. Flammability — methane

Methane is the course's primary fuel. Values are for **methane in air at ~25 °C
and 1 atm** unless stated.

| Quantity | Value | Source | Conf. |
|---|---|---|---|
| **LFL in air** | **5.0 vol %** | Bureau of Mines Bulletin 627, Table 2 (flammability tube) | **A** |
| LFL in air, modern closed vessel | 5.0 (120 L); 4.9 (20 L); 4.9 (12 L) | Zlochower & Green, NIOSH | **A** |
| **UFL in air** | **15.0 vol %** | Bulletin 627, Table 2 (flammability tube) | **A** |
| UFL in air, closed vessel | **15.8 vol %** (120 L, 7 % pressure-rise criterion) | Zlochower & Green, NIOSH | **A** |
| **LFL–UFL in oxygen** | **5.15 – 60.5 vol %** | Coward & Jones, Bulletin 503, p. 44 — 2 in tube, upward propagation, read directly | **A** |
| **Stoichiometric conc. in air** | **9.48 vol %** | Bulletin 627, Table 2; Bulletin 680 App. A | **A** |
| **Autoignition temperature in air** | **537 °C (999 °F)** — but see §14.5 | Bulletin 627, Table 4 | **A** |
| AIT in air, alternative | 630 °C | Bulletin 680, Appendix A, minimum AIT, read directly | **A** |
| **Minimum ignition energy in air** | **0.28 – 0.29 mJ** | Sandia SAND2016-6456 J; widely reported | **B** |
| **MIE in pure oxygen** | order of magnitude only — see §14.7 | — | **C** |
| **Limiting oxygen concentration (N₂ diluent)** | **11.1 vol % O₂** (120 L); 12.0 (flammability tube) | Zlochower & Green, NIOSH | **A** |
| LOC, older tube method | 12.8 vol % O₂ | Bulletin 503, p. 45 | **A** |
| **Detonability limits in air** | **6.3 – 13.5 vol %** | Sandia SAND2016-6456 J | **B** |
| **Adiabatic flame temp., stoich. in air** | **2224 K (1951 °C)** equilibrium | Marzouk (2023), NASA CEARUN, reactants 298.15 K, 1 atm | **B** |
| **Adiabatic flame temp., stoich. in oxygen** | **3050 K (2777 °C)** equilibrium | Marzouk (2023), NASA CEARUN | **B** |
| Min. pressure for spontaneous ignition on sudden release | ~100 bar | Sandia, citing Dryer et al. | **B** |
| Flash point (lower temperature limit) in air | **−187 °C** (Bulletin 627) / −188 °C (Bulletin 680) | Bulletin 627 Table 4; Bulletin 680 App. A | **A** |

**On the oxy-methane flame temperature: quote 3050 K**, the chemical-equilibrium
value. The 5166 K "complete combustion" figure in the same source assumes
products are only CO₂ and H₂O with no dissociation; at those temperatures
dissociation is enormous and the number is physically unreachable. It is an upper
bound for a thermodynamics exercise, nothing more. **Presenting 5166 K as "the
flame temperature of methalox" would be wrong.**

**Self-sustaining versus classical LFL.** Sandia (citing Cashdollar et al.) note
that in *quiescent* mixtures buoyancy raises the concentration needed for a fully
self-sustaining fire above the classical LFL: methane ~6 %, hydrogen ~8 %. Mild
turbulence (a fan at 1–1.5 m/s) restores hydrogen to 4 %; methane is barely
affected. **Design to the classical LFL, not the self-sustaining value** — the
classical limit is what a spark or laser will ignite locally. Confidence B.

**A flammability limit is not a property of the gas.** It is a property of the gas
plus the vessel plus the ignition source plus the propagation criterion. The
classic "5–15 %" comes from a long flammability tube with a visual criterion; a
closed vessel with a pressure-rise criterion gives 15.8 % on the rich side *and* a
lower limiting oxygen concentration. Use the value the governing code uses, know
which one your detector is calibrated against, and never treat the number as a
bright line to operate up to.

---

## 9. Flammability — hydrogen (appendix fluid)

| Quantity | Value | Source | Conf. |
|---|---|---|---|
| **LFL–UFL in air** | **4.0 – 75.0 vol %** | Bulletin 627 Table 21; Air Products Safetygram-9; Sandia | **A** |
| LFL in air, closed vessel | 7 (120 L); 6 (20 L) — vessel/criterion dependent | Zlochower & Green, NIOSH | **A** |
| UFL in air, closed vessel | 75.9 vol % | Zlochower & Green, NIOSH | **A** |
| **LFL–UFL in oxygen** | **4.65 – 93.9 vol %** (2 in tube, upward, open) | Coward & Jones, Bulletin 503, p. 19, read directly | **A** |
| LFL–UFL in oxygen, closed tubes | 3.9 – 95.8 vol % | Bulletin 503, p. 19 | **A** |
| LFL–UFL in oxygen | 4.0 – 95 vol % | Bulletin 627, Table 21 | **A** |
| **Detonability limits in air** | **18.2 – 58.9 vol %** | Air Products Safetygram-9 | **B** |
| **Detonability limits in oxygen** | **15 – 90 vol %** | Air Products Safetygram-9 | **B** |
| **Autoignition temperature in air** | **roughly 500–580 °C, apparatus-dependent** — see §14.5 | Air Products Safetygram-9 (500–577 °C) | **B** |
| AIT in air, alternative | 400 °C | Bulletin 627, appendix table | **A** |
| **Minimum ignition energy in air** | **0.017 – 0.020 mJ** | Sandia (0.020); Lewis & von Elbe (0.019) | **B** |
| **MIE in pure oxygen** | order of magnitude only — see §14.7 | — | **C** |
| **Limiting oxygen concentration (N₂ diluent)** | **4.6 vol % O₂** (120 L); 5.0 (flammability tube) | Zlochower & Green, NIOSH | **A** |
| **Stoichiometric conc. in air** | **29.53 vol %** | Sandia SAND2016-6456 J | **B** |
| **Adiabatic flame temp., stoich. in air** | **2379 K (2106 °C)** equilibrium | Marzouk (2023) | **B** |
| **Adiabatic flame temp., stoich. in oxygen** | **3075 K (2802 °C)** equilibrium | Marzouk (2023) | **B** |
| Min. pressure for spontaneous ignition on sudden release | ~41 bar | Sandia, citing Dryer et al. | **B** |

**Context for MIE: a static discharge from a human being is about 10 mJ**
(Sandia) — roughly 35× methane's MIE and 500× hydrogen's. Both fuels ignite
trivially from ordinary static, and the difference between 0.02 and 0.29 mJ is not
operationally meaningful when the available energy is 10 mJ. The honest teaching
point is that **neither margin is a margin**, not that hydrogen is 14× worse.

**Note the AIT/MIE inversion:** hydrogen's AIT is *higher* than methane's despite
hydrogen being far easier to spark-ignite. AIT and MIE measure different things
and rank the two fuels oppositely. Good exam question; common misconception.

### Methane against hydrogen, for facility design

| | Methane | Hydrogen | Design consequence |
|---|---|---|---|
| Flammable range in air | 5 – 15 % | 4 – 75 % | Methane's window is narrow; a leak is more often outside it. |
| Flammable range in O₂ | 5.15 – 60.5 % | 4.65 – 93.9 % | Oxygen closes most of that gap. **Methane's advantage over hydrogen is an air-only advantage.** |
| MIE in air | ~0.28 mJ | ~0.017 mJ | Both far below a human static discharge. Bonding and grounding mandatory for both. |
| Vapour density behaviour | dense when cold, buoyant when warm | buoyant almost immediately | **The biggest divergence.** Hydrogen practice is roof vents and high-point detection; methane practice must cover both regimes. |
| NEC gas group | **Group D** | **Group B** | Group D equipment is cheaper and far more available. A genuine capital-cost advantage for methane. **[B]** |

---

## 10. Oxygen — oxidiser, not fuel

### 10a. It does not burn

**Oxygen is an oxidiser, not a fuel. It is non-flammable.** It cannot burn; it
makes other things burn. This is not pedantry — it determines the entire control
strategy, because you cannot make an oxygen system safe by eliminating oxygen,
only by eliminating fuels and ignition sources.

> *"Liquid oxygen is pale blue and extremely cold. Although nonflammable, oxygen
> is a strong oxidizer."* — Air Products, *Safetygram-6*. **B**

> *"Although oxygen itself is nonflammable, ordinary combustible materials will
> burn more vigorously. Materials that normally do not burn in air may burn in an
> oxygen-enriched atmosphere."* — Air Products, *Safetygram-27*. **B**

Dry air is **20.95 vol % O₂**. Confidence A.

### 10b. Paramagnetism and the blue colour

O₂ has a **triplet ground state** (³Σ⁻_g): two unpaired electrons in degenerate π*
antibonding orbitals. Two visible consequences of one piece of electronic
structure:

- **Liquid oxygen is paramagnetic** and is visibly attracted to a magnet — poured
  between the poles of a strong magnet it bridges the gap and is held there.
  Confidence B (standard university lecture demonstration).
- **Liquid oxygen is pale blue.** The colour is not ordinary single-molecule
  absorption; it arises from **bimolecular (simultaneous-pair) absorption**, in
  which two colliding O₂ molecules are excited together in one photon event.
  Because it needs a collision pair, the absorption scales with the square of
  density — which is why the colour is obvious in the liquid and invisible in the
  gas. Confidence B for the mechanism (see §14.13).

Practical note: paramagnetism is how most oxygen analysers work, and it is why
oxygen is measurable against a background of nitrogen and argon without chemistry.
It also means a strong magnetic field can retain LOX — relevant near
superconducting magnets, where LN₂-cooled surfaces may already be condensing
oxygen (§11.1).

### 10c. How oxygen enrichment changes flammability

**This is the result the course must get right: the lower limit barely moves; the
upper limit explodes.**

> *"The lower limits in oxygen and in a wide variety of oxygen–nitrogen mixtures
> are essentially the same as those in air at the same temperature and pressure."*
> — Bureau of Mines Bulletin 627 (Zabetakis), "Limits in Other Atmospheres".
> **Confidence A.**

| Fuel | LFL in air | LFL in O₂ | UFL in air | UFL in O₂ | Rich-limit multiplier | Source | Conf. |
|---|---|---|---|---|---|---|---|
| Methane | 5.0 | **5.15** | 15.0 | **60.5** | **×4.0** | Bulletin 503 p. 44 (same apparatus, both media) | **A** |
| Hydrogen | 4.0 | **4.65** | 75.0 | **93.9** | ×1.25 | Bulletin 503 p. 19 | **A** |
| Hydrogen | 4.0 | 4.0 | 75 | 95 | — | Bulletin 627, Table 21 | **A** |

The intuition "oxygen makes everything more flammable, so the flammable range
starts sooner" is **wrong at the lean end**. A leak into an oxygen-rich space does
not ignite at a lower fuel concentration. What changes is:

1. **The rich limit moves enormously** — 15 % → 60.5 % for methane, so the
   flammable *range* widens by roughly 4×. A methane leak into ambient air is
   flammable over a narrow band; a methane leak into an oxygen-enriched space —
   exactly what a co-located LOX leak creates — is flammable over most of the
   composition range.
2. **Materials that are not fuels in air become fuels in oxygen.** This, not the
   LFL, is the dominant hazard. Metals included.
3. **Ignition gets far easier and combustion far more violent.**

> *"Because most materials, including metals, will burn in an oxygen-enriched
> environment, hazards are always present when using oxygen. Most materials will
> ignite at considerably lower temperatures in an oxygen-enriched environment than
> in air, and once ignited, combustion rates are greater… Many metals burn
> violently in an oxygen-enriched environment when ignited."*
> — NASA TM-104823, *Guide for Oxygen Hazards Analyses*, WSTF. **Confidence A.**

> *"Nearly all polymer materials are flammable in 100 percent oxygen at
> atmospheric pressure."* — NASA/TM-2007-213740 §4.2. **Confidence A.**

**Oxygen-saturated clothing** deserves its own line because it kills people:
*"Clothing saturated with oxygen is readily ignitable and will burn vigorously."*
Air Products advise removing exposed clothing immediately and airing it **at least
an hour**, away from ignition sources. *Safetygram-6*. **B**

Quantitative material assessment is governed by **ASTM G63** (non-metals),
**ASTM G94** (metals) and **ASTM G88** (system design) — see `standards.md`. These
are paywalled; cite them as the authority for material selection without
reproducing their tables.

---

## 11. The course-critical facts, verified

### 11.1 LN₂-cooled surfaces condense oxygen from air

| | NBP |
|---|---|
| Nitrogen | **77.3549 K** (−195.80 °C) |
| Oxygen | **90.1875 K** (−182.96 °C) |
| **Gap** | **12.83 K** |

Any surface at LN₂ temperature is **12.8 K below the boiling point of oxygen**, so
oxygen condenses onto it out of the surrounding air.

**The sharpest way to state it (computed here, Confidence A):** the vapour
pressure of pure oxygen at 77.355 K is **0.2076 bar**, and the partial pressure of
oxygen in air at 1 atm is **0.2122 bar** (0.20946 × 1.01325). These are nearly
identical. **LN₂'s boiling point sits essentially exactly at the condensation
point of atmospheric oxygen** — atmospheric oxygen is at saturation at LN₂
temperature, and any surface even marginally colder condenses it continuously.
That coincidence is exact, not approximate.

**Composition of the first condensate — derived here, not repeated.** Dew point of
air at 1 atm from Raoult's law with NIST vapour pressures:

| *T* (K) | *P*_sat N₂ (bar) | *P*_sat O₂ (bar) | Σx_i | O₂ in first condensate |
|---|---|---|---|---|
| 81.0 | 1.5252 | 0.3444 | 1.143 | 54.1 % |
| 81.7 | 1.6424 | 0.3774 | 1.051 | 53.6 % |
| **82.0** | **1.6947** | **0.3923** | **1.015** | **53.5 %** |
| 82.5 | 1.7846 | 0.4181 | 0.957 | 53.2 % |

**Air's dew point at 1 atm is ~82 K, and the first liquid to condense is
~53.5 mol % oxygen**, against 20.95 % in the air it came from. Confidence A for
the computation; the ideal-solution (Raoult) assumption makes it good to a few
percent, not better. This independently confirms the ~50 % figure in university
EHS literature — Cornell EHS quotes the same ~82 K dew point and ~50 % composition
(Confidence B), and LBNL PUB-3000 Ch. 29 describes "liquid air" of **approximately
50 % oxygen** dripping off uninsulated LN₂ lines (Confidence A for LBNL's text).

**Enrichment goes further with time.** In an open or repeatedly topped-up vessel,
nitrogen preferentially boils off and oxygen accumulates; LBNL and other EHS
sources report levels **as high as 80 % oxygen**. The trend is certain; the 80 %
figure is not traced to a primary measurement. **Say "approximately 50 % oxygen
initially, rising toward 80 % or higher with continued exposure", and mark the
upper figure as indicative.** See §14.9.

**The useful contrast:** LN₂ and LH₂ condense oxygen; **liquid methane cannot** —
its NBP, 111.7 K, is 21.5 K *above* oxygen's. Methalox systems do not have the
LN₂ oxygen-condensation problem on the fuel side; they have a different one
(§11.2). Sandia SAND2016-6456 J states the same contrast and adds that LH₂ can
*solidify* air, clogging hydrogen lines with condensed air and depositing
condensed oxygen. Confidence B.

### 11.2 LOX can freeze methane — the 0.507 K margin

| Quantity | Value | Source | Conf. |
|---|---|---|---|
| **Methane triple point (freezing point)** | **90.6941 K** (−182.456 °C) | NIST reference EOS (Setzmann & Wagner) | **A** |
| Methane triple point, WebBook average of 25 literature values | 90.67 ± 0.03 K | NIST WebBook | **A** |
| **Oxygen NBP** | **90.1875 K** (−182.962 °C) | NIST reference EOS | **A** |
| **Margin** | **methane freezes 0.507 K ABOVE LOX's boiling point** | computed here | **A** |

**LOX at its normal boiling point is half a kelvin colder than the temperature at
which methane freezes solid.** Boiling LOX at 1 atm will freeze methane on
contact, with about half a degree to spare. That is not a comfortable margin — it
is a coincidence of half a kelvin, and it is the defining thermal constraint of
methalox vehicle design.

Independent corroboration: NASA MSFC's ISRU propellant trade study (Chen) lists
methane's freezing point as 163.5 °R = **90.8 K** and LOX tank temperature as
160 °R = 88.9 K. Confidence A.

Consequences (Confidence B — engineering literature, consistent with the physics):

- **A LOX/methane heat exchanger must be deliberately *de*-rated.** Gaseous
  methane entering a LOX-cooled exchanger condenses at 111.7 K, keeps cooling
  toward 90.2 K, and freezes — plugging the exchanger. Designers insulate to
  *retard* heat transfer, the opposite of normal practice.
- **Densification runs into the same wall.** The useful methane window between NBP
  (111.7 K) and freezing (90.7 K) is 21 K wide, and its cold end coincides with
  LOX's boiling point. Chen's table lists subcooled methane at 101.7 K —
  deliberately only ~11 K above its own freezing point. Sub-cooling buys density
  and margin against boiling while spending margin toward freezing.
- **Common-bulkhead tanks put the two fluids in thermal contact by design**, so
  the bulkhead sits between a fluid at 90.2 K and a fluid that freezes at 90.7 K.

**State this as a design constraint that follows from the property data, not as
something that has been observed to happen.** No NASA or industry primary source
reporting an actual methane-freezing incident in a methalox heat exchanger or
common bulkhead was found (§14.15).

**The contrast for the same lesson:** LOX cannot freeze *hydrogen* (H₂ freezes at
14.0 K), but LH₂ *can* freeze oxygen, nitrogen and air solid. The freezing hazard
reverses direction between hydrolox and methalox.

### 11.3 Purge and pressurant gas — where nitrogen stops working

**Confidence A** for the saturation data (NIST nitrogen saturation table) and for
the inference.

| Nitrogen saturation temperature | Saturation pressure |
|---|---|
| 90 K (≈ LO₂ NBP) | **3.60 bar** (~52 psia) |
| 102 K | 8.92 bar |
| 108 K | 13.03 bar |
| 111.7 K (≈ LCH₄ NBP) | ~15.6 bar (interpolated) |
| 114 K | 18.35 bar |

| Purge gas | vs LH₂ (20.3 K) | vs LO₂ (90.2 K) | vs LCH₄ (111.7 K) |
|---|---|---|---|
| **Nitrogen** (TP 63.15 K, NBP 77.35 K) | **Freezes solid. Prohibited.** | Gaseous at 1 bar; **condenses above ~3.6 bar** | Gaseous at 1 bar; **condenses above ~15.6 bar** |
| **Helium** (NBP 4.22 K) | Gaseous | Gaseous | Gaseous |

Helium is the only element that stays gaseous at liquid-hydrogen temperature,
which is why LH₂ systems purge with helium and not nitrogen. For methalox, "GN₂
does not freeze" is true but incomplete: **nitrogen can liquefy in a methalox
system**, depositing liquid nitrogen where gas was intended, with consequences for
pressurant collapse, unexpected chilling and slug flow. Purge and pressurant
supplies routinely run well above 3.6 bar.

### 11.4 Oxygen deficiency and enrichment thresholds

**OSHA, 29 CFR 1910.146** (Permit-Required Confined Spaces), definitions.
Confidence **A**:

- **Oxygen-deficient atmosphere:** less than **19.5 % oxygen by volume**.
- **Oxygen-enriched atmosphere:** more than **23.5 % oxygen by volume**.
- A **hazardous atmosphere** includes oxygen outside the **19.5 – 23.5 %** band,
  and separately a flammable gas above **10 % of its LFL**.

The same pair appears in OSHA's Respiratory Protection standard, 29 CFR 1910.134,
and is confirmed independently by EIGA Doc 44/18 and Air Products *Safetygram-6*.

> `ecfr.gov` and `osha.gov` both refuse automated fetches, so this text is
> corroborated from three independent secondary reproductions rather than read off
> the primary page. **The threshold values are not in doubt; if a module
> reproduces the definition verbatim, check the wording against the live CFR.**

**The 10 %-of-LFL rule, applied** (Confidence A, arithmetic on A-grade inputs):
for methane (LFL 5.0 %) the action level is **0.5 vol % methane**; for hydrogen
(LFL 4.0 %) it is **0.4 vol % hydrogen**.

**Physiological effects** — EIGA Doc 44/18, Table 1, sea level (760 mmHg).
Confidence **A/B**. CGA SB-2 is the US equivalent but is paywalled; EIGA Doc 44 is
free and states the same thresholds.

| O₂ (vol %) at sea level | Effects |
|---|---|
| **20.9** | Normal. (Below 19.5 % is considered oxygen deficient.) |
| **19.5 – 10** | Increased breathing rate; accelerated heartbeat; impaired attention, thinking and coordination. |
| **10 – 6** | Nausea, vomiting, lethargic movements, perhaps unconsciousness. |
| **< 6** | Convulsions, then cessation of breathing, then cardiac standstill. **These symptoms can occur immediately.** |

EIGA's qualifiers, which must travel with the table:

- These are for **a healthy average person at rest.** Health, exertion and
  altitude shift both the symptoms and the concentrations at which they appear.
- **Altitude:** the *percentage* of oxygen does not change with altitude, but the
  partial pressure does. A 19.5 % reading is not equally safe everywhere.
- *"An oxygen-deficient atmosphere can bring about unconsciousness without
  warning. In as little as one or two breaths, an individual's life can be
  endangered."*
- Inert gases are **odourless, colourless and tasteless — more dangerous than
  toxic gases such as chlorine or ammonia, which announce themselves by smell.**
- Rescuer entry without breathing apparatus is *"one of the most common causes of
  multiple fatalities in cases involving asphyxiation."*

---

## 12. Vapour density and buoyancy summary

Consolidated from §3 and §6. Air reference: dry air, 1 atm. All Confidence A.

| Fluid | ρ_vapour at its own NBP (kg/m³) | × denser than 20 °C air | ρ_vapour at 20 °C (kg/m³) | × vs 20 °C air | Crossover *T* |
|---|---|---|---|---|---|
| O₂ | 4.4671 | 3.71 | 1.33120 | 1.106 | 324.0 K |
| N₂ | 4.6121 | 3.83 | 1.16484 | 0.967 | 283.6 K |
| CH₄ | 1.8164 | 1.51 | 0.66816 | 0.555 | **164.3 K** |
| H₂ (n) | 1.3322 | 1.11 | 0.08375 | 0.070 | **22.09 K** |
| p-H₂ | 1.3386 | 1.11 | 0.08375 | 0.070 | 22.07 K |
| He | 16.9025 | 14.04 | 0.16631 | 0.138 | 40.45 K |
| Ar | 5.7736 | 4.79 | 1.66184 | 1.380 | *never* |
| Dry air (20 °C) | — | 1.00 | 1.2041 | 1.000 | — |

The middle columns make the point: **at their boiling points, every one of these
vapours is denser than ambient air** — even hydrogen (1.11×) and helium (14×).
Every cryogenic release starts as a falling cloud. What differs is how long it
stays one.

---

## 13. Data hygiene rule

**Take fixed points and properties from the NIST *fluid properties* database
(`webbook.nist.gov/chemistry/fluid/`, the reference equations of state), not from
the WebBook's phase-change summary pages (`Mask=4`).** The latter aggregate a
century of literature with no quality filter, and several entries are plainly
wrong. Observed during verification: argon triple point listed as 87.78 K (above
argon's own boiling point, impossible); argon critical pressure listed as both
4.8979 bar and 48.9805 bar; nitrogen critical pressure listed as 3.0698 bar;
hydrogen triple point listed as 0 K at 0 bar; a nitrogen Antoine coefficient of
63792. Sections 1–7 of this file follow the rule.

---

## 14. Contested and unverified figures

Nothing below may be quoted to students without its caveat.

**14.1 Methane expansion ratio: 632 vs 648 — resolved; Sandia is the outlier.**
Sandia SAND2016-6456 J gives 648.0 (NBP → 293.15 K); computed here, 632.1 at the
same stated conditions. The discrepancy is entirely in the gas density: Sandia use
ρ_CH₄ = 0.65119 kg/m³ where NIST gives 0.66816 at 293.15 K — 0.65119 corresponds
to a temperature near 300 K, so the value appears to pair a density tabulated at
one temperature with a label naming another. Sandia's hydrogen density matches
NIST exactly, so the error is specific to methane. **Use 632 (20 °C) or
634 (70 °F). Note 648 exists.** Sandia's report is otherwise excellent and is
relied on elsewhere in this file.

**14.2 Nitrogen expansion ratio: 694 vs 696 — resolved; not a real disagreement.**
Both are Air Products values at different reference temperatures (68 °F vs 70 °F).
See §4c. **Use 696 with the 70 °F basis.**

**14.3 Methane UFL: 15.0 vs 15.8 vol %.** 15.0 % is Bulletin 627's
flammability-tube value (visual criterion); 15.8 % is NIOSH's 120-L closed-vessel
value (pressure-rise criterion). Both Confidence A. This is a genuine **method**
difference, not an error — closed-vessel pressure criteria systematically return
wider limits. **Use 15 % as the classical/regulatory figure, cite 15.8 % as the
modern closed-vessel value, and teach that limits are method-dependent.**

**14.4 Methane LFL: 5.0 vs 5.3 vol %.** Bulletin 627 and NIOSH both give 5.0 %
(NIOSH 4.9–5.0 depending on vessel). Sandia quotes 5.3 % from a secondary
reference. **Use 5.0 %.** Not operationally significant, but be internally
consistent.

**14.5 Autoignition temperatures are apparatus-dependent, and both fuels are
contested.**
- *Methane:* **537 °C** (Bulletin 627 Table 4, and the value universally used in
  hazardous-area-classification practice, usually attributed to NFPA 497) versus
  **630 °C** (Bulletin 680 Appendix A, read directly). The NFPA 497 table itself
  could not be read — it is paywalled — so the *provenance* of 537 °C is
  Confidence C even though its currency in practice is not in doubt.
  **For area classification, use the value in the code being worked to;** a
  designer who picks 630 °C where the AHJ uses 537 °C has chosen a less
  conservative surface-temperature limit.
- *Hydrogen:* **400 °C** (Bulletin 627 appendix, A) versus **500–577 °C**
  (Air Products, B); 585 °C also circulates. **Quote a range — "roughly
  500–580 °C, apparatus-dependent" — and do not present a single figure.**

AIT is strongly apparatus-dependent (vessel size and material, surface catalysis,
residence time) and is not a fundamental property. That is why published values
scatter, and it is worth saying so.

**14.6 Hydrogen LFL: 4.0 vs 6–7 vol %.** 4.0 % is the classical tube value; 6–7 %
is the NIOSH closed-vessel pressure-criterion value; ~8 % is Sandia/Cashdollar's
threshold for a *self-sustaining* fire in a quiescent mixture. All three are
correct answers to different questions. **Use 4.0 % for design and detection** —
it is the concentration at which a local ignition source will produce flame, which
is what a safety margin must protect against.

**14.7 Minimum ignition energy in pure oxygen — UNVERIFIED. Confidence C.**
The figures **0.003 mJ (methane in O₂)** and **0.0012 mJ (hydrogen in O₂)**
circulate widely, usually attributed to Lewis & von Elbe, *Combustion, Flames and
Explosions of Gases*. **Neither could be verified against an accessible primary
source.** Two separate verification passes (properties and oxygen) reached the
same conclusion; the oxygen pass adds that no authoritative citable table of
air-versus-oxygen MIE for common fuels could be found at all.

What *is* well supported: **MIE falls by at least an order of magnitude in oxygen
versus air**, qualitatively confirmed by EIGA Doc 04/26 §5.2. **State the
direction and the order of magnitude, which is solid. Do not put the two specific
numbers on a slide** unless someone checks them against a physical copy of
Lewis & von Elbe or ASTM G63.

**14.8 Methane flammability limits in oxygen.** Now **Confidence A** and settled:
5.15 – 60.5 vol %, read directly off Coward & Jones, Bulletin 503, p. 44, for a
2-inch tube with upward propagation open at the firing end. The commonly quoted
"~5.1 – 61 %" is a rounding of that. Note that the Bulletin 503 figures for
methane and hydrogen were measured on the *same apparatus by the same
investigators*, which makes the air-versus-oxygen comparison in §10c genuinely
apples-to-apples.

**14.9 Oxygen enrichment of LN₂ condensate: 50 % vs 80 %.** ~53.5 % (§11.1) is the
composition of the *first condensate at the dew point* and is well founded. ~80 %
is the level reachable in an open vessel over time — LBNL states it directly, and
preferential nitrogen boil-off makes the direction certain, but no primary
measurement was found. **Use "approximately 50 % oxygen initially, rising toward
80 % or higher with continued exposure", and mark the upper figure indicative.**

**14.10 Air Products' LH₂ latent heat is molar and is easily misread.**
*Safetygram-9* lists "Latent Heat of Vaporization: 385.1 Btu/lb·mole
(895.8 kJ/kmol)". That kJ figure is **per kilomole**: 895.8 ÷ 2.01588 =
**444.4 kJ/kg**, in reasonable agreement with NIST's 448.71 (normal) / 446.07
(para). Anyone skimming for a kJ/kg value will be out by a factor of about two.
**Use the NIST values in §2.**

**14.11 Hydrogen freezing point: 13.85 K vs 13.957 K.** Air Products give
−259.3 °C = 13.85 K; NIST's reference EOS triple point is 13.957 K for normal
hydrogen and 13.8033 K for parahydrogen. The Air Products figure is close to the
*parahydrogen* value, which is arguably the more relevant one for stored LH₂.
**Use 13.96 K for normal H₂ and 13.80 K for parahydrogen, and say which.**

**14.12 Adiabatic flame temperatures vary widely across sources.** The Marzouk
(2023) CEARUN values in §8 and §9 are internally consistent and transparently
sourced, but published methane-air AFTs run from ~2200 K to ~2480 K depending on
whether dissociation is included, the reactant temperature, and whether the value
is adiabatic or measured. **Always state "stoichiometric, reactants at 298.15 K,
1 atm, chemical equilibrium" alongside the number.** Measured flame temperatures
are always lower than adiabatic ones because of radiative loss.

**14.13 Oxygen's colour mechanism is lightly sourced.** The pale-blue colour and
the paramagnetism are textbook-solid, and "pale blue" is confirmed by Air
Products' own Safetygram-6. The specific mechanism in §10b — bimolecular
simultaneous-pair absorption — is correct but is sourced here to secondary
material rather than a spectroscopy primary. **Confidence B.** Safe to teach;
cite a physical-chemistry textbook if a formal reference is needed.

**14.14 Minimum ignition energies in air are secondary-sourced.** Both the methane
(0.28–0.29 mJ) and hydrogen (0.017–0.020 mJ) figures are consistent across
multiple reputable compilations but no primary measurement was read.
**Confidence B.** Do not print them to more than two significant figures.

**14.15 The methane-freezing failure mode is inferred, not observed.** The
temperatures in §11.2 are Confidence A and the collision is elementary, but no
primary source documenting an *actual* methane-freezing incident in a methalox
heat exchanger or common-bulkhead tank was found. Say "this is a design constraint
that follows from the property data", not "this has happened".

**14.16 OSHA and eCFR text was not read from the primary page.** See §11.4.

### Open items for follow-up

1. Verify MIE in pure oxygen (§14.7) against Lewis & von Elbe or ASTM G63.
   Currently C and excluded from teaching material.
2. Read the OSHA 1910.146 definitions off the live CFR and confirm the verbatim
   wording (§11.4). Threshold values are certain; the phrasing is not confirmed.
3. Cross-check §2–§4 against the Air Liquide Gas Encyclopedia, which could not be
   reached during verification.
4. Find a primary measurement for the 80 % oxygen enrichment figure (§14.9), or
   drop the number.
5. Locate a NASA or CGA document stating the LOX-freezes-methane constraint
   explicitly (§11.2, §14.15).
6. Obtain the NFPA 497 AIT table and settle the 537 °C provenance (§14.5).

---

**Sources for every value in this file are listed in `sources.md`.** The full
verification record — including sources consulted and rejected, fetch failures,
and the reasoning behind each confidence label — is in `_verify-properties.md`,
`_verify-methane.md`, `_verify-oxygen.md` and `_verify-hazards-ehs.md`.
