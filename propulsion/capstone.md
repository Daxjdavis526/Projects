# Capstone — Three Missions

Capstone · Prerequisites: all of Parts I–V; modules 03, 06, 09, 10, 11, 12,
13, 16, 17, 18, 20, 21, 22, 24, 25, 32 and 33 are load-bearing · Estimated
time: **15–25 h** for one mission, three weeks for all three

**The reference solutions, Pugh matrices, sensitivity results, risk lists and
rubric are in [`capstone-key.md`](capstone-key.md). Do not open it until your
report is written and dated.** A trade study whose answer you already know
teaches you how to agree with somebody, which is not a skill anyone pays for.

---

## Why this exists

Every exam in this course asks you a question that has an answer. This does
not. Each of the three missions below is an architecture-selection problem of
the kind that gets settled once, in a room, in the first eight weeks of a
programme, and then quietly determines what the next four years cost. Nobody
in that room has complete information. The propellant choice will be argued by
someone who has never sized a turbopump; the reuse target will be argued by
someone who has never opened a chamber after a hot fire and seen the throat.
Your job is to be the person who did the arithmetic, and who can say out loud
what the arithmetic does *not* settle.

The three missions are deliberately different animals:

| | A | B | C |
|---|---|---|---|
| what | first-stage engine for a reusable medium launcher | Mars orbit insertion + landing stage | sounding-rocket-class motor |
| the hard part | reuse economics vs cycle complexity | nine months of storage and one chance | temperature range, storage life, and rate |
| what dominates | heat flux and turbomachinery life | Δv closure and contamination | grain, case mass fraction and cost |
| the discipline it exercises hardest | heat transfer, cycles, manufacturing | systems engineering, mission fit | solid ballistics, materials, production |

Do one of them properly rather than three of them badly. If you are on the
36-week path, do all three and notice how differently the same seven criteria
weight.

---

## Scope boundary (read this before Mission C)

Mission C is written at the level of **public engineering requirements**:
total impulse, thrust profile envelope, burn time, storage temperature range,
mass fraction, production rate. Everything in it is generic and fictional.
Your answer must stay at the same level: propellant *families* and published
class properties, grain *concepts*, case and nozzle *materials*, process
*names*. Do not write a formulation, do not write a mix or cure procedure, do
not give a weapon-specific dimension, and do not write an operational test
procedure. This mirrors the course scope boundary in the README and the
rubric enforces it: a report that crosses it is returned ungraded, not
marked down.

---

## Ground rules common to all three missions

These apply unless the mission statement overrides them. Where a mission
overrides, it says so explicitly.

### G1 — Numbers

1. SI throughout. $g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K).
2. **Every arithmetic step must be reproducible with
   [`tools/rocket.py`](tools/rocket.py).** If a step has no library function,
   say in one line why not. The reference solution registers its whole
   arithmetic chain in `tools/examples/capstone.py`; yours should be
   checkable the same way.
3. Real-engine figures come from
   [`reference/engine-database.md`](reference/engine-database.md) **with the
   caveat attached**. Raptor, BE-4, Archimedes and Prometheus numbers are
   company claims and must be labelled as such every time they appear. A
   Star 48B $I_{sp}$ quoted without the nozzle it belongs to is wrong even
   when the number is right.
4. Cite by tag into [`reference/sources.md`](reference/sources.md).
5. Tag your own claims with the epistemic labels: [F] [E] [H] [M] [R] [A] [J].
   A report with no [J] tags is a report that has hidden its judgment calls.

### G2 — Chamber thermochemistry

You do not have CEA in this exercise, and you are not being asked to write an
equilibrium solver. Use the chamber-state table your mission gives you. It is
labelled [A]: representative equilibrium values at the stated $p_c$ and
mixture ratio, rounded, consistent to a few percent with published CEA runs
for the same propellant pair. What you **are** graded on is whether you use
it correctly: that $\mathcal{M}$, $T_0$ and $\gamma$ move in the right
directions when you change $p_c$ or $r$, that $c^*$ tracks
$\sqrt{T_0/\mathcal{M}}$, and that you distinguish ideal $c^*$ from delivered
$c^*$ with a stated and defended $\eta_{c^*}$.

If your architecture wants a mixture ratio or chamber pressure not in the
table, interpolate and **say that you interpolated**, or argue the direction
of the error. Do not invent a $T_0$.

### G3 — Efficiencies

State every efficiency, justify it, and use it consistently across all
candidates. The reference solution uses:

| efficiency | value used | basis |
|---|---|---|
| $\eta_{c^*}$, gas generator / pressure-fed liquid | 0.955–0.96 | [E] typical of a well-developed impinging or pintle injector |
| $\eta_{c^*}$, staged combustion | 0.975–0.98 | [E] preburner gas arrives partly reacted and well mixed |
| $\eta_{c^*}$, solid, aluminized | 0.95 | [E] includes two-phase and incomplete-combustion loss |
| nozzle efficiency $\eta_n$ (divergence + friction + kinetic) | 0.98 liquid, 0.96 solid | [E] $\lambda \approx 0.985$ for a 15° equivalent bell, remainder friction and (solids) particle lag |

You may use different values. You may not use different values *for different
candidates* without an argument tied to the hardware.

### G4 — Mass margins

Use the AIAA S-120-style maturity-based mass growth allowance from the
trade-study projects file. Reproduced here because it is not optional:

| design maturity | MGA |
|---|---|
| flight-qualified, unmodified, same environment | 2 % |
| flight-qualified, modified or requalified | 5 % |
| existing design, new build, new environment | 10 % |
| new design, conventional materials and processes, analysis complete | 15 % |
| new design, analysis preliminary | 25 % |
| new design, new material or new process, no analysis | 35 % |
| estimated by analogy with a photograph | 50 % |

On top of the MGA-loaded total carry a **15 % system margin** at architecture
selection. Size propellant on the *predicted* (margined) dry mass. Carry a
separate propellant performance reserve: **2 %** for a launch stage, **5 %**
for a landing stage, **10 %** for a multi-year storage budget. State residuals
and trapped propellant explicitly — 1–3 % of the load for a pump-fed stage,
worse for a small pressure-fed system with long lines. Forgetting residuals is
the single most common omission in this exercise and it always flatters the
architecture with the most plumbing.

### G5 — Cost proxies

Absolute currency is unknowable to you and is not asked for. Build the two
indices defined in
[`part6-interview/trade-study-projects.md`](part6-interview/trade-study-projects.md)
§D4 — the **Recurring Unit Cost Index (UCI)** with its complexity classes
$c_i$ and process multipliers $k_i$, and the **Non-Recurring Index (NRI)**.
Two additions for the capstone:

- **Rate.** State the production rate the mission needs and whether the
  architecture achieves it. A filament-wound case of P120C class takes roughly
  33 days of winding [P120C]; that is a schedule fact before it is a cost fact.
- **Reuse-adjusted UCI.** For Mission A only, divide UCI by the number of
  flights the hardware is *qualified* for, not the number it might survive,
  and add the refurbishment index defined in Mission A's ground rules. An
  architecture that is 40 % more expensive to build and flies four times as
  often is cheaper, and the matrix must be able to see that.

### G6 — Schedule

Every mission has a schedule requirement. Treat it as a hard requirement, not
a wish. The three things that actually set propulsion schedule are: **test
facility availability**, **qualification of a new process**, and **long-lead
material or forging procurement**. If your architecture needs a facility that
does not exist, that is a five-year item and the NRI facility term exists to
make you write it down.

---

## The twelve deliverables

Every mission asks for all twelve. The mission statements add requirements on
top; they never replace these. **Deliverables D1–D11 must be produced for
every candidate architecture, not only for the one you recommend.** An
analysis that exists only for the winner is the signature of a decision taken
before the analysis, and the rubric looks for it first.

### D1 — Chamber state and thermodynamics

From the mission's chamber-state table: $T_0$, $\mathcal{M}$, $\gamma$, hence
$R = R_u/\mathcal{M}$ and ideal $c^*$ by Eq. 3.1. Then delivered $c^*$ with a
justified $\eta_{c^*}$. State the mixture ratio you chose and *why it is not
the $I_{sp}$ optimum* — every flying engine sits off the optimum for a
reason (bulk density, wall heat flux, turbine inlet temperature, coolant
capacity) and you must name yours. Include a one-line check that $c^*$ tracks
$\sqrt{T_0/\mathcal{M}}$ between two of your candidates.

For solids: $c^*$, the flame temperature class, and an explicit statement of
what the condensed phase does to both.

### D2 — Fluids and feed system

Liquid, pump-fed: pump $\Delta p$ from a stated pressure budget (chamber +
injector drop + jacket drop + line losses + margin); pump power for each
pump; NPSH available at the inlet from tank pressure, vapour pressure and
line loss; suction specific speed at your assumed shaft speed and a statement
of whether it needs an inducer or a boost pump.

Liquid, pressure-fed: tank pressure from the same budget, pressurant mass and
pressurant tank mass, regulated vs blowdown, and the temperature the
pressurant arrives at.

Solid: $K_n$, the burn-rate law $r = a p^n$ with $a$ in SI, the equilibrium
chamber pressure it produces, and the stability check $n < 1$ with how much
margin.

Hybrid: oxidizer feed mode, regression-rate law form, and the $O/F$ shift over
the burn.

### D3 — Combustion and injector or grain concept

Liquid: element type (impinging doublet/triplet, coaxial shear, coaxial
swirl, pintle), element count or pintle geometry class, injector pressure
drop as a fraction of $p_c$ and what that fraction buys, and a **combustion
stability argument**: chamber acoustic modes estimated, the damping device
you propose (baffles, acoustic cavities, or the inherent stability of a
pintle), and the stability-rating test you would run [SP-8113] [Culick68].
Chamber $L^*$ and stay time.

Solid: grain concept (BATES, star, finocyl, end-burner, slotted tube), the
burn-area history it produces qualitatively, sliver fraction, and how the
concept meets the required thrust-time shape.

### D4 — Nozzle

Area ratio $\varepsilon$ and how you chose it: the altitude at which it is
matched, the exit pressure it implies, and a **separation check** at the
worst case using both the Summerfield criterion and Schmucker, with a
statement of which you trust and why they differ [Schmucker73] [Ostlund02].
Exit diameter, and whether it fits the vehicle envelope — this constraint
kills more nozzle designs than performance does. Contour type (conical,
Rao/TOP, bell percentage) and the divergence efficiency you assumed.

For a stage that flies through a large pressure range, say what happens at
liftoff and at burnout, not just at the design point.

### D5 — Materials

Chamber/case wall material with the property that drives the choice
(conductivity for a regen liner, specific strength for a wound case,
temperature capability for a radiatively cooled skirt), the temperature it
sees, and its allowable at that temperature — not at room temperature. Name
the failure mode the material is chosen against: low-cycle thermal fatigue,
hydrogen embrittlement, oxygen compatibility, hot-gas oxidation, creep,
liner debond. For any oxidizer-rich hot-gas path, address the coating
question explicitly [SB].

### D6 — Heat transfer and cooling

Required for every liquid candidate and for the nozzle throat of every solid
candidate.

1. **Throat heat flux** by Bartz [Bartz57], with the property-variation factor
   $\sigma$, stating the ±20–30 % accuracy band and what you did about it.
2. **A 1-D wall check**: the temperature drop across the hot wall
   $\Delta T = q t / k$ at your chosen thickness and conductivity, hence the
   coolant-side wall temperature, and whether that is compatible with the
   coolant.
3. **Coolant bulk temperature rise** across the jacket from a flux-weighted
   area estimate, and a statement of the jacket pressure drop you assumed and
   where it appears in the D2 pressure budget.
4. **The stress consequence**: constrained-wall thermal stress
   $\sigma = E\alpha\Delta T/(2(1-\nu))$ compared with the material allowable
   *at temperature*. If it exceeds yield — and for a high-$p_c$ regen chamber
   it will — say so, and say what that implies for cyclic life and the
   doghouse failure mode. A report that computes 500 MPa in a 130 MPa
   material and moves on has missed the entire point of module 10.
5. For solids: throat erosion rate class, the ablative or refractory choice,
   and the throat-area growth you budget over the burn and what it does to
   $p_c$ and delivered impulse.

### D7 — Architecture

The cycle (pressure-fed, gas generator, tap-off, expander, expander bleed,
staged combustion fuel- or oxidizer-rich, full-flow, electric pump) or the
motor type, drawn as a **Mermaid flow diagram** showing every fluid path
including bleeds, dumps and purges. State the cycle's power balance
qualitatively — what drives the turbine, at what temperature, and what limits
it. For an electric-pump candidate, the battery energy and mass are part of
the propulsion system and belong in D9.

### D8 — Testing plan

A test pyramid from component to qualification, with **numbers of articles
and numbers of firings at each level**:

- component (injector element, valve, igniter, single channel)
- subscale or single-element hot fire
- workhorse chamber / subscale motor
- development engine or motor, full scale
- qualification: how many units, how many firings each, over what temperature
  and duty-cycle envelope
- acceptance: what every flight unit gets before it ships

Say what is measured, with what instrument, and **what the data looks like
when the thing is wrong** — the signature of a chugging feed system, of an
injector face that is streaking, of a case-bond separation on an X-ray, of a
turbine blade crack in vibration data. Include the stability-rating approach
for liquids and the temperature-conditioned firings for solids.

State the **facilities** you need and whether they exist. A vacuum-capable
altitude stand for a 12 kN engine is not the same problem as one for an
850 kN engine, and the second one may not exist at all.

### D9 — Manufacturing plan

Process route for the three or four parts that dominate cost and schedule.
Name the processes: filament winding, HIP, EB weld, vacuum brazing, DMLS/LPBF,
blown powder DED, investment casting, ablative tape wrapping, mandrel casting.
For each: what it limits (size, wall thickness, feature resolution, lead time),
what qualification it needs, and the rate it supports. Produce the UCI and NRI
of G5 with the inputs shown. State the **rate** and defend it against the
mission's production requirement.

### D10 — Performance and closure

$I_{sp}$ (sea-level and vacuum, both stated), thrust, mass flow, throat and
exit geometry, engine or motor dry mass, thrust-to-weight, and the **Δv or
mission closure**: the rocket equation applied to the margined mass budget,
with the stage or vehicle actually closing. If it does not close, say so —
one of the candidates in each mission does not close, and finding that is
worth more than a pretty matrix.

Uncertainty: put an error bar on delivered $I_{sp}$ using `rss` and the
uncertainty functions, and say what measurement would shrink it.

### D11 — Reliability

Exactly as in the trade-study projects §D3, and it is not adjectives:

1. **Part count**, split into moving parts in the propellant path, valves that
   must actuate in flight, pyrotechnic devices, rotating machinery, and joints
   containing hot gas or oxidizer. Per candidate. This one table does more
   than any paragraph.
2. **Single-point failures** enumerated, each labelled removable by redundancy,
   removable by design change, or not removable.
3. **A top-ten FMEA extract**: failure mode → mechanism → detection → effect →
   mitigation. Specific failure modes only. "Engine fails" scores zero.
4. **A demonstrated-reliability statement** with honest binomial confidence.
   Claiming 0.999 from twelve firings is arithmetically impossible and the
   rubric will find it. For Mission A add the reuse dimension: reliability
   per flight is not reliability per engine-life.

### D12 — Mission fit

The criterion students skip and programmes lose money on. Answer four
questions in half a page:

1. What does this architecture demand of the **rest of the vehicle** — tank
   material and insulation, structural loads, avionics, ground support,
   thermal control, recovery hardware?
2. What does it demand of the **operator** — propellant handling, personnel
   protective equipment, range safety, turnaround time, storage?
3. What **future missions** does it enable or foreclose? An architecture that
   cannot be uprated 20 % is a different business proposition from one that can.
4. What is the **first thing that changes** if the mission requirement you were
   given moves by 20 % in the direction it is most likely to move?

---

## Report format

**Hard page limits.** They are enforced by ignoring the overflow, which is
what a real review does.

| section | limit |
|---|---|
| Executive memo | **1 page.** One. |
| Requirements and ground rules, including your assumption list | 2 pages |
| Candidate descriptions (all of them) | 3 pages |
| D1–D6 analysis | 8 pages |
| D7–D9 architecture, testing, manufacturing | 5 pages |
| D10–D12 performance, reliability, mission fit | 5 pages |
| Pugh matrix, weights, sensitivity | 2 pages |
| Risk register | 1 page |
| Appendix: calculation listing / `tools` output | unlimited, but nothing in it is graded unless referenced from the body |

**Required tables** (each of these is a specific line in the rubric):

| # | table |
|---|---|
| T1 | Requirements → verification method → candidate compliance matrix |
| T2 | Chamber state and delivered performance, all candidates side by side |
| T3 | Mass budget: basic → MGA → predicted, by subsystem, with system margin |
| T4 | Pressure budget (liquid) or ballistic table (solid), all candidates |
| T5 | Heat-transfer summary: $q_t$, $\Delta T_{wall}$, $T_{wc}$, coolant rise, thermal stress vs allowable |
| T6 | Part count by category, all candidates |
| T7 | UCI / NRI with inputs shown |
| T8 | Test pyramid: level → articles → firings → duration → what it retires |
| T9 | Pugh matrix with weights, scores, and one line of evidence per score |
| T10 | Risk register, ≥ 8 risks, 5×5 scored |

**Required figures:**

| # | figure |
|---|---|
| F1 | Cycle or motor schematic for the recommended architecture, **Mermaid**, every fluid path shown |
| F2 | Thrust-time or thrust-altitude trace for the recommended architecture, with the mission events marked |
| F3 | A sensitivity plot or table: winner as a function of the one weight that matters |

A hand-drawn F1 photographed and pasted in is acceptable and in some ways
preferable. A block diagram with a box labelled "turbopump" and no fluid
paths is not.

---

## The Pugh matrix

Rules, enforced:

- **Criteria, minimum set**: performance, mass, complexity, reliability,
  manufacturability, cost, mission fit. Each mission adds two or three of its
  own and says which. Do not merge any of the seven. Every one of them is on
  the list because a real programme lost money folding it into another.
- **Weights sum to 100**, and each carries **one sentence of justification
  tied to this mission statement**. "Reliability matters" is not a
  justification. "The stage flies fifteen times and a loss on flight nine
  destroys the recovery vessel as well as the stage" is.
- **Write the weights down before you score.** The rubric checks the order and
  you should date the page.
- **Scoring** −2 to +2 against a datum, or 1–5 absolute. Say which. **The
  datum must be a real candidate, not an idealisation.**
- **Every score gets one line of evidence pointing at a number in D1–D11.**
  An unsupported score is worth zero, which means an unsupported matrix is
  worth zero.
- **Sensitivity, three parts**: (i) vary each weight ±50 % of its own value,
  one at a time, and report which weight flips the winner and at what value;
  (ii) one two-criterion perturbation; (iii) one *input* perturbation — move a
  physical number (delivered $I_{sp}$, throat erosion, refurbishment cost,
  battery specific energy) by its plausible error and see whether the answer
  survives. Report honestly, including "nothing flips it", which is a strong
  and publishable result.

**If your recommended architecture does not lose on at least two criteria you
have written a brochure, not a trade study, and the rubric deducts for it.**

---

## Schedule — where 15–25 hours go

| activity | h (15 h run) | h (25 h run) | note |
|---|---|---|---|
| requirements parse, assumption list, ground rules | 1.0 | 1.5 | write down every assumption; you need them for the memo |
| candidate definition — get to ≥ 4 real, distinct options | 1.0 | 1.5 | if two candidates differ only in a number, you have three candidates |
| D1 chamber state, D10 performance, all candidates | 2.5 | 4.0 | use `tools/rocket.py`; hand-integrate nothing you can call |
| D2 feed / ballistics, all candidates | 1.5 | 2.5 | |
| D3 injector or grain, D4 nozzle | 1.5 | 2.5 | |
| D6 heat transfer with the 1-D check and the stress consequence | 2.0 | 3.0 | the single most commonly skimped deliverable |
| D5 materials, D7 architecture diagram | 1.0 | 2.0 | |
| D3 mass budget with margins (T3) | 1.0 | 1.5 | build it before the matrix, always |
| D11 reliability: part count, SPFs, FMEA | 1.0 | 2.0 | |
| D8 testing plan, D9 manufacturing plan, UCI/NRI | 1.5 | 2.5 | |
| D5 risk register | 0.5 | 1.0 | |
| Pugh matrix, weights first, then scores, then sensitivity | 1.0 | 2.0 | |
| memo, one page | 0.5 | 1.0 | write it last and cut it twice |

The extra ten hours in a 25 h run go into three places and nowhere else: a
real heat-transfer and cooling sizing instead of an assumed one, a second
sensitivity axis, and an honest FMEA instead of a plausible one.

---

## Rubric — 100 marks

| # | item | marks |
|---|---|---|
| 1 | **D1 chamber state and thermodynamics**, all candidates, $c^*$ correct, $\eta_{c^*}$ justified, mixture-ratio choice argued | 8 |
| 2 | **D2 fluids**: pressure budget closes, pump power or $K_n$/ballistics correct, NPSH or stability margin stated | 8 |
| 3 | **D3 combustion**: injector or grain concept specific, stability or burn-area argument present | 7 |
| 4 | **D4 nozzle**: $\varepsilon$ justified against altitude *and* envelope, separation checked both ways | 7 |
| 5 | **D5 materials**: allowable quoted at temperature, failure mode named | 5 |
| 6 | **D6 heat transfer**: Bartz with $\sigma$, 1-D wall check, coolant rise, thermal-stress consequence stated honestly | 10 |
| 7 | **D7 architecture**: cycle/motor correct, F1 diagram complete, power balance argued | 6 |
| 8 | **D8 testing**: pyramid with article and firing counts, failure signatures, facility reality check | 7 |
| 9 | **D9 manufacturing**: process route, what each limits, UCI/NRI with inputs, rate defended | 7 |
| 10 | **D10 performance and closure**: $I_{sp}$, mass, Δv or mission closure on *margined* mass, uncertainty stated | 10 |
| 11 | **D11 reliability**: part count table, SPFs, FMEA specific, binomial confidence honest | 7 |
| 12 | **D12 mission fit**: all four questions answered concretely | 4 |
| 13 | **T3 mass budget** with a maturity-based margin policy and residuals | 5 |
| 14 | **T9 Pugh matrix**: weights justified and prior, evidence per score, sensitivity in all three parts | 9 |

**The recommendation itself is not graded.** Every one of these three missions
has at least two defensible answers. What is graded is whether your analysis
supports the recommendation you made, whether you can name what you gave up,
and whether you found the thing that flips it.

**Automatic deductions:**

| deduction | for |
|---|---|
| −10 | any candidate without D1/D2/D10 |
| −10 | recommended option wins on every criterion |
| −8 | mass closure computed on basic rather than margined mass |
| −8 | heat-transfer section that reports a thermal stress above yield without comment |
| −5 | any database figure quoted without its caveat where the database flags one |
| −5 | flat-percentage or absent mass margin policy |
| −5 | weights that appear after the scores |
| −20 | a number invented rather than computed or sourced |
| return ungraded | Mission C content crossing the scope boundary above |

---
---

# Mission A — First-stage engine for a reusable two-stage medium launcher

**Estimated 20–25 h.** Draws hardest on modules 03, 06, 07, 09, 10, 11, 12,
13, 16, 17, 18, 33.

## Mission statement

VERIDIAN LAUNCH SYSTEMS (fictional) is developing **Ardent**, a two-stage
medium-lift launcher. The first stage returns to a downrange landing platform
and is reflown. The company has raised enough money to build one engine
development programme and one vehicle, not two of either. You are the
propulsion architect and your deliverable is the **first-stage engine
architecture**: propellant pair, cycle, chamber pressure, engine count, and
the reuse strategy that goes with them.

The second stage uses a vacuum variant of whatever you choose. That is a
constraint, not a freedom: an architecture that makes a good booster engine
and a poor upper-stage engine costs the company a second development
programme it cannot afford, and Mission Fit must say so.

The company's business case is **eight flights per year rising to twenty**,
with a booster reflown ten times before major overhaul. The first flight is
demanded **four years** from architecture selection.

## Hard requirements

| # | requirement | value |
|---|---|---|
| A1.1 | Payload to 200 km circular, 28.5° inclination, with first-stage recovery | **≥ 10,000 kg** |
| A1.2 | Payload to the same orbit, first stage expended | **≥ 13,000 kg** (goal, not a floor) |
| A1.3 | Gross lift-off mass | **≤ 460,000 kg** |
| A1.4 | Lift-off thrust-to-weight at GLOW | **≥ 1.25** |
| A1.5 | Engine-out: loss of one first-stage engine at T+0 | vehicle must sustain **T/W ≥ 1.05** and reach a safe abort or degraded orbit |
| A1.6 | Engine-out: loss of one first-stage engine after T+25 s | **nominal mission**, no payload loss |
| A1.7 | First-stage engine throttle range, continuous and stable | **≥ 40–100 %** of rated sea-level thrust |
| A1.8 | Restarts per flight, first-stage engines, in flight | **≥ 2** (entry burn, landing burn), at least one with a subset of engines |
| A1.9 | Reuse: flights between engine removal for major overhaul | **≥ 10** |
| A1.10 | Reuse: flights before engine retirement | **≥ 25** |
| A1.11 | Turnaround: booster wheels-down to next launch | **≤ 21 days**, of which ≤ 5 days of engine work |
| A1.12 | Engine sea-level thrust-to-weight | **≥ 70:1** |
| A1.13 | Production rate at steady state | **≥ 160 engines/year** equivalent (see ground rule A-G4) |
| A1.14 | First flight | **≤ 48 months** from architecture selection |
| A1.15 | Second-stage engine derived from the same architecture | required; state the derivation |

## Ground rules and assumptions specific to Mission A

**A-G1 — Δv and losses.** Size the vehicle to a total ideal Δv of
**9,300 m/s** from lift-off to a 200 km circular orbit at 28.5°. This already
includes gravity, drag and steering losses of about 1,900 m/s and the credit
for Earth's rotation of about 400 m/s at the launch site [J]. Split it between
stages as you see fit and **justify the split**; the split is a real design
variable and it interacts with the recovery reserve.

**A-G2 — Recovery reserve.** The first stage must retain propellant for a
**1,400 m/s** entry-plus-landing budget [J], performed on a subset of engines
at an effective $I_{sp}$ you must state. This propellant is carried through
ascent and it is not free. Landing-burn thrust must not exceed what the stage
can throttle to at landing mass: check it.

**A-G3 — Chamber state table [A].** Representative equilibrium chamber values.
Interpolate if you need to, and say so.

| pair | $r$ (O/F) | $p_c$ (bar) | $T_0$ (K) | $\mathcal{M}$ (kg/kmol) | $\gamma$ |
|---|---|---|---|---|---|
| LOX/RP-1 | 2.35 | 100 | 3600 | 23.0 | 1.20 |
| LOX/RP-1 | 2.60 | 180 | 3720 | 23.8 | 1.19 |
| LOX/CH₄ | 3.30 | 60 | 3520 | 21.1 | 1.20 |
| LOX/CH₄ | 3.40 | 100 | 3550 | 21.3 | 1.20 |
| LOX/CH₄ | 3.50 | 180 | 3600 | 21.6 | 1.19 |
| LOX/CH₄ | 3.60 | 280 | 3640 | 21.9 | 1.19 |
| LOX/LH₂ | 6.00 | 200 | 3602 | 13.62 | 1.147 |

The LOX/LH₂ row is the CEA-verified reference case from module 04 §3.9 and is
included so that you can price the hydrogen option honestly rather than
dismissing it with a sentence.

Transport properties for Bartz, chamber stagnation, both hydrocarbons [A]:
$\mu_0 = 1.0\times10^{-4}$ Pa·s, $c_{p0} = 2500$ J/(kg·K), $Pr_0 = 0.52$.

**A-G4 — Production rate.** Twenty flights a year at N first-stage engines
plus one second-stage engine per flight, with each booster engine flying ten
times before overhaul, gives a *build* rate far below the flight rate but a
*touch* rate equal to it. A1.13's "160 engines/year equivalent" means:
**engine-equivalent units passing through acceptance test per year, new build
plus post-flight requalification.** State how your architecture splits that
number and whether your acceptance stand can absorb it. Test-stand throughput
is a real constraint and it has ended programmes.

**A-G5 — Refurbishment index.** Define, for each candidate, a
**Refurbishment Index (RI)** = (labour-hours per engine per flight)/(labour-
hours for the datum candidate), estimated from the operations your
architecture requires between flights: borescope, seal replacement, turbine
inspection, coating inspection, injector cleaning, actuator replacement,
igniter replacement. You are estimating, not measuring; show the operations
list that produced the number. Reuse-adjusted cost is
$\mathrm{UCI}/N_{flights} + \mathrm{RI}\times k_{ops}$ with $k_{ops}$ stated.

**A-G6 — Second-stage variant.** Assume the second-stage engine is the same
power head with a high-area-ratio nozzle. State the area ratio, the resulting
vacuum $I_{sp}$, and whether the cycle can be restarted in vacuum without a
consumable (TEA-TEB has a restart-count limit; a torch igniter does not, but
it needs its own supply).

**A-G7 — Reuse means cyclic life.** For every candidate, the thermal-fatigue
life of the chamber liner is the reuse limiter, not the turbomachinery. You
are not asked to compute cycles to failure. You **are** asked to compute the
throat heat flux and the constrained-wall thermal stress at your chosen wall
thickness, compare it to the material allowable at temperature, and state in
one paragraph what the comparison implies for A1.9 and A1.10. This is the
deliverable that separates an A from a B on this mission.

## Candidate architectures — evaluate at least four of these five

You may substitute or add candidates. You may not evaluate fewer than four,
and two candidates that differ only in chamber pressure count as one.

### A1 — LOX/RP-1, gas generator, $p_c = 100$ bar
The Merlin-class answer [Merlin 1D figures in the database are company claims
and must be labelled]. Simple, well-understood, dense. Open cycle, so the
turbine exhaust is dumped and $I_{sp}$ pays for it. Kerosene coking in the
cooling channels is the reuse question; RP-1 leaves deposits and the channels
are the part you cannot inspect.

### A2 — LOX/CH₄, gas generator, $p_c = 100$ bar
The same cycle with a cleaner coolant. Methane does not coke, which changes
the refurbishment story. Lower bulk density, so bigger tanks. Cryogenic
handling on both sides, so the ground system is different and the boil-off
during a 21-day turnaround is a real number.

### A3 — LOX/CH₄, oxidizer-rich staged combustion, $p_c = 180$ bar
The BE-4-class answer [BE-4 figures in the database are partly company claims].
Closed cycle, so no dumped flow and a real $I_{sp}$ gain. Higher chamber
pressure buys $C_F$ and a smaller engine, and costs heat flux. The
oxidizer-rich hot-gas path is the whole risk: everything downstream of the
preburner sees hot oxygen-rich gas, and the enabling technology is the
protective coating on every wetted metal surface — the single item the West
could not copy from the RD-253 lineage for thirty years [SB].

### A4 — LOX/CH₄, full-flow staged combustion, $p_c = 280$ bar
The Raptor-class answer, **and every Raptor number in the database is a
SpaceX claim, several traceable to social-media posts; the database says so
explicitly and you must repeat the caveat wherever you use one.** Both
preburners feed the main chamber, no dumped flow, both turbines run cool
relative to their power, and the pumps are mechanically independent. It is
also two preburners, two turbopumps, a fuel-rich *and* an oxidizer-rich hot-gas
system, and the highest throat heat flux of any candidate here.

### A5 — LOX/CH₄, electric-pump-fed, $p_c = 60$ bar
The Rutherford-class answer, scaled up by a factor a great deal larger than
Rutherford. No turbine, no preburner, no gas generator; the cycle is a battery
and two motors. Throttling and restart become trivial. The battery is
propulsion-system mass, it is consumed on the way up, and its specific energy
sets the whole architecture. **Do the battery mass calculation before you form
an opinion about this candidate**; it is the candidate most often dismissed
without arithmetic and the one whose arithmetic is most decisive.

## Mission A extra criteria for the Pugh matrix

In addition to the seven mandatory criteria, Mission A requires:

- **Reusability / cyclic life** — weight it against A1.9, A1.10, A1.11.
- **Schedule confidence to first flight** — against A1.14.
- **Second-stage derivability** — against A1.15.

## Mission A required figures beyond F1–F3

- **F-A1**: engine-out thrust profile — total vehicle thrust vs time for the
  nominal case and for an engine loss at T+0 and at T+25 s, with the T/W
  floor marked.
- **F-A2**: the reuse-adjusted cost curve — cost per flight vs flights per
  booster, for all candidates, showing where the curves cross.

## Mission A questions your memo must answer explicitly

1. How many engines, and what derived the number? (Not "nine, like everyone
   else". A1.4 and A1.5 together determine a minimum; show it.)
2. Where does your architecture sit on the $p_c$ / heat-flux / life curve, and
   what evidence would move it?
3. What is the first test that could kill this architecture, and when in the
   48 months does it happen?

---
---

# Mission B — Mars orbit insertion and landing stage for a 1,200 kg lander

**Estimated 18–22 h.** Draws hardest on modules 03, 05, 06, 07, 08, 09, 14,
16, 32, 33, 34, and Part IV for the attitude-control interaction.

## Mission statement

The **KESTREL** mission (fictional) delivers a **1,200 kg** science lander to
the Martian surface. A commercial launch places the stack on a Type-I
trans-Mars trajectory. After a **nine-month cruise** the propulsion stage must
perform Mars orbit insertion, loiter, deorbit, and then — after aeroshell
entry and heatshield jettison — the powered descent and soft landing.

The payload includes an instrument that searches for **organic molecules in
regolith samples taken from beneath the lander**. Plume-deposited propellant
species and plume-excavated debris are therefore a science-return issue, not
a housekeeping one. Contamination is a scored criterion in this trade and it
has flown as a real constraint on real missions.

There is one vehicle, one launch window, and no second attempt. Every
propulsion event between launch and touchdown is single-string in the sense
that matters: if it does not happen, the mission ends.

## Hard requirements

| # | requirement | value |
|---|---|---|
| B1.1 | Landed mass at touchdown (lander, dry, excluding descent residuals) | **≥ 1,200 kg** |
| B1.2 | Δv, Mars orbit insertion | **1,050 m/s** |
| B1.3 | Δv, trajectory correction manoeuvres and orbit trim | **100 m/s** total |
| B1.4 | Δv, deorbit burn | **90 m/s** |
| B1.5 | Δv, powered descent, hazard avoidance and terminal divert, from heatshield jettison to touchdown | **620 m/s** |
| B1.6 | Propellant performance reserve on the total | **≥ 5 %** |
| B1.7 | Storage without loss of capability, launch to touchdown | **≥ 9 months** |
| B1.8 | Restarts after first ignition | **≥ 8**, of which ≥ 1 after a 90-day coast |
| B1.9 | Terminal descent throttle range, continuous, closed-loop, stable | **≥ 4:1** |
| B1.10 | Thrust-to-weight at start of powered descent (Mars, $g = 3.721$ m/s²) | **≥ 2.2** |
| B1.11 | Hover authority at touchdown mass | must be demonstrable with one engine failed if the architecture is multi-engine |
| B1.12 | Nozzle exit diameter, any engine that fires below 30 m altitude | **≤ 500 mm** (ground clearance and plume-surface interaction) |
| B1.13 | Propulsion system dry mass (engines, feed, tanks, pressurant, valves, lines, mounts, thermal) | **≤ 340 kg** |
| B1.14 | Stack wet mass at Mars arrival | **≤ 3,200 kg** |
| B1.15 | Non-operating temperature range during cruise | **−30 °C to +50 °C**, with a cruise heater power allocation of **≤ 25 W orbit-average** |
| B1.16 | Organic contamination deposited within the sampling footprint | to be minimised and **quantified relative to a stated datum architecture** |
| B1.17 | Aeroshell and backshell mass jettisoned before powered descent | **550 kg** |

## Ground rules and assumptions specific to Mission B

**B-G1 — Mass chain.** Work backwards from touchdown. The jettisoned aeroshell
and backshell (B1.17) leave the stack between the deorbit burn and powered
descent; the mass chain therefore has three legs and the middle one carries
mass the last one does not. Getting the jettison event on the wrong side of a
leg is the most common Mission B error and it moves the answer by tens of
kilograms.

**B-G2 — Finite burn.** MOI is a large burn at periapsis. State the burn time
your thrust level implies and add a **finite-burn (gravity) loss** to B1.2 if
the burn exceeds about 5 % of the orbital period at periapsis, or argue
quantitatively why you need not. A 1,050 m/s insertion executed at 2 m/s²
takes nine minutes and the loss is not zero.

**B-G3 — Chamber state table [A].**

| pair | $r$ (O/F) | $p_c$ (bar) | $T_0$ (K) | $\mathcal{M}$ | $\gamma$ | notes |
|---|---|---|---|---|---|---|
| MON-3 / MMH | 1.65 | 10 | 3120 | 21.2 | 1.24 | hypergolic bipropellant, pressure-fed |
| MON-3 / MMH | 1.65 | 20 | 3160 | 21.4 | 1.24 | pump-fed or high-pressure blowdown |
| N₂H₄ monopropellant (Shell 405 class) | — | 10 | 1150 | 12.9 | 1.32 | quote delivered $I_{sp} \approx 232$ s at $\varepsilon = 100$ [E] |
| LMP-103S class green monopropellant | — | 20 | 1900 | 20.5 | 1.25 | quote delivered $I_{sp} \approx 253$ s at $\varepsilon = 100$ [E] |
| LOX / CH₄ | 3.20 | 40 | 3450 | 20.0 | 1.16 | pump-fed cryogenic |
| N₂O / HTPB hybrid | — | 25 | 3200 | 24.5 | 1.19 | self-pressurising, $\eta_{c^*}$ notably lower |

Densities [SB, module 05]: MMH 874, MON-3 1443, N₂H₄ 1004, LMP-103S 1240,
LOX 1141, LCH₄ 423 (at typical tanked condition), HTPB fuel grain ~930,
N₂O liquid ~745 kg/m³ at 20 °C.

**B-G4 — Storage.** Nine months. For each candidate state, with a number
where one exists: propellant vapour pressure at the hot and cold limits of
B1.15; material compatibility of the tank, bladder or diaphragm, and seals
with the propellant over that duration; the freezing point and the heater
energy to stay above it; and — for cryogenics — the boil-off, the insulation
mass and whether the architecture needs an active cooler. MMH freezes at
−52 °C and N₂O₄/MON freezes near −11 °C; the MON-3 additive exists partly to
address this and the tank-heater budget is set by the oxidizer, not the fuel
[SB, Clark].

**B-G5 — Restarts and ignition.** For each candidate say what ignites it, how
many times, and what the consumable is. A hypergolic pair has no ignition
consumable and that is most of its argument. A spark torch has no consumable
but needs power and a supply; a pyrotechnic or TEA-TEB cartridge has a hard
count. State the count against B1.8.

**B-G6 — Contamination datum.** Score B1.16 against the **MON-3/MMH
pressure-fed** case as datum, on three axes stated qualitatively but argued
mechanistically: (i) unburned or partially burned fuel species in the plume
under deep throttling and during start and shutdown transients, (ii) the
condensable and organic content of the exhaust, (iii) plume-surface
interaction — dynamic pressure at the surface at touchdown as a function of
nozzle exit diameter, exit pressure and hover altitude, which drives both
regolith excavation and re-deposition on the sampling site. You are not asked
for a CFD plume model. You **are** asked for the scaling argument and a
ranking with the physics behind it.

**B-G7 — Throttling.** Deep throttling degrades $\eta_{c^*}$ as injector
pressure drop falls with the square of flow. State the $\eta_{c^*}$ you assume
at minimum throttle and justify it. The LMDE is the canonical worked example:
a variable-area pintle holding injection velocity roughly constant across a
10:1 throttle range, with a 10:1 chamber-pressure turndown, and an operating
band that was *prohibited* between 60 % and 100 % because of nozzle erosion
[LMDE entry, database — this detail is frequently omitted and you should not
omit it].

**B-G8 — Attitude control.** Whatever you choose, the stage needs three-axis
control during the burns and during the coasts. State whether ACS is
integrated (shares propellant with the main system) or separate, and put its
propellant in the budget. A separate cold-gas or monopropellant ACS is a
second propellant, second set of tanks and second set of failure modes; an
integrated one couples the main-system failure modes to attitude control.

## Candidate architectures — evaluate at least four of these five

### B1 — MON-3/MMH pressure-fed, single throttleable pintle engine
One engine does everything: TCMs, MOI, deorbit, descent, landing. Regulated
helium. The LMDE architecture, sixty years on. Fewest parts of any bipropellant
option; one engine is also one single-point failure, and B1.12 will fight the
area ratio that MOI wants.

### B2 — MON-3/MMH pressure-fed, split: fixed high-$\varepsilon$ MOI engine + throttleable low-$\varepsilon$ landing cluster
Two engine types, one propellant system. The MOI engine gets the area ratio it
wants because it never fires near the ground; the landing engines get the exit
diameter B1.12 demands and the redundancy B1.11 demands. Costs a second
qualification and some propellant.

### B3 — Hydrazine monopropellant, throughout
One propellant, one tank set, catalyst-bed ignition, no mixture ratio to
control, no ox/fuel compatibility problem, decades of flight heritage. The
$I_{sp}$ is the entire question. **Size it before you argue about it**; this
is the candidate the arithmetic decides.

### B4 — LOX/CH₄ pump-fed
Highest $I_{sp}$ by a wide margin, non-toxic, and the exhaust contains no
nitrogen-bearing or hydrazine-derived species — which is the contamination
argument. Against it: nine months of cryogenic storage, boil-off, insulation
mass, a turbopump that must start after a 90-day cold soak, and the fact that
no such stage has flown to Mars.

### B5 — LMP-103S-class green monopropellant, throughout
Reduced handling hazard, higher density-impulse than hydrazine, flight
heritage at small scale. Higher combustion temperature means a harder
catalyst-bed and thruster-materials problem, and the throttle range of a
monopropellant thruster is not the throttle range of a bipropellant engine.
Check B1.9 carefully.

*(A hybrid N₂O/HTPB option is offered in the chamber-state table for anyone
who wants a sixth candidate. It is not required and it does not close easily;
if you evaluate it, say honestly why.)*

## Mission B extra criteria for the Pugh matrix

- **Contamination and science compatibility** — against B1.16.
- **Storage and dormancy robustness** — against B1.7 and B1.15.
- **Landing controllability** — against B1.9, B1.10, B1.11 and B1.12 together.

## Mission B required figures beyond F1–F3

- **F-B1**: the mass chain as a waterfall — arrival wet mass down to touchdown
  mass, every propellant leg and the jettison event shown.
- **F-B2**: throttle map — thrust vs commanded level for the recommended
  architecture, with hover thrust at touchdown mass, the T/W ≥ 2.2 point at
  descent start, and the minimum stable throttle marked.

## Mission B questions your memo must answer explicitly

1. Which requirement is actually binding — B1.13 (dry mass), B1.14 (arrival
   wet mass) or B1.12 (exit diameter)? Show the number.
2. What is the cost, in kilograms of landed payload, of the contamination
   criterion? If it is zero, say so; if it is 40 kg, the science team needs to
   know that before they weight it.
3. If the launch slips one window (26 months), what in your architecture has
   to be requalified or replaced?

---
---

# Mission C — A sounding-rocket-class solid or hybrid motor

**Estimated 15–20 h.** Draws hardest on modules 19, 20, 21, 22, 23, 24, 25,
32, 33.

**Read the scope boundary at the top of this file before you start.** This
mission is at the level of public engineering requirements and generic
architecture. Keep your answer there.

## Mission statement

A national research agency (fictional) procures a **single-stage sounding
rocket motor** for atmospheric and microgravity research. The motor is
delivered as a sealed, ready-to-use unit, stored at field sites in unheated
magazines, and fired from rail launchers at sites ranging from tropical
coastal to high-latitude winter. Payloads are 30–60 kg of instrumentation
above a 260 mm-diameter interstage.

The agency is buying **60 motors a year for at least ten years**, and has said
plainly that unit cost and the ability to hold that rate matter as much as
performance. It has also said that a motor which cannot be certified for
storage and transport as delivered is not a candidate, whatever its impulse.

You are selecting the motor architecture: propellant family, grain concept,
case material, nozzle materials, and the production route.

## Hard requirements

| # | requirement | value |
|---|---|---|
| C1.1 | Total impulse, vacuum | **≥ 155 kN·s** |
| C1.2 | Action time (web burn) at +21 °C | **7.0–9.0 s** |
| C1.3 | Thrust-time shape | neutral to slightly progressive; **max/mean thrust ≤ 1.30** across the conditioned temperature range |
| C1.4 | Peak vehicle axial acceleration, all temperatures, with a 45 kg payload | **≤ 15 g** |
| C1.5 | Motor outside diameter | **≤ 280 mm** |
| C1.6 | Motor overall length, aft closure to forward attachment | **≤ 1,200 mm** |
| C1.7 | Propellant mass fraction, $m_p/m_{motor}$ | **≥ 0.85** |
| C1.8 | Conditioned firing temperature range | **−40 °C to +60 °C** |
| C1.9 | Storage temperature range, non-operating | **−54 °C to +71 °C** |
| C1.10 | Storage life, sealed, without requalification | **≥ 10 years** |
| C1.11 | Transport classification | must be certifiable as a **Class 1.3** article as delivered |
| C1.12 | Ignition delay, command to 90 % $p_c$, all temperatures | **≤ 250 ms** |
| C1.13 | Thrust vector misalignment | **≤ 0.25°** |
| C1.14 | Production rate | **≥ 60 units/year sustained**, single production line |
| C1.15 | Unit cost | to be minimised; UCI is a scored criterion |
| C1.16 | Handling | no propellant conditioning, no oxidizer loading, and no pressurised system at the launch site (this requirement is what makes the hybrid a genuinely hard sell — say why, do not just assert it) |

## Ground rules and assumptions specific to Mission C

**C-G1 — Ballistic properties [A], generic class values.**

| propellant class | $\rho_p$ (kg/m³) | $c^*$ ideal (m/s) | $\eta_{c^*}$ | $n$ | $r$ at 7 MPa (mm/s) | $\sigma_p$ (K⁻¹) |
|---|---|---|---|---|---|---|
| aluminized composite, AP/HTPB/Al class | 1770 | 1550 | 0.95 | 0.35 | 8.0 | 0.0020 |
| reduced-smoke composite, AP/HTPB, no metal | 1720 | 1500 | 0.96 | 0.30 | 7.0 | 0.0018 |
| minimum-smoke composite class | 1680 | 1490 | 0.96 | 0.28 | 5.5 | 0.0025 |
| HTPB fuel grain with N₂O (hybrid) | 930 grain / 745 ox | 1560 | 0.92 | — | regression ~ $a G_{ox}^{0.6}$ [E] | — |

Chamber gas for nozzle work [A]: aluminized $\mathcal{M} = 27.5$,
$T_0 = 3300$ K, $\gamma = 1.18$; reduced-smoke $\mathcal{M} = 24.5$,
$T_0 = 2950$ K, $\gamma = 1.20$.

The aluminized $\mathcal{M}$ and $\eta_{c^*}$ both carry the condensed-phase
penalty; explain in D1 what Al₂O₃ does to each and why the CEA equilibrium
$I_{sp}$ of an aluminized propellant is optimistic in a way the hydrocarbon
liquids are not [module 04 C8].

**C-G2 — $\sigma_p$ and $\pi_K$.** Temperature sensitivity of burn rate
$\sigma_p$ is given above; convert it to the chamber-pressure sensitivity at
constant $K_n$, $\pi_K = \sigma_p/(1-n)$, and use it to produce the hot and
cold ballistic cases. **The temperature range is the hardest requirement in
this mission** and C1.3, C1.4 and the case MEOP all fall out of it. Do this
calculation early; it eliminates at least one candidate.

**C-G3 — MEOP and burst.** MEOP = hot-conditioned equilibrium $p_c$ × an
ignition-transient and dispersion factor of **1.10** [J]. Design burst
pressure = **1.5 × MEOP**. State the hydroproof pressure you would use and
what fraction of the lot gets proofed.

**C-G4 — Materials, allowables.** Use these class values [A][MMPDS for the
metals]:

| material | property | value |
|---|---|---|
| 4130 steel, heat treated | design allowable, hoop | 620 MPa |
| 15-5PH / D6AC class | design allowable, hoop | 1,100 MPa |
| T800-class carbon/epoxy, filament wound | net-section allowable, hoop | 1,400 MPa |
| S-glass/epoxy, filament wound | net-section allowable, hoop | 900 MPa |
| carbon–phenolic throat insert | erosion class | 0.05–0.15 mm/s at these conditions [E] |
| graphite (fine-grain) throat insert | erosion class | 0.10–0.25 mm/s [E] |
| EPDM/aramid insulation | ablation class | 0.15–0.30 mm/s [E] |

Densities: steel 7,850; 15-5PH 7,800; carbon/epoxy 1,600; S-glass/epoxy 2,000;
carbon–phenolic 1,450 kg/m³.

**C-G5 — Throat erosion.** Budget the throat-area growth over the action time
from the erosion class and compute what it does to $p_c$, to the thrust-time
shape and to delivered impulse. A motor that meets C1.3 at $t = 0$ and fails
it at $t = 8$ s has failed it.

**C-G6 — Igniter.** State the igniter concept (pyrogen, basket, pellet),
its mass, and how C1.12 is met at −40 °C. Cold ignition is where sounding
rocket motors actually fail, and the failure is a hangfire or a chuff, not a
bang.

**C-G7 — What C1.16 means for the hybrid.** The hybrid candidate must be
evaluated, not dismissed. But evaluate it against C1.16 honestly: a
self-pressurising N₂O system arrives at the pad either pre-loaded (in which
case it is a pressurised vessel in storage and transport, with a temperature-
dependent pressure and a known thermal-decomposition hazard) or is loaded at
the site (in which case C1.16 is violated outright). Say which and price it.

**C-G8 — Rate.** 60 units/year, single line. For a cast composite motor the
rate-limiting steps are mix-batch size, cast-and-cure cycle time and cure oven
capacity; for a filament-wound case it is mandrel count and winding time
[P120C gives the scale of the latter for a much larger motor — scale it and
say how you scaled]. Produce a takt-time argument, not an assertion.

## Candidate architectures — evaluate at least four of these five

### C1 — Aluminized AP/HTPB, case-bonded finocyl, filament-wound carbon/epoxy case
Highest $I_{sp}$ and highest density-impulse of the set. Finocyl gives the
neutral trace. Composite case gives the mass fraction. Against it: aluminized
exhaust means smoke and Al₂O₃ slag, higher throat erosion, and a case whose
NDT and damage tolerance are different problems from a metal case.

### C2 — Reduced-smoke AP/HTPB (no metal), case-bonded finocyl, filament-wound carbon/epoxy case
Gives up roughly the $I_{sp}$ the aluminium was buying, and gets back lower
throat erosion, less slag, a cleaner plume for optical payloads, and a lower
$n$ — which is worth more than it sounds across a 100 K temperature range.
Check whether it still closes on C1.1 inside C1.5 and C1.6.

### C3 — Aluminized AP/HTPB, case-bonded, **steel case**
The cheap answer. Steel is a commodity, the process is old, the NDT is
radiography and hydroproof, and nobody has to qualify a winding line. It will
struggle with C1.7 and you should find out by how much before you argue about
anything else.

### C4 — Aluminized AP/HTPB, **segmented BATES grain, cartridge-loaded**, steel or composite case
Cartridge-loaded (grain cast separately and inserted, not case-bonded) removes
the case-bond failure mode entirely and simplifies the case, at the cost of
volumetric loading, an inhibitor scheme and a thermally decoupled grain that
responds to temperature differently. It is also the architecture that makes
the grain and the case independent production lines, which is a rate argument.

### C5 — HTPB / N₂O hybrid, self-pressurising blowdown
Throttleable and shut-down-able in principle, benign propellants in isolation,
and a very different regulatory story. Against it: low regression rate forces
multi-port grains and a poor volumetric fraction, $\eta_{c^*}$ is genuinely
lower, $O/F$ shifts through the burn so the thrust trace and $I_{sp}$ both
drift, blowdown means falling $p_c$, and C1.16 is a direct hit. Evaluate it
properly and then say what you found.

## Mission C extra criteria for the Pugh matrix

- **Temperature-range robustness** — against C1.3, C1.4, C1.8 and MEOP
  together. This is the criterion that should carry real weight and usually
  does not.
- **Storage, transport and certification** — against C1.9, C1.10, C1.11.
- **Rate and production risk** — against C1.14.

## Mission C required figures beyond F1–F3

- **F-C1**: the ballistic envelope — $p_c$ vs time at −40 °C, +21 °C and
  +60 °C on one set of axes, with MEOP marked, for the recommended
  architecture.
- **F-C2**: grain cross-section and burn-area-vs-web sketch for the
  recommended grain concept. Hand-drawn is fine; label the sliver.

## Mission C questions your memo must answer explicitly

1. What is $K_n$ at ignition and at burnout, and what did the grain concept
   have to do to keep the trace inside C1.3 across the full temperature range?
2. What does the mass fraction requirement C1.7 cost, and which candidate does
   it eliminate?
3. At 60 units a year for ten years, which single process step is the one that
   fails first when the agency asks for 90 units in year six?

---

## Submission checklist

Tick every line before you open the key.

- [ ] Every candidate has D1, D2, D10. No exceptions.
- [ ] T1 through T10 are present and numbered.
- [ ] F1, F2, F3 and the mission-specific figures are present.
- [ ] Weights are written down, justified, and dated *before* the scores.
- [ ] The recommended architecture loses on at least two criteria and the memo
      names them with magnitudes.
- [ ] The sensitivity study has all three parts, including an input perturbation.
- [ ] Mass closure uses margined mass, and residuals appear as a line item.
- [ ] Every database figure carries its caveat; every company claim is labelled.
- [ ] Every arithmetic step is reproducible with `tools/rocket.py`.
- [ ] The memo is one page.
