# Verified fluid-property reference — cryogenic propulsion safety course

**Status:** working reference, compiled 2026-09-08. This file is the single source of
numbers for the whole course. Nothing here is from memory; every value carries a source
and a confidence label. Where sources disagree, all values are listed and the
disagreement is explained in [§13 Contested or ambiguous figures](#13-contested-or-ambiguous-figures).

## Confidence key

| Label | Meaning |
|---|---|
| **A** | Primary. NIST reference equations of state, NIST Chemistry WebBook, a named government standard (OSHA/NIOSH/US Bureau of Mines), or a value I computed directly from A-grade data (computation stated). |
| **B** | Reputable secondary. National-laboratory report, industrial gas producer's published safety literature (Air Products, EIGA), peer-reviewed paper. |
| **C** | Unconfirmed. Widely repeated but I could not trace it to an accessible primary source. **Do not put a C value in front of students as fact** — quote it with its caveat or leave it out. |

## Reference-condition convention (read this before quoting any density or ratio)

Most of the apparent disagreement between published cryogenic property tables is not
disagreement about physics — it is undeclared reference conditions. This file therefore
**never** writes "gas density" or "expansion ratio" without stating the temperature.

| Shorthand used here | Exact meaning |
|---|---|
| **NBP** | Normal boiling point: saturation at *P* = 1 atm = 1.01325 bar = 101.325 kPa exactly. |
| **1 atm** | 101.325 kPa exactly. All pressures absolute unless marked gauge. |
| **0 °C** | 273.15 K, 1 atm. ("STP" in the IUPAC-1982 and older senses — see below.) |
| **15 °C** | 288.15 K, 1 atm. ISO 2533 standard atmosphere sea level; common in European gas literature. |
| **20 °C** | 293.15 K, 1 atm. "NTP" as used by Sandia and Air Products (68 °F). |
| **70 °F** | 294.2611 K, 1 atm. **The basis of the expansion ratios quoted in US safety literature.** |
| **25 °C** | 298.15 K, 1 atm. "NTP"/"SATP" in some chemistry usage. |

> **Warning on "STP".** The term is ambiguous and this file avoids it in load-bearing
> places. IUPAC redefined STP in 1982 from 0 °C/1 atm to 0 °C/1 bar (100 kPa), which
> changes gas density by 1.3%. NIST's own "standard temperature and pressure" for gas
> volumes is 20 °C/1 atm, and US industrial gas practice ("scf") is usually 70 °F/1 atm.
> When the course must say STP, say **0 °C and 1 atm** and give the number.

---

## 1. Identity and fixed points

All values in this table are **Confidence A**, read directly from the NIST Thermophysical
Properties of Fluid Systems database (the reference equations of state that also underlie
REFPROP), retrieved 2026-09-08 from `webbook.nist.gov/chemistry/fluid/`. Reference EOS by
fluid: oxygen — Schmidt & Wagner (1985)/Lemmon & Jacobsen; nitrogen — Span et al. (2000);
methane — Setzmann & Wagner (1991); hydrogen and parahydrogen — Leachman et al. (2009);
helium — Ortiz-Vega et al.; argon — Tegeler et al. (1999).

| Fluid | Formula | M (g/mol) | NBP (K) | NBP (°C) | NBP (°F) |
|---|---|---|---|---|---|
| Oxygen | O₂ | 31.9988 | **90.1875** | −182.962 | −297.332 |
| Nitrogen | N₂ | 28.0134 | **77.3549** | −195.795 | −320.431 |
| Methane | CH₄ | 16.0425 | **111.667** | −161.483 | −258.669 |
| Hydrogen (normal) | H₂ | 2.01588 | **20.3689** | −252.781 | −423.006 |
| Parahydrogen | p-H₂ | 2.01588 | **20.2712** | −252.879 | −423.182 |
| Helium (⁴He) | He | 4.002602 | **4.2238** | −268.926 | −452.067 |
| Argon | Ar | 39.948 | **87.302** | −185.848 | −302.526 |

### Triple point, critical point

| Fluid | Triple T (K) | Triple T (°C) | Triple P (bar) | Triple P (kPa) | T_c (K) | T_c (°C) | P_c (bar) | ρ_c (kg/m³) |
|---|---|---|---|---|---|---|---|---|
| O₂ | 54.361 | −218.789 | 0.0014628 | 0.14628 | 154.581 | −118.569 | 50.430 | 436.1 |
| N₂ | 63.151 | −209.999 | 0.125198 | 12.5198 | 126.192 | −146.958 | 33.958 | 313.30 |
| CH₄ | **90.6941** | −182.456 | 0.116961 | 11.6961 | 190.564 | −82.586 | 45.992 | 162.66 |
| H₂ (normal) | 13.957 | −259.193 | 0.0735782 | 7.35782 | 33.145 | −240.005 | 12.964 | 31.262 |
| p-H₂ | 13.8033 | −259.347 | 0.0704108 | 7.04108 | 32.938 | −240.212 | 12.858 | 31.323 |
| He (⁴He) | *see note* | — | *see note* | — | 5.1953 | −267.955 | 2.2832 | 69.58 |
| Ar | 83.8058 | −189.344 | 0.688909 | 68.8909 | 150.687 | −122.463 | 48.630 | 535.599 |

**Helium has no triple point in the ordinary sense and does not freeze at any pressure at
1 atm.** Solid helium requires roughly 25 bar. The lower limit of the NIST saturation
table, 2.1768 K / 0.0503933 bar, is the **lambda point** — the transition from normal
liquid helium (He I) to superfluid He II — not a solid/liquid/vapour triple point.
Confidence A. Course implication: helium cannot plug a line by freezing itself, but it
is cold enough (4.2 K) to freeze *every other substance*, including air, hydrogen and
any trapped moisture.

### Freezing / melting point at 1 atm

For every fluid here except helium the triple-point pressure is far below 1 atm, so the
1 atm melting point differs from the triple-point temperature only in the third decimal
(pressure dependence of melting is weak). **Use the triple-point temperature as the
freezing point** and quote it as such. Air Products' published freezing points, converted,
agree: N₂ −210.0 °C (63.15 K) ✓, O₂ −218.8 °C (54.35 K) ✓, H₂ −259.3 °C (13.85 K, vs
NIST 13.957 K — see §13).

---

## 2. Saturated liquid and vapour at NBP

**Confidence A** throughout — NIST reference EOS, evaluated at exactly *P* = 1.01325 bar
by linear interpolation between adjacent tabulated saturation states (the interpolation
interval was under 0.02 bar in every case, so interpolation error is negligible).

Latent heat is computed as *h*(sat. vapour) − *h*(sat. liquid) at 1 atm.

| Fluid | ρ_liquid (kg/m³) | ρ_sat.vapour (kg/m³) | Δh_vap (kJ/kg) | Δh_vap (kJ/mol) |
|---|---|---|---|---|
| O₂ | **1141.18** | 4.4671 | **213.06** | 6.818 |
| N₂ | **806.085** | 4.61213 | **199.18** | 5.580 |
| CH₄ | **422.355** | 1.81643 | **510.83** | 8.195 |
| H₂ (normal) | **70.8484** | 1.33217 | **448.71** | 0.9045 |
| p-H₂ | **70.8281** | 1.33861 | **446.07** | 0.8992 |
| He | **124.670** | 16.9025 | **20.564** | 0.08231 |
| Ar | **1395.40** | 5.77357 | **161.14** | 6.437 |

Note how small helium's latent heat is — 20.6 kJ/kg, one-tenth of nitrogen's and
one-twenty-fifth of methane's. A given heat leak boils off vastly more helium than
anything else, and helium's saturated vapour at NBP is unusually dense (16.9 kg/m³,
only 7.4× less dense than the liquid), which is why helium dewars vent so freely.

### Other liquid properties at NBP (Confidence A)

| Fluid | c_p liquid (kJ/kg·K) | k liquid (W/m·K) | μ liquid (µPa·s) | σ surface tension (N/m) |
|---|---|---|---|---|
| O₂ | 1.6994 | **0.15085** | 194.674 | 0.013146 |
| N₂ | 2.0415 | **0.14485** | 160.662 | 0.008880 |
| CH₄ | 3.4811 | **0.18370** | 116.769 | 0.012921 |
| H₂ (normal) | 9.7724 | **0.10371** | 13.4901 | 0.0019117 |
| p-H₂ | 9.7290 | **0.10070** | — | — |
| He | 5.1798 | **0.018619** | 3.15549 | 0.00008840 |
| Ar | 1.1173 | **0.12852** | 260.294 | 0.012534 |

Liquid helium's thermal conductivity (0.0186 W/m·K) is quoted here for **He I above the
lambda point**. Below 2.1768 K, superfluid He II transports heat by a completely different
mechanism and an ordinary conductivity value is meaningless — do not extrapolate this
number downward.

---

## 3. Gas density versus reference condition

**Confidence A** — NIST reference EOS, real gas (not ideal), along the 1 atm isobar.
This table is the antidote to the "expansion ratio" confusion; the numbers below are the
denominators of every ratio in §4.

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

Ortho/para makes **no** difference to gas density at these temperatures (both are H₂ with
the same molar mass; the spin isomers differ in heat capacity, not density) — hence
identical columns. They differ substantially in *c_p*: see §5.

**Air row basis:** computed as ρ = *PM*/*RT* with *M*(dry air) = 28.9647 g/mol (CIPM-2007
recommended value) and *R* = 8.314462 J/mol·K. Confidence A. The real-gas correction for
air at these conditions is under 0.1%, smaller than the variation caused by humidity. The
15 °C value, 1.2250 kg/m³, is the ISO 2533 standard-atmosphere sea-level density and
agrees to 4 significant figures. **Humidity matters more than you'd think:** saturated air
at 20 °C is about 1.19 kg/m³, ~1% lighter than dry, because H₂O (18) is lighter than air
(29). For safety reasoning this is noise; for precise buoyancy work it is not.

### Vapour specific gravity (density relative to dry air at the same temperature, 20 °C)

| Fluid | ρ_gas/ρ_air at 20 °C | Behaviour of a *warm* release |
|---|---|---|
| O₂ | **1.1056** | sinks |
| N₂ | **0.9674** | rises, but only just |
| CH₄ | **0.5549** | rises strongly |
| H₂ | **0.0696** | rises very strongly |
| He | **0.1381** | rises strongly |
| Ar | **1.3802** | sinks strongly |

Air Products publishes 1.11 (O₂), 0.967 (N₂) and 0.0696 (H₂) for this quantity at 68 °F —
exact agreement with the computed values. Confidence A/B concordant.

Note the nitrogen result: **warm nitrogen vapour is slightly *lighter* than air** (0.967),
because air is 21% oxygen and ~0.9% argon, both heavier than N₂. A room-temperature
nitrogen release drifts upward weakly; a cold one falls. See §6.

---

## 4. Liquid-to-gas expansion ratios

This is the single most misquoted family of numbers in cryogenic safety, so it is given
in full. **The ratio is ρ_liquid(at NBP) ÷ ρ_gas(at the stated warm condition, 1 atm).**

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

### 4b. The numbers safety courses actually quote, and their exact basis

**Air Products Safetygram-27, "Cryogenic Liquid Containers", Table 1 — "Expansion Ratios
at 70 °F of Common Cryogenic Fluids (Liquid to Gas)".** Confidence B (industrial primary
literature). The document's own worked example fixes the basis beyond doubt: *"1 cubic
foot of liquid argon will create 841 cubic feet of gaseous argon at 70 °F."*

| Fluid | Air Products @ 70 °F | This file, computed @ 70 °F | Agreement |
|---|---|---|---|
| Argon | 1 to **841** | 842.9 | 0.2% |
| Helium | 1 to **754** | 752.5 | 0.2% |
| Hydrogen | 1 to **848** | 849.1 | 0.1% |
| Nitrogen | 1 to **696** | 694.6 | 0.2% |
| Oxygen | 1 to **861** | 860.5 | 0.06% |

That is excellent agreement and it confirms the basis is **liquid at NBP → gas at 70 °F
and 1 atm**. Use these five numbers when the course wants "the industry figure".

**The 694 vs 696 nitrogen discrepancy is fully explained.** Air Products' *Safetygram-7,
"Liquid Nitrogen"* states in its own property table: *"Expansion Ratio, Liquid to Gas, BP
to 68 °F (20 °C) — 1 to 694"*, while *Safetygram-27* gives **696 at 70 °F**. Both are from
the same publisher and both are right; they differ only by the 2 °F difference in
reference temperature. Computed values bracket them identically (692.0 at 20 °C, 694.6 at
70 °F). **This is the worked example the course should use to make the reference-condition
point** — it is a real, citable, same-publisher disagreement that dissolves entirely once
the basis is stated.

**Methane has no Air Products Safetygram in this series** (it is sold as LNG, not as a
pure industrial cryogen), which is why methane expansion ratios in circulation are so
scattered — see §13.

> **Teaching note — the ratio that actually matters in a confined space.** The 600–860:1
> figures assume the gas ends up at room temperature. In the first seconds of a spill it
> does not: it is cold and dense. The *immediate* volume produced is the last column of
> §4a — only 175:1 for nitrogen, 7.4:1 for helium. The room-temperature ratio is the right
> number for "how much gas will eventually exist" (asphyxiation inventory, relief-valve
> sizing); the NBP ratio is closer to the right number for "how fast is the cloud growing
> right now". Quote the large number, but know why it is an upper bound.

---

## 5. Gas-phase heat capacity and thermal conductivity

**Confidence A**, NIST reference EOS at 20 °C (293.15 K), 1 atm.

| Fluid | c_p gas (kJ/kg·K) | k gas (W/m·K) |
|---|---|---|
| O₂ | 0.91896 | 0.025946 |
| N₂ | 1.04134 | 0.025473 |
| CH₄ | 2.22060 | 0.033271 |
| H₂ (normal) | **14.2877** | 0.183389 |
| p-H₂ | **14.8923** | 0.190572 |
| He | 5.19320 | 0.153504 |
| Ar | 0.52161 | 0.017496 |

**This is where normal-H₂ and parahydrogen genuinely diverge** — 14.29 vs 14.89 kJ/kg·K,
a 4% difference at room temperature, and far larger at low temperature. The ortho→para
conversion is the reason: it is exothermic (about 703 kJ/kg released at 20 K, which
*exceeds* hydrogen's latent heat of 449 kJ/kg), so freshly liquefied normal hydrogen will
boil itself away over days as ortho converts to para. **This is why all stored LH₂ is
catalytically converted to ≥95% para at the liquefier.** Use parahydrogen properties for
anything describing stored LH₂; use normal-hydrogen properties for gaseous H₂ at ambient.
Confidence A for the property values; the 703 kJ/kg conversion enthalpy is Confidence B
(standard cryogenic-engineering value, not re-derived here).

---

## 6. Vapour buoyancy — does the cold cloud sink or rise?

This section answers the question the course actually needs: a cryogen spills, the vapour
is cold and therefore dense; at what temperature does it become buoyant in ambient air?

**Method (Confidence A):** the crossover temperature is where ρ_vapour(*T*, 1 atm), from
the NIST reference EOS, equals ρ_air(20 °C, 1 atm) = 1.2041 kg/m³. This is the correct
question for a *small* leak, where the bulk of the room air stays near ambient. Solved by
interpolation on the 1 atm isobar.

| Fluid | NBP (K) | Crossover T (K) | Crossover T (°C) | Warming needed above NBP | Verdict |
|---|---|---|---|---|---|
| **Methane** | 111.667 | **164.25** | −108.90 | **+52.6 K** | Cold vapour sinks and stays down a long time |
| **Hydrogen (n)** | 20.3689 | **22.09** | −251.06 | **+1.7 K** | Cold vapour sinks over a vanishingly narrow band, then rises |
| Parahydrogen | 20.2712 | 22.07 | −251.08 | +1.8 K | as above |
| **Helium** | 4.2238 | **40.45** | −232.70 | +36.2 K | Cold vapour sinks briefly, then rises strongly |
| Nitrogen | 77.3549 | 283.62 | **+10.47** | +206 K | Sinks until nearly room temperature |
| Oxygen | 90.1875 | 323.99 | +50.84 | +234 K | Sinks at all realistic temperatures |
| Argon | 87.302 | *never* | — | — | **Denser than air at every temperature**; always sinks |

### The methane crossover, cross-checked

The course's claim — cold methane vapour is denser than ambient air even though warm
methane is lighter — is **correct and independently confirmed**:

- **This file, from NIST EOS: 164.25 K (−108.9 °C).** Confidence A.
- **Sandia National Laboratories, SAND2016-6456 J:** *"methane needs to warm up 53.3 K,
  from 111 K to 164.3 K, before its gas-phase density equals that of NTP air"* (NTP =
  293.15 K, 1 atm, ρ_air = 1.204 kg/m³). Confidence B. **Agreement to 0.05 K.**

So a methane spill produces a cold, ground-hugging, *flammable* cloud that must warm by
more than 52 K before it will lift. Combined with methane's LFL of 5% (§8), this is the
central methalox ground-safety hazard: the cloud goes sideways along the ground into
trenches, pits and doorways, not up.

### The hydrogen crossover — the important nuance

Hydrogen's crossover is **22.07–22.09 K, only about 1.7 K above its boiling point.**

- **This file, from NIST EOS: 22.09 K (normal H₂), 22.07 K (parahydrogen).** Confidence A.
- **Sandia SAND2016-6456 J:** *"hydrogen will become more buoyant than NTP air (with
  density 1.204 kg/m³) at 22.07 K… hydrogen release from LH₂ need only warm up by ~2 K in
  order to become more buoyant than air at NTP conditions."* Confidence B. **Exact
  agreement.**

The correct statement for the course is therefore *not* "hydrogen always rises" and *not*
"cold hydrogen sinks" but: **cold hydrogen vapour is denser than air only within about
1.7 K of its boiling point, so in practice a hydrogen release becomes buoyant almost
immediately.** This is a genuine qualitative difference from methane and it is the reason
hydrogen and methane demand different ventilation strategies — hydrogen wants a high vent,
methane wants low-level detection and no trenches.

Caveat worth stating aloud: this analysis is for the pure vapour warming in ambient air.
A real large spill entrains and *chills* the surrounding air, and the resulting cold
air/fuel mixture can remain negatively buoyant well past these temperatures. The crossover
temperature is a floor on buoyant behaviour, not a guarantee of it.

### Helium

Helium crosses over at **40.45 K (−232.7 °C)**, Confidence A. Cold helium vapour from a
dewar is briefly denser than air, but it warms through 40 K almost instantly, so helium
in practice always rises and collects at ceilings. This is the correct place to put a
helium sensor and the wrong place to put your head.

---

## 7. Vapour pressure tables (for P–T curves)

**Confidence A** — NIST reference EOS saturation lines, retrieved 2026-09-08. First row of
each table is the triple point (lambda point for helium), last row approaches the critical
point. Values at intermediate temperatures are interpolated on the tabulated saturation
line; the 1 atm row is exact by construction.

Enough points are given to draw a usable P–T curve. Densities are included so the same
table serves the two-phase inventory calculations.

### Oxygen

| T (K) | T (°C) | P_sat (bar) | P_sat (kPa) | P_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 54.361 | −218.79 | 0.0014628 | 0.14628 | 0.02122 | 1306.08 | 0.010358 |
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

| T (K) | T (°C) | P_sat (bar) | P_sat (kPa) | P_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
|---|---|---|---|---|---|---|
| 63.151 | −210.00 | 0.125198 | 12.520 | 1.8158 | 867.22 | 0.67427 |
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

| T (K) | T (°C) | P_sat (bar) | P_sat (kPa) | P_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
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

| T (K) | T (°C) | P_sat (bar) | P_sat (kPa) | P_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
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

| T (K) | T (°C) | P_sat (bar) | P_sat (kPa) | P_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
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

| T (K) | T (°C) | P_sat (bar) | P_sat (kPa) | P_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
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

Helium's critical point is at 5.2 K and 2.28 bar — barely 1 K above its boiling point.
Practical consequence: **helium is very easily driven supercritical.** A helium dewar
that warms slightly, or a transfer line pressurised above 2.3 bar, has no liquid/vapour
interface at all. Do not reason about helium systems using boiling-liquid intuition
imported from nitrogen.

### Argon

| T (K) | T (°C) | P_sat (bar) | P_sat (kPa) | P_sat (psia) | ρ_liq (kg/m³) | ρ_vap (kg/m³) |
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

Argon's triple point is at **0.689 bar — the highest here by a wide margin.** Solid argon
sublimes/melts near 0.69 bar, so a partially evacuated argon system can reach the triple
point at pressures a vacuum pump easily produces. Argon is included in this course as a
*contrast* fluid: it is chemically inert like nitrogen, but denser than air at every
temperature (§6), which makes it the worst asphyxiation hazard of the inert cryogens in
pits, trenches and below-grade spaces.

---

## 8. Flammability — methane

Methane is the course's primary fuel. Values below are for **methane in air at ~25 °C and
1 atm** unless stated.

| Quantity | Value | Source | Conf. |
|---|---|---|---|
| **LFL in air** | **5.0 vol%** | US Bureau of Mines Bulletin 627 (Zabetakis), Table 2 — flammability tube | **A** |
| LFL in air | 5.0 vol% (120-L vessel); 4.9 (20-L); 4.9 (12-L) | Zlochower & Green, NIOSH/CDC, *J. Loss Prev. Process Ind.* 22 (2009) | **A** |
| **UFL in air** | **15.0 vol%** | Bulletin 627, Table 2 — flammability tube | **A** |
| UFL in air | **15.8 vol%** (120-L closed vessel, pressure criterion) | Zlochower & Green (NIOSH) | **A** |
| LFL–UFL in air | 5.3 – 15.0 vol% | Sandia SAND2016-6456 J, citing Ref. 31 | B |
| **LFL–UFL in oxygen** | **~5.1 – 61 vol%** | Coward & Jones, US Bureau of Mines Bulletin 503 (1952) | B |
| **Stoichiometric conc. in air** | **9.48 vol%** | Bulletin 627, Table 2 | **A** |
| **Autoignition temperature in air** | **537 °C (999 °F)** | Bulletin 627, Table 4 | **A** |
| AIT in air (appendix table) | 540 °C | Bulletin 627, appendix | **A** |
| **Minimum ignition energy in air** | **0.28–0.29 mJ** | Sandia SAND2016-6456 J (0.29 mJ); widely reported 0.28 mJ | B |
| **MIE in pure oxygen** | ~0.003 mJ — **unverified** | see §13 | **C** |
| **Limiting oxygen concentration (N₂ diluent)** | **11.1 vol% O₂** (120-L); 12.0 (flammability tube) | Zlochower & Green (NIOSH) | **A** |
| **Lower detonability limit in air** | **6.3 vol%** | Sandia SAND2016-6456 J, citing Ref. 31 | B |
| **Upper detonability limit in air** | **13.5 vol%** | Sandia SAND2016-6456 J | B |
| **Adiabatic flame temp., stoich. in air** | **2224 K (1951 °C)** equilibrium; 2326 K complete-combustion | Marzouk, *Eng. Technol. Appl. Sci. Res.* 13(4):11437 (2023), NASA CEARUN, reactants 298.15 K, 1 atm | B |
| **Adiabatic flame temp., stoich. in oxygen** | **3050 K (2777 °C)** equilibrium; 5166 K complete-combustion | Marzouk (2023), NASA CEARUN | B |
| **Min. pressure for spontaneous ignition on sudden release** | ~100 bar | Sandia SAND2016-6456 J, citing Dryer et al. | B |
| Lower temperature limit (flash point) in air | −187 °C (−305 °F) | Bulletin 627, Table 4 | **A** |

**On the oxy-methane flame temperature:** quote **3050 K**, the chemical-equilibrium value.
The 5166 K "complete combustion" figure assumes products are only CO₂ and H₂O with no
dissociation; at those temperatures dissociation is enormous and the number is physically
unreachable. It is useful only as an upper bound in a thermodynamics exercise. Presenting
5166 K as "the flame temperature of methalox" would be wrong.

**Self-sustaining vs. classical LFL.** Sandia (citing Cashdollar et al.) note that in
*quiescent* mixtures buoyancy raises the concentration needed for a fully self-sustaining
fire above the classical LFL: methane needs ~6% (vs 5.3% classical), hydrogen ~8% (vs 4%).
Mild turbulence (a fan at 1–1.5 m/s) restores hydrogen to 4%; methane is barely affected.
**Design to the classical LFL, not the self-sustaining value** — the classical limit is
what a laser or spark will ignite locally, as Schefer et al. showed. Confidence B.

---

## 9. Oxygen — oxidiser, not fuel

### 9a. It does not burn

**Oxygen is an oxidiser, not a fuel. It is non-flammable.** It cannot burn; it makes other
things burn. This distinction is not pedantry — it determines the entire control strategy,
because you cannot make an oxygen system safe by eliminating oxygen, only by eliminating
fuels and ignition sources.

> *"Liquid oxygen is pale blue and extremely cold. Although nonflammable, oxygen is a
> strong oxidizer."* — Air Products, *Safetygram-6: Liquid Oxygen*. Confidence B.

> *"Since oxygen is nonflammable but supports combustion, fire-fighting actions require
> shutting off the source of oxygen, if possible, then fighting the fire according to the
> material involved."* — Air Products, *Safetygram-6*. Confidence B.

> *"Although oxygen itself is nonflammable, ordinary combustible materials will burn more
> vigorously. Materials that normally do not burn in air may burn in an oxygen-enriched
> atmosphere."* — Air Products, *Safetygram-27*. Confidence B.

Dry air is **20.95 vol% O₂** (Air Products, Safetygram-6; standard atmospheric
composition). Confidence A.

### 9b. Paramagnetism and the blue colour

O₂ has a **triplet ground state** (³Σ⁻_g): two unpaired electrons in degenerate π*
antibonding orbitals. Consequences:

- **Liquid oxygen is paramagnetic** and is visibly attracted to a magnet — poured between
  the poles of a strong magnet it bridges the gap and is held there. This is a standard
  lecture demonstration (Harvard Natural Sciences Lecture Demonstrations; Oberlin Physics
  demonstration catalogue). Confidence B.
- **Liquid oxygen is pale blue.** The colour is *not* an ordinary single-molecule
  absorption. It arises from **bimolecular (simultaneous-pair) absorption**, in which two
  colliding O₂ molecules are excited together from the triplet ground state to singlet
  states in a single photon event. Because it requires a collision pair, the absorption
  scales with the square of density, which is why the colour is obvious in the liquid and
  invisible in the gas. Confidence B.
- Both properties trace to the same triplet ground state, so the pale blue colour and the
  paramagnetism are two visible signatures of one piece of electronic structure. This is a
  good teaching link, and it is physically correct.

Practical note: paramagnetism is how most oxygen analysers work (paramagnetic O₂ cells),
and it is why oxygen is measurable in a background of nitrogen and argon without
chemistry. It also means a strong magnetic field can retain LOX — relevant near
superconducting magnets, where LN₂-cooled surfaces may already be condensing oxygen (§11.1).

### 9c. How oxygen enrichment changes flammability

This is the quantitative heart of the oxygen hazard, and it contains a result that is
routinely got wrong.

**The lower flammability limit barely moves. The upper limit explodes.**

> *"The lower limits in oxygen and in a wide variety of oxygen-nitrogen mixtures are
> essentially the same as those in air at the same temperature and pressure."*
> — US Bureau of Mines Bulletin 627 (Zabetakis), §"Limits in Other Atmospheres".
> **Confidence A.**

Measured limits confirming this:

| Fuel | LFL in air | LFL in O₂ | UFL in air | UFL in O₂ | Source | Conf. |
|---|---|---|---|---|---|---|
| Hydrogen | 4.0 | **4.0** | 75 | **95** | Bulletin 627, Table 21 (from Coward & Jones) | **A** |
| Hydrogen | 4.00 | **3.90** | 75 | **95.8** | Air Products *Safetygram-9* | B |
| Methane | 5.0 | **~5.1** | 15.0 | **~61** | Bulletin 503 / Bulletin 627 | B |

**Why this matters for the course.** The intuition "oxygen makes everything more
flammable, so the flammable range starts sooner" is wrong at the lean end. A leak into an
oxygen-rich space does not ignite at a lower fuel concentration. What changes is:

1. **The rich limit moves enormously** (15%→61% for methane; 75%→95% for hydrogen), so the
   flammable *range* widens by roughly 4× for methane. Mixtures that would be safely
   fuel-rich in air are explosive in oxygen.
2. **Materials that are not fuels in air become fuels in oxygen** — this, not the LFL, is
   the dominant hazard. Metals included.
3. **Ignition gets far easier and combustion far more violent.**

> *"Because most materials, including metals, will burn in an oxygen-enriched environment,
> hazards are always present when using oxygen. Most materials will ignite at considerably
> lower temperatures in an oxygen-enriched environment than in air, and once ignited,
> combustion rates are greater in the oxygen-enriched environment. Many metals burn
> violently in an oxygen-enriched environment when ignited."*
> — NASA TM-104823, *Guide for Oxygen Hazards Analyses*, White Sands Test Facility.
> **Confidence A** (NASA technical memorandum).

> *"As pressure, temperature, and the concentration of oxygen increase, materials such as
> metals, plastics, elastomers, lubricants, and contaminants become more flammable…
> autogenous ignition temperatures decrease with increasing oxygen concentration."*
> — NASA/TM-2007-213740, *Guide for Oxygen Compatibility Assessments*. Confidence A.

The governing standards for quantitative material assessment are **ASTM G63** (non-metals),
**ASTM G94** (metals) and **ASTM G88** (system design), used by NASA WSTF. These are
paywalled; the course should cite them as the authority for material selection without
reproducing their tables.

**Oxygen-saturated clothing** deserves its own line because it kills people:

> *"Clothing saturated with oxygen is readily ignitable and will burn vigorously."*
> Air Products advise that exposed clothing be removed immediately and aired **at least an
> hour**, staying away from ignition sources. — *Safetygram-6*. Confidence B.

**Detonability also widens sharply in oxygen** (hydrogen: 18.2–58.9% in air → 15–90% in
oxygen; Air Products *Safetygram-9*, Confidence B).

---

## 10. Flammability — hydrogen (appendix fluid)

| Quantity | Value | Source | Conf. |
|---|---|---|---|
| **LFL–UFL in air** | **4.0 – 75.0 vol%** | Bulletin 627 Table 21; Air Products *Safetygram-9* (4.00–75%); Sandia | **A** |
| LFL in air (closed vessel, pressure criterion) | 7 vol% (120-L); 6 (20-L) | Zlochower & Green (NIOSH) — vessel/criterion dependent | **A** |
| UFL in air (closed vessel) | 75.9 vol% | Zlochower & Green (NIOSH) | **A** |
| **LFL–UFL in oxygen** | **4.0 – 95 vol%** | Bulletin 627, Table 21 | **A** |
| LFL–UFL in oxygen | 3.90 – 95.8 vol% | Air Products *Safetygram-9* | B |
| **Detonability limits in air** | **18.2 – 58.9 vol%** | Air Products *Safetygram-9* | B |
| Detonability (LEL–UEL) in air | 18.3 – 59.0 vol% | Sandia SAND2016-6456 J | B |
| **Detonability limits in oxygen** | **15 – 90 vol%** | Air Products *Safetygram-9* | B |
| **Autoignition temperature in air** | **500–577 °C (932–1070 °F)** | Air Products *Safetygram-9* | B |
| AIT in air | 400 °C | Bulletin 627, appendix table | **A** |
| **Minimum ignition energy in air** | **0.017–0.020 mJ** | Sandia (0.020); Lewis & von Elbe (0.019) | B |
| **MIE in pure oxygen** | ~0.0012 mJ — **unverified** | see §13 | **C** |
| **Limiting oxygen concentration (N₂ diluent)** | **4.6 vol% O₂** (120-L); 5.0 (flammability tube) | Zlochower & Green (NIOSH) | **A** |
| **Stoichiometric conc. in air** | **29.53 vol%** | Sandia SAND2016-6456 J | B |
| **Adiabatic flame temp., stoich. in air** | **2379 K (2106 °C)** equilibrium; 2520 K complete | Marzouk (2023), NASA CEARUN | B |
| **Adiabatic flame temp., stoich. in oxygen** | **3075 K (2802 °C)** equilibrium; 4931 K complete | Marzouk (2023), NASA CEARUN | B |
| **Min. pressure for spontaneous ignition on sudden release** | ~41 bar | Sandia, citing Dryer et al. | B |

Context for MIE: **a static discharge from a human being is ~10 mJ** (Sandia). That is
roughly 35× methane's MIE and 500× hydrogen's. Both fuels ignite trivially from ordinary
static; the difference between 0.02 and 0.29 mJ is not operationally meaningful when the
available ignition energy is 10 mJ. The honest teaching point is that **neither margin is
a margin**, not that hydrogen is 14× worse.

Note the two AIT values for hydrogen (400 °C from Bulletin 627's appendix, 500–577 °C from
Air Products) — see §13.

---

## 11. The four course-critical facts, verified

### 11.1 LN₂ boils below oxygen, so LN₂-cooled surfaces condense oxygen from air

**VERIFIED. The claim is correct, and the mechanism is more compelling than the usual
statement of it.**

The temperatures (both Confidence A, NIST):

| | NBP |
|---|---|
| Nitrogen | **77.3549 K** (−195.80 °C) |
| Oxygen | **90.1875 K** (−182.96 °C) |
| **Gap** | **12.83 K** |

Any surface at LN₂ temperature is **12.8 K below the boiling point of oxygen**, so oxygen
from the surrounding air condenses onto it as a liquid.

**The sharpest way to state it (computed here, Confidence A):** the vapour pressure of pure
oxygen at 77.355 K is **0.2076 bar**, and the partial pressure of oxygen in air at 1 atm is
**0.2122 bar** (0.20946 × 1.01325). These are nearly identical. So **LN₂'s boiling point
sits essentially exactly at the condensation point of atmospheric oxygen** — atmospheric
oxygen is at saturation at LN₂ temperature, and any surface even marginally colder
condenses it continuously. That is a striking coincidence and it is exact, not approximate.

**Composition of the condensate — independently derived.** The commonly quoted figure is
~50% O₂. I verified it rather than repeating it, by computing the dew point of air with
Raoult's law using NIST vapour pressures for N₂ and O₂:

| T (K) | P_sat N₂ (bar) | P_sat O₂ (bar) | Σx_i | O₂ in first condensate |
|---|---|---|---|---|
| 81.0 | 1.5252 | 0.3444 | 1.143 | 54.1% |
| 81.7 | 1.6424 | 0.3774 | 1.051 | 53.6% |
| **82.0** | **1.6947** | **0.3923** | **1.015** | **53.5%** |
| 82.5 | 1.7846 | 0.4181 | 0.957 | 53.2% |

**Result: air's dew point at 1 atm is ~82 K, and the first liquid to condense is ~53 mol%
oxygen** (against 20.95% in the air it came from). Confidence A for the computation;
the ideal-solution (Raoult) assumption makes it good to a few percent, not better.

This independently confirms the ~50% figure that appears throughout university EHS
literature, e.g.:

> *"Since the boiling point of liquid nitrogen is below that of liquid oxygen, it is
> possible for oxygen to condense on any surface cooled by liquid nitrogen. When air…
> is cooled below approximately 82 K, a condensate forms with a composition of
> approximately 50% oxygen and 50% nitrogen."* — Cornell University EHS, *Cryogenic
> Material Safety*. **Confidence B** (the 82 K dew point matches my calculation exactly).

**Enrichment goes much further than 50% with time.** In an open or repeatedly-topped-up
vessel, nitrogen preferentially boils off and oxygen accumulates. University EHS sources
report accumulation to **as high as 80% O₂**. Confidence B — plausible and directionally
certain, but I could not trace the 80% figure to a primary measurement; treat the number
as indicative and the *trend* as certain.

**Independent confirmation of the underlying physics from a national laboratory:**

> *"An important consequence for the difference in boiling points is that liquid methane
> (at its boiling point) cannot liquefy air, whereas LH₂ can liquefy air, whose components
> N₂ and O₂ condense at 77.3 K and 90.2 K, respectively. These atmospheric gases can also
> solidify when exposed to LH₂… The potential for liquefying or solidifying air introduces
> safety concerns arising from clogging hydrogen lines with condensed air, as well as
> concerns about reactivity stemming from condensed oxygen."*
> — Sandia National Laboratories, SAND2016-6456 J. **Confidence B.**

Note the useful contrast the Sandia passage establishes and the course should reuse:
**LN₂ and LH₂ condense oxygen; liquid methane cannot** (its NBP, 111.7 K, is 21.5 K *above*
oxygen's). Methalox systems do not have the LN₂ oxygen-condensation problem on the fuel
side — they have a different one (§11.2).

**Standard mitigations**, from the same sources: purge lines with helium or hydrogen rather
than letting them breathe air; never chill a cold trap with LN₂ while it is open to
atmosphere; evacuate before chilling; and treat any unexplained pale-blue liquid in an
LN₂-cooled trap as LOX contaminated with whatever organics were also condensed — a
contact-sensitive explosive.

### 11.2 LOX can freeze methane (methalox)

**VERIFIED, and the margin is smaller than the usual statement suggests.**

| Quantity | Value | Source | Conf. |
|---|---|---|---|
| **Methane triple point (freezing point)** | **90.6941 K** (−182.456 °C) | NIST reference EOS (Setzmann & Wagner) | **A** |
| Methane triple point | 90.67 ± 0.03 K | NIST WebBook, average of 25 literature values | **A** |
| **Oxygen NBP** | **90.1875 K** (−182.962 °C) | NIST reference EOS | **A** |
| **Margin** | **methane freezes 0.507 K ABOVE LOX's boiling point** | computed | **A** |

**LOX at its normal boiling point is 0.5 K colder than the temperature at which methane
freezes solid.** So boiling LOX at 1 atm will freeze methane on contact, with about half a
kelvin to spare. This is not a comfortable margin — it is a coincidence of half a degree,
and it is the defining thermal constraint of methalox vehicle design.

Consequences, confirmed in the engineering literature (Confidence B — trade/technical
sources, consistent with one another and with the physics):

- **A LOX/methane heat exchanger must be deliberately *de*-rated.** Gaseous methane
  entering a LOX-cooled exchanger condenses at 111.7 K, then keeps cooling toward 90.2 K
  and freezes, plugging the exchanger. Designers therefore insulate to *retard* heat
  transfer — the opposite of normal heat-exchanger practice.
- **Propellant densification runs into the same wall.** Sub-cooling methane to raise
  density is limited by its 90.7 K freezing point, and sub-cooling LOX is limited by its
  own 54.4 K freezing point; the useful methane window between NBP (111.7 K) and freezing
  (90.7 K) is 21 K wide, and its cold end coincides with LOX's boiling point.
- **Common-bulkhead tanks put the two fluids in thermal contact by design**, so the
  bulkhead sits between a fluid at 90.2 K and a fluid that freezes at 90.7 K.

I did not find a NASA or CGA document stating this constraint in exactly these terms; the
temperatures are Confidence A and the engineering consequences are Confidence B. The
course can assert the numbers flatly and should attribute the design consequences more
loosely ("as widely discussed in methalox engine development").

**A useful contrast for the same lesson:** LOX cannot freeze *hydrogen* (H₂ freezes at
14.0 K, far below LOX's 90.2 K), but LH₂ *can* freeze oxygen, nitrogen and air solid.
The freezing hazard reverses direction between hydrolox and methalox.

### 11.3 Expansion ratios quoted in safety literature

**VERIFIED — see §4 in full.** Summary of the authoritative version and its exact basis:

**Air Products Safetygram-27, Table 1, "Expansion Ratios at 70 °F of Common Cryogenic
Fluids (Liquid to Gas)"** — basis: **1 volume of liquid at its boiling point → N volumes of
gas at 70 °F (21.11 °C) and 1 atm.**

| Fluid | Quoted | Computed from NIST at 70 °F |
|---|---|---|
| Oxygen | **1 : 861** | 860.5 |
| Hydrogen | **1 : 848** | 849.1 |
| Argon | **1 : 841** | 842.9 |
| Helium | **1 : 754** | 752.5 |
| Nitrogen | **1 : 696** | 694.6 |
| *Methane* | *not published in this series* | *634.5* |

For **methane**, no equivalent industry safetygram exists, and quoted values scatter from
about 600 to 650. Use **632:1 at 20 °C** or **634:1 at 70 °F**, computed here from NIST,
and state the basis. See §13 for why Sandia's 648 differs.

### 11.4 Oxygen deficiency thresholds

**VERIFIED against the regulation itself.**

**OSHA, 29 CFR 1910.146 (Permit-Required Confined Spaces), definitions:**

- **Oxygen-deficient atmosphere:** an atmosphere containing **less than 19.5% oxygen by
  volume**.
- **Oxygen-enriched atmosphere:** an atmosphere containing **more than 23.5% oxygen by
  volume**.
- A **hazardous atmosphere** includes one where oxygen is outside the **19.5%–23.5%** band,
  and separately one where a flammable gas exceeds **10% of its LFL**.

Confidence **A**. The same 19.5%/23.5% pair appears in OSHA's Respiratory Protection
standard, 29 CFR 1910.134. Confirmed independently by EIGA Doc 44/18, Note 3 to Table 1:
*"A hazardous atmosphere oxygen concentration range as defined by OSHA is outside the range
of 19,5% and 23,5%."* Air Products *Safetygram-6* likewise: *"U.S. OSHA has established the
definition of an oxygen-enriched atmosphere as one containing more than 23.5% oxygen."*

> Note: `ecfr.gov` and `osha.gov` both refuse automated fetches, so the regulatory text
> above is corroborated from three independent secondary reproductions (EIGA Doc 44/18,
> Air Products Safetygram-6, OSHA's own Confined Spaces Advisor) rather than read off the
> primary page in this session. The threshold values are not in doubt; if the course
> reproduces the definition verbatim, check the wording against the live CFR.

**The 10%-of-LFL rule is worth teaching alongside the oxygen band**: for methane
(LFL 5.0%) the action level is **0.5 vol% methane**; for hydrogen (LFL 4.0%) it is
**0.4 vol% hydrogen**. Confidence A (arithmetic on A-grade inputs).

**Physiological effects — EIGA Doc 44/18, *Hazards of Oxygen-Deficient Atmospheres*,
Table 1, "Effects at various oxygen breathing levels"** (sea level, 760 mmHg). Confidence
**A/B** — EIGA is the European counterpart of CGA and the table is itself adapted from
29 CFR 1910/1926. **CGA SB-2** is the US equivalent document but is paywalled; EIGA Doc 44
is free and states the same thresholds.

| O₂ (vol%) at sea level | Effects |
|---|---|
| **20.9** | Normal. (Below 19.5% is considered oxygen deficient.) |
| **19.5 – 10** | Increased breathing rate; accelerated heartbeat; impaired attention, thinking and coordination. |
| **10 – 6** | Nausea, vomiting, lethargic movements, and perhaps unconsciousness. |
| **< 6** | Convulsions, then cessation of breathing, followed by cardiac standstill (death). **These symptoms can occur immediately.** |

EIGA's qualifying notes, which the course should carry with the table:

- These are for **a healthy average person at rest.** Individual health, exertion level and
  altitude shift both the symptoms and the concentrations at which they appear.
- **Altitude:** the *percentage* of oxygen does not change with altitude, but the partial
  pressure does — a 19.5% reading is not equally safe everywhere.
- **The critical operational point:** *"An oxygen-deficient atmosphere can bring about
  unconsciousness without warning. In as little as one or two breaths, an individual's
  life can be endangered."* And: *"with inert gases, asphyxia can occur with no warning…
  Lack of oxygen can cause vertigo, headache or speech difficulties, but the victim is not
  capable of recognising these symptoms as asphyxiation."*
- Inert gases are **odourless, colourless and tasteless — more dangerous than toxic gases
  such as chlorine or ammonia, which announce themselves by smell.**
- EIGA specifically warns that rescuer entry without breathing apparatus is *"one of the
  most common causes of multiple fatalities in cases involving asphyxiation."*

Air Products *Safetygram-7* concurs on the action threshold: *"…19.5% oxygen concentration
as the minimum for safe working"* and recommends self-contained or air-line breathing
apparatus below it. Confidence B.

---

## 12. Air-versus-vapour density summary (for explaining cloud behaviour)

Consolidated from §3 and §6. Air reference: dry air, 1 atm.

| Fluid | ρ_vapour at its own NBP (kg/m³) | × denser than 20 °C air | ρ_vapour at 20 °C (kg/m³) | × vs 20 °C air | Crossover T |
|---|---|---|---|---|---|
| O₂ | 4.4671 | 3.71 | 1.33120 | 1.106 | 324.0 K |
| N₂ | 4.6121 | 3.83 | 1.16484 | 0.967 | 283.6 K |
| CH₄ | 1.8164 | 1.51 | 0.66816 | 0.555 | **164.3 K** |
| H₂ (n) | 1.3322 | 1.11 | 0.08375 | 0.070 | **22.09 K** |
| p-H₂ | 1.3386 | 1.11 | 0.08375 | 0.070 | 22.07 K |
| He | 16.9025 | 14.04 | 0.16631 | 0.138 | 40.45 K |
| Ar | 5.7736 | 4.79 | 1.66184 | 1.380 | *never* |
| Dry air (20 °C) | — | 1.00 | 1.2041 | 1.000 | — |

All Confidence A. The middle columns are the ones that make the point: **at their boiling
points, every one of these vapours is denser than ambient air** — even hydrogen (1.11×) and
helium (14×). Every cryogenic release starts as a falling cloud. What differs is how long
it stays one.

---

## 13. Contested or ambiguous figures

Everything below is a real disagreement between sources, or a number I could not verify.
Nothing here should be quoted to students without its caveat.

### 13.1 Methane expansion ratio: 632 vs 648 — resolved, and Sandia is the outlier

Sandia SAND2016-6456 J states methane's expansion factor NBP→NTP(293.15 K) is **648.0**;
I compute **632.1** at the same stated conditions. The discrepancy is entirely in the gas
density, not the liquid: Sandia use ρ_CH₄(NTP) = **0.65119 kg/m³**, whereas NIST's
reference EOS gives **0.66816 kg/m³** at 293.15 K, 1 atm — a 2.5% difference. 0.65119
corresponds to a temperature near 300 K, not 293.15 K, so the Sandia value appears to pair
a density tabulated at one temperature with a label naming another. Their hydrogen density
(0.08376) matches NIST (0.08375) exactly, so the error is specific to methane.

**Recommendation: use 632 (20 °C) or 634 (70 °F). Note Sandia's 648 exists.** Sandia's
report is otherwise excellent and is relied on elsewhere in this file.

### 13.2 Nitrogen expansion ratio: 694 vs 696 — resolved, not a real disagreement

Both are Air Products values; 694 is at 68 °F (Safetygram-7), 696 at 70 °F (Safetygram-27).
Computed: 692.0 at 20 °C, 694.6 at 70 °F. **Use 696 with the 70 °F basis** for consistency
with the rest of the Safetygram-27 table. See §4b — this is the best teaching example in
the whole file for why reference conditions must be stated.

### 13.3 Methane UFL: 15.0 vs 15.8 vol%

- **15.0%** — Bureau of Mines Bulletin 627, flammability-tube method (visual criterion).
- **15.8%** — NIOSH (Zlochower & Green 2009), 120-L closed vessel, pressure-rise criterion.

Both Confidence A. This is a genuine **method** difference, not an error: closed-vessel
pressure criteria systematically return wider limits than the classic open flammability
tube. NIOSH's paper exists specifically to flag this. **Use 15% for the classical/regulatory
figure, cite 15.8% as the modern closed-vessel value**, and note that limits are
method-dependent — which is itself worth teaching.

### 13.4 Methane LFL: 5.0 vs 5.3 vol%

Bulletin 627 and NIOSH both give **5.0%** (NIOSH: 4.9–5.0 depending on vessel). Sandia
quotes **5.3%**, citing a secondary reference. **Use 5.0%**; it has the stronger and more
recent primary support. The difference is not operationally significant but the course
should be internally consistent.

### 13.5 Hydrogen AIT: 400 °C vs 500–577 °C

- **400 °C** — Bulletin 627 appendix table (Confidence A).
- **500–577 °C (932–1070 °F)** — Air Products *Safetygram-9* (Confidence B).
- 585 °C is also widely quoted in hydrogen-safety literature.

This is a wide and genuinely unresolved spread. AIT is strongly apparatus-dependent
(vessel size, material, surface catalysis, residence time) and is not a fundamental
property, which is why published values scatter. **Quote a range — "roughly 500–580 °C,
apparatus-dependent" — and do not present a single figure.** Note that hydrogen's AIT is
*higher* than methane's (537 °C) despite hydrogen being far easier to spark-ignite; AIT and
MIE measure different things and rank the two fuels oppositely. That inversion is a good
exam question and a common misconception.

### 13.6 Hydrogen LFL: 4.0 vs 6–7 vol%

- **4.0%** — classical value, Bulletin 627 flammability tube, Air Products, Sandia.
- **6–7%** — NIOSH closed-vessel with pressure criterion (7% in 120-L, 6% in 20-L).
- **~8%** — Sandia/Cashdollar threshold for a *self-sustaining* fire in a quiescent
  mixture (buoyancy suppresses downward propagation near the limit).

All three are correct answers to different questions. **Use 4.0% for design and detection**
— it is the concentration at which a local ignition source will produce flame, which is
what a safety margin must protect against.

### 13.7 Minimum ignition energy in pure oxygen — UNVERIFIED (Confidence C)

The figures **0.003 mJ (methane in O₂)** and **0.0012 mJ (hydrogen in O₂)** circulate
widely and are usually attributed to Lewis & von Elbe, *Combustion, Flames and Explosions
of Gases*. **I could not verify either against an accessible primary source in this
session.** Multiple searches returned only air values.

What *is* well-supported: MIE falls **by at least an order of magnitude** in oxygen versus
air. **Recommendation: state the direction and order of magnitude, which is solid, and do
not put the two specific numbers on a slide** unless someone checks them against a physical
copy of Lewis & von Elbe or ASTM G63. Flagged for follow-up.

### 13.8 Methane flammability limits in oxygen: ~5.1–61%

Attributed to Coward & Jones, Bureau of Mines Bulletin 503 (1952). Bulletin 627 refers to
this data as figures 9 and 10 (methane–oxygen–nitrogen flammability diagrams) rather than
as a numeric table, and the scan's OCR did not yield the numbers directly. Confidence **B**
— consistently reported and consistent with Bulletin 627's own statement that lower limits
are essentially unchanged in oxygen, but not read by me off a primary table. The
*qualitative* result (lower limit ~unchanged, upper limit ~4× wider) is Confidence A from
Bulletin 627's text.

### 13.9 Oxygen enrichment of LN₂ condensate: 50% vs 80%

**~50%** (specifically ~53% by my calculation, §11.1) is the composition of the *first
condensate at the dew point* and is well-founded. **~80%** is quoted by several university
EHS pages as the level reachable in an open vessel over time. The 80% figure is directionally
certain — preferential nitrogen boil-off must enrich the residue — but I found no primary
measurement. **Use "approximately 50% oxygen initially, rising toward 80% or higher with
continued exposure", and mark the upper figure as indicative.**

### 13.10 NIST WebBook aggregate pages contain unreliable historical entries

Not a disagreement between sources so much as a warning about one. The WebBook's *phase
change data* pages (`Mask=4`) aggregate a century of literature values with no quality
filter, and several entries are plainly wrong. Observed in this session:

- Argon triple point listed as **87.78 K** (Angus et al.) alongside the correct 83.8 K —
  87.78 K is above argon's own boiling point and is impossible.
- Argon critical pressure listed as both **4.8979 bar** and **48.9805 bar** — the first is
  the MPa value mislabelled as bar.
- Nitrogen critical pressure listed as **3.0698 bar** (Cardoso 1915) alongside 33.978 bar.
- Hydrogen triple point listed as **0 K at 0 bar** (Roder et al.) — a null record rendered
  as data.
- Nitrogen Antoine coefficient **A = 63792** — a transcription artefact.
- Oxygen NBP given as 90.2 ± 0.2 K and methane NBP as 111 ± 2 K, far cruder than the
  reference EOS values (90.1875 K, 111.667 K).

**Rule for this course: take fixed points and properties from the NIST *fluid properties*
database (`webbook.nist.gov/chemistry/fluid/`, the reference equations of state), not from
the WebBook's phase-change summary pages.** Everything in §1–§7 of this file follows that
rule.

### 13.11 Air Products LH₂ latent heat is quoted molar, and is easily misread

*Safetygram-9* lists "Latent Heat of Vaporization: 385.1 Btu/lb·mole (895.8 kJ/kmol)". The
kJ figure is **per kilomole**, not per kilogram: 895.8 kJ/kmol ÷ 2.01588 kg/kmol =
**444.4 kJ/kg**, in reasonable agreement with NIST's 448.71 (normal) / 446.07 (para).
Anyone skimming the table for a kJ/kg value will be out by a factor of ~2. Use the NIST
values in §2.

### 13.12 Hydrogen freezing point: 13.85 K vs 13.957 K

Air Products *Safetygram-9* gives −434.8 °F (−259.3 °C) = 13.85 K; NIST's reference EOS
triple point for normal hydrogen is 13.957 K (parahydrogen 13.8033 K). The Air Products
figure is close to the *parahydrogen* value, which is arguably the more relevant one for
stored LH₂. **Use 13.96 K for normal H₂ and 13.80 K for parahydrogen, and say which.**

### 13.13 Adiabatic flame temperatures vary widely across sources

The Marzouk (2023) CEARUN values used in §8 and §10 are internally consistent and
transparently sourced, but other references give methane-air AFTs anywhere from ~2200 K to
~2480 K depending on whether dissociation is included, the initial reactant temperature,
and whether the value is "adiabatic" or a measured flame temperature. **Always state
"stoichiometric, reactants at 298.15 K, 1 atm, chemical equilibrium" alongside the number.**
Measured flame temperatures are always lower than adiabatic ones because of radiative loss.

### 13.14 Oxygen "pale blue" and paramagnetism — well established, lightly sourced here

Both facts are textbook-solid and demonstrated routinely in university lecture
demonstrations, and the "pale blue" descriptor is confirmed by Air Products' own
Safetygram-6. The specific mechanism given in §9b — that the blue colour arises from
*bimolecular* simultaneous-pair absorption rather than single-molecule absorption — is
correct but is sourced here to secondary/tertiary material rather than to a spectroscopy
primary. Confidence B. It is safe to teach; cite a physical-chemistry textbook if the
course needs a formal reference.

---

## 14. Sources

**Primary — NIST (Confidence A)**

1. NIST Chemistry WebBook, *Thermophysical Properties of Fluid Systems* —
   `https://webbook.nist.gov/chemistry/fluid/`. Reference equations of state for O₂, N₂,
   CH₄, H₂ (normal), parahydrogen, He, Ar. All of §1–§7. Retrieved 2026-09-08 as
   tab-delimited data (no transcription step).
2. NIST Chemistry WebBook, phase-change data pages (`Mask=4`) for the same fluids —
   used only for cross-checking, with the caveats in §13.10.

**Primary — government standards and reports (Confidence A)**

3. M. G. Zabetakis, *Flammability Characteristics of Combustible Gases and Vapors*,
   US Bureau of Mines Bulletin 627 (1965; 1970 printing). Tables 2, 4, 21 and the
   "Limits in Other Atmospheres" section. Via CDC STACKS.
4. I. A. Zlochower & G. M. Green (NIOSH/CDC), *The limiting oxygen concentration and
   flammability limits of gases and gas mixtures*, J. Loss Prev. Process Ind. 22 (2009).
   Table 1. Via CDC STACKS.
5. OSHA, 29 CFR 1910.146, *Permit-Required Confined Spaces* — definitions of hazardous,
   oxygen-deficient and oxygen-enriched atmospheres. (See fetch caveat in §11.4.)
6. NASA TM-104823, *Guide for Oxygen Hazards Analyses*, JSC White Sands Test Facility.
   Via NTRS.
7. NASA/TM-2007-213740, *Guide for Oxygen Compatibility Assessments on Oxygen Components
   and Systems*. Via NTRS.
8. F. E. Coward & G. W. Jones, *Limits of Flammability of Gases and Vapors*, US Bureau of
   Mines Bulletin 503 (1952) — cited indirectly via Bulletin 627 and secondary sources.

**Secondary — national laboratory and industry (Confidence B)**

9. L. E. Klebanoff, J. W. Pratt & C. B. LaFleur (Sandia National Laboratories),
   *Comparison of the Safety-related Physical and Combustion Properties of Liquid Hydrogen
   and Liquid Natural Gas in the Context of the SF-BREEZE High-Speed Fuel-Cell Ferry*,
   SAND2016-6456 J. Buoyancy crossover temperatures, flammability, air-condensation
   physics.
10. EIGA Doc 44/18, *Hazards of Oxygen-Deficient Atmospheres* (revision of Doc 44/09).
    Table 1 and §4. Free equivalent of the paywalled CGA SB-2.
11. Air Products, *Safetygram-6: Liquid Oxygen*.
12. Air Products, *Safetygram-7: Liquid Nitrogen*.
13. Air Products, *Safetygram-9: Liquid Hydrogen*.
14. Air Products, *Safetygram-27: Cryogenic Liquid Containers* — Table 1, expansion ratios.
15. O. A. Marzouk, *Adiabatic Flame Temperatures for Oxy-Methane, Oxy-Hydrogen,
    Air-Methane and Air-Hydrogen Stoichiometric Combustion using the NASA CEARUN Tool,
    GRI-Mech 3.0 and Cantera*, Eng. Technol. Appl. Sci. Res. 13(4):11437–11444 (2023).
16. Cornell University EHS, *Cryogenic Material Safety* — air-condensate composition.
17. CIPM-2007 recommended molar mass of dry air (28.9647 g/mol); ISO 2533 standard
    atmosphere (1.225 kg/m³ at 15 °C) — air density basis, §3.

**Referenced but not obtained (paywalled)**

- CGA SB-2, *Oxygen-Deficient Atmospheres* — US equivalent of EIGA Doc 44; superseded here
  by EIGA Doc 44/18.
- ASTM G63, G88, G94 — oxygen compatibility assessment standards; cited as authority in
  §9c, tables not reproduced.
- B. Lewis & G. von Elbe, *Combustion, Flames and Explosions of Gases* — origin of the
  unverified MIE-in-oxygen figures, §13.7.

**Blocked in this session:** `ecfr.gov`, `osha.gov`, `encyclopedia.airliquide.com` and
`airproducts.co.uk` all refused automated fetches (403 / redirect-to-unblock). The
Air Products documents were obtained from `airproducts.com` instead. Air Liquide's Gas
Encyclopedia could not be consulted; it would be a useful independent cross-check on §2–§4
if someone can open it manually.

---

## Open items for follow-up

1. **Verify MIE in pure oxygen** (§13.7) against Lewis & von Elbe or ASTM G63. Currently
   Confidence C and excluded from teaching material.
2. **Read the OSHA 1910.146 definitions off the live CFR** and confirm verbatim wording
   (§11.4). Threshold values are certain; exact phrasing is not confirmed from primary.
3. **Cross-check §2–§4 against the Air Liquide Gas Encyclopedia** when it can be reached.
4. **Find a primary measurement for the 80% oxygen enrichment figure** in LN₂-cooled
   vessels (§13.9), or drop the number.
5. **Locate a NASA/CGA document stating the LOX-freezes-methane constraint explicitly**
   (§11.2). The temperatures are Confidence A; a citable statement of the design
   consequence would strengthen the module.
6. **Methane limits in oxygen** (§13.8) — obtain Bulletin 503 directly and read the numbers
   off the primary table.
