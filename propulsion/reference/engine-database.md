# Engine database

The single reference table of engines, motors and thrusters for the PROPULSION
course. Every number here is consolidated from the two verification worksheets
`_verify-liquid.md` and `_verify-solid-coldgas.md`, with their caveats carried
across intact. Modules cite this file; this file cites the worksheets, and the
worksheets cite the sources.

---

## How to read this table

**Units.** SI throughout: kN for thrust, bar for pressure, seconds for specific
impulse, kg for mass. Where a source quoted US customary units (lbf, psia, in)
the converted value is given in parentheses on first appearance and inherits the
source's precision, not more. Conversions used: 1 kN = 224.809 lbf,
1 bar = 14.5038 psi, 1 MPa = 145.038 psi. $g_0 = 9.80665\ \mathrm{m/s^2}$.

**"n.p." means not published.** No primary or credible secondary source was
located by the verification pass. It is never a placeholder for a guess, and a
module must render it as "not reliably published" rather than filling it in.

**What "Pc" means.** Chamber pressure is not one quantity. Three different
stations circulate in the literature and secondary sources rarely say which they
are quoting:

| flag | station |
|---|---|
| `inj` | stagnation pressure at the injector face — the course's default convention (README) and standard US Apollo-era practice |
| `noz` | nozzle-stagnation pressure — standard Soviet/Russian practice and many modern datasheets; typically a few percent *lower* than injector-end |
| `dev` | a peak reached in development, not a flight-nominal rating |
| `n.s.` | station not stated by any source consulted |

A dagger (†) on `inj` or `noz` means the station is inferred from the worksheet's
national-convention rule (US Apollo era = injector-end, Soviet/Russian = nozzle
stagnation), not from a per-engine statement in a source. This is the single
largest recurring source of apparent disagreement in the liquid file. Comparing
the RD-180's 267 bar to the RS-25's 206 bar without stating the convention
overstates the gap slightly.

**Thrust tags.** Every thrust figure carries, or inherits from its table caption:

- `SL` / `vac` — sea level or vacuum. Never omitted for a real engine.
- `/motor` / `/vehicle` — one motor, or the whole vehicle's motors summed. This
  is a factor-of-two error when it goes wrong and it is the most common mistake
  in the secondary literature on solids. Part B tags every figure explicitly,
  including for single-motor vehicles where it looks redundant.
- `max` / `avg` — peak thrust or burn-averaged thrust. Solid motors with a
  strongly shaped trace (LVM3 S200: max/avg = 1.44) are meaningless without it.

**Confidence labels.** The solid/cold-gas worksheet uses an explicit A–D scale;
the liquid worksheet uses words. Both are reproduced, with this reading key:

| label | meaning | liquid worksheet's word |
|---|---|---|
| **A** | Primary source (NASA fact sheet, manufacturer data sheet, NTRS report, ESA page) read directly and quoted | "high" |
| **B** | Secondary source that itself cites a primary, internally consistent with other independent secondaries | "medium-high" |
| **C** | Single secondary source, uncorroborated, or a figure that failed an internal consistency check. Order of magnitude only | "medium" / "low-medium" |
| **D** | Could not verify. Recorded as a claim with the claimant named, or omitted | "low" |

The A–D column in Part A carries the liquid worksheet's word label with the
mapped letter in brackets; the mapping itself is editorial judgment [J], not a
worksheet statement. `CALC` marks a figure computed in the worksheet from stated
inputs rather than sourced.

**The "claim" rule.** Any figure marked **claim** is a company or agency claim
with no independent confirmation. SpaceX, Blue Origin, Rocket Lab, ArianeGroup
and Northrop Grumman publish almost nothing in the peer-reviewed or
government-report literature; most of their figures originate from websites,
press kits, conference talks or executive social-media posts, and several have
changed silently over time. Raptor, BE-3U, BE-4, Archimedes, Prometheus and BOLE
are presented as claims throughout. This is not a slight against those companies;
it is an accurate statement of the evidentiary situation, and it is the reason a
student should always ask where a number came from.

**Where sources disagree**, every value is given with its provenance in the
"notes and contested figures" list below each table. A table that silently picks
a winner teaches students that rocket performance figures are exact. They are
not.

**Records must be stated precisely.** The RD-170 produces more total thrust
(7,900 kN vac) than the F-1 (7,770 kN vac), but across four combustion chambers.
The F-1 remains the highest-thrust *single-chamber* engine ever flown. Both
records are real; say which one you mean, every time. Likewise keep flown and
unflown engines separate: the RD-0146's 470 s, the F-1A's 1,800,000 lbf and the
J-2S's 436 s are test-stand or paper figures and do not belong in the same column
as flight-demonstrated values.

**"Expander cycle" is three different cycles.** Closed expander (RL10, Vinci,
RD-0146, YF-75D), expander bleed (LE-5A/5B, LE-9, BE-3U) and tap-off (BE-3PM,
J-2S) are routinely all called "expander cycle" in the secondary literature. They
have materially different thrust ceilings and Isp penalties. Every engine in this
file is labelled with the specific variant.

---

# Part A — Liquid engines

All Part A thrust figures are `/engine` unless the row says otherwise. Where an
"engine" is really several combustion chambers on one turbopump (LR87, RD-107,
RD-170, RD-180, MA-5) the row says so and the notes give the stage total
separately.

## A.1 German and early American heritage

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | turbopump | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **V-2 / A-4 (Model 39)** | Peenemünde ARC; production Mittelwerk / Germany | dev ~1938–42; flew 1942-10-03 → 1945-03 | A-4/V-2 missile; Hermes, Bumper, R-1 derivatives | LOX / 75% ethanol–25% water | ~1.18 (some sources 1.2–1.25; low conf. on 2nd decimal) | GG, **monopropellant steam** — 80% H₂O₂ over Na/K permanganate | ~245 (55,000 lbf) | ~285 (64,000 lbf) | 15.2 `inj`† (220 psia) | ~203 | ~239 | ~3.5:1 (15° conical) | ~1,126 | ≈22:1 `CALC` | regen double-wall steel + **heavy film cooling** (4 rings, ~10% of fuel) | **18 pot-type pre-mixing burner cups**, two concentric circles on a flat dome | pyrotechnic ("Zündkerze"), gravity-fed preliminary stage then mainstage | single shaft, centrifugal LOX + alcohol, **steam turbine 4,000 rpm, ~430 kW (580 hp)**; 68 kg/s LOX, 55 kg/s alcohol | med-high [B] |
| **Rocketdyne XLR43-NA-1 ("75K")** | North American Aviation / Rocketdyne / USA | 1946–51; first successful test 1950-11-15 | XSSM-A-2 Navaho test vehicle (never operational) | LOX / 75%–25% ethanol–water | ~1.32 (from the Redstone derivative; n.p. for the XLR43) | GG, V-2-type H₂O₂ steam generator | **334** (75,000 lbf) | n.p. | 21.9 `inj`† (318 psia) | n.p. (Redstone A-7 derivative: 235) | n.p. (derivative: ~265) | **3.61** (throat 15.3 in) | **668** (1,473 lb) | ≈51:1 `CALC` | double-wall regen + film | **flat-face, concentric rings of drilled holes, F-O-F impinging triplet** — the break from Germany | pyrotechnic | single shaft, H₂O₂/permanganate steam turbine, V-2 layout | med-high [B]; **low** on Isp and O/F |
| **Rocketdyne A-7 (NAA 75-110-A-7)** | North American Aviation / Rocketdyne / USA | 1953–58; MR-3 (Shepard) 1961-05-05 | PGM-11 Redstone, Jupiter-C, Juno I, Mercury-Redstone | LOX / 75% ethyl alcohol (Jupiter-C/Juno I used **Hydyne**; Mercury-Redstone reverted to ethanol for crew safety) | **1.324** | GG, 75% H₂O₂ over K permanganate steam generator | **369** (82,977 lbf) — see note A.1.1 | **416** (93,565 lbf) | 21.9 `inj`† (318 psia) | **235** | **~265** | **3.61** | **671** (1,479 lb) | **56:1** (published) | regen double-wall + film | flat-face impinging, XLR43 heritage | pyrotechnic igniter | single shaft, steam turbine **4,718 rpm, 758 hp (565 kW)**; burn time 155 s | high [A] on the enginehistory.org set |
| **Rocketdyne MA-5 (LR-89 booster pair)** | Rocketdyne / USA | lineage from 1954; Atlas SLV-3 / E-F / G / Atlas I | Atlas stage-and-a-half — 2 booster chambers in a jettisoned skirt | LOX / RP-1 | ~2.25 (med conf.) | GG — **both booster chambers share one gas generator and one centrally mounted turbopump** | **1,681** (378,000 lbf) `/booster pair` | **1,882** (423,000 lbf) `/pair` | ~40 `inj`† (580 psia) — contested, see A.1.2 | 259 | 292 | ~8:1 (med conf.) | **n.p. per chamber**; MA-5A system ~1,700 kg class | n.p. | regen **tube-wall** (Neu patent, production form) | flat-face impinging, like-on-like doublet | pyrotechnic / hypergolic slug by block | geared, single turbine driving both pumps through a reduction gearbox (XLR71 architecture) | med [C] |
| **Rocketdyne MA-5 (LR-105 sustainer)** | Rocketdyne / USA | as above | Atlas sustainer, burns to orbit insertion | LOX / RP-1 | ~2.27 (med conf.) | GG, own turbopump and gas generator | **269** (60,473 lbf) | **374** (86,866 lbf) | ~40 `inj`† (580 psia) | **220** — genuinely low; a large-ε nozzle badly overexpanded at liftoff | 309 | ~25:1 (med conf.) | n.p. | n.p. | regen tube-wall | flat-face impinging | pyrotechnic / hypergolic slug | geared single-turbine, two-pump | med [C] |
| **Rocketdyne MA-5A (RS-56-OSA / -OBA)** | Rocketdyne / USA | Atlas II 1991-12-07 → 2004-08-31 | Atlas II / IIA / IIAS | LOX / RP-1 | ~2.25 / ~2.27 | GG | **1,890** `/system`; booster pair alone 1,896 (426,240 lbf) | **2,100** `/system` | 48 bar/atm **at the injector end** for the sustainer per Astronautix — a *different block*, not a contradiction | 263 `/system` | 295 `/system`; booster Isp quoted 294 | n.p. | ~1,700 kg class `/system` | n.p. | regen tube-wall | flat-face impinging | pyrotechnic / hypergolic | geared | med [C] |
| **Rocketdyne LR-101 (verniers)** | Rocketdyne / USA | with MA-5 | Atlas — 2 vernier chambers, roll control | LOX / RP-1 | n.p. | GG (fed from the sustainer circuit) | n.p. | n.p. | n.p. | n.p. | n.p. | n.p. | n.p. | n.p. | n.p. | n.p. | n.p. | n.p. | low [D] |

### Notes and contested figures — A.1

**A.1.1 Redstone A-7 thrust: 75,000 vs 78,000 vs 82,977 lbf.** Three numbers, all
correct, all meaning different things.

| value | what it is |
|---|---|
| 75,000 lbf (334 kN) | the **NAA 75-110 nameplate rating** — 75,000 lbf for 110 seconds |
| 78,000 lbf (347 kN) | the nameplate **plus ~3,000 lbf of steam-generator exhaust thrust**; the turbine exhaust is a real, measurable thrust contribution |
| **82,977 lbf (369 kN) SL / 93,565 lbf (416 kN) vac** | the **uprated A-7 as flown** on Mercury-Redstone `[enginehistory.org RPE §4.2]` |

Print 82,977 lbf SL for the flown A-7 and explain the other two. This is the
cleanest example in the file of "which thrust?" being a real question, and it
generalises directly to modern engines with turbine-exhaust or film-cooling
thrust terms.

**A.1.2 Atlas MA-5 chamber pressure: 580 psia vs 48 bar/atm.** heroicrelics.org
gives **580 psia (40 bar)** for both the LR-89 and the LR-105; Encyclopedia
Astronautica gives **48 bar / 48 atm at the injector end** for the MA-5A
sustainer. These are **different engine blocks** (MA-5 vs MA-5A / RS-56), so it
is probably not a contradiction — but neither source is primary. Quote them
separately by block, label both medium confidence, and seek a Rocketdyne or
General Dynamics document before printing either as fact. **No primary source was
obtained for MA-5 / MA-5A at all**; Braeunig and Astronautix both returned errors
during the verification pass.

**A.1.3 MA-5 dry mass is not published per chamber.** The MA-5A *system* mass is
~1,700 kg class. Treat per-chamber dry mass as not published rather than quoting
a figure. Expansion ratios (booster ~8:1, sustainer ~25:1) are medium confidence
and need a primary document.

**A.1.4 V-2 Isp is a reconstruction.** The Wikipedia article gives exhaust
velocity (~2,000 m/s), not Isp; secondary tables vary **199–210 s SL**. Present
203 s SL / 239 s vac with a tolerance, not as a measured value. Mixture ratio and
expansion ratio are likewise reconstructions from secondary data.

**A.1.5 V-2 thrust rises with altitude by design accounting.** ~245 kN (55,000
lbf) SL at the 25-tonne rating, rising to ~285 kN (64,000 lbf, "29 tons") as
ambient pressure falls. The gravity-fed preliminary stage is ~78 kN (8 t).

**A.1.6 The XLR43's successors** carried the lineage to Atlas: XLR71-NA-1 at
120,000 lbf, 438 psia, ε 4.16, on 92.5% ethanol with a **true fuel-rich
bipropellant gas generator**; XLR83-NA-1 at 135,000 lbf per chamber on JP-4.
Between them they produced the tube-wall chamber (E. A. Neu Jr.'s patent, filed
1950-04-05) and the geared turbopump used on Atlas, Jupiter, Thor, Delta and
Saturn I.

**A.1.7 The MA-5 is a propulsion system, not an engine.** Two LR-89 booster
chambers jettisoned in a dropped skirt, one LR-105 sustainer that burns to orbit
insertion, plus two LR-101 verniers. Stage-and-a-half exists to solve air-start
reliability by never air-starting: all three engines light on the pad and are
verified before release. The price is carrying the sustainer's oversized nozzle
and full plumbing off the pad, which is why its SL Isp is 220 s.
