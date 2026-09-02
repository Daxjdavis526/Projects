# Trade-study projects — reference solutions and rubrics

Key to [`trade-study-projects.md`](trade-study-projects.md). For each of the six
projects: a **reference solution** with the sizing worked, the **recommended
architecture with the argument both ways**, the **Pugh matrix a strong student
would produce** with the sensitivity check that names the weight which flips the
answer, a **rubric out of 100**, and the **weak answers** that actually turn up.

**These are reference solutions, not the only correct ones.** Four of the six
projects have two defensible recommendations and one has three. What is graded is
whether your analysis supports the recommendation you made, whether you know what
you gave up, and whether you found the weight that flips it.

---

## How to use this key

1. **Do not read a project's section until your memo for that project is written
   and dated.** The whole value of the exercise is the gap between the answer you
   wrote down before the analysis and the answer the analysis produced.
2. **Compare your sizing against §1 first, and only then read §2.** If your
   propellant masses are within ~5 % of the reference and your eliminations are
   the same, your D1 is sound even if your recommendation differs.
3. **Score yourself against §4 honestly, including the automatic deductions.**
   The deduction for a number invented rather than computed or sourced is −20 and
   it is the one students most often award themselves a pass on.

## What is registered, and where

Every arithmetic step below is computed with
[`tools/rocket.py`](../tools/rocket.py) and registered in
[`tools/examples/tradestudies.py`](../tools/examples/tradestudies.py), so it can
be recomputed with:

```
python3 tools/check_examples.py
```

Registered results are cited inline as `[TS P1.5]` and so on. Steps that map onto
no library function — areas from diameters, bulk densities, membrane tank masses,
COPV performance factors, battery pack masses, binomial bounds, the
Coffin–Manson life scaling and the Pugh weighted sums — are listed explicitly at
the bottom of the examples file with the arithmetic shown, so that "not in the
library" never means "not checkable".

## Working gas models used throughout

All tagged **[A] approximation**, all consistent with Modules 01–04, and all
stated here so that a reader can substitute their own:

| combination | γ | M (kg/kmol) | T₀ (K) | c\*_ideal (m/s) | η_c\* assumed |
|---|---|---|---|---|---|
| NTO / MMH | 1.24 | 21.5 | 3,100 | **1,668.6** `[TS P1.1]` | 0.965 |
| LOX / RP-1 | 1.20 | 23.0 | 3,600 | **1,758.9** `[TS P2.13]` | 0.96 |
| LOX / CH₄ | 1.16 | 20.5 | 3,550 | **1,873.0** `[TS P4.1]` | 0.97 |
| AP/Al/HTPB solid | 1.18 | — | — | **1,580** (delivered) | included |
| GN₂ at 300 K | 1.400 | 28.014 | 300 | **435.8** `[TS P3.9]` | ~0.90 realised |

Bulk propellant densities are $\rho_b = (1+r)/(r/\rho_{ox} + 1/\rho_{fu})$:
LOX/RP-1 at O/F 2.34 → **1,016.6 kg/m³**; LOX/CH₄ at 3.6 → **833.1 kg/m³**;
NTO/MMH at 1.65 → **1,074.2 kg/m³**.

## Structural models used throughout

| item | model | note |
|---|---|---|
| membrane tank | $m = \mathrm{FoS}\cdot k\cdot p V \rho/\sigma$, FoS 1.5, $k = 2$ (cylinder with domes) | [A]; add 60–150 % for bosses, PMD, mounts and welds. The key does, and says so |
| COPV | $m = pV/(g_0 \cdot \mathrm{PF})$, PF = 20,000 m | [E]; a good modern composite overwrap. Titanium-lined 4130 gets ~8,000 m |
| Li-polymer pack | greater of $E/180\ \mathrm{Wh\,kg^{-1}}$ and $P/2.5\ \mathrm{kW\,kg^{-1}}$ | [E]; high-power cells trade energy density for power density and you must compute both |
| low-cycle fatigue | $N_f \propto (q_{ref}/q)^2$, anchored at 100 cycles at 80 MW/m² | [J] Coffin–Manson scaling, an ordering tool and **not a life prediction** |

## The margin policy, applied

The project file's MGA table is used verbatim. In every mass budget below,
**basic → MGA → predicted**, then a **15 % system margin** against the ceiling,
then propellant sized on the *predicted* dry mass and carrying its own
performance reserve (2 % launch stage, 5 % landing stage, 10 % for a 15-year
station-keeping budget), with residuals and trapped propellant stated separately.
A budget that skips any of those four steps loses marks under D2 even if the
total is right.

---

# Project 1 — 200 kg lunar lander descent and landing stage

## §1. Reference sizing (D1)

### The Δv and the eliminations

R1.1 fixes Δv ≥ 2,000 m/s; R1.3 fixes wet mass ≤ 200 kg; R1.2 fixes landed mass
≥ 100 kg. Those three together are the whole first hour of the project, because
**they over-determine the problem** and one candidate cannot satisfy them.

Reading R1.2 as *everything that lands* (bus + payload + the propulsion hardware
that lands with them), the burnout mass available under the 200 kg cap is
$m_f = 200\,e^{-\Delta v/(I_{sp}g_0)}$:

| candidate | assumed delivered $I_{sp}$ | burnout mass under the 200 kg cap | propellant | verdict |
|---|---|---|---|---|
| **A** storable MMH/NTO, pressure-fed | **313 s** effective (315 s at full thrust, ~295 s at 20 %; 90 % of Δv at full) | **104.2 kg** `[TS P1.9.A]` | 95.8 kg | **closes, with 4.2 kg on R1.2** |
| **B** LOX/LCH₄, pressure-fed | **335 s** effective (340 s claimed, derated 5 s for a cycle with no deep-throttle cryo heritage) | **108.8 kg** `[TS P1.10.B]` | 91.2 kg | closes on mass, **fails on storage** |
| **C** hydrazine monopropellant | **225 s** | **80.8 kg** `[TS P1.11.C]` | 119.2 kg | **fails R1.2 by 19.2 kg** |
| **D** bipropellant main + cold-gas ACS | 313 s main | 104.2 kg less ~4 kg of ACS | 95.8 kg | closes, ~0.2 kg on R1.2 |

**Candidate C is eliminated on arithmetic alone**, before any judgment is
applied. It is the project's designed trap: hydrazine is the simplest system in
the file and it cannot do the mission. Read the other way, delivering exactly
100 kg to the surface costs **147.5 kg** of hydrazine `[TS P1.8.C]` against
**91.9 kg** of MMH/NTO `[TS P1.6.A]` and **83.8 kg** of methalox `[TS P1.7.B]`.

A student who scores C in the Pugh matrix instead of gating it out has made the
classic error: **compliance is a gate, not a criterion.** A non-compliant option
that scores well on simplicity and cost will win a weighted matrix, and it is
still not a candidate.

### Engine and nozzle sizing (candidate A)

Design point: $F = 900$ N (12 % above R1.4's floor, for hover margin),
$p_c = 10$ bar (LMDE ran 7.6 bar; the R-4D family 6.9 bar; 10 bar is at the
top of pressure-fed practice and it is what buys the small throat).

| step | value | source |
|---|---|---|
| vacuum $C_F$ at ε = 100 | 1.9012 | `[TS P1.2]` |
| vacuum $C_F$ at **ε = 150** | **1.9220** | `[TS P1.3]` |
| vacuum $C_F$ at ε = 200 | 1.9355 | `[TS P1.4]` |
| $I_{sp}$ at ε = 150, $\eta_{c^*}$ = 0.965 | $0.965 \times 1668.6 \times 1.9220/9.80665$ = **315.6 s** | closes the assumption |
| throat area $A_t = F/(p_c C_F)$ | **4.6825 × 10⁻⁴ m²** | `[TS P1.5]` |
| throat diameter | **24.4 mm** | $D = 2\sqrt{A/\pi}$ |
| exit diameter at ε = 150 | **299 mm** | |
| chamber volume at $L^*$ = 0.9 m | **4.21 × 10⁻⁴ m³** | `[TS P1.14]` |
| mass flow at full thrust | 0.291 kg/s | $F/(I_{sp}g_0)$ |
| burn time at constant 900 N | **329 s** | consistent with the mission timeline |

**This is the step most students skip, and it is worth doing because it
*justifies* the project's 315 s assumption rather than accepting it.** ε = 150 is
the area ratio that produces it; ε = 100 would give 310.5 s and the mass budget
would not close. Saying "I assume 315 s because the project said so" is worth
half the marks of "315 s implies ε ≈ 150 and $\eta_{c^*}$ ≈ 0.965, which is
consistent with the R-4D family's 312 s at a smaller area ratio and with the
HiPAT's ~322 s at a larger one `[engine-database A.8]`."

### Feed system (candidate A)

Propellant volumes at O/F 1.65: 59.6 kg NTO (1,443 kg/m³) → 0.0413 m³; 36.2 kg
MMH (874 kg/m³) → 0.0414 m³; **0.0893 m³ with 8 % ullage**.

| item | value | source |
|---|---|---|
| tank MEOP | 18 bar (10 bar $p_c$ + 4 bar injector and feed + margin) | [J] |
| membrane tank mass, Ti-6Al-4V | 2.4 kg | model above |
| **realistic tank mass** with bosses, PMD, mounts | **6.0 kg** | ×2.5 [J] |
| helium in the ullage at 250 K | **0.310 kg** | `[TS P1.12]` |
| usable fraction, 310 → 20 bar, adiabatic | **0.807** | `[TS P1.13]` |
| helium stored | 0.384 kg | |
| helium COPV (7.7 L at 310 bar, PF 20,000 m) | 1.22 kg | |
| regulator, latch valves, fill/drain, lines | 3.0 kg | [J] |
| **helium system total** | **4.6 kg** | |

### Mass budget (D2), candidate A

| subsystem | basic (kg) | maturity | MGA | predicted (kg) |
|---|---|---|---|---|
| engine, 900 N throttleable pintle, ablative + radiative skirt | 8.0 | new design, conventional materials, analysis complete | 15 % | 9.20 |
| propellant tanks (2), Ti, with PMD | 6.0 | existing design, new build, new environment | 10 % | 6.60 |
| helium COPV + regulator + valves | 4.6 | flight-qualified, requalified | 5 % | 4.83 |
| propellant isolation and control valves | 3.2 | flight-qualified, unmodified | 2 % | 3.26 |
| lines, fittings, filters | 2.4 | new design, conventional | 15 % | 2.76 |
| thrust structure and mounts | 4.5 | new design, conventional | 15 % | 5.18 |
| instrumentation, harness, heaters | 1.8 | existing design, new environment | 10 % | 1.98 |
| **propulsion dry total** | **30.5** | | | **33.81** |
| system margin (15 %) | | | | **38.9** |

**R1.8's 35 kg ceiling is exceeded once the 15 % system margin is applied.** That
is the correct finding, and the correct response is not to delete the margin. It
is to name the two places where 4 kg can be found (a single-tank-per-propellant
arrangement with a common bulkhead; deleting the regulator and running blowdown
from a higher initial pressure, at the cost of a wider throttle-range excursion)
and to state that the requirement is at risk at PDR with a named retirement plan.
**A study that reports 33.8 kg by quietly dropping the system margin loses 5
marks under D2 and deserves to.**

Propellant: 95.8 kg of usable load, plus a **5 % landing-stage performance
reserve** (4.8 kg) and **2 % residuals and trapped propellant** (1.9 kg) —
so 102.5 kg loaded. Against a 200 kg wet cap and a 38.9 kg propulsion dry mass,
the bus and payload get **58.6 kg**, and the study must say so plainly: R1.2's
100 kg is met only if the propulsion hardware is counted inside it.

### Throttle authority (project-specific deliverable)

Landed mass ≈ 100 kg; lunar gravity 1.625 m/s². Hover thrust at touchdown =
100 × 1.625 = **163 N**. Minimum thrust at a 5:1 ratio from 900 N = 180 N; at
10:1 = 90 N.

| point | vehicle mass | weight on the Moon | required thrust |
|---|---|---|---|
| start of braking | 200 kg | 325 N | 900 N (2.8:1 T/W) |
| end of braking | ~115 kg | 187 N | ~400 N |
| terminal descent | ~105 kg | 171 N | 171–260 N |
| hover at touchdown | ~102 kg | 166 N | **166 N** |

**The throttle ratio actually required is 900/166 = 5.4:1**, which is *above*
R1.5's 5:1 floor and well inside the 10:1 desirable. A 5:1 engine cannot hover at
touchdown with any margin; a 6:1 engine can. **State the required ratio, not the
required-by-requirement ratio** — they are different numbers and the difference
is the deliverable.

### Injector stability (project-specific deliverable)

At full thrust, injector Δp = 2.0 bar = **0.20 $p_c$**, which is the standard
stability floor `[SP-8089]`. Hold the orifice area fixed and drop the flow to
20 %: $\dot m \propto \sqrt{\Delta p}$, so Δp falls to **0.08 bar**
`[TS P1.15, P1.16]` — a factor of 25 — while $p_c$ falls only to ~2 bar. **Δp/$p_c$
collapses from 0.20 to 0.04.** Below about 0.10 the injector no longer decouples
the feed system from the chamber, the feed-coupled (chug) mode is no longer
damped, and the engine is unstable long before the throttle floor.

**What the LMDE did about it: a variable-area pintle.** A movable sleeve varies
the injection area with the flow, so injection velocity and mixing quality — and
therefore Δp/$p_c$ — stay roughly constant across a 10:1 range. That is *the*
reason the LMDE's 10:1 chamber-pressure turndown (110 psia → 11 psia) was
achievable `[Dressler00][SP-8089]` `[engine-database A.8]`. Any candidate here
that proposes a fixed-area injector and a 5:1 throttle has not engaged with the
requirement.

### Six-month storage (project-specific deliverable)

**Candidate A (storables).** MMH freezes at −52 °C and NTO at −11.2 °C; R1.10's
−40 °C non-operating floor gives **28.8 K of margin on the fuel and none on the
oxidiser**. NTO must be kept above −11.2 °C for six months with **no active
propellant conditioning power** (R1.10) — so the answer is passive: MLI, a
low-α/ε external finish, tank placement inside the bus, and survival heaters on
the *bus* power budget rather than a propulsion conditioning budget. Materials
compatibility over six months is the easy part: MMH/NTO with titanium tanks and
CRES lines is fifty years of heritage.

**Candidate B (cryogens).** Six months of LOX and LCH₄ with no active cooling.
Assume a heat leak of 1.5 W into the propellant tanks (a small MLI-wrapped tank
set with two struts and four penetrations, [J]). Over 180 days that is
$1.5 \times 1.555\times10^7 = 23.3$ MJ. LOX's latent heat is 213 kJ/kg, so the
boil-off is **109 kg** — more than the entire propellant load. Even at 0.2 W
the boil-off is 14.6 kg, 16 % of the load. **The mass of whatever you do about it
is a cryocooler and its power, and there is no power.** Candidate B does not
fail on Isp; it fails on R1.7, and the study must say that in one line.

## §2. Recommended architecture, with the argument both ways

**Recommendation: candidate A — a single 900 N throttleable MMH/NTO
pressure-fed engine with a variable-area pintle injector, regulated helium, an
ablative chamber with a radiatively cooled skirt, and hypergolic ignition (no
igniter at all).**

### The argument for

1. **It is the only candidate that closes all four hard constraints
   simultaneously.** C fails R1.2 by 19 kg; B fails R1.7 by an order of
   magnitude in boil-off; D closes but adds a second fluid for a 0.2 kg gain.
2. **Ignition is free.** R1.6 requires five restarts including one after a
   30-day coast. Hypergolic propellants need no igniter, no spark exciter, no
   pyrophoric cartridge with a finite count, and no ignition-margin verification
   at cold soak. Every other candidate spends hardware and failure modes here.
3. **Deep throttling has flight heritage in exactly this propellant combination
   with exactly this injector.** The LMDE did 10:1 in 1968
   `[engine-database A.8]`. Candidate B's deep-throttling cryogenic pressure-fed
   engine has none, and R1.12 gives one flight unit and one qualification unit —
   there is no fleet over which to learn.
4. **R1.12 says recurring cost is nearly irrelevant and non-recurring cost and
   schedule are the constraints.** Twenty-eight months from PDR to a flight
   article (R1.11) is achievable with a heritage propellant, an off-the-shelf
   valve set and a modified existing engine. It is not achievable with a new
   cryogenic thermal design.

### The argument against — what the recommendation costs

1. **Isp.** 313 s against candidate B's 335 s: 4.6 kg more propellant for the
   same landed mass, on a vehicle where 4.6 kg is 4.6 % of the payload. This is a
   real loss and the memo must name it.
2. **Toxicity and ground operations.** MMH and NTO require SCAPE suits, a
   hazardous-propellant loading facility, a longer pad flow and a much larger
   insurance and permitting burden than either alternative. For a company with
   one vehicle and one contract this is a schedule risk, not just a cost.
3. **The 35 kg dry-mass requirement is not met with margin.** A methalox system
   with a lower tank pressure and no helium COPV would have been lighter; the
   storable system spends 4.6 kg on pressurant hardware alone.
4. **NTO's freezing point has no margin against R1.10.** The recommendation
   inherits a thermal requirement it must push onto the bus.

**Two criteria the recommendation loses on: performance and thermal margin.**
If your recommendation lost on none, re-read Appendix A of the project file.

## §3. Pugh matrix and sensitivity (D6)

**Datum: candidate A**, because it is the incumbent architecture for this class
of lander and the one the programme would build if nobody ran a study. Scoring
−2 to +2 against the datum. **Candidate C is not in the matrix: it failed the
compliance gate at R1.2 and a non-compliant option is not scored.**

| criterion | w | justification tied to the mission statement | A (datum) | B methalox PF | D hybrid |
|---|---|---|---|---|---|
| performance | 10 | Δv is fixed and the wet cap is fixed, so Isp only buys back landed mass; 22 s is 4.6 kg | 0 | **+2** (335 vs 313 s, D1) | 0 |
| mass | 20 | R1.3 and R1.8 are the two tightest requirements and the budget already exceeds R1.8 by 3.9 kg | 0 | +1 (91.2 vs 95.8 kg prop) | −1 (+4 kg of ACS tankage) |
| complexity | 12 | one flight unit, one qual unit, 28 months: every subsystem is a schedule item | 0 | **−2** (cryo thermal, no conditioning power) | −1 (second fluid, second regulator) |
| reliability | 20 | "no crew, no rescue, no second attempt"; the descent cannot be retried | 0 | **−2** (no deep-throttle cryo PF heritage) | +1 (ACS independent of the main feed) |
| manufacturability | 8 | two units total; producibility barely matters | 0 | −1 | 0 |
| cost (NRI) | 15 | R1.12: non-recurring cost and schedule are the constraints | 0 | **−2** (new engine + new thermal design) | −1 |
| mission fit | 15 | R1.7's six months in cislunar space is the discriminating requirement | 0 | **−2** (109 kg of boil-off at 1.5 W) | +1 (ACS gives settling and attitude for free) |
| **weighted total** | **100** | | **0** | **−92** | **−12** |

### Sensitivity

Varying each weight by ±50 %, one at a time: **no single weight flips the
answer.** The gap to candidate D closes only when

- the **mass** weight falls to **8** (a 60 % reduction), or
- the **reliability** weight rises to **32** (a 60 % increase), or
- the **cost** weight falls to 3, or the **mission fit** weight rises to 27.

All four are outside ±50 %. **The two-criterion perturbation does flip it:**
halving the mass weight (20 → 10) *and* raising the reliability weight by 50 %
(20 → 30) puts candidate D at **+8** and it wins. That combination is exactly the
belief "the 4 kg of extra ACS hardware does not matter and the independence of
the attitude-control fluid does" — which is a defensible position for a lander
with no crew and no redundancy anywhere else.

**Report:** the decision is robust to any single weight within ±50 %, and flips
under one specific pair of weight changes that corresponds to a stated, arguable
belief about redundancy. That is a much stronger result than "A wins".

## §4. Rubric — Project 1, out of 100

| deliverable | marks | what earns them |
|---|---|---|
| **D1 sizing** | **25** | 5: Δv budget with losses named. **8: all four candidates sized, including the two that fail** — a sizing only for the winner scores 0 of these 8. 5: throat and $C_F$ computed at the actual ε, not assumed (`[TS P1.2–P1.5]`). 4: tank volumes from real densities with ullage; pressurant mass and pressurant tank mass (`[TS P1.12, P1.13]`). 3: burn time checked against the mission timeline |
| **D2 mass budget** | **15** | 6: per-subsystem basic → MGA → predicted with maturity-based MGA. 4: system margin applied on top and **the R1.8 exceedance reported rather than absorbed**. 3: residuals and performance reserve stated. 2: propellant sized on predicted, not basic, dry mass |
| **D3 reliability** | **12** | 4: part count split into the five categories. 3: single-point failures enumerated with removable/not-removable. 3: top-ten FMEA with *specific* failure modes. 2: demonstrated-reliability statement that is arithmetically honest about one qual unit |
| **D4 manufacturability and cost** | **12** | 5: UCI computed from the parts list with complexity classes and process multipliers. 5: **NRI dominant, because R1.12 says so** — a study that optimises unit cost here has misread the mission. 2: rate (two units; rate is irrelevant and saying so is the right answer) |
| **D5 risk** | **8** | 5: eight risks, if–then form, 5×5, with retirement decision points. 2: at least two non-technical. 1: at least one *created by* the recommendation (e.g. "if the NTO tank cannot be held above −11.2 °C passively, then the bus must carry survival heater power the trade did not budget") |
| **D6 Pugh + sensitivity** | **18** | 4: weights written and justified against the mission statement *before* scores. 4: datum is a real candidate. 4: every score carries a number from D1–D4. **6: the sensitivity, including the correct finding that no single weight flips it and that a specific pair does** |
| **D7 memo** | **10** | 3: recommendation in the first sentence. 2: the three numbers. **3: what it costs — the criteria it loses on, with magnitudes.** 1: a measurable change-of-mind trigger. 1: one page |

**Project-specific additions, folded into the marks above:** the throttle-authority
plot with the *actual* 5.4:1 requirement (part of D1); the six-month storage
analysis with a stated heat leak and a boil-off number (part of D1); the
injector-stability argument with Δp/$p_c$ across the range (part of D3).

**Automatic deductions applied as written in the project file.** The two that
bite most often here: −10 if candidates B and C were not sized (they usually are
not), and −5 for quoting the LMDE's 311 s or the R-4D's 312 s without the
database's caveats.

## §5. Common weak answers

1. **"Hydrazine, because it is the simplest."** It is, and it lands 80.8 kg
   against a 100 kg requirement `[TS P1.11.C]`. This is the single most common
   answer and it is wrong by 19 kg. *What it reveals:* the sizing was done after
   the decision, or not at all.
2. **Scoring the non-compliant candidate in the matrix.** C scores well on
   complexity, reliability, manufacturability and cost and would win a weighted
   matrix. Compliance is a gate.
3. **A fixed-area injector with a 5:1 throttle.** Δp/$p_c$ falls from 0.20 to
   0.04 `[TS P1.15, P1.16]`. *What it reveals:* injector pressure drop is
   remembered as a rule of thumb rather than as a stability mechanism.
4. **Quoting 315 s without justifying it.** The project explicitly asks what
   $\eta_{c^*}$ and area ratio the number implies. ε = 150 and $\eta_{c^*}$ = 0.965
   `[TS P1.3]`.
5. **"Methalox, because it has higher Isp."** It does, by 22 s, and it boils off
   109 kg in six months at a plausible heat leak. *What it reveals:* the
   requirement that is not a performance number (R1.7) was skimmed.
6. **A mass budget with a flat 20 %.** Automatic −5. The MGA table exists because
   margin is a function of maturity: the flight-qualified valve set carries 2 %
   and the new engine carries 15 %, and averaging them destroys the information.
7. **Deleting the system margin to make R1.8 close.** The requirement is at risk;
   say so. A study that reports 33.8 kg against a 35 kg cap by dropping the
   margin has told the chief engineer something false.
8. **Forgetting residuals.** 1.9 kg of trapped propellant on a 200 kg vehicle is
   2 kg of landed payload, and it is the line item students most often omit
   entirely.
9. **Excluding turbopump throttling without saying why.** The project asks
   explicitly. The answer is one sentence: there is no turbopump in a
   pressure-fed system, so the AR2-3's throttling-by-turbopump-speed
   architecture is unavailable `[engine-database A.9.5]`.

---
