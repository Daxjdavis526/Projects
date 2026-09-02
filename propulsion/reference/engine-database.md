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

---

## A.2 US large boosters and upper stages

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | turbopump | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Aerojet LR87-AJ-11** | Aerojet-General / USA | family from 1955; -11 block 1968 → 2005-10-19 | Titan 24B/34B/IIIB/IIID/IIIE/34D, Titan IV A/B stage 1 — **2 engines per stage** | N₂O₄ / Aerozine 50 | **1.91** | GG; **twin combustion chambers on one turbopump — a two-chamber engine, not two engines** | **968.4** (217,800 lbf) `/engine` — see A.2.1 | **1,218.8** (274,000 lbf) `/engine` | **59.1** `inj`† (58.3 atm, 857 psia) | **250** | **302** | **15:1** | **700** (1,540 lb); -9 quoted 758 | ≈141:1 SL `CALC` | regen, fuel-cooled tubular | unlike-impinging doublet, hypergolic pairs, **baffled** | **hypergolic — no igniter.** This is the point of the propellant choice | single high-speed turbine driving lower-speed centrifugal fuel and ox pumps **through gearing**; rpm and shaft power **n.p.** | med-high [B] |
| **Aerojet LR91-AJ-11** | Aerojet-General / USA | family from late 1950s; 1964-09-01 → 2005-10-19 | Titan III / IV stage 2 | N₂O₄ / Aerozine 50 | **1.86** | GG, single chamber | — (vacuum-start upper stage; no meaningful SL rating) | **467** (105,000 lbf) | **59.3** `inj`† (5.93 MPa, 860 psia) | — | **316** | **49.2:1** | **589** (1,299 lb) | ≈81:1 `CALC` | **hybrid — regen (fuel-cooled) chamber + separate ablative nozzle skirt** | unlike-impinging doublet | hypergolic | **n.p.** | med-high [B]; **low** on turbopump |
| **Rocketdyne H-1** | Rocketdyne / USA | contract 1958-08-15; 1961-10-27 (SA-1) → 1975-07-15 (ASTP) | Saturn I / IB stage 1 — **8 engines** | LOX / RP-1 | **2.23 ± 2%** | GG; **solid-propellant gas generator (SPGG) spin-start** | uprated **734 → 836 → 890 → 912** (165k → 188k → 200k → 205k lbf) | **n.p.** | **43.6–48.3** `inj`† (633–700 psia) across blocks | **255** | **289** | **8:1** | ~1,000 class — **low conf.**, see A.2.4 | ≈90:1 at 890 kN / 1,000 kg `CALC` | regen **tube-wall**, fuel-cooled | flat-face impinging with baffles | **TEA pyrophoric slug** in a burst-diaphragm cartridge — ancestor of Merlin's TEA-TEB | single geared turbopump, SPGG spin-start; burn 155 s | med-high [B] on F/Isp/Pc; **low** on mass and vac thrust |
| **Rocketdyne F-1** | Rocketdyne / USA | study 1955–57; 1967-11-09 (Apollo 4) → 1973-05-14 (Skylab 1) | Saturn V S-IC — **5 engines** | LOX / RP-1 | **2.27** (69% LOX / 31% RP-1); 1,789 kg/s LOX + 788 kg/s RP-1 = **2,577 kg/s** | GG, fuel-rich; **GG exhaust dumped into the nozzle extension as a film-cooling curtain** | **6,770** (1,522,000 lbf); early flights **6,700** (1,500,000 lbf) | **7,770** (1,746,000 lbf); enginehistory gives 1,748,200 lbf | **≈70** `inj` (1,015 psia) — **CONTESTED, see A.2.2** | **263** (260 early); enginehistory **265.4** | **304**; enginehistory **304.1** | **16:1** incl. extension — undisputed | **8,400** (18,500 lb) — both sources agree | **94.1:1** SL | regen **tube-wall, 178 brazed tubes**, up-pass/down-pass; + GG-exhaust film cooling of the extension. Liner: Inconel X-750 / Hastelloy tubes brazed into an Inconel jacket | flat-face **mixed doublet and triplet, "5U(f)" pattern**, **copper baffle assembly dividing the face into 13 compartments** | **hypergolic TEA/TEB cartridge** in the chamber; pyrotechnic igniter in the GG | single shaft, **direct-drive (no gearbox)**, two-stage turbine, single-stage centrifugal LOX and RP-1 pumps, **5,488 rpm, 55,000 bhp (41 MW)** | high [A] except **low on Pc** |
| **Rocketdyne J-2** | Rocketdyne / USA | approved 1960-06-01; 1966-02-26 (AS-201) → Apollo/Skylab | Saturn IB S-IVB (1); Saturn V S-II (5) and S-IVB (1) | LOX / LH2 | **5.5 nominal**; PU valve shifts **4.5–5.5**, trading thrust **780–1,000 kN** against Isp | GG | — (vacuum only) | **1,033.1** (232,250 lbf) at 5.5:1 | **52.6** `inj`† (5,260 kPa, 763 psia) | — | **421** | **27.5:1** | **1,788.1** (3,942 lb) | ≈59:1 `CALC` | regen **tube-wall**, fuel-cooled | **coaxial shear, 614 hollow LOX posts with concentric fuel annuli**, through a **porous sintered stainless faceplate** transpiration-cooled with hydrogen | **augmented spark igniter (ASI)**, dual plugs — LOX/LH2 torch at the injector centre | **separate, independently driven pumps in series on the GG exhaust**: fuel **7-stage axial 27,000 rpm**; ox **single-stage centrifugal 8,600 rpm**. Series gas path makes the mixture ratio self-regulating. **Restartable** (TLI) with an ambient helium start tank | high [A] |
| **J-2S** (uprated, tested 1965–72, **never flown**) | Rocketdyne / USA | 1965–72 | — | LOX / LH2 | 5.5 | **Tap-off** — hot gas bled from the main chamber, no GG | — | **1,138.5** (255,945 lbf) | n.p. | — | **436** | n.p. | **1,400** | n.p. | regen tube-wall | coaxial | ASI | as J-2 | **unflown — do not table with flight values** |
| **Aerojet Rocketdyne J-2X** | P&W Rocketdyne → Aerojet Rocketdyne / USA | announced 2007-07; hot-fire 2011–13; **idle after 2014; never flown** | intended: Ares I upper stage, Ares V EDS, early SLS upper stages | LOX / LH2 | **5.5** | GG — chosen for schedule and cost, not performance | — | **1,307–1,310** (294,000 lbf) | **91.9–92.2** (1,332–1,337 psia; sources give both — rounding) — see A.2.6 | — | **448** | **92:1** with extension | **2,472** (5,450 lb) | ≈54:1 `CALC` | regen **milled-channel** chamber (a deliberate change from J-2's brazed tube wall) + film-/radiatively-cooled extension | coaxial, J-2/RS-25 heritage | augmented spark igniter | **centrifugal** fuel pump replacing J-2's axial; separate fuel and ox turbopumps | med-high [B]; **unflown** |
| **P&W RL10A-3-3A** | P&W → Aerojet Rocketdyne → L3Harris / USA | family from 1958, first flight 1962; -3-3A in service 1986 → early 2000s | Centaur (Atlas I/II/IIA/IIAS, Titan IV Centaur), Delta III | LOX / LH2 | **5.0** | **Closed expander** — no preburner, no GG; nothing dumped | — | **73.4** (16,500 lbf) | **32.8** `n.s.` (475 psia) — low **by design**: expander heat input scales with wall area (≈D²) while thrust scales with throat area, so Pc has a hard ceiling | — | **444–445** | **61:1** | ~**136** (300 lb) class — med conf. | ≈55:1 `CALC` | regen **brazed stainless tube-wall**, hydrogen-cooled — **the cooling circuit *is* the power cycle** | coaxial shear | spark torch igniter | **single shaft with a reduction gearbox**: two-stage centrifugal H₂ pump at ~**31,000 rpm** (med conf.) driving a single-stage centrifugal LOX pump through gearing | med-high [B]; **med** on mass and rpm |
| **Aerojet Rocketdyne RL10B-2** | P&W → AR → L3Harris / USA | early–mid 1990s; **first flight 1998**; still flying | Delta III S2, Delta IV DCSS, **SLS ICPS** | LOX / LH2 | **5.88** | Closed expander | — | **110.1** (24,750 lbf) — Wikipedia and L3Harris agree exactly | **Not published** by manufacturer or Wikipedia; Astronautix ~44 bar (~640 psia) — **low conf., do not print** | — | **465.5** — **the highest Isp of any flown chemical rocket engine** | **CONTESTED: 285:1 deployed / 77:1 retracted**, see A.2.7 | **301** (664 lb) | ≈37:1 `CALC` | regen tube-wall chamber; **uncooled radiatively-cooled carbon–carbon extension** — NOVOLTEX® SEPCARB® 3D C–C by SEP, ~2.5 m long, exit >2.1 m, translates into place after separation, worth ~30 s Isp | coaxial shear | spark torch | geared single-shaft, RL10 heritage | high [A] on F/Isp/mass; **med** on ε; **low** on Pc |
| **Aerojet Rocketdyne RL10C-1** | AR → L3Harris / USA | line consolidation ~2010–14; **first flight 2014** | Atlas V Centaur (single and dual); Vulcan Centaur V (RL10C-1-1) | LOX / LH2 | **5.5** | Closed expander | — | **101.8** (22,890 lbf, L3Harris) — Wikipedia 101.5 (22,820 lbf), see A.2.8 | **Not published** by the manufacturer. *Do not guess.* | — | **449.7** (both sources agree exactly) | **130:1** fixed (Wikipedia only) | **190** (420 lb) | ≈55:1 `CALC` | RL10 family standard — regen tube-wall | coaxial shear | spark torch | geared single-shaft | high [A] on Isp/mass; **med** on thrust; **low/absent** on Pc |
| **Aerojet Rocketdyne RS-25 (SSME Block II)** | Rocketdyne → PWR → AR → L3Harris / USA | contract 1971-07-13; first engine test 1977-03-16; **STS-1 1981-04-12**; Block II from STS-104 (2001); now expendable on SLS | Shuttle orbiter (3); SLS core stage (4) | LOX / LH2 | **6.03** (L3Harris rounds to 6.0) | **Fuel-rich staged combustion, dual-shaft** — two independent fuel-rich preburners, one per turbopump, both exhausting into the main injector | **1,860** (418,000 lbf) @109% FPL; 1,750 @104.5%; 1,670 @100% RPL | **2,279** (512,300 lbf) @109%; 2,170 @104.5%; 2,090 @100% | **206.4** `inj` (2,994 psia) @109% — Wikipedia and L3Harris agree exactly. ~198 bar @104.5%, ~189 bar @100% (*scaled, med conf.*) | **366** | **452.3** (L3Harris rounds to 452) | **CONTESTED — 69:1 vs 77.5:1 vs 78:1**, see A.2.3 | **CONTESTED — 3,177 kg (7,004 lb) vs 3,526 kg (7,775 lb)**, see A.2.5 | **73.1:1** on the 7,004 lb mass; **~66:1** on the L3Harris mass | regen **milled-channel — 390 channels in the MCC liner**, H₂-cooled; nozzle is a **1,080-tube brazed tube-wall**. Liner **NARloy-Z** (Cu–Ag–Zr) with electroformed-nickel closeout | **coaxial shear, 600 main elements**, ASI at the face centre, **acoustic-resonator cavities** in the face for HF stability | augmented spark igniter (H₂/O₂ torch), plus separate ASIs in each preburner | **four pumps**: LPFTP axial ~**16,185 rpm**; **HPFTP 3-stage centrifugal ~35,360 rpm, 71,140 hp (53.05 MW)**, discharge ~7,000 psi; LPOTP ~**5,150 rpm**; **HPOTP 2-stage centrifugal (main + preburner boost) ~28,120 rpm, 23,260 hp (17.34 MW)**. Throttle **67–109%** (ground-tested 111%) | high [A]; **med** on mass; **contested** on ε |
| **Aerojet Rocketdyne RS-68A** | Rocketdyne (Boeing) → PWR → AR / USA | RS-68 from mid-1990s, first flight 2002-11-20; RS-68A in service 2012; **last flight 2024-04-09** | Delta IV Medium / Heavy common booster cores | LOX / LH2 | ~6.0 — *not stated in the sources fetched; low conf., treat as not published* | **Gas generator** — chosen explicitly over staged combustion for cost; ~80% fewer parts than RS-25; GG exhaust dumped through a side duct | **3,137** (705,000 lbf) [RS-68: 2,950 / 660,000 lbf] | **3,560** (800,000 lbf) [RS-68: 3,370 / 758,000 lbf] | **102.6** `n.s.` (1,488 psia) both blocks; the RS-68A uprate came from ~5 bar more Pc plus a redesigned injector | **365** (RS-68) | **411.9** (RS-68: 410) | **21.5:1** — very low for hydrolox because the nozzle is ablative and mass-limited | **6,740** (14,870 lb) [RS-68: 6,600 / 14,560 lb] | **47.4:1** [RS-68 45.3:1] — the lowest of any modern large booster engine, the direct price of design-for-cost | **split: regen (H₂ channels) MCC + ablative silica/carbon-phenolic nozzle** that chars and erodes through the burn; ablated carbon burning in air is the bright orange plume | coaxial; redesigned between RS-68 and -68A for mixing efficiency | pyrotechnic/spark with a large pre-ignition hydrogen bloom (the "hydrogen burnoff") | separate fuel and ox turbopumps on a GG circuit; rpm and power **n.p.** | high [A]; **low** on O/F and turbopump |
| **Rocketdyne RS-27A** | Rocketdyne / USA | RS-27 from 1974; RS-27A 1980s–early 90s; **last flight 2018-09-15** (ICESat-2) | Delta II and Delta III stage 1 [RS-27: Delta 2000/3000] | LOX / RP-1 | ~2.25 — *not stated in the source; low conf.* | GG | **890.1** (200,100 lbf) — **lower** than the RS-27's 971 kN; see A.2.9 | **1,054.2** (237,000 lbf) | **48** `inj`† (4.8 MPa, 700 psia) [RS-27: 49 bar / 710 psia] | **255** [RS-27: 264] | **302** [RS-27: 295] | **12:1**, up from the RS-27's **8:1** | **1,147** (2,529 lb) [RS-27: 1,027] | ≈79:1 SL `CALC` | regen tube-wall, fuel-cooled — direct H-1 heritage | flat-face impinging | pyrotechnic / hypergolic slug | single geared turbopump, H-1/MB-3 heritage; burn 265 s | med [C] — single source |

### Notes and contested figures — A.2

**A.2.1 LR87-AJ-11 thrust: 968 kN vs 1,900 kN.** Wikipedia's LR87 variant table
lists "1,900 kN" for the -11. That is the **two-engine Titan IV stage** figure,
not one engine. The single-engine values are **968.4 kN SL / 1,218.8 kN vac**.
Print the single-engine figures and state the stage total separately. The same
care is needed throughout: each LR87 "engine" is itself **two combustion chambers
on one turbopump**, and Titan stage 1 carries two of them — **four chambers
total**. Wikipedia's variant table gives "59 bar" for the -11 and "40–59 bar" as
the family range.

**A.2.2 F-1 chamber pressure: 965 / 982 / 1,015 / 1,125 psia.**

| value | bar | source |
|---|---|---|
| 965 psia | 66.5 | Sutton & Biblarz (older editions); the textbook's own working draft |
| 982 psia | 67.7 | NASA-derived F-1 documentation quoted in search results |
| **1,015 psia** | **70.0** | Wikipedia infobox, consistently |
| 1,125 psia | 77.6 | enginehistory.org RPE §8.11; also described as a development peak |

Print "≈70 bar (1,015 psia) at the injector end" and footnote the range
965–1,125 psia. The spread is a measurement-station and program-phase artefact:
injector-end static pressure, nozzle-stagnation pressure and the maximum reached
during development are three different quantities, and secondary sources almost
never say which they are quoting. **Open action: read NASA NTRS 20140011656
(*Waking a Giant*) as text and pin this down.** The PDF was retrieved but not
text-extracted during the verification pass.

**A.2.3 RS-25 expansion ratio: 69:1 vs 77.5:1 vs 78:1 — the classic case.**

| value | source |
|---|---|
| **69:1** | **L3Harris (manufacturer) datasheet, labelled "area ratio"**; Wikipedia infobox |
| 77.5:1 | NASA/Rocketdyne SSME training material; widely repeated in the nozzle-flow literature |
| 78:1 | Wikipedia body text |

69:1 is the nozzle exit area over the throat area of the bell as built. The
~77.5:1 figures come from analyses using a different reference — most plausibly
the exit area against a different throat definition, or an effective/aerodynamic
area ratio. Print **69:1** as the geometric expansion ratio, cite L3Harris, and
footnote that ~77.5:1 is widely quoted, then use the discrepancy deliberately in
the nozzle chapter (module 09) to make the point that "expansion ratio" is not a
single unambiguous quantity. Do not silently pick one. **Open action: read the
Rocketdyne *SSME Orientation* training document** (503 during the pass) to
establish what the 77.5:1 figure actually measures.

**A.2.4 H-1 dry mass.** Wikipedia's infobox range "1,000–2,100 kg" is garbled —
it conflates inboard/outboard installations and gimbal hardware. Treat the
single-engine dry mass as **~1,000 kg, low confidence**, and note that the
computed T/W of ≈90:1 inherits that uncertainty. Vacuum thrust is not separately
quoted in the sources consulted; the vacuum Isp is.

**A.2.5 RS-25 dry mass: 7,004 lb vs 7,775 lb.**

| value | source |
|---|---|
| 7,004 lb / 3,177 kg | Wikipedia |
| **7,775 lb / 3,526 kg** | **L3Harris (manufacturer)** |

771 lb (350 kg) apart. Almost certainly bare engine versus *installed* engine
(heat shield, gimbal bearing, controller). Quote the manufacturer's 7,775 lb,
state that it is the installed mass, and note the 7,004 lb bare figure. This
matters because the published thrust-to-weight of **73.1:1 uses the lower mass**;
on the manufacturer's mass it is **~66:1**. **Never quote a T/W without saying
which mass it used.**

**A.2.6 J-2X chamber pressure: 1,332 vs 1,337 psia.** Sources give both; the
difference is rounding. **Open action: pin against NTRS 20100034922** before
printing. Roughly double the J-2's. The program itself listed four design deltas
from the J-2: removal of beryllium; modern electronics; centrifugal rather than
axial fuel turbopump; channel-walled combustion chamber rather than tube-welded.

**A.2.7 RL10B-2 expansion ratio: 280:1 vs 285:1.** Wikipedia's table says 280:1;
the SEP/AIAA carbon-carbon nozzle literature says the extension takes the engine
**from 77:1 to 285:1**. Print "**285:1 deployed, 77:1 retracted**", cite the
nozzle paper, and note 280:1 as a rounding that circulates in secondary tables.
The retracted figure is the more interesting one — it is what makes the extendible
mechanism worth its single-point-failure risk.

**A.2.8 RL10C-1 thrust: 22,820 lbf vs 22,890 lbf.** Wikipedia 101.5 kN (22,820
lbf); L3Harris 22,890 lbf (101.8 kN). A 70 lbf difference — immaterial in
magnitude, but the manufacturer's figure should win on principle. Use 22,890 lbf.

**A.2.9 RS-27 → RS-27A is a clean nozzle-trade example.** The RS-27A has *lower*
sea-level thrust than the RS-27 (890.1 vs 971 kN) and lower SL Isp (255 vs 264 s),
because the bigger nozzle (ε 12 vs 8) costs SL thrust and buys vacuum performance
(302 vs 295 s vac). Use it as the worked example in module 09.

**A.2.10 RL10 family table (L3Harris manufacturer figures).**

| variant | thrust (lbf) | Isp (s) | weight (lb) | O/F |
|---|---|---|---|---|
| RL10A-4-2 | 22,300 | 451.0 | 370 | 5.5 |
| RL10B-2 | 24,750 | 465.5 | 664 | 5.88 |
| RL10C-1 | 22,890 | 449.7 | 420 | 5.5 |
| RL10C-3 | 24,340 | 460.1 | 508 | 5.7 |
| RL10C-X | 24,120 | 460.9 | 510 | 5.5 |

RL10C-X is the additively-manufactured development variant. The RL10 has been in
continuous production for over six decades — the longest service life of any
rocket engine.

**A.2.11 Open verification actions in this group.** RL10A-3-3A figures come from
search summaries of NASA CR-190786 and TM-107318, not from the documents
themselves — read them directly. F-1 Pc (A.2.2), RS-25 ε (A.2.3) and J-2X Pc
(A.2.6) as above.

---

## A.3 Commercial-era US engines

**A standing caveat for this entire section.** SpaceX, Blue Origin and Rocket Lab
publish almost nothing in the peer-reviewed or government-report literature. Most
figures below originate from company websites, press kits, conference talks or
executive social-media posts, and several have changed silently over time. Where
a number is a company claim it is labelled **claim**. Say so on the page, not in
a footnote.

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | turbopump | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **SpaceX Merlin 1D (SL)** | SpaceX, Hawthorne CA / USA | dev 2011–12, qual 2013-03, **first flight 2013-09-29**; Block 5 final rating 2018-05 | Falcon 9 (9 per stage 1), Falcon Heavy (27) | LOX / RP-1 | ~2.34 — **SpaceX does not publish this; treat as not published** | **Gas generator**, open, fuel-rich — a deliberate simplicity choice | **845** (190,000 lbf) | **981** (221,000 lbf) — see A.3.1 | **97** `n.s.` (9.7 MPa, 1,410 psi) — **claim**, not independently verified | **282** | **311** | **16:1** (up from Merlin 1C's 14.5) | **470** (1,030 lb) | **184:1** — **claim**, the highest of any flown orbital-class engine; 845 kN / 470 kg → 183:1 checks out | regen **milled-channel**, RP-1-cooled chamber and nozzle | **Pintle** — single central pintle post, throttleable by design, inherently stable. SpaceX traces it directly to the **Apollo LM descent engine** (TRW lineage) | **TEA-TEB** pyrophoric slug, ground-fed on stage 1 | **single-shaft, dual-impeller** — one shaft carries LOX and RP-1 impellers and the turbine, **~36,000 rpm, ~10,000 hp (7,500 kW)** (company figures). Throttle 40–100% (originally 70–100%) | med-high [B] on F/Isp/ε/mass; **med** on Pc and turbopump; **n.p.** on O/F |
| **SpaceX Merlin 1D Vacuum (MVac)** | SpaceX / USA | with Falcon 9 v1.1 | Falcon 9 / Heavy stage 2 — 1 engine | LOX / RP-1 | as above | GG | — | **981** (220,500 lbf) | 97 `n.s.` — **claim** | — | **348** — the highest Isp of any American hydrocarbon engine flown; see A.3.2 | **165:1** with the niobium extension | **n.p.** | n.p. | regen milled-channel; **radiatively cooled niobium-alloy extension** (cherry-red in flight is normal) | pintle | TEA-TEB, carried aboard for restarts | as above; throttle **39–100%** (360–981 kN) | med-high [B] |
| **SpaceX Raptor 1** | SpaceX, McGregor TX / USA | first test firing 2016-09-25 | Starship / Super Heavy | **subcooled** LCH₄ / LOX | **3.6** (≈78% O₂ / 22% CH₄) | **Full-flow staged combustion (FFSC)** — ox-rich preburner driving the LOX pump, fuel-rich preburner driving the CH₄ pump, **both exhausts into the main chamber** | **1,814** (408,000 lbf; 185 tf) — **claim** | 1,962 (200 tf) — **claim** | **250** (3,626 psia) — **claim** | 327 — **claim** | 350 — **claim** | 34.34 (SL) / 80 (vac variant) | **2,080** — **claim** | 88.9 — **claim** | regen, methane-cooled milled channels | coaxial swirl (from Raptor 2 onward) | spark torch igniters | two turbopumps, one ox-rich one fuel-rich, mechanically independent; speeds and shaft powers **n.p.** | **LOW–MED [D], and that is the point** |
| **SpaceX Raptor 2** | SpaceX / USA | production from 2021-12-18 | Starship / Super Heavy | as above | 3.6 | FFSC | **2,256** (507,000 lbf; 230 tf) — **claim**, traces to an **August 2020 Musk post on Twitter/X** | **2,530** (258 tf) — **claim** | **300** (4,351 psia) — **claim** | 347 — **claim** | n.p. | ~34.3 / ~80 | **1,630** — **claim** | **141.1** — **claim** | regen methane | coaxial swirl | **main-chamber igniter eliminated** — preburner torches and hot preburner gas light the main chamber. No TEA-TEB, which matters for on-orbit relight | as above | **LOW–MED [D]** |
| **SpaceX Raptor 3** | SpaceX / USA | reported first flight **2026-05-22** (Starship Flight Test 12) | Starship / Super Heavy | as above | 3.6 | FFSC | **2,452** (551,000 lbf; 250 tf); 280 tf max on ground test — **claim** | 2,697 (275 tf) — **claim** | **330** (4,786 psia) operational — **claim** | ~350 — **claim** | n.p. | ~34.3 / ~80 | **1,525** — **claim** | **163.9** — **claim** | regen methane; much secondary plumbing integrated into the castings/prints, which is where much of the claimed mass reduction comes from | coaxial swirl | preburner torch | as above | **LOW–MED [D]** |
| **Blue Origin BE-3PM** | Blue Origin, Kent WA / USA | announced 2013-01; **first flight 2015-04-29** | New Shepard suborbital booster — 1 engine | LOX / LH2 | **n.p.** | **Tap-off** — hot gas bled directly from the main chamber, no preburner and no GG. Effectively the only tap-off engine in regular service (cf. J-2S, never operational) | **490** (110,000 lbf) full power; **minimum 89** (20,000 lbf) — an **18–100% throttle range** | n.p. | **n.p.** | n.p. | **n.p.** | **n.p.** | **n.p.** | n.p. | regenerative (stated generally by Blue Origin; not documented in detail) | **n.p.** | **n.p.** | **n.p.** | med [C] on F/throttle/cycle/dates; **most of the parameter set is genuinely not published** |
| **Blue Origin BE-3U** | Blue Origin / USA | from ~2015; **first orbital flight 2025-01-16** | New Glenn stage 2 — 2 engines | LOX / LH2 | **n.p.** | **Expander bleed** — *not* the BE-3PM's tap-off. The two share a name and very little else in the power cycle | — | **711.5 / 889.5 / 941.5** — three published values, see A.3.3 | **n.p.** | — | **445** — company figure | **n.p.** (extendible nozzle) | **n.p.**; company quotes T/W 90:1, which back-solves to ~1,000 kg at 889 kN (*derived, low conf.*) | **90:1** — **claim** | **n.p.** | **n.p.** | **n.p.** | **n.p.**; throttle 75–100% | low-med [D] |
| **Blue Origin BE-4** | Blue Origin, Huntsville AL / USA | work from 2011; announced 2014-09; hotfire 2017-10; **first flight 2024-01-08** (Vulcan Cert-1) | ULA Vulcan Centaur (2); New Glenn stage 1 (7) | LOX / **LNG (methane)** | **n.p.** | **Oxidizer-rich staged combustion** — a single ox-rich preburner whose turbine drives **both** pumps. The first US-designed ORSC engine to fly | **2,460** (550,000 lbf) as specified; **2,847** (640,000 lbf) claimed 2025-11 — see A.3.4 | **n.p.** | **140** `n.s.` (2,030 psia) — deliberately **low** for ORSC (cf. RD-180 at 267 bar); Blue Origin states this is a life-and-reusability choice, not a limitation | **340** — company figure | n.p. | **n.p.** | **5,400** (11,900 lb), original configuration | ≈46:1 at 2,460 kN / 5,400 kg `CALC` — modest | regeneratively cooled thrust chamber, **methane** coolant | element type **n.p.** (full-scale injector elements were tested in development) | relightable via a **head-pressure start** — tank pressure spins the turbine up, no start cartridge or spin-start system | ~**75,000 hp (56 MW)**; **hydrostatic bearings rather than rolling-element** — a life-driven choice for reuse. Throttle 40–100% | med [C] |
| **Rocket Lab Rutherford (SL)** | Rocket Lab, Auckland NZ / Long Beach CA | first test firing 2013; qual 2016-03; **first flight 2017-05-25**; 369 engines flown across 47 Electron flights by 2024-04 | Electron stage 1 — 9 engines | LOX / RP-1 | **n.p.** | **Electric pump-fed** — the first such engine ever flown. Two **brushless DC motors** on Li-polymer batteries. No turbine, no GG, **no power-cycle propellant loss at all** | **24.9** (5,600 lbf) | n.p. | **n.p.** | **311** | 343 (vac variant) | **n.p.** | **35** (77 lb) | **72.8:1** — *engine* T/W, excluding batteries; the stage-level figure is much worse and batteries are partly jettisoned in flight | regen — cold RP-1 through channels in the printed chamber | **n.p.** in detail | spark | **two motors, 37 kW (50 hp) each at 40,000 rpm**; the stage-1 pack supplies **>1 MW (1,300 hp)** for all nine engines. **Chamber, injectors, pumps and main valves all 3D-printed** (LPBF/DMLS) | med-high [B]; **n.p.** on Pc, ε, O/F |
| **Rocket Lab Rutherford (vacuum)** | as above | as above | Electron stage 2 — 1 engine, larger nozzle | LOX / RP-1 | n.p. | electric pump-fed | — | **25.8** (5,800 lbf) | n.p. | — | **343** | **n.p.** | 35 class | n.p. | regen | n.p. | spark | as above | med-high [B] |
| **Rocket Lab Archimedes** | Rocket Lab, Long Beach CA / USA–NZ | announced 2021; cycle changed to ORSC in development; first hotfire 2024; full-mission-duration hot fire 2025-08. **In development, not yet flown** | Neutron — 9 on stage 1, 1 vac-optimised on stage 2 | LOX / LCH₄ | **n.p.** | **Oxidizer-rich staged combustion.** Rocket Lab states the change from its original GG design was forced by the requirement to hold performance "through all the throttle points that a reusable rocket needs" | **730** (165,000 lbf) — **claim** | **890** (200,000 lbf) — **claim** | **n.p.** | **329** — **claim** | **365** — **claim** | **n.p.** | **n.p.** | n.p. | **n.p.**; mostly 3D printed | **n.p.** | **n.p.** | **n.p.**; throttle 50–100%. Deliberately de-rated: Rocket Lab says Archimedes runs well below its structural capability to extend life between reflights | **low [D] — company claims for an unflown engine** |
| **SpaceX SuperDraco** | SpaceX / USA | announced 2012-02-01; qual 2014-05; **first flight (pad abort) 2015-05-06** | Crew Dragon launch escape — **8 engines in 4 pods of 2** | **MMH / N₂O₄** hypergolic; propellant load **1,388 kg** (3,060 lb) | **n.p.** | **Pressure-fed** (helium) | **71** (16,000 lbf) each; pod pair 32,000 lbf; all eight ~568 kN | n.p. | **69** `n.s.` (6.9 MPa, 1,000 psi) — exceptionally high for pressure-fed, hence the substantial helium system | **235** — low, as expected for a short low-ε abort engine | n.p. | **n.p.**; visibly small | **n.p.** | n.p. | **Regenerative** — unusual for a hypergolic abort engine (most are ablative or film-cooled), necessary because it must be restartable and reusable. Chamber is **3D-printed Inconel** (DMLS), the first printed combustion chamber to fly on a crewed spacecraft | **n.p.** — pintle is likely given SpaceX practice, but that is inference; **do not print it as fact** | hypergolic, no igniter | none (pressure-fed). Throttle **20–100%**; burn ~25 s | med [C] |
| **SpaceX Draco** | SpaceX / USA | ~2008–10; **first flight 2010-12** (Dragon C1) | Dragon 1 (18 thrusters) / Dragon 2 (16) — ACS, orbital manoeuvring, deorbit | **MMH / NTO** | **n.p.** | Pressure-fed | — | **0.400** (90 lbf) | **n.p.** | — | **300** | **n.p.** | **n.p.** | n.p. | film/radiative — *not documented; inferred from class, flag as such* | **n.p.** | hypergolic, no igniter | none | med [C] on F and Isp; **low/n.p.** on everything else |

### Notes and contested figures — A.3

**A.3.1 Merlin 1D vacuum thrust: 981 kN vs 932 kN, and the SL/MVac coincidence.**
The sea-level Merlin 1D's *vacuum* rating (981 kN / 221,000 lbf) and the MVac's
rating (981 kN / 220,500 lbf) are nearly identical, which is a known and
persistent source of confusion. The physical reason is that the MVac trades
chamber-pressure headroom for nozzle area rather than for thrust. **Consistency
issue to flag when quoting:** figures near **932 kN** also circulate for the
Merlin 1D vacuum rating in derivative tables, and 981 vs 932 kN cannot both be
the same quantity. The worksheet's sourced pair is **845 kN SL / 981 kN vac for
the SL engine** and **981 kN vac for MVac**; if a module needs a vacuum number
for the SL engine, quote 981 kN, state that it is the SL engine's vacuum rating
(not the MVac's), and note that lower figures in circulation are not reconciled
against a primary source. Never place the two 981 kN numbers side by side without
saying which engine each belongs to.

**A.3.2 Merlin 1D Vacuum Isp: 311 s vs 348 s.** Wikipedia's MVac infobox has at
times carried **311 s** — which is the *sea-level engine's vacuum* Isp — in the
MVac's vacuum field, flagged "needs update". The correct figure is **348 s**. This
specific error has propagated into a number of derivative tables and is easy to
repeat.

**A.3.3 BE-3U thrust: 711.5 / 889.5 / 941.5 kN.** Original specification 711.5 kN
(160,000 lbf); improved 889.5 kN (200,000 lbf); demonstrated 941.5 kN (211,658
lbf). Quote **~710 kN as the design point** and note the uprate history; it is
unclear which figure is flight-nominal, and the shifting figures make independent
performance assessment impossible.

**A.3.4 BE-4 thrust: 2,460 kN vs 2,847 kN.** As originally specified vs the
improved performance stated in **November 2025**. Quote **2,450–2,460 kN as the
baseline** and note the 2025 uprate, because it is not yet clear which vehicles
fly which rating. The general rule for both Blue Origin engines: give the original
specification as the baseline, list the uprates with their dates, and say that the
flight-nominal value is not clearly published.

**A.3.5 Raptor — every figure is a SpaceX claim.** Thrust, chamber pressure, Isp,
dry mass and thrust-to-weight for Raptor 1/2/3 originate from SpaceX statements,
several of them **Musk posts on Twitter/X** (the Raptor 2 thrust figures trace to
an August 2020 post). Independent corroboration exists only for thrust, and only
indirectly, via FAA licensing and environmental documents and third-party analysis
of flight telemetry and acoustics. **There is no independent verification of
Raptor chamber pressure, Isp, dry mass or T/W at all.** Present Raptor in a
visually distinct block — a shaded box, or a "manufacturer-claimed" column — and
say plainly that the figures are unverified. The same treatment applies to BE-3U,
BE-4, Archimedes and Prometheus.

**A.3.6 Raptor's genuine first.** Raptor is the **first full-flow staged
combustion engine ever flown**. Only the Soviet **RD-270** (never flown) and the
American **Integrated Powerhead Demonstrator** (test only) preceded it. That is
the single most important fact in the block, and it does not depend on any
contested number. At 300–330 bar Raptor 2/3 would exceed the RS-25's 206 bar and
the RD-180's 267 bar — *if the claims hold*.

**A.3.7 Rutherford's efficiency claim.** Rocket Lab claims ~**95%** for the
electric pump drive versus ~50% for a gas-generator turbine. This compares
different things — electrical-to-hydraulic efficiency versus thermodynamic cycle
efficiency — and the textbook should not repeat it uncritically. The honest
criticism of the electric-pump cycle is that battery mass is carried as parasitic
weight; Rocket Lab itself moved to ORSC (Archimedes) for Neutron.

**A.3.8 Merlin TVC detail worth teaching.** The TVC actuators run on **RP-1 tapped
from the high-pressure side and returned to the low-pressure inlet** — there is no
separate hydraulic fluid to run out, which is exactly the failure that has ended
other vehicles.

**A.3.9 SuperDraco's abandoned application.** The original propulsive-landing
application was dropped after an **April 2019 ground-test explosion** traced to
NTO leaking past a check valve into a helium line.

**A.3.10 Draco vs R-4D — the comparison to make.** **400 N at 300 s (Draco, 2010)
versus 490 N at 312 s (R-4D, 1965).** Fifty years, and the small-hypergolic state
of the art barely moved. That is itself the lesson.

---

## A.4 European engines

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | turbopump | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Vulcain 1** | Snecma → ArianeGroup / France (Avio IT: LOX pump; GKN/Volvo SE: turbines, nozzle) | dev from 1988; **1996-06-04** → 2009-12-18 | Ariane 5 G / G+ / GS core | LOX / LH2 | **5.3** | **Gas generator** — Europe deliberately did not attempt staged combustion for Ariane 5 | **n.p.** | **1,140** (256,000 lbf) | **100** `n.s.` (1,450 psia) | n.p. | **431** | **45.1:1** | **1,300** | n.p. | regen **tube-wall** | coaxial shear (LOX post / H₂ annulus) | pyrotechnic / spark torch, **ground start only — Vulcain does not restart** | **two separate turbopumps** on a common GG: **LOX 13,600 rpm / 3 MW; LH2 34,000 rpm / 12 MW**. Flow ~235 kg/s total, 41.2 kg/s H₂ | high [A] |
| **Vulcain 2** | ArianeGroup / France | **2005-02-12** → 2023-07-05 | Ariane 5 ECA / ECA+ / ES core | LOX / LH2 | **6.1** — the increase is the single biggest source of the thrust uprate | GG | **n.p.** (~960 kN commonly cited — **treat as unverified**) | **1,359** (306,000 lbf) | **117.3** `n.s.` (1,701 psia); "115 bar" in secondary summaries is a rounding, see A.4.1 | n.p. | **429** — *lower* than Vulcain 1 despite higher Pc, because the richer 6.1:1 ratio trades Isp for density and thrust; see A.4.2 | **58.2:1** | **1,800** | ≈77:1 vac `CALC` | regen tube-wall; **film cooling added to the lower nozzle**, injecting turbine exhaust — needed because higher Pc and a richer mixture raised wall heat flux | coaxial shear | pyrotechnic / spark torch, no restart | two separate turbopumps: **LOX ~12,300 rpm; LH2 ~36,500 rpm** *(med conf. — from a secondary summary of the AIAA development paper)* | high [A]; **med** on turbopump speeds; **low** on SL thrust |
| **Vulcain 2.1** | ArianeGroup / France | dev from 2014; first nozzle 2017-06; **first flight 2024-07-09** | Ariane 6 core | LOX / LH2 | 6.1 | GG | n.p. | **1,324** (298,000 lbf) — slightly **lower** than Vulcain 2; the 2.1 is a manufacturing simplification, not a performance uprate | **120.8** `n.s.` (1,752 psia) | n.p. | **not separately published** | n.p. | **2,000** | n.p. | as Vulcain 2; **nozzle: 90% fewer parts, 40% lower cost, 30% faster to produce**, by laser-welded sandwich construction — the best-documented manufacturing-driven redesign in European propulsion | coaxial shear | spark torch, no restart | two turbopumps | high [A] |
| **ArianeGroup Vinci** | ArianeGroup (Snecma heritage) / France + European workshare | dev began **1998** — a 26-year development; **first flight 2024-07-09** | Ariane 6 upper stage (ULPM) | LOX / LH2 | **6.1** (some sources round to 6); flows **34.1 kg/s LOX, 5.59 kg/s LH2** back-compute to 6.10, confirming it internally | **Closed expander** — the first European expander engine and the highest-thrust closed expander ever flown (180 kN vs RL10's 110 kN) | — | **180** (40,000 lbf) | **60** `n.s.` (870 psia) — typical of the expander heat-balance limit | — | **457.2** | **240:1**, deployable extension | **~550 total; 160 excluding the nozzle** — the nozzle is ~70% of engine mass | ≈33:1 `CALC` | regen, **smooth-wall chamber with high-speed milled cooling channels**; powder-metallurgy turbopump impellers | coaxial | spark torch. Restart enabled by an **auxiliary propulsion unit (APU)** heating propellant in a **3D-printed gas generator** to re-pressurise tanks, also giving settling and orbital-adjust thrust — arguably more novel than the engine | separate high-speed H₂ and O₂ turbopumps, **not geared** (unlike RL10); speeds **n.p.** Burn up to **900 s**, up to **3 restarts** (some sources say 4+; 3 is the fetched figure) | high [A] |
| **Snecma HM7B** | Snecma → ArianeGroup / France | HM7 from 1973; **1979-12-24** (Ariane 1 L01) → 2023; ~300 engines produced | Ariane 1 / 2 / 3 / 4 third stages (H10); Ariane 5 ECA upper stage (ESC-A) | LOX / LH2 | **5.0** | Gas generator | — | **62.2** (13,980 lbf) | **37** `n.s.` (3.7 MPa, 537 psia) — the article body says 3.5 MPa, see A.4.3 | — | **444.6** | **83.1:1** | **165** (364 lb) — remarkably light | ≈**38:1** `CALC` | regenerative | **n.p. in detail** | **n.p.**; **no restart — single burn only**, the limitation that forced Ariane 5 ECA into direct GTO insertion and motivated Vinci | single-shaft hydrogen turbopump; speeds **n.p.** Burn 735 s (A2/3), 780 s (A4), 950 s (A5 ECA) | med-high [B] |
| **Astrium / ArianeGroup Aestus** | DASA → Astrium → ArianeGroup, Ottobrunn / Germany | 1988–95; **1997-10-30** → **2018-07-25** | Ariane 5 G and ES storable upper stage (EPS) | **N₂O₄ / MMH** | **1.9** | **Pressure-fed** (helium). No turbopump at all | — | **29.6** (6,654 lbf) | **11** `n.s.` (160 psia) — very low, the unavoidable consequence of pressure feeding: tanks must survive Pc plus feed losses | — | **324** | **84:1** | **111** | ≈27:1 `CALC` | regenerative chamber with a **cooled nozzle extension** | **132 coaxial swirl elements** — unusual for a hypergolic engine, where impinging doublets are the norm | hypergolic, none required | none. Burn **1,100 s**, **multiple re-ignitions** | med-high [B] |
| **SEP Viking 2** | SEP / France | from 1971; **1979-12-24** → 2003 | Ariane 1 stage 1 (4×) | N₂O₄ / **UDMH** | **1.86** | Gas generator | **611** | **690** | **55** `n.s.` (5.5 MPa) | n.p. | **281** | **10:1** | **776** | n.p. | **water cooling** — see A.4.4 | impinging | hypergolic | **three coaxial pumps (ox, fuel, water) on one shaft, 2,500 kW at 10,000 rpm** | med-high [B] |
| **SEP Viking 4B** | SEP / France | Ariane 2/3, Ariane 4 stage 2 | Ariane 2/3/4 second stage | N₂O₄ / **UH 25** (25% hydrazine hydrate in UDMH) | **1.70** | GG | **n.p.** | **805** | **55** (5.5 MPa) | n.p. | **301** | **30.8:1** | **826** | n.p. | water-augmented | impinging | hypergolic | three coaxial pumps on one shaft | med-high [B] |
| **SEP Viking 5C** | SEP / France | Ariane 4 stage 1 (4×) | Ariane 4 first stage | N₂O₄ / UH 25 | **1.70** | GG | **678** | **758** | **~58** (~5.8 MPa) | n.p. | **301** | **10:1** | **826** | ≈**84:1** SL `CALC` | water-augmented | impinging | hypergolic | as above | med-high [B] |
| **SEP Viking 6** | SEP / France | Ariane 4 liquid strap-ons | Ariane 4 strap-on boosters | N₂O₄ / UH 25 | **1.71** | GG | **n.p.** | **750** | **n.p.** | n.p. | **n.p.** | **n.p.** | **n.p.** | n.p. | water-augmented | impinging | hypergolic | as above | **incomplete — full parameter set not published** |
| **ArianeGroup / ESA Prometheus** | ArianeGroup for ESA / France–Germany–Europe | ESA funding 2017-06 (€85 M) and 2021 (€135 M); **12-second test firing 2023-06** at Vernon; four consecutive ignitions demonstrated by mid-2025. **Not yet flown** | intended: **Themis** demonstrator, **Ariane Next**, **Maia** | LOX / LCH₄ | **n.p.** | **Gas generator** — notably *not* staged combustion; Europe chose the cheap cycle deliberately for a reusability demonstrator | **~980** (220,000 lbf) — **claim** | n.p. | **100** (1,450 psia) — **claim** | n.p. | **360** — variant/condition not specified in the source; presumably vacuum, **flag as ambiguous** — **claim** | **n.p.** | **n.p.** | n.p. | **n.p.** | **n.p.** | **n.p.** | **n.p.**; throttle **30–110%** claimed; reusability **5 flights** claimed; **up to 50% of the engine by metal 3D printing**; target cost ~**€1 M/engine, one tenth of Vulcain 2** — the cost target, not the performance, is the programme's stated purpose | **low [D] — every figure is a target or a claim for an unflown engine** |

### Notes and contested figures — A.4

**A.4.1 Vulcain 2 chamber pressure: 117.3 bar vs "115 bar".** Not a real
disagreement; 115 bar is a rounding that appears in secondary summaries. **Use
117.3 bar.**

**A.4.2 Vulcain 1 → 2 is the mixture-ratio worked example.** Vulcain 2's vacuum
Isp (429 s) is *lower* than Vulcain 1's (431 s) despite substantially higher
chamber pressure, because the richer 6.1:1 mixture ratio trades Isp for propellant
density and thrust. The optimum for a *vehicle* is not the optimum for an
*engine*. Use this in module 05 (propellants) and module 04 (thermochemistry).

**A.4.3 HM7B chamber pressure: 3.7 MPa vs 3.5 MPa.** The specification table and
the body text of the same Wikipedia article disagree. **Use 37 bar and footnote
the 35 bar figure.** A 5% internal inconsistency inside a single article is a
useful reminder that tertiary sources are not self-consistent.

**A.4.4 Viking's water cooling — THE distinguishing feature.** The Viking carries
a **dedicated water tank and water pump** and injects water into the
exhaust/nozzle to cool it. No other production launch-vehicle engine has done
this. It is a strange, effective and entirely rational answer to cooling a
hypergolic engine whose fuel is a poor coolant, and it is the canonical "there are
more than four cooling methods" example for module 11. The water system is dead
mass, which is the price.

**A.4.5 Viking's reliability record.** **Only 2 failures in 958 engines across 144
launches (1979–2003)** — one of the best records ever compiled by a booster
engine, and a strong argument that architectural conservatism buys reliability.

**A.4.6 Aestus II / RS-72.** A pump-fed ~55 kN development with Rocketdyne was
built and tested but **never flew**. Its numbers are **low confidence** and are
not verified in the worksheet; do not tabulate them.

**A.4.7 Open verification action.** Vulcain 2 turbopump speeds currently come from
a secondary summary of the AIAA development-status paper — read the paper.

---

## A.5 Japanese engines

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | turbopump | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **MHI/JAXA LE-7** | Mitsubishi Heavy Industries with NASDA/JAXA / Japan | from 1984; **first flight 1994-02-04**; **H-II Flight 8 failure 1999-11-15** (LH2 turbopump inducer) | H-II stage 1 | LOX / LH2 | 5.9 | **Fuel-rich staged combustion** | **843.5** | **1,078** | **127** `n.s.` (12.7 MPa, 1,842 psia) | **349** | **446** | **52:1** | **1,714** | **64.1:1** | regen, hydrogen-cooled | coaxial | spark torch | separate LH2 and LOX turbopumps on a fuel-rich preburner; speeds **n.p.** | med-high [B] |
| **MHI/JAXA LE-7A** (long nozzle, operational) | MHI with JAXA / Japan | redesign after the 1999 failure; **first flight 2001-08-29** | H-IIA and H-IIB stage 1 | LOX / LH2 | **5.9** | Fuel-rich staged combustion | **870** (196,000 lbf) | **1,098** (247,000 lbf) | **120** `n.s.` (12.0 MPa, 1,740 psia) — **lower** than the LE-7's; the redesign traded performance for turbopump margin after the failure | **not given in the source** (the LE-7's 349 s is what is published) | **440** | **51.9:1** | **1,800** | **65.9:1** (vac, as published) | regen, hydrogen-cooled | coaxial | spark torch | separate LH2 and LOX turbopumps; speeds **n.p.**; throttle **72–100%** | med-high [B] |
| *LE-7A short-nozzle variant* | — | — | — | LOX / LH2 | 5.9 | FRSC | **843** | **1,074** | 120 | n.p. | **429** | n.p. | n.p. | n.p. | — | — | — | — | med-high [B] |
| **MHI/JAXA LE-5** | MHI with NASDA / Japan | flew on H-I from 1986 | H-I second stage | LOX / LH2 | **5.5** | **Gas generator** | — | **102.9** (23,100 lbf) | **36.5** (3.65 MPa, 529 psia) | — | **450** | **140:1** | **255** | n.p. | regenerative | coaxial | spark | qualified for up to **16 starts** | med-high [B] |
| **MHI/JAXA LE-5A** | MHI with NASDA / Japan | H-II, 1994 | H-II second stage | LOX / LH2 | **5.0** | **Expander bleed** (nozzle + chamber) — **the world's first operational expander bleed engine** | — | **121.5** (27,300 lbf) | **39.8** (3.98 MPa, 577 psia) | — | **452** | **130:1** | **248** | n.p. | regenerative; the cooling circuit is the power source | coaxial | spark | — | med-high [B] |
| **MHI/JAXA LE-5B** | MHI with JAXA / Japan | from 2001 | H-IIA / H-IIB second stage | LOX / LH2 | **not published** in the source | **Expander bleed** (chamber only) — a deliberate simplification, dropping the nozzle from the heat-exchange circuit to cut cost and improve reliability at a small Isp penalty | — | **137.2** (30,800 lbf) | **35.8** (3.58 MPa, 519 psia) | — | **446.8** | **not published** in the source | **285** | ≈49:1 `CALC` | regenerative | coaxial | spark | throttle **100 / 60 / 30% and a 3% idle mode** used for settling and low-thrust manoeuvres | med-high [B] |
| **MHI/JAXA LE-9** | JAXA (design) + MHI (manufacture) / Japan | firing tests from 2017-04; **chamber-wall cracks and turbine-blade fatigue cracks found in 2020**, ~2-year delay; **first flight 2023-03-07** (H3 TF1 — the LE-9s performed correctly, the failure was in stage 2); fully successful 2024-02-17 | H3 core stage — 2 or 3 engines | LOX / LH2 | **5.9** | **Expander bleed** — by a wide margin the **largest expander-cycle-family engine ever flown** (1,471 kN vs RL10's 110 and Vinci's 180). It demonstrates the bleed variant has no practical thrust ceiling | **not published** in the source consulted | **1,471** (331,000 lbf) | **100** `n.s.` (10.0 MPa, 1,450 psia) | n.p. | **426** — well below what staged combustion would give at the same size | **37:1** | **2,400** (5,300 lb) | **62.5:1** (vac, as published) | regen; the jacket drives the turbines and the flow is then dumped | coaxial | **n.p. in detail** | **n.p. in detail** | med-high [B] |

### Notes — A.5

**A.5.1 The cycle distinction that matters.** An **expander bleed** cycle heats a
*portion* of the fuel in the cooling jacket, runs it through the turbine, and then
**dumps it overboard** rather than injecting it into the chamber. It sacrifices a
little Isp (LE-5B's 446.8 s against LE-5A's 452 s) but **escapes the closed
expander's thrust ceiling entirely**, because the turbine no longer has to be fed
by the whole fuel flow. LE-5A/5B and LE-9 are the clearest flown demonstrations;
BE-3U is the American adoption of the same idea. Japan invented and proved this
cycle.

**A.5.2 LE-7 → LE-7A: reliability-driven de-rating.** The LE-7A runs at *lower*
chamber pressure (120 vs 127 bar) than the engine it replaced. The redesign traded
performance for turbopump margin after the Flight 8 inducer failure. It is a clean
case study for module 33 (systems engineering) and module 34 (failure cases).

**A.5.3 LE-7A nozzle side loads.** The nozzle-extension **side-load problem at
start-up** damaged gimbal actuators; the LE-7A's redesigned nozzle was
specifically to fix it. Start-transient side loads deserve their own section in
module 09, and the LE-7A is the best-documented case.

**A.5.4 What is not published.** LE-7A sea-level Isp; LE-5B expansion ratio and
mixture ratio; LE-9 sea-level thrust, injector and turbopump detail. Do not fill
these in.

---

## A.6 Soviet and Russian engines

**Note on Russian chamber-pressure conventions.** Soviet and Russian sources
conventionally quote chamber pressure at the **nozzle stagnation** condition,
whereas US sources of the Apollo era quote **injector-end** pressure, which is
typically a few percent higher. Every Pc in this table is therefore flagged
`noz`†. When comparing an RD-180 to an RS-25 the text must say which convention
each number follows, or the comparison is not quite honest.

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | turbopump | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **RD-107A** | OKB-456 / NPO Energomash (Glushko) / USSR–Russia | 1954–57; **first flight 1957-05-15**; RD-107A/108A modernisation 1993–2001, crewed service 2002-10. **Still in production** | R-7; Sputnik, Vostok, Voskhod, Molniya, Soyuz, **Soyuz-2** — four strap-on boosters | LOX / **RG-1** (Russian refined kerosene) | ~2.4 — *not published in the source; low conf.* | **GG of the monopropellant steam type** — H₂O₂ catalytically decomposed drives a steam turbine, exactly as on the V-2 and Redstone. The R-7 still flies a 1940s power cycle in 2026. LN₂ for tank pressurisation | **839** (189,000 lbf) | **1,020** (230,000 lbf) | **60** `noz`† (6 MPa, 870 psia) | **263.3** | **320.2** | **not published** | **1,190** (2,620 lb) for the whole **four-chamber assembly** | ≈**72:1** SL `CALC` | regen, kerosene-cooled brazed chamber | impinging/swirl coaxial, Glushko practice | **pyrotechnic** originally; **chemical (hypergolic) ignition** on the RD-107A/108A | **single shaft**, one steam turbine driving both pumps. **Architecture: four main chambers per turbopump + 2 vernier chambers** (RD-107). Diameter 1,850 mm | med-high [B]; **n.p.** on ε and O/F |
| **RD-108A** | NPO Energomash / USSR–Russia | as above | R-7 family **central core** | LOX / RG-1 | ~2.4 | as RD-107A | **792.4** (178,140 lbf) | **921.9** (207,240 lbf) | 60 `noz`† | **257.7** | **320.6** | n.p. | n.p. | n.p. | regen | impinging/swirl coaxial | pyrotechnic → chemical | single shaft; **four main chambers + 4 verniers** (the core needs full three-axis control, the strap-ons do not). Diameter 1,950 mm. Lower thrust than the RD-107 because it is optimised to keep burning after booster separation | med-high [B] |
| **RD-253** | OKB-456 / NPO Energomash (Glushko) / USSR | 1961–63; **first flight 1965-07** | Proton stage 1 — **6 engines** | **N₂O₄ / UDMH** | **2.67** | **Oxidizer-rich staged combustion — the first ORSC engine ever flown**, and the origin point of the tradition leading to RD-170, RD-180, YF-100 and BE-4 | **1,470** (330,000 lbf) | **1,630** | **147** `noz`† (14.7 MPa, 2,130 psia) — in **1963**; American engines did not reach that Pc until the SSME fifteen years later | **285** | **316** | **26.2:1** | ~**1,070–1,080** | **156.2:1** — the direct payoff of ORSC: the ox-rich preburner lets the turbine run on dense cool gas at high mass flow, so the turbomachinery is small for the power | regen, fuel-cooled | coaxial | hypergolic, no igniter | single shaft, ox-rich preburner-driven. Gimbal 7.5° in a single plane; on Proton the six engines gimbal tangentially, giving three-axis control from single-plane actuators | high [A] on the variant table; **med** on cooling/injector (standard-practice inference) |
| **RD-275** | NPO Energomash / Russia | 1987–93; maiden flight **1995** | Proton stage 1 | N₂O₄ / UDMH | 2.67 | ORSC | **1,590** | **1,750** | **157** `noz`† (2,280 psia) | **287** | **316** | 26.2:1 | ~1,070–1,080 | — | regen | coaxial | hypergolic | single shaft | high [A] |
| **RD-275M** | NPO Energomash / Russia | 2001–05; first launch **2007-07-07**; retired with Proton (final flights 2025) | Proton stage 1 | N₂O₄ / UDMH | 2.67 | ORSC | **1,671** (376,000 lbf) | **1,832** | **165** `noz`† (2,390 psia) | **288** | **315.8** | 26.2:1 | ~1,070–1,080 | — | regen | coaxial | hypergolic | single shaft | high [A] |
| **RD-170 / RD-171 / RD-171M** | NPO Energomash (Glushko) / USSR–Russia | from 1976; **RD-170 first flight 1985-04-13** (Energia), last 1988-11-15; RD-171 for Zenit; RD-171M finalised 2006; **RD-171MV** test article 2019, tested successfully 2021-09 for Soyuz-5/Irtysh | Energia strap-ons (RD-170); Zenit stage 1 (RD-171); Soyuz-5/Irtysh (RD-171MV) | LOX / RG-1 | **2.63** | **ORSC with four combustion chambers fed by a single turbopump** — the Glushko architecture at its limit | **7,250** (1,630,000 lbf) — **the highest-thrust liquid rocket engine ever flown**, but across four chambers; see the records note | **7,900** (1,777,000 lbf) | **245.2** `noz`† (24.52 MPa, 3,556 psia) | **309** | **337** | **36.87:1** | **9,750** | **82:1** SL (as published) | regen, kerosene-cooled | coaxial swirl | chemical (hypergolic starter fluid) | single turbopump for four chambers; **power contested 170 vs 192 MW**, see A.6.1. **RD-170's nozzles gimbal on two axes; the RD-171's on one** — that is the whole difference | high [A]; **contested** on turbopump power; RD-171/171M/171MV performance **not separately published** |
| **RD-180** | NPO Energomash, Khimki / Russia (marketed in the US by RD AMROSS) | early–mid 1990s, derived by **halving the RD-170**; **first flight 2000-05-24** (Atlas III); deliveries ended 2021 | Atlas III and Atlas V stage 1 — 1 engine | LOX / RP-1 | **2.72** (73% O₂ / 27% RP-1) | **ORSC**, single ox-rich preburner, **two chambers on one turbopump** | **3,830** (860,000 lbf) | **4,150** (930,000 lbf) | **267** `noz`† (26.7 MPa, 3,870 psia) — the highest Pc of any engine in regular service before Raptor | **311** | **338** | **36.87:1** — identical to the RD-170; the chambers are the same part | **5,480** (12,080 lb) | **78.44:1** | regen, kerosene-cooled. **The key materials point: an inert enamel coating on every metal surface in contact with the hot oxygen-rich gas.** This single technology is what makes ORSC survivable and why the West could not simply copy the cycle | coaxial swirl | chemical / hypergolic starter | single shaft, single ox-rich preburner. Power and rpm **n.p.** (the RD-170's ~170–190 MW scales to roughly half). Mass flow **1,250 kg/s**, burn 270 s, throttle **47–100%** | high [A]; **n.p.** on turbopump power |
| **RD-191** | NPO Energomash / Russia | design completed 2001; **first flight 2014-07** (Angara 1.2PP). In production | **Angara** family; **RD-151** (de-rated, KSLV-1); **RD-181** (Antares 230/230+); RD-193 proposed | LOX / RP-1 | **2.6** | ORSC, **single chamber** | **1,920** (430,000 lbf) at 100% | **2,090** (470,000 lbf) | **258** `noz`† (25.8 MPa, 3,740 psia) | **310.7** | **337** | **37:1** | **2,290** (5,050 lb) | **89:1** | regenerative | coaxial swirl | chemical | single shaft, ox-rich preburner; speeds **n.p.** Throttle **27–105%** — exceptionally wide for staged combustion. Gimbal to **8°**. The engine also **heats tank pressurisation gas and generates hydraulic power for vehicle control**, so it cannot be traded independently of the stage | high [A]; **n.p.** on turbopump detail |
| **Kuznetsov NK-33** (AJ26-58/-62; NK-33A) | **Kuznetsov Design Bureau (OKB-276)**, Samara / USSR–Russia — *not* Glushko/Energomash; an **aircraft-engine bureau**, brought in after Korolev and Glushko fell out over propellant choice | NK-15 for N1 (all four launches failed 1969–72); NK-33 late 1960s–early 70s; ~150 engines hidden after the 1974 cancellation; **first successful flight 2013-04-21** on Antares — **forty years after manufacture**; supply exhausted early 2025 | N1 (NK-15); **Antares 110/120/130** (as AJ26-62); Soyuz-2.1v (NK-33A) | LOX / RP-1 | ~2.6 — *not published; low conf.* | **Oxidizer-rich closed staged combustion** | **1,510** (340,000 lbf) | **1,680** (380,000 lbf) | **148.3** `noz`† (14.83 MPa, 2,151 psia) | **297** | **331** | **not published** | **1,240** (2,730 lb) | **137:1** — for decades the highest of any booster engine; the number that made Western engineers disbelieve the engine was real in 1993 | regen, kerosene-cooled | coaxial | chemical | requires **subcooled LOX for bearing cooling** — the bearings run in the LOX flow, which constrains ground operations. Throttle **50–105%** | med-high [B]; **n.p.** on ε and O/F |
| **KBKhA RD-0120 (11D122)** | KB Khimavtomatiki, Voronezh / USSR | from 1976; **first flight 1987-05-15** (Energia/Polyus); **last flight 1988-11-15** (Energia/Buran). **Only two flights** | Energia core stage — 4 engines | LOX / LH2 | **6.0** | **Fuel-rich staged combustion with a single-shaft turbopump driving both pumps** — structurally simpler than the RS-25's dual-shaft, dual-preburner arrangement | **1,526** (343,000 lbf) | **1,961.3** (440,900 lbf) at 106% | **219** `noz`† (21.9 MPa, 3,180 psia) | **354** | **455** | **85.7:1** | **3,450** (7,610 lb) | **57.93:1** (vac at 106%) | regen, hydrogen-cooled | coaxial | torch | single shaft. Burn nominal 480–500 s; **certified for 1,670 s** | med-high [B] — see A.6.2 |
| **KBKhA RD-0146 / RD-0146D** | KB Khimavtomatiki, Voronezh, with P&W collaboration in the early 2000s / Russia | concept 1988 (RO-95); project start 1999; **first test firing 2001-10-09**; RD-0146D still in development as of 2022 for KVTK. **Never flown** | proposed: Proton, Angara (KVTK), Onega, Rus-M | LOX / LH2 | **n.p.** | **Closed expander** — turbopumps driven by waste heat absorbed in the nozzle and chamber. **The first Russian expander engine**, with **no preburner and no gas generator at all** | — | **68.6** (15,400 lbf) | **59** `noz`† (5.9 MPa, 860 psia) | — | **470** — **if correct, the highest Isp ever demonstrated by a chemical rocket engine**, above the RL10B-2's flown 465.5 s. **Test-stand figure for an engine that has never flown; see A.6.3** | **not published**; the nozzle extension is **uncooled** | **n.p.** | n.p. | regen; the jacket is the power cycle | **n.p.** | **n.p.** | **separate fuel and oxidiser turbopumps**, with the **fuel turbopump running at over 120,000 rpm** — the highest published turbopump speed of any rocket engine. Capable of **five firings**, thrust control in two planes | med [C] on F/Pc/rpm; **low [D]** on the 470 s Isp |

### Notes and contested figures — A.6

**A.6.1 RD-170 turbopump power: 170 MW vs 192 MW.** Wikipedia's article body says
~170 MW; its specification table says 192 MW — a 13% disagreement inside a single
article. Print "**approximately 170–190 MW**" and note that it is the most
powerful rocket turbopump ever built either way, by a factor of about three over
the RS-25's HPFTP. Do not pick one to two significant figures.

**A.6.2 RD-0120 vs RS-25 — the comparison to make, with its caveat.** The RD-0120
achieved **slightly higher Isp (455 vs 452.3 s) and higher chamber pressure (219
vs 206 bar) with lower complexity and cost — but it was expendable**, whereas the
RS-25 was designed for 55 reuses. It also **achieved combustion stability without
the acoustic resonance cavities the RS-25 requires**, which is a real and specific
design difference, not just a claim. **Caveat:** the comparative claims about
resonance cavities and cost come from the same single source and should be
corroborated before being printed as fact.

**A.6.3 The RD-0146's 470 s — the highest Isp ever, but never flown.** It exceeds
the RL10B-2's flown 465.5 s. Keep flown and unflown engines in separate tables, or
mark unflown engines unmistakably; otherwise the book appears to claim a record
that has not been demonstrated in flight. The same applies to the F-1A's 1,800,000
lbf and the J-2S's 436 s.

**A.6.4 "Highest thrust engine" — RD-170 vs F-1.** The RD-170 produces more total
thrust (7,900 kN vac) than the F-1 (7,770 kN vac), but across **four combustion
chambers**. The F-1 remains the highest-thrust **single-chamber** engine ever
flown. Both records are real and the text must state which one it means every
single time, or it will be wrong in one direction or the other.

**A.6.5 The Glushko multi-chamber architecture.** Four (or two) chambers per
turbopump was adopted because Glushko could not solve combustion instability in a
single large chamber. It became the defining Soviet layout, running from RD-107
through RD-253 to RD-170, and the RD-170 family is uniquely *modular* — four
chambers (RD-170) → two (RD-180) → one (RD-191) from a single chamber design.
The cost is that one turbopump failure loses all thrust.

**A.6.6 Counting chambers, not engines.** The R-7 is often described as having
"32 nozzles" at liftoff. That is chambers: four RD-107s (4 main + 2 vernier each)
plus one RD-108 (4 main + 4 vernier). Always say whether a count is engines,
chambers, or nozzles.

---

## A.7 Chinese engines

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | turbopump | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **AALPT YF-100** | Academy of Aerospace Liquid Propulsion Technology (AALPT / Xi'an), CASC / China | began early 2000s, drawing on RD-120 technology transferred in the 1990s; first 300-second test 2007-11; **first flight 2015-09-20** (Long March 6). In service | LM-5 boosters, LM-6, LM-7, LM-8; **YF-100K** uprated (LM-12, LM-10); **YF-100M** vacuum-optimised (LM-10 stage 2); **YF-100GBI** with dual roll-control nozzles (LM-6) | LOX / RP-1 | **2.6, adjustable ±10%** | **Oxidizer-rich staged combustion.** China is the fourth entity to fly ORSC — after the USSR/Russia, and **ahead of the US** (BE-4, 2024) | **1,200** (270,000 lbf) | **1,340** (300,000 lbf) | **180** `noz`† (18 MPa, 2,600 psia) | **300** | **335** | **35:1** | **Not published.** T/W is widely rumoured at ~78–80 but is not sourced — **do not print a figure** | **n.p.** | regen, kerosene-cooled | coaxial | chemical | **single shaft**: a **single-stage oxygen pump** and a **two-stage kerosene pump** on one shaft, ox-rich preburner-driven. Throttle **65–105%**; burn ~155 s (estimated); diameter 1.338 m | med-high [B]; **n.p.** on dry mass and T/W |
| **BAPI YF-75** | Beijing Aerospace Propulsion Institute (BAPI / AALPT Beijing), CASC / China | development began 1986; **first flight 1994-02-08** (Long March 3A) | LM-3A/3B/3C third stage — 2 engines | LOX / LH2 | **5.1, adjustable** | **Gas generator** | — | **78.45** (17,640 lbf) | **37.6** `noz`† (3.76 MPa, 545 psia) | — | **438** | **80:1** | **550** — *high for the thrust (≈14.5:1 T/W), which suggests the figure may cover the two-engine assembly. Med conf.* | ≈14.5:1 as published — see left | **split — regen in the chamber, dump cooling in the nozzle.** Dump cooling (routing coolant through the nozzle and expelling it) is rare enough that the YF-75 is one of the few good flown examples | coaxial | spark/torch | **single-shaft hydrogen turbopump at 42,000 rpm**; burn 470 s | med [C] |
| **BAPI YF-75D** | BAPI, CASC / China | development from ~2006 for Long March 5 | Long March 5 second stage — 2 engines | LOX / LH2 | **n.p.** | **Closed expander cycle, "like the RL10"** — a change of cycle from the YF-75 despite the shared designation; they share a name and not a design | — | commonly quoted **88.36 kN** — **not confirmed in the source fetched; treat as unverified** | **not published** | — | commonly quoted **~442 s** — **unverified** | **n.p.** | **n.p.** | n.p. | n.p. | **n.p.** | **n.p.** | **n.p.** | **low [D]** — performance figures not confirmed |

### Notes — A.7

**A.7.1 YF-75 → YF-75D is a cycle change, not an uprate.** GG upper stage first,
closed expander second — the same trajectory Japan (LE-5 → LE-5A) and Europe
(HM7B → Vinci) followed. Flag the shared designation as a trap.

**A.7.2 Open verification action.** YF-75D thrust and Isp are unconfirmed; find a
Chinese primary source or a credible translation before tabulating them in a
module.

**A.7.3 YF-100 in context.** Chamber pressure and Isp trail the RD-180 by a clear
margin; it is a capable second-generation ORSC engine, not a frontier one. It
underpins China's entire current launch fleet and the crewed lunar programme
(Long March 10).

---

## A.8 In-space and spacecraft engines

Draco and SuperDraco are spacecraft engines but are tabulated in §A.3 with the
rest of SpaceX; cross-reference them from here.

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | feed system | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Aerojet AJ10-137 — Apollo SPS** | Aerojet-General / USA; contract 1962-04 | 1962–66; **first flight 1966** (AS-201/AS-202); crewed from Apollo 7 (1968); retired 1975 (ASTP) | Apollo Service Module | **N₂O₄ / Aerozine 50** | **1.6** *(Apollo documentation; not stated in the sources fetched — med conf.)* | **Pressure-fed** — **39.2 ft³ (1.11 m³) of gaseous helium at 3,600 psi (25 MPa)** in two tanks, regulated down | — | **91.19** (20,500 lbf) | **~6.9** `inj` (~100 psia) *(Apollo-era documentation; **not stated in the sources fetched — low conf., verify before printing**)* | — | **314.5** | **62.5:1** *(Apollo documentation; **not confirmed — verify**)*. The **sourced** dimensions are more useful: nozzle **152.82 in (3.882 m) long, exit 98.48 in (2.501 m)** | **~294** (650 lb) *(unverified — flag)* | n.p. | **ablative chamber with a radiatively cooled niobium/titanium extension** *(standard Apollo description; not confirmed in the sources fetched)* | **unlike-impinging doublet**, deliberately conservative and **unbaffled** — designed for absolute reliability, not performance | hypergolic. **No igniter, no turbopump, no valve that must move more than once.** Redundant series-parallel valve trains throughout | pressure-fed helium; burn **750 s max**, multiple restarts; two-axis gimbal | **med [C]** on F/Isp/propellants/burn time/pressurisation/nozzle dimensions; **LOW [D]** on Pc, ε, dry mass and cooling — see A.8.1 |
| **TRW LMDE (Descent Propulsion System)** | TRW Systems, Redondo Beach CA / USA | 1964–72; Apollo 5 (1968) unmanned, Apollo 9 (1969) crewed | Apollo Lunar Module descent stage | **N₂O₄ / Aerozine 50** | **1.6** | **Pressure-fed** using **supercritical (cryogenic) liquid helium** — stored cold and dense to save tank mass, then warmed to pressurise | — | **46.7 max** (10,500 lbf); **throttleable 4.67–30.36** (1,050–6,825 lbf), i.e. **10–60%**. **The 60–100% band was prohibited in operation** because of nozzle erosion — the engine ran at full thrust or in the throttle band, never between. This detail is frequently omitted and should not be | **7.6** `inj` (110 psia) at 100%; **0.76** (11 psia) at 10% — a **10:1 chamber-pressure turndown**, the best illustration in the file of what deep throttling demands of an injector | — | **311** at full thrust; **285** at 10% | **47.5:1** (Apollo 14 and earlier); **53.6:1** (Apollo 15 and later) — the extended nozzle for the J-mission landers, long enough that it crushed on landing | **179** (394 lb) | ≈27:1 `CALC` | **ablative chamber** with a radiatively cooled skirt | **Variable-area pintle injector**, invented by **Gerard W. Elverum Jr.** at TRW. A movable pintle sleeve varies injection area with flow, holding injection velocity and mixing quality roughly constant across a 10:1 throttle range. **This is why deep throttling was possible**, and the direct ancestor of the Merlin and (by reputation) SuperDraco injectors | hypergolic | pressure-fed; **restarts demonstrated up to four** | **high [A]** — one of the best-documented blocks in the file |
| **Bell / Rocketdyne LM Ascent Engine (APS)** | **Bell Aerosystems** (engine) with the **injector supplied by Rocketdyne** after Bell could not solve combustion instability / USA | 1964–72; Apollo 5 through Apollo 17 | Apollo Lunar Module ascent stage | **N₂O₄ / Aerozine 50** | **1.6** | **Pressure-fed** (helium). **Fixed thrust, non-gimballed, single chamber** | — | **15.6** (3,500 lbf) | **8.3** `inj` (120 psia) | — | **311** | **45.6:1** (the source gives 46:1) | **94.8** (209.1 lb) | ≈16.7:1 `CALC` | ablative | Rocketdyne **baffled impinging** design | hypergolic — **no igniter, no pumps, no gimbal, and no backup** | pressure-fed; burn **200 s max**, designed for **one restart** | **high [A]** |
| **Aerojet AJ10-190 — Shuttle OMS** | Aerojet / USA; directly derived from the Apollo SPS | 1970s; **STS-1 1981-04-12**; retired 2011; **refurbished units repurposed for the Orion European Service Module** | Shuttle orbiter — **2 engines, one per OMS pod** | **N₂O₄ / MMH** (note: MMH, not the SPS's Aerozine 50) | **1.65** | **Pressure-fed** (helium) | — | **26.7** (6,000 lbf) | **8.6** `inj` (125 psia) | — | **316** | **55:1** | **118** (260 lb) | ≈23:1 `CALC` | regeneratively (fuel) cooled chamber with a radiatively cooled niobium extension *(standard description; **not confirmed in the sources fetched**)* | impinging doublet | hypergolic | pressure-fed. **Life: reusable for 100 missions; 1,000 starts and 15 hours cumulative burn time** — the only reusable member of the AJ10 family and one of very few reusable rocket engines of any kind | med-high [B] on F/Pc/Isp/ε/mass/O/F/life; **low** on cooling |
| **Marquardt R-40 / R-40A** | The Marquardt Company, Van Nuys CA (→ Kaiser Marquardt → Aerojet) / USA | 1970s; **STS-1 1981-04-12**; retired 2011 | Shuttle orbiter RCS — **38 primary R-40** (14 fwd, 12 per aft pod) **plus 6 vernier R-1E** (24 lbf class) | **N₂O₄ / MMH** | ~1.6 *(not published in the sources fetched)* | Pressure-fed | — | **3.87** (870 lbf) nominal | **10.5** `inj` (152 psia) | — | **280 at ε = 22:1** per NASA N91-28200; **289 s is also widely quoted** — see A.8.2 | **22:1** | **not published** in the sources fetched | n.p. | **fuel-film cooled** with a **radiatively cooled niobium (columbium) nozzle**, silicide-coated | unlike-impinging doublet with a film-cooling ring | hypergolic; **pulse-mode capable down to very short minimum impulse bits** | pressure-fed | med [C] |
| **Marquardt R-4D** | Marquardt → Kaiser Marquardt → **Aerojet Rocketdyne** / USA | early 1960s for Apollo; **still in production in derivative form after sixty years** | Apollo SM RCS (16, four quads), Apollo LM RCS (16), and since then a very wide range of satellites. Variants **R-4D-11, R-4D-15**, and **HiPAT** (~445 N at ~322 s) | **NTO / MMH** (Apollo-era units used NTO / Aerozine 50 or MMH depending on application) | **not published** | Pressure-fed | — | **0.490** (110 lbf) | **6.93** `inj` (100.5 psia) | — | **312** classic; **~322** for rhenium-chamber variants | **Not published** in the source. Commonly cited near 40:1–60:1 depending on variant — **do not print a number** | **3.6** (8 lb); length 300 mm, diameter 150 mm | n.p. | **fuel-film cooling** (fuel injected longitudinally down the wall) plus radiative cooling of chamber and nozzle. **Liner history in one line: molybdenum alloy → niobium (columbium) with silicide coating → iridium-lined rhenium.** The Ir/Re change raised allowable wall temperature enough to cut the film-cooling fraction and buy ~10 s of Isp | unlike-impinging doublet with film-cooling orifices | hypergolic, no igniter | pressure-fed. **Life: up to one hour continuous, 40,000 s total accumulated, 20,000 individual firings** | med-high [B]; **n.p.** on ε and O/F |

### Notes and contested figures — A.8

**A.8.1 Apollo SPS — four figures are unsourced.** Chamber pressure (~100 psia),
expansion ratio (62.5:1), dry mass (~294 kg) and the cooling description are from
memory of Apollo documentation and were **not** confirmed by any fetched source.
**Verify against the Apollo CSM News Reference or NASA SP-4009 before
publication.** Until then, prefer the *sourced* nozzle dimensions (3.882 m long,
2.501 m exit) to the unsourced area ratio — they are more useful anyway.

**A.8.2 Shuttle RCS R-40 Isp: 280 s vs 289 s.** NASA N91-28200 gives **280 s at a
22:1 area ratio**; 289 s is widely quoted elsewhere, almost certainly a different
nozzle configuration or a theoretical-versus-delivered distinction. **Use 280 s
and cite the NASA document.** **Open action: re-read N91-28200 directly to confirm
the figure** — it currently comes from a search summary.

**A.8.3 The SPS was over-powered for the job it did.** It was originally sized to
lift the whole spacecraft off the Moon under the **direct-ascent** mission mode;
lunar-orbit rendezvous made it an orbital manoeuvring engine instead. It performed
**every** lunar orbit insertion and trans-Earth injection without a failure. It is
the canonical example of designing for single-string criticality by *removing
mechanisms* rather than adding redundancy.

**A.8.4 The LM ascent engine had no redundancy and no abort mode.** The only
engine in history on which human survival depended with neither. It worked every
time. Bell's combustion instability problem was severe enough to require a
competitor's injector — a good illustration that hypergolic propellants do not
make an engine automatically stable. Redesignated **RS-18** when reconfigured for
LOX/methane testing in 2008 under Constellation: the same hardware, sixty years on.

**A.8.5 LMDE on Apollo 13.** It performed the mid-course corrections and the
free-return burn that brought the crew home — an application it was never designed
for.

---

## A.9 Historical oddities

| engine | maker / country | years | vehicle | propellants | O/F | cycle | F_SL kN | F_vac kN | Pc bar | Isp_SL s | Isp_vac s | ε | dry kg | T/W | cooling | injector | ignition | turbopump | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Reaction Motors XLR99** | Reaction Motors Inc. (later Thiokol Reaction Motors) / USA | from 1956; first X-15 flight **1960-11-15**; programme to 1968 | **North American X-15** (and X-15A-2) — an aircraft, not a launch vehicle | **anhydrous liquid ammonia (LNH₃) / LOX** — chosen for a clean, non-sooting, restartable engine in a piloted aircraft | ~1.25 *(not published; low conf.)* | GG — but the turbopump is driven by **HTP decomposed over a catalyst**, i.e. a monopropellant steam drive, like the V-2 and Redstone | **250** (57,000 lbf) max | — | **41.4** `n.s.` (600 psia) | **239** | **279** | **not published**; nozzle exit 39.3 in (998 mm) | **413** (910 lb); length 82 in (2,083 mm) | **62:1** | regenerative (ammonia) | impinging | spark/igniter with a controlled start sequence | HTP catalytic steam drive. **Throttle 50–100%, continuously variable by the pilot with a throttle lever. In-flight shutdown and restart** — required, since the X-15 was air-launched and the pilot managed the energy profile manually. Chamber temp 4,982 °F (3,023 K); flow >10,000 lb/min (4,500 kg/min); burn ~83 s (basic X-15), >150 s (X-15A-2 with external tanks) | med-high [B]; **n.p.** on ε and O/F |
| **Bristol Siddeley Gamma 201** | Armstrong Siddeley → Bristol Siddeley → Rolls-Royce / UK | 1955–57 | **Black Knight** | **85% HTP / kerosene (RP-1)** | **8:1** — the very high O/F is characteristic of HTP, which is mostly oxygen and water by mass | GG; **HTP decomposed over a silver-plated nickel-gauze catalyst pack** to 600 °C steam and oxygen, then kerosene injected into that stream ignites spontaneously. **There is no igniter and no hypergolic slug — the catalyst pack *is* the ignition system** | **73** (16,400 lbf); **4 chambers, gimballed in opposed pairs** | — | **n.p.** | n.p. | **n.p.** | **not published** | **not published** | n.p. | regenerative (kerosene) | kerosene injected downstream of the catalyst pack into decomposed HTP — an architecture with no direct parallel in any other flown engine family | catalytic; none required | — | med-high [B] on architecture |
| **Bristol Siddeley Gamma 301** | as above / UK | later Black Knight and Black Arrow development | Black Knight | 85% HTP / kerosene | 8:1 | as above; **4 chambers** | **76–96** (17,000–21,600 lbf) | — | **n.p.** | n.p. | **250** | n.p. | n.p. | n.p. | regenerative | as above | catalytic | burn 120 s | med-high [B] |
| **Bristol Siddeley Gamma 8** | as above / UK | Black Arrow first flight 1969; **Prospero orbited 1971-10-28** — after the programme had been cancelled | **Black Arrow first stage** | 85% HTP / kerosene | 8:1 | as above; **8 chambers, in pairs on tangential gimbals** | **234.8** (52,785 lbf) — **CONTESTED, see A.9.1** | — | **47.4** `n.s.` (687 psia) | **251** | **265** | **not published** | **not published** | n.p. | regenerative | as above | catalytic | burn 125 s | med-high [B] on architecture; **med** on thrust |
| **Bristol Siddeley Gamma 2** | as above / UK | Black Arrow | **Black Arrow second stage** | 85% HTP / kerosene | 8:1 | as above; **2 chambers with extended nozzles** | **64.6** (14,520 lbf) | **68.2** (15,300 lbf) | **n.p.** | n.p. | **n.p.** | **not published** | **not published** | n.p. | regenerative | as above | catalytic | burn 113 s | med-high [B] |
| **Rocketdyne AR2-3** | Rocketdyne / USA | designed and first run in the late 1950s; **refurbished and re-tested in 1999** for the Future-X Demonstrator Engine project (Boeing X-37 Reusable Upper Stage) | **Aircraft, not launch vehicles** — North American **F-86F(R)** (M1.22 at 60,000 ft), **FJ-4**, and the **Lockheed NF-104A** aerospace trainer | **90% HTP / JP-4 or JP-5 jet fuel** — using the aircraft's own fuel as the rocket fuel is the entire point | ~7.5 *(not published; inferred from HTP practice — low conf.)* | GG, pump-fed; HTP decomposed over a catalyst drives the turbopump | **29.34** (6,600 lbf) mainstage, **variable down to 14.7** (3,300 lbf) = **50–100% throttle** on a single lever. Some sources give the family range as 13.3–26.7 kN (3,000–6,000 lbf); 6,600 lbf is the AR2-3 as tested in 1999 | — | **38.6** `n.s.` (560 psia) | **245** (condition not distinguished in the source) | — | **not published** | **not published** | n.p. | regenerative *(not directly confirmed)* | — | **catalytic** — HTP over the pack, then JP-4 injected. No igniter | **Throttle mechanism: a single lever regulating oxidiser flow to the turbopump gas generator**, changing turbopump speed and hence propellant flow — throttling by turbopump speed rather than by injector area, the opposite approach to the LMDE's variable-area pintle. Chamber temp 4,600 °F (2,538 °C) | med [C]; **n.p.** on ε, mass and O/F |

### Notes and contested figures — A.9

**A.9.1 Gamma 8 thrust: 234.8 kN vs 222.4 kN.** Wikipedia gives **52,785 lbf
(234.8 kN)**; Encyclopedia Astronautica gives **222.4 kN (49,998 lbf)** — a 5%
spread. The Astronautix figure looks like a rounded 50,000 lbf design value.
**Use 234.8 kN and note the alternative.**

**A.9.2 The Gamma reliability record.** **128 Gamma engines flew across 26 launches
with zero failures.** Black Arrow made the UK the sixth nation to orbit a satellite
on its own launcher, and the only nation ever to develop that capability and then
abandon it.

**A.9.3 Why HTP deserves its own section.** HTP/kerosene is storable, its exhaust
is steam and CO₂, and the engine self-ignites — properties nothing else in this
file combines. The price is poor Isp (245–265 s), decomposition in storage, and a
demand for scrupulous cleanliness, since any contaminant is a catalyst.

**A.9.4 XLR99's operational philosophy.** The first man-rated, throttleable,
restartable large liquid rocket engine. Pilot-commanded throttle, in-flight
restart, ground-checkout turnaround — the direct ancestor of every reusable-engine
programme since, and it predates them by fifty years.

**A.9.5 Two opposite throttling architectures, side by side.** LMDE throttles by
**varying injector area** (variable-area pintle); AR2-3 throttles by **varying
turbopump speed** (a single lever on the GG oxidiser flow). Draw the contrast
explicitly in module 07 and module 12.

---

# Part B — Solid rocket motors

**Every thrust figure carries an explicit `/motor` or `/vehicle` suffix and a
`max` or `avg` tag. No exceptions, including for single-motor vehicles where it
looks redundant.** More than half the disagreements found in the verification pass
were not real disagreements — they were per-motor versus per-vehicle confusions,
or maximum versus average thrust quoted without the qualifier. Titan IV and
Ariane 5 are the worst offenders. If a number in a module is not tagged this way,
it is not finished.

**Defense motors (§B.7) are recorded strictly at architecture level**, per the
course scope boundary: stage count, propellant *family* name, case material
*family*, nozzle *concept*, and only those thrust/Isp/mass figures that appear in
open, citable, unclassified sources. No formulations beyond NASA fact-sheet level,
no processing, no weapon-component dimensions. Those entries are deliberately
shorter than the civil-launcher entries; that is the intended outcome, not a gap
to be filled later.

**Do-not-print flags** are carried in the notes under each table and collected in
§B.9. Where the worksheet says `NEEDS PRIMARY`, it means the entry is not yet fit
to quote in a module.

## B.1 Large segmented boosters

| motor | maker / country | years | vehicle | propellant family | grain | case (material, segments) | nozzle (material, ε, TVC) | F_max kN | F_avg kN | Pc max/avg bar | Isp SL / vac s | burn s | propellant kg | total kg | mass fraction | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Space Shuttle SRB / RSRM** | Morton Thiokol → Thiokol → ATK → Northrop Grumman, Brigham City / Promontory UT / USA | SRM **STS-1 1981-04-12**; RSRM (post-Challenger) **STS-26 1988-09-29**; last **STS-135 2011-07-08** | Space Shuttle, **2 per stack** | **PBAN-bound AP/Al composite (APCP)**. Published composition **AP 69.6%, Al 16%, Fe₂O₃ 0.4%, PBAN 12.04%, epoxy curing agent 1.96%** by mass (**A**); competing figure AP 69.8 / Fe₂O₃ 0.2 (**C**) — see B.1.1 | **Forward segment: 11-point star** perforation. **Aft segments: double-truncated-cone** perforation. The star tailors the head-end regressive-then-neutral trace that limits max-Q loads (**A**) | **D6AC high-strength low-alloy steel**, ~**12.7 mm (0.5 in)** nominal membrane wall (one source says ~2 cm — see B.1.2). **Segmented: 11 casting segments assembled into 4 flight segments joined by 3 field joints**; factory joints inside each flight segment (**B**) | carbon-phenolic and silica-phenolic ablative liners on a steel/composite shell; **submerged, flexible-bearing (flexseal) gimbal**. **ε 7.72 initial, 7.16 on later motors** (**C**) — both are real, the nozzle changed. **TVC ±8° pitch and yaw**, two hydraulic actuators fed by two hydrazine APU/HPUs per booster (**B**) | **≈ 14,700** (3,300,000 lbf) `/motor` `max` SL, at about t+20 s (**B**); **≈ 12,500** (2,800,000 lbf) `/motor` at liftoff | not separately published | **≈ 62.5 avg** (906.8 psi) nominal; **peak ~64** (**B**) | **242 SL / 268 vac** (**B**) | **≈ 123–124** (action time to 50 psi) (**A**) | **≈ 500,000** (1,100,000 lb) (**B**) | **≈ 590,000** gross (1,300,000 lb); **≈ 91,000** inert (200,000 lb) (**B**) | **≈ 0.85** `CALC` | **B** overall |
| **SLS five-segment booster (RSRMV)** | Northrop Grumman, Promontory UT / USA | DM-1 static test 2009; **first flight Artemis I 2022-11-16** | SLS Block 1 / 1B, **2 per vehicle** | **PBAN-bound AP/Al — unchanged from Shuttle** (**A**) | not published separately; the fifth segment is added propellant, not new chemistry | **Steel — refurbished Shuttle-era D6AC case segments**, planned for the first eight SLS flights. **5 segments** (**A**). Length 177 ft (53.9 m), diameter 12 ft (3.71 m) (**A**) | **new nozzle design** vs RSRM; **gimballed nozzle, hydraulic** (Shuttle-heritage TVC) (**B**). ε not published | **≈ 16,000** (3,600,000 lbf) `/motor` — **NASA's page does not say max or avg; treat as `max`** (**A**) | not published | not published | **not published on the NASA reference page**; ~269 s vac commonly quoted (**C**) | **126** (**A**) — see B.1.3 | **not published on the NASA reference page**; ≈ 635,000 kg (1.4 million lb) is the widely repeated figure (**C**) | **≈ 726,000** (1.6 million lb) gross (**A**) | not computable from published figures | **A** on the NASA-page figures; **C** on Isp and propellant mass |
| **SLS BOLE booster** — **IN DEVELOPMENT; ALL FIGURES ARE CONTRACTOR CLAIMS** | Northrop Grumman / USA | **DM-1 full-scale static test 2025-06-26. Not flown** (**A**) | intended: SLS Block 2, from the ninth SLS flight, when Shuttle-heritage steel cases run out (**B**) | **HTPB**-bound AP/Al, replacing PBAN (**B**) | not published | **Carbon-fibre composite**, replacing refurbished steel. DM-1 cases used **IM7/T300** fibre; DM-2 onward planned in **T1100**. **5 segments** (**B**) | **Electric** thrust vector control, replacing hydraulic (**B**) | DM-1 test: **"more than 4 million pounds of thrust"** (≈17,800 kN) `/motor` `max` — **claim**; **an anomaly was observed near the end of the burn (nozzle)** (**B**) | — | — | — | DM-1 burn "just over two minutes"; 156 ft motor (**B**) | — | — | — | **B (claim)** |
| **Ariane 5 EAP — P230 / P238 / P241** | Europropulsion (SNPE/Regulus casting; Aérospatiale/EADS cases) / France–Italy (ESA) | 1996–2023 | Ariane 5, **2 per vehicle** (**A**) | **HTPB-bound AP/Al**; ESA-published composition **AP 68%, Al 18%, HTPB 14%** (**B**) | cast in three segments; **forward segment star-shaped, aft segments cylindrical bore** (**C**) | **Steel**, segmented, **3 segments bolted together** (**A**). Length/diameter **31.6 m × 3.06 m** (**B**) | carbon-phenolic ablative, **flexible-joint (flexseal)**; **ε 9.7 originally, raised to 11.0 after 1997**; **TVC gimballed nozzle up to 7.3°**, hydraulic — see B.1.5 (**B**) | **P238 ≈ 6,650; P241 ≈ 7,080** `/motor` `max` SL (**C**) | not published | not published — **NEEDS PRIMARY** | **≈ 275 vac** (**B**) | **≈ 130 (P238), ≈ 140 (P241)** (**C**) | **P230 237,800; P238 238,000; P241 241,000** — **the number in the name *is* the propellant mass in tonnes** (**B**). See B.1.4 | empty mass ≈ **33,000** (P241) (**C**) | not computed | **B** on architecture; **C** on thrust/burn/empty mass |
| **P120C** | Europropulsion (Avio + ArianeGroup JV); casting at Regulus, Kourou and Avio, Colleferro / Italy–France (ESA) | **first flight Vega-C 2022-07-13** | Vega-C first stage (**1**); Ariane 6 boosters (**2 or 4**) | **HTPB 1912** — AP/Al/HTPB. Composition **Al 19%, AP 69%, HTPB 12%** — "1912" encodes 19% Al, 12% binder (**B**) | **monolithic, single cast** (**B**) | **Carbon-fibre filament-wound, monolithic — one piece, no segments, no field joints** (**B**). Manufacture: ≈3,500 km of carbon fibre wound over ≈33 days in a climate-controlled hall (**C**). 13.5 m × 3.4 m (**B**) | carbon-phenolic, flexseal joint (**C**); **electromechanical actuators on a flexible-joint nozzle** (**B**). ε not published | **≈ 4,780** `/motor` `max` **vacuum** (**B**) | not published | **not published — NEEDS PRIMARY** (Avio data sheet) | **≈ 280** (**B**) | **≈ 130–140** (**C**) | **141,400** (**B**) | **153,000** gross; **11,200** inert (**B**) | **0.924** `CALC` | **B** |
| **P160C** | Europropulsion / Italy–France | in development / early flight | later Ariane 6, Vega-E | HTPB 1912 | monolithic | carbon-fibre filament-wound monolithic | as P120C | not published | — | — | — | — | **≈ 160,000** | — | — | **C — label as in development** |

### Notes and contested figures — B.1

**B.1.1 Shuttle SRB propellant composition: 69.6/0.4 vs 69.8/0.2.** Both sum to
100%; the difference is iron-oxide **burn-rate catalyst** loading, 0.2 percentage
points. Print the NASA fact-sheet figure (**AP 69.6, Al 16.0, Fe₂O₃ 0.4, PBAN
12.04, epoxy 1.96**) and footnote the variant. Then make the real teaching point:
iron oxide is a burn-rate catalyst, so a 0.2% difference in its loading is not a
rounding question — it is a several-percent change in burn rate and therefore in
chamber pressure and thrust trace. That is the number worth checking.

**B.1.2 Shuttle SRB case wall: 12.7 mm vs "2 cm".** The 0.5 in membrane thickness
is the figure consistent with the published burst-pressure and case-mass numbers;
2 cm (Wikipedia) is plausibly a local thickness at a joint. **Present 12.7 mm
nominal membrane and note that joint regions are thicker.**

**B.1.3 SLS booster burn time: 126 s vs ~123 s.** NASA's reference page gives
**126 s**; several secondaries give ~123 s, apparently carrying over the Shuttle
figure. **Use 126 s.**

**B.1.4 Ariane 5 EAP propellant mass: 237.8 / 238 / 241 t, NOT 270 t.** Wikipedia's
Ariane 5 article reports "propellant mass 270,000 kg" for P238 and "273,000 kg"
for P241. **These are gross masses, mislabelled.** The designation P*nnn* means
*nnn* tonnes of propellant, by construction. Present the designation-consistent
value (**237.8 / 238 / 241 t**) and add a footnote naming the error, because
students will find the wrong number in thirty seconds and need to know why it is
wrong. **Do not propagate 270/273 t as propellant mass.**

**B.1.5 Ariane 5 EAP nozzle deflection: 6° vs 7.3°.** Quoted as 6° in some places,
7.3° in the ESA-derived text. **Use 7.3° and footnote the alternative.**

**B.1.6 The Shuttle SRB field joint — the architectural story.** The original
tang-and-clevis joint carried two fluorocarbon O-rings, primary and secondary, in
the clevis. Under ignition pressure the joint **rotated**: tang and clevis legs
deflected apart, momentarily opening the gap the O-rings had to seal. The rings
had to extrude into the gap faster than it opened — a rate-dependent seal, and the
extrusion rate of a fluorocarbon elastomer is strongly temperature-dependent
(**B**). On **STS-51-L, 1986-01-28**, cold-stiffened O-rings failed to seat in the
aft field joint of the right-hand SRB; hot gas blew by, burned through the joint,
and the plume impinged on the External Tank aft attachment and the ET itself
(**B**). The **RSRM redesign** added a **capture feature** on the tang — an inner
lip engaging the inside clevis leg to mechanically limit rotation — plus a **third
O-ring** on that capture feature, redesigned joint insulation, and **joint
heaters** (**B**). The capture-feature concept is said to derive from the "double
tang" joint of the abandoned filament-wound case booster (**C** for that
provenance specifically). This is the canonical worked example of *"the seal was
not the problem; the rotation was the problem"* and belongs in the joint
failure-modes section (module 22 / module 34), not the materials section.

**B.1.7 What the segmented steel case costs.** Mass fraction **0.85** for the
Shuttle SRB against **0.924** for the monolithic filament-wound P120C. That
number-pair is the single most useful argument in Part III for why composite
monolithic construction won for everything that does not have to be shipped by
rail. Once lit there is no throttling and no shutdown.

**B.1.8 SLS RSRMV — what changed and what did not.** Fifth propellant segment
(25% more propellant), new nozzle, **asbestos-free insulation** (the Shuttle
motor's insulation used asbestos-filled NBR), new liner configuration, new
avionics, and no parachutes or recovery. The pedagogically interesting point is
that a 25% propellant increase in the same case diameter is bought almost entirely
with length and a redesigned nozzle, **not with propellant chemistry** — it is the
same PBAN formulation as 1981.

**B.1.9 BOLE: the anomaly must travel with the claim.** +11% total impulse, "more
than 4 million pounds of thrust", composite case and electric TVC are all
contractor figures for a motor that has static-fired **once, with an anomaly near
the end of the burn**. The anomaly must appear in the same paragraph as the
performance claim, never in a footnote.

**B.1.10 Open verification actions.** Shuttle SRB: re-quote the composition from
the NASA STS news reference (503 during the pass; web.archive.org unreachable from
this environment). SLS RSRMV: the NASA fact-sheet PDFs would not text-extract
cleanly and the automated extraction was visibly corrupted (e.g. "length 177
inches" for a 177-foot booster) — **do not quote the PDF-derived numbers; re-open
the PDF by hand**. Ariane 5 EAP: fetch the ESA EAP page (403 from this
environment) and ESA Bulletin 104, *First Test Firing of an Ariane-5 Production
Booster*, which should settle thrust trace, chamber pressure and burn time.
P120C: Avio's own data sheet for the thrust trace and chamber pressure.

---

## B.2 Titan solid boosters — UA120 family and SRMU

**Every number in this section is confidence C and NEEDS PRIMARY.** This is the
weakest entry in Part B. The architecture is confidence B; the numbers are not
fit to tabulate in a module until the CSD/Hercules AIAA papers or the Titan IV
User's Guide have been read.

| motor | maker / country | years | vehicle | propellant family | grain | case (material, segments) | nozzle (material, ε, TVC) | F_max kN | F_avg kN | Pc | Isp SL / vac s | burn s | propellant kg | total kg | mass fraction | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **UA1205** | United Technologies Chemical Systems Division (CSD) / USA | 1965–1982 | Titan IIIC / IIID / IIIE | **PBAN-bound AP/Al** | not published | **Steel, segmented, 5 segments** — the last digit of the designation is the segment count. Diameter **120 in (3.05 m)**, the "120" in the name | **LITVC — liquid injection thrust vector control**, N₂O₄ injected through ports in the nozzle exit cone from external nacelles. **No moving nozzle.** Also **pyrotechnic thrust-termination ports in the forward dome** (retained for the crewed MOL / Titan IIIM configurations) | **≈ 5,300** (1,200,000 lbf) `/motor` `avg` SL | as left | not published | not published | **≈ 115** | not published | not published | — | **C** on numbers, **B** on architecture |
| **UA1206** | CSD / USA | 1982–1992 | Titan 34D, Commercial Titan III | PBAN AP/Al | not published | steel, segmented, **6 segments** | LITVC | not published | not published | not published | not published | not published | not published | not published | — | **B** on architecture only |
| **UA1207** | CSD / USA | first flight 1989 | Titan IV-A | PBAN AP/Al | not published | steel, segmented, **7 segments** | LITVC | Wikipedia infobox **14,234** (3,200,000 lbf) is **`/vehicle` (two boosters), not `/motor`**; **per motor ≈ 7,100** `max` — see B.2.1 | not published | not published | **272 vac** (**C**) | **120** (**C**) | not published | not published | — | **C** on numbers, **B** on architecture |
| **SRMU** | Hercules Aerospace → Alliant Techsystems / USA | **first flight 1997** (Titan IV-B) | Titan IV-B | **HTPB**-bound AP/Al — a generation change from the UA120's PBAN | not published | **Graphite/epoxy filament-wound composite, 3 segments** | **Gimballed (movable) nozzle** — abandoning LITVC | Wikipedia infobox **15,120** (3,400,000 lbf) is again **`/vehicle`**; **≈ 7,600 `/motor`** `max` | not published | not published | **286** (**C**) | **≈ 140** (**C**) | not published | not published | — | **C** on numbers, **B** on architecture |

### Notes — B.2

**B.2.1 Titan thrust figures are per-vehicle presented as per-motor.** Wikipedia's
Titan IV infobox gives "14.234 MN" for the UA1207 and "15.12 MN" for the SRMU;
**both are two-booster totals presented as if they described one motor.** This is
the single most common error in the secondary literature on solids and it is a
factor of two. Halve them for a per-motor figure and say you have done so.

**B.2.2 UA1205 → SRMU is the cleanest side-by-side in the whole solid-motor
field.** Same vehicle, same job, same diameter class, but **PBAN → HTPB**, **steel
→ graphite/epoxy**, **LITVC → gimballed nozzle**, **5–7 segments → 3 segments**.
Roughly **+14 s of Isp** and a large inert-mass saving. Use it as the Part III
worked comparison (module 26).

**B.2.3 SRMU development was famously troubled.** A case failed during a **1991
structural test, killing one worker**, and the program slipped years — which is
why early Titan IV-B flights used leftover UA1207s. **Confidence C; needs a
primary (GAO report or AIAA paper) before it is stated in a module.**

---

## B.3 Vega, GEM, Castor and Pegasus/Orion motor families

| motor | maker / country | years | vehicle / stage | propellant family | case (material, segments) | nozzle / TVC | F_max kN | Isp s | burn s | propellant kg | gross kg | mass fraction | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P80FW** | Avio / Italy (ESA) | Vega from 2012 | Vega stage 1 | HTPB 1912 AP/Al | **graphite-epoxy filament wound**, monolithic | carbon-phenolic with **carbon–carbon throat insert**; flexible joint, **electromechanical TVC** | **2,261** `/motor` `max` | **280** | **107** | **88,365** | **~95,800** | 0.922 `CALC` | **B** |
| **Zefiro 23** | Avio / Italy | Vega from 2012 | Vega stage 2 | HTPB 1912 | carbon-epoxy filament wound, 1.9 m | as above | **1,120** `/motor` `max` | **287.5** | **77.1** | **23,814** | **26,300** | 0.905 `CALC` | **B** |
| **Zefiro 9A** | Avio / Italy | Vega and Vega-C | Vega / Vega-C stage 3 | HTPB 1912 | carbon-epoxy filament wound, 1.9 m | as above | **317** `/motor` `max` | **295.9** | **119.6** | **10,567** | **12,000** | 0.881 `CALC` | **B** |
| **Zefiro 40** | Avio / Italy | Vega-C from 2022 | Vega-C stage 2 | HTPB 1912 | carbon-epoxy filament wound, 2.4 m | as above | **1,304** `/motor` `max` | **293.5** | **92.9** | **36,239** | **40,477** | 0.895 `CALC` | **B** |
| **GEM-40** | Hercules → ATK → Northrop Grumman / USA | 1990-11-26 → 2018-09-15 | Delta II strap-on | HTPB-bound AP/Al | **CFRP filament-wound monolithic** | **fixed** | **643.8** `/motor` `max` | **274** | **63.3** | **11,770** | **12,962** | **0.908** `CALC` | **B** |
| **GEM-46** | NG / USA | 1998-08-26 → 2011-09-10 | Delta III, Delta II Heavy | HTPB AP/Al | CFRP filament-wound monolithic | **fixed + vectorable variant** | **611** `/motor` `max` — *lower* than GEM-40 despite 43% more propellant; see B.3.1 | **277.8** | **75.9** | **16,860** | **18,860** | **0.894** `CALC` | **B** |
| **GEM-60** | NG / USA | 2002-11-20 → 2019-08-22 | Delta IV M+ | HTPB AP/Al | CFRP filament-wound monolithic | fixed or vectorable | **1,248.9** `/motor` `max` | **275** | **90.8** | **29,698** | **33,183** | **0.895** `CALC` | **B** |
| **GEM-63** | NG / USA | 2020-11-13 → 2026-07-02 | Atlas V | HTPB AP/Al | CFRP filament-wound monolithic | fixed | **1,649.6** `/motor` `max` | **279.1** | **97.6** | **44,087** | **49,342** | **0.894** `CALC` | **B** |
| **GEM-63XL** | NG / USA | 2024-01-08 → active | Vulcan Centaur | HTPB AP/Al | CFRP filament-wound monolithic; **"the longest monolithic rocket motor produced to date"** (NG) | fixed (63XLT vectorable, **cancelled**); nozzle exit dia. 60 in | **2,061** `/motor` `max` — NG states 15–20% more thrust than GEM-63 | **280.3** | **87.3** | **47,853** (NG: 105,497 lb — both agree) | **53,030** | **0.902** `CALC` | **B→A** for the propellant mass |
| **Castor 120** | Thiokol → ATK → NG / USA | Athena/Taurus era | Athena I/II stage 1; Taurus stage 0 | **Class 1.3 HTPB/AP** | filament-wound composite | movable nozzle | **1,900** `/motor` `max` | **280** | **83.4** | not published | not published | — | **B** |
| Castor 1 (TX-33) | Thiokol / USA | Sergeant heritage | Scout S2, Delta strap-on | PBAA/AP | — | — | not published | not published | 27 | — | — | — | **C — do not tabulate** |
| Castor 2 (TX-354) | Thiokol / USA | — | Delta, Scout | PBAN/AP | — | — | not published | not published | ~37 | — | — | — | **C — do not tabulate** |
| Castor 4 / 4A / 4B | Thiokol / USA | — | Delta 3914/3920 strap-ons, Atlas IIAS (4A/4B), Shavit-class | HTPB/AP (4A/4B) | — | — | ~430–478 `/motor` | ~266–280 | ~56 (4A) | — | — | — | **C — do not tabulate** |
| Castor 30 | ATK → NG / USA | — | Antares stage 2 | HTPB/AP | — | — | not published | not published | not published | — | ≈14,000 | — | **C — do not tabulate** |
| Castor 30XL | ATK → NG / USA | — | Antares stage 2 | HTPB/AP | — | — | not published | ~300 | not published | — | ≈25,000 | — | **C — do not tabulate** |
| **Orion 50S** | Orbital Sciences → NG / USA | Pegasus from 1990 | Pegasus stage 1 | HTPB/Al composite | **graphite-epoxy filament wound** | delta wing + **gimballed nozzle** | **500** `/motor` `max` | not published | **75.3** | not published | — | — | **C** |
| **Orion 50SXL** | OSC → NG / USA | Pegasus XL | Pegasus XL stage 1 | HTPB/Al | graphite-epoxy filament wound | wing + gimballed nozzle | **726** `/motor` `max` | **284.6** | **68.6** | **15,014** | — | — | **B** |
| **Orion 50XL** | OSC → NG / USA | Pegasus XL | Pegasus XL stage 2 | HTPB/Al | graphite-epoxy filament wound | **electromechanically gimballed** | **196** `/motor` `max` | **283.8** | **69.4** | **3,925** | — | — | **B** |
| **Orion 38** | OSC → NG / USA | Pegasus | Pegasus stage 3 | HTPB/Al | graphite-epoxy filament wound | electromechanically gimballed | **36** `/motor` `max` | **281.7** | **68.5** | **770** | — | — | **B** |

### Notes — B.3

**B.3.1 GEM-46 has lower max thrust than GEM-40 despite 43% more propellant**,
because the burn time is longer. This is a genuine design choice — lower thrust,
longer burn, better for the Delta III trajectory — **not a transcription error**.
Flag it in the module as an example that "bigger motor" does not mean "more
thrust."

**B.3.2 Castor: only Castor 120 is quotable.** Every other Castor row above is
confidence **C** and **must not be tabulated in a module yet**; the Wikipedia
article is unusually thin and gives no thrust, Isp or propellant mass for most
variants. **Castor 120 is the clearest public case of an ICBM first-stage motor
being commercialised essentially unchanged** — it is a direct derivative of the
**Peacekeeper stage-1 motor**, with the architecture (HTPB, filament-wound
composite case, movable nozzle) carried straight over. Use it to make the point
that *the architecture is what transfers, not a formulation*.

**B.3.3 Vega flight anomalies — record these, they are the teaching value.**
- **Vega VV15, 2019-07-11 (FalconEye 1):** Zefiro 23 second-stage motor failure
  shortly after ignition; vehicle lost. (**B**)
- **Vega-C VV22, 2022-12-20:** Zefiro 40 under-pressure at second-stage burn;
  vehicle lost. The independent inquiry attributed it to unexpected erosion of the
  **carbon–carbon nozzle throat insert**, traced to an insert-material supplier
  change. (**C** on the attribution detail — **NEEDS PRIMARY**: the
  ESA/Arianespace independent enquiry commission press release.) This is the best
  modern example available of *"a materials qualification decision in a
  subcomponent destroyed a launch vehicle"* and belongs in both the
  nozzle-materials (module 24) and quality-assurance (module 25) sections.

**B.3.4 Zefiro family common architecture.** 1.9 m (Z23, Z9A) or 2.4 m (Z40)
carbon-epoxy filament-wound case, **low-density EPDM insulation**, carbon-phenolic
nozzle with a **carbon–carbon throat insert**, flexible nozzle joint with
**electromechanical TVC**, HTPB 1912 propellant throughout. (**B**)

**B.3.5 Pegasus/Orion record.** Northrop Grumman states 14 Orion variants, ~500
delivered, first flight 1990, **zero flight failures across 100+ launches**
(**B**). The case-material and nozzle details are **C** — **NEEDS PRIMARY**
(Pegasus User's Guide).

**B.3.6 Open verification action — GEM chamber pressures and expansion ratios are
missing** from every GEM row. The Northrop Grumman *Propulsion Products Catalog*
PDF would supply them; it would not text-extract in this environment.

---

## B.4 Upper-stage and apogee-kick motors

| motor | maker / country | years | vehicle / use | propellant family | case | nozzle (ε, TVC) | F kN | Isp vac s | burn s | propellant kg | gross kg | inert kg | mass fraction | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Star 48B (TE-M-711-9)** | Thiokol Elkton → Northrop Grumman / USA | Star 48 (TE-M-711) 1980–85; **Star 48B 1985–** | PAM-D upper stage on Delta II and Shuttle-deployed satellites; **New Horizons third stage** | **TP-H-3340 (HTPB/AP/Al)** — **C, NEEDS PRIMARY** | **Titanium (6Al-4V)** — **C, NEEDS PRIMARY** | carbon-phenolic, **fixed** (Star 48BV adds TVC). **ε ≈ 47.7 short nozzle / 54.8–70.4 long nozzle** | **≈ 66.0–66.4** `/motor` vac (within quoting noise) | **286.2 (short nozzle) / 292.2 (long nozzle)** — **both correct; never quote "Star 48B Isp" without the nozzle.** See B.4.1 | **≈ 87** | **2,009–2,011** | **≈ 2,137** | **≈ 128 — NOT 28.** See B.4.1 | **≈ 0.94** | **B** on masses/thrust; **C** on Isp/ε |
| **Star 48BV** | Thiokol → NG / USA | — | Minotaur IV+ and Minotaur V | as Star 48B | titanium | **thrust-vectoring, non-spinning variant** | as Star 48B | as Star 48B | — | — | — | — | — | **B** |
| **Star 37 family** (37E, 37F, 37FM, 37XFP) | Thiokol → NG / USA | — | apogee-kick, 37 in (0.94 m) class; **Star 37FM flew as the Lunar Prospector injection motor** | TP-H-3340-class HTPB | titanium or steel | fixed carbon-phenolic | not published | roughly **286–290** | not published | not published | not published | not published | — | **C — NEEDS PRIMARY. Do not put Star 37 numbers in a module from this file** |
| **Orbus 21D** | United Technologies / CSD → Pratt & Whitney / USA | — | Athena II second stage | Class 1.3 HTPB/AP | not published | not published | **194** `/motor` vac | **293** | **150** | not published | not published | — | — | **C — do not tabulate** |
| **Orbus 6 / Orbus 21** | UTC/CSD → P&W / USA | IUS era | Inertial Upper Stage stages 2 and 1 respectively | HTPB/AP | **Kevlar-epoxy** | **extendable exit cone (EEC)**, gimballed nozzle | not published | not published | not published | not published | not published | — | — | **C — NEEDS PRIMARY** (Boeing IUS documentation or the NASA IUS user's guide) |

### Notes and contested figures — B.4

**B.4.1 Star 48B — a genuinely contested motor.**

| quantity | value A | value B | note |
|---|---|---|---|
| Isp vac | **286.2 s** | **292.2 s** | **Both correct** — short-nozzle and long-nozzle variants. Never quote "Star 48B Isp" without the nozzle |
| ε | 47.7 | 54.8 / 70.4 | Same cause |
| Thrust | 66.0 kN | 66.4 kN | Within quoting noise |
| **Inert mass** | **28 kg** `[JM-LV]` | **126 kg** `[EA]` | **Cannot both be right.** 2,137 − 2,009 = **128 kg**, which supports the ~126 kg figure; **the 28 kg figure is almost certainly a dropped digit.** Use **≈128 kg**, mass fraction ≈ 0.94 |

The short-nozzle variant (ε ≈ 47.7) was built to fit inside the Shuttle PAM-D
cradle; the long-nozzle variant is the higher-performing motor. Present both,
always with the ε, and use the pair as the worked example for **"Isp is a property
of the motor *and* its nozzle, not of the propellant"** (module 24).

**B.4.2 The IUS extendable exit cone** is the flight-proven reference for the EEC
concept in a solid motor and is the example to use in the nozzle module — but the
numbers are **C** and need a primary source.

---

## B.5 Scout, Indian, Japanese and Israeli motors

| motor | maker / country | vehicle / stage | propellant family | case | nozzle / TVC | F kN | Isp s | burn s | propellant kg | gross kg | mass fraction | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Algol** | Aerojet General / USA | Scout A stage 1 (**Polaris heritage**) | AP composite | not published | not published | **564.25** `/motor` vac | not published | **47** | not published | **11,600** | — | **C — NEEDS PRIMARY** |
| **Castor** | Thiokol / USA | Scout A stage 2 (**Sergeant heritage**) | PBAN/AP | not published | not published | **258.92** `/motor` vac | not published | **37** | not published | **4,424** | — | **C** |
| **Antares** | Allegany Ballistics Lab / Hercules / USA | Scout A stage 3 | AP composite | not published | **spin-stabilised, no TVC** | **93.09** `/motor` vac | not published | **36** | not published | **1,400** | — | **C** |
| **Altair** | Allegany Ballistics Lab / USA | Scout A stage 4 | AP composite | not published | **spin-stabilised, no TVC** | **22.24** `/motor` vac | not published | **28** | not published | **275** | — | **C** |
| **PSLV PS1 (S139)** | ISRO / VSSC / India | PSLV core (also GSLV) | **HTPB/AP/Al** | **M250 maraging steel, segmented** | **SITVC — secondary injection TVC using aqueous strontium perchlorate**, injected into the exit cone for pitch and yaw; roll handled by a separate liquid RCS module. Fixed nozzle. Diameter 2.8 m | **4,846.9** `/motor` `max` | **237 SL / 269 vac** (**C**) | **≈ 110** (PSLV) / **100** (GSLV) | **138,200** | inert **30,200** | **0.821** `CALC` | **B** on architecture and propellant mass; **C** on thrust/Isp/burn |
| **PSOM (S9)** | ISRO / India | PSLV strap-on | HTPB/AP/Al | not published | some carry SITVC, others fixed | **510** `/motor` | not published | **44** | **9,000** | not published | — | **C** |
| **PSOM-XL (S12)** | ISRO / India | PSLV-XL strap-on; 12 m × 1 m | HTPB/AP/Al | not published | some SITVC | **703.5** `/motor` | not published | **70** | **12,200** | not published | — | **C** |
| **LVM3 S200** | ISRO / India | LVM3 boosters, **2 per vehicle** — **the best-documented non-US large segmented solid** | **HTPB/AP** | **M250 maraging steel, 3 segments**. 25 m × 3.2 m | **flex nozzle, ±8°, electro-hydraulic actuators** | **5,150** `/motor` `max`; **3,578.2** `/motor` `avg` — **max/avg = 1.44**, a strongly progressive-then-regressive trace quite unlike the Shuttle SRB | **274.5 vac** | **128** | **205,000** each. **Published grain split: head-end segment 27,100; middle 97,380; nozzle-end 82,210** | not published | — | **B** |
| **M-14** | ISAS / IHI Aerospace / Japan | M-V stage 1 (1997–2006) | HTPB-bound composite (BP-207 family) | **HT-230M high-strength steel** | **movable nozzle TVC** | **3,780** `/motor` vac | **246** | **46** | not published | not published | — | **C — NEEDS PRIMARY** |
| **M-24** | ISAS / IHI / Japan | M-V stage 2 | HTPB composite | **CFRP filament-wound** | not published | **1,245** `/motor` vac | **203 — IMPLAUSIBLE, DO NOT PRINT.** See B.5.1 | **71** | not published | not published | — | **D** |
| **M-34 / M-34b** | ISAS / IHI / Japan | M-V stage 3 | HTPB composite | CFRP filament-wound | **carbon–carbon extendable exit cone (EEC)** — one of very few flight-proven solid-motor EECs outside the US | **294** `/motor` vac | **301** (M-34b ≈ 301 vac) | **102** | not published | not published | — | **C** |
| **KM-V1** | ISAS / IHI / Japan | M-V stage 4 | HTPB composite | CFRP | not published | **51.9** `/motor` vac | **298** | **73** | not published | not published | — | **C** |
| **SRB-A3** | IHI Aerospace / Japan | Epsilon stage 1 — the **H-IIA/H-IIB strap-on booster reused as an orbital first stage**, which is the whole cost argument for Epsilon | HTPB composite | **CFRP filament-wound monolithic** | **movable nozzle** | **2,271** `/motor` `max` | **284** | **116** | **65,900** | not published | — | **B** |
| **M-35** | IHI Aerospace / Japan | Epsilon stage 2 (descends from the M-V upper stages) | HTPB composite | CFRP | not published | **445** `/motor` `max` | **295** | **129** | not published | not published | — | **C** |
| **KM-V2c** | IHI Aerospace / Japan | Epsilon stage 3 | HTPB composite | CFRP | not published | **99.6** `/motor` `max` | **299** | **91** | **2,500** | not published | — | **C** |
| **LK-1 (stage 1)** | Israel Military Industries / Israel | Shavit stage 1 | HTPB | not published | not published | **553.8** `/motor` | **268** | **55** | not published | not published | — | **C — NEEDS PRIMARY** |
| **LK-1 (stage 2)** | IMI / Israel | Shavit stage 2 | HTPB | not published | not published | **515.8** `/motor` | **268** | **55** | not published | not published | — | **C** |
| **RSA-3-3** | Rafael / Israel | Shavit stage 3 | solid (family not published) | not published | not published | **58.6** `/motor` | **298** | **94** | not published | not published | — | **C** |
| **LK-4** (optional 4th stage) | — / Israel | Shavit stage 4, **liquid** | hydrazine | — | — | **0.402** `/motor` | **200** | **800** | — | — | — | **C** |
| **FG-112** | CASC / China | Long March 6A strap-on, 4 per vehicle; 15.1 m × 2.0 m | not published | not published | not published | **1,214** `/motor` `max`; **4,828** `/vehicle` | not published | not published | not published | not published | — | **C** |

### Notes and contested figures — B.5

**B.5.1 M-V second stage Isp of 203 s — DO NOT PRINT.** Wikipedia's M-V infobox
gives the M-24 an Isp of 203 s. That is not physically credible for an HTPB/AP/Al
upper-stage motor with a high-expansion nozzle sitting between a 246 s stage and a
301 s stage. It is almost certainly a transcription error (possibly a sea-level or
a mis-unit figure). Expected value is ~282–292 s. **Either state "≈285 s
(uncorroborated)" with a visible caveat, or omit the M-24 Isp entirely and say the
source data is inconsistent. Printing a wrong number with a caveat is worse than
printing no number.** Flagged unresolved until a JAXA source is read.

**B.5.2 Scout is the reference case for spin stabilisation in place of TVC.**
Stages 3 and 4 were spun up and flown unguided, which removes the actuator, the
hydraulics and the mass, at the cost of injection accuracy. It is also the heritage
line: **Algol from Polaris, Castor from Sergeant.** Architecture confidence **B**;
the numbers are **C** — **NEEDS PRIMARY** (the NASA Scout User's Manual, on NTRS).

**B.5.3 The S139's SITVC is a genuinely distinctive choice.** It is LITVC with a
dense, non-toxic, cheap injectant (aqueous strontium perchlorate), and it lets a
very large motor keep a fixed nozzle. Worth a subsection in module 24.

**B.5.4 S200's published per-segment grain split** (27,100 / 97,380 / 82,210 kg)
is unusually generous documentation and makes it a good worked example for
grain-design and thrust-trace problems (module 21).

**B.5.5 GSLV.** Same S139 core as PSLV (138,200 kg HTPB, 4,846.9 kN, Isp 237 s),
burn 100 s, but with four **liquid** L40H strap-ons (N₂O₄/UDMH, 42,700 kg each,
760 kN, 154 s, Isp 262 s) rather than solid strap-ons. (**C**)

**B.5.6 Chinese solids — keep to a paragraph, do not tabulate.** Long March 6A's
FG-112 is the only entry with even confidence C. **Long March 11 (CZ-11)** is an
all-solid four-stage launcher derived from road-mobile missile technology; open
specifications are inconsistent and no set could be verified — **omit it from the
textbook table rather than publish confidence-D numbers.** The CZ-3/4 families use
**no** solid strap-ons (they are hypergolic).

**B.5.7 M-V context.** At retirement M-V was the largest all-solid orbital
launcher ever flown and had the highest-performing solid upper-stage set (M-34b
Isp ≈ 301 s vac). Architecture confidence **C** — **NEEDS PRIMARY** (the ISAS/JAXA
M-V papers).

**B.5.8 Shavit's interesting engineering point is not the motors.** Shavit
launches **retrograde, westward over the Mediterranean**, paying roughly 2×460 m/s
of Earth-rotation penalty for range-safety reasons. Open sources state the first
two stages are common with Jericho II. Everything else is **C** and needs a
primary.

---

## B.6 (reserved)

*Numbering kept aligned with the worksheet's sectioning; no entries.*

## B.7 Defense motors — architecture only

Per the course scope boundary, this section records **only architecture**: stage
count, propellant *family* name, case material *family*, nozzle *concept*, and any
thrust/Isp/mass figures that appear in open, citable, unclassified sources. No
formulations beyond what NASA publishes in a fact sheet, no processing, no
dimensions of weapon components. These entries are deliberately shorter than the
civil-launcher entries; that is the intended outcome.

### Minuteman

| | Minuteman I (LGM-30A/B) | Minuteman II (LGM-30F) | Minuteman III (LGM-30G) |
|---|---|---|---|
| Stage 1 | Thiokol M55 (TU-122) | Thiokol M55A1 | Thiokol **M55A1** |
| Stage 2 | Aerojet SR19-AJ-1 | Aerojet **SR19-AJ-1** (enlarged) | Aerojet **SR19-AJ-1** |
| Stage 3 | Aerojet/Thiokol **SR73-AJ/TC-1** | — | Hercules **SR73-AJ-1 / M57** |
| Dates | 1962–1969 | 1965–1990s | 1970– (in service) |

Architecture-level points, confidence **B** unless noted:

- **All stages: AP/Al composite propellant.** Stage 1 is a PBAN-class
  polybutadiene composite; later stages moved to higher-energy binders. **No
  formulation detail beyond family is recorded**, per scope.
- **Stage 1 case: steel. Stages 2 and 3 progressively moved to filament-wound
  composite** — stage 2 to titanium and then composite, stage 3 to
  glass-filament-wound and then composite. Confidence **C** on the specific
  progression; **NEEDS PRIMARY**.
- **TVC concepts: stage 1, four gimballed nozzles. Stage 2, liquid injection**
  (Freon injectant on Minuteman II/III-era hardware). **Stage 3, fixed nozzle with
  a liquid-injection TVC system** — Wikipedia describes the Minuteman III third
  stage explicitly in those terms. Confidence **B**.
- **Thrust-termination ports on the third stage** — shaped charges open ports in
  the forward dome, dropping chamber pressure and terminating thrust to set final
  velocity. **This is the architectural feature worth teaching: a solid motor *can*
  be shut down, at the cost of a violent, one-shot, structurally destructive
  event.** Confidence **B**.
- Published thrust figures (Minuteman I): stage 1 ≈ **790 kN** `/motor`, stage 2 ≈
  **268 kN** `/motor`, stage 3 ≈ **152 kN** `/motor`. Confidence **C**.

### Peacekeeper (LGM-118A, MX)

| stage | motor | manufacturer | conf |
|---|---|---|---|
| 1 | SR118 | Thiokol | B |
| 2 | SR119 | Aerojet General | B |
| 3 | SR120 | Hercules | B |
| PBV | restartable storable-hypergolic liquid | Rocketdyne | B |

- **Case material family: Kevlar/epoxy filament-wound on all three solid stages.**
  Confidence **B** (FAS and GlobalSecurity both say Kevlar-epoxy for the marching
  stages).
- **Stages 2 and 3 use extendable exit cones (EEC).** Confidence **B**. This is the
  single most important architectural fact about Peacekeeper for a propulsion
  textbook: **EECs let a stage carry a high-ε nozzle inside a length-limited silo,
  buying ~10–15 s of Isp for a deployment mechanism.**
- **Propellant family:** open sources state the propellant used **HMX**, a
  nitramine of higher energy than AP alone — i.e. a **nitramine-loaded composite /
  CMDB-class** propellant rather than a plain AP/Al/HTPB. Confidence **C**. Some
  sources associate **NEPE** with Peacekeeper stage 3; this could not be
  corroborated and **is not recorded here as fact**.
- Stage 1 thrust ≈ **2.2 MN (500,000 lbf)** `/motor`. Confidence **C**.
- **Castor 120** is the commercial derivative of the stage-1 motor (§B.3).

### Polaris → Poseidon → Trident

| system | stages | propellant family (open sources) | case family | nozzle concept | decade |
|---|---|---|---|---|---|
| **Polaris A-1** | 2 | polyurethane / PBAA-class AP composite | **steel** | **four rotatable nozzles with jetavators** (jet vanes / deflector rings) | late 1950s |
| **Polaris A-2** | 2 | AP composite; second stage moved toward a higher-energy binder | steel; **glass-filament-wound second stage** | rotatable nozzles / jetavators | early 1960s |
| **Polaris A-3** | 2 | **CTPB**-class composite (both stages) | **glass filament wound** | **liquid injection TVC (Freon)** replacing jetavators | mid 1960s |
| **Poseidon C-3** | 2 | high-energy composite (nitramine-loaded) | **glass filament wound** | **LITVC** | late 1960s / 1970s |
| **Trident I C-4** | 3 | high-energy composite | **Kevlar/epoxy** | **single gimballed nozzle per stage; extendable nozzle; aerospike** | late 1970s |
| **Trident II D-5** | 3 | **NEPE-75** (nitrate-ester-plasticised polyether) | **graphite/epoxy** on stages 1 and 2; stage 3 changed from Kevlar to graphite/epoxy mid-programme (**1988**) | **one oscillating (gimballed) graphite-composite nozzle per stage; aerospike** | 1980s–90s |

Confidence **B** for Trident — the FAS/GlobalSecurity D-5 features pages are
explicit about NEPE-75 and about the Kevlar→graphite case change and its two
stated reasons: **inert-weight reduction *and* elimination of the electrostatic
potential difference between Kevlar and graphite**. Confidence **C** for the
Polaris/Poseidon rows; the Wikipedia Polaris article carries no propulsion detail
and no primary could be reached. **NEEDS PRIMARY**: the Navy Strategic Systems
Programs historical summaries, and the classic open-literature account of the
jetavator→LITVC transition.

**The Trident "aerospike" is not an aerospike nozzle.** It is a **telescoping
drag-reduction spike deployed from the nose**, reportedly cutting frontal drag by
roughly 50% and buying range. This naming collision confuses students every year
and the module must state it explicitly. Confidence **B**.

**The two architectural arcs worth teaching, and nothing more:**

1. **Nozzle control:** jetavators (1950s, simple, lossy) → liquid injection
   (1960s, no moving nozzle, injectant mass penalty) → single gimballed flexseal
   nozzle (1970s onward, efficient, needs a flexible joint that can survive
   submarine storage). Trident's *single* gimballed nozzle per stage replacing
   four nozzles is a large inert-mass and complexity win.
2. **Case material:** steel → glass filament wound → Kevlar/epoxy →
   graphite/epoxy. Each step is roughly a **20–30% case-mass reduction at equal
   burst pressure**. This progression alone accounts for a large part of the range
   growth from Polaris A-1 to Trident D-5, independent of chemistry.

---

## B.8 Solid-motor contested figures, consolidated

Ranked by how much damage getting them wrong would do. (Details are in the notes
under each table; this is the checklist.)

1. **Thrust: per-motor versus per-vehicle** (Titan IV, Ariane 5, SLS). The most
   common error in the secondary literature, and it is a factor of two. Every
   thrust figure in this file carries `/motor` or `/vehicle`, and every module
   quoting one repeats the suffix. **No exceptions.** (§B.2.1)
2. **Ariane 5 EAP propellant mass: 237.8 / 238 / 241 t, not 270 / 273 t.** The
   Wikipedia figures are gross masses mislabelled as propellant mass. (§B.1.4)
3. **Star 48B Isp: 286.2 vs 292.2 s** — not an error, two nozzles; and **inert
   mass 128 kg, not 28 kg**. (§B.4.1)
4. **Shuttle SRB composition: 69.6/0.4 vs 69.8/0.2** — iron oxide is a burn-rate
   catalyst, so the 0.2-point difference is a several-percent change in burn rate.
   (§B.1.1)
5. **M-V second stage Isp of 203 s — do not print it.** (§B.5.1)
6. **BOLE and every other in-development motor** — contractor claims; the DM-1
   nozzle anomaly must appear in the same paragraph as the +11% impulse claim.
   (§B.1.9)
7. **Shuttle SRB case wall 12.7 mm nominal membrane**, not 2 cm. (§B.1.2)
8. **Ariane 5 EAP nozzle deflection 7.3°**, not 6°. (§B.1.5)
9. **SLS booster burn time 126 s**, not ~123 s. (§B.1.3)
10. **Titan IV UA1207 and SRMU infobox thrusts are two-booster totals.** (§B.2.1)

## B.9 Do-not-print list — solids

The following are **not yet fit to quote in a module**. Where the worksheet says
`NEEDS PRIMARY`, it means it.

- All **Titan UA120 / SRMU** numbers (architecture only is quotable).
- All **Castor** numbers **except Castor 120**.
- All **Star 37** numbers.
- All **Orbus** numbers.
- All **Scout** stage numbers (the spin-stabilisation architecture is quotable).
- All **Shavit** numbers.
- **Every Chinese motor** — keep to a one-paragraph architectural note; omit
  Long March 11 entirely.
- **M-V M-24 Isp (203 s)** — omit or caveat visibly; never print bare.
- **Star 48B inert mass of 28 kg** — use ≈128 kg.
- **Ariane 5 EAP "propellant mass" of 270 / 273 t** — those are gross masses.
- **SLS RSRMV Isp and propellant mass** from PDF text extraction — the extraction
  was visibly corrupted; re-open the PDF by hand.
- **Star 48B propellant designation (TP-H-3340) and titanium case** — both **C**,
  NEEDS PRIMARY.
- **Minuteman case-material progression** and **Peacekeeper HMX/NEPE association**
   — **C**; the NEPE association specifically is *not* recorded as fact.

---

# Part C — Cold-gas thrusters

## C.1 Gas properties and ideal performance

**Method** (worksheet §B.1, confidence **A** for the ideal-Isp column — it is
`[CALC]` from stated inputs and reproducible). Ideal-gas, frozen-flow, isentropic
nozzle. For each gas the area-ratio relation is solved for exit Mach number at the
stated ε, then

$$C_F^{vac} = \Gamma\sqrt{\frac{2\gamma}{\gamma-1}\left[1-\left(\tfrac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]} + \frac{p_e}{p_c}\varepsilon,
\qquad c^{*}=\frac{\sqrt{R T_0}}{\Gamma},
\qquad \Gamma=\sqrt{\gamma}\left(\tfrac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

with **T₀ = 300 K**, $R = R_u/M$, $R_u = 8314.46$ J/(kmol·K), $g_0 = 9.80665$ m/s².
**Any published cold-gas Isp is meaningless without T₀ and ε**; the spread between
ε = 20 and ε = 100 is 3–10% depending on γ.

| gas | M (kg/kmol) | γ @300 K | c* (m/s) | C_F,vac (ε=50) | **Isp ideal, ε=50 (s)** | ε=20 | ε=100 | typical **realized** Isp (s) | liquefiable @300 K? | stored density (see C.1.2) | **ρ·Isp·g₀ (N·s/cm³)** (see C.1.1) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| H₂ | 2.016 | 1.405 | 1622.5 | 1.726 | **285.6** | 279.2 | 288.9 | ~250–272 | no (Tc 33 K) | ~0.02 g/cm³ @241 bar | ≈ 0.049–0.053 |
| **He** | 4.003 | 1.667 | 1087.0 | 1.606 | **178.1** | 176.4 | 178.8 | ~150–165 | no (Tc 5.2 K) | ~0.04 g/cm³ @241 bar | **≈ 0.059–0.065** |
| NH₃ | 17.031 | 1.31 | 572.0 | 1.795 | **104.7** | 101.5 | 106.5 | ~90–100 (warm gas) | **yes**, vp ≈ 10.6 bar | ~0.60 g/cm³ liquid | ≈ 0.53–0.59 |
| N₂ | 28.014 | 1.400 | 435.8 | 1.729 | **76.8** | 75.1 | 77.8 | **~65–73** | no (Tc 126 K) | ~0.28 g/cm³ @241 bar; ~0.25 @300 bar (**inconsistent — C.1.2**) | ≈ 0.18–0.20 |
| Air | 28.965 | 1.400 | 428.6 | 1.729 | **75.6** | 73.9 | 76.5 | ~63–71 | no | ~0.29 g/cm³ @241 bar | ≈ 0.18–0.20 |
| Ar | 39.948 | 1.667 | 344.1 | 1.606 | **56.4** | 55.8 | 56.6 | ~48–52 | no (Tc 151 K) | ~0.44 g/cm³ @241 bar | ≈ 0.21–0.22 |
| CO₂ | 44.010 | 1.289 | 357.9 | 1.813 | **66.2** | 64.0 | 67.4 | ~50–60 | **yes, marginally** — Tc = 304.1 K, vp ≈ 67 bar @300 K | ~0.6–0.7 g/cm³ liquid | ≈ 0.32–0.38 |
| n-butane | 58.122 | 1.09 | 330.8 | 2.050 | **69.2** | 65.0 | 71.9 | **~60–70** cold, ~75–80 warm | **yes**, vp ≈ 2.6 bar | ~0.57 g/cm³ liquid | ≈ 0.34–0.39 |
| Kr | 83.798 | 1.667 | 237.6 | 1.606 | **38.9** | 38.6 | 39.1 | ~33–36 | no (Tc 209 K) | ~1.0 g/cm³ @241 bar | ≈ 0.32–0.35 |
| R-134a | 102.03 | ~1.12 | 247.2 | 2.005 | **50.5** | 47.8 | 52.3 | **~40–50** cold; ~70–82 warm-gas | **yes**, vp ≈ 7.0 bar | ~1.19 g/cm³ liquid | ≈ 0.47–0.58 |
| Xe | 131.29 | 1.667 | 189.8 | 1.606 | **31.1** | 30.8 | 31.2 | ~26–28 | no — Tc = 289.7 K, so **supercritical** at 300 K | ~2.74 g/cm³ @241 bar (**suspect — C.1.2**) | ≈ 0.70–0.75 |
| SF₆ | 146.06 | ~1.09 | 208.7 | 2.050 | **43.6** | 41.0 | 45.4 | ~35–42 | **yes**, vp ≈ 21 bar | ~1.4 g/cm³ liquid | ≈ 0.48–0.58 |
| **R-236fa** | 152.04 | ~1.08 | 205.2 | 2.067 | **43.2** | 40.6 | 45.0 | **~40** cold; ~82 warm-gas (CHIPS) | **yes**, vp ≈ 2.7 bar | ~1.36 g/cm³ liquid | **≈ 0.53–0.57** |

Confidence: **A** for the ideal-Isp column. **C** for the γ values of the
refrigerants and butane (these are real gases well away from ideal near
saturation; γ is temperature- and pressure-dependent and a single value is an
approximation). **C** for the stored-density column, which is literature-recalled
rather than NIST-verified — **NEEDS PRIMARY**: NIST REFPROP/WebBook densities and
real-gas γ before the table ships.

### C.1.1 Correction to the worksheet's impulse-density claim

**The worksheet's §B.1 design rule 2 is arithmetically wrong and must not be
carried forward.** It states that helium gives "~7.1 N·s per cm³ of propellant"
and R-236fa "~5.8 N·s/cm³ — nearly the same", and concludes that the *tank*, not
the propellant, is what decides the trade. The conclusion is right; **the numbers
are wrong by roughly two orders of magnitude and in the wrong direction.**

Impulse per unit stored propellant volume is

$$\frac{I_{tot}}{V} = \rho\, I_{sp}\, g_0$$

With ρ in g/cm³ and Isp in seconds, the product is in units of 10⁻³ N·s/cm³.
Evaluated at the worksheet's own stated conditions and realized Isp values:

| propellant | ρ (g/cm³) | realized Isp (s) | **ρ·Isp·g₀ (N·s/cm³)** |
|---|---|---|---|
| **He @ 241 bar, 300 K** | 0.04 | 150–165 | **≈ 0.059–0.065**, i.e. **≈ 0.06–0.07** |
| **R-236fa, saturated liquid @ 2.7 bar** | 1.36 | 40–43 | **≈ 0.533–0.573**, i.e. **≈ 0.53–0.58** |

**R-236fa beats helium by a factor of about 8 on impulse density** — the 34×
density advantage overwhelms the ~4× Isp disadvantage. **Both module 28
(cold-gas principles) and module 31 (real cold-gas systems) independently derived
this and found the worksheet figure in error; this file records the corrected
values as authoritative.**

The corrected numbers make the design rule *stronger*, not weaker:

1. **Isp scales as $1/\sqrt{M}$.** Helium is 2.3× nitrogen's Isp; xenon is 0.4×.
   If the requirement is Δv per kilogram of propellant, pick light.
2. **Impulse density scales the other way, and by more than the Isp gain.**
   R-236fa stores ~8× the impulse per cubic centimetre that 241-bar helium does,
   *and* it needs only a thin-walled ~2.7-bar can instead of a 241-bar COPV. **For
   a CubeSat, the tank is the system.** That is why every flown CubeSat cold-gas
   module uses a liquefiable propellant and no launcher uses one.

### C.1.2 The stored-density column is ideal-gas and internally inconsistent

Treat the whole column as confidence **C** and do not quote a value from it
without checking NIST.

- The compressed-gas entries are **ideal-gas values**: at 241 bar and 300 K,
  $\rho = pM/(R_uT)$ gives 0.039 g/cm³ for He and 0.270 g/cm³ for N₂, which are
  the tabulated 0.04 and 0.28. Real gases at 241 bar depart from ideal by several
  percent to tens of percent — real N₂ is nearer 0.25 g/cm³ and real He is *less*
  dense than ideal because of repulsive non-ideality, not more.
- **The nitrogen row is internally impossible as written:** it gives ~0.28 g/cm³
  at 241 bar and ~0.25 g/cm³ at 300 bar. Density cannot fall as pressure rises at
  fixed temperature. One of the two is wrong (the 300-bar figure is the more
  plausible real-gas value).
- **The heavy-noble-gas entries are not ideal-gas values and are not consistent
  with the light ones.** Ideal gas at 241 bar, 300 K gives 0.81 g/cm³ for Kr and
  1.27 g/cm³ for Xe, against the tabulated 1.0 and 2.74. Xenon at 300 K is
  supercritical (Tc = 289.7 K) and genuinely far denser than ideal, so the
  tabulated figure may be closer to reality — but it is then a *different kind of
  number* from the He and N₂ entries in the same column, which is exactly the
  inconsistency to fix.

The derived ρ·Isp·g₀ column above inherits this uncertainty. The **He vs R-236fa
ratio of ~8× survives it comfortably**: even a 30% error in either density leaves
the conclusion unchanged.

### C.1.3 The 0.90 efficiency factor is the physically interesting number

Cross-checked against Wikipedia's cold-gas table (stated at 0 °C, 241 bar):
H₂ 296/272, He 179/165, N₂ 80/73, Ar 57/52, Xe 31/28 theoretical/measured. The
worksheet's He (178.1), Ar (56.4) and Xe (31.1) agree to within 1%. Its N₂ (76.8)
is 4% below their 80 and its H₂ (285.6) is 3.5% below their 296 — consistent with
them using a larger effective expansion (or expansion to zero back pressure) than
ε = 50.

**The measured/theoretical ratio of ~0.91 across that whole table is the useful
number: a real cold-gas thruster delivers about 90% of frozen-ideal Isp.** Give
ideal values and realized values separately, name the ~0.90 factor, and state T₀
and ε in the caption. The discount is where boundary layers, wall-to-gas heat
transfer and non-equilibrium expansion of a polyatomic refrigerant all show up at
once.

---

## C.2 Cold-gas systems

| system | supplier / country | years | host | propellant | thrusters | tank / regulation | thrust | Isp s | total impulse | propellant mass | system mass | Δv | conf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **MMU (Manned Maneuvering Unit)** | Martin Marietta / NASA / USA | **STS-41-B 1984-02-07** (McCandless & Stewart — first untethered EVA), STS-41-C (Solar Max), STS-51-A (Westar VI / Palapa B2 retrieval) | Shuttle EVA | **GN₂** | **24** nozzles in 4 clusters of 6, giving **6-DOF** (**A**) | 2 × aluminium tanks with Kevlar overwrap (**A**); ≈**3,000 psi (207 bar)** ground charge (**C — NEEDS PRIMARY**); **regulated**, two independent regulated systems, either alone flyable (**C**); solenoid-actuated poppet valves (**C**) | **≈ 7.6 N (1.7 lbf)** per thruster — ***derived, not sourced***: 0.091 m/s² × ~340 kg ÷ ~4 thrusters firing (**C — NEEDS PRIMARY**) | **implied ≈ 100 s — too high for GN₂; see C.2.1** | not published | **5.9 kg per tank, 11.8 kg total** (**A**) | **148 kg loaded** (**A**) | **110–130 ft/s (33.5–39.6 m/s)** on a ground charge; ≥72 ft/s (22 m/s) on an on-orbit recharge (**A**). Translational accel **0.091 m/s² (0.3 ± 0.05 ft/s²)**; rotational **10.0 ± 3.0 °/s²** (**A**) | **A** on the published figures, **C** on the derived ones — **but the set does not close, see C.2.1** |
| **SAFER (Simplified Aid For EVA Rescue)** | NASA / USA | ISS/Shuttle EVA era, in service | EVA self-rescue | **GN₂** | **24** (**A**) | **224 bar (3,250 psi)** (**A**) | **≈ 3.6 N (0.8 lbf)** per thruster (**C — NEEDS PRIMARY**) | **implied ≈ 40 s** `CALC` — **credible; see C.2.2** | not published | **1.4 kg (3 lb)** (**A**) | **37.7 kg (83–85 lb)** (**A**) | **3.05 m/s (10 ft/s)** (**A**) | **A** on the published set |
| **Gemini HHMU ("zip gun")** | NASA / USA | carried on Gemini 4, 8, 10, 11; **used on Gemini 4 (White, 1965-06-03) and Gemini 10** | Gemini EVA — **the first one** | **Oxygen** on the Gemini 4 unit (two bottles at 3,400 psi); later units used **nitrogen**, and **Freon** was used in the family (**B**) | **3 nozzles** — one pusher (aft), two tractor (on extenders) (**B**) | aluminium and stainless steel construction (**B**) | commonly quoted ~2 lbf (8.9 N) — **not confirmed in any source read** (**D**) | not published | not published | not published | **3.1 kg (6.8 lb)** (**B**) | not published | **B** on architecture; **D** on thrust |
| **Falcon 9 first-stage GN₂ ACS** | SpaceX / USA | Falcon 9 booster recovery era | Falcon 9 stage 1 | **GN₂** (**B**) | **2 clusters of 4** in the interstage region near the top of the first stage (**C**) | high-pressure **COPVs** (**C**) | **Not published by SpaceX** (**D**) | **not published** (**D**) | **not published** (**D**) | not published | not published | not published | **D — see C.2.3** |
| **MarCO MiPS (Micro CubeSat Propulsion System)** | VACCO Industries / USA (JPL mission) | MarCO-A / MarCO-B, **first interplanetary CubeSats**; launched with InSight **2018-05-05**, Mars flyby **2018-11-26** | 6U CubeSat bus | **R-236fa**, stored as a **self-pressurising saturated liquid** (**A**) | **8** — 4 canted for attitude control, 4 axial for TCMs (**A**) | **single-tank all-welded aluminium module** housing propellant, valves and electronics; **self-pressurising blowdown** at the ~2.7 bar vapour pressure — **no regulator, no high-pressure COPV** (**B**). **VACCO ChEMS** chemically-etched micro-valves, frictionless, latching/solenoid (**B**) | VACCO states **>50 mN per thruster** for its cold-gas line generally; **~25 mN** is quoted for MarCO specifically in some accounts (**C**) | **≈ 40** (consistent with the ε = 20–50 ideal of 40.6–43.2 s at ~90% efficiency) (**B/CALC**) | **755 N·s** (**A**) | not published separately | **3,490 g wet** (**A**) | **> 40 m/s** for TCMs (**A**) | **A** |
| **Standard MiPS (0.3U)** | VACCO / USA | catalogue | CubeSat | R-236fa | modular | self-pressurising | **>50 mN**/thruster | ~40 | **44 N·s**, up to **880,000 firings**; **82–515 N·s** across the modular range | not published | not published | — | **B** |
| **Micro MiPS (0.25U)** | VACCO / USA | catalogue | CubeSat | R-236fa | — | self-pressurising | **>50 mN** | ~40 | **93 N·s**, up to **1,860,000 firings** | not published | not published | — | **B** |
| **CHIPS** | CU Aerospace + VACCO (AFRL) / USA | — | CubeSat | R-134a / R-236fa / SO₂ | — | — | **30 mN** | **82** — **warm gas / resistojet, electrothermal, not pure cold gas.** The 82 s against a 43 s cold ideal *is* the entire argument for heating the gas | not published | **0.7 kg propellant** | **1.2 kg wet** | — | **B** |
| **NanoProp CGP3 / CubeProp (3U)** | GomSpace / Denmark | flown on **TW-1 (2015)** | 3U CubeSat | **n-butane** | **4**, **1 mN each, 5 μN resolution** | **self-pressurising, 1–4 bar** from butane vapour pressure | 1 mN/thruster | ~60–70 | not published | **60 g** | not published | up to **15 m/s** for a 2.66 kg satellite | **B** |
| **NanoProp 6U** | GomSpace / Denmark | flown on **GOMX-4B (2018)** — ESA's butane-propelled CubeSat, which demonstrated formation flying with GOMX-4A over ~4,500 km separation | 6U CubeSat | n-butane | not published | self-pressurising | not published | not published | not published | not published | not published | — | **B** |
| **CGMT-000-9** | Marotta Controls / USA | flew on NASA **ST-5 (2006)** | ST-5 microsatellite | **GN₂** | not published | not published | not published | not published | not published | not published | not published | — | **B** |
| **BioSentinel ACS** | Lightsey Space Research (Georgia Tech / UT Austin lineage) / USA | 6U CubeSat flown on **Artemis I (2022)** | BioSentinel | **R-236fa** | not published | not published | not published | not published | not published | not published | not published | — | **B** |
| **I2T5** | ThrustMe / France | flown 2019+ | CubeSat | **iodine, subliming** — **not strictly cold gas**; solid→vapour sublimation feed | not published | not published | not published | not published | not published | not published | not published | — | **B** |

**General envelope (NASA *State of the Art of Small Spacecraft Technology*,
confidence A `[NASA-SOA]`).** The cold-gas class is **10 μN – 3.6 N thrust** and
**40 – 110 s Isp**, with two governing trades stated explicitly: *"Lower molecular
weight gases offer higher specific impulse but require more voluminous storage"*
and *"Saturated liquids are stored at low pressure and vaporized when introduced
into a low-pressure chamber."* **The top of that Isp band (110 s) is only reachable
with warm gas (resistojet-heated), not true cold gas** — see CHIPS.

### Notes and contested figures — C.2

**C.2.1 The MMU Δv does not close.** With 11.8 kg of GN₂ at a realistic 70 s Isp,
total impulse is ~8,100 N·s; against a 340 kg combined mass (MMU + suited
astronaut) that is **~24 m/s, not the published 33.5–39.6 m/s**. Working the
published Δv backwards implies **Isp ≈ 100 s, which is too high for GN₂**. Either
the quoted Δv assumes a lighter reference mass (the MMU alone, 148 kg, gives
~55 m/s), or the tank load is larger than 11.8 kg. **The inconsistency is real and
must be resolved before any module uses MMU as a worked example.** **NEEDS
PRIMARY** — the Martin Marietta MMU description or NASA MSFC documentation.
Mention MMU for its history and its 24-thruster 6-DOF architecture, and state
plainly that the published Δv cannot be reconciled with the published propellant
load without knowing the reference mass.

**C.2.2 SAFER closes, and is the honest worked example.** 3.05 m/s × ~180 kg
(SAFER + suited crew) ÷ (1.4 kg × 9.80665) ≈ **40 s implied Isp** — *credible*: a
small, short-pulse, low-ε thruster firing in millisecond bursts loses most of the
ideal 77 s to heat transfer, non-equilibrium expansion and valve/plenum dead
volume. **Use SAFER, not MMU, as the cold-gas worked example.** The pair also makes
the design point: SAFER is a self-rescue device with a single-use budget, not a
manoeuvring unit, and its entire specification follows from "get back to the
handrail once."

**C.2.3 Falcon 9 — say only what is honest.** Falcon 9 uses GN₂ cold gas for
first-stage attitude control during the unpowered phases of the return, and the
choice is driven by three things: the thrusters must work in vacuum *and* in dense
atmosphere, must not require ignition or ullage, and must be restartable an
arbitrary number of times over a ten-minute coast. **No performance numbers should
be quoted.** SpaceX does not publish them and the figures circulating on
enthusiast sites have no traceable origin. Cold gas is rare on launch vehicles
because the impulse-to-mass penalty is severe at that scale; Falcon 9's use is the
notable exception.

**C.2.4 The Hubble / Centaur / Sputnik misattribution note — three exclusions.**

- **Sputnik 1 and the Vanguard satellites did not carry cold-gas thrusters.** No
  citable evidence was found; Sputnik 1 was uncontrolled and Vanguard 1 was
  passively stabilised. The Wikipedia cold-gas article does not mention either.
  **Remove this from the textbook outline** unless someone produces a source. The
  genuine early cold-gas milestones are the **Gemini HHMU (1965)** and the
  reaction-control systems of early attitude-controlled scientific satellites.
  Confidence **B** on the exclusion.
- **Hubble uses reaction wheels and magnetic torquers, not thrusters**, and should
  not appear in a cold-gas chapter at all. Confidence **B** on the exclusion.
- **Centaur's settling/attitude system is not cold gas in the classic sense** — it
  uses **hydrogen peroxide monopropellant** thrusters on the early vehicles and
  **hydrazine** on later ones, with gaseous hydrogen and helium for tank
  pressurisation and, on some variants, settling thrust via vented GH₂ thrusters.
  Cataloguing it properly requires the ULA Centaur documentation. Confidence **D**
  as written — **do not put Centaur in the cold-gas chapter without a primary
  source; it risks teaching a category error.** Ariane 5 EPS and the Ariane 6
  upper stages likewise use hydrazine or (Ariane 6 APU) a gas-generator system,
  not cold gas.

**C.2.5 Why MarCO matters pedagogically.** It is the proof that a 40-second-Isp
propellant is the *right* engineering answer when the constraint is volume, safety
and integration — not Δv efficiency. A GN₂ system of the same total impulse would
have needed a ~200-bar COPV and would not have fit, or passed launch-safety
review, as a secondary payload. **Propellant choice is a systems decision, not a
performance decision.** This is the single best example in the whole cold-gas part.

**C.2.6 The HHMU lesson is control authority, not performance.** A hand-held
thruster whose line of action does not pass through the combined centre of mass
produces a torque, and White reported exactly that on Gemini 4. It is the argument
for why the MMU had 24 fixed thrusters around a rigid backpack.

**C.2.7 The university/JPL lineage.** The R-236fa self-pressurising architecture
traces through JPL (MarCO, CPOD, NEA Scout) and the Lightsey group's academic work
(BioSentinel, and earlier Georgia Tech / UT Austin 3D-printed integrated
tank-and-nozzle designs). The distinguishing academic contribution is **printing
the plenum, feed passages and nozzles as one part**, which removes the joints that
dominate leak-rate budgets in a system that must hold propellant for years.
Confidence **C** — **NEEDS PRIMARY** (the SmallSat conference papers).

**C.2.8 Do-not-print list — cold gas.** MMU and SAFER thrust-per-thruster;
anything numeric about Falcon 9's GN₂ system; Centaur in a cold-gas context;
HHMU thrust; the stored-density and refrigerant-γ columns of §C.1 without a NIST
check; and the worksheet's original 7.1 / 5.8 N·s/cm³ impulse-density figures,
which are superseded by §C.1.1.

---

# Part D — "Why did they design it that way" index

One line each: the key design choice, and the module where it is discussed.
Module numbers follow the README table of contents.

| # | engine / motor | the design choice, and why | module |
|---|---|---|---|
| 1 | **V-2 (Model 39)** | Eighteen pre-mixing burner-cup injectors instead of one face, because nobody yet knew how to distribute and mix propellant across a large flat injector — and the choice caps chamber pressure and forces ~10% of the fuel into film cooling | **07** injectors (also **35**) |
| 2 | **XLR43-NA-1** | The single flat-face impinging triplet (F-O-F) replacing the V-2's 18 pots — the decisive American break, and the ancestor of every US impinging injector through the F-1 | **07** injectors |
| 3 | **Redstone A-7** | Man-rating by *subtraction*: the pneumatic system cut from 31 components to 10 by deleting check valves and consolidating regulators. Reliability came from fewer parts, not more redundancy | **14** valves and plumbing (also **33**) |
| 4 | **Atlas MA-5** | Stage-and-a-half: light all three engines on the pad and verify them before release, then drop the boosters. It solves air-start reliability by never air-starting, and pays with a badly overexpanded sustainer nozzle (220 s SL) | **33** systems engineering (also **09**) |
| 5 | **LR87 / LR91 (Titan)** | Storable hypergols so the vehicle can sit fuelled in a silo for years and start on command; the LR91's **regen chamber + ablative nozzle skirt** puts each cooling technology where it is cheapest | **11** cooling (also **05**, **08**) |
| 6 | **H-1** | Deliberately *not* high-performing: ε = 8 and pc < 700 psia, engineered for cheap repeatable mass production. Rocketdyne built hundreds, and clustering eight of them made Saturn V credible | **17** manufacturing (also **35**) |
| 7 | **F-1** | Combustion stability at 1.5 Mlbf in one chamber: 13 copper baffle compartments and the "5U(f)" pattern, reached through ~2,000 tests across 210 injector designs, and proved by detonating a bomb in the chamber and requiring damping within 45 ms | **15** combustion instability |
| 8 | **J-2** | The coaxial LOX-post injector with a porous sintered transpiration-cooled faceplate, and the series GG gas path (fuel turbine then ox turbine) that makes mixture ratio self-regulating | **07** injectors (also **12**) |
| 9 | **RL10** | Closed expander: the cooling jacket *is* the power cycle, so chamber pressure is capped by wall area (≈D²) against throat area — the expander thrust limit, and the reason RL10 never grew | **13** engine cycles |
| 10 | **RL10B-2** | An extendible carbon–carbon nozzle to package ε = 285 into an interstage sized for ε = 77, worth ~30 s of Isp for one deployment mechanism with no abort mode | **09** nozzles (also **16**) |
| 11 | **RS-25** | Reusable fuel-rich staged combustion at 206 bar with 67–109% throttling — three things no other engine has combined, at a between-flight inspection cost that ended the reusability premise | **13** engine cycles (also **11**, **16**) |
| 12 | **RS-68A** | Design for minimum cost: GG cycle, ablative nozzle, ε = 21.5, ~80% fewer parts than the RS-25, and the worst T/W of any modern large booster engine — deliberately | **33** systems engineering (also **32**) |
| 13 | **Merlin 1D** | A pintle injector at production scale: inherently stable, throttleable by design, cheap to build in the hundreds — the TRW LMDE lineage six decades on | **07** injectors (also **17**) |
| 14 | **Raptor** | Full-flow staged combustion so every gram passes through a turbine and both preburner exhausts enter the chamber — the first FFSC engine ever flown | **13** engine cycles |
| 15 | **BE-4** | ORSC deliberately run *low* at 140 bar, with hydrostatic bearings and a head-pressure start — an engine designed around reuse life rather than peak performance | **12** feed systems (also **13**, **36**) |
| 16 | **Rutherford** | Electric pump feed: brushless DC motors and batteries replace the turbine entirely, so there is no power-cycle propellant loss — at the price of parasitic battery mass that caps the approach at small vehicles | **12** feed systems |
| 17 | **Vulcain 1 → 2** | Richer mixture ratio (5.3 → 6.1) *lowers* Isp (431 → 429 s) but raises density and thrust: the optimum for a vehicle is not the optimum for an engine | **05** propellants (also **04**) |
| 18 | **Viking (Ariane 1–4)** | Water cooling — a dedicated water tank, water pump and third coaxial pump on the shaft — because the hypergolic fuel is a poor coolant. The canonical "there are more than four cooling methods" case | **11** cooling |
| 19 | **LE-5A / LE-5B / LE-9** | Expander *bleed*: heat part of the fuel in the jacket, run the turbine, dump it overboard. A small Isp loss buys escape from the closed expander's thrust ceiling — which is how LE-9 reaches 1,471 kN | **13** engine cycles |
| 20 | **LE-7 → LE-7A** | Chamber pressure *reduced* from 127 to 120 bar after a turbopump inducer failure: performance traded for margin, plus a redesigned nozzle to fix start-transient side loads | **34** failure case studies (also **09**) |
| 21 | **RD-253 / RD-170 family** | Oxidizer-rich staged combustion at 147–245 bar, made survivable by an inert enamel coating on every surface touching hot ox-rich gas — the technology the West could not copy for decades; and multiple chambers per turbopump because instability in one big chamber was unsolved | **16** materials (also **13**, **15**) |
| 22 | **RD-0120** | Single-shaft fuel-rich staged combustion, and stability without the RS-25's acoustic resonance cavities — proof that the SSME's dual-shaft complexity was a choice, not a necessity | **13** engine cycles (also **15**) |
| 23 | **Apollo SPS (AJ10-137)** | Single-string criticality handled by *removing mechanisms*: pressure-fed, hypergolic, no igniter, no turbopump, no valve that must move more than once | **33** systems engineering (also **14**) |
| 24 | **LMDE (Apollo LM descent)** | The variable-area pintle: a movable sleeve keeps injection velocity and mixing constant across a 10:1 chamber-pressure turndown — and the 60–100% band was still forbidden because of nozzle erosion | **07** injectors (also **03**) |
| 25 | **R-4D** | A materials history in one thruster: molybdenum → silicide-coated niobium → iridium-lined rhenium, each step raising wall temperature, cutting the film-cooling fraction and buying ~10 s of Isp | **16** materials (also **10**) |
| 26 | **Bristol Siddeley Gamma** | HTP over a silver-gauze catalyst pack *is* the ignition system — no igniter, no hypergolic slug, non-cryogenic and non-toxic, at 250–265 s | **08** ignition (also **05**) |
| 27 | **XLR99 vs AR2-3** | Two opposite throttling architectures: XLR99 and AR2-3 throttle by turbopump speed off a single pilot lever; the LMDE throttles by injector area. Same requirement, opposite mechanism | **12** feed systems (also **07**) |
| 28 | **Shuttle SRB field joint** | The tang-and-clevis joint *rotated* under ignition pressure, so the seal was rate-dependent and therefore temperature-dependent. The RSRM fix was a capture feature to stop the rotation — not a better O-ring | **22** cases (also **34**) |
| 29 | **Shuttle SRB grain** | An 11-point star in the forward segment and double-truncated-cone perforations aft, shaped to hold the thrust trace inside the max-Q structural box | **21** grain geometry |
| 30 | **P120C vs Shuttle SRB** | Monolithic filament-wound composite case, mass fraction 0.924 against 0.85 for segmented steel. Segments exist to be shipped by rail; if you can cast in one piece, do | **22** cases (also **25**) |
| 31 | **UA1205 → SRMU (Titan IV)** | One vehicle, one job, one diameter class, four simultaneous generation changes: PBAN→HTPB, steel→graphite/epoxy, LITVC→gimballed nozzle, 5–7 segments→3. About +14 s Isp and a large inert-mass saving | **26** historical large solid motors |
| 32 | **PSLV S139** | SITVC with aqueous strontium perchlorate — liquid-injection TVC with a dense, cheap, non-toxic injectant, which lets a very large motor keep a fixed nozzle | **24** solid rocket nozzles |
| 33 | **Star 48B** | Two nozzles, one motor: ε 47.7 (short, to fit the PAM-D cradle) gives 286.2 s, ε 54.8–70.4 (long) gives 292.2 s. Isp is a property of the motor *and* its nozzle | **24** solid rocket nozzles (also **03**) |
| 34 | **Peacekeeper / IUS / M-34b** | Extendable exit cones let a stage carry a high-ε nozzle inside a length-limited silo or interstage, buying ~10–15 s of Isp for a deployment mechanism | **27** defense propulsion (also **24**) |
| 35 | **Minuteman III stage 3** | Thrust-termination ports: shaped charges open the forward dome to drop chamber pressure and stop the motor. A solid *can* be shut down — violently, once, destructively | **27** defense propulsion (also **19**) |
| 36 | **Trident D-5** | Kevlar→graphite/epoxy cases for two stated reasons: inert-weight reduction *and* eliminating the electrostatic potential difference between Kevlar and graphite. Also: the "aerospike" is a nose drag spike, not a nozzle | **22** cases (also **27**) |
| 37 | **Scout upper stages** | Spin stabilisation instead of TVC on stages 3 and 4: delete the actuators, hydraulics and mass, and pay in injection accuracy | **24** solid rocket nozzles (also **26**) |
| 38 | **Vega-C Zefiro 40 (VV22)** | A carbon–carbon throat-insert supplier change eroded unexpectedly and destroyed a launch vehicle — a materials qualification decision in a subcomponent | **34** failure case studies (also **24**, **25**) |
| 39 | **GEM-46 vs GEM-40** | 43% more propellant and *less* peak thrust, because the burn is longer — a trajectory-driven choice, not a transcription error | **20** burn rate (also **21**) |
| 40 | **MarCO / VACCO MiPS** | A 40-second-Isp refrigerant beats helium ~8× on impulse density and needs a 2.7-bar can instead of a 241-bar COPV. For a CubeSat the tank is the system | **31** real cold-gas systems (also **28**, **30**) |
| 41 | **SAFER vs MMU** | SAFER's ~40 s implied Isp is credible for millisecond pulses at low ε; MMU's published Δv implies ~100 s from GN₂ and does not close. Use the one whose numbers close | **29** cold-gas performance modeling (also **31**) |
| 42 | **CHIPS** | Heating the same refrigerant takes 43 s to 82 s — the entire argument for a resistojet, and the boundary of what "cold gas" means | **28** cold-gas principles (also **30**) |

---

# Part E — Source tags

Every short tag used in the two worksheets, with its expansion and the URL as
given there, so `reference/sources.md` can absorb them without going back to the
worksheets. Tags in the first table are the worksheet's own short forms; the
second table lists the recurring long-form sources of the liquid worksheet, which
used no short tags, so they can be given tags in `sources.md`.

## E.1 Short tags defined in `_verify-solid-coldgas.md`

| tag | expansion | URL / locator |
|---|---|---|
| `[NASA-SRB]` | NASA Space Shuttle SRB news reference / fact sheet material — propellant composition, grain, burn time | science.ksc.nasa.gov STS news reference (**503 during the pass**; web.archive.org unreachable from this environment) |
| `[NASA-SLS-SRB]` | NASA SLS Solid Rocket Booster reference page | nasa.gov/reference/space-launch-system-solid-rocket-booster/ ; plus the NASA SLS SRB fact sheets (2015 and 2024 revisions) |
| `[NG-BOLE]` | Northrop Grumman BOLE DM-1 press material | news.northropgrumman.com |
| `[NG-COMM]` | Northrop Grumman commercial rocket motors product pages (GEM family, Star family) | northropgrumman.com product pages; the *Propulsion Products Catalog* PDF would not text-extract in this environment |
| `[ESA-EAP]` | ESA Ariane 5 boosters (EAP) page | esa.int Ariane 5 boosters (EAP) — **403 from this environment**; values used came from search-result extracts, hence conf **B** at best. Also ESA Bulletin 104, *First Test Firing of an Ariane-5 Production Booster*, esa.int/esapub/bulletin/bullet104/gonzalez104.pdf |
| `[JM-LV]` | J. McDowell, *General Catalogue of Artificial Space Objects* / launch-vehicle motor lists | planet4589.org |
| `[EA]` | Encyclopedia Astronautica (astronautix.com) — **secondary, known to propagate errors**; 503 on all direct fetches during the pass, usable via search summaries only | astronautix.com |
| `[WP]` | Wikipedia — used only where the article cites a source, and flagged as such | en.wikipedia.org |
| `[FAS]` | Federation of American Scientists / GlobalSecurity nuclear-forces pages | fas.org, globalsecurity.org |
| `[NASA-SOA]` | NASA *State of the Art of Small Spacecraft Technology*, propulsion chapter (ch. 4, In-Space Propulsion) | nasa.gov small spacecraft technology state-of-the-art report |
| `[VACCO]` | VACCO Industries CubeSat propulsion data sheets | cubesat-propulsion.com system pages; plus the JPL MarCO data sheet |
| `[CALC]` | Computed in the worksheet from stated inputs; the cold-gas script is archived under `propulsion/tools/` — reproduce before quoting | — |
| `[Rogers Commission]` | *Report of the Presidential Commission on the Space Shuttle Challenger Accident*, Vol. I ch. IV (field joint, O-ring seal dynamics, STS-51-L failure) | — |
| `[JAXA]` | JAXA / ISAS / MHI published programme material — cited in prose in both worksheets (LE-7A, LE-9, H3, M-V, Epsilon) as a **pointer only**; **no URL is given in either worksheet** and the ISAS/JAXA M-V papers are recorded as **NEEDS PRIMARY** | — (to be supplied when the primary is read) |

Additional short-form sources named in the solid worksheet without a bracket tag,
worth tagging in `sources.md`: **NASASpaceflight** (nasaspaceflight.com/2025/06/bole-dm1-test/,
BOLE DM-1 coverage), **Avio** product pages (P120C, Vega, Zefiro), **GomSpace**
propulsion white paper, **ESA GOMX-4B** mission pages, **CU Aerospace** CHIPS
product page, and the **ESA/Arianespace independent enquiry commission** press
release on Vega-C VV22 (**NEEDS PRIMARY**).

## E.2 Recurring sources in `_verify-liquid.md` (untagged in the worksheet)

| proposed tag | source | URL / locator |
|---|---|---|
| `[EH]` | enginehistory.org, *Rocket Propulsion Evolution* — §3 Navaho (V-2 Model 39/39a, XLR43), §4.2 Redstone Engine, §8.11 F-1 Engine | enginehistory.org/Rockets/RPE03/RPE03.shtml ; /RPE04/RPE04-2.shtml ; /RPE08.11/RPE08.11.shtml |
| `[HR]` | heroicrelics.org — LR-105 cut-away, LR-89 injector, F-1 thrust chamber, RD-107 photos, Rocketdyne engine family tree | heroicrelics.org/info/atlas/lr-105-cut-away.html ; /info/f-1/f-1-thrust-chamber.html (**503 on some pages during the pass**) |
| `[L3H]` | L3Harris Aerojet Rocketdyne product pages — RL10 and RS-25 datasheets (the manufacturer figures for RS-25 thrust, Pc, Isp, ε 69:1, dry mass 7,775 lb, and the RL10 family table) | l3harris.com/all-capabilities/rl10-engine ; l3harris.com/all-capabilities/rs-25-engine |
| `[NASA-SSME-OR]` | NASA/Rocketdyne, *Space Transportation System Training Data: Space Shuttle Main Engine Orientation* — **the document to read for the expansion-ratio question** | large.stanford.edu/courses/2011/ph240/nguyen1/docs/SSME_PRESENTATION.pdf (**503 during the pass**) |
| `[NTRS-20140011656]` | NASA, *Waking a Giant: Bringing the Saturn F-1 Engine Back to Life* — **the document to read for F-1 chamber pressure** | ntrs.nasa.gov/api/citations/20140011656/downloads/20140011656.pdf (retrieved as binary; not text-extractable in the pass) |
| `[NTRS-20100034922]` | NASA, *The J-2X Upper Stage Engine: From Design to Hardware* — for the 1,332 vs 1,337 psia question | ntrs.nasa.gov/api/citations/20100034922/downloads/20100034922.pdf |
| `[NASA-CR-190786]` | NASA CR-190786, *An RL10A-3-3A Rocket Engine Model* | ntrs.nasa.gov/api/citations/19950017370/downloads/19950017370.pdf |
| `[NASA-TM-107318]` | NASA TM-107318, *RL10A-3-3A Rocket Engine Modeling Project* | ntrs.nasa.gov/api/citations/19970010379/downloads/19970010379.pdf |
| `[N91-28200]` | NASA N91-28200, *Space Shuttle Propulsion Systems* — the R-40 280 s at ε = 22 figure | ntrs.nasa.gov/api/citations/19910018886/downloads/19910018886.pdf |
| `[NTRS-20000033615]` | NASA MSFC, W. E. Anderson, *Peroxide Propulsion at the Turn of the Century* — AR2-3 context | ntrs.nasa.gov/api/citations/20000033615/downloads/20000033615.pdf |
| `[AIAA-99-2738]` | *AR2-3 engine refurbishment and gas generator testing* | AIAA 99-2738 |
| `[AIAA-1980-1131]` | *Space Shuttle RCS Thruster Propellant Leak Detection* | AIAA 1980-1131 |
| `[RL10B2-CC]` | *Testing of the RL10B-2 carbon–carbon nozzle extension* (AIAA / Acta Astronautica) — the 77:1 → 285:1 figures | sciencedirect.com/science/article/abs/pii/S0094576501001783 |
| `[ESA-VULCAIN]` | ESA, *Ariane 5 Vulcain engine* | esa.int/Enabling_Support/Space_Transportation/Ariane/Ariane_5_Vulcain_engine |
| `[EUCASS-2019-481]` | *VINCI®, the European reference for Ariane 6 upper stage*, EUCASS 2019 | eucass-proceedings.eu/articles/eucass/pdf/2019/01/eucass2019_481.pdf |
| `[eoPortal-A6]` | eoPortal, *Ariane 6* | eoportal.org/other-space-activities/ariane6 |
| `[SLR-F9]` | Space Launch Report, *Falcon 9 data sheet* | sma.nasa.gov/LaunchVehicle/assets/space-launch-report-falcon-9-data-sheet.pdf |
| `[Braeunig]` | Braeunig, *Space Launchers* — Atlas and Titan specification pages | braeunig.us/space/specs/atlas.htm ; /titan.htm (**503 during the pass**) |
| `[NASM]` | Smithsonian NASM collection records — e.g. A19700252000, *Rocket Engine, Liquid Fuel, A-7, Redstone Missile*; Gemini 4 HHMU | airandspace.si.edu collection records |
| `[NASA-MSFC-MR]` | NASA MSFC, *Mercury-Redstone Launch Vehicle* | nasa.gov/centers-and-facilities/marshall/mercury-redstone-launch-vehicle/ |
| `[FAA-SS]` | FAA Starship licensing and environmental documents — the only independent corroboration of Raptor thrust | FAA licensing / environmental record |

Also cited as pointers in the liquid worksheet, for `sources.md` to reconcile
against its existing bibliography: SpaceX Falcon 9 users' guide; Blue Origin and
ULA product statements; Rocket Lab published and investor material;
NPO Energomash and RD AMROSS material; Artemis Project, *Kaiser Marquardt Rocket
Engines*; Everyday Astronaut, *Engine Cooling*; *Propulsion for the 21st Century —
RS-68* (AIAA/Rocketdyne); *Development Status of the Vulcain 2 Engine* (AIAA);
NASASpaceFlight, *On the 50th anniversary of Black Arrow*.

## E.3 Sources that failed to load during the verification passes

`astronautix.com` (503 on all direct fetches; usable via search summaries only —
and it is the only secondary source with per-variant Soviet engine coverage),
`braeunig.us` (503), `heroicrelics.org` (503 on some pages), the
`large.stanford.edu` SSME PDF (503), the ESA EAP page (403), the NASA STS news
reference at `science.ksc.nasa.gov` (503, with web.archive.org unreachable), the
Northrop Grumman *Propulsion Products Catalog* and NASA SLS SRB fact-sheet PDFs
(would not text-extract; the SLS extraction was visibly corrupted), and NTRS PDFs
generally, which returned binary rather than extracted text. All are worth
retrying.

---

*Compiled from `_verify-liquid.md` and `_verify-solid-coldgas.md`, both dated
2026-09-02. A figure enters a module only after its confidence reaches B or better
and its per-motor/per-vehicle and max/avg qualifiers are attached. Where this file
says "not published", the module says "not reliably published" — never a guess.*
