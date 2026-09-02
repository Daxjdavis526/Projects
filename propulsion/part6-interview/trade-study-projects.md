# Trade-study projects

Part VI · Prerequisites: all modules (05–13 and 32–33 are load-bearing for
every project) · Estimated time: **6–12 h each**, six projects offered

**Reference solutions and rubrics are in
[`trade-study-projects-key.md`](trade-study-projects-key.md).** Do not open the
key until your memo is written and dated. A trade study you have already seen
the answer to teaches you nothing except how to agree with somebody.

---

## What this file is

The 200-question bank tests recall. The whiteboard problems test whether you
can set up an equation under pressure. Neither tests the thing you will
actually be paid for, which is this: **somebody hands you a mission and a
budget, there are three or four ways to build the propulsion system, and you
have to pick one and defend it to people who will lose money if you are
wrong.**

Every project below is a real architecture-selection problem of the kind that
gets decided once, early, in a room, and then constrains the next four years
of the programme. They are not "size the engine" exercises. Sizing is one of
seven deliverables, and it is the easy one.

The numbers are fictional but the physics, the failure modes and the
manufacturing constraints are not. Where a project references a real engine or
motor, the figure comes from
[`reference/engine-database.md`](../reference/engine-database.md) and carries
that file's caveats — including whether the number is a measured value, a
`CALC`, or an unaudited **company claim**. Carrying the caveat is part of the
grade.

### The one thing that separates a good trade study from a bad one

A bad trade study picks a winner and then assembles evidence for it. You can
spot one instantly: every criterion in the matrix points the same way. Real
architectures do not work like that. **If your recommended option does not lose
on at least two criteria, you have not understood the trade, you have written
a brochure.** The rubric penalises this heavily and the key names it as the
single most common failure.

---

## How to run one of these

1. **Read the mission statement and the requirements table once, then close
   the file and write down what you think the answer is.** Keep that note. At
   the end you will compare it against what the analysis said, and the gap
   between them is the most valuable thing you will learn from the exercise.
2. **Do the sizing before you form an opinion.** Not after. Half of these
   projects have an option that is eliminated on arithmetic alone, and it is
   never obvious which one until you have run the numbers.
3. **Build the mass budget with margins before you build the Pugh matrix.** A
   matrix scored on unmargined masses is a matrix scored on fiction.
4. **Write the weights down and justify them *before* you score.** Weights
   chosen after scoring are how a trade study becomes a rationalisation. The
   rubric checks the order.
5. **Do the sensitivity check.** Find the weight that flips the answer. If no
   weight flips the answer, say so — that is a strong result and it means the
   decision is robust. If a 10 % change in one weight flips it, your
   recommendation is a coin toss dressed as engineering, and you must say
   *that* in the memo.
6. **Write the memo last, in one page, for a reader who will not read
   page two.**

### Where the hours go

A well-run 8-hour study distributes roughly as:

| activity | hours | note |
|---|---|---|
| requirements parse, assumption list | 0.5 | write down every assumption you make; you will need them for the memo |
| sizing calculation, all candidates | 2.0 | use `tools/rocket.py`; do not hand-integrate anything you can call |
| mass budget with margins | 1.0 | the margin policy is below and it is not optional |
| reliability / complexity argument | 1.0 | part count, single-point failures, FMEA top ten |
| manufacturability and cost | 1.0 | the cost proxy is defined below |
| risk list | 0.5 | eight risks, 5×5 scored, with mitigations |
| Pugh matrix and sensitivity | 1.0 | weights first, scores second, sensitivity third |
| memo | 1.0 | one page. One. |

A 12-hour study spends the extra four hours on the sizing (a real thermal or
feed-system sizing rather than an Isp assumption) and on a second sensitivity
axis.

---

## The seven deliverables — required for every project

Every project asks for the same seven artefacts. The project-specific sections
below add requirements on top of these; they never replace them.

### D1 — Sizing calculation

For **every** candidate architecture, not just the winner. A sizing that exists
only for the option you liked is the tell-tale of a decision made in advance.

Minimum content:

- Δv budget with every term named and sourced or justified, including losses.
- Rocket-equation propellant mass for each candidate, with the assumed
  delivered $I_{sp}$ stated **and justified** — where the number came from,
  what $\eta_{c^*}$ and nozzle efficiency it implies, and whether it is
  measured, computed or assumed.
- Thrust and throat sizing: $A_t = F/(p_c\,C_F)$, with $C_F$ computed at the
  actual area ratio and back pressure, not read off a chart.
- Propellant volumes from real densities, and therefore tank volumes with
  ullage.
- Burn time, and a check that it is consistent with the mission timeline.
- For pump-fed candidates: pump power, and where it comes from.
- For pressure-fed candidates: pressurant mass and pressurant tank mass.
- For solids: at minimum $K_n$, equilibrium $p_c$, and a statement of what the
  grain must do to the thrust trace.

Every arithmetic step must be reproducible with
[`tools/rocket.py`](../tools/rocket.py). If a step is not in the library,
either it maps onto a function you did not find, or you should say in one line
why it does not.

### D2 — Mass budget with margins

A table, by subsystem, of **basic mass → margin → predicted mass**, with a
system-level margin on top. Use this margin policy unless the project says
otherwise; it is a simplified form of the AIAA S-120 mass-growth-allowance
approach [J], and the point is that margin is a function of *maturity*, not a
flat 20 % sprinkled at the end:

| design maturity of the item | mass growth allowance (MGA) |
|---|---|
| flight-qualified hardware, unmodified, same environment | 2 % |
| flight-qualified hardware, modified or requalified | 5 % |
| existing design, new build, new environment | 10 % |
| new design, conventional materials and processes, analysis complete | 15 % |
| new design, analysis preliminary | 25 % |
| new design, new material or new process, no analysis | 35 % |
| a number you estimated by analogy with a photograph | 50 % |

On top of the MGA-loaded total, carry a **system margin** against the mass
ceiling: 15 % at the architecture-selection stage. Propellant is sized on the
predicted (margined) dry mass, not the basic one, and the propellant itself
carries a separate **performance reserve** — 2 % of the load for a launch
stage, 5 % for a landing stage, 10 % for a fifteen-year station-keeping budget.

State residuals and trapped propellant explicitly. They are typically 1–3 % of
the load for a pump-fed stage and worse for a small pressure-fed system with
long lines, and they are the single most common line item a student forgets.

### D3 — Reliability and complexity argument

Not adjectives. Four things:

1. **Part count**, split into *moving parts in the propellant path*, *valves
   that must actuate in flight*, *pyrotechnic devices*, *rotating machinery*,
   and *joints containing hot gas or oxidiser*. Count them per candidate. This
   single table does more work than any qualitative paragraph.
2. **Single-point failures**: enumerate them. For each, say whether it is
   removable by redundancy, by design change, or not at all. The Apollo SPS is
   the canonical worked example of removing single-point failures by *removing
   mechanisms* rather than by adding redundancy [SLPRE], and every project here
   has a version of that choice available.
3. **A top-ten FMEA extract**: failure mode → mechanism → detection →
   effect → mitigation. Failure modes must be specific ("ox-side pump seal
   leaks LOX into the bearing cavity during chilldown"), never generic
   ("engine fails").
4. **A demonstrated-reliability statement**: how many qualification and
   acceptance firings the architecture needs before first flight, and what the
   binomial confidence on the resulting reliability estimate actually is. A
   student who claims "0.999 reliability" from twelve hot fires has said
   something arithmetically impossible and the rubric will find it.

### D4 — Manufacturability and cost argument

Cost in absolute currency is unknowable to you and is not being asked for.
Instead build **two indices**, both defined below, and defend the inputs:

**Recurring Unit Cost Index (UCI).** Sum over the parts list of
$n_i \times c_i \times k_i$, where $n_i$ is quantity, $c_i$ is the complexity
class below, and $k_i$ is a process multiplier.

| complexity class | $c_i$ | examples |
|---|---|---|
| commodity fitting, tube, fastener | 1 | AN fittings, bolts |
| simple machined part | 3 | a flange, a manifold block |
| welded or brazed assembly | 8 | a tube-wall chamber jacket |
| precision rotating part | 25 | an impeller, a turbine disc |
| complex net-shape part | 15 | a printed regen chamber, an injector body |
| pyrotechnic or single-use ordnance device | 6 | separation nut, igniter |
| large composite wound structure | 40 | a filament-wound motor case |
| large cast propellant grain | 60 | a segment of solid propellant, cast and cured |

| process multiplier | $k_i$ |
|---|---|
| catalogue part, multiple qualified suppliers | 0.6 |
| catalogue part, sole source | 1.0 |
| build to print, conventional | 1.0 |
| requires a qualified special process (EB weld, HIP, coating) | 1.6 |
| requires a new qualified special process | 2.5 |
| requires a facility that does not exist yet | 5.0 |

**Non-Recurring Index (NRI).** Count of *qualification articles* × *test
campaigns required* × *new-process qualifications*, plus a facility term. The
purpose of NRI is to stop students from choosing the architecture with the
lowest unit cost and highest development cost without noticing they did it. A
programme building twelve units and a programme building twelve hundred should
not reach the same answer, and the project statements tell you which you are.

Also required in D4: **rate**. State the production rate the mission needs and
whether the architecture can hit it. Some architectures are cheap per unit and
cannot be built faster than one a quarter. A filament-wound case takes roughly
33 days of winding for a P120C-class motor [P120C]; that is a scheduling fact
before it is a cost fact.

### D5 — Risk list

Minimum eight risks, each with: statement in *if–then* form, likelihood 1–5,
consequence 1–5, score, mitigation, and the **decision point** at which the
risk retires. At least two risks must be non-technical (supply chain, export
control, workforce, facility, schedule). At least one must be a risk that is
*created* by your recommendation and would not exist under the alternative.

### D6 — Pugh matrix with justified weights

Rules, and they are enforced:

- **Criteria**: performance, mass, complexity, reliability, manufacturability,
  cost, mission fit — at minimum. Add more if the project needs them. Do not
  merge any of the seven; each one is in the list because a real programme has
  lost money by folding it into another.
- **Weights sum to 100** and each carries **one sentence of justification tied
  to the mission statement**, not to general engineering virtue. "Reliability
  is important" is not a justification. "This is the only propulsion event
  between the crew and a lunar surface they cannot leave, so a failure is
  unrecoverable rather than costly" is.
- **Scoring**: −2 to +2 against a stated datum, or 1–5 absolute. Say which and
  be consistent. **The datum must be a real candidate, not an idealisation.**
- **Every score gets one line of evidence**, pointing at a number in D1–D4.
  Unsupported scores are worth zero.
- **Sensitivity**: vary each weight ±50 % of its value, one at a time, and
  report which weight changes the winner and at what value. Then do one
  two-criterion perturbation. Report the result honestly, including the case
  where the answer never flips.

### D7 — Recommendation memo, one page

Written for a chief engineer who has ten minutes and will not read an
appendix. Structure:

1. The recommendation, in the first sentence.
2. The three numbers that drive it.
3. What the recommendation costs you — the criteria on which it loses, named,
   with the magnitude of the loss.
4. The condition under which you would change your mind, stated as a
   measurable trigger ("if the qualification campaign shows delivered
   $I_{sp}$ below 305 s, the electric-pump option is no longer viable and we
   revert to the gas generator").
5. What you need next and by when.

One page. If it is on two pages it is marked as if the second page does not
exist, because in a real review it does not.

---

## Grading

Each project is scored out of 100 against the rubric in the key. The weighting
is the same for all six:

| deliverable | marks |
|---|---|
| D1 sizing, all candidates, correct and reproducible | 25 |
| D2 mass budget with a defensible margin policy | 15 |
| D3 reliability and complexity argument | 12 |
| D4 manufacturability and cost | 12 |
| D5 risk list | 8 |
| D6 Pugh matrix, weights, and sensitivity | 18 |
| D7 memo | 10 |

**The recommendation itself is not graded.** Several of these projects have two
defensible answers and one of them has three. What is graded is whether the
analysis supports the recommendation you made, whether you know what you gave
up, and whether you found the weight that flips it.

Automatic deductions:

- −10 if any candidate lacks a sizing calculation.
- −10 if the recommended option wins on every criterion.
- −5 for any real-engine figure quoted without its caveat where the database
  flags one.
- −5 for a mass budget with no margin policy or a flat percentage.
- −5 for weights that appear after the scores.
- −20 for a number invented rather than computed or sourced. This is the only
  deduction that can take a report below 50 on its own, and it is deliberate.

---

# Project 1 — A 200 kg lunar lander descent and landing stage

**Estimated 8 h.** Draws on modules 03, 05, 06, 07, 08, 09, 12, 14, 32, 33.

## Mission statement

You are the propulsion lead for a commercial 200 kg-class robotic lunar
lander. A rideshare delivers your spacecraft to a 100 km circular low lunar
orbit, where it separates and must descend and soft-land a 100 kg payload-plus-
bus mass on the near-side surface, inside a 100 m landing ellipse, at a site
selected after launch.

The vehicle spends up to **six months** in cislunar space before the descent —
the customer's manifest slips, and the lander must survive the slip without
losing capability. The descent is the only propulsion event that matters and
it cannot be retried. There is no crew, no rescue and no second attempt: the
company has one vehicle and one contract.

Pick the descent propulsion architecture.

## Hard requirements

| # | requirement | value |
|---|---|---|
| R1.1 | Δv, LLO separation to touchdown, including gravity and steering losses | **≥ 2,000 m/s** |
| R1.2 | Landed mass (bus + payload, dry, excluding residuals) | **≥ 100 kg** |
| R1.3 | Wet mass at separation from the carrier | **≤ 200 kg** |
| R1.4 | Maximum thrust | **≥ 800 N** |
| R1.5 | Continuous throttle range, closed-loop, with stable combustion throughout | **≥ 5:1** (10:1 desirable) |
| R1.6 | Restarts after the first ignition | **≥ 5**, at least one after a 30-day coast |
| R1.7 | Storage without loss of capability, launch to descent | **≥ 6 months**, of which ≥ 5 months in cislunar space |
| R1.8 | Propulsion system dry mass (engine, feed, tanks, pressurant, valves, lines, mounts) | **≤ 35 kg** |
| R1.9 | Terminal descent: throttle authority to hold hover at landed mass + residuals | must be demonstrable |
| R1.10 | Thermal environment | −40 °C to +50 °C non-operating; no active propellant conditioning power budget available during coast |
| R1.11 | Schedule: PDR to first flight article | **28 months** |
| R1.12 | Programme build quantity | **1 flight unit + 1 qualification unit.** Recurring cost is nearly irrelevant; non-recurring cost and schedule are the constraints |
| R1.13 | Landing accuracy driver | thrust must be commandable to ±2 % of set point within 200 ms |

## Candidate architectures you must consider

**A. Storable bipropellant, pressure-fed, MMH/NTO.** One throttleable engine
with a variable-area or pintle injector. Regulated helium. Titanium propellant
tanks with PMD. Assume a delivered vacuum $I_{sp}$ of **315 s** at full thrust
and **295 s** at 20 % throttle; you must justify these against the R-4D family
(312 s classic, ~322 s for rhenium-chamber variants; the HiPAT is quoted near
445 N and ~322 s) and against the LMDE, which delivered **311 s at full
thrust and 285 s at 10 %** [engine-database A.8].

**B. LOX / LCH₄, pressure-fed.** Assume a delivered vacuum $I_{sp}$ of
**340 s**. You must size the thermal problem: six months of cryogenic storage
with no active cooling power, and you must state what you would do about it and
what it costs in mass. Deep throttling of a cryogenic pressure-fed engine at
this scale has no flight heritage; treat that as a fact to be argued, not
ignored.

**C. Hydrazine monopropellant.** Catalyst-bed thrusters, blowdown or regulated.
Assume a delivered vacuum $I_{sp}$ of **225 s**. Simplest possible system: one
fluid, no mixture-ratio control, no ignition, decades of heritage.

**D. Hybrid arrangement of your own construction** — for example a
monopropellant system for attitude control and terminal descent with a
bipropellant main, or a bipropellant main with cold-gas ACS. If you propose
one, you must size it as a full candidate, not sketch it.

## What you must decide, explicitly

- Which architecture, and at what $I_{sp}$ you are willing to sign for.
- Throttling method: variable-area injector, turbopump speed (not available
  pressure-fed — say why you are excluding it), multiple fixed-thrust engines
  and pulse-width modulation, or dual-mode. The LMDE and the Rocketdyne AR2-3
  are the two opposite historical answers and the database contrasts them
  directly [engine-database A.9.5].
- Chamber cooling: ablative, film, radiative, regenerative, or a combination.
  At 800 N and a 350-second burn this is not a free choice.
- Ignition: hypergolic (no igniter at all), catalytic, spark torch, or
  pyrotechnic. Count the restarts against the ignition method's demonstrated
  restart capability.
- Pressurisation: regulated or blowdown, and if regulated, what happens when
  the regulator fails open.

## Project-specific deliverables, in addition to D1–D7

- **A throttle-authority plot**: commanded thrust versus vehicle weight through
  the terminal descent, showing the hover point and the margin above minimum
  thrust. State the throttle ratio actually required, as distinct from the one
  in R1.5.
- **A six-month storage analysis** for whichever propellant you recommend:
  for the storables, materials compatibility and the freezing point margin; for
  the cryogens, a boil-off estimate with your assumed heat leak stated, and the
  mass of whatever you do about it.
- **An injector-stability argument.** You are proposing to run one chamber
  across a 5:1 or 10:1 flow range. Say what happens to injector pressure drop
  as a fraction of $p_c$ across that range, what the stability consequence is,
  and what the LMDE did about it.

## Reading list

Modules **03** (performance), **05** (propellants — the storability and
freezing-point sections), **06** (chamber sizing, $L^*$), **07** (injectors —
the pintle and variable-area sections are the core of this project), **08**
(ignition and restart), **09** (nozzles — high area ratio in vacuum), **12**
(feed systems — pressure-fed sizing, pressurant mass), **14** (valves and
plumbing), **32** (comparison), **33** (systems engineering).

Sources: [SB §6, §8], [HH ch. 5–6], [SP-8089] on injector design criteria,
[Dressler00] on the TRW pintle lineage, [Clark] for why the storables are what
they are, [Brown] for spacecraft-scale system sizing.

---

# Project 2 — A small launch vehicle second stage

**Estimated 10 h.** Draws on modules 03, 05, 06, 09, 11, 12, 13, 16, 17, 32.

## Mission statement

You are designing the second stage of a small orbital launch vehicle. The
first stage is fixed and is not your problem: it is a nine-engine kerolox
stage that separates at 2.4 km/s inertial, 78 km altitude, on a trajectory
targeting a 500 km sun-synchronous orbit. The company's business case is
**24 launches per year** at a price the market will bear only if the second
stage costs less than a fixed fraction of vehicle recurring cost. The company
has 90 engineers and has never built a turbopump.

Your job is the second stage's propulsion architecture: power cycle and
propellant combination, together.

## Hard requirements

| # | requirement | value |
|---|---|---|
| R2.1 | Δv, separation to orbit insertion, including losses and a circularisation burn | **≥ 3,600 m/s** |
| R2.2 | Payload to 500 km SSO | **≥ 300 kg** |
| R2.3 | Vacuum thrust | **25–35 kN** (stage initial acceleration ≥ 12 m/s²) |
| R2.4 | Burn time, main burn | **120–200 s** |
| R2.5 | Restarts | **≥ 2** (circularisation, then a deorbit burn ≥ 60 s after a 45-minute coast) |
| R2.6 | Stage propellant mass | your output, but stage gross ≤ **2,600 kg** including payload |
| R2.7 | Stage dry mass, excluding payload and interstage | **≤ 380 kg** |
| R2.8 | Production rate | **24 stages/year**, sustained, from month 30 |
| R2.9 | Schedule: authority to proceed to first flight | **36 months** |
| R2.10 | Recurring cost | this is the binding constraint. Report UCI per stage and defend it |
| R2.11 | Propellant loading time on the pad | ≤ 60 min, and the stage must tolerate a 4-hour hold at T−10 min |
| R2.12 | Reuse | none. The stage is expended. Do not design for recovery |

## Candidate architectures you must consider

You are choosing on **two axes simultaneously**, and the project is largely
about noticing that the axes are not independent.

**Axis 1 — power cycle:**

- **Electric pump-fed.** Brushless DC motors on a lithium-polymer pack. No
  turbine, no gas generator, no cycle propellant loss at all. Rutherford is the
  only flown example: 24.9 kN sea level / 25.8 kN vacuum, 311 s SL / 343 s
  vacuum, **two motors of 37 kW each at 40,000 rpm**, with the nine-engine
  stage-1 pack supplying **>1 MW** [engine-database A.3]. Note the database's
  criticism of Rocket Lab's 95 %-versus-50 % efficiency claim — it compares
  electrical-to-hydraulic efficiency against thermodynamic cycle efficiency and
  is not a like-for-like comparison [A.3.7]. Note also that Rocket Lab itself
  moved to ORSC for its next vehicle.
- **Pressure-fed.** No rotating machinery of any kind. Chamber pressure limited
  to whatever the tanks can carry; you choose it. The Apollo SPS and the LMDE
  are the heritage arguments; SuperDraco proves that 69 bar pressure-fed is
  possible if you are willing to pay for the helium system [engine-database
  A.3].
- **Gas generator.** The conventional answer. Open cycle, dumps 2–5 % of flow
  overboard, well-understood, and the thing your 90-engineer company has never
  built.

**Axis 2 — propellant:**

- **Kerolox (LOX/RP-1).** Dense, storable fuel, no fuel-side thermal problem on
  the pad, sooty, and coking limits regenerative cooling life — which you do not
  care about on an expendable stage. Assume vacuum $I_{sp}$: 348 s (GG), 343 s
  (electric pump at lower $p_c$), 305 s (pressure-fed).
- **Methalox (LOX/LCH₄).** Higher $I_{sp}$, clean-burning, but two cryogens on
  the pad, a much bulkier fuel, and a fuel that must be conditioned. Assume
  vacuum $I_{sp}$: 362 s (GG), 358 s (electric pump), 318 s (pressure-fed).

You must evaluate **at least four** of the six combinations, and you must state
why you eliminated the ones you did not size.

## What you must decide, explicitly

- Cycle and propellant, together, with the interaction named.
- Chamber pressure. This is the hinge of the whole project: $p_c$ sets pump
  power, which sets battery mass or turbine flow, which sets stage dry mass,
  which sets propellant mass, which sets tank mass. Show the loop closing.
- For the electric-pump option: whether the battery is **energy-limited or
  power-limited**, and what that implies about cell chemistry and pack mass.
  Do not assume; compute both and take the larger.
- For the pressure-fed option: tank MEOP, tank material, and pressurant
  strategy. A 1,500-litre propellant volume at 26 bar MEOP is a very different
  tank from the same volume at 4 bar.
- Restart method for R2.5, and its consumables.
- Nozzle area ratio, and whether the stage's diameter or the base heating
  limits it before the performance does.

## Project-specific deliverables, in addition to D1–D7

- **A closed design loop.** Show at least two iterations of dry mass →
  propellant mass → tank mass → dry mass, and state the convergence.
- **A rate-and-cost table**: UCI per stage and the number of *hours of skilled
  labour* per stage for each candidate, with the assumption stated. At 24
  stages a year, a part that needs one specialist and 40 hours is a different
  risk from a part that needs four specialists and 400.
- **A "what your company can actually build" paragraph.** Ninety engineers,
  no turbopump experience, 36 months. This is a real constraint, it is in the
  mission statement, and a study that ignores it has ignored a requirement.

## Reading list

Modules **03**, **05**, **06**, **09** (area ratio for a vacuum stage), **11**
(cooling — and why an expendable stage may not need much of it), **12** (feed
systems, pump power, NPSH), **13** (engine cycles — the central module for this
project), **16** (materials, tank structures), **17** (manufacturing and rate),
**32**, **33**.

Sources: [SB §6, §10–11], [HH ch. 6], [SP-8107] and [SP-8109] on turbopump
systems, [SP-8112] on pressurisation, [Brennen-Pumps] for cavitation and
suction specific speed, [Humble] for stage-level sizing method.

---

# Project 3 — A GEO communications satellite propulsion suite

**Estimated 10 h.** Draws on modules 03, 05, 08, 28, 29, 30, 31, 32, 33.

## Mission statement

You are the propulsion architect for a 3,000 kg-class geostationary
communications satellite with a **15-year design life**. The launch contract is
not yet signed; the two candidate launchers deliver to a standard GTO
(≈1,500 m/s from apogee to GEO) and both charge by kilogram. Every kilogram
you remove from the wet mass is worth real money to the programme, and every
month you add to the transfer is worth real money to the customer, who does not
get paid until the transponders are on.

You must specify the whole propulsion suite: the orbit-raising system, the
15-year station-keeping system, the attitude-control system, and the
end-of-life disposal.

This is the project where the three subsystems fight each other. Solve them
together or you will get it wrong.

## Hard requirements

| # | requirement | value |
|---|---|---|
| R3.1 | Beginning-of-life mass in GEO, after orbit raising | **≥ 3,000 kg** |
| R3.2 | Apogee Δv, GTO to GEO, including inclination removal | **1,500 m/s** for an impulsive transfer; **use 3,000 m/s effective** for a low-thrust spiral, and justify the factor you use |
| R3.3 | Station-keeping Δv, 15 years | **800 m/s** total (N–S ≈ 50 m/s·yr⁻¹, E–W ≈ 2 m/s·yr⁻¹, plus momentum management) |
| R3.4 | Disposal to a graveyard orbit at end of life | **11 m/s**, with propellant reserved and gaugeable to ±3 % |
| R3.5 | Attitude control total impulse over life, excluding station-keeping | **8,000 N·s** |
| R3.6 | Minimum impulse bit for pointing | **≤ 0.05 N·s**, repeatable to ±10 % |
| R3.7 | Transfer duration, separation to on-station | **≤ 45 days** (customer requirement; a longer transfer must be traded against its revenue cost, which you may take as 0.35 % of programme value per week) |
| R3.8 | Available electrical power for propulsion during transfer | **≤ 6 kW** (the payload is off; the arrays are deployed) |
| R3.9 | Available electrical power for propulsion on station | **≤ 1.5 kW** continuous, non-eclipse |
| R3.10 | Propellant residual uncertainty at end of life | **≤ 3 %** of load — this drives your gauging method |
| R3.11 | Programme quantity | **6 satellites**, one bus design |
| R3.12 | Schedule | 42 months to first launch |

## Candidate architectures you must consider

**A. All-chemical.** A 450 N-class bipropellant apogee engine (NTO/MMH,
$I_{sp}$ ≈ 321 s) for orbit raising and station-keeping, with a common
propellant supply, plus small bipropellant or monopropellant thrusters for
attitude control.

**B. All-electric.** Electric propulsion for both orbit raising and
station-keeping. **Electric propulsion is outside this course's scope** — you
are not being asked to analyse a Hall thruster. Treat the EP system as a black
box characterised by: $I_{sp}$ = **1,800 s**, thrust = **0.25 N per thruster**
at **5 kW** input, thruster mass 12 kg, PPU mass 15 kg per string, xenon feed
system 25 kg dry, and a demonstrated throughput of 450 kg of xenon per
thruster. State every EP assumption you use in a single table so the reader can
substitute their own.

**C. Hybrid.** Chemical apogee engine for orbit raising, electric for
station-keeping. This is the arrangement most Western GEO operators converged
on and you should be able to say why without being told.

**D. Sub-trade, mandatory: the attitude-control system.** Independently of
A/B/C, choose the ACS among:

- **Cold gas.** Nitrogen at 300 bar in a COPV: ideal vacuum $I_{sp}$ = **76.8 s**
  at ε = 50 and $T_0$ = 300 K, and a real thruster delivers about **90 %** of
  frozen-ideal, so ≈ 69 s [_verify-solid-coldgas B.1]. Or a self-pressurising
  liquefiable propellant: butane at ≈ 69.2 s ideal, R-236fa at ≈ 43.2 s ideal
  and 1.36 g/cm³ stored. MarCO is the flight proof that a 40-second propellant
  can be the *right* answer when the constraint is volume and integration
  rather than Δv [MarCO].
- **Monopropellant hydrazine**, ≈ 225 s, sharing tankage with nothing.
- **Bipropellant**, sharing the main propellant supply.
- **Electric**, sharing the EP system, if you have one.

Size the ACS four ways. This sub-trade is where most students discover that
$I_{sp}$ is not the figure of merit they thought it was.

## What you must decide, explicitly

- Architecture A, B or C, with the transfer-duration penalty of the low-thrust
  options costed against R3.7 in the same units as the mass saving.
- ACS propellant and whether it is shared or independent, and what a shared
  supply does to your failure tree.
- Propellant gauging method for R3.10 — book-keeping, PVT, thermal gauging, or
  a combination — and its actual accuracy, which is not 1 %.
- Whether the apogee engine and the station-keeping thrusters share a feed
  system, and what a single blocked filter then costs you.
- Tank arrangement: number of tanks, whether propellant is shared between
  functions, and the PMD/diaphragm decision.

## Project-specific deliverables, in addition to D1–D7

- **A single-page mass-versus-time chart** showing wet mass at separation
  against time-to-station for all three architectures, with the revenue penalty
  from R3.7 converted onto the same axis. This one figure is the project.
- **A shared-versus-separate propellant fault tree** for whichever architecture
  you recommend, down to at least three levels.
- **A statement of what the ACS sub-trade actually turned on.** If your answer
  is "specific impulse", re-read your own numbers.

## Reading list

Modules **03**, **05** (storables and their long-duration behaviour), **08**
(catalytic ignition, catalyst-bed heaters, cold-start), **28**, **29**, **30**,
**31** (the entire cold-gas part — the ACS sub-trade lives here), **32**,
**33**.

Sources: [Brown] and [SMAD] for spacecraft propulsion budgeting, [Turner],
[SB §7], [NASA-SOA] for the small-system envelope, [MarCO] for the
liquefiable-propellant argument, [_verify-solid-coldgas B.1] for the gas
property table you will need.

---

# Project 4 — A reusable medium-lift booster engine

**Estimated 12 h.** Draws on modules 03, 05, 06, 07, 09, 10, 11, 12, 13, 15,
16, 17, 18, 32, 34.

## Mission statement

You are defining the first-stage engine for a new medium-lift launch vehicle
whose first stage returns and lands propulsively. The vehicle carries **nine
engines** on the first stage. The company's entire economic case rests on flying
each booster **25 times**, with an inspection-only turnaround for the first 10
flights and one scheduled engine removal at flight 10.

This is the largest and hardest project in the file, and the one where the
temptation to copy an existing engine is strongest. The rubric is specifically
looking for whether you understood *why* the engine you are copying is the
shape it is, and whether those reasons still hold under your requirements —
which are not the same as anyone else's.

## Hard requirements

| # | requirement | value |
|---|---|---|
| R4.1 | Sea-level thrust per engine, at 100 % power level | **2,400 kN ± 5 %** |
| R4.2 | Engine throttle range, stable, closed-loop | **40–100 %** |
| R4.3 | Deep-throttle landing capability, one engine | **≥ 20 %** of rated thrust, for ≥ 25 s, with restart |
| R4.4 | In-flight restarts per mission | **3** (boostback, re-entry, landing), the last after ~6 min of ballistic coast |
| R4.5 | Engine dry mass | **≤ 2,200 kg**, giving T/W ≥ 111 |
| R4.6 | Flights between overhauls | **10**, with borescope inspection only between flights |
| R4.7 | Total design life | **25 flights**, ≥ 5,000 s cumulative burn, ≥ 100 starts including acceptance |
| R4.8 | Sea-level $I_{sp}$ at 100 % | **≥ 300 s** |
| R4.9 | Gimbal range | ±8°, slew ≥ 12°/s under full thrust |
| R4.10 | Production rate | **180 engines/year** at steady state |
| R4.11 | Schedule to first flight | **48 months** |
| R4.12 | Start method | no ground support connection after lift-off; the vehicle must start all three re-lights on its own resources |

## Candidate architectures you must consider

**Power cycle** — at minimum:

- **Gas generator**, open cycle. The RS-68 chose GG explicitly over staged
  combustion **for cost**, with ~80 % fewer parts than the RS-25, and paid for
  it with the lowest T/W of any modern large booster engine (47.4:1)
  [engine-database A.2]. Merlin 1D is the modern reusable GG example and claims
  the highest T/W of any flown orbital engine at 184:1 — a **company claim**,
  though 845 kN / 470 kg does check out arithmetically [A.3].
- **Oxidiser-rich staged combustion (ORSC).** The RD-180 runs 267 bar `noz`
  with two chambers on one turbopump; the enabling technology is an **inert
  enamel coating on every metal surface in contact with hot oxygen-rich gas**,
  and that single item is why the West could not simply copy the cycle
  [A.6]. BE-4 is the first US-designed ORSC to fly and runs **deliberately low**
  at 140 bar, which Blue Origin states is a life-and-reusability choice rather
  than a limitation [A.3].
- **Full-flow staged combustion (FFSC).** Raptor is the first FFSC engine ever
  flown — that fact does not depend on any contested number. Every performance
  figure for Raptor is a **SpaceX claim**, several traceable to social-media
  posts, with **no independent verification of chamber pressure, $I_{sp}$, dry
  mass or T/W at all** [A.3.5]. You may use the claims; you must label them.
- **Fuel-rich staged combustion.** The RS-25 at 206 bar and the RD-0120 at
  219 bar `noz`. Consider it and say why you kept or dropped it.

**Propellant** — kerolox versus methalox, at minimum. Consider also what the
propellant does to reuse: RP-1 cokes, methane does not; methane is bulkier;
methane is easier to keep clean between flights.

**Chamber pressure** is a design variable, not a given. Trade at least
**100, 150, 200 and 300 bar** explicitly, and show what each does to throat
area, pump power, cooling heat flux, and the number of flights before you have
to look inside.

## What you must decide, explicitly

- Cycle, propellant and chamber pressure, as one coupled decision.
- Cooling: regenerative channel geometry and coolant choice, and the wall
  temperature you are willing to run at given R4.6/R4.7. A wall that survives
  one flight and a wall that survives twenty-five are different walls, and the
  difference is mostly low-cycle fatigue, not steady-state temperature.
- Bearings: rolling-element or hydrostatic. BE-4 chose hydrostatic explicitly
  as a life-driven decision for reuse [A.3].
- Ignition and restart: TEA-TEB slug (consumable, and you need four per
  mission), spark torch, or head-pressure start. Raptor 2 eliminated the
  main-chamber igniter entirely by lighting the chamber off hot preburner gas,
  which matters specifically for on-orbit relight [A.3].
- Injector element type, and the stability argument that goes with it at your
  chosen $p_c$.
- Whether you can hit R4.5 at your chosen cycle, and what you delete if you
  cannot.

## Project-specific deliverables, in addition to D1–D7

- **A chamber-pressure trade curve**: $I_{sp,SL}$, throat diameter, pump power,
  peak throat heat flux and predicted cycles-to-crack, all against $p_c$ from
  100 to 300 bar. Four points minimum. This curve *is* the project's technical
  core.
- **A life analysis**, however coarse: identify the life-limiting component,
  state the damage mechanism (thermal fatigue, oxidation, creep, bearing
  wear, coking), and give the parameter you would instrument to track it.
- **A reuse-economics calculation**: the number of flights at which each
  architecture's total cost per flight crosses. Amortise NRI over the fleet and
  add refurbishment per flight. If the crossover is beyond 25 flights, the
  reusability requirement is not paying for itself and you must say so.
- **An explicit statement of every company-claimed number you used** and what
  your recommendation would become if the claim is 15 % optimistic.

## Reading list

Modules **03**, **05**, **06**, **07**, **09**, **10** (Bartz, heat flux),
**11** (cooling — the life argument lives here), **12**, **13** (cycles — the
core module), **15** (combustion instability at high $p_c$), **16**
(materials — GRCop, Inconel, low-cycle fatigue), **17** (manufacturing —
additive at rate), **18** (testing, and how you would qualify 25 flights),
**32**, **34** (failure case studies).

Sources: [SB §6, §11], [HH ch. 4–7], [SP-8107], [SP-8087] and [SP-8124] on
chambers, [Bartz57], [GRCop], [GradlAM] and [Gradl18] for additive
manufacturing at engine scale, [Biggs89] for what ten years of a reusable
engine programme actually looks like, [LRECI] for instability at pressure.

---

# Project 5 — A strap-on booster for an existing core

**Estimated 8 h.** Draws on modules 19, 20, 21, 22, 23, 24, 25, 26, 32, 33,
and 05/12/13 if you take the liquid option seriously.

## Mission statement

An existing medium-lift launch vehicle needs more performance. The core stage,
its engines, its avionics and its pad are **fixed and cannot be modified**
except for structural attachment hardpoints and one additional command line.
The programme wants a strap-on booster, two or four per vehicle, flown in
pairs.

The vehicle flies **8 times a year** and the programme expects a 20-year
service life for the configuration. The launch site is coastal and has **no
rail connection**; anything larger than a road-legal load must arrive by barge,
and the site has no solid-propellant casting facility and no plan to build one.
The core's structural design allows an attachment that can carry **1,650 kN**
per booster in axial load, no more, without a core requalification the
programme will not pay for.

## Hard requirements

| # | requirement | value |
|---|---|---|
| R5.1 | Total impulse per booster | **≥ 60 MN·s** |
| R5.2 | Peak thrust per booster, sea level | **≤ 1,650 kN** (core attachment limit — this is a hard structural cap, not a target) |
| R5.3 | Burn time | **90–140 s** |
| R5.4 | Gross mass per booster | **≤ 27,000 kg** |
| R5.5 | Thrust-trace shape | thrust must fall by **≥ 25 %** from peak before max-Q at T+62 s, and the vehicle must not exceed 3.5 g axially at any point |
| R5.6 | Thrust vector control | not required from the boosters; the core gimbals. But a thrust-imbalance limit applies: **≤ 3 %** between the paired boosters at any instant |
| R5.7 | Ignition simultaneity between paired boosters | **≤ 30 ms** |
| R5.8 | Storage before flight, fully assembled | **≥ 5 years**, ambient, with an annual inspection |
| R5.9 | Transport | road-legal from factory to barge, or barge from the factory. State which |
| R5.10 | Production | **16–32 boosters/year** for 20 years |
| R5.11 | Recurring cost | binding. Report UCI per booster |
| R5.12 | Schedule to first flight | **30 months** |
| R5.13 | Range safety | the vehicle carries a flight termination system; state what your booster requires of it |

## Candidate architectures you must consider

**A. Monolithic filament-wound composite solid.** The modern default. P120C is
the reference architecture: carbon-fibre filament-wound monolithic case, one
piece, no segments, no field joints; HTPB 1912 (19 % Al, 12 % binder), a
single monolithic cast, ≈ 4,780 kN vacuum, ≈ 280 s, 141,400 kg propellant,
gross 153,000 kg, **propellant mass fraction 0.924**, and a case that takes
≈ 3,500 km of carbon fibre wound over ≈ 33 days [P120C]. The GEM family is the
smaller US equivalent: GEM-63 at 1,649.6 kN max, 279.1 s, 97.6 s burn,
44,087 kg propellant, mass fraction 0.894; GEM-63XL at 2,061 kN and 0.902
[engine-database B.3].

**B. Segmented steel solid.** The heritage architecture. The Shuttle RSRM is
the reference: D6AC steel, ~12.7 mm nominal wall, **11 casting segments
assembled into 4 flight segments joined by 3 field joints**, PBAN/AP/Al,
242 s SL / 268 s vacuum, mass fraction ≈ 0.85, with an 11-point star forward
grain that produces the regressive-then-neutral trace that limits max-Q loads
[engine-database B.1]. Segmentation exists for one reason: it lets you cast in
one place, ship by rail, and assemble somewhere else. Ask whether that reason
applies to you.

**C. Kerolox liquid strap-on.** The RD-107A architecture — four chambers per
turbopump plus verniers, 839 kN SL, 263.3 s SL / 320.2 s vacuum, and a
monopropellant-steam gas generator that has been in production since the
1950s [engine-database A.6]. Atlas IIAS flew solid strap-ons; the R-7 has
flown liquid ones for seventy years. Both work. The question is which one works
for *your* pad, *your* rate and *your* cost.

**D. Optional fourth candidate**: a segmented composite case, i.e. the SRMU
approach — graphite/epoxy filament-wound, three segments, gimballed nozzle,
HTPB. The UA1205 → SRMU transition is the cleanest side-by-side in the field
(same vehicle, same job, same diameter: PBAN→HTPB, steel→graphite/epoxy,
LITVC→gimballed nozzle, 5–7 segments→3), worth roughly +14 s of $I_{sp}$ and a
large inert-mass saving — and the development was famously troubled, with a
case failure during a 1991 structural test that killed a worker and slipped the
programme by years [_verify-solid-coldgas A.4].

## What you must decide, explicitly

- Architecture, and the case material and construction that goes with it.
- **Grain geometry**, if you choose a solid: what shape gives you the R5.5
  thrust-trace requirement, and what it costs you in volumetric loading. This
  is not optional; a solid booster study without a grain design is a study
  without a design.
- Propellant family and its burn-rate exponent $n$, and what your $n$ does to
  the temperature sensitivity of the trace and therefore to R5.6.
- Nozzle: fixed or vectorable, submerged or external, throat material.
- Ignition and the simultaneity requirement R5.7 — this is a harder
  requirement than it looks and it constrains the igniter design directly.
- For the liquid option: how you meet R5.7 and R5.6 at all, given start
  transients, and whether you accept the pad complexity of a second propellant
  loading system.

## Project-specific deliverables, in addition to D1–D7

- **A thrust-versus-time trace** for your recommended option, computed, not
  sketched, showing the ≥ 25 % roll-off required by R5.5 and the $K_n$ history
  that produces it.
- **A temperature-sensitivity analysis**: what happens to total impulse, burn
  time and peak thrust across a propellant mean bulk temperature range of
  −5 °C to +35 °C, using your chosen $\sigma_p$ and $n$. Then state whether the
  vehicle still closes at both extremes. Solids are the only architecture here
  whose performance depends on what the weather was like last week, and the
  rubric checks that you noticed.
- **A transport and handling analysis** against R5.9, with the hazard
  classification you are assuming and what it does to the facility, the
  workforce and the insurance. A Class 1.3 propellant and a Class 1.1
  propellant are different businesses.
- **A pad-and-ground-systems delta**, in one page, for each candidate. The
  liquid option's cost is mostly not in the booster.

## Reading list

Modules **19** (fundamentals), **20** (burn rate, $r = a p^n$, temperature
sensitivity), **21** (grain geometry — central to this project), **22** (cases,
steel versus composite), **23** (insulation and liners), **24** (nozzles),
**25** (manufacturing, casting, and why the facility is the architecture),
**26** (historical large motors), **32**, **33**. If you take candidate C
seriously: **05**, **12**, **13**.

Sources: [SB §12–15], [Davenas], [Kubota], [SP-8064] on propellant selection,
[SP-8076] on grain design and internal ballistics, [SP-8073] on grain
structural integrity, [SP-8025] on metal cases, [SP-8115] on solid-motor
nozzles, [SP-8039] on performance prediction, [Rogers86] for what a field joint
can do to a programme, [P120C].

---

# Project 6 — A crew-capsule launch abort system

**Estimated 9 h.** Draws on modules 03, 05, 07, 08, 09, 19, 20, 21, 24, 32,
33, 34.

## Mission statement

You are the propulsion lead for the launch abort system of a **10,500 kg**
crew capsule flying on a new medium-lift launcher. The system must pull or push
the capsule clear of a failing booster from the pad through the end of first-
stage burn, and it must do so in a regime where the failure it is escaping may
be a detonation, a deflagration, a slow thrust decay, or a structural
break-up — four very different problems that arrive with essentially no
warning.

This is a system with a peculiar economics: it does nothing on every successful
flight, it costs mass on every successful flight, and on the one flight where
it is needed it must work the first time with no test, no abort of the abort,
and seven people in the loop.

## Hard requirements

| # | requirement | value |
|---|---|---|
| R6.1 | Capsule mass at abort | **10,500 kg** |
| R6.2 | Net Δv imparted to the capsule relative to the booster | **≥ 250 m/s** |
| R6.3 | Time to achieve R6.2 from abort command | **≤ 4.0 s** |
| R6.4 | Axial acceleration, sustained | **≥ 4.0 g** and **≤ 12.0 g**; jerk ≤ 500 m/s³ |
| R6.5 | Lateral acceleration on the crew | ≤ 4.0 g |
| R6.6 | Pad abort: apogee and downrange | **≥ 1,000 m apogee**, **≥ 600 m downrange**, chutes deployable |
| R6.7 | Abort must function from | T−0 on the pad through **max-Q** and to first-stage separation |
| R6.8 | Reaction time, sensed fault to first thrust | **≤ 100 ms** |
| R6.9 | Mass penalty on a nominal (no-abort) flight, after jettison if applicable | this is your output; the programme's stated target is **≤ 1,000 kg** carried to staging |
| R6.10 | Storage and readiness | **≥ 12 months** on-vehicle without servicing; ≥ 5 years shelf |
| R6.11 | Reliability of the abort function on demand | **≥ 0.995**, demonstrable by analysis plus ≤ 4 flight tests |
| R6.12 | Post-abort attitude control | the capsule must be reoriented heat-shield-forward or chute-stable within 12 s of burnout |
| R6.13 | Programme quantity | 12 crewed flights over 8 years |

## Candidate architectures you must consider

**A. Solid tower (tractor).** A jettisonable tower forward of the capsule with
a solid abort motor pulling it clear, plus an attitude-control motor and a
jettison motor. The Mercury/Apollo/Soyuz/Orion lineage. Assume a solid abort
motor of **1,800 kN for 5 s** at **270 s** vacuum-equivalent $I_{sp}$, and a
total tower jettison mass you must compute rather than assume.

**B. Liquid pusher (integrated).** Hypergolic engines mounted on the capsule
itself, pushing rather than pulling, not jettisoned, and available for other
uses. SuperDraco is the flight-proven reference: **8 engines in 4 pods of 2**,
**71 kN each** (≈ 568 kN total), **69 bar** chamber pressure — exceptionally
high for pressure-fed, hence a substantial helium system — **235 s** $I_{sp}$,
**1,388 kg** of MMH/NTO, **20–100 % throttle**, ~25 s burn, and a **3D-printed
Inconel regeneratively cooled chamber**, unusual for a hypergolic abort engine
and necessary because it must be restartable and reusable [engine-database
A.3]. Note also A.3.9: the propulsive-landing application of this same system
was abandoned after an April 2019 ground-test explosion traced to **NTO leaking
past a check valve into a helium line**. That event is directly relevant to
R6.10 and you are expected to engage with it.

**C. A third option of your own.** Solid pusher, liquid tractor, or a
staged/dual-mode arrangement. If you propose one you must size it fully.

## What you must decide, explicitly

- Tractor or pusher, and jettisoned or retained.
- Whether the abort motor's thrust profile is a single pulse or shaped, and
  what shaping costs. R6.4's ceiling of 12 g and R6.2's floor of 250 m/s
  together bound the trace tightly; find the corner.
- For the solid: grain geometry to hold the trace inside the g-limits as mass
  is expelled, throat material for a very short, very hot burn, and the case
  material given that the motor lives on the vehicle for a year.
- For the liquid: propellant storage next to the crew for the whole mission,
  the helium system at 69 bar chamber pressure, isolation valve architecture,
  and how you prevent the A.3.9 failure.
- Attitude control after burnout (R6.12) — this is a separate propulsion
  subsystem and students routinely forget to size it.
- How you demonstrate R6.11 with four or fewer flight tests. This is a
  statistics problem before it is a propulsion problem, and it may be the
  criterion that decides the architecture.

## Project-specific deliverables, in addition to D1–D7

- **An abort-trajectory sketch with numbers** for the pad-abort case and the
  max-Q case, showing that R6.2, R6.3, R6.4 and R6.6 are met simultaneously.
  Two trajectories minimum. The pad abort sizes the total impulse; the max-Q
  abort sizes the structure and the lateral loads.
- **A g-limit compliance plot**: axial acceleration versus time, with the
  4 g floor and 12 g ceiling drawn, for both cases and for both a nominal and a
  hot (+30 °C) solid grain if you chose the solid.
- **A nominal-flight mass-penalty accounting.** Every kilogram of the abort
  system is a kilogram of payload on 11 of 12 flights. State the penalty in
  payload terms and in programme terms.
- **A demonstrated-reliability argument** for R6.11 that is arithmetically
  honest about what four flight tests can and cannot show.
- **A one-paragraph engagement with the 2019 check-valve event**, whichever
  architecture you recommend.

## Reading list

Modules **03**, **05** (hypergolic storability, and what MMH/NTO does to
materials over a year), **07** (injectors, and why an abort engine's injector
is a different problem), **08** (ignition — the 100 ms requirement is an
ignition requirement), **09**, **19**, **20**, **21** (grain shaping for a
thrust trace under a g-limit), **24** (nozzles for a 5-second burn), **32**,
**33**, **34** (failure case studies — read this one before you start).

Sources: [SB §8, §12, §15], [Davenas] and [Kubota] for the solid side,
[SP-8051] on solid-motor igniters, [SP-8076] on grain design, [SP-8080] and
[SP-8094] on valves and check valves — read these specifically before you write
about candidate B — [Brown], [Humble], and the abort-system history in
[Hunley07].

---

## Appendix A — running a Pugh matrix without fooling yourself

The Pugh matrix is a *communication* tool that has been widely mistaken for a
*decision* tool. It does not decide anything. It makes the basis of a decision
legible so that somebody can disagree with a specific number rather than with a
vibe. Used properly it has four properties:

1. **The datum is a real option**, ideally the incumbent or the obvious choice,
   so that "+1" means "better than what we would otherwise do".
2. **Weights precede scores.** Always. If you find yourself adjusting a weight
   after seeing a total, stop, write down what you actually believe, and start
   the scoring again. It is not cheating to change your mind about weights; it
   is cheating to change them silently in order to get a total you already
   wanted.
3. **Every score has a number behind it.** "Mass: +2" is worthless. "Mass: +2
   (182 kg wet versus 191 kg, from D1 Table 3)" is a sentence somebody can
   argue with.
4. **The sensitivity result is reported whether or not it is convenient.** The
   most valuable output of a trade study is frequently "this decision is a coin
   toss on the current data, and here is the measurement that would settle it".

A matrix in which the recommended option wins every criterion is either a
trivial decision that did not need a study or — far more likely — a study
written backwards from its conclusion. Assume the latter and go looking for
what you flattered.

## Appendix B — the assumption register

Every project requires an **assumption register**: a numbered table of every
number you assumed rather than computed or sourced, with its value, its
justification, and the deliverable it feeds. Ten to thirty entries is normal.

It exists for two reasons. First, it is the only honest way to present a study
built on incomplete data, which is all of them. Second — and this is the part
students underestimate — when the study is revisited in eighteen months by
somebody who was not in the room, the assumption register is the only artefact
that tells them whether the conclusion still holds. A trade study without one
has a shelf life of about a quarter.

Assumptions taken from the engine database must carry the database's confidence
label and its caveats. A company claim is an assumption with a name attached
to it, and naming the claimant is part of the citation.
