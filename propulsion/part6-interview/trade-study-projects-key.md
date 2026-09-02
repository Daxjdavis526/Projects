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

# Project 4 — A reusable medium-lift booster engine

## §1. Reference sizing (D1)

### The chamber-pressure trade curve — the project's technical core

Methalox at O/F 3.6, $c^*_{ideal}$ = 1,873.0 m/s `[TS P4.1]`, $\eta_{c^*}$ = 0.97,
so delivered $c^*$ = 1,816.8 m/s. At each chamber pressure the area ratio is the
one that gives $p_e$ = 0.55 bar — slightly overexpanded at sea level, and
comfortably above the separation limit (checked below). Thrust is held at R4.1's
2,400 kN sea level throughout.

| $p_c$ (bar) | ε | $C_F$ (SL) | $A_t$ (m²) | $D_t$ (mm) | $I_{sp,SL}$ (s) | $\dot m$ (kg/s) | pump power (MW) | $h_g$ (W/m²K) | **$q_{throat}$ (MW/m²)** | $\Delta T$ through an 0.8 mm liner (K) | $N_f$ scaling |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **100** | 20.93 `[TS P4.2]` | 1.6491 `[TS P4.6]` | 0.1455 `[TS P4.10]` | 430.5 | **305.5** | 801.2 | **19.37** `[TS P4.14]` | 21,850 `[TS P4.20]` | **59.5** `[TS P4.24]` | 159 | ~181 |
| **150** | 28.80 `[TS P4.3]` | 1.7013 `[TS P4.7]` | 0.0940 `[TS P4.11]` | 346.0 | **315.2** | 776.4 | **28.43** `[TS P4.15]` | 31,572 `[TS P4.21]` | **86.0** `[TS P4.25]` | **229** `[TS P4.28]` | ~87 |
| **200** | 36.42 `[TS P4.4]` | 1.7358 `[TS P4.8]` | 0.0691 `[TS P4.12]` | 296.7 | **321.6** | 761.1 | **37.32** `[TS P4.16]` | 40,983 `[TS P4.22]` | **111.6** `[TS P4.26]` | 298 | ~51 |
| **300** | 50.51 `[TS P4.5]` | 1.7810 `[TS P4.9]` | 0.0449 `[TS P4.13]` | 239.1 | **330.0** | 741.7 | **54.82** `[TS P4.17]` | 59,185 `[TS P4.23]` | **161.2** `[TS P4.27]` | **430** `[TS P4.29]` | ~25 |

Bartz inputs, from Module 10's fixed recipe: $c_{p0}$ = 2,940.5 J/(kg·K),
$Pr_0$ = 0.8529, $\mu_0$ = 10⁻⁴ Pa·s, $\sigma$ = 1.3689 `[TS P4.18]`,
$T_{aw}$ = 3,523.7 K `[TS P4.19]`, $T_{wg}$ = 800 K, $r_c$ = 1.5 × throat radius.
**Bartz is ±20–30 % at the throat at best**, so the heat fluxes are an ordering
tool, not a design load; the $N_f$ column is a Coffin–Manson scaling
$N_f \propto q^{-2}$ anchored at 100 cycles at 80 MW/m² **[J]**, and it is a
ranking, not a life prediction. Saying that out loud is part of the deliverable.

Separation check at the 150 bar point: $M_e$ = 3.819 at ε = 28.80
`[TS P4.31]`, and Schmucker's correlation gives $p_{sep}$ = **31.6 kPa**
`[TS P4.32]` against a wall pressure of 55 kPa at the exit — **attached at sea
level with ~1.7× margin.** At 300 bar and ε = 50.5 the margin is thinner and the
start transient becomes the design case `[Ostlund02][OMK05][Schmucker73]`.

Coolant closure at 150 bar: taking 15 % of the methane flow (25.3 kg/s) through
the chamber jacket against a ~48 MW chamber heat load gives a bulk temperature
rise of **542 K** `[TS P4.30]` — supercritical methane, no boiling crisis, but
a large enough rise that the last channels run hot and the Dittus–Boelter
correlation is being used outside its comfort zone. That is the number that sets
channel count and aspect ratio.

### Reading the curve

Four things move together, and they move in opposite directions:

1. **Isp rises and saturates.** 100 → 300 bar buys **24.5 s** (305.5 → 330.0),
   but the first half of the range buys 16.1 s of it and the second half 14.4 s
   — and most of the gain is the *area ratio* the higher pressure permits, not
   the pressure itself.
2. **Throat diameter falls almost as $p_c^{-1/2}$**: 430.5 → 239.1 mm. That is
   the entire mass argument for high chamber pressure. Engine mass scales roughly
   with the chamber and nozzle *surface*, so halving the throat diameter is worth
   far more than 24.5 s of Isp on a T/W-limited engine.
3. **Pump power rises almost linearly**: 19.4 → 54.8 MW. At 300 bar the turbine
   is delivering RS-25-class power to a booster engine, and the preburner and
   turbine become the mass and life drivers rather than the chamber.
4. **Throat heat flux rises faster than linearly with $p_c$** (Bartz gives
   $q \propto p_c^{0.8}$ at fixed geometry, but the throat is also shrinking, so
   the observed scaling here is close to $p_c^{0.9}$): 59.5 → 161.2 MW/m². The
   through-thickness ΔT rises with it, 159 → 430 K, and **low-cycle fatigue life
   falls with the square of the strain range.**

### The requirement conflict, stated plainly

- **R4.5** (dry mass ≤ 2,200 kg, T/W ≥ 111) pushes *up* the pressure axis.
- **R4.6 and R4.7** (10 flights between overhauls, 25 flights, ≥ 100 starts)
  push *down* it.

They do not both close at the same point, and the study's job is to find where
they cross.

**At 100 bar:** throat 430 mm, exit 1,966 mm, and the chamber and nozzle
structure of a 2,400 kN engine at that size. The only measured data point in the
reference file for a large methalox ORSC engine is the **BE-4 at 5,400 kg dry
for 2,460 kN at 140 bar** `[engine-database A.3]` — a T/W of ~46:1. Nothing in
the public record supports 2,200 kg at 100 bar. **Candidate "ORSC at 100 bar" is
eliminated at the compliance gate on R4.5**, and the elimination must be stated
with its evidence rather than asserted.

**At 300 bar:** the fatigue scaling gives ~25 cycles against R4.7's requirement
of 25 flights *and ≥ 100 starts including acceptance*. Even allowing Bartz's
±30 %, the margin is not there without a different wall — a thinner liner, a
lower gas-side temperature through more film cooling (which costs Isp), or a
material change. The only 300 bar-class figures in the file are **SpaceX claims
with no independent verification of chamber pressure, Isp, dry mass or T/W at
all** `[engine-database A.3.5]`, and a trade study cannot rest a life argument on
them.

**At 150–200 bar** both requirements are within reach: Isp 315–322 s against
R4.8's 300 s floor, throat 297–346 mm, pump power 28–37 MW, and a fatigue
scaling of 50–90 cycles that a real wall design can be argued up to 100 starts.

### Life analysis (project-specific deliverable)

| | |
|---|---|
| **life-limiting component** | the main combustion chamber liner at the throat |
| **damage mechanism** | thermal low-cycle fatigue — "doghouse" ratcheting of the coolant-channel land: each start/stop cycles the hot-gas-side surface through a large compressive-then-tensile plastic strain excursion, the land thins, bulges into the channel and eventually splits |
| **secondary mechanisms** | blanching of the copper liner (oxidation–reduction cycling), turbine blade thermal fatigue on the ox-rich side, bearing wear, and coking — **which is why methane rather than RP-1**: methane does not coke, and a booster that must fly 25 times with borescope-only inspection cannot carry a coking mechanism |
| **the parameter to instrument** | coolant outlet temperature per circuit, trended flight-to-flight. A rising outlet temperature at constant flow and power level is channel blockage or land distortion, and it is the earliest available signature. Second: chamber-pressure-to-pump-discharge ratio, which drifts as the injector fouls |
| **the inspection that matters** | borescope of the throat land tips at every flight, and the ten-flight overhaul exists because that is the point at which the trend, not the image, becomes the decision |

### Reuse economics (project-specific deliverable)

Let $C_{unit}$ be the recurring cost of one engine, $C_{NRI}$ the non-recurring,
$N_{fleet}$ the number of engines built and $c_{ref}$ the refurbishment cost per
engine-flight. Cost per engine-flight over $n$ flights:

$$C(n) = \frac{C_{unit}}{n} + c_{ref} + \frac{C_{NRI}}{N_{fleet}\,n}$$

With the UCI/NRI indices of D4 rather than currency, and normalising the
gas-generator option to $C_{unit}$ = 1.00:

| architecture | $C_{unit}$ | $C_{NRI}$ | $c_{ref}$/flight | crossover against expendable GG |
|---|---|---|---|---|
| GG methalox, 150 bar | 1.00 | 1.0 | 0.06 | **n ≈ 2.3** |
| ORSC methalox, 150 bar | 1.45 | 2.2 | 0.05 | **n ≈ 3.6** |
| ORSC methalox, 300 bar | 1.80 | 3.4 | 0.14 (overhaul at 10 → refurbish more) | **n ≈ 7.1**, and life caps it near 25 |
| FFSC methalox, 300 bar | 2.10 | 4.6 | 0.14 | **n ≈ 9.8** |

At 180 engines a year (R4.10) and 25 flights per booster, **every option crosses
well inside 25 flights, so the reusability requirement does pay for itself** —
which is the answer the project asks for, and it is not the interesting part. The
interesting part is that **the crossover moves the wrong way with chamber
pressure**: the architecture with the best Isp has the worst refurbishment cost
and the highest NRI, so raising $p_c$ buys performance and *sells* the economic
case. Say that.

### Company-claimed numbers used, and what happens if they are 15 % optimistic

| claim | used for | if 15 % optimistic |
|---|---|---|
| Raptor 2/3 at 300–330 bar, T/W 141–164 `[claim]` `[engine-database A.3.5]` | the upper end of the $p_c$ trade, and the existence proof that 2,200 kg at 2,400 kN is achievable at all | 300 bar → 255 bar and T/W 164 → 139. **R4.5 becomes unachievable at any pressure in the trade**, and the requirement itself must be renegotiated. This is the single largest exposure in the study |
| Merlin 1D T/W 184:1 `[claim]` `[engine-database A.3]` | the argument that a gas generator can be light | 184 → 156, still the lightest architecture. The GG case survives |
| BE-4 2,460 kN at 140 bar, 5,400 kg (specification + a Nov-2025 uprate claim) `[engine-database A.3.4]` | the only *measured-ish* large methalox ORSC data point | mass is not a claim in the optimistic direction; the thrust uprate to 2,847 kN is, and it is unclear which vehicles fly which rating |
| Archimedes 730 kN, deliberately de-rated for life `[claim, unflown]` `[engine-database A.3]` | the qualitative argument that de-rating buys reflight life | unaffected — it is an architectural statement, not a number |

**The honest summary line for the memo:** *the recommendation's T/W requirement
rests on unverified manufacturer claims; if they are 15 % optimistic, R4.5 does
not close at any chamber pressure and the vehicle needs ten engines rather than
nine.*

## §2. Recommended architecture, with the argument both ways

**Recommendation: oxidiser-rich staged combustion, LOX/LCH₄, $p_c$ = 150 bar
(design headroom to 165), ε = 28.8, regeneratively cooled milled-channel
copper-alloy chamber with a GRCop-class liner, hydrostatic bearings, coaxial
swirl gas–liquid injector, and a head-pressure start for the three in-flight
relights.**

### The argument for

1. **It is the point where R4.5 and R4.7 both close.** 315.2 s SL (15 s above the
   R4.8 floor), 346 mm throat, 28.4 MW of pump power, 86 MW/m² of throat heat
   flux and a fatigue scaling of ~87 cycles that a real wall can be argued to
   100 starts.
2. **Methane, not kerosene, because of R4.6.** RP-1 cokes the cooling channels
   and the injector face; methane does not. A booster inspected only by borescope
   for ten flights cannot carry a deposition mechanism it cannot see.
3. **Oxidiser-rich rather than fuel-rich because of the throttle requirement.**
   R4.3 demands 20 % thrust with restart. An ORSC powerhead delivers hot
   oxidiser *gas* to the injector, and a gas–liquid coaxial swirl element holds
   its Δp/$p_c$ far better across a 5:1 turndown than a liquid–liquid element,
   because the gas-side pressure drop is dominated by the post geometry rather
   than by $\dot m^2$.
4. **Deliberately low chamber pressure is a stated, defended industrial choice.**
   Blue Origin runs the BE-4 at 140 bar against the RD-180's 267 bar and says
   plainly that this is a life-and-reusability decision, not a limitation
   `[engine-database A.3]`. This recommendation is the same argument with the
   arithmetic shown.
5. **Hydrostatic bearings.** Also a stated life-driven choice on the BE-4, and
   at 28 MW and 100+ starts the rolling-element alternative is a scheduled
   replacement item, which R4.6's inspection-only turnaround forbids.

### The argument against — what the recommendation costs

1. **It loses 14.8 s of Isp to the 300 bar option** and 6.4 s to 200 bar. On a
   first stage that is roughly 1.5 % of payload — real money over 25 flights.
2. **T/W.** At 150 bar the engine is bigger than at 300 bar and R4.5's 2,200 kg
   is harder. The recommendation is betting that additive manufacturing and
   integrated plumbing close a gap that the only measured comparable (BE-4 at
   5,400 kg) does not close.
3. **ORSC is the hardest cycle to develop.** The enabling technology is an inert
   enamel coating on every metal surface in contact with hot oxygen-rich gas, and
   that single item is why the West could not copy the cycle for thirty years
   `[SLPRE][Clark]` `[engine-database A.6]`. Against R4.11's 48 months, a gas
   generator is a far safer schedule.
4. **The gas generator is only 7 points behind in the matrix and is the only
   architecture with a demonstrated 20-flight reuse record.** That record belongs
   to Merlin, a gas generator `[engine-database A.3]`.

**Two criteria the recommendation loses on: cost and manufacturability**, both to
the gas generator, both by −2, and the matrix says so.

## §3. Pugh matrix and sensitivity (D6)

**Datum: ORSC methalox at 150 bar.** **ORSC at 100 bar is gated out on R4.5** and
is not scored. Fuel-rich staged combustion is not carried as a candidate: at
O/F 3.6 a fuel-rich methane preburner runs cool and soot-free but the turbine
flow is a large fraction of the fuel, which caps chamber pressure exactly where
this engine wants headroom — say so in one line rather than omitting it silently.

| criterion | w | justification tied to the mission statement | ORSC 150 (datum) | ORSC 200 | ORSC 300 | GG 150 | FFSC 300 |
|---|---|---|---|---|---|---|---|
| performance | 12 | R4.8 sets a 300 s floor and every candidate clears it; Isp buys payload, not compliance | 0 | +1 | +2 | **−2** (302.6 s, 2.6 s of margin) | +2 |
| mass / T/W | 15 | R4.5 is a hard 2,200 kg and no measured engine achieves it | 0 | +1 | +2 | −1 (turbine exhaust duct; more propellant for the same Δv) | +2 |
| complexity | 10 | 48 months to first flight with a new cycle | 0 | −1 | −2 | **+2** | −2 |
| **life / reuse** | **22** | **"the company's entire economic case rests on flying each booster 25 times"** — R4.6 and R4.7 are the business case | 0 | −1 (51 cycles) | **−2** (25 cycles) | 0 (no ox-rich hot gas, but an open turbine and a duct) | **−2** |
| manufacturability | 10 | R4.10: 180 engines/year at steady state | 0 | −1 | −2 | +1 | −2 |
| cost | 16 | 180 engines/year and a 25-flight amortisation | 0 | −1 | −2 | **+2** | −2 |
| mission fit | 15 | R4.2/R4.3/R4.4: 40–100 % throttle, 20 % landing throttle, three relights on the vehicle's own resources | 0 | 0 | −2 (throttle and relight both harder at 300 bar) | −2 (GG relight needs a start cartridge or spin gas; R4.12 forbids ground support) | −1 |
| **weighted total** | **100** | | **0** | **−31** | **−92** | **−7** | **−77** |

### Sensitivity

The gap to the gas generator is **7 points**, and it is inside ±50 % on **five of
the seven weights**:

| weight | flips to GG at | change |
|---|---|---|
| performance | 8.5 | **−29 %** |
| mass / T/W | 8.0 | **−47 %** |
| complexity | 13.5 | **+35 %** |
| cost | 19.5 | **+22 %** |
| mission fit | 11.5 | **−23 %** |
| manufacturability | 17.0 | +70 % |
| life / reuse | — | never flips (GG scores 0 here) |

**Report:** *this decision is close to a coin toss and the memo must say so.* A
22 % increase in the cost weight — entirely plausible for a company whose case
rests on price per flight — puts the gas generator ahead. The two-criterion
perturbation makes it worse: raising cost 22 → 26 and lowering mission fit
15 → 12 puts the GG ahead by 8.

**The measurement that settles it** is not a weight. It is the demonstrated
low-cycle fatigue life of the chosen liner at 86 MW/m², measured on a subscale
chamber to 150 thermal cycles. If the wall makes 150 cycles, ORSC at 150 bar is
right and the Isp is worth having. If it makes 60, the engine must run cooler,
which means lower $p_c$, which means the gas generator was the better answer all
along because it gets there with a third of the part count.

## §4. Rubric — Project 4, out of 100

| deliverable | marks | what earns them |
|---|---|---|
| **D1 sizing** | **25** | **10: the chamber-pressure trade curve, four points minimum, with $I_{sp}$, throat diameter, pump power, peak throat heat flux and a cycles-to-crack estimate** `[TS P4.2–P4.29]`. 5: every candidate cycle sized, not just the winner. 4: $C_F$ computed at the actual ε and back pressure, with a separation check `[TS P4.31, P4.32]`. 3: coolant bulk rise and channel implication `[TS P4.30]`. 3: Bartz's accuracy stated and the fatigue scaling labelled as a scaling |
| **D2 mass budget** | **15** | 6: engine mass budget by assembly with maturity-based MGA. 4: system margin, and **the R4.5 exceedance reported against the only measured comparable (BE-4, 5,400 kg)**. 3: the propellant reserve for boostback, re-entry and landing. 2: gimbal, harness and controller not forgotten |
| **D3 reliability** | **12** | 4: part count in the five categories — this is where the GG case is made. 3: single-point failures. **3: the life analysis (component, mechanism, instrumented parameter)** — this is a project-specific deliverable and it lives here. 2: what 25 flights does to the demonstrated-reliability argument |
| **D4 manufacturability and cost** | **12** | 4: UCI. 3: NRI over the fleet. **5: the reuse-economics crossover, computed, with the finding that raising $p_c$ moves the crossover the wrong way** |
| **D5 risk** | **8** | 5: eight risks with retirement points. 2: two non-technical. **1: at least one risk created by the recommendation** — the ox-rich enamel process qualification is the obvious one |
| **D6 Pugh + sensitivity** | **18** | 3: weights before scores. 3: real datum, with ORSC-100 gated not scored. 3: evidence per score. **5: the sensitivity, including the finding that five of seven weights flip it inside ±50 %.** **4: the explicit list of company-claimed numbers used and what the recommendation becomes if they are 15 % optimistic** |
| **D7 memo** | **10** | 3: recommendation first. 2: three numbers. **3: what it costs — Isp and T/W, named with magnitudes.** 1: measurable trigger ("if the subscale liner fails before 100 thermal cycles at 86 MW/m², drop to 120 bar or change the wall"). 1: one page |

## §5. Common weak answers

1. **"Copy Raptor."** Every Raptor number is a SpaceX claim with no independent
   verification of chamber pressure, Isp, dry mass or T/W `[engine-database
   A.3.5]`, and the 300 bar point fails the life requirement on the study's own
   fatigue scaling. Copying an engine whose numbers you cannot check, for a
   mission whose requirements differ, is the failure the project warns about in
   its mission statement.
2. **A trade curve with two points.** Four minimum, and the interesting behaviour
   (Isp saturating while heat flux keeps climbing) is invisible with two.
3. **Quoting Bartz heat fluxes to three significant figures.** ±20–30 % at the
   throat, and the key says so every time it uses one.
4. **Presenting the Coffin–Manson number as a life prediction.** It is a ranking
   with an assumed exponent and an assumed anchor. Label it **[J]**.
5. **Choosing 300 bar for the Isp.** 24.5 s over 100 bar sounds large; it is
   1.5 % of payload, against a fatigue life that falls by a factor of seven and a
   pump power that triples.
6. **Choosing RP-1 for the density and not mentioning coking.** R4.6's
   inspection-only turnaround for ten flights is a coking requirement in
   disguise.
7. **Ignoring R4.12.** No ground support connection after lift-off means the
   three relights must come from the vehicle's own resources. A gas generator
   needs a start cartridge (four per mission, consumable, countable) or a
   spin-start system; a head-pressure start needs neither. Students size the
   engine and forget the start system entirely.
8. **Not sizing the deep throttle.** R4.3's 20 % is a stability problem before it
   is a performance problem, and the injector element type is the answer.
9. **A mass budget that omits the gimbal actuators, the controller and the
   harness.** They are inside the R4.5 dry-mass definition on every real
   programme, and the RS-25's contested dry mass is the file's standing warning
   about exactly this: 3,177 kg bare against 3,526 kg installed, and a T/W of
   73:1 or 66:1 depending which you used `[engine-database A.2.5]`.

---

# Project 5 — A strap-on booster for an existing core

## §1. Reference sizing (D1)

### Total impulse, mass fraction and the gross-mass cap

R5.1 demands ≥ 60 MN·s per booster; R5.4 caps gross mass at 27,000 kg. The
propellant needed is $m_p = I_{tot}/(I_{sp}g_0)$, and the gross mass follows from
the architecture's mass fraction:

| candidate | delivered $I_{sp,vac}$ | propellant (kg) | mass fraction | **gross (kg)** | margin on R5.4 |
|---|---|---|---|---|---|
| **A** monolithic filament-wound composite | **286.5** | 21,358 | **0.905** (P120C: 0.924; GEM family 0.894–0.908) | **23,600** | 3,400 kg |
| **B** segmented steel (RSRM architecture) | **268** | 22,829 | **0.85** (Shuttle SRB, `CALC`) | **26,858** | **142 kg** |
| **C** kerolox liquid strap-on | ~290 trajectory-average | 21,098 | ~0.90 stage | ~23,442 | 3,558 kg |
| **D** segmented composite (SRMU-like) | 286.5 | 21,358 | 0.89 | 24,552 | 2,448 kg |

**Candidate B closes R5.4 with 142 kg of margin — 0.5 %.** It is not eliminated,
but it has no growth margin at all, and any study that reports 26,858 kg against
a 27,000 kg cap without saying that the requirement is effectively already
breached has misread its own number. The 0.85-versus-0.924 mass-fraction pair is
**the single most useful argument in Part III** for why monolithic composite
construction won for everything that does not have to be shipped by rail
`[engine-database B.1.7]`.

### The performance figures, closed

At ε = 12 with the AP/Al/HTPB gas model (γ = 1.18, delivered $c^*$ = 1,580 m/s):

| | value | source |
|---|---|---|
| vacuum $C_F$ | **1.7780** | `[TS P5.1]` |
| sea-level $C_F$ | **1.5754** | `[TS P5.2]` |
| $I_{sp,vac}$ = 1,580 × 1.7780 / 9.80665 | **286.5 s** | |
| $I_{sp,SL}$ = 1,580 × 1.5754 / 9.80665 | **253.8 s** | |
| burn-averaged vacuum thrust at 115 s | **521.7 kN** | 60 MN·s / 115 s |
| throat area at $p_c$ = 60 bar | **0.048906 m²** | `[TS P5.3]` |
| throat diameter | **249.5 mm** | |

**R5.2's 1,650 kN cap is not binding.** The burn-time window R5.3 imposes
(90–140 s) forces the average thrust into 429–667 kN, and even the peak of the
shaped trace is ~660 kN. The structural cap is generous by a factor of 2.5. That
is a finding worth a sentence in the memo, because it means the design is
**impulse-and-mass limited, not thrust limited**, and it removes the constraint
students spend the most time on.

### Internal ballistics and the grain (project-specific deliverable)

Propellant: AP/Al/HTPB, $\rho_p$ = 1,800 kg/m³, **$n$ = 0.35**,
$a$ = 3.394197 × 10⁻⁵ m/s/Paⁿ (i.e. $r$ = 8.0 mm/s at 60 bar `[TS P5.7]`).

| point in the burn | $A_b$ (m²) | $K_n = A_b/A_t$ | equilibrium $p_c$ | source |
|---|---|---|---|---|
| **peak, t ≈ 2 s** | 15.238 | 311.6 | **77.6 bar** | `[TS P5.5]` |
| **nominal / burn-average** | 12.897 | 263.7 | **60.0 bar** | `[TS P5.4]` |
| **after fin burnout, t ≈ 55 s** | 12.200 | 249.5 | **55.1 bar** | `[TS P5.6]` |

**The thrust trace and R5.5.** Sea-level thrust at the 77.6 bar peak is
$p_c A_t C_F$ = 7.76 MPa × 0.048906 × 1.628 = **618 kN**; at 55.1 bar it is
**419 kN**. That is a **32 % roll-off**, comfortably clearing R5.5's ≥ 25 %
before T+62 s, and it is produced by a **20 % reduction in burning area**,
because $p \propto K_n^{1/(1-n)}$ and $1/(1-n) = 1.54$ amplifies the area change.

**The grain that does it: a finocyl** — a cylindrical bore through the full
length with radial fins in the forward third. The fins supply the extra 3.0 m² of
initial burning area and burn out at roughly 40 % of web, at which point the area
drops to the cylindrical-bore value and then grows slowly as the bore regresses,
giving the regressive-then-neutral trace the vehicle needs through max-Q. This is
the same *function* as the Shuttle SRB's 11-point forward star and
double-truncated-cone aft segments — a head-end regressive trace that unloads the
vehicle at maximum dynamic pressure `[engine-database B.1]` — implemented in a
monolithic grain that has no segment boundaries to place it at.

**What it costs in volumetric loading.** Propellant volume is 11.87 m³. At a
case inner radius of 0.78 m (1.6 m outer diameter less insulation) and a 6.8 m
grain, a plain cylindrical bore of radius 0.302 m holds 11.05 m³; the fins
remove a further ~0.35 m³ of propellant volume at the forward end, so the grain
must run ~7.3 m to hold the load. **Volumetric loading falls from ~0.87 to ~0.83
— about 4 points, and roughly 0.5 m of extra length.** A solid-booster study
without a grain design is a study without a design, and a grain design without
its volumetric-loading cost is a sketch.

The port-to-throat ratio is $A_p/A_t$ = 0.286/0.0489 = **5.85**, safely above the
~4 below which erosive burning becomes a design problem.

### Temperature sensitivity (project-specific deliverable)

With $\sigma_p$ = 0.002 K⁻¹ and $n$ = 0.35, $\pi_K = \sigma_p/(1-n)$ =
**0.003077 K⁻¹** `[TS P5.8]`. Over R5's stated bulk range of −5 °C to +35 °C,
i.e. ±20 K about 15 °C:

| | cold (−5 °C) | nominal (15 °C) | hot (+35 °C) |
|---|---|---|---|
| $p_c$ and thrust | **×0.9403** (−6.0 %) `[TS P5.10]` | 1.000 | **×1.0635** (+6.3 %) `[TS P5.9]` |
| burn rate | ×0.9403 | 1.000 | ×1.0635 |
| burn time | ×1.0635 (+6.3 %) | 115 s | ×0.9403 (−6.0 %) |
| peak $p_c$ | 73.0 bar | 77.6 bar | **82.5 bar** |
| peak SL thrust ($C_F$ = 1.6315 hot `[TS P5.11]`) | ~580 kN | 618 kN | **657 kN** |
| total impulse | essentially unchanged (same propellant; $I_{sp}$ rises ~0.5 % with $p_c$) | 60 MN·s | ~60.3 MN·s |

**The vehicle closes at both extremes**: peak thrust of 657 kN hot is 40 % of the
1,650 kN structural cap, and burn time of 108–122 s stays inside R5.3's 90–140 s
window.

**But R5.6 does not close by itself.** A 3 % thrust imbalance between paired
boosters corresponds to a bulk-temperature difference of only
$0.03/0.003077 =$ **9.8 K**. Two boosters on opposite sides of a vehicle, one in
morning sun and one in shade, can differ by more than that. **The requirement is
therefore a thermal-conditioning requirement on the pad**, not a propellant
requirement: the boosters must be soaked to within ~5 K of each other, verified
by embedded bulk-temperature instrumentation, before the count can proceed. That
sentence is the deliverable. *Solids are the only architecture here whose
performance depends on what the weather was like last week*, and the rubric
checks that you noticed.

### Transport and handling (project-specific deliverable)

Grain 7.3 m plus forward dome, nozzle and skirt gives an overall length of
**~9 m** at **1.6 m diameter and 23,600 kg**. That is an over-dimension permit
load on a public road — a routine one. **The monolithic composite motor is
road-legal in one piece**, and R5.9 is satisfied without a barge.

**This destroys the entire rationale for candidate B.** Segmentation exists for
one reason: it lets you cast in one place, ship by rail, and assemble somewhere
else `[engine-database B.1.7]`. The site has **no rail connection** and the motor
is road-legal whole. Candidate B therefore pays 0.055 of mass fraction, three
field joints, a field-assembly building, and the entire O-ring failure mode
`[Rogers86]` **for a capability the programme does not need.**

Hazard classification: an AP/Al/HTPB composite of this size is normally **Class
1.3** (mass fire) rather than 1.1 (mass detonation), which is the difference
between a facility with a 400 m quantity-distance arc and one with 1,200 m,
between a normal road permit and a specialist explosives convoy, and between an
insurable and a barely-insurable operation. **Class 1.3 and Class 1.1 are
different businesses**, and stating which one you are in is part of D4.

### Pad and ground-systems delta

| candidate | pad delta |
|---|---|
| A / D (solid) | booster erection and mate hardware, ordnance safing, an FTS linear-shaped-charge run per booster, bulk-temperature instrumentation and a conditioning plan. **No propellant loading at all** |
| B (segmented solid) | all of the above, plus a field-joint assembly building, joint heaters and their power, and a joint-assembly workforce with a qualification programme |
| C (liquid) | **a second complete propellant loading system**: LOX storage and transfer, RP-1 storage, chilldown and drainback, purge, and a hold capability — on a pad that is fixed and cannot be modified except for structural hardpoints and *one* additional command line (R5) |

**Candidate C is eliminated on the mission statement, not on physics.** One
additional command line cannot carry a liquid booster's loading, conditioning,
health-monitoring and abort interfaces; and the ignition simultaneity of R5.7
(≤ 30 ms) and the thrust imbalance of R5.6 (≤ 3 % at any instant) are hard for
two independently starting liquid engines with turbopump spin-up transients,
where they are natural for two solid motors fired from a common ordnance train.
The 30-month schedule (R5.12) for a new ~500 kN engine — the RD-107A's 839 kN is
too large and does not throttle — is not credible.

## §2. Recommended architecture, with the argument both ways

**Recommendation: candidate A — a monolithic carbon-fibre filament-wound
composite case, a single monolithic HTPB/AP/Al cast, a finocyl grain giving a
77.6 → 55 bar regressive-then-neutral trace, a fixed submerged carbon-phenolic
nozzle at ε = 12 with a carbon–carbon throat insert, and no thrust vector
control.**

### The argument for

1. **Mass fraction.** 0.905 against 0.85 buys 3,258 kg of gross mass, which is
   the difference between 3,400 kg of margin on R5.4 and 142 kg.
2. **The reason for segmentation does not apply here.** No rail, road-legal
   whole, no casting facility on site either way. Segmentation would be paying
   the cost of a capability the programme cannot use.
3. **It deletes the field joint, and with it the single most instructive failure
   mode in the whole course** `[Rogers86]` `[engine-database B.1.6]`.
4. **Fixed nozzle.** R5.6 says TVC is not required from the boosters; the core
   gimbals. A vectorable nozzle would add a flexseal, actuators, power and a
   control interface the one available command line cannot carry.
5. **Storage.** R5.8 wants five years fully assembled with an annual inspection.
   A cast solid in a composite case does that; a loaded liquid stage does not,
   and a segmented steel motor does it only with joint-seal recertification.

### The argument against — what the recommendation costs

1. **Isp and controllability, to candidate C.** The liquid strap-on delivers
   ~290 s trajectory-average against 286.5 s, can be throttled, can be shut down,
   and can be tested before flight. **Once lit, a solid has no throttling and no
   shutdown**, and that is a real loss on a crew-rated or high-value payload.
2. **Temperature sensitivity.** ±6.3 % of thrust across the bulk range, and a
   3 % imbalance requirement that translates into a 9.8 K conditioning
   tolerance. The liquid option has no equivalent problem.
3. **Facility risk.** A monolithic 21.4 t cast in one pour needs a mixer, a
   casting pit and a cure oven sized for the whole motor, and the site has none —
   so the motor is cast elsewhere and shipped whole, which is exactly why the
   road-legality finding is load-bearing. If the transport analysis is wrong, the
   architecture is wrong.
4. **The SRMU precedent.** The segmented-composite route (candidate D) was
   famously troubled: a case failure during a 1991 structural test killed a
   worker and slipped the programme by years `[_verify-solid-coldgas A.4]`.
   Composite cases are not free, and a monolithic one is a larger article than
   any of the segments that failed.

**Two criteria the recommendation loses on: performance and mass — both to the
liquid strap-on**, which is 3.5 s better on Isp and ~160 kg lighter at gross. The
matrix records that.

## §3. Pugh matrix and sensitivity (D6)

**Datum: candidate A**, the modern default and the architecture the programme
would build without a study.

| criterion | w | justification tied to the mission statement | A (datum) | B segmented steel | C kerolox liquid | D segmented composite |
|---|---|---|---|---|---|---|
| performance | 8 | R5.1's total impulse is a floor, not a target; Isp only buys gross-mass margin | 0 | −2 (268 s) | **+1** (~290 s) | 0 |
| mass | 12 | R5.4's 27,000 kg is the binding cap | 0 | **−2** (26,858 kg — 142 kg of margin) | **+1** (23,442 kg) | −1 (24,552 kg) |
| complexity | 10 | 30 months to first flight (R5.12) | 0 | −2 (three field joints, field assembly) | −2 (second pad propellant system) | −1 |
| reliability | 15 | 8 flights a year for 20 years; R5.6 and R5.7 are start-transient requirements | 0 | −1 (RSRM's post-1988 record is excellent; the joint is still 3 more failure paths) | **−2** (30 ms simultaneity, 3 % imbalance, turbopump start transients) | −1 |
| manufacturability | 15 | 16–32 boosters/year for 20 years | 0 | 0 (mature supply chain, but field assembly labour) | −2 (a new engine line at 16–32/yr in 30 months) | −1 (three winding runs plus joints) |
| cost | 22 | R5.11: recurring cost is binding | 0 | −1 | −2 (the cost is mostly not in the booster) | −1 |
| mission fit | 18 | **no rail connection, no casting facility, one additional command line, 5-year assembled storage** | 0 | **−2** (segmentation solves a problem this site does not have) | **−2** (one command line; no 5-year loaded storage) | 0 |
| **weighted total** | **100** | | **0** | **−133** | **−140** | **−74** |

### Sensitivity

**No weight, singly or in pairs, flips this answer within ±50 %**, and the gap to
the nearest alternative (candidate D, −74) is large. Report that as the result:
**this is a robust decision, and the robustness is a property of the mission
statement, not of the analysis.** Three site facts do the work — no rail, no
casting facility, one command line — and every one of them is a sentence in the
mission statement rather than a number in the requirements table.

**The requirement change that would flip it**, and which the memo should name as
the change-of-mind trigger: if the launch site gained a rail connection *and* the
gross-mass cap rose above ~28,000 kg, candidate B's mature supply chain and
existing tooling would become competitive on cost, which is the criterion with
the largest weight. Absent that, it does not.

**And the one honest caveat:** candidate A wins on five of seven criteria and
ties on one. That is close to the pattern the project file warns about. It is
defensible here only because the recommendation **does** lose on two criteria to
candidate C — performance and mass — and because the losses to C are real rather
than manufactured. If your matrix has A winning every cell, you have flattened
the liquid option and should score it again.

## §4. Rubric — Project 5, out of 100

| deliverable | marks | what earns them |
|---|---|---|
| **D1 sizing** | **25** | 4: total impulse → propellant → gross for all candidates against R5.4. **8: the internal ballistics — $K_n$, equilibrium $p_c$ at three points, and the thrust trace computed rather than sketched** `[TS P5.3–P5.7]`. **6: the grain design, with the volumetric-loading cost stated**. 4: $C_F$ at the actual ε for both SL and vacuum `[TS P5.1, P5.2]`. 3: port-to-throat ratio and erosive-burning check |
| **D2 mass budget** | **15** | 6: case, insulation, liner, nozzle, igniter, skirts, ordnance, instrumentation, with maturity MGA. 4: system margin against R5.4, and **candidate B's 142 kg reported as effectively zero**. 3: propellant sliver and unburnt residual (a solid's version of residuals — 0.5–1.5 % and routinely forgotten). 2: mass fraction stated as `CALC` with its inputs |
| **D3 reliability** | **12** | 4: part count — a monolithic solid's is startlingly small and that is the argument. 3: single-point failures (the case is one, and it is not removable by redundancy). 3: FMEA with specific modes (insulation debond, nozzle throat insert erosion — see Vega-C VV22 `[engine-database B.3.3]`, igniter no-fire). 2: what 8 flights/year × 20 years does to a demonstrated-reliability claim |
| **D4 manufacturability and cost** | **12** | 4: UCI with the large-cast-grain (60) and filament-wound-case (40) complexity classes used properly. 3: NRI and the facility term — **the casting facility is the architecture** `[P120C]`. **3: the transport and handling analysis with a hazard classification.** 2: rate at 16–32/year against a 33-day winding cycle |
| **D5 risk** | **8** | 5: eight risks with retirement points. 2: two non-technical (AP supply and the carbon-fibre supply chain are the obvious pair). 1: one created by the recommendation — a monolithic cast has no partial-scrap recovery, so one bad pour loses a whole motor |
| **D6 Pugh + sensitivity** | **18** | 3: weights before scores. 3: real datum. 3: evidence per score. **4: the temperature-sensitivity analysis and its R5.6 consequence** — this is a project-specific deliverable and the rubric checks that you noticed. **5: the sensitivity, with the correct finding that nothing flips and the requirement change that would** |
| **D7 memo** | **10** | 3: recommendation first. 2: three numbers (0.905, 23,600 kg, 9.8 K). 3: what it costs. 1: trigger. 1: one page |

## §5. Common weak answers

1. **"Segmented steel, because that is how boosters are built."** It was how they
   were built when they had to move by rail. This site has no rail, and the motor
   is road-legal whole at 9 m and 23.6 t. *What it reveals:* the architecture was
   chosen by precedent rather than by the constraint that produced the precedent.
2. **No grain design.** The single most common omission. A solid-motor study
   without $K_n$, an equilibrium pressure and a thrust trace is not a design.
3. **A sketched thrust trace.** R5.5 asks for ≥ 25 % roll-off before T+62 s; the
   reference solution computes 32 % from a 20 % area reduction, and the
   amplification factor $1/(1-n)$ = 1.54 is the physics that makes it work.
4. **Forgetting temperature sensitivity entirely**, or computing it and not
   connecting it to R5.6. The 3 % imbalance limit is a 9.8 K conditioning
   tolerance and that is the only place in the study where the propellant's
   $\sigma_p$ touches a requirement.
5. **Assuming R5.2's 1,650 kN cap is binding.** It is not, by a factor of 2.5,
   and hours are lost designing against it.
6. **Taking the liquid option seriously on physics and not on the pad.** Its
   cost is mostly not in the booster, and the mission statement says the pad
   cannot be modified except for hardpoints and one command line.
7. **Quoting P120C's ≈4,780 kN and ≈280 s without their tags.** The thrust is
   `/motor` `max` **vacuum**, and chamber pressure and the thrust trace are
   flagged as needing a primary source `[P120C]` `[engine-database B.1.10]`.
   Automatic −5.
8. **Using the Shuttle SRB's 0.85 without noting it is `CALC`** from published
   masses rather than a sourced mass fraction.
9. **Ignoring the SRMU precedent when scoring candidate D.** A fatal 1991 case
   failure and a multi-year slip is exactly the kind of evidence a risk register
   exists to carry `[_verify-solid-coldgas A.4]`.

---

# Project 6 — A crew-capsule launch abort system

## §1. Reference sizing (D1)

### First: the motor the project hands you does not meet the requirements

Candidate A is specified as "a solid abort motor of **1,800 kN for 5 s** at
**270 s** vacuum-equivalent $I_{sp}$". Work it:

- Total impulse = 1,800 kN × 5 s = **9.0 MN·s**
- Propellant = 9.0 × 10⁶ / (270 × 9.80665) = **3,399 kg** `[TS P6.1]`
- Tower inert (case, insulation, nozzle at ~0.35 $m_p$, plus jettison motor,
  attitude-control motor, structure and boost protective cover at ~900 kg)
  = **3,449 kg**
- LAS total = **6,848 kg**; stack at abort $M_0$ = **17,348 kg**;
  burnout $M_f$ = **13,949 kg**

Then:

| check | value | requirement | verdict |
|---|---|---|---|
| Δv imparted | **577.4 m/s** `[TS P6.2]` | ≥ 250 m/s (R6.2) | **2.3× over** |
| axial acceleration at ignition | 1,800 kN / 17,348 kg = 103.8 m/s² = **10.6 g** | ≤ 12 g (R6.4) | passes |
| axial acceleration at burnout | 1,800 kN / 13,949 kg = 129.0 m/s² = **13.2 g** | ≤ 12 g (R6.4) | **FAILS** |

**The given motor busts the g-ceiling at burnout and over-delivers Δv by a factor
of 2.3.** The correct engineering response is not to accept the assumption. It is
either to (i) shape the trace so thrust falls by ≥ 21 % across the burn — which a
regressive grain does naturally and which the project asks you to design — or
(ii) size the motor from the requirement. The reference solution does both, and
notes that a real abort motor does exactly this: the Orion-class abort motor's
trace is strongly regressive for precisely this reason.

### Candidate A, resized from the requirement

Target: 250 m/s in ≤ 4.0 s with 4 g ≤ a ≤ 12 g. The Δv floor and the g ceiling
bracket the burn time: at the 12 g ceiling, 250 m/s takes ≥ 2.12 s; at 4 g it
takes 6.4 s, which violates R6.3. **The corner is a burn of ~3.2 s at an average
of ~8 g**, and that is the design point R6.2/R6.3/R6.4 leave you.

Converged (iterating tower inert = 0.75 $m_p$ + 900 kg):

| quantity | value |
|---|---|
| propellant | **1,219 kg** |
| tower inert | **1,815 kg** |
| **LAS total (jettisoned)** | **3,034 kg** |
| stack at abort $M_0$ | **13,534 kg** |
| burnout $M_f$ | 12,315 kg |
| Δv | **250.0 m/s** `[TS P6.3]` |
| average thrust chosen | **1,000 kN** |
| burn time | **3.23 s** |
| acceleration, ignition → burnout | **7.53 g → 8.28 g** |
| nozzle: ε = 8, $p_c$ = 90 bar, $C_F$(SL) | **1.6339** `[TS P6.8]` |
| throat area | **0.06800 m²** (298 mm diameter) `[TS P6.9]` |

Both g-limits are met with the trace essentially flat, and shaping is needed only
to keep the *peak* below 12 g on a hot grain (see below).

### Candidate B, at the SuperDraco baseline — and why it fails

SuperDraco reference: **8 engines in 4 pods of 2, 71 kN each (≈ 568 kN total),
69 bar chamber pressure, 235 s, 1,388 kg of MMH/NTO, 20–100 % throttle,
3D-printed Inconel regeneratively cooled chamber** `[engine-database A.3]`.
Retained inert (engines, tanks, helium, lines, structure) ≈ **1,080 kg**.

| check | value | requirement | verdict |
|---|---|---|---|
| Δv | **260.9 m/s** `[TS P6.4]` | ≥ 250 m/s | passes, 11 m/s of margin |
| acceleration, ignition → burnout | 568 kN / 12,968 kg = **4.47 g** → **5.00 g** | 4–12 g | passes |
| **time to 250 m/s** | **≈ 5.4 s** | **≤ 4.0 s (R6.3)** | **FAILS** |

**Candidate B as specified meets the Δv and fails the clock.** R6.3 is a thrust
requirement in disguise: 250 m/s in 4.0 s needs an average of ≥ 62.5 m/s²
(6.4 g), which on a ~12,900 kg stack is ≥ **806 kN** — not 568 kN.

### Candidate B, resized

Twelve SuperDraco-class engines at 71 kN = **852 kN**:

| quantity | value |
|---|---|
| propellant | **1,327 kg** `[TS P6.6]` |
| retained inert (12 engines ~600 kg, Ti tanks 160 kg, He system 122 kg, lines/valves/structure 200 kg) | **1,080 kg** |
| stack at abort $M_0$ | **12,907 kg** |
| Δv | **250.0 m/s** `[TS P6.5]` |
| acceleration, ignition → burnout | **6.73 g → 7.50 g** |
| burn time | **3.59 s** |
| **mass carried to staging on every nominal flight** | **2,407 kg** |

**R6.9's target is ≤ 1,000 kg carried to staging.** Candidate A is *jettisoned*
before staging, so its penalty after jettison is **zero** and R6.9 is met
trivially. Candidate B is retained, so its penalty is its full **2,407 kg** —
**2.4× the target.** That asymmetry is the whole trade, and it is why the project
words R6.9 as "after jettison if applicable".

### Abort trajectories (project-specific deliverable)

**Pad abort, candidate A resized.** Burnout speed ≈ Δv − $g t_b$ = 250 − 9.81 ×
3.23 = **218.3 m/s**; altitude at burnout ≈ ½ ā $t_b^2$ ≈ **200 m**; coast
apogee above burnout = $v^2/2g$ = **2,429 m**. Total apogee ≈ **2,630 m**
against R6.6's ≥ 1,000 m — met with 2.6× margin, and the surplus is what buys
the downrange. Pitching the tower ~15° from vertical after 0.5 s converts enough
of the burnout velocity into horizontal component to clear R6.6's 600 m
downrange while still exceeding 1,000 m of apogee, with chute deployment above
1,500 m. **The pad abort sizes the total impulse.**

**Max-Q abort.** At max-Q the capsule separates into ~35 kPa of dynamic pressure
at Mach ~1.2. The relative Δv requirement is the same 250 m/s, but the *lateral*
loads dominate: an angle of attack of 10° at that dynamic pressure on a capsule
of ~5 m² reference area gives a normal force of order 60 kN, i.e. ~0.6 g lateral
on a 10,500 kg capsule — inside R6.5's 4 g, but the *structure* must carry it and
the attitude-control motor must null it. **The max-Q abort sizes the structure and
the lateral loads, not the impulse.** Two trajectories minimum, and they size
different things: that distinction is worth marks on its own.

### The g-limit compliance plot

Axial acceleration versus time for candidate A, nominal and hot (+30 °C) grain:

| | nominal | hot (+30 °C, $\pi_K$ = 0.003077 K⁻¹ as in Project 5) |
|---|---|---|
| chamber pressure | 90 bar peak | ×1.0967 → **98.7 bar** |
| thrust | 1,000 kN average | **1,097 kN** |
| ignition acceleration | 7.53 g | **8.26 g** |
| burnout acceleration | 8.28 g | **9.08 g** |
| burn time | 3.23 s | 2.95 s |
| Δv | 250 m/s | 250 m/s (impulse is conserved) |

**Both stay inside 4–12 g, with 2.9 g of margin on the hot day** — which is why
the reference design chooses an average of 1,000 kN rather than pushing toward
the ceiling. Jerk at ignition is bounded by the igniter and grain design; a
50 ms rise to full thrust gives $73.9/0.05$ = **1,478 m/s³**, which **violates
R6.4's 500 m/s³** and forces a deliberately shaped ignition transient — a
progressive igniter and a tailored initial burning surface stretching the rise to
≥ 150 ms. That is a real, easily missed requirement.

### Demonstrated reliability (project-specific deliverable)

R6.11 asks for **≥ 0.995 on demand, demonstrable by analysis plus ≤ 4 flight
tests.** The statistics, stated honestly:

- To demonstrate **R = 0.995 at 95 % confidence by test alone** requires
  $\ln(0.05)/\ln(0.995)$ = **598 consecutive successful trials.**
- **Four successes out of four** gives a 95 % lower confidence bound of
  $0.05^{1/4}$ = **0.473.** Not 0.995. Not close.
- Two out of two gives **0.224**.

**Therefore R6.11 cannot be demonstrated by flight test, and the requirement does
not ask you to.** It says "by analysis plus ≤ 4 flight tests". The four flight
tests exist to validate the *model*, not to establish the number. The number
comes from a component-level reliability roll-up: ordnance initiator reliability
(demonstrated at lot level over thousands of units), igniter no-fire and all-fire
margins, case burst margin against a demonstrated proof-test distribution,
separation-system reliability, and — critically — the **jettison event on nominal
flights**, which for candidate A is an additional single-use ordnance-driven
event that must succeed on all twelve flights and whose failure is catastrophic.

**This is the criterion that can decide the architecture**, and the argument runs
both ways. Candidate A adds a jettison event that candidate B does not have.
Candidate B adds 1,327 kg of hypergolic propellant, a 100 bar helium system and
twelve engines that live next to the crew for the whole mission, and the
**April 2019 ground-test explosion traced to NTO leaking past a check valve into
a helium line** `[engine-database A.3.9]` is exactly the failure mode that
argument produces.

### Engagement with the 2019 check-valve event (project-specific deliverable)

The event: during a ground test of the propulsive-landing configuration of this
same engine set, nitrogen tetroxide leaked past a check valve into a helium
pressurisation line; on subsequent pressurisation the NTO slug was driven into a
titanium component at high velocity, and NTO/titanium under impact is
energetic. The vehicle was destroyed and the propulsive-landing application was
abandoned `[engine-database A.3.9]`.

**Why it is directly relevant to R6.10.** R6.10 requires ≥ 12 months on-vehicle
without servicing and ≥ 5 years shelf. A check valve is a *single* barrier
between an oxidiser and a pressurant, and its leak rate is a function of seat
condition, which is a function of time and of every pressurisation cycle it has
seen. **A single check valve is not an acceptable barrier for a twelve-month
dormant hypergolic system.** The fix, if candidate B is chosen, is architectural
rather than component-level:

1. **Two barriers of different type in series** — a check valve *and* a normally
   closed pyrotechnic or latching isolation valve — so that a seat leak is not
   sufficient.
2. **Burst discs upstream of the helium regulator**, so that a slug cannot reach
   titanium at pressurisation velocity.
3. **Materials selection that removes the energetic pair**: no titanium
   downstream of any path an oxidiser could reach.
4. **Instrumented leak detection** on the helium line, trended monthly through
   the twelve-month dormancy — which is a servicing activity, so R6.10's "without
   servicing" has to be renegotiated or the detection made autonomous.

**If candidate A is chosen, engage anyway**, because the equivalent single-barrier
question exists there too: the tower's ordnance train has one initiation path per
function, and the answer is the same — two initiators, different lots, different
firing circuits.

## §2. Recommended architecture, with the argument both ways

**Recommendation: candidate A — a jettisonable solid tractor tower with a
regressive-grain abort motor of ~1,000 kN average for 3.2 s, a separate
attitude-control motor, a separate jettison motor, and a shaped ignition
transient to hold jerk below 500 m/s³.**

### The argument for

1. **The nominal-flight mass penalty is zero after jettison.** Candidate B
   carries 2,407 kg to staging on eleven of twelve flights, against R6.9's
   1,000 kg target. At a typical medium-lift staging sensitivity of roughly
   0.15 kg of payload per kilogram of stage-1 burnout mass, 2,407 kg is on the
   order of **360 kg of payload on every flight**, and over twelve flights that is
   the largest single number in the study.
2. **The propellant is not next to the crew.** Twelve months of dormant
   NTO/MMH with a 100 bar helium system inside the pressure vessel's outer mould
   line is a hazard the tractor architecture simply does not have.
3. **R6.8's 100 ms from sensed fault to first thrust is easier.** A solid
   ordnance train fires in single-digit milliseconds. A pressure-fed hypergolic
   system must open isolation valves, prime lines and reach chamber pressure in
   twelve chambers simultaneously; it is achievable — SuperDraco does it — but it
   is a harder 100 ms.
4. **The heritage is deep and the failure modes are known.** Mercury, Apollo,
   Soyuz and Orion are one lineage `[Hunley07]`, and Soyuz has used it in anger
   twice, successfully.

### The argument against — what the recommendation costs

1. **It adds a jettison event to every nominal flight.** A single-use,
   ordnance-driven, non-testable-in-flight separation of a 3,034 kg structure
   over the crew, whose failure is catastrophic and which candidate B does not
   have at all. This is the strongest argument against the recommendation and the
   memo must state it as such.
2. **No abort-of-the-abort, no throttle, no shutdown.** Once the tower motor
   lights it burns to completion. Candidate B can throttle 20–100 % and shut
   down, which allows a much gentler and more controllable abort and preserves
   propellant for the reorientation of R6.12.
3. **Mass at abort.** 3,034 kg of tower is 22 % of the abort stack, and every
   kilogram of it must be accelerated by the motor that carries it.
4. **The abort system does nothing on eleven of twelve flights and is thrown
   away on all twelve.** Candidate B's engines are testable, reusable and
   available for other functions — which is a real programme benefit that a
   tower cannot offer.

**Two criteria the recommendation loses on: mission fit and cost** — B scores
+2 and +1 against it — plus the reliability argument above, which the matrix
scores as a tie rather than a win because the jettison event and the dormant
hypergolic system roughly cancel.

## §3. Pugh matrix and sensitivity (D6)

**Datum: candidate A, the solid tractor tower** — the incumbent architecture for
every crewed capsule ever flown except one.

| criterion | w | justification tied to the mission statement | A (datum) | B liquid pusher, retained |
|---|---|---|---|---|
| performance | 10 | both meet R6.2–R6.4 once resized; B adds throttle and shutdown authority | 0 | **+1** |
| mass | 18 | R6.9's ≤ 1,000 kg to staging, on eleven of twelve nominal flights | 0 | **−2** (2,407 kg retained vs 0 after jettison) |
| complexity | 12 | 12 flights over 8 years; every subsystem must be maintained through 12-month dormancies | 0 | **−2** (12 engines, 100 bar He, hypergolics, isolation architecture) |
| reliability | 25 | R6.11's 0.995 on demand with ≤ 4 flight tests; "seven people in the loop" | 0 | **0** — B removes the jettison event and adds a dormant hypergolic system; the two cancel, and saying so is the honest score |
| manufacturability | 8 | 12 units over 8 years; producibility is not the constraint | 0 | −1 |
| cost | 12 | 12 crewed flights; the tower is thrown away twelve times | 0 | **+1** |
| mission fit | 15 | R6.7: abort from T−0 through max-Q to staging, in one system | 0 | **+2** (no jettison window, no coverage gap, propellant available for R6.12) |
| **weighted total** | **100** | | **0** | **−16** |

### Sensitivity

The gap is **16 points**, and **one weight flips it inside ±50 %**:

| weight | flips at | change |
|---|---|---|
| **mass** | **10.0** | **−44 %** |
| mission fit | 23.0 | +53 % |
| performance | 26.0 | +160 % |
| cost | 28.0 | +133 % |
| complexity | 4.0 | −67 % |

**If the mass weight falls below 10 — that is, if 2,407 kg carried to staging on
eleven of twelve flights is worth less than about a tenth of the decision — the
liquid pusher wins.** That is not an abstract possibility. It is exactly the
judgment a programme makes when the launcher has performance to spare and the
capsule's other requirements (propulsive landing, on-orbit manoeuvring, a
reusable capsule) let the same propellant do more than one job. **One operator
made that judgment and flew it**; the rest did not.

Two-criterion check: mass −50 % (18 → 9) together with mission fit +50 %
(15 → 22.5) puts candidate B at **+13**, a clear win.

**Report:** the recommendation is sensitive to a single weight within ±50 %, and
the weight in question encodes a programme-level judgment about the value of
payload mass rather than a propulsion judgment. **That is a coin toss dressed as
engineering unless the payload sensitivity is nailed down**, and the memo's
change-of-mind trigger should say so: *if the vehicle's payload sensitivity to
stage-1 burnout mass is below 0.06 kg/kg, or if the programme adopts a
requirement that the abort propellant also serve on-orbit manoeuvring, the
integrated pusher becomes the better architecture.*

## §4. Rubric — Project 6, out of 100

| deliverable | marks | what earns them |
|---|---|---|
| **D1 sizing** | **25** | **5: noticing that the given 1,800 kN × 5 s motor over-delivers Δv by 2.3× and busts the 12 g ceiling at burnout** `[TS P6.1, P6.2]` — accepting the assumption uncritically costs all five. 5: candidate A resized from the requirement with the burn-time corner found `[TS P6.3]`. **5: candidate B checked against R6.3 and found to fail at the SuperDraco baseline** `[TS P6.4]`, then resized `[TS P6.5, P6.6]`. **5: two trajectories, pad and max-Q, with numbers, and a statement of which sizes what.** 3: nozzle and throat sized `[TS P6.8, P6.9]`. 2: the R6.12 reorientation subsystem sized, not forgotten |
| **D2 mass budget** | **15** | 6: basic → MGA → predicted, both architectures. 4: system margin. **4: the nominal-flight mass-penalty accounting, in payload terms and in programme terms** — this is a project-specific deliverable and it is where the trade is decided. 1: propellant reserve |
| **D3 reliability** | **12** | 3: part count. 3: single-point failures — **the jettison event on candidate A and the check-valve path on candidate B must both appear**. 3: FMEA with specific modes. **3: the demonstrated-reliability argument, arithmetically honest** — 598 trials for 0.995 at 95 %, and 0.473 from 4/4 |
| **D4 manufacturability and cost** | **12** | 4: UCI, with the pyrotechnic/ordnance class used for the initiators and jettison devices. 4: NRI over 12 units — a 12-unit programme is NRI-dominated and a study that optimises unit cost has misread it. 4: the four-flight-test campaign costed as part of NRI |
| **D5 risk** | **8** | 5: eight risks with retirement points. 2: two non-technical. **1: at least one created by the recommendation** — "if the jettison motor fails to separate the tower, the mission is lost with no recovery" is the obvious one and it must appear if you recommended A |
| **D6 Pugh + sensitivity** | **18** | 3: weights before scores. 3: real datum. 3: evidence per score. **4: the g-limit compliance plot, nominal and hot grain, with the jerk check.** **5: the sensitivity, and full marks require finding that the mass weight flips it at −44 % and saying what that weight actually encodes** |
| **D7 memo** | **10** | 3: recommendation first. 2: three numbers. **3: what it costs — the jettison event, named as the strongest argument against your own recommendation.** 1: measurable trigger. 1: one page. **The one-paragraph engagement with the 2019 check-valve event is required whichever architecture you recommend** and its absence costs 3 of the 10 |

## §5. Common weak answers

1. **Accepting the 1,800 kN × 5 s motor as given.** It delivers 577 m/s and
   13.2 g at burnout `[TS P6.2]`. The project says "a total tower jettison mass
   you must compute rather than assume" — the invitation to check the rest of the
   assumption is right there.
2. **Sizing candidate B on Δv and not on time.** 568 kN gives 260.9 m/s and takes
   5.4 s against R6.3's 4.0 s `[TS P6.4]`. R6.3 is a thrust requirement.
3. **"0.999 reliability from twelve hot fires."** The project file names this
   specifically. Four out of four gives 0.473 at 95 % confidence; 598 trials are
   needed for 0.995.
4. **Forgetting the post-burnout attitude-control subsystem (R6.12).** It is a
   separate propulsion system with its own propellant, its own impulse budget and
   its own 12-second deadline, and students routinely size the abort motor and
   stop.
5. **Ignoring jerk.** R6.4 caps it at 500 m/s³, and a 50 ms ignition transient
   gives 1,478 m/s³. It is one line of arithmetic and it changes the igniter
   design.
6. **Comparing mass at abort rather than mass at staging.** The tower is
   jettisoned; the pusher is not. R6.9 is worded "after jettison if applicable"
   precisely to make you notice.
7. **No engagement with the 2019 check-valve event.** It is a named,
   project-specific deliverable, it is required whichever way you recommend, and
   it costs 3 marks of the memo.
8. **Quoting SuperDraco's figures without their caveats.** The 235 s, 69 bar,
   1,388 kg set is confidence **[C]** and the injector element type is **not
   published** — pintle is *likely* given the manufacturer's practice, but that is
   inference and the database says do not print it as fact
   `[engine-database A.3]`. Automatic −5 if quoted flat.
9. **Scoring reliability as a clear win for the tower.** It removes a dormant
   hypergolic system and adds a catastrophic single-use separation event. The
   honest score is a tie, and a matrix that gives the recommendation a win on
   every criterion is the pattern Appendix A warns about.

---

# Cross-project notes

## The five findings that generalise

1. **Compliance is a gate, not a criterion.** Four of the six projects have a
   candidate that fails a hard requirement and would score well in a weighted
   matrix: hydrazine in Project 1, the pressure-fed stage in Project 2,
   all-electric in Project 3, ORSC-at-100-bar in Project 4. Gate them, record why,
   and do not score them.
2. **The tank is usually the answer.** Project 2's pressure-fed candidate dies on
   98.9 kg of tank plus 52.5 kg of helium system; Project 3's ACS sub-trade turns
   on stored density rather than specific impulse; Project 1's helium system is
   4.6 kg of a 35 kg budget. **Specific impulse decides less than students expect
   and stored density decides more.**
3. **Requirements that are not numbers are still requirements.** "Ninety
   engineers and no turbopump experience" (Project 2), "no rail connection"
   (Project 5), "one additional command line" (Project 5) and "seven people in the
   loop" (Project 6) each decide their study. They are in the mission statement,
   not the requirements table, and they are binding.
4. **The interesting sensitivity is often not a weight.** Project 2's answer
   turns on battery specific power; Project 4's on a subscale liner's fatigue
   life; Project 6's on the vehicle's payload sensitivity to burnout mass. When a
   weight sweep says "robust", ask which *assumption* is not.
5. **Every architecture that wins, loses somewhere.** Project 1's storable system
   loses 22 s of Isp and all its NTO freezing margin; Project 2's electric pump is
   heavier than the turbopump it replaces; Project 4's 150 bar ORSC loses 14.8 s
   to 300 bar and loses cost and manufacturability to the gas generator; Project
   6's tower adds a catastrophic jettison event. **If your recommendation lost
   nothing, you did not run a trade study.**

## The automatic deductions, in practice

| deduction | where it most often lands |
|---|---|
| −10, a candidate lacks a sizing | Project 1 candidates B and C; Project 2's unsized combinations; Project 3's ACS options 3 and 4 |
| −10, the recommendation wins every criterion | Project 5, where candidate A genuinely is strong and students flatten the liquid option rather than scoring its two real wins |
| −5, a flagged figure quoted without its caveat | Raptor's chamber pressure and T/W (Project 4), SuperDraco's Isp and injector (Project 6), P120C's thrust tags (Project 5), Rutherford's efficiency claim and T/W (Project 2), the LMDE's 311 s (Project 1) |
| −5, no margin policy or a flat percentage | every project; it is the most common single deduction |
| −5, weights after scores | detectable when a weight is a suspiciously round number that makes the total work |
| **−20, a number invented rather than computed or sourced** | engine dry masses, tank masses, battery specific power, refurbishment cost. **The fix is not to avoid assuming — it is to put the assumption in the register with its justification and the deliverable it feeds.** An assumption in the register is sourced; the same number in the body is invented |

## A note on the assumption register

Every project requires one, ten to thirty entries, and the entries taken from
[`reference/engine-database.md`](../reference/engine-database.md) must carry the
database's confidence label and its caveats. **A company claim is an assumption
with a name attached to it**, and naming the claimant is part of the citation:
"2,460 kN (Blue Origin specification; a 2,847 kN improved figure was stated in
November 2025 and it is unclear which vehicles fly which rating)
`[engine-database A.3.4]`" is a register entry. "2,460 kN" is not.

The register is also the only artefact that tells somebody revisiting the study
in eighteen months whether the conclusion still holds. Project 4's conclusion, for
instance, rests on the claim that a 2,400 kN engine can be built to 2,200 kg —
which is supported only by unaudited manufacturer figures for one engine
`[engine-database A.3.5]`. If that entry is in the register, the study has a
shelf life. If it is buried in a mass table, it does not.

---

*Every number in this key is computed with [`tools/rocket.py`](../tools/rocket.py)
and registered in [`tools/examples/tradestudies.py`](../tools/examples/tradestudies.py);
run `python3 tools/check_examples.py` to reproduce them. Real-engine figures are
from [`reference/engine-database.md`](../reference/engine-database.md) with that
file's caveats carried intact, and citation tags resolve in
[`reference/sources.md`](../reference/sources.md) and the database's Part E tag
list. Where this key says a figure is a claim, not published, or contested, that
is a finding of the verification pass and not a hedge.*
