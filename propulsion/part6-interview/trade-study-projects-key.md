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

# Project 2 — A small launch vehicle second stage

## §1. Reference sizing (D1)

### The Δv closure, all six combinations

R2.6 caps stage gross at 2,600 kg *including* payload; R2.2 requires ≥ 300 kg to
500 km SSO; R2.1 requires ≥ 3,600 m/s. The burnout mass allowed is
$m_f = 2600\,e^{-3600/(I_{sp}g_0)}$, and the dry-mass allowance is that minus the
300 kg payload:

| axis 1 × axis 2 | $I_{sp}$ (s) | $m_f$ allowed (kg) | dry allowed (kg) | propellant (kg) | verified |
|---|---|---|---|---|---|
| GG × kerolox | 348 | 905.4 | **605.4** | 1,694.6 | `[TS P2.1]` |
| electric pump × kerolox | 343 | 891.6 | **591.6** | 1,708.4 | `[TS P2.2]` |
| pressure-fed × kerolox | 305 | 780.3 | **480.3** | 1,819.7 | `[TS P2.3]` |
| GG × methalox | 362 | 943.1 | **643.1** | 1,656.9 | `[TS P2.4]` |
| electric pump × methalox | 358 | 932.5 | **632.5** | 1,667.5 | `[TS P2.5]` |
| pressure-fed × methalox | 318 | 819.6 | **519.6** | 1,780.4 | `[TS P2.6]` |

Each row is verified by feeding $m_0 = 2{,}600$ kg and the resulting $m_f$ back
through the rocket equation, which returns 3,600 m/s.

**The first finding is that Δv is not the binding constraint.** Every
combination allows a dry mass far above R2.7's 380 kg ceiling. **R2.7 is
binding, and it binds through tank mass and pressurisation hardware, which is why
the two axes are not independent.**

### The closed design loop (project-specific deliverable)

The loop is $p_c \to$ pump power $\to$ battery or turbine flow $\to$ dry mass
$\to$ propellant $\to$ tank volume $\to$ tank mass $\to$ dry mass. Two iterations
for the electric-pump kerolox candidate, starting from a 300 kg dry guess:

| iteration | dry (kg) | propellant (kg) | volume (m³) | tank (kg) | battery (kg) | new dry (kg) |
|---|---|---|---|---|---|---|
| 1 | 300 (guess) | 1,700 | 1.756 | 21.3 | 40.5 | 279 |
| 2 | 279 | 1,708 | 1.765 | 21.4 | 40.5 | 280 |

Converged to **280 kg basic** in two iterations, because the tank is only 8 % of
dry mass at 6 bar — the loop is weakly coupled for a pump-fed stage. **For the
pressure-fed candidate it is strongly coupled**, because the tank is 27 % of dry
mass and grows with the propellant it holds.

### Tank and pressurisation masses

Propellant volumes at 5 % ullage, from the bulk densities above:

| candidate | MEOP | volume (m³) | membrane tank (kg) | pressurisation |
|---|---|---|---|---|
| GG kerolox | 4 bar | 1.750 | **14.2** | autogenous / small He, ~15 kg |
| EP kerolox | 6 bar | 1.765 | **21.4** | small He, ~12 kg |
| **PF kerolox** | **26 bar** | 1.879 | **98.9** | **He system 52.5 kg** |
| GG methalox | 4 bar | 2.114 | 17.1 | ~15 kg |
| EP methalox | 6 bar | 2.127 | 25.8 | ~12 kg |
| **PF methalox** | **26 bar** | 2.271 | **119.6** | ~58 kg |

The pressure-fed helium system, worked out: **9.41 kg** of helium in the ullage
at 26 bar and 250 K `[TS P2.9]`; a usable fraction of **0.749** blowing down from
300 to 30 bar adiabatically `[TS P2.10]`; therefore **12.6 kg stored** in a
**0.261 m³** COPV massing **39.9 kg** at a 20,000 m performance factor — **52.5 kg
of helium system to deliver 9.4 kg of gas.**

> **This is the answer to "a 1,500-litre propellant volume at 26 bar MEOP is a
> very different tank from the same volume at 4 bar."** It is 98.9 kg against
> 14.2 kg, plus a 52.5 kg pressurant system that the 4 bar stage does not need.
> **151 kg of the 380 kg dry budget, spent before the engine exists.**

### The electric-pump question: energy-limited or power-limited?

Both must be computed and the larger taken. At $F$ = 30 kN, $p_c$ = 60 bar,
$\Delta p = 1.35p_c - 6$ bar = 75 bar, $\eta_{pump}$ = 0.65:

| | kerolox | methalox |
|---|---|---|
| $\dot m = F/(I_{sp}g_0)$ | 8.92 kg/s | 8.55 kg/s |
| $\rho_{bulk}$ | 1,016.6 kg/m³ | 833.1 kg/m³ |
| **shaft power** | **101.2 kW** `[TS P2.7]` | **118.3 kW** `[TS P2.8]` |
| energy at 120 s burn | 3.37 kWh → **18.7 kg** | 3.99 kWh → **22.2 kg** |
| energy at 200 s burn | 5.62 kWh → **31.2 kg** | 6.66 kWh → **37.0 kg** |
| power-limited pack | **40.5 kg** | **47.9 kg** |
| **pack mass (the larger)** | **40.5 kg** | **47.9 kg** |

**The pack is power-limited across the entire burn-time window R2.4 allows
(120–200 s), and it is not close: 40.5 kg against 31.2 kg at the longest
permitted burn.** That is the answer the project asks for, and it has a design
consequence: the cell chemistry must be chosen for **specific power**, not
specific energy — high-rate Li-polymer at ~2.5 kW/kg and ~180 Wh/kg, not the
250+ Wh/kg cells that would minimise an energy-limited pack. A student who
assumes energy-limiting (the intuitive case, because it is the case for an
aircraft) undersizes the pack by 30 % and gets a dry mass that is wrong in the
favourable direction.

Motors and controllers add ~18 kg, so the **electric drive is ~58 kg** against a
turbopump-plus-gas-generator package of ~35 kg for the same duty. **The electric
option is not the light option.** It is chosen for other reasons, and the memo
must say so.

### NPSH check

At the electric-pump inlet: 6 bar tank, LOX vapour pressure 1.0 bar at the tank
condition, 0.4 bar of line loss, 2 m of head at 3 g of stage acceleration →
**NPSHa = 47.1 m** `[TS P2.14]`. Ample for a low-suction-specific-speed
centrifugal pump without an inducer, which is itself a reason the electric-pump
architecture is buildable by a team that has never built a turbopump: **at 6 bar
tank pressure you can delete the inducer.**

### Nozzle and $C_F$

| candidate | ε | vacuum $C_F$ | note |
|---|---|---|---|
| pressure-fed ($p_c$ ≈ 19 bar) | 40 | **1.884** `[TS P2.11]` | throat is 104 mm at 30 kN, so the nozzle is stage-diameter-limited well before performance limits it |
| pump-fed ($p_c$ = 60 bar) | 120 | **1.964** `[TS P2.12]` | throat 33 mm; ε is limited by base heating and the interstage, not by aerodynamics |

With $c^*_{ideal}$ = 1,758.9 m/s `[TS P2.13]` and $\eta_{c^*}$ = 0.96, ε = 120
gives $0.96\times1758.9\times1.964/9.80665 = 338$ s — slightly below the project's
343 s for the electric-pump kerolox case, which is the honest direction for the
discrepancy to run and should be stated rather than smoothed.

### Mass budgets (D2), basic → predicted

| subsystem | GG kero | EP kero | PF kero | MGA |
|---|---|---|---|---|
| tanks | 14.2 | 21.4 | **98.9** | 15 % new design |
| pressurisation (He, COPV, regulator) | 15 | 12 | **52.5** | 5 % qualified |
| engine (chamber, injector, valves) | 45 | 40 | 45 | 15 % |
| turbomachinery / electric drive | 35 | **58** | 0 | 25 % / 15 % |
| structure, interstage, TVC, avionics | 140 | 140 | 150 | 10 % |
| lines, valves, fittings | 25 | 20 | 25 | 5 % |
| **basic total** | **274.2** | **291.4** | **371.4** | |
| **predicted (MGA applied per line)** | **~305** | **~322** | **~412** | |
| **+15 % system margin** | **~351** | **~370** | **~474** | |
| **against R2.7's 380 kg** | **passes** | **passes, 10 kg to spare** | **fails by 94 kg** | |

**The pressure-fed candidates are eliminated on mass, and the elimination is not
marginal.** The methalox pressure-fed case is worse still (119.6 kg of tank).
This is Project 2's arithmetic elimination, and it takes the form the project
warned about: *the two axes are not independent*, because the cycle choice sets
the tank pressure and the tank pressure sets a dry mass that the propellant
choice then multiplies through the bulk density.

### Rate and cost (D4)

| candidate | UCI per stage (relative) | skilled labour h/stage | rate at 24/yr |
|---|---|---|---|
| GG kerolox | **1.00** (datum) | ~1,400 | needs a turbopump line: 2 precision rotating parts × 25 × 1.6 (special process) each |
| EP kerolox | **0.82** | ~900 | printed chamber and pumps; motors and cells are catalogue parts at $k$ = 0.6; **no precision rotating part above an impeller** |
| PF kerolox | **1.35** | ~1,100 | the 26 bar tanks are large welded assemblies at $k$ = 1.6 |
| GG methalox | 1.06 | ~1,500 | as GG kerolox plus cryogenic fuel GSE |

The battery pack is a genuine recurring cost the electric option carries and the
turbine options do not — roughly 40 kg of high-rate cells expended per flight.
It is scored, and it is why the electric option does **not** get a positive cost
score in the matrix below.

### "What your company can actually build" (project-specific deliverable)

Ninety engineers, no turbopump experience, 36 months to first flight (R2.9), and
a sustained rate of 24 stages a year from month 30 (R2.8). A turbopump is not one
component; it is a discipline — rotordynamics, cavitation and suction specific
speed, bearing and seal design, turbine blade life, and a balance-piston or
thrust-bearing arrangement that must be got right the first time
`[SP-8107][SP-8109][Brennen-Pumps]`. Hiring and qualifying that capability inside
36 months while also qualifying a stage is the programme's largest single risk,
and it is a **requirement**, not an aside: the mission statement puts it in
writing. A study that scores the gas generator highest without addressing it has
ignored a stated constraint and loses marks under D6 and D7.

## §2. Recommended architecture, with the argument both ways

**Recommendation: electric pump-fed, LOX/RP-1, at $p_c$ ≈ 60 bar, ε = 120,
30 kN vacuum, with a printed regeneratively cooled chamber, two brushless DC
motors on a power-optimised Li-polymer pack, and helium spin-free restart.**

### The argument for

1. **It is the only architecture this company can build to schedule.** No
   turbine, no gas generator, no hot-gas joint, no turbopump discipline to hire.
   Rutherford is the existence proof: 369 engines across 47 flights by April 2024
   `[engine-database A.3]`.
2. **It closes the dry-mass requirement with margin.** ~370 kg predicted against
   R2.7's 380 kg, against ~474 kg for the pressure-fed alternative.
3. **The pack is power-limited, and power-limited packs do not grow with burn
   time.** Stretching the burn from 120 s to 200 s costs zero pack mass
   `[TS P2.7]`. That is a schedule and growth-margin property, not just a mass
   property.
4. **Rate.** 24 stages a year with no precision rotating part harder than a
   centrifugal impeller, and a chamber, injector and pumps produced by laser
   powder bed fusion. The UCI is the lowest of the six and the labour hours are
   the lowest by ~35 %.
5. **Restart is nearly free.** R2.5 wants two restarts including one after a
   45-minute coast. An electric pump spins up from a battery on command; there is
   no start cartridge, no spin-start gas, and no turbine to chill.

### The argument against — what the recommendation costs

1. **Isp.** 343 s against the gas generator's 348 s and methalox's 358–362 s.
   Choosing kerolox over methalox costs 15 s and about 40 kg of propellant.
2. **The batteries are parasitic mass and recurring cost.** 40.5 kg of cells and
   ~18 kg of motors and controllers, expended every flight, against ~35 kg of
   turbomachinery. **The electric-pump cycle is heavier at the engine level and
   the company's own database entry says so** `[engine-database A.3.7]`.
3. **It does not scale.** Pack mass is linear in thrust; turbopump mass grows as
   roughly $F^{0.7}$. At this stage's 30 kN the penalty is tolerable; by 100 kN
   it is not, and Rocket Lab itself moved to oxidiser-rich staged combustion for
   its next, larger vehicle `[engine-database A.3.7]`. **If the company's second
   product is bigger, this architecture is a dead end, and the memo must say so.**
4. **The manufacturer's efficiency claim must not be repeated.** ~95 % for the
   electric drive against ~50 % for a gas-generator turbine compares
   electrical-to-hydraulic efficiency against thermodynamic cycle efficiency and
   is not a like-for-like comparison `[engine-database A.3.7]`. Using it in a
   trade study is an automatic −5 for quoting a flagged figure without its
   caveat.

**Two criteria the recommendation loses on: performance and mass.** Both by
measurable amounts, both named above.

### The second defensible answer

**Gas generator, kerolox** is defensible if you believe the company can hire
turbopump capability inside 36 months, and it wins on performance, on engine
mass and on scalability. The study that recommends it and *says* it is betting
the schedule on a hiring plan is a good study. The study that recommends it
without mentioning the hiring plan has ignored a requirement.

## §3. Pugh matrix and sensitivity (D6)

**Datum: gas generator, kerolox** — the conventional answer and what the
programme would default to. **Both pressure-fed candidates are retained in the
matrix rather than gated out**, because they fail R2.7 only after margins are
applied and a reader may reasonably dispute the margin policy; their scores
record why they lose.

| criterion | w | justification tied to the mission statement | GG kero (datum) | EP kero | PF kero | GG meth | EP meth | PF meth |
|---|---|---|---|---|---|---|---|---|
| performance | 12 | Isp buys stage dry-mass headroom, but the headroom is 200+ kg wide, so Isp is not decisive | 0 | −1 | −2 | +1 | 0 | −2 |
| mass | 15 | R2.7's 380 kg is the binding requirement | 0 | −1 | −2 | −1 | −1 | −2 |
| complexity | 10 | 90 engineers and 36 months; every hot-gas joint is a discipline | 0 | +2 | +2 | −1 | +1 | +2 |
| reliability | 12 | 24 flights a year: an 0.98 stage loses one vehicle every two years | 0 | +2 | +2 | 0 | +1 | +2 |
| manufacturability | 13 | R2.8: 24 stages/year sustained from month 30 | 0 | +2 | +1 | −1 | +1 | +1 |
| cost | 22 | R2.10 says recurring cost is *the* binding constraint | 0 | −1 (packs expended) | 0 | −1 | 0 | −1 |
| mission fit | 16 | "90 engineers, never built a turbopump, 36 months" is a written requirement | 0 | **+2** | −1 | −1 | 0 | −2 |
| **weighted total** | **100** | | **0** | **+53** | **−13** | **−64** | **+20** | **−51** |

### Sensitivity

Varying each weight ±50 %, one at a time: **nothing flips.** The runner-up is
electric-pump methalox at +20, and the gap of 33 closes only if the
**performance** weight rises to 45 (+275 %) or the **cost** weight rises to 55
(+150 %). Two-criterion perturbations within ±50 % (mass +50 % with mission fit
−50 %, the most adverse pair) leave the electric-pump kerolox option ahead by 12.

**Report honestly: this decision is robust on weights, and it is not robust on
scale.** The thing that changes the answer is not a preference, it is a number in
the mission statement: **if the stage thrust rises above roughly 60 kN, the
power-limited pack passes 80 kg and the electric option's mission-fit advantage
no longer covers its mass penalty.** The measurement that would settle it is the
battery pack's demonstrated specific power at the flight discharge rate and
temperature — assume 2.5 kW/kg and you get 40.5 kg; assume 1.5 kW/kg and you get
67.5 kg, and the recommendation moves to the gas generator.

## §4. Rubric — Project 2, out of 100

| deliverable | marks | what earns them |
|---|---|---|
| **D1 sizing** | **25** | 4: Δv budget with losses. **6: at least four of the six combinations sized** (R2's explicit instruction) with the eliminations of the other two justified. 5: the **closed design loop**, at least two iterations, with the convergence stated. 5: pump power computed both ways for the electric option and **the larger taken** `[TS P2.7]`. 3: tank volumes, MEOP and pressurant mass and pressurant *tank* mass `[TS P2.9, P2.10]`. 2: nozzle ε argued from stage diameter and base heating, not assumed |
| **D2 mass budget** | **15** | 6: per-subsystem basic → MGA → predicted. 4: system margin, and the pressure-fed exceedance reported. 3: 2 % launch-stage performance reserve and residuals. 2: propellant sized on predicted dry mass |
| **D3 reliability** | **12** | 4: part count in the five categories — this is where the electric option's case is actually made. 3: single-point failures. 3: FMEA with specific modes. 2: **binomial honesty** — 24 flights a year means the demonstrated-reliability statement has to survive a fleet, not a first flight |
| **D4 manufacturability and cost** | **12** | 5: UCI per stage with the complexity classes and multipliers. 3: **rate-and-cost table with skilled labour hours** and the assumption stated. 4: **the "what your company can actually build" paragraph** — this is a requirement and its absence is a −4 here regardless of the rest |
| **D5 risk** | **8** | 5: eight risks, if–then, 5×5, retirement points. 2: two non-technical (the hiring plan and the cell supply chain are the obvious ones). 1: one created by the recommendation |
| **D6 Pugh + sensitivity** | **18** | 4: weights before scores, justified against *this* mission. 4: real datum. 4: evidence line per score. **6: the sensitivity — full marks require reporting that no weight flips it and naming the assumption (specific power, or stage thrust) that does** |
| **D7 memo** | **10** | 3: recommendation first. 2: three numbers. 3: what it costs. 1: measurable trigger ("if pack specific power qualifies below 1.8 kW/kg, revert to the gas generator"). 1: one page |

## §5. Common weak answers

1. **"Methalox because Isp."** 362 s against 348 s, and a bulkier fuel that needs
   conditioning, a second cryogenic pad system, and a 4-hour hold at T−10 min
   (R2.11) with liquid methane in the tank. The Isp advantage is real and it is
   not what the mission is short of.
2. **Assuming the battery is energy-limited.** It is power-limited by a factor of
   1.3 at the longest permitted burn `[TS P2.7]`. *What it reveals:* the pack was
   sized by analogy with a drone.
3. **Repeating the 95 %-versus-50 % efficiency claim.** Automatic −5
   `[engine-database A.3.7]`.
4. **Treating the two axes as independent.** The project says outright that the
   study is "largely about noticing that the axes are not independent." Cycle
   sets MEOP; MEOP sets tank mass; tank mass sets dry mass; propellant density
   multiplies the volume through. A study with a 2×3 grid of Isp values and no
   tank masses has done a table, not a trade.
5. **A design loop with one iteration.** One iteration is an estimate. The
   deliverable asks for two and a convergence statement.
6. **Ignoring the 90-engineer constraint** because it is not in the requirements
   table. It is in the mission statement, which is part of the requirement set.
7. **Sizing the pressurant gas but not the pressurant tank.** 9.4 kg of helium in
   a 39.9 kg COPV `[TS P2.9, P2.10]`. The tank is four times the gas and it is
   the line students omit.
8. **Quoting Rutherford's 72.8:1 thrust-to-weight as if it included the
   batteries.** It does not, and the database says so `[engine-database A.3]`.

---

# Project 3 — A GEO communications satellite propulsion suite

## §1. Reference sizing (D1)

### Comparing at constant delivered mass

R3.1 states a *beginning-of-life mass in GEO* of ≥ 3,000 kg. Sizing to that
number directly makes candidates A and C identical at separation, which is an
artefact of the requirement's wording, not a physical result. **The honest
comparison holds the delivered dry spacecraft constant** — bus, payload and
propulsion hardware — and reports the wet mass at separation, because that is
what the launcher charges for. Take $D = 2{,}318.5$ kg, the dry mass that
falls out of the all-chemical case at exactly 3,000 kg BOL. State the choice in
the assumption register; a student who sizes to constant BOL and *says so* is
not wrong, but must then compare on propellant mass rather than wet mass.

Δv terms: apogee 1,500 m/s (R3.2), station-keeping 800 m/s (R3.3), disposal
11 m/s (R3.4) — station-keeping and disposal combined as 811 m/s.

| | A all-chemical (321 s) | B all-electric (1,800 s) | C hybrid |
|---|---|---|---|
| SK + disposal propellant | **681.3 kg** `[TS P3.1]` | **109.0 kg** xenon `[TS P3.3]` | **109.0 kg** xenon |
| mass before SK | 2,999.8 kg | 2,427.5 kg | 2,427.5 kg |
| orbit-raising propellant | **1,831.2 kg** `[TS P3.2]` | **449.7 kg** xenon `[TS P3.4]` | **1,481.8 kg** `[TS P3.5]` |
| **wet mass at separation** | **4,831.0 kg** | **2,877.2 kg** | **3,909.3 kg** |
| saving against A | — | **1,953.8 kg** | **921.7 kg** |
| transfer duration | days | **367 days** | days |

Closure check: 4,831.0 → 2,318.5 kg at 321 s returns 2,311 m/s `[TS P3.6]`, the
full budget.

### Candidate B is eliminated on arithmetic

R3.8 caps propulsion power during transfer at **6 kW**, and the EP black box
draws **5 kW per thruster** for **0.25 N**. Six kilowatts runs **one** thruster;
two would need ten. The orbit-raising xenon of 449.7 kg at 1,800 s is a total
impulse of **7.94 × 10⁶ N·s**, and at 0.25 N that is **3.18 × 10⁷ s = 367 days**.

R3.7 allows **45 days**. In 45 days one thruster delivers 9.72 × 10⁵ N·s — **12 %
of what the transfer needs.** Candidate B misses the requirement by a factor of
8.2, and no reasonable EP assumption closes it: you would need eight thrusters and
40 kW.

Costed against R3.7's stated penalty of 0.35 % of programme value per week:
(367 − 45)/7 = 46 weeks × 0.35 % = **16.1 % of programme value**, against a
launch-mass saving of 1,954 kg. At any plausible $/kg the revenue penalty
dominates, and it does so before the requirement violation is even considered.

**The mandatory chart** — wet mass at separation against time-to-station for all
three, with the revenue penalty converted onto the mass axis at the launcher's
$/kg — is the deliverable that makes this visible in one figure, and it is where
the marks are.

### The ACS sub-trade, sized four ways

R3.5 requires **8,000 N·s** of attitude-control impulse over life, excluding
station-keeping; R3.6 requires a minimum impulse bit **≤ 0.05 N·s repeatable to
±10 %**.

| option | realised $I_{sp}$ | propellant | tank | other hardware | **system wet** |
|---|---|---|---|---|---|
| **GN₂ cold gas**, 300 bar COPV | 69 s (ideal 76.8 s at ε = 50 `[TS P3.7]`, ×0.90) | **11.8 kg** `[TS P3.12]` | 35.1 L COPV, **5.4 kg** | regulator, latch valves, lines 6.0 kg | **23.2 kg** |
| **butane**, self-pressurising | 62 s (ideal 69.2 s `[TS P3.10]`) | 13.2 kg | 23.1 L at 2.6 bar, 3.0 kg | valves, heaters 4.0 kg | **20.2 kg** |
| **R-236fa**, self-pressurising | 40 s (ideal 43.2 s `[TS P3.11]`) | 20.4 kg | 15.0 L at 2.7 bar, 2.5 kg | valves 4.0 kg | **26.9 kg** |
| **monopropellant hydrazine** | 225 s | **3.6 kg** | 3.6 L, 3.5 kg | cat-bed heaters, valves, thrusters 7.0 kg | **14.1 kg** |
| **shared bipropellant** | 290 s | 2.8 kg | shared, 0 kg | small thrusters, valves 6.0 kg | **8.8 kg** |
| **shared electric** | 1,800 s | 0.45 kg | shared, 0 kg | 0 kg | **0.5 kg** — but non-compliant on R3.6 |

### What the sub-trade actually turns on

**Not specific impulse.** Look at the spread:

- GN₂ has **1.11×** butane's specific impulse and is **15 % heavier** as a system.
- GN₂ has **1.73×** R-236fa's specific impulse and is **14 % lighter** — a much
  smaller difference than the Isp ratio implies.
- Hydrazine has **3.26×** GN₂'s specific impulse and is only **39 % lighter**,
  because 10.5 kg of its 14.1 kg is hardware that does not scale with Isp at all.

**It turns on stored density and dry hardware.** Density impulse makes the point
in one column: GN₂ at 280 kg/m³ stored gives **19,320 kg·s/m³** `[TS P3.13]`;
R-236fa at 1,360 kg/m³ gives **54,400** `[TS P3.14]`, nearly three times more,
*at 58 % of the specific impulse*; butane gives **35,340** `[TS P3.15]`. **The
tank, not the propellant, decides the trade** — which is exactly the MarCO
lesson: a 40-second propellant is the *right* answer when the constraint is
volume, integration and safety rather than Δv `[MarCO]` `[engine-database C.2.5]`.

The second thing it turns on is **fifteen years**. A 300 bar COPV holding
nitrogen for fifteen years is a leak-rate budget across every joint in the
system, and cold gas has more joints per newton-second than anything else here.
That, not Isp, is why GEO spacecraft do not use cold-gas ACS.

### Gauging (R3.10)

±3 % of load, on 681 kg for the all-chemical case, is ±20 kg. The methods:

| method | realistic accuracy | note |
|---|---|---|
| book-keeping (integrated flow) | ±2–4 % early, **±5–8 % after 15 years** | error accumulates monotonically; it is the *drift* that kills it |
| PVT (pressure–volume–temperature) | **±3–5 %** near end of life, worse when the ullage is small | needs accurate tank temperature mapping |
| thermal gauging (heat pulse) | **±1–2 % at low fill fractions** | best exactly where the others are worst |
| **combination** | **±2–3 %** | book-keeping through life, PVT as a check, thermal gauging in the last 10 % |

**It is not 1 %.** A study that claims 1 % has not read a gauging paper. The
combination is the answer, and the reason is that the methods have *opposite*
error behaviour with fill fraction.

## §2. Recommended architecture, with the argument both ways

**Recommendation: candidate C — a 450 N-class NTO/MMH bipropellant apogee engine
for orbit raising, electric propulsion for the 15-year station-keeping and
disposal budget, and an independent monopropellant hydrazine ACS.**

### The argument for

1. **921.7 kg off the wet mass at separation** for the same delivered
   spacecraft, at a transfer duration measured in days rather than a year.
2. **It puts the high-Isp system exactly where the Δv is slow-and-patient.**
   Station-keeping is 800 m/s spread over fifteen years at ~50 m/s per year;
   there is no schedule pressure and the on-station power cap of 1.5 kW (R3.9) is
   enough for one thruster running a duty cycle.
3. **It puts the high-thrust system exactly where the Δv is time-critical.**
   The apogee burn is the revenue clock, and R3.7's penalty is 0.35 % of
   programme value per week.
4. **This is what Western GEO operators converged on**, and the reason is the one
   above, not fashion.

### The argument against — what the recommendation costs

1. **Two propulsion systems on one spacecraft.** Two propellants, two feed
   architectures, two sets of qualification, two failure trees, a PPU and its
   thermal load, and six satellites of it (R3.11).
2. **Reliability.** Fifteen years of Hall-thruster operation at 450 kg of
   demonstrated xenon throughput per thruster against a 109 kg requirement is
   comfortable — but the PPU, the xenon feed regulation and the cathode are new
   single-string items that the all-chemical spacecraft does not have.
3. **Schedule.** 42 months to first launch (R3.12) with an EP string to qualify
   is tighter than 42 months with a heritage bipropellant system.
4. **All-chemical is simpler and is not disqualified.** It is 922 kg heavier and
   it works, and for an operator who values schedule certainty over launch mass
   that is a defensible choice.

**Two criteria the recommendation loses on: complexity and reliability**, both
by −2 in the matrix, both traceable to "two propulsion systems instead of one".

### The shared-versus-separate fault tree (project-specific deliverable)

Three levels, for the recommended architecture:

```
Loss of station-keeping capability
├─ Loss of EP string
│  ├─ PPU failure ................ mitigated: 2 strings, cross-strapped
│  ├─ cathode failure ............ mitigated: 2 thrusters per string
│  └─ xenon feed regulator fails closed ... NOT mitigated by redundancy:
│        single high-pressure regulator → add a parallel latch-valve bypass
├─ Loss of xenon
│  ├─ tank leak .................. detectable by PVT; not recoverable
│  └─ isolation valve fails closed ... mitigated: series-parallel valve train
└─ Loss of pointing during SK burn
   ├─ ACS propellant exhausted ... mitigated: independent N2H4 tank, gauged
   └─ ACS thruster fails on ...... mitigated: series latch valve per thruster
```

**The line that earns the marks is the third one.** A shared propellant supply
between the apogee engine and the station-keeping thrusters turns *one blocked
filter* into the loss of both orbit raising and fifteen years of station-keeping.
The independent hydrazine ACS costs ~5 kg over sharing the bipropellant supply
and removes an entire branch of this tree — which is the Apollo SPS argument
applied to a comsat: **remove the mechanism rather than add the redundancy**
`[SLPRE]` `[engine-database A.8.3]`.

## §3. Pugh matrices and sensitivity (D6)

### Architecture matrix

**Datum: candidate A, all-chemical** — the incumbent. **Candidate B is gated out
at R3.7** and is not scored.

| criterion | w | justification tied to the mission statement | A (datum) | C hybrid |
|---|---|---|---|---|
| performance | 10 | Δv is fixed; Isp only buys launch mass | 0 | +2 |
| mass | 22 | "every kilogram you remove from the wet mass is worth real money"; both launchers charge by kilogram | 0 | **+2** (921.7 kg) |
| complexity | 12 | six satellites, one bus design, 42 months | 0 | **−2** (two propulsion systems) |
| reliability | 15 | 15-year design life with no servicing | 0 | **−2** (PPU, cathode, xenon feed) |
| manufacturability | 6 | six units; producibility is not the constraint | 0 | −1 |
| cost | 20 | launch cost is charged by kilogram and dominates the propulsion budget | 0 | **+2** |
| mission fit | 15 | R3.7's 45 days is a customer requirement with a stated revenue value | 0 | 0 (both meet it) |
| **weighted total** | **100** | | **0** | **+44** |

**Sensitivity.** Nothing flips within ±50 %. The gap closes only if the
**complexity** weight rises to 34 (+183 %) or the **reliability** weight rises to
37 (+147 %). Report it as robust — and note *why* it is robust: candidate C wins
on the two heaviest criteria (mass 22 and cost 20) and loses on two lighter ones,
so the answer is stable unless you believe reliability alone is worth more than
a third of the decision. For a spacecraft with a 15-year life and no servicing,
that belief is arguable, and a study that argues it and recommends all-chemical
is a good study.

### ACS sub-trade matrix

**Datum: independent monopropellant hydrazine.** Shared electric is gated out on
R3.6 — a Hall thruster cannot produce a 0.05 N·s impulse bit repeatable to ±10 %,
and it cannot point while it is station-keeping.

| criterion | w | justification | N₂H₄ (datum) | GN₂ | butane | shared bipropellant |
|---|---|---|---|---|---|---|
| system mass | 20 | launcher charges by kilogram; the spread is 8.8–26.9 kg | 0 | **−2** (23.2 kg) | −1 (20.2 kg) | **+2** (8.8 kg) |
| fault-tree independence | 20 | a shared supply couples ACS loss to main-propulsion loss | 0 | +1 | +1 | **−2** |
| minimum impulse bit | 15 | R3.6: ≤ 0.05 N·s repeatable to ±10 % | 0 | **+2** (gas, fast valve) | 0 | **−2** (a 10 N thruster cannot; dedicated small thrusters needed) |
| 15-year ageing / leak | 20 | R3.10 and the design life; every joint is a 15-year leak path | 0 | **−2** (300 bar for 15 years) | −2 (two-phase, needs thermal control) | +1 (shared, already qualified) |
| complexity | 10 | one bus design across six satellites | 0 | +1 | +1 | 0 |
| cost | 15 | six units; hardware count drives it | 0 | +1 | +1 | +1 |
| **weighted total** | **100** | | **0** | **−5** | **−15** | **+5** |

**Sensitivity — and this is the interesting one.** The gap between the winner
(shared bipropellant, +5) and the datum (independent hydrazine, 0) is **five
points**, and it is flipped by:

| weight | flips at | change needed |
|---|---|---|
| system mass | 17.5 | **−12 %** |
| fault-tree independence | 22.5 | **+12 %** |
| minimum impulse bit | 17.5 | +17 % |
| 15-year ageing | 15.0 | −25 % |
| cost | 10.0 | −33 % |

**A 12 % change in either of two weights flips the answer.** By the project
file's own standard, that is "a coin toss dressed as engineering", and the memo
must say so. The honest conclusion is:

> The ACS sub-trade is not decided by the current data. The measurement that
> would settle it is the demonstrated minimum-impulse-bit repeatability of the
> small bipropellant thruster over a 15-year duty-cycle profile. If it meets
> 0.05 N·s ±10 %, share the supply and accept the fault-tree coupling with a
> series-parallel isolation architecture; if it does not, fly the independent
> hydrazine system and pay 5.3 kg.

That paragraph is worth more marks than the matrix that produced it.

## §4. Rubric — Project 3, out of 100

| deliverable | marks | what earns them |
|---|---|---|
| **D1 sizing** | **25** | 4: Δv budget with every term named. **6: all three architectures sized at a stated constant** (delivered dry mass or BOL — either, if declared). **5: candidate B's transfer duration computed and the requirement violation quantified** `[TS P3.4]` — this is the project's arithmetic elimination and missing it costs all five. **6: the ACS sized four ways** with tank mass, not just propellant mass. 4: the EP assumption table, so a reader can substitute their own |
| **D2 mass budget** | **15** | 6: basic → MGA → predicted per subsystem, both propulsion systems. 4: system margin. **3: the 10 % performance reserve on a 15-year station-keeping budget** — the project file names this rate explicitly. 2: gauging uncertainty carried into the reserve |
| **D3 reliability** | **12** | 4: part count. **4: the shared-versus-separate fault tree to three levels**. 2: FMEA. 2: what a 15-year life does to the demonstrated-reliability argument |
| **D4 manufacturability and cost** | **12** | 4: UCI. 4: NRI over six units. **4: the revenue penalty from R3.7 costed in the same units as the mass saving** — the project asks for this explicitly and it is where all-electric dies |
| **D5 risk** | **8** | 5: eight risks with retirement points. 2: two non-technical (xenon supply and export control are the obvious pair). 1: one created by the recommendation |
| **D6 Pugh + sensitivity** | **18** | 3: weights before scores. 3: real datum, B gated not scored. 3: evidence per score. **4: the ACS sub-trade run as its own matrix.** **5: the sensitivity, and full marks require identifying the ACS trade as a coin toss and naming the measurement that settles it** |
| **D7 memo** | **10** | 3: recommendation first. 2: three numbers. 3: what it costs. **1: the mass-versus-time chart referenced as the single figure.** 1: one page |

## §5. Common weak answers

1. **"All-electric, because 1,954 kg."** It takes 367 days against a 45-day
   requirement `[TS P3.4]`, and the revenue penalty is 16 % of programme value.
   *What it reveals:* Δv was budgeted and time was not.
2. **Sizing electric propulsion without checking the power cap.** R3.8's 6 kW
   runs one 5 kW thruster. Students routinely assume four.
3. **"The ACS sub-trade turns on specific impulse."** The project file says in
   advance: *"If your answer is 'specific impulse', re-read your own numbers."*
   GN₂ has 1.7× R-236fa's Isp and is within 14 % on system mass; hydrazine has
   3.3× GN₂'s and saves 39 %.
4. **Sizing the ACS propellant and not the ACS tank.** 11.8 kg of nitrogen needs
   a 35 L COPV `[TS P3.12]`; the tank and regulation are half the system.
5. **Claiming ±1 % gauging.** It is ±2–3 % with a *combination* of methods and
   the project says so in the requirement (R3.10 is ±3 %, which is the number the
   gauging must achieve, not the number it achieves easily).
6. **Comparing A and C at constant BOL and reporting "no saving".** An artefact
   of the requirement's wording. State the comparison basis.
7. **Sharing the propellant supply without drawing the fault tree.** Sharing is
   the lightest answer by 5.3 kg and it couples two loss-of-mission branches.
   Either is defensible; not noticing is not.
8. **Treating the EP black box as free of failure modes.** It has a PPU, a
   cathode and a high-pressure xenon regulator, and they are single-string until
   you pay for a second string at 15 kg.

---
