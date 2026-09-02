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
