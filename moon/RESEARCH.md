# SELENE — research notes

Every constant the simulation uses, with its source. Anything that could not
be confirmed from a primary source is marked **UNVERIFIED** and is used only
as an explicitly labelled estimate, never presented as measured fact.

Compiled 2026-09-08 from NASA PDS, NAIF, NTRS, LROC/ASU, USGS, the Apollo
Lunar Surface Journal, JPL Horizons and the peer-reviewed literature.

---

## 1. Frames, datum, constants

| quantity | value | source |
|---|---|---|
| Reference frame for all lunar data | Mean Earth / Polar Axis (ME) of DE421; planetocentric latitude; longitude positive east | LRO Project & LGCWG white paper, *A Standardized Lunar Coordinate System for the Lunar Reconnaissance Orbiter and Lunar Datasets*, Ver. 5, 2008-10-01: "LRO instrument teams shall deliver data to the PDS with planetocentric coordinates in the ME reference system only" |
| ME ← PA rotation (DE421) | angles (67.92″, 78.56″, 0.30″) about axes (3, 2, 1); total 0.0288473° | NAIF `moon_080317.tf`, frame `MOON_ME_DE421` (31007) |
| Surface displacement of that rotation | **≈ 875 m** | same kernel: "equivalent to approximately 875 m when expressed as a displacement along a great circle on the Moon's surface" |
| DE440 ME realisation vs DE421 ME | ≤ 3.07 × 10⁻⁷ rad ≈ **0.53 m** (2000–2040) | NAIF `moon_de440_250416.tf`; Park et al. 2021, AJ 161:105 |
| PA vs ME axes | "differ by about 1 km at the lunar surface" | LGCWG white paper §6.2 |
| Reference sphere / elevation datum | 1737.4 km (`OFFSET = 1737400.` m; height = DN × 0.5 m) | LOLA GDR label `ldem_16.lbl` |
| GM | 4902.80011526323 km³/s² | GRAIL GRGM1200A label, PDS `gggrx_1200a_sha.lbl` |
| Surface gravity | ≈ 1.62 m/s²; total variation over the surface ≈ 1.6 % | derived from GM/r²; Wikipedia *Gravitation of the Moon* (secondary) |
| Mascon anomaly magnitude | "increase the force of gravity by one-half percent" | Wikipedia *Mass concentration (astronomy)* (secondary; consistent with 0.5 % g ≈ 800 mGal) |
| Sun angular diameter from the Moon | 31′27″ – 32′32″ (0.524° – 0.542°) | Wikipedia *Angular diameter* (secondary) |
| Earth angular diameter from the Moon | 1°48′ – 2°00′ | same |
| Earthshine irradiance at full Earth | **≈ 0.15 W/m², about 0.01 % of solar** | Glenar et al. 2019, Icarus 321:841 (NTRS 20190001705) |
| Earth apparent magnitude from the Moon (max) | −17.7 | Wikipedia *Earthlight (astronomy)* (secondary) |
| Bond albedo of the Moon | 0.136 | Wikipedia *Moon* (secondary) |

**Ephemeris ground truth.** `data/fixtures/horizons.json` holds 240 observer
tables generated from the JPL Horizons API (`CENTER='coord@301'`,
`APPARENT='AIRLESS'`) for 10 sites × 12 epochs: Sun and Earth azimuth,
elevation, illuminated fraction, angular diameter and range, plus the Moon's
sub-Earth and sub-solar points. Example, Apollo 11 landing
(1969-07-20 20:17 UTC, 0.67415°N 23.47314°E): **Sun azimuth 88.81°,
elevation 10.70°.** `moon/test/ephemeris.test.mjs` checks the in-game series
against every row.

---

## 2. Apollo 11 / Tranquility Base

Coordinates in the ME frame.

| item | value | source |
|---|---|---|
| LM *Eagle* descent stage | **0.67415°N, 23.47314°E**, radius 1 735 471 m → **−1929 m** | Wagner, Speyerer, Robinson et al. 2012, ISPRS Archives XXXIX-B4:517, Table 2 (17 LROC NAC images) |
| Davies & Colvin 2000 value | 0.67416°N, 23.47314°E — differs by **2.2 m in latitude, 5.3 m in longitude** | same paper, "Delta Davies" column |
| Laser Ranging Retroreflector | 0.673440°N, 23.473073°E, r = 1 735 472.7 m (≈ −1927 m); **≈ 22 m SSW of the LM**, bearing ≈ 185° | Williams et al. 2008 via Wagner 2012 Table 1; ALSJ: "60 feet (18 meters) from the center of the minus-Y (southern) foot pad" |
| Passive Seismic Experiment (PSEP) | 0.67322°N, 23.47315°E — **≈ 28 m south** of the LM | Wagner 2012 Table 2; ALSJ "about 80 feet (24 meters)"; placed "behind the large rock to shield the experiment from the effects of liftoff" (Apollo 11 PSR SP-214 p. 27) |
| TV camera | ≈ 20 m north-west, "the length of the cable" | ALSJ `a11.step.html` |
| US flag | ≈ 8 m ("about 27 ft") from the LM centreline; staff penetrated only "6 to 8 in." | Aldrin's report via *Lunar Flag Assembly*; PSR SP-214 p. 35 |
| Flag today | **knocked over by the ascent engine** — LRO sees no flag at Apollo 11, unlike 12, 16 and 17 | NASA/LROC 2012 (secondary) → the game renders it fallen |
| Solar Wind Composition experiment | on the PSR site map (Fig. 3-15/3-16), no numeric offset published — **UNVERIFIED**, placed from the map and labelled approximate | PSR SP-214 pp. 47–48 |
| Both PLSS backpacks + jettison bag | tossed from the porch, near the +Z (west) footpad | ALSJ `a11.posteva.html`; PSR Fig. 3-16 |
| LM orientation | ladder on the **west** strut; −Y strut south, −Z strut east; landing yaw **+13.3°** | ALSJ `a11.step.html`, `a11.postland.html` |
| Little West crater | **33 m diameter, ≈ 60 m east**; Armstrong's farthest excursion, ~120 m round trip in 3 min 15 s | PSR SP-214 p. 40; LROC; ALSJ |
| West crater | 180 m diameter, 30 m deep, ≈ 400 m east, blocky rays with 2–3 m rocks | PSR SP-214 p. 38 |
| Boulder field | "many boulders averaging at least 2 ft in diameter… several hundred feet north" | PSR SP-214 p. 33 |
| Footpad penetration | 1–3 in. (2.5–7.5 cm); probes and pads "skidded along the surface", dragged south | PSR SP-214 pp. 35, 46, 89 |
| Engine-plume erosion | "swept ground does not appear to extend much past the footpads"; the predicted 5–6 ft erosion crater was **not** formed | PSR SP-214 pp. 35, 45–46, 77 |
| Regolith depth at the site | ≈ 5 m (3–6 m from crater depths) | PSR SP-214 pp. 6, 42 |
| Bearing pressure | ≈ 1 psi (7 kPa) | PSR SP-214 pp. 44–45 |
| Geologic unit | `Im2`, Upper Mare Unit, Imbrian | USGS Unified Geologic Map, queried via Trek at 0.67408°N 23.47297°E |
| Local elevation cross-check | Trek LOLA 128 ppd identify: **−1928 m**; vendored LOLA 16 ppd pixel: **−1915 m** | this repo's own probes, 2026-09-08 |

---

## 3. Landing sites and landmarks

Full table in `data/sites.json` (with a `verify` flag on rows whose only source
is secondary). Key rows:

| site | lat | lon (+E) | status | source |
|---|---|---|---|---|
| Apollo 11 LM | 0.67415 | 23.47314 | success | Wagner 2012 |
| Apollo 12 LM | −3.01271 | −23.42193 | success | Wagner 2012 (σ ≈ 12 m) |
| Apollo 14 LM | −3.64590 | −17.47195 | success | Wagner 2012 (±1 m) |
| Apollo 15 LM | 26.13237 | 3.63330 | success | Wagner 2012 |
| Apollo 16 LM | −8.97344 | 15.50105 | success | Wagner 2012 (σ ≈ 12 m) |
| Apollo 17 LM | 20.19108 | 30.77220 | success | Wagner 2012 (σ ≈ 15 m) |
| Lunokhod 1 (final) | 38.315158 | −35.007964 | ended 1971 | Murphy et al. 2011, Table 3 (laser ranging) |
| Lunokhod 2 (final) | 25.832307 | 30.922149 | ended 1973 | Wagner 2012 Table 1 |
| Chang'e 4 | −45.4446 | 177.5991 | operating | Liu et al. 2019 (LROC: −45.4561 / 177.5885) |
| Chandrayaan-3 Vikram | −69.373 | 32.319 | success, ended | ISRO |
| SLIM | −13.3160 | 25.2510 | success, **landed nose-down at ~90°** | NASA/JAXA |
| IM-1 *Odysseus* | −80.13 | 1.44 | **tipped over**, 12° slope | LROC |
| Blue Ghost Mission 1 | 18.5623 | 61.8103 | success, ended 2025-03-16 | LROC |
| IM-2 *Athena* | −84.7906 | 29.1957 | **on its side in a 20 m crater** | LROC |
| ispace *Resilience* | 60.4445 | −4.5880 | **crashed 2025-06-05** | LROC |

No lunar landing between mid-2025 and 2026-09-08 was confirmed: Blue Ghost
Mission 2, Astrobotic Griffin, IM-3 and Chang'e 7 had all slipped to late
2026 or 2027 at the time of writing (**UNVERIFIED** against news wires).

Natural landmarks come from the IAU Gazetteer via `data/names.json` (8985
features), e.g. Tycho 86.2 km at −43.310/−11.362, Copernicus 96.1 km at
9.621/−20.079, Shackleton 21.0 km at −89.626/132.322, Mare Tranquillitatis
875.7 km at 8.349/30.835. Lava-tube skylights: Marius Hills pit
14.0917/−56.7701, 40 m deep; Mare Tranquillitatis pit 8.3355/33.222, 105 m
deep (LROC Lunar Pits Atlas).

South-pole illumination: Shackleton rim sites are lit ~94 % of a lunar year;
de Gerlache ridge ~85 %; Malapert ~74 % (Speyerer & Robinson 2013; Bussey et
al. 2010 — both via secondary sources here).

---

## 4. Surface optics

| quantity | value | source |
|---|---|---|
| Photometric model | Hapke; LROC WAC Hapke parameter maps (w, b, c, B_C0, h_C, B_S0, h_S, θ̄, φ) exist at 1°×1°, 70°N–70°S, seven wavelengths | Sato et al. 2014, JGR Planets 119:1775; LROC RDR `WAC_HAPKEPARAMMAP` |
| Numerical mare/highland Hapke values | **UNVERIFIED** (paper paywalled). SELENE uses Lommel–Seeliger × Henyey–Greenstein backscatter (g ≈ −0.25) × an opposition surge, normalised to Lambert at 30° phase, labelled ESTIMATED | — |
| Simpler models | lunar-Lambert / Minnaert are accepted approximations of Hapke | McEwen 1991 (NTRS 19910063812) |
| Normal albedo, mare vs highlands | ≈ 0.07–0.10 vs 0.12–0.18 — **UNVERIFIED**, treated as approximate | literature consensus |
| Stars from the sunlit surface | invisible: "The astronauts' eyes were adapted to the sunlit landscape… could see stars with the naked eye only when they were in the shadow of the Moon" | secondary; drives the auto-exposure model |
| Apollo Hasselblad exposure settings | **UNVERIFIED** | — |

---

## 5. Regolith mechanics

Primary source: Apollo Soil Mechanics Experiment S-200 final report (Mitchell
et al., NTRS 19740019219).

| quantity | value |
|---|---|
| Bulk density vs depth | ρ = 1.27 + 0.121 ln(z + 1) g/cm³ (z in cm) → 1.27 surface, 1.60 at 15 cm, 1.77 at 60 cm |
| Averages | 1.50 (0–15 cm), 1.58 (0–30 cm), 1.74 (30–60 cm) g/cm³ ± 0.05 |
| Porosity from footprints | 43–45 % (relative density 61–68 %) |
| Friction angle | 35–50°, higher at lower porosity |
| Cohesion | 0.1–1.0 kPa |
| Footprint depth | "a small fraction of an inch — maybe an eighth of an inch" on firm intercrater ground (Armstrong); deeper on crater rims |
| LM footpad penetration | up to 7–8 cm (Apollo 12 mission report) |
| LRV wheel sinkage | ≈ 1.25 cm average, up to 5 cm at fresh crater rims |
| Regolith thickness | ~2 m under young maria to ~20 m in the oldest highlands (secondary) |
| Crater equilibrium size–frequency | cumulative power law, exponent **−1.83** on the maria | Hartmann & Gaskell (NTRS 19940011749) |
| Ejecta blanket | modelled "feathering out to a distance of 4 crater radii" | same |
| Simple → complex crater transition | 10–30 km | Pike 1977 (NTRS 19780060140) |
| Thermal inertia of fines | 55 ± 2 J m⁻² K⁻¹ s⁻½ at 273 K; density 1100 → 1800 kg/m³ with a ~7 cm scale height | Hayne et al. 2017 |
| Median grain size, < 20 µm fraction, angle of repose | **UNVERIFIED** here (Lunar Sourcebook ch. 9 unreachable); ~60–80 µm and 10–20 wt % in the literature |

---

## 6. Dust

| finding | source |
|---|---|
| **"Even submicron particles do not stay suspended. All particles display ballistic motion, falling at the same rate regardless of their size. Thus, there was no enduring cloud of dust when the LM landed, just a racing of particles out radially from the thrust point, which settled out almost immediately."** | Gaier 2005, NASA/TM-2005-213610 |
| Nine categories of Apollo dust problems: vision obscuration, false instrument readings, coating and contamination, loss of traction, clogging, abrasion, thermal control, seal failures, inhalation | Gaier 2005 |
| 11 % dust coverage doubles a radiator's solar absorptance | Gaier 2005 |
| "Distinctive, pungent odor… a bit like gun powder" | Gaier 2005 (Scott) |
| LRV rooster tails, worst when turning or breaking traction | Gaier 2005; ALSJ Apollo 16 "Grand Prix": "There's a big rooster tail out of all four wheels… The back end breaks loose just like on snow" |
| Landing plume: dust ejection angle **1–3°**, particle density 10⁸–10¹³ /m³, ejecta of 10–15 cm objects | Immer/Metzger et al. (NTRS 20130012063; arXiv 2104.07669) |
| Plume ejecta speeds > 2 km/s; ~10 % of the dust between 1.7 and 2.3 km/s reimpacts | NTRS 20205003590 / 20205007522 |
| No saltation: "eroded particles lifted higher in the boundary layer do not impact the surface for kilometers (if at all; some leave the Moon entirely)" | Metzger 2024, arXiv 2403.18583 |
| Apollo 11 landing: dust seen from ~120 ft, "a transparent sheet of dust resembling a thin layer of ground fog that moved radially outward" | Apollo 11 PSR via Gaier 2005 |
| Electrostatic transport really is tiny: LADEE LDEX saw 0.4–4 × 10⁻³ grains/m³ | Elphic et al. 2016 (NTRS 20160000571) |
| Surveyor horizon glow: ~6 µm grains, 3–30 cm above the surface, hops of 6–60 cm | NTRS 19730035060 and related |

SELENE therefore renders dust as strictly ballistic particles with no drag, no
billowing and no lingering cloud, plus a gradual wear/tint on boots, lower
suit and rover.

---

## 7. Thermal (Diviner)

| quantity | value | source |
|---|---|---|
| Equatorial maximum | 387–397 K | Williams et al. 2017, Icarus 283 |
| Pre-dawn minimum | ≈ 95 K | same |
| Dusk vs dawn terminator | dusk ≈ 30 K warmer | same |
| Rocky areas at night | > 50 K warmer than fines | same |
| Permanently shadowed regions | as low as ~25 K (Hermite ≈ 26 K) | UCLA Diviner; secondary |
| Sunlit polar crater rims | ≈ 220 K | UCLA Diviner |
| Product | 0.5° global grid at 0.25 h local-time resolution | Williams et al. 2017 |
| Cross-check at Tranquility Base | Trek `diviner_tbol_max` = **395.6 K**, `diviner_tbol_min` = **95.2 K** | this repo's probe |
| Latitude/local-time functional fit | **UNVERIFIED** (paper full text unreachable) — the game interpolates the measured max/min/noon/midnight grids instead of using a formula | — |

---

## 8. Locomotion at 1/6 g

| quantity | value | source |
|---|---|---|
| Walk → lope/run transition | Froude number **0.37 ± 0.11** (≈ 0.75 m/s at 1/6 g) | Carr & McGee 2009, PLoS ONE; Lacquaniti et al. 2017 |
| Gait census from Apollo film (38 events) | 10 walking, 10 loping, 18 running | Carr & McGee |
| Armstrong's run | ≈ 3.2 km/h (0.89 m/s) | Carr & McGee |
| Loping | "a kind of slow running with a high, long, prolonged aerial phase… energetically optimal under reduced gravity" | Lacquaniti et al. 2017 |
| Falls | "Falls or saved falls were frequent during the EVAs" | Lacquaniti et al. 2017 |
| Max speeds | ≈ 60 % of terrestrial; stepping rate about half of Earth's at 2–3 m/s | Hewes 1967, NASA Langley (NTRS 19680027073) |
| Metabolic rate running (Apollo 16) | 326 W and 429 W | Carr & McGee |
| Suited jump heights | **UNVERIFIED** as a measured number |

## 9. Vehicles

**Apollo LRV** (the honest baseline the fictional rover is scaled from):
210 kg empty, 440 kg payload, four 0.19 kW motors with 80:1 harmonic drives,
36 V silver-zinc batteries (2 × 121 A·h), 81 cm wire-mesh wheels 23 cm wide,
36–43 cm ground clearance, 2.3 m wheelbase, 10 km/h design speed, **18 km/h
record** (Cernan, Apollo 17), 8.2 km/h average, slopes to 18° up / 20° down,
traverses of 27.8 / 26.6 / 35.9 km on Apollo 15/16/17 (Apollo 17 Mission
Report JSC-07904; LRV Operations Handbook).

**NASA Space Exploration Vehicle**: 2 crew (4 in emergency), ~10 km/h,
suitports giving egress "in less than 10 minutes with minimal gas loss",
safe haven for 72 hours; the Lunar Electric Rover field article measured
10.8 m³ interior / 8.6 m³ net habitable, and the crew said that was *too
much* volume for two weeks (NASA FS-2011-08-045-JSC; NTRS 20100009798).

**Toyota/JAXA Lunar Cruiser**: 13 m³ living space, 2 crew, > 10 000 km range
(JAXA, 2019).

## 10. Suit and life support

| quantity | value | source |
|---|---|---|
| Apollo -7 PLSS | O₂ 1.78–1.94 lb (0.81–0.88 kg) loaded, 1.33–1.6 lb consumed per EVA; feedwater 5.5–5.8 kg; battery 25.4 A·h; redlines 0.37 lb O₂ / 0.91 lb water / 3.28 A·h | Apollo 17 Mission Report, Table 9-II |
| Longest Apollo EVA | 7 h 37 min (Apollo 17 EVA-2); 22 h 4 min total | same |
| Apollo duration vs workload | 8 h at 930 BTU/h, 6 h at 1200, 5 h at 1600 | Campbell, NTRS 20120009158 |
| O₂ consumption implied | **≈ 0.08–0.10 kg/h** at Apollo work rates | derived from Table 9-II |
| Apollo OPS (emergency) | ~5.8 lb O₂ at 5880 psia, 30 min at high flow | Campbell |
| ISS EMU | 4.3 psid suit pressure; 8 h + 30 min reserve; SOP 2.5 lb O₂, 30 min; METOX scrubs ~1.6 lb CO₂; battery 450–540 W·h | Campbell |
| Artemis xEMU / AEMU | 8 h at 1200 BTU/h; primary O₂ ~1.8 lb at 3000 psia; set pressures 4.1–8.4 psid; Rapid Cycle Amine CO₂ removal; ~10 lb feedwater | Campbell; NTRS 20250004031 |
| CO₂ limits | 7.6 mmHg nominal, 15.2 mmHg heavy exertion; flight rule: no action below 3 mmHg, purge at 8 mmHg or with symptoms, purge unconditionally at 12.4 mmHg | Conkin et al., NASA/TP-2019 (NTRS 20200002093) |
| Hypercapnia | few symptoms and no performance loss up to ~15 mmHg; headache/dyspnea/fatigue plateau after ~40 min | same |
| Hypoxia / vacuum | consciousness for ~9–14 s after sudden loss of pressure; "rapid and complete recovery is normal for exposures shorter than 90 seconds" | secondary (Landis via Wikipedia); used only to time a fade-to-black, never depicted graphically |
| Exploration atmosphere | 8.2 psia / 34 % O₂ cabin, 4.3 psia suit, 20 min prebreathe at 85 % O₂ | NTRS 20240003211 |
| Habitable volume guidance | 25 m³ per person minimum for long duration; crew quarters 5.4 m³; Apollo LM cabin 6.7 m³ (4.5 m³ habitable) | NTRS 20140016951 |

## 11. Sound

| finding | source |
|---|---|
| Apollo LM cabin measured 70–82 dBA, ≈ 72 dBA after mufflers from Apollo 14 | Allen, NTRS 20170008857 |
| **"Even when spacesuits were worn, it was said that the noise levels inside the spacesuits was high. Hearing protection was generally used, or communication headsets with custom-molded ear insets"** | same |
| NASA continuous-noise limits: NC-50, NC-40 while sleeping | MSC Std 145 via Allen |
| dB levels inside an EMU | **UNVERIFIED** — described only as "an extreme acoustic environment", "noisy and reverberant" |
| Astronaut testimony about hearing footsteps or the LRV through structure | **UNVERIFIED** |

Vacuum carries no airborne sound; SELENE therefore plays only suit-internal
noise outdoors (fans, pumps, breathing, comms, alarms, conducted footfalls),
rover sound only when you are inside or touching it, and normal cabin
acoustics inside the ship. The suit bed is deliberately loud machinery, not
silence, which matches the Apollo testimony above.

---

## 12. Unverified list (summary)

Sato 2014 numerical Hapke parameters · mare/highland normal albedo · Kaguya MI
RGB colour · Apollo Hasselblad exposure table · median grain size, < 20 µm
fraction and angle of repose · Apollo 11 footpad depth in cm (PSR gives
inches) · exact Solar Wind Composition experiment offset · quantitative local
slope at Tranquility Base · Diviner latitude/local-time fit formula · GRAIL
free-air and Bouguer ranges in mGal · suited jump heights · EMU primary O₂
mass, total mass and sublimator rating · O₂ reserve caution timing ·
NASA-STD-3001 thermal and acoustic limits · ISS Quest depressurisation time ·
dB inside an EMU · structure-borne sound testimony · Artemis LTV requirements ·
Lunar Cruiser 30-day figure · post-mid-2025 lander outcomes.
